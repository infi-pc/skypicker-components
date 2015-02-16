var React = require('react');

var ToggleActive = React.createClass({
  render: function() {
    var faIconClass = "fa fa-caret-down";
    if (this.props.active) {
      faIconClass = "fa fa-caret-up"
    }
    return (
      <b className="toggle" onClick={this.props.onToggle}>
        <i className={faIconClass}></i>
      </b>
    );
  }
});
module.exports = ToggleActive;
