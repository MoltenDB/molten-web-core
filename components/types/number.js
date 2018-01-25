"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const number_1 = require("molten-type-base/types/number");
var number_2 = require("molten-type-base/types/number");
exports.label = number_2.label;
exports.description = number_2.description;
exports.options = number_2.options;
exports.id = 'number';
// Delagate functionality to the base type
exports.validate = ({ name, options, item, value }) => number_1.validate(name, options, item, value);
exports.test = ({ name, options, item, test, parameters }) => number_1.test(name, options, item, test, parameters);
exports.fields = ({ name, options }) => {
    return {
        [name]: {
            label: options.label
        }
    };
};
exports.value = (name, options, item, parameters, onChanage) => {
    console.log('number value', name, parameters);
    const change = (event) => {
        if (!onChange) {
            return;
        }
    };
    if (false) {
        return (React.createElement("input", { type: 'number', onChange: change, value: exports.value }));
    }
    if (item[name] === null) {
        return '';
    }
    const precision = (parameters && typeof parameters.precision === 'number') ? parameters.precision : options.precision;
    const decimal = (parameters && typeof parameters.decimal === 'number') ? parameters.decimal : options.decimal;
    if (typeof precision === 'number') {
        return item[name].toPrecision(precision);
    }
    else if (typeof decimal === 'number') {
        console.log('to decimal', item[name], item[name].toFixed(decimal));
        return item[name].toFixed(decimal);
    }
    else {
        return item[name];
    }
};
//# sourceMappingURL=number.js.map