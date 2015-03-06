var SearchFormStore = require('./../../../stores/SearchFormStore.jsx');
var MapLabelsStore = require('./../../../stores/MapLabelsStore.jsx');
var SearchPlace = require('./../../../containers/SearchPlace.jsx');
var PureRenderMixin = require('react').addons.PureRenderMixin;

var MouseClickTile = React.createClass({

  mixins: [PureRenderMixin],

  componentDidMount: function () {
    google.maps.event.addDomListener(this.refs.tile.getDOMNode(), 'mouseover', this.onMouseOver);
    google.maps.event.addDomListener(this.refs.tile.getDOMNode(), 'mouseout', this.onMouseOut);
    google.maps.event.addDomListener(this.refs.tile.getDOMNode(), 'contextmenu', this.onRightClick);
    google.maps.event.addDomListener(this.refs.tile.getDOMNode(), 'click', this.onClick);
  },

  componentWillUnmount: function () {
    google.maps.event.clearListeners(this.refs.tile.getDOMNode(), 'mouseover');
    google.maps.event.clearListeners(this.refs.tile.getDOMNode(), 'mouseout');
    google.maps.event.clearListeners(this.refs.tile.getDOMNode(), 'contextmenu');
    google.maps.event.clearListeners(this.refs.tile.getDOMNode(), 'click');
    //google.maps.event.removeDomListener(this.refs.label.getDOMNode(), 'contextmenu', this.onRightClick);
  },

  onMouseOver: function () {
    MapLabelsStore.setLabelOver(this.props.label);
  },
  onMouseOut: function () {
    MapLabelsStore.setLabelOut(this.props.label);
  },
  onRightClick: function (e) {
    e.stopPropagation();
    e.preventDefault();
    SearchFormStore.setField("origin", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}), "select");
    SearchFormStore.search();
  },
  onClick: function (e) {
    e.stopPropagation();
    SearchFormStore.setField("destination", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}), "select");
    SearchFormStore.search();
  },

  render: function () {
    var style = {
      top: this.props.label.position.y,
      left: this.props.label.position.x
    };

    if (this.props.label.showFullLabel) {
      style.marginTop = -8;
      style.marginLeft = -8;
      style.width = 16;
      style.height = 16;
    } else {
      style.marginTop = -5;
      style.marginLeft = -5;
      style.width = 10;
      style.height = 10;
    }
    return (
      <div ref="tile" className="mouse-click-field" style={style}></div>
    )
  }
});

module.exports = MouseClickTile;
