"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = require("../lib/resolve");
const renderer = require("../lib/render");
exports.id = 'with';
exports.name = 'Use item';
exports.description = 'Displays the children using the given data';
exports.options = {};
/**
 * Renders a with expression
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
    if (typeof data.$ref !== 'undefined') {
        // Resolve the data
        data = resolve_1.resolveData(props, data);
    }
    return renderer.renderChildren(Object.assign({}, props, { children: component.children, data: {
            data: {
                [component.id]: data
            },
            previous: props.data
        } }));
};
/**
 * Checks a with expression
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
    if (typeof data.$ref !== 'undefined') {
        // Resolve the data
        data = resolve_1.checkData(props, data);
    }
    renderer.checkChildren(Object.assign({}, props, { children: component.children, data: {
            data: {
                [component.id]: data
            },
            previous: props.data
        } }));
};
//# sourceMappingURL=mdbWith.js.map