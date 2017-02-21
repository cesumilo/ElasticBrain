/**
 * Created by Cesumilo on 07/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React from 'react';
import { UIBlockLink } from './UIBlockLink';
import { UIBlockMagnetContextMenu } from './UIBlockMagnetContextMenu';
import { UIBlockMagnet } from './UIBlockMagnet';

let UIGraphics = require('./../UIGraphics');
let UIStyles = require('./../UIStyles');
let UIEvents = require('./../UIEvents');

export class Flow extends UIBlockMagnet {

    constructor(parent, name = UIStyles.UIBlockMagnetDefaultName, input = false, color=UIStyles.UIBlockMagnetInputFillColor) {
        super(parent, name, input, color);
    }

    mouseClickHandler(e) {
        const pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (this._type === "output"
            && pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height
            && !UIEvents.getState('currentLink')) {

            let link = new UIBlockLink();
            link.setCanvas(this._canvas);
            link.attachFrom(this._pos.x + this._width / 2, this._pos.y + this._height / 2, this);
            link.attachTo(pos.x, pos.y, null);
            this.addEventListener(UIEvents.events.MOVE_MAGNET, (delta) => link.eventUpdateFrom(delta));
            if (this._inputLink) {
                this._inputLink.getObjectTo().removeLink(this._inputLink.getId());
            }
            UIEvents.addState('currentLink', link);
            this._inputLink = link;
            return true;

        } else if (this._type === "input"
            && pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height
            && UIEvents.getState('currentLink')) {

            let currentLink = UIEvents.getState('currentLink');
            currentLink.attachTo(this._pos.x + this._width / 2, this._pos.y + this._height / 2, this);
            this.addEventListener(UIEvents.events.MOVE_MAGNET, (delta) => currentLink.eventUpdateTo(delta));
            this._links.push(currentLink);
            currentLink.setId(this._links.length - 1);
            UIEvents.removeState('currentLink');
            return true;
        }
        return false;
    }

    removeInputLink() {
        this._inputLink.getObjectTo().removeLink(this._inputLink.getId());
        delete this._inputLink;
        this._inputLink = null;
    }

    contextMenuModeHandler(e) {
        const pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (this._type === "output"
            && this._inputLink && pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height) {

            UIEvents.addState('custom-context-menu',
                <UIBlockMagnetContextMenu
                    isEditing={this._inputLink.isInEditMode()}
                    onEdit={() => this.contextMenuModeOnEditAndSave()}
                    onSave={() => this.contextMenuModeOnEditAndSave()}
                    onCut={() => this.removeInputLink()} />
            );
            return true;
        }
        return false;
    }

    draw() {
        if (this._inputLink) {
            this._inputLink.draw();
        }
        this._ctx.fillStyle = this._color;
        this._ctx.fillRect(this._pos.x, this._pos.y, this._width, this._height);
    }

}