"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MDB_VIEW_NAVIGATE = 'MDB_VIEW_NAVIGATE';
exports.MDB_VIEW_NAVIGATE_CANCEL = 'MDB_VIEW_NAVIGATE_CANCEL';
exports.MDB_VIEW_REPLACE = 'MDB_VIEW_REPLACE';
exports.MDB_VIEW_UPDATE = 'MDB_VIEW_UPDATE';
exports.MDB_VIEW_DO_UPDATE = 'MDB_VIEW_DO_UPDATE';
exports.MDB_VIEW_DATA_UPDATE = 'MDB_VIEW_DATA_UPDATE';
exports.MDB_VIEW_DATA_DO_UPDATE = 'MDB_VIEW_DATA_DO_UPDATE';
exports.updateView = (error, view) => {
    return {
        type: exports.MDB_VIEW_UPDATE
    };
};
exports.cancelNavigation = () => {
    return {
        type: exports.MDB_VIEW_NAVIGATE_CANCEL
    };
};
exports.navigate = (path, view) => {
    return {
        type: exports.MDB_VIEW_NAVIGATE,
        path,
        view
    };
};
exports.updateView = (data) => {
    return Object.assign({}, data, { type: exports.MDB_VIEW_UPDATE });
};
