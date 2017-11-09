"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const resolve_1 = require("./resolve");
const utils_1 = require("../../lib/utils");
/**
 * Renders the children of a component
 *
 * @param props Properties to use in rendering of the children
 *
 * @returns Rendered children
 */
exports.renderChildren = (props) => {
    const { children } = props;
    props.mdb.logger('renderChildren', 'debug', 'Rendering children', children);
    let renderedChildren = [];
    children.forEach((child, key) => {
        if (typeof props.key !== 'undefined') {
            key = utils_1.addKey(props.key, key);
        }
        if (child instanceof Array) {
            renderedChildren = renderedChildren.concat(child);
        }
        else if (typeof child !== 'object') {
            renderedChildren.push(child);
        }
        else {
            // Having this here instead of in render will mean sub views can't just
            // be references
            if (child.$ref) {
                // TODO For Molten data handler, this will be returning an input if
                // editing is enabled. It will therefore need to know if editing and
                // the likes are enabled, so it will probably need props. What is the
                // resolve function?
                const resolved = resolve_1.resolveData(props, child.$ref);
                if (typeof resolved === 'function') {
                    renderedChildren.push(resolved());
                }
                else {
                    renderedChildren.push(resolved);
                }
            }
            else if (child.$view) {
                const view = resolveView(props, child.$view);
                if (view) {
                    renderedChildren.push(React.createElement(MDBView, {
                        view,
                        data
                    }));
                }
            }
            else {
                const rendered = exports.render(Object.assign({}, props, { key, component: child, arrayOk: true }));
                if (rendered instanceof Array) {
                    renderedChildren = renderedChildren.concat(rendered);
                }
                else {
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
exports.render = (props) => {
    const component = props.component;
    const logger = props.mdb.logger;
    // Delegate to expression renderers
    if (component.expression) {
        // Check if we have a handler for the expression
        logger('render', 'debug', 'Expressions available are', Object.keys(props.mdb.expressions));
        if (typeof props.mdb.expressions[component.expression] !== 'undefined') {
            return props.mdb.expressions[component.expression].render(props);
        }
        else {
            props.mdb.logger('render', 'error', `No expression handler for expression ${component.expression}`);
            return null;
        }
    }
    // Render children
    let children = [], tag;
    if (component.children) {
        children = exports.renderChildren(Object.assign({}, props, { children: component.children }));
    }
    logger('render', 'debug', 'Rendering component', component, children);
    return React.createElement(component.tag, Object.assign({}, component.attributes, { key: props.key }), children);
};
