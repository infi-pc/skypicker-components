
var Place = React.createClass({
  click: function () {
    this.props.onSelect(this.props.place);
  },
  render: function () {
    var place = this.props.place;
    return (
      <div className="place-row" onClick={this.click}>
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
