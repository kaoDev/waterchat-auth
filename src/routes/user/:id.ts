import { send } from 'micro'
import { IncomingMessage, ServerResponse } from 'http'
import { userState } from '../../persistence/eventStore'
import { isSessionValid } from '../../logic/SessionFunctions'
import { displayUser } from '../../model/User'

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const id = (req as any).params.id as string
    console.log('id param', id)

    if (await isSessionValid(id)) {
      console.log('is valid session')

      const user = await userState
        .take(1)
        .map(s => s.sessions[id].user)
        .toPromise()

      send(res, 200, displayUser(user))
    } else if (id !== undefined && id !== null && id.length > 0) {
      const user = await userState
        .take(1)
        .flatMap(s => s.users)
        .find(u => u.userId === id)
        .toPromise()

      if (user !== undefined) {
        console.log('is valid id')

        send(res, 200, displayUser(user))
      } else {
        send(res, 404)
      }
    }
  } catch (err) {
    console.error('isSessionValid', 'SOMETHING WENT WRONG', err)
    send(res, 500)
  }
}
