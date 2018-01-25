"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render = require("./lib/render");
const React = require("react");
/*The check functions can't be called in the render cycle so they have to be called before
will therefore have to change to a class and run the checks in the constructor and the
componentWillReceiveProps. Can use the function that does this to update the resolver only when required,
though could the props just be removed from createResolver and then it wouldn't have to be updated
every time the... though data would get updated as well. Could maybe just pass the path and
the key*/
/**
 * Molten-web-react view component
 */
class MDBView extends React.Component {
    constructor(props) {
        super(props);
        /// Stores the dataHandler resolver instances for the data of the view
        this.resolvers = {};
        // Set mdb and logger
        this.setMdbLogger(props);
        // Create resolvers for dataHandlers
        this.updateDataHandlerResolvers(props);
        // Run checkItems on view
        this.check(props);
    }
    setMdbLogger(props) {
        if (typeof props.mdb !== 'undefined') {
            if (typeof this.mdb === 'undefined' || this.mdb !== props.mdb) {
                this.mdb = props.mdb;
                this.logger = this.mdb.logger.id('MDBView');
            }
        }
    }
    updateDataHandlerResolvers(newProps, oldProps) {
        if (typeof newProps.view === 'undefined'
            || typeof newProps.view.data === 'undefined'
            || typeof newProps.mdb === 'undefined') {
            this.resolvers = {};
            return;
        }
        let newResolvers = {};
        const newData = newProps.view.data;
        Object.keys(newData).forEach((key) => {
            if (oldProps && oldProps.view && oldProps.view.data
                && oldProps.view.data[key] && oldProps.view.data[key] === newData[key]
                && typeof this.resolvers[key] === 'undefined') {
                newResolvers[key] = this.resolvers[key];
            }
            else {
                const data = newData[key];
                if (typeof data.type !== 'undefined') {
                    if (typeof newProps.mdb.dataHandlers[data.type] !== 'undefined') {
                        if (newProps.mdb.dataHandlers[data.type].createResolver) {
                            newResolvers[key] = newProps.mdb.dataHandlers[data.type].createResolver(newProps, data, newProps.data && newProps.data.path ? newProps.data.path.concat(['data', key]) : ['data', key], key);
                        }
                    }
                    else {
                        this.logger.error(`Found a unknown data type ${data.type} for data ${key} in view ${newProps.view._id}`);
                    }
                }
            }
        });
        this.resolvers = newResolvers;
    }
    componentWillReceiveProps(newProps) {
        this.updateDataHandlerResolvers(newProps, this.props);
        this.check(newProps);
    }
    check(props) {
        const { mdb, dispatch } = props;
        if (props.view.template) {
            // Ensure we have the template view
            if (props.views[props.view.template]) {
                const templateView = props.views[props.view.template];
                // Render the view inside of the template
                //TODO Fix call
                const rendered = render.checkComponent({
                    mdb,
                    dispatch,
                    data: {
                        path: props.data.path ? props.data.path.concat(['views', props.views.template]) : ['views', props.views.template],
                        views: Object.assign({}, props.view.views, { main: props.view.main }),
                        view: templateView,
                        resolvers: this.resolvers,
                        previous: {
                            view: props.view,
                            previous: props.data
                        }
                    },
                    component: templateView.main
                });
                if (this.resolvers) {
                    Object.keys(this.resolvers).forEach((key) => {
                        this.resolvers[key].finishCheck();
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
            render.checkChildren({
                mdb,
                dispatch,
                data: {
                    view: props.view,
                    path: (props.data && props.data.path) || [],
                    previous: props.data,
                    resolvers: this.resolvers
                },
                children: props.view.main
            });
            if (this.resolvers) {
                Object.keys(this.resolvers).forEach((key) => {
                    this.resolvers[key].finishCheck();
                });
            }
        }
    }
    render() {
        const { mdb, dispatch } = this.props;
        if (this.props.view.template) {
            // Ensure we have the template view
            if (this.props.views[this.props.view.template]) {
                const templateView = this.props.views[this.props.view.template];
                // Render the view inside of the template
                const rendered = render.render({
                    mdb,
                    dispatch,
                    data: {
                        path: this.props.data.path ? this.props.data.path.concat(['views', this.props.views.template]) : ['views', this.props.views.template],
                        views: Object.assign({}, this.props.view.views, { main: this.props.view.main }),
                        view: templateView,
                        resolvers: this.resolvers,
                        previous: {
                            view: this.props.view,
                            previous: this.props.data
                        }
                    },
                    component: templateView.main
                });
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
                    view: this.props.view,
                    path: (this.props.data && this.props.data.path) || [],
                    previous: this.props.data,
                    resolvers: this.resolvers
                },
                children: this.props.view.main
            });
            return rendered;
        }
    }
}
;
exports.default = MDBView;
exports.checkView = (props) => {
};
//# sourceMappingURL=mdbView.js.map