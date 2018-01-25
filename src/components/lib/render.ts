import * as React from 'react';

import * as MDBWeb from 'molten-web';
import * as MDB from 'molten-core';
import * as MDBReact from '../../../typings/client';

import MDBView from '../mdbView';

import * as resolve from './resolve';
import { addKey } from '../../lib/utils';

export interface MDBRenderProps extends MDBReact.ComponentProps {
  /// Component to be rendered
  component: MDBWeb.ViewComponent,
  /// Whether or not render function can turn an array of componenets
  arrayOk?: boolean,
  [key: string]: any,
  /// Key to give to child components
  key: string | number
}

interface MDBChidrenRenderProps extends MDBRenderProps {
  /// Children to render
  children: Array<MDBWeb.ViewComponent>,
  /// Key to give to child components
  key: string
}

/**
 * Renders the children of a component
 *
 * @param props Properties to use in rendering of the children
 *
 * @returns Rendered children
 */
export const renderChildren = (props: MDBChidrenRenderProps): Array<React.ReactNode> => {
  const {children} = props;
  const logger = props.mdb.logger;

  //logger('renderChildren', 'debug', 'Rendering children', children, 'with', props);

  let renderedChildren = [];

  children.forEach((child, key: number | string) => {
    if (typeof props.key !== 'undefined') {
      key = addKey(props.key, key);
    }
    if (child instanceof Array) {
      renderedChildren = renderedChildren.concat(renderChildren({
        ...props,
        children: child
      }));
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
        const resolved = resolve.resolveData(props, child);
        if (resolved === null || typeof resolved === 'undefined') {
          renderedChildren.push(resolved);
        } else {
          let value = resolved.valueOf();
          if (!(value instanceof Date) && ['string', 'number'].indexOf(typeof value) === -1) {
            value = JSON.stringify(value);
          }
          renderedChildren.push(value);
        }
        /*XXX if (typeof resolved === 'function') {
          renderedChildren.push(resolved());
        } else {
          renderedChildren.push(resolved);
        }*/
      } else if (child.$view) {
        const view = resolve.resolveView(props, child.$view);
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
export const render = (props: MDBRenderProps): React.ReactNode | Array<React.ReactNode> => {
  const component = props.component;
  const logger = props.mdb.logger;

  // Delegate to expression renderers
  if (component.expression) {
    // Check if we have a handler for the expression
    if (typeof props.mdb.expressions[component.expression] !== 'undefined') {
      return props.mdb.expressions[component.expression].render(props);
    } else {
      logger('render', 'error',
          `No expression handler for expression ${component.expression}`);
      return;
    }
  } else if (component.component) {
    if (typeof props.mdb.components[component.component] !== 'undefined') {
      const selectedComponent = props.mdb.components[component.component];

      // Render children
      let children;
      if (component.children) {
        children = renderChildren({
          ...props,
          children: component.children
        });
      }

      // Deference properties
      let properties = {};
      if (component.properties) {
        properties = resolve.resolveObject(props, component.properties, typeof selectedComponent.resolve === 'function');
      }

      //logger('render', 'debug', `Rendering a ${component.component} with`, properties, children);

      if (selectedComponent.component) {
        return React.createElement(selectedComponent.component, properties, children);
      } else if (selectedComponent.render) {
        return selectedComponent.render({
          ...properties,
          children
        });
      /*XXX TODO Move to library module as check } else {
        logger('render', 'error', `Componet ${component.component} has no renderer`);
        return;*/
      }

    } else {
      logger('render', 'error', `No component ${component.component}`);
      return;
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

  let attributes = {};

  if (component.attributes) {
    attributes = resolve.resolveObject(props, component.attributes);
  }

  //logger('render', 'debug', 'Rendering component', component, children);
  return React.createElement(component.tag, {
    ...attributes,
    key: props.key
  }, children);
};

/**
 * Checks the references in children of a component
 *
 * @param props Properties to use in rendering of the children
 */
export const checkChildren = (props: MDBChidrenRenderProps): void => {
  const {children} = props;
  const logger = props.mdb.logger;

  //logger('checkChildren', 'debug', 'Checking $refs in children', children, 'with', props);

  children.forEach((child, key: number | string) => {
    if (typeof props.key !== 'undefined') {
      key = addKey(props.key, key);
    }
    if (child instanceof Array) {
      checkChildren({
        ...props,
        children: child
      });
    } else if (typeof child === 'object') {
      // Having this here instead of in render will mean sub views can't just
      // be references
      if (child.$ref) {
        resolve.checkData(props, child);
      } else if (child.$view) {
        //TODO Handle View?
      } else {
        checkComponent({
          ...props,
          key,
          component: child,
          arrayOk: true
        });
      }
    }
  });
};

/**
 * Checks the references in the given component using the given properties
 *
 * @param props Component to check the references of and properties to use in
 *   checking
 */
export const checkComponent = (props: MDBRenderProps): void => {
  const component = props.component;
  const logger = props.mdb.logger;

  // Delegate to expression renderers
  if (component.expression) {
    // Check if we have a handler for the expression
    if (typeof props.mdb.expressions[component.expression] !== 'undefined') {
      return props.mdb.expressions[component.expression].check(props);
    } else {
      logger('checkComponent', 'error',
          `No expression handler for expression ${component.expression}`);
      return;
    }
  } else if (component.component) {
    if (typeof props.mdb.components[component.component] !== 'undefined') {
      const selectedComponent = props.mdb.components[component.component];

      // Render children
      let children;
      if (component.children) {
        children = checkChildren({
          ...props,
          children: component.children
        });
      }

      // Deference properties
      let properties = {};
      if (component.properties) {
        properties = resolve.checkObject(props, component.properties, typeof selectedComponent.resolve === 'function');
      }

      if (selectedComponent.render) {
        //logger('checkComponent', 'debug', `Checkinging ${component.component} component with`, properties, children);
        return selectedComponent.render({
          ...properties,
          children
        });
      }
    } else {
      logger('render', 'error', `No component ${component.component}`);
      return;
    }
  }

  if (component.children) {
    checkChildren({
      ...props,
      children: component.children
    });
  }

  let attributes = {};

  if (component.attributes) {
    attributes = resolve.checkObject(props, component.attributes);
  }
};
