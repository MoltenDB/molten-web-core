"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const moment = require("moment");
const date_1 = require("molten-type-base/types/date");
var date_2 = require("molten-type-base/types/date");
exports.label = date_2.label;
exports.description = date_2.description;
exports.options = date_2.options;
exports.id = 'date';
// Delagate functionality to the base type
exports.validate = ({ name, options, item, value }) => date_1.validate(name, options, item, value);
exports.test = ({ name, options, item, test, parameters }) => date_1.test(name, options, item, test, parameters);
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
    const makeMoment = (value) => {
        switch (options.format) {
            case 'date':
                return moment(value.toString(), 'YYYYMMDD');
            case 'time':
                return moment(value.toString(), 'HHmm');
            case 'datetime':
            default:
                return moment(value * 1000);
        }
    };
    const change = (event) => {
        if (!onChange) {
            return;
        }
    };
    if (false) {
        return (React.createElement("input", { onChange: change, value: exports.value }));
    }
    let format;
    if (parameters && parameters.format) {
        format = parameters.format;
    }
    else {
        switch (options.format) {
            case 'date':
                format = 'DD MMM YYYY';
                break;
            case 'time':
                format = 'hh:mm';
                break;
            case 'datetime':
            default:
                format = 'DD MMM YYYY hh:mm';
                break;
        }
    }
    return makeMoment(item[name]).format(format);
};
//# sourceMappingURL=date.js.map