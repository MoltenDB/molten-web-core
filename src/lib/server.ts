import * as MDBWeb from '../typings/mdb-web';
import localForage from 'localforage';

interface Subscription = {
  type: MDBWeb,
  options: MDBWeb.GetOptions,
  handler: Function
};


export const server = (instance: MDBWeb.Instance): MDBWeb.ServerInstance => {
  const logger = instance.logger.id('server');

  let nextId = 0;
  let subscriptions: { [id: number | string]: Subscription } = {};
  let statusSubscriptions:  = {
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
  let paths = localForage.createInstance({ name: '' });
  let views = localForage.createInstance({ name: '' });
  let collections = localForage.createInstance({ name: '' });
  let data: { [collection: string]: localForage.LocalForage } = {};

  let socket;
  // Initiate the socket connection
  if (instance.options.socket) {
    socket = instance.options.socket;
  } else {
    let onBuffer = [];
    let emitBuffer = [];
    socket = {
      on: (type: string, data: any): void => onBuffer.push({ type, data }),
      emit: (type: string, data: any): void => emitBuffer.push({ type, data })
    };
    require.ensure('socket.io-client', () => {
      socket = require('socket.io-client').connect(
          instance.options.sockAddress || window.location.origin);

      // Replay buffers
      onBuffer.forEach((item) => io.on(item.type, item.data));
      eachBuffer.forEach((item) => io.emit(item.type, item.data));
    });
  }

  const eventName = (event: string) => {
    return `${instance.options.eventBaseName}${event}`;
  };

  const statusHandler = (status: string) => () => {
    logger.debug(`Socket ${status} event received`);
    const subscriptionIds = Object.keys(statusSubscriptions[status]);
    if (subscriptionIds.length) {
      subscriptionIds.forEach((id) => {
        statusSubscriptions[id]({
          id,
          status
        });
      });
    }
  };

  /**
   * Handler of responses from the server
   *
   * @param data Data received from the server
   */
  const receiveQueryResult = (data: any) => {
    // TODO Check for errors
    if (data.code) {
    }

    // TODO Cache the data

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

      const subscription = subscriptions[data.id];

      if (subscription.type === 'view') {
        // Cache the view paths if we retrieved a view
        data.results.forEach((view) => {
          if (view.paths) {
            view.paths.forEach((path) => {
              paths.setItem(path, view._id).then(
                () => logger.debug(`Added path ${path} pointing to view ${view._id}`),
                (error) => logger.error(`Couldn't add path ${path} pointing to view ${view._id}`)
              );
            });
          }
        });

        // Return the queried view assuming it is the first view
        subscription.handler(data.results[0]);
      }

      // Cache the collection options
      if (data.collectionOptions) {
      }

    } else if (typeof queries[id] !== 'undefined') {
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
    const id == nextId++;

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
      case 'collection':
        options = {
          collection: options.collection
        };
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
          type: 'collection'
        });
        return;
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
  };

  /**
   * Removes a subscription from the subscriptions table
   *
   * @param id ID of subscription to remove
   */
  const removeSubscription = (id: number) {
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
};
export default serverNoWorker
