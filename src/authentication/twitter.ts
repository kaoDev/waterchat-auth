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

export type TwitterOAuthUser = {
  'provider': 'twitter'
  'info': {
    'id': number
    'id_str': string
    'name': string
    'screen_name': string
    'location': string
    'description': string
    'url': string
    'entities': {
      'url': {
        'urls': {
          'url': string
          'expanded_url': string
          'display_url': string
          'indices': number[]
        }[]
      }
      'description': { 'urls': any[] }
    }
    'protected': boolean
    'followers_count': number
    'friends_count': number
    'listed_count': number
    'created_at': string
    'favourites_count': number
    'utc_offset': null
    'time_zone': null
    'geo_enabled': boolean
    'verified': boolean
    'statuses_count': number
    'lang': string
    'status': {
      'created_at': string
      'id': number
      'id_str': string
      'text': string
      'truncated': boolean
      'entities': {
        'hashtags': string[]
        'symbols': string[]
        'user_mentions': {
          'screen_name': string
          'name': string
          'id': number
          'id_str': string
          'indices': number[]
        }[]

        'urls': {
          'url': string
          'expanded_url': string
          'display_url': string
          'indices': number[]
        }[]
      }
      'source': string
      'in_reply_to_status_id': null
      'in_reply_to_status_id_str': null
      'in_reply_to_user_id': null
      'in_reply_to_user_id_str': null
      'in_reply_to_screen_name': null
      'geo': null
      'coordinates': null
      'place': null
      'contributors': null
      'is_quote_status': boolean
      'retweet_count': number
      'favorite_count': number
      'favorited': boolean
      'retweeted': boolean
      'possibly_sensitive': boolean
      'lang': string
    }
    'contributors_enabled': boolean
    'is_translator': boolean
    'is_translation_enabled': boolean
    'profile_background_color': string
    'profile_background_image_url': string
    'profile_background_image_url_https': string
    'profile_background_tile': boolean
    'profile_image_url': string
    'profile_image_url_https': string
    'profile_banner_url': string
    'profile_link_color': string
    'profile_sidebar_border_color': string
    'profile_sidebar_fill_color': string
    'profile_text_color': string
    'profile_use_background_image': boolean
    'has_extended_profile': boolean
    'default_profile': boolean
    'default_profile_image': boolean
    'following': boolean
    'follow_request_sent': boolean
    'notifications': boolean
    'translator_type': string
  }
  'accessToken': string
  'accessTokenSecret': string
}
