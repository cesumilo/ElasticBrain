/**
 * Created by Cesumilo on 04/02/2017.
 */
var React = require('react');

module.exports = function render() {
    return (
        <nav className="pt-navbar .modifier">
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
};