import { MDB_ASYNC_LOADING } from '../actions/index';
const Immutable = require('immutable');

export const MDB_VIEW_NAVIGATE = 'MDB_VIEW_NAVIGATE';
export const MDB_VIEW_NAVIGATE_CANCEL = 'MDB_VIEW_NAVIGATE_CANCEL';
export const MDB_VIEW_REPLACE = 'MDB_VIEW_REPLACE';
export const MDB_VIEW_UPDATE = 'MDB_VIEW_UPDATE';
export const MDB_VIEW_DO_UPDATE = 'MDB_VIEW_DO_UPDATE';

export const viewReducer = (state = Immutable.Map(), action: Action) => {
  switch (action.type) {
    case MDB_VIEW_NAVIGATE:
      if (state.get('status') !== MDB_ASYNC_LOADING) {
        state = state.set('previousStatus', state.get('status'));
      }

      return state.withMutations(ctx => {
        ctx.set('status', MDB_ASYNC_LOADING)
            .set('pathLoading', action.path);
      });
    case MDB_VIEW_NAVIGATE_CANCEL:
      return state.withMutations(ctx => {
        ctx.delete('pathLoading')
            .set('status', state.get('previousStatus'));
      });
    case MDB_VIEW_DO_UPDATE:

    case MDB_VIEW_UPDATE:
      // Check the path is correct
      if (state.get('path') === action.path) {
        if (state.get('status') === MDB_ASYNC_LOADING) {
          return state.withMutations(ctx => {
            ctx.set('data', action.data)
                .set('status', MDB_ASYNC_LOADED);
          });
        }
      }
      break;
  }
  return state;
};

export default viewReducer;
