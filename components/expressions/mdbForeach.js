"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = require("../lib/resolve");
const renderer = require("../lib/render");
const utils_1 = require("../../lib/utils");
exports.id = 'foreach';
exports.name = 'Items iterator';
exports.description = 'Iterate through a collection of items';
exports.options = {};
/**
 * Renders a foreach expression
 *
 * @param props Properties to use in rendering of the expression
 */
exports.render = (props) => {
    const logger = props.mdb.logger.id('forEach');
    const component = props.component;
    let { data } = component;
    logger.debug('Rendering forEach', component);
    // Do nothing if there is nothing to render
    if (!component.children) {
        return null;
    }
    if (typeof data.$ref !== 'undefined') {
        // Resolve the data
        logger.debug('Resolving data reference', data.$ref, resolve_1.resolveData(props, data.$ref));
        data = resolve_1.resolveData(props, data.$ref);
    }
    // TODO Handle data as function
    /*XXX? if (typeof data === 'function') {
      data = data();
    }*/
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
        logger.debug('rendering forEach', component.id, 'children', component.children, 'with', item, Object.assign({}, props, { key, children: component.children, data: {
                data: {
                    [component.id]: item,
                },
                previous: props.data
            } }));
        const rendered = renderer.renderChildren(Object.assign({}, props, { key, children: component.children, data: {
                data: {
                    [component.id]: item,
                },
                previous: props.data
            } }));
        logger.debug('rendered children is', rendered);
        if (rendered instanceof Array) {
            result = result.concat(rendered);
        }
        else {
            result.push(rendered);
        }
    };
    logger.debug('data for forEach is', data);
    if (typeof data[Symbol.iterator] !== 'undefined') {
        logger.debug('IT\'S AN INTERATOR!');
        let i = 0;
        for (const item of data) {
            logger.debug('item', item);
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
