const Immutable = require('immutable');
import initStore from './store';

//type GetType = "path" | "view";

interface Request {
  id: number,
  subRequests?: number[]
};

type KeyPath = string[];

type DataUpdates = {
  keyPath: string[],
  data: any
}[];

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

  const validateRequest = (type, filter) => {
    switch (type) {
      case 'path':
        if (typeof filter !== 'string') {
          return new Error('Path filter must be a string');
        }
        break;
    }
  };

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
  const subscribe = (type: string, filter: any,
      callback: Array | ((error: Error, updates: DataUpdates) => any),
      parentRequestID?: numbevr): number => {
    let error,
        requestID;
    console.log('subscribe() called');

    if (callback instanceof Array && typeof parentRequestID === 'undefined') {
      throw new Error('parentRequestID must be given with a keyPath');
    }

    if ((error = validateRequest(type, filter))) {
      if (typeof callback === 'function') {
        callback(error);
        return;
      } else {
        throw error;
      }
    }

    requestID = nextRequestID++;
    
    processGet(type, filter, callback, parentRequestID, requestID);

    return requestID;
  };

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
   * @returns {Promise|undefined} If a callback is given, nothing will be
   *   returned. Otherwise a promise that will resolve to the requested data
   *   once that data has been retrieved will be returned.
   */
  const get = (type: string, filter: any,
      callback?: ((error: Error, updates: DataUpdates) => any),
      ): Promise | undefined => {
    let error;
    console.log('get called', callback);

    if ((error = validateRequest(type, filter))) {
      if (callback) {
        callback(error);
        return;
      } else {
        return Promise.reject(error);
      }
    }

    if (typeof callback === 'function') {
      processGet(type, filter,
          (data: any) => { callback(undefined, data); },
          (error: Error) => { callback(error); });
    } else {
      return new Promise((fulfil, reject) => {
        processGet(type, filter, fulfil, reject);
      });
    }
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
      success: KeyPath | Function, failure?: number | Function,
      requestID?: number): number | Promise => {
    console.log('processGet', type, filter, success, requestID, parentRequestID);
    let request,
        parentRequestID,
        parentRequest;

    if (success instanceof Array && typeof failure === 'number') {
      parentRequestID = failure;
      parentRequest = requests[parentRequestID];
      if (typeof parentRequest === 'undefined') {
        return;
      }
    }


    if (parentRequest) {
      request = {
        id: requestID,
        parentRequest: parentRequestID,
        callback: (typeof success === 'function' ? success : parentRequest.callback),
        failure: (typeof success === 'function' ? success : parentRequest.failure),
        keyPath: (success instanceof Array ? success : []),
        type,
        filter
      };

      // Add request to parent request
      if (typeof parentRequest.childRequests === 'undefined') {
        parentRequest.childRequests = [];
      }

      parentRequest.childRequests.push(requestID);
    } else if (requestID) {
      request = {
        id: requestID,
        callback: success,
        failure: success,
        keyPath: (success instanceof Array ? success : []),
        type,
        filter
      };
    } else {
      requestID = nextRequestID++;
      // Create new request object
      request = {
        id: requestID,
        success,
        failure,
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
      if (typeof value === 'undefined' || request.success) {
        sendQuery(request);
      } else {
        if (value === null) {
          // return undefiend
          request.callback(undefined, [{
            keyPath: request.keyPath,
            data: undefined
          }]);
        } else {
          prepareView(paths[filter], request);

          request.lastUpdate = value.updated;
        }

        sendQuery(request);
      }
    });
  };

  /**@internal
   * Send query to server
   *
   * @param {Request} request Request to send to server
   */
  const sendQuery = (request: Request): undefined => {
    console.log('sendQuery called', request);
    requests[request.id] =  request;
    socket.emit('web:query', {
      id: request.id,
      type: request.type,
      filter: request.filter,
      subscribe: (request.callback ? true : false)
    });
  };


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
        if (data.paths[request.filter] === null) {
          if (request.success) {
            request.success();

            delete requests[request.id];
          } else {
            request.callback(undefined, [{
              keyPath: request.keyPath,
              data: undefined
            }]);
          }
        } else if (data.paths[request.filter]) {
          console.log('path');
          if (request.raw) {
            if (request.success) {
              request.success(data.paths[request.filter]);

              delete requests[request.id];
            } else {
              request.callback(undefined, [{
                keyPath: request.keyPath,
                data: data.paths[request.filter]
              }]);
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
            if (reques.success) {
              request.success(data.views[request.filter]);

              delete requests[request.id];
            } else {
              request.callback(undefined, [{
                keyPath: request.keyPath,
                data: data.views[request.filter]
              }]);
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
  const prepareView = (view, request) => {
    console.log('previewView called', view, request);
    const template = view.template;
    view = Immutable.fromJS(view);


    // Get template - TODO Need to fetch data for template and recursively fetch templates
    if (template) {
      if (typeof data.views[template] !== 'undefined') {
        view.set('templateView', Immutable.fromJS(data.views[template]));
      }
    } else {
      if (request.callback) {
        request.callback(undefined, [{
          keyPath: request.keyPath,
          data: view
        }]);
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
    if (request.success) {
      request.success(view);

      delete requests[request.id];
    }
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
    subscribe,
    unsubscribe
  };
}

export default createServer;
