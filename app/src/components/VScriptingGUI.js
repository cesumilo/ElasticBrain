import React, { Component } from 'react';
import classNames from 'classnames';
import { BlockLink } from '../UI/BlockLink';
import { ContextMenu, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import '../../public/css/VScriptingGUI.css';

export class VScriptingGUI extends React.Component {

    constructor() {
        super();
        this.state = {
            canvas: null,
            ctx: null,
            pts: [],
            circleOffset: 50,
            circleRadius: 10,
            mouseClickHandlers: [],
            mouseMoveHandlers: [],
            mouseNbClicks: 0,
            guiObjects: [],
            isContextMenuOpen: false
        };
    }

    componentDidMount() {
        this.setState({
            canvas: document.getElementById('vscripting-gui')
        }, function() {
            this.state.canvas.setAttribute("width", document.body.clientWidth);
            this.state.canvas.setAttribute("height", document.body.clientHeight * 0.938);
            this.state.canvas.addEventListener("mousedown", (e) => this.mouseClickHandler(e));
            this.state.canvas.addEventListener("mousemove", (e) => this.mouseMoveHandler(e));

            this.setState({
                ctx: this.state.canvas.getContext('2d')
            });
        });
    }

    componentWillUpdate() {
        if (this.state.ctx) {
            for (var i = 0; i < this.state.guiObjects.length; i++) {
                this.state.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
                this.state.guiObjects[i].draw();
            }
        }
    }

    addDrawableObject(object) {
        this.state.guiObjects.push(object);
    }

    mouseClickHandler(e) {
        this.setState({
            mouseNbClicks: this.state.mouseNbClicks + 1
        });

        for (var i = 0; i < this.state.mouseClickHandlers.length; i++) {
            this.state.mouseClickHandlers[i](e, this.state.mouseNbClicks);
        }

        if (this.state.mouseNbClicks > 1) {
            this.setState({
                mouseNbClicks: 0
            });
        }
    }

    mouseMoveHandler(e) {
        for (var i = 0; i < this.state.mouseMoveHandlers.length; i++) {
            this.state.mouseClickHandlers[i](e);
        }
    }

    addEventListener(name, callback) {
        switch(name) {
            case "mouseClick":
                this.state.mouseClickHandlers.push(callback);
                break;
            case "mouseMove":
                this.state.mouseMoveHandlers.push(callback);
                break;
        }
    }

    showContextMenu(e) {
        // must prevent default to cancel parent's context menu
        e.preventDefault();
        // invoke static API, getting coordinates from mouse event
        ContextMenu.show(
            <Menu>
                <MenuItem iconName="add-to-artifact" text="New..." />
            </Menu>,
            { left: e.clientX, top: e.clientY },
            () => this.onContextMenuClose());
        // indicate that context menu is open so we can add a CSS class to this element
        this.setState({ isContextMenuOpen: true });
    }

    onContextMenuClose() {
        this.setState({ isContextMenuOpen: false });
    }

    render() {
        const classes = classNames("context-menu-node", { "context-menu-open": this.state.isContextMenuOpen });
        return (
            <div className={classes} onContextMenu={this.showContextMenu}>
                <canvas id="vscripting-gui"></canvas>
            </div>
        );
    }
}