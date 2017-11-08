import { Persistence } from 'browser-store';

import {
  CommonOptions,
  Expression as BaseExpression,
  DataHandler,
  FunctionLibraries,
  Module
} from 'molten-web';

import * as React from 'react';

export const enum LoadingStatus {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  NEW_UPDATE = 'new update',
  UPDATED = 'updated'
};

export type SubscriptionDataTypes = 
    'view' | /// Get a view
    'collection' | /// Get a collection's details
    'data' | /// Query a collection
    'serverStatus'; /// Get updates to the status of the server connection

interface GetOptions {
  filter?: MDB.Filter
  options?: any //TODO
}

export interface Expression extends BaseExpression {
  /**
   * Function to render the given expression
   *
   * @param props Properties for the expression
   *
   * @returns The rendered component(s) generated from the expression
   */
  render(props): React.ComponentElement | Array<React.ComponentElement>;
}

export interface Component extends Module {
  /**
   * Render the component
   *
   * @param props Properties for the component
   */
  render(props: Properties): React.Component | Array<React.Component>
}

export interface Options extends CommonOptions {
  /**
   * Additional types to include
   */
  types?: { [id: string]: Type },
  /**
   * Additional components to include
   */
  components?: { [id: string]: Component },
  /**
   * Additional expressions to include
   */
  expressions?: { [id: string]: Expression },
  /**
   * Additional data handlers to include
   */
  dataHandlers?: { [id: string]: DataHandler },
  /**
   * Additional function libraries to include
   */
  functions?: { [id: string]: FunctionLibraries },
  /**
   * Name of database to store cache on client
   */
  cacheName?: string,
  /**
   * What to store on the client computer by default. These options will be
   * overridden by the individual views
   */
  store?: { [todo: string]: Persistence },

  /**
   * If true, the client app will not try and use a Web Worker for server
   * communcations and data caching
   */
  noWorker?: boolean,

  /**
   * The logger to use on the client side app
   */
  logger?: MDBWeb.Logger
}

/**
 * Interface returned by the server modules for acccessing data from the
 * connected MoltenDB instance
 */
export interface ServerInstance {
  /**
   * Request data
   *
   * @param type The type of data being requested
   * @param options The options for what data is being requested
   *
   * @returns Subscription ID
   */
  subscribe(type: SubscriptionDataTypes, options: GetOptions, handler: (data) => void): number;
  /**
   * Unsubscribe from data
   *
   * @param subscription Subscription ID(s)
   */
  unsubscribe(subscription: number | Array<number>): void;
  /**
   * Send a query to the server
   */
  query(type: MDBWsApi.SocketQueryType, options: MDBWsApi.Query): Promise<MDBWsApi.ResultResponse>;
}


interface ComponentData {
  /// Previous component data
  previous: Previous
  /// Previous data
  data?: { [temp: string]: any }
  /// Previous view data
  view?: MDBWeb.View,
  /// Additional views
  views?: { [id: string]: MDBWeb.View }
}

export type ComponentData = DataComponentItem | ViewComponentItem;

export interface ComponentProps {
  /// Instance of MDB to use
  mdb: MDBWebReact.Instance,
  /// The data to search in when resolving data
  data?: ComponentData,
}
