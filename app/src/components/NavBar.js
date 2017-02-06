import React, { Component } from 'react';

export class NavBar extends Component {

    render() {
        return (
            <nav className="pt-navbar pt-dark .modifier">
                <div className="pt-navbar-group pt-align-left">
                    <div className="pt-navbar-heading">ElasticBrain</div>
                </div>
                <div className="pt-navbar-group pt-align-right">
                    <span className="pt-navbar-divider"></span>
                    <button className="pt-button pt-minimal pt-icon-user"></button>
                    <button className="pt-button pt-minimal pt-icon-notifications"></button>
                    <button className="pt-button pt-minimal pt-icon-cog"></button>
                </div>
            </nav>
        );
    }
}