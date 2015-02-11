var PureRenderMixin = require('react').addons.PureRenderMixin;

var Point = React.createClass({

  mixins: [PureRenderMixin],

  render: function () {
    var size = 16;
    var color;
    var mapPlace = this.props.label.mapPlace;

    if (this.props.label.showFullLabel) {
      size = 16
    } else {
      size = 8
    }

    if (this.props.label.hover) {
      color = "#4cbd5f";
      size = this.props.label.showFullLabel ? 18 : 10
    } else {
      if (this.props.label.mapPlace.price) {
        color = "#2D75CD";
      } else {
        color = "#999999";
      }
    }

    if (mapPlace.flag == "origin") {
      color = "#bd4c4c";
      size = this.props.label.showFullLabel ? 18 : 10
    }
    if (mapPlace.flag == "destination") {
      color = "#4cbd5f";
      size = this.props.label.showFullLabel ? 18 : 10
    }

    var style = {
      top: this.props.label.position.y - size/2,
      left: this.props.label.position.x - size/2,
      position: "absolute"
    };





    return (
      <svg height={size} width={size} style={style}>
        <circle cx={size/2} cy={size/2} r={size/2} fill="#ddd" />
        <circle cx={size/2} cy={size/2} r={(size/2)-1} fill="#fff" />
        <circle cx={size/2} cy={size/2} r={(size)/4} fill={color} />
      </svg>
    )
  }
});


module.exports = Point;
