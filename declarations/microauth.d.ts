import { IncomingMessage, ServerResponse } from 'http';

export type OAuthResult = {
    result: {
        provider: string,
        info: any,
        accessToken: string,
        accessTokenSecret: string
    }
}
export type OAuthError = {
    err: Error, provider: string
}

export type AuthenticationRequestHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    args?: OAuthResult | OAuthError
) => Promise<any>;

export type TwitterParams = {
    consumerKey: string,
    consumerSecret: string,
    callbackUrl: string,
    path?: string
}

export type SlackParams = {
    clientId: string,
    clientSecret: string,
    callbackUrl: string,
    path?: string,
    scope?: string
}

export type GitHubAuthenticationRequestHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    args?: GitHubOauthUnScopedResult | OAuthError
) => Promise<any>;

export type GitHubOauthUnScopedResult = {
    login: string,
    id: number,
    avatar_url: string,
    gravatar_id: string,
    url: string,
    html_url: string,
    followers_url: string,
    following_url: string,
    gists_url: string,
    starred_url: string,
    subscriptions_url: string,
    organizations_url: string,
    repos_url: string,
    events_url: string,
    received_events_url: string,
    type: string,
    site_admin: boolean,
    name: string,
    company: string,
    blog: string,
    location: string,
    email: string,
    hireable: any,
    bio: any,
    public_repos: number,
    public_gists: number,
    followers: number,
    following: number,
    created_at: string,
    updated_at: string
};

export type GithubParams = SlackParams;

export type FaceBookParams = {
    appId: string,
    appSecret: string,
    callbackUrl: string,
    path?: string,
    fields?: string
}
