/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React from 'react';
import { UIBlock } from '../UIBlock';
import { EditContextMenu } from './EditContextMenu';
import { EditVariablesDialog } from './EditVariablesDialog';

var UIEvents = require('../../UIEvents');
var UIGraphics = require('../../UIGraphics');
var UIStyles = require('../../UIStyles');

export class BlueprintBlock extends UIBlock {
    constructor(name, type, property, menuTitle, data, options={}) {
        if (options.hasOwnProperty(property)) {
            delete options[property];
        }
        super(name, UIStyles.BlueprintBlockMagnetColor, UIStyles.BlueprintBlockFlowColor, options, "#FFFFFF");

        this._type = type;
        this._title = menuTitle;
        this._dataName = data;
        this._uiBlockColor = UIStyles.BlueprintBlockColor;
        this._uiBlockHeaderColor = UIStyles.BlueprintBlockHeaderColor;
        this._generatedFlowMagnets = options['flowBooleans'];

        this.addHandlers(UIEvents.events.CONTEXT_MENU_MODE,
            UIEvents.addEventListener(UIEvents.events.CONTEXT_MENU_MODE, (e) => this.contextMenuModeHandler(e)));
    }

    handleEditCloseMenu() {
        UIEvents.getState(UIEvents.states.EXTRA_CONTENTS).splice(this._extraContentIndex, 1);
        delete this._extraContentIndex;
    }

    saveChanges(options) {
        this.generateVariables(options);
        this.generateMagnets();
        this.generateFlowMagnets(this._generatedFlowMagnets[0], this._generatedFlowMagnets[1]);
        UIEvents.removeEventListener(UIEvents.events.CONTEXT_MENU_MODE, this._listeners[UIEvents.events.CONTEXT_MENU_MODE]);
        delete this._listeners[UIEvents.events.CONTEXT_MENU_MODE];
        this.addHandlers(UIEvents.events.CONTEXT_MENU_MODE,
            UIEvents.addEventListener(UIEvents.events.CONTEXT_MENU_MODE, (e) => this.contextMenuModeHandler(e)));
    }

    onEditContextMenu() {
        UIEvents.getState(UIEvents.states.EXTRA_CONTENTS).push(<EditVariablesDialog onClose={() => this.handleEditCloseMenu()}
                                                                     save={(options) => this.saveChanges(options)}
                                                                     inputs={this['_' + this._dataName].map(function(output) {
                                                                         return output.name;
                                                                     })}
                                                                     title={this._title}
                                                                     data={this._dataName}
        />);
        this._extraContentIndex = UIEvents.getState(UIEvents.states.EXTRA_CONTENTS).length - 1;
    }

    contextMenuModeHandler(e) {
        const pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (pos.x >= this._pos.x && pos.x <= this._pos.x + this._width
            && pos.y >= this._pos.y && pos.y <= this._pos.y + this._height) {
            UIEvents.addState(UIEvents.states.CUSTOM_CONTEXT_MENU, <EditContextMenu onClick={() => this.onEditContextMenu()}/>);
            return true;
        }
        return false;
    }
}