import { IncomingMessage, ServerResponse } from 'http'
declare const cors: (
  options?: {
    maxAge: number
    origin: string
    allowHeaders: string[]
    allowMethods: string[]
  }
) => (
  handler: (req: IncomingMessage, res: ServerResponse) => any
) => (req: IncomingMessage, res: ServerResponse) => any

export = cors
