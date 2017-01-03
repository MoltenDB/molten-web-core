import clientServer from '../../lib/server';

const serverInterfaceTests = (server) => {
  describe('server interface', () => {
    describe('get()', () => {
      it ('returns a reference ID when callback given', () => {
        const returnValue = server.get('path', '/', () => {});

        expect(returnValue).toEqual(jasmine.any(Number));
      });

      it('returns a promise with requestID property when no callback is given', () => {
        const returnValue = server.get('path', '/');

        expect(returnValue).toEqual(jasmine.any(Promise));
      });

      it('calls subscribe function on an error', () => {
        let callCount = 0,
            getError,
            getData;

        server.get('path', {}, (error, data) => {
          callCount++;
          getError = error;
          getData = data;
        });

        expect(callCount).toEqual(1);
        expect(getData).toBeUndefined();
        expect(getError).toEqual(jasmine.any(Error));
      });

      it('promise rejects on an error', (done) => {
        server.get('path', {}).catch((error) => {
          expect(error).toEqual(jasmine.any(Error));

          done();
        });
      });

      it('calls the parent callback when a parentRequestID `true` as the callback is given', () => {
        let callCount = 0;

        // Initial 
        server.get('path', '/', (err, data) => {
        });
      });
    });
  });
};

serverInterfaceTests(clientServer());
