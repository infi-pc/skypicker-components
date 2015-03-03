module.exports = React.createClass({
  displayName: "DateFormat",
  render: function () {
    var local = this.props.dateInPlace.get("local");
    var utc = this.props.dateInPlace.get("utc");
    var title = "In UTC time: " + utc.format("LLL");
    return (
      <span title={title}><b>{local.format("MMM D")}</b> {local.format("ddd")} <b>{local.format("LT")}</b></span>
    )
  }
});
