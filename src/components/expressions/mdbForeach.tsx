import * as MDBWebReact from '../../../typings/client';
import * as MDBWeb from 'molten-web';
import * as React from 'react';

import { checkData, resolveData } from '../lib/resolve';
import * as renderer from '../lib/render';
import { addKey } from '../../lib/utils';

export const id = 'foreach';
export const name = 'Items iterator';
export const description = 'Iterate through a collection of items';

export const options = {
};

const getData = (props: renderer.MDBRenderProps): any => {
  const component = props.component;
};

interface ForeachProps extends renderer.MDBRenderProps {
  component: MDBWeb.ViewForeachExpression
}

/**
 * Renders a foreach expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const render = (props: ForeachProps): React.ReactNode | Array<React.ReactNode> => {
  const component = props.component;
  let {data} = component;

  // Do nothing if there is nothing to render
  if (!component.children) {
    return null;
  }

  if (typeof data.$ref !== 'undefined') {
    // Resolve the data
    data = resolveData(props, data);
  }

  if (!data) {
    // TODO Go through the children so the data handlers can resolve their data?
    return null;
  }

  let result = [];

  /**
   * Render an item from the data
   *
   * @param item Data item to use in render
   * @param key Key of data item
   */
  const renderDataItem = (item, key) => {
    if (typeof props.key !== 'undefined') {
      key = addKey(props.key, key);
    }

    const rendered = renderer.renderChildren({
      ...props,
      key,
      children: component.children,
      data: {
        data: {
          [component.id]: item,
        },
        previous: props.data
      }
    });

    if (rendered instanceof Array) {
      result = result.concat(rendered);
    } else {
      result.push(rendered);
    }
  };

  if (typeof data[Symbol.iterator] !== 'undefined') {
    let i = 0;
    for (const item of data) {
      renderDataItem(item, i++);
    }
  } else if (data instanceof Array) {
    data.forEach(renderDataItem);
  } else if (typeof data === 'object') {
    Object.keys(data).forEach((key) => {
      renderDataItem(data[key], key);
    });
  }

  return result;
};

/**
 * Renders a foreach expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const check = (props: ForeachProps): void => {
  const component = props.component;
  let {data} = component;

  // Do nothing if there is nothing to render
  if (!component.children) {
    return;
  }

  if (typeof data.$ref !== 'undefined') {
    // Resolve the data
    data = checkData(props, data);
  }

  if (!data) {
    // TODO Go through the children so the data handlers can resolve their data?
    return null;
  }

  /**
   * Render an item from the data
   *
   * @param item Data item to use in check
   * @param key Key of data item
   */
  const checkDataItem = (item, key) => {
    if (typeof props.key !== 'undefined') {
      key = addKey(props.key, key);
    }

    renderer.checkChildren({
      ...props,
      key,
      children: component.children,
      data: {
        data: {
          [component.id]: item,
        },
        previous: props.data
      }
    });
  };

  if (typeof data[Symbol.iterator] !== 'undefined') {
    let i = 0;
    for (const item of data) {
      checkDataItem(item, i++);
    }
  } else if (data instanceof Array) {
    data.forEach(checkDataItem);
  } else if (typeof data === 'object') {
    Object.keys(data).forEach((key) => {
      checkDataItem(data[key], key);
    });
  }
};
