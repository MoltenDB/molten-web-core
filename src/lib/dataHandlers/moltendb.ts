import * as DataHandler from '../../typings/dataHandler.d.ts';
import {
  LoadingStatus
} from '../../../typings/client';

import * as MDB from 'molten-core';

import {
  updateData
} from '../../actions/view';

import {
  containSameValues
} from '../../lib/utils';

interface MDBDataProperties {
  type: 'molten',

  // Collection data is retrieved from 
  collection: string,

}

const resolvePath = (object: Array<any> | { [key: string]: any }, path: Array<string | number>) => {
  let pathNode;
  while (pathNode = path.shift()) {
    if (object instanceof Object) {
      object = object[pathNode];
    } else {
      return;
    }
  }

  return object;
};

interface MDBDataState {
  /// The collection options
  collectionOptions?: MDB.CollectionOptions,
  /// The received data items
  data?: { [id: string]: any },
  /// The order of the data
  sortMap?: Array<string>
}

export const id = 'moltendb';
export const name = 'MoltenDB Data';
export const description = 'Use this data handler to access data in the MoltenDB database';

export const createResolver = (props, data, path, dataId) => {
  const logger = props.mdb.logger.id('MoltenDB data resolver');
  logger.debug('resolver created for', data, props, path);

  let requests = [];
  let needCollectionOptions = false;

  /**
   * Resolve collection options reference
   *
   * @param parts Path parts to resolve
   */
  const resolveCollectionOptions = (parts) => {
    if (['name', 'label', 'description', 'title'].indexOf(parts[0]) !== -1) {
      if (parts.length > 1) {
        //TODO Error
        return;
      }

      switch (parts[0]) {
        case 'name':
        case '_id':
          return data.collectionOptions._id;
        case 'label':
          return data.collectionOptions.label;
        case 'description':
          return data.collectionOptions.description;
        case 'title':
          //TODO Render title
          return data.collectionOptions.title ?
              renderer.renderLabel(props, data.collectionOptions.title)
              : data.collectionOptions.label;
      }
    } else if (parts[0] === 'paths') {
      switch (parts.length) {
        case '1':
          return data.collectionOptions.paths;
        case '2':
          return data.collectionOptions.paths;
        default:
          //TODO Error
          return;
      }
    } else {
      return;
    }
  };

  /**
   * Resolve field detail
   *
   * @param parts Path parts to resolve
   */
  const resolveFieldDetail = (field, parts) => {
    logger.debug('resolveFieldDetail', field, parts);
    if (!parts || !parts.length) {
      let resolver = (newParts) => resolveFieldDetail(newParts);
      resolver.valueOf = () => field;

      return resolver;
    }

    if (parts.length > 1) {
      return;
    }

    const fieldData = data.collectionOptions.fields[field];

    switch (parts[0]) {
      case 'label':
        return fieldData.label;
      case 'description':
        return fieldData.description;
    }

    return;
  };

  /**
   * Resolve fields reference
   *
   * @param parts Path parts to resolve
   */
  const resolveFields = (parts) => {
    logger.debug('resolveFields', parts);
    if (!parts || !parts.length) {
      let resolver = (newParts) => resolveFields(newParts);
      const fields = Object.keys(data.collectionOptions.fields).map((field) => {
        let fieldResolver = (newParts) => resolveFieldDetail(field, newParts);
        fieldResolver.valueOf = () => field;
        return fieldResolver;
      });

      logger.debug('creating iterator from mapping field keys to objects', fields);
      resolver[Symbol.iterator] = fields[Symbol.iterator].bind(fields);

      return resolver;
    }

    const field = parts.shift();

    if (typeof data.collectionOptions.fields[field] === 'undefined') {
      return;
    }

    if (!parts || !parts.length) {
      return (newParts) => resolveFieldDetail(field, newParts);
    }

    return resolveFieldDetail(field, parts);
  };

  /**
   * Resolves items
   *
   * @param parts Path to thing to resolve
   */
  const resolveItems = (parts) => {
    logger.debug('resolveItems', parts.slice(), data);
    /*TODO Uncomment once have separate resolve functions if (!data.data) {
      return null;
    }*/

    let request = {};

    requests.push(request);

    /**
     * Resolve an item
     *
     * @param index Index of the item id in the results array
     */
    const resolveItem = (index, parts) => {
      logger.debug('resolveItem', index, parts.slice());

      if (!parts || !parts.length) {
        logger.debug('no parts, returning resolveItem');
        let itemResolver = (newParts) => resolveItem(index, newParts);
        itemResolver.valueOf = () => null;
        return itemResolver;
      }

      let results = data.data.results;
      let items = data.data.items;

      if (index !== null && (index < 0
          || (data.data && index >= data.data.results.length))) {
        logger.error(`Index out of range (${index}) accessing item in ${dataId}`);
        return;
      }

      //XXX Temporary null item resolution
      if (index === null || !data.data) {
        if (parts && parts.length) {
          logger.debug('fake resolver adding field', parts[0]);
          const field = parts.shift();

          if (typeof request.fields === 'undefined') {
            request.fields = ['_id'];
          }
          if (request.fields.indexOf(field) === -1) {
            request.fields.push(field);
          }

          return null;
        } else {
          let resolver = (newParts) => resolveItem(index, newParts);
          resolver.valueOf = () => null;
        }
      }

      const id = data.data.results[index];
      const item = data.data.items[id];

      const resolveField = (parts) => {
        logger.debug('resolveField', parts.slice());
        const field = parts.shift();

        const fieldOptions = data.collectionOptions.fields[field];
        if (typeof fieldOptions === 'undefined') {
          return;
        }

        const mdbField = props.mdb.types[fieldOptions.type];
        if (typeof mdbField === 'undefined') {
          logger.error(`Field type ${fieldOptions.type} not loaded`);
          return;
        }

        ///TODO How is forms etc going to work
        if (!parts || !parts.length) {
          return {
            valueOf: () => mdbField.value(field, fieldOptions, item),
            label: fieldOptions.label,
            // TODO Goto field to get value?
            value: item[field]
          };
        } else {
          // Get sub field
          if (parts[0] === 'label') {
            return fieldOptions.label;
          } else if (parts[0] === 'value') {
            return item[field];
          }
        }
      };

      if (!parts || !parts.length) {
        let resolver = (newParts) => resolveField(newParts);
        resolver.valueOf = () => JSON.parse(JSON.stringify(data.data.items));
        return resolver;
      } else {
        return resolveField(parts);
      }
    };

    if (parts && parts.length) {
      logger.debug('Checking if first part is an parameters', parts.slice());
      // Check if first part is parameters
      if (typeof parts[0] === 'object'
          && typeof parts[0].parameters !== 'undefined') {
        // Find the subscription with the same parameters
        const parameters = parts.shift().parameters;
        //TODO Checking
        Object.assign(request, parameters);
      }
    }

    if (!parts || !parts.length) {
      logger.debug('resolveItems got no more parts');
      let resolver = (newParts) => resolveItems(newParts);
      if (data.data) {
        const items = data.data.results.map((id, index) => {
          let itemResolver = (newParts) => resolveItem(index, newParts);
          itemResolver.valueOf = () => id;
          return itemResolver;
        });
        resolver[Symbol.iterator] = items[Symbol.iterator].bind(items);
        resolver.valueOf = () => JSON.parse(JSON.stringify(data.data.results.map((id) => data.data.items[id])));
      } else {
        logger.debug('no data yet, so given fake resolver');
        let fakeItemResolver = (newParts) => resolveItem(null, newParts);
        fakeItemResolver.valueOf = () => null;
        const items = [ fakeItemResolver ];
        resolver[Symbol.iterator] = items[Symbol.iterator].bind(items);
        resolver.valueOf = () => null;
      }

      return resolver;
    }

    const id = Number(parts[0]);

    if (isNaN(id)) {
      logger.error(`Bad index (${parts[0]} ${typeof parts[0]}) accessing item in ${dataId}`);
      return;
    }

    return resolveItem(id, parts.slice(1));
  };

  const resolve = (parts) => {
    if (!parts || !parts.length) {
      return (newParts) => resolve(newParts);
    }

    const type = parts.shift();

    logger.debug('resolving', type, parts.slice());

    switch(type) {
      case 'collection':
        if (!data.collectionOptions) {
          needCollectionOptions = true;

          return null;
        }

        if (parts.length) {
          return resolveCollectionOptions(parts);
        }

        return (newParts) => resolveCollectionOptions(newParts);
      case 'fields':
        if (!data.collectionOptions) {
          logger.debug('dont have collectionOptions for fields, so returning null');
          needCollectionOptions = true;

          return null;
        }

        return resolveFields(parts);
      case 'items':
        return resolveItems(parts);
    }
  };

  return {
    resolve,
    finish: () => {
      let subscriptions = [];
      // Collate requested data
      const validRequests = requests.reduce((acc, request) => {
        if (typeof request.fields !== 'undefined' && request.fields.length) {
          acc.push(request)
        }

        return acc;
      }, []);

      logger.debug('finish called with the collected requests', validRequests, requests,
          needCollectionOptions);

      let collectionOptionsRequested = false;

      if (validRequests.length) {
        validRequests.forEach((request) => {
          // Check a subscription for the data in the request has not already been submitted
          if (typeof data.subscriptions !== 'undefined') {
            const currentSubscription = data.subscriptions.find((subscription) => {
              logger.debug('checking if requests match', request, subscription.request);
              // Check subscription fields
              if (request.fields && subscription.request.fields) {
                if (!containSameValues(subscription.request.fields, request.fields)) {
                  return;
                }
              } else if (request.fields || subscription.request.fields) {
                return;
              }

              // Check subscription filter
              if (request.filter && subscription.request.filter) {
                //TODO
              } else if (request.filter || subscription.request.filter) {
                return;
              }

              return true;
            });

            if (currentSubscription) {
              logger.debug('last one matched');
              return;
            }
          }

          logger.debug('Building a subscription for request', request);

          let options = {
            collection: data.collection,
            options: Object.assign({}, data.options, request)
          };

          delete options.options.filter;

          // Add filter
          if (request.filter && data.filter) {
            options.filter = { $and: [
              request.filter,
              data.filter
            ] };
          } else if (request.filter || data.filter) {
            options.filter = request.filter || data.filter;
          }

          if (!collectionOptionsRequested && needCollectionOptions) {
            options.collectionOptions = true;
            collectionOptionsRequested = true;
          }

          let subscriptionId;
          const separateResults = Object.keys(request).length > 1
              || (Object.keys(request).length === 1
              && typeof request.fields === 'undefined');

          const handler = (error, data) => {
            let actionData;

            if (error) {
              //TODO
              logger.error('Received an error requesting data', error);
              if (separateResults) {
                actionData = {
                };
                subscriptionData = {
                  error,
                  status: LoadingStatus.ERROR
                };
              } else {
                actionData = {
                  error
                };
                subscriptionData = {
                  status: LoadingStatus.ERROR
                };
              }
            } else {
              // Map out results to results and data
              let results = [], items = {};
              if (data.results) {
                data.results.forEach((item) => {
                  results.push(item._id);
                  items[item._id] = item;
                });
              }

              // 
              /**
               * TODO Need to be able to handle the status and batch downloads
               * - need to set the status accordingly (just loaded?)
               * Also need to be able to handle data updates - check if data
               * is already in the data.items with different values, mark it
               * as an update
               */
              //Result array should go into the subscription if the request is
              if (separateResults) {
                actionData = {
                  data: {
                    items
                  }
                };
                subscription = {
                  results: results
                };
              } else {
                actionData = {
                  data: {
                    results,
                    items,
                  }
                };
              }

              /* TODO
              if request has parameters other than just fields, the results array
              should go into the subscription object
              This should also update the status of the subscription with the 
              data inside of actionData
              Need to think about how we are going to handle  data updates
                Maybe have another action for data updates that pushes the
                update to an update array or something
              */


              if (data.collectionOptions) {
                actionData.collectionOptions = data.collectionOptions;
              }
            }

            props.dispatch(updateData(path, actionData, subscriptionId));
          };

          subscriptionId = props.mdb.server.subscribe('data', options, handler);

          subscriptions.push({
            collectionOptions: options.collectionOptions,
            request,
            id: subscriptionId,
            status: LoadingStatus.LOADING
          });
        });
      }

      if (needCollectionOptions && !collectionOptionsRequested) {
        // Check a subscription has not already been submitted
        if (data.subscriptions && typeof data.subscriptions.find(
          (subscription) => subscription.collectionOptions
        ) !== 'undefined') {
        } else {
          logger.debug('add subscription for collectionOptions');
          let subscriptionId;

          const handler = (error, data) => {
            props.dispatch(updateData(path, {
              collectionOptions: data
            }, subscriptionId));
          };

          subscriptionId = props.mdb.server.subscribe('collection', {
            collection: data.collection
          }, handler);

          subscriptions.push({
            collectionOptions: true,
            id: subscriptionId,
            status: LoadingStatus.LOADING
          });
        }
      }

      if (subscriptions.length) {
        // Store the requests
        props.dispatch(updateData(path, {
          subscriptions
        }));
      }
    }
  };
};

/*XXX
      case 'data': // Collection data
        // Check if the requested data is available
        if (!state.data) {
          // Request data
          requests.push({
            type: 'data',
            properties,
            options: parameters
          });
          return null;
        } else {
          if (!path.length) {
            // return an resolve function to resolve further
            return 
          }

          // select item
          const index = path.shift();

          const id = state.sortMap[index];

          if (typeof id === 'undefined') {
            return;
          }

          const item = state.data[id];

          if (!path.length) {
            // return row resolver
            return 
          }

          // Resolve field with collection of fields gathered from called
          // <type>.fields()

          // select field in item
          const field = path.shift();

          // Check if field is in collection
          if (typeof state.collectionOptions.fields[field] === 'undefined') {
            return;
          }

          if (!path.length) {
            // return field resolver
            return 
          }
          
          // If it
        }
        break;
      default:
        return;
    }
  };



  return {
    fields,
    resolve
  };
}
*/
