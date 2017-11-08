const Immutable = require('immutable');

export const MDB_MESSAGE_ADD = 'MDB_MESSAGE_ADD';
export const MDB_MESSAGE_REMOVE = 'MDB_MESSAGE_REMOVE';
export const MDB_MESSAGE_TIMEOUT = 'MDB_MESSAGE_TIMEOUT';
export const MDB_MESSAGE_ACKNOWLEDGE = 'MDB_MESSAGE_ACKNOWLEDGE';

let id = 1;

const messageReducer = (state = Immutable.List(), action: Action) => {
  switch (action.type) {
    case MDB_MESSAGE_ADD:
      return state.push(Immutable.Map(action.message));
    case MDB_MESSAGE_ACKNOWLEDGE:
    case MDB_MESSAGE_REMOVE:
    case MDB_MESSAGE_TIMEOUT:
      const index = state.findKey((item, i) => (action.get('id') === item.id ? i : undefined));
      if (typeof index !== 'undefined') {
        return state.delete(index);
      }
    default:
      return state;
  }
};

export default messageReducer;
