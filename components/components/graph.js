"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Plot = require("react-plotly.js");
const React = require("react");
exports.id = 'Graph';
exports.description = 'Graph component';
exports.options = {};
//let Plot;
let loadingPlotly = false;
const loadPlotly = () => {
    /*TODO loadingPlotly = true;
  
    require.ensure('react-plotly.js', () => {
      Plot = require('react-plotly.js');
      console.log('Plot loaded as', Plot);
    });*/
};
exports.render = (props) => {
    const { data } = props;
    console.log('graph render called', props, data, Plot);
    //XXX
    exports.resolve(props);
    if (!Plot) {
        return null;
    }
    console.log('checking data');
    if (data) {
        //TODO rename to correct name
        let vectors = {};
        let traces = [];
        // Build what traces need to be built
        props.traces.forEach((trace) => {
            let traceObject = {
                x: null,
                y: null,
                name: trace.name,
                type: trace.type || props.type,
            };
            traces.push(traceObject);
            // Set up vectors
            if (typeof vectors[trace.x] === 'undefined') {
                vectors[trace.x] = [];
            }
            traceObject.x = vectors[trace.x];
            if (typeof vectors[trace.y] === 'undefined') {
                vectors[trace.y] = [];
            }
            traceObject.y = vectors[trace.y];
        });
        // Run through items and create vectors
        {
            let item;
            const vectorKeys = Object.keys(vectors);
            //TODO Do we need an iterator check?
            for (item of data) {
                vectorKeys.forEach((key) => {
                    if (typeof item === 'function') {
                        vectors[key].push(item(key).valueOf());
                    }
                    else {
                        vectors[key].push(item[key]);
                    }
                });
            }
        }
        console.log('rendering a graph with', traces);
        //  layout={layout}
        //  config={config}
        return (React.createElement(Plot, { data: traces }));
    }
    else {
        return null;
    }
};
exports.resolve = (props) => {
    let { data } = props;
    // Async load of plotly
    /*XXX if (typeof Plot === 'undefined' && !loadingPlotly) {
      loadPlotly();
    }*/
    if (typeof data === 'function') {
        // Build fields
        let fields = [];
        props.traces.forEach((trace) => {
            if (fields.indexOf(trace.x) === -1) {
                fields.push(trace.x);
            }
            if (fields.indexOf(trace.y) === -1) {
                fields.push(trace.y);
            }
        });
        // Call resolver function with parameters to get 
        data = data({
            fields
        });
    }
};
