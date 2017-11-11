import * as MDBWeb from '../typings/mdb-web';
import * as render from '../lib/render';
import * as React from 'react';

import { resolveData } from '../lib/resolve';
import * as renderer from '../lib/render';

export const id = 'if';
export const name = 'Test';
export const description = 'Displays the child components only if the test is true';

export const options = {
};

/**
 * Renders an if expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const render = (props: MDBRenderProps): React.ComponentElement | Array<React.ComponentElement> => {
  const logger = props.mdb.logger;
  const component = props.component;
  let {data} = component;

  // Do nothing if there is nothing to render
  if (!component.children) {
    return null;
  }

  if (typeof data.$ref !== 'undefined') {
    // Resolve the data
    data = resolveData(props, data.$ref);
  }

  if (typeof data === 'function') {
    data = data();
  }

  if (!data) {
    // TODO Go through the children so the data handlers can resolve their data?
    return null;
  }

  return renderer.renderChildren({
    ...props,
    children: component.children
  });
};
