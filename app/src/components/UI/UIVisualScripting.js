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

var UIGraphics = require('./UIGraphics');

export class UIVisualScripting extends Component {

    constructor() {
        super();
        this.state = {
            canvas: null,
            ctx: null,

            oldMousePosition: { x: 0, y: 0 },
            mouseClickHandlers: [],
            mouseMoveHandlers: [],
            mouseBeginClickAndDropHandlers: [],
            mouseEndClickAndDropHandlers: [],
            shouldUpdateHandlers: [],
            willClickDrop: false,
            isClickDrop: false,

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
            this.state.canvas.addEventListener("mousedown", (e) => this.mouseDownHandler(e));
            this.state.canvas.addEventListener("mousemove", (e) => this.mouseMoveHandler(e));
            this.state.canvas.addEventListener("mouseup", (e) => this.mouseUpHandler(e));

            // TEST
            var block1 = new UIBlock("ferlkfhzelkrhfzlekrjhglzkhglz", {
                inputs: [{ name: "test1", src: null }, { name: "test2", src: null }, { name: "test3", src: null }, { name: "test4", src: null }],
                outputs: [{ name: "test5", dest: null }, { name: "test6", dest: null }, { name: "test7", dest: null }]
            });
            this.addDrawableObject(block1);
            block1.setCanvas(this.state.canvas);
            block1.generateMagnets();
            this.addEventListener("mouseBeginClickAndDrop", (e) => block1.mouseBeginClickAndDropHandler(e));
            this.addEventListener("mouseEndClickAndDrop", (e) => block1.mouseEndClickAndDropHandler(e));
            this.addEventListener("mouseMove", (e) => block1.update(e));
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

    mouseDownHandler(e) {
        this.setState({
            willClickDrop: true
        });
    }

    mouseUpHandler(e) {
        if (!this.state.isClickDrop) {
            for (var i = 0; i < this.state.mouseClickHandlers.length; i++) {
                if (this.state.mouseClickHandlers[i](e)) {
                    this.forceUpdate();
                }
            }
        } else {
            for (var j = 0; j < this.state.mouseEndClickAndDropHandlers.length; j++) {
                this.state.mouseEndClickAndDropHandlers[j](e);
            }
        }

        this.setState({
            willClickDrop: false,
            isClickDrop: false
        });
    }

    mouseMoveHandler(e) {
        if (this.state.willClickDrop && !this.state.isClickDrop) {
            this.setState({
                isClickDrop: true
            }, function() {
                for (var j = 0; j < this.state.mouseBeginClickAndDropHandlers.length; j++) {
                    this.state.mouseBeginClickAndDropHandlers[j](e);
                }
            });
        }

        if (this.state.isClickDrop) {
            var pos = UIGraphics.getCanvasCoordinates(this.state.canvas, e.clientX, e.clientY);
            for (var i = 0; i < this.state.mouseMoveHandlers.length; i++) {
                if (this.state.mouseMoveHandlers[i]({
                    x: pos.x - this.state.oldMousePosition.x,
                    y: pos.y - this.state.oldMousePosition.y
                })) {
                    this.forceUpdate();
                }
            }
        }

        this.setState({
            oldMousePosition: UIGraphics.getCanvasCoordinates(this.state.canvas, e.clientX, e.clientY)
        });
    }

    addEventListener(name, callback) {
        switch(name) {
            case "mouseClick":
                this.state.mouseClickHandlers.push(callback);
                break;
            case "mouseMove":
                this.state.mouseMoveHandlers.push(callback);
                break;
            case "mouseBeginClickAndDrop":
                this.state.mouseBeginClickAndDropHandlers.push(callback);
                break;
            case "mouseEndClickAndDrop":
                this.state.mouseEndClickAndDropHandlers.push(callback);
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