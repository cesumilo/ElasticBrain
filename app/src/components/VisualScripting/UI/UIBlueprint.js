/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlock } from './Blocks/UIBlock';

let UIEvents = require('./UIEvents');

export class UIBlueprint extends UIBlock {
    constructor(blueprint) {
        super(blueprint.getName(), blueprint.getOptions());
        this.setCanvas(UIEvents.getVisualScriptingUI().getCanvas());
        this.generateMagnets();
    }
}