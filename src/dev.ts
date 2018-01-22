import MoltenDB from 'molten-core';
import moltenApiSocket from 'molten-api-websocket';
import { socketHandler } from './socketHandler';
import * as process from 'process';

import {
  moltenDBOptions,
  commonMDBReactConfig,
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

// Dev imports
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as webpackConfig from './webpack.dev';
const compiler = webpack(webpackConfig);

const commonConfig = Object.assign(defaultCommonConfig, commonMDBReactConfig);

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  //path: commonConfig.socketPath
});

//TODO const mdb = await MoltenDB(moltenDBOptions);
MoltenDB(moltenDBOptions).then((mdb) => {
  const devMiddleware = webpackDevMiddleware(compiler, {
  });

  // Attach webpack middlewares
  app.use(commonConfig.baseUri || '/', devMiddleware);
  app.use(commonConfig.baseUri || '/', webpackHotMiddleware(compiler));

  // Attach to * for HistoryAPI
  app.get('*', (req, res) => {
    const index = devMiddleware.fileSystem.readFileSync(path.join(webpackConfig.output.path, 'index.html'));

    res.end(index);
  });

  // Attach molten-api-websocket
  moltenApiSocket({
    moltenInstance: mdb,
    socketServer: io,
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
