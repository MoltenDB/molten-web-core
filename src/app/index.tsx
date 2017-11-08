import * as React from 'react';
import * as ReactDom from 'react-dom';
import { connect, Provider } from 'react-redux';
import { createStore } from 'redux';

import moltenDB from '../lib/moltendb';
import rawMDBComponent from '../components/mdbComponent';
import mdbReducer from '../reducers/index';

import { commonOptions, appConfig } from '../../app.config';

//const mdb = await moltenDB({
moltenDB({
  ...commonOptions,
  ...appConfig
}).then((mdb) => {
  const store = createStore(mdbReducer, {
    view: {},
    messages: []
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
