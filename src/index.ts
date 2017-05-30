import { IncomingMessage, ServerResponse } from 'http';
import { send } from 'micro';
import * as fsRouter from 'fs-router';
import { initEventStoreConnection } from './persistence/eventStore';

console.log('initializing micro-auth');

const match = fsRouter(__dirname + '/routes');

module.exports = async function (req: IncomingMessage, res: ServerResponse) {

    await initEventStoreConnection();

    console.log('incoming request', req.url);

    const matched = match(req);

    if (matched) {
        return await matched(req, res);
    }

    send(res, 404, { error: 'Not found' });
};
