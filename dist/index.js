"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const micro_1 = require("micro");
const compose = require("micro-compose");
const microAuthSlack = require("microauth-slack");
const microAuthGithub = require("microauth-github");
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
const handler = async (req, res, auth) => {
    if (!auth) {
        return micro_1.send(res, 404, 'Not Found');
    }
    if (auth.err) {
        console.error(auth.err);
        return micro_1.send(res, 403, 'Forbidden');
    }
    const { result } = auth;
    if (result.provider === 'github') {
        return `${result.provider} provider. Hello ${result.info.login}`;
    }
    else if (result.provider === 'slack') {
        return `${result.provider} provider. Hello ${result.info.user.name}`;
    }
    else {
        return 'Unknown provider';
    }
};
module.exports = compose(slackAuth, githubAuth)(handler);
