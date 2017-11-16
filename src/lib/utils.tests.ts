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

test('getValueInObject() doesn\'t modify the given path array', (t) => {
  let path = ['test', 1, 'value'];
  let copy = path.slice();

  utils.getValueInObject({
    test: [
      'one',
      {
        value: 'good'
      }
    ]
  }, copy);

  t.deepEqual(copy, path, 'path array was modified');
});


test('addKey() concats keys together', (t) => {
  t.is(utils.addKey('current', 'new'), 'current-new');
});


test('setIn() sets the value at the path to the given value', (t) => {
  const originalObject = {
    test: {
      value: [
        {
          deep: 'in here',
        }
      ]
    }
  };

  t.deepEqual(utils.setIn(originalObject,
      ['test', 'value', 0, 'deep'], 'cool'), {
    test: {
      value: [
        {
          deep: 'cool'
        }
      ]
    }
  });
});

test('setIn() doesn\'t change the original object', (t) => {
  const originalObject = {
    test: {
      value: [
        {
          deep: 'in here',
          another: {
            value: 'great'
          }
        }
      ]
    },
    another: {
      value: 'static'
    }
  };

  const newObject = utils.setIn(originalObject,
        ['test', 'value', 0, 'deep'], 'cool');

  t.is(originalObject.test.value[0].deep, 'in here');
});

test('setIn() doesn\'t modify the given path array', (t) => {
  let path = ['test', 1, 'value'];
  let copy = path.slice();

  utils.setIn({
    test: [
      'one',
      {
        value: 'good'
      }
    ]
  }, copy, 'newValue');

  t.deepEqual(copy, path, 'path array was modified');
});

test('setIn() only shallowly copies the original Object', (t) => {
  const originalObject = {
    test: {
      value: [
        {
          deep: 'in here',
          another: {
            value: 'great'
          }
        }
      ]
    },
    another: {
      value: 'static'
    }
  };

  const newObject = utils.setIn(originalObject,
        ['test', 'value', 0, 'deep'], 'cool');

  t.is(newObject.another, originalObject.another);
  t.is(newObject.test.value[0].another, originalObject.test.value[0].another);
});

test('setIn() should create nodes that don\'t exist', (t) => {
  const emptyObject = {};

  t.deepEqual(utils.setIn(emptyObject, ['test'], 'new Value'), {
    test: 'new Value'
  });
  t.is(typeof emptyObject.test, 'undefined');
});

test('setIn() should shallowly merge with current value if new and old values objects', (t) => {
  const originalObject = {
    test: {
      dont: {
        touch: 'me'
      },
      another: {
        test: 'value'
      }
    }
  };

  const newObject = utils.setIn(originalObject, ['test'], {
    another: 'value'
  });

  t.deepEqual(newObject, {
    test: {
      dont: {
        touch: 'me'
      },
      another: 'value'
    }
  }, 'newObject doesn\'t match what it should');

  t.is(newObject.test.dont, originalObject.test.dont, 'dont has been changed');
});

test('setIn() should replace array value if merge not set', (t) => {
  const originalObject = {
    value: ['one', 'two']
  };

  const newObject = utils.setIn(originalObject, ['value'], [ 'three', 'four' ]);

  t.deepEqual(newObject.value, ['three', 'four']);
});

test('setIn() should replace array value if merge set to true', (t) => {
  const originalObject = {
    value: ['one', 'two']
  };

  const newObject = utils.setIn(originalObject, ['value'], [ 'three', 'four' ], true);

  t.deepEqual(newObject.value, ['one', 'two', 'three', 'four']);
});


test('containSameValues() throws if not given two arrays', (t) => {
  t.throws(() => {
    utils.containSameValues([], 'something');
  });

  t.throws(() => {
    utils.containSameValues('something', []);
  });
});

test('containSameValues() returns if the arrays contain the same values', (t) => {
  t.is(utils.containSameValues(['one', 'two', 'three'], ['three', 'two', 'one']), true);
  t.is(utils.containSameValues(['one', 'four'], ['one', 'two']), false);
});
