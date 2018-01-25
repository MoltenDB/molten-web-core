"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_store_1 = require("browser-store");
const events_1 = require("molten-web/events");
const tree_of_values_1 = require("tree-of-values");
;
exports.server = (instance) => {
    const logger = instance.logger.id('MDB server', '#ce0505');
    let nextId = 0;
    let subscriptions = {};
    let requests = {};
    let statusSubscriptions = {
        connect: {},
        'connect_error': {},
        'connect_timeout': {},
        reconnect: {},
        'reconnect_attempt': {},
        reconnecting: {},
        'reconnect_error': {},
        'reconnect_failed': {}
    };
    let paths, views, collections;
    // Create system databases
    return Promise.all([
        browser_store_1.default('views', {
            database: instance.options.cacheName,
            keyPath: '_id'
        }),
        browser_store_1.default('collections', {
            database: instance.options.cacheName,
            keyPath: '_id'
        })
    ]).then(([viewsStore, collectionsStore]) => {
        views = viewsStore;
        collections = collectionsStore;
        paths = tree_of_values_1.default({
            parameterSeparator: ':'
        });
        // Get the views from the cache to cache the paths
        return views.get();
    }).then((cachedViews) => {
        console.log(cachedViews);
        logger.debug(`Getting paths from cached views ${Object.keys(cachedViews).join(', ')}`);
        Object.keys(cachedViews).forEach((viewId) => {
            const view = cachedViews[viewId];
            if (view.paths) {
                paths.addPath(view.paths, view._id);
                /*TODO view.paths.forEach((path) => {
                  paths.addPath(path, view._id);
                });*/
            }
        });
    }).then(() => {
        let data = {};
        let socket;
        // Initiate the socket connection
        if (instance.options.socket) {
            socket = instance.options.socket;
        }
        else {
            let onBuffer = [];
            let emitBuffer = [];
            socket = {
                on: (type, data) => {
                    logger.debug(`adding on ${type} handler to buffer`);
                    onBuffer.push({ type, data });
                },
                emit: (type, data) => {
                    logger.debug(`Adding ${type} event to buffer`, data);
                    emitBuffer.push({ type, data });
                }
            };
            require.ensure('socket.io-client', () => {
                logger.debug('Trying to attach to socket', instance.options.sockAddress || window.location.origin, instance.options.socketPath);
                socket = require('socket.io-client').connect(instance.options.sockAddress || window.location.origin, {});
                // Replay buffers
                onBuffer.forEach((item) => {
                    logger.debug(`Adding ${item.type} handler to socket`);
                    socket.on(item.type, item.data);
                });
                emitBuffer.forEach((item) => {
                    logger.debug(`Emitting ${item.type} event from buffer`, item);
                    socket.emit(item.type, item.data);
                });
            });
        }
        const eventName = (event) => {
            return `${instance.options.eventBaseName || ''}${event}`;
        };
        const statusHandler = (status) => (data) => {
            logger.debug(`Socket ${status} event received`, data);
            const subscriptionIds = Object.keys(statusSubscriptions[status]);
            if (subscriptionIds.length) {
                let handlerData = {
                    id,
                    status
                };
                switch (status) {
                    case 'reconnect_attempt':
                    case 'reconnecting':
                        data.data = {
                            attempt: data
                        };
                        break;
                    case 'reconnecting_error':
                    case 'connect_error':
                        data.data = {
                            error: data
                        };
                        break;
                }
                subscriptionIds.forEach((id) => {
                    statusSubscriptions[id](handlerData);
                });
            }
        };
        /**
         * Handler of responses from the server
         *
         * @param data Data received from the server
         */
        const receiveQueryResult = (data) => {
            logger('receiveQueryResult', 'debug', 'Received query result', data);
            let request;
            let isSubscription = false;
            // Find the handler
            if (typeof subscriptions[data.id] !== 'undefined') {
                isSubscription = true;
                request = subscriptions[data.id];
            }
            else if (typeof requests[data.id] !== 'undefined') {
                request = requests[data.id];
            }
            else {
                return;
            }
            // TODO Check for errors
            if (data.code && data.code !== 200) {
                logger('receiveQueryResult', 'error', `Got ${data.code} error for request`);
                logger('receiveQueryResult', 'debug', 'Errored request is:', request);
                request.handler({
                    code: data.code,
                    error: data.error
                });
                // TODO Handle error
                if (!isSubscription) {
                    delete requests[data.id];
                }
                return;
            }
            // TODO Cache the data
            // Extract paths from views and add to tree
            if (request.type === 'path'
                || request.type === 'view' && request.collection === instance.options.viewCollection) {
                // Cache the view paths if we retrieved a view
                data.results.forEach((view) => {
                    // Check if view is already cached (and if paths old, removed paths will need to be removed
                    views.get(view._id).then((results) => {
                        if (typeof results === 'undefined') {
                            return;
                        }
                        let oldView = results[view._id];
                        if (typeof oldview !== 'undefined') {
                            // Go through all view paths and remove any old paths
                            if (oldView.paths) {
                                if (!view.paths || view.paths !== oldView.paths) {
                                    paths.removePath(view.paths);
                                }
                                /*TODO oldView.paths.forEach((path) => {
                                  if (!view.paths || view.paths.indexOf(path) === -1) {
                                    paths.removePath(path);
                                  }
                                });*/
                            }
                        }
                    }, (error) => logger('receiveQueryResult', 'error', 'Error trying to retrieve cached view with same id. May lead to stale paths'));
                    // Add paths to tree
                    if (view.paths) {
                        paths.addPath(view.paths, view._id);
                        /*TODO view.paths.forEach((path) => {
                          paths.addPath(path, view._id);
                        });*/
                    }
                    // Cache view
                    //TODO Enable caching views.update(view);
                });
            }
            // Cache the collection options
            if (data.collectionOptions) {
                /*TODO Enable caching collections.update(data.collectionOptions).catch((error) => {
                  logger('receiveQueryResult', 'error', `Error caching collection options for ${request.collection}`, error);
                });*/
            }
            switch (request.type) {
                case 'path':
                    request.handler(null, data.results[0]);
                    break;
                case 'collection':
                    request.handler(null, data.collectionOptions);
                    break;
                default:
                    request.handler(null, {
                        results: data.results,
                        collectionOptions: data.collectionOptions
                    });
                    break;
            }
            if (!isSubscription) {
                delete requests[data.id];
            }
        };
        // Add status handlers
        socket.on('connect', statusHandler('connect'));
        socket.on('connect_error', statusHandler('connect_error'));
        socket.on('connect_timeout', statusHandler('connect_timeout'));
        socket.on('reconnect', statusHandler('reconnect'));
        socket.on('reconnect_attempt', statusHandler('reconnect_attempt'));
        socket.on('reconnecting', statusHandler('reconnecting'));
        socket.on('reconnect_error', statusHandler('reconnect_error'));
        socket.on('reconnect_failed', statusHandler('reconnect_failed'));
        // Add event handlers
        socket.on(eventName('result'), receiveQueryResult);
        const subscribe = (type, options, handler) => {
            const id = nextId++;
            logger('subscribe', 'debug', `Got a new ${type} subscription request`, options);
            switch (type) {
                case 'serverStatus':
                    if (options && options.types) {
                        options.types.forEach((status) => {
                            if (statusSubscriptions[status]) {
                                statusSubscriptions[status][id] = handler;
                            }
                        });
                    }
                    else {
                        Object.keys(statusSubscriptions).forEach((status) => statusSubscriptions[status][id] = handler);
                    }
                    return id;
                case 'path':
                    subscriptions[id] = {
                        type,
                        options: {
                            path: options.path
                        },
                        handler
                    };
                    // Check if the path is in the tree
                    const pathViewResult = paths.resolve(options.path);
                    logger('subscribe', 'debug', `Path tree lookup result is`, pathViewResult);
                    if (typeof pathViewResult !== 'undefined') {
                        const { value, parameters } = pathViewResult;
                        // Try and get view from cache
                        logger('subscribe', 'debug', `Trying to get the view ${value} from the cache`);
                        views.get(value).then((results) => {
                            logger('subscribe', 'debug', 'Results are', results);
                            if (typeof results[value] !== 'undefined') {
                                logger('subscribe', 'debug', `Got view for path ${options.path} from cache`);
                                handler(null, results[value]);
                            }
                            else {
                                // Request from server
                                logger('subscribe', 'debug', `emitting ${events_1.pathQueryEvent} to server`);
                                // Add subscription
                                socket.emit(eventName(events_1.pathQueryEvent), {
                                    id,
                                    path: options.path
                                });
                            }
                        });
                    }
                    else {
                        logger('subscribe', 'debug', `emitting ${events_1.pathQueryEvent} to server`);
                        // Add subscription
                        socket.emit(eventName(events_1.pathQueryEvent), {
                            id,
                            path: options.path
                        });
                    }
                    return id;
                case 'collection':
                    subscriptions[id] = {
                        type,
                        options: {
                            collection: options.collection
                        },
                        handler
                    };
                    // Send request to server
                    // TODO Add option for subscription
                    socket.emit(eventName('query'), {
                        collection: options.collection,
                        id,
                        type: 'collection'
                    });
                    return id;
                case 'view':
                    options = {
                        collection: instance.options.viewCollection,
                        filter: options
                    };
                    subscriptions[id] = {
                        type,
                        options,
                        handler
                    };
                    // Check cache for view
                    //TODO Need to handle the filter differently if it is not just an ID
                    logger('subscribe', 'debug', 'Trying to get the view(s) using filter from the cache', options.filter);
                    views.get(options.filter).then((results) => {
                        logger('subscribe', 'debug', 'Results are', results);
                        if (typeof results !== 'undefined') {
                            logger('subscribe', 'debug', 'Got view(s) from cache');
                            handler(null, results);
                        }
                        else {
                            // Request from server
                            logger('subscribe', 'debug', 'emitting read to server');
                            // Add subscription
                            socket.emit(eventName('query'), Object.assign({}, options, { id: id, type: 'read' }));
                        }
                    });
                    return id;
                case 'data':
            }
            subscriptions[id] = {
                type,
                options,
                handler
            };
            logger('subscribe', 'debug', `emitting query to server`, Object.assign({}, options, { id: id, type: 'read' }));
            // Send request to server
            // TODO Add option for subscription
            socket.emit(eventName('query'), Object.assign({}, options, { id: id, type: 'read' }));
            return id;
        };
        /**
         * Removes a subscription from the subscriptions table
         *
         * @param id ID of subscription to remove
         */
        const removeSubscription = (id) => {
            if (typeof subscriptions[id] !== 'undefined') {
                delete subscriptions[id];
            }
        };
        const unsubscribe = (id) => {
            if (id instanceof Array) {
                id.forEach(removeSubscription);
            }
            else {
                removeSubscription(id);
            }
        };
        return {
            subscribe,
            unsubscribe
        };
    });
};
exports.default = exports.server;
//# sourceMappingURL=server.js.map