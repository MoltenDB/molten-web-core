import { ViewState } from '../../typings/state';
import {
  MDB_VIEW_NAVIGATE,
  MDB_VIEW_NAVIGATE_CANCEL,
  MDB_VIEW_DO_UPDATE,
  MDB_VIEW_UPDATE
} from '../actions/view';
import {
  LoadingStatus
} from '../../typings/client';

export const viewReducer = (state: ViewState = {}, action: Action) => {
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
  }
  return state;
};

export default viewReducer;
