"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = require("../lib/resolve");
const renderer = require("../lib/render");
const utils_1 = require("../../lib/utils");
exports.id = 'foreach';
exports.name = 'Items iterator';
exports.description = 'Iterate through a collection of items';
exports.options = {};
const getData = (props) => {
    const component = props.component;
};
/**
 * Renders a foreach expression
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
    if (!data) {
        // TODO Go through the children so the data handlers can resolve their data?
        return null;
    }
    let result = [];
    /**
     * Render an item from the data
     *
     * @param item Data item to use in render
     * @param key Key of data item
     */
    const renderDataItem = (item, key) => {
        if (typeof props.key !== 'undefined') {
            key = utils_1.addKey(props.key, key);
        }
        const rendered = renderer.renderChildren(Object.assign({}, props, { key, children: component.children, data: {
                data: {
                    [component.id]: item,
                },
                previous: props.data
            } }));
        if (rendered instanceof Array) {
            result = result.concat(rendered);
        }
        else {
            result.push(rendered);
        }
    };
    if (typeof data[Symbol.iterator] !== 'undefined') {
        let i = 0;
        for (const item of data) {
            renderDataItem(item, i++);
        }
    }
    else if (data instanceof Array) {
        data.forEach(renderDataItem);
    }
    else if (typeof data === 'object') {
        Object.keys(data).forEach((key) => {
            renderDataItem(data[key], key);
        });
    }
    return result;
};
/**
 * Renders a foreach expression
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
    if (!data) {
        // TODO Go through the children so the data handlers can resolve their data?
        return null;
    }
    /**
     * Render an item from the data
     *
     * @param item Data item to use in check
     * @param key Key of data item
     */
    const checkDataItem = (item, key) => {
        if (typeof props.key !== 'undefined') {
            key = utils_1.addKey(props.key, key);
        }
        renderer.checkChildren(Object.assign({}, props, { key, children: component.children, data: {
                data: {
                    [component.id]: item,
                },
                previous: props.data
            } }));
    };
    if (typeof data[Symbol.iterator] !== 'undefined') {
        let i = 0;
        for (const item of data) {
            checkDataItem(item, i++);
        }
    }
    else if (data instanceof Array) {
        data.forEach(checkDataItem);
    }
    else if (typeof data === 'object') {
        Object.keys(data).forEach((key) => {
            checkDataItem(data[key], key);
        });
    }
};
//# sourceMappingURL=mdbForeach.js.map