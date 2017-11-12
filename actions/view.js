"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MDB_VIEW_NAVIGATE = 'MDB_VIEW_NAVIGATE';
exports.MDB_VIEW_NAVIGATE_CANCEL = 'MDB_VIEW_NAVIGATE_CANCEL';
exports.MDB_VIEW_REPLACE = 'MDB_VIEW_REPLACE';
exports.MDB_VIEW_UPDATE = 'MDB_VIEW_UPDATE';
exports.MDB_VIEW_DO_UPDATE = 'MDB_VIEW_DO_UPDATE';
exports.MDB_VIEW_DATA_UPDATE = 'MDB_VIEW_DATA_UPDATE';
exports.MDB_VIEW_DATA_DO_UPDATE = 'MDB_VIEW_DATA_DO_UPDATE';
/*TODO should the error be being passed to the action to store in the state.
 * Maybe be passed as an update to the status, though if it is an error will
 * want to cancel the navigation and display the error
export const updateView = (error: MDBWeb.Error, view: MDBWeb.View) => {
  return {
    type: MDB_VIEW_UPDATE
  };
};*/
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
exports.updateData = (path, data) => {
    return {
        type: exports.MDB_VIEW_DATA_UPDATE,
        path,
        data
    };
};
