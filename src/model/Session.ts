import { User } from './User'

export type Session = {
  readonly user: User
  readonly dueDate: string
  readonly id: string
}
