import { IncomingMessage } from 'http';
import { send } from 'micro';
import * as compose from 'micro-compose';
import * as microAuthSlack from 'microauth-slack';
import * as microAuthGithub from 'microauth-github';
import * as microAuthTwitter from 'microauth-twitter';
import * as microAuthFacebook from 'microauth-facebook';
import { AuthenticationRequestHandler, OAuthError, OAuthResult } from 'microauth';

const githubOptions = {
    clientId: '436662a6a6b48d1037cd',
    clientSecret: 'f1a4719077f3506fd6cc6c046c7bfb2f63109081',
    callbackUrl: 'http://localhost:3000/auth/github/callback',
    path: '/auth/github',
    scope: 'user'
};

const slackOptions = {
    clientId: 'client_id',
    clientSecret: 'client_secret',
    callbackUrl: 'http://localhost:3000/auth/slack/callback',
    path: '/auth/slack',
    scope: 'identity.basic,identity.team,identity.avatar'
};

const slackAuth = microAuthSlack(slackOptions);
const githubAuth = microAuthGithub(githubOptions);

const handler: AuthenticationRequestHandler = async (req, res, auth) => {

    if (!auth) {
        return send(res, 404, 'Not Found');
    }

    if ((auth as OAuthError).err) {
        console.error((auth as OAuthError).err);
        return send(res, 403, 'Forbidden');
    }
    const { result } = (auth as OAuthResult);

    if (result.provider === 'github') {
        return `${result.provider} provider. Hello ${result.info.login}`;
    } else if (result.provider === 'slack') {
        return `${result.provider} provider. Hello ${result.info.user.name}`;
    } else {
        return 'Unknown provider';
    }

};

module.exports = compose(
    slackAuth,
    githubAuth
)(handler);
