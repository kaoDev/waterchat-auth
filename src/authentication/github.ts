import { loadCredentials } from './credentials';
import { IncomingMessage, ServerResponse } from 'http';
import * as redirect from 'micro-redirect';
import { getSession } from '../logic/SessionFunctions';
import { userState } from '../persistence/eventStore';
import * as rp from 'request-promise';
import { isBefore } from 'date-fns';

export const getRedirectUrl = async (state: string) => {
    const { clientId, callbackUrl, scope } = await loadCredentials({ provider: 'github' });
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}&state=${state}`;
};

const postJson = (url: string, data: object) => {
    return rp({
        method: 'POST',
        uri: url,
        json: true,
        body: data
    });
};

export type GitHubLoginResult = {
    error: string
    access_token: undefined
} | {
        error: undefined,
        access_token: string
    };

export const githubLogin = async (code: string) => {
    console.log('githubLogin');
    const { clientId, clientSecret } = await loadCredentials({ provider: 'github' });
    const response = await postJson('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code
    });

    return response as GitHubLoginResult;
};

export const getUserInfo = async (accessToken: string) => {
    console.log('github getUserInfo')
    return rp({
        method: 'GET',
        uri: 'https://api.github.com/user',
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
    console.log('github validate token');
    const { clientId, clientSecret } = await loadCredentials({ provider: 'github' });
    try {
        const response = await fetch(`https://api.github.com/applications/${clientId}/tokens/${accessToken}`, {
            method: 'GET',
            headers: {
                'User-Agent': clientId,
                Authorization: `Basic ${new Buffer(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        });

        const validationResult: ValidationResult | NotFoundMessage | undefined = await response.json().catch(e => console.error(e));

        if (validationResult === undefined || (validationResult as NotFoundMessage).message) {
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

export const userHasValidSession = async (req: IncomingMessage, res: ServerResponse) => {
    const userAggregateState = await userState.take(1).toPromise();
    const session = getSession(req, res, userAggregateState);

    return session !== undefined && isBefore(new Date(), session.dueDate);
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

            if (userHasValidSession(req, res)) {
                return handler(req, res, {});
            }

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
