import { IncomingMessage, ServerResponse } from 'http'
import { send } from 'micro'
import * as fsRouter from 'fs-router'
import { initEventStoreConnection } from './persistence/eventStore'
import * as cors from 'micro-cors'

console.log('initializing micro-auth')

const match = fsRouter(__dirname + '/routes')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

module.exports = async function(req: IncomingMessage, res: ServerResponse) {
  await initEventStoreConnection()

  console.log('incoming request', req.method, req.url)

  const matched = match(req)

  if (matched) {
    return await cors()(matched)
  }

  send(res, 404, { error: 'Not found' })
}
