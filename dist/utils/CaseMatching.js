"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleEquals = (a, b) => a === b;
exports.simpleClassMatcher = (a, b) => a instanceof b;
// tslint:disable-next-line:variable-name
exports.Case = (val, project, matchCase) => (a) => {
    const success = matchCase(val, a);
    if (success) {
        const result = project(a);
        return { success, result };
    }
    else {
        return { success: false, result: undefined };
    }
};
// tslint:disable-next-line:variable-name
exports.Value = (value, project) => exports.Case(value, project, exports.simpleEquals);
// tslint:disable-next-line:variable-name
exports.Class = (value, project) => exports.Case(value, project, exports.simpleClassMatcher);
function match(a, defaultValue, ...cases) {
    for (let i = 0; i < cases.length; i++) {
        const r = cases[i](a);
        if (r.success) {
            return r.result;
        }
    }
    return defaultValue;
}
exports.match = match;
