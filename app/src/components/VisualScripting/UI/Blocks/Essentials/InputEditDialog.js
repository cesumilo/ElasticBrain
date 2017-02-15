/**
 * Created by Cesumilo on 14/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import { Button, Dialog, Intent } from "@blueprintjs/core";

export class InputEditDialog extends Component {
    constructor() {
        super();
        this.state = {
            isOpen: true
        };
    }

    toggleDialog() {
        this.setState({
            isOpen: !this.state.isOpen
        });
        this.props.onClose();
    }

    render() {
        return (
            <div>
                <Dialog iconName="build" isOpen={this.state.isOpen} onClose={() => this.toggleDialog()} title="Edit Blueprint Inputs">
                    <div className="pt-dialog-body">
                        Some content
                    </div>
                    <div className="pt-dialog-footer">
                        <div className="pt-dialog-footer-actions">
                            <Button text="Save" />
                            <Button intent={Intent.DANGER} onClick={() => this.toggleDialog()} text="Cancel"/>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}