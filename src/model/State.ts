import { User } from './User'
import { Session } from './Session'

export type State = {
  readonly users: Array<User>
  readonly sessions: { [sessionId: string]: Session }
}
