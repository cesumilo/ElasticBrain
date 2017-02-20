/**
 * Created by Cesumilo on 17/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component, PropTypes } from 'react';
import { Button, Dialog, Intent } from "@blueprintjs/core";

export class EditVariablesDialog extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        save: PropTypes.func.isRequired,
        inputs: PropTypes.array.isRequired
    };

    constructor() {
        super();
        this.state = {
            isOpen: true,
            variables: []
        };
    }

    removeVariable(e, name) {
        let vars = this.state.variables;
        let i = 0;
        while (i < vars.length && vars[i] !== name) {
            i++;
        }
        vars.splice(i, 1);
        this.setState({
            variables: vars
        });
    }

    componentWillMount() {
        this.setState({
            variables: this.props.inputs
        });
    }

    toggleDialog() {
        this.setState({
            isOpen: !this.state.isOpen
        });
        this.props.onClose();
    }

    addVariable() {
        const vars = this.state.variables;
        vars.push("");
        this.setState({
            variables: vars
        });
    }

    saveChanges() {
        var variables = Array.prototype.slice.call(document.querySelectorAll(".input-variable-name")).map(function(input) {
            return input.value;
        });
        const options = {};
        options[this.props.data] = variables;
        this.props.save(options);
        this.toggleDialog();
    }

    updateInput(e, i) {
        let vars = this.state.variables;
        vars[i] = e.target.value;
        this.setState({
            variables: vars
        });
    }

    render() {
        var variables = this.state.variables.map((item, i) => {
            return (
                <div className="pt-input-group" key={'variable_' + i }>
                    <a className="pt-icon pt-icon-trash pt-inline" onClick={(e) => this.removeVariable(e, item)}></a>
                    <input className="pt-input input-variable-name" style={{width: 200 + 'px'}} type="text" dir="auto" defaultValue={item}
                           onChange={(e) => this.updateInput(e, i)}/>
                </div>
            );
        });

        return (
            <div>
                <Dialog iconName="build" isOpen={this.state.isOpen} onClose={() => this.toggleDialog()} title={this.props.title}>
                    <div className="pt-dialog-body">
                        {variables}
                    </div>
                    <div className="pt-dialog-footer">
                        <Button type="button" className="pt-button pt-icon-add pt-intent-primary" style={{ float: 'left' }} onClick={() => this.addVariable()}>Add variable</Button>
                        <div className="pt-dialog-footer-actions">
                            <Button text="Save" onClick={() => this.saveChanges()}/>
                            <Button intent={Intent.DANGER} onClick={() => this.toggleDialog()} text="Cancel"/>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}