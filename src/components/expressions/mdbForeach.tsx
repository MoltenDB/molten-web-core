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
  const logger = props.mdb.logger.id('forEach');
  const component = props.component;
  let {data} = component;

  logger.debug('Rendering forEach', component);

  // Do nothing if there is nothing to render
  if (!component.children) {
    return null;
  }

  if (typeof data.$ref !== 'undefined') {
    // Resolve the data
    logger.debug('Resolving data reference', data.$ref, resolveData(props, data.$ref));
    data = resolveData(props, data.$ref);
  }

  // TODO Handle data as function
  /*XXX? if (typeof data === 'function') {
    data = data();
  }*/

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
    logger.debug('rendering forEach', component.id, 'children', component.children, 'with', item, {
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
    logger.debug('rendered children is', rendered);

    if (rendered instanceof Array) {
      result = result.concat(rendered);
    } else {
      result.push(rendered);
    }
  };

  logger.debug('data for forEach is', data);
  if (typeof data[Symbol.iterator] !== 'undefined') {
    logger.debug('data has an iterator');
    let i = 0;
    for (const item of data) {
      logger.debug('item', item);
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
