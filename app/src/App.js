import React, { Component } from 'react'
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router'

import Landing from './pages/Landing';
import VScripting from './pages/VScripting';
import './index.css';

class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={Landing} />
        <Route path='/vscripting' component={VScripting} />
	<Route path='*' component={NotFound} />
      </Router>
    )
  }
}

const NotFound = () => (
  <h1>404.. This page is not found!</h1>)

export default App
