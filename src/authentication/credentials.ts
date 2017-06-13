import * as fs from 'fs'
import * as path from 'path'

function readCredentialsAsync(): Promise<
  { [provider: string]: ProviderCredentials }
> {
  const fileName = path.resolve(process.cwd() + '/.credentials.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        console.warn(err)
        console.warn(`no env vars and the ".credentials.json" file could not be found, you are working with dummy data
                                make sure to have your credentials available in the working directory`)
        resolve({})
      }
      resolve(JSON.parse(data))
    })
  })
}

export type ProviderCredentials = {
  clientId: string
  clientSecret: string
  callbackUrl: string
  scope: string
}

const dummyCredentials = {
  clientId: 'O_AUTH_CLIENT_ID',
  clientSecret: 'O_AUTH_CLIENT_SECRET',
  callbackUrl: 'O_AUTH_CALLBACK_URL',
  scope: 'O_AUTH_REQUESTED_SCOPE',
}

export const getEnvCredentials = (provider: string) => {
  const idVar = `${provider.toUpperCase()}_ID`
  const secretVar = `${provider.toUpperCase()}_SECRET`
  const callbackVar = `${provider.toUpperCase()}_CALLBACK`

  const clientId = process.env[idVar] as string | undefined
  const clientSecret = process.env[secretVar] as string | undefined
  const callbackUrl = process.env[callbackVar] as string | undefined
  const scope = ''

  if (
    clientId !== undefined &&
    clientSecret !== undefined &&
    callbackUrl !== undefined
  ) {
    return {
      clientId,
      clientSecret,
      callbackUrl,
      scope,
    }
  } else {
    return dummyCredentials
  }
}

export const loadCredentials = async ({ provider }: { provider: string }) => {
  const potentialEnvCredentials = getEnvCredentials(provider)

  if (potentialEnvCredentials !== dummyCredentials) {
    return potentialEnvCredentials
  }

  const credentialDictionary = await readCredentialsAsync()
  const credentials = credentialDictionary[provider]

  if (credentials) {
    return credentials
  } else {
    console.warn(`could not read credentials for the provider ${provider} `)
  }

  return dummyCredentials
}
