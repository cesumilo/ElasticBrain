/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { ContextMenu } from "@blueprintjs/core";
import { UIContextMenu } from './UIContextMenu';
import { UIBlock } from './Blocks/UIBlock';
import { Blueprint } from './Blueprint';
import { UIBlueprint } from './UIBlueprint';
import { UIBackground } from './UIBackground';
import '../../../../public/css/VScriptingGUI.css';

var UIGraphics = require('./UIGraphics');
var UIEvents = require('./UIEvents');

export class UIVisualScripting extends Component {

    constructor(props) {
        super(props);

        this.background =  new UIBackground();
        this.handlers = {};
        this.guiObjects = [];

        this.state = {
            canvas: null,
            ctx: null,
            oldMousePosition: { x: 0, y: 0 },
            willClickDrop: false,
            isClickDrop: false,
            isContextMenuOpen: false
        };

        this.initHandlers();
        UIEvents.setVisualScriptingUI(this);
    }

    initHandlers() {
        this.handlers[UIEvents.events.MOUSE_CLICK] = [];
        this.handlers[UIEvents.events.MOUSE_MOVE] = [];
        this.handlers[UIEvents.events.BEGIN_CLICK_AND_DROP] = [];
        this.handlers[UIEvents.events.END_CLICK_AND_DROP] = [];
        this.handlers[UIEvents.events.FOLLOW_MOUSE] = [];
        this.handlers[UIEvents.events.CONTEXT_MENU_MODE] = [];
    }

    getCanvas() {
        return this.state.canvas;
    }

    componentDidMount() {
        this.setState({
            canvas: document.getElementById('vscripting-gui')
        }, function() {
            this.background.setCanvas(this.state.canvas);

            // TODO: Revoir comment adapter la taille du canvas à l'écran
            this.state.canvas.setAttribute("width", document.body.clientWidth);
            this.state.canvas.setAttribute("height", document.body.clientHeight * 0.938);

            this.state.canvas.addEventListener("mousedown", (e) => this.mouseDownHandler(e));
            this.state.canvas.addEventListener("mousemove", (e) => this.mouseMoveHandler(e));
            this.state.canvas.addEventListener("mouseup", (e) => this.mouseUpHandler(e));

            /* TESTING ZONE */
            var blueprint = new Blueprint("blueprint", ["position", "scale"], ["position"]);
            blueprint.addBlock(new UIBlock("test", "#B71C1C", "#000000", {
                inputs: ["a"],
                outputs: ["b"]
            }, "#000000"));
            var ui = new UIBlueprint(blueprint);
            ui.setCanvas(this.state.canvas);
            this.addDrawableObject(blueprint);
            /* END OF TESTING ZONE */

            this.setState({
                ctx: this.state.canvas.getContext('2d')
            });
        });
    }

    componentDidUpdate() {
        if (this.state.ctx) {
            this.state.canvas.width = this.state.canvas.width;
            this.background.draw();
            for (let i = 0; i < this.guiObjects.length; i++) {
                this.guiObjects[i].draw();
            }
        }
    }

    addDrawableObject(object) {
        if (typeof object.draw === "function") {
            this.guiObjects.push(object);
        }
    }

    mouseDownHandler(e) {
        let i = 0;

        if (e.button === UIEvents.getButton("mouseRightButton")) {
            while (i < this.handlers[UIEvents.events.CONTEXT_MENU_MODE].length && !this.handlers[UIEvents.events.CONTEXT_MENU_MODE][i](e)) {
                i++;
            }
            if (i >= this.handlers[UIEvents.events.CONTEXT_MENU_MODE].length) {
                UIEvents.removeState(UIEvents.states.CUSTOM_CONTEXT_MENU);
            }
        }

        if (e.button !== UIEvents.getButton("mouseRightButton")) {
            this.setState({
                willClickDrop: true
            });
        }
    }

    mouseUpHandler(e) {
        let i = 0;

        if (!this.state.isClickDrop) {
            while (i < this.handlers[UIEvents.events.MOUSE_CLICK].length && !this.handlers[UIEvents.events.MOUSE_CLICK][i](e)) {
                i++;
            }
        } else {
            while (i < this.handlers[UIEvents.events.END_CLICK_AND_DROP].length
                    && !this.handlers[UIEvents.events.END_CLICK_AND_DROP][i](e)) {
                i++;
            }
        }

        this.setState({
            willClickDrop: false,
            isClickDrop: false
        });
    }

    mouseMoveHandler(e) {
        const pos = UIGraphics.getCanvasCoordinates(this.state.canvas, e.clientX, e.clientY);
        const newMousePos = {
            x: pos.x - this.state.oldMousePosition.x,
            y: pos.y - this.state.oldMousePosition.y
        };
        let i = 0;

        if (this.state.willClickDrop && !this.state.isClickDrop) {
            this.setState({
                isClickDrop: true
            }, function() {
                let j = 0;
                while (j < this.handlers[UIEvents.events.BEGIN_CLICK_AND_DROP].length
                        && !this.handlers[UIEvents.events.BEGIN_CLICK_AND_DROP][j](e)) {
                    j++;
                }
            });
        }

        if (this.state.isClickDrop) {
            i = 0;
            while (i < this.handlers[UIEvents.events.MOUSE_MOVE].length
                    && !this.handlers[UIEvents.events.MOUSE_MOVE][i](newMousePos)) {
                i++;
            }
        }

        i = 0;
        while (i < this.handlers[UIEvents.events.FOLLOW_MOUSE].length
                && !this.handlers[UIEvents.events.FOLLOW_MOUSE][i](newMousePos)) {
            i++;
        }

        this.setState({ oldMousePosition: pos });
    }

    addEventListener(name, callback) {
        if (!this.handlers.hasOwnProperty(name))
            return -1;
        this.handlers[name].push(callback);
        return this.handlers[name].length;
    }

    removeEventListener(name, id) {
        if (!this.handlers.hasOwnProperty(name) || id >= this.handlers[name].length)
            return false;
        this.handlers[name].splice(id, 1);
        return true;
    }

    showContextMenu(e) {
        e.preventDefault();
        ContextMenu.show(<UIContextMenu/>, { left: e.clientX, top: e.clientY }, () => this.onContextMenuClose());
        this.setState({ isContextMenuOpen: true });
    }

    onContextMenuClose() {
        this.setState({ isContextMenuOpen: false });
    }

    render() {
        const classes = classNames("context-menu-node", { "context-menu-open": this.state.isContextMenuOpen });
        const contents = UIEvents.getState(UIEvents.states.EXTRA_CONTENTS).map(function(content, i){
            return React.cloneElement(content, { key: 'content_' + i });
        });

        return (
            <div className={classes} onContextMenu={(e) => this.showContextMenu(e)}>
                {contents}
                <img id="vscripting-gui-background" src="img/grid.jpg" style={{display: "none"}} />
                <canvas id="vscripting-gui"></canvas>
            </div>
        );
    }
}