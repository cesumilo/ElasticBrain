import React, { Component } from 'react';
import '../node_modules/normalize.css/normalize.css';
import '../node_modules/@blueprintjs/core/dist/blueprint.css';

var NavBar = require('./components/NavBar');
var VScriptingGUI = require('./components/VScriptingGUI');

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
