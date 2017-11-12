//import * as MDBWeb from 'molten-web';
import { defaultEventBaseName } from 'molten-api-websocket/lib/defaults';

export const commonConfig: MDBWeb.CommonOptions = {
  socketPath: '__moltendb',
  baseUri: '/',
  eventBaseName: defaultEventBaseName,
  viewsCollection: 'views',
  viewCollectionStorage: 'default'
};

