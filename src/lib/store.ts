
const initStore = (name: string) => {
  let store = {};

  const get = (id: string | Object) => {
    if (typeof id !== 'object') {
      return Promise.resolve(store[id]);
    }
  }

  const set = (id: string, value: any) => {
    store[id] = value;
    return Promise.resolve();
  }

  return {
    get,
    set
  };
};

export default initStore;
