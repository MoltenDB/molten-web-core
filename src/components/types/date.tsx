import * as React from 'react';
import * as moment from 'moment';

import {
  validate as typeValidate,
  test as typeTest
} from 'molten-type-base/types/date';
export { label, description, options } from 'molten-type-base/types/date';

export const id = 'date';

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
  const makeMoment = (value: number) => {
    switch (options.format) {
      case 'date':
        return moment(value.toString(), 'YYYYMMDD');
      case 'time':
        return moment(value.toString(), 'HHmm');
      case 'datetime':
      default:
      return moment(value * 1000);
    }
  };

  const change = (event) => {
    if (!onChange) {
      return;
    }
  };

  if (false) {
    return (
      <input onChange={change} value={value} />
    );
  }

  let format;

  if (parameters && parameters.format) {
    format = parameters.format;
  } else {
    switch (options.format) {
      case 'date':
        format = 'DD MMM YYYY';
        break;
      case 'time':
        format = 'hh:mm';
        break;
      case 'datetime':
      default:
        format = 'DD MMM YYYY hh:mm';
        break;
    }
  }

  return makeMoment(item[name]).format(format);
}

