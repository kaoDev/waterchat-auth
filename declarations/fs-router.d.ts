import { IncomingMessage, ServerResponse } from 'http';

declare const fsRouter: (path: string) => (req: IncomingMessage) => ((req: IncomingMessage, res: ServerResponse) => Promise<any>) | undefined | null;

export = fsRouter;
