/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlock } from '../UIBlock';

export class Input extends UIBlock {
    constructor(name, options={}) {
        if (options.hasOwnProperty('inputs')) {
            delete options['inputs'];
        }
        super(name, options);
        this._type = "input";
    }
}