import { send } from 'micro'
import * as redirect from 'micro-redirect'
import { IncomingMessage, ServerResponse } from 'http'
import * as url from 'url'
import * as querystring from 'querystring'
import { getConsumer, getRedirectUrl } from '../../authentication/twitter'

const sessions: {
  [id: string]: {
    requestToken: string
    requestTokenSecret: string
    callback: string
  }
} = {}

export const getAuthSessions = () => {
  return sessions
}

export const insertNewSessionIdWithCallback = (
  id: string,
  requestToken: string,
  requestTokenSecret: string,
  callback: string
) => {
  sessions[id] = { requestToken, requestTokenSecret, callback }
}

export const removeAuthSession = (id: string) => {
  delete sessions[id]
}

const getRequestToken = () => {
  return new Promise<
    { requestToken: string; requestTokenSecret: string }
  >((resolve, reject) => {
    getConsumer().getOAuthRequestToken(
      (err: any, requestToken, requestTokenSecret) => {
        console.log('got something from twitter', err, requestToken)
        if (err) {
          return reject(err)
        }

        return resolve({ requestToken, requestTokenSecret })
      }
    )
  })
}

const states = new Map()

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (req.url === undefined) {
      return send(res, 403)
    }
    const { query } = url.parse(req.url)
    const callback: string =
      querystring.parse(query).callback ||
      'http://office.cap3.de:57580/auth/protected'

    console.log('request token')

    const results = await getRequestToken()
    console.log('got twitter request token', results)

    states.set(results.requestToken, results)
    insertNewSessionIdWithCallback(
      results.requestToken,
      results.requestToken,
      results.requestTokenSecret,
      callback
    )

    const redirectLocation = getRedirectUrl(results.requestToken)
    return redirect(res, 302, redirectLocation)
  } catch (err) {
    send(res, 500, err)
  }
}
