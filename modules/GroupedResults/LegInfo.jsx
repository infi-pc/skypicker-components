module.exports = React.createClass({
  className: "LegInfo",
  render: function () {
    var leg = this.props.leg;
    console.log(leg);
    return (<div>{leg.id}</div>)
  }
});
