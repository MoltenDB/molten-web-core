import * as MDBWeb from '../../../typings/client';
import * as React from 'react';

import { resolveData } from '../lib/resolve';
import * as renderer from '../lib/render';
import { addKey } from '../../lib/utils';

export const id = 'foreach';
export const name = 'Items iterator';
export const description = 'Iterate through a collection of items';

export const options = {
};

/**
 * Renders a foreach expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const render = (props: renderer.MDBRenderProps): React.Component | Array<React.Component> => {
  const logger = props.mdb.logger;
  const component = props.component;
  let {data} = component;

  logger('forEach renderer', 'debug', 'Rendering forEach', component);

  // Do nothing if there is nothing to render
  if (!component.children) {
    return null;
  }

  if (typeof data.$ref !== 'undefined') {
    // Resolve the data
    logger('forEach rendered', 'debug', 'Resolving data reference', data.$ref, resolveData(props, data.$ref));
    data = resolveData(props, data.$ref);
  }

  // TODO Handle data as function
  if (typeof data === 'function') {
    data = data();
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
