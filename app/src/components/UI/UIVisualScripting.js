/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { ContextMenu } from "@blueprintjs/core";
import { UIContextMenu } from './UIContextMenu';
import { UIBlock } from './UIBlock';
import '../../../public/css/VScriptingGUI.css';

var UIGraphics = require('./UIGraphics');
var UIEvents = require('./UIEvents');

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
            mouseFollowHandlers: [],
            shouldUpdateHandlers: [],
            contextMenuModeHandlers: [],
            willClickDrop: false,
            isClickDrop: false,

            guiObjects: [],
            isContextMenuOpen: false
        };

        UIEvents.setVisualScriptingUI(this);
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
            var block1 = new UIBlock("block1", {
                inputs: [{ name: "a", src: null }],
                outputs: [{ name: "b", dest: null }]
            });
            this.addDrawableObject(block1);
            block1.setCanvas(this.state.canvas);
            block1.generateMagnets();
            this.addEventListener("mouseBeginClickAndDrop", (e) => block1.mouseBeginClickAndDropHandler(e));
            this.addEventListener("mouseEndClickAndDrop", (e) => block1.mouseEndClickAndDropHandler(e));
            this.addEventListener("mouseMove", (e) => block1.update(e));

            var block2 = new UIBlock("block2", {
                inputs: [{ name: "c", src: null }],
                outputs: [{ name: "d", dest: null }]
            });
            this.addDrawableObject(block2);
            block2.setCanvas(this.state.canvas);
            block2.generateMagnets();
            this.addEventListener("mouseBeginClickAndDrop", (e) => block2.mouseBeginClickAndDropHandler(e));
            this.addEventListener("mouseEndClickAndDrop", (e) => block2.mouseEndClickAndDropHandler(e));
            this.addEventListener("mouseMove", (e) => block2.update(e));
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
        var i = 0;
        if (e.button == UIEvents.getButton("mouseRightButton")) {
            while (i < this.state.contextMenuModeHandlers.length && !this.state.contextMenuModeHandlers[i](e)) {
                i++;
            }
            if (i >= this.state.contextMenuModeHandlers.length) {
                UIEvents.removeState('custom-context-menu');
            }
        }

        if (e.button != UIEvents.getButton("mouseRightButton")) {
            this.setState({
                willClickDrop: true
            });
        }
    }

    mouseUpHandler(e) {
        if (!this.state.isClickDrop) {
            for (var i = 0; i < this.state.mouseClickHandlers.length; i++) {
                if (this.state.mouseClickHandlers[i](e)) {
                    this.forceUpdate();
                    break;
                }
            }
        } else {
            for (var j = 0; j < this.state.mouseEndClickAndDropHandlers.length; j++) {
                if (this.state.mouseEndClickAndDropHandlers[j](e))
                    break;
            }
        }

        this.setState({
            willClickDrop: false,
            isClickDrop: false
        });
    }

    mouseMoveHandler(e) {
        var pos = UIGraphics.getCanvasCoordinates(this.state.canvas, e.clientX, e.clientY);

        if (this.state.willClickDrop && !this.state.isClickDrop) {
            this.setState({
                isClickDrop: true
            }, function() {
                for (var j = 0; j < this.state.mouseBeginClickAndDropHandlers.length; j++) {
                    if (this.state.mouseBeginClickAndDropHandlers[j](e))
                        break;
                }
            });
        }

        if (this.state.isClickDrop) {
            for (var i = 0; i < this.state.mouseMoveHandlers.length; i++) {
                if (this.state.mouseMoveHandlers[i]({
                    x: pos.x - this.state.oldMousePosition.x,
                    y: pos.y - this.state.oldMousePosition.y
                })) {
                    this.forceUpdate();
                    break;
                }
            }
        }

        for (var j = 0; j < this.state.mouseFollowHandlers.length; j++) {
            if (this.state.mouseFollowHandlers[j]({
                    x: pos.x - this.state.oldMousePosition.x,
                    y: pos.y - this.state.oldMousePosition.y
                })) {
                this.forceUpdate();
                break;
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
                return this.state.mouseClickHandlers.length - 1;
            case "mouseMove":
                this.state.mouseMoveHandlers.push(callback);
                return this.state.mouseMoveHandlers.length - 1;
            case "mouseBeginClickAndDrop":
                this.state.mouseBeginClickAndDropHandlers.push(callback);
                return this.state.mouseBeginClickAndDropHandlers.length - 1;
            case "mouseEndClickAndDrop":
                this.state.mouseEndClickAndDropHandlers.push(callback);
                return this.state.mouseEndClickAndDropHandlers.length - 1;
            case "mouseFollow":
                this.state.mouseFollowHandlers.push(callback);
                return this.state.mouseFollowHandlers.length - 1;
            case "contextMenuMode":
                this.state.contextMenuModeHandlers.push(callback);
                return this.state.contextMenuModeHandlers.length - 1;
            default:
                return -1;
        }
    }

    removeEventListener(name, id) {
        switch(name) {
            case "mouseClick":
                if (id >= this.state.mouseClickHandlers.length) {
                    return false;
                }
                this.state.mouseClickHandlers.splice(id, 1);
                return true;
            case "mouseMove":
                if (id >= this.state.mouseMoveHandlers.length) {
                    return false;
                }
                this.state.mouseMoveHandlers.splice(id, 1);
                return true;
            case "mouseBeginClickAndDrop":
                if (id >= this.state.mouseBeginClickAndDropHandlers.length) {
                    return false;
                }
                this.state.mouseBeginClickAndDropHandlers.splice(id, 1);
                return true;
            case "mouseEndClickAndDrop":
                if (id >= this.state.mouseEndClickAndDropHandlers.length) {
                    return false;
                }
                this.state.mouseEndClickAndDropHandlers.splice(id, 1);
                return true;
            case "mouseFollow":
                if (id >= this.state.mouseFollowHandlers.length) {
                    return false;
                }
                this.state.mouseFollowHandlers.splice(id, 1);
                return true;
            case "contextMenuMode":
                if (id >= this.state.contextMenuModeHandlers.length) {
                    return false;
                }
                this.state.contextMenuModeHandlers.splice(id, 1);
                return true;
            default:
                return false;
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