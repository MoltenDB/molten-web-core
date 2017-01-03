import { MDB_MESSAGE_ADD, MDB_MESSAGE_TIMEOUT, MDB_MESSAGE_REMOVE,
    MDB_MESSAGE_ACKNOWLEDGE } from '../reducers/messages';

let id = 0;

const createMessageActions = (moltendb: MoltenDBInternal ) => {
  return <MessageActions>{
    create: (message: Message) => {
      if (!message.id) {
        message.id = id++;
      }

      if (message.lifetime) {
        message.expiry = new Date(new Date().getTime() + (message.lifetime / 1000));
        message.timeoutId = setTimeout(() => {
          moltendb.view.store.dispatch({
            id: message.id,
            type: MDB_MESSAGE_TIMEOUT
          });
        }, message.lifetime);
      }

      moltendb.view.store.dispatch({
        type: MDB_MESSAGE_ADD,
        message
      });

      return message.id;
    },

    acknowledge: (id: MessageId) => {
      moltendb.view.store.dispatch({
        type: MDB_MESSAGE_ACKNOWLEDGE,
        id: id
      });
    },

    remove: (id: MessageId) => {
      moltendb.view.store.dispatch({
        type: MDB_MESSAGE_REMOVE,
        id: id
      });
    }
  }
};

export default createMessageActions;
