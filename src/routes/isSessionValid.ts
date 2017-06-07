import { send, json } from 'micro'
import { IncomingMessage, ServerResponse } from 'http'
import { isSessionValid } from '../logic/SessionFunctions'

type ValidateSessionPayload = {
  sessionId: string | undefined
}

const httpOK = (res: ServerResponse) => {
  send(res, 200)
}

const httpUnauthorized = (res: ServerResponse) => {
  send(res, 401)
}

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { sessionId } = (await json(req)) as ValidateSessionPayload

    if (isSessionValid(sessionId)) {
      httpOK(res)
    } else {
      httpUnauthorized(res)
    }
  } catch (err) {
    console.error('isSessionValid', 'SOMETHING WENT WRONG', err)
    httpUnauthorized(res)
  }
}
