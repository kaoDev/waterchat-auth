import { send } from 'micro';
import * as uuid from 'uuid';
import * as redirect from 'micro-redirect';
import { IncomingMessage, ServerResponse } from 'http';
import { getRedirectUrl, userHasValidCookie } from '../../authentication/github';
import * as url from 'url';
import * as querystring from 'querystring';

const sessions: { [id: string]: string } = {};

export const getAuthSessions = () => {
    return sessions;
};

export const insertNewSessionIdWithCallback = (id: string, callback: string) => {
    sessions[id] = callback;
};

export const removeAuthSession = (id: string) => {
    delete sessions[id];
};

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === undefined) {
        return send(res, 403);
    }

    const { query } = url.parse(req.url);

    const callback: string = querystring.parse(query).callback || 'http://office.cap3.de:57580/auth/protected';

    console.log('auth request with callback', callback);

    const validationResult = await userHasValidCookie(req, res);
    if (validationResult === false) {
        try {
            const state = uuid.v4();
            const redirectUrl = await getRedirectUrl(state);
            insertNewSessionIdWithCallback(state, callback);
            return redirect(res, 302, redirectUrl);
        } catch (err) {
            return send(res, 403);
        }
    } else {
        return redirect(res, 302, callback);
    }

};
