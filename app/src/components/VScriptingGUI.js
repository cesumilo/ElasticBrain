import '../../public/css/VScriptingGUI.css';

var React = require('react');
var BlockLink = require('./BlockLink');

var VScriptingGUI = React.createClass({
    getInitialState: function() {
        return {
            canvas: null,
            ctx: null
        };
    },

    componentDidMount: function() {
        this.setState({
            canvas: document.getElementById('vscripting-gui')
        }, function() {
            this.state.canvas.setAttribute("width", document.body.clientWidth);
            this.state.canvas.setAttribute("height", document.body.clientHeight * 0.938);
            this.setState({
                ctx: this.state.canvas.getContext('2d')
            });
        });
    },

    createBlockLink: function() {
        this.state.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
        this.state.ctx.lineWidth = 2;
        this.state.ctx.strokeStyle = "#333";
        this.state.ctx.beginPath();
        this.state.ctx.moveTo(10, 45);
        this.state.ctx.bezierCurveTo(10, 25, 40, 45, 40, 25);
        this.state.ctx.stroke();
    },

    render: function() {
        return (
            <div id="gui">
                <canvas id="vscripting-gui"></canvas>
            </div>
        );
    }
});

module.exports = VScriptingGUI;