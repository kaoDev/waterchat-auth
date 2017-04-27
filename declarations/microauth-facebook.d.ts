import { AuthenticationRequestHandler, FaceBookParams } from './microauth';

declare const microAuthFacebook: (params: FaceBookParams) => (handler: AuthenticationRequestHandler) => Promise<any>

export = microAuthFacebook;