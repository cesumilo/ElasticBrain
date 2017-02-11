/**
 * Created by Cesumilo on 07/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlockLink } from './UIBlockLink';

var UIGraphics = require('./UIGraphics');
var UIStyles = require('./UIStyles');
var UIEvents = require('./UIEvents');

export class UIBlockMagnet {

    constructor(parent, name = UIStyles.UIBlockMagnetDefaultName, input = false) {
        this._name = name;
        this._type = input === false ? "output" : "input";
        this._ctx = null;
        this._canvas = null;
        this._pos = { x: 0, y: 0 };
        this._width = UIStyles.UIBlockMagnetDefaultWidth;
        this._height = UIStyles.UIBlockMagnetDefaultHeight;
        this._radius = UIStyles.UIBlockMagnetDefaultRadius;
        this._parent = parent;
        this._links = [];
        this._moveMagnetHandlers = [];

        this._mouseClickId = UIEvents.addEventListener("mouseClick", (e) => this.mouseClickHandler(e));
    }

    setContext(ctx) {
        this._ctx = ctx;
    }

    setCanvas(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
    }

    setPosition(x, y) {
        this._pos = { x: x, y: y };
    }

    setSize(width, height) {
        this._width = width;
        this._height = height;
    }

    setName(name) {
        this._name = name;
    }

    getName() {
        return this._name;
    }

    getSize() {
        return { width: this._width, height: this._height };
    }

    getPosition() {
        return this._pos;
    }

    addEventListener(name, callback) {
        switch(name) {
            case "moveMagnet":
                this._moveMagnetHandlers.push(callback);
                break;
            default:
                break;
        }
    }

    removeEventListener(name, id) {
        switch(name) {
            case "moveMagnet":
                if (id >= this._moveMagnetHandlers.length) {
                    return false;
                }
                this._moveMagnetHandlers.splice(id, 1);
                return true;
            default:
                return false;
        }
    }

    moveBlockHandler(delta) {
        this._pos = { x: this._pos.x + delta.x, y: this._pos.y + delta.y };
        for (var i = 0; i < this._moveMagnetHandlers.length; i++) {
            this._moveMagnetHandlers[i](delta);
        }
    }

    mouseClickHandler(e) {
        var pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (this._type === "output" && pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height
            && !UIEvents.getState('currentLink')) {
            var link = new UIBlockLink();
            link.setCanvas(this._canvas);
            link.attachFrom(this._pos.x + this._width / 2, this._pos.y + this._height / 2, this);
            link.attachTo(pos.x, pos.y, null);
            this.addEventListener("moveMagnet", (delta) => link.eventUpdateFrom(delta));
            this._links.push(link);
            UIEvents.addState('currentLink', link);
            return true;
        } else if (this._type === "input" && pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height && UIEvents.getState('currentLink')) {
            var currentLink = UIEvents.getState('currentLink');
            currentLink.attachTo(this._pos.x + this._width / 2, this._pos.y + this._height / 2, this);
            this.addEventListener("moveMagnet", (delta) => currentLink.eventUpdateTo(delta));
            UIEvents.removeState('currentLink');
            return true;
        }
        return false;
    }

    draw() {
        this._ctx.fillStyle = this._type === "output" ? UIStyles.UIBlockMagnetOutputFillColor : UIStyles.UIBlockMagnetInputFillColor;
        this._ctx.strokeStyle = this._type === "output" ? UIStyles.UIBlockMagnetOutputStrokeColor : UIStyles.UIBlockMagnetInputStrokeColor;
        UIGraphics.drawRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width, this._height, this._radius, true, true);
        for (var i = 0; i < this._links.length; i++) {
            this._links[i].draw();
        }
    }

}