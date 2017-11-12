"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const molten_storage_json_crud_1 = require("molten-storage-json-crud");
var common_config_1 = require("./common.config");
exports.commonMDBReactConfig = common_config_1.commonMDBReactConfig;
exports.moltenDBOptions = {
    storage: {
        default: {
            connect: molten_storage_json_crud_1.default,
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
exports.mdbReactServerConfig = {
    viewsCollectionStorage: 'default'
};
