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
import { UIDrawable } from './UIDrawable';
import '../../../../public/css/VScriptingGUI.css';

let UIGraphics = require('./UIGraphics');
let UIEvents = require('./UIEvents');

/**
 * Describe the UI class for Visual Scripting.
 * @extends {Component}
 */
export class UIVisualScripting extends Component {

    /**
     * Construct the UI interface of the Visual Scripting canvas, and set the component's states.
     * @param {object} props Contains the properties of the JSX element.
     */
    constructor(props) {
        super(props);

        /**
         * Contains the background of the canvas.
         * @type {UIBackground}
         * @private
         */
        this._background =  new UIBackground();

        /**
         * Contains all the handlers which have been registered.
         * @type {object}
         * @private
         */
        this._handlers = {};

        /**
         * Contains all the drawable objects.
         * @type {Array}
         * @private
         */
        this._guiObjects = [];

        /**
         * Contains all the states of the React Component.
         * @type {object}
         */
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

    /**
     * Initialize all the handlers that support the UI.
     */
    initHandlers() {
        this._handlers[UIEvents.events.MOUSE_CLICK] = [];
        this._handlers[UIEvents.events.MOUSE_MOVE] = [];
        this._handlers[UIEvents.events.BEGIN_CLICK_AND_DROP] = [];
        this._handlers[UIEvents.events.END_CLICK_AND_DROP] = [];
        this._handlers[UIEvents.events.FOLLOW_MOUSE] = [];
        this._handlers[UIEvents.events.CONTEXT_MENU_MODE] = [];
    }

    /**
     * Returns the actual canvas of the UI.
     * @returns {object}
     */
    getCanvas() {
        return this.state.canvas;
    }

    /**
     * Initialize all the UI dependencies and register the UI to the canvas events.
     */
    componentDidMount() {
        this.setState({
            canvas: document.getElementById('vscripting-gui')
        }, function() {
            this._background.setCanvas(this.state.canvas);

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

    /**
     * Draw all the objects that are in the canvas.
     */
    componentDidUpdate() {
        if (this.state.ctx) {
            this.state.canvas.width = this.state.canvas.width;
            this._background.draw();
            for (let i = 0; i < this._guiObjects.length; i++) {
                this._guiObjects[i].draw();
            }
        }
    }

    /**
     * Allow to add new object in the canvas. The object has to inherit from UIDrawable class.
     * @param {object} object Contains the new object which will be draw on the canvas.
     */
    addDrawableObject(object) {
        if (object instanceof UIDrawable) {
            this._guiObjects.push(object);
        }
    }

    /**
     * Handle the mouse button down event.
     * @param {object} e Contains the event send by the canvas.
     */
    mouseDownHandler(e) {
        let i = 0;

        if (e.button === UIEvents.getButton("mouseRightButton")) {
            while (i < this._handlers[UIEvents.events.CONTEXT_MENU_MODE].length && !this._handlers[UIEvents.events.CONTEXT_MENU_MODE][i](e)) {
                i++;
            }
            if (i >= this._handlers[UIEvents.events.CONTEXT_MENU_MODE].length) {
                UIEvents.removeState(UIEvents.states.CUSTOM_CONTEXT_MENU);
            }
        }

        if (e.button !== UIEvents.getButton("mouseRightButton")) {
            this.setState({
                willClickDrop: true
            });
        }
    }

    /**
     * Handle the mouse button up event.
     * @param {object} e Contains the event send by the canvas
     */
    mouseUpHandler(e) {
        let i = 0;

        if (!this.state.isClickDrop) {
            while (i < this._handlers[UIEvents.events.MOUSE_CLICK].length && !this._handlers[UIEvents.events.MOUSE_CLICK][i](e)) {
                i++;
            }
        } else {
            while (i < this._handlers[UIEvents.events.END_CLICK_AND_DROP].length
                    && !this._handlers[UIEvents.events.END_CLICK_AND_DROP][i](e)) {
                i++;
            }
        }

        this.setState({
            willClickDrop: false,
            isClickDrop: false
        });
    }

    /**
     * Handle the mouse movement.
     * @param {object} e Contains the event send by the canvas.
     */
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
                while (j < this._handlers[UIEvents.events.BEGIN_CLICK_AND_DROP].length
                        && !this._handlers[UIEvents.events.BEGIN_CLICK_AND_DROP][j](e)) {
                    j++;
                }
            });
        }

        if (this.state.isClickDrop) {
            i = 0;
            while (i < this._handlers[UIEvents.events.MOUSE_MOVE].length
                    && !this._handlers[UIEvents.events.MOUSE_MOVE][i](newMousePos)) {
                i++;
            }
        }

        i = 0;
        while (i < this._handlers[UIEvents.events.FOLLOW_MOUSE].length
                && !this._handlers[UIEvents.events.FOLLOW_MOUSE][i](newMousePos)) {
            i++;
        }

        this.setState({ oldMousePosition: pos });
    }

    /**
     * Allow to register a callback to an event supported by the UI.
     * @param {string} name Contains the name of the event that the callback will be registered.
     * @param {function} callback Contains the callback function which will be called when the event is fired.
     * @returns {number} Returns the index of the callback in the registering list.
     */
    addEventListener(name, callback) {
        if (!this._handlers.hasOwnProperty(name))
            return -1;
        this._handlers[name].push(callback);
        return this._handlers[name].length;
    }

    /**
     * Allow to remove a callback from an event.
     * @param {string} name Contains the name of the event that the callback has been registered.
     * @param {number} id Contains the index in the registering list of the callback.
     * @returns {boolean} Returns true if the removing has been done.
     */
    removeEventListener(name, id) {
        if (!this._handlers.hasOwnProperty(name) || id >= this._handlers[name].length)
            return false;
        this._handlers[name].splice(id, 1);
        return true;
    }

    /**
     * Show the context menu when the event is fired.
     * @param {object} e Contains the event fired by the canvas.
     */
    showContextMenu(e) {
        e.preventDefault();
        ContextMenu.show(<UIContextMenu/>, { left: e.clientX, top: e.clientY }, () => this.onContextMenuClose());
        this.setState({ isContextMenuOpen: true });
    }

    /**
     * Close the current context menu.
     */
    onContextMenuClose() {
        this.setState({ isContextMenuOpen: false });
    }

    /**
     * Render the Visual Scripting UI in the DOM.
     * @returns {XML}
     */
    render() {
        const classes = classNames("context-menu-node", { "context-menu-open": this.state.isContextMenuOpen });
        const contents = UIEvents.getState(UIEvents.states.EXTRA_CONTENTS).map(function(content, i){
            return React.cloneElement(content, { key: 'content_' + i });
        });

        return (
            <div className={classes} onContextMenu={(e) => this.showContextMenu(e)}>
                {contents}
                <img id="vscripting-gui-background" src="img/grid.jpg" style={{display: "none"}} alt="background" />
                <canvas id="vscripting-gui"></canvas>
            </div>
        );
    }
}