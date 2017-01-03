/*
*******************************************************************************
* This file is part of MoltenDB
* http://www.moltendb.com
*
* Copyright Meld Computer Engineering 2015
* http://www.meldce.com
*
* MoltenDB is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* MoltenDB is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with MoltenDB.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************
*/
'use strict';

import { createStore } from 'redux-immutable';
import moltenReducer from './reducers';
import createMessagesActions from './actions/messages';
import createViewActions from './actions/view';

var compile = require('./viewCompiler.js');
//var renderer = require('./renderer');
var React = require('react');
var ReactDOM = require('react-dom');
var reactView = require('./react');
var page = require('page');
var 
/**
 * Need to make it so the react class doesn't have access to anything
 */

/**
 * Creates a view instance to handle the drawing of data into an element
 * using React
 *
 * @param {Object} moltendb Associated MoltenDB instance
 *
 * @returns {Object} View instance
 */
const createView = (moltendb) => {
  let reactElement,
      reactComponent,
      store = createStore(reducer),
      viewActions = createViewActions(moltendb),
      messageActions = createMessagesActions(moltendb);

  // Get the element react should be loaded into
  if (!moltendb.options.reactElement ||
      (reactElement
      = document.querySelector(moltendb.options.reactElement))) {
    reactElement = document.querySelector('#app');
  }

  // Connect React to DOM
  reactComponent = ReactDOM.render(
      React.createElement(reactView(moltendb), {}), reactElement);

  const view = {
    store,
    reactComponent,
    view: viewActions,
    messages: messageActions
  };

  /**
   * Function called by Page.js to navigate somewhere.
   *
   * @this View private data
   *
   * @param {Page.Context} context Page.js route context
   * @param {Function} next 
   *
   * @returns {undefined}
   */
  function navigate(context, next) {
    console.log('navigate called');
    var path = context.pathname.substr(1),
        pathParts = path.split('/'),
        p = 0,
        handler = this.moltendb.handlers;

    console.log('navigate called', arguments);

    // Use something like pecking router to go through previously handled
    // routes to determine if we have one already
    if (false) {
    } else {
      // Request path from server
      console.log('requesting path from server', context.pathname);
      if (typeof this.viewSubscriberId !== 'undefined') {
        //TODO unsubscribe
        this.moltendb.server.unsubscribe(viewSubscriberId);
        this.viewSubscriberId = undefined;
      }
      this.viewSubscriberId = moltendb.server.get('path', context.pathname,
          function navaigateToPath(pathData) {
        console.log('here got path data', pathData,);
        // Check access
        //if (!moltendb.can) { // TODO || options.can
          // Prepare the new path data for React?

          // Call setState to trigger a re-render
          reactComponent.setState(pathData);
        //} else {
          // TODO Access denied
        //}

        next();
      }.bind(this), function handleNavigationError(err) {
        // TODO error(err);
        console.error(err.message);
        next();
      }, true);
    }
  }

  // Set up Path.js
  page('*', navigate);

  // Set the base URL
  if (typeof moltendb.options.baseUri === 'string') {
    page.base(moltendb.options.baseUri);
  }

  console.log('starting page');
  // Start
  page();

  // TODO Need a better way of doing this. Need to make it so you can add
  // custom display modules to it?
  return view;
};

export default createView;
