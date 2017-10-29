import * as MDBWeb from '../typings/mdb-web';

export const serverViaWorker = (instance: MDBWeb.Instance, worker: Worker): MDBWeb.ServerInstance => {
  const logger = instance.logger.id('serverViaWorker');

  /// Next subscription ID
  let nextId = 1;
  /// Subscriptions
  let subscriptions = {};

  const removeSubscription = (id: number) {
    if (typeof subscriptions[id] !== 'undefined') {
      delete subscriptions[id];
    }
  };

  const messageHandler = (event) => {
    if (event.data) {
      switch (event.data.type) {
        case 'update':
          const data = event.data.data;

          // Check the subscription is still valid
          if (typeof subscriptions[data.id] === 'undefined') {
            return;
          }

          subscriptions.subscriber(data.data);
          break;
      }
    } else {
      logger.error('Received a message with no 
  };

  const errorHandler = (event) => {
    logger.error('Worker errored', event);
  };

  // Set up listeners on worker
  worker.addEventListener('message', (

  return {
    subscribe: (type, options, subscriber) => {
      const id = nextId++;

      subscriptions[id] = {
        type,
        options,
        subscriber
      };

      // Send request to the worker
      worker.postMessage({
        type: 'subscribe',
        data: {
          id,
          type,
          options
        }
      });
    },
    unsubscribe: (id) => {
      // Remove the subscription
      if (id instanceof Array) {
        id.forEach(removeSubscription);
      } else {
        removeSubscription(id);
      }
    }
  };
};
export default serverViaWorker;
