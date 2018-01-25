import * as MDB from 'molten-core';
import * as MDBWeb from 'molten-web';
import * as MDBWsApi from 'molten-api-websocket';

import { Persistence } from 'browser-store';

import {
  CommonOptions,
  Expression as BaseExpression,
  DataHandler,
  FunctionLibrary,
  Module
} from 'molten-web';

import * as React from 'react';

export const enum LoadingStatus {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  NEW_UPDATE = 'new update',
  UPDATED = 'updated'
}

export type SubscriptionDataTypes = 
    'view' | /// Get a view
    'collection' | /// Get a collection's details
    'data' | /// Query a collection
    'serverStatus'; /// Get updates to the status of the server connection

interface GetOptions {
  filter?: MDB.Filter
  options?: any //TODO
}

export interface Type {
  /**
   * Name of the type
   */
  label: MDB.LangString;

  /**
   * Description of the type
   */
  description: MDB.LangString;
  /**
   * Field type options to change the storage and behaviour of the field
   */
  options: MDB.Options;

  /**
   * Validates the given value
   *
   * @param name Name of the field to validate the value for
   * @param collectionOptions Options for the collection to validate the
   *   value for.
   * @param value Value to validate
   * TODO Need the entire items value for dependencies lookup
   *
   * @return An error, an object containing the errors for the
   * sub-fields, or null if value is valid
   */
  validate: (name: string, collectionOptions: MDB.CollectionOptions,
      value: any) => Error;

  /**
   * Returns the list of fields that the field has
   *
   * @param name Name of the field to get list of fields for
   * @param collectionOptions Options for the collection to get the fields
   *   for
   *
   * @returns Object containing the fields
   */
  fields: (props: { name: string, options: MDB.Field }) => Array<string>;

  /**
   * Return the value for the given field
   *
   * @param name Name of the field to return the value field
   * @param options Field options
   * @param item Item to return the value from
   *
   * @returns React node containing the element
   */
  value: (name: string, options: MDB.Field, item: { [key: string]: any }) => React.ReactNode;
}

export interface Expression extends MDBWeb.Expression {
  /**
   * Function to render the given expression
   *
   * @param props Properties for the expression
   *
   * @returns The rendered component(s) generated from the expression
   */
  render(props: { [key: string]: any }): React.ReactNode | Array<React.ReactNode>;
}

export interface Component extends Module {
  /**
   * Native React component
   */
  component?: React.ReactNode
  /**
   * Render the component
   *
   * @param props Properties for the component
   */
  render?(props: { [key: string]: any }): React.ReactNode | Array<React.ReactNode>
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
  dataHandlers?: { [id: string]: MDBWeb.DataHandler },
  /**
   * Additional function libraries to include
   */
  functions?: { [id: string]: MDBWeb.FunctionLibrary },
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

export interface Reference {
  $ref: Array<string|{[param: string]: any}>,
  request?: any ///TODO
}

interface ComponentData {
  /// Previous component data
  previous: ComponentData
  /// Previous data
  data?: { [temp: string]: any }
  /// Previous view data
  view?: MDBWeb.View,
  /// Additional views
  views?: { [id: string]: MDBWeb.View }
}

export interface ComponentProps {
  /// Instance of MDB to use
  mdb: MDBWebReact.Instance,
  /// The data to search in when resolving data
  data?: ComponentData,
}
