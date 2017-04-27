"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserEvents_1 = require("../events/UserEvents");
exports.initialState = Object.freeze({
    users: []
});
const createStateWithNewEmailUser = (_a) => {
    var { users: oldUsers } = _a, rest = __rest(_a, ["users"]);
    return ({ displayName, email, passwordHash, userId: id }) => {
        const user = {
            id,
            email,
            displayName,
            passwordHash,
            registered: true
        };
        const users = [...oldUsers, user];
        return Object.freeze(Object.assign({}, rest, { users }));
    };
};
const createStateWithChangedPassword = (_a) => {
    var { users: oldUsers } = _a, rest = __rest(_a, ["users"]);
    return ({ passwordHash, userId }) => {
        const users = oldUsers.map(user => {
            if (user.registered && user.id === userId) {
                return Object.freeze(Object.assign({}, user, { passwordHash }));
            }
            else {
                return user;
            }
        });
        return Object.freeze(Object.assign({}, rest, { users }));
    };
};
const createStateWithChangedProfile = (_a) => {
    var { users: oldUsers } = _a, rest = __rest(_a, ["users"]);
    return ({ userId, displayName }) => {
        const users = oldUsers.map(user => {
            if (user.registered && user.id === userId) {
                return Object.freeze(Object.assign({}, user, { displayName }));
            }
            else {
                return user;
            }
        });
        return Object.freeze(Object.assign({}, rest, { users }));
    };
};
const createStateWithChangedEmail = (_a) => {
    var { users: oldUsers } = _a, rest = __rest(_a, ["users"]);
    return ({ userId, email }) => {
        const users = oldUsers.map(user => {
            if (user.registered && user.id === userId) {
                return Object.freeze(Object.assign({}, user, { email }));
            }
            else {
                return user;
            }
        });
        return Object.freeze(Object.assign({}, rest, { users }));
    };
};
const createStateWithUserLoggedIn = (_a) => {
    var { users: oldUsers } = _a, rest = __rest(_a, ["users"]);
    return ({ userId, token: sessionToken }) => {
        const users = oldUsers.map(user => {
            if (user.registered && user.id === userId) {
                return Object.freeze(Object.assign({}, user, { sessionToken }));
            }
            else {
                return user;
            }
        });
        return Object.freeze(Object.assign({}, rest, { users }));
    };
};
const createStateWithUserLoggedOut = (_a) => {
    var { users: oldUsers } = _a, rest = __rest(_a, ["users"]);
    return ({ userId }) => {
        const users = oldUsers.map(user => {
            if (user.registered && user.id === userId) {
                return Object.freeze(Object.assign({}, user, { sessionToken: undefined }));
            }
            else {
                return user;
            }
        });
        return Object.freeze(Object.assign({}, rest, { users }));
    };
};
exports.updateUserState = (state = exports.initialState) => (event) => {
    switch (event.type) {
        case UserEvents_1.USER_REGISTERED:
            return createStateWithNewEmailUser(state)(event);
        case UserEvents_1.USER_PASSWORD_CHANGED:
            return createStateWithChangedPassword(state)(event);
        case UserEvents_1.USER_PROFILE_CHANGED:
            return createStateWithChangedProfile(state)(event);
        case UserEvents_1.USER_EMAIL_ADDRESS_CHANGED:
            return createStateWithChangedEmail(state)(event);
        case UserEvents_1.USER_LOGGED_IN:
            return createStateWithUserLoggedIn(state)(event);
        case UserEvents_1.USER_LOGGED_OUT:
            return createStateWithUserLoggedOut(state)(event);
        default:
            return state;
    }
};
