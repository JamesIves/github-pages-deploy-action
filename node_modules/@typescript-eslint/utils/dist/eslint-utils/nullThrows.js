"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullThrowsReasons = exports.nullThrows = void 0;
/**
 * A set of common reasons for calling nullThrows
 */
const NullThrowsReasons = {
    MissingParent: 'Expected node to have a parent.',
    MissingToken: (token, thing) => `Expected to find a ${token} for the ${thing}.`,
};
exports.NullThrowsReasons = NullThrowsReasons;
/**
 * Assert that a value must not be null or undefined.
 * This is a nice explicit alternative to the non-null assertion operator.
 */
function nullThrows(value, message) {
    if (value == null) {
        throw new Error(`Non-null Assertion Failed: ${message}`);
    }
    return value;
}
exports.nullThrows = nullThrows;
//# sourceMappingURL=nullThrows.js.map