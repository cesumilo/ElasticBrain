/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import { NavBar } from '../components/NavBar.js';
import { UIVisualScripting } from '../components/VisualScripting/UI/UIVisualScripting.js';

import '../../node_modules/normalize.css/normalize.css';
import '../../node_modules/@blueprintjs/core/dist/blueprint.css';

class VScripting extends Component {
  render() {
      return (
          <div id="app">
              <NavBar/>
              <UIVisualScripting/>
          </div>
      );
  }
}

export default VScripting
