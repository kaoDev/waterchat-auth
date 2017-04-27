import {AuthenticationRequestHandler, SlackParams} from './microauth';

declare const microAuthSlack: (params: SlackParams) => (handler: AuthenticationRequestHandler) => Promise<any>

export = microAuthSlack;