import * as React from 'react';
import * as MDB from 'molten-core';
import * as MDBWeb from '../typings/mdb-web';
import * as states from '../typings/state';
import * as MDBReact from '../../typings/client';

import MoltenDB from '../lib/moltendb';
import MDBView from './mdbView';

import {
  cancelNavigation,
  navigate,
  updateView
} from '../actions/view';

export interface MoltenDBProps {
  /// Path the render
  path?: string,
  /// ID of view to render
  viewId?: MDB.ID,
  /// View to render
  view?: MDBWeb.View,
  /// MoltenDB Web React library instance
  mdb?: MDBReact.Instance,
  /// Current state
  state?: states.ViewState
}

class MoltenDBComponent extends React.Component {
  protected mdb: MDBWeb.MDBInstance;

  constructor(props) {
    super(props)

    if (!this.props.mdb) {
      // Create an instance of the MDB library to use
      this.mdb = MoltenDB();
    } else {
      this.mdb = this.props.mdb;
    }

    this.logger = this.mdb.logger.id('MDB component', '#ce6105');
  }

  render() {
    this.logger.debug('MoltenDB component render called', this.props);
    if (this.props.path) {
      this.logger.debug(`Path '${this.props.path}' received in props`);

      // Check if the path loading/loaded is the same as the given
      if (this.props.state.pathLoading) {
        if (this.props.path !== this.props.state.pathLoading) {
          if (this.props.path === this.props.state.pathCurrent) {
            this.props.dispatch(cancelNavigation());
          }
        }
      } else {
        if (this.props.path !== this.props.state.pathCurrent) {
          // Check if the current path is good for the new path
          if (this.props.state.view && this.props.state.view.paths
              && this.props.state.view.paths.indexOf(path) !== -1) {
          } else {
            // Load the new view
            this.props.dispatch(navigate(this.props.path));
            // Request new view from server
            this.mdb.server.subscribe('path', {
              path: this.props.path
            }, (error, data) => {
              if (error) {
              } else {
                this.props.dispatch(updateView({
                  view: data,
                  path: this.props.path
                }));
              }
            });
          }
        }
      }
    } else if (this.props.viewId) {
      this.logger.debug(`View id '${this.props.viewId}' received in props`);

      if (!this.props.state.view || this.props.viewId !== this.props.view._id) {
        this.props.dispatch(navigate(null, this.props.viewId));

        this.mdb.server.subscribe('view', {
          _id: this.props.viewId
        }, (error, data) => {
          if (error) {
          } else {
            this.props.dispatch(updateView({
              view: data,
              id: this.props.viewId
            }));
          }
        });
      }
    } else {
      this.logger.debug('No view received in props. Going to url');
    }

    // Check status
    if (this.props.state && this.props.state.status === 'ERROR') {
      // TODO Change to used setting for error page
      this.mdb.server.subscribe('view', {
        _id: 'error'
      }, (data) => this.props.dispatch(updateView({
        view: data,
        error: this.props.state.error
      })));
    }

    if (!(this.props.state && this.props.state.view)) {
      return null;
    }

    this.logger.debug('Rendering view', this.props.state.view);
    return MDBView({
      mdb: {
        ...this.mdb,
        logger: this.logger
      },
      view: this.props.state.view
    });
  }
};
export default MoltenDBComponent;
