import * as MDBReactClient from '../typings/client';

import * as Graph from './components/components/graph';

export { commonMDBReactConfig } from './common.config';

export const title = 'MoltenDB';

let logger = () => {};
Object.assign(logger, {
    log: () => {},
    error: () => {},
    debug: () => {},
    warn: () => {}
});

export const reactAppConfig = {
  components: {
    Graph
  }
};
