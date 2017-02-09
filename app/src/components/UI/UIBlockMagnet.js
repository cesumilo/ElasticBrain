/**
 * Created by Cesumilo on 07/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlockLink } from './UIBlockLink';

var UIGraphics = require('./UIGraphics');
var UIStyles = require('./UIStyles');

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

    moveBlockHandler(delta) {
        this._pos = { x: this._pos.x + delta.x, y: this._pos.y + delta.y };
        for (var i = 0; i < this._moveMagnetHandlers.length; i++) {
            this._moveMagnetHandlers[i](delta);
        }
    }

    mouseClickHandler(e) {
        if (this._type === "output") {
            var link = new UIBlockLink();
            link.setCanvas(this._canvas);
            link.attachFrom(this._pos.x, this._pos.y, this);
            link.addEventListener("moveMagnet", (delta) => link.eventUpdateFrom(delta));
            this._links.push(link);
        }
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