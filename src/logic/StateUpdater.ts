import {
  UserEvent,
  UserRegistered,
  UserProfileChanged,
  UserLoggedOut,
  UserTokenValidated,
  UserLoggedIn,
  USER_LOGGED_OUT,
  USER_PROFILE_CHANGED,
  USER_REGISTERED,
  USER_TOKEN_VALIDATED,
  USER_LOGGED_IN,
} from '../events/UserEvents'
import { State } from '../model/State'
import { Session } from '../model/Session'
import { addMonths, format } from 'date-fns'

export const initialState: State = Object.freeze({
  users: [],
  sessions: {},
})

const createStateWithChangedProfile = ({
  users: oldUsers,
  ...rest,
}: State) => ({ userId, displayName }: UserProfileChanged): State => {
  const users = oldUsers.map(user => {
    if (user.userId === userId) {
      return Object.freeze({
        ...user,
        displayName,
      })
    } else {
      return user
    }
  })

  return Object.freeze({
    ...rest,
    users,
  })
}

const createStateWithUserLoggedOut = ({
  sessions: oldSessions,
  ...rest,
}: State) => ({ sessionId }: UserLoggedOut): State => {
  const sessions = { ...oldSessions }
  delete sessions[sessionId]

  return Object.freeze({
    ...rest,
    sessions,
  })
}

const createStateWithNewUser = ({ users: oldUsers, ...rest }: State) => ({
  type,
  rawInfo,
  ...userData,
}: UserRegistered): State => {
  const users = oldUsers.concat(userData)

  return Object.freeze({
    ...rest,
    users,
  })
}

const createStateWithUpdatedValidationUser = ({
  users: oldUsers,
  ...rest,
}: State) => ({
  type,
  provider,
  token: accessToken,
  id,
  ...userData,
}: UserTokenValidated): State => {
  const users = oldUsers.map(u => {
    if (u.userId === userData.userId) {
      const oldIdentifierIndex = u.identifiers.findIndex(
        i => i.provider === provider,
      )
      const unchangedIdentifiers = u.identifiers.splice(oldIdentifierIndex, 1)

      return {
        ...u,
        identifiers: [
          ...unchangedIdentifiers,
          {
            provider,
            accessToken,
            id,
            timestamp: Date.now(),
          },
        ],
      }
    } else {
      return u
    }
  })

  return Object.freeze({
    ...rest,
    users,
  })
}

const createStateWithLoggedInUser = ({
  users: oldUsers,
  sessions: oldSessions,
  ...rest,
}: State) => ({
  type,
  rawInfo,
  identifiers,
  sessionId,
  ...userData,
}: UserLoggedIn): State => {
  const loggedInUser = oldUsers.find(u => u.userId === userData.userId)

  if (loggedInUser) {
    const newUserData = {
      ...loggedInUser,
      identifiers: [...loggedInUser.identifiers, ...identifiers],
    }

    const sessions: { [sessionId: string]: Session } = {
      ...oldSessions,
    }

    sessions[sessionId] = Object.freeze({
      dueDate: format(addMonths(new Date(), 3)),
      user: newUserData,
      id: sessionId,
    })

    const users = oldUsers.map(u => {
      if (u.userId === userData.userId) {
        return newUserData
      } else {
        return u
      }
    })

    return Object.freeze({
      ...rest,
      sessions,
      users,
    })
  } else {
    return Object.freeze({
      ...rest,
      sessions: oldSessions,
      users: oldUsers,
    })
  }
}

export const updateUserState = (state: State = initialState) => (
  event: UserEvent,
): State => {
  switch (event.type) {
    case USER_REGISTERED:
      return createStateWithNewUser(state)(event)
    case USER_PROFILE_CHANGED:
      return createStateWithChangedProfile(state)(event)
    case USER_LOGGED_IN:
      return createStateWithLoggedInUser(state)(event)
    case USER_LOGGED_OUT:
      return createStateWithUserLoggedOut(state)(event)
    case USER_TOKEN_VALIDATED:
      return createStateWithUpdatedValidationUser(state)(event)
    default:
      return state
  }
}
