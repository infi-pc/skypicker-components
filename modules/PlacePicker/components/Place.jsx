
var Place = React.createClass({
  render: function () {
    var place = this.props.place;
    return (
      <div className="place-row">
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
