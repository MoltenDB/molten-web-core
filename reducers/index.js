"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const view_1 = require("./view");
//import messages from './messages';
const reducer = redux_1.combineReducers({
    view: view_1.default /*TODO ,
    messages*/
});
exports.default = reducer;
//# sourceMappingURL=index.js.map