"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("../../actions/view");
const utils_1 = require("../../lib/utils");
const resolvePath = (object, path) => {
    let pathNode;
    while (pathNode = path.shift()) {
        if (object instanceof Object) {
            object = object[pathNode];
        }
        else {
            return;
        }
    }
    return object;
};
exports.id = 'moltendb';
exports.name = 'MoltenDB Data';
exports.description = 'Use this data handler to access data in the MoltenDB database';
exports.createResolver = (props, data, path, dataId) => {
    const logger = props.mdb.logger.id('MoltenDB data resolver');
    //logger.debug('resolver created for', data, props, path);
    let requests = [];
    let needCollectionOptions = [];
    /**
     * Resolve collection options reference
     *
     * @param parts Path parts to resolve
     */
    const resolveCollectionOptions = (parts) => {
        if (['name', 'label', 'description', 'title'].indexOf(parts[0]) !== -1) {
            if (parts.length > 1) {
                //TODO Error
                return;
            }
            switch (parts[0]) {
                case 'name':
                case '_id':
                    return data.collectionOptions._id;
                case 'label':
                    return data.collectionOptions.label;
                case 'description':
                    return data.collectionOptions.description;
                case 'title':
                    //TODO Render title
                    return data.collectionOptions.title ?
                        renderer.renderLabel(props, data.collectionOptions.title)
                        : data.collectionOptions.label;
            }
        }
        else if (parts[0] === 'paths') {
            switch (parts.length) {
                case '1':
                    return data.collectionOptions.paths;
                case '2':
                    return data.collectionOptions.paths;
                default:
                    //TODO Error
                    return;
            }
        }
        else {
            return;
        }
    };
    /**
     * Resolve field detail
     *
     * @param parts Path parts to resolve
     */
    const resolveFieldDetail = (field, parts) => {
        //logger.debug('resolveFieldDetail', field, parts);
        if (!parts || !parts.length) {
            let resolver = (newParts) => resolveFieldDetail(newParts);
            resolver.valueOf = () => field;
            return resolver;
        }
        if (parts.length > 1) {
            return;
        }
        const fieldData = data.collectionOptions.fields[field];
        if (typeof fieldData[parts[0]] !== 'undefined') {
            return fieldData[parts[0]];
        }
        return;
    };
    /**
     * Resolve fields reference
     *
     * @param parts Path parts to resolve
     */
    const resolveFields = (parts) => {
        //logger.debug('resolveFields', parts);
        if (!parts || !parts.length) {
            let resolver = (newParts) => resolveFields(newParts);
            const fields = Object.keys(data.collectionOptions.fields).map((field) => {
                let fieldResolver = (newParts) => resolveFieldDetail(field, newParts);
                fieldResolver.valueOf = () => field;
                return fieldResolver;
            });
            //logger.debug('creating iterator from mapping field keys to objects', fields);
            resolver[Symbol.iterator] = fields[Symbol.iterator].bind(fields);
            return resolver;
        }
        const field = parts.shift();
        if (typeof data.collectionOptions.fields[field] === 'undefined') {
            return;
        }
        if (!parts || !parts.length) {
            return (newParts) => resolveFieldDetail(field, newParts);
        }
        return resolveFieldDetail(field, parts);
    };
    /**
     * Resolves items
     *
     * @param parts Path to thing to resolve
     */
    const resolveItems = (parts, reference) => {
        //logger.debug('resolveItems', parts.slice(), reference, data);
        let subscription;
        if (typeof reference._request !== 'undefined' && data.subscriptions) {
            subscription = data.subscriptions.find((subscription) => subscription.id === reference._request);
        }
        let results;
        if (reference._separateResults) {
            if (subscription) {
                results = subscription.results;
            }
        }
        else if (data.data) {
            results = data.data.results;
        }
        //logger('resolveItems', 'debug', 'got results', reference._separateResults, results);
        if (!results) {
            let nullFunction = () => null;
            nullFunction.valueOf = () => null;
            if (subscription) {
                nullFunction.status = subscription.status;
            }
            else {
                nullFunction.status = null;
            }
            return nullFunction;
        }
        /**
         * Resolve an item
         *
         * @param index Index of the item id in the results array
         */
        const resolveItem = (index, parts) => {
            //logger.debug('resolveItem', index, parts.slice());
            if (!parts || !parts.length) {
                //logger.debug('no parts, returning resolveItem');
                let itemResolver = (newParts) => resolveItem(index, newParts);
                itemResolver.valueOf = () => null;
                return itemResolver;
            }
            if ((index < 0 || (results && index >= results.length))) {
                logger.error(`Index out of range (${index}) accessing item in ${dataId}`);
                return;
            }
            const id = results[index];
            const item = data.data.items[id];
            const resolveField = (parts) => {
                //logger.debug('resolveField', parts.slice());
                const field = parts.shift();
                const fieldOptions = data.collectionOptions.fields[field];
                if (typeof fieldOptions === 'undefined') {
                    return;
                }
                const mdbField = props.mdb.types[fieldOptions.type];
                if (typeof mdbField === 'undefined') {
                    logger.error(`Field type ${fieldOptions.type} not loaded`);
                    return;
                }
                let parameters;
                if (parts && parts.length) {
                    if (typeof parts === 'object') {
                        parameters = parts.shift();
                    }
                }
                ///TODO How is forms etc going to work
                if (!parts || !parts.length) {
                    return {
                        valueOf: () => mdbField.value(field, fieldOptions, item, parameters),
                        label: fieldOptions.label,
                        // TODO Goto field to get value?
                        value: item[field]
                    };
                }
                else {
                    // Get sub field
                    if (parts[0] === 'label') {
                        return fieldOptions.label;
                    }
                    else if (parts[0] === 'value') {
                        return item[field];
                    }
                }
            };
            if (!parts || !parts.length) {
                let resolver = (newParts) => resolveField(newParts);
                resolver.valueOf = () => JSON.parse(JSON.stringify(data.data.items));
                return resolver;
            }
            else {
                return resolveField(parts);
            }
        };
        if (parts && parts.length) {
            //logger.debug('Checking if first part is an parameters', parts.slice());
            // Check if first part is parameters
            if (typeof parts[0] === 'object'
                && typeof parts[0].parameters !== 'undefined') {
                // Find the subscription with the same parameters
                const parameters = parts.shift().parameters;
            }
        }
        if (!parts || !parts.length) {
            //logger.debug('resolveItems got no more parts');
            let resolver = (newParts, newReference) => resolveItems(newParts, newReference);
            const items = results.map((id, index) => {
                let itemResolver = (newParts) => resolveItem(index, newParts);
                itemResolver.valueOf = () => id;
                return itemResolver;
            });
            resolver[Symbol.iterator] = items[Symbol.iterator].bind(items);
            resolver.valueOf = () => JSON.parse(JSON.stringify(results.map((id) => data.data.items[id])));
            resolver.status = subscription.status;
            return resolver;
        }
        if (parts[0] === 'status') {
            //logger.debug('returning subscription status', subscription)
            return subscription ? subscription.status : null;
        }
        const id = Number(parts[0]);
        if (isNaN(id)) {
            logger.error(`Bad index (${parts[0]} ${typeof parts[0]}) accessing item in ${dataId}`);
            return;
        }
        return resolveItem(id, parts.slice(1));
    };
    const resolve = (parts, reference) => {
        if (!parts || !parts.length) {
            return (newParts) => resolve(newParts);
        }
        const type = parts.shift();
        //logger.debug('resolving', type, parts.slice());
        switch (type) {
            case 'collection':
                if (!data.collectionOptions) {
                    return null;
                }
                if (parts.length) {
                    return resolveCollectionOptions(parts, reference);
                }
                return (newParts, newReference) => resolveCollectionOptions(newParts, newReference);
            case 'fields':
                if (!data.collectionOptions) {
                    return null;
                }
                return resolveFields(parts, reference);
            case 'items':
                return resolveItems(parts, reference);
            case 'status':
                let subscription;
                if (typeof reference._request !== 'undefined' && data.subscriptions) {
                    subscription = data.subscriptions.find((subscription) => subscription.id === reference._request);
                }
                if (subscription) {
                    return subscription.status;
                }
                return null;
        }
    };
    const checkItems = (parts, reference, request) => {
        //logger('checkItems', 'debug', parts.slice(), data);
        let subscription;
        if (typeof reference._request !== 'undefined') {
            if (data.subscriptions) {
                subscription = data.subscriptions.find((subscription) => subscription.id === reference._request);
            }
        }
        else {
            if (!request.references.find((requestReference) => requestReference === reference)) {
                request.references.push(reference);
            }
        }
        let results;
        if (reference._separateResults) {
            results = subscription.results;
        }
        else if (data.data) {
            results = data.data.results;
        }
        /**
         * Check an item
         *
         * @param index Index of the item id in the results array
         */
        const checkItem = (index, parts) => {
            //logger.debug('resolveItem', index, parts.slice());
            if (!parts || !parts.length) {
                //logger.debug('no parts, returning resolveItem');
                let itemChecker = (newParts) => checkItem(index, newParts);
                itemChecker.valueOf = () => null;
                return itemChecker;
            }
            if (index !== null && (index < 0
                || (results && index >= results.length))) {
                logger.error(`Index out of range (${index}) accessing item in ${dataId}`);
                return;
            }
            //XXX Temporary null item resolution
            if (index === null || !data.data) {
                if (parts && parts.length) {
                    if (!subscription) {
                        //logger.debug('fake resolver adding field', parts[0]);
                        const field = parts.shift();
                        if (typeof request.options.fields === 'undefined') {
                            request.options.fields = ['_id'];
                        }
                        if (request.options.fields.indexOf(field) === -1) {
                            request.options.fields.push(field);
                        }
                    }
                    return null;
                }
                else {
                    let checker = (newParts) => checkItem(index, newParts);
                    checker.valueOf = () => null;
                }
            }
            const id = results[index];
            const item = data.data.items[id];
            const checkField = (parts) => {
                //logger.debug('checkField', parts.slice());
                const field = parts.shift();
                const fieldOptions = data.collectionOptions.fields[field];
                if (typeof fieldOptions === 'undefined') {
                    return;
                }
                const mdbField = props.mdb.types[fieldOptions.type];
                if (typeof mdbField === 'undefined') {
                    logger.error(`Field type ${fieldOptions.type} not loaded`);
                    return;
                }
                ///TODO How is forms etc going to work
                if (!parts || !parts.length) {
                    return {
                        valueOf: () => mdbField.value(field, fieldOptions, item),
                        label: fieldOptions.label,
                        // TODO Goto field to get value?
                        value: item[field]
                    };
                }
                else {
                    // Get sub field
                    if (parts[0] === 'label') {
                        return fieldOptions.label;
                    }
                    else if (parts[0] === 'value') {
                        return item[field];
                    }
                }
            };
            if (!parts || !parts.length) {
                let checker = (newParts, newReference) => checkField(newParts, newReference);
                checker.valueOf = () => JSON.parse(JSON.stringify(data.data.items));
                return checker;
            }
            else {
                return checkField(parts);
            }
        };
        if (parts && parts.length) {
            //logger('checkItems', 'debug', 'Checking if first part is a parameters object', parts.slice());
            // Check if first part is parameters
            if (typeof parts[0] === 'object'
                && typeof parts[0].parameters !== 'undefined') {
                // Find the subscription with the same parameters
                const parameters = parts.shift().parameters;
                //TODO Checking
                if (!subscription) {
                    Object.assign(request, parameters);
                }
                //logger('checkItems', 'debug', 'And it is. parts is now', parts)
            }
        }
        if (!parts || !parts.length) {
            //logger('checkItems', 'debug', 'got no more parts');
            let checker = (newParts, newReference) => checkItems(newParts, newReference, request);
            if (results) {
                const items = results.map((id, index) => {
                    let itemChecker = (newParts) => checkItem(index, newParts);
                    itemChecker.valueOf = () => id;
                    return itemChecker;
                });
                checker[Symbol.iterator] = items[Symbol.iterator].bind(items);
                checker.valueOf = () => JSON.parse(JSON.stringify(results.map((id) => data.data.items[id])));
            }
            else {
                //logger.debug('no data yet, so given fake resolver');
                let fakeItemChecker = (newParts) => checkItem(null, newParts);
                fakeItemChecker.valueOf = () => null;
                const items = [fakeItemChecker];
                checker[Symbol.iterator] = items[Symbol.iterator].bind(items);
                checker.valueOf = () => null;
            }
            return checker;
        }
        if (parts[0] === 'status') {
            return null;
        }
        const id = Number(parts[0]);
        if (isNaN(id)) {
            logger.error(`Bad index (${parts[0]} ${typeof parts[0]}) accessing item in ${dataId}`);
            return;
        }
        return checkItem(id, parts.slice(1));
    };
    /**
     * Checks that the data requested has been downloaded and requests the data
     * if it has not already been downloaded
     *
     * @param parts Path to data to check for
     * @param reference Reference object to check
     * @param request Request to use for requesting the data
     *
     *
     * @returns A sub resolver if path can be furthered resolved, or null
     */
    const check = (parts, reference, request) => {
        if (typeof reference._request === 'undefined') {
            if (typeof request === 'undefined') {
                //logger('check', 'debug', 'creating a new request object for', reference);
                request = {
                    references: [reference],
                    options: {}
                };
                requests.push(request);
            }
            else {
                request.references.push(reference);
            }
        }
        if (!parts || !parts.length) {
            return (newParts, newReference) => check(newParts, newReference, request);
        }
        const type = parts.shift();
        if (type === 'collection' || type === 'fields') {
            if (typeof reference._request === 'undefined'
                && needCollectionOptions.indexOf(reference) === -1) {
                needCollectionOptions.push(reference);
            }
            return null;
        }
        switch (type) {
            case 'items':
                return checkItems(parts, reference, request);
            case 'status':
                return null;
        }
    };
    /**
     * Submits the requests for data once all the checks of paths have been
     * completed
     */
    const finishCheck = () => {
        let subscriptions = [];
        // Collate requested data
        const validRequests = requests.reduce((acc, request) => {
            if (typeof request.options.fields !== 'undefined' && request.options.fields.length) {
                acc.push(request);
            }
            return acc;
        }, []);
        //logger.debug('finishCheck called with the collected requests', 'all:', requests, 'valid:', validRequests, 'needCollectionOptions:', needCollectionOptions);
        let collectionOptionsRequested = false;
        if (validRequests.length) {
            validRequests.forEach((request) => {
                // Check a subscription for the data in the request has not already been submitted
                if (typeof data.subscriptions !== 'undefined') {
                    const currentSubscription = data.subscriptions.find((subscription) => {
                        //logger.debug('checking if requests match', request, subscription.request);
                        // Check subscription fields
                        if (request.options.fields && subscription.request.options.fields) {
                            if (!utils_1.containSameValues(subscription.request.options.fields, request.options.fields)) {
                                return;
                            }
                        }
                        else if (request.options.fields || subscription.request.options.fields) {
                            return;
                        }
                        // Check subscription filter
                        if (request.filter && subscription.request.filter) {
                            //TODO
                        }
                        else if (request.filter || subscription.request.filter) {
                            return;
                        }
                        return true;
                    });
                    if (currentSubscription) {
                        //logger.debug('last one matched');
                        return;
                    }
                }
                //logger.debug('Building a subscription for request', request);
                let options = {
                    collection: data.collection,
                    options: Object.assign({}, data.options, request.options)
                };
                delete options.options.filter;
                // Add filter
                if (request.filter && data.filter) {
                    options.filter = { $and: [
                            request.filter,
                            data.filter
                        ] };
                }
                else if (request.filter || data.filter) {
                    options.filter = request.filter || data.filter;
                }
                // TODO Add to the fastest request?
                if (!collectionOptionsRequested && needCollectionOptions.length) {
                    options.collectionOptions = true;
                    // Add references that need the collectionOptions to references for this request
                    request.references.push.apply(request.references, needCollectionOptions);
                    collectionOptionsRequested = true;
                    needCollectionOptions = [];
                }
                let subscriptionId;
                const separateResults = Object.keys(request).length > 1
                    || (Object.keys(request).length === 1
                        && typeof request.options.fields === 'undefined');
                const handler = (error, data) => {
                    let actionData, subscriptionData;
                    if (error) {
                        //TODO
                        logger.error('Received an error requesting data', error);
                        if (separateResults) {
                            actionData = {};
                            subscriptionData = {
                                error,
                                status: "error" /* ERROR */
                            };
                        }
                        else {
                            actionData = {
                                error
                            };
                            subscriptionData = {
                                status: "error" /* ERROR */
                            };
                        }
                    }
                    else {
                        // Map out results to results and data
                        let results = [], items = {};
                        if (data.results) {
                            data.results.forEach((item) => {
                                results.push(item._id);
                                items[item._id] = item;
                            });
                        }
                        // 
                        /**
                         * TODO Need to be able to handle the status and batch downloads
                         * - need to set the status accordingly (just loaded?)
                         * Also need to be able to handle data updates - check if data
                         * is already in the data.items with different values, mark it
                         * as an update
                         */
                        //Result array should go into the subscription if the request is
                        if (separateResults) {
                            actionData = {
                                data: {
                                    items
                                }
                            };
                            subscriptionData = {
                                id: subscriptionId,
                                results: results
                            };
                        }
                        else {
                            actionData = {
                                data: {
                                    results,
                                    items,
                                }
                            };
                            subscriptionData = {
                                id: subscriptionId
                            };
                        }
                        /* TODO
                        if request has parameters other than just fields, the results array
                        should go into the subscription object
                        This should also update the status of the subscription with the
                        data inside of actionData
                        Need to think about how we are going to handle  data updates
                          Maybe have another action for data updates that pushes the
                          update to an update array or something
                        */
                        if (data.collectionOptions) {
                            actionData.collectionOptions = data.collectionOptions;
                        }
                    }
                    props.dispatch(view_1.updateData(path, actionData, subscriptionData));
                };
                subscriptionId = props.mdb.server.subscribe('data', options, handler);
                /* Add the subscription ID to the references accessing the data to be
                 * requested
                 */
                request.references.forEach((reference) => {
                    reference._request = subscriptionId;
                    if (separateResults) {
                        reference._separateResults = true;
                    }
                });
                subscriptions.push({
                    collectionOptions: options.collectionOptions,
                    request,
                    id: subscriptionId,
                    status: "loading" /* LOADING */
                });
            });
        }
        if (needCollectionOptions && !collectionOptionsRequested) {
            // Check a subscription has not already been submitted
            if (data.subscriptions && typeof data.subscriptions.find((subscription) => subscription.collectionOptions) === 'undefined') {
                //logger.debug('add subscription for collectionOptions');
                let subscriptionId;
                const handler = (error, data) => {
                    props.dispatch(view_1.updateData(path, {
                        collectionOptions: data
                    }, subscriptionId));
                };
                subscriptionId = props.mdb.server.subscribe('collection', {
                    collection: data.collection
                }, handler);
                needCollectionOptions.forEach((reference) => {
                    reference._request = subscriptionId;
                });
                subscriptions.push({
                    collectionOptions: true,
                    id: subscriptionId,
                    status: "loading" /* LOADING */
                });
            }
        }
        if (subscriptions.length) {
            // Store the requests
            props.dispatch(view_1.updateData(path, {
                subscriptions
            }));
        }
    };
    return {
        check,
        resolve,
        finishCheck
    };
};
/*XXX
      case 'data': // Collection data
        // Check if the requested data is available
        if (!state.data) {
          // Request data
          requests.push({
            type: 'data',
            properties,
            options: parameters
          });
          return null;
        } else {
          if (!path.length) {
            // return an resolve function to resolve further
            return
          }

          // select item
          const index = path.shift();

          const id = state.sortMap[index];

          if (typeof id === 'undefined') {
            return;
          }

          const item = state.data[id];

          if (!path.length) {
            // return row resolver
            return
          }

          // Resolve field with collection of fields gathered from called
          // <type>.fields()

          // select field in item
          const field = path.shift();

          // Check if field is in collection
          if (typeof state.collectionOptions.fields[field] === 'undefined') {
            return;
          }

          if (!path.length) {
            // return field resolver
            return
          }
          
          // If it
        }
        break;
      default:
        return;
    }
  };



  return {
    fields,
    resolve
  };
}
*/
//# sourceMappingURL=moltendb.js.map