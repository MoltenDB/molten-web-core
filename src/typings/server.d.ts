interface ServerInstance {
  get: (type: string, filter: any, callback?: null | ((error: Error, data: any) => any), subscribe?: boolean, requestID?: number) => number | Promise,
  unsubscribe: (subscriptionID: number) => any
};
