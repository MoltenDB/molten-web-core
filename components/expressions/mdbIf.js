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
    const logger = props.mdb.logger;
    const component = props.component;
    let { data } = component;
    // Do nothing if there is nothing to render
    if (!component.children) {
        return null;
    }
    if (typeof data.$ref !== 'undefined') {
        // Resolve the data
        data = resolve_1.resolveData(props, data.$ref);
    }
    if (typeof data === 'function') {
        data = data();
    }
    if (!data) {
        // TODO Go through the children so the data handlers can resolve their data?
        return null;
    }
    return renderer.renderChildren(Object.assign({}, props, { children: component.children }));
};
