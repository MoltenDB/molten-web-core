interface MoltenDBInternal {
  view: {
    store: IStore,
    reactComponent: any,
    view: ViewActions,
    messages: MessageActions
  },
  server: {
    get: (type: string, filter: Object, subscriber?: (error: Error, data: any) => any) => number | undefined,
    unsubscribe(subscriptionID: number)
  },
  log: {
    (part: string, level: DebugLevel, ...message: any): undefined;
    debug: (part: string, ...message: any) => undefined;
    info: (part: string, ...message: any) => undefined;
    warn: (part: string, ...message: any) => undefined;
    error: (part: string, ...message: any) => undefined;
  }
}

