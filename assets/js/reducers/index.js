import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import table from './table';
import user from './user';
import game from './game';

const appReducer = combineReducers({
  form,
  table,
  user,
  game,
});

export default function (state, action) {
  return appReducer(state, action);
}
