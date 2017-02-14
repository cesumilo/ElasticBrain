/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { Input } from './Blocks/Essentials/Input';
import { Output } from './Blocks/Essentials/Output';

var UIEvents = require('./UIEvents');

export class Blueprint {
    constructor(name, inputs=[], outputs=["output"]) {
        this._blocks = [];
        this._name = name;
        this._outputs = outputs;
        this._inputs = inputs;

        if (this._inputs.length > 0) {
            this.addBlock(new Input("Blueprint Inputs", {
                outputs: this._inputs
            }));
        }

        this.addBlock(new Output("Blueprint Outputs", {
            inputs: this._outputs
        }));
    }

    getName() {
        return this._name;
    }

    getOptions() {
        return {
            inputs: this._inputs,
            outputs: this._outputs
        };
    }

    addBlock(block) {
        if (typeof block.draw !== "function") {
            return -1;
        }
        block.setCanvas(UIEvents.getVisualScriptingUI().getCanvas());
        block.generateMagnets();
        this._blocks.push(block);
        return this._blocks.length - 1;
    }

    loadFromFile(filename) {
        // TODO
    }

    saveToFile(filename) {
        // TODO
    }

    draw() {
        for (var i = 0; i < this._blocks.length; i++) {
            this._blocks[i].draw();
        }
    }
}