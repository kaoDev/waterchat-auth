import { IncomingMessage, ServerResponse } from 'http';
import { authenticateRequest, validateToken } from '../../authentication/github';

const authProvider = (p: string) => {
    if (p === 'github') {
        return validateToken;
    }
};


export const GET = authenticateRequest('/github', authProvider, () => undefined)((req: IncomingMessage, res: ServerResponse, context: object) => {
    return `YOU ARE AUTHENTICATED: ${JSON.stringify(context)}`;
});
