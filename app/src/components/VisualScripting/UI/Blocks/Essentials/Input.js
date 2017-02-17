/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React from 'react';
import { UIBlock } from '../UIBlock';
import { InputContextMenu } from './InputContextMenu';
import { InputEditDialog } from './InputEditDialog';

var UIEvents = require('../../UIEvents');
var UIGraphics = require('../../UIGraphics');

export class Input extends UIBlock {
    constructor(name, options={}) {
        if (options.hasOwnProperty('inputs')) {
            delete options['inputs'];
        }
        super(name, options);
        this._type = "input";
        UIEvents.addEventListener('contextMenuMode', (e) => this.contextMenuModeHandler(e));
    }

    handleEditCloseMenu() {
        UIEvents.getState('extraContents').splice(this._extraContentIndex, 1);
        delete this._extraContentIndex;
    }

    saveChanges(options) {
        this.generateVariables(options);
        this.generateMagnets();
    }

    onEditContextMenu() {
        UIEvents.getState('extraContents').push(<InputEditDialog onClose={() => this.handleEditCloseMenu()} save={(options) => this.saveChanges(options)} inputs={this._outputs.map(function(output) {
            return output.name;
        })}/>);
        this._extraContentIndex = UIEvents.getState('extraContents').length - 1;
    }

    contextMenuModeHandler(e) {
        var pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height) {
            UIEvents.addState('custom-context-menu', <InputContextMenu onClick={() => this.onEditContextMenu()}/>);
            return true;
        }
        return false;
    }
}