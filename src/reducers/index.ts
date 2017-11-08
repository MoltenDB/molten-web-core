import { combineReducers } from 'redux';
import createAlertReducer from './alertReducers';
import view from './view';
import messages from './messages';

const reducer = combineReducers({
  view,
  messages
});

export default reducer;
