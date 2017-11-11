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
    const logger = props.mdb.logger;
    const component = props.component;
    let { data } = component;
    logger('with renderer', 'debug', 'Rendering with', component);
    // Do nothing if there is nothing to render
    if (!component.children) {
        return null;
    }
    if (typeof data.$ref !== 'undefined') {
        // Resolve the data
        data = resolve_1.resolveData(props, data.$ref);
    }
    return renderer.renderChildren(Object.assign({}, props, { children: component.children, data: {
            data: {
                [component.id]: data
            },
            previous: props.data
        } }));
};
