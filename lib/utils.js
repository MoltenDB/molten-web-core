"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get a value from within an object given the path to that object
 *
 * @param object Object to get the value from
 * @param path Path to value
 */
exports.getValueInObject = (object, path) => {
    if (!path.length) {
        return object;
    }
    const end = path[path.length - 1];
    if (typeof object !== 'object') {
        return;
    }
    let i = 0;
    while (typeof object === 'object' && i < path.length - 1) {
        const current = path[i++];
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
/**
 * Set a value deep in a shallow copy of an object with changing the original
 * object.
 *
 * @param object Object to shallow copy and to not change
 * @param path Path to value to change
 * @param value New value to set
 * @param merge Whether or not to merge the given value with the current value
 *   if both values are objects. If not set:
 *     - object values will be shallowly merged
 *     - array values will be replaced
 *   If true:
 *     - object values will be deeply merged
 *     - array values will be concatenated together
 *   If false, the current value will just be replaced
 *
 * @returns New shallowly copied Object with set value
 */
exports.setIn = (object, path, value, merge) => {
    let newObject = Object.assign({}, object);
    // Make copy of path so not destructive
    path = path.slice();
    const last = path.pop();
    let node;
    let currentNode = newObject;
    while (typeof (node = path.shift()) !== 'undefined') {
        // Shallow copy the current value
        if (currentNode[node] instanceof Array) {
            currentNode[node] = currentNode[node].slice();
        }
        else if (typeof currentNode[node] === 'object') {
            currentNode[node] = Object.assign({}, currentNode[node]);
        }
        else if (typeof currentNode[node] === 'undefined') {
            if (typeof (path.length ? path[0] : last) === 'number') {
                currentNode[node] = [];
            }
            else {
                currentNode[node] = {};
            }
        }
        currentNode = currentNode[node];
    }
    if (value instanceof Array && currentNode[last] instanceof Array && merge === true) {
        currentNode[last] = currentNode[last].concat(value);
    }
    else if (merge !== false
        && !(value instanceof Array) && typeof value === 'object'
        && !(currentNode[last] instanceof Array)
        && typeof currentNode[last] === 'object') {
        if (merge === true) {
            throw new Error('TODO');
        }
        else {
            currentNode[last] = Object.assign({}, currentNode[last], value);
        }
    }
    else {
        currentNode[last] = value;
    }
    return newObject;
};
/**
 * Checks if the given arrays contain the same values
 *
 * @param array1 First array to check
 * @param array2 Second array to check
 *
 * @returns Whether or not the arrays contain the same values
 */
exports.containSameValues = (array1, array2) => {
    if (!(array1 instanceof Array) || !(array2 instanceof Array)) {
        throw new TypeError('Values given should both be arrays');
    }
    if (array1.length !== array2.length) {
        return false;
    }
    // Create a copy of the first array to 
    let copy = array1.slice();
    const bad = array2.forEach((item) => {
        const index = copy.indexOf(item);
        if (index === -1) {
            return true;
        }
        copy.splice(index, 1);
    });
    if (typeof bad !== 'undefined' || copy.length !== 0) {
        return false;
    }
    return true;
};
