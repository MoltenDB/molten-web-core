import * as React from 'react';

import { CommonOptions } from 'molten-web';

declare namespace MDBWebReact {
  export interface Options extends CommonOptions {
    /**
     * Not providing an instance will mean that server-side rendering will be
     * disabled
     */
    moltenInstance?: MDB.MoltenDBInstance
  }

};
export = MDBWebReact;
