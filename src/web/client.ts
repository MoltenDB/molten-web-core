import mdbReducer from '../lib/reducers';
import React from 'react';
import { createStore } from 'redux';
import { createView } from '../lib/view';
const options = require('../../config');

MoltenDB = () => {
  let mdbInstance = {
    worker: {
      instance: undefined,
      view: undefined,
      server: undefined,
      eventReceived: false,
      errored: false
    },
    options: options,
    instance: undefined,
    view: undefined,
    server: undefined
  };

  let mdbInterface = {
    promise: undefined,
    server: undefined,
    view: undefined
  };

  mdbInterface.promise = new Promise((resolve, reject) => {
    let worker;

    try {
      if (!options.noWorker && window.Worker) {
        /**@private
         * Handles any initial errors when starting the worker and disables the use
         * of a worker if errors are encountered
         *
         * @this MoltenDBInstance
         *
         * @param {Error} Worker error
         *
         * @returns {undefined}
         */
        const workerError = (err) => {
          console.log('workerError called', this);
          if (!mdbInstance.worker.eventReceived) {
            mdbInstance.worker.eventReceived = true;

            worker.removeEventListener('error', workerError);
            worker.removeEventListener('message', workerMessage);

            if (worker.terminate) {
              worker.terminate();
            }

            mdbInstance.worker.instance = undefined;

            resolve();
          }
        };

        /**@private
         * Handles the initial message from the worker symbolising the worker has
         * been set up correctly.
         *
         * @this MoltenDBInstance
         *
         * @param {Event} event Worker event received
         *
         * @returns {undefined}
         */
        const workerMessage = (event) => {
          console.log('workerMessage called');
          if (!mdbInstance.worker.eventReceived) {
            // Have a good worker, so continue loading
            mdbInstance.worker.loaded = true;

            // Remove event listeners
            worker.removeEventListener('error', workerError);
            worker.removeEventListener('message', workerMessage);

            resolve();
          }
        };

        MoltenDBInstance.worker.instance = worker = new Worker('worker.js');

        worker.addEventListener('error', workerError.bind(mdbInstance))
        worker.addEventListener('message', workerMessage.bind(mdbInstance));
      } else {
        resolve();
      }
    } catch (err) {
      reject(err);
    }
  }).then(() => {
    return new Promise((resolve, reject) => {
      if (mdbInstance.worker.instance) {
        require.ensure('../lib/server-worker', () => {
          mdbInstance.server = require('../lib/server-worker')(mdbInstance);
          resolve();
        });
      } else {
        require.ensure('../lib/server', () => {
          mdbInstance.server = require('../lib/server')(mdbInstance);
          resolve();
        });
      }
    });
  }).then(() => {
    mdbInterface.server = {
      status: mdbInstance.server.status
    };

    mdbInstance.view = createView(mdbInstance);
    mdbInterface.view = mdbInstance.view;

    return Promise.resolve();
  });

  return mdbInterface;
}
