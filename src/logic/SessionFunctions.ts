import { IncomingMessage, ServerResponse } from 'http';
import * as Cookies from 'cookies';
import { State } from '../model/State';
import { Session } from '../model/Session';
import * as uuid from 'uuid';
import { addMonths } from 'date-fns';

const SESSION_PROP_KEY = 'watersession';
export const MAX_SESSION_AGE_MONTHS = 3;

export const getSession = (req: IncomingMessage, res: ServerResponse, state: State): Session | undefined => {
    const cookies = Cookies(req, res);

    const sessionId = cookies.get(SESSION_PROP_KEY);

    if (state.sessions[sessionId] !== undefined) {
        return state.sessions[sessionId];
    } else {
        return undefined;
    }
};

/**
 * Generates a session id and sets the cookie
 * @param req incoming request
 * @param res outgoing server response
 * @param state current authentication aggregate state
 * @returns the generated session id
 */
export const generateSession = (req: IncomingMessage, res: ServerResponse, state: State) => {
    let id = '';
    do {
        id = uuid.v4();
    } while (state.sessions[id] !== undefined);

    const cookies = Cookies(req, res);

    cookies.set(SESSION_PROP_KEY, id, { expires: addMonths(new Date(), MAX_SESSION_AGE_MONTHS) });

    return id;
};
