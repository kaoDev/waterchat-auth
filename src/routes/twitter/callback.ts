import { send } from 'micro'
import { IncomingMessage, ServerResponse } from 'http'
import * as uuid from 'uuid'
import {
  UserRegistered,
  USER_REGISTERED,
  USER_LOGGED_IN,
} from '../../events/UserEvents'
import * as url from 'url'
import * as querystring from 'querystring'
import { getAuthSessions, removeAuthSession } from './index'
import { generateSession } from '../../logic/SessionFunctions'
import {
  userState,
  dispatchUserEvent,
  initEventStoreConnection,
} from '../../persistence/eventStore'
import * as redirect from 'micro-redirect'
import { getConsumer, TwitterOAuthUser } from '../../authentication/twitter'

const provider = 'twitter'

const getAccessToken = (token: string, secret: string, verifier: string) => {
  return new Promise<
    { accessToken: string; accessTokenSecret: string }
  >((resolve, reject) => {
    getConsumer().getOAuthAccessToken(
      token,
      secret,
      verifier,
      (err, accessToken, accessTokenSecret) => {
        if (err) {
          return reject(err)
        }

        return resolve({ accessToken, accessTokenSecret })
      }
    )
  })
}

const verifyCredentials = (accessToken: string, accessTokenSecret: string) => {
  return new Promise<string>((resolve, reject) => {
    getConsumer().get(
      'https://api.twitter.com/1.1/account/verify_credentials.json',
      accessToken,
      accessTokenSecret,
      (err, result) => {
        if (err) {
          return reject(err)
        }

        return resolve(result)
      }
    )
  })
}

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  if (req.url === undefined) {
    return send(res, 403)
  }
  try {
    const { query } = url.parse(req.url)
    const queryObject = querystring.parse(query)
    const state = getAuthSessions()[queryObject.oauth_token]
    removeAuthSession(queryObject.oauth_token)

    const results = await getAccessToken(
      state.requestToken,
      state.requestTokenSecret,
      queryObject.oauth_verifier
    )
    const data = await verifyCredentials(
      results.accessToken,
      results.accessTokenSecret
    )
    const result = {
      provider,
      info: JSON.parse(data),
      accessToken: results.accessToken,
      accessTokenSecret: results.accessTokenSecret,
    } as TwitterOAuthUser

    const serviceState = await userState.take(1).toPromise()

    const userSessionId = generateSession(req, res, serviceState)

    const userObjectFromState = serviceState.users.find(u =>
      u.identifiers.some(
        i => i.provider === provider && i.id === result.info.id
      )
    )

    if (userObjectFromState !== undefined) {
      dispatchUserEvent({
        rawInfo: result,
        userId: userObjectFromState.userId,
        type: USER_LOGGED_IN,
        identifiers: [
          {
            accessToken: result.accessToken,
            id: result.info.id,
            provider,
            timestamp: Date.now(),
          },
        ],
        sessionId: userSessionId,
      })
    } else {
      const userRegisteredEvent: UserRegistered = {
        userId: uuid.v4(),
        displayName: `@${result.info.screen_name}`,
        rawInfo: result,
        type: USER_REGISTERED,
        identifiers: [
          {
            accessToken: result.accessToken,
            id: result.info.id,
            provider,
            timestamp: Date.now(),
          },
        ],
        sessionId: userSessionId,
      }

      await initEventStoreConnection()
      await dispatchUserEvent(userRegisteredEvent)
    }

    return redirect(res, 302, `${state.callback}?sessionId=${userSessionId}`)
  } catch (err) {
    send(res, 500, err)
  }
}
