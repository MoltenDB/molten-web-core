import initStore from '../../lib/store';

describe('storage mechanism', () => {
  describe('set()', () => {
    it('returns a promise that resolves once the value is stored', (done) => {
      const store = initStore('test');

      const returnValue = store.set('key', 'value');

      expect(returnValue).toEqual(jasmine.any(Promise));

      returnValue.then(() => {
        done();
      });
    });
  });

  describe('get()', () => {
    it('returns a promise that resolves to the stored value', (done) => {
      const store = initStore('get');

      store.set('key', 'value').then(() => {
        const returnValue = store.get('key');

        expect(returnValue).toEqual(jasmine.any(Promise));

        returnValue.then((value) => {
          expect(value).toEqual('value');
          done();
        });
      });
    });
  });
});
