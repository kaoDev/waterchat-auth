import { GitHubOauthUnScopedResult } from 'microauth'

export type UserId = {
  readonly userId: string
}

export type UserDisplayName = {
  readonly displayName: string
}

export type OAuthRaw = {
  readonly rawInfo: GitHubOauthUnScopedResult
}

export type GitHubUserIdentifier = {
  readonly provider: 'github'
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

export type DisplayUser = UserId & UserDisplayName

export type User = UserId & UserDisplayName & UserIdentifier
