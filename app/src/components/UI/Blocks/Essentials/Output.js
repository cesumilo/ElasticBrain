/**
 * Created by Cesumilo on 12/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIBlock } from '../UIBlock';

export class Output extends UIBlock {
    constructor(name, options={}) {
        if (options.hasOwnProperty('outputs')) {
            delete options['outputs'];
        }
        super(name, options);
        this._type = "output";
    }
}