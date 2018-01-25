import * as React from 'react';

import {
  validate as typeValidate,
  test as typeTest
} from 'molten-type-base/types/boolean';
export { label, description, options } from 'molten-type-base/types/boolean';

export const id = 'boolean';

// Delagate functionality to the base type
export const validate = ({ name, options, item, value }) => typeValidate(name, options, item, value);
export const test = ({ name, options, item, test, parameters }) => typeTest(name, options, item, test, parameters);

export const fields = ({ name, options }) => {
  return {
    [name]: {
      label: options.label
    }
  };
};

export const label = ({ name, options, item }) => {
  return options.label;
};

export const value = (name, options, item, parameters, onChange) => {
  const change = (event) => {
    if (!onChange) {
      return;
    }
  };

  if (false) {
    return (
      <input type='checkbox' onChange={change} value={value} />
    );
  }

  if (item[name]) {
    return options.trueString || 'true';
  } else {
    return options.falseString || 'false';
  }
};


