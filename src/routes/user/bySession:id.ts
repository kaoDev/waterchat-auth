import { send } from 'micro'
import { IncomingMessage, ServerResponse } from 'http'
import { userState } from '../../persistence/eventStore'
import { isSessionValid } from '../../logic/SessionFunctions'
import { displayUser } from '../../model/User'

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const sessionId = (req as any).params.id as string

    if (isSessionValid(sessionId)) {
      const user = await userState
        .take(1)
        .map(s => s.sessions[sessionId].user)
        .toPromise()

      send(res, 200, displayUser(user))
    } else {
      send(res, 401)
    }
  } catch (err) {
    console.error('isSessionValid', 'SOMETHING WENT WRONG', err)
    send(res, 401)
  }
}
