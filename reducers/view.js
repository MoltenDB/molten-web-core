"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const view_1 = require("../actions/view");
const utils_1 = require("../lib/utils");
exports.viewReducer = (state = {}, action) => {
    console.log('view reducer called', action);
    switch (action.type) {
        case view_1.MDB_VIEW_NAVIGATE:
            state = Object.assign({}, state);
            if (typeof state.status !== 'undefined'
                && state.status !== "loading" /* LOADING */) {
                state.previousStatus = state.status;
            }
            state.status = "loading" /* LOADING */;
            state.pathLoading = action.path;
            break;
        case view_1.MDB_VIEW_NAVIGATE_CANCEL:
            state = Object.assign({}, state);
            delete state.pathLoading;
            state.status = state.previousStatus;
            delete state.previousStatus;
            break;
        case view_1.MDB_VIEW_DO_UPDATE:
        case view_1.MDB_VIEW_UPDATE:
            console.log('got view update', action, state);
            if (!action.view) {
                break;
            }
            state = Object.assign({}, state);
            if (state.status === "loading" /* LOADING */) {
                // Check path is the same as what is being loaded
                if (action.id && state.loadingId === action.id) {
                    state.view = action.view;
                    state.status = "loaded" /* LOADED */;
                    state.currentId = action.id;
                    delete state.loadingId;
                }
                else if (action.path && state.pathLoading === action.path) {
                    state.view = action.view;
                    state.status = "loaded" /* LOADED */;
                    state.pathCurrent = action.path;
                    delete state.pathLoading;
                }
            }
            else {
                if (action.id && state.currentId === action.id
                    || action.path && state.pathCurrent === action.path) {
                    state.update[''] = action.view;
                    state.status = "new update" /* NEW_UPDATE */;
                }
            }
            break;
        case view_1.MDB_VIEW_DATA_UPDATE:
            if (typeof action.subscriptionId !== 'undefined') {
                const subscriptions = utils_1.getValueInObject(state, ['view'].concat(action.path, ['subscriptions']));
                const subscription = subscriptions.find((item) => item.id === action.subscriptionId);
                console.log('got subscription', subscription, state, ['view'].concat(action.path, ['subscriptions']));
                if (typeof subscription !== 'undefined') {
                    if (subscription.status === "loading" /* LOADING */) {
                        state = utils_1.setIn(state, ['view'].concat(action.path), action.data);
                        state = utils_1.setIn(state, ['view'].concat(action.path, ['subscriptions', action.subscriptionId, 'status']), "loaded" /* LOADED */);
                    }
                    else {
                        //TODO Add to updates
                    }
                }
            }
            else {
                if (action.data.subscriptions instanceof Array) {
                    const subscriptionPath = ['view'].concat(action.path, ['subscriptions']);
                    let subscriptions = utils_1.getValueInObject(state, subscriptionPath);
                    if (typeof subscriptions === 'undefined') {
                        state = utils_1.setIn(state, subscriptionPath, action.data.subscriptions);
                    }
                    else {
                        state = utils_1.setIn(state, subscriptionPath, subscriptions.concat(action.data.subscriptions));
                    }
                }
                else {
                    state = utils_1.setIn(state, ['view'].concat(action.path), action.data);
                }
            }
            break;
    }
    return state;
};
exports.default = exports.viewReducer;
