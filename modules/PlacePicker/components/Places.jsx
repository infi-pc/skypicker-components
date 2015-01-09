var PlacesAPI = require('./../../APIs/PlacesAPICached.jsx');
var PlaceRow = require('./PlaceRow.jsx');
var Geolocation = require('./../../Geolocation.jsx');

function findPos(obj) {
  var curtop = 0;
  if (obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return [curtop];
  }
}

var Places = React.createClass({

  getInitialState: function () {
    return {
      lastSearch: null,
      lastTypes: null,
      lastNearby: null,
      places: [],
      keySelectedIndex: -1,
      apiError: false,
      loading: false
    };
  },

  getDefaultProps: function () {
    return {
    };
  },

  keypress: function (e) {
    if (e.keyIdentifier == "Up") {
      this.moveUp();
    } else if (e.keyIdentifier == "Down") {
      this.moveDown();
    } else if (e.keyIdentifier == "Enter") {
      this.selectFromIndex();
    }
  },

  moveUp: function () {
    if (this.state.keySelectedIndex >= 0) {
      this.setState({
        keySelectedIndex: this.state.keySelectedIndex - 1
      })
    } else {
      this.setState({
        keySelectedIndex: this.state.places.length - 1
      })
    }
  },

  moveDown: function () {
    var numOfPlaces = this.state.places.length;
    if (this.state.keySelectedIndex < this.state.places.length) {
      this.setState({
        keySelectedIndex: this.state.keySelectedIndex + 1
      })
    } else {
      this.setState({
        keySelectedIndex: 0
      })
    }
  },

  selectFromIndex: function () {
    this.select(this.state.places[this.state.keySelectedIndex]);
  },

  adjustScroll: function () {
    if (this.refs.places && this.refs.selectedPlace) {
      var placesElement = this.refs.places.getDOMNode();
      var selectedElement = this.refs.selectedPlace.getDOMNode();
      placesElement.scrollTop = findPos(selectedElement) - 200;
    }
  },
  componentDidMount: function () {
    this.checkNewPlaces();
    document.addEventListener("keydown", this.keypress);
  },

  componentWillUnmount: function() {
    document.removeEventListener("keydown", this.keypress);
  },

  componentDidUpdate: function (prevProps, prevState) {
    this.checkNewPlaces();
    this.adjustScroll();
  },

  filterPlacesByType: function (places , types) {
    if (types) {
      return places.filter((place) => {
        return types.indexOf(place.getTypeId()) != -1;
      });
    } else {
      return places;
    }
  },

  //TODO refactore - nearby should be separate from text
  setSearchText: function (searchText) {
    var placesAPI = new PlacesAPI({lang: this.props.lang});
    this.setState({
      loading: true,
      searchText: searchText
    });
    var callFuncParam;
    if (this.props.nearby) {
      callFuncParam = placesAPI.findNearby(Geolocation.getCurrentBounds());
    } else {
      callFuncParam = placesAPI.findByName(searchText); //TODO
    }

    callFuncParam.then((places) => {
      if (searchText != this.state.searchText) {
        return;
      }
      var filteredPlaces = this.filterPlacesByType(places, this.props.types);
      var limitedPlaces = filteredPlaces.slice(0,50);
      this.setState({
        places: limitedPlaces,
        apiError: false,
        loading: false
      });
    }).catch((error) => {
      console.error(error);
      this.setState({
        places: [],
        apiError: true,
        loading: false
      });
    });
  },

  select: function (value) {
    this.props.onSelect( new SearchPlace(value) );
  },

  getTextToSearch: function () {
    if (this.props.search.mode == "text" && !this.props.search.isDefault) {
      return this.props.search.getText();
    } else {
      return "";
    }
  },

  checkNewPlaces: function () {
    var textToSearch = this.getTextToSearch();
    if (this.state.lastSearch !== textToSearch) {
      this.setSearchText(textToSearch);
      this.setState({
        lastSearch: textToSearch,
        keySelectedIndex: -1
      });
    } else if (this.state.lastTypes != this.props.types) {
      this.setSearchText(textToSearch);
      this.setState({
        lastTypes: this.props.types,
        keySelectedIndex: -1
      });
    } else if (this.state.lastNearby != this.props.nearby) {
      this.setSearchText(textToSearch);
      this.setState({
        lastNearby: this.props.nearby,
        keySelectedIndex: -1
      });
    }
  },


  renderPlaces: function () {
    var places = this.state.places;
    var selected = places[this.state.keySelectedIndex];
    return places.map((place) => {
      if (selected == place) {
        return (<PlaceRow ref="selectedPlace" selected={selected == place} onSelect={this.select} place={place} />)
      } else {
        return (<PlaceRow onSelect={this.select} place={place} />)
      }
    });
  },

  render: function () {
    var loaderClass = "loader " + (this.state.loading ? "loading" : "not-loading");
    return (
      <div>
        {<div className={loaderClass}>Loading...</div>}
        <div ref="places" className="places">
          {this.renderPlaces()}
        </div>
      </div>
    )
  }

});


module.exports = Places;
