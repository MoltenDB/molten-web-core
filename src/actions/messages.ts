export const MDB_MESSAGE_ADD = 'MDB_MESSAGE_ADD';
export const MDB_MESSAGE_TIMEOUT = 'MDB_MESSAGE_TIMEOUT';
export const MDB_MESSAGE_ACKNOWLEDGE = 'MDB_MESSAGE_ACKNOWLEDGE';

let id = 0;

/**XXX const createMessageActions = (moltendb: MoltenDBInternal ) => {
  return <MessageActions>{
    /**
     * Creates a new message
     *
     * @param message Details of message to create
     *
     * @returns The ID of the created message
     *
    create: (message: Message) => {
      if (!message.id) {
        message.id = id++;
      }

      if (message.lifetime) {
        message.expiry = new Date(new Date().getTime() + (message.lifetime / 1000));
        message.timeoutId = setTimeout(() => {
          moltendb.view.store.dispatch(<MessageTimeoutAction>{
            id: message.id,
            type: MDB_MESSAGE_TIMEOUT
          });
        }, message.lifetime);
      }

      moltendb.view.store.dispatch(<MessageAddAction>{
        type: MDB_MESSAGE_ADD,
        message
      });

      return message.id;
    },

    /**
     * Acknowledge the message with the given message id
     *
     * @param id ID of the message to acknowledge
     *
    acknowledge: (id: MessageId) => {
      moltendb.view.store.dispatch(<MessageAcknowledgeAction>{
        type: MDB_MESSAGE_ACKNOWLEDGE,
        id: id
      });
    }
  }
};

export default createMessageActions;*/
