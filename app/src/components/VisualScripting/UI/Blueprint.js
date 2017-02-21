/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { BlueprintBlock } from './Blocks/Essentials/BlueprintBlock';

var UIEvents = require('./UIEvents');

export class Blueprint {
    constructor(name, inputs=[], outputs=["output"]) {
        this._blocks = [];
        this._name = name;
        this._outputs = outputs;
        this._inputs = inputs;

        if (this._inputs.length > 0) {
            this.addBlock(new BlueprintBlock("Blueprint Inputs",
                "input", "inputs",
                "Blueprint Inputs Edit",
                "outputs", {
                outputs: this._inputs,
                flowBooleans: [ false, true ]
            }), false, true);
        }

        this.addBlock(new BlueprintBlock("Blueprint Outputs",
            "output", "outputs",
            "Blueprint Outputs Edit",
            "inputs", {
            inputs: this._outputs,
            flowBooleans: [ true, false ]
        }), true, false);
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

    addBlock(block, input=true, output=true) {
        if (typeof block.draw !== "function") {
            return -1;
        }
        block.setCanvas(UIEvents.getVisualScriptingUI().getCanvas());
        block.generateMagnets();
        block.generateFlowMagnets(input, output);
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
        for (let i = 0; i < this._blocks.length; i++) {
            this._blocks[i].draw();
        }
    }
}