import MoltenDB from 'molten-core'
import moltenApiSocket from 'molten-api-websocket';
import { socketHandler } from './socketHandler';
import * as process from 'process';

import {
  moltenDBOptions,
  commonMDBReactConfig as commonConfig,
  mdbReactServerConfig as serverConfig
} from './server.config';

import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import MoltenWebReact from './index';
import * as config from './config';

// Dev imports
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as webpackConfig from './webpack.config';
const compiler = webpack(webpackConfig);

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//TODO const mdb = await MoltenDB(moltenDBOptions);
MoltenDB(moltenDBOptions).then((mdb) => {
  // Attach webpack middlewares
  app.use(commonConfig.baseUri || '/', webpackDevMiddleware(compiler, {
    historyApiFallback: true
  }));
  app.use(commonConfig.baseUri || '/', webpackHotMiddleware(compiler));

  // Attach molten-api-websocket
  moltenApiSocket({
    moltenInstance: mdb,
    socketServer: io
  });

  // Attach molten-web socket addon
  return socketHandler(mdb, io, commonConfig).then(() => {
  // Attach the Molten Web React server
  /*MoltenWebReact(app, {
    ...commonConfig,
    ...serverConfig,
    moltenInstance: mdb
  });*/

  server.listen(6866);
  });
}).catch((error) => {
  console.log('caught error', error);

  process.exit(1);
});
