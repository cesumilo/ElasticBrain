/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { Variable } from './Variable';
import { Flow } from './Flow';
import { UIDrawable } from '../UIDrawable';

let UIGraphics = require('./../UIGraphics');
let UIStyles = require('./../UIStyles');
let UIEvents = require('./../UIEvents');

export class UIBlock extends UIDrawable {

    constructor(name, magnetColor, flowColor, options = {}, textColor=UIStyles.UIBlockDefaultTextColor) {
        super("default");

        this._name = name;

        this._trackMouse = false;
        this._drawables = [];
        this._inputs = [];
        this._outputs = [];

        this._uiBlockColor = UIStyles.UIBlockFillColor;
        this._uiBlockHeaderColor = UIStyles.UIBlockHeaderColor;
        this._magnetColor = magnetColor;
        this._flowColor = flowColor;
        this._textColor = textColor;

        this.addHandlers(UIEvents.events.BEGIN_CLICK_AND_DROP,
            UIEvents.addEventListener(UIEvents.events.BEGIN_CLICK_AND_DROP, (e) => this.mouseBeginClickAndDropHandler(e)));
        this.addHandlers(UIEvents.events.END_CLICK_AND_DROP,
            UIEvents.addEventListener(UIEvents.events.END_CLICK_AND_DROP, (e) => this.mouseEndClickAndDropHandler(e)));
        this.addHandlers(UIEvents.events.MOUSE_MOVE,
            UIEvents.addEventListener(UIEvents.events.MOUSE_MOVE, (e) => this.update(e)));

        this.generateVariables(options);
    }

    initEventListeners() {
        this._handlers[UIEvents.events.MOVE_BLOCK] = [];
    }

    generateVariables(options) {
        this._inputs = [];
        this._outputs = [];
        this._handlers[UIEvents.events.MOVE_BLOCK] = [];

        for (let i = 0; i < this._drawables.length; i++) {
            this._drawables[i].removeHandlers();
        }
        this._drawables = [];

        if (options.hasOwnProperty('inputs')) {
            for (let i = 0; i < options['inputs'].length; i++) {
                !function(ref, length) {
                    let input = new Variable(ref, options['inputs'][i], true, ref._magnetColor);
                    ref._drawables.push(input);
                    ref._inputs.push({ index: length, obj: ref._drawables[length - 1], name: options['inputs'][i] });
                    ref._drawables[length - 1].setPosition(ref._pos.x - UIStyles.UIBlockMagnetDefaultWidth + (UIStyles.UIBlockMagnetDefaultWidth / 2),
                        (UIStyles.UIBlockDefaultHeaderHeight + UIStyles.UIBlockDefaultUIBlockLinkOffset) + ref._pos.y
                        + (i * (UIStyles.UIBlockDefaultUIBlockLinkOffset + UIStyles.UIBlockMagnetDefaultHeight)));
                    ref.addEventListener(UIEvents.events.MOVE_BLOCK, (delta) => ref._drawables[length - 1].update(delta));
                }(this, this._drawables.length + 1);
            }
        }

        if (options.hasOwnProperty('outputs')) {
            for (let j = 0; j < options['outputs'].length; j++) {
                !function (ref, length) {
                    let output = new Variable(ref, options['outputs'][j], false, ref._magnetColor);
                    ref._drawables.push(output);
                    ref._outputs.push({ index: length, obj: output, name: options['outputs'][j] });
                    ref._drawables[length - 1].setPosition(ref._pos.x + ref._width + 1,
                        (UIStyles.UIBlockDefaultHeaderHeight + UIStyles.UIBlockDefaultUIBlockLinkOffset) + ref._pos.y
                        + (j * (UIStyles.UIBlockDefaultUIBlockLinkOffset + UIStyles.UIBlockMagnetDefaultHeight)));
                    ref.addEventListener(UIEvents.events.MOVE_BLOCK, (delta) => ref._drawables[length - 1].update(delta));
                }(this, this._drawables.length + 1);
            }
        }

        const nbElements = (this._inputs.length > this._outputs.length ? this._inputs.length : this._outputs.length);
        this._height = (UIStyles.UIBlockDefaultHeaderHeight + UIStyles.UIBlockDefaultUIBlockLinkOffset)
            + ((UIStyles.UIBlockDefaultUIBlockLinkOffset * nbElements)
            + (UIStyles.UIBlockMagnetDefaultHeight * (nbElements + 1)));
    }

    generateFlowMagnets(input=true, output=true) {
        if (input) {
            let inputFlow = new Flow(this, "", true, this._flowColor);
            inputFlow.setPosition(this._pos.x - inputFlow.getSize().width + (UIStyles.UIBlockMagnetDefaultWidth / 2),
                this._pos.y + ((UIStyles.UIBlockDefaultHeaderHeight - inputFlow.getSize().height) / 2));
            inputFlow.setCanvas(UIEvents.getVisualScriptingUI().getCanvas());
            this._drawables.push(inputFlow);
            this.addEventListener(UIEvents.events.MOVE_BLOCK, (delta) => inputFlow.update(delta));
        }

        if (output) {
            let outputFlow = new Flow(this, "", false, this._flowColor);
            outputFlow.setPosition(this._pos.x + this._width - (UIStyles.UIBlockMagnetDefaultWidth / 2),
                this._pos.y + ((UIStyles.UIBlockDefaultHeaderHeight - outputFlow.getSize().height) / 2));
            outputFlow.setCanvas(UIEvents.getVisualScriptingUI().getCanvas());
            this._drawables.push(outputFlow);
            this.addEventListener(UIEvents.events.MOVE_BLOCK, (delta) => outputFlow.update(delta));
        }
    }

    generateMagnets() {
        this._ctx.font = UIStyles.UIBlockDefaultFont;
        const titleWidth = this._ctx.measureText(this._name).width + (UIStyles.UIBlockDefaultTextOffset * 2);
        const length = (this._inputs.length > this._outputs.length ? this._outputs.length : this._inputs.length);
        let maxVariablesWidth = 0;

        for (let j = 0; j < length; j++) {
            const inputWidth = this._ctx.measureText(this._inputs[j].obj.getName()).width;
            const outputWidth = this._ctx.measureText(this._outputs[j].obj.getName()).width;
            const totalWidth = (UIStyles.UIBlockDefaultTextOffset * 2) + UIStyles.UIBlockDefaultCorpusOffset
                + inputWidth + outputWidth;
            if (totalWidth > maxVariablesWidth) {
                maxVariablesWidth = totalWidth;
            }
        }
        this._width = (maxVariablesWidth > titleWidth ? maxVariablesWidth : titleWidth);

        for(let t = 0; t < this._outputs.length; t++) {
            this._outputs[t].obj.setPosition(this._pos.x + this._width - (UIStyles.UIBlockMagnetDefaultWidth / 2), this._outputs[t].obj.getPosition().y);
        }

        for (let i = 0; i < this._drawables.length; i++) {
            this._drawables[i].setCanvas(this._canvas);
        }
    }

    mouseBeginClickAndDropHandler(e) {
        const pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);
        this._trackMouse = (pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height);
        return this._trackMouse;
    }

    mouseEndClickAndDropHandler(e) {
        this._trackMouse = false;
    }

    update(delta) {
        if (this._trackMouse) {
            for (let m = 0; m < this._handlers[UIEvents.events.MOVE_BLOCK].length; m++) {
                this._handlers[UIEvents.events.MOVE_BLOCK][m](delta);
            }
            this._pos = { x: this._pos.x + delta.x, y: this._pos.y + delta.y };
        }
        return this._trackMouse;
    }

    draw() {
        this._ctx.fillStyle = this._uiBlockColor;
        this._ctx.shadowBlur = UIStyles.UIBlockShadowBlur;
        this._ctx.shadowColor = UIStyles.UIBlockShadowColor;
        UIGraphics.drawRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width, this._height, 8, true, false);
        this._ctx.shadowBlur = 0;

        this._ctx.fillStyle = this._uiBlockHeaderColor;
        UIGraphics.drawUpperRoundedRect(this._ctx, this._pos.x, this._pos.y, this._width,
            UIStyles.UIBlockDefaultHeaderHeight, UIStyles.UIBlockDefaultRadius, true, false);

        this._ctx.fillStyle = this._textColor;
        for (let i = 0; i < this._inputs.length; i++) {
            this._ctx.font = UIStyles.UIBlockDefaultFont;
            this._ctx.fillText(this._inputs[i].obj.getName(), this._pos.x + UIStyles.UIBlockDefaultTextOffset,
                this._inputs[i].obj.getPosition().y
                + (UIGraphics.getTextHeight(this._inputs[i].obj.getName(), UIStyles.UIBlockDefaultFont).height / 1.7));
        }

        for (let j = 0; j < this._outputs.length; j++) {
            this._ctx.font = UIStyles.UIBlockDefaultFont;
            this._ctx.fillText(this._outputs[j].obj.getName(),
                this._outputs[j].obj.getPosition().x - UIStyles.UIBlockDefaultTextOffset
                - this._ctx.measureText(this._outputs[j].obj.getName()).width,
                this._outputs[j].obj.getPosition().y
                + (UIGraphics.getTextHeight(this._outputs[j].obj.getName(), UIStyles.UIBlockDefaultFont).height / 1.7));
        }

        const textHeight = UIGraphics.getTextHeight(this._name, UIStyles.UIBlockDefaultFont).height;
        this._ctx.font = UIStyles.UIBlockDefaultFont;
        this._ctx.fillText(this._name, this._pos.x
            + ((this._width - this._ctx.measureText(this._name).width) / 2),
            this._pos.y + (textHeight + ((UIStyles.UIBlockDefaultHeaderHeight - textHeight) / 2.8)));

        for (let n = 0; n < this._drawables.length; n++) {
            this._drawables[n].draw();
        }
    }
}