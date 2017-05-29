import * as rp from 'request-promise';
import { loadCredentials } from './credentials';
import { IncomingMessage, ServerResponse } from 'http';
import * as redirect from 'micro-redirect';
import { getSession } from '../logic/SessionFunctions';
import { userState } from '../persistence/eventStore';

export const getRedirectUrl = async (state: string) => {
    const { clientId, callbackUrl, scope } = await loadCredentials({ provider: 'github' });
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}&state=${state}`;
};

export const githubLogin = async (code: string) => {
    const { clientId, clientSecret } = await loadCredentials({ provider: 'github' });
    return rp({
        method: 'POST',
        url: 'https://github.com/login/oauth/access_token',
        json: true,
        body: {
            client_id: clientId,
            client_secret: clientSecret,
            code
        }
    });
};

export const getUserInfo = (accessToken: string) => {
    return rp({
        method: 'GET',
        url: 'https://api.github.com/user',
        headers: {
            Authorization: `token ${accessToken}`,
            'User-Agent': 'Microauth-Github'
        },
        json: true
    });
};

export type ValidationResult = {
    id: number,
    url: string,
    app: {
        name: string,
        url: string,
        client_id: string
    },
    token: string,
    hashed_token: string,
    token_last_eight: string,
    note: null,
    note_url: null,
    created_at: string,
    updated_at: string,
    scopes: string[],
    fingerprint: null,
    user: {
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
        site_admin: boolean
    }
};

type NotFoundMessage = {
    message: 'Not Found',
    documentation_url: 'https://developer.github.com/v3'
};

export const validateToken = async (accessToken: string): Promise<ValidationResult | false> => {
    const { clientId, clientSecret } = await loadCredentials({ provider: 'github' });
    try {
        const validationResult: ValidationResult | NotFoundMessage = await rp({
            method: 'GET',
            url: `https://api.github.com/applications/${clientId}/tokens/${accessToken}`,
            json: true,
            headers: {
                'User-Agent': clientId,
                Authorization: `Basic ${new Buffer(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        });

        if ((validationResult as NotFoundMessage).message) {
            return false;
        }

        return validationResult as ValidationResult;
    } catch (e) {
        return false;
    }
};

export const extractGitHubIdentifier = async (req: IncomingMessage, res: ServerResponse) => {
    const userAggregateState = await userState.take(1).toPromise();
    const session = getSession(req, res, userAggregateState);

    if (session !== undefined) {
        return session.user.identifiers.find(identifier => identifier.provider === 'github');
    }
};

export const userHasValidCookie = async (req: IncomingMessage, res: ServerResponse) => {
    const githubIdentifier = await extractGitHubIdentifier(req, res);
    if (githubIdentifier !== undefined) {
        return await validateToken(githubIdentifier.accessToken);
    }

    return false;
};

type ValidationProvider = (provider: string) => ((accessToken: string) => Promise<ValidationResult | false>) | undefined;

export const authenticateRequest = (
    loginRedirect: string,
    validationProvider: ValidationProvider,
    eventInterceptor: (data: ValidationResult) => void
) =>
    (handler: (req: IncomingMessage, res: ServerResponse, context: object) => any) =>
        async (req: IncomingMessage, res: ServerResponse) => {

            const githubIdentifier = await extractGitHubIdentifier(req, res);
            if (githubIdentifier !== undefined) {
                const validator = validationProvider(githubIdentifier.provider);
                if (validator) {
                    const validationResult = await validator(githubIdentifier.accessToken);
                    if (validationResult) {
                        eventInterceptor(validationResult);
                        return handler(req, res, validationResult);
                    }
                }
            }

            return redirect(res, 302, loginRedirect);
        };
