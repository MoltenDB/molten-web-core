import clientServer from '../../lib/server';
import createFakeServerOptions from '../helpers/socket';
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
              emit: (message, data) => {
                expect(message).toEqual(jasmine.any(String));
                expect(data).toEqual(jasmine.any(Object));
              },
              on: () => {}
            }
          }
        });
        serverInstance.get('path', '/', () => {});
      }, 100);

      it('listens for `web:data` messages', () => {
        let attachCount = 0;

        // Create server instance with a mocked socket instance
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
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

      describe('using Promises', () => {
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

        it('rejects on an error', (done) => {
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

        it('resolves with the full data', (done) => {
           const serverInstance = server(createFakeServerOptions());

           // Initial request
           const promise = serverInstance.get('path', '/dummy1');

           expect(promise).toEqual(jasmine.any(Promise));

           promise.then((data) => {
             expect(data).toEqual(jasmine.any(Object));
             expect(data.get('path')).toEqual('/dummy1');
             done();
           }).catch(fail);
         });
      });

      describe('with a callback', () => {
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
      });
    });

    describe('subscribe()', () => {
      it ('returns a subscription ID when callback given', () => {
        // Create server instance with a mocked socket instance
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });
        const returnValue = serverInstance.subscribe('path', '/', () => {});

        expect(returnValue).toEqual(jasmine.any(Number));
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

        expect(serverInstance.subscribe.bind(null, 'path', '/', []))
            .toThrow(new Error('parentRequestID must be given with a keyPath'));
      });

      it('returns a subscription ID when parentRequestId and keyPath given', () => {
        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });

        const returnValue = serverInstance.subscribe('path', '/', [], 1);

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

        serverInstance.subscribe('path', {}, (error, data, keyPath) => {
          callCount++;
          getError = error;
          getData = data;
        });

        expect(callCount).toEqual(1);
        expect(getData).toBeUndefined();
        expect(getError).toEqual(jasmine.any(Error));
      });

      it('calls the callback with a <DataUpdates> array as the second '
          + 'parameter on initial data load with the keyPath being an empty '
          + 'array', (done) => {
        const serverInstance = server(createFakeServerOptions());

        // Initial request
        const parentRequestId = serverInstance.subscribe('path', '/dummy1', (err, updates) => {
          console.log('!!!test callback called', err, updates);
          if (err) {
            fail(err);
          }

          expect(updates).toEqual(jasmine.any(Array));
          if (updates instanceof Array) {
            expect(updates.length).toEqual(1);
            if (updates.length) {
              expect(updates[0].data).toEqual(jasmine.any(Object));
              expect(updates[0].keyPath).toEqual(jasmine.any(Array));
              expect(updates[0].keyPath.length).toEqual(0);
              expect(updates[0].data.get('path')).toEqual('/dummy1');
            }
          }
          done();
        });
      });

      it('calls the callback with a <DataUpdates> array as the second '
          + 'parameter with an undefined value for data if the data '
          + 'doesn\'t currently exist', (done) => {
        const serverInstance = server(createFakeServerOptions());

        // Initial request
        const parentRequestId = serverInstance.subscribe('path', '/nothere', (err, updates) => {
          console.log('!!!test callback called', err, updates);
          if (err) {
            fail(err);
          }

          expect(updates).toEqual(jasmine.any(Array));
          if (updates instanceof Array) {
            expect(updates.length).toEqual(1);
            if (updates.length) {
              expect(updates[0].data).toEqual(undefined);
              expect(updates[0].keyPath).toEqual(jasmine.any(Array));
              expect(updates[0].keyPath.length).toEqual(0);
            }
          }
          done();
        });
      });

      xit('calls the callback with a <DataUpdates> array as the second '
          + 'parameter on a data update with the keyPath being a keyPath '
          + 'array to the location of the data updated in the initial data',
          (done) => {
        let callCount = 0;
        const serverInstance = server(createFakeServerOptions((message, data, response, emit, runHandlers) => {
          console.log('emitCallback called', callCount, runHandlers);
          if (callCount === 0) {
            let newResponse = Object.assign({}, response);
            newResponse.views.dummy.newVar = 'test';
            runHandlers(newResponse);
          }
        }));

        const parentRequestId = serverInstance.get('path', '/dummy1', (err, updates) => {
          console.log('!!!test callback called', err, updates);
          callCount++;
          if (err) {
            fail(err);
          }

          if (callCount === 2) {
            expect(data).toEqual(jasmine.any(Object));
            expect(data.get('path')).toEqual('/dummy1');
            expect(data.get('newVar')).toEqual('test');
            done();
          }
        });
      });
    });

    describe('unsubscribe()', () => {
      xit('removes any child subscriptions when removing a subscription', (done) => {
      });
    });
  });
};

serverInterfaceTests(clientServer);
