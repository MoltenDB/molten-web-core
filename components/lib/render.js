"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const mdbView_1 = require("../mdbView");
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
    const logger = props.mdb.logger;
    //logger('renderChildren', 'debug', 'Rendering children', children, 'with', props);
    let renderedChildren = [];
    children.forEach((child, key) => {
        if (typeof props.key !== 'undefined') {
            key = utils_1.addKey(props.key, key);
        }
        if (child instanceof Array) {
            renderedChildren = renderedChildren.concat(exports.renderChildren(Object.assign({}, props, { children: child })));
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
                const resolved = resolve_1.resolveData(props, child);
                if (resolved === null || typeof resolved === 'undefined') {
                    renderedChildren.push(resolved);
                }
                else {
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
            }
            else if (child.$view) {
                const view = resolve_1.resolveView(props, child.$view);
                if (view) {
                    renderedChildren.push(React.createElement(mdbView_1.default, {
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
        if (typeof props.mdb.expressions[component.expression] !== 'undefined') {
            return props.mdb.expressions[component.expression].render(props);
        }
        else {
            logger('render', 'error', `No expression handler for expression ${component.expression}`);
            return;
        }
    }
    else if (component.component) {
        if (typeof props.mdb.components[component.component] !== 'undefined') {
            const selectedComponent = props.mdb.components[component.component];
            // Render children
            let children;
            if (component.children) {
                children = exports.renderChildren(Object.assign({}, props, { children: component.children }));
            }
            // Deference properties
            let properties = {};
            if (component.properties) {
                properties = resolve_1.resolveObject(props, component.properties, typeof selectedComponent.resolve === 'function');
            }
            //logger('render', 'debug', `Rendering a ${component.component} with`, properties, children);
            if (selectedComponent.component) {
                return React.createElement(selectedComponent.component, properties, children);
            }
            else if (selectedComponent.render) {
                return selectedComponent.render(Object.assign({}, properties, { children }));
                /*XXX TODO Move to library module as check } else {
                  logger('render', 'error', `Componet ${component.component} has no renderer`);
                  return;*/
            }
        }
        else {
            logger('render', 'error', `No component ${component.component}`);
            return;
        }
    }
    // Render children
    let children = [], tag;
    if (component.children) {
        children = exports.renderChildren(Object.assign({}, props, { children: component.children }));
    }
    let attributes = {};
    if (component.attributes) {
        attributes = resolve_1.resolveObject(props, component.attributes);
    }
    //logger('render', 'debug', 'Rendering component', component, children);
    return React.createElement(component.tag, Object.assign({}, attributes, { key: props.key }), children);
};
/**
 * Checks the references in children of a component
 *
 * @param props Properties to use in rendering of the children
 */
exports.checkChildren = (props) => {
    const { children } = props;
    const logger = props.mdb.logger;
    //logger('checkChildren', 'debug', 'Checking $refs in children', children, 'with', props);
    children.forEach((child, key) => {
        if (typeof props.key !== 'undefined') {
            key = utils_1.addKey(props.key, key);
        }
        if (child instanceof Array) {
            exports.checkChildren(Object.assign({}, props, { children: child }));
        }
        else if (typeof child === 'object') {
            // Having this here instead of in render will mean sub views can't just
            // be references
            if (child.$ref) {
                resolve_1.checkData(props, child);
            }
            else if (child.$view) {
                //TODO Handle View?
            }
            else {
                exports.checkComponent(Object.assign({}, props, { key, component: child, arrayOk: true }));
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
exports.checkComponent = (props) => {
    const component = props.component;
    const logger = props.mdb.logger;
    // Delegate to expression renderers
    if (component.expression) {
        // Check if we have a handler for the expression
        if (typeof props.mdb.expressions[component.expression] !== 'undefined') {
            return props.mdb.expressions[component.expression].check(props);
        }
        else {
            logger('checkComponent', 'error', `No expression handler for expression ${component.expression}`);
            return;
        }
    }
    else if (component.component) {
        if (typeof props.mdb.components[component.component] !== 'undefined') {
            const selectedComponent = props.mdb.components[component.component];
            // Render children
            let children;
            if (component.children) {
                children = exports.checkChildren(Object.assign({}, props, { children: component.children }));
            }
            // Deference properties
            let properties = {};
            if (component.properties) {
                properties = resolve_1.checkObject(props, component.properties, typeof selectedComponent.resolve === 'function');
            }
            if (selectedComponent.render) {
                //logger('checkComponent', 'debug', `Checkinging ${component.component} component with`, properties, children);
                return selectedComponent.render(Object.assign({}, properties, { children }));
            }
        }
        else {
            logger('render', 'error', `No component ${component.component}`);
            return;
        }
    }
    if (component.children) {
        exports.checkChildren(Object.assign({}, props, { children: component.children }));
    }
    let attributes = {};
    if (component.attributes) {
        attributes = resolve_1.checkObject(props, component.attributes);
    }
};
//# sourceMappingURL=render.js.map