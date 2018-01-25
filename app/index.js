"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDom = require("react-dom");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const moltendb_1 = require("../lib/moltendb");
const mdbComponent_1 = require("../components/mdbComponent");
const index_1 = require("../reducers/index");
require("./style.scss");
const app_config_1 = require("../app.config");
const config_defaults_1 = require("../config.defaults");
//const mdb = await moltenDB({
moltendb_1.default(Object.assign({}, config_defaults_1.commonConfig, app_config_1.commonMDBReactConfig, app_config_1.reactAppConfig)).then((mdb) => {
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
//# sourceMappingURL=index.js.map