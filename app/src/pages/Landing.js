/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import { NavBar } from '../components/NavBar.js';

import '../../node_modules/normalize.css/normalize.css';

class Landing extends Component {
  render() {
      return (
          <div id="app">
              <NavBar/>
              <h1>Bonsoir !</h1>
          </div>
      );
  }
}

export default Landing
