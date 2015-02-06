var React = require('react');
var PlacesAPI = require('./../APIs/PlacesAPI.jsx');
var Place = require('./../containers/Place.jsx');
var Quadtree = require('./../tools/quadtree.js');
var PlaceLabel = require('./PlaceLabel.jsx');


function isCollide(a, b) {
  return !(
  ((a.y + a.h) < (b.y)) ||
  (a.y > (b.y + b.h)) ||
  ((a.x + a.w) < b.x) ||
  (a.x > (b.x + b.w))
  );
}


var MapPlaces = React.createClass({

  getInitialState: function () {
    return {
      places: [],
      quadtree: Quadtree.init({
        x: 0,
        y: 0,
        w: 360,
        h: 180,
        maxDepth : 12
      }),
      quadtreeTitles: Quadtree.init({
        x: 0,
        y: 0,
        w: 5000, //max screen size
        h: 5000, //max screen size
        maxDepth : 20
      })
    }
  },

  componentDidMount: function () {
    var placesAPI = new PlacesAPI({lang: "en"});
    placesAPI.findPlaces({typeID: Place.TYPE_CITY}).then((places) => {
      //places = places.slice(0,100);

      this.state.quadtree.insert(places.map((place) => {
        return {
          x: place.lng + 180,
          y: place.lat + 90,
          w: 0.00001,
          h: 0.00001,
          place: place
        }
      }));
      this.setState({
        places: places
      })

    })
  },

  boundsToSelector: function () {
    if (!this.props.bounds) return null;
    var bounds = this.props.bounds;
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var wLng = sw.lng();
    var eLng = ne.lng();
    var sLat = sw.lat();
    var nLat = ne.lat();

    //if map has 180lng view scope than show only the bigger part of shown planet
    if (eLng - wLng < 0) {
      // what is more far from zero, it is smaller
      if (Math.abs(eLng) > Math.abs(wLng)) {
        eLng = 180;
      } else {
        wLng = -180;
      }
    }

    var selector = {
      x: wLng + 180,
      y: sLat + 90,
      w: eLng - wLng,
      h: nLat - sLat
    };
    return selector;
  },

  // mutates places
  placesToLabels: function (places) {
    this.state.quadtreeTitles.clear();
    places.sort((a,b) => {
      return a.sp_score < b.sp_score;
    });
    places = places.slice(0,300);
    var labels = [];
    places.forEach((place) => {
      var latLng = new google.maps.LatLng(place.lat, place.lng);
      var position = this.props.overlayProjection.fromLatLngToDivPixel(latLng);

      var item = {
        x: position.x,
        y: position.y,
        w: 60,
        h: 30
      };

      var collisions = 0;
      this.state.quadtreeTitles.retrieve(item, function(checkingItem) {
        if (isCollide(item, checkingItem)) {
          collisions += 1;
        }
      });

      var showFullLabel = false;
      if (collisions == 0) {
        showFullLabel = true;
        item.place = place;
        this.state.quadtreeTitles.insert(item);
      }

      var label = {
        place: place,
        position: position,
        showFullLabel: showFullLabel
      };
      labels.push(label);
    });
    console.log(labels);
    return labels;
  },

  renderPlaces: function () {
    var places = [];
    //var testItems = [];
    this.state.quadtree.retrieve(this.boundsToSelector(), function(item) {
      //testItems.push(item);
      places.push(item.place);
    });
    var labels = this.placesToLabels(places);
    return labels.map((label) => {
      var labelStyle = {
        top: label.position.y,
        left: label.position.x
      };
      return (<PlaceLabel key={label.place.id} style={labelStyle} place={label.place} showFullLabel={label.showFullLabel} />)
    })
  },
  render: function () {

    return (
      <div className="places-overlay">
        {this.renderPlaces()}
      </div>
    )
  }

});


module.exports = MapPlaces;
