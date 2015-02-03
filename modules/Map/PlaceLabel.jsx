var PlaceLabel = React.createClass({

  getDefaultProps: function () {
    return {
      showFullLabel: false
    }
  },
  getInitialState: function () {
    return {
      active: false
    }
  },
  //componentDidMount: function () {
  //
  //},

  onClick: function () {
    console.log("activate");
    this.setState({
      active: true
    })
  },
  render: function () {
    var fullLabel, image;
    if (this.props.showFullLabel) {
      fullLabel = (
        <div>
          <span className="city-label-title">{this.props.place.shortName}</span><br/>
          <span>199 US$</span>
        </div>
      );
      image = <img src="/images/markers/city.png" />
    } else {
      image = <img src="/images/markers/citySmall.png" />
    }
    if (this.state.active) {
      image = <img src="/images/markers/cityWithPrice.png" />
    }
    return (
      <div style={this.props.style} className="city-label" onClick={this.onClick}>
        {image}
        {fullLabel}
      </div>
    )
  }

});


module.exports = PlaceLabel;
