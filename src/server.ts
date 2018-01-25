import MoltenDB from 'molten-core'
import moltenApiSocket from 'molten-api-websocket';
import { socketHandler } from './socketHandler';

import {
  moltenDBOptions,
  commonMDBReactConfig as commonConfig,
  mdbReactServerConfig as serverConfig
} from './server.config';
import {
  commonConfig as defaultCommonConfig
} from './config.defaults';

import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import * as path from 'path';

import MoltenWebReact from './index';
import * as config from './config';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const appDist = path.resolve(__dirname, './app');
commonConfig = Object.assign(defaultCommonConfig, commonConfig);

//TODO const mdb = await MoltenDB(moltenDBOptions);
MoltenDB(moltenDBOptions).then((mdb) => {
  app.use(commonConfig.baseUri || '/', express.static(appDist));

  // Attach to * for HistoryAPI
  app.get('*', (req, res) => {
    res.sendFile(path.join(appDist, 'index.html'));
  });

  // Attach molten-api-websocket
  moltenApiSocket({
    moltenInstance: mdb,
    socketServer: io
  });

  // Attach molten-web socket addon
  return socketHandler(mdb, io, commonConfig).then(() => {
    // Attach the Molten Web React server
    /*MoltenWebReact(app, {
      ...CommonOptions,
      ...serverConfig,
      moltenInstance: mdb
    });*/

    server.listen(3000);
  });
});
