"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserEvents_1 = require("../events/UserEvents");
const stateHasRegisteredUser = ({ users }) => (userId) => users.some(({ id }) => userId === id);
const authorizeUserRegisteredEvent = ({ users }) => ({ userId }) => users.every(({ id }) => userId !== id);
const authorizeUserPasswordChangedEvent = (state) => (event) => stateHasRegisteredUser(state)(event.userId);
const authorizeUserProfileChangedEvent = (state) => (event) => stateHasRegisteredUser(state)(event.userId);
const authorizeUserLoggedInEvent = (state) => (event) => stateHasRegisteredUser(state)(event.userId);
const authorizeUserLoggedOutEvent = (state) => (event) => stateHasRegisteredUser(state)(event.userId);
const authorizeUserEmailAddressChangedEvent = (state) => (event) => stateHasRegisteredUser(state)(event.userId);
exports.authorizeEvent = (state) => (event) => {
    switch (event.type) {
        case UserEvents_1.USER_REGISTERED:
            return authorizeUserRegisteredEvent(state)(event);
        case UserEvents_1.USER_PASSWORD_CHANGED:
            return authorizeUserPasswordChangedEvent(state)(event);
        case UserEvents_1.USER_PROFILE_CHANGED:
            return authorizeUserProfileChangedEvent(state)(event);
        case UserEvents_1.USER_EMAIL_ADDRESS_CHANGED:
            return authorizeUserEmailAddressChangedEvent(state)(event);
        case UserEvents_1.USER_LOGGED_IN:
            return authorizeUserLoggedInEvent(state)(event);
        case UserEvents_1.USER_LOGGED_OUT:
            return authorizeUserLoggedOutEvent(state)(event);
        default:
            return false;
    }
};
