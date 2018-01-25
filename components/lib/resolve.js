"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../lib/utils");
/**
 * Resolves a reference to data or a function.
 *
 * @param props Component props
 * @param reference Reference object
 */
exports.resolveData = (props, reference) => {
    const logger = props.mdb.logger.id('resolveData');
    const parts = reference.$ref.slice();
    //logger.debug('resolving', reference, props);
    /*XXX Should be handled in the viewCompiler
    const parts = stringParse(reference, {
      split: '.',
      blocks: {
        property: {
          start: '[',
          stop: ']',
          handle: (property) => {
            // Try to resolve property
            property = resolveData(props, property[0]);
            logger.debug('property handler got and called valueOf to get', property, property.valueOf());
            property = property.valueOf();
            return property;
          }
        },
        parameters: {
          start: '(',
          stop: ')',
          handle: (parameters) => {
            logger.debug('parameters handler got', parameters);
            try {
              parameters = JSON.parse(parameters[0]);
            } catch(err) {
              parameters = resolveData(props, parameters[0]);
              parameters = parameters.valueOf();
            }
            logger.debug('parameters handler parsed to', parameters);
            return {
              parameters
            };
          }
        }
      }
    });
    logger.debug(`after string-parse '${reference}' is now`, parts);*/
    /*TODO Resolve any variables [] in the parts and convert parts with parameters
     * () into part objects?
     */
    if (parts.length > 1 && typeof parts[0] === 'string') {
        // Check if the first is a known library
        if (typeof props.mdb.functionLibraries[parts[0]] !== 'undefined') {
        }
    }
    //logger.debug('Trying to resolve', reference, '>', parts, 'with', props.data);
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
                        //logger.debug(`Using ${referenced.type} resolver for ${parts[0]} to resolve ${reference}`);
                        return data.resolvers[parts[0]].resolve(parts.slice(1), reference);
                        // Check for the data handler
                    }
                    else if (typeof props.mdb.dataHandlers[referenced.type] !== 'undefined') {
                        return props.mdb.dataHandlers[referenced.type].resolve(referenced, props.path, parts.slice(1), reference);
                    }
                    else {
                        //logger.error(`Could not find data handler ${referenced.type} for data`, referenced);
                        return;
                    }
                }
                else {
                    referenced = referenced.data;
                }
                break;
            }
            //logger.debug(parts[0], 'not in view data');
        }
        if (typeof data.data !== 'undefined') {
            if (typeof data.data[parts[0]] !== 'undefined') {
                //logger.debug('Found', parts[0], 'in data');
                referenced = data.data[parts[0]];
                break;
            }
            //logger.debug(parts[0], 'not in data');
        }
        if (typeof data.previous !== 'undefined') {
            //logger.debug('Going to previous data');
            data = data.previous;
            continue;
        }
        data = null;
    }
    if (data === null) {
        return;
    }
    //logger.debug(`Resolved ${parts[0]} to`, referenced, 'Continuing with rest of path', parts.slice(1));
    parts.shift();
    if (parts.length) {
        if (typeof referenced === 'function') {
            return referenced(parts, reference);
        }
        else if (typeof referenced === 'object') {
            return utils_1.getValueInObject(referenced, parts);
        }
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
exports.resolveObject = (props, object) => {
    if (object instanceof Array) {
        return object.map((item) => {
            if (typeof item === 'object') {
                return exports.resolveObject(props, item);
            }
            else {
                return item;
            }
        });
    }
    else if (typeof object === 'object') {
        if (object.$ref) {
            const resolved = exports.resolveData(props, object);
            if (resolved === null || typeof resolved === 'undefined') {
                return resolved;
            }
            else {
                return resolved.valueOf();
            }
        }
        else {
            if (!Object.keys(object).length) {
                return {};
            }
            return Object.assign(...Object.entries(object).map(([key, value]) => ({ [key]: exports.resolveObject(props, value) })));
        }
    }
    else {
        return object;
    }
};
/**
 * Checks a reference to data or a function.
 *
 * @param props Component props
 * @param reference Reference object
 */
exports.checkData = (props, reference) => {
    const logger = props.mdb.logger.id('checkData');
    const parts = reference.$ref.slice();
    //logger.debug('checking', reference, props);
    if (parts.length > 1 && typeof parts[0] === 'string') {
        // Check if the first is a known library
        if (typeof props.mdb.functionLibraries[parts[0]] !== 'undefined') {
        }
    }
    //logger.debug('Trying to resolve', reference, '>', parts, 'with', props.data);
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
                        //logger.debug(`Using ${referenced.type} resolver for ${parts[0]} to resolve ${reference.$ref}`, reference);
                        return data.resolvers[parts[0]].check(parts.slice(1), reference);
                        // Check for the data handler
                    }
                    else if (typeof props.mdb.dataHandlers[referenced.type] !== 'undefined') {
                        return props.mdb.dataHandlers[referenced.type].check(referenced, props.path, parts.slice(1), reference);
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
            //logger.debug(parts[0], 'not in view data');
        }
        if (typeof data.data !== 'undefined') {
            if (typeof data.data[parts[0]] !== 'undefined') {
                //logger.debug('Found', parts[0], 'in data');
                referenced = data.data[parts[0]];
                break;
            }
            //logger.debug(parts[0], 'not in data');
        }
        if (typeof data.previous !== 'undefined') {
            //logger.debug('Going to previous data');
            data = data.previous;
            continue;
        }
        data = null;
    }
    if (data === null) {
        return;
    }
    //logger.debug(`Resolved ${parts[0]} to`, referenced, 'Continuing with rest of path', parts.slice(1));
    parts.shift();
    if (parts.length) {
        if (typeof referenced === 'function') {
            return referenced(parts, reference);
        }
        else if (typeof referenced === 'object') {
            return utils_1.getValueInObject(referenced, parts);
        }
    }
    else {
        return referenced;
    }
};
exports.checkObject = (props, object) => {
    if (object instanceof Array) {
        return object.map((item) => {
            if (typeof item === 'object') {
                return exports.checkObject(props, item);
            }
            else {
                return item;
            }
        });
    }
    else if (typeof object === 'object') {
        if (object.$ref) {
            const resolved = exports.checkData(props, object);
            return resolved;
            if (resolved === null || typeof resolved === 'undefined') {
                return resolved;
            }
            else {
                return resolved.valueOf();
            }
        }
        else {
            if (!Object.keys(object).length) {
                return {};
            }
            return Object.assign(...Object.entries(object).map(([key, value]) => ({ [key]: exports.checkObject(props, value) })));
        }
    }
    else {
        return object;
    }
};
//# sourceMappingURL=resolve.js.map