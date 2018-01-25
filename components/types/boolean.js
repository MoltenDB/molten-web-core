"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const boolean_1 = require("molten-type-base/types/boolean");
var boolean_2 = require("molten-type-base/types/boolean");
exports.label = boolean_2.label;
exports.description = boolean_2.description;
exports.options = boolean_2.options;
exports.id = 'boolean';
// Delagate functionality to the base type
exports.validate = ({ name, options, item, value }) => boolean_1.validate(name, options, item, value);
exports.test = ({ name, options, item, test, parameters }) => boolean_1.test(name, options, item, test, parameters);
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
exports.value = (name, options, item, parameters, onChange) => {
    const change = (event) => {
        if (!onChange) {
            return;
        }
    };
    if (false) {
        return (React.createElement("input", { type: 'checkbox', onChange: change, value: exports.value }));
    }
    if (item[name]) {
        return options.trueString || 'true';
    }
    else {
        return options.falseString || 'false';
    }
};
//# sourceMappingURL=boolean.js.map