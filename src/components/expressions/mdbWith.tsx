import * as MDBWeb from '../../../typings/client';
import * as React from 'react';

import { checkData, resolveData } from '../lib/resolve';
import * as renderer from '../lib/render';

export const id = 'with';
export const name = 'Use item';
export const description = 'Displays the children using the given data';

export const options = {
};

/**
 * Renders a with expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const render = (props: renderer.MDBRenderProps): React.ComponentElement | Array<React.ComponentElement> => {
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

  return renderer.renderChildren({
    ...props,
    children: component.children,
    data: {
      data: {
        [component.id]: data
      },
      previous: props.data
    }
  });
};

/**
 * Checks a with expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const check = (props: renderer.MDBRenderProps): void => {
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

  renderer.checkChildren({
    ...props,
    children: component.children,
    data: {
      data: {
        [component.id]: data
      },
      previous: props.data
    }
  });
};
