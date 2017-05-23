import * as fs from 'fs';
import * as path from 'path';

function readCredentialsAsync(): Promise<{ [provider: string]: ProviderCredentials }> {
    const fileName = path.resolve(process.cwd() + '/.credentials.json');
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            resolve(JSON.parse(data));
        });
    });
}

export type ProviderCredentials = {
    clientId: string,
    clientSecret: string,
    callbackUrl: string,
    scope: string
};

const dummyCredentials = {
    clientId: 'O_AUTH_CLIENT_ID',
    clientSecret: 'O_AUTH_CLIENT_SECRET',
    callbackUrl: 'O_AUTH_CALLBACK_URL',
    scope: 'O_AUTH_REQUESTED_SCOPE'
};

export const loadCredentials = async ({ provider }: { provider: string }) => {
    try {
        const credentialDictionary = await readCredentialsAsync();
        const credentials = credentialDictionary[provider];

        if (credentials) {
            return credentials;
        }
        else {
            console.warn(`could not read credentials for the provider ${provider}`);
        }
    }
    catch (e) {
        console.error(e);
        console.warn(`the ".credentials.json" file could not be found, you are working with dummy data
                make sure to have your credentials available in the working directory`);
    }

    return dummyCredentials;
};
