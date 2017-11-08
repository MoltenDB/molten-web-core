import * as MDBWeb from '../typings/mdb-web';
import * as render from './lib/render';

/**
 * Molten-web-react view component
 */
export const MDBView = (props: render.MDBViewProps): React.Component | Array<React.Component> => {
  if (props.view.template) {
    // Ensure we have the template view
    if (props.views[props.view.template]) {
      const templateView = props.views[props.view.template];
      // Render the view inside of the template
      return render.render({
        mdb: props.mdb,
        data: {
          views: {
            ...props.view.views,
            main: props.view.main
          },
          view: templateView,
          previous: {
            view: props.view,
            previous: props.data
          }
        },
        component: templateView.main
      });
    } else {
      //@TODO Get the template view
      return null;
    }
  }

  // Start iteration through view
  return render.renderChildren({
    mdb: props.mdb,
    data: {
      view: props.view
    },
    children: props.view.main
  });
  /*return render.render({
    mdb: props.mdb,
    data: {
      view: props.view
    },
    component: props.view.main
  });*/
};
export default MDBView;
