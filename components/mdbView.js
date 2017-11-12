"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render = require("./lib/render");
/**
 * Molten-web-react view component
 */
exports.MDBView = (props) => {
    const { mdb, dispatch } = props;
    const logger = mdb.logger;
    logger('MDBView', 'debug', props);
    // Set up dataHandler resolvers if any
    let resolvers;
    if (props.view.data) {
        Object.keys(props.view.data).forEach((key) => {
            const data = props.view.data[key];
            if (typeof data.type !== 'undefined') {
                if (props.mdb.dataHandlers[data.type]
                    && props.mdb.dataHandlers[data.type].createResolver) {
                    if (typeof resolvers === 'undefined') {
                        resolvers = {};
                    }
                    resolvers[key] = props.mdb.dataHandlers[data.type].createResolver(props, data);
                }
            }
        });
    }
    if (props.view.template) {
        // Ensure we have the template view
        if (props.views[props.view.template]) {
            const templateView = props.views[props.view.template];
            // Render the view inside of the template
            const rendered = render.render({
                mdb,
                dispatch,
                data: {
                    views: Object.assign({}, props.view.views, { main: props.view.main }),
                    view: templateView,
                    resolvers,
                    previous: {
                        view: props.view,
                        previous: props.data
                    }
                },
                component: templateView.main
            });
            if (resolvers) {
                Object.keys(resolvers).forEach((key) => {
                    resolvers[key].finish();
                });
            }
            return rendered;
        }
        else {
            //@TODO Get the template view
            return null;
        }
    }
    {
        // Start iteration through view
        const rendered = render.renderChildren({
            mdb,
            dispatch,
            data: {
                view: props.view,
                resolvers
            },
            children: props.view.main
        });
        if (resolvers) {
            Object.keys(resolvers).forEach((key) => {
                resolvers[key].finish();
            });
        }
        return rendered;
        /*return render.render({
          mdb: props.mdb,
          data: {
            view: props.view
          },
          component: props.view.main
        });*/
    }
};
exports.default = exports.MDBView;
