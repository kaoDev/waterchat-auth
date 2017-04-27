"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserEvents_1 = require("../events/UserEvents");
const User_1 = require("../model/User");
const userIsRegistered = (user) => undefined !== user && user.registered;
const userIdIsFree = (user) => undefined === user;
const stateHasRegisteredUser = (state) => (userId) => userIsRegistered(state.UsersById.get(userId));
const authorizeUserRegisteredEvent = (state) => (event) => {
    const user = state.UsersById.get(event.userId);
    return undefined === user;
};
const authorizeUserPasswordChangedEvent = (state) => (event) => {
    const user = state.UsersById.get(event.userId);
    return undefined !== user
        && user.registered;
};
const authorizeUserProfileChangedEvent = (state) => (event) => {
    const user = state.UsersById.get(event.userId);
    return match(user, false, Class(User_1.RegisteredUser, u => {
        return true;
    }));
};
const authorizeUserLoggedInEvent = (state) => (event) => {
    const user = state.UsersById.get(event.userId);
    return match(user, false, Class(User_1.RegisteredUser, u => {
        return true;
    }));
};
const authorizeUserLoggedOutEvent = (state) => (event) => {
    const user = state.UsersById.get(event.userId);
    return match(user, false, Class(User_1.RegisteredUser, u => {
        return true;
    }));
};
const authorizeUserEmailAddressChangedEvent = (state) => (event) => {
    const user = state.UsersById.get(event.userId);
    return match(user, false, Class(User_1.RegisteredUser, u => {
        return true;
    }));
};
exports.authorizeEvent = (state) => (event) => {
    switch (event.type) {
        case UserEvents_1.USER_REGISTERED:
            return authorizeUserRegisteredEvent(state)(event);
        case UserEvents_1.USER_PASSWORD_CHANGED:
            return authorizeUserPasswordChangedEvent(state)(event);
        case UserEvents_1.USER_PROFILE_CHANGED:
            return authorizeUserProfileChangedEvent(state)(event);
        case UserEvents_1.USER_EMAIL_ADDRESS_CHANGED:
            return authorizeUserLoggedInEvent(state)(event);
        case UserEvents_1.USER_LOGGED_IN:
            return authorizeUserLoggedOutEvent(state)(event);
        case UserEvents_1.USER_LOGGED_OUT:
            return authorizeUserEmailAddressChangedEvent(state)(event);
        default:
            return false;
    }
};
