/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";

export class UIContextMenu extends Component {
    render() {
        return (
            <Menu>
                <MenuItem onClick={this.props.onClick} iconName="new-object" text="New..." />
            </Menu>
        );
    }
}