import {
    UserEvent,
    UserRegistered,
    UserPasswordChanged,
    UserProfileChanged,
    UserLoggedIn,
    UserLoggedOut,
    UserEmailAddressChanged,
    USER_EMAIL_ADDRESS_CHANGED,
    USER_LOGGED_IN,
    USER_LOGGED_OUT,
    USER_PASSWORD_CHANGED,
    USER_PROFILE_CHANGED,
    USER_REGISTERED
} from '../events/UserEvents';
import {
    State
} from '../model/State';
import {
    User,
    EmailUser
} from '../model/User';

export const initialState: State = Object.freeze({
    users: []
});

const createStateWithNewEmailUser = ({ users: oldUsers, ...rest }: State) => ({ displayName, email, passwordHash, userId: id }: UserRegistered): State => {
    const user: EmailUser = {
        id,
        email,
        displayName,
        passwordHash,
        registered: true
    };

    const users = [...oldUsers, user];

    return Object.freeze({
        ...rest,
        users
    });
};

const createStateWithChangedPassword = ({ users: oldUsers, ...rest }: State) => ({ passwordHash, userId }: UserPasswordChanged): State => {

    const users = oldUsers.map(user => {
        if (user.registered && user.id === userId) {
            return Object.freeze({
                ...user,
                passwordHash
            });
        }
        else {
            return user;
        }
    });

    return Object.freeze({
        ...rest,
        users
    });
};

const createStateWithChangedProfile = ({ users: oldUsers, ...rest }: State) => ({ userId, displayName }: UserProfileChanged): State => {
    const users = oldUsers.map(user => {
        if (user.registered && user.id === userId) {
            return Object.freeze({
                ...user,
                displayName
            });
        }
        else {
            return user;
        }
    });

    return Object.freeze({
        ...rest,
        users
    });
};

const createStateWithChangedEmail = ({ users: oldUsers, ...rest }: State) => ({ userId, email }: UserEmailAddressChanged): State => {
    const users = oldUsers.map(user => {
        if (user.registered && user.id === userId) {
            return Object.freeze({
                ...user,
                email
            });
        }
        else {
            return user;
        }
    });

    return Object.freeze({
        ...rest,
        users
    });
};

const createStateWithUserLoggedIn = ({ users: oldUsers, ...rest }: State) => ({ userId, token: sessionToken }: UserLoggedIn): State => {
    const users = oldUsers.map(user => {
        if (user.registered && user.id === userId) {
            return Object.freeze({
                ...user,
                sessionToken
            });
        }
        else {
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
        if (user.registered && user.id === userId) {
            return Object.freeze({
                ...user,
                sessionToken: undefined
            });
        }
        else {
            return user;
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
            return createStateWithNewEmailUser(state)(event);
        case USER_PASSWORD_CHANGED:
            return createStateWithChangedPassword(state)(event);
        case USER_PROFILE_CHANGED:
            return createStateWithChangedProfile(state)(event);
        case USER_EMAIL_ADDRESS_CHANGED:
            return createStateWithChangedEmail(state)(event);
        case USER_LOGGED_IN:
            return createStateWithUserLoggedIn(state)(event);
        case USER_LOGGED_OUT:
            return createStateWithUserLoggedOut(state)(event);
        default:
            return state;
    }
};
