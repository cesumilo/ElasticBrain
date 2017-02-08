/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { BlockLink } from './UIBlockLink';
import { ContextMenu } from "@blueprintjs/core";
import { UIContextMenu } from './UIContextMenu';
import { UIBlock } from './UIBlock';

import '../../../public/css/VScriptingGUI.css';

export class UIVisualScripting extends Component {

    constructor() {
        super();
        this.state = {
            canvas: null,
            ctx: null,
            pts: [],
            mouseClickHandlers: [],
            mouseMoveHandlers: [],
            shouldUpdateHandlers: [],
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

            // TEST
            var block1 = new UIBlock("Toto", {
                inputs: [/*{ name: "test1", src: null }, { name: "test2", src: null },*/ { name: "elfihzerliufhzelriuhfgzleiruh", src: null }, { name: "test4", src: null }],
                outputs: [{ name: "test5", dest: null }, { name: "test6", dest: null }, { name: "test7", dest: null }]
            });
            this.addDrawableObject(block1);
            block1.setCanvas(this.state.canvas);
            block1.generateMagnets();
            this.addEventListener("mouseClick", (e, nbClicks) => block1.mouseClickHandler(e, nbClicks));
            this.addEventListener("mouseMove", (e) => block1.update(e));

            /*var block2 = new UIBlock();
            this.addDrawableObject(block2);
            block2.setCanvas(this.state.canvas);
            block2.generateMagnets();
            this.addEventListener("mouseClick", (e, nbClicks) => block2.mouseClickHandler(e, nbClicks));
            this.addEventListener("mouseMove", (e) => block2.update(e));*/
            //FIN TEST

            this.setState({
                ctx: this.state.canvas.getContext('2d')
            }, function() {
                this.forceUpdate();
            });
        });
    }

    componentWillUpdate() {
        if (this.state.ctx) {
            this.state.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
            for (var i = 0; i < this.state.guiObjects.length; i++) {
                this.state.guiObjects[i].draw();
            }
        }
    }

    addDrawableObject(object) {
        if (typeof object.draw === "function") {
            this.state.guiObjects.push(object);
        }
    }

    mouseClickHandler(e) {
        var state = false;
        var i = 0;

        this.setState({
            mouseNbClicks: this.state.mouseNbClicks + 1
        });

        while (i < this.state.mouseClickHandlers.length && !state) {
            state |= this.state.mouseClickHandlers[i](e, this.state.mouseNbClicks);
            i++;
        }

        if (!state || this.state.mouseNbClicks > 1) {
            this.setState({
                mouseNbClicks: 0
            });
        }
    }

    mouseMoveHandler(e) {
        for (var i = 0; i < this.state.mouseMoveHandlers.length; i++) {
            if (this.state.mouseMoveHandlers[i](e)) {
                this.forceUpdate();
            }
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
            default:
                break;
        }
    }

    showContextMenu(e) {
        // must prevent default to cancel parent's context menu
        e.preventDefault();
        ContextMenu.show(<UIContextMenu/>, { left: e.clientX, top: e.clientY }, () => this.onContextMenuClose());
        this.setState({ isContextMenuOpen: true });
    }

    onContextMenuClose() {
        this.setState({ isContextMenuOpen: false });
    }

    render() {
        const classes = classNames("context-menu-node", { "context-menu-open": this.state.isContextMenuOpen });
        return (
            <div className={classes} onContextMenu={(e) => this.showContextMenu(e)}>
                <canvas id="vscripting-gui"></canvas>
            </div>
        );
    }
}