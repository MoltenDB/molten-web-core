import * as utils from './utils';
import test from 'ava';

test('getValueInObject() returns the value from deep in an object', (t) => {
  t.is(utils.getValueInObject({
    test: [
      'one',
      {
        value: 'good'
      }
    ]
  }, ['test', 1, 'value']), 'good');
});

test('getValueInObject() doesn\'t freak out if object isn\'t as deep as path', (t) => {
  t.is(typeof utils.getValueInObject({
    value: 'oops'
  }, [ 'value', 'deep', 'in', 'here']), 'undefined');
});

test('addKey() concats keys together', (t) => {
  t.is(utils.addKey('current', 'new'), 'current-new');
});
