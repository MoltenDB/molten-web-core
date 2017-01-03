import { MDB_VIEW_NAVIGATE, MDB_VIEW_NAVIGATE_CANCEL, MDB_VIEW_UPDATE } from '../reducers/view';
import { MDB_ASYNC_LOADING } from './index';

const createViewActions = (moltendb: MoltenDBInternal) => {
  return <ViewActions>{
    navigate: (path: string) => {
      let subscriptionId;

      const state = moltendb.view.store.getState();
      const currentPath = state.get('path');
      if (state.get('status') === MDB_ASYNC_LOADING) {
        if (state.get('pathLoading') === path) {
          return;
        } else if (currentPath === path) {
          moltendb.view.store.dispatch({
            type: MDB_VIEW_NAVIGATE_CANCEL
          });
          return;
        }
      }

      if (currentPath !== path) {
        // Send request
        if ((subscriptionId = state.get('subscription'))) {
          moltendb.server.unsubscribe(subscriptionId);
        }

        subscriptionId = moltendb.server.get('path', path, (pathData) => {
          const store = moltendb.view.store.getState();
          let actionType;

          moltendb.view.store.dispatch({
            type: MDB_VIEW_UPDATE,
            data: pathData,
            path: path
          });
        });
        
        moltendb.view.store.dispatch({
          type: MDB_VIEW_NAVIGATE,
          path: path,
          subscription: subscriptionId
        });
      }
    }
  };
};

export default createViewActions;
