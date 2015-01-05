
var Place = React.createClass({
  click: function () {
    this.props.onSelect(this.props.place);
  },
  render: function () {
    var place = this.props.place;
    var className = "place-row";
    if (this.props.selected) {
      className += " selected";
    }
    return (
      <div className={className} onClick={this.click}>
        <span className="name">
          {place.getName()}
        </span>
        <span className="type">
          {place.getType()}
        </span>
      </div>
    )
  }
});
 module.exports = Place;
