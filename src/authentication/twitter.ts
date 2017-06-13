import { getEnvCredentials } from './credentials'
import * as oauth from 'oauth'

export const getRedirectUrl = (token: string) => {
  return `https://twitter.com/oauth/authorize?oauth_token=${token}`
}

const credentials = getEnvCredentials('twitter')

export const getConsumer = () => {
  return new oauth.OAuth(
    'https://twitter.com/oauth/request_token.json',
    'https://twitter.com/oauth/access_token.json',
    credentials.clientId,
    credentials.clientSecret,
    '1.0A',
    credentials.callbackUrl,
    'HMAC-SHA1'
  )
}
