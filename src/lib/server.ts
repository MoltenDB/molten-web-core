const Immutable = require('immutable');

type GetType = 'path' | 'view';

interface Request {
  id: number,
  subRequests?: number[]
};

const createServer = (moltendb) => {
  let requests = {};
  let nextRequestID = 1;
  let paths = {};
  let views = {};
  let data = {};

  /**
   * @param {GetType} type Type of data to retrieve
   * @param {*} filter Filter for filtering the data
   * @param {Function} [callback] Callback function to run when data is
   *   retrieved or the retrieval fails. If parentRequestID is given and
   *   callback is false
   * @param {number} parentRequestID RequestID of a parent request.
   */
  const get = (type: string, filter: any,
      callback?: boolean | ((error: Error, data: any) => any),
      subscribe?: boolean, parentRequestID?: number): number | Promise => {

    if (callback) {
      if (typeof subscribe === 'undefined') {
        subscribe = true;
      }

      if (subscribe || (parentRequestID && callback === false)) {
        subscribe = nextRequestID++;
      }
    }

    if (parentRequestID && callback === true) {
      processGet(type, filter, true, true, subscribe);
    } else if (typeof callback === 'function') {
      processGet(type, filter, (data) => { callback(undefined, data); },
          (error) => { callback(error); }, subscribe);

      return subscribe;
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
      success: boolean | Function | number, failure?: boolean | Function,
      requestID?: number, parentRequestID?: number): number | Promise => {
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
        success: (typeof success === 'function' ? success : parentRequest.success),
        failure: (typeof failure === 'function' ? failure : parentRequest.failure),
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

    switch (type) {
      case 'path':
        // Check if already cached
        if (paths[filter]) {
          prepareView(paths[filter], request);
        } else {
          sendQuery(request);
        }
        break;
    }
  };

  /**@internal
   * Send query to server
   *
   * @param {Request} request Request to send to server
   */
  const sendQuery = (request: Request) => {
    socket.emit('web:query', {
      id: request.id,
      type: request.type,
      filter: request.filter
    });
  }


  const receiveData = (data: any) => {
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

  // Setup socket
  const socket = io.connect();

  socket.on('web:data', receiveData);

  return <ServerInstance>{
    get,
    unsubscribe
  };
}

export default createServer;
