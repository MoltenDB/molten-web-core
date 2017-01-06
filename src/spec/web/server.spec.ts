import clientServer from '../../lib/server';
import { SocketIO, Server } from 'mock-socket';

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

      it('calls subscribe function on an error', () => {
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

        serverInstance.get('path', {}, (error, data) => {
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
        });
      });

      it('calls the parent callback when a parentRequestID `true` as the callback is given', () => {
        let callCount = 0;

        const serverInstance = server({
          options: {
            socket: {
              emit: () => {},
              on: () => {}
            }
          }
        });

        // Initial request
        const parentRequestId = serverInstance.get('path', '/', (err, data) => {
          callCount++;
        });

        // Second request
        serverInstance.get('path', '/', null, null, parentRequestId);


      });
    });
  });
};

serverInterfaceTests(clientServer);
