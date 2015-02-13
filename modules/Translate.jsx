var React = require('react');
var translate = require('./tools/translate.jsx');

/* TODO finish it */

//TODO listen to language change

var Translate = React.createClass({
  render: function() {
    var original = this.props.children;
    var key = this.props.tKey;
    var values = this.props.values;
    return (
      <span>
        { translate(key,values,original) }
      </span>
    );
  }
});

module.exports = Translate;
