"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types = require("../components/types/index");
const expressions = require("../components/expressions/index");
const dataHandlers = require("./dataHandlers/index");
const components = require("../components/components/index");
const functionLibraries = require("./functionLibraries/index");
const logger_1 = require("molten-web/lib/logger");
/**
 * The MoltenDB React client app main module.
 * This sets up:
 * - a worker (if available and allowed) for MoltenDB to use
 * - the connection back to the MoltenDB server
 * - the logger to use across the MoltenDB React components
 *
 * There should be one module instance per MoltenDB server being connected to
 * as it will increase the use of shared data, and decrease the amount of
 * requests being sent to the server and data being sent back by the server.
 *
 * It being separate from the MoltenDB React component allows it to be used
 * across multiple MoltenDB React components.
 *
 * @param options Options to create the module instance with
 */
exports.MoltenDB = (options) => {
    options = Object.assign({
        cacheName: 'MDBReact'
    }, options);
    let instance = {
        options,
        logger: null,
        server: null,
        types: Object.assign(Object.keys(types).reduce((map, key) => {
            const type = types[key];
            map[type.id || key] = type;
            return map;
        }, {}), options.types),
        components: Object.assign(Object.keys(components).reduce((map, key) => {
            const component = components[key];
            map[component.id || key] = component;
            return map;
        }, {}), options.components),
        expressions: Object.assign(Object.keys(expressions).reduce((map, key) => {
            const expression = expressions[key];
            map[expression.id] = expression;
            return map;
        }, {}), options.expressions),
        dataHandlers: Object.assign(Object.keys(dataHandlers).reduce((map, key) => {
            const dataHandler = dataHandlers[key];
            map[dataHandler.id] = dataHandler;
            return map;
        }, {}), options.dataHandlers),
        functionLibraries: Object.assign(Object.keys(functionLibraries).reduce((map, key) => {
            const functionLibrary = functionLibrarys[key];
            map[functionLibrary.id] = functionLibrary;
            return map;
        }, {}), options.functionLibraries)
    };
    if (options.logger) {
        if (options.logger.id) {
            instance.logger = options.logger;
        }
        else {
            instance.logger = logger_1.attachId(options.logger);
        }
    }
    else {
        instance.logger = logger_1.attachId(console, true);
    }
    instance.logger('MoltenDB', 'debug', 'instance is', instance);
    return new Promise((resolve, reject) => {
        let worker;
        let messageReceived = false;
        try {
            if (!options.noWorker && window.Worker) {
                /**
                 * Handles any initial errors when starting the worker and disables the use
                 * of a worker if errors are encountered
                 *
                 * @this MoltenDBInstance
                 *
                 * @param err Worker error
                 */
                const workerError = (err) => {
                    console.log('workerError called', err);
                    if (!messageReceived) {
                        messageReceived = true;
                        worker.removeEventListener('error', workerError);
                        worker.removeEventListener('message', workerMessage);
                        if (worker.terminate) {
                            worker.terminate();
                        }
                        resolve(false);
                    }
                };
                /**
                 * Handles the initial message from the worker symbolising the worker has
                 * been set up correctly.
                 *
                 * @this MoltenDBInstance
                 *
                 * @param event Worker event received
                 */
                const workerMessage = (event) => {
                    console.log('workerMessage called');
                    if (!messageReceived) {
                        messageReceived = true;
                        // Remove event listeners
                        worker.removeEventListener('error', workerError);
                        worker.removeEventListener('message', workerMessage);
                        resolve(worker);
                    }
                };
                // TODO Change to document root so worker can always be accessed
                worker = new Worker('worker.js');
                worker.addEventListener('error', workerError);
                worker.addEventListener('message', workerMessage);
            }
            else {
                resolve(false);
            }
        }
        catch (err) {
            reject(err);
        }
    }).then((worker) => {
        return new Promise((resolve, reject) => {
            if (worker) {
                require.ensure('../lib/serverViaWorker', () => {
                    resolve(require('../lib/serverViaWorker').default(instance, worker));
                });
            }
            else {
                require.ensure('../lib/server', () => {
                    require('../lib/server').default(instance).then(resolve, reject);
                });
            }
        });
    }).then((server) => {
        instance.server = server;
        return instance;
    });
};
exports.default = exports.MoltenDB;
//# sourceMappingURL=moltendb.js.map