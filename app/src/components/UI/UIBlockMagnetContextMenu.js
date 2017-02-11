/**
 * Created by Cesumilo on 11/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import { Menu, MenuItem } from "@blueprintjs/core";

export class UIBlockMagnetContextMenu extends Component {
    render() {
        if (this.props.isEditing) {
            return (
                <Menu>
                    <MenuItem onClick={this.props.onEdit} iconName="saved" text="Save curve"/>
                    <MenuItem onClick={this.props.onCut} iconName="cut" text="Remove"/>
                </Menu>
            );
        }
        return (
            <Menu>
                <MenuItem onClick={this.props.onSave} iconName="edit" text="Edit curve"/>
                <MenuItem onClick={this.props.onCut} iconName="cut" text="Remove"/>
            </Menu>
        );
    }
}