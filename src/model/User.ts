export type UserBaseInfo = {
    readonly id: string,
    readonly displayName: string,
    readonly email?: string,
    readonly passwordHash?: string,
    readonly token?: string,
    readonly sessionToken?: string
};

export type DeletedUser = UserBaseInfo & {
    readonly displayName: '[deleted]',
    readonly registered: false
};

export type EmailUser = UserBaseInfo & {
    readonly email: string,
    readonly passwordHash: string,
    readonly registered: true
};

export type TokenUser = UserBaseInfo & {
    readonly token: string,
    readonly registered: true
};

export type User = DeletedUser | EmailUser | TokenUser;
