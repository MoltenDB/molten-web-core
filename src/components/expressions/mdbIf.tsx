import * as MDBWeb from '../../../typings/client';
import * as React from 'react';

import {
  checkData,
  resolveData
} from '../lib/resolve';
import * as renderer from '../lib/render';

export const id = 'if';
export const name = 'Test';
export const description = 'Displays the child components only if the test is true';

export const options = {
};

interface IfProps extends renderer.MDBRenderProps {
  component: MDBWeb.ViewIfExpression
}

/**
 * Renders an if expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const render = (props: IfProps): React.ReactNode | Array<React.ReactNode> => {
  const component = props.component;
  let {data} = component;

  // Do nothing if there is nothing to render
  if (!component.children) {
    return null;
  }

  if (typeof data === 'object' && typeof data.$ref !== 'undefined') {
    // Resolve the data
    data = resolveData(props, data);
    if (data !== null && typeof data !== 'undefined') {
      data = data.valueOf();
    }
  }

  if (props.operator) {
    if (props.operand) {
      let operand;
      if (typeof props.operand === 'object'
          && typeof props.operand.$ref === 'undefined') {
        operand = resolveData(props, data);
        if (operand !== null && typeof operand !== 'undefined') {
          operand = operand.valueOf();
        }
      } else {
        operand = props.operand;
      }

      switch (props.operator) {
        case '!=':
          if (data != operand) {
            return null;
          }
          break;
        case '==':
          if (data == operand) {
            return null;
          }
          break;
        case '<':
          if (data < operand) {
            return null;
          }
          break;
        case '>':
          if (data > operand) {
            return null;
          }
          break;
        case '<=':
          if (data <= operand) {
            return null;
          }
          break;
        case '>=':
          if (data >= operand) {
            return null;
          }
          break;
      }
    }
  } else if (!data) {
    return null;
  }

  return renderer.renderChildren({
    ...props,
    children: component.children
  });
};

/**
 * Checks an if expression
 *
 * @param props Properties to use in rendering of the expression
 */
export const check = (props: IfProps): void => {
  const component = props.component;
  let {data} = component;

  // Do nothing if there is nothing to render
  if (!component.children) {
    return;
  }

  if (typeof data === 'object' && typeof data.$ref !== 'undefined') {
    // Resolve the data
    data = checkData(props, data);
    if (data !== null && typeof data !== 'undefined') {
      data = data.valueOf();
    }
  }

  if (data !== null) {
    if (props.operator) {
      if (props.operand) {
        let operand;
        if (typeof props.operand === 'object'
            && typeof props.operand.$ref === 'undefined') {
          operand = resolveData(props, data);
          if (operand !== null && typeof operand !== 'undefined') {
            operand = operand.valueOf();
          }
        } else {
          operand = props.operand;
        }

        if (operand !== null) {
          switch (props.operator) {
            case '!=':
              if (data == operand) {
                return;
              }
              break;
            case '==':
              if (data != operand) {
                return;
              }
              break;
            case '<':
              if (data >= operand) {
                return;
              }
              break;
            case '>':
              if (data <= operand) {
                return;
              }
              break;
            case '<=':
              if (data > operand) {
                return;
              }
              break;
            case '>=':
              if (data < operand) {
                return;
              }
              break;
          }
        }
      }
    } if (!data) {
      return;
    }
  }

  renderer.checkChildren({
    ...props,
    children: component.children
  });
};
