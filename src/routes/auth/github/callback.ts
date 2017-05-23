import { send } from 'micro';
import { IncomingMessage, ServerResponse } from 'http';
import { GitHubOauthUnScopedResult, GitHubAuthenticationRequestHandler } from 'microauth';
import { initEventStoreConnection, dispatchUserEvent, userState } from '../../../persistence/eventStore';
import * as uuid from 'uuid';
import { UserRegistered, USER_REGISTERED, USER_LOGGED_IN } from '../../../events/UserEvents';
import * as url from 'url';
import * as querystring from 'querystring';
import { getSessionIds, removeSessionId } from './index';
import { getUserInfo, githubLogin } from '../../../authentication/github';
import * as Cookies from 'cookies';
import * as redirect from 'micro-redirect';

export const GET: GitHubAuthenticationRequestHandler = async (req: IncomingMessage, res: ServerResponse, auth) => {
    if (req.url === undefined) {
        return send(res, 403);
    }

    const { query } = url.parse(req.url);

    const { state, code } = querystring.parse(query);
    if (!getSessionIds().includes(state)) {
        return send(res, 403);
    }

    removeSessionId(state);

    const response = await githubLogin(code);
    if (response.error) {
        return send(res, 403);
    }

    const accessToken = response.access_token;
    const user: GitHubOauthUnScopedResult = await getUserInfo(accessToken);
    const provider = 'github';

    const cookies = new Cookies(req, res);

    cookies.set('provider', provider);
    cookies.set('accessToken', accessToken);

    const userObjectFromState = await userState
        .take(1)
        .map(lastUserState => {
            return lastUserState
                .users
                .find(u => u.identifiers
                    .some(i => i.provider === provider && i.id === user.id));
        })
        .toPromise();

    if (userObjectFromState !== undefined) {
        dispatchUserEvent({
            rawInfo: user,
            userId: userObjectFromState.userId,
            type: USER_LOGGED_IN,
            identifiers: [{
                accessToken,
                id: user.id,
                provider,
                timestamp: Date.now()
            }]
        });
    }
    else {
        const userRegisteredEvent: UserRegistered = {
            userId: uuid.v4(),
            displayName: user.name,
            rawInfo: user,
            type: USER_REGISTERED,
            identifiers: [{
                accessToken,
                id: user.id,
                provider,
                timestamp: Date.now()
            }]
        };

        await initEventStoreConnection();
        await dispatchUserEvent(userRegisteredEvent);
    }

    return redirect(res, 302, '/protected');
};
