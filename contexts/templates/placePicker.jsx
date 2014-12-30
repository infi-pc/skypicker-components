var React = require('react');

var PlacePicker = React.createClass({
    render: function() {
        return (
            <div>
                <input type="text" id="place-picker" />
                <div id="place-picker-json"></div>
            </div>
        );
    }
});
module.exports = PlacePicker;


