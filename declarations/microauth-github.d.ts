import { GitHubAuthenticationRequestHandler, GithubParams } from './microauth';

declare const microAuthGithub: (params: GithubParams) => (handler: GitHubAuthenticationRequestHandler) => Promise<any>

export = microAuthGithub;
