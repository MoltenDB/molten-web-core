
//type GetType = "path" | "view";

interface Request {
  id: number,
  subRequests?: number[]
};

type KeyPath = string[];

type DataUpdates = {
  keyPath: string[],
  data: any
}[];

interface ServerInstance {
  get: (
      type: string,
      filter: any,
      callback?: ((error: Error, data: any) => any)
  ) => Promise | undefined,
  subscribe: (
      type: string,
      filter: any,
      callback: KeyPath | ((error: Error, data: any) => any),
      parentRequestID?: number
  ) => number,
  unsubscribe: (
      subscriptionID: number
  ) => any
};
