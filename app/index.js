"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDom = require("react-dom");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const moltendb_1 = require("../lib/moltendb");
const mdbComponent_1 = require("../components/mdbComponent");
const index_1 = require("../reducers/index");
const app_config_1 = require("../../app.config");
//const mdb = await moltenDB({
moltendb_1.default(Object.assign({}, app_config_1.commonOptions, app_config_1.appConfig)).then((mdb) => {
    const store = redux_1.createStore(index_1.default, {
        view: {},
        messages: []
    }, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
    const MDBComponent = react_redux_1.connect((state) => {
        return {
            state: state.view
        };
    })(mdbComponent_1.default);
    ReactDom.render((React.createElement(react_redux_1.Provider, { store: store },
        React.createElement(MDBComponent, { mdb: mdb, path: "/" }))), document.getElementById('app'));
});
