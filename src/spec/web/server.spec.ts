import clientServer from '../../lib/server';
//import { SocketIO, Server } from 'mock-socket';

const serverInterfaceTests = (server) => {
  describe('server interface', () => {
    describe('get()', () => {
      it ('uses the IO instance given to it in the moltendb.options', () => {
        let callCount = 0;
        // Create server instance with a mocked socket instance
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {
                callCount++
              },
              on: () => {}
            }
          }
        });
        const returnValue = serverInstance.get('path', '/', () => {});

        expect(returnValue).toEqual(jasmine.any(Number));
      });

      it('listens for `web:data` messages', () => {
        let attachCount = 0;

        // Create server instance with a mocked socket instance
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {
                callCount++
              },
              on: (message, handler) => {
                if (message === 'web:data') {
                  expect(handler).toEqual(jasmine.any(Function));
                  attachCount++;
                }
              }
            }
          }
        });

        expect(attachCount).toBeGreaterThan(0);
      });


      it ('returns a reference ID when callback given', () => {
        // Create server instance with a mocked socket instance
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });
        const returnValue = serverInstance.get('path', '/', () => {});

        expect(returnValue).toEqual(jasmine.any(Number));
      });

      it('returns a promise with requestID property when no callback is given', () => {
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });

        const returnValue = serverInstance.get('path', '/');

        expect(returnValue).toEqual(jasmine.any(Promise));
      });

      it('throws an error when no parentRequestID is given when callback is an array', () => {
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });

        expect(serverInstance.get.bind(null, 'path', '/', []))
            .toThrow(new Error('parentRequestID must be given with a keyPath'));
      });

      it('returns a reference ID when parentRequestId and keyPath given', () => {
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });

        const returnValue = serverInstance.get('path', '/', [], true, 1);

        expect(returnValue).toEqual(jasmine.any(Number));
      });

      it('calls callback with the first parameter as the error on an error', () => {
        let callCount = 0,
            getError,
            getData;

        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });

        serverInstance.get('path', {}, (error, data, keyPath) => {
          callCount++;
          getError = error;
          getData = data;
        });

        expect(callCount).toEqual(1);
        expect(getData).toBeUndefined();
        expect(getError).toEqual(jasmine.any(Error));
      });

      it('promise rejects on an error', (done) => {
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });

        serverInstance.get('path', {}).catch((error) => {
          expect(error).toEqual(jasmine.any(Error));
          done();
        });
      });

      it('calls the callback with the initial data as the second parameter '
          + 'and no keyPath on first call', (done) => {
      });

      it('calls the callback with the updated data as the second parameter '
          + 'and the keyPath as the third parameter on data update', (done) => {
      });

      it('removes any child subscriptions when removing a subscription', (done) => {
      });

      it('calls the parent callback with the given keyPath when given', (done) => {
        let callCount = 0;
        let messageHandlers = {};

        const serverInstance = server({
          options: {
            socket: {
              emit: (message, data) => {
                console.log('socket emit called', message, data);
                switch (message) {
                  case 'web:query':
                    let response = {
                      paths: {},
                      views: {
                        dummy: {
                          path: data.filter
                        }
                      }
                    };

                    response.paths[data.filter] = 'dummy';
                    response.id = data.id;

                    const handlers = messageHandlers['web:data'];

                    if (typeof handlers !== 'undefined') {
                      handlers.forEach((handler) => {
                        console.log('calling handler for web:data');
                        setTimeout(() => {
                          handler(response);
                        }, 0);
                      });
                    }
                    break;
                }
              },
              on: (message, handler) => {
                if (typeof messageHandlers[message] === 'undefined') {
                  messageHandlers[message] = [];
                }

                messageHandlers[message].push(handler);
              }
            }
          }
        });

        // Initial request
        const parentRequestId = serverInstance.get('path', '/dummy1', (err, data, keyPath) => {
          console.log('!!!test callback called', err, data);
          callCount++;
          if (err) {
            fail(err);
          }

          if (data.path === '/dummy2') {
            expect(callCount).toEqual(2);
            done();
          }
        });

        // Second request
        serverInstance.get('path', '/dummy2', null, null, parentRequestId);


      });
    });
  });
};

serverInterfaceTests(clientServer);
