import * as Plot from 'react-plotly.js';
import * as React from 'react';

export const id = 'Graph';
export const description = 'Graph component';

export const options = {};

//let Plot;
let loadingPlotly = false;

const loadPlotly = () => {
  /*TODO loadingPlotly = true;

  require.ensure('react-plotly.js', () => {
    Plot = require('react-plotly.js');
    console.log('Plot loaded as', Plot);
  });*/
};

export const render = (props): React.ComponentElement => {
  const { data, layout, config } = props;

  if (!Plot) {
    return null;
  }

  if (data) {
    //TODO rename to correct name
    let vectors = {};
    let traces = [];

    // Build what traces need to be built
    props.traces.forEach((trace) => {
      let traceObject = {
        ...trace,
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
            const value = item([key]);
            vectors[key].push(value && value.valueOf());
          } else {
            vectors[key].push(item[key]);
          }
        });
      }
    }

    return (<Plot
      data={traces}
      layout={layout}
      config={config}
    />);
  } else {
    return null;
  }
};

export const resolve = (props) => {
  let { data } = props;

  // Async load of plotly
  /*XXX if (typeof Plot === 'undefined' && !loadingPlotly) {
    loadPlotly();
  }*/

  if (typeof data === 'function') { //TODO Check if it accepts parameters?
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
