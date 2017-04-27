'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const micro = require("micro");
const listen = require("test-listen");
const ava_1 = require("ava");
const got = require("got");
require('async-to-gen/register')({ includes: /index\.js$/ });
const app = require('./dist'); // Eslint-disable-line import/order
ava_1.default('echo back the text', async (t) => {
    const service = micro(app);
    const url = await listen(service);
    const res = (await got(url, {
        method: 'post',
        json: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: 'Hello!' })
    }));
    t.is(res.body.text, 'Hello!');
});
