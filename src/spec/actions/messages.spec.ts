import createMessageActions from '../../lib/actions/messages';
import { MDB_MESSAGE_ADD, MDB_MESSAGE_REMOVE, MDB_MESSAGE_TIMEOUT,
    MDB_MESSAGE_ACKNOWLEDGE } from '../../lib/reducers/messages';
import createFakeMoltenDB from '../helpers/moltendb';

describe('message actions', () => {
  describe('create()', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('returns the message ID', () => {
      let message = {
        id: 'alert'
      };

      let callCount = 0;

      const moltendb = createFakeMoltenDB({
        view: {
          store: {
            dispatch: (action) => {
              callCount++;
            }
          }
        }
      });

      let messageActions = createMessageActions(moltendb);


      let id = messageActions.create(message);
      expect(callCount).toEqual(1);
      expect(id).toEqual('alert');
    });
    
    it('adds an 1-up id to the message if one doesn\'t exist', () => {
      let message = {
        type: 'alert'
      };
      let actionType,
          actionMessage;

      const moltendb = createFakeMoltenDB({
        view: {
          store: {
            dispatch: (action) => {
              actionType = action.type;
              actionMessage = action.message;
            }
          }
        }
      });

      let messageActions = createMessageActions(moltendb);

      messageActions.create(message);

      expect(actionType).toEqual(MDB_MESSAGE_ADD);
      expect(actionMessage.type).toEqual(message.type);
      expect(actionMessage.id).toEqual(jasmine.any(Number));

      const firstId = actionMessage.id;

      messageActions.create(message);
      expect(actionMessage.id).toEqual(firstId + 1);
    });

    it('dispatches an MDB_MESSAGE_ADD action', () => {
      let message = {
        type: 'alert',
        id: 'test'
      };

      let actionType,
          actionMessage,
          callCount = 0;

      const moltendb = createFakeMoltenDB({
        view: {
          store: {
            dispatch: (action) => {
              callCount++;
              actionType = action.type;
              actionMessage = action.message;
            }
          }
        }
      });

      let messageActions = createMessageActions(moltendb);

      messageActions.create(message);

      expect(callCount).toEqual(1);
      expect(actionType).toEqual(MDB_MESSAGE_ADD);
      expect(actionMessage).toBe(message);
    });

    it('dispatch a MDB_MESSAGE_TIMEOUT action after the lifetime', () => {
      let timeoutReceived = false,
          callCount = 0;

      let message = {
        id: 'test',
        type: 'alert',
        label: 'test',
        lifetime: 100
      };

      const moltendb = createFakeMoltenDB({
        view: {
          store: {
            dispatch: (action) => {
              callCount++;
              if (action.type === MDB_MESSAGE_TIMEOUT) {
                expect(action.id).toEqual('test');
                timeoutReceived = true;
              }
            }
          }
        }
      });

      let messageActions = createMessageActions(moltendb);

      messageActions.create(message);

      expect(callCount).toEqual(1);

      jasmine.clock().tick(50);

      expect(timeoutReceived).toBe(false);

      jasmine.clock().tick(51);

      expect(timeoutReceived).toBe(true);
      expect(callCount).toEqual(2);
    });
  });

  describe('acknowledge()', () => {
    it('should dispatch an MDB_MESSAGE_ACKNOWLEDGE action', () => {
      let actionType,
          actionId;

      const moltendb = createFakeMoltenDB({
        view: {
          store: {
            dispatch: (action) => {
              actionType = action.type;
              actionId = action.id;
            }
          }
        }
      });

      let messageActions = createMessageActions(moltendb);

      messageActions.acknowledge('test');

      expect(actionType).toEqual(MDB_MESSAGE_ACKNOWLEDGE);
      expect(actionId).toBe('test');
    });
  });

  describe('remove()', () => {
    it('should dispatch an MDB_MESSAGE_REMOVE action', () => {
      let actionType,
          actionId;

      const moltendb = createFakeMoltenDB({
        view: {
          store: {
            dispatch: (action) => {
              actionType = action.type;
              actionId = action.id;
            }
          }
        }
      });

      let messageActions = createMessageActions(moltendb);

      messageActions.remove('test');

      expect(actionType).toEqual(MDB_MESSAGE_REMOVE);
      expect(actionId).toBe('test');
    });
  });
});
