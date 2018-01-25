"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graph = require("./components/components/graph");
var common_config_1 = require("./common.config");
exports.commonMDBReactConfig = common_config_1.commonMDBReactConfig;
exports.title = 'MoltenDB';
let logger = () => { };
Object.assign(logger, {
    log: () => { },
    error: () => { },
    debug: () => { },
    warn: () => { }
});
exports.reactAppConfig = {
    components: {
        Graph
    }
};
//# sourceMappingURL=app.config.js.map