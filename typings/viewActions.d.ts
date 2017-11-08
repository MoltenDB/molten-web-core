
export interface ViewNavigateAction {
  type: MDB_VIEW_NAVIGATE,
  path: string
};

export interface ViewNavigateCancelAction {
  type: MDB_VIEW_NAVIGATE_CANCEL
};

export interface ViewUpdateAction {
  type: MDB_VIEW_UPDATE,
  path: string,
  view: View
};
