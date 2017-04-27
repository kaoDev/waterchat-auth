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
    User
} from '../model/User';

const stateHasRegisteredUser = ({ users }: State) => (userId: string) => users.some(({ id }) => userId === id);

const authorizeUserRegisteredEvent = ({ users }: State) => ({ userId }: UserRegistered) => users.every(({ id }) => userId !== id);

const authorizeUserPasswordChangedEvent = (state: State) => (event: UserPasswordChanged) => stateHasRegisteredUser(state)(event.userId);

const authorizeUserProfileChangedEvent = (state: State) => (event: UserProfileChanged) => stateHasRegisteredUser(state)(event.userId);

const authorizeUserLoggedInEvent = (state: State) => (event: UserLoggedIn) => stateHasRegisteredUser(state)(event.userId);

const authorizeUserLoggedOutEvent = (state: State) => (event: UserLoggedOut) => stateHasRegisteredUser(state)(event.userId);

const authorizeUserEmailAddressChangedEvent = (state: State) => (event: UserEmailAddressChanged) => stateHasRegisteredUser(state)(event.userId);

export const authorizeEvent = (state: State) => (event: UserEvent): boolean => {
    switch (event.type) {
        case USER_REGISTERED:
            return authorizeUserRegisteredEvent(state)(event);
        case USER_PASSWORD_CHANGED:
            return authorizeUserPasswordChangedEvent(state)(event);
        case USER_PROFILE_CHANGED:
            return authorizeUserProfileChangedEvent(state)(event);
        case USER_EMAIL_ADDRESS_CHANGED:
            return authorizeUserEmailAddressChangedEvent(state)(event);
        case USER_LOGGED_IN:
            return authorizeUserLoggedInEvent(state)(event);
        case USER_LOGGED_OUT:
            return authorizeUserLoggedOutEvent(state)(event);
        default:
            return false;
    }
};
