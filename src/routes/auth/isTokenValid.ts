import { send, json } from 'micro';
import { IncomingMessage, ServerResponse } from 'http';
import { validateToken } from '../../authentication/github';
import { userState, dispatchUserEvent, initEventStoreConnection } from '../../persistence/eventStore';
import { GitHubUserIdentifier } from '../../model/User';
import { USER_TOKEN_VALIDATED } from '../../events/UserEvents';

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

type ValidateTokenPayload = {
    accessToken: string;
    provider: 'github';
};

const ONE_HOUR = 3600000;

const timestampValid = (timestamp: number) => {
    return (Date.now() - timestamp) < ONE_HOUR;
};

const httpOK = (res: ServerResponse) => {
    send(res, 200);
};

const httpUnauthorized = (res: ServerResponse) => {
    send(res, 401);
};

export const POST = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const { accessToken, provider } = await json(req) as ValidateTokenPayload;

        console.log(accessToken, provider);

        if (!accessToken || !provider) {
            httpUnauthorized(res);
        }
        else {
            await initEventStoreConnection();
            console.log('event store connection running');
            userState
                .take(1)
                .subscribe(async state => {
                    console.log('GOT STATE', state);
                    const user = state.users.find(u => {
                        return u.identifiers.some(i =>
                            i.accessToken === accessToken && i.provider === provider);
                    });

                    if (user === undefined) {
                        httpUnauthorized(res);
                    }
                    else {
                        const identifier = user.identifiers.find(i => i.accessToken === accessToken && i.provider === provider) as GitHubUserIdentifier;
                        if (identifier !== undefined && timestampValid(identifier.timestamp)) {
                            httpOK(res);
                        }
                        else {
                            const tokenStillValidAnswer = await validateToken(accessToken);
                            if (tokenStillValidAnswer !== false) {

                                dispatchUserEvent({
                                    ...tokenStillValidAnswer,
                                    userId: user.userId,
                                    provider: provider,
                                    type: USER_TOKEN_VALIDATED
                                });
                                httpOK(res);
                            }
                            else {
                                httpUnauthorized(res);
                            }
                        }
                    }
                });
        }
    } catch (err) {
        console.error('SOMETHING WENT WRONG', err);
        httpUnauthorized(res);
    }
};
