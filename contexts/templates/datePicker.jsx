var React = require('react');

var DatePicker = React.createClass({
    render: function() {
        return (
            <div>
                <input type="text" id="date-picker" />
                <div id="date-picker-json"></div>
            </div>
        );
    }
});
module.exports = DatePicker;


