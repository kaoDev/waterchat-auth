import { IncomingMessage, ServerResponse } from 'http';
import { authenticateRequest, validateToken } from '../../authentication/github';
import { DisplayUser } from '../../model/User';

const authProvider = (p: string) => {
    if (p === 'github') {
        return validateToken;
    }
};


export const GET = authenticateRequest('/auth/github', authProvider, () => undefined)((req: IncomingMessage, res: ServerResponse, user: DisplayUser) => {
    return `YOU ARE AUTHENTICATED: ${JSON.stringify(user)}`;
});
