var Point = React.createClass({
  render: function () {
    var image = "x";
    var mapPlace = this.props.label.mapPlace;
    var style = {
      top: this.props.label.position.y,
      left: this.props.label.position.x
    };

    if (this.props.label.showFullLabel) {
      image = <img style={style} src="/images/markers/city.png" />
    } else {
      image = <img style={style} src="/images/markers/citySmall.png" />
    }

    if (mapPlace.flag == "origin") {
      image = <img style={style} src="/images/markers/cityWithPrice.png" />
    }
    if (mapPlace.flag == "destination") {
      image = <img style={style} src="/images/markers/cityWithPrice.png" />
    }

    return image
  }
});


module.exports = Point;
