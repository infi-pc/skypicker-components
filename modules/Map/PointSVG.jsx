var PureRenderMixin = require('react').addons.PureRenderMixin;

var Point = React.createClass({

  mixins: [PureRenderMixin],

  render: function () {
    return <circle cx={this.props.label.position.x} cy={this.props.label.position.y} r="8" />
  }
});


module.exports = Point;
