"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = require("../lib/resolve");
const renderer = require("../lib/render");
exports.id = 'if';
exports.name = 'Test';
exports.description = 'Displays the child components only if the test is true';
exports.options = {};
/**
 * Renders an if expression
 *
 * @param props Properties to use in rendering of the expression
 */
exports.render = (props) => {
    const component = props.component;
    let { data } = component;
    // Do nothing if there is nothing to render
    if (!component.children) {
        return null;
    }
    if (typeof data === 'object' && typeof data.$ref !== 'undefined') {
        // Resolve the data
        data = resolve_1.resolveData(props, data);
        if (data !== null && typeof data !== 'undefined') {
            data = data.valueOf();
        }
    }
    if (props.operator) {
        if (props.operand) {
            let operand;
            if (typeof props.operand === 'object'
                && typeof props.operand.$ref === 'undefined') {
                operand = resolve_1.resolveData(props, data);
                if (operand !== null && typeof operand !== 'undefined') {
                    operand = operand.valueOf();
                }
            }
            else {
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
    }
    else if (!data) {
        return null;
    }
    return renderer.renderChildren(Object.assign({}, props, { children: component.children }));
};
/**
 * Checks an if expression
 *
 * @param props Properties to use in rendering of the expression
 */
exports.check = (props) => {
    const component = props.component;
    let { data } = component;
    // Do nothing if there is nothing to render
    if (!component.children) {
        return;
    }
    if (typeof data === 'object' && typeof data.$ref !== 'undefined') {
        // Resolve the data
        data = resolve_1.checkData(props, data);
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
                    operand = resolve_1.resolveData(props, data);
                    if (operand !== null && typeof operand !== 'undefined') {
                        operand = operand.valueOf();
                    }
                }
                else {
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
        }
        if (!data) {
            return;
        }
    }
    renderer.checkChildren(Object.assign({}, props, { children: component.children }));
};
//# sourceMappingURL=mdbIf.js.map