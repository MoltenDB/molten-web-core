const Immutable = require('immutable');
import initStore from './store';

//type GetType = "path" | "view";

interface Request {
  id: number,
  subRequests?: number[]
};

const createServer = (moltendb) => {
  let requests = {};
  let nextRequestID = 1;
  let paths = initStore('paths');
  let views = initStore('views');
  let tables = initStore('tables');
  let items = initStore('items');

  let subscriptions = {
    paths: {},
    views: {},
    data: {}
  };

  let socket;

  /**
   * Request data
   *
   * @param {GetType} type Type of data to retrieve
   * @param {*} filter Filter for filtering the data
   * @param {Function|Array} [callback] Callback function to run when data is
   *   retrieved or the retrieval fails. 
   * @param {boolean} subscribe Whether to subscribe to the data
   * @param {number} parentRequestID RequestID of a parent request.
   *
   * @returns {Promise|number} If a callback is given, a request id will be
   *   returned. Otherwise a promise that will resolve to the requested data
   *   once that data has been retrieved will be returned.
   */
  const get = (type: string, filter: any,
      callback?: Array | ((error: Error, data: any) => any),
      subscribe?: boolean, parentRequestID?: number): number | Promise => {

    console.log('get called', callback, parentRequestID);

    if (callback) {
      if (typeof subscribe !== 'boolean') {
        subscribe = true;
      }
    }

    if (callback instanceof Array && typeof parentRequestID === 'undefined') {
      throw new Error('parentRequestID must be given with a keyPath');
    }

    if (subscribe
        || (typeof parentRequestID !== 'undefined' && callback instanceof Array)) {
      subscribe = nextRequestID++;
    }

    if (typeof parentRequestID !== 'undefined' && callback instanceof Array) {
      processGet(type, filter, callback, null, subscribe, parentRequestID);
    } else if (typeof callback === 'function') {
      processGet(type, filter, (data) => { callback(undefined, data); },
          (error) => { callback(error); }, subscribe, parentRequestID);
    } else {
      return new Promise((fulfil, reject) => {
        processGet(type, filter, fulfil, reject);
      });
    }

    return subscribe;
  };

  /**@internal
   * Validates the get query and then initiates the retrieval of the data as
   * required
   *
   * @param {GetType} type Type of data to retrieve
   * @param {*} filter Filter for filtering the data
   * @param {Function | Request} success Function to call on successful
   *   retrieval or previous requestID to make this request a child of
   * @param {Function} [failure] Function to call on failure
   * @param {number} [requestID] Request ID for the new request. If set will
   *   subscribe to the data
   */
  const processGet = (type: GetType, filter: any,
      success: null | Function | number, failure?: null | Function,
      requestID?: number, parentRequestID?: number): number | Promise => {
    console.log('processGet', type, filter, success, requestID, parentRequestID);
    let request,
        parentRequest;

    const subscribe = Boolean(requestID);

    switch (type) {
      case 'path':
        if (typeof filter !== 'string') {
          failure(new Error('Path filter must be a string'));
          return;
        }
        break;
    }

    if (typeof success === 'number' || parentRequestID) {
      parentRequestID = (typeof success === 'number' ? success : parentRequestID)
      parentRequest = requests[parentRequestID];
      if (typeof parentRequest === 'undefined') {
        return;
      }
    }

    if (!requestID) {
      requestID = nextRequestID++;
    }

    if (parentRequest) {
      request = {
        id: requestID,
        parentRequest: parentRequestID,
        success: (typeof success === 'function' ? success : undefined),
        failure: (typeof failure === 'function' ? failure : undefined),
        subscribe,
        type,
        filter
      };

      // Add request to parent request
      if (typeof parentRequest.childRequests === 'undefined') {
        parentRequest.childRequests = [];
      }

      parentRequest.childRequests.push(requestID);
    } else {
      // Create new request object
      request = {
        id: requestID,
        success,
        failure,
        subscribe,
        type,
        filter
      };
    }

    let store;
    switch (type) {
      case 'path':
        store = paths;
        break;
    }

    console.log('checking cache');
    store.get(filter).then((value) => {
      console.log('got value', value);
      if (typeof value === 'undefined') {
        sendQuery(request);
      } else {
        if (value === null) {
          // return undefiend
          request.success();
        } else {
          prepareView(paths[filter], request);

          if (request.subscribe) {
            request.lastUpdate = value.updated;
          }
        }

        if (request.subscribe) {
          sendQuery(request);
        }
      }
    });
  };

  /**@internal
   * Send query to server
   *
   * @param {Request} request Request to send to server
   */
  const sendQuery = (request: Request) => {
    console.log('sendQuery called', request);
    requests[request.id] =  request;
    socket.emit('web:query', {
      id: request.id,
      type: request.type,
      filter: request.filter
    });
  }


  const receiveData = (data: Object) => {
    console.log('receiveData called', data);
    // TODO Check security token
    if (typeof data.id === 'undefined') {
      return;
    }

    console.log('here');
    if (data.error) {
      request.failure(data.error);
      return;
    }

    const parts = {
      paths,
      views,
      tables,
      items
    };

    // Store for future use
    for (const part in parts) {
      // Process data
      if (typeof data[part] === 'object') {
        for (const key in data[part]) {
          if (data[part][key] !== null) {
            parts[part].set(key, data[part][key]);

            //TODO Subscriptions
          }
        }
      }
    }

    // TODO Map out paths from views
    console.log('looking for ', data.id, 'in', requests);

    const request = requests[data.id];
    if (typeof request === 'undefined') {
      return;
    }

    let value;

    console.log('stored data', data);
    switch (request.type) {
      case 'path':
        if (data.paths[request.filter]) {
          console.log('path');
          if (request.raw) {
            request.success(data.paths[request.filter]);

            if (!request.subscribe) {
              delete requests[request.id];
            }
          } else {
            const view = data.views[data.paths[request.filter]];
            if (typeof view !== 'undefined') {
              prepareView(view, request);
            }
          }
        }
        break;
      case 'view':
        if (data.views[request.filter]) {
          if (request.raw) {
            request.success(data.views[request.filter]);

            if (!request.subscribe) {
              delete requests[request.id];
            }
          } else {
            prepareView(data.views[request.filter], request);
          }
        }
        break;
    }
  };

  /**
   * Prepare view
   */
  const prepareView = (view, request, views) => {
    console.log('previewView called', view, request);
    view = Immutable.fromJS(view);

    // Get template
    const template = view.template;
    if (template) {
      if (typeof views !== 'undefined'
          && typeof views[template] !== 'undefined') {
        view.set('templateView', Immutable.fromJS(views[template]));
      }
    }

    // Get data
    const data = view.data;
    if (data) {
      for (const key in data) {
        switch (data[key].type) {
          case 'moltendb':
        }
      }
    }

    // Response
    console.log('sending view to success callback');
    request.success(view);
  };

  /**
   * Unsubscribe to receiving data for a request
   *
   * @param {number} requestID ID of request to unsubscribe
   * @param {boolean} unsubscribeChildren If true, unsubscribe all children
   *   of the given request
   */
  const unsubscribe = (requestID: number, unsubscribeChildren: boolean = true) => {
  };

  if (moltendb.options.socket) {
    socket = moltendb.options.socket;
  } else {
    const io = require('socket.io-client');

    // Setup socket
    socket = io.connect(moltendb.options.sockAddress || window.location.origin);
  }

  socket.on('web:data', receiveData);

  return <ServerInstance>{
    get,
    unsubscribe
  };
}

export default createServer;
