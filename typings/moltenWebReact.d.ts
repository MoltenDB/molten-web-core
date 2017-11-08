import * as MDB from 'molten-core';
import * as SP from '../lib/subscribablePromise';


export interface Error {
  code: number,
  message: string
}

export interface DataHandler {
  /**
   * Returns the data (fields) that is available
   *
   * @param properties Properties of the special data type
   */
  fields(properties: ViewDataProperties, dataPath: Array<string>): ;

  /**
   * Function that will be called when trying to resolve data within the
   * special data type
   *
   * @param properties Properties of the special data type
   * @param dataPath Path to data in base view
   * @param path Path to data trying to be resolved
   * @param options Options requested for data, such as limit, initial item etc
   *
   * @returns Value of resolved data, a function that will be called to resolve
   *   data further or null when waiting for the data
   */
  resolve(properties: ViewDataProperties, dataPath: Array<string>,
      path: Array<string>, options: DataOptions): any | function | null;

  /**
   * Function that will be called when then rendering of the view is complete.
   */
  renderComplete?(): void;
}

