"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const mdbView_1 = require("./mdbView");
class MoltenDB extends React.Component {
    constructor() {
        super(arguments);
        if (!this.props.mdb) {
            // Create an instance of the MDB library to use
            this.mdb = MoltenDB();
        }
        else {
            this.mdb = this.props.mdb;
        }
    }
    render() {
        if (props.path) {
            // Check if the path loading/loaded is the same as the given
            if (props.state.pathLoading) {
                if (props.path !== props.state.pathLoading) {
                    if (props.path === props.state.currentPath) {
                        props.actions.cancelNavigation();
                    }
                }
            }
            else {
                if (path !== props.state.currentPath) {
                    // Check if the current path is good for the new path
                    if (props.state.view.paths && props.state.view.paths.indexOf(path) !== -1) {
                    }
                    else {
                        // Load the new view
                        props.actions.navigate(props.path);
                        // Request new view from server
                        mdb.server.subscribe('path', {
                            path: props.path
                        }, props.actions.updateView);
                    }
                }
            }
        }
        else if (props.viewId) {
            if (!props.view || props.viewId !== props.view._id) {
                props.actions.navigate(null, props.viewId);
                mdb.server.subscribe('view', {
                    _id: props.viewId
                }, props.actions.updateView);
            }
        }
        // Check status
        if (props.state && props.state.status === 'ERROR') {
        }
        if (!props.view) {
            return null;
        }
        return mdbView_1.default({
            mdb: this.mdb,
            view: props.view
        });
    }
}
;
exports.default = MoltenDB;
