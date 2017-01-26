namespace MDB {
  interface WebInstance {
    navigate: (path: string) => undefined,
    alert: () => undefined,
    status: () => MDB.WebStatus
  };
};
