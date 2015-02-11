var PureRenderMixin = require('react').addons.PureRenderMixin;

var Point = React.createClass({

  mixins: [PureRenderMixin],

  render: function () {
    var size = 16;

    if (this.props.label.showFullLabel) {
      size = 16
    } else {
      size = 8
    }


    var style = {
      top: this.props.label.position.y - size/2,
      left: this.props.label.position.x - size/2,
      position: "absolute"
    };
    var mapPlace = this.props.label.mapPlace;

    var color;
    if (this.props.label.hover) {
      color = "#4cbd5f";
    } else {
      color = "#2D75CD";
    }

    if (mapPlace.flag == "origin") {
      color = "#bd4c4c";
    }
    if (mapPlace.flag == "destination") {
      color = "#4cbd5f";
    }


    return ( //cx={this.props.label.position.x} cy={this.props.label.position.y}
      <svg height={size} width={size} style={style}>
        <circle cx={size/2} cy={size/2} r={size/2} fill="#ccc" />
        <circle cx={size/2} cy={size/2} r={(size/2)-1} fill="#fff" />
        <circle cx={size/2} cy={size/2} r={(size)/4} fill={color} />
        //<circle cx={size/2} cy={size/2} r={size/4} fill="#555" />
      </svg>
    )
  }
});


module.exports = Point;
