import * as MDBWeb from '../../typings/client';
import * as BrowserStore from 'browser-store'

import createBrowserStore from 'browser-store';
import { pathQueryEvent } from 'molten-web/events';
import createTree from 'tree-of-values';

interface Request {
  type: MDBWeb,
  options: MDBWeb.GetOptions,
  handler(error?: MDBWeb.Error, data?: any) => void
};

export const server = (instance: MDBWeb.Instance): Promise<MDBWeb.ServerInstance> => {
  const logger = instance.logger.id('MDB server', '#ce0505');

  let nextId = 0;
  let subscriptions: { [id: number | string]: Request } = {};
  let requests: { [id: number | string]: Request } = {};
  let statusSubscriptions: { [status: string]: { [id: string]: Request } } = {
    connect: {},
    'connect_error': {},
    'connect_timeout': {},
    reconnect: {},
    'reconnect_attempt': {},
    reconnecting: {},
    'reconnect_error': {},
    'reconnect_failed': {}
  };

  // Create system databases
  return Promise.all([
    createBrowserStore('views', {
      database: instance.options.cacheName,
      keyPath: '_id'
    }),
    createBrowserStore('collections', {
      database: instance.options.cacheName,
      keyPath: '_id'
    })
  ]).then(([views, collections]) => {
    let data: { [collection: string]: BrowserStore.Instance } = {};
    let paths = createTree({
      parameterSeparator: ':'
    });

    let socket;
    // Initiate the socket connection
    if (instance.options.socket) {
      socket = instance.options.socket;
    } else {
      let onBuffer = [];
      let emitBuffer = [];
      socket = {
        on: (type: string, data: any): void => {
          logger.debug(`adding on ${type} handler to buffer`);
          onBuffer.push({ type, data });
        },
        emit: (type: string, data: any): void => {
          logger.debug(`Adding ${type} event to buffer`, data);
          emitBuffer.push({ type, data });
        }
      };
      require.ensure('socket.io-client', () => {
        socket = require('socket.io-client').connect(
            instance.options.sockAddress || window.location.origin);

        // Replay buffers
        onBuffer.forEach((item) => {
          logger.debug(`Adding ${item.type} handler to socket`);
          socket.on(item.type, item.data);
        });

        emitBuffer.forEach((item) => {
          logger.debug(`Emitting ${item.type} event`);
          socket.emit(item.type, item.data)
        });
      });
    }

    const eventName = (event: string) => {
      return `${instance.options.eventBaseName || ''}${event}`;
    };

    const statusHandler = (status: string) => (data) => {
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
    const receiveQueryResult = (data: any) => {
      logger.debug('Received query result', data);

      let request;
      let isSubscription = false;

      // Find the handler
      if (typeof subscriptions[data.id] !== 'undefined') {
        isSubscription = true;
        request = subscriptions[data.id];
      } else if (typeof requests[data.id] !== 'undefined') {
        request = requests[data.id];
      } else {
        return;
      }

      // TODO Check for errors
      if (data.code && data.code !== 200) {
        logger.error(`Got ${data.code} error for request`);
        logger.debug('Errored request is:', request);
        request.handler({
          code: data.code,
          message: data.message
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
                oldView.paths.forEach((path) => {
                  if (!view.paths || view.paths.indexOf(path) === -1) {
                    paths.removePath(path);
                  }
                });
              }
            }
          },
          (error) => logger.error('Error trying to retrieve cached view with same id. May lead to stale paths'));

          // Add paths to tree
          if (view.paths) {
            view.paths.forEach((path) => {
              paths.addPath(path, view._id);
            });
          }
        });
      }

      // Cache the collection options
      if (data.collectionOptions) {
        collections.update(request.collection, data.collectionOptions).catch((error) => {
          logger.error(`Error caching collection options for ${request.collection}`, error);
        });
      }

      switch (request.type) {
        case 'path':
          request.handler(null, data.results[0]);
          break;
        case 'collection':
          request.handler(null, data.collectionOptions);
          break;
        default:
          request.handler(null, data.results);
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

    const subscribe = (type: MDBWeb.SubscriptionDataTypes,
        options: MDBWeb.GetOptions, handler: Function): number => {
      const id = nextId++;
      logger.debug(`Got a new ${type} subscription request`, options);

      switch(type) {
        case 'serverStatus':
          if (options && options.types) {
            options.types.forEach((status) => {
              if (statusSubscriptions[status]) {
                statusSubscriptions[status][id] = handler;
              }
            });
          } else {
            Object.keys(statusSubscriptions).forEach((status) =>
                statusSubscriptions[status][id] = handler);
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

          logger.debug(`emitting ${pathQueryEvent} to server`);

          socket.emit(eventName(pathQueryEvent), {
            id,
            path: options.path
          });
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
          }
          break;
        case 'data':
      }

      subscriptions[id] = {
        type,
        options,
        handler
      };

      // Send request to server
      // TODO Add option for subscription
      socket.emit(eventName('query'), {
        ...options,
        id: id,
        type: 'read'
      });

      return id;
    };

    /**
     * Removes a subscription from the subscriptions table
     *
     * @param id ID of subscription to remove
     */
    const removeSubscription = (id: number) => {
      if (typeof subscriptions[id] !== 'undefined') {
        delete subscriptions[id];
      }
    };

    const unsubscribe = (id: number | Array<number>) => {
      if (id instanceof Array) {
        id.forEach(removeSubscription);
      } else {
        removeSubscription(id);
      }
    };

    return {
      subscribe,
      unsubscribe
    };
  });
};
export default server;
