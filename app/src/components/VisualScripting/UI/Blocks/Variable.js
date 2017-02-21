/**
 * Created by Cesumilo on 07/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React from 'react';
import { UIBlockMagnet } from './UIBlockMagnet';

var UIStyles = require('./../UIStyles');

export class Variable extends UIBlockMagnet {
    constructor(parent, name = UIStyles.UIBlockMagnetDefaultName, input = false, color=UIStyles.UIBlockMagnetInputFillColor) {
        super(parent, name, input, color);
    }
}