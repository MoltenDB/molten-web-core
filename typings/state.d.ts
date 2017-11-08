import * as MDB from 'molten-core';

type Id = string | number;

export interface Message {
  id?: Id,
  type: string,
  priority: number,
  expiry: Date,
  timeout: number,
  label: string
};

export interface ViewState {
    /// URI used to retrieve current view
    pathCurrent?: string,
    /// URI of path that is currently being loaded
    pathLoading?: string,
    /// ID of current view
    currentId?: Id,
    /// ID of loading view
    loadingId?: Id,
    /// Status of view retrieval
    status?: MoltenDBAsyncStatus,
    /// Last error encountered
    error?: MDB.Error,
    /// Current view object
    view?: MDB.View,
    /// Updates that are awaiting application to current view
    update?: { [path: string]: Array<any> },
    /// View component states
    state?: { [path: string]: any }
  }

export interface MoltenDBState {
  messages: Array<Message>,
  view: ViewState
}
