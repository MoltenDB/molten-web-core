import * as React from 'react';

import {
  validate as typeValidate,
  test as typeTest
} from 'molten-type-base/types/number';
export { label, description, options } from 'molten-type-base/types/number';

export const id = 'number';

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

export const value = (name, options, item, parameters, onChanage) => {
  console.log('number value', name, parameters);
  const change = (event) => {
    if (!onChange) {
      return;
    }
  };

  if (false) {
    return (
      <input type='number' onChange={change} value={value} />
    );
  }

  if (item[name] === null) {
    return '';
  }

  const precision = (parameters && typeof parameters.precision === 'number') ? parameters.precision : options.precision;
  const decimal = (parameters && typeof parameters.decimal === 'number') ? parameters.decimal : options.decimal;
  if (typeof precision === 'number') {
    return item[name].toPrecision(precision);
  } else if (typeof decimal === 'number') {
    console.log('to decimal', item[name], item[name].toFixed(decimal));
    return item[name].toFixed(decimal);
  } else {
    return item[name];
  }
};

