/**
 * Created by Cesumilo on 06/02/2017.
 */
import React, { Component } from 'react';
import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";

export class UIContextMenu extends Component {
    render() {
        return (
            <Menu>
                <MenuItem onClick={this.props.onClick} iconName="add-to-artifact" text="New..." />
            </Menu>
        );
    }
}