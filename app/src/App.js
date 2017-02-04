import React, { Component } from 'react';
import '../node_modules/normalize.css/normalize.css';
import '../node_modules/@blueprintjs/core/dist/blueprint.css';

var NavBar = require('./components/NavBar');

class App extends Component {
  render() {
      return (
          <NavBar/>
      );
  }
}

export default App;
