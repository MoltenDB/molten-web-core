"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const molten_core_1 = require("molten-core");
const molten_api_websocket_1 = require("molten-api-websocket");
const socketHandler_1 = require("./socketHandler");
const process = require("process");
const server_config_1 = require("./server.config");
const config_defaults_1 = require("./config.defaults");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
// Dev imports
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackConfig = require("./webpack.config");
const compiler = webpack(webpackConfig);
server_config_1.commonMDBReactConfig = Object.assign(config_defaults_1.commonConfig, server_config_1.commonMDBReactConfig);
const app = express();
const server = http.createServer(app);
const io = socketio(server, {});
//TODO const mdb = await MoltenDB(moltenDBOptions);
molten_core_1.default(server_config_1.moltenDBOptions).then((mdb) => {
    const devMiddleware = webpackDevMiddleware(compiler, {});
    // Attach webpack middlewares
    app.use(server_config_1.commonMDBReactConfig.baseUri || '/', devMiddleware);
    app.use(server_config_1.commonMDBReactConfig.baseUri || '/', webpackHotMiddleware(compiler));
    // Attach to * for HistoryAPI
    app.get('*', (req, res) => {
        const index = devMiddleware.fileSystem.readFileSync(path.join(webpackConfig.output.path, 'index.html'));
        res.end(index);
    });
    // Attach molten-api-websocket
    molten_api_websocket_1.default({
        moltenInstance: mdb,
        socketServer: io,
    });
    // Attach molten-web socket addon
    return socketHandler_1.socketHandler(mdb, io, server_config_1.commonMDBReactConfig).then(() => {
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
