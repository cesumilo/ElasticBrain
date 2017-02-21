/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import React, { Component } from 'react';
import { Link } from 'react-router';

export class NavBar extends Component {
    render() {
        return (
            <nav className="pt-navbar pt-dark" style={{backgroundColor: "#01579B"}}>
                <div className="pt-navbar-group pt-align-left">
                    <Link to="/" className="pt-navbar-heading">ElasticBrain</Link>
                </div>
                <div className="pt-navbar-group pt-align-right">
                    <span className="pt-navbar-divider"></span>
                    <button className="pt-button pt-minimal pt-icon-user"></button>
                    <button className="pt-button pt-minimal pt-icon-notifications"></button>
                    <button className="pt-button pt-minimal pt-icon-cog"></button>
                </div>
		<div className="pt-navbar-group pt-align-right">
		  <Link to="/" className="pt-button pt-minimal pt-icon-home">Home</Link>
		  <Link to="/vscripting" className="pt-button pt-minimal pt-icon-build">Visual Scripting</Link>
		</div>
            </nav>
        );
    }
}
