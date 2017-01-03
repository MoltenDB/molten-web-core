import createViewActions from '../../lib/actions/view';
import { MDB_ASYNC_LOADED, MDB_ASYNC_LOADING } from '../../lib/actions/index';
import { MDB_VIEW_NAVIGATE, MDB_VIEW_NAVIGATE_CANCEL, MDB_VIEW_UPDATE } from '../../lib/reducers/view';
import createFakeMoltenDB from '../helpers/moltendb';
import configureStore from 'redux-mock-store';
const Immutable = require('immutable');
let mockStore = configureStore();

describe('view actions', () => {
  describe('navigate()', () => {
    describe('with a new path', () => {
      it('dispatches a MDB_VIEW_NAVIGATE action', () => {
        const path = '/test';
        let callCount = 0,
            actionType,
            actionPath,
            actionSubscription;

        const initialState = Immutable.Map({
          path: '/something',
          status: MDB_ASYNC_LOADED
        });


        let store  = mockStore(initialState);

        store.dispatch = (action) => {
          callCount++;
          actionType = action.type;
          actionPath = action.path;
          actionSubscription = action.subscription;
        };

        const moltendb = createFakeMoltenDB({
          view: {
            store
          }
        });

        const viewActions = createViewActions(moltendb);

        viewActions.navigate(path);

        expect(actionType).toEqual(MDB_VIEW_NAVIGATE);
        expect(actionPath).toEqual(path);
        expect(actionSubscription).toBeDefined();
      });

      it('requests the path view from the database', () => {
        const path = '/test';
        let callCount = 0,
            getType,
            getFilter,
            getSubscriber;

        const initialState = Immutable.Map({
          path: '/something',
          status: MDB_ASYNC_LOADED
        });


        let store  = mockStore(initialState);

        const moltendb = createFakeMoltenDB({
          view: {
            store
          },
          server: {
            get: (type, filter, subscriber) => {
              callCount++;
              getType = type;
              getFilter = filter;
              getSubscriber = subscriber;
            }
          }
        });

        const viewActions = createViewActions(moltendb);

        viewActions.navigate(path);

        expect(callCount).toEqual(1);
        expect(getType).toEqual('path');
        expect(getFilter).toEqual(path);
        expect(getSubscriber).toEqual(jasmine.any(Function));
      });

      it('subscribes to the getter and dispatches an update when it receives data', () => {
        const path = '/test';
        let getCallCount = 0,
            dispatchCallCount = 0,
            getType,
            getFilter,
            getSubscriber,
            actionType,
            actionPath,
            actionData;

        const initialState = Immutable.Map({
          path: '/something',
          status: MDB_ASYNC_LOADED
        });


        let store  = mockStore(initialState);

        store.dispatch = (action) => {
          dispatchCallCount++;
          actionType = action.type;
          actionPath = action.path;
          actionData = action.data;
        };

        const moltendb = createFakeMoltenDB({
          view: {
            store
          },
          server: {
            get: (type, filter, subscriber) => {
              getCallCount++;
              getType = type;
              getFilter = filter;
              getSubscriber = subscriber;
            }
          }
        });

        const viewActions = createViewActions(moltendb);

        viewActions.navigate(path);

        expect(getSubscriber).toEqual(jasmine.any(Function));
        expect(dispatchCallCount).toEqual(1);

        const viewData = {};

        getSubscriber(viewData);

        expect(dispatchCallCount).toEqual(2);
        expect(actionType).toEqual(MDB_VIEW_UPDATE);
        expect(actionPath).toEqual(path);
        expect(actionData).toBe(viewData);
      });
    });

    it('doesn\'t call dispatch or get if currently on the navigated to page', () => {
      let dispatchCallCount = 0,
          getCallCount = 0;

      const initialState = Immutable.Map({
        path: '/test',
        status: MDB_ASYNC_LOADED
      });

      let store  = mockStore(initialState);

      store.dispatch = () => {
        dispatchCallCount++;
      };

      const moltendb = createFakeMoltenDB({
        view: {
          store
        },
        server: {
          get: () => {
            getCallCount++
          }
        }
      });

      const viewActions = createViewActions(moltendb);

      viewActions.navigate(initialState.get('path'));

      expect(dispatchCallCount).toEqual(0);
    });

    it('cancels a loading request if currently on the navigated to page', () => {
      const path = '/test';
      let actionType,
          actionPath,
          callCount = 0;

      const initialState = Immutable.Map({
        path: '/test',
        status: MDB_ASYNC_LOADING
      });

      let store  = mockStore(initialState);

      store.dispatch = (action) => {
        callCount++;
        actionType = action.type;
      };

      const moltendb = createFakeMoltenDB({
        view: {
          store
        }
      });

      const viewActions = createViewActions(moltendb);

      viewActions.navigate(path);

      expect(callCount).toEqual(1);
      expect(actionType).toEqual(MDB_VIEW_NAVIGATE_CANCEL);
    });

    it('does not dispatch an action with the path is equal to the current path', () => {
      const path = '/test';

      let actionType,
          actionPath,
          callCount = 0;

      const initialState = Immutable.Map({
        path: '/test1',
        status: MDB_ASYNC_LOADING,
        pathLoading: '/test'
      });

      let store  = mockStore(initialState);

      store.dispatch = () => {
        callCount++;
      };

      const moltendb = createFakeMoltenDB({
        view: {
          store
        }
      });

      const viewActions = createViewActions(moltendb);

      viewActions.navigate(path);

      expect(callCount).toEqual(0);
    });
  });
});
