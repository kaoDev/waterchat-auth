'use strict';
import * as micro from 'micro';
import * as listen from 'test-listen';
import test from 'ava';
import * as got from 'got';
import { ServerResponse } from 'http';

require('async-to-gen/register')({ includes: /index\.js$/ });
const app = require('./dist'); // Eslint-disable-line import/order

test('echo back the text', async t => {
    const service = micro(app);
    const url = await listen(service);

    const res: any = (await got(url, {
        method: 'post',
        json: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: 'Hello!' })
    })) as any;

    t.is(res.body.text, 'Hello!');
});
