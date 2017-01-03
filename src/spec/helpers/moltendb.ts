
const createFakeMoltenDB = (parts: Object): MoltenDBInternal => {
  const moltendb = Object.assign({
    view: {
      store: <IStore>{
      },
      reactComponent: {
      },
      view: <ViewActions>{
        navigate: () => {}
      },
      messages: <MessageActions>{
        create: (message: Message) => {},
        acknowledge: (id: MessageId) => {},
        remove: (id: MessageId) => {}
      }
    },
    server: {
      get: () => { return 0; },
      unsubscribe: () => {}
    }
  }, parts);

  return moltendb;
}

export default createFakeMoltenDB;
