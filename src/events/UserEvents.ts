export type UserId = {
    readonly userId: string;
};

export type UserDisplayName = {
    readonly displayName: string;
};

export type UserEmail = {
    readonly email: string;
};

export type UserPasswordHash = {
    readonly passwordHash: string;
};

export const USER_REGISTERED = 'USER_REGISTERED';
export const USER_PROFILE_CHANGED = 'USER_PROFILE_CHANGED';
export const USER_EMAIL_ADDRESS_CHANGED = 'USER_EMAIL_ADDRESS_CHANGED';
export const USER_PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED';
export const USER_LOGGED_IN = 'USER_LOGGED_IN';
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT';

export type UserEventType = typeof USER_REGISTERED
    | typeof USER_PROFILE_CHANGED
    | typeof USER_EMAIL_ADDRESS_CHANGED
    | typeof USER_PASSWORD_CHANGED
    | typeof USER_LOGGED_IN
    | typeof USER_LOGGED_OUT;

export type UserRegistered = UserId & UserDisplayName & UserEmail & UserPasswordHash & {
    readonly type: typeof USER_REGISTERED;
};

export type UserProfileChanged = UserId & UserDisplayName & {
    readonly type: typeof USER_PROFILE_CHANGED
};

export type UserEmailAddressChanged = UserId & UserEmail & {
    readonly type: typeof USER_EMAIL_ADDRESS_CHANGED
};

export type UserPasswordChanged = UserId & UserPasswordHash & {
    readonly type: typeof USER_PASSWORD_CHANGED;
};

export type UserLoggedIn = UserId & {
    readonly type: typeof USER_LOGGED_IN
    readonly token: string;
};

export type UserLoggedOut = UserId & {
    readonly type: typeof USER_LOGGED_OUT;
};

export type UserEvent =
    UserRegistered
    | UserProfileChanged
    | UserEmailAddressChanged
    | UserPasswordChanged
    | UserLoggedIn
    | UserLoggedOut;
