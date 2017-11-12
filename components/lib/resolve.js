"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../lib/utils");
/**
 * Resolves a reference to data or a function.
 *
 * @param props Component props
 * @param reference String reference to resolve
 */
exports.resolveData = (props, reference) => {
    const logger = props.mdb.logger.id('resolveData');
    //XXX Should be handled in the viewCompiler
    const parts = reference.split('.');
    if (parts.length > 1 && typeof parts[0] === 'string') {
        // Check if the first is a known library
        if (typeof props.mdb.functionLibraries[parts[0]] !== 'undefined') {
        }
    }
    logger.debug(`Trying to render ${reference} from`, props.data);
    // Scan through the data to try and resolve it
    let data = props.data || null;
    let referenced;
    while (data !== null) {
        if (typeof data.view !== 'undefined') {
            // Check view views
            if (data.view.data && typeof data.view.data[parts[0]] !== 'undefined') {
                referenced = data.view.data[parts[0]];
                // Check the type of data
                if (typeof referenced.type !== 'undefined') {
                    // Check for a data resolver
                    if (typeof data.resolvers !== 'undefined'
                        && typeof data.resolvers[parts[0]] !== 'undefined') {
                        logger.debug(`Using ${referenced.type} resolver for ${parts[0]} to resolve ${reference}`);
                        return data.resolvers[parts[0]].resolve(parts.slice(1));
                        // Check for the data handler
                    }
                    else if (typeof props.mdb.dataHandlers[referenced.type] !== 'undefined') {
                        return props.mdb.dataHandlers[referenced.type].resolve(referenced, props.path, parts.slice(1));
                    }
                    else {
                        logger.error(`Could not find data handler ${referenced.type} for data`, referenced);
                        return;
                    }
                }
                else {
                    referenced = referenced.data;
                }
                break;
            }
        }
        if (typeof data.data !== 'undefined') {
            if (typeof data.data[parts[0]] !== 'undefined') {
                referenced = data.data[parts[0]];
                break;
            }
        }
        if (typeof data.previous !== 'undefined') {
            data = data.previous;
            continue;
        }
        data = null;
    }
    if (data === null) {
        return;
    }
    logger.debug(`Resolved ${parts[0]} to`, referenced, 'Continuing with rest of path');
    parts.shift();
    if (parts.length) {
        return utils_1.getValueInObject(referenced, parts);
    }
    else {
        return referenced;
    }
};
exports.resolveView = (props, reference) => {
    // Go through data and check for views
    let data = props.data || null;
    while (data !== null) {
        if (typeof data.views !== 'undefined') {
            if (typeof data.views[reference] !== 'undefined') {
                return data.views[reference];
            }
        }
        if (typeof data.view !== 'undefined' && typeof data.view.views !== 'undefined') {
            if (typeof data.view.views[reference] !== 'undefined') {
                return data.view.views[reference];
            }
        }
        if (data.previous) {
            data = data.previous;
            continue;
        }
        data = null;
    }
    // TODO What value will symbolise requested view, but view didn't exist?
    // TODO Request view
    return null;
};
