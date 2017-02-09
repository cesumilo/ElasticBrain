/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlockMagnet } from './UIBlockMagnet';

var UIGraphics = require('./UIGraphics');
var UIStyles = require('./UIStyles');

export class UIBlock {

    constructor(name, options = {}) {
        this._ctx = null;
        this._canvas = null;
        this._pos = { x: 100, y: 100 };
        this._width = UIStyles.UIBlockDefaultWidth;
        this._height = UIStyles.UIBlockDefaultHeight;
        this._radius = UIStyles.UIBlockDefaultRadius;
        this._trackMouse = false;
        this._moveBlockHandlers = [];
        this._drawables = [];
        this._inputs = [];
        this._outputs = [];
        this._name = name;

        if (options.hasOwnProperty("inputs")) {
            for (var i = 0; i < options['inputs'].length; i++) {
                !function(ref, length) {
                    var input = new UIBlockMagnet(ref, options['inputs'][i].name, true);
                    ref._drawables.push(input);
                    ref._inputs.push({ index: length, obj: ref._drawables[length - 1] });
                    ref._drawables[length - 1].setPosition(ref._pos.x - UIStyles.UIBlockMagnetDefaultWidth - 1,
                        (UIStyles.UIBlockDefaultHeaderHeight + UIStyles.UIBlockDefaultUIBlockLinkOffset) + ref._pos.y
                        + (i * (UIStyles.UIBlockDefaultUIBlockLinkOffset + UIStyles.UIBlockMagnetDefaultHeight)));
                    ref.addEventListener("blockMove", (delta) => ref._drawables[length - 1].moveBlockHandler(delta));
                }(this, this._drawables.length + 1);
            }
        }

        if (options.hasOwnProperty("outputs")) {
            for (var j = 0; j < options['outputs'].length; j++) {
                !function (ref, length) {
                    var output = new UIBlockMagnet(ref, options['outputs'][j].name);
                    ref._drawables.push(output);
                    ref._outputs.push({ index: length, obj: output });
                    ref._drawables[length - 1].setPosition(ref._pos.x + ref._width + 1,
                        (UIStyles.UIBlockDefaultHeaderHeight + UIStyles.UIBlockDefaultUIBlockLinkOffset) + ref._pos.y
                        + (j * (UIStyles.UIBlockDefaultUIBlockLinkOffset + UIStyles.UIBlockMagnetDefaultHeight)));
                    ref.addEventListener("blockMove", (delta) => ref._drawables[length - 1].moveBlockHandler(delta));
                }(this, this._drawables.length + 1);
            }
        }

        var nbElements = (this._inputs.length > this._outputs.length ? this._inputs.length : this._outputs.length);
        this._height = (UIStyles.UIBlockDefaultHeaderHeight + UIStyles.UIBlockDefaultUIBlockLinkOffset)
            + ((UIStyles.UIBlockDefaultUIBlockLinkOffset * nbElements)
            + (UIStyles.UIBlockMagnetDefaultHeight * (nbElements + 1)));
    }

    addEventListener(name, callback) {
        switch(name) {
            case "blockMove":
                this._moveBlockHandlers.push(callback);
                break;
            default:
                break;
        }
    }

    generateMagnets() {
        this._ctx.font = UIStyles.UIBlockDefaultFont;
        var titleWidth = this._ctx.measureText(this._name).width + (UIStyles.UIBlockDefaultTextOffset * 2);
        var maxVariablesWidth = 0;
        var length = (this._inputs.length > this._outputs.length ? this._outputs.length : this._inputs.length);

        for (var j = 0; j < length; j++) {
            var inputWidth = this._ctx.measureText(this._inputs[j].obj.getName()).width;
            var outputWidth = this._ctx.measureText(this._outputs[j].obj.getName()).width;
            var totalWidth = (UIStyles.UIBlockDefaultTextOffset * 2) + UIStyles.UIBlockDefaultCorpusOffset
                + inputWidth + outputWidth;
            if (totalWidth > maxVariablesWidth) {
                maxVariablesWidth = totalWidth;
            }
        }
        this._width = (maxVariablesWidth > titleWidth ? maxVariablesWidth : titleWidth);

        for(var t = 0; t < this._outputs.length; t++) {
            this._outputs[t].obj.setPosition(this._pos.x + this._width + 1, this._outputs[t].obj.getPosition().y);
        }

        for (var i = 0; i < this._drawables.length; i++) {
            this._drawables[i].setCanvas(this._canvas);
        }
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

    mouseBeginClickAndDropHandler(e) {
        var pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);
        this._trackMouse = (pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height);
        return this._trackMouse;
    }

    mouseEndClickAndDropHandler(e) {
        this._trackMouse = false;
    }

    update(delta) {
        if (this._trackMouse) {
            for (var m = 0; m < this._moveBlockHandlers.length; m++) {
                this._moveBlockHandlers[m](delta);
            }
            this._pos = { x: this._pos.x + delta.x, y: this._pos.y + delta.y };
            return true;
        }
        return false;
    }

    draw() {
        this._ctx.fillStyle = UIStyles.UIBlockFillColor;
        this._ctx.strokeStyle = UIStyles.UIBlockStrokeColor;
        UIGraphics.drawRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width, this._height, this._radius, true, true);

        this._ctx.strokeStyle = UIStyles.UIBlockStrokeColor;
        UIGraphics.drawLine(this._ctx, this._pos.x, this._pos.y + UIStyles.UIBlockDefaultHeaderHeight,
            this._pos.x + this._width, this._pos.y + UIStyles.UIBlockDefaultHeaderHeight);


        this._ctx.fillStyle = UIStyles.UIBlockTextColor;
        for (var i = 0; i < this._inputs.length; i++) {
            this._ctx.fillText(this._inputs[i].obj.getName(), this._pos.x + UIStyles.UIBlockDefaultTextOffset,
                this._inputs[i].obj.getPosition().y
                + (UIGraphics.getTextHeight(this._inputs[i].obj.getName(), UIStyles.UIBlockDefaultFont).height / 1.7));
        }

        for (var j = 0; j < this._outputs.length; j++) {
            this._ctx.fillText(this._outputs[j].obj.getName(),
                this._outputs[j].obj.getPosition().x - UIStyles.UIBlockDefaultTextOffset - this._ctx.measureText(this._outputs[j].obj.getName()).width,
                this._outputs[j].obj.getPosition().y
                + (UIGraphics.getTextHeight(this._outputs[j].obj.getName(), UIStyles.UIBlockDefaultFont).height / 1.7));
        }

        var textHeight = UIGraphics.getTextHeight(this._name, UIStyles.UIBlockDefaultFont).height;
        this._ctx.fillText(this._name, this._pos.x
            + ((this._width - this._ctx.measureText(this._name).width) / 2),
            this._pos.y + (textHeight + ((UIStyles.UIBlockDefaultHeaderHeight - textHeight) / 2.8)));

        for (var n = 0; n < this._drawables.length; n++) {
            this._drawables[n].draw();
        }
    }
}