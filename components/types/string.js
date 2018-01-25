"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const string_1 = require("molten-type-base/types/string");
var string_2 = require("molten-type-base/types/string");
exports.label = string_2.label;
exports.description = string_2.description;
exports.options = string_2.options;
//TODO import { MarkdownPreview } from 'react-marked-markdown';
exports.id = 'string';
// Delagate functionality to the base type
exports.validate = ({ name, options, item, value }) => string_1.validate(name, options, item, value);
exports.test = ({ name, options, item, test, parameters }) => string_1.test(name, options, item, test, parameters);
exports.fields = ({ name, options }) => {
    return {
        [name]: {
            label: options.label
        }
    };
};
exports.label = ({ name, options, item }) => {
    return options.label;
};
exports.value = (name, options, item, onChange) => {
    const change = (event) => {
        if (!onChange) {
            return;
        }
    };
    if (false) {
        return (React.createElement("input", { onChange: change, value: exports.value }));
    }
    if (options.markdown) {
        //TODO    return (<MarkdownPreview value={item[name]} />);
    }
    else {
        return item[name];
    }
};
//# sourceMappingURL=string.js.map