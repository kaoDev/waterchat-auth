import { send } from 'micro'
import { IncomingMessage, ServerResponse } from 'http'
import { isSessionValid } from '../logic/SessionFunctions'

const httpOK = (res: ServerResponse) => {
  send(res, 200)
}

const httpUnauthorized = (res: ServerResponse) => {
  send(res, 401)
}

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    console.log(req.headers)

    const sessionId: string | undefined =
      req.headers['sessionId'] ||
      req.headers['sessionid'] ||
      req.headers['session-id']
    console.log('session validation request', sessionId)

    if (await isSessionValid(sessionId)) {
      console.log('session is valid')
      httpOK(res)
    } else {
      console.log('session is invalid')
      httpUnauthorized(res)
    }
  } catch (err) {
    console.error('isSessionValid', 'SOMETHING WENT WRONG', err)
    httpUnauthorized(res)
  }
}
