"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const molten_api_websocket_1 = require("molten-api-websocket");
const socketHandler_1 = require("./socketHandler");
const server_config_1 = require("./server.config");
const config_defaults_1 = require("./config.defaults");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const appDist = path.resolve(__dirname, './app');
server_config_1.commonMDBReactConfig = Object.assign(config_defaults_1.commonConfig, server_config_1.commonMDBReactConfig);
//TODO const mdb = await MoltenDB(moltenDBOptions);
MoltenDB(server_config_1.moltenDBOptions).then((mdb) => {
    app.use(server_config_1.commonMDBReactConfig.baseUri || '/', express.static(appDist));
    // Attach to * for HistoryAPI
    app.get('*', (req, res) => {
        res.sendFile(path.join(appDist, 'index.html'));
    });
    // Attach molten-api-websocket
    molten_api_websocket_1.default({
        moltenInstance: mdb,
        socketServer: io
    });
    // Attach molten-web socket addon
    return socketHandler_1.socketHandler(mdb, io, server_config_1.commonMDBReactConfig).then(() => {
        // Attach the Molten Web React server
        /*MoltenWebReact(app, {
          ...CommonOptions,
          ...serverConfig,
          moltenInstance: mdb
        });*/
        server.listen(3000);
    });
});
//# sourceMappingURL=server.js.map