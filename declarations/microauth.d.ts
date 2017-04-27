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

export type GithubParams = SlackParams;

export type FaceBookParams = {
    appId: string,
    appSecret: string,
    callbackUrl: string,
    path?: string,
    fields?: string
}