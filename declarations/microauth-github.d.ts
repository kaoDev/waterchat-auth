import {AuthenticationRequestHandler, GithubParams} from './microauth';

declare const microAuthGithub: (params: GithubParams) => (handler: AuthenticationRequestHandler) => Promise<any>

export = microAuthGithub;