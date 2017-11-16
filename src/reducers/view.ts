import { ViewState } from '../../typings/state';
import {
  MDB_VIEW_NAVIGATE,
  MDB_VIEW_NAVIGATE_CANCEL,
  MDB_VIEW_DO_UPDATE,
  MDB_VIEW_UPDATE,
  MDB_VIEW_DATA_UPDATE,
  MDB_VIEW_DATA_DO_UPDATE
} from '../actions/view';

import {
  LoadingStatus
} from '../../typings/client';

import {
  setIn,
  getValueInObject
} from '../lib/utils';

export const viewReducer = (state: ViewState = {}, action: Action) => {
  console.log('view reducer called', action);
  switch (action.type) {
    case MDB_VIEW_NAVIGATE:
      state = {
        ...state
      };

      if (typeof state.status !== 'undefined'
          && state.status !== LoadingStatus.LOADING) {
        state.previousStatus = state.status;
      }

      state.status = LoadingStatus.LOADING;
      state.pathLoading = action.path;

      break;
    case MDB_VIEW_NAVIGATE_CANCEL:
      state = {
        ...state
      };

      delete state.pathLoading;
      state.status = state.previousStatus;
      delete state.previousStatus;

      break;
    case MDB_VIEW_DO_UPDATE:

    case MDB_VIEW_UPDATE:
      console.log('got view update', action, state);
      if (!action.view) {
        break;
      }

      state = {
        ...state
      };

      if (state.status === LoadingStatus.LOADING) {
        // Check path is the same as what is being loaded
        if (action.id && state.loadingId === action.id) {
          state.view = action.view;
          state.status = LoadingStatus.LOADED;
          state.currentId = action.id;
          delete state.loadingId;
        } else if (action.path && state.pathLoading === action.path) {
          state.view = action.view;
          state.status = LoadingStatus.LOADED;
          state.pathCurrent = action.path;
          delete state.pathLoading;
        }
      } else {
        if (action.id && state.currentId === action.id
            || action.path && state.pathCurrent === action.path) {
          state.update[''] = action.view
          state.status = LoadingStatus.NEW_UPDATE;
        }
      }
      break;
    case MDB_VIEW_DATA_UPDATE:
      if (typeof action.subscriptionId !== 'undefined') {
        const subscriptions = getValueInObject(state,
            ['view'].concat(action.path, ['subscriptions']));
        const subscription = subscriptions.find((item) => item.id === action.subscriptionId);

        console.log('got subscription', subscription, state,
            ['view'].concat(action.path, ['subscriptions']));

        if (typeof subscription !== 'undefined') {
          if (subscription.status === LoadingStatus.LOADING) {
            state = setIn(state, ['view'].concat(action.path), action.data);
            state = setIn(state,
                ['view'].concat(action.path, ['subscriptions', action.subscriptionId, 'status']),
                LoadingStatus.LOADED);
          } else {
            //TODO Add to updates
          }
        }
      } else {
        if (action.data.subscriptions instanceof Array) {
          const subscriptionPath = ['view'].concat(action.path, ['subscriptions']);
          let subscriptions = getValueInObject(state, subscriptionPath);

          if (typeof subscriptions === 'undefined') {
            state = setIn(state, subscriptionPath, action.data.subscriptions);
          } else {
            state = setIn(state, subscriptionPath, subscriptions.concat(action.data.subscriptions));
          }
        } else { // TODO Merge?
          state = setIn(state, ['view'].concat(action.path), action.data);
        }
      }
      break;
  }
  return state;
};

export default viewReducer;
