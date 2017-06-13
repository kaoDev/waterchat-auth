export class OAuth {
  constructor(
    requestUrl: string,
    accessUrl: string,
    consumerKey: string,
    consumerSecret: string,
    version: string,
    authorize_callback: string,
    signatureMethod: string,
    nonceSize?: string,
    customHeaders?: string
  )
  setClientOptions(options: any): void
  getOAuthAccessToken(
    oauth_token: string,
    oauth_token_secret: string,
    oauth_verifier: string,
    callback: (
      error: any,
      oAuthToken: string,
      oauthTokenSecret: string,
      results: any
    ) => any
  ): void
  getOAuthRequestToken(
    callback: (
      error: any,
      oAuthToken: string,
      oauthTokenSecret: string,
      results: any
    ) => any
  ): void
  get(
    url: string,
    oauth_token: string,
    oauth_token_secret: string,
    callback: (error: any, data: any, response: any) => any
  ): void
}

export class OAuthEcho {
  constructor()
}

export class OAuth2 {
  constructor()
}
