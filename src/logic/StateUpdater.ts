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
import { User, OAuthRaw, UserDisplayName, ProfilePicture } from '../model/User'
import { TwitterOAuthUser } from '../authentication/twitter'
import { addMonths, format } from 'date-fns'
import { GitHubOauthUnScopedResult } from 'microauth'

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

type UserDisplayData = (UserDisplayName & ProfilePicture)

const createUserFromRawData = (data: OAuthRaw): UserDisplayData => {
  if ((data.rawInfo as TwitterOAuthUser).provider === 'twitter') {
    const twitterData = data.rawInfo as TwitterOAuthUser
    return {
      displayName: `@${twitterData.info.screen_name}`,
      profilePicture:
        twitterData.info.profile_image_url_https ||
          twitterData.info.profile_image_url,
    }
  } else {
    const gitHubData = data.rawInfo as GitHubOauthUnScopedResult
    return {
      displayName: gitHubData.name || gitHubData.login,
      profilePicture: gitHubData.avatar_url,
    }
  }
}

const createStateWithNewUser = ({
  users: oldUsers,
  sessions: oldSessions,
  ...rest,
}: State) => ({
  type,
  rawInfo,
  userId,
  identifiers,
  displayName,
  sessionId,
}: UserRegistered): State => {
  const user: User = {
    userId,
    identifiers,
    ...createUserFromRawData({ rawInfo }),
  }

  const sessions: { [sessionId: string]: Session } = {
    ...oldSessions,
  }

  sessions[sessionId] = Object.freeze({
    dueDate: format(addMonths(new Date(), 3)),
    user: user,
    id: sessionId,
  })

  const users = oldUsers.concat(user)

  return Object.freeze({
    ...rest,
    users,
    sessions,
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
        i => i.provider === provider
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
    const { displayName, profilePicture } = createUserFromRawData({ rawInfo })

    const newUserData = {
      ...loggedInUser,
      displayName,
      profilePicture,
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
  event: UserEvent
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
