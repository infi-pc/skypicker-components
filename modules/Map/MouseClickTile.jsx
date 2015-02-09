var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');
var SearchPlace = require('./../../modules/containers/SearchPlace.jsx');
var PureRenderMixin = require('react').addons.PureRenderMixin;

var MouseClickTile = React.createClass({

  //mixins: [PureRenderMixin],

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

  },
  onMouseOut: function () {

  },
  onRightClick: function (e) {
    console.log("right click on label");
    e.stopPropagation();
    e.preventDefault();
    SearchFormStore.setField("origin", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}));
  },
  onClick: function (e) {
    e.stopPropagation();
    SearchFormStore.setField("destination", new SearchPlace({mode: "place", value: this.props.label.mapPlace.place}));
  },

  render: function () {
    var style = {
      top: this.props.label.position.y,
      left: this.props.label.position.x
    };
    return (
      <div ref="tile" className="mouse-click-field" style={style}></div>
    )
  }
});

module.exports = MouseClickTile;
