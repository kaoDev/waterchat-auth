import { GitHubOauthUnScopedResult } from 'microauth'
import { TwitterOAuthUser } from '../authentication/twitter'

export type UserId = {
  readonly userId: string
}

export type UserDisplayName = {
  readonly displayName: string
}

export type ProfilePicture = {
  readonly profilePicture: string
}

export type OAuthRaw = {
  readonly rawInfo: GitHubOauthUnScopedResult | TwitterOAuthUser
}

export type GitHubUserIdentifier = {
  readonly provider: 'github' | 'twitter'
  readonly accessToken: string
  readonly id: number
  readonly timestamp: number
}

export type SessionId = {
  readonly sessionId: string
}

export type UserIdentifier = {
  readonly identifiers: GitHubUserIdentifier[]
}

export type DisplayUser = UserId & UserDisplayName & ProfilePicture

export type User = DisplayUser & UserIdentifier

export function displayUser({ identifiers, ...rest }: User): DisplayUser {
  return {
    ...rest,
  }
}
