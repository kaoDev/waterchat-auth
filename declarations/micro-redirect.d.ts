import { ServerResponse } from 'http';

declare const redirect: (
    res: ServerResponse,
    statusCode: number,
    location: string
) => void;

export = redirect;