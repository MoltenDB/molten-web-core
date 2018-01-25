import * as React from 'react';
import * as ReactDom from 'react-dom';
import { connect, Provider } from 'react-redux';
import { createStore } from 'redux';

import moltenDB from '../lib/moltendb';
import rawMDBComponent from '../components/mdbComponent';
import mdbReducer from '../reducers/index';

import './style.scss';

import {
  commonMDBReactConfig as appConfig,
  reactAppConfig
} from '../app.config';
import {
  commonConfig as defaultCommonConfig
} from '../config.defaults';

//const mdb = await moltenDB({
moltenDB({
  ...defaultCommonConfig,
  ...appConfig,
  ...reactAppConfig
}).then((mdb) => {
  const store = createStore(mdbReducer, {
    view: {},
    //TOOD messages: []
  },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

  const MDBComponent = connect(
    (state) => {
      return {
        state: state.view
      };
    }
  )(rawMDBComponent);

  ReactDom.render((
    <Provider store={store}>
      <MDBComponent mdb={mdb} path="/" />
    </Provider>
  ), document.getElementById('app'));
});
