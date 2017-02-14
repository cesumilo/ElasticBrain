/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlock } from '../UIBlock';
import { InputContextMenu } from './InputContextMenu';

var UIEvents = require('../../UIEvents');
var UIGraphics = require('../../UIGraphics');

export class Input extends UIBlock {
    constructor(name, options={}) {
        if (options.hasOwnProperty('inputs')) {
            delete options['inputs'];
        }
        super(name, options);
        this._type = "input";
    }

    contextMenuModeHandler(e) {
        var pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height) {
            UIEvents.addState('custom-context-menu', <InputContextMenu/>);
            return true;
        }
        return false;
    }
}