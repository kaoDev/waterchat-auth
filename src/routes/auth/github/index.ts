import { send } from 'micro';
import * as uuid from 'uuid';
import * as redirect from 'micro-redirect';
import { IncomingMessage, ServerResponse } from 'http';
import { getRedirectUrl, userHasValidCookie } from '../../../authentication/github';

const sessions: string[] = [];

export const getSessionIds = () => {
    return sessions;
};

export const insertNewSessionId = (id: string) => {
    sessions.push(id);
};

export const removeSessionId = (id: string) => {
    sessions.splice(sessions.indexOf(id), 1);
};

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
    const validationResult = await userHasValidCookie(req, res);
    if (validationResult === false) {
        try {
            const state = uuid.v4();
            const redirectUrl = await getRedirectUrl(state);
            insertNewSessionId(state);
            return redirect(res, 302, redirectUrl);
        } catch (err) {
            return send(res, 403);
        }
    }
    else {
        return redirect(res, 302, '/protected');
    }

};
