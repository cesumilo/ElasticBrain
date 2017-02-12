/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

var UIEvents = require('./UIEvents');

export class Blueprint {
    constructor() {
        this._blocks = [];
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

    }

    saveToFile(filename) {

    }

    draw() {
        for (var i = 0; i < this._blocks.length; i++) {
            this._blocks[i].draw();
        }
    }
}