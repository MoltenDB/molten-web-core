import * as MDBWeb from 'molten-web';
import * as MDB from 'molten-core';

export interface Message {
  id?: MDB.Id,
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
    currentId?: MDB.Id,
    /// ID of loading view
    loadingId?: MDB.Id,
    /// Status of view retrieval
    status?: MoltenDBAsyncStatus,
    /// Last error encountered
    error?: MDBWeb.Error,
    /// Current view object
    view?: MDBWeb.View,
    /// Updates that are awaiting application to current view
    update?: { [path: string]: Array<any> },
    /// View component states
    state?: { [path: string]: any }
  }

export interface MoltenDBState {
  messages: Array<Message>,
  view: ViewState
}
