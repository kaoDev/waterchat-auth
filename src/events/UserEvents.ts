import {
    UserId,
    UserDisplayName,
    OAuthRaw,
    UserIdentifier,
    SessionId
} from '../model/User';
import {
    ValidationResult
} from '../authentication/github';

export const USER_REGISTERED = 'USER_REGISTERED';
export const USER_PROFILE_CHANGED = 'USER_PROFILE_CHANGED';
export const USER_LOGGED_IN = 'USER_LOGGED_IN';
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT';
export const USER_TOKEN_VALIDATED = 'USER_TOKEN_VALIDATED';

export type UserEventType = typeof USER_REGISTERED
    | typeof USER_PROFILE_CHANGED
    | typeof USER_LOGGED_IN
    | typeof USER_LOGGED_OUT;

export type UserRegistered = UserId &
    UserIdentifier &
    UserDisplayName &
    OAuthRaw &
    SessionId &
    {
        readonly type: typeof USER_REGISTERED;
    };

export type UserProfileChanged = UserId &
    Partial<UserDisplayName> &
    {
        readonly type: typeof USER_PROFILE_CHANGED;
    };

export type UserLoggedIn = UserId &
    OAuthRaw &
    UserIdentifier &
    SessionId &
    {
        readonly type: typeof USER_LOGGED_IN;
    };

export type UserLoggedOut = UserId &
    SessionId &
    {
        readonly type: typeof USER_LOGGED_OUT;
    };

export type UserTokenValidated = UserId &
    ValidationResult &
    {
        readonly provider: 'github';
        readonly type: typeof USER_TOKEN_VALIDATED;
    };

export type UserEvent =
    UserRegistered
    | UserTokenValidated
    | UserProfileChanged
    | UserLoggedIn
    | UserLoggedOut;
