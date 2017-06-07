import { send } from 'micro'
import { IncomingMessage, ServerResponse } from 'http'
import { userState } from '../../persistence/eventStore'
import { displayUser } from '../../model/User'

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const userId = (req as any).params.id as string

    const user = await userState
      .take(1)
      .flatMap(s => s.users)
      .find(u => u.userId === userId)
      .toPromise()

    if (user !== undefined) {
      send(res, 200, displayUser(user))
    } else {
      send(res, 404)
    }
  } catch (err) {
    console.error('isSessionValid', 'SOMETHING WENT WRONG', err)
    send(res, 500)
  }
}
