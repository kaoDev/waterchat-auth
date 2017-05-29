import { IncomingMessage, ServerResponse } from 'http';
import { getSession } from '../logic/SessionFunctions';
import { dispatchUserEvent, userState } from '../persistence/eventStore';
import { USER_LOGGED_OUT } from '../events/UserEvents';
import { send } from 'micro';

const logout = async (req: IncomingMessage, res: ServerResponse) => {
    const userStateAggregate = await userState.take(1).toPromise();
    const session = getSession(req, res, userStateAggregate);

    if (session) {
        dispatchUserEvent({
            userId: session.user.userId,
            sessionId: session.id,
            type: USER_LOGGED_OUT
        });
        send(res, 200);
    }

    send(res, 403);
};

export const GET = logout;
export const POST = logout;
