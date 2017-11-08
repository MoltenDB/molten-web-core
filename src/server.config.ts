import createJsonCrudStorage from 'molten-storage-json-crud';

export { commonMDBReactConfig } from './common.config';

import * as MDB from 'molten-core';
import * as MDBReactServer from '../typings/server';

export const moltenDBOptions: MDB.MoltenDBOptions = {
  storage: {
    default: {
      connect: createJsonCrudStorage,
      options: {
        baseFolder: 'data',
        keepConnected: true
      }
    }
  },
  collectionsStorage: {
    storage: 'default',
    collection: 'collections'
  }
};

export const mdbReactServerConfig = {
};
