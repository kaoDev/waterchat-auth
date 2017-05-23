import {
    UserEvent,
    UserRegistered,
    UserProfileChanged,
    UserLoggedOut,
    UserTokenValidated,
    UserLoggedIn,
    USER_LOGGED_OUT,
    USER_PROFILE_CHANGED,
    USER_REGISTERED,
    USER_TOKEN_VALIDATED,
    USER_LOGGED_IN
} from '../events/UserEvents';
import {
    State
} from '../model/State';

export const initialState: State = Object.freeze({
    users: []
});

const createStateWithChangedProfile = ({ users: oldUsers, ...rest }: State) => ({ userId, displayName }: UserProfileChanged): State => {
    const users = oldUsers.map(user => {
        if (user.userId === userId) {
            return Object.freeze({
                ...user,
                displayName
            });
        } else {
            return user;
        }
    });

    return Object.freeze({
        ...rest,
        users
    });
};

const createStateWithUserLoggedOut = ({ users: oldUsers, ...rest }: State) => ({ userId }: UserLoggedOut): State => {
    const users = oldUsers.map(user => {
        if (user.userId === userId) {
            return Object.freeze({
                ...user,
                token: '',
                algorithm: ''
            });
        } else {
            return user;
        }
    });

    return Object.freeze({
        ...rest,
        users
    });
};

const createStateWithNewUser = ({ users: oldUsers, ...rest }: State) =>
    ({ type, rawInfo, ...userData }: UserRegistered): State => {
        const users = oldUsers.concat(userData);

        return Object.freeze({
            ...rest,
            users
        });
    };

const createStateWithUpdatedValidationUser = ({ users: oldUsers, ...rest }: State) =>
    ({ type, provider, token: accessToken, id, ...userData }: UserTokenValidated): State => {

        const users = oldUsers.map(u => {
            if (u.userId === userData.userId) {
                const oldIdentifierIndex = u.identifiers.findIndex(i => i.provider === provider);
                const unchangedIdentifiers = u.identifiers.splice(oldIdentifierIndex, 1);

                return {
                    ...u,
                    identifiers: [
                        ...unchangedIdentifiers,
                        {
                            provider,
                            accessToken,
                            id,
                            timestamp: Date.now()
                        }
                    ]
                };
            }
            else {
                return u;
            }
        });

        return Object.freeze({
            ...rest,
            users
        });
    };

const createStateWithLoggedInUser = ({ users: oldUsers, ...rest }: State) =>
    ({ type, rawInfo, identifiers, ...userData }: UserLoggedIn): State => {

        const users = oldUsers.map(u => {
            if (u.userId === userData.userId) {
                return {
                    ...u,
                    identifiers: [
                        ...u.identifiers,
                        ...identifiers
                    ]
                };
            }
            else {
                return u;
            }
        });

        return Object.freeze({
            ...rest,
            users
        });
    };

export const updateUserState = (state: State = initialState) => (event: UserEvent): State => {
    switch (event.type) {
        case USER_REGISTERED:
            return createStateWithNewUser(state)(event);
        case USER_PROFILE_CHANGED:
            return createStateWithChangedProfile(state)(event);
        case USER_LOGGED_IN:
            return createStateWithLoggedInUser(state)(event);
        case USER_LOGGED_OUT:
            return createStateWithUserLoggedOut(state)(event);
        case USER_TOKEN_VALIDATED:
            return createStateWithUpdatedValidationUser(state)(event);
        default:
            return state;
    }
};
