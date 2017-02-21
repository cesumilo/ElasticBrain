/**
 * Created by Cesumilo on 21/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

let UIEvents = require('./UIEvents');

export class UIDrawable {

    constructor(type) {
        this._type = type;
        this._pos = { x: 0, y: 0 };
        this._ctx = null;
        this._canvas = null;
        this._handlers = {};
        this._listeners = {};
        this._width = 0;
        this._height = 0;

        this.initEventListeners();
    }

    initEventListeners() {}

    addEventListener(name, callback) {
        if (!this._handlers.hasOwnProperty(name)) {
            return -1;
        }
        this._handlers[name].push(callback);
        return this._handlers[name].length - 1;
    }

    removeEventListener(name, id) {
        if (!this._handlers.hasOwnProperty(name))
            return false;
        this._handlers[name].splice(id, 1);
        return true;
    }

    addHandlers(name, id) {
        this._listeners[name] = id;
    }

    removeHandlers() {
        for (let key in this._listeners) {
            UIEvents.removeEventListener(key, this._listeners[key]);
        }
    }

    setCanvas(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
    }

    setContext(ctx) {
        this._ctx = ctx;
    }

    setPosition(x, y) {
        this._pos = { x: x, y: y };
    }

    setSize(width, height) {
        this._width = width;
        this._height = height;
    }

    getPosition() {
        return this._pos;
    }

    getSize() {
        return { width: this._width, height: this._height };
    }

    update(delta) {}

    draw() {}
}