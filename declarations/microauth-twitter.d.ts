import {AuthenticationRequestHandler, TwitterParams} from './microauth';

declare const microAuthTwitter: (params: TwitterParams) => (handler: AuthenticationRequestHandler) => Promise<any>

export = microAuthTwitter;