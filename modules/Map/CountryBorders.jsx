var Q = require("q");
var SearchFormStore = require("../stores/SearchFormStore.jsx");

function mergeOptions(obj1,obj2){
  var obj3 = {};
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
}

var polygonOptions = {
  origin: {	// red
    strokeColor: '#bd4c4c',
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: '#bd4c4c',
    fillOpacity: 0.20
  },
  destination: {	// green
    strokeColor: '#4cbd5f',
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: '#4cbd5f',
    fillOpacity: 0.20
  }
};

class CountryBorders{
  constructor(map) {
    this.map = map;
    this.bordersData = {};
    this.polygons = {};

    this.setPlace(SearchFormStore.data.origin, "origin");
    this.setPlace(SearchFormStore.data.destination, "destination");
    SearchFormStore.events.on('change', () => {
      this.setPlace(SearchFormStore.data.origin, "origin");
      this.setPlace(SearchFormStore.data.destination, "destination");
    })
  }

  setPlace(place, direction) {
    if (place.mode == "place" && this.polygons[direction] && place.value.id == this.polygons[direction].id) {
      return; //do not change it
    }

    if (this.polygons[direction]) {
      this.polygons[direction].setMap(null);
      this.polygons[direction] = null;
    }

    if (place.mode == "place" && place.value.typeString == "country") {
      var id = place.value.id;
      this.getCountryBorders(id)
        .then((data) => {
          var paths = this.getPolygonPaths(data);
          if (paths) {
            var polygon = new google.maps.Polygon(mergeOptions({
              map: this.map,
              paths: paths,
              clickable: false
            }, polygonOptions[direction]));
            polygon.id = id;
            this.polygons[direction] = polygon;
          }

        })
        .done();
    }
  }

  //getCountryBordersCached(countryId) {
  //  if (this.bordersData[countryId]) {
  //    return Q.resolve(this.bordersData[countryId]);
  //  }
  //  return getCountryBordersFromFusion(countryId).then((data) => {
  //    this.bordersData[countryId] = data;
  //    return data;
  //  })
  //}

  getCountryBorders(countryId) {
    var defer = Q.defer();
    // required for Google Fusion Tables
    google.load("visualization", "1", { callback:  () => {

      // query fusion tables
      // sql reference: https://developers.google.com/fusiontables/docs/v1/sql-reference
      var condition = " WHERE id = '" + countryId.toUpperCase() + "' ";
      // https://www.google.com/fusiontables/DataSource?docid=1cjPAZeMnMt7-hVQSlHG7sw2SM7pz91e6To6z4xyD
      var selectActive, selectAll, query;
      selectActive = "SELECT id, geometry FROM " + '1cjPAZeMnMt7-hVQSlHG7sw2SM7pz91e6To6z4xyD ' + condition;
      query = new google.visualization.Query('https://www.google.com/fusiontables/gvizdata?tq=' +
        encodeURIComponent(selectActive)
      );
      query.send((data) => {
        if (!data.isError()) {
          defer.resolve(data.getDataTable());
        } else {
          defer.reject(new Error(data.getMessage()));
        }

        //this.drawCountryBorders(data);
        //this.refreshHighlights();
        //this.centerMap();
      });
    }});
    return defer.promise;
  }

  getPolygonPaths(data) {
    var domParser = new DOMParser();
    var dataRows = data.getNumberOfRows();
    if (dataRows == 1) {
      var id = data.getValue(0, 0);
      var kml = data.getValue(0, 1);
      var node = domParser.parseFromString(kml, 'text/xml');
      var coordinates = node.getElementsByTagName('coordinates'); // One country can contain multiple coordinates
      var paths = [];
      for (var j = 0; j < coordinates.length; j++) {
        var coordinate = coordinates[j].childNodes[0].nodeValue;
        var path = [];
        var coords = coordinate.split(' ');
        for (var k = 0; k < coords.length; k++) {
          var coord = coords[k].split(',');
          if (!isNaN(coord[0]) && !isNaN(coord[1])) {
            path.push(new google.maps.LatLng(parseFloat(coord[1]), parseFloat(coord[0])));
          }
        }
        paths.push(path);
      }

      return paths;
    }
    return null;
  }
}

module.exports = CountryBorders;
