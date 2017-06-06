import { send } from 'micro'
import { IncomingMessage, ServerResponse } from 'http'
import {
  GitHubOauthUnScopedResult,
  GitHubAuthenticationRequestHandler,
} from 'microauth'
import {
  initEventStoreConnection,
  dispatchUserEvent,
  userState,
} from '../../persistence/eventStore'
import * as uuid from 'uuid'
import {
  UserRegistered,
  USER_REGISTERED,
  USER_LOGGED_IN,
} from '../../events/UserEvents'
import * as url from 'url'
import * as querystring from 'querystring'
import { getAuthSessions, removeAuthSession } from './index'
import { getUserInfo, githubLogin } from '../../authentication/github'
import { generateSession } from '../../logic/SessionFunctions'
import * as redirect from 'micro-redirect'

export const GET: GitHubAuthenticationRequestHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
  auth,
) => {
  if (req.url === undefined) {
    return send(res, 403)
  }

  const { query } = url.parse(req.url)

  const { state, code } = querystring.parse(query)

  if (!getAuthSessions()[state] === undefined) {
    return send(res, 403)
  }

  const callback = getAuthSessions()[state]

  removeAuthSession(state)

  const response = await githubLogin(code)

  if (response !== undefined) {
    if (response.error !== undefined || response.access_token === undefined) {
      return send(res, 403)
    }

    const accessToken = response.access_token
    const user: GitHubOauthUnScopedResult = await getUserInfo(accessToken)
    const provider = 'github'

    const serviceState = await userState.take(1).toPromise()

    const userSessionId = generateSession(req, res, serviceState)

    const userObjectFromState = serviceState.users.find(u =>
      u.identifiers.some(i => i.provider === provider && i.id === user.id),
    )

    if (userObjectFromState !== undefined) {
      dispatchUserEvent({
        rawInfo: user,
        userId: userObjectFromState.userId,
        type: USER_LOGGED_IN,
        identifiers: [
          {
            accessToken,
            id: user.id,
            provider,
            timestamp: Date.now(),
          },
        ],
        sessionId: userSessionId,
      })
    } else {
      const userRegisteredEvent: UserRegistered = {
        userId: uuid.v4(),
        displayName: user.name,
        rawInfo: user,
        type: USER_REGISTERED,
        identifiers: [
          {
            accessToken,
            id: user.id,
            provider,
            timestamp: Date.now(),
          },
        ],
        sessionId: userSessionId,
      }

      await initEventStoreConnection()
      await dispatchUserEvent(userRegisteredEvent)
    }

    return redirect(res, 302, `${callback}?sessionId=${userSessionId}`)
  }

  send(res, 500)
}
