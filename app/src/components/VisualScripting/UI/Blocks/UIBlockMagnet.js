/**
 * Created by Cesumilo on 21/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React from 'react';
import { UIBlockLink } from './UIBlockLink';
import { UIBlockMagnetContextMenu } from './UIBlockMagnetContextMenu';
import { UIDrawable } from '../UIDrawable';

let UIGraphics = require('./../UIGraphics');
let UIStyles = require('./../UIStyles');
let UIEvents = require('./../UIEvents');

export class UIBlockMagnet extends UIDrawable {
    constructor(parent, name = UIStyles.UIBlockMagnetDefaultName, input = false, color=UIStyles.UIBlockMagnetInputFillColor) {
        super(input === false ? "output" : "input");

        this._name = name;
        this._parent = parent;
        this._links = [];
        this._inputLink = null;
        this._color = color;
        this._width = UIStyles.UIBlockMagnetDefaultWidth;
        this._height = UIStyles.UIBlockMagnetDefaultHeight;

        this.initEventListeners();
        this.addHandlers(UIEvents.events.MOUSE_CLICK,
            UIEvents.addEventListener(UIEvents.events.MOUSE_CLICK, (e) => this.mouseClickHandler(e)));
        this.addHandlers(UIEvents.events.CONTEXT_MENU_MODE,
            UIEvents.addEventListener(UIEvents.events.CONTEXT_MENU_MODE, (e) => this.contextMenuModeHandler(e)));
    }

    initEventListeners() {
        this._handlers[UIEvents.events.MOVE_MAGNET] = [];
    }

    getName() {
        return this._name;
    }

    getParent() {
        return this._parent;
    }

    removeLink(id) {
        if (id >= this._links.length) {
            return false;
        }
        this._links.splice(id, 1);
        return true;
    }

    update(delta) {
        this._pos = { x: this._pos.x + delta.x, y: this._pos.y + delta.y };
        for (let i = 0; i < this._handlers[UIEvents.events.MOVE_MAGNET].length; i++) {
            this._handlers[UIEvents.events.MOVE_MAGNET][i](delta);
        }
    }

    mouseClickHandler(e) {
        const pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (this._type === "output"
            && pos.x >= this._pos.x - 10 && pos.x <= this._pos.x + this._width + 10
            && pos.y >= this._pos.y - 10 && pos.y <= this._pos.y + this._height + 10
            && !UIEvents.getState('currentLink')) {

            let link = new UIBlockLink();
            link.setCanvas(this._canvas);
            link.attachFrom(this._pos.x + this._width / 2, this._pos.y + this._height / 2, this);
            link.attachTo(pos.x, pos.y, null);
            this.addEventListener(UIEvents.events.MOVE_MAGNET, (delta) => link.eventUpdateFrom(delta));
            this._links.push(link);
            link.setId(this._links.length - 1);
            UIEvents.addState('currentLink', link);
            return true;

        } else if (this._type === "input"
            && pos.x >= this._pos.x - 10 && pos.x <= this._pos.x + this._width + 10
            && pos.y >= this._pos.y - 10 && pos.y <= this._pos.y + this._height + 10
            && UIEvents.getState('currentLink')) {

            let currentLink = UIEvents.getState('currentLink');
            currentLink.attachTo(this._pos.x + this._width / 2, this._pos.y + this._height / 2, this);
            this.addEventListener(UIEvents.events.MOVE_MAGNET, (delta) => currentLink.eventUpdateTo(delta));
            if (this._inputLink) {
                this._inputLink.getObjectFrom().removeLink(this._inputLink.getId());
            }
            this._inputLink = currentLink;
            UIEvents.removeState('currentLink');
            return true;
        }
        return false;
    }

    contextMenuModeOnEditAndSave() {
        if (this._inputLink) {
            this._inputLink.toggleEditMode();
        }
    }

    contextMenuModeHandler(e) {
        const pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (this._type === "input"
            && this._inputLink && pos.x >= this._pos.x - 5 && pos.x <= this._pos.x + this._width + 5
            && pos.y >= this._pos.y - 5 && pos.y <= this._pos.y + this._height + 5) {

            UIEvents.addState(UIEvents.states.CUSTOM_CONTEXT_MENU,
                <UIBlockMagnetContextMenu
                    isEditing={this._inputLink.isInEditMode()}
                    onEdit={() => this.contextMenuModeOnEditAndSave()}
                    onSave={() => this.contextMenuModeOnEditAndSave()}
                    onCut={() => this._inputLink.getObjectFrom().removeLink(this._inputLink.getId())} />
            );
            return true;
        }
        return false;
    }

    draw() {
        for (let i = 0; i < this._links.length; i++) {
            this._links[i].draw();
        }
        this._ctx.fillStyle = this._color;
        this._ctx.fillRect(this._pos.x, this._pos.y, this._width, this._height);
    }
}