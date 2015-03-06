(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./exports/skypicker.jsx":[function(require,module,exports){
"use strict";
var translationStrategy = require('./../modules/tools/spTr.js');
var tr = require('./../modules/tools/tr.js');
tr.setStrategy(translationStrategy);
var React = (window.React);

//just include it to setup
var APIManager = require("./../modules/tools/APIManager.jsx");


window.Wgts = {}; //That's namespace if there will be some name collision

window.Place = Wgts.Place = require('./../modules/containers/Place.jsx');
window.Radius = Wgts.Radius = require('./../modules/containers/Radius.jsx');
window.SearchDate = Wgts.SearchDate = require('./../modules/containers/SearchDate.jsx');
window.SearchPlace = Wgts.SearchPlace = require('./../modules/containers/SearchPlace.jsx');
window.SearchFormData = Wgts.SearchFormData = require('./../modules/containers/SearchFormData.jsx');
window.SearchFormStore = Wgts.SearchFormStore = require('./../modules/stores/SearchFormStore.jsx');
window.OptionsStore = Wgts.OptionsStore = require('./../modules/stores/OptionsStore.jsx');
window.Options = Wgts.Options = require('./../modules/containers/Options.jsx');
window.SearchFormAdapter = Wgts.SearchFormAdapter = require('./../modules/plainJsAdapters/SearchFormAdapter.jsx');
//MAP
window.MapOverlay = Wgts.MapOverlay = require('./../modules/modules/Map/MapOverlay.jsx');
window.MapLoader = Wgts.MapLoader = require('./../modules/modules/Map/components/MapLoader.jsx');
window.MapPlacesStore = Wgts.MapPlacesStore = require('./../modules/stores/MapPlacesStore.jsx');
//RESULTS
window.GroupedResults = Wgts.GroupedResults = require('./../modules/modules/GroupedResults/GroupedResults.jsx');

},{"./../modules/containers/Options.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Options.jsx","./../modules/containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../modules/containers/Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx","./../modules/containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../modules/containers/SearchFormData.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx","./../modules/containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../modules/modules/GroupedResults/GroupedResults.jsx":"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\GroupedResults.jsx","./../modules/modules/Map/MapOverlay.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\MapOverlay.jsx","./../modules/modules/Map/components/MapLoader.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\MapLoader.jsx","./../modules/plainJsAdapters/SearchFormAdapter.jsx":"C:\\www\\skypicker-components\\modules\\plainJsAdapters\\SearchFormAdapter.jsx","./../modules/stores/MapPlacesStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesStore.jsx","./../modules/stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./../modules/stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../modules/tools/APIManager.jsx":"C:\\www\\skypicker-components\\modules\\tools\\APIManager.jsx","./../modules/tools/spTr.js":"C:\\www\\skypicker-components\\modules\\tools\\spTr.js","./../modules/tools/tr.js":"C:\\www\\skypicker-components\\modules\\tools\\tr.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\FlightsAPI.jsx":[function(require,module,exports){
"use strict";
// new version, not tested, not finished, should be finished later
var Q = (window.Q);
var superagent  = require("superagent");
var moment  = (window.moment);
var flightsApiToJourney = require("./mappers/flightsApiToJourney.jsx");


var formatSPApiDate = "DD/MM/YYYY";

//TODO check if on error is called exactly when error in callback or not, then Add it to promise
var handleError = function (err) {
  console.error(err);
};




  function FlightsAPI() {"use strict";
    this.options = {
      language: "en",
      format: "mapped" // "mapped" or "original"
    };
  }

  FlightsAPI.prototype.changeOptions=function(newOptions) {"use strict";
    Object.keys(newOptions).forEach(function(key)  {
      this.options[key] = newOptions[key];
    }.bind(this))
  };
  /*
      Request:
      {
        origin: string (id) |
        destination: string (id), default: "anywhere"
        outboundDate: SearchDate
        inboundDate: SearchDate | null
        passengers: number, default: 1
        flyDays: (not used now)
        //daysInDestination: {from: int, to: int}, default: null
        directFlights: (not used now)

        onePerDay: bool, default: false
        oneForCity: bool, default: false
      }
   */
  FlightsAPI.prototype.findFlights=function(request, modifiedOptions) {"use strict";
    var searchParams, skypickerApiUrl;
    modifiedOptions = modifiedOptions || {};
    var options = {
      language: modifiedOptions.language || this.options.language,
      format: modifiedOptions.format || this.options.format
    };
    skypickerApiUrl = "https://api.skypicker.com/flights";
    searchParams = {
      v: 2,
      //flyDays: [],
      //directFlights: 0,
      sort: "price",
      asc: 1,
      locale: options.language,
      daysInDestinationFrom: "",
      daysInDestinationTo: ""

    };

    if (typeof request.origin == "string") {
      searchParams.flyFrom = request.origin;
    } else if (request.origin.mode == "place") {
      searchParams.flyFrom = request.origin.value.id;
    } else if (request.origin.mode == "anywhere") {
      searchParams.flyFrom = "anywhere";
    } else if (request.origin.mode === "radius") {
      searchParams.radiusFrom = request.origin.value.radius;
      searchParams.latitudeFrom = request.origin.value.lat;
      searchParams.longitudeFrom = request.origin.value.lng;
    }

    if (typeof request.destination == "string") {
      searchParams.to = request.destination;
    } else if (request.destination.mode == "place") {
      searchParams.to = request.destination.value.id;
    } else if (request.destination.mode == "anywhere") {
      searchParams.to = "anywhere";
    } else if (request.destination.mode === "radius") {
      searchParams.radiusTo = request.destination.value.radius;
      searchParams.latitudeTo = request.destination.value.lat;
      searchParams.longitudeTo = request.destination.value.lng;
    }

    searchParams.dateFrom = request.outboundDate.getFrom().format(formatSPApiDate);
    searchParams.dateTo = request.outboundDate.getTo().format(formatSPApiDate);
    if (request.inboundDate) {
      if (request.inboundDate.mode == "interval" || request.inboundDate.mode == "single"  || request.inboundDate.mode == "anytime" ) {
        searchParams.typeFlight = "return";
        searchParams.returnFrom = request.inboundDate.getFrom().format(formatSPApiDate);
        searchParams.returnTo = request.inboundDate.getTo().format(formatSPApiDate);
      } else if (request.inboundDate.mode == "timeToStay") {
        searchParams.typeFlight = "return";
        searchParams.daysInDestinationFrom = request.inboundDate.getMinStayDays();
        searchParams.daysInDestinationTo = request.inboundDate.getMaxStayDays();
        searchParams.returnFrom = "";
        searchParams.returnTo = "";
      } else {
        searchParams.typeFlight = "oneway";
        searchParams.returnFrom = "";
        searchParams.returnTo = "";
      }
    } else {
      searchParams.typeFlight = "oneway";
      searchParams.returnFrom = "";
      searchParams.returnTo = "";
    }

    if (request.onePerDay) {
      searchParams.one_per_date = 1;
    }

    if (request.oneForCity) {
      searchParams.oneforcity = 1; // oneforcity: request.oneForCity ? "1" : "",
    }


    searchParams.adults = request.passengers || 1;
    searchParams.children = 0;
    searchParams.infants = 0;


    var deferred = Q.defer();
    superagent
      .get(skypickerApiUrl)
      .query(searchParams)
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .on('error', handleError)
      .end(function(error, res)  {
        if (!error) {
          try {
            if (options.format == "original") {
              deferred.resolve(res.body.data);
            } else {
              var formatted = res.body.data.map(function(flight)  {return flightsApiToJourney(flight);});
              deferred.resolve(formatted);
            }
          } catch (error) {
            deferred.reject(error);
          }
        } else {
          //Totally weird error handling by superagent
          deferred.reject(error);
        }
      });
    return deferred.promise;
  };


module.exports = new FlightsAPI();


},{"./mappers/flightsApiToJourney.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\mappers\\flightsApiToJourney.jsx","superagent":"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx":[function(require,module,exports){
"use strict";
var superagent  = require("superagent");
var Place  = require("../containers/Place.jsx");
var deepmerge = require('deepmerge');
var Q = (window.Q);

var url = "https://api.skypicker.com/places";

//TODO check if on error is called exactly when error in callback or not, then Add it to promise
var handleError = function (err) {
  console.error(err);
};


  /**
   *
   * @param settings.lang - language in which we get places namas
   */
  function PlacesAPI(settings) {"use strict";
    this.settings = settings;
  }

  /**
   * find places according to given attributes
   * @param placeSearch.term - string to search
   * @param placeSearch.typeID -- type id
   * @param placeSearch.bounds
   * @return promise
   */
  PlacesAPI.prototype.findPlaces=function(placeSearch) {"use strict";
    var params = {};
    placeSearch = placeSearch || {};
    if (placeSearch.term) {
      params.term = placeSearch.term;
    }
    if (placeSearch.bounds) {
      params = deepmerge(params, placeSearch.bounds)
    }
    if (placeSearch.typeID) {
      params.type = placeSearch.typeID;
    }
    return this.$PlacesAPI_callAPI(params);
  };


  PlacesAPI.prototype.$PlacesAPI_convertResults=function(results) {"use strict";
    return results.map(function (result) {
      return new Place(result);
    });
  };

  PlacesAPI.prototype.$PlacesAPI_callAPI=function(params) {"use strict";
    var deferred = Q.defer();
    var defaultParams = {
      v: 2,
      locale: this.settings.lang
    };
    superagent
      .get(url)
      .query(deepmerge(params, defaultParams))
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .on('error', handleError)
      .end( function(res)  {
        if (!res.error) {
          deferred.resolve(this.$PlacesAPI_convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      }.bind(this));
    return deferred.promise;
  };

  /**
   * @param id - place id
   * @returns {*}
   */
  PlacesAPI.prototype.registerImportance=function(id) {"use strict";
    var deferred = Q.defer();
    superagent
      .post(url + "/" + id)
      .end( function(res)  {
        if (!res.error) {
          deferred.resolve(this.$PlacesAPI_convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      }.bind(this));
    return deferred.promise;
  };

  /**
   * find by id and register importance
   * @param id
   * @returns {*}
   */
  PlacesAPI.prototype.findById=function(id) {"use strict";
    var deferred = Q.defer();
    var params = {
      v: 2,
      locale: this.settings.lang,
      id: id
    };
    superagent
      .get(url + "/" + id)
      .query(params)
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .on('error', handleError)
      .end( function(res)  {
        if (!res.error) {
          deferred.resolve(new Place(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      });

    //Call one more post
    this.registerImportance(id);
    return deferred.promise;
  };


  /**
   * @deprecated use findPlaces
   */
  PlacesAPI.prototype.findByName=function(term) {"use strict";
    return this.$PlacesAPI_callAPI({term: term});
  };
  /**
   * @deprecated use findPlaces
   */
  PlacesAPI.prototype.findNearby=function(bounds) {"use strict";
    return this.$PlacesAPI_callAPI(bounds);
  };



module.exports = PlacesAPI;

},{"../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js","superagent":"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx":[function(require,module,exports){
"use strict";
var PlacesAPI  = require("./PlacesAPI.jsx");
var Q  = (window.Q);

var GlobalPromisesStore = {};

/**
 * Cached PlacesAPI, it should have always same interface as PlacesAPI
 */

  function PlacesAPICached(settings) {"use strict";
    this.placesAPI = new PlacesAPI(settings);
  }
  PlacesAPICached.prototype.callCached=function(func, params, key) {"use strict";
    if (!GlobalPromisesStore[key]) {
      GlobalPromisesStore[key] = func(params);
    }
    return GlobalPromisesStore[key];
  };

  PlacesAPICached.prototype.boundsToString=function(bounds) {"use strict";
    return bounds.lat_lo + "_" + bounds.lng_lo + "_" + bounds.lat_hi + "_" + bounds.lng_hi;
  };

  PlacesAPICached.prototype.findPlaces=function(searchParams) {"use strict";
    var key = "p_";
    if (searchParams.term) {
      key += "term:"+searchParams.term
    }
    if (searchParams.bounds) {
      key += "bounds:"+this.boundsToString(searchParams.bounds)
    }
    if (searchParams.typeID) {
      key += "type:"+searchParams.typeID
    }
    return this.callCached(this.placesAPI.findPlaces.bind(this.placesAPI), searchParams, key);
  };

  PlacesAPICached.prototype.findByName=function(term) {"use strict";
    return this.callCached(this.placesAPI.findByName.bind(this.placesAPI), term, term);
  };

  PlacesAPICached.prototype.findNearby=function(bounds) {"use strict";
    return this.callCached(this.placesAPI.findNearby.bind(this.placesAPI), bounds, this.boundsToString(bounds));
  };

  PlacesAPICached.prototype.findById=function(id) {"use strict";
    return this.callCached(this.placesAPI.findById.bind(this.placesAPI), id, "id:"+id);
  };


module.exports = PlacesAPICached;

},{"./PlacesAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx"}],"C:\\www\\skypicker-components\\modules\\APIs\\flightsAPI.jsx":[function(require,module,exports){
arguments[4]["C:\\www\\skypicker-components\\modules\\APIs\\FlightsAPI.jsx"][0].apply(exports,arguments)
},{"./mappers/flightsApiToJourney.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\mappers\\flightsApiToJourney.jsx","superagent":"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\mappers\\flightsApiToJourney.jsx":[function(require,module,exports){
"use strict";
var Journey = require('./../../containers/flights/Journey.jsx');
var Flight = require('./../../containers/flights/Flight.jsx');
var Trip = require('./../../containers/flights/Trip.jsx');
var Immutable = require('immutable');

module.exports = function (obj) {
  var outboundTrip = [];
  var inboundTrip = [];

  var journey = new Journey({
    id: obj['id'],
    source: obj['source']
  });

  journey = journey.setIn(['prices', 'default'], obj['price']);


  obj.route.forEach(function(flightObj) {

    var flight = new Flight({
      id: flightObj['id'],
      number: flightObj['flight_no'],

      //TODO thing about use of Place and TimeInPlace objects
      departure: Immutable.fromJS({
        where: {
          id: flightObj['mapIdfrom'],
          code: flightObj['flyFrom'],
          name: flightObj['cityFrom'],
          lat: flightObj['latFrom'],
          lng: flightObj['lngFrom']
        },
        when: {
          local: moment.utc(flightObj['dTime'] * 1000),
          utc: moment.utc(flightObj['dTimeUTC'] * 1000)
        }
      }),
      arrival: Immutable.fromJS({
        where: {
          id: flightObj['mapIdto'],
          code: flightObj['flyTo'],
          name: flightObj['cityTo'],
          lat: flightObj['latTo'],
          lng: flightObj['lngTo']
        },
        when: {
          local: moment.utc(flightObj['aTime'] * 1000),
          utc: moment.utc(flightObj['aTimeUTC'] * 1000)
        }
      }),
      airline: Immutable.fromJS({
        code: flightObj['airline']
        //name: airlines[flightObj['airline']] && airlines[flightObj['airline']].name
      })
    });

    var direction = flightObj['return']?"inbound":"outbound";

    if (!journey.get('trips').get(direction)) {
      journey = journey.setIn(['trips',direction], new Trip())
    }
    journey = journey.updateIn(['trips', direction, 'flights'], function(flights)  {return flights.push(flight);});
  });



  return journey;
};

},{"./../../containers/flights/Flight.jsx":"C:\\www\\skypicker-components\\modules\\containers\\flights\\Flight.jsx","./../../containers/flights/Journey.jsx":"C:\\www\\skypicker-components\\modules\\containers\\flights\\Journey.jsx","./../../containers/flights/Trip.jsx":"C:\\www\\skypicker-components\\modules\\containers\\flights\\Trip.jsx","immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\components\\Calendar.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

/* part is from https://github.com/Hanse/react-calendar/blob/master/src/calendar.js */

var React = (window.React);
var moment = (window.moment);



var Calendar = React.createClass({displayName: "Calendar",

  getDefaultProps: function() {
    return {
      weekOffset: 0,
      lang: 'en',
      forceSixRows: true
    };
  },

  dayNames: function () {
    var dayNames = [];
    var date = this.props.date.startOf('month');
    var diff = date.isoWeekday() - this.props.weekOffset;
    if (diff < 0) diff += 7;

    for (var i = 0; i < 7; i++) {
      var day = moment.utc([this.props.date.year(), this.props.date.month(), i-diff+1+7]);
      dayNames.push(day.format("dd"));
    }
    return dayNames;
  },

  days: function() {
    var days = [];
    var beginDate = this.props.date.startOf('month');
    var diff = beginDate.isoWeekday() - this.props.weekOffset;
    if (diff < 0) diff += 7;

    var i;
    for (var i = 0; i < diff; i++) {
      var date = moment.utc([this.props.date.year(), this.props.date.month(), 1]).subtract((diff-i), 'days');
      days.push({date: date, otherMonth: 'prev-month'});
    }

    var numberOfDays = beginDate.daysInMonth();
    for (i = 1; i <= numberOfDays; i++) {
      var date = moment.utc([this.props.date.year(), this.props.date.month(), i]);
      days.push({date: date});
    }

    i = 1;
    while (days.length % 7 !== 0) {
      var date = moment.utc([this.props.date.year(), this.props.date.month(), numberOfDays]).add(i, "days");
      days.push({date: date, otherMonth: 'next-month'});
      i++;
    }

    if (this.props.forceSixRows && days.length !== 42) {
      var start = moment.utc(days[days.length-1].date).add(1, 'days');
      while (days.length < 42) {
        days.push({date: moment.utc(start), otherMonth: 'next-month'});
        start.add(1, 'days');
      }
    }

    return days;
  },
  splitToWeeks: function (days) {
    var weeks = [];
    var actualWeek = [];
    for (var i = 0; i<days.length; i++) {
      if (i%7 == 0 && i != 0) {
        weeks.push(actualWeek);
        actualWeek = [];
      }
      actualWeek.push(days[i])
    }
    weeks.push(actualWeek);
    return weeks;
  },
  renderWeek: function (week) {
    return (
      React.createElement("div", {className: "week"}, 
        week.map(this.renderDay)
      )
    )
  },
  renderDay: function(day) {
    return this.props.getDay(day.date, day.otherMonth);
  },
  renderDayName: function (dayName) {
    return React.createElement("div", {key: dayName, className: "day-name"}, React.createElement("span", null, dayName ));
  },
  render: function() {
    var weeks = this.splitToWeeks(this.days());
    return (
      React.createElement("div", {className: "clndr"}, 
        React.createElement("div", {className: "clndr-month"}, 
           this.props.date.format("MMMM YYYY") 
        ), 
        React.createElement("div", {className: "clndr-grid"}, 
          React.createElement("div", {className: "day-names"}, 
            this.dayNames().map(this.renderDayName)
          ), 
          React.createElement("div", {className: "days"}, 
            weeks.map(this.renderWeek)
          ), 
          React.createElement("div", {className: "clear-both"})
        )
      )
    );
  }
});

module.exports = Calendar;


},{}],"C:\\www\\skypicker-components\\modules\\components\\ModalPicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var isIE = require('./../tools/isIE.js');
var moment = (window.moment);
var Tran = require('./Tran.jsx');
var $ = (window.$);


var ModalPicker = React.createClass({displayName: "ModalPicker",

  //getDefaultProps: function() {
  //  return {
  //    shown: false
  //  };
  //},

  getInitialState: function() {
    return {
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    };
  },

  clickOutside: function (e) {
    if (this.refs.inner) {
      if ($(this.refs.inner.getDOMNode()).has(e.target).length) return;
    }
    if (this.props.inputElement) {
      if ($(this.props.inputElement).is(e.target)) return;
      if ($(this.props.inputElement).has(e.target).length) return;
    }
    this.hide();
  },

  windowResized: function (e) {
    //TODO check performance and eventually make some delayed resize
    this.setState({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });
  },

  hide: function () {
    this.props.onHide();
  },
  componentDidMount: function() {
    document.addEventListener("click", this.clickOutside, false);
    window.addEventListener('resize', this.windowResized);
  },

  componentWillUnmount: function() {
    document.removeEventListener("click", this.clickOutside, false);
    window.removeEventListener('resize', this.windowResized);
  },

  calculateStyles: function () {
    if (isIE(8,'lte')) {
      return {};
    }

    var rect;
    var marginLeft = 0;
    if (this.refs.outer) {
      rect = this.refs.outer.getDOMNode().getBoundingClientRect();
      var style = this.refs.outer.getDOMNode().style;
      if (style.marginLeft) {
        marginLeft = parseInt(style.marginLeft.substring(0,style.marginLeft.length-2),10);
      }
    }

    var pageWidth = $(window).width();
    var width = this.props.contentSize.width;
    var offset = (!rect)?0:(rect.left - marginLeft + window.pageXOffset);
    var maxWidth = pageWidth;
    var outerStyles;
    var addClass = "";

    if (width > maxWidth) {
      //make smaller version
      addClass = "compact-size";
      if (this.props.contentSize.widthCompact) {
        width = this.props.contentSize.widthCompact;
      }
    }
    if (offset + width <= maxWidth) {
      //KEEP IT
      outerStyles = {
        marginLeft: 0,
        width: width
      };
    } else if (offset + width > maxWidth && width < maxWidth) {
      //MOVE IT
      var missingSpace = offset + width - maxWidth;
      outerStyles = {
        marginLeft: 0 - missingSpace,
        width: width
      };
    } else {
      outerStyles = {
        marginLeft: 0,
        width: "100%"
      };
    }
    return {
      outer: outerStyles,
      addClass: addClass
    };
  },

  calculateOuterStyles: function () {
    if (isIE(8,'lte')) {
      return {};
    }
  },
  render: function() {
    var styles = this.calculateStyles();
    var className = "search-modal " + (styles.addClass ? styles.addClass : "");

    //TODO decide if put there close button or not
    //<div className="close-button" onclick={this.hide}><Tran tKey="close">close</Tran></div>
    return (
      React.createElement("div", {className: className, ref: "outer", style: styles.outer}, 
        React.createElement("div", {className: "search-modal-content", ref: "inner"}, this.props.children)
      )
    );
  }
});

module.exports = ModalPicker;



},{"./../tools/isIE.js":"C:\\www\\skypicker-components\\modules\\tools\\isIE.js","./Tran.jsx":"C:\\www\\skypicker-components\\modules\\components\\Tran.jsx"}],"C:\\www\\skypicker-components\\modules\\components\\Price.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var translate = require('./../tools/translate.jsx');
var OptionsStore = require('./../stores/OptionsStore.jsx');
var PureRenderMixin = (window.React).addons.PureRenderMixin;


var Price = React.createClass({displayName: "Price",
  mixins: [PureRenderMixin],
  getInitialState:function() {
    return {
      currency: OptionsStore.data.currency
    }
  },

  setStateFromStore:function() {
    this.setState({
      currency: OptionsStore.data.currency
    });
  },

  componentDidMount: function () {
    OptionsStore.events.on("change", this.setStateFromStore);
  },
  componentWillUnmount: function () {
    OptionsStore.events.removeListener("change", this.setStateFromStore);
  },

  render: function() {
    var eurPrice = this.props.children;
    var currency = this.state.currency.toLowerCase();
    var priceInCurrency;
    if (window.Skypicker && window.Skypicker.config.currencies[currency] && window.Skypicker.config.currencies[currency].rate) {
      priceInCurrency = (eurPrice / window.Skypicker.config.currencies[currency].rate).toFixed(window.Skypicker.config.currencies[currency].round);
    } else {
      currency = "eur";
      priceInCurrency = eurPrice;
    }
    return (
      React.createElement("span", null, 
         translate("currency."+currency,{price: priceInCurrency}, priceInCurrency) 
      )
    );
  }
});

module.exports = Price;

},{"./../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./../tools/translate.jsx":"C:\\www\\skypicker-components\\modules\\tools\\translate.jsx"}],"C:\\www\\skypicker-components\\modules\\components\\Tran.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */




/** Deprecated -  don't use */




var React = (window.React);
var tr = require('./../tools/tr.js');

/* react component wrapper of tr function */

var Tran = React.createClass({displayName: "Tran",
  render: function() {
    var original = this.props.children;
    var key = this.props.tKey;
    var values = this.props.values;
    return (
      React.createElement("span", null, 
         tr(original,key,values) 
      )
    );
  }
});

module.exports = Tran;

},{"./../tools/tr.js":"C:\\www\\skypicker-components\\modules\\tools\\tr.js"}],"C:\\www\\skypicker-components\\modules\\components\\Translate.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var translate = require('./../tools/translate.jsx');

/* TODO finish it */

//TODO listen to language change

var Translate = React.createClass({displayName: "Translate",
  render: function() {
    var original = this.props.children;
    var key = this.props.tKey;
    var values = this.props.values;
    return (
      React.createElement("span", null, 
         translate(key,values,original) 
      )
    );
  }
});

module.exports = Translate;

},{"./../tools/translate.jsx":"C:\\www\\skypicker-components\\modules\\tools\\translate.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\Immutable.jsx":[function(require,module,exports){
"use strict";

function Immutable(){"use strict";}

  /**
   * return new object with added changes, if no change return same object
   * @param newValues
   * @returns new object as in class
   */
  Immutable.prototype.edit=function(newValues){"use strict";
    if (!newValues) {
      return this;
    }
    var leastOneEdit = false;
    var newPlain = {};
    //Add from this
    Object.keys(this).forEach(function(key)  {
      newPlain[key] = this[key];
    }.bind(this));
    //Add from new
    Object.keys(newValues).forEach(function(key)  {
      if (newPlain[key] !== newValues[key]) {
        newPlain[key] = newValues[key];
        leastOneEdit = true;
      }
    });
    if (leastOneEdit) {
      return new this.class(newPlain);
    } else {
      return this;
    }

  };;
  /**
   * return edited object
   * @param key
   * @param value
   * @returns {SearchDate}
   */
  Immutable.prototype.set=function(key, value) {"use strict";
    var newPlain = {};
    newPlain[key] = value;
    return this.edit(newPlain)
  };


module.exports = Immutable;

},{}],"C:\\www\\skypicker-components\\modules\\containers\\MapLabel.jsx":[function(require,module,exports){
"use strict";
var Immutable = require('./immutable.jsx');

for(var Immutable____Key in Immutable){if(Immutable.hasOwnProperty(Immutable____Key)){MapLabel[Immutable____Key]=Immutable[Immutable____Key];}}var ____SuperProtoOfImmutable=Immutable===null?null:Immutable.prototype;MapLabel.prototype=Object.create(____SuperProtoOfImmutable);MapLabel.prototype.constructor=MapLabel;MapLabel.__superConstructor__=Immutable;
  function MapLabel(plain) {"use strict";
    this.mapPlace = plain.mapPlace;
    this.position = plain.position;
    this.showFullLabel = plain.showFullLabel;
    this.relativePrice = plain.relativePrice;
    this.hover = plain.hover;

    this.class = MapLabel;
    Object.freeze(this);
  }

  MapLabel.prototype.edit=function(plain) {"use strict";
    //prevent same position to make new object
    if (plain.position) {
      if (plain.position.x == this.position.x && plain.position.y == this.position.y) {
        plain.position = this.position;
      }
    }
    return ____SuperProtoOfImmutable.edit.call(this,plain);
  };

  /* expects that there is no two labels with same place */
  MapLabel.prototype.getId=function() {"use strict";
    return this.mapPlace.place.id;
  };




module.exports = MapLabel;

},{"./immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\MapPlace.jsx":[function(require,module,exports){
"use strict";
var Immutable = require('./immutable.jsx');

for(var Immutable____Key in Immutable){if(Immutable.hasOwnProperty(Immutable____Key)){MapPlace[Immutable____Key]=Immutable[Immutable____Key];}}var ____SuperProtoOfImmutable=Immutable===null?null:Immutable.prototype;MapPlace.prototype=Object.create(____SuperProtoOfImmutable);MapPlace.prototype.constructor=MapPlace;MapPlace.__superConstructor__=Immutable;

  function MapPlace(plain) {"use strict";
    this.place = plain.place;
    this.flag = plain.flag || ""; //origin, destination, stopover
    this.price = plain.price || null;
    this.relativePrice = plain.relativePrice || null;

    this.class = MapPlace;
    Object.freeze(this);
  }


module.exports = MapPlace;

},{"./immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\Options.jsx":[function(require,module,exports){
"use strict";
var Radius = require("./Radius.jsx");
var Immutable = require("./Immutable.jsx");

for(var Immutable____Key in Immutable){if(Immutable.hasOwnProperty(Immutable____Key)){Options[Immutable____Key]=Immutable[Immutable____Key];}}var ____SuperProtoOfImmutable=Immutable===null?null:Immutable.prototype;Options.prototype=Object.create(____SuperProtoOfImmutable);Options.prototype.constructor=Options;Options.__superConstructor__=Immutable;
  function Options(plain) {"use strict";
    plain = plain || {};
    this.language = plain.language || "en";
    this.currency = plain.currency || "EUR";
    this.defaultRadius = plain.defaultRadius || new Radius(); //TODO radius??
    this.defaultMapCenter = plain.defaultMapCenter || null; //TODO map center

    this.class = Options;
    Object.freeze(this);
  }


module.exports = Options;

},{"./Immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Immutable.jsx","./Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx":[function(require,module,exports){
"use strict";

var typeIdToString = function(type) {

};




  Place.typeIdToString=function(type) {"use strict";
    if (type == Place.TYPE_AIRPORT) {
      return "airport";
    } else if (type == Place.TYPE_COUNTRY) {
      return "country";
    } else if (type == Place.TYPE_CITY) {
      return "city";
    } else {
      return "unknown";
    }
  };
  function Place(plain) {"use strict";
    Object.keys(plain).forEach(function(key)  {
      this[key] = plain[key];
    }.bind(this));
    if (!this.value) {
      this.value = "";
    }
    if (typeof this.complete == "undefined") {
      this.complete = true;
    }

    // create short name
    if (this.type == Place.TYPE_CITY) {
      this.shortName = this.value.replace(/\s*\(.+\)/, '');
    } else {
      this.shortName = this.value;
    }

    this.typeString = Place.typeIdToString(this.type);
    Object.freeze(this);
  }



  /* Do not use getters!!! it is here just for backward compatibility */
  Place.prototype.getName=function() {"use strict";
    return this.value;
  };
  Place.prototype.getId=function() {"use strict";
    return this.id;
  };
  Place.prototype.getType=function() {"use strict";
    return this.typeString;
  };
  Place.prototype.getTypeId=function() {"use strict";
    return this.type
  };


Place.TYPE_AIRPORT = 0;
Place.TYPE_COUNTRY = 1;
Place.TYPE_CITY = 2;

module.exports = Place;

},{}],"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx":[function(require,module,exports){
"use strict";


function round(num) {
  return Math.round(num * 100) / 100;
}


  function Radius(plain) {"use strict";
    plain = plain || {};
    this.radius =  plain.radius || 250;
    this.lat =  plain.lat || 50;
    this.lng =  plain.lng || 16;
    Object.freeze(this);
  }
  Radius.prototype.getText=function() {"use strict";
    return "" + round(this.lat) + ", " + round(this.lng) + " (" + this.radius + "km)";
  };
  Radius.prototype.getUrlString=function() {"use strict";
    return "" + round(this.lat) + "-" + round(this.lng) + "-" + this.radius + "km";
  };


module.exports = Radius;

},{}],"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx":[function(require,module,exports){
"use strict";
var moment = (window.moment);
var deepmerge = require("deepmerge");
var Immutable = require("./Immutable.jsx");

var urlDateFormat = "YYYY-MM-DD";
var tr = require('./../tools/tr.js');

/*
class SearchDate
!!!! FOR VALID OUTPUT USE ALWAYS GETTER METHODS, NOT ATTRIBUTES
 */

for(var Immutable____Key in Immutable){if(Immutable.hasOwnProperty(Immutable____Key)){SearchDate[Immutable____Key]=Immutable[Immutable____Key];}}var ____SuperProtoOfImmutable=Immutable===null?null:Immutable.prototype;SearchDate.prototype=Object.create(____SuperProtoOfImmutable);SearchDate.prototype.constructor=SearchDate;SearchDate.__superConstructor__=Immutable;
  function SearchDate(input) {"use strict";
    var plain = {};
    if (typeof input == "string") {
      plain = this.parseUrlString(input);
    } else if (typeof input == "object") {
      plain = input;
    }
    this.mode = typeof(plain.mode) != 'undefined' ? plain.mode : "single";
    this.from = typeof(plain.from) != 'undefined' ? plain.from : moment.utc();
    this.to = typeof(plain.to) != 'undefined' ? plain.to : moment.utc();
    this.minStayDays = typeof(plain.minStayDays) != 'undefined' ? plain.minStayDays : 2;
    this.maxStayDays = typeof(plain.maxStayDays) != 'undefined' ? plain.maxStayDays : 10;
    this.final = typeof(plain.final) != 'undefined' ? plain.final : true;

    this.class = SearchDate;
    Object.freeze(this);
  }

  SearchDate.prototype.getMode=function() {"use strict";
    return this.mode
  };

  SearchDate.prototype.getFrom=function() {"use strict";
    if (this.mode == "timeToStay" || this.mode == "noReturn") {
      return null;
    } else if (this.mode == "anytime") {
      return moment.utc().add(1, "days");
    } else {
      return this.from
    }
  };

  SearchDate.prototype.getTo=function() {"use strict";
    if (this.mode == "timeToStay" || this.mode == "noReturn") {
      return null;
    } else if (this.mode == "single") {
      return this.from
    } else if (this.mode == "anytime") {
      return moment.utc().add(6, "months");
    } else {
      if (this.to) {
        return this.to
      } else {
        //just for cases when the value is not filled (not complete interval)
        return this.from
      }
    }
  };

  SearchDate.prototype.getDate=function() {"use strict";
    if (this.mode == "single") {
      return this.from
    } else {
      return null
    }
  };

  SearchDate.prototype.getMinStayDays=function() {"use strict";
    if (this.mode == "timeToStay") {
      return this.minStayDays;
    } else {
      return null;
    }
  };

  SearchDate.prototype.getMaxStayDays=function() {"use strict";
    if (this.mode == "timeToStay") {
      return this.maxStayDays;
    } else {
      return null;
    }
  };

  SearchDate.prototype.format=function() {"use strict";
    if (this.mode == "single") {
      return this.from.format("l")
    } else if (this.mode == "timeToStay") {
      return this.minStayDays + " - " + this.maxStayDays + " days"
    } else if (this.mode == "interval" || this.mode == "month") {
      var toDateString;
      if (!this.to) {
        toDateString = "_"
      } else {
        toDateString = this.to.format("l")
      }
      return this.from.format("l") + " - " + toDateString
    } else if (this.mode == "anytime") {
      return tr("Anytime", "anytime");
    } else if (this.mode == "noReturn") {
      return tr("No return", "no_return_label");
    } else {
      return this.mode
    }
  };


  /* wa url */
  SearchDate.prototype.toUrlString=function() {"use strict";
    return this.mode + "_" + this.from.format(urlDateFormat) + "_" + this.to.format(urlDateFormat);
  };

  /*
   Just parse it, return plain minimal/incomplete version of SearchDate object
   */
  SearchDate.prototype.parseUrlString=function(stringDate) {"use strict";
    if (stringDate.indexOf("_") !== -1) {
      var split = stringDate.split("_");
      return {
        mode: split[0],
        from: moment.utc(split[1], urlDateFormat),
        to: moment.utc(split[2], urlDateFormat)
      };
    } else {
      return {
        mode: "single",
        from: moment.utc(stringDate, urlDateFormat),
        to: moment.utc(stringDate, urlDateFormat)
      };
    }
  };


  /* just helper function if i mode is not set */
  SearchDate.guessModeFromPlain=function(plain) {"use strict";
    if (plain.minStayDays && plain.maxStayDays) {
      return "timeToStay";
    } else if (!plain.from) {
      return "noReturn";
    } else if (plain.from == plain.to) {
      return "single";
    } else {
      return "interval";
    }
  };


module.exports = SearchDate;

},{"./../tools/tr.js":"C:\\www\\skypicker-components\\modules\\tools\\tr.js","./Immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Immutable.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js"}],"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx":[function(require,module,exports){
"use strict";
var SearchPlace = require('./SearchPlace.jsx');
var SearchDate = require('./SearchDate.jsx');
var DatePairValidator = require('./../tools/DatePairValidator.jsx');

var dateCorrector = {};
dateCorrector.correct = function (data, direction) {
  var error = DatePairValidator.validate(
    data.dateFrom,
    data.dateTo
  );
  if (error == "crossedDates") {
    if (direction == "dateFrom") {
      return data.dateTo = data.dateFrom;
    } else if (direction == "dateTo") {
      return data.dateFrom = data.dateTo;
    }
  }
  return data;
};



  function SearchFormData(input) {"use strict";
    var plain = input || {};
    this.dateFrom = plain.dateFrom || new SearchDate();
    this.dateTo = plain.dateTo || new SearchDate({from: moment().add(1, "months")});
    this.origin = plain.origin || new SearchPlace("", true);
    this.destination = plain.destination || new SearchPlace({mode: ""}, true);
    this.passengers = parseInt(plain.passengers) || 1;
    Object.freeze(this);
  }

  //TODO change to extended from Immutable
  /* immutable */
  SearchFormData.prototype.changeField=function(type, value) {"use strict";
    var newPlain = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      origin: this.origin,
      destination: this.destination,
      passengers: this.passengers
    };
    newPlain[type] = value;
    if (type == "dateTo" || type == "dateFrom") {
      dateCorrector.correct(newPlain, type);
    }
    return new SearchFormData(newPlain);
  };


module.exports = SearchFormData;

},{"./../tools/DatePairValidator.jsx":"C:\\www\\skypicker-components\\modules\\tools\\DatePairValidator.jsx","./SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx":[function(require,module,exports){
"use strict";

var Place = require('./Place.jsx');
var tr = require('./../tools/tr.js');
var Immutable = require('./immutable.jsx');

var defaultValues = {
  mode: "text", /* modes: text, place, anywhere, radius, ...  !! it is similar as modes in placePicker but not exactly same */
  value: "",
  isDefault: false /* this is set only when you want to use text as predefined value */
};

function makePlain(input) {
  var plain = {};
  if (typeof input == 'undefined') {
    plain.mode = "text";
    plain.value = "";
  } else if (typeof input == 'string') {
    plain.mode = "text";
    plain.value = input;
  } else if (typeof input == "object") {
    plain = input;
  }
  return plain
}

function validateModes(data) {
  if (data.mode == "text") {
    if (typeof data.value != "string") {
      throw new Error("wrong type of value");
    }
  }
  if (data.mode == "place") {
    if ( !(data.value instanceof Place) ) {
      throw new Error("wrong type of value");
    }
  }
}

function getFormModeFromMode(mode) {
  if (mode == "radius" || mode == "anywhere") {
    return mode;
  } else {
    return "all";
  }
}

for(var Immutable____Key in Immutable){if(Immutable.hasOwnProperty(Immutable____Key)){SearchPlace[Immutable____Key]=Immutable[Immutable____Key];}}var ____SuperProtoOfImmutable=Immutable===null?null:Immutable.prototype;SearchPlace.prototype=Object.create(____SuperProtoOfImmutable);SearchPlace.prototype.constructor=SearchPlace;SearchPlace.__superConstructor__=Immutable;
  function SearchPlace(input, isDefault) {"use strict";
    var plain = makePlain(input);
    this.mode = plain.mode || "text";
    this.formMode = plain.formMode || getFormModeFromMode(this.mode);
    this.value = plain.value || "";
    this.isDefault = plain.isDefault || isDefault;
    this.error = plain.error || "";
    this.loading = plain.loading || false;

    validateModes(this);

    this.class = SearchPlace;
    Object.freeze(this);
  }

  SearchPlace.prototype.getMode=function() {"use strict";
    return this.mode;
  };

  SearchPlace.prototype.getValue=function() {"use strict";
    return this.value;
  };

  /* shown text */
  SearchPlace.prototype.getText=function() {"use strict";
    var mode = this.mode;
    if (mode == "text") {
      return this.value;
    } else if (mode == "anywhere") {
      return tr("Anywhere","anywhere");
    } else if (mode == "place") {
      return this.value.getName();
    } else if (mode == "radius") {
      return this.value.getText();
    } else if (mode == "id") {
      return this.value;
    }
  };

  /* name of place */
  SearchPlace.prototype.getName=function() {"use strict";
    console.warn("getName shouldn't be used");
    return this.getUrlString();
  };

  SearchPlace.prototype.getUrlString=function() {"use strict";
    var mode = this.mode;
    if (mode == "text") {
      return null;
    } else if (mode == "anywhere") {
      return "anywhere";
    } else if (mode == "place") {
      return this.value.getName();
    } else if (mode == "radius") {
      return this.value.getUrlString();
    } else if (mode == "id") {
      return this.value;
    }
  };

  SearchPlace.prototype.getId=function() {"use strict";
    var mode = this.mode;
    if (mode == "text") {
      return null;
    } else if (mode == "anywhere") {
      return "anywhere";
    } else if (mode == "place") {
      return this.value.getId();
    } else if (mode == "id") {
      return this.value;
    }
  };

  SearchPlace.prototype.getPlace=function() {"use strict";
    if (this.getMode() == "place") {
      return this.value;
    } else {
      return null;
    }
  };




module.exports = SearchPlace;

},{"./../tools/tr.js":"C:\\www\\skypicker-components\\modules\\tools\\tr.js","./Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\flights\\Flight.jsx":[function(require,module,exports){
"use strict";
var Immutable = require('immutable');

var Def = Immutable.Record({
  id: null,
  number: null,
  departure: null,
  arrival: null,
  airline: null
});

for(var Def____Key in Def){if(Def.hasOwnProperty(Def____Key)){Flight[Def____Key]=Def[Def____Key];}}var ____SuperProtoOfDef=Def===null?null:Def.prototype;Flight.prototype=Object.create(____SuperProtoOfDef);Flight.prototype.constructor=Flight;Flight.__superConstructor__=Def;function Flight(){"use strict";if(Def!==null){Def.apply(this,arguments);}}

  Flight.prototype.getId=function() {"use strict";
    return this.get("id");
  };

  Flight.prototype.getStops=function() {"use strict";
    return 0;
  };

  Flight.prototype.getDeparture=function() {"use strict";
    return this.get("departure");
  };

  Flight.prototype.getArrival=function() {"use strict";
    return this.get("arrival");
  };

  Flight.prototype.getDuration=function() {"use strict";
    return moment.duration(this.getArrival().get("when").get("utc").diff(this.getDeparture().get("when").get("utc")));
  };

  Flight.prototype.countFlights=function() {"use strict";
    return 1;
  };


module.exports = Flight;

},{"immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\containers\\flights\\Journey.jsx":[function(require,module,exports){
"use strict";
var Immutable = require('immutable');


var Def = Immutable.Record({
  id: null,
  source: null,
  trips: Immutable.Map(), //usually {outbound: new Trip(), inbound: new Trip()}
  prices: Immutable.Map({})
});

for(var Def____Key in Def){if(Def.hasOwnProperty(Def____Key)){Journey[Def____Key]=Def[Def____Key];}}var ____SuperProtoOfDef=Def===null?null:Def.prototype;Journey.prototype=Object.create(____SuperProtoOfDef);Journey.prototype.constructor=Journey;Journey.__superConstructor__=Def;function Journey(){"use strict";if(Def!==null){Def.apply(this,arguments);}}

  Journey.prototype.getId=function() {"use strict";
    return this.get("id");
  };

  Journey.prototype.getPrice=function() {"use strict";
    return this.getIn(["prices", "default"]);
  };

  Journey.prototype.countFlights=function() {"use strict";
    //TO
  };

  Journey.prototype.isReturn=function() {"use strict";
    return !!this.get("trips").get("inbound");
  };


module.exports = Journey;

},{"immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\containers\\flights\\MasterSlavesPair.jsx":[function(require,module,exports){
"use strict";
var Immutable = require('immutable');
var List = Immutable.List;

var Def = Immutable.Record({
  master: null, //Trip
  journey: null, //Journey (if it is return, it is null, because there are multiple journeys in slaves)
  slaves: List(), //List of Map({trip: Trip, journey: Journey (common journey)})
  oneWay: true
});

for(var Def____Key in Def){if(Def.hasOwnProperty(Def____Key)){MasterSlavesPair[Def____Key]=Def[Def____Key];}}var ____SuperProtoOfDef=Def===null?null:Def.prototype;MasterSlavesPair.prototype=Object.create(____SuperProtoOfDef);MasterSlavesPair.prototype.constructor=MasterSlavesPair;MasterSlavesPair.__superConstructor__=Def;function MasterSlavesPair(){"use strict";if(Def!==null){Def.apply(this,arguments);}}

  MasterSlavesPair.prototype.hasJourney=function(journeyToFind) {"use strict";
    var hasJourney = false;
    if (journeyToFind == this.get("journey")) {
      hasJourney = true;
    }
    this.get("slaves").forEach(function(slave)  {
      if (slave.get("journey") == journeyToFind) {
        hasJourney = true;
      }
    });
    return hasJourney;
  };


module.exports = MasterSlavesPair;

},{"immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\containers\\flights\\Trip.jsx":[function(require,module,exports){
"use strict";
var Immutable = require('immutable');

var Def = Immutable.Record({
  flights: Immutable.List([])
});

for(var Def____Key in Def){if(Def.hasOwnProperty(Def____Key)){Trip[Def____Key]=Def[Def____Key];}}var ____SuperProtoOfDef=Def===null?null:Def.prototype;Trip.prototype=Object.create(____SuperProtoOfDef);Trip.prototype.constructor=Trip;Trip.__superConstructor__=Def;function Trip(){"use strict";if(Def!==null){Def.apply(this,arguments);}}
  Trip.prototype.getId=function() {"use strict";
    return this.get("flights").reduce(function(res, flight)  {
      return res.concat([flight.id]);
    }, []).join("|");
  };

  Trip.prototype.getStops=function() {"use strict";
    return this.get("flights").count() - 1;
  };

  Trip.prototype.getDeparture=function() {"use strict";
    return this.get("flights").first().get("departure");
  };

  Trip.prototype.getArrival=function() {"use strict";
    return this.get("flights").last().arrival;
  };

  Trip.prototype.getDuration=function() {"use strict";
    return moment.duration(this.getArrival().get("when").get("utc").diff(this.getDeparture().get("when").get("utc")));
  };

  Trip.prototype.countFlights=function() {"use strict";
    return this.get("flights").count();
  };


module.exports = Trip;

},{"immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx":[function(require,module,exports){
arguments[4]["C:\\www\\skypicker-components\\modules\\containers\\Immutable.jsx"][0].apply(exports,arguments)
},{}],"C:\\www\\skypicker-components\\modules\\mixins\\ModalMenuMixin.jsx":[function(require,module,exports){
arguments[4]["C:\\www\\skypicker-components\\modules\\ModalMenuMixin.jsx"][0].apply(exports,arguments)
},{}],"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\DatePickerModal.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var ModalPicker = require("./../../components/ModalPicker.jsx");
var SearchDate = require('./../../containers/SearchDate.jsx');
var DatePicker = require('./components/DatePicker.jsx');
var moment = (window.moment);
var deepmerge = require('deepmerge');


var defaultOptions = {
  initialValue: new SearchDate(),
  onHide: function() {},
  appendToElement: document.body,
  locale: "en",
  sizes: {
    single: {width: 454, height: 200},
    interval: {width: 924, height: 200, widthCompact: 454},
    month: {width: 550, height: 200},
    timeToStay: {width: 550, height: 200},
    anytime: {width: 169, height: 200},
    noReturn: {width: 169, height: 200}
  },
  modes: {
    "single": {
      closeAfter: "select", // select
      finishAfter: "select" // select
    },
    "interval": {},
    "month": {},
    "timeToStay": {},
    "anytime": {},
    "noReturn": {}
  }
};

var DatePickerModal = React.createClass({displayName: "DatePickerModal",
  getOptions: function() {
    return deepmerge(defaultOptions,this.props.options);
  },
  getDefaultProps: function () {
    return {
      options: {}
    }
  },
  getInitialState: function() {
    return {
      contentSize: {width: 169, height: 200}
    };
  },
  onValueChange: function (value, changeType) {
    var options = this.getOptions();
    if (options.modes[value.mode] && options.modes[value.mode].closeAfter == changeType) {
      this.props.onHide();
    }
    this.props.onChange(value, changeType);
  },
  onSizeChange: function (sizes) {
    this.setState({
      contentSize: sizes
    });
  },
  render: function() {
    var options = this.getOptions();
    if (!this.props.shown) {return (React.createElement("div", null))}
    return (
      React.createElement(ModalPicker, {contentSize: this.state.contentSize, inputElement: this.props.inputElement, onHide: this.props.onHide}, 
        React.createElement(DatePicker, {value: this.props.value, ref: "placePicker", onChange: this.onValueChange, sizes: options.sizes, modes: options.modes, onSizeChange: this.onSizeChange}
        )
      )
    )
  }

});


module.exports = DatePickerModal;


},{"./../../components/ModalPicker.jsx":"C:\\www\\skypicker-components\\modules\\components\\ModalPicker.jsx","./../../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./components/DatePicker.jsx":"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\DatePicker.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js"}],"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\CalendarDay.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);

var CalendarDay = React.createClass({displayName: "CalendarDay",

  onOver: function () {
    this.props.onOver(this.props.date)
  },
  onSelect: function () {
    this.props.onSelect(this.props.date)
  },

  getDefaultProps: function() {
    return {
      date: null,
      otherMonth: ''
    };
  },

  render: function() {

    var classes = this.props.otherMonth;
    if (!classes) {
      classes = "";
    }
    if (this.props.disabled) {
      classes += " disabled";
      return ( //onMouseLeave={ this.props.onLeave }
        React.createElement("div", {className: classes }, 
          React.createElement("span", {className: "day-number"}, this.props.date.date())
        )
      );
    }
    if (this.props.other) {
      classes += " other";
    }
    if (this.props.over) {
      classes += " over"
    }
    if (this.props.selected) {
      classes += " selected"
    }
    return ( //onMouseLeave={ this.props.onLeave }
      React.createElement("div", {className: classes, onMouseEnter:  this.onOver, onClick:  this.onSelect}, 
        React.createElement("span", {className: "day-number"}, this.props.date.date())
      )
    );
  }
});

module.exports = CalendarDay;

},{}],"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\CalendarFrame.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var moment = (window.moment);

var CalendarDay = require("./CalendarDay.jsx");
var DaysInWeek = require("./SelectDaysInWeek.jsx");
var Calendar = require("./../../../components/Calendar.jsx");
var DateTools = require("./../../../tools/DateTools.js");

var CalendarFrame = React.createClass({displayName: "CalendarFrame",

  getInitialState: function() {
    return {
      dateOver: null,
      viewDate: moment.utc(this.props.value.from) || moment.utc()
    };
  },

  getDefaultProps: function() {
    return {
      value: null,
      calendarsNumber: 1,
      selectionMode: "single"

    };
  },

  onOver: function (date) {
    this.setState({
      dateOver: date
    });
  },

  //TODO chech if it is good to have this state here, or i should put it to DatePicke
  next: function() {
    this.setState({
      viewDate: this.state.viewDate.add(1, 'months')
    });
  },

  prev: function() {
    this.setState({
      viewDate: this.state.viewDate.subtract(1, 'months')
    });
  },

  setValue: function (value, changeType) {
    this.props.onChange(value, changeType)
  },

  onSelect: function (date) {
    if (this.props.selectionMode == "single") {
      //if single just select
      this.setValue({mode: "single", from: date, to: date},"select");
    } else if (this.props.selectionMode == "interval") {
      //if interval decide on mode
      if (!this.props.value.from) {
        this.setValue({mode: "interval", from: date, to: null, final: false},"selectPartial");
      } else if (!this.props.value.to) {
        //if is before, just put start date again
        if (date < this.props.value.from) {
          this.setValue({mode: "interval", from: date, to: null, final: false},"selectPartial");
        } else {
          this.setValue({mode: "interval", from: moment.utc(this.props.value.from), to: date},"select");
        }

      } else {
        // if i have chosen both i start to pick new one
        this.setValue({mode: "interval", from: date, to: null, final: false},"selectPartial");
      }
    }
  },

  isSelected: function (date) {
    if (!this.props.value.from) {
      return false
    }
    if (this.props.selectionMode == "single") {
      return date.format("YYYYMMDD") == moment.utc(this.props.value.from).format("YYYYMMDD");
    } else if (this.props.selectionMode == "interval") {
      if (this.props.value.to) {
        return date >= this.props.value.from && date <= this.props.value.to;
      } else {
        return date.format("YYYYMMDD") == moment.utc(this.props.value.from).format("YYYYMMDD");
      }
    }
  },

  isOver: function (date) {
    if (!this.state.dateOver) {
      return false
    }
    if (this.props.selectionMode == "interval") {
      if (this.props.value.from && !this.props.value.to) {
        return date >= this.props.value.from && date <= this.state.dateOver;
      } else {
        return this.state.dateOver.format("YYYYMMDD") == date.format("YYYYMMDD");
      }
    } else {
      return this.state.dateOver.format("YYYYMMDD") == date.format("YYYYMMDD");
    }
  },

  getDay: function (date, otherMonth) {
    var other = false;
    var disabled = false;
    if (this.props.minValue && date.format("YYYYMMDD") <= this.props.minValue.format("YYYYMMDD")) {
      other = true;
    }
    if (date.format("YYYYMMDD") <= moment().format("YYYYMMDD")) {
      disabled = true; //TODO should be probably defined somewhere more outside
    }
    return (
      React.createElement(CalendarDay, {
        key: date.valueOf(), 
        date: date, 
        otherMonth: otherMonth, 
        onOver: this.onOver, 
        onSelect: this.onSelect, 
        selected: this.isSelected(date), 
        over: this.isOver(date), 
        disabled: disabled, 
        other: other}
        )
    );
  },
  renderPrev: function () {
    if (this.state.viewDate.subtract(1, 'months').format("YYYYMM") < moment.utc().format("YYYYMM"))
      return (React.createElement("div", {className: "prev disabled"}, React.createElement("div", null)));
    else
      return (React.createElement("div", {className: "prev", onClick: this.prev}, React.createElement("div", null)));
  },
  renderNext: function () {
    if (this.state.viewDate.add(1, 'months').format("YYYYMM") > moment.utc().add(6,'months').format("YYYYMM"))
      return (React.createElement("div", {className: "next disabled"}, React.createElement("div", null)));
    else
      return (React.createElement("div", {className: "next", onClick: this.next}, React.createElement("div", null)));
  },
  render: function () {
    var self = this;
    var calendarDates = [];
    var initialDate = moment.utc(this.state.viewDate);
    for (var i = 0; i < this.props.calendarsNumber; ++i) {
      calendarDates.push( moment.utc(initialDate) );
      initialDate.add(1,"month")
    }
    var j = 0;
    var calendars = calendarDates.map(function (date) {
      j++;
      return (
        React.createElement("div", {key: date.valueOf(), className: 'calendar-view calendar-view-'+j}, 
          React.createElement(Calendar, {date: date, getDay: self.getDay, weekOffset: DateTools.firstDayOfWeek()})
        )
      );
    });
    return (
      React.createElement("div", null, 
         this.renderPrev(), 
        calendars, 
         this.renderNext(), 
        React.createElement("div", {className: "clear-both"})
      )
    )
  }
});

module.exports = CalendarFrame;

},{"./../../../components/Calendar.jsx":"C:\\www\\skypicker-components\\modules\\components\\Calendar.jsx","./../../../tools/DateTools.js":"C:\\www\\skypicker-components\\modules\\tools\\DateTools.js","./CalendarDay.jsx":"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\CalendarDay.jsx","./SelectDaysInWeek.jsx":"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\SelectDaysInWeek.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\DatePicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var SearchDate = require('./../../../containers/SearchDate.jsx');
var ModalMenuMixin = require('./../../../mixins/ModalMenuMixin.jsx');
var CalendarFrame = require('./CalendarFrame.jsx');
var MonthMatrix = require("./MonthMatrix.jsx");
var Slider = require('./Slider.js');
var tr = require('./../../../tools/tr.js');
var Tran = require('./../../../components/Tran.jsx');
var isIE = require('./../../../tools/isIE.js');


React.initializeTouchEvents(true);

var moment = (window.moment);

var Handle = React.createClass({displayName: "Handle",
  render: function() {
    return (
      React.createElement("div", {className: "handle"}, 
        this.props.sliderValue
      )
    );
  }
});

var DatePicker = React.createClass({displayName: "DatePicker",
  mixins: [ModalMenuMixin],
  getInitialState: function() {
    return {
      value: this.props.value ? this.props.value : new SearchDate(),
      viewMode: this.props.value ? this.props.value.mode : "single"
    };
  },

  getDefaultProps: function() {
    return {
      value: null,
      defaultMode: "single",
      lang: 'en',
      minValue: null
    };
  },
  componentDidMount: function () {
    var mode = this.state.viewMode;
    this.props.onSizeChange(this.props.sizes[mode]);
  },
  getModeLabel: function (mode) {
    var modeLabels = {
      single: tr("Specific","specific"),
      interval: tr("Interval","interval"),
      month: tr("Months","months"),
      timeToStay: tr("Time to stay","time_to_stay"),
      anytime: tr("Anytime","anytime"),
      noReturn: tr("No return","no_return")
    };
    return modeLabels[mode];
  },

  switchModeToFunc: function (mode) {
    var self = this;
    var newValue;
    return function () {
      switch(mode) {
        case "timeToStay":
          self.changeValue(self.getValue().edit({mode: mode}), "release"); // should by something like change mode, but it finishes value only after release so TODO make it smarter
          break;

        case "anytime":
        case "noReturn":
          self.changeValue(self.getValue().edit({mode: mode}), "select");
          break;
        default:
      }

      self.props.onSizeChange(self.props.sizes[mode]);
      self.setState({
        viewMode: mode
      });
    }
  },

  changeValue: function (value,changeType) {
    var newValue = this.getValue().edit(value);
    this.props.onChange(newValue,changeType);
  },

  getValue: function () {
    return this.props.value;
  },

  setMonth: function (date) {
    this.changeValue({
      mode: "month",
      from: moment.utc(date).startOf('month'),
      to: moment.utc(date).endOf('month')
    },"select");
  },

  changeMinStayDays: function (value) {
    if (value > this.getValue().maxStayDays) {
      return;
    }
    this.changeValue({
      mode: "timeToStay",
      minStayDays: value,
      maxStayDays: this.getValue().maxStayDays
    }, "dragged");
  },

  changeMaxStayDays: function (value) {
    if (value < this.getValue().minStayDays) {
      return;
    }
    this.changeValue({
      mode: "timeToStay",
      minStayDays: this.getValue().minStayDays,
      maxStayDays: value
    }, "dragged");
  },

  releaseMinStayDays: function () {
    // do not change value, but trigger it with different change type
    this.changeValue(null, "release");
  },
  releaseMaxStayDays: function () {
    this.changeValue(null, "release");
  },

  confirmTimeToStay: function () {
    this.changeValue(this.props.value, "select");
  },


  renderSingle: function () {
    return (
      React.createElement(CalendarFrame, {onChange: this.changeValue, value: this.getValue(), minValue: this.props.minValue, selectionMode: "single", calendarsNumber: 1})
    )
  },
  renderInterval: function () {
    return (
      React.createElement(CalendarFrame, {onChange: this.changeValue, value: this.getValue(), minValue: this.props.minValue, selectionMode: "interval", calendarsNumber: 3})
    )
  },
  renderMonth: function () {
    return (React.createElement(MonthMatrix, {minValue: this.props.minValue, onSet: this.setMonth, totalMonths: "6"}));
  },
  renderTimeToStay: function () {
    var headline = tr("Stay time from %s to %s days.", "stay_time_from", [this.getValue().minStayDays, this.getValue().maxStayDays] );
    return (
      React.createElement("div", {className: "time-to-stay"}, 
        React.createElement("div", {className: "content-headline"}, headline), 
        React.createElement(Slider, {step: 1, minValue: 0, maxValue: 31, value: this.getValue().minStayDays, onRelease: this.releaseMinStayDays, onChange: this.changeMinStayDays, className: "slider sliderMin horizontal-slider"}, 
          React.createElement(Handle, null)
        ), 
        React.createElement(Slider, {step: 1, minValue: 0, maxValue: 31, value: this.getValue().maxStayDays, onRelease: this.releaseMaxStayDays, onChange: this.changeMaxStayDays, className: "slider sliderMax horizontal-slider"}, 
          React.createElement(Handle, null)
        ), 
        React.createElement("div", {className: "slider-axe"}), 
        React.createElement("div", {className: "btn confirm-time-to-stay-button", onClick: this.confirmTimeToStay}, React.createElement(Tran, {tKey: "ok"}, "OK"))
      )
    );
  },
  renderAnytime: function() {
    return "";
  },
  renderNoReturn: function() {
    return "";
  },
  render: function() {
    var mode = this.state.viewMode;
    return (
      React.createElement("div", {className: 'search-date-picker search-picker '+mode}, 
         this.renderMenu(), 
        React.createElement("div", {className: "content"}, 
           this.renderBody() 
        ), 
        React.createElement("div", {className: "clear-both"})
      )
    );
  }
});


module.exports = DatePicker;

},{"./../../../components/Tran.jsx":"C:\\www\\skypicker-components\\modules\\components\\Tran.jsx","./../../../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../../../mixins/ModalMenuMixin.jsx":"C:\\www\\skypicker-components\\modules\\mixins\\ModalMenuMixin.jsx","./../../../tools/isIE.js":"C:\\www\\skypicker-components\\modules\\tools\\isIE.js","./../../../tools/tr.js":"C:\\www\\skypicker-components\\modules\\tools\\tr.js","./CalendarFrame.jsx":"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\CalendarFrame.jsx","./MonthMatrix.jsx":"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\MonthMatrix.jsx","./Slider.js":"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\Slider.js"}],"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\MonthMatrix.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var moment = (window.moment);
var Tran = require('./../../../components/Tran.jsx');

var MonthMatrix = React.createClass({displayName: "MonthMatrix",

  setMonth: function (month) {
    var self = this;
    return function () {
      self.props.onSet(month);
    }
  },
  render: function() {
    var self = this;
    var months = [];
    var iMonth = moment.utc();
    for (var i = 0; i < parseInt(self.props.totalMonths,10); i++) {
      months.push( moment.utc(iMonth) );
      iMonth.add(1, "months");
    }
    var monthsElements = months.map(function (month) {
      return (
        React.createElement("div", {key: month.valueOf(), className: "month-option", onClick: self.setMonth(month)}, 
          React.createElement("span", {className: "month-name"}, 
             month.format("MMMM") 
          ), 
          React.createElement("br", null), 
          React.createElement("span", {className: "month-year"}, 
             month.format("YYYY") 
          )
        )
      );
    });

    return ( //onMouseLeave={ this.props.onLeave }
      React.createElement("div", {className: "month-matrix"}, 
        React.createElement("div", {className: "content-headline"}, React.createElement(Tran, {tKey: "select_month"}, "Select month")), 
        React.createElement("div", {className: "months"}, 
          monthsElements
        )
      )
    );
  }
});

module.exports = MonthMatrix;

},{"./../../../components/Tran.jsx":"C:\\www\\skypicker-components\\modules\\components\\Tran.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\SelectDaysInWeek.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var Tran = require('./../../../components/Tran.jsx');

var SelectDaysInWeek = React.createClass({displayName: "SelectDaysInWeek",

  render: function() {
    return ( //onMouseLeave={ this.props.onLeave }
      React.createElement("label", null, 
        "Tue", 
        React.createElement("input", {type: "checkbox", name: "flyDays[]", value: "2", checked: "\"checked\""}), 
        React.createElement("span", null)
      )
    );
  }
});

module.exports = SelectDaysInWeek;

},{"./../../../components/Tran.jsx":"C:\\www\\skypicker-components\\modules\\components\\Tran.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\components\\Slider.js":[function(require,module,exports){
"use strict";
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else if (typeof exports === 'object') {
    //TODO get it back when require from another bundle will work
    //module.exports = factory(require('react'));
    module.exports=factory(window.React);
  } else {
    root.ReactSlider = factory(root.React);
  }
}(this, function(React) {

  var ReactSlider = React.createClass({ displayName: 'ReactSlider',

    propTypes: {
      minValue: React.PropTypes.number,
      maxValue: React.PropTypes.number,
      step: React.PropTypes.number,
      orientation: React.PropTypes.oneOf(['horizontal', 'vertical']),
      onChange: React.PropTypes.func,
      onRelease: React.PropTypes.func,
      valuePropName: React.PropTypes.string
    },

    getDefaultProps: function() {
      return {
        minValue: 0,
        maxValue: 100,
        value: 0,
        step: 1,
        orientation: 'horizontal',
        valuePropName: 'sliderValue'
      };
    },

    componentDidMount: function() {
      this.setState({
        mounted: true
      })
    },

    getInitialState: function() {
      return {
        mounted: false
      };
    },

    getPositions: function () {
      if (!this.state.mounted) {
        return {
          upperBound: 0,
          handleWidth: 0,
          sliderMin: 0,
          sliderMax: 0
        };
      }
      var slider = this.refs.slider.getDOMNode();
      var handle = this.refs.handle.getDOMNode();
      var rect = slider.getBoundingClientRect();

      var size = {
        horizontal: 'clientWidth',
        vertical: 'clientHeight'
      }[this.props.orientation];

      var position = {
        horizontal: { min: 'left', max: 'right' },
        vertical: { min: 'top', max: 'bottom' }
      }[this.props.orientation];
      var upperBound = slider[size] - handle[size];

      this.cachedPositions = {
        upperBound: upperBound,
        handleWidth: handle[size],
        sliderMin: rect[position.min],
        sliderMax: rect[position.max] - handle[size]
      };
      return this.cachedPositions;
    },

    getOffset: function () {
      var ratio = (this.props.value - this.props.minValue) / (this.props.maxValue - this.props.minValue);
      return ratio * this.getPositions().upperBound;
    },

    render: function() {
      var handleStyle = {
        //transform: 'translate' + this._axis() + '(' +  + 'px)',
        marginLeft: this.getOffset() + 'px',
        // let this element be the same size as its children.
        display: 'inline-block'
      };

      var userHandle = this.props.children;
      userHandle.props[this.props.valuePropName] = this.props.value;

      return (
        React.DOM.div({ ref: 'slider', className: this.props.className, onClick: this._onClick },
          React.DOM.div({ ref: 'handle', style: handleStyle, onMouseDown: this._dragStart, onTouchMove: this._touchMove },
            userHandle
          )));
    },

    _onClick: function(e) {
      var position = e['page' + this._axis()];
      this._moveHandle(position);
    },

    _dragStart: function() {
      document.addEventListener('mousemove', this._dragMove, false);
      document.addEventListener('mouseup', this._dragEnd, false);
    },

    _dragMove: function(e) {
      var position = e['page' + this._axis()];
      this._moveHandle(position);
    },

    _dragEnd: function() {
      document.removeEventListener('mousemove', this._dragMove, false);
      document.removeEventListener('mouseup', this._dragEnd, false);
      this.props.onRelease();
    },

    _touchMove: function(e) {
      var last = e.changedTouches[e.changedTouches.length - 1];
      var position = last['page' + this._axis()];
      this._moveHandle(position);
      e.preventDefault();
    },

    _moveHandle: function(position) {

      // make center of handle appear under the cursor position
      var positions = this.getPositions();
      position = position - (positions.handleWidth / 2);

      var lastValue = this.props.value;

      var ratio = (position - positions.sliderMin) / (positions.sliderMax - positions.sliderMin);
      var value = ratio * (this.props.maxValue - this.props.minValue) + this.props.minValue;

      var nextValue = this._trimAlignValue(value);

      var changed = nextValue !== lastValue;

      if (changed && this.props.onChange) {
        this.props.onChange(nextValue);
      }
    },

    _axis: function() {
      return {
        'horizontal': 'X',
        'vertical': 'Y'
      }[this.props.orientation];
    },

    _trimAlignValue: function(val) {
      if (val <= this.props.minValue) val = this.props.minValue;
      if (val >= this.props.maxValue) val = this.props.maxValue;

      var valModStep = (val - this.props.minValue) % this.props.step;
      var alignValue = val - valModStep;

      if (Math.abs(valModStep) * 2 >= this.props.step) {
        alignValue += (valModStep > 0) ? this.props.step : (- this.props.step);
      }

      return parseFloat(alignValue.toFixed(5));
    }

  });

  return ReactSlider;

}));

},{}],"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\GroupedResults.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var SearchFormStore = require('../../stores/SearchFormStore.jsx');
var flightsAPI = require('../../APIs/FlightsAPI.jsx');
var OptionsStore  = require('./../../stores/OptionsStore.jsx');
var PriceGroup = require('./components/PriceGroup.jsx');


var priceGroupKey = function(priceGroup)  {return priceGroup.price+"_"+priceGroup.isReturn;};

module.exports = React.createClass({
  displayName: "GroupedResults",

  getInitialState: function () {
    return {
      priceGroups: []
    };
  },
  /* group journeys by price */
  groupJourneys: function (journeys) {
    var priceGroupsIndex = {};
    journeys.forEach(function(journey)  {
      var index = ""+journey.getPrice()+"_"+journey.isReturn();
      if (!priceGroupsIndex[index]) {
        priceGroupsIndex[index] = {
          price: journey.getPrice(),
          isReturn: journey.isReturn(),
          journeys: []
        };
      }
      priceGroupsIndex[index].journeys.push(journey);
    });
    return Object.keys(priceGroupsIndex).map(function(key)  {
      return priceGroupsIndex[key];
    }).sort(function(a, b)  {
      return a.price > b.price ? 1 : -1
    });
  },

  findPreselectedJourney: function (journeys, id) {
    var preselectedJourney = null;
    journeys.forEach(function(journey)  {
      if (journey.getId() == id) {
        preselectedJourney = journey;
      }
    });
    return preselectedJourney;
  },

  findPreselectedGroup: function (groups, journeyToFind) {
    var preselectedGroup = null;
    groups.forEach(function(group)  {
      group.journeys.forEach(function(journey)  {
        if (journeyToFind == journey) {
          preselectedGroup = group;
        }
      })
    });
    return preselectedGroup;
  },

  loadFlights: function () {
    this.setState({
      loading: true
    });
    var promise = flightsAPI.findFlights({
      origin: SearchFormStore.data.origin,
      destination: SearchFormStore.data.destination,
      outboundDate: SearchFormStore.data.dateFrom,
      inboundDate: SearchFormStore.data.dateTo,
      passengers: SearchFormStore.data.passengers
    });
    promise.then(function(journeys)  {
      if (promise != this.lastPromise) return;
      var preselectedJourney = this.findPreselectedJourney(journeys, this.props.preselectedId);
      var priceGroups = this.groupJourneys(journeys);
      var preselectedGroup = this.findPreselectedGroup(priceGroups, preselectedJourney);
      this.toScroll = true;
      this.setState({
        priceGroups: priceGroups,
        preselectedJourney: preselectedJourney,
        preselectedGroup: preselectedGroup,
        loading: false
      });
    }.bind(this)).catch(function(err)  {
      //TODO nicer error handling
      console.error(err, err.stack);
    });
    this.lastPromise = promise;
  },

  componentDidUpdate: function() {
    if (this.toScroll) {
      var thisNode = this.getDOMNode();
      if (this.state.preselectedJourney && this.state.preselectedGroup) {
        var groupNode = this.refs[priceGroupKey(this.state.preselectedGroup)].getDOMNode();
        var rect = groupNode.getBoundingClientRect();
        thisNode.scrollTop = rect.top - 300 /* magic constant :) just move it a little bit higher */;
      } else {
        thisNode.scrollTop = 0;
      }
      this.toScroll = false;
    }
  },

  componentDidMount: function() {
    SearchFormStore.events.on("search", function(type)  {
      this.loadFlights();
    }.bind(this))
  },

  render: function() {
    var loader = "";
    if (this.state.loading) {
      loader = React.createElement("div", {className: "grouped-results--loading"}, React.createElement("i", {className: "fa fa-spinner fa-spin"}))
    }
    //TODO loader should not be in scrollable area - move it to common wrap and scroll only results
    return (
      React.createElement("div", {className: "grouped-results"}, 
        loader, 
        React.createElement("div", {ref: "scroll"}, 
          this.state.priceGroups.map(function(priceGroup)  {
            //TODO pass state.preselectedJourney into group - also just for
            return (
              React.createElement(PriceGroup, {
                preselected: (this.state.preselectedGroup === priceGroup)?this.state.preselectedJourney:null, 
                ref: priceGroupKey(priceGroup), 
                key: priceGroupKey(priceGroup), 
                priceGroup: priceGroup, 
                affilId: this.props.affilId
              }
              )
            )
          }.bind(this))
        )
      )
    );
  }
});


},{"../../APIs/FlightsAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\FlightsAPI.jsx","../../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./components/PriceGroup.jsx":"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\PriceGroup.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\DateFormat.jsx":[function(require,module,exports){
"use strict";
module.exports = React.createClass({
  displayName: "DateFormat",
  render: function () {
    var local = this.props.dateInPlace.get("local");
    var utc = this.props.dateInPlace.get("utc");
    var title = "In UTC time: " + utc.format("LLL");
    return (
      React.createElement("span", {title: title}, React.createElement("strong", null, local.format("MMM D")), " ", local.format("ddd"), " ", React.createElement("strong", null, local.format("LT")))
    )
  }
});

},{}],"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\LinkButton.jsx":[function(require,module,exports){
"use strict";
var Translate = require("./../../../components/Translate.jsx");
var Price = require("./../../../components/Price.jsx");

var LinkButton = React.createClass({displayName: "LinkButton",
  render: function () {
    var sharedJourney = this.props.sharedJourney;
    var baseUrl = "https://en.skypicker.com/booking"; //TODO change it
    if (sharedJourney) {
      var url = baseUrl + "?flightsId=" + sharedJourney.get("id") + "&price=" + sharedJourney.getPrice();
      return (
        React.createElement("a", {href: url, className: "btn"}, React.createElement(Translate, {tKey: "result.book_flight_for"}, "Book flight for"), " ", React.createElement(Price, null, sharedJourney.getPrice()))
      );
    } else {
      var id = this.props.selected.get("outbound").master.getId() + "|" +  this.props.selected.get("inbound").master.getId()
      var url = baseUrl + "?flightsId=" + id;
      return (
        React.createElement("a", {href: url, className: "btn"}, "Check price and book flight")
      );
    }
  }
});

module.exports = LinkButton;

},{"./../../../components/Price.jsx":"C:\\www\\skypicker-components\\modules\\components\\Price.jsx","./../../../components/Translate.jsx":"C:\\www\\skypicker-components\\modules\\components\\Translate.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\PriceGroup.jsx":[function(require,module,exports){
"use strict";
var TripInfo = require("./TripInfo.jsx");
var Immutable = require("immutable");
var MasterSlavePair = require("./../../../containers/flights/MasterSlavesPair.jsx");
var Map = Immutable.Map;
var Price = require("./../../../components/Price.jsx");
var Translate = require("./../../../components/Translate.jsx");

var LinkButton = require("./LinkButton.jsx");

/*
 Master - Slave logic
 Because i wanted to somehow connect multiple journeys into common groups with same price i made this logic
 I make pairs for with directions outbound and inbound. I make pairs where outbound is master and inbound is slave and also opposite pairs.
 Slaves are all trips which ale possible to connect with master trip.
 In each slave is reference to Journey which is common with master.
 If there is not common Journey to both selected trips, it is not possible get price. To prevent this, there is two options:
 1) Split to more groups (this should be now implemented)
 2) Do not show price and let user to check it in booking
 3) Disable bad combinations



  pair = MasterSlavePair
  selected = Map({
    outbound: MasterSlavePair
    inbound: MasterSlavePair
  })
  merged = {
    inbounds: [MasterSlavePair,...]
    outbounds: [MasterSlavePair,...]
  }
 */

var oppositeDirection = function(direction)  {return direction == "outbound" ? "inbound" : "outbound";};


module.exports = React.createClass({
  displayName: "PriceGroup",

  getInitialState: function () {
    var merged = this.mergeTrips(this.props.priceGroup.journeys);
    var selected = this.firstSelected(Map(), merged);
    if (!selected.get("outbound").get("oneWay") && !this.isInCounterpart(selected.get("inbound"), selected.get("outbound"))) {
      selected = this.firstFromPairSelected(selected,merged,"outbound");
    }

    return {
      merged: merged,
      selected: selected
    }
  },

  selectFunc: function (pair, direction) {
    return function()  {
      var selected = this.state.selected.set(direction, pair);
      if (!pair.get("oneWay") && !this.isInCounterpart(pair, selected.get(oppositeDirection(direction)))) {
        selected = this.firstFromPairSelected(selected, this.state.merged, direction);
      }
      this.setState({
        selected: selected
      })
    }.bind(this)
  },

  firstFromPairSelected:function(selected, merged, changedDirection) {
    var changingDirection = changedDirection == "outbound" ? "inbound" : "outbound";
    var pair = selected.get(changedDirection);
    if (pair.get("oneWay")) {
      return selected;
    } else {
      var newSelected = selected;
      merged[changingDirection+"s"].forEach(function(checkingPair)  {
        if (checkingPair.master.getId() ==  pair.slaves.first().get("trip").getId()) {
          newSelected = newSelected.set(changingDirection,checkingPair);
        }
      });
      return newSelected
    }
  },

  firstSelected: function (selected, merged) {
    var preselected = this.props.preselected;
    if (preselected) {
      merged.outbounds.forEach(function(pair)  {
        if (pair.hasJourney(preselected)) {
          selected = selected.set("outbound", pair);
        }
      });
      merged.inbounds.forEach(function(pair)  {
        if (pair.hasJourney(preselected)) {
          selected = selected.set("inbound", pair);
        }
      });
      return selected
    } else {
      return selected
        .set("outbound",merged.outbounds[0])
        .set("inbound",merged.inbounds[0])
    }
  },

  mergeTrips: function () {
    return {
      outbounds: this.sortPairsByDate(this.mergeTripsToPairs(this.props.priceGroup.journeys, "outbound")),
      inbounds: this.sortPairsByDate(this.mergeTripsToPairs(this.props.priceGroup.journeys, "inbound"))
    }
  },

  sortPairsByDate: function (pairs) {
    return pairs.sort(function(a, b)  {
      if (a.master.getDeparture().get("when").get("local") > b.master.getDeparture().get("when").get("local")) {
        return 1;
      } else {
        return -1;
      }
    })
  },

  mergeTripsToPairs: function (journeys, masterDirection) {
    var slaveDirection = masterDirection == "outbound" ? "inbound" : "outbound";
    var pairs = {};
    journeys.forEach(function(journey)  {
      if (journey.isReturn()) {
        //Returns
        var id = journey.get("trips").get(masterDirection).getId();
        if (!pairs[id]) {
          pairs[id] = new MasterSlavePair({
            master: journey.get("trips").get(masterDirection),
            oneWay: false
          });
        }
        pairs[id] = pairs[id].updateIn(["slaves"], function(slaves)  {
          return slaves.push(Map({
            trip: journey.trips.get(slaveDirection),
            journey: journey
          }))
        });
      } else {
        //One ways
        if (journey.get("trips").get(masterDirection)) {
          var id = journey.get("trips").get(masterDirection).getId();
          pairs[id] = new MasterSlavePair({
            master: journey.get("trips").get(masterDirection),
            journey: journey ,
            oneWay: true
          });
        }
      }

    });
    return Object.keys(pairs).map(function(key)  {return pairs[key];});
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.priceGroup != this.props.priceGroup) {
      var merged = this.mergeTrips(newProps.priceGroup.journeys);
      this.setState({
        merged: merged,
        selected: this.firstSelected(this.state.selected, merged)
      });
    }
  },

  findSharedJourney:function(outbound, inbound) {
    if (outbound.get("oneWay")) {
      return outbound.get("journey");
    }
    var sharedJourney = null;
    outbound.get("slaves").forEach(function(outboundsSlaveInbound)  {
      inbound.get("slaves").forEach(function(inboundsSlaveOutbound)  {
        if (outboundsSlaveInbound.get("journey") == inboundsSlaveOutbound.get("journey")) {
          sharedJourney = outboundsSlaveInbound.get("journey");
        }
      })
    });
    return sharedJourney;
  },

  isInCounterpart:function(thisPair,oppositePair) {
    var thisId = thisPair.get("master").getId();
    var isThere = false;
    oppositePair.get("slaves").forEach(function(slave)  {
      if (thisId == slave.get("trip").getId()) {
        isThere = true;
      }
    });
    return isThere;
  },

  //isInCounterpart(thisMaster,thisDirection) {
  //  var thisId = thisMaster.getId();
  //  var thatDirection = thisDirection == "outbound" ? "inbound" : "outbound";
  //  var isThere = false;
  //  this.state.selected.get(thatDirection).slaves.forEach((slave) => {
  //    if (thisId == slave.get("trip").getId()) {
  //      isThere = true;
  //    }
  //  });
  //  return isThere;
  //},
  renderLeg: function (direction) {

    return (
      React.createElement("div", {className: "legs-content"}, 
        this.state.merged[direction+"s"].map(function(pair)  {
          var id = pair.get("master").getId();
          var selected = false;
          if (this.state.selected.get(direction)) {
            selected = id == this.state.selected.get(direction).master.getId();
          }
          if (pair.get("oneWay")) {
            return (
              React.createElement(TripInfo, {
                selected: selected, 
                key: "oneway-"+id, 
                onSelect: this.selectFunc(pair,direction), 
                trip: pair.get("master")
              }
              )
            )
          } else {
            var oppositePair = this.state.selected.get(oppositeDirection(direction));
            return (
              React.createElement(TripInfo, {
                selected: selected, 
                hidden: !this.isInCounterpart(pair, oppositePair), 
                key: direction+"-"+id, 
                onSelect: this.selectFunc(pair,direction), 
                trip: pair.get("master")
              }
              )
            )
          }
        }.bind(this))
      )
    )
  },
  renderInbounds: function () {
    return (
      React.createElement("div", {className: "inbound-legs"}, 
        React.createElement("div", {className: "legs-header"}, 
          React.createElement(Translate, {tKey: "result.return"})
        ), 
        React.createElement("div", {className: "legs-body"}, 
          this.renderLeg("inbound")
        )
      )
    )
  },
  renderOutbounds: function (isReturn) {
    var headerText = "";
    if (isReturn) {
      headerText = React.createElement(Translate, {tKey: "result.departure"})
    }
    return (
      React.createElement("div", {className: "outbound-legs"}, 
        React.createElement("div", {className: "legs-header"}, 
          headerText
        ), 
        React.createElement("div", {className: "legs-body"}, 
          this.renderLeg("outbound")
        )
      )
    )
  },
  render: function () {
    var price = this.props.priceGroup.price;
    var isReturn = this.props.priceGroup.isReturn;
    var sharedJourney = this.findSharedJourney(this.state.selected.get("outbound"), this.state.selected.get("inbound"));
    return (
      React.createElement("div", {className: "price-group" + (this.props.preselected?" preselected":"")}, 
        React.createElement("div", {className: "price-group--header"}, React.createElement(Price, null, price)), 
        this.renderOutbounds(isReturn), 
        isReturn?this.renderInbounds():"", 
        React.createElement("div", {className: "price-group--footer"}, 
          React.createElement(LinkButton, {
            sharedJourney: sharedJourney, 
            groupPrice: price, 
            selected: this.state.selected, 
            affilId: this.props.affilId
          }
          )
        )
      )
    )
  }
});

},{"./../../../components/Price.jsx":"C:\\www\\skypicker-components\\modules\\components\\Price.jsx","./../../../components/Translate.jsx":"C:\\www\\skypicker-components\\modules\\components\\Translate.jsx","./../../../containers/flights/MasterSlavesPair.jsx":"C:\\www\\skypicker-components\\modules\\containers\\flights\\MasterSlavesPair.jsx","./LinkButton.jsx":"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\LinkButton.jsx","./TripInfo.jsx":"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\TripInfo.jsx","immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\TripDetails.jsx":[function(require,module,exports){
"use strict";
var DateFormat = require('./DateFormat.jsx');
var Translate = require('./../../../components/Translate.jsx');

module.exports = React.createClass({
  displayName: "TripDetails",
  renderFlights: function () {
    var trip = this.props.trip;
    return trip.flights.map(function(flight)  {
      return (
        React.createElement("div", {className: "trip-details--flight"}, 
          React.createElement("div", {className: "field departure"}, 
            React.createElement(DateFormat, {dateInPlace: flight.getDeparture().get("when")}), 
            React.createElement("br", null), 
            React.createElement("strong", null, flight.getDeparture().getIn(["where", "name"])), " (", flight.getDeparture().getIn(["where", "code"]), ")"
          ), 

          React.createElement("div", {className: "field duration"}, Math.floor(flight.getDuration().asHours()), "h ", trip.getDuration().minutes(), "min"), 
          React.createElement("div", {className: "field arrival"}, 
            React.createElement(DateFormat, {dateInPlace: flight.getArrival().get("when")}), 
            React.createElement("br", null), 
            React.createElement("strong", null, flight.getArrival().getIn(["where", "name"])), " (", flight.getArrival().getIn(["where", "code"]), ")"
          ), 

          React.createElement("div", {className: "field other-info"}, 
            React.createElement(Translate, {tKey: "common.airline"}), ": ", flight.getIn(["airline", "code"])
          )
        )
      )
    }).toJS();

  //TODO add stop info
    /*
     <p class="booking--flight--stop--info">
     <i class="icon fa fa-clock-o"></i>
     <%== $.t('booking.global.stop', {
     city: '<strong>' + placeNames.attr(flight.attr('src')) + '</strong>',
     time: '<strong>' + flight.stopDuration + '</strong>'
     }) %>

     <% if (flight.stopOvernight) { %>
     <br>
     <i class="icon fa fa-moon-o"></i>
     <%== $.t('booking.global.stopOvernight') %>
     <% } %>

     </p>
     */
  },
  render: function () {
    return (
      React.createElement("div", {className: "trip-details"}, 
        this.renderFlights()
      )
    )
  }
});

},{"./../../../components/Translate.jsx":"C:\\www\\skypicker-components\\modules\\components\\Translate.jsx","./DateFormat.jsx":"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\DateFormat.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\TripInfo.jsx":[function(require,module,exports){
"use strict";
var TripDetails = require('./TripDetails.jsx');
var DateFormat = require('./DateFormat.jsx');
var Translate = require('./../../../components/Translate.jsx');

module.exports = React.createClass({
  displayName: "TripInfo",
  getInitialState: function () {
    return {
      details: false
    }
  },
  select: function () {
    this.props.onSelect(this.props.trip);
  },
  toggleDetails: function (e) {
    e.stopPropagation();
    this.setState({
      details: !this.state.details
    })
  },
  render: function () {
    var className = "trip-info";
    var trip = this.props.trip;
    var stops;
    if (trip.getStops() >= 1) {
      stops = React.createElement(Translate, {tKey: "result.stops", values:  {stops: trip.getStops()} });
    } else {
      stops = React.createElement(Translate, {tKey: "common.direct_flight"});
    }
    if (this.props.selected) {
      className += " selected";
    }
    if (this.props.hidden) {
      className += " not-available";
    }

    var circleClass;
    if (this.props.selected) {
      circleClass = "fa fa-dot-circle-o";
    } else {
      circleClass = "fa fa-circle-o";
    }

    var details = "";
    if (this.state.details) {
      details = React.createElement(TripDetails, {trip: this.props.trip})
    }
    return (
      React.createElement("div", {className: className, onClick: this.select}, 
        React.createElement("div", {className: "fields"}, 
          React.createElement("div", {className: "field radio"}, React.createElement("i", {className: circleClass})), 
          React.createElement("div", {className: "field departure-date"}, React.createElement(DateFormat, {dateInPlace: trip.getDeparture().get("when")})), 
          React.createElement("div", {className: "field departure"}, trip.getDeparture().getIn(["where", "code"])), 
          React.createElement("div", {className: "field duration"}, Math.floor(trip.getDuration().asHours()), "h ", trip.getDuration().minutes(), "min"), 
          React.createElement("div", {className: "field arrival-date"}, React.createElement(DateFormat, {dateInPlace: trip.getArrival().get("when")})), 
          React.createElement("div", {className: "field arrival"}, trip.getArrival().getIn(["where", "code"])), 
          React.createElement("div", {className: "field stops"}, stops), 
          React.createElement("div", {className: "field details", onClick: this.toggleDetails}, React.createElement(Translate, {tKey: "result.details"}), " ", React.createElement("i", {className: "fa "+ (this.state.details ? "fa-caret-up" : "fa-caret-down")}))
        ), 
        details
      )
    )
  }
});

},{"./../../../components/Translate.jsx":"C:\\www\\skypicker-components\\modules\\components\\Translate.jsx","./DateFormat.jsx":"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\DateFormat.jsx","./TripDetails.jsx":"C:\\www\\skypicker-components\\modules\\modules\\GroupedResults\\components\\TripDetails.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\MapOverlay.jsx":[function(require,module,exports){
"use strict";
var LabelsLayer = require('./components/LabelsLayer.jsx');
var PointsLayer = require('./components/PointsLayer.jsx');
var PointsSVGLayer = require('./components/PointsSVGLayer.jsx');
var MouseClickLayer = require('./components/MouseClickLayer.jsx');
var MapLabelsStore = require('./../../stores/MapLabelsStore.jsx');

var MapOverlay = function (map) {
  this.map = map;
  this.setMap(map);
};

function flatBounds(bounds) {
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();
  return {
    wLng: sw.lng(),
    eLng: ne.lng(),
    sLat: sw.lat(),
    nLat: ne.lat()
  }
}

function addPointsLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayLayer.appendChild(div);
  div.className = "overlay-container";
  return React.render(React.createFactory(PointsLayer)(), div);
}

function addPointsSVGLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayLayer.appendChild(div);
  div.className = "overlay-container";
  return React.render(React.createFactory(PointsSVGLayer)(), div);
}

function addLabelsLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayLayer.appendChild(div);
  div.className = "overlay-container";
  return React.render(React.createFactory(LabelsLayer)(), div);
}

function addMouseClickLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayMouseTarget.appendChild(div);
  div.className = "overlay-container";
  return React.render(React.createFactory(MouseClickLayer)(), div);
}



MapOverlay.prototype = new google.maps.OverlayView();

MapOverlay.prototype.onAdd = function () {
  var panes = this.getPanes();
  addPointsSVGLayer(panes, this.map);
  addLabelsLayer(panes, this.map);
  addMouseClickLayer(panes, this.map);

  google.maps.event.addListener(this.map, 'zoom_changed', function() {
    var overlayProjection = this.getProjection();
    var bounds = flatBounds(this.map.getBounds());
    MapLabelsStore.setMapData(bounds, overlayProjection.fromLatLngToDivPixel.bind(overlayProjection));
  }.bind(this));

  google.maps.event.addListener(this.map, 'idle', function() {
    var overlayProjection = this.getProjection();
    var bounds = flatBounds(this.map.getBounds());
    MapLabelsStore.setMapData(bounds, overlayProjection.fromLatLngToDivPixel.bind(overlayProjection));
  }.bind(this));
};

//May be used later:

MapOverlay.prototype.draw = function () {
  //Do nothing, but it has to be here
};

MapOverlay.prototype.onRemove = function () {
  //Do nothing, but it has to be here
};

module.exports = MapOverlay;

},{"./../../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./components/LabelsLayer.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\LabelsLayer.jsx","./components/MouseClickLayer.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\MouseClickLayer.jsx","./components/PointsLayer.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PointsLayer.jsx","./components/PointsSVGLayer.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PointsSVGLayer.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\LabelsLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var PlaceLabel = require('./PlaceLabel.jsx');
var MapLabelsStore = require('../../../stores/MapLabelsStore.jsx');
var LabelsLayer = React.createClass({displayName: "LabelsLayer",

  getInitialState: function () {
    return {
      labels: []
    }
  },

  componentDidMount: function () {
    MapLabelsStore.events.on("change", function()  {
      this.setState({
        labels: MapLabelsStore.getLabels()
      });
    }.bind(this));
  },

  renderPlaces: function () {
    var labels = this.state.labels;
    return labels.map(function(label)  {
      return (React.createElement(PlaceLabel, {key: label.mapPlace.place.id, label: label}))
    })
  },
  render: function () {
    return (
      React.createElement("div", {className: "labels-overlay map-overlay"}, 
        this.renderPlaces()
      )
    )
  }

});


module.exports = LabelsLayer;

},{"../../../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./PlaceLabel.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PlaceLabel.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\MapLoader.jsx":[function(require,module,exports){
"use strict";
var PureRenderMixin = (window.React).addons.PureRenderMixin;
var MapPlacesStore = require('./../../../stores/MapPlacesStore.jsx');
var Translate = require('./../../../components/Translate.jsx');

module.exports = React.createClass({displayName: "exports",

  mixins: [PureRenderMixin],

  getInitialState: function () {
    return {
      loading: false
    }
  },

  componentDidMount: function () {
    MapPlacesStore.events.on("change", function()  {
      this.setState({
        loading: MapPlacesStore.loading
      });
    }.bind(this));
  },

  render: function () {
    var className = "map-loader";
    if (this.state.loading) {
      className += " map-loader-loading";
    }
    return (
      React.createElement("div", {className: "map-loader-wrapper"}, 
        React.createElement("div", {className: className}, 
          React.createElement("span", null, React.createElement(Translate, {tKey: "map.loading_map_prices"}, "Loading map prices"), " ", React.createElement("i", {className: "spinner fa fa-spinner fa-spin"}))
        )
      )
    )
  }
});

},{"./../../../components/Translate.jsx":"C:\\www\\skypicker-components\\modules\\components\\Translate.jsx","./../../../stores/MapPlacesStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesStore.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\MouseClickLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);

var MouseClickTile = require('./MouseClickTile.jsx');
var MapLabelsStore = require('../../../stores/MapLabelsStore.jsx');
var MouseClickLayer = React.createClass({displayName: "MouseClickLayer",

  getInitialState: function () {
    return {
      labels: []
    }
  },

  componentDidMount: function () {
    MapLabelsStore.events.on("change", function()  {
      this.setState({
        labels: MapLabelsStore.getLabels()
      })
    }.bind(this));
  },

  renderPoints: function () {
    var labels = this.state.labels;
    return labels.map(function(label)  {

      return React.createElement(MouseClickTile, {label: label, key: label.mapPlace.place.id + "label"})
    })
  },
  render: function () {
    return (
      React.createElement("div", {className: "mouse-clicks-overlay map-overlay"}, 
        this.renderPoints()
      )
    )
  }
});

module.exports = MouseClickLayer;

},{"../../../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./MouseClickTile.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\MouseClickTile.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\MouseClickTile.jsx":[function(require,module,exports){
"use strict";
var SearchFormStore = require('./../../../stores/SearchFormStore.jsx');
var MapLabelsStore = require('./../../../stores/MapLabelsStore.jsx');
var SearchPlace = require('./../../../containers/SearchPlace.jsx');
var PureRenderMixin = (window.React).addons.PureRenderMixin;

var MouseClickTile = React.createClass({displayName: "MouseClickTile",

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
      React.createElement("div", {ref: "tile", className: "mouse-click-field", style: style})
    )
  }
});

module.exports = MouseClickTile;

},{"./../../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./../../../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PlaceLabel.jsx":[function(require,module,exports){
"use strict";
var PureRenderMixin = (window.React).addons.PureRenderMixin;
var Price = require('./../../../components/Price.jsx');

var PlaceLabel = React.createClass({displayName: "PlaceLabel",

  mixins: [PureRenderMixin],

  render: function () {
    var label = this.props.label;
    var mapPlace = label.mapPlace;
    var style = {
      top: label.position.y,
      left: label.position.x
    };
    var fullLabel;
    var price;
    var labelText = mapPlace.place.shortName;
    var className = "city-label";
    var flagText = "";
    if (mapPlace.price && mapPlace.flag != "origin") {
      var priceStyle = {};
      //if (!window.COLORS_LIGHTNESS) {
      //  window.COLORS_LIGHTNESS = 35;
      //}
      //HUE
      //priceStyle.color = "hsla("+parseInt( (1-this.props.label.relativePrice) *115)+", 100%, "+window.COLORS_LIGHTNESS+"%, 1)";
      //LIGHTNESS
      //priceStyle.color = "hsla(115, 100%, "+parseInt( (1-this.props.label.relativePrice) *40)+"%, 1)";
      //SATURATION
      //priceStyle.color = "hsla(115, "+parseInt( (1-this.props.label.relativePrice)*(1-this.props.label.relativePrice)*(1-this.props.label.relativePrice)*(1-this.props.label.relativePrice)*(1-this.props.label.relativePrice) *100)+"%, "+window.COLORS_LIGHTNESS+"%, 1)";
      price = React.createElement("span", {className: "city-label-price", style: priceStyle}, React.createElement(Price, null, mapPlace.price))
    } else {
      style.marginTop = 2;
    }

    if (mapPlace.flag == "origin") {
      //flagText = <span className="flag-text">From: </span>;
      className += " flag-"+mapPlace.flag;
      style.marginTop = price ? -9 : -2;
    } else if (mapPlace.flag == "destination") {
      //flagText = <span className="flag-text">To: </span>;
      className += " flag-"+mapPlace.flag;
      style.marginTop = price ? -9 : -2;
    }

    if (mapPlace.flag) {
      style.zIndex = 2;
    } else if (label.hover) {
      style.zIndex = 3;
    } else {
      style.zIndex = 1;
    }
    if (label.showFullLabel || mapPlace.flag || label.hover) {
      fullLabel = (
        React.createElement("div", null, 
          React.createElement("span", {className: "city-label-title"}, labelText), React.createElement("br", null), 
          price
        )
      );
    }

    return (
      React.createElement("div", {ref: "label", style: style, className: className}, 
        fullLabel
      )
    )
  }
});


module.exports = PlaceLabel;

},{"./../../../components/Price.jsx":"C:\\www\\skypicker-components\\modules\\components\\Price.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\Point.jsx":[function(require,module,exports){
"use strict";
var PureRenderMixin = (window.React).addons.PureRenderMixin;

var Point = React.createClass({displayName: "Point",

  mixins: [PureRenderMixin],

  render: function () {
    var image = "x";
    var mapPlace = this.props.label.mapPlace;
    var style = {
      top: this.props.label.position.y,
      left: this.props.label.position.x
    };

    if (this.props.label.showFullLabel) {
      image = React.createElement("img", {style: style, src: "/images/markers/city.png"})
    } else {
      image = React.createElement("img", {style: style, src: "/images/markers/citySmall.png"})
    }

    if (this.props.label.hover) {
      image = React.createElement("img", {style: style, src: "/images/markers/cityWithPrice.png"})
    }

    if (mapPlace.flag == "origin") {
      image = React.createElement("img", {style: style, src: "/images/markers/cityWithPrice.png"})
    }
    if (mapPlace.flag == "destination") {
      image = React.createElement("img", {style: style, src: "/images/markers/cityWithPrice.png"})
    }

    return image
  }
});


module.exports = Point;

},{}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PointSVG.jsx":[function(require,module,exports){
"use strict";
var PureRenderMixin = (window.React).addons.PureRenderMixin;

var Point = React.createClass({displayName: "Point",

  mixins: [PureRenderMixin],

  render: function () {
    var size = 16;
    var color;
    var mapPlace = this.props.label.mapPlace;

    if (this.props.label.showFullLabel) {
      size = 16
    } else {
      size = 8
    }

    if (this.props.label.hover) {
      color = "#4cbd5f";
      size = this.props.label.showFullLabel ? 18 : 12
    } else {
      if (this.props.label.mapPlace.price) {
        color = "#2D75CD";
      } else {
        color = "#999999";
      }
    }

    if (mapPlace.flag == "origin") {
      color = "#bd4c4c";
      size = this.props.label.showFullLabel ? 18 : 12
    }
    if (mapPlace.flag == "destination") {
      color = "#4cbd5f";
      size = this.props.label.showFullLabel ? 18 : 12
    }

    var style = {
      top: this.props.label.position.y - size/2,
      left: this.props.label.position.x - size/2,
      position: "absolute"
    };





    return (
      React.createElement("svg", {height: size, width: size, style: style}, 
        React.createElement("circle", {cx: size/2, cy: size/2, r: size/2, fill: "#ddd"}), 
        React.createElement("circle", {cx: size/2, cy: size/2, r: (size/2)-1, fill: "#fff"}), 
        React.createElement("circle", {cx: size/2, cy: size/2, r: (size)/4, fill: color})
      )
    )
  }
});


module.exports = Point;

},{}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PointsLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var MapLabelsStore = require('../../../stores/MapLabelsStore.jsx');
var Point = require('./Point.jsx');


var PointsLayer = React.createClass({displayName: "PointsLayer",

  getInitialState: function () {
    return {
      labels: []
    }
  },

  componentDidMount: function () {
    MapLabelsStore.events.on("change", function()  {
      this.setState({
        labels: MapLabelsStore.getLabels()
      });
    }.bind(this));
  },

  renderPoints: function () {
    var labels = this.state.labels;
    return labels.map(function(label)  {
      return (React.createElement(Point, {key: label.mapPlace.place.id, label: label}))
    })
  },
  render: function () {
    return (
      React.createElement("div", {className: "points-overlay map-overlay"}, 
        this.renderPoints()
      )
    )
  }

});


module.exports = PointsLayer;

},{"../../../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./Point.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\Point.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PointsSVGLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var MapLabelsStore = require('../../../stores/MapLabelsStore.jsx');
var PointSVG = require('./PointSVG.jsx');


var PointsLayer = React.createClass({displayName: "PointsLayer",

  getInitialState: function () {
    return {
      labels: []
    }
  },

  componentDidMount: function () {
    MapLabelsStore.events.on("change", function()  {
      this.setState({
        labels: MapLabelsStore.getLabels()
      });
    }.bind(this));
  },

  renderPoints: function () {
    var labels = this.state.labels;
    return labels.map(function(label)  {
      return (React.createElement(PointSVG, {key: label.mapPlace.place.id, label: label}))
    })
  },
  render: function () {
    return (
      React.createElement("div", {className: "points-svg-overlay map-overlay"}, 
        this.renderPoints()
      )
    )
  }

});


module.exports = PointsLayer;

},{"../../../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./PointSVG.jsx":"C:\\www\\skypicker-components\\modules\\modules\\Map\\components\\PointSVG.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\PlacePickerModal.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var ModalPicker = require("./../../components/ModalPicker.jsx");
var PlacePicker = require("./components/PlacePicker.jsx");
var SearchPlace = require("./../../containers/SearchPlace.jsx");
var deepmerge = require('deepmerge');

var defaultOptions = {
  initialValue: new SearchPlace(),
  locale: "en",
  sizes: {
    all: {width: 600, height: 200},
    nearby: {width: 600, height: 200},
    cheapest: {width: 600, height: 200},
    citiesAndAirports: {width: 600, height: 200},
    countries: {width: 600, height: 200},
    anywhere: {width: 169, height: 200},
    radius: {width: 169, height: 200}
  },
  modes: {
    "all": {},
    "nearby": {},
    "cheapest": {},
    "citiesAndAirports": {},
    "countries": {},
    "anywhere": {},
    "radius": {}
  }
};

var PlacePickerModal = React.createClass({displayName: "PlacePickerModal",
  getOptions: function() {
    return deepmerge(defaultOptions,this.props.options);
  },
  getDefaultProps: function () {
    return {
      options: {}
    }
  },
  getInitialState: function() {
    return {
      contentSize: {width: 169, height: 200}
    };
  },
  onValueChange: function (value, changeType) {
    this.props.onChange(value, changeType);
  },
  onSizeChange: function (sizes) {
    this.setState({
      contentSize: sizes
    });
  },
  render: function() {
    var options = deepmerge(defaultOptions,this.getOptions());
    if (!this.props.shown) {return (React.createElement("div", null))}
    return (
      React.createElement(ModalPicker, {contentSize: this.state.contentSize, inputElement: this.props.inputElement, onHide: this.props.onHide}, 
        React.createElement(PlacePicker, {value: this.props.value, ref: "placePicker", onChange: this.onValueChange, sizes: options.sizes, modes: options.modes, onSizeChange: this.onSizeChange}
        )
      )
    )
  }

});


module.exports = PlacePickerModal;


},{"./../../components/ModalPicker.jsx":"C:\\www\\skypicker-components\\modules\\components\\ModalPicker.jsx","./../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./components/PlacePicker.jsx":"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\components\\PlacePicker.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js"}],"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\components\\PlacePicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var testShit = null;

var React = (window.React);
React.initializeTouchEvents(true);
var tr = require('./../../../tools/tr.js');

var Places = require('./Places.jsx');
var ModalMenuMixin = require('./../../../mixins/ModalMenuMixin.jsx');
var Place = require('./../../../containers/Place.jsx');
var SearchPlace = require('./../../../containers/SearchPlace.jsx');
var Radius = require('./../../../containers/Radius.jsx');

var airportsAndCitiesTypes = [Place.TYPE_CITY, Place.TYPE_AIRPORT];
var countryTypes = [Place.TYPE_COUNTRY];

var PlacePicker = React.createClass({displayName: "PlacePicker",
  mixins: [ModalMenuMixin],
  getInitialState: function() {
    return {
      viewMode: this.getDefaultMode()
    };
  },

  getDefaultProps: function() {
    return {
      value: null,
      lang: 'en'
    };
  },

  getDefaultMode: function () {
    //FIRST VERSION - ALL AND COUNTRIES

    //if (this.props.value.mode != "text" || this.props.value.isDefault) {
    //  return "countries";
    //} else {
    //  return "all";
    //}

    //SECOND VERSION

    //if (this.props.value.mode == "place") {
    //  return "all";
    //} else if (this.props.value.mode == "text") {
    //  return "all";
    //} else if (this.props.value.mode == "anywhere") {
    //  return "anywhere";
    //} else if (this.props.value.mode == "radius") {
    //  return "radius";
    //} else {
    //  return "all";
    //}

    //THIRD VERSION
    if (this.props.value.formMode) {
      return this.props.value.formMode;
    } else {
      return "all";
    }

  },

  componentDidMount: function () {
    var mode = this.state.viewMode;
    this.props.onSizeChange(this.props.sizes[mode]);
  },

  //TODO move it to options
  getModeLabel: function (mode) {
    var modeLabels = {
      all: tr("All places","all_places"),
      nearby: tr("Nearby","nearby"),
      cheapest: tr("Cheapest","cheapest"),
      citiesAndAirports: tr("Cities and airports","cities_and_airports"),
      countries: tr("Countries","countries"),
      anywhere: tr("Anywhere","anywhere"),
      radius: tr("Radius search","radius_search")
    };
    return modeLabels[mode];
  },

  switchModeTo: function (mode) {
    if (mode == "radius") {
      this.props.onChange(new SearchPlace({mode: "radius", value: new Radius()}), "selectRadius");
    } else if (mode == "anywhere") {
      this.selectValue(new SearchPlace({mode: "anywhere"}));
    } else {
      this.props.onChange(this.props.value, "changeMode");
    }

    this.props.onSizeChange(this.props.sizes[mode]);
    this.setState({
      viewMode: mode
    });
  },

  switchModeToFunc: function (mode) {
    return function()  {
      this.switchModeTo(mode)
    }.bind(this)
  },

  checkMode: function () {
    if (this.props.value.mode == "text" && !this.props.value.isDefault) {
      if (this.state.viewMode != "all") {
        this.switchModeTo("all");
      }
    }
  },

  componentDidUpdate: function (nextProps, nextState) {
    if (nextProps.value != this.props.value) {
      this.checkMode();
    }
  },

  selectValue: function (value) {
    if (!value) {
      value = this.props.value; //if new value is null it meant i want to keep the same, it behaves as it was selected
    }
    this.props.onChange(value.set("formMode",this.state.viewMode), "select");
  },

  renderAll: function () {
    return React.createElement(Places, {search: this.props.value, onSelect: this.selectValue});
  },

  renderNearby: function () {
    return React.createElement(Places, {search: this.props.value, onSelect: this.selectValue, nearby: true});
  },

  renderCheapest: function () {
    return (React.createElement("div", null, "sss"))
  },

  renderCitiesAndAirports: function () {
    return React.createElement(Places, {search: this.props.value, onSelect: this.selectValue, types: airportsAndCitiesTypes});
  },

  renderCountries: function () {
    return React.createElement(Places, {search: this.props.value, onSelect: this.selectValue, types: countryTypes});
  },

  renderAnywhere: function () {
    return (React.createElement("div", null))
  },

  renderRadius: function () {
    return (React.createElement("div", null))
  },

  render: function() {
    var mode = this.state.viewMode;
    return (
      React.createElement("div", {className: 'search-place-picker search-picker '+mode}, 
         this.renderMenu(), 
        React.createElement("div", {className: "content"}, 
           this.renderBody() 
        ), 
        React.createElement("div", {className: "clear-both"})
      )
    );
  }
});


module.exports = PlacePicker;

},{"./../../../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../../../containers/Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx","./../../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../../mixins/ModalMenuMixin.jsx":"C:\\www\\skypicker-components\\modules\\mixins\\ModalMenuMixin.jsx","./../../../tools/tr.js":"C:\\www\\skypicker-components\\modules\\tools\\tr.js","./Places.jsx":"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\components\\Places.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\components\\PlaceRow.jsx":[function(require,module,exports){
"use strict";

var PlaceRow = React.createClass({displayName: "PlaceRow",
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
      React.createElement("div", {className: className, onClick: this.click}, 
        React.createElement("span", {className: "name"}, 
          place.getName()
        ), 
        React.createElement("span", {className: "type"}, 
          place.getType()
        )
      )
    )
  }
});
 module.exports = PlaceRow;

},{}],"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\components\\Places.jsx":[function(require,module,exports){
"use strict";
var PlacesAPI = require('./../../../APIs/PlacesAPICached.jsx');
var PlaceRow = require('./PlaceRow.jsx');
var Geolocation = require('./../../../tools/Geolocation.jsx');
var SearchPlace = require('./../../../containers/SearchPlace.jsx');
var OptionsStore = require('./../../../stores/OptionsStore.jsx');
var Place = require('./../../../containers/Place.jsx');
function findPos(obj) {
  var curtop = 0;
  if (obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return [curtop];
  }
}

var Places = React.createClass({displayName: "Places",

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
      e.preventDefault();
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
    if (this.state.keySelectedIndex >= 0) {
      this.select(this.state.places[this.state.keySelectedIndex]);
    } else {
      this.moveNext();
    }
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

  componentDidUpdate: function () {
    this.checkNewPlaces();
    this.adjustScroll();
  },

  filterPlacesByType: function (places , types) {
    if (types) {
      return places.filter(function(place)  {
        return types.indexOf(place.getTypeId()) != -1;
      });
    } else {
      return places;
    }
  },

  //TODO refactore - nearby should be separate from text
  setSearch: function () {
    var placeSearch = this.makeSearchParams();
    var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});
    this.setState({
      loading: true,
      searchText: placeSearch
    });
    var callFuncParam;

    callFuncParam = placesAPI.findPlaces(placeSearch);

    callFuncParam.then(function(places)  {
      if (placeSearch != this.state.searchText || !this.isMounted()) {
        return;
      }
      places = this.filterPlacesByType(places, this.props.types);

      if (placeSearch.typeID === Place.TYPE_COUNTRY) {
        places = places.concat().sort(function(a, b)  { //.concat() is here to make copy of array
          return (b.value < a.value)? 1 : -1
        });
      } else {
        places = places.slice(0,50);
      }

      this.setState({
        places: places,
        apiError: false,
        loading: false
      });
    }.bind(this)).catch(function(error)  {
      console.error(error);
      this.setState({
        places: [],
        apiError: true,
        loading: false
      });
    }.bind(this));
  },

  select: function (value) {
    this.props.onSelect( new SearchPlace({mode: "place", value: value}) );
  },

  moveNext: function (value) {
    this.props.onSelect(null, "next");
  },

  getSearchText: function () {
    if (this.props.search.mode == "text" && !this.props.search.isDefault) {
      return this.props.search.getText();
    } else {
      return "";
    }
  },

  makeSearchParams: function () {
    var params = {};
    if (this.props.nearby) {
      params.bounds = Geolocation.getCurrentBounds();
    } else {
      params.term = this.getSearchText();
    }
    if (this.props.types && this.props.types.length == 1) {
      params.typeID = this.props.types[0];
    }
    return params;
  },

  checkNewPlaces: function () {
    var searchText = this.getSearchText();
    if (this.state.lastSearch !== searchText || this.state.lastTypes != this.props.types || this.state.lastNearby != this.props.nearby) {
      this.setSearch();
      this.setState({
        lastSearch: searchText,
        lastTypes: this.props.types,
        lastNearby: this.props.nearby,
        keySelectedIndex: -1
      });
    }
  },


  renderPlaces: function () {
    var places = this.state.places;
    var selected = places[this.state.keySelectedIndex];
    return places.map(function(place)  {
      if (selected == place) {
        return (React.createElement(PlaceRow, {ref: "selectedPlace", selected: selected == place, onSelect: this.select, place: place}))
      } else {
        return (React.createElement(PlaceRow, {onSelect: this.select, place: place}))
      }
    }.bind(this));
  },

  render: function () {
    var loaderClass = "loader " + (this.state.loading ? "loading" : "not-loading");
    var noResultsClass = "no-results";
    if (!this.state.loading && this.state.places.length == 0) {
      noResultsClass += " shown"
    }
    return (
      React.createElement("div", null, 
        React.createElement("div", {className: loaderClass}, "Loading..."), 
        React.createElement("div", {className: noResultsClass}, "No results"), 
        React.createElement("div", {ref: "places", className: "places"}, 
          this.renderPlaces()
        )
      )
    )
  }

});


module.exports = Places;

},{"./../../../APIs/PlacesAPICached.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx","./../../../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./../../../tools/Geolocation.jsx":"C:\\www\\skypicker-components\\modules\\tools\\Geolocation.jsx","./PlaceRow.jsx":"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\components\\PlaceRow.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\SearchForm\\SearchForm.jsx":[function(require,module,exports){
"use strict";

var DatePickerModal = require('./../DatePicker/DatePickerModal.jsx');
var PlacePickerModal = require('./../PlacePicker/PlacePickerModal.jsx');


var SearchFormStore = require('./../../stores/SearchFormStore.jsx');

var SearchDate = require('./../../containers/SearchDate.jsx');
var SearchPlace = require('./../../containers/SearchPlace.jsx');
var tr = require('./../../tools/tr.js');
var Tran = require('./../../components/Tran.jsx');
var ToggleActive = require('./components/ToggleActive.jsx');
var PassengersField = require('./components/PassengersField.jsx');

var moment = (window.moment);

var options = {
  origin: {
    modes: {
      all: true,
      nearby: true,
      cheapest: false,
      citiesAndAirports: false,
      countries: true,
      anywhere: false,
      radius: true
    }
  },
  destination: {
    modes: {
      all: true,
      nearby: false,
      cheapest: false,
      citiesAndAirports: false,
      countries: true,
      anywhere: true,
      radius: true
    }
  },
  dateFrom: {
    modes: {
      single: true,
      interval: true,
      month: true,
      timeToStay: false,
      anytime: true,
      noReturn: false
    }
  },
  dateTo: {
    modes: {
      single: true,
      interval: true,
      month: true,
      timeToStay: true,
      anytime: true,
      noReturn: true
    }
  }
};


var SearchForm = React.createClass({displayName: "SearchForm",

  getInitialState: function() {
    return {
      active: (typeof this.props.defaultActive == "undefined")? "origin" : this.props.defaultActive,
      data: SearchFormStore.data
    };
  },
  getDefaultProps: function() {

  },
  createModalContainer: function (fieldName) {
    var div = document.createElement('div');
    div.setAttribute('class', 'modal-container-element');
    //WHERE TO APPEND IT?
    this.refs[fieldName+"Outer"].getDOMNode().appendChild(div);
    return div;
  },

  changeListener: function () {
    this.setState({
      data: SearchFormStore.data
    })
  },

  componentWillMount: function() {
    SearchFormStore.events.on('change', this.changeListener);
  },
  componentWillUnmount: function () {
    SearchFormStore.events.removeListener('change', this.changeListener);
  },
  componentDidMount: function() {

  },

  componentDidUpdate: function (prevProps, prevState) {
    this.refreshFocus();

    //Complete previous field
    if (this.state.active != prevState.active) {
      if (prevState.active == "origin" || prevState.active == "destination") {
        SearchFormStore.completeField(prevState.active);
      }
    }
  },

  getFormattedValue: function (fieldName) {
    var value = this.state.data[fieldName];
    if (!value) return "";
    if (fieldName == "origin" || fieldName == "destination") {
      return value.getText();
    } else {
      return value.format();
    }
  },

  nextField: function () {

    var order = [
      "origin",
      "destination",
      "dateFrom",
      "dateTo",
      "submitButton"
    ];
    var newActive;
    if (this.state.active) {
      var index = order.indexOf(this.state.active);
      var newIndex;
      if (index >= 0 && index <= 3) {
        newActive = order[index+1];
      } else if (index == 4) {
        //TODO focus on search btn
        newActive = null;
      } else {
        newActive = null;
      }
    } else {
      newActive = "origin";
    }
    this.setState({
      active: newActive
    });
  },
  changeValueFunc: function (fieldName) {
    return function(value, changeType)  {
      if (changeType == "changeMode") {
        //this.refs[fieldName].getDOMNode().focus();
        //TODO return here???
      }
      if (changeType == "select") {
        this.nextField();
      } else if (changeType == "selectRadius") {
        this.setState({
          active: null
        });
      }
      SearchFormStore.setValue(this.state.data.changeField(fieldName, value), changeType);

    }.bind(this)
  },

  onFocusFunc: function (fieldName) {
    return function()  {
      this.setState({
        active: fieldName
      });
      var value = this.state.data[fieldName];
      if (value.mode != "text" || value.isDefault) {
        this.refs[fieldName].getDOMNode().select();
      }
    }.bind(this)
  },

  changeTextFunc: function (fieldName) {
    if (fieldName == "origin" || fieldName == "destination") {
      return function(e)  {
        var addState = {};
        SearchFormStore.setValue(this.state.data.changeField(fieldName, new SearchPlace(e.target.value)), "changeText");
        this.setState(addState);
      }.bind(this)
    } else {
      return function()  {};
    }
  },

  changePassengers: function (event) {
    var number = event.target.value;
    SearchFormStore.setField("passengers", number, "select");
  },

  toggleActive: function (type) {
    return function()  {
      if (type == this.state.active) {
        this.setState({
          active: ""
        });
      } else {
        this.onFocusFunc(type)();
      }
    }.bind(this)
  },
  onClickInner: function (e) {
    e.stopPropagation();
  },

  onInputKeyDown: function (e) {
    if (e.key == "ArrowUp" || e.key == "ArrowDown"  || e.key == "Enter") {
      e.preventDefault();
    }
  },

  refreshFocus: function () {
    var domNode;
    if (this.state.active) {
      domNode = this.refs[this.state.active].getDOMNode();
      if (document.activeElement != domNode) {
        domNode.focus();
        if (this.state.active != "submitButton") {
          var activeValue = this.state.data[this.state.active];
          if (activeValue.mode != "text" || activeValue.isDefault) {
            domNode.select();
          }
        }
      }
    }
  },

  search: function (e) {
    e.preventDefault();
    SearchFormStore.search();
  },

  getFieldLabel: function (mode) {
    var modeLabels = {
      origin: tr("From","from"),
      destination: tr("To","to"),
      dateFrom: tr("Depart","date"),
      dateTo: tr("Return","return")
    };
    return modeLabels[mode];
  },

  renderModal: function (fieldName) {

    var XPickerModal;
    if (fieldName == "origin" || fieldName == "destination") {
      XPickerModal = PlacePickerModal;
    } else {
      XPickerModal = DatePickerModal;
    }
    var onHide = function()  {
      if (this.state.active == fieldName) {
        this.setState({
          active: ""
        })
      }
    }.bind(this);
    var inputElement = null;
    if (this.refs[fieldName + "Outer"]) {
      inputElement = this.refs[fieldName + "Outer"].getDOMNode();
    }
    return (React.createElement(XPickerModal, {
      inputElement: inputElement, 
      value: this.state.data[fieldName], 
      onHide: onHide, 
      onChange: this.changeValueFunc(fieldName), 
      options: options[fieldName], 
      shown: fieldName == this.state.active}
    ))

  },
  renderInput: function(type) {
    var className = type;
    if (this.state.data[type].error) {
      className += " error"
    }
    if (this.state.data[type].loading) {
      className += " loading"
    }
    return (
      React.createElement("fieldset", {
        className: className, 
        ref: type + "Outer"

      }, 
        React.createElement("div", {ref: type + "Head", className: "head"}, 
          React.createElement("label", {onClick: this.toggleActive(type)}, this.getFieldLabel(type)), 
          React.createElement("span", {className: "input-wrapper"}, 
            React.createElement("input", {
              value: this.getFormattedValue(type), 
              onClick: this.onClickInner, 
              onFocus: this.onFocusFunc(type), 
              onKeyDown: this.onInputKeyDown, 
              type: "text", 
              ref: type, 
              onChange: this.changeTextFunc(type), 
              autoComplete: "off", 
              readOnly: (type == "dateFrom" || type == "dateTo")}
            )
          ), 
          React.createElement("i", {className: "fa fa-spinner"}), 
          React.createElement(ToggleActive, {active: type == this.state.active, onToggle: this.toggleActive(type)})
        ), 
        this.renderModal(type)
      )
    )
  },
  render: function() {
    return (
      React.createElement("form", {id: "search"}, 
        this.renderInput("origin"), 
        this.renderInput("destination"), 
        this.renderInput("dateFrom"), 
        this.renderInput("dateTo"), 
        React.createElement(PassengersField, {onChange: this.changePassengers, value: this.state.data.passengers}), 

        React.createElement("button", {onClick: this.search, id: "search-flights", ref: "submitButton", className: "btn-search"}, React.createElement("span", null, React.createElement(Tran, {tKey: "search"}, "Search")), React.createElement("i", {className: "fa fa-search"}))
      )
    );
  }
});

module.exports = SearchForm;

},{"./../../components/Tran.jsx":"C:\\www\\skypicker-components\\modules\\components\\Tran.jsx","./../../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../../tools/tr.js":"C:\\www\\skypicker-components\\modules\\tools\\tr.js","./../DatePicker/DatePickerModal.jsx":"C:\\www\\skypicker-components\\modules\\modules\\DatePicker\\DatePickerModal.jsx","./../PlacePicker/PlacePickerModal.jsx":"C:\\www\\skypicker-components\\modules\\modules\\PlacePicker\\PlacePickerModal.jsx","./components/PassengersField.jsx":"C:\\www\\skypicker-components\\modules\\modules\\SearchForm\\components\\PassengersField.jsx","./components/ToggleActive.jsx":"C:\\www\\skypicker-components\\modules\\modules\\SearchForm\\components\\ToggleActive.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\SearchForm\\components\\PassengersField.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var Translate = require('./../../../components/Translate.jsx');

module.exports = React.createClass({displayName: "exports",

  componentDidMount:function() {
    //TODO add arrow

    //var toggle = this.refs.toggle.getDOMNode();
    //var passengers = this.refs.passengers.getDOMNode();
    //$(toggle).on('click', () => {
    //  $(passengers).click();
    //});
    //toggle.addEventListener("click", (e) => {
    //  console.debug("click");
    //  var event = new MouseEvent('click', {
    //    'view': window,
    //    'bubbles': true,
    //    'cancelable': true
    //  });
    //  passengers.dispatchEvent(event);
    //});
  },

  //<b ref="toggle" className="toggle">
  //  <i className="fa fa-caret-down"></i>
  //</b>

  render: function() {
    return (
      React.createElement("fieldset", {ref: "typePassengers", className: "passengers"}, 
        React.createElement("div", {className: "head"}, 
          React.createElement("label", {for: "passengers"}, 
            React.createElement("span", null, React.createElement(Translate, {tKey: "emails.common.passengers"}, "Passengers"), ":"), 
            React.createElement("i", {className: "icon fa fa-user"})
          ), 

          React.createElement("div", {className: "passenger-select-wrapper"}, 
            React.createElement("select", {name: "passengers", ref: "passengers", onChange: this.props.onChange, value: this.props.value}, 
              [1,2,3,4,5,6,7,8,9].map(function(num)  {
                return (React.createElement("option", {value: num}, num))
              })
            )
          )
        )
      )
    )
  }
});

},{"./../../../components/Translate.jsx":"C:\\www\\skypicker-components\\modules\\components\\Translate.jsx"}],"C:\\www\\skypicker-components\\modules\\modules\\SearchForm\\components\\ToggleActive.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);

var ToggleActive = React.createClass({displayName: "ToggleActive",
  render: function() {
    var faIconClass = "fa fa-caret-down";
    if (this.props.active) {
      faIconClass = "fa fa-caret-up"
    }
    return (
      React.createElement("b", {className: "toggle", onClick: this.props.onToggle}, 
        React.createElement("i", {className: faIconClass})
      )
    );
  }
});
module.exports = ToggleActive;

},{}],"C:\\www\\skypicker-components\\modules\\plainJsAdapters\\SearchFormAdapter.jsx":[function(require,module,exports){
"use strict";
var SearchForm = require('./../modules/SearchForm/SearchForm.jsx');

/**
 * options.element - element to bind whole search form
 * options.defaultActive - mode which will be activated on init of component - default: "origin", set null to don't show any
 */

  function SearchFormAdapter(options) {"use strict";
    var root = React.createFactory(SearchForm);
    var reactElement = root();
    reactElement.props = options;
    this.modalComponent = React.render(reactElement, options.element);
  }


module.exports = SearchFormAdapter;

},{"./../modules/SearchForm/SearchForm.jsx":"C:\\www\\skypicker-components\\modules\\modules\\SearchForm\\SearchForm.jsx"}],"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx":[function(require,module,exports){
"use strict";
var MapPlacesStore = require('./MapPlacesStore.jsx');
var MapLabel = require('./../containers/MapLabel.jsx');
var EventEmitter = require('events').EventEmitter;
var Quadtree = require('./../tools/quadtree.js');
var Immutable = require('immutable');

function isCollide(a, b) {
  return !(
  ((a.y + a.h) < (b.y)) ||
  (a.y > (b.y + b.h)) ||
  ((a.x + a.w) < b.x) ||
  (a.x > (b.x + b.w))
  );
}


  function MapLabelsStore() {"use strict";
    this.events = new EventEmitter();

    this.labelsBoundsTree = Quadtree.init({
      x: 0,
      y: 0,
      w: 5000, //big enough screen size
      h: 5000,
      maxDepth : 20
    });

    this.labelsIndex = Immutable.Map({});

    MapPlacesStore.events.on("change", function()  {
      this.refreshLabels();
    }.bind(this))
  }

  MapLabelsStore.prototype.setLabelOver=function(label) {"use strict";
    this.hoverLabel = label.edit({hover: true});
    this.labelsIndex = this.labelsIndex.set(label.getId(), this.hoverLabel);
    this.events.emit("change");
  };

  MapLabelsStore.prototype.setLabelOut=function(label) {"use strict";
    this.hoverLabel = null;
    this.labelsIndex = this.labelsIndex.set(label.getId(), label.edit({hover: false}));
    this.events.emit("change");
  };

  MapLabelsStore.prototype.clean=function() {"use strict";
    this.labelsIndex = Immutable.Map({});
    this.events.emit("change");
  };
  /* it just return creates array of labels (cached) */
  MapLabelsStore.prototype.getLabels=function() {"use strict";
    if (this.$MapLabelsStore_lastLabelsIndexReference != this.labelsIndex) {
      this.$MapLabelsStore_lastLabelsIndexReference = this.labelsIndex;
      this.$MapLabelsStore_labels = this.labelsIndex.toArray();
    }
    return this.$MapLabelsStore_labels;
  };
  /**
   * min max price for shown places (labels)
   * @param labels
   * @return {{}}
   */
  MapLabelsStore.prototype.findPriceStatsForLabels=function(labels) {"use strict";
    var res = {};
    labels.forEach(function(label)  {
      var price = label.mapPlace.price;
      if (!res.maxPrice || res.maxPrice < price) res.maxPrice = price;
      if ( (!res.minPrice || res.minPrice > price) && price) res.minPrice = price;
    });
    return res;
  };
  /* !mutates labels */
  MapLabelsStore.prototype.calculateRelativePricesForLabels=function(labels) {"use strict";
    var priceStats = this.findPriceStatsForLabels(labels);
    labels.forEach(function(label)  {
      if (label.mapPlace.price && priceStats.minPrice && priceStats.maxPrice) {
        label.relativePrice = (label.mapPlace.price - priceStats.minPrice) / (priceStats.maxPrice - priceStats.minPrice);
      }
    });
  };
  // mutates mapPlaces array!!!!
  MapLabelsStore.prototype.mapPlacesToLabels=function(mapPlaces, fromLatLngToDivPixel) {"use strict";
    this.labelsBoundsTree.clear();
    if (!mapPlaces || mapPlaces.length <= 0) return [];
    mapPlaces.sort(function(a,b)  {
      if (a.flag && !b.flag) {
        return -1;
      }
      if (!a.flag && b.flag) {
        return 1;
      }

      if (a.price && !b.price) {
        return -1;
      }
      if (!a.price && b.price) {
        return 1;
      }
      if (a.price && b.price) {
        return (a.place.sp_score < b.place.sp_score)? 1 : -1;
      }

      return (a.place.sp_score < b.place.sp_score)? 1 : -1;
    });
    mapPlaces = mapPlaces.slice(0,400);
    var labels = [];


    mapPlaces.forEach(function(mapPlace)  {
      var latLng = new google.maps.LatLng(mapPlace.place.lat, mapPlace.place.lng);
      var position = fromLatLngToDivPixel(latLng);

      var item = {
        x: position.x,
        y: position.y,
        w: 70,
        h: 40
      };

      var collisions = 0;
      this.labelsBoundsTree.retrieve(item, function(checkingItem) {
        if (isCollide(item, checkingItem)) {
          collisions += 1;
        }
      });

      var showFullLabel = false;
      if (collisions == 0) {
        showFullLabel = true;
        item.mapPlace = mapPlace;
        this.labelsBoundsTree.insert(item);
      }

      var label = {
        mapPlace: mapPlace,
        position: position,
        showFullLabel: showFullLabel
      };
      labels.push(label);
    }.bind(this));
    return labels;
  };

  MapLabelsStore.prototype.actualizeLabels=function(plainLabels) {"use strict";
    var stats = {
      newLabels: 0,
      replacesLabels: 0,
      keptLabels: 0
    };
    var newIndex = {};
    plainLabels.forEach(function(plainLabel)  {
      var id = plainLabel.mapPlace.place.id;
      var oldLabel = this.labelsIndex.get(id);
      if (oldLabel) {
        var newLabel = oldLabel.edit(plainLabel);
        if (newLabel != oldLabel) {
          newIndex[id] = newLabel;
          stats.replacesLabels++;
        } else {
          newIndex[id] = oldLabel;
          stats.keptLabels++;
        }
      } else {
        newIndex[id] = new MapLabel(plainLabel);
        stats.newLabels++;
      }
    }.bind(this));
    this.labelsIndex = Immutable.Map(newIndex);
    //console.log("stats: ", stats);
  };

  MapLabelsStore.prototype.refreshLabels=function() {"use strict";
    if (this.latLngBounds && this.fromLatLngToDivPixelFunc) {
      var mapPlaces = MapPlacesStore.getByBounds(this.latLngBounds);
      var plainLabels = this.mapPlacesToLabels(mapPlaces, this.fromLatLngToDivPixelFunc);
      this.calculateRelativePricesForLabels(plainLabels);
      this.actualizeLabels(plainLabels);
      this.events.emit("change");
    }
  };

  MapLabelsStore.prototype.latLngBoundsEqual=function(oldBounds, newBounds) {"use strict";
    if (!oldBounds) return false;
    return oldBounds.wLng == newBounds.wLng && oldBounds.eLng == newBounds.eLng && oldBounds.sLat == newBounds.sLat && oldBounds.nLat == newBounds.nLat;
  };
  MapLabelsStore.prototype.setMapData=function(latLngBounds, fromLatLngToDivPixelFunc) {"use strict";
    if (!this.latLngBoundsEqual(this.latLngBounds, latLngBounds)) {
      this.latLngBounds = latLngBounds;
      this.fromLatLngToDivPixelFunc = fromLatLngToDivPixelFunc;
      this.refreshLabels();
    }
  };

module.exports = new MapLabelsStore();

},{"./../containers/MapLabel.jsx":"C:\\www\\skypicker-components\\modules\\containers\\MapLabel.jsx","./../tools/quadtree.js":"C:\\www\\skypicker-components\\modules\\tools\\quadtree.js","./MapPlacesStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesStore.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js","immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesIndex.jsx":[function(require,module,exports){
"use strict";
var Quadtree = require('./../tools/quadtree.js');

function boundsToSelector(latLngBounds) {
  var bounds = latLngBounds;
  //if map has 180lng view scope than show only the bigger part of shown planet
  if (bounds.eLng - bounds.wLng < 0) {
    // what is more far from zero, it is smaller
    if (Math.abs(bounds.eLng) > Math.abs(bounds.wLng)) {
      bounds.eLng = 180;
    } else {
      bounds.wLng = -180;
    }
  }
  return {
    x: bounds.wLng + 180,
    y: bounds.sLat + 90,
    w: bounds.eLng - bounds.wLng,
    h: bounds.nLat - bounds.sLat
  };
}


/* structure to store mapPlaces and index them by id and by lat lng position */

  function MapPlacesIndex() {"use strict";
    this.mapPlacesIndex = {};
    this.pointsTree = Quadtree.init({
      x: 0,
      y: 0,
      w: 360,
      h: 180,
      maxDepth : 12
    });
  }

  MapPlacesIndex.prototype.getById=function(id) {"use strict";
    if (this.mapPlacesIndex[id]) {
      return this.mapPlacesIndex[id].mapPlace;
    }
  };

  MapPlacesIndex.prototype.getByBounds=function(latLngBounds) {"use strict";
    var treeSelector = boundsToSelector(latLngBounds);
    var mapPlaces = [];
    this.pointsTree.retrieve(treeSelector, function(item) {
      mapPlaces.push(item.mapPlace);
    });
    return mapPlaces;
  };

  MapPlacesIndex.prototype.insertPlaces=function(mapPlaces) {"use strict";
    mapPlaces.forEach(function(mapPlace)  {
      var placeContainer = {
        x: mapPlace.place.lng + 180,
        y: mapPlace.place.lat + 90,
        w: 0.00001,
        h: 0.00001,
        mapPlace: mapPlace
      };
      this.mapPlacesIndex[mapPlace.place.id] = placeContainer;
      this.pointsTree.insert(placeContainer);
    }.bind(this));
  };

  MapPlacesIndex.prototype.cleanPrices=function() {"use strict";
    Object.keys(this.mapPlacesIndex).forEach(function(id)  {
      this.mapPlacesIndex[id].mapPlace = this.mapPlacesIndex[id].mapPlace.set("price", null);
    }.bind(this));
  };
  /**
   * Edit
   * @param mapPlace
   */
  MapPlacesIndex.prototype.editPlace=function(mapPlace) {"use strict";
    var ref = this.mapPlacesIndex[mapPlace.place.id];
    ref.x = mapPlace.place.lng + 180;
    ref.y = mapPlace.place.lat + 90;
    ref.mapPlace = mapPlace;
  };


module.exports = MapPlacesIndex;

},{"./../tools/quadtree.js":"C:\\www\\skypicker-components\\modules\\tools\\quadtree.js"}],"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesStore.jsx":[function(require,module,exports){
"use strict";
var EventEmitter = require('events').EventEmitter;
var MapPlacesIndex = require('./MapPlacesIndex.jsx');
var MapPlace = require('./../containers/MapPlace.jsx');
var SearchFormStore  = require('./../stores/SearchFormStore.jsx');
var OptionsStore  = require('./../stores/OptionsStore.jsx');

var PlacesAPI = require('./../APIs/PlacesAPI.jsx');
var flightsAPI = require('./../APIs/flightsAPI.jsx');
var Place = require('./../containers/Place.jsx');



  function MapPlacesStore() {"use strict";
    this.mapPlacesIndex = new MapPlacesIndex();
    this.events = new EventEmitter();

    SearchFormStore.events.on("change", function(changeType)  {
      if (changeType == "select" || changeType == "selectRadius") {
        //if places are not loaded, i can't load prices, so wait until it is loaded
        if (this.placesAreLoading) {
          //console.log("waiting for load places");
          this.placesAreLoading.then(function()  {
            this.loadPrices();
          }.bind(this))
        } else {
          this.loadPrices();
        }
        this.events.emit("change");
      }
    }.bind(this));
  }

  MapPlacesStore.prototype.compareOrigins=function(a, b) {"use strict";
    if (a.origin && b.origin) {
      if (a.origin.mode == "place" && b.origin.mode == "place")  {
        return a.origin.value.id == b.origin.value.id;
      } else {
        return a.origin == b.origin;
      }
    } else {
      /* both null => true, else => false */
      return !a.origin && !b.origin;
    }
  };

  MapPlacesStore.prototype.compareImportantSearchFormData=function(a, b) {"use strict";
    if (a && b) {
      return this.compareOrigins(a,b) && a.dateFrom == b.dateFrom && a.dateTo == b.dateTo && a.passengers == b.passengers
    } else {
      /* both null => true, else => false */
      return !a && !b;
    }

  };

  MapPlacesStore.prototype.loadPlaces=function() {"use strict";
    var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});
    this.placesAreLoading = placesAPI.findPlaces({typeID: Place.TYPE_CITY}).then(function(places)  {
      var mapPlaces = places.map(function(place)  {
        return new MapPlace({place: place});
      });
      this.mapPlacesIndex.insertPlaces(mapPlaces);
      this.placesAreLoading = null;
      this.events.emit("change");
    }.bind(this));
  };

  MapPlacesStore.prototype.loadPrices=function() {"use strict";
    if (this.compareImportantSearchFormData(this.lastSearchFormData, SearchFormStore.data)) {
      return;
    }
    this.lastSearchFormData = SearchFormStore.data;
    var thisSearchFormData = SearchFormStore.data;

    this.loading = true;
    this.mapPlacesIndex.cleanPrices();
    if (SearchFormStore.data.origin.mode == "place" || SearchFormStore.data.origin.mode == "radius") {
      flightsAPI.findFlights({
        origin: SearchFormStore.data.origin,
        destination: "anywhere",
        outboundDate: SearchFormStore.data.dateFrom,
        inboundDate: SearchFormStore.data.dateTo,
        passengers: SearchFormStore.data.passengers
      }, {format: "original"}).then(function(flights)  {
        if (!this.compareImportantSearchFormData(thisSearchFormData, SearchFormStore.data)) {
          return;
        }
        this.loading = false;
        flights.forEach(function(flight)  {
          var mapPlace = this.mapPlacesIndex.getById(flight.mapIdto);
          if (mapPlace) {
            this.mapPlacesIndex.editPlace(mapPlace.edit({"price":flight.price}));
          }
        }.bind(this));
        this.events.emit("change");
      }.bind(this)).catch(function(err)  {
        //TODO nicer error handling
        console.error(err);
      });
    }
  };

  MapPlacesStore.prototype.getByBounds=function(bounds) {"use strict";
    return this.mapPlacesIndex.getByBounds(bounds).map(function(mapPlace)  {
      if (SearchFormStore.data.origin.mode == "place" && mapPlace.place.id == SearchFormStore.data.origin.value.id) {
        return mapPlace.set("flag","origin");
      } else if (SearchFormStore.data.destination.mode == "place" && mapPlace.place.id == SearchFormStore.data.destination.value.id) {
        return mapPlace.set("flag","destination");
      } else {
        return mapPlace;
      }
    });
  };

module.exports = new MapPlacesStore();

},{"./../APIs/PlacesAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx","./../APIs/flightsAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\flightsAPI.jsx","./../containers/MapPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\MapPlace.jsx","./../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./MapPlacesIndex.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesIndex.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx":[function(require,module,exports){
"use strict";
var EventEmitter = require('events').EventEmitter;
var Options = require('./../containers/Options.jsx');


  function OptionsStore() {"use strict";
    this.events = new EventEmitter();

    //Maximum of listeners - here listens every translation and currency so there is a lot of them, but i hope not more than 1000
    this.events.setMaxListeners(1000);

    this.data = new Options();
  }
  OptionsStore.prototype.setValue=function(value) {"use strict";
    var changed = false;
    if (this.data != value) {
      this.data = value;
      this.events.emit('change');
      changed = true;
    }
    return changed;
  };

  /**
   * Alias for set
   */
  OptionsStore.prototype.setOption=function(key, value) {"use strict";
    return this.set(key, value);
  };

  /**
   * Set one value to given key
   * @param key
   * @param value
   * @return {*}
   */
  OptionsStore.prototype.set=function(key, value) {"use strict";
    return this.setValue(this.data.set(key, value));
  };




module.exports = new OptionsStore();

},{"./../containers/Options.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Options.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx":[function(require,module,exports){
"use strict";
var EventEmitter = require('events').EventEmitter;
var SearchFormData = require('./../containers/SearchFormData.jsx');
var SearchPlace = require('./../containers/SearchPlace.jsx');
var Place = require('./../containers/Place.jsx');
var Q = (window.Q);
var PlacesAPI = require('./../APIs/PlacesAPICached.jsx');
var OptionsStore = require('./OptionsStore.jsx');




var getFirstFromApi = function (text) {
  var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});//TODO put here options
  return placesAPI.findByName(text).then(function(places)  {
    if (places[0]) {
      return new SearchPlace({mode: "place", value: new Place(places[0])});
    } else {
      return new SearchPlace({mode: "text", value: text, error: "notFound"});
    }
  }).catch(function(err)  {
    console.error(err);
  })
};

var findByIdFromApi = function (id) {
  var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});//TODO put here options
  return placesAPI.findById(id).then(function(place)  {
    if (place) {
      return new SearchPlace({mode: "place", value: place});
    } else {
      //switch to text when id not found??
      return new SearchPlace({mode: "text", value: id, error: "notFound"});
    }
  }).catch(function(err)  {
    console.error(err);
  })
};


/* returns promise, promise resolves true if there is new value */
var fetchPlace = function(searchPlace) {
  if (searchPlace.mode == "place" && searchPlace.value.complete) {
    return false; /* don't need to async load */
  } else if (searchPlace.mode == "place") {
    return {
      promise: findByIdFromApi(searchPlace.value.id).then(function(newSearchPlace)  {
        return newSearchPlace.set("formMode", searchPlace.formMode)
      }),
      tempValue: searchPlace.set("loading", true)//new SearchPlace({mode: "place", value: searchPlace.value, loading: true})
    };
  } else if (searchPlace.mode == "text") {
    return {
      promise: getFirstFromApi(searchPlace.value).then(function(newSearchPlace)  {
        return newSearchPlace.set("formMode", searchPlace.formMode)
      }),
      tempValue: searchPlace.set("loading", true)//new SearchPlace({mode: "text", value: searchPlace.value, loading: true})
    };
  }
  return false;
};


  function SearchFormStore() {"use strict";
    this.events = new EventEmitter();
    this.data = new SearchFormData();
  }

  /**
   *
   * @param value
   * @param changeType - type of change - default is "select" which is also most common and for example triggers search on map
   * @return {boolean}
   */
  SearchFormStore.prototype.setValue=function(value, changeType) {"use strict";
    var changed = false;
    if (this.data != value) {
      this.data = value;
      this.events.emit('change',changeType); // change is after all changes
      changed = true;
    }
    return changed;
  };
  SearchFormStore.prototype.setField=function(fieldName, value, changeType) {"use strict";
    return this.setValue(this.data.changeField(fieldName, value), changeType);
  };

  SearchFormStore.prototype.completeField=function(fieldName) {"use strict";
    var fetchInfo = fetchPlace(this.data[fieldName]);
    if (fetchInfo) {
      var $__0=   fetchInfo,promise=$__0.promise,tempValue=$__0.tempValue;
      this.setField(fieldName, tempValue);
      return promise.then(function(finalValue)  {
        /* only if it's is still same value as before, nothing new */
        if (tempValue == this.data[fieldName]) {
          this.setField(fieldName, finalValue);
        }
        return true; //TODO dont know what to return???
      }.bind(this));
    }
    return null;
  };
  SearchFormStore.prototype.triggerSearch=function() {"use strict";
    //TODO check if there is every data ok
    this.events.emit('search');
  };
  /* fetch direction and return data with temp value */
  SearchFormStore.prototype.fetchDirection=function(data, direction) {"use strict";
    var fetchInfo = fetchPlace(data[direction]);
    if (fetchInfo) {
      return {
        promise: fetchInfo.promise.then(function(value)  {
          return {direction:direction,value:value}
        }),
        newData: data.changeField(direction, fetchInfo.tempValue)
      };
    } else {
      return false;
    }
  };
  SearchFormStore.prototype.search=function() {"use strict";
    var promises = [];
    var newTempData = this.data;
    var originLoadingInfo = this.fetchDirection(newTempData, "origin");
    if (originLoadingInfo) {
      promises.push(originLoadingInfo.promise);
      newTempData = originLoadingInfo.newData;
    }
    var destinationLoadingInfo = this.fetchDirection(newTempData, "destination");
    if (destinationLoadingInfo) {
      promises.push(destinationLoadingInfo.promise);
      newTempData = destinationLoadingInfo.newData;
    }
    /* if any of these needs loading save temporary objects */
    if (newTempData != this.data) {
      this.setValue(newTempData);
    }


    if (promises.length > 0) {
      var searchPromise = Q.all(promises);
      this.lastSearchPromise = searchPromise;
      return Q.all(promises).then(function(results)  {
        if (searchPromise != this.lastSearchPromise) return; //if some other search has outran me
        var newData = this.data;
        results.forEach(function(result)  {
          newData = newData.changeField(result.direction, result.value);
        });
        this.setValue(newData);
        this.triggerSearch();
      }.bind(this));
    } else {
      //TODO check if is not needed next tick
      this.triggerSearch();

      //TODO return some promise??
    }

  };

module.exports = new SearchFormStore();

},{"./../APIs/PlacesAPICached.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx","./../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../containers/SearchFormData.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx","./../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\www\\skypicker-components\\modules\\tools\\APIManager.jsx":[function(require,module,exports){
"use strict";

var flightsAPI = require('./../APIs/FlightsAPI.jsx');
var OptionsStore = require('./../stores/OptionsStore.jsx');


  function APIManager() {"use strict";
    OptionsStore.events.on("change", function()  {
      flightsAPI.changeOptions({language: OptionsStore.data.language});
    })
  }


module.exports = new APIManager();

},{"./../APIs/FlightsAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\FlightsAPI.jsx","./../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx"}],"C:\\www\\skypicker-components\\modules\\tools\\DatePairValidator.jsx":[function(require,module,exports){
"use strict";

exports.validate = function(outbound, inbound) {
  if (!outbound) {
    return "outboundNotSelected"
  }
  if (!inbound) {
    return "inboundNotSelected"
  }

  if (inbound.mode == "single" && outbound.mode == "single") {
    if (inbound.getDate().format("YYYYMMDD") < outbound.getDate().format("YYYYMMDD")) {
      return "crossedDates"
    }
  }
  return null;
};


},{}],"C:\\www\\skypicker-components\\modules\\tools\\DateTools.js":[function(require,module,exports){
"use strict";
/*
  Tools for manipulating with dates
  some of them are duplicities to moment's functions, but they can be used as faster alternatives
 */


var pad = function(num, size) {
  var s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
};

var DateTools = {
  today: function() {
    return new Date();
  },
  inHalfAnYear: function() {
    return new Date((new Date()).setMonth(new Date().getMonth() + 6));
  },
  firstDay: function(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },
  lastDay: function(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },
  formatSPApiDate: function(date) {
    return pad(date.getDate(), 2) + "/" + pad(date.getMonth() + 1, 2) + "/" + date.getFullYear();
  },
  formatWADate: function(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1, 2) + "-" + pad(date.getDate(), 2);
  }
};


DateTools.firstDayOfWeek = function() {
  return moment.localeData()._week.dow;
};

module.exports = DateTools;

},{}],"C:\\www\\skypicker-components\\modules\\tools\\Geolocation.jsx":[function(require,module,exports){
"use strict";
var LatLon = require('./latlon.js');
var OptionsStore = require('./../stores/OptionsStore.jsx');


var options = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0
};

function Geolocation(){"use strict";}

  Geolocation.prototype.initBrowser=function() {"use strict";
    //TODO finish
    //navigator.geolocation.getCurrentPosition(function (pos) {
    //  var crd = pos.coords;
    //  console.log('Your current position is:');
    //  console.log('Latitude : ' + crd.latitude);
    //  console.log('Longitude: ' + crd.longitude);
    //  console.log('More or less ' + crd.accuracy + ' meters.');
    //
    //}, function () {
    //  console.warn('ERROR(' + err.code + '): ' + err.message);
    //}, options)
  };
  Geolocation.prototype.getFromMap=function() {"use strict";

  };
  Geolocation.prototype.getFromBrowser=function() {"use strict";

  };
  Geolocation.prototype.getFromCode=function() {"use strict";

  };
  Geolocation.prototype.pointToBounds=function(lat, lon) {"use strict";
    var distance = 300;
    var ll = LatLon(lat,lon);
    return {
      lat_lo: ll.destinationPoint(180, distance).lat,
      lng_lo: ll.destinationPoint(-90, distance).lon,
      lat_hi: ll.destinationPoint(0, distance).lat,
      lng_hi: ll.destinationPoint(90, distance).lon
    }
  };
  Geolocation.prototype.getCurrentBounds=function() {"use strict";
    var center = OptionsStore.data.defaultMapCenter;
    if (center) {
      return this.pointToBounds(center.lat(),center.lng());
    } else {
      return this.pointToBounds(50,15);
    }
  };


module.exports = new Geolocation();

},{"./../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./latlon.js":"C:\\www\\skypicker-components\\modules\\tools\\latlon.js"}],"C:\\www\\skypicker-components\\modules\\tools\\geo.js":[function(require,module,exports){
"use strict";
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy representation conversion functions                       (c) Chris Veness 2002-2014  */
/*   - www.movable-type.co.uk/scripts/latlong.html                                   MIT Licence  */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var lat = Geo.parseDMS('51° 28′ 40.12″ N');                                                 */
/*    var lon = Geo.parseDMS('000° 00′ 05.31″ W');                                                */
/*    var p1 = new LatLon(lat, lon);                                                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';


/**
 * Tools for converting between numeric degrees and degrees / minutes / seconds.
 *
 * @namespace
 */
var Geo = {};


// note Unicode Degree = U+00B0. Prime = U+2032, Double prime = U+2033


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
 * Seconds and minutes may be omitted.
 *
 * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
 * @returns {number} Degrees as decimal number.
 */
Geo.parseDMS = function(dmsStr) {
    // check for signed decimal degrees without NSEW, if so return it directly
    if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);

    // strip off any sign or compass dir'n & split out separate d/m/s
    var dms = String(dmsStr).trim().replace(/^-/,'').replace(/[NSEW]$/i,'').split(/[^0-9.,]+/);
    if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol

    if (dms == '') return NaN;

    // and convert to decimal degrees...
    var deg;
    switch (dms.length) {
        case 3:  // interpret 3-part result as d/m/s
            deg = dms[0]/1 + dms[1]/60 + dms[2]/3600;
            break;
        case 2:  // interpret 2-part result as d/m
            deg = dms[0]/1 + dms[1]/60;
            break;
        case 1:  // just d (possibly decimal) or non-separated dddmmss
            deg = dms[0];
            // check for fixed-width unseparated format eg 0033709W
            //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
            //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
            break;
        default:
            return NaN;
    }
    if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve

    return Number(deg);
};


/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *
 * @private
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toDMS = function(deg, format, dp) {
    if (isNaN(deg)) return null;  // give up here if we can't make a number from deg

    // default values
    if (typeof format == 'undefined') format = 'dms';
    if (typeof dp == 'undefined') {
        switch (format) {
            case 'd':   dp = 4; break;
            case 'dm':  dp = 2; break;
            case 'dms': dp = 0; break;
            default:    format = 'dms'; dp = 0;  // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

    var dms, d, m, s;
    switch (format) {
        default: // invalid format spec!
        case 'd':
            d = deg.toFixed(dp);     // round degrees
            if (d<100) d = '0' + d;  // pad with leading zeros
            if (d<10) d = '0' + d;
            dms = d + '°';
            break;
        case 'dm':
            var min = (deg*60).toFixed(dp);  // convert degrees to minutes & round
            d = Math.floor(min / 60);    // get component deg/min
            m = (min % 60).toFixed(dp);  // pad with trailing zeros
            if (d<100) d = '0' + d;          // pad with leading zeros
            if (d<10) d = '0' + d;
            if (m<10) m = '0' + m;
            dms = d + '°' + m + '′';
            break;
        case 'dms':
            var sec = (deg*3600).toFixed(dp);  // convert degrees to seconds & round
            d = Math.floor(sec / 3600);    // get component deg/min/sec
            m = Math.floor(sec/60) % 60;
            s = (sec % 60).toFixed(dp);    // pad with trailing zeros
            if (d<100) d = '0' + d;            // pad with leading zeros
            if (d<10) d = '0' + d;
            if (m<10) m = '0' + m;
            if (s<10) s = '0' + s;
            dms = d + '°' + m + '′' + s + '″';
        break;
    }

    return dms;
};


/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toLat = function(deg, format, dp) {
    var lat = Geo.toDMS(deg, format, dp);
    return lat===null ? '–' : lat.slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
};


/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toLon = function(deg, format, dp) {
    var lon = Geo.toDMS(deg, format, dp);
    return lon===null ? '–' : lon + (deg<0 ? 'W' : 'E');
};


/**
 * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Geo.toBrng = function(deg, format, dp) {
    deg = (Number(deg)+360) % 360;  // normalise -ve values to 180°..360°
    var brng =  Geo.toDMS(deg, format, dp);
    return brng===null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360°!
};


/**
 * Returns compass point (to given precision) for supplied bearing.
 *
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [precision=3] - Precision (cardinal / intercardinal / secondary-intercardinal).
 * @returns {string} Compass point for supplied bearing.
 *
 * @example
 *   var point = Geo.compassPoint(24);    // point = 'NNE'
 *   var point = Geo.compassPoint(24, 1); // point = 'N'
 */
Geo.compassPoint = function(bearing, precision) {
    if (typeof precision == 'undefined') precision = 3;
    // note precision = max length of compass point; it could be extended to 4 for quarter-winds
    // (eg NEbN), but I think they are little used

    bearing = ((bearing%360)+360)%360; // normalise to 0..360

    var point;

    switch (precision) {
        case 1: // 4 compass points
            switch (Math.round(bearing*4/360)%4) {
                case 0: point = 'N'; break;
                case 1: point = 'E'; break;
                case 2: point = 'S'; break;
                case 3: point = 'W'; break;
            }
            break;
        case 2: // 8 compass points
            switch (Math.round(bearing*8/360)%8) {
                case 0: point = 'N';  break;
                case 1: point = 'NE'; break;
                case 2: point = 'E';  break;
                case 3: point = 'SE'; break;
                case 4: point = 'S';  break;
                case 5: point = 'SW'; break;
                case 6: point = 'W';  break;
                case 7: point = 'NW'; break;
            }
            break;
        case 3: // 16 compass points
            switch (Math.round(bearing*16/360)%16) {
                case  0: point = 'N';   break;
                case  1: point = 'NNE'; break;
                case  2: point = 'NE';  break;
                case  3: point = 'ENE'; break;
                case  4: point = 'E';   break;
                case  5: point = 'ESE'; break;
                case  6: point = 'SE';  break;
                case  7: point = 'SSE'; break;
                case  8: point = 'S';   break;
                case  9: point = 'SSW'; break;
                case 10: point = 'SW';  break;
                case 11: point = 'WSW'; break;
                case 12: point = 'W';   break;
                case 13: point = 'WNW'; break;
                case 14: point = 'NW';  break;
                case 15: point = 'NNW'; break;
            }
            break;
        default:
            throw RangeError('Precision must be between 1 and 3');
    }

    return point;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend Number object with method to  trim whitespace from string
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Geo; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return Geo; }); // AMD

},{}],"C:\\www\\skypicker-components\\modules\\tools\\isIE.js":[function(require,module,exports){
"use strict";
//EnhanceJS isIE test idea

//detect IE and version number through injected conditional comments (no UA detect, no need for cond. compilation / jscript check)

//version arg is for IE version (optional)
//comparison arg supports 'lte', 'gte', etc (optional)

function isIE(version, comparison) {
  var cc      = 'IE',
    b       = document.createElement('B'),
    docElem = document.documentElement,
    isIE;

  if(version){
    cc += ' ' + version;
    if(comparison){ cc = comparison + ' ' + cc; }
  }

  b.innerHTML = '<!--[if '+ cc +']><b id="iecctest"></b><![endif]-->';
  docElem.appendChild(b);
  isIE = !!document.getElementById('iecctest');
  docElem.removeChild(b);
  return isIE;
}

////is it IE?
//isIE();
//
////is it IE6?
//isIE(6);
//
////is it less than or equal to IE 6?
//isIE(7,'lte');

module.exports = isIE;

},{}],"C:\\www\\skypicker-components\\modules\\tools\\latlon.js":[function(require,module,exports){
"use strict";
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts           (c) Chris Veness 2002-2014  */
/*   - www.movable-type.co.uk/scripts/latlong.html                                   MIT Licence  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var Geo = require('./geo'); // CommonJS (Node.js)


/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @classdesc Tools for geodetic calculations
 * @requires Geo
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} [height=0] - Height above mean-sea-level in kilometres.
 * @param {number} [radius=6371] - (Mean) radius of earth in kilometres.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon, height, radius) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon, height, radius);

    if (typeof height == 'undefined') height = 0;
    if (typeof radius == 'undefined') radius = 6371;
    radius = Math.min(Math.max(radius, 6353), 6384);

    this.lat    = Number(lat);
    this.lon    = Number(lon);
    this.height = Number(height);
    this.radius = Number(radius);
}


/**
 * Returns the distance from 'this' point to destination point (using haversine formula).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Distance between this point and destination point, in km (on sphere of 'this' radius).
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // d.toPrecision(4): 404.3
 */
LatLon.prototype.distanceTo = function(point) {
    var R = this.radius;
    var φ1 = this.lat.toRadians(),  λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
};


/**
 * Returns the (initial) bearing from 'this' point to destination point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Initial bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var b1 = p1.bearingTo(p2); // b1.toFixed(1): 156.2
 */
LatLon.prototype.bearingTo = function(point) {
    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();

    // see http://mathforum.org/library/drmath/view/55417.html
    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    var θ = Math.atan2(y, x);

    return (θ.toDegrees()+360) % 360;
};


/**
 * Returns final bearing arriving at destination destination point from 'this' point; the final bearing
 * will differ from the initial bearing by varying degrees according to distance and latitude.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Final bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var b2 = p1.finalBearingTo(p2); // p2.toFixed(1): 157.9
 */
LatLon.prototype.finalBearingTo = function(point) {
    // get initial bearing from destination point to this point & reverse it by adding 180°
    return ( point.bearingTo(this)+180 ) % 360;
};


/**
 * Returns the midpoint between 'this' point and the supplied point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {LatLon} Midpoint between this point and the supplied point.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var pMid = p1.midpointTo(p2); // pMid.toString(): 50.5363°N, 001.2746°E
 */
LatLon.prototype.midpointTo = function(point) {
    // see http://mathforum.org/library/drmath/view/51822.html for derivation

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();

    var Bx = Math.cos(φ2) * Math.cos(Δλ);
    var By = Math.cos(φ2) * Math.sin(Δλ);

    var φ3 = Math.atan2(Math.sin(φ1)+Math.sin(φ2),
             Math.sqrt( (Math.cos(φ1)+Bx)*(Math.cos(φ1)+Bx) + By*By) );
    var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
    λ3 = (λ3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

    return new LatLon(φ3.toDegrees(), λ3.toDegrees());
};


/**
 * Returns the destination point from 'this' point having travelled the given distance on the
 * given initial bearing (bearing normally varies around path followed).
 *
 * @param   {number} brng - Initial bearing in degrees.
 * @param   {number} dist - Distance in km (on sphere of 'this' radius).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0015);
 *     var p2 = p1.destinationPoint(300.7, 7.794); // p2.toString(): 51.5135°N, 000.0983°W
 */
LatLon.prototype.destinationPoint = function(brng, dist) {
    // see http://williams.best.vwh.net/avform.htm#LL

    var θ = Number(brng).toRadians();
    var δ = Number(dist) / this.radius; // angular distance in radians

    var φ1 = this.lat.toRadians();
    var λ1 = this.lon.toRadians();

    var φ2 = Math.asin( Math.sin(φ1)*Math.cos(δ) +
                        Math.cos(φ1)*Math.sin(δ)*Math.cos(θ) );
    var λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),
                             Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
    λ2 = (λ2+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

    return new LatLon(φ2.toDegrees(), λ2.toDegrees());
};


/**
 * Returns the point of intersection of two paths defined by point and bearing.
 *
 * @param   {LatLon} p1 - First point.
 * @param   {number} brng1 - Initial bearing from first point.
 * @param   {LatLon} p2 - Second point.
 * @param   {number} brng2 - Initial bearing from second point.
 * @returns {LatLon} Destination point (null if no unique intersection defined).
 *
 * @example
 *     var p1 = LatLon(51.8853, 0.2545), brng1 = 108.547;
 *     var p2 = LatLon(49.0034, 2.5735), brng2 =  32.435;
 *     var pInt = LatLon.intersection(p1, brng1, p2, brng2); // pInt.toString(): 50.9076°N, 004.5084°E
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
    // see http://williams.best.vwh.net/avform.htm#Intersection

    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();
    var θ13 = Number(brng1).toRadians(), θ23 = Number(brng2).toRadians();
    var Δφ = φ2-φ1, Δλ = λ2-λ1;

    var δ12 = 2*Math.asin( Math.sqrt( Math.sin(Δφ/2)*Math.sin(Δφ/2) +
        Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2) ) );
    if (δ12 == 0) return null;

    // initial/final bearings between points
    var θ1 = Math.acos( ( Math.sin(φ2) - Math.sin(φ1)*Math.cos(δ12) ) /
                        ( Math.sin(δ12)*Math.cos(φ1) ) );
    if (isNaN(θ1)) θ1 = 0; // protect against rounding
    var θ2 = Math.acos( ( Math.sin(φ1) - Math.sin(φ2)*Math.cos(δ12) ) /
                        ( Math.sin(δ12)*Math.cos(φ2) ) );

    var θ12, θ21;
    if (Math.sin(λ2-λ1) > 0) {
        θ12 = θ1;
        θ21 = 2*Math.PI - θ2;
    } else {
        θ12 = 2*Math.PI - θ1;
        θ21 = θ2;
    }

    var α1 = (θ13 - θ12 + Math.PI) % (2*Math.PI) - Math.PI; // angle 2-1-3
    var α2 = (θ21 - θ23 + Math.PI) % (2*Math.PI) - Math.PI; // angle 1-2-3

    if (Math.sin(α1)==0 && Math.sin(α2)==0) return null; // infinite intersections
    if (Math.sin(α1)*Math.sin(α2) < 0) return null;      // ambiguous intersection

    //α1 = Math.abs(α1);
    //α2 = Math.abs(α2);
    // ... Ed Williams takes abs of α1/α2, but seems to break calculation?

    var α3 = Math.acos( -Math.cos(α1)*Math.cos(α2) +
                         Math.sin(α1)*Math.sin(α2)*Math.cos(δ12) );
    var δ13 = Math.atan2( Math.sin(δ12)*Math.sin(α1)*Math.sin(α2),
                          Math.cos(α2)+Math.cos(α1)*Math.cos(α3) );
    var φ3 = Math.asin( Math.sin(φ1)*Math.cos(δ13) +
                        Math.cos(φ1)*Math.sin(δ13)*Math.cos(θ13) );
    var Δλ13 = Math.atan2( Math.sin(θ13)*Math.sin(δ13)*Math.cos(φ1),
                           Math.cos(δ13)-Math.sin(φ1)*Math.sin(φ3) );
    var λ3 = λ1 + Δλ13;
    λ3 = (λ3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

    return new LatLon(φ3.toDegrees(), λ3.toDegrees());
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance travelling from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Distance in km between this point and destination point (on sphere of 'this' radius).
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var d = p1.distanceTo(p2); // d.toPrecision(4): 40.31
 */
LatLon.prototype.rhumbDistanceTo = function(point) {
    // see http://williams.best.vwh.net/avform.htm#Rhumb

    var R = this.radius;
    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = Math.abs(point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);

    // distance is pythagoras on 'stretched' Mercator projection
    var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
    var dist = δ * R;

    return dist;
};


/**
 * Returns the bearing from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var d = p1.rhumbBearingTo(p2); // d.toFixed(1): 116.7
 */
LatLon.prototype.rhumbBearingTo = function(point) {
    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));

    var θ = Math.atan2(Δλ, Δψ);

    return (θ.toDegrees()+360) % 360;
};


/**
 * Returns the destination point having travelled along a rhumb line from 'this' point the given
 * distance on the  given bearing.
 *
 * @param   {number} brng - Bearing in degrees from north.
 * @param   {number} dist - Distance in km (on sphere of 'this' radius).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = p1.rhumbDestinationPoint(116.7, 40.31); // p2.toString(): 50.9641°N, 001.8531°E
 */
LatLon.prototype.rhumbDestinationPoint = function(brng, dist) {
    var δ = Number(dist) / this.radius; // angular distance in radians
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var θ = Number(brng).toRadians();

    var Δφ = δ * Math.cos(θ);

    var φ2 = φ1 + Δφ;
    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2;

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0

    var Δλ = δ*Math.sin(θ)/q;

    var λ2 = λ1 + Δλ;

    λ2 = (λ2 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

    return new LatLon(φ2.toDegrees(), λ2.toDegrees());
};


/**
 * Returns the loxodromic midpoint (along a rhumb line) between 'this' point and second point.
 *
 * @param   {LatLon} point - Latitude/longitude of second point.
 * @returns {LatLon} Midpoint between this point and second point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var p2 = p1.rhumbMidpointTo(p2); // p2.toString(): 51.0455°N, 001.5957°E
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
    // http://mathforum.org/kb/message.jspa?messageID=148837

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();

    if (Math.abs(λ2-λ1) > Math.PI) λ1 += 2*Math.PI; // crossing anti-meridian

    var φ3 = (φ1+φ2)/2;
    var f1 = Math.tan(Math.PI/4 + φ1/2);
    var f2 = Math.tan(Math.PI/4 + φ2/2);
    var f3 = Math.tan(Math.PI/4 + φ3/2);
    var λ3 = ( (λ2-λ1)*Math.log(f3) + λ1*Math.log(f2) - λ2*Math.log(f1) ) / Math.log(f2/f1);

    if (!isFinite(λ3)) λ3 = (λ1+λ2)/2; // parallel of latitude

    λ3 = (λ3 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°

    return new LatLon(φ3.toDegrees(), λ3.toDegrees());
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Returns a string representation of 'this' point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    if (typeof format == 'undefined') format = 'dms';

    return Geo.toLat(this.lat, format, dp) + ', ' + Geo.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}


/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // CommonJS
if (typeof define == 'function' && define.amd) define(['Geo'], function() { return LatLon; }); // AMD

},{"./geo":"C:\\www\\skypicker-components\\modules\\tools\\geo.js"}],"C:\\www\\skypicker-components\\modules\\tools\\quadtree.js":[function(require,module,exports){
"use strict";
/*
 * QuadTree Implementation in JavaScript
 * @author: silflow <https://github.com/silflow>
 *
 * Usage:
 * To create a new empty Quadtree, do this:
 * var tree = QUAD.init(args)
 *
 * args = {
 *    // mandatory fields
 *    x : x coordinate
 *    y : y coordinate
 *    w : width
 *    h : height
 *
 *    // optional fields
 *    maxChildren : max children per node
 *    maxDepth : max depth of the tree
 *}
 *
 * API:
 * tree.insert() accepts arrays or single items
 * every item must have a .x, .y, .w, and .h property. if they don't, the tree will break.
 *
 * tree.retrieve(selector, callback) calls the callback for all objects that are in
 * the same region or overlapping.
 *
 * tree.clear() removes all items from the quadtree.
 */

var QUAD = {}; // global var for the quadtree

QUAD.init = function (args) {

    var node;
    var TOP_LEFT     = 0;
    var TOP_RIGHT    = 1;
    var BOTTOM_LEFT  = 2;
    var BOTTOM_RIGHT = 3;
    var PARENT       = 4;

    // assign default values
    args.maxChildren = args.maxChildren || 2;
    args.maxDepth = args.maxDepth || 4;

    /**
     * Node creator. You should never create a node manually. the algorithm takes
     * care of that for you.
     */
    node = function (x, y, w, h, depth, maxChildren, maxDepth) {

        var items = [], // holds all items
            nodes = []; // holds all child nodes

        // returns a fresh node object
        return {

            x : x, // top left point
            y : y, // top right point
            w : w, // width
            h : h, // height
            depth : depth, // depth level of the node

            /**
             * iterates all items that match the selector and invokes the supplied callback on them.
             */
            retrieve: function(item, callback, instance) {
                for (var i = 0; i < items.length; ++i) {
                   (instance) ? callback.call(instance, items[i]) : callback(items[i]); 
                }
                // check if node has subnodes
                if (nodes.length) {
                    // call retrieve on all matching subnodes
                    this.findOverlappingNodes(item, function(dir) {
                        nodes[dir].retrieve(item, callback, instance);
                    });
                }
            },

            /**
             * Adds a new Item to the node.
             *
             * If the node already has subnodes, the item gets pushed down one level.
             * If the item does not fit into the subnodes, it gets saved in the
             * "children"-array.
             *
             * If the maxChildren limit is exceeded after inserting the item,
             * the node gets divided and all items inside the "children"-array get
             * pushed down to the new subnodes.
             */
            insert : function (item) {

                var i;

                if (nodes.length) {
                    // get the node in which the item fits best
                    i = this.findInsertNode(item);
                    if (i === PARENT) {
                        // if the item does not fit, push it into the
                        // children array
                        items.push(item);
                    } else {
                        nodes[i].insert(item);
                    }
                } else {
                    items.push(item);
                    //divide the node if maxChildren is exceeded and maxDepth is not reached
                    if (items.length > maxChildren && this.depth < maxDepth) {
                        this.divide();
                    }
                }
            },

            /**
             * Find a node the item should be inserted in.
             */
            findInsertNode : function (item) {
                // left
                if (item.x + item.w < x + (w / 2)) {
                    if (item.y + item.h < y + (h / 2)) {
						return TOP_LEFT;
					}
                    if (item.y >= y + (h / 2)) {
						return BOTTOM_LEFT;
					}
                    return PARENT;
                }

                // right
                if (item.x >= x + (w / 2)) {
                    if (item.y + item.h < y + (h / 2)) {
						return TOP_RIGHT;
					}
                    if (item.y >= y + (h / 2)) {
						return BOTTOM_RIGHT;
					}
                    return PARENT;
                }

                return PARENT;
            },

            /**
             * Finds the regions the item overlaps with. See constants defined
             * above. The callback is called for every region the item overlaps.
             */
            findOverlappingNodes : function (item, callback) {
                // left
                if (item.x < x + (w / 2)) {
                    if (item.y < y + (h / 2)) {
						callback(TOP_LEFT);
					}
                    if (item.y + item.h >= y + h / 2) {
						callback(BOTTOM_LEFT);
					}
                }
                // right
                if (item.x + item.w >= x + (w / 2)) {
                    if (item.y < y + (h / 2)) {
						callback(TOP_RIGHT);
					}
                    if (item.y + item.h >= y + h / 2) {
						callback(BOTTOM_RIGHT);
					}
                }
            },

            /**
             * Divides the current node into four subnodes and adds them
             * to the nodes array of the current node. Then reinserts all
             * children.
             */
            divide : function () {
                var width, height, i, oldChildren;
                var childrenDepth = this.depth + 1;
                // set dimensions of the new nodes
                width = (w / 2);
                height = (h / 2);
                // create top left node
                nodes.push(node(this.x, this.y, width, height, childrenDepth, maxChildren, maxDepth));
                // create top right node
                nodes.push(node(this.x + width, this.y, width, height, childrenDepth, maxChildren, maxDepth));
                // create bottom left node
                nodes.push(node(this.x, this.y + height, width, height, childrenDepth, maxChildren, maxDepth));
                // create bottom right node
                nodes.push(node(this.x + width, this.y + height, width, height, childrenDepth, maxChildren, maxDepth));

                oldChildren = items;
                items = [];
                for (i = 0; i < oldChildren.length; i++) {
                    this.insert(oldChildren[i]);
                }
            },

            /**
             * Clears the node and all its subnodes.
             */
            clear : function () {
				var i;
                for (i = 0; i < nodes.length; i++) {
					nodes[i].clear();
				}
                items.length = 0;
                nodes.length = 0;
            },

            /*
             * convenience method: is not used in the core algorithm.
             * ---------------------------------------------------------
             * returns this nodes subnodes. this is usful if we want to do stuff
             * with the nodes, i.e. accessing the bounds of the nodes to draw them
             * on a canvas for debugging etc...
             */
            getNodes : function () {
                return nodes.length ? nodes : false;
            }
        };
    };

    return {

        root : (function () {
            return node(args.x, args.y, args.w, args.h, 0, args.maxChildren, args.maxDepth);
        }()),

        insert : function (item) {

            var len, i;

            if (item instanceof Array) {
                len = item.length;
                for (i = 0; i < len; i++) {
                    this.root.insert(item[i]);
                }

            } else {
                this.root.insert(item);
            }
        },

        retrieve : function (selector, callback, instance) {
            return this.root.retrieve(selector, callback, instance);
        },

        clear : function () {
            this.root.clear();
        }
    };
};

module.exports = QUAD;
},{}],"C:\\www\\skypicker-components\\modules\\tools\\spTr.js":[function(require,module,exports){
"use strict";



/** Deprecated -  don't use */



var tr = function (original,key,values) {
  if (!key) {
    key = original.toLowerCase().trim().replace(" ", "_");
  }
  var translated;
  // prevent throwing exception on wrong sprintf format
  try {
    translated = $.t('form_search.'+key, {postProcess: 'sprintf', sprintf: values});
  } catch (e) {
    translated = original;
  }
  //Not nice, TODO make some better solution how to pick prefix and fallback to common
  if (translated == 'form_search.'+key) {
    try {
      translated = $.t('common.'+key, {postProcess: 'sprintf', sprintf: values});
    } catch (e) {
      translated = original;
    }
  }

  return translated
};

module.exports = tr;

},{}],"C:\\www\\skypicker-components\\modules\\tools\\tr.js":[function(require,module,exports){
"use strict";

/* adapter to translate by one of chosen strategy */



/** Deprecated -  don't use */



var setupDoc = {
  "getTranslations": "to get text which are not translated on current page, take console.log(window.toTranslate)",
  "setupStrategy": "it is necessary set strategy in root of bundle"
};

var strategy = null;



var tr = function (original, key, values, namespace) {
  if (!strategy) {
    console.error("Translation strategy is not set\n "+setupDoc["setupStrategy"]);
    return original;
  }
  return strategy(original, key, values, namespace);
};

tr.setStrategy = function (newStrategy) {
  strategy = newStrategy;
};

module.exports = tr;

},{}],"C:\\www\\skypicker-components\\modules\\tools\\translate.jsx":[function(require,module,exports){
"use strict";

//Nicer wrapper of skypicker's translate

var translate = function (key,values,defaultShow) {
  var translated;
  // prevent throwing exception on wrong sprintf format
  try {
    translated = $.t(key, values);
  } catch (e) {
    translated = defaultShow;
  }
  if (!translated) {
    console.error("translation is missing");
    return defaultShow;
  }

  return translated
};

module.exports = translate;

},{}],"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js":[function(require,module,exports){
module.exports = function merge (target, src) {
    var array = Array.isArray(src)
    var dst = array && [] || {}

    if (array) {
        target = target || []
        dst = dst.concat(target)
        src.forEach(function(e, i) {
            if (typeof target[i] === 'undefined') {
                dst[i] = e
            } else if (typeof e === 'object') {
                dst[i] = merge(target[i], e)
            } else {
                if (target.indexOf(e) === -1) {
                    dst.push(e)
                }
            }
        })
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key]
            })
        }
        Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key]
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key]
                } else {
                    dst[key] = merge(target[key], src[key])
                }
            }
        })
    }

    return dst
}

},{}],"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js":[function(require,module,exports){
/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.Immutable = factory()
}(this, function () { 'use strict';var SLICE$0 = Array.prototype.slice;

  function createClass(ctor, superClass) {
    if (superClass) {
      ctor.prototype = Object.create(superClass.prototype);
    }
    ctor.prototype.constructor = ctor;
  }

  // Used for setting prototype methods that IE8 chokes on.
  var DELETE = 'delete';

  // Constants describing the size of trie nodes.
  var SHIFT = 5; // Resulted in best performance after ______?
  var SIZE = 1 << SHIFT;
  var MASK = SIZE - 1;

  // A consistent shared value representing "not set" which equals nothing other
  // than itself, and nothing that could be provided externally.
  var NOT_SET = {};

  // Boolean references, Rough equivalent of `bool &`.
  var CHANGE_LENGTH = { value: false };
  var DID_ALTER = { value: false };

  function MakeRef(ref) {
    ref.value = false;
    return ref;
  }

  function SetRef(ref) {
    ref && (ref.value = true);
  }

  // A function which returns a value representing an "owner" for transient writes
  // to tries. The return value will only ever equal itself, and will not equal
  // the return of any subsequent call of this function.
  function OwnerID() {}

  // http://jsperf.com/copy-array-inline
  function arrCopy(arr, offset) {
    offset = offset || 0;
    var len = Math.max(0, arr.length - offset);
    var newArr = new Array(len);
    for (var ii = 0; ii < len; ii++) {
      newArr[ii] = arr[ii + offset];
    }
    return newArr;
  }

  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
    return iter.size;
  }

  function wrapIndex(iter, index) {
    return index >= 0 ? (+index) : ensureSize(iter) + (+index);
  }

  function returnTrue() {
    return true;
  }

  function wholeSlice(begin, end, size) {
    return (begin === 0 || (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size));
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    return index === undefined ?
      defaultIndex :
      index < 0 ?
        Math.max(0, size + index) :
        size === undefined ?
          index :
          Math.min(size, index);
  }

  function Iterable(value) {
      return isIterable(value) ? value : Seq(value);
    }


  createClass(KeyedIterable, Iterable);
    function KeyedIterable(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }


  createClass(IndexedIterable, Iterable);
    function IndexedIterable(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }


  createClass(SetIterable, Iterable);
    function SetIterable(value) {
      return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
    }



  function isIterable(maybeIterable) {
    return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
  }

  function isKeyed(maybeKeyed) {
    return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
  }

  function isIndexed(maybeIndexed) {
    return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  function isOrdered(maybeOrdered) {
    return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
  }

  Iterable.isIterable = isIterable;
  Iterable.isKeyed = isKeyed;
  Iterable.isIndexed = isIndexed;
  Iterable.isAssociative = isAssociative;
  Iterable.isOrdered = isOrdered;

  Iterable.Keyed = KeyedIterable;
  Iterable.Indexed = IndexedIterable;
  Iterable.Set = SetIterable;


  var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  /* global Symbol */

  var ITERATE_KEYS = 0;
  var ITERATE_VALUES = 1;
  var ITERATE_ENTRIES = 2;

  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


  function Iterator(next) {
      this.next = next;
    }

    Iterator.prototype.toString = function() {
      return '[Iterator]';
    };


  Iterator.KEYS = ITERATE_KEYS;
  Iterator.VALUES = ITERATE_VALUES;
  Iterator.ENTRIES = ITERATE_ENTRIES;

  Iterator.prototype.inspect =
  Iterator.prototype.toSource = function () { return this.toString(); }
  Iterator.prototype[ITERATOR_SYMBOL] = function () {
    return this;
  };


  function iteratorValue(type, k, v, iteratorResult) {
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
      value: value, done: false
    });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    var iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    var iteratorFn = iterable && (
      (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]
    );
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  function isArrayLike(value) {
    return value && typeof value.length === 'number';
  }

  createClass(Seq, Iterable);
    function Seq(value) {
      return value === null || value === undefined ? emptySequence() :
        isIterable(value) ? value.toSeq() : seqFromValue(value);
    }

    Seq.of = function(/*...values*/) {
      return Seq(arguments);
    };

    Seq.prototype.toSeq = function() {
      return this;
    };

    Seq.prototype.toString = function() {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function() {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, true);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, true);
    };



  createClass(KeyedSeq, Seq);
    function KeyedSeq(value) {
      return value === null || value === undefined ?
        emptySequence().toKeyedSeq() :
        isIterable(value) ?
          (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
          keyedSeqFromValue(value);
    }

    KeyedSeq.of = function(/*...values*/) {
      return KeyedSeq(arguments);
    };

    KeyedSeq.prototype.toKeyedSeq = function() {
      return this;
    };

    KeyedSeq.prototype.toSeq = function() {
      return this;
    };



  createClass(IndexedSeq, Seq);
    function IndexedSeq(value) {
      return value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
    }

    IndexedSeq.of = function(/*...values*/) {
      return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function() {
      return this;
    };

    IndexedSeq.prototype.toString = function() {
      return this.__toString('Seq [', ']');
    };

    IndexedSeq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, false);
    };

    IndexedSeq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, false);
    };



  createClass(SetSeq, Seq);
    function SetSeq(value) {
      return (
        value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value
      ).toSetSeq();
    }

    SetSeq.of = function(/*...values*/) {
      return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function() {
      return this;
    };



  Seq.isSeq = isSeq;
  Seq.Keyed = KeyedSeq;
  Seq.Set = SetSeq;
  Seq.Indexed = IndexedSeq;

  var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

  Seq.prototype[IS_SEQ_SENTINEL] = true;



  // #pragma Root Sequences

  createClass(ArraySeq, IndexedSeq);
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }

    ArraySeq.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function(fn, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ArraySeq.prototype.__iterator = function(type, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      var ii = 0;
      return new Iterator(function() 
        {return ii > maxIndex ?
          iteratorDone() :
          iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])}
      );
    };



  createClass(ObjectSeq, KeyedSeq);
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }

    ObjectSeq.prototype.get = function(key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };

    ObjectSeq.prototype.has = function(key) {
      return this._object.hasOwnProperty(key);
    };

    ObjectSeq.prototype.__iterate = function(fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var key = keys[reverse ? maxIndex - ii : ii];
        if (fn(object[key], key, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ObjectSeq.prototype.__iterator = function(type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var key = keys[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, key, object[key]);
      });
    };

  ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(IterableSeq, IndexedSeq);
    function IterableSeq(iterable) {
      this._iterable = iterable;
      this.size = iterable.length || iterable.size;
    }

    IterableSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };

    IterableSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      if (!isIterator(iterator)) {
        return new Iterator(iteratorDone);
      }
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };



  createClass(IteratorSeq, IndexedSeq);
    function IteratorSeq(iterator) {
      this._iterator = iterator;
      this._iteratorCache = [];
    }

    IteratorSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      while (iterations < cache.length) {
        if (fn(cache[iterations], iterations++, this) === false) {
          return iterations;
        }
      }
      var step;
      while (!(step = iterator.next()).done) {
        var val = step.value;
        cache[iterations] = val;
        if (fn(val, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };

    IteratorSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      return new Iterator(function()  {
        if (iterations >= cache.length) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          cache[iterations] = step.value;
        }
        return iteratorValue(type, iterations, cache[iterations++]);
      });
    };




  // # pragma Helper functions

  function isSeq(maybeSeq) {
    return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
  }

  var EMPTY_SEQ;

  function emptySequence() {
    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
  }

  function keyedSeqFromValue(value) {
    var seq =
      Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
      isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
      hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
      typeof value === 'object' ? new ObjectSeq(value) :
      undefined;
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of [k, v] entries, '+
        'or keyed object: ' + value
      );
    }
    return seq;
  }

  function indexedSeqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values: ' + value
      );
    }
    return seq;
  }

  function seqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value) ||
      (typeof value === 'object' && new ObjectSeq(value));
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values, or keyed object: ' + value
      );
    }
    return seq;
  }

  function maybeIndexedSeqFromValue(value) {
    return (
      isArrayLike(value) ? new ArraySeq(value) :
      isIterator(value) ? new IteratorSeq(value) :
      hasIterator(value) ? new IterableSeq(value) :
      undefined
    );
  }

  function seqIterate(seq, fn, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var entry = cache[reverse ? maxIndex - ii : ii];
        if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
          return ii + 1;
        }
      }
      return ii;
    }
    return seq.__iterateUncached(fn, reverse);
  }

  function seqIterator(seq, type, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var entry = cache[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
      });
    }
    return seq.__iteratorUncached(type, reverse);
  }

  createClass(Collection, Iterable);
    function Collection() {
      throw TypeError('Abstract');
    }


  createClass(KeyedCollection, Collection);function KeyedCollection() {}

  createClass(IndexedCollection, Collection);function IndexedCollection() {}

  createClass(SetCollection, Collection);function SetCollection() {}


  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  /**
   * An extension of the "same-value" algorithm as [described for use by ES6 Map
   * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
   *
   * NaN is considered the same as NaN, however -0 and 0 are considered the same
   * value, which is different from the algorithm described by
   * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   *
   * This is extended further to allow Objects to describe the values they
   * represent, by way of `valueOf` or `equals` (and `hashCode`).
   *
   * Note: because of this extension, the key equality of Immutable.Map and the
   * value equality of Immutable.Set will differ from ES6 Map and Set.
   *
   * ### Defining custom values
   *
   * The easiest way to describe the value an object represents is by implementing
   * `valueOf`. For example, `Date` represents a value by returning a unix
   * timestamp for `valueOf`:
   *
   *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
   *     var date2 = new Date(1234567890000);
   *     date1.valueOf(); // 1234567890000
   *     assert( date1 !== date2 );
   *     assert( Immutable.is( date1, date2 ) );
   *
   * Note: overriding `valueOf` may have other implications if you use this object
   * where JavaScript expects a primitive, such as implicit string coercion.
   *
   * For more complex types, especially collections, implementing `valueOf` may
   * not be performant. An alternative is to implement `equals` and `hashCode`.
   *
   * `equals` takes another object, presumably of similar type, and returns true
   * if the it is equal. Equality is symmetrical, so the same result should be
   * returned if this and the argument are flipped.
   *
   *     assert( a.equals(b) === b.equals(a) );
   *
   * `hashCode` returns a 32bit integer number representing the object which will
   * be used to determine how to store the value object in a Map or Set. You must
   * provide both or neither methods, one must not exist without the other.
   *
   * Also, an important relationship between these methods must be upheld: if two
   * values are equal, they *must* return the same hashCode. If the values are not
   * equal, they might have the same hashCode; this is called a hash collision,
   * and while undesirable for performance reasons, it is acceptable.
   *
   *     if (a.equals(b)) {
   *       assert( a.hashCode() === b.hashCode() );
   *     }
   *
   * All Immutable collections implement `equals` and `hashCode`.
   *
   */
  function is(valueA, valueB) {
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
    if (typeof valueA.valueOf === 'function' &&
        typeof valueB.valueOf === 'function') {
      valueA = valueA.valueOf();
      valueB = valueB.valueOf();
    }
    return typeof valueA.equals === 'function' &&
      typeof valueB.equals === 'function' ?
        valueA.equals(valueB) :
        valueA === valueB || (valueA !== valueA && valueB !== valueB);
  }

  function fromJS(json, converter) {
    return converter ?
      fromJSWith(converter, json, '', {'': json}) :
      fromJSDefault(json);
  }

  function fromJSWith(converter, json, key, parentJSON) {
    if (Array.isArray(json)) {
      return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    if (isPlainObj(json)) {
      return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    return json;
  }

  function fromJSDefault(json) {
    if (Array.isArray(json)) {
      return IndexedSeq(json).map(fromJSDefault).toList();
    }
    if (isPlainObj(json)) {
      return KeyedSeq(json).map(fromJSDefault).toMap();
    }
    return json;
  }

  function isPlainObj(value) {
    return value && value.constructor === Object;
  }

  var Math__imul =
    typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ?
    Math.imul :
    function Math__imul(a, b) {
      a = a | 0; // int
      b = b | 0; // int
      var c = a & 0xffff;
      var d = b & 0xffff;
      // Shift by 0 fixes the sign on the high part.
      return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0; // int
    };

  // v8 has an optimization for storing 31-bit signed numbers.
  // Values which have either 00 or 11 as the high order bits qualify.
  // This function drops the highest order bit in a signed number, maintaining
  // the sign bit.
  function smi(i32) {
    return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
  }

  function hash(o) {
    if (o === false || o === null || o === undefined) {
      return 0;
    }
    if (typeof o.valueOf === 'function') {
      o = o.valueOf();
      if (o === false || o === null || o === undefined) {
        return 0;
      }
    }
    if (o === true) {
      return 1;
    }
    var type = typeof o;
    if (type === 'number') {
      var h = o | 0;
      if (h !== o) {
        h ^= o * 0xFFFFFFFF;
      }
      while (o > 0xFFFFFFFF) {
        o /= 0xFFFFFFFF;
        h ^= o;
      }
      return smi(h);
    }
    if (type === 'string') {
      return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
    }
    if (typeof o.hashCode === 'function') {
      return o.hashCode();
    }
    return hashJSObj(o);
  }

  function cachedHashString(string) {
    var hash = stringHashCache[string];
    if (hash === undefined) {
      hash = hashString(string);
      if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
        STRING_HASH_CACHE_SIZE = 0;
        stringHashCache = {};
      }
      STRING_HASH_CACHE_SIZE++;
      stringHashCache[string] = hash;
    }
    return hash;
  }

  // http://jsperf.com/hashing-strings
  function hashString(string) {
    // This is the hash from JVM
    // The hash code for a string is computed as
    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
    // where s[i] is the ith character of the string and n is the length of
    // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
    // (exclusive) by dropping high bits.
    var hash = 0;
    for (var ii = 0; ii < string.length; ii++) {
      hash = 31 * hash + string.charCodeAt(ii) | 0;
    }
    return smi(hash);
  }

  function hashJSObj(obj) {
    var hash = weakMap && weakMap.get(obj);
    if (hash) return hash;

    hash = obj[UID_HASH_KEY];
    if (hash) return hash;

    if (!canDefineProperty) {
      hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
      if (hash) return hash;

      hash = getIENodeHash(obj);
      if (hash) return hash;
    }

    if (Object.isExtensible && !Object.isExtensible(obj)) {
      throw new Error('Non-extensible objects are not allowed as keys.');
    }

    hash = ++objHashUID;
    if (objHashUID & 0x40000000) {
      objHashUID = 0;
    }

    if (weakMap) {
      weakMap.set(obj, hash);
    } else if (canDefineProperty) {
      Object.defineProperty(obj, UID_HASH_KEY, {
        'enumerable': false,
        'configurable': false,
        'writable': false,
        'value': hash
      });
    } else if (obj.propertyIsEnumerable &&
               obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
      // Since we can't define a non-enumerable property on the object
      // we'll hijack one of the less-used non-enumerable properties to
      // save our hash on it. Since this is a function it will not show up in
      // `JSON.stringify` which is what we want.
      obj.propertyIsEnumerable = function() {
        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
      };
      obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
    } else if (obj.nodeType) {
      // At this point we couldn't get the IE `uniqueID` to use as a hash
      // and we couldn't use a non-enumerable property to exploit the
      // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
      // itself.
      obj[UID_HASH_KEY] = hash;
    } else {
      throw new Error('Unable to set a non-enumerable property on object.');
    }

    return hash;
  }

  // True if Object.defineProperty works as expected. IE8 fails this test.
  var canDefineProperty = (function() {
    try {
      Object.defineProperty({}, 'x', {});
      return true;
    } catch (e) {
      return false;
    }
  }());

  // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
  // and avoid memory leaks from the IE cloneNode bug.
  function getIENodeHash(node) {
    if (node && node.nodeType > 0) {
      switch (node.nodeType) {
        case 1: // Element
          return node.uniqueID;
        case 9: // Document
          return node.documentElement && node.documentElement.uniqueID;
      }
    }
  }

  // If possible, use a WeakMap.
  var weakMap = typeof WeakMap === 'function' && new WeakMap();

  var objHashUID = 0;

  var UID_HASH_KEY = '__immutablehash__';
  if (typeof Symbol === 'function') {
    UID_HASH_KEY = Symbol(UID_HASH_KEY);
  }

  var STRING_HASH_CACHE_MIN_STRLEN = 16;
  var STRING_HASH_CACHE_MAX_SIZE = 255;
  var STRING_HASH_CACHE_SIZE = 0;
  var stringHashCache = {};

  function invariant(condition, error) {
    if (!condition) throw new Error(error);
  }

  function assertNotInfinite(size) {
    invariant(
      size !== Infinity,
      'Cannot perform this action with an infinite size.'
    );
  }

  createClass(ToKeyedSequence, KeyedSeq);
    function ToKeyedSequence(indexed, useKeys) {
      this._iter = indexed;
      this._useKeys = useKeys;
      this.size = indexed.size;
    }

    ToKeyedSequence.prototype.get = function(key, notSetValue) {
      return this._iter.get(key, notSetValue);
    };

    ToKeyedSequence.prototype.has = function(key) {
      return this._iter.has(key);
    };

    ToKeyedSequence.prototype.valueSeq = function() {
      return this._iter.valueSeq();
    };

    ToKeyedSequence.prototype.reverse = function() {var this$0 = this;
      var reversedSequence = reverseFactory(this, true);
      if (!this._useKeys) {
        reversedSequence.valueSeq = function()  {return this$0._iter.toSeq().reverse()};
      }
      return reversedSequence;
    };

    ToKeyedSequence.prototype.map = function(mapper, context) {var this$0 = this;
      var mappedSequence = mapFactory(this, mapper, context);
      if (!this._useKeys) {
        mappedSequence.valueSeq = function()  {return this$0._iter.toSeq().map(mapper, context)};
      }
      return mappedSequence;
    };

    ToKeyedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var ii;
      return this._iter.__iterate(
        this._useKeys ?
          function(v, k)  {return fn(v, k, this$0)} :
          ((ii = reverse ? resolveSize(this) : 0),
            function(v ) {return fn(v, reverse ? --ii : ii++, this$0)}),
        reverse
      );
    };

    ToKeyedSequence.prototype.__iterator = function(type, reverse) {
      if (this._useKeys) {
        return this._iter.__iterator(type, reverse);
      }
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var ii = reverse ? resolveSize(this) : 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, reverse ? --ii : ii++, step.value, step);
      });
    };

  ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(ToIndexedSequence, IndexedSeq);
    function ToIndexedSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToIndexedSequence.prototype.contains = function(value) {
      return this._iter.contains(value);
    };

    ToIndexedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      return this._iter.__iterate(function(v ) {return fn(v, iterations++, this$0)}, reverse);
    };

    ToIndexedSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, iterations++, step.value, step)
      });
    };



  createClass(ToSetSequence, SetSeq);
    function ToSetSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToSetSequence.prototype.has = function(key) {
      return this._iter.contains(key);
    };

    ToSetSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(v ) {return fn(v, v, this$0)}, reverse);
    };

    ToSetSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, step.value, step.value, step);
      });
    };



  createClass(FromEntriesSequence, KeyedSeq);
    function FromEntriesSequence(entries) {
      this._iter = entries;
      this.size = entries.size;
    }

    FromEntriesSequence.prototype.entrySeq = function() {
      return this._iter.toSeq();
    };

    FromEntriesSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(entry ) {
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          return fn(entry[1], entry[0], this$0);
        }
      }, reverse);
    };

    FromEntriesSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          // Check if entry exists first so array access doesn't throw for holes
          // in the parent iteration.
          if (entry) {
            validateEntry(entry);
            return type === ITERATE_ENTRIES ? step :
              iteratorValue(type, entry[0], entry[1], step);
          }
        }
      });
    };


  ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;


  function flipFactory(iterable) {
    var flipSequence = makeSequence(iterable);
    flipSequence._iter = iterable;
    flipSequence.size = iterable.size;
    flipSequence.flip = function()  {return iterable};
    flipSequence.reverse = function () {
      var reversedSequence = iterable.reverse.apply(this); // super.reverse()
      reversedSequence.flip = function()  {return iterable.reverse()};
      return reversedSequence;
    };
    flipSequence.has = function(key ) {return iterable.contains(key)};
    flipSequence.contains = function(key ) {return iterable.has(key)};
    flipSequence.cacheResult = cacheResultThrough;
    flipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(k, v, this$0) !== false}, reverse);
    }
    flipSequence.__iteratorUncached = function(type, reverse) {
      if (type === ITERATE_ENTRIES) {
        var iterator = iterable.__iterator(type, reverse);
        return new Iterator(function()  {
          var step = iterator.next();
          if (!step.done) {
            var k = step.value[0];
            step.value[0] = step.value[1];
            step.value[1] = k;
          }
          return step;
        });
      }
      return iterable.__iterator(
        type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
        reverse
      );
    }
    return flipSequence;
  }


  function mapFactory(iterable, mapper, context) {
    var mappedSequence = makeSequence(iterable);
    mappedSequence.size = iterable.size;
    mappedSequence.has = function(key ) {return iterable.has(key)};
    mappedSequence.get = function(key, notSetValue)  {
      var v = iterable.get(key, NOT_SET);
      return v === NOT_SET ?
        notSetValue :
        mapper.call(context, v, key, iterable);
    };
    mappedSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(
        function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, this$0) !== false},
        reverse
      );
    }
    mappedSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        return iteratorValue(
          type,
          key,
          mapper.call(context, entry[1], key, iterable),
          step
        );
      });
    }
    return mappedSequence;
  }


  function reverseFactory(iterable, useKeys) {
    var reversedSequence = makeSequence(iterable);
    reversedSequence._iter = iterable;
    reversedSequence.size = iterable.size;
    reversedSequence.reverse = function()  {return iterable};
    if (iterable.flip) {
      reversedSequence.flip = function () {
        var flipSequence = flipFactory(iterable);
        flipSequence.reverse = function()  {return iterable.flip()};
        return flipSequence;
      };
    }
    reversedSequence.get = function(key, notSetValue) 
      {return iterable.get(useKeys ? key : -1 - key, notSetValue)};
    reversedSequence.has = function(key )
      {return iterable.has(useKeys ? key : -1 - key)};
    reversedSequence.contains = function(value ) {return iterable.contains(value)};
    reversedSequence.cacheResult = cacheResultThrough;
    reversedSequence.__iterate = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(v, k, this$0)}, !reverse);
    };
    reversedSequence.__iterator =
      function(type, reverse)  {return iterable.__iterator(type, !reverse)};
    return reversedSequence;
  }


  function filterFactory(iterable, predicate, context, useKeys) {
    var filterSequence = makeSequence(iterable);
    if (useKeys) {
      filterSequence.has = function(key ) {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
      };
      filterSequence.get = function(key, notSetValue)  {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
          v : notSetValue;
      };
    }
    filterSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      }, reverse);
      return iterations;
    };
    filterSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var key = entry[0];
          var value = entry[1];
          if (predicate.call(context, value, key, iterable)) {
            return iteratorValue(type, useKeys ? key : iterations++, value, step);
          }
        }
      });
    }
    return filterSequence;
  }


  function countByFactory(iterable, grouper, context) {
    var groups = Map().asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        0,
        function(a ) {return a + 1}
      );
    });
    return groups.asImmutable();
  }


  function groupByFactory(iterable, grouper, context) {
    var isKeyedIter = isKeyed(iterable);
    var groups = (isOrdered(iterable) ? OrderedMap() : Map()).asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        function(a ) {return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a)}
      );
    });
    var coerce = iterableClass(iterable);
    return groups.map(function(arr ) {return reify(iterable, coerce(arr))});
  }


  function sliceFactory(iterable, begin, end, useKeys) {
    var originalSize = iterable.size;

    if (wholeSlice(begin, end, originalSize)) {
      return iterable;
    }

    var resolvedBegin = resolveBegin(begin, originalSize);
    var resolvedEnd = resolveEnd(end, originalSize);

    // begin or end will be NaN if they were provided as negative numbers and
    // this iterable's size is unknown. In that case, cache first so there is
    // a known size.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
    }

    var sliceSize = resolvedEnd - resolvedBegin;
    if (sliceSize < 0) {
      sliceSize = 0;
    }

    var sliceSeq = makeSequence(iterable);

    sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;

    if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
      sliceSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < sliceSize ?
          iterable.get(index + resolvedBegin, notSetValue) :
          notSetValue;
      }
    }

    sliceSeq.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (sliceSize === 0) {
        return 0;
      }
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var skipped = 0;
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k)  {
        if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0) !== false &&
                 iterations !== sliceSize;
        }
      });
      return iterations;
    };

    sliceSeq.__iteratorUncached = function(type, reverse) {
      if (sliceSize && reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      // Don't bother instantiating parent iterator if taking 0.
      var iterator = sliceSize && iterable.__iterator(type, reverse);
      var skipped = 0;
      var iterations = 0;
      return new Iterator(function()  {
        while (skipped++ !== resolvedBegin) {
          iterator.next();
        }
        if (++iterations > sliceSize) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (useKeys || type === ITERATE_VALUES) {
          return step;
        } else if (type === ITERATE_KEYS) {
          return iteratorValue(type, iterations - 1, undefined, step);
        } else {
          return iteratorValue(type, iterations - 1, step.value[1], step);
        }
      });
    }

    return sliceSeq;
  }


  function takeWhileFactory(iterable, predicate, context) {
    var takeSequence = makeSequence(iterable);
    takeSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterations = 0;
      iterable.__iterate(function(v, k, c) 
        {return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0)}
      );
      return iterations;
    };
    takeSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterating = true;
      return new Iterator(function()  {
        if (!iterating) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var k = entry[0];
        var v = entry[1];
        if (!predicate.call(context, v, k, this$0)) {
          iterating = false;
          return iteratorDone();
        }
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return takeSequence;
  }


  function skipWhileFactory(iterable, predicate, context, useKeys) {
    var skipSequence = makeSequence(iterable);
    skipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      });
      return iterations;
    };
    skipSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var skipping = true;
      var iterations = 0;
      return new Iterator(function()  {
        var step, k, v;
        do {
          step = iterator.next();
          if (step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            } else if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, undefined, step);
            } else {
              return iteratorValue(type, iterations++, step.value[1], step);
            }
          }
          var entry = step.value;
          k = entry[0];
          v = entry[1];
          skipping && (skipping = predicate.call(context, v, k, this$0));
        } while (skipping);
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return skipSequence;
  }


  function concatFactory(iterable, values) {
    var isKeyedIterable = isKeyed(iterable);
    var iters = [iterable].concat(values).map(function(v ) {
      if (!isIterable(v)) {
        v = isKeyedIterable ?
          keyedSeqFromValue(v) :
          indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedIterable) {
        v = KeyedIterable(v);
      }
      return v;
    }).filter(function(v ) {return v.size !== 0});

    if (iters.length === 0) {
      return iterable;
    }

    if (iters.length === 1) {
      var singleton = iters[0];
      if (singleton === iterable ||
          isKeyedIterable && isKeyed(singleton) ||
          isIndexed(iterable) && isIndexed(singleton)) {
        return singleton;
      }
    }

    var concatSeq = new ArraySeq(iters);
    if (isKeyedIterable) {
      concatSeq = concatSeq.toKeyedSeq();
    } else if (!isIndexed(iterable)) {
      concatSeq = concatSeq.toSetSeq();
    }
    concatSeq = concatSeq.flatten(true);
    concatSeq.size = iters.reduce(
      function(sum, seq)  {
        if (sum !== undefined) {
          var size = seq.size;
          if (size !== undefined) {
            return sum + size;
          }
        }
      },
      0
    );
    return concatSeq;
  }


  function flattenFactory(iterable, depth, useKeys) {
    var flatSequence = makeSequence(iterable);
    flatSequence.__iterateUncached = function(fn, reverse) {
      var iterations = 0;
      var stopped = false;
      function flatDeep(iter, currentDepth) {var this$0 = this;
        iter.__iterate(function(v, k)  {
          if ((!depth || currentDepth < depth) && isIterable(v)) {
            flatDeep(v, currentDepth + 1);
          } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
            stopped = true;
          }
          return !stopped;
        }, reverse);
      }
      flatDeep(iterable, 0);
      return iterations;
    }
    flatSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(type, reverse);
      var stack = [];
      var iterations = 0;
      return new Iterator(function()  {
        while (iterator) {
          var step = iterator.next();
          if (step.done !== false) {
            iterator = stack.pop();
            continue;
          }
          var v = step.value;
          if (type === ITERATE_ENTRIES) {
            v = v[1];
          }
          if ((!depth || stack.length < depth) && isIterable(v)) {
            stack.push(iterator);
            iterator = v.__iterator(type, reverse);
          } else {
            return useKeys ? step : iteratorValue(type, iterations++, v, step);
          }
        }
        return iteratorDone();
      });
    }
    return flatSequence;
  }


  function flatMapFactory(iterable, mapper, context) {
    var coerce = iterableClass(iterable);
    return iterable.toSeq().map(
      function(v, k)  {return coerce(mapper.call(context, v, k, iterable))}
    ).flatten(true);
  }


  function interposeFactory(iterable, separator) {
    var interposedSequence = makeSequence(iterable);
    interposedSequence.size = iterable.size && iterable.size * 2 -1;
    interposedSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k) 
        {return (!iterations || fn(separator, iterations++, this$0) !== false) &&
        fn(v, iterations++, this$0) !== false},
        reverse
      );
      return iterations;
    };
    interposedSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      var step;
      return new Iterator(function()  {
        if (!step || iterations % 2) {
          step = iterator.next();
          if (step.done) {
            return step;
          }
        }
        return iterations % 2 ?
          iteratorValue(type, iterations++, separator) :
          iteratorValue(type, iterations++, step.value, step);
      });
    };
    return interposedSequence;
  }


  function sortFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    var isKeyedIterable = isKeyed(iterable);
    var index = 0;
    var entries = iterable.toSeq().map(
      function(v, k)  {return [k, v, index++, mapper ? mapper(v, k, iterable) : v]}
    ).toArray();
    entries.sort(function(a, b)  {return comparator(a[3], b[3]) || a[2] - b[2]}).forEach(
      isKeyedIterable ?
      function(v, i)  { entries[i].length = 2; } :
      function(v, i)  { entries[i] = v[1]; }
    );
    return isKeyedIterable ? KeyedSeq(entries) :
      isIndexed(iterable) ? IndexedSeq(entries) :
      SetSeq(entries);
  }


  function maxFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    if (mapper) {
      var entry = iterable.toSeq()
        .map(function(v, k)  {return [v, mapper(v, k, iterable)]})
        .reduce(function(a, b)  {return maxCompare(comparator, a[1], b[1]) ? b : a});
      return entry && entry[0];
    } else {
      return iterable.reduce(function(a, b)  {return maxCompare(comparator, a, b) ? b : a});
    }
  }

  function maxCompare(comparator, a, b) {
    var comp = comparator(b, a);
    // b is considered the new max if the comparator declares them equal, but
    // they are not equal and b is in fact a nullish value.
    return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
  }


  function zipWithFactory(keyIter, zipper, iters) {
    var zipSequence = makeSequence(keyIter);
    zipSequence.size = new ArraySeq(iters).map(function(i ) {return i.size}).min();
    // Note: this a generic base implementation of __iterate in terms of
    // __iterator which may be more generically useful in the future.
    zipSequence.__iterate = function(fn, reverse) {
      /* generic:
      var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        iterations++;
        if (fn(step.value[1], step.value[0], this) === false) {
          break;
        }
      }
      return iterations;
      */
      // indexed:
      var iterator = this.__iterator(ITERATE_VALUES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };
    zipSequence.__iteratorUncached = function(type, reverse) {
      var iterators = iters.map(function(i )
        {return (i = Iterable(i), getIterator(reverse ? i.reverse() : i))}
      );
      var iterations = 0;
      var isDone = false;
      return new Iterator(function()  {
        var steps;
        if (!isDone) {
          steps = iterators.map(function(i ) {return i.next()});
          isDone = steps.some(function(s ) {return s.done});
        }
        if (isDone) {
          return iteratorDone();
        }
        return iteratorValue(
          type,
          iterations++,
          zipper.apply(null, steps.map(function(s ) {return s.value}))
        );
      });
    };
    return zipSequence
  }


  // #pragma Helper Functions

  function reify(iter, seq) {
    return isSeq(iter) ? seq : iter.constructor(seq);
  }

  function validateEntry(entry) {
    if (entry !== Object(entry)) {
      throw new TypeError('Expected [K, V] tuple: ' + entry);
    }
  }

  function resolveSize(iter) {
    assertNotInfinite(iter.size);
    return ensureSize(iter);
  }

  function iterableClass(iterable) {
    return isKeyed(iterable) ? KeyedIterable :
      isIndexed(iterable) ? IndexedIterable :
      SetIterable;
  }

  function makeSequence(iterable) {
    return Object.create(
      (
        isKeyed(iterable) ? KeyedSeq :
        isIndexed(iterable) ? IndexedSeq :
        SetSeq
      ).prototype
    );
  }

  function cacheResultThrough() {
    if (this._iter.cacheResult) {
      this._iter.cacheResult();
      this.size = this._iter.size;
      return this;
    } else {
      return Seq.prototype.cacheResult.call(this);
    }
  }

  function defaultComparator(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function forceIterator(keyPath) {
    var iter = getIterator(keyPath);
    if (!iter) {
      // Array might not be iterable in this environment, so we need a fallback
      // to our wrapped type.
      if (!isArrayLike(keyPath)) {
        throw new TypeError('Expected iterable or array-like: ' + keyPath);
      }
      iter = getIterator(Iterable(keyPath));
    }
    return iter;
  }

  createClass(Map, KeyedCollection);

    // @pragma Construction

    function Map(value) {
      return value === null || value === undefined ? emptyMap() :
        isMap(value) ? value :
        emptyMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    Map.prototype.toString = function() {
      return this.__toString('Map {', '}');
    };

    // @pragma Access

    Map.prototype.get = function(k, notSetValue) {
      return this._root ?
        this._root.get(0, undefined, k, notSetValue) :
        notSetValue;
    };

    // @pragma Modification

    Map.prototype.set = function(k, v) {
      return updateMap(this, k, v);
    };

    Map.prototype.setIn = function(keyPath, v) {
      return this.updateIn(keyPath, NOT_SET, function()  {return v});
    };

    Map.prototype.remove = function(k) {
      return updateMap(this, k, NOT_SET);
    };

    Map.prototype.deleteIn = function(keyPath) {
      return this.updateIn(keyPath, function()  {return NOT_SET});
    };

    Map.prototype.update = function(k, notSetValue, updater) {
      return arguments.length === 1 ?
        k(this) :
        this.updateIn([k], notSetValue, updater);
    };

    Map.prototype.updateIn = function(keyPath, notSetValue, updater) {
      if (!updater) {
        updater = notSetValue;
        notSetValue = undefined;
      }
      var updatedValue = updateInDeepMap(
        this,
        forceIterator(keyPath),
        notSetValue,
        updater
      );
      return updatedValue === NOT_SET ? undefined : updatedValue;
    };

    Map.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._root = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyMap();
    };

    // @pragma Composition

    Map.prototype.merge = function(/*...iters*/) {
      return mergeIntoMapWith(this, undefined, arguments);
    };

    Map.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, merger, iters);
    };

    Map.prototype.mergeIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(keyPath, emptyMap(), function(m ) {return m.merge.apply(m, iters)});
    };

    Map.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoMapWith(this, deepMerger(undefined), arguments);
    };

    Map.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, deepMerger(merger), iters);
    };

    Map.prototype.mergeDeepIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(keyPath, emptyMap(), function(m ) {return m.mergeDeep.apply(m, iters)});
    };

    Map.prototype.sort = function(comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator));
    };

    Map.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator, mapper));
    };

    // @pragma Mutability

    Map.prototype.withMutations = function(fn) {
      var mutable = this.asMutable();
      fn(mutable);
      return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
    };

    Map.prototype.asMutable = function() {
      return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
    };

    Map.prototype.asImmutable = function() {
      return this.__ensureOwner();
    };

    Map.prototype.wasAltered = function() {
      return this.__altered;
    };

    Map.prototype.__iterator = function(type, reverse) {
      return new MapIterator(this, type, reverse);
    };

    Map.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      this._root && this._root.iterate(function(entry ) {
        iterations++;
        return fn(entry[1], entry[0], this$0);
      }, reverse);
      return iterations;
    };

    Map.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeMap(this.size, this._root, ownerID, this.__hash);
    };


  function isMap(maybeMap) {
    return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
  }

  Map.isMap = isMap;

  var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

  var MapPrototype = Map.prototype;
  MapPrototype[IS_MAP_SENTINEL] = true;
  MapPrototype[DELETE] = MapPrototype.remove;
  MapPrototype.removeIn = MapPrototype.deleteIn;


  // #pragma Trie Nodes



    function ArrayMapNode(ownerID, entries) {
      this.ownerID = ownerID;
      this.entries = entries;
    }

    ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && entries.length === 1) {
        return; // undefined
      }

      if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
        return createNodes(ownerID, entries, key, value);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new ArrayMapNode(ownerID, newEntries);
    };




    function BitmapIndexedNode(ownerID, bitmap, nodes) {
      this.ownerID = ownerID;
      this.bitmap = bitmap;
      this.nodes = nodes;
    }

    BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
      var bitmap = this.bitmap;
      return (bitmap & bit) === 0 ? notSetValue :
        this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
    };

    BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var bit = 1 << keyHashFrag;
      var bitmap = this.bitmap;
      var exists = (bitmap & bit) !== 0;

      if (!exists && value === NOT_SET) {
        return this;
      }

      var idx = popCount(bitmap & (bit - 1));
      var nodes = this.nodes;
      var node = exists ? nodes[idx] : undefined;
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);

      if (newNode === node) {
        return this;
      }

      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
      }

      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
        return nodes[idx ^ 1];
      }

      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
        return newNode;
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
      var newNodes = exists ? newNode ?
        setIn(nodes, idx, newNode, isEditable) :
        spliceOut(nodes, idx, isEditable) :
        spliceIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.bitmap = newBitmap;
        this.nodes = newNodes;
        return this;
      }

      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };




    function HashArrayMapNode(ownerID, count, nodes) {
      this.ownerID = ownerID;
      this.count = count;
      this.nodes = nodes;
    }

    HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var node = this.nodes[idx];
      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };

    HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var removed = value === NOT_SET;
      var nodes = this.nodes;
      var node = nodes[idx];

      if (removed && !node) {
        return this;
      }

      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }

      var newCount = this.count;
      if (!node) {
        newCount++;
      } else if (!newNode) {
        newCount--;
        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
          return packNodes(ownerID, nodes, newCount, idx);
        }
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newNodes = setIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.count = newCount;
        this.nodes = newNodes;
        return this;
      }

      return new HashArrayMapNode(ownerID, newCount, newNodes);
    };




    function HashCollisionNode(ownerID, keyHash, entries) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entries = entries;
    }

    HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }

      var removed = value === NOT_SET;

      if (keyHash !== this.keyHash) {
        if (removed) {
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
      }

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && len === 2) {
        return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };




    function ValueNode(ownerID, keyHash, entry) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entry = entry;
    }

    ValueNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };

    ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var keyMatch = is(key, this.entry[0]);
      if (keyMatch ? value === this.entry[1] : removed) {
        return this;
      }

      SetRef(didAlter);

      if (removed) {
        SetRef(didChangeSize);
        return; // undefined
      }

      if (keyMatch) {
        if (ownerID && ownerID === this.ownerID) {
          this.entry[1] = value;
          return this;
        }
        return new ValueNode(ownerID, this.keyHash, [key, value]);
      }

      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
    };



  // #pragma Iterators

  ArrayMapNode.prototype.iterate =
  HashCollisionNode.prototype.iterate = function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  }

  BitmapIndexedNode.prototype.iterate =
  HashArrayMapNode.prototype.iterate = function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  }

  ValueNode.prototype.iterate = function (fn, reverse) {
    return fn(this.entry);
  }

  createClass(MapIterator, Iterator);

    function MapIterator(map, type, reverse) {
      this._type = type;
      this._reverse = reverse;
      this._stack = map._root && mapIteratorFrame(map._root);
    }

    MapIterator.prototype.next = function() {
      var type = this._type;
      var stack = this._stack;
      while (stack) {
        var node = stack.node;
        var index = stack.index++;
        var maxIndex;
        if (node.entry) {
          if (index === 0) {
            return mapIteratorValue(type, node.entry);
          }
        } else if (node.entries) {
          maxIndex = node.entries.length - 1;
          if (index <= maxIndex) {
            return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
          }
        } else {
          maxIndex = node.nodes.length - 1;
          if (index <= maxIndex) {
            var subNode = node.nodes[this._reverse ? maxIndex - index : index];
            if (subNode) {
              if (subNode.entry) {
                return mapIteratorValue(type, subNode.entry);
              }
              stack = this._stack = mapIteratorFrame(subNode, stack);
            }
            continue;
          }
        }
        stack = this._stack = this._stack.__prev;
      }
      return iteratorDone();
    };


  function mapIteratorValue(type, entry) {
    return iteratorValue(type, entry[0], entry[1]);
  }

  function mapIteratorFrame(node, prev) {
    return {
      node: node,
      index: 0,
      __prev: prev
    };
  }

  function makeMap(size, root, ownerID, hash) {
    var map = Object.create(MapPrototype);
    map.size = size;
    map._root = root;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_MAP;
  function emptyMap() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }

  function updateMap(map, k, v) {
    var newRoot;
    var newSize;
    if (!map._root) {
      if (v === NOT_SET) {
        return map;
      }
      newSize = 1;
      newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
    } else {
      var didChangeSize = MakeRef(CHANGE_LENGTH);
      var didAlter = MakeRef(DID_ALTER);
      newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
      if (!didAlter.value) {
        return map;
      }
      newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
    }
    if (map.__ownerID) {
      map.size = newSize;
      map._root = newRoot;
      map.__hash = undefined;
      map.__altered = true;
      return map;
    }
    return newRoot ? makeMap(newSize, newRoot) : emptyMap();
  }

  function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (!node) {
      if (value === NOT_SET) {
        return node;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return new ValueNode(ownerID, keyHash, [key, value]);
    }
    return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
  }

  function isLeafNode(node) {
    return node.constructor === ValueNode || node.constructor === HashCollisionNode;
  }

  function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
    if (node.keyHash === keyHash) {
      return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
    }

    var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
    var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

    var newNode;
    var nodes = idx1 === idx2 ?
      [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] :
      ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);

    return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
  }

  function createNodes(ownerID, entries, key, value) {
    if (!ownerID) {
      ownerID = new OwnerID();
    }
    var node = new ValueNode(ownerID, hash(key), [key, value]);
    for (var ii = 0; ii < entries.length; ii++) {
      var entry = entries[ii];
      node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
    }
    return node;
  }

  function packNodes(ownerID, nodes, count, excluding) {
    var bitmap = 0;
    var packedII = 0;
    var packedNodes = new Array(count);
    for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
      var node = nodes[ii];
      if (node !== undefined && ii !== excluding) {
        bitmap |= bit;
        packedNodes[packedII++] = node;
      }
    }
    return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
  }

  function expandNodes(ownerID, nodes, bitmap, including, node) {
    var count = 0;
    var expandedNodes = new Array(SIZE);
    for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
      expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
    }
    expandedNodes[including] = node;
    return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
  }

  function mergeIntoMapWith(map, merger, iterables) {
    var iters = [];
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = KeyedIterable(value);
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    return mergeIntoCollectionWith(map, merger, iters);
  }

  function deepMerger(merger) {
    return function(existing, value) 
      {return existing && existing.mergeDeepWith && isIterable(value) ?
        existing.mergeDeepWith(merger, value) :
        merger ? merger(existing, value) : value};
  }

  function mergeIntoCollectionWith(collection, merger, iters) {
    iters = iters.filter(function(x ) {return x.size !== 0});
    if (iters.length === 0) {
      return collection;
    }
    if (collection.size === 0 && iters.length === 1) {
      return collection.constructor(iters[0]);
    }
    return collection.withMutations(function(collection ) {
      var mergeIntoMap = merger ?
        function(value, key)  {
          collection.update(key, NOT_SET, function(existing )
            {return existing === NOT_SET ? value : merger(existing, value)}
          );
        } :
        function(value, key)  {
          collection.set(key, value);
        }
      for (var ii = 0; ii < iters.length; ii++) {
        iters[ii].forEach(mergeIntoMap);
      }
    });
  }

  function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
    var isNotSet = existing === NOT_SET;
    var step = keyPathIter.next();
    if (step.done) {
      var existingValue = isNotSet ? notSetValue : existing;
      var newValue = updater(existingValue);
      return newValue === existingValue ? existing : newValue;
    }
    invariant(
      isNotSet || (existing && existing.set),
      'invalid keyPath'
    );
    var key = step.value;
    var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
    var nextUpdated = updateInDeepMap(
      nextExisting,
      keyPathIter,
      notSetValue,
      updater
    );
    return nextUpdated === nextExisting ? existing :
      nextUpdated === NOT_SET ? existing.remove(key) :
      (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
  }

  function popCount(x) {
    x = x - ((x >> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f;
    x = x + (x >> 8);
    x = x + (x >> 16);
    return x & 0x7f;
  }

  function setIn(array, idx, val, canEdit) {
    var newArray = canEdit ? array : arrCopy(array);
    newArray[idx] = val;
    return newArray;
  }

  function spliceIn(array, idx, val, canEdit) {
    var newLen = array.length + 1;
    if (canEdit && idx + 1 === newLen) {
      array[idx] = val;
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        newArray[ii] = val;
        after = -1;
      } else {
        newArray[ii] = array[ii + after];
      }
    }
    return newArray;
  }

  function spliceOut(array, idx, canEdit) {
    var newLen = array.length - 1;
    if (canEdit && idx === newLen) {
      array.pop();
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        after = 1;
      }
      newArray[ii] = array[ii + after];
    }
    return newArray;
  }

  var MAX_ARRAY_MAP_SIZE = SIZE / 4;
  var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
  var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

  createClass(List, IndexedCollection);

    // @pragma Construction

    function List(value) {
      var empty = emptyList();
      if (value === null || value === undefined) {
        return empty;
      }
      if (isList(value)) {
        return value;
      }
      var iter = IndexedIterable(value);
      var size = iter.size;
      if (size === 0) {
        return empty;
      }
      assertNotInfinite(size);
      if (size > 0 && size < SIZE) {
        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
      }
      return empty.withMutations(function(list ) {
        list.setSize(size);
        iter.forEach(function(v, i)  {return list.set(i, v)});
      });
    }

    List.of = function(/*...values*/) {
      return this(arguments);
    };

    List.prototype.toString = function() {
      return this.__toString('List [', ']');
    };

    // @pragma Access

    List.prototype.get = function(index, notSetValue) {
      index = wrapIndex(this, index);
      if (index < 0 || index >= this.size) {
        return notSetValue;
      }
      index += this._origin;
      var node = listNodeFor(this, index);
      return node && node.array[index & MASK];
    };

    // @pragma Modification

    List.prototype.set = function(index, value) {
      return updateList(this, index, value);
    };

    List.prototype.remove = function(index) {
      return !this.has(index) ? this :
        index === 0 ? this.shift() :
        index === this.size - 1 ? this.pop() :
        this.splice(index, 1);
    };

    List.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = this._origin = this._capacity = 0;
        this._level = SHIFT;
        this._root = this._tail = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyList();
    };

    List.prototype.push = function(/*...values*/) {
      var values = arguments;
      var oldSize = this.size;
      return this.withMutations(function(list ) {
        setListBounds(list, 0, oldSize + values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(oldSize + ii, values[ii]);
        }
      });
    };

    List.prototype.pop = function() {
      return setListBounds(this, 0, -1);
    };

    List.prototype.unshift = function(/*...values*/) {
      var values = arguments;
      return this.withMutations(function(list ) {
        setListBounds(list, -values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(ii, values[ii]);
        }
      });
    };

    List.prototype.shift = function() {
      return setListBounds(this, 1);
    };

    // @pragma Composition

    List.prototype.merge = function(/*...iters*/) {
      return mergeIntoListWith(this, undefined, arguments);
    };

    List.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, merger, iters);
    };

    List.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoListWith(this, deepMerger(undefined), arguments);
    };

    List.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, deepMerger(merger), iters);
    };

    List.prototype.setSize = function(size) {
      return setListBounds(this, 0, size);
    };

    // @pragma Iteration

    List.prototype.slice = function(begin, end) {
      var size = this.size;
      if (wholeSlice(begin, end, size)) {
        return this;
      }
      return setListBounds(
        this,
        resolveBegin(begin, size),
        resolveEnd(end, size)
      );
    };

    List.prototype.__iterator = function(type, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      return new Iterator(function()  {
        var value = values();
        return value === DONE ?
          iteratorDone() :
          iteratorValue(type, index++, value);
      });
    };

    List.prototype.__iterate = function(fn, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      var value;
      while ((value = values()) !== DONE) {
        if (fn(value, index++, this) === false) {
          break;
        }
      }
      return index;
    };

    List.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        return this;
      }
      return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
    };


  function isList(maybeList) {
    return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
  }

  List.isList = isList;

  var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

  var ListPrototype = List.prototype;
  ListPrototype[IS_LIST_SENTINEL] = true;
  ListPrototype[DELETE] = ListPrototype.remove;
  ListPrototype.setIn = MapPrototype.setIn;
  ListPrototype.deleteIn =
  ListPrototype.removeIn = MapPrototype.removeIn;
  ListPrototype.update = MapPrototype.update;
  ListPrototype.updateIn = MapPrototype.updateIn;
  ListPrototype.mergeIn = MapPrototype.mergeIn;
  ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  ListPrototype.withMutations = MapPrototype.withMutations;
  ListPrototype.asMutable = MapPrototype.asMutable;
  ListPrototype.asImmutable = MapPrototype.asImmutable;
  ListPrototype.wasAltered = MapPrototype.wasAltered;



    function VNode(array, ownerID) {
      this.array = array;
      this.ownerID = ownerID;
    }

    // TODO: seems like these methods are very similar

    VNode.prototype.removeBefore = function(ownerID, level, index) {
      if (index === level ? 1 << level : 0 || this.array.length === 0) {
        return this;
      }
      var originIndex = (index >>> level) & MASK;
      if (originIndex >= this.array.length) {
        return new VNode([], ownerID);
      }
      var removingFirst = originIndex === 0;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[originIndex];
        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingFirst) {
          return this;
        }
      }
      if (removingFirst && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingFirst) {
        for (var ii = 0; ii < originIndex; ii++) {
          editable.array[ii] = undefined;
        }
      }
      if (newChild) {
        editable.array[originIndex] = newChild;
      }
      return editable;
    };

    VNode.prototype.removeAfter = function(ownerID, level, index) {
      if (index === level ? 1 << level : 0 || this.array.length === 0) {
        return this;
      }
      var sizeIndex = ((index - 1) >>> level) & MASK;
      if (sizeIndex >= this.array.length) {
        return this;
      }
      var removingLast = sizeIndex === this.array.length - 1;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[sizeIndex];
        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingLast) {
          return this;
        }
      }
      if (removingLast && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingLast) {
        editable.array.pop();
      }
      if (newChild) {
        editable.array[sizeIndex] = newChild;
      }
      return editable;
    };



  var DONE = {};

  function iterateList(list, reverse) {
    var left = list._origin;
    var right = list._capacity;
    var tailPos = getTailOffset(right);
    var tail = list._tail;

    return iterateNodeOrLeaf(list._root, list._level, 0);

    function iterateNodeOrLeaf(node, level, offset) {
      return level === 0 ?
        iterateLeaf(node, offset) :
        iterateNode(node, level, offset);
    }

    function iterateLeaf(node, offset) {
      var array = offset === tailPos ? tail && tail.array : node && node.array;
      var from = offset > left ? 0 : left - offset;
      var to = right - offset;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        return array && array[idx];
      };
    }

    function iterateNode(node, level, offset) {
      var values;
      var array = node && node.array;
      var from = offset > left ? 0 : (left - offset) >> level;
      var to = ((right - offset) >> level) + 1;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        do {
          if (values) {
            var value = values();
            if (value !== DONE) {
              return value;
            }
            values = null;
          }
          if (from === to) {
            return DONE;
          }
          var idx = reverse ? --to : from++;
          values = iterateNodeOrLeaf(
            array && array[idx], level - SHIFT, offset + (idx << level)
          );
        } while (true);
      };
    }
  }

  function makeList(origin, capacity, level, root, tail, ownerID, hash) {
    var list = Object.create(ListPrototype);
    list.size = capacity - origin;
    list._origin = origin;
    list._capacity = capacity;
    list._level = level;
    list._root = root;
    list._tail = tail;
    list.__ownerID = ownerID;
    list.__hash = hash;
    list.__altered = false;
    return list;
  }

  var EMPTY_LIST;
  function emptyList() {
    return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
  }

  function updateList(list, index, value) {
    index = wrapIndex(list, index);

    if (index >= list.size || index < 0) {
      return list.withMutations(function(list ) {
        index < 0 ?
          setListBounds(list, index).set(0, value) :
          setListBounds(list, 0, index + 1).set(index, value)
      });
    }

    index += list._origin;

    var newTail = list._tail;
    var newRoot = list._root;
    var didAlter = MakeRef(DID_ALTER);
    if (index >= getTailOffset(list._capacity)) {
      newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
    } else {
      newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
    }

    if (!didAlter.value) {
      return list;
    }

    if (list.__ownerID) {
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
  }

  function updateVNode(node, ownerID, level, index, value, didAlter) {
    var idx = (index >>> level) & MASK;
    var nodeHas = node && idx < node.array.length;
    if (!nodeHas && value === undefined) {
      return node;
    }

    var newNode;

    if (level > 0) {
      var lowerNode = node && node.array[idx];
      var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
      if (newLowerNode === lowerNode) {
        return node;
      }
      newNode = editableVNode(node, ownerID);
      newNode.array[idx] = newLowerNode;
      return newNode;
    }

    if (nodeHas && node.array[idx] === value) {
      return node;
    }

    SetRef(didAlter);

    newNode = editableVNode(node, ownerID);
    if (value === undefined && idx === newNode.array.length - 1) {
      newNode.array.pop();
    } else {
      newNode.array[idx] = value;
    }
    return newNode;
  }

  function editableVNode(node, ownerID) {
    if (ownerID && node && ownerID === node.ownerID) {
      return node;
    }
    return new VNode(node ? node.array.slice() : [], ownerID);
  }

  function listNodeFor(list, rawIndex) {
    if (rawIndex >= getTailOffset(list._capacity)) {
      return list._tail;
    }
    if (rawIndex < 1 << (list._level + SHIFT)) {
      var node = list._root;
      var level = list._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }

  function setListBounds(list, begin, end) {
    var owner = list.__ownerID || new OwnerID();
    var oldOrigin = list._origin;
    var oldCapacity = list._capacity;
    var newOrigin = oldOrigin + begin;
    var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
    if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
      return list;
    }

    // If it's going to end after it starts, it's empty.
    if (newOrigin >= newCapacity) {
      return list.clear();
    }

    var newLevel = list._level;
    var newRoot = list._root;

    // New origin might require creating a higher root.
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
      newLevel += SHIFT;
      offsetShift += 1 << newLevel;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newCapacity += offsetShift;
      oldCapacity += offsetShift;
    }

    var oldTailOffset = getTailOffset(oldCapacity);
    var newTailOffset = getTailOffset(newCapacity);

    // New size might require creating a higher root.
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
      newLevel += SHIFT;
    }

    // Locate or create the new tail.
    var oldTail = list._tail;
    var newTail = newTailOffset < oldTailOffset ?
      listNodeFor(list, newCapacity - 1) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

    // Merge Tail into tree.
    if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
      newRoot = editableVNode(newRoot, owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = editableVNode(node.array[idx], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }

    // If the size has been reduced, there's a chance the tail needs to be trimmed.
    if (newCapacity < oldCapacity) {
      newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
    }

    // If the new origin is within the tail, then we do not need a root.
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newCapacity -= newTailOffset;
      newLevel = SHIFT;
      newRoot = null;
      newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      offsetShift = 0;

      // Identify the new top root node of the subtree of the old root.
      while (newRoot) {
        var beginIndex = (newOrigin >>> newLevel) & MASK;
        if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
          break;
        }
        if (beginIndex) {
          offsetShift += (1 << newLevel) * beginIndex;
        }
        newLevel -= SHIFT;
        newRoot = newRoot.array[beginIndex];
      }

      // Trim the new sides of the new root.
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newCapacity -= offsetShift;
      }
    }

    if (list.__ownerID) {
      list.size = newCapacity - newOrigin;
      list._origin = newOrigin;
      list._capacity = newCapacity;
      list._level = newLevel;
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
  }

  function mergeIntoListWith(list, merger, iterables) {
    var iters = [];
    var maxSize = 0;
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = IndexedIterable(value);
      if (iter.size > maxSize) {
        maxSize = iter.size;
      }
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    if (maxSize > list.size) {
      list = list.setSize(maxSize);
    }
    return mergeIntoCollectionWith(list, merger, iters);
  }

  function getTailOffset(size) {
    return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
  }

  createClass(OrderedMap, Map);

    // @pragma Construction

    function OrderedMap(value) {
      return value === null || value === undefined ? emptyOrderedMap() :
        isOrderedMap(value) ? value :
        emptyOrderedMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    OrderedMap.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedMap.prototype.toString = function() {
      return this.__toString('OrderedMap {', '}');
    };

    // @pragma Access

    OrderedMap.prototype.get = function(k, notSetValue) {
      var index = this._map.get(k);
      return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };

    // @pragma Modification

    OrderedMap.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._map.clear();
        this._list.clear();
        return this;
      }
      return emptyOrderedMap();
    };

    OrderedMap.prototype.set = function(k, v) {
      return updateOrderedMap(this, k, v);
    };

    OrderedMap.prototype.remove = function(k) {
      return updateOrderedMap(this, k, NOT_SET);
    };

    OrderedMap.prototype.wasAltered = function() {
      return this._map.wasAltered() || this._list.wasAltered();
    };

    OrderedMap.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._list.__iterate(
        function(entry ) {return entry && fn(entry[1], entry[0], this$0)},
        reverse
      );
    };

    OrderedMap.prototype.__iterator = function(type, reverse) {
      return this._list.fromEntrySeq().__iterator(type, reverse);
    };

    OrderedMap.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      var newList = this._list.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        this._list = newList;
        return this;
      }
      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };


  function isOrderedMap(maybeOrderedMap) {
    return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
  }

  OrderedMap.isOrderedMap = isOrderedMap;

  OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
  OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



  function makeOrderedMap(map, list, ownerID, hash) {
    var omap = Object.create(OrderedMap.prototype);
    omap.size = map ? map.size : 0;
    omap._map = map;
    omap._list = list;
    omap.__ownerID = ownerID;
    omap.__hash = hash;
    return omap;
  }

  var EMPTY_ORDERED_MAP;
  function emptyOrderedMap() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
  }

  function updateOrderedMap(omap, k, v) {
    var map = omap._map;
    var list = omap._list;
    var i = map.get(k);
    var has = i !== undefined;
    var newMap;
    var newList;
    if (v === NOT_SET) { // removed
      if (!has) {
        return omap;
      }
      if (list.size >= SIZE && list.size >= map.size * 2) {
        newList = list.filter(function(entry, idx)  {return entry !== undefined && i !== idx});
        newMap = newList.toKeyedSeq().map(function(entry ) {return entry[0]}).flip().toMap();
        if (omap.__ownerID) {
          newMap.__ownerID = newList.__ownerID = omap.__ownerID;
        }
      } else {
        newMap = map.remove(k);
        newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
      }
    } else {
      if (has) {
        if (v === list.get(i)[1]) {
          return omap;
        }
        newMap = map;
        newList = list.set(i, [k, v]);
      } else {
        newMap = map.set(k, list.size);
        newList = list.set(list.size, [k, v]);
      }
    }
    if (omap.__ownerID) {
      omap.size = newMap.size;
      omap._map = newMap;
      omap._list = newList;
      omap.__hash = undefined;
      return omap;
    }
    return makeOrderedMap(newMap, newList);
  }

  createClass(Stack, IndexedCollection);

    // @pragma Construction

    function Stack(value) {
      return value === null || value === undefined ? emptyStack() :
        isStack(value) ? value :
        emptyStack().unshiftAll(value);
    }

    Stack.of = function(/*...values*/) {
      return this(arguments);
    };

    Stack.prototype.toString = function() {
      return this.__toString('Stack [', ']');
    };

    // @pragma Access

    Stack.prototype.get = function(index, notSetValue) {
      var head = this._head;
      while (head && index--) {
        head = head.next;
      }
      return head ? head.value : notSetValue;
    };

    Stack.prototype.peek = function() {
      return this._head && this._head.value;
    };

    // @pragma Modification

    Stack.prototype.push = function(/*...values*/) {
      if (arguments.length === 0) {
        return this;
      }
      var newSize = this.size + arguments.length;
      var head = this._head;
      for (var ii = arguments.length - 1; ii >= 0; ii--) {
        head = {
          value: arguments[ii],
          next: head
        };
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pushAll = function(iter) {
      iter = IndexedIterable(iter);
      if (iter.size === 0) {
        return this;
      }
      assertNotInfinite(iter.size);
      var newSize = this.size;
      var head = this._head;
      iter.reverse().forEach(function(value ) {
        newSize++;
        head = {
          value: value,
          next: head
        };
      });
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pop = function() {
      return this.slice(1);
    };

    Stack.prototype.unshift = function(/*...values*/) {
      return this.push.apply(this, arguments);
    };

    Stack.prototype.unshiftAll = function(iter) {
      return this.pushAll(iter);
    };

    Stack.prototype.shift = function() {
      return this.pop.apply(this, arguments);
    };

    Stack.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._head = undefined;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyStack();
    };

    Stack.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      var resolvedBegin = resolveBegin(begin, this.size);
      var resolvedEnd = resolveEnd(end, this.size);
      if (resolvedEnd !== this.size) {
        // super.slice(begin, end);
        return IndexedCollection.prototype.slice.call(this, begin, end);
      }
      var newSize = this.size - resolvedBegin;
      var head = this._head;
      while (resolvedBegin--) {
        head = head.next;
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    // @pragma Mutability

    Stack.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeStack(this.size, this._head, ownerID, this.__hash);
    };

    // @pragma Iteration

    Stack.prototype.__iterate = function(fn, reverse) {
      if (reverse) {
        return this.toSeq().cacheResult.__iterate(fn, reverse);
      }
      var iterations = 0;
      var node = this._head;
      while (node) {
        if (fn(node.value, iterations++, this) === false) {
          break;
        }
        node = node.next;
      }
      return iterations;
    };

    Stack.prototype.__iterator = function(type, reverse) {
      if (reverse) {
        return this.toSeq().cacheResult().__iterator(type, reverse);
      }
      var iterations = 0;
      var node = this._head;
      return new Iterator(function()  {
        if (node) {
          var value = node.value;
          node = node.next;
          return iteratorValue(type, iterations++, value);
        }
        return iteratorDone();
      });
    };


  function isStack(maybeStack) {
    return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
  }

  Stack.isStack = isStack;

  var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

  var StackPrototype = Stack.prototype;
  StackPrototype[IS_STACK_SENTINEL] = true;
  StackPrototype.withMutations = MapPrototype.withMutations;
  StackPrototype.asMutable = MapPrototype.asMutable;
  StackPrototype.asImmutable = MapPrototype.asImmutable;
  StackPrototype.wasAltered = MapPrototype.wasAltered;


  function makeStack(size, head, ownerID, hash) {
    var map = Object.create(StackPrototype);
    map.size = size;
    map._head = head;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_STACK;
  function emptyStack() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }

  createClass(Set, SetCollection);

    // @pragma Construction

    function Set(value) {
      return value === null || value === undefined ? emptySet() :
        isSet(value) ? value :
        emptySet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    Set.of = function(/*...values*/) {
      return this(arguments);
    };

    Set.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    Set.prototype.toString = function() {
      return this.__toString('Set {', '}');
    };

    // @pragma Access

    Set.prototype.has = function(value) {
      return this._map.has(value);
    };

    // @pragma Modification

    Set.prototype.add = function(value) {
      return updateSet(this, this._map.set(value, true));
    };

    Set.prototype.remove = function(value) {
      return updateSet(this, this._map.remove(value));
    };

    Set.prototype.clear = function() {
      return updateSet(this, this._map.clear());
    };

    // @pragma Composition

    Set.prototype.union = function() {var iters = SLICE$0.call(arguments, 0);
      iters = iters.filter(function(x ) {return x.size !== 0});
      if (iters.length === 0) {
        return this;
      }
      if (this.size === 0 && iters.length === 1) {
        return this.constructor(iters[0]);
      }
      return this.withMutations(function(set ) {
        for (var ii = 0; ii < iters.length; ii++) {
          SetIterable(iters[ii]).forEach(function(value ) {return set.add(value)});
        }
      });
    };

    Set.prototype.intersect = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (!iters.every(function(iter ) {return iter.contains(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.subtract = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (iters.some(function(iter ) {return iter.contains(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.merge = function() {
      return this.union.apply(this, arguments);
    };

    Set.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return this.union.apply(this, iters);
    };

    Set.prototype.sort = function(comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator));
    };

    Set.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator, mapper));
    };

    Set.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Set.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._map.__iterate(function(_, k)  {return fn(k, k, this$0)}, reverse);
    };

    Set.prototype.__iterator = function(type, reverse) {
      return this._map.map(function(_, k)  {return k}).__iterator(type, reverse);
    };

    Set.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return this.__make(newMap, ownerID);
    };


  function isSet(maybeSet) {
    return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
  }

  Set.isSet = isSet;

  var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

  var SetPrototype = Set.prototype;
  SetPrototype[IS_SET_SENTINEL] = true;
  SetPrototype[DELETE] = SetPrototype.remove;
  SetPrototype.mergeDeep = SetPrototype.merge;
  SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
  SetPrototype.withMutations = MapPrototype.withMutations;
  SetPrototype.asMutable = MapPrototype.asMutable;
  SetPrototype.asImmutable = MapPrototype.asImmutable;

  SetPrototype.__empty = emptySet;
  SetPrototype.__make = makeSet;

  function updateSet(set, newMap) {
    if (set.__ownerID) {
      set.size = newMap.size;
      set._map = newMap;
      return set;
    }
    return newMap === set._map ? set :
      newMap.size === 0 ? set.__empty() :
      set.__make(newMap);
  }

  function makeSet(map, ownerID) {
    var set = Object.create(SetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_SET;
  function emptySet() {
    return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
  }

  createClass(OrderedSet, Set);

    // @pragma Construction

    function OrderedSet(value) {
      return value === null || value === undefined ? emptyOrderedSet() :
        isOrderedSet(value) ? value :
        emptyOrderedSet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    OrderedSet.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedSet.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    OrderedSet.prototype.toString = function() {
      return this.__toString('OrderedSet {', '}');
    };


  function isOrderedSet(maybeOrderedSet) {
    return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
  }

  OrderedSet.isOrderedSet = isOrderedSet;

  var OrderedSetPrototype = OrderedSet.prototype;
  OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

  OrderedSetPrototype.__empty = emptyOrderedSet;
  OrderedSetPrototype.__make = makeOrderedSet;

  function makeOrderedSet(map, ownerID) {
    var set = Object.create(OrderedSetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_ORDERED_SET;
  function emptyOrderedSet() {
    return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
  }

  createClass(Record, KeyedCollection);

    function Record(defaultValues, name) {
      var RecordType = function Record(values) {
        if (!(this instanceof RecordType)) {
          return new RecordType(values);
        }
        this._map = Map(values);
      };

      var keys = Object.keys(defaultValues);

      var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
      RecordTypePrototype.constructor = RecordType;
      name && (RecordTypePrototype._name = name);
      RecordTypePrototype._defaultValues = defaultValues;
      RecordTypePrototype._keys = keys;
      RecordTypePrototype.size = keys.length;

      try {
        keys.forEach(function(key ) {
          Object.defineProperty(RecordType.prototype, key, {
            get: function() {
              return this.get(key);
            },
            set: function(value) {
              invariant(this.__ownerID, 'Cannot set on an immutable record.');
              this.set(key, value);
            }
          });
        });
      } catch (error) {
        // Object.defineProperty failed. Probably IE8.
      }

      return RecordType;
    }

    Record.prototype.toString = function() {
      return this.__toString(recordName(this) + ' {', '}');
    };

    // @pragma Access

    Record.prototype.has = function(k) {
      return this._defaultValues.hasOwnProperty(k);
    };

    Record.prototype.get = function(k, notSetValue) {
      if (!this.has(k)) {
        return notSetValue;
      }
      var defaultVal = this._defaultValues[k];
      return this._map ? this._map.get(k, defaultVal) : defaultVal;
    };

    // @pragma Modification

    Record.prototype.clear = function() {
      if (this.__ownerID) {
        this._map && this._map.clear();
        return this;
      }
      var SuperRecord = Object.getPrototypeOf(this).constructor;
      return SuperRecord._empty || (SuperRecord._empty = makeRecord(this, emptyMap()));
    };

    Record.prototype.set = function(k, v) {
      if (!this.has(k)) {
        throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
      }
      var newMap = this._map && this._map.set(k, v);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.remove = function(k) {
      if (!this.has(k)) {
        return this;
      }
      var newMap = this._map && this._map.remove(k);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Record.prototype.__iterator = function(type, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterator(type, reverse);
    };

    Record.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterate(fn, reverse);
    };

    Record.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map && this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return makeRecord(this, newMap, ownerID);
    };


  var RecordPrototype = Record.prototype;
  RecordPrototype[DELETE] = RecordPrototype.remove;
  RecordPrototype.deleteIn =
  RecordPrototype.removeIn = MapPrototype.removeIn;
  RecordPrototype.merge = MapPrototype.merge;
  RecordPrototype.mergeWith = MapPrototype.mergeWith;
  RecordPrototype.mergeIn = MapPrototype.mergeIn;
  RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
  RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
  RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  RecordPrototype.setIn = MapPrototype.setIn;
  RecordPrototype.update = MapPrototype.update;
  RecordPrototype.updateIn = MapPrototype.updateIn;
  RecordPrototype.withMutations = MapPrototype.withMutations;
  RecordPrototype.asMutable = MapPrototype.asMutable;
  RecordPrototype.asImmutable = MapPrototype.asImmutable;


  function makeRecord(likeRecord, map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(likeRecord));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }

  function recordName(record) {
    return record._name || record.constructor.name;
  }

  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (
      !isIterable(b) ||
      a.size !== undefined && b.size !== undefined && a.size !== b.size ||
      a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
      isKeyed(a) !== isKeyed(b) ||
      isIndexed(a) !== isIndexed(b) ||
      isOrdered(a) !== isOrdered(b)
    ) {
      return false;
    }

    if (a.size === 0 && b.size === 0) {
      return true;
    }

    var notAssociative = !isAssociative(a);

    if (isOrdered(a)) {
      var entries = a.entries();
      return b.every(function(v, k)  {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done;
    }

    var flipped = false;

    if (a.size === undefined) {
      if (b.size === undefined) {
        a.cacheResult();
      } else {
        flipped = true;
        var _ = a;
        a = b;
        b = _;
      }
    }

    var allEqual = true;
    var bSize = b.__iterate(function(v, k)  {
      if (notAssociative ? !a.has(v) :
          flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
        allEqual = false;
        return false;
      }
    });

    return allEqual && a.size === bSize;
  }

  createClass(Range, IndexedSeq);

    function Range(start, end, step) {
      if (!(this instanceof Range)) {
        return new Range(start, end, step);
      }
      invariant(step !== 0, 'Cannot step a Range by 0');
      start = start || 0;
      if (end === undefined) {
        end = Infinity;
      }
      step = step === undefined ? 1 : Math.abs(step);
      if (end < start) {
        step = -step;
      }
      this._start = start;
      this._end = end;
      this._step = step;
      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
      if (this.size === 0) {
        if (EMPTY_RANGE) {
          return EMPTY_RANGE;
        }
        EMPTY_RANGE = this;
      }
    }

    Range.prototype.toString = function() {
      if (this.size === 0) {
        return 'Range []';
      }
      return 'Range [ ' +
        this._start + '...' + this._end +
        (this._step > 1 ? ' by ' + this._step : '') +
      ' ]';
    };

    Range.prototype.get = function(index, notSetValue) {
      return this.has(index) ?
        this._start + wrapIndex(this, index) * this._step :
        notSetValue;
    };

    Range.prototype.contains = function(searchValue) {
      var possibleIndex = (searchValue - this._start) / this._step;
      return possibleIndex >= 0 &&
        possibleIndex < this.size &&
        possibleIndex === Math.floor(possibleIndex);
    };

    Range.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      begin = resolveBegin(begin, this.size);
      end = resolveEnd(end, this.size);
      if (end <= begin) {
        return new Range(0, 0);
      }
      return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
    };

    Range.prototype.indexOf = function(searchValue) {
      var offsetValue = searchValue - this._start;
      if (offsetValue % this._step === 0) {
        var index = offsetValue / this._step;
        if (index >= 0 && index < this.size) {
          return index
        }
      }
      return -1;
    };

    Range.prototype.lastIndexOf = function(searchValue) {
      return this.indexOf(searchValue);
    };

    Range.prototype.__iterate = function(fn, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(value, ii, this) === false) {
          return ii + 1;
        }
        value += reverse ? -step : step;
      }
      return ii;
    };

    Range.prototype.__iterator = function(type, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      var ii = 0;
      return new Iterator(function()  {
        var v = value;
        value += reverse ? -step : step;
        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
      });
    };

    Range.prototype.equals = function(other) {
      return other instanceof Range ?
        this._start === other._start &&
        this._end === other._end &&
        this._step === other._step :
        deepEqual(this, other);
    };


  var EMPTY_RANGE;

  createClass(Repeat, IndexedSeq);

    function Repeat(value, times) {
      if (!(this instanceof Repeat)) {
        return new Repeat(value, times);
      }
      this._value = value;
      this.size = times === undefined ? Infinity : Math.max(0, times);
      if (this.size === 0) {
        if (EMPTY_REPEAT) {
          return EMPTY_REPEAT;
        }
        EMPTY_REPEAT = this;
      }
    }

    Repeat.prototype.toString = function() {
      if (this.size === 0) {
        return 'Repeat []';
      }
      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };

    Repeat.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._value : notSetValue;
    };

    Repeat.prototype.contains = function(searchValue) {
      return is(this._value, searchValue);
    };

    Repeat.prototype.slice = function(begin, end) {
      var size = this.size;
      return wholeSlice(begin, end, size) ? this :
        new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
    };

    Repeat.prototype.reverse = function() {
      return this;
    };

    Repeat.prototype.indexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return 0;
      }
      return -1;
    };

    Repeat.prototype.lastIndexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return this.size;
      }
      return -1;
    };

    Repeat.prototype.__iterate = function(fn, reverse) {
      for (var ii = 0; ii < this.size; ii++) {
        if (fn(this._value, ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    Repeat.prototype.__iterator = function(type, reverse) {var this$0 = this;
      var ii = 0;
      return new Iterator(function() 
        {return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone()}
      );
    };

    Repeat.prototype.equals = function(other) {
      return other instanceof Repeat ?
        is(this._value, other._value) :
        deepEqual(other);
    };


  var EMPTY_REPEAT;

  /**
   * Contributes additional methods to a constructor
   */
  function mixin(ctor, methods) {
    var keyCopier = function(key ) { ctor.prototype[key] = methods[key]; };
    Object.keys(methods).forEach(keyCopier);
    Object.getOwnPropertySymbols &&
      Object.getOwnPropertySymbols(methods).forEach(keyCopier);
    return ctor;
  }

  Iterable.Iterator = Iterator;

  mixin(Iterable, {

    // ### Conversion to other types

    toArray: function() {
      assertNotInfinite(this.size);
      var array = new Array(this.size || 0);
      this.valueSeq().__iterate(function(v, i)  { array[i] = v; });
      return array;
    },

    toIndexedSeq: function() {
      return new ToIndexedSequence(this);
    },

    toJS: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJS === 'function' ? value.toJS() : value}
      ).__toJS();
    },

    toJSON: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJSON === 'function' ? value.toJSON() : value}
      ).__toJS();
    },

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, true);
    },

    toMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return Map(this.toKeyedSeq());
    },

    toObject: function() {
      assertNotInfinite(this.size);
      var object = {};
      this.__iterate(function(v, k)  { object[k] = v; });
      return object;
    },

    toOrderedMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedMap(this.toKeyedSeq());
    },

    toOrderedSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
    },

    toSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return Set(isKeyed(this) ? this.valueSeq() : this);
    },

    toSetSeq: function() {
      return new ToSetSequence(this);
    },

    toSeq: function() {
      return isIndexed(this) ? this.toIndexedSeq() :
        isKeyed(this) ? this.toKeyedSeq() :
        this.toSetSeq();
    },

    toStack: function() {
      // Use Late Binding here to solve the circular dependency.
      return Stack(isKeyed(this) ? this.valueSeq() : this);
    },

    toList: function() {
      // Use Late Binding here to solve the circular dependency.
      return List(isKeyed(this) ? this.valueSeq() : this);
    },


    // ### Common JavaScript methods and properties

    toString: function() {
      return '[Iterable]';
    },

    __toString: function(head, tail) {
      if (this.size === 0) {
        return head + tail;
      }
      return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    concat: function() {var values = SLICE$0.call(arguments, 0);
      return reify(this, concatFactory(this, values));
    },

    contains: function(searchValue) {
      return this.some(function(value ) {return is(value, searchValue)});
    },

    entries: function() {
      return this.__iterator(ITERATE_ENTRIES);
    },

    every: function(predicate, context) {
      assertNotInfinite(this.size);
      var returnValue = true;
      this.__iterate(function(v, k, c)  {
        if (!predicate.call(context, v, k, c)) {
          returnValue = false;
          return false;
        }
      });
      return returnValue;
    },

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, true));
    },

    find: function(predicate, context, notSetValue) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[1] : notSetValue;
    },

    findEntry: function(predicate, context) {
      var found;
      this.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          found = [k, v];
          return false;
        }
      });
      return found;
    },

    findLastEntry: function(predicate, context) {
      return this.toSeq().reverse().findEntry(predicate, context);
    },

    forEach: function(sideEffect, context) {
      assertNotInfinite(this.size);
      return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
    },

    join: function(separator) {
      assertNotInfinite(this.size);
      separator = separator !== undefined ? '' + separator : ',';
      var joined = '';
      var isFirst = true;
      this.__iterate(function(v ) {
        isFirst ? (isFirst = false) : (joined += separator);
        joined += v !== null && v !== undefined ? v : '';
      });
      return joined;
    },

    keys: function() {
      return this.__iterator(ITERATE_KEYS);
    },

    map: function(mapper, context) {
      return reify(this, mapFactory(this, mapper, context));
    },

    reduce: function(reducer, initialReduction, context) {
      assertNotInfinite(this.size);
      var reduction;
      var useFirst;
      if (arguments.length < 2) {
        useFirst = true;
      } else {
        reduction = initialReduction;
      }
      this.__iterate(function(v, k, c)  {
        if (useFirst) {
          useFirst = false;
          reduction = v;
        } else {
          reduction = reducer.call(context, reduction, v, k, c);
        }
      });
      return reduction;
    },

    reduceRight: function(reducer, initialReduction, context) {
      var reversed = this.toKeyedSeq().reverse();
      return reversed.reduce.apply(reversed, arguments);
    },

    reverse: function() {
      return reify(this, reverseFactory(this, true));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, true));
    },

    some: function(predicate, context) {
      return !this.every(not(predicate), context);
    },

    sort: function(comparator) {
      return reify(this, sortFactory(this, comparator));
    },

    values: function() {
      return this.__iterator(ITERATE_VALUES);
    },


    // ### More sequential methods

    butLast: function() {
      return this.slice(0, -1);
    },

    isEmpty: function() {
      return this.size !== undefined ? this.size === 0 : !this.some(function()  {return true});
    },

    count: function(predicate, context) {
      return ensureSize(
        predicate ? this.toSeq().filter(predicate, context) : this
      );
    },

    countBy: function(grouper, context) {
      return countByFactory(this, grouper, context);
    },

    equals: function(other) {
      return deepEqual(this, other);
    },

    entrySeq: function() {
      var iterable = this;
      if (iterable._cache) {
        // We cache as an entries array, so we can just return the cache!
        return new ArraySeq(iterable._cache);
      }
      var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
      entriesSequence.fromEntrySeq = function()  {return iterable.toSeq()};
      return entriesSequence;
    },

    filterNot: function(predicate, context) {
      return this.filter(not(predicate), context);
    },

    findLast: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
    },

    first: function() {
      return this.find(returnTrue);
    },

    flatMap: function(mapper, context) {
      return reify(this, flatMapFactory(this, mapper, context));
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, true));
    },

    fromEntrySeq: function() {
      return new FromEntriesSequence(this);
    },

    get: function(searchKey, notSetValue) {
      return this.find(function(_, key)  {return is(key, searchKey)}, undefined, notSetValue);
    },

    getIn: function(searchKeyPath, notSetValue) {
      var nested = this;
      // Note: in an ES6 environment, we would prefer:
      // for (var key of searchKeyPath) {
      var iter = forceIterator(searchKeyPath);
      var step;
      while (!(step = iter.next()).done) {
        var key = step.value;
        nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
      return nested;
    },

    groupBy: function(grouper, context) {
      return groupByFactory(this, grouper, context);
    },

    has: function(searchKey) {
      return this.get(searchKey, NOT_SET) !== NOT_SET;
    },

    hasIn: function(searchKeyPath) {
      return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
    },

    isSubset: function(iter) {
      iter = typeof iter.contains === 'function' ? iter : Iterable(iter);
      return this.every(function(value ) {return iter.contains(value)});
    },

    isSuperset: function(iter) {
      return iter.isSubset(this);
    },

    keySeq: function() {
      return this.toSeq().map(keyMapper).toIndexedSeq();
    },

    last: function() {
      return this.toSeq().reverse().first();
    },

    max: function(comparator) {
      return maxFactory(this, comparator);
    },

    maxBy: function(mapper, comparator) {
      return maxFactory(this, comparator, mapper);
    },

    min: function(comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
    },

    minBy: function(mapper, comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
    },

    rest: function() {
      return this.slice(1);
    },

    skip: function(amount) {
      return this.slice(Math.max(0, amount));
    },

    skipLast: function(amount) {
      return reify(this, this.toSeq().reverse().skip(amount).reverse());
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, true));
    },

    skipUntil: function(predicate, context) {
      return this.skipWhile(not(predicate), context);
    },

    sortBy: function(mapper, comparator) {
      return reify(this, sortFactory(this, comparator, mapper));
    },

    take: function(amount) {
      return this.slice(0, Math.max(0, amount));
    },

    takeLast: function(amount) {
      return reify(this, this.toSeq().reverse().take(amount).reverse());
    },

    takeWhile: function(predicate, context) {
      return reify(this, takeWhileFactory(this, predicate, context));
    },

    takeUntil: function(predicate, context) {
      return this.takeWhile(not(predicate), context);
    },

    valueSeq: function() {
      return this.toIndexedSeq();
    },


    // ### Hashable Object

    hashCode: function() {
      return this.__hash || (this.__hash = hashIterable(this));
    },


    // ### Internal

    // abstract __iterate(fn, reverse)

    // abstract __iterator(type, reverse)
  });

  // var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  // var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  // var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  // var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  var IterablePrototype = Iterable.prototype;
  IterablePrototype[IS_ITERABLE_SENTINEL] = true;
  IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
  IterablePrototype.__toJS = IterablePrototype.toArray;
  IterablePrototype.__toStringMapper = quoteString;
  IterablePrototype.inspect =
  IterablePrototype.toSource = function() { return this.toString(); };
  IterablePrototype.chain = IterablePrototype.flatMap;

  // Temporary warning about using length
  (function () {
    try {
      Object.defineProperty(IterablePrototype, 'length', {
        get: function () {
          if (!Iterable.noLengthWarning) {
            var stack;
            try {
              throw new Error();
            } catch (error) {
              stack = error.stack;
            }
            if (stack.indexOf('_wrapObject') === -1) {
              console && console.warn && console.warn(
                'iterable.length has been deprecated, '+
                'use iterable.size or iterable.count(). '+
                'This warning will become a silent error in a future version. ' +
                stack
              );
              return this.size;
            }
          }
        }
      });
    } catch (e) {}
  })();



  mixin(KeyedIterable, {

    // ### More sequential methods

    flip: function() {
      return reify(this, flipFactory(this));
    },

    findKey: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry && entry[0];
    },

    findLastKey: function(predicate, context) {
      return this.toSeq().reverse().findKey(predicate, context);
    },

    keyOf: function(searchValue) {
      return this.findKey(function(value ) {return is(value, searchValue)});
    },

    lastKeyOf: function(searchValue) {
      return this.findLastKey(function(value ) {return is(value, searchValue)});
    },

    mapEntries: function(mapper, context) {var this$0 = this;
      var iterations = 0;
      return reify(this,
        this.toSeq().map(
          function(v, k)  {return mapper.call(context, [k, v], iterations++, this$0)}
        ).fromEntrySeq()
      );
    },

    mapKeys: function(mapper, context) {var this$0 = this;
      return reify(this,
        this.toSeq().flip().map(
          function(k, v)  {return mapper.call(context, k, v, this$0)}
        ).flip()
      );
    },

  });

  var KeyedIterablePrototype = KeyedIterable.prototype;
  KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
  KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
  KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
  KeyedIterablePrototype.__toStringMapper = function(v, k)  {return k + ': ' + quoteString(v)};



  mixin(IndexedIterable, {

    // ### Conversion to other types

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, false);
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, false));
    },

    findIndex: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    indexOf: function(searchValue) {
      var key = this.toKeyedSeq().keyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    lastIndexOf: function(searchValue) {
      return this.toSeq().reverse().indexOf(searchValue);
    },

    reverse: function() {
      return reify(this, reverseFactory(this, false));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, false));
    },

    splice: function(index, removeNum /*, ...values*/) {
      var numArgs = arguments.length;
      removeNum = Math.max(removeNum | 0, 0);
      if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
        return this;
      }
      index = resolveBegin(index, this.size);
      var spliced = this.slice(0, index);
      return reify(
        this,
        numArgs === 1 ?
          spliced :
          spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
      );
    },


    // ### More collection methods

    findLastIndex: function(predicate, context) {
      var key = this.toKeyedSeq().findLastKey(predicate, context);
      return key === undefined ? -1 : key;
    },

    first: function() {
      return this.get(0);
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, false));
    },

    get: function(index, notSetValue) {
      index = wrapIndex(this, index);
      return (index < 0 || (this.size === Infinity ||
          (this.size !== undefined && index > this.size))) ?
        notSetValue :
        this.find(function(_, key)  {return key === index}, undefined, notSetValue);
    },

    has: function(index) {
      index = wrapIndex(this, index);
      return index >= 0 && (this.size !== undefined ?
        this.size === Infinity || index < this.size :
        this.indexOf(index) !== -1
      );
    },

    interpose: function(separator) {
      return reify(this, interposeFactory(this, separator));
    },

    interleave: function(/*...iterables*/) {
      var iterables = [this].concat(arrCopy(arguments));
      var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
      var interleaved = zipped.flatten(true);
      if (zipped.size) {
        interleaved.size = zipped.size * iterables.length;
      }
      return reify(this, interleaved);
    },

    last: function() {
      return this.get(-1);
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, false));
    },

    zip: function(/*, ...iterables */) {
      var iterables = [this].concat(arrCopy(arguments));
      return reify(this, zipWithFactory(this, defaultZipper, iterables));
    },

    zipWith: function(zipper/*, ...iterables */) {
      var iterables = arrCopy(arguments);
      iterables[0] = this;
      return reify(this, zipWithFactory(this, zipper, iterables));
    },

  });

  IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
  IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



  mixin(SetIterable, {

    // ### ES6 Collection methods (ES6 Array and Map)

    get: function(value, notSetValue) {
      return this.has(value) ? value : notSetValue;
    },

    contains: function(value) {
      return this.has(value);
    },


    // ### More sequential methods

    keySeq: function() {
      return this.valueSeq();
    },

  });

  SetIterable.prototype.has = IterablePrototype.contains;


  // Mixin subclasses

  mixin(KeyedSeq, KeyedIterable.prototype);
  mixin(IndexedSeq, IndexedIterable.prototype);
  mixin(SetSeq, SetIterable.prototype);

  mixin(KeyedCollection, KeyedIterable.prototype);
  mixin(IndexedCollection, IndexedIterable.prototype);
  mixin(SetCollection, SetIterable.prototype);


  // #pragma Helper functions

  function keyMapper(v, k) {
    return k;
  }

  function entryMapper(v, k) {
    return [k, v];
  }

  function not(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    }
  }

  function neg(predicate) {
    return function() {
      return -predicate.apply(this, arguments);
    }
  }

  function quoteString(value) {
    return typeof value === 'string' ? JSON.stringify(value) : value;
  }

  function defaultZipper() {
    return arrCopy(arguments);
  }

  function defaultNegComparator(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  }

  function hashIterable(iterable) {
    if (iterable.size === Infinity) {
      return 0;
    }
    var ordered = isOrdered(iterable);
    var keyed = isKeyed(iterable);
    var h = ordered ? 1 : 0;
    var size = iterable.__iterate(
      keyed ?
        ordered ?
          function(v, k)  { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
          function(v, k)  { h = h + hashMerge(hash(v), hash(k)) | 0; } :
        ordered ?
          function(v ) { h = 31 * h + hash(v) | 0; } :
          function(v ) { h = h + hash(v) | 0; }
    );
    return murmurHashOfSize(size, h);
  }

  function murmurHashOfSize(size, h) {
    h = Math__imul(h, 0xCC9E2D51);
    h = Math__imul(h << 15 | h >>> -15, 0x1B873593);
    h = Math__imul(h << 13 | h >>> -13, 5);
    h = (h + 0xE6546B64 | 0) ^ size;
    h = Math__imul(h ^ h >>> 16, 0x85EBCA6B);
    h = Math__imul(h ^ h >>> 13, 0xC2B2AE35);
    h = smi(h ^ h >>> 16);
    return h;
  }

  function hashMerge(a, b) {
    return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
  }

  var Immutable = {

    Iterable: Iterable,

    Seq: Seq,
    Collection: Collection,
    Map: Map,
    OrderedMap: OrderedMap,
    List: List,
    Stack: Stack,
    Set: Set,
    OrderedSet: OrderedSet,

    Record: Record,
    Range: Range,
    Repeat: Repeat,

    is: is,
    fromJS: fromJS,

  };

  return Immutable;

}));
},{}],"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js":[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    try {
      var res = new Response(self);
      if ('HEAD' == method) res.text = null;
      self.callback(null, res);
    } catch(e) {
      var err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      self.callback(err);
    }
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":"C:\\www\\skypicker-components\\node_modules\\superagent\\node_modules\\component-emitter\\index.js","reduce":"C:\\www\\skypicker-components\\node_modules\\superagent\\node_modules\\reduce-component\\index.js"}],"C:\\www\\skypicker-components\\node_modules\\superagent\\node_modules\\component-emitter\\index.js":[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],"C:\\www\\skypicker-components\\node_modules\\superagent\\node_modules\\reduce-component\\index.js":[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}]},{},["./exports/skypicker.jsx"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZXhwb3J0cy9za3lwaWNrZXIuanN4IiwibW9kdWxlcy9BUElzL0ZsaWdodHNBUEkuanN4IiwibW9kdWxlcy9BUElzL1BsYWNlc0FQSS5qc3giLCJtb2R1bGVzL0FQSXMvUGxhY2VzQVBJQ2FjaGVkLmpzeCIsIm1vZHVsZXMvQVBJcy9mbGlnaHRzQVBJLmpzeCIsIm1vZHVsZXMvQVBJcy9tYXBwZXJzL2ZsaWdodHNBcGlUb0pvdXJuZXkuanN4IiwibW9kdWxlcy9jb21wb25lbnRzL0NhbGVuZGFyLmpzeCIsIm1vZHVsZXMvY29tcG9uZW50cy9Nb2RhbFBpY2tlci5qc3giLCJtb2R1bGVzL2NvbXBvbmVudHMvUHJpY2UuanN4IiwibW9kdWxlcy9jb21wb25lbnRzL1RyYW4uanN4IiwibW9kdWxlcy9jb21wb25lbnRzL1RyYW5zbGF0ZS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvSW1tdXRhYmxlLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9NYXBMYWJlbC5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvTWFwUGxhY2UuanN4IiwibW9kdWxlcy9jb250YWluZXJzL09wdGlvbnMuanN4IiwibW9kdWxlcy9jb250YWluZXJzL1BsYWNlLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9SYWRpdXMuanN4IiwibW9kdWxlcy9jb250YWluZXJzL1NlYXJjaERhdGUuanN4IiwibW9kdWxlcy9jb250YWluZXJzL1NlYXJjaEZvcm1EYXRhLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvZmxpZ2h0cy9GbGlnaHQuanN4IiwibW9kdWxlcy9jb250YWluZXJzL2ZsaWdodHMvSm91cm5leS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvZmxpZ2h0cy9NYXN0ZXJTbGF2ZXNQYWlyLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9mbGlnaHRzL1RyaXAuanN4IiwibW9kdWxlcy9jb250YWluZXJzL2ltbXV0YWJsZS5qc3giLCJtb2R1bGVzL21peGlucy9Nb2RhbE1lbnVNaXhpbi5qc3giLCJtb2R1bGVzL21vZHVsZXMvRGF0ZVBpY2tlci9EYXRlUGlja2VyTW9kYWwuanN4IiwibW9kdWxlcy9tb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9DYWxlbmRhckRheS5qc3giLCJtb2R1bGVzL21vZHVsZXMvRGF0ZVBpY2tlci9jb21wb25lbnRzL0NhbGVuZGFyRnJhbWUuanN4IiwibW9kdWxlcy9tb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9EYXRlUGlja2VyLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9EYXRlUGlja2VyL2NvbXBvbmVudHMvTW9udGhNYXRyaXguanN4IiwibW9kdWxlcy9tb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9TZWxlY3REYXlzSW5XZWVrLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9EYXRlUGlja2VyL2NvbXBvbmVudHMvU2xpZGVyLmpzIiwibW9kdWxlcy9tb2R1bGVzL0dyb3VwZWRSZXN1bHRzL0dyb3VwZWRSZXN1bHRzLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9Hcm91cGVkUmVzdWx0cy9jb21wb25lbnRzL0RhdGVGb3JtYXQuanN4IiwibW9kdWxlcy9tb2R1bGVzL0dyb3VwZWRSZXN1bHRzL2NvbXBvbmVudHMvTGlua0J1dHRvbi5qc3giLCJtb2R1bGVzL21vZHVsZXMvR3JvdXBlZFJlc3VsdHMvY29tcG9uZW50cy9QcmljZUdyb3VwLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9Hcm91cGVkUmVzdWx0cy9jb21wb25lbnRzL1RyaXBEZXRhaWxzLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9Hcm91cGVkUmVzdWx0cy9jb21wb25lbnRzL1RyaXBJbmZvLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9NYXAvTWFwT3ZlcmxheS5qc3giLCJtb2R1bGVzL21vZHVsZXMvTWFwL2NvbXBvbmVudHMvTGFiZWxzTGF5ZXIuanN4IiwibW9kdWxlcy9tb2R1bGVzL01hcC9jb21wb25lbnRzL01hcExvYWRlci5qc3giLCJtb2R1bGVzL21vZHVsZXMvTWFwL2NvbXBvbmVudHMvTW91c2VDbGlja0xheWVyLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9NYXAvY29tcG9uZW50cy9Nb3VzZUNsaWNrVGlsZS5qc3giLCJtb2R1bGVzL21vZHVsZXMvTWFwL2NvbXBvbmVudHMvUGxhY2VMYWJlbC5qc3giLCJtb2R1bGVzL21vZHVsZXMvTWFwL2NvbXBvbmVudHMvUG9pbnQuanN4IiwibW9kdWxlcy9tb2R1bGVzL01hcC9jb21wb25lbnRzL1BvaW50U1ZHLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9NYXAvY29tcG9uZW50cy9Qb2ludHNMYXllci5qc3giLCJtb2R1bGVzL21vZHVsZXMvTWFwL2NvbXBvbmVudHMvUG9pbnRzU1ZHTGF5ZXIuanN4IiwibW9kdWxlcy9tb2R1bGVzL1BsYWNlUGlja2VyL1BsYWNlUGlja2VyTW9kYWwuanN4IiwibW9kdWxlcy9tb2R1bGVzL1BsYWNlUGlja2VyL2NvbXBvbmVudHMvUGxhY2VQaWNrZXIuanN4IiwibW9kdWxlcy9tb2R1bGVzL1BsYWNlUGlja2VyL2NvbXBvbmVudHMvUGxhY2VSb3cuanN4IiwibW9kdWxlcy9tb2R1bGVzL1BsYWNlUGlja2VyL2NvbXBvbmVudHMvUGxhY2VzLmpzeCIsIm1vZHVsZXMvbW9kdWxlcy9TZWFyY2hGb3JtL1NlYXJjaEZvcm0uanN4IiwibW9kdWxlcy9tb2R1bGVzL1NlYXJjaEZvcm0vY29tcG9uZW50cy9QYXNzZW5nZXJzRmllbGQuanN4IiwibW9kdWxlcy9tb2R1bGVzL1NlYXJjaEZvcm0vY29tcG9uZW50cy9Ub2dnbGVBY3RpdmUuanN4IiwibW9kdWxlcy9wbGFpbkpzQWRhcHRlcnMvU2VhcmNoRm9ybUFkYXB0ZXIuanN4IiwibW9kdWxlcy9zdG9yZXMvTWFwTGFiZWxzU3RvcmUuanN4IiwibW9kdWxlcy9zdG9yZXMvTWFwUGxhY2VzSW5kZXguanN4IiwibW9kdWxlcy9zdG9yZXMvTWFwUGxhY2VzU3RvcmUuanN4IiwibW9kdWxlcy9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCIsIm1vZHVsZXMvc3RvcmVzL1NlYXJjaEZvcm1TdG9yZS5qc3giLCJtb2R1bGVzL3Rvb2xzL0FQSU1hbmFnZXIuanN4IiwibW9kdWxlcy90b29scy9EYXRlUGFpclZhbGlkYXRvci5qc3giLCJtb2R1bGVzL3Rvb2xzL0RhdGVUb29scy5qcyIsIm1vZHVsZXMvdG9vbHMvR2VvbG9jYXRpb24uanN4IiwibW9kdWxlcy90b29scy9nZW8uanMiLCJtb2R1bGVzL3Rvb2xzL2lzSUUuanMiLCJtb2R1bGVzL3Rvb2xzL2xhdGxvbi5qcyIsIm1vZHVsZXMvdG9vbHMvcXVhZHRyZWUuanMiLCJtb2R1bGVzL3Rvb2xzL3NwVHIuanMiLCJtb2R1bGVzL3Rvb2xzL3RyLmpzIiwibW9kdWxlcy90b29scy90cmFuc2xhdGUuanN4Iiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcG1lcmdlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ltbXV0YWJsZS9kaXN0L2ltbXV0YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9jbGllbnQuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvcmVkdWNlLWNvbXBvbmVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xudmFyIHRyYW5zbGF0aW9uU3RyYXRlZ3kgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvdG9vbHMvc3BUci5qcycpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3Rvb2xzL3RyLmpzJyk7XG50ci5zZXRTdHJhdGVneSh0cmFuc2xhdGlvblN0cmF0ZWd5KTtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xuXG4vL2p1c3QgaW5jbHVkZSBpdCB0byBzZXR1cFxudmFyIEFQSU1hbmFnZXIgPSByZXF1aXJlKFwiLi8uLi9tb2R1bGVzL3Rvb2xzL0FQSU1hbmFnZXIuanN4XCIpO1xuXG5cbndpbmRvdy5XZ3RzID0ge307IC8vVGhhdCdzIG5hbWVzcGFjZSBpZiB0aGVyZSB3aWxsIGJlIHNvbWUgbmFtZSBjb2xsaXNpb25cblxud2luZG93LlBsYWNlID0gV2d0cy5QbGFjZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xud2luZG93LlJhZGl1cyA9IFdndHMuUmFkaXVzID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL2NvbnRhaW5lcnMvUmFkaXVzLmpzeCcpO1xud2luZG93LlNlYXJjaERhdGUgPSBXZ3RzLlNlYXJjaERhdGUgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCcpO1xud2luZG93LlNlYXJjaFBsYWNlID0gV2d0cy5TZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xud2luZG93LlNlYXJjaEZvcm1EYXRhID0gV2d0cy5TZWFyY2hGb3JtRGF0YSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1NlYXJjaEZvcm1EYXRhLmpzeCcpO1xud2luZG93LlNlYXJjaEZvcm1TdG9yZSA9IFdndHMuU2VhcmNoRm9ybVN0b3JlID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4Jyk7XG53aW5kb3cuT3B0aW9uc1N0b3JlID0gV2d0cy5PcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvc3RvcmVzL09wdGlvbnNTdG9yZS5qc3gnKTtcbndpbmRvdy5PcHRpb25zID0gV2d0cy5PcHRpb25zID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL2NvbnRhaW5lcnMvT3B0aW9ucy5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtQWRhcHRlciA9IFdndHMuU2VhcmNoRm9ybUFkYXB0ZXIgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvcGxhaW5Kc0FkYXB0ZXJzL1NlYXJjaEZvcm1BZGFwdGVyLmpzeCcpO1xuLy9NQVBcbndpbmRvdy5NYXBPdmVybGF5ID0gV2d0cy5NYXBPdmVybGF5ID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL21vZHVsZXMvTWFwL01hcE92ZXJsYXkuanN4Jyk7XG53aW5kb3cuTWFwTG9hZGVyID0gV2d0cy5NYXBMb2FkZXIgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvbW9kdWxlcy9NYXAvY29tcG9uZW50cy9NYXBMb2FkZXIuanN4Jyk7XG53aW5kb3cuTWFwUGxhY2VzU3RvcmUgPSBXZ3RzLk1hcFBsYWNlc1N0b3JlID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3N0b3Jlcy9NYXBQbGFjZXNTdG9yZS5qc3gnKTtcbi8vUkVTVUxUU1xud2luZG93Lkdyb3VwZWRSZXN1bHRzID0gV2d0cy5Hcm91cGVkUmVzdWx0cyA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9tb2R1bGVzL0dyb3VwZWRSZXN1bHRzL0dyb3VwZWRSZXN1bHRzLmpzeCcpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuZXcgdmVyc2lvbiwgbm90IHRlc3RlZCwgbm90IGZpbmlzaGVkLCBzaG91bGQgYmUgZmluaXNoZWQgbGF0ZXJcclxudmFyIFEgPSAod2luZG93LlEpO1xyXG52YXIgc3VwZXJhZ2VudCAgPSByZXF1aXJlKFwic3VwZXJhZ2VudFwiKTtcclxudmFyIG1vbWVudCAgPSAod2luZG93Lm1vbWVudCk7XHJcbnZhciBmbGlnaHRzQXBpVG9Kb3VybmV5ID0gcmVxdWlyZShcIi4vbWFwcGVycy9mbGlnaHRzQXBpVG9Kb3VybmV5LmpzeFwiKTtcclxuXHJcblxyXG52YXIgZm9ybWF0U1BBcGlEYXRlID0gXCJERC9NTS9ZWVlZXCI7XHJcblxyXG4vL1RPRE8gY2hlY2sgaWYgb24gZXJyb3IgaXMgY2FsbGVkIGV4YWN0bHkgd2hlbiBlcnJvciBpbiBjYWxsYmFjayBvciBub3QsIHRoZW4gQWRkIGl0IHRvIHByb21pc2VcclxudmFyIGhhbmRsZUVycm9yID0gZnVuY3Rpb24gKGVycikge1xyXG4gIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcbiAgZnVuY3Rpb24gRmxpZ2h0c0FQSSgpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHRoaXMub3B0aW9ucyA9IHtcclxuICAgICAgbGFuZ3VhZ2U6IFwiZW5cIixcclxuICAgICAgZm9ybWF0OiBcIm1hcHBlZFwiIC8vIFwibWFwcGVkXCIgb3IgXCJvcmlnaW5hbFwiXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgRmxpZ2h0c0FQSS5wcm90b3R5cGUuY2hhbmdlT3B0aW9ucz1mdW5jdGlvbihuZXdPcHRpb25zKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBPYmplY3Qua2V5cyhuZXdPcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcclxuICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBuZXdPcHRpb25zW2tleV07XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgfTtcclxuICAvKlxyXG4gICAgICBSZXF1ZXN0OlxyXG4gICAgICB7XHJcbiAgICAgICAgb3JpZ2luOiBzdHJpbmcgKGlkKSB8XHJcbiAgICAgICAgZGVzdGluYXRpb246IHN0cmluZyAoaWQpLCBkZWZhdWx0OiBcImFueXdoZXJlXCJcclxuICAgICAgICBvdXRib3VuZERhdGU6IFNlYXJjaERhdGVcclxuICAgICAgICBpbmJvdW5kRGF0ZTogU2VhcmNoRGF0ZSB8IG51bGxcclxuICAgICAgICBwYXNzZW5nZXJzOiBudW1iZXIsIGRlZmF1bHQ6IDFcclxuICAgICAgICBmbHlEYXlzOiAobm90IHVzZWQgbm93KVxyXG4gICAgICAgIC8vZGF5c0luRGVzdGluYXRpb246IHtmcm9tOiBpbnQsIHRvOiBpbnR9LCBkZWZhdWx0OiBudWxsXHJcbiAgICAgICAgZGlyZWN0RmxpZ2h0czogKG5vdCB1c2VkIG5vdylcclxuXHJcbiAgICAgICAgb25lUGVyRGF5OiBib29sLCBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICAgIG9uZUZvckNpdHk6IGJvb2wsIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgKi9cclxuICBGbGlnaHRzQVBJLnByb3RvdHlwZS5maW5kRmxpZ2h0cz1mdW5jdGlvbihyZXF1ZXN0LCBtb2RpZmllZE9wdGlvbnMpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBzZWFyY2hQYXJhbXMsIHNreXBpY2tlckFwaVVybDtcclxuICAgIG1vZGlmaWVkT3B0aW9ucyA9IG1vZGlmaWVkT3B0aW9ucyB8fCB7fTtcclxuICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICBsYW5ndWFnZTogbW9kaWZpZWRPcHRpb25zLmxhbmd1YWdlIHx8IHRoaXMub3B0aW9ucy5sYW5ndWFnZSxcclxuICAgICAgZm9ybWF0OiBtb2RpZmllZE9wdGlvbnMuZm9ybWF0IHx8IHRoaXMub3B0aW9ucy5mb3JtYXRcclxuICAgIH07XHJcbiAgICBza3lwaWNrZXJBcGlVcmwgPSBcImh0dHBzOi8vYXBpLnNreXBpY2tlci5jb20vZmxpZ2h0c1wiO1xyXG4gICAgc2VhcmNoUGFyYW1zID0ge1xyXG4gICAgICB2OiAyLFxyXG4gICAgICAvL2ZseURheXM6IFtdLFxyXG4gICAgICAvL2RpcmVjdEZsaWdodHM6IDAsXHJcbiAgICAgIHNvcnQ6IFwicHJpY2VcIixcclxuICAgICAgYXNjOiAxLFxyXG4gICAgICBsb2NhbGU6IG9wdGlvbnMubGFuZ3VhZ2UsXHJcbiAgICAgIGRheXNJbkRlc3RpbmF0aW9uRnJvbTogXCJcIixcclxuICAgICAgZGF5c0luRGVzdGluYXRpb25UbzogXCJcIlxyXG5cclxuICAgIH07XHJcblxyXG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0Lm9yaWdpbiA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5mbHlGcm9tID0gcmVxdWVzdC5vcmlnaW47XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3JpZ2luLm1vZGUgPT0gXCJwbGFjZVwiKSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5mbHlGcm9tID0gcmVxdWVzdC5vcmlnaW4udmFsdWUuaWQ7XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3JpZ2luLm1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5mbHlGcm9tID0gXCJhbnl3aGVyZVwiO1xyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm9yaWdpbi5tb2RlID09PSBcInJhZGl1c1wiKSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5yYWRpdXNGcm9tID0gcmVxdWVzdC5vcmlnaW4udmFsdWUucmFkaXVzO1xyXG4gICAgICBzZWFyY2hQYXJhbXMubGF0aXR1ZGVGcm9tID0gcmVxdWVzdC5vcmlnaW4udmFsdWUubGF0O1xyXG4gICAgICBzZWFyY2hQYXJhbXMubG9uZ2l0dWRlRnJvbSA9IHJlcXVlc3Qub3JpZ2luLnZhbHVlLmxuZztcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHJlcXVlc3QuZGVzdGluYXRpb24gPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBzZWFyY2hQYXJhbXMudG8gPSByZXF1ZXN0LmRlc3RpbmF0aW9uO1xyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0LmRlc3RpbmF0aW9uLm1vZGUgPT0gXCJwbGFjZVwiKSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy50byA9IHJlcXVlc3QuZGVzdGluYXRpb24udmFsdWUuaWQ7XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3QuZGVzdGluYXRpb24ubW9kZSA9PSBcImFueXdoZXJlXCIpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLnRvID0gXCJhbnl3aGVyZVwiO1xyXG4gICAgfSBlbHNlIGlmIChyZXF1ZXN0LmRlc3RpbmF0aW9uLm1vZGUgPT09IFwicmFkaXVzXCIpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLnJhZGl1c1RvID0gcmVxdWVzdC5kZXN0aW5hdGlvbi52YWx1ZS5yYWRpdXM7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5sYXRpdHVkZVRvID0gcmVxdWVzdC5kZXN0aW5hdGlvbi52YWx1ZS5sYXQ7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5sb25naXR1ZGVUbyA9IHJlcXVlc3QuZGVzdGluYXRpb24udmFsdWUubG5nO1xyXG4gICAgfVxyXG5cclxuICAgIHNlYXJjaFBhcmFtcy5kYXRlRnJvbSA9IHJlcXVlc3Qub3V0Ym91bmREYXRlLmdldEZyb20oKS5mb3JtYXQoZm9ybWF0U1BBcGlEYXRlKTtcclxuICAgIHNlYXJjaFBhcmFtcy5kYXRlVG8gPSByZXF1ZXN0Lm91dGJvdW5kRGF0ZS5nZXRUbygpLmZvcm1hdChmb3JtYXRTUEFwaURhdGUpO1xyXG4gICAgaWYgKHJlcXVlc3QuaW5ib3VuZERhdGUpIHtcclxuICAgICAgaWYgKHJlcXVlc3QuaW5ib3VuZERhdGUubW9kZSA9PSBcImludGVydmFsXCIgfHwgcmVxdWVzdC5pbmJvdW5kRGF0ZS5tb2RlID09IFwic2luZ2xlXCIgIHx8IHJlcXVlc3QuaW5ib3VuZERhdGUubW9kZSA9PSBcImFueXRpbWVcIiApIHtcclxuICAgICAgICBzZWFyY2hQYXJhbXMudHlwZUZsaWdodCA9IFwicmV0dXJuXCI7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLnJldHVybkZyb20gPSByZXF1ZXN0LmluYm91bmREYXRlLmdldEZyb20oKS5mb3JtYXQoZm9ybWF0U1BBcGlEYXRlKTtcclxuICAgICAgICBzZWFyY2hQYXJhbXMucmV0dXJuVG8gPSByZXF1ZXN0LmluYm91bmREYXRlLmdldFRvKCkuZm9ybWF0KGZvcm1hdFNQQXBpRGF0ZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5pbmJvdW5kRGF0ZS5tb2RlID09IFwidGltZVRvU3RheVwiKSB7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLnR5cGVGbGlnaHQgPSBcInJldHVyblwiO1xyXG4gICAgICAgIHNlYXJjaFBhcmFtcy5kYXlzSW5EZXN0aW5hdGlvbkZyb20gPSByZXF1ZXN0LmluYm91bmREYXRlLmdldE1pblN0YXlEYXlzKCk7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLmRheXNJbkRlc3RpbmF0aW9uVG8gPSByZXF1ZXN0LmluYm91bmREYXRlLmdldE1heFN0YXlEYXlzKCk7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLnJldHVybkZyb20gPSBcIlwiO1xyXG4gICAgICAgIHNlYXJjaFBhcmFtcy5yZXR1cm5UbyA9IFwiXCI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLnR5cGVGbGlnaHQgPSBcIm9uZXdheVwiO1xyXG4gICAgICAgIHNlYXJjaFBhcmFtcy5yZXR1cm5Gcm9tID0gXCJcIjtcclxuICAgICAgICBzZWFyY2hQYXJhbXMucmV0dXJuVG8gPSBcIlwiO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWFyY2hQYXJhbXMudHlwZUZsaWdodCA9IFwib25ld2F5XCI7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5yZXR1cm5Gcm9tID0gXCJcIjtcclxuICAgICAgc2VhcmNoUGFyYW1zLnJldHVyblRvID0gXCJcIjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVxdWVzdC5vbmVQZXJEYXkpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLm9uZV9wZXJfZGF0ZSA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlcXVlc3Qub25lRm9yQ2l0eSkge1xyXG4gICAgICBzZWFyY2hQYXJhbXMub25lZm9yY2l0eSA9IDE7IC8vIG9uZWZvcmNpdHk6IHJlcXVlc3Qub25lRm9yQ2l0eSA/IFwiMVwiIDogXCJcIixcclxuICAgIH1cclxuXHJcblxyXG4gICAgc2VhcmNoUGFyYW1zLmFkdWx0cyA9IHJlcXVlc3QucGFzc2VuZ2VycyB8fCAxO1xyXG4gICAgc2VhcmNoUGFyYW1zLmNoaWxkcmVuID0gMDtcclxuICAgIHNlYXJjaFBhcmFtcy5pbmZhbnRzID0gMDtcclxuXHJcblxyXG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xyXG4gICAgc3VwZXJhZ2VudFxyXG4gICAgICAuZ2V0KHNreXBpY2tlckFwaVVybClcclxuICAgICAgLnF1ZXJ5KHNlYXJjaFBhcmFtcylcclxuICAgICAgLy8uc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJylcclxuICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxyXG4gICAgICAub24oJ2Vycm9yJywgaGFuZGxlRXJyb3IpXHJcbiAgICAgIC5lbmQoZnVuY3Rpb24oZXJyb3IsIHJlcykgIHtcclxuICAgICAgICBpZiAoIWVycm9yKSB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5mb3JtYXQgPT0gXCJvcmlnaW5hbFwiKSB7XHJcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXMuYm9keS5kYXRhKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB2YXIgZm9ybWF0dGVkID0gcmVzLmJvZHkuZGF0YS5tYXAoZnVuY3Rpb24oZmxpZ2h0KSAge3JldHVybiBmbGlnaHRzQXBpVG9Kb3VybmV5KGZsaWdodCk7fSk7XHJcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShmb3JtYXR0ZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvL1RvdGFsbHkgd2VpcmQgZXJyb3IgaGFuZGxpbmcgYnkgc3VwZXJhZ2VudFxyXG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBGbGlnaHRzQVBJKCk7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBzdXBlcmFnZW50ICA9IHJlcXVpcmUoXCJzdXBlcmFnZW50XCIpO1xudmFyIFBsYWNlICA9IHJlcXVpcmUoXCIuLi9jb250YWluZXJzL1BsYWNlLmpzeFwiKTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcbnZhciBRID0gKHdpbmRvdy5RKTtcblxudmFyIHVybCA9IFwiaHR0cHM6Ly9hcGkuc2t5cGlja2VyLmNvbS9wbGFjZXNcIjtcblxuLy9UT0RPIGNoZWNrIGlmIG9uIGVycm9yIGlzIGNhbGxlZCBleGFjdGx5IHdoZW4gZXJyb3IgaW4gY2FsbGJhY2sgb3Igbm90LCB0aGVuIEFkZCBpdCB0byBwcm9taXNlXG52YXIgaGFuZGxlRXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gIGNvbnNvbGUuZXJyb3IoZXJyKTtcbn07XG5cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHNldHRpbmdzLmxhbmcgLSBsYW5ndWFnZSBpbiB3aGljaCB3ZSBnZXQgcGxhY2VzIG5hbWFzXG4gICAqL1xuICBmdW5jdGlvbiBQbGFjZXNBUEkoc2V0dGluZ3MpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XG4gIH1cblxuICAvKipcbiAgICogZmluZCBwbGFjZXMgYWNjb3JkaW5nIHRvIGdpdmVuIGF0dHJpYnV0ZXNcbiAgICogQHBhcmFtIHBsYWNlU2VhcmNoLnRlcm0gLSBzdHJpbmcgdG8gc2VhcmNoXG4gICAqIEBwYXJhbSBwbGFjZVNlYXJjaC50eXBlSUQgLS0gdHlwZSBpZFxuICAgKiBAcGFyYW0gcGxhY2VTZWFyY2guYm91bmRzXG4gICAqIEByZXR1cm4gcHJvbWlzZVxuICAgKi9cbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5maW5kUGxhY2VzPWZ1bmN0aW9uKHBsYWNlU2VhcmNoKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgIHBsYWNlU2VhcmNoID0gcGxhY2VTZWFyY2ggfHwge307XG4gICAgaWYgKHBsYWNlU2VhcmNoLnRlcm0pIHtcbiAgICAgIHBhcmFtcy50ZXJtID0gcGxhY2VTZWFyY2gudGVybTtcbiAgICB9XG4gICAgaWYgKHBsYWNlU2VhcmNoLmJvdW5kcykge1xuICAgICAgcGFyYW1zID0gZGVlcG1lcmdlKHBhcmFtcywgcGxhY2VTZWFyY2guYm91bmRzKVxuICAgIH1cbiAgICBpZiAocGxhY2VTZWFyY2gudHlwZUlEKSB7XG4gICAgICBwYXJhbXMudHlwZSA9IHBsYWNlU2VhcmNoLnR5cGVJRDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuJFBsYWNlc0FQSV9jYWxsQVBJKHBhcmFtcyk7XG4gIH07XG5cblxuICBQbGFjZXNBUEkucHJvdG90eXBlLiRQbGFjZXNBUElfY29udmVydFJlc3VsdHM9ZnVuY3Rpb24ocmVzdWx0cykge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiByZXN1bHRzLm1hcChmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICByZXR1cm4gbmV3IFBsYWNlKHJlc3VsdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgUGxhY2VzQVBJLnByb3RvdHlwZS4kUGxhY2VzQVBJX2NhbGxBUEk9ZnVuY3Rpb24ocGFyYW1zKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHZhciBkZWZhdWx0UGFyYW1zID0ge1xuICAgICAgdjogMixcbiAgICAgIGxvY2FsZTogdGhpcy5zZXR0aW5ncy5sYW5nXG4gICAgfTtcbiAgICBzdXBlcmFnZW50XG4gICAgICAuZ2V0KHVybClcbiAgICAgIC5xdWVyeShkZWVwbWVyZ2UocGFyYW1zLCBkZWZhdWx0UGFyYW1zKSlcbiAgICAgIC8vLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpXG4gICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAub24oJ2Vycm9yJywgaGFuZGxlRXJyb3IpXG4gICAgICAuZW5kKCBmdW5jdGlvbihyZXMpICB7XG4gICAgICAgIGlmICghcmVzLmVycm9yKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0aGlzLiRQbGFjZXNBUElfY29udmVydFJlc3VsdHMocmVzLmJvZHkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKHJlcy5lcnJvcikpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gaWQgLSBwbGFjZSBpZFxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUucmVnaXN0ZXJJbXBvcnRhbmNlPWZ1bmN0aW9uKGlkKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHN1cGVyYWdlbnRcbiAgICAgIC5wb3N0KHVybCArIFwiL1wiICsgaWQpXG4gICAgICAuZW5kKCBmdW5jdGlvbihyZXMpICB7XG4gICAgICAgIGlmICghcmVzLmVycm9yKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0aGlzLiRQbGFjZXNBUElfY29udmVydFJlc3VsdHMocmVzLmJvZHkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKHJlcy5lcnJvcikpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBmaW5kIGJ5IGlkIGFuZCByZWdpc3RlciBpbXBvcnRhbmNlXG4gICAqIEBwYXJhbSBpZFxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuZmluZEJ5SWQ9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgIHY6IDIsXG4gICAgICBsb2NhbGU6IHRoaXMuc2V0dGluZ3MubGFuZyxcbiAgICAgIGlkOiBpZFxuICAgIH07XG4gICAgc3VwZXJhZ2VudFxuICAgICAgLmdldCh1cmwgKyBcIi9cIiArIGlkKVxuICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgIC8vLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpXG4gICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAub24oJ2Vycm9yJywgaGFuZGxlRXJyb3IpXG4gICAgICAuZW5kKCBmdW5jdGlvbihyZXMpICB7XG4gICAgICAgIGlmICghcmVzLmVycm9yKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShuZXcgUGxhY2UocmVzLmJvZHkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKHJlcy5lcnJvcikpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIC8vQ2FsbCBvbmUgbW9yZSBwb3N0XG4gICAgdGhpcy5yZWdpc3RlckltcG9ydGFuY2UoaWQpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIHVzZSBmaW5kUGxhY2VzXG4gICAqL1xuICBQbGFjZXNBUEkucHJvdG90eXBlLmZpbmRCeU5hbWU9ZnVuY3Rpb24odGVybSkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLiRQbGFjZXNBUElfY2FsbEFQSSh7dGVybTogdGVybX0pO1xuICB9O1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgdXNlIGZpbmRQbGFjZXNcbiAgICovXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuZmluZE5lYXJieT1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy4kUGxhY2VzQVBJX2NhbGxBUEkoYm91bmRzKTtcbiAgfTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2VzQVBJO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUGxhY2VzQVBJICA9IHJlcXVpcmUoXCIuL1BsYWNlc0FQSS5qc3hcIik7XG52YXIgUSAgPSAod2luZG93LlEpO1xuXG52YXIgR2xvYmFsUHJvbWlzZXNTdG9yZSA9IHt9O1xuXG4vKipcbiAqIENhY2hlZCBQbGFjZXNBUEksIGl0IHNob3VsZCBoYXZlIGFsd2F5cyBzYW1lIGludGVyZmFjZSBhcyBQbGFjZXNBUElcbiAqL1xuXG4gIGZ1bmN0aW9uIFBsYWNlc0FQSUNhY2hlZChzZXR0aW5ncykge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMucGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSShzZXR0aW5ncyk7XG4gIH1cbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5jYWxsQ2FjaGVkPWZ1bmN0aW9uKGZ1bmMsIHBhcmFtcywga2V5KSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKCFHbG9iYWxQcm9taXNlc1N0b3JlW2tleV0pIHtcbiAgICAgIEdsb2JhbFByb21pc2VzU3RvcmVba2V5XSA9IGZ1bmMocGFyYW1zKTtcbiAgICB9XG4gICAgcmV0dXJuIEdsb2JhbFByb21pc2VzU3RvcmVba2V5XTtcbiAgfTtcblxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmJvdW5kc1RvU3RyaW5nPWZ1bmN0aW9uKGJvdW5kcykge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiBib3VuZHMubGF0X2xvICsgXCJfXCIgKyBib3VuZHMubG5nX2xvICsgXCJfXCIgKyBib3VuZHMubGF0X2hpICsgXCJfXCIgKyBib3VuZHMubG5nX2hpO1xuICB9O1xuXG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuZmluZFBsYWNlcz1mdW5jdGlvbihzZWFyY2hQYXJhbXMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIga2V5ID0gXCJwX1wiO1xuICAgIGlmIChzZWFyY2hQYXJhbXMudGVybSkge1xuICAgICAga2V5ICs9IFwidGVybTpcIitzZWFyY2hQYXJhbXMudGVybVxuICAgIH1cbiAgICBpZiAoc2VhcmNoUGFyYW1zLmJvdW5kcykge1xuICAgICAga2V5ICs9IFwiYm91bmRzOlwiK3RoaXMuYm91bmRzVG9TdHJpbmcoc2VhcmNoUGFyYW1zLmJvdW5kcylcbiAgICB9XG4gICAgaWYgKHNlYXJjaFBhcmFtcy50eXBlSUQpIHtcbiAgICAgIGtleSArPSBcInR5cGU6XCIrc2VhcmNoUGFyYW1zLnR5cGVJRFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmRQbGFjZXMuYmluZCh0aGlzLnBsYWNlc0FQSSksIHNlYXJjaFBhcmFtcywga2V5KTtcbiAgfTtcblxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmRCeU5hbWU9ZnVuY3Rpb24odGVybSkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmNhbGxDYWNoZWQodGhpcy5wbGFjZXNBUEkuZmluZEJ5TmFtZS5iaW5kKHRoaXMucGxhY2VzQVBJKSwgdGVybSwgdGVybSk7XG4gIH07XG5cbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5maW5kTmVhcmJ5PWZ1bmN0aW9uKGJvdW5kcykge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmNhbGxDYWNoZWQodGhpcy5wbGFjZXNBUEkuZmluZE5lYXJieS5iaW5kKHRoaXMucGxhY2VzQVBJKSwgYm91bmRzLCB0aGlzLmJvdW5kc1RvU3RyaW5nKGJvdW5kcykpO1xuICB9O1xuXG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuZmluZEJ5SWQ9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmRCeUlkLmJpbmQodGhpcy5wbGFjZXNBUEkpLCBpZCwgXCJpZDpcIitpZCk7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZXNBUElDYWNoZWQ7XG4iLCJhcmd1bWVudHNbNF1bXCJDOlxcXFx3d3dcXFxcc2t5cGlja2VyLWNvbXBvbmVudHNcXFxcbW9kdWxlc1xcXFxBUElzXFxcXEZsaWdodHNBUEkuanN4XCJdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsIlwidXNlIHN0cmljdFwiO1xudmFyIEpvdXJuZXkgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvZmxpZ2h0cy9Kb3VybmV5LmpzeCcpO1xyXG52YXIgRmxpZ2h0ID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL2ZsaWdodHMvRmxpZ2h0LmpzeCcpO1xyXG52YXIgVHJpcCA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9mbGlnaHRzL1RyaXAuanN4Jyk7XHJcbnZhciBJbW11dGFibGUgPSByZXF1aXJlKCdpbW11dGFibGUnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xyXG4gIHZhciBvdXRib3VuZFRyaXAgPSBbXTtcclxuICB2YXIgaW5ib3VuZFRyaXAgPSBbXTtcclxuXHJcbiAgdmFyIGpvdXJuZXkgPSBuZXcgSm91cm5leSh7XHJcbiAgICBpZDogb2JqWydpZCddLFxyXG4gICAgc291cmNlOiBvYmpbJ3NvdXJjZSddXHJcbiAgfSk7XHJcblxyXG4gIGpvdXJuZXkgPSBqb3VybmV5LnNldEluKFsncHJpY2VzJywgJ2RlZmF1bHQnXSwgb2JqWydwcmljZSddKTtcclxuXHJcblxyXG4gIG9iai5yb3V0ZS5mb3JFYWNoKGZ1bmN0aW9uKGZsaWdodE9iaikge1xyXG5cclxuICAgIHZhciBmbGlnaHQgPSBuZXcgRmxpZ2h0KHtcclxuICAgICAgaWQ6IGZsaWdodE9ialsnaWQnXSxcclxuICAgICAgbnVtYmVyOiBmbGlnaHRPYmpbJ2ZsaWdodF9ubyddLFxyXG5cclxuICAgICAgLy9UT0RPIHRoaW5nIGFib3V0IHVzZSBvZiBQbGFjZSBhbmQgVGltZUluUGxhY2Ugb2JqZWN0c1xyXG4gICAgICBkZXBhcnR1cmU6IEltbXV0YWJsZS5mcm9tSlMoe1xyXG4gICAgICAgIHdoZXJlOiB7XHJcbiAgICAgICAgICBpZDogZmxpZ2h0T2JqWydtYXBJZGZyb20nXSxcclxuICAgICAgICAgIGNvZGU6IGZsaWdodE9ialsnZmx5RnJvbSddLFxyXG4gICAgICAgICAgbmFtZTogZmxpZ2h0T2JqWydjaXR5RnJvbSddLFxyXG4gICAgICAgICAgbGF0OiBmbGlnaHRPYmpbJ2xhdEZyb20nXSxcclxuICAgICAgICAgIGxuZzogZmxpZ2h0T2JqWydsbmdGcm9tJ11cclxuICAgICAgICB9LFxyXG4gICAgICAgIHdoZW46IHtcclxuICAgICAgICAgIGxvY2FsOiBtb21lbnQudXRjKGZsaWdodE9ialsnZFRpbWUnXSAqIDEwMDApLFxyXG4gICAgICAgICAgdXRjOiBtb21lbnQudXRjKGZsaWdodE9ialsnZFRpbWVVVEMnXSAqIDEwMDApXHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICAgICAgYXJyaXZhbDogSW1tdXRhYmxlLmZyb21KUyh7XHJcbiAgICAgICAgd2hlcmU6IHtcclxuICAgICAgICAgIGlkOiBmbGlnaHRPYmpbJ21hcElkdG8nXSxcclxuICAgICAgICAgIGNvZGU6IGZsaWdodE9ialsnZmx5VG8nXSxcclxuICAgICAgICAgIG5hbWU6IGZsaWdodE9ialsnY2l0eVRvJ10sXHJcbiAgICAgICAgICBsYXQ6IGZsaWdodE9ialsnbGF0VG8nXSxcclxuICAgICAgICAgIGxuZzogZmxpZ2h0T2JqWydsbmdUbyddXHJcbiAgICAgICAgfSxcclxuICAgICAgICB3aGVuOiB7XHJcbiAgICAgICAgICBsb2NhbDogbW9tZW50LnV0YyhmbGlnaHRPYmpbJ2FUaW1lJ10gKiAxMDAwKSxcclxuICAgICAgICAgIHV0YzogbW9tZW50LnV0YyhmbGlnaHRPYmpbJ2FUaW1lVVRDJ10gKiAxMDAwKVxyXG4gICAgICAgIH1cclxuICAgICAgfSksXHJcbiAgICAgIGFpcmxpbmU6IEltbXV0YWJsZS5mcm9tSlMoe1xyXG4gICAgICAgIGNvZGU6IGZsaWdodE9ialsnYWlybGluZSddXHJcbiAgICAgICAgLy9uYW1lOiBhaXJsaW5lc1tmbGlnaHRPYmpbJ2FpcmxpbmUnXV0gJiYgYWlybGluZXNbZmxpZ2h0T2JqWydhaXJsaW5lJ11dLm5hbWVcclxuICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBkaXJlY3Rpb24gPSBmbGlnaHRPYmpbJ3JldHVybiddP1wiaW5ib3VuZFwiOlwib3V0Ym91bmRcIjtcclxuXHJcbiAgICBpZiAoIWpvdXJuZXkuZ2V0KCd0cmlwcycpLmdldChkaXJlY3Rpb24pKSB7XHJcbiAgICAgIGpvdXJuZXkgPSBqb3VybmV5LnNldEluKFsndHJpcHMnLGRpcmVjdGlvbl0sIG5ldyBUcmlwKCkpXHJcbiAgICB9XHJcbiAgICBqb3VybmV5ID0gam91cm5leS51cGRhdGVJbihbJ3RyaXBzJywgZGlyZWN0aW9uLCAnZmxpZ2h0cyddLCBmdW5jdGlvbihmbGlnaHRzKSAge3JldHVybiBmbGlnaHRzLnB1c2goZmxpZ2h0KTt9KTtcclxuICB9KTtcclxuXHJcblxyXG5cclxuICByZXR1cm4gam91cm5leTtcclxufTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cclxuXHJcbi8qIHBhcnQgaXMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vSGFuc2UvcmVhY3QtY2FsZW5kYXIvYmxvYi9tYXN0ZXIvc3JjL2NhbGVuZGFyLmpzICovXHJcblxyXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcclxuXHJcblxyXG5cclxudmFyIENhbGVuZGFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyXCIsXHJcblxyXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3ZWVrT2Zmc2V0OiAwLFxyXG4gICAgICBsYW5nOiAnZW4nLFxyXG4gICAgICBmb3JjZVNpeFJvd3M6IHRydWVcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgZGF5TmFtZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBkYXlOYW1lcyA9IFtdO1xyXG4gICAgdmFyIGRhdGUgPSB0aGlzLnByb3BzLmRhdGUuc3RhcnRPZignbW9udGgnKTtcclxuICAgIHZhciBkaWZmID0gZGF0ZS5pc29XZWVrZGF5KCkgLSB0aGlzLnByb3BzLndlZWtPZmZzZXQ7XHJcbiAgICBpZiAoZGlmZiA8IDApIGRpZmYgKz0gNztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICB2YXIgZGF5ID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIGktZGlmZisxKzddKTtcclxuICAgICAgZGF5TmFtZXMucHVzaChkYXkuZm9ybWF0KFwiZGRcIikpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRheU5hbWVzO1xyXG4gIH0sXHJcblxyXG4gIGRheXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRheXMgPSBbXTtcclxuICAgIHZhciBiZWdpbkRhdGUgPSB0aGlzLnByb3BzLmRhdGUuc3RhcnRPZignbW9udGgnKTtcclxuICAgIHZhciBkaWZmID0gYmVnaW5EYXRlLmlzb1dlZWtkYXkoKSAtIHRoaXMucHJvcHMud2Vla09mZnNldDtcclxuICAgIGlmIChkaWZmIDwgMCkgZGlmZiArPSA3O1xyXG5cclxuICAgIHZhciBpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaWZmOyBpKyspIHtcclxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgMV0pLnN1YnRyYWN0KChkaWZmLWkpLCAnZGF5cycpO1xyXG4gICAgICBkYXlzLnB1c2goe2RhdGU6IGRhdGUsIG90aGVyTW9udGg6ICdwcmV2LW1vbnRoJ30pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBudW1iZXJPZkRheXMgPSBiZWdpbkRhdGUuZGF5c0luTW9udGgoKTtcclxuICAgIGZvciAoaSA9IDE7IGkgPD0gbnVtYmVyT2ZEYXlzOyBpKyspIHtcclxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgaV0pO1xyXG4gICAgICBkYXlzLnB1c2goe2RhdGU6IGRhdGV9KTtcclxuICAgIH1cclxuXHJcbiAgICBpID0gMTtcclxuICAgIHdoaWxlIChkYXlzLmxlbmd0aCAlIDcgIT09IDApIHtcclxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgbnVtYmVyT2ZEYXlzXSkuYWRkKGksIFwiZGF5c1wiKTtcclxuICAgICAgZGF5cy5wdXNoKHtkYXRlOiBkYXRlLCBvdGhlck1vbnRoOiAnbmV4dC1tb250aCd9KTtcclxuICAgICAgaSsrO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnByb3BzLmZvcmNlU2l4Um93cyAmJiBkYXlzLmxlbmd0aCAhPT0gNDIpIHtcclxuICAgICAgdmFyIHN0YXJ0ID0gbW9tZW50LnV0YyhkYXlzW2RheXMubGVuZ3RoLTFdLmRhdGUpLmFkZCgxLCAnZGF5cycpO1xyXG4gICAgICB3aGlsZSAoZGF5cy5sZW5ndGggPCA0Mikge1xyXG4gICAgICAgIGRheXMucHVzaCh7ZGF0ZTogbW9tZW50LnV0YyhzdGFydCksIG90aGVyTW9udGg6ICduZXh0LW1vbnRoJ30pO1xyXG4gICAgICAgIHN0YXJ0LmFkZCgxLCAnZGF5cycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRheXM7XHJcbiAgfSxcclxuICBzcGxpdFRvV2Vla3M6IGZ1bmN0aW9uIChkYXlzKSB7XHJcbiAgICB2YXIgd2Vla3MgPSBbXTtcclxuICAgIHZhciBhY3R1YWxXZWVrID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxkYXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChpJTcgPT0gMCAmJiBpICE9IDApIHtcclxuICAgICAgICB3ZWVrcy5wdXNoKGFjdHVhbFdlZWspO1xyXG4gICAgICAgIGFjdHVhbFdlZWsgPSBbXTtcclxuICAgICAgfVxyXG4gICAgICBhY3R1YWxXZWVrLnB1c2goZGF5c1tpXSlcclxuICAgIH1cclxuICAgIHdlZWtzLnB1c2goYWN0dWFsV2Vlayk7XHJcbiAgICByZXR1cm4gd2Vla3M7XHJcbiAgfSxcclxuICByZW5kZXJXZWVrOiBmdW5jdGlvbiAod2Vlaykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIndlZWtcIn0sIFxyXG4gICAgICAgIHdlZWsubWFwKHRoaXMucmVuZGVyRGF5KVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfSxcclxuICByZW5kZXJEYXk6IGZ1bmN0aW9uKGRheSkge1xyXG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZ2V0RGF5KGRheS5kYXRlLCBkYXkub3RoZXJNb250aCk7XHJcbiAgfSxcclxuICByZW5kZXJEYXlOYW1lOiBmdW5jdGlvbiAoZGF5TmFtZSkge1xyXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogZGF5TmFtZSwgY2xhc3NOYW1lOiBcImRheS1uYW1lXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBkYXlOYW1lICkpO1xyXG4gIH0sXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciB3ZWVrcyA9IHRoaXMuc3BsaXRUb1dlZWtzKHRoaXMuZGF5cygpKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kclwifSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsbmRyLW1vbnRoXCJ9LCBcclxuICAgICAgICAgICB0aGlzLnByb3BzLmRhdGUuZm9ybWF0KFwiTU1NTSBZWVlZXCIpIFxyXG4gICAgICAgICksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kci1ncmlkXCJ9LCBcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJkYXktbmFtZXNcIn0sIFxyXG4gICAgICAgICAgICB0aGlzLmRheU5hbWVzKCkubWFwKHRoaXMucmVuZGVyRGF5TmFtZSlcclxuICAgICAgICAgICksIFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImRheXNcIn0sIFxyXG4gICAgICAgICAgICB3ZWVrcy5tYXAodGhpcy5yZW5kZXJXZWVrKVxyXG4gICAgICAgICAgKSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FsZW5kYXI7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgaXNJRSA9IHJlcXVpcmUoJy4vLi4vdG9vbHMvaXNJRS5qcycpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBUcmFuID0gcmVxdWlyZSgnLi9UcmFuLmpzeCcpO1xudmFyICQgPSAod2luZG93LiQpO1xuXG5cbnZhciBNb2RhbFBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJNb2RhbFBpY2tlclwiLFxuXG4gIC8vZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgLy8gIHJldHVybiB7XG4gIC8vICAgIHNob3duOiBmYWxzZVxuICAvLyAgfTtcbiAgLy99LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpbmRvd1dpZHRoOiAkKHdpbmRvdykud2lkdGgoKSxcbiAgICAgIHdpbmRvd0hlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgfTtcbiAgfSxcblxuICBjbGlja091dHNpZGU6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHRoaXMucmVmcy5pbm5lcikge1xuICAgICAgaWYgKCQodGhpcy5yZWZzLmlubmVyLmdldERPTU5vZGUoKSkuaGFzKGUudGFyZ2V0KS5sZW5ndGgpIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuaW5wdXRFbGVtZW50KSB7XG4gICAgICBpZiAoJCh0aGlzLnByb3BzLmlucHV0RWxlbWVudCkuaXMoZS50YXJnZXQpKSByZXR1cm47XG4gICAgICBpZiAoJCh0aGlzLnByb3BzLmlucHV0RWxlbWVudCkuaGFzKGUudGFyZ2V0KS5sZW5ndGgpIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oaWRlKCk7XG4gIH0sXG5cbiAgd2luZG93UmVzaXplZDogZnVuY3Rpb24gKGUpIHtcbiAgICAvL1RPRE8gY2hlY2sgcGVyZm9ybWFuY2UgYW5kIGV2ZW50dWFsbHkgbWFrZSBzb21lIGRlbGF5ZWQgcmVzaXplXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB3aW5kb3dXaWR0aDogJCh3aW5kb3cpLndpZHRoKCksXG4gICAgICB3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKVxuICAgIH0pO1xuICB9LFxuXG4gIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uSGlkZSgpO1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tPdXRzaWRlLCBmYWxzZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMud2luZG93UmVzaXplZCk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrT3V0c2lkZSwgZmFsc2UpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLndpbmRvd1Jlc2l6ZWQpO1xuICB9LFxuXG4gIGNhbGN1bGF0ZVN0eWxlczogZnVuY3Rpb24gKCkge1xuICAgIGlmIChpc0lFKDgsJ2x0ZScpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgdmFyIHJlY3Q7XG4gICAgdmFyIG1hcmdpbkxlZnQgPSAwO1xuICAgIGlmICh0aGlzLnJlZnMub3V0ZXIpIHtcbiAgICAgIHJlY3QgPSB0aGlzLnJlZnMub3V0ZXIuZ2V0RE9NTm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIHN0eWxlID0gdGhpcy5yZWZzLm91dGVyLmdldERPTU5vZGUoKS5zdHlsZTtcbiAgICAgIGlmIChzdHlsZS5tYXJnaW5MZWZ0KSB7XG4gICAgICAgIG1hcmdpbkxlZnQgPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0LnN1YnN0cmluZygwLHN0eWxlLm1hcmdpbkxlZnQubGVuZ3RoLTIpLDEwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5wcm9wcy5jb250ZW50U2l6ZS53aWR0aDtcbiAgICB2YXIgb2Zmc2V0ID0gKCFyZWN0KT8wOihyZWN0LmxlZnQgLSBtYXJnaW5MZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0KTtcbiAgICB2YXIgbWF4V2lkdGggPSBwYWdlV2lkdGg7XG4gICAgdmFyIG91dGVyU3R5bGVzO1xuICAgIHZhciBhZGRDbGFzcyA9IFwiXCI7XG5cbiAgICBpZiAod2lkdGggPiBtYXhXaWR0aCkge1xuICAgICAgLy9tYWtlIHNtYWxsZXIgdmVyc2lvblxuICAgICAgYWRkQ2xhc3MgPSBcImNvbXBhY3Qtc2l6ZVwiO1xuICAgICAgaWYgKHRoaXMucHJvcHMuY29udGVudFNpemUud2lkdGhDb21wYWN0KSB7XG4gICAgICAgIHdpZHRoID0gdGhpcy5wcm9wcy5jb250ZW50U2l6ZS53aWR0aENvbXBhY3Q7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvZmZzZXQgKyB3aWR0aCA8PSBtYXhXaWR0aCkge1xuICAgICAgLy9LRUVQIElUXG4gICAgICBvdXRlclN0eWxlcyA9IHtcbiAgICAgICAgbWFyZ2luTGVmdDogMCxcbiAgICAgICAgd2lkdGg6IHdpZHRoXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAob2Zmc2V0ICsgd2lkdGggPiBtYXhXaWR0aCAmJiB3aWR0aCA8IG1heFdpZHRoKSB7XG4gICAgICAvL01PVkUgSVRcbiAgICAgIHZhciBtaXNzaW5nU3BhY2UgPSBvZmZzZXQgKyB3aWR0aCAtIG1heFdpZHRoO1xuICAgICAgb3V0ZXJTdHlsZXMgPSB7XG4gICAgICAgIG1hcmdpbkxlZnQ6IDAgLSBtaXNzaW5nU3BhY2UsXG4gICAgICAgIHdpZHRoOiB3aWR0aFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ZXJTdHlsZXMgPSB7XG4gICAgICAgIG1hcmdpbkxlZnQ6IDAsXG4gICAgICAgIHdpZHRoOiBcIjEwMCVcIlxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG91dGVyOiBvdXRlclN0eWxlcyxcbiAgICAgIGFkZENsYXNzOiBhZGRDbGFzc1xuICAgIH07XG4gIH0sXG5cbiAgY2FsY3VsYXRlT3V0ZXJTdHlsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoaXNJRSg4LCdsdGUnKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3R5bGVzID0gdGhpcy5jYWxjdWxhdGVTdHlsZXMoKTtcbiAgICB2YXIgY2xhc3NOYW1lID0gXCJzZWFyY2gtbW9kYWwgXCIgKyAoc3R5bGVzLmFkZENsYXNzID8gc3R5bGVzLmFkZENsYXNzIDogXCJcIik7XG5cbiAgICAvL1RPRE8gZGVjaWRlIGlmIHB1dCB0aGVyZSBjbG9zZSBidXR0b24gb3Igbm90XG4gICAgLy88ZGl2IGNsYXNzTmFtZT1cImNsb3NlLWJ1dHRvblwiIG9uY2xpY2s9e3RoaXMuaGlkZX0+PFRyYW4gdEtleT1cImNsb3NlXCI+Y2xvc2U8L1RyYW4+PC9kaXY+XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3NOYW1lLCByZWY6IFwib3V0ZXJcIiwgc3R5bGU6IHN0eWxlcy5vdXRlcn0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic2VhcmNoLW1vZGFsLWNvbnRlbnRcIiwgcmVmOiBcImlubmVyXCJ9LCB0aGlzLnByb3BzLmNoaWxkcmVuKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsUGlja2VyO1xuXG5cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgdHJhbnNsYXRlID0gcmVxdWlyZSgnLi8uLi90b29scy90cmFuc2xhdGUuanN4Jyk7XG52YXIgT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9ICh3aW5kb3cuUmVhY3QpLmFkZG9ucy5QdXJlUmVuZGVyTWl4aW47XG5cblxudmFyIFByaWNlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlByaWNlXCIsXG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXG4gIGdldEluaXRpYWxTdGF0ZTpmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3VycmVuY3k6IE9wdGlvbnNTdG9yZS5kYXRhLmN1cnJlbmN5XG4gICAgfVxuICB9LFxuXG4gIHNldFN0YXRlRnJvbVN0b3JlOmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVuY3k6IE9wdGlvbnNTdG9yZS5kYXRhLmN1cnJlbmN5XG4gICAgfSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBPcHRpb25zU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIHRoaXMuc2V0U3RhdGVGcm9tU3RvcmUpO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIE9wdGlvbnNTdG9yZS5ldmVudHMucmVtb3ZlTGlzdGVuZXIoXCJjaGFuZ2VcIiwgdGhpcy5zZXRTdGF0ZUZyb21TdG9yZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZXVyUHJpY2UgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIHZhciBjdXJyZW5jeSA9IHRoaXMuc3RhdGUuY3VycmVuY3kudG9Mb3dlckNhc2UoKTtcbiAgICB2YXIgcHJpY2VJbkN1cnJlbmN5O1xuICAgIGlmICh3aW5kb3cuU2t5cGlja2VyICYmIHdpbmRvdy5Ta3lwaWNrZXIuY29uZmlnLmN1cnJlbmNpZXNbY3VycmVuY3ldICYmIHdpbmRvdy5Ta3lwaWNrZXIuY29uZmlnLmN1cnJlbmNpZXNbY3VycmVuY3ldLnJhdGUpIHtcbiAgICAgIHByaWNlSW5DdXJyZW5jeSA9IChldXJQcmljZSAvIHdpbmRvdy5Ta3lwaWNrZXIuY29uZmlnLmN1cnJlbmNpZXNbY3VycmVuY3ldLnJhdGUpLnRvRml4ZWQod2luZG93LlNreXBpY2tlci5jb25maWcuY3VycmVuY2llc1tjdXJyZW5jeV0ucm91bmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW5jeSA9IFwiZXVyXCI7XG4gICAgICBwcmljZUluQ3VycmVuY3kgPSBldXJQcmljZTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFxuICAgICAgICAgdHJhbnNsYXRlKFwiY3VycmVuY3kuXCIrY3VycmVuY3kse3ByaWNlOiBwcmljZUluQ3VycmVuY3l9LCBwcmljZUluQ3VycmVuY3kpIFxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByaWNlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxuXG5cblxuLyoqIERlcHJlY2F0ZWQgLSAgZG9uJ3QgdXNlICovXG5cblxuXG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi90b29scy90ci5qcycpO1xuXG4vKiByZWFjdCBjb21wb25lbnQgd3JhcHBlciBvZiB0ciBmdW5jdGlvbiAqL1xuXG52YXIgVHJhbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJUcmFuXCIsXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9yaWdpbmFsID0gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB2YXIga2V5ID0gdGhpcy5wcm9wcy50S2V5O1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLnByb3BzLnZhbHVlcztcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgXG4gICAgICAgICB0cihvcmlnaW5hbCxrZXksdmFsdWVzKSBcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciB0cmFuc2xhdGUgPSByZXF1aXJlKCcuLy4uL3Rvb2xzL3RyYW5zbGF0ZS5qc3gnKTtcblxuLyogVE9ETyBmaW5pc2ggaXQgKi9cblxuLy9UT0RPIGxpc3RlbiB0byBsYW5ndWFnZSBjaGFuZ2VcblxudmFyIFRyYW5zbGF0ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJUcmFuc2xhdGVcIixcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3JpZ2luYWwgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIHZhciBrZXkgPSB0aGlzLnByb3BzLnRLZXk7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMucHJvcHMudmFsdWVzO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcbiAgICAgICAgIHRyYW5zbGF0ZShrZXksdmFsdWVzLG9yaWdpbmFsKSBcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2xhdGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gSW1tdXRhYmxlKCl7XCJ1c2Ugc3RyaWN0XCI7fVxuXG4gIC8qKlxuICAgKiByZXR1cm4gbmV3IG9iamVjdCB3aXRoIGFkZGVkIGNoYW5nZXMsIGlmIG5vIGNoYW5nZSByZXR1cm4gc2FtZSBvYmplY3RcbiAgICogQHBhcmFtIG5ld1ZhbHVlc1xuICAgKiBAcmV0dXJucyBuZXcgb2JqZWN0IGFzIGluIGNsYXNzXG4gICAqL1xuICBJbW11dGFibGUucHJvdG90eXBlLmVkaXQ9ZnVuY3Rpb24obmV3VmFsdWVzKXtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoIW5ld1ZhbHVlcykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBsZWFzdE9uZUVkaXQgPSBmYWxzZTtcbiAgICB2YXIgbmV3UGxhaW4gPSB7fTtcbiAgICAvL0FkZCBmcm9tIHRoaXNcbiAgICBPYmplY3Qua2V5cyh0aGlzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgIG5ld1BsYWluW2tleV0gPSB0aGlzW2tleV07XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICAvL0FkZCBmcm9tIG5ld1xuICAgIE9iamVjdC5rZXlzKG5ld1ZhbHVlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgICBpZiAobmV3UGxhaW5ba2V5XSAhPT0gbmV3VmFsdWVzW2tleV0pIHtcbiAgICAgICAgbmV3UGxhaW5ba2V5XSA9IG5ld1ZhbHVlc1trZXldO1xuICAgICAgICBsZWFzdE9uZUVkaXQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChsZWFzdE9uZUVkaXQpIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5jbGFzcyhuZXdQbGFpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICB9OztcbiAgLyoqXG4gICAqIHJldHVybiBlZGl0ZWQgb2JqZWN0XG4gICAqIEBwYXJhbSBrZXlcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEByZXR1cm5zIHtTZWFyY2hEYXRlfVxuICAgKi9cbiAgSW1tdXRhYmxlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBuZXdQbGFpbiA9IHt9O1xuICAgIG5ld1BsYWluW2tleV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcy5lZGl0KG5ld1BsYWluKVxuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW1tdXRhYmxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnLi9pbW11dGFibGUuanN4Jyk7XG5cbmZvcih2YXIgSW1tdXRhYmxlX19fX0tleSBpbiBJbW11dGFibGUpe2lmKEltbXV0YWJsZS5oYXNPd25Qcm9wZXJ0eShJbW11dGFibGVfX19fS2V5KSl7TWFwTGFiZWxbSW1tdXRhYmxlX19fX0tleV09SW1tdXRhYmxlW0ltbXV0YWJsZV9fX19LZXldO319dmFyIF9fX19TdXBlclByb3RvT2ZJbW11dGFibGU9SW1tdXRhYmxlPT09bnVsbD9udWxsOkltbXV0YWJsZS5wcm90b3R5cGU7TWFwTGFiZWwucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZSk7TWFwTGFiZWwucHJvdG90eXBlLmNvbnN0cnVjdG9yPU1hcExhYmVsO01hcExhYmVsLl9fc3VwZXJDb25zdHJ1Y3Rvcl9fPUltbXV0YWJsZTtcbiAgZnVuY3Rpb24gTWFwTGFiZWwocGxhaW4pIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLm1hcFBsYWNlID0gcGxhaW4ubWFwUGxhY2U7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHBsYWluLnBvc2l0aW9uO1xuICAgIHRoaXMuc2hvd0Z1bGxMYWJlbCA9IHBsYWluLnNob3dGdWxsTGFiZWw7XG4gICAgdGhpcy5yZWxhdGl2ZVByaWNlID0gcGxhaW4ucmVsYXRpdmVQcmljZTtcbiAgICB0aGlzLmhvdmVyID0gcGxhaW4uaG92ZXI7XG5cbiAgICB0aGlzLmNsYXNzID0gTWFwTGFiZWw7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuXG4gIE1hcExhYmVsLnByb3RvdHlwZS5lZGl0PWZ1bmN0aW9uKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9wcmV2ZW50IHNhbWUgcG9zaXRpb24gdG8gbWFrZSBuZXcgb2JqZWN0XG4gICAgaWYgKHBsYWluLnBvc2l0aW9uKSB7XG4gICAgICBpZiAocGxhaW4ucG9zaXRpb24ueCA9PSB0aGlzLnBvc2l0aW9uLnggJiYgcGxhaW4ucG9zaXRpb24ueSA9PSB0aGlzLnBvc2l0aW9uLnkpIHtcbiAgICAgICAgcGxhaW4ucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZS5lZGl0LmNhbGwodGhpcyxwbGFpbik7XG4gIH07XG5cbiAgLyogZXhwZWN0cyB0aGF0IHRoZXJlIGlzIG5vIHR3byBsYWJlbHMgd2l0aCBzYW1lIHBsYWNlICovXG4gIE1hcExhYmVsLnByb3RvdHlwZS5nZXRJZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5tYXBQbGFjZS5wbGFjZS5pZDtcbiAgfTtcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBMYWJlbDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlLmpzeCcpO1xuXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe01hcFBsYWNlW0ltbXV0YWJsZV9fX19LZXldPUltbXV0YWJsZVtJbW11dGFibGVfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlPUltbXV0YWJsZT09PW51bGw/bnVsbDpJbW11dGFibGUucHJvdG90eXBlO01hcFBsYWNlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZJbW11dGFibGUpO01hcFBsYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1NYXBQbGFjZTtNYXBQbGFjZS5fX3N1cGVyQ29uc3RydWN0b3JfXz1JbW11dGFibGU7XG5cbiAgZnVuY3Rpb24gTWFwUGxhY2UocGxhaW4pIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLnBsYWNlID0gcGxhaW4ucGxhY2U7XG4gICAgdGhpcy5mbGFnID0gcGxhaW4uZmxhZyB8fCBcIlwiOyAvL29yaWdpbiwgZGVzdGluYXRpb24sIHN0b3BvdmVyXG4gICAgdGhpcy5wcmljZSA9IHBsYWluLnByaWNlIHx8IG51bGw7XG4gICAgdGhpcy5yZWxhdGl2ZVByaWNlID0gcGxhaW4ucmVsYXRpdmVQcmljZSB8fCBudWxsO1xuXG4gICAgdGhpcy5jbGFzcyA9IE1hcFBsYWNlO1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFBsYWNlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmFkaXVzID0gcmVxdWlyZShcIi4vUmFkaXVzLmpzeFwiKTtcbnZhciBJbW11dGFibGUgPSByZXF1aXJlKFwiLi9JbW11dGFibGUuanN4XCIpO1xuXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe09wdGlvbnNbSW1tdXRhYmxlX19fX0tleV09SW1tdXRhYmxlW0ltbXV0YWJsZV9fX19LZXldO319dmFyIF9fX19TdXBlclByb3RvT2ZJbW11dGFibGU9SW1tdXRhYmxlPT09bnVsbD9udWxsOkltbXV0YWJsZS5wcm90b3R5cGU7T3B0aW9ucy5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlKTtPcHRpb25zLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1PcHRpb25zO09wdGlvbnMuX19zdXBlckNvbnN0cnVjdG9yX189SW1tdXRhYmxlO1xuICBmdW5jdGlvbiBPcHRpb25zKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcGxhaW4gPSBwbGFpbiB8fCB7fTtcbiAgICB0aGlzLmxhbmd1YWdlID0gcGxhaW4ubGFuZ3VhZ2UgfHwgXCJlblwiO1xuICAgIHRoaXMuY3VycmVuY3kgPSBwbGFpbi5jdXJyZW5jeSB8fCBcIkVVUlwiO1xuICAgIHRoaXMuZGVmYXVsdFJhZGl1cyA9IHBsYWluLmRlZmF1bHRSYWRpdXMgfHwgbmV3IFJhZGl1cygpOyAvL1RPRE8gcmFkaXVzPz9cbiAgICB0aGlzLmRlZmF1bHRNYXBDZW50ZXIgPSBwbGFpbi5kZWZhdWx0TWFwQ2VudGVyIHx8IG51bGw7IC8vVE9ETyBtYXAgY2VudGVyXG5cbiAgICB0aGlzLmNsYXNzID0gT3B0aW9ucztcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBPcHRpb25zO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cclxudmFyIHR5cGVJZFRvU3RyaW5nID0gZnVuY3Rpb24odHlwZSkge1xyXG5cclxufTtcclxuXHJcblxyXG5cclxuXHJcbiAgUGxhY2UudHlwZUlkVG9TdHJpbmc9ZnVuY3Rpb24odHlwZSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKHR5cGUgPT0gUGxhY2UuVFlQRV9BSVJQT1JUKSB7XHJcbiAgICAgIHJldHVybiBcImFpcnBvcnRcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBQbGFjZS5UWVBFX0NPVU5UUlkpIHtcclxuICAgICAgcmV0dXJuIFwiY291bnRyeVwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlID09IFBsYWNlLlRZUEVfQ0lUWSkge1xyXG4gICAgICByZXR1cm4gXCJjaXR5XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gXCJ1bmtub3duXCI7XHJcbiAgICB9XHJcbiAgfTtcclxuICBmdW5jdGlvbiBQbGFjZShwbGFpbikge1widXNlIHN0cmljdFwiO1xyXG4gICAgT2JqZWN0LmtleXMocGxhaW4pLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xyXG4gICAgICB0aGlzW2tleV0gPSBwbGFpbltrZXldO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIGlmICghdGhpcy52YWx1ZSkge1xyXG4gICAgICB0aGlzLnZhbHVlID0gXCJcIjtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgdGhpcy5jb21wbGV0ZSA9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHRoaXMuY29tcGxldGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZSBzaG9ydCBuYW1lXHJcbiAgICBpZiAodGhpcy50eXBlID09IFBsYWNlLlRZUEVfQ0lUWSkge1xyXG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHRoaXMudmFsdWUucmVwbGFjZSgvXFxzKlxcKC4rXFwpLywgJycpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zaG9ydE5hbWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudHlwZVN0cmluZyA9IFBsYWNlLnR5cGVJZFRvU3RyaW5nKHRoaXMudHlwZSk7XHJcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xyXG4gIH1cclxuXHJcblxyXG5cclxuICAvKiBEbyBub3QgdXNlIGdldHRlcnMhISEgaXQgaXMgaGVyZSBqdXN0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5ICovXHJcbiAgUGxhY2UucHJvdG90eXBlLmdldE5hbWU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICB9O1xyXG4gIFBsYWNlLnByb3RvdHlwZS5nZXRJZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLmlkO1xyXG4gIH07XHJcbiAgUGxhY2UucHJvdG90eXBlLmdldFR5cGU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy50eXBlU3RyaW5nO1xyXG4gIH07XHJcbiAgUGxhY2UucHJvdG90eXBlLmdldFR5cGVJZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLnR5cGVcclxuICB9O1xyXG5cclxuXHJcblBsYWNlLlRZUEVfQUlSUE9SVCA9IDA7XHJcblBsYWNlLlRZUEVfQ09VTlRSWSA9IDE7XHJcblBsYWNlLlRZUEVfQ0lUWSA9IDI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5mdW5jdGlvbiByb3VuZChudW0pIHtcbiAgcmV0dXJuIE1hdGgucm91bmQobnVtICogMTAwKSAvIDEwMDtcbn1cblxuXG4gIGZ1bmN0aW9uIFJhZGl1cyhwbGFpbikge1widXNlIHN0cmljdFwiO1xuICAgIHBsYWluID0gcGxhaW4gfHwge307XG4gICAgdGhpcy5yYWRpdXMgPSAgcGxhaW4ucmFkaXVzIHx8IDI1MDtcbiAgICB0aGlzLmxhdCA9ICBwbGFpbi5sYXQgfHwgNTA7XG4gICAgdGhpcy5sbmcgPSAgcGxhaW4ubG5nIHx8IDE2O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgUmFkaXVzLnByb3RvdHlwZS5nZXRUZXh0PWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiBcIlwiICsgcm91bmQodGhpcy5sYXQpICsgXCIsIFwiICsgcm91bmQodGhpcy5sbmcpICsgXCIgKFwiICsgdGhpcy5yYWRpdXMgKyBcImttKVwiO1xuICB9O1xuICBSYWRpdXMucHJvdG90eXBlLmdldFVybFN0cmluZz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gXCJcIiArIHJvdW5kKHRoaXMubGF0KSArIFwiLVwiICsgcm91bmQodGhpcy5sbmcpICsgXCItXCIgKyB0aGlzLnJhZGl1cyArIFwia21cIjtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhZGl1cztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKFwiZGVlcG1lcmdlXCIpO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoXCIuL0ltbXV0YWJsZS5qc3hcIik7XG5cbnZhciB1cmxEYXRlRm9ybWF0ID0gXCJZWVlZLU1NLUREXCI7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL3Rvb2xzL3RyLmpzJyk7XG5cbi8qXG5jbGFzcyBTZWFyY2hEYXRlXG4hISEhIEZPUiBWQUxJRCBPVVRQVVQgVVNFIEFMV0FZUyBHRVRURVIgTUVUSE9EUywgTk9UIEFUVFJJQlVURVNcbiAqL1xuXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe1NlYXJjaERhdGVbSW1tdXRhYmxlX19fX0tleV09SW1tdXRhYmxlW0ltbXV0YWJsZV9fX19LZXldO319dmFyIF9fX19TdXBlclByb3RvT2ZJbW11dGFibGU9SW1tdXRhYmxlPT09bnVsbD9udWxsOkltbXV0YWJsZS5wcm90b3R5cGU7U2VhcmNoRGF0ZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlKTtTZWFyY2hEYXRlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1TZWFyY2hEYXRlO1NlYXJjaERhdGUuX19zdXBlckNvbnN0cnVjdG9yX189SW1tdXRhYmxlO1xuICBmdW5jdGlvbiBTZWFyY2hEYXRlKGlucHV0KSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHBsYWluID0ge307XG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PSBcInN0cmluZ1wiKSB7XG4gICAgICBwbGFpbiA9IHRoaXMucGFyc2VVcmxTdHJpbmcoaW5wdXQpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09IFwib2JqZWN0XCIpIHtcbiAgICAgIHBsYWluID0gaW5wdXQ7XG4gICAgfVxuICAgIHRoaXMubW9kZSA9IHR5cGVvZihwbGFpbi5tb2RlKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLm1vZGUgOiBcInNpbmdsZVwiO1xuICAgIHRoaXMuZnJvbSA9IHR5cGVvZihwbGFpbi5mcm9tKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLmZyb20gOiBtb21lbnQudXRjKCk7XG4gICAgdGhpcy50byA9IHR5cGVvZihwbGFpbi50bykgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi50byA6IG1vbWVudC51dGMoKTtcbiAgICB0aGlzLm1pblN0YXlEYXlzID0gdHlwZW9mKHBsYWluLm1pblN0YXlEYXlzKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLm1pblN0YXlEYXlzIDogMjtcbiAgICB0aGlzLm1heFN0YXlEYXlzID0gdHlwZW9mKHBsYWluLm1heFN0YXlEYXlzKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLm1heFN0YXlEYXlzIDogMTA7XG4gICAgdGhpcy5maW5hbCA9IHR5cGVvZihwbGFpbi5maW5hbCkgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi5maW5hbCA6IHRydWU7XG5cbiAgICB0aGlzLmNsYXNzID0gU2VhcmNoRGF0ZTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TW9kZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5tb2RlXG4gIH07XG5cbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0RnJvbT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiIHx8IHRoaXMubW9kZSA9PSBcIm5vUmV0dXJuXCIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwiYW55dGltZVwiKSB7XG4gICAgICByZXR1cm4gbW9tZW50LnV0YygpLmFkZCgxLCBcImRheXNcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZyb21cbiAgICB9XG4gIH07XG5cbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0VG89ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIiB8fCB0aGlzLm1vZGUgPT0gXCJub1JldHVyblwiKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcInNpbmdsZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5mcm9tXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJhbnl0aW1lXCIpIHtcbiAgICAgIHJldHVybiBtb21lbnQudXRjKCkuYWRkKDYsIFwibW9udGhzXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy50bykge1xuICAgICAgICByZXR1cm4gdGhpcy50b1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9qdXN0IGZvciBjYXNlcyB3aGVuIHRoZSB2YWx1ZSBpcyBub3QgZmlsbGVkIChub3QgY29tcGxldGUgaW50ZXJ2YWwpXG4gICAgICAgIHJldHVybiB0aGlzLmZyb21cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0RGF0ZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5tb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmZyb21cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH07XG5cbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TWluU3RheURheXM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIikge1xuICAgICAgcmV0dXJuIHRoaXMubWluU3RheURheXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICBTZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRNYXhTdGF5RGF5cz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXhTdGF5RGF5cztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuXG4gIFNlYXJjaERhdGUucHJvdG90eXBlLmZvcm1hdD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5tb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmZyb20uZm9ybWF0KFwibFwiKVxuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5taW5TdGF5RGF5cyArIFwiIC0gXCIgKyB0aGlzLm1heFN0YXlEYXlzICsgXCIgZGF5c1wiXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJpbnRlcnZhbFwiIHx8IHRoaXMubW9kZSA9PSBcIm1vbnRoXCIpIHtcbiAgICAgIHZhciB0b0RhdGVTdHJpbmc7XG4gICAgICBpZiAoIXRoaXMudG8pIHtcbiAgICAgICAgdG9EYXRlU3RyaW5nID0gXCJfXCJcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvRGF0ZVN0cmluZyA9IHRoaXMudG8uZm9ybWF0KFwibFwiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZnJvbS5mb3JtYXQoXCJsXCIpICsgXCIgLSBcIiArIHRvRGF0ZVN0cmluZ1xuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwiYW55dGltZVwiKSB7XG4gICAgICByZXR1cm4gdHIoXCJBbnl0aW1lXCIsIFwiYW55dGltZVwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcIm5vUmV0dXJuXCIpIHtcbiAgICAgIHJldHVybiB0cihcIk5vIHJldHVyblwiLCBcIm5vX3JldHVybl9sYWJlbFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMubW9kZVxuICAgIH1cbiAgfTtcblxuXG4gIC8qIHdhIHVybCAqL1xuICBTZWFyY2hEYXRlLnByb3RvdHlwZS50b1VybFN0cmluZz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5tb2RlICsgXCJfXCIgKyB0aGlzLmZyb20uZm9ybWF0KHVybERhdGVGb3JtYXQpICsgXCJfXCIgKyB0aGlzLnRvLmZvcm1hdCh1cmxEYXRlRm9ybWF0KTtcbiAgfTtcblxuICAvKlxuICAgSnVzdCBwYXJzZSBpdCwgcmV0dXJuIHBsYWluIG1pbmltYWwvaW5jb21wbGV0ZSB2ZXJzaW9uIG9mIFNlYXJjaERhdGUgb2JqZWN0XG4gICAqL1xuICBTZWFyY2hEYXRlLnByb3RvdHlwZS5wYXJzZVVybFN0cmluZz1mdW5jdGlvbihzdHJpbmdEYXRlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHN0cmluZ0RhdGUuaW5kZXhPZihcIl9cIikgIT09IC0xKSB7XG4gICAgICB2YXIgc3BsaXQgPSBzdHJpbmdEYXRlLnNwbGl0KFwiX1wiKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1vZGU6IHNwbGl0WzBdLFxuICAgICAgICBmcm9tOiBtb21lbnQudXRjKHNwbGl0WzFdLCB1cmxEYXRlRm9ybWF0KSxcbiAgICAgICAgdG86IG1vbWVudC51dGMoc3BsaXRbMl0sIHVybERhdGVGb3JtYXQpXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtb2RlOiBcInNpbmdsZVwiLFxuICAgICAgICBmcm9tOiBtb21lbnQudXRjKHN0cmluZ0RhdGUsIHVybERhdGVGb3JtYXQpLFxuICAgICAgICB0bzogbW9tZW50LnV0YyhzdHJpbmdEYXRlLCB1cmxEYXRlRm9ybWF0KVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cblxuICAvKiBqdXN0IGhlbHBlciBmdW5jdGlvbiBpZiBpIG1vZGUgaXMgbm90IHNldCAqL1xuICBTZWFyY2hEYXRlLmd1ZXNzTW9kZUZyb21QbGFpbj1mdW5jdGlvbihwbGFpbikge1widXNlIHN0cmljdFwiO1xuICAgIGlmIChwbGFpbi5taW5TdGF5RGF5cyAmJiBwbGFpbi5tYXhTdGF5RGF5cykge1xuICAgICAgcmV0dXJuIFwidGltZVRvU3RheVwiO1xuICAgIH0gZWxzZSBpZiAoIXBsYWluLmZyb20pIHtcbiAgICAgIHJldHVybiBcIm5vUmV0dXJuXCI7XG4gICAgfSBlbHNlIGlmIChwbGFpbi5mcm9tID09IHBsYWluLnRvKSB7XG4gICAgICByZXR1cm4gXCJzaW5nbGVcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiaW50ZXJ2YWxcIjtcbiAgICB9XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hEYXRlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIFNlYXJjaERhdGUgPSByZXF1aXJlKCcuL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgRGF0ZVBhaXJWYWxpZGF0b3IgPSByZXF1aXJlKCcuLy4uL3Rvb2xzL0RhdGVQYWlyVmFsaWRhdG9yLmpzeCcpO1xuXG52YXIgZGF0ZUNvcnJlY3RvciA9IHt9O1xuZGF0ZUNvcnJlY3Rvci5jb3JyZWN0ID0gZnVuY3Rpb24gKGRhdGEsIGRpcmVjdGlvbikge1xuICB2YXIgZXJyb3IgPSBEYXRlUGFpclZhbGlkYXRvci52YWxpZGF0ZShcbiAgICBkYXRhLmRhdGVGcm9tLFxuICAgIGRhdGEuZGF0ZVRvXG4gICk7XG4gIGlmIChlcnJvciA9PSBcImNyb3NzZWREYXRlc1wiKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PSBcImRhdGVGcm9tXCIpIHtcbiAgICAgIHJldHVybiBkYXRhLmRhdGVUbyA9IGRhdGEuZGF0ZUZyb207XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gXCJkYXRlVG9cIikge1xuICAgICAgcmV0dXJuIGRhdGEuZGF0ZUZyb20gPSBkYXRhLmRhdGVUbztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRhdGE7XG59O1xuXG5cblxuICBmdW5jdGlvbiBTZWFyY2hGb3JtRGF0YShpbnB1dCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBwbGFpbiA9IGlucHV0IHx8IHt9O1xuICAgIHRoaXMuZGF0ZUZyb20gPSBwbGFpbi5kYXRlRnJvbSB8fCBuZXcgU2VhcmNoRGF0ZSgpO1xuICAgIHRoaXMuZGF0ZVRvID0gcGxhaW4uZGF0ZVRvIHx8IG5ldyBTZWFyY2hEYXRlKHtmcm9tOiBtb21lbnQoKS5hZGQoMSwgXCJtb250aHNcIil9KTtcbiAgICB0aGlzLm9yaWdpbiA9IHBsYWluLm9yaWdpbiB8fCBuZXcgU2VhcmNoUGxhY2UoXCJcIiwgdHJ1ZSk7XG4gICAgdGhpcy5kZXN0aW5hdGlvbiA9IHBsYWluLmRlc3RpbmF0aW9uIHx8IG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJcIn0sIHRydWUpO1xuICAgIHRoaXMucGFzc2VuZ2VycyA9IHBhcnNlSW50KHBsYWluLnBhc3NlbmdlcnMpIHx8IDE7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuXG4gIC8vVE9ETyBjaGFuZ2UgdG8gZXh0ZW5kZWQgZnJvbSBJbW11dGFibGVcbiAgLyogaW1tdXRhYmxlICovXG4gIFNlYXJjaEZvcm1EYXRhLnByb3RvdHlwZS5jaGFuZ2VGaWVsZD1mdW5jdGlvbih0eXBlLCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBuZXdQbGFpbiA9IHtcbiAgICAgIGRhdGVGcm9tOiB0aGlzLmRhdGVGcm9tLFxuICAgICAgZGF0ZVRvOiB0aGlzLmRhdGVUbyxcbiAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICBkZXN0aW5hdGlvbjogdGhpcy5kZXN0aW5hdGlvbixcbiAgICAgIHBhc3NlbmdlcnM6IHRoaXMucGFzc2VuZ2Vyc1xuICAgIH07XG4gICAgbmV3UGxhaW5bdHlwZV0gPSB2YWx1ZTtcbiAgICBpZiAodHlwZSA9PSBcImRhdGVUb1wiIHx8IHR5cGUgPT0gXCJkYXRlRnJvbVwiKSB7XG4gICAgICBkYXRlQ29ycmVjdG9yLmNvcnJlY3QobmV3UGxhaW4sIHR5cGUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNlYXJjaEZvcm1EYXRhKG5ld1BsYWluKTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaEZvcm1EYXRhO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vUGxhY2UuanN4Jyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL3Rvb2xzL3RyLmpzJyk7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnLi9pbW11dGFibGUuanN4Jyk7XG5cbnZhciBkZWZhdWx0VmFsdWVzID0ge1xuICBtb2RlOiBcInRleHRcIiwgLyogbW9kZXM6IHRleHQsIHBsYWNlLCBhbnl3aGVyZSwgcmFkaXVzLCAuLi4gICEhIGl0IGlzIHNpbWlsYXIgYXMgbW9kZXMgaW4gcGxhY2VQaWNrZXIgYnV0IG5vdCBleGFjdGx5IHNhbWUgKi9cbiAgdmFsdWU6IFwiXCIsXG4gIGlzRGVmYXVsdDogZmFsc2UgLyogdGhpcyBpcyBzZXQgb25seSB3aGVuIHlvdSB3YW50IHRvIHVzZSB0ZXh0IGFzIHByZWRlZmluZWQgdmFsdWUgKi9cbn07XG5cbmZ1bmN0aW9uIG1ha2VQbGFpbihpbnB1dCkge1xuICB2YXIgcGxhaW4gPSB7fTtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAndW5kZWZpbmVkJykge1xuICAgIHBsYWluLm1vZGUgPSBcInRleHRcIjtcbiAgICBwbGFpbi52YWx1ZSA9IFwiXCI7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnKSB7XG4gICAgcGxhaW4ubW9kZSA9IFwidGV4dFwiO1xuICAgIHBsYWluLnZhbHVlID0gaW5wdXQ7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09IFwib2JqZWN0XCIpIHtcbiAgICBwbGFpbiA9IGlucHV0O1xuICB9XG4gIHJldHVybiBwbGFpblxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1vZGVzKGRhdGEpIHtcbiAgaWYgKGRhdGEubW9kZSA9PSBcInRleHRcIikge1xuICAgIGlmICh0eXBlb2YgZGF0YS52YWx1ZSAhPSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3cm9uZyB0eXBlIG9mIHZhbHVlXCIpO1xuICAgIH1cbiAgfVxuICBpZiAoZGF0YS5tb2RlID09IFwicGxhY2VcIikge1xuICAgIGlmICggIShkYXRhLnZhbHVlIGluc3RhbmNlb2YgUGxhY2UpICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwid3JvbmcgdHlwZSBvZiB2YWx1ZVwiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybU1vZGVGcm9tTW9kZShtb2RlKSB7XG4gIGlmIChtb2RlID09IFwicmFkaXVzXCIgfHwgbW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICByZXR1cm4gbW9kZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCJhbGxcIjtcbiAgfVxufVxuXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe1NlYXJjaFBsYWNlW0ltbXV0YWJsZV9fX19LZXldPUltbXV0YWJsZVtJbW11dGFibGVfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlPUltbXV0YWJsZT09PW51bGw/bnVsbDpJbW11dGFibGUucHJvdG90eXBlO1NlYXJjaFBsYWNlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZJbW11dGFibGUpO1NlYXJjaFBsYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1TZWFyY2hQbGFjZTtTZWFyY2hQbGFjZS5fX3N1cGVyQ29uc3RydWN0b3JfXz1JbW11dGFibGU7XG4gIGZ1bmN0aW9uIFNlYXJjaFBsYWNlKGlucHV0LCBpc0RlZmF1bHQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcGxhaW4gPSBtYWtlUGxhaW4oaW5wdXQpO1xuICAgIHRoaXMubW9kZSA9IHBsYWluLm1vZGUgfHwgXCJ0ZXh0XCI7XG4gICAgdGhpcy5mb3JtTW9kZSA9IHBsYWluLmZvcm1Nb2RlIHx8IGdldEZvcm1Nb2RlRnJvbU1vZGUodGhpcy5tb2RlKTtcbiAgICB0aGlzLnZhbHVlID0gcGxhaW4udmFsdWUgfHwgXCJcIjtcbiAgICB0aGlzLmlzRGVmYXVsdCA9IHBsYWluLmlzRGVmYXVsdCB8fCBpc0RlZmF1bHQ7XG4gICAgdGhpcy5lcnJvciA9IHBsYWluLmVycm9yIHx8IFwiXCI7XG4gICAgdGhpcy5sb2FkaW5nID0gcGxhaW4ubG9hZGluZyB8fCBmYWxzZTtcblxuICAgIHZhbGlkYXRlTW9kZXModGhpcyk7XG5cbiAgICB0aGlzLmNsYXNzID0gU2VhcmNoUGxhY2U7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRNb2RlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLm1vZGU7XG4gIH07XG5cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldFZhbHVlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9O1xuXG4gIC8qIHNob3duIHRleHQgKi9cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldFRleHQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG1vZGUgPSB0aGlzLm1vZGU7XG4gICAgaWYgKG1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAgIHJldHVybiB0cihcIkFueXdoZXJlXCIsXCJhbnl3aGVyZVwiKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXROYW1lKCk7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicmFkaXVzXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldFRleHQoKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJpZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgLyogbmFtZSBvZiBwbGFjZSAqL1xuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0TmFtZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBjb25zb2xlLndhcm4oXCJnZXROYW1lIHNob3VsZG4ndCBiZSB1c2VkXCIpO1xuICAgIHJldHVybiB0aGlzLmdldFVybFN0cmluZygpO1xuICB9O1xuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRVcmxTdHJpbmc9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG1vZGUgPSB0aGlzLm1vZGU7XG4gICAgaWYgKG1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAgIHJldHVybiBcImFueXdoZXJlXCI7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicGxhY2VcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0TmFtZSgpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInJhZGl1c1wiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXRVcmxTdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJpZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldElkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBtb2RlID0gdGhpcy5tb2RlO1xuICAgIGlmIChtb2RlID09IFwidGV4dFwiKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XG4gICAgICByZXR1cm4gXCJhbnl3aGVyZVwiO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldElkKCk7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiaWRcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRQbGFjZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5nZXRNb2RlKCkgPT0gXCJwbGFjZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaFBsYWNlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XHJcblxyXG52YXIgRGVmID0gSW1tdXRhYmxlLlJlY29yZCh7XHJcbiAgaWQ6IG51bGwsXHJcbiAgbnVtYmVyOiBudWxsLFxyXG4gIGRlcGFydHVyZTogbnVsbCxcclxuICBhcnJpdmFsOiBudWxsLFxyXG4gIGFpcmxpbmU6IG51bGxcclxufSk7XHJcblxyXG5mb3IodmFyIERlZl9fX19LZXkgaW4gRGVmKXtpZihEZWYuaGFzT3duUHJvcGVydHkoRGVmX19fX0tleSkpe0ZsaWdodFtEZWZfX19fS2V5XT1EZWZbRGVmX19fX0tleV07fX12YXIgX19fX1N1cGVyUHJvdG9PZkRlZj1EZWY9PT1udWxsP251bGw6RGVmLnByb3RvdHlwZTtGbGlnaHQucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoX19fX1N1cGVyUHJvdG9PZkRlZik7RmxpZ2h0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1GbGlnaHQ7RmxpZ2h0Ll9fc3VwZXJDb25zdHJ1Y3Rvcl9fPURlZjtmdW5jdGlvbiBGbGlnaHQoKXtcInVzZSBzdHJpY3RcIjtpZihEZWYhPT1udWxsKXtEZWYuYXBwbHkodGhpcyxhcmd1bWVudHMpO319XHJcblxyXG4gIEZsaWdodC5wcm90b3R5cGUuZ2V0SWQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy5nZXQoXCJpZFwiKTtcclxuICB9O1xyXG5cclxuICBGbGlnaHQucHJvdG90eXBlLmdldFN0b3BzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIDA7XHJcbiAgfTtcclxuXHJcbiAgRmxpZ2h0LnByb3RvdHlwZS5nZXREZXBhcnR1cmU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy5nZXQoXCJkZXBhcnR1cmVcIik7XHJcbiAgfTtcclxuXHJcbiAgRmxpZ2h0LnByb3RvdHlwZS5nZXRBcnJpdmFsPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0KFwiYXJyaXZhbFwiKTtcclxuICB9O1xyXG5cclxuICBGbGlnaHQucHJvdG90eXBlLmdldER1cmF0aW9uPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIG1vbWVudC5kdXJhdGlvbih0aGlzLmdldEFycml2YWwoKS5nZXQoXCJ3aGVuXCIpLmdldChcInV0Y1wiKS5kaWZmKHRoaXMuZ2V0RGVwYXJ0dXJlKCkuZ2V0KFwid2hlblwiKS5nZXQoXCJ1dGNcIikpKTtcclxuICB9O1xyXG5cclxuICBGbGlnaHQucHJvdG90eXBlLmNvdW50RmxpZ2h0cz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiAxO1xyXG4gIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGbGlnaHQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xyXG5cclxuXHJcbnZhciBEZWYgPSBJbW11dGFibGUuUmVjb3JkKHtcclxuICBpZDogbnVsbCxcclxuICBzb3VyY2U6IG51bGwsXHJcbiAgdHJpcHM6IEltbXV0YWJsZS5NYXAoKSwgLy91c3VhbGx5IHtvdXRib3VuZDogbmV3IFRyaXAoKSwgaW5ib3VuZDogbmV3IFRyaXAoKX1cclxuICBwcmljZXM6IEltbXV0YWJsZS5NYXAoe30pXHJcbn0pO1xyXG5cclxuZm9yKHZhciBEZWZfX19fS2V5IGluIERlZil7aWYoRGVmLmhhc093blByb3BlcnR5KERlZl9fX19LZXkpKXtKb3VybmV5W0RlZl9fX19LZXldPURlZltEZWZfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mRGVmPURlZj09PW51bGw/bnVsbDpEZWYucHJvdG90eXBlO0pvdXJuZXkucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoX19fX1N1cGVyUHJvdG9PZkRlZik7Sm91cm5leS5wcm90b3R5cGUuY29uc3RydWN0b3I9Sm91cm5leTtKb3VybmV5Ll9fc3VwZXJDb25zdHJ1Y3Rvcl9fPURlZjtmdW5jdGlvbiBKb3VybmV5KCl7XCJ1c2Ugc3RyaWN0XCI7aWYoRGVmIT09bnVsbCl7RGVmLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt9fVxyXG5cclxuICBKb3VybmV5LnByb3RvdHlwZS5nZXRJZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLmdldChcImlkXCIpO1xyXG4gIH07XHJcblxyXG4gIEpvdXJuZXkucHJvdG90eXBlLmdldFByaWNlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0SW4oW1wicHJpY2VzXCIsIFwiZGVmYXVsdFwiXSk7XHJcbiAgfTtcclxuXHJcbiAgSm91cm5leS5wcm90b3R5cGUuY291bnRGbGlnaHRzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgLy9UT1xyXG4gIH07XHJcblxyXG4gIEpvdXJuZXkucHJvdG90eXBlLmlzUmV0dXJuPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuICEhdGhpcy5nZXQoXCJ0cmlwc1wiKS5nZXQoXCJpbmJvdW5kXCIpO1xyXG4gIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBKb3VybmV5O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBJbW11dGFibGUgPSByZXF1aXJlKCdpbW11dGFibGUnKTtcclxudmFyIExpc3QgPSBJbW11dGFibGUuTGlzdDtcclxuXHJcbnZhciBEZWYgPSBJbW11dGFibGUuUmVjb3JkKHtcclxuICBtYXN0ZXI6IG51bGwsIC8vVHJpcFxyXG4gIGpvdXJuZXk6IG51bGwsIC8vSm91cm5leSAoaWYgaXQgaXMgcmV0dXJuLCBpdCBpcyBudWxsLCBiZWNhdXNlIHRoZXJlIGFyZSBtdWx0aXBsZSBqb3VybmV5cyBpbiBzbGF2ZXMpXHJcbiAgc2xhdmVzOiBMaXN0KCksIC8vTGlzdCBvZiBNYXAoe3RyaXA6IFRyaXAsIGpvdXJuZXk6IEpvdXJuZXkgKGNvbW1vbiBqb3VybmV5KX0pXHJcbiAgb25lV2F5OiB0cnVlXHJcbn0pO1xyXG5cclxuZm9yKHZhciBEZWZfX19fS2V5IGluIERlZil7aWYoRGVmLmhhc093blByb3BlcnR5KERlZl9fX19LZXkpKXtNYXN0ZXJTbGF2ZXNQYWlyW0RlZl9fX19LZXldPURlZltEZWZfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mRGVmPURlZj09PW51bGw/bnVsbDpEZWYucHJvdG90eXBlO01hc3RlclNsYXZlc1BhaXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoX19fX1N1cGVyUHJvdG9PZkRlZik7TWFzdGVyU2xhdmVzUGFpci5wcm90b3R5cGUuY29uc3RydWN0b3I9TWFzdGVyU2xhdmVzUGFpcjtNYXN0ZXJTbGF2ZXNQYWlyLl9fc3VwZXJDb25zdHJ1Y3Rvcl9fPURlZjtmdW5jdGlvbiBNYXN0ZXJTbGF2ZXNQYWlyKCl7XCJ1c2Ugc3RyaWN0XCI7aWYoRGVmIT09bnVsbCl7RGVmLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt9fVxyXG5cclxuICBNYXN0ZXJTbGF2ZXNQYWlyLnByb3RvdHlwZS5oYXNKb3VybmV5PWZ1bmN0aW9uKGpvdXJuZXlUb0ZpbmQpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBoYXNKb3VybmV5ID0gZmFsc2U7XHJcbiAgICBpZiAoam91cm5leVRvRmluZCA9PSB0aGlzLmdldChcImpvdXJuZXlcIikpIHtcclxuICAgICAgaGFzSm91cm5leSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB0aGlzLmdldChcInNsYXZlc1wiKS5mb3JFYWNoKGZ1bmN0aW9uKHNsYXZlKSAge1xyXG4gICAgICBpZiAoc2xhdmUuZ2V0KFwiam91cm5leVwiKSA9PSBqb3VybmV5VG9GaW5kKSB7XHJcbiAgICAgICAgaGFzSm91cm5leSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGhhc0pvdXJuZXk7XHJcbiAgfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hc3RlclNsYXZlc1BhaXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xyXG5cclxudmFyIERlZiA9IEltbXV0YWJsZS5SZWNvcmQoe1xyXG4gIGZsaWdodHM6IEltbXV0YWJsZS5MaXN0KFtdKVxyXG59KTtcclxuXHJcbmZvcih2YXIgRGVmX19fX0tleSBpbiBEZWYpe2lmKERlZi5oYXNPd25Qcm9wZXJ0eShEZWZfX19fS2V5KSl7VHJpcFtEZWZfX19fS2V5XT1EZWZbRGVmX19fX0tleV07fX12YXIgX19fX1N1cGVyUHJvdG9PZkRlZj1EZWY9PT1udWxsP251bGw6RGVmLnByb3RvdHlwZTtUcmlwLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZEZWYpO1RyaXAucHJvdG90eXBlLmNvbnN0cnVjdG9yPVRyaXA7VHJpcC5fX3N1cGVyQ29uc3RydWN0b3JfXz1EZWY7ZnVuY3Rpb24gVHJpcCgpe1widXNlIHN0cmljdFwiO2lmKERlZiE9PW51bGwpe0RlZi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7fX1cclxuICBUcmlwLnByb3RvdHlwZS5nZXRJZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLmdldChcImZsaWdodHNcIikucmVkdWNlKGZ1bmN0aW9uKHJlcywgZmxpZ2h0KSAge1xyXG4gICAgICByZXR1cm4gcmVzLmNvbmNhdChbZmxpZ2h0LmlkXSk7XHJcbiAgICB9LCBbXSkuam9pbihcInxcIik7XHJcbiAgfTtcclxuXHJcbiAgVHJpcC5wcm90b3R5cGUuZ2V0U3RvcHM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy5nZXQoXCJmbGlnaHRzXCIpLmNvdW50KCkgLSAxO1xyXG4gIH07XHJcblxyXG4gIFRyaXAucHJvdG90eXBlLmdldERlcGFydHVyZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLmdldChcImZsaWdodHNcIikuZmlyc3QoKS5nZXQoXCJkZXBhcnR1cmVcIik7XHJcbiAgfTtcclxuXHJcbiAgVHJpcC5wcm90b3R5cGUuZ2V0QXJyaXZhbD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLmdldChcImZsaWdodHNcIikubGFzdCgpLmFycml2YWw7XHJcbiAgfTtcclxuXHJcbiAgVHJpcC5wcm90b3R5cGUuZ2V0RHVyYXRpb249ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gbW9tZW50LmR1cmF0aW9uKHRoaXMuZ2V0QXJyaXZhbCgpLmdldChcIndoZW5cIikuZ2V0KFwidXRjXCIpLmRpZmYodGhpcy5nZXREZXBhcnR1cmUoKS5nZXQoXCJ3aGVuXCIpLmdldChcInV0Y1wiKSkpO1xyXG4gIH07XHJcblxyXG4gIFRyaXAucHJvdG90eXBlLmNvdW50RmxpZ2h0cz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLmdldChcImZsaWdodHNcIikuY291bnQoKTtcclxuICB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHJpcDtcclxuIiwiYXJndW1lbnRzWzRdW1wiQzpcXFxcd3d3XFxcXHNreXBpY2tlci1jb21wb25lbnRzXFxcXG1vZHVsZXNcXFxcY29udGFpbmVyc1xcXFxJbW11dGFibGUuanN4XCJdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsImFyZ3VtZW50c1s0XVtcIkM6XFxcXHd3d1xcXFxza3lwaWNrZXItY29tcG9uZW50c1xcXFxtb2R1bGVzXFxcXE1vZGFsTWVudU1peGluLmpzeFwiXVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgTW9kYWxQaWNrZXIgPSByZXF1aXJlKFwiLi8uLi8uLi9jb21wb25lbnRzL01vZGFsUGlja2VyLmpzeFwiKTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9EYXRlUGlja2VyLmpzeCcpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcblxuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGluaXRpYWxWYWx1ZTogbmV3IFNlYXJjaERhdGUoKSxcbiAgb25IaWRlOiBmdW5jdGlvbigpIHt9LFxuICBhcHBlbmRUb0VsZW1lbnQ6IGRvY3VtZW50LmJvZHksXG4gIGxvY2FsZTogXCJlblwiLFxuICBzaXplczoge1xuICAgIHNpbmdsZToge3dpZHRoOiA0NTQsIGhlaWdodDogMjAwfSxcbiAgICBpbnRlcnZhbDoge3dpZHRoOiA5MjQsIGhlaWdodDogMjAwLCB3aWR0aENvbXBhY3Q6IDQ1NH0sXG4gICAgbW9udGg6IHt3aWR0aDogNTUwLCBoZWlnaHQ6IDIwMH0sXG4gICAgdGltZVRvU3RheToge3dpZHRoOiA1NTAsIGhlaWdodDogMjAwfSxcbiAgICBhbnl0aW1lOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9LFxuICAgIG5vUmV0dXJuOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gIH0sXG4gIG1vZGVzOiB7XG4gICAgXCJzaW5nbGVcIjoge1xuICAgICAgY2xvc2VBZnRlcjogXCJzZWxlY3RcIiwgLy8gc2VsZWN0XG4gICAgICBmaW5pc2hBZnRlcjogXCJzZWxlY3RcIiAvLyBzZWxlY3RcbiAgICB9LFxuICAgIFwiaW50ZXJ2YWxcIjoge30sXG4gICAgXCJtb250aFwiOiB7fSxcbiAgICBcInRpbWVUb1N0YXlcIjoge30sXG4gICAgXCJhbnl0aW1lXCI6IHt9LFxuICAgIFwibm9SZXR1cm5cIjoge31cbiAgfVxufTtcblxudmFyIERhdGVQaWNrZXJNb2RhbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJEYXRlUGlja2VyTW9kYWxcIixcbiAgZ2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLnByb3BzLm9wdGlvbnMpO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uczoge31cbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnRTaXplOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gICAgfTtcbiAgfSxcbiAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcbiAgICBpZiAob3B0aW9ucy5tb2Rlc1t2YWx1ZS5tb2RlXSAmJiBvcHRpb25zLm1vZGVzW3ZhbHVlLm1vZGVdLmNsb3NlQWZ0ZXIgPT0gY2hhbmdlVHlwZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkhpZGUoKTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSk7XG4gIH0sXG4gIG9uU2l6ZUNoYW5nZTogZnVuY3Rpb24gKHNpemVzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb250ZW50U2l6ZTogc2l6ZXNcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgIGlmICghdGhpcy5wcm9wcy5zaG93bikge3JldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSl9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kYWxQaWNrZXIsIHtjb250ZW50U2l6ZTogdGhpcy5zdGF0ZS5jb250ZW50U2l6ZSwgaW5wdXRFbGVtZW50OiB0aGlzLnByb3BzLmlucHV0RWxlbWVudCwgb25IaWRlOiB0aGlzLnByb3BzLm9uSGlkZX0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHt2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgcmVmOiBcInBsYWNlUGlja2VyXCIsIG9uQ2hhbmdlOiB0aGlzLm9uVmFsdWVDaGFuZ2UsIHNpemVzOiBvcHRpb25zLnNpemVzLCBtb2Rlczogb3B0aW9ucy5tb2Rlcywgb25TaXplQ2hhbmdlOiB0aGlzLm9uU2l6ZUNoYW5nZX1cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXJNb2RhbDtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cclxuXHJcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xyXG5cclxudmFyIENhbGVuZGFyRGF5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyRGF5XCIsXHJcblxyXG4gIG9uT3ZlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5wcm9wcy5vbk92ZXIodGhpcy5wcm9wcy5kYXRlKVxyXG4gIH0sXHJcbiAgb25TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy5kYXRlKVxyXG4gIH0sXHJcblxyXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBkYXRlOiBudWxsLFxyXG4gICAgICBvdGhlck1vbnRoOiAnJ1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBjbGFzc2VzID0gdGhpcy5wcm9wcy5vdGhlck1vbnRoO1xyXG4gICAgaWYgKCFjbGFzc2VzKSB7XHJcbiAgICAgIGNsYXNzZXMgPSBcIlwiO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcclxuICAgICAgY2xhc3NlcyArPSBcIiBkaXNhYmxlZFwiO1xyXG4gICAgICByZXR1cm4gKCAvL29uTW91c2VMZWF2ZT17IHRoaXMucHJvcHMub25MZWF2ZSB9XHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzIH0sIFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJkYXktbnVtYmVyXCJ9LCB0aGlzLnByb3BzLmRhdGUuZGF0ZSgpKVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnByb3BzLm90aGVyKSB7XHJcbiAgICAgIGNsYXNzZXMgKz0gXCIgb3RoZXJcIjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnByb3BzLm92ZXIpIHtcclxuICAgICAgY2xhc3NlcyArPSBcIiBvdmVyXCJcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkKSB7XHJcbiAgICAgIGNsYXNzZXMgKz0gXCIgc2VsZWN0ZWRcIlxyXG4gICAgfVxyXG4gICAgcmV0dXJuICggLy9vbk1vdXNlTGVhdmU9eyB0aGlzLnByb3BzLm9uTGVhdmUgfVxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzZXMsIG9uTW91c2VFbnRlcjogIHRoaXMub25PdmVyLCBvbkNsaWNrOiAgdGhpcy5vblNlbGVjdH0sIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwiZGF5LW51bWJlclwifSwgdGhpcy5wcm9wcy5kYXRlLmRhdGUoKSlcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDYWxlbmRhckRheTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xuXG52YXIgQ2FsZW5kYXJEYXkgPSByZXF1aXJlKFwiLi9DYWxlbmRhckRheS5qc3hcIik7XG52YXIgRGF5c0luV2VlayA9IHJlcXVpcmUoXCIuL1NlbGVjdERheXNJbldlZWsuanN4XCIpO1xudmFyIENhbGVuZGFyID0gcmVxdWlyZShcIi4vLi4vLi4vLi4vY29tcG9uZW50cy9DYWxlbmRhci5qc3hcIik7XG52YXIgRGF0ZVRvb2xzID0gcmVxdWlyZShcIi4vLi4vLi4vLi4vdG9vbHMvRGF0ZVRvb2xzLmpzXCIpO1xuXG52YXIgQ2FsZW5kYXJGcmFtZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJDYWxlbmRhckZyYW1lXCIsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0ZU92ZXI6IG51bGwsXG4gICAgICB2aWV3RGF0ZTogbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pIHx8IG1vbWVudC51dGMoKVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBjYWxlbmRhcnNOdW1iZXI6IDEsXG4gICAgICBzZWxlY3Rpb25Nb2RlOiBcInNpbmdsZVwiXG5cbiAgICB9O1xuICB9LFxuXG4gIG9uT3ZlcjogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRhdGVPdmVyOiBkYXRlXG4gICAgfSk7XG4gIH0sXG5cbiAgLy9UT0RPIGNoZWNoIGlmIGl0IGlzIGdvb2QgdG8gaGF2ZSB0aGlzIHN0YXRlIGhlcmUsIG9yIGkgc2hvdWxkIHB1dCBpdCB0byBEYXRlUGlja2VcbiAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB2aWV3RGF0ZTogdGhpcy5zdGF0ZS52aWV3RGF0ZS5hZGQoMSwgJ21vbnRocycpXG4gICAgfSk7XG4gIH0sXG5cbiAgcHJldjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB2aWV3RGF0ZTogdGhpcy5zdGF0ZS52aWV3RGF0ZS5zdWJ0cmFjdCgxLCAnbW9udGhzJylcbiAgICB9KTtcbiAgfSxcblxuICBzZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSlcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICAgIC8vaWYgc2luZ2xlIGp1c3Qgc2VsZWN0XG4gICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcInNpbmdsZVwiLCBmcm9tOiBkYXRlLCB0bzogZGF0ZX0sXCJzZWxlY3RcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJpbnRlcnZhbFwiKSB7XG4gICAgICAvL2lmIGludGVydmFsIGRlY2lkZSBvbiBtb2RlXG4gICAgICBpZiAoIXRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xuICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IGRhdGUsIHRvOiBudWxsLCBmaW5hbDogZmFsc2V9LFwic2VsZWN0UGFydGlhbFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMucHJvcHMudmFsdWUudG8pIHtcbiAgICAgICAgLy9pZiBpcyBiZWZvcmUsIGp1c3QgcHV0IHN0YXJ0IGRhdGUgYWdhaW5cbiAgICAgICAgaWYgKGRhdGUgPCB0aGlzLnByb3BzLnZhbHVlLmZyb20pIHtcbiAgICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IGRhdGUsIHRvOiBudWxsLCBmaW5hbDogZmFsc2V9LFwic2VsZWN0UGFydGlhbFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IG1vbWVudC51dGModGhpcy5wcm9wcy52YWx1ZS5mcm9tKSwgdG86IGRhdGV9LFwic2VsZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIGkgaGF2ZSBjaG9zZW4gYm90aCBpIHN0YXJ0IHRvIHBpY2sgbmV3IG9uZVxuICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IGRhdGUsIHRvOiBudWxsLCBmaW5hbDogZmFsc2V9LFwic2VsZWN0UGFydGlhbFwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgaXNTZWxlY3RlZDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgICAgcmV0dXJuIGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIikgPT0gbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pLmZvcm1hdChcIllZWVlNTUREXCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09IFwiaW50ZXJ2YWxcIikge1xuICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWUudG8pIHtcbiAgICAgICAgcmV0dXJuIGRhdGUgPj0gdGhpcy5wcm9wcy52YWx1ZS5mcm9tICYmIGRhdGUgPD0gdGhpcy5wcm9wcy52YWx1ZS50bztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpID09IG1vbWVudC51dGModGhpcy5wcm9wcy52YWx1ZS5mcm9tKS5mb3JtYXQoXCJZWVlZTU1ERFwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgaXNPdmVyOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5kYXRlT3Zlcikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJpbnRlcnZhbFwiKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZS5mcm9tICYmICF0aGlzLnByb3BzLnZhbHVlLnRvKSB7XG4gICAgICAgIHJldHVybiBkYXRlID49IHRoaXMucHJvcHMudmFsdWUuZnJvbSAmJiBkYXRlIDw9IHRoaXMuc3RhdGUuZGF0ZU92ZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5kYXRlT3Zlci5mb3JtYXQoXCJZWVlZTU1ERFwiKSA9PSBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5kYXRlT3Zlci5mb3JtYXQoXCJZWVlZTU1ERFwiKSA9PSBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpO1xuICAgIH1cbiAgfSxcblxuICBnZXREYXk6IGZ1bmN0aW9uIChkYXRlLCBvdGhlck1vbnRoKSB7XG4gICAgdmFyIG90aGVyID0gZmFsc2U7XG4gICAgdmFyIGRpc2FibGVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMucHJvcHMubWluVmFsdWUgJiYgZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA8PSB0aGlzLnByb3BzLm1pblZhbHVlLmZvcm1hdChcIllZWVlNTUREXCIpKSB7XG4gICAgICBvdGhlciA9IHRydWU7XG4gICAgfVxuICAgIGlmIChkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpIDw9IG1vbWVudCgpLmZvcm1hdChcIllZWVlNTUREXCIpKSB7XG4gICAgICBkaXNhYmxlZCA9IHRydWU7IC8vVE9ETyBzaG91bGQgYmUgcHJvYmFibHkgZGVmaW5lZCBzb21ld2hlcmUgbW9yZSBvdXRzaWRlXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRGF5LCB7XG4gICAgICAgIGtleTogZGF0ZS52YWx1ZU9mKCksIFxuICAgICAgICBkYXRlOiBkYXRlLCBcbiAgICAgICAgb3RoZXJNb250aDogb3RoZXJNb250aCwgXG4gICAgICAgIG9uT3ZlcjogdGhpcy5vbk92ZXIsIFxuICAgICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdCwgXG4gICAgICAgIHNlbGVjdGVkOiB0aGlzLmlzU2VsZWN0ZWQoZGF0ZSksIFxuICAgICAgICBvdmVyOiB0aGlzLmlzT3ZlcihkYXRlKSwgXG4gICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCwgXG4gICAgICAgIG90aGVyOiBvdGhlcn1cbiAgICAgICAgKVxuICAgICk7XG4gIH0sXG4gIHJlbmRlclByZXY6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS52aWV3RGF0ZS5zdWJ0cmFjdCgxLCAnbW9udGhzJykuZm9ybWF0KFwiWVlZWU1NXCIpIDwgbW9tZW50LnV0YygpLmZvcm1hdChcIllZWVlNTVwiKSlcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByZXYgZGlzYWJsZWRcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcmV2XCIsIG9uQ2xpY2s6IHRoaXMucHJldn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpKTtcbiAgfSxcbiAgcmVuZGVyTmV4dDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnZpZXdEYXRlLmFkZCgxLCAnbW9udGhzJykuZm9ybWF0KFwiWVlZWU1NXCIpID4gbW9tZW50LnV0YygpLmFkZCg2LCdtb250aHMnKS5mb3JtYXQoXCJZWVlZTU1cIikpXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJuZXh0IGRpc2FibGVkXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibmV4dFwiLCBvbkNsaWNrOiB0aGlzLm5leHR9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgY2FsZW5kYXJEYXRlcyA9IFtdO1xuICAgIHZhciBpbml0aWFsRGF0ZSA9IG1vbWVudC51dGModGhpcy5zdGF0ZS52aWV3RGF0ZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnByb3BzLmNhbGVuZGFyc051bWJlcjsgKytpKSB7XG4gICAgICBjYWxlbmRhckRhdGVzLnB1c2goIG1vbWVudC51dGMoaW5pdGlhbERhdGUpICk7XG4gICAgICBpbml0aWFsRGF0ZS5hZGQoMSxcIm1vbnRoXCIpXG4gICAgfVxuICAgIHZhciBqID0gMDtcbiAgICB2YXIgY2FsZW5kYXJzID0gY2FsZW5kYXJEYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgIGorKztcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogZGF0ZS52YWx1ZU9mKCksIGNsYXNzTmFtZTogJ2NhbGVuZGFyLXZpZXcgY2FsZW5kYXItdmlldy0nK2p9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyLCB7ZGF0ZTogZGF0ZSwgZ2V0RGF5OiBzZWxmLmdldERheSwgd2Vla09mZnNldDogRGF0ZVRvb2xzLmZpcnN0RGF5T2ZXZWVrKCl9KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgICAgICAgdGhpcy5yZW5kZXJQcmV2KCksIFxuICAgICAgICBjYWxlbmRhcnMsIFxuICAgICAgICAgdGhpcy5yZW5kZXJOZXh0KCksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcbiAgICAgIClcbiAgICApXG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGVuZGFyRnJhbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgTW9kYWxNZW51TWl4aW4gPSByZXF1aXJlKCcuLy4uLy4uLy4uL21peGlucy9Nb2RhbE1lbnVNaXhpbi5qc3gnKTtcbnZhciBDYWxlbmRhckZyYW1lID0gcmVxdWlyZSgnLi9DYWxlbmRhckZyYW1lLmpzeCcpO1xudmFyIE1vbnRoTWF0cml4ID0gcmVxdWlyZShcIi4vTW9udGhNYXRyaXguanN4XCIpO1xudmFyIFNsaWRlciA9IHJlcXVpcmUoJy4vU2xpZGVyLmpzJyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uLy4uLy4uL3Rvb2xzL3RyLmpzJyk7XG52YXIgVHJhbiA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29tcG9uZW50cy9UcmFuLmpzeCcpO1xudmFyIGlzSUUgPSByZXF1aXJlKCcuLy4uLy4uLy4uL3Rvb2xzL2lzSUUuanMnKTtcblxuXG5SZWFjdC5pbml0aWFsaXplVG91Y2hFdmVudHModHJ1ZSk7XG5cbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG5cbnZhciBIYW5kbGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiSGFuZGxlXCIsXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJoYW5kbGVcIn0sIFxuICAgICAgICB0aGlzLnByb3BzLnNsaWRlclZhbHVlXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkRhdGVQaWNrZXJcIixcbiAgbWl4aW5zOiBbTW9kYWxNZW51TWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSA/IHRoaXMucHJvcHMudmFsdWUgOiBuZXcgU2VhcmNoRGF0ZSgpLFxuICAgICAgdmlld01vZGU6IHRoaXMucHJvcHMudmFsdWUgPyB0aGlzLnByb3BzLnZhbHVlLm1vZGUgOiBcInNpbmdsZVwiXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIGRlZmF1bHRNb2RlOiBcInNpbmdsZVwiLFxuICAgICAgbGFuZzogJ2VuJyxcbiAgICAgIG1pblZhbHVlOiBudWxsXG4gICAgfTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgdGhpcy5wcm9wcy5vblNpemVDaGFuZ2UodGhpcy5wcm9wcy5zaXplc1ttb2RlXSk7XG4gIH0sXG4gIGdldE1vZGVMYWJlbDogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgbW9kZUxhYmVscyA9IHtcbiAgICAgIHNpbmdsZTogdHIoXCJTcGVjaWZpY1wiLFwic3BlY2lmaWNcIiksXG4gICAgICBpbnRlcnZhbDogdHIoXCJJbnRlcnZhbFwiLFwiaW50ZXJ2YWxcIiksXG4gICAgICBtb250aDogdHIoXCJNb250aHNcIixcIm1vbnRoc1wiKSxcbiAgICAgIHRpbWVUb1N0YXk6IHRyKFwiVGltZSB0byBzdGF5XCIsXCJ0aW1lX3RvX3N0YXlcIiksXG4gICAgICBhbnl0aW1lOiB0cihcIkFueXRpbWVcIixcImFueXRpbWVcIiksXG4gICAgICBub1JldHVybjogdHIoXCJObyByZXR1cm5cIixcIm5vX3JldHVyblwiKVxuICAgIH07XG4gICAgcmV0dXJuIG1vZGVMYWJlbHNbbW9kZV07XG4gIH0sXG5cbiAgc3dpdGNoTW9kZVRvRnVuYzogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG5ld1ZhbHVlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFwidGltZVRvU3RheVwiOlxuICAgICAgICAgIHNlbGYuY2hhbmdlVmFsdWUoc2VsZi5nZXRWYWx1ZSgpLmVkaXQoe21vZGU6IG1vZGV9KSwgXCJyZWxlYXNlXCIpOyAvLyBzaG91bGQgYnkgc29tZXRoaW5nIGxpa2UgY2hhbmdlIG1vZGUsIGJ1dCBpdCBmaW5pc2hlcyB2YWx1ZSBvbmx5IGFmdGVyIHJlbGVhc2Ugc28gVE9ETyBtYWtlIGl0IHNtYXJ0ZXJcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiYW55dGltZVwiOlxuICAgICAgICBjYXNlIFwibm9SZXR1cm5cIjpcbiAgICAgICAgICBzZWxmLmNoYW5nZVZhbHVlKHNlbGYuZ2V0VmFsdWUoKS5lZGl0KHttb2RlOiBtb2RlfSksIFwic2VsZWN0XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuXG4gICAgICBzZWxmLnByb3BzLm9uU2l6ZUNoYW5nZShzZWxmLnByb3BzLnNpemVzW21vZGVdKTtcbiAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICB2aWV3TW9kZTogbW9kZVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsY2hhbmdlVHlwZSkge1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5lZGl0KHZhbHVlKTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLGNoYW5nZVR5cGUpO1xuICB9LFxuXG4gIGdldFZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudmFsdWU7XG4gIH0sXG5cbiAgc2V0TW9udGg6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh7XG4gICAgICBtb2RlOiBcIm1vbnRoXCIsXG4gICAgICBmcm9tOiBtb21lbnQudXRjKGRhdGUpLnN0YXJ0T2YoJ21vbnRoJyksXG4gICAgICB0bzogbW9tZW50LnV0YyhkYXRlKS5lbmRPZignbW9udGgnKVxuICAgIH0sXCJzZWxlY3RcIik7XG4gIH0sXG5cbiAgY2hhbmdlTWluU3RheURheXM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA+IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZVZhbHVlKHtcbiAgICAgIG1vZGU6IFwidGltZVRvU3RheVwiLFxuICAgICAgbWluU3RheURheXM6IHZhbHVlLFxuICAgICAgbWF4U3RheURheXM6IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5c1xuICAgIH0sIFwiZHJhZ2dlZFwiKTtcbiAgfSxcblxuICBjaGFuZ2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlIDwgdGhpcy5nZXRWYWx1ZSgpLm1pblN0YXlEYXlzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlVmFsdWUoe1xuICAgICAgbW9kZTogXCJ0aW1lVG9TdGF5XCIsXG4gICAgICBtaW5TdGF5RGF5czogdGhpcy5nZXRWYWx1ZSgpLm1pblN0YXlEYXlzLFxuICAgICAgbWF4U3RheURheXM6IHZhbHVlXG4gICAgfSwgXCJkcmFnZ2VkXCIpO1xuICB9LFxuXG4gIHJlbGVhc2VNaW5TdGF5RGF5czogZnVuY3Rpb24gKCkge1xuICAgIC8vIGRvIG5vdCBjaGFuZ2UgdmFsdWUsIGJ1dCB0cmlnZ2VyIGl0IHdpdGggZGlmZmVyZW50IGNoYW5nZSB0eXBlXG4gICAgdGhpcy5jaGFuZ2VWYWx1ZShudWxsLCBcInJlbGVhc2VcIik7XG4gIH0sXG4gIHJlbGVhc2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hhbmdlVmFsdWUobnVsbCwgXCJyZWxlYXNlXCIpO1xuICB9LFxuXG4gIGNvbmZpcm1UaW1lVG9TdGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh0aGlzLnByb3BzLnZhbHVlLCBcInNlbGVjdFwiKTtcbiAgfSxcblxuXG4gIHJlbmRlclNpbmdsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRnJhbWUsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgbWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIHNlbGVjdGlvbk1vZGU6IFwic2luZ2xlXCIsIGNhbGVuZGFyc051bWJlcjogMX0pXG4gICAgKVxuICB9LFxuICByZW5kZXJJbnRlcnZhbDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRnJhbWUsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgbWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIHNlbGVjdGlvbk1vZGU6IFwiaW50ZXJ2YWxcIiwgY2FsZW5kYXJzTnVtYmVyOiAzfSlcbiAgICApXG4gIH0sXG4gIHJlbmRlck1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KE1vbnRoTWF0cml4LCB7bWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIG9uU2V0OiB0aGlzLnNldE1vbnRoLCB0b3RhbE1vbnRoczogXCI2XCJ9KSk7XG4gIH0sXG4gIHJlbmRlclRpbWVUb1N0YXk6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGVhZGxpbmUgPSB0cihcIlN0YXkgdGltZSBmcm9tICVzIHRvICVzIGRheXMuXCIsIFwic3RheV90aW1lX2Zyb21cIiwgW3RoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cywgdGhpcy5nZXRWYWx1ZSgpLm1heFN0YXlEYXlzXSApO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwidGltZS10by1zdGF5XCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnQtaGVhZGxpbmVcIn0sIGhlYWRsaW5lKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNaW5TdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWluU3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWluIGhvcml6b250YWwtc2xpZGVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZSwgbnVsbClcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNYXhTdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWF4U3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWF4IGhvcml6b250YWwtc2xpZGVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZSwgbnVsbClcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzbGlkZXItYXhlXCJ9KSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJidG4gY29uZmlybS10aW1lLXRvLXN0YXktYnV0dG9uXCIsIG9uQ2xpY2s6IHRoaXMuY29uZmlybVRpbWVUb1N0YXl9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW4sIHt0S2V5OiBcIm9rXCJ9LCBcIk9LXCIpKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG4gIHJlbmRlckFueXRpbWU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9LFxuICByZW5kZXJOb1JldHVybjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1vZGUgPSB0aGlzLnN0YXRlLnZpZXdNb2RlO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICdzZWFyY2gtZGF0ZS1waWNrZXIgc2VhcmNoLXBpY2tlciAnK21vZGV9LCBcbiAgICAgICAgIHRoaXMucmVuZGVyTWVudSgpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIn0sIFxuICAgICAgICAgICB0aGlzLnJlbmRlckJvZHkoKSBcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbGVhci1ib3RoXCJ9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBUcmFuID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9jb21wb25lbnRzL1RyYW4uanN4Jyk7XG5cbnZhciBNb250aE1hdHJpeCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJNb250aE1hdHJpeFwiLFxuXG4gIHNldE1vbnRoOiBmdW5jdGlvbiAobW9udGgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYucHJvcHMub25TZXQobW9udGgpO1xuICAgIH1cbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG1vbnRocyA9IFtdO1xuICAgIHZhciBpTW9udGggPSBtb21lbnQudXRjKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJzZUludChzZWxmLnByb3BzLnRvdGFsTW9udGhzLDEwKTsgaSsrKSB7XG4gICAgICBtb250aHMucHVzaCggbW9tZW50LnV0YyhpTW9udGgpICk7XG4gICAgICBpTW9udGguYWRkKDEsIFwibW9udGhzXCIpO1xuICAgIH1cbiAgICB2YXIgbW9udGhzRWxlbWVudHMgPSBtb250aHMubWFwKGZ1bmN0aW9uIChtb250aCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7a2V5OiBtb250aC52YWx1ZU9mKCksIGNsYXNzTmFtZTogXCJtb250aC1vcHRpb25cIiwgb25DbGljazogc2VsZi5zZXRNb250aChtb250aCl9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcIm1vbnRoLW5hbWVcIn0sIFxuICAgICAgICAgICAgIG1vbnRoLmZvcm1hdChcIk1NTU1cIikgXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJyXCIsIG51bGwpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcIm1vbnRoLXllYXJcIn0sIFxuICAgICAgICAgICAgIG1vbnRoLmZvcm1hdChcIllZWVlcIikgXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuICggLy9vbk1vdXNlTGVhdmU9eyB0aGlzLnByb3BzLm9uTGVhdmUgfVxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vbnRoLW1hdHJpeFwifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb250ZW50LWhlYWRsaW5lXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW4sIHt0S2V5OiBcInNlbGVjdF9tb250aFwifSwgXCJTZWxlY3QgbW9udGhcIikpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vbnRoc1wifSwgXG4gICAgICAgICAgbW9udGhzRWxlbWVudHNcbiAgICAgICAgKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vbnRoTWF0cml4O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgVHJhbiA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29tcG9uZW50cy9UcmFuLmpzeCcpO1xuXG52YXIgU2VsZWN0RGF5c0luV2VlayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJTZWxlY3REYXlzSW5XZWVrXCIsXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKCAvL29uTW91c2VMZWF2ZT17IHRoaXMucHJvcHMub25MZWF2ZSB9XG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwgbnVsbCwgXG4gICAgICAgIFwiVHVlXCIsIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge3R5cGU6IFwiY2hlY2tib3hcIiwgbmFtZTogXCJmbHlEYXlzW11cIiwgdmFsdWU6IFwiMlwiLCBjaGVja2VkOiBcIlxcXCJjaGVja2VkXFxcIlwifSksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdERheXNJbldlZWs7XG4iLCJcInVzZSBzdHJpY3RcIjtcbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKFsncmVhY3QnXSwgZmFjdG9yeSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIC8vVE9ETyBnZXQgaXQgYmFjayB3aGVuIHJlcXVpcmUgZnJvbSBhbm90aGVyIGJ1bmRsZSB3aWxsIHdvcmtcclxuICAgIC8vbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3JlYWN0JykpO1xyXG4gICAgbW9kdWxlLmV4cG9ydHM9ZmFjdG9yeSh3aW5kb3cuUmVhY3QpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByb290LlJlYWN0U2xpZGVyID0gZmFjdG9yeShyb290LlJlYWN0KTtcclxuICB9XHJcbn0odGhpcywgZnVuY3Rpb24oUmVhY3QpIHtcclxuXHJcbiAgdmFyIFJlYWN0U2xpZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3MoeyBkaXNwbGF5TmFtZTogJ1JlYWN0U2xpZGVyJyxcclxuXHJcbiAgICBwcm9wVHlwZXM6IHtcclxuICAgICAgbWluVmFsdWU6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXHJcbiAgICAgIG1heFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBzdGVwOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBvcmllbnRhdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsnaG9yaXpvbnRhbCcsICd2ZXJ0aWNhbCddKSxcclxuICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICBvblJlbGVhc2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICB2YWx1ZVByb3BOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXHJcbiAgICB9LFxyXG5cclxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbWluVmFsdWU6IDAsXHJcbiAgICAgICAgbWF4VmFsdWU6IDEwMCxcclxuICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICBzdGVwOiAxLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgICAgdmFsdWVQcm9wTmFtZTogJ3NsaWRlclZhbHVlJ1xyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIG1vdW50ZWQ6IHRydWVcclxuICAgICAgfSlcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBtb3VudGVkOiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRQb3NpdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCF0aGlzLnN0YXRlLm1vdW50ZWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdXBwZXJCb3VuZDogMCxcclxuICAgICAgICAgIGhhbmRsZVdpZHRoOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWluOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWF4OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgc2xpZGVyID0gdGhpcy5yZWZzLnNsaWRlci5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHZhciBoYW5kbGUgPSB0aGlzLnJlZnMuaGFuZGxlLmdldERPTU5vZGUoKTtcclxuICAgICAgdmFyIHJlY3QgPSBzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICB2YXIgc2l6ZSA9IHtcclxuICAgICAgICBob3Jpem9udGFsOiAnY2xpZW50V2lkdGgnLFxyXG4gICAgICAgIHZlcnRpY2FsOiAnY2xpZW50SGVpZ2h0J1xyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG5cclxuICAgICAgdmFyIHBvc2l0aW9uID0ge1xyXG4gICAgICAgIGhvcml6b250YWw6IHsgbWluOiAnbGVmdCcsIG1heDogJ3JpZ2h0JyB9LFxyXG4gICAgICAgIHZlcnRpY2FsOiB7IG1pbjogJ3RvcCcsIG1heDogJ2JvdHRvbScgfVxyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG4gICAgICB2YXIgdXBwZXJCb3VuZCA9IHNsaWRlcltzaXplXSAtIGhhbmRsZVtzaXplXTtcclxuXHJcbiAgICAgIHRoaXMuY2FjaGVkUG9zaXRpb25zID0ge1xyXG4gICAgICAgIHVwcGVyQm91bmQ6IHVwcGVyQm91bmQsXHJcbiAgICAgICAgaGFuZGxlV2lkdGg6IGhhbmRsZVtzaXplXSxcclxuICAgICAgICBzbGlkZXJNaW46IHJlY3RbcG9zaXRpb24ubWluXSxcclxuICAgICAgICBzbGlkZXJNYXg6IHJlY3RbcG9zaXRpb24ubWF4XSAtIGhhbmRsZVtzaXplXVxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gdGhpcy5jYWNoZWRQb3NpdGlvbnM7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE9mZnNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcmF0aW8gPSAodGhpcy5wcm9wcy52YWx1ZSAtIHRoaXMucHJvcHMubWluVmFsdWUpIC8gKHRoaXMucHJvcHMubWF4VmFsdWUgLSB0aGlzLnByb3BzLm1pblZhbHVlKTtcclxuICAgICAgcmV0dXJuIHJhdGlvICogdGhpcy5nZXRQb3NpdGlvbnMoKS51cHBlckJvdW5kO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgaGFuZGxlU3R5bGUgPSB7XHJcbiAgICAgICAgLy90cmFuc2Zvcm06ICd0cmFuc2xhdGUnICsgdGhpcy5fYXhpcygpICsgJygnICsgICsgJ3B4KScsXHJcbiAgICAgICAgbWFyZ2luTGVmdDogdGhpcy5nZXRPZmZzZXQoKSArICdweCcsXHJcbiAgICAgICAgLy8gbGV0IHRoaXMgZWxlbWVudCBiZSB0aGUgc2FtZSBzaXplIGFzIGl0cyBjaGlsZHJlbi5cclxuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgdmFyIHVzZXJIYW5kbGUgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xyXG4gICAgICB1c2VySGFuZGxlLnByb3BzW3RoaXMucHJvcHMudmFsdWVQcm9wTmFtZV0gPSB0aGlzLnByb3BzLnZhbHVlO1xyXG5cclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBSZWFjdC5ET00uZGl2KHsgcmVmOiAnc2xpZGVyJywgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5fb25DbGljayB9LFxyXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7IHJlZjogJ2hhbmRsZScsIHN0eWxlOiBoYW5kbGVTdHlsZSwgb25Nb3VzZURvd246IHRoaXMuX2RyYWdTdGFydCwgb25Ub3VjaE1vdmU6IHRoaXMuX3RvdWNoTW92ZSB9LFxyXG4gICAgICAgICAgICB1c2VySGFuZGxlXHJcbiAgICAgICAgICApKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsaWNrOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IGVbJ3BhZ2UnICsgdGhpcy5fYXhpcygpXTtcclxuICAgICAgdGhpcy5fbW92ZUhhbmRsZShwb3NpdGlvbik7XHJcbiAgICB9LFxyXG5cclxuICAgIF9kcmFnU3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9kcmFnTW92ZSwgZmFsc2UpO1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fZHJhZ0VuZCwgZmFsc2UpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfZHJhZ01vdmU6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gZVsncGFnZScgKyB0aGlzLl9heGlzKCldO1xyXG4gICAgICB0aGlzLl9tb3ZlSGFuZGxlKHBvc2l0aW9uKTtcclxuICAgIH0sXHJcblxyXG4gICAgX2RyYWdFbmQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9kcmFnTW92ZSwgZmFsc2UpO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fZHJhZ0VuZCwgZmFsc2UpO1xyXG4gICAgICB0aGlzLnByb3BzLm9uUmVsZWFzZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfdG91Y2hNb3ZlOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHZhciBsYXN0ID0gZS5jaGFuZ2VkVG91Y2hlc1tlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBsYXN0WydwYWdlJyArIHRoaXMuX2F4aXMoKV07XHJcbiAgICAgIHRoaXMuX21vdmVIYW5kbGUocG9zaXRpb24pO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9tb3ZlSGFuZGxlOiBmdW5jdGlvbihwb3NpdGlvbikge1xyXG5cclxuICAgICAgLy8gbWFrZSBjZW50ZXIgb2YgaGFuZGxlIGFwcGVhciB1bmRlciB0aGUgY3Vyc29yIHBvc2l0aW9uXHJcbiAgICAgIHZhciBwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9ucygpO1xyXG4gICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIC0gKHBvc2l0aW9ucy5oYW5kbGVXaWR0aCAvIDIpO1xyXG5cclxuICAgICAgdmFyIGxhc3RWYWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XHJcblxyXG4gICAgICB2YXIgcmF0aW8gPSAocG9zaXRpb24gLSBwb3NpdGlvbnMuc2xpZGVyTWluKSAvIChwb3NpdGlvbnMuc2xpZGVyTWF4IC0gcG9zaXRpb25zLnNsaWRlck1pbik7XHJcbiAgICAgIHZhciB2YWx1ZSA9IHJhdGlvICogKHRoaXMucHJvcHMubWF4VmFsdWUgLSB0aGlzLnByb3BzLm1pblZhbHVlKSArIHRoaXMucHJvcHMubWluVmFsdWU7XHJcblxyXG4gICAgICB2YXIgbmV4dFZhbHVlID0gdGhpcy5fdHJpbUFsaWduVmFsdWUodmFsdWUpO1xyXG5cclxuICAgICAgdmFyIGNoYW5nZWQgPSBuZXh0VmFsdWUgIT09IGxhc3RWYWx1ZTtcclxuXHJcbiAgICAgIGlmIChjaGFuZ2VkICYmIHRoaXMucHJvcHMub25DaGFuZ2UpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5leHRWYWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2F4aXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICdob3Jpem9udGFsJzogJ1gnLFxyXG4gICAgICAgICd2ZXJ0aWNhbCc6ICdZJ1xyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG4gICAgfSxcclxuXHJcbiAgICBfdHJpbUFsaWduVmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICBpZiAodmFsIDw9IHRoaXMucHJvcHMubWluVmFsdWUpIHZhbCA9IHRoaXMucHJvcHMubWluVmFsdWU7XHJcbiAgICAgIGlmICh2YWwgPj0gdGhpcy5wcm9wcy5tYXhWYWx1ZSkgdmFsID0gdGhpcy5wcm9wcy5tYXhWYWx1ZTtcclxuXHJcbiAgICAgIHZhciB2YWxNb2RTdGVwID0gKHZhbCAtIHRoaXMucHJvcHMubWluVmFsdWUpICUgdGhpcy5wcm9wcy5zdGVwO1xyXG4gICAgICB2YXIgYWxpZ25WYWx1ZSA9IHZhbCAtIHZhbE1vZFN0ZXA7XHJcblxyXG4gICAgICBpZiAoTWF0aC5hYnModmFsTW9kU3RlcCkgKiAyID49IHRoaXMucHJvcHMuc3RlcCkge1xyXG4gICAgICAgIGFsaWduVmFsdWUgKz0gKHZhbE1vZFN0ZXAgPiAwKSA/IHRoaXMucHJvcHMuc3RlcCA6ICgtIHRoaXMucHJvcHMuc3RlcCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KGFsaWduVmFsdWUudG9GaXhlZCg1KSk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gUmVhY3RTbGlkZXI7XHJcblxyXG59KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcbnZhciBTZWFyY2hGb3JtU3RvcmUgPSByZXF1aXJlKCcuLi8uLi9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCcpO1xyXG52YXIgZmxpZ2h0c0FQSSA9IHJlcXVpcmUoJy4uLy4uL0FQSXMvRmxpZ2h0c0FQSS5qc3gnKTtcclxudmFyIE9wdGlvbnNTdG9yZSAgPSByZXF1aXJlKCcuLy4uLy4uL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XHJcbnZhciBQcmljZUdyb3VwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1ByaWNlR3JvdXAuanN4Jyk7XHJcblxyXG5cclxudmFyIHByaWNlR3JvdXBLZXkgPSBmdW5jdGlvbihwcmljZUdyb3VwKSAge3JldHVybiBwcmljZUdyb3VwLnByaWNlK1wiX1wiK3ByaWNlR3JvdXAuaXNSZXR1cm47fTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gIGRpc3BsYXlOYW1lOiBcIkdyb3VwZWRSZXN1bHRzXCIsXHJcblxyXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcHJpY2VHcm91cHM6IFtdXHJcbiAgICB9O1xyXG4gIH0sXHJcbiAgLyogZ3JvdXAgam91cm5leXMgYnkgcHJpY2UgKi9cclxuICBncm91cEpvdXJuZXlzOiBmdW5jdGlvbiAoam91cm5leXMpIHtcclxuICAgIHZhciBwcmljZUdyb3Vwc0luZGV4ID0ge307XHJcbiAgICBqb3VybmV5cy5mb3JFYWNoKGZ1bmN0aW9uKGpvdXJuZXkpICB7XHJcbiAgICAgIHZhciBpbmRleCA9IFwiXCIram91cm5leS5nZXRQcmljZSgpK1wiX1wiK2pvdXJuZXkuaXNSZXR1cm4oKTtcclxuICAgICAgaWYgKCFwcmljZUdyb3Vwc0luZGV4W2luZGV4XSkge1xyXG4gICAgICAgIHByaWNlR3JvdXBzSW5kZXhbaW5kZXhdID0ge1xyXG4gICAgICAgICAgcHJpY2U6IGpvdXJuZXkuZ2V0UHJpY2UoKSxcclxuICAgICAgICAgIGlzUmV0dXJuOiBqb3VybmV5LmlzUmV0dXJuKCksXHJcbiAgICAgICAgICBqb3VybmV5czogW11cclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIHByaWNlR3JvdXBzSW5kZXhbaW5kZXhdLmpvdXJuZXlzLnB1c2goam91cm5leSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyhwcmljZUdyb3Vwc0luZGV4KS5tYXAoZnVuY3Rpb24oa2V5KSAge1xyXG4gICAgICByZXR1cm4gcHJpY2VHcm91cHNJbmRleFtrZXldO1xyXG4gICAgfSkuc29ydChmdW5jdGlvbihhLCBiKSAge1xyXG4gICAgICByZXR1cm4gYS5wcmljZSA+IGIucHJpY2UgPyAxIDogLTFcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIGZpbmRQcmVzZWxlY3RlZEpvdXJuZXk6IGZ1bmN0aW9uIChqb3VybmV5cywgaWQpIHtcclxuICAgIHZhciBwcmVzZWxlY3RlZEpvdXJuZXkgPSBudWxsO1xyXG4gICAgam91cm5leXMuZm9yRWFjaChmdW5jdGlvbihqb3VybmV5KSAge1xyXG4gICAgICBpZiAoam91cm5leS5nZXRJZCgpID09IGlkKSB7XHJcbiAgICAgICAgcHJlc2VsZWN0ZWRKb3VybmV5ID0gam91cm5leTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcHJlc2VsZWN0ZWRKb3VybmV5O1xyXG4gIH0sXHJcblxyXG4gIGZpbmRQcmVzZWxlY3RlZEdyb3VwOiBmdW5jdGlvbiAoZ3JvdXBzLCBqb3VybmV5VG9GaW5kKSB7XHJcbiAgICB2YXIgcHJlc2VsZWN0ZWRHcm91cCA9IG51bGw7XHJcbiAgICBncm91cHMuZm9yRWFjaChmdW5jdGlvbihncm91cCkgIHtcclxuICAgICAgZ3JvdXAuam91cm5leXMuZm9yRWFjaChmdW5jdGlvbihqb3VybmV5KSAge1xyXG4gICAgICAgIGlmIChqb3VybmV5VG9GaW5kID09IGpvdXJuZXkpIHtcclxuICAgICAgICAgIHByZXNlbGVjdGVkR3JvdXAgPSBncm91cDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBwcmVzZWxlY3RlZEdyb3VwO1xyXG4gIH0sXHJcblxyXG4gIGxvYWRGbGlnaHRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgbG9hZGluZzogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgICB2YXIgcHJvbWlzZSA9IGZsaWdodHNBUEkuZmluZEZsaWdodHMoe1xyXG4gICAgICBvcmlnaW46IFNlYXJjaEZvcm1TdG9yZS5kYXRhLm9yaWdpbixcclxuICAgICAgZGVzdGluYXRpb246IFNlYXJjaEZvcm1TdG9yZS5kYXRhLmRlc3RpbmF0aW9uLFxyXG4gICAgICBvdXRib3VuZERhdGU6IFNlYXJjaEZvcm1TdG9yZS5kYXRhLmRhdGVGcm9tLFxyXG4gICAgICBpbmJvdW5kRGF0ZTogU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGF0ZVRvLFxyXG4gICAgICBwYXNzZW5nZXJzOiBTZWFyY2hGb3JtU3RvcmUuZGF0YS5wYXNzZW5nZXJzXHJcbiAgICB9KTtcclxuICAgIHByb21pc2UudGhlbihmdW5jdGlvbihqb3VybmV5cykgIHtcclxuICAgICAgaWYgKHByb21pc2UgIT0gdGhpcy5sYXN0UHJvbWlzZSkgcmV0dXJuO1xyXG4gICAgICB2YXIgcHJlc2VsZWN0ZWRKb3VybmV5ID0gdGhpcy5maW5kUHJlc2VsZWN0ZWRKb3VybmV5KGpvdXJuZXlzLCB0aGlzLnByb3BzLnByZXNlbGVjdGVkSWQpO1xyXG4gICAgICB2YXIgcHJpY2VHcm91cHMgPSB0aGlzLmdyb3VwSm91cm5leXMoam91cm5leXMpO1xyXG4gICAgICB2YXIgcHJlc2VsZWN0ZWRHcm91cCA9IHRoaXMuZmluZFByZXNlbGVjdGVkR3JvdXAocHJpY2VHcm91cHMsIHByZXNlbGVjdGVkSm91cm5leSk7XHJcbiAgICAgIHRoaXMudG9TY3JvbGwgPSB0cnVlO1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBwcmljZUdyb3VwczogcHJpY2VHcm91cHMsXHJcbiAgICAgICAgcHJlc2VsZWN0ZWRKb3VybmV5OiBwcmVzZWxlY3RlZEpvdXJuZXksXHJcbiAgICAgICAgcHJlc2VsZWN0ZWRHcm91cDogcHJlc2VsZWN0ZWRHcm91cCxcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxyXG4gICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZnVuY3Rpb24oZXJyKSAge1xyXG4gICAgICAvL1RPRE8gbmljZXIgZXJyb3IgaGFuZGxpbmdcclxuICAgICAgY29uc29sZS5lcnJvcihlcnIsIGVyci5zdGFjayk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMubGFzdFByb21pc2UgPSBwcm9taXNlO1xyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy50b1Njcm9sbCkge1xyXG4gICAgICB2YXIgdGhpc05vZGUgPSB0aGlzLmdldERPTU5vZGUoKTtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUucHJlc2VsZWN0ZWRKb3VybmV5ICYmIHRoaXMuc3RhdGUucHJlc2VsZWN0ZWRHcm91cCkge1xyXG4gICAgICAgIHZhciBncm91cE5vZGUgPSB0aGlzLnJlZnNbcHJpY2VHcm91cEtleSh0aGlzLnN0YXRlLnByZXNlbGVjdGVkR3JvdXApXS5nZXRET01Ob2RlKCk7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBncm91cE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdGhpc05vZGUuc2Nyb2xsVG9wID0gcmVjdC50b3AgLSAzMDAgLyogbWFnaWMgY29uc3RhbnQgOikganVzdCBtb3ZlIGl0IGEgbGl0dGxlIGJpdCBoaWdoZXIgKi87XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpc05vZGUuc2Nyb2xsVG9wID0gMDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnRvU2Nyb2xsID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgU2VhcmNoRm9ybVN0b3JlLmV2ZW50cy5vbihcInNlYXJjaFwiLCBmdW5jdGlvbih0eXBlKSAge1xyXG4gICAgICB0aGlzLmxvYWRGbGlnaHRzKCk7XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBsb2FkZXIgPSBcIlwiO1xyXG4gICAgaWYgKHRoaXMuc3RhdGUubG9hZGluZykge1xyXG4gICAgICBsb2FkZXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZ3JvdXBlZC1yZXN1bHRzLS1sb2FkaW5nXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXNwaW5uZXIgZmEtc3BpblwifSkpXHJcbiAgICB9XHJcbiAgICAvL1RPRE8gbG9hZGVyIHNob3VsZCBub3QgYmUgaW4gc2Nyb2xsYWJsZSBhcmVhIC0gbW92ZSBpdCB0byBjb21tb24gd3JhcCBhbmQgc2Nyb2xsIG9ubHkgcmVzdWx0c1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImdyb3VwZWQtcmVzdWx0c1wifSwgXHJcbiAgICAgICAgbG9hZGVyLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwic2Nyb2xsXCJ9LCBcclxuICAgICAgICAgIHRoaXMuc3RhdGUucHJpY2VHcm91cHMubWFwKGZ1bmN0aW9uKHByaWNlR3JvdXApICB7XHJcbiAgICAgICAgICAgIC8vVE9ETyBwYXNzIHN0YXRlLnByZXNlbGVjdGVkSm91cm5leSBpbnRvIGdyb3VwIC0gYWxzbyBqdXN0IGZvclxyXG4gICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHJpY2VHcm91cCwge1xyXG4gICAgICAgICAgICAgICAgcHJlc2VsZWN0ZWQ6ICh0aGlzLnN0YXRlLnByZXNlbGVjdGVkR3JvdXAgPT09IHByaWNlR3JvdXApP3RoaXMuc3RhdGUucHJlc2VsZWN0ZWRKb3VybmV5Om51bGwsIFxyXG4gICAgICAgICAgICAgICAgcmVmOiBwcmljZUdyb3VwS2V5KHByaWNlR3JvdXApLCBcclxuICAgICAgICAgICAgICAgIGtleTogcHJpY2VHcm91cEtleShwcmljZUdyb3VwKSwgXHJcbiAgICAgICAgICAgICAgICBwcmljZUdyb3VwOiBwcmljZUdyb3VwLCBcclxuICAgICAgICAgICAgICAgIGFmZmlsSWQ6IHRoaXMucHJvcHMuYWZmaWxJZFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgIH0uYmluZCh0aGlzKSlcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XHJcbiAgZGlzcGxheU5hbWU6IFwiRGF0ZUZvcm1hdFwiLFxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGxvY2FsID0gdGhpcy5wcm9wcy5kYXRlSW5QbGFjZS5nZXQoXCJsb2NhbFwiKTtcclxuICAgIHZhciB1dGMgPSB0aGlzLnByb3BzLmRhdGVJblBsYWNlLmdldChcInV0Y1wiKTtcclxuICAgIHZhciB0aXRsZSA9IFwiSW4gVVRDIHRpbWU6IFwiICsgdXRjLmZvcm1hdChcIkxMTFwiKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHt0aXRsZTogdGl0bGV9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3Ryb25nXCIsIG51bGwsIGxvY2FsLmZvcm1hdChcIk1NTSBEXCIpKSwgXCIgXCIsIGxvY2FsLmZvcm1hdChcImRkZFwiKSwgXCIgXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzdHJvbmdcIiwgbnVsbCwgbG9jYWwuZm9ybWF0KFwiTFRcIikpKVxyXG4gICAgKVxyXG4gIH1cclxufSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFRyYW5zbGF0ZSA9IHJlcXVpcmUoXCIuLy4uLy4uLy4uL2NvbXBvbmVudHMvVHJhbnNsYXRlLmpzeFwiKTtcbnZhciBQcmljZSA9IHJlcXVpcmUoXCIuLy4uLy4uLy4uL2NvbXBvbmVudHMvUHJpY2UuanN4XCIpO1xuXG52YXIgTGlua0J1dHRvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJMaW5rQnV0dG9uXCIsXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzaGFyZWRKb3VybmV5ID0gdGhpcy5wcm9wcy5zaGFyZWRKb3VybmV5O1xuICAgIHZhciBiYXNlVXJsID0gXCJodHRwczovL2VuLnNreXBpY2tlci5jb20vYm9va2luZ1wiOyAvL1RPRE8gY2hhbmdlIGl0XG4gICAgaWYgKHNoYXJlZEpvdXJuZXkpIHtcbiAgICAgIHZhciB1cmwgPSBiYXNlVXJsICsgXCI/ZmxpZ2h0c0lkPVwiICsgc2hhcmVkSm91cm5leS5nZXQoXCJpZFwiKSArIFwiJnByaWNlPVwiICsgc2hhcmVkSm91cm5leS5nZXRQcmljZSgpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge2hyZWY6IHVybCwgY2xhc3NOYW1lOiBcImJ0blwifSwgUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuc2xhdGUsIHt0S2V5OiBcInJlc3VsdC5ib29rX2ZsaWdodF9mb3JcIn0sIFwiQm9vayBmbGlnaHQgZm9yXCIpLCBcIiBcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChQcmljZSwgbnVsbCwgc2hhcmVkSm91cm5leS5nZXRQcmljZSgpKSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpZCA9IHRoaXMucHJvcHMuc2VsZWN0ZWQuZ2V0KFwib3V0Ym91bmRcIikubWFzdGVyLmdldElkKCkgKyBcInxcIiArICB0aGlzLnByb3BzLnNlbGVjdGVkLmdldChcImluYm91bmRcIikubWFzdGVyLmdldElkKClcbiAgICAgIHZhciB1cmwgPSBiYXNlVXJsICsgXCI/ZmxpZ2h0c0lkPVwiICsgaWQ7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7aHJlZjogdXJsLCBjbGFzc05hbWU6IFwiYnRuXCJ9LCBcIkNoZWNrIHByaWNlIGFuZCBib29rIGZsaWdodFwiKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpbmtCdXR0b247XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBUcmlwSW5mbyA9IHJlcXVpcmUoXCIuL1RyaXBJbmZvLmpzeFwiKTtcbnZhciBJbW11dGFibGUgPSByZXF1aXJlKFwiaW1tdXRhYmxlXCIpO1xudmFyIE1hc3RlclNsYXZlUGFpciA9IHJlcXVpcmUoXCIuLy4uLy4uLy4uL2NvbnRhaW5lcnMvZmxpZ2h0cy9NYXN0ZXJTbGF2ZXNQYWlyLmpzeFwiKTtcbnZhciBNYXAgPSBJbW11dGFibGUuTWFwO1xudmFyIFByaWNlID0gcmVxdWlyZShcIi4vLi4vLi4vLi4vY29tcG9uZW50cy9QcmljZS5qc3hcIik7XG52YXIgVHJhbnNsYXRlID0gcmVxdWlyZShcIi4vLi4vLi4vLi4vY29tcG9uZW50cy9UcmFuc2xhdGUuanN4XCIpO1xuXG52YXIgTGlua0J1dHRvbiA9IHJlcXVpcmUoXCIuL0xpbmtCdXR0b24uanN4XCIpO1xuXG4vKlxuIE1hc3RlciAtIFNsYXZlIGxvZ2ljXG4gQmVjYXVzZSBpIHdhbnRlZCB0byBzb21laG93IGNvbm5lY3QgbXVsdGlwbGUgam91cm5leXMgaW50byBjb21tb24gZ3JvdXBzIHdpdGggc2FtZSBwcmljZSBpIG1hZGUgdGhpcyBsb2dpY1xuIEkgbWFrZSBwYWlycyBmb3Igd2l0aCBkaXJlY3Rpb25zIG91dGJvdW5kIGFuZCBpbmJvdW5kLiBJIG1ha2UgcGFpcnMgd2hlcmUgb3V0Ym91bmQgaXMgbWFzdGVyIGFuZCBpbmJvdW5kIGlzIHNsYXZlIGFuZCBhbHNvIG9wcG9zaXRlIHBhaXJzLlxuIFNsYXZlcyBhcmUgYWxsIHRyaXBzIHdoaWNoIGFsZSBwb3NzaWJsZSB0byBjb25uZWN0IHdpdGggbWFzdGVyIHRyaXAuXG4gSW4gZWFjaCBzbGF2ZSBpcyByZWZlcmVuY2UgdG8gSm91cm5leSB3aGljaCBpcyBjb21tb24gd2l0aCBtYXN0ZXIuXG4gSWYgdGhlcmUgaXMgbm90IGNvbW1vbiBKb3VybmV5IHRvIGJvdGggc2VsZWN0ZWQgdHJpcHMsIGl0IGlzIG5vdCBwb3NzaWJsZSBnZXQgcHJpY2UuIFRvIHByZXZlbnQgdGhpcywgdGhlcmUgaXMgdHdvIG9wdGlvbnM6XG4gMSkgU3BsaXQgdG8gbW9yZSBncm91cHMgKHRoaXMgc2hvdWxkIGJlIG5vdyBpbXBsZW1lbnRlZClcbiAyKSBEbyBub3Qgc2hvdyBwcmljZSBhbmQgbGV0IHVzZXIgdG8gY2hlY2sgaXQgaW4gYm9va2luZ1xuIDMpIERpc2FibGUgYmFkIGNvbWJpbmF0aW9uc1xuXG5cblxuICBwYWlyID0gTWFzdGVyU2xhdmVQYWlyXG4gIHNlbGVjdGVkID0gTWFwKHtcbiAgICBvdXRib3VuZDogTWFzdGVyU2xhdmVQYWlyXG4gICAgaW5ib3VuZDogTWFzdGVyU2xhdmVQYWlyXG4gIH0pXG4gIG1lcmdlZCA9IHtcbiAgICBpbmJvdW5kczogW01hc3RlclNsYXZlUGFpciwuLi5dXG4gICAgb3V0Ym91bmRzOiBbTWFzdGVyU2xhdmVQYWlyLC4uLl1cbiAgfVxuICovXG5cbnZhciBvcHBvc2l0ZURpcmVjdGlvbiA9IGZ1bmN0aW9uKGRpcmVjdGlvbikgIHtyZXR1cm4gZGlyZWN0aW9uID09IFwib3V0Ym91bmRcIiA/IFwiaW5ib3VuZFwiIDogXCJvdXRib3VuZFwiO307XG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcIlByaWNlR3JvdXBcIixcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWVyZ2VkID0gdGhpcy5tZXJnZVRyaXBzKHRoaXMucHJvcHMucHJpY2VHcm91cC5qb3VybmV5cyk7XG4gICAgdmFyIHNlbGVjdGVkID0gdGhpcy5maXJzdFNlbGVjdGVkKE1hcCgpLCBtZXJnZWQpO1xuICAgIGlmICghc2VsZWN0ZWQuZ2V0KFwib3V0Ym91bmRcIikuZ2V0KFwib25lV2F5XCIpICYmICF0aGlzLmlzSW5Db3VudGVycGFydChzZWxlY3RlZC5nZXQoXCJpbmJvdW5kXCIpLCBzZWxlY3RlZC5nZXQoXCJvdXRib3VuZFwiKSkpIHtcbiAgICAgIHNlbGVjdGVkID0gdGhpcy5maXJzdEZyb21QYWlyU2VsZWN0ZWQoc2VsZWN0ZWQsbWVyZ2VkLFwib3V0Ym91bmRcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1lcmdlZDogbWVyZ2VkLFxuICAgICAgc2VsZWN0ZWQ6IHNlbGVjdGVkXG4gICAgfVxuICB9LFxuXG4gIHNlbGVjdEZ1bmM6IGZ1bmN0aW9uIChwYWlyLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSAge1xuICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5zdGF0ZS5zZWxlY3RlZC5zZXQoZGlyZWN0aW9uLCBwYWlyKTtcbiAgICAgIGlmICghcGFpci5nZXQoXCJvbmVXYXlcIikgJiYgIXRoaXMuaXNJbkNvdW50ZXJwYXJ0KHBhaXIsIHNlbGVjdGVkLmdldChvcHBvc2l0ZURpcmVjdGlvbihkaXJlY3Rpb24pKSkpIHtcbiAgICAgICAgc2VsZWN0ZWQgPSB0aGlzLmZpcnN0RnJvbVBhaXJTZWxlY3RlZChzZWxlY3RlZCwgdGhpcy5zdGF0ZS5tZXJnZWQsIGRpcmVjdGlvbik7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgc2VsZWN0ZWQ6IHNlbGVjdGVkXG4gICAgICB9KVxuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIGZpcnN0RnJvbVBhaXJTZWxlY3RlZDpmdW5jdGlvbihzZWxlY3RlZCwgbWVyZ2VkLCBjaGFuZ2VkRGlyZWN0aW9uKSB7XG4gICAgdmFyIGNoYW5naW5nRGlyZWN0aW9uID0gY2hhbmdlZERpcmVjdGlvbiA9PSBcIm91dGJvdW5kXCIgPyBcImluYm91bmRcIiA6IFwib3V0Ym91bmRcIjtcbiAgICB2YXIgcGFpciA9IHNlbGVjdGVkLmdldChjaGFuZ2VkRGlyZWN0aW9uKTtcbiAgICBpZiAocGFpci5nZXQoXCJvbmVXYXlcIikpIHtcbiAgICAgIHJldHVybiBzZWxlY3RlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG5ld1NlbGVjdGVkID0gc2VsZWN0ZWQ7XG4gICAgICBtZXJnZWRbY2hhbmdpbmdEaXJlY3Rpb24rXCJzXCJdLmZvckVhY2goZnVuY3Rpb24oY2hlY2tpbmdQYWlyKSAge1xuICAgICAgICBpZiAoY2hlY2tpbmdQYWlyLm1hc3Rlci5nZXRJZCgpID09ICBwYWlyLnNsYXZlcy5maXJzdCgpLmdldChcInRyaXBcIikuZ2V0SWQoKSkge1xuICAgICAgICAgIG5ld1NlbGVjdGVkID0gbmV3U2VsZWN0ZWQuc2V0KGNoYW5naW5nRGlyZWN0aW9uLGNoZWNraW5nUGFpcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ld1NlbGVjdGVkXG4gICAgfVxuICB9LFxuXG4gIGZpcnN0U2VsZWN0ZWQ6IGZ1bmN0aW9uIChzZWxlY3RlZCwgbWVyZ2VkKSB7XG4gICAgdmFyIHByZXNlbGVjdGVkID0gdGhpcy5wcm9wcy5wcmVzZWxlY3RlZDtcbiAgICBpZiAocHJlc2VsZWN0ZWQpIHtcbiAgICAgIG1lcmdlZC5vdXRib3VuZHMuZm9yRWFjaChmdW5jdGlvbihwYWlyKSAge1xuICAgICAgICBpZiAocGFpci5oYXNKb3VybmV5KHByZXNlbGVjdGVkKSkge1xuICAgICAgICAgIHNlbGVjdGVkID0gc2VsZWN0ZWQuc2V0KFwib3V0Ym91bmRcIiwgcGFpcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbWVyZ2VkLmluYm91bmRzLmZvckVhY2goZnVuY3Rpb24ocGFpcikgIHtcbiAgICAgICAgaWYgKHBhaXIuaGFzSm91cm5leShwcmVzZWxlY3RlZCkpIHtcbiAgICAgICAgICBzZWxlY3RlZCA9IHNlbGVjdGVkLnNldChcImluYm91bmRcIiwgcGFpcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNlbGVjdGVkXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzZWxlY3RlZFxuICAgICAgICAuc2V0KFwib3V0Ym91bmRcIixtZXJnZWQub3V0Ym91bmRzWzBdKVxuICAgICAgICAuc2V0KFwiaW5ib3VuZFwiLG1lcmdlZC5pbmJvdW5kc1swXSlcbiAgICB9XG4gIH0sXG5cbiAgbWVyZ2VUcmlwczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvdXRib3VuZHM6IHRoaXMuc29ydFBhaXJzQnlEYXRlKHRoaXMubWVyZ2VUcmlwc1RvUGFpcnModGhpcy5wcm9wcy5wcmljZUdyb3VwLmpvdXJuZXlzLCBcIm91dGJvdW5kXCIpKSxcbiAgICAgIGluYm91bmRzOiB0aGlzLnNvcnRQYWlyc0J5RGF0ZSh0aGlzLm1lcmdlVHJpcHNUb1BhaXJzKHRoaXMucHJvcHMucHJpY2VHcm91cC5qb3VybmV5cywgXCJpbmJvdW5kXCIpKVxuICAgIH1cbiAgfSxcblxuICBzb3J0UGFpcnNCeURhdGU6IGZ1bmN0aW9uIChwYWlycykge1xuICAgIHJldHVybiBwYWlycy5zb3J0KGZ1bmN0aW9uKGEsIGIpICB7XG4gICAgICBpZiAoYS5tYXN0ZXIuZ2V0RGVwYXJ0dXJlKCkuZ2V0KFwid2hlblwiKS5nZXQoXCJsb2NhbFwiKSA+IGIubWFzdGVyLmdldERlcGFydHVyZSgpLmdldChcIndoZW5cIikuZ2V0KFwibG9jYWxcIikpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfSlcbiAgfSxcblxuICBtZXJnZVRyaXBzVG9QYWlyczogZnVuY3Rpb24gKGpvdXJuZXlzLCBtYXN0ZXJEaXJlY3Rpb24pIHtcbiAgICB2YXIgc2xhdmVEaXJlY3Rpb24gPSBtYXN0ZXJEaXJlY3Rpb24gPT0gXCJvdXRib3VuZFwiID8gXCJpbmJvdW5kXCIgOiBcIm91dGJvdW5kXCI7XG4gICAgdmFyIHBhaXJzID0ge307XG4gICAgam91cm5leXMuZm9yRWFjaChmdW5jdGlvbihqb3VybmV5KSAge1xuICAgICAgaWYgKGpvdXJuZXkuaXNSZXR1cm4oKSkge1xuICAgICAgICAvL1JldHVybnNcbiAgICAgICAgdmFyIGlkID0gam91cm5leS5nZXQoXCJ0cmlwc1wiKS5nZXQobWFzdGVyRGlyZWN0aW9uKS5nZXRJZCgpO1xuICAgICAgICBpZiAoIXBhaXJzW2lkXSkge1xuICAgICAgICAgIHBhaXJzW2lkXSA9IG5ldyBNYXN0ZXJTbGF2ZVBhaXIoe1xuICAgICAgICAgICAgbWFzdGVyOiBqb3VybmV5LmdldChcInRyaXBzXCIpLmdldChtYXN0ZXJEaXJlY3Rpb24pLFxuICAgICAgICAgICAgb25lV2F5OiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHBhaXJzW2lkXSA9IHBhaXJzW2lkXS51cGRhdGVJbihbXCJzbGF2ZXNcIl0sIGZ1bmN0aW9uKHNsYXZlcykgIHtcbiAgICAgICAgICByZXR1cm4gc2xhdmVzLnB1c2goTWFwKHtcbiAgICAgICAgICAgIHRyaXA6IGpvdXJuZXkudHJpcHMuZ2V0KHNsYXZlRGlyZWN0aW9uKSxcbiAgICAgICAgICAgIGpvdXJuZXk6IGpvdXJuZXlcbiAgICAgICAgICB9KSlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL09uZSB3YXlzXG4gICAgICAgIGlmIChqb3VybmV5LmdldChcInRyaXBzXCIpLmdldChtYXN0ZXJEaXJlY3Rpb24pKSB7XG4gICAgICAgICAgdmFyIGlkID0gam91cm5leS5nZXQoXCJ0cmlwc1wiKS5nZXQobWFzdGVyRGlyZWN0aW9uKS5nZXRJZCgpO1xuICAgICAgICAgIHBhaXJzW2lkXSA9IG5ldyBNYXN0ZXJTbGF2ZVBhaXIoe1xuICAgICAgICAgICAgbWFzdGVyOiBqb3VybmV5LmdldChcInRyaXBzXCIpLmdldChtYXN0ZXJEaXJlY3Rpb24pLFxuICAgICAgICAgICAgam91cm5leTogam91cm5leSAsXG4gICAgICAgICAgICBvbmVXYXk6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBhaXJzKS5tYXAoZnVuY3Rpb24oa2V5KSAge3JldHVybiBwYWlyc1trZXldO30pO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIGlmIChuZXdQcm9wcy5wcmljZUdyb3VwICE9IHRoaXMucHJvcHMucHJpY2VHcm91cCkge1xuICAgICAgdmFyIG1lcmdlZCA9IHRoaXMubWVyZ2VUcmlwcyhuZXdQcm9wcy5wcmljZUdyb3VwLmpvdXJuZXlzKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtZXJnZWQ6IG1lcmdlZCxcbiAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuZmlyc3RTZWxlY3RlZCh0aGlzLnN0YXRlLnNlbGVjdGVkLCBtZXJnZWQpXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgZmluZFNoYXJlZEpvdXJuZXk6ZnVuY3Rpb24ob3V0Ym91bmQsIGluYm91bmQpIHtcbiAgICBpZiAob3V0Ym91bmQuZ2V0KFwib25lV2F5XCIpKSB7XG4gICAgICByZXR1cm4gb3V0Ym91bmQuZ2V0KFwiam91cm5leVwiKTtcbiAgICB9XG4gICAgdmFyIHNoYXJlZEpvdXJuZXkgPSBudWxsO1xuICAgIG91dGJvdW5kLmdldChcInNsYXZlc1wiKS5mb3JFYWNoKGZ1bmN0aW9uKG91dGJvdW5kc1NsYXZlSW5ib3VuZCkgIHtcbiAgICAgIGluYm91bmQuZ2V0KFwic2xhdmVzXCIpLmZvckVhY2goZnVuY3Rpb24oaW5ib3VuZHNTbGF2ZU91dGJvdW5kKSAge1xuICAgICAgICBpZiAob3V0Ym91bmRzU2xhdmVJbmJvdW5kLmdldChcImpvdXJuZXlcIikgPT0gaW5ib3VuZHNTbGF2ZU91dGJvdW5kLmdldChcImpvdXJuZXlcIikpIHtcbiAgICAgICAgICBzaGFyZWRKb3VybmV5ID0gb3V0Ym91bmRzU2xhdmVJbmJvdW5kLmdldChcImpvdXJuZXlcIik7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSk7XG4gICAgcmV0dXJuIHNoYXJlZEpvdXJuZXk7XG4gIH0sXG5cbiAgaXNJbkNvdW50ZXJwYXJ0OmZ1bmN0aW9uKHRoaXNQYWlyLG9wcG9zaXRlUGFpcikge1xuICAgIHZhciB0aGlzSWQgPSB0aGlzUGFpci5nZXQoXCJtYXN0ZXJcIikuZ2V0SWQoKTtcbiAgICB2YXIgaXNUaGVyZSA9IGZhbHNlO1xuICAgIG9wcG9zaXRlUGFpci5nZXQoXCJzbGF2ZXNcIikuZm9yRWFjaChmdW5jdGlvbihzbGF2ZSkgIHtcbiAgICAgIGlmICh0aGlzSWQgPT0gc2xhdmUuZ2V0KFwidHJpcFwiKS5nZXRJZCgpKSB7XG4gICAgICAgIGlzVGhlcmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBpc1RoZXJlO1xuICB9LFxuXG4gIC8vaXNJbkNvdW50ZXJwYXJ0KHRoaXNNYXN0ZXIsdGhpc0RpcmVjdGlvbikge1xuICAvLyAgdmFyIHRoaXNJZCA9IHRoaXNNYXN0ZXIuZ2V0SWQoKTtcbiAgLy8gIHZhciB0aGF0RGlyZWN0aW9uID0gdGhpc0RpcmVjdGlvbiA9PSBcIm91dGJvdW5kXCIgPyBcImluYm91bmRcIiA6IFwib3V0Ym91bmRcIjtcbiAgLy8gIHZhciBpc1RoZXJlID0gZmFsc2U7XG4gIC8vICB0aGlzLnN0YXRlLnNlbGVjdGVkLmdldCh0aGF0RGlyZWN0aW9uKS5zbGF2ZXMuZm9yRWFjaCgoc2xhdmUpID0+IHtcbiAgLy8gICAgaWYgKHRoaXNJZCA9PSBzbGF2ZS5nZXQoXCJ0cmlwXCIpLmdldElkKCkpIHtcbiAgLy8gICAgICBpc1RoZXJlID0gdHJ1ZTtcbiAgLy8gICAgfVxuICAvLyAgfSk7XG4gIC8vICByZXR1cm4gaXNUaGVyZTtcbiAgLy99LFxuICByZW5kZXJMZWc6IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcblxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibGVncy1jb250ZW50XCJ9LCBcbiAgICAgICAgdGhpcy5zdGF0ZS5tZXJnZWRbZGlyZWN0aW9uK1wic1wiXS5tYXAoZnVuY3Rpb24ocGFpcikgIHtcbiAgICAgICAgICB2YXIgaWQgPSBwYWlyLmdldChcIm1hc3RlclwiKS5nZXRJZCgpO1xuICAgICAgICAgIHZhciBzZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkLmdldChkaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICBzZWxlY3RlZCA9IGlkID09IHRoaXMuc3RhdGUuc2VsZWN0ZWQuZ2V0KGRpcmVjdGlvbikubWFzdGVyLmdldElkKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYWlyLmdldChcIm9uZVdheVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUcmlwSW5mbywge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBzZWxlY3RlZCwgXG4gICAgICAgICAgICAgICAga2V5OiBcIm9uZXdheS1cIitpZCwgXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IHRoaXMuc2VsZWN0RnVuYyhwYWlyLGRpcmVjdGlvbiksIFxuICAgICAgICAgICAgICAgIHRyaXA6IHBhaXIuZ2V0KFwibWFzdGVyXCIpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3Bwb3NpdGVQYWlyID0gdGhpcy5zdGF0ZS5zZWxlY3RlZC5nZXQob3Bwb3NpdGVEaXJlY3Rpb24oZGlyZWN0aW9uKSk7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRyaXBJbmZvLCB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IHNlbGVjdGVkLCBcbiAgICAgICAgICAgICAgICBoaWRkZW46ICF0aGlzLmlzSW5Db3VudGVycGFydChwYWlyLCBvcHBvc2l0ZVBhaXIpLCBcbiAgICAgICAgICAgICAgICBrZXk6IGRpcmVjdGlvbitcIi1cIitpZCwgXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IHRoaXMuc2VsZWN0RnVuYyhwYWlyLGRpcmVjdGlvbiksIFxuICAgICAgICAgICAgICAgIHRyaXA6IHBhaXIuZ2V0KFwibWFzdGVyXCIpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgIClcbiAgfSxcbiAgcmVuZGVySW5ib3VuZHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImluYm91bmQtbGVnc1wifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJsZWdzLWhlYWRlclwifSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuc2xhdGUsIHt0S2V5OiBcInJlc3VsdC5yZXR1cm5cIn0pXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibGVncy1ib2R5XCJ9LCBcbiAgICAgICAgICB0aGlzLnJlbmRlckxlZyhcImluYm91bmRcIilcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfSxcbiAgcmVuZGVyT3V0Ym91bmRzOiBmdW5jdGlvbiAoaXNSZXR1cm4pIHtcbiAgICB2YXIgaGVhZGVyVGV4dCA9IFwiXCI7XG4gICAgaWYgKGlzUmV0dXJuKSB7XG4gICAgICBoZWFkZXJUZXh0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuc2xhdGUsIHt0S2V5OiBcInJlc3VsdC5kZXBhcnR1cmVcIn0pXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwib3V0Ym91bmQtbGVnc1wifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJsZWdzLWhlYWRlclwifSwgXG4gICAgICAgICAgaGVhZGVyVGV4dFxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImxlZ3MtYm9keVwifSwgXG4gICAgICAgICAgdGhpcy5yZW5kZXJMZWcoXCJvdXRib3VuZFwiKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJpY2UgPSB0aGlzLnByb3BzLnByaWNlR3JvdXAucHJpY2U7XG4gICAgdmFyIGlzUmV0dXJuID0gdGhpcy5wcm9wcy5wcmljZUdyb3VwLmlzUmV0dXJuO1xuICAgIHZhciBzaGFyZWRKb3VybmV5ID0gdGhpcy5maW5kU2hhcmVkSm91cm5leSh0aGlzLnN0YXRlLnNlbGVjdGVkLmdldChcIm91dGJvdW5kXCIpLCB0aGlzLnN0YXRlLnNlbGVjdGVkLmdldChcImluYm91bmRcIikpO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJpY2UtZ3JvdXBcIiArICh0aGlzLnByb3BzLnByZXNlbGVjdGVkP1wiIHByZXNlbGVjdGVkXCI6XCJcIil9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByaWNlLWdyb3VwLS1oZWFkZXJcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHJpY2UsIG51bGwsIHByaWNlKSksIFxuICAgICAgICB0aGlzLnJlbmRlck91dGJvdW5kcyhpc1JldHVybiksIFxuICAgICAgICBpc1JldHVybj90aGlzLnJlbmRlckluYm91bmRzKCk6XCJcIiwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcmljZS1ncm91cC0tZm9vdGVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KExpbmtCdXR0b24sIHtcbiAgICAgICAgICAgIHNoYXJlZEpvdXJuZXk6IHNoYXJlZEpvdXJuZXksIFxuICAgICAgICAgICAgZ3JvdXBQcmljZTogcHJpY2UsIFxuICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWQsIFxuICAgICAgICAgICAgYWZmaWxJZDogdGhpcy5wcm9wcy5hZmZpbElkXG4gICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBEYXRlRm9ybWF0ID0gcmVxdWlyZSgnLi9EYXRlRm9ybWF0LmpzeCcpO1xudmFyIFRyYW5zbGF0ZSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29tcG9uZW50cy9UcmFuc2xhdGUuanN4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJUcmlwRGV0YWlsc1wiLFxuICByZW5kZXJGbGlnaHRzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRyaXAgPSB0aGlzLnByb3BzLnRyaXA7XG4gICAgcmV0dXJuIHRyaXAuZmxpZ2h0cy5tYXAoZnVuY3Rpb24oZmxpZ2h0KSAge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInRyaXAtZGV0YWlscy0tZmxpZ2h0XCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZGVwYXJ0dXJlXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF0ZUZvcm1hdCwge2RhdGVJblBsYWNlOiBmbGlnaHQuZ2V0RGVwYXJ0dXJlKCkuZ2V0KFwid2hlblwiKX0pLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJiclwiLCBudWxsKSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3Ryb25nXCIsIG51bGwsIGZsaWdodC5nZXREZXBhcnR1cmUoKS5nZXRJbihbXCJ3aGVyZVwiLCBcIm5hbWVcIl0pKSwgXCIgKFwiLCBmbGlnaHQuZ2V0RGVwYXJ0dXJlKCkuZ2V0SW4oW1wid2hlcmVcIiwgXCJjb2RlXCJdKSwgXCIpXCJcbiAgICAgICAgICApLCBcblxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBkdXJhdGlvblwifSwgTWF0aC5mbG9vcihmbGlnaHQuZ2V0RHVyYXRpb24oKS5hc0hvdXJzKCkpLCBcImggXCIsIHRyaXAuZ2V0RHVyYXRpb24oKS5taW51dGVzKCksIFwibWluXCIpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgYXJyaXZhbFwifSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVGb3JtYXQsIHtkYXRlSW5QbGFjZTogZmxpZ2h0LmdldEFycml2YWwoKS5nZXQoXCJ3aGVuXCIpfSksIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJyXCIsIG51bGwpLCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzdHJvbmdcIiwgbnVsbCwgZmxpZ2h0LmdldEFycml2YWwoKS5nZXRJbihbXCJ3aGVyZVwiLCBcIm5hbWVcIl0pKSwgXCIgKFwiLCBmbGlnaHQuZ2V0QXJyaXZhbCgpLmdldEluKFtcIndoZXJlXCIsIFwiY29kZVwiXSksIFwiKVwiXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgb3RoZXItaW5mb1wifSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW5zbGF0ZSwge3RLZXk6IFwiY29tbW9uLmFpcmxpbmVcIn0pLCBcIjogXCIsIGZsaWdodC5nZXRJbihbXCJhaXJsaW5lXCIsIFwiY29kZVwiXSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICB9KS50b0pTKCk7XG5cbiAgLy9UT0RPIGFkZCBzdG9wIGluZm9cbiAgICAvKlxuICAgICA8cCBjbGFzcz1cImJvb2tpbmctLWZsaWdodC0tc3RvcC0taW5mb1wiPlxuICAgICA8aSBjbGFzcz1cImljb24gZmEgZmEtY2xvY2stb1wiPjwvaT5cbiAgICAgPCU9PSAkLnQoJ2Jvb2tpbmcuZ2xvYmFsLnN0b3AnLCB7XG4gICAgIGNpdHk6ICc8c3Ryb25nPicgKyBwbGFjZU5hbWVzLmF0dHIoZmxpZ2h0LmF0dHIoJ3NyYycpKSArICc8L3N0cm9uZz4nLFxuICAgICB0aW1lOiAnPHN0cm9uZz4nICsgZmxpZ2h0LnN0b3BEdXJhdGlvbiArICc8L3N0cm9uZz4nXG4gICAgIH0pICU+XG5cbiAgICAgPCUgaWYgKGZsaWdodC5zdG9wT3Zlcm5pZ2h0KSB7ICU+XG4gICAgIDxicj5cbiAgICAgPGkgY2xhc3M9XCJpY29uIGZhIGZhLW1vb24tb1wiPjwvaT5cbiAgICAgPCU9PSAkLnQoJ2Jvb2tpbmcuZ2xvYmFsLnN0b3BPdmVybmlnaHQnKSAlPlxuICAgICA8JSB9ICU+XG5cbiAgICAgPC9wPlxuICAgICAqL1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInRyaXAtZGV0YWlsc1wifSwgXG4gICAgICAgIHRoaXMucmVuZGVyRmxpZ2h0cygpXG4gICAgICApXG4gICAgKVxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFRyaXBEZXRhaWxzID0gcmVxdWlyZSgnLi9UcmlwRGV0YWlscy5qc3gnKTtcbnZhciBEYXRlRm9ybWF0ID0gcmVxdWlyZSgnLi9EYXRlRm9ybWF0LmpzeCcpO1xudmFyIFRyYW5zbGF0ZSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29tcG9uZW50cy9UcmFuc2xhdGUuanN4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJUcmlwSW5mb1wiLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGV0YWlsczogZmFsc2VcbiAgICB9XG4gIH0sXG4gIHNlbGVjdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy50cmlwKTtcbiAgfSxcbiAgdG9nZ2xlRGV0YWlsczogZnVuY3Rpb24gKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZGV0YWlsczogIXRoaXMuc3RhdGUuZGV0YWlsc1xuICAgIH0pXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjbGFzc05hbWUgPSBcInRyaXAtaW5mb1wiO1xuICAgIHZhciB0cmlwID0gdGhpcy5wcm9wcy50cmlwO1xuICAgIHZhciBzdG9wcztcbiAgICBpZiAodHJpcC5nZXRTdG9wcygpID49IDEpIHtcbiAgICAgIHN0b3BzID0gUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuc2xhdGUsIHt0S2V5OiBcInJlc3VsdC5zdG9wc1wiLCB2YWx1ZXM6ICB7c3RvcHM6IHRyaXAuZ2V0U3RvcHMoKX0gfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0b3BzID0gUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuc2xhdGUsIHt0S2V5OiBcImNvbW1vbi5kaXJlY3RfZmxpZ2h0XCJ9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBzZWxlY3RlZFwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5oaWRkZW4pIHtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBub3QtYXZhaWxhYmxlXCI7XG4gICAgfVxuXG4gICAgdmFyIGNpcmNsZUNsYXNzO1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkKSB7XG4gICAgICBjaXJjbGVDbGFzcyA9IFwiZmEgZmEtZG90LWNpcmNsZS1vXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNpcmNsZUNsYXNzID0gXCJmYSBmYS1jaXJjbGUtb1wiO1xuICAgIH1cblxuICAgIHZhciBkZXRhaWxzID0gXCJcIjtcbiAgICBpZiAodGhpcy5zdGF0ZS5kZXRhaWxzKSB7XG4gICAgICBkZXRhaWxzID0gUmVhY3QuY3JlYXRlRWxlbWVudChUcmlwRGV0YWlscywge3RyaXA6IHRoaXMucHJvcHMudHJpcH0pXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzTmFtZSwgb25DbGljazogdGhpcy5zZWxlY3R9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkc1wifSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIHJhZGlvXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBjaXJjbGVDbGFzc30pKSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGRlcGFydHVyZS1kYXRlXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVGb3JtYXQsIHtkYXRlSW5QbGFjZTogdHJpcC5nZXREZXBhcnR1cmUoKS5nZXQoXCJ3aGVuXCIpfSkpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZGVwYXJ0dXJlXCJ9LCB0cmlwLmdldERlcGFydHVyZSgpLmdldEluKFtcIndoZXJlXCIsIFwiY29kZVwiXSkpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZHVyYXRpb25cIn0sIE1hdGguZmxvb3IodHJpcC5nZXREdXJhdGlvbigpLmFzSG91cnMoKSksIFwiaCBcIiwgdHJpcC5nZXREdXJhdGlvbigpLm1pbnV0ZXMoKSwgXCJtaW5cIiksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBhcnJpdmFsLWRhdGVcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF0ZUZvcm1hdCwge2RhdGVJblBsYWNlOiB0cmlwLmdldEFycml2YWwoKS5nZXQoXCJ3aGVuXCIpfSkpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgYXJyaXZhbFwifSwgdHJpcC5nZXRBcnJpdmFsKCkuZ2V0SW4oW1wid2hlcmVcIiwgXCJjb2RlXCJdKSksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBzdG9wc1wifSwgc3RvcHMpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZGV0YWlsc1wiLCBvbkNsaWNrOiB0aGlzLnRvZ2dsZURldGFpbHN9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW5zbGF0ZSwge3RLZXk6IFwicmVzdWx0LmRldGFpbHNcIn0pLCBcIiBcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBcIisgKHRoaXMuc3RhdGUuZGV0YWlscyA/IFwiZmEtY2FyZXQtdXBcIiA6IFwiZmEtY2FyZXQtZG93blwiKX0pKVxuICAgICAgICApLCBcbiAgICAgICAgZGV0YWlsc1xuICAgICAgKVxuICAgIClcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBMYWJlbHNMYXllciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9MYWJlbHNMYXllci5qc3gnKTtcclxudmFyIFBvaW50c0xheWVyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1BvaW50c0xheWVyLmpzeCcpO1xyXG52YXIgUG9pbnRzU1ZHTGF5ZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvUG9pbnRzU1ZHTGF5ZXIuanN4Jyk7XHJcbnZhciBNb3VzZUNsaWNrTGF5ZXIgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvTW91c2VDbGlja0xheWVyLmpzeCcpO1xyXG52YXIgTWFwTGFiZWxzU3RvcmUgPSByZXF1aXJlKCcuLy4uLy4uL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcclxuXHJcbnZhciBNYXBPdmVybGF5ID0gZnVuY3Rpb24gKG1hcCkge1xyXG4gIHRoaXMubWFwID0gbWFwO1xyXG4gIHRoaXMuc2V0TWFwKG1hcCk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBmbGF0Qm91bmRzKGJvdW5kcykge1xyXG4gIHZhciBuZSA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKTtcclxuICB2YXIgc3cgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XHJcbiAgcmV0dXJuIHtcclxuICAgIHdMbmc6IHN3LmxuZygpLFxyXG4gICAgZUxuZzogbmUubG5nKCksXHJcbiAgICBzTGF0OiBzdy5sYXQoKSxcclxuICAgIG5MYXQ6IG5lLmxhdCgpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRQb2ludHNMYXllcihwYW5lcywgbWFwKSB7XHJcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIC8vIG92ZXJsYXlMYXllciwgb3ZlcmxheU1vdXNlVGFyZ2V0IC8vaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvY3VzdG9tb3ZlcmxheXNcclxuICBwYW5lcy5vdmVybGF5TGF5ZXIuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICBkaXYuY2xhc3NOYW1lID0gXCJvdmVybGF5LWNvbnRhaW5lclwiO1xyXG4gIHJldHVybiBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRmFjdG9yeShQb2ludHNMYXllcikoKSwgZGl2KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkUG9pbnRzU1ZHTGF5ZXIocGFuZXMsIG1hcCkge1xyXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAvLyBvdmVybGF5TGF5ZXIsIG92ZXJsYXlNb3VzZVRhcmdldCAvL2h0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2N1c3RvbW92ZXJsYXlzXHJcbiAgcGFuZXMub3ZlcmxheUxheWVyLmFwcGVuZENoaWxkKGRpdik7XHJcbiAgZGl2LmNsYXNzTmFtZSA9IFwib3ZlcmxheS1jb250YWluZXJcIjtcclxuICByZXR1cm4gUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUZhY3RvcnkoUG9pbnRzU1ZHTGF5ZXIpKCksIGRpdik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZExhYmVsc0xheWVyKHBhbmVzLCBtYXApIHtcclxuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgLy8gb3ZlcmxheUxheWVyLCBvdmVybGF5TW91c2VUYXJnZXQgLy9odHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9jdXN0b21vdmVybGF5c1xyXG4gIHBhbmVzLm92ZXJsYXlMYXllci5hcHBlbmRDaGlsZChkaXYpO1xyXG4gIGRpdi5jbGFzc05hbWUgPSBcIm92ZXJsYXktY29udGFpbmVyXCI7XHJcbiAgcmV0dXJuIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVGYWN0b3J5KExhYmVsc0xheWVyKSgpLCBkaXYpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRNb3VzZUNsaWNrTGF5ZXIocGFuZXMsIG1hcCkge1xyXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAvLyBvdmVybGF5TGF5ZXIsIG92ZXJsYXlNb3VzZVRhcmdldCAvL2h0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2N1c3RvbW92ZXJsYXlzXHJcbiAgcGFuZXMub3ZlcmxheU1vdXNlVGFyZ2V0LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgZGl2LmNsYXNzTmFtZSA9IFwib3ZlcmxheS1jb250YWluZXJcIjtcclxuICByZXR1cm4gUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUZhY3RvcnkoTW91c2VDbGlja0xheWVyKSgpLCBkaXYpO1xyXG59XHJcblxyXG5cclxuXHJcbk1hcE92ZXJsYXkucHJvdG90eXBlID0gbmV3IGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3KCk7XHJcblxyXG5NYXBPdmVybGF5LnByb3RvdHlwZS5vbkFkZCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgcGFuZXMgPSB0aGlzLmdldFBhbmVzKCk7XHJcbiAgYWRkUG9pbnRzU1ZHTGF5ZXIocGFuZXMsIHRoaXMubWFwKTtcclxuICBhZGRMYWJlbHNMYXllcihwYW5lcywgdGhpcy5tYXApO1xyXG4gIGFkZE1vdXNlQ2xpY2tMYXllcihwYW5lcywgdGhpcy5tYXApO1xyXG5cclxuICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLm1hcCwgJ3pvb21fY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG92ZXJsYXlQcm9qZWN0aW9uID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XHJcbiAgICB2YXIgYm91bmRzID0gZmxhdEJvdW5kcyh0aGlzLm1hcC5nZXRCb3VuZHMoKSk7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5zZXRNYXBEYXRhKGJvdW5kcywgb3ZlcmxheVByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwuYmluZChvdmVybGF5UHJvamVjdGlvbikpO1xyXG4gIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMubWFwLCAnaWRsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG92ZXJsYXlQcm9qZWN0aW9uID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XHJcbiAgICB2YXIgYm91bmRzID0gZmxhdEJvdW5kcyh0aGlzLm1hcC5nZXRCb3VuZHMoKSk7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5zZXRNYXBEYXRhKGJvdW5kcywgb3ZlcmxheVByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwuYmluZChvdmVybGF5UHJvamVjdGlvbikpO1xyXG4gIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vL01heSBiZSB1c2VkIGxhdGVyOlxyXG5cclxuTWFwT3ZlcmxheS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uICgpIHtcclxuICAvL0RvIG5vdGhpbmcsIGJ1dCBpdCBoYXMgdG8gYmUgaGVyZVxyXG59O1xyXG5cclxuTWFwT3ZlcmxheS5wcm90b3R5cGUub25SZW1vdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgLy9EbyBub3RoaW5nLCBidXQgaXQgaGFzIHRvIGJlIGhlcmVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwT3ZlcmxheTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIFBsYWNlTGFiZWwgPSByZXF1aXJlKCcuL1BsYWNlTGFiZWwuanN4Jyk7XHJcbnZhciBNYXBMYWJlbHNTdG9yZSA9IHJlcXVpcmUoJy4uLy4uLy4uL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcclxudmFyIExhYmVsc0xheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkxhYmVsc0xheWVyXCIsXHJcblxyXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGFiZWxzOiBbXVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSAge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBsYWJlbHM6IE1hcExhYmVsc1N0b3JlLmdldExhYmVscygpXHJcbiAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICByZW5kZXJQbGFjZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBsYWJlbHMgPSB0aGlzLnN0YXRlLmxhYmVscztcclxuICAgIHJldHVybiBsYWJlbHMubWFwKGZ1bmN0aW9uKGxhYmVsKSAge1xyXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VMYWJlbCwge2tleTogbGFiZWwubWFwUGxhY2UucGxhY2UuaWQsIGxhYmVsOiBsYWJlbH0pKVxyXG4gICAgfSlcclxuICB9LFxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImxhYmVscy1vdmVybGF5IG1hcC1vdmVybGF5XCJ9LCBcclxuICAgICAgICB0aGlzLnJlbmRlclBsYWNlcygpXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcblxyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExhYmVsc0xheWVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSAod2luZG93LlJlYWN0KS5hZGRvbnMuUHVyZVJlbmRlck1peGluO1xudmFyIE1hcFBsYWNlc1N0b3JlID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9zdG9yZXMvTWFwUGxhY2VzU3RvcmUuanN4Jyk7XG52YXIgVHJhbnNsYXRlID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9jb21wb25lbnRzL1RyYW5zbGF0ZS5qc3gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuXG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxvYWRpbmc6IGZhbHNlXG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgTWFwUGxhY2VzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsb2FkaW5nOiBNYXBQbGFjZXNTdG9yZS5sb2FkaW5nXG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjbGFzc05hbWUgPSBcIm1hcC1sb2FkZXJcIjtcbiAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICBjbGFzc05hbWUgKz0gXCIgbWFwLWxvYWRlci1sb2FkaW5nXCI7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibWFwLWxvYWRlci13cmFwcGVyXCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc05hbWV9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW5zbGF0ZSwge3RLZXk6IFwibWFwLmxvYWRpbmdfbWFwX3ByaWNlc1wifSwgXCJMb2FkaW5nIG1hcCBwcmljZXNcIiksIFwiIFwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcInNwaW5uZXIgZmEgZmEtc3Bpbm5lciBmYS1zcGluXCJ9KSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xyXG5cclxudmFyIE1vdXNlQ2xpY2tUaWxlID0gcmVxdWlyZSgnLi9Nb3VzZUNsaWNrVGlsZS5qc3gnKTtcclxudmFyIE1hcExhYmVsc1N0b3JlID0gcmVxdWlyZSgnLi4vLi4vLi4vc3RvcmVzL01hcExhYmVsc1N0b3JlLmpzeCcpO1xyXG52YXIgTW91c2VDbGlja0xheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIk1vdXNlQ2xpY2tMYXllclwiLFxyXG5cclxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxhYmVsczogW11cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xyXG4gICAgTWFwTGFiZWxzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgbGFiZWxzOiBNYXBMYWJlbHNTdG9yZS5nZXRMYWJlbHMoKVxyXG4gICAgICB9KVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICByZW5kZXJQb2ludHM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBsYWJlbHMgPSB0aGlzLnN0YXRlLmxhYmVscztcclxuICAgIHJldHVybiBsYWJlbHMubWFwKGZ1bmN0aW9uKGxhYmVsKSAge1xyXG5cclxuICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW91c2VDbGlja1RpbGUsIHtsYWJlbDogbGFiZWwsIGtleTogbGFiZWwubWFwUGxhY2UucGxhY2UuaWQgKyBcImxhYmVsXCJ9KVxyXG4gICAgfSlcclxuICB9LFxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vdXNlLWNsaWNrcy1vdmVybGF5IG1hcC1vdmVybGF5XCJ9LCBcclxuICAgICAgICB0aGlzLnJlbmRlclBvaW50cygpXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZUNsaWNrTGF5ZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFNlYXJjaEZvcm1TdG9yZSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vc3RvcmVzL1NlYXJjaEZvcm1TdG9yZS5qc3gnKTtcclxudmFyIE1hcExhYmVsc1N0b3JlID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9zdG9yZXMvTWFwTGFiZWxzU3RvcmUuanN4Jyk7XHJcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcclxudmFyIFB1cmVSZW5kZXJNaXhpbiA9ICh3aW5kb3cuUmVhY3QpLmFkZG9ucy5QdXJlUmVuZGVyTWl4aW47XHJcblxyXG52YXIgTW91c2VDbGlja1RpbGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiTW91c2VDbGlja1RpbGVcIixcclxuXHJcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ21vdXNlb3ZlcicsIHRoaXMub25Nb3VzZU92ZXIpO1xyXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIodGhpcy5yZWZzLnRpbGUuZ2V0RE9NTm9kZSgpLCAnbW91c2VvdXQnLCB0aGlzLm9uTW91c2VPdXQpO1xyXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIodGhpcy5yZWZzLnRpbGUuZ2V0RE9NTm9kZSgpLCAnY29udGV4dG1lbnUnLCB0aGlzLm9uUmlnaHRDbGljayk7XHJcbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdjbGljaycsIHRoaXMub25DbGljayk7XHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmNsZWFyTGlzdGVuZXJzKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ21vdXNlb3ZlcicpO1xyXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuY2xlYXJMaXN0ZW5lcnModGhpcy5yZWZzLnRpbGUuZ2V0RE9NTm9kZSgpLCAnbW91c2VvdXQnKTtcclxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmNsZWFyTGlzdGVuZXJzKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ2NvbnRleHRtZW51Jyk7XHJcbiAgICBnb29nbGUubWFwcy5ldmVudC5jbGVhckxpc3RlbmVycyh0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdjbGljaycpO1xyXG4gICAgLy9nb29nbGUubWFwcy5ldmVudC5yZW1vdmVEb21MaXN0ZW5lcih0aGlzLnJlZnMubGFiZWwuZ2V0RE9NTm9kZSgpLCAnY29udGV4dG1lbnUnLCB0aGlzLm9uUmlnaHRDbGljayk7XHJcbiAgfSxcclxuXHJcbiAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIE1hcExhYmVsc1N0b3JlLnNldExhYmVsT3Zlcih0aGlzLnByb3BzLmxhYmVsKTtcclxuICB9LFxyXG4gIG9uTW91c2VPdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIE1hcExhYmVsc1N0b3JlLnNldExhYmVsT3V0KHRoaXMucHJvcHMubGFiZWwpO1xyXG4gIH0sXHJcbiAgb25SaWdodENsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIFNlYXJjaEZvcm1TdG9yZS5zZXRGaWVsZChcIm9yaWdpblwiLCBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicGxhY2VcIiwgdmFsdWU6IHRoaXMucHJvcHMubGFiZWwubWFwUGxhY2UucGxhY2V9KSwgXCJzZWxlY3RcIik7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2VhcmNoKCk7XHJcbiAgfSxcclxuICBvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIFNlYXJjaEZvcm1TdG9yZS5zZXRGaWVsZChcImRlc3RpbmF0aW9uXCIsIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogdGhpcy5wcm9wcy5sYWJlbC5tYXBQbGFjZS5wbGFjZX0pLCBcInNlbGVjdFwiKTtcclxuICAgIFNlYXJjaEZvcm1TdG9yZS5zZWFyY2goKTtcclxuICB9LFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzdHlsZSA9IHtcclxuICAgICAgdG9wOiB0aGlzLnByb3BzLmxhYmVsLnBvc2l0aW9uLnksXHJcbiAgICAgIGxlZnQ6IHRoaXMucHJvcHMubGFiZWwucG9zaXRpb24ueFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAodGhpcy5wcm9wcy5sYWJlbC5zaG93RnVsbExhYmVsKSB7XHJcbiAgICAgIHN0eWxlLm1hcmdpblRvcCA9IC04O1xyXG4gICAgICBzdHlsZS5tYXJnaW5MZWZ0ID0gLTg7XHJcbiAgICAgIHN0eWxlLndpZHRoID0gMTY7XHJcbiAgICAgIHN0eWxlLmhlaWdodCA9IDE2O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3R5bGUubWFyZ2luVG9wID0gLTU7XHJcbiAgICAgIHN0eWxlLm1hcmdpbkxlZnQgPSAtNTtcclxuICAgICAgc3R5bGUud2lkdGggPSAxMDtcclxuICAgICAgc3R5bGUuaGVpZ2h0ID0gMTA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwidGlsZVwiLCBjbGFzc05hbWU6IFwibW91c2UtY2xpY2stZmllbGRcIiwgc3R5bGU6IHN0eWxlfSlcclxuICAgIClcclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZUNsaWNrVGlsZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUHVyZVJlbmRlck1peGluID0gKHdpbmRvdy5SZWFjdCkuYWRkb25zLlB1cmVSZW5kZXJNaXhpbjtcclxudmFyIFByaWNlID0gcmVxdWlyZSgnLi8uLi8uLi8uLi9jb21wb25lbnRzL1ByaWNlLmpzeCcpO1xyXG5cclxudmFyIFBsYWNlTGFiZWwgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUGxhY2VMYWJlbFwiLFxyXG5cclxuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBsYWJlbCA9IHRoaXMucHJvcHMubGFiZWw7XHJcbiAgICB2YXIgbWFwUGxhY2UgPSBsYWJlbC5tYXBQbGFjZTtcclxuICAgIHZhciBzdHlsZSA9IHtcclxuICAgICAgdG9wOiBsYWJlbC5wb3NpdGlvbi55LFxyXG4gICAgICBsZWZ0OiBsYWJlbC5wb3NpdGlvbi54XHJcbiAgICB9O1xyXG4gICAgdmFyIGZ1bGxMYWJlbDtcclxuICAgIHZhciBwcmljZTtcclxuICAgIHZhciBsYWJlbFRleHQgPSBtYXBQbGFjZS5wbGFjZS5zaG9ydE5hbWU7XHJcbiAgICB2YXIgY2xhc3NOYW1lID0gXCJjaXR5LWxhYmVsXCI7XHJcbiAgICB2YXIgZmxhZ1RleHQgPSBcIlwiO1xyXG4gICAgaWYgKG1hcFBsYWNlLnByaWNlICYmIG1hcFBsYWNlLmZsYWcgIT0gXCJvcmlnaW5cIikge1xyXG4gICAgICB2YXIgcHJpY2VTdHlsZSA9IHt9O1xyXG4gICAgICAvL2lmICghd2luZG93LkNPTE9SU19MSUdIVE5FU1MpIHtcclxuICAgICAgLy8gIHdpbmRvdy5DT0xPUlNfTElHSFRORVNTID0gMzU7XHJcbiAgICAgIC8vfVxyXG4gICAgICAvL0hVRVxyXG4gICAgICAvL3ByaWNlU3R5bGUuY29sb3IgPSBcImhzbGEoXCIrcGFyc2VJbnQoICgxLXRoaXMucHJvcHMubGFiZWwucmVsYXRpdmVQcmljZSkgKjExNSkrXCIsIDEwMCUsIFwiK3dpbmRvdy5DT0xPUlNfTElHSFRORVNTK1wiJSwgMSlcIjtcclxuICAgICAgLy9MSUdIVE5FU1NcclxuICAgICAgLy9wcmljZVN0eWxlLmNvbG9yID0gXCJoc2xhKDExNSwgMTAwJSwgXCIrcGFyc2VJbnQoICgxLXRoaXMucHJvcHMubGFiZWwucmVsYXRpdmVQcmljZSkgKjQwKStcIiUsIDEpXCI7XHJcbiAgICAgIC8vU0FUVVJBVElPTlxyXG4gICAgICAvL3ByaWNlU3R5bGUuY29sb3IgPSBcImhzbGEoMTE1LCBcIitwYXJzZUludCggKDEtdGhpcy5wcm9wcy5sYWJlbC5yZWxhdGl2ZVByaWNlKSooMS10aGlzLnByb3BzLmxhYmVsLnJlbGF0aXZlUHJpY2UpKigxLXRoaXMucHJvcHMubGFiZWwucmVsYXRpdmVQcmljZSkqKDEtdGhpcy5wcm9wcy5sYWJlbC5yZWxhdGl2ZVByaWNlKSooMS10aGlzLnByb3BzLmxhYmVsLnJlbGF0aXZlUHJpY2UpICoxMDApK1wiJSwgXCIrd2luZG93LkNPTE9SU19MSUdIVE5FU1MrXCIlLCAxKVwiO1xyXG4gICAgICBwcmljZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwiY2l0eS1sYWJlbC1wcmljZVwiLCBzdHlsZTogcHJpY2VTdHlsZX0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUHJpY2UsIG51bGwsIG1hcFBsYWNlLnByaWNlKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0eWxlLm1hcmdpblRvcCA9IDI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1hcFBsYWNlLmZsYWcgPT0gXCJvcmlnaW5cIikge1xyXG4gICAgICAvL2ZsYWdUZXh0ID0gPHNwYW4gY2xhc3NOYW1lPVwiZmxhZy10ZXh0XCI+RnJvbTogPC9zcGFuPjtcclxuICAgICAgY2xhc3NOYW1lICs9IFwiIGZsYWctXCIrbWFwUGxhY2UuZmxhZztcclxuICAgICAgc3R5bGUubWFyZ2luVG9wID0gcHJpY2UgPyAtOSA6IC0yO1xyXG4gICAgfSBlbHNlIGlmIChtYXBQbGFjZS5mbGFnID09IFwiZGVzdGluYXRpb25cIikge1xyXG4gICAgICAvL2ZsYWdUZXh0ID0gPHNwYW4gY2xhc3NOYW1lPVwiZmxhZy10ZXh0XCI+VG86IDwvc3Bhbj47XHJcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBmbGFnLVwiK21hcFBsYWNlLmZsYWc7XHJcbiAgICAgIHN0eWxlLm1hcmdpblRvcCA9IHByaWNlID8gLTkgOiAtMjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobWFwUGxhY2UuZmxhZykge1xyXG4gICAgICBzdHlsZS56SW5kZXggPSAyO1xyXG4gICAgfSBlbHNlIGlmIChsYWJlbC5ob3Zlcikge1xyXG4gICAgICBzdHlsZS56SW5kZXggPSAzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3R5bGUuekluZGV4ID0gMTtcclxuICAgIH1cclxuICAgIGlmIChsYWJlbC5zaG93RnVsbExhYmVsIHx8IG1hcFBsYWNlLmZsYWcgfHwgbGFiZWwuaG92ZXIpIHtcclxuICAgICAgZnVsbExhYmVsID0gKFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImNpdHktbGFiZWwtdGl0bGVcIn0sIGxhYmVsVGV4dCksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJiclwiLCBudWxsKSwgXHJcbiAgICAgICAgICBwcmljZVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwibGFiZWxcIiwgc3R5bGU6IHN0eWxlLCBjbGFzc05hbWU6IGNsYXNzTmFtZX0sIFxyXG4gICAgICAgIGZ1bGxMYWJlbFxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlTGFiZWw7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9ICh3aW5kb3cuUmVhY3QpLmFkZG9ucy5QdXJlUmVuZGVyTWl4aW47XHJcblxyXG52YXIgUG9pbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUG9pbnRcIixcclxuXHJcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaW1hZ2UgPSBcInhcIjtcclxuICAgIHZhciBtYXBQbGFjZSA9IHRoaXMucHJvcHMubGFiZWwubWFwUGxhY2U7XHJcbiAgICB2YXIgc3R5bGUgPSB7XHJcbiAgICAgIHRvcDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi55LFxyXG4gICAgICBsZWZ0OiB0aGlzLnByb3BzLmxhYmVsLnBvc2l0aW9uLnhcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHRoaXMucHJvcHMubGFiZWwuc2hvd0Z1bGxMYWJlbCkge1xyXG4gICAgICBpbWFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwge3N0eWxlOiBzdHlsZSwgc3JjOiBcIi9pbWFnZXMvbWFya2Vycy9jaXR5LnBuZ1wifSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGltYWdlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7c3R5bGU6IHN0eWxlLCBzcmM6IFwiL2ltYWdlcy9tYXJrZXJzL2NpdHlTbWFsbC5wbmdcIn0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucHJvcHMubGFiZWwuaG92ZXIpIHtcclxuICAgICAgaW1hZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHtzdHlsZTogc3R5bGUsIHNyYzogXCIvaW1hZ2VzL21hcmtlcnMvY2l0eVdpdGhQcmljZS5wbmdcIn0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1hcFBsYWNlLmZsYWcgPT0gXCJvcmlnaW5cIikge1xyXG4gICAgICBpbWFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwge3N0eWxlOiBzdHlsZSwgc3JjOiBcIi9pbWFnZXMvbWFya2Vycy9jaXR5V2l0aFByaWNlLnBuZ1wifSlcclxuICAgIH1cclxuICAgIGlmIChtYXBQbGFjZS5mbGFnID09IFwiZGVzdGluYXRpb25cIikge1xyXG4gICAgICBpbWFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwge3N0eWxlOiBzdHlsZSwgc3JjOiBcIi9pbWFnZXMvbWFya2Vycy9jaXR5V2l0aFByaWNlLnBuZ1wifSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaW1hZ2VcclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9ICh3aW5kb3cuUmVhY3QpLmFkZG9ucy5QdXJlUmVuZGVyTWl4aW47XHJcblxyXG52YXIgUG9pbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUG9pbnRcIixcclxuXHJcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2l6ZSA9IDE2O1xyXG4gICAgdmFyIGNvbG9yO1xyXG4gICAgdmFyIG1hcFBsYWNlID0gdGhpcy5wcm9wcy5sYWJlbC5tYXBQbGFjZTtcclxuXHJcbiAgICBpZiAodGhpcy5wcm9wcy5sYWJlbC5zaG93RnVsbExhYmVsKSB7XHJcbiAgICAgIHNpemUgPSAxNlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2l6ZSA9IDhcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5wcm9wcy5sYWJlbC5ob3Zlcikge1xyXG4gICAgICBjb2xvciA9IFwiIzRjYmQ1ZlwiO1xyXG4gICAgICBzaXplID0gdGhpcy5wcm9wcy5sYWJlbC5zaG93RnVsbExhYmVsID8gMTggOiAxMlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMucHJvcHMubGFiZWwubWFwUGxhY2UucHJpY2UpIHtcclxuICAgICAgICBjb2xvciA9IFwiIzJENzVDRFwiO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbG9yID0gXCIjOTk5OTk5XCI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAobWFwUGxhY2UuZmxhZyA9PSBcIm9yaWdpblwiKSB7XHJcbiAgICAgIGNvbG9yID0gXCIjYmQ0YzRjXCI7XHJcbiAgICAgIHNpemUgPSB0aGlzLnByb3BzLmxhYmVsLnNob3dGdWxsTGFiZWwgPyAxOCA6IDEyXHJcbiAgICB9XHJcbiAgICBpZiAobWFwUGxhY2UuZmxhZyA9PSBcImRlc3RpbmF0aW9uXCIpIHtcclxuICAgICAgY29sb3IgPSBcIiM0Y2JkNWZcIjtcclxuICAgICAgc2l6ZSA9IHRoaXMucHJvcHMubGFiZWwuc2hvd0Z1bGxMYWJlbCA/IDE4IDogMTJcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3R5bGUgPSB7XHJcbiAgICAgIHRvcDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi55IC0gc2l6ZS8yLFxyXG4gICAgICBsZWZ0OiB0aGlzLnByb3BzLmxhYmVsLnBvc2l0aW9uLnggLSBzaXplLzIsXHJcbiAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCJcclxuICAgIH07XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzdmdcIiwge2hlaWdodDogc2l6ZSwgd2lkdGg6IHNpemUsIHN0eWxlOiBzdHlsZX0sIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJjaXJjbGVcIiwge2N4OiBzaXplLzIsIGN5OiBzaXplLzIsIHI6IHNpemUvMiwgZmlsbDogXCIjZGRkXCJ9KSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImNpcmNsZVwiLCB7Y3g6IHNpemUvMiwgY3k6IHNpemUvMiwgcjogKHNpemUvMiktMSwgZmlsbDogXCIjZmZmXCJ9KSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImNpcmNsZVwiLCB7Y3g6IHNpemUvMiwgY3k6IHNpemUvMiwgcjogKHNpemUpLzQsIGZpbGw6IGNvbG9yfSlcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb2ludDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIE1hcExhYmVsc1N0b3JlID0gcmVxdWlyZSgnLi4vLi4vLi4vc3RvcmVzL01hcExhYmVsc1N0b3JlLmpzeCcpO1xyXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL1BvaW50LmpzeCcpO1xyXG5cclxuXHJcbnZhciBQb2ludHNMYXllciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQb2ludHNMYXllclwiLFxyXG5cclxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxhYmVsczogW11cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xyXG4gICAgTWFwTGFiZWxzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgbGFiZWxzOiBNYXBMYWJlbHNTdG9yZS5nZXRMYWJlbHMoKVxyXG4gICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyUG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbGFiZWxzID0gdGhpcy5zdGF0ZS5sYWJlbHM7XHJcbiAgICByZXR1cm4gbGFiZWxzLm1hcChmdW5jdGlvbihsYWJlbCkgIHtcclxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBvaW50LCB7a2V5OiBsYWJlbC5tYXBQbGFjZS5wbGFjZS5pZCwgbGFiZWw6IGxhYmVsfSkpXHJcbiAgICB9KVxyXG4gIH0sXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicG9pbnRzLW92ZXJsYXkgbWFwLW92ZXJsYXlcIn0sIFxyXG4gICAgICAgIHRoaXMucmVuZGVyUG9pbnRzKClcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnRzTGF5ZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcbnZhciBNYXBMYWJlbHNTdG9yZSA9IHJlcXVpcmUoJy4uLy4uLy4uL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcclxudmFyIFBvaW50U1ZHID0gcmVxdWlyZSgnLi9Qb2ludFNWRy5qc3gnKTtcclxuXHJcblxyXG52YXIgUG9pbnRzTGF5ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUG9pbnRzTGF5ZXJcIixcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsYWJlbHM6IFtdXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIE1hcExhYmVsc1N0b3JlLmV2ZW50cy5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpICB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIGxhYmVsczogTWFwTGFiZWxzU3RvcmUuZ2V0TGFiZWxzKClcclxuICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gIH0sXHJcblxyXG4gIHJlbmRlclBvaW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGxhYmVscyA9IHRoaXMuc3RhdGUubGFiZWxzO1xyXG4gICAgcmV0dXJuIGxhYmVscy5tYXAoZnVuY3Rpb24obGFiZWwpICB7XHJcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChQb2ludFNWRywge2tleTogbGFiZWwubWFwUGxhY2UucGxhY2UuaWQsIGxhYmVsOiBsYWJlbH0pKVxyXG4gICAgfSlcclxuICB9LFxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInBvaW50cy1zdmctb3ZlcmxheSBtYXAtb3ZlcmxheVwifSwgXHJcbiAgICAgICAgdGhpcy5yZW5kZXJQb2ludHMoKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQb2ludHNMYXllcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIE1vZGFsUGlja2VyID0gcmVxdWlyZShcIi4vLi4vLi4vY29tcG9uZW50cy9Nb2RhbFBpY2tlci5qc3hcIik7XG52YXIgUGxhY2VQaWNrZXIgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzL1BsYWNlUGlja2VyLmpzeFwiKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoXCIuLy4uLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4XCIpO1xudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZScpO1xuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGluaXRpYWxWYWx1ZTogbmV3IFNlYXJjaFBsYWNlKCksXG4gIGxvY2FsZTogXCJlblwiLFxuICBzaXplczoge1xuICAgIGFsbDoge3dpZHRoOiA2MDAsIGhlaWdodDogMjAwfSxcbiAgICBuZWFyYnk6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY2hlYXBlc3Q6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY2l0aWVzQW5kQWlycG9ydHM6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY291bnRyaWVzOiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxuICAgIGFueXdoZXJlOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9LFxuICAgIHJhZGl1czoge3dpZHRoOiAxNjksIGhlaWdodDogMjAwfVxuICB9LFxuICBtb2Rlczoge1xuICAgIFwiYWxsXCI6IHt9LFxuICAgIFwibmVhcmJ5XCI6IHt9LFxuICAgIFwiY2hlYXBlc3RcIjoge30sXG4gICAgXCJjaXRpZXNBbmRBaXJwb3J0c1wiOiB7fSxcbiAgICBcImNvdW50cmllc1wiOiB7fSxcbiAgICBcImFueXdoZXJlXCI6IHt9LFxuICAgIFwicmFkaXVzXCI6IHt9XG4gIH1cbn07XG5cbnZhciBQbGFjZVBpY2tlck1vZGFsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlUGlja2VyTW9kYWxcIixcbiAgZ2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLnByb3BzLm9wdGlvbnMpO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uczoge31cbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnRTaXplOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gICAgfTtcbiAgfSxcbiAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSk7XG4gIH0sXG4gIG9uU2l6ZUNoYW5nZTogZnVuY3Rpb24gKHNpemVzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb250ZW50U2l6ZTogc2l6ZXNcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLmdldE9wdGlvbnMoKSk7XG4gICAgaWYgKCF0aGlzLnByb3BzLnNob3duKSB7cmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKX1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNb2RhbFBpY2tlciwge2NvbnRlbnRTaXplOiB0aGlzLnN0YXRlLmNvbnRlbnRTaXplLCBpbnB1dEVsZW1lbnQ6IHRoaXMucHJvcHMuaW5wdXRFbGVtZW50LCBvbkhpZGU6IHRoaXMucHJvcHMub25IaWRlfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VQaWNrZXIsIHt2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgcmVmOiBcInBsYWNlUGlja2VyXCIsIG9uQ2hhbmdlOiB0aGlzLm9uVmFsdWVDaGFuZ2UsIHNpemVzOiBvcHRpb25zLnNpemVzLCBtb2Rlczogb3B0aW9ucy5tb2Rlcywgb25TaXplQ2hhbmdlOiB0aGlzLm9uU2l6ZUNoYW5nZX1cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlUGlja2VyTW9kYWw7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciB0ZXN0U2hpdCA9IG51bGw7XG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xuUmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi8uLi8uLi90b29scy90ci5qcycpO1xuXG52YXIgUGxhY2VzID0gcmVxdWlyZSgnLi9QbGFjZXMuanN4Jyk7XG52YXIgTW9kYWxNZW51TWl4aW4gPSByZXF1aXJlKCcuLy4uLy4uLy4uL21peGlucy9Nb2RhbE1lbnVNaXhpbi5qc3gnKTtcbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29udGFpbmVycy9QbGFjZS5qc3gnKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBSYWRpdXMgPSByZXF1aXJlKCcuLy4uLy4uLy4uL2NvbnRhaW5lcnMvUmFkaXVzLmpzeCcpO1xuXG52YXIgYWlycG9ydHNBbmRDaXRpZXNUeXBlcyA9IFtQbGFjZS5UWVBFX0NJVFksIFBsYWNlLlRZUEVfQUlSUE9SVF07XG52YXIgY291bnRyeVR5cGVzID0gW1BsYWNlLlRZUEVfQ09VTlRSWV07XG5cbnZhciBQbGFjZVBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQbGFjZVBpY2tlclwiLFxuICBtaXhpbnM6IFtNb2RhbE1lbnVNaXhpbl0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdNb2RlOiB0aGlzLmdldERlZmF1bHRNb2RlKClcbiAgICB9O1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgbGFuZzogJ2VuJ1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdE1vZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvL0ZJUlNUIFZFUlNJT04gLSBBTEwgQU5EIENPVU5UUklFU1xuXG4gICAgLy9pZiAodGhpcy5wcm9wcy52YWx1ZS5tb2RlICE9IFwidGV4dFwiIHx8IHRoaXMucHJvcHMudmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgLy8gIHJldHVybiBcImNvdW50cmllc1wiO1xuICAgIC8vfSBlbHNlIHtcbiAgICAvLyAgcmV0dXJuIFwiYWxsXCI7XG4gICAgLy99XG5cbiAgICAvL1NFQ09ORCBWRVJTSU9OXG5cbiAgICAvL2lmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgLy8gIHJldHVybiBcImFsbFwiO1xuICAgIC8vfSBlbHNlIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAvLyAgcmV0dXJuIFwiYWxsXCI7XG4gICAgLy99IGVsc2UgaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAvLyAgcmV0dXJuIFwiYW55d2hlcmVcIjtcbiAgICAvL30gZWxzZSBpZiAodGhpcy5wcm9wcy52YWx1ZS5tb2RlID09IFwicmFkaXVzXCIpIHtcbiAgICAvLyAgcmV0dXJuIFwicmFkaXVzXCI7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcbiAgICAvL31cblxuICAgIC8vVEhJUkQgVkVSU0lPTlxuICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLmZvcm1Nb2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy52YWx1ZS5mb3JtTW9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiYWxsXCI7XG4gICAgfVxuXG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgdGhpcy5wcm9wcy5vblNpemVDaGFuZ2UodGhpcy5wcm9wcy5zaXplc1ttb2RlXSk7XG4gIH0sXG5cbiAgLy9UT0RPIG1vdmUgaXQgdG8gb3B0aW9uc1xuICBnZXRNb2RlTGFiZWw6IGZ1bmN0aW9uIChtb2RlKSB7XG4gICAgdmFyIG1vZGVMYWJlbHMgPSB7XG4gICAgICBhbGw6IHRyKFwiQWxsIHBsYWNlc1wiLFwiYWxsX3BsYWNlc1wiKSxcbiAgICAgIG5lYXJieTogdHIoXCJOZWFyYnlcIixcIm5lYXJieVwiKSxcbiAgICAgIGNoZWFwZXN0OiB0cihcIkNoZWFwZXN0XCIsXCJjaGVhcGVzdFwiKSxcbiAgICAgIGNpdGllc0FuZEFpcnBvcnRzOiB0cihcIkNpdGllcyBhbmQgYWlycG9ydHNcIixcImNpdGllc19hbmRfYWlycG9ydHNcIiksXG4gICAgICBjb3VudHJpZXM6IHRyKFwiQ291bnRyaWVzXCIsXCJjb3VudHJpZXNcIiksXG4gICAgICBhbnl3aGVyZTogdHIoXCJBbnl3aGVyZVwiLFwiYW55d2hlcmVcIiksXG4gICAgICByYWRpdXM6IHRyKFwiUmFkaXVzIHNlYXJjaFwiLFwicmFkaXVzX3NlYXJjaFwiKVxuICAgIH07XG4gICAgcmV0dXJuIG1vZGVMYWJlbHNbbW9kZV07XG4gIH0sXG5cbiAgc3dpdGNoTW9kZVRvOiBmdW5jdGlvbiAobW9kZSkge1xuICAgIGlmIChtb2RlID09IFwicmFkaXVzXCIpIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInJhZGl1c1wiLCB2YWx1ZTogbmV3IFJhZGl1cygpfSksIFwic2VsZWN0UmFkaXVzXCIpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAgIHRoaXMuc2VsZWN0VmFsdWUobmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcImFueXdoZXJlXCJ9KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy52YWx1ZSwgXCJjaGFuZ2VNb2RlXCIpO1xuICAgIH1cblxuICAgIHRoaXMucHJvcHMub25TaXplQ2hhbmdlKHRoaXMucHJvcHMuc2l6ZXNbbW9kZV0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdmlld01vZGU6IG1vZGVcbiAgICB9KTtcbiAgfSxcblxuICBzd2l0Y2hNb2RlVG9GdW5jOiBmdW5jdGlvbiAobW9kZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpICB7XG4gICAgICB0aGlzLnN3aXRjaE1vZGVUbyhtb2RlKVxuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIGNoZWNrTW9kZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJ0ZXh0XCIgJiYgIXRoaXMucHJvcHMudmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS52aWV3TW9kZSAhPSBcImFsbFwiKSB7XG4gICAgICAgIHRoaXMuc3dpdGNoTW9kZVRvKFwiYWxsXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIChuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgIGlmIChuZXh0UHJvcHMudmFsdWUgIT0gdGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgdGhpcy5jaGVja01vZGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2VsZWN0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTsgLy9pZiBuZXcgdmFsdWUgaXMgbnVsbCBpdCBtZWFudCBpIHdhbnQgdG8ga2VlcCB0aGUgc2FtZSwgaXQgYmVoYXZlcyBhcyBpdCB3YXMgc2VsZWN0ZWRcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZS5zZXQoXCJmb3JtTW9kZVwiLHRoaXMuc3RhdGUudmlld01vZGUpLCBcInNlbGVjdFwiKTtcbiAgfSxcblxuICByZW5kZXJBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlfSk7XG4gIH0sXG5cbiAgcmVuZGVyTmVhcmJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VzLCB7c2VhcmNoOiB0aGlzLnByb3BzLnZhbHVlLCBvblNlbGVjdDogdGhpcy5zZWxlY3RWYWx1ZSwgbmVhcmJ5OiB0cnVlfSk7XG4gIH0sXG5cbiAgcmVuZGVyQ2hlYXBlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXCJzc3NcIikpXG4gIH0sXG5cbiAgcmVuZGVyQ2l0aWVzQW5kQWlycG9ydHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlLCB0eXBlczogYWlycG9ydHNBbmRDaXRpZXNUeXBlc30pO1xuICB9LFxuXG4gIHJlbmRlckNvdW50cmllczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlcywge3NlYXJjaDogdGhpcy5wcm9wcy52YWx1ZSwgb25TZWxlY3Q6IHRoaXMuc2VsZWN0VmFsdWUsIHR5cGVzOiBjb3VudHJ5VHlwZXN9KTtcbiAgfSxcblxuICByZW5kZXJBbnl3aGVyZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSlcbiAgfSxcblxuICByZW5kZXJSYWRpdXM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogJ3NlYXJjaC1wbGFjZS1waWNrZXIgc2VhcmNoLXBpY2tlciAnK21vZGV9LCBcbiAgICAgICAgIHRoaXMucmVuZGVyTWVudSgpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIn0sIFxuICAgICAgICAgICB0aGlzLnJlbmRlckJvZHkoKSBcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbGVhci1ib3RoXCJ9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2VQaWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxyXG52YXIgUGxhY2VSb3cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUGxhY2VSb3dcIixcclxuICBjbGljazogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdCh0aGlzLnByb3BzLnBsYWNlKTtcclxuICB9LFxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHBsYWNlID0gdGhpcy5wcm9wcy5wbGFjZTtcclxuICAgIHZhciBjbGFzc05hbWUgPSBcInBsYWNlLXJvd1wiO1xyXG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcclxuICAgICAgY2xhc3NOYW1lICs9IFwiIHNlbGVjdGVkXCI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzTmFtZSwgb25DbGljazogdGhpcy5jbGlja30sIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwibmFtZVwifSwgXHJcbiAgICAgICAgICBwbGFjZS5nZXROYW1lKClcclxuICAgICAgICApLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInR5cGVcIn0sIFxyXG4gICAgICAgICAgcGxhY2UuZ2V0VHlwZSgpXHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG59KTtcclxuIG1vZHVsZS5leHBvcnRzID0gUGxhY2VSb3c7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFBsYWNlc0FQSSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vQVBJcy9QbGFjZXNBUElDYWNoZWQuanN4Jyk7XG52YXIgUGxhY2VSb3cgPSByZXF1aXJlKCcuL1BsYWNlUm93LmpzeCcpO1xudmFyIEdlb2xvY2F0aW9uID0gcmVxdWlyZSgnLi8uLi8uLi8uLi90b29scy9HZW9sb2NhdGlvbi5qc3gnKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuLy4uLy4uLy4uL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XG52YXIgUGxhY2UgPSByZXF1aXJlKCcuLy4uLy4uLy4uL2NvbnRhaW5lcnMvUGxhY2UuanN4Jyk7XG5mdW5jdGlvbiBmaW5kUG9zKG9iaikge1xuICB2YXIgY3VydG9wID0gMDtcbiAgaWYgKG9iai5vZmZzZXRQYXJlbnQpIHtcbiAgICBkbyB7XG4gICAgICBjdXJ0b3AgKz0gb2JqLm9mZnNldFRvcDtcbiAgICB9IHdoaWxlIChvYmogPSBvYmoub2Zmc2V0UGFyZW50KTtcbiAgICByZXR1cm4gW2N1cnRvcF07XG4gIH1cbn1cblxudmFyIFBsYWNlcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQbGFjZXNcIixcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFzdFNlYXJjaDogbnVsbCxcbiAgICAgIGxhc3RUeXBlczogbnVsbCxcbiAgICAgIGxhc3ROZWFyYnk6IG51bGwsXG4gICAgICBwbGFjZXM6IFtdLFxuICAgICAga2V5U2VsZWN0ZWRJbmRleDogLTEsXG4gICAgICBhcGlFcnJvcjogZmFsc2UsXG4gICAgICBsb2FkaW5nOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICB9O1xuICB9LFxuXG4gIGtleXByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLmtleUlkZW50aWZpZXIgPT0gXCJVcFwiKSB7XG4gICAgICB0aGlzLm1vdmVVcCgpO1xuICAgIH0gZWxzZSBpZiAoZS5rZXlJZGVudGlmaWVyID09IFwiRG93blwiKSB7XG4gICAgICB0aGlzLm1vdmVEb3duKCk7XG4gICAgfSBlbHNlIGlmIChlLmtleUlkZW50aWZpZXIgPT0gXCJFbnRlclwiKSB7XG4gICAgICB0aGlzLnNlbGVjdEZyb21JbmRleCgpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfSxcblxuICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiB0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggLSAxXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoIC0gMVxuICAgICAgfSlcbiAgICB9XG4gIH0sXG5cbiAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4IDwgdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4ICsgMVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IDBcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuXG4gIHNlbGVjdEZyb21JbmRleDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5zZWxlY3QodGhpcy5zdGF0ZS5wbGFjZXNbdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW92ZU5leHQoKTtcbiAgICB9XG4gIH0sXG5cbiAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucmVmcy5wbGFjZXMgJiYgdGhpcy5yZWZzLnNlbGVjdGVkUGxhY2UpIHtcbiAgICAgIHZhciBwbGFjZXNFbGVtZW50ID0gdGhpcy5yZWZzLnBsYWNlcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgc2VsZWN0ZWRFbGVtZW50ID0gdGhpcy5yZWZzLnNlbGVjdGVkUGxhY2UuZ2V0RE9NTm9kZSgpO1xuICAgICAgcGxhY2VzRWxlbWVudC5zY3JvbGxUb3AgPSBmaW5kUG9zKHNlbGVjdGVkRWxlbWVudCkgLSAyMDA7XG4gICAgfVxuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hlY2tOZXdQbGFjZXMoKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleXByZXNzKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlwcmVzcyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jaGVja05ld1BsYWNlcygpO1xuICAgIHRoaXMuYWRqdXN0U2Nyb2xsKCk7XG4gIH0sXG5cbiAgZmlsdGVyUGxhY2VzQnlUeXBlOiBmdW5jdGlvbiAocGxhY2VzICwgdHlwZXMpIHtcbiAgICBpZiAodHlwZXMpIHtcbiAgICAgIHJldHVybiBwbGFjZXMuZmlsdGVyKGZ1bmN0aW9uKHBsYWNlKSAge1xuICAgICAgICByZXR1cm4gdHlwZXMuaW5kZXhPZihwbGFjZS5nZXRUeXBlSWQoKSkgIT0gLTE7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBsYWNlcztcbiAgICB9XG4gIH0sXG5cbiAgLy9UT0RPIHJlZmFjdG9yZSAtIG5lYXJieSBzaG91bGQgYmUgc2VwYXJhdGUgZnJvbSB0ZXh0XG4gIHNldFNlYXJjaDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBwbGFjZVNlYXJjaCA9IHRoaXMubWFrZVNlYXJjaFBhcmFtcygpO1xuICAgIHZhciBwbGFjZXNBUEkgPSBuZXcgUGxhY2VzQVBJKHtsYW5nOiBPcHRpb25zU3RvcmUuZGF0YS5sYW5ndWFnZX0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgIHNlYXJjaFRleHQ6IHBsYWNlU2VhcmNoXG4gICAgfSk7XG4gICAgdmFyIGNhbGxGdW5jUGFyYW07XG5cbiAgICBjYWxsRnVuY1BhcmFtID0gcGxhY2VzQVBJLmZpbmRQbGFjZXMocGxhY2VTZWFyY2gpO1xuXG4gICAgY2FsbEZ1bmNQYXJhbS50aGVuKGZ1bmN0aW9uKHBsYWNlcykgIHtcbiAgICAgIGlmIChwbGFjZVNlYXJjaCAhPSB0aGlzLnN0YXRlLnNlYXJjaFRleHQgfHwgIXRoaXMuaXNNb3VudGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGxhY2VzID0gdGhpcy5maWx0ZXJQbGFjZXNCeVR5cGUocGxhY2VzLCB0aGlzLnByb3BzLnR5cGVzKTtcblxuICAgICAgaWYgKHBsYWNlU2VhcmNoLnR5cGVJRCA9PT0gUGxhY2UuVFlQRV9DT1VOVFJZKSB7XG4gICAgICAgIHBsYWNlcyA9IHBsYWNlcy5jb25jYXQoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpICB7IC8vLmNvbmNhdCgpIGlzIGhlcmUgdG8gbWFrZSBjb3B5IG9mIGFycmF5XG4gICAgICAgICAgcmV0dXJuIChiLnZhbHVlIDwgYS52YWx1ZSk/IDEgOiAtMVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsYWNlcyA9IHBsYWNlcy5zbGljZSgwLDUwKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHBsYWNlczogcGxhY2VzLFxuICAgICAgICBhcGlFcnJvcjogZmFsc2UsXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSAge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgcGxhY2VzOiBbXSxcbiAgICAgICAgYXBpRXJyb3I6IHRydWUsXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlXG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHNlbGVjdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdCggbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiB2YWx1ZX0pICk7XG4gIH0sXG5cbiAgbW92ZU5leHQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QobnVsbCwgXCJuZXh0XCIpO1xuICB9LFxuXG4gIGdldFNlYXJjaFRleHQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWFyY2gubW9kZSA9PSBcInRleHRcIiAmJiAhdGhpcy5wcm9wcy5zZWFyY2guaXNEZWZhdWx0KSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5zZWFyY2guZ2V0VGV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gIH0sXG5cbiAgbWFrZVNlYXJjaFBhcmFtczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICBpZiAodGhpcy5wcm9wcy5uZWFyYnkpIHtcbiAgICAgIHBhcmFtcy5ib3VuZHMgPSBHZW9sb2NhdGlvbi5nZXRDdXJyZW50Qm91bmRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmFtcy50ZXJtID0gdGhpcy5nZXRTZWFyY2hUZXh0KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLnR5cGVzICYmIHRoaXMucHJvcHMudHlwZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHBhcmFtcy50eXBlSUQgPSB0aGlzLnByb3BzLnR5cGVzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9LFxuXG4gIGNoZWNrTmV3UGxhY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlYXJjaFRleHQgPSB0aGlzLmdldFNlYXJjaFRleHQoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5sYXN0U2VhcmNoICE9PSBzZWFyY2hUZXh0IHx8IHRoaXMuc3RhdGUubGFzdFR5cGVzICE9IHRoaXMucHJvcHMudHlwZXMgfHwgdGhpcy5zdGF0ZS5sYXN0TmVhcmJ5ICE9IHRoaXMucHJvcHMubmVhcmJ5KSB7XG4gICAgICB0aGlzLnNldFNlYXJjaCgpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxhc3RTZWFyY2g6IHNlYXJjaFRleHQsXG4gICAgICAgIGxhc3RUeXBlczogdGhpcy5wcm9wcy50eXBlcyxcbiAgICAgICAgbGFzdE5lYXJieTogdGhpcy5wcm9wcy5uZWFyYnksXG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IC0xXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cblxuICByZW5kZXJQbGFjZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGxhY2VzID0gdGhpcy5zdGF0ZS5wbGFjZXM7XG4gICAgdmFyIHNlbGVjdGVkID0gcGxhY2VzW3RoaXMuc3RhdGUua2V5U2VsZWN0ZWRJbmRleF07XG4gICAgcmV0dXJuIHBsYWNlcy5tYXAoZnVuY3Rpb24ocGxhY2UpICB7XG4gICAgICBpZiAoc2VsZWN0ZWQgPT0gcGxhY2UpIHtcbiAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlUm93LCB7cmVmOiBcInNlbGVjdGVkUGxhY2VcIiwgc2VsZWN0ZWQ6IHNlbGVjdGVkID09IHBsYWNlLCBvblNlbGVjdDogdGhpcy5zZWxlY3QsIHBsYWNlOiBwbGFjZX0pKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlUm93LCB7b25TZWxlY3Q6IHRoaXMuc2VsZWN0LCBwbGFjZTogcGxhY2V9KSlcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBsb2FkZXJDbGFzcyA9IFwibG9hZGVyIFwiICsgKHRoaXMuc3RhdGUubG9hZGluZyA/IFwibG9hZGluZ1wiIDogXCJub3QtbG9hZGluZ1wiKTtcbiAgICB2YXIgbm9SZXN1bHRzQ2xhc3MgPSBcIm5vLXJlc3VsdHNcIjtcbiAgICBpZiAoIXRoaXMuc3RhdGUubG9hZGluZyAmJiB0aGlzLnN0YXRlLnBsYWNlcy5sZW5ndGggPT0gMCkge1xuICAgICAgbm9SZXN1bHRzQ2xhc3MgKz0gXCIgc2hvd25cIlxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBsb2FkZXJDbGFzc30sIFwiTG9hZGluZy4uLlwiKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogbm9SZXN1bHRzQ2xhc3N9LCBcIk5vIHJlc3VsdHNcIiksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwicGxhY2VzXCIsIGNsYXNzTmFtZTogXCJwbGFjZXNcIn0sIFxuICAgICAgICAgIHRoaXMucmVuZGVyUGxhY2VzKClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlcztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgRGF0ZVBpY2tlck1vZGFsID0gcmVxdWlyZSgnLi8uLi9EYXRlUGlja2VyL0RhdGVQaWNrZXJNb2RhbC5qc3gnKTtcbnZhciBQbGFjZVBpY2tlck1vZGFsID0gcmVxdWlyZSgnLi8uLi9QbGFjZVBpY2tlci9QbGFjZVBpY2tlck1vZGFsLmpzeCcpO1xuXG5cbnZhciBTZWFyY2hGb3JtU3RvcmUgPSByZXF1aXJlKCcuLy4uLy4uL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4Jyk7XG5cbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4Jyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uLy4uL3Rvb2xzL3RyLmpzJyk7XG52YXIgVHJhbiA9IHJlcXVpcmUoJy4vLi4vLi4vY29tcG9uZW50cy9UcmFuLmpzeCcpO1xudmFyIFRvZ2dsZUFjdGl2ZSA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9Ub2dnbGVBY3RpdmUuanN4Jyk7XG52YXIgUGFzc2VuZ2Vyc0ZpZWxkID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1Bhc3NlbmdlcnNGaWVsZC5qc3gnKTtcblxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcblxudmFyIG9wdGlvbnMgPSB7XG4gIG9yaWdpbjoge1xuICAgIG1vZGVzOiB7XG4gICAgICBhbGw6IHRydWUsXG4gICAgICBuZWFyYnk6IHRydWUsXG4gICAgICBjaGVhcGVzdDogZmFsc2UsXG4gICAgICBjaXRpZXNBbmRBaXJwb3J0czogZmFsc2UsXG4gICAgICBjb3VudHJpZXM6IHRydWUsXG4gICAgICBhbnl3aGVyZTogZmFsc2UsXG4gICAgICByYWRpdXM6IHRydWVcbiAgICB9XG4gIH0sXG4gIGRlc3RpbmF0aW9uOiB7XG4gICAgbW9kZXM6IHtcbiAgICAgIGFsbDogdHJ1ZSxcbiAgICAgIG5lYXJieTogZmFsc2UsXG4gICAgICBjaGVhcGVzdDogZmFsc2UsXG4gICAgICBjaXRpZXNBbmRBaXJwb3J0czogZmFsc2UsXG4gICAgICBjb3VudHJpZXM6IHRydWUsXG4gICAgICBhbnl3aGVyZTogdHJ1ZSxcbiAgICAgIHJhZGl1czogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgZGF0ZUZyb206IHtcbiAgICBtb2Rlczoge1xuICAgICAgc2luZ2xlOiB0cnVlLFxuICAgICAgaW50ZXJ2YWw6IHRydWUsXG4gICAgICBtb250aDogdHJ1ZSxcbiAgICAgIHRpbWVUb1N0YXk6IGZhbHNlLFxuICAgICAgYW55dGltZTogdHJ1ZSxcbiAgICAgIG5vUmV0dXJuOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgZGF0ZVRvOiB7XG4gICAgbW9kZXM6IHtcbiAgICAgIHNpbmdsZTogdHJ1ZSxcbiAgICAgIGludGVydmFsOiB0cnVlLFxuICAgICAgbW9udGg6IHRydWUsXG4gICAgICB0aW1lVG9TdGF5OiB0cnVlLFxuICAgICAgYW55dGltZTogdHJ1ZSxcbiAgICAgIG5vUmV0dXJuOiB0cnVlXG4gICAgfVxuICB9XG59O1xuXG5cbnZhciBTZWFyY2hGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlNlYXJjaEZvcm1cIixcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhY3RpdmU6ICh0eXBlb2YgdGhpcy5wcm9wcy5kZWZhdWx0QWN0aXZlID09IFwidW5kZWZpbmVkXCIpPyBcIm9yaWdpblwiIDogdGhpcy5wcm9wcy5kZWZhdWx0QWN0aXZlLFxuICAgICAgZGF0YTogU2VhcmNoRm9ybVN0b3JlLmRhdGFcbiAgICB9O1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXG4gIH0sXG4gIGNyZWF0ZU1vZGFsQ29udGFpbmVyOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ21vZGFsLWNvbnRhaW5lci1lbGVtZW50Jyk7XG4gICAgLy9XSEVSRSBUTyBBUFBFTkQgSVQ/XG4gICAgdGhpcy5yZWZzW2ZpZWxkTmFtZStcIk91dGVyXCJdLmdldERPTU5vZGUoKS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIHJldHVybiBkaXY7XG4gIH0sXG5cbiAgY2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRhdGE6IFNlYXJjaEZvcm1TdG9yZS5kYXRhXG4gICAgfSlcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIFNlYXJjaEZvcm1TdG9yZS5ldmVudHMub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlTGlzdGVuZXIpO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIFNlYXJjaEZvcm1TdG9yZS5ldmVudHMucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlTGlzdGVuZXIpO1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIChwcmV2UHJvcHMsIHByZXZTdGF0ZSkge1xuICAgIHRoaXMucmVmcmVzaEZvY3VzKCk7XG5cbiAgICAvL0NvbXBsZXRlIHByZXZpb3VzIGZpZWxkXG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlICE9IHByZXZTdGF0ZS5hY3RpdmUpIHtcbiAgICAgIGlmIChwcmV2U3RhdGUuYWN0aXZlID09IFwib3JpZ2luXCIgfHwgcHJldlN0YXRlLmFjdGl2ZSA9PSBcImRlc3RpbmF0aW9uXCIpIHtcbiAgICAgICAgU2VhcmNoRm9ybVN0b3JlLmNvbXBsZXRlRmllbGQocHJldlN0YXRlLmFjdGl2ZSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGdldEZvcm1hdHRlZFZhbHVlOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS5kYXRhW2ZpZWxkTmFtZV07XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKGZpZWxkTmFtZSA9PSBcIm9yaWdpblwiIHx8IGZpZWxkTmFtZSA9PSBcImRlc3RpbmF0aW9uXCIpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5nZXRUZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWx1ZS5mb3JtYXQoKTtcbiAgICB9XG4gIH0sXG5cbiAgbmV4dEZpZWxkOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgb3JkZXIgPSBbXG4gICAgICBcIm9yaWdpblwiLFxuICAgICAgXCJkZXN0aW5hdGlvblwiLFxuICAgICAgXCJkYXRlRnJvbVwiLFxuICAgICAgXCJkYXRlVG9cIixcbiAgICAgIFwic3VibWl0QnV0dG9uXCJcbiAgICBdO1xuICAgIHZhciBuZXdBY3RpdmU7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICB2YXIgaW5kZXggPSBvcmRlci5pbmRleE9mKHRoaXMuc3RhdGUuYWN0aXZlKTtcbiAgICAgIHZhciBuZXdJbmRleDtcbiAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IDMpIHtcbiAgICAgICAgbmV3QWN0aXZlID0gb3JkZXJbaW5kZXgrMV07XG4gICAgICB9IGVsc2UgaWYgKGluZGV4ID09IDQpIHtcbiAgICAgICAgLy9UT0RPIGZvY3VzIG9uIHNlYXJjaCBidG5cbiAgICAgICAgbmV3QWN0aXZlID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0FjdGl2ZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld0FjdGl2ZSA9IFwib3JpZ2luXCI7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWN0aXZlOiBuZXdBY3RpdmVcbiAgICB9KTtcbiAgfSxcbiAgY2hhbmdlVmFsdWVGdW5jOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBjaGFuZ2VUeXBlKSAge1xuICAgICAgaWYgKGNoYW5nZVR5cGUgPT0gXCJjaGFuZ2VNb2RlXCIpIHtcbiAgICAgICAgLy90aGlzLnJlZnNbZmllbGROYW1lXS5nZXRET01Ob2RlKCkuZm9jdXMoKTtcbiAgICAgICAgLy9UT0RPIHJldHVybiBoZXJlPz8/XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlVHlwZSA9PSBcInNlbGVjdFwiKSB7XG4gICAgICAgIHRoaXMubmV4dEZpZWxkKCk7XG4gICAgICB9IGVsc2UgaWYgKGNoYW5nZVR5cGUgPT0gXCJzZWxlY3RSYWRpdXNcIikge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBhY3RpdmU6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBTZWFyY2hGb3JtU3RvcmUuc2V0VmFsdWUodGhpcy5zdGF0ZS5kYXRhLmNoYW5nZUZpZWxkKGZpZWxkTmFtZSwgdmFsdWUpLCBjaGFuZ2VUeXBlKTtcblxuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIG9uRm9jdXNGdW5jOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhY3RpdmU6IGZpZWxkTmFtZVxuICAgICAgfSk7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLmRhdGFbZmllbGROYW1lXTtcbiAgICAgIGlmICh2YWx1ZS5tb2RlICE9IFwidGV4dFwiIHx8IHZhbHVlLmlzRGVmYXVsdCkge1xuICAgICAgICB0aGlzLnJlZnNbZmllbGROYW1lXS5nZXRET01Ob2RlKCkuc2VsZWN0KCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpXG4gIH0sXG5cbiAgY2hhbmdlVGV4dEZ1bmM6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcbiAgICBpZiAoZmllbGROYW1lID09IFwib3JpZ2luXCIgfHwgZmllbGROYW1lID09IFwiZGVzdGluYXRpb25cIikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpICB7XG4gICAgICAgIHZhciBhZGRTdGF0ZSA9IHt9O1xuICAgICAgICBTZWFyY2hGb3JtU3RvcmUuc2V0VmFsdWUodGhpcy5zdGF0ZS5kYXRhLmNoYW5nZUZpZWxkKGZpZWxkTmFtZSwgbmV3IFNlYXJjaFBsYWNlKGUudGFyZ2V0LnZhbHVlKSksIFwiY2hhbmdlVGV4dFwiKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShhZGRTdGF0ZSk7XG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHt9O1xuICAgIH1cbiAgfSxcblxuICBjaGFuZ2VQYXNzZW5nZXJzOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgbnVtYmVyID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIFNlYXJjaEZvcm1TdG9yZS5zZXRGaWVsZChcInBhc3NlbmdlcnNcIiwgbnVtYmVyLCBcInNlbGVjdFwiKTtcbiAgfSxcblxuICB0b2dnbGVBY3RpdmU6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIGlmICh0eXBlID09IHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogXCJcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub25Gb2N1c0Z1bmModHlwZSkoKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcylcbiAgfSxcbiAgb25DbGlja0lubmVyOiBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgb25JbnB1dEtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUua2V5ID09IFwiQXJyb3dVcFwiIHx8IGUua2V5ID09IFwiQXJyb3dEb3duXCIgIHx8IGUua2V5ID09IFwiRW50ZXJcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfSxcblxuICByZWZyZXNoRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9tTm9kZTtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUpIHtcbiAgICAgIGRvbU5vZGUgPSB0aGlzLnJlZnNbdGhpcy5zdGF0ZS5hY3RpdmVdLmdldERPTU5vZGUoKTtcbiAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9IGRvbU5vZGUpIHtcbiAgICAgICAgZG9tTm9kZS5mb2N1cygpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUgIT0gXCJzdWJtaXRCdXR0b25cIikge1xuICAgICAgICAgIHZhciBhY3RpdmVWYWx1ZSA9IHRoaXMuc3RhdGUuZGF0YVt0aGlzLnN0YXRlLmFjdGl2ZV07XG4gICAgICAgICAgaWYgKGFjdGl2ZVZhbHVlLm1vZGUgIT0gXCJ0ZXh0XCIgfHwgYWN0aXZlVmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICBkb21Ob2RlLnNlbGVjdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzZWFyY2g6IGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFNlYXJjaEZvcm1TdG9yZS5zZWFyY2goKTtcbiAgfSxcblxuICBnZXRGaWVsZExhYmVsOiBmdW5jdGlvbiAobW9kZSkge1xuICAgIHZhciBtb2RlTGFiZWxzID0ge1xuICAgICAgb3JpZ2luOiB0cihcIkZyb21cIixcImZyb21cIiksXG4gICAgICBkZXN0aW5hdGlvbjogdHIoXCJUb1wiLFwidG9cIiksXG4gICAgICBkYXRlRnJvbTogdHIoXCJEZXBhcnRcIixcImRhdGVcIiksXG4gICAgICBkYXRlVG86IHRyKFwiUmV0dXJuXCIsXCJyZXR1cm5cIilcbiAgICB9O1xuICAgIHJldHVybiBtb2RlTGFiZWxzW21vZGVdO1xuICB9LFxuXG4gIHJlbmRlck1vZGFsOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG5cbiAgICB2YXIgWFBpY2tlck1vZGFsO1xuICAgIGlmIChmaWVsZE5hbWUgPT0gXCJvcmlnaW5cIiB8fCBmaWVsZE5hbWUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XG4gICAgICBYUGlja2VyTW9kYWwgPSBQbGFjZVBpY2tlck1vZGFsO1xuICAgIH0gZWxzZSB7XG4gICAgICBYUGlja2VyTW9kYWwgPSBEYXRlUGlja2VyTW9kYWw7XG4gICAgfVxuICAgIHZhciBvbkhpZGUgPSBmdW5jdGlvbigpICB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUgPT0gZmllbGROYW1lKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogXCJcIlxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcbiAgICB2YXIgaW5wdXRFbGVtZW50ID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZWZzW2ZpZWxkTmFtZSArIFwiT3V0ZXJcIl0pIHtcbiAgICAgIGlucHV0RWxlbWVudCA9IHRoaXMucmVmc1tmaWVsZE5hbWUgKyBcIk91dGVyXCJdLmdldERPTU5vZGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFhQaWNrZXJNb2RhbCwge1xuICAgICAgaW5wdXRFbGVtZW50OiBpbnB1dEVsZW1lbnQsIFxuICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuZGF0YVtmaWVsZE5hbWVdLCBcbiAgICAgIG9uSGlkZTogb25IaWRlLCBcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZVZhbHVlRnVuYyhmaWVsZE5hbWUpLCBcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNbZmllbGROYW1lXSwgXG4gICAgICBzaG93bjogZmllbGROYW1lID09IHRoaXMuc3RhdGUuYWN0aXZlfVxuICAgICkpXG5cbiAgfSxcbiAgcmVuZGVySW5wdXQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gdHlwZTtcbiAgICBpZiAodGhpcy5zdGF0ZS5kYXRhW3R5cGVdLmVycm9yKSB7XG4gICAgICBjbGFzc05hbWUgKz0gXCIgZXJyb3JcIlxuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS5kYXRhW3R5cGVdLmxvYWRpbmcpIHtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBsb2FkaW5nXCJcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJmaWVsZHNldFwiLCB7XG4gICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBcbiAgICAgICAgcmVmOiB0eXBlICsgXCJPdXRlclwiXG5cbiAgICAgIH0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IHR5cGUgKyBcIkhlYWRcIiwgY2xhc3NOYW1lOiBcImhlYWRcIn0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7b25DbGljazogdGhpcy50b2dnbGVBY3RpdmUodHlwZSl9LCB0aGlzLmdldEZpZWxkTGFiZWwodHlwZSkpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImlucHV0LXdyYXBwZXJcIn0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcbiAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuZ2V0Rm9ybWF0dGVkVmFsdWUodHlwZSksIFxuICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLm9uQ2xpY2tJbm5lciwgXG4gICAgICAgICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0Z1bmModHlwZSksIFxuICAgICAgICAgICAgICBvbktleURvd246IHRoaXMub25JbnB1dEtleURvd24sIFxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIiwgXG4gICAgICAgICAgICAgIHJlZjogdHlwZSwgXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZVRleHRGdW5jKHR5cGUpLCBcbiAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiBcIm9mZlwiLCBcbiAgICAgICAgICAgICAgcmVhZE9ubHk6ICh0eXBlID09IFwiZGF0ZUZyb21cIiB8fCB0eXBlID09IFwiZGF0ZVRvXCIpfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtc3Bpbm5lclwifSksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVG9nZ2xlQWN0aXZlLCB7YWN0aXZlOiB0eXBlID09IHRoaXMuc3RhdGUuYWN0aXZlLCBvblRvZ2dsZTogdGhpcy50b2dnbGVBY3RpdmUodHlwZSl9KVxuICAgICAgICApLCBcbiAgICAgICAgdGhpcy5yZW5kZXJNb2RhbCh0eXBlKVxuICAgICAgKVxuICAgIClcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImZvcm1cIiwge2lkOiBcInNlYXJjaFwifSwgXG4gICAgICAgIHRoaXMucmVuZGVySW5wdXQoXCJvcmlnaW5cIiksIFxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwiZGVzdGluYXRpb25cIiksIFxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwiZGF0ZUZyb21cIiksIFxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwiZGF0ZVRvXCIpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChQYXNzZW5nZXJzRmllbGQsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VQYXNzZW5nZXJzLCB2YWx1ZTogdGhpcy5zdGF0ZS5kYXRhLnBhc3NlbmdlcnN9KSwgXG5cbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5zZWFyY2gsIGlkOiBcInNlYXJjaC1mbGlnaHRzXCIsIHJlZjogXCJzdWJtaXRCdXR0b25cIiwgY2xhc3NOYW1lOiBcImJ0bi1zZWFyY2hcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbiwge3RLZXk6IFwic2VhcmNoXCJ9LCBcIlNlYXJjaFwiKSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtc2VhcmNoXCJ9KSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hGb3JtO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBUcmFuc2xhdGUgPSByZXF1aXJlKCcuLy4uLy4uLy4uL2NvbXBvbmVudHMvVHJhbnNsYXRlLmpzeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6ZnVuY3Rpb24oKSB7XG4gICAgLy9UT0RPIGFkZCBhcnJvd1xuXG4gICAgLy92YXIgdG9nZ2xlID0gdGhpcy5yZWZzLnRvZ2dsZS5nZXRET01Ob2RlKCk7XG4gICAgLy92YXIgcGFzc2VuZ2VycyA9IHRoaXMucmVmcy5wYXNzZW5nZXJzLmdldERPTU5vZGUoKTtcbiAgICAvLyQodG9nZ2xlKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgLy8gICQocGFzc2VuZ2VycykuY2xpY2soKTtcbiAgICAvL30pO1xuICAgIC8vdG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgIC8vICBjb25zb2xlLmRlYnVnKFwiY2xpY2tcIik7XG4gICAgLy8gIHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KCdjbGljaycsIHtcbiAgICAvLyAgICAndmlldyc6IHdpbmRvdyxcbiAgICAvLyAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgLy8gICAgJ2NhbmNlbGFibGUnOiB0cnVlXG4gICAgLy8gIH0pO1xuICAgIC8vICBwYXNzZW5nZXJzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIC8vfSk7XG4gIH0sXG5cbiAgLy88YiByZWY9XCJ0b2dnbGVcIiBjbGFzc05hbWU9XCJ0b2dnbGVcIj5cbiAgLy8gIDxpIGNsYXNzTmFtZT1cImZhIGZhLWNhcmV0LWRvd25cIj48L2k+XG4gIC8vPC9iPlxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJmaWVsZHNldFwiLCB7cmVmOiBcInR5cGVQYXNzZW5nZXJzXCIsIGNsYXNzTmFtZTogXCJwYXNzZW5nZXJzXCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImhlYWRcIn0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCB7Zm9yOiBcInBhc3NlbmdlcnNcIn0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuc2xhdGUsIHt0S2V5OiBcImVtYWlscy5jb21tb24ucGFzc2VuZ2Vyc1wifSwgXCJQYXNzZW5nZXJzXCIpLCBcIjpcIiksIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJpY29uIGZhIGZhLXVzZXJcIn0pXG4gICAgICAgICAgKSwgXG5cbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicGFzc2VuZ2VyLXNlbGVjdC13cmFwcGVyXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIiwge25hbWU6IFwicGFzc2VuZ2Vyc1wiLCByZWY6IFwicGFzc2VuZ2Vyc1wiLCBvbkNoYW5nZTogdGhpcy5wcm9wcy5vbkNoYW5nZSwgdmFsdWU6IHRoaXMucHJvcHMudmFsdWV9LCBcbiAgICAgICAgICAgICAgWzEsMiwzLDQsNSw2LDcsOCw5XS5tYXAoZnVuY3Rpb24obnVtKSAge1xuICAgICAgICAgICAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiLCB7dmFsdWU6IG51bX0sIG51bSkpXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcblxyXG52YXIgVG9nZ2xlQWN0aXZlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRvZ2dsZUFjdGl2ZVwiLFxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZmFJY29uQ2xhc3MgPSBcImZhIGZhLWNhcmV0LWRvd25cIjtcclxuICAgIGlmICh0aGlzLnByb3BzLmFjdGl2ZSkge1xyXG4gICAgICBmYUljb25DbGFzcyA9IFwiZmEgZmEtY2FyZXQtdXBcIlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJcIiwge2NsYXNzTmFtZTogXCJ0b2dnbGVcIiwgb25DbGljazogdGhpcy5wcm9wcy5vblRvZ2dsZX0sIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IGZhSWNvbkNsYXNzfSlcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFRvZ2dsZUFjdGl2ZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgU2VhcmNoRm9ybSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9TZWFyY2hGb3JtL1NlYXJjaEZvcm0uanN4Jyk7XHJcblxyXG4vKipcclxuICogb3B0aW9ucy5lbGVtZW50IC0gZWxlbWVudCB0byBiaW5kIHdob2xlIHNlYXJjaCBmb3JtXHJcbiAqIG9wdGlvbnMuZGVmYXVsdEFjdGl2ZSAtIG1vZGUgd2hpY2ggd2lsbCBiZSBhY3RpdmF0ZWQgb24gaW5pdCBvZiBjb21wb25lbnQgLSBkZWZhdWx0OiBcIm9yaWdpblwiLCBzZXQgbnVsbCB0byBkb24ndCBzaG93IGFueVxyXG4gKi9cclxuXHJcbiAgZnVuY3Rpb24gU2VhcmNoRm9ybUFkYXB0ZXIob3B0aW9ucykge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHJvb3QgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFNlYXJjaEZvcm0pO1xyXG4gICAgdmFyIHJlYWN0RWxlbWVudCA9IHJvb3QoKTtcclxuICAgIHJlYWN0RWxlbWVudC5wcm9wcyA9IG9wdGlvbnM7XHJcbiAgICB0aGlzLm1vZGFsQ29tcG9uZW50ID0gUmVhY3QucmVuZGVyKHJlYWN0RWxlbWVudCwgb3B0aW9ucy5lbGVtZW50KTtcclxuICB9XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hGb3JtQWRhcHRlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgTWFwUGxhY2VzU3RvcmUgPSByZXF1aXJlKCcuL01hcFBsYWNlc1N0b3JlLmpzeCcpO1xudmFyIE1hcExhYmVsID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL01hcExhYmVsLmpzeCcpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBRdWFkdHJlZSA9IHJlcXVpcmUoJy4vLi4vdG9vbHMvcXVhZHRyZWUuanMnKTtcbnZhciBJbW11dGFibGUgPSByZXF1aXJlKCdpbW11dGFibGUnKTtcblxuZnVuY3Rpb24gaXNDb2xsaWRlKGEsIGIpIHtcbiAgcmV0dXJuICEoXG4gICgoYS55ICsgYS5oKSA8IChiLnkpKSB8fFxuICAoYS55ID4gKGIueSArIGIuaCkpIHx8XG4gICgoYS54ICsgYS53KSA8IGIueCkgfHxcbiAgKGEueCA+IChiLnggKyBiLncpKVxuICApO1xufVxuXG5cbiAgZnVuY3Rpb24gTWFwTGFiZWxzU3RvcmUoKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICB0aGlzLmxhYmVsc0JvdW5kc1RyZWUgPSBRdWFkdHJlZS5pbml0KHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgdzogNTAwMCwgLy9iaWcgZW5vdWdoIHNjcmVlbiBzaXplXG4gICAgICBoOiA1MDAwLFxuICAgICAgbWF4RGVwdGggOiAyMFxuICAgIH0pO1xuXG4gICAgdGhpcy5sYWJlbHNJbmRleCA9IEltbXV0YWJsZS5NYXAoe30pO1xuXG4gICAgTWFwUGxhY2VzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMucmVmcmVzaExhYmVscygpO1xuICAgIH0uYmluZCh0aGlzKSlcbiAgfVxuXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5zZXRMYWJlbE92ZXI9ZnVuY3Rpb24obGFiZWwpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLmhvdmVyTGFiZWwgPSBsYWJlbC5lZGl0KHtob3ZlcjogdHJ1ZX0pO1xuICAgIHRoaXMubGFiZWxzSW5kZXggPSB0aGlzLmxhYmVsc0luZGV4LnNldChsYWJlbC5nZXRJZCgpLCB0aGlzLmhvdmVyTGFiZWwpO1xuICAgIHRoaXMuZXZlbnRzLmVtaXQoXCJjaGFuZ2VcIik7XG4gIH07XG5cbiAgTWFwTGFiZWxzU3RvcmUucHJvdG90eXBlLnNldExhYmVsT3V0PWZ1bmN0aW9uKGxhYmVsKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5ob3ZlckxhYmVsID0gbnVsbDtcbiAgICB0aGlzLmxhYmVsc0luZGV4ID0gdGhpcy5sYWJlbHNJbmRleC5zZXQobGFiZWwuZ2V0SWQoKSwgbGFiZWwuZWRpdCh7aG92ZXI6IGZhbHNlfSkpO1xuICAgIHRoaXMuZXZlbnRzLmVtaXQoXCJjaGFuZ2VcIik7XG4gIH07XG5cbiAgTWFwTGFiZWxzU3RvcmUucHJvdG90eXBlLmNsZWFuPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMubGFiZWxzSW5kZXggPSBJbW11dGFibGUuTWFwKHt9KTtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KFwiY2hhbmdlXCIpO1xuICB9O1xuICAvKiBpdCBqdXN0IHJldHVybiBjcmVhdGVzIGFycmF5IG9mIGxhYmVscyAoY2FjaGVkKSAqL1xuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUuZ2V0TGFiZWxzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIGlmICh0aGlzLiRNYXBMYWJlbHNTdG9yZV9sYXN0TGFiZWxzSW5kZXhSZWZlcmVuY2UgIT0gdGhpcy5sYWJlbHNJbmRleCkge1xuICAgICAgdGhpcy4kTWFwTGFiZWxzU3RvcmVfbGFzdExhYmVsc0luZGV4UmVmZXJlbmNlID0gdGhpcy5sYWJlbHNJbmRleDtcbiAgICAgIHRoaXMuJE1hcExhYmVsc1N0b3JlX2xhYmVscyA9IHRoaXMubGFiZWxzSW5kZXgudG9BcnJheSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4kTWFwTGFiZWxzU3RvcmVfbGFiZWxzO1xuICB9O1xuICAvKipcbiAgICogbWluIG1heCBwcmljZSBmb3Igc2hvd24gcGxhY2VzIChsYWJlbHMpXG4gICAqIEBwYXJhbSBsYWJlbHNcbiAgICogQHJldHVybiB7e319XG4gICAqL1xuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUuZmluZFByaWNlU3RhdHNGb3JMYWJlbHM9ZnVuY3Rpb24obGFiZWxzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIGxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKGxhYmVsKSAge1xuICAgICAgdmFyIHByaWNlID0gbGFiZWwubWFwUGxhY2UucHJpY2U7XG4gICAgICBpZiAoIXJlcy5tYXhQcmljZSB8fCByZXMubWF4UHJpY2UgPCBwcmljZSkgcmVzLm1heFByaWNlID0gcHJpY2U7XG4gICAgICBpZiAoICghcmVzLm1pblByaWNlIHx8IHJlcy5taW5QcmljZSA+IHByaWNlKSAmJiBwcmljZSkgcmVzLm1pblByaWNlID0gcHJpY2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbiAgLyogIW11dGF0ZXMgbGFiZWxzICovXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5jYWxjdWxhdGVSZWxhdGl2ZVByaWNlc0ZvckxhYmVscz1mdW5jdGlvbihsYWJlbHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcHJpY2VTdGF0cyA9IHRoaXMuZmluZFByaWNlU3RhdHNGb3JMYWJlbHMobGFiZWxzKTtcbiAgICBsYWJlbHMuZm9yRWFjaChmdW5jdGlvbihsYWJlbCkgIHtcbiAgICAgIGlmIChsYWJlbC5tYXBQbGFjZS5wcmljZSAmJiBwcmljZVN0YXRzLm1pblByaWNlICYmIHByaWNlU3RhdHMubWF4UHJpY2UpIHtcbiAgICAgICAgbGFiZWwucmVsYXRpdmVQcmljZSA9IChsYWJlbC5tYXBQbGFjZS5wcmljZSAtIHByaWNlU3RhdHMubWluUHJpY2UpIC8gKHByaWNlU3RhdHMubWF4UHJpY2UgLSBwcmljZVN0YXRzLm1pblByaWNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgLy8gbXV0YXRlcyBtYXBQbGFjZXMgYXJyYXkhISEhXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5tYXBQbGFjZXNUb0xhYmVscz1mdW5jdGlvbihtYXBQbGFjZXMsIGZyb21MYXRMbmdUb0RpdlBpeGVsKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5sYWJlbHNCb3VuZHNUcmVlLmNsZWFyKCk7XG4gICAgaWYgKCFtYXBQbGFjZXMgfHwgbWFwUGxhY2VzLmxlbmd0aCA8PSAwKSByZXR1cm4gW107XG4gICAgbWFwUGxhY2VzLnNvcnQoZnVuY3Rpb24oYSxiKSAge1xuICAgICAgaWYgKGEuZmxhZyAmJiAhYi5mbGFnKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIGlmICghYS5mbGFnICYmIGIuZmxhZykge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKGEucHJpY2UgJiYgIWIucHJpY2UpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgaWYgKCFhLnByaWNlICYmIGIucHJpY2UpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBpZiAoYS5wcmljZSAmJiBiLnByaWNlKSB7XG4gICAgICAgIHJldHVybiAoYS5wbGFjZS5zcF9zY29yZSA8IGIucGxhY2Uuc3Bfc2NvcmUpPyAxIDogLTE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoYS5wbGFjZS5zcF9zY29yZSA8IGIucGxhY2Uuc3Bfc2NvcmUpPyAxIDogLTE7XG4gICAgfSk7XG4gICAgbWFwUGxhY2VzID0gbWFwUGxhY2VzLnNsaWNlKDAsNDAwKTtcbiAgICB2YXIgbGFiZWxzID0gW107XG5cblxuICAgIG1hcFBsYWNlcy5mb3JFYWNoKGZ1bmN0aW9uKG1hcFBsYWNlKSAge1xuICAgICAgdmFyIGxhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobWFwUGxhY2UucGxhY2UubGF0LCBtYXBQbGFjZS5wbGFjZS5sbmcpO1xuICAgICAgdmFyIHBvc2l0aW9uID0gZnJvbUxhdExuZ1RvRGl2UGl4ZWwobGF0TG5nKTtcblxuICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgIHg6IHBvc2l0aW9uLngsXG4gICAgICAgIHk6IHBvc2l0aW9uLnksXG4gICAgICAgIHc6IDcwLFxuICAgICAgICBoOiA0MFxuICAgICAgfTtcblxuICAgICAgdmFyIGNvbGxpc2lvbnMgPSAwO1xuICAgICAgdGhpcy5sYWJlbHNCb3VuZHNUcmVlLnJldHJpZXZlKGl0ZW0sIGZ1bmN0aW9uKGNoZWNraW5nSXRlbSkge1xuICAgICAgICBpZiAoaXNDb2xsaWRlKGl0ZW0sIGNoZWNraW5nSXRlbSkpIHtcbiAgICAgICAgICBjb2xsaXNpb25zICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2hvd0Z1bGxMYWJlbCA9IGZhbHNlO1xuICAgICAgaWYgKGNvbGxpc2lvbnMgPT0gMCkge1xuICAgICAgICBzaG93RnVsbExhYmVsID0gdHJ1ZTtcbiAgICAgICAgaXRlbS5tYXBQbGFjZSA9IG1hcFBsYWNlO1xuICAgICAgICB0aGlzLmxhYmVsc0JvdW5kc1RyZWUuaW5zZXJ0KGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGFiZWwgPSB7XG4gICAgICAgIG1hcFBsYWNlOiBtYXBQbGFjZSxcbiAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICBzaG93RnVsbExhYmVsOiBzaG93RnVsbExhYmVsXG4gICAgICB9O1xuICAgICAgbGFiZWxzLnB1c2gobGFiZWwpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGxhYmVscztcbiAgfTtcblxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUuYWN0dWFsaXplTGFiZWxzPWZ1bmN0aW9uKHBsYWluTGFiZWxzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHN0YXRzID0ge1xuICAgICAgbmV3TGFiZWxzOiAwLFxuICAgICAgcmVwbGFjZXNMYWJlbHM6IDAsXG4gICAgICBrZXB0TGFiZWxzOiAwXG4gICAgfTtcbiAgICB2YXIgbmV3SW5kZXggPSB7fTtcbiAgICBwbGFpbkxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKHBsYWluTGFiZWwpICB7XG4gICAgICB2YXIgaWQgPSBwbGFpbkxhYmVsLm1hcFBsYWNlLnBsYWNlLmlkO1xuICAgICAgdmFyIG9sZExhYmVsID0gdGhpcy5sYWJlbHNJbmRleC5nZXQoaWQpO1xuICAgICAgaWYgKG9sZExhYmVsKSB7XG4gICAgICAgIHZhciBuZXdMYWJlbCA9IG9sZExhYmVsLmVkaXQocGxhaW5MYWJlbCk7XG4gICAgICAgIGlmIChuZXdMYWJlbCAhPSBvbGRMYWJlbCkge1xuICAgICAgICAgIG5ld0luZGV4W2lkXSA9IG5ld0xhYmVsO1xuICAgICAgICAgIHN0YXRzLnJlcGxhY2VzTGFiZWxzKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3SW5kZXhbaWRdID0gb2xkTGFiZWw7XG4gICAgICAgICAgc3RhdHMua2VwdExhYmVscysrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdJbmRleFtpZF0gPSBuZXcgTWFwTGFiZWwocGxhaW5MYWJlbCk7XG4gICAgICAgIHN0YXRzLm5ld0xhYmVscysrO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgdGhpcy5sYWJlbHNJbmRleCA9IEltbXV0YWJsZS5NYXAobmV3SW5kZXgpO1xuICAgIC8vY29uc29sZS5sb2coXCJzdGF0czogXCIsIHN0YXRzKTtcbiAgfTtcblxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUucmVmcmVzaExhYmVscz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5sYXRMbmdCb3VuZHMgJiYgdGhpcy5mcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmMpIHtcbiAgICAgIHZhciBtYXBQbGFjZXMgPSBNYXBQbGFjZXNTdG9yZS5nZXRCeUJvdW5kcyh0aGlzLmxhdExuZ0JvdW5kcyk7XG4gICAgICB2YXIgcGxhaW5MYWJlbHMgPSB0aGlzLm1hcFBsYWNlc1RvTGFiZWxzKG1hcFBsYWNlcywgdGhpcy5mcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmMpO1xuICAgICAgdGhpcy5jYWxjdWxhdGVSZWxhdGl2ZVByaWNlc0ZvckxhYmVscyhwbGFpbkxhYmVscyk7XG4gICAgICB0aGlzLmFjdHVhbGl6ZUxhYmVscyhwbGFpbkxhYmVscyk7XG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KFwiY2hhbmdlXCIpO1xuICAgIH1cbiAgfTtcblxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUubGF0TG5nQm91bmRzRXF1YWw9ZnVuY3Rpb24ob2xkQm91bmRzLCBuZXdCb3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoIW9sZEJvdW5kcykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBvbGRCb3VuZHMud0xuZyA9PSBuZXdCb3VuZHMud0xuZyAmJiBvbGRCb3VuZHMuZUxuZyA9PSBuZXdCb3VuZHMuZUxuZyAmJiBvbGRCb3VuZHMuc0xhdCA9PSBuZXdCb3VuZHMuc0xhdCAmJiBvbGRCb3VuZHMubkxhdCA9PSBuZXdCb3VuZHMubkxhdDtcbiAgfTtcbiAgTWFwTGFiZWxzU3RvcmUucHJvdG90eXBlLnNldE1hcERhdGE9ZnVuY3Rpb24obGF0TG5nQm91bmRzLCBmcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoIXRoaXMubGF0TG5nQm91bmRzRXF1YWwodGhpcy5sYXRMbmdCb3VuZHMsIGxhdExuZ0JvdW5kcykpIHtcbiAgICAgIHRoaXMubGF0TG5nQm91bmRzID0gbGF0TG5nQm91bmRzO1xuICAgICAgdGhpcy5mcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmMgPSBmcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmM7XG4gICAgICB0aGlzLnJlZnJlc2hMYWJlbHMoKTtcbiAgICB9XG4gIH07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1hcExhYmVsc1N0b3JlKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBRdWFkdHJlZSA9IHJlcXVpcmUoJy4vLi4vdG9vbHMvcXVhZHRyZWUuanMnKTtcblxuZnVuY3Rpb24gYm91bmRzVG9TZWxlY3RvcihsYXRMbmdCb3VuZHMpIHtcbiAgdmFyIGJvdW5kcyA9IGxhdExuZ0JvdW5kcztcbiAgLy9pZiBtYXAgaGFzIDE4MGxuZyB2aWV3IHNjb3BlIHRoYW4gc2hvdyBvbmx5IHRoZSBiaWdnZXIgcGFydCBvZiBzaG93biBwbGFuZXRcbiAgaWYgKGJvdW5kcy5lTG5nIC0gYm91bmRzLndMbmcgPCAwKSB7XG4gICAgLy8gd2hhdCBpcyBtb3JlIGZhciBmcm9tIHplcm8sIGl0IGlzIHNtYWxsZXJcbiAgICBpZiAoTWF0aC5hYnMoYm91bmRzLmVMbmcpID4gTWF0aC5hYnMoYm91bmRzLndMbmcpKSB7XG4gICAgICBib3VuZHMuZUxuZyA9IDE4MDtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmRzLndMbmcgPSAtMTgwO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIHg6IGJvdW5kcy53TG5nICsgMTgwLFxuICAgIHk6IGJvdW5kcy5zTGF0ICsgOTAsXG4gICAgdzogYm91bmRzLmVMbmcgLSBib3VuZHMud0xuZyxcbiAgICBoOiBib3VuZHMubkxhdCAtIGJvdW5kcy5zTGF0XG4gIH07XG59XG5cblxuLyogc3RydWN0dXJlIHRvIHN0b3JlIG1hcFBsYWNlcyBhbmQgaW5kZXggdGhlbSBieSBpZCBhbmQgYnkgbGF0IGxuZyBwb3NpdGlvbiAqL1xuXG4gIGZ1bmN0aW9uIE1hcFBsYWNlc0luZGV4KCkge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMubWFwUGxhY2VzSW5kZXggPSB7fTtcbiAgICB0aGlzLnBvaW50c1RyZWUgPSBRdWFkdHJlZS5pbml0KHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgdzogMzYwLFxuICAgICAgaDogMTgwLFxuICAgICAgbWF4RGVwdGggOiAxMlxuICAgIH0pO1xuICB9XG5cbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmdldEJ5SWQ9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5tYXBQbGFjZXNJbmRleFtpZF0pIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcFBsYWNlc0luZGV4W2lkXS5tYXBQbGFjZTtcbiAgICB9XG4gIH07XG5cbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmdldEJ5Qm91bmRzPWZ1bmN0aW9uKGxhdExuZ0JvdW5kcykge1widXNlIHN0cmljdFwiO1xuICAgIHZhciB0cmVlU2VsZWN0b3IgPSBib3VuZHNUb1NlbGVjdG9yKGxhdExuZ0JvdW5kcyk7XG4gICAgdmFyIG1hcFBsYWNlcyA9IFtdO1xuICAgIHRoaXMucG9pbnRzVHJlZS5yZXRyaWV2ZSh0cmVlU2VsZWN0b3IsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIG1hcFBsYWNlcy5wdXNoKGl0ZW0ubWFwUGxhY2UpO1xuICAgIH0pO1xuICAgIHJldHVybiBtYXBQbGFjZXM7XG4gIH07XG5cbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmluc2VydFBsYWNlcz1mdW5jdGlvbihtYXBQbGFjZXMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBtYXBQbGFjZXMuZm9yRWFjaChmdW5jdGlvbihtYXBQbGFjZSkgIHtcbiAgICAgIHZhciBwbGFjZUNvbnRhaW5lciA9IHtcbiAgICAgICAgeDogbWFwUGxhY2UucGxhY2UubG5nICsgMTgwLFxuICAgICAgICB5OiBtYXBQbGFjZS5wbGFjZS5sYXQgKyA5MCxcbiAgICAgICAgdzogMC4wMDAwMSxcbiAgICAgICAgaDogMC4wMDAwMSxcbiAgICAgICAgbWFwUGxhY2U6IG1hcFBsYWNlXG4gICAgICB9O1xuICAgICAgdGhpcy5tYXBQbGFjZXNJbmRleFttYXBQbGFjZS5wbGFjZS5pZF0gPSBwbGFjZUNvbnRhaW5lcjtcbiAgICAgIHRoaXMucG9pbnRzVHJlZS5pbnNlcnQocGxhY2VDb250YWluZXIpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG5cbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmNsZWFuUHJpY2VzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5rZXlzKHRoaXMubWFwUGxhY2VzSW5kZXgpLmZvckVhY2goZnVuY3Rpb24oaWQpICB7XG4gICAgICB0aGlzLm1hcFBsYWNlc0luZGV4W2lkXS5tYXBQbGFjZSA9IHRoaXMubWFwUGxhY2VzSW5kZXhbaWRdLm1hcFBsYWNlLnNldChcInByaWNlXCIsIG51bGwpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH07XG4gIC8qKlxuICAgKiBFZGl0XG4gICAqIEBwYXJhbSBtYXBQbGFjZVxuICAgKi9cbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmVkaXRQbGFjZT1mdW5jdGlvbihtYXBQbGFjZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciByZWYgPSB0aGlzLm1hcFBsYWNlc0luZGV4W21hcFBsYWNlLnBsYWNlLmlkXTtcbiAgICByZWYueCA9IG1hcFBsYWNlLnBsYWNlLmxuZyArIDE4MDtcbiAgICByZWYueSA9IG1hcFBsYWNlLnBsYWNlLmxhdCArIDkwO1xuICAgIHJlZi5tYXBQbGFjZSA9IG1hcFBsYWNlO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwUGxhY2VzSW5kZXg7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XHJcbnZhciBNYXBQbGFjZXNJbmRleCA9IHJlcXVpcmUoJy4vTWFwUGxhY2VzSW5kZXguanN4Jyk7XHJcbnZhciBNYXBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9NYXBQbGFjZS5qc3gnKTtcclxudmFyIFNlYXJjaEZvcm1TdG9yZSAgPSByZXF1aXJlKCcuLy4uL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4Jyk7XHJcbnZhciBPcHRpb25zU3RvcmUgID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xyXG5cclxudmFyIFBsYWNlc0FQSSA9IHJlcXVpcmUoJy4vLi4vQVBJcy9QbGFjZXNBUEkuanN4Jyk7XHJcbnZhciBmbGlnaHRzQVBJID0gcmVxdWlyZSgnLi8uLi9BUElzL2ZsaWdodHNBUEkuanN4Jyk7XHJcbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9QbGFjZS5qc3gnKTtcclxuXHJcblxyXG5cclxuICBmdW5jdGlvbiBNYXBQbGFjZXNTdG9yZSgpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHRoaXMubWFwUGxhY2VzSW5kZXggPSBuZXcgTWFwUGxhY2VzSW5kZXgoKTtcclxuICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIFNlYXJjaEZvcm1TdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oY2hhbmdlVHlwZSkgIHtcclxuICAgICAgaWYgKGNoYW5nZVR5cGUgPT0gXCJzZWxlY3RcIiB8fCBjaGFuZ2VUeXBlID09IFwic2VsZWN0UmFkaXVzXCIpIHtcclxuICAgICAgICAvL2lmIHBsYWNlcyBhcmUgbm90IGxvYWRlZCwgaSBjYW4ndCBsb2FkIHByaWNlcywgc28gd2FpdCB1bnRpbCBpdCBpcyBsb2FkZWRcclxuICAgICAgICBpZiAodGhpcy5wbGFjZXNBcmVMb2FkaW5nKSB7XHJcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKFwid2FpdGluZyBmb3IgbG9hZCBwbGFjZXNcIik7XHJcbiAgICAgICAgICB0aGlzLnBsYWNlc0FyZUxvYWRpbmcudGhlbihmdW5jdGlvbigpICB7XHJcbiAgICAgICAgICAgIHRoaXMubG9hZFByaWNlcygpO1xyXG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmxvYWRQcmljZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ldmVudHMuZW1pdChcImNoYW5nZVwiKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5jb21wYXJlT3JpZ2lucz1mdW5jdGlvbihhLCBiKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBpZiAoYS5vcmlnaW4gJiYgYi5vcmlnaW4pIHtcclxuICAgICAgaWYgKGEub3JpZ2luLm1vZGUgPT0gXCJwbGFjZVwiICYmIGIub3JpZ2luLm1vZGUgPT0gXCJwbGFjZVwiKSAge1xyXG4gICAgICAgIHJldHVybiBhLm9yaWdpbi52YWx1ZS5pZCA9PSBiLm9yaWdpbi52YWx1ZS5pZDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gYS5vcmlnaW4gPT0gYi5vcmlnaW47XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qIGJvdGggbnVsbCA9PiB0cnVlLCBlbHNlID0+IGZhbHNlICovXHJcbiAgICAgIHJldHVybiAhYS5vcmlnaW4gJiYgIWIub3JpZ2luO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5jb21wYXJlSW1wb3J0YW50U2VhcmNoRm9ybURhdGE9ZnVuY3Rpb24oYSwgYikge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKGEgJiYgYikge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb21wYXJlT3JpZ2lucyhhLGIpICYmIGEuZGF0ZUZyb20gPT0gYi5kYXRlRnJvbSAmJiBhLmRhdGVUbyA9PSBiLmRhdGVUbyAmJiBhLnBhc3NlbmdlcnMgPT0gYi5wYXNzZW5nZXJzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKiBib3RoIG51bGwgPT4gdHJ1ZSwgZWxzZSA9PiBmYWxzZSAqL1xyXG4gICAgICByZXR1cm4gIWEgJiYgIWI7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5sb2FkUGxhY2VzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoe2xhbmc6IE9wdGlvbnNTdG9yZS5kYXRhLmxhbmd1YWdlfSk7XHJcbiAgICB0aGlzLnBsYWNlc0FyZUxvYWRpbmcgPSBwbGFjZXNBUEkuZmluZFBsYWNlcyh7dHlwZUlEOiBQbGFjZS5UWVBFX0NJVFl9KS50aGVuKGZ1bmN0aW9uKHBsYWNlcykgIHtcclxuICAgICAgdmFyIG1hcFBsYWNlcyA9IHBsYWNlcy5tYXAoZnVuY3Rpb24ocGxhY2UpICB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXBQbGFjZSh7cGxhY2U6IHBsYWNlfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLm1hcFBsYWNlc0luZGV4Lmluc2VydFBsYWNlcyhtYXBQbGFjZXMpO1xyXG4gICAgICB0aGlzLnBsYWNlc0FyZUxvYWRpbmcgPSBudWxsO1xyXG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KFwiY2hhbmdlXCIpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9O1xyXG5cclxuICBNYXBQbGFjZXNTdG9yZS5wcm90b3R5cGUubG9hZFByaWNlcz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIGlmICh0aGlzLmNvbXBhcmVJbXBvcnRhbnRTZWFyY2hGb3JtRGF0YSh0aGlzLmxhc3RTZWFyY2hGb3JtRGF0YSwgU2VhcmNoRm9ybVN0b3JlLmRhdGEpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMubGFzdFNlYXJjaEZvcm1EYXRhID0gU2VhcmNoRm9ybVN0b3JlLmRhdGE7XHJcbiAgICB2YXIgdGhpc1NlYXJjaEZvcm1EYXRhID0gU2VhcmNoRm9ybVN0b3JlLmRhdGE7XHJcblxyXG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMubWFwUGxhY2VzSW5kZXguY2xlYW5QcmljZXMoKTtcclxuICAgIGlmIChTZWFyY2hGb3JtU3RvcmUuZGF0YS5vcmlnaW4ubW9kZSA9PSBcInBsYWNlXCIgfHwgU2VhcmNoRm9ybVN0b3JlLmRhdGEub3JpZ2luLm1vZGUgPT0gXCJyYWRpdXNcIikge1xyXG4gICAgICBmbGlnaHRzQVBJLmZpbmRGbGlnaHRzKHtcclxuICAgICAgICBvcmlnaW46IFNlYXJjaEZvcm1TdG9yZS5kYXRhLm9yaWdpbixcclxuICAgICAgICBkZXN0aW5hdGlvbjogXCJhbnl3aGVyZVwiLFxyXG4gICAgICAgIG91dGJvdW5kRGF0ZTogU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGF0ZUZyb20sXHJcbiAgICAgICAgaW5ib3VuZERhdGU6IFNlYXJjaEZvcm1TdG9yZS5kYXRhLmRhdGVUbyxcclxuICAgICAgICBwYXNzZW5nZXJzOiBTZWFyY2hGb3JtU3RvcmUuZGF0YS5wYXNzZW5nZXJzXHJcbiAgICAgIH0sIHtmb3JtYXQ6IFwib3JpZ2luYWxcIn0pLnRoZW4oZnVuY3Rpb24oZmxpZ2h0cykgIHtcclxuICAgICAgICBpZiAoIXRoaXMuY29tcGFyZUltcG9ydGFudFNlYXJjaEZvcm1EYXRhKHRoaXNTZWFyY2hGb3JtRGF0YSwgU2VhcmNoRm9ybVN0b3JlLmRhdGEpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGZsaWdodHMuZm9yRWFjaChmdW5jdGlvbihmbGlnaHQpICB7XHJcbiAgICAgICAgICB2YXIgbWFwUGxhY2UgPSB0aGlzLm1hcFBsYWNlc0luZGV4LmdldEJ5SWQoZmxpZ2h0Lm1hcElkdG8pO1xyXG4gICAgICAgICAgaWYgKG1hcFBsYWNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFwUGxhY2VzSW5kZXguZWRpdFBsYWNlKG1hcFBsYWNlLmVkaXQoe1wicHJpY2VcIjpmbGlnaHQucHJpY2V9KSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmV2ZW50cy5lbWl0KFwiY2hhbmdlXCIpO1xyXG4gICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcclxuICAgICAgICAvL1RPRE8gbmljZXIgZXJyb3IgaGFuZGxpbmdcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5nZXRCeUJvdW5kcz1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLm1hcFBsYWNlc0luZGV4LmdldEJ5Qm91bmRzKGJvdW5kcykubWFwKGZ1bmN0aW9uKG1hcFBsYWNlKSAge1xyXG4gICAgICBpZiAoU2VhcmNoRm9ybVN0b3JlLmRhdGEub3JpZ2luLm1vZGUgPT0gXCJwbGFjZVwiICYmIG1hcFBsYWNlLnBsYWNlLmlkID09IFNlYXJjaEZvcm1TdG9yZS5kYXRhLm9yaWdpbi52YWx1ZS5pZCkge1xyXG4gICAgICAgIHJldHVybiBtYXBQbGFjZS5zZXQoXCJmbGFnXCIsXCJvcmlnaW5cIik7XHJcbiAgICAgIH0gZWxzZSBpZiAoU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGVzdGluYXRpb24ubW9kZSA9PSBcInBsYWNlXCIgJiYgbWFwUGxhY2UucGxhY2UuaWQgPT0gU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGVzdGluYXRpb24udmFsdWUuaWQpIHtcclxuICAgICAgICByZXR1cm4gbWFwUGxhY2Uuc2V0KFwiZmxhZ1wiLFwiZGVzdGluYXRpb25cIik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG1hcFBsYWNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTWFwUGxhY2VzU3RvcmUoKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIE9wdGlvbnMgPSByZXF1aXJlKCcuLy4uL2NvbnRhaW5lcnMvT3B0aW9ucy5qc3gnKTtcblxuXG4gIGZ1bmN0aW9uIE9wdGlvbnNTdG9yZSgpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIC8vTWF4aW11bSBvZiBsaXN0ZW5lcnMgLSBoZXJlIGxpc3RlbnMgZXZlcnkgdHJhbnNsYXRpb24gYW5kIGN1cnJlbmN5IHNvIHRoZXJlIGlzIGEgbG90IG9mIHRoZW0sIGJ1dCBpIGhvcGUgbm90IG1vcmUgdGhhbiAxMDAwXG4gICAgdGhpcy5ldmVudHMuc2V0TWF4TGlzdGVuZXJzKDEwMDApO1xuXG4gICAgdGhpcy5kYXRhID0gbmV3IE9wdGlvbnMoKTtcbiAgfVxuICBPcHRpb25zU3RvcmUucHJvdG90eXBlLnNldFZhbHVlPWZ1bmN0aW9uKHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5kYXRhICE9IHZhbHVlKSB7XG4gICAgICB0aGlzLmRhdGEgPSB2YWx1ZTtcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3Igc2V0XG4gICAqL1xuICBPcHRpb25zU3RvcmUucHJvdG90eXBlLnNldE9wdGlvbj1mdW5jdGlvbihrZXksIHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgb25lIHZhbHVlIHRvIGdpdmVuIGtleVxuICAgKiBAcGFyYW0ga2V5XG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcmV0dXJuIHsqfVxuICAgKi9cbiAgT3B0aW9uc1N0b3JlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMuZGF0YS5zZXQoa2V5LCB2YWx1ZSkpO1xuICB9O1xuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBPcHRpb25zU3RvcmUoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBTZWFyY2hGb3JtRGF0YSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hGb3JtRGF0YS5qc3gnKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9QbGFjZS5qc3gnKTtcbnZhciBRID0gKHdpbmRvdy5RKTtcbnZhciBQbGFjZXNBUEkgPSByZXF1aXJlKCcuLy4uL0FQSXMvUGxhY2VzQVBJQ2FjaGVkLmpzeCcpO1xudmFyIE9wdGlvbnNTdG9yZSA9IHJlcXVpcmUoJy4vT3B0aW9uc1N0b3JlLmpzeCcpO1xuXG5cblxuXG52YXIgZ2V0Rmlyc3RGcm9tQXBpID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgdmFyIHBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoe2xhbmc6IE9wdGlvbnNTdG9yZS5kYXRhLmxhbmd1YWdlfSk7Ly9UT0RPIHB1dCBoZXJlIG9wdGlvbnNcbiAgcmV0dXJuIHBsYWNlc0FQSS5maW5kQnlOYW1lKHRleHQpLnRoZW4oZnVuY3Rpb24ocGxhY2VzKSAge1xuICAgIGlmIChwbGFjZXNbMF0pIHtcbiAgICAgIHJldHVybiBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicGxhY2VcIiwgdmFsdWU6IG5ldyBQbGFjZShwbGFjZXNbMF0pfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwidGV4dFwiLCB2YWx1ZTogdGV4dCwgZXJyb3I6IFwibm90Rm91bmRcIn0pO1xuICAgIH1cbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSAge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgfSlcbn07XG5cbnZhciBmaW5kQnlJZEZyb21BcGkgPSBmdW5jdGlvbiAoaWQpIHtcbiAgdmFyIHBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoe2xhbmc6IE9wdGlvbnNTdG9yZS5kYXRhLmxhbmd1YWdlfSk7Ly9UT0RPIHB1dCBoZXJlIG9wdGlvbnNcbiAgcmV0dXJuIHBsYWNlc0FQSS5maW5kQnlJZChpZCkudGhlbihmdW5jdGlvbihwbGFjZSkgIHtcbiAgICBpZiAocGxhY2UpIHtcbiAgICAgIHJldHVybiBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicGxhY2VcIiwgdmFsdWU6IHBsYWNlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vc3dpdGNoIHRvIHRleHQgd2hlbiBpZCBub3QgZm91bmQ/P1xuICAgICAgcmV0dXJuIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJ0ZXh0XCIsIHZhbHVlOiBpZCwgZXJyb3I6IFwibm90Rm91bmRcIn0pO1xuICAgIH1cbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSAge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgfSlcbn07XG5cblxuLyogcmV0dXJucyBwcm9taXNlLCBwcm9taXNlIHJlc29sdmVzIHRydWUgaWYgdGhlcmUgaXMgbmV3IHZhbHVlICovXG52YXIgZmV0Y2hQbGFjZSA9IGZ1bmN0aW9uKHNlYXJjaFBsYWNlKSB7XG4gIGlmIChzZWFyY2hQbGFjZS5tb2RlID09IFwicGxhY2VcIiAmJiBzZWFyY2hQbGFjZS52YWx1ZS5jb21wbGV0ZSkge1xuICAgIHJldHVybiBmYWxzZTsgLyogZG9uJ3QgbmVlZCB0byBhc3luYyBsb2FkICovXG4gIH0gZWxzZSBpZiAoc2VhcmNoUGxhY2UubW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvbWlzZTogZmluZEJ5SWRGcm9tQXBpKHNlYXJjaFBsYWNlLnZhbHVlLmlkKS50aGVuKGZ1bmN0aW9uKG5ld1NlYXJjaFBsYWNlKSAge1xuICAgICAgICByZXR1cm4gbmV3U2VhcmNoUGxhY2Uuc2V0KFwiZm9ybU1vZGVcIiwgc2VhcmNoUGxhY2UuZm9ybU1vZGUpXG4gICAgICB9KSxcbiAgICAgIHRlbXBWYWx1ZTogc2VhcmNoUGxhY2Uuc2V0KFwibG9hZGluZ1wiLCB0cnVlKS8vbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiBzZWFyY2hQbGFjZS52YWx1ZSwgbG9hZGluZzogdHJ1ZX0pXG4gICAgfTtcbiAgfSBlbHNlIGlmIChzZWFyY2hQbGFjZS5tb2RlID09IFwidGV4dFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb21pc2U6IGdldEZpcnN0RnJvbUFwaShzZWFyY2hQbGFjZS52YWx1ZSkudGhlbihmdW5jdGlvbihuZXdTZWFyY2hQbGFjZSkgIHtcbiAgICAgICAgcmV0dXJuIG5ld1NlYXJjaFBsYWNlLnNldChcImZvcm1Nb2RlXCIsIHNlYXJjaFBsYWNlLmZvcm1Nb2RlKVxuICAgICAgfSksXG4gICAgICB0ZW1wVmFsdWU6IHNlYXJjaFBsYWNlLnNldChcImxvYWRpbmdcIiwgdHJ1ZSkvL25ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJ0ZXh0XCIsIHZhbHVlOiBzZWFyY2hQbGFjZS52YWx1ZSwgbG9hZGluZzogdHJ1ZX0pXG4gICAgfTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5cbiAgZnVuY3Rpb24gU2VhcmNoRm9ybVN0b3JlKCkge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuZGF0YSA9IG5ldyBTZWFyY2hGb3JtRGF0YSgpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gY2hhbmdlVHlwZSAtIHR5cGUgb2YgY2hhbmdlIC0gZGVmYXVsdCBpcyBcInNlbGVjdFwiIHdoaWNoIGlzIGFsc28gbW9zdCBjb21tb24gYW5kIGZvciBleGFtcGxlIHRyaWdnZXJzIHNlYXJjaCBvbiBtYXBcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuc2V0VmFsdWU9ZnVuY3Rpb24odmFsdWUsIGNoYW5nZVR5cGUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmRhdGEgIT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuZGF0YSA9IHZhbHVlO1xuICAgICAgdGhpcy5ldmVudHMuZW1pdCgnY2hhbmdlJyxjaGFuZ2VUeXBlKTsgLy8gY2hhbmdlIGlzIGFmdGVyIGFsbCBjaGFuZ2VzXG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH07XG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuc2V0RmllbGQ9ZnVuY3Rpb24oZmllbGROYW1lLCB2YWx1ZSwgY2hhbmdlVHlwZSkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMuZGF0YS5jaGFuZ2VGaWVsZChmaWVsZE5hbWUsIHZhbHVlKSwgY2hhbmdlVHlwZSk7XG4gIH07XG5cbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS5jb21wbGV0ZUZpZWxkPWZ1bmN0aW9uKGZpZWxkTmFtZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBmZXRjaEluZm8gPSBmZXRjaFBsYWNlKHRoaXMuZGF0YVtmaWVsZE5hbWVdKTtcbiAgICBpZiAoZmV0Y2hJbmZvKSB7XG4gICAgICB2YXIgJF9fMD0gICBmZXRjaEluZm8scHJvbWlzZT0kX18wLnByb21pc2UsdGVtcFZhbHVlPSRfXzAudGVtcFZhbHVlO1xuICAgICAgdGhpcy5zZXRGaWVsZChmaWVsZE5hbWUsIHRlbXBWYWx1ZSk7XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGZpbmFsVmFsdWUpICB7XG4gICAgICAgIC8qIG9ubHkgaWYgaXQncyBpcyBzdGlsbCBzYW1lIHZhbHVlIGFzIGJlZm9yZSwgbm90aGluZyBuZXcgKi9cbiAgICAgICAgaWYgKHRlbXBWYWx1ZSA9PSB0aGlzLmRhdGFbZmllbGROYW1lXSkge1xuICAgICAgICAgIHRoaXMuc2V0RmllbGQoZmllbGROYW1lLCBmaW5hbFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy9UT0RPIGRvbnQga25vdyB3aGF0IHRvIHJldHVybj8/P1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUudHJpZ2dlclNlYXJjaD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICAvL1RPRE8gY2hlY2sgaWYgdGhlcmUgaXMgZXZlcnkgZGF0YSBva1xuICAgIHRoaXMuZXZlbnRzLmVtaXQoJ3NlYXJjaCcpO1xuICB9O1xuICAvKiBmZXRjaCBkaXJlY3Rpb24gYW5kIHJldHVybiBkYXRhIHdpdGggdGVtcCB2YWx1ZSAqL1xuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLmZldGNoRGlyZWN0aW9uPWZ1bmN0aW9uKGRhdGEsIGRpcmVjdGlvbikge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBmZXRjaEluZm8gPSBmZXRjaFBsYWNlKGRhdGFbZGlyZWN0aW9uXSk7XG4gICAgaWYgKGZldGNoSW5mbykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvbWlzZTogZmV0Y2hJbmZvLnByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkgIHtcbiAgICAgICAgICByZXR1cm4ge2RpcmVjdGlvbjpkaXJlY3Rpb24sdmFsdWU6dmFsdWV9XG4gICAgICAgIH0pLFxuICAgICAgICBuZXdEYXRhOiBkYXRhLmNoYW5nZUZpZWxkKGRpcmVjdGlvbiwgZmV0Y2hJbmZvLnRlbXBWYWx1ZSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuc2VhcmNoPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgIHZhciBuZXdUZW1wRGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgb3JpZ2luTG9hZGluZ0luZm8gPSB0aGlzLmZldGNoRGlyZWN0aW9uKG5ld1RlbXBEYXRhLCBcIm9yaWdpblwiKTtcbiAgICBpZiAob3JpZ2luTG9hZGluZ0luZm8pIHtcbiAgICAgIHByb21pc2VzLnB1c2gob3JpZ2luTG9hZGluZ0luZm8ucHJvbWlzZSk7XG4gICAgICBuZXdUZW1wRGF0YSA9IG9yaWdpbkxvYWRpbmdJbmZvLm5ld0RhdGE7XG4gICAgfVxuICAgIHZhciBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvID0gdGhpcy5mZXRjaERpcmVjdGlvbihuZXdUZW1wRGF0YSwgXCJkZXN0aW5hdGlvblwiKTtcbiAgICBpZiAoZGVzdGluYXRpb25Mb2FkaW5nSW5mbykge1xuICAgICAgcHJvbWlzZXMucHVzaChkZXN0aW5hdGlvbkxvYWRpbmdJbmZvLnByb21pc2UpO1xuICAgICAgbmV3VGVtcERhdGEgPSBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvLm5ld0RhdGE7XG4gICAgfVxuICAgIC8qIGlmIGFueSBvZiB0aGVzZSBuZWVkcyBsb2FkaW5nIHNhdmUgdGVtcG9yYXJ5IG9iamVjdHMgKi9cbiAgICBpZiAobmV3VGVtcERhdGEgIT0gdGhpcy5kYXRhKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKG5ld1RlbXBEYXRhKTtcbiAgICB9XG5cblxuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgc2VhcmNoUHJvbWlzZSA9IFEuYWxsKHByb21pc2VzKTtcbiAgICAgIHRoaXMubGFzdFNlYXJjaFByb21pc2UgPSBzZWFyY2hQcm9taXNlO1xuICAgICAgcmV0dXJuIFEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpICB7XG4gICAgICAgIGlmIChzZWFyY2hQcm9taXNlICE9IHRoaXMubGFzdFNlYXJjaFByb21pc2UpIHJldHVybjsgLy9pZiBzb21lIG90aGVyIHNlYXJjaCBoYXMgb3V0cmFuIG1lXG4gICAgICAgIHZhciBuZXdEYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICByZXN1bHRzLmZvckVhY2goZnVuY3Rpb24ocmVzdWx0KSAge1xuICAgICAgICAgIG5ld0RhdGEgPSBuZXdEYXRhLmNoYW5nZUZpZWxkKHJlc3VsdC5kaXJlY3Rpb24sIHJlc3VsdC52YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFZhbHVlKG5ld0RhdGEpO1xuICAgICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vVE9ETyBjaGVjayBpZiBpcyBub3QgbmVlZGVkIG5leHQgdGlja1xuICAgICAgdGhpcy50cmlnZ2VyU2VhcmNoKCk7XG5cbiAgICAgIC8vVE9ETyByZXR1cm4gc29tZSBwcm9taXNlPz9cbiAgICB9XG5cbiAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2VhcmNoRm9ybVN0b3JlKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGZsaWdodHNBUEkgPSByZXF1aXJlKCcuLy4uL0FQSXMvRmxpZ2h0c0FQSS5qc3gnKTtcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuLy4uL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XG5cblxuICBmdW5jdGlvbiBBUElNYW5hZ2VyKCkge1widXNlIHN0cmljdFwiO1xuICAgIE9wdGlvbnNTdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSAge1xuICAgICAgZmxpZ2h0c0FQSS5jaGFuZ2VPcHRpb25zKHtsYW5ndWFnZTogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTtcbiAgICB9KVxuICB9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQVBJTWFuYWdlcigpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMudmFsaWRhdGUgPSBmdW5jdGlvbihvdXRib3VuZCwgaW5ib3VuZCkge1xuICBpZiAoIW91dGJvdW5kKSB7XG4gICAgcmV0dXJuIFwib3V0Ym91bmROb3RTZWxlY3RlZFwiXG4gIH1cbiAgaWYgKCFpbmJvdW5kKSB7XG4gICAgcmV0dXJuIFwiaW5ib3VuZE5vdFNlbGVjdGVkXCJcbiAgfVxuXG4gIGlmIChpbmJvdW5kLm1vZGUgPT0gXCJzaW5nbGVcIiAmJiBvdXRib3VuZC5tb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICBpZiAoaW5ib3VuZC5nZXREYXRlKCkuZm9ybWF0KFwiWVlZWU1NRERcIikgPCBvdXRib3VuZC5nZXREYXRlKCkuZm9ybWF0KFwiWVlZWU1NRERcIikpIHtcbiAgICAgIHJldHVybiBcImNyb3NzZWREYXRlc1wiXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICBUb29scyBmb3IgbWFuaXB1bGF0aW5nIHdpdGggZGF0ZXNcbiAgc29tZSBvZiB0aGVtIGFyZSBkdXBsaWNpdGllcyB0byBtb21lbnQncyBmdW5jdGlvbnMsIGJ1dCB0aGV5IGNhbiBiZSB1c2VkIGFzIGZhc3RlciBhbHRlcm5hdGl2ZXNcbiAqL1xuXG5cbnZhciBwYWQgPSBmdW5jdGlvbihudW0sIHNpemUpIHtcbiAgdmFyIHMgPSBudW0gKyBcIlwiO1xuICB3aGlsZSAocy5sZW5ndGggPCBzaXplKSB7XG4gICAgcyA9IFwiMFwiICsgcztcbiAgfVxuICByZXR1cm4gcztcbn07XG5cbnZhciBEYXRlVG9vbHMgPSB7XG4gIHRvZGF5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbiAgfSxcbiAgaW5IYWxmQW5ZZWFyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLnNldE1vbnRoKG5ldyBEYXRlKCkuZ2V0TW9udGgoKSArIDYpKTtcbiAgfSxcbiAgZmlyc3REYXk6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICB9LFxuICBsYXN0RGF5OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCk7XG4gIH0sXG4gIGZvcm1hdFNQQXBpRGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBwYWQoZGF0ZS5nZXREYXRlKCksIDIpICsgXCIvXCIgKyBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSwgMikgKyBcIi9cIiArIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgfSxcbiAgZm9ybWF0V0FEYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIFwiLVwiICsgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEsIDIpICsgXCItXCIgKyBwYWQoZGF0ZS5nZXREYXRlKCksIDIpO1xuICB9XG59O1xuXG5cbkRhdGVUb29scy5maXJzdERheU9mV2VlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbW9tZW50LmxvY2FsZURhdGEoKS5fd2Vlay5kb3c7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVUb29scztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIExhdExvbiA9IHJlcXVpcmUoJy4vbGF0bG9uLmpzJyk7XG52YXIgT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xuXG5cbnZhciBvcHRpb25zID0ge1xuICBlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlLFxuICB0aW1lb3V0OiA1MDAwLFxuICBtYXhpbXVtQWdlOiAwXG59O1xuXG5mdW5jdGlvbiBHZW9sb2NhdGlvbigpe1widXNlIHN0cmljdFwiO31cblxuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUuaW5pdEJyb3dzZXI9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9UT0RPIGZpbmlzaFxuICAgIC8vbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zKSB7XG4gICAgLy8gIHZhciBjcmQgPSBwb3MuY29vcmRzO1xuICAgIC8vICBjb25zb2xlLmxvZygnWW91ciBjdXJyZW50IHBvc2l0aW9uIGlzOicpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTGF0aXR1ZGUgOiAnICsgY3JkLmxhdGl0dWRlKTtcbiAgICAvLyAgY29uc29sZS5sb2coJ0xvbmdpdHVkZTogJyArIGNyZC5sb25naXR1ZGUpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTW9yZSBvciBsZXNzICcgKyBjcmQuYWNjdXJhY3kgKyAnIG1ldGVycy4nKTtcbiAgICAvL1xuICAgIC8vfSwgZnVuY3Rpb24gKCkge1xuICAgIC8vICBjb25zb2xlLndhcm4oJ0VSUk9SKCcgKyBlcnIuY29kZSArICcpOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgIC8vfSwgb3B0aW9ucylcbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21NYXA9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21Ccm93c2VyPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuXG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRGcm9tQ29kZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcblxuICB9O1xuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUucG9pbnRUb0JvdW5kcz1mdW5jdGlvbihsYXQsIGxvbikge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBkaXN0YW5jZSA9IDMwMDtcbiAgICB2YXIgbGwgPSBMYXRMb24obGF0LGxvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhdF9sbzogbGwuZGVzdGluYXRpb25Qb2ludCgxODAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfbG86IGxsLmRlc3RpbmF0aW9uUG9pbnQoLTkwLCBkaXN0YW5jZSkubG9uLFxuICAgICAgbGF0X2hpOiBsbC5kZXN0aW5hdGlvblBvaW50KDAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfaGk6IGxsLmRlc3RpbmF0aW9uUG9pbnQoOTAsIGRpc3RhbmNlKS5sb25cbiAgICB9XG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRDdXJyZW50Qm91bmRzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBjZW50ZXIgPSBPcHRpb25zU3RvcmUuZGF0YS5kZWZhdWx0TWFwQ2VudGVyO1xuICAgIGlmIChjZW50ZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50VG9Cb3VuZHMoY2VudGVyLmxhdCgpLGNlbnRlci5sbmcoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50VG9Cb3VuZHMoNTAsMTUpO1xuICAgIH1cbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHZW9sb2NhdGlvbigpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG4vKiAgR2VvZGVzeSByZXByZXNlbnRhdGlvbiBjb252ZXJzaW9uIGZ1bmN0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgKGMpIENocmlzIFZlbmVzcyAyMDAyLTIwMTQgICovXG4vKiAgIC0gd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL2xhdGxvbmcuaHRtbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlUIExpY2VuY2UgICovXG4vKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiAgU2FtcGxlIHVzYWdlOiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiAgICB2YXIgbGF0ID0gR2VvLnBhcnNlRE1TKCc1McKwIDI44oCyIDQwLjEy4oCzIE4nKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qICAgIHZhciBsb24gPSBHZW8ucGFyc2VETVMoJzAwMMKwIDAw4oCyIDA1LjMx4oCzIFcnKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogICAgdmFyIHAxID0gbmV3IExhdExvbihsYXQsIGxvbik7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuXG4vKiBqc2hpbnQgbm9kZTp0cnVlICovLyogZ2xvYmFsIGRlZmluZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5cbi8qKlxuICogVG9vbHMgZm9yIGNvbnZlcnRpbmcgYmV0d2VlbiBudW1lcmljIGRlZ3JlZXMgYW5kIGRlZ3JlZXMgLyBtaW51dGVzIC8gc2Vjb25kcy5cbiAqXG4gKiBAbmFtZXNwYWNlXG4gKi9cbnZhciBHZW8gPSB7fTtcblxuXG4vLyBub3RlIFVuaWNvZGUgRGVncmVlID0gVSswMEIwLiBQcmltZSA9IFUrMjAzMiwgRG91YmxlIHByaW1lID0gVSsyMDMzXG5cblxuLyoqXG4gKiBQYXJzZXMgc3RyaW5nIHJlcHJlc2VudGluZyBkZWdyZWVzL21pbnV0ZXMvc2Vjb25kcyBpbnRvIG51bWVyaWMgZGVncmVlcy5cbiAqXG4gKiBUaGlzIGlzIHZlcnkgZmxleGlibGUgb24gZm9ybWF0cywgYWxsb3dpbmcgc2lnbmVkIGRlY2ltYWwgZGVncmVlcywgb3IgZGVnLW1pbi1zZWMgb3B0aW9uYWxseVxuICogc3VmZml4ZWQgYnkgY29tcGFzcyBkaXJlY3Rpb24gKE5TRVcpLiBBIHZhcmlldHkgb2Ygc2VwYXJhdG9ycyBhcmUgYWNjZXB0ZWQgKGVnIDPCsCAzN+KAsiAwOeKAs1cpLlxuICogU2Vjb25kcyBhbmQgbWludXRlcyBtYXkgYmUgb21pdHRlZC5cbiAqXG4gKiBAcGFyYW0gICB7c3RyaW5nfG51bWJlcn0gZG1zU3RyIC0gRGVncmVlcyBvciBkZWcvbWluL3NlYyBpbiB2YXJpZXR5IG9mIGZvcm1hdHMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBEZWdyZWVzIGFzIGRlY2ltYWwgbnVtYmVyLlxuICovXG5HZW8ucGFyc2VETVMgPSBmdW5jdGlvbihkbXNTdHIpIHtcbiAgICAvLyBjaGVjayBmb3Igc2lnbmVkIGRlY2ltYWwgZGVncmVlcyB3aXRob3V0IE5TRVcsIGlmIHNvIHJldHVybiBpdCBkaXJlY3RseVxuICAgIGlmICh0eXBlb2YgZG1zU3RyID09ICdudW1iZXInICYmIGlzRmluaXRlKGRtc1N0cikpIHJldHVybiBOdW1iZXIoZG1zU3RyKTtcblxuICAgIC8vIHN0cmlwIG9mZiBhbnkgc2lnbiBvciBjb21wYXNzIGRpciduICYgc3BsaXQgb3V0IHNlcGFyYXRlIGQvbS9zXG4gICAgdmFyIGRtcyA9IFN0cmluZyhkbXNTdHIpLnRyaW0oKS5yZXBsYWNlKC9eLS8sJycpLnJlcGxhY2UoL1tOU0VXXSQvaSwnJykuc3BsaXQoL1teMC05LixdKy8pO1xuICAgIGlmIChkbXNbZG1zLmxlbmd0aC0xXT09JycpIGRtcy5zcGxpY2UoZG1zLmxlbmd0aC0xKTsgIC8vIGZyb20gdHJhaWxpbmcgc3ltYm9sXG5cbiAgICBpZiAoZG1zID09ICcnKSByZXR1cm4gTmFOO1xuXG4gICAgLy8gYW5kIGNvbnZlcnQgdG8gZGVjaW1hbCBkZWdyZWVzLi4uXG4gICAgdmFyIGRlZztcbiAgICBzd2l0Y2ggKGRtcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOiAgLy8gaW50ZXJwcmV0IDMtcGFydCByZXN1bHQgYXMgZC9tL3NcbiAgICAgICAgICAgIGRlZyA9IGRtc1swXS8xICsgZG1zWzFdLzYwICsgZG1zWzJdLzM2MDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAgLy8gaW50ZXJwcmV0IDItcGFydCByZXN1bHQgYXMgZC9tXG4gICAgICAgICAgICBkZWcgPSBkbXNbMF0vMSArIGRtc1sxXS82MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6ICAvLyBqdXN0IGQgKHBvc3NpYmx5IGRlY2ltYWwpIG9yIG5vbi1zZXBhcmF0ZWQgZGRkbW1zc1xuICAgICAgICAgICAgZGVnID0gZG1zWzBdO1xuICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGZpeGVkLXdpZHRoIHVuc2VwYXJhdGVkIGZvcm1hdCBlZyAwMDMzNzA5V1xuICAgICAgICAgICAgLy9pZiAoL1tOU10vaS50ZXN0KGRtc1N0cikpIGRlZyA9ICcwJyArIGRlZzsgIC8vIC0gbm9ybWFsaXNlIE4vUyB0byAzLWRpZ2l0IGRlZ3JlZXNcbiAgICAgICAgICAgIC8vaWYgKC9bMC05XXs3fS8udGVzdChkZWcpKSBkZWcgPSBkZWcuc2xpY2UoMCwzKS8xICsgZGVnLnNsaWNlKDMsNSkvNjAgKyBkZWcuc2xpY2UoNSkvMzYwMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG4gICAgaWYgKC9eLXxbV1NdJC9pLnRlc3QoZG1zU3RyLnRyaW0oKSkpIGRlZyA9IC1kZWc7IC8vIHRha2UgJy0nLCB3ZXN0IGFuZCBzb3V0aCBhcyAtdmVcblxuICAgIHJldHVybiBOdW1iZXIoZGVnKTtcbn07XG5cblxuLyoqXG4gKiBDb252ZXJ0cyBkZWNpbWFsIGRlZ3JlZXMgdG8gZGVnL21pbi9zZWMgZm9ybWF0XG4gKiAgLSBkZWdyZWUsIHByaW1lLCBkb3VibGUtcHJpbWUgc3ltYm9scyBhcmUgYWRkZWQsIGJ1dCBzaWduIGlzIGRpc2NhcmRlZCwgdGhvdWdoIG5vIGNvbXBhc3NcbiAqICAgIGRpcmVjdGlvbiBpcyBhZGRlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSDigJMgZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxuICovXG5HZW8udG9ETVMgPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcbiAgICBpZiAoaXNOYU4oZGVnKSkgcmV0dXJuIG51bGw7ICAvLyBnaXZlIHVwIGhlcmUgaWYgd2UgY2FuJ3QgbWFrZSBhIG51bWJlciBmcm9tIGRlZ1xuXG4gICAgLy8gZGVmYXVsdCB2YWx1ZXNcbiAgICBpZiAodHlwZW9mIGZvcm1hdCA9PSAndW5kZWZpbmVkJykgZm9ybWF0ID0gJ2Rtcyc7XG4gICAgaWYgKHR5cGVvZiBkcCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgICAgICAgY2FzZSAnZCc6ICAgZHAgPSA0OyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RtJzogIGRwID0gMjsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkbXMnOiBkcCA9IDA7IGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogICAgZm9ybWF0ID0gJ2Rtcyc7IGRwID0gMDsgIC8vIGJlIGZvcmdpdmluZyBvbiBpbnZhbGlkIGZvcm1hdFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVnID0gTWF0aC5hYnMoZGVnKTsgIC8vICh1bnNpZ25lZCByZXN1bHQgcmVhZHkgZm9yIGFwcGVuZGluZyBjb21wYXNzIGRpciduKVxuXG4gICAgdmFyIGRtcywgZCwgbSwgcztcbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgICBkZWZhdWx0OiAvLyBpbnZhbGlkIGZvcm1hdCBzcGVjIVxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIGQgPSBkZWcudG9GaXhlZChkcCk7ICAgICAvLyByb3VuZCBkZWdyZWVzXG4gICAgICAgICAgICBpZiAoZDwxMDApIGQgPSAnMCcgKyBkOyAgLy8gcGFkIHdpdGggbGVhZGluZyB6ZXJvc1xuICAgICAgICAgICAgaWYgKGQ8MTApIGQgPSAnMCcgKyBkO1xuICAgICAgICAgICAgZG1zID0gZCArICfCsCc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG0nOlxuICAgICAgICAgICAgdmFyIG1pbiA9IChkZWcqNjApLnRvRml4ZWQoZHApOyAgLy8gY29udmVydCBkZWdyZWVzIHRvIG1pbnV0ZXMgJiByb3VuZFxuICAgICAgICAgICAgZCA9IE1hdGguZmxvb3IobWluIC8gNjApOyAgICAvLyBnZXQgY29tcG9uZW50IGRlZy9taW5cbiAgICAgICAgICAgIG0gPSAobWluICUgNjApLnRvRml4ZWQoZHApOyAgLy8gcGFkIHdpdGggdHJhaWxpbmcgemVyb3NcbiAgICAgICAgICAgIGlmIChkPDEwMCkgZCA9ICcwJyArIGQ7ICAgICAgICAgIC8vIHBhZCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICAgICAgICAgIGlmIChkPDEwKSBkID0gJzAnICsgZDtcbiAgICAgICAgICAgIGlmIChtPDEwKSBtID0gJzAnICsgbTtcbiAgICAgICAgICAgIGRtcyA9IGQgKyAnwrAnICsgbSArICfigLInO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rtcyc6XG4gICAgICAgICAgICB2YXIgc2VjID0gKGRlZyozNjAwKS50b0ZpeGVkKGRwKTsgIC8vIGNvbnZlcnQgZGVncmVlcyB0byBzZWNvbmRzICYgcm91bmRcbiAgICAgICAgICAgIGQgPSBNYXRoLmZsb29yKHNlYyAvIDM2MDApOyAgICAvLyBnZXQgY29tcG9uZW50IGRlZy9taW4vc2VjXG4gICAgICAgICAgICBtID0gTWF0aC5mbG9vcihzZWMvNjApICUgNjA7XG4gICAgICAgICAgICBzID0gKHNlYyAlIDYwKS50b0ZpeGVkKGRwKTsgICAgLy8gcGFkIHdpdGggdHJhaWxpbmcgemVyb3NcbiAgICAgICAgICAgIGlmIChkPDEwMCkgZCA9ICcwJyArIGQ7ICAgICAgICAgICAgLy8gcGFkIHdpdGggbGVhZGluZyB6ZXJvc1xuICAgICAgICAgICAgaWYgKGQ8MTApIGQgPSAnMCcgKyBkO1xuICAgICAgICAgICAgaWYgKG08MTApIG0gPSAnMCcgKyBtO1xuICAgICAgICAgICAgaWYgKHM8MTApIHMgPSAnMCcgKyBzO1xuICAgICAgICAgICAgZG1zID0gZCArICfCsCcgKyBtICsgJ+KAsicgKyBzICsgJ+KAsyc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBkbXM7XG59O1xuXG5cbi8qKlxuICogQ29udmVydHMgbnVtZXJpYyBkZWdyZWVzIHRvIGRlZy9taW4vc2VjIGxhdGl0dWRlICgyLWRpZ2l0IGRlZ3JlZXMsIHN1ZmZpeGVkIHdpdGggTi9TKS5cbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkZWcgLSBEZWdyZWVzIHRvIGJlIGZvcm1hdHRlZCBhcyBzcGVjaWZpZWQuXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBSZXR1cm4gdmFsdWUgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIOKAkyBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBEZWdyZWVzIGZvcm1hdHRlZCBhcyBkZWcvbWluL3NlY3MgYWNjb3JkaW5nIHRvIHNwZWNpZmllZCBmb3JtYXQuXG4gKi9cbkdlby50b0xhdCA9IGZ1bmN0aW9uKGRlZywgZm9ybWF0LCBkcCkge1xuICAgIHZhciBsYXQgPSBHZW8udG9ETVMoZGVnLCBmb3JtYXQsIGRwKTtcbiAgICByZXR1cm4gbGF0PT09bnVsbCA/ICfigJMnIDogbGF0LnNsaWNlKDEpICsgKGRlZzwwID8gJ1MnIDogJ04nKTsgIC8vIGtub2NrIG9mZiBpbml0aWFsICcwJyBmb3IgbGF0IVxufTtcblxuXG4vKipcbiAqIENvbnZlcnQgbnVtZXJpYyBkZWdyZWVzIHRvIGRlZy9taW4vc2VjIGxvbmdpdHVkZSAoMy1kaWdpdCBkZWdyZWVzLCBzdWZmaXhlZCB3aXRoIEUvVylcbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkZWcgLSBEZWdyZWVzIHRvIGJlIGZvcm1hdHRlZCBhcyBzcGVjaWZpZWQuXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBSZXR1cm4gdmFsdWUgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIOKAkyBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBEZWdyZWVzIGZvcm1hdHRlZCBhcyBkZWcvbWluL3NlY3MgYWNjb3JkaW5nIHRvIHNwZWNpZmllZCBmb3JtYXQuXG4gKi9cbkdlby50b0xvbiA9IGZ1bmN0aW9uKGRlZywgZm9ybWF0LCBkcCkge1xuICAgIHZhciBsb24gPSBHZW8udG9ETVMoZGVnLCBmb3JtYXQsIGRwKTtcbiAgICByZXR1cm4gbG9uPT09bnVsbCA/ICfigJMnIDogbG9uICsgKGRlZzwwID8gJ1cnIDogJ0UnKTtcbn07XG5cblxuLyoqXG4gKiBDb252ZXJ0cyBudW1lcmljIGRlZ3JlZXMgdG8gZGVnL21pbi9zZWMgYXMgYSBiZWFyaW5nICgwwrAuLjM2MMKwKVxuICpcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRlZyAtIERlZ3JlZXMgdG8gYmUgZm9ybWF0dGVkIGFzIHNwZWNpZmllZC5cbiAqIEBwYXJhbSAgIHtzdHJpbmd9IFtmb3JtYXQ9ZG1zXSAtIFJldHVybiB2YWx1ZSBhcyAnZCcsICdkbScsICdkbXMnLlxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2Ug4oCTIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IERlZ3JlZXMgZm9ybWF0dGVkIGFzIGRlZy9taW4vc2VjcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWVkIGZvcm1hdC5cbiAqL1xuR2VvLnRvQnJuZyA9IGZ1bmN0aW9uKGRlZywgZm9ybWF0LCBkcCkge1xuICAgIGRlZyA9IChOdW1iZXIoZGVnKSszNjApICUgMzYwOyAgLy8gbm9ybWFsaXNlIC12ZSB2YWx1ZXMgdG8gMTgwwrAuLjM2MMKwXG4gICAgdmFyIGJybmcgPSAgR2VvLnRvRE1TKGRlZywgZm9ybWF0LCBkcCk7XG4gICAgcmV0dXJuIGJybmc9PT1udWxsID8gJ+KAkycgOiBicm5nLnJlcGxhY2UoJzM2MCcsICcwJyk7ICAvLyBqdXN0IGluIGNhc2Ugcm91bmRpbmcgdG9vayB1cyB1cCB0byAzNjDCsCFcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIGNvbXBhc3MgcG9pbnQgKHRvIGdpdmVuIHByZWNpc2lvbikgZm9yIHN1cHBsaWVkIGJlYXJpbmcuXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gYmVhcmluZyAtIEJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxuICogQHBhcmFtICAge251bWJlcn0gW3ByZWNpc2lvbj0zXSAtIFByZWNpc2lvbiAoY2FyZGluYWwgLyBpbnRlcmNhcmRpbmFsIC8gc2Vjb25kYXJ5LWludGVyY2FyZGluYWwpLlxuICogQHJldHVybnMge3N0cmluZ30gQ29tcGFzcyBwb2ludCBmb3Igc3VwcGxpZWQgYmVhcmluZy5cbiAqXG4gKiBAZXhhbXBsZVxuICogICB2YXIgcG9pbnQgPSBHZW8uY29tcGFzc1BvaW50KDI0KTsgICAgLy8gcG9pbnQgPSAnTk5FJ1xuICogICB2YXIgcG9pbnQgPSBHZW8uY29tcGFzc1BvaW50KDI0LCAxKTsgLy8gcG9pbnQgPSAnTidcbiAqL1xuR2VvLmNvbXBhc3NQb2ludCA9IGZ1bmN0aW9uKGJlYXJpbmcsIHByZWNpc2lvbikge1xuICAgIGlmICh0eXBlb2YgcHJlY2lzaW9uID09ICd1bmRlZmluZWQnKSBwcmVjaXNpb24gPSAzO1xuICAgIC8vIG5vdGUgcHJlY2lzaW9uID0gbWF4IGxlbmd0aCBvZiBjb21wYXNzIHBvaW50OyBpdCBjb3VsZCBiZSBleHRlbmRlZCB0byA0IGZvciBxdWFydGVyLXdpbmRzXG4gICAgLy8gKGVnIE5FYk4pLCBidXQgSSB0aGluayB0aGV5IGFyZSBsaXR0bGUgdXNlZFxuXG4gICAgYmVhcmluZyA9ICgoYmVhcmluZyUzNjApKzM2MCklMzYwOyAvLyBub3JtYWxpc2UgdG8gMC4uMzYwXG5cbiAgICB2YXIgcG9pbnQ7XG5cbiAgICBzd2l0Y2ggKHByZWNpc2lvbikge1xuICAgICAgICBjYXNlIDE6IC8vIDQgY29tcGFzcyBwb2ludHNcbiAgICAgICAgICAgIHN3aXRjaCAoTWF0aC5yb3VuZChiZWFyaW5nKjQvMzYwKSU0KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBwb2ludCA9ICdOJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiBwb2ludCA9ICdFJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOiBwb2ludCA9ICdTJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOiBwb2ludCA9ICdXJzsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOiAvLyA4IGNvbXBhc3MgcG9pbnRzXG4gICAgICAgICAgICBzd2l0Y2ggKE1hdGgucm91bmQoYmVhcmluZyo4LzM2MCklOCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcG9pbnQgPSAnTic7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHBvaW50ID0gJ05FJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOiBwb2ludCA9ICdFJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzogcG9pbnQgPSAnU0UnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHBvaW50ID0gJ1MnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBwb2ludCA9ICdTVyc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNjogcG9pbnQgPSAnVyc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDc6IHBvaW50ID0gJ05XJzsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOiAvLyAxNiBjb21wYXNzIHBvaW50c1xuICAgICAgICAgICAgc3dpdGNoIChNYXRoLnJvdW5kKGJlYXJpbmcqMTYvMzYwKSUxNikge1xuICAgICAgICAgICAgICAgIGNhc2UgIDA6IHBvaW50ID0gJ04nOyAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDE6IHBvaW50ID0gJ05ORSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDI6IHBvaW50ID0gJ05FJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDM6IHBvaW50ID0gJ0VORSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDQ6IHBvaW50ID0gJ0UnOyAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDU6IHBvaW50ID0gJ0VTRSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDY6IHBvaW50ID0gJ1NFJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDc6IHBvaW50ID0gJ1NTRSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDg6IHBvaW50ID0gJ1MnOyAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIDk6IHBvaW50ID0gJ1NTVyc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTA6IHBvaW50ID0gJ1NXJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTE6IHBvaW50ID0gJ1dTVyc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTI6IHBvaW50ID0gJ1cnOyAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTM6IHBvaW50ID0gJ1dOVyc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTQ6IHBvaW50ID0gJ05XJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTU6IHBvaW50ID0gJ05OVyc7IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdQcmVjaXNpb24gbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDMnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9pbnQ7XG59XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuXG5cbi8qKiBFeHRlbmQgTnVtYmVyIG9iamVjdCB3aXRoIG1ldGhvZCB0byAgdHJpbSB3aGl0ZXNwYWNlIGZyb20gc3RyaW5nXG4gKiAgKHEudi4gYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvZmFzdGVyLXRyaW0tamF2YXNjcmlwdCkgKi9cbmlmICh0eXBlb2YgU3RyaW5nLnByb3RvdHlwZS50cmltID09ICd1bmRlZmluZWQnKSB7XG4gICAgU3RyaW5nLnByb3RvdHlwZS50cmltID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcodGhpcykucmVwbGFjZSgvXlxcc1xccyovLCAnJykucmVwbGFjZSgvXFxzXFxzKiQvLCAnJyk7XG4gICAgfTtcbn1cblxuXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5pZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBHZW87IC8vIENvbW1vbkpTXG5pZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7IHJldHVybiBHZW87IH0pOyAvLyBBTURcbiIsIlwidXNlIHN0cmljdFwiO1xuLy9FbmhhbmNlSlMgaXNJRSB0ZXN0IGlkZWFcblxuLy9kZXRlY3QgSUUgYW5kIHZlcnNpb24gbnVtYmVyIHRocm91Z2ggaW5qZWN0ZWQgY29uZGl0aW9uYWwgY29tbWVudHMgKG5vIFVBIGRldGVjdCwgbm8gbmVlZCBmb3IgY29uZC4gY29tcGlsYXRpb24gLyBqc2NyaXB0IGNoZWNrKVxuXG4vL3ZlcnNpb24gYXJnIGlzIGZvciBJRSB2ZXJzaW9uIChvcHRpb25hbClcbi8vY29tcGFyaXNvbiBhcmcgc3VwcG9ydHMgJ2x0ZScsICdndGUnLCBldGMgKG9wdGlvbmFsKVxuXG5mdW5jdGlvbiBpc0lFKHZlcnNpb24sIGNvbXBhcmlzb24pIHtcbiAgdmFyIGNjICAgICAgPSAnSUUnLFxuICAgIGIgICAgICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdCJyksXG4gICAgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBpc0lFO1xuXG4gIGlmKHZlcnNpb24pe1xuICAgIGNjICs9ICcgJyArIHZlcnNpb247XG4gICAgaWYoY29tcGFyaXNvbil7IGNjID0gY29tcGFyaXNvbiArICcgJyArIGNjOyB9XG4gIH1cblxuICBiLmlubmVySFRNTCA9ICc8IS0tW2lmICcrIGNjICsnXT48YiBpZD1cImllY2N0ZXN0XCI+PC9iPjwhW2VuZGlmXS0tPic7XG4gIGRvY0VsZW0uYXBwZW5kQ2hpbGQoYik7XG4gIGlzSUUgPSAhIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZWNjdGVzdCcpO1xuICBkb2NFbGVtLnJlbW92ZUNoaWxkKGIpO1xuICByZXR1cm4gaXNJRTtcbn1cblxuLy8vL2lzIGl0IElFP1xuLy9pc0lFKCk7XG4vL1xuLy8vL2lzIGl0IElFNj9cbi8vaXNJRSg2KTtcbi8vXG4vLy8vaXMgaXQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIElFIDY/XG4vL2lzSUUoNywnbHRlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJRTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuLyogIExhdGl0dWRlL2xvbmdpdHVkZSBzcGhlcmljYWwgZ2VvZGVzeSBmb3JtdWxhZSAmIHNjcmlwdHMgICAgICAgICAgIChjKSBDaHJpcyBWZW5lc3MgMjAwMi0yMDE0ICAqL1xuLyogICAtIHd3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JVCBMaWNlbmNlICAqL1xuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuXG4vKiBqc2hpbnQgbm9kZTp0cnVlICovLyogZ2xvYmFsIGRlZmluZSAqL1xuJ3VzZSBzdHJpY3QnO1xuaWYgKHR5cGVvZiBtb2R1bGUhPSd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB2YXIgR2VvID0gcmVxdWlyZSgnLi9nZW8nKTsgLy8gQ29tbW9uSlMgKE5vZGUuanMpXG5cblxuLyoqXG4gKiBDcmVhdGVzIGEgTGF0TG9uIHBvaW50IG9uIHRoZSBlYXJ0aCdzIHN1cmZhY2UgYXQgdGhlIHNwZWNpZmllZCBsYXRpdHVkZSAvIGxvbmdpdHVkZS5cbiAqXG4gKiBAY2xhc3NkZXNjIFRvb2xzIGZvciBnZW9kZXRpYyBjYWxjdWxhdGlvbnNcbiAqIEByZXF1aXJlcyBHZW9cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7bnVtYmVyfSBsYXQgLSBMYXRpdHVkZSBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHtudW1iZXJ9IGxvbiAtIExvbmdpdHVkZSBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHQ9MF0gLSBIZWlnaHQgYWJvdmUgbWVhbi1zZWEtbGV2ZWwgaW4ga2lsb21ldHJlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbcmFkaXVzPTYzNzFdIC0gKE1lYW4pIHJhZGl1cyBvZiBlYXJ0aCBpbiBraWxvbWV0cmVzLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1Mi4yMDUsIDAuMTE5KTtcbiAqL1xuZnVuY3Rpb24gTGF0TG9uKGxhdCwgbG9uLCBoZWlnaHQsIHJhZGl1cykge1xuICAgIC8vIGFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCAnbmV3J1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBMYXRMb24pKSByZXR1cm4gbmV3IExhdExvbihsYXQsIGxvbiwgaGVpZ2h0LCByYWRpdXMpO1xuXG4gICAgaWYgKHR5cGVvZiBoZWlnaHQgPT0gJ3VuZGVmaW5lZCcpIGhlaWdodCA9IDA7XG4gICAgaWYgKHR5cGVvZiByYWRpdXMgPT0gJ3VuZGVmaW5lZCcpIHJhZGl1cyA9IDYzNzE7XG4gICAgcmFkaXVzID0gTWF0aC5taW4oTWF0aC5tYXgocmFkaXVzLCA2MzUzKSwgNjM4NCk7XG5cbiAgICB0aGlzLmxhdCAgICA9IE51bWJlcihsYXQpO1xuICAgIHRoaXMubG9uICAgID0gTnVtYmVyKGxvbik7XG4gICAgdGhpcy5oZWlnaHQgPSBOdW1iZXIoaGVpZ2h0KTtcbiAgICB0aGlzLnJhZGl1cyA9IE51bWJlcihyYWRpdXMpO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGlzdGFuY2UgZnJvbSAndGhpcycgcG9pbnQgdG8gZGVzdGluYXRpb24gcG9pbnQgKHVzaW5nIGhhdmVyc2luZSBmb3JtdWxhKS5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IERpc3RhbmNlIGJldHdlZW4gdGhpcyBwb2ludCBhbmQgZGVzdGluYXRpb24gcG9pbnQsIGluIGttIChvbiBzcGhlcmUgb2YgJ3RoaXMnIHJhZGl1cykuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpLCBwMiA9IG5ldyBMYXRMb24oNDguODU3LCAyLjM1MSk7XG4gKiAgICAgdmFyIGQgPSBwMS5kaXN0YW5jZVRvKHAyKTsgLy8gZC50b1ByZWNpc2lvbig0KTogNDA0LjNcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5kaXN0YW5jZVRvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB2YXIgUiA9IHRoaXMucmFkaXVzO1xuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCksIM67MiA9IHBvaW50Lmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgzpTPhiA9IM+GMiAtIM+GMTtcbiAgICB2YXIgzpTOuyA9IM67MiAtIM67MTtcblxuICAgIHZhciBhID0gTWF0aC5zaW4ozpTPhi8yKSAqIE1hdGguc2luKM6Uz4YvMikgK1xuICAgICAgICAgICAgTWF0aC5jb3Moz4YxKSAqIE1hdGguY29zKM+GMikgKlxuICAgICAgICAgICAgTWF0aC5zaW4ozpTOuy8yKSAqIE1hdGguc2luKM6UzrsvMik7XG4gICAgdmFyIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxLWEpKTtcbiAgICB2YXIgZCA9IFIgKiBjO1xuXG4gICAgcmV0dXJuIGQ7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgKGluaXRpYWwpIGJlYXJpbmcgZnJvbSAndGhpcycgcG9pbnQgdG8gZGVzdGluYXRpb24gcG9pbnQuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBJbml0aWFsIGJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1Mi4yMDUsIDAuMTE5KSwgcDIgPSBuZXcgTGF0TG9uKDQ4Ljg1NywgMi4zNTEpO1xuICogICAgIHZhciBiMSA9IHAxLmJlYXJpbmdUbyhwMik7IC8vIGIxLnRvRml4ZWQoMSk6IDE1Ni4yXG4gKi9cbkxhdExvbi5wcm90b3R5cGUuYmVhcmluZ1RvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKTtcbiAgICB2YXIgzpTOuyA9IChwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xuXG4gICAgLy8gc2VlIGh0dHA6Ly9tYXRoZm9ydW0ub3JnL2xpYnJhcnkvZHJtYXRoL3ZpZXcvNTU0MTcuaHRtbFxuICAgIHZhciB5ID0gTWF0aC5zaW4ozpTOuykgKiBNYXRoLmNvcyjPhjIpO1xuICAgIHZhciB4ID0gTWF0aC5jb3Moz4YxKSpNYXRoLnNpbijPhjIpIC1cbiAgICAgICAgICAgIE1hdGguc2luKM+GMSkqTWF0aC5jb3Moz4YyKSpNYXRoLmNvcyjOlM67KTtcbiAgICB2YXIgzrggPSBNYXRoLmF0YW4yKHksIHgpO1xuXG4gICAgcmV0dXJuICjOuC50b0RlZ3JlZXMoKSszNjApICUgMzYwO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgZmluYWwgYmVhcmluZyBhcnJpdmluZyBhdCBkZXN0aW5hdGlvbiBkZXN0aW5hdGlvbiBwb2ludCBmcm9tICd0aGlzJyBwb2ludDsgdGhlIGZpbmFsIGJlYXJpbmdcbiAqIHdpbGwgZGlmZmVyIGZyb20gdGhlIGluaXRpYWwgYmVhcmluZyBieSB2YXJ5aW5nIGRlZ3JlZXMgYWNjb3JkaW5nIHRvIGRpc3RhbmNlIGFuZCBsYXRpdHVkZS5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IEZpbmFsIGJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1Mi4yMDUsIDAuMTE5KSwgcDIgPSBuZXcgTGF0TG9uKDQ4Ljg1NywgMi4zNTEpO1xuICogICAgIHZhciBiMiA9IHAxLmZpbmFsQmVhcmluZ1RvKHAyKTsgLy8gcDIudG9GaXhlZCgxKTogMTU3LjlcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5maW5hbEJlYXJpbmdUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgLy8gZ2V0IGluaXRpYWwgYmVhcmluZyBmcm9tIGRlc3RpbmF0aW9uIHBvaW50IHRvIHRoaXMgcG9pbnQgJiByZXZlcnNlIGl0IGJ5IGFkZGluZyAxODDCsFxuICAgIHJldHVybiAoIHBvaW50LmJlYXJpbmdUbyh0aGlzKSsxODAgKSAlIDM2MDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaWRwb2ludCBiZXR3ZWVuICd0aGlzJyBwb2ludCBhbmQgdGhlIHN1cHBsaWVkIHBvaW50LlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxuICogQHJldHVybnMge0xhdExvbn0gTWlkcG9pbnQgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCB0aGUgc3VwcGxpZWQgcG9pbnQuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpLCBwMiA9IG5ldyBMYXRMb24oNDguODU3LCAyLjM1MSk7XG4gKiAgICAgdmFyIHBNaWQgPSBwMS5taWRwb2ludFRvKHAyKTsgLy8gcE1pZC50b1N0cmluZygpOiA1MC41MzYzwrBOLCAwMDEuMjc0NsKwRVxuICovXG5MYXRMb24ucHJvdG90eXBlLm1pZHBvaW50VG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIC8vIHNlZSBodHRwOi8vbWF0aGZvcnVtLm9yZy9saWJyYXJ5L2RybWF0aC92aWV3LzUxODIyLmh0bWwgZm9yIGRlcml2YXRpb25cblxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgzrsxID0gdGhpcy5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKTtcbiAgICB2YXIgzpTOuyA9IChwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xuXG4gICAgdmFyIEJ4ID0gTWF0aC5jb3Moz4YyKSAqIE1hdGguY29zKM6UzrspO1xuICAgIHZhciBCeSA9IE1hdGguY29zKM+GMikgKiBNYXRoLnNpbijOlM67KTtcblxuICAgIHZhciDPhjMgPSBNYXRoLmF0YW4yKE1hdGguc2luKM+GMSkrTWF0aC5zaW4oz4YyKSxcbiAgICAgICAgICAgICBNYXRoLnNxcnQoIChNYXRoLmNvcyjPhjEpK0J4KSooTWF0aC5jb3Moz4YxKStCeCkgKyBCeSpCeSkgKTtcbiAgICB2YXIgzrszID0gzrsxICsgTWF0aC5hdGFuMihCeSwgTWF0aC5jb3Moz4YxKSArIEJ4KTtcbiAgICDOuzMgPSAozrszKzMqTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIG5vcm1hbGlzZSB0byAtMTgwLi4rMTgwwrBcblxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMy50b0RlZ3JlZXMoKSwgzrszLnRvRGVncmVlcygpKTtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBwb2ludCBmcm9tICd0aGlzJyBwb2ludCBoYXZpbmcgdHJhdmVsbGVkIHRoZSBnaXZlbiBkaXN0YW5jZSBvbiB0aGVcbiAqIGdpdmVuIGluaXRpYWwgYmVhcmluZyAoYmVhcmluZyBub3JtYWxseSB2YXJpZXMgYXJvdW5kIHBhdGggZm9sbG93ZWQpLlxuICpcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGJybmcgLSBJbml0aWFsIGJlYXJpbmcgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRpc3QgLSBEaXN0YW5jZSBpbiBrbSAob24gc3BoZXJlIG9mICd0aGlzJyByYWRpdXMpLlxuICogQHJldHVybnMge0xhdExvbn0gRGVzdGluYXRpb24gcG9pbnQuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUxLjQ3NzgsIC0wLjAwMTUpO1xuICogICAgIHZhciBwMiA9IHAxLmRlc3RpbmF0aW9uUG9pbnQoMzAwLjcsIDcuNzk0KTsgLy8gcDIudG9TdHJpbmcoKTogNTEuNTEzNcKwTiwgMDAwLjA5ODPCsFdcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5kZXN0aW5hdGlvblBvaW50ID0gZnVuY3Rpb24oYnJuZywgZGlzdCkge1xuICAgIC8vIHNlZSBodHRwOi8vd2lsbGlhbXMuYmVzdC52d2gubmV0L2F2Zm9ybS5odG0jTExcblxuICAgIHZhciDOuCA9IE51bWJlcihicm5nKS50b1JhZGlhbnMoKTtcbiAgICB2YXIgzrQgPSBOdW1iZXIoZGlzdCkgLyB0aGlzLnJhZGl1czsgLy8gYW5ndWxhciBkaXN0YW5jZSBpbiByYWRpYW5zXG5cbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xuXG4gICAgdmFyIM+GMiA9IE1hdGguYXNpbiggTWF0aC5zaW4oz4YxKSpNYXRoLmNvcyjOtCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3Moz4YxKSpNYXRoLnNpbijOtCkqTWF0aC5jb3MozrgpICk7XG4gICAgdmFyIM67MiA9IM67MSArIE1hdGguYXRhbjIoTWF0aC5zaW4ozrgpKk1hdGguc2luKM60KSpNYXRoLmNvcyjPhjEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjOtCktTWF0aC5zaW4oz4YxKSpNYXRoLnNpbijPhjIpKTtcbiAgICDOuzIgPSAozrsyKzMqTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIG5vcm1hbGlzZSB0byAtMTgwLi4rMTgwwrBcblxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMi50b0RlZ3JlZXMoKSwgzrsyLnRvRGVncmVlcygpKTtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwb2ludCBvZiBpbnRlcnNlY3Rpb24gb2YgdHdvIHBhdGhzIGRlZmluZWQgYnkgcG9pbnQgYW5kIGJlYXJpbmcuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcDEgLSBGaXJzdCBwb2ludC5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGJybmcxIC0gSW5pdGlhbCBiZWFyaW5nIGZyb20gZmlyc3QgcG9pbnQuXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwMiAtIFNlY29uZCBwb2ludC5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGJybmcyIC0gSW5pdGlhbCBiZWFyaW5nIGZyb20gc2Vjb25kIHBvaW50LlxuICogQHJldHVybnMge0xhdExvbn0gRGVzdGluYXRpb24gcG9pbnQgKG51bGwgaWYgbm8gdW5pcXVlIGludGVyc2VjdGlvbiBkZWZpbmVkKS5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IExhdExvbig1MS44ODUzLCAwLjI1NDUpLCBicm5nMSA9IDEwOC41NDc7XG4gKiAgICAgdmFyIHAyID0gTGF0TG9uKDQ5LjAwMzQsIDIuNTczNSksIGJybmcyID0gIDMyLjQzNTtcbiAqICAgICB2YXIgcEludCA9IExhdExvbi5pbnRlcnNlY3Rpb24ocDEsIGJybmcxLCBwMiwgYnJuZzIpOyAvLyBwSW50LnRvU3RyaW5nKCk6IDUwLjkwNzbCsE4sIDAwNC41MDg0wrBFXG4gKi9cbkxhdExvbi5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihwMSwgYnJuZzEsIHAyLCBicm5nMikge1xuICAgIC8vIHNlZSBodHRwOi8vd2lsbGlhbXMuYmVzdC52d2gubmV0L2F2Zm9ybS5odG0jSW50ZXJzZWN0aW9uXG5cbiAgICB2YXIgz4YxID0gcDEubGF0LnRvUmFkaWFucygpLCDOuzEgPSBwMS5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM+GMiA9IHAyLmxhdC50b1JhZGlhbnMoKSwgzrsyID0gcDIubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDOuDEzID0gTnVtYmVyKGJybmcxKS50b1JhZGlhbnMoKSwgzrgyMyA9IE51bWJlcihicm5nMikudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6Uz4YgPSDPhjItz4YxLCDOlM67ID0gzrsyLc67MTtcblxuICAgIHZhciDOtDEyID0gMipNYXRoLmFzaW4oIE1hdGguc3FydCggTWF0aC5zaW4ozpTPhi8yKSpNYXRoLnNpbijOlM+GLzIpICtcbiAgICAgICAgTWF0aC5jb3Moz4YxKSpNYXRoLmNvcyjPhjIpKk1hdGguc2luKM6UzrsvMikqTWF0aC5zaW4ozpTOuy8yKSApICk7XG4gICAgaWYgKM60MTIgPT0gMCkgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBpbml0aWFsL2ZpbmFsIGJlYXJpbmdzIGJldHdlZW4gcG9pbnRzXG4gICAgdmFyIM64MSA9IE1hdGguYWNvcyggKCBNYXRoLnNpbijPhjIpIC0gTWF0aC5zaW4oz4YxKSpNYXRoLmNvcyjOtDEyKSApIC9cbiAgICAgICAgICAgICAgICAgICAgICAgICggTWF0aC5zaW4ozrQxMikqTWF0aC5jb3Moz4YxKSApICk7XG4gICAgaWYgKGlzTmFOKM64MSkpIM64MSA9IDA7IC8vIHByb3RlY3QgYWdhaW5zdCByb3VuZGluZ1xuICAgIHZhciDOuDIgPSBNYXRoLmFjb3MoICggTWF0aC5zaW4oz4YxKSAtIE1hdGguc2luKM+GMikqTWF0aC5jb3MozrQxMikgKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAoIE1hdGguc2luKM60MTIpKk1hdGguY29zKM+GMikgKSApO1xuXG4gICAgdmFyIM64MTIsIM64MjE7XG4gICAgaWYgKE1hdGguc2luKM67Mi3OuzEpID4gMCkge1xuICAgICAgICDOuDEyID0gzrgxO1xuICAgICAgICDOuDIxID0gMipNYXRoLlBJIC0gzrgyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIM64MTIgPSAyKk1hdGguUEkgLSDOuDE7XG4gICAgICAgIM64MjEgPSDOuDI7XG4gICAgfVxuXG4gICAgdmFyIM6xMSA9ICjOuDEzIC0gzrgxMiArIE1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBhbmdsZSAyLTEtM1xuICAgIHZhciDOsTIgPSAozrgyMSAtIM64MjMgKyBNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gYW5nbGUgMS0yLTNcblxuICAgIGlmIChNYXRoLnNpbijOsTEpPT0wICYmIE1hdGguc2luKM6xMik9PTApIHJldHVybiBudWxsOyAvLyBpbmZpbml0ZSBpbnRlcnNlY3Rpb25zXG4gICAgaWYgKE1hdGguc2luKM6xMSkqTWF0aC5zaW4ozrEyKSA8IDApIHJldHVybiBudWxsOyAgICAgIC8vIGFtYmlndW91cyBpbnRlcnNlY3Rpb25cblxuICAgIC8vzrExID0gTWF0aC5hYnMozrExKTtcbiAgICAvL86xMiA9IE1hdGguYWJzKM6xMik7XG4gICAgLy8gLi4uIEVkIFdpbGxpYW1zIHRha2VzIGFicyBvZiDOsTEvzrEyLCBidXQgc2VlbXMgdG8gYnJlYWsgY2FsY3VsYXRpb24/XG5cbiAgICB2YXIgzrEzID0gTWF0aC5hY29zKCAtTWF0aC5jb3MozrExKSpNYXRoLmNvcyjOsTIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnNpbijOsTEpKk1hdGguc2luKM6xMikqTWF0aC5jb3MozrQxMikgKTtcbiAgICB2YXIgzrQxMyA9IE1hdGguYXRhbjIoIE1hdGguc2luKM60MTIpKk1hdGguc2luKM6xMSkqTWF0aC5zaW4ozrEyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MozrEyKStNYXRoLmNvcyjOsTEpKk1hdGguY29zKM6xMykgKTtcbiAgICB2YXIgz4YzID0gTWF0aC5hc2luKCBNYXRoLnNpbijPhjEpKk1hdGguY29zKM60MTMpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM+GMSkqTWF0aC5zaW4ozrQxMykqTWF0aC5jb3MozrgxMykgKTtcbiAgICB2YXIgzpTOuzEzID0gTWF0aC5hdGFuMiggTWF0aC5zaW4ozrgxMykqTWF0aC5zaW4ozrQxMykqTWF0aC5jb3Moz4YxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM60MTMpLU1hdGguc2luKM+GMSkqTWF0aC5zaW4oz4YzKSApO1xuICAgIHZhciDOuzMgPSDOuzEgKyDOlM67MTM7XG4gICAgzrszID0gKM67MyszKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjMudG9EZWdyZWVzKCksIM67My50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSB0cmF2ZWxsaW5nIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50IGFsb25nIGEgcmh1bWIgbGluZS5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IERpc3RhbmNlIGluIGttIGJldHdlZW4gdGhpcyBwb2ludCBhbmQgZGVzdGluYXRpb24gcG9pbnQgKG9uIHNwaGVyZSBvZiAndGhpcycgcmFkaXVzKS5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCksIHAyID0gbmV3IExhdExvbig1MC45NjQsIDEuODUzKTtcbiAqICAgICB2YXIgZCA9IHAxLmRpc3RhbmNlVG8ocDIpOyAvLyBkLnRvUHJlY2lzaW9uKDQpOiA0MC4zMVxuICovXG5MYXRMb24ucHJvdG90eXBlLnJodW1iRGlzdGFuY2VUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgLy8gc2VlIGh0dHA6Ly93aWxsaWFtcy5iZXN0LnZ3aC5uZXQvYXZmb3JtLmh0bSNSaHVtYlxuXG4gICAgdmFyIFIgPSB0aGlzLnJhZGl1cztcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKTtcbiAgICB2YXIgzpTPhiA9IM+GMiAtIM+GMTtcbiAgICB2YXIgzpTOuyA9IE1hdGguYWJzKHBvaW50Lmxvbi10aGlzLmxvbikudG9SYWRpYW5zKCk7XG4gICAgLy8gaWYgZExvbiBvdmVyIDE4MMKwIHRha2Ugc2hvcnRlciByaHVtYiBsaW5lIGFjcm9zcyB0aGUgYW50aS1tZXJpZGlhbjpcbiAgICBpZiAoTWF0aC5hYnMozpTOuykgPiBNYXRoLlBJKSDOlM67ID0gzpTOuz4wID8gLSgyKk1hdGguUEktzpTOuykgOiAoMipNYXRoLlBJK86UzrspO1xuXG4gICAgLy8gb24gTWVyY2F0b3IgcHJvamVjdGlvbiwgbG9uZ2l0dWRlIGRpc3RhbmNlcyBzaHJpbmsgYnkgbGF0aXR1ZGU7IHEgaXMgdGhlICdzdHJldGNoIGZhY3RvcidcbiAgICAvLyBxIGJlY29tZXMgaWxsLWNvbmRpdGlvbmVkIGFsb25nIEUtVyBsaW5lICgwLzApOyB1c2UgZW1waXJpY2FsIHRvbGVyYW5jZSB0byBhdm9pZCBpdFxuICAgIHZhciDOlM+IID0gTWF0aC5sb2coTWF0aC50YW4oz4YyLzIrTWF0aC5QSS80KS9NYXRoLnRhbijPhjEvMitNYXRoLlBJLzQpKTtcbiAgICB2YXIgcSA9IE1hdGguYWJzKM6Uz4gpID4gMTBlLTEyID8gzpTPhi/OlM+IIDogTWF0aC5jb3Moz4YxKTtcblxuICAgIC8vIGRpc3RhbmNlIGlzIHB5dGhhZ29yYXMgb24gJ3N0cmV0Y2hlZCcgTWVyY2F0b3IgcHJvamVjdGlvblxuICAgIHZhciDOtCA9IE1hdGguc3FydCjOlM+GKs6Uz4YgKyBxKnEqzpTOuyrOlM67KTsgLy8gYW5ndWxhciBkaXN0YW5jZSBpbiByYWRpYW5zXG4gICAgdmFyIGRpc3QgPSDOtCAqIFI7XG5cbiAgICByZXR1cm4gZGlzdDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiZWFyaW5nIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50IGFsb25nIGEgcmh1bWIgbGluZS5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IEJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS4xMjcsIDEuMzM4KSwgcDIgPSBuZXcgTGF0TG9uKDUwLjk2NCwgMS44NTMpO1xuICogICAgIHZhciBkID0gcDEucmh1bWJCZWFyaW5nVG8ocDIpOyAvLyBkLnRvRml4ZWQoMSk6IDExNi43XG4gKi9cbkxhdExvbi5wcm90b3R5cGUucmh1bWJCZWFyaW5nVG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpO1xuICAgIHZhciDOlM67ID0gKHBvaW50Lmxvbi10aGlzLmxvbikudG9SYWRpYW5zKCk7XG4gICAgLy8gaWYgZExvbiBvdmVyIDE4MMKwIHRha2Ugc2hvcnRlciByaHVtYiBsaW5lIGFjcm9zcyB0aGUgYW50aS1tZXJpZGlhbjpcbiAgICBpZiAoTWF0aC5hYnMozpTOuykgPiBNYXRoLlBJKSDOlM67ID0gzpTOuz4wID8gLSgyKk1hdGguUEktzpTOuykgOiAoMipNYXRoLlBJK86UzrspO1xuXG4gICAgdmFyIM6Uz4ggPSBNYXRoLmxvZyhNYXRoLnRhbijPhjIvMitNYXRoLlBJLzQpL01hdGgudGFuKM+GMS8yK01hdGguUEkvNCkpO1xuXG4gICAgdmFyIM64ID0gTWF0aC5hdGFuMijOlM67LCDOlM+IKTtcblxuICAgIHJldHVybiAozrgudG9EZWdyZWVzKCkrMzYwKSAlIDM2MDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBwb2ludCBoYXZpbmcgdHJhdmVsbGVkIGFsb25nIGEgcmh1bWIgbGluZSBmcm9tICd0aGlzJyBwb2ludCB0aGUgZ2l2ZW5cbiAqIGRpc3RhbmNlIG9uIHRoZSAgZ2l2ZW4gYmVhcmluZy5cbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nIC0gQmVhcmluZyBpbiBkZWdyZWVzIGZyb20gbm9ydGguXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkaXN0IC0gRGlzdGFuY2UgaW4ga20gKG9uIHNwaGVyZSBvZiAndGhpcycgcmFkaXVzKS5cbiAqIEByZXR1cm5zIHtMYXRMb259IERlc3RpbmF0aW9uIHBvaW50LlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS4xMjcsIDEuMzM4KTtcbiAqICAgICB2YXIgcDIgPSBwMS5yaHVtYkRlc3RpbmF0aW9uUG9pbnQoMTE2LjcsIDQwLjMxKTsgLy8gcDIudG9TdHJpbmcoKTogNTAuOTY0McKwTiwgMDAxLjg1MzHCsEVcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5yaHVtYkRlc3RpbmF0aW9uUG9pbnQgPSBmdW5jdGlvbihicm5nLCBkaXN0KSB7XG4gICAgdmFyIM60ID0gTnVtYmVyKGRpc3QpIC8gdGhpcy5yYWRpdXM7IC8vIGFuZ3VsYXIgZGlzdGFuY2UgaW4gcmFkaWFuc1xuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgzrsxID0gdGhpcy5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM64ID0gTnVtYmVyKGJybmcpLnRvUmFkaWFucygpO1xuXG4gICAgdmFyIM6Uz4YgPSDOtCAqIE1hdGguY29zKM64KTtcblxuICAgIHZhciDPhjIgPSDPhjEgKyDOlM+GO1xuICAgIC8vIGNoZWNrIGZvciBzb21lIGRhZnQgYnVnZ2VyIGdvaW5nIHBhc3QgdGhlIHBvbGUsIG5vcm1hbGlzZSBsYXRpdHVkZSBpZiBzb1xuICAgIGlmIChNYXRoLmFicyjPhjIpID4gTWF0aC5QSS8yKSDPhjIgPSDPhjI+MCA/IE1hdGguUEktz4YyIDogLU1hdGguUEktz4YyO1xuXG4gICAgdmFyIM6Uz4ggPSBNYXRoLmxvZyhNYXRoLnRhbijPhjIvMitNYXRoLlBJLzQpL01hdGgudGFuKM+GMS8yK01hdGguUEkvNCkpO1xuICAgIHZhciBxID0gTWF0aC5hYnMozpTPiCkgPiAxMGUtMTIgPyDOlM+GIC8gzpTPiCA6IE1hdGguY29zKM+GMSk7IC8vIEUtVyBjb3Vyc2UgYmVjb21lcyBpbGwtY29uZGl0aW9uZWQgd2l0aCAwLzBcblxuICAgIHZhciDOlM67ID0gzrQqTWF0aC5zaW4ozrgpL3E7XG5cbiAgICB2YXIgzrsyID0gzrsxICsgzpTOuztcblxuICAgIM67MiA9ICjOuzIgKyAzKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjIudG9EZWdyZWVzKCksIM67Mi50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgbG94b2Ryb21pYyBtaWRwb2ludCAoYWxvbmcgYSByaHVtYiBsaW5lKSBiZXR3ZWVuICd0aGlzJyBwb2ludCBhbmQgc2Vjb25kIHBvaW50LlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIHNlY29uZCBwb2ludC5cbiAqIEByZXR1cm5zIHtMYXRMb259IE1pZHBvaW50IGJldHdlZW4gdGhpcyBwb2ludCBhbmQgc2Vjb25kIHBvaW50LlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS4xMjcsIDEuMzM4KSwgcDIgPSBuZXcgTGF0TG9uKDUwLjk2NCwgMS44NTMpO1xuICogICAgIHZhciBwMiA9IHAxLnJodW1iTWlkcG9pbnRUbyhwMik7IC8vIHAyLnRvU3RyaW5nKCk6IDUxLjA0NTXCsE4sIDAwMS41OTU3wrBFXG4gKi9cbkxhdExvbi5wcm90b3R5cGUucmh1bWJNaWRwb2ludFRvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAvLyBodHRwOi8vbWF0aGZvcnVtLm9yZy9rYi9tZXNzYWdlLmpzcGE/bWVzc2FnZUlEPTE0ODgzN1xuXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpLCDOuzIgPSBwb2ludC5sb24udG9SYWRpYW5zKCk7XG5cbiAgICBpZiAoTWF0aC5hYnMozrsyLc67MSkgPiBNYXRoLlBJKSDOuzEgKz0gMipNYXRoLlBJOyAvLyBjcm9zc2luZyBhbnRpLW1lcmlkaWFuXG5cbiAgICB2YXIgz4YzID0gKM+GMSvPhjIpLzI7XG4gICAgdmFyIGYxID0gTWF0aC50YW4oTWF0aC5QSS80ICsgz4YxLzIpO1xuICAgIHZhciBmMiA9IE1hdGgudGFuKE1hdGguUEkvNCArIM+GMi8yKTtcbiAgICB2YXIgZjMgPSBNYXRoLnRhbihNYXRoLlBJLzQgKyDPhjMvMik7XG4gICAgdmFyIM67MyA9ICggKM67Mi3OuzEpKk1hdGgubG9nKGYzKSArIM67MSpNYXRoLmxvZyhmMikgLSDOuzIqTWF0aC5sb2coZjEpICkgLyBNYXRoLmxvZyhmMi9mMSk7XG5cbiAgICBpZiAoIWlzRmluaXRlKM67MykpIM67MyA9ICjOuzErzrsyKS8yOyAvLyBwYXJhbGxlbCBvZiBsYXRpdHVkZVxuXG4gICAgzrszID0gKM67MyArIDMqTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIG5vcm1hbGlzZSB0byAtMTgwLi4rMTgwwrBcblxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMy50b0RlZ3JlZXMoKSwgzrszLnRvRGVncmVlcygpKTtcbn07XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuXG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiAndGhpcycgcG9pbnQsIGZvcm1hdHRlZCBhcyBkZWdyZWVzLCBkZWdyZWVzK21pbnV0ZXMsIG9yXG4gKiBkZWdyZWVzK21pbnV0ZXMrc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBGb3JtYXQgcG9pbnQgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIC0gZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxuICogQHJldHVybnMge3N0cmluZ30gQ29tbWEtc2VwYXJhdGVkIGxhdGl0dWRlL2xvbmdpdHVkZS5cbiAqL1xuTGF0TG9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKGZvcm1hdCwgZHApIHtcbiAgICBpZiAodHlwZW9mIGZvcm1hdCA9PSAndW5kZWZpbmVkJykgZm9ybWF0ID0gJ2Rtcyc7XG5cbiAgICByZXR1cm4gR2VvLnRvTGF0KHRoaXMubGF0LCBmb3JtYXQsIGRwKSArICcsICcgKyBHZW8udG9Mb24odGhpcy5sb24sIGZvcm1hdCwgZHApO1xufTtcblxuXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5cblxuLyoqIEV4dGVuZCBOdW1iZXIgb2JqZWN0IHdpdGggbWV0aG9kIHRvIGNvbnZlcnQgbnVtZXJpYyBkZWdyZWVzIHRvIHJhZGlhbnMgKi9cbmlmICh0eXBlb2YgTnVtYmVyLnByb3RvdHlwZS50b1JhZGlhbnMgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBOdW1iZXIucHJvdG90eXBlLnRvUmFkaWFucyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyAqIE1hdGguUEkgLyAxODA7IH07XG59XG5cblxuLyoqIEV4dGVuZCBOdW1iZXIgb2JqZWN0IHdpdGggbWV0aG9kIHRvIGNvbnZlcnQgcmFkaWFucyB0byBudW1lcmljIChzaWduZWQpIGRlZ3JlZXMgKi9cbmlmICh0eXBlb2YgTnVtYmVyLnByb3RvdHlwZS50b0RlZ3JlZXMgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBOdW1iZXIucHJvdG90eXBlLnRvRGVncmVlcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyAqIDE4MCAvIE1hdGguUEk7IH07XG59XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gTGF0TG9uOyAvLyBDb21tb25KU1xuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoWydHZW8nXSwgZnVuY3Rpb24oKSB7IHJldHVybiBMYXRMb247IH0pOyAvLyBBTURcbiIsIlwidXNlIHN0cmljdFwiO1xuLypcclxuICogUXVhZFRyZWUgSW1wbGVtZW50YXRpb24gaW4gSmF2YVNjcmlwdFxyXG4gKiBAYXV0aG9yOiBzaWxmbG93IDxodHRwczovL2dpdGh1Yi5jb20vc2lsZmxvdz5cclxuICpcclxuICogVXNhZ2U6XHJcbiAqIFRvIGNyZWF0ZSBhIG5ldyBlbXB0eSBRdWFkdHJlZSwgZG8gdGhpczpcclxuICogdmFyIHRyZWUgPSBRVUFELmluaXQoYXJncylcclxuICpcclxuICogYXJncyA9IHtcclxuICogICAgLy8gbWFuZGF0b3J5IGZpZWxkc1xyXG4gKiAgICB4IDogeCBjb29yZGluYXRlXHJcbiAqICAgIHkgOiB5IGNvb3JkaW5hdGVcclxuICogICAgdyA6IHdpZHRoXHJcbiAqICAgIGggOiBoZWlnaHRcclxuICpcclxuICogICAgLy8gb3B0aW9uYWwgZmllbGRzXHJcbiAqICAgIG1heENoaWxkcmVuIDogbWF4IGNoaWxkcmVuIHBlciBub2RlXHJcbiAqICAgIG1heERlcHRoIDogbWF4IGRlcHRoIG9mIHRoZSB0cmVlXHJcbiAqfVxyXG4gKlxyXG4gKiBBUEk6XHJcbiAqIHRyZWUuaW5zZXJ0KCkgYWNjZXB0cyBhcnJheXMgb3Igc2luZ2xlIGl0ZW1zXHJcbiAqIGV2ZXJ5IGl0ZW0gbXVzdCBoYXZlIGEgLngsIC55LCAudywgYW5kIC5oIHByb3BlcnR5LiBpZiB0aGV5IGRvbid0LCB0aGUgdHJlZSB3aWxsIGJyZWFrLlxyXG4gKlxyXG4gKiB0cmVlLnJldHJpZXZlKHNlbGVjdG9yLCBjYWxsYmFjaykgY2FsbHMgdGhlIGNhbGxiYWNrIGZvciBhbGwgb2JqZWN0cyB0aGF0IGFyZSBpblxyXG4gKiB0aGUgc2FtZSByZWdpb24gb3Igb3ZlcmxhcHBpbmcuXHJcbiAqXHJcbiAqIHRyZWUuY2xlYXIoKSByZW1vdmVzIGFsbCBpdGVtcyBmcm9tIHRoZSBxdWFkdHJlZS5cclxuICovXHJcblxyXG52YXIgUVVBRCA9IHt9OyAvLyBnbG9iYWwgdmFyIGZvciB0aGUgcXVhZHRyZWVcclxuXHJcblFVQUQuaW5pdCA9IGZ1bmN0aW9uIChhcmdzKSB7XHJcblxyXG4gICAgdmFyIG5vZGU7XHJcbiAgICB2YXIgVE9QX0xFRlQgICAgID0gMDtcclxuICAgIHZhciBUT1BfUklHSFQgICAgPSAxO1xyXG4gICAgdmFyIEJPVFRPTV9MRUZUICA9IDI7XHJcbiAgICB2YXIgQk9UVE9NX1JJR0hUID0gMztcclxuICAgIHZhciBQQVJFTlQgICAgICAgPSA0O1xyXG5cclxuICAgIC8vIGFzc2lnbiBkZWZhdWx0IHZhbHVlc1xyXG4gICAgYXJncy5tYXhDaGlsZHJlbiA9IGFyZ3MubWF4Q2hpbGRyZW4gfHwgMjtcclxuICAgIGFyZ3MubWF4RGVwdGggPSBhcmdzLm1heERlcHRoIHx8IDQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBOb2RlIGNyZWF0b3IuIFlvdSBzaG91bGQgbmV2ZXIgY3JlYXRlIGEgbm9kZSBtYW51YWxseS4gdGhlIGFsZ29yaXRobSB0YWtlc1xyXG4gICAgICogY2FyZSBvZiB0aGF0IGZvciB5b3UuXHJcbiAgICAgKi9cclxuICAgIG5vZGUgPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgZGVwdGgsIG1heENoaWxkcmVuLCBtYXhEZXB0aCkge1xyXG5cclxuICAgICAgICB2YXIgaXRlbXMgPSBbXSwgLy8gaG9sZHMgYWxsIGl0ZW1zXHJcbiAgICAgICAgICAgIG5vZGVzID0gW107IC8vIGhvbGRzIGFsbCBjaGlsZCBub2Rlc1xyXG5cclxuICAgICAgICAvLyByZXR1cm5zIGEgZnJlc2ggbm9kZSBvYmplY3RcclxuICAgICAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICAgICAgeCA6IHgsIC8vIHRvcCBsZWZ0IHBvaW50XHJcbiAgICAgICAgICAgIHkgOiB5LCAvLyB0b3AgcmlnaHQgcG9pbnRcclxuICAgICAgICAgICAgdyA6IHcsIC8vIHdpZHRoXHJcbiAgICAgICAgICAgIGggOiBoLCAvLyBoZWlnaHRcclxuICAgICAgICAgICAgZGVwdGggOiBkZXB0aCwgLy8gZGVwdGggbGV2ZWwgb2YgdGhlIG5vZGVcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBpdGVyYXRlcyBhbGwgaXRlbXMgdGhhdCBtYXRjaCB0aGUgc2VsZWN0b3IgYW5kIGludm9rZXMgdGhlIHN1cHBsaWVkIGNhbGxiYWNrIG9uIHRoZW0uXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICByZXRyaWV2ZTogZnVuY3Rpb24oaXRlbSwgY2FsbGJhY2ssIGluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAoaW5zdGFuY2UpID8gY2FsbGJhY2suY2FsbChpbnN0YW5jZSwgaXRlbXNbaV0pIDogY2FsbGJhY2soaXRlbXNbaV0pOyBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIG5vZGUgaGFzIHN1Ym5vZGVzXHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FsbCByZXRyaWV2ZSBvbiBhbGwgbWF0Y2hpbmcgc3Vibm9kZXNcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbmRPdmVybGFwcGluZ05vZGVzKGl0ZW0sIGZ1bmN0aW9uKGRpcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tkaXJdLnJldHJpZXZlKGl0ZW0sIGNhbGxiYWNrLCBpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogQWRkcyBhIG5ldyBJdGVtIHRvIHRoZSBub2RlLlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBJZiB0aGUgbm9kZSBhbHJlYWR5IGhhcyBzdWJub2RlcywgdGhlIGl0ZW0gZ2V0cyBwdXNoZWQgZG93biBvbmUgbGV2ZWwuXHJcbiAgICAgICAgICAgICAqIElmIHRoZSBpdGVtIGRvZXMgbm90IGZpdCBpbnRvIHRoZSBzdWJub2RlcywgaXQgZ2V0cyBzYXZlZCBpbiB0aGVcclxuICAgICAgICAgICAgICogXCJjaGlsZHJlblwiLWFycmF5LlxyXG4gICAgICAgICAgICAgKlxyXG4gICAgICAgICAgICAgKiBJZiB0aGUgbWF4Q2hpbGRyZW4gbGltaXQgaXMgZXhjZWVkZWQgYWZ0ZXIgaW5zZXJ0aW5nIHRoZSBpdGVtLFxyXG4gICAgICAgICAgICAgKiB0aGUgbm9kZSBnZXRzIGRpdmlkZWQgYW5kIGFsbCBpdGVtcyBpbnNpZGUgdGhlIFwiY2hpbGRyZW5cIi1hcnJheSBnZXRcclxuICAgICAgICAgICAgICogcHVzaGVkIGRvd24gdG8gdGhlIG5ldyBzdWJub2Rlcy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGluc2VydCA6IGZ1bmN0aW9uIChpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbm9kZSBpbiB3aGljaCB0aGUgaXRlbSBmaXRzIGJlc3RcclxuICAgICAgICAgICAgICAgICAgICBpID0gdGhpcy5maW5kSW5zZXJ0Tm9kZShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gUEFSRU5UKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBpdGVtIGRvZXMgbm90IGZpdCwgcHVzaCBpdCBpbnRvIHRoZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGlsZHJlbiBhcnJheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldLmluc2VydChpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9kaXZpZGUgdGhlIG5vZGUgaWYgbWF4Q2hpbGRyZW4gaXMgZXhjZWVkZWQgYW5kIG1heERlcHRoIGlzIG5vdCByZWFjaGVkXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA+IG1heENoaWxkcmVuICYmIHRoaXMuZGVwdGggPCBtYXhEZXB0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpdmlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBGaW5kIGEgbm9kZSB0aGUgaXRlbSBzaG91bGQgYmUgaW5zZXJ0ZWQgaW4uXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmaW5kSW5zZXJ0Tm9kZSA6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBsZWZ0XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS54ICsgaXRlbS53IDwgeCArICh3IC8gMikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55ICsgaXRlbS5oIDwgeSArIChoIC8gMikpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIFRPUF9MRUZUO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgPj0geSArIChoIC8gMikpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIEJPVFRPTV9MRUZUO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQQVJFTlQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcmlnaHRcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnggPj0geCArICh3IC8gMikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55ICsgaXRlbS5oIDwgeSArIChoIC8gMikpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIFRPUF9SSUdIVDtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55ID49IHkgKyAoaCAvIDIpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBCT1RUT01fUklHSFQ7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFBBUkVOVDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUEFSRU5UO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEZpbmRzIHRoZSByZWdpb25zIHRoZSBpdGVtIG92ZXJsYXBzIHdpdGguIFNlZSBjb25zdGFudHMgZGVmaW5lZFxyXG4gICAgICAgICAgICAgKiBhYm92ZS4gVGhlIGNhbGxiYWNrIGlzIGNhbGxlZCBmb3IgZXZlcnkgcmVnaW9uIHRoZSBpdGVtIG92ZXJsYXBzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZmluZE92ZXJsYXBwaW5nTm9kZXMgOiBmdW5jdGlvbiAoaXRlbSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnggPCB4ICsgKHcgLyAyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgPCB5ICsgKGggLyAyKSkge1xyXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhUT1BfTEVGVCk7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSArIGl0ZW0uaCA+PSB5ICsgaCAvIDIpIHtcclxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soQk9UVE9NX0xFRlQpO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gcmlnaHRcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnggKyBpdGVtLncgPj0geCArICh3IC8gMikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55IDwgeSArIChoIC8gMikpIHtcclxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soVE9QX1JJR0hUKTtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55ICsgaXRlbS5oID49IHkgKyBoIC8gMikge1xyXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhCT1RUT01fUklHSFQpO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIERpdmlkZXMgdGhlIGN1cnJlbnQgbm9kZSBpbnRvIGZvdXIgc3Vibm9kZXMgYW5kIGFkZHMgdGhlbVxyXG4gICAgICAgICAgICAgKiB0byB0aGUgbm9kZXMgYXJyYXkgb2YgdGhlIGN1cnJlbnQgbm9kZS4gVGhlbiByZWluc2VydHMgYWxsXHJcbiAgICAgICAgICAgICAqIGNoaWxkcmVuLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZGl2aWRlIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQsIGksIG9sZENoaWxkcmVuO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuRGVwdGggPSB0aGlzLmRlcHRoICsgMTtcclxuICAgICAgICAgICAgICAgIC8vIHNldCBkaW1lbnNpb25zIG9mIHRoZSBuZXcgbm9kZXNcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gKHcgLyAyKTtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IChoIC8gMik7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdG9wIGxlZnQgbm9kZVxyXG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKHRoaXMueCwgdGhpcy55LCB3aWR0aCwgaGVpZ2h0LCBjaGlsZHJlbkRlcHRoLCBtYXhDaGlsZHJlbiwgbWF4RGVwdGgpKTtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0b3AgcmlnaHQgbm9kZVxyXG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKHRoaXMueCArIHdpZHRoLCB0aGlzLnksIHdpZHRoLCBoZWlnaHQsIGNoaWxkcmVuRGVwdGgsIG1heENoaWxkcmVuLCBtYXhEZXB0aCkpO1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGJvdHRvbSBsZWZ0IG5vZGVcclxuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSh0aGlzLngsIHRoaXMueSArIGhlaWdodCwgd2lkdGgsIGhlaWdodCwgY2hpbGRyZW5EZXB0aCwgbWF4Q2hpbGRyZW4sIG1heERlcHRoKSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYm90dG9tIHJpZ2h0IG5vZGVcclxuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSh0aGlzLnggKyB3aWR0aCwgdGhpcy55ICsgaGVpZ2h0LCB3aWR0aCwgaGVpZ2h0LCBjaGlsZHJlbkRlcHRoLCBtYXhDaGlsZHJlbiwgbWF4RGVwdGgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBvbGRDaGlsZHJlbiA9IGl0ZW1zO1xyXG4gICAgICAgICAgICAgICAgaXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBvbGRDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KG9sZENoaWxkcmVuW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBDbGVhcnMgdGhlIG5vZGUgYW5kIGFsbCBpdHMgc3Vibm9kZXMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBjbGVhciA6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHR2YXIgaTtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0bm9kZXNbaV0uY2xlYXIoKTtcclxuXHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICBpdGVtcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgbm9kZXMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIGNvbnZlbmllbmNlIG1ldGhvZDogaXMgbm90IHVzZWQgaW4gdGhlIGNvcmUgYWxnb3JpdGhtLlxyXG4gICAgICAgICAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICAgICAgICogcmV0dXJucyB0aGlzIG5vZGVzIHN1Ym5vZGVzLiB0aGlzIGlzIHVzZnVsIGlmIHdlIHdhbnQgdG8gZG8gc3R1ZmZcclxuICAgICAgICAgICAgICogd2l0aCB0aGUgbm9kZXMsIGkuZS4gYWNjZXNzaW5nIHRoZSBib3VuZHMgb2YgdGhlIG5vZGVzIHRvIGRyYXcgdGhlbVxyXG4gICAgICAgICAgICAgKiBvbiBhIGNhbnZhcyBmb3IgZGVidWdnaW5nIGV0Yy4uLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZ2V0Tm9kZXMgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZXMubGVuZ3RoID8gbm9kZXMgOiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgIHJvb3QgOiAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZShhcmdzLngsIGFyZ3MueSwgYXJncy53LCBhcmdzLmgsIDAsIGFyZ3MubWF4Q2hpbGRyZW4sIGFyZ3MubWF4RGVwdGgpO1xyXG4gICAgICAgIH0oKSksXHJcblxyXG4gICAgICAgIGluc2VydCA6IGZ1bmN0aW9uIChpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgbGVuLCBpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgbGVuID0gaXRlbS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvb3QuaW5zZXJ0KGl0ZW1baV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5pbnNlcnQoaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICByZXRyaWV2ZSA6IGZ1bmN0aW9uIChzZWxlY3RvciwgY2FsbGJhY2ssIGluc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvb3QucmV0cmlldmUoc2VsZWN0b3IsIGNhbGxiYWNrLCBpbnN0YW5jZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY2xlYXIgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdC5jbGVhcigpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFFVQUQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cblxuXG4vKiogRGVwcmVjYXRlZCAtICBkb24ndCB1c2UgKi9cblxuXG5cbnZhciB0ciA9IGZ1bmN0aW9uIChvcmlnaW5hbCxrZXksdmFsdWVzKSB7XG4gIGlmICgha2V5KSB7XG4gICAga2V5ID0gb3JpZ2luYWwudG9Mb3dlckNhc2UoKS50cmltKCkucmVwbGFjZShcIiBcIiwgXCJfXCIpO1xuICB9XG4gIHZhciB0cmFuc2xhdGVkO1xuICAvLyBwcmV2ZW50IHRocm93aW5nIGV4Y2VwdGlvbiBvbiB3cm9uZyBzcHJpbnRmIGZvcm1hdFxuICB0cnkge1xuICAgIHRyYW5zbGF0ZWQgPSAkLnQoJ2Zvcm1fc2VhcmNoLicra2V5LCB7cG9zdFByb2Nlc3M6ICdzcHJpbnRmJywgc3ByaW50ZjogdmFsdWVzfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0cmFuc2xhdGVkID0gb3JpZ2luYWw7XG4gIH1cbiAgLy9Ob3QgbmljZSwgVE9ETyBtYWtlIHNvbWUgYmV0dGVyIHNvbHV0aW9uIGhvdyB0byBwaWNrIHByZWZpeCBhbmQgZmFsbGJhY2sgdG8gY29tbW9uXG4gIGlmICh0cmFuc2xhdGVkID09ICdmb3JtX3NlYXJjaC4nK2tleSkge1xuICAgIHRyeSB7XG4gICAgICB0cmFuc2xhdGVkID0gJC50KCdjb21tb24uJytrZXksIHtwb3N0UHJvY2VzczogJ3NwcmludGYnLCBzcHJpbnRmOiB2YWx1ZXN9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0cmFuc2xhdGVkID0gb3JpZ2luYWw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRyYW5zbGF0ZWRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdHI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogYWRhcHRlciB0byB0cmFuc2xhdGUgYnkgb25lIG9mIGNob3NlbiBzdHJhdGVneSAqL1xuXG5cblxuLyoqIERlcHJlY2F0ZWQgLSAgZG9uJ3QgdXNlICovXG5cblxuXG52YXIgc2V0dXBEb2MgPSB7XG4gIFwiZ2V0VHJhbnNsYXRpb25zXCI6IFwidG8gZ2V0IHRleHQgd2hpY2ggYXJlIG5vdCB0cmFuc2xhdGVkIG9uIGN1cnJlbnQgcGFnZSwgdGFrZSBjb25zb2xlLmxvZyh3aW5kb3cudG9UcmFuc2xhdGUpXCIsXG4gIFwic2V0dXBTdHJhdGVneVwiOiBcIml0IGlzIG5lY2Vzc2FyeSBzZXQgc3RyYXRlZ3kgaW4gcm9vdCBvZiBidW5kbGVcIlxufTtcblxudmFyIHN0cmF0ZWd5ID0gbnVsbDtcblxuXG5cbnZhciB0ciA9IGZ1bmN0aW9uIChvcmlnaW5hbCwga2V5LCB2YWx1ZXMsIG5hbWVzcGFjZSkge1xuICBpZiAoIXN0cmF0ZWd5KSB7XG4gICAgY29uc29sZS5lcnJvcihcIlRyYW5zbGF0aW9uIHN0cmF0ZWd5IGlzIG5vdCBzZXRcXG4gXCIrc2V0dXBEb2NbXCJzZXR1cFN0cmF0ZWd5XCJdKTtcbiAgICByZXR1cm4gb3JpZ2luYWw7XG4gIH1cbiAgcmV0dXJuIHN0cmF0ZWd5KG9yaWdpbmFsLCBrZXksIHZhbHVlcywgbmFtZXNwYWNlKTtcbn07XG5cbnRyLnNldFN0cmF0ZWd5ID0gZnVuY3Rpb24gKG5ld1N0cmF0ZWd5KSB7XG4gIHN0cmF0ZWd5ID0gbmV3U3RyYXRlZ3k7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vTmljZXIgd3JhcHBlciBvZiBza3lwaWNrZXIncyB0cmFuc2xhdGVcblxudmFyIHRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChrZXksdmFsdWVzLGRlZmF1bHRTaG93KSB7XG4gIHZhciB0cmFuc2xhdGVkO1xuICAvLyBwcmV2ZW50IHRocm93aW5nIGV4Y2VwdGlvbiBvbiB3cm9uZyBzcHJpbnRmIGZvcm1hdFxuICB0cnkge1xuICAgIHRyYW5zbGF0ZWQgPSAkLnQoa2V5LCB2YWx1ZXMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdHJhbnNsYXRlZCA9IGRlZmF1bHRTaG93O1xuICB9XG4gIGlmICghdHJhbnNsYXRlZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJ0cmFuc2xhdGlvbiBpcyBtaXNzaW5nXCIpO1xuICAgIHJldHVybiBkZWZhdWx0U2hvdztcbiAgfVxuXG4gIHJldHVybiB0cmFuc2xhdGVkXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYW5zbGF0ZTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2UgKHRhcmdldCwgc3JjKSB7XG4gICAgdmFyIGFycmF5ID0gQXJyYXkuaXNBcnJheShzcmMpXG4gICAgdmFyIGRzdCA9IGFycmF5ICYmIFtdIHx8IHt9XG5cbiAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IFtdXG4gICAgICAgIGRzdCA9IGRzdC5jb25jYXQodGFyZ2V0KVxuICAgICAgICBzcmMuZm9yRWFjaChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRhcmdldFtpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkc3RbaV0gPSBlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGRzdFtpXSA9IG1lcmdlKHRhcmdldFtpXSwgZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKGUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBkc3QucHVzaChlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgIGRzdFtrZXldID0gdGFyZ2V0W2tleV1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmtleXMoc3JjKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3JjW2tleV0gIT09ICdvYmplY3QnIHx8ICFzcmNba2V5XSkge1xuICAgICAgICAgICAgICAgIGRzdFtrZXldID0gc3JjW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0W2tleV0gPSBzcmNba2V5XVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRzdFtrZXldID0gbWVyZ2UodGFyZ2V0W2tleV0sIHNyY1trZXldKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gZHN0XG59XG4iLCIvKipcbiAqICBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiAgVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiAgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiAgb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgZ2xvYmFsLkltbXV0YWJsZSA9IGZhY3RvcnkoKVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0Jzt2YXIgU0xJQ0UkMCA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuICBmdW5jdGlvbiBjcmVhdGVDbGFzcyhjdG9yLCBzdXBlckNsYXNzKSB7XG4gICAgaWYgKHN1cGVyQ2xhc3MpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzLnByb3RvdHlwZSk7XG4gICAgfVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvcjtcbiAgfVxuXG4gIC8vIFVzZWQgZm9yIHNldHRpbmcgcHJvdG90eXBlIG1ldGhvZHMgdGhhdCBJRTggY2hva2VzIG9uLlxuICB2YXIgREVMRVRFID0gJ2RlbGV0ZSc7XG5cbiAgLy8gQ29uc3RhbnRzIGRlc2NyaWJpbmcgdGhlIHNpemUgb2YgdHJpZSBub2Rlcy5cbiAgdmFyIFNISUZUID0gNTsgLy8gUmVzdWx0ZWQgaW4gYmVzdCBwZXJmb3JtYW5jZSBhZnRlciBfX19fX18/XG4gIHZhciBTSVpFID0gMSA8PCBTSElGVDtcbiAgdmFyIE1BU0sgPSBTSVpFIC0gMTtcblxuICAvLyBBIGNvbnNpc3RlbnQgc2hhcmVkIHZhbHVlIHJlcHJlc2VudGluZyBcIm5vdCBzZXRcIiB3aGljaCBlcXVhbHMgbm90aGluZyBvdGhlclxuICAvLyB0aGFuIGl0c2VsZiwgYW5kIG5vdGhpbmcgdGhhdCBjb3VsZCBiZSBwcm92aWRlZCBleHRlcm5hbGx5LlxuICB2YXIgTk9UX1NFVCA9IHt9O1xuXG4gIC8vIEJvb2xlYW4gcmVmZXJlbmNlcywgUm91Z2ggZXF1aXZhbGVudCBvZiBgYm9vbCAmYC5cbiAgdmFyIENIQU5HRV9MRU5HVEggPSB7IHZhbHVlOiBmYWxzZSB9O1xuICB2YXIgRElEX0FMVEVSID0geyB2YWx1ZTogZmFsc2UgfTtcblxuICBmdW5jdGlvbiBNYWtlUmVmKHJlZikge1xuICAgIHJlZi52YWx1ZSA9IGZhbHNlO1xuICAgIHJldHVybiByZWY7XG4gIH1cblxuICBmdW5jdGlvbiBTZXRSZWYocmVmKSB7XG4gICAgcmVmICYmIChyZWYudmFsdWUgPSB0cnVlKTtcbiAgfVxuXG4gIC8vIEEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHZhbHVlIHJlcHJlc2VudGluZyBhbiBcIm93bmVyXCIgZm9yIHRyYW5zaWVudCB3cml0ZXNcbiAgLy8gdG8gdHJpZXMuIFRoZSByZXR1cm4gdmFsdWUgd2lsbCBvbmx5IGV2ZXIgZXF1YWwgaXRzZWxmLCBhbmQgd2lsbCBub3QgZXF1YWxcbiAgLy8gdGhlIHJldHVybiBvZiBhbnkgc3Vic2VxdWVudCBjYWxsIG9mIHRoaXMgZnVuY3Rpb24uXG4gIGZ1bmN0aW9uIE93bmVySUQoKSB7fVxuXG4gIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2NvcHktYXJyYXktaW5saW5lXG4gIGZ1bmN0aW9uIGFyckNvcHkoYXJyLCBvZmZzZXQpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcbiAgICB2YXIgbGVuID0gTWF0aC5tYXgoMCwgYXJyLmxlbmd0aCAtIG9mZnNldCk7XG4gICAgdmFyIG5ld0FyciA9IG5ldyBBcnJheShsZW4pO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBsZW47IGlpKyspIHtcbiAgICAgIG5ld0FycltpaV0gPSBhcnJbaWkgKyBvZmZzZXRdO1xuICAgIH1cbiAgICByZXR1cm4gbmV3QXJyO1xuICB9XG5cbiAgZnVuY3Rpb24gZW5zdXJlU2l6ZShpdGVyKSB7XG4gICAgaWYgKGl0ZXIuc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyLnNpemUgPSBpdGVyLl9faXRlcmF0ZShyZXR1cm5UcnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZXIuc2l6ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXBJbmRleChpdGVyLCBpbmRleCkge1xuICAgIHJldHVybiBpbmRleCA+PSAwID8gKCtpbmRleCkgOiBlbnN1cmVTaXplKGl0ZXIpICsgKCtpbmRleCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXR1cm5UcnVlKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gd2hvbGVTbGljZShiZWdpbiwgZW5kLCBzaXplKSB7XG4gICAgcmV0dXJuIChiZWdpbiA9PT0gMCB8fCAoc2l6ZSAhPT0gdW5kZWZpbmVkICYmIGJlZ2luIDw9IC1zaXplKSkgJiZcbiAgICAgIChlbmQgPT09IHVuZGVmaW5lZCB8fCAoc2l6ZSAhPT0gdW5kZWZpbmVkICYmIGVuZCA+PSBzaXplKSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlQmVnaW4oYmVnaW4sIHNpemUpIHtcbiAgICByZXR1cm4gcmVzb2x2ZUluZGV4KGJlZ2luLCBzaXplLCAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVFbmQoZW5kLCBzaXplKSB7XG4gICAgcmV0dXJuIHJlc29sdmVJbmRleChlbmQsIHNpemUsIHNpemUpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZUluZGV4KGluZGV4LCBzaXplLCBkZWZhdWx0SW5kZXgpIHtcbiAgICByZXR1cm4gaW5kZXggPT09IHVuZGVmaW5lZCA/XG4gICAgICBkZWZhdWx0SW5kZXggOlxuICAgICAgaW5kZXggPCAwID9cbiAgICAgICAgTWF0aC5tYXgoMCwgc2l6ZSArIGluZGV4KSA6XG4gICAgICAgIHNpemUgPT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgaW5kZXggOlxuICAgICAgICAgIE1hdGgubWluKHNpemUsIGluZGV4KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gaXNJdGVyYWJsZSh2YWx1ZSkgPyB2YWx1ZSA6IFNlcSh2YWx1ZSk7XG4gICAgfVxuXG5cbiAgY3JlYXRlQ2xhc3MoS2V5ZWRJdGVyYWJsZSwgSXRlcmFibGUpO1xuICAgIGZ1bmN0aW9uIEtleWVkSXRlcmFibGUodmFsdWUpIHtcbiAgICAgIHJldHVybiBpc0tleWVkKHZhbHVlKSA/IHZhbHVlIDogS2V5ZWRTZXEodmFsdWUpO1xuICAgIH1cblxuXG4gIGNyZWF0ZUNsYXNzKEluZGV4ZWRJdGVyYWJsZSwgSXRlcmFibGUpO1xuICAgIGZ1bmN0aW9uIEluZGV4ZWRJdGVyYWJsZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGlzSW5kZXhlZCh2YWx1ZSkgPyB2YWx1ZSA6IEluZGV4ZWRTZXEodmFsdWUpO1xuICAgIH1cblxuXG4gIGNyZWF0ZUNsYXNzKFNldEl0ZXJhYmxlLCBJdGVyYWJsZSk7XG4gICAgZnVuY3Rpb24gU2V0SXRlcmFibGUodmFsdWUpIHtcbiAgICAgIHJldHVybiBpc0l0ZXJhYmxlKHZhbHVlKSAmJiAhaXNBc3NvY2lhdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IFNldFNlcSh2YWx1ZSk7XG4gICAgfVxuXG5cblxuICBmdW5jdGlvbiBpc0l0ZXJhYmxlKG1heWJlSXRlcmFibGUpIHtcbiAgICByZXR1cm4gISEobWF5YmVJdGVyYWJsZSAmJiBtYXliZUl0ZXJhYmxlW0lTX0lURVJBQkxFX1NFTlRJTkVMXSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0tleWVkKG1heWJlS2V5ZWQpIHtcbiAgICByZXR1cm4gISEobWF5YmVLZXllZCAmJiBtYXliZUtleWVkW0lTX0tFWUVEX1NFTlRJTkVMXSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0luZGV4ZWQobWF5YmVJbmRleGVkKSB7XG4gICAgcmV0dXJuICEhKG1heWJlSW5kZXhlZCAmJiBtYXliZUluZGV4ZWRbSVNfSU5ERVhFRF9TRU5USU5FTF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNBc3NvY2lhdGl2ZShtYXliZUFzc29jaWF0aXZlKSB7XG4gICAgcmV0dXJuIGlzS2V5ZWQobWF5YmVBc3NvY2lhdGl2ZSkgfHwgaXNJbmRleGVkKG1heWJlQXNzb2NpYXRpdmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNPcmRlcmVkKG1heWJlT3JkZXJlZCkge1xuICAgIHJldHVybiAhIShtYXliZU9yZGVyZWQgJiYgbWF5YmVPcmRlcmVkW0lTX09SREVSRURfU0VOVElORUxdKTtcbiAgfVxuXG4gIEl0ZXJhYmxlLmlzSXRlcmFibGUgPSBpc0l0ZXJhYmxlO1xuICBJdGVyYWJsZS5pc0tleWVkID0gaXNLZXllZDtcbiAgSXRlcmFibGUuaXNJbmRleGVkID0gaXNJbmRleGVkO1xuICBJdGVyYWJsZS5pc0Fzc29jaWF0aXZlID0gaXNBc3NvY2lhdGl2ZTtcbiAgSXRlcmFibGUuaXNPcmRlcmVkID0gaXNPcmRlcmVkO1xuXG4gIEl0ZXJhYmxlLktleWVkID0gS2V5ZWRJdGVyYWJsZTtcbiAgSXRlcmFibGUuSW5kZXhlZCA9IEluZGV4ZWRJdGVyYWJsZTtcbiAgSXRlcmFibGUuU2V0ID0gU2V0SXRlcmFibGU7XG5cblxuICB2YXIgSVNfSVRFUkFCTEVfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9JVEVSQUJMRV9fQEAnO1xuICB2YXIgSVNfS0VZRURfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9LRVlFRF9fQEAnO1xuICB2YXIgSVNfSU5ERVhFRF9TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX0lOREVYRURfX0BAJztcbiAgdmFyIElTX09SREVSRURfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9PUkRFUkVEX19AQCc7XG5cbiAgLyogZ2xvYmFsIFN5bWJvbCAqL1xuXG4gIHZhciBJVEVSQVRFX0tFWVMgPSAwO1xuICB2YXIgSVRFUkFURV9WQUxVRVMgPSAxO1xuICB2YXIgSVRFUkFURV9FTlRSSUVTID0gMjtcblxuICB2YXIgUkVBTF9JVEVSQVRPUl9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIFN5bWJvbC5pdGVyYXRvcjtcbiAgdmFyIEZBVVhfSVRFUkFUT1JfU1lNQk9MID0gJ0BAaXRlcmF0b3InO1xuXG4gIHZhciBJVEVSQVRPUl9TWU1CT0wgPSBSRUFMX0lURVJBVE9SX1NZTUJPTCB8fCBGQVVYX0lURVJBVE9SX1NZTUJPTDtcblxuXG4gIGZ1bmN0aW9uIEl0ZXJhdG9yKG5leHQpIHtcbiAgICAgIHRoaXMubmV4dCA9IG5leHQ7XG4gICAgfVxuXG4gICAgSXRlcmF0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gJ1tJdGVyYXRvcl0nO1xuICAgIH07XG5cblxuICBJdGVyYXRvci5LRVlTID0gSVRFUkFURV9LRVlTO1xuICBJdGVyYXRvci5WQUxVRVMgPSBJVEVSQVRFX1ZBTFVFUztcbiAgSXRlcmF0b3IuRU5UUklFUyA9IElURVJBVEVfRU5UUklFUztcblxuICBJdGVyYXRvci5wcm90b3R5cGUuaW5zcGVjdCA9XG4gIEl0ZXJhdG9yLnByb3RvdHlwZS50b1NvdXJjZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTsgfVxuICBJdGVyYXRvci5wcm90b3R5cGVbSVRFUkFUT1JfU1lNQk9MXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGl0ZXJhdG9yVmFsdWUodHlwZSwgaywgdiwgaXRlcmF0b3JSZXN1bHQpIHtcbiAgICB2YXIgdmFsdWUgPSB0eXBlID09PSAwID8gayA6IHR5cGUgPT09IDEgPyB2IDogW2ssIHZdO1xuICAgIGl0ZXJhdG9yUmVzdWx0ID8gKGl0ZXJhdG9yUmVzdWx0LnZhbHVlID0gdmFsdWUpIDogKGl0ZXJhdG9yUmVzdWx0ID0ge1xuICAgICAgdmFsdWU6IHZhbHVlLCBkb25lOiBmYWxzZVxuICAgIH0pO1xuICAgIHJldHVybiBpdGVyYXRvclJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRG9uZSgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBmdW5jdGlvbiBoYXNJdGVyYXRvcihtYXliZUl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuICEhZ2V0SXRlcmF0b3JGbihtYXliZUl0ZXJhYmxlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSXRlcmF0b3IobWF5YmVJdGVyYXRvcikge1xuICAgIHJldHVybiBtYXliZUl0ZXJhdG9yICYmIHR5cGVvZiBtYXliZUl0ZXJhdG9yLm5leHQgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRJdGVyYXRvcihpdGVyYWJsZSkge1xuICAgIHZhciBpdGVyYXRvckZuID0gZ2V0SXRlcmF0b3JGbihpdGVyYWJsZSk7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm4gJiYgaXRlcmF0b3JGbi5jYWxsKGl0ZXJhYmxlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEl0ZXJhdG9yRm4oaXRlcmFibGUpIHtcbiAgICB2YXIgaXRlcmF0b3JGbiA9IGl0ZXJhYmxlICYmIChcbiAgICAgIChSRUFMX0lURVJBVE9SX1NZTUJPTCAmJiBpdGVyYWJsZVtSRUFMX0lURVJBVE9SX1NZTUJPTF0pIHx8XG4gICAgICBpdGVyYWJsZVtGQVVYX0lURVJBVE9SX1NZTUJPTF1cbiAgICApO1xuICAgIGlmICh0eXBlb2YgaXRlcmF0b3JGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGl0ZXJhdG9yRm47XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PT0gJ251bWJlcic7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhTZXEsIEl0ZXJhYmxlKTtcbiAgICBmdW5jdGlvbiBTZXEodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZW1wdHlTZXF1ZW5jZSgpIDpcbiAgICAgICAgaXNJdGVyYWJsZSh2YWx1ZSkgPyB2YWx1ZS50b1NlcSgpIDogc2VxRnJvbVZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICBTZXEub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gU2VxKGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFNlcS5wcm90b3R5cGUudG9TZXEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBTZXEucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKCdTZXEgeycsICd9Jyk7XG4gICAgfTtcblxuICAgIFNlcS5wcm90b3R5cGUuY2FjaGVSZXN1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5fY2FjaGUgJiYgdGhpcy5fX2l0ZXJhdGVVbmNhY2hlZCkge1xuICAgICAgICB0aGlzLl9jYWNoZSA9IHRoaXMuZW50cnlTZXEoKS50b0FycmF5KCk7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuX2NhY2hlLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvLyBhYnN0cmFjdCBfX2l0ZXJhdGVVbmNhY2hlZChmbiwgcmV2ZXJzZSlcblxuICAgIFNlcS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIHJldHVybiBzZXFJdGVyYXRlKHRoaXMsIGZuLCByZXZlcnNlLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgLy8gYWJzdHJhY3QgX19pdGVyYXRvclVuY2FjaGVkKHR5cGUsIHJldmVyc2UpXG5cbiAgICBTZXEucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICByZXR1cm4gc2VxSXRlcmF0b3IodGhpcywgdHlwZSwgcmV2ZXJzZSwgdHJ1ZSk7XG4gICAgfTtcblxuXG5cbiAgY3JlYXRlQ2xhc3MoS2V5ZWRTZXEsIFNlcSk7XG4gICAgZnVuY3Rpb24gS2V5ZWRTZXEodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID9cbiAgICAgICAgZW1wdHlTZXF1ZW5jZSgpLnRvS2V5ZWRTZXEoKSA6XG4gICAgICAgIGlzSXRlcmFibGUodmFsdWUpID9cbiAgICAgICAgICAoaXNLZXllZCh2YWx1ZSkgPyB2YWx1ZS50b1NlcSgpIDogdmFsdWUuZnJvbUVudHJ5U2VxKCkpIDpcbiAgICAgICAgICBrZXllZFNlcUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgS2V5ZWRTZXEub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gS2V5ZWRTZXEoYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgS2V5ZWRTZXEucHJvdG90eXBlLnRvS2V5ZWRTZXEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBLZXllZFNlcS5wcm90b3R5cGUudG9TZXEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cblxuXG4gIGNyZWF0ZUNsYXNzKEluZGV4ZWRTZXEsIFNlcSk7XG4gICAgZnVuY3Rpb24gSW5kZXhlZFNlcSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyBlbXB0eVNlcXVlbmNlKCkgOlxuICAgICAgICAhaXNJdGVyYWJsZSh2YWx1ZSkgPyBpbmRleGVkU2VxRnJvbVZhbHVlKHZhbHVlKSA6XG4gICAgICAgIGlzS2V5ZWQodmFsdWUpID8gdmFsdWUuZW50cnlTZXEoKSA6IHZhbHVlLnRvSW5kZXhlZFNlcSgpO1xuICAgIH1cblxuICAgIEluZGV4ZWRTZXEub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gSW5kZXhlZFNlcShhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBJbmRleGVkU2VxLnByb3RvdHlwZS50b0luZGV4ZWRTZXEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBJbmRleGVkU2VxLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnU2VxIFsnLCAnXScpO1xuICAgIH07XG5cbiAgICBJbmRleGVkU2VxLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHNlcUl0ZXJhdGUodGhpcywgZm4sIHJldmVyc2UsIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgSW5kZXhlZFNlcS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHJldHVybiBzZXFJdGVyYXRvcih0aGlzLCB0eXBlLCByZXZlcnNlLCBmYWxzZSk7XG4gICAgfTtcblxuXG5cbiAgY3JlYXRlQ2xhc3MoU2V0U2VxLCBTZXEpO1xuICAgIGZ1bmN0aW9uIFNldFNlcSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGVtcHR5U2VxdWVuY2UoKSA6XG4gICAgICAgICFpc0l0ZXJhYmxlKHZhbHVlKSA/IGluZGV4ZWRTZXFGcm9tVmFsdWUodmFsdWUpIDpcbiAgICAgICAgaXNLZXllZCh2YWx1ZSkgPyB2YWx1ZS5lbnRyeVNlcSgpIDogdmFsdWVcbiAgICAgICkudG9TZXRTZXEoKTtcbiAgICB9XG5cbiAgICBTZXRTZXEub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gU2V0U2VxKGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFNldFNlcS5wcm90b3R5cGUudG9TZXRTZXEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cblxuXG4gIFNlcS5pc1NlcSA9IGlzU2VxO1xuICBTZXEuS2V5ZWQgPSBLZXllZFNlcTtcbiAgU2VxLlNldCA9IFNldFNlcTtcbiAgU2VxLkluZGV4ZWQgPSBJbmRleGVkU2VxO1xuXG4gIHZhciBJU19TRVFfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9TRVFfX0BAJztcblxuICBTZXEucHJvdG90eXBlW0lTX1NFUV9TRU5USU5FTF0gPSB0cnVlO1xuXG5cblxuICAvLyAjcHJhZ21hIFJvb3QgU2VxdWVuY2VzXG5cbiAgY3JlYXRlQ2xhc3MoQXJyYXlTZXEsIEluZGV4ZWRTZXEpO1xuICAgIGZ1bmN0aW9uIEFycmF5U2VxKGFycmF5KSB7XG4gICAgICB0aGlzLl9hcnJheSA9IGFycmF5O1xuICAgICAgdGhpcy5zaXplID0gYXJyYXkubGVuZ3RoO1xuICAgIH1cblxuICAgIEFycmF5U2VxLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhcyhpbmRleCkgPyB0aGlzLl9hcnJheVt3cmFwSW5kZXgodGhpcywgaW5kZXgpXSA6IG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICBBcnJheVNlcS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIHZhciBhcnJheSA9IHRoaXMuX2FycmF5O1xuICAgICAgdmFyIG1heEluZGV4ID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPD0gbWF4SW5kZXg7IGlpKyspIHtcbiAgICAgICAgaWYgKGZuKGFycmF5W3JldmVyc2UgPyBtYXhJbmRleCAtIGlpIDogaWldLCBpaSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGlpICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGlpO1xuICAgIH07XG5cbiAgICBBcnJheVNlcS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBhcnJheSA9IHRoaXMuX2FycmF5O1xuICAgICAgdmFyIG1heEluZGV4ID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBpaSA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgXG4gICAgICAgIHtyZXR1cm4gaWkgPiBtYXhJbmRleCA/XG4gICAgICAgICAgaXRlcmF0b3JEb25lKCkgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgaWksIGFycmF5W3JldmVyc2UgPyBtYXhJbmRleCAtIGlpKysgOiBpaSsrXSl9XG4gICAgICApO1xuICAgIH07XG5cblxuXG4gIGNyZWF0ZUNsYXNzKE9iamVjdFNlcSwgS2V5ZWRTZXEpO1xuICAgIGZ1bmN0aW9uIE9iamVjdFNlcShvYmplY3QpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgICAgIHRoaXMuX29iamVjdCA9IG9iamVjdDtcbiAgICAgIHRoaXMuX2tleXMgPSBrZXlzO1xuICAgICAgdGhpcy5zaXplID0ga2V5cy5sZW5ndGg7XG4gICAgfVxuXG4gICAgT2JqZWN0U2VxLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXksIG5vdFNldFZhbHVlKSB7XG4gICAgICBpZiAobm90U2V0VmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5oYXMoa2V5KSkge1xuICAgICAgICByZXR1cm4gbm90U2V0VmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fb2JqZWN0W2tleV07XG4gICAgfTtcblxuICAgIE9iamVjdFNlcS5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5fb2JqZWN0Lmhhc093blByb3BlcnR5KGtleSk7XG4gICAgfTtcblxuICAgIE9iamVjdFNlcS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIHZhciBvYmplY3QgPSB0aGlzLl9vYmplY3Q7XG4gICAgICB2YXIga2V5cyA9IHRoaXMuX2tleXM7XG4gICAgICB2YXIgbWF4SW5kZXggPSBrZXlzLmxlbmd0aCAtIDE7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDw9IG1heEluZGV4OyBpaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzW3JldmVyc2UgPyBtYXhJbmRleCAtIGlpIDogaWldO1xuICAgICAgICBpZiAoZm4ob2JqZWN0W2tleV0sIGtleSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGlpICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGlpO1xuICAgIH07XG5cbiAgICBPYmplY3RTZXEucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgb2JqZWN0ID0gdGhpcy5fb2JqZWN0O1xuICAgICAgdmFyIGtleXMgPSB0aGlzLl9rZXlzO1xuICAgICAgdmFyIG1heEluZGV4ID0ga2V5cy5sZW5ndGggLSAxO1xuICAgICAgdmFyIGlpID0gMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tyZXZlcnNlID8gbWF4SW5kZXggLSBpaSA6IGlpXTtcbiAgICAgICAgcmV0dXJuIGlpKysgPiBtYXhJbmRleCA/XG4gICAgICAgICAgaXRlcmF0b3JEb25lKCkgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwga2V5LCBvYmplY3Rba2V5XSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gIE9iamVjdFNlcS5wcm90b3R5cGVbSVNfT1JERVJFRF9TRU5USU5FTF0gPSB0cnVlO1xuXG5cbiAgY3JlYXRlQ2xhc3MoSXRlcmFibGVTZXEsIEluZGV4ZWRTZXEpO1xuICAgIGZ1bmN0aW9uIEl0ZXJhYmxlU2VxKGl0ZXJhYmxlKSB7XG4gICAgICB0aGlzLl9pdGVyYWJsZSA9IGl0ZXJhYmxlO1xuICAgICAgdGhpcy5zaXplID0gaXRlcmFibGUubGVuZ3RoIHx8IGl0ZXJhYmxlLnNpemU7XG4gICAgfVxuXG4gICAgSXRlcmFibGVTZXEucHJvdG90eXBlLl9faXRlcmF0ZVVuY2FjaGVkID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRlKGZuLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYWJsZSA9IHRoaXMuX2l0ZXJhYmxlO1xuICAgICAgdmFyIGl0ZXJhdG9yID0gZ2V0SXRlcmF0b3IoaXRlcmFibGUpO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgaWYgKGlzSXRlcmF0b3IoaXRlcmF0b3IpKSB7XG4gICAgICAgIHZhciBzdGVwO1xuICAgICAgICB3aGlsZSAoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKSB7XG4gICAgICAgICAgaWYgKGZuKHN0ZXAudmFsdWUsIGl0ZXJhdGlvbnMrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH07XG5cbiAgICBJdGVyYWJsZVNlcS5wcm90b3R5cGUuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXJhYmxlID0gdGhpcy5faXRlcmFibGU7XG4gICAgICB2YXIgaXRlcmF0b3IgPSBnZXRJdGVyYXRvcihpdGVyYWJsZSk7XG4gICAgICBpZiAoIWlzSXRlcmF0b3IoaXRlcmF0b3IpKSB7XG4gICAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoaXRlcmF0b3JEb25lKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgcmV0dXJuIHN0ZXAuZG9uZSA/IHN0ZXAgOiBpdGVyYXRvclZhbHVlKHR5cGUsIGl0ZXJhdGlvbnMrKywgc3RlcC52YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG5cblxuICBjcmVhdGVDbGFzcyhJdGVyYXRvclNlcSwgSW5kZXhlZFNlcSk7XG4gICAgZnVuY3Rpb24gSXRlcmF0b3JTZXEoaXRlcmF0b3IpIHtcbiAgICAgIHRoaXMuX2l0ZXJhdG9yID0gaXRlcmF0b3I7XG4gICAgICB0aGlzLl9pdGVyYXRvckNhY2hlID0gW107XG4gICAgfVxuXG4gICAgSXRlcmF0b3JTZXEucHJvdG90eXBlLl9faXRlcmF0ZVVuY2FjaGVkID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRlKGZuLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX2l0ZXJhdG9yO1xuICAgICAgdmFyIGNhY2hlID0gdGhpcy5faXRlcmF0b3JDYWNoZTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHdoaWxlIChpdGVyYXRpb25zIDwgY2FjaGUubGVuZ3RoKSB7XG4gICAgICAgIGlmIChmbihjYWNoZVtpdGVyYXRpb25zXSwgaXRlcmF0aW9ucysrLCB0aGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHN0ZXA7XG4gICAgICB3aGlsZSAoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKSB7XG4gICAgICAgIHZhciB2YWwgPSBzdGVwLnZhbHVlO1xuICAgICAgICBjYWNoZVtpdGVyYXRpb25zXSA9IHZhbDtcbiAgICAgICAgaWYgKGZuKHZhbCwgaXRlcmF0aW9ucysrLCB0aGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfTtcblxuICAgIEl0ZXJhdG9yU2VxLnByb3RvdHlwZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLl9pdGVyYXRvcjtcbiAgICAgIHZhciBjYWNoZSA9IHRoaXMuX2l0ZXJhdG9yQ2FjaGU7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgaWYgKGl0ZXJhdGlvbnMgPj0gY2FjaGUubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhY2hlW2l0ZXJhdGlvbnNdID0gc3RlcC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zLCBjYWNoZVtpdGVyYXRpb25zKytdKTtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuXG5cbiAgLy8gIyBwcmFnbWEgSGVscGVyIGZ1bmN0aW9uc1xuXG4gIGZ1bmN0aW9uIGlzU2VxKG1heWJlU2VxKSB7XG4gICAgcmV0dXJuICEhKG1heWJlU2VxICYmIG1heWJlU2VxW0lTX1NFUV9TRU5USU5FTF0pO1xuICB9XG5cbiAgdmFyIEVNUFRZX1NFUTtcblxuICBmdW5jdGlvbiBlbXB0eVNlcXVlbmNlKCkge1xuICAgIHJldHVybiBFTVBUWV9TRVEgfHwgKEVNUFRZX1NFUSA9IG5ldyBBcnJheVNlcShbXSkpO1xuICB9XG5cbiAgZnVuY3Rpb24ga2V5ZWRTZXFGcm9tVmFsdWUodmFsdWUpIHtcbiAgICB2YXIgc2VxID1cbiAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gbmV3IEFycmF5U2VxKHZhbHVlKS5mcm9tRW50cnlTZXEoKSA6XG4gICAgICBpc0l0ZXJhdG9yKHZhbHVlKSA/IG5ldyBJdGVyYXRvclNlcSh2YWx1ZSkuZnJvbUVudHJ5U2VxKCkgOlxuICAgICAgaGFzSXRlcmF0b3IodmFsdWUpID8gbmV3IEl0ZXJhYmxlU2VxKHZhbHVlKS5mcm9tRW50cnlTZXEoKSA6XG4gICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnID8gbmV3IE9iamVjdFNlcSh2YWx1ZSkgOlxuICAgICAgdW5kZWZpbmVkO1xuICAgIGlmICghc2VxKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAnRXhwZWN0ZWQgQXJyYXkgb3IgaXRlcmFibGUgb2JqZWN0IG9mIFtrLCB2XSBlbnRyaWVzLCAnK1xuICAgICAgICAnb3Iga2V5ZWQgb2JqZWN0OiAnICsgdmFsdWVcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBzZXE7XG4gIH1cblxuICBmdW5jdGlvbiBpbmRleGVkU2VxRnJvbVZhbHVlKHZhbHVlKSB7XG4gICAgdmFyIHNlcSA9IG1heWJlSW5kZXhlZFNlcUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgaWYgKCFzZXEpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdFeHBlY3RlZCBBcnJheSBvciBpdGVyYWJsZSBvYmplY3Qgb2YgdmFsdWVzOiAnICsgdmFsdWVcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBzZXE7XG4gIH1cblxuICBmdW5jdGlvbiBzZXFGcm9tVmFsdWUodmFsdWUpIHtcbiAgICB2YXIgc2VxID0gbWF5YmVJbmRleGVkU2VxRnJvbVZhbHVlKHZhbHVlKSB8fFxuICAgICAgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgbmV3IE9iamVjdFNlcSh2YWx1ZSkpO1xuICAgIGlmICghc2VxKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAnRXhwZWN0ZWQgQXJyYXkgb3IgaXRlcmFibGUgb2JqZWN0IG9mIHZhbHVlcywgb3Iga2V5ZWQgb2JqZWN0OiAnICsgdmFsdWVcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBzZXE7XG4gIH1cblxuICBmdW5jdGlvbiBtYXliZUluZGV4ZWRTZXFGcm9tVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgaXNBcnJheUxpa2UodmFsdWUpID8gbmV3IEFycmF5U2VxKHZhbHVlKSA6XG4gICAgICBpc0l0ZXJhdG9yKHZhbHVlKSA/IG5ldyBJdGVyYXRvclNlcSh2YWx1ZSkgOlxuICAgICAgaGFzSXRlcmF0b3IodmFsdWUpID8gbmV3IEl0ZXJhYmxlU2VxKHZhbHVlKSA6XG4gICAgICB1bmRlZmluZWRcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VxSXRlcmF0ZShzZXEsIGZuLCByZXZlcnNlLCB1c2VLZXlzKSB7XG4gICAgdmFyIGNhY2hlID0gc2VxLl9jYWNoZTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIHZhciBtYXhJbmRleCA9IGNhY2hlLmxlbmd0aCAtIDE7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDw9IG1heEluZGV4OyBpaSsrKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IGNhY2hlW3JldmVyc2UgPyBtYXhJbmRleCAtIGlpIDogaWldO1xuICAgICAgICBpZiAoZm4oZW50cnlbMV0sIHVzZUtleXMgPyBlbnRyeVswXSA6IGlpLCBzZXEpID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybiBpaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpaTtcbiAgICB9XG4gICAgcmV0dXJuIHNlcS5fX2l0ZXJhdGVVbmNhY2hlZChmbiwgcmV2ZXJzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXFJdGVyYXRvcihzZXEsIHR5cGUsIHJldmVyc2UsIHVzZUtleXMpIHtcbiAgICB2YXIgY2FjaGUgPSBzZXEuX2NhY2hlO1xuICAgIGlmIChjYWNoZSkge1xuICAgICAgdmFyIG1heEluZGV4ID0gY2FjaGUubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBpaSA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gY2FjaGVbcmV2ZXJzZSA/IG1heEluZGV4IC0gaWkgOiBpaV07XG4gICAgICAgIHJldHVybiBpaSsrID4gbWF4SW5kZXggP1xuICAgICAgICAgIGl0ZXJhdG9yRG9uZSgpIDpcbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIHVzZUtleXMgPyBlbnRyeVswXSA6IGlpIC0gMSwgZW50cnlbMV0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBzZXEuX19pdGVyYXRvclVuY2FjaGVkKHR5cGUsIHJldmVyc2UpO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoQ29sbGVjdGlvbiwgSXRlcmFibGUpO1xuICAgIGZ1bmN0aW9uIENvbGxlY3Rpb24oKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ0Fic3RyYWN0Jyk7XG4gICAgfVxuXG5cbiAgY3JlYXRlQ2xhc3MoS2V5ZWRDb2xsZWN0aW9uLCBDb2xsZWN0aW9uKTtmdW5jdGlvbiBLZXllZENvbGxlY3Rpb24oKSB7fVxuXG4gIGNyZWF0ZUNsYXNzKEluZGV4ZWRDb2xsZWN0aW9uLCBDb2xsZWN0aW9uKTtmdW5jdGlvbiBJbmRleGVkQ29sbGVjdGlvbigpIHt9XG5cbiAgY3JlYXRlQ2xhc3MoU2V0Q29sbGVjdGlvbiwgQ29sbGVjdGlvbik7ZnVuY3Rpb24gU2V0Q29sbGVjdGlvbigpIHt9XG5cblxuICBDb2xsZWN0aW9uLktleWVkID0gS2V5ZWRDb2xsZWN0aW9uO1xuICBDb2xsZWN0aW9uLkluZGV4ZWQgPSBJbmRleGVkQ29sbGVjdGlvbjtcbiAgQ29sbGVjdGlvbi5TZXQgPSBTZXRDb2xsZWN0aW9uO1xuXG4gIC8qKlxuICAgKiBBbiBleHRlbnNpb24gb2YgdGhlIFwic2FtZS12YWx1ZVwiIGFsZ29yaXRobSBhcyBbZGVzY3JpYmVkIGZvciB1c2UgYnkgRVM2IE1hcFxuICAgKiBhbmQgU2V0XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXAjS2V5X2VxdWFsaXR5KVxuICAgKlxuICAgKiBOYU4gaXMgY29uc2lkZXJlZCB0aGUgc2FtZSBhcyBOYU4sIGhvd2V2ZXIgLTAgYW5kIDAgYXJlIGNvbnNpZGVyZWQgdGhlIHNhbWVcbiAgICogdmFsdWUsIHdoaWNoIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBhbGdvcml0aG0gZGVzY3JpYmVkIGJ5XG4gICAqIFtgT2JqZWN0LmlzYF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2lzKS5cbiAgICpcbiAgICogVGhpcyBpcyBleHRlbmRlZCBmdXJ0aGVyIHRvIGFsbG93IE9iamVjdHMgdG8gZGVzY3JpYmUgdGhlIHZhbHVlcyB0aGV5XG4gICAqIHJlcHJlc2VudCwgYnkgd2F5IG9mIGB2YWx1ZU9mYCBvciBgZXF1YWxzYCAoYW5kIGBoYXNoQ29kZWApLlxuICAgKlxuICAgKiBOb3RlOiBiZWNhdXNlIG9mIHRoaXMgZXh0ZW5zaW9uLCB0aGUga2V5IGVxdWFsaXR5IG9mIEltbXV0YWJsZS5NYXAgYW5kIHRoZVxuICAgKiB2YWx1ZSBlcXVhbGl0eSBvZiBJbW11dGFibGUuU2V0IHdpbGwgZGlmZmVyIGZyb20gRVM2IE1hcCBhbmQgU2V0LlxuICAgKlxuICAgKiAjIyMgRGVmaW5pbmcgY3VzdG9tIHZhbHVlc1xuICAgKlxuICAgKiBUaGUgZWFzaWVzdCB3YXkgdG8gZGVzY3JpYmUgdGhlIHZhbHVlIGFuIG9iamVjdCByZXByZXNlbnRzIGlzIGJ5IGltcGxlbWVudGluZ1xuICAgKiBgdmFsdWVPZmAuIEZvciBleGFtcGxlLCBgRGF0ZWAgcmVwcmVzZW50cyBhIHZhbHVlIGJ5IHJldHVybmluZyBhIHVuaXhcbiAgICogdGltZXN0YW1wIGZvciBgdmFsdWVPZmA6XG4gICAqXG4gICAqICAgICB2YXIgZGF0ZTEgPSBuZXcgRGF0ZSgxMjM0NTY3ODkwMDAwKTsgLy8gRnJpIEZlYiAxMyAyMDA5IC4uLlxuICAgKiAgICAgdmFyIGRhdGUyID0gbmV3IERhdGUoMTIzNDU2Nzg5MDAwMCk7XG4gICAqICAgICBkYXRlMS52YWx1ZU9mKCk7IC8vIDEyMzQ1Njc4OTAwMDBcbiAgICogICAgIGFzc2VydCggZGF0ZTEgIT09IGRhdGUyICk7XG4gICAqICAgICBhc3NlcnQoIEltbXV0YWJsZS5pcyggZGF0ZTEsIGRhdGUyICkgKTtcbiAgICpcbiAgICogTm90ZTogb3ZlcnJpZGluZyBgdmFsdWVPZmAgbWF5IGhhdmUgb3RoZXIgaW1wbGljYXRpb25zIGlmIHlvdSB1c2UgdGhpcyBvYmplY3RcbiAgICogd2hlcmUgSmF2YVNjcmlwdCBleHBlY3RzIGEgcHJpbWl0aXZlLCBzdWNoIGFzIGltcGxpY2l0IHN0cmluZyBjb2VyY2lvbi5cbiAgICpcbiAgICogRm9yIG1vcmUgY29tcGxleCB0eXBlcywgZXNwZWNpYWxseSBjb2xsZWN0aW9ucywgaW1wbGVtZW50aW5nIGB2YWx1ZU9mYCBtYXlcbiAgICogbm90IGJlIHBlcmZvcm1hbnQuIEFuIGFsdGVybmF0aXZlIGlzIHRvIGltcGxlbWVudCBgZXF1YWxzYCBhbmQgYGhhc2hDb2RlYC5cbiAgICpcbiAgICogYGVxdWFsc2AgdGFrZXMgYW5vdGhlciBvYmplY3QsIHByZXN1bWFibHkgb2Ygc2ltaWxhciB0eXBlLCBhbmQgcmV0dXJucyB0cnVlXG4gICAqIGlmIHRoZSBpdCBpcyBlcXVhbC4gRXF1YWxpdHkgaXMgc3ltbWV0cmljYWwsIHNvIHRoZSBzYW1lIHJlc3VsdCBzaG91bGQgYmVcbiAgICogcmV0dXJuZWQgaWYgdGhpcyBhbmQgdGhlIGFyZ3VtZW50IGFyZSBmbGlwcGVkLlxuICAgKlxuICAgKiAgICAgYXNzZXJ0KCBhLmVxdWFscyhiKSA9PT0gYi5lcXVhbHMoYSkgKTtcbiAgICpcbiAgICogYGhhc2hDb2RlYCByZXR1cm5zIGEgMzJiaXQgaW50ZWdlciBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBvYmplY3Qgd2hpY2ggd2lsbFxuICAgKiBiZSB1c2VkIHRvIGRldGVybWluZSBob3cgdG8gc3RvcmUgdGhlIHZhbHVlIG9iamVjdCBpbiBhIE1hcCBvciBTZXQuIFlvdSBtdXN0XG4gICAqIHByb3ZpZGUgYm90aCBvciBuZWl0aGVyIG1ldGhvZHMsIG9uZSBtdXN0IG5vdCBleGlzdCB3aXRob3V0IHRoZSBvdGhlci5cbiAgICpcbiAgICogQWxzbywgYW4gaW1wb3J0YW50IHJlbGF0aW9uc2hpcCBiZXR3ZWVuIHRoZXNlIG1ldGhvZHMgbXVzdCBiZSB1cGhlbGQ6IGlmIHR3b1xuICAgKiB2YWx1ZXMgYXJlIGVxdWFsLCB0aGV5ICptdXN0KiByZXR1cm4gdGhlIHNhbWUgaGFzaENvZGUuIElmIHRoZSB2YWx1ZXMgYXJlIG5vdFxuICAgKiBlcXVhbCwgdGhleSBtaWdodCBoYXZlIHRoZSBzYW1lIGhhc2hDb2RlOyB0aGlzIGlzIGNhbGxlZCBhIGhhc2ggY29sbGlzaW9uLFxuICAgKiBhbmQgd2hpbGUgdW5kZXNpcmFibGUgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsIGl0IGlzIGFjY2VwdGFibGUuXG4gICAqXG4gICAqICAgICBpZiAoYS5lcXVhbHMoYikpIHtcbiAgICogICAgICAgYXNzZXJ0KCBhLmhhc2hDb2RlKCkgPT09IGIuaGFzaENvZGUoKSApO1xuICAgKiAgICAgfVxuICAgKlxuICAgKiBBbGwgSW1tdXRhYmxlIGNvbGxlY3Rpb25zIGltcGxlbWVudCBgZXF1YWxzYCBhbmQgYGhhc2hDb2RlYC5cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGlzKHZhbHVlQSwgdmFsdWVCKSB7XG4gICAgaWYgKHZhbHVlQSA9PT0gdmFsdWVCIHx8ICh2YWx1ZUEgIT09IHZhbHVlQSAmJiB2YWx1ZUIgIT09IHZhbHVlQikpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXZhbHVlQSB8fCAhdmFsdWVCKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWVBLnZhbHVlT2YgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgdHlwZW9mIHZhbHVlQi52YWx1ZU9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YWx1ZUEgPSB2YWx1ZUEudmFsdWVPZigpO1xuICAgICAgdmFsdWVCID0gdmFsdWVCLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZUEuZXF1YWxzID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgdmFsdWVCLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgIHZhbHVlQS5lcXVhbHModmFsdWVCKSA6XG4gICAgICAgIHZhbHVlQSA9PT0gdmFsdWVCIHx8ICh2YWx1ZUEgIT09IHZhbHVlQSAmJiB2YWx1ZUIgIT09IHZhbHVlQik7XG4gIH1cblxuICBmdW5jdGlvbiBmcm9tSlMoanNvbiwgY29udmVydGVyKSB7XG4gICAgcmV0dXJuIGNvbnZlcnRlciA/XG4gICAgICBmcm9tSlNXaXRoKGNvbnZlcnRlciwganNvbiwgJycsIHsnJzoganNvbn0pIDpcbiAgICAgIGZyb21KU0RlZmF1bHQoanNvbik7XG4gIH1cblxuICBmdW5jdGlvbiBmcm9tSlNXaXRoKGNvbnZlcnRlciwganNvbiwga2V5LCBwYXJlbnRKU09OKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoanNvbikpIHtcbiAgICAgIHJldHVybiBjb252ZXJ0ZXIuY2FsbChwYXJlbnRKU09OLCBrZXksIEluZGV4ZWRTZXEoanNvbikubWFwKGZ1bmN0aW9uKHYsIGspICB7cmV0dXJuIGZyb21KU1dpdGgoY29udmVydGVyLCB2LCBrLCBqc29uKX0pKTtcbiAgICB9XG4gICAgaWYgKGlzUGxhaW5PYmooanNvbikpIHtcbiAgICAgIHJldHVybiBjb252ZXJ0ZXIuY2FsbChwYXJlbnRKU09OLCBrZXksIEtleWVkU2VxKGpzb24pLm1hcChmdW5jdGlvbih2LCBrKSAge3JldHVybiBmcm9tSlNXaXRoKGNvbnZlcnRlciwgdiwgaywganNvbil9KSk7XG4gICAgfVxuICAgIHJldHVybiBqc29uO1xuICB9XG5cbiAgZnVuY3Rpb24gZnJvbUpTRGVmYXVsdChqc29uKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoanNvbikpIHtcbiAgICAgIHJldHVybiBJbmRleGVkU2VxKGpzb24pLm1hcChmcm9tSlNEZWZhdWx0KS50b0xpc3QoKTtcbiAgICB9XG4gICAgaWYgKGlzUGxhaW5PYmooanNvbikpIHtcbiAgICAgIHJldHVybiBLZXllZFNlcShqc29uKS5tYXAoZnJvbUpTRGVmYXVsdCkudG9NYXAoKTtcbiAgICB9XG4gICAgcmV0dXJuIGpzb247XG4gIH1cblxuICBmdW5jdGlvbiBpc1BsYWluT2JqKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG4gIH1cblxuICB2YXIgTWF0aF9faW11bCA9XG4gICAgdHlwZW9mIE1hdGguaW11bCA9PT0gJ2Z1bmN0aW9uJyAmJiBNYXRoLmltdWwoMHhmZmZmZmZmZiwgMikgPT09IC0yID9cbiAgICBNYXRoLmltdWwgOlxuICAgIGZ1bmN0aW9uIE1hdGhfX2ltdWwoYSwgYikge1xuICAgICAgYSA9IGEgfCAwOyAvLyBpbnRcbiAgICAgIGIgPSBiIHwgMDsgLy8gaW50XG4gICAgICB2YXIgYyA9IGEgJiAweGZmZmY7XG4gICAgICB2YXIgZCA9IGIgJiAweGZmZmY7XG4gICAgICAvLyBTaGlmdCBieSAwIGZpeGVzIHRoZSBzaWduIG9uIHRoZSBoaWdoIHBhcnQuXG4gICAgICByZXR1cm4gKGMgKiBkKSArICgoKChhID4+PiAxNikgKiBkICsgYyAqIChiID4+PiAxNikpIDw8IDE2KSA+Pj4gMCkgfCAwOyAvLyBpbnRcbiAgICB9O1xuXG4gIC8vIHY4IGhhcyBhbiBvcHRpbWl6YXRpb24gZm9yIHN0b3JpbmcgMzEtYml0IHNpZ25lZCBudW1iZXJzLlxuICAvLyBWYWx1ZXMgd2hpY2ggaGF2ZSBlaXRoZXIgMDAgb3IgMTEgYXMgdGhlIGhpZ2ggb3JkZXIgYml0cyBxdWFsaWZ5LlxuICAvLyBUaGlzIGZ1bmN0aW9uIGRyb3BzIHRoZSBoaWdoZXN0IG9yZGVyIGJpdCBpbiBhIHNpZ25lZCBudW1iZXIsIG1haW50YWluaW5nXG4gIC8vIHRoZSBzaWduIGJpdC5cbiAgZnVuY3Rpb24gc21pKGkzMikge1xuICAgIHJldHVybiAoKGkzMiA+Pj4gMSkgJiAweDQwMDAwMDAwKSB8IChpMzIgJiAweEJGRkZGRkZGKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc2gobykge1xuICAgIGlmIChvID09PSBmYWxzZSB8fCBvID09PSBudWxsIHx8IG8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygby52YWx1ZU9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvID0gby52YWx1ZU9mKCk7XG4gICAgICBpZiAobyA9PT0gZmFsc2UgfHwgbyA9PT0gbnVsbCB8fCBvID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgbztcbiAgICBpZiAodHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHZhciBoID0gbyB8IDA7XG4gICAgICBpZiAoaCAhPT0gbykge1xuICAgICAgICBoIF49IG8gKiAweEZGRkZGRkZGO1xuICAgICAgfVxuICAgICAgd2hpbGUgKG8gPiAweEZGRkZGRkZGKSB7XG4gICAgICAgIG8gLz0gMHhGRkZGRkZGRjtcbiAgICAgICAgaCBePSBvO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNtaShoKTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gby5sZW5ndGggPiBTVFJJTkdfSEFTSF9DQUNIRV9NSU5fU1RSTEVOID8gY2FjaGVkSGFzaFN0cmluZyhvKSA6IGhhc2hTdHJpbmcobyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygby5oYXNoQ29kZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG8uaGFzaENvZGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc2hKU09iaihvKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhY2hlZEhhc2hTdHJpbmcoc3RyaW5nKSB7XG4gICAgdmFyIGhhc2ggPSBzdHJpbmdIYXNoQ2FjaGVbc3RyaW5nXTtcbiAgICBpZiAoaGFzaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBoYXNoID0gaGFzaFN0cmluZyhzdHJpbmcpO1xuICAgICAgaWYgKFNUUklOR19IQVNIX0NBQ0hFX1NJWkUgPT09IFNUUklOR19IQVNIX0NBQ0hFX01BWF9TSVpFKSB7XG4gICAgICAgIFNUUklOR19IQVNIX0NBQ0hFX1NJWkUgPSAwO1xuICAgICAgICBzdHJpbmdIYXNoQ2FjaGUgPSB7fTtcbiAgICAgIH1cbiAgICAgIFNUUklOR19IQVNIX0NBQ0hFX1NJWkUrKztcbiAgICAgIHN0cmluZ0hhc2hDYWNoZVtzdHJpbmddID0gaGFzaDtcbiAgICB9XG4gICAgcmV0dXJuIGhhc2g7XG4gIH1cblxuICAvLyBodHRwOi8vanNwZXJmLmNvbS9oYXNoaW5nLXN0cmluZ3NcbiAgZnVuY3Rpb24gaGFzaFN0cmluZyhzdHJpbmcpIHtcbiAgICAvLyBUaGlzIGlzIHRoZSBoYXNoIGZyb20gSlZNXG4gICAgLy8gVGhlIGhhc2ggY29kZSBmb3IgYSBzdHJpbmcgaXMgY29tcHV0ZWQgYXNcbiAgICAvLyBzWzBdICogMzEgXiAobiAtIDEpICsgc1sxXSAqIDMxIF4gKG4gLSAyKSArIC4uLiArIHNbbiAtIDFdLFxuICAgIC8vIHdoZXJlIHNbaV0gaXMgdGhlIGl0aCBjaGFyYWN0ZXIgb2YgdGhlIHN0cmluZyBhbmQgbiBpcyB0aGUgbGVuZ3RoIG9mXG4gICAgLy8gdGhlIHN0cmluZy4gV2UgXCJtb2RcIiB0aGUgcmVzdWx0IHRvIG1ha2UgaXQgYmV0d2VlbiAwIChpbmNsdXNpdmUpIGFuZCAyXjMxXG4gICAgLy8gKGV4Y2x1c2l2ZSkgYnkgZHJvcHBpbmcgaGlnaCBiaXRzLlxuICAgIHZhciBoYXNoID0gMDtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgc3RyaW5nLmxlbmd0aDsgaWkrKykge1xuICAgICAgaGFzaCA9IDMxICogaGFzaCArIHN0cmluZy5jaGFyQ29kZUF0KGlpKSB8IDA7XG4gICAgfVxuICAgIHJldHVybiBzbWkoaGFzaCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYXNoSlNPYmoob2JqKSB7XG4gICAgdmFyIGhhc2ggPSB3ZWFrTWFwICYmIHdlYWtNYXAuZ2V0KG9iaik7XG4gICAgaWYgKGhhc2gpIHJldHVybiBoYXNoO1xuXG4gICAgaGFzaCA9IG9ialtVSURfSEFTSF9LRVldO1xuICAgIGlmIChoYXNoKSByZXR1cm4gaGFzaDtcblxuICAgIGlmICghY2FuRGVmaW5lUHJvcGVydHkpIHtcbiAgICAgIGhhc2ggPSBvYmoucHJvcGVydHlJc0VudW1lcmFibGUgJiYgb2JqLnByb3BlcnR5SXNFbnVtZXJhYmxlW1VJRF9IQVNIX0tFWV07XG4gICAgICBpZiAoaGFzaCkgcmV0dXJuIGhhc2g7XG5cbiAgICAgIGhhc2ggPSBnZXRJRU5vZGVIYXNoKG9iaik7XG4gICAgICBpZiAoaGFzaCkgcmV0dXJuIGhhc2g7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5pc0V4dGVuc2libGUgJiYgIU9iamVjdC5pc0V4dGVuc2libGUob2JqKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb24tZXh0ZW5zaWJsZSBvYmplY3RzIGFyZSBub3QgYWxsb3dlZCBhcyBrZXlzLicpO1xuICAgIH1cblxuICAgIGhhc2ggPSArK29iakhhc2hVSUQ7XG4gICAgaWYgKG9iakhhc2hVSUQgJiAweDQwMDAwMDAwKSB7XG4gICAgICBvYmpIYXNoVUlEID0gMDtcbiAgICB9XG5cbiAgICBpZiAod2Vha01hcCkge1xuICAgICAgd2Vha01hcC5zZXQob2JqLCBoYXNoKTtcbiAgICB9IGVsc2UgaWYgKGNhbkRlZmluZVByb3BlcnR5KSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBVSURfSEFTSF9LRVksIHtcbiAgICAgICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAgICAgJ2NvbmZpZ3VyYWJsZSc6IGZhbHNlLFxuICAgICAgICAnd3JpdGFibGUnOiBmYWxzZSxcbiAgICAgICAgJ3ZhbHVlJzogaGFzaFxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChvYmoucHJvcGVydHlJc0VudW1lcmFibGUgJiZcbiAgICAgICAgICAgICAgIG9iai5wcm9wZXJ0eUlzRW51bWVyYWJsZSA9PT0gb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSkge1xuICAgICAgLy8gU2luY2Ugd2UgY2FuJ3QgZGVmaW5lIGEgbm9uLWVudW1lcmFibGUgcHJvcGVydHkgb24gdGhlIG9iamVjdFxuICAgICAgLy8gd2UnbGwgaGlqYWNrIG9uZSBvZiB0aGUgbGVzcy11c2VkIG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMgdG9cbiAgICAgIC8vIHNhdmUgb3VyIGhhc2ggb24gaXQuIFNpbmNlIHRoaXMgaXMgYSBmdW5jdGlvbiBpdCB3aWxsIG5vdCBzaG93IHVwIGluXG4gICAgICAvLyBgSlNPTi5zdHJpbmdpZnlgIHdoaWNoIGlzIHdoYXQgd2Ugd2FudC5cbiAgICAgIG9iai5wcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgICBvYmoucHJvcGVydHlJc0VudW1lcmFibGVbVUlEX0hBU0hfS0VZXSA9IGhhc2g7XG4gICAgfSBlbHNlIGlmIChvYmoubm9kZVR5cGUpIHtcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2UgY291bGRuJ3QgZ2V0IHRoZSBJRSBgdW5pcXVlSURgIHRvIHVzZSBhcyBhIGhhc2hcbiAgICAgIC8vIGFuZCB3ZSBjb3VsZG4ndCB1c2UgYSBub24tZW51bWVyYWJsZSBwcm9wZXJ0eSB0byBleHBsb2l0IHRoZVxuICAgICAgLy8gZG9udEVudW0gYnVnIHNvIHdlIHNpbXBseSBhZGQgdGhlIGBVSURfSEFTSF9LRVlgIG9uIHRoZSBub2RlXG4gICAgICAvLyBpdHNlbGYuXG4gICAgICBvYmpbVUlEX0hBU0hfS0VZXSA9IGhhc2g7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIHNldCBhIG5vbi1lbnVtZXJhYmxlIHByb3BlcnR5IG9uIG9iamVjdC4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaDtcbiAgfVxuXG4gIC8vIFRydWUgaWYgT2JqZWN0LmRlZmluZVByb3BlcnR5IHdvcmtzIGFzIGV4cGVjdGVkLiBJRTggZmFpbHMgdGhpcyB0ZXN0LlxuICB2YXIgY2FuRGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3gnLCB7fSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KCkpO1xuXG4gIC8vIElFIGhhcyBhIGB1bmlxdWVJRGAgcHJvcGVydHkgb24gRE9NIG5vZGVzLiBXZSBjYW4gY29uc3RydWN0IHRoZSBoYXNoIGZyb20gaXRcbiAgLy8gYW5kIGF2b2lkIG1lbW9yeSBsZWFrcyBmcm9tIHRoZSBJRSBjbG9uZU5vZGUgYnVnLlxuICBmdW5jdGlvbiBnZXRJRU5vZGVIYXNoKG5vZGUpIHtcbiAgICBpZiAobm9kZSAmJiBub2RlLm5vZGVUeXBlID4gMCkge1xuICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgIGNhc2UgMTogLy8gRWxlbWVudFxuICAgICAgICAgIHJldHVybiBub2RlLnVuaXF1ZUlEO1xuICAgICAgICBjYXNlIDk6IC8vIERvY3VtZW50XG4gICAgICAgICAgcmV0dXJuIG5vZGUuZG9jdW1lbnRFbGVtZW50ICYmIG5vZGUuZG9jdW1lbnRFbGVtZW50LnVuaXF1ZUlEO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIElmIHBvc3NpYmxlLCB1c2UgYSBXZWFrTWFwLlxuICB2YXIgd2Vha01hcCA9IHR5cGVvZiBXZWFrTWFwID09PSAnZnVuY3Rpb24nICYmIG5ldyBXZWFrTWFwKCk7XG5cbiAgdmFyIG9iakhhc2hVSUQgPSAwO1xuXG4gIHZhciBVSURfSEFTSF9LRVkgPSAnX19pbW11dGFibGVoYXNoX18nO1xuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIFVJRF9IQVNIX0tFWSA9IFN5bWJvbChVSURfSEFTSF9LRVkpO1xuICB9XG5cbiAgdmFyIFNUUklOR19IQVNIX0NBQ0hFX01JTl9TVFJMRU4gPSAxNjtcbiAgdmFyIFNUUklOR19IQVNIX0NBQ0hFX01BWF9TSVpFID0gMjU1O1xuICB2YXIgU1RSSU5HX0hBU0hfQ0FDSEVfU0laRSA9IDA7XG4gIHZhciBzdHJpbmdIYXNoQ2FjaGUgPSB7fTtcblxuICBmdW5jdGlvbiBpbnZhcmlhbnQoY29uZGl0aW9uLCBlcnJvcikge1xuICAgIGlmICghY29uZGl0aW9uKSB0aHJvdyBuZXcgRXJyb3IoZXJyb3IpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXNzZXJ0Tm90SW5maW5pdGUoc2l6ZSkge1xuICAgIGludmFyaWFudChcbiAgICAgIHNpemUgIT09IEluZmluaXR5LFxuICAgICAgJ0Nhbm5vdCBwZXJmb3JtIHRoaXMgYWN0aW9uIHdpdGggYW4gaW5maW5pdGUgc2l6ZS4nXG4gICAgKTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKFRvS2V5ZWRTZXF1ZW5jZSwgS2V5ZWRTZXEpO1xuICAgIGZ1bmN0aW9uIFRvS2V5ZWRTZXF1ZW5jZShpbmRleGVkLCB1c2VLZXlzKSB7XG4gICAgICB0aGlzLl9pdGVyID0gaW5kZXhlZDtcbiAgICAgIHRoaXMuX3VzZUtleXMgPSB1c2VLZXlzO1xuICAgICAgdGhpcy5zaXplID0gaW5kZXhlZC5zaXplO1xuICAgIH1cblxuICAgIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBub3RTZXRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZXIuZ2V0KGtleSwgbm90U2V0VmFsdWUpO1xuICAgIH07XG5cbiAgICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZXIuaGFzKGtleSk7XG4gICAgfTtcblxuICAgIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUudmFsdWVTZXEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLnZhbHVlU2VxKCk7XG4gICAgfTtcblxuICAgIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgdmFyIHJldmVyc2VkU2VxdWVuY2UgPSByZXZlcnNlRmFjdG9yeSh0aGlzLCB0cnVlKTtcbiAgICAgIGlmICghdGhpcy5fdXNlS2V5cykge1xuICAgICAgICByZXZlcnNlZFNlcXVlbmNlLnZhbHVlU2VxID0gZnVuY3Rpb24oKSAge3JldHVybiB0aGlzJDAuX2l0ZXIudG9TZXEoKS5yZXZlcnNlKCl9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldmVyc2VkU2VxdWVuY2U7XG4gICAgfTtcblxuICAgIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24obWFwcGVyLCBjb250ZXh0KSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICB2YXIgbWFwcGVkU2VxdWVuY2UgPSBtYXBGYWN0b3J5KHRoaXMsIG1hcHBlciwgY29udGV4dCk7XG4gICAgICBpZiAoIXRoaXMuX3VzZUtleXMpIHtcbiAgICAgICAgbWFwcGVkU2VxdWVuY2UudmFsdWVTZXEgPSBmdW5jdGlvbigpICB7cmV0dXJuIHRoaXMkMC5faXRlci50b1NlcSgpLm1hcChtYXBwZXIsIGNvbnRleHQpfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXBwZWRTZXF1ZW5jZTtcbiAgICB9O1xuXG4gICAgVG9LZXllZFNlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgdmFyIGlpO1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZXIuX19pdGVyYXRlKFxuICAgICAgICB0aGlzLl91c2VLZXlzID9cbiAgICAgICAgICBmdW5jdGlvbih2LCBrKSAge3JldHVybiBmbih2LCBrLCB0aGlzJDApfSA6XG4gICAgICAgICAgKChpaSA9IHJldmVyc2UgPyByZXNvbHZlU2l6ZSh0aGlzKSA6IDApLFxuICAgICAgICAgICAgZnVuY3Rpb24odiApIHtyZXR1cm4gZm4odiwgcmV2ZXJzZSA/IC0taWkgOiBpaSsrLCB0aGlzJDApfSksXG4gICAgICAgIHJldmVyc2VcbiAgICAgICk7XG4gICAgfTtcblxuICAgIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIGlmICh0aGlzLl91c2VLZXlzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pdGVyLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLl9pdGVyLl9faXRlcmF0b3IoSVRFUkFURV9WQUxVRVMsIHJldmVyc2UpO1xuICAgICAgdmFyIGlpID0gcmV2ZXJzZSA/IHJlc29sdmVTaXplKHRoaXMpIDogMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgcmV0dXJuIHN0ZXAuZG9uZSA/IHN0ZXAgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgcmV2ZXJzZSA/IC0taWkgOiBpaSsrLCBzdGVwLnZhbHVlLCBzdGVwKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgVG9LZXllZFNlcXVlbmNlLnByb3RvdHlwZVtJU19PUkRFUkVEX1NFTlRJTkVMXSA9IHRydWU7XG5cblxuICBjcmVhdGVDbGFzcyhUb0luZGV4ZWRTZXF1ZW5jZSwgSW5kZXhlZFNlcSk7XG4gICAgZnVuY3Rpb24gVG9JbmRleGVkU2VxdWVuY2UoaXRlcikge1xuICAgICAgdGhpcy5faXRlciA9IGl0ZXI7XG4gICAgICB0aGlzLnNpemUgPSBpdGVyLnNpemU7XG4gICAgfVxuXG4gICAgVG9JbmRleGVkU2VxdWVuY2UucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLmNvbnRhaW5zKHZhbHVlKTtcbiAgICB9O1xuXG4gICAgVG9JbmRleGVkU2VxdWVuY2UucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICByZXR1cm4gdGhpcy5faXRlci5fX2l0ZXJhdGUoZnVuY3Rpb24odiApIHtyZXR1cm4gZm4odiwgaXRlcmF0aW9ucysrLCB0aGlzJDApfSwgcmV2ZXJzZSk7XG4gICAgfTtcblxuICAgIFRvSW5kZXhlZFNlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5faXRlci5fX2l0ZXJhdG9yKElURVJBVEVfVkFMVUVTLCByZXZlcnNlKTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgcmV0dXJuIHN0ZXAuZG9uZSA/IHN0ZXAgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCBzdGVwLnZhbHVlLCBzdGVwKVxuICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgY3JlYXRlQ2xhc3MoVG9TZXRTZXF1ZW5jZSwgU2V0U2VxKTtcbiAgICBmdW5jdGlvbiBUb1NldFNlcXVlbmNlKGl0ZXIpIHtcbiAgICAgIHRoaXMuX2l0ZXIgPSBpdGVyO1xuICAgICAgdGhpcy5zaXplID0gaXRlci5zaXplO1xuICAgIH1cblxuICAgIFRvU2V0U2VxdWVuY2UucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZXIuY29udGFpbnMoa2V5KTtcbiAgICB9O1xuXG4gICAgVG9TZXRTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLl9faXRlcmF0ZShmdW5jdGlvbih2ICkge3JldHVybiBmbih2LCB2LCB0aGlzJDApfSwgcmV2ZXJzZSk7XG4gICAgfTtcblxuICAgIFRvU2V0U2VxdWVuY2UucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLl9pdGVyLl9faXRlcmF0b3IoSVRFUkFURV9WQUxVRVMsIHJldmVyc2UpO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICByZXR1cm4gc3RlcC5kb25lID8gc3RlcCA6XG4gICAgICAgICAgaXRlcmF0b3JWYWx1ZSh0eXBlLCBzdGVwLnZhbHVlLCBzdGVwLnZhbHVlLCBzdGVwKTtcbiAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gIGNyZWF0ZUNsYXNzKEZyb21FbnRyaWVzU2VxdWVuY2UsIEtleWVkU2VxKTtcbiAgICBmdW5jdGlvbiBGcm9tRW50cmllc1NlcXVlbmNlKGVudHJpZXMpIHtcbiAgICAgIHRoaXMuX2l0ZXIgPSBlbnRyaWVzO1xuICAgICAgdGhpcy5zaXplID0gZW50cmllcy5zaXplO1xuICAgIH1cblxuICAgIEZyb21FbnRyaWVzU2VxdWVuY2UucHJvdG90eXBlLmVudHJ5U2VxID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlci50b1NlcSgpO1xuICAgIH07XG5cbiAgICBGcm9tRW50cmllc1NlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZXIuX19pdGVyYXRlKGZ1bmN0aW9uKGVudHJ5ICkge1xuICAgICAgICAvLyBDaGVjayBpZiBlbnRyeSBleGlzdHMgZmlyc3Qgc28gYXJyYXkgYWNjZXNzIGRvZXNuJ3QgdGhyb3cgZm9yIGhvbGVzXG4gICAgICAgIC8vIGluIHRoZSBwYXJlbnQgaXRlcmF0aW9uLlxuICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICB2YWxpZGF0ZUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gZm4oZW50cnlbMV0sIGVudHJ5WzBdLCB0aGlzJDApO1xuICAgICAgICB9XG4gICAgICB9LCByZXZlcnNlKTtcbiAgICB9O1xuXG4gICAgRnJvbUVudHJpZXNTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX2l0ZXIuX19pdGVyYXRvcihJVEVSQVRFX1ZBTFVFUywgcmV2ZXJzZSk7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICBpZiAoc3RlcC5kb25lKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGVudHJ5ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgICAvLyBDaGVjayBpZiBlbnRyeSBleGlzdHMgZmlyc3Qgc28gYXJyYXkgYWNjZXNzIGRvZXNuJ3QgdGhyb3cgZm9yIGhvbGVzXG4gICAgICAgICAgLy8gaW4gdGhlIHBhcmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICB2YWxpZGF0ZUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlID09PSBJVEVSQVRFX0VOVFJJRVMgPyBzdGVwIDpcbiAgICAgICAgICAgICAgaXRlcmF0b3JWYWx1ZSh0eXBlLCBlbnRyeVswXSwgZW50cnlbMV0sIHN0ZXApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuXG4gIFRvSW5kZXhlZFNlcXVlbmNlLnByb3RvdHlwZS5jYWNoZVJlc3VsdCA9XG4gIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUuY2FjaGVSZXN1bHQgPVxuICBUb1NldFNlcXVlbmNlLnByb3RvdHlwZS5jYWNoZVJlc3VsdCA9XG4gIEZyb21FbnRyaWVzU2VxdWVuY2UucHJvdG90eXBlLmNhY2hlUmVzdWx0ID1cbiAgICBjYWNoZVJlc3VsdFRocm91Z2g7XG5cblxuICBmdW5jdGlvbiBmbGlwRmFjdG9yeShpdGVyYWJsZSkge1xuICAgIHZhciBmbGlwU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoaXRlcmFibGUpO1xuICAgIGZsaXBTZXF1ZW5jZS5faXRlciA9IGl0ZXJhYmxlO1xuICAgIGZsaXBTZXF1ZW5jZS5zaXplID0gaXRlcmFibGUuc2l6ZTtcbiAgICBmbGlwU2VxdWVuY2UuZmxpcCA9IGZ1bmN0aW9uKCkgIHtyZXR1cm4gaXRlcmFibGV9O1xuICAgIGZsaXBTZXF1ZW5jZS5yZXZlcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJldmVyc2VkU2VxdWVuY2UgPSBpdGVyYWJsZS5yZXZlcnNlLmFwcGx5KHRoaXMpOyAvLyBzdXBlci5yZXZlcnNlKClcbiAgICAgIHJldmVyc2VkU2VxdWVuY2UuZmxpcCA9IGZ1bmN0aW9uKCkgIHtyZXR1cm4gaXRlcmFibGUucmV2ZXJzZSgpfTtcbiAgICAgIHJldHVybiByZXZlcnNlZFNlcXVlbmNlO1xuICAgIH07XG4gICAgZmxpcFNlcXVlbmNlLmhhcyA9IGZ1bmN0aW9uKGtleSApIHtyZXR1cm4gaXRlcmFibGUuY29udGFpbnMoa2V5KX07XG4gICAgZmxpcFNlcXVlbmNlLmNvbnRhaW5zID0gZnVuY3Rpb24oa2V5ICkge3JldHVybiBpdGVyYWJsZS5oYXMoa2V5KX07XG4gICAgZmxpcFNlcXVlbmNlLmNhY2hlUmVzdWx0ID0gY2FjaGVSZXN1bHRUaHJvdWdoO1xuICAgIGZsaXBTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIGl0ZXJhYmxlLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrKSAge3JldHVybiBmbihrLCB2LCB0aGlzJDApICE9PSBmYWxzZX0sIHJldmVyc2UpO1xuICAgIH1cbiAgICBmbGlwU2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgaWYgKHR5cGUgPT09IElURVJBVEVfRU5UUklFUykge1xuICAgICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYWJsZS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICBpZiAoIXN0ZXAuZG9uZSkge1xuICAgICAgICAgICAgdmFyIGsgPSBzdGVwLnZhbHVlWzBdO1xuICAgICAgICAgICAgc3RlcC52YWx1ZVswXSA9IHN0ZXAudmFsdWVbMV07XG4gICAgICAgICAgICBzdGVwLnZhbHVlWzFdID0gaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhYmxlLl9faXRlcmF0b3IoXG4gICAgICAgIHR5cGUgPT09IElURVJBVEVfVkFMVUVTID8gSVRFUkFURV9LRVlTIDogSVRFUkFURV9WQUxVRVMsXG4gICAgICAgIHJldmVyc2VcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBmbGlwU2VxdWVuY2U7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIG1hcEZhY3RvcnkoaXRlcmFibGUsIG1hcHBlciwgY29udGV4dCkge1xuICAgIHZhciBtYXBwZWRTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShpdGVyYWJsZSk7XG4gICAgbWFwcGVkU2VxdWVuY2Uuc2l6ZSA9IGl0ZXJhYmxlLnNpemU7XG4gICAgbWFwcGVkU2VxdWVuY2UuaGFzID0gZnVuY3Rpb24oa2V5ICkge3JldHVybiBpdGVyYWJsZS5oYXMoa2V5KX07XG4gICAgbWFwcGVkU2VxdWVuY2UuZ2V0ID0gZnVuY3Rpb24oa2V5LCBub3RTZXRWYWx1ZSkgIHtcbiAgICAgIHZhciB2ID0gaXRlcmFibGUuZ2V0KGtleSwgTk9UX1NFVCk7XG4gICAgICByZXR1cm4gdiA9PT0gTk9UX1NFVCA/XG4gICAgICAgIG5vdFNldFZhbHVlIDpcbiAgICAgICAgbWFwcGVyLmNhbGwoY29udGV4dCwgdiwga2V5LCBpdGVyYWJsZSk7XG4gICAgfTtcbiAgICBtYXBwZWRTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIGl0ZXJhYmxlLl9faXRlcmF0ZShcbiAgICAgICAgZnVuY3Rpb24odiwgaywgYykgIHtyZXR1cm4gZm4obWFwcGVyLmNhbGwoY29udGV4dCwgdiwgaywgYyksIGssIHRoaXMkMCkgIT09IGZhbHNlfSxcbiAgICAgICAgcmV2ZXJzZVxuICAgICAgKTtcbiAgICB9XG4gICAgbWFwcGVkU2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24gKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhYmxlLl9faXRlcmF0b3IoSVRFUkFURV9FTlRSSUVTLCByZXZlcnNlKTtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICAgIHZhciBrZXkgPSBlbnRyeVswXTtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUoXG4gICAgICAgICAgdHlwZSxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgbWFwcGVyLmNhbGwoY29udGV4dCwgZW50cnlbMV0sIGtleSwgaXRlcmFibGUpLFxuICAgICAgICAgIHN0ZXBcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gbWFwcGVkU2VxdWVuY2U7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHJldmVyc2VGYWN0b3J5KGl0ZXJhYmxlLCB1c2VLZXlzKSB7XG4gICAgdmFyIHJldmVyc2VkU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoaXRlcmFibGUpO1xuICAgIHJldmVyc2VkU2VxdWVuY2UuX2l0ZXIgPSBpdGVyYWJsZTtcbiAgICByZXZlcnNlZFNlcXVlbmNlLnNpemUgPSBpdGVyYWJsZS5zaXplO1xuICAgIHJldmVyc2VkU2VxdWVuY2UucmV2ZXJzZSA9IGZ1bmN0aW9uKCkgIHtyZXR1cm4gaXRlcmFibGV9O1xuICAgIGlmIChpdGVyYWJsZS5mbGlwKSB7XG4gICAgICByZXZlcnNlZFNlcXVlbmNlLmZsaXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmbGlwU2VxdWVuY2UgPSBmbGlwRmFjdG9yeShpdGVyYWJsZSk7XG4gICAgICAgIGZsaXBTZXF1ZW5jZS5yZXZlcnNlID0gZnVuY3Rpb24oKSAge3JldHVybiBpdGVyYWJsZS5mbGlwKCl9O1xuICAgICAgICByZXR1cm4gZmxpcFNlcXVlbmNlO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV2ZXJzZWRTZXF1ZW5jZS5nZXQgPSBmdW5jdGlvbihrZXksIG5vdFNldFZhbHVlKSBcbiAgICAgIHtyZXR1cm4gaXRlcmFibGUuZ2V0KHVzZUtleXMgPyBrZXkgOiAtMSAtIGtleSwgbm90U2V0VmFsdWUpfTtcbiAgICByZXZlcnNlZFNlcXVlbmNlLmhhcyA9IGZ1bmN0aW9uKGtleSApXG4gICAgICB7cmV0dXJuIGl0ZXJhYmxlLmhhcyh1c2VLZXlzID8ga2V5IDogLTEgLSBrZXkpfTtcbiAgICByZXZlcnNlZFNlcXVlbmNlLmNvbnRhaW5zID0gZnVuY3Rpb24odmFsdWUgKSB7cmV0dXJuIGl0ZXJhYmxlLmNvbnRhaW5zKHZhbHVlKX07XG4gICAgcmV2ZXJzZWRTZXF1ZW5jZS5jYWNoZVJlc3VsdCA9IGNhY2hlUmVzdWx0VGhyb3VnaDtcbiAgICByZXZlcnNlZFNlcXVlbmNlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIGl0ZXJhYmxlLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrKSAge3JldHVybiBmbih2LCBrLCB0aGlzJDApfSwgIXJldmVyc2UpO1xuICAgIH07XG4gICAgcmV2ZXJzZWRTZXF1ZW5jZS5fX2l0ZXJhdG9yID1cbiAgICAgIGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpICB7cmV0dXJuIGl0ZXJhYmxlLl9faXRlcmF0b3IodHlwZSwgIXJldmVyc2UpfTtcbiAgICByZXR1cm4gcmV2ZXJzZWRTZXF1ZW5jZTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZmlsdGVyRmFjdG9yeShpdGVyYWJsZSwgcHJlZGljYXRlLCBjb250ZXh0LCB1c2VLZXlzKSB7XG4gICAgdmFyIGZpbHRlclNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGl0ZXJhYmxlKTtcbiAgICBpZiAodXNlS2V5cykge1xuICAgICAgZmlsdGVyU2VxdWVuY2UuaGFzID0gZnVuY3Rpb24oa2V5ICkge1xuICAgICAgICB2YXIgdiA9IGl0ZXJhYmxlLmdldChrZXksIE5PVF9TRVQpO1xuICAgICAgICByZXR1cm4gdiAhPT0gTk9UX1NFVCAmJiAhIXByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHYsIGtleSwgaXRlcmFibGUpO1xuICAgICAgfTtcbiAgICAgIGZpbHRlclNlcXVlbmNlLmdldCA9IGZ1bmN0aW9uKGtleSwgbm90U2V0VmFsdWUpICB7XG4gICAgICAgIHZhciB2ID0gaXRlcmFibGUuZ2V0KGtleSwgTk9UX1NFVCk7XG4gICAgICAgIHJldHVybiB2ICE9PSBOT1RfU0VUICYmIHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHYsIGtleSwgaXRlcmFibGUpID9cbiAgICAgICAgICB2IDogbm90U2V0VmFsdWU7XG4gICAgICB9O1xuICAgIH1cbiAgICBmaWx0ZXJTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgaXRlcmFibGUuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGssIGMpICB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrLCBjKSkge1xuICAgICAgICAgIGl0ZXJhdGlvbnMrKztcbiAgICAgICAgICByZXR1cm4gZm4odiwgdXNlS2V5cyA/IGsgOiBpdGVyYXRpb25zIC0gMSwgdGhpcyQwKTtcbiAgICAgICAgfVxuICAgICAgfSwgcmV2ZXJzZSk7XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuICAgIGZpbHRlclNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uICh0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYWJsZS5fX2l0ZXJhdG9yKElURVJBVEVfRU5UUklFUywgcmV2ZXJzZSk7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICBpZiAoc3RlcC5kb25lKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGVudHJ5ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgICB2YXIga2V5ID0gZW50cnlbMF07XG4gICAgICAgICAgdmFyIHZhbHVlID0gZW50cnlbMV07XG4gICAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBrZXksIGl0ZXJhYmxlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgdXNlS2V5cyA/IGtleSA6IGl0ZXJhdGlvbnMrKywgdmFsdWUsIHN0ZXApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmaWx0ZXJTZXF1ZW5jZTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gY291bnRCeUZhY3RvcnkoaXRlcmFibGUsIGdyb3VwZXIsIGNvbnRleHQpIHtcbiAgICB2YXIgZ3JvdXBzID0gTWFwKCkuYXNNdXRhYmxlKCk7XG4gICAgaXRlcmFibGUuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGspICB7XG4gICAgICBncm91cHMudXBkYXRlKFxuICAgICAgICBncm91cGVyLmNhbGwoY29udGV4dCwgdiwgaywgaXRlcmFibGUpLFxuICAgICAgICAwLFxuICAgICAgICBmdW5jdGlvbihhICkge3JldHVybiBhICsgMX1cbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGdyb3Vwcy5hc0ltbXV0YWJsZSgpO1xuICB9XG5cblxuICBmdW5jdGlvbiBncm91cEJ5RmFjdG9yeShpdGVyYWJsZSwgZ3JvdXBlciwgY29udGV4dCkge1xuICAgIHZhciBpc0tleWVkSXRlciA9IGlzS2V5ZWQoaXRlcmFibGUpO1xuICAgIHZhciBncm91cHMgPSAoaXNPcmRlcmVkKGl0ZXJhYmxlKSA/IE9yZGVyZWRNYXAoKSA6IE1hcCgpKS5hc011dGFibGUoKTtcbiAgICBpdGVyYWJsZS5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaykgIHtcbiAgICAgIGdyb3Vwcy51cGRhdGUoXG4gICAgICAgIGdyb3VwZXIuY2FsbChjb250ZXh0LCB2LCBrLCBpdGVyYWJsZSksXG4gICAgICAgIGZ1bmN0aW9uKGEgKSB7cmV0dXJuIChhID0gYSB8fCBbXSwgYS5wdXNoKGlzS2V5ZWRJdGVyID8gW2ssIHZdIDogdiksIGEpfVxuICAgICAgKTtcbiAgICB9KTtcbiAgICB2YXIgY29lcmNlID0gaXRlcmFibGVDbGFzcyhpdGVyYWJsZSk7XG4gICAgcmV0dXJuIGdyb3Vwcy5tYXAoZnVuY3Rpb24oYXJyICkge3JldHVybiByZWlmeShpdGVyYWJsZSwgY29lcmNlKGFycikpfSk7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHNsaWNlRmFjdG9yeShpdGVyYWJsZSwgYmVnaW4sIGVuZCwgdXNlS2V5cykge1xuICAgIHZhciBvcmlnaW5hbFNpemUgPSBpdGVyYWJsZS5zaXplO1xuXG4gICAgaWYgKHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgb3JpZ2luYWxTaXplKSkge1xuICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgIH1cblxuICAgIHZhciByZXNvbHZlZEJlZ2luID0gcmVzb2x2ZUJlZ2luKGJlZ2luLCBvcmlnaW5hbFNpemUpO1xuICAgIHZhciByZXNvbHZlZEVuZCA9IHJlc29sdmVFbmQoZW5kLCBvcmlnaW5hbFNpemUpO1xuXG4gICAgLy8gYmVnaW4gb3IgZW5kIHdpbGwgYmUgTmFOIGlmIHRoZXkgd2VyZSBwcm92aWRlZCBhcyBuZWdhdGl2ZSBudW1iZXJzIGFuZFxuICAgIC8vIHRoaXMgaXRlcmFibGUncyBzaXplIGlzIHVua25vd24uIEluIHRoYXQgY2FzZSwgY2FjaGUgZmlyc3Qgc28gdGhlcmUgaXNcbiAgICAvLyBhIGtub3duIHNpemUuXG4gICAgaWYgKHJlc29sdmVkQmVnaW4gIT09IHJlc29sdmVkQmVnaW4gfHwgcmVzb2x2ZWRFbmQgIT09IHJlc29sdmVkRW5kKSB7XG4gICAgICByZXR1cm4gc2xpY2VGYWN0b3J5KGl0ZXJhYmxlLnRvU2VxKCkuY2FjaGVSZXN1bHQoKSwgYmVnaW4sIGVuZCwgdXNlS2V5cyk7XG4gICAgfVxuXG4gICAgdmFyIHNsaWNlU2l6ZSA9IHJlc29sdmVkRW5kIC0gcmVzb2x2ZWRCZWdpbjtcbiAgICBpZiAoc2xpY2VTaXplIDwgMCkge1xuICAgICAgc2xpY2VTaXplID0gMDtcbiAgICB9XG5cbiAgICB2YXIgc2xpY2VTZXEgPSBtYWtlU2VxdWVuY2UoaXRlcmFibGUpO1xuXG4gICAgc2xpY2VTZXEuc2l6ZSA9IHNsaWNlU2l6ZSA9PT0gMCA/IHNsaWNlU2l6ZSA6IGl0ZXJhYmxlLnNpemUgJiYgc2xpY2VTaXplIHx8IHVuZGVmaW5lZDtcblxuICAgIGlmICghdXNlS2V5cyAmJiBpc1NlcShpdGVyYWJsZSkgJiYgc2xpY2VTaXplID49IDApIHtcbiAgICAgIHNsaWNlU2VxLmdldCA9IGZ1bmN0aW9uIChpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICAgICAgaW5kZXggPSB3cmFwSW5kZXgodGhpcywgaW5kZXgpO1xuICAgICAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBpbmRleCA8IHNsaWNlU2l6ZSA/XG4gICAgICAgICAgaXRlcmFibGUuZ2V0KGluZGV4ICsgcmVzb2x2ZWRCZWdpbiwgbm90U2V0VmFsdWUpIDpcbiAgICAgICAgICBub3RTZXRWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzbGljZVNlcS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICBpZiAoc2xpY2VTaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdGUoZm4sIHJldmVyc2UpO1xuICAgICAgfVxuICAgICAgdmFyIHNraXBwZWQgPSAwO1xuICAgICAgdmFyIGlzU2tpcHBpbmcgPSB0cnVlO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgaXRlcmFibGUuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGspICB7XG4gICAgICAgIGlmICghKGlzU2tpcHBpbmcgJiYgKGlzU2tpcHBpbmcgPSBza2lwcGVkKysgPCByZXNvbHZlZEJlZ2luKSkpIHtcbiAgICAgICAgICBpdGVyYXRpb25zKys7XG4gICAgICAgICAgcmV0dXJuIGZuKHYsIHVzZUtleXMgPyBrIDogaXRlcmF0aW9ucyAtIDEsIHRoaXMkMCkgIT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICAgIGl0ZXJhdGlvbnMgIT09IHNsaWNlU2l6ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuXG4gICAgc2xpY2VTZXEuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgaWYgKHNsaWNlU2l6ZSAmJiByZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIC8vIERvbid0IGJvdGhlciBpbnN0YW50aWF0aW5nIHBhcmVudCBpdGVyYXRvciBpZiB0YWtpbmcgMC5cbiAgICAgIHZhciBpdGVyYXRvciA9IHNsaWNlU2l6ZSAmJiBpdGVyYWJsZS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgdmFyIHNraXBwZWQgPSAwO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHdoaWxlIChza2lwcGVkKysgIT09IHJlc29sdmVkQmVnaW4pIHtcbiAgICAgICAgICBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCsraXRlcmF0aW9ucyA+IHNsaWNlU2l6ZSkge1xuICAgICAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgaWYgKHVzZUtleXMgfHwgdHlwZSA9PT0gSVRFUkFURV9WQUxVRVMpIHtcbiAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBJVEVSQVRFX0tFWVMpIHtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zIC0gMSwgdW5kZWZpbmVkLCBzdGVwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zIC0gMSwgc3RlcC52YWx1ZVsxXSwgc3RlcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBzbGljZVNlcTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gdGFrZVdoaWxlRmFjdG9yeShpdGVyYWJsZSwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHRha2VTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShpdGVyYWJsZSk7XG4gICAgdGFrZVNlcXVlbmNlLl9faXRlcmF0ZVVuY2FjaGVkID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRlKGZuLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIGl0ZXJhYmxlLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrLCBjKSBcbiAgICAgICAge3JldHVybiBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrLCBjKSAmJiArK2l0ZXJhdGlvbnMgJiYgZm4odiwgaywgdGhpcyQwKX1cbiAgICAgICk7XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuICAgIHRha2VTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYWJsZS5fX2l0ZXJhdG9yKElURVJBVEVfRU5UUklFUywgcmV2ZXJzZSk7XG4gICAgICB2YXIgaXRlcmF0aW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICBpZiAoIWl0ZXJhdGluZykge1xuICAgICAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICAgIHZhciBrID0gZW50cnlbMF07XG4gICAgICAgIHZhciB2ID0gZW50cnlbMV07XG4gICAgICAgIGlmICghcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgdGhpcyQwKSkge1xuICAgICAgICAgIGl0ZXJhdGluZyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gSVRFUkFURV9FTlRSSUVTID8gc3RlcCA6XG4gICAgICAgICAgaXRlcmF0b3JWYWx1ZSh0eXBlLCBrLCB2LCBzdGVwKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHRha2VTZXF1ZW5jZTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gc2tpcFdoaWxlRmFjdG9yeShpdGVyYWJsZSwgcHJlZGljYXRlLCBjb250ZXh0LCB1c2VLZXlzKSB7XG4gICAgdmFyIHNraXBTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShpdGVyYWJsZSk7XG4gICAgc2tpcFNlcXVlbmNlLl9faXRlcmF0ZVVuY2FjaGVkID0gZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXNTa2lwcGluZyA9IHRydWU7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICBpdGVyYWJsZS5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaywgYykgIHtcbiAgICAgICAgaWYgKCEoaXNTa2lwcGluZyAmJiAoaXNTa2lwcGluZyA9IHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHYsIGssIGMpKSkpIHtcbiAgICAgICAgICBpdGVyYXRpb25zKys7XG4gICAgICAgICAgcmV0dXJuIGZuKHYsIHVzZUtleXMgPyBrIDogaXRlcmF0aW9ucyAtIDEsIHRoaXMkMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfTtcbiAgICBza2lwU2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmFibGUuX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMsIHJldmVyc2UpO1xuICAgICAgdmFyIHNraXBwaW5nID0gdHJ1ZTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgc3RlcCwgaywgdjtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgICAgaWYgKHVzZUtleXMgfHwgdHlwZSA9PT0gSVRFUkFURV9WQUxVRVMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IElURVJBVEVfS0VZUykge1xuICAgICAgICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHVuZGVmaW5lZCwgc3RlcCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHN0ZXAudmFsdWVbMV0sIHN0ZXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgZW50cnkgPSBzdGVwLnZhbHVlO1xuICAgICAgICAgIGsgPSBlbnRyeVswXTtcbiAgICAgICAgICB2ID0gZW50cnlbMV07XG4gICAgICAgICAgc2tpcHBpbmcgJiYgKHNraXBwaW5nID0gcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgdGhpcyQwKSk7XG4gICAgICAgIH0gd2hpbGUgKHNraXBwaW5nKTtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IElURVJBVEVfRU5UUklFUyA/IHN0ZXAgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgaywgdiwgc3RlcCk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBza2lwU2VxdWVuY2U7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGNvbmNhdEZhY3RvcnkoaXRlcmFibGUsIHZhbHVlcykge1xuICAgIHZhciBpc0tleWVkSXRlcmFibGUgPSBpc0tleWVkKGl0ZXJhYmxlKTtcbiAgICB2YXIgaXRlcnMgPSBbaXRlcmFibGVdLmNvbmNhdCh2YWx1ZXMpLm1hcChmdW5jdGlvbih2ICkge1xuICAgICAgaWYgKCFpc0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgIHYgPSBpc0tleWVkSXRlcmFibGUgP1xuICAgICAgICAgIGtleWVkU2VxRnJvbVZhbHVlKHYpIDpcbiAgICAgICAgICBpbmRleGVkU2VxRnJvbVZhbHVlKEFycmF5LmlzQXJyYXkodikgPyB2IDogW3ZdKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNLZXllZEl0ZXJhYmxlKSB7XG4gICAgICAgIHYgPSBLZXllZEl0ZXJhYmxlKHYpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHY7XG4gICAgfSkuZmlsdGVyKGZ1bmN0aW9uKHYgKSB7cmV0dXJuIHYuc2l6ZSAhPT0gMH0pO1xuXG4gICAgaWYgKGl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgIH1cblxuICAgIGlmIChpdGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBzaW5nbGV0b24gPSBpdGVyc1swXTtcbiAgICAgIGlmIChzaW5nbGV0b24gPT09IGl0ZXJhYmxlIHx8XG4gICAgICAgICAgaXNLZXllZEl0ZXJhYmxlICYmIGlzS2V5ZWQoc2luZ2xldG9uKSB8fFxuICAgICAgICAgIGlzSW5kZXhlZChpdGVyYWJsZSkgJiYgaXNJbmRleGVkKHNpbmdsZXRvbikpIHtcbiAgICAgICAgcmV0dXJuIHNpbmdsZXRvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY29uY2F0U2VxID0gbmV3IEFycmF5U2VxKGl0ZXJzKTtcbiAgICBpZiAoaXNLZXllZEl0ZXJhYmxlKSB7XG4gICAgICBjb25jYXRTZXEgPSBjb25jYXRTZXEudG9LZXllZFNlcSgpO1xuICAgIH0gZWxzZSBpZiAoIWlzSW5kZXhlZChpdGVyYWJsZSkpIHtcbiAgICAgIGNvbmNhdFNlcSA9IGNvbmNhdFNlcS50b1NldFNlcSgpO1xuICAgIH1cbiAgICBjb25jYXRTZXEgPSBjb25jYXRTZXEuZmxhdHRlbih0cnVlKTtcbiAgICBjb25jYXRTZXEuc2l6ZSA9IGl0ZXJzLnJlZHVjZShcbiAgICAgIGZ1bmN0aW9uKHN1bSwgc2VxKSAge1xuICAgICAgICBpZiAoc3VtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB2YXIgc2l6ZSA9IHNlcS5zaXplO1xuICAgICAgICAgIGlmIChzaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzdW0gKyBzaXplO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIDBcbiAgICApO1xuICAgIHJldHVybiBjb25jYXRTZXE7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGZsYXR0ZW5GYWN0b3J5KGl0ZXJhYmxlLCBkZXB0aCwgdXNlS2V5cykge1xuICAgIHZhciBmbGF0U2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoaXRlcmFibGUpO1xuICAgIGZsYXRTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgZnVuY3Rpb24gZmxhdERlZXAoaXRlciwgY3VycmVudERlcHRoKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICAgIGl0ZXIuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGspICB7XG4gICAgICAgICAgaWYgKCghZGVwdGggfHwgY3VycmVudERlcHRoIDwgZGVwdGgpICYmIGlzSXRlcmFibGUodikpIHtcbiAgICAgICAgICAgIGZsYXREZWVwKHYsIGN1cnJlbnREZXB0aCArIDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZm4odiwgdXNlS2V5cyA/IGsgOiBpdGVyYXRpb25zKyssIHRoaXMkMCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICFzdG9wcGVkO1xuICAgICAgICB9LCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIGZsYXREZWVwKGl0ZXJhYmxlLCAwKTtcbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH1cbiAgICBmbGF0U2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmFibGUuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICAgIHZhciBzdGFjayA9IFtdO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHdoaWxlIChpdGVyYXRvcikge1xuICAgICAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgIGlmIChzdGVwLmRvbmUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpdGVyYXRvciA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB2ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgICBpZiAodHlwZSA9PT0gSVRFUkFURV9FTlRSSUVTKSB7XG4gICAgICAgICAgICB2ID0gdlsxXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCghZGVwdGggfHwgc3RhY2subGVuZ3RoIDwgZGVwdGgpICYmIGlzSXRlcmFibGUodikpIHtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goaXRlcmF0b3IpO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSB2Ll9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB1c2VLZXlzID8gc3RlcCA6IGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCB2LCBzdGVwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yRG9uZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmbGF0U2VxdWVuY2U7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGZsYXRNYXBGYWN0b3J5KGl0ZXJhYmxlLCBtYXBwZXIsIGNvbnRleHQpIHtcbiAgICB2YXIgY29lcmNlID0gaXRlcmFibGVDbGFzcyhpdGVyYWJsZSk7XG4gICAgcmV0dXJuIGl0ZXJhYmxlLnRvU2VxKCkubWFwKFxuICAgICAgZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gY29lcmNlKG1hcHBlci5jYWxsKGNvbnRleHQsIHYsIGssIGl0ZXJhYmxlKSl9XG4gICAgKS5mbGF0dGVuKHRydWUpO1xuICB9XG5cblxuICBmdW5jdGlvbiBpbnRlcnBvc2VGYWN0b3J5KGl0ZXJhYmxlLCBzZXBhcmF0b3IpIHtcbiAgICB2YXIgaW50ZXJwb3NlZFNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGl0ZXJhYmxlKTtcbiAgICBpbnRlcnBvc2VkU2VxdWVuY2Uuc2l6ZSA9IGl0ZXJhYmxlLnNpemUgJiYgaXRlcmFibGUuc2l6ZSAqIDIgLTE7XG4gICAgaW50ZXJwb3NlZFNlcXVlbmNlLl9faXRlcmF0ZVVuY2FjaGVkID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIGl0ZXJhYmxlLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrKSBcbiAgICAgICAge3JldHVybiAoIWl0ZXJhdGlvbnMgfHwgZm4oc2VwYXJhdG9yLCBpdGVyYXRpb25zKyssIHRoaXMkMCkgIT09IGZhbHNlKSAmJlxuICAgICAgICBmbih2LCBpdGVyYXRpb25zKyssIHRoaXMkMCkgIT09IGZhbHNlfSxcbiAgICAgICAgcmV2ZXJzZVxuICAgICAgKTtcbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH07XG4gICAgaW50ZXJwb3NlZFNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhYmxlLl9faXRlcmF0b3IoSVRFUkFURV9WQUxVRVMsIHJldmVyc2UpO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIHN0ZXA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgaWYgKCFzdGVwIHx8IGl0ZXJhdGlvbnMgJSAyKSB7XG4gICAgICAgICAgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICBpZiAoc3RlcC5kb25lKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZXJhdGlvbnMgJSAyID9cbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIGl0ZXJhdGlvbnMrKywgc2VwYXJhdG9yKSA6XG4gICAgICAgICAgaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHN0ZXAudmFsdWUsIHN0ZXApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gaW50ZXJwb3NlZFNlcXVlbmNlO1xuICB9XG5cblxuICBmdW5jdGlvbiBzb3J0RmFjdG9yeShpdGVyYWJsZSwgY29tcGFyYXRvciwgbWFwcGVyKSB7XG4gICAgaWYgKCFjb21wYXJhdG9yKSB7XG4gICAgICBjb21wYXJhdG9yID0gZGVmYXVsdENvbXBhcmF0b3I7XG4gICAgfVxuICAgIHZhciBpc0tleWVkSXRlcmFibGUgPSBpc0tleWVkKGl0ZXJhYmxlKTtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBlbnRyaWVzID0gaXRlcmFibGUudG9TZXEoKS5tYXAoXG4gICAgICBmdW5jdGlvbih2LCBrKSAge3JldHVybiBbaywgdiwgaW5kZXgrKywgbWFwcGVyID8gbWFwcGVyKHYsIGssIGl0ZXJhYmxlKSA6IHZdfVxuICAgICkudG9BcnJheSgpO1xuICAgIGVudHJpZXMuc29ydChmdW5jdGlvbihhLCBiKSAge3JldHVybiBjb21wYXJhdG9yKGFbM10sIGJbM10pIHx8IGFbMl0gLSBiWzJdfSkuZm9yRWFjaChcbiAgICAgIGlzS2V5ZWRJdGVyYWJsZSA/XG4gICAgICBmdW5jdGlvbih2LCBpKSAgeyBlbnRyaWVzW2ldLmxlbmd0aCA9IDI7IH0gOlxuICAgICAgZnVuY3Rpb24odiwgaSkgIHsgZW50cmllc1tpXSA9IHZbMV07IH1cbiAgICApO1xuICAgIHJldHVybiBpc0tleWVkSXRlcmFibGUgPyBLZXllZFNlcShlbnRyaWVzKSA6XG4gICAgICBpc0luZGV4ZWQoaXRlcmFibGUpID8gSW5kZXhlZFNlcShlbnRyaWVzKSA6XG4gICAgICBTZXRTZXEoZW50cmllcyk7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIG1heEZhY3RvcnkoaXRlcmFibGUsIGNvbXBhcmF0b3IsIG1hcHBlcikge1xuICAgIGlmICghY29tcGFyYXRvcikge1xuICAgICAgY29tcGFyYXRvciA9IGRlZmF1bHRDb21wYXJhdG9yO1xuICAgIH1cbiAgICBpZiAobWFwcGVyKSB7XG4gICAgICB2YXIgZW50cnkgPSBpdGVyYWJsZS50b1NlcSgpXG4gICAgICAgIC5tYXAoZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gW3YsIG1hcHBlcih2LCBrLCBpdGVyYWJsZSldfSlcbiAgICAgICAgLnJlZHVjZShmdW5jdGlvbihhLCBiKSAge3JldHVybiBtYXhDb21wYXJlKGNvbXBhcmF0b3IsIGFbMV0sIGJbMV0pID8gYiA6IGF9KTtcbiAgICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeVswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGl0ZXJhYmxlLnJlZHVjZShmdW5jdGlvbihhLCBiKSAge3JldHVybiBtYXhDb21wYXJlKGNvbXBhcmF0b3IsIGEsIGIpID8gYiA6IGF9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYXhDb21wYXJlKGNvbXBhcmF0b3IsIGEsIGIpIHtcbiAgICB2YXIgY29tcCA9IGNvbXBhcmF0b3IoYiwgYSk7XG4gICAgLy8gYiBpcyBjb25zaWRlcmVkIHRoZSBuZXcgbWF4IGlmIHRoZSBjb21wYXJhdG9yIGRlY2xhcmVzIHRoZW0gZXF1YWwsIGJ1dFxuICAgIC8vIHRoZXkgYXJlIG5vdCBlcXVhbCBhbmQgYiBpcyBpbiBmYWN0IGEgbnVsbGlzaCB2YWx1ZS5cbiAgICByZXR1cm4gKGNvbXAgPT09IDAgJiYgYiAhPT0gYSAmJiAoYiA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IG51bGwgfHwgYiAhPT0gYikpIHx8IGNvbXAgPiAwO1xuICB9XG5cblxuICBmdW5jdGlvbiB6aXBXaXRoRmFjdG9yeShrZXlJdGVyLCB6aXBwZXIsIGl0ZXJzKSB7XG4gICAgdmFyIHppcFNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGtleUl0ZXIpO1xuICAgIHppcFNlcXVlbmNlLnNpemUgPSBuZXcgQXJyYXlTZXEoaXRlcnMpLm1hcChmdW5jdGlvbihpICkge3JldHVybiBpLnNpemV9KS5taW4oKTtcbiAgICAvLyBOb3RlOiB0aGlzIGEgZ2VuZXJpYyBiYXNlIGltcGxlbWVudGF0aW9uIG9mIF9faXRlcmF0ZSBpbiB0ZXJtcyBvZlxuICAgIC8vIF9faXRlcmF0b3Igd2hpY2ggbWF5IGJlIG1vcmUgZ2VuZXJpY2FsbHkgdXNlZnVsIGluIHRoZSBmdXR1cmUuXG4gICAgemlwU2VxdWVuY2UuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIC8qIGdlbmVyaWM6XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLl9faXRlcmF0b3IoSVRFUkFURV9FTlRSSUVTLCByZXZlcnNlKTtcbiAgICAgIHZhciBzdGVwO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICBpdGVyYXRpb25zKys7XG4gICAgICAgIGlmIChmbihzdGVwLnZhbHVlWzFdLCBzdGVwLnZhbHVlWzBdLCB0aGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgICAqL1xuICAgICAgLy8gaW5kZXhlZDpcbiAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX19pdGVyYXRvcihJVEVSQVRFX1ZBTFVFUywgcmV2ZXJzZSk7XG4gICAgICB2YXIgc3RlcDtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHdoaWxlICghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgaWYgKGZuKHN0ZXAudmFsdWUsIGl0ZXJhdGlvbnMrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH07XG4gICAgemlwU2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGl0ZXJhdG9ycyA9IGl0ZXJzLm1hcChmdW5jdGlvbihpIClcbiAgICAgICAge3JldHVybiAoaSA9IEl0ZXJhYmxlKGkpLCBnZXRJdGVyYXRvcihyZXZlcnNlID8gaS5yZXZlcnNlKCkgOiBpKSl9XG4gICAgICApO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIGlzRG9uZSA9IGZhbHNlO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHZhciBzdGVwcztcbiAgICAgICAgaWYgKCFpc0RvbmUpIHtcbiAgICAgICAgICBzdGVwcyA9IGl0ZXJhdG9ycy5tYXAoZnVuY3Rpb24oaSApIHtyZXR1cm4gaS5uZXh0KCl9KTtcbiAgICAgICAgICBpc0RvbmUgPSBzdGVwcy5zb21lKGZ1bmN0aW9uKHMgKSB7cmV0dXJuIHMuZG9uZX0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RvbmUpIHtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUoXG4gICAgICAgICAgdHlwZSxcbiAgICAgICAgICBpdGVyYXRpb25zKyssXG4gICAgICAgICAgemlwcGVyLmFwcGx5KG51bGwsIHN0ZXBzLm1hcChmdW5jdGlvbihzICkge3JldHVybiBzLnZhbHVlfSkpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiB6aXBTZXF1ZW5jZVxuICB9XG5cblxuICAvLyAjcHJhZ21hIEhlbHBlciBGdW5jdGlvbnNcblxuICBmdW5jdGlvbiByZWlmeShpdGVyLCBzZXEpIHtcbiAgICByZXR1cm4gaXNTZXEoaXRlcikgPyBzZXEgOiBpdGVyLmNvbnN0cnVjdG9yKHNlcSk7XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUVudHJ5KGVudHJ5KSB7XG4gICAgaWYgKGVudHJ5ICE9PSBPYmplY3QoZW50cnkpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBbSywgVl0gdHVwbGU6ICcgKyBlbnRyeSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZVNpemUoaXRlcikge1xuICAgIGFzc2VydE5vdEluZmluaXRlKGl0ZXIuc2l6ZSk7XG4gICAgcmV0dXJuIGVuc3VyZVNpemUoaXRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBpdGVyYWJsZUNsYXNzKGl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuIGlzS2V5ZWQoaXRlcmFibGUpID8gS2V5ZWRJdGVyYWJsZSA6XG4gICAgICBpc0luZGV4ZWQoaXRlcmFibGUpID8gSW5kZXhlZEl0ZXJhYmxlIDpcbiAgICAgIFNldEl0ZXJhYmxlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFrZVNlcXVlbmNlKGl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoXG4gICAgICAoXG4gICAgICAgIGlzS2V5ZWQoaXRlcmFibGUpID8gS2V5ZWRTZXEgOlxuICAgICAgICBpc0luZGV4ZWQoaXRlcmFibGUpID8gSW5kZXhlZFNlcSA6XG4gICAgICAgIFNldFNlcVxuICAgICAgKS5wcm90b3R5cGVcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FjaGVSZXN1bHRUaHJvdWdoKCkge1xuICAgIGlmICh0aGlzLl9pdGVyLmNhY2hlUmVzdWx0KSB7XG4gICAgICB0aGlzLl9pdGVyLmNhY2hlUmVzdWx0KCk7XG4gICAgICB0aGlzLnNpemUgPSB0aGlzLl9pdGVyLnNpemU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFNlcS5wcm90b3R5cGUuY2FjaGVSZXN1bHQuY2FsbCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZWZhdWx0Q29tcGFyYXRvcihhLCBiKSB7XG4gICAgcmV0dXJuIGEgPiBiID8gMSA6IGEgPCBiID8gLTEgOiAwO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9yY2VJdGVyYXRvcihrZXlQYXRoKSB7XG4gICAgdmFyIGl0ZXIgPSBnZXRJdGVyYXRvcihrZXlQYXRoKTtcbiAgICBpZiAoIWl0ZXIpIHtcbiAgICAgIC8vIEFycmF5IG1pZ2h0IG5vdCBiZSBpdGVyYWJsZSBpbiB0aGlzIGVudmlyb25tZW50LCBzbyB3ZSBuZWVkIGEgZmFsbGJhY2tcbiAgICAgIC8vIHRvIG91ciB3cmFwcGVkIHR5cGUuXG4gICAgICBpZiAoIWlzQXJyYXlMaWtlKGtleVBhdGgpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGl0ZXJhYmxlIG9yIGFycmF5LWxpa2U6ICcgKyBrZXlQYXRoKTtcbiAgICAgIH1cbiAgICAgIGl0ZXIgPSBnZXRJdGVyYXRvcihJdGVyYWJsZShrZXlQYXRoKSk7XG4gICAgfVxuICAgIHJldHVybiBpdGVyO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoTWFwLCBLZXllZENvbGxlY3Rpb24pO1xuXG4gICAgLy8gQHByYWdtYSBDb25zdHJ1Y3Rpb25cblxuICAgIGZ1bmN0aW9uIE1hcCh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyBlbXB0eU1hcCgpIDpcbiAgICAgICAgaXNNYXAodmFsdWUpID8gdmFsdWUgOlxuICAgICAgICBlbXB0eU1hcCgpLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24obWFwICkge1xuICAgICAgICAgIHZhciBpdGVyID0gS2V5ZWRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICAgICAgYXNzZXJ0Tm90SW5maW5pdGUoaXRlci5zaXplKTtcbiAgICAgICAgICBpdGVyLmZvckVhY2goZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gbWFwLnNldChrLCB2KX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBNYXAucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKCdNYXAgeycsICd9Jyk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgQWNjZXNzXG5cbiAgICBNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGssIG5vdFNldFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcm9vdCA/XG4gICAgICAgIHRoaXMuX3Jvb3QuZ2V0KDAsIHVuZGVmaW5lZCwgaywgbm90U2V0VmFsdWUpIDpcbiAgICAgICAgbm90U2V0VmFsdWU7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgICBNYXAucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgIHJldHVybiB1cGRhdGVNYXAodGhpcywgaywgdik7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuc2V0SW4gPSBmdW5jdGlvbihrZXlQYXRoLCB2KSB7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVJbihrZXlQYXRoLCBOT1RfU0VULCBmdW5jdGlvbigpICB7cmV0dXJuIHZ9KTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4gdXBkYXRlTWFwKHRoaXMsIGssIE5PVF9TRVQpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLmRlbGV0ZUluID0gZnVuY3Rpb24oa2V5UGF0aCkge1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlSW4oa2V5UGF0aCwgZnVuY3Rpb24oKSAge3JldHVybiBOT1RfU0VUfSk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oaywgbm90U2V0VmFsdWUsIHVwZGF0ZXIpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID9cbiAgICAgICAgayh0aGlzKSA6XG4gICAgICAgIHRoaXMudXBkYXRlSW4oW2tdLCBub3RTZXRWYWx1ZSwgdXBkYXRlcik7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUudXBkYXRlSW4gPSBmdW5jdGlvbihrZXlQYXRoLCBub3RTZXRWYWx1ZSwgdXBkYXRlcikge1xuICAgICAgaWYgKCF1cGRhdGVyKSB7XG4gICAgICAgIHVwZGF0ZXIgPSBub3RTZXRWYWx1ZTtcbiAgICAgICAgbm90U2V0VmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICB2YXIgdXBkYXRlZFZhbHVlID0gdXBkYXRlSW5EZWVwTWFwKFxuICAgICAgICB0aGlzLFxuICAgICAgICBmb3JjZUl0ZXJhdG9yKGtleVBhdGgpLFxuICAgICAgICBub3RTZXRWYWx1ZSxcbiAgICAgICAgdXBkYXRlclxuICAgICAgKTtcbiAgICAgIHJldHVybiB1cGRhdGVkVmFsdWUgPT09IE5PVF9TRVQgPyB1bmRlZmluZWQgOiB1cGRhdGVkVmFsdWU7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5fcm9vdCA9IG51bGw7XG4gICAgICAgIHRoaXMuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVtcHR5TWFwKCk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgQ29tcG9zaXRpb25cblxuICAgIE1hcC5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbigvKi4uLml0ZXJzKi8pIHtcbiAgICAgIHJldHVybiBtZXJnZUludG9NYXBXaXRoKHRoaXMsIHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5tZXJnZVdpdGggPSBmdW5jdGlvbihtZXJnZXIpIHt2YXIgaXRlcnMgPSBTTElDRSQwLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBtZXJnZUludG9NYXBXaXRoKHRoaXMsIG1lcmdlciwgaXRlcnMpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLm1lcmdlSW4gPSBmdW5jdGlvbihrZXlQYXRoKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVJbihrZXlQYXRoLCBlbXB0eU1hcCgpLCBmdW5jdGlvbihtICkge3JldHVybiBtLm1lcmdlLmFwcGx5KG0sIGl0ZXJzKX0pO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLm1lcmdlRGVlcCA9IGZ1bmN0aW9uKC8qLi4uaXRlcnMqLykge1xuICAgICAgcmV0dXJuIG1lcmdlSW50b01hcFdpdGgodGhpcywgZGVlcE1lcmdlcih1bmRlZmluZWQpLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLm1lcmdlRGVlcFdpdGggPSBmdW5jdGlvbihtZXJnZXIpIHt2YXIgaXRlcnMgPSBTTElDRSQwLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBtZXJnZUludG9NYXBXaXRoKHRoaXMsIGRlZXBNZXJnZXIobWVyZ2VyKSwgaXRlcnMpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLm1lcmdlRGVlcEluID0gZnVuY3Rpb24oa2V5UGF0aCkge3ZhciBpdGVycyA9IFNMSUNFJDAuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlSW4oa2V5UGF0aCwgZW1wdHlNYXAoKSwgZnVuY3Rpb24obSApIHtyZXR1cm4gbS5tZXJnZURlZXAuYXBwbHkobSwgaXRlcnMpfSk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuc29ydCA9IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIC8vIExhdGUgYmluZGluZ1xuICAgICAgcmV0dXJuIE9yZGVyZWRNYXAoc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvcikpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLnNvcnRCeSA9IGZ1bmN0aW9uKG1hcHBlciwgY29tcGFyYXRvcikge1xuICAgICAgLy8gTGF0ZSBiaW5kaW5nXG4gICAgICByZXR1cm4gT3JkZXJlZE1hcChzb3J0RmFjdG9yeSh0aGlzLCBjb21wYXJhdG9yLCBtYXBwZXIpKTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBNdXRhYmlsaXR5XG5cbiAgICBNYXAucHJvdG90eXBlLndpdGhNdXRhdGlvbnMgPSBmdW5jdGlvbihmbikge1xuICAgICAgdmFyIG11dGFibGUgPSB0aGlzLmFzTXV0YWJsZSgpO1xuICAgICAgZm4obXV0YWJsZSk7XG4gICAgICByZXR1cm4gbXV0YWJsZS53YXNBbHRlcmVkKCkgPyBtdXRhYmxlLl9fZW5zdXJlT3duZXIodGhpcy5fX293bmVySUQpIDogdGhpcztcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5hc011dGFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fb3duZXJJRCA/IHRoaXMgOiB0aGlzLl9fZW5zdXJlT3duZXIobmV3IE93bmVySUQoKSk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuYXNJbW11dGFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fZW5zdXJlT3duZXIoKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS53YXNBbHRlcmVkID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2FsdGVyZWQ7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgdHlwZSwgcmV2ZXJzZSk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHRoaXMuX3Jvb3QgJiYgdGhpcy5fcm9vdC5pdGVyYXRlKGZ1bmN0aW9uKGVudHJ5ICkge1xuICAgICAgICBpdGVyYXRpb25zKys7XG4gICAgICAgIHJldHVybiBmbihlbnRyeVsxXSwgZW50cnlbMF0sIHRoaXMkMCk7XG4gICAgICB9LCByZXZlcnNlKTtcbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLl9fZW5zdXJlT3duZXIgPSBmdW5jdGlvbihvd25lcklEKSB7XG4gICAgICBpZiAob3duZXJJRCA9PT0gdGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpZiAoIW93bmVySUQpIHtcbiAgICAgICAgdGhpcy5fX293bmVySUQgPSBvd25lcklEO1xuICAgICAgICB0aGlzLl9fYWx0ZXJlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYWtlTWFwKHRoaXMuc2l6ZSwgdGhpcy5fcm9vdCwgb3duZXJJRCwgdGhpcy5fX2hhc2gpO1xuICAgIH07XG5cblxuICBmdW5jdGlvbiBpc01hcChtYXliZU1hcCkge1xuICAgIHJldHVybiAhIShtYXliZU1hcCAmJiBtYXliZU1hcFtJU19NQVBfU0VOVElORUxdKTtcbiAgfVxuXG4gIE1hcC5pc01hcCA9IGlzTWFwO1xuXG4gIHZhciBJU19NQVBfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9NQVBfX0BAJztcblxuICB2YXIgTWFwUHJvdG90eXBlID0gTWFwLnByb3RvdHlwZTtcbiAgTWFwUHJvdG90eXBlW0lTX01BUF9TRU5USU5FTF0gPSB0cnVlO1xuICBNYXBQcm90b3R5cGVbREVMRVRFXSA9IE1hcFByb3RvdHlwZS5yZW1vdmU7XG4gIE1hcFByb3RvdHlwZS5yZW1vdmVJbiA9IE1hcFByb3RvdHlwZS5kZWxldGVJbjtcblxuXG4gIC8vICNwcmFnbWEgVHJpZSBOb2Rlc1xuXG5cblxuICAgIGZ1bmN0aW9uIEFycmF5TWFwTm9kZShvd25lcklELCBlbnRyaWVzKSB7XG4gICAgICB0aGlzLm93bmVySUQgPSBvd25lcklEO1xuICAgICAgdGhpcy5lbnRyaWVzID0gZW50cmllcztcbiAgICB9XG5cbiAgICBBcnJheU1hcE5vZGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHNoaWZ0LCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKSB7XG4gICAgICB2YXIgZW50cmllcyA9IHRoaXMuZW50cmllcztcbiAgICAgIGZvciAodmFyIGlpID0gMCwgbGVuID0gZW50cmllcy5sZW5ndGg7IGlpIDwgbGVuOyBpaSsrKSB7XG4gICAgICAgIGlmIChpcyhrZXksIGVudHJpZXNbaWldWzBdKSkge1xuICAgICAgICAgIHJldHVybiBlbnRyaWVzW2lpXVsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICBBcnJheU1hcE5vZGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICAgICAgdmFyIHJlbW92ZWQgPSB2YWx1ZSA9PT0gTk9UX1NFVDtcblxuICAgICAgdmFyIGVudHJpZXMgPSB0aGlzLmVudHJpZXM7XG4gICAgICB2YXIgaWR4ID0gMDtcbiAgICAgIGZvciAodmFyIGxlbiA9IGVudHJpZXMubGVuZ3RoOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgICAgIGlmIChpcyhrZXksIGVudHJpZXNbaWR4XVswXSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGV4aXN0cyA9IGlkeCA8IGxlbjtcblxuICAgICAgaWYgKGV4aXN0cyA/IGVudHJpZXNbaWR4XVsxXSA9PT0gdmFsdWUgOiByZW1vdmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBTZXRSZWYoZGlkQWx0ZXIpO1xuICAgICAgKHJlbW92ZWQgfHwgIWV4aXN0cykgJiYgU2V0UmVmKGRpZENoYW5nZVNpemUpO1xuXG4gICAgICBpZiAocmVtb3ZlZCAmJiBlbnRyaWVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm47IC8vIHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICBpZiAoIWV4aXN0cyAmJiAhcmVtb3ZlZCAmJiBlbnRyaWVzLmxlbmd0aCA+PSBNQVhfQVJSQVlfTUFQX1NJWkUpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU5vZGVzKG93bmVySUQsIGVudHJpZXMsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXNFZGl0YWJsZSA9IG93bmVySUQgJiYgb3duZXJJRCA9PT0gdGhpcy5vd25lcklEO1xuICAgICAgdmFyIG5ld0VudHJpZXMgPSBpc0VkaXRhYmxlID8gZW50cmllcyA6IGFyckNvcHkoZW50cmllcyk7XG5cbiAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgICAgICBpZHggPT09IGxlbiAtIDEgPyBuZXdFbnRyaWVzLnBvcCgpIDogKG5ld0VudHJpZXNbaWR4XSA9IG5ld0VudHJpZXMucG9wKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld0VudHJpZXNbaWR4XSA9IFtrZXksIHZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3RW50cmllcy5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VkaXRhYmxlKSB7XG4gICAgICAgIHRoaXMuZW50cmllcyA9IG5ld0VudHJpZXM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IEFycmF5TWFwTm9kZShvd25lcklELCBuZXdFbnRyaWVzKTtcbiAgICB9O1xuXG5cblxuXG4gICAgZnVuY3Rpb24gQml0bWFwSW5kZXhlZE5vZGUob3duZXJJRCwgYml0bWFwLCBub2Rlcykge1xuICAgICAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgICAgIHRoaXMuYml0bWFwID0gYml0bWFwO1xuICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xuICAgIH1cblxuICAgIEJpdG1hcEluZGV4ZWROb2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihzaGlmdCwga2V5SGFzaCwga2V5LCBub3RTZXRWYWx1ZSkge1xuICAgICAgaWYgKGtleUhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXlIYXNoID0gaGFzaChrZXkpO1xuICAgICAgfVxuICAgICAgdmFyIGJpdCA9ICgxIDw8ICgoc2hpZnQgPT09IDAgPyBrZXlIYXNoIDoga2V5SGFzaCA+Pj4gc2hpZnQpICYgTUFTSykpO1xuICAgICAgdmFyIGJpdG1hcCA9IHRoaXMuYml0bWFwO1xuICAgICAgcmV0dXJuIChiaXRtYXAgJiBiaXQpID09PSAwID8gbm90U2V0VmFsdWUgOlxuICAgICAgICB0aGlzLm5vZGVzW3BvcENvdW50KGJpdG1hcCAmIChiaXQgLSAxKSldLmdldChzaGlmdCArIFNISUZULCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKTtcbiAgICB9O1xuXG4gICAgQml0bWFwSW5kZXhlZE5vZGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICAgICAgaWYgKGtleUhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXlIYXNoID0gaGFzaChrZXkpO1xuICAgICAgfVxuICAgICAgdmFyIGtleUhhc2hGcmFnID0gKHNoaWZ0ID09PSAwID8ga2V5SGFzaCA6IGtleUhhc2ggPj4+IHNoaWZ0KSAmIE1BU0s7XG4gICAgICB2YXIgYml0ID0gMSA8PCBrZXlIYXNoRnJhZztcbiAgICAgIHZhciBiaXRtYXAgPSB0aGlzLmJpdG1hcDtcbiAgICAgIHZhciBleGlzdHMgPSAoYml0bWFwICYgYml0KSAhPT0gMDtcblxuICAgICAgaWYgKCFleGlzdHMgJiYgdmFsdWUgPT09IE5PVF9TRVQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciBpZHggPSBwb3BDb3VudChiaXRtYXAgJiAoYml0IC0gMSkpO1xuICAgICAgdmFyIG5vZGVzID0gdGhpcy5ub2RlcztcbiAgICAgIHZhciBub2RlID0gZXhpc3RzID8gbm9kZXNbaWR4XSA6IHVuZGVmaW5lZDtcbiAgICAgIHZhciBuZXdOb2RlID0gdXBkYXRlTm9kZShub2RlLCBvd25lcklELCBzaGlmdCArIFNISUZULCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcik7XG5cbiAgICAgIGlmIChuZXdOb2RlID09PSBub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWV4aXN0cyAmJiBuZXdOb2RlICYmIG5vZGVzLmxlbmd0aCA+PSBNQVhfQklUTUFQX0lOREVYRURfU0laRSkge1xuICAgICAgICByZXR1cm4gZXhwYW5kTm9kZXMob3duZXJJRCwgbm9kZXMsIGJpdG1hcCwga2V5SGFzaEZyYWcsIG5ld05vZGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3RzICYmICFuZXdOb2RlICYmIG5vZGVzLmxlbmd0aCA9PT0gMiAmJiBpc0xlYWZOb2RlKG5vZGVzW2lkeCBeIDFdKSkge1xuICAgICAgICByZXR1cm4gbm9kZXNbaWR4IF4gMV07XG4gICAgICB9XG5cbiAgICAgIGlmIChleGlzdHMgJiYgbmV3Tm9kZSAmJiBub2Rlcy5sZW5ndGggPT09IDEgJiYgaXNMZWFmTm9kZShuZXdOb2RlKSkge1xuICAgICAgICByZXR1cm4gbmV3Tm9kZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGlzRWRpdGFibGUgPSBvd25lcklEICYmIG93bmVySUQgPT09IHRoaXMub3duZXJJRDtcbiAgICAgIHZhciBuZXdCaXRtYXAgPSBleGlzdHMgPyBuZXdOb2RlID8gYml0bWFwIDogYml0bWFwIF4gYml0IDogYml0bWFwIHwgYml0O1xuICAgICAgdmFyIG5ld05vZGVzID0gZXhpc3RzID8gbmV3Tm9kZSA/XG4gICAgICAgIHNldEluKG5vZGVzLCBpZHgsIG5ld05vZGUsIGlzRWRpdGFibGUpIDpcbiAgICAgICAgc3BsaWNlT3V0KG5vZGVzLCBpZHgsIGlzRWRpdGFibGUpIDpcbiAgICAgICAgc3BsaWNlSW4obm9kZXMsIGlkeCwgbmV3Tm9kZSwgaXNFZGl0YWJsZSk7XG5cbiAgICAgIGlmIChpc0VkaXRhYmxlKSB7XG4gICAgICAgIHRoaXMuYml0bWFwID0gbmV3Qml0bWFwO1xuICAgICAgICB0aGlzLm5vZGVzID0gbmV3Tm9kZXM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IEJpdG1hcEluZGV4ZWROb2RlKG93bmVySUQsIG5ld0JpdG1hcCwgbmV3Tm9kZXMpO1xuICAgIH07XG5cblxuXG5cbiAgICBmdW5jdGlvbiBIYXNoQXJyYXlNYXBOb2RlKG93bmVySUQsIGNvdW50LCBub2Rlcykge1xuICAgICAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgICAgIHRoaXMuY291bnQgPSBjb3VudDtcbiAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcbiAgICB9XG5cbiAgICBIYXNoQXJyYXlNYXBOb2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihzaGlmdCwga2V5SGFzaCwga2V5LCBub3RTZXRWYWx1ZSkge1xuICAgICAgaWYgKGtleUhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXlIYXNoID0gaGFzaChrZXkpO1xuICAgICAgfVxuICAgICAgdmFyIGlkeCA9IChzaGlmdCA9PT0gMCA/IGtleUhhc2ggOiBrZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLO1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGVzW2lkeF07XG4gICAgICByZXR1cm4gbm9kZSA/IG5vZGUuZ2V0KHNoaWZ0ICsgU0hJRlQsIGtleUhhc2gsIGtleSwgbm90U2V0VmFsdWUpIDogbm90U2V0VmFsdWU7XG4gICAgfTtcblxuICAgIEhhc2hBcnJheU1hcE5vZGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICAgICAgaWYgKGtleUhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXlIYXNoID0gaGFzaChrZXkpO1xuICAgICAgfVxuICAgICAgdmFyIGlkeCA9IChzaGlmdCA9PT0gMCA/IGtleUhhc2ggOiBrZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLO1xuICAgICAgdmFyIHJlbW92ZWQgPSB2YWx1ZSA9PT0gTk9UX1NFVDtcbiAgICAgIHZhciBub2RlcyA9IHRoaXMubm9kZXM7XG4gICAgICB2YXIgbm9kZSA9IG5vZGVzW2lkeF07XG5cbiAgICAgIGlmIChyZW1vdmVkICYmICFub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmV3Tm9kZSA9IHVwZGF0ZU5vZGUobm9kZSwgb3duZXJJRCwgc2hpZnQgKyBTSElGVCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpO1xuICAgICAgaWYgKG5ld05vZGUgPT09IG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdDb3VudCA9IHRoaXMuY291bnQ7XG4gICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgbmV3Q291bnQrKztcbiAgICAgIH0gZWxzZSBpZiAoIW5ld05vZGUpIHtcbiAgICAgICAgbmV3Q291bnQtLTtcbiAgICAgICAgaWYgKG5ld0NvdW50IDwgTUlOX0hBU0hfQVJSQVlfTUFQX1NJWkUpIHtcbiAgICAgICAgICByZXR1cm4gcGFja05vZGVzKG93bmVySUQsIG5vZGVzLCBuZXdDb3VudCwgaWR4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgaXNFZGl0YWJsZSA9IG93bmVySUQgJiYgb3duZXJJRCA9PT0gdGhpcy5vd25lcklEO1xuICAgICAgdmFyIG5ld05vZGVzID0gc2V0SW4obm9kZXMsIGlkeCwgbmV3Tm9kZSwgaXNFZGl0YWJsZSk7XG5cbiAgICAgIGlmIChpc0VkaXRhYmxlKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSBuZXdDb3VudDtcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5ld05vZGVzO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBIYXNoQXJyYXlNYXBOb2RlKG93bmVySUQsIG5ld0NvdW50LCBuZXdOb2Rlcyk7XG4gICAgfTtcblxuXG5cblxuICAgIGZ1bmN0aW9uIEhhc2hDb2xsaXNpb25Ob2RlKG93bmVySUQsIGtleUhhc2gsIGVudHJpZXMpIHtcbiAgICAgIHRoaXMub3duZXJJRCA9IG93bmVySUQ7XG4gICAgICB0aGlzLmtleUhhc2ggPSBrZXlIYXNoO1xuICAgICAgdGhpcy5lbnRyaWVzID0gZW50cmllcztcbiAgICB9XG5cbiAgICBIYXNoQ29sbGlzaW9uTm9kZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oc2hpZnQsIGtleUhhc2gsIGtleSwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHZhciBlbnRyaWVzID0gdGhpcy5lbnRyaWVzO1xuICAgICAgZm9yICh2YXIgaWkgPSAwLCBsZW4gPSBlbnRyaWVzLmxlbmd0aDsgaWkgPCBsZW47IGlpKyspIHtcbiAgICAgICAgaWYgKGlzKGtleSwgZW50cmllc1tpaV1bMF0pKSB7XG4gICAgICAgICAgcmV0dXJuIGVudHJpZXNbaWldWzFdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbm90U2V0VmFsdWU7XG4gICAgfTtcblxuICAgIEhhc2hDb2xsaXNpb25Ob2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihvd25lcklELCBzaGlmdCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpIHtcbiAgICAgIGlmIChrZXlIYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5SGFzaCA9IGhhc2goa2V5KTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlbW92ZWQgPSB2YWx1ZSA9PT0gTk9UX1NFVDtcblxuICAgICAgaWYgKGtleUhhc2ggIT09IHRoaXMua2V5SGFzaCkge1xuICAgICAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFNldFJlZihkaWRBbHRlcik7XG4gICAgICAgIFNldFJlZihkaWRDaGFuZ2VTaXplKTtcbiAgICAgICAgcmV0dXJuIG1lcmdlSW50b05vZGUodGhpcywgb3duZXJJRCwgc2hpZnQsIGtleUhhc2gsIFtrZXksIHZhbHVlXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBlbnRyaWVzID0gdGhpcy5lbnRyaWVzO1xuICAgICAgdmFyIGlkeCA9IDA7XG4gICAgICBmb3IgKHZhciBsZW4gPSBlbnRyaWVzLmxlbmd0aDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgICAgICBpZiAoaXMoa2V5LCBlbnRyaWVzW2lkeF1bMF0pKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBleGlzdHMgPSBpZHggPCBsZW47XG5cbiAgICAgIGlmIChleGlzdHMgPyBlbnRyaWVzW2lkeF1bMV0gPT09IHZhbHVlIDogcmVtb3ZlZCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgU2V0UmVmKGRpZEFsdGVyKTtcbiAgICAgIChyZW1vdmVkIHx8ICFleGlzdHMpICYmIFNldFJlZihkaWRDaGFuZ2VTaXplKTtcblxuICAgICAgaWYgKHJlbW92ZWQgJiYgbGVuID09PSAyKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmFsdWVOb2RlKG93bmVySUQsIHRoaXMua2V5SGFzaCwgZW50cmllc1tpZHggXiAxXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBpc0VkaXRhYmxlID0gb3duZXJJRCAmJiBvd25lcklEID09PSB0aGlzLm93bmVySUQ7XG4gICAgICB2YXIgbmV3RW50cmllcyA9IGlzRWRpdGFibGUgPyBlbnRyaWVzIDogYXJyQ29weShlbnRyaWVzKTtcblxuICAgICAgaWYgKGV4aXN0cykge1xuICAgICAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgICAgIGlkeCA9PT0gbGVuIC0gMSA/IG5ld0VudHJpZXMucG9wKCkgOiAobmV3RW50cmllc1tpZHhdID0gbmV3RW50cmllcy5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3RW50cmllc1tpZHhdID0gW2tleSwgdmFsdWVdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdFbnRyaWVzLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRWRpdGFibGUpIHtcbiAgICAgICAgdGhpcy5lbnRyaWVzID0gbmV3RW50cmllcztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgSGFzaENvbGxpc2lvbk5vZGUob3duZXJJRCwgdGhpcy5rZXlIYXNoLCBuZXdFbnRyaWVzKTtcbiAgICB9O1xuXG5cblxuXG4gICAgZnVuY3Rpb24gVmFsdWVOb2RlKG93bmVySUQsIGtleUhhc2gsIGVudHJ5KSB7XG4gICAgICB0aGlzLm93bmVySUQgPSBvd25lcklEO1xuICAgICAgdGhpcy5rZXlIYXNoID0ga2V5SGFzaDtcbiAgICAgIHRoaXMuZW50cnkgPSBlbnRyeTtcbiAgICB9XG5cbiAgICBWYWx1ZU5vZGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHNoaWZ0LCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKSB7XG4gICAgICByZXR1cm4gaXMoa2V5LCB0aGlzLmVudHJ5WzBdKSA/IHRoaXMuZW50cnlbMV0gOiBub3RTZXRWYWx1ZTtcbiAgICB9O1xuXG4gICAgVmFsdWVOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihvd25lcklELCBzaGlmdCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpIHtcbiAgICAgIHZhciByZW1vdmVkID0gdmFsdWUgPT09IE5PVF9TRVQ7XG4gICAgICB2YXIga2V5TWF0Y2ggPSBpcyhrZXksIHRoaXMuZW50cnlbMF0pO1xuICAgICAgaWYgKGtleU1hdGNoID8gdmFsdWUgPT09IHRoaXMuZW50cnlbMV0gOiByZW1vdmVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBTZXRSZWYoZGlkQWx0ZXIpO1xuXG4gICAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgICBTZXRSZWYoZGlkQ2hhbmdlU2l6ZSk7XG4gICAgICAgIHJldHVybjsgLy8gdW5kZWZpbmVkXG4gICAgICB9XG5cbiAgICAgIGlmIChrZXlNYXRjaCkge1xuICAgICAgICBpZiAob3duZXJJRCAmJiBvd25lcklEID09PSB0aGlzLm93bmVySUQpIHtcbiAgICAgICAgICB0aGlzLmVudHJ5WzFdID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBWYWx1ZU5vZGUob3duZXJJRCwgdGhpcy5rZXlIYXNoLCBba2V5LCB2YWx1ZV0pO1xuICAgICAgfVxuXG4gICAgICBTZXRSZWYoZGlkQ2hhbmdlU2l6ZSk7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTm9kZSh0aGlzLCBvd25lcklELCBzaGlmdCwgaGFzaChrZXkpLCBba2V5LCB2YWx1ZV0pO1xuICAgIH07XG5cblxuXG4gIC8vICNwcmFnbWEgSXRlcmF0b3JzXG5cbiAgQXJyYXlNYXBOb2RlLnByb3RvdHlwZS5pdGVyYXRlID1cbiAgSGFzaENvbGxpc2lvbk5vZGUucHJvdG90eXBlLml0ZXJhdGUgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgZW50cmllcyA9IHRoaXMuZW50cmllcztcbiAgICBmb3IgKHZhciBpaSA9IDAsIG1heEluZGV4ID0gZW50cmllcy5sZW5ndGggLSAxOyBpaSA8PSBtYXhJbmRleDsgaWkrKykge1xuICAgICAgaWYgKGZuKGVudHJpZXNbcmV2ZXJzZSA/IG1heEluZGV4IC0gaWkgOiBpaV0pID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQml0bWFwSW5kZXhlZE5vZGUucHJvdG90eXBlLml0ZXJhdGUgPVxuICBIYXNoQXJyYXlNYXBOb2RlLnByb3RvdHlwZS5pdGVyYXRlID0gZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIG5vZGVzID0gdGhpcy5ub2RlcztcbiAgICBmb3IgKHZhciBpaSA9IDAsIG1heEluZGV4ID0gbm9kZXMubGVuZ3RoIC0gMTsgaWkgPD0gbWF4SW5kZXg7IGlpKyspIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbcmV2ZXJzZSA/IG1heEluZGV4IC0gaWkgOiBpaV07XG4gICAgICBpZiAobm9kZSAmJiBub2RlLml0ZXJhdGUoZm4sIHJldmVyc2UpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgVmFsdWVOb2RlLnByb3RvdHlwZS5pdGVyYXRlID0gZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7XG4gICAgcmV0dXJuIGZuKHRoaXMuZW50cnkpO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoTWFwSXRlcmF0b3IsIEl0ZXJhdG9yKTtcblxuICAgIGZ1bmN0aW9uIE1hcEl0ZXJhdG9yKG1hcCwgdHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gICAgICB0aGlzLl9yZXZlcnNlID0gcmV2ZXJzZTtcbiAgICAgIHRoaXMuX3N0YWNrID0gbWFwLl9yb290ICYmIG1hcEl0ZXJhdG9yRnJhbWUobWFwLl9yb290KTtcbiAgICB9XG5cbiAgICBNYXBJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHR5cGUgPSB0aGlzLl90eXBlO1xuICAgICAgdmFyIHN0YWNrID0gdGhpcy5fc3RhY2s7XG4gICAgICB3aGlsZSAoc3RhY2spIHtcbiAgICAgICAgdmFyIG5vZGUgPSBzdGFjay5ub2RlO1xuICAgICAgICB2YXIgaW5kZXggPSBzdGFjay5pbmRleCsrO1xuICAgICAgICB2YXIgbWF4SW5kZXg7XG4gICAgICAgIGlmIChub2RlLmVudHJ5KSB7XG4gICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwSXRlcmF0b3JWYWx1ZSh0eXBlLCBub2RlLmVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5lbnRyaWVzKSB7XG4gICAgICAgICAgbWF4SW5kZXggPSBub2RlLmVudHJpZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICBpZiAoaW5kZXggPD0gbWF4SW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBJdGVyYXRvclZhbHVlKHR5cGUsIG5vZGUuZW50cmllc1t0aGlzLl9yZXZlcnNlID8gbWF4SW5kZXggLSBpbmRleCA6IGluZGV4XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1heEluZGV4ID0gbm9kZS5ub2Rlcy5sZW5ndGggLSAxO1xuICAgICAgICAgIGlmIChpbmRleCA8PSBtYXhJbmRleCkge1xuICAgICAgICAgICAgdmFyIHN1Yk5vZGUgPSBub2RlLm5vZGVzW3RoaXMuX3JldmVyc2UgPyBtYXhJbmRleCAtIGluZGV4IDogaW5kZXhdO1xuICAgICAgICAgICAgaWYgKHN1Yk5vZGUpIHtcbiAgICAgICAgICAgICAgaWYgKHN1Yk5vZGUuZW50cnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFwSXRlcmF0b3JWYWx1ZSh0eXBlLCBzdWJOb2RlLmVudHJ5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzdGFjayA9IHRoaXMuX3N0YWNrID0gbWFwSXRlcmF0b3JGcmFtZShzdWJOb2RlLCBzdGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2sgPSB0aGlzLl9zdGFjayA9IHRoaXMuX3N0YWNrLl9fcHJldjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICB9O1xuXG5cbiAgZnVuY3Rpb24gbWFwSXRlcmF0b3JWYWx1ZSh0eXBlLCBlbnRyeSkge1xuICAgIHJldHVybiBpdGVyYXRvclZhbHVlKHR5cGUsIGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYXBJdGVyYXRvckZyYW1lKG5vZGUsIHByZXYpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbm9kZTogbm9kZSxcbiAgICAgIGluZGV4OiAwLFxuICAgICAgX19wcmV2OiBwcmV2XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VNYXAoc2l6ZSwgcm9vdCwgb3duZXJJRCwgaGFzaCkge1xuICAgIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKE1hcFByb3RvdHlwZSk7XG4gICAgbWFwLnNpemUgPSBzaXplO1xuICAgIG1hcC5fcm9vdCA9IHJvb3Q7XG4gICAgbWFwLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgbWFwLl9faGFzaCA9IGhhc2g7XG4gICAgbWFwLl9fYWx0ZXJlZCA9IGZhbHNlO1xuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICB2YXIgRU1QVFlfTUFQO1xuICBmdW5jdGlvbiBlbXB0eU1hcCgpIHtcbiAgICByZXR1cm4gRU1QVFlfTUFQIHx8IChFTVBUWV9NQVAgPSBtYWtlTWFwKDApKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZU1hcChtYXAsIGssIHYpIHtcbiAgICB2YXIgbmV3Um9vdDtcbiAgICB2YXIgbmV3U2l6ZTtcbiAgICBpZiAoIW1hcC5fcm9vdCkge1xuICAgICAgaWYgKHYgPT09IE5PVF9TRVQpIHtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgIH1cbiAgICAgIG5ld1NpemUgPSAxO1xuICAgICAgbmV3Um9vdCA9IG5ldyBBcnJheU1hcE5vZGUobWFwLl9fb3duZXJJRCwgW1trLCB2XV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZGlkQ2hhbmdlU2l6ZSA9IE1ha2VSZWYoQ0hBTkdFX0xFTkdUSCk7XG4gICAgICB2YXIgZGlkQWx0ZXIgPSBNYWtlUmVmKERJRF9BTFRFUik7XG4gICAgICBuZXdSb290ID0gdXBkYXRlTm9kZShtYXAuX3Jvb3QsIG1hcC5fX293bmVySUQsIDAsIHVuZGVmaW5lZCwgaywgdiwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpO1xuICAgICAgaWYgKCFkaWRBbHRlci52YWx1ZSkge1xuICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgfVxuICAgICAgbmV3U2l6ZSA9IG1hcC5zaXplICsgKGRpZENoYW5nZVNpemUudmFsdWUgPyB2ID09PSBOT1RfU0VUID8gLTEgOiAxIDogMCk7XG4gICAgfVxuICAgIGlmIChtYXAuX19vd25lcklEKSB7XG4gICAgICBtYXAuc2l6ZSA9IG5ld1NpemU7XG4gICAgICBtYXAuX3Jvb3QgPSBuZXdSb290O1xuICAgICAgbWFwLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgIG1hcC5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1Jvb3QgPyBtYWtlTWFwKG5ld1NpemUsIG5ld1Jvb3QpIDogZW1wdHlNYXAoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZU5vZGUobm9kZSwgb3duZXJJRCwgc2hpZnQsIGtleUhhc2gsIGtleSwgdmFsdWUsIGRpZENoYW5nZVNpemUsIGRpZEFsdGVyKSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICBpZiAodmFsdWUgPT09IE5PVF9TRVQpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgICBTZXRSZWYoZGlkQWx0ZXIpO1xuICAgICAgU2V0UmVmKGRpZENoYW5nZVNpemUpO1xuICAgICAgcmV0dXJuIG5ldyBWYWx1ZU5vZGUob3duZXJJRCwga2V5SGFzaCwgW2tleSwgdmFsdWVdKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGUudXBkYXRlKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBpc0xlYWZOb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5jb25zdHJ1Y3RvciA9PT0gVmFsdWVOb2RlIHx8IG5vZGUuY29uc3RydWN0b3IgPT09IEhhc2hDb2xsaXNpb25Ob2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VJbnRvTm9kZShub2RlLCBvd25lcklELCBzaGlmdCwga2V5SGFzaCwgZW50cnkpIHtcbiAgICBpZiAobm9kZS5rZXlIYXNoID09PSBrZXlIYXNoKSB7XG4gICAgICByZXR1cm4gbmV3IEhhc2hDb2xsaXNpb25Ob2RlKG93bmVySUQsIGtleUhhc2gsIFtub2RlLmVudHJ5LCBlbnRyeV0pO1xuICAgIH1cblxuICAgIHZhciBpZHgxID0gKHNoaWZ0ID09PSAwID8gbm9kZS5rZXlIYXNoIDogbm9kZS5rZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLO1xuICAgIHZhciBpZHgyID0gKHNoaWZ0ID09PSAwID8ga2V5SGFzaCA6IGtleUhhc2ggPj4+IHNoaWZ0KSAmIE1BU0s7XG5cbiAgICB2YXIgbmV3Tm9kZTtcbiAgICB2YXIgbm9kZXMgPSBpZHgxID09PSBpZHgyID9cbiAgICAgIFttZXJnZUludG9Ob2RlKG5vZGUsIG93bmVySUQsIHNoaWZ0ICsgU0hJRlQsIGtleUhhc2gsIGVudHJ5KV0gOlxuICAgICAgKChuZXdOb2RlID0gbmV3IFZhbHVlTm9kZShvd25lcklELCBrZXlIYXNoLCBlbnRyeSkpLCBpZHgxIDwgaWR4MiA/IFtub2RlLCBuZXdOb2RlXSA6IFtuZXdOb2RlLCBub2RlXSk7XG5cbiAgICByZXR1cm4gbmV3IEJpdG1hcEluZGV4ZWROb2RlKG93bmVySUQsICgxIDw8IGlkeDEpIHwgKDEgPDwgaWR4MiksIG5vZGVzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5vZGVzKG93bmVySUQsIGVudHJpZXMsIGtleSwgdmFsdWUpIHtcbiAgICBpZiAoIW93bmVySUQpIHtcbiAgICAgIG93bmVySUQgPSBuZXcgT3duZXJJRCgpO1xuICAgIH1cbiAgICB2YXIgbm9kZSA9IG5ldyBWYWx1ZU5vZGUob3duZXJJRCwgaGFzaChrZXkpLCBba2V5LCB2YWx1ZV0pO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBlbnRyaWVzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIGVudHJ5ID0gZW50cmllc1tpaV07XG4gICAgICBub2RlID0gbm9kZS51cGRhdGUob3duZXJJRCwgMCwgdW5kZWZpbmVkLCBlbnRyeVswXSwgZW50cnlbMV0pO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhY2tOb2Rlcyhvd25lcklELCBub2RlcywgY291bnQsIGV4Y2x1ZGluZykge1xuICAgIHZhciBiaXRtYXAgPSAwO1xuICAgIHZhciBwYWNrZWRJSSA9IDA7XG4gICAgdmFyIHBhY2tlZE5vZGVzID0gbmV3IEFycmF5KGNvdW50KTtcbiAgICBmb3IgKHZhciBpaSA9IDAsIGJpdCA9IDEsIGxlbiA9IG5vZGVzLmxlbmd0aDsgaWkgPCBsZW47IGlpKyssIGJpdCA8PD0gMSkge1xuICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpaV07XG4gICAgICBpZiAobm9kZSAhPT0gdW5kZWZpbmVkICYmIGlpICE9PSBleGNsdWRpbmcpIHtcbiAgICAgICAgYml0bWFwIHw9IGJpdDtcbiAgICAgICAgcGFja2VkTm9kZXNbcGFja2VkSUkrK10gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEJpdG1hcEluZGV4ZWROb2RlKG93bmVySUQsIGJpdG1hcCwgcGFja2VkTm9kZXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXhwYW5kTm9kZXMob3duZXJJRCwgbm9kZXMsIGJpdG1hcCwgaW5jbHVkaW5nLCBub2RlKSB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB2YXIgZXhwYW5kZWROb2RlcyA9IG5ldyBBcnJheShTSVpFKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGJpdG1hcCAhPT0gMDsgaWkrKywgYml0bWFwID4+Pj0gMSkge1xuICAgICAgZXhwYW5kZWROb2Rlc1tpaV0gPSBiaXRtYXAgJiAxID8gbm9kZXNbY291bnQrK10gOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGV4cGFuZGVkTm9kZXNbaW5jbHVkaW5nXSA9IG5vZGU7XG4gICAgcmV0dXJuIG5ldyBIYXNoQXJyYXlNYXBOb2RlKG93bmVySUQsIGNvdW50ICsgMSwgZXhwYW5kZWROb2Rlcyk7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZUludG9NYXBXaXRoKG1hcCwgbWVyZ2VyLCBpdGVyYWJsZXMpIHtcbiAgICB2YXIgaXRlcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaXRlcmFibGVzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaXRlcmFibGVzW2lpXTtcbiAgICAgIHZhciBpdGVyID0gS2V5ZWRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICBpZiAoIWlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICAgIGl0ZXIgPSBpdGVyLm1hcChmdW5jdGlvbih2ICkge3JldHVybiBmcm9tSlModil9KTtcbiAgICAgIH1cbiAgICAgIGl0ZXJzLnB1c2goaXRlcik7XG4gICAgfVxuICAgIHJldHVybiBtZXJnZUludG9Db2xsZWN0aW9uV2l0aChtYXAsIG1lcmdlciwgaXRlcnMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVlcE1lcmdlcihtZXJnZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZXhpc3RpbmcsIHZhbHVlKSBcbiAgICAgIHtyZXR1cm4gZXhpc3RpbmcgJiYgZXhpc3RpbmcubWVyZ2VEZWVwV2l0aCAmJiBpc0l0ZXJhYmxlKHZhbHVlKSA/XG4gICAgICAgIGV4aXN0aW5nLm1lcmdlRGVlcFdpdGgobWVyZ2VyLCB2YWx1ZSkgOlxuICAgICAgICBtZXJnZXIgPyBtZXJnZXIoZXhpc3RpbmcsIHZhbHVlKSA6IHZhbHVlfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlSW50b0NvbGxlY3Rpb25XaXRoKGNvbGxlY3Rpb24sIG1lcmdlciwgaXRlcnMpIHtcbiAgICBpdGVycyA9IGl0ZXJzLmZpbHRlcihmdW5jdGlvbih4ICkge3JldHVybiB4LnNpemUgIT09IDB9KTtcbiAgICBpZiAoaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gICAgaWYgKGNvbGxlY3Rpb24uc2l6ZSA9PT0gMCAmJiBpdGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yKGl0ZXJzWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24ud2l0aE11dGF0aW9ucyhmdW5jdGlvbihjb2xsZWN0aW9uICkge1xuICAgICAgdmFyIG1lcmdlSW50b01hcCA9IG1lcmdlciA/XG4gICAgICAgIGZ1bmN0aW9uKHZhbHVlLCBrZXkpICB7XG4gICAgICAgICAgY29sbGVjdGlvbi51cGRhdGUoa2V5LCBOT1RfU0VULCBmdW5jdGlvbihleGlzdGluZyApXG4gICAgICAgICAgICB7cmV0dXJuIGV4aXN0aW5nID09PSBOT1RfU0VUID8gdmFsdWUgOiBtZXJnZXIoZXhpc3RpbmcsIHZhbHVlKX1cbiAgICAgICAgICApO1xuICAgICAgICB9IDpcbiAgICAgICAgZnVuY3Rpb24odmFsdWUsIGtleSkgIHtcbiAgICAgICAgICBjb2xsZWN0aW9uLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGl0ZXJzLmxlbmd0aDsgaWkrKykge1xuICAgICAgICBpdGVyc1tpaV0uZm9yRWFjaChtZXJnZUludG9NYXApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlSW5EZWVwTWFwKGV4aXN0aW5nLCBrZXlQYXRoSXRlciwgbm90U2V0VmFsdWUsIHVwZGF0ZXIpIHtcbiAgICB2YXIgaXNOb3RTZXQgPSBleGlzdGluZyA9PT0gTk9UX1NFVDtcbiAgICB2YXIgc3RlcCA9IGtleVBhdGhJdGVyLm5leHQoKTtcbiAgICBpZiAoc3RlcC5kb25lKSB7XG4gICAgICB2YXIgZXhpc3RpbmdWYWx1ZSA9IGlzTm90U2V0ID8gbm90U2V0VmFsdWUgOiBleGlzdGluZztcbiAgICAgIHZhciBuZXdWYWx1ZSA9IHVwZGF0ZXIoZXhpc3RpbmdWYWx1ZSk7XG4gICAgICByZXR1cm4gbmV3VmFsdWUgPT09IGV4aXN0aW5nVmFsdWUgPyBleGlzdGluZyA6IG5ld1ZhbHVlO1xuICAgIH1cbiAgICBpbnZhcmlhbnQoXG4gICAgICBpc05vdFNldCB8fCAoZXhpc3RpbmcgJiYgZXhpc3Rpbmcuc2V0KSxcbiAgICAgICdpbnZhbGlkIGtleVBhdGgnXG4gICAgKTtcbiAgICB2YXIga2V5ID0gc3RlcC52YWx1ZTtcbiAgICB2YXIgbmV4dEV4aXN0aW5nID0gaXNOb3RTZXQgPyBOT1RfU0VUIDogZXhpc3RpbmcuZ2V0KGtleSwgTk9UX1NFVCk7XG4gICAgdmFyIG5leHRVcGRhdGVkID0gdXBkYXRlSW5EZWVwTWFwKFxuICAgICAgbmV4dEV4aXN0aW5nLFxuICAgICAga2V5UGF0aEl0ZXIsXG4gICAgICBub3RTZXRWYWx1ZSxcbiAgICAgIHVwZGF0ZXJcbiAgICApO1xuICAgIHJldHVybiBuZXh0VXBkYXRlZCA9PT0gbmV4dEV4aXN0aW5nID8gZXhpc3RpbmcgOlxuICAgICAgbmV4dFVwZGF0ZWQgPT09IE5PVF9TRVQgPyBleGlzdGluZy5yZW1vdmUoa2V5KSA6XG4gICAgICAoaXNOb3RTZXQgPyBlbXB0eU1hcCgpIDogZXhpc3RpbmcpLnNldChrZXksIG5leHRVcGRhdGVkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvcENvdW50KHgpIHtcbiAgICB4ID0geCAtICgoeCA+PiAxKSAmIDB4NTU1NTU1NTUpO1xuICAgIHggPSAoeCAmIDB4MzMzMzMzMzMpICsgKCh4ID4+IDIpICYgMHgzMzMzMzMzMyk7XG4gICAgeCA9ICh4ICsgKHggPj4gNCkpICYgMHgwZjBmMGYwZjtcbiAgICB4ID0geCArICh4ID4+IDgpO1xuICAgIHggPSB4ICsgKHggPj4gMTYpO1xuICAgIHJldHVybiB4ICYgMHg3ZjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEluKGFycmF5LCBpZHgsIHZhbCwgY2FuRWRpdCkge1xuICAgIHZhciBuZXdBcnJheSA9IGNhbkVkaXQgPyBhcnJheSA6IGFyckNvcHkoYXJyYXkpO1xuICAgIG5ld0FycmF5W2lkeF0gPSB2YWw7XG4gICAgcmV0dXJuIG5ld0FycmF5O1xuICB9XG5cbiAgZnVuY3Rpb24gc3BsaWNlSW4oYXJyYXksIGlkeCwgdmFsLCBjYW5FZGl0KSB7XG4gICAgdmFyIG5ld0xlbiA9IGFycmF5Lmxlbmd0aCArIDE7XG4gICAgaWYgKGNhbkVkaXQgJiYgaWR4ICsgMSA9PT0gbmV3TGVuKSB7XG4gICAgICBhcnJheVtpZHhdID0gdmFsO1xuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cbiAgICB2YXIgbmV3QXJyYXkgPSBuZXcgQXJyYXkobmV3TGVuKTtcbiAgICB2YXIgYWZ0ZXIgPSAwO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBuZXdMZW47IGlpKyspIHtcbiAgICAgIGlmIChpaSA9PT0gaWR4KSB7XG4gICAgICAgIG5ld0FycmF5W2lpXSA9IHZhbDtcbiAgICAgICAgYWZ0ZXIgPSAtMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0FycmF5W2lpXSA9IGFycmF5W2lpICsgYWZ0ZXJdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3QXJyYXk7XG4gIH1cblxuICBmdW5jdGlvbiBzcGxpY2VPdXQoYXJyYXksIGlkeCwgY2FuRWRpdCkge1xuICAgIHZhciBuZXdMZW4gPSBhcnJheS5sZW5ndGggLSAxO1xuICAgIGlmIChjYW5FZGl0ICYmIGlkeCA9PT0gbmV3TGVuKSB7XG4gICAgICBhcnJheS5wb3AoKTtcbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgdmFyIG5ld0FycmF5ID0gbmV3IEFycmF5KG5ld0xlbik7XG4gICAgdmFyIGFmdGVyID0gMDtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbmV3TGVuOyBpaSsrKSB7XG4gICAgICBpZiAoaWkgPT09IGlkeCkge1xuICAgICAgICBhZnRlciA9IDE7XG4gICAgICB9XG4gICAgICBuZXdBcnJheVtpaV0gPSBhcnJheVtpaSArIGFmdGVyXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0FycmF5O1xuICB9XG5cbiAgdmFyIE1BWF9BUlJBWV9NQVBfU0laRSA9IFNJWkUgLyA0O1xuICB2YXIgTUFYX0JJVE1BUF9JTkRFWEVEX1NJWkUgPSBTSVpFIC8gMjtcbiAgdmFyIE1JTl9IQVNIX0FSUkFZX01BUF9TSVpFID0gU0laRSAvIDQ7XG5cbiAgY3JlYXRlQ2xhc3MoTGlzdCwgSW5kZXhlZENvbGxlY3Rpb24pO1xuXG4gICAgLy8gQHByYWdtYSBDb25zdHJ1Y3Rpb25cblxuICAgIGZ1bmN0aW9uIExpc3QodmFsdWUpIHtcbiAgICAgIHZhciBlbXB0eSA9IGVtcHR5TGlzdCgpO1xuICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGVtcHR5O1xuICAgICAgfVxuICAgICAgaWYgKGlzTGlzdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXIgPSBJbmRleGVkSXRlcmFibGUodmFsdWUpO1xuICAgICAgdmFyIHNpemUgPSBpdGVyLnNpemU7XG4gICAgICBpZiAoc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZW1wdHk7XG4gICAgICB9XG4gICAgICBhc3NlcnROb3RJbmZpbml0ZShzaXplKTtcbiAgICAgIGlmIChzaXplID4gMCAmJiBzaXplIDwgU0laRSkge1xuICAgICAgICByZXR1cm4gbWFrZUxpc3QoMCwgc2l6ZSwgU0hJRlQsIG51bGwsIG5ldyBWTm9kZShpdGVyLnRvQXJyYXkoKSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVtcHR5LndpdGhNdXRhdGlvbnMoZnVuY3Rpb24obGlzdCApIHtcbiAgICAgICAgbGlzdC5zZXRTaXplKHNpemUpO1xuICAgICAgICBpdGVyLmZvckVhY2goZnVuY3Rpb24odiwgaSkgIHtyZXR1cm4gbGlzdC5zZXQoaSwgdil9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIExpc3Qub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gdGhpcyhhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnTGlzdCBbJywgJ10nKTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBBY2Nlc3NcblxuICAgIExpc3QucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGluZGV4LCBub3RTZXRWYWx1ZSkge1xuICAgICAgaW5kZXggPSB3cmFwSW5kZXgodGhpcywgaW5kZXgpO1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnNpemUpIHtcbiAgICAgICAgcmV0dXJuIG5vdFNldFZhbHVlO1xuICAgICAgfVxuICAgICAgaW5kZXggKz0gdGhpcy5fb3JpZ2luO1xuICAgICAgdmFyIG5vZGUgPSBsaXN0Tm9kZUZvcih0aGlzLCBpbmRleCk7XG4gICAgICByZXR1cm4gbm9kZSAmJiBub2RlLmFycmF5W2luZGV4ICYgTUFTS107XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgICBMaXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB1cGRhdGVMaXN0KHRoaXMsIGluZGV4LCB2YWx1ZSk7XG4gICAgfTtcblxuICAgIExpc3QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICByZXR1cm4gIXRoaXMuaGFzKGluZGV4KSA/IHRoaXMgOlxuICAgICAgICBpbmRleCA9PT0gMCA/IHRoaXMuc2hpZnQoKSA6XG4gICAgICAgIGluZGV4ID09PSB0aGlzLnNpemUgLSAxID8gdGhpcy5wb3AoKSA6XG4gICAgICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgdGhpcy5zaXplID0gdGhpcy5fb3JpZ2luID0gdGhpcy5fY2FwYWNpdHkgPSAwO1xuICAgICAgICB0aGlzLl9sZXZlbCA9IFNISUZUO1xuICAgICAgICB0aGlzLl9yb290ID0gdGhpcy5fdGFpbCA9IG51bGw7XG4gICAgICAgIHRoaXMuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVtcHR5TGlzdCgpO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgdmFyIHZhbHVlcyA9IGFyZ3VtZW50cztcbiAgICAgIHZhciBvbGRTaXplID0gdGhpcy5zaXplO1xuICAgICAgcmV0dXJuIHRoaXMud2l0aE11dGF0aW9ucyhmdW5jdGlvbihsaXN0ICkge1xuICAgICAgICBzZXRMaXN0Qm91bmRzKGxpc3QsIDAsIG9sZFNpemUgKyB2YWx1ZXMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHZhbHVlcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgICAgICBsaXN0LnNldChvbGRTaXplICsgaWksIHZhbHVlc1tpaV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2V0TGlzdEJvdW5kcyh0aGlzLCAwLCAtMSk7XG4gICAgfTtcblxuICAgIExpc3QucHJvdG90eXBlLnVuc2hpZnQgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICB2YXIgdmFsdWVzID0gYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIHRoaXMud2l0aE11dGF0aW9ucyhmdW5jdGlvbihsaXN0ICkge1xuICAgICAgICBzZXRMaXN0Qm91bmRzKGxpc3QsIC12YWx1ZXMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHZhbHVlcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgICAgICBsaXN0LnNldChpaSwgdmFsdWVzW2lpXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5zaGlmdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNldExpc3RCb3VuZHModGhpcywgMSk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgQ29tcG9zaXRpb25cblxuICAgIExpc3QucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24oLyouLi5pdGVycyovKSB7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTGlzdFdpdGgodGhpcywgdW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5tZXJnZVdpdGggPSBmdW5jdGlvbihtZXJnZXIpIHt2YXIgaXRlcnMgPSBTTElDRSQwLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBtZXJnZUludG9MaXN0V2l0aCh0aGlzLCBtZXJnZXIsIGl0ZXJzKTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUubWVyZ2VEZWVwID0gZnVuY3Rpb24oLyouLi5pdGVycyovKSB7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTGlzdFdpdGgodGhpcywgZGVlcE1lcmdlcih1bmRlZmluZWQpLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5tZXJnZURlZXBXaXRoID0gZnVuY3Rpb24obWVyZ2VyKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTGlzdFdpdGgodGhpcywgZGVlcE1lcmdlcihtZXJnZXIpLCBpdGVycyk7XG4gICAgfTtcblxuICAgIExpc3QucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgICByZXR1cm4gc2V0TGlzdEJvdW5kcyh0aGlzLCAwLCBzaXplKTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBJdGVyYXRpb25cblxuICAgIExpc3QucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgICBpZiAod2hvbGVTbGljZShiZWdpbiwgZW5kLCBzaXplKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRMaXN0Qm91bmRzKFxuICAgICAgICB0aGlzLFxuICAgICAgICByZXNvbHZlQmVnaW4oYmVnaW4sIHNpemUpLFxuICAgICAgICByZXNvbHZlRW5kKGVuZCwgc2l6ZSlcbiAgICAgICk7XG4gICAgfTtcblxuICAgIExpc3QucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgdmFyIHZhbHVlcyA9IGl0ZXJhdGVMaXN0KHRoaXMsIHJldmVyc2UpO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlcygpO1xuICAgICAgICByZXR1cm4gdmFsdWUgPT09IERPTkUgP1xuICAgICAgICAgIGl0ZXJhdG9yRG9uZSgpIDpcbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIGluZGV4KyssIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgIHZhciB2YWx1ZXMgPSBpdGVyYXRlTGlzdCh0aGlzLCByZXZlcnNlKTtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIHdoaWxlICgodmFsdWUgPSB2YWx1ZXMoKSkgIT09IERPTkUpIHtcbiAgICAgICAgaWYgKGZuKHZhbHVlLCBpbmRleCsrLCB0aGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5fX2Vuc3VyZU93bmVyID0gZnVuY3Rpb24ob3duZXJJRCkge1xuICAgICAgaWYgKG93bmVySUQgPT09IHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKCFvd25lcklEKSB7XG4gICAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFrZUxpc3QodGhpcy5fb3JpZ2luLCB0aGlzLl9jYXBhY2l0eSwgdGhpcy5fbGV2ZWwsIHRoaXMuX3Jvb3QsIHRoaXMuX3RhaWwsIG93bmVySUQsIHRoaXMuX19oYXNoKTtcbiAgICB9O1xuXG5cbiAgZnVuY3Rpb24gaXNMaXN0KG1heWJlTGlzdCkge1xuICAgIHJldHVybiAhIShtYXliZUxpc3QgJiYgbWF5YmVMaXN0W0lTX0xJU1RfU0VOVElORUxdKTtcbiAgfVxuXG4gIExpc3QuaXNMaXN0ID0gaXNMaXN0O1xuXG4gIHZhciBJU19MSVNUX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfTElTVF9fQEAnO1xuXG4gIHZhciBMaXN0UHJvdG90eXBlID0gTGlzdC5wcm90b3R5cGU7XG4gIExpc3RQcm90b3R5cGVbSVNfTElTVF9TRU5USU5FTF0gPSB0cnVlO1xuICBMaXN0UHJvdG90eXBlW0RFTEVURV0gPSBMaXN0UHJvdG90eXBlLnJlbW92ZTtcbiAgTGlzdFByb3RvdHlwZS5zZXRJbiA9IE1hcFByb3RvdHlwZS5zZXRJbjtcbiAgTGlzdFByb3RvdHlwZS5kZWxldGVJbiA9XG4gIExpc3RQcm90b3R5cGUucmVtb3ZlSW4gPSBNYXBQcm90b3R5cGUucmVtb3ZlSW47XG4gIExpc3RQcm90b3R5cGUudXBkYXRlID0gTWFwUHJvdG90eXBlLnVwZGF0ZTtcbiAgTGlzdFByb3RvdHlwZS51cGRhdGVJbiA9IE1hcFByb3RvdHlwZS51cGRhdGVJbjtcbiAgTGlzdFByb3RvdHlwZS5tZXJnZUluID0gTWFwUHJvdG90eXBlLm1lcmdlSW47XG4gIExpc3RQcm90b3R5cGUubWVyZ2VEZWVwSW4gPSBNYXBQcm90b3R5cGUubWVyZ2VEZWVwSW47XG4gIExpc3RQcm90b3R5cGUud2l0aE11dGF0aW9ucyA9IE1hcFByb3RvdHlwZS53aXRoTXV0YXRpb25zO1xuICBMaXN0UHJvdG90eXBlLmFzTXV0YWJsZSA9IE1hcFByb3RvdHlwZS5hc011dGFibGU7XG4gIExpc3RQcm90b3R5cGUuYXNJbW11dGFibGUgPSBNYXBQcm90b3R5cGUuYXNJbW11dGFibGU7XG4gIExpc3RQcm90b3R5cGUud2FzQWx0ZXJlZCA9IE1hcFByb3RvdHlwZS53YXNBbHRlcmVkO1xuXG5cblxuICAgIGZ1bmN0aW9uIFZOb2RlKGFycmF5LCBvd25lcklEKSB7XG4gICAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG4gICAgICB0aGlzLm93bmVySUQgPSBvd25lcklEO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHNlZW1zIGxpa2UgdGhlc2UgbWV0aG9kcyBhcmUgdmVyeSBzaW1pbGFyXG5cbiAgICBWTm9kZS5wcm90b3R5cGUucmVtb3ZlQmVmb3JlID0gZnVuY3Rpb24ob3duZXJJRCwgbGV2ZWwsIGluZGV4KSB7XG4gICAgICBpZiAoaW5kZXggPT09IGxldmVsID8gMSA8PCBsZXZlbCA6IDAgfHwgdGhpcy5hcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgb3JpZ2luSW5kZXggPSAoaW5kZXggPj4+IGxldmVsKSAmIE1BU0s7XG4gICAgICBpZiAob3JpZ2luSW5kZXggPj0gdGhpcy5hcnJheS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWTm9kZShbXSwgb3duZXJJRCk7XG4gICAgICB9XG4gICAgICB2YXIgcmVtb3ZpbmdGaXJzdCA9IG9yaWdpbkluZGV4ID09PSAwO1xuICAgICAgdmFyIG5ld0NoaWxkO1xuICAgICAgaWYgKGxldmVsID4gMCkge1xuICAgICAgICB2YXIgb2xkQ2hpbGQgPSB0aGlzLmFycmF5W29yaWdpbkluZGV4XTtcbiAgICAgICAgbmV3Q2hpbGQgPSBvbGRDaGlsZCAmJiBvbGRDaGlsZC5yZW1vdmVCZWZvcmUob3duZXJJRCwgbGV2ZWwgLSBTSElGVCwgaW5kZXgpO1xuICAgICAgICBpZiAobmV3Q2hpbGQgPT09IG9sZENoaWxkICYmIHJlbW92aW5nRmlyc3QpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHJlbW92aW5nRmlyc3QgJiYgIW5ld0NoaWxkKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIGVkaXRhYmxlID0gZWRpdGFibGVWTm9kZSh0aGlzLCBvd25lcklEKTtcbiAgICAgIGlmICghcmVtb3ZpbmdGaXJzdCkge1xuICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgb3JpZ2luSW5kZXg7IGlpKyspIHtcbiAgICAgICAgICBlZGl0YWJsZS5hcnJheVtpaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChuZXdDaGlsZCkge1xuICAgICAgICBlZGl0YWJsZS5hcnJheVtvcmlnaW5JbmRleF0gPSBuZXdDaGlsZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlZGl0YWJsZTtcbiAgICB9O1xuXG4gICAgVk5vZGUucHJvdG90eXBlLnJlbW92ZUFmdGVyID0gZnVuY3Rpb24ob3duZXJJRCwgbGV2ZWwsIGluZGV4KSB7XG4gICAgICBpZiAoaW5kZXggPT09IGxldmVsID8gMSA8PCBsZXZlbCA6IDAgfHwgdGhpcy5hcnJheS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgc2l6ZUluZGV4ID0gKChpbmRleCAtIDEpID4+PiBsZXZlbCkgJiBNQVNLO1xuICAgICAgaWYgKHNpemVJbmRleCA+PSB0aGlzLmFycmF5Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciByZW1vdmluZ0xhc3QgPSBzaXplSW5kZXggPT09IHRoaXMuYXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBuZXdDaGlsZDtcbiAgICAgIGlmIChsZXZlbCA+IDApIHtcbiAgICAgICAgdmFyIG9sZENoaWxkID0gdGhpcy5hcnJheVtzaXplSW5kZXhdO1xuICAgICAgICBuZXdDaGlsZCA9IG9sZENoaWxkICYmIG9sZENoaWxkLnJlbW92ZUFmdGVyKG93bmVySUQsIGxldmVsIC0gU0hJRlQsIGluZGV4KTtcbiAgICAgICAgaWYgKG5ld0NoaWxkID09PSBvbGRDaGlsZCAmJiByZW1vdmluZ0xhc3QpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHJlbW92aW5nTGFzdCAmJiAhbmV3Q2hpbGQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgZWRpdGFibGUgPSBlZGl0YWJsZVZOb2RlKHRoaXMsIG93bmVySUQpO1xuICAgICAgaWYgKCFyZW1vdmluZ0xhc3QpIHtcbiAgICAgICAgZWRpdGFibGUuYXJyYXkucG9wKCk7XG4gICAgICB9XG4gICAgICBpZiAobmV3Q2hpbGQpIHtcbiAgICAgICAgZWRpdGFibGUuYXJyYXlbc2l6ZUluZGV4XSA9IG5ld0NoaWxkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVkaXRhYmxlO1xuICAgIH07XG5cblxuXG4gIHZhciBET05FID0ge307XG5cbiAgZnVuY3Rpb24gaXRlcmF0ZUxpc3QobGlzdCwgcmV2ZXJzZSkge1xuICAgIHZhciBsZWZ0ID0gbGlzdC5fb3JpZ2luO1xuICAgIHZhciByaWdodCA9IGxpc3QuX2NhcGFjaXR5O1xuICAgIHZhciB0YWlsUG9zID0gZ2V0VGFpbE9mZnNldChyaWdodCk7XG4gICAgdmFyIHRhaWwgPSBsaXN0Ll90YWlsO1xuXG4gICAgcmV0dXJuIGl0ZXJhdGVOb2RlT3JMZWFmKGxpc3QuX3Jvb3QsIGxpc3QuX2xldmVsLCAwKTtcblxuICAgIGZ1bmN0aW9uIGl0ZXJhdGVOb2RlT3JMZWFmKG5vZGUsIGxldmVsLCBvZmZzZXQpIHtcbiAgICAgIHJldHVybiBsZXZlbCA9PT0gMCA/XG4gICAgICAgIGl0ZXJhdGVMZWFmKG5vZGUsIG9mZnNldCkgOlxuICAgICAgICBpdGVyYXRlTm9kZShub2RlLCBsZXZlbCwgb2Zmc2V0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpdGVyYXRlTGVhZihub2RlLCBvZmZzZXQpIHtcbiAgICAgIHZhciBhcnJheSA9IG9mZnNldCA9PT0gdGFpbFBvcyA/IHRhaWwgJiYgdGFpbC5hcnJheSA6IG5vZGUgJiYgbm9kZS5hcnJheTtcbiAgICAgIHZhciBmcm9tID0gb2Zmc2V0ID4gbGVmdCA/IDAgOiBsZWZ0IC0gb2Zmc2V0O1xuICAgICAgdmFyIHRvID0gcmlnaHQgLSBvZmZzZXQ7XG4gICAgICBpZiAodG8gPiBTSVpFKSB7XG4gICAgICAgIHRvID0gU0laRTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbigpICB7XG4gICAgICAgIGlmIChmcm9tID09PSB0bykge1xuICAgICAgICAgIHJldHVybiBET05FO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpZHggPSByZXZlcnNlID8gLS10byA6IGZyb20rKztcbiAgICAgICAgcmV0dXJuIGFycmF5ICYmIGFycmF5W2lkeF07XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGl0ZXJhdGVOb2RlKG5vZGUsIGxldmVsLCBvZmZzZXQpIHtcbiAgICAgIHZhciB2YWx1ZXM7XG4gICAgICB2YXIgYXJyYXkgPSBub2RlICYmIG5vZGUuYXJyYXk7XG4gICAgICB2YXIgZnJvbSA9IG9mZnNldCA+IGxlZnQgPyAwIDogKGxlZnQgLSBvZmZzZXQpID4+IGxldmVsO1xuICAgICAgdmFyIHRvID0gKChyaWdodCAtIG9mZnNldCkgPj4gbGV2ZWwpICsgMTtcbiAgICAgIGlmICh0byA+IFNJWkUpIHtcbiAgICAgICAgdG8gPSBTSVpFO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlcygpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBET05FKSB7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlcyA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChmcm9tID09PSB0bykge1xuICAgICAgICAgICAgcmV0dXJuIERPTkU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBpZHggPSByZXZlcnNlID8gLS10byA6IGZyb20rKztcbiAgICAgICAgICB2YWx1ZXMgPSBpdGVyYXRlTm9kZU9yTGVhZihcbiAgICAgICAgICAgIGFycmF5ICYmIGFycmF5W2lkeF0sIGxldmVsIC0gU0hJRlQsIG9mZnNldCArIChpZHggPDwgbGV2ZWwpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSB3aGlsZSAodHJ1ZSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VMaXN0KG9yaWdpbiwgY2FwYWNpdHksIGxldmVsLCByb290LCB0YWlsLCBvd25lcklELCBoYXNoKSB7XG4gICAgdmFyIGxpc3QgPSBPYmplY3QuY3JlYXRlKExpc3RQcm90b3R5cGUpO1xuICAgIGxpc3Quc2l6ZSA9IGNhcGFjaXR5IC0gb3JpZ2luO1xuICAgIGxpc3QuX29yaWdpbiA9IG9yaWdpbjtcbiAgICBsaXN0Ll9jYXBhY2l0eSA9IGNhcGFjaXR5O1xuICAgIGxpc3QuX2xldmVsID0gbGV2ZWw7XG4gICAgbGlzdC5fcm9vdCA9IHJvb3Q7XG4gICAgbGlzdC5fdGFpbCA9IHRhaWw7XG4gICAgbGlzdC5fX293bmVySUQgPSBvd25lcklEO1xuICAgIGxpc3QuX19oYXNoID0gaGFzaDtcbiAgICBsaXN0Ll9fYWx0ZXJlZCA9IGZhbHNlO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgdmFyIEVNUFRZX0xJU1Q7XG4gIGZ1bmN0aW9uIGVtcHR5TGlzdCgpIHtcbiAgICByZXR1cm4gRU1QVFlfTElTVCB8fCAoRU1QVFlfTElTVCA9IG1ha2VMaXN0KDAsIDAsIFNISUZUKSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaXN0KGxpc3QsIGluZGV4LCB2YWx1ZSkge1xuICAgIGluZGV4ID0gd3JhcEluZGV4KGxpc3QsIGluZGV4KTtcblxuICAgIGlmIChpbmRleCA+PSBsaXN0LnNpemUgfHwgaW5kZXggPCAwKSB7XG4gICAgICByZXR1cm4gbGlzdC53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKGxpc3QgKSB7XG4gICAgICAgIGluZGV4IDwgMCA/XG4gICAgICAgICAgc2V0TGlzdEJvdW5kcyhsaXN0LCBpbmRleCkuc2V0KDAsIHZhbHVlKSA6XG4gICAgICAgICAgc2V0TGlzdEJvdW5kcyhsaXN0LCAwLCBpbmRleCArIDEpLnNldChpbmRleCwgdmFsdWUpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbmRleCArPSBsaXN0Ll9vcmlnaW47XG5cbiAgICB2YXIgbmV3VGFpbCA9IGxpc3QuX3RhaWw7XG4gICAgdmFyIG5ld1Jvb3QgPSBsaXN0Ll9yb290O1xuICAgIHZhciBkaWRBbHRlciA9IE1ha2VSZWYoRElEX0FMVEVSKTtcbiAgICBpZiAoaW5kZXggPj0gZ2V0VGFpbE9mZnNldChsaXN0Ll9jYXBhY2l0eSkpIHtcbiAgICAgIG5ld1RhaWwgPSB1cGRhdGVWTm9kZShuZXdUYWlsLCBsaXN0Ll9fb3duZXJJRCwgMCwgaW5kZXgsIHZhbHVlLCBkaWRBbHRlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1Jvb3QgPSB1cGRhdGVWTm9kZShuZXdSb290LCBsaXN0Ll9fb3duZXJJRCwgbGlzdC5fbGV2ZWwsIGluZGV4LCB2YWx1ZSwgZGlkQWx0ZXIpO1xuICAgIH1cblxuICAgIGlmICghZGlkQWx0ZXIudmFsdWUpIHtcbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cblxuICAgIGlmIChsaXN0Ll9fb3duZXJJRCkge1xuICAgICAgbGlzdC5fcm9vdCA9IG5ld1Jvb3Q7XG4gICAgICBsaXN0Ll90YWlsID0gbmV3VGFpbDtcbiAgICAgIGxpc3QuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgbGlzdC5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfVxuICAgIHJldHVybiBtYWtlTGlzdChsaXN0Ll9vcmlnaW4sIGxpc3QuX2NhcGFjaXR5LCBsaXN0Ll9sZXZlbCwgbmV3Um9vdCwgbmV3VGFpbCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVWTm9kZShub2RlLCBvd25lcklELCBsZXZlbCwgaW5kZXgsIHZhbHVlLCBkaWRBbHRlcikge1xuICAgIHZhciBpZHggPSAoaW5kZXggPj4+IGxldmVsKSAmIE1BU0s7XG4gICAgdmFyIG5vZGVIYXMgPSBub2RlICYmIGlkeCA8IG5vZGUuYXJyYXkubGVuZ3RoO1xuICAgIGlmICghbm9kZUhhcyAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICB2YXIgbmV3Tm9kZTtcblxuICAgIGlmIChsZXZlbCA+IDApIHtcbiAgICAgIHZhciBsb3dlck5vZGUgPSBub2RlICYmIG5vZGUuYXJyYXlbaWR4XTtcbiAgICAgIHZhciBuZXdMb3dlck5vZGUgPSB1cGRhdGVWTm9kZShsb3dlck5vZGUsIG93bmVySUQsIGxldmVsIC0gU0hJRlQsIGluZGV4LCB2YWx1ZSwgZGlkQWx0ZXIpO1xuICAgICAgaWYgKG5ld0xvd2VyTm9kZSA9PT0gbG93ZXJOb2RlKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgICAgbmV3Tm9kZSA9IGVkaXRhYmxlVk5vZGUobm9kZSwgb3duZXJJRCk7XG4gICAgICBuZXdOb2RlLmFycmF5W2lkeF0gPSBuZXdMb3dlck5vZGU7XG4gICAgICByZXR1cm4gbmV3Tm9kZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZUhhcyAmJiBub2RlLmFycmF5W2lkeF0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICBTZXRSZWYoZGlkQWx0ZXIpO1xuXG4gICAgbmV3Tm9kZSA9IGVkaXRhYmxlVk5vZGUobm9kZSwgb3duZXJJRCk7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgaWR4ID09PSBuZXdOb2RlLmFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgIG5ld05vZGUuYXJyYXkucG9wKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld05vZGUuYXJyYXlbaWR4XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gbmV3Tm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkaXRhYmxlVk5vZGUobm9kZSwgb3duZXJJRCkge1xuICAgIGlmIChvd25lcklEICYmIG5vZGUgJiYgb3duZXJJRCA9PT0gbm9kZS5vd25lcklEKSB7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBWTm9kZShub2RlID8gbm9kZS5hcnJheS5zbGljZSgpIDogW10sIG93bmVySUQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbGlzdE5vZGVGb3IobGlzdCwgcmF3SW5kZXgpIHtcbiAgICBpZiAocmF3SW5kZXggPj0gZ2V0VGFpbE9mZnNldChsaXN0Ll9jYXBhY2l0eSkpIHtcbiAgICAgIHJldHVybiBsaXN0Ll90YWlsO1xuICAgIH1cbiAgICBpZiAocmF3SW5kZXggPCAxIDw8IChsaXN0Ll9sZXZlbCArIFNISUZUKSkge1xuICAgICAgdmFyIG5vZGUgPSBsaXN0Ll9yb290O1xuICAgICAgdmFyIGxldmVsID0gbGlzdC5fbGV2ZWw7XG4gICAgICB3aGlsZSAobm9kZSAmJiBsZXZlbCA+IDApIHtcbiAgICAgICAgbm9kZSA9IG5vZGUuYXJyYXlbKHJhd0luZGV4ID4+PiBsZXZlbCkgJiBNQVNLXTtcbiAgICAgICAgbGV2ZWwgLT0gU0hJRlQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRMaXN0Qm91bmRzKGxpc3QsIGJlZ2luLCBlbmQpIHtcbiAgICB2YXIgb3duZXIgPSBsaXN0Ll9fb3duZXJJRCB8fCBuZXcgT3duZXJJRCgpO1xuICAgIHZhciBvbGRPcmlnaW4gPSBsaXN0Ll9vcmlnaW47XG4gICAgdmFyIG9sZENhcGFjaXR5ID0gbGlzdC5fY2FwYWNpdHk7XG4gICAgdmFyIG5ld09yaWdpbiA9IG9sZE9yaWdpbiArIGJlZ2luO1xuICAgIHZhciBuZXdDYXBhY2l0eSA9IGVuZCA9PT0gdW5kZWZpbmVkID8gb2xkQ2FwYWNpdHkgOiBlbmQgPCAwID8gb2xkQ2FwYWNpdHkgKyBlbmQgOiBvbGRPcmlnaW4gKyBlbmQ7XG4gICAgaWYgKG5ld09yaWdpbiA9PT0gb2xkT3JpZ2luICYmIG5ld0NhcGFjaXR5ID09PSBvbGRDYXBhY2l0eSkge1xuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfVxuXG4gICAgLy8gSWYgaXQncyBnb2luZyB0byBlbmQgYWZ0ZXIgaXQgc3RhcnRzLCBpdCdzIGVtcHR5LlxuICAgIGlmIChuZXdPcmlnaW4gPj0gbmV3Q2FwYWNpdHkpIHtcbiAgICAgIHJldHVybiBsaXN0LmNsZWFyKCk7XG4gICAgfVxuXG4gICAgdmFyIG5ld0xldmVsID0gbGlzdC5fbGV2ZWw7XG4gICAgdmFyIG5ld1Jvb3QgPSBsaXN0Ll9yb290O1xuXG4gICAgLy8gTmV3IG9yaWdpbiBtaWdodCByZXF1aXJlIGNyZWF0aW5nIGEgaGlnaGVyIHJvb3QuXG4gICAgdmFyIG9mZnNldFNoaWZ0ID0gMDtcbiAgICB3aGlsZSAobmV3T3JpZ2luICsgb2Zmc2V0U2hpZnQgPCAwKSB7XG4gICAgICBuZXdSb290ID0gbmV3IFZOb2RlKG5ld1Jvb3QgJiYgbmV3Um9vdC5hcnJheS5sZW5ndGggPyBbdW5kZWZpbmVkLCBuZXdSb290XSA6IFtdLCBvd25lcik7XG4gICAgICBuZXdMZXZlbCArPSBTSElGVDtcbiAgICAgIG9mZnNldFNoaWZ0ICs9IDEgPDwgbmV3TGV2ZWw7XG4gICAgfVxuICAgIGlmIChvZmZzZXRTaGlmdCkge1xuICAgICAgbmV3T3JpZ2luICs9IG9mZnNldFNoaWZ0O1xuICAgICAgb2xkT3JpZ2luICs9IG9mZnNldFNoaWZ0O1xuICAgICAgbmV3Q2FwYWNpdHkgKz0gb2Zmc2V0U2hpZnQ7XG4gICAgICBvbGRDYXBhY2l0eSArPSBvZmZzZXRTaGlmdDtcbiAgICB9XG5cbiAgICB2YXIgb2xkVGFpbE9mZnNldCA9IGdldFRhaWxPZmZzZXQob2xkQ2FwYWNpdHkpO1xuICAgIHZhciBuZXdUYWlsT2Zmc2V0ID0gZ2V0VGFpbE9mZnNldChuZXdDYXBhY2l0eSk7XG5cbiAgICAvLyBOZXcgc2l6ZSBtaWdodCByZXF1aXJlIGNyZWF0aW5nIGEgaGlnaGVyIHJvb3QuXG4gICAgd2hpbGUgKG5ld1RhaWxPZmZzZXQgPj0gMSA8PCAobmV3TGV2ZWwgKyBTSElGVCkpIHtcbiAgICAgIG5ld1Jvb3QgPSBuZXcgVk5vZGUobmV3Um9vdCAmJiBuZXdSb290LmFycmF5Lmxlbmd0aCA/IFtuZXdSb290XSA6IFtdLCBvd25lcik7XG4gICAgICBuZXdMZXZlbCArPSBTSElGVDtcbiAgICB9XG5cbiAgICAvLyBMb2NhdGUgb3IgY3JlYXRlIHRoZSBuZXcgdGFpbC5cbiAgICB2YXIgb2xkVGFpbCA9IGxpc3QuX3RhaWw7XG4gICAgdmFyIG5ld1RhaWwgPSBuZXdUYWlsT2Zmc2V0IDwgb2xkVGFpbE9mZnNldCA/XG4gICAgICBsaXN0Tm9kZUZvcihsaXN0LCBuZXdDYXBhY2l0eSAtIDEpIDpcbiAgICAgIG5ld1RhaWxPZmZzZXQgPiBvbGRUYWlsT2Zmc2V0ID8gbmV3IFZOb2RlKFtdLCBvd25lcikgOiBvbGRUYWlsO1xuXG4gICAgLy8gTWVyZ2UgVGFpbCBpbnRvIHRyZWUuXG4gICAgaWYgKG9sZFRhaWwgJiYgbmV3VGFpbE9mZnNldCA+IG9sZFRhaWxPZmZzZXQgJiYgbmV3T3JpZ2luIDwgb2xkQ2FwYWNpdHkgJiYgb2xkVGFpbC5hcnJheS5sZW5ndGgpIHtcbiAgICAgIG5ld1Jvb3QgPSBlZGl0YWJsZVZOb2RlKG5ld1Jvb3QsIG93bmVyKTtcbiAgICAgIHZhciBub2RlID0gbmV3Um9vdDtcbiAgICAgIGZvciAodmFyIGxldmVsID0gbmV3TGV2ZWw7IGxldmVsID4gU0hJRlQ7IGxldmVsIC09IFNISUZUKSB7XG4gICAgICAgIHZhciBpZHggPSAob2xkVGFpbE9mZnNldCA+Pj4gbGV2ZWwpICYgTUFTSztcbiAgICAgICAgbm9kZSA9IG5vZGUuYXJyYXlbaWR4XSA9IGVkaXRhYmxlVk5vZGUobm9kZS5hcnJheVtpZHhdLCBvd25lcik7XG4gICAgICB9XG4gICAgICBub2RlLmFycmF5WyhvbGRUYWlsT2Zmc2V0ID4+PiBTSElGVCkgJiBNQVNLXSA9IG9sZFRhaWw7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHNpemUgaGFzIGJlZW4gcmVkdWNlZCwgdGhlcmUncyBhIGNoYW5jZSB0aGUgdGFpbCBuZWVkcyB0byBiZSB0cmltbWVkLlxuICAgIGlmIChuZXdDYXBhY2l0eSA8IG9sZENhcGFjaXR5KSB7XG4gICAgICBuZXdUYWlsID0gbmV3VGFpbCAmJiBuZXdUYWlsLnJlbW92ZUFmdGVyKG93bmVyLCAwLCBuZXdDYXBhY2l0eSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG5ldyBvcmlnaW4gaXMgd2l0aGluIHRoZSB0YWlsLCB0aGVuIHdlIGRvIG5vdCBuZWVkIGEgcm9vdC5cbiAgICBpZiAobmV3T3JpZ2luID49IG5ld1RhaWxPZmZzZXQpIHtcbiAgICAgIG5ld09yaWdpbiAtPSBuZXdUYWlsT2Zmc2V0O1xuICAgICAgbmV3Q2FwYWNpdHkgLT0gbmV3VGFpbE9mZnNldDtcbiAgICAgIG5ld0xldmVsID0gU0hJRlQ7XG4gICAgICBuZXdSb290ID0gbnVsbDtcbiAgICAgIG5ld1RhaWwgPSBuZXdUYWlsICYmIG5ld1RhaWwucmVtb3ZlQmVmb3JlKG93bmVyLCAwLCBuZXdPcmlnaW4pO1xuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiB0aGUgcm9vdCBoYXMgYmVlbiB0cmltbWVkLCBnYXJiYWdlIGNvbGxlY3QuXG4gICAgfSBlbHNlIGlmIChuZXdPcmlnaW4gPiBvbGRPcmlnaW4gfHwgbmV3VGFpbE9mZnNldCA8IG9sZFRhaWxPZmZzZXQpIHtcbiAgICAgIG9mZnNldFNoaWZ0ID0gMDtcblxuICAgICAgLy8gSWRlbnRpZnkgdGhlIG5ldyB0b3Agcm9vdCBub2RlIG9mIHRoZSBzdWJ0cmVlIG9mIHRoZSBvbGQgcm9vdC5cbiAgICAgIHdoaWxlIChuZXdSb290KSB7XG4gICAgICAgIHZhciBiZWdpbkluZGV4ID0gKG5ld09yaWdpbiA+Pj4gbmV3TGV2ZWwpICYgTUFTSztcbiAgICAgICAgaWYgKGJlZ2luSW5kZXggIT09IChuZXdUYWlsT2Zmc2V0ID4+PiBuZXdMZXZlbCkgJiBNQVNLKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJlZ2luSW5kZXgpIHtcbiAgICAgICAgICBvZmZzZXRTaGlmdCArPSAoMSA8PCBuZXdMZXZlbCkgKiBiZWdpbkluZGV4O1xuICAgICAgICB9XG4gICAgICAgIG5ld0xldmVsIC09IFNISUZUO1xuICAgICAgICBuZXdSb290ID0gbmV3Um9vdC5hcnJheVtiZWdpbkluZGV4XTtcbiAgICAgIH1cblxuICAgICAgLy8gVHJpbSB0aGUgbmV3IHNpZGVzIG9mIHRoZSBuZXcgcm9vdC5cbiAgICAgIGlmIChuZXdSb290ICYmIG5ld09yaWdpbiA+IG9sZE9yaWdpbikge1xuICAgICAgICBuZXdSb290ID0gbmV3Um9vdC5yZW1vdmVCZWZvcmUob3duZXIsIG5ld0xldmVsLCBuZXdPcmlnaW4gLSBvZmZzZXRTaGlmdCk7XG4gICAgICB9XG4gICAgICBpZiAobmV3Um9vdCAmJiBuZXdUYWlsT2Zmc2V0IDwgb2xkVGFpbE9mZnNldCkge1xuICAgICAgICBuZXdSb290ID0gbmV3Um9vdC5yZW1vdmVBZnRlcihvd25lciwgbmV3TGV2ZWwsIG5ld1RhaWxPZmZzZXQgLSBvZmZzZXRTaGlmdCk7XG4gICAgICB9XG4gICAgICBpZiAob2Zmc2V0U2hpZnQpIHtcbiAgICAgICAgbmV3T3JpZ2luIC09IG9mZnNldFNoaWZ0O1xuICAgICAgICBuZXdDYXBhY2l0eSAtPSBvZmZzZXRTaGlmdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobGlzdC5fX293bmVySUQpIHtcbiAgICAgIGxpc3Quc2l6ZSA9IG5ld0NhcGFjaXR5IC0gbmV3T3JpZ2luO1xuICAgICAgbGlzdC5fb3JpZ2luID0gbmV3T3JpZ2luO1xuICAgICAgbGlzdC5fY2FwYWNpdHkgPSBuZXdDYXBhY2l0eTtcbiAgICAgIGxpc3QuX2xldmVsID0gbmV3TGV2ZWw7XG4gICAgICBsaXN0Ll9yb290ID0gbmV3Um9vdDtcbiAgICAgIGxpc3QuX3RhaWwgPSBuZXdUYWlsO1xuICAgICAgbGlzdC5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICBsaXN0Ll9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICByZXR1cm4gbGlzdDtcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VMaXN0KG5ld09yaWdpbiwgbmV3Q2FwYWNpdHksIG5ld0xldmVsLCBuZXdSb290LCBuZXdUYWlsKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlSW50b0xpc3RXaXRoKGxpc3QsIG1lcmdlciwgaXRlcmFibGVzKSB7XG4gICAgdmFyIGl0ZXJzID0gW107XG4gICAgdmFyIG1heFNpemUgPSAwO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpdGVyYWJsZXMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpdGVyYWJsZXNbaWldO1xuICAgICAgdmFyIGl0ZXIgPSBJbmRleGVkSXRlcmFibGUodmFsdWUpO1xuICAgICAgaWYgKGl0ZXIuc2l6ZSA+IG1heFNpemUpIHtcbiAgICAgICAgbWF4U2l6ZSA9IGl0ZXIuc2l6ZTtcbiAgICAgIH1cbiAgICAgIGlmICghaXNJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgaXRlciA9IGl0ZXIubWFwKGZ1bmN0aW9uKHYgKSB7cmV0dXJuIGZyb21KUyh2KX0pO1xuICAgICAgfVxuICAgICAgaXRlcnMucHVzaChpdGVyKTtcbiAgICB9XG4gICAgaWYgKG1heFNpemUgPiBsaXN0LnNpemUpIHtcbiAgICAgIGxpc3QgPSBsaXN0LnNldFNpemUobWF4U2l6ZSk7XG4gICAgfVxuICAgIHJldHVybiBtZXJnZUludG9Db2xsZWN0aW9uV2l0aChsaXN0LCBtZXJnZXIsIGl0ZXJzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRhaWxPZmZzZXQoc2l6ZSkge1xuICAgIHJldHVybiBzaXplIDwgU0laRSA/IDAgOiAoKChzaXplIC0gMSkgPj4+IFNISUZUKSA8PCBTSElGVCk7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhPcmRlcmVkTWFwLCBNYXApO1xuXG4gICAgLy8gQHByYWdtYSBDb25zdHJ1Y3Rpb25cblxuICAgIGZ1bmN0aW9uIE9yZGVyZWRNYXAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZW1wdHlPcmRlcmVkTWFwKCkgOlxuICAgICAgICBpc09yZGVyZWRNYXAodmFsdWUpID8gdmFsdWUgOlxuICAgICAgICBlbXB0eU9yZGVyZWRNYXAoKS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKG1hcCApIHtcbiAgICAgICAgICB2YXIgaXRlciA9IEtleWVkSXRlcmFibGUodmFsdWUpO1xuICAgICAgICAgIGFzc2VydE5vdEluZmluaXRlKGl0ZXIuc2l6ZSk7XG4gICAgICAgICAgaXRlci5mb3JFYWNoKGZ1bmN0aW9uKHYsIGspICB7cmV0dXJuIG1hcC5zZXQoaywgdil9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgT3JkZXJlZE1hcC5vZiA9IGZ1bmN0aW9uKC8qLi4udmFsdWVzKi8pIHtcbiAgICAgIHJldHVybiB0aGlzKGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIE9yZGVyZWRNYXAucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKCdPcmRlcmVkTWFwIHsnLCAnfScpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIEFjY2Vzc1xuXG4gICAgT3JkZXJlZE1hcC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaywgbm90U2V0VmFsdWUpIHtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMuX21hcC5nZXQoayk7XG4gICAgICByZXR1cm4gaW5kZXggIT09IHVuZGVmaW5lZCA/IHRoaXMuX2xpc3QuZ2V0KGluZGV4KVsxXSA6IG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIE1vZGlmaWNhdGlvblxuXG4gICAgT3JkZXJlZE1hcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5fbWFwLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX2xpc3QuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gZW1wdHlPcmRlcmVkTWFwKCk7XG4gICAgfTtcblxuICAgIE9yZGVyZWRNYXAucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgIHJldHVybiB1cGRhdGVPcmRlcmVkTWFwKHRoaXMsIGssIHYpO1xuICAgIH07XG5cbiAgICBPcmRlcmVkTWFwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4gdXBkYXRlT3JkZXJlZE1hcCh0aGlzLCBrLCBOT1RfU0VUKTtcbiAgICB9O1xuXG4gICAgT3JkZXJlZE1hcC5wcm90b3R5cGUud2FzQWx0ZXJlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX21hcC53YXNBbHRlcmVkKCkgfHwgdGhpcy5fbGlzdC53YXNBbHRlcmVkKCk7XG4gICAgfTtcblxuICAgIE9yZGVyZWRNYXAucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcy5fbGlzdC5fX2l0ZXJhdGUoXG4gICAgICAgIGZ1bmN0aW9uKGVudHJ5ICkge3JldHVybiBlbnRyeSAmJiBmbihlbnRyeVsxXSwgZW50cnlbMF0sIHRoaXMkMCl9LFxuICAgICAgICByZXZlcnNlXG4gICAgICApO1xuICAgIH07XG5cbiAgICBPcmRlcmVkTWFwLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xpc3QuZnJvbUVudHJ5U2VxKCkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICB9O1xuXG4gICAgT3JkZXJlZE1hcC5wcm90b3R5cGUuX19lbnN1cmVPd25lciA9IGZ1bmN0aW9uKG93bmVySUQpIHtcbiAgICAgIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBuZXdNYXAgPSB0aGlzLl9tYXAuX19lbnN1cmVPd25lcihvd25lcklEKTtcbiAgICAgIHZhciBuZXdMaXN0ID0gdGhpcy5fbGlzdC5fX2Vuc3VyZU93bmVyKG93bmVySUQpO1xuICAgICAgaWYgKCFvd25lcklEKSB7XG4gICAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgICAgdGhpcy5fbWFwID0gbmV3TWFwO1xuICAgICAgICB0aGlzLl9saXN0ID0gbmV3TGlzdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFrZU9yZGVyZWRNYXAobmV3TWFwLCBuZXdMaXN0LCBvd25lcklELCB0aGlzLl9faGFzaCk7XG4gICAgfTtcblxuXG4gIGZ1bmN0aW9uIGlzT3JkZXJlZE1hcChtYXliZU9yZGVyZWRNYXApIHtcbiAgICByZXR1cm4gaXNNYXAobWF5YmVPcmRlcmVkTWFwKSAmJiBpc09yZGVyZWQobWF5YmVPcmRlcmVkTWFwKTtcbiAgfVxuXG4gIE9yZGVyZWRNYXAuaXNPcmRlcmVkTWFwID0gaXNPcmRlcmVkTWFwO1xuXG4gIE9yZGVyZWRNYXAucHJvdG90eXBlW0lTX09SREVSRURfU0VOVElORUxdID0gdHJ1ZTtcbiAgT3JkZXJlZE1hcC5wcm90b3R5cGVbREVMRVRFXSA9IE9yZGVyZWRNYXAucHJvdG90eXBlLnJlbW92ZTtcblxuXG5cbiAgZnVuY3Rpb24gbWFrZU9yZGVyZWRNYXAobWFwLCBsaXN0LCBvd25lcklELCBoYXNoKSB7XG4gICAgdmFyIG9tYXAgPSBPYmplY3QuY3JlYXRlKE9yZGVyZWRNYXAucHJvdG90eXBlKTtcbiAgICBvbWFwLnNpemUgPSBtYXAgPyBtYXAuc2l6ZSA6IDA7XG4gICAgb21hcC5fbWFwID0gbWFwO1xuICAgIG9tYXAuX2xpc3QgPSBsaXN0O1xuICAgIG9tYXAuX19vd25lcklEID0gb3duZXJJRDtcbiAgICBvbWFwLl9faGFzaCA9IGhhc2g7XG4gICAgcmV0dXJuIG9tYXA7XG4gIH1cblxuICB2YXIgRU1QVFlfT1JERVJFRF9NQVA7XG4gIGZ1bmN0aW9uIGVtcHR5T3JkZXJlZE1hcCgpIHtcbiAgICByZXR1cm4gRU1QVFlfT1JERVJFRF9NQVAgfHwgKEVNUFRZX09SREVSRURfTUFQID0gbWFrZU9yZGVyZWRNYXAoZW1wdHlNYXAoKSwgZW1wdHlMaXN0KCkpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZU9yZGVyZWRNYXAob21hcCwgaywgdikge1xuICAgIHZhciBtYXAgPSBvbWFwLl9tYXA7XG4gICAgdmFyIGxpc3QgPSBvbWFwLl9saXN0O1xuICAgIHZhciBpID0gbWFwLmdldChrKTtcbiAgICB2YXIgaGFzID0gaSAhPT0gdW5kZWZpbmVkO1xuICAgIHZhciBuZXdNYXA7XG4gICAgdmFyIG5ld0xpc3Q7XG4gICAgaWYgKHYgPT09IE5PVF9TRVQpIHsgLy8gcmVtb3ZlZFxuICAgICAgaWYgKCFoYXMpIHtcbiAgICAgICAgcmV0dXJuIG9tYXA7XG4gICAgICB9XG4gICAgICBpZiAobGlzdC5zaXplID49IFNJWkUgJiYgbGlzdC5zaXplID49IG1hcC5zaXplICogMikge1xuICAgICAgICBuZXdMaXN0ID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24oZW50cnksIGlkeCkgIHtyZXR1cm4gZW50cnkgIT09IHVuZGVmaW5lZCAmJiBpICE9PSBpZHh9KTtcbiAgICAgICAgbmV3TWFwID0gbmV3TGlzdC50b0tleWVkU2VxKCkubWFwKGZ1bmN0aW9uKGVudHJ5ICkge3JldHVybiBlbnRyeVswXX0pLmZsaXAoKS50b01hcCgpO1xuICAgICAgICBpZiAob21hcC5fX293bmVySUQpIHtcbiAgICAgICAgICBuZXdNYXAuX19vd25lcklEID0gbmV3TGlzdC5fX293bmVySUQgPSBvbWFwLl9fb3duZXJJRDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwID0gbWFwLnJlbW92ZShrKTtcbiAgICAgICAgbmV3TGlzdCA9IGkgPT09IGxpc3Quc2l6ZSAtIDEgPyBsaXN0LnBvcCgpIDogbGlzdC5zZXQoaSwgdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGhhcykge1xuICAgICAgICBpZiAodiA9PT0gbGlzdC5nZXQoaSlbMV0pIHtcbiAgICAgICAgICByZXR1cm4gb21hcDtcbiAgICAgICAgfVxuICAgICAgICBuZXdNYXAgPSBtYXA7XG4gICAgICAgIG5ld0xpc3QgPSBsaXN0LnNldChpLCBbaywgdl0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3TWFwID0gbWFwLnNldChrLCBsaXN0LnNpemUpO1xuICAgICAgICBuZXdMaXN0ID0gbGlzdC5zZXQobGlzdC5zaXplLCBbaywgdl0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob21hcC5fX293bmVySUQpIHtcbiAgICAgIG9tYXAuc2l6ZSA9IG5ld01hcC5zaXplO1xuICAgICAgb21hcC5fbWFwID0gbmV3TWFwO1xuICAgICAgb21hcC5fbGlzdCA9IG5ld0xpc3Q7XG4gICAgICBvbWFwLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgIHJldHVybiBvbWFwO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZU9yZGVyZWRNYXAobmV3TWFwLCBuZXdMaXN0KTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKFN0YWNrLCBJbmRleGVkQ29sbGVjdGlvbik7XG5cbiAgICAvLyBAcHJhZ21hIENvbnN0cnVjdGlvblxuXG4gICAgZnVuY3Rpb24gU3RhY2sodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZW1wdHlTdGFjaygpIDpcbiAgICAgICAgaXNTdGFjayh2YWx1ZSkgPyB2YWx1ZSA6XG4gICAgICAgIGVtcHR5U3RhY2soKS51bnNoaWZ0QWxsKHZhbHVlKTtcbiAgICB9XG5cbiAgICBTdGFjay5vZiA9IGZ1bmN0aW9uKC8qLi4udmFsdWVzKi8pIHtcbiAgICAgIHJldHVybiB0aGlzKGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnU3RhY2sgWycsICddJyk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgQWNjZXNzXG5cbiAgICBTdGFjay5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaW5kZXgsIG5vdFNldFZhbHVlKSB7XG4gICAgICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQ7XG4gICAgICB3aGlsZSAoaGVhZCAmJiBpbmRleC0tKSB7XG4gICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGVhZCA/IGhlYWQudmFsdWUgOiBub3RTZXRWYWx1ZTtcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9oZWFkICYmIHRoaXMuX2hlYWQudmFsdWU7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgICBTdGFjay5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKC8qLi4udmFsdWVzKi8pIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIG5ld1NpemUgPSB0aGlzLnNpemUgKyBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkO1xuICAgICAgZm9yICh2YXIgaWkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaWkgPj0gMDsgaWktLSkge1xuICAgICAgICBoZWFkID0ge1xuICAgICAgICAgIHZhbHVlOiBhcmd1bWVudHNbaWldLFxuICAgICAgICAgIG5leHQ6IGhlYWRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICB0aGlzLnNpemUgPSBuZXdTaXplO1xuICAgICAgICB0aGlzLl9oZWFkID0gaGVhZDtcbiAgICAgICAgdGhpcy5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFrZVN0YWNrKG5ld1NpemUsIGhlYWQpO1xuICAgIH07XG5cbiAgICBTdGFjay5wcm90b3R5cGUucHVzaEFsbCA9IGZ1bmN0aW9uKGl0ZXIpIHtcbiAgICAgIGl0ZXIgPSBJbmRleGVkSXRlcmFibGUoaXRlcik7XG4gICAgICBpZiAoaXRlci5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90SW5maW5pdGUoaXRlci5zaXplKTtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5zaXplO1xuICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkO1xuICAgICAgaXRlci5yZXZlcnNlKCkuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSApIHtcbiAgICAgICAgbmV3U2l6ZSsrO1xuICAgICAgICBoZWFkID0ge1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBuZXh0OiBoZWFkXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICB0aGlzLnNpemUgPSBuZXdTaXplO1xuICAgICAgICB0aGlzLl9oZWFkID0gaGVhZDtcbiAgICAgICAgdGhpcy5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFrZVN0YWNrKG5ld1NpemUsIGhlYWQpO1xuICAgIH07XG5cbiAgICBTdGFjay5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zbGljZSgxKTtcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLnVuc2hpZnQgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gdGhpcy5wdXNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS51bnNoaWZ0QWxsID0gZnVuY3Rpb24oaXRlcikge1xuICAgICAgcmV0dXJuIHRoaXMucHVzaEFsbChpdGVyKTtcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLnNoaWZ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb3AuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgIHRoaXMuX2hlYWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVtcHR5U3RhY2soKTtcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgaWYgKHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgdGhpcy5zaXplKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciByZXNvbHZlZEJlZ2luID0gcmVzb2x2ZUJlZ2luKGJlZ2luLCB0aGlzLnNpemUpO1xuICAgICAgdmFyIHJlc29sdmVkRW5kID0gcmVzb2x2ZUVuZChlbmQsIHRoaXMuc2l6ZSk7XG4gICAgICBpZiAocmVzb2x2ZWRFbmQgIT09IHRoaXMuc2l6ZSkge1xuICAgICAgICAvLyBzdXBlci5zbGljZShiZWdpbiwgZW5kKTtcbiAgICAgICAgcmV0dXJuIEluZGV4ZWRDb2xsZWN0aW9uLnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMsIGJlZ2luLCBlbmQpO1xuICAgICAgfVxuICAgICAgdmFyIG5ld1NpemUgPSB0aGlzLnNpemUgLSByZXNvbHZlZEJlZ2luO1xuICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkO1xuICAgICAgd2hpbGUgKHJlc29sdmVkQmVnaW4tLSkge1xuICAgICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IG5ld1NpemU7XG4gICAgICAgIHRoaXMuX2hlYWQgPSBoZWFkO1xuICAgICAgICB0aGlzLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYWtlU3RhY2sobmV3U2l6ZSwgaGVhZCk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgTXV0YWJpbGl0eVxuXG4gICAgU3RhY2sucHJvdG90eXBlLl9fZW5zdXJlT3duZXIgPSBmdW5jdGlvbihvd25lcklEKSB7XG4gICAgICBpZiAob3duZXJJRCA9PT0gdGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpZiAoIW93bmVySUQpIHtcbiAgICAgICAgdGhpcy5fX293bmVySUQgPSBvd25lcklEO1xuICAgICAgICB0aGlzLl9fYWx0ZXJlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYWtlU3RhY2sodGhpcy5zaXplLCB0aGlzLl9oZWFkLCBvd25lcklELCB0aGlzLl9faGFzaCk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgSXRlcmF0aW9uXG5cbiAgICBTdGFjay5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvU2VxKCkuY2FjaGVSZXN1bHQuX19pdGVyYXRlKGZuLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBub2RlID0gdGhpcy5faGVhZDtcbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChmbihub2RlLnZhbHVlLCBpdGVyYXRpb25zKyssIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50b1NlcSgpLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBub2RlID0gdGhpcy5faGVhZDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IG5vZGUudmFsdWU7XG4gICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG5cbiAgZnVuY3Rpb24gaXNTdGFjayhtYXliZVN0YWNrKSB7XG4gICAgcmV0dXJuICEhKG1heWJlU3RhY2sgJiYgbWF5YmVTdGFja1tJU19TVEFDS19TRU5USU5FTF0pO1xuICB9XG5cbiAgU3RhY2suaXNTdGFjayA9IGlzU3RhY2s7XG5cbiAgdmFyIElTX1NUQUNLX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfU1RBQ0tfX0BAJztcblxuICB2YXIgU3RhY2tQcm90b3R5cGUgPSBTdGFjay5wcm90b3R5cGU7XG4gIFN0YWNrUHJvdG90eXBlW0lTX1NUQUNLX1NFTlRJTkVMXSA9IHRydWU7XG4gIFN0YWNrUHJvdG90eXBlLndpdGhNdXRhdGlvbnMgPSBNYXBQcm90b3R5cGUud2l0aE11dGF0aW9ucztcbiAgU3RhY2tQcm90b3R5cGUuYXNNdXRhYmxlID0gTWFwUHJvdG90eXBlLmFzTXV0YWJsZTtcbiAgU3RhY2tQcm90b3R5cGUuYXNJbW11dGFibGUgPSBNYXBQcm90b3R5cGUuYXNJbW11dGFibGU7XG4gIFN0YWNrUHJvdG90eXBlLndhc0FsdGVyZWQgPSBNYXBQcm90b3R5cGUud2FzQWx0ZXJlZDtcblxuXG4gIGZ1bmN0aW9uIG1ha2VTdGFjayhzaXplLCBoZWFkLCBvd25lcklELCBoYXNoKSB7XG4gICAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUoU3RhY2tQcm90b3R5cGUpO1xuICAgIG1hcC5zaXplID0gc2l6ZTtcbiAgICBtYXAuX2hlYWQgPSBoZWFkO1xuICAgIG1hcC5fX293bmVySUQgPSBvd25lcklEO1xuICAgIG1hcC5fX2hhc2ggPSBoYXNoO1xuICAgIG1hcC5fX2FsdGVyZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gbWFwO1xuICB9XG5cbiAgdmFyIEVNUFRZX1NUQUNLO1xuICBmdW5jdGlvbiBlbXB0eVN0YWNrKCkge1xuICAgIHJldHVybiBFTVBUWV9TVEFDSyB8fCAoRU1QVFlfU1RBQ0sgPSBtYWtlU3RhY2soMCkpO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoU2V0LCBTZXRDb2xsZWN0aW9uKTtcblxuICAgIC8vIEBwcmFnbWEgQ29uc3RydWN0aW9uXG5cbiAgICBmdW5jdGlvbiBTZXQodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZW1wdHlTZXQoKSA6XG4gICAgICAgIGlzU2V0KHZhbHVlKSA/IHZhbHVlIDpcbiAgICAgICAgZW1wdHlTZXQoKS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKHNldCApIHtcbiAgICAgICAgICB2YXIgaXRlciA9IFNldEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgICAgICBhc3NlcnROb3RJbmZpbml0ZShpdGVyLnNpemUpO1xuICAgICAgICAgIGl0ZXIuZm9yRWFjaChmdW5jdGlvbih2ICkge3JldHVybiBzZXQuYWRkKHYpfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFNldC5vZiA9IGZ1bmN0aW9uKC8qLi4udmFsdWVzKi8pIHtcbiAgICAgIHJldHVybiB0aGlzKGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFNldC5mcm9tS2V5cyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcyhLZXllZEl0ZXJhYmxlKHZhbHVlKS5rZXlTZXEoKSk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ1NldCB7JywgJ30nKTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBBY2Nlc3NcblxuICAgIFNldC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tYXAuaGFzKHZhbHVlKTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBNb2RpZmljYXRpb25cblxuICAgIFNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB1cGRhdGVTZXQodGhpcywgdGhpcy5fbWFwLnNldCh2YWx1ZSwgdHJ1ZSkpO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdXBkYXRlU2V0KHRoaXMsIHRoaXMuX21hcC5yZW1vdmUodmFsdWUpKTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHVwZGF0ZVNldCh0aGlzLCB0aGlzLl9tYXAuY2xlYXIoKSk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgQ29tcG9zaXRpb25cblxuICAgIFNldC5wcm90b3R5cGUudW5pb24gPSBmdW5jdGlvbigpIHt2YXIgaXRlcnMgPSBTTElDRSQwLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgIGl0ZXJzID0gaXRlcnMuZmlsdGVyKGZ1bmN0aW9uKHggKSB7cmV0dXJuIHguc2l6ZSAhPT0gMH0pO1xuICAgICAgaWYgKGl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDAgJiYgaXRlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yKGl0ZXJzWzBdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24oc2V0ICkge1xuICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaXRlcnMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICAgICAgU2V0SXRlcmFibGUoaXRlcnNbaWldKS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlICkge3JldHVybiBzZXQuYWRkKHZhbHVlKX0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5pbnRlcnNlY3QgPSBmdW5jdGlvbigpIHt2YXIgaXRlcnMgPSBTTElDRSQwLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgIGlmIChpdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpdGVycyA9IGl0ZXJzLm1hcChmdW5jdGlvbihpdGVyICkge3JldHVybiBTZXRJdGVyYWJsZShpdGVyKX0pO1xuICAgICAgdmFyIG9yaWdpbmFsU2V0ID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24oc2V0ICkge1xuICAgICAgICBvcmlnaW5hbFNldC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlICkge1xuICAgICAgICAgIGlmICghaXRlcnMuZXZlcnkoZnVuY3Rpb24oaXRlciApIHtyZXR1cm4gaXRlci5jb250YWlucyh2YWx1ZSl9KSkge1xuICAgICAgICAgICAgc2V0LnJlbW92ZSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24oKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICBpZiAoaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaXRlcnMgPSBpdGVycy5tYXAoZnVuY3Rpb24oaXRlciApIHtyZXR1cm4gU2V0SXRlcmFibGUoaXRlcil9KTtcbiAgICAgIHZhciBvcmlnaW5hbFNldCA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcy53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKHNldCApIHtcbiAgICAgICAgb3JpZ2luYWxTZXQuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSApIHtcbiAgICAgICAgICBpZiAoaXRlcnMuc29tZShmdW5jdGlvbihpdGVyICkge3JldHVybiBpdGVyLmNvbnRhaW5zKHZhbHVlKX0pKSB7XG4gICAgICAgICAgICBzZXQucmVtb3ZlKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnVuaW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUubWVyZ2VXaXRoID0gZnVuY3Rpb24obWVyZ2VyKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gdGhpcy51bmlvbi5hcHBseSh0aGlzLCBpdGVycyk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUuc29ydCA9IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIC8vIExhdGUgYmluZGluZ1xuICAgICAgcmV0dXJuIE9yZGVyZWRTZXQoc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvcikpO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLnNvcnRCeSA9IGZ1bmN0aW9uKG1hcHBlciwgY29tcGFyYXRvcikge1xuICAgICAgLy8gTGF0ZSBiaW5kaW5nXG4gICAgICByZXR1cm4gT3JkZXJlZFNldChzb3J0RmFjdG9yeSh0aGlzLCBjb21wYXJhdG9yLCBtYXBwZXIpKTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS53YXNBbHRlcmVkID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWFwLndhc0FsdGVyZWQoKTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIHRoaXMuX21hcC5fX2l0ZXJhdGUoZnVuY3Rpb24oXywgaykgIHtyZXR1cm4gZm4oaywgaywgdGhpcyQwKX0sIHJldmVyc2UpO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWFwLm1hcChmdW5jdGlvbihfLCBrKSAge3JldHVybiBrfSkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5fX2Vuc3VyZU93bmVyID0gZnVuY3Rpb24ob3duZXJJRCkge1xuICAgICAgaWYgKG93bmVySUQgPT09IHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIG5ld01hcCA9IHRoaXMuX21hcC5fX2Vuc3VyZU93bmVyKG93bmVySUQpO1xuICAgICAgaWYgKCFvd25lcklEKSB7XG4gICAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgICAgdGhpcy5fbWFwID0gbmV3TWFwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9fbWFrZShuZXdNYXAsIG93bmVySUQpO1xuICAgIH07XG5cblxuICBmdW5jdGlvbiBpc1NldChtYXliZVNldCkge1xuICAgIHJldHVybiAhIShtYXliZVNldCAmJiBtYXliZVNldFtJU19TRVRfU0VOVElORUxdKTtcbiAgfVxuXG4gIFNldC5pc1NldCA9IGlzU2V0O1xuXG4gIHZhciBJU19TRVRfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9TRVRfX0BAJztcblxuICB2YXIgU2V0UHJvdG90eXBlID0gU2V0LnByb3RvdHlwZTtcbiAgU2V0UHJvdG90eXBlW0lTX1NFVF9TRU5USU5FTF0gPSB0cnVlO1xuICBTZXRQcm90b3R5cGVbREVMRVRFXSA9IFNldFByb3RvdHlwZS5yZW1vdmU7XG4gIFNldFByb3RvdHlwZS5tZXJnZURlZXAgPSBTZXRQcm90b3R5cGUubWVyZ2U7XG4gIFNldFByb3RvdHlwZS5tZXJnZURlZXBXaXRoID0gU2V0UHJvdG90eXBlLm1lcmdlV2l0aDtcbiAgU2V0UHJvdG90eXBlLndpdGhNdXRhdGlvbnMgPSBNYXBQcm90b3R5cGUud2l0aE11dGF0aW9ucztcbiAgU2V0UHJvdG90eXBlLmFzTXV0YWJsZSA9IE1hcFByb3RvdHlwZS5hc011dGFibGU7XG4gIFNldFByb3RvdHlwZS5hc0ltbXV0YWJsZSA9IE1hcFByb3RvdHlwZS5hc0ltbXV0YWJsZTtcblxuICBTZXRQcm90b3R5cGUuX19lbXB0eSA9IGVtcHR5U2V0O1xuICBTZXRQcm90b3R5cGUuX19tYWtlID0gbWFrZVNldDtcblxuICBmdW5jdGlvbiB1cGRhdGVTZXQoc2V0LCBuZXdNYXApIHtcbiAgICBpZiAoc2V0Ll9fb3duZXJJRCkge1xuICAgICAgc2V0LnNpemUgPSBuZXdNYXAuc2l6ZTtcbiAgICAgIHNldC5fbWFwID0gbmV3TWFwO1xuICAgICAgcmV0dXJuIHNldDtcbiAgICB9XG4gICAgcmV0dXJuIG5ld01hcCA9PT0gc2V0Ll9tYXAgPyBzZXQgOlxuICAgICAgbmV3TWFwLnNpemUgPT09IDAgPyBzZXQuX19lbXB0eSgpIDpcbiAgICAgIHNldC5fX21ha2UobmV3TWFwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VTZXQobWFwLCBvd25lcklEKSB7XG4gICAgdmFyIHNldCA9IE9iamVjdC5jcmVhdGUoU2V0UHJvdG90eXBlKTtcbiAgICBzZXQuc2l6ZSA9IG1hcCA/IG1hcC5zaXplIDogMDtcbiAgICBzZXQuX21hcCA9IG1hcDtcbiAgICBzZXQuX19vd25lcklEID0gb3duZXJJRDtcbiAgICByZXR1cm4gc2V0O1xuICB9XG5cbiAgdmFyIEVNUFRZX1NFVDtcbiAgZnVuY3Rpb24gZW1wdHlTZXQoKSB7XG4gICAgcmV0dXJuIEVNUFRZX1NFVCB8fCAoRU1QVFlfU0VUID0gbWFrZVNldChlbXB0eU1hcCgpKSk7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhPcmRlcmVkU2V0LCBTZXQpO1xuXG4gICAgLy8gQHByYWdtYSBDb25zdHJ1Y3Rpb25cblxuICAgIGZ1bmN0aW9uIE9yZGVyZWRTZXQodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZW1wdHlPcmRlcmVkU2V0KCkgOlxuICAgICAgICBpc09yZGVyZWRTZXQodmFsdWUpID8gdmFsdWUgOlxuICAgICAgICBlbXB0eU9yZGVyZWRTZXQoKS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKHNldCApIHtcbiAgICAgICAgICB2YXIgaXRlciA9IFNldEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgICAgICBhc3NlcnROb3RJbmZpbml0ZShpdGVyLnNpemUpO1xuICAgICAgICAgIGl0ZXIuZm9yRWFjaChmdW5jdGlvbih2ICkge3JldHVybiBzZXQuYWRkKHYpfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIE9yZGVyZWRTZXQub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gdGhpcyhhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBPcmRlcmVkU2V0LmZyb21LZXlzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzKEtleWVkSXRlcmFibGUodmFsdWUpLmtleVNlcSgpKTtcbiAgICB9O1xuXG4gICAgT3JkZXJlZFNldC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ09yZGVyZWRTZXQgeycsICd9Jyk7XG4gICAgfTtcblxuXG4gIGZ1bmN0aW9uIGlzT3JkZXJlZFNldChtYXliZU9yZGVyZWRTZXQpIHtcbiAgICByZXR1cm4gaXNTZXQobWF5YmVPcmRlcmVkU2V0KSAmJiBpc09yZGVyZWQobWF5YmVPcmRlcmVkU2V0KTtcbiAgfVxuXG4gIE9yZGVyZWRTZXQuaXNPcmRlcmVkU2V0ID0gaXNPcmRlcmVkU2V0O1xuXG4gIHZhciBPcmRlcmVkU2V0UHJvdG90eXBlID0gT3JkZXJlZFNldC5wcm90b3R5cGU7XG4gIE9yZGVyZWRTZXRQcm90b3R5cGVbSVNfT1JERVJFRF9TRU5USU5FTF0gPSB0cnVlO1xuXG4gIE9yZGVyZWRTZXRQcm90b3R5cGUuX19lbXB0eSA9IGVtcHR5T3JkZXJlZFNldDtcbiAgT3JkZXJlZFNldFByb3RvdHlwZS5fX21ha2UgPSBtYWtlT3JkZXJlZFNldDtcblxuICBmdW5jdGlvbiBtYWtlT3JkZXJlZFNldChtYXAsIG93bmVySUQpIHtcbiAgICB2YXIgc2V0ID0gT2JqZWN0LmNyZWF0ZShPcmRlcmVkU2V0UHJvdG90eXBlKTtcbiAgICBzZXQuc2l6ZSA9IG1hcCA/IG1hcC5zaXplIDogMDtcbiAgICBzZXQuX21hcCA9IG1hcDtcbiAgICBzZXQuX19vd25lcklEID0gb3duZXJJRDtcbiAgICByZXR1cm4gc2V0O1xuICB9XG5cbiAgdmFyIEVNUFRZX09SREVSRURfU0VUO1xuICBmdW5jdGlvbiBlbXB0eU9yZGVyZWRTZXQoKSB7XG4gICAgcmV0dXJuIEVNUFRZX09SREVSRURfU0VUIHx8IChFTVBUWV9PUkRFUkVEX1NFVCA9IG1ha2VPcmRlcmVkU2V0KGVtcHR5T3JkZXJlZE1hcCgpKSk7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhSZWNvcmQsIEtleWVkQ29sbGVjdGlvbik7XG5cbiAgICBmdW5jdGlvbiBSZWNvcmQoZGVmYXVsdFZhbHVlcywgbmFtZSkge1xuICAgICAgdmFyIFJlY29yZFR5cGUgPSBmdW5jdGlvbiBSZWNvcmQodmFsdWVzKSB7XG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSZWNvcmRUeXBlKSkge1xuICAgICAgICAgIHJldHVybiBuZXcgUmVjb3JkVHlwZSh2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21hcCA9IE1hcCh2YWx1ZXMpO1xuICAgICAgfTtcblxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkZWZhdWx0VmFsdWVzKTtcblxuICAgICAgdmFyIFJlY29yZFR5cGVQcm90b3R5cGUgPSBSZWNvcmRUeXBlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUmVjb3JkUHJvdG90eXBlKTtcbiAgICAgIFJlY29yZFR5cGVQcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWNvcmRUeXBlO1xuICAgICAgbmFtZSAmJiAoUmVjb3JkVHlwZVByb3RvdHlwZS5fbmFtZSA9IG5hbWUpO1xuICAgICAgUmVjb3JkVHlwZVByb3RvdHlwZS5fZGVmYXVsdFZhbHVlcyA9IGRlZmF1bHRWYWx1ZXM7XG4gICAgICBSZWNvcmRUeXBlUHJvdG90eXBlLl9rZXlzID0ga2V5cztcbiAgICAgIFJlY29yZFR5cGVQcm90b3R5cGUuc2l6ZSA9IGtleXMubGVuZ3RoO1xuXG4gICAgICB0cnkge1xuICAgICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5ICkge1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWNvcmRUeXBlLnByb3RvdHlwZSwga2V5LCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXQoa2V5KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgIGludmFyaWFudCh0aGlzLl9fb3duZXJJRCwgJ0Nhbm5vdCBzZXQgb24gYW4gaW1tdXRhYmxlIHJlY29yZC4nKTtcbiAgICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gT2JqZWN0LmRlZmluZVByb3BlcnR5IGZhaWxlZC4gUHJvYmFibHkgSUU4LlxuICAgICAgfVxuXG4gICAgICByZXR1cm4gUmVjb3JkVHlwZTtcbiAgICB9XG5cbiAgICBSZWNvcmQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKHJlY29yZE5hbWUodGhpcykgKyAnIHsnLCAnfScpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIEFjY2Vzc1xuXG4gICAgUmVjb3JkLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihrKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGVmYXVsdFZhbHVlcy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICB9O1xuXG4gICAgUmVjb3JkLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrLCBub3RTZXRWYWx1ZSkge1xuICAgICAgaWYgKCF0aGlzLmhhcyhrKSkge1xuICAgICAgICByZXR1cm4gbm90U2V0VmFsdWU7XG4gICAgICB9XG4gICAgICB2YXIgZGVmYXVsdFZhbCA9IHRoaXMuX2RlZmF1bHRWYWx1ZXNba107XG4gICAgICByZXR1cm4gdGhpcy5fbWFwID8gdGhpcy5fbWFwLmdldChrLCBkZWZhdWx0VmFsKSA6IGRlZmF1bHRWYWw7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgICBSZWNvcmQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgdGhpcy5fbWFwICYmIHRoaXMuX21hcC5jbGVhcigpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBTdXBlclJlY29yZCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjtcbiAgICAgIHJldHVybiBTdXBlclJlY29yZC5fZW1wdHkgfHwgKFN1cGVyUmVjb3JkLl9lbXB0eSA9IG1ha2VSZWNvcmQodGhpcywgZW1wdHlNYXAoKSkpO1xuICAgIH07XG5cbiAgICBSZWNvcmQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgIGlmICghdGhpcy5oYXMoaykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3Qgc2V0IHVua25vd24ga2V5IFwiJyArIGsgKyAnXCIgb24gJyArIHJlY29yZE5hbWUodGhpcykpO1xuICAgICAgfVxuICAgICAgdmFyIG5ld01hcCA9IHRoaXMuX21hcCAmJiB0aGlzLl9tYXAuc2V0KGssIHYpO1xuICAgICAgaWYgKHRoaXMuX19vd25lcklEIHx8IG5ld01hcCA9PT0gdGhpcy5fbWFwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ha2VSZWNvcmQodGhpcywgbmV3TWFwKTtcbiAgICB9O1xuXG4gICAgUmVjb3JkLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihrKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzKGspKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIG5ld01hcCA9IHRoaXMuX21hcCAmJiB0aGlzLl9tYXAucmVtb3ZlKGspO1xuICAgICAgaWYgKHRoaXMuX19vd25lcklEIHx8IG5ld01hcCA9PT0gdGhpcy5fbWFwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ha2VSZWNvcmQodGhpcywgbmV3TWFwKTtcbiAgICB9O1xuXG4gICAgUmVjb3JkLnByb3RvdHlwZS53YXNBbHRlcmVkID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWFwLndhc0FsdGVyZWQoKTtcbiAgICB9O1xuXG4gICAgUmVjb3JkLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIEtleWVkSXRlcmFibGUodGhpcy5fZGVmYXVsdFZhbHVlcykubWFwKGZ1bmN0aW9uKF8sIGspICB7cmV0dXJuIHRoaXMkMC5nZXQoayl9KS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgIH07XG5cbiAgICBSZWNvcmQucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICByZXR1cm4gS2V5ZWRJdGVyYWJsZSh0aGlzLl9kZWZhdWx0VmFsdWVzKS5tYXAoZnVuY3Rpb24oXywgaykgIHtyZXR1cm4gdGhpcyQwLmdldChrKX0pLl9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG4gICAgfTtcblxuICAgIFJlY29yZC5wcm90b3R5cGUuX19lbnN1cmVPd25lciA9IGZ1bmN0aW9uKG93bmVySUQpIHtcbiAgICAgIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBuZXdNYXAgPSB0aGlzLl9tYXAgJiYgdGhpcy5fbWFwLl9fZW5zdXJlT3duZXIob3duZXJJRCk7XG4gICAgICBpZiAoIW93bmVySUQpIHtcbiAgICAgICAgdGhpcy5fX293bmVySUQgPSBvd25lcklEO1xuICAgICAgICB0aGlzLl9tYXAgPSBuZXdNYXA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ha2VSZWNvcmQodGhpcywgbmV3TWFwLCBvd25lcklEKTtcbiAgICB9O1xuXG5cbiAgdmFyIFJlY29yZFByb3RvdHlwZSA9IFJlY29yZC5wcm90b3R5cGU7XG4gIFJlY29yZFByb3RvdHlwZVtERUxFVEVdID0gUmVjb3JkUHJvdG90eXBlLnJlbW92ZTtcbiAgUmVjb3JkUHJvdG90eXBlLmRlbGV0ZUluID1cbiAgUmVjb3JkUHJvdG90eXBlLnJlbW92ZUluID0gTWFwUHJvdG90eXBlLnJlbW92ZUluO1xuICBSZWNvcmRQcm90b3R5cGUubWVyZ2UgPSBNYXBQcm90b3R5cGUubWVyZ2U7XG4gIFJlY29yZFByb3RvdHlwZS5tZXJnZVdpdGggPSBNYXBQcm90b3R5cGUubWVyZ2VXaXRoO1xuICBSZWNvcmRQcm90b3R5cGUubWVyZ2VJbiA9IE1hcFByb3RvdHlwZS5tZXJnZUluO1xuICBSZWNvcmRQcm90b3R5cGUubWVyZ2VEZWVwID0gTWFwUHJvdG90eXBlLm1lcmdlRGVlcDtcbiAgUmVjb3JkUHJvdG90eXBlLm1lcmdlRGVlcFdpdGggPSBNYXBQcm90b3R5cGUubWVyZ2VEZWVwV2l0aDtcbiAgUmVjb3JkUHJvdG90eXBlLm1lcmdlRGVlcEluID0gTWFwUHJvdG90eXBlLm1lcmdlRGVlcEluO1xuICBSZWNvcmRQcm90b3R5cGUuc2V0SW4gPSBNYXBQcm90b3R5cGUuc2V0SW47XG4gIFJlY29yZFByb3RvdHlwZS51cGRhdGUgPSBNYXBQcm90b3R5cGUudXBkYXRlO1xuICBSZWNvcmRQcm90b3R5cGUudXBkYXRlSW4gPSBNYXBQcm90b3R5cGUudXBkYXRlSW47XG4gIFJlY29yZFByb3RvdHlwZS53aXRoTXV0YXRpb25zID0gTWFwUHJvdG90eXBlLndpdGhNdXRhdGlvbnM7XG4gIFJlY29yZFByb3RvdHlwZS5hc011dGFibGUgPSBNYXBQcm90b3R5cGUuYXNNdXRhYmxlO1xuICBSZWNvcmRQcm90b3R5cGUuYXNJbW11dGFibGUgPSBNYXBQcm90b3R5cGUuYXNJbW11dGFibGU7XG5cblxuICBmdW5jdGlvbiBtYWtlUmVjb3JkKGxpa2VSZWNvcmQsIG1hcCwgb3duZXJJRCkge1xuICAgIHZhciByZWNvcmQgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihsaWtlUmVjb3JkKSk7XG4gICAgcmVjb3JkLl9tYXAgPSBtYXA7XG4gICAgcmVjb3JkLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZE5hbWUocmVjb3JkKSB7XG4gICAgcmV0dXJuIHJlY29yZC5fbmFtZSB8fCByZWNvcmQuY29uc3RydWN0b3IubmFtZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZXBFcXVhbChhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgICFpc0l0ZXJhYmxlKGIpIHx8XG4gICAgICBhLnNpemUgIT09IHVuZGVmaW5lZCAmJiBiLnNpemUgIT09IHVuZGVmaW5lZCAmJiBhLnNpemUgIT09IGIuc2l6ZSB8fFxuICAgICAgYS5fX2hhc2ggIT09IHVuZGVmaW5lZCAmJiBiLl9faGFzaCAhPT0gdW5kZWZpbmVkICYmIGEuX19oYXNoICE9PSBiLl9faGFzaCB8fFxuICAgICAgaXNLZXllZChhKSAhPT0gaXNLZXllZChiKSB8fFxuICAgICAgaXNJbmRleGVkKGEpICE9PSBpc0luZGV4ZWQoYikgfHxcbiAgICAgIGlzT3JkZXJlZChhKSAhPT0gaXNPcmRlcmVkKGIpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGEuc2l6ZSA9PT0gMCAmJiBiLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBub3RBc3NvY2lhdGl2ZSA9ICFpc0Fzc29jaWF0aXZlKGEpO1xuXG4gICAgaWYgKGlzT3JkZXJlZChhKSkge1xuICAgICAgdmFyIGVudHJpZXMgPSBhLmVudHJpZXMoKTtcbiAgICAgIHJldHVybiBiLmV2ZXJ5KGZ1bmN0aW9uKHYsIGspICB7XG4gICAgICAgIHZhciBlbnRyeSA9IGVudHJpZXMubmV4dCgpLnZhbHVlO1xuICAgICAgICByZXR1cm4gZW50cnkgJiYgaXMoZW50cnlbMV0sIHYpICYmIChub3RBc3NvY2lhdGl2ZSB8fCBpcyhlbnRyeVswXSwgaykpO1xuICAgICAgfSkgJiYgZW50cmllcy5uZXh0KCkuZG9uZTtcbiAgICB9XG5cbiAgICB2YXIgZmxpcHBlZCA9IGZhbHNlO1xuXG4gICAgaWYgKGEuc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoYi5zaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYS5jYWNoZVJlc3VsdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmxpcHBlZCA9IHRydWU7XG4gICAgICAgIHZhciBfID0gYTtcbiAgICAgICAgYSA9IGI7XG4gICAgICAgIGIgPSBfO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBhbGxFcXVhbCA9IHRydWU7XG4gICAgdmFyIGJTaXplID0gYi5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaykgIHtcbiAgICAgIGlmIChub3RBc3NvY2lhdGl2ZSA/ICFhLmhhcyh2KSA6XG4gICAgICAgICAgZmxpcHBlZCA/ICFpcyh2LCBhLmdldChrLCBOT1RfU0VUKSkgOiAhaXMoYS5nZXQoaywgTk9UX1NFVCksIHYpKSB7XG4gICAgICAgIGFsbEVxdWFsID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBhbGxFcXVhbCAmJiBhLnNpemUgPT09IGJTaXplO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoUmFuZ2UsIEluZGV4ZWRTZXEpO1xuXG4gICAgZnVuY3Rpb24gUmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCkge1xuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgICAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApO1xuICAgICAgfVxuICAgICAgaW52YXJpYW50KHN0ZXAgIT09IDAsICdDYW5ub3Qgc3RlcCBhIFJhbmdlIGJ5IDAnKTtcbiAgICAgIHN0YXJ0ID0gc3RhcnQgfHwgMDtcbiAgICAgIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBlbmQgPSBJbmZpbml0eTtcbiAgICAgIH1cbiAgICAgIHN0ZXAgPSBzdGVwID09PSB1bmRlZmluZWQgPyAxIDogTWF0aC5hYnMoc3RlcCk7XG4gICAgICBpZiAoZW5kIDwgc3RhcnQpIHtcbiAgICAgICAgc3RlcCA9IC1zdGVwO1xuICAgICAgfVxuICAgICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcbiAgICAgIHRoaXMuX2VuZCA9IGVuZDtcbiAgICAgIHRoaXMuX3N0ZXAgPSBzdGVwO1xuICAgICAgdGhpcy5zaXplID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKChlbmQgLSBzdGFydCkgLyBzdGVwIC0gMSkgKyAxKTtcbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgICAgaWYgKEVNUFRZX1JBTkdFKSB7XG4gICAgICAgICAgcmV0dXJuIEVNUFRZX1JBTkdFO1xuICAgICAgICB9XG4gICAgICAgIEVNUFRZX1JBTkdFID0gdGhpcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBSYW5nZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuICdSYW5nZSBbXSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ1JhbmdlIFsgJyArXG4gICAgICAgIHRoaXMuX3N0YXJ0ICsgJy4uLicgKyB0aGlzLl9lbmQgK1xuICAgICAgICAodGhpcy5fc3RlcCA+IDEgPyAnIGJ5ICcgKyB0aGlzLl9zdGVwIDogJycpICtcbiAgICAgICcgXSc7XG4gICAgfTtcblxuICAgIFJhbmdlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhcyhpbmRleCkgP1xuICAgICAgICB0aGlzLl9zdGFydCArIHdyYXBJbmRleCh0aGlzLCBpbmRleCkgKiB0aGlzLl9zdGVwIDpcbiAgICAgICAgbm90U2V0VmFsdWU7XG4gICAgfTtcblxuICAgIFJhbmdlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICB2YXIgcG9zc2libGVJbmRleCA9IChzZWFyY2hWYWx1ZSAtIHRoaXMuX3N0YXJ0KSAvIHRoaXMuX3N0ZXA7XG4gICAgICByZXR1cm4gcG9zc2libGVJbmRleCA+PSAwICYmXG4gICAgICAgIHBvc3NpYmxlSW5kZXggPCB0aGlzLnNpemUgJiZcbiAgICAgICAgcG9zc2libGVJbmRleCA9PT0gTWF0aC5mbG9vcihwb3NzaWJsZUluZGV4KTtcbiAgICB9O1xuXG4gICAgUmFuZ2UucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgaWYgKHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgdGhpcy5zaXplKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGJlZ2luID0gcmVzb2x2ZUJlZ2luKGJlZ2luLCB0aGlzLnNpemUpO1xuICAgICAgZW5kID0gcmVzb2x2ZUVuZChlbmQsIHRoaXMuc2l6ZSk7XG4gICAgICBpZiAoZW5kIDw9IGJlZ2luKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2UoMCwgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHRoaXMuZ2V0KGJlZ2luLCB0aGlzLl9lbmQpLCB0aGlzLmdldChlbmQsIHRoaXMuX2VuZCksIHRoaXMuX3N0ZXApO1xuICAgIH07XG5cbiAgICBSYW5nZS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICB2YXIgb2Zmc2V0VmFsdWUgPSBzZWFyY2hWYWx1ZSAtIHRoaXMuX3N0YXJ0O1xuICAgICAgaWYgKG9mZnNldFZhbHVlICUgdGhpcy5fc3RlcCA9PT0gMCkge1xuICAgICAgICB2YXIgaW5kZXggPSBvZmZzZXRWYWx1ZSAvIHRoaXMuX3N0ZXA7XG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5zaXplKSB7XG4gICAgICAgICAgcmV0dXJuIGluZGV4XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgUmFuZ2UucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmluZGV4T2Yoc2VhcmNoVmFsdWUpO1xuICAgIH07XG5cbiAgICBSYW5nZS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIHZhciBtYXhJbmRleCA9IHRoaXMuc2l6ZSAtIDE7XG4gICAgICB2YXIgc3RlcCA9IHRoaXMuX3N0ZXA7XG4gICAgICB2YXIgdmFsdWUgPSByZXZlcnNlID8gdGhpcy5fc3RhcnQgKyBtYXhJbmRleCAqIHN0ZXAgOiB0aGlzLl9zdGFydDtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPD0gbWF4SW5kZXg7IGlpKyspIHtcbiAgICAgICAgaWYgKGZuKHZhbHVlLCBpaSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGlpICsgMTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSArPSByZXZlcnNlID8gLXN0ZXAgOiBzdGVwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlpO1xuICAgIH07XG5cbiAgICBSYW5nZS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBtYXhJbmRleCA9IHRoaXMuc2l6ZSAtIDE7XG4gICAgICB2YXIgc3RlcCA9IHRoaXMuX3N0ZXA7XG4gICAgICB2YXIgdmFsdWUgPSByZXZlcnNlID8gdGhpcy5fc3RhcnQgKyBtYXhJbmRleCAqIHN0ZXAgOiB0aGlzLl9zdGFydDtcbiAgICAgIHZhciBpaSA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIHYgPSB2YWx1ZTtcbiAgICAgICAgdmFsdWUgKz0gcmV2ZXJzZSA/IC1zdGVwIDogc3RlcDtcbiAgICAgICAgcmV0dXJuIGlpID4gbWF4SW5kZXggPyBpdGVyYXRvckRvbmUoKSA6IGl0ZXJhdG9yVmFsdWUodHlwZSwgaWkrKywgdik7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgUmFuZ2UucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICByZXR1cm4gb3RoZXIgaW5zdGFuY2VvZiBSYW5nZSA/XG4gICAgICAgIHRoaXMuX3N0YXJ0ID09PSBvdGhlci5fc3RhcnQgJiZcbiAgICAgICAgdGhpcy5fZW5kID09PSBvdGhlci5fZW5kICYmXG4gICAgICAgIHRoaXMuX3N0ZXAgPT09IG90aGVyLl9zdGVwIDpcbiAgICAgICAgZGVlcEVxdWFsKHRoaXMsIG90aGVyKTtcbiAgICB9O1xuXG5cbiAgdmFyIEVNUFRZX1JBTkdFO1xuXG4gIGNyZWF0ZUNsYXNzKFJlcGVhdCwgSW5kZXhlZFNlcSk7XG5cbiAgICBmdW5jdGlvbiBSZXBlYXQodmFsdWUsIHRpbWVzKSB7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmVwZWF0KSkge1xuICAgICAgICByZXR1cm4gbmV3IFJlcGVhdCh2YWx1ZSwgdGltZXMpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuc2l6ZSA9IHRpbWVzID09PSB1bmRlZmluZWQgPyBJbmZpbml0eSA6IE1hdGgubWF4KDAsIHRpbWVzKTtcbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgICAgaWYgKEVNUFRZX1JFUEVBVCkge1xuICAgICAgICAgIHJldHVybiBFTVBUWV9SRVBFQVQ7XG4gICAgICAgIH1cbiAgICAgICAgRU1QVFlfUkVQRUFUID0gdGhpcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBSZXBlYXQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnUmVwZWF0IFtdJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAnUmVwZWF0IFsgJyArIHRoaXMuX3ZhbHVlICsgJyAnICsgdGhpcy5zaXplICsgJyB0aW1lcyBdJztcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhcyhpbmRleCkgPyB0aGlzLl92YWx1ZSA6IG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICBSZXBlYXQucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIHJldHVybiBpcyh0aGlzLl92YWx1ZSwgc2VhcmNoVmFsdWUpO1xuICAgIH07XG5cbiAgICBSZXBlYXQucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgICByZXR1cm4gd2hvbGVTbGljZShiZWdpbiwgZW5kLCBzaXplKSA/IHRoaXMgOlxuICAgICAgICBuZXcgUmVwZWF0KHRoaXMuX3ZhbHVlLCByZXNvbHZlRW5kKGVuZCwgc2l6ZSkgLSByZXNvbHZlQmVnaW4oYmVnaW4sIHNpemUpKTtcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5yZXZlcnNlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIGlmIChpcyh0aGlzLl92YWx1ZSwgc2VhcmNoVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICBSZXBlYXQucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIGlmIChpcyh0aGlzLl92YWx1ZSwgc2VhcmNoVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNpemU7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIFJlcGVhdC5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCB0aGlzLnNpemU7IGlpKyspIHtcbiAgICAgICAgaWYgKGZuKHRoaXMuX3ZhbHVlLCBpaSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGlpICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGlpO1xuICAgIH07XG5cbiAgICBSZXBlYXQucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICB2YXIgaWkgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpIFxuICAgICAgICB7cmV0dXJuIGlpIDwgdGhpcyQwLnNpemUgPyBpdGVyYXRvclZhbHVlKHR5cGUsIGlpKyssIHRoaXMkMC5fdmFsdWUpIDogaXRlcmF0b3JEb25lKCl9XG4gICAgICApO1xuICAgIH07XG5cbiAgICBSZXBlYXQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICByZXR1cm4gb3RoZXIgaW5zdGFuY2VvZiBSZXBlYXQgP1xuICAgICAgICBpcyh0aGlzLl92YWx1ZSwgb3RoZXIuX3ZhbHVlKSA6XG4gICAgICAgIGRlZXBFcXVhbChvdGhlcik7XG4gICAgfTtcblxuXG4gIHZhciBFTVBUWV9SRVBFQVQ7XG5cbiAgLyoqXG4gICAqIENvbnRyaWJ1dGVzIGFkZGl0aW9uYWwgbWV0aG9kcyB0byBhIGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBtaXhpbihjdG9yLCBtZXRob2RzKSB7XG4gICAgdmFyIGtleUNvcGllciA9IGZ1bmN0aW9uKGtleSApIHsgY3Rvci5wcm90b3R5cGVba2V5XSA9IG1ldGhvZHNba2V5XTsgfTtcbiAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKGtleUNvcGllcik7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyAmJlxuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhtZXRob2RzKS5mb3JFYWNoKGtleUNvcGllcik7XG4gICAgcmV0dXJuIGN0b3I7XG4gIH1cblxuICBJdGVyYWJsZS5JdGVyYXRvciA9IEl0ZXJhdG9yO1xuXG4gIG1peGluKEl0ZXJhYmxlLCB7XG5cbiAgICAvLyAjIyMgQ29udmVyc2lvbiB0byBvdGhlciB0eXBlc1xuXG4gICAgdG9BcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICBhc3NlcnROb3RJbmZpbml0ZSh0aGlzLnNpemUpO1xuICAgICAgdmFyIGFycmF5ID0gbmV3IEFycmF5KHRoaXMuc2l6ZSB8fCAwKTtcbiAgICAgIHRoaXMudmFsdWVTZXEoKS5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaSkgIHsgYXJyYXlbaV0gPSB2OyB9KTtcbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9LFxuXG4gICAgdG9JbmRleGVkU2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgVG9JbmRleGVkU2VxdWVuY2UodGhpcyk7XG4gICAgfSxcblxuICAgIHRvSlM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9TZXEoKS5tYXAoXG4gICAgICAgIGZ1bmN0aW9uKHZhbHVlICkge3JldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudG9KUyA9PT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnRvSlMoKSA6IHZhbHVlfVxuICAgICAgKS5fX3RvSlMoKTtcbiAgICB9LFxuXG4gICAgdG9KU09OOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvU2VxKCkubWFwKFxuICAgICAgICBmdW5jdGlvbih2YWx1ZSApIHtyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnRvSlNPTigpIDogdmFsdWV9XG4gICAgICApLl9fdG9KUygpO1xuICAgIH0sXG5cbiAgICB0b0tleWVkU2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgVG9LZXllZFNlcXVlbmNlKHRoaXMsIHRydWUpO1xuICAgIH0sXG5cbiAgICB0b01hcDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBVc2UgTGF0ZSBCaW5kaW5nIGhlcmUgdG8gc29sdmUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgICByZXR1cm4gTWFwKHRoaXMudG9LZXllZFNlcSgpKTtcbiAgICB9LFxuXG4gICAgdG9PYmplY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgYXNzZXJ0Tm90SW5maW5pdGUodGhpcy5zaXplKTtcbiAgICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICAgIHRoaXMuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGspICB7IG9iamVjdFtrXSA9IHY7IH0pO1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9LFxuXG4gICAgdG9PcmRlcmVkTWFwOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFVzZSBMYXRlIEJpbmRpbmcgaGVyZSB0byBzb2x2ZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICAgIHJldHVybiBPcmRlcmVkTWFwKHRoaXMudG9LZXllZFNlcSgpKTtcbiAgICB9LFxuXG4gICAgdG9PcmRlcmVkU2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFVzZSBMYXRlIEJpbmRpbmcgaGVyZSB0byBzb2x2ZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICAgIHJldHVybiBPcmRlcmVkU2V0KGlzS2V5ZWQodGhpcykgPyB0aGlzLnZhbHVlU2VxKCkgOiB0aGlzKTtcbiAgICB9LFxuXG4gICAgdG9TZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVXNlIExhdGUgQmluZGluZyBoZXJlIHRvIHNvbHZlIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5LlxuICAgICAgcmV0dXJuIFNldChpc0tleWVkKHRoaXMpID8gdGhpcy52YWx1ZVNlcSgpIDogdGhpcyk7XG4gICAgfSxcblxuICAgIHRvU2V0U2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgVG9TZXRTZXF1ZW5jZSh0aGlzKTtcbiAgICB9LFxuXG4gICAgdG9TZXE6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGlzSW5kZXhlZCh0aGlzKSA/IHRoaXMudG9JbmRleGVkU2VxKCkgOlxuICAgICAgICBpc0tleWVkKHRoaXMpID8gdGhpcy50b0tleWVkU2VxKCkgOlxuICAgICAgICB0aGlzLnRvU2V0U2VxKCk7XG4gICAgfSxcblxuICAgIHRvU3RhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVXNlIExhdGUgQmluZGluZyBoZXJlIHRvIHNvbHZlIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5LlxuICAgICAgcmV0dXJuIFN0YWNrKGlzS2V5ZWQodGhpcykgPyB0aGlzLnZhbHVlU2VxKCkgOiB0aGlzKTtcbiAgICB9LFxuXG4gICAgdG9MaXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFVzZSBMYXRlIEJpbmRpbmcgaGVyZSB0byBzb2x2ZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICAgIHJldHVybiBMaXN0KGlzS2V5ZWQodGhpcykgPyB0aGlzLnZhbHVlU2VxKCkgOiB0aGlzKTtcbiAgICB9LFxuXG5cbiAgICAvLyAjIyMgQ29tbW9uIEphdmFTY3JpcHQgbWV0aG9kcyBhbmQgcHJvcGVydGllc1xuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICdbSXRlcmFibGVdJztcbiAgICB9LFxuXG4gICAgX190b1N0cmluZzogZnVuY3Rpb24oaGVhZCwgdGFpbCkge1xuICAgICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gaGVhZCArIHRhaWw7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGVhZCArICcgJyArIHRoaXMudG9TZXEoKS5tYXAodGhpcy5fX3RvU3RyaW5nTWFwcGVyKS5qb2luKCcsICcpICsgJyAnICsgdGFpbDtcbiAgICB9LFxuXG5cbiAgICAvLyAjIyMgRVM2IENvbGxlY3Rpb24gbWV0aG9kcyAoRVM2IEFycmF5IGFuZCBNYXApXG5cbiAgICBjb25jYXQ6IGZ1bmN0aW9uKCkge3ZhciB2YWx1ZXMgPSBTTElDRSQwLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBjb25jYXRGYWN0b3J5KHRoaXMsIHZhbHVlcykpO1xuICAgIH0sXG5cbiAgICBjb250YWluczogZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnNvbWUoZnVuY3Rpb24odmFsdWUgKSB7cmV0dXJuIGlzKHZhbHVlLCBzZWFyY2hWYWx1ZSl9KTtcbiAgICB9LFxuXG4gICAgZW50cmllczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2l0ZXJhdG9yKElURVJBVEVfRU5UUklFUyk7XG4gICAgfSxcblxuICAgIGV2ZXJ5OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIGFzc2VydE5vdEluZmluaXRlKHRoaXMuc2l6ZSk7XG4gICAgICB2YXIgcmV0dXJuVmFsdWUgPSB0cnVlO1xuICAgICAgdGhpcy5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaywgYykgIHtcbiAgICAgICAgaWYgKCFwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrLCBjKSkge1xuICAgICAgICAgIHJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9LFxuXG4gICAgZmlsdGVyOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBmaWx0ZXJGYWN0b3J5KHRoaXMsIHByZWRpY2F0ZSwgY29udGV4dCwgdHJ1ZSkpO1xuICAgIH0sXG5cbiAgICBmaW5kOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQsIG5vdFNldFZhbHVlKSB7XG4gICAgICB2YXIgZW50cnkgPSB0aGlzLmZpbmRFbnRyeShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGVudHJ5ID8gZW50cnlbMV0gOiBub3RTZXRWYWx1ZTtcbiAgICB9LFxuXG4gICAgZmluZEVudHJ5OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHZhciBmb3VuZDtcbiAgICAgIHRoaXMuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGssIGMpICB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrLCBjKSkge1xuICAgICAgICAgIGZvdW5kID0gW2ssIHZdO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZm91bmQ7XG4gICAgfSxcblxuICAgIGZpbmRMYXN0RW50cnk6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9TZXEoKS5yZXZlcnNlKCkuZmluZEVudHJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKHNpZGVFZmZlY3QsIGNvbnRleHQpIHtcbiAgICAgIGFzc2VydE5vdEluZmluaXRlKHRoaXMuc2l6ZSk7XG4gICAgICByZXR1cm4gdGhpcy5fX2l0ZXJhdGUoY29udGV4dCA/IHNpZGVFZmZlY3QuYmluZChjb250ZXh0KSA6IHNpZGVFZmZlY3QpO1xuICAgIH0sXG5cbiAgICBqb2luOiBmdW5jdGlvbihzZXBhcmF0b3IpIHtcbiAgICAgIGFzc2VydE5vdEluZmluaXRlKHRoaXMuc2l6ZSk7XG4gICAgICBzZXBhcmF0b3IgPSBzZXBhcmF0b3IgIT09IHVuZGVmaW5lZCA/ICcnICsgc2VwYXJhdG9yIDogJywnO1xuICAgICAgdmFyIGpvaW5lZCA9ICcnO1xuICAgICAgdmFyIGlzRmlyc3QgPSB0cnVlO1xuICAgICAgdGhpcy5fX2l0ZXJhdGUoZnVuY3Rpb24odiApIHtcbiAgICAgICAgaXNGaXJzdCA/IChpc0ZpcnN0ID0gZmFsc2UpIDogKGpvaW5lZCArPSBzZXBhcmF0b3IpO1xuICAgICAgICBqb2luZWQgKz0gdiAhPT0gbnVsbCAmJiB2ICE9PSB1bmRlZmluZWQgPyB2IDogJyc7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBqb2luZWQ7XG4gICAgfSxcblxuICAgIGtleXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19pdGVyYXRvcihJVEVSQVRFX0tFWVMpO1xuICAgIH0sXG5cbiAgICBtYXA6IGZ1bmN0aW9uKG1hcHBlciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIG1hcEZhY3RvcnkodGhpcywgbWFwcGVyLCBjb250ZXh0KSk7XG4gICAgfSxcblxuICAgIHJlZHVjZTogZnVuY3Rpb24ocmVkdWNlciwgaW5pdGlhbFJlZHVjdGlvbiwgY29udGV4dCkge1xuICAgICAgYXNzZXJ0Tm90SW5maW5pdGUodGhpcy5zaXplKTtcbiAgICAgIHZhciByZWR1Y3Rpb247XG4gICAgICB2YXIgdXNlRmlyc3Q7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgdXNlRmlyc3QgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVkdWN0aW9uID0gaW5pdGlhbFJlZHVjdGlvbjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGssIGMpICB7XG4gICAgICAgIGlmICh1c2VGaXJzdCkge1xuICAgICAgICAgIHVzZUZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgcmVkdWN0aW9uID0gdjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWR1Y3Rpb24gPSByZWR1Y2VyLmNhbGwoY29udGV4dCwgcmVkdWN0aW9uLCB2LCBrLCBjKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVkdWN0aW9uO1xuICAgIH0sXG5cbiAgICByZWR1Y2VSaWdodDogZnVuY3Rpb24ocmVkdWNlciwgaW5pdGlhbFJlZHVjdGlvbiwgY29udGV4dCkge1xuICAgICAgdmFyIHJldmVyc2VkID0gdGhpcy50b0tleWVkU2VxKCkucmV2ZXJzZSgpO1xuICAgICAgcmV0dXJuIHJldmVyc2VkLnJlZHVjZS5hcHBseShyZXZlcnNlZCwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgcmV2ZXJzZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgcmV2ZXJzZUZhY3RvcnkodGhpcywgdHJ1ZSkpO1xuICAgIH0sXG5cbiAgICBzbGljZTogZnVuY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHNsaWNlRmFjdG9yeSh0aGlzLCBiZWdpbiwgZW5kLCB0cnVlKSk7XG4gICAgfSxcblxuICAgIHNvbWU6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcmV0dXJuICF0aGlzLmV2ZXJ5KG5vdChwcmVkaWNhdGUpLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgc29ydDogZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHNvcnRGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IpKTtcbiAgICB9LFxuXG4gICAgdmFsdWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9faXRlcmF0b3IoSVRFUkFURV9WQUxVRVMpO1xuICAgIH0sXG5cblxuICAgIC8vICMjIyBNb3JlIHNlcXVlbnRpYWwgbWV0aG9kc1xuXG4gICAgYnV0TGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zbGljZSgwLCAtMSk7XG4gICAgfSxcblxuICAgIGlzRW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2l6ZSAhPT0gdW5kZWZpbmVkID8gdGhpcy5zaXplID09PSAwIDogIXRoaXMuc29tZShmdW5jdGlvbigpICB7cmV0dXJuIHRydWV9KTtcbiAgICB9LFxuXG4gICAgY291bnQ6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGVuc3VyZVNpemUoXG4gICAgICAgIHByZWRpY2F0ZSA/IHRoaXMudG9TZXEoKS5maWx0ZXIocHJlZGljYXRlLCBjb250ZXh0KSA6IHRoaXNcbiAgICAgICk7XG4gICAgfSxcblxuICAgIGNvdW50Qnk6IGZ1bmN0aW9uKGdyb3VwZXIsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBjb3VudEJ5RmFjdG9yeSh0aGlzLCBncm91cGVyLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgZXF1YWxzOiBmdW5jdGlvbihvdGhlcikge1xuICAgICAgcmV0dXJuIGRlZXBFcXVhbCh0aGlzLCBvdGhlcik7XG4gICAgfSxcblxuICAgIGVudHJ5U2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpdGVyYWJsZSA9IHRoaXM7XG4gICAgICBpZiAoaXRlcmFibGUuX2NhY2hlKSB7XG4gICAgICAgIC8vIFdlIGNhY2hlIGFzIGFuIGVudHJpZXMgYXJyYXksIHNvIHdlIGNhbiBqdXN0IHJldHVybiB0aGUgY2FjaGUhXG4gICAgICAgIHJldHVybiBuZXcgQXJyYXlTZXEoaXRlcmFibGUuX2NhY2hlKTtcbiAgICAgIH1cbiAgICAgIHZhciBlbnRyaWVzU2VxdWVuY2UgPSBpdGVyYWJsZS50b1NlcSgpLm1hcChlbnRyeU1hcHBlcikudG9JbmRleGVkU2VxKCk7XG4gICAgICBlbnRyaWVzU2VxdWVuY2UuZnJvbUVudHJ5U2VxID0gZnVuY3Rpb24oKSAge3JldHVybiBpdGVyYWJsZS50b1NlcSgpfTtcbiAgICAgIHJldHVybiBlbnRyaWVzU2VxdWVuY2U7XG4gICAgfSxcblxuICAgIGZpbHRlck5vdDogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5maWx0ZXIobm90KHByZWRpY2F0ZSksIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBmaW5kTGFzdDogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0LCBub3RTZXRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMudG9LZXllZFNlcSgpLnJldmVyc2UoKS5maW5kKHByZWRpY2F0ZSwgY29udGV4dCwgbm90U2V0VmFsdWUpO1xuICAgIH0sXG5cbiAgICBmaXJzdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5maW5kKHJldHVyblRydWUpO1xuICAgIH0sXG5cbiAgICBmbGF0TWFwOiBmdW5jdGlvbihtYXBwZXIsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBmbGF0TWFwRmFjdG9yeSh0aGlzLCBtYXBwZXIsIGNvbnRleHQpKTtcbiAgICB9LFxuXG4gICAgZmxhdHRlbjogZnVuY3Rpb24oZGVwdGgpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBmbGF0dGVuRmFjdG9yeSh0aGlzLCBkZXB0aCwgdHJ1ZSkpO1xuICAgIH0sXG5cbiAgICBmcm9tRW50cnlTZXE6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBGcm9tRW50cmllc1NlcXVlbmNlKHRoaXMpO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uKHNlYXJjaEtleSwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmQoZnVuY3Rpb24oXywga2V5KSAge3JldHVybiBpcyhrZXksIHNlYXJjaEtleSl9LCB1bmRlZmluZWQsIG5vdFNldFZhbHVlKTtcbiAgICB9LFxuXG4gICAgZ2V0SW46IGZ1bmN0aW9uKHNlYXJjaEtleVBhdGgsIG5vdFNldFZhbHVlKSB7XG4gICAgICB2YXIgbmVzdGVkID0gdGhpcztcbiAgICAgIC8vIE5vdGU6IGluIGFuIEVTNiBlbnZpcm9ubWVudCwgd2Ugd291bGQgcHJlZmVyOlxuICAgICAgLy8gZm9yICh2YXIga2V5IG9mIHNlYXJjaEtleVBhdGgpIHtcbiAgICAgIHZhciBpdGVyID0gZm9yY2VJdGVyYXRvcihzZWFyY2hLZXlQYXRoKTtcbiAgICAgIHZhciBzdGVwO1xuICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXIubmV4dCgpKS5kb25lKSB7XG4gICAgICAgIHZhciBrZXkgPSBzdGVwLnZhbHVlO1xuICAgICAgICBuZXN0ZWQgPSBuZXN0ZWQgJiYgbmVzdGVkLmdldCA/IG5lc3RlZC5nZXQoa2V5LCBOT1RfU0VUKSA6IE5PVF9TRVQ7XG4gICAgICAgIGlmIChuZXN0ZWQgPT09IE5PVF9TRVQpIHtcbiAgICAgICAgICByZXR1cm4gbm90U2V0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXN0ZWQ7XG4gICAgfSxcblxuICAgIGdyb3VwQnk6IGZ1bmN0aW9uKGdyb3VwZXIsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBncm91cEJ5RmFjdG9yeSh0aGlzLCBncm91cGVyLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgaGFzOiBmdW5jdGlvbihzZWFyY2hLZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldChzZWFyY2hLZXksIE5PVF9TRVQpICE9PSBOT1RfU0VUO1xuICAgIH0sXG5cbiAgICBoYXNJbjogZnVuY3Rpb24oc2VhcmNoS2V5UGF0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0SW4oc2VhcmNoS2V5UGF0aCwgTk9UX1NFVCkgIT09IE5PVF9TRVQ7XG4gICAgfSxcblxuICAgIGlzU3Vic2V0OiBmdW5jdGlvbihpdGVyKSB7XG4gICAgICBpdGVyID0gdHlwZW9mIGl0ZXIuY29udGFpbnMgPT09ICdmdW5jdGlvbicgPyBpdGVyIDogSXRlcmFibGUoaXRlcik7XG4gICAgICByZXR1cm4gdGhpcy5ldmVyeShmdW5jdGlvbih2YWx1ZSApIHtyZXR1cm4gaXRlci5jb250YWlucyh2YWx1ZSl9KTtcbiAgICB9LFxuXG4gICAgaXNTdXBlcnNldDogZnVuY3Rpb24oaXRlcikge1xuICAgICAgcmV0dXJuIGl0ZXIuaXNTdWJzZXQodGhpcyk7XG4gICAgfSxcblxuICAgIGtleVNlcTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1NlcSgpLm1hcChrZXlNYXBwZXIpLnRvSW5kZXhlZFNlcSgpO1xuICAgIH0sXG5cbiAgICBsYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvU2VxKCkucmV2ZXJzZSgpLmZpcnN0KCk7XG4gICAgfSxcblxuICAgIG1heDogZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgcmV0dXJuIG1heEZhY3RvcnkodGhpcywgY29tcGFyYXRvcik7XG4gICAgfSxcblxuICAgIG1heEJ5OiBmdW5jdGlvbihtYXBwZXIsIGNvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiBtYXhGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IsIG1hcHBlcik7XG4gICAgfSxcblxuICAgIG1pbjogZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgcmV0dXJuIG1heEZhY3RvcnkodGhpcywgY29tcGFyYXRvciA/IG5lZyhjb21wYXJhdG9yKSA6IGRlZmF1bHROZWdDb21wYXJhdG9yKTtcbiAgICB9LFxuXG4gICAgbWluQnk6IGZ1bmN0aW9uKG1hcHBlciwgY29tcGFyYXRvcikge1xuICAgICAgcmV0dXJuIG1heEZhY3RvcnkodGhpcywgY29tcGFyYXRvciA/IG5lZyhjb21wYXJhdG9yKSA6IGRlZmF1bHROZWdDb21wYXJhdG9yLCBtYXBwZXIpO1xuICAgIH0sXG5cbiAgICByZXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNsaWNlKDEpO1xuICAgIH0sXG5cbiAgICBza2lwOiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnNsaWNlKE1hdGgubWF4KDAsIGFtb3VudCkpO1xuICAgIH0sXG5cbiAgICBza2lwTGFzdDogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgdGhpcy50b1NlcSgpLnJldmVyc2UoKS5za2lwKGFtb3VudCkucmV2ZXJzZSgpKTtcbiAgICB9LFxuXG4gICAgc2tpcFdoaWxlOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBza2lwV2hpbGVGYWN0b3J5KHRoaXMsIHByZWRpY2F0ZSwgY29udGV4dCwgdHJ1ZSkpO1xuICAgIH0sXG5cbiAgICBza2lwVW50aWw6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2tpcFdoaWxlKG5vdChwcmVkaWNhdGUpLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgc29ydEJ5OiBmdW5jdGlvbihtYXBwZXIsIGNvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBzb3J0RmFjdG9yeSh0aGlzLCBjb21wYXJhdG9yLCBtYXBwZXIpKTtcbiAgICB9LFxuXG4gICAgdGFrZTogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5zbGljZSgwLCBNYXRoLm1heCgwLCBhbW91bnQpKTtcbiAgICB9LFxuXG4gICAgdGFrZUxhc3Q6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHRoaXMudG9TZXEoKS5yZXZlcnNlKCkudGFrZShhbW91bnQpLnJldmVyc2UoKSk7XG4gICAgfSxcblxuICAgIHRha2VXaGlsZTogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgdGFrZVdoaWxlRmFjdG9yeSh0aGlzLCBwcmVkaWNhdGUsIGNvbnRleHQpKTtcbiAgICB9LFxuXG4gICAgdGFrZVVudGlsOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRha2VXaGlsZShub3QocHJlZGljYXRlKSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHZhbHVlU2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvSW5kZXhlZFNlcSgpO1xuICAgIH0sXG5cblxuICAgIC8vICMjIyBIYXNoYWJsZSBPYmplY3RcblxuICAgIGhhc2hDb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9faGFzaCB8fCAodGhpcy5fX2hhc2ggPSBoYXNoSXRlcmFibGUodGhpcykpO1xuICAgIH0sXG5cblxuICAgIC8vICMjIyBJbnRlcm5hbFxuXG4gICAgLy8gYWJzdHJhY3QgX19pdGVyYXRlKGZuLCByZXZlcnNlKVxuXG4gICAgLy8gYWJzdHJhY3QgX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKVxuICB9KTtcblxuICAvLyB2YXIgSVNfSVRFUkFCTEVfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9JVEVSQUJMRV9fQEAnO1xuICAvLyB2YXIgSVNfS0VZRURfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9LRVlFRF9fQEAnO1xuICAvLyB2YXIgSVNfSU5ERVhFRF9TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX0lOREVYRURfX0BAJztcbiAgLy8gdmFyIElTX09SREVSRURfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9PUkRFUkVEX19AQCc7XG5cbiAgdmFyIEl0ZXJhYmxlUHJvdG90eXBlID0gSXRlcmFibGUucHJvdG90eXBlO1xuICBJdGVyYWJsZVByb3RvdHlwZVtJU19JVEVSQUJMRV9TRU5USU5FTF0gPSB0cnVlO1xuICBJdGVyYWJsZVByb3RvdHlwZVtJVEVSQVRPUl9TWU1CT0xdID0gSXRlcmFibGVQcm90b3R5cGUudmFsdWVzO1xuICBJdGVyYWJsZVByb3RvdHlwZS5fX3RvSlMgPSBJdGVyYWJsZVByb3RvdHlwZS50b0FycmF5O1xuICBJdGVyYWJsZVByb3RvdHlwZS5fX3RvU3RyaW5nTWFwcGVyID0gcXVvdGVTdHJpbmc7XG4gIEl0ZXJhYmxlUHJvdG90eXBlLmluc3BlY3QgPVxuICBJdGVyYWJsZVByb3RvdHlwZS50b1NvdXJjZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy50b1N0cmluZygpOyB9O1xuICBJdGVyYWJsZVByb3RvdHlwZS5jaGFpbiA9IEl0ZXJhYmxlUHJvdG90eXBlLmZsYXRNYXA7XG5cbiAgLy8gVGVtcG9yYXJ5IHdhcm5pbmcgYWJvdXQgdXNpbmcgbGVuZ3RoXG4gIChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShJdGVyYWJsZVByb3RvdHlwZSwgJ2xlbmd0aCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCFJdGVyYWJsZS5ub0xlbmd0aFdhcm5pbmcpIHtcbiAgICAgICAgICAgIHZhciBzdGFjaztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGFjay5pbmRleE9mKCdfd3JhcE9iamVjdCcpID09PSAtMSkge1xuICAgICAgICAgICAgICBjb25zb2xlICYmIGNvbnNvbGUud2FybiAmJiBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgJ2l0ZXJhYmxlLmxlbmd0aCBoYXMgYmVlbiBkZXByZWNhdGVkLCAnK1xuICAgICAgICAgICAgICAgICd1c2UgaXRlcmFibGUuc2l6ZSBvciBpdGVyYWJsZS5jb3VudCgpLiAnK1xuICAgICAgICAgICAgICAgICdUaGlzIHdhcm5pbmcgd2lsbCBiZWNvbWUgYSBzaWxlbnQgZXJyb3IgaW4gYSBmdXR1cmUgdmVyc2lvbi4gJyArXG4gICAgICAgICAgICAgICAgc3RhY2tcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH0pKCk7XG5cblxuXG4gIG1peGluKEtleWVkSXRlcmFibGUsIHtcblxuICAgIC8vICMjIyBNb3JlIHNlcXVlbnRpYWwgbWV0aG9kc1xuXG4gICAgZmxpcDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgZmxpcEZhY3RvcnkodGhpcykpO1xuICAgIH0sXG5cbiAgICBmaW5kS2V5OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHZhciBlbnRyeSA9IHRoaXMuZmluZEVudHJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICByZXR1cm4gZW50cnkgJiYgZW50cnlbMF07XG4gICAgfSxcblxuICAgIGZpbmRMYXN0S2V5OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvU2VxKCkucmV2ZXJzZSgpLmZpbmRLZXkocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAga2V5T2Y6IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5maW5kS2V5KGZ1bmN0aW9uKHZhbHVlICkge3JldHVybiBpcyh2YWx1ZSwgc2VhcmNoVmFsdWUpfSk7XG4gICAgfSxcblxuICAgIGxhc3RLZXlPZjogZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmRMYXN0S2V5KGZ1bmN0aW9uKHZhbHVlICkge3JldHVybiBpcyh2YWx1ZSwgc2VhcmNoVmFsdWUpfSk7XG4gICAgfSxcblxuICAgIG1hcEVudHJpZXM6IGZ1bmN0aW9uKG1hcHBlciwgY29udGV4dCkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsXG4gICAgICAgIHRoaXMudG9TZXEoKS5tYXAoXG4gICAgICAgICAgZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gbWFwcGVyLmNhbGwoY29udGV4dCwgW2ssIHZdLCBpdGVyYXRpb25zKyssIHRoaXMkMCl9XG4gICAgICAgICkuZnJvbUVudHJ5U2VxKClcbiAgICAgICk7XG4gICAgfSxcblxuICAgIG1hcEtleXM6IGZ1bmN0aW9uKG1hcHBlciwgY29udGV4dCkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsXG4gICAgICAgIHRoaXMudG9TZXEoKS5mbGlwKCkubWFwKFxuICAgICAgICAgIGZ1bmN0aW9uKGssIHYpICB7cmV0dXJuIG1hcHBlci5jYWxsKGNvbnRleHQsIGssIHYsIHRoaXMkMCl9XG4gICAgICAgICkuZmxpcCgpXG4gICAgICApO1xuICAgIH0sXG5cbiAgfSk7XG5cbiAgdmFyIEtleWVkSXRlcmFibGVQcm90b3R5cGUgPSBLZXllZEl0ZXJhYmxlLnByb3RvdHlwZTtcbiAgS2V5ZWRJdGVyYWJsZVByb3RvdHlwZVtJU19LRVlFRF9TRU5USU5FTF0gPSB0cnVlO1xuICBLZXllZEl0ZXJhYmxlUHJvdG90eXBlW0lURVJBVE9SX1NZTUJPTF0gPSBJdGVyYWJsZVByb3RvdHlwZS5lbnRyaWVzO1xuICBLZXllZEl0ZXJhYmxlUHJvdG90eXBlLl9fdG9KUyA9IEl0ZXJhYmxlUHJvdG90eXBlLnRvT2JqZWN0O1xuICBLZXllZEl0ZXJhYmxlUHJvdG90eXBlLl9fdG9TdHJpbmdNYXBwZXIgPSBmdW5jdGlvbih2LCBrKSAge3JldHVybiBrICsgJzogJyArIHF1b3RlU3RyaW5nKHYpfTtcblxuXG5cbiAgbWl4aW4oSW5kZXhlZEl0ZXJhYmxlLCB7XG5cbiAgICAvLyAjIyMgQ29udmVyc2lvbiB0byBvdGhlciB0eXBlc1xuXG4gICAgdG9LZXllZFNlcTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IFRvS2V5ZWRTZXF1ZW5jZSh0aGlzLCBmYWxzZSk7XG4gICAgfSxcblxuXG4gICAgLy8gIyMjIEVTNiBDb2xsZWN0aW9uIG1ldGhvZHMgKEVTNiBBcnJheSBhbmQgTWFwKVxuXG4gICAgZmlsdGVyOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBmaWx0ZXJGYWN0b3J5KHRoaXMsIHByZWRpY2F0ZSwgY29udGV4dCwgZmFsc2UpKTtcbiAgICB9LFxuXG4gICAgZmluZEluZGV4OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHZhciBlbnRyeSA9IHRoaXMuZmluZEVudHJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICByZXR1cm4gZW50cnkgPyBlbnRyeVswXSA6IC0xO1xuICAgIH0sXG5cbiAgICBpbmRleE9mOiBmdW5jdGlvbihzZWFyY2hWYWx1ZSkge1xuICAgICAgdmFyIGtleSA9IHRoaXMudG9LZXllZFNlcSgpLmtleU9mKHNlYXJjaFZhbHVlKTtcbiAgICAgIHJldHVybiBrZXkgPT09IHVuZGVmaW5lZCA/IC0xIDoga2V5O1xuICAgIH0sXG5cbiAgICBsYXN0SW5kZXhPZjogZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvU2VxKCkucmV2ZXJzZSgpLmluZGV4T2Yoc2VhcmNoVmFsdWUpO1xuICAgIH0sXG5cbiAgICByZXZlcnNlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCByZXZlcnNlRmFjdG9yeSh0aGlzLCBmYWxzZSkpO1xuICAgIH0sXG5cbiAgICBzbGljZTogZnVuY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHNsaWNlRmFjdG9yeSh0aGlzLCBiZWdpbiwgZW5kLCBmYWxzZSkpO1xuICAgIH0sXG5cbiAgICBzcGxpY2U6IGZ1bmN0aW9uKGluZGV4LCByZW1vdmVOdW0gLyosIC4uLnZhbHVlcyovKSB7XG4gICAgICB2YXIgbnVtQXJncyA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICByZW1vdmVOdW0gPSBNYXRoLm1heChyZW1vdmVOdW0gfCAwLCAwKTtcbiAgICAgIGlmIChudW1BcmdzID09PSAwIHx8IChudW1BcmdzID09PSAyICYmICFyZW1vdmVOdW0pKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaW5kZXggPSByZXNvbHZlQmVnaW4oaW5kZXgsIHRoaXMuc2l6ZSk7XG4gICAgICB2YXIgc3BsaWNlZCA9IHRoaXMuc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgcmV0dXJuIHJlaWZ5KFxuICAgICAgICB0aGlzLFxuICAgICAgICBudW1BcmdzID09PSAxID9cbiAgICAgICAgICBzcGxpY2VkIDpcbiAgICAgICAgICBzcGxpY2VkLmNvbmNhdChhcnJDb3B5KGFyZ3VtZW50cywgMiksIHRoaXMuc2xpY2UoaW5kZXggKyByZW1vdmVOdW0pKVxuICAgICAgKTtcbiAgICB9LFxuXG5cbiAgICAvLyAjIyMgTW9yZSBjb2xsZWN0aW9uIG1ldGhvZHNcblxuICAgIGZpbmRMYXN0SW5kZXg6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgdmFyIGtleSA9IHRoaXMudG9LZXllZFNlcSgpLmZpbmRMYXN0S2V5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICByZXR1cm4ga2V5ID09PSB1bmRlZmluZWQgPyAtMSA6IGtleTtcbiAgICB9LFxuXG4gICAgZmlyc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KDApO1xuICAgIH0sXG5cbiAgICBmbGF0dGVuOiBmdW5jdGlvbihkZXB0aCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIGZsYXR0ZW5GYWN0b3J5KHRoaXMsIGRlcHRoLCBmYWxzZSkpO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uKGluZGV4LCBub3RTZXRWYWx1ZSkge1xuICAgICAgaW5kZXggPSB3cmFwSW5kZXgodGhpcywgaW5kZXgpO1xuICAgICAgcmV0dXJuIChpbmRleCA8IDAgfHwgKHRoaXMuc2l6ZSA9PT0gSW5maW5pdHkgfHxcbiAgICAgICAgICAodGhpcy5zaXplICE9PSB1bmRlZmluZWQgJiYgaW5kZXggPiB0aGlzLnNpemUpKSkgP1xuICAgICAgICBub3RTZXRWYWx1ZSA6XG4gICAgICAgIHRoaXMuZmluZChmdW5jdGlvbihfLCBrZXkpICB7cmV0dXJuIGtleSA9PT0gaW5kZXh9LCB1bmRlZmluZWQsIG5vdFNldFZhbHVlKTtcbiAgICB9LFxuXG4gICAgaGFzOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgaW5kZXggPSB3cmFwSW5kZXgodGhpcywgaW5kZXgpO1xuICAgICAgcmV0dXJuIGluZGV4ID49IDAgJiYgKHRoaXMuc2l6ZSAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgdGhpcy5zaXplID09PSBJbmZpbml0eSB8fCBpbmRleCA8IHRoaXMuc2l6ZSA6XG4gICAgICAgIHRoaXMuaW5kZXhPZihpbmRleCkgIT09IC0xXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBpbnRlcnBvc2U6IGZ1bmN0aW9uKHNlcGFyYXRvcikge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIGludGVycG9zZUZhY3RvcnkodGhpcywgc2VwYXJhdG9yKSk7XG4gICAgfSxcblxuICAgIGludGVybGVhdmU6IGZ1bmN0aW9uKC8qLi4uaXRlcmFibGVzKi8pIHtcbiAgICAgIHZhciBpdGVyYWJsZXMgPSBbdGhpc10uY29uY2F0KGFyckNvcHkoYXJndW1lbnRzKSk7XG4gICAgICB2YXIgemlwcGVkID0gemlwV2l0aEZhY3RvcnkodGhpcy50b1NlcSgpLCBJbmRleGVkU2VxLm9mLCBpdGVyYWJsZXMpO1xuICAgICAgdmFyIGludGVybGVhdmVkID0gemlwcGVkLmZsYXR0ZW4odHJ1ZSk7XG4gICAgICBpZiAoemlwcGVkLnNpemUpIHtcbiAgICAgICAgaW50ZXJsZWF2ZWQuc2l6ZSA9IHppcHBlZC5zaXplICogaXRlcmFibGVzLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBpbnRlcmxlYXZlZCk7XG4gICAgfSxcblxuICAgIGxhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KC0xKTtcbiAgICB9LFxuXG4gICAgc2tpcFdoaWxlOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBza2lwV2hpbGVGYWN0b3J5KHRoaXMsIHByZWRpY2F0ZSwgY29udGV4dCwgZmFsc2UpKTtcbiAgICB9LFxuXG4gICAgemlwOiBmdW5jdGlvbigvKiwgLi4uaXRlcmFibGVzICovKSB7XG4gICAgICB2YXIgaXRlcmFibGVzID0gW3RoaXNdLmNvbmNhdChhcnJDb3B5KGFyZ3VtZW50cykpO1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHppcFdpdGhGYWN0b3J5KHRoaXMsIGRlZmF1bHRaaXBwZXIsIGl0ZXJhYmxlcykpO1xuICAgIH0sXG5cbiAgICB6aXBXaXRoOiBmdW5jdGlvbih6aXBwZXIvKiwgLi4uaXRlcmFibGVzICovKSB7XG4gICAgICB2YXIgaXRlcmFibGVzID0gYXJyQ29weShhcmd1bWVudHMpO1xuICAgICAgaXRlcmFibGVzWzBdID0gdGhpcztcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCB6aXBXaXRoRmFjdG9yeSh0aGlzLCB6aXBwZXIsIGl0ZXJhYmxlcykpO1xuICAgIH0sXG5cbiAgfSk7XG5cbiAgSW5kZXhlZEl0ZXJhYmxlLnByb3RvdHlwZVtJU19JTkRFWEVEX1NFTlRJTkVMXSA9IHRydWU7XG4gIEluZGV4ZWRJdGVyYWJsZS5wcm90b3R5cGVbSVNfT1JERVJFRF9TRU5USU5FTF0gPSB0cnVlO1xuXG5cblxuICBtaXhpbihTZXRJdGVyYWJsZSwge1xuXG4gICAgLy8gIyMjIEVTNiBDb2xsZWN0aW9uIG1ldGhvZHMgKEVTNiBBcnJheSBhbmQgTWFwKVxuXG4gICAgZ2V0OiBmdW5jdGlvbih2YWx1ZSwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhcyh2YWx1ZSkgPyB2YWx1ZSA6IG5vdFNldFZhbHVlO1xuICAgIH0sXG5cbiAgICBjb250YWluczogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmhhcyh2YWx1ZSk7XG4gICAgfSxcblxuXG4gICAgLy8gIyMjIE1vcmUgc2VxdWVudGlhbCBtZXRob2RzXG5cbiAgICBrZXlTZXE6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVTZXEoKTtcbiAgICB9LFxuXG4gIH0pO1xuXG4gIFNldEl0ZXJhYmxlLnByb3RvdHlwZS5oYXMgPSBJdGVyYWJsZVByb3RvdHlwZS5jb250YWlucztcblxuXG4gIC8vIE1peGluIHN1YmNsYXNzZXNcblxuICBtaXhpbihLZXllZFNlcSwgS2V5ZWRJdGVyYWJsZS5wcm90b3R5cGUpO1xuICBtaXhpbihJbmRleGVkU2VxLCBJbmRleGVkSXRlcmFibGUucHJvdG90eXBlKTtcbiAgbWl4aW4oU2V0U2VxLCBTZXRJdGVyYWJsZS5wcm90b3R5cGUpO1xuXG4gIG1peGluKEtleWVkQ29sbGVjdGlvbiwgS2V5ZWRJdGVyYWJsZS5wcm90b3R5cGUpO1xuICBtaXhpbihJbmRleGVkQ29sbGVjdGlvbiwgSW5kZXhlZEl0ZXJhYmxlLnByb3RvdHlwZSk7XG4gIG1peGluKFNldENvbGxlY3Rpb24sIFNldEl0ZXJhYmxlLnByb3RvdHlwZSk7XG5cblxuICAvLyAjcHJhZ21hIEhlbHBlciBmdW5jdGlvbnNcblxuICBmdW5jdGlvbiBrZXlNYXBwZXIodiwgaykge1xuICAgIHJldHVybiBrO1xuICB9XG5cbiAgZnVuY3Rpb24gZW50cnlNYXBwZXIodiwgaykge1xuICAgIHJldHVybiBbaywgdl07XG4gIH1cblxuICBmdW5jdGlvbiBub3QocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBuZWcocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIC1wcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBxdW90ZVN0cmluZyh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpIDogdmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiBkZWZhdWx0WmlwcGVyKCkge1xuICAgIHJldHVybiBhcnJDb3B5KGFyZ3VtZW50cyk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWZhdWx0TmVnQ29tcGFyYXRvcihhLCBiKSB7XG4gICAgcmV0dXJuIGEgPCBiID8gMSA6IGEgPiBiID8gLTEgOiAwO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzaEl0ZXJhYmxlKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlLnNpemUgPT09IEluZmluaXR5KSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgdmFyIG9yZGVyZWQgPSBpc09yZGVyZWQoaXRlcmFibGUpO1xuICAgIHZhciBrZXllZCA9IGlzS2V5ZWQoaXRlcmFibGUpO1xuICAgIHZhciBoID0gb3JkZXJlZCA/IDEgOiAwO1xuICAgIHZhciBzaXplID0gaXRlcmFibGUuX19pdGVyYXRlKFxuICAgICAga2V5ZWQgP1xuICAgICAgICBvcmRlcmVkID9cbiAgICAgICAgICBmdW5jdGlvbih2LCBrKSAgeyBoID0gMzEgKiBoICsgaGFzaE1lcmdlKGhhc2godiksIGhhc2goaykpIHwgMDsgfSA6XG4gICAgICAgICAgZnVuY3Rpb24odiwgaykgIHsgaCA9IGggKyBoYXNoTWVyZ2UoaGFzaCh2KSwgaGFzaChrKSkgfCAwOyB9IDpcbiAgICAgICAgb3JkZXJlZCA/XG4gICAgICAgICAgZnVuY3Rpb24odiApIHsgaCA9IDMxICogaCArIGhhc2godikgfCAwOyB9IDpcbiAgICAgICAgICBmdW5jdGlvbih2ICkgeyBoID0gaCArIGhhc2godikgfCAwOyB9XG4gICAgKTtcbiAgICByZXR1cm4gbXVybXVySGFzaE9mU2l6ZShzaXplLCBoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG11cm11ckhhc2hPZlNpemUoc2l6ZSwgaCkge1xuICAgIGggPSBNYXRoX19pbXVsKGgsIDB4Q0M5RTJENTEpO1xuICAgIGggPSBNYXRoX19pbXVsKGggPDwgMTUgfCBoID4+PiAtMTUsIDB4MUI4NzM1OTMpO1xuICAgIGggPSBNYXRoX19pbXVsKGggPDwgMTMgfCBoID4+PiAtMTMsIDUpO1xuICAgIGggPSAoaCArIDB4RTY1NDZCNjQgfCAwKSBeIHNpemU7XG4gICAgaCA9IE1hdGhfX2ltdWwoaCBeIGggPj4+IDE2LCAweDg1RUJDQTZCKTtcbiAgICBoID0gTWF0aF9faW11bChoIF4gaCA+Pj4gMTMsIDB4QzJCMkFFMzUpO1xuICAgIGggPSBzbWkoaCBeIGggPj4+IDE2KTtcbiAgICByZXR1cm4gaDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc2hNZXJnZShhLCBiKSB7XG4gICAgcmV0dXJuIGEgXiBiICsgMHg5RTM3NzlCOSArIChhIDw8IDYpICsgKGEgPj4gMikgfCAwOyAvLyBpbnRcbiAgfVxuXG4gIHZhciBJbW11dGFibGUgPSB7XG5cbiAgICBJdGVyYWJsZTogSXRlcmFibGUsXG5cbiAgICBTZXE6IFNlcSxcbiAgICBDb2xsZWN0aW9uOiBDb2xsZWN0aW9uLFxuICAgIE1hcDogTWFwLFxuICAgIE9yZGVyZWRNYXA6IE9yZGVyZWRNYXAsXG4gICAgTGlzdDogTGlzdCxcbiAgICBTdGFjazogU3RhY2ssXG4gICAgU2V0OiBTZXQsXG4gICAgT3JkZXJlZFNldDogT3JkZXJlZFNldCxcblxuICAgIFJlY29yZDogUmVjb3JkLFxuICAgIFJhbmdlOiBSYW5nZSxcbiAgICBSZXBlYXQ6IFJlcGVhdCxcblxuICAgIGlzOiBpcyxcbiAgICBmcm9tSlM6IGZyb21KUyxcblxuICB9O1xuXG4gIHJldHVybiBJbW11dGFibGU7XG5cbn0pKTsiLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgdGhpcy50ZXh0ID0gdGhpcy54aHIucmVzcG9uc2VUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiBzdHIubGVuZ3RoXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cyB8fCAxMjIzID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHRyeSB7XG4gICAgICB2YXIgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgICAgaWYgKCdIRUFEJyA9PSBtZXRob2QpIHJlcy50ZXh0ID0gbnVsbDtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChmaWVsZCwgZmlsZSwgZmlsZW5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAsIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gcXVlcnlzdHJpbmdcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtdWx0aXBsZSBkYXRhIFwid3JpdGVzXCJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLnNlbmQoeyBzZWFyY2g6ICdxdWVyeScgfSlcbiAqICAgICAgICAgLnNlbmQoeyByYW5nZTogJzEuLjUnIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgb3JkZXI6ICdkZXNjJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAgKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAgKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSl7XG4gIHZhciBvYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKG9iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmopIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICBpZiAoMiA9PSBmbi5sZW5ndGgpIHJldHVybiBmbihlcnIsIHJlcyk7XG4gIGlmIChlcnIpIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgZm4ocmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ09yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcigndGltZW91dCBvZiAnICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuICAgIGlmICgwID09IHhoci5zdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLmFib3J0ZWQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIGlmICh4aHIudXBsb2FkKSB7XG4gICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiXX0=
