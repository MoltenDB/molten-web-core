"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get a value from within an object given the path to that object
 *
 * @param object Object to get the value from
 * @param path Path to value
 */
exports.getValueInObject = (object, path) => {
    const end = path.pop();
    if (typeof object !== 'object') {
        return;
    }
    while (typeof object === 'object' && path.length) {
        const current = path.shift();
        if (typeof object[current] !== 'object') {
            return;
        }
        object = object[current];
    }
    return object[end];
};
/**
 * Adds another key onto an existing key
 *
 * @param currentKey Current key
 * @param newKey New key
 *
 * @returns Merged key
 */
exports.addKey = (currentKey, newKey) => {
    return `${currentKey}-${newKey}`;
};
