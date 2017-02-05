var React = require('react');

var BlockLink = React.createClass({

    render: function() {
        return <button onClick={this.props.onClick}>Create Link</button>;
    }
});

module.exports = BlockLink;