/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlockMagnet } from './UIBlockMagnet';
import { UIBlockFlow } from './UIBlockFlow';

var UIGraphics = require('./../UIGraphics');
var UIStyles = require('./../UIStyles');
var UIEvents = require('./../UIEvents');

export class UIBlock {

    constructor(name, magnetColor, flowColor, options = {}, textColor="#000000") {
        this._type = "default";
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
        this._uiBlockColor = UIStyles.UIBlockFillColor;
        this._uiBlockHeaderColor = UIStyles.UIBlockHeaderColor;
        this._magnetColor = magnetColor;
        this._flowColor = flowColor;
        this._textColor = textColor;

        this._mouseBeginClickAndDropId = UIEvents.addEventListener("mouseBeginClickAndDrop", (e) => this.mouseBeginClickAndDropHandler(e));
        this._mouseEndClickAndDropId = UIEvents.addEventListener("mouseEndClickAndDrop", (e) => this.mouseEndClickAndDropHandler(e));
        this._mouseMoveId = UIEvents.addEventListener("mouseMove", (e) => this.update(e));

        this.generateVariables(options);
    }

    generateVariables(options) {
        this._inputs = [];
        this._outputs = [];
        this._moveBlockHandlers = [];

        for (let i = 0; i < this._drawables.length; i++) {
            this._drawables[i].deleteHandlers();
        }
        this._drawables = [];

        if (options.hasOwnProperty("inputs")) {
            for (var i = 0; i < options['inputs'].length; i++) {
                !function(ref, length) {
                    var input = new UIBlockMagnet(ref, options['inputs'][i], true, ref._magnetColor);
                    ref._drawables.push(input);
                    ref._inputs.push({ index: length, obj: ref._drawables[length - 1], name: options['inputs'][i] });
                    ref._drawables[length - 1].setPosition(ref._pos.x - UIStyles.UIBlockMagnetDefaultWidth + (UIStyles.UIBlockMagnetDefaultWidth / 2),
                        (UIStyles.UIBlockDefaultHeaderHeight + UIStyles.UIBlockDefaultUIBlockLinkOffset) + ref._pos.y
                        + (i * (UIStyles.UIBlockDefaultUIBlockLinkOffset + UIStyles.UIBlockMagnetDefaultHeight)));
                    ref.addEventListener("blockMove", (delta) => ref._drawables[length - 1].moveBlockHandler(delta));
                }(this, this._drawables.length + 1);
            }
        }

        if (options.hasOwnProperty("outputs")) {
            for (var j = 0; j < options['outputs'].length; j++) {
                !function (ref, length) {
                    var output = new UIBlockMagnet(ref, options['outputs'][j], false, ref._magnetColor);
                    ref._drawables.push(output);
                    ref._outputs.push({ index: length, obj: output, name: options['outputs'][j] });
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

    generateFlowMagnets(input=true, output=true) {
        if (input) {
            let inputFlow = new UIBlockFlow(this, "", true, this._flowColor);
            inputFlow.setPosition(this._pos.x - inputFlow.getSize().width + (UIStyles.UIBlockMagnetDefaultWidth / 2),
                this._pos.y + ((UIStyles.UIBlockDefaultHeaderHeight - inputFlow.getSize().height) / 2));
            inputFlow.setCanvas(UIEvents.getVisualScriptingUI().getCanvas());
            this._drawables.push(inputFlow);
            this.addEventListener("blockMove", (delta) => inputFlow.moveBlockHandler(delta));
        }

        if (output) {
            let outputFlow = new UIBlockFlow(this, "", false, this._flowColor);
            outputFlow.setPosition(this._pos.x + this._width - (UIStyles.UIBlockMagnetDefaultWidth / 2),
                this._pos.y + ((UIStyles.UIBlockDefaultHeaderHeight - outputFlow.getSize().height) / 2));
            outputFlow.setCanvas(UIEvents.getVisualScriptingUI().getCanvas());
            this._drawables.push(outputFlow);
            this.addEventListener("blockMove", (delta) => outputFlow.moveBlockHandler(delta));
        }
    }

    addEventListener(name, callback) {
        switch(name) {
            case "blockMove":
                this._moveBlockHandlers.push(callback);
                return this._moveBlockHandlers.length - 1;
            default:
                return -1;
        }
    }

    removeEventListener(name, id) {
        switch(name) {
            case "blockMove":
                if (id >= this._moveBlockHandlers.length) {
                    return false;
                }
                this._moveBlockHandlers.splice(id, 1);
                return true;
            default:
                return false;
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
            this._outputs[t].obj.setPosition(this._pos.x + this._width - (UIStyles.UIBlockMagnetDefaultWidth / 2), this._outputs[t].obj.getPosition().y);
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
        this._ctx.fillStyle = this._uiBlockColor;
        this._ctx.shadowBlur = UIStyles.UIBlockShadowBlur;
        this._ctx.shadowColor = UIStyles.UIBlockShadowColor;
        UIGraphics.drawRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width, this._height, 8, true, false);
        this._ctx.shadowBlur = 0;

        this._ctx.fillStyle = this._uiBlockHeaderColor;
        UIGraphics.drawUpperRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width, UIStyles.UIBlockDefaultHeaderHeight, 8, true, false);

        this._ctx.fillStyle = this._textColor;
        for (var i = 0; i < this._inputs.length; i++) {
            this._ctx.font = UIStyles.UIBlockDefaultFont;
            this._ctx.fillText(this._inputs[i].obj.getName(), this._pos.x + UIStyles.UIBlockDefaultTextOffset,
                this._inputs[i].obj.getPosition().y
                + (UIGraphics.getTextHeight(this._inputs[i].obj.getName(), UIStyles.UIBlockDefaultFont).height / 1.7));
        }

        for (var j = 0; j < this._outputs.length; j++) {
            this._ctx.font = UIStyles.UIBlockDefaultFont;
            this._ctx.fillText(this._outputs[j].obj.getName(),
                this._outputs[j].obj.getPosition().x - UIStyles.UIBlockDefaultTextOffset - this._ctx.measureText(this._outputs[j].obj.getName()).width,
                this._outputs[j].obj.getPosition().y
                + (UIGraphics.getTextHeight(this._outputs[j].obj.getName(), UIStyles.UIBlockDefaultFont).height / 1.7));
        }

        var textHeight = UIGraphics.getTextHeight(this._name, UIStyles.UIBlockDefaultFont).height;
        this._ctx.font = UIStyles.UIBlockDefaultFont;
        this._ctx.fillText(this._name, this._pos.x
            + ((this._width - this._ctx.measureText(this._name).width) / 2),
            this._pos.y + (textHeight + ((UIStyles.UIBlockDefaultHeaderHeight - textHeight) / 2.8)));

        for (var n = 0; n < this._drawables.length; n++) {
            this._drawables[n].draw();
        }
    }
}