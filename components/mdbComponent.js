"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const moltendb_1 = require("../lib/moltendb");
const mdbView_1 = require("./mdbView");
const view_1 = require("../actions/view");
class MoltenDBComponent extends React.Component {
    constructor(props) {
        super(props);
        if (!this.props.mdb) {
            // Create an instance of the MDB library to use
            this.mdb = moltendb_1.default();
        }
        else {
            this.mdb = this.props.mdb;
        }
        this.logger = this.mdb.logger.id('MDB component', '#ce6105');
    }
    render() {
        const { dispatch } = this.props;
        if (this.props.path) {
            // Check if the path loading/loaded is the same as the given
            if (this.props.state.pathLoading) {
                if (this.props.path !== this.props.state.pathLoading) {
                    if (this.props.path === this.props.state.pathCurrent) {
                        this.props.dispatch(view_1.cancelNavigation());
                    }
                }
            }
            else {
                if (this.props.path !== this.props.state.pathCurrent) {
                    // Check if the current path is good for the new path
                    if (this.props.state.view && this.props.state.view.paths
                        && this.props.state.view.paths.indexOf(path) !== -1) {
                    }
                    else {
                        // Load the new view
                        this.props.dispatch(view_1.navigate(this.props.path));
                        // Request new view from server
                        this.mdb.server.subscribe('path', {
                            path: this.props.path
                        }, (error, data) => {
                            if (error) {
                            }
                            else {
                                this.props.dispatch(view_1.updateView({
                                    view: data,
                                    path: this.props.path
                                }));
                            }
                        });
                    }
                }
            }
        }
        else if (this.props.viewId) {
            if (!this.props.state.view || this.props.viewId !== this.props.view._id) {
                this.props.dispatch(view_1.navigate(null, this.props.viewId));
                this.mdb.server.subscribe('view', {
                    _id: this.props.viewId
                }, (error, data) => {
                    if (error) {
                    }
                    else {
                        this.props.dispatch(view_1.updateView({
                            view: data,
                            id: this.props.viewId
                        }));
                    }
                });
            }
        }
        // Check status
        if (this.props.state && this.props.state.status === 'ERROR') {
            // TODO Change to used setting for error page
            this.mdb.server.subscribe('view', {
                _id: 'error'
            }, (data) => this.props.dispatch(view_1.updateView({
                view: data,
                error: this.props.state.error
            })));
        }
        if (!(this.props.state && this.props.state.view)) {
            return null;
        }
        return (React.createElement(mdbView_1.default, { dispatch: dispatch, mdb: Object.assign({}, this.mdb, { logger: this.logger }), view: this.props.state.view }));
    }
}
;
exports.default = MoltenDBComponent;
//# sourceMappingURL=mdbComponent.js.map