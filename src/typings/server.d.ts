interface ServerInstance {
  get: (type: string, filter: any, callback?: (error: Error, data: any) => any, subscribe?: boolean) => number | Promise,
  unsubscribe: (subscriptionID: number) => any
};
