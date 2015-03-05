module.exports = React.createClass({
  displayName: "DateFormat",
  render: function () {
    var local = this.props.dateInPlace.get("local");
    var utc = this.props.dateInPlace.get("utc");
    var title = "In UTC time: " + utc.format("LLL");
    return (
      <span title={title}><strong>{local.format("MMM D")}</strong> {local.format("ddd")} <strong>{local.format("LT")}</strong></span>
    )
  }
});
