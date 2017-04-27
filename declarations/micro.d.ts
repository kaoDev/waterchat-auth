import { IncomingMessage, ServerResponse } from 'http';

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => any

export const run: (req: IncomingMessage, res: ServerResponse, fn: RequestHandler) => Promise<void>

declare const serve: (fn: RequestHandler) => Promise<void>
export default serve;

export const send: (res: ServerResponse, code: number, data?: object|string) => Promise<void>

export const sendError: (req: IncomingMessage, res: ServerResponse, info: { statusCode?: number, status?: number, message?: string, stack?: string }) => Promise<void>

export function createError(code: number, msg: string, orig: Error): Error & { statusCode: number, originalError: Error }

export const buffer: (req: IncomingMessage, info?: { limit?: string, encoding?: string }) => Promise<Buffer | string>

export const text: (req: IncomingMessage, info?: { limit?: string, encoding?: string }) => Promise<string>

export const json: (req: IncomingMessage, info?: { limit?: string, encoding?: string }) => Promise<object>