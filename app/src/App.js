import React, { Component } from 'react';
import { NavBar } from './components/NavBar.js';
import { VScriptingGUI } from './components/VScriptingGUI.js';

import '../node_modules/normalize.css/normalize.css';
import '../node_modules/@blueprintjs/core/dist/blueprint.css';

//var VScriptingGUI = require('./components/VScriptingGUI');

class App extends Component {
  render() {
      return (
          <div id="app">
              <NavBar/>
              <VScriptingGUI/>
          </div>
      );
  }
}

export default App;
