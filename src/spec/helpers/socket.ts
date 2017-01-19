
const createFakeServerOptions =
    (emitCallback?: (message: string, data: any, emit: emit, response: any, runHandlers: runHandlers) => any,
    onCallback?: (message: string, handler: Function) => any) => {
  let messageHandlers = {};

  const runHandlers = (handlers: Function[], response: any) => {
    if (typeof handlers !== 'undefined') {
      handlers.forEach((handler) => {
        console.log('calling handler for web:data');
        setTimeout(() => {
          handler(response);
        }, 0);
      });
    }
  };

  const emit = (message: string, data: any): undefined => {
    console.log('socket emit called', message, data);
    let handlers,
        response;
    switch (message) {
      case 'web:query':
        switch (data.type) {
          case 'path':
            if (data.filter.startsWith('/dummy')) {
              response = {
                paths: {},
                views: {
                  dummy: {
                    path: data.filter,
                    id: data.id
                  }
                }
              };

              response.paths[data.filter] = 'dummy';
            } else {
              response = {
                paths: {}
              };
              response.paths[data.filter] = null;
            }
            break;
        }
        response.id = data.id;

        handlers = messageHandlers['web:data'];
        break;
    }
    
    console.log('running handlers', handlers);
    runHandlers(handlers, response);
    console.log('done');

    if (emitCallback) {
      const callbackEmit = (message: string, data: any) => {
        setTimeout(() => {
          emit(message, data);
        }, 0);
      };

      const callbackHandlers = (response: any) => {
        console.log('runHandlers called from emitCallback', runHandlers);
        runHandlers(handlers, response);
      };

      emitCallback(message, data, response, callbackEmit, callbackHandlers);
    }
  };

  const on = (message: string, handler: Function): undefined => {
    if (typeof messageHandlers[message] === 'undefined') {
      messageHandlers[message] = [];
    }

    messageHandlers[message].push(handler);

    if (onCallback) {
      onCallback(message, handler);
    }
  }
  return {
    options: {
      socket: {
        emit,
        on
      }
    }
  };
};
export default createFakeServerOptions;
