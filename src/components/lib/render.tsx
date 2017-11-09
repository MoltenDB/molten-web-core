import * as React from 'react';

import * as MDBWeb from 'mdb-web';
import * as MDB from 'molten-core';
import * as MDBReact from '../../../typings/client';

import { resolveData } from './resolve';
import { addKey } from '../../lib/utils';

interface MDBRenderProps extends MDBReact.ComponentProps {
  /// Component to be rendered
  component: MDBWeb.ViewComponent,
  /// Whether or not render function can turn an array of componenets
  arrayOk?: boolean
}

interface MDBChidrenRenderProps extends MDBReact.ComponentProps {
  /// Children to render
  children: Array<MDB.ViewComponent>
}

/**
 * Renders the children of a component
 *
 * @param props Properties to use in rendering of the children
 *
 * @returns Rendered children
 */
export const renderChildren = (props: MDBChidrenRenderProps): Array<React.ComponentElement> => {
  const {children} = props;

  props.mdb.logger('renderChildren', 'debug', 'Rendering children', children);

  let renderedChildren = [];

  children.forEach((child, key) => {
    if (typeof props.key !== 'undefined') {
      key = addKey(props.key, key);
    }
    if (child instanceof Array) {
      renderedChildren = renderedChildren.concat(child);
    } else if (typeof child !== 'object') {
      renderedChildren.push(child);
    } else {
      // Having this here instead of in render will mean sub views can't just
      // be references
      if (child.$ref) {
        // TODO For Molten data handler, this will be returning an input if
        // editing is enabled. It will therefore need to know if editing and
        // the likes are enabled, so it will probably need props. What is the
        // resolve function?
        const resolved = resolveData(props, child.$ref);
        if (typeof resolved === 'function') {
          renderedChildren.push(resolved());
        } else {
          renderedChildren.push(resolved);
        }
      } else if (child.$view) {
        const view = resolveView(props, child.$view);
        if (view) {
          renderedChildren.push(React.createElement(MDBView, {
            view,
            data
          }));
        }
      } else {
        const rendered = render({
          ...props,
          key,
          component: child,
          arrayOk: true
        });

        if (rendered instanceof Array) {
          renderedChildren = renderedChildren.concat(rendered);
        } else {
          renderedChildren.push(rendered);
        }
      }
    }
  });

  return renderedChildren;
};

/**
 * Render the given component using the given properties
 *
 * @param props Component to render and properties to use in rendering
 */
export const render = (props: MDBRenderProps): React.ComponentElement | Array<React.ComponentElement> => {
  const component = props.component;
  const logger = props.mdb.logger;

  // Delegate to expression renderers
  if (component.expression) {
    // Check if we have a handler for the expression
    logger('render', 'debug', 'Expressions available are', Object.keys(props.mdb.expressions));
    if (typeof props.mdb.expressions[component.expression] !== 'undefined') {
      return props.mdb.expressions[component.expression].render(props);
    } else {
      props.mdb.logger('render', 'error',
          `No expression handler for expression ${component.expression}`);
      return null;
    }
  }

  // Render children
  let children = [],
      tag;

  if (component.children) {
    children = renderChildren({
      ...props,
      children: component.children
    });
  }

  logger('render', 'debug', 'Rendering component', component, children);
  return React.createElement(component.tag, {
    ...component.attributes,
    key: props.key
  }, children);
};

