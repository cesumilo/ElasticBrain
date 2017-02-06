/**
 * Created by Cesumilo on 06/02/2017.
 */
var UIGraphics = require('./UIGraphics');

export class UIBlock {

    constructor() {
        this._ctx = null;
        this._canvas = null;
        this._pos = { x: 0, y: 0 };
        this._width = 10;
        this._height = 10;
        this._radius = 2;
        this._trackMouse = false;
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

    mouseClickHandler(e, nbClick) {
        var pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);
        this._trackMouse = (nbClick < 2 && pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
        && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height);
        return this._trackMouse;
    }

    update(e) {
        var pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);
        if (this._trackMouse) {
            this._pos = pos;
            return true;
        }
        return false;
    }

    draw() {
        this._ctx.fillStyle = "rgba(74, 94, 163, " + 0.5 + ")";
        this._ctx.strokeStyle = '#2E2C61';
        UIGraphics.drawRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width, this._height, this._radius, true, true);
    }
}