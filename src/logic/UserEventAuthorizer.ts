import {
  UserEvent,
  UserRegistered,
  UserProfileChanged,
  UserLoggedIn,
  UserLoggedOut,
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
  USER_PROFILE_CHANGED,
  USER_REGISTERED,
} from '../events/UserEvents'
import { State } from '../model/State'

const stateHasRegisteredUser = ({ users }: State) => (userId: string) =>
  users.some(({ userId: id }) => userId === id)

const authorizeUserRegisteredEvent = ({ users }: State) => ({
  userId,
  identifiers,
}: UserRegistered) =>
  users.every(({ userId: id, identifiers: oldIdentifiers }) => {
    const idsUnEqual = userId !== id

    return (
      idsUnEqual &&
      !identifiers.some(i =>
        oldIdentifiers.some(
          oldI => oldI.provider === i.provider && oldI.id === i.id,
        ),
      )
    )
  })

const authorizeUserProfileChangedEvent = (state: State) => (
  event: UserProfileChanged,
) => stateHasRegisteredUser(state)(event.userId)

const authorizeUserLoggedInEvent = (state: State) => (event: UserLoggedIn) =>
  stateHasRegisteredUser(state)(event.userId)

const authorizeUserLoggedOutEvent = (state: State) => (event: UserLoggedOut) =>
  stateHasRegisteredUser(state)(event.userId)

export const authorizeEvent = (state: State) => (event: UserEvent): boolean => {
  switch (event.type) {
    case USER_REGISTERED:
      return authorizeUserRegisteredEvent(state)(event)
    case USER_PROFILE_CHANGED:
      return authorizeUserProfileChangedEvent(state)(event)
    case USER_LOGGED_IN:
      return authorizeUserLoggedInEvent(state)(event)
    case USER_LOGGED_OUT:
      return authorizeUserLoggedOutEvent(state)(event)
    default:
      return false
  }
}
