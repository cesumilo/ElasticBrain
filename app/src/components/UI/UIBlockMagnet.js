/**
 * Created by Cesumilo on 07/02/2017.
 */
var UIGraphics = require('./UIGraphics');
var UIStyles = require('./UIStyles');

export class UIBlockMagnet {
    constructor(name = UIStyles.UIBlockMagnetDefaultName, input = false) {
        this._name = name;
        this._type = input === false ? "output" : "input";
        this._ctx = null;
        this._canvas = null;
        this._pos = { x: 0, y: 0 };
        this._width = UIStyles.UIBlockMagnetDefaultWidth;
        this._height = UIStyles.UIBlockMagnetDefaultHeight;
        this._radius = UIStyles.UIBlockMagnetDefaultRadius;
        this._isLinked = false;
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

    moveBlockHandler(delta) {
        this._pos = { x: this._pos.x + delta.x, y: this._pos.y + delta.y };
    }

    mouseClickHandler(e, nbClicks) {
        // TODO: create UIBlockLink
    }

    draw() {
        this._ctx.fillStyle = this._type === "output" ? UIStyles.UIBlockMagnetOutputFillColor : UIStyles.UIBlockMagnetInputFillColor;
        this._ctx.strokeStyle = this._type === "output" ? UIStyles.UIBlockMagnetOutputStrokeColor : UIStyles.UIBlockMagnetInputStrokeColor;
        UIGraphics.drawRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width, this._height, this._radius, true, true);
    }

}