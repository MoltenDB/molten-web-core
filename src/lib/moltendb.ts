import * as MDB from 'molten-core';
import * as MDBWeb from 'molten-web';

import * as MDBReact from '../../typings/client';

import * as types from '../components/types/index';
import * as expressions from '../components/expressions/index';
import * as dataHandlers from './dataHandlers/index';
import * as components from '../components/components/index';
import * as functionLibraries from './functionLibraries/index';

import { attachId } from 'molten-web/lib/logger';

/** 
 * MoltenDB React main module instance interface
 */
export interface Instance {
  /**
   * Expression components available
   */
  expressions: { [id: string]: MDBWeb.Expression },
  /**
   * View components available
   */
  components: { [id: string]: MDBWeb.Component },
  /**
   * Type components available
   */
  types: { [id: string]: MDBWeb.Type }
  /**
   * Data handlers to include
   */
  dataHandlers: { [id: string]: MDBWeb.DataHandler },
  /**
   * Function libraries to include
   */
  functions: { [id: string]: MDBWeb.FunctionLibrary },
  /**
   * Interface for communicating with MoltenDB server
   */
  server: MDB.ServerInstance,
  /**
   * Options passed to MoltenDB instance
   */
  options: MDB.Options,
  /**
   * Logger to use for logging to a common place
   */
  logger: MDB.Logger
}

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
export const MoltenDB = (options: MDBReact.Options): Promise<MDBReact.Instance> => {
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
    } else {
      instance.logger = attachId(options.logger);
    }
  } else {
    instance.logger = attachId(console, true);
  }

  instance.logger('MoltenDB', 'debug', 'instance is', instance);

  return new Promise((resolve, reject) => {
    let worker: Worker;
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
      } else {
        resolve(false);
      }
    } catch (err) {
      reject(err);
    }
  }).then((worker) => {
    return new Promise((resolve, reject) => {
      if (worker) {
        require.ensure('../lib/serverViaWorker', () => {
          resolve(require('../lib/serverViaWorker').default(instance, worker))
        });
      } else {
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
export default MoltenDB;
