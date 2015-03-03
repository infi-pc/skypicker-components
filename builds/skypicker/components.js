(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./exports/skypicker.jsx":[function(require,module,exports){
"use strict";
var translationStrategy = require('./../modules/translationStrategies/spTr.js');
var tr = require('./../modules/tr.js');
tr.setStrategy(translationStrategy);
var React = (window.React);

//just include it to setup
var APIManager = require("./../modules/APIManager.jsx");


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
window.MapOverlay = Wgts.MapOverlay = require('./../modules/Map/MapOverlay.jsx');
window.MapLoader = Wgts.MapLoader = require('./../modules/Map/MapLoader.jsx');
window.MapPlacesStore = Wgts.MapPlacesStore = require('./../modules/stores/MapPlacesStore.jsx');
//RESULTS
window.GroupedResults = Wgts.GroupedResults = require('./../modules/GroupedResults/GroupedResults.jsx');

},{"./../modules/APIManager.jsx":"C:\\www\\skypicker-components\\modules\\APIManager.jsx","./../modules/GroupedResults/GroupedResults.jsx":"C:\\www\\skypicker-components\\modules\\GroupedResults\\GroupedResults.jsx","./../modules/Map/MapLoader.jsx":"C:\\www\\skypicker-components\\modules\\Map\\MapLoader.jsx","./../modules/Map/MapOverlay.jsx":"C:\\www\\skypicker-components\\modules\\Map\\MapOverlay.jsx","./../modules/containers/Options.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Options.jsx","./../modules/containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../modules/containers/Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx","./../modules/containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../modules/containers/SearchFormData.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx","./../modules/containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../modules/plainJsAdapters/SearchFormAdapter.jsx":"C:\\www\\skypicker-components\\modules\\plainJsAdapters\\SearchFormAdapter.jsx","./../modules/stores/MapPlacesStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesStore.jsx","./../modules/stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./../modules/stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../modules/tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./../modules/translationStrategies/spTr.js":"C:\\www\\skypicker-components\\modules\\translationStrategies\\spTr.js"}],"C:\\www\\skypicker-components\\modules\\APIManager.jsx":[function(require,module,exports){
"use strict";

var flightsAPI = require('./APIs/flightsAPI.jsx');
var OptionsStore = require('./stores/OptionsStore.jsx');


  function APIManager() {"use strict";
    OptionsStore.events.on("change", function()  {
      flightsAPI.changeOptions({language: OptionsStore.data.language});
    })
  }


module.exports = new APIManager();

},{"./APIs/flightsAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\flightsAPI.jsx","./stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx"}],"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx":[function(require,module,exports){
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
  FlightsAPI.prototype.findFlights=function(request) {"use strict";
    var searchParams, skypickerApiUrl;
    skypickerApiUrl = "https://api.skypicker.com/flights";
    searchParams = {
      v: 2,
      //flyDays: [],
      //directFlights: 0,
      sort: "price",
      asc: 1,
      locale: this.options.language,
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
            if (this.options.format == "original") {
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
      }.bind(this));
    return deferred.promise;
  };


module.exports = new FlightsAPI();


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

},{"./../../containers/flights/Flight.jsx":"C:\\www\\skypicker-components\\modules\\containers\\flights\\Flight.jsx","./../../containers/flights/Journey.jsx":"C:\\www\\skypicker-components\\modules\\containers\\flights\\Journey.jsx","./../../containers/flights/Trip.jsx":"C:\\www\\skypicker-components\\modules\\containers\\flights\\Trip.jsx","immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\Calendar.jsx":[function(require,module,exports){
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


},{}],"C:\\www\\skypicker-components\\modules\\DatePicker\\DatePickerModal.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");
var SearchDate = require('./../containers/SearchDate.jsx');
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


},{"./../ModalPicker.jsx":"C:\\www\\skypicker-components\\modules\\ModalPicker.jsx","./../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./components/DatePicker.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\DatePicker.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js"}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\CalendarDay.jsx":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\CalendarFrame.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var moment = (window.moment);

var CalendarDay = require("./CalendarDay.jsx");
var DaysInWeek = require("./SelectDaysInWeek.jsx");
var Calendar = require("./../../Calendar.jsx");
var DateTools = require("./../../DateTools.js");

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

},{"./../../Calendar.jsx":"C:\\www\\skypicker-components\\modules\\Calendar.jsx","./../../DateTools.js":"C:\\www\\skypicker-components\\modules\\DateTools.js","./CalendarDay.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\CalendarDay.jsx","./SelectDaysInWeek.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\SelectDaysInWeek.jsx"}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\DatePicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var SearchDate = require('./../../containers/SearchDate.jsx');
var ModalMenuMixin = require('./../../ModalMenuMixin.jsx');
var CalendarFrame = require('./CalendarFrame.jsx');
var MonthMatrix = require("./MonthMatrix.jsx");
var Slider = require('./Slider.js');
var tr = require('./../../tr.js');
var Tran = require('./../../Tran.jsx');
var isIE = require('./../../tools/isIE.js');


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

},{"./../../ModalMenuMixin.jsx":"C:\\www\\skypicker-components\\modules\\ModalMenuMixin.jsx","./../../Tran.jsx":"C:\\www\\skypicker-components\\modules\\Tran.jsx","./../../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../../tools/isIE.js":"C:\\www\\skypicker-components\\modules\\tools\\isIE.js","./../../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./CalendarFrame.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\CalendarFrame.jsx","./MonthMatrix.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\MonthMatrix.jsx","./Slider.js":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\Slider.js"}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\MonthMatrix.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var moment = (window.moment);
var Tran = require('./../../Tran.jsx');

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

},{"./../../Tran.jsx":"C:\\www\\skypicker-components\\modules\\Tran.jsx"}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\SelectDaysInWeek.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var Tran = require('./../../Tran.jsx');

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

},{"./../../Tran.jsx":"C:\\www\\skypicker-components\\modules\\Tran.jsx"}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\Slider.js":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\DateTools.js":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\Geolocation.jsx":[function(require,module,exports){
"use strict";
var LatLon = require('./tools/latlon.js');
var OptionsStore = require('./stores/OptionsStore.jsx');


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

},{"./stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./tools/latlon.js":"C:\\www\\skypicker-components\\modules\\tools\\latlon.js"}],"C:\\www\\skypicker-components\\modules\\GroupedResults\\DateFormat.jsx":[function(require,module,exports){
"use strict";
module.exports = React.createClass({
  displayName: "DateFormat",
  render: function () {
    var local = this.props.dateInPlace.get("local");
    var utc = this.props.dateInPlace.get("utc");
    var title = "In UTC time: " + utc.format("LLL");
    return (
      React.createElement("span", {title: title}, React.createElement("b", null, local.format("MMM D")), " ", local.format("ddd"), " ", React.createElement("b", null, local.format("LT")))
    )
  }
});

},{}],"C:\\www\\skypicker-components\\modules\\GroupedResults\\GroupedResults.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var SearchFormStore = require('../stores/SearchFormStore.jsx');
var flightsAPI = require('../APIs/flightsAPI.jsx');
var OptionsStore  = require('./../stores/OptionsStore.jsx');
var PriceGroup = require('./PriceGroup.jsx');

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
        priceGroupsIndex[index] = [];
      }
      priceGroupsIndex[index].push(journey);
    });
    return Object.keys(priceGroupsIndex).map(function(key)  {
      return {
        price: priceGroupsIndex[key][0].getPrice(),
        isReturn: priceGroupsIndex[key][0].isReturn(),
        journeys: priceGroupsIndex[key]
      }
    }).sort(function(a, b)  {
      return a.price > b.price ? 1 : -1
    });
  },
  loadFlights: function () {
    flightsAPI.findFlights({
      origin: SearchFormStore.data.origin,
      destination: SearchFormStore.data.destination,
      outboundDate: SearchFormStore.data.dateFrom,
      inboundDate: SearchFormStore.data.dateTo,
      passengers: SearchFormStore.data.passengers
    }).then(function(journeys)  {
      this.setState({
        priceGroups: this.groupJourneys(journeys)
      });
    }.bind(this)).catch(function(err)  {
      //TODO nicer error handling
      console.error(err, err.stack);
    });
  },
  componentDidMount: function() {
    SearchFormStore.events.on("search", function(type)  {
      this.loadFlights();
    }.bind(this))
  },
  render: function() {
    return (
      React.createElement("div", null, 
      this.state.priceGroups.map(function(priceGroup)  {
        return (React.createElement(PriceGroup, {key: "_"+priceGroup.price, priceGroup: priceGroup}))
      })
      )
    );
  }
});


},{"../APIs/flightsAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\flightsAPI.jsx","../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./PriceGroup.jsx":"C:\\www\\skypicker-components\\modules\\GroupedResults\\PriceGroup.jsx"}],"C:\\www\\skypicker-components\\modules\\GroupedResults\\PriceGroup.jsx":[function(require,module,exports){
"use strict";
var TripInfo = require("./TripInfo.jsx");
var Immutable = require("immutable");
var Map = Immutable.Map;


var LinkButton = React.createClass({displayName: "LinkButton",
  render: function () {
    var sharedJourney = this.props.sharedJourney;
    var baseUrl = "https://en.skypicker.com/booking"; //TODO change it
    if (sharedJourney) {
      var url = baseUrl + "?flightsId=" + sharedJourney.get("id") + "&price=" + sharedJourney.getPrice();
      return (
        React.createElement("a", {href: url}, "Book flight for ", sharedJourney.getPrice(), " ", sharedJourney.get("id"))
      );
    } else {
      var id = this.props.selected.get("outbound").master.getId() + "|" +  this.props.selected.get("inbound").master.getId()
      var url = baseUrl + "?flightsId=" + id  + "&price=" + this.props.groupPrice;
      console.log(url);
      return (
        React.createElement("a", {href: url}, "Check price and book flight")
      );
    }
  }
});

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


 Pair format:
  master: Trip
  journey: Journey (if it is return, it is null)
  slaves: [
    {
      trip: Trip
      journey: Journey (common journey)
    }
    ...
  ]
  oneWay: boolean
 */




module.exports = React.createClass({
  displayName: "PriceGroup",

  getInitialState: function () {
    var merged = this.mergeTrips(this.props.priceGroup.journeys);
    return {
      merged: merged,
      selected: this.firstSelected(Map(), merged)
    }
  },

  selectFunc: function (pair, direction) {
    return function()  {
      this.setState({
        selected: this.state.selected.set(direction,pair)
      })
    }.bind(this)
  },

  firstSelected: function (selected, merged) {
    return (
      selected
        .set("outbound",merged.outbounds[0])
        .set("inbound",merged.inbounds[0])
    );
  },

  mergeTrips: function () {
    return {
      outbounds: this.mergeTripsToPairs(this.props.priceGroup.journeys, "outbound"),
      inbounds: this.mergeTripsToPairs(this.props.priceGroup.journeys, "inbound")
    }
  },

  mergeTripsToPairs: function (journeys, masterDirection) {
    var slaveDirection = masterDirection == "outbound" ? "inbound" : "outbound";
    var pairs = {};
    journeys.forEach(function(journey)  {
      if (journey.isReturn()) {
        //Returns
        var id = journey.get("trips").get(masterDirection).getId();
        if (!pairs[id]) {
          pairs[id] = {
            master: journey.get("trips").get(masterDirection),
            journey: null /*multiple journeys in slaves*/,
            slaves: [],
            oneWay: false
          };
        }
        pairs[id].slaves.push({
          trip: journey.trips.get(slaveDirection),
          journey: journey
        });
      } else {
        //One ways
        if (journey.get("trips").get(masterDirection)) {
          var id = journey.get("trips").get(masterDirection).getId();
          pairs[id] = {
            master: journey.get("trips").get(masterDirection),
            journey: journey ,
            oneWay: true
          };
        }
      }

    });
    return Object.keys(pairs).map(function(key)  {return pairs[key];});
  },

  componentWillReceiveProps: function (newProps) {
    if (newProps.journeys != this.props.priceGroup.journeys) {
      var merged = this.mergeTrips(newProps.journeys);
      this.setState({
        merged: merged,
        selected: this.firstSelected(this.state.selected, merged)
      });
    }
  },

  findSharedJourney:function(outbound, inbound) {
    if (outbound.oneWay) {
      return outbound.journey;
    }
    var sharedJourney = null;
    outbound.slaves.forEach(function(outboundsSlaveInbound)  {
      inbound.slaves.forEach(function(inboundsSlaveOutbound)  {
        if (outboundsSlaveInbound.journey == inboundsSlaveOutbound.journey) {
          sharedJourney = outboundsSlaveInbound.journey;
        }
      })
    });
    return sharedJourney;
  },

  isInCounterpart:function(thisMaster,thisDirection) {
    var thisId = thisMaster.getId();
    var thatDirection = thisDirection == "outbound" ? "inbound" : "outbound";
    var isThere = false;
    this.state.selected.get(thatDirection).slaves.forEach(function(slave)  {
      if (thisId == slave.trip.getId()) {
        isThere = true;
      }
    });
    return isThere;
  },
  renderLeg: function (direction) {

    return (
      React.createElement("div", {className: "legs-content"}, 
        this.state.merged[direction+"s"].map(function(pair)  {
          var id = pair.master.getId();
          var selected = false;
          if (this.state.selected.get(direction)) {
            selected = id == this.state.selected.get(direction).master.getId();
          }
          if (pair.oneWay) {
            return React.createElement(TripInfo, {selected: selected, key: "oneway-"+id, onSelect: this.selectFunc(pair,direction), trip: pair.master})
          } else {
            return React.createElement(TripInfo, {selected: selected, hidden: !this.isInCounterpart(pair.master, direction), key: direction+"-"+id, onSelect: this.selectFunc(pair,direction), trip: pair.master})
          }
        }.bind(this))
      )
    )
  },
  renderInbounds: function () {
    return (
      React.createElement("div", {className: "inbound-legs"}, 
        React.createElement("div", {className: "legs-header"}, 
          "Inbound"
        ), 
        React.createElement("div", {className: "legs-body"}, 
              this.renderLeg("inbound")
        )
      )
    )
  },
  renderOutbounds: function () {
    return (
      React.createElement("div", {className: "outbound-legs"}, 
        React.createElement("div", {className: "legs-header"}, 
          "Outbound"
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
      React.createElement("div", {className: "price-group"}, 
        React.createElement("div", {className: "price-group--header"}, price), 
        this.renderOutbounds(), 
        isReturn?this.renderInbounds():"", 
        React.createElement("div", null, 
          React.createElement(LinkButton, {sharedJourney: sharedJourney, groupPrice: price, selected: this.state.selected})
        )
      )
    )
  }
});

},{"./TripInfo.jsx":"C:\\www\\skypicker-components\\modules\\GroupedResults\\TripInfo.jsx","immutable":"C:\\www\\skypicker-components\\node_modules\\immutable\\dist\\immutable.js"}],"C:\\www\\skypicker-components\\modules\\GroupedResults\\TripDetails.jsx":[function(require,module,exports){
"use strict";
var DateFormat = require('./DateFormat.jsx');

module.exports = React.createClass({
  displayName: "TripDetails",
  renderFlights: function () {
    var trip = this.props.trip;
    return trip.flights.map(function(flight)  {
      return (
        React.createElement("div", null, 
          React.createElement("div", {className: "field radio"}), 
          React.createElement("div", {className: "field departure-date"}, React.createElement(DateFormat, {dateInPlace: flight.getDeparture().get("when")})), 
          React.createElement("div", {className: "field departure"}, flight.getDeparture().getIn(["where", "code"])), 
          React.createElement("div", {className: "field duration"}, Math.floor(flight.getDuration().asHours()), "h ", trip.getDuration().minutes(), "min"), 
          React.createElement("div", {className: "field arrival-date"}, React.createElement(DateFormat, {dateInPlace: flight.getArrival().get("when")})), 
          React.createElement("div", {className: "field arrival"}, flight.getArrival().getIn(["where", "code"])), 
          React.createElement("div", {className: "field stops"}), 
          React.createElement("div", {className: "field details"})
        )
      )
    }).toJS();
  },
  render: function () {
    return (
      React.createElement("div", {className: "trip-details"}, 
        this.renderFlights()
      )
    )
  }
});

},{"./DateFormat.jsx":"C:\\www\\skypicker-components\\modules\\GroupedResults\\DateFormat.jsx"}],"C:\\www\\skypicker-components\\modules\\GroupedResults\\TripInfo.jsx":[function(require,module,exports){
"use strict";
var TripDetails = require('./TripDetails.jsx');
var DateFormat = require('./DateFormat.jsx');


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
  toggleDetails: function () {
    this.setState({
      details: !this.state.details
    })
  },
  render: function () {
    var className = "trip-info";
    var trip = this.props.trip;
    var stops;
    if (trip.getStops() >= 1) {
      stops = trip.getStops() + " "+"stops";
    } else {
      stops = "Direct flight";
    }
    if (this.props.selected) {
      className += " selected";
    }
    if (this.props.hidden) {
      className += " hidden";
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
        React.createElement("div", {className: "field radio"}, React.createElement("i", {className: circleClass})), 
        React.createElement("div", {className: "field departure-date"}, React.createElement(DateFormat, {dateInPlace: trip.getDeparture().get("when")})), 
        React.createElement("div", {className: "field departure"}, trip.getDeparture().getIn(["where", "code"])), 
        React.createElement("div", {className: "field duration"}, Math.floor(trip.getDuration().asHours()), "h ", trip.getDuration().minutes(), "min"), 
        React.createElement("div", {className: "field arrival-date"}, React.createElement(DateFormat, {dateInPlace: trip.getArrival().get("when")})), 
        React.createElement("div", {className: "field arrival"}, trip.getArrival().getIn(["where", "code"])), 
        React.createElement("div", {className: "field stops"}, stops), 
        React.createElement("div", {className: "field details", onClick: this.toggleDetails}, "Details"), 
        details
      )
    )
  }
});

},{"./DateFormat.jsx":"C:\\www\\skypicker-components\\modules\\GroupedResults\\DateFormat.jsx","./TripDetails.jsx":"C:\\www\\skypicker-components\\modules\\GroupedResults\\TripDetails.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\LabelsLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var PlaceLabel = require('./PlaceLabel.jsx');
var MapLabelsStore = require('../stores/MapLabelsStore.jsx');
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

},{"../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./PlaceLabel.jsx":"C:\\www\\skypicker-components\\modules\\Map\\PlaceLabel.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\MapLoader.jsx":[function(require,module,exports){
"use strict";
var PureRenderMixin = (window.React).addons.PureRenderMixin;
var MapPlacesStore = require('./../stores/MapPlacesStore.jsx');
var Translate = require('./../Translate.jsx');

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

},{"./../Translate.jsx":"C:\\www\\skypicker-components\\modules\\Translate.jsx","./../stores/MapPlacesStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesStore.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\MapOverlay.jsx":[function(require,module,exports){
"use strict";
var LabelsLayer = require('./LabelsLayer.jsx');
var PointsLayer = require('./PointsLayer.jsx');
var PointsSVGLayer = require('./PointsSVGLayer.jsx');
var MouseClickLayer = require('./MouseClickLayer.jsx');
var MapLabelsStore = require('./../stores/MapLabelsStore.jsx');

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

},{"./../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./LabelsLayer.jsx":"C:\\www\\skypicker-components\\modules\\Map\\LabelsLayer.jsx","./MouseClickLayer.jsx":"C:\\www\\skypicker-components\\modules\\Map\\MouseClickLayer.jsx","./PointsLayer.jsx":"C:\\www\\skypicker-components\\modules\\Map\\PointsLayer.jsx","./PointsSVGLayer.jsx":"C:\\www\\skypicker-components\\modules\\Map\\PointsSVGLayer.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\MouseClickLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);

var MouseClickTile = require('./MouseClickTile.jsx');
var MapLabelsStore = require('../stores/MapLabelsStore.jsx');
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

},{"../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./MouseClickTile.jsx":"C:\\www\\skypicker-components\\modules\\Map\\MouseClickTile.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\MouseClickTile.jsx":[function(require,module,exports){
"use strict";
var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');
var MapLabelsStore = require('./../../modules/stores/MapLabelsStore.jsx');
var SearchPlace = require('./../../modules/containers/SearchPlace.jsx');
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

},{"./../../modules/containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../modules/stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./../../modules/stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\PlaceLabel.jsx":[function(require,module,exports){
"use strict";
var PureRenderMixin = (window.React).addons.PureRenderMixin;
var Price = require('./../components/Price.jsx');

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

},{"./../components/Price.jsx":"C:\\www\\skypicker-components\\modules\\components\\Price.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\Point.jsx":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\Map\\PointSVG.jsx":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\Map\\PointsLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var MapLabelsStore = require('../stores/MapLabelsStore.jsx');
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

},{"../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./Point.jsx":"C:\\www\\skypicker-components\\modules\\Map\\Point.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\PointsSVGLayer.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var MapLabelsStore = require('../stores/MapLabelsStore.jsx');
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

},{"../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./PointSVG.jsx":"C:\\www\\skypicker-components\\modules\\Map\\PointSVG.jsx"}],"C:\\www\\skypicker-components\\modules\\ModalMenuMixin.jsx":[function(require,module,exports){
"use strict";
var ModalMenuMixin = {

  renderBody: function() {
    var mode = this.state.viewMode;
    if (!mode ) {
      return "";
    }
    var methodName = "render"+mode.charAt(0).toUpperCase() + mode.slice(1);
    if (this[methodName]) {
      return this[methodName]();
    } else {
      throw new Error("no such method: " + methodName)
    }
  },

  renderMenu: function () {
    var mode = this.state.viewMode;
    var modeOptions = [];
    for (var imode in this.props.modes) {
      if (this.props.modes[imode]) {
        var className = "mode-"+imode;
        if (mode == imode) {
          className += " active";
        }
        modeOptions.push(React.createElement("div", {key: imode, className: className, onClick:  this.switchModeToFunc(imode) },  this.getModeLabel(imode) ))
      }
    }
    return (
      React.createElement("div", {className: "mode-selector"}, 
          modeOptions
      )
    )
  }
};

module.exports = ModalMenuMixin;

},{}],"C:\\www\\skypicker-components\\modules\\ModalPicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var isIE = require('./tools/isIE.js');
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



},{"./Tran.jsx":"C:\\www\\skypicker-components\\modules\\Tran.jsx","./tools/isIE.js":"C:\\www\\skypicker-components\\modules\\tools\\isIE.js"}],"C:\\www\\skypicker-components\\modules\\PlacePicker\\PlacePickerModal.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var ModalPicker = require("./../ModalPicker.jsx");
var PlacePicker = require("./components/PlacePicker.jsx");
var SearchPlace = require("./../containers/SearchPlace.jsx");
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


},{"./../ModalPicker.jsx":"C:\\www\\skypicker-components\\modules\\ModalPicker.jsx","./../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./components/PlacePicker.jsx":"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\PlacePicker.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js"}],"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\PlacePicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var testShit = null;

var React = (window.React);
React.initializeTouchEvents(true);
var tr = require('./../../tr.js');

var Places = require('./Places.jsx');
var ModalMenuMixin = require('./../../ModalMenuMixin.jsx');
var Place = require('./../../containers/Place.jsx');
var SearchPlace = require('./../../containers/SearchPlace.jsx');
var Radius = require('./../../containers/Radius.jsx');

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

},{"./../../ModalMenuMixin.jsx":"C:\\www\\skypicker-components\\modules\\ModalMenuMixin.jsx","./../../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../../containers/Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx","./../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./Places.jsx":"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\Places.jsx"}],"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\PlaceRow.jsx":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\Places.jsx":[function(require,module,exports){
"use strict";
var PlacesAPI = require('./../../APIs/PlacesAPICached.jsx');
var PlaceRow = require('./PlaceRow.jsx');
var Geolocation = require('./../../Geolocation.jsx');
var SearchPlace = require('./../../containers/SearchPlace.jsx');
var OptionsStore = require('./../../stores/OptionsStore.jsx');
var Place = require('./../../containers/Place.jsx');
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

},{"./../../APIs/PlacesAPICached.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx","./../../Geolocation.jsx":"C:\\www\\skypicker-components\\modules\\Geolocation.jsx","./../../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./PlaceRow.jsx":"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\PlaceRow.jsx"}],"C:\\www\\skypicker-components\\modules\\SearchForm\\PassengersField.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var Translate = require('./../Translate.jsx');

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

},{"./../Translate.jsx":"C:\\www\\skypicker-components\\modules\\Translate.jsx"}],"C:\\www\\skypicker-components\\modules\\SearchForm\\SearchForm.jsx":[function(require,module,exports){
"use strict";

var DatePickerModal = require('./../DatePicker/DatePickerModal.jsx');
var PlacePickerModal = require('./../PlacePicker/PlacePickerModal.jsx');


var SearchFormStore = require('./../stores/SearchFormStore.jsx');

var SearchDate = require('./../containers/SearchDate.jsx');
var SearchPlace = require('./../containers/SearchPlace.jsx');
var tr = require('./../tr.js');
var Tran = require('./../Tran.jsx');
var ToggleActive = require('./ToggleActive.jsx');
var PassengersField = require('./PassengersField.jsx');

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

},{"./../DatePicker/DatePickerModal.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\DatePickerModal.jsx","./../PlacePicker/PlacePickerModal.jsx":"C:\\www\\skypicker-components\\modules\\PlacePicker\\PlacePickerModal.jsx","./../Tran.jsx":"C:\\www\\skypicker-components\\modules\\Tran.jsx","./../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./PassengersField.jsx":"C:\\www\\skypicker-components\\modules\\SearchForm\\PassengersField.jsx","./ToggleActive.jsx":"C:\\www\\skypicker-components\\modules\\SearchForm\\ToggleActive.jsx"}],"C:\\www\\skypicker-components\\modules\\SearchForm\\ToggleActive.jsx":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\Tran.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */




/** Deprecated -  don't use */




var React = (window.React);
var tr = require('./tr.js');

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

},{"./tr.js":"C:\\www\\skypicker-components\\modules\\tr.js"}],"C:\\www\\skypicker-components\\modules\\Translate.jsx":[function(require,module,exports){
"use strict";
var React = (window.React);
var translate = require('./tools/translate.jsx');

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

},{"./tools/translate.jsx":"C:\\www\\skypicker-components\\modules\\tools\\translate.jsx"}],"C:\\www\\skypicker-components\\modules\\components\\Price.jsx":[function(require,module,exports){
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

},{"./../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./../tools/translate.jsx":"C:\\www\\skypicker-components\\modules\\tools\\translate.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\Immutable.jsx":[function(require,module,exports){
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
var tr = require('./../tr.js');

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

},{"./../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./Immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Immutable.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js"}],"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx":[function(require,module,exports){
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
var tr = require('./../tr.js');
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

},{"./../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\flights\\Flight.jsx":[function(require,module,exports){
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
},{}],"C:\\www\\skypicker-components\\modules\\plainJsAdapters\\SearchFormAdapter.jsx":[function(require,module,exports){
"use strict";
var SearchForm = require('./../SearchForm/SearchForm.jsx');

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

},{"./../SearchForm/SearchForm.jsx":"C:\\www\\skypicker-components\\modules\\SearchForm\\SearchForm.jsx"}],"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx":[function(require,module,exports){
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
      var lastData = this.data;
      return Q.all(promises).then(function(results)  {
        if (lastData != this.data) return; //if some other search has outran me
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

},{"./../APIs/PlacesAPICached.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx","./../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../containers/SearchFormData.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx","./../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\www\\skypicker-components\\modules\\tools\\DatePairValidator.jsx":[function(require,module,exports){
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


},{}],"C:\\www\\skypicker-components\\modules\\tools\\geo.js":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\tr.js":[function(require,module,exports){
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

},{}],"C:\\www\\skypicker-components\\modules\\translationStrategies\\spTr.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZXhwb3J0cy9za3lwaWNrZXIuanN4IiwibW9kdWxlcy9BUElNYW5hZ2VyLmpzeCIsIm1vZHVsZXMvQVBJcy9QbGFjZXNBUEkuanN4IiwibW9kdWxlcy9BUElzL1BsYWNlc0FQSUNhY2hlZC5qc3giLCJtb2R1bGVzL0FQSXMvZmxpZ2h0c0FQSS5qc3giLCJtb2R1bGVzL0FQSXMvbWFwcGVycy9mbGlnaHRzQXBpVG9Kb3VybmV5LmpzeCIsIm1vZHVsZXMvQ2FsZW5kYXIuanN4IiwibW9kdWxlcy9EYXRlUGlja2VyL0RhdGVQaWNrZXJNb2RhbC5qc3giLCJtb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9DYWxlbmRhckRheS5qc3giLCJtb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9DYWxlbmRhckZyYW1lLmpzeCIsIm1vZHVsZXMvRGF0ZVBpY2tlci9jb21wb25lbnRzL0RhdGVQaWNrZXIuanN4IiwibW9kdWxlcy9EYXRlUGlja2VyL2NvbXBvbmVudHMvTW9udGhNYXRyaXguanN4IiwibW9kdWxlcy9EYXRlUGlja2VyL2NvbXBvbmVudHMvU2VsZWN0RGF5c0luV2Vlay5qc3giLCJtb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9TbGlkZXIuanMiLCJtb2R1bGVzL0RhdGVUb29scy5qcyIsIm1vZHVsZXMvR2VvbG9jYXRpb24uanN4IiwibW9kdWxlcy9Hcm91cGVkUmVzdWx0cy9EYXRlRm9ybWF0LmpzeCIsIm1vZHVsZXMvR3JvdXBlZFJlc3VsdHMvR3JvdXBlZFJlc3VsdHMuanN4IiwibW9kdWxlcy9Hcm91cGVkUmVzdWx0cy9QcmljZUdyb3VwLmpzeCIsIm1vZHVsZXMvR3JvdXBlZFJlc3VsdHMvVHJpcERldGFpbHMuanN4IiwibW9kdWxlcy9Hcm91cGVkUmVzdWx0cy9UcmlwSW5mby5qc3giLCJtb2R1bGVzL01hcC9MYWJlbHNMYXllci5qc3giLCJtb2R1bGVzL01hcC9NYXBMb2FkZXIuanN4IiwibW9kdWxlcy9NYXAvTWFwT3ZlcmxheS5qc3giLCJtb2R1bGVzL01hcC9Nb3VzZUNsaWNrTGF5ZXIuanN4IiwibW9kdWxlcy9NYXAvTW91c2VDbGlja1RpbGUuanN4IiwibW9kdWxlcy9NYXAvUGxhY2VMYWJlbC5qc3giLCJtb2R1bGVzL01hcC9Qb2ludC5qc3giLCJtb2R1bGVzL01hcC9Qb2ludFNWRy5qc3giLCJtb2R1bGVzL01hcC9Qb2ludHNMYXllci5qc3giLCJtb2R1bGVzL01hcC9Qb2ludHNTVkdMYXllci5qc3giLCJtb2R1bGVzL01vZGFsTWVudU1peGluLmpzeCIsIm1vZHVsZXMvTW9kYWxQaWNrZXIuanN4IiwibW9kdWxlcy9QbGFjZVBpY2tlci9QbGFjZVBpY2tlck1vZGFsLmpzeCIsIm1vZHVsZXMvUGxhY2VQaWNrZXIvY29tcG9uZW50cy9QbGFjZVBpY2tlci5qc3giLCJtb2R1bGVzL1BsYWNlUGlja2VyL2NvbXBvbmVudHMvUGxhY2VSb3cuanN4IiwibW9kdWxlcy9QbGFjZVBpY2tlci9jb21wb25lbnRzL1BsYWNlcy5qc3giLCJtb2R1bGVzL1NlYXJjaEZvcm0vUGFzc2VuZ2Vyc0ZpZWxkLmpzeCIsIm1vZHVsZXMvU2VhcmNoRm9ybS9TZWFyY2hGb3JtLmpzeCIsIm1vZHVsZXMvU2VhcmNoRm9ybS9Ub2dnbGVBY3RpdmUuanN4IiwibW9kdWxlcy9UcmFuLmpzeCIsIm1vZHVsZXMvVHJhbnNsYXRlLmpzeCIsIm1vZHVsZXMvY29tcG9uZW50cy9QcmljZS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvSW1tdXRhYmxlLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9NYXBMYWJlbC5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvTWFwUGxhY2UuanN4IiwibW9kdWxlcy9jb250YWluZXJzL09wdGlvbnMuanN4IiwibW9kdWxlcy9jb250YWluZXJzL1BsYWNlLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9SYWRpdXMuanN4IiwibW9kdWxlcy9jb250YWluZXJzL1NlYXJjaERhdGUuanN4IiwibW9kdWxlcy9jb250YWluZXJzL1NlYXJjaEZvcm1EYXRhLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvZmxpZ2h0cy9GbGlnaHQuanN4IiwibW9kdWxlcy9jb250YWluZXJzL2ZsaWdodHMvSm91cm5leS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvZmxpZ2h0cy9UcmlwLmpzeCIsIm1vZHVsZXMvcGxhaW5Kc0FkYXB0ZXJzL1NlYXJjaEZvcm1BZGFwdGVyLmpzeCIsIm1vZHVsZXMvc3RvcmVzL01hcExhYmVsc1N0b3JlLmpzeCIsIm1vZHVsZXMvc3RvcmVzL01hcFBsYWNlc0luZGV4LmpzeCIsIm1vZHVsZXMvc3RvcmVzL01hcFBsYWNlc1N0b3JlLmpzeCIsIm1vZHVsZXMvc3RvcmVzL09wdGlvbnNTdG9yZS5qc3giLCJtb2R1bGVzL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4IiwibW9kdWxlcy90b29scy9EYXRlUGFpclZhbGlkYXRvci5qc3giLCJtb2R1bGVzL3Rvb2xzL2dlby5qcyIsIm1vZHVsZXMvdG9vbHMvaXNJRS5qcyIsIm1vZHVsZXMvdG9vbHMvbGF0bG9uLmpzIiwibW9kdWxlcy90b29scy9xdWFkdHJlZS5qcyIsIm1vZHVsZXMvdG9vbHMvdHJhbnNsYXRlLmpzeCIsIm1vZHVsZXMvdHIuanMiLCJtb2R1bGVzL3RyYW5zbGF0aW9uU3RyYXRlZ2llcy9zcFRyLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvZGVlcG1lcmdlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ltbXV0YWJsZS9kaXN0L2ltbXV0YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9jbGllbnQuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvY29tcG9uZW50LWVtaXR0ZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvcmVkdWNlLWNvbXBvbmVudC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xudmFyIHRyYW5zbGF0aW9uU3RyYXRlZ3kgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvdHJhbnNsYXRpb25TdHJhdGVnaWVzL3NwVHIuanMnKTtcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy90ci5qcycpO1xudHIuc2V0U3RyYXRlZ3kodHJhbnNsYXRpb25TdHJhdGVneSk7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcblxuLy9qdXN0IGluY2x1ZGUgaXQgdG8gc2V0dXBcbnZhciBBUElNYW5hZ2VyID0gcmVxdWlyZShcIi4vLi4vbW9kdWxlcy9BUElNYW5hZ2VyLmpzeFwiKTtcblxuXG53aW5kb3cuV2d0cyA9IHt9OyAvL1RoYXQncyBuYW1lc3BhY2UgaWYgdGhlcmUgd2lsbCBiZSBzb21lIG5hbWUgY29sbGlzaW9uXG5cbndpbmRvdy5QbGFjZSA9IFdndHMuUGxhY2UgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9QbGFjZS5qc3gnKTtcbndpbmRvdy5SYWRpdXMgPSBXZ3RzLlJhZGl1cyA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1JhZGl1cy5qc3gnKTtcbndpbmRvdy5TZWFyY2hEYXRlID0gV2d0cy5TZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL2NvbnRhaW5lcnMvU2VhcmNoRGF0ZS5qc3gnKTtcbndpbmRvdy5TZWFyY2hQbGFjZSA9IFdndHMuU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtRGF0YSA9IFdndHMuU2VhcmNoRm9ybURhdGEgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hGb3JtRGF0YS5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtU3RvcmUgPSBXZ3RzLlNlYXJjaEZvcm1TdG9yZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCcpO1xud2luZG93Lk9wdGlvbnNTdG9yZSA9IFdndHMuT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XG53aW5kb3cuT3B0aW9ucyA9IFdndHMuT3B0aW9ucyA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL09wdGlvbnMuanN4Jyk7XG53aW5kb3cuU2VhcmNoRm9ybUFkYXB0ZXIgPSBXZ3RzLlNlYXJjaEZvcm1BZGFwdGVyID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3BsYWluSnNBZGFwdGVycy9TZWFyY2hGb3JtQWRhcHRlci5qc3gnKTtcbi8vTUFQXG53aW5kb3cuTWFwT3ZlcmxheSA9IFdndHMuTWFwT3ZlcmxheSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9NYXAvTWFwT3ZlcmxheS5qc3gnKTtcbndpbmRvdy5NYXBMb2FkZXIgPSBXZ3RzLk1hcExvYWRlciA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9NYXAvTWFwTG9hZGVyLmpzeCcpO1xud2luZG93Lk1hcFBsYWNlc1N0b3JlID0gV2d0cy5NYXBQbGFjZXNTdG9yZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9zdG9yZXMvTWFwUGxhY2VzU3RvcmUuanN4Jyk7XG4vL1JFU1VMVFNcbndpbmRvdy5Hcm91cGVkUmVzdWx0cyA9IFdndHMuR3JvdXBlZFJlc3VsdHMgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvR3JvdXBlZFJlc3VsdHMvR3JvdXBlZFJlc3VsdHMuanN4Jyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGZsaWdodHNBUEkgPSByZXF1aXJlKCcuL0FQSXMvZmxpZ2h0c0FQSS5qc3gnKTtcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XG5cblxuICBmdW5jdGlvbiBBUElNYW5hZ2VyKCkge1widXNlIHN0cmljdFwiO1xuICAgIE9wdGlvbnNTdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSAge1xuICAgICAgZmxpZ2h0c0FQSS5jaGFuZ2VPcHRpb25zKHtsYW5ndWFnZTogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTtcbiAgICB9KVxuICB9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQVBJTWFuYWdlcigpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgc3VwZXJhZ2VudCAgPSByZXF1aXJlKFwic3VwZXJhZ2VudFwiKTtcclxudmFyIFBsYWNlICA9IHJlcXVpcmUoXCIuLi9jb250YWluZXJzL1BsYWNlLmpzeFwiKTtcclxudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZScpO1xyXG52YXIgUSA9ICh3aW5kb3cuUSk7XHJcblxyXG52YXIgdXJsID0gXCJodHRwczovL2FwaS5za3lwaWNrZXIuY29tL3BsYWNlc1wiO1xyXG5cclxuLy9UT0RPIGNoZWNrIGlmIG9uIGVycm9yIGlzIGNhbGxlZCBleGFjdGx5IHdoZW4gZXJyb3IgaW4gY2FsbGJhY2sgb3Igbm90LCB0aGVuIEFkZCBpdCB0byBwcm9taXNlXHJcbnZhciBoYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcclxuICBjb25zb2xlLmVycm9yKGVycik7XHJcbn07XHJcblxyXG5cclxuICAvKipcclxuICAgKlxyXG4gICAqIEBwYXJhbSBzZXR0aW5ncy5sYW5nIC0gbGFuZ3VhZ2UgaW4gd2hpY2ggd2UgZ2V0IHBsYWNlcyBuYW1hc1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIFBsYWNlc0FQSShzZXR0aW5ncykge1widXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZmluZCBwbGFjZXMgYWNjb3JkaW5nIHRvIGdpdmVuIGF0dHJpYnV0ZXNcclxuICAgKiBAcGFyYW0gcGxhY2VTZWFyY2gudGVybSAtIHN0cmluZyB0byBzZWFyY2hcclxuICAgKiBAcGFyYW0gcGxhY2VTZWFyY2gudHlwZUlEIC0tIHR5cGUgaWRcclxuICAgKiBAcGFyYW0gcGxhY2VTZWFyY2guYm91bmRzXHJcbiAgICogQHJldHVybiBwcm9taXNlXHJcbiAgICovXHJcbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5maW5kUGxhY2VzPWZ1bmN0aW9uKHBsYWNlU2VhcmNoKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgcGFyYW1zID0ge307XHJcbiAgICBwbGFjZVNlYXJjaCA9IHBsYWNlU2VhcmNoIHx8IHt9O1xyXG4gICAgaWYgKHBsYWNlU2VhcmNoLnRlcm0pIHtcclxuICAgICAgcGFyYW1zLnRlcm0gPSBwbGFjZVNlYXJjaC50ZXJtO1xyXG4gICAgfVxyXG4gICAgaWYgKHBsYWNlU2VhcmNoLmJvdW5kcykge1xyXG4gICAgICBwYXJhbXMgPSBkZWVwbWVyZ2UocGFyYW1zLCBwbGFjZVNlYXJjaC5ib3VuZHMpXHJcbiAgICB9XHJcbiAgICBpZiAocGxhY2VTZWFyY2gudHlwZUlEKSB7XHJcbiAgICAgIHBhcmFtcy50eXBlID0gcGxhY2VTZWFyY2gudHlwZUlEO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuJFBsYWNlc0FQSV9jYWxsQVBJKHBhcmFtcyk7XHJcbiAgfTtcclxuXHJcblxyXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuJFBsYWNlc0FQSV9jb252ZXJ0UmVzdWx0cz1mdW5jdGlvbihyZXN1bHRzKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICByZXR1cm4gbmV3IFBsYWNlKHJlc3VsdCk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBQbGFjZXNBUEkucHJvdG90eXBlLiRQbGFjZXNBUElfY2FsbEFQST1mdW5jdGlvbihwYXJhbXMpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcclxuICAgIHZhciBkZWZhdWx0UGFyYW1zID0ge1xyXG4gICAgICB2OiAyLFxyXG4gICAgICBsb2NhbGU6IHRoaXMuc2V0dGluZ3MubGFuZ1xyXG4gICAgfTtcclxuICAgIHN1cGVyYWdlbnRcclxuICAgICAgLmdldCh1cmwpXHJcbiAgICAgIC5xdWVyeShkZWVwbWVyZ2UocGFyYW1zLCBkZWZhdWx0UGFyYW1zKSlcclxuICAgICAgLy8uc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJylcclxuICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxyXG4gICAgICAub24oJ2Vycm9yJywgaGFuZGxlRXJyb3IpXHJcbiAgICAgIC5lbmQoIGZ1bmN0aW9uKHJlcykgIHtcclxuICAgICAgICBpZiAoIXJlcy5lcnJvcikge1xyXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0aGlzLiRQbGFjZXNBUElfY29udmVydFJlc3VsdHMocmVzLmJvZHkpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihyZXMuZXJyb3IpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gaWQgLSBwbGFjZSBpZFxyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUucmVnaXN0ZXJJbXBvcnRhbmNlPWZ1bmN0aW9uKGlkKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XHJcbiAgICBzdXBlcmFnZW50XHJcbiAgICAgIC5wb3N0KHVybCArIFwiL1wiICsgaWQpXHJcbiAgICAgIC5lbmQoIGZ1bmN0aW9uKHJlcykgIHtcclxuICAgICAgICBpZiAoIXJlcy5lcnJvcikge1xyXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0aGlzLiRQbGFjZXNBUElfY29udmVydFJlc3VsdHMocmVzLmJvZHkpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihyZXMuZXJyb3IpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBmaW5kIGJ5IGlkIGFuZCByZWdpc3RlciBpbXBvcnRhbmNlXHJcbiAgICogQHBhcmFtIGlkXHJcbiAgICogQHJldHVybnMgeyp9XHJcbiAgICovXHJcbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5maW5kQnlJZD1mdW5jdGlvbihpZCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xyXG4gICAgdmFyIHBhcmFtcyA9IHtcclxuICAgICAgdjogMixcclxuICAgICAgbG9jYWxlOiB0aGlzLnNldHRpbmdzLmxhbmcsXHJcbiAgICAgIGlkOiBpZFxyXG4gICAgfTtcclxuICAgIHN1cGVyYWdlbnRcclxuICAgICAgLmdldCh1cmwgKyBcIi9cIiArIGlkKVxyXG4gICAgICAucXVlcnkocGFyYW1zKVxyXG4gICAgICAvLy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKVxyXG4gICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXHJcbiAgICAgIC5vbignZXJyb3InLCBoYW5kbGVFcnJvcilcclxuICAgICAgLmVuZCggZnVuY3Rpb24ocmVzKSAge1xyXG4gICAgICAgIGlmICghcmVzLmVycm9yKSB7XHJcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKG5ldyBQbGFjZShyZXMuYm9keSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKHJlcy5lcnJvcikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgLy9DYWxsIG9uZSBtb3JlIHBvc3RcclxuICAgIHRoaXMucmVnaXN0ZXJJbXBvcnRhbmNlKGlkKTtcclxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xyXG4gIH07XHJcblxyXG5cclxuICAvKipcclxuICAgKiBAZGVwcmVjYXRlZCB1c2UgZmluZFBsYWNlc1xyXG4gICAqL1xyXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuZmluZEJ5TmFtZT1mdW5jdGlvbih0ZXJtKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy4kUGxhY2VzQVBJX2NhbGxBUEkoe3Rlcm06IHRlcm19KTtcclxuICB9O1xyXG4gIC8qKlxyXG4gICAqIEBkZXByZWNhdGVkIHVzZSBmaW5kUGxhY2VzXHJcbiAgICovXHJcbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5maW5kTmVhcmJ5PWZ1bmN0aW9uKGJvdW5kcykge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMuJFBsYWNlc0FQSV9jYWxsQVBJKGJvdW5kcyk7XHJcbiAgfTtcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZXNBUEk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFBsYWNlc0FQSSAgPSByZXF1aXJlKFwiLi9QbGFjZXNBUEkuanN4XCIpO1xyXG52YXIgUSAgPSAod2luZG93LlEpO1xyXG5cclxudmFyIEdsb2JhbFByb21pc2VzU3RvcmUgPSB7fTtcclxuXHJcbi8qKlxyXG4gKiBDYWNoZWQgUGxhY2VzQVBJLCBpdCBzaG91bGQgaGF2ZSBhbHdheXMgc2FtZSBpbnRlcmZhY2UgYXMgUGxhY2VzQVBJXHJcbiAqL1xyXG5cclxuICBmdW5jdGlvbiBQbGFjZXNBUElDYWNoZWQoc2V0dGluZ3MpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHRoaXMucGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSShzZXR0aW5ncyk7XHJcbiAgfVxyXG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuY2FsbENhY2hlZD1mdW5jdGlvbihmdW5jLCBwYXJhbXMsIGtleSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKCFHbG9iYWxQcm9taXNlc1N0b3JlW2tleV0pIHtcclxuICAgICAgR2xvYmFsUHJvbWlzZXNTdG9yZVtrZXldID0gZnVuYyhwYXJhbXMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEdsb2JhbFByb21pc2VzU3RvcmVba2V5XTtcclxuICB9O1xyXG5cclxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmJvdW5kc1RvU3RyaW5nPWZ1bmN0aW9uKGJvdW5kcykge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIGJvdW5kcy5sYXRfbG8gKyBcIl9cIiArIGJvdW5kcy5sbmdfbG8gKyBcIl9cIiArIGJvdW5kcy5sYXRfaGkgKyBcIl9cIiArIGJvdW5kcy5sbmdfaGk7XHJcbiAgfTtcclxuXHJcbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5maW5kUGxhY2VzPWZ1bmN0aW9uKHNlYXJjaFBhcmFtcykge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIGtleSA9IFwicF9cIjtcclxuICAgIGlmIChzZWFyY2hQYXJhbXMudGVybSkge1xyXG4gICAgICBrZXkgKz0gXCJ0ZXJtOlwiK3NlYXJjaFBhcmFtcy50ZXJtXHJcbiAgICB9XHJcbiAgICBpZiAoc2VhcmNoUGFyYW1zLmJvdW5kcykge1xyXG4gICAgICBrZXkgKz0gXCJib3VuZHM6XCIrdGhpcy5ib3VuZHNUb1N0cmluZyhzZWFyY2hQYXJhbXMuYm91bmRzKVxyXG4gICAgfVxyXG4gICAgaWYgKHNlYXJjaFBhcmFtcy50eXBlSUQpIHtcclxuICAgICAga2V5ICs9IFwidHlwZTpcIitzZWFyY2hQYXJhbXMudHlwZUlEXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmRQbGFjZXMuYmluZCh0aGlzLnBsYWNlc0FQSSksIHNlYXJjaFBhcmFtcywga2V5KTtcclxuICB9O1xyXG5cclxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmRCeU5hbWU9ZnVuY3Rpb24odGVybSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMuY2FsbENhY2hlZCh0aGlzLnBsYWNlc0FQSS5maW5kQnlOYW1lLmJpbmQodGhpcy5wbGFjZXNBUEkpLCB0ZXJtLCB0ZXJtKTtcclxuICB9O1xyXG5cclxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmROZWFyYnk9ZnVuY3Rpb24oYm91bmRzKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmROZWFyYnkuYmluZCh0aGlzLnBsYWNlc0FQSSksIGJvdW5kcywgdGhpcy5ib3VuZHNUb1N0cmluZyhib3VuZHMpKTtcclxuICB9O1xyXG5cclxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmRCeUlkPWZ1bmN0aW9uKGlkKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmRCeUlkLmJpbmQodGhpcy5wbGFjZXNBUEkpLCBpZCwgXCJpZDpcIitpZCk7XHJcbiAgfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlc0FQSUNhY2hlZDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuZXcgdmVyc2lvbiwgbm90IHRlc3RlZCwgbm90IGZpbmlzaGVkLCBzaG91bGQgYmUgZmluaXNoZWQgbGF0ZXJcclxudmFyIFEgPSAod2luZG93LlEpO1xyXG52YXIgc3VwZXJhZ2VudCAgPSByZXF1aXJlKFwic3VwZXJhZ2VudFwiKTtcclxudmFyIG1vbWVudCAgPSAod2luZG93Lm1vbWVudCk7XHJcbnZhciBmbGlnaHRzQXBpVG9Kb3VybmV5ID0gcmVxdWlyZShcIi4vbWFwcGVycy9mbGlnaHRzQXBpVG9Kb3VybmV5LmpzeFwiKTtcclxuXHJcblxyXG52YXIgZm9ybWF0U1BBcGlEYXRlID0gXCJERC9NTS9ZWVlZXCI7XHJcblxyXG4vL1RPRE8gY2hlY2sgaWYgb24gZXJyb3IgaXMgY2FsbGVkIGV4YWN0bHkgd2hlbiBlcnJvciBpbiBjYWxsYmFjayBvciBub3QsIHRoZW4gQWRkIGl0IHRvIHByb21pc2VcclxudmFyIGhhbmRsZUVycm9yID0gZnVuY3Rpb24gKGVycikge1xyXG4gIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxufTtcclxuXHJcblxyXG5cclxuXHJcbiAgZnVuY3Rpb24gRmxpZ2h0c0FQSSgpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHRoaXMub3B0aW9ucyA9IHtcclxuICAgICAgbGFuZ3VhZ2U6IFwiZW5cIixcclxuICAgICAgZm9ybWF0OiBcIm1hcHBlZFwiIC8vIFwibWFwcGVkXCIgb3IgXCJvcmlnaW5hbFwiXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgRmxpZ2h0c0FQSS5wcm90b3R5cGUuY2hhbmdlT3B0aW9ucz1mdW5jdGlvbihuZXdPcHRpb25zKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBPYmplY3Qua2V5cyhuZXdPcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcclxuICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSBuZXdPcHRpb25zW2tleV07XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgfTtcclxuICAvKlxyXG4gICAgICBSZXF1ZXN0OlxyXG4gICAgICB7XHJcbiAgICAgICAgb3JpZ2luOiBzdHJpbmcgKGlkKSB8XHJcbiAgICAgICAgZGVzdGluYXRpb246IHN0cmluZyAoaWQpLCBkZWZhdWx0OiBcImFueXdoZXJlXCJcclxuICAgICAgICBvdXRib3VuZERhdGU6IFNlYXJjaERhdGVcclxuICAgICAgICBpbmJvdW5kRGF0ZTogU2VhcmNoRGF0ZSB8IG51bGxcclxuICAgICAgICBwYXNzZW5nZXJzOiBudW1iZXIsIGRlZmF1bHQ6IDFcclxuICAgICAgICBmbHlEYXlzOiAobm90IHVzZWQgbm93KVxyXG4gICAgICAgIC8vZGF5c0luRGVzdGluYXRpb246IHtmcm9tOiBpbnQsIHRvOiBpbnR9LCBkZWZhdWx0OiBudWxsXHJcbiAgICAgICAgZGlyZWN0RmxpZ2h0czogKG5vdCB1c2VkIG5vdylcclxuXHJcbiAgICAgICAgb25lUGVyRGF5OiBib29sLCBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICAgIG9uZUZvckNpdHk6IGJvb2wsIGRlZmF1bHQ6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgKi9cclxuICBGbGlnaHRzQVBJLnByb3RvdHlwZS5maW5kRmxpZ2h0cz1mdW5jdGlvbihyZXF1ZXN0KSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgc2VhcmNoUGFyYW1zLCBza3lwaWNrZXJBcGlVcmw7XHJcbiAgICBza3lwaWNrZXJBcGlVcmwgPSBcImh0dHBzOi8vYXBpLnNreXBpY2tlci5jb20vZmxpZ2h0c1wiO1xyXG4gICAgc2VhcmNoUGFyYW1zID0ge1xyXG4gICAgICB2OiAyLFxyXG4gICAgICAvL2ZseURheXM6IFtdLFxyXG4gICAgICAvL2RpcmVjdEZsaWdodHM6IDAsXHJcbiAgICAgIHNvcnQ6IFwicHJpY2VcIixcclxuICAgICAgYXNjOiAxLFxyXG4gICAgICBsb2NhbGU6IHRoaXMub3B0aW9ucy5sYW5ndWFnZSxcclxuICAgICAgZGF5c0luRGVzdGluYXRpb25Gcm9tOiBcIlwiLFxyXG4gICAgICBkYXlzSW5EZXN0aW5hdGlvblRvOiBcIlwiXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAodHlwZW9mIHJlcXVlc3Qub3JpZ2luID09IFwic3RyaW5nXCIpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLmZseUZyb20gPSByZXF1ZXN0Lm9yaWdpbjtcclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5vcmlnaW4ubW9kZSA9PSBcInBsYWNlXCIpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLmZseUZyb20gPSByZXF1ZXN0Lm9yaWdpbi52YWx1ZS5pZDtcclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5vcmlnaW4ubW9kZSA9PSBcImFueXdoZXJlXCIpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLmZseUZyb20gPSBcImFueXdoZXJlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3Qub3JpZ2luLm1vZGUgPT09IFwicmFkaXVzXCIpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLnJhZGl1c0Zyb20gPSByZXF1ZXN0Lm9yaWdpbi52YWx1ZS5yYWRpdXM7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5sYXRpdHVkZUZyb20gPSByZXF1ZXN0Lm9yaWdpbi52YWx1ZS5sYXQ7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5sb25naXR1ZGVGcm9tID0gcmVxdWVzdC5vcmlnaW4udmFsdWUubG5nO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgcmVxdWVzdC5kZXN0aW5hdGlvbiA9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy50byA9IHJlcXVlc3QuZGVzdGluYXRpb247XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3QuZGVzdGluYXRpb24ubW9kZSA9PSBcInBsYWNlXCIpIHtcclxuICAgICAgc2VhcmNoUGFyYW1zLnRvID0gcmVxdWVzdC5kZXN0aW5hdGlvbi52YWx1ZS5pZDtcclxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5kZXN0aW5hdGlvbi5tb2RlID09IFwiYW55d2hlcmVcIikge1xyXG4gICAgICBzZWFyY2hQYXJhbXMudG8gPSBcImFueXdoZXJlXCI7XHJcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3QuZGVzdGluYXRpb24ubW9kZSA9PT0gXCJyYWRpdXNcIikge1xyXG4gICAgICBzZWFyY2hQYXJhbXMucmFkaXVzVG8gPSByZXF1ZXN0LmRlc3RpbmF0aW9uLnZhbHVlLnJhZGl1cztcclxuICAgICAgc2VhcmNoUGFyYW1zLmxhdGl0dWRlVG8gPSByZXF1ZXN0LmRlc3RpbmF0aW9uLnZhbHVlLmxhdDtcclxuICAgICAgc2VhcmNoUGFyYW1zLmxvbmdpdHVkZVRvID0gcmVxdWVzdC5kZXN0aW5hdGlvbi52YWx1ZS5sbmc7XHJcbiAgICB9XHJcblxyXG4gICAgc2VhcmNoUGFyYW1zLmRhdGVGcm9tID0gcmVxdWVzdC5vdXRib3VuZERhdGUuZ2V0RnJvbSgpLmZvcm1hdChmb3JtYXRTUEFwaURhdGUpO1xyXG4gICAgc2VhcmNoUGFyYW1zLmRhdGVUbyA9IHJlcXVlc3Qub3V0Ym91bmREYXRlLmdldFRvKCkuZm9ybWF0KGZvcm1hdFNQQXBpRGF0ZSk7XHJcbiAgICBpZiAocmVxdWVzdC5pbmJvdW5kRGF0ZSkge1xyXG4gICAgICBpZiAocmVxdWVzdC5pbmJvdW5kRGF0ZS5tb2RlID09IFwiaW50ZXJ2YWxcIiB8fCByZXF1ZXN0LmluYm91bmREYXRlLm1vZGUgPT0gXCJzaW5nbGVcIiAgfHwgcmVxdWVzdC5pbmJvdW5kRGF0ZS5tb2RlID09IFwiYW55dGltZVwiICkge1xyXG4gICAgICAgIHNlYXJjaFBhcmFtcy50eXBlRmxpZ2h0ID0gXCJyZXR1cm5cIjtcclxuICAgICAgICBzZWFyY2hQYXJhbXMucmV0dXJuRnJvbSA9IHJlcXVlc3QuaW5ib3VuZERhdGUuZ2V0RnJvbSgpLmZvcm1hdChmb3JtYXRTUEFwaURhdGUpO1xyXG4gICAgICAgIHNlYXJjaFBhcmFtcy5yZXR1cm5UbyA9IHJlcXVlc3QuaW5ib3VuZERhdGUuZ2V0VG8oKS5mb3JtYXQoZm9ybWF0U1BBcGlEYXRlKTtcclxuICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmluYm91bmREYXRlLm1vZGUgPT0gXCJ0aW1lVG9TdGF5XCIpIHtcclxuICAgICAgICBzZWFyY2hQYXJhbXMudHlwZUZsaWdodCA9IFwicmV0dXJuXCI7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLmRheXNJbkRlc3RpbmF0aW9uRnJvbSA9IHJlcXVlc3QuaW5ib3VuZERhdGUuZ2V0TWluU3RheURheXMoKTtcclxuICAgICAgICBzZWFyY2hQYXJhbXMuZGF5c0luRGVzdGluYXRpb25UbyA9IHJlcXVlc3QuaW5ib3VuZERhdGUuZ2V0TWF4U3RheURheXMoKTtcclxuICAgICAgICBzZWFyY2hQYXJhbXMucmV0dXJuRnJvbSA9IFwiXCI7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLnJldHVyblRvID0gXCJcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZWFyY2hQYXJhbXMudHlwZUZsaWdodCA9IFwib25ld2F5XCI7XHJcbiAgICAgICAgc2VhcmNoUGFyYW1zLnJldHVybkZyb20gPSBcIlwiO1xyXG4gICAgICAgIHNlYXJjaFBhcmFtcy5yZXR1cm5UbyA9IFwiXCI7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy50eXBlRmxpZ2h0ID0gXCJvbmV3YXlcIjtcclxuICAgICAgc2VhcmNoUGFyYW1zLnJldHVybkZyb20gPSBcIlwiO1xyXG4gICAgICBzZWFyY2hQYXJhbXMucmV0dXJuVG8gPSBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXF1ZXN0Lm9uZVBlckRheSkge1xyXG4gICAgICBzZWFyY2hQYXJhbXMub25lX3Blcl9kYXRlID0gMTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVxdWVzdC5vbmVGb3JDaXR5KSB7XHJcbiAgICAgIHNlYXJjaFBhcmFtcy5vbmVmb3JjaXR5ID0gMTsgLy8gb25lZm9yY2l0eTogcmVxdWVzdC5vbmVGb3JDaXR5ID8gXCIxXCIgOiBcIlwiLFxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzZWFyY2hQYXJhbXMuYWR1bHRzID0gcmVxdWVzdC5wYXNzZW5nZXJzIHx8IDE7XHJcbiAgICBzZWFyY2hQYXJhbXMuY2hpbGRyZW4gPSAwO1xyXG4gICAgc2VhcmNoUGFyYW1zLmluZmFudHMgPSAwO1xyXG5cclxuXHJcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XHJcbiAgICBzdXBlcmFnZW50XHJcbiAgICAgIC5nZXQoc2t5cGlja2VyQXBpVXJsKVxyXG4gICAgICAucXVlcnkoc2VhcmNoUGFyYW1zKVxyXG4gICAgICAvLy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKVxyXG4gICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXHJcbiAgICAgIC5vbignZXJyb3InLCBoYW5kbGVFcnJvcilcclxuICAgICAgLmVuZChmdW5jdGlvbihlcnJvciwgcmVzKSAge1xyXG4gICAgICAgIGlmICghZXJyb3IpIHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9ybWF0ID09IFwib3JpZ2luYWxcIikge1xyXG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmJvZHkuZGF0YSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdmFyIGZvcm1hdHRlZCA9IHJlcy5ib2R5LmRhdGEubWFwKGZ1bmN0aW9uKGZsaWdodCkgIHtyZXR1cm4gZmxpZ2h0c0FwaVRvSm91cm5leShmbGlnaHQpO30pO1xyXG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZm9ybWF0dGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy9Ub3RhbGx5IHdlaXJkIGVycm9yIGhhbmRsaW5nIGJ5IHN1cGVyYWdlbnRcclxuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBGbGlnaHRzQVBJKCk7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBKb3VybmV5ID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL2ZsaWdodHMvSm91cm5leS5qc3gnKTtcbnZhciBGbGlnaHQgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvZmxpZ2h0cy9GbGlnaHQuanN4Jyk7XG52YXIgVHJpcCA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9mbGlnaHRzL1RyaXAuanN4Jyk7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgb3V0Ym91bmRUcmlwID0gW107XG4gIHZhciBpbmJvdW5kVHJpcCA9IFtdO1xuXG4gIHZhciBqb3VybmV5ID0gbmV3IEpvdXJuZXkoe1xuICAgIGlkOiBvYmpbJ2lkJ10sXG4gICAgc291cmNlOiBvYmpbJ3NvdXJjZSddXG4gIH0pO1xuXG4gIGpvdXJuZXkgPSBqb3VybmV5LnNldEluKFsncHJpY2VzJywgJ2RlZmF1bHQnXSwgb2JqWydwcmljZSddKTtcblxuXG4gIG9iai5yb3V0ZS5mb3JFYWNoKGZ1bmN0aW9uKGZsaWdodE9iaikge1xuXG4gICAgdmFyIGZsaWdodCA9IG5ldyBGbGlnaHQoe1xuICAgICAgaWQ6IGZsaWdodE9ialsnaWQnXSxcbiAgICAgIG51bWJlcjogZmxpZ2h0T2JqWydmbGlnaHRfbm8nXSxcblxuICAgICAgLy9UT0RPIHRoaW5nIGFib3V0IHVzZSBvZiBQbGFjZSBhbmQgVGltZUluUGxhY2Ugb2JqZWN0c1xuICAgICAgZGVwYXJ0dXJlOiBJbW11dGFibGUuZnJvbUpTKHtcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICBpZDogZmxpZ2h0T2JqWydtYXBJZGZyb20nXSxcbiAgICAgICAgICBjb2RlOiBmbGlnaHRPYmpbJ2ZseUZyb20nXSxcbiAgICAgICAgICBuYW1lOiBmbGlnaHRPYmpbJ2NpdHlGcm9tJ10sXG4gICAgICAgICAgbGF0OiBmbGlnaHRPYmpbJ2xhdEZyb20nXSxcbiAgICAgICAgICBsbmc6IGZsaWdodE9ialsnbG5nRnJvbSddXG4gICAgICAgIH0sXG4gICAgICAgIHdoZW46IHtcbiAgICAgICAgICBsb2NhbDogbW9tZW50LnV0YyhmbGlnaHRPYmpbJ2RUaW1lJ10gKiAxMDAwKSxcbiAgICAgICAgICB1dGM6IG1vbWVudC51dGMoZmxpZ2h0T2JqWydkVGltZVVUQyddICogMTAwMClcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBhcnJpdmFsOiBJbW11dGFibGUuZnJvbUpTKHtcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICBpZDogZmxpZ2h0T2JqWydtYXBJZHRvJ10sXG4gICAgICAgICAgY29kZTogZmxpZ2h0T2JqWydmbHlUbyddLFxuICAgICAgICAgIG5hbWU6IGZsaWdodE9ialsnY2l0eVRvJ10sXG4gICAgICAgICAgbGF0OiBmbGlnaHRPYmpbJ2xhdFRvJ10sXG4gICAgICAgICAgbG5nOiBmbGlnaHRPYmpbJ2xuZ1RvJ11cbiAgICAgICAgfSxcbiAgICAgICAgd2hlbjoge1xuICAgICAgICAgIGxvY2FsOiBtb21lbnQudXRjKGZsaWdodE9ialsnYVRpbWUnXSAqIDEwMDApLFxuICAgICAgICAgIHV0YzogbW9tZW50LnV0YyhmbGlnaHRPYmpbJ2FUaW1lVVRDJ10gKiAxMDAwKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGFpcmxpbmU6IEltbXV0YWJsZS5mcm9tSlMoe1xuICAgICAgICBjb2RlOiBmbGlnaHRPYmpbJ2FpcmxpbmUnXVxuICAgICAgICAvL25hbWU6IGFpcmxpbmVzW2ZsaWdodE9ialsnYWlybGluZSddXSAmJiBhaXJsaW5lc1tmbGlnaHRPYmpbJ2FpcmxpbmUnXV0ubmFtZVxuICAgICAgfSlcbiAgICB9KTtcblxuICAgIHZhciBkaXJlY3Rpb24gPSBmbGlnaHRPYmpbJ3JldHVybiddP1wiaW5ib3VuZFwiOlwib3V0Ym91bmRcIjtcblxuICAgIGlmICgham91cm5leS5nZXQoJ3RyaXBzJykuZ2V0KGRpcmVjdGlvbikpIHtcbiAgICAgIGpvdXJuZXkgPSBqb3VybmV5LnNldEluKFsndHJpcHMnLGRpcmVjdGlvbl0sIG5ldyBUcmlwKCkpXG4gICAgfVxuICAgIGpvdXJuZXkgPSBqb3VybmV5LnVwZGF0ZUluKFsndHJpcHMnLCBkaXJlY3Rpb24sICdmbGlnaHRzJ10sIGZ1bmN0aW9uKGZsaWdodHMpICB7cmV0dXJuIGZsaWdodHMucHVzaChmbGlnaHQpO30pO1xuICB9KTtcblxuXG5cbiAgcmV0dXJuIGpvdXJuZXk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cclxuXHJcbi8qIHBhcnQgaXMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vSGFuc2UvcmVhY3QtY2FsZW5kYXIvYmxvYi9tYXN0ZXIvc3JjL2NhbGVuZGFyLmpzICovXHJcblxyXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcclxuXHJcblxyXG5cclxudmFyIENhbGVuZGFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyXCIsXHJcblxyXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3ZWVrT2Zmc2V0OiAwLFxyXG4gICAgICBsYW5nOiAnZW4nLFxyXG4gICAgICBmb3JjZVNpeFJvd3M6IHRydWVcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgZGF5TmFtZXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBkYXlOYW1lcyA9IFtdO1xyXG4gICAgdmFyIGRhdGUgPSB0aGlzLnByb3BzLmRhdGUuc3RhcnRPZignbW9udGgnKTtcclxuICAgIHZhciBkaWZmID0gZGF0ZS5pc29XZWVrZGF5KCkgLSB0aGlzLnByb3BzLndlZWtPZmZzZXQ7XHJcbiAgICBpZiAoZGlmZiA8IDApIGRpZmYgKz0gNztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICB2YXIgZGF5ID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIGktZGlmZisxKzddKTtcclxuICAgICAgZGF5TmFtZXMucHVzaChkYXkuZm9ybWF0KFwiZGRcIikpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRheU5hbWVzO1xyXG4gIH0sXHJcblxyXG4gIGRheXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRheXMgPSBbXTtcclxuICAgIHZhciBiZWdpbkRhdGUgPSB0aGlzLnByb3BzLmRhdGUuc3RhcnRPZignbW9udGgnKTtcclxuICAgIHZhciBkaWZmID0gYmVnaW5EYXRlLmlzb1dlZWtkYXkoKSAtIHRoaXMucHJvcHMud2Vla09mZnNldDtcclxuICAgIGlmIChkaWZmIDwgMCkgZGlmZiArPSA3O1xyXG5cclxuICAgIHZhciBpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaWZmOyBpKyspIHtcclxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgMV0pLnN1YnRyYWN0KChkaWZmLWkpLCAnZGF5cycpO1xyXG4gICAgICBkYXlzLnB1c2goe2RhdGU6IGRhdGUsIG90aGVyTW9udGg6ICdwcmV2LW1vbnRoJ30pO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBudW1iZXJPZkRheXMgPSBiZWdpbkRhdGUuZGF5c0luTW9udGgoKTtcclxuICAgIGZvciAoaSA9IDE7IGkgPD0gbnVtYmVyT2ZEYXlzOyBpKyspIHtcclxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgaV0pO1xyXG4gICAgICBkYXlzLnB1c2goe2RhdGU6IGRhdGV9KTtcclxuICAgIH1cclxuXHJcbiAgICBpID0gMTtcclxuICAgIHdoaWxlIChkYXlzLmxlbmd0aCAlIDcgIT09IDApIHtcclxuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgbnVtYmVyT2ZEYXlzXSkuYWRkKGksIFwiZGF5c1wiKTtcclxuICAgICAgZGF5cy5wdXNoKHtkYXRlOiBkYXRlLCBvdGhlck1vbnRoOiAnbmV4dC1tb250aCd9KTtcclxuICAgICAgaSsrO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnByb3BzLmZvcmNlU2l4Um93cyAmJiBkYXlzLmxlbmd0aCAhPT0gNDIpIHtcclxuICAgICAgdmFyIHN0YXJ0ID0gbW9tZW50LnV0YyhkYXlzW2RheXMubGVuZ3RoLTFdLmRhdGUpLmFkZCgxLCAnZGF5cycpO1xyXG4gICAgICB3aGlsZSAoZGF5cy5sZW5ndGggPCA0Mikge1xyXG4gICAgICAgIGRheXMucHVzaCh7ZGF0ZTogbW9tZW50LnV0YyhzdGFydCksIG90aGVyTW9udGg6ICduZXh0LW1vbnRoJ30pO1xyXG4gICAgICAgIHN0YXJ0LmFkZCgxLCAnZGF5cycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRheXM7XHJcbiAgfSxcclxuICBzcGxpdFRvV2Vla3M6IGZ1bmN0aW9uIChkYXlzKSB7XHJcbiAgICB2YXIgd2Vla3MgPSBbXTtcclxuICAgIHZhciBhY3R1YWxXZWVrID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaTxkYXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChpJTcgPT0gMCAmJiBpICE9IDApIHtcclxuICAgICAgICB3ZWVrcy5wdXNoKGFjdHVhbFdlZWspO1xyXG4gICAgICAgIGFjdHVhbFdlZWsgPSBbXTtcclxuICAgICAgfVxyXG4gICAgICBhY3R1YWxXZWVrLnB1c2goZGF5c1tpXSlcclxuICAgIH1cclxuICAgIHdlZWtzLnB1c2goYWN0dWFsV2Vlayk7XHJcbiAgICByZXR1cm4gd2Vla3M7XHJcbiAgfSxcclxuICByZW5kZXJXZWVrOiBmdW5jdGlvbiAod2Vlaykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIndlZWtcIn0sIFxyXG4gICAgICAgIHdlZWsubWFwKHRoaXMucmVuZGVyRGF5KVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfSxcclxuICByZW5kZXJEYXk6IGZ1bmN0aW9uKGRheSkge1xyXG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZ2V0RGF5KGRheS5kYXRlLCBkYXkub3RoZXJNb250aCk7XHJcbiAgfSxcclxuICByZW5kZXJEYXlOYW1lOiBmdW5jdGlvbiAoZGF5TmFtZSkge1xyXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogZGF5TmFtZSwgY2xhc3NOYW1lOiBcImRheS1uYW1lXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBkYXlOYW1lICkpO1xyXG4gIH0sXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciB3ZWVrcyA9IHRoaXMuc3BsaXRUb1dlZWtzKHRoaXMuZGF5cygpKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kclwifSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsbmRyLW1vbnRoXCJ9LCBcclxuICAgICAgICAgICB0aGlzLnByb3BzLmRhdGUuZm9ybWF0KFwiTU1NTSBZWVlZXCIpIFxyXG4gICAgICAgICksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kci1ncmlkXCJ9LCBcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJkYXktbmFtZXNcIn0sIFxyXG4gICAgICAgICAgICB0aGlzLmRheU5hbWVzKCkubWFwKHRoaXMucmVuZGVyRGF5TmFtZSlcclxuICAgICAgICAgICksIFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImRheXNcIn0sIFxyXG4gICAgICAgICAgICB3ZWVrcy5tYXAodGhpcy5yZW5kZXJXZWVrKVxyXG4gICAgICAgICAgKSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FsZW5kYXI7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIE1vZGFsUGlja2VyID0gcmVxdWlyZShcIi4vLi4vTW9kYWxQaWNrZXIuanN4XCIpO1xyXG52YXIgU2VhcmNoRGF0ZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCcpO1xyXG52YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9EYXRlUGlja2VyLmpzeCcpO1xyXG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xyXG52YXIgZGVlcG1lcmdlID0gcmVxdWlyZSgnZGVlcG1lcmdlJyk7XHJcblxyXG5cclxudmFyIGRlZmF1bHRPcHRpb25zID0ge1xyXG4gIGluaXRpYWxWYWx1ZTogbmV3IFNlYXJjaERhdGUoKSxcclxuICBvbkhpZGU6IGZ1bmN0aW9uKCkge30sXHJcbiAgYXBwZW5kVG9FbGVtZW50OiBkb2N1bWVudC5ib2R5LFxyXG4gIGxvY2FsZTogXCJlblwiLFxyXG4gIHNpemVzOiB7XHJcbiAgICBzaW5nbGU6IHt3aWR0aDogNDU0LCBoZWlnaHQ6IDIwMH0sXHJcbiAgICBpbnRlcnZhbDoge3dpZHRoOiA5MjQsIGhlaWdodDogMjAwLCB3aWR0aENvbXBhY3Q6IDQ1NH0sXHJcbiAgICBtb250aDoge3dpZHRoOiA1NTAsIGhlaWdodDogMjAwfSxcclxuICAgIHRpbWVUb1N0YXk6IHt3aWR0aDogNTUwLCBoZWlnaHQ6IDIwMH0sXHJcbiAgICBhbnl0aW1lOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9LFxyXG4gICAgbm9SZXR1cm46IHt3aWR0aDogMTY5LCBoZWlnaHQ6IDIwMH1cclxuICB9LFxyXG4gIG1vZGVzOiB7XHJcbiAgICBcInNpbmdsZVwiOiB7XHJcbiAgICAgIGNsb3NlQWZ0ZXI6IFwic2VsZWN0XCIsIC8vIHNlbGVjdFxyXG4gICAgICBmaW5pc2hBZnRlcjogXCJzZWxlY3RcIiAvLyBzZWxlY3RcclxuICAgIH0sXHJcbiAgICBcImludGVydmFsXCI6IHt9LFxyXG4gICAgXCJtb250aFwiOiB7fSxcclxuICAgIFwidGltZVRvU3RheVwiOiB7fSxcclxuICAgIFwiYW55dGltZVwiOiB7fSxcclxuICAgIFwibm9SZXR1cm5cIjoge31cclxuICB9XHJcbn07XHJcblxyXG52YXIgRGF0ZVBpY2tlck1vZGFsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkRhdGVQaWNrZXJNb2RhbFwiLFxyXG4gIGdldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLnByb3BzLm9wdGlvbnMpO1xyXG4gIH0sXHJcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBvcHRpb25zOiB7fVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbnRlbnRTaXplOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XHJcbiAgICB9O1xyXG4gIH0sXHJcbiAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XHJcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xyXG4gICAgaWYgKG9wdGlvbnMubW9kZXNbdmFsdWUubW9kZV0gJiYgb3B0aW9ucy5tb2Rlc1t2YWx1ZS5tb2RlXS5jbG9zZUFmdGVyID09IGNoYW5nZVR5cGUpIHtcclxuICAgICAgdGhpcy5wcm9wcy5vbkhpZGUoKTtcclxuICAgIH1cclxuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIGNoYW5nZVR5cGUpO1xyXG4gIH0sXHJcbiAgb25TaXplQ2hhbmdlOiBmdW5jdGlvbiAoc2l6ZXMpIHtcclxuICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICBjb250ZW50U2l6ZTogc2l6ZXNcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XHJcbiAgICBpZiAoIXRoaXMucHJvcHMuc2hvd24pIHtyZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNb2RhbFBpY2tlciwge2NvbnRlbnRTaXplOiB0aGlzLnN0YXRlLmNvbnRlbnRTaXplLCBpbnB1dEVsZW1lbnQ6IHRoaXMucHJvcHMuaW5wdXRFbGVtZW50LCBvbkhpZGU6IHRoaXMucHJvcHMub25IaWRlfSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChEYXRlUGlja2VyLCB7dmFsdWU6IHRoaXMucHJvcHMudmFsdWUsIHJlZjogXCJwbGFjZVBpY2tlclwiLCBvbkNoYW5nZTogdGhpcy5vblZhbHVlQ2hhbmdlLCBzaXplczogb3B0aW9ucy5zaXplcywgbW9kZXM6IG9wdGlvbnMubW9kZXMsIG9uU2l6ZUNoYW5nZTogdGhpcy5vblNpemVDaGFuZ2V9XHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEYXRlUGlja2VyTW9kYWw7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcblxyXG52YXIgQ2FsZW5kYXJEYXkgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiQ2FsZW5kYXJEYXlcIixcclxuXHJcbiAgb25PdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnByb3BzLm9uT3Zlcih0aGlzLnByb3BzLmRhdGUpXHJcbiAgfSxcclxuICBvblNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdCh0aGlzLnByb3BzLmRhdGUpXHJcbiAgfSxcclxuXHJcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRhdGU6IG51bGwsXHJcbiAgICAgIG90aGVyTW9udGg6ICcnXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGNsYXNzZXMgPSB0aGlzLnByb3BzLm90aGVyTW9udGg7XHJcbiAgICBpZiAoIWNsYXNzZXMpIHtcclxuICAgICAgY2xhc3NlcyA9IFwiXCI7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkge1xyXG4gICAgICBjbGFzc2VzICs9IFwiIGRpc2FibGVkXCI7XHJcbiAgICAgIHJldHVybiAoIC8vb25Nb3VzZUxlYXZlPXsgdGhpcy5wcm9wcy5vbkxlYXZlIH1cclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzZXMgfSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImRheS1udW1iZXJcIn0sIHRoaXMucHJvcHMuZGF0ZS5kYXRlKCkpXHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucHJvcHMub3RoZXIpIHtcclxuICAgICAgY2xhc3NlcyArPSBcIiBvdGhlclwiO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucHJvcHMub3Zlcikge1xyXG4gICAgICBjbGFzc2VzICs9IFwiIG92ZXJcIlxyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcclxuICAgICAgY2xhc3NlcyArPSBcIiBzZWxlY3RlZFwiXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKCAvL29uTW91c2VMZWF2ZT17IHRoaXMucHJvcHMub25MZWF2ZSB9XHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3Nlcywgb25Nb3VzZUVudGVyOiAgdGhpcy5vbk92ZXIsIG9uQ2xpY2s6ICB0aGlzLm9uU2VsZWN0fSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJkYXktbnVtYmVyXCJ9LCB0aGlzLnByb3BzLmRhdGUuZGF0ZSgpKVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbGVuZGFyRGF5O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XHJcblxyXG52YXIgQ2FsZW5kYXJEYXkgPSByZXF1aXJlKFwiLi9DYWxlbmRhckRheS5qc3hcIik7XHJcbnZhciBEYXlzSW5XZWVrID0gcmVxdWlyZShcIi4vU2VsZWN0RGF5c0luV2Vlay5qc3hcIik7XHJcbnZhciBDYWxlbmRhciA9IHJlcXVpcmUoXCIuLy4uLy4uL0NhbGVuZGFyLmpzeFwiKTtcclxudmFyIERhdGVUb29scyA9IHJlcXVpcmUoXCIuLy4uLy4uL0RhdGVUb29scy5qc1wiKTtcclxuXHJcbnZhciBDYWxlbmRhckZyYW1lID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyRnJhbWVcIixcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRhdGVPdmVyOiBudWxsLFxyXG4gICAgICB2aWV3RGF0ZTogbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pIHx8IG1vbWVudC51dGMoKVxyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICAgIGNhbGVuZGFyc051bWJlcjogMSxcclxuICAgICAgc2VsZWN0aW9uTW9kZTogXCJzaW5nbGVcIlxyXG5cclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgb25PdmVyOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgIGRhdGVPdmVyOiBkYXRlXHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvL1RPRE8gY2hlY2ggaWYgaXQgaXMgZ29vZCB0byBoYXZlIHRoaXMgc3RhdGUgaGVyZSwgb3IgaSBzaG91bGQgcHV0IGl0IHRvIERhdGVQaWNrZVxyXG4gIG5leHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgIHZpZXdEYXRlOiB0aGlzLnN0YXRlLnZpZXdEYXRlLmFkZCgxLCAnbW9udGhzJylcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIHByZXY6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgIHZpZXdEYXRlOiB0aGlzLnN0YXRlLnZpZXdEYXRlLnN1YnRyYWN0KDEsICdtb250aHMnKVxyXG4gICAgfSk7XHJcbiAgfSxcclxuXHJcbiAgc2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgY2hhbmdlVHlwZSkge1xyXG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSlcclxuICB9LFxyXG5cclxuICBvblNlbGVjdDogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJzaW5nbGVcIikge1xyXG4gICAgICAvL2lmIHNpbmdsZSBqdXN0IHNlbGVjdFxyXG4gICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcInNpbmdsZVwiLCBmcm9tOiBkYXRlLCB0bzogZGF0ZX0sXCJzZWxlY3RcIik7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSA9PSBcImludGVydmFsXCIpIHtcclxuICAgICAgLy9pZiBpbnRlcnZhbCBkZWNpZGUgb24gbW9kZVxyXG4gICAgICBpZiAoIXRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xyXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoe21vZGU6IFwiaW50ZXJ2YWxcIiwgZnJvbTogZGF0ZSwgdG86IG51bGwsIGZpbmFsOiBmYWxzZX0sXCJzZWxlY3RQYXJ0aWFsXCIpO1xyXG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnByb3BzLnZhbHVlLnRvKSB7XHJcbiAgICAgICAgLy9pZiBpcyBiZWZvcmUsIGp1c3QgcHV0IHN0YXJ0IGRhdGUgYWdhaW5cclxuICAgICAgICBpZiAoZGF0ZSA8IHRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xyXG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSh7bW9kZTogXCJpbnRlcnZhbFwiLCBmcm9tOiBkYXRlLCB0bzogbnVsbCwgZmluYWw6IGZhbHNlfSxcInNlbGVjdFBhcnRpYWxcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoe21vZGU6IFwiaW50ZXJ2YWxcIiwgZnJvbTogbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pLCB0bzogZGF0ZX0sXCJzZWxlY3RcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBpZiBpIGhhdmUgY2hvc2VuIGJvdGggaSBzdGFydCB0byBwaWNrIG5ldyBvbmVcclxuICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IGRhdGUsIHRvOiBudWxsLCBmaW5hbDogZmFsc2V9LFwic2VsZWN0UGFydGlhbFwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGlzU2VsZWN0ZWQ6IGZ1bmN0aW9uIChkYXRlKSB7XHJcbiAgICBpZiAoIXRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJzaW5nbGVcIikge1xyXG4gICAgICByZXR1cm4gZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA9PSBtb21lbnQudXRjKHRoaXMucHJvcHMudmFsdWUuZnJvbSkuZm9ybWF0KFwiWVlZWU1NRERcIik7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSA9PSBcImludGVydmFsXCIpIHtcclxuICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWUudG8pIHtcclxuICAgICAgICByZXR1cm4gZGF0ZSA+PSB0aGlzLnByb3BzLnZhbHVlLmZyb20gJiYgZGF0ZSA8PSB0aGlzLnByb3BzLnZhbHVlLnRvO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpID09IG1vbWVudC51dGModGhpcy5wcm9wcy52YWx1ZS5mcm9tKS5mb3JtYXQoXCJZWVlZTU1ERFwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGlzT3ZlcjogZnVuY3Rpb24gKGRhdGUpIHtcclxuICAgIGlmICghdGhpcy5zdGF0ZS5kYXRlT3Zlcikge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJpbnRlcnZhbFwiKSB7XHJcbiAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLmZyb20gJiYgIXRoaXMucHJvcHMudmFsdWUudG8pIHtcclxuICAgICAgICByZXR1cm4gZGF0ZSA+PSB0aGlzLnByb3BzLnZhbHVlLmZyb20gJiYgZGF0ZSA8PSB0aGlzLnN0YXRlLmRhdGVPdmVyO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRhdGVPdmVyLmZvcm1hdChcIllZWVlNTUREXCIpID09IGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIik7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRhdGVPdmVyLmZvcm1hdChcIllZWVlNTUREXCIpID09IGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIik7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZ2V0RGF5OiBmdW5jdGlvbiAoZGF0ZSwgb3RoZXJNb250aCkge1xyXG4gICAgdmFyIG90aGVyID0gZmFsc2U7XHJcbiAgICB2YXIgZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIGlmICh0aGlzLnByb3BzLm1pblZhbHVlICYmIGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIikgPD0gdGhpcy5wcm9wcy5taW5WYWx1ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSkge1xyXG4gICAgICBvdGhlciA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAoZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA8PSBtb21lbnQoKS5mb3JtYXQoXCJZWVlZTU1ERFwiKSkge1xyXG4gICAgICBkaXNhYmxlZCA9IHRydWU7IC8vVE9ETyBzaG91bGQgYmUgcHJvYmFibHkgZGVmaW5lZCBzb21ld2hlcmUgbW9yZSBvdXRzaWRlXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRGF5LCB7XHJcbiAgICAgICAga2V5OiBkYXRlLnZhbHVlT2YoKSwgXHJcbiAgICAgICAgZGF0ZTogZGF0ZSwgXHJcbiAgICAgICAgb3RoZXJNb250aDogb3RoZXJNb250aCwgXHJcbiAgICAgICAgb25PdmVyOiB0aGlzLm9uT3ZlciwgXHJcbiAgICAgICAgb25TZWxlY3Q6IHRoaXMub25TZWxlY3QsIFxyXG4gICAgICAgIHNlbGVjdGVkOiB0aGlzLmlzU2VsZWN0ZWQoZGF0ZSksIFxyXG4gICAgICAgIG92ZXI6IHRoaXMuaXNPdmVyKGRhdGUpLCBcclxuICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQsIFxyXG4gICAgICAgIG90aGVyOiBvdGhlcn1cclxuICAgICAgICApXHJcbiAgICApO1xyXG4gIH0sXHJcbiAgcmVuZGVyUHJldjogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUudmlld0RhdGUuc3VidHJhY3QoMSwgJ21vbnRocycpLmZvcm1hdChcIllZWVlNTVwiKSA8IG1vbWVudC51dGMoKS5mb3JtYXQoXCJZWVlZTU1cIikpXHJcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByZXYgZGlzYWJsZWRcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpKTtcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJldlwiLCBvbkNsaWNrOiB0aGlzLnByZXZ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XHJcbiAgfSxcclxuICByZW5kZXJOZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS52aWV3RGF0ZS5hZGQoMSwgJ21vbnRocycpLmZvcm1hdChcIllZWVlNTVwiKSA+IG1vbWVudC51dGMoKS5hZGQoNiwnbW9udGhzJykuZm9ybWF0KFwiWVlZWU1NXCIpKVxyXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJuZXh0IGRpc2FibGVkXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm5leHRcIiwgb25DbGljazogdGhpcy5uZXh0fSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSkpO1xyXG4gIH0sXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICB2YXIgY2FsZW5kYXJEYXRlcyA9IFtdO1xyXG4gICAgdmFyIGluaXRpYWxEYXRlID0gbW9tZW50LnV0Yyh0aGlzLnN0YXRlLnZpZXdEYXRlKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wcm9wcy5jYWxlbmRhcnNOdW1iZXI7ICsraSkge1xyXG4gICAgICBjYWxlbmRhckRhdGVzLnB1c2goIG1vbWVudC51dGMoaW5pdGlhbERhdGUpICk7XHJcbiAgICAgIGluaXRpYWxEYXRlLmFkZCgxLFwibW9udGhcIilcclxuICAgIH1cclxuICAgIHZhciBqID0gMDtcclxuICAgIHZhciBjYWxlbmRhcnMgPSBjYWxlbmRhckRhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgICBqKys7XHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7a2V5OiBkYXRlLnZhbHVlT2YoKSwgY2xhc3NOYW1lOiAnY2FsZW5kYXItdmlldyBjYWxlbmRhci12aWV3LScran0sIFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYWxlbmRhciwge2RhdGU6IGRhdGUsIGdldERheTogc2VsZi5nZXREYXksIHdlZWtPZmZzZXQ6IERhdGVUb29scy5maXJzdERheU9mV2VlaygpfSlcclxuICAgICAgICApXHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXHJcbiAgICAgICAgIHRoaXMucmVuZGVyUHJldigpLCBcclxuICAgICAgICBjYWxlbmRhcnMsIFxyXG4gICAgICAgICB0aGlzLnJlbmRlck5leHQoKSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsZWFyLWJvdGhcIn0pXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDYWxlbmRhckZyYW1lO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XHJcbnZhciBNb2RhbE1lbnVNaXhpbiA9IHJlcXVpcmUoJy4vLi4vLi4vTW9kYWxNZW51TWl4aW4uanN4Jyk7XHJcbnZhciBDYWxlbmRhckZyYW1lID0gcmVxdWlyZSgnLi9DYWxlbmRhckZyYW1lLmpzeCcpO1xyXG52YXIgTW9udGhNYXRyaXggPSByZXF1aXJlKFwiLi9Nb250aE1hdHJpeC5qc3hcIik7XHJcbnZhciBTbGlkZXIgPSByZXF1aXJlKCcuL1NsaWRlci5qcycpO1xyXG52YXIgdHIgPSByZXF1aXJlKCcuLy4uLy4uL3RyLmpzJyk7XHJcbnZhciBUcmFuID0gcmVxdWlyZSgnLi8uLi8uLi9UcmFuLmpzeCcpO1xyXG52YXIgaXNJRSA9IHJlcXVpcmUoJy4vLi4vLi4vdG9vbHMvaXNJRS5qcycpO1xyXG5cclxuXHJcblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKTtcclxuXHJcbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XHJcblxyXG52YXIgSGFuZGxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkhhbmRsZVwiLFxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiaGFuZGxlXCJ9LCBcclxuICAgICAgICB0aGlzLnByb3BzLnNsaWRlclZhbHVlXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkRhdGVQaWNrZXJcIixcclxuICBtaXhpbnM6IFtNb2RhbE1lbnVNaXhpbl0sXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlID8gdGhpcy5wcm9wcy52YWx1ZSA6IG5ldyBTZWFyY2hEYXRlKCksXHJcbiAgICAgIHZpZXdNb2RlOiB0aGlzLnByb3BzLnZhbHVlID8gdGhpcy5wcm9wcy52YWx1ZS5tb2RlIDogXCJzaW5nbGVcIlxyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICAgIGRlZmF1bHRNb2RlOiBcInNpbmdsZVwiLFxyXG4gICAgICBsYW5nOiAnZW4nLFxyXG4gICAgICBtaW5WYWx1ZTogbnVsbFxyXG4gICAgfTtcclxuICB9LFxyXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XHJcbiAgICB0aGlzLnByb3BzLm9uU2l6ZUNoYW5nZSh0aGlzLnByb3BzLnNpemVzW21vZGVdKTtcclxuICB9LFxyXG4gIGdldE1vZGVMYWJlbDogZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgIHZhciBtb2RlTGFiZWxzID0ge1xyXG4gICAgICBzaW5nbGU6IHRyKFwiU3BlY2lmaWNcIixcInNwZWNpZmljXCIpLFxyXG4gICAgICBpbnRlcnZhbDogdHIoXCJJbnRlcnZhbFwiLFwiaW50ZXJ2YWxcIiksXHJcbiAgICAgIG1vbnRoOiB0cihcIk1vbnRoc1wiLFwibW9udGhzXCIpLFxyXG4gICAgICB0aW1lVG9TdGF5OiB0cihcIlRpbWUgdG8gc3RheVwiLFwidGltZV90b19zdGF5XCIpLFxyXG4gICAgICBhbnl0aW1lOiB0cihcIkFueXRpbWVcIixcImFueXRpbWVcIiksXHJcbiAgICAgIG5vUmV0dXJuOiB0cihcIk5vIHJldHVyblwiLFwibm9fcmV0dXJuXCIpXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG1vZGVMYWJlbHNbbW9kZV07XHJcbiAgfSxcclxuXHJcbiAgc3dpdGNoTW9kZVRvRnVuYzogZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHZhciBuZXdWYWx1ZTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHN3aXRjaChtb2RlKSB7XHJcbiAgICAgICAgY2FzZSBcInRpbWVUb1N0YXlcIjpcclxuICAgICAgICAgIHNlbGYuY2hhbmdlVmFsdWUoc2VsZi5nZXRWYWx1ZSgpLmVkaXQoe21vZGU6IG1vZGV9KSwgXCJyZWxlYXNlXCIpOyAvLyBzaG91bGQgYnkgc29tZXRoaW5nIGxpa2UgY2hhbmdlIG1vZGUsIGJ1dCBpdCBmaW5pc2hlcyB2YWx1ZSBvbmx5IGFmdGVyIHJlbGVhc2Ugc28gVE9ETyBtYWtlIGl0IHNtYXJ0ZXJcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIFwiYW55dGltZVwiOlxyXG4gICAgICAgIGNhc2UgXCJub1JldHVyblwiOlxyXG4gICAgICAgICAgc2VsZi5jaGFuZ2VWYWx1ZShzZWxmLmdldFZhbHVlKCkuZWRpdCh7bW9kZTogbW9kZX0pLCBcInNlbGVjdFwiKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGYucHJvcHMub25TaXplQ2hhbmdlKHNlbGYucHJvcHMuc2l6ZXNbbW9kZV0pO1xyXG4gICAgICBzZWxmLnNldFN0YXRlKHtcclxuICAgICAgICB2aWV3TW9kZTogbW9kZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjaGFuZ2VWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLGNoYW5nZVR5cGUpIHtcclxuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5lZGl0KHZhbHVlKTtcclxuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsY2hhbmdlVHlwZSk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0VmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLnByb3BzLnZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIHNldE1vbnRoOiBmdW5jdGlvbiAoZGF0ZSkge1xyXG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh7XHJcbiAgICAgIG1vZGU6IFwibW9udGhcIixcclxuICAgICAgZnJvbTogbW9tZW50LnV0YyhkYXRlKS5zdGFydE9mKCdtb250aCcpLFxyXG4gICAgICB0bzogbW9tZW50LnV0YyhkYXRlKS5lbmRPZignbW9udGgnKVxyXG4gICAgfSxcInNlbGVjdFwiKTtcclxuICB9LFxyXG5cclxuICBjaGFuZ2VNaW5TdGF5RGF5czogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUgPiB0aGlzLmdldFZhbHVlKCkubWF4U3RheURheXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh7XHJcbiAgICAgIG1vZGU6IFwidGltZVRvU3RheVwiLFxyXG4gICAgICBtaW5TdGF5RGF5czogdmFsdWUsXHJcbiAgICAgIG1heFN0YXlEYXlzOiB0aGlzLmdldFZhbHVlKCkubWF4U3RheURheXNcclxuICAgIH0sIFwiZHJhZ2dlZFwiKTtcclxuICB9LFxyXG5cclxuICBjaGFuZ2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICBpZiAodmFsdWUgPCB0aGlzLmdldFZhbHVlKCkubWluU3RheURheXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh7XHJcbiAgICAgIG1vZGU6IFwidGltZVRvU3RheVwiLFxyXG4gICAgICBtaW5TdGF5RGF5czogdGhpcy5nZXRWYWx1ZSgpLm1pblN0YXlEYXlzLFxyXG4gICAgICBtYXhTdGF5RGF5czogdmFsdWVcclxuICAgIH0sIFwiZHJhZ2dlZFwiKTtcclxuICB9LFxyXG5cclxuICByZWxlYXNlTWluU3RheURheXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIGRvIG5vdCBjaGFuZ2UgdmFsdWUsIGJ1dCB0cmlnZ2VyIGl0IHdpdGggZGlmZmVyZW50IGNoYW5nZSB0eXBlXHJcbiAgICB0aGlzLmNoYW5nZVZhbHVlKG51bGwsIFwicmVsZWFzZVwiKTtcclxuICB9LFxyXG4gIHJlbGVhc2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5jaGFuZ2VWYWx1ZShudWxsLCBcInJlbGVhc2VcIik7XHJcbiAgfSxcclxuXHJcbiAgY29uZmlybVRpbWVUb1N0YXk6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuY2hhbmdlVmFsdWUodGhpcy5wcm9wcy52YWx1ZSwgXCJzZWxlY3RcIik7XHJcbiAgfSxcclxuXHJcblxyXG4gIHJlbmRlclNpbmdsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYWxlbmRhckZyYW1lLCB7b25DaGFuZ2U6IHRoaXMuY2hhbmdlVmFsdWUsIHZhbHVlOiB0aGlzLmdldFZhbHVlKCksIG1pblZhbHVlOiB0aGlzLnByb3BzLm1pblZhbHVlLCBzZWxlY3Rpb25Nb2RlOiBcInNpbmdsZVwiLCBjYWxlbmRhcnNOdW1iZXI6IDF9KVxyXG4gICAgKVxyXG4gIH0sXHJcbiAgcmVuZGVySW50ZXJ2YWw6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FsZW5kYXJGcmFtZSwge29uQ2hhbmdlOiB0aGlzLmNoYW5nZVZhbHVlLCB2YWx1ZTogdGhpcy5nZXRWYWx1ZSgpLCBtaW5WYWx1ZTogdGhpcy5wcm9wcy5taW5WYWx1ZSwgc2VsZWN0aW9uTW9kZTogXCJpbnRlcnZhbFwiLCBjYWxlbmRhcnNOdW1iZXI6IDN9KVxyXG4gICAgKVxyXG4gIH0sXHJcbiAgcmVuZGVyTW9udGg6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChNb250aE1hdHJpeCwge21pblZhbHVlOiB0aGlzLnByb3BzLm1pblZhbHVlLCBvblNldDogdGhpcy5zZXRNb250aCwgdG90YWxNb250aHM6IFwiNlwifSkpO1xyXG4gIH0sXHJcbiAgcmVuZGVyVGltZVRvU3RheTogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGhlYWRsaW5lID0gdHIoXCJTdGF5IHRpbWUgZnJvbSAlcyB0byAlcyBkYXlzLlwiLCBcInN0YXlfdGltZV9mcm9tXCIsIFt0aGlzLmdldFZhbHVlKCkubWluU3RheURheXMsIHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5c10gKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJ0aW1lLXRvLXN0YXlcIn0sIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb250ZW50LWhlYWRsaW5lXCJ9LCBoZWFkbGluZSksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNaW5TdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWluU3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWluIGhvcml6b250YWwtc2xpZGVyXCJ9LCBcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSGFuZGxlLCBudWxsKVxyXG4gICAgICAgICksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNYXhTdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWF4U3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWF4IGhvcml6b250YWwtc2xpZGVyXCJ9LCBcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSGFuZGxlLCBudWxsKVxyXG4gICAgICAgICksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzbGlkZXItYXhlXCJ9KSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImJ0biBjb25maXJtLXRpbWUtdG8tc3RheS1idXR0b25cIiwgb25DbGljazogdGhpcy5jb25maXJtVGltZVRvU3RheX0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbiwge3RLZXk6IFwib2tcIn0sIFwiT0tcIikpXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfSxcclxuICByZW5kZXJBbnl0aW1lOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBcIlwiO1xyXG4gIH0sXHJcbiAgcmVuZGVyTm9SZXR1cm46IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIFwiXCI7XHJcbiAgfSxcclxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG1vZGUgPSB0aGlzLnN0YXRlLnZpZXdNb2RlO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAnc2VhcmNoLWRhdGUtcGlja2VyIHNlYXJjaC1waWNrZXIgJyttb2RlfSwgXHJcbiAgICAgICAgIHRoaXMucmVuZGVyTWVudSgpLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY29udGVudFwifSwgXHJcbiAgICAgICAgICAgdGhpcy5yZW5kZXJCb2R5KCkgXHJcbiAgICAgICAgKSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsZWFyLWJvdGhcIn0pXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXHJcblxyXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcclxudmFyIFRyYW4gPSByZXF1aXJlKCcuLy4uLy4uL1RyYW4uanN4Jyk7XHJcblxyXG52YXIgTW9udGhNYXRyaXggPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiTW9udGhNYXRyaXhcIixcclxuXHJcbiAgc2V0TW9udGg6IGZ1bmN0aW9uIChtb250aCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgc2VsZi5wcm9wcy5vblNldChtb250aCk7XHJcbiAgICB9XHJcbiAgfSxcclxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdmFyIG1vbnRocyA9IFtdO1xyXG4gICAgdmFyIGlNb250aCA9IG1vbWVudC51dGMoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyc2VJbnQoc2VsZi5wcm9wcy50b3RhbE1vbnRocywxMCk7IGkrKykge1xyXG4gICAgICBtb250aHMucHVzaCggbW9tZW50LnV0YyhpTW9udGgpICk7XHJcbiAgICAgIGlNb250aC5hZGQoMSwgXCJtb250aHNcIik7XHJcbiAgICB9XHJcbiAgICB2YXIgbW9udGhzRWxlbWVudHMgPSBtb250aHMubWFwKGZ1bmN0aW9uIChtb250aCkge1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogbW9udGgudmFsdWVPZigpLCBjbGFzc05hbWU6IFwibW9udGgtb3B0aW9uXCIsIG9uQ2xpY2s6IHNlbGYuc2V0TW9udGgobW9udGgpfSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcIm1vbnRoLW5hbWVcIn0sIFxyXG4gICAgICAgICAgICAgbW9udGguZm9ybWF0KFwiTU1NTVwiKSBcclxuICAgICAgICAgICksIFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJyXCIsIG51bGwpLCBcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwibW9udGgteWVhclwifSwgXHJcbiAgICAgICAgICAgICBtb250aC5mb3JtYXQoXCJZWVlZXCIpIFxyXG4gICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiAoIC8vb25Nb3VzZUxlYXZlPXsgdGhpcy5wcm9wcy5vbkxlYXZlIH1cclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vbnRoLW1hdHJpeFwifSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnQtaGVhZGxpbmVcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbiwge3RLZXk6IFwic2VsZWN0X21vbnRoXCJ9LCBcIlNlbGVjdCBtb250aFwiKSksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb250aHNcIn0sIFxyXG4gICAgICAgICAgbW9udGhzRWxlbWVudHNcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9udGhNYXRyaXg7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXHJcblxyXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIFRyYW4gPSByZXF1aXJlKCcuLy4uLy4uL1RyYW4uanN4Jyk7XHJcblxyXG52YXIgU2VsZWN0RGF5c0luV2VlayA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJTZWxlY3REYXlzSW5XZWVrXCIsXHJcblxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gKCAvL29uTW91c2VMZWF2ZT17IHRoaXMucHJvcHMub25MZWF2ZSB9XHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCBudWxsLCBcbiAgICAgICAgXCJUdWVcIiwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7dHlwZTogXCJjaGVja2JveFwiLCBuYW1lOiBcImZseURheXNbXVwiLCB2YWx1ZTogXCIyXCIsIGNoZWNrZWQ6IFwiXFxcImNoZWNrZWRcXFwiXCJ9KSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbClcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3REYXlzSW5XZWVrO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKFsncmVhY3QnXSwgZmFjdG9yeSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIC8vVE9ETyBnZXQgaXQgYmFjayB3aGVuIHJlcXVpcmUgZnJvbSBhbm90aGVyIGJ1bmRsZSB3aWxsIHdvcmtcclxuICAgIC8vbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3JlYWN0JykpO1xyXG4gICAgbW9kdWxlLmV4cG9ydHM9ZmFjdG9yeSh3aW5kb3cuUmVhY3QpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByb290LlJlYWN0U2xpZGVyID0gZmFjdG9yeShyb290LlJlYWN0KTtcclxuICB9XHJcbn0odGhpcywgZnVuY3Rpb24oUmVhY3QpIHtcclxuXHJcbiAgdmFyIFJlYWN0U2xpZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3MoeyBkaXNwbGF5TmFtZTogJ1JlYWN0U2xpZGVyJyxcclxuXHJcbiAgICBwcm9wVHlwZXM6IHtcclxuICAgICAgbWluVmFsdWU6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXHJcbiAgICAgIG1heFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBzdGVwOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBvcmllbnRhdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsnaG9yaXpvbnRhbCcsICd2ZXJ0aWNhbCddKSxcclxuICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICBvblJlbGVhc2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICB2YWx1ZVByb3BOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXHJcbiAgICB9LFxyXG5cclxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbWluVmFsdWU6IDAsXHJcbiAgICAgICAgbWF4VmFsdWU6IDEwMCxcclxuICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICBzdGVwOiAxLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgICAgdmFsdWVQcm9wTmFtZTogJ3NsaWRlclZhbHVlJ1xyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIG1vdW50ZWQ6IHRydWVcclxuICAgICAgfSlcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBtb3VudGVkOiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRQb3NpdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCF0aGlzLnN0YXRlLm1vdW50ZWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdXBwZXJCb3VuZDogMCxcclxuICAgICAgICAgIGhhbmRsZVdpZHRoOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWluOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWF4OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgc2xpZGVyID0gdGhpcy5yZWZzLnNsaWRlci5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHZhciBoYW5kbGUgPSB0aGlzLnJlZnMuaGFuZGxlLmdldERPTU5vZGUoKTtcclxuICAgICAgdmFyIHJlY3QgPSBzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICB2YXIgc2l6ZSA9IHtcclxuICAgICAgICBob3Jpem9udGFsOiAnY2xpZW50V2lkdGgnLFxyXG4gICAgICAgIHZlcnRpY2FsOiAnY2xpZW50SGVpZ2h0J1xyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG5cclxuICAgICAgdmFyIHBvc2l0aW9uID0ge1xyXG4gICAgICAgIGhvcml6b250YWw6IHsgbWluOiAnbGVmdCcsIG1heDogJ3JpZ2h0JyB9LFxyXG4gICAgICAgIHZlcnRpY2FsOiB7IG1pbjogJ3RvcCcsIG1heDogJ2JvdHRvbScgfVxyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG4gICAgICB2YXIgdXBwZXJCb3VuZCA9IHNsaWRlcltzaXplXSAtIGhhbmRsZVtzaXplXTtcclxuXHJcbiAgICAgIHRoaXMuY2FjaGVkUG9zaXRpb25zID0ge1xyXG4gICAgICAgIHVwcGVyQm91bmQ6IHVwcGVyQm91bmQsXHJcbiAgICAgICAgaGFuZGxlV2lkdGg6IGhhbmRsZVtzaXplXSxcclxuICAgICAgICBzbGlkZXJNaW46IHJlY3RbcG9zaXRpb24ubWluXSxcclxuICAgICAgICBzbGlkZXJNYXg6IHJlY3RbcG9zaXRpb24ubWF4XSAtIGhhbmRsZVtzaXplXVxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gdGhpcy5jYWNoZWRQb3NpdGlvbnM7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE9mZnNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcmF0aW8gPSAodGhpcy5wcm9wcy52YWx1ZSAtIHRoaXMucHJvcHMubWluVmFsdWUpIC8gKHRoaXMucHJvcHMubWF4VmFsdWUgLSB0aGlzLnByb3BzLm1pblZhbHVlKTtcclxuICAgICAgcmV0dXJuIHJhdGlvICogdGhpcy5nZXRQb3NpdGlvbnMoKS51cHBlckJvdW5kO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgaGFuZGxlU3R5bGUgPSB7XHJcbiAgICAgICAgLy90cmFuc2Zvcm06ICd0cmFuc2xhdGUnICsgdGhpcy5fYXhpcygpICsgJygnICsgICsgJ3B4KScsXHJcbiAgICAgICAgbWFyZ2luTGVmdDogdGhpcy5nZXRPZmZzZXQoKSArICdweCcsXHJcbiAgICAgICAgLy8gbGV0IHRoaXMgZWxlbWVudCBiZSB0aGUgc2FtZSBzaXplIGFzIGl0cyBjaGlsZHJlbi5cclxuICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgdmFyIHVzZXJIYW5kbGUgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xyXG4gICAgICB1c2VySGFuZGxlLnByb3BzW3RoaXMucHJvcHMudmFsdWVQcm9wTmFtZV0gPSB0aGlzLnByb3BzLnZhbHVlO1xyXG5cclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBSZWFjdC5ET00uZGl2KHsgcmVmOiAnc2xpZGVyJywgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5fb25DbGljayB9LFxyXG4gICAgICAgICAgUmVhY3QuRE9NLmRpdih7IHJlZjogJ2hhbmRsZScsIHN0eWxlOiBoYW5kbGVTdHlsZSwgb25Nb3VzZURvd246IHRoaXMuX2RyYWdTdGFydCwgb25Ub3VjaE1vdmU6IHRoaXMuX3RvdWNoTW92ZSB9LFxyXG4gICAgICAgICAgICB1c2VySGFuZGxlXHJcbiAgICAgICAgICApKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsaWNrOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IGVbJ3BhZ2UnICsgdGhpcy5fYXhpcygpXTtcclxuICAgICAgdGhpcy5fbW92ZUhhbmRsZShwb3NpdGlvbik7XHJcbiAgICB9LFxyXG5cclxuICAgIF9kcmFnU3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9kcmFnTW92ZSwgZmFsc2UpO1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fZHJhZ0VuZCwgZmFsc2UpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfZHJhZ01vdmU6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gZVsncGFnZScgKyB0aGlzLl9heGlzKCldO1xyXG4gICAgICB0aGlzLl9tb3ZlSGFuZGxlKHBvc2l0aW9uKTtcclxuICAgIH0sXHJcblxyXG4gICAgX2RyYWdFbmQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9kcmFnTW92ZSwgZmFsc2UpO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fZHJhZ0VuZCwgZmFsc2UpO1xyXG4gICAgICB0aGlzLnByb3BzLm9uUmVsZWFzZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBfdG91Y2hNb3ZlOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHZhciBsYXN0ID0gZS5jaGFuZ2VkVG91Y2hlc1tlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBsYXN0WydwYWdlJyArIHRoaXMuX2F4aXMoKV07XHJcbiAgICAgIHRoaXMuX21vdmVIYW5kbGUocG9zaXRpb24pO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9tb3ZlSGFuZGxlOiBmdW5jdGlvbihwb3NpdGlvbikge1xyXG5cclxuICAgICAgLy8gbWFrZSBjZW50ZXIgb2YgaGFuZGxlIGFwcGVhciB1bmRlciB0aGUgY3Vyc29yIHBvc2l0aW9uXHJcbiAgICAgIHZhciBwb3NpdGlvbnMgPSB0aGlzLmdldFBvc2l0aW9ucygpO1xyXG4gICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIC0gKHBvc2l0aW9ucy5oYW5kbGVXaWR0aCAvIDIpO1xyXG5cclxuICAgICAgdmFyIGxhc3RWYWx1ZSA9IHRoaXMucHJvcHMudmFsdWU7XHJcblxyXG4gICAgICB2YXIgcmF0aW8gPSAocG9zaXRpb24gLSBwb3NpdGlvbnMuc2xpZGVyTWluKSAvIChwb3NpdGlvbnMuc2xpZGVyTWF4IC0gcG9zaXRpb25zLnNsaWRlck1pbik7XHJcbiAgICAgIHZhciB2YWx1ZSA9IHJhdGlvICogKHRoaXMucHJvcHMubWF4VmFsdWUgLSB0aGlzLnByb3BzLm1pblZhbHVlKSArIHRoaXMucHJvcHMubWluVmFsdWU7XHJcblxyXG4gICAgICB2YXIgbmV4dFZhbHVlID0gdGhpcy5fdHJpbUFsaWduVmFsdWUodmFsdWUpO1xyXG5cclxuICAgICAgdmFyIGNoYW5nZWQgPSBuZXh0VmFsdWUgIT09IGxhc3RWYWx1ZTtcclxuXHJcbiAgICAgIGlmIChjaGFuZ2VkICYmIHRoaXMucHJvcHMub25DaGFuZ2UpIHtcclxuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5leHRWYWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgX2F4aXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgICdob3Jpem9udGFsJzogJ1gnLFxyXG4gICAgICAgICd2ZXJ0aWNhbCc6ICdZJ1xyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG4gICAgfSxcclxuXHJcbiAgICBfdHJpbUFsaWduVmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICBpZiAodmFsIDw9IHRoaXMucHJvcHMubWluVmFsdWUpIHZhbCA9IHRoaXMucHJvcHMubWluVmFsdWU7XHJcbiAgICAgIGlmICh2YWwgPj0gdGhpcy5wcm9wcy5tYXhWYWx1ZSkgdmFsID0gdGhpcy5wcm9wcy5tYXhWYWx1ZTtcclxuXHJcbiAgICAgIHZhciB2YWxNb2RTdGVwID0gKHZhbCAtIHRoaXMucHJvcHMubWluVmFsdWUpICUgdGhpcy5wcm9wcy5zdGVwO1xyXG4gICAgICB2YXIgYWxpZ25WYWx1ZSA9IHZhbCAtIHZhbE1vZFN0ZXA7XHJcblxyXG4gICAgICBpZiAoTWF0aC5hYnModmFsTW9kU3RlcCkgKiAyID49IHRoaXMucHJvcHMuc3RlcCkge1xyXG4gICAgICAgIGFsaWduVmFsdWUgKz0gKHZhbE1vZFN0ZXAgPiAwKSA/IHRoaXMucHJvcHMuc3RlcCA6ICgtIHRoaXMucHJvcHMuc3RlcCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KGFsaWduVmFsdWUudG9GaXhlZCg1KSk7XHJcbiAgICB9XHJcblxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gUmVhY3RTbGlkZXI7XHJcblxyXG59KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLypcclxuICBUb29scyBmb3IgbWFuaXB1bGF0aW5nIHdpdGggZGF0ZXNcclxuICBzb21lIG9mIHRoZW0gYXJlIGR1cGxpY2l0aWVzIHRvIG1vbWVudCdzIGZ1bmN0aW9ucywgYnV0IHRoZXkgY2FuIGJlIHVzZWQgYXMgZmFzdGVyIGFsdGVybmF0aXZlc1xyXG4gKi9cclxuXHJcblxyXG52YXIgcGFkID0gZnVuY3Rpb24obnVtLCBzaXplKSB7XHJcbiAgdmFyIHMgPSBudW0gKyBcIlwiO1xyXG4gIHdoaWxlIChzLmxlbmd0aCA8IHNpemUpIHtcclxuICAgIHMgPSBcIjBcIiArIHM7XHJcbiAgfVxyXG4gIHJldHVybiBzO1xyXG59O1xyXG5cclxudmFyIERhdGVUb29scyA9IHtcclxuICB0b2RheTogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcclxuICB9LFxyXG4gIGluSGFsZkFuWWVhcjogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLnNldE1vbnRoKG5ldyBEYXRlKCkuZ2V0TW9udGgoKSArIDYpKTtcclxuICB9LFxyXG4gIGZpcnN0RGF5OiBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xyXG4gIH0sXHJcbiAgbGFzdERheTogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCk7XHJcbiAgfSxcclxuICBmb3JtYXRTUEFwaURhdGU6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgIHJldHVybiBwYWQoZGF0ZS5nZXREYXRlKCksIDIpICsgXCIvXCIgKyBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSwgMikgKyBcIi9cIiArIGRhdGUuZ2V0RnVsbFllYXIoKTtcclxuICB9LFxyXG4gIGZvcm1hdFdBRGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIFwiLVwiICsgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEsIDIpICsgXCItXCIgKyBwYWQoZGF0ZS5nZXREYXRlKCksIDIpO1xyXG4gIH1cclxufTtcclxuXHJcblxyXG5EYXRlVG9vbHMuZmlyc3REYXlPZldlZWsgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gbW9tZW50LmxvY2FsZURhdGEoKS5fd2Vlay5kb3c7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVUb29scztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgTGF0TG9uID0gcmVxdWlyZSgnLi90b29scy9sYXRsb24uanMnKTtcclxudmFyIE9wdGlvbnNTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmVzL09wdGlvbnNTdG9yZS5qc3gnKTtcclxuXHJcblxyXG52YXIgb3B0aW9ucyA9IHtcclxuICBlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlLFxyXG4gIHRpbWVvdXQ6IDUwMDAsXHJcbiAgbWF4aW11bUFnZTogMFxyXG59O1xyXG5cclxuZnVuY3Rpb24gR2VvbG9jYXRpb24oKXtcInVzZSBzdHJpY3RcIjt9XHJcblxyXG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5pbml0QnJvd3Nlcj1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIC8vVE9ETyBmaW5pc2hcclxuICAgIC8vbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zKSB7XHJcbiAgICAvLyAgdmFyIGNyZCA9IHBvcy5jb29yZHM7XHJcbiAgICAvLyAgY29uc29sZS5sb2coJ1lvdXIgY3VycmVudCBwb3NpdGlvbiBpczonKTtcclxuICAgIC8vICBjb25zb2xlLmxvZygnTGF0aXR1ZGUgOiAnICsgY3JkLmxhdGl0dWRlKTtcclxuICAgIC8vICBjb25zb2xlLmxvZygnTG9uZ2l0dWRlOiAnICsgY3JkLmxvbmdpdHVkZSk7XHJcbiAgICAvLyAgY29uc29sZS5sb2coJ01vcmUgb3IgbGVzcyAnICsgY3JkLmFjY3VyYWN5ICsgJyBtZXRlcnMuJyk7XHJcbiAgICAvL1xyXG4gICAgLy99LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyAgY29uc29sZS53YXJuKCdFUlJPUignICsgZXJyLmNvZGUgKyAnKTogJyArIGVyci5tZXNzYWdlKTtcclxuICAgIC8vfSwgb3B0aW9ucylcclxuICB9O1xyXG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRGcm9tTWFwPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG5cclxuICB9O1xyXG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRGcm9tQnJvd3Nlcj1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgfTtcclxuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUuZ2V0RnJvbUNvZGU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIH07XHJcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLnBvaW50VG9Cb3VuZHM9ZnVuY3Rpb24obGF0LCBsb24pIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBkaXN0YW5jZSA9IDMwMDtcclxuICAgIHZhciBsbCA9IExhdExvbihsYXQsbG9uKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxhdF9sbzogbGwuZGVzdGluYXRpb25Qb2ludCgxODAsIGRpc3RhbmNlKS5sYXQsXHJcbiAgICAgIGxuZ19sbzogbGwuZGVzdGluYXRpb25Qb2ludCgtOTAsIGRpc3RhbmNlKS5sb24sXHJcbiAgICAgIGxhdF9oaTogbGwuZGVzdGluYXRpb25Qb2ludCgwLCBkaXN0YW5jZSkubGF0LFxyXG4gICAgICBsbmdfaGk6IGxsLmRlc3RpbmF0aW9uUG9pbnQoOTAsIGRpc3RhbmNlKS5sb25cclxuICAgIH1cclxuICB9O1xyXG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRDdXJyZW50Qm91bmRzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIGNlbnRlciA9IE9wdGlvbnNTdG9yZS5kYXRhLmRlZmF1bHRNYXBDZW50ZXI7XHJcbiAgICBpZiAoY2VudGVyKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnBvaW50VG9Cb3VuZHMoY2VudGVyLmxhdCgpLGNlbnRlci5sbmcoKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5wb2ludFRvQm91bmRzKDUwLDE1KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IEdlb2xvY2F0aW9uKCk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiBcIkRhdGVGb3JtYXRcIixcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxvY2FsID0gdGhpcy5wcm9wcy5kYXRlSW5QbGFjZS5nZXQoXCJsb2NhbFwiKTtcbiAgICB2YXIgdXRjID0gdGhpcy5wcm9wcy5kYXRlSW5QbGFjZS5nZXQoXCJ1dGNcIik7XG4gICAgdmFyIHRpdGxlID0gXCJJbiBVVEMgdGltZTogXCIgKyB1dGMuZm9ybWF0KFwiTExMXCIpO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7dGl0bGU6IHRpdGxlfSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImJcIiwgbnVsbCwgbG9jYWwuZm9ybWF0KFwiTU1NIERcIikpLCBcIiBcIiwgbG9jYWwuZm9ybWF0KFwiZGRkXCIpLCBcIiBcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImJcIiwgbnVsbCwgbG9jYWwuZm9ybWF0KFwiTFRcIikpKVxuICAgIClcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIFNlYXJjaEZvcm1TdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4Jyk7XG52YXIgZmxpZ2h0c0FQSSA9IHJlcXVpcmUoJy4uL0FQSXMvZmxpZ2h0c0FQSS5qc3gnKTtcbnZhciBPcHRpb25zU3RvcmUgID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xudmFyIFByaWNlR3JvdXAgPSByZXF1aXJlKCcuL1ByaWNlR3JvdXAuanN4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogXCJHcm91cGVkUmVzdWx0c1wiLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwcmljZUdyb3VwczogW11cbiAgICB9O1xuICB9LFxuICAvKiBncm91cCBqb3VybmV5cyBieSBwcmljZSAqL1xuICBncm91cEpvdXJuZXlzOiBmdW5jdGlvbiAoam91cm5leXMpIHtcbiAgICB2YXIgcHJpY2VHcm91cHNJbmRleCA9IHt9O1xuICAgIGpvdXJuZXlzLmZvckVhY2goZnVuY3Rpb24oam91cm5leSkgIHtcbiAgICAgIHZhciBpbmRleCA9IFwiXCIram91cm5leS5nZXRQcmljZSgpK1wiX1wiK2pvdXJuZXkuaXNSZXR1cm4oKTtcbiAgICAgIGlmICghcHJpY2VHcm91cHNJbmRleFtpbmRleF0pIHtcbiAgICAgICAgcHJpY2VHcm91cHNJbmRleFtpbmRleF0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHByaWNlR3JvdXBzSW5kZXhbaW5kZXhdLnB1c2goam91cm5leSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHByaWNlR3JvdXBzSW5kZXgpLm1hcChmdW5jdGlvbihrZXkpICB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcmljZTogcHJpY2VHcm91cHNJbmRleFtrZXldWzBdLmdldFByaWNlKCksXG4gICAgICAgIGlzUmV0dXJuOiBwcmljZUdyb3Vwc0luZGV4W2tleV1bMF0uaXNSZXR1cm4oKSxcbiAgICAgICAgam91cm5leXM6IHByaWNlR3JvdXBzSW5kZXhba2V5XVxuICAgICAgfVxuICAgIH0pLnNvcnQoZnVuY3Rpb24oYSwgYikgIHtcbiAgICAgIHJldHVybiBhLnByaWNlID4gYi5wcmljZSA/IDEgOiAtMVxuICAgIH0pO1xuICB9LFxuICBsb2FkRmxpZ2h0czogZnVuY3Rpb24gKCkge1xuICAgIGZsaWdodHNBUEkuZmluZEZsaWdodHMoe1xuICAgICAgb3JpZ2luOiBTZWFyY2hGb3JtU3RvcmUuZGF0YS5vcmlnaW4sXG4gICAgICBkZXN0aW5hdGlvbjogU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGVzdGluYXRpb24sXG4gICAgICBvdXRib3VuZERhdGU6IFNlYXJjaEZvcm1TdG9yZS5kYXRhLmRhdGVGcm9tLFxuICAgICAgaW5ib3VuZERhdGU6IFNlYXJjaEZvcm1TdG9yZS5kYXRhLmRhdGVUbyxcbiAgICAgIHBhc3NlbmdlcnM6IFNlYXJjaEZvcm1TdG9yZS5kYXRhLnBhc3NlbmdlcnNcbiAgICB9KS50aGVuKGZ1bmN0aW9uKGpvdXJuZXlzKSAge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHByaWNlR3JvdXBzOiB0aGlzLmdyb3VwSm91cm5leXMoam91cm5leXMpXG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcbiAgICAgIC8vVE9ETyBuaWNlciBlcnJvciBoYW5kbGluZ1xuICAgICAgY29uc29sZS5lcnJvcihlcnIsIGVyci5zdGFjayk7XG4gICAgfSk7XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBTZWFyY2hGb3JtU3RvcmUuZXZlbnRzLm9uKFwic2VhcmNoXCIsIGZ1bmN0aW9uKHR5cGUpICB7XG4gICAgICB0aGlzLmxvYWRGbGlnaHRzKCk7XG4gICAgfS5iaW5kKHRoaXMpKVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgICAgdGhpcy5zdGF0ZS5wcmljZUdyb3Vwcy5tYXAoZnVuY3Rpb24ocHJpY2VHcm91cCkgIHtcbiAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFByaWNlR3JvdXAsIHtrZXk6IFwiX1wiK3ByaWNlR3JvdXAucHJpY2UsIHByaWNlR3JvdXA6IHByaWNlR3JvdXB9KSlcbiAgICAgIH0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFRyaXBJbmZvID0gcmVxdWlyZShcIi4vVHJpcEluZm8uanN4XCIpO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoXCJpbW11dGFibGVcIik7XG52YXIgTWFwID0gSW1tdXRhYmxlLk1hcDtcblxuXG52YXIgTGlua0J1dHRvbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJMaW5rQnV0dG9uXCIsXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzaGFyZWRKb3VybmV5ID0gdGhpcy5wcm9wcy5zaGFyZWRKb3VybmV5O1xuICAgIHZhciBiYXNlVXJsID0gXCJodHRwczovL2VuLnNreXBpY2tlci5jb20vYm9va2luZ1wiOyAvL1RPRE8gY2hhbmdlIGl0XG4gICAgaWYgKHNoYXJlZEpvdXJuZXkpIHtcbiAgICAgIHZhciB1cmwgPSBiYXNlVXJsICsgXCI/ZmxpZ2h0c0lkPVwiICsgc2hhcmVkSm91cm5leS5nZXQoXCJpZFwiKSArIFwiJnByaWNlPVwiICsgc2hhcmVkSm91cm5leS5nZXRQcmljZSgpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge2hyZWY6IHVybH0sIFwiQm9vayBmbGlnaHQgZm9yIFwiLCBzaGFyZWRKb3VybmV5LmdldFByaWNlKCksIFwiIFwiLCBzaGFyZWRKb3VybmV5LmdldChcImlkXCIpKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGlkID0gdGhpcy5wcm9wcy5zZWxlY3RlZC5nZXQoXCJvdXRib3VuZFwiKS5tYXN0ZXIuZ2V0SWQoKSArIFwifFwiICsgIHRoaXMucHJvcHMuc2VsZWN0ZWQuZ2V0KFwiaW5ib3VuZFwiKS5tYXN0ZXIuZ2V0SWQoKVxuICAgICAgdmFyIHVybCA9IGJhc2VVcmwgKyBcIj9mbGlnaHRzSWQ9XCIgKyBpZCAgKyBcIiZwcmljZT1cIiArIHRoaXMucHJvcHMuZ3JvdXBQcmljZTtcbiAgICAgIGNvbnNvbGUubG9nKHVybCk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7aHJlZjogdXJsfSwgXCJDaGVjayBwcmljZSBhbmQgYm9vayBmbGlnaHRcIilcbiAgICAgICk7XG4gICAgfVxuICB9XG59KTtcblxuLypcbiBNYXN0ZXIgLSBTbGF2ZSBsb2dpY1xuIEJlY2F1c2UgaSB3YW50ZWQgdG8gc29tZWhvdyBjb25uZWN0IG11bHRpcGxlIGpvdXJuZXlzIGludG8gY29tbW9uIGdyb3VwcyB3aXRoIHNhbWUgcHJpY2UgaSBtYWRlIHRoaXMgbG9naWNcbiBJIG1ha2UgcGFpcnMgZm9yIHdpdGggZGlyZWN0aW9ucyBvdXRib3VuZCBhbmQgaW5ib3VuZC4gSSBtYWtlIHBhaXJzIHdoZXJlIG91dGJvdW5kIGlzIG1hc3RlciBhbmQgaW5ib3VuZCBpcyBzbGF2ZSBhbmQgYWxzbyBvcHBvc2l0ZSBwYWlycy5cbiBTbGF2ZXMgYXJlIGFsbCB0cmlwcyB3aGljaCBhbGUgcG9zc2libGUgdG8gY29ubmVjdCB3aXRoIG1hc3RlciB0cmlwLlxuIEluIGVhY2ggc2xhdmUgaXMgcmVmZXJlbmNlIHRvIEpvdXJuZXkgd2hpY2ggaXMgY29tbW9uIHdpdGggbWFzdGVyLlxuIElmIHRoZXJlIGlzIG5vdCBjb21tb24gSm91cm5leSB0byBib3RoIHNlbGVjdGVkIHRyaXBzLCBpdCBpcyBub3QgcG9zc2libGUgZ2V0IHByaWNlLiBUbyBwcmV2ZW50IHRoaXMsIHRoZXJlIGlzIHR3byBvcHRpb25zOlxuIDEpIFNwbGl0IHRvIG1vcmUgZ3JvdXBzICh0aGlzIHNob3VsZCBiZSBub3cgaW1wbGVtZW50ZWQpXG4gMikgRG8gbm90IHNob3cgcHJpY2UgYW5kIGxldCB1c2VyIHRvIGNoZWNrIGl0IGluIGJvb2tpbmdcbiAzKSBEaXNhYmxlIGJhZCBjb21iaW5hdGlvbnNcblxuXG4gUGFpciBmb3JtYXQ6XG4gIG1hc3RlcjogVHJpcFxuICBqb3VybmV5OiBKb3VybmV5IChpZiBpdCBpcyByZXR1cm4sIGl0IGlzIG51bGwpXG4gIHNsYXZlczogW1xuICAgIHtcbiAgICAgIHRyaXA6IFRyaXBcbiAgICAgIGpvdXJuZXk6IEpvdXJuZXkgKGNvbW1vbiBqb3VybmV5KVxuICAgIH1cbiAgICAuLi5cbiAgXVxuICBvbmVXYXk6IGJvb2xlYW5cbiAqL1xuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiUHJpY2VHcm91cFwiLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBtZXJnZWQgPSB0aGlzLm1lcmdlVHJpcHModGhpcy5wcm9wcy5wcmljZUdyb3VwLmpvdXJuZXlzKTtcbiAgICByZXR1cm4ge1xuICAgICAgbWVyZ2VkOiBtZXJnZWQsXG4gICAgICBzZWxlY3RlZDogdGhpcy5maXJzdFNlbGVjdGVkKE1hcCgpLCBtZXJnZWQpXG4gICAgfVxuICB9LFxuXG4gIHNlbGVjdEZ1bmM6IGZ1bmN0aW9uIChwYWlyLCBkaXJlY3Rpb24pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSAge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkLnNldChkaXJlY3Rpb24scGFpcilcbiAgICAgIH0pXG4gICAgfS5iaW5kKHRoaXMpXG4gIH0sXG5cbiAgZmlyc3RTZWxlY3RlZDogZnVuY3Rpb24gKHNlbGVjdGVkLCBtZXJnZWQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgc2VsZWN0ZWRcbiAgICAgICAgLnNldChcIm91dGJvdW5kXCIsbWVyZ2VkLm91dGJvdW5kc1swXSlcbiAgICAgICAgLnNldChcImluYm91bmRcIixtZXJnZWQuaW5ib3VuZHNbMF0pXG4gICAgKTtcbiAgfSxcblxuICBtZXJnZVRyaXBzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG91dGJvdW5kczogdGhpcy5tZXJnZVRyaXBzVG9QYWlycyh0aGlzLnByb3BzLnByaWNlR3JvdXAuam91cm5leXMsIFwib3V0Ym91bmRcIiksXG4gICAgICBpbmJvdW5kczogdGhpcy5tZXJnZVRyaXBzVG9QYWlycyh0aGlzLnByb3BzLnByaWNlR3JvdXAuam91cm5leXMsIFwiaW5ib3VuZFwiKVxuICAgIH1cbiAgfSxcblxuICBtZXJnZVRyaXBzVG9QYWlyczogZnVuY3Rpb24gKGpvdXJuZXlzLCBtYXN0ZXJEaXJlY3Rpb24pIHtcbiAgICB2YXIgc2xhdmVEaXJlY3Rpb24gPSBtYXN0ZXJEaXJlY3Rpb24gPT0gXCJvdXRib3VuZFwiID8gXCJpbmJvdW5kXCIgOiBcIm91dGJvdW5kXCI7XG4gICAgdmFyIHBhaXJzID0ge307XG4gICAgam91cm5leXMuZm9yRWFjaChmdW5jdGlvbihqb3VybmV5KSAge1xuICAgICAgaWYgKGpvdXJuZXkuaXNSZXR1cm4oKSkge1xuICAgICAgICAvL1JldHVybnNcbiAgICAgICAgdmFyIGlkID0gam91cm5leS5nZXQoXCJ0cmlwc1wiKS5nZXQobWFzdGVyRGlyZWN0aW9uKS5nZXRJZCgpO1xuICAgICAgICBpZiAoIXBhaXJzW2lkXSkge1xuICAgICAgICAgIHBhaXJzW2lkXSA9IHtcbiAgICAgICAgICAgIG1hc3Rlcjogam91cm5leS5nZXQoXCJ0cmlwc1wiKS5nZXQobWFzdGVyRGlyZWN0aW9uKSxcbiAgICAgICAgICAgIGpvdXJuZXk6IG51bGwgLyptdWx0aXBsZSBqb3VybmV5cyBpbiBzbGF2ZXMqLyxcbiAgICAgICAgICAgIHNsYXZlczogW10sXG4gICAgICAgICAgICBvbmVXYXk6IGZhbHNlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBwYWlyc1tpZF0uc2xhdmVzLnB1c2goe1xuICAgICAgICAgIHRyaXA6IGpvdXJuZXkudHJpcHMuZ2V0KHNsYXZlRGlyZWN0aW9uKSxcbiAgICAgICAgICBqb3VybmV5OiBqb3VybmV5XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9PbmUgd2F5c1xuICAgICAgICBpZiAoam91cm5leS5nZXQoXCJ0cmlwc1wiKS5nZXQobWFzdGVyRGlyZWN0aW9uKSkge1xuICAgICAgICAgIHZhciBpZCA9IGpvdXJuZXkuZ2V0KFwidHJpcHNcIikuZ2V0KG1hc3RlckRpcmVjdGlvbikuZ2V0SWQoKTtcbiAgICAgICAgICBwYWlyc1tpZF0gPSB7XG4gICAgICAgICAgICBtYXN0ZXI6IGpvdXJuZXkuZ2V0KFwidHJpcHNcIikuZ2V0KG1hc3RlckRpcmVjdGlvbiksXG4gICAgICAgICAgICBqb3VybmV5OiBqb3VybmV5ICxcbiAgICAgICAgICAgIG9uZVdheTogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0pO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhwYWlycykubWFwKGZ1bmN0aW9uKGtleSkgIHtyZXR1cm4gcGFpcnNba2V5XTt9KTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICBpZiAobmV3UHJvcHMuam91cm5leXMgIT0gdGhpcy5wcm9wcy5wcmljZUdyb3VwLmpvdXJuZXlzKSB7XG4gICAgICB2YXIgbWVyZ2VkID0gdGhpcy5tZXJnZVRyaXBzKG5ld1Byb3BzLmpvdXJuZXlzKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtZXJnZWQ6IG1lcmdlZCxcbiAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuZmlyc3RTZWxlY3RlZCh0aGlzLnN0YXRlLnNlbGVjdGVkLCBtZXJnZWQpXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgZmluZFNoYXJlZEpvdXJuZXk6ZnVuY3Rpb24ob3V0Ym91bmQsIGluYm91bmQpIHtcbiAgICBpZiAob3V0Ym91bmQub25lV2F5KSB7XG4gICAgICByZXR1cm4gb3V0Ym91bmQuam91cm5leTtcbiAgICB9XG4gICAgdmFyIHNoYXJlZEpvdXJuZXkgPSBudWxsO1xuICAgIG91dGJvdW5kLnNsYXZlcy5mb3JFYWNoKGZ1bmN0aW9uKG91dGJvdW5kc1NsYXZlSW5ib3VuZCkgIHtcbiAgICAgIGluYm91bmQuc2xhdmVzLmZvckVhY2goZnVuY3Rpb24oaW5ib3VuZHNTbGF2ZU91dGJvdW5kKSAge1xuICAgICAgICBpZiAob3V0Ym91bmRzU2xhdmVJbmJvdW5kLmpvdXJuZXkgPT0gaW5ib3VuZHNTbGF2ZU91dGJvdW5kLmpvdXJuZXkpIHtcbiAgICAgICAgICBzaGFyZWRKb3VybmV5ID0gb3V0Ym91bmRzU2xhdmVJbmJvdW5kLmpvdXJuZXk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSk7XG4gICAgcmV0dXJuIHNoYXJlZEpvdXJuZXk7XG4gIH0sXG5cbiAgaXNJbkNvdW50ZXJwYXJ0OmZ1bmN0aW9uKHRoaXNNYXN0ZXIsdGhpc0RpcmVjdGlvbikge1xuICAgIHZhciB0aGlzSWQgPSB0aGlzTWFzdGVyLmdldElkKCk7XG4gICAgdmFyIHRoYXREaXJlY3Rpb24gPSB0aGlzRGlyZWN0aW9uID09IFwib3V0Ym91bmRcIiA/IFwiaW5ib3VuZFwiIDogXCJvdXRib3VuZFwiO1xuICAgIHZhciBpc1RoZXJlID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RlZC5nZXQodGhhdERpcmVjdGlvbikuc2xhdmVzLmZvckVhY2goZnVuY3Rpb24oc2xhdmUpICB7XG4gICAgICBpZiAodGhpc0lkID09IHNsYXZlLnRyaXAuZ2V0SWQoKSkge1xuICAgICAgICBpc1RoZXJlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gaXNUaGVyZTtcbiAgfSxcbiAgcmVuZGVyTGVnOiBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImxlZ3MtY29udGVudFwifSwgXG4gICAgICAgIHRoaXMuc3RhdGUubWVyZ2VkW2RpcmVjdGlvbitcInNcIl0ubWFwKGZ1bmN0aW9uKHBhaXIpICB7XG4gICAgICAgICAgdmFyIGlkID0gcGFpci5tYXN0ZXIuZ2V0SWQoKTtcbiAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZC5nZXQoZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgc2VsZWN0ZWQgPSBpZCA9PSB0aGlzLnN0YXRlLnNlbGVjdGVkLmdldChkaXJlY3Rpb24pLm1hc3Rlci5nZXRJZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocGFpci5vbmVXYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFRyaXBJbmZvLCB7c2VsZWN0ZWQ6IHNlbGVjdGVkLCBrZXk6IFwib25ld2F5LVwiK2lkLCBvblNlbGVjdDogdGhpcy5zZWxlY3RGdW5jKHBhaXIsZGlyZWN0aW9uKSwgdHJpcDogcGFpci5tYXN0ZXJ9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChUcmlwSW5mbywge3NlbGVjdGVkOiBzZWxlY3RlZCwgaGlkZGVuOiAhdGhpcy5pc0luQ291bnRlcnBhcnQocGFpci5tYXN0ZXIsIGRpcmVjdGlvbiksIGtleTogZGlyZWN0aW9uK1wiLVwiK2lkLCBvblNlbGVjdDogdGhpcy5zZWxlY3RGdW5jKHBhaXIsZGlyZWN0aW9uKSwgdHJpcDogcGFpci5tYXN0ZXJ9KVxuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgKVxuICAgIClcbiAgfSxcbiAgcmVuZGVySW5ib3VuZHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImluYm91bmQtbGVnc1wifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJsZWdzLWhlYWRlclwifSwgXG4gICAgICAgICAgXCJJbmJvdW5kXCJcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJsZWdzLWJvZHlcIn0sIFxuICAgICAgICAgICAgICB0aGlzLnJlbmRlckxlZyhcImluYm91bmRcIilcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfSxcbiAgcmVuZGVyT3V0Ym91bmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJvdXRib3VuZC1sZWdzXCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImxlZ3MtaGVhZGVyXCJ9LCBcbiAgICAgICAgICBcIk91dGJvdW5kXCJcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJsZWdzLWJvZHlcIn0sIFxuICAgICAgICAgICAgdGhpcy5yZW5kZXJMZWcoXCJvdXRib3VuZFwiKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJpY2UgPSB0aGlzLnByb3BzLnByaWNlR3JvdXAucHJpY2U7XG4gICAgdmFyIGlzUmV0dXJuID0gdGhpcy5wcm9wcy5wcmljZUdyb3VwLmlzUmV0dXJuO1xuICAgIHZhciBzaGFyZWRKb3VybmV5ID0gdGhpcy5maW5kU2hhcmVkSm91cm5leSh0aGlzLnN0YXRlLnNlbGVjdGVkLmdldChcIm91dGJvdW5kXCIpLCB0aGlzLnN0YXRlLnNlbGVjdGVkLmdldChcImluYm91bmRcIikpO1xuXG5cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByaWNlLWdyb3VwXCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByaWNlLWdyb3VwLS1oZWFkZXJcIn0sIHByaWNlKSwgXG4gICAgICAgIHRoaXMucmVuZGVyT3V0Ym91bmRzKCksIFxuICAgICAgICBpc1JldHVybj90aGlzLnJlbmRlckluYm91bmRzKCk6XCJcIiwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChMaW5rQnV0dG9uLCB7c2hhcmVkSm91cm5leTogc2hhcmVkSm91cm5leSwgZ3JvdXBQcmljZTogcHJpY2UsIHNlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkfSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBEYXRlRm9ybWF0ID0gcmVxdWlyZSgnLi9EYXRlRm9ybWF0LmpzeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiVHJpcERldGFpbHNcIixcbiAgcmVuZGVyRmxpZ2h0czogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0cmlwID0gdGhpcy5wcm9wcy50cmlwO1xuICAgIHJldHVybiB0cmlwLmZsaWdodHMubWFwKGZ1bmN0aW9uKGZsaWdodCkgIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIHJhZGlvXCJ9KSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGRlcGFydHVyZS1kYXRlXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVGb3JtYXQsIHtkYXRlSW5QbGFjZTogZmxpZ2h0LmdldERlcGFydHVyZSgpLmdldChcIndoZW5cIil9KSksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBkZXBhcnR1cmVcIn0sIGZsaWdodC5nZXREZXBhcnR1cmUoKS5nZXRJbihbXCJ3aGVyZVwiLCBcImNvZGVcIl0pKSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGR1cmF0aW9uXCJ9LCBNYXRoLmZsb29yKGZsaWdodC5nZXREdXJhdGlvbigpLmFzSG91cnMoKSksIFwiaCBcIiwgdHJpcC5nZXREdXJhdGlvbigpLm1pbnV0ZXMoKSwgXCJtaW5cIiksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBhcnJpdmFsLWRhdGVcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF0ZUZvcm1hdCwge2RhdGVJblBsYWNlOiBmbGlnaHQuZ2V0QXJyaXZhbCgpLmdldChcIndoZW5cIil9KSksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBhcnJpdmFsXCJ9LCBmbGlnaHQuZ2V0QXJyaXZhbCgpLmdldEluKFtcIndoZXJlXCIsIFwiY29kZVwiXSkpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgc3RvcHNcIn0pLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZGV0YWlsc1wifSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIH0pLnRvSlMoKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJ0cmlwLWRldGFpbHNcIn0sIFxuICAgICAgICB0aGlzLnJlbmRlckZsaWdodHMoKVxuICAgICAgKVxuICAgIClcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBUcmlwRGV0YWlscyA9IHJlcXVpcmUoJy4vVHJpcERldGFpbHMuanN4Jyk7XG52YXIgRGF0ZUZvcm1hdCA9IHJlcXVpcmUoJy4vRGF0ZUZvcm1hdC5qc3gnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgZGlzcGxheU5hbWU6IFwiVHJpcEluZm9cIixcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRldGFpbHM6IGZhbHNlXG4gICAgfVxuICB9LFxuICBzZWxlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHRoaXMucHJvcHMudHJpcCk7XG4gIH0sXG4gIHRvZ2dsZURldGFpbHM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRldGFpbHM6ICF0aGlzLnN0YXRlLmRldGFpbHNcbiAgICB9KVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gXCJ0cmlwLWluZm9cIjtcbiAgICB2YXIgdHJpcCA9IHRoaXMucHJvcHMudHJpcDtcbiAgICB2YXIgc3RvcHM7XG4gICAgaWYgKHRyaXAuZ2V0U3RvcHMoKSA+PSAxKSB7XG4gICAgICBzdG9wcyA9IHRyaXAuZ2V0U3RvcHMoKSArIFwiIFwiK1wic3RvcHNcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RvcHMgPSBcIkRpcmVjdCBmbGlnaHRcIjtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBzZWxlY3RlZFwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5oaWRkZW4pIHtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBoaWRkZW5cIjtcbiAgICB9XG5cbiAgICB2YXIgY2lyY2xlQ2xhc3M7XG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgIGNpcmNsZUNsYXNzID0gXCJmYSBmYS1kb3QtY2lyY2xlLW9cIjtcbiAgICB9IGVsc2Uge1xuICAgICAgY2lyY2xlQ2xhc3MgPSBcImZhIGZhLWNpcmNsZS1vXCI7XG4gICAgfVxuXG4gICAgdmFyIGRldGFpbHMgPSBcIlwiO1xuICAgIGlmICh0aGlzLnN0YXRlLmRldGFpbHMpIHtcbiAgICAgIGRldGFpbHMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFRyaXBEZXRhaWxzLCB7dHJpcDogdGhpcy5wcm9wcy50cmlwfSlcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLnNlbGVjdH0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgcmFkaW9cIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IGNpcmNsZUNsYXNzfSkpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGRlcGFydHVyZS1kYXRlXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVGb3JtYXQsIHtkYXRlSW5QbGFjZTogdHJpcC5nZXREZXBhcnR1cmUoKS5nZXQoXCJ3aGVuXCIpfSkpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGRlcGFydHVyZVwifSwgdHJpcC5nZXREZXBhcnR1cmUoKS5nZXRJbihbXCJ3aGVyZVwiLCBcImNvZGVcIl0pKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBkdXJhdGlvblwifSwgTWF0aC5mbG9vcih0cmlwLmdldER1cmF0aW9uKCkuYXNIb3VycygpKSwgXCJoIFwiLCB0cmlwLmdldER1cmF0aW9uKCkubWludXRlcygpLCBcIm1pblwiKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJmaWVsZCBhcnJpdmFsLWRhdGVcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF0ZUZvcm1hdCwge2RhdGVJblBsYWNlOiB0cmlwLmdldEFycml2YWwoKS5nZXQoXCJ3aGVuXCIpfSkpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIGFycml2YWxcIn0sIHRyaXAuZ2V0QXJyaXZhbCgpLmdldEluKFtcIndoZXJlXCIsIFwiY29kZVwiXSkpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImZpZWxkIHN0b3BzXCJ9LCBzdG9wcyksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZmllbGQgZGV0YWlsc1wiLCBvbkNsaWNrOiB0aGlzLnRvZ2dsZURldGFpbHN9LCBcIkRldGFpbHNcIiksIFxuICAgICAgICBkZXRhaWxzXG4gICAgICApXG4gICAgKVxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcbnZhciBQbGFjZUxhYmVsID0gcmVxdWlyZSgnLi9QbGFjZUxhYmVsLmpzeCcpO1xyXG52YXIgTWFwTGFiZWxzU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvTWFwTGFiZWxzU3RvcmUuanN4Jyk7XHJcbnZhciBMYWJlbHNMYXllciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJMYWJlbHNMYXllclwiLFxyXG5cclxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxhYmVsczogW11cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xyXG4gICAgTWFwTGFiZWxzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgbGFiZWxzOiBNYXBMYWJlbHNTdG9yZS5nZXRMYWJlbHMoKVxyXG4gICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyUGxhY2VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbGFiZWxzID0gdGhpcy5zdGF0ZS5sYWJlbHM7XHJcbiAgICByZXR1cm4gbGFiZWxzLm1hcChmdW5jdGlvbihsYWJlbCkgIHtcclxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlTGFiZWwsIHtrZXk6IGxhYmVsLm1hcFBsYWNlLnBsYWNlLmlkLCBsYWJlbDogbGFiZWx9KSlcclxuICAgIH0pXHJcbiAgfSxcclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJsYWJlbHMtb3ZlcmxheSBtYXAtb3ZlcmxheVwifSwgXHJcbiAgICAgICAgdGhpcy5yZW5kZXJQbGFjZXMoKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG5cclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMYWJlbHNMYXllcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUHVyZVJlbmRlck1peGluID0gKHdpbmRvdy5SZWFjdCkuYWRkb25zLlB1cmVSZW5kZXJNaXhpbjtcclxudmFyIE1hcFBsYWNlc1N0b3JlID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvTWFwUGxhY2VzU3RvcmUuanN4Jyk7XHJcbnZhciBUcmFuc2xhdGUgPSByZXF1aXJlKCcuLy4uL1RyYW5zbGF0ZS5qc3gnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcImV4cG9ydHNcIixcclxuXHJcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsb2FkaW5nOiBmYWxzZVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBNYXBQbGFjZXNTdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSAge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBsb2FkaW5nOiBNYXBQbGFjZXNTdG9yZS5sb2FkaW5nXHJcbiAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjbGFzc05hbWUgPSBcIm1hcC1sb2FkZXJcIjtcclxuICAgIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcpIHtcclxuICAgICAgY2xhc3NOYW1lICs9IFwiIG1hcC1sb2FkZXItbG9hZGluZ1wiO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1hcC1sb2FkZXItd3JhcHBlclwifSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc05hbWV9LCBcclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbnNsYXRlLCB7dEtleTogXCJtYXAubG9hZGluZ19tYXBfcHJpY2VzXCJ9LCBcIkxvYWRpbmcgbWFwIHByaWNlc1wiKSwgXCIgXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwic3Bpbm5lciBmYSBmYS1zcGlubmVyIGZhLXNwaW5cIn0pKVxyXG4gICAgICAgIClcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxufSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIExhYmVsc0xheWVyID0gcmVxdWlyZSgnLi9MYWJlbHNMYXllci5qc3gnKTtcclxudmFyIFBvaW50c0xheWVyID0gcmVxdWlyZSgnLi9Qb2ludHNMYXllci5qc3gnKTtcclxudmFyIFBvaW50c1NWR0xheWVyID0gcmVxdWlyZSgnLi9Qb2ludHNTVkdMYXllci5qc3gnKTtcclxudmFyIE1vdXNlQ2xpY2tMYXllciA9IHJlcXVpcmUoJy4vTW91c2VDbGlja0xheWVyLmpzeCcpO1xyXG52YXIgTWFwTGFiZWxzU3RvcmUgPSByZXF1aXJlKCcuLy4uL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcclxuXHJcbnZhciBNYXBPdmVybGF5ID0gZnVuY3Rpb24gKG1hcCkge1xyXG4gIHRoaXMubWFwID0gbWFwO1xyXG4gIHRoaXMuc2V0TWFwKG1hcCk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBmbGF0Qm91bmRzKGJvdW5kcykge1xyXG4gIHZhciBuZSA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKTtcclxuICB2YXIgc3cgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XHJcbiAgcmV0dXJuIHtcclxuICAgIHdMbmc6IHN3LmxuZygpLFxyXG4gICAgZUxuZzogbmUubG5nKCksXHJcbiAgICBzTGF0OiBzdy5sYXQoKSxcclxuICAgIG5MYXQ6IG5lLmxhdCgpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRQb2ludHNMYXllcihwYW5lcywgbWFwKSB7XHJcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIC8vIG92ZXJsYXlMYXllciwgb3ZlcmxheU1vdXNlVGFyZ2V0IC8vaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvY3VzdG9tb3ZlcmxheXNcclxuICBwYW5lcy5vdmVybGF5TGF5ZXIuYXBwZW5kQ2hpbGQoZGl2KTtcclxuICBkaXYuY2xhc3NOYW1lID0gXCJvdmVybGF5LWNvbnRhaW5lclwiO1xyXG4gIHJldHVybiBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRmFjdG9yeShQb2ludHNMYXllcikoKSwgZGl2KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkUG9pbnRzU1ZHTGF5ZXIocGFuZXMsIG1hcCkge1xyXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAvLyBvdmVybGF5TGF5ZXIsIG92ZXJsYXlNb3VzZVRhcmdldCAvL2h0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2N1c3RvbW92ZXJsYXlzXHJcbiAgcGFuZXMub3ZlcmxheUxheWVyLmFwcGVuZENoaWxkKGRpdik7XHJcbiAgZGl2LmNsYXNzTmFtZSA9IFwib3ZlcmxheS1jb250YWluZXJcIjtcclxuICByZXR1cm4gUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUZhY3RvcnkoUG9pbnRzU1ZHTGF5ZXIpKCksIGRpdik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZExhYmVsc0xheWVyKHBhbmVzLCBtYXApIHtcclxuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgLy8gb3ZlcmxheUxheWVyLCBvdmVybGF5TW91c2VUYXJnZXQgLy9odHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9jdXN0b21vdmVybGF5c1xyXG4gIHBhbmVzLm92ZXJsYXlMYXllci5hcHBlbmRDaGlsZChkaXYpO1xyXG4gIGRpdi5jbGFzc05hbWUgPSBcIm92ZXJsYXktY29udGFpbmVyXCI7XHJcbiAgcmV0dXJuIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVGYWN0b3J5KExhYmVsc0xheWVyKSgpLCBkaXYpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRNb3VzZUNsaWNrTGF5ZXIocGFuZXMsIG1hcCkge1xyXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAvLyBvdmVybGF5TGF5ZXIsIG92ZXJsYXlNb3VzZVRhcmdldCAvL2h0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2N1c3RvbW92ZXJsYXlzXHJcbiAgcGFuZXMub3ZlcmxheU1vdXNlVGFyZ2V0LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgZGl2LmNsYXNzTmFtZSA9IFwib3ZlcmxheS1jb250YWluZXJcIjtcclxuICByZXR1cm4gUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUZhY3RvcnkoTW91c2VDbGlja0xheWVyKSgpLCBkaXYpO1xyXG59XHJcblxyXG5cclxuXHJcbk1hcE92ZXJsYXkucHJvdG90eXBlID0gbmV3IGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3KCk7XHJcblxyXG5NYXBPdmVybGF5LnByb3RvdHlwZS5vbkFkZCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgcGFuZXMgPSB0aGlzLmdldFBhbmVzKCk7XHJcbiAgYWRkUG9pbnRzU1ZHTGF5ZXIocGFuZXMsIHRoaXMubWFwKTtcclxuICBhZGRMYWJlbHNMYXllcihwYW5lcywgdGhpcy5tYXApO1xyXG4gIGFkZE1vdXNlQ2xpY2tMYXllcihwYW5lcywgdGhpcy5tYXApO1xyXG5cclxuICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLm1hcCwgJ3pvb21fY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG92ZXJsYXlQcm9qZWN0aW9uID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XHJcbiAgICB2YXIgYm91bmRzID0gZmxhdEJvdW5kcyh0aGlzLm1hcC5nZXRCb3VuZHMoKSk7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5zZXRNYXBEYXRhKGJvdW5kcywgb3ZlcmxheVByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwuYmluZChvdmVybGF5UHJvamVjdGlvbikpO1xyXG4gIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMubWFwLCAnaWRsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG92ZXJsYXlQcm9qZWN0aW9uID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XHJcbiAgICB2YXIgYm91bmRzID0gZmxhdEJvdW5kcyh0aGlzLm1hcC5nZXRCb3VuZHMoKSk7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5zZXRNYXBEYXRhKGJvdW5kcywgb3ZlcmxheVByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwuYmluZChvdmVybGF5UHJvamVjdGlvbikpO1xyXG4gIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vL01heSBiZSB1c2VkIGxhdGVyOlxyXG5cclxuTWFwT3ZlcmxheS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uICgpIHtcclxuICAvL0RvIG5vdGhpbmcsIGJ1dCBpdCBoYXMgdG8gYmUgaGVyZVxyXG59O1xyXG5cclxuTWFwT3ZlcmxheS5wcm90b3R5cGUub25SZW1vdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgLy9EbyBub3RoaW5nLCBidXQgaXQgaGFzIHRvIGJlIGhlcmVcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwT3ZlcmxheTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxuXHJcbnZhciBNb3VzZUNsaWNrVGlsZSA9IHJlcXVpcmUoJy4vTW91c2VDbGlja1RpbGUuanN4Jyk7XHJcbnZhciBNYXBMYWJlbHNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcclxudmFyIE1vdXNlQ2xpY2tMYXllciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJNb3VzZUNsaWNrTGF5ZXJcIixcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsYWJlbHM6IFtdXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIE1hcExhYmVsc1N0b3JlLmV2ZW50cy5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpICB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIGxhYmVsczogTWFwTGFiZWxzU3RvcmUuZ2V0TGFiZWxzKClcclxuICAgICAgfSlcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyUG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbGFiZWxzID0gdGhpcy5zdGF0ZS5sYWJlbHM7XHJcbiAgICByZXR1cm4gbGFiZWxzLm1hcChmdW5jdGlvbihsYWJlbCkgIHtcclxuXHJcbiAgICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KE1vdXNlQ2xpY2tUaWxlLCB7bGFiZWw6IGxhYmVsLCBrZXk6IGxhYmVsLm1hcFBsYWNlLnBsYWNlLmlkICsgXCJsYWJlbFwifSlcclxuICAgIH0pXHJcbiAgfSxcclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb3VzZS1jbGlja3Mtb3ZlcmxheSBtYXAtb3ZlcmxheVwifSwgXHJcbiAgICAgICAgdGhpcy5yZW5kZXJQb2ludHMoKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2VDbGlja0xheWVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBTZWFyY2hGb3JtU3RvcmUgPSByZXF1aXJlKCcuLy4uLy4uL21vZHVsZXMvc3RvcmVzL1NlYXJjaEZvcm1TdG9yZS5qc3gnKTtcclxudmFyIE1hcExhYmVsc1N0b3JlID0gcmVxdWlyZSgnLi8uLi8uLi9tb2R1bGVzL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcclxudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9tb2R1bGVzL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4Jyk7XHJcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSAod2luZG93LlJlYWN0KS5hZGRvbnMuUHVyZVJlbmRlck1peGluO1xyXG5cclxudmFyIE1vdXNlQ2xpY2tUaWxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIk1vdXNlQ2xpY2tUaWxlXCIsXHJcblxyXG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXHJcblxyXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdtb3VzZW92ZXInLCB0aGlzLm9uTW91c2VPdmVyKTtcclxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ21vdXNlb3V0JywgdGhpcy5vbk1vdXNlT3V0KTtcclxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ2NvbnRleHRtZW51JywgdGhpcy5vblJpZ2h0Q2xpY2spO1xyXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIodGhpcy5yZWZzLnRpbGUuZ2V0RE9NTm9kZSgpLCAnY2xpY2snLCB0aGlzLm9uQ2xpY2spO1xyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBnb29nbGUubWFwcy5ldmVudC5jbGVhckxpc3RlbmVycyh0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdtb3VzZW92ZXInKTtcclxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmNsZWFyTGlzdGVuZXJzKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ21vdXNlb3V0Jyk7XHJcbiAgICBnb29nbGUubWFwcy5ldmVudC5jbGVhckxpc3RlbmVycyh0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdjb250ZXh0bWVudScpO1xyXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuY2xlYXJMaXN0ZW5lcnModGhpcy5yZWZzLnRpbGUuZ2V0RE9NTm9kZSgpLCAnY2xpY2snKTtcclxuICAgIC8vZ29vZ2xlLm1hcHMuZXZlbnQucmVtb3ZlRG9tTGlzdGVuZXIodGhpcy5yZWZzLmxhYmVsLmdldERPTU5vZGUoKSwgJ2NvbnRleHRtZW51JywgdGhpcy5vblJpZ2h0Q2xpY2spO1xyXG4gIH0sXHJcblxyXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5zZXRMYWJlbE92ZXIodGhpcy5wcm9wcy5sYWJlbCk7XHJcbiAgfSxcclxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5zZXRMYWJlbE91dCh0aGlzLnByb3BzLmxhYmVsKTtcclxuICB9LFxyXG4gIG9uUmlnaHRDbGljazogZnVuY3Rpb24gKGUpIHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2V0RmllbGQoXCJvcmlnaW5cIiwgbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiB0aGlzLnByb3BzLmxhYmVsLm1hcFBsYWNlLnBsYWNlfSksIFwic2VsZWN0XCIpO1xyXG4gICAgU2VhcmNoRm9ybVN0b3JlLnNlYXJjaCgpO1xyXG4gIH0sXHJcbiAgb25DbGljazogZnVuY3Rpb24gKGUpIHtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2V0RmllbGQoXCJkZXN0aW5hdGlvblwiLCBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicGxhY2VcIiwgdmFsdWU6IHRoaXMucHJvcHMubGFiZWwubWFwUGxhY2UucGxhY2V9KSwgXCJzZWxlY3RcIik7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2VhcmNoKCk7XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc3R5bGUgPSB7XHJcbiAgICAgIHRvcDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi55LFxyXG4gICAgICBsZWZ0OiB0aGlzLnByb3BzLmxhYmVsLnBvc2l0aW9uLnhcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHRoaXMucHJvcHMubGFiZWwuc2hvd0Z1bGxMYWJlbCkge1xyXG4gICAgICBzdHlsZS5tYXJnaW5Ub3AgPSAtODtcclxuICAgICAgc3R5bGUubWFyZ2luTGVmdCA9IC04O1xyXG4gICAgICBzdHlsZS53aWR0aCA9IDE2O1xyXG4gICAgICBzdHlsZS5oZWlnaHQgPSAxNjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0eWxlLm1hcmdpblRvcCA9IC01O1xyXG4gICAgICBzdHlsZS5tYXJnaW5MZWZ0ID0gLTU7XHJcbiAgICAgIHN0eWxlLndpZHRoID0gMTA7XHJcbiAgICAgIHN0eWxlLmhlaWdodCA9IDEwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7cmVmOiBcInRpbGVcIiwgY2xhc3NOYW1lOiBcIm1vdXNlLWNsaWNrLWZpZWxkXCIsIHN0eWxlOiBzdHlsZX0pXHJcbiAgICApXHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW91c2VDbGlja1RpbGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9ICh3aW5kb3cuUmVhY3QpLmFkZG9ucy5QdXJlUmVuZGVyTWl4aW47XHJcbnZhciBQcmljZSA9IHJlcXVpcmUoJy4vLi4vY29tcG9uZW50cy9QcmljZS5qc3gnKTtcclxuXHJcbnZhciBQbGFjZUxhYmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlTGFiZWxcIixcclxuXHJcbiAgbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbGFiZWwgPSB0aGlzLnByb3BzLmxhYmVsO1xyXG4gICAgdmFyIG1hcFBsYWNlID0gbGFiZWwubWFwUGxhY2U7XHJcbiAgICB2YXIgc3R5bGUgPSB7XHJcbiAgICAgIHRvcDogbGFiZWwucG9zaXRpb24ueSxcclxuICAgICAgbGVmdDogbGFiZWwucG9zaXRpb24ueFxyXG4gICAgfTtcclxuICAgIHZhciBmdWxsTGFiZWw7XHJcbiAgICB2YXIgcHJpY2U7XHJcbiAgICB2YXIgbGFiZWxUZXh0ID0gbWFwUGxhY2UucGxhY2Uuc2hvcnROYW1lO1xyXG4gICAgdmFyIGNsYXNzTmFtZSA9IFwiY2l0eS1sYWJlbFwiO1xyXG4gICAgdmFyIGZsYWdUZXh0ID0gXCJcIjtcclxuICAgIGlmIChtYXBQbGFjZS5wcmljZSAmJiBtYXBQbGFjZS5mbGFnICE9IFwib3JpZ2luXCIpIHtcclxuICAgICAgdmFyIHByaWNlU3R5bGUgPSB7fTtcclxuICAgICAgLy9pZiAoIXdpbmRvdy5DT0xPUlNfTElHSFRORVNTKSB7XHJcbiAgICAgIC8vICB3aW5kb3cuQ09MT1JTX0xJR0hUTkVTUyA9IDM1O1xyXG4gICAgICAvL31cclxuICAgICAgLy9IVUVcclxuICAgICAgLy9wcmljZVN0eWxlLmNvbG9yID0gXCJoc2xhKFwiK3BhcnNlSW50KCAoMS10aGlzLnByb3BzLmxhYmVsLnJlbGF0aXZlUHJpY2UpICoxMTUpK1wiLCAxMDAlLCBcIit3aW5kb3cuQ09MT1JTX0xJR0hUTkVTUytcIiUsIDEpXCI7XHJcbiAgICAgIC8vTElHSFRORVNTXHJcbiAgICAgIC8vcHJpY2VTdHlsZS5jb2xvciA9IFwiaHNsYSgxMTUsIDEwMCUsIFwiK3BhcnNlSW50KCAoMS10aGlzLnByb3BzLmxhYmVsLnJlbGF0aXZlUHJpY2UpICo0MCkrXCIlLCAxKVwiO1xyXG4gICAgICAvL1NBVFVSQVRJT05cclxuICAgICAgLy9wcmljZVN0eWxlLmNvbG9yID0gXCJoc2xhKDExNSwgXCIrcGFyc2VJbnQoICgxLXRoaXMucHJvcHMubGFiZWwucmVsYXRpdmVQcmljZSkqKDEtdGhpcy5wcm9wcy5sYWJlbC5yZWxhdGl2ZVByaWNlKSooMS10aGlzLnByb3BzLmxhYmVsLnJlbGF0aXZlUHJpY2UpKigxLXRoaXMucHJvcHMubGFiZWwucmVsYXRpdmVQcmljZSkqKDEtdGhpcy5wcm9wcy5sYWJlbC5yZWxhdGl2ZVByaWNlKSAqMTAwKStcIiUsIFwiK3dpbmRvdy5DT0xPUlNfTElHSFRORVNTK1wiJSwgMSlcIjtcclxuICAgICAgcHJpY2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImNpdHktbGFiZWwtcHJpY2VcIiwgc3R5bGU6IHByaWNlU3R5bGV9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFByaWNlLCBudWxsLCBtYXBQbGFjZS5wcmljZSkpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdHlsZS5tYXJnaW5Ub3AgPSAyO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtYXBQbGFjZS5mbGFnID09IFwib3JpZ2luXCIpIHtcclxuICAgICAgLy9mbGFnVGV4dCA9IDxzcGFuIGNsYXNzTmFtZT1cImZsYWctdGV4dFwiPkZyb206IDwvc3Bhbj47XHJcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBmbGFnLVwiK21hcFBsYWNlLmZsYWc7XHJcbiAgICAgIHN0eWxlLm1hcmdpblRvcCA9IHByaWNlID8gLTkgOiAtMjtcclxuICAgIH0gZWxzZSBpZiAobWFwUGxhY2UuZmxhZyA9PSBcImRlc3RpbmF0aW9uXCIpIHtcclxuICAgICAgLy9mbGFnVGV4dCA9IDxzcGFuIGNsYXNzTmFtZT1cImZsYWctdGV4dFwiPlRvOiA8L3NwYW4+O1xyXG4gICAgICBjbGFzc05hbWUgKz0gXCIgZmxhZy1cIittYXBQbGFjZS5mbGFnO1xyXG4gICAgICBzdHlsZS5tYXJnaW5Ub3AgPSBwcmljZSA/IC05IDogLTI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1hcFBsYWNlLmZsYWcpIHtcclxuICAgICAgc3R5bGUuekluZGV4ID0gMjtcclxuICAgIH0gZWxzZSBpZiAobGFiZWwuaG92ZXIpIHtcclxuICAgICAgc3R5bGUuekluZGV4ID0gMztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN0eWxlLnpJbmRleCA9IDE7XHJcbiAgICB9XHJcbiAgICBpZiAobGFiZWwuc2hvd0Z1bGxMYWJlbCB8fCBtYXBQbGFjZS5mbGFnIHx8IGxhYmVsLmhvdmVyKSB7XHJcbiAgICAgIGZ1bGxMYWJlbCA9IChcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJjaXR5LWxhYmVsLXRpdGxlXCJ9LCBsYWJlbFRleHQpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnJcIiwgbnVsbCksIFxyXG4gICAgICAgICAgcHJpY2VcclxuICAgICAgICApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7cmVmOiBcImxhYmVsXCIsIHN0eWxlOiBzdHlsZSwgY2xhc3NOYW1lOiBjbGFzc05hbWV9LCBcclxuICAgICAgICBmdWxsTGFiZWxcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxufSk7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZUxhYmVsO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSAod2luZG93LlJlYWN0KS5hZGRvbnMuUHVyZVJlbmRlck1peGluO1xyXG5cclxudmFyIFBvaW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBvaW50XCIsXHJcblxyXG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXHJcblxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGltYWdlID0gXCJ4XCI7XHJcbiAgICB2YXIgbWFwUGxhY2UgPSB0aGlzLnByb3BzLmxhYmVsLm1hcFBsYWNlO1xyXG4gICAgdmFyIHN0eWxlID0ge1xyXG4gICAgICB0b3A6IHRoaXMucHJvcHMubGFiZWwucG9zaXRpb24ueSxcclxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi54XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh0aGlzLnByb3BzLmxhYmVsLnNob3dGdWxsTGFiZWwpIHtcclxuICAgICAgaW1hZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHtzdHlsZTogc3R5bGUsIHNyYzogXCIvaW1hZ2VzL21hcmtlcnMvY2l0eS5wbmdcIn0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpbWFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwge3N0eWxlOiBzdHlsZSwgc3JjOiBcIi9pbWFnZXMvbWFya2Vycy9jaXR5U21hbGwucG5nXCJ9KVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnByb3BzLmxhYmVsLmhvdmVyKSB7XHJcbiAgICAgIGltYWdlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7c3R5bGU6IHN0eWxlLCBzcmM6IFwiL2ltYWdlcy9tYXJrZXJzL2NpdHlXaXRoUHJpY2UucG5nXCJ9KVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChtYXBQbGFjZS5mbGFnID09IFwib3JpZ2luXCIpIHtcclxuICAgICAgaW1hZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHtzdHlsZTogc3R5bGUsIHNyYzogXCIvaW1hZ2VzL21hcmtlcnMvY2l0eVdpdGhQcmljZS5wbmdcIn0pXHJcbiAgICB9XHJcbiAgICBpZiAobWFwUGxhY2UuZmxhZyA9PSBcImRlc3RpbmF0aW9uXCIpIHtcclxuICAgICAgaW1hZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW1nXCIsIHtzdHlsZTogc3R5bGUsIHNyYzogXCIvaW1hZ2VzL21hcmtlcnMvY2l0eVdpdGhQcmljZS5wbmdcIn0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGltYWdlXHJcbiAgfVxyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSAod2luZG93LlJlYWN0KS5hZGRvbnMuUHVyZVJlbmRlck1peGluO1xyXG5cclxudmFyIFBvaW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBvaW50XCIsXHJcblxyXG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXHJcblxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNpemUgPSAxNjtcclxuICAgIHZhciBjb2xvcjtcclxuICAgIHZhciBtYXBQbGFjZSA9IHRoaXMucHJvcHMubGFiZWwubWFwUGxhY2U7XHJcblxyXG4gICAgaWYgKHRoaXMucHJvcHMubGFiZWwuc2hvd0Z1bGxMYWJlbCkge1xyXG4gICAgICBzaXplID0gMTZcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNpemUgPSA4XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucHJvcHMubGFiZWwuaG92ZXIpIHtcclxuICAgICAgY29sb3IgPSBcIiM0Y2JkNWZcIjtcclxuICAgICAgc2l6ZSA9IHRoaXMucHJvcHMubGFiZWwuc2hvd0Z1bGxMYWJlbCA/IDE4IDogMTJcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLnByb3BzLmxhYmVsLm1hcFBsYWNlLnByaWNlKSB7XHJcbiAgICAgICAgY29sb3IgPSBcIiMyRDc1Q0RcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb2xvciA9IFwiIzk5OTk5OVwiO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1hcFBsYWNlLmZsYWcgPT0gXCJvcmlnaW5cIikge1xyXG4gICAgICBjb2xvciA9IFwiI2JkNGM0Y1wiO1xyXG4gICAgICBzaXplID0gdGhpcy5wcm9wcy5sYWJlbC5zaG93RnVsbExhYmVsID8gMTggOiAxMlxyXG4gICAgfVxyXG4gICAgaWYgKG1hcFBsYWNlLmZsYWcgPT0gXCJkZXN0aW5hdGlvblwiKSB7XHJcbiAgICAgIGNvbG9yID0gXCIjNGNiZDVmXCI7XHJcbiAgICAgIHNpemUgPSB0aGlzLnByb3BzLmxhYmVsLnNob3dGdWxsTGFiZWwgPyAxOCA6IDEyXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0eWxlID0ge1xyXG4gICAgICB0b3A6IHRoaXMucHJvcHMubGFiZWwucG9zaXRpb24ueSAtIHNpemUvMixcclxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi54IC0gc2l6ZS8yLFxyXG4gICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiXHJcbiAgICB9O1xyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3ZnXCIsIHtoZWlnaHQ6IHNpemUsIHdpZHRoOiBzaXplLCBzdHlsZTogc3R5bGV9LCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiY2lyY2xlXCIsIHtjeDogc2l6ZS8yLCBjeTogc2l6ZS8yLCByOiBzaXplLzIsIGZpbGw6IFwiI2RkZFwifSksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJjaXJjbGVcIiwge2N4OiBzaXplLzIsIGN5OiBzaXplLzIsIHI6IChzaXplLzIpLTEsIGZpbGw6IFwiI2ZmZlwifSksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJjaXJjbGVcIiwge2N4OiBzaXplLzIsIGN5OiBzaXplLzIsIHI6IChzaXplKS80LCBmaWxsOiBjb2xvcn0pXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnQ7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XHJcbnZhciBNYXBMYWJlbHNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcclxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9Qb2ludC5qc3gnKTtcclxuXHJcblxyXG52YXIgUG9pbnRzTGF5ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUG9pbnRzTGF5ZXJcIixcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsYWJlbHM6IFtdXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIE1hcExhYmVsc1N0b3JlLmV2ZW50cy5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpICB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIGxhYmVsczogTWFwTGFiZWxzU3RvcmUuZ2V0TGFiZWxzKClcclxuICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gIH0sXHJcblxyXG4gIHJlbmRlclBvaW50czogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGxhYmVscyA9IHRoaXMuc3RhdGUubGFiZWxzO1xyXG4gICAgcmV0dXJuIGxhYmVscy5tYXAoZnVuY3Rpb24obGFiZWwpICB7XHJcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChQb2ludCwge2tleTogbGFiZWwubWFwUGxhY2UucGxhY2UuaWQsIGxhYmVsOiBsYWJlbH0pKVxyXG4gICAgfSlcclxuICB9LFxyXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInBvaW50cy1vdmVybGF5IG1hcC1vdmVybGF5XCJ9LCBcclxuICAgICAgICB0aGlzLnJlbmRlclBvaW50cygpXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcblxyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50c0xheWVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xyXG52YXIgTWFwTGFiZWxzU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvTWFwTGFiZWxzU3RvcmUuanN4Jyk7XHJcbnZhciBQb2ludFNWRyA9IHJlcXVpcmUoJy4vUG9pbnRTVkcuanN4Jyk7XHJcblxyXG5cclxudmFyIFBvaW50c0xheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBvaW50c0xheWVyXCIsXHJcblxyXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGFiZWxzOiBbXVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBNYXBMYWJlbHNTdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSAge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBsYWJlbHM6IE1hcExhYmVsc1N0b3JlLmdldExhYmVscygpXHJcbiAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICByZW5kZXJQb2ludHM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBsYWJlbHMgPSB0aGlzLnN0YXRlLmxhYmVscztcclxuICAgIHJldHVybiBsYWJlbHMubWFwKGZ1bmN0aW9uKGxhYmVsKSAge1xyXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoUG9pbnRTVkcsIHtrZXk6IGxhYmVsLm1hcFBsYWNlLnBsYWNlLmlkLCBsYWJlbDogbGFiZWx9KSlcclxuICAgIH0pXHJcbiAgfSxcclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwb2ludHMtc3ZnLW92ZXJsYXkgbWFwLW92ZXJsYXlcIn0sIFxyXG4gICAgICAgIHRoaXMucmVuZGVyUG9pbnRzKClcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUG9pbnRzTGF5ZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIE1vZGFsTWVudU1peGluID0ge1xyXG5cclxuICByZW5kZXJCb2R5OiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcclxuICAgIGlmICghbW9kZSApIHtcclxuICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbiAgICB2YXIgbWV0aG9kTmFtZSA9IFwicmVuZGVyXCIrbW9kZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1vZGUuc2xpY2UoMSk7XHJcbiAgICBpZiAodGhpc1ttZXRob2ROYW1lXSkge1xyXG4gICAgICByZXR1cm4gdGhpc1ttZXRob2ROYW1lXSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gc3VjaCBtZXRob2Q6IFwiICsgbWV0aG9kTmFtZSlcclxuICAgIH1cclxuICB9LFxyXG5cclxuICByZW5kZXJNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XHJcbiAgICB2YXIgbW9kZU9wdGlvbnMgPSBbXTtcclxuICAgIGZvciAodmFyIGltb2RlIGluIHRoaXMucHJvcHMubW9kZXMpIHtcclxuICAgICAgaWYgKHRoaXMucHJvcHMubW9kZXNbaW1vZGVdKSB7XHJcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IFwibW9kZS1cIitpbW9kZTtcclxuICAgICAgICBpZiAobW9kZSA9PSBpbW9kZSkge1xyXG4gICAgICAgICAgY2xhc3NOYW1lICs9IFwiIGFjdGl2ZVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtb2RlT3B0aW9ucy5wdXNoKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogaW1vZGUsIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBvbkNsaWNrOiAgdGhpcy5zd2l0Y2hNb2RlVG9GdW5jKGltb2RlKSB9LCAgdGhpcy5nZXRNb2RlTGFiZWwoaW1vZGUpICkpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RlLXNlbGVjdG9yXCJ9LCBcclxuICAgICAgICAgIG1vZGVPcHRpb25zXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsTWVudU1peGluO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIGlzSUUgPSByZXF1aXJlKCcuL3Rvb2xzL2lzSUUuanMnKTtcclxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcclxudmFyIFRyYW4gPSByZXF1aXJlKCcuL1RyYW4uanN4Jyk7XHJcbnZhciAkID0gKHdpbmRvdy4kKTtcclxuXHJcblxyXG52YXIgTW9kYWxQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiTW9kYWxQaWNrZXJcIixcclxuXHJcbiAgLy9nZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xyXG4gIC8vICByZXR1cm4ge1xyXG4gIC8vICAgIHNob3duOiBmYWxzZVxyXG4gIC8vICB9O1xyXG4gIC8vfSxcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHdpbmRvd1dpZHRoOiAkKHdpbmRvdykud2lkdGgoKSxcclxuICAgICAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgY2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKHRoaXMucmVmcy5pbm5lcikge1xyXG4gICAgICBpZiAoJCh0aGlzLnJlZnMuaW5uZXIuZ2V0RE9NTm9kZSgpKS5oYXMoZS50YXJnZXQpLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMucHJvcHMuaW5wdXRFbGVtZW50KSB7XHJcbiAgICAgIGlmICgkKHRoaXMucHJvcHMuaW5wdXRFbGVtZW50KS5pcyhlLnRhcmdldCkpIHJldHVybjtcclxuICAgICAgaWYgKCQodGhpcy5wcm9wcy5pbnB1dEVsZW1lbnQpLmhhcyhlLnRhcmdldCkubGVuZ3RoKSByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmhpZGUoKTtcclxuICB9LFxyXG5cclxuICB3aW5kb3dSZXNpemVkOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgLy9UT0RPIGNoZWNrIHBlcmZvcm1hbmNlIGFuZCBldmVudHVhbGx5IG1ha2Ugc29tZSBkZWxheWVkIHJlc2l6ZVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgIHdpbmRvd1dpZHRoOiAkKHdpbmRvdykud2lkdGgoKSxcclxuICAgICAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIGhpZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMucHJvcHMub25IaWRlKCk7XHJcbiAgfSxcclxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja091dHNpZGUsIGZhbHNlKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLndpbmRvd1Jlc2l6ZWQpO1xyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrT3V0c2lkZSwgZmFsc2UpO1xyXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMud2luZG93UmVzaXplZCk7XHJcbiAgfSxcclxuXHJcbiAgY2FsY3VsYXRlU3R5bGVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoaXNJRSg4LCdsdGUnKSkge1xyXG4gICAgICByZXR1cm4ge307XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlY3Q7XHJcbiAgICB2YXIgbWFyZ2luTGVmdCA9IDA7XHJcbiAgICBpZiAodGhpcy5yZWZzLm91dGVyKSB7XHJcbiAgICAgIHJlY3QgPSB0aGlzLnJlZnMub3V0ZXIuZ2V0RE9NTm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICB2YXIgc3R5bGUgPSB0aGlzLnJlZnMub3V0ZXIuZ2V0RE9NTm9kZSgpLnN0eWxlO1xyXG4gICAgICBpZiAoc3R5bGUubWFyZ2luTGVmdCkge1xyXG4gICAgICAgIG1hcmdpbkxlZnQgPSBwYXJzZUludChzdHlsZS5tYXJnaW5MZWZ0LnN1YnN0cmluZygwLHN0eWxlLm1hcmdpbkxlZnQubGVuZ3RoLTIpLDEwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBwYWdlV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcclxuICAgIHZhciB3aWR0aCA9IHRoaXMucHJvcHMuY29udGVudFNpemUud2lkdGg7XHJcbiAgICB2YXIgb2Zmc2V0ID0gKCFyZWN0KT8wOihyZWN0LmxlZnQgLSBtYXJnaW5MZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0KTtcclxuICAgIHZhciBtYXhXaWR0aCA9IHBhZ2VXaWR0aDtcclxuICAgIHZhciBvdXRlclN0eWxlcztcclxuICAgIHZhciBhZGRDbGFzcyA9IFwiXCI7XHJcblxyXG4gICAgaWYgKHdpZHRoID4gbWF4V2lkdGgpIHtcclxuICAgICAgLy9tYWtlIHNtYWxsZXIgdmVyc2lvblxyXG4gICAgICBhZGRDbGFzcyA9IFwiY29tcGFjdC1zaXplXCI7XHJcbiAgICAgIGlmICh0aGlzLnByb3BzLmNvbnRlbnRTaXplLndpZHRoQ29tcGFjdCkge1xyXG4gICAgICAgIHdpZHRoID0gdGhpcy5wcm9wcy5jb250ZW50U2l6ZS53aWR0aENvbXBhY3Q7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChvZmZzZXQgKyB3aWR0aCA8PSBtYXhXaWR0aCkge1xyXG4gICAgICAvL0tFRVAgSVRcclxuICAgICAgb3V0ZXJTdHlsZXMgPSB7XHJcbiAgICAgICAgbWFyZ2luTGVmdDogMCxcclxuICAgICAgICB3aWR0aDogd2lkdGhcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSBpZiAob2Zmc2V0ICsgd2lkdGggPiBtYXhXaWR0aCAmJiB3aWR0aCA8IG1heFdpZHRoKSB7XHJcbiAgICAgIC8vTU9WRSBJVFxyXG4gICAgICB2YXIgbWlzc2luZ1NwYWNlID0gb2Zmc2V0ICsgd2lkdGggLSBtYXhXaWR0aDtcclxuICAgICAgb3V0ZXJTdHlsZXMgPSB7XHJcbiAgICAgICAgbWFyZ2luTGVmdDogMCAtIG1pc3NpbmdTcGFjZSxcclxuICAgICAgICB3aWR0aDogd2lkdGhcclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG91dGVyU3R5bGVzID0ge1xyXG4gICAgICAgIG1hcmdpbkxlZnQ6IDAsXHJcbiAgICAgICAgd2lkdGg6IFwiMTAwJVwiXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBvdXRlcjogb3V0ZXJTdHlsZXMsXHJcbiAgICAgIGFkZENsYXNzOiBhZGRDbGFzc1xyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBjYWxjdWxhdGVPdXRlclN0eWxlczogZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKGlzSUUoOCwnbHRlJykpIHtcclxuICAgICAgcmV0dXJuIHt9O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBzdHlsZXMgPSB0aGlzLmNhbGN1bGF0ZVN0eWxlcygpO1xyXG4gICAgdmFyIGNsYXNzTmFtZSA9IFwic2VhcmNoLW1vZGFsIFwiICsgKHN0eWxlcy5hZGRDbGFzcyA/IHN0eWxlcy5hZGRDbGFzcyA6IFwiXCIpO1xyXG5cclxuICAgIC8vVE9ETyBkZWNpZGUgaWYgcHV0IHRoZXJlIGNsb3NlIGJ1dHRvbiBvciBub3RcclxuICAgIC8vPGRpdiBjbGFzc05hbWU9XCJjbG9zZS1idXR0b25cIiBvbmNsaWNrPXt0aGlzLmhpZGV9PjxUcmFuIHRLZXk9XCJjbG9zZVwiPmNsb3NlPC9UcmFuPjwvZGl2PlxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHJlZjogXCJvdXRlclwiLCBzdHlsZTogc3R5bGVzLm91dGVyfSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInNlYXJjaC1tb2RhbC1jb250ZW50XCIsIHJlZjogXCJpbm5lclwifSwgdGhpcy5wcm9wcy5jaGlsZHJlbilcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbFBpY2tlcjtcclxuXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIE1vZGFsUGlja2VyID0gcmVxdWlyZShcIi4vLi4vTW9kYWxQaWNrZXIuanN4XCIpO1xyXG52YXIgUGxhY2VQaWNrZXIgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzL1BsYWNlUGlja2VyLmpzeFwiKTtcclxudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZShcIi4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3hcIik7XHJcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcclxuXHJcbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcclxuICBpbml0aWFsVmFsdWU6IG5ldyBTZWFyY2hQbGFjZSgpLFxyXG4gIGxvY2FsZTogXCJlblwiLFxyXG4gIHNpemVzOiB7XHJcbiAgICBhbGw6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXHJcbiAgICBuZWFyYnk6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXHJcbiAgICBjaGVhcGVzdDoge3dpZHRoOiA2MDAsIGhlaWdodDogMjAwfSxcclxuICAgIGNpdGllc0FuZEFpcnBvcnRzOiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxyXG4gICAgY291bnRyaWVzOiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxyXG4gICAgYW55d2hlcmU6IHt3aWR0aDogMTY5LCBoZWlnaHQ6IDIwMH0sXHJcbiAgICByYWRpdXM6IHt3aWR0aDogMTY5LCBoZWlnaHQ6IDIwMH1cclxuICB9LFxyXG4gIG1vZGVzOiB7XHJcbiAgICBcImFsbFwiOiB7fSxcclxuICAgIFwibmVhcmJ5XCI6IHt9LFxyXG4gICAgXCJjaGVhcGVzdFwiOiB7fSxcclxuICAgIFwiY2l0aWVzQW5kQWlycG9ydHNcIjoge30sXHJcbiAgICBcImNvdW50cmllc1wiOiB7fSxcclxuICAgIFwiYW55d2hlcmVcIjoge30sXHJcbiAgICBcInJhZGl1c1wiOiB7fVxyXG4gIH1cclxufTtcclxuXHJcbnZhciBQbGFjZVBpY2tlck1vZGFsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlUGlja2VyTW9kYWxcIixcclxuICBnZXRPcHRpb25zOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBkZWVwbWVyZ2UoZGVmYXVsdE9wdGlvbnMsdGhpcy5wcm9wcy5vcHRpb25zKTtcclxuICB9LFxyXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgb3B0aW9uczoge31cclxuICAgIH1cclxuICB9LFxyXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb250ZW50U2l6ZToge3dpZHRoOiAxNjksIGhlaWdodDogMjAwfVxyXG4gICAgfTtcclxuICB9LFxyXG4gIG9uVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSwgY2hhbmdlVHlwZSkge1xyXG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSk7XHJcbiAgfSxcclxuICBvblNpemVDaGFuZ2U6IGZ1bmN0aW9uIChzaXplcykge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgIGNvbnRlbnRTaXplOiBzaXplc1xyXG4gICAgfSk7XHJcbiAgfSxcclxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG9wdGlvbnMgPSBkZWVwbWVyZ2UoZGVmYXVsdE9wdGlvbnMsdGhpcy5nZXRPcHRpb25zKCkpO1xyXG4gICAgaWYgKCF0aGlzLnByb3BzLnNob3duKSB7cmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKX1cclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kYWxQaWNrZXIsIHtjb250ZW50U2l6ZTogdGhpcy5zdGF0ZS5jb250ZW50U2l6ZSwgaW5wdXRFbGVtZW50OiB0aGlzLnByb3BzLmlucHV0RWxlbWVudCwgb25IaWRlOiB0aGlzLnByb3BzLm9uSGlkZX0sIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VQaWNrZXIsIHt2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgcmVmOiBcInBsYWNlUGlja2VyXCIsIG9uQ2hhbmdlOiB0aGlzLm9uVmFsdWVDaGFuZ2UsIHNpemVzOiBvcHRpb25zLnNpemVzLCBtb2Rlczogb3B0aW9ucy5tb2Rlcywgb25TaXplQ2hhbmdlOiB0aGlzLm9uU2l6ZUNoYW5nZX1cclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcblxyXG59KTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlUGlja2VyTW9kYWw7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxudmFyIHRlc3RTaGl0ID0gbnVsbDtcclxuXHJcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xyXG5SZWFjdC5pbml0aWFsaXplVG91Y2hFdmVudHModHJ1ZSk7XHJcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vLi4vdHIuanMnKTtcclxuXHJcbnZhciBQbGFjZXMgPSByZXF1aXJlKCcuL1BsYWNlcy5qc3gnKTtcclxudmFyIE1vZGFsTWVudU1peGluID0gcmVxdWlyZSgnLi8uLi8uLi9Nb2RhbE1lbnVNaXhpbi5qc3gnKTtcclxudmFyIFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xyXG52YXIgU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4Jyk7XHJcbnZhciBSYWRpdXMgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvUmFkaXVzLmpzeCcpO1xyXG5cclxudmFyIGFpcnBvcnRzQW5kQ2l0aWVzVHlwZXMgPSBbUGxhY2UuVFlQRV9DSVRZLCBQbGFjZS5UWVBFX0FJUlBPUlRdO1xyXG52YXIgY291bnRyeVR5cGVzID0gW1BsYWNlLlRZUEVfQ09VTlRSWV07XHJcblxyXG52YXIgUGxhY2VQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUGxhY2VQaWNrZXJcIixcclxuICBtaXhpbnM6IFtNb2RhbE1lbnVNaXhpbl0sXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHZpZXdNb2RlOiB0aGlzLmdldERlZmF1bHRNb2RlKClcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICBsYW5nOiAnZW4nXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGdldERlZmF1bHRNb2RlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAvL0ZJUlNUIFZFUlNJT04gLSBBTEwgQU5EIENPVU5UUklFU1xyXG5cclxuICAgIC8vaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSAhPSBcInRleHRcIiB8fCB0aGlzLnByb3BzLnZhbHVlLmlzRGVmYXVsdCkge1xyXG4gICAgLy8gIHJldHVybiBcImNvdW50cmllc1wiO1xyXG4gICAgLy99IGVsc2Uge1xyXG4gICAgLy8gIHJldHVybiBcImFsbFwiO1xyXG4gICAgLy99XHJcblxyXG4gICAgLy9TRUNPTkQgVkVSU0lPTlxyXG5cclxuICAgIC8vaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcInBsYWNlXCIpIHtcclxuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcclxuICAgIC8vfSBlbHNlIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJ0ZXh0XCIpIHtcclxuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcclxuICAgIC8vfSBlbHNlIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XHJcbiAgICAvLyAgcmV0dXJuIFwiYW55d2hlcmVcIjtcclxuICAgIC8vfSBlbHNlIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJyYWRpdXNcIikge1xyXG4gICAgLy8gIHJldHVybiBcInJhZGl1c1wiO1xyXG4gICAgLy99IGVsc2Uge1xyXG4gICAgLy8gIHJldHVybiBcImFsbFwiO1xyXG4gICAgLy99XHJcblxyXG4gICAgLy9USElSRCBWRVJTSU9OXHJcbiAgICBpZiAodGhpcy5wcm9wcy52YWx1ZS5mb3JtTW9kZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy52YWx1ZS5mb3JtTW9kZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBcImFsbFwiO1xyXG4gICAgfVxyXG5cclxuICB9LFxyXG5cclxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG1vZGUgPSB0aGlzLnN0YXRlLnZpZXdNb2RlO1xyXG4gICAgdGhpcy5wcm9wcy5vblNpemVDaGFuZ2UodGhpcy5wcm9wcy5zaXplc1ttb2RlXSk7XHJcbiAgfSxcclxuXHJcbiAgLy9UT0RPIG1vdmUgaXQgdG8gb3B0aW9uc1xyXG4gIGdldE1vZGVMYWJlbDogZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgIHZhciBtb2RlTGFiZWxzID0ge1xyXG4gICAgICBhbGw6IHRyKFwiQWxsIHBsYWNlc1wiLFwiYWxsX3BsYWNlc1wiKSxcclxuICAgICAgbmVhcmJ5OiB0cihcIk5lYXJieVwiLFwibmVhcmJ5XCIpLFxyXG4gICAgICBjaGVhcGVzdDogdHIoXCJDaGVhcGVzdFwiLFwiY2hlYXBlc3RcIiksXHJcbiAgICAgIGNpdGllc0FuZEFpcnBvcnRzOiB0cihcIkNpdGllcyBhbmQgYWlycG9ydHNcIixcImNpdGllc19hbmRfYWlycG9ydHNcIiksXHJcbiAgICAgIGNvdW50cmllczogdHIoXCJDb3VudHJpZXNcIixcImNvdW50cmllc1wiKSxcclxuICAgICAgYW55d2hlcmU6IHRyKFwiQW55d2hlcmVcIixcImFueXdoZXJlXCIpLFxyXG4gICAgICByYWRpdXM6IHRyKFwiUmFkaXVzIHNlYXJjaFwiLFwicmFkaXVzX3NlYXJjaFwiKVxyXG4gICAgfTtcclxuICAgIHJldHVybiBtb2RlTGFiZWxzW21vZGVdO1xyXG4gIH0sXHJcblxyXG4gIHN3aXRjaE1vZGVUbzogZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgIGlmIChtb2RlID09IFwicmFkaXVzXCIpIHtcclxuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicmFkaXVzXCIsIHZhbHVlOiBuZXcgUmFkaXVzKCl9KSwgXCJzZWxlY3RSYWRpdXNcIik7XHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XHJcbiAgICAgIHRoaXMuc2VsZWN0VmFsdWUobmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcImFueXdoZXJlXCJ9KSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMudmFsdWUsIFwiY2hhbmdlTW9kZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnByb3BzLm9uU2l6ZUNoYW5nZSh0aGlzLnByb3BzLnNpemVzW21vZGVdKTtcclxuICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICB2aWV3TW9kZTogbW9kZVxyXG4gICAgfSk7XHJcbiAgfSxcclxuXHJcbiAgc3dpdGNoTW9kZVRvRnVuYzogZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbigpICB7XHJcbiAgICAgIHRoaXMuc3dpdGNoTW9kZVRvKG1vZGUpXHJcbiAgICB9LmJpbmQodGhpcylcclxuICB9LFxyXG5cclxuICBjaGVja01vZGU6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJ0ZXh0XCIgJiYgIXRoaXMucHJvcHMudmFsdWUuaXNEZWZhdWx0KSB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXdNb2RlICE9IFwiYWxsXCIpIHtcclxuICAgICAgICB0aGlzLnN3aXRjaE1vZGVUbyhcImFsbFwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XHJcbiAgICBpZiAobmV4dFByb3BzLnZhbHVlICE9IHRoaXMucHJvcHMudmFsdWUpIHtcclxuICAgICAgdGhpcy5jaGVja01vZGUoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBzZWxlY3RWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICBpZiAoIXZhbHVlKSB7XHJcbiAgICAgIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTsgLy9pZiBuZXcgdmFsdWUgaXMgbnVsbCBpdCBtZWFudCBpIHdhbnQgdG8ga2VlcCB0aGUgc2FtZSwgaXQgYmVoYXZlcyBhcyBpdCB3YXMgc2VsZWN0ZWRcclxuICAgIH1cclxuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUuc2V0KFwiZm9ybU1vZGVcIix0aGlzLnN0YXRlLnZpZXdNb2RlKSwgXCJzZWxlY3RcIik7XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyQWxsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlfSk7XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyTmVhcmJ5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlLCBuZWFyYnk6IHRydWV9KTtcclxuICB9LFxyXG5cclxuICByZW5kZXJDaGVhcGVzdDogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFwic3NzXCIpKVxyXG4gIH0sXHJcblxyXG4gIHJlbmRlckNpdGllc0FuZEFpcnBvcnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlLCB0eXBlczogYWlycG9ydHNBbmRDaXRpZXNUeXBlc30pO1xyXG4gIH0sXHJcblxyXG4gIHJlbmRlckNvdW50cmllczogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VzLCB7c2VhcmNoOiB0aGlzLnByb3BzLnZhbHVlLCBvblNlbGVjdDogdGhpcy5zZWxlY3RWYWx1ZSwgdHlwZXM6IGNvdW50cnlUeXBlc30pO1xyXG4gIH0sXHJcblxyXG4gIHJlbmRlckFueXdoZXJlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpXHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyUmFkaXVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpXHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogJ3NlYXJjaC1wbGFjZS1waWNrZXIgc2VhcmNoLXBpY2tlciAnK21vZGV9LCBcclxuICAgICAgICAgdGhpcy5yZW5kZXJNZW51KCksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb250ZW50XCJ9LCBcclxuICAgICAgICAgICB0aGlzLnJlbmRlckJvZHkoKSBcclxuICAgICAgICApLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxhY2VQaWNrZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXHJcbnZhciBQbGFjZVJvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQbGFjZVJvd1wiLFxyXG4gIGNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHRoaXMucHJvcHMucGxhY2UpO1xyXG4gIH0sXHJcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcGxhY2UgPSB0aGlzLnByb3BzLnBsYWNlO1xyXG4gICAgdmFyIGNsYXNzTmFtZSA9IFwicGxhY2Utcm93XCI7XHJcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xyXG4gICAgICBjbGFzc05hbWUgKz0gXCIgc2VsZWN0ZWRcIjtcclxuICAgIH1cclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLmNsaWNrfSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJuYW1lXCJ9LCBcclxuICAgICAgICAgIHBsYWNlLmdldE5hbWUoKVxyXG4gICAgICAgICksIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwidHlwZVwifSwgXHJcbiAgICAgICAgICBwbGFjZS5nZXRUeXBlKClcclxuICAgICAgICApXHJcbiAgICAgIClcclxuICAgIClcclxuICB9XHJcbn0pO1xyXG4gbW9kdWxlLmV4cG9ydHMgPSBQbGFjZVJvdztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUGxhY2VzQVBJID0gcmVxdWlyZSgnLi8uLi8uLi9BUElzL1BsYWNlc0FQSUNhY2hlZC5qc3gnKTtcclxudmFyIFBsYWNlUm93ID0gcmVxdWlyZSgnLi9QbGFjZVJvdy5qc3gnKTtcclxudmFyIEdlb2xvY2F0aW9uID0gcmVxdWlyZSgnLi8uLi8uLi9HZW9sb2NhdGlvbi5qc3gnKTtcclxudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xyXG52YXIgT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi8uLi8uLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xyXG52YXIgUGxhY2UgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvUGxhY2UuanN4Jyk7XHJcbmZ1bmN0aW9uIGZpbmRQb3Mob2JqKSB7XHJcbiAgdmFyIGN1cnRvcCA9IDA7XHJcbiAgaWYgKG9iai5vZmZzZXRQYXJlbnQpIHtcclxuICAgIGRvIHtcclxuICAgICAgY3VydG9wICs9IG9iai5vZmZzZXRUb3A7XHJcbiAgICB9IHdoaWxlIChvYmogPSBvYmoub2Zmc2V0UGFyZW50KTtcclxuICAgIHJldHVybiBbY3VydG9wXTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBQbGFjZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUGxhY2VzXCIsXHJcblxyXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGFzdFNlYXJjaDogbnVsbCxcclxuICAgICAgbGFzdFR5cGVzOiBudWxsLFxyXG4gICAgICBsYXN0TmVhcmJ5OiBudWxsLFxyXG4gICAgICBwbGFjZXM6IFtdLFxyXG4gICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMSxcclxuICAgICAgYXBpRXJyb3I6IGZhbHNlLFxyXG4gICAgICBsb2FkaW5nOiBmYWxzZVxyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGtleXByZXNzOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKGUua2V5SWRlbnRpZmllciA9PSBcIlVwXCIpIHtcclxuICAgICAgdGhpcy5tb3ZlVXAoKTtcclxuICAgIH0gZWxzZSBpZiAoZS5rZXlJZGVudGlmaWVyID09IFwiRG93blwiKSB7XHJcbiAgICAgIHRoaXMubW92ZURvd24oKTtcclxuICAgIH0gZWxzZSBpZiAoZS5rZXlJZGVudGlmaWVyID09IFwiRW50ZXJcIikge1xyXG4gICAgICB0aGlzLnNlbGVjdEZyb21JbmRleCgpO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4ID49IDApIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4IC0gMVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoIC0gMVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4IDwgdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IHRoaXMuc3RhdGUua2V5U2VsZWN0ZWRJbmRleCArIDFcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IDBcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBzZWxlY3RGcm9tSW5kZXg6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggPj0gMCkge1xyXG4gICAgICB0aGlzLnNlbGVjdCh0aGlzLnN0YXRlLnBsYWNlc1t0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXhdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnJlZnMucGxhY2VzICYmIHRoaXMucmVmcy5zZWxlY3RlZFBsYWNlKSB7XHJcbiAgICAgIHZhciBwbGFjZXNFbGVtZW50ID0gdGhpcy5yZWZzLnBsYWNlcy5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHZhciBzZWxlY3RlZEVsZW1lbnQgPSB0aGlzLnJlZnMuc2VsZWN0ZWRQbGFjZS5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHBsYWNlc0VsZW1lbnQuc2Nyb2xsVG9wID0gZmluZFBvcyhzZWxlY3RlZEVsZW1lbnQpIC0gMjAwO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuY2hlY2tOZXdQbGFjZXMoKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5cHJlc3MpO1xyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5cHJlc3MpO1xyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5jaGVja05ld1BsYWNlcygpO1xyXG4gICAgdGhpcy5hZGp1c3RTY3JvbGwoKTtcclxuICB9LFxyXG5cclxuICBmaWx0ZXJQbGFjZXNCeVR5cGU6IGZ1bmN0aW9uIChwbGFjZXMgLCB0eXBlcykge1xyXG4gICAgaWYgKHR5cGVzKSB7XHJcbiAgICAgIHJldHVybiBwbGFjZXMuZmlsdGVyKGZ1bmN0aW9uKHBsYWNlKSAge1xyXG4gICAgICAgIHJldHVybiB0eXBlcy5pbmRleE9mKHBsYWNlLmdldFR5cGVJZCgpKSAhPSAtMTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gcGxhY2VzO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8vVE9ETyByZWZhY3RvcmUgLSBuZWFyYnkgc2hvdWxkIGJlIHNlcGFyYXRlIGZyb20gdGV4dFxyXG4gIHNldFNlYXJjaDogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHBsYWNlU2VhcmNoID0gdGhpcy5tYWtlU2VhcmNoUGFyYW1zKCk7XHJcbiAgICB2YXIgcGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSSh7bGFuZzogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTtcclxuICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICBzZWFyY2hUZXh0OiBwbGFjZVNlYXJjaFxyXG4gICAgfSk7XHJcbiAgICB2YXIgY2FsbEZ1bmNQYXJhbTtcclxuXHJcbiAgICBjYWxsRnVuY1BhcmFtID0gcGxhY2VzQVBJLmZpbmRQbGFjZXMocGxhY2VTZWFyY2gpO1xyXG5cclxuICAgIGNhbGxGdW5jUGFyYW0udGhlbihmdW5jdGlvbihwbGFjZXMpICB7XHJcbiAgICAgIGlmIChwbGFjZVNlYXJjaCAhPSB0aGlzLnN0YXRlLnNlYXJjaFRleHQgfHwgIXRoaXMuaXNNb3VudGVkKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgcGxhY2VzID0gdGhpcy5maWx0ZXJQbGFjZXNCeVR5cGUocGxhY2VzLCB0aGlzLnByb3BzLnR5cGVzKTtcclxuXHJcbiAgICAgIGlmIChwbGFjZVNlYXJjaC50eXBlSUQgPT09IFBsYWNlLlRZUEVfQ09VTlRSWSkge1xyXG4gICAgICAgIHBsYWNlcyA9IHBsYWNlcy5jb25jYXQoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpICB7IC8vLmNvbmNhdCgpIGlzIGhlcmUgdG8gbWFrZSBjb3B5IG9mIGFycmF5XHJcbiAgICAgICAgICByZXR1cm4gKGIudmFsdWUgPCBhLnZhbHVlKT8gMSA6IC0xXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2VzID0gcGxhY2VzLnNsaWNlKDAsNTApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBwbGFjZXM6IHBsYWNlcyxcclxuICAgICAgICBhcGlFcnJvcjogZmFsc2UsXHJcbiAgICAgICAgbG9hZGluZzogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSAge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgcGxhY2VzOiBbXSxcclxuICAgICAgICBhcGlFcnJvcjogdHJ1ZSxcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxyXG4gICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuXHJcbiAgc2VsZWN0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHRoaXMucHJvcHMub25TZWxlY3QoIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogdmFsdWV9KSApO1xyXG4gIH0sXHJcblxyXG4gIG1vdmVOZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHRoaXMucHJvcHMub25TZWxlY3QobnVsbCwgXCJuZXh0XCIpO1xyXG4gIH0sXHJcblxyXG4gIGdldFNlYXJjaFRleHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnByb3BzLnNlYXJjaC5tb2RlID09IFwidGV4dFwiICYmICF0aGlzLnByb3BzLnNlYXJjaC5pc0RlZmF1bHQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuc2VhcmNoLmdldFRleHQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG1ha2VTZWFyY2hQYXJhbXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwYXJhbXMgPSB7fTtcclxuICAgIGlmICh0aGlzLnByb3BzLm5lYXJieSkge1xyXG4gICAgICBwYXJhbXMuYm91bmRzID0gR2VvbG9jYXRpb24uZ2V0Q3VycmVudEJvdW5kcygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcGFyYW1zLnRlcm0gPSB0aGlzLmdldFNlYXJjaFRleHQoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnByb3BzLnR5cGVzICYmIHRoaXMucHJvcHMudHlwZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgcGFyYW1zLnR5cGVJRCA9IHRoaXMucHJvcHMudHlwZXNbMF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyYW1zO1xyXG4gIH0sXHJcblxyXG4gIGNoZWNrTmV3UGxhY2VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VhcmNoVGV4dCA9IHRoaXMuZ2V0U2VhcmNoVGV4dCgpO1xyXG4gICAgaWYgKHRoaXMuc3RhdGUubGFzdFNlYXJjaCAhPT0gc2VhcmNoVGV4dCB8fCB0aGlzLnN0YXRlLmxhc3RUeXBlcyAhPSB0aGlzLnByb3BzLnR5cGVzIHx8IHRoaXMuc3RhdGUubGFzdE5lYXJieSAhPSB0aGlzLnByb3BzLm5lYXJieSkge1xyXG4gICAgICB0aGlzLnNldFNlYXJjaCgpO1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBsYXN0U2VhcmNoOiBzZWFyY2hUZXh0LFxyXG4gICAgICAgIGxhc3RUeXBlczogdGhpcy5wcm9wcy50eXBlcyxcclxuICAgICAgICBsYXN0TmVhcmJ5OiB0aGlzLnByb3BzLm5lYXJieSxcclxuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuXHJcbiAgcmVuZGVyUGxhY2VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcGxhY2VzID0gdGhpcy5zdGF0ZS5wbGFjZXM7XHJcbiAgICB2YXIgc2VsZWN0ZWQgPSBwbGFjZXNbdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4XTtcclxuICAgIHJldHVybiBwbGFjZXMubWFwKGZ1bmN0aW9uKHBsYWNlKSAge1xyXG4gICAgICBpZiAoc2VsZWN0ZWQgPT0gcGxhY2UpIHtcclxuICAgICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VSb3csIHtyZWY6IFwic2VsZWN0ZWRQbGFjZVwiLCBzZWxlY3RlZDogc2VsZWN0ZWQgPT0gcGxhY2UsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdCwgcGxhY2U6IHBsYWNlfSkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlUm93LCB7b25TZWxlY3Q6IHRoaXMuc2VsZWN0LCBwbGFjZTogcGxhY2V9KSlcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBsb2FkZXJDbGFzcyA9IFwibG9hZGVyIFwiICsgKHRoaXMuc3RhdGUubG9hZGluZyA/IFwibG9hZGluZ1wiIDogXCJub3QtbG9hZGluZ1wiKTtcclxuICAgIHZhciBub1Jlc3VsdHNDbGFzcyA9IFwibm8tcmVzdWx0c1wiO1xyXG4gICAgaWYgKCF0aGlzLnN0YXRlLmxvYWRpbmcgJiYgdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoID09IDApIHtcclxuICAgICAgbm9SZXN1bHRzQ2xhc3MgKz0gXCIgc2hvd25cIlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGxvYWRlckNsYXNzfSwgXCJMb2FkaW5nLi4uXCIpLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IG5vUmVzdWx0c0NsYXNzfSwgXCJObyByZXN1bHRzXCIpLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwicGxhY2VzXCIsIGNsYXNzTmFtZTogXCJwbGFjZXNcIn0sIFxyXG4gICAgICAgICAgdGhpcy5yZW5kZXJQbGFjZXMoKVxyXG4gICAgICAgIClcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxhY2VzO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xyXG52YXIgVHJhbnNsYXRlID0gcmVxdWlyZSgnLi8uLi9UcmFuc2xhdGUuanN4Jyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJleHBvcnRzXCIsXHJcblxyXG4gIGNvbXBvbmVudERpZE1vdW50OmZ1bmN0aW9uKCkge1xyXG4gICAgLy9UT0RPIGFkZCBhcnJvd1xyXG5cclxuICAgIC8vdmFyIHRvZ2dsZSA9IHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xyXG4gICAgLy92YXIgcGFzc2VuZ2VycyA9IHRoaXMucmVmcy5wYXNzZW5nZXJzLmdldERPTU5vZGUoKTtcclxuICAgIC8vJCh0b2dnbGUpLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgIC8vICAkKHBhc3NlbmdlcnMpLmNsaWNrKCk7XHJcbiAgICAvL30pO1xyXG4gICAgLy90b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XHJcbiAgICAvLyAgY29uc29sZS5kZWJ1ZyhcImNsaWNrXCIpO1xyXG4gICAgLy8gIHZhciBldmVudCA9IG5ldyBNb3VzZUV2ZW50KCdjbGljaycsIHtcclxuICAgIC8vICAgICd2aWV3Jzogd2luZG93LFxyXG4gICAgLy8gICAgJ2J1YmJsZXMnOiB0cnVlLFxyXG4gICAgLy8gICAgJ2NhbmNlbGFibGUnOiB0cnVlXHJcbiAgICAvLyAgfSk7XHJcbiAgICAvLyAgcGFzc2VuZ2Vycy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgIC8vfSk7XHJcbiAgfSxcclxuXHJcbiAgLy88YiByZWY9XCJ0b2dnbGVcIiBjbGFzc05hbWU9XCJ0b2dnbGVcIj5cclxuICAvLyAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtY2FyZXQtZG93blwiPjwvaT5cclxuICAvLzwvYj5cclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJmaWVsZHNldFwiLCB7cmVmOiBcInR5cGVQYXNzZW5nZXJzXCIsIGNsYXNzTmFtZTogXCJwYXNzZW5nZXJzXCJ9LCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiaGVhZFwifSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwge2ZvcjogXCJwYXNzZW5nZXJzXCJ9LCBcclxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuc2xhdGUsIHt0S2V5OiBcImVtYWlscy5jb21tb24ucGFzc2VuZ2Vyc1wifSwgXCJQYXNzZW5nZXJzXCIpLCBcIjpcIiksIFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImljb24gZmEgZmEtdXNlclwifSlcclxuICAgICAgICAgICksIFxyXG5cclxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwYXNzZW5nZXItc2VsZWN0LXdyYXBwZXJcIn0sIFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic2VsZWN0XCIsIHtuYW1lOiBcInBhc3NlbmdlcnNcIiwgcmVmOiBcInBhc3NlbmdlcnNcIiwgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlfSwgXHJcbiAgICAgICAgICAgICAgWzEsMiwzLDQsNSw2LDcsOCw5XS5tYXAoZnVuY3Rpb24obnVtKSAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIsIHt2YWx1ZTogbnVtfSwgbnVtKSlcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICApXHJcbiAgICAgICAgKVxyXG4gICAgICApXHJcbiAgICApXHJcbiAgfVxyXG59KTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cclxudmFyIERhdGVQaWNrZXJNb2RhbCA9IHJlcXVpcmUoJy4vLi4vRGF0ZVBpY2tlci9EYXRlUGlja2VyTW9kYWwuanN4Jyk7XHJcbnZhciBQbGFjZVBpY2tlck1vZGFsID0gcmVxdWlyZSgnLi8uLi9QbGFjZVBpY2tlci9QbGFjZVBpY2tlck1vZGFsLmpzeCcpO1xyXG5cclxuXHJcbnZhciBTZWFyY2hGb3JtU3RvcmUgPSByZXF1aXJlKCcuLy4uL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4Jyk7XHJcblxyXG52YXIgU2VhcmNoRGF0ZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCcpO1xyXG52YXIgU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4Jyk7XHJcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vdHIuanMnKTtcclxudmFyIFRyYW4gPSByZXF1aXJlKCcuLy4uL1RyYW4uanN4Jyk7XHJcbnZhciBUb2dnbGVBY3RpdmUgPSByZXF1aXJlKCcuL1RvZ2dsZUFjdGl2ZS5qc3gnKTtcclxudmFyIFBhc3NlbmdlcnNGaWVsZCA9IHJlcXVpcmUoJy4vUGFzc2VuZ2Vyc0ZpZWxkLmpzeCcpO1xyXG5cclxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcclxuXHJcbnZhciBvcHRpb25zID0ge1xyXG4gIG9yaWdpbjoge1xyXG4gICAgbW9kZXM6IHtcclxuICAgICAgYWxsOiB0cnVlLFxyXG4gICAgICBuZWFyYnk6IHRydWUsXHJcbiAgICAgIGNoZWFwZXN0OiBmYWxzZSxcclxuICAgICAgY2l0aWVzQW5kQWlycG9ydHM6IGZhbHNlLFxyXG4gICAgICBjb3VudHJpZXM6IHRydWUsXHJcbiAgICAgIGFueXdoZXJlOiBmYWxzZSxcclxuICAgICAgcmFkaXVzOiB0cnVlXHJcbiAgICB9XHJcbiAgfSxcclxuICBkZXN0aW5hdGlvbjoge1xyXG4gICAgbW9kZXM6IHtcclxuICAgICAgYWxsOiB0cnVlLFxyXG4gICAgICBuZWFyYnk6IGZhbHNlLFxyXG4gICAgICBjaGVhcGVzdDogZmFsc2UsXHJcbiAgICAgIGNpdGllc0FuZEFpcnBvcnRzOiBmYWxzZSxcclxuICAgICAgY291bnRyaWVzOiB0cnVlLFxyXG4gICAgICBhbnl3aGVyZTogdHJ1ZSxcclxuICAgICAgcmFkaXVzOiB0cnVlXHJcbiAgICB9XHJcbiAgfSxcclxuICBkYXRlRnJvbToge1xyXG4gICAgbW9kZXM6IHtcclxuICAgICAgc2luZ2xlOiB0cnVlLFxyXG4gICAgICBpbnRlcnZhbDogdHJ1ZSxcclxuICAgICAgbW9udGg6IHRydWUsXHJcbiAgICAgIHRpbWVUb1N0YXk6IGZhbHNlLFxyXG4gICAgICBhbnl0aW1lOiB0cnVlLFxyXG4gICAgICBub1JldHVybjogZmFsc2VcclxuICAgIH1cclxuICB9LFxyXG4gIGRhdGVUbzoge1xyXG4gICAgbW9kZXM6IHtcclxuICAgICAgc2luZ2xlOiB0cnVlLFxyXG4gICAgICBpbnRlcnZhbDogdHJ1ZSxcclxuICAgICAgbW9udGg6IHRydWUsXHJcbiAgICAgIHRpbWVUb1N0YXk6IHRydWUsXHJcbiAgICAgIGFueXRpbWU6IHRydWUsXHJcbiAgICAgIG5vUmV0dXJuOiB0cnVlXHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuXHJcbnZhciBTZWFyY2hGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlNlYXJjaEZvcm1cIixcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGFjdGl2ZTogKHR5cGVvZiB0aGlzLnByb3BzLmRlZmF1bHRBY3RpdmUgPT0gXCJ1bmRlZmluZWRcIik/IFwib3JpZ2luXCIgOiB0aGlzLnByb3BzLmRlZmF1bHRBY3RpdmUsXHJcbiAgICAgIGRhdGE6IFNlYXJjaEZvcm1TdG9yZS5kYXRhXHJcbiAgICB9O1xyXG4gIH0sXHJcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgfSxcclxuICBjcmVhdGVNb2RhbENvbnRhaW5lcjogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xyXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZGl2LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbW9kYWwtY29udGFpbmVyLWVsZW1lbnQnKTtcclxuICAgIC8vV0hFUkUgVE8gQVBQRU5EIElUP1xyXG4gICAgdGhpcy5yZWZzW2ZpZWxkTmFtZStcIk91dGVyXCJdLmdldERPTU5vZGUoKS5hcHBlbmRDaGlsZChkaXYpO1xyXG4gICAgcmV0dXJuIGRpdjtcclxuICB9LFxyXG5cclxuICBjaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgIGRhdGE6IFNlYXJjaEZvcm1TdG9yZS5kYXRhXHJcbiAgICB9KVxyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudFdpbGxNb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuZXZlbnRzLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZUxpc3RlbmVyKTtcclxuICB9LFxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuZXZlbnRzLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZUxpc3RlbmVyKTtcclxuICB9LFxyXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcclxuICAgIHRoaXMucmVmcmVzaEZvY3VzKCk7XHJcblxyXG4gICAgLy9Db21wbGV0ZSBwcmV2aW91cyBmaWVsZFxyXG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlICE9IHByZXZTdGF0ZS5hY3RpdmUpIHtcclxuICAgICAgaWYgKHByZXZTdGF0ZS5hY3RpdmUgPT0gXCJvcmlnaW5cIiB8fCBwcmV2U3RhdGUuYWN0aXZlID09IFwiZGVzdGluYXRpb25cIikge1xyXG4gICAgICAgIFNlYXJjaEZvcm1TdG9yZS5jb21wbGV0ZUZpZWxkKHByZXZTdGF0ZS5hY3RpdmUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcclxuICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUuZGF0YVtmaWVsZE5hbWVdO1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIFwiXCI7XHJcbiAgICBpZiAoZmllbGROYW1lID09IFwib3JpZ2luXCIgfHwgZmllbGROYW1lID09IFwiZGVzdGluYXRpb25cIikge1xyXG4gICAgICByZXR1cm4gdmFsdWUuZ2V0VGV4dCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHZhbHVlLmZvcm1hdCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG5leHRGaWVsZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIHZhciBvcmRlciA9IFtcclxuICAgICAgXCJvcmlnaW5cIixcclxuICAgICAgXCJkZXN0aW5hdGlvblwiLFxyXG4gICAgICBcImRhdGVGcm9tXCIsXHJcbiAgICAgIFwiZGF0ZVRvXCIsXHJcbiAgICAgIFwic3VibWl0QnV0dG9uXCJcclxuICAgIF07XHJcbiAgICB2YXIgbmV3QWN0aXZlO1xyXG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlKSB7XHJcbiAgICAgIHZhciBpbmRleCA9IG9yZGVyLmluZGV4T2YodGhpcy5zdGF0ZS5hY3RpdmUpO1xyXG4gICAgICB2YXIgbmV3SW5kZXg7XHJcbiAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IDMpIHtcclxuICAgICAgICBuZXdBY3RpdmUgPSBvcmRlcltpbmRleCsxXTtcclxuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSA0KSB7XHJcbiAgICAgICAgLy9UT0RPIGZvY3VzIG9uIHNlYXJjaCBidG5cclxuICAgICAgICBuZXdBY3RpdmUgPSBudWxsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5ld0FjdGl2ZSA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5ld0FjdGl2ZSA9IFwib3JpZ2luXCI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgYWN0aXZlOiBuZXdBY3RpdmVcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgY2hhbmdlVmFsdWVGdW5jOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGNoYW5nZVR5cGUpICB7XHJcbiAgICAgIGlmIChjaGFuZ2VUeXBlID09IFwiY2hhbmdlTW9kZVwiKSB7XHJcbiAgICAgICAgLy90aGlzLnJlZnNbZmllbGROYW1lXS5nZXRET01Ob2RlKCkuZm9jdXMoKTtcclxuICAgICAgICAvL1RPRE8gcmV0dXJuIGhlcmU/Pz9cclxuICAgICAgfVxyXG4gICAgICBpZiAoY2hhbmdlVHlwZSA9PSBcInNlbGVjdFwiKSB7XHJcbiAgICAgICAgdGhpcy5uZXh0RmllbGQoKTtcclxuICAgICAgfSBlbHNlIGlmIChjaGFuZ2VUeXBlID09IFwic2VsZWN0UmFkaXVzXCIpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIGFjdGl2ZTogbnVsbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIFNlYXJjaEZvcm1TdG9yZS5zZXRWYWx1ZSh0aGlzLnN0YXRlLmRhdGEuY2hhbmdlRmllbGQoZmllbGROYW1lLCB2YWx1ZSksIGNoYW5nZVR5cGUpO1xyXG5cclxuICAgIH0uYmluZCh0aGlzKVxyXG4gIH0sXHJcblxyXG4gIG9uRm9jdXNGdW5jOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKSAge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBhY3RpdmU6IGZpZWxkTmFtZVxyXG4gICAgICB9KTtcclxuICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS5kYXRhW2ZpZWxkTmFtZV07XHJcbiAgICAgIGlmICh2YWx1ZS5tb2RlICE9IFwidGV4dFwiIHx8IHZhbHVlLmlzRGVmYXVsdCkge1xyXG4gICAgICAgIHRoaXMucmVmc1tmaWVsZE5hbWVdLmdldERPTU5vZGUoKS5zZWxlY3QoKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgfSxcclxuXHJcbiAgY2hhbmdlVGV4dEZ1bmM6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcclxuICAgIGlmIChmaWVsZE5hbWUgPT0gXCJvcmlnaW5cIiB8fCBmaWVsZE5hbWUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSAge1xyXG4gICAgICAgIHZhciBhZGRTdGF0ZSA9IHt9O1xyXG4gICAgICAgIFNlYXJjaEZvcm1TdG9yZS5zZXRWYWx1ZSh0aGlzLnN0YXRlLmRhdGEuY2hhbmdlRmllbGQoZmllbGROYW1lLCBuZXcgU2VhcmNoUGxhY2UoZS50YXJnZXQudmFsdWUpKSwgXCJjaGFuZ2VUZXh0XCIpO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoYWRkU3RhdGUpO1xyXG4gICAgICB9LmJpbmQodGhpcylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbigpICB7fTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBjaGFuZ2VQYXNzZW5nZXJzOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgIHZhciBudW1iZXIgPSBldmVudC50YXJnZXQudmFsdWU7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2V0RmllbGQoXCJwYXNzZW5nZXJzXCIsIG51bWJlciwgXCJzZWxlY3RcIik7XHJcbiAgfSxcclxuXHJcbiAgdG9nZ2xlQWN0aXZlOiBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcclxuICAgICAgaWYgKHR5cGUgPT0gdGhpcy5zdGF0ZS5hY3RpdmUpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIGFjdGl2ZTogXCJcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMub25Gb2N1c0Z1bmModHlwZSkoKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgfSxcclxuICBvbkNsaWNrSW5uZXI6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH0sXHJcblxyXG4gIG9uSW5wdXRLZXlEb3duOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKGUua2V5ID09IFwiQXJyb3dVcFwiIHx8IGUua2V5ID09IFwiQXJyb3dEb3duXCIgIHx8IGUua2V5ID09IFwiRW50ZXJcIikge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcmVmcmVzaEZvY3VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZG9tTm9kZTtcclxuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSkge1xyXG4gICAgICBkb21Ob2RlID0gdGhpcy5yZWZzW3RoaXMuc3RhdGUuYWN0aXZlXS5nZXRET01Ob2RlKCk7XHJcbiAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9IGRvbU5vZGUpIHtcclxuICAgICAgICBkb21Ob2RlLmZvY3VzKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlICE9IFwic3VibWl0QnV0dG9uXCIpIHtcclxuICAgICAgICAgIHZhciBhY3RpdmVWYWx1ZSA9IHRoaXMuc3RhdGUuZGF0YVt0aGlzLnN0YXRlLmFjdGl2ZV07XHJcbiAgICAgICAgICBpZiAoYWN0aXZlVmFsdWUubW9kZSAhPSBcInRleHRcIiB8fCBhY3RpdmVWYWx1ZS5pc0RlZmF1bHQpIHtcclxuICAgICAgICAgICAgZG9tTm9kZS5zZWxlY3QoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBzZWFyY2g6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2VhcmNoKCk7XHJcbiAgfSxcclxuXHJcbiAgZ2V0RmllbGRMYWJlbDogZnVuY3Rpb24gKG1vZGUpIHtcclxuICAgIHZhciBtb2RlTGFiZWxzID0ge1xyXG4gICAgICBvcmlnaW46IHRyKFwiRnJvbVwiLFwiZnJvbVwiKSxcclxuICAgICAgZGVzdGluYXRpb246IHRyKFwiVG9cIixcInRvXCIpLFxyXG4gICAgICBkYXRlRnJvbTogdHIoXCJEZXBhcnRcIixcImRhdGVcIiksXHJcbiAgICAgIGRhdGVUbzogdHIoXCJSZXR1cm5cIixcInJldHVyblwiKVxyXG4gICAgfTtcclxuICAgIHJldHVybiBtb2RlTGFiZWxzW21vZGVdO1xyXG4gIH0sXHJcblxyXG4gIHJlbmRlck1vZGFsOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XHJcblxyXG4gICAgdmFyIFhQaWNrZXJNb2RhbDtcclxuICAgIGlmIChmaWVsZE5hbWUgPT0gXCJvcmlnaW5cIiB8fCBmaWVsZE5hbWUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XHJcbiAgICAgIFhQaWNrZXJNb2RhbCA9IFBsYWNlUGlja2VyTW9kYWw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBYUGlja2VyTW9kYWwgPSBEYXRlUGlja2VyTW9kYWw7XHJcbiAgICB9XHJcbiAgICB2YXIgb25IaWRlID0gZnVuY3Rpb24oKSAge1xyXG4gICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUgPT0gZmllbGROYW1lKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICBhY3RpdmU6IFwiXCJcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcbiAgICB2YXIgaW5wdXRFbGVtZW50ID0gbnVsbDtcclxuICAgIGlmICh0aGlzLnJlZnNbZmllbGROYW1lICsgXCJPdXRlclwiXSkge1xyXG4gICAgICBpbnB1dEVsZW1lbnQgPSB0aGlzLnJlZnNbZmllbGROYW1lICsgXCJPdXRlclwiXS5nZXRET01Ob2RlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoWFBpY2tlck1vZGFsLCB7XHJcbiAgICAgIGlucHV0RWxlbWVudDogaW5wdXRFbGVtZW50LCBcclxuICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuZGF0YVtmaWVsZE5hbWVdLCBcclxuICAgICAgb25IaWRlOiBvbkhpZGUsIFxyXG4gICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZUZ1bmMoZmllbGROYW1lKSwgXHJcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNbZmllbGROYW1lXSwgXHJcbiAgICAgIHNob3duOiBmaWVsZE5hbWUgPT0gdGhpcy5zdGF0ZS5hY3RpdmV9XHJcbiAgICApKVxyXG5cclxuICB9LFxyXG4gIHJlbmRlcklucHV0OiBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICB2YXIgY2xhc3NOYW1lID0gdHlwZTtcclxuICAgIGlmICh0aGlzLnN0YXRlLmRhdGFbdHlwZV0uZXJyb3IpIHtcclxuICAgICAgY2xhc3NOYW1lICs9IFwiIGVycm9yXCJcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnN0YXRlLmRhdGFbdHlwZV0ubG9hZGluZykge1xyXG4gICAgICBjbGFzc05hbWUgKz0gXCIgbG9hZGluZ1wiXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZmllbGRzZXRcIiwge1xyXG4gICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBcclxuICAgICAgICByZWY6IHR5cGUgKyBcIk91dGVyXCJcclxuXHJcbiAgICAgIH0sIFxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge3JlZjogdHlwZSArIFwiSGVhZFwiLCBjbGFzc05hbWU6IFwiaGVhZFwifSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwge29uQ2xpY2s6IHRoaXMudG9nZ2xlQWN0aXZlKHR5cGUpfSwgdGhpcy5nZXRGaWVsZExhYmVsKHR5cGUpKSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImlucHV0LXdyYXBwZXJcIn0sIFxyXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmdldEZvcm1hdHRlZFZhbHVlKHR5cGUpLCBcclxuICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLm9uQ2xpY2tJbm5lciwgXHJcbiAgICAgICAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzRnVuYyh0eXBlKSwgXHJcbiAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLm9uSW5wdXRLZXlEb3duLCBcclxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIiwgXHJcbiAgICAgICAgICAgICAgcmVmOiB0eXBlLCBcclxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VUZXh0RnVuYyh0eXBlKSwgXHJcbiAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiBcIm9mZlwiLCBcclxuICAgICAgICAgICAgICByZWFkT25seTogKHR5cGUgPT0gXCJkYXRlRnJvbVwiIHx8IHR5cGUgPT0gXCJkYXRlVG9cIil9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICksIFxyXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1zcGlubmVyXCJ9KSwgXHJcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFRvZ2dsZUFjdGl2ZSwge2FjdGl2ZTogdHlwZSA9PSB0aGlzLnN0YXRlLmFjdGl2ZSwgb25Ub2dnbGU6IHRoaXMudG9nZ2xlQWN0aXZlKHR5cGUpfSlcclxuICAgICAgICApLCBcclxuICAgICAgICB0aGlzLnJlbmRlck1vZGFsKHR5cGUpXHJcbiAgICAgIClcclxuICAgIClcclxuICB9LFxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZm9ybVwiLCB7aWQ6IFwic2VhcmNoXCJ9LCBcclxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwib3JpZ2luXCIpLCBcclxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwiZGVzdGluYXRpb25cIiksIFxyXG4gICAgICAgIHRoaXMucmVuZGVySW5wdXQoXCJkYXRlRnJvbVwiKSwgXHJcbiAgICAgICAgdGhpcy5yZW5kZXJJbnB1dChcImRhdGVUb1wiKSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChQYXNzZW5nZXJzRmllbGQsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VQYXNzZW5nZXJzLCB2YWx1ZTogdGhpcy5zdGF0ZS5kYXRhLnBhc3NlbmdlcnN9KSwgXHJcblxyXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMuc2VhcmNoLCBpZDogXCJzZWFyY2gtZmxpZ2h0c1wiLCByZWY6IFwic3VibWl0QnV0dG9uXCIsIGNsYXNzTmFtZTogXCJidG4tc2VhcmNoXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW4sIHt0S2V5OiBcInNlYXJjaFwifSwgXCJTZWFyY2hcIikpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXNlYXJjaFwifSkpXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoRm9ybTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxuXHJcbnZhciBUb2dnbGVBY3RpdmUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiVG9nZ2xlQWN0aXZlXCIsXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciBmYUljb25DbGFzcyA9IFwiZmEgZmEtY2FyZXQtZG93blwiO1xyXG4gICAgaWYgKHRoaXMucHJvcHMuYWN0aXZlKSB7XHJcbiAgICAgIGZhSWNvbkNsYXNzID0gXCJmYSBmYS1jYXJldC11cFwiXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYlwiLCB7Y2xhc3NOYW1lOiBcInRvZ2dsZVwiLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uVG9nZ2xlfSwgXHJcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogZmFJY29uQ2xhc3N9KVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxufSk7XHJcbm1vZHVsZS5leHBvcnRzID0gVG9nZ2xlQWN0aXZlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xyXG5cclxuXHJcblxyXG5cclxuLyoqIERlcHJlY2F0ZWQgLSAgZG9uJ3QgdXNlICovXHJcblxyXG5cclxuXHJcblxyXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIHRyID0gcmVxdWlyZSgnLi90ci5qcycpO1xyXG5cclxuLyogcmVhY3QgY29tcG9uZW50IHdyYXBwZXIgb2YgdHIgZnVuY3Rpb24gKi9cclxuXHJcbnZhciBUcmFuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRyYW5cIixcclxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG9yaWdpbmFsID0gdGhpcy5wcm9wcy5jaGlsZHJlbjtcclxuICAgIHZhciBrZXkgPSB0aGlzLnByb3BzLnRLZXk7XHJcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5wcm9wcy52YWx1ZXM7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcclxuICAgICAgICAgdHIob3JpZ2luYWwsa2V5LHZhbHVlcykgXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHJhbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcclxudmFyIHRyYW5zbGF0ZSA9IHJlcXVpcmUoJy4vdG9vbHMvdHJhbnNsYXRlLmpzeCcpO1xyXG5cclxuLyogVE9ETyBmaW5pc2ggaXQgKi9cclxuXHJcbi8vVE9ETyBsaXN0ZW4gdG8gbGFuZ3VhZ2UgY2hhbmdlXHJcblxyXG52YXIgVHJhbnNsYXRlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRyYW5zbGF0ZVwiLFxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgb3JpZ2luYWwgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xyXG4gICAgdmFyIGtleSA9IHRoaXMucHJvcHMudEtleTtcclxuICAgIHZhciB2YWx1ZXMgPSB0aGlzLnByb3BzLnZhbHVlcztcclxuICAgIHJldHVybiAoXHJcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFxyXG4gICAgICAgICB0cmFuc2xhdGUoa2V5LHZhbHVlcyxvcmlnaW5hbCkgXHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHJhbnNsYXRlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xyXG52YXIgdHJhbnNsYXRlID0gcmVxdWlyZSgnLi8uLi90b29scy90cmFuc2xhdGUuanN4Jyk7XHJcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuLy4uL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XHJcbnZhciBQdXJlUmVuZGVyTWl4aW4gPSAod2luZG93LlJlYWN0KS5hZGRvbnMuUHVyZVJlbmRlck1peGluO1xyXG5cclxuXHJcbnZhciBQcmljZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQcmljZVwiLFxyXG4gIG1peGluczogW1B1cmVSZW5kZXJNaXhpbl0sXHJcbiAgZ2V0SW5pdGlhbFN0YXRlOmZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY3VycmVuY3k6IE9wdGlvbnNTdG9yZS5kYXRhLmN1cnJlbmN5XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgc2V0U3RhdGVGcm9tU3RvcmU6ZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgY3VycmVuY3k6IE9wdGlvbnNTdG9yZS5kYXRhLmN1cnJlbmN5XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xyXG4gICAgT3B0aW9uc1N0b3JlLmV2ZW50cy5vbihcImNoYW5nZVwiLCB0aGlzLnNldFN0YXRlRnJvbVN0b3JlKTtcclxuICB9LFxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICBPcHRpb25zU3RvcmUuZXZlbnRzLnJlbW92ZUxpc3RlbmVyKFwiY2hhbmdlXCIsIHRoaXMuc2V0U3RhdGVGcm9tU3RvcmUpO1xyXG4gIH0sXHJcblxyXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZXVyUHJpY2UgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xyXG4gICAgdmFyIGN1cnJlbmN5ID0gdGhpcy5zdGF0ZS5jdXJyZW5jeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdmFyIHByaWNlSW5DdXJyZW5jeTtcclxuICAgIGlmICh3aW5kb3cuU2t5cGlja2VyICYmIHdpbmRvdy5Ta3lwaWNrZXIuY29uZmlnLmN1cnJlbmNpZXNbY3VycmVuY3ldICYmIHdpbmRvdy5Ta3lwaWNrZXIuY29uZmlnLmN1cnJlbmNpZXNbY3VycmVuY3ldLnJhdGUpIHtcclxuICAgICAgcHJpY2VJbkN1cnJlbmN5ID0gKGV1clByaWNlIC8gd2luZG93LlNreXBpY2tlci5jb25maWcuY3VycmVuY2llc1tjdXJyZW5jeV0ucmF0ZSkudG9GaXhlZCh3aW5kb3cuU2t5cGlja2VyLmNvbmZpZy5jdXJyZW5jaWVzW2N1cnJlbmN5XS5yb3VuZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjdXJyZW5jeSA9IFwiZXVyXCI7XHJcbiAgICAgIHByaWNlSW5DdXJyZW5jeSA9IGV1clByaWNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgXHJcbiAgICAgICAgIHRyYW5zbGF0ZShcImN1cnJlbmN5LlwiK2N1cnJlbmN5LHtwcmljZTogcHJpY2VJbkN1cnJlbmN5fSwgcHJpY2VJbkN1cnJlbmN5KSBcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcmljZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cclxuZnVuY3Rpb24gSW1tdXRhYmxlKCl7XCJ1c2Ugc3RyaWN0XCI7fVxyXG5cclxuICAvKipcclxuICAgKiByZXR1cm4gbmV3IG9iamVjdCB3aXRoIGFkZGVkIGNoYW5nZXMsIGlmIG5vIGNoYW5nZSByZXR1cm4gc2FtZSBvYmplY3RcclxuICAgKiBAcGFyYW0gbmV3VmFsdWVzXHJcbiAgICogQHJldHVybnMgbmV3IG9iamVjdCBhcyBpbiBjbGFzc1xyXG4gICAqL1xyXG4gIEltbXV0YWJsZS5wcm90b3R5cGUuZWRpdD1mdW5jdGlvbihuZXdWYWx1ZXMpe1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKCFuZXdWYWx1ZXMpIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICB2YXIgbGVhc3RPbmVFZGl0ID0gZmFsc2U7XHJcbiAgICB2YXIgbmV3UGxhaW4gPSB7fTtcclxuICAgIC8vQWRkIGZyb20gdGhpc1xyXG4gICAgT2JqZWN0LmtleXModGhpcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XHJcbiAgICAgIG5ld1BsYWluW2tleV0gPSB0aGlzW2tleV07XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgLy9BZGQgZnJvbSBuZXdcclxuICAgIE9iamVjdC5rZXlzKG5ld1ZhbHVlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XHJcbiAgICAgIGlmIChuZXdQbGFpbltrZXldICE9PSBuZXdWYWx1ZXNba2V5XSkge1xyXG4gICAgICAgIG5ld1BsYWluW2tleV0gPSBuZXdWYWx1ZXNba2V5XTtcclxuICAgICAgICBsZWFzdE9uZUVkaXQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGlmIChsZWFzdE9uZUVkaXQpIHtcclxuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNsYXNzKG5ld1BsYWluKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICB9OztcclxuICAvKipcclxuICAgKiByZXR1cm4gZWRpdGVkIG9iamVjdFxyXG4gICAqIEBwYXJhbSBrZXlcclxuICAgKiBAcGFyYW0gdmFsdWVcclxuICAgKiBAcmV0dXJucyB7U2VhcmNoRGF0ZX1cclxuICAgKi9cclxuICBJbW11dGFibGUucHJvdG90eXBlLnNldD1mdW5jdGlvbihrZXksIHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgbmV3UGxhaW4gPSB7fTtcclxuICAgIG5ld1BsYWluW2tleV0gPSB2YWx1ZTtcclxuICAgIHJldHVybiB0aGlzLmVkaXQobmV3UGxhaW4pXHJcbiAgfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEltbXV0YWJsZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnLi9pbW11dGFibGUuanN4Jyk7XHJcblxyXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe01hcExhYmVsW0ltbXV0YWJsZV9fX19LZXldPUltbXV0YWJsZVtJbW11dGFibGVfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlPUltbXV0YWJsZT09PW51bGw/bnVsbDpJbW11dGFibGUucHJvdG90eXBlO01hcExhYmVsLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZJbW11dGFibGUpO01hcExhYmVsLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1NYXBMYWJlbDtNYXBMYWJlbC5fX3N1cGVyQ29uc3RydWN0b3JfXz1JbW11dGFibGU7XHJcbiAgZnVuY3Rpb24gTWFwTGFiZWwocGxhaW4pIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHRoaXMubWFwUGxhY2UgPSBwbGFpbi5tYXBQbGFjZTtcclxuICAgIHRoaXMucG9zaXRpb24gPSBwbGFpbi5wb3NpdGlvbjtcclxuICAgIHRoaXMuc2hvd0Z1bGxMYWJlbCA9IHBsYWluLnNob3dGdWxsTGFiZWw7XHJcbiAgICB0aGlzLnJlbGF0aXZlUHJpY2UgPSBwbGFpbi5yZWxhdGl2ZVByaWNlO1xyXG4gICAgdGhpcy5ob3ZlciA9IHBsYWluLmhvdmVyO1xyXG5cclxuICAgIHRoaXMuY2xhc3MgPSBNYXBMYWJlbDtcclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG5cclxuICBNYXBMYWJlbC5wcm90b3R5cGUuZWRpdD1mdW5jdGlvbihwbGFpbikge1widXNlIHN0cmljdFwiO1xyXG4gICAgLy9wcmV2ZW50IHNhbWUgcG9zaXRpb24gdG8gbWFrZSBuZXcgb2JqZWN0XHJcbiAgICBpZiAocGxhaW4ucG9zaXRpb24pIHtcclxuICAgICAgaWYgKHBsYWluLnBvc2l0aW9uLnggPT0gdGhpcy5wb3NpdGlvbi54ICYmIHBsYWluLnBvc2l0aW9uLnkgPT0gdGhpcy5wb3NpdGlvbi55KSB7XHJcbiAgICAgICAgcGxhaW4ucG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZS5lZGl0LmNhbGwodGhpcyxwbGFpbik7XHJcbiAgfTtcclxuXHJcbiAgLyogZXhwZWN0cyB0aGF0IHRoZXJlIGlzIG5vIHR3byBsYWJlbHMgd2l0aCBzYW1lIHBsYWNlICovXHJcbiAgTWFwTGFiZWwucHJvdG90eXBlLmdldElkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMubWFwUGxhY2UucGxhY2UuaWQ7XHJcbiAgfTtcclxuXHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwTGFiZWw7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlLmpzeCcpO1xyXG5cclxuZm9yKHZhciBJbW11dGFibGVfX19fS2V5IGluIEltbXV0YWJsZSl7aWYoSW1tdXRhYmxlLmhhc093blByb3BlcnR5KEltbXV0YWJsZV9fX19LZXkpKXtNYXBQbGFjZVtJbW11dGFibGVfX19fS2V5XT1JbW11dGFibGVbSW1tdXRhYmxlX19fX0tleV07fX12YXIgX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZT1JbW11dGFibGU9PT1udWxsP251bGw6SW1tdXRhYmxlLnByb3RvdHlwZTtNYXBQbGFjZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlKTtNYXBQbGFjZS5wcm90b3R5cGUuY29uc3RydWN0b3I9TWFwUGxhY2U7TWFwUGxhY2UuX19zdXBlckNvbnN0cnVjdG9yX189SW1tdXRhYmxlO1xyXG5cclxuICBmdW5jdGlvbiBNYXBQbGFjZShwbGFpbikge1widXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5wbGFjZSA9IHBsYWluLnBsYWNlO1xyXG4gICAgdGhpcy5mbGFnID0gcGxhaW4uZmxhZyB8fCBcIlwiOyAvL29yaWdpbiwgZGVzdGluYXRpb24sIHN0b3BvdmVyXHJcbiAgICB0aGlzLnByaWNlID0gcGxhaW4ucHJpY2UgfHwgbnVsbDtcclxuICAgIHRoaXMucmVsYXRpdmVQcmljZSA9IHBsYWluLnJlbGF0aXZlUHJpY2UgfHwgbnVsbDtcclxuXHJcbiAgICB0aGlzLmNsYXNzID0gTWFwUGxhY2U7XHJcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xyXG4gIH1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFBsYWNlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBSYWRpdXMgPSByZXF1aXJlKFwiLi9SYWRpdXMuanN4XCIpO1xyXG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZShcIi4vSW1tdXRhYmxlLmpzeFwiKTtcclxuXHJcbmZvcih2YXIgSW1tdXRhYmxlX19fX0tleSBpbiBJbW11dGFibGUpe2lmKEltbXV0YWJsZS5oYXNPd25Qcm9wZXJ0eShJbW11dGFibGVfX19fS2V5KSl7T3B0aW9uc1tJbW11dGFibGVfX19fS2V5XT1JbW11dGFibGVbSW1tdXRhYmxlX19fX0tleV07fX12YXIgX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZT1JbW11dGFibGU9PT1udWxsP251bGw6SW1tdXRhYmxlLnByb3RvdHlwZTtPcHRpb25zLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZJbW11dGFibGUpO09wdGlvbnMucHJvdG90eXBlLmNvbnN0cnVjdG9yPU9wdGlvbnM7T3B0aW9ucy5fX3N1cGVyQ29uc3RydWN0b3JfXz1JbW11dGFibGU7XHJcbiAgZnVuY3Rpb24gT3B0aW9ucyhwbGFpbikge1widXNlIHN0cmljdFwiO1xyXG4gICAgcGxhaW4gPSBwbGFpbiB8fCB7fTtcclxuICAgIHRoaXMubGFuZ3VhZ2UgPSBwbGFpbi5sYW5ndWFnZSB8fCBcImVuXCI7XHJcbiAgICB0aGlzLmN1cnJlbmN5ID0gcGxhaW4uY3VycmVuY3kgfHwgXCJFVVJcIjtcclxuICAgIHRoaXMuZGVmYXVsdFJhZGl1cyA9IHBsYWluLmRlZmF1bHRSYWRpdXMgfHwgbmV3IFJhZGl1cygpOyAvL1RPRE8gcmFkaXVzPz9cclxuICAgIHRoaXMuZGVmYXVsdE1hcENlbnRlciA9IHBsYWluLmRlZmF1bHRNYXBDZW50ZXIgfHwgbnVsbDsgLy9UT0RPIG1hcCBjZW50ZXJcclxuXHJcbiAgICB0aGlzLmNsYXNzID0gT3B0aW9ucztcclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT3B0aW9ucztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0eXBlSWRUb1N0cmluZyA9IGZ1bmN0aW9uKHR5cGUpIHtcblxufTtcblxuXG5cblxuICBQbGFjZS50eXBlSWRUb1N0cmluZz1mdW5jdGlvbih0eXBlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHR5cGUgPT0gUGxhY2UuVFlQRV9BSVJQT1JUKSB7XG4gICAgICByZXR1cm4gXCJhaXJwb3J0XCI7XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFBsYWNlLlRZUEVfQ09VTlRSWSkge1xuICAgICAgcmV0dXJuIFwiY291bnRyeVwiO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBQbGFjZS5UWVBFX0NJVFkpIHtcbiAgICAgIHJldHVybiBcImNpdHlcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwidW5rbm93blwiO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gUGxhY2UocGxhaW4pIHtcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3Qua2V5cyhwbGFpbikuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgICB0aGlzW2tleV0gPSBwbGFpbltrZXldO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgaWYgKCF0aGlzLnZhbHVlKSB7XG4gICAgICB0aGlzLnZhbHVlID0gXCJcIjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNvbXBsZXRlID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuY29tcGxldGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBzaG9ydCBuYW1lXG4gICAgaWYgKHRoaXMudHlwZSA9PSBQbGFjZS5UWVBFX0NJVFkpIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gdGhpcy52YWx1ZS5yZXBsYWNlKC9cXHMqXFwoLitcXCkvLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnR5cGVTdHJpbmcgPSBQbGFjZS50eXBlSWRUb1N0cmluZyh0aGlzLnR5cGUpO1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cblxuXG5cbiAgLyogRG8gbm90IHVzZSBnZXR0ZXJzISEhIGl0IGlzIGhlcmUganVzdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSAqL1xuICBQbGFjZS5wcm90b3R5cGUuZ2V0TmFtZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfTtcbiAgUGxhY2UucHJvdG90eXBlLmdldElkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmlkO1xuICB9O1xuICBQbGFjZS5wcm90b3R5cGUuZ2V0VHlwZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy50eXBlU3RyaW5nO1xuICB9O1xuICBQbGFjZS5wcm90b3R5cGUuZ2V0VHlwZUlkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnR5cGVcbiAgfTtcblxuXG5QbGFjZS5UWVBFX0FJUlBPUlQgPSAwO1xuUGxhY2UuVFlQRV9DT1VOVFJZID0gMTtcblBsYWNlLlRZUEVfQ0lUWSA9IDI7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxyXG5cclxuZnVuY3Rpb24gcm91bmQobnVtKSB7XHJcbiAgcmV0dXJuIE1hdGgucm91bmQobnVtICogMTAwKSAvIDEwMDtcclxufVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gUmFkaXVzKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBwbGFpbiA9IHBsYWluIHx8IHt9O1xyXG4gICAgdGhpcy5yYWRpdXMgPSAgcGxhaW4ucmFkaXVzIHx8IDI1MDtcclxuICAgIHRoaXMubGF0ID0gIHBsYWluLmxhdCB8fCA1MDtcclxuICAgIHRoaXMubG5nID0gIHBsYWluLmxuZyB8fCAxNjtcclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG4gIFJhZGl1cy5wcm90b3R5cGUuZ2V0VGV4dD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiBcIlwiICsgcm91bmQodGhpcy5sYXQpICsgXCIsIFwiICsgcm91bmQodGhpcy5sbmcpICsgXCIgKFwiICsgdGhpcy5yYWRpdXMgKyBcImttKVwiO1xyXG4gIH07XHJcbiAgUmFkaXVzLnByb3RvdHlwZS5nZXRVcmxTdHJpbmc9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gXCJcIiArIHJvdW5kKHRoaXMubGF0KSArIFwiLVwiICsgcm91bmQodGhpcy5sbmcpICsgXCItXCIgKyB0aGlzLnJhZGl1cyArIFwia21cIjtcclxuICB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUmFkaXVzO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XHJcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKFwiZGVlcG1lcmdlXCIpO1xyXG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZShcIi4vSW1tdXRhYmxlLmpzeFwiKTtcclxuXHJcbnZhciB1cmxEYXRlRm9ybWF0ID0gXCJZWVlZLU1NLUREXCI7XHJcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vdHIuanMnKTtcclxuXHJcbi8qXHJcbmNsYXNzIFNlYXJjaERhdGVcclxuISEhISBGT1IgVkFMSUQgT1VUUFVUIFVTRSBBTFdBWVMgR0VUVEVSIE1FVEhPRFMsIE5PVCBBVFRSSUJVVEVTXHJcbiAqL1xyXG5cclxuZm9yKHZhciBJbW11dGFibGVfX19fS2V5IGluIEltbXV0YWJsZSl7aWYoSW1tdXRhYmxlLmhhc093blByb3BlcnR5KEltbXV0YWJsZV9fX19LZXkpKXtTZWFyY2hEYXRlW0ltbXV0YWJsZV9fX19LZXldPUltbXV0YWJsZVtJbW11dGFibGVfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlPUltbXV0YWJsZT09PW51bGw/bnVsbDpJbW11dGFibGUucHJvdG90eXBlO1NlYXJjaERhdGUucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZSk7U2VhcmNoRGF0ZS5wcm90b3R5cGUuY29uc3RydWN0b3I9U2VhcmNoRGF0ZTtTZWFyY2hEYXRlLl9fc3VwZXJDb25zdHJ1Y3Rvcl9fPUltbXV0YWJsZTtcclxuICBmdW5jdGlvbiBTZWFyY2hEYXRlKGlucHV0KSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgcGxhaW4gPSB7fTtcclxuICAgIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBwbGFpbiA9IHRoaXMucGFyc2VVcmxTdHJpbmcoaW5wdXQpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJvYmplY3RcIikge1xyXG4gICAgICBwbGFpbiA9IGlucHV0O1xyXG4gICAgfVxyXG4gICAgdGhpcy5tb2RlID0gdHlwZW9mKHBsYWluLm1vZGUpICE9ICd1bmRlZmluZWQnID8gcGxhaW4ubW9kZSA6IFwic2luZ2xlXCI7XHJcbiAgICB0aGlzLmZyb20gPSB0eXBlb2YocGxhaW4uZnJvbSkgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi5mcm9tIDogbW9tZW50LnV0YygpO1xyXG4gICAgdGhpcy50byA9IHR5cGVvZihwbGFpbi50bykgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi50byA6IG1vbWVudC51dGMoKTtcclxuICAgIHRoaXMubWluU3RheURheXMgPSB0eXBlb2YocGxhaW4ubWluU3RheURheXMpICE9ICd1bmRlZmluZWQnID8gcGxhaW4ubWluU3RheURheXMgOiAyO1xyXG4gICAgdGhpcy5tYXhTdGF5RGF5cyA9IHR5cGVvZihwbGFpbi5tYXhTdGF5RGF5cykgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi5tYXhTdGF5RGF5cyA6IDEwO1xyXG4gICAgdGhpcy5maW5hbCA9IHR5cGVvZihwbGFpbi5maW5hbCkgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi5maW5hbCA6IHRydWU7XHJcblxyXG4gICAgdGhpcy5jbGFzcyA9IFNlYXJjaERhdGU7XHJcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TW9kZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLm1vZGVcclxuICB9O1xyXG5cclxuICBTZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRGcm9tPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIiB8fCB0aGlzLm1vZGUgPT0gXCJub1JldHVyblwiKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJhbnl0aW1lXCIpIHtcclxuICAgICAgcmV0dXJuIG1vbWVudC51dGMoKS5hZGQoMSwgXCJkYXlzXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZnJvbVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIFNlYXJjaERhdGUucHJvdG90eXBlLmdldFRvPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIiB8fCB0aGlzLm1vZGUgPT0gXCJub1JldHVyblwiKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJzaW5nbGVcIikge1xyXG4gICAgICByZXR1cm4gdGhpcy5mcm9tXHJcbiAgICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcImFueXRpbWVcIikge1xyXG4gICAgICByZXR1cm4gbW9tZW50LnV0YygpLmFkZCg2LCBcIm1vbnRoc1wiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLnRvKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvL2p1c3QgZm9yIGNhc2VzIHdoZW4gdGhlIHZhbHVlIGlzIG5vdCBmaWxsZWQgKG5vdCBjb21wbGV0ZSBpbnRlcnZhbClcclxuICAgICAgICByZXR1cm4gdGhpcy5mcm9tXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTZWFyY2hEYXRlLnByb3RvdHlwZS5nZXREYXRlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKHRoaXMubW9kZSA9PSBcInNpbmdsZVwiKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZyb21cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TWluU3RheURheXM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1pblN0YXlEYXlzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TWF4U3RheURheXM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1heFN0YXlEYXlzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUuZm9ybWF0PWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKHRoaXMubW9kZSA9PSBcInNpbmdsZVwiKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZyb20uZm9ybWF0KFwibFwiKVxyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJ0aW1lVG9TdGF5XCIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWluU3RheURheXMgKyBcIiAtIFwiICsgdGhpcy5tYXhTdGF5RGF5cyArIFwiIGRheXNcIlxyXG4gICAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJpbnRlcnZhbFwiIHx8IHRoaXMubW9kZSA9PSBcIm1vbnRoXCIpIHtcclxuICAgICAgdmFyIHRvRGF0ZVN0cmluZztcclxuICAgICAgaWYgKCF0aGlzLnRvKSB7XHJcbiAgICAgICAgdG9EYXRlU3RyaW5nID0gXCJfXCJcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0b0RhdGVTdHJpbmcgPSB0aGlzLnRvLmZvcm1hdChcImxcIilcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5mcm9tLmZvcm1hdChcImxcIikgKyBcIiAtIFwiICsgdG9EYXRlU3RyaW5nXHJcbiAgICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcImFueXRpbWVcIikge1xyXG4gICAgICByZXR1cm4gdHIoXCJBbnl0aW1lXCIsIFwiYW55dGltZVwiKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwibm9SZXR1cm5cIikge1xyXG4gICAgICByZXR1cm4gdHIoXCJObyByZXR1cm5cIiwgXCJub19yZXR1cm5fbGFiZWxcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5tb2RlXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qIHdhIHVybCAqL1xyXG4gIFNlYXJjaERhdGUucHJvdG90eXBlLnRvVXJsU3RyaW5nPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMubW9kZSArIFwiX1wiICsgdGhpcy5mcm9tLmZvcm1hdCh1cmxEYXRlRm9ybWF0KSArIFwiX1wiICsgdGhpcy50by5mb3JtYXQodXJsRGF0ZUZvcm1hdCk7XHJcbiAgfTtcclxuXHJcbiAgLypcclxuICAgSnVzdCBwYXJzZSBpdCwgcmV0dXJuIHBsYWluIG1pbmltYWwvaW5jb21wbGV0ZSB2ZXJzaW9uIG9mIFNlYXJjaERhdGUgb2JqZWN0XHJcbiAgICovXHJcbiAgU2VhcmNoRGF0ZS5wcm90b3R5cGUucGFyc2VVcmxTdHJpbmc9ZnVuY3Rpb24oc3RyaW5nRGF0ZSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKHN0cmluZ0RhdGUuaW5kZXhPZihcIl9cIikgIT09IC0xKSB7XHJcbiAgICAgIHZhciBzcGxpdCA9IHN0cmluZ0RhdGUuc3BsaXQoXCJfXCIpO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vZGU6IHNwbGl0WzBdLFxyXG4gICAgICAgIGZyb206IG1vbWVudC51dGMoc3BsaXRbMV0sIHVybERhdGVGb3JtYXQpLFxyXG4gICAgICAgIHRvOiBtb21lbnQudXRjKHNwbGl0WzJdLCB1cmxEYXRlRm9ybWF0KVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBtb2RlOiBcInNpbmdsZVwiLFxyXG4gICAgICAgIGZyb206IG1vbWVudC51dGMoc3RyaW5nRGF0ZSwgdXJsRGF0ZUZvcm1hdCksXHJcbiAgICAgICAgdG86IG1vbWVudC51dGMoc3RyaW5nRGF0ZSwgdXJsRGF0ZUZvcm1hdClcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuXHJcbiAgLyoganVzdCBoZWxwZXIgZnVuY3Rpb24gaWYgaSBtb2RlIGlzIG5vdCBzZXQgKi9cclxuICBTZWFyY2hEYXRlLmd1ZXNzTW9kZUZyb21QbGFpbj1mdW5jdGlvbihwbGFpbikge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKHBsYWluLm1pblN0YXlEYXlzICYmIHBsYWluLm1heFN0YXlEYXlzKSB7XHJcbiAgICAgIHJldHVybiBcInRpbWVUb1N0YXlcIjtcclxuICAgIH0gZWxzZSBpZiAoIXBsYWluLmZyb20pIHtcclxuICAgICAgcmV0dXJuIFwibm9SZXR1cm5cIjtcclxuICAgIH0gZWxzZSBpZiAocGxhaW4uZnJvbSA9PSBwbGFpbi50bykge1xyXG4gICAgICByZXR1cm4gXCJzaW5nbGVcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBcImludGVydmFsXCI7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaERhdGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi9TZWFyY2hQbGFjZS5qc3gnKTtcclxudmFyIFNlYXJjaERhdGUgPSByZXF1aXJlKCcuL1NlYXJjaERhdGUuanN4Jyk7XHJcbnZhciBEYXRlUGFpclZhbGlkYXRvciA9IHJlcXVpcmUoJy4vLi4vdG9vbHMvRGF0ZVBhaXJWYWxpZGF0b3IuanN4Jyk7XHJcblxyXG52YXIgZGF0ZUNvcnJlY3RvciA9IHt9O1xyXG5kYXRlQ29ycmVjdG9yLmNvcnJlY3QgPSBmdW5jdGlvbiAoZGF0YSwgZGlyZWN0aW9uKSB7XHJcbiAgdmFyIGVycm9yID0gRGF0ZVBhaXJWYWxpZGF0b3IudmFsaWRhdGUoXHJcbiAgICBkYXRhLmRhdGVGcm9tLFxyXG4gICAgZGF0YS5kYXRlVG9cclxuICApO1xyXG4gIGlmIChlcnJvciA9PSBcImNyb3NzZWREYXRlc1wiKSB7XHJcbiAgICBpZiAoZGlyZWN0aW9uID09IFwiZGF0ZUZyb21cIikge1xyXG4gICAgICByZXR1cm4gZGF0YS5kYXRlVG8gPSBkYXRhLmRhdGVGcm9tO1xyXG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gXCJkYXRlVG9cIikge1xyXG4gICAgICByZXR1cm4gZGF0YS5kYXRlRnJvbSA9IGRhdGEuZGF0ZVRvO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YTtcclxufTtcclxuXHJcblxyXG5cclxuICBmdW5jdGlvbiBTZWFyY2hGb3JtRGF0YShpbnB1dCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHBsYWluID0gaW5wdXQgfHwge307XHJcbiAgICB0aGlzLmRhdGVGcm9tID0gcGxhaW4uZGF0ZUZyb20gfHwgbmV3IFNlYXJjaERhdGUoKTtcclxuICAgIHRoaXMuZGF0ZVRvID0gcGxhaW4uZGF0ZVRvIHx8IG5ldyBTZWFyY2hEYXRlKHtmcm9tOiBtb21lbnQoKS5hZGQoMSwgXCJtb250aHNcIil9KTtcclxuICAgIHRoaXMub3JpZ2luID0gcGxhaW4ub3JpZ2luIHx8IG5ldyBTZWFyY2hQbGFjZShcIlwiLCB0cnVlKTtcclxuICAgIHRoaXMuZGVzdGluYXRpb24gPSBwbGFpbi5kZXN0aW5hdGlvbiB8fCBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwiXCJ9LCB0cnVlKTtcclxuICAgIHRoaXMucGFzc2VuZ2VycyA9IHBhcnNlSW50KHBsYWluLnBhc3NlbmdlcnMpIHx8IDE7XHJcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgLy9UT0RPIGNoYW5nZSB0byBleHRlbmRlZCBmcm9tIEltbXV0YWJsZVxyXG4gIC8qIGltbXV0YWJsZSAqL1xyXG4gIFNlYXJjaEZvcm1EYXRhLnByb3RvdHlwZS5jaGFuZ2VGaWVsZD1mdW5jdGlvbih0eXBlLCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIG5ld1BsYWluID0ge1xyXG4gICAgICBkYXRlRnJvbTogdGhpcy5kYXRlRnJvbSxcclxuICAgICAgZGF0ZVRvOiB0aGlzLmRhdGVUbyxcclxuICAgICAgb3JpZ2luOiB0aGlzLm9yaWdpbixcclxuICAgICAgZGVzdGluYXRpb246IHRoaXMuZGVzdGluYXRpb24sXHJcbiAgICAgIHBhc3NlbmdlcnM6IHRoaXMucGFzc2VuZ2Vyc1xyXG4gICAgfTtcclxuICAgIG5ld1BsYWluW3R5cGVdID0gdmFsdWU7XHJcbiAgICBpZiAodHlwZSA9PSBcImRhdGVUb1wiIHx8IHR5cGUgPT0gXCJkYXRlRnJvbVwiKSB7XHJcbiAgICAgIGRhdGVDb3JyZWN0b3IuY29ycmVjdChuZXdQbGFpbiwgdHlwZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFNlYXJjaEZvcm1EYXRhKG5ld1BsYWluKTtcclxuICB9O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoRm9ybURhdGE7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXHJcbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vUGxhY2UuanN4Jyk7XHJcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vdHIuanMnKTtcclxudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlLmpzeCcpO1xyXG5cclxudmFyIGRlZmF1bHRWYWx1ZXMgPSB7XHJcbiAgbW9kZTogXCJ0ZXh0XCIsIC8qIG1vZGVzOiB0ZXh0LCBwbGFjZSwgYW55d2hlcmUsIHJhZGl1cywgLi4uICAhISBpdCBpcyBzaW1pbGFyIGFzIG1vZGVzIGluIHBsYWNlUGlja2VyIGJ1dCBub3QgZXhhY3RseSBzYW1lICovXHJcbiAgdmFsdWU6IFwiXCIsXHJcbiAgaXNEZWZhdWx0OiBmYWxzZSAvKiB0aGlzIGlzIHNldCBvbmx5IHdoZW4geW91IHdhbnQgdG8gdXNlIHRleHQgYXMgcHJlZGVmaW5lZCB2YWx1ZSAqL1xyXG59O1xyXG5cclxuZnVuY3Rpb24gbWFrZVBsYWluKGlucHV0KSB7XHJcbiAgdmFyIHBsYWluID0ge307XHJcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgcGxhaW4ubW9kZSA9IFwidGV4dFwiO1xyXG4gICAgcGxhaW4udmFsdWUgPSBcIlwiO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnKSB7XHJcbiAgICBwbGFpbi5tb2RlID0gXCJ0ZXh0XCI7XHJcbiAgICBwbGFpbi52YWx1ZSA9IGlucHV0O1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09IFwib2JqZWN0XCIpIHtcclxuICAgIHBsYWluID0gaW5wdXQ7XHJcbiAgfVxyXG4gIHJldHVybiBwbGFpblxyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZU1vZGVzKGRhdGEpIHtcclxuICBpZiAoZGF0YS5tb2RlID09IFwidGV4dFwiKSB7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEudmFsdWUgIT0gXCJzdHJpbmdcIikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3cm9uZyB0eXBlIG9mIHZhbHVlXCIpO1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoZGF0YS5tb2RlID09IFwicGxhY2VcIikge1xyXG4gICAgaWYgKCAhKGRhdGEudmFsdWUgaW5zdGFuY2VvZiBQbGFjZSkgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIndyb25nIHR5cGUgb2YgdmFsdWVcIik7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRGb3JtTW9kZUZyb21Nb2RlKG1vZGUpIHtcclxuICBpZiAobW9kZSA9PSBcInJhZGl1c1wiIHx8IG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XHJcbiAgICByZXR1cm4gbW9kZTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIFwiYWxsXCI7XHJcbiAgfVxyXG59XHJcblxyXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe1NlYXJjaFBsYWNlW0ltbXV0YWJsZV9fX19LZXldPUltbXV0YWJsZVtJbW11dGFibGVfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlPUltbXV0YWJsZT09PW51bGw/bnVsbDpJbW11dGFibGUucHJvdG90eXBlO1NlYXJjaFBsYWNlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZJbW11dGFibGUpO1NlYXJjaFBsYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1TZWFyY2hQbGFjZTtTZWFyY2hQbGFjZS5fX3N1cGVyQ29uc3RydWN0b3JfXz1JbW11dGFibGU7XHJcbiAgZnVuY3Rpb24gU2VhcmNoUGxhY2UoaW5wdXQsIGlzRGVmYXVsdCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHBsYWluID0gbWFrZVBsYWluKGlucHV0KTtcclxuICAgIHRoaXMubW9kZSA9IHBsYWluLm1vZGUgfHwgXCJ0ZXh0XCI7XHJcbiAgICB0aGlzLmZvcm1Nb2RlID0gcGxhaW4uZm9ybU1vZGUgfHwgZ2V0Rm9ybU1vZGVGcm9tTW9kZSh0aGlzLm1vZGUpO1xyXG4gICAgdGhpcy52YWx1ZSA9IHBsYWluLnZhbHVlIHx8IFwiXCI7XHJcbiAgICB0aGlzLmlzRGVmYXVsdCA9IHBsYWluLmlzRGVmYXVsdCB8fCBpc0RlZmF1bHQ7XHJcbiAgICB0aGlzLmVycm9yID0gcGxhaW4uZXJyb3IgfHwgXCJcIjtcclxuICAgIHRoaXMubG9hZGluZyA9IHBsYWluLmxvYWRpbmcgfHwgZmFsc2U7XHJcblxyXG4gICAgdmFsaWRhdGVNb2Rlcyh0aGlzKTtcclxuXHJcbiAgICB0aGlzLmNsYXNzID0gU2VhcmNoUGxhY2U7XHJcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldE1vZGU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICByZXR1cm4gdGhpcy5tb2RlO1xyXG4gIH07XHJcblxyXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRWYWx1ZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gIH07XHJcblxyXG4gIC8qIHNob3duIHRleHQgKi9cclxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0VGV4dD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBtb2RlID0gdGhpcy5tb2RlO1xyXG4gICAgaWYgKG1vZGUgPT0gXCJ0ZXh0XCIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XHJcbiAgICAgIHJldHVybiB0cihcIkFueXdoZXJlXCIsXCJhbnl3aGVyZVwiKTtcclxuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInBsYWNlXCIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0TmFtZSgpO1xyXG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicmFkaXVzXCIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0VGV4dCgpO1xyXG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiaWRcIikge1xyXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKiBuYW1lIG9mIHBsYWNlICovXHJcbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldE5hbWU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBjb25zb2xlLndhcm4oXCJnZXROYW1lIHNob3VsZG4ndCBiZSB1c2VkXCIpO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VXJsU3RyaW5nKCk7XHJcbiAgfTtcclxuXHJcbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldFVybFN0cmluZz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBtb2RlID0gdGhpcy5tb2RlO1xyXG4gICAgaWYgKG1vZGUgPT0gXCJ0ZXh0XCIpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XHJcbiAgICAgIHJldHVybiBcImFueXdoZXJlXCI7XHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJwbGFjZVwiKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldE5hbWUoKTtcclxuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInJhZGl1c1wiKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldFVybFN0cmluZygpO1xyXG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiaWRcIikge1xyXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0SWQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgbW9kZSA9IHRoaXMubW9kZTtcclxuICAgIGlmIChtb2RlID09IFwidGV4dFwiKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiYW55d2hlcmVcIikge1xyXG4gICAgICByZXR1cm4gXCJhbnl3aGVyZVwiO1xyXG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicGxhY2VcIikge1xyXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXRJZCgpO1xyXG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiaWRcIikge1xyXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0UGxhY2U9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBpZiAodGhpcy5nZXRNb2RlKCkgPT0gXCJwbGFjZVwiKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoUGxhY2U7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xuXG52YXIgRGVmID0gSW1tdXRhYmxlLlJlY29yZCh7XG4gIGlkOiBudWxsLFxuICBudW1iZXI6IG51bGwsXG4gIGRlcGFydHVyZTogbnVsbCxcbiAgYXJyaXZhbDogbnVsbCxcbiAgYWlybGluZTogbnVsbFxufSk7XG5cbmZvcih2YXIgRGVmX19fX0tleSBpbiBEZWYpe2lmKERlZi5oYXNPd25Qcm9wZXJ0eShEZWZfX19fS2V5KSl7RmxpZ2h0W0RlZl9fX19LZXldPURlZltEZWZfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mRGVmPURlZj09PW51bGw/bnVsbDpEZWYucHJvdG90eXBlO0ZsaWdodC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShfX19fU3VwZXJQcm90b09mRGVmKTtGbGlnaHQucHJvdG90eXBlLmNvbnN0cnVjdG9yPUZsaWdodDtGbGlnaHQuX19zdXBlckNvbnN0cnVjdG9yX189RGVmO2Z1bmN0aW9uIEZsaWdodCgpe1widXNlIHN0cmljdFwiO2lmKERlZiE9PW51bGwpe0RlZi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7fX1cblxuICBGbGlnaHQucHJvdG90eXBlLmdldElkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmdldChcImlkXCIpO1xuICB9O1xuXG4gIEZsaWdodC5wcm90b3R5cGUuZ2V0U3RvcHM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIDA7XG4gIH07XG5cbiAgRmxpZ2h0LnByb3RvdHlwZS5nZXREZXBhcnR1cmU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KFwiZGVwYXJ0dXJlXCIpO1xuICB9O1xuXG4gIEZsaWdodC5wcm90b3R5cGUuZ2V0QXJyaXZhbD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5nZXQoXCJhcnJpdmFsXCIpO1xuICB9O1xuXG4gIEZsaWdodC5wcm90b3R5cGUuZ2V0RHVyYXRpb249ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIG1vbWVudC5kdXJhdGlvbih0aGlzLmdldEFycml2YWwoKS5nZXQoXCJ3aGVuXCIpLmdldChcInV0Y1wiKS5kaWZmKHRoaXMuZ2V0RGVwYXJ0dXJlKCkuZ2V0KFwid2hlblwiKS5nZXQoXCJ1dGNcIikpKTtcbiAgfTtcblxuICBGbGlnaHQucHJvdG90eXBlLmNvdW50RmxpZ2h0cz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gMTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsaWdodDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xuXG5cbnZhciBEZWYgPSBJbW11dGFibGUuUmVjb3JkKHtcbiAgaWQ6IG51bGwsXG4gIHNvdXJjZTogbnVsbCxcbiAgdHJpcHM6IEltbXV0YWJsZS5NYXAoKSwgLy91c3VhbGx5IHtvdXRib3VuZDogbmV3IFRyaXAoKSwgaW5ib3VuZDogbmV3IFRyaXAoKX1cbiAgcHJpY2VzOiBJbW11dGFibGUuTWFwKHt9KVxufSk7XG5cbmZvcih2YXIgRGVmX19fX0tleSBpbiBEZWYpe2lmKERlZi5oYXNPd25Qcm9wZXJ0eShEZWZfX19fS2V5KSl7Sm91cm5leVtEZWZfX19fS2V5XT1EZWZbRGVmX19fX0tleV07fX12YXIgX19fX1N1cGVyUHJvdG9PZkRlZj1EZWY9PT1udWxsP251bGw6RGVmLnByb3RvdHlwZTtKb3VybmV5LnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZEZWYpO0pvdXJuZXkucHJvdG90eXBlLmNvbnN0cnVjdG9yPUpvdXJuZXk7Sm91cm5leS5fX3N1cGVyQ29uc3RydWN0b3JfXz1EZWY7ZnVuY3Rpb24gSm91cm5leSgpe1widXNlIHN0cmljdFwiO2lmKERlZiE9PW51bGwpe0RlZi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7fX1cbiAgSm91cm5leS5wcm90b3R5cGUuZ2V0UHJpY2U9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW4oW1wicHJpY2VzXCIsIFwiZGVmYXVsdFwiXSk7XG4gIH07XG5cbiAgSm91cm5leS5wcm90b3R5cGUuY291bnRGbGlnaHRzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIC8vVE9cbiAgfTtcblxuICBKb3VybmV5LnByb3RvdHlwZS5pc1JldHVybj1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gISF0aGlzLmdldChcInRyaXBzXCIpLmdldChcImluYm91bmRcIik7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBKb3VybmV5O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XG5cbnZhciBEZWYgPSBJbW11dGFibGUuUmVjb3JkKHtcbiAgZmxpZ2h0czogSW1tdXRhYmxlLkxpc3QoW10pXG59KTtcblxuZm9yKHZhciBEZWZfX19fS2V5IGluIERlZil7aWYoRGVmLmhhc093blByb3BlcnR5KERlZl9fX19LZXkpKXtUcmlwW0RlZl9fX19LZXldPURlZltEZWZfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mRGVmPURlZj09PW51bGw/bnVsbDpEZWYucHJvdG90eXBlO1RyaXAucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoX19fX1N1cGVyUHJvdG9PZkRlZik7VHJpcC5wcm90b3R5cGUuY29uc3RydWN0b3I9VHJpcDtUcmlwLl9fc3VwZXJDb25zdHJ1Y3Rvcl9fPURlZjtmdW5jdGlvbiBUcmlwKCl7XCJ1c2Ugc3RyaWN0XCI7aWYoRGVmIT09bnVsbCl7RGVmLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt9fVxuICBUcmlwLnByb3RvdHlwZS5nZXRJZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5nZXQoXCJmbGlnaHRzXCIpLnJlZHVjZShmdW5jdGlvbihyZXMsIGZsaWdodCkgIHtcbiAgICAgIHJldHVybiByZXMuY29uY2F0KFtmbGlnaHQuaWRdKTtcbiAgICB9LCBbXSkuam9pbihcInxcIik7XG4gIH07XG5cbiAgVHJpcC5wcm90b3R5cGUuZ2V0U3RvcHM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KFwiZmxpZ2h0c1wiKS5jb3VudCgpIC0gMTtcbiAgfTtcblxuICBUcmlwLnByb3RvdHlwZS5nZXREZXBhcnR1cmU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KFwiZmxpZ2h0c1wiKS5maXJzdCgpLmdldChcImRlcGFydHVyZVwiKTtcbiAgfTtcblxuICBUcmlwLnByb3RvdHlwZS5nZXRBcnJpdmFsPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmdldChcImZsaWdodHNcIikubGFzdCgpLmFycml2YWw7XG4gIH07XG5cbiAgVHJpcC5wcm90b3R5cGUuZ2V0RHVyYXRpb249ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIG1vbWVudC5kdXJhdGlvbih0aGlzLmdldEFycml2YWwoKS5nZXQoXCJ3aGVuXCIpLmdldChcInV0Y1wiKS5kaWZmKHRoaXMuZ2V0RGVwYXJ0dXJlKCkuZ2V0KFwid2hlblwiKS5nZXQoXCJ1dGNcIikpKTtcbiAgfTtcblxuICBUcmlwLnByb3RvdHlwZS5jb3VudEZsaWdodHM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KFwiZmxpZ2h0c1wiKS5jb3VudCgpO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVHJpcDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFNlYXJjaEZvcm0gPSByZXF1aXJlKCcuLy4uL1NlYXJjaEZvcm0vU2VhcmNoRm9ybS5qc3gnKTtcclxuXHJcbi8qKlxyXG4gKiBvcHRpb25zLmVsZW1lbnQgLSBlbGVtZW50IHRvIGJpbmQgd2hvbGUgc2VhcmNoIGZvcm1cclxuICogb3B0aW9ucy5kZWZhdWx0QWN0aXZlIC0gbW9kZSB3aGljaCB3aWxsIGJlIGFjdGl2YXRlZCBvbiBpbml0IG9mIGNvbXBvbmVudCAtIGRlZmF1bHQ6IFwib3JpZ2luXCIsIHNldCBudWxsIHRvIGRvbid0IHNob3cgYW55XHJcbiAqL1xyXG5cclxuICBmdW5jdGlvbiBTZWFyY2hGb3JtQWRhcHRlcihvcHRpb25zKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgcm9vdCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoU2VhcmNoRm9ybSk7XHJcbiAgICB2YXIgcmVhY3RFbGVtZW50ID0gcm9vdCgpO1xyXG4gICAgcmVhY3RFbGVtZW50LnByb3BzID0gb3B0aW9ucztcclxuICAgIHRoaXMubW9kYWxDb21wb25lbnQgPSBSZWFjdC5yZW5kZXIocmVhY3RFbGVtZW50LCBvcHRpb25zLmVsZW1lbnQpO1xyXG4gIH1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaEZvcm1BZGFwdGVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBNYXBQbGFjZXNTdG9yZSA9IHJlcXVpcmUoJy4vTWFwUGxhY2VzU3RvcmUuanN4Jyk7XHJcbnZhciBNYXBMYWJlbCA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9NYXBMYWJlbC5qc3gnKTtcclxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcclxudmFyIFF1YWR0cmVlID0gcmVxdWlyZSgnLi8uLi90b29scy9xdWFkdHJlZS5qcycpO1xyXG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnaW1tdXRhYmxlJyk7XHJcblxyXG5mdW5jdGlvbiBpc0NvbGxpZGUoYSwgYikge1xyXG4gIHJldHVybiAhKFxyXG4gICgoYS55ICsgYS5oKSA8IChiLnkpKSB8fFxyXG4gIChhLnkgPiAoYi55ICsgYi5oKSkgfHxcclxuICAoKGEueCArIGEudykgPCBiLngpIHx8XHJcbiAgKGEueCA+IChiLnggKyBiLncpKVxyXG4gICk7XHJcbn1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIE1hcExhYmVsc1N0b3JlKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5sYWJlbHNCb3VuZHNUcmVlID0gUXVhZHRyZWUuaW5pdCh7XHJcbiAgICAgIHg6IDAsXHJcbiAgICAgIHk6IDAsXHJcbiAgICAgIHc6IDUwMDAsIC8vYmlnIGVub3VnaCBzY3JlZW4gc2l6ZVxyXG4gICAgICBoOiA1MDAwLFxyXG4gICAgICBtYXhEZXB0aCA6IDIwXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmxhYmVsc0luZGV4ID0gSW1tdXRhYmxlLk1hcCh7fSk7XHJcblxyXG4gICAgTWFwUGxhY2VzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcclxuICAgICAgdGhpcy5yZWZyZXNoTGFiZWxzKCk7XHJcbiAgICB9LmJpbmQodGhpcykpXHJcbiAgfVxyXG5cclxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUuc2V0TGFiZWxPdmVyPWZ1bmN0aW9uKGxhYmVsKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLmhvdmVyTGFiZWwgPSBsYWJlbC5lZGl0KHtob3ZlcjogdHJ1ZX0pO1xyXG4gICAgdGhpcy5sYWJlbHNJbmRleCA9IHRoaXMubGFiZWxzSW5kZXguc2V0KGxhYmVsLmdldElkKCksIHRoaXMuaG92ZXJMYWJlbCk7XHJcbiAgICB0aGlzLmV2ZW50cy5lbWl0KFwiY2hhbmdlXCIpO1xyXG4gIH07XHJcblxyXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5zZXRMYWJlbE91dD1mdW5jdGlvbihsYWJlbCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5ob3ZlckxhYmVsID0gbnVsbDtcclxuICAgIHRoaXMubGFiZWxzSW5kZXggPSB0aGlzLmxhYmVsc0luZGV4LnNldChsYWJlbC5nZXRJZCgpLCBsYWJlbC5lZGl0KHtob3ZlcjogZmFsc2V9KSk7XHJcbiAgICB0aGlzLmV2ZW50cy5lbWl0KFwiY2hhbmdlXCIpO1xyXG4gIH07XHJcblxyXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5jbGVhbj1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHRoaXMubGFiZWxzSW5kZXggPSBJbW11dGFibGUuTWFwKHt9KTtcclxuICAgIHRoaXMuZXZlbnRzLmVtaXQoXCJjaGFuZ2VcIik7XHJcbiAgfTtcclxuICAvKiBpdCBqdXN0IHJldHVybiBjcmVhdGVzIGFycmF5IG9mIGxhYmVscyAoY2FjaGVkKSAqL1xyXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5nZXRMYWJlbHM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBpZiAodGhpcy4kTWFwTGFiZWxzU3RvcmVfbGFzdExhYmVsc0luZGV4UmVmZXJlbmNlICE9IHRoaXMubGFiZWxzSW5kZXgpIHtcclxuICAgICAgdGhpcy4kTWFwTGFiZWxzU3RvcmVfbGFzdExhYmVsc0luZGV4UmVmZXJlbmNlID0gdGhpcy5sYWJlbHNJbmRleDtcclxuICAgICAgdGhpcy4kTWFwTGFiZWxzU3RvcmVfbGFiZWxzID0gdGhpcy5sYWJlbHNJbmRleC50b0FycmF5KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy4kTWFwTGFiZWxzU3RvcmVfbGFiZWxzO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogbWluIG1heCBwcmljZSBmb3Igc2hvd24gcGxhY2VzIChsYWJlbHMpXHJcbiAgICogQHBhcmFtIGxhYmVsc1xyXG4gICAqIEByZXR1cm4ge3t9fVxyXG4gICAqL1xyXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5maW5kUHJpY2VTdGF0c0ZvckxhYmVscz1mdW5jdGlvbihsYWJlbHMpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciByZXMgPSB7fTtcclxuICAgIGxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKGxhYmVsKSAge1xyXG4gICAgICB2YXIgcHJpY2UgPSBsYWJlbC5tYXBQbGFjZS5wcmljZTtcclxuICAgICAgaWYgKCFyZXMubWF4UHJpY2UgfHwgcmVzLm1heFByaWNlIDwgcHJpY2UpIHJlcy5tYXhQcmljZSA9IHByaWNlO1xyXG4gICAgICBpZiAoICghcmVzLm1pblByaWNlIHx8IHJlcy5taW5QcmljZSA+IHByaWNlKSAmJiBwcmljZSkgcmVzLm1pblByaWNlID0gcHJpY2U7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfTtcclxuICAvKiAhbXV0YXRlcyBsYWJlbHMgKi9cclxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUuY2FsY3VsYXRlUmVsYXRpdmVQcmljZXNGb3JMYWJlbHM9ZnVuY3Rpb24obGFiZWxzKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgcHJpY2VTdGF0cyA9IHRoaXMuZmluZFByaWNlU3RhdHNGb3JMYWJlbHMobGFiZWxzKTtcclxuICAgIGxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKGxhYmVsKSAge1xyXG4gICAgICBpZiAobGFiZWwubWFwUGxhY2UucHJpY2UgJiYgcHJpY2VTdGF0cy5taW5QcmljZSAmJiBwcmljZVN0YXRzLm1heFByaWNlKSB7XHJcbiAgICAgICAgbGFiZWwucmVsYXRpdmVQcmljZSA9IChsYWJlbC5tYXBQbGFjZS5wcmljZSAtIHByaWNlU3RhdHMubWluUHJpY2UpIC8gKHByaWNlU3RhdHMubWF4UHJpY2UgLSBwcmljZVN0YXRzLm1pblByaWNlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfTtcclxuICAvLyBtdXRhdGVzIG1hcFBsYWNlcyBhcnJheSEhISFcclxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUubWFwUGxhY2VzVG9MYWJlbHM9ZnVuY3Rpb24obWFwUGxhY2VzLCBmcm9tTGF0TG5nVG9EaXZQaXhlbCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgdGhpcy5sYWJlbHNCb3VuZHNUcmVlLmNsZWFyKCk7XHJcbiAgICBpZiAoIW1hcFBsYWNlcyB8fCBtYXBQbGFjZXMubGVuZ3RoIDw9IDApIHJldHVybiBbXTtcclxuICAgIG1hcFBsYWNlcy5zb3J0KGZ1bmN0aW9uKGEsYikgIHtcclxuICAgICAgaWYgKGEuZmxhZyAmJiAhYi5mbGFnKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghYS5mbGFnICYmIGIuZmxhZykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYS5wcmljZSAmJiAhYi5wcmljZSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIWEucHJpY2UgJiYgYi5wcmljZSkge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChhLnByaWNlICYmIGIucHJpY2UpIHtcclxuICAgICAgICByZXR1cm4gKGEucGxhY2Uuc3Bfc2NvcmUgPCBiLnBsYWNlLnNwX3Njb3JlKT8gMSA6IC0xO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gKGEucGxhY2Uuc3Bfc2NvcmUgPCBiLnBsYWNlLnNwX3Njb3JlKT8gMSA6IC0xO1xyXG4gICAgfSk7XHJcbiAgICBtYXBQbGFjZXMgPSBtYXBQbGFjZXMuc2xpY2UoMCw0MDApO1xyXG4gICAgdmFyIGxhYmVscyA9IFtdO1xyXG5cclxuXHJcbiAgICBtYXBQbGFjZXMuZm9yRWFjaChmdW5jdGlvbihtYXBQbGFjZSkgIHtcclxuICAgICAgdmFyIGxhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobWFwUGxhY2UucGxhY2UubGF0LCBtYXBQbGFjZS5wbGFjZS5sbmcpO1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBmcm9tTGF0TG5nVG9EaXZQaXhlbChsYXRMbmcpO1xyXG5cclxuICAgICAgdmFyIGl0ZW0gPSB7XHJcbiAgICAgICAgeDogcG9zaXRpb24ueCxcclxuICAgICAgICB5OiBwb3NpdGlvbi55LFxyXG4gICAgICAgIHc6IDcwLFxyXG4gICAgICAgIGg6IDQwXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB2YXIgY29sbGlzaW9ucyA9IDA7XHJcbiAgICAgIHRoaXMubGFiZWxzQm91bmRzVHJlZS5yZXRyaWV2ZShpdGVtLCBmdW5jdGlvbihjaGVja2luZ0l0ZW0pIHtcclxuICAgICAgICBpZiAoaXNDb2xsaWRlKGl0ZW0sIGNoZWNraW5nSXRlbSkpIHtcclxuICAgICAgICAgIGNvbGxpc2lvbnMgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdmFyIHNob3dGdWxsTGFiZWwgPSBmYWxzZTtcclxuICAgICAgaWYgKGNvbGxpc2lvbnMgPT0gMCkge1xyXG4gICAgICAgIHNob3dGdWxsTGFiZWwgPSB0cnVlO1xyXG4gICAgICAgIGl0ZW0ubWFwUGxhY2UgPSBtYXBQbGFjZTtcclxuICAgICAgICB0aGlzLmxhYmVsc0JvdW5kc1RyZWUuaW5zZXJ0KGl0ZW0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbGFiZWwgPSB7XHJcbiAgICAgICAgbWFwUGxhY2U6IG1hcFBsYWNlLFxyXG4gICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcclxuICAgICAgICBzaG93RnVsbExhYmVsOiBzaG93RnVsbExhYmVsXHJcbiAgICAgIH07XHJcbiAgICAgIGxhYmVscy5wdXNoKGxhYmVsKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICByZXR1cm4gbGFiZWxzO1xyXG4gIH07XHJcblxyXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5hY3R1YWxpemVMYWJlbHM9ZnVuY3Rpb24ocGxhaW5MYWJlbHMpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBzdGF0cyA9IHtcclxuICAgICAgbmV3TGFiZWxzOiAwLFxyXG4gICAgICByZXBsYWNlc0xhYmVsczogMCxcclxuICAgICAga2VwdExhYmVsczogMFxyXG4gICAgfTtcclxuICAgIHZhciBuZXdJbmRleCA9IHt9O1xyXG4gICAgcGxhaW5MYWJlbHMuZm9yRWFjaChmdW5jdGlvbihwbGFpbkxhYmVsKSAge1xyXG4gICAgICB2YXIgaWQgPSBwbGFpbkxhYmVsLm1hcFBsYWNlLnBsYWNlLmlkO1xyXG4gICAgICB2YXIgb2xkTGFiZWwgPSB0aGlzLmxhYmVsc0luZGV4LmdldChpZCk7XHJcbiAgICAgIGlmIChvbGRMYWJlbCkge1xyXG4gICAgICAgIHZhciBuZXdMYWJlbCA9IG9sZExhYmVsLmVkaXQocGxhaW5MYWJlbCk7XHJcbiAgICAgICAgaWYgKG5ld0xhYmVsICE9IG9sZExhYmVsKSB7XHJcbiAgICAgICAgICBuZXdJbmRleFtpZF0gPSBuZXdMYWJlbDtcclxuICAgICAgICAgIHN0YXRzLnJlcGxhY2VzTGFiZWxzKys7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld0luZGV4W2lkXSA9IG9sZExhYmVsO1xyXG4gICAgICAgICAgc3RhdHMua2VwdExhYmVscysrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuZXdJbmRleFtpZF0gPSBuZXcgTWFwTGFiZWwocGxhaW5MYWJlbCk7XHJcbiAgICAgICAgc3RhdHMubmV3TGFiZWxzKys7XHJcbiAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLmxhYmVsc0luZGV4ID0gSW1tdXRhYmxlLk1hcChuZXdJbmRleCk7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwic3RhdHM6IFwiLCBzdGF0cyk7XHJcbiAgfTtcclxuXHJcbiAgTWFwTGFiZWxzU3RvcmUucHJvdG90eXBlLnJlZnJlc2hMYWJlbHM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICBpZiAodGhpcy5sYXRMbmdCb3VuZHMgJiYgdGhpcy5mcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmMpIHtcclxuICAgICAgdmFyIG1hcFBsYWNlcyA9IE1hcFBsYWNlc1N0b3JlLmdldEJ5Qm91bmRzKHRoaXMubGF0TG5nQm91bmRzKTtcclxuICAgICAgdmFyIHBsYWluTGFiZWxzID0gdGhpcy5tYXBQbGFjZXNUb0xhYmVscyhtYXBQbGFjZXMsIHRoaXMuZnJvbUxhdExuZ1RvRGl2UGl4ZWxGdW5jKTtcclxuICAgICAgdGhpcy5jYWxjdWxhdGVSZWxhdGl2ZVByaWNlc0ZvckxhYmVscyhwbGFpbkxhYmVscyk7XHJcbiAgICAgIHRoaXMuYWN0dWFsaXplTGFiZWxzKHBsYWluTGFiZWxzKTtcclxuICAgICAgdGhpcy5ldmVudHMuZW1pdChcImNoYW5nZVwiKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUubGF0TG5nQm91bmRzRXF1YWw9ZnVuY3Rpb24ob2xkQm91bmRzLCBuZXdCb3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIGlmICghb2xkQm91bmRzKSByZXR1cm4gZmFsc2U7XHJcbiAgICByZXR1cm4gb2xkQm91bmRzLndMbmcgPT0gbmV3Qm91bmRzLndMbmcgJiYgb2xkQm91bmRzLmVMbmcgPT0gbmV3Qm91bmRzLmVMbmcgJiYgb2xkQm91bmRzLnNMYXQgPT0gbmV3Qm91bmRzLnNMYXQgJiYgb2xkQm91bmRzLm5MYXQgPT0gbmV3Qm91bmRzLm5MYXQ7XHJcbiAgfTtcclxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUuc2V0TWFwRGF0YT1mdW5jdGlvbihsYXRMbmdCb3VuZHMsIGZyb21MYXRMbmdUb0RpdlBpeGVsRnVuYykge1widXNlIHN0cmljdFwiO1xyXG4gICAgaWYgKCF0aGlzLmxhdExuZ0JvdW5kc0VxdWFsKHRoaXMubGF0TG5nQm91bmRzLCBsYXRMbmdCb3VuZHMpKSB7XHJcbiAgICAgIHRoaXMubGF0TG5nQm91bmRzID0gbGF0TG5nQm91bmRzO1xyXG4gICAgICB0aGlzLmZyb21MYXRMbmdUb0RpdlBpeGVsRnVuYyA9IGZyb21MYXRMbmdUb0RpdlBpeGVsRnVuYztcclxuICAgICAgdGhpcy5yZWZyZXNoTGFiZWxzKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE1hcExhYmVsc1N0b3JlKCk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFF1YWR0cmVlID0gcmVxdWlyZSgnLi8uLi90b29scy9xdWFkdHJlZS5qcycpO1xyXG5cclxuZnVuY3Rpb24gYm91bmRzVG9TZWxlY3RvcihsYXRMbmdCb3VuZHMpIHtcclxuICB2YXIgYm91bmRzID0gbGF0TG5nQm91bmRzO1xyXG4gIC8vaWYgbWFwIGhhcyAxODBsbmcgdmlldyBzY29wZSB0aGFuIHNob3cgb25seSB0aGUgYmlnZ2VyIHBhcnQgb2Ygc2hvd24gcGxhbmV0XHJcbiAgaWYgKGJvdW5kcy5lTG5nIC0gYm91bmRzLndMbmcgPCAwKSB7XHJcbiAgICAvLyB3aGF0IGlzIG1vcmUgZmFyIGZyb20gemVybywgaXQgaXMgc21hbGxlclxyXG4gICAgaWYgKE1hdGguYWJzKGJvdW5kcy5lTG5nKSA+IE1hdGguYWJzKGJvdW5kcy53TG5nKSkge1xyXG4gICAgICBib3VuZHMuZUxuZyA9IDE4MDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJvdW5kcy53TG5nID0gLTE4MDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHtcclxuICAgIHg6IGJvdW5kcy53TG5nICsgMTgwLFxyXG4gICAgeTogYm91bmRzLnNMYXQgKyA5MCxcclxuICAgIHc6IGJvdW5kcy5lTG5nIC0gYm91bmRzLndMbmcsXHJcbiAgICBoOiBib3VuZHMubkxhdCAtIGJvdW5kcy5zTGF0XHJcbiAgfTtcclxufVxyXG5cclxuXHJcbi8qIHN0cnVjdHVyZSB0byBzdG9yZSBtYXBQbGFjZXMgYW5kIGluZGV4IHRoZW0gYnkgaWQgYW5kIGJ5IGxhdCBsbmcgcG9zaXRpb24gKi9cclxuXHJcbiAgZnVuY3Rpb24gTWFwUGxhY2VzSW5kZXgoKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLm1hcFBsYWNlc0luZGV4ID0ge307XHJcbiAgICB0aGlzLnBvaW50c1RyZWUgPSBRdWFkdHJlZS5pbml0KHtcclxuICAgICAgeDogMCxcclxuICAgICAgeTogMCxcclxuICAgICAgdzogMzYwLFxyXG4gICAgICBoOiAxODAsXHJcbiAgICAgIG1heERlcHRoIDogMTJcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmdldEJ5SWQ9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIGlmICh0aGlzLm1hcFBsYWNlc0luZGV4W2lkXSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYXBQbGFjZXNJbmRleFtpZF0ubWFwUGxhY2U7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmdldEJ5Qm91bmRzPWZ1bmN0aW9uKGxhdExuZ0JvdW5kcykge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIHRyZWVTZWxlY3RvciA9IGJvdW5kc1RvU2VsZWN0b3IobGF0TG5nQm91bmRzKTtcclxuICAgIHZhciBtYXBQbGFjZXMgPSBbXTtcclxuICAgIHRoaXMucG9pbnRzVHJlZS5yZXRyaWV2ZSh0cmVlU2VsZWN0b3IsIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgbWFwUGxhY2VzLnB1c2goaXRlbS5tYXBQbGFjZSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBtYXBQbGFjZXM7XHJcbiAgfTtcclxuXHJcbiAgTWFwUGxhY2VzSW5kZXgucHJvdG90eXBlLmluc2VydFBsYWNlcz1mdW5jdGlvbihtYXBQbGFjZXMpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIG1hcFBsYWNlcy5mb3JFYWNoKGZ1bmN0aW9uKG1hcFBsYWNlKSAge1xyXG4gICAgICB2YXIgcGxhY2VDb250YWluZXIgPSB7XHJcbiAgICAgICAgeDogbWFwUGxhY2UucGxhY2UubG5nICsgMTgwLFxyXG4gICAgICAgIHk6IG1hcFBsYWNlLnBsYWNlLmxhdCArIDkwLFxyXG4gICAgICAgIHc6IDAuMDAwMDEsXHJcbiAgICAgICAgaDogMC4wMDAwMSxcclxuICAgICAgICBtYXBQbGFjZTogbWFwUGxhY2VcclxuICAgICAgfTtcclxuICAgICAgdGhpcy5tYXBQbGFjZXNJbmRleFttYXBQbGFjZS5wbGFjZS5pZF0gPSBwbGFjZUNvbnRhaW5lcjtcclxuICAgICAgdGhpcy5wb2ludHNUcmVlLmluc2VydChwbGFjZUNvbnRhaW5lcik7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gIH07XHJcblxyXG4gIE1hcFBsYWNlc0luZGV4LnByb3RvdHlwZS5jbGVhblByaWNlcz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIE9iamVjdC5rZXlzKHRoaXMubWFwUGxhY2VzSW5kZXgpLmZvckVhY2goZnVuY3Rpb24oaWQpICB7XHJcbiAgICAgIHRoaXMubWFwUGxhY2VzSW5kZXhbaWRdLm1hcFBsYWNlID0gdGhpcy5tYXBQbGFjZXNJbmRleFtpZF0ubWFwUGxhY2Uuc2V0KFwicHJpY2VcIiwgbnVsbCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogRWRpdFxyXG4gICAqIEBwYXJhbSBtYXBQbGFjZVxyXG4gICAqL1xyXG4gIE1hcFBsYWNlc0luZGV4LnByb3RvdHlwZS5lZGl0UGxhY2U9ZnVuY3Rpb24obWFwUGxhY2UpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciByZWYgPSB0aGlzLm1hcFBsYWNlc0luZGV4W21hcFBsYWNlLnBsYWNlLmlkXTtcclxuICAgIHJlZi54ID0gbWFwUGxhY2UucGxhY2UubG5nICsgMTgwO1xyXG4gICAgcmVmLnkgPSBtYXBQbGFjZS5wbGFjZS5sYXQgKyA5MDtcclxuICAgIHJlZi5tYXBQbGFjZSA9IG1hcFBsYWNlO1xyXG4gIH07XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBQbGFjZXNJbmRleDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIE1hcFBsYWNlc0luZGV4ID0gcmVxdWlyZSgnLi9NYXBQbGFjZXNJbmRleC5qc3gnKTtcbnZhciBNYXBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9NYXBQbGFjZS5qc3gnKTtcbnZhciBTZWFyY2hGb3JtU3RvcmUgID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCcpO1xudmFyIE9wdGlvbnNTdG9yZSAgPSByZXF1aXJlKCcuLy4uL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XG5cbnZhciBQbGFjZXNBUEkgPSByZXF1aXJlKCcuLy4uL0FQSXMvUGxhY2VzQVBJLmpzeCcpO1xudmFyIGZsaWdodHNBUEkgPSByZXF1aXJlKCcuLy4uL0FQSXMvZmxpZ2h0c0FQSS5qc3gnKTtcbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9QbGFjZS5qc3gnKTtcblxuXG5cbiAgZnVuY3Rpb24gTWFwUGxhY2VzU3RvcmUoKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5tYXBQbGFjZXNJbmRleCA9IG5ldyBNYXBQbGFjZXNJbmRleCgpO1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgU2VhcmNoRm9ybVN0b3JlLmV2ZW50cy5vbihcImNoYW5nZVwiLCBmdW5jdGlvbihjaGFuZ2VUeXBlKSAge1xuICAgICAgaWYgKGNoYW5nZVR5cGUgPT0gXCJzZWxlY3RcIiB8fCBjaGFuZ2VUeXBlID09IFwic2VsZWN0UmFkaXVzXCIpIHtcbiAgICAgICAgLy9pZiBwbGFjZXMgYXJlIG5vdCBsb2FkZWQsIGkgY2FuJ3QgbG9hZCBwcmljZXMsIHNvIHdhaXQgdW50aWwgaXQgaXMgbG9hZGVkXG4gICAgICAgIGlmICh0aGlzLnBsYWNlc0FyZUxvYWRpbmcpIHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKFwid2FpdGluZyBmb3IgbG9hZCBwbGFjZXNcIik7XG4gICAgICAgICAgdGhpcy5wbGFjZXNBcmVMb2FkaW5nLnRoZW4oZnVuY3Rpb24oKSAge1xuICAgICAgICAgICAgdGhpcy5sb2FkUHJpY2VzKCk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubG9hZFByaWNlcygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXZlbnRzLmVtaXQoXCJjaGFuZ2VcIik7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5jb21wYXJlT3JpZ2lucz1mdW5jdGlvbihhLCBiKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKGEub3JpZ2luICYmIGIub3JpZ2luKSB7XG4gICAgICBpZiAoYS5vcmlnaW4ubW9kZSA9PSBcInBsYWNlXCIgJiYgYi5vcmlnaW4ubW9kZSA9PSBcInBsYWNlXCIpICB7XG4gICAgICAgIHJldHVybiBhLm9yaWdpbi52YWx1ZS5pZCA9PSBiLm9yaWdpbi52YWx1ZS5pZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhLm9yaWdpbiA9PSBiLm9yaWdpbjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLyogYm90aCBudWxsID0+IHRydWUsIGVsc2UgPT4gZmFsc2UgKi9cbiAgICAgIHJldHVybiAhYS5vcmlnaW4gJiYgIWIub3JpZ2luO1xuICAgIH1cbiAgfTtcblxuICBNYXBQbGFjZXNTdG9yZS5wcm90b3R5cGUuY29tcGFyZUltcG9ydGFudFNlYXJjaEZvcm1EYXRhPWZ1bmN0aW9uKGEsIGIpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoYSAmJiBiKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wYXJlT3JpZ2lucyhhLGIpICYmIGEuZGF0ZUZyb20gPT0gYi5kYXRlRnJvbSAmJiBhLmRhdGVUbyA9PSBiLmRhdGVUbyAmJiBhLnBhc3NlbmdlcnMgPT0gYi5wYXNzZW5nZXJzXG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGJvdGggbnVsbCA9PiB0cnVlLCBlbHNlID0+IGZhbHNlICovXG4gICAgICByZXR1cm4gIWEgJiYgIWI7XG4gICAgfVxuXG4gIH07XG5cbiAgTWFwUGxhY2VzU3RvcmUucHJvdG90eXBlLmxvYWRQbGFjZXM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoe2xhbmc6IE9wdGlvbnNTdG9yZS5kYXRhLmxhbmd1YWdlfSk7XG4gICAgdGhpcy5wbGFjZXNBcmVMb2FkaW5nID0gcGxhY2VzQVBJLmZpbmRQbGFjZXMoe3R5cGVJRDogUGxhY2UuVFlQRV9DSVRZfSkudGhlbihmdW5jdGlvbihwbGFjZXMpICB7XG4gICAgICB2YXIgbWFwUGxhY2VzID0gcGxhY2VzLm1hcChmdW5jdGlvbihwbGFjZSkgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXBQbGFjZSh7cGxhY2U6IHBsYWNlfSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFwUGxhY2VzSW5kZXguaW5zZXJ0UGxhY2VzKG1hcFBsYWNlcyk7XG4gICAgICB0aGlzLnBsYWNlc0FyZUxvYWRpbmcgPSBudWxsO1xuICAgICAgdGhpcy5ldmVudHMuZW1pdChcImNoYW5nZVwiKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9O1xuXG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5sb2FkUHJpY2VzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIGlmICh0aGlzLmNvbXBhcmVJbXBvcnRhbnRTZWFyY2hGb3JtRGF0YSh0aGlzLmxhc3RTZWFyY2hGb3JtRGF0YSwgU2VhcmNoRm9ybVN0b3JlLmRhdGEpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubGFzdFNlYXJjaEZvcm1EYXRhID0gU2VhcmNoRm9ybVN0b3JlLmRhdGE7XG4gICAgdmFyIHRoaXNTZWFyY2hGb3JtRGF0YSA9IFNlYXJjaEZvcm1TdG9yZS5kYXRhO1xuXG4gICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aGlzLm1hcFBsYWNlc0luZGV4LmNsZWFuUHJpY2VzKCk7XG4gICAgaWYgKFNlYXJjaEZvcm1TdG9yZS5kYXRhLm9yaWdpbi5tb2RlID09IFwicGxhY2VcIiB8fCBTZWFyY2hGb3JtU3RvcmUuZGF0YS5vcmlnaW4ubW9kZSA9PSBcInJhZGl1c1wiKSB7XG4gICAgICBmbGlnaHRzQVBJLmZpbmRGbGlnaHRzKHtcbiAgICAgICAgb3JpZ2luOiBTZWFyY2hGb3JtU3RvcmUuZGF0YS5vcmlnaW4sXG4gICAgICAgIGRlc3RpbmF0aW9uOiBcImFueXdoZXJlXCIsXG4gICAgICAgIG91dGJvdW5kRGF0ZTogU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGF0ZUZyb20sXG4gICAgICAgIGluYm91bmREYXRlOiBTZWFyY2hGb3JtU3RvcmUuZGF0YS5kYXRlVG8sXG4gICAgICAgIHBhc3NlbmdlcnM6IFNlYXJjaEZvcm1TdG9yZS5kYXRhLnBhc3NlbmdlcnNcbiAgICAgIH0sIHtmb3JtYXQ6IFwib3JpZ2luYWxcIn0pLnRoZW4oZnVuY3Rpb24oZmxpZ2h0cykgIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbXBhcmVJbXBvcnRhbnRTZWFyY2hGb3JtRGF0YSh0aGlzU2VhcmNoRm9ybURhdGEsIFNlYXJjaEZvcm1TdG9yZS5kYXRhKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgZmxpZ2h0cy5mb3JFYWNoKGZ1bmN0aW9uKGZsaWdodCkgIHtcbiAgICAgICAgICB2YXIgbWFwUGxhY2UgPSB0aGlzLm1hcFBsYWNlc0luZGV4LmdldEJ5SWQoZmxpZ2h0Lm1hcElkdG8pO1xuICAgICAgICAgIGlmIChtYXBQbGFjZSkge1xuICAgICAgICAgICAgdGhpcy5tYXBQbGFjZXNJbmRleC5lZGl0UGxhY2UobWFwUGxhY2UuZWRpdCh7XCJwcmljZVwiOmZsaWdodC5wcmljZX0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuZXZlbnRzLmVtaXQoXCJjaGFuZ2VcIik7XG4gICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcbiAgICAgICAgLy9UT0RPIG5pY2VyIGVycm9yIGhhbmRsaW5nXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBNYXBQbGFjZXNTdG9yZS5wcm90b3R5cGUuZ2V0QnlCb3VuZHM9ZnVuY3Rpb24oYm91bmRzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMubWFwUGxhY2VzSW5kZXguZ2V0QnlCb3VuZHMoYm91bmRzKS5tYXAoZnVuY3Rpb24obWFwUGxhY2UpICB7XG4gICAgICBpZiAoU2VhcmNoRm9ybVN0b3JlLmRhdGEub3JpZ2luLm1vZGUgPT0gXCJwbGFjZVwiICYmIG1hcFBsYWNlLnBsYWNlLmlkID09IFNlYXJjaEZvcm1TdG9yZS5kYXRhLm9yaWdpbi52YWx1ZS5pZCkge1xuICAgICAgICByZXR1cm4gbWFwUGxhY2Uuc2V0KFwiZmxhZ1wiLFwib3JpZ2luXCIpO1xuICAgICAgfSBlbHNlIGlmIChTZWFyY2hGb3JtU3RvcmUuZGF0YS5kZXN0aW5hdGlvbi5tb2RlID09IFwicGxhY2VcIiAmJiBtYXBQbGFjZS5wbGFjZS5pZCA9PSBTZWFyY2hGb3JtU3RvcmUuZGF0YS5kZXN0aW5hdGlvbi52YWx1ZS5pZCkge1xuICAgICAgICByZXR1cm4gbWFwUGxhY2Uuc2V0KFwiZmxhZ1wiLFwiZGVzdGluYXRpb25cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbWFwUGxhY2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1hcFBsYWNlc1N0b3JlKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XHJcbnZhciBPcHRpb25zID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL09wdGlvbnMuanN4Jyk7XHJcblxyXG5cclxuICBmdW5jdGlvbiBPcHRpb25zU3RvcmUoKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvL01heGltdW0gb2YgbGlzdGVuZXJzIC0gaGVyZSBsaXN0ZW5zIGV2ZXJ5IHRyYW5zbGF0aW9uIGFuZCBjdXJyZW5jeSBzbyB0aGVyZSBpcyBhIGxvdCBvZiB0aGVtLCBidXQgaSBob3BlIG5vdCBtb3JlIHRoYW4gMTAwMFxyXG4gICAgdGhpcy5ldmVudHMuc2V0TWF4TGlzdGVuZXJzKDEwMDApO1xyXG5cclxuICAgIHRoaXMuZGF0YSA9IG5ldyBPcHRpb25zKCk7XHJcbiAgfVxyXG4gIE9wdGlvbnNTdG9yZS5wcm90b3R5cGUuc2V0VmFsdWU9ZnVuY3Rpb24odmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICBpZiAodGhpcy5kYXRhICE9IHZhbHVlKSB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IHZhbHVlO1xyXG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KCdjaGFuZ2UnKTtcclxuICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2hhbmdlZDtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBBbGlhcyBmb3Igc2V0XHJcbiAgICovXHJcbiAgT3B0aW9uc1N0b3JlLnByb3RvdHlwZS5zZXRPcHRpb249ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBvbmUgdmFsdWUgdG8gZ2l2ZW4ga2V5XHJcbiAgICogQHBhcmFtIGtleVxyXG4gICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAqIEByZXR1cm4geyp9XHJcbiAgICovXHJcbiAgT3B0aW9uc1N0b3JlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5kYXRhLnNldChrZXksIHZhbHVlKSk7XHJcbiAgfTtcclxuXHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IE9wdGlvbnNTdG9yZSgpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XHJcbnZhciBTZWFyY2hGb3JtRGF0YSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hGb3JtRGF0YS5qc3gnKTtcclxudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xyXG52YXIgUGxhY2UgPSByZXF1aXJlKCcuLy4uL2NvbnRhaW5lcnMvUGxhY2UuanN4Jyk7XHJcbnZhciBRID0gKHdpbmRvdy5RKTtcclxudmFyIFBsYWNlc0FQSSA9IHJlcXVpcmUoJy4vLi4vQVBJcy9QbGFjZXNBUElDYWNoZWQuanN4Jyk7XHJcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuL09wdGlvbnNTdG9yZS5qc3gnKTtcclxuXHJcblxyXG5cclxuXHJcbnZhciBnZXRGaXJzdEZyb21BcGkgPSBmdW5jdGlvbiAodGV4dCkge1xyXG4gIHZhciBwbGFjZXNBUEkgPSBuZXcgUGxhY2VzQVBJKHtsYW5nOiBPcHRpb25zU3RvcmUuZGF0YS5sYW5ndWFnZX0pOy8vVE9ETyBwdXQgaGVyZSBvcHRpb25zXHJcbiAgcmV0dXJuIHBsYWNlc0FQSS5maW5kQnlOYW1lKHRleHQpLnRoZW4oZnVuY3Rpb24ocGxhY2VzKSAge1xyXG4gICAgaWYgKHBsYWNlc1swXSkge1xyXG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiBuZXcgUGxhY2UocGxhY2VzWzBdKX0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJ0ZXh0XCIsIHZhbHVlOiB0ZXh0LCBlcnJvcjogXCJub3RGb3VuZFwifSk7XHJcbiAgICB9XHJcbiAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSAge1xyXG4gICAgY29uc29sZS5lcnJvcihlcnIpO1xyXG4gIH0pXHJcbn07XHJcblxyXG52YXIgZmluZEJ5SWRGcm9tQXBpID0gZnVuY3Rpb24gKGlkKSB7XHJcbiAgdmFyIHBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoe2xhbmc6IE9wdGlvbnNTdG9yZS5kYXRhLmxhbmd1YWdlfSk7Ly9UT0RPIHB1dCBoZXJlIG9wdGlvbnNcclxuICByZXR1cm4gcGxhY2VzQVBJLmZpbmRCeUlkKGlkKS50aGVuKGZ1bmN0aW9uKHBsYWNlKSAge1xyXG4gICAgaWYgKHBsYWNlKSB7XHJcbiAgICAgIHJldHVybiBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicGxhY2VcIiwgdmFsdWU6IHBsYWNlfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvL3N3aXRjaCB0byB0ZXh0IHdoZW4gaWQgbm90IGZvdW5kPz9cclxuICAgICAgcmV0dXJuIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJ0ZXh0XCIsIHZhbHVlOiBpZCwgZXJyb3I6IFwibm90Rm91bmRcIn0pO1xyXG4gICAgfVxyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICB9KVxyXG59O1xyXG5cclxuXHJcbi8qIHJldHVybnMgcHJvbWlzZSwgcHJvbWlzZSByZXNvbHZlcyB0cnVlIGlmIHRoZXJlIGlzIG5ldyB2YWx1ZSAqL1xyXG52YXIgZmV0Y2hQbGFjZSA9IGZ1bmN0aW9uKHNlYXJjaFBsYWNlKSB7XHJcbiAgaWYgKHNlYXJjaFBsYWNlLm1vZGUgPT0gXCJwbGFjZVwiICYmIHNlYXJjaFBsYWNlLnZhbHVlLmNvbXBsZXRlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7IC8qIGRvbid0IG5lZWQgdG8gYXN5bmMgbG9hZCAqL1xyXG4gIH0gZWxzZSBpZiAoc2VhcmNoUGxhY2UubW9kZSA9PSBcInBsYWNlXCIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHByb21pc2U6IGZpbmRCeUlkRnJvbUFwaShzZWFyY2hQbGFjZS52YWx1ZS5pZCkudGhlbihmdW5jdGlvbihuZXdTZWFyY2hQbGFjZSkgIHtcclxuICAgICAgICByZXR1cm4gbmV3U2VhcmNoUGxhY2Uuc2V0KFwiZm9ybU1vZGVcIiwgc2VhcmNoUGxhY2UuZm9ybU1vZGUpXHJcbiAgICAgIH0pLFxyXG4gICAgICB0ZW1wVmFsdWU6IHNlYXJjaFBsYWNlLnNldChcImxvYWRpbmdcIiwgdHJ1ZSkvL25ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogc2VhcmNoUGxhY2UudmFsdWUsIGxvYWRpbmc6IHRydWV9KVxyXG4gICAgfTtcclxuICB9IGVsc2UgaWYgKHNlYXJjaFBsYWNlLm1vZGUgPT0gXCJ0ZXh0XCIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHByb21pc2U6IGdldEZpcnN0RnJvbUFwaShzZWFyY2hQbGFjZS52YWx1ZSkudGhlbihmdW5jdGlvbihuZXdTZWFyY2hQbGFjZSkgIHtcclxuICAgICAgICByZXR1cm4gbmV3U2VhcmNoUGxhY2Uuc2V0KFwiZm9ybU1vZGVcIiwgc2VhcmNoUGxhY2UuZm9ybU1vZGUpXHJcbiAgICAgIH0pLFxyXG4gICAgICB0ZW1wVmFsdWU6IHNlYXJjaFBsYWNlLnNldChcImxvYWRpbmdcIiwgdHJ1ZSkvL25ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJ0ZXh0XCIsIHZhbHVlOiBzZWFyY2hQbGFjZS52YWx1ZSwgbG9hZGluZzogdHJ1ZX0pXHJcbiAgICB9O1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5cclxuICBmdW5jdGlvbiBTZWFyY2hGb3JtU3RvcmUoKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIHRoaXMuZGF0YSA9IG5ldyBTZWFyY2hGb3JtRGF0YSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdmFsdWVcclxuICAgKiBAcGFyYW0gY2hhbmdlVHlwZSAtIHR5cGUgb2YgY2hhbmdlIC0gZGVmYXVsdCBpcyBcInNlbGVjdFwiIHdoaWNoIGlzIGFsc28gbW9zdCBjb21tb24gYW5kIGZvciBleGFtcGxlIHRyaWdnZXJzIHNlYXJjaCBvbiBtYXBcclxuICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAqL1xyXG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuc2V0VmFsdWU9ZnVuY3Rpb24odmFsdWUsIGNoYW5nZVR5cGUpIHtcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICBpZiAodGhpcy5kYXRhICE9IHZhbHVlKSB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IHZhbHVlO1xyXG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KCdjaGFuZ2UnLGNoYW5nZVR5cGUpOyAvLyBjaGFuZ2UgaXMgYWZ0ZXIgYWxsIGNoYW5nZXNcclxuICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2hhbmdlZDtcclxuICB9O1xyXG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuc2V0RmllbGQ9ZnVuY3Rpb24oZmllbGROYW1lLCB2YWx1ZSwgY2hhbmdlVHlwZSkge1widXNlIHN0cmljdFwiO1xyXG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5kYXRhLmNoYW5nZUZpZWxkKGZpZWxkTmFtZSwgdmFsdWUpLCBjaGFuZ2VUeXBlKTtcclxuICB9O1xyXG5cclxuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLmNvbXBsZXRlRmllbGQ9ZnVuY3Rpb24oZmllbGROYW1lKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgZmV0Y2hJbmZvID0gZmV0Y2hQbGFjZSh0aGlzLmRhdGFbZmllbGROYW1lXSk7XHJcbiAgICBpZiAoZmV0Y2hJbmZvKSB7XHJcbiAgICAgIHZhciAkX18wPSAgIGZldGNoSW5mbyxwcm9taXNlPSRfXzAucHJvbWlzZSx0ZW1wVmFsdWU9JF9fMC50ZW1wVmFsdWU7XHJcbiAgICAgIHRoaXMuc2V0RmllbGQoZmllbGROYW1lLCB0ZW1wVmFsdWUpO1xyXG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGZpbmFsVmFsdWUpICB7XHJcbiAgICAgICAgLyogb25seSBpZiBpdCdzIGlzIHN0aWxsIHNhbWUgdmFsdWUgYXMgYmVmb3JlLCBub3RoaW5nIG5ldyAqL1xyXG4gICAgICAgIGlmICh0ZW1wVmFsdWUgPT0gdGhpcy5kYXRhW2ZpZWxkTmFtZV0pIHtcclxuICAgICAgICAgIHRoaXMuc2V0RmllbGQoZmllbGROYW1lLCBmaW5hbFZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vVE9ETyBkb250IGtub3cgd2hhdCB0byByZXR1cm4/Pz9cclxuICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH07XHJcbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS50cmlnZ2VyU2VhcmNoPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xyXG4gICAgLy9UT0RPIGNoZWNrIGlmIHRoZXJlIGlzIGV2ZXJ5IGRhdGEgb2tcclxuICAgIHRoaXMuZXZlbnRzLmVtaXQoJ3NlYXJjaCcpO1xyXG4gIH07XHJcbiAgLyogZmV0Y2ggZGlyZWN0aW9uIGFuZCByZXR1cm4gZGF0YSB3aXRoIHRlbXAgdmFsdWUgKi9cclxuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLmZldGNoRGlyZWN0aW9uPWZ1bmN0aW9uKGRhdGEsIGRpcmVjdGlvbikge1widXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIGZldGNoSW5mbyA9IGZldGNoUGxhY2UoZGF0YVtkaXJlY3Rpb25dKTtcclxuICAgIGlmIChmZXRjaEluZm8pIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBwcm9taXNlOiBmZXRjaEluZm8ucHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSAge1xyXG4gICAgICAgICAgcmV0dXJuIHtkaXJlY3Rpb246ZGlyZWN0aW9uLHZhbHVlOnZhbHVlfVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIG5ld0RhdGE6IGRhdGEuY2hhbmdlRmllbGQoZGlyZWN0aW9uLCBmZXRjaEluZm8udGVtcFZhbHVlKVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS5zZWFyY2g9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICB2YXIgcHJvbWlzZXMgPSBbXTtcclxuICAgIHZhciBuZXdUZW1wRGF0YSA9IHRoaXMuZGF0YTtcclxuICAgIHZhciBvcmlnaW5Mb2FkaW5nSW5mbyA9IHRoaXMuZmV0Y2hEaXJlY3Rpb24obmV3VGVtcERhdGEsIFwib3JpZ2luXCIpO1xyXG4gICAgaWYgKG9yaWdpbkxvYWRpbmdJbmZvKSB7XHJcbiAgICAgIHByb21pc2VzLnB1c2gob3JpZ2luTG9hZGluZ0luZm8ucHJvbWlzZSk7XHJcbiAgICAgIG5ld1RlbXBEYXRhID0gb3JpZ2luTG9hZGluZ0luZm8ubmV3RGF0YTtcclxuICAgIH1cclxuICAgIHZhciBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvID0gdGhpcy5mZXRjaERpcmVjdGlvbihuZXdUZW1wRGF0YSwgXCJkZXN0aW5hdGlvblwiKTtcclxuICAgIGlmIChkZXN0aW5hdGlvbkxvYWRpbmdJbmZvKSB7XHJcbiAgICAgIHByb21pc2VzLnB1c2goZGVzdGluYXRpb25Mb2FkaW5nSW5mby5wcm9taXNlKTtcclxuICAgICAgbmV3VGVtcERhdGEgPSBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvLm5ld0RhdGE7XHJcbiAgICB9XHJcbiAgICAvKiBpZiBhbnkgb2YgdGhlc2UgbmVlZHMgbG9hZGluZyBzYXZlIHRlbXBvcmFyeSBvYmplY3RzICovXHJcbiAgICBpZiAobmV3VGVtcERhdGEgIT0gdGhpcy5kYXRhKSB7XHJcbiAgICAgIHRoaXMuc2V0VmFsdWUobmV3VGVtcERhdGEpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBpZiAocHJvbWlzZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgbGFzdERhdGEgPSB0aGlzLmRhdGE7XHJcbiAgICAgIHJldHVybiBRLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXN1bHRzKSAge1xyXG4gICAgICAgIGlmIChsYXN0RGF0YSAhPSB0aGlzLmRhdGEpIHJldHVybjsgLy9pZiBzb21lIG90aGVyIHNlYXJjaCBoYXMgb3V0cmFuIG1lXHJcbiAgICAgICAgdmFyIG5ld0RhdGEgPSB0aGlzLmRhdGE7XHJcbiAgICAgICAgcmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uKHJlc3VsdCkgIHtcclxuICAgICAgICAgIG5ld0RhdGEgPSBuZXdEYXRhLmNoYW5nZUZpZWxkKHJlc3VsdC5kaXJlY3Rpb24sIHJlc3VsdC52YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZShuZXdEYXRhKTtcclxuICAgICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcclxuICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vVE9ETyBjaGVjayBpZiBpcyBub3QgbmVlZGVkIG5leHQgdGlja1xyXG4gICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcclxuXHJcbiAgICAgIC8vVE9ETyByZXR1cm4gc29tZSBwcm9taXNlPz9cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbmV3IFNlYXJjaEZvcm1TdG9yZSgpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxyXG5leHBvcnRzLnZhbGlkYXRlID0gZnVuY3Rpb24ob3V0Ym91bmQsIGluYm91bmQpIHtcclxuICBpZiAoIW91dGJvdW5kKSB7XHJcbiAgICByZXR1cm4gXCJvdXRib3VuZE5vdFNlbGVjdGVkXCJcclxuICB9XHJcbiAgaWYgKCFpbmJvdW5kKSB7XHJcbiAgICByZXR1cm4gXCJpbmJvdW5kTm90U2VsZWN0ZWRcIlxyXG4gIH1cclxuXHJcbiAgaWYgKGluYm91bmQubW9kZSA9PSBcInNpbmdsZVwiICYmIG91dGJvdW5kLm1vZGUgPT0gXCJzaW5nbGVcIikge1xyXG4gICAgaWYgKGluYm91bmQuZ2V0RGF0ZSgpLmZvcm1hdChcIllZWVlNTUREXCIpIDwgb3V0Ym91bmQuZ2V0RGF0ZSgpLmZvcm1hdChcIllZWVlNTUREXCIpKSB7XHJcbiAgICAgIHJldHVybiBcImNyb3NzZWREYXRlc1wiXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59O1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXHJcbi8qICBHZW9kZXN5IHJlcHJlc2VudGF0aW9uIGNvbnZlcnNpb24gZnVuY3Rpb25zICAgICAgICAgICAgICAgICAgICAgICAoYykgQ2hyaXMgVmVuZXNzIDIwMDItMjAxNCAgKi9cclxuLyogICAtIHd3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JVCBMaWNlbmNlICAqL1xyXG4vKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qICBTYW1wbGUgdXNhZ2U6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cclxuLyogICAgdmFyIGxhdCA9IEdlby5wYXJzZURNUygnNTHCsCAyOOKAsiA0MC4xMuKAsyBOJyk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qICAgIHZhciBsb24gPSBHZW8ucGFyc2VETVMoJzAwMMKwIDAw4oCyIDA1LjMx4oCzIFcnKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xyXG4vKiAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKGxhdCwgbG9uKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXHJcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cclxuXHJcbi8qIGpzaGludCBub2RlOnRydWUgKi8vKiBnbG9iYWwgZGVmaW5lICovXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4vKipcclxuICogVG9vbHMgZm9yIGNvbnZlcnRpbmcgYmV0d2VlbiBudW1lcmljIGRlZ3JlZXMgYW5kIGRlZ3JlZXMgLyBtaW51dGVzIC8gc2Vjb25kcy5cclxuICpcclxuICogQG5hbWVzcGFjZVxyXG4gKi9cclxudmFyIEdlbyA9IHt9O1xyXG5cclxuXHJcbi8vIG5vdGUgVW5pY29kZSBEZWdyZWUgPSBVKzAwQjAuIFByaW1lID0gVSsyMDMyLCBEb3VibGUgcHJpbWUgPSBVKzIwMzNcclxuXHJcblxyXG4vKipcclxuICogUGFyc2VzIHN0cmluZyByZXByZXNlbnRpbmcgZGVncmVlcy9taW51dGVzL3NlY29uZHMgaW50byBudW1lcmljIGRlZ3JlZXMuXHJcbiAqXHJcbiAqIFRoaXMgaXMgdmVyeSBmbGV4aWJsZSBvbiBmb3JtYXRzLCBhbGxvd2luZyBzaWduZWQgZGVjaW1hbCBkZWdyZWVzLCBvciBkZWctbWluLXNlYyBvcHRpb25hbGx5XHJcbiAqIHN1ZmZpeGVkIGJ5IGNvbXBhc3MgZGlyZWN0aW9uIChOU0VXKS4gQSB2YXJpZXR5IG9mIHNlcGFyYXRvcnMgYXJlIGFjY2VwdGVkIChlZyAzwrAgMzfigLIgMDnigLNXKS5cclxuICogU2Vjb25kcyBhbmQgbWludXRlcyBtYXkgYmUgb21pdHRlZC5cclxuICpcclxuICogQHBhcmFtICAge3N0cmluZ3xudW1iZXJ9IGRtc1N0ciAtIERlZ3JlZXMgb3IgZGVnL21pbi9zZWMgaW4gdmFyaWV0eSBvZiBmb3JtYXRzLlxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBEZWdyZWVzIGFzIGRlY2ltYWwgbnVtYmVyLlxyXG4gKi9cclxuR2VvLnBhcnNlRE1TID0gZnVuY3Rpb24oZG1zU3RyKSB7XHJcbiAgICAvLyBjaGVjayBmb3Igc2lnbmVkIGRlY2ltYWwgZGVncmVlcyB3aXRob3V0IE5TRVcsIGlmIHNvIHJldHVybiBpdCBkaXJlY3RseVxyXG4gICAgaWYgKHR5cGVvZiBkbXNTdHIgPT0gJ251bWJlcicgJiYgaXNGaW5pdGUoZG1zU3RyKSkgcmV0dXJuIE51bWJlcihkbXNTdHIpO1xyXG5cclxuICAgIC8vIHN0cmlwIG9mZiBhbnkgc2lnbiBvciBjb21wYXNzIGRpciduICYgc3BsaXQgb3V0IHNlcGFyYXRlIGQvbS9zXHJcbiAgICB2YXIgZG1zID0gU3RyaW5nKGRtc1N0cikudHJpbSgpLnJlcGxhY2UoL14tLywnJykucmVwbGFjZSgvW05TRVddJC9pLCcnKS5zcGxpdCgvW14wLTkuLF0rLyk7XHJcbiAgICBpZiAoZG1zW2Rtcy5sZW5ndGgtMV09PScnKSBkbXMuc3BsaWNlKGRtcy5sZW5ndGgtMSk7ICAvLyBmcm9tIHRyYWlsaW5nIHN5bWJvbFxyXG5cclxuICAgIGlmIChkbXMgPT0gJycpIHJldHVybiBOYU47XHJcblxyXG4gICAgLy8gYW5kIGNvbnZlcnQgdG8gZGVjaW1hbCBkZWdyZWVzLi4uXHJcbiAgICB2YXIgZGVnO1xyXG4gICAgc3dpdGNoIChkbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgY2FzZSAzOiAgLy8gaW50ZXJwcmV0IDMtcGFydCByZXN1bHQgYXMgZC9tL3NcclxuICAgICAgICAgICAgZGVnID0gZG1zWzBdLzEgKyBkbXNbMV0vNjAgKyBkbXNbMl0vMzYwMDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAyOiAgLy8gaW50ZXJwcmV0IDItcGFydCByZXN1bHQgYXMgZC9tXHJcbiAgICAgICAgICAgIGRlZyA9IGRtc1swXS8xICsgZG1zWzFdLzYwO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIDE6ICAvLyBqdXN0IGQgKHBvc3NpYmx5IGRlY2ltYWwpIG9yIG5vbi1zZXBhcmF0ZWQgZGRkbW1zc1xyXG4gICAgICAgICAgICBkZWcgPSBkbXNbMF07XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBmaXhlZC13aWR0aCB1bnNlcGFyYXRlZCBmb3JtYXQgZWcgMDAzMzcwOVdcclxuICAgICAgICAgICAgLy9pZiAoL1tOU10vaS50ZXN0KGRtc1N0cikpIGRlZyA9ICcwJyArIGRlZzsgIC8vIC0gbm9ybWFsaXNlIE4vUyB0byAzLWRpZ2l0IGRlZ3JlZXNcclxuICAgICAgICAgICAgLy9pZiAoL1swLTldezd9Ly50ZXN0KGRlZykpIGRlZyA9IGRlZy5zbGljZSgwLDMpLzEgKyBkZWcuc2xpY2UoMyw1KS82MCArIGRlZy5zbGljZSg1KS8zNjAwO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gTmFOO1xyXG4gICAgfVxyXG4gICAgaWYgKC9eLXxbV1NdJC9pLnRlc3QoZG1zU3RyLnRyaW0oKSkpIGRlZyA9IC1kZWc7IC8vIHRha2UgJy0nLCB3ZXN0IGFuZCBzb3V0aCBhcyAtdmVcclxuXHJcbiAgICByZXR1cm4gTnVtYmVyKGRlZyk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIGRlY2ltYWwgZGVncmVlcyB0byBkZWcvbWluL3NlYyBmb3JtYXRcclxuICogIC0gZGVncmVlLCBwcmltZSwgZG91YmxlLXByaW1lIHN5bWJvbHMgYXJlIGFkZGVkLCBidXQgc2lnbiBpcyBkaXNjYXJkZWQsIHRob3VnaCBubyBjb21wYXNzXHJcbiAqICAgIGRpcmVjdGlvbiBpcyBhZGRlZC5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxyXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBSZXR1cm4gdmFsdWUgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cclxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2Ug4oCTIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cclxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxyXG4gKi9cclxuR2VvLnRvRE1TID0gZnVuY3Rpb24oZGVnLCBmb3JtYXQsIGRwKSB7XHJcbiAgICBpZiAoaXNOYU4oZGVnKSkgcmV0dXJuIG51bGw7ICAvLyBnaXZlIHVwIGhlcmUgaWYgd2UgY2FuJ3QgbWFrZSBhIG51bWJlciBmcm9tIGRlZ1xyXG5cclxuICAgIC8vIGRlZmF1bHQgdmFsdWVzXHJcbiAgICBpZiAodHlwZW9mIGZvcm1hdCA9PSAndW5kZWZpbmVkJykgZm9ybWF0ID0gJ2Rtcyc7XHJcbiAgICBpZiAodHlwZW9mIGRwID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgc3dpdGNoIChmb3JtYXQpIHtcclxuICAgICAgICAgICAgY2FzZSAnZCc6ICAgZHAgPSA0OyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZG0nOiAgZHAgPSAyOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZG1zJzogZHAgPSAwOyBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDogICAgZm9ybWF0ID0gJ2Rtcyc7IGRwID0gMDsgIC8vIGJlIGZvcmdpdmluZyBvbiBpbnZhbGlkIGZvcm1hdFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWcgPSBNYXRoLmFicyhkZWcpOyAgLy8gKHVuc2lnbmVkIHJlc3VsdCByZWFkeSBmb3IgYXBwZW5kaW5nIGNvbXBhc3MgZGlyJ24pXHJcblxyXG4gICAgdmFyIGRtcywgZCwgbSwgcztcclxuICAgIHN3aXRjaCAoZm9ybWF0KSB7XHJcbiAgICAgICAgZGVmYXVsdDogLy8gaW52YWxpZCBmb3JtYXQgc3BlYyFcclxuICAgICAgICBjYXNlICdkJzpcclxuICAgICAgICAgICAgZCA9IGRlZy50b0ZpeGVkKGRwKTsgICAgIC8vIHJvdW5kIGRlZ3JlZXNcclxuICAgICAgICAgICAgaWYgKGQ8MTAwKSBkID0gJzAnICsgZDsgIC8vIHBhZCB3aXRoIGxlYWRpbmcgemVyb3NcclxuICAgICAgICAgICAgaWYgKGQ8MTApIGQgPSAnMCcgKyBkO1xyXG4gICAgICAgICAgICBkbXMgPSBkICsgJ8KwJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZG0nOlxyXG4gICAgICAgICAgICB2YXIgbWluID0gKGRlZyo2MCkudG9GaXhlZChkcCk7ICAvLyBjb252ZXJ0IGRlZ3JlZXMgdG8gbWludXRlcyAmIHJvdW5kXHJcbiAgICAgICAgICAgIGQgPSBNYXRoLmZsb29yKG1pbiAvIDYwKTsgICAgLy8gZ2V0IGNvbXBvbmVudCBkZWcvbWluXHJcbiAgICAgICAgICAgIG0gPSAobWluICUgNjApLnRvRml4ZWQoZHApOyAgLy8gcGFkIHdpdGggdHJhaWxpbmcgemVyb3NcclxuICAgICAgICAgICAgaWYgKGQ8MTAwKSBkID0gJzAnICsgZDsgICAgICAgICAgLy8gcGFkIHdpdGggbGVhZGluZyB6ZXJvc1xyXG4gICAgICAgICAgICBpZiAoZDwxMCkgZCA9ICcwJyArIGQ7XHJcbiAgICAgICAgICAgIGlmIChtPDEwKSBtID0gJzAnICsgbTtcclxuICAgICAgICAgICAgZG1zID0gZCArICfCsCcgKyBtICsgJ+KAsic7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Rtcyc6XHJcbiAgICAgICAgICAgIHZhciBzZWMgPSAoZGVnKjM2MDApLnRvRml4ZWQoZHApOyAgLy8gY29udmVydCBkZWdyZWVzIHRvIHNlY29uZHMgJiByb3VuZFxyXG4gICAgICAgICAgICBkID0gTWF0aC5mbG9vcihzZWMgLyAzNjAwKTsgICAgLy8gZ2V0IGNvbXBvbmVudCBkZWcvbWluL3NlY1xyXG4gICAgICAgICAgICBtID0gTWF0aC5mbG9vcihzZWMvNjApICUgNjA7XHJcbiAgICAgICAgICAgIHMgPSAoc2VjICUgNjApLnRvRml4ZWQoZHApOyAgICAvLyBwYWQgd2l0aCB0cmFpbGluZyB6ZXJvc1xyXG4gICAgICAgICAgICBpZiAoZDwxMDApIGQgPSAnMCcgKyBkOyAgICAgICAgICAgIC8vIHBhZCB3aXRoIGxlYWRpbmcgemVyb3NcclxuICAgICAgICAgICAgaWYgKGQ8MTApIGQgPSAnMCcgKyBkO1xyXG4gICAgICAgICAgICBpZiAobTwxMCkgbSA9ICcwJyArIG07XHJcbiAgICAgICAgICAgIGlmIChzPDEwKSBzID0gJzAnICsgcztcclxuICAgICAgICAgICAgZG1zID0gZCArICfCsCcgKyBtICsgJ+KAsicgKyBzICsgJ+KAsyc7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRtcztcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQ29udmVydHMgbnVtZXJpYyBkZWdyZWVzIHRvIGRlZy9taW4vc2VjIGxhdGl0dWRlICgyLWRpZ2l0IGRlZ3JlZXMsIHN1ZmZpeGVkIHdpdGggTi9TKS5cclxuICpcclxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxyXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBSZXR1cm4gdmFsdWUgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cclxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2Ug4oCTIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cclxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxyXG4gKi9cclxuR2VvLnRvTGF0ID0gZnVuY3Rpb24oZGVnLCBmb3JtYXQsIGRwKSB7XHJcbiAgICB2YXIgbGF0ID0gR2VvLnRvRE1TKGRlZywgZm9ybWF0LCBkcCk7XHJcbiAgICByZXR1cm4gbGF0PT09bnVsbCA/ICfigJMnIDogbGF0LnNsaWNlKDEpICsgKGRlZzwwID8gJ1MnIDogJ04nKTsgIC8vIGtub2NrIG9mZiBpbml0aWFsICcwJyBmb3IgbGF0IVxyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0IG51bWVyaWMgZGVncmVlcyB0byBkZWcvbWluL3NlYyBsb25naXR1ZGUgKDMtZGlnaXQgZGVncmVlcywgc3VmZml4ZWQgd2l0aCBFL1cpXHJcbiAqXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRlZyAtIERlZ3JlZXMgdG8gYmUgZm9ybWF0dGVkIGFzIHNwZWNpZmllZC5cclxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIOKAkyBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IERlZ3JlZXMgZm9ybWF0dGVkIGFzIGRlZy9taW4vc2VjcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWVkIGZvcm1hdC5cclxuICovXHJcbkdlby50b0xvbiA9IGZ1bmN0aW9uKGRlZywgZm9ybWF0LCBkcCkge1xyXG4gICAgdmFyIGxvbiA9IEdlby50b0RNUyhkZWcsIGZvcm1hdCwgZHApO1xyXG4gICAgcmV0dXJuIGxvbj09PW51bGwgPyAn4oCTJyA6IGxvbiArIChkZWc8MCA/ICdXJyA6ICdFJyk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIENvbnZlcnRzIG51bWVyaWMgZGVncmVlcyB0byBkZWcvbWluL3NlYyBhcyBhIGJlYXJpbmcgKDDCsC4uMzYwwrApXHJcbiAqXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRlZyAtIERlZ3JlZXMgdG8gYmUgZm9ybWF0dGVkIGFzIHNwZWNpZmllZC5cclxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIOKAkyBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IERlZ3JlZXMgZm9ybWF0dGVkIGFzIGRlZy9taW4vc2VjcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWVkIGZvcm1hdC5cclxuICovXHJcbkdlby50b0JybmcgPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcclxuICAgIGRlZyA9IChOdW1iZXIoZGVnKSszNjApICUgMzYwOyAgLy8gbm9ybWFsaXNlIC12ZSB2YWx1ZXMgdG8gMTgwwrAuLjM2MMKwXHJcbiAgICB2YXIgYnJuZyA9ICBHZW8udG9ETVMoZGVnLCBmb3JtYXQsIGRwKTtcclxuICAgIHJldHVybiBicm5nPT09bnVsbCA/ICfigJMnIDogYnJuZy5yZXBsYWNlKCczNjAnLCAnMCcpOyAgLy8ganVzdCBpbiBjYXNlIHJvdW5kaW5nIHRvb2sgdXMgdXAgdG8gMzYwwrAhXHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgY29tcGFzcyBwb2ludCAodG8gZ2l2ZW4gcHJlY2lzaW9uKSBmb3Igc3VwcGxpZWQgYmVhcmluZy5cclxuICpcclxuICogQHBhcmFtICAge251bWJlcn0gYmVhcmluZyAtIEJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxyXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbcHJlY2lzaW9uPTNdIC0gUHJlY2lzaW9uIChjYXJkaW5hbCAvIGludGVyY2FyZGluYWwgLyBzZWNvbmRhcnktaW50ZXJjYXJkaW5hbCkuXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IENvbXBhc3MgcG9pbnQgZm9yIHN1cHBsaWVkIGJlYXJpbmcuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgdmFyIHBvaW50ID0gR2VvLmNvbXBhc3NQb2ludCgyNCk7ICAgIC8vIHBvaW50ID0gJ05ORSdcclxuICogICB2YXIgcG9pbnQgPSBHZW8uY29tcGFzc1BvaW50KDI0LCAxKTsgLy8gcG9pbnQgPSAnTidcclxuICovXHJcbkdlby5jb21wYXNzUG9pbnQgPSBmdW5jdGlvbihiZWFyaW5nLCBwcmVjaXNpb24pIHtcclxuICAgIGlmICh0eXBlb2YgcHJlY2lzaW9uID09ICd1bmRlZmluZWQnKSBwcmVjaXNpb24gPSAzO1xyXG4gICAgLy8gbm90ZSBwcmVjaXNpb24gPSBtYXggbGVuZ3RoIG9mIGNvbXBhc3MgcG9pbnQ7IGl0IGNvdWxkIGJlIGV4dGVuZGVkIHRvIDQgZm9yIHF1YXJ0ZXItd2luZHNcclxuICAgIC8vIChlZyBORWJOKSwgYnV0IEkgdGhpbmsgdGhleSBhcmUgbGl0dGxlIHVzZWRcclxuXHJcbiAgICBiZWFyaW5nID0gKChiZWFyaW5nJTM2MCkrMzYwKSUzNjA7IC8vIG5vcm1hbGlzZSB0byAwLi4zNjBcclxuXHJcbiAgICB2YXIgcG9pbnQ7XHJcblxyXG4gICAgc3dpdGNoIChwcmVjaXNpb24pIHtcclxuICAgICAgICBjYXNlIDE6IC8vIDQgY29tcGFzcyBwb2ludHNcclxuICAgICAgICAgICAgc3dpdGNoIChNYXRoLnJvdW5kKGJlYXJpbmcqNC8zNjApJTQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogcG9pbnQgPSAnTic7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiBwb2ludCA9ICdFJzsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHBvaW50ID0gJ1MnOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogcG9pbnQgPSAnVyc7IGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMjogLy8gOCBjb21wYXNzIHBvaW50c1xyXG4gICAgICAgICAgICBzd2l0Y2ggKE1hdGgucm91bmQoYmVhcmluZyo4LzM2MCklOCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBwb2ludCA9ICdOJzsgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiBwb2ludCA9ICdORSc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiBwb2ludCA9ICdFJzsgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiBwb2ludCA9ICdTRSc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBwb2ludCA9ICdTJzsgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBwb2ludCA9ICdTVyc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA2OiBwb2ludCA9ICdXJzsgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBwb2ludCA9ICdOVyc7IGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgMzogLy8gMTYgY29tcGFzcyBwb2ludHNcclxuICAgICAgICAgICAgc3dpdGNoIChNYXRoLnJvdW5kKGJlYXJpbmcqMTYvMzYwKSUxNikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAgMDogcG9pbnQgPSAnTic7ICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICAxOiBwb2ludCA9ICdOTkUnOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgIDI6IHBvaW50ID0gJ05FJzsgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAgMzogcG9pbnQgPSAnRU5FJzsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICA0OiBwb2ludCA9ICdFJzsgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgIDU6IHBvaW50ID0gJ0VTRSc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAgNjogcG9pbnQgPSAnU0UnOyAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICA3OiBwb2ludCA9ICdTU0UnOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgIDg6IHBvaW50ID0gJ1MnOyAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAgOTogcG9pbnQgPSAnU1NXJzsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEwOiBwb2ludCA9ICdTVyc7ICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMTE6IHBvaW50ID0gJ1dTVyc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxMjogcG9pbnQgPSAnVyc7ICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEzOiBwb2ludCA9ICdXTlcnOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMTQ6IHBvaW50ID0gJ05XJzsgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxNTogcG9pbnQgPSAnTk5XJzsgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignUHJlY2lzaW9uIG11c3QgYmUgYmV0d2VlbiAxIGFuZCAzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBvaW50O1xyXG59XHJcblxyXG5cclxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xyXG5cclxuXHJcbi8qKiBFeHRlbmQgTnVtYmVyIG9iamVjdCB3aXRoIG1ldGhvZCB0byAgdHJpbSB3aGl0ZXNwYWNlIGZyb20gc3RyaW5nXHJcbiAqICAocS52LiBibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9mYXN0ZXItdHJpbS1qYXZhc2NyaXB0KSAqL1xyXG5pZiAodHlwZW9mIFN0cmluZy5wcm90b3R5cGUudHJpbSA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgU3RyaW5nLnByb3RvdHlwZS50cmltID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzKS5yZXBsYWNlKC9eXFxzXFxzKi8sICcnKS5yZXBsYWNlKC9cXHNcXHMqJC8sICcnKTtcclxuICAgIH07XHJcbn1cclxuXHJcblxyXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IEdlbzsgLy8gQ29tbW9uSlNcclxuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gR2VvOyB9KTsgLy8gQU1EXHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLy9FbmhhbmNlSlMgaXNJRSB0ZXN0IGlkZWFcclxuXHJcbi8vZGV0ZWN0IElFIGFuZCB2ZXJzaW9uIG51bWJlciB0aHJvdWdoIGluamVjdGVkIGNvbmRpdGlvbmFsIGNvbW1lbnRzIChubyBVQSBkZXRlY3QsIG5vIG5lZWQgZm9yIGNvbmQuIGNvbXBpbGF0aW9uIC8ganNjcmlwdCBjaGVjaylcclxuXHJcbi8vdmVyc2lvbiBhcmcgaXMgZm9yIElFIHZlcnNpb24gKG9wdGlvbmFsKVxyXG4vL2NvbXBhcmlzb24gYXJnIHN1cHBvcnRzICdsdGUnLCAnZ3RlJywgZXRjIChvcHRpb25hbClcclxuXHJcbmZ1bmN0aW9uIGlzSUUodmVyc2lvbiwgY29tcGFyaXNvbikge1xyXG4gIHZhciBjYyAgICAgID0gJ0lFJyxcclxuICAgIGIgICAgICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdCJyksXHJcbiAgICBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgaXNJRTtcclxuXHJcbiAgaWYodmVyc2lvbil7XHJcbiAgICBjYyArPSAnICcgKyB2ZXJzaW9uO1xyXG4gICAgaWYoY29tcGFyaXNvbil7IGNjID0gY29tcGFyaXNvbiArICcgJyArIGNjOyB9XHJcbiAgfVxyXG5cclxuICBiLmlubmVySFRNTCA9ICc8IS0tW2lmICcrIGNjICsnXT48YiBpZD1cImllY2N0ZXN0XCI+PC9iPjwhW2VuZGlmXS0tPic7XHJcbiAgZG9jRWxlbS5hcHBlbmRDaGlsZChiKTtcclxuICBpc0lFID0gISFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWVjY3Rlc3QnKTtcclxuICBkb2NFbGVtLnJlbW92ZUNoaWxkKGIpO1xyXG4gIHJldHVybiBpc0lFO1xyXG59XHJcblxyXG4vLy8vaXMgaXQgSUU/XHJcbi8vaXNJRSgpO1xyXG4vL1xyXG4vLy8vaXMgaXQgSUU2P1xyXG4vL2lzSUUoNik7XHJcbi8vXHJcbi8vLy9pcyBpdCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gSUUgNj9cclxuLy9pc0lFKDcsJ2x0ZScpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBpc0lFO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cclxuLyogIExhdGl0dWRlL2xvbmdpdHVkZSBzcGhlcmljYWwgZ2VvZGVzeSBmb3JtdWxhZSAmIHNjcmlwdHMgICAgICAgICAgIChjKSBDaHJpcyBWZW5lc3MgMjAwMi0yMDE0ICAqL1xyXG4vKiAgIC0gd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL2xhdGxvbmcuaHRtbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlUIExpY2VuY2UgICovXHJcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cclxuXHJcbi8qIGpzaGludCBub2RlOnRydWUgKi8vKiBnbG9iYWwgZGVmaW5lICovXHJcbid1c2Ugc3RyaWN0JztcclxuaWYgKHR5cGVvZiBtb2R1bGUhPSd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB2YXIgR2VvID0gcmVxdWlyZSgnLi9nZW8nKTsgLy8gQ29tbW9uSlMgKE5vZGUuanMpXHJcblxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBMYXRMb24gcG9pbnQgb24gdGhlIGVhcnRoJ3Mgc3VyZmFjZSBhdCB0aGUgc3BlY2lmaWVkIGxhdGl0dWRlIC8gbG9uZ2l0dWRlLlxyXG4gKlxyXG4gKiBAY2xhc3NkZXNjIFRvb2xzIGZvciBnZW9kZXRpYyBjYWxjdWxhdGlvbnNcclxuICogQHJlcXVpcmVzIEdlb1xyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtudW1iZXJ9IGxhdCAtIExhdGl0dWRlIGluIGRlZ3JlZXMuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBsb24gLSBMb25naXR1ZGUgaW4gZGVncmVlcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHQ9MF0gLSBIZWlnaHQgYWJvdmUgbWVhbi1zZWEtbGV2ZWwgaW4ga2lsb21ldHJlcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFtyYWRpdXM9NjM3MV0gLSAoTWVhbikgcmFkaXVzIG9mIGVhcnRoIGluIGtpbG9tZXRyZXMuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpO1xyXG4gKi9cclxuZnVuY3Rpb24gTGF0TG9uKGxhdCwgbG9uLCBoZWlnaHQsIHJhZGl1cykge1xyXG4gICAgLy8gYWxsb3cgaW5zdGFudGlhdGlvbiB3aXRob3V0ICduZXcnXHJcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTGF0TG9uKSkgcmV0dXJuIG5ldyBMYXRMb24obGF0LCBsb24sIGhlaWdodCwgcmFkaXVzKTtcclxuXHJcbiAgICBpZiAodHlwZW9mIGhlaWdodCA9PSAndW5kZWZpbmVkJykgaGVpZ2h0ID0gMDtcclxuICAgIGlmICh0eXBlb2YgcmFkaXVzID09ICd1bmRlZmluZWQnKSByYWRpdXMgPSA2MzcxO1xyXG4gICAgcmFkaXVzID0gTWF0aC5taW4oTWF0aC5tYXgocmFkaXVzLCA2MzUzKSwgNjM4NCk7XHJcblxyXG4gICAgdGhpcy5sYXQgICAgPSBOdW1iZXIobGF0KTtcclxuICAgIHRoaXMubG9uICAgID0gTnVtYmVyKGxvbik7XHJcbiAgICB0aGlzLmhlaWdodCA9IE51bWJlcihoZWlnaHQpO1xyXG4gICAgdGhpcy5yYWRpdXMgPSBOdW1iZXIocmFkaXVzKTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludCAodXNpbmcgaGF2ZXJzaW5lIGZvcm11bGEpLlxyXG4gKlxyXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cclxuICogQHJldHVybnMge251bWJlcn0gRGlzdGFuY2UgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCBkZXN0aW5hdGlvbiBwb2ludCwgaW4ga20gKG9uIHNwaGVyZSBvZiAndGhpcycgcmFkaXVzKS5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcclxuICogICAgIHZhciBkID0gcDEuZGlzdGFuY2VUbyhwMik7IC8vIGQudG9QcmVjaXNpb24oNCk6IDQwNC4zXHJcbiAqL1xyXG5MYXRMb24ucHJvdG90eXBlLmRpc3RhbmNlVG8gPSBmdW5jdGlvbihwb2ludCkge1xyXG4gICAgdmFyIFIgPSB0aGlzLnJhZGl1cztcclxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xyXG4gICAgdmFyIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKSwgzrsyID0gcG9pbnQubG9uLnRvUmFkaWFucygpO1xyXG4gICAgdmFyIM6Uz4YgPSDPhjIgLSDPhjE7XHJcbiAgICB2YXIgzpTOuyA9IM67MiAtIM67MTtcclxuXHJcbiAgICB2YXIgYSA9IE1hdGguc2luKM6Uz4YvMikgKiBNYXRoLnNpbijOlM+GLzIpICtcclxuICAgICAgICAgICAgTWF0aC5jb3Moz4YxKSAqIE1hdGguY29zKM+GMikgKlxyXG4gICAgICAgICAgICBNYXRoLnNpbijOlM67LzIpICogTWF0aC5zaW4ozpTOuy8yKTtcclxuICAgIHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMS1hKSk7XHJcbiAgICB2YXIgZCA9IFIgKiBjO1xyXG5cclxuICAgIHJldHVybiBkO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSAoaW5pdGlhbCkgYmVhcmluZyBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludC5cclxuICpcclxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IEluaXRpYWwgYmVhcmluZyBpbiBkZWdyZWVzIGZyb20gbm9ydGguXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpLCBwMiA9IG5ldyBMYXRMb24oNDguODU3LCAyLjM1MSk7XHJcbiAqICAgICB2YXIgYjEgPSBwMS5iZWFyaW5nVG8ocDIpOyAvLyBiMS50b0ZpeGVkKDEpOiAxNTYuMlxyXG4gKi9cclxuTGF0TG9uLnByb3RvdHlwZS5iZWFyaW5nVG8gPSBmdW5jdGlvbihwb2ludCkge1xyXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XHJcbiAgICB2YXIgzpTOuyA9IChwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xyXG5cclxuICAgIC8vIHNlZSBodHRwOi8vbWF0aGZvcnVtLm9yZy9saWJyYXJ5L2RybWF0aC92aWV3LzU1NDE3Lmh0bWxcclxuICAgIHZhciB5ID0gTWF0aC5zaW4ozpTOuykgKiBNYXRoLmNvcyjPhjIpO1xyXG4gICAgdmFyIHggPSBNYXRoLmNvcyjPhjEpKk1hdGguc2luKM+GMikgLVxyXG4gICAgICAgICAgICBNYXRoLnNpbijPhjEpKk1hdGguY29zKM+GMikqTWF0aC5jb3MozpTOuyk7XHJcbiAgICB2YXIgzrggPSBNYXRoLmF0YW4yKHksIHgpO1xyXG5cclxuICAgIHJldHVybiAozrgudG9EZWdyZWVzKCkrMzYwKSAlIDM2MDtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogUmV0dXJucyBmaW5hbCBiZWFyaW5nIGFycml2aW5nIGF0IGRlc3RpbmF0aW9uIGRlc3RpbmF0aW9uIHBvaW50IGZyb20gJ3RoaXMnIHBvaW50OyB0aGUgZmluYWwgYmVhcmluZ1xyXG4gKiB3aWxsIGRpZmZlciBmcm9tIHRoZSBpbml0aWFsIGJlYXJpbmcgYnkgdmFyeWluZyBkZWdyZWVzIGFjY29yZGluZyB0byBkaXN0YW5jZSBhbmQgbGF0aXR1ZGUuXHJcbiAqXHJcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBGaW5hbCBiZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcclxuICogICAgIHZhciBiMiA9IHAxLmZpbmFsQmVhcmluZ1RvKHAyKTsgLy8gcDIudG9GaXhlZCgxKTogMTU3LjlcclxuICovXHJcbkxhdExvbi5wcm90b3R5cGUuZmluYWxCZWFyaW5nVG8gPSBmdW5jdGlvbihwb2ludCkge1xyXG4gICAgLy8gZ2V0IGluaXRpYWwgYmVhcmluZyBmcm9tIGRlc3RpbmF0aW9uIHBvaW50IHRvIHRoaXMgcG9pbnQgJiByZXZlcnNlIGl0IGJ5IGFkZGluZyAxODDCsFxyXG4gICAgcmV0dXJuICggcG9pbnQuYmVhcmluZ1RvKHRoaXMpKzE4MCApICUgMzYwO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaWRwb2ludCBiZXR3ZWVuICd0aGlzJyBwb2ludCBhbmQgdGhlIHN1cHBsaWVkIHBvaW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cclxuICogQHJldHVybnMge0xhdExvbn0gTWlkcG9pbnQgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCB0aGUgc3VwcGxpZWQgcG9pbnQuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpLCBwMiA9IG5ldyBMYXRMb24oNDguODU3LCAyLjM1MSk7XHJcbiAqICAgICB2YXIgcE1pZCA9IHAxLm1pZHBvaW50VG8ocDIpOyAvLyBwTWlkLnRvU3RyaW5nKCk6IDUwLjUzNjPCsE4sIDAwMS4yNzQ2wrBFXHJcbiAqL1xyXG5MYXRMb24ucHJvdG90eXBlLm1pZHBvaW50VG8gPSBmdW5jdGlvbihwb2ludCkge1xyXG4gICAgLy8gc2VlIGh0dHA6Ly9tYXRoZm9ydW0ub3JnL2xpYnJhcnkvZHJtYXRoL3ZpZXcvNTE4MjIuaHRtbCBmb3IgZGVyaXZhdGlvblxyXG5cclxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgzrsxID0gdGhpcy5sb24udG9SYWRpYW5zKCk7XHJcbiAgICB2YXIgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpO1xyXG4gICAgdmFyIM6UzrsgPSAocG9pbnQubG9uLXRoaXMubG9uKS50b1JhZGlhbnMoKTtcclxuXHJcbiAgICB2YXIgQnggPSBNYXRoLmNvcyjPhjIpICogTWF0aC5jb3MozpTOuyk7XHJcbiAgICB2YXIgQnkgPSBNYXRoLmNvcyjPhjIpICogTWF0aC5zaW4ozpTOuyk7XHJcblxyXG4gICAgdmFyIM+GMyA9IE1hdGguYXRhbjIoTWF0aC5zaW4oz4YxKStNYXRoLnNpbijPhjIpLFxyXG4gICAgICAgICAgICAgTWF0aC5zcXJ0KCAoTWF0aC5jb3Moz4YxKStCeCkqKE1hdGguY29zKM+GMSkrQngpICsgQnkqQnkpICk7XHJcbiAgICB2YXIgzrszID0gzrsxICsgTWF0aC5hdGFuMihCeSwgTWF0aC5jb3Moz4YxKSArIEJ4KTtcclxuICAgIM67MyA9ICjOuzMrMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxyXG5cclxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMy50b0RlZ3JlZXMoKSwgzrszLnRvRGVncmVlcygpKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgZGVzdGluYXRpb24gcG9pbnQgZnJvbSAndGhpcycgcG9pbnQgaGF2aW5nIHRyYXZlbGxlZCB0aGUgZ2l2ZW4gZGlzdGFuY2Ugb24gdGhlXHJcbiAqIGdpdmVuIGluaXRpYWwgYmVhcmluZyAoYmVhcmluZyBub3JtYWxseSB2YXJpZXMgYXJvdW5kIHBhdGggZm9sbG93ZWQpLlxyXG4gKlxyXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nIC0gSW5pdGlhbCBiZWFyaW5nIGluIGRlZ3JlZXMuXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRpc3QgLSBEaXN0YW5jZSBpbiBrbSAob24gc3BoZXJlIG9mICd0aGlzJyByYWRpdXMpLlxyXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBEZXN0aW5hdGlvbiBwb2ludC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuNDc3OCwgLTAuMDAxNSk7XHJcbiAqICAgICB2YXIgcDIgPSBwMS5kZXN0aW5hdGlvblBvaW50KDMwMC43LCA3Ljc5NCk7IC8vIHAyLnRvU3RyaW5nKCk6IDUxLjUxMzXCsE4sIDAwMC4wOTgzwrBXXHJcbiAqL1xyXG5MYXRMb24ucHJvdG90eXBlLmRlc3RpbmF0aW9uUG9pbnQgPSBmdW5jdGlvbihicm5nLCBkaXN0KSB7XHJcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI0xMXHJcblxyXG4gICAgdmFyIM64ID0gTnVtYmVyKGJybmcpLnRvUmFkaWFucygpO1xyXG4gICAgdmFyIM60ID0gTnVtYmVyKGRpc3QpIC8gdGhpcy5yYWRpdXM7IC8vIGFuZ3VsYXIgZGlzdGFuY2UgaW4gcmFkaWFuc1xyXG5cclxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKTtcclxuICAgIHZhciDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcclxuXHJcbiAgICB2YXIgz4YyID0gTWF0aC5hc2luKCBNYXRoLnNpbijPhjEpKk1hdGguY29zKM60KSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM+GMSkqTWF0aC5zaW4ozrQpKk1hdGguY29zKM64KSApO1xyXG4gICAgdmFyIM67MiA9IM67MSArIE1hdGguYXRhbjIoTWF0aC5zaW4ozrgpKk1hdGguc2luKM60KSpNYXRoLmNvcyjPhjEpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM60KS1NYXRoLnNpbijPhjEpKk1hdGguc2luKM+GMikpO1xyXG4gICAgzrsyID0gKM67MiszKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXHJcblxyXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YyLnRvRGVncmVlcygpLCDOuzIudG9EZWdyZWVzKCkpO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBwb2ludCBvZiBpbnRlcnNlY3Rpb24gb2YgdHdvIHBhdGhzIGRlZmluZWQgYnkgcG9pbnQgYW5kIGJlYXJpbmcuXHJcbiAqXHJcbiAqIEBwYXJhbSAgIHtMYXRMb259IHAxIC0gRmlyc3QgcG9pbnQuXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGJybmcxIC0gSW5pdGlhbCBiZWFyaW5nIGZyb20gZmlyc3QgcG9pbnQuXHJcbiAqIEBwYXJhbSAgIHtMYXRMb259IHAyIC0gU2Vjb25kIHBvaW50LlxyXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nMiAtIEluaXRpYWwgYmVhcmluZyBmcm9tIHNlY29uZCBwb2ludC5cclxuICogQHJldHVybnMge0xhdExvbn0gRGVzdGluYXRpb24gcG9pbnQgKG51bGwgaWYgbm8gdW5pcXVlIGludGVyc2VjdGlvbiBkZWZpbmVkKS5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogICAgIHZhciBwMSA9IExhdExvbig1MS44ODUzLCAwLjI1NDUpLCBicm5nMSA9IDEwOC41NDc7XHJcbiAqICAgICB2YXIgcDIgPSBMYXRMb24oNDkuMDAzNCwgMi41NzM1KSwgYnJuZzIgPSAgMzIuNDM1O1xyXG4gKiAgICAgdmFyIHBJbnQgPSBMYXRMb24uaW50ZXJzZWN0aW9uKHAxLCBicm5nMSwgcDIsIGJybmcyKTsgLy8gcEludC50b1N0cmluZygpOiA1MC45MDc2wrBOLCAwMDQuNTA4NMKwRVxyXG4gKi9cclxuTGF0TG9uLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKHAxLCBicm5nMSwgcDIsIGJybmcyKSB7XHJcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI0ludGVyc2VjdGlvblxyXG5cclxuICAgIHZhciDPhjEgPSBwMS5sYXQudG9SYWRpYW5zKCksIM67MSA9IHAxLmxvbi50b1JhZGlhbnMoKTtcclxuICAgIHZhciDPhjIgPSBwMi5sYXQudG9SYWRpYW5zKCksIM67MiA9IHAyLmxvbi50b1JhZGlhbnMoKTtcclxuICAgIHZhciDOuDEzID0gTnVtYmVyKGJybmcxKS50b1JhZGlhbnMoKSwgzrgyMyA9IE51bWJlcihicm5nMikudG9SYWRpYW5zKCk7XHJcbiAgICB2YXIgzpTPhiA9IM+GMi3PhjEsIM6UzrsgPSDOuzItzrsxO1xyXG5cclxuICAgIHZhciDOtDEyID0gMipNYXRoLmFzaW4oIE1hdGguc3FydCggTWF0aC5zaW4ozpTPhi8yKSpNYXRoLnNpbijOlM+GLzIpICtcclxuICAgICAgICBNYXRoLmNvcyjPhjEpKk1hdGguY29zKM+GMikqTWF0aC5zaW4ozpTOuy8yKSpNYXRoLnNpbijOlM67LzIpICkgKTtcclxuICAgIGlmICjOtDEyID09IDApIHJldHVybiBudWxsO1xyXG5cclxuICAgIC8vIGluaXRpYWwvZmluYWwgYmVhcmluZ3MgYmV0d2VlbiBwb2ludHNcclxuICAgIHZhciDOuDEgPSBNYXRoLmFjb3MoICggTWF0aC5zaW4oz4YyKSAtIE1hdGguc2luKM+GMSkqTWF0aC5jb3MozrQxMikgKSAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICggTWF0aC5zaW4ozrQxMikqTWF0aC5jb3Moz4YxKSApICk7XHJcbiAgICBpZiAoaXNOYU4ozrgxKSkgzrgxID0gMDsgLy8gcHJvdGVjdCBhZ2FpbnN0IHJvdW5kaW5nXHJcbiAgICB2YXIgzrgyID0gTWF0aC5hY29zKCAoIE1hdGguc2luKM+GMSkgLSBNYXRoLnNpbijPhjIpKk1hdGguY29zKM60MTIpICkgL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoIE1hdGguc2luKM60MTIpKk1hdGguY29zKM+GMikgKSApO1xyXG5cclxuICAgIHZhciDOuDEyLCDOuDIxO1xyXG4gICAgaWYgKE1hdGguc2luKM67Mi3OuzEpID4gMCkge1xyXG4gICAgICAgIM64MTIgPSDOuDE7XHJcbiAgICAgICAgzrgyMSA9IDIqTWF0aC5QSSAtIM64MjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgzrgxMiA9IDIqTWF0aC5QSSAtIM64MTtcclxuICAgICAgICDOuDIxID0gzrgyO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciDOsTEgPSAozrgxMyAtIM64MTIgKyBNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gYW5nbGUgMi0xLTNcclxuICAgIHZhciDOsTIgPSAozrgyMSAtIM64MjMgKyBNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gYW5nbGUgMS0yLTNcclxuXHJcbiAgICBpZiAoTWF0aC5zaW4ozrExKT09MCAmJiBNYXRoLnNpbijOsTIpPT0wKSByZXR1cm4gbnVsbDsgLy8gaW5maW5pdGUgaW50ZXJzZWN0aW9uc1xyXG4gICAgaWYgKE1hdGguc2luKM6xMSkqTWF0aC5zaW4ozrEyKSA8IDApIHJldHVybiBudWxsOyAgICAgIC8vIGFtYmlndW91cyBpbnRlcnNlY3Rpb25cclxuXHJcbiAgICAvL86xMSA9IE1hdGguYWJzKM6xMSk7XHJcbiAgICAvL86xMiA9IE1hdGguYWJzKM6xMik7XHJcbiAgICAvLyAuLi4gRWQgV2lsbGlhbXMgdGFrZXMgYWJzIG9mIM6xMS/OsTIsIGJ1dCBzZWVtcyB0byBicmVhayBjYWxjdWxhdGlvbj9cclxuXHJcbiAgICB2YXIgzrEzID0gTWF0aC5hY29zKCAtTWF0aC5jb3MozrExKSpNYXRoLmNvcyjOsTIpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguc2luKM6xMSkqTWF0aC5zaW4ozrEyKSpNYXRoLmNvcyjOtDEyKSApO1xyXG4gICAgdmFyIM60MTMgPSBNYXRoLmF0YW4yKCBNYXRoLnNpbijOtDEyKSpNYXRoLnNpbijOsTEpKk1hdGguc2luKM6xMiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MozrEyKStNYXRoLmNvcyjOsTEpKk1hdGguY29zKM6xMykgKTtcclxuICAgIHZhciDPhjMgPSBNYXRoLmFzaW4oIE1hdGguc2luKM+GMSkqTWF0aC5jb3MozrQxMykgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjPhjEpKk1hdGguc2luKM60MTMpKk1hdGguY29zKM64MTMpICk7XHJcbiAgICB2YXIgzpTOuzEzID0gTWF0aC5hdGFuMiggTWF0aC5zaW4ozrgxMykqTWF0aC5zaW4ozrQxMykqTWF0aC5jb3Moz4YxKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MozrQxMyktTWF0aC5zaW4oz4YxKSpNYXRoLnNpbijPhjMpICk7XHJcbiAgICB2YXIgzrszID0gzrsxICsgzpTOuzEzO1xyXG4gICAgzrszID0gKM67MyszKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXHJcblxyXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YzLnRvRGVncmVlcygpLCDOuzMudG9EZWdyZWVzKCkpO1xyXG59O1xyXG5cclxuXHJcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSB0cmF2ZWxsaW5nIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50IGFsb25nIGEgcmh1bWIgbGluZS5cclxuICpcclxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IERpc3RhbmNlIGluIGttIGJldHdlZW4gdGhpcyBwb2ludCBhbmQgZGVzdGluYXRpb24gcG9pbnQgKG9uIHNwaGVyZSBvZiAndGhpcycgcmFkaXVzKS5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCksIHAyID0gbmV3IExhdExvbig1MC45NjQsIDEuODUzKTtcclxuICogICAgIHZhciBkID0gcDEuZGlzdGFuY2VUbyhwMik7IC8vIGQudG9QcmVjaXNpb24oNCk6IDQwLjMxXHJcbiAqL1xyXG5MYXRMb24ucHJvdG90eXBlLnJodW1iRGlzdGFuY2VUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XHJcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI1JodW1iXHJcblxyXG4gICAgdmFyIFIgPSB0aGlzLnJhZGl1cztcclxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpO1xyXG4gICAgdmFyIM6Uz4YgPSDPhjIgLSDPhjE7XHJcbiAgICB2YXIgzpTOuyA9IE1hdGguYWJzKHBvaW50Lmxvbi10aGlzLmxvbikudG9SYWRpYW5zKCk7XHJcbiAgICAvLyBpZiBkTG9uIG92ZXIgMTgwwrAgdGFrZSBzaG9ydGVyIHJodW1iIGxpbmUgYWNyb3NzIHRoZSBhbnRpLW1lcmlkaWFuOlxyXG4gICAgaWYgKE1hdGguYWJzKM6UzrspID4gTWF0aC5QSSkgzpTOuyA9IM6Uzrs+MCA/IC0oMipNYXRoLlBJLc6UzrspIDogKDIqTWF0aC5QSSvOlM67KTtcclxuXHJcbiAgICAvLyBvbiBNZXJjYXRvciBwcm9qZWN0aW9uLCBsb25naXR1ZGUgZGlzdGFuY2VzIHNocmluayBieSBsYXRpdHVkZTsgcSBpcyB0aGUgJ3N0cmV0Y2ggZmFjdG9yJ1xyXG4gICAgLy8gcSBiZWNvbWVzIGlsbC1jb25kaXRpb25lZCBhbG9uZyBFLVcgbGluZSAoMC8wKTsgdXNlIGVtcGlyaWNhbCB0b2xlcmFuY2UgdG8gYXZvaWQgaXRcclxuICAgIHZhciDOlM+IID0gTWF0aC5sb2coTWF0aC50YW4oz4YyLzIrTWF0aC5QSS80KS9NYXRoLnRhbijPhjEvMitNYXRoLlBJLzQpKTtcclxuICAgIHZhciBxID0gTWF0aC5hYnMozpTPiCkgPiAxMGUtMTIgPyDOlM+GL86Uz4ggOiBNYXRoLmNvcyjPhjEpO1xyXG5cclxuICAgIC8vIGRpc3RhbmNlIGlzIHB5dGhhZ29yYXMgb24gJ3N0cmV0Y2hlZCcgTWVyY2F0b3IgcHJvamVjdGlvblxyXG4gICAgdmFyIM60ID0gTWF0aC5zcXJ0KM6Uz4YqzpTPhiArIHEqcSrOlM67Ks6UzrspOyAvLyBhbmd1bGFyIGRpc3RhbmNlIGluIHJhZGlhbnNcclxuICAgIHZhciBkaXN0ID0gzrQgKiBSO1xyXG5cclxuICAgIHJldHVybiBkaXN0O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBiZWFyaW5nIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50IGFsb25nIGEgcmh1bWIgbGluZS5cclxuICpcclxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IEJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS4xMjcsIDEuMzM4KSwgcDIgPSBuZXcgTGF0TG9uKDUwLjk2NCwgMS44NTMpO1xyXG4gKiAgICAgdmFyIGQgPSBwMS5yaHVtYkJlYXJpbmdUbyhwMik7IC8vIGQudG9GaXhlZCgxKTogMTE2LjdcclxuICovXHJcbkxhdExvbi5wcm90b3R5cGUucmh1bWJCZWFyaW5nVG8gPSBmdW5jdGlvbihwb2ludCkge1xyXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XHJcbiAgICB2YXIgzpTOuyA9IChwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xyXG4gICAgLy8gaWYgZExvbiBvdmVyIDE4MMKwIHRha2Ugc2hvcnRlciByaHVtYiBsaW5lIGFjcm9zcyB0aGUgYW50aS1tZXJpZGlhbjpcclxuICAgIGlmIChNYXRoLmFicyjOlM67KSA+IE1hdGguUEkpIM6UzrsgPSDOlM67PjAgPyAtKDIqTWF0aC5QSS3OlM67KSA6ICgyKk1hdGguUEkrzpTOuyk7XHJcblxyXG4gICAgdmFyIM6Uz4ggPSBNYXRoLmxvZyhNYXRoLnRhbijPhjIvMitNYXRoLlBJLzQpL01hdGgudGFuKM+GMS8yK01hdGguUEkvNCkpO1xyXG5cclxuICAgIHZhciDOuCA9IE1hdGguYXRhbjIozpTOuywgzpTPiCk7XHJcblxyXG4gICAgcmV0dXJuICjOuC50b0RlZ3JlZXMoKSszNjApICUgMzYwO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBkZXN0aW5hdGlvbiBwb2ludCBoYXZpbmcgdHJhdmVsbGVkIGFsb25nIGEgcmh1bWIgbGluZSBmcm9tICd0aGlzJyBwb2ludCB0aGUgZ2l2ZW5cclxuICogZGlzdGFuY2Ugb24gdGhlICBnaXZlbiBiZWFyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nIC0gQmVhcmluZyBpbiBkZWdyZWVzIGZyb20gbm9ydGguXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRpc3QgLSBEaXN0YW5jZSBpbiBrbSAob24gc3BoZXJlIG9mICd0aGlzJyByYWRpdXMpLlxyXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBEZXN0aW5hdGlvbiBwb2ludC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCk7XHJcbiAqICAgICB2YXIgcDIgPSBwMS5yaHVtYkRlc3RpbmF0aW9uUG9pbnQoMTE2LjcsIDQwLjMxKTsgLy8gcDIudG9TdHJpbmcoKTogNTAuOTY0McKwTiwgMDAxLjg1MzHCsEVcclxuICovXHJcbkxhdExvbi5wcm90b3R5cGUucmh1bWJEZXN0aW5hdGlvblBvaW50ID0gZnVuY3Rpb24oYnJuZywgZGlzdCkge1xyXG4gICAgdmFyIM60ID0gTnVtYmVyKGRpc3QpIC8gdGhpcy5yYWRpdXM7IC8vIGFuZ3VsYXIgZGlzdGFuY2UgaW4gcmFkaWFuc1xyXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcclxuICAgIHZhciDOuCA9IE51bWJlcihicm5nKS50b1JhZGlhbnMoKTtcclxuXHJcbiAgICB2YXIgzpTPhiA9IM60ICogTWF0aC5jb3MozrgpO1xyXG5cclxuICAgIHZhciDPhjIgPSDPhjEgKyDOlM+GO1xyXG4gICAgLy8gY2hlY2sgZm9yIHNvbWUgZGFmdCBidWdnZXIgZ29pbmcgcGFzdCB0aGUgcG9sZSwgbm9ybWFsaXNlIGxhdGl0dWRlIGlmIHNvXHJcbiAgICBpZiAoTWF0aC5hYnMoz4YyKSA+IE1hdGguUEkvMikgz4YyID0gz4YyPjAgPyBNYXRoLlBJLc+GMiA6IC1NYXRoLlBJLc+GMjtcclxuXHJcbiAgICB2YXIgzpTPiCA9IE1hdGgubG9nKE1hdGgudGFuKM+GMi8yK01hdGguUEkvNCkvTWF0aC50YW4oz4YxLzIrTWF0aC5QSS80KSk7XHJcbiAgICB2YXIgcSA9IE1hdGguYWJzKM6Uz4gpID4gMTBlLTEyID8gzpTPhiAvIM6Uz4ggOiBNYXRoLmNvcyjPhjEpOyAvLyBFLVcgY291cnNlIGJlY29tZXMgaWxsLWNvbmRpdGlvbmVkIHdpdGggMC8wXHJcblxyXG4gICAgdmFyIM6UzrsgPSDOtCpNYXRoLnNpbijOuCkvcTtcclxuXHJcbiAgICB2YXIgzrsyID0gzrsxICsgzpTOuztcclxuXHJcbiAgICDOuzIgPSAozrsyICsgMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxyXG5cclxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMi50b0RlZ3JlZXMoKSwgzrsyLnRvRGVncmVlcygpKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbG94b2Ryb21pYyBtaWRwb2ludCAoYWxvbmcgYSByaHVtYiBsaW5lKSBiZXR3ZWVuICd0aGlzJyBwb2ludCBhbmQgc2Vjb25kIHBvaW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBzZWNvbmQgcG9pbnQuXHJcbiAqIEByZXR1cm5zIHtMYXRMb259IE1pZHBvaW50IGJldHdlZW4gdGhpcyBwb2ludCBhbmQgc2Vjb25kIHBvaW50LlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS4xMjcsIDEuMzM4KSwgcDIgPSBuZXcgTGF0TG9uKDUwLjk2NCwgMS44NTMpO1xyXG4gKiAgICAgdmFyIHAyID0gcDEucmh1bWJNaWRwb2ludFRvKHAyKTsgLy8gcDIudG9TdHJpbmcoKTogNTEuMDQ1NcKwTiwgMDAxLjU5NTfCsEVcclxuICovXHJcbkxhdExvbi5wcm90b3R5cGUucmh1bWJNaWRwb2ludFRvID0gZnVuY3Rpb24ocG9pbnQpIHtcclxuICAgIC8vIGh0dHA6Ly9tYXRoZm9ydW0ub3JnL2tiL21lc3NhZ2UuanNwYT9tZXNzYWdlSUQ9MTQ4ODM3XHJcblxyXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcclxuICAgIHZhciDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCksIM67MiA9IHBvaW50Lmxvbi50b1JhZGlhbnMoKTtcclxuXHJcbiAgICBpZiAoTWF0aC5hYnMozrsyLc67MSkgPiBNYXRoLlBJKSDOuzEgKz0gMipNYXRoLlBJOyAvLyBjcm9zc2luZyBhbnRpLW1lcmlkaWFuXHJcblxyXG4gICAgdmFyIM+GMyA9ICjPhjErz4YyKS8yO1xyXG4gICAgdmFyIGYxID0gTWF0aC50YW4oTWF0aC5QSS80ICsgz4YxLzIpO1xyXG4gICAgdmFyIGYyID0gTWF0aC50YW4oTWF0aC5QSS80ICsgz4YyLzIpO1xyXG4gICAgdmFyIGYzID0gTWF0aC50YW4oTWF0aC5QSS80ICsgz4YzLzIpO1xyXG4gICAgdmFyIM67MyA9ICggKM67Mi3OuzEpKk1hdGgubG9nKGYzKSArIM67MSpNYXRoLmxvZyhmMikgLSDOuzIqTWF0aC5sb2coZjEpICkgLyBNYXRoLmxvZyhmMi9mMSk7XHJcblxyXG4gICAgaWYgKCFpc0Zpbml0ZSjOuzMpKSDOuzMgPSAozrsxK867MikvMjsgLy8gcGFyYWxsZWwgb2YgbGF0aXR1ZGVcclxuXHJcbiAgICDOuzMgPSAozrszICsgMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxyXG5cclxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMy50b0RlZ3JlZXMoKSwgzrszLnRvRGVncmVlcygpKTtcclxufTtcclxuXHJcblxyXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXHJcblxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgJ3RoaXMnIHBvaW50LCBmb3JtYXR0ZWQgYXMgZGVncmVlcywgZGVncmVlcyttaW51dGVzLCBvclxyXG4gKiBkZWdyZWVzK21pbnV0ZXMrc2Vjb25kcy5cclxuICpcclxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gRm9ybWF0IHBvaW50IGFzICdkJywgJ2RtJywgJ2RtcycuXHJcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIC0gZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBDb21tYS1zZXBhcmF0ZWQgbGF0aXR1ZGUvbG9uZ2l0dWRlLlxyXG4gKi9cclxuTGF0TG9uLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKGZvcm1hdCwgZHApIHtcclxuICAgIGlmICh0eXBlb2YgZm9ybWF0ID09ICd1bmRlZmluZWQnKSBmb3JtYXQgPSAnZG1zJztcclxuXHJcbiAgICByZXR1cm4gR2VvLnRvTGF0KHRoaXMubGF0LCBmb3JtYXQsIGRwKSArICcsICcgKyBHZW8udG9Mb24odGhpcy5sb24sIGZvcm1hdCwgZHApO1xyXG59O1xyXG5cclxuXHJcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cclxuXHJcblxyXG4vKiogRXh0ZW5kIE51bWJlciBvYmplY3Qgd2l0aCBtZXRob2QgdG8gY29udmVydCBudW1lcmljIGRlZ3JlZXMgdG8gcmFkaWFucyAqL1xyXG5pZiAodHlwZW9mIE51bWJlci5wcm90b3R5cGUudG9SYWRpYW5zID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBOdW1iZXIucHJvdG90eXBlLnRvUmFkaWFucyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyAqIE1hdGguUEkgLyAxODA7IH07XHJcbn1cclxuXHJcblxyXG4vKiogRXh0ZW5kIE51bWJlciBvYmplY3Qgd2l0aCBtZXRob2QgdG8gY29udmVydCByYWRpYW5zIHRvIG51bWVyaWMgKHNpZ25lZCkgZGVncmVlcyAqL1xyXG5pZiAodHlwZW9mIE51bWJlci5wcm90b3R5cGUudG9EZWdyZWVzID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBOdW1iZXIucHJvdG90eXBlLnRvRGVncmVlcyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcyAqIDE4MCAvIE1hdGguUEk7IH07XHJcbn1cclxuXHJcblxyXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXHJcbmlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IExhdExvbjsgLy8gQ29tbW9uSlNcclxuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoWydHZW8nXSwgZnVuY3Rpb24oKSB7IHJldHVybiBMYXRMb247IH0pOyAvLyBBTURcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxyXG4gKiBRdWFkVHJlZSBJbXBsZW1lbnRhdGlvbiBpbiBKYXZhU2NyaXB0XHJcbiAqIEBhdXRob3I6IHNpbGZsb3cgPGh0dHBzOi8vZ2l0aHViLmNvbS9zaWxmbG93PlxyXG4gKlxyXG4gKiBVc2FnZTpcclxuICogVG8gY3JlYXRlIGEgbmV3IGVtcHR5IFF1YWR0cmVlLCBkbyB0aGlzOlxyXG4gKiB2YXIgdHJlZSA9IFFVQUQuaW5pdChhcmdzKVxyXG4gKlxyXG4gKiBhcmdzID0ge1xyXG4gKiAgICAvLyBtYW5kYXRvcnkgZmllbGRzXHJcbiAqICAgIHggOiB4IGNvb3JkaW5hdGVcclxuICogICAgeSA6IHkgY29vcmRpbmF0ZVxyXG4gKiAgICB3IDogd2lkdGhcclxuICogICAgaCA6IGhlaWdodFxyXG4gKlxyXG4gKiAgICAvLyBvcHRpb25hbCBmaWVsZHNcclxuICogICAgbWF4Q2hpbGRyZW4gOiBtYXggY2hpbGRyZW4gcGVyIG5vZGVcclxuICogICAgbWF4RGVwdGggOiBtYXggZGVwdGggb2YgdGhlIHRyZWVcclxuICp9XHJcbiAqXHJcbiAqIEFQSTpcclxuICogdHJlZS5pbnNlcnQoKSBhY2NlcHRzIGFycmF5cyBvciBzaW5nbGUgaXRlbXNcclxuICogZXZlcnkgaXRlbSBtdXN0IGhhdmUgYSAueCwgLnksIC53LCBhbmQgLmggcHJvcGVydHkuIGlmIHRoZXkgZG9uJ3QsIHRoZSB0cmVlIHdpbGwgYnJlYWsuXHJcbiAqXHJcbiAqIHRyZWUucmV0cmlldmUoc2VsZWN0b3IsIGNhbGxiYWNrKSBjYWxscyB0aGUgY2FsbGJhY2sgZm9yIGFsbCBvYmplY3RzIHRoYXQgYXJlIGluXHJcbiAqIHRoZSBzYW1lIHJlZ2lvbiBvciBvdmVybGFwcGluZy5cclxuICpcclxuICogdHJlZS5jbGVhcigpIHJlbW92ZXMgYWxsIGl0ZW1zIGZyb20gdGhlIHF1YWR0cmVlLlxyXG4gKi9cclxuXHJcbnZhciBRVUFEID0ge307IC8vIGdsb2JhbCB2YXIgZm9yIHRoZSBxdWFkdHJlZVxyXG5cclxuUVVBRC5pbml0ID0gZnVuY3Rpb24gKGFyZ3MpIHtcclxuXHJcbiAgICB2YXIgbm9kZTtcclxuICAgIHZhciBUT1BfTEVGVCAgICAgPSAwO1xyXG4gICAgdmFyIFRPUF9SSUdIVCAgICA9IDE7XHJcbiAgICB2YXIgQk9UVE9NX0xFRlQgID0gMjtcclxuICAgIHZhciBCT1RUT01fUklHSFQgPSAzO1xyXG4gICAgdmFyIFBBUkVOVCAgICAgICA9IDQ7XHJcblxyXG4gICAgLy8gYXNzaWduIGRlZmF1bHQgdmFsdWVzXHJcbiAgICBhcmdzLm1heENoaWxkcmVuID0gYXJncy5tYXhDaGlsZHJlbiB8fCAyO1xyXG4gICAgYXJncy5tYXhEZXB0aCA9IGFyZ3MubWF4RGVwdGggfHwgNDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE5vZGUgY3JlYXRvci4gWW91IHNob3VsZCBuZXZlciBjcmVhdGUgYSBub2RlIG1hbnVhbGx5LiB0aGUgYWxnb3JpdGhtIHRha2VzXHJcbiAgICAgKiBjYXJlIG9mIHRoYXQgZm9yIHlvdS5cclxuICAgICAqL1xyXG4gICAgbm9kZSA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCBkZXB0aCwgbWF4Q2hpbGRyZW4sIG1heERlcHRoKSB7XHJcblxyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdLCAvLyBob2xkcyBhbGwgaXRlbXNcclxuICAgICAgICAgICAgbm9kZXMgPSBbXTsgLy8gaG9sZHMgYWxsIGNoaWxkIG5vZGVzXHJcblxyXG4gICAgICAgIC8vIHJldHVybnMgYSBmcmVzaCBub2RlIG9iamVjdFxyXG4gICAgICAgIHJldHVybiB7XHJcblxyXG4gICAgICAgICAgICB4IDogeCwgLy8gdG9wIGxlZnQgcG9pbnRcclxuICAgICAgICAgICAgeSA6IHksIC8vIHRvcCByaWdodCBwb2ludFxyXG4gICAgICAgICAgICB3IDogdywgLy8gd2lkdGhcclxuICAgICAgICAgICAgaCA6IGgsIC8vIGhlaWdodFxyXG4gICAgICAgICAgICBkZXB0aCA6IGRlcHRoLCAvLyBkZXB0aCBsZXZlbCBvZiB0aGUgbm9kZVxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIGl0ZXJhdGVzIGFsbCBpdGVtcyB0aGF0IG1hdGNoIHRoZSBzZWxlY3RvciBhbmQgaW52b2tlcyB0aGUgc3VwcGxpZWQgY2FsbGJhY2sgb24gdGhlbS5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHJldHJpZXZlOiBmdW5jdGlvbihpdGVtLCBjYWxsYmFjaywgaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgIChpbnN0YW5jZSkgPyBjYWxsYmFjay5jYWxsKGluc3RhbmNlLCBpdGVtc1tpXSkgOiBjYWxsYmFjayhpdGVtc1tpXSk7IFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgbm9kZSBoYXMgc3Vibm9kZXNcclxuICAgICAgICAgICAgICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIHJldHJpZXZlIG9uIGFsbCBtYXRjaGluZyBzdWJub2Rlc1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmluZE92ZXJsYXBwaW5nTm9kZXMoaXRlbSwgZnVuY3Rpb24oZGlyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzW2Rpcl0ucmV0cmlldmUoaXRlbSwgY2FsbGJhY2ssIGluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBBZGRzIGEgbmV3IEl0ZW0gdG8gdGhlIG5vZGUuXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIElmIHRoZSBub2RlIGFscmVhZHkgaGFzIHN1Ym5vZGVzLCB0aGUgaXRlbSBnZXRzIHB1c2hlZCBkb3duIG9uZSBsZXZlbC5cclxuICAgICAgICAgICAgICogSWYgdGhlIGl0ZW0gZG9lcyBub3QgZml0IGludG8gdGhlIHN1Ym5vZGVzLCBpdCBnZXRzIHNhdmVkIGluIHRoZVxyXG4gICAgICAgICAgICAgKiBcImNoaWxkcmVuXCItYXJyYXkuXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIElmIHRoZSBtYXhDaGlsZHJlbiBsaW1pdCBpcyBleGNlZWRlZCBhZnRlciBpbnNlcnRpbmcgdGhlIGl0ZW0sXHJcbiAgICAgICAgICAgICAqIHRoZSBub2RlIGdldHMgZGl2aWRlZCBhbmQgYWxsIGl0ZW1zIGluc2lkZSB0aGUgXCJjaGlsZHJlblwiLWFycmF5IGdldFxyXG4gICAgICAgICAgICAgKiBwdXNoZWQgZG93biB0byB0aGUgbmV3IHN1Ym5vZGVzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgaW5zZXJ0IDogZnVuY3Rpb24gKGl0ZW0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBub2RlIGluIHdoaWNoIHRoZSBpdGVtIGZpdHMgYmVzdFxyXG4gICAgICAgICAgICAgICAgICAgIGkgPSB0aGlzLmZpbmRJbnNlcnROb2RlKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBQQVJFTlQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIGl0ZW0gZG9lcyBub3QgZml0LCBwdXNoIGl0IGludG8gdGhlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoaWxkcmVuIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0uaW5zZXJ0KGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAvL2RpdmlkZSB0aGUgbm9kZSBpZiBtYXhDaGlsZHJlbiBpcyBleGNlZWRlZCBhbmQgbWF4RGVwdGggaXMgbm90IHJlYWNoZWRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbXMubGVuZ3RoID4gbWF4Q2hpbGRyZW4gJiYgdGhpcy5kZXB0aCA8IG1heERlcHRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGl2aWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEZpbmQgYSBub2RlIHRoZSBpdGVtIHNob3VsZCBiZSBpbnNlcnRlZCBpbi5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZpbmRJbnNlcnROb2RlIDogZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnggKyBpdGVtLncgPCB4ICsgKHcgLyAyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgKyBpdGVtLmggPCB5ICsgKGggLyAyKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gVE9QX0xFRlQ7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSA+PSB5ICsgKGggLyAyKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gQk9UVE9NX0xFRlQ7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFBBUkVOVDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ueCA+PSB4ICsgKHcgLyAyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgKyBpdGVtLmggPCB5ICsgKGggLyAyKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gVE9QX1JJR0hUO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgPj0geSArIChoIC8gMikpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIEJPVFRPTV9SSUdIVDtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUEFSRU5UO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBQQVJFTlQ7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogRmluZHMgdGhlIHJlZ2lvbnMgdGhlIGl0ZW0gb3ZlcmxhcHMgd2l0aC4gU2VlIGNvbnN0YW50cyBkZWZpbmVkXHJcbiAgICAgICAgICAgICAqIGFib3ZlLiBUaGUgY2FsbGJhY2sgaXMgY2FsbGVkIGZvciBldmVyeSByZWdpb24gdGhlIGl0ZW0gb3ZlcmxhcHMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBmaW5kT3ZlcmxhcHBpbmdOb2RlcyA6IGZ1bmN0aW9uIChpdGVtLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ueCA8IHggKyAodyAvIDIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSA8IHkgKyAoaCAvIDIpKSB7XHJcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFRPUF9MRUZUKTtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55ICsgaXRlbS5oID49IHkgKyBoIC8gMikge1xyXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhCT1RUT01fTEVGVCk7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ueCArIGl0ZW0udyA+PSB4ICsgKHcgLyAyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgPCB5ICsgKGggLyAyKSkge1xyXG5cdFx0XHRcdFx0XHRjYWxsYmFjayhUT1BfUklHSFQpO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgKyBpdGVtLmggPj0geSArIGggLyAyKSB7XHJcblx0XHRcdFx0XHRcdGNhbGxiYWNrKEJPVFRPTV9SSUdIVCk7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogRGl2aWRlcyB0aGUgY3VycmVudCBub2RlIGludG8gZm91ciBzdWJub2RlcyBhbmQgYWRkcyB0aGVtXHJcbiAgICAgICAgICAgICAqIHRvIHRoZSBub2RlcyBhcnJheSBvZiB0aGUgY3VycmVudCBub2RlLiBUaGVuIHJlaW5zZXJ0cyBhbGxcclxuICAgICAgICAgICAgICogY2hpbGRyZW4uXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBkaXZpZGUgOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd2lkdGgsIGhlaWdodCwgaSwgb2xkQ2hpbGRyZW47XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW5EZXB0aCA9IHRoaXMuZGVwdGggKyAxO1xyXG4gICAgICAgICAgICAgICAgLy8gc2V0IGRpbWVuc2lvbnMgb2YgdGhlIG5ldyBub2Rlc1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSAodyAvIDIpO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gKGggLyAyKTtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0b3AgbGVmdCBub2RlXHJcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUodGhpcy54LCB0aGlzLnksIHdpZHRoLCBoZWlnaHQsIGNoaWxkcmVuRGVwdGgsIG1heENoaWxkcmVuLCBtYXhEZXB0aCkpO1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRvcCByaWdodCBub2RlXHJcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUodGhpcy54ICsgd2lkdGgsIHRoaXMueSwgd2lkdGgsIGhlaWdodCwgY2hpbGRyZW5EZXB0aCwgbWF4Q2hpbGRyZW4sIG1heERlcHRoKSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYm90dG9tIGxlZnQgbm9kZVxyXG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKHRoaXMueCwgdGhpcy55ICsgaGVpZ2h0LCB3aWR0aCwgaGVpZ2h0LCBjaGlsZHJlbkRlcHRoLCBtYXhDaGlsZHJlbiwgbWF4RGVwdGgpKTtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBib3R0b20gcmlnaHQgbm9kZVxyXG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKHRoaXMueCArIHdpZHRoLCB0aGlzLnkgKyBoZWlnaHQsIHdpZHRoLCBoZWlnaHQsIGNoaWxkcmVuRGVwdGgsIG1heENoaWxkcmVuLCBtYXhEZXB0aCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIG9sZENoaWxkcmVuID0gaXRlbXM7XHJcbiAgICAgICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG9sZENoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnQob2xkQ2hpbGRyZW5baV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIENsZWFycyB0aGUgbm9kZSBhbmQgYWxsIGl0cyBzdWJub2Rlcy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGNsZWFyIDogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHZhciBpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRub2Rlc1tpXS5jbGVhcigpO1xyXG5cdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgIGl0ZW1zLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICBub2Rlcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogY29udmVuaWVuY2UgbWV0aG9kOiBpcyBub3QgdXNlZCBpbiB0aGUgY29yZSBhbGdvcml0aG0uXHJcbiAgICAgICAgICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICAgICAgKiByZXR1cm5zIHRoaXMgbm9kZXMgc3Vibm9kZXMuIHRoaXMgaXMgdXNmdWwgaWYgd2Ugd2FudCB0byBkbyBzdHVmZlxyXG4gICAgICAgICAgICAgKiB3aXRoIHRoZSBub2RlcywgaS5lLiBhY2Nlc3NpbmcgdGhlIGJvdW5kcyBvZiB0aGUgbm9kZXMgdG8gZHJhdyB0aGVtXHJcbiAgICAgICAgICAgICAqIG9uIGEgY2FudmFzIGZvciBkZWJ1Z2dpbmcgZXRjLi4uXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBnZXROb2RlcyA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBub2Rlcy5sZW5ndGggPyBub2RlcyA6IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgcm9vdCA6IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBub2RlKGFyZ3MueCwgYXJncy55LCBhcmdzLncsIGFyZ3MuaCwgMCwgYXJncy5tYXhDaGlsZHJlbiwgYXJncy5tYXhEZXB0aCk7XHJcbiAgICAgICAgfSgpKSxcclxuXHJcbiAgICAgICAgaW5zZXJ0IDogZnVuY3Rpb24gKGl0ZW0pIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBsZW4sIGk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICBsZW4gPSBpdGVtLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9vdC5pbnNlcnQoaXRlbVtpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290Lmluc2VydChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIHJldHJpZXZlIDogZnVuY3Rpb24gKHNlbGVjdG9yLCBjYWxsYmFjaywgaW5zdGFuY2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vdC5yZXRyaWV2ZShzZWxlY3RvciwgY2FsbGJhY2ssIGluc3RhbmNlKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjbGVhciA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5yb290LmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUVVBRDsiLCJcInVzZSBzdHJpY3RcIjtcblxyXG4vL05pY2VyIHdyYXBwZXIgb2Ygc2t5cGlja2VyJ3MgdHJhbnNsYXRlXHJcblxyXG52YXIgdHJhbnNsYXRlID0gZnVuY3Rpb24gKGtleSx2YWx1ZXMsZGVmYXVsdFNob3cpIHtcclxuICB2YXIgdHJhbnNsYXRlZDtcclxuICAvLyBwcmV2ZW50IHRocm93aW5nIGV4Y2VwdGlvbiBvbiB3cm9uZyBzcHJpbnRmIGZvcm1hdFxyXG4gIHRyeSB7XHJcbiAgICB0cmFuc2xhdGVkID0gJC50KGtleSwgdmFsdWVzKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0cmFuc2xhdGVkID0gZGVmYXVsdFNob3c7XHJcbiAgfVxyXG4gIGlmICghdHJhbnNsYXRlZCkge1xyXG4gICAgY29uc29sZS5lcnJvcihcInRyYW5zbGF0aW9uIGlzIG1pc3NpbmdcIik7XHJcbiAgICByZXR1cm4gZGVmYXVsdFNob3c7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHJhbnNsYXRlZFxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0cmFuc2xhdGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXHJcbi8qIGFkYXB0ZXIgdG8gdHJhbnNsYXRlIGJ5IG9uZSBvZiBjaG9zZW4gc3RyYXRlZ3kgKi9cclxuXHJcblxyXG5cclxuLyoqIERlcHJlY2F0ZWQgLSAgZG9uJ3QgdXNlICovXHJcblxyXG5cclxuXHJcbnZhciBzZXR1cERvYyA9IHtcclxuICBcImdldFRyYW5zbGF0aW9uc1wiOiBcInRvIGdldCB0ZXh0IHdoaWNoIGFyZSBub3QgdHJhbnNsYXRlZCBvbiBjdXJyZW50IHBhZ2UsIHRha2UgY29uc29sZS5sb2cod2luZG93LnRvVHJhbnNsYXRlKVwiLFxyXG4gIFwic2V0dXBTdHJhdGVneVwiOiBcIml0IGlzIG5lY2Vzc2FyeSBzZXQgc3RyYXRlZ3kgaW4gcm9vdCBvZiBidW5kbGVcIlxyXG59O1xyXG5cclxudmFyIHN0cmF0ZWd5ID0gbnVsbDtcclxuXHJcblxyXG5cclxudmFyIHRyID0gZnVuY3Rpb24gKG9yaWdpbmFsLCBrZXksIHZhbHVlcywgbmFtZXNwYWNlKSB7XHJcbiAgaWYgKCFzdHJhdGVneSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlRyYW5zbGF0aW9uIHN0cmF0ZWd5IGlzIG5vdCBzZXRcXG4gXCIrc2V0dXBEb2NbXCJzZXR1cFN0cmF0ZWd5XCJdKTtcclxuICAgIHJldHVybiBvcmlnaW5hbDtcclxuICB9XHJcbiAgcmV0dXJuIHN0cmF0ZWd5KG9yaWdpbmFsLCBrZXksIHZhbHVlcywgbmFtZXNwYWNlKTtcclxufTtcclxuXHJcbnRyLnNldFN0cmF0ZWd5ID0gZnVuY3Rpb24gKG5ld1N0cmF0ZWd5KSB7XHJcbiAgc3RyYXRlZ3kgPSBuZXdTdHJhdGVneTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gdHI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuXHJcblxyXG5cclxuLyoqIERlcHJlY2F0ZWQgLSAgZG9uJ3QgdXNlICovXHJcblxyXG5cclxuXHJcbnZhciB0ciA9IGZ1bmN0aW9uIChvcmlnaW5hbCxrZXksdmFsdWVzKSB7XHJcbiAgaWYgKCFrZXkpIHtcclxuICAgIGtleSA9IG9yaWdpbmFsLnRvTG93ZXJDYXNlKCkudHJpbSgpLnJlcGxhY2UoXCIgXCIsIFwiX1wiKTtcclxuICB9XHJcbiAgdmFyIHRyYW5zbGF0ZWQ7XHJcbiAgLy8gcHJldmVudCB0aHJvd2luZyBleGNlcHRpb24gb24gd3Jvbmcgc3ByaW50ZiBmb3JtYXRcclxuICB0cnkge1xyXG4gICAgdHJhbnNsYXRlZCA9ICQudCgnZm9ybV9zZWFyY2guJytrZXksIHtwb3N0UHJvY2VzczogJ3NwcmludGYnLCBzcHJpbnRmOiB2YWx1ZXN9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICB0cmFuc2xhdGVkID0gb3JpZ2luYWw7XHJcbiAgfVxyXG4gIC8vTm90IG5pY2UsIFRPRE8gbWFrZSBzb21lIGJldHRlciBzb2x1dGlvbiBob3cgdG8gcGljayBwcmVmaXggYW5kIGZhbGxiYWNrIHRvIGNvbW1vblxyXG4gIGlmICh0cmFuc2xhdGVkID09ICdmb3JtX3NlYXJjaC4nK2tleSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdHJhbnNsYXRlZCA9ICQudCgnY29tbW9uLicra2V5LCB7cG9zdFByb2Nlc3M6ICdzcHJpbnRmJywgc3ByaW50ZjogdmFsdWVzfSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHRyYW5zbGF0ZWQgPSBvcmlnaW5hbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0cmFuc2xhdGVkXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHRyO1xyXG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlICh0YXJnZXQsIHNyYykge1xuICAgIHZhciBhcnJheSA9IEFycmF5LmlzQXJyYXkoc3JjKVxuICAgIHZhciBkc3QgPSBhcnJheSAmJiBbXSB8fCB7fVxuXG4gICAgaWYgKGFycmF5KSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCBbXVxuICAgICAgICBkc3QgPSBkc3QuY29uY2F0KHRhcmdldClcbiAgICAgICAgc3JjLmZvckVhY2goZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbaV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZHN0W2ldID0gZVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBkc3RbaV0gPSBtZXJnZSh0YXJnZXRbaV0sIGUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZihlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0LnB1c2goZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IHRhcmdldFtrZXldXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5rZXlzKHNyYykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNyY1trZXldICE9PSAnb2JqZWN0JyB8fCAhc3JjW2tleV0pIHtcbiAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IHNyY1trZXldXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGRzdFtrZXldID0gc3JjW2tleV1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IG1lcmdlKHRhcmdldFtrZXldLCBzcmNba2V5XSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGRzdFxufVxuIiwiLyoqXG4gKiAgQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIGdsb2JhbC5JbW11dGFibGUgPSBmYWN0b3J5KClcbn0odGhpcywgZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7dmFyIFNMSUNFJDAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ2xhc3MoY3Rvciwgc3VwZXJDbGFzcykge1xuICAgIGlmIChzdXBlckNsYXNzKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcy5wcm90b3R5cGUpO1xuICAgIH1cbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3I7XG4gIH1cblxuICAvLyBVc2VkIGZvciBzZXR0aW5nIHByb3RvdHlwZSBtZXRob2RzIHRoYXQgSUU4IGNob2tlcyBvbi5cbiAgdmFyIERFTEVURSA9ICdkZWxldGUnO1xuXG4gIC8vIENvbnN0YW50cyBkZXNjcmliaW5nIHRoZSBzaXplIG9mIHRyaWUgbm9kZXMuXG4gIHZhciBTSElGVCA9IDU7IC8vIFJlc3VsdGVkIGluIGJlc3QgcGVyZm9ybWFuY2UgYWZ0ZXIgX19fX19fP1xuICB2YXIgU0laRSA9IDEgPDwgU0hJRlQ7XG4gIHZhciBNQVNLID0gU0laRSAtIDE7XG5cbiAgLy8gQSBjb25zaXN0ZW50IHNoYXJlZCB2YWx1ZSByZXByZXNlbnRpbmcgXCJub3Qgc2V0XCIgd2hpY2ggZXF1YWxzIG5vdGhpbmcgb3RoZXJcbiAgLy8gdGhhbiBpdHNlbGYsIGFuZCBub3RoaW5nIHRoYXQgY291bGQgYmUgcHJvdmlkZWQgZXh0ZXJuYWxseS5cbiAgdmFyIE5PVF9TRVQgPSB7fTtcblxuICAvLyBCb29sZWFuIHJlZmVyZW5jZXMsIFJvdWdoIGVxdWl2YWxlbnQgb2YgYGJvb2wgJmAuXG4gIHZhciBDSEFOR0VfTEVOR1RIID0geyB2YWx1ZTogZmFsc2UgfTtcbiAgdmFyIERJRF9BTFRFUiA9IHsgdmFsdWU6IGZhbHNlIH07XG5cbiAgZnVuY3Rpb24gTWFrZVJlZihyZWYpIHtcbiAgICByZWYudmFsdWUgPSBmYWxzZTtcbiAgICByZXR1cm4gcmVmO1xuICB9XG5cbiAgZnVuY3Rpb24gU2V0UmVmKHJlZikge1xuICAgIHJlZiAmJiAocmVmLnZhbHVlID0gdHJ1ZSk7XG4gIH1cblxuICAvLyBBIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSB2YWx1ZSByZXByZXNlbnRpbmcgYW4gXCJvd25lclwiIGZvciB0cmFuc2llbnQgd3JpdGVzXG4gIC8vIHRvIHRyaWVzLiBUaGUgcmV0dXJuIHZhbHVlIHdpbGwgb25seSBldmVyIGVxdWFsIGl0c2VsZiwgYW5kIHdpbGwgbm90IGVxdWFsXG4gIC8vIHRoZSByZXR1cm4gb2YgYW55IHN1YnNlcXVlbnQgY2FsbCBvZiB0aGlzIGZ1bmN0aW9uLlxuICBmdW5jdGlvbiBPd25lcklEKCkge31cblxuICAvLyBodHRwOi8vanNwZXJmLmNvbS9jb3B5LWFycmF5LWlubGluZVxuICBmdW5jdGlvbiBhcnJDb3B5KGFyciwgb2Zmc2V0KSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHx8IDA7XG4gICAgdmFyIGxlbiA9IE1hdGgubWF4KDAsIGFyci5sZW5ndGggLSBvZmZzZXQpO1xuICAgIHZhciBuZXdBcnIgPSBuZXcgQXJyYXkobGVuKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbGVuOyBpaSsrKSB7XG4gICAgICBuZXdBcnJbaWldID0gYXJyW2lpICsgb2Zmc2V0XTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0FycjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuc3VyZVNpemUoaXRlcikge1xuICAgIGlmIChpdGVyLnNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlci5zaXplID0gaXRlci5fX2l0ZXJhdGUocmV0dXJuVHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBpdGVyLnNpemU7XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwSW5kZXgoaXRlciwgaW5kZXgpIHtcbiAgICByZXR1cm4gaW5kZXggPj0gMCA/ICgraW5kZXgpIDogZW5zdXJlU2l6ZShpdGVyKSArICgraW5kZXgpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmV0dXJuVHJ1ZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgc2l6ZSkge1xuICAgIHJldHVybiAoYmVnaW4gPT09IDAgfHwgKHNpemUgIT09IHVuZGVmaW5lZCAmJiBiZWdpbiA8PSAtc2l6ZSkpICYmXG4gICAgICAoZW5kID09PSB1bmRlZmluZWQgfHwgKHNpemUgIT09IHVuZGVmaW5lZCAmJiBlbmQgPj0gc2l6ZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZUJlZ2luKGJlZ2luLCBzaXplKSB7XG4gICAgcmV0dXJuIHJlc29sdmVJbmRleChiZWdpbiwgc2l6ZSwgMCk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlRW5kKGVuZCwgc2l6ZSkge1xuICAgIHJldHVybiByZXNvbHZlSW5kZXgoZW5kLCBzaXplLCBzaXplKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVJbmRleChpbmRleCwgc2l6ZSwgZGVmYXVsdEluZGV4KSB7XG4gICAgcmV0dXJuIGluZGV4ID09PSB1bmRlZmluZWQgP1xuICAgICAgZGVmYXVsdEluZGV4IDpcbiAgICAgIGluZGV4IDwgMCA/XG4gICAgICAgIE1hdGgubWF4KDAsIHNpemUgKyBpbmRleCkgOlxuICAgICAgICBzaXplID09PSB1bmRlZmluZWQgP1xuICAgICAgICAgIGluZGV4IDpcbiAgICAgICAgICBNYXRoLm1pbihzaXplLCBpbmRleCk7XG4gIH1cblxuICBmdW5jdGlvbiBJdGVyYWJsZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGlzSXRlcmFibGUodmFsdWUpID8gdmFsdWUgOiBTZXEodmFsdWUpO1xuICAgIH1cblxuXG4gIGNyZWF0ZUNsYXNzKEtleWVkSXRlcmFibGUsIEl0ZXJhYmxlKTtcbiAgICBmdW5jdGlvbiBLZXllZEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gaXNLZXllZCh2YWx1ZSkgPyB2YWx1ZSA6IEtleWVkU2VxKHZhbHVlKTtcbiAgICB9XG5cblxuICBjcmVhdGVDbGFzcyhJbmRleGVkSXRlcmFibGUsIEl0ZXJhYmxlKTtcbiAgICBmdW5jdGlvbiBJbmRleGVkSXRlcmFibGUodmFsdWUpIHtcbiAgICAgIHJldHVybiBpc0luZGV4ZWQodmFsdWUpID8gdmFsdWUgOiBJbmRleGVkU2VxKHZhbHVlKTtcbiAgICB9XG5cblxuICBjcmVhdGVDbGFzcyhTZXRJdGVyYWJsZSwgSXRlcmFibGUpO1xuICAgIGZ1bmN0aW9uIFNldEl0ZXJhYmxlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gaXNJdGVyYWJsZSh2YWx1ZSkgJiYgIWlzQXNzb2NpYXRpdmUodmFsdWUpID8gdmFsdWUgOiBTZXRTZXEodmFsdWUpO1xuICAgIH1cblxuXG5cbiAgZnVuY3Rpb24gaXNJdGVyYWJsZShtYXliZUl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuICEhKG1heWJlSXRlcmFibGUgJiYgbWF5YmVJdGVyYWJsZVtJU19JVEVSQUJMRV9TRU5USU5FTF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNLZXllZChtYXliZUtleWVkKSB7XG4gICAgcmV0dXJuICEhKG1heWJlS2V5ZWQgJiYgbWF5YmVLZXllZFtJU19LRVlFRF9TRU5USU5FTF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNJbmRleGVkKG1heWJlSW5kZXhlZCkge1xuICAgIHJldHVybiAhIShtYXliZUluZGV4ZWQgJiYgbWF5YmVJbmRleGVkW0lTX0lOREVYRURfU0VOVElORUxdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQXNzb2NpYXRpdmUobWF5YmVBc3NvY2lhdGl2ZSkge1xuICAgIHJldHVybiBpc0tleWVkKG1heWJlQXNzb2NpYXRpdmUpIHx8IGlzSW5kZXhlZChtYXliZUFzc29jaWF0aXZlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT3JkZXJlZChtYXliZU9yZGVyZWQpIHtcbiAgICByZXR1cm4gISEobWF5YmVPcmRlcmVkICYmIG1heWJlT3JkZXJlZFtJU19PUkRFUkVEX1NFTlRJTkVMXSk7XG4gIH1cblxuICBJdGVyYWJsZS5pc0l0ZXJhYmxlID0gaXNJdGVyYWJsZTtcbiAgSXRlcmFibGUuaXNLZXllZCA9IGlzS2V5ZWQ7XG4gIEl0ZXJhYmxlLmlzSW5kZXhlZCA9IGlzSW5kZXhlZDtcbiAgSXRlcmFibGUuaXNBc3NvY2lhdGl2ZSA9IGlzQXNzb2NpYXRpdmU7XG4gIEl0ZXJhYmxlLmlzT3JkZXJlZCA9IGlzT3JkZXJlZDtcblxuICBJdGVyYWJsZS5LZXllZCA9IEtleWVkSXRlcmFibGU7XG4gIEl0ZXJhYmxlLkluZGV4ZWQgPSBJbmRleGVkSXRlcmFibGU7XG4gIEl0ZXJhYmxlLlNldCA9IFNldEl0ZXJhYmxlO1xuXG5cbiAgdmFyIElTX0lURVJBQkxFX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfSVRFUkFCTEVfX0BAJztcbiAgdmFyIElTX0tFWUVEX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfS0VZRURfX0BAJztcbiAgdmFyIElTX0lOREVYRURfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9JTkRFWEVEX19AQCc7XG4gIHZhciBJU19PUkRFUkVEX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfT1JERVJFRF9fQEAnO1xuXG4gIC8qIGdsb2JhbCBTeW1ib2wgKi9cblxuICB2YXIgSVRFUkFURV9LRVlTID0gMDtcbiAgdmFyIElURVJBVEVfVkFMVUVTID0gMTtcbiAgdmFyIElURVJBVEVfRU5UUklFUyA9IDI7XG5cbiAgdmFyIFJFQUxfSVRFUkFUT1JfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wuaXRlcmF0b3I7XG4gIHZhciBGQVVYX0lURVJBVE9SX1NZTUJPTCA9ICdAQGl0ZXJhdG9yJztcblxuICB2YXIgSVRFUkFUT1JfU1lNQk9MID0gUkVBTF9JVEVSQVRPUl9TWU1CT0wgfHwgRkFVWF9JVEVSQVRPUl9TWU1CT0w7XG5cblxuICBmdW5jdGlvbiBJdGVyYXRvcihuZXh0KSB7XG4gICAgICB0aGlzLm5leHQgPSBuZXh0O1xuICAgIH1cblxuICAgIEl0ZXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICdbSXRlcmF0b3JdJztcbiAgICB9O1xuXG5cbiAgSXRlcmF0b3IuS0VZUyA9IElURVJBVEVfS0VZUztcbiAgSXRlcmF0b3IuVkFMVUVTID0gSVRFUkFURV9WQUxVRVM7XG4gIEl0ZXJhdG9yLkVOVFJJRVMgPSBJVEVSQVRFX0VOVFJJRVM7XG5cbiAgSXRlcmF0b3IucHJvdG90eXBlLmluc3BlY3QgPVxuICBJdGVyYXRvci5wcm90b3R5cGUudG9Tb3VyY2UgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnRvU3RyaW5nKCk7IH1cbiAgSXRlcmF0b3IucHJvdG90eXBlW0lURVJBVE9SX1NZTUJPTF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cblxuICBmdW5jdGlvbiBpdGVyYXRvclZhbHVlKHR5cGUsIGssIHYsIGl0ZXJhdG9yUmVzdWx0KSB7XG4gICAgdmFyIHZhbHVlID0gdHlwZSA9PT0gMCA/IGsgOiB0eXBlID09PSAxID8gdiA6IFtrLCB2XTtcbiAgICBpdGVyYXRvclJlc3VsdCA/IChpdGVyYXRvclJlc3VsdC52YWx1ZSA9IHZhbHVlKSA6IChpdGVyYXRvclJlc3VsdCA9IHtcbiAgICAgIHZhbHVlOiB2YWx1ZSwgZG9uZTogZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gaXRlcmF0b3JSZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBpdGVyYXRvckRvbmUoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzSXRlcmF0b3IobWF5YmVJdGVyYWJsZSkge1xuICAgIHJldHVybiAhIWdldEl0ZXJhdG9yRm4obWF5YmVJdGVyYWJsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc0l0ZXJhdG9yKG1heWJlSXRlcmF0b3IpIHtcbiAgICByZXR1cm4gbWF5YmVJdGVyYXRvciAmJiB0eXBlb2YgbWF5YmVJdGVyYXRvci5uZXh0ID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SXRlcmF0b3IoaXRlcmFibGUpIHtcbiAgICB2YXIgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4oaXRlcmFibGUpO1xuICAgIHJldHVybiBpdGVyYXRvckZuICYmIGl0ZXJhdG9yRm4uY2FsbChpdGVyYWJsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRJdGVyYXRvckZuKGl0ZXJhYmxlKSB7XG4gICAgdmFyIGl0ZXJhdG9yRm4gPSBpdGVyYWJsZSAmJiAoXG4gICAgICAoUkVBTF9JVEVSQVRPUl9TWU1CT0wgJiYgaXRlcmFibGVbUkVBTF9JVEVSQVRPUl9TWU1CT0xdKSB8fFxuICAgICAgaXRlcmFibGVbRkFVWF9JVEVSQVRPUl9TWU1CT0xdXG4gICAgKTtcbiAgICBpZiAodHlwZW9mIGl0ZXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBpdGVyYXRvckZuO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoU2VxLCBJdGVyYWJsZSk7XG4gICAgZnVuY3Rpb24gU2VxKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGVtcHR5U2VxdWVuY2UoKSA6XG4gICAgICAgIGlzSXRlcmFibGUodmFsdWUpID8gdmFsdWUudG9TZXEoKSA6IHNlcUZyb21WYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgU2VxLm9mID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgcmV0dXJuIFNlcShhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBTZXEucHJvdG90eXBlLnRvU2VxID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgU2VxLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnU2VxIHsnLCAnfScpO1xuICAgIH07XG5cbiAgICBTZXEucHJvdG90eXBlLmNhY2hlUmVzdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuX2NhY2hlICYmIHRoaXMuX19pdGVyYXRlVW5jYWNoZWQpIHtcbiAgICAgICAgdGhpcy5fY2FjaGUgPSB0aGlzLmVudHJ5U2VxKCkudG9BcnJheSgpO1xuICAgICAgICB0aGlzLnNpemUgPSB0aGlzLl9jYWNoZS5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLy8gYWJzdHJhY3QgX19pdGVyYXRlVW5jYWNoZWQoZm4sIHJldmVyc2UpXG5cbiAgICBTZXEucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICByZXR1cm4gc2VxSXRlcmF0ZSh0aGlzLCBmbiwgcmV2ZXJzZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIC8vIGFic3RyYWN0IF9faXRlcmF0b3JVbmNhY2hlZCh0eXBlLCByZXZlcnNlKVxuXG4gICAgU2VxLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHNlcUl0ZXJhdG9yKHRoaXMsIHR5cGUsIHJldmVyc2UsIHRydWUpO1xuICAgIH07XG5cblxuXG4gIGNyZWF0ZUNsYXNzKEtleWVkU2VxLCBTZXEpO1xuICAgIGZ1bmN0aW9uIEtleWVkU2VxKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/XG4gICAgICAgIGVtcHR5U2VxdWVuY2UoKS50b0tleWVkU2VxKCkgOlxuICAgICAgICBpc0l0ZXJhYmxlKHZhbHVlKSA/XG4gICAgICAgICAgKGlzS2V5ZWQodmFsdWUpID8gdmFsdWUudG9TZXEoKSA6IHZhbHVlLmZyb21FbnRyeVNlcSgpKSA6XG4gICAgICAgICAga2V5ZWRTZXFGcm9tVmFsdWUodmFsdWUpO1xuICAgIH1cblxuICAgIEtleWVkU2VxLm9mID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgcmV0dXJuIEtleWVkU2VxKGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIEtleWVkU2VxLnByb3RvdHlwZS50b0tleWVkU2VxID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgS2V5ZWRTZXEucHJvdG90eXBlLnRvU2VxID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5cblxuICBjcmVhdGVDbGFzcyhJbmRleGVkU2VxLCBTZXEpO1xuICAgIGZ1bmN0aW9uIEluZGV4ZWRTZXEodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZW1wdHlTZXF1ZW5jZSgpIDpcbiAgICAgICAgIWlzSXRlcmFibGUodmFsdWUpID8gaW5kZXhlZFNlcUZyb21WYWx1ZSh2YWx1ZSkgOlxuICAgICAgICBpc0tleWVkKHZhbHVlKSA/IHZhbHVlLmVudHJ5U2VxKCkgOiB2YWx1ZS50b0luZGV4ZWRTZXEoKTtcbiAgICB9XG5cbiAgICBJbmRleGVkU2VxLm9mID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgcmV0dXJuIEluZGV4ZWRTZXEoYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgSW5kZXhlZFNlcS5wcm90b3R5cGUudG9JbmRleGVkU2VxID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgSW5kZXhlZFNlcS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ1NlcSBbJywgJ10nKTtcbiAgICB9O1xuXG4gICAgSW5kZXhlZFNlcS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIHJldHVybiBzZXFJdGVyYXRlKHRoaXMsIGZuLCByZXZlcnNlLCBmYWxzZSk7XG4gICAgfTtcblxuICAgIEluZGV4ZWRTZXEucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICByZXR1cm4gc2VxSXRlcmF0b3IodGhpcywgdHlwZSwgcmV2ZXJzZSwgZmFsc2UpO1xuICAgIH07XG5cblxuXG4gIGNyZWF0ZUNsYXNzKFNldFNlcSwgU2VxKTtcbiAgICBmdW5jdGlvbiBTZXRTZXEodmFsdWUpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgPyBlbXB0eVNlcXVlbmNlKCkgOlxuICAgICAgICAhaXNJdGVyYWJsZSh2YWx1ZSkgPyBpbmRleGVkU2VxRnJvbVZhbHVlKHZhbHVlKSA6XG4gICAgICAgIGlzS2V5ZWQodmFsdWUpID8gdmFsdWUuZW50cnlTZXEoKSA6IHZhbHVlXG4gICAgICApLnRvU2V0U2VxKCk7XG4gICAgfVxuXG4gICAgU2V0U2VxLm9mID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgcmV0dXJuIFNldFNlcShhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBTZXRTZXEucHJvdG90eXBlLnRvU2V0U2VxID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG5cblxuICBTZXEuaXNTZXEgPSBpc1NlcTtcbiAgU2VxLktleWVkID0gS2V5ZWRTZXE7XG4gIFNlcS5TZXQgPSBTZXRTZXE7XG4gIFNlcS5JbmRleGVkID0gSW5kZXhlZFNlcTtcblxuICB2YXIgSVNfU0VRX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfU0VRX19AQCc7XG5cbiAgU2VxLnByb3RvdHlwZVtJU19TRVFfU0VOVElORUxdID0gdHJ1ZTtcblxuXG5cbiAgLy8gI3ByYWdtYSBSb290IFNlcXVlbmNlc1xuXG4gIGNyZWF0ZUNsYXNzKEFycmF5U2VxLCBJbmRleGVkU2VxKTtcbiAgICBmdW5jdGlvbiBBcnJheVNlcShhcnJheSkge1xuICAgICAgdGhpcy5fYXJyYXkgPSBhcnJheTtcbiAgICAgIHRoaXMuc2l6ZSA9IGFycmF5Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBBcnJheVNlcS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaW5kZXgsIG5vdFNldFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXMoaW5kZXgpID8gdGhpcy5fYXJyYXlbd3JhcEluZGV4KHRoaXMsIGluZGV4KV0gOiBub3RTZXRWYWx1ZTtcbiAgICB9O1xuXG4gICAgQXJyYXlTZXEucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheTtcbiAgICAgIHZhciBtYXhJbmRleCA9IGFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDw9IG1heEluZGV4OyBpaSsrKSB7XG4gICAgICAgIGlmIChmbihhcnJheVtyZXZlcnNlID8gbWF4SW5kZXggLSBpaSA6IGlpXSwgaWksIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybiBpaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpaTtcbiAgICB9O1xuXG4gICAgQXJyYXlTZXEucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheTtcbiAgICAgIHZhciBtYXhJbmRleCA9IGFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICB2YXIgaWkgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpIFxuICAgICAgICB7cmV0dXJuIGlpID4gbWF4SW5kZXggP1xuICAgICAgICAgIGl0ZXJhdG9yRG9uZSgpIDpcbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIGlpLCBhcnJheVtyZXZlcnNlID8gbWF4SW5kZXggLSBpaSsrIDogaWkrK10pfVxuICAgICAgKTtcbiAgICB9O1xuXG5cblxuICBjcmVhdGVDbGFzcyhPYmplY3RTZXEsIEtleWVkU2VxKTtcbiAgICBmdW5jdGlvbiBPYmplY3RTZXEob2JqZWN0KSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG4gICAgICB0aGlzLl9vYmplY3QgPSBvYmplY3Q7XG4gICAgICB0aGlzLl9rZXlzID0ga2V5cztcbiAgICAgIHRoaXMuc2l6ZSA9IGtleXMubGVuZ3RoO1xuICAgIH1cblxuICAgIE9iamVjdFNlcS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5LCBub3RTZXRWYWx1ZSkge1xuICAgICAgaWYgKG5vdFNldFZhbHVlICE9PSB1bmRlZmluZWQgJiYgIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgcmV0dXJuIG5vdFNldFZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX29iamVjdFtrZXldO1xuICAgIH07XG5cbiAgICBPYmplY3RTZXEucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX29iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuICAgIH07XG5cbiAgICBPYmplY3RTZXEucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICB2YXIgb2JqZWN0ID0gdGhpcy5fb2JqZWN0O1xuICAgICAgdmFyIGtleXMgPSB0aGlzLl9rZXlzO1xuICAgICAgdmFyIG1heEluZGV4ID0ga2V5cy5sZW5ndGggLSAxO1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8PSBtYXhJbmRleDsgaWkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tyZXZlcnNlID8gbWF4SW5kZXggLSBpaSA6IGlpXTtcbiAgICAgICAgaWYgKGZuKG9iamVjdFtrZXldLCBrZXksIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybiBpaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpaTtcbiAgICB9O1xuXG4gICAgT2JqZWN0U2VxLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdmFyIG9iamVjdCA9IHRoaXMuX29iamVjdDtcbiAgICAgIHZhciBrZXlzID0gdGhpcy5fa2V5cztcbiAgICAgIHZhciBtYXhJbmRleCA9IGtleXMubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBpaSA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXNbcmV2ZXJzZSA/IG1heEluZGV4IC0gaWkgOiBpaV07XG4gICAgICAgIHJldHVybiBpaSsrID4gbWF4SW5kZXggP1xuICAgICAgICAgIGl0ZXJhdG9yRG9uZSgpIDpcbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIGtleSwgb2JqZWN0W2tleV0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICBPYmplY3RTZXEucHJvdG90eXBlW0lTX09SREVSRURfU0VOVElORUxdID0gdHJ1ZTtcblxuXG4gIGNyZWF0ZUNsYXNzKEl0ZXJhYmxlU2VxLCBJbmRleGVkU2VxKTtcbiAgICBmdW5jdGlvbiBJdGVyYWJsZVNlcShpdGVyYWJsZSkge1xuICAgICAgdGhpcy5faXRlcmFibGUgPSBpdGVyYWJsZTtcbiAgICAgIHRoaXMuc2l6ZSA9IGl0ZXJhYmxlLmxlbmd0aCB8fCBpdGVyYWJsZS5zaXplO1xuICAgIH1cblxuICAgIEl0ZXJhYmxlU2VxLnByb3RvdHlwZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmFibGUgPSB0aGlzLl9pdGVyYWJsZTtcbiAgICAgIHZhciBpdGVyYXRvciA9IGdldEl0ZXJhdG9yKGl0ZXJhYmxlKTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIGlmIChpc0l0ZXJhdG9yKGl0ZXJhdG9yKSkge1xuICAgICAgICB2YXIgc3RlcDtcbiAgICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICAgIGlmIChmbihzdGVwLnZhbHVlLCBpdGVyYXRpb25zKyssIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuXG4gICAgSXRlcmFibGVTZXEucHJvdG90eXBlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYWJsZSA9IHRoaXMuX2l0ZXJhYmxlO1xuICAgICAgdmFyIGl0ZXJhdG9yID0gZ2V0SXRlcmF0b3IoaXRlcmFibGUpO1xuICAgICAgaWYgKCFpc0l0ZXJhdG9yKGl0ZXJhdG9yKSkge1xuICAgICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGl0ZXJhdG9yRG9uZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIHJldHVybiBzdGVwLmRvbmUgPyBzdGVwIDogaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHN0ZXAudmFsdWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgY3JlYXRlQ2xhc3MoSXRlcmF0b3JTZXEsIEluZGV4ZWRTZXEpO1xuICAgIGZ1bmN0aW9uIEl0ZXJhdG9yU2VxKGl0ZXJhdG9yKSB7XG4gICAgICB0aGlzLl9pdGVyYXRvciA9IGl0ZXJhdG9yO1xuICAgICAgdGhpcy5faXRlcmF0b3JDYWNoZSA9IFtdO1xuICAgIH1cblxuICAgIEl0ZXJhdG9yU2VxLnByb3RvdHlwZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLl9pdGVyYXRvcjtcbiAgICAgIHZhciBjYWNoZSA9IHRoaXMuX2l0ZXJhdG9yQ2FjaGU7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB3aGlsZSAoaXRlcmF0aW9ucyA8IGNhY2hlLmxlbmd0aCkge1xuICAgICAgICBpZiAoZm4oY2FjaGVbaXRlcmF0aW9uc10sIGl0ZXJhdGlvbnMrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBzdGVwO1xuICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICB2YXIgdmFsID0gc3RlcC52YWx1ZTtcbiAgICAgICAgY2FjaGVbaXRlcmF0aW9uc10gPSB2YWw7XG4gICAgICAgIGlmIChmbih2YWwsIGl0ZXJhdGlvbnMrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH07XG5cbiAgICBJdGVyYXRvclNlcS5wcm90b3R5cGUuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5faXRlcmF0b3I7XG4gICAgICB2YXIgY2FjaGUgPSB0aGlzLl9pdGVyYXRvckNhY2hlO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIGlmIChpdGVyYXRpb25zID49IGNhY2hlLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgIGlmIChzdGVwLmRvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYWNoZVtpdGVyYXRpb25zXSA9IHN0ZXAudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucywgY2FjaGVbaXRlcmF0aW9ucysrXSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG5cblxuXG4gIC8vICMgcHJhZ21hIEhlbHBlciBmdW5jdGlvbnNcblxuICBmdW5jdGlvbiBpc1NlcShtYXliZVNlcSkge1xuICAgIHJldHVybiAhIShtYXliZVNlcSAmJiBtYXliZVNlcVtJU19TRVFfU0VOVElORUxdKTtcbiAgfVxuXG4gIHZhciBFTVBUWV9TRVE7XG5cbiAgZnVuY3Rpb24gZW1wdHlTZXF1ZW5jZSgpIHtcbiAgICByZXR1cm4gRU1QVFlfU0VRIHx8IChFTVBUWV9TRVEgPSBuZXcgQXJyYXlTZXEoW10pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGtleWVkU2VxRnJvbVZhbHVlKHZhbHVlKSB7XG4gICAgdmFyIHNlcSA9XG4gICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IG5ldyBBcnJheVNlcSh2YWx1ZSkuZnJvbUVudHJ5U2VxKCkgOlxuICAgICAgaXNJdGVyYXRvcih2YWx1ZSkgPyBuZXcgSXRlcmF0b3JTZXEodmFsdWUpLmZyb21FbnRyeVNlcSgpIDpcbiAgICAgIGhhc0l0ZXJhdG9yKHZhbHVlKSA/IG5ldyBJdGVyYWJsZVNlcSh2YWx1ZSkuZnJvbUVudHJ5U2VxKCkgOlxuICAgICAgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyA/IG5ldyBPYmplY3RTZXEodmFsdWUpIDpcbiAgICAgIHVuZGVmaW5lZDtcbiAgICBpZiAoIXNlcSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ0V4cGVjdGVkIEFycmF5IG9yIGl0ZXJhYmxlIG9iamVjdCBvZiBbaywgdl0gZW50cmllcywgJytcbiAgICAgICAgJ29yIGtleWVkIG9iamVjdDogJyArIHZhbHVlXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gc2VxO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5kZXhlZFNlcUZyb21WYWx1ZSh2YWx1ZSkge1xuICAgIHZhciBzZXEgPSBtYXliZUluZGV4ZWRTZXFGcm9tVmFsdWUodmFsdWUpO1xuICAgIGlmICghc2VxKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAnRXhwZWN0ZWQgQXJyYXkgb3IgaXRlcmFibGUgb2JqZWN0IG9mIHZhbHVlczogJyArIHZhbHVlXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gc2VxO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VxRnJvbVZhbHVlKHZhbHVlKSB7XG4gICAgdmFyIHNlcSA9IG1heWJlSW5kZXhlZFNlcUZyb21WYWx1ZSh2YWx1ZSkgfHxcbiAgICAgICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIG5ldyBPYmplY3RTZXEodmFsdWUpKTtcbiAgICBpZiAoIXNlcSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ0V4cGVjdGVkIEFycmF5IG9yIGl0ZXJhYmxlIG9iamVjdCBvZiB2YWx1ZXMsIG9yIGtleWVkIG9iamVjdDogJyArIHZhbHVlXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gc2VxO1xuICB9XG5cbiAgZnVuY3Rpb24gbWF5YmVJbmRleGVkU2VxRnJvbVZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGlzQXJyYXlMaWtlKHZhbHVlKSA/IG5ldyBBcnJheVNlcSh2YWx1ZSkgOlxuICAgICAgaXNJdGVyYXRvcih2YWx1ZSkgPyBuZXcgSXRlcmF0b3JTZXEodmFsdWUpIDpcbiAgICAgIGhhc0l0ZXJhdG9yKHZhbHVlKSA/IG5ldyBJdGVyYWJsZVNlcSh2YWx1ZSkgOlxuICAgICAgdW5kZWZpbmVkXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlcUl0ZXJhdGUoc2VxLCBmbiwgcmV2ZXJzZSwgdXNlS2V5cykge1xuICAgIHZhciBjYWNoZSA9IHNlcS5fY2FjaGU7XG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICB2YXIgbWF4SW5kZXggPSBjYWNoZS5sZW5ndGggLSAxO1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8PSBtYXhJbmRleDsgaWkrKykge1xuICAgICAgICB2YXIgZW50cnkgPSBjYWNoZVtyZXZlcnNlID8gbWF4SW5kZXggLSBpaSA6IGlpXTtcbiAgICAgICAgaWYgKGZuKGVudHJ5WzFdLCB1c2VLZXlzID8gZW50cnlbMF0gOiBpaSwgc2VxKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gaWkgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaWk7XG4gICAgfVxuICAgIHJldHVybiBzZXEuX19pdGVyYXRlVW5jYWNoZWQoZm4sIHJldmVyc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VxSXRlcmF0b3Ioc2VxLCB0eXBlLCByZXZlcnNlLCB1c2VLZXlzKSB7XG4gICAgdmFyIGNhY2hlID0gc2VxLl9jYWNoZTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIHZhciBtYXhJbmRleCA9IGNhY2hlLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgaWkgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHZhciBlbnRyeSA9IGNhY2hlW3JldmVyc2UgPyBtYXhJbmRleCAtIGlpIDogaWldO1xuICAgICAgICByZXR1cm4gaWkrKyA+IG1heEluZGV4ID9cbiAgICAgICAgICBpdGVyYXRvckRvbmUoKSA6XG4gICAgICAgICAgaXRlcmF0b3JWYWx1ZSh0eXBlLCB1c2VLZXlzID8gZW50cnlbMF0gOiBpaSAtIDEsIGVudHJ5WzFdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gc2VxLl9faXRlcmF0b3JVbmNhY2hlZCh0eXBlLCByZXZlcnNlKTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKENvbGxlY3Rpb24sIEl0ZXJhYmxlKTtcbiAgICBmdW5jdGlvbiBDb2xsZWN0aW9uKCkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCdBYnN0cmFjdCcpO1xuICAgIH1cblxuXG4gIGNyZWF0ZUNsYXNzKEtleWVkQ29sbGVjdGlvbiwgQ29sbGVjdGlvbik7ZnVuY3Rpb24gS2V5ZWRDb2xsZWN0aW9uKCkge31cblxuICBjcmVhdGVDbGFzcyhJbmRleGVkQ29sbGVjdGlvbiwgQ29sbGVjdGlvbik7ZnVuY3Rpb24gSW5kZXhlZENvbGxlY3Rpb24oKSB7fVxuXG4gIGNyZWF0ZUNsYXNzKFNldENvbGxlY3Rpb24sIENvbGxlY3Rpb24pO2Z1bmN0aW9uIFNldENvbGxlY3Rpb24oKSB7fVxuXG5cbiAgQ29sbGVjdGlvbi5LZXllZCA9IEtleWVkQ29sbGVjdGlvbjtcbiAgQ29sbGVjdGlvbi5JbmRleGVkID0gSW5kZXhlZENvbGxlY3Rpb247XG4gIENvbGxlY3Rpb24uU2V0ID0gU2V0Q29sbGVjdGlvbjtcblxuICAvKipcbiAgICogQW4gZXh0ZW5zaW9uIG9mIHRoZSBcInNhbWUtdmFsdWVcIiBhbGdvcml0aG0gYXMgW2Rlc2NyaWJlZCBmb3IgdXNlIGJ5IEVTNiBNYXBcbiAgICogYW5kIFNldF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTWFwI0tleV9lcXVhbGl0eSlcbiAgICpcbiAgICogTmFOIGlzIGNvbnNpZGVyZWQgdGhlIHNhbWUgYXMgTmFOLCBob3dldmVyIC0wIGFuZCAwIGFyZSBjb25zaWRlcmVkIHRoZSBzYW1lXG4gICAqIHZhbHVlLCB3aGljaCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgYWxnb3JpdGhtIGRlc2NyaWJlZCBieVxuICAgKiBbYE9iamVjdC5pc2BdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9pcykuXG4gICAqXG4gICAqIFRoaXMgaXMgZXh0ZW5kZWQgZnVydGhlciB0byBhbGxvdyBPYmplY3RzIHRvIGRlc2NyaWJlIHRoZSB2YWx1ZXMgdGhleVxuICAgKiByZXByZXNlbnQsIGJ5IHdheSBvZiBgdmFsdWVPZmAgb3IgYGVxdWFsc2AgKGFuZCBgaGFzaENvZGVgKS5cbiAgICpcbiAgICogTm90ZTogYmVjYXVzZSBvZiB0aGlzIGV4dGVuc2lvbiwgdGhlIGtleSBlcXVhbGl0eSBvZiBJbW11dGFibGUuTWFwIGFuZCB0aGVcbiAgICogdmFsdWUgZXF1YWxpdHkgb2YgSW1tdXRhYmxlLlNldCB3aWxsIGRpZmZlciBmcm9tIEVTNiBNYXAgYW5kIFNldC5cbiAgICpcbiAgICogIyMjIERlZmluaW5nIGN1c3RvbSB2YWx1ZXNcbiAgICpcbiAgICogVGhlIGVhc2llc3Qgd2F5IHRvIGRlc2NyaWJlIHRoZSB2YWx1ZSBhbiBvYmplY3QgcmVwcmVzZW50cyBpcyBieSBpbXBsZW1lbnRpbmdcbiAgICogYHZhbHVlT2ZgLiBGb3IgZXhhbXBsZSwgYERhdGVgIHJlcHJlc2VudHMgYSB2YWx1ZSBieSByZXR1cm5pbmcgYSB1bml4XG4gICAqIHRpbWVzdGFtcCBmb3IgYHZhbHVlT2ZgOlxuICAgKlxuICAgKiAgICAgdmFyIGRhdGUxID0gbmV3IERhdGUoMTIzNDU2Nzg5MDAwMCk7IC8vIEZyaSBGZWIgMTMgMjAwOSAuLi5cbiAgICogICAgIHZhciBkYXRlMiA9IG5ldyBEYXRlKDEyMzQ1Njc4OTAwMDApO1xuICAgKiAgICAgZGF0ZTEudmFsdWVPZigpOyAvLyAxMjM0NTY3ODkwMDAwXG4gICAqICAgICBhc3NlcnQoIGRhdGUxICE9PSBkYXRlMiApO1xuICAgKiAgICAgYXNzZXJ0KCBJbW11dGFibGUuaXMoIGRhdGUxLCBkYXRlMiApICk7XG4gICAqXG4gICAqIE5vdGU6IG92ZXJyaWRpbmcgYHZhbHVlT2ZgIG1heSBoYXZlIG90aGVyIGltcGxpY2F0aW9ucyBpZiB5b3UgdXNlIHRoaXMgb2JqZWN0XG4gICAqIHdoZXJlIEphdmFTY3JpcHQgZXhwZWN0cyBhIHByaW1pdGl2ZSwgc3VjaCBhcyBpbXBsaWNpdCBzdHJpbmcgY29lcmNpb24uXG4gICAqXG4gICAqIEZvciBtb3JlIGNvbXBsZXggdHlwZXMsIGVzcGVjaWFsbHkgY29sbGVjdGlvbnMsIGltcGxlbWVudGluZyBgdmFsdWVPZmAgbWF5XG4gICAqIG5vdCBiZSBwZXJmb3JtYW50LiBBbiBhbHRlcm5hdGl2ZSBpcyB0byBpbXBsZW1lbnQgYGVxdWFsc2AgYW5kIGBoYXNoQ29kZWAuXG4gICAqXG4gICAqIGBlcXVhbHNgIHRha2VzIGFub3RoZXIgb2JqZWN0LCBwcmVzdW1hYmx5IG9mIHNpbWlsYXIgdHlwZSwgYW5kIHJldHVybnMgdHJ1ZVxuICAgKiBpZiB0aGUgaXQgaXMgZXF1YWwuIEVxdWFsaXR5IGlzIHN5bW1ldHJpY2FsLCBzbyB0aGUgc2FtZSByZXN1bHQgc2hvdWxkIGJlXG4gICAqIHJldHVybmVkIGlmIHRoaXMgYW5kIHRoZSBhcmd1bWVudCBhcmUgZmxpcHBlZC5cbiAgICpcbiAgICogICAgIGFzc2VydCggYS5lcXVhbHMoYikgPT09IGIuZXF1YWxzKGEpICk7XG4gICAqXG4gICAqIGBoYXNoQ29kZWAgcmV0dXJucyBhIDMyYml0IGludGVnZXIgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgb2JqZWN0IHdoaWNoIHdpbGxcbiAgICogYmUgdXNlZCB0byBkZXRlcm1pbmUgaG93IHRvIHN0b3JlIHRoZSB2YWx1ZSBvYmplY3QgaW4gYSBNYXAgb3IgU2V0LiBZb3UgbXVzdFxuICAgKiBwcm92aWRlIGJvdGggb3IgbmVpdGhlciBtZXRob2RzLCBvbmUgbXVzdCBub3QgZXhpc3Qgd2l0aG91dCB0aGUgb3RoZXIuXG4gICAqXG4gICAqIEFsc28sIGFuIGltcG9ydGFudCByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGVzZSBtZXRob2RzIG11c3QgYmUgdXBoZWxkOiBpZiB0d29cbiAgICogdmFsdWVzIGFyZSBlcXVhbCwgdGhleSAqbXVzdCogcmV0dXJuIHRoZSBzYW1lIGhhc2hDb2RlLiBJZiB0aGUgdmFsdWVzIGFyZSBub3RcbiAgICogZXF1YWwsIHRoZXkgbWlnaHQgaGF2ZSB0aGUgc2FtZSBoYXNoQ29kZTsgdGhpcyBpcyBjYWxsZWQgYSBoYXNoIGNvbGxpc2lvbixcbiAgICogYW5kIHdoaWxlIHVuZGVzaXJhYmxlIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLCBpdCBpcyBhY2NlcHRhYmxlLlxuICAgKlxuICAgKiAgICAgaWYgKGEuZXF1YWxzKGIpKSB7XG4gICAqICAgICAgIGFzc2VydCggYS5oYXNoQ29kZSgpID09PSBiLmhhc2hDb2RlKCkgKTtcbiAgICogICAgIH1cbiAgICpcbiAgICogQWxsIEltbXV0YWJsZSBjb2xsZWN0aW9ucyBpbXBsZW1lbnQgYGVxdWFsc2AgYW5kIGBoYXNoQ29kZWAuXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiBpcyh2YWx1ZUEsIHZhbHVlQikge1xuICAgIGlmICh2YWx1ZUEgPT09IHZhbHVlQiB8fCAodmFsdWVBICE9PSB2YWx1ZUEgJiYgdmFsdWVCICE9PSB2YWx1ZUIpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCF2YWx1ZUEgfHwgIXZhbHVlQikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlQS52YWx1ZU9mID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgIHR5cGVvZiB2YWx1ZUIudmFsdWVPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFsdWVBID0gdmFsdWVBLnZhbHVlT2YoKTtcbiAgICAgIHZhbHVlQiA9IHZhbHVlQi52YWx1ZU9mKCk7XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgdmFsdWVBLmVxdWFscyA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIHZhbHVlQi5lcXVhbHMgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICB2YWx1ZUEuZXF1YWxzKHZhbHVlQikgOlxuICAgICAgICB2YWx1ZUEgPT09IHZhbHVlQiB8fCAodmFsdWVBICE9PSB2YWx1ZUEgJiYgdmFsdWVCICE9PSB2YWx1ZUIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZnJvbUpTKGpzb24sIGNvbnZlcnRlcikge1xuICAgIHJldHVybiBjb252ZXJ0ZXIgP1xuICAgICAgZnJvbUpTV2l0aChjb252ZXJ0ZXIsIGpzb24sICcnLCB7Jyc6IGpzb259KSA6XG4gICAgICBmcm9tSlNEZWZhdWx0KGpzb24pO1xuICB9XG5cbiAgZnVuY3Rpb24gZnJvbUpTV2l0aChjb252ZXJ0ZXIsIGpzb24sIGtleSwgcGFyZW50SlNPTikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGpzb24pKSB7XG4gICAgICByZXR1cm4gY29udmVydGVyLmNhbGwocGFyZW50SlNPTiwga2V5LCBJbmRleGVkU2VxKGpzb24pLm1hcChmdW5jdGlvbih2LCBrKSAge3JldHVybiBmcm9tSlNXaXRoKGNvbnZlcnRlciwgdiwgaywganNvbil9KSk7XG4gICAgfVxuICAgIGlmIChpc1BsYWluT2JqKGpzb24pKSB7XG4gICAgICByZXR1cm4gY29udmVydGVyLmNhbGwocGFyZW50SlNPTiwga2V5LCBLZXllZFNlcShqc29uKS5tYXAoZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gZnJvbUpTV2l0aChjb252ZXJ0ZXIsIHYsIGssIGpzb24pfSkpO1xuICAgIH1cbiAgICByZXR1cm4ganNvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZyb21KU0RlZmF1bHQoanNvbikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGpzb24pKSB7XG4gICAgICByZXR1cm4gSW5kZXhlZFNlcShqc29uKS5tYXAoZnJvbUpTRGVmYXVsdCkudG9MaXN0KCk7XG4gICAgfVxuICAgIGlmIChpc1BsYWluT2JqKGpzb24pKSB7XG4gICAgICByZXR1cm4gS2V5ZWRTZXEoanNvbikubWFwKGZyb21KU0RlZmF1bHQpLnRvTWFwKCk7XG4gICAgfVxuICAgIHJldHVybiBqc29uO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNQbGFpbk9iaih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xuICB9XG5cbiAgdmFyIE1hdGhfX2ltdWwgPVxuICAgIHR5cGVvZiBNYXRoLmltdWwgPT09ICdmdW5jdGlvbicgJiYgTWF0aC5pbXVsKDB4ZmZmZmZmZmYsIDIpID09PSAtMiA/XG4gICAgTWF0aC5pbXVsIDpcbiAgICBmdW5jdGlvbiBNYXRoX19pbXVsKGEsIGIpIHtcbiAgICAgIGEgPSBhIHwgMDsgLy8gaW50XG4gICAgICBiID0gYiB8IDA7IC8vIGludFxuICAgICAgdmFyIGMgPSBhICYgMHhmZmZmO1xuICAgICAgdmFyIGQgPSBiICYgMHhmZmZmO1xuICAgICAgLy8gU2hpZnQgYnkgMCBmaXhlcyB0aGUgc2lnbiBvbiB0aGUgaGlnaCBwYXJ0LlxuICAgICAgcmV0dXJuIChjICogZCkgKyAoKCgoYSA+Pj4gMTYpICogZCArIGMgKiAoYiA+Pj4gMTYpKSA8PCAxNikgPj4+IDApIHwgMDsgLy8gaW50XG4gICAgfTtcblxuICAvLyB2OCBoYXMgYW4gb3B0aW1pemF0aW9uIGZvciBzdG9yaW5nIDMxLWJpdCBzaWduZWQgbnVtYmVycy5cbiAgLy8gVmFsdWVzIHdoaWNoIGhhdmUgZWl0aGVyIDAwIG9yIDExIGFzIHRoZSBoaWdoIG9yZGVyIGJpdHMgcXVhbGlmeS5cbiAgLy8gVGhpcyBmdW5jdGlvbiBkcm9wcyB0aGUgaGlnaGVzdCBvcmRlciBiaXQgaW4gYSBzaWduZWQgbnVtYmVyLCBtYWludGFpbmluZ1xuICAvLyB0aGUgc2lnbiBiaXQuXG4gIGZ1bmN0aW9uIHNtaShpMzIpIHtcbiAgICByZXR1cm4gKChpMzIgPj4+IDEpICYgMHg0MDAwMDAwMCkgfCAoaTMyICYgMHhCRkZGRkZGRik7XG4gIH1cblxuICBmdW5jdGlvbiBoYXNoKG8pIHtcbiAgICBpZiAobyA9PT0gZmFsc2UgfHwgbyA9PT0gbnVsbCB8fCBvID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG8udmFsdWVPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbyA9IG8udmFsdWVPZigpO1xuICAgICAgaWYgKG8gPT09IGZhbHNlIHx8IG8gPT09IG51bGwgfHwgbyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobyA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuICAgIHZhciB0eXBlID0gdHlwZW9mIG87XG4gICAgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICB2YXIgaCA9IG8gfCAwO1xuICAgICAgaWYgKGggIT09IG8pIHtcbiAgICAgICAgaCBePSBvICogMHhGRkZGRkZGRjtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChvID4gMHhGRkZGRkZGRikge1xuICAgICAgICBvIC89IDB4RkZGRkZGRkY7XG4gICAgICAgIGggXj0gbztcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbWkoaCk7XG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIG8ubGVuZ3RoID4gU1RSSU5HX0hBU0hfQ0FDSEVfTUlOX1NUUkxFTiA/IGNhY2hlZEhhc2hTdHJpbmcobykgOiBoYXNoU3RyaW5nKG8pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG8uaGFzaENvZGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBvLmhhc2hDb2RlKCk7XG4gICAgfVxuICAgIHJldHVybiBoYXNoSlNPYmoobyk7XG4gIH1cblxuICBmdW5jdGlvbiBjYWNoZWRIYXNoU3RyaW5nKHN0cmluZykge1xuICAgIHZhciBoYXNoID0gc3RyaW5nSGFzaENhY2hlW3N0cmluZ107XG4gICAgaWYgKGhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgaGFzaCA9IGhhc2hTdHJpbmcoc3RyaW5nKTtcbiAgICAgIGlmIChTVFJJTkdfSEFTSF9DQUNIRV9TSVpFID09PSBTVFJJTkdfSEFTSF9DQUNIRV9NQVhfU0laRSkge1xuICAgICAgICBTVFJJTkdfSEFTSF9DQUNIRV9TSVpFID0gMDtcbiAgICAgICAgc3RyaW5nSGFzaENhY2hlID0ge307XG4gICAgICB9XG4gICAgICBTVFJJTkdfSEFTSF9DQUNIRV9TSVpFKys7XG4gICAgICBzdHJpbmdIYXNoQ2FjaGVbc3RyaW5nXSA9IGhhc2g7XG4gICAgfVxuICAgIHJldHVybiBoYXNoO1xuICB9XG5cbiAgLy8gaHR0cDovL2pzcGVyZi5jb20vaGFzaGluZy1zdHJpbmdzXG4gIGZ1bmN0aW9uIGhhc2hTdHJpbmcoc3RyaW5nKSB7XG4gICAgLy8gVGhpcyBpcyB0aGUgaGFzaCBmcm9tIEpWTVxuICAgIC8vIFRoZSBoYXNoIGNvZGUgZm9yIGEgc3RyaW5nIGlzIGNvbXB1dGVkIGFzXG4gICAgLy8gc1swXSAqIDMxIF4gKG4gLSAxKSArIHNbMV0gKiAzMSBeIChuIC0gMikgKyAuLi4gKyBzW24gLSAxXSxcbiAgICAvLyB3aGVyZSBzW2ldIGlzIHRoZSBpdGggY2hhcmFjdGVyIG9mIHRoZSBzdHJpbmcgYW5kIG4gaXMgdGhlIGxlbmd0aCBvZlxuICAgIC8vIHRoZSBzdHJpbmcuIFdlIFwibW9kXCIgdGhlIHJlc3VsdCB0byBtYWtlIGl0IGJldHdlZW4gMCAoaW5jbHVzaXZlKSBhbmQgMl4zMVxuICAgIC8vIChleGNsdXNpdmUpIGJ5IGRyb3BwaW5nIGhpZ2ggYml0cy5cbiAgICB2YXIgaGFzaCA9IDA7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHN0cmluZy5sZW5ndGg7IGlpKyspIHtcbiAgICAgIGhhc2ggPSAzMSAqIGhhc2ggKyBzdHJpbmcuY2hhckNvZGVBdChpaSkgfCAwO1xuICAgIH1cbiAgICByZXR1cm4gc21pKGhhc2gpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzaEpTT2JqKG9iaikge1xuICAgIHZhciBoYXNoID0gd2Vha01hcCAmJiB3ZWFrTWFwLmdldChvYmopO1xuICAgIGlmIChoYXNoKSByZXR1cm4gaGFzaDtcblxuICAgIGhhc2ggPSBvYmpbVUlEX0hBU0hfS0VZXTtcbiAgICBpZiAoaGFzaCkgcmV0dXJuIGhhc2g7XG5cbiAgICBpZiAoIWNhbkRlZmluZVByb3BlcnR5KSB7XG4gICAgICBoYXNoID0gb2JqLnByb3BlcnR5SXNFbnVtZXJhYmxlICYmIG9iai5wcm9wZXJ0eUlzRW51bWVyYWJsZVtVSURfSEFTSF9LRVldO1xuICAgICAgaWYgKGhhc2gpIHJldHVybiBoYXNoO1xuXG4gICAgICBoYXNoID0gZ2V0SUVOb2RlSGFzaChvYmopO1xuICAgICAgaWYgKGhhc2gpIHJldHVybiBoYXNoO1xuICAgIH1cblxuICAgIGlmIChPYmplY3QuaXNFeHRlbnNpYmxlICYmICFPYmplY3QuaXNFeHRlbnNpYmxlKG9iaikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm9uLWV4dGVuc2libGUgb2JqZWN0cyBhcmUgbm90IGFsbG93ZWQgYXMga2V5cy4nKTtcbiAgICB9XG5cbiAgICBoYXNoID0gKytvYmpIYXNoVUlEO1xuICAgIGlmIChvYmpIYXNoVUlEICYgMHg0MDAwMDAwMCkge1xuICAgICAgb2JqSGFzaFVJRCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHdlYWtNYXApIHtcbiAgICAgIHdlYWtNYXAuc2V0KG9iaiwgaGFzaCk7XG4gICAgfSBlbHNlIGlmIChjYW5EZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgVUlEX0hBU0hfS0VZLCB7XG4gICAgICAgICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICAgICAgICdjb25maWd1cmFibGUnOiBmYWxzZSxcbiAgICAgICAgJ3dyaXRhYmxlJzogZmFsc2UsXG4gICAgICAgICd2YWx1ZSc6IGhhc2hcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAob2JqLnByb3BlcnR5SXNFbnVtZXJhYmxlICYmXG4gICAgICAgICAgICAgICBvYmoucHJvcGVydHlJc0VudW1lcmFibGUgPT09IG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUpIHtcbiAgICAgIC8vIFNpbmNlIHdlIGNhbid0IGRlZmluZSBhIG5vbi1lbnVtZXJhYmxlIHByb3BlcnR5IG9uIHRoZSBvYmplY3RcbiAgICAgIC8vIHdlJ2xsIGhpamFjayBvbmUgb2YgdGhlIGxlc3MtdXNlZCBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzIHRvXG4gICAgICAvLyBzYXZlIG91ciBoYXNoIG9uIGl0LiBTaW5jZSB0aGlzIGlzIGEgZnVuY3Rpb24gaXQgd2lsbCBub3Qgc2hvdyB1cCBpblxuICAgICAgLy8gYEpTT04uc3RyaW5naWZ5YCB3aGljaCBpcyB3aGF0IHdlIHdhbnQuXG4gICAgICBvYmoucHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgICAgb2JqLnByb3BlcnR5SXNFbnVtZXJhYmxlW1VJRF9IQVNIX0tFWV0gPSBoYXNoO1xuICAgIH0gZWxzZSBpZiAob2JqLm5vZGVUeXBlKSB7XG4gICAgICAvLyBBdCB0aGlzIHBvaW50IHdlIGNvdWxkbid0IGdldCB0aGUgSUUgYHVuaXF1ZUlEYCB0byB1c2UgYXMgYSBoYXNoXG4gICAgICAvLyBhbmQgd2UgY291bGRuJ3QgdXNlIGEgbm9uLWVudW1lcmFibGUgcHJvcGVydHkgdG8gZXhwbG9pdCB0aGVcbiAgICAgIC8vIGRvbnRFbnVtIGJ1ZyBzbyB3ZSBzaW1wbHkgYWRkIHRoZSBgVUlEX0hBU0hfS0VZYCBvbiB0aGUgbm9kZVxuICAgICAgLy8gaXRzZWxmLlxuICAgICAgb2JqW1VJRF9IQVNIX0tFWV0gPSBoYXNoO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBzZXQgYSBub24tZW51bWVyYWJsZSBwcm9wZXJ0eSBvbiBvYmplY3QuJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhc2g7XG4gIH1cblxuICAvLyBUcnVlIGlmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB3b3JrcyBhcyBleHBlY3RlZC4gSUU4IGZhaWxzIHRoaXMgdGVzdC5cbiAgdmFyIGNhbkRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICd4Jywge30pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSgpKTtcblxuICAvLyBJRSBoYXMgYSBgdW5pcXVlSURgIHByb3BlcnR5IG9uIERPTSBub2Rlcy4gV2UgY2FuIGNvbnN0cnVjdCB0aGUgaGFzaCBmcm9tIGl0XG4gIC8vIGFuZCBhdm9pZCBtZW1vcnkgbGVha3MgZnJvbSB0aGUgSUUgY2xvbmVOb2RlIGJ1Zy5cbiAgZnVuY3Rpb24gZ2V0SUVOb2RlSGFzaChub2RlKSB7XG4gICAgaWYgKG5vZGUgJiYgbm9kZS5ub2RlVHlwZSA+IDApIHtcbiAgICAgIHN3aXRjaCAobm9kZS5ub2RlVHlwZSkge1xuICAgICAgICBjYXNlIDE6IC8vIEVsZW1lbnRcbiAgICAgICAgICByZXR1cm4gbm9kZS51bmlxdWVJRDtcbiAgICAgICAgY2FzZSA5OiAvLyBEb2N1bWVudFxuICAgICAgICAgIHJldHVybiBub2RlLmRvY3VtZW50RWxlbWVudCAmJiBub2RlLmRvY3VtZW50RWxlbWVudC51bmlxdWVJRDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBJZiBwb3NzaWJsZSwgdXNlIGEgV2Vha01hcC5cbiAgdmFyIHdlYWtNYXAgPSB0eXBlb2YgV2Vha01hcCA9PT0gJ2Z1bmN0aW9uJyAmJiBuZXcgV2Vha01hcCgpO1xuXG4gIHZhciBvYmpIYXNoVUlEID0gMDtcblxuICB2YXIgVUlEX0hBU0hfS0VZID0gJ19faW1tdXRhYmxlaGFzaF9fJztcbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicpIHtcbiAgICBVSURfSEFTSF9LRVkgPSBTeW1ib2woVUlEX0hBU0hfS0VZKTtcbiAgfVxuXG4gIHZhciBTVFJJTkdfSEFTSF9DQUNIRV9NSU5fU1RSTEVOID0gMTY7XG4gIHZhciBTVFJJTkdfSEFTSF9DQUNIRV9NQVhfU0laRSA9IDI1NTtcbiAgdmFyIFNUUklOR19IQVNIX0NBQ0hFX1NJWkUgPSAwO1xuICB2YXIgc3RyaW5nSGFzaENhY2hlID0ge307XG5cbiAgZnVuY3Rpb24gaW52YXJpYW50KGNvbmRpdGlvbiwgZXJyb3IpIHtcbiAgICBpZiAoIWNvbmRpdGlvbikgdGhyb3cgbmV3IEVycm9yKGVycm9yKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2VydE5vdEluZmluaXRlKHNpemUpIHtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBzaXplICE9PSBJbmZpbml0eSxcbiAgICAgICdDYW5ub3QgcGVyZm9ybSB0aGlzIGFjdGlvbiB3aXRoIGFuIGluZmluaXRlIHNpemUuJ1xuICAgICk7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhUb0tleWVkU2VxdWVuY2UsIEtleWVkU2VxKTtcbiAgICBmdW5jdGlvbiBUb0tleWVkU2VxdWVuY2UoaW5kZXhlZCwgdXNlS2V5cykge1xuICAgICAgdGhpcy5faXRlciA9IGluZGV4ZWQ7XG4gICAgICB0aGlzLl91c2VLZXlzID0gdXNlS2V5cztcbiAgICAgIHRoaXMuc2l6ZSA9IGluZGV4ZWQuc2l6ZTtcbiAgICB9XG5cbiAgICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLmdldChrZXksIG5vdFNldFZhbHVlKTtcbiAgICB9O1xuXG4gICAgVG9LZXllZFNlcXVlbmNlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLmhhcyhrZXkpO1xuICAgIH07XG5cbiAgICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLnZhbHVlU2VxID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlci52YWx1ZVNlcSgpO1xuICAgIH07XG5cbiAgICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLnJldmVyc2UgPSBmdW5jdGlvbigpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHZhciByZXZlcnNlZFNlcXVlbmNlID0gcmV2ZXJzZUZhY3RvcnkodGhpcywgdHJ1ZSk7XG4gICAgICBpZiAoIXRoaXMuX3VzZUtleXMpIHtcbiAgICAgICAgcmV2ZXJzZWRTZXF1ZW5jZS52YWx1ZVNlcSA9IGZ1bmN0aW9uKCkgIHtyZXR1cm4gdGhpcyQwLl9pdGVyLnRvU2VxKCkucmV2ZXJzZSgpfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXZlcnNlZFNlcXVlbmNlO1xuICAgIH07XG5cbiAgICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uKG1hcHBlciwgY29udGV4dCkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgdmFyIG1hcHBlZFNlcXVlbmNlID0gbWFwRmFjdG9yeSh0aGlzLCBtYXBwZXIsIGNvbnRleHQpO1xuICAgICAgaWYgKCF0aGlzLl91c2VLZXlzKSB7XG4gICAgICAgIG1hcHBlZFNlcXVlbmNlLnZhbHVlU2VxID0gZnVuY3Rpb24oKSAge3JldHVybiB0aGlzJDAuX2l0ZXIudG9TZXEoKS5tYXAobWFwcGVyLCBjb250ZXh0KX07XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFwcGVkU2VxdWVuY2U7XG4gICAgfTtcblxuICAgIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHZhciBpaTtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLl9faXRlcmF0ZShcbiAgICAgICAgdGhpcy5fdXNlS2V5cyA/XG4gICAgICAgICAgZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gZm4odiwgaywgdGhpcyQwKX0gOlxuICAgICAgICAgICgoaWkgPSByZXZlcnNlID8gcmVzb2x2ZVNpemUodGhpcykgOiAwKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKHYgKSB7cmV0dXJuIGZuKHYsIHJldmVyc2UgPyAtLWlpIDogaWkrKywgdGhpcyQwKX0pLFxuICAgICAgICByZXZlcnNlXG4gICAgICApO1xuICAgIH07XG5cbiAgICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICBpZiAodGhpcy5fdXNlS2V5cykge1xuICAgICAgICByZXR1cm4gdGhpcy5faXRlci5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5faXRlci5fX2l0ZXJhdG9yKElURVJBVEVfVkFMVUVTLCByZXZlcnNlKTtcbiAgICAgIHZhciBpaSA9IHJldmVyc2UgPyByZXNvbHZlU2l6ZSh0aGlzKSA6IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIHJldHVybiBzdGVwLmRvbmUgPyBzdGVwIDpcbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIHJldmVyc2UgPyAtLWlpIDogaWkrKywgc3RlcC52YWx1ZSwgc3RlcCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGVbSVNfT1JERVJFRF9TRU5USU5FTF0gPSB0cnVlO1xuXG5cbiAgY3JlYXRlQ2xhc3MoVG9JbmRleGVkU2VxdWVuY2UsIEluZGV4ZWRTZXEpO1xuICAgIGZ1bmN0aW9uIFRvSW5kZXhlZFNlcXVlbmNlKGl0ZXIpIHtcbiAgICAgIHRoaXMuX2l0ZXIgPSBpdGVyO1xuICAgICAgdGhpcy5zaXplID0gaXRlci5zaXplO1xuICAgIH1cblxuICAgIFRvSW5kZXhlZFNlcXVlbmNlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXRlci5jb250YWlucyh2YWx1ZSk7XG4gICAgfTtcblxuICAgIFRvSW5kZXhlZFNlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZXIuX19pdGVyYXRlKGZ1bmN0aW9uKHYgKSB7cmV0dXJuIGZuKHYsIGl0ZXJhdGlvbnMrKywgdGhpcyQwKX0sIHJldmVyc2UpO1xuICAgIH07XG5cbiAgICBUb0luZGV4ZWRTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX2l0ZXIuX19pdGVyYXRvcihJVEVSQVRFX1ZBTFVFUywgcmV2ZXJzZSk7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIHJldHVybiBzdGVwLmRvbmUgPyBzdGVwIDpcbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIGl0ZXJhdGlvbnMrKywgc3RlcC52YWx1ZSwgc3RlcClcbiAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gIGNyZWF0ZUNsYXNzKFRvU2V0U2VxdWVuY2UsIFNldFNlcSk7XG4gICAgZnVuY3Rpb24gVG9TZXRTZXF1ZW5jZShpdGVyKSB7XG4gICAgICB0aGlzLl9pdGVyID0gaXRlcjtcbiAgICAgIHRoaXMuc2l6ZSA9IGl0ZXIuc2l6ZTtcbiAgICB9XG5cbiAgICBUb1NldFNlcXVlbmNlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLmNvbnRhaW5zKGtleSk7XG4gICAgfTtcblxuICAgIFRvU2V0U2VxdWVuY2UucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcy5faXRlci5fX2l0ZXJhdGUoZnVuY3Rpb24odiApIHtyZXR1cm4gZm4odiwgdiwgdGhpcyQwKX0sIHJldmVyc2UpO1xuICAgIH07XG5cbiAgICBUb1NldFNlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5faXRlci5fX2l0ZXJhdG9yKElURVJBVEVfVkFMVUVTLCByZXZlcnNlKTtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgcmV0dXJuIHN0ZXAuZG9uZSA/IHN0ZXAgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgc3RlcC52YWx1ZSwgc3RlcC52YWx1ZSwgc3RlcCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG5cblxuICBjcmVhdGVDbGFzcyhGcm9tRW50cmllc1NlcXVlbmNlLCBLZXllZFNlcSk7XG4gICAgZnVuY3Rpb24gRnJvbUVudHJpZXNTZXF1ZW5jZShlbnRyaWVzKSB7XG4gICAgICB0aGlzLl9pdGVyID0gZW50cmllcztcbiAgICAgIHRoaXMuc2l6ZSA9IGVudHJpZXMuc2l6ZTtcbiAgICB9XG5cbiAgICBGcm9tRW50cmllc1NlcXVlbmNlLnByb3RvdHlwZS5lbnRyeVNlcSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2l0ZXIudG9TZXEoKTtcbiAgICB9O1xuXG4gICAgRnJvbUVudHJpZXNTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLl9pdGVyLl9faXRlcmF0ZShmdW5jdGlvbihlbnRyeSApIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgZW50cnkgZXhpc3RzIGZpcnN0IHNvIGFycmF5IGFjY2VzcyBkb2Vzbid0IHRocm93IGZvciBob2xlc1xuICAgICAgICAvLyBpbiB0aGUgcGFyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgdmFsaWRhdGVFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIGZuKGVudHJ5WzFdLCBlbnRyeVswXSwgdGhpcyQwKTtcbiAgICAgICAgfVxuICAgICAgfSwgcmV2ZXJzZSk7XG4gICAgfTtcblxuICAgIEZyb21FbnRyaWVzU2VxdWVuY2UucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLl9pdGVyLl9faXRlcmF0b3IoSVRFUkFURV9WQUxVRVMsIHJldmVyc2UpO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZW50cnkgZXhpc3RzIGZpcnN0IHNvIGFycmF5IGFjY2VzcyBkb2Vzbid0IHRocm93IGZvciBob2xlc1xuICAgICAgICAgIC8vIGluIHRoZSBwYXJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICAgICAgdmFsaWRhdGVFbnRyeShlbnRyeSk7XG4gICAgICAgICAgICByZXR1cm4gdHlwZSA9PT0gSVRFUkFURV9FTlRSSUVTID8gc3RlcCA6XG4gICAgICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgZW50cnlbMF0sIGVudHJ5WzFdLCBzdGVwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cblxuICBUb0luZGV4ZWRTZXF1ZW5jZS5wcm90b3R5cGUuY2FjaGVSZXN1bHQgPVxuICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLmNhY2hlUmVzdWx0ID1cbiAgVG9TZXRTZXF1ZW5jZS5wcm90b3R5cGUuY2FjaGVSZXN1bHQgPVxuICBGcm9tRW50cmllc1NlcXVlbmNlLnByb3RvdHlwZS5jYWNoZVJlc3VsdCA9XG4gICAgY2FjaGVSZXN1bHRUaHJvdWdoO1xuXG5cbiAgZnVuY3Rpb24gZmxpcEZhY3RvcnkoaXRlcmFibGUpIHtcbiAgICB2YXIgZmxpcFNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGl0ZXJhYmxlKTtcbiAgICBmbGlwU2VxdWVuY2UuX2l0ZXIgPSBpdGVyYWJsZTtcbiAgICBmbGlwU2VxdWVuY2Uuc2l6ZSA9IGl0ZXJhYmxlLnNpemU7XG4gICAgZmxpcFNlcXVlbmNlLmZsaXAgPSBmdW5jdGlvbigpICB7cmV0dXJuIGl0ZXJhYmxlfTtcbiAgICBmbGlwU2VxdWVuY2UucmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXZlcnNlZFNlcXVlbmNlID0gaXRlcmFibGUucmV2ZXJzZS5hcHBseSh0aGlzKTsgLy8gc3VwZXIucmV2ZXJzZSgpXG4gICAgICByZXZlcnNlZFNlcXVlbmNlLmZsaXAgPSBmdW5jdGlvbigpICB7cmV0dXJuIGl0ZXJhYmxlLnJldmVyc2UoKX07XG4gICAgICByZXR1cm4gcmV2ZXJzZWRTZXF1ZW5jZTtcbiAgICB9O1xuICAgIGZsaXBTZXF1ZW5jZS5oYXMgPSBmdW5jdGlvbihrZXkgKSB7cmV0dXJuIGl0ZXJhYmxlLmNvbnRhaW5zKGtleSl9O1xuICAgIGZsaXBTZXF1ZW5jZS5jb250YWlucyA9IGZ1bmN0aW9uKGtleSApIHtyZXR1cm4gaXRlcmFibGUuaGFzKGtleSl9O1xuICAgIGZsaXBTZXF1ZW5jZS5jYWNoZVJlc3VsdCA9IGNhY2hlUmVzdWx0VGhyb3VnaDtcbiAgICBmbGlwU2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiBpdGVyYWJsZS5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gZm4oaywgdiwgdGhpcyQwKSAhPT0gZmFsc2V9LCByZXZlcnNlKTtcbiAgICB9XG4gICAgZmxpcFNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIGlmICh0eXBlID09PSBJVEVSQVRFX0VOVFJJRVMpIHtcbiAgICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmFibGUuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgaWYgKCFzdGVwLmRvbmUpIHtcbiAgICAgICAgICAgIHZhciBrID0gc3RlcC52YWx1ZVswXTtcbiAgICAgICAgICAgIHN0ZXAudmFsdWVbMF0gPSBzdGVwLnZhbHVlWzFdO1xuICAgICAgICAgICAgc3RlcC52YWx1ZVsxXSA9IGs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYWJsZS5fX2l0ZXJhdG9yKFxuICAgICAgICB0eXBlID09PSBJVEVSQVRFX1ZBTFVFUyA/IElURVJBVEVfS0VZUyA6IElURVJBVEVfVkFMVUVTLFxuICAgICAgICByZXZlcnNlXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gZmxpcFNlcXVlbmNlO1xuICB9XG5cblxuICBmdW5jdGlvbiBtYXBGYWN0b3J5KGl0ZXJhYmxlLCBtYXBwZXIsIGNvbnRleHQpIHtcbiAgICB2YXIgbWFwcGVkU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoaXRlcmFibGUpO1xuICAgIG1hcHBlZFNlcXVlbmNlLnNpemUgPSBpdGVyYWJsZS5zaXplO1xuICAgIG1hcHBlZFNlcXVlbmNlLmhhcyA9IGZ1bmN0aW9uKGtleSApIHtyZXR1cm4gaXRlcmFibGUuaGFzKGtleSl9O1xuICAgIG1hcHBlZFNlcXVlbmNlLmdldCA9IGZ1bmN0aW9uKGtleSwgbm90U2V0VmFsdWUpICB7XG4gICAgICB2YXIgdiA9IGl0ZXJhYmxlLmdldChrZXksIE5PVF9TRVQpO1xuICAgICAgcmV0dXJuIHYgPT09IE5PVF9TRVQgP1xuICAgICAgICBub3RTZXRWYWx1ZSA6XG4gICAgICAgIG1hcHBlci5jYWxsKGNvbnRleHQsIHYsIGtleSwgaXRlcmFibGUpO1xuICAgIH07XG4gICAgbWFwcGVkU2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiBpdGVyYWJsZS5fX2l0ZXJhdGUoXG4gICAgICAgIGZ1bmN0aW9uKHYsIGssIGMpICB7cmV0dXJuIGZuKG1hcHBlci5jYWxsKGNvbnRleHQsIHYsIGssIGMpLCBrLCB0aGlzJDApICE9PSBmYWxzZX0sXG4gICAgICAgIHJldmVyc2VcbiAgICAgICk7XG4gICAgfVxuICAgIG1hcHBlZFNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uICh0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYWJsZS5fX2l0ZXJhdG9yKElURVJBVEVfRU5UUklFUywgcmV2ZXJzZSk7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChzdGVwLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZW50cnkgPSBzdGVwLnZhbHVlO1xuICAgICAgICB2YXIga2V5ID0gZW50cnlbMF07XG4gICAgICAgIHJldHVybiBpdGVyYXRvclZhbHVlKFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIG1hcHBlci5jYWxsKGNvbnRleHQsIGVudHJ5WzFdLCBrZXksIGl0ZXJhYmxlKSxcbiAgICAgICAgICBzdGVwXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcHBlZFNlcXVlbmNlO1xuICB9XG5cblxuICBmdW5jdGlvbiByZXZlcnNlRmFjdG9yeShpdGVyYWJsZSwgdXNlS2V5cykge1xuICAgIHZhciByZXZlcnNlZFNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGl0ZXJhYmxlKTtcbiAgICByZXZlcnNlZFNlcXVlbmNlLl9pdGVyID0gaXRlcmFibGU7XG4gICAgcmV2ZXJzZWRTZXF1ZW5jZS5zaXplID0gaXRlcmFibGUuc2l6ZTtcbiAgICByZXZlcnNlZFNlcXVlbmNlLnJldmVyc2UgPSBmdW5jdGlvbigpICB7cmV0dXJuIGl0ZXJhYmxlfTtcbiAgICBpZiAoaXRlcmFibGUuZmxpcCkge1xuICAgICAgcmV2ZXJzZWRTZXF1ZW5jZS5mbGlwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZmxpcFNlcXVlbmNlID0gZmxpcEZhY3RvcnkoaXRlcmFibGUpO1xuICAgICAgICBmbGlwU2VxdWVuY2UucmV2ZXJzZSA9IGZ1bmN0aW9uKCkgIHtyZXR1cm4gaXRlcmFibGUuZmxpcCgpfTtcbiAgICAgICAgcmV0dXJuIGZsaXBTZXF1ZW5jZTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldmVyc2VkU2VxdWVuY2UuZ2V0ID0gZnVuY3Rpb24oa2V5LCBub3RTZXRWYWx1ZSkgXG4gICAgICB7cmV0dXJuIGl0ZXJhYmxlLmdldCh1c2VLZXlzID8ga2V5IDogLTEgLSBrZXksIG5vdFNldFZhbHVlKX07XG4gICAgcmV2ZXJzZWRTZXF1ZW5jZS5oYXMgPSBmdW5jdGlvbihrZXkgKVxuICAgICAge3JldHVybiBpdGVyYWJsZS5oYXModXNlS2V5cyA/IGtleSA6IC0xIC0ga2V5KX07XG4gICAgcmV2ZXJzZWRTZXF1ZW5jZS5jb250YWlucyA9IGZ1bmN0aW9uKHZhbHVlICkge3JldHVybiBpdGVyYWJsZS5jb250YWlucyh2YWx1ZSl9O1xuICAgIHJldmVyc2VkU2VxdWVuY2UuY2FjaGVSZXN1bHQgPSBjYWNoZVJlc3VsdFRocm91Z2g7XG4gICAgcmV2ZXJzZWRTZXF1ZW5jZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiBpdGVyYWJsZS5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gZm4odiwgaywgdGhpcyQwKX0sICFyZXZlcnNlKTtcbiAgICB9O1xuICAgIHJldmVyc2VkU2VxdWVuY2UuX19pdGVyYXRvciA9XG4gICAgICBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSAge3JldHVybiBpdGVyYWJsZS5fX2l0ZXJhdG9yKHR5cGUsICFyZXZlcnNlKX07XG4gICAgcmV0dXJuIHJldmVyc2VkU2VxdWVuY2U7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGZpbHRlckZhY3RvcnkoaXRlcmFibGUsIHByZWRpY2F0ZSwgY29udGV4dCwgdXNlS2V5cykge1xuICAgIHZhciBmaWx0ZXJTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShpdGVyYWJsZSk7XG4gICAgaWYgKHVzZUtleXMpIHtcbiAgICAgIGZpbHRlclNlcXVlbmNlLmhhcyA9IGZ1bmN0aW9uKGtleSApIHtcbiAgICAgICAgdmFyIHYgPSBpdGVyYWJsZS5nZXQoa2V5LCBOT1RfU0VUKTtcbiAgICAgICAgcmV0dXJuIHYgIT09IE5PVF9TRVQgJiYgISFwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrZXksIGl0ZXJhYmxlKTtcbiAgICAgIH07XG4gICAgICBmaWx0ZXJTZXF1ZW5jZS5nZXQgPSBmdW5jdGlvbihrZXksIG5vdFNldFZhbHVlKSAge1xuICAgICAgICB2YXIgdiA9IGl0ZXJhYmxlLmdldChrZXksIE5PVF9TRVQpO1xuICAgICAgICByZXR1cm4gdiAhPT0gTk9UX1NFVCAmJiBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrZXksIGl0ZXJhYmxlKSA/XG4gICAgICAgICAgdiA6IG5vdFNldFZhbHVlO1xuICAgICAgfTtcbiAgICB9XG4gICAgZmlsdGVyU2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIGl0ZXJhYmxlLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrLCBjKSAge1xuICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykpIHtcbiAgICAgICAgICBpdGVyYXRpb25zKys7XG4gICAgICAgICAgcmV0dXJuIGZuKHYsIHVzZUtleXMgPyBrIDogaXRlcmF0aW9ucyAtIDEsIHRoaXMkMCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHJldmVyc2UpO1xuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfTtcbiAgICBmaWx0ZXJTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbiAodHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmFibGUuX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMsIHJldmVyc2UpO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICAgICAgdmFyIGtleSA9IGVudHJ5WzBdO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGVudHJ5WzFdO1xuICAgICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5LCBpdGVyYWJsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvclZhbHVlKHR5cGUsIHVzZUtleXMgPyBrZXkgOiBpdGVyYXRpb25zKyssIHZhbHVlLCBzdGVwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZmlsdGVyU2VxdWVuY2U7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGNvdW50QnlGYWN0b3J5KGl0ZXJhYmxlLCBncm91cGVyLCBjb250ZXh0KSB7XG4gICAgdmFyIGdyb3VwcyA9IE1hcCgpLmFzTXV0YWJsZSgpO1xuICAgIGl0ZXJhYmxlLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrKSAge1xuICAgICAgZ3JvdXBzLnVwZGF0ZShcbiAgICAgICAgZ3JvdXBlci5jYWxsKGNvbnRleHQsIHYsIGssIGl0ZXJhYmxlKSxcbiAgICAgICAgMCxcbiAgICAgICAgZnVuY3Rpb24oYSApIHtyZXR1cm4gYSArIDF9XG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiBncm91cHMuYXNJbW11dGFibGUoKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZ3JvdXBCeUZhY3RvcnkoaXRlcmFibGUsIGdyb3VwZXIsIGNvbnRleHQpIHtcbiAgICB2YXIgaXNLZXllZEl0ZXIgPSBpc0tleWVkKGl0ZXJhYmxlKTtcbiAgICB2YXIgZ3JvdXBzID0gKGlzT3JkZXJlZChpdGVyYWJsZSkgPyBPcmRlcmVkTWFwKCkgOiBNYXAoKSkuYXNNdXRhYmxlKCk7XG4gICAgaXRlcmFibGUuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGspICB7XG4gICAgICBncm91cHMudXBkYXRlKFxuICAgICAgICBncm91cGVyLmNhbGwoY29udGV4dCwgdiwgaywgaXRlcmFibGUpLFxuICAgICAgICBmdW5jdGlvbihhICkge3JldHVybiAoYSA9IGEgfHwgW10sIGEucHVzaChpc0tleWVkSXRlciA/IFtrLCB2XSA6IHYpLCBhKX1cbiAgICAgICk7XG4gICAgfSk7XG4gICAgdmFyIGNvZXJjZSA9IGl0ZXJhYmxlQ2xhc3MoaXRlcmFibGUpO1xuICAgIHJldHVybiBncm91cHMubWFwKGZ1bmN0aW9uKGFyciApIHtyZXR1cm4gcmVpZnkoaXRlcmFibGUsIGNvZXJjZShhcnIpKX0pO1xuICB9XG5cblxuICBmdW5jdGlvbiBzbGljZUZhY3RvcnkoaXRlcmFibGUsIGJlZ2luLCBlbmQsIHVzZUtleXMpIHtcbiAgICB2YXIgb3JpZ2luYWxTaXplID0gaXRlcmFibGUuc2l6ZTtcblxuICAgIGlmICh3aG9sZVNsaWNlKGJlZ2luLCBlbmQsIG9yaWdpbmFsU2l6ZSkpIHtcbiAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICB9XG5cbiAgICB2YXIgcmVzb2x2ZWRCZWdpbiA9IHJlc29sdmVCZWdpbihiZWdpbiwgb3JpZ2luYWxTaXplKTtcbiAgICB2YXIgcmVzb2x2ZWRFbmQgPSByZXNvbHZlRW5kKGVuZCwgb3JpZ2luYWxTaXplKTtcblxuICAgIC8vIGJlZ2luIG9yIGVuZCB3aWxsIGJlIE5hTiBpZiB0aGV5IHdlcmUgcHJvdmlkZWQgYXMgbmVnYXRpdmUgbnVtYmVycyBhbmRcbiAgICAvLyB0aGlzIGl0ZXJhYmxlJ3Mgc2l6ZSBpcyB1bmtub3duLiBJbiB0aGF0IGNhc2UsIGNhY2hlIGZpcnN0IHNvIHRoZXJlIGlzXG4gICAgLy8gYSBrbm93biBzaXplLlxuICAgIGlmIChyZXNvbHZlZEJlZ2luICE9PSByZXNvbHZlZEJlZ2luIHx8IHJlc29sdmVkRW5kICE9PSByZXNvbHZlZEVuZCkge1xuICAgICAgcmV0dXJuIHNsaWNlRmFjdG9yeShpdGVyYWJsZS50b1NlcSgpLmNhY2hlUmVzdWx0KCksIGJlZ2luLCBlbmQsIHVzZUtleXMpO1xuICAgIH1cblxuICAgIHZhciBzbGljZVNpemUgPSByZXNvbHZlZEVuZCAtIHJlc29sdmVkQmVnaW47XG4gICAgaWYgKHNsaWNlU2l6ZSA8IDApIHtcbiAgICAgIHNsaWNlU2l6ZSA9IDA7XG4gICAgfVxuXG4gICAgdmFyIHNsaWNlU2VxID0gbWFrZVNlcXVlbmNlKGl0ZXJhYmxlKTtcblxuICAgIHNsaWNlU2VxLnNpemUgPSBzbGljZVNpemUgPT09IDAgPyBzbGljZVNpemUgOiBpdGVyYWJsZS5zaXplICYmIHNsaWNlU2l6ZSB8fCB1bmRlZmluZWQ7XG5cbiAgICBpZiAoIXVzZUtleXMgJiYgaXNTZXEoaXRlcmFibGUpICYmIHNsaWNlU2l6ZSA+PSAwKSB7XG4gICAgICBzbGljZVNlcS5nZXQgPSBmdW5jdGlvbiAoaW5kZXgsIG5vdFNldFZhbHVlKSB7XG4gICAgICAgIGluZGV4ID0gd3JhcEluZGV4KHRoaXMsIGluZGV4KTtcbiAgICAgICAgcmV0dXJuIGluZGV4ID49IDAgJiYgaW5kZXggPCBzbGljZVNpemUgP1xuICAgICAgICAgIGl0ZXJhYmxlLmdldChpbmRleCArIHJlc29sdmVkQmVnaW4sIG5vdFNldFZhbHVlKSA6XG4gICAgICAgICAgbm90U2V0VmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2xpY2VTZXEuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgaWYgKHNsaWNlU2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRlKGZuLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBza2lwcGVkID0gMDtcbiAgICAgIHZhciBpc1NraXBwaW5nID0gdHJ1ZTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIGl0ZXJhYmxlLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrKSAge1xuICAgICAgICBpZiAoIShpc1NraXBwaW5nICYmIChpc1NraXBwaW5nID0gc2tpcHBlZCsrIDwgcmVzb2x2ZWRCZWdpbikpKSB7XG4gICAgICAgICAgaXRlcmF0aW9ucysrO1xuICAgICAgICAgIHJldHVybiBmbih2LCB1c2VLZXlzID8gayA6IGl0ZXJhdGlvbnMgLSAxLCB0aGlzJDApICE9PSBmYWxzZSAmJlxuICAgICAgICAgICAgICAgICBpdGVyYXRpb25zICE9PSBzbGljZVNpemU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfTtcblxuICAgIHNsaWNlU2VxLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIGlmIChzbGljZVNpemUgJiYgcmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICAvLyBEb24ndCBib3RoZXIgaW5zdGFudGlhdGluZyBwYXJlbnQgaXRlcmF0b3IgaWYgdGFraW5nIDAuXG4gICAgICB2YXIgaXRlcmF0b3IgPSBzbGljZVNpemUgJiYgaXRlcmFibGUuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICAgIHZhciBza2lwcGVkID0gMDtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB3aGlsZSAoc2tpcHBlZCsrICE9PSByZXNvbHZlZEJlZ2luKSB7XG4gICAgICAgICAgaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgrK2l0ZXJhdGlvbnMgPiBzbGljZVNpemUpIHtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmICh1c2VLZXlzIHx8IHR5cGUgPT09IElURVJBVEVfVkFMVUVTKSB7XG4gICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gSVRFUkFURV9LRVlTKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucyAtIDEsIHVuZGVmaW5lZCwgc3RlcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucyAtIDEsIHN0ZXAudmFsdWVbMV0sIHN0ZXApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2xpY2VTZXE7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHRha2VXaGlsZUZhY3RvcnkoaXRlcmFibGUsIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciB0YWtlU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoaXRlcmFibGUpO1xuICAgIHRha2VTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICBpdGVyYWJsZS5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaywgYykgXG4gICAgICAgIHtyZXR1cm4gcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykgJiYgKytpdGVyYXRpb25zICYmIGZuKHYsIGssIHRoaXMkMCl9XG4gICAgICApO1xuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfTtcbiAgICB0YWtlU2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXJhdG9yID0gaXRlcmFibGUuX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMsIHJldmVyc2UpO1xuICAgICAgdmFyIGl0ZXJhdGluZyA9IHRydWU7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgaWYgKCFpdGVyYXRpbmcpIHtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChzdGVwLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZW50cnkgPSBzdGVwLnZhbHVlO1xuICAgICAgICB2YXIgayA9IGVudHJ5WzBdO1xuICAgICAgICB2YXIgdiA9IGVudHJ5WzFdO1xuICAgICAgICBpZiAoIXByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHYsIGssIHRoaXMkMCkpIHtcbiAgICAgICAgICBpdGVyYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IElURVJBVEVfRU5UUklFUyA/IHN0ZXAgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgaywgdiwgc3RlcCk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiB0YWtlU2VxdWVuY2U7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHNraXBXaGlsZUZhY3RvcnkoaXRlcmFibGUsIHByZWRpY2F0ZSwgY29udGV4dCwgdXNlS2V5cykge1xuICAgIHZhciBza2lwU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoaXRlcmFibGUpO1xuICAgIHNraXBTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdGUoZm4sIHJldmVyc2UpO1xuICAgICAgfVxuICAgICAgdmFyIGlzU2tpcHBpbmcgPSB0cnVlO1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgaXRlcmFibGUuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGssIGMpICB7XG4gICAgICAgIGlmICghKGlzU2tpcHBpbmcgJiYgKGlzU2tpcHBpbmcgPSBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrLCBjKSkpKSB7XG4gICAgICAgICAgaXRlcmF0aW9ucysrO1xuICAgICAgICAgIHJldHVybiBmbih2LCB1c2VLZXlzID8gayA6IGl0ZXJhdGlvbnMgLSAxLCB0aGlzJDApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgIH07XG4gICAgc2tpcFNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhYmxlLl9faXRlcmF0b3IoSVRFUkFURV9FTlRSSUVTLCByZXZlcnNlKTtcbiAgICAgIHZhciBza2lwcGluZyA9IHRydWU7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgdmFyIHN0ZXAsIGssIHY7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgIGlmIChzdGVwLmRvbmUpIHtcbiAgICAgICAgICAgIGlmICh1c2VLZXlzIHx8IHR5cGUgPT09IElURVJBVEVfVkFMVUVTKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBJVEVSQVRFX0tFWVMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCB1bmRlZmluZWQsIHN0ZXApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCBzdGVwLnZhbHVlWzFdLCBzdGVwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGVudHJ5ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgICBrID0gZW50cnlbMF07XG4gICAgICAgICAgdiA9IGVudHJ5WzFdO1xuICAgICAgICAgIHNraXBwaW5nICYmIChza2lwcGluZyA9IHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHYsIGssIHRoaXMkMCkpO1xuICAgICAgICB9IHdoaWxlIChza2lwcGluZyk7XG4gICAgICAgIHJldHVybiB0eXBlID09PSBJVEVSQVRFX0VOVFJJRVMgPyBzdGVwIDpcbiAgICAgICAgICBpdGVyYXRvclZhbHVlKHR5cGUsIGssIHYsIHN0ZXApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gc2tpcFNlcXVlbmNlO1xuICB9XG5cblxuICBmdW5jdGlvbiBjb25jYXRGYWN0b3J5KGl0ZXJhYmxlLCB2YWx1ZXMpIHtcbiAgICB2YXIgaXNLZXllZEl0ZXJhYmxlID0gaXNLZXllZChpdGVyYWJsZSk7XG4gICAgdmFyIGl0ZXJzID0gW2l0ZXJhYmxlXS5jb25jYXQodmFsdWVzKS5tYXAoZnVuY3Rpb24odiApIHtcbiAgICAgIGlmICghaXNJdGVyYWJsZSh2KSkge1xuICAgICAgICB2ID0gaXNLZXllZEl0ZXJhYmxlID9cbiAgICAgICAgICBrZXllZFNlcUZyb21WYWx1ZSh2KSA6XG4gICAgICAgICAgaW5kZXhlZFNlcUZyb21WYWx1ZShBcnJheS5pc0FycmF5KHYpID8gdiA6IFt2XSk7XG4gICAgICB9IGVsc2UgaWYgKGlzS2V5ZWRJdGVyYWJsZSkge1xuICAgICAgICB2ID0gS2V5ZWRJdGVyYWJsZSh2KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2O1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbih2ICkge3JldHVybiB2LnNpemUgIT09IDB9KTtcblxuICAgIGlmIChpdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICB9XG5cbiAgICBpZiAoaXRlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgc2luZ2xldG9uID0gaXRlcnNbMF07XG4gICAgICBpZiAoc2luZ2xldG9uID09PSBpdGVyYWJsZSB8fFxuICAgICAgICAgIGlzS2V5ZWRJdGVyYWJsZSAmJiBpc0tleWVkKHNpbmdsZXRvbikgfHxcbiAgICAgICAgICBpc0luZGV4ZWQoaXRlcmFibGUpICYmIGlzSW5kZXhlZChzaW5nbGV0b24pKSB7XG4gICAgICAgIHJldHVybiBzaW5nbGV0b247XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNvbmNhdFNlcSA9IG5ldyBBcnJheVNlcShpdGVycyk7XG4gICAgaWYgKGlzS2V5ZWRJdGVyYWJsZSkge1xuICAgICAgY29uY2F0U2VxID0gY29uY2F0U2VxLnRvS2V5ZWRTZXEoKTtcbiAgICB9IGVsc2UgaWYgKCFpc0luZGV4ZWQoaXRlcmFibGUpKSB7XG4gICAgICBjb25jYXRTZXEgPSBjb25jYXRTZXEudG9TZXRTZXEoKTtcbiAgICB9XG4gICAgY29uY2F0U2VxID0gY29uY2F0U2VxLmZsYXR0ZW4odHJ1ZSk7XG4gICAgY29uY2F0U2VxLnNpemUgPSBpdGVycy5yZWR1Y2UoXG4gICAgICBmdW5jdGlvbihzdW0sIHNlcSkgIHtcbiAgICAgICAgaWYgKHN1bSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdmFyIHNpemUgPSBzZXEuc2l6ZTtcbiAgICAgICAgICBpZiAoc2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VtICsgc2l6ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAwXG4gICAgKTtcbiAgICByZXR1cm4gY29uY2F0U2VxO1xuICB9XG5cblxuICBmdW5jdGlvbiBmbGF0dGVuRmFjdG9yeShpdGVyYWJsZSwgZGVwdGgsIHVzZUtleXMpIHtcbiAgICB2YXIgZmxhdFNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGl0ZXJhYmxlKTtcbiAgICBmbGF0U2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcbiAgICAgIGZ1bmN0aW9uIGZsYXREZWVwKGl0ZXIsIGN1cnJlbnREZXB0aCkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgICBpdGVyLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrKSAge1xuICAgICAgICAgIGlmICgoIWRlcHRoIHx8IGN1cnJlbnREZXB0aCA8IGRlcHRoKSAmJiBpc0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgICBmbGF0RGVlcCh2LCBjdXJyZW50RGVwdGggKyAxKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGZuKHYsIHVzZUtleXMgPyBrIDogaXRlcmF0aW9ucysrLCB0aGlzJDApID09PSBmYWxzZSkge1xuICAgICAgICAgICAgc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAhc3RvcHBlZDtcbiAgICAgICAgfSwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICBmbGF0RGVlcChpdGVyYWJsZSwgMCk7XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9XG4gICAgZmxhdFNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhYmxlLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB3aGlsZSAoaXRlcmF0b3IpIHtcbiAgICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICBpZiAoc3RlcC5kb25lICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgdiA9IHN0ZXAudmFsdWU7XG4gICAgICAgICAgaWYgKHR5cGUgPT09IElURVJBVEVfRU5UUklFUykge1xuICAgICAgICAgICAgdiA9IHZbMV07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoIWRlcHRoIHx8IHN0YWNrLmxlbmd0aCA8IGRlcHRoKSAmJiBpc0l0ZXJhYmxlKHYpKSB7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGl0ZXJhdG9yKTtcbiAgICAgICAgICAgIGl0ZXJhdG9yID0gdi5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdXNlS2V5cyA/IHN0ZXAgOiBpdGVyYXRvclZhbHVlKHR5cGUsIGl0ZXJhdGlvbnMrKywgdiwgc3RlcCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZmxhdFNlcXVlbmNlO1xuICB9XG5cblxuICBmdW5jdGlvbiBmbGF0TWFwRmFjdG9yeShpdGVyYWJsZSwgbWFwcGVyLCBjb250ZXh0KSB7XG4gICAgdmFyIGNvZXJjZSA9IGl0ZXJhYmxlQ2xhc3MoaXRlcmFibGUpO1xuICAgIHJldHVybiBpdGVyYWJsZS50b1NlcSgpLm1hcChcbiAgICAgIGZ1bmN0aW9uKHYsIGspICB7cmV0dXJuIGNvZXJjZShtYXBwZXIuY2FsbChjb250ZXh0LCB2LCBrLCBpdGVyYWJsZSkpfVxuICAgICkuZmxhdHRlbih0cnVlKTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gaW50ZXJwb3NlRmFjdG9yeShpdGVyYWJsZSwgc2VwYXJhdG9yKSB7XG4gICAgdmFyIGludGVycG9zZWRTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShpdGVyYWJsZSk7XG4gICAgaW50ZXJwb3NlZFNlcXVlbmNlLnNpemUgPSBpdGVyYWJsZS5zaXplICYmIGl0ZXJhYmxlLnNpemUgKiAyIC0xO1xuICAgIGludGVycG9zZWRTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICBpdGVyYWJsZS5fX2l0ZXJhdGUoZnVuY3Rpb24odiwgaykgXG4gICAgICAgIHtyZXR1cm4gKCFpdGVyYXRpb25zIHx8IGZuKHNlcGFyYXRvciwgaXRlcmF0aW9ucysrLCB0aGlzJDApICE9PSBmYWxzZSkgJiZcbiAgICAgICAgZm4odiwgaXRlcmF0aW9ucysrLCB0aGlzJDApICE9PSBmYWxzZX0sXG4gICAgICAgIHJldmVyc2VcbiAgICAgICk7XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuICAgIGludGVycG9zZWRTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYWJsZS5fX2l0ZXJhdG9yKElURVJBVEVfVkFMVUVTLCByZXZlcnNlKTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBzdGVwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIGlmICghc3RlcCB8fCBpdGVyYXRpb25zICUgMikge1xuICAgICAgICAgIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVyYXRpb25zICUgMiA/XG4gICAgICAgICAgaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHNlcGFyYXRvcikgOlxuICAgICAgICAgIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCBzdGVwLnZhbHVlLCBzdGVwKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIGludGVycG9zZWRTZXF1ZW5jZTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gc29ydEZhY3RvcnkoaXRlcmFibGUsIGNvbXBhcmF0b3IsIG1hcHBlcikge1xuICAgIGlmICghY29tcGFyYXRvcikge1xuICAgICAgY29tcGFyYXRvciA9IGRlZmF1bHRDb21wYXJhdG9yO1xuICAgIH1cbiAgICB2YXIgaXNLZXllZEl0ZXJhYmxlID0gaXNLZXllZChpdGVyYWJsZSk7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgZW50cmllcyA9IGl0ZXJhYmxlLnRvU2VxKCkubWFwKFxuICAgICAgZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gW2ssIHYsIGluZGV4KyssIG1hcHBlciA/IG1hcHBlcih2LCBrLCBpdGVyYWJsZSkgOiB2XX1cbiAgICApLnRvQXJyYXkoKTtcbiAgICBlbnRyaWVzLnNvcnQoZnVuY3Rpb24oYSwgYikgIHtyZXR1cm4gY29tcGFyYXRvcihhWzNdLCBiWzNdKSB8fCBhWzJdIC0gYlsyXX0pLmZvckVhY2goXG4gICAgICBpc0tleWVkSXRlcmFibGUgP1xuICAgICAgZnVuY3Rpb24odiwgaSkgIHsgZW50cmllc1tpXS5sZW5ndGggPSAyOyB9IDpcbiAgICAgIGZ1bmN0aW9uKHYsIGkpICB7IGVudHJpZXNbaV0gPSB2WzFdOyB9XG4gICAgKTtcbiAgICByZXR1cm4gaXNLZXllZEl0ZXJhYmxlID8gS2V5ZWRTZXEoZW50cmllcykgOlxuICAgICAgaXNJbmRleGVkKGl0ZXJhYmxlKSA/IEluZGV4ZWRTZXEoZW50cmllcykgOlxuICAgICAgU2V0U2VxKGVudHJpZXMpO1xuICB9XG5cblxuICBmdW5jdGlvbiBtYXhGYWN0b3J5KGl0ZXJhYmxlLCBjb21wYXJhdG9yLCBtYXBwZXIpIHtcbiAgICBpZiAoIWNvbXBhcmF0b3IpIHtcbiAgICAgIGNvbXBhcmF0b3IgPSBkZWZhdWx0Q29tcGFyYXRvcjtcbiAgICB9XG4gICAgaWYgKG1hcHBlcikge1xuICAgICAgdmFyIGVudHJ5ID0gaXRlcmFibGUudG9TZXEoKVxuICAgICAgICAubWFwKGZ1bmN0aW9uKHYsIGspICB7cmV0dXJuIFt2LCBtYXBwZXIodiwgaywgaXRlcmFibGUpXX0pXG4gICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24oYSwgYikgIHtyZXR1cm4gbWF4Q29tcGFyZShjb21wYXJhdG9yLCBhWzFdLCBiWzFdKSA/IGIgOiBhfSk7XG4gICAgICByZXR1cm4gZW50cnkgJiYgZW50cnlbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpdGVyYWJsZS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikgIHtyZXR1cm4gbWF4Q29tcGFyZShjb21wYXJhdG9yLCBhLCBiKSA/IGIgOiBhfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWF4Q29tcGFyZShjb21wYXJhdG9yLCBhLCBiKSB7XG4gICAgdmFyIGNvbXAgPSBjb21wYXJhdG9yKGIsIGEpO1xuICAgIC8vIGIgaXMgY29uc2lkZXJlZCB0aGUgbmV3IG1heCBpZiB0aGUgY29tcGFyYXRvciBkZWNsYXJlcyB0aGVtIGVxdWFsLCBidXRcbiAgICAvLyB0aGV5IGFyZSBub3QgZXF1YWwgYW5kIGIgaXMgaW4gZmFjdCBhIG51bGxpc2ggdmFsdWUuXG4gICAgcmV0dXJuIChjb21wID09PSAwICYmIGIgIT09IGEgJiYgKGIgPT09IHVuZGVmaW5lZCB8fCBiID09PSBudWxsIHx8IGIgIT09IGIpKSB8fCBjb21wID4gMDtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gemlwV2l0aEZhY3Rvcnkoa2V5SXRlciwgemlwcGVyLCBpdGVycykge1xuICAgIHZhciB6aXBTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShrZXlJdGVyKTtcbiAgICB6aXBTZXF1ZW5jZS5zaXplID0gbmV3IEFycmF5U2VxKGl0ZXJzKS5tYXAoZnVuY3Rpb24oaSApIHtyZXR1cm4gaS5zaXplfSkubWluKCk7XG4gICAgLy8gTm90ZTogdGhpcyBhIGdlbmVyaWMgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBfX2l0ZXJhdGUgaW4gdGVybXMgb2ZcbiAgICAvLyBfX2l0ZXJhdG9yIHdoaWNoIG1heSBiZSBtb3JlIGdlbmVyaWNhbGx5IHVzZWZ1bCBpbiB0aGUgZnV0dXJlLlxuICAgIHppcFNlcXVlbmNlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICAvKiBnZW5lcmljOlxuICAgICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5fX2l0ZXJhdG9yKElURVJBVEVfRU5UUklFUywgcmV2ZXJzZSk7XG4gICAgICB2YXIgc3RlcDtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHdoaWxlICghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgaXRlcmF0aW9ucysrO1xuICAgICAgICBpZiAoZm4oc3RlcC52YWx1ZVsxXSwgc3RlcC52YWx1ZVswXSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRpb25zO1xuICAgICAgKi9cbiAgICAgIC8vIGluZGV4ZWQ6XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0aGlzLl9faXRlcmF0b3IoSVRFUkFURV9WQUxVRVMsIHJldmVyc2UpO1xuICAgICAgdmFyIHN0ZXA7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB3aGlsZSAoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKSB7XG4gICAgICAgIGlmIChmbihzdGVwLnZhbHVlLCBpdGVyYXRpb25zKyssIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuICAgIHppcFNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHZhciBpdGVyYXRvcnMgPSBpdGVycy5tYXAoZnVuY3Rpb24oaSApXG4gICAgICAgIHtyZXR1cm4gKGkgPSBJdGVyYWJsZShpKSwgZ2V0SXRlcmF0b3IocmV2ZXJzZSA/IGkucmV2ZXJzZSgpIDogaSkpfVxuICAgICAgKTtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBpc0RvbmUgPSBmYWxzZTtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgc3RlcHM7XG4gICAgICAgIGlmICghaXNEb25lKSB7XG4gICAgICAgICAgc3RlcHMgPSBpdGVyYXRvcnMubWFwKGZ1bmN0aW9uKGkgKSB7cmV0dXJuIGkubmV4dCgpfSk7XG4gICAgICAgICAgaXNEb25lID0gc3RlcHMuc29tZShmdW5jdGlvbihzICkge3JldHVybiBzLmRvbmV9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNEb25lKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yRG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVyYXRvclZhbHVlKFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgaXRlcmF0aW9ucysrLFxuICAgICAgICAgIHppcHBlci5hcHBseShudWxsLCBzdGVwcy5tYXAoZnVuY3Rpb24ocyApIHtyZXR1cm4gcy52YWx1ZX0pKVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gemlwU2VxdWVuY2VcbiAgfVxuXG5cbiAgLy8gI3ByYWdtYSBIZWxwZXIgRnVuY3Rpb25zXG5cbiAgZnVuY3Rpb24gcmVpZnkoaXRlciwgc2VxKSB7XG4gICAgcmV0dXJuIGlzU2VxKGl0ZXIpID8gc2VxIDogaXRlci5jb25zdHJ1Y3RvcihzZXEpO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVFbnRyeShlbnRyeSkge1xuICAgIGlmIChlbnRyeSAhPT0gT2JqZWN0KGVudHJ5KSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgW0ssIFZdIHR1cGxlOiAnICsgZW50cnkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVTaXplKGl0ZXIpIHtcbiAgICBhc3NlcnROb3RJbmZpbml0ZShpdGVyLnNpemUpO1xuICAgIHJldHVybiBlbnN1cmVTaXplKGl0ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXRlcmFibGVDbGFzcyhpdGVyYWJsZSkge1xuICAgIHJldHVybiBpc0tleWVkKGl0ZXJhYmxlKSA/IEtleWVkSXRlcmFibGUgOlxuICAgICAgaXNJbmRleGVkKGl0ZXJhYmxlKSA/IEluZGV4ZWRJdGVyYWJsZSA6XG4gICAgICBTZXRJdGVyYWJsZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VTZXF1ZW5jZShpdGVyYWJsZSkge1xuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKFxuICAgICAgKFxuICAgICAgICBpc0tleWVkKGl0ZXJhYmxlKSA/IEtleWVkU2VxIDpcbiAgICAgICAgaXNJbmRleGVkKGl0ZXJhYmxlKSA/IEluZGV4ZWRTZXEgOlxuICAgICAgICBTZXRTZXFcbiAgICAgICkucHJvdG90eXBlXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhY2hlUmVzdWx0VGhyb3VnaCgpIHtcbiAgICBpZiAodGhpcy5faXRlci5jYWNoZVJlc3VsdCkge1xuICAgICAgdGhpcy5faXRlci5jYWNoZVJlc3VsdCgpO1xuICAgICAgdGhpcy5zaXplID0gdGhpcy5faXRlci5zaXplO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBTZXEucHJvdG90eXBlLmNhY2hlUmVzdWx0LmNhbGwodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGVmYXVsdENvbXBhcmF0b3IoYSwgYikge1xuICAgIHJldHVybiBhID4gYiA/IDEgOiBhIDwgYiA/IC0xIDogMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcmNlSXRlcmF0b3Ioa2V5UGF0aCkge1xuICAgIHZhciBpdGVyID0gZ2V0SXRlcmF0b3Ioa2V5UGF0aCk7XG4gICAgaWYgKCFpdGVyKSB7XG4gICAgICAvLyBBcnJheSBtaWdodCBub3QgYmUgaXRlcmFibGUgaW4gdGhpcyBlbnZpcm9ubWVudCwgc28gd2UgbmVlZCBhIGZhbGxiYWNrXG4gICAgICAvLyB0byBvdXIgd3JhcHBlZCB0eXBlLlxuICAgICAgaWYgKCFpc0FycmF5TGlrZShrZXlQYXRoKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBpdGVyYWJsZSBvciBhcnJheS1saWtlOiAnICsga2V5UGF0aCk7XG4gICAgICB9XG4gICAgICBpdGVyID0gZ2V0SXRlcmF0b3IoSXRlcmFibGUoa2V5UGF0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gaXRlcjtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKE1hcCwgS2V5ZWRDb2xsZWN0aW9uKTtcblxuICAgIC8vIEBwcmFnbWEgQ29uc3RydWN0aW9uXG5cbiAgICBmdW5jdGlvbiBNYXAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZW1wdHlNYXAoKSA6XG4gICAgICAgIGlzTWFwKHZhbHVlKSA/IHZhbHVlIDpcbiAgICAgICAgZW1wdHlNYXAoKS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKG1hcCApIHtcbiAgICAgICAgICB2YXIgaXRlciA9IEtleWVkSXRlcmFibGUodmFsdWUpO1xuICAgICAgICAgIGFzc2VydE5vdEluZmluaXRlKGl0ZXIuc2l6ZSk7XG4gICAgICAgICAgaXRlci5mb3JFYWNoKGZ1bmN0aW9uKHYsIGspICB7cmV0dXJuIG1hcC5zZXQoaywgdil9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgTWFwLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnTWFwIHsnLCAnfScpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIEFjY2Vzc1xuXG4gICAgTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrLCBub3RTZXRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QgP1xuICAgICAgICB0aGlzLl9yb290LmdldCgwLCB1bmRlZmluZWQsIGssIG5vdFNldFZhbHVlKSA6XG4gICAgICAgIG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIE1vZGlmaWNhdGlvblxuXG4gICAgTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrLCB2KSB7XG4gICAgICByZXR1cm4gdXBkYXRlTWFwKHRoaXMsIGssIHYpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLnNldEluID0gZnVuY3Rpb24oa2V5UGF0aCwgdikge1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlSW4oa2V5UGF0aCwgTk9UX1NFVCwgZnVuY3Rpb24oKSAge3JldHVybiB2fSk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaykge1xuICAgICAgcmV0dXJuIHVwZGF0ZU1hcCh0aGlzLCBrLCBOT1RfU0VUKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5kZWxldGVJbiA9IGZ1bmN0aW9uKGtleVBhdGgpIHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUluKGtleVBhdGgsIGZ1bmN0aW9uKCkgIHtyZXR1cm4gTk9UX1NFVH0pO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGssIG5vdFNldFZhbHVlLCB1cGRhdGVyKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/XG4gICAgICAgIGsodGhpcykgOlxuICAgICAgICB0aGlzLnVwZGF0ZUluKFtrXSwgbm90U2V0VmFsdWUsIHVwZGF0ZXIpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLnVwZGF0ZUluID0gZnVuY3Rpb24oa2V5UGF0aCwgbm90U2V0VmFsdWUsIHVwZGF0ZXIpIHtcbiAgICAgIGlmICghdXBkYXRlcikge1xuICAgICAgICB1cGRhdGVyID0gbm90U2V0VmFsdWU7XG4gICAgICAgIG5vdFNldFZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgdmFyIHVwZGF0ZWRWYWx1ZSA9IHVwZGF0ZUluRGVlcE1hcChcbiAgICAgICAgdGhpcyxcbiAgICAgICAgZm9yY2VJdGVyYXRvcihrZXlQYXRoKSxcbiAgICAgICAgbm90U2V0VmFsdWUsXG4gICAgICAgIHVwZGF0ZXJcbiAgICAgICk7XG4gICAgICByZXR1cm4gdXBkYXRlZFZhbHVlID09PSBOT1RfU0VUID8gdW5kZWZpbmVkIDogdXBkYXRlZFZhbHVlO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSBudWxsO1xuICAgICAgICB0aGlzLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbXB0eU1hcCgpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIENvbXBvc2l0aW9uXG5cbiAgICBNYXAucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24oLyouLi5pdGVycyovKSB7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTWFwV2l0aCh0aGlzLCB1bmRlZmluZWQsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUubWVyZ2VXaXRoID0gZnVuY3Rpb24obWVyZ2VyKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTWFwV2l0aCh0aGlzLCBtZXJnZXIsIGl0ZXJzKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5tZXJnZUluID0gZnVuY3Rpb24oa2V5UGF0aCkge3ZhciBpdGVycyA9IFNMSUNFJDAuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlSW4oa2V5UGF0aCwgZW1wdHlNYXAoKSwgZnVuY3Rpb24obSApIHtyZXR1cm4gbS5tZXJnZS5hcHBseShtLCBpdGVycyl9KTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5tZXJnZURlZXAgPSBmdW5jdGlvbigvKi4uLml0ZXJzKi8pIHtcbiAgICAgIHJldHVybiBtZXJnZUludG9NYXBXaXRoKHRoaXMsIGRlZXBNZXJnZXIodW5kZWZpbmVkKSwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5tZXJnZURlZXBXaXRoID0gZnVuY3Rpb24obWVyZ2VyKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTWFwV2l0aCh0aGlzLCBkZWVwTWVyZ2VyKG1lcmdlciksIGl0ZXJzKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5tZXJnZURlZXBJbiA9IGZ1bmN0aW9uKGtleVBhdGgpIHt2YXIgaXRlcnMgPSBTTElDRSQwLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUluKGtleVBhdGgsIGVtcHR5TWFwKCksIGZ1bmN0aW9uKG0gKSB7cmV0dXJuIG0ubWVyZ2VEZWVwLmFwcGx5KG0sIGl0ZXJzKX0pO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLnNvcnQgPSBmdW5jdGlvbihjb21wYXJhdG9yKSB7XG4gICAgICAvLyBMYXRlIGJpbmRpbmdcbiAgICAgIHJldHVybiBPcmRlcmVkTWFwKHNvcnRGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IpKTtcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5zb3J0QnkgPSBmdW5jdGlvbihtYXBwZXIsIGNvbXBhcmF0b3IpIHtcbiAgICAgIC8vIExhdGUgYmluZGluZ1xuICAgICAgcmV0dXJuIE9yZGVyZWRNYXAoc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvciwgbWFwcGVyKSk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgTXV0YWJpbGl0eVxuXG4gICAgTWFwLnByb3RvdHlwZS53aXRoTXV0YXRpb25zID0gZnVuY3Rpb24oZm4pIHtcbiAgICAgIHZhciBtdXRhYmxlID0gdGhpcy5hc011dGFibGUoKTtcbiAgICAgIGZuKG11dGFibGUpO1xuICAgICAgcmV0dXJuIG11dGFibGUud2FzQWx0ZXJlZCgpID8gbXV0YWJsZS5fX2Vuc3VyZU93bmVyKHRoaXMuX19vd25lcklEKSA6IHRoaXM7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUuYXNNdXRhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX293bmVySUQgPyB0aGlzIDogdGhpcy5fX2Vuc3VyZU93bmVyKG5ldyBPd25lcklEKCkpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLmFzSW1tdXRhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2Vuc3VyZU93bmVyKCk7XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUud2FzQWx0ZXJlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19hbHRlcmVkO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICByZXR1cm4gbmV3IE1hcEl0ZXJhdG9yKHRoaXMsIHR5cGUsIHJldmVyc2UpO1xuICAgIH07XG5cbiAgICBNYXAucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7dmFyIHRoaXMkMCA9IHRoaXM7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB0aGlzLl9yb290ICYmIHRoaXMuX3Jvb3QuaXRlcmF0ZShmdW5jdGlvbihlbnRyeSApIHtcbiAgICAgICAgaXRlcmF0aW9ucysrO1xuICAgICAgICByZXR1cm4gZm4oZW50cnlbMV0sIGVudHJ5WzBdLCB0aGlzJDApO1xuICAgICAgfSwgcmV2ZXJzZSk7XG4gICAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICB9O1xuXG4gICAgTWFwLnByb3RvdHlwZS5fX2Vuc3VyZU93bmVyID0gZnVuY3Rpb24ob3duZXJJRCkge1xuICAgICAgaWYgKG93bmVySUQgPT09IHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKCFvd25lcklEKSB7XG4gICAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgICAgdGhpcy5fX2FsdGVyZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFrZU1hcCh0aGlzLnNpemUsIHRoaXMuX3Jvb3QsIG93bmVySUQsIHRoaXMuX19oYXNoKTtcbiAgICB9O1xuXG5cbiAgZnVuY3Rpb24gaXNNYXAobWF5YmVNYXApIHtcbiAgICByZXR1cm4gISEobWF5YmVNYXAgJiYgbWF5YmVNYXBbSVNfTUFQX1NFTlRJTkVMXSk7XG4gIH1cblxuICBNYXAuaXNNYXAgPSBpc01hcDtcblxuICB2YXIgSVNfTUFQX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfTUFQX19AQCc7XG5cbiAgdmFyIE1hcFByb3RvdHlwZSA9IE1hcC5wcm90b3R5cGU7XG4gIE1hcFByb3RvdHlwZVtJU19NQVBfU0VOVElORUxdID0gdHJ1ZTtcbiAgTWFwUHJvdG90eXBlW0RFTEVURV0gPSBNYXBQcm90b3R5cGUucmVtb3ZlO1xuICBNYXBQcm90b3R5cGUucmVtb3ZlSW4gPSBNYXBQcm90b3R5cGUuZGVsZXRlSW47XG5cblxuICAvLyAjcHJhZ21hIFRyaWUgTm9kZXNcblxuXG5cbiAgICBmdW5jdGlvbiBBcnJheU1hcE5vZGUob3duZXJJRCwgZW50cmllcykge1xuICAgICAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgICAgIHRoaXMuZW50cmllcyA9IGVudHJpZXM7XG4gICAgfVxuXG4gICAgQXJyYXlNYXBOb2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihzaGlmdCwga2V5SGFzaCwga2V5LCBub3RTZXRWYWx1ZSkge1xuICAgICAgdmFyIGVudHJpZXMgPSB0aGlzLmVudHJpZXM7XG4gICAgICBmb3IgKHZhciBpaSA9IDAsIGxlbiA9IGVudHJpZXMubGVuZ3RoOyBpaSA8IGxlbjsgaWkrKykge1xuICAgICAgICBpZiAoaXMoa2V5LCBlbnRyaWVzW2lpXVswXSkpIHtcbiAgICAgICAgICByZXR1cm4gZW50cmllc1tpaV1bMV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBub3RTZXRWYWx1ZTtcbiAgICB9O1xuXG4gICAgQXJyYXlNYXBOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihvd25lcklELCBzaGlmdCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpIHtcbiAgICAgIHZhciByZW1vdmVkID0gdmFsdWUgPT09IE5PVF9TRVQ7XG5cbiAgICAgIHZhciBlbnRyaWVzID0gdGhpcy5lbnRyaWVzO1xuICAgICAgdmFyIGlkeCA9IDA7XG4gICAgICBmb3IgKHZhciBsZW4gPSBlbnRyaWVzLmxlbmd0aDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgICAgICBpZiAoaXMoa2V5LCBlbnRyaWVzW2lkeF1bMF0pKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBleGlzdHMgPSBpZHggPCBsZW47XG5cbiAgICAgIGlmIChleGlzdHMgPyBlbnRyaWVzW2lkeF1bMV0gPT09IHZhbHVlIDogcmVtb3ZlZCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgU2V0UmVmKGRpZEFsdGVyKTtcbiAgICAgIChyZW1vdmVkIHx8ICFleGlzdHMpICYmIFNldFJlZihkaWRDaGFuZ2VTaXplKTtcblxuICAgICAgaWYgKHJlbW92ZWQgJiYgZW50cmllcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuOyAvLyB1bmRlZmluZWRcbiAgICAgIH1cblxuICAgICAgaWYgKCFleGlzdHMgJiYgIXJlbW92ZWQgJiYgZW50cmllcy5sZW5ndGggPj0gTUFYX0FSUkFZX01BUF9TSVpFKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVOb2Rlcyhvd25lcklELCBlbnRyaWVzLCBrZXksIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGlzRWRpdGFibGUgPSBvd25lcklEICYmIG93bmVySUQgPT09IHRoaXMub3duZXJJRDtcbiAgICAgIHZhciBuZXdFbnRyaWVzID0gaXNFZGl0YWJsZSA/IGVudHJpZXMgOiBhcnJDb3B5KGVudHJpZXMpO1xuXG4gICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgICAgaWR4ID09PSBsZW4gLSAxID8gbmV3RW50cmllcy5wb3AoKSA6IChuZXdFbnRyaWVzW2lkeF0gPSBuZXdFbnRyaWVzLnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdFbnRyaWVzW2lkeF0gPSBba2V5LCB2YWx1ZV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0VudHJpZXMucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFZGl0YWJsZSkge1xuICAgICAgICB0aGlzLmVudHJpZXMgPSBuZXdFbnRyaWVzO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBBcnJheU1hcE5vZGUob3duZXJJRCwgbmV3RW50cmllcyk7XG4gICAgfTtcblxuXG5cblxuICAgIGZ1bmN0aW9uIEJpdG1hcEluZGV4ZWROb2RlKG93bmVySUQsIGJpdG1hcCwgbm9kZXMpIHtcbiAgICAgIHRoaXMub3duZXJJRCA9IG93bmVySUQ7XG4gICAgICB0aGlzLmJpdG1hcCA9IGJpdG1hcDtcbiAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcbiAgICB9XG5cbiAgICBCaXRtYXBJbmRleGVkTm9kZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oc2hpZnQsIGtleUhhc2gsIGtleSwgbm90U2V0VmFsdWUpIHtcbiAgICAgIGlmIChrZXlIYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5SGFzaCA9IGhhc2goa2V5KTtcbiAgICAgIH1cbiAgICAgIHZhciBiaXQgPSAoMSA8PCAoKHNoaWZ0ID09PSAwID8ga2V5SGFzaCA6IGtleUhhc2ggPj4+IHNoaWZ0KSAmIE1BU0spKTtcbiAgICAgIHZhciBiaXRtYXAgPSB0aGlzLmJpdG1hcDtcbiAgICAgIHJldHVybiAoYml0bWFwICYgYml0KSA9PT0gMCA/IG5vdFNldFZhbHVlIDpcbiAgICAgICAgdGhpcy5ub2Rlc1twb3BDb3VudChiaXRtYXAgJiAoYml0IC0gMSkpXS5nZXQoc2hpZnQgKyBTSElGVCwga2V5SGFzaCwga2V5LCBub3RTZXRWYWx1ZSk7XG4gICAgfTtcblxuICAgIEJpdG1hcEluZGV4ZWROb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihvd25lcklELCBzaGlmdCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpIHtcbiAgICAgIGlmIChrZXlIYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5SGFzaCA9IGhhc2goa2V5KTtcbiAgICAgIH1cbiAgICAgIHZhciBrZXlIYXNoRnJhZyA9IChzaGlmdCA9PT0gMCA/IGtleUhhc2ggOiBrZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLO1xuICAgICAgdmFyIGJpdCA9IDEgPDwga2V5SGFzaEZyYWc7XG4gICAgICB2YXIgYml0bWFwID0gdGhpcy5iaXRtYXA7XG4gICAgICB2YXIgZXhpc3RzID0gKGJpdG1hcCAmIGJpdCkgIT09IDA7XG5cbiAgICAgIGlmICghZXhpc3RzICYmIHZhbHVlID09PSBOT1RfU0VUKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgaWR4ID0gcG9wQ291bnQoYml0bWFwICYgKGJpdCAtIDEpKTtcbiAgICAgIHZhciBub2RlcyA9IHRoaXMubm9kZXM7XG4gICAgICB2YXIgbm9kZSA9IGV4aXN0cyA/IG5vZGVzW2lkeF0gOiB1bmRlZmluZWQ7XG4gICAgICB2YXIgbmV3Tm9kZSA9IHVwZGF0ZU5vZGUobm9kZSwgb3duZXJJRCwgc2hpZnQgKyBTSElGVCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpO1xuXG4gICAgICBpZiAobmV3Tm9kZSA9PT0gbm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgaWYgKCFleGlzdHMgJiYgbmV3Tm9kZSAmJiBub2Rlcy5sZW5ndGggPj0gTUFYX0JJVE1BUF9JTkRFWEVEX1NJWkUpIHtcbiAgICAgICAgcmV0dXJuIGV4cGFuZE5vZGVzKG93bmVySUQsIG5vZGVzLCBiaXRtYXAsIGtleUhhc2hGcmFnLCBuZXdOb2RlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0cyAmJiAhbmV3Tm9kZSAmJiBub2Rlcy5sZW5ndGggPT09IDIgJiYgaXNMZWFmTm9kZShub2Rlc1tpZHggXiAxXSkpIHtcbiAgICAgICAgcmV0dXJuIG5vZGVzW2lkeCBeIDFdO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3RzICYmIG5ld05vZGUgJiYgbm9kZXMubGVuZ3RoID09PSAxICYmIGlzTGVhZk5vZGUobmV3Tm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ld05vZGU7XG4gICAgICB9XG5cbiAgICAgIHZhciBpc0VkaXRhYmxlID0gb3duZXJJRCAmJiBvd25lcklEID09PSB0aGlzLm93bmVySUQ7XG4gICAgICB2YXIgbmV3Qml0bWFwID0gZXhpc3RzID8gbmV3Tm9kZSA/IGJpdG1hcCA6IGJpdG1hcCBeIGJpdCA6IGJpdG1hcCB8IGJpdDtcbiAgICAgIHZhciBuZXdOb2RlcyA9IGV4aXN0cyA/IG5ld05vZGUgP1xuICAgICAgICBzZXRJbihub2RlcywgaWR4LCBuZXdOb2RlLCBpc0VkaXRhYmxlKSA6XG4gICAgICAgIHNwbGljZU91dChub2RlcywgaWR4LCBpc0VkaXRhYmxlKSA6XG4gICAgICAgIHNwbGljZUluKG5vZGVzLCBpZHgsIG5ld05vZGUsIGlzRWRpdGFibGUpO1xuXG4gICAgICBpZiAoaXNFZGl0YWJsZSkge1xuICAgICAgICB0aGlzLmJpdG1hcCA9IG5ld0JpdG1hcDtcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5ld05vZGVzO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBCaXRtYXBJbmRleGVkTm9kZShvd25lcklELCBuZXdCaXRtYXAsIG5ld05vZGVzKTtcbiAgICB9O1xuXG5cblxuXG4gICAgZnVuY3Rpb24gSGFzaEFycmF5TWFwTm9kZShvd25lcklELCBjb3VudCwgbm9kZXMpIHtcbiAgICAgIHRoaXMub3duZXJJRCA9IG93bmVySUQ7XG4gICAgICB0aGlzLmNvdW50ID0gY291bnQ7XG4gICAgICB0aGlzLm5vZGVzID0gbm9kZXM7XG4gICAgfVxuXG4gICAgSGFzaEFycmF5TWFwTm9kZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oc2hpZnQsIGtleUhhc2gsIGtleSwgbm90U2V0VmFsdWUpIHtcbiAgICAgIGlmIChrZXlIYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5SGFzaCA9IGhhc2goa2V5KTtcbiAgICAgIH1cbiAgICAgIHZhciBpZHggPSAoc2hpZnQgPT09IDAgPyBrZXlIYXNoIDoga2V5SGFzaCA+Pj4gc2hpZnQpICYgTUFTSztcbiAgICAgIHZhciBub2RlID0gdGhpcy5ub2Rlc1tpZHhdO1xuICAgICAgcmV0dXJuIG5vZGUgPyBub2RlLmdldChzaGlmdCArIFNISUZULCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKSA6IG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICBIYXNoQXJyYXlNYXBOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihvd25lcklELCBzaGlmdCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpIHtcbiAgICAgIGlmIChrZXlIYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAga2V5SGFzaCA9IGhhc2goa2V5KTtcbiAgICAgIH1cbiAgICAgIHZhciBpZHggPSAoc2hpZnQgPT09IDAgPyBrZXlIYXNoIDoga2V5SGFzaCA+Pj4gc2hpZnQpICYgTUFTSztcbiAgICAgIHZhciByZW1vdmVkID0gdmFsdWUgPT09IE5PVF9TRVQ7XG4gICAgICB2YXIgbm9kZXMgPSB0aGlzLm5vZGVzO1xuICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpZHhdO1xuXG4gICAgICBpZiAocmVtb3ZlZCAmJiAhbm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIG5ld05vZGUgPSB1cGRhdGVOb2RlKG5vZGUsIG93bmVySUQsIHNoaWZ0ICsgU0hJRlQsIGtleUhhc2gsIGtleSwgdmFsdWUsIGRpZENoYW5nZVNpemUsIGRpZEFsdGVyKTtcbiAgICAgIGlmIChuZXdOb2RlID09PSBub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmV3Q291bnQgPSB0aGlzLmNvdW50O1xuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIG5ld0NvdW50Kys7XG4gICAgICB9IGVsc2UgaWYgKCFuZXdOb2RlKSB7XG4gICAgICAgIG5ld0NvdW50LS07XG4gICAgICAgIGlmIChuZXdDb3VudCA8IE1JTl9IQVNIX0FSUkFZX01BUF9TSVpFKSB7XG4gICAgICAgICAgcmV0dXJuIHBhY2tOb2Rlcyhvd25lcklELCBub2RlcywgbmV3Q291bnQsIGlkeCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGlzRWRpdGFibGUgPSBvd25lcklEICYmIG93bmVySUQgPT09IHRoaXMub3duZXJJRDtcbiAgICAgIHZhciBuZXdOb2RlcyA9IHNldEluKG5vZGVzLCBpZHgsIG5ld05vZGUsIGlzRWRpdGFibGUpO1xuXG4gICAgICBpZiAoaXNFZGl0YWJsZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gbmV3Q291bnQ7XG4gICAgICAgIHRoaXMubm9kZXMgPSBuZXdOb2RlcztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgSGFzaEFycmF5TWFwTm9kZShvd25lcklELCBuZXdDb3VudCwgbmV3Tm9kZXMpO1xuICAgIH07XG5cblxuXG5cbiAgICBmdW5jdGlvbiBIYXNoQ29sbGlzaW9uTm9kZShvd25lcklELCBrZXlIYXNoLCBlbnRyaWVzKSB7XG4gICAgICB0aGlzLm93bmVySUQgPSBvd25lcklEO1xuICAgICAgdGhpcy5rZXlIYXNoID0ga2V5SGFzaDtcbiAgICAgIHRoaXMuZW50cmllcyA9IGVudHJpZXM7XG4gICAgfVxuXG4gICAgSGFzaENvbGxpc2lvbk5vZGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKHNoaWZ0LCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKSB7XG4gICAgICB2YXIgZW50cmllcyA9IHRoaXMuZW50cmllcztcbiAgICAgIGZvciAodmFyIGlpID0gMCwgbGVuID0gZW50cmllcy5sZW5ndGg7IGlpIDwgbGVuOyBpaSsrKSB7XG4gICAgICAgIGlmIChpcyhrZXksIGVudHJpZXNbaWldWzBdKSkge1xuICAgICAgICAgIHJldHVybiBlbnRyaWVzW2lpXVsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICBIYXNoQ29sbGlzaW9uTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ob3duZXJJRCwgc2hpZnQsIGtleUhhc2gsIGtleSwgdmFsdWUsIGRpZENoYW5nZVNpemUsIGRpZEFsdGVyKSB7XG4gICAgICBpZiAoa2V5SGFzaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGtleUhhc2ggPSBoYXNoKGtleSk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZW1vdmVkID0gdmFsdWUgPT09IE5PVF9TRVQ7XG5cbiAgICAgIGlmIChrZXlIYXNoICE9PSB0aGlzLmtleUhhc2gpIHtcbiAgICAgICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBTZXRSZWYoZGlkQWx0ZXIpO1xuICAgICAgICBTZXRSZWYoZGlkQ2hhbmdlU2l6ZSk7XG4gICAgICAgIHJldHVybiBtZXJnZUludG9Ob2RlKHRoaXMsIG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBba2V5LCB2YWx1ZV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgZW50cmllcyA9IHRoaXMuZW50cmllcztcbiAgICAgIHZhciBpZHggPSAwO1xuICAgICAgZm9yICh2YXIgbGVuID0gZW50cmllcy5sZW5ndGg7IGlkeCA8IGxlbjsgaWR4KyspIHtcbiAgICAgICAgaWYgKGlzKGtleSwgZW50cmllc1tpZHhdWzBdKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZXhpc3RzID0gaWR4IDwgbGVuO1xuXG4gICAgICBpZiAoZXhpc3RzID8gZW50cmllc1tpZHhdWzFdID09PSB2YWx1ZSA6IHJlbW92ZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIFNldFJlZihkaWRBbHRlcik7XG4gICAgICAocmVtb3ZlZCB8fCAhZXhpc3RzKSAmJiBTZXRSZWYoZGlkQ2hhbmdlU2l6ZSk7XG5cbiAgICAgIGlmIChyZW1vdmVkICYmIGxlbiA9PT0gMikge1xuICAgICAgICByZXR1cm4gbmV3IFZhbHVlTm9kZShvd25lcklELCB0aGlzLmtleUhhc2gsIGVudHJpZXNbaWR4IF4gMV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgaXNFZGl0YWJsZSA9IG93bmVySUQgJiYgb3duZXJJRCA9PT0gdGhpcy5vd25lcklEO1xuICAgICAgdmFyIG5ld0VudHJpZXMgPSBpc0VkaXRhYmxlID8gZW50cmllcyA6IGFyckNvcHkoZW50cmllcyk7XG5cbiAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgICAgICBpZHggPT09IGxlbiAtIDEgPyBuZXdFbnRyaWVzLnBvcCgpIDogKG5ld0VudHJpZXNbaWR4XSA9IG5ld0VudHJpZXMucG9wKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld0VudHJpZXNbaWR4XSA9IFtrZXksIHZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3RW50cmllcy5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0VkaXRhYmxlKSB7XG4gICAgICAgIHRoaXMuZW50cmllcyA9IG5ld0VudHJpZXM7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IEhhc2hDb2xsaXNpb25Ob2RlKG93bmVySUQsIHRoaXMua2V5SGFzaCwgbmV3RW50cmllcyk7XG4gICAgfTtcblxuXG5cblxuICAgIGZ1bmN0aW9uIFZhbHVlTm9kZShvd25lcklELCBrZXlIYXNoLCBlbnRyeSkge1xuICAgICAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgICAgIHRoaXMua2V5SGFzaCA9IGtleUhhc2g7XG4gICAgICB0aGlzLmVudHJ5ID0gZW50cnk7XG4gICAgfVxuXG4gICAgVmFsdWVOb2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihzaGlmdCwga2V5SGFzaCwga2V5LCBub3RTZXRWYWx1ZSkge1xuICAgICAgcmV0dXJuIGlzKGtleSwgdGhpcy5lbnRyeVswXSkgPyB0aGlzLmVudHJ5WzFdIDogbm90U2V0VmFsdWU7XG4gICAgfTtcblxuICAgIFZhbHVlTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ob3duZXJJRCwgc2hpZnQsIGtleUhhc2gsIGtleSwgdmFsdWUsIGRpZENoYW5nZVNpemUsIGRpZEFsdGVyKSB7XG4gICAgICB2YXIgcmVtb3ZlZCA9IHZhbHVlID09PSBOT1RfU0VUO1xuICAgICAgdmFyIGtleU1hdGNoID0gaXMoa2V5LCB0aGlzLmVudHJ5WzBdKTtcbiAgICAgIGlmIChrZXlNYXRjaCA/IHZhbHVlID09PSB0aGlzLmVudHJ5WzFdIDogcmVtb3ZlZCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgU2V0UmVmKGRpZEFsdGVyKTtcblxuICAgICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgICAgU2V0UmVmKGRpZENoYW5nZVNpemUpO1xuICAgICAgICByZXR1cm47IC8vIHVuZGVmaW5lZFxuICAgICAgfVxuXG4gICAgICBpZiAoa2V5TWF0Y2gpIHtcbiAgICAgICAgaWYgKG93bmVySUQgJiYgb3duZXJJRCA9PT0gdGhpcy5vd25lcklEKSB7XG4gICAgICAgICAgdGhpcy5lbnRyeVsxXSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVmFsdWVOb2RlKG93bmVySUQsIHRoaXMua2V5SGFzaCwgW2tleSwgdmFsdWVdKTtcbiAgICAgIH1cblxuICAgICAgU2V0UmVmKGRpZENoYW5nZVNpemUpO1xuICAgICAgcmV0dXJuIG1lcmdlSW50b05vZGUodGhpcywgb3duZXJJRCwgc2hpZnQsIGhhc2goa2V5KSwgW2tleSwgdmFsdWVdKTtcbiAgICB9O1xuXG5cblxuICAvLyAjcHJhZ21hIEl0ZXJhdG9yc1xuXG4gIEFycmF5TWFwTm9kZS5wcm90b3R5cGUuaXRlcmF0ZSA9XG4gIEhhc2hDb2xsaXNpb25Ob2RlLnByb3RvdHlwZS5pdGVyYXRlID0gZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIGVudHJpZXMgPSB0aGlzLmVudHJpZXM7XG4gICAgZm9yICh2YXIgaWkgPSAwLCBtYXhJbmRleCA9IGVudHJpZXMubGVuZ3RoIC0gMTsgaWkgPD0gbWF4SW5kZXg7IGlpKyspIHtcbiAgICAgIGlmIChmbihlbnRyaWVzW3JldmVyc2UgPyBtYXhJbmRleCAtIGlpIDogaWldKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEJpdG1hcEluZGV4ZWROb2RlLnByb3RvdHlwZS5pdGVyYXRlID1cbiAgSGFzaEFycmF5TWFwTm9kZS5wcm90b3R5cGUuaXRlcmF0ZSA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge1xuICAgIHZhciBub2RlcyA9IHRoaXMubm9kZXM7XG4gICAgZm9yICh2YXIgaWkgPSAwLCBtYXhJbmRleCA9IG5vZGVzLmxlbmd0aCAtIDE7IGlpIDw9IG1heEluZGV4OyBpaSsrKSB7XG4gICAgICB2YXIgbm9kZSA9IG5vZGVzW3JldmVyc2UgPyBtYXhJbmRleCAtIGlpIDogaWldO1xuICAgICAgaWYgKG5vZGUgJiYgbm9kZS5pdGVyYXRlKGZuLCByZXZlcnNlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIFZhbHVlTm9kZS5wcm90b3R5cGUuaXRlcmF0ZSA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge1xuICAgIHJldHVybiBmbih0aGlzLmVudHJ5KTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKE1hcEl0ZXJhdG9yLCBJdGVyYXRvcik7XG5cbiAgICBmdW5jdGlvbiBNYXBJdGVyYXRvcihtYXAsIHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICAgICAgdGhpcy5fcmV2ZXJzZSA9IHJldmVyc2U7XG4gICAgICB0aGlzLl9zdGFjayA9IG1hcC5fcm9vdCAmJiBtYXBJdGVyYXRvckZyYW1lKG1hcC5fcm9vdCk7XG4gICAgfVxuXG4gICAgTWFwSXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICAgIHZhciBzdGFjayA9IHRoaXMuX3N0YWNrO1xuICAgICAgd2hpbGUgKHN0YWNrKSB7XG4gICAgICAgIHZhciBub2RlID0gc3RhY2subm9kZTtcbiAgICAgICAgdmFyIGluZGV4ID0gc3RhY2suaW5kZXgrKztcbiAgICAgICAgdmFyIG1heEluZGV4O1xuICAgICAgICBpZiAobm9kZS5lbnRyeSkge1xuICAgICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hcEl0ZXJhdG9yVmFsdWUodHlwZSwgbm9kZS5lbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuZW50cmllcykge1xuICAgICAgICAgIG1heEluZGV4ID0gbm9kZS5lbnRyaWVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgaWYgKGluZGV4IDw9IG1heEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwSXRlcmF0b3JWYWx1ZSh0eXBlLCBub2RlLmVudHJpZXNbdGhpcy5fcmV2ZXJzZSA/IG1heEluZGV4IC0gaW5kZXggOiBpbmRleF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXhJbmRleCA9IG5vZGUubm9kZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICBpZiAoaW5kZXggPD0gbWF4SW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzdWJOb2RlID0gbm9kZS5ub2Rlc1t0aGlzLl9yZXZlcnNlID8gbWF4SW5kZXggLSBpbmRleCA6IGluZGV4XTtcbiAgICAgICAgICAgIGlmIChzdWJOb2RlKSB7XG4gICAgICAgICAgICAgIGlmIChzdWJOb2RlLmVudHJ5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcEl0ZXJhdG9yVmFsdWUodHlwZSwgc3ViTm9kZS5lbnRyeSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc3RhY2sgPSB0aGlzLl9zdGFjayA9IG1hcEl0ZXJhdG9yRnJhbWUoc3ViTm9kZSwgc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YWNrID0gdGhpcy5fc3RhY2sgPSB0aGlzLl9zdGFjay5fX3ByZXY7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgfTtcblxuXG4gIGZ1bmN0aW9uIG1hcEl0ZXJhdG9yVmFsdWUodHlwZSwgZW50cnkpIHtcbiAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbWFwSXRlcmF0b3JGcmFtZShub2RlLCBwcmV2KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGU6IG5vZGUsXG4gICAgICBpbmRleDogMCxcbiAgICAgIF9fcHJldjogcHJldlxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlTWFwKHNpemUsIHJvb3QsIG93bmVySUQsIGhhc2gpIHtcbiAgICB2YXIgbWFwID0gT2JqZWN0LmNyZWF0ZShNYXBQcm90b3R5cGUpO1xuICAgIG1hcC5zaXplID0gc2l6ZTtcbiAgICBtYXAuX3Jvb3QgPSByb290O1xuICAgIG1hcC5fX293bmVySUQgPSBvd25lcklEO1xuICAgIG1hcC5fX2hhc2ggPSBoYXNoO1xuICAgIG1hcC5fX2FsdGVyZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gbWFwO1xuICB9XG5cbiAgdmFyIEVNUFRZX01BUDtcbiAgZnVuY3Rpb24gZW1wdHlNYXAoKSB7XG4gICAgcmV0dXJuIEVNUFRZX01BUCB8fCAoRU1QVFlfTUFQID0gbWFrZU1hcCgwKSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVNYXAobWFwLCBrLCB2KSB7XG4gICAgdmFyIG5ld1Jvb3Q7XG4gICAgdmFyIG5ld1NpemU7XG4gICAgaWYgKCFtYXAuX3Jvb3QpIHtcbiAgICAgIGlmICh2ID09PSBOT1RfU0VUKSB7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgICB9XG4gICAgICBuZXdTaXplID0gMTtcbiAgICAgIG5ld1Jvb3QgPSBuZXcgQXJyYXlNYXBOb2RlKG1hcC5fX293bmVySUQsIFtbaywgdl1dKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRpZENoYW5nZVNpemUgPSBNYWtlUmVmKENIQU5HRV9MRU5HVEgpO1xuICAgICAgdmFyIGRpZEFsdGVyID0gTWFrZVJlZihESURfQUxURVIpO1xuICAgICAgbmV3Um9vdCA9IHVwZGF0ZU5vZGUobWFwLl9yb290LCBtYXAuX19vd25lcklELCAwLCB1bmRlZmluZWQsIGssIHYsIGRpZENoYW5nZVNpemUsIGRpZEFsdGVyKTtcbiAgICAgIGlmICghZGlkQWx0ZXIudmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgIH1cbiAgICAgIG5ld1NpemUgPSBtYXAuc2l6ZSArIChkaWRDaGFuZ2VTaXplLnZhbHVlID8gdiA9PT0gTk9UX1NFVCA/IC0xIDogMSA6IDApO1xuICAgIH1cbiAgICBpZiAobWFwLl9fb3duZXJJRCkge1xuICAgICAgbWFwLnNpemUgPSBuZXdTaXplO1xuICAgICAgbWFwLl9yb290ID0gbmV3Um9vdDtcbiAgICAgIG1hcC5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICBtYXAuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIHJldHVybiBuZXdSb290ID8gbWFrZU1hcChuZXdTaXplLCBuZXdSb290KSA6IGVtcHR5TWFwKCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVOb2RlKG5vZGUsIG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgaWYgKHZhbHVlID09PSBOT1RfU0VUKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgICAgU2V0UmVmKGRpZEFsdGVyKTtcbiAgICAgIFNldFJlZihkaWRDaGFuZ2VTaXplKTtcbiAgICAgIHJldHVybiBuZXcgVmFsdWVOb2RlKG93bmVySUQsIGtleUhhc2gsIFtrZXksIHZhbHVlXSk7XG4gICAgfVxuICAgIHJldHVybiBub2RlLnVwZGF0ZShvd25lcklELCBzaGlmdCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNMZWFmTm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUuY29uc3RydWN0b3IgPT09IFZhbHVlTm9kZSB8fCBub2RlLmNvbnN0cnVjdG9yID09PSBIYXNoQ29sbGlzaW9uTm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlSW50b05vZGUobm9kZSwgb3duZXJJRCwgc2hpZnQsIGtleUhhc2gsIGVudHJ5KSB7XG4gICAgaWYgKG5vZGUua2V5SGFzaCA9PT0ga2V5SGFzaCkge1xuICAgICAgcmV0dXJuIG5ldyBIYXNoQ29sbGlzaW9uTm9kZShvd25lcklELCBrZXlIYXNoLCBbbm9kZS5lbnRyeSwgZW50cnldKTtcbiAgICB9XG5cbiAgICB2YXIgaWR4MSA9IChzaGlmdCA9PT0gMCA/IG5vZGUua2V5SGFzaCA6IG5vZGUua2V5SGFzaCA+Pj4gc2hpZnQpICYgTUFTSztcbiAgICB2YXIgaWR4MiA9IChzaGlmdCA9PT0gMCA/IGtleUhhc2ggOiBrZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLO1xuXG4gICAgdmFyIG5ld05vZGU7XG4gICAgdmFyIG5vZGVzID0gaWR4MSA9PT0gaWR4MiA/XG4gICAgICBbbWVyZ2VJbnRvTm9kZShub2RlLCBvd25lcklELCBzaGlmdCArIFNISUZULCBrZXlIYXNoLCBlbnRyeSldIDpcbiAgICAgICgobmV3Tm9kZSA9IG5ldyBWYWx1ZU5vZGUob3duZXJJRCwga2V5SGFzaCwgZW50cnkpKSwgaWR4MSA8IGlkeDIgPyBbbm9kZSwgbmV3Tm9kZV0gOiBbbmV3Tm9kZSwgbm9kZV0pO1xuXG4gICAgcmV0dXJuIG5ldyBCaXRtYXBJbmRleGVkTm9kZShvd25lcklELCAoMSA8PCBpZHgxKSB8ICgxIDw8IGlkeDIpLCBub2Rlcyk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVOb2Rlcyhvd25lcklELCBlbnRyaWVzLCBrZXksIHZhbHVlKSB7XG4gICAgaWYgKCFvd25lcklEKSB7XG4gICAgICBvd25lcklEID0gbmV3IE93bmVySUQoKTtcbiAgICB9XG4gICAgdmFyIG5vZGUgPSBuZXcgVmFsdWVOb2RlKG93bmVySUQsIGhhc2goa2V5KSwgW2tleSwgdmFsdWVdKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgZW50cmllcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaWldO1xuICAgICAgbm9kZSA9IG5vZGUudXBkYXRlKG93bmVySUQsIDAsIHVuZGVmaW5lZCwgZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBmdW5jdGlvbiBwYWNrTm9kZXMob3duZXJJRCwgbm9kZXMsIGNvdW50LCBleGNsdWRpbmcpIHtcbiAgICB2YXIgYml0bWFwID0gMDtcbiAgICB2YXIgcGFja2VkSUkgPSAwO1xuICAgIHZhciBwYWNrZWROb2RlcyA9IG5ldyBBcnJheShjb3VudCk7XG4gICAgZm9yICh2YXIgaWkgPSAwLCBiaXQgPSAxLCBsZW4gPSBub2Rlcy5sZW5ndGg7IGlpIDwgbGVuOyBpaSsrLCBiaXQgPDw9IDEpIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbaWldO1xuICAgICAgaWYgKG5vZGUgIT09IHVuZGVmaW5lZCAmJiBpaSAhPT0gZXhjbHVkaW5nKSB7XG4gICAgICAgIGJpdG1hcCB8PSBiaXQ7XG4gICAgICAgIHBhY2tlZE5vZGVzW3BhY2tlZElJKytdID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBCaXRtYXBJbmRleGVkTm9kZShvd25lcklELCBiaXRtYXAsIHBhY2tlZE5vZGVzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4cGFuZE5vZGVzKG93bmVySUQsIG5vZGVzLCBiaXRtYXAsIGluY2x1ZGluZywgbm9kZSkge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgdmFyIGV4cGFuZGVkTm9kZXMgPSBuZXcgQXJyYXkoU0laRSk7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBiaXRtYXAgIT09IDA7IGlpKyssIGJpdG1hcCA+Pj49IDEpIHtcbiAgICAgIGV4cGFuZGVkTm9kZXNbaWldID0gYml0bWFwICYgMSA/IG5vZGVzW2NvdW50KytdIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBleHBhbmRlZE5vZGVzW2luY2x1ZGluZ10gPSBub2RlO1xuICAgIHJldHVybiBuZXcgSGFzaEFycmF5TWFwTm9kZShvd25lcklELCBjb3VudCArIDEsIGV4cGFuZGVkTm9kZXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VJbnRvTWFwV2l0aChtYXAsIG1lcmdlciwgaXRlcmFibGVzKSB7XG4gICAgdmFyIGl0ZXJzID0gW107XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGl0ZXJhYmxlcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZXJhYmxlc1tpaV07XG4gICAgICB2YXIgaXRlciA9IEtleWVkSXRlcmFibGUodmFsdWUpO1xuICAgICAgaWYgKCFpc0l0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgICBpdGVyID0gaXRlci5tYXAoZnVuY3Rpb24odiApIHtyZXR1cm4gZnJvbUpTKHYpfSk7XG4gICAgICB9XG4gICAgICBpdGVycy5wdXNoKGl0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VJbnRvQ29sbGVjdGlvbldpdGgobWFwLCBtZXJnZXIsIGl0ZXJzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlZXBNZXJnZXIobWVyZ2VyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGV4aXN0aW5nLCB2YWx1ZSkgXG4gICAgICB7cmV0dXJuIGV4aXN0aW5nICYmIGV4aXN0aW5nLm1lcmdlRGVlcFdpdGggJiYgaXNJdGVyYWJsZSh2YWx1ZSkgP1xuICAgICAgICBleGlzdGluZy5tZXJnZURlZXBXaXRoKG1lcmdlciwgdmFsdWUpIDpcbiAgICAgICAgbWVyZ2VyID8gbWVyZ2VyKGV4aXN0aW5nLCB2YWx1ZSkgOiB2YWx1ZX07XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZUludG9Db2xsZWN0aW9uV2l0aChjb2xsZWN0aW9uLCBtZXJnZXIsIGl0ZXJzKSB7XG4gICAgaXRlcnMgPSBpdGVycy5maWx0ZXIoZnVuY3Rpb24oeCApIHtyZXR1cm4geC5zaXplICE9PSAwfSk7XG4gICAgaWYgKGl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuICAgIGlmIChjb2xsZWN0aW9uLnNpemUgPT09IDAgJiYgaXRlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5jb25zdHJ1Y3RvcihpdGVyc1swXSk7XG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24oY29sbGVjdGlvbiApIHtcbiAgICAgIHZhciBtZXJnZUludG9NYXAgPSBtZXJnZXIgP1xuICAgICAgICBmdW5jdGlvbih2YWx1ZSwga2V5KSAge1xuICAgICAgICAgIGNvbGxlY3Rpb24udXBkYXRlKGtleSwgTk9UX1NFVCwgZnVuY3Rpb24oZXhpc3RpbmcgKVxuICAgICAgICAgICAge3JldHVybiBleGlzdGluZyA9PT0gTk9UX1NFVCA/IHZhbHVlIDogbWVyZ2VyKGV4aXN0aW5nLCB2YWx1ZSl9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSA6XG4gICAgICAgIGZ1bmN0aW9uKHZhbHVlLCBrZXkpICB7XG4gICAgICAgICAgY29sbGVjdGlvbi5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpdGVycy5sZW5ndGg7IGlpKyspIHtcbiAgICAgICAgaXRlcnNbaWldLmZvckVhY2gobWVyZ2VJbnRvTWFwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUluRGVlcE1hcChleGlzdGluZywga2V5UGF0aEl0ZXIsIG5vdFNldFZhbHVlLCB1cGRhdGVyKSB7XG4gICAgdmFyIGlzTm90U2V0ID0gZXhpc3RpbmcgPT09IE5PVF9TRVQ7XG4gICAgdmFyIHN0ZXAgPSBrZXlQYXRoSXRlci5uZXh0KCk7XG4gICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgdmFyIGV4aXN0aW5nVmFsdWUgPSBpc05vdFNldCA/IG5vdFNldFZhbHVlIDogZXhpc3Rpbmc7XG4gICAgICB2YXIgbmV3VmFsdWUgPSB1cGRhdGVyKGV4aXN0aW5nVmFsdWUpO1xuICAgICAgcmV0dXJuIG5ld1ZhbHVlID09PSBleGlzdGluZ1ZhbHVlID8gZXhpc3RpbmcgOiBuZXdWYWx1ZTtcbiAgICB9XG4gICAgaW52YXJpYW50KFxuICAgICAgaXNOb3RTZXQgfHwgKGV4aXN0aW5nICYmIGV4aXN0aW5nLnNldCksXG4gICAgICAnaW52YWxpZCBrZXlQYXRoJ1xuICAgICk7XG4gICAgdmFyIGtleSA9IHN0ZXAudmFsdWU7XG4gICAgdmFyIG5leHRFeGlzdGluZyA9IGlzTm90U2V0ID8gTk9UX1NFVCA6IGV4aXN0aW5nLmdldChrZXksIE5PVF9TRVQpO1xuICAgIHZhciBuZXh0VXBkYXRlZCA9IHVwZGF0ZUluRGVlcE1hcChcbiAgICAgIG5leHRFeGlzdGluZyxcbiAgICAgIGtleVBhdGhJdGVyLFxuICAgICAgbm90U2V0VmFsdWUsXG4gICAgICB1cGRhdGVyXG4gICAgKTtcbiAgICByZXR1cm4gbmV4dFVwZGF0ZWQgPT09IG5leHRFeGlzdGluZyA/IGV4aXN0aW5nIDpcbiAgICAgIG5leHRVcGRhdGVkID09PSBOT1RfU0VUID8gZXhpc3RpbmcucmVtb3ZlKGtleSkgOlxuICAgICAgKGlzTm90U2V0ID8gZW1wdHlNYXAoKSA6IGV4aXN0aW5nKS5zZXQoa2V5LCBuZXh0VXBkYXRlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBwb3BDb3VudCh4KSB7XG4gICAgeCA9IHggLSAoKHggPj4gMSkgJiAweDU1NTU1NTU1KTtcbiAgICB4ID0gKHggJiAweDMzMzMzMzMzKSArICgoeCA+PiAyKSAmIDB4MzMzMzMzMzMpO1xuICAgIHggPSAoeCArICh4ID4+IDQpKSAmIDB4MGYwZjBmMGY7XG4gICAgeCA9IHggKyAoeCA+PiA4KTtcbiAgICB4ID0geCArICh4ID4+IDE2KTtcbiAgICByZXR1cm4geCAmIDB4N2Y7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRJbihhcnJheSwgaWR4LCB2YWwsIGNhbkVkaXQpIHtcbiAgICB2YXIgbmV3QXJyYXkgPSBjYW5FZGl0ID8gYXJyYXkgOiBhcnJDb3B5KGFycmF5KTtcbiAgICBuZXdBcnJheVtpZHhdID0gdmFsO1xuICAgIHJldHVybiBuZXdBcnJheTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNwbGljZUluKGFycmF5LCBpZHgsIHZhbCwgY2FuRWRpdCkge1xuICAgIHZhciBuZXdMZW4gPSBhcnJheS5sZW5ndGggKyAxO1xuICAgIGlmIChjYW5FZGl0ICYmIGlkeCArIDEgPT09IG5ld0xlbikge1xuICAgICAgYXJyYXlbaWR4XSA9IHZhbDtcbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgdmFyIG5ld0FycmF5ID0gbmV3IEFycmF5KG5ld0xlbik7XG4gICAgdmFyIGFmdGVyID0gMDtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbmV3TGVuOyBpaSsrKSB7XG4gICAgICBpZiAoaWkgPT09IGlkeCkge1xuICAgICAgICBuZXdBcnJheVtpaV0gPSB2YWw7XG4gICAgICAgIGFmdGVyID0gLTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdBcnJheVtpaV0gPSBhcnJheVtpaSArIGFmdGVyXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0FycmF5O1xuICB9XG5cbiAgZnVuY3Rpb24gc3BsaWNlT3V0KGFycmF5LCBpZHgsIGNhbkVkaXQpIHtcbiAgICB2YXIgbmV3TGVuID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICBpZiAoY2FuRWRpdCAmJiBpZHggPT09IG5ld0xlbikge1xuICAgICAgYXJyYXkucG9wKCk7XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICAgIHZhciBuZXdBcnJheSA9IG5ldyBBcnJheShuZXdMZW4pO1xuICAgIHZhciBhZnRlciA9IDA7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG5ld0xlbjsgaWkrKykge1xuICAgICAgaWYgKGlpID09PSBpZHgpIHtcbiAgICAgICAgYWZ0ZXIgPSAxO1xuICAgICAgfVxuICAgICAgbmV3QXJyYXlbaWldID0gYXJyYXlbaWkgKyBhZnRlcl07XG4gICAgfVxuICAgIHJldHVybiBuZXdBcnJheTtcbiAgfVxuXG4gIHZhciBNQVhfQVJSQVlfTUFQX1NJWkUgPSBTSVpFIC8gNDtcbiAgdmFyIE1BWF9CSVRNQVBfSU5ERVhFRF9TSVpFID0gU0laRSAvIDI7XG4gIHZhciBNSU5fSEFTSF9BUlJBWV9NQVBfU0laRSA9IFNJWkUgLyA0O1xuXG4gIGNyZWF0ZUNsYXNzKExpc3QsIEluZGV4ZWRDb2xsZWN0aW9uKTtcblxuICAgIC8vIEBwcmFnbWEgQ29uc3RydWN0aW9uXG5cbiAgICBmdW5jdGlvbiBMaXN0KHZhbHVlKSB7XG4gICAgICB2YXIgZW1wdHkgPSBlbXB0eUxpc3QoKTtcbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBlbXB0eTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0xpc3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBpdGVyID0gSW5kZXhlZEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgIHZhciBzaXplID0gaXRlci5zaXplO1xuICAgICAgaWYgKHNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGVtcHR5O1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90SW5maW5pdGUoc2l6ZSk7XG4gICAgICBpZiAoc2l6ZSA+IDAgJiYgc2l6ZSA8IFNJWkUpIHtcbiAgICAgICAgcmV0dXJuIG1ha2VMaXN0KDAsIHNpemUsIFNISUZULCBudWxsLCBuZXcgVk5vZGUoaXRlci50b0FycmF5KCkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbXB0eS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKGxpc3QgKSB7XG4gICAgICAgIGxpc3Quc2V0U2l6ZShzaXplKTtcbiAgICAgICAgaXRlci5mb3JFYWNoKGZ1bmN0aW9uKHYsIGkpICB7cmV0dXJuIGxpc3Quc2V0KGksIHYpfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBMaXN0Lm9mID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgcmV0dXJuIHRoaXMoYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ0xpc3QgWycsICddJyk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgQWNjZXNzXG5cbiAgICBMaXN0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICAgIGluZGV4ID0gd3JhcEluZGV4KHRoaXMsIGluZGV4KTtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5zaXplKSB7XG4gICAgICAgIHJldHVybiBub3RTZXRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGluZGV4ICs9IHRoaXMuX29yaWdpbjtcbiAgICAgIHZhciBub2RlID0gbGlzdE5vZGVGb3IodGhpcywgaW5kZXgpO1xuICAgICAgcmV0dXJuIG5vZGUgJiYgbm9kZS5hcnJheVtpbmRleCAmIE1BU0tdO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIE1vZGlmaWNhdGlvblxuXG4gICAgTGlzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdXBkYXRlTGlzdCh0aGlzLCBpbmRleCwgdmFsdWUpO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgcmV0dXJuICF0aGlzLmhhcyhpbmRleCkgPyB0aGlzIDpcbiAgICAgICAgaW5kZXggPT09IDAgPyB0aGlzLnNoaWZ0KCkgOlxuICAgICAgICBpbmRleCA9PT0gdGhpcy5zaXplIC0gMSA/IHRoaXMucG9wKCkgOlxuICAgICAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcblxuICAgIExpc3QucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHRoaXMuX29yaWdpbiA9IHRoaXMuX2NhcGFjaXR5ID0gMDtcbiAgICAgICAgdGhpcy5fbGV2ZWwgPSBTSElGVDtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHRoaXMuX3RhaWwgPSBudWxsO1xuICAgICAgICB0aGlzLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbXB0eUxpc3QoKTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKC8qLi4udmFsdWVzKi8pIHtcbiAgICAgIHZhciB2YWx1ZXMgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgb2xkU2l6ZSA9IHRoaXMuc2l6ZTtcbiAgICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24obGlzdCApIHtcbiAgICAgICAgc2V0TGlzdEJvdW5kcyhsaXN0LCAwLCBvbGRTaXplICsgdmFsdWVzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCB2YWx1ZXMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICAgICAgbGlzdC5zZXQob2xkU2l6ZSArIGlpLCB2YWx1ZXNbaWldKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIExpc3QucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNldExpc3RCb3VuZHModGhpcywgMCwgLTEpO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgdmFyIHZhbHVlcyA9IGFyZ3VtZW50cztcbiAgICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24obGlzdCApIHtcbiAgICAgICAgc2V0TGlzdEJvdW5kcyhsaXN0LCAtdmFsdWVzLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCB2YWx1ZXMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICAgICAgbGlzdC5zZXQoaWksIHZhbHVlc1tpaV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzZXRMaXN0Qm91bmRzKHRoaXMsIDEpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIENvbXBvc2l0aW9uXG5cbiAgICBMaXN0LnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uKC8qLi4uaXRlcnMqLykge1xuICAgICAgcmV0dXJuIG1lcmdlSW50b0xpc3RXaXRoKHRoaXMsIHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUubWVyZ2VXaXRoID0gZnVuY3Rpb24obWVyZ2VyKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICByZXR1cm4gbWVyZ2VJbnRvTGlzdFdpdGgodGhpcywgbWVyZ2VyLCBpdGVycyk7XG4gICAgfTtcblxuICAgIExpc3QucHJvdG90eXBlLm1lcmdlRGVlcCA9IGZ1bmN0aW9uKC8qLi4uaXRlcnMqLykge1xuICAgICAgcmV0dXJuIG1lcmdlSW50b0xpc3RXaXRoKHRoaXMsIGRlZXBNZXJnZXIodW5kZWZpbmVkKSwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUubWVyZ2VEZWVwV2l0aCA9IGZ1bmN0aW9uKG1lcmdlcikge3ZhciBpdGVycyA9IFNMSUNFJDAuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIG1lcmdlSW50b0xpc3RXaXRoKHRoaXMsIGRlZXBNZXJnZXIobWVyZ2VyKSwgaXRlcnMpO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5zZXRTaXplID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgcmV0dXJuIHNldExpc3RCb3VuZHModGhpcywgMCwgc2l6ZSk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgSXRlcmF0aW9uXG5cbiAgICBMaXN0LnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcbiAgICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgICAgaWYgKHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgc2l6ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0TGlzdEJvdW5kcyhcbiAgICAgICAgdGhpcyxcbiAgICAgICAgcmVzb2x2ZUJlZ2luKGJlZ2luLCBzaXplKSxcbiAgICAgICAgcmVzb2x2ZUVuZChlbmQsIHNpemUpXG4gICAgICApO1xuICAgIH07XG5cbiAgICBMaXN0LnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgIHZhciB2YWx1ZXMgPSBpdGVyYXRlTGlzdCh0aGlzLCByZXZlcnNlKTtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSAge1xuICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZXMoKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlID09PSBET05FID9cbiAgICAgICAgICBpdGVyYXRvckRvbmUoKSA6XG4gICAgICAgICAgaXRlcmF0b3JWYWx1ZSh0eXBlLCBpbmRleCsrLCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHtcbiAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICB2YXIgdmFsdWVzID0gaXRlcmF0ZUxpc3QodGhpcywgcmV2ZXJzZSk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB3aGlsZSAoKHZhbHVlID0gdmFsdWVzKCkpICE9PSBET05FKSB7XG4gICAgICAgIGlmIChmbih2YWx1ZSwgaW5kZXgrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9O1xuXG4gICAgTGlzdC5wcm90b3R5cGUuX19lbnN1cmVPd25lciA9IGZ1bmN0aW9uKG93bmVySUQpIHtcbiAgICAgIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmICghb3duZXJJRCkge1xuICAgICAgICB0aGlzLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ha2VMaXN0KHRoaXMuX29yaWdpbiwgdGhpcy5fY2FwYWNpdHksIHRoaXMuX2xldmVsLCB0aGlzLl9yb290LCB0aGlzLl90YWlsLCBvd25lcklELCB0aGlzLl9faGFzaCk7XG4gICAgfTtcblxuXG4gIGZ1bmN0aW9uIGlzTGlzdChtYXliZUxpc3QpIHtcbiAgICByZXR1cm4gISEobWF5YmVMaXN0ICYmIG1heWJlTGlzdFtJU19MSVNUX1NFTlRJTkVMXSk7XG4gIH1cblxuICBMaXN0LmlzTGlzdCA9IGlzTGlzdDtcblxuICB2YXIgSVNfTElTVF9TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX0xJU1RfX0BAJztcblxuICB2YXIgTGlzdFByb3RvdHlwZSA9IExpc3QucHJvdG90eXBlO1xuICBMaXN0UHJvdG90eXBlW0lTX0xJU1RfU0VOVElORUxdID0gdHJ1ZTtcbiAgTGlzdFByb3RvdHlwZVtERUxFVEVdID0gTGlzdFByb3RvdHlwZS5yZW1vdmU7XG4gIExpc3RQcm90b3R5cGUuc2V0SW4gPSBNYXBQcm90b3R5cGUuc2V0SW47XG4gIExpc3RQcm90b3R5cGUuZGVsZXRlSW4gPVxuICBMaXN0UHJvdG90eXBlLnJlbW92ZUluID0gTWFwUHJvdG90eXBlLnJlbW92ZUluO1xuICBMaXN0UHJvdG90eXBlLnVwZGF0ZSA9IE1hcFByb3RvdHlwZS51cGRhdGU7XG4gIExpc3RQcm90b3R5cGUudXBkYXRlSW4gPSBNYXBQcm90b3R5cGUudXBkYXRlSW47XG4gIExpc3RQcm90b3R5cGUubWVyZ2VJbiA9IE1hcFByb3RvdHlwZS5tZXJnZUluO1xuICBMaXN0UHJvdG90eXBlLm1lcmdlRGVlcEluID0gTWFwUHJvdG90eXBlLm1lcmdlRGVlcEluO1xuICBMaXN0UHJvdG90eXBlLndpdGhNdXRhdGlvbnMgPSBNYXBQcm90b3R5cGUud2l0aE11dGF0aW9ucztcbiAgTGlzdFByb3RvdHlwZS5hc011dGFibGUgPSBNYXBQcm90b3R5cGUuYXNNdXRhYmxlO1xuICBMaXN0UHJvdG90eXBlLmFzSW1tdXRhYmxlID0gTWFwUHJvdG90eXBlLmFzSW1tdXRhYmxlO1xuICBMaXN0UHJvdG90eXBlLndhc0FsdGVyZWQgPSBNYXBQcm90b3R5cGUud2FzQWx0ZXJlZDtcblxuXG5cbiAgICBmdW5jdGlvbiBWTm9kZShhcnJheSwgb3duZXJJRCkge1xuICAgICAgdGhpcy5hcnJheSA9IGFycmF5O1xuICAgICAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBzZWVtcyBsaWtlIHRoZXNlIG1ldGhvZHMgYXJlIHZlcnkgc2ltaWxhclxuXG4gICAgVk5vZGUucHJvdG90eXBlLnJlbW92ZUJlZm9yZSA9IGZ1bmN0aW9uKG93bmVySUQsIGxldmVsLCBpbmRleCkge1xuICAgICAgaWYgKGluZGV4ID09PSBsZXZlbCA/IDEgPDwgbGV2ZWwgOiAwIHx8IHRoaXMuYXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIG9yaWdpbkluZGV4ID0gKGluZGV4ID4+PiBsZXZlbCkgJiBNQVNLO1xuICAgICAgaWYgKG9yaWdpbkluZGV4ID49IHRoaXMuYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVk5vZGUoW10sIG93bmVySUQpO1xuICAgICAgfVxuICAgICAgdmFyIHJlbW92aW5nRmlyc3QgPSBvcmlnaW5JbmRleCA9PT0gMDtcbiAgICAgIHZhciBuZXdDaGlsZDtcbiAgICAgIGlmIChsZXZlbCA+IDApIHtcbiAgICAgICAgdmFyIG9sZENoaWxkID0gdGhpcy5hcnJheVtvcmlnaW5JbmRleF07XG4gICAgICAgIG5ld0NoaWxkID0gb2xkQ2hpbGQgJiYgb2xkQ2hpbGQucmVtb3ZlQmVmb3JlKG93bmVySUQsIGxldmVsIC0gU0hJRlQsIGluZGV4KTtcbiAgICAgICAgaWYgKG5ld0NoaWxkID09PSBvbGRDaGlsZCAmJiByZW1vdmluZ0ZpcnN0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyZW1vdmluZ0ZpcnN0ICYmICFuZXdDaGlsZCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBlZGl0YWJsZSA9IGVkaXRhYmxlVk5vZGUodGhpcywgb3duZXJJRCk7XG4gICAgICBpZiAoIXJlbW92aW5nRmlyc3QpIHtcbiAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG9yaWdpbkluZGV4OyBpaSsrKSB7XG4gICAgICAgICAgZWRpdGFibGUuYXJyYXlbaWldID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobmV3Q2hpbGQpIHtcbiAgICAgICAgZWRpdGFibGUuYXJyYXlbb3JpZ2luSW5kZXhdID0gbmV3Q2hpbGQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gZWRpdGFibGU7XG4gICAgfTtcblxuICAgIFZOb2RlLnByb3RvdHlwZS5yZW1vdmVBZnRlciA9IGZ1bmN0aW9uKG93bmVySUQsIGxldmVsLCBpbmRleCkge1xuICAgICAgaWYgKGluZGV4ID09PSBsZXZlbCA/IDEgPDwgbGV2ZWwgOiAwIHx8IHRoaXMuYXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIHNpemVJbmRleCA9ICgoaW5kZXggLSAxKSA+Pj4gbGV2ZWwpICYgTUFTSztcbiAgICAgIGlmIChzaXplSW5kZXggPj0gdGhpcy5hcnJheS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgcmVtb3ZpbmdMYXN0ID0gc2l6ZUluZGV4ID09PSB0aGlzLmFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICB2YXIgbmV3Q2hpbGQ7XG4gICAgICBpZiAobGV2ZWwgPiAwKSB7XG4gICAgICAgIHZhciBvbGRDaGlsZCA9IHRoaXMuYXJyYXlbc2l6ZUluZGV4XTtcbiAgICAgICAgbmV3Q2hpbGQgPSBvbGRDaGlsZCAmJiBvbGRDaGlsZC5yZW1vdmVBZnRlcihvd25lcklELCBsZXZlbCAtIFNISUZULCBpbmRleCk7XG4gICAgICAgIGlmIChuZXdDaGlsZCA9PT0gb2xkQ2hpbGQgJiYgcmVtb3ZpbmdMYXN0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChyZW1vdmluZ0xhc3QgJiYgIW5ld0NoaWxkKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgdmFyIGVkaXRhYmxlID0gZWRpdGFibGVWTm9kZSh0aGlzLCBvd25lcklEKTtcbiAgICAgIGlmICghcmVtb3ZpbmdMYXN0KSB7XG4gICAgICAgIGVkaXRhYmxlLmFycmF5LnBvcCgpO1xuICAgICAgfVxuICAgICAgaWYgKG5ld0NoaWxkKSB7XG4gICAgICAgIGVkaXRhYmxlLmFycmF5W3NpemVJbmRleF0gPSBuZXdDaGlsZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlZGl0YWJsZTtcbiAgICB9O1xuXG5cblxuICB2YXIgRE9ORSA9IHt9O1xuXG4gIGZ1bmN0aW9uIGl0ZXJhdGVMaXN0KGxpc3QsIHJldmVyc2UpIHtcbiAgICB2YXIgbGVmdCA9IGxpc3QuX29yaWdpbjtcbiAgICB2YXIgcmlnaHQgPSBsaXN0Ll9jYXBhY2l0eTtcbiAgICB2YXIgdGFpbFBvcyA9IGdldFRhaWxPZmZzZXQocmlnaHQpO1xuICAgIHZhciB0YWlsID0gbGlzdC5fdGFpbDtcblxuICAgIHJldHVybiBpdGVyYXRlTm9kZU9yTGVhZihsaXN0Ll9yb290LCBsaXN0Ll9sZXZlbCwgMCk7XG5cbiAgICBmdW5jdGlvbiBpdGVyYXRlTm9kZU9yTGVhZihub2RlLCBsZXZlbCwgb2Zmc2V0KSB7XG4gICAgICByZXR1cm4gbGV2ZWwgPT09IDAgP1xuICAgICAgICBpdGVyYXRlTGVhZihub2RlLCBvZmZzZXQpIDpcbiAgICAgICAgaXRlcmF0ZU5vZGUobm9kZSwgbGV2ZWwsIG9mZnNldCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXRlcmF0ZUxlYWYobm9kZSwgb2Zmc2V0KSB7XG4gICAgICB2YXIgYXJyYXkgPSBvZmZzZXQgPT09IHRhaWxQb3MgPyB0YWlsICYmIHRhaWwuYXJyYXkgOiBub2RlICYmIG5vZGUuYXJyYXk7XG4gICAgICB2YXIgZnJvbSA9IG9mZnNldCA+IGxlZnQgPyAwIDogbGVmdCAtIG9mZnNldDtcbiAgICAgIHZhciB0byA9IHJpZ2h0IC0gb2Zmc2V0O1xuICAgICAgaWYgKHRvID4gU0laRSkge1xuICAgICAgICB0byA9IFNJWkU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSAge1xuICAgICAgICBpZiAoZnJvbSA9PT0gdG8pIHtcbiAgICAgICAgICByZXR1cm4gRE9ORTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaWR4ID0gcmV2ZXJzZSA/IC0tdG8gOiBmcm9tKys7XG4gICAgICAgIHJldHVybiBhcnJheSAmJiBhcnJheVtpZHhdO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpdGVyYXRlTm9kZShub2RlLCBsZXZlbCwgb2Zmc2V0KSB7XG4gICAgICB2YXIgdmFsdWVzO1xuICAgICAgdmFyIGFycmF5ID0gbm9kZSAmJiBub2RlLmFycmF5O1xuICAgICAgdmFyIGZyb20gPSBvZmZzZXQgPiBsZWZ0ID8gMCA6IChsZWZ0IC0gb2Zmc2V0KSA+PiBsZXZlbDtcbiAgICAgIHZhciB0byA9ICgocmlnaHQgLSBvZmZzZXQpID4+IGxldmVsKSArIDE7XG4gICAgICBpZiAodG8gPiBTSVpFKSB7XG4gICAgICAgIHRvID0gU0laRTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbigpICB7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZXMoKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gRE9ORSkge1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWx1ZXMgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZnJvbSA9PT0gdG8pIHtcbiAgICAgICAgICAgIHJldHVybiBET05FO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaWR4ID0gcmV2ZXJzZSA/IC0tdG8gOiBmcm9tKys7XG4gICAgICAgICAgdmFsdWVzID0gaXRlcmF0ZU5vZGVPckxlYWYoXG4gICAgICAgICAgICBhcnJheSAmJiBhcnJheVtpZHhdLCBsZXZlbCAtIFNISUZULCBvZmZzZXQgKyAoaWR4IDw8IGxldmVsKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gd2hpbGUgKHRydWUpO1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlTGlzdChvcmlnaW4sIGNhcGFjaXR5LCBsZXZlbCwgcm9vdCwgdGFpbCwgb3duZXJJRCwgaGFzaCkge1xuICAgIHZhciBsaXN0ID0gT2JqZWN0LmNyZWF0ZShMaXN0UHJvdG90eXBlKTtcbiAgICBsaXN0LnNpemUgPSBjYXBhY2l0eSAtIG9yaWdpbjtcbiAgICBsaXN0Ll9vcmlnaW4gPSBvcmlnaW47XG4gICAgbGlzdC5fY2FwYWNpdHkgPSBjYXBhY2l0eTtcbiAgICBsaXN0Ll9sZXZlbCA9IGxldmVsO1xuICAgIGxpc3QuX3Jvb3QgPSByb290O1xuICAgIGxpc3QuX3RhaWwgPSB0YWlsO1xuICAgIGxpc3QuX19vd25lcklEID0gb3duZXJJRDtcbiAgICBsaXN0Ll9faGFzaCA9IGhhc2g7XG4gICAgbGlzdC5fX2FsdGVyZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIHZhciBFTVBUWV9MSVNUO1xuICBmdW5jdGlvbiBlbXB0eUxpc3QoKSB7XG4gICAgcmV0dXJuIEVNUFRZX0xJU1QgfHwgKEVNUFRZX0xJU1QgPSBtYWtlTGlzdCgwLCAwLCBTSElGVCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGlzdChsaXN0LCBpbmRleCwgdmFsdWUpIHtcbiAgICBpbmRleCA9IHdyYXBJbmRleChsaXN0LCBpbmRleCk7XG5cbiAgICBpZiAoaW5kZXggPj0gbGlzdC5zaXplIHx8IGluZGV4IDwgMCkge1xuICAgICAgcmV0dXJuIGxpc3Qud2l0aE11dGF0aW9ucyhmdW5jdGlvbihsaXN0ICkge1xuICAgICAgICBpbmRleCA8IDAgP1xuICAgICAgICAgIHNldExpc3RCb3VuZHMobGlzdCwgaW5kZXgpLnNldCgwLCB2YWx1ZSkgOlxuICAgICAgICAgIHNldExpc3RCb3VuZHMobGlzdCwgMCwgaW5kZXggKyAxKS5zZXQoaW5kZXgsIHZhbHVlKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5kZXggKz0gbGlzdC5fb3JpZ2luO1xuXG4gICAgdmFyIG5ld1RhaWwgPSBsaXN0Ll90YWlsO1xuICAgIHZhciBuZXdSb290ID0gbGlzdC5fcm9vdDtcbiAgICB2YXIgZGlkQWx0ZXIgPSBNYWtlUmVmKERJRF9BTFRFUik7XG4gICAgaWYgKGluZGV4ID49IGdldFRhaWxPZmZzZXQobGlzdC5fY2FwYWNpdHkpKSB7XG4gICAgICBuZXdUYWlsID0gdXBkYXRlVk5vZGUobmV3VGFpbCwgbGlzdC5fX293bmVySUQsIDAsIGluZGV4LCB2YWx1ZSwgZGlkQWx0ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdSb290ID0gdXBkYXRlVk5vZGUobmV3Um9vdCwgbGlzdC5fX293bmVySUQsIGxpc3QuX2xldmVsLCBpbmRleCwgdmFsdWUsIGRpZEFsdGVyKTtcbiAgICB9XG5cbiAgICBpZiAoIWRpZEFsdGVyLnZhbHVlKSB7XG4gICAgICByZXR1cm4gbGlzdDtcbiAgICB9XG5cbiAgICBpZiAobGlzdC5fX293bmVySUQpIHtcbiAgICAgIGxpc3QuX3Jvb3QgPSBuZXdSb290O1xuICAgICAgbGlzdC5fdGFpbCA9IG5ld1RhaWw7XG4gICAgICBsaXN0Ll9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgIGxpc3QuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cbiAgICByZXR1cm4gbWFrZUxpc3QobGlzdC5fb3JpZ2luLCBsaXN0Ll9jYXBhY2l0eSwgbGlzdC5fbGV2ZWwsIG5ld1Jvb3QsIG5ld1RhaWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlVk5vZGUobm9kZSwgb3duZXJJRCwgbGV2ZWwsIGluZGV4LCB2YWx1ZSwgZGlkQWx0ZXIpIHtcbiAgICB2YXIgaWR4ID0gKGluZGV4ID4+PiBsZXZlbCkgJiBNQVNLO1xuICAgIHZhciBub2RlSGFzID0gbm9kZSAmJiBpZHggPCBub2RlLmFycmF5Lmxlbmd0aDtcbiAgICBpZiAoIW5vZGVIYXMgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgdmFyIG5ld05vZGU7XG5cbiAgICBpZiAobGV2ZWwgPiAwKSB7XG4gICAgICB2YXIgbG93ZXJOb2RlID0gbm9kZSAmJiBub2RlLmFycmF5W2lkeF07XG4gICAgICB2YXIgbmV3TG93ZXJOb2RlID0gdXBkYXRlVk5vZGUobG93ZXJOb2RlLCBvd25lcklELCBsZXZlbCAtIFNISUZULCBpbmRleCwgdmFsdWUsIGRpZEFsdGVyKTtcbiAgICAgIGlmIChuZXdMb3dlck5vZGUgPT09IGxvd2VyTm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICAgIG5ld05vZGUgPSBlZGl0YWJsZVZOb2RlKG5vZGUsIG93bmVySUQpO1xuICAgICAgbmV3Tm9kZS5hcnJheVtpZHhdID0gbmV3TG93ZXJOb2RlO1xuICAgICAgcmV0dXJuIG5ld05vZGU7XG4gICAgfVxuXG4gICAgaWYgKG5vZGVIYXMgJiYgbm9kZS5hcnJheVtpZHhdID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgU2V0UmVmKGRpZEFsdGVyKTtcblxuICAgIG5ld05vZGUgPSBlZGl0YWJsZVZOb2RlKG5vZGUsIG93bmVySUQpO1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmIGlkeCA9PT0gbmV3Tm9kZS5hcnJheS5sZW5ndGggLSAxKSB7XG4gICAgICBuZXdOb2RlLmFycmF5LnBvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdOb2RlLmFycmF5W2lkeF0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld05vZGU7XG4gIH1cblxuICBmdW5jdGlvbiBlZGl0YWJsZVZOb2RlKG5vZGUsIG93bmVySUQpIHtcbiAgICBpZiAob3duZXJJRCAmJiBub2RlICYmIG93bmVySUQgPT09IG5vZGUub3duZXJJRCkge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVk5vZGUobm9kZSA/IG5vZGUuYXJyYXkuc2xpY2UoKSA6IFtdLCBvd25lcklEKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpc3ROb2RlRm9yKGxpc3QsIHJhd0luZGV4KSB7XG4gICAgaWYgKHJhd0luZGV4ID49IGdldFRhaWxPZmZzZXQobGlzdC5fY2FwYWNpdHkpKSB7XG4gICAgICByZXR1cm4gbGlzdC5fdGFpbDtcbiAgICB9XG4gICAgaWYgKHJhd0luZGV4IDwgMSA8PCAobGlzdC5fbGV2ZWwgKyBTSElGVCkpIHtcbiAgICAgIHZhciBub2RlID0gbGlzdC5fcm9vdDtcbiAgICAgIHZhciBsZXZlbCA9IGxpc3QuX2xldmVsO1xuICAgICAgd2hpbGUgKG5vZGUgJiYgbGV2ZWwgPiAwKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLmFycmF5WyhyYXdJbmRleCA+Pj4gbGV2ZWwpICYgTUFTS107XG4gICAgICAgIGxldmVsIC09IFNISUZUO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0TGlzdEJvdW5kcyhsaXN0LCBiZWdpbiwgZW5kKSB7XG4gICAgdmFyIG93bmVyID0gbGlzdC5fX293bmVySUQgfHwgbmV3IE93bmVySUQoKTtcbiAgICB2YXIgb2xkT3JpZ2luID0gbGlzdC5fb3JpZ2luO1xuICAgIHZhciBvbGRDYXBhY2l0eSA9IGxpc3QuX2NhcGFjaXR5O1xuICAgIHZhciBuZXdPcmlnaW4gPSBvbGRPcmlnaW4gKyBiZWdpbjtcbiAgICB2YXIgbmV3Q2FwYWNpdHkgPSBlbmQgPT09IHVuZGVmaW5lZCA/IG9sZENhcGFjaXR5IDogZW5kIDwgMCA/IG9sZENhcGFjaXR5ICsgZW5kIDogb2xkT3JpZ2luICsgZW5kO1xuICAgIGlmIChuZXdPcmlnaW4gPT09IG9sZE9yaWdpbiAmJiBuZXdDYXBhY2l0eSA9PT0gb2xkQ2FwYWNpdHkpIHtcbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cblxuICAgIC8vIElmIGl0J3MgZ29pbmcgdG8gZW5kIGFmdGVyIGl0IHN0YXJ0cywgaXQncyBlbXB0eS5cbiAgICBpZiAobmV3T3JpZ2luID49IG5ld0NhcGFjaXR5KSB7XG4gICAgICByZXR1cm4gbGlzdC5jbGVhcigpO1xuICAgIH1cblxuICAgIHZhciBuZXdMZXZlbCA9IGxpc3QuX2xldmVsO1xuICAgIHZhciBuZXdSb290ID0gbGlzdC5fcm9vdDtcblxuICAgIC8vIE5ldyBvcmlnaW4gbWlnaHQgcmVxdWlyZSBjcmVhdGluZyBhIGhpZ2hlciByb290LlxuICAgIHZhciBvZmZzZXRTaGlmdCA9IDA7XG4gICAgd2hpbGUgKG5ld09yaWdpbiArIG9mZnNldFNoaWZ0IDwgMCkge1xuICAgICAgbmV3Um9vdCA9IG5ldyBWTm9kZShuZXdSb290ICYmIG5ld1Jvb3QuYXJyYXkubGVuZ3RoID8gW3VuZGVmaW5lZCwgbmV3Um9vdF0gOiBbXSwgb3duZXIpO1xuICAgICAgbmV3TGV2ZWwgKz0gU0hJRlQ7XG4gICAgICBvZmZzZXRTaGlmdCArPSAxIDw8IG5ld0xldmVsO1xuICAgIH1cbiAgICBpZiAob2Zmc2V0U2hpZnQpIHtcbiAgICAgIG5ld09yaWdpbiArPSBvZmZzZXRTaGlmdDtcbiAgICAgIG9sZE9yaWdpbiArPSBvZmZzZXRTaGlmdDtcbiAgICAgIG5ld0NhcGFjaXR5ICs9IG9mZnNldFNoaWZ0O1xuICAgICAgb2xkQ2FwYWNpdHkgKz0gb2Zmc2V0U2hpZnQ7XG4gICAgfVxuXG4gICAgdmFyIG9sZFRhaWxPZmZzZXQgPSBnZXRUYWlsT2Zmc2V0KG9sZENhcGFjaXR5KTtcbiAgICB2YXIgbmV3VGFpbE9mZnNldCA9IGdldFRhaWxPZmZzZXQobmV3Q2FwYWNpdHkpO1xuXG4gICAgLy8gTmV3IHNpemUgbWlnaHQgcmVxdWlyZSBjcmVhdGluZyBhIGhpZ2hlciByb290LlxuICAgIHdoaWxlIChuZXdUYWlsT2Zmc2V0ID49IDEgPDwgKG5ld0xldmVsICsgU0hJRlQpKSB7XG4gICAgICBuZXdSb290ID0gbmV3IFZOb2RlKG5ld1Jvb3QgJiYgbmV3Um9vdC5hcnJheS5sZW5ndGggPyBbbmV3Um9vdF0gOiBbXSwgb3duZXIpO1xuICAgICAgbmV3TGV2ZWwgKz0gU0hJRlQ7XG4gICAgfVxuXG4gICAgLy8gTG9jYXRlIG9yIGNyZWF0ZSB0aGUgbmV3IHRhaWwuXG4gICAgdmFyIG9sZFRhaWwgPSBsaXN0Ll90YWlsO1xuICAgIHZhciBuZXdUYWlsID0gbmV3VGFpbE9mZnNldCA8IG9sZFRhaWxPZmZzZXQgP1xuICAgICAgbGlzdE5vZGVGb3IobGlzdCwgbmV3Q2FwYWNpdHkgLSAxKSA6XG4gICAgICBuZXdUYWlsT2Zmc2V0ID4gb2xkVGFpbE9mZnNldCA/IG5ldyBWTm9kZShbXSwgb3duZXIpIDogb2xkVGFpbDtcblxuICAgIC8vIE1lcmdlIFRhaWwgaW50byB0cmVlLlxuICAgIGlmIChvbGRUYWlsICYmIG5ld1RhaWxPZmZzZXQgPiBvbGRUYWlsT2Zmc2V0ICYmIG5ld09yaWdpbiA8IG9sZENhcGFjaXR5ICYmIG9sZFRhaWwuYXJyYXkubGVuZ3RoKSB7XG4gICAgICBuZXdSb290ID0gZWRpdGFibGVWTm9kZShuZXdSb290LCBvd25lcik7XG4gICAgICB2YXIgbm9kZSA9IG5ld1Jvb3Q7XG4gICAgICBmb3IgKHZhciBsZXZlbCA9IG5ld0xldmVsOyBsZXZlbCA+IFNISUZUOyBsZXZlbCAtPSBTSElGVCkge1xuICAgICAgICB2YXIgaWR4ID0gKG9sZFRhaWxPZmZzZXQgPj4+IGxldmVsKSAmIE1BU0s7XG4gICAgICAgIG5vZGUgPSBub2RlLmFycmF5W2lkeF0gPSBlZGl0YWJsZVZOb2RlKG5vZGUuYXJyYXlbaWR4XSwgb3duZXIpO1xuICAgICAgfVxuICAgICAgbm9kZS5hcnJheVsob2xkVGFpbE9mZnNldCA+Pj4gU0hJRlQpICYgTUFTS10gPSBvbGRUYWlsO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBzaXplIGhhcyBiZWVuIHJlZHVjZWQsIHRoZXJlJ3MgYSBjaGFuY2UgdGhlIHRhaWwgbmVlZHMgdG8gYmUgdHJpbW1lZC5cbiAgICBpZiAobmV3Q2FwYWNpdHkgPCBvbGRDYXBhY2l0eSkge1xuICAgICAgbmV3VGFpbCA9IG5ld1RhaWwgJiYgbmV3VGFpbC5yZW1vdmVBZnRlcihvd25lciwgMCwgbmV3Q2FwYWNpdHkpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBuZXcgb3JpZ2luIGlzIHdpdGhpbiB0aGUgdGFpbCwgdGhlbiB3ZSBkbyBub3QgbmVlZCBhIHJvb3QuXG4gICAgaWYgKG5ld09yaWdpbiA+PSBuZXdUYWlsT2Zmc2V0KSB7XG4gICAgICBuZXdPcmlnaW4gLT0gbmV3VGFpbE9mZnNldDtcbiAgICAgIG5ld0NhcGFjaXR5IC09IG5ld1RhaWxPZmZzZXQ7XG4gICAgICBuZXdMZXZlbCA9IFNISUZUO1xuICAgICAgbmV3Um9vdCA9IG51bGw7XG4gICAgICBuZXdUYWlsID0gbmV3VGFpbCAmJiBuZXdUYWlsLnJlbW92ZUJlZm9yZShvd25lciwgMCwgbmV3T3JpZ2luKTtcblxuICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIHJvb3QgaGFzIGJlZW4gdHJpbW1lZCwgZ2FyYmFnZSBjb2xsZWN0LlxuICAgIH0gZWxzZSBpZiAobmV3T3JpZ2luID4gb2xkT3JpZ2luIHx8IG5ld1RhaWxPZmZzZXQgPCBvbGRUYWlsT2Zmc2V0KSB7XG4gICAgICBvZmZzZXRTaGlmdCA9IDA7XG5cbiAgICAgIC8vIElkZW50aWZ5IHRoZSBuZXcgdG9wIHJvb3Qgbm9kZSBvZiB0aGUgc3VidHJlZSBvZiB0aGUgb2xkIHJvb3QuXG4gICAgICB3aGlsZSAobmV3Um9vdCkge1xuICAgICAgICB2YXIgYmVnaW5JbmRleCA9IChuZXdPcmlnaW4gPj4+IG5ld0xldmVsKSAmIE1BU0s7XG4gICAgICAgIGlmIChiZWdpbkluZGV4ICE9PSAobmV3VGFpbE9mZnNldCA+Pj4gbmV3TGV2ZWwpICYgTUFTSykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChiZWdpbkluZGV4KSB7XG4gICAgICAgICAgb2Zmc2V0U2hpZnQgKz0gKDEgPDwgbmV3TGV2ZWwpICogYmVnaW5JbmRleDtcbiAgICAgICAgfVxuICAgICAgICBuZXdMZXZlbCAtPSBTSElGVDtcbiAgICAgICAgbmV3Um9vdCA9IG5ld1Jvb3QuYXJyYXlbYmVnaW5JbmRleF07XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaW0gdGhlIG5ldyBzaWRlcyBvZiB0aGUgbmV3IHJvb3QuXG4gICAgICBpZiAobmV3Um9vdCAmJiBuZXdPcmlnaW4gPiBvbGRPcmlnaW4pIHtcbiAgICAgICAgbmV3Um9vdCA9IG5ld1Jvb3QucmVtb3ZlQmVmb3JlKG93bmVyLCBuZXdMZXZlbCwgbmV3T3JpZ2luIC0gb2Zmc2V0U2hpZnQpO1xuICAgICAgfVxuICAgICAgaWYgKG5ld1Jvb3QgJiYgbmV3VGFpbE9mZnNldCA8IG9sZFRhaWxPZmZzZXQpIHtcbiAgICAgICAgbmV3Um9vdCA9IG5ld1Jvb3QucmVtb3ZlQWZ0ZXIob3duZXIsIG5ld0xldmVsLCBuZXdUYWlsT2Zmc2V0IC0gb2Zmc2V0U2hpZnQpO1xuICAgICAgfVxuICAgICAgaWYgKG9mZnNldFNoaWZ0KSB7XG4gICAgICAgIG5ld09yaWdpbiAtPSBvZmZzZXRTaGlmdDtcbiAgICAgICAgbmV3Q2FwYWNpdHkgLT0gb2Zmc2V0U2hpZnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxpc3QuX19vd25lcklEKSB7XG4gICAgICBsaXN0LnNpemUgPSBuZXdDYXBhY2l0eSAtIG5ld09yaWdpbjtcbiAgICAgIGxpc3QuX29yaWdpbiA9IG5ld09yaWdpbjtcbiAgICAgIGxpc3QuX2NhcGFjaXR5ID0gbmV3Q2FwYWNpdHk7XG4gICAgICBsaXN0Ll9sZXZlbCA9IG5ld0xldmVsO1xuICAgICAgbGlzdC5fcm9vdCA9IG5ld1Jvb3Q7XG4gICAgICBsaXN0Ll90YWlsID0gbmV3VGFpbDtcbiAgICAgIGxpc3QuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgbGlzdC5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfVxuICAgIHJldHVybiBtYWtlTGlzdChuZXdPcmlnaW4sIG5ld0NhcGFjaXR5LCBuZXdMZXZlbCwgbmV3Um9vdCwgbmV3VGFpbCk7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZUludG9MaXN0V2l0aChsaXN0LCBtZXJnZXIsIGl0ZXJhYmxlcykge1xuICAgIHZhciBpdGVycyA9IFtdO1xuICAgIHZhciBtYXhTaXplID0gMDtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaXRlcmFibGVzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaXRlcmFibGVzW2lpXTtcbiAgICAgIHZhciBpdGVyID0gSW5kZXhlZEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgIGlmIChpdGVyLnNpemUgPiBtYXhTaXplKSB7XG4gICAgICAgIG1heFNpemUgPSBpdGVyLnNpemU7XG4gICAgICB9XG4gICAgICBpZiAoIWlzSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICAgIGl0ZXIgPSBpdGVyLm1hcChmdW5jdGlvbih2ICkge3JldHVybiBmcm9tSlModil9KTtcbiAgICAgIH1cbiAgICAgIGl0ZXJzLnB1c2goaXRlcik7XG4gICAgfVxuICAgIGlmIChtYXhTaXplID4gbGlzdC5zaXplKSB7XG4gICAgICBsaXN0ID0gbGlzdC5zZXRTaXplKG1heFNpemUpO1xuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VJbnRvQ29sbGVjdGlvbldpdGgobGlzdCwgbWVyZ2VyLCBpdGVycyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUYWlsT2Zmc2V0KHNpemUpIHtcbiAgICByZXR1cm4gc2l6ZSA8IFNJWkUgPyAwIDogKCgoc2l6ZSAtIDEpID4+PiBTSElGVCkgPDwgU0hJRlQpO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoT3JkZXJlZE1hcCwgTWFwKTtcblxuICAgIC8vIEBwcmFnbWEgQ29uc3RydWN0aW9uXG5cbiAgICBmdW5jdGlvbiBPcmRlcmVkTWFwKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGVtcHR5T3JkZXJlZE1hcCgpIDpcbiAgICAgICAgaXNPcmRlcmVkTWFwKHZhbHVlKSA/IHZhbHVlIDpcbiAgICAgICAgZW1wdHlPcmRlcmVkTWFwKCkud2l0aE11dGF0aW9ucyhmdW5jdGlvbihtYXAgKSB7XG4gICAgICAgICAgdmFyIGl0ZXIgPSBLZXllZEl0ZXJhYmxlKHZhbHVlKTtcbiAgICAgICAgICBhc3NlcnROb3RJbmZpbml0ZShpdGVyLnNpemUpO1xuICAgICAgICAgIGl0ZXIuZm9yRWFjaChmdW5jdGlvbih2LCBrKSAge3JldHVybiBtYXAuc2V0KGssIHYpfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIE9yZGVyZWRNYXAub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gdGhpcyhhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBPcmRlcmVkTWFwLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnT3JkZXJlZE1hcCB7JywgJ30nKTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBBY2Nlc3NcblxuICAgIE9yZGVyZWRNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGssIG5vdFNldFZhbHVlKSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLl9tYXAuZ2V0KGspO1xuICAgICAgcmV0dXJuIGluZGV4ICE9PSB1bmRlZmluZWQgPyB0aGlzLl9saXN0LmdldChpbmRleClbMV0gOiBub3RTZXRWYWx1ZTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBNb2RpZmljYXRpb25cblxuICAgIE9yZGVyZWRNYXAucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgIHRoaXMuX21hcC5jbGVhcigpO1xuICAgICAgICB0aGlzLl9saXN0LmNsZWFyKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVtcHR5T3JkZXJlZE1hcCgpO1xuICAgIH07XG5cbiAgICBPcmRlcmVkTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrLCB2KSB7XG4gICAgICByZXR1cm4gdXBkYXRlT3JkZXJlZE1hcCh0aGlzLCBrLCB2KTtcbiAgICB9O1xuXG4gICAgT3JkZXJlZE1hcC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaykge1xuICAgICAgcmV0dXJuIHVwZGF0ZU9yZGVyZWRNYXAodGhpcywgaywgTk9UX1NFVCk7XG4gICAgfTtcblxuICAgIE9yZGVyZWRNYXAucHJvdG90eXBlLndhc0FsdGVyZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tYXAud2FzQWx0ZXJlZCgpIHx8IHRoaXMuX2xpc3Qud2FzQWx0ZXJlZCgpO1xuICAgIH07XG5cbiAgICBPcmRlcmVkTWFwLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIHRoaXMuX2xpc3QuX19pdGVyYXRlKFxuICAgICAgICBmdW5jdGlvbihlbnRyeSApIHtyZXR1cm4gZW50cnkgJiYgZm4oZW50cnlbMV0sIGVudHJ5WzBdLCB0aGlzJDApfSxcbiAgICAgICAgcmV2ZXJzZVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgT3JkZXJlZE1hcC5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLl9saXN0LmZyb21FbnRyeVNlcSgpLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgfTtcblxuICAgIE9yZGVyZWRNYXAucHJvdG90eXBlLl9fZW5zdXJlT3duZXIgPSBmdW5jdGlvbihvd25lcklEKSB7XG4gICAgICBpZiAob3duZXJJRCA9PT0gdGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgbmV3TWFwID0gdGhpcy5fbWFwLl9fZW5zdXJlT3duZXIob3duZXJJRCk7XG4gICAgICB2YXIgbmV3TGlzdCA9IHRoaXMuX2xpc3QuX19lbnN1cmVPd25lcihvd25lcklEKTtcbiAgICAgIGlmICghb3duZXJJRCkge1xuICAgICAgICB0aGlzLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgICAgIHRoaXMuX21hcCA9IG5ld01hcDtcbiAgICAgICAgdGhpcy5fbGlzdCA9IG5ld0xpc3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ha2VPcmRlcmVkTWFwKG5ld01hcCwgbmV3TGlzdCwgb3duZXJJRCwgdGhpcy5fX2hhc2gpO1xuICAgIH07XG5cblxuICBmdW5jdGlvbiBpc09yZGVyZWRNYXAobWF5YmVPcmRlcmVkTWFwKSB7XG4gICAgcmV0dXJuIGlzTWFwKG1heWJlT3JkZXJlZE1hcCkgJiYgaXNPcmRlcmVkKG1heWJlT3JkZXJlZE1hcCk7XG4gIH1cblxuICBPcmRlcmVkTWFwLmlzT3JkZXJlZE1hcCA9IGlzT3JkZXJlZE1hcDtcblxuICBPcmRlcmVkTWFwLnByb3RvdHlwZVtJU19PUkRFUkVEX1NFTlRJTkVMXSA9IHRydWU7XG4gIE9yZGVyZWRNYXAucHJvdG90eXBlW0RFTEVURV0gPSBPcmRlcmVkTWFwLnByb3RvdHlwZS5yZW1vdmU7XG5cblxuXG4gIGZ1bmN0aW9uIG1ha2VPcmRlcmVkTWFwKG1hcCwgbGlzdCwgb3duZXJJRCwgaGFzaCkge1xuICAgIHZhciBvbWFwID0gT2JqZWN0LmNyZWF0ZShPcmRlcmVkTWFwLnByb3RvdHlwZSk7XG4gICAgb21hcC5zaXplID0gbWFwID8gbWFwLnNpemUgOiAwO1xuICAgIG9tYXAuX21hcCA9IG1hcDtcbiAgICBvbWFwLl9saXN0ID0gbGlzdDtcbiAgICBvbWFwLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgb21hcC5fX2hhc2ggPSBoYXNoO1xuICAgIHJldHVybiBvbWFwO1xuICB9XG5cbiAgdmFyIEVNUFRZX09SREVSRURfTUFQO1xuICBmdW5jdGlvbiBlbXB0eU9yZGVyZWRNYXAoKSB7XG4gICAgcmV0dXJuIEVNUFRZX09SREVSRURfTUFQIHx8IChFTVBUWV9PUkRFUkVEX01BUCA9IG1ha2VPcmRlcmVkTWFwKGVtcHR5TWFwKCksIGVtcHR5TGlzdCgpKSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVPcmRlcmVkTWFwKG9tYXAsIGssIHYpIHtcbiAgICB2YXIgbWFwID0gb21hcC5fbWFwO1xuICAgIHZhciBsaXN0ID0gb21hcC5fbGlzdDtcbiAgICB2YXIgaSA9IG1hcC5nZXQoayk7XG4gICAgdmFyIGhhcyA9IGkgIT09IHVuZGVmaW5lZDtcbiAgICB2YXIgbmV3TWFwO1xuICAgIHZhciBuZXdMaXN0O1xuICAgIGlmICh2ID09PSBOT1RfU0VUKSB7IC8vIHJlbW92ZWRcbiAgICAgIGlmICghaGFzKSB7XG4gICAgICAgIHJldHVybiBvbWFwO1xuICAgICAgfVxuICAgICAgaWYgKGxpc3Quc2l6ZSA+PSBTSVpFICYmIGxpc3Quc2l6ZSA+PSBtYXAuc2l6ZSAqIDIpIHtcbiAgICAgICAgbmV3TGlzdCA9IGxpc3QuZmlsdGVyKGZ1bmN0aW9uKGVudHJ5LCBpZHgpICB7cmV0dXJuIGVudHJ5ICE9PSB1bmRlZmluZWQgJiYgaSAhPT0gaWR4fSk7XG4gICAgICAgIG5ld01hcCA9IG5ld0xpc3QudG9LZXllZFNlcSgpLm1hcChmdW5jdGlvbihlbnRyeSApIHtyZXR1cm4gZW50cnlbMF19KS5mbGlwKCkudG9NYXAoKTtcbiAgICAgICAgaWYgKG9tYXAuX19vd25lcklEKSB7XG4gICAgICAgICAgbmV3TWFwLl9fb3duZXJJRCA9IG5ld0xpc3QuX19vd25lcklEID0gb21hcC5fX293bmVySUQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcCA9IG1hcC5yZW1vdmUoayk7XG4gICAgICAgIG5ld0xpc3QgPSBpID09PSBsaXN0LnNpemUgLSAxID8gbGlzdC5wb3AoKSA6IGxpc3Quc2V0KGksIHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoYXMpIHtcbiAgICAgICAgaWYgKHYgPT09IGxpc3QuZ2V0KGkpWzFdKSB7XG4gICAgICAgICAgcmV0dXJuIG9tYXA7XG4gICAgICAgIH1cbiAgICAgICAgbmV3TWFwID0gbWFwO1xuICAgICAgICBuZXdMaXN0ID0gbGlzdC5zZXQoaSwgW2ssIHZdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld01hcCA9IG1hcC5zZXQoaywgbGlzdC5zaXplKTtcbiAgICAgICAgbmV3TGlzdCA9IGxpc3Quc2V0KGxpc3Quc2l6ZSwgW2ssIHZdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9tYXAuX19vd25lcklEKSB7XG4gICAgICBvbWFwLnNpemUgPSBuZXdNYXAuc2l6ZTtcbiAgICAgIG9tYXAuX21hcCA9IG5ld01hcDtcbiAgICAgIG9tYXAuX2xpc3QgPSBuZXdMaXN0O1xuICAgICAgb21hcC5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gb21hcDtcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VPcmRlcmVkTWFwKG5ld01hcCwgbmV3TGlzdCk7XG4gIH1cblxuICBjcmVhdGVDbGFzcyhTdGFjaywgSW5kZXhlZENvbGxlY3Rpb24pO1xuXG4gICAgLy8gQHByYWdtYSBDb25zdHJ1Y3Rpb25cblxuICAgIGZ1bmN0aW9uIFN0YWNrKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGVtcHR5U3RhY2soKSA6XG4gICAgICAgIGlzU3RhY2sodmFsdWUpID8gdmFsdWUgOlxuICAgICAgICBlbXB0eVN0YWNrKCkudW5zaGlmdEFsbCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgU3RhY2sub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gdGhpcyhhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBTdGFjay5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ1N0YWNrIFsnLCAnXScpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIEFjY2Vzc1xuXG4gICAgU3RhY2sucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGluZGV4LCBub3RTZXRWYWx1ZSkge1xuICAgICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkO1xuICAgICAgd2hpbGUgKGhlYWQgJiYgaW5kZXgtLSkge1xuICAgICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhlYWQgPyBoZWFkLnZhbHVlIDogbm90U2V0VmFsdWU7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5faGVhZCAmJiB0aGlzLl9oZWFkLnZhbHVlO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIE1vZGlmaWNhdGlvblxuXG4gICAgU3RhY2sucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5zaXplICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZDtcbiAgICAgIGZvciAodmFyIGlpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGlpID49IDA7IGlpLS0pIHtcbiAgICAgICAgaGVhZCA9IHtcbiAgICAgICAgICB2YWx1ZTogYXJndW1lbnRzW2lpXSxcbiAgICAgICAgICBuZXh0OiBoZWFkXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgdGhpcy5zaXplID0gbmV3U2l6ZTtcbiAgICAgICAgdGhpcy5faGVhZCA9IGhlYWQ7XG4gICAgICAgIHRoaXMuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ha2VTdGFjayhuZXdTaXplLCBoZWFkKTtcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLnB1c2hBbGwgPSBmdW5jdGlvbihpdGVyKSB7XG4gICAgICBpdGVyID0gSW5kZXhlZEl0ZXJhYmxlKGl0ZXIpO1xuICAgICAgaWYgKGl0ZXIuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGFzc2VydE5vdEluZmluaXRlKGl0ZXIuc2l6ZSk7XG4gICAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuc2l6ZTtcbiAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZDtcbiAgICAgIGl0ZXIucmV2ZXJzZSgpLmZvckVhY2goZnVuY3Rpb24odmFsdWUgKSB7XG4gICAgICAgIG5ld1NpemUrKztcbiAgICAgICAgaGVhZCA9IHtcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgbmV4dDogaGVhZFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgdGhpcy5zaXplID0gbmV3U2l6ZTtcbiAgICAgICAgdGhpcy5faGVhZCA9IGhlYWQ7XG4gICAgICAgIHRoaXMuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ha2VTdGFjayhuZXdTaXplLCBoZWFkKTtcbiAgICB9O1xuXG4gICAgU3RhY2sucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2xpY2UoMSk7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgcmV0dXJuIHRoaXMucHVzaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBTdGFjay5wcm90b3R5cGUudW5zaGlmdEFsbCA9IGZ1bmN0aW9uKGl0ZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnB1c2hBbGwoaXRlcik7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS5zaGlmdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucG9wLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICB0aGlzLnNpemUgPSAwO1xuICAgICAgICB0aGlzLl9oZWFkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbXB0eVN0YWNrKCk7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcbiAgICAgIGlmICh3aG9sZVNsaWNlKGJlZ2luLCBlbmQsIHRoaXMuc2l6ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgcmVzb2x2ZWRCZWdpbiA9IHJlc29sdmVCZWdpbihiZWdpbiwgdGhpcy5zaXplKTtcbiAgICAgIHZhciByZXNvbHZlZEVuZCA9IHJlc29sdmVFbmQoZW5kLCB0aGlzLnNpemUpO1xuICAgICAgaWYgKHJlc29sdmVkRW5kICE9PSB0aGlzLnNpemUpIHtcbiAgICAgICAgLy8gc3VwZXIuc2xpY2UoYmVnaW4sIGVuZCk7XG4gICAgICAgIHJldHVybiBJbmRleGVkQ29sbGVjdGlvbi5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLCBiZWdpbiwgZW5kKTtcbiAgICAgIH1cbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5zaXplIC0gcmVzb2x2ZWRCZWdpbjtcbiAgICAgIHZhciBoZWFkID0gdGhpcy5faGVhZDtcbiAgICAgIHdoaWxlIChyZXNvbHZlZEJlZ2luLS0pIHtcbiAgICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICB0aGlzLnNpemUgPSBuZXdTaXplO1xuICAgICAgICB0aGlzLl9oZWFkID0gaGVhZDtcbiAgICAgICAgdGhpcy5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFrZVN0YWNrKG5ld1NpemUsIGhlYWQpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIE11dGFiaWxpdHlcblxuICAgIFN0YWNrLnByb3RvdHlwZS5fX2Vuc3VyZU93bmVyID0gZnVuY3Rpb24ob3duZXJJRCkge1xuICAgICAgaWYgKG93bmVySUQgPT09IHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKCFvd25lcklEKSB7XG4gICAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgICAgdGhpcy5fX2FsdGVyZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFrZVN0YWNrKHRoaXMuc2l6ZSwgdGhpcy5faGVhZCwgb3duZXJJRCwgdGhpcy5fX2hhc2gpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIEl0ZXJhdGlvblxuXG4gICAgU3RhY2sucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy50b1NlcSgpLmNhY2hlUmVzdWx0Ll9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMuX2hlYWQ7XG4gICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAoZm4obm9kZS52YWx1ZSwgaXRlcmF0aW9ucysrLCB0aGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gICAgfTtcblxuICAgIFN0YWNrLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9TZXEoKS5jYWNoZVJlc3VsdCgpLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMuX2hlYWQ7XG4gICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBub2RlLnZhbHVlO1xuICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yRG9uZSgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuXG4gIGZ1bmN0aW9uIGlzU3RhY2sobWF5YmVTdGFjaykge1xuICAgIHJldHVybiAhIShtYXliZVN0YWNrICYmIG1heWJlU3RhY2tbSVNfU1RBQ0tfU0VOVElORUxdKTtcbiAgfVxuXG4gIFN0YWNrLmlzU3RhY2sgPSBpc1N0YWNrO1xuXG4gIHZhciBJU19TVEFDS19TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX1NUQUNLX19AQCc7XG5cbiAgdmFyIFN0YWNrUHJvdG90eXBlID0gU3RhY2sucHJvdG90eXBlO1xuICBTdGFja1Byb3RvdHlwZVtJU19TVEFDS19TRU5USU5FTF0gPSB0cnVlO1xuICBTdGFja1Byb3RvdHlwZS53aXRoTXV0YXRpb25zID0gTWFwUHJvdG90eXBlLndpdGhNdXRhdGlvbnM7XG4gIFN0YWNrUHJvdG90eXBlLmFzTXV0YWJsZSA9IE1hcFByb3RvdHlwZS5hc011dGFibGU7XG4gIFN0YWNrUHJvdG90eXBlLmFzSW1tdXRhYmxlID0gTWFwUHJvdG90eXBlLmFzSW1tdXRhYmxlO1xuICBTdGFja1Byb3RvdHlwZS53YXNBbHRlcmVkID0gTWFwUHJvdG90eXBlLndhc0FsdGVyZWQ7XG5cblxuICBmdW5jdGlvbiBtYWtlU3RhY2soc2l6ZSwgaGVhZCwgb3duZXJJRCwgaGFzaCkge1xuICAgIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKFN0YWNrUHJvdG90eXBlKTtcbiAgICBtYXAuc2l6ZSA9IHNpemU7XG4gICAgbWFwLl9oZWFkID0gaGVhZDtcbiAgICBtYXAuX19vd25lcklEID0gb3duZXJJRDtcbiAgICBtYXAuX19oYXNoID0gaGFzaDtcbiAgICBtYXAuX19hbHRlcmVkID0gZmFsc2U7XG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIHZhciBFTVBUWV9TVEFDSztcbiAgZnVuY3Rpb24gZW1wdHlTdGFjaygpIHtcbiAgICByZXR1cm4gRU1QVFlfU1RBQ0sgfHwgKEVNUFRZX1NUQUNLID0gbWFrZVN0YWNrKDApKTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKFNldCwgU2V0Q29sbGVjdGlvbik7XG5cbiAgICAvLyBAcHJhZ21hIENvbnN0cnVjdGlvblxuXG4gICAgZnVuY3Rpb24gU2V0KHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGVtcHR5U2V0KCkgOlxuICAgICAgICBpc1NldCh2YWx1ZSkgPyB2YWx1ZSA6XG4gICAgICAgIGVtcHR5U2V0KCkud2l0aE11dGF0aW9ucyhmdW5jdGlvbihzZXQgKSB7XG4gICAgICAgICAgdmFyIGl0ZXIgPSBTZXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICAgICAgYXNzZXJ0Tm90SW5maW5pdGUoaXRlci5zaXplKTtcbiAgICAgICAgICBpdGVyLmZvckVhY2goZnVuY3Rpb24odiApIHtyZXR1cm4gc2V0LmFkZCh2KX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBTZXQub2YgPSBmdW5jdGlvbigvKi4uLnZhbHVlcyovKSB7XG4gICAgICByZXR1cm4gdGhpcyhhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBTZXQuZnJvbUtleXMgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMoS2V5ZWRJdGVyYWJsZSh2YWx1ZSkua2V5U2VxKCkpO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKCdTZXQgeycsICd9Jyk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgQWNjZXNzXG5cbiAgICBTZXQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWFwLmhhcyh2YWx1ZSk7XG4gICAgfTtcblxuICAgIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgICBTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdXBkYXRlU2V0KHRoaXMsIHRoaXMuX21hcC5zZXQodmFsdWUsIHRydWUpKTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHVwZGF0ZVNldCh0aGlzLCB0aGlzLl9tYXAucmVtb3ZlKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB1cGRhdGVTZXQodGhpcywgdGhpcy5fbWFwLmNsZWFyKCkpO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIENvbXBvc2l0aW9uXG5cbiAgICBTZXQucHJvdG90eXBlLnVuaW9uID0gZnVuY3Rpb24oKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICBpdGVycyA9IGl0ZXJzLmZpbHRlcihmdW5jdGlvbih4ICkge3JldHVybiB4LnNpemUgIT09IDB9KTtcbiAgICAgIGlmIChpdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwICYmIGl0ZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RvcihpdGVyc1swXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKHNldCApIHtcbiAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGl0ZXJzLmxlbmd0aDsgaWkrKykge1xuICAgICAgICAgIFNldEl0ZXJhYmxlKGl0ZXJzW2lpXSkuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSApIHtyZXR1cm4gc2V0LmFkZCh2YWx1ZSl9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24oKSB7dmFyIGl0ZXJzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICBpZiAoaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaXRlcnMgPSBpdGVycy5tYXAoZnVuY3Rpb24oaXRlciApIHtyZXR1cm4gU2V0SXRlcmFibGUoaXRlcil9KTtcbiAgICAgIHZhciBvcmlnaW5hbFNldCA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcy53aXRoTXV0YXRpb25zKGZ1bmN0aW9uKHNldCApIHtcbiAgICAgICAgb3JpZ2luYWxTZXQuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSApIHtcbiAgICAgICAgICBpZiAoIWl0ZXJzLmV2ZXJ5KGZ1bmN0aW9uKGl0ZXIgKSB7cmV0dXJuIGl0ZXIuY29udGFpbnModmFsdWUpfSkpIHtcbiAgICAgICAgICAgIHNldC5yZW1vdmUodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uKCkge3ZhciBpdGVycyA9IFNMSUNFJDAuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgaWYgKGl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGl0ZXJzID0gaXRlcnMubWFwKGZ1bmN0aW9uKGl0ZXIgKSB7cmV0dXJuIFNldEl0ZXJhYmxlKGl0ZXIpfSk7XG4gICAgICB2YXIgb3JpZ2luYWxTZXQgPSB0aGlzO1xuICAgICAgcmV0dXJuIHRoaXMud2l0aE11dGF0aW9ucyhmdW5jdGlvbihzZXQgKSB7XG4gICAgICAgIG9yaWdpbmFsU2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUgKSB7XG4gICAgICAgICAgaWYgKGl0ZXJzLnNvbWUoZnVuY3Rpb24oaXRlciApIHtyZXR1cm4gaXRlci5jb250YWlucyh2YWx1ZSl9KSkge1xuICAgICAgICAgICAgc2V0LnJlbW92ZSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy51bmlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLm1lcmdlV2l0aCA9IGZ1bmN0aW9uKG1lcmdlcikge3ZhciBpdGVycyA9IFNMSUNFJDAuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmV0dXJuIHRoaXMudW5pb24uYXBwbHkodGhpcywgaXRlcnMpO1xuICAgIH07XG5cbiAgICBTZXQucHJvdG90eXBlLnNvcnQgPSBmdW5jdGlvbihjb21wYXJhdG9yKSB7XG4gICAgICAvLyBMYXRlIGJpbmRpbmdcbiAgICAgIHJldHVybiBPcmRlcmVkU2V0KHNvcnRGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IpKTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5zb3J0QnkgPSBmdW5jdGlvbihtYXBwZXIsIGNvbXBhcmF0b3IpIHtcbiAgICAgIC8vIExhdGUgYmluZGluZ1xuICAgICAgcmV0dXJuIE9yZGVyZWRTZXQoc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvciwgbWFwcGVyKSk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUud2FzQWx0ZXJlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX21hcC53YXNBbHRlcmVkKCk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24oZm4sIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLl9tYXAuX19pdGVyYXRlKGZ1bmN0aW9uKF8sIGspICB7cmV0dXJuIGZuKGssIGssIHRoaXMkMCl9LCByZXZlcnNlKTtcbiAgICB9O1xuXG4gICAgU2V0LnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX21hcC5tYXAoZnVuY3Rpb24oXywgaykgIHtyZXR1cm4ga30pLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgfTtcblxuICAgIFNldC5wcm90b3R5cGUuX19lbnN1cmVPd25lciA9IGZ1bmN0aW9uKG93bmVySUQpIHtcbiAgICAgIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBuZXdNYXAgPSB0aGlzLl9tYXAuX19lbnN1cmVPd25lcihvd25lcklEKTtcbiAgICAgIGlmICghb3duZXJJRCkge1xuICAgICAgICB0aGlzLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgICAgIHRoaXMuX21hcCA9IG5ld01hcDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fX21ha2UobmV3TWFwLCBvd25lcklEKTtcbiAgICB9O1xuXG5cbiAgZnVuY3Rpb24gaXNTZXQobWF5YmVTZXQpIHtcbiAgICByZXR1cm4gISEobWF5YmVTZXQgJiYgbWF5YmVTZXRbSVNfU0VUX1NFTlRJTkVMXSk7XG4gIH1cblxuICBTZXQuaXNTZXQgPSBpc1NldDtcblxuICB2YXIgSVNfU0VUX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfU0VUX19AQCc7XG5cbiAgdmFyIFNldFByb3RvdHlwZSA9IFNldC5wcm90b3R5cGU7XG4gIFNldFByb3RvdHlwZVtJU19TRVRfU0VOVElORUxdID0gdHJ1ZTtcbiAgU2V0UHJvdG90eXBlW0RFTEVURV0gPSBTZXRQcm90b3R5cGUucmVtb3ZlO1xuICBTZXRQcm90b3R5cGUubWVyZ2VEZWVwID0gU2V0UHJvdG90eXBlLm1lcmdlO1xuICBTZXRQcm90b3R5cGUubWVyZ2VEZWVwV2l0aCA9IFNldFByb3RvdHlwZS5tZXJnZVdpdGg7XG4gIFNldFByb3RvdHlwZS53aXRoTXV0YXRpb25zID0gTWFwUHJvdG90eXBlLndpdGhNdXRhdGlvbnM7XG4gIFNldFByb3RvdHlwZS5hc011dGFibGUgPSBNYXBQcm90b3R5cGUuYXNNdXRhYmxlO1xuICBTZXRQcm90b3R5cGUuYXNJbW11dGFibGUgPSBNYXBQcm90b3R5cGUuYXNJbW11dGFibGU7XG5cbiAgU2V0UHJvdG90eXBlLl9fZW1wdHkgPSBlbXB0eVNldDtcbiAgU2V0UHJvdG90eXBlLl9fbWFrZSA9IG1ha2VTZXQ7XG5cbiAgZnVuY3Rpb24gdXBkYXRlU2V0KHNldCwgbmV3TWFwKSB7XG4gICAgaWYgKHNldC5fX293bmVySUQpIHtcbiAgICAgIHNldC5zaXplID0gbmV3TWFwLnNpemU7XG4gICAgICBzZXQuX21hcCA9IG5ld01hcDtcbiAgICAgIHJldHVybiBzZXQ7XG4gICAgfVxuICAgIHJldHVybiBuZXdNYXAgPT09IHNldC5fbWFwID8gc2V0IDpcbiAgICAgIG5ld01hcC5zaXplID09PSAwID8gc2V0Ll9fZW1wdHkoKSA6XG4gICAgICBzZXQuX19tYWtlKG5ld01hcCk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlU2V0KG1hcCwgb3duZXJJRCkge1xuICAgIHZhciBzZXQgPSBPYmplY3QuY3JlYXRlKFNldFByb3RvdHlwZSk7XG4gICAgc2V0LnNpemUgPSBtYXAgPyBtYXAuc2l6ZSA6IDA7XG4gICAgc2V0Ll9tYXAgPSBtYXA7XG4gICAgc2V0Ll9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgcmV0dXJuIHNldDtcbiAgfVxuXG4gIHZhciBFTVBUWV9TRVQ7XG4gIGZ1bmN0aW9uIGVtcHR5U2V0KCkge1xuICAgIHJldHVybiBFTVBUWV9TRVQgfHwgKEVNUFRZX1NFVCA9IG1ha2VTZXQoZW1wdHlNYXAoKSkpO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoT3JkZXJlZFNldCwgU2V0KTtcblxuICAgIC8vIEBwcmFnbWEgQ29uc3RydWN0aW9uXG5cbiAgICBmdW5jdGlvbiBPcmRlcmVkU2V0KHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IGVtcHR5T3JkZXJlZFNldCgpIDpcbiAgICAgICAgaXNPcmRlcmVkU2V0KHZhbHVlKSA/IHZhbHVlIDpcbiAgICAgICAgZW1wdHlPcmRlcmVkU2V0KCkud2l0aE11dGF0aW9ucyhmdW5jdGlvbihzZXQgKSB7XG4gICAgICAgICAgdmFyIGl0ZXIgPSBTZXRJdGVyYWJsZSh2YWx1ZSk7XG4gICAgICAgICAgYXNzZXJ0Tm90SW5maW5pdGUoaXRlci5zaXplKTtcbiAgICAgICAgICBpdGVyLmZvckVhY2goZnVuY3Rpb24odiApIHtyZXR1cm4gc2V0LmFkZCh2KX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBPcmRlcmVkU2V0Lm9mID0gZnVuY3Rpb24oLyouLi52YWx1ZXMqLykge1xuICAgICAgcmV0dXJuIHRoaXMoYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgT3JkZXJlZFNldC5mcm9tS2V5cyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcyhLZXllZEl0ZXJhYmxlKHZhbHVlKS5rZXlTZXEoKSk7XG4gICAgfTtcblxuICAgIE9yZGVyZWRTZXQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKCdPcmRlcmVkU2V0IHsnLCAnfScpO1xuICAgIH07XG5cblxuICBmdW5jdGlvbiBpc09yZGVyZWRTZXQobWF5YmVPcmRlcmVkU2V0KSB7XG4gICAgcmV0dXJuIGlzU2V0KG1heWJlT3JkZXJlZFNldCkgJiYgaXNPcmRlcmVkKG1heWJlT3JkZXJlZFNldCk7XG4gIH1cblxuICBPcmRlcmVkU2V0LmlzT3JkZXJlZFNldCA9IGlzT3JkZXJlZFNldDtcblxuICB2YXIgT3JkZXJlZFNldFByb3RvdHlwZSA9IE9yZGVyZWRTZXQucHJvdG90eXBlO1xuICBPcmRlcmVkU2V0UHJvdG90eXBlW0lTX09SREVSRURfU0VOVElORUxdID0gdHJ1ZTtcblxuICBPcmRlcmVkU2V0UHJvdG90eXBlLl9fZW1wdHkgPSBlbXB0eU9yZGVyZWRTZXQ7XG4gIE9yZGVyZWRTZXRQcm90b3R5cGUuX19tYWtlID0gbWFrZU9yZGVyZWRTZXQ7XG5cbiAgZnVuY3Rpb24gbWFrZU9yZGVyZWRTZXQobWFwLCBvd25lcklEKSB7XG4gICAgdmFyIHNldCA9IE9iamVjdC5jcmVhdGUoT3JkZXJlZFNldFByb3RvdHlwZSk7XG4gICAgc2V0LnNpemUgPSBtYXAgPyBtYXAuc2l6ZSA6IDA7XG4gICAgc2V0Ll9tYXAgPSBtYXA7XG4gICAgc2V0Ll9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgcmV0dXJuIHNldDtcbiAgfVxuXG4gIHZhciBFTVBUWV9PUkRFUkVEX1NFVDtcbiAgZnVuY3Rpb24gZW1wdHlPcmRlcmVkU2V0KCkge1xuICAgIHJldHVybiBFTVBUWV9PUkRFUkVEX1NFVCB8fCAoRU1QVFlfT1JERVJFRF9TRVQgPSBtYWtlT3JkZXJlZFNldChlbXB0eU9yZGVyZWRNYXAoKSkpO1xuICB9XG5cbiAgY3JlYXRlQ2xhc3MoUmVjb3JkLCBLZXllZENvbGxlY3Rpb24pO1xuXG4gICAgZnVuY3Rpb24gUmVjb3JkKGRlZmF1bHRWYWx1ZXMsIG5hbWUpIHtcbiAgICAgIHZhciBSZWNvcmRUeXBlID0gZnVuY3Rpb24gUmVjb3JkKHZhbHVlcykge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmVjb3JkVHlwZSkpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFJlY29yZFR5cGUodmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tYXAgPSBNYXAodmFsdWVzKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGVmYXVsdFZhbHVlcyk7XG5cbiAgICAgIHZhciBSZWNvcmRUeXBlUHJvdG90eXBlID0gUmVjb3JkVHlwZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFJlY29yZFByb3RvdHlwZSk7XG4gICAgICBSZWNvcmRUeXBlUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmVjb3JkVHlwZTtcbiAgICAgIG5hbWUgJiYgKFJlY29yZFR5cGVQcm90b3R5cGUuX25hbWUgPSBuYW1lKTtcbiAgICAgIFJlY29yZFR5cGVQcm90b3R5cGUuX2RlZmF1bHRWYWx1ZXMgPSBkZWZhdWx0VmFsdWVzO1xuICAgICAgUmVjb3JkVHlwZVByb3RvdHlwZS5fa2V5cyA9IGtleXM7XG4gICAgICBSZWNvcmRUeXBlUHJvdG90eXBlLnNpemUgPSBrZXlzLmxlbmd0aDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSApIHtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVjb3JkVHlwZS5wcm90b3R5cGUsIGtleSwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KGtleSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICBpbnZhcmlhbnQodGhpcy5fX293bmVySUQsICdDYW5ub3Qgc2V0IG9uIGFuIGltbXV0YWJsZSByZWNvcmQuJyk7XG4gICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBmYWlsZWQuIFByb2JhYmx5IElFOC5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFJlY29yZFR5cGU7XG4gICAgfVxuXG4gICAgUmVjb3JkLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX190b1N0cmluZyhyZWNvcmROYW1lKHRoaXMpICsgJyB7JywgJ30nKTtcbiAgICB9O1xuXG4gICAgLy8gQHByYWdtYSBBY2Nlc3NcblxuICAgIFJlY29yZC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24oaykge1xuICAgICAgcmV0dXJuIHRoaXMuX2RlZmF1bHRWYWx1ZXMuaGFzT3duUHJvcGVydHkoayk7XG4gICAgfTtcblxuICAgIFJlY29yZC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaywgbm90U2V0VmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5oYXMoaykpIHtcbiAgICAgICAgcmV0dXJuIG5vdFNldFZhbHVlO1xuICAgICAgfVxuICAgICAgdmFyIGRlZmF1bHRWYWwgPSB0aGlzLl9kZWZhdWx0VmFsdWVzW2tdO1xuICAgICAgcmV0dXJuIHRoaXMuX21hcCA/IHRoaXMuX21hcC5nZXQoaywgZGVmYXVsdFZhbCkgOiBkZWZhdWx0VmFsO1xuICAgIH07XG5cbiAgICAvLyBAcHJhZ21hIE1vZGlmaWNhdGlvblxuXG4gICAgUmVjb3JkLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICAgIHRoaXMuX21hcCAmJiB0aGlzLl9tYXAuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgU3VwZXJSZWNvcmQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykuY29uc3RydWN0b3I7XG4gICAgICByZXR1cm4gU3VwZXJSZWNvcmQuX2VtcHR5IHx8IChTdXBlclJlY29yZC5fZW1wdHkgPSBtYWtlUmVjb3JkKHRoaXMsIGVtcHR5TWFwKCkpKTtcbiAgICB9O1xuXG4gICAgUmVjb3JkLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrLCB2KSB7XG4gICAgICBpZiAoIXRoaXMuaGFzKGspKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHNldCB1bmtub3duIGtleSBcIicgKyBrICsgJ1wiIG9uICcgKyByZWNvcmROYW1lKHRoaXMpKTtcbiAgICAgIH1cbiAgICAgIHZhciBuZXdNYXAgPSB0aGlzLl9tYXAgJiYgdGhpcy5fbWFwLnNldChrLCB2KTtcbiAgICAgIGlmICh0aGlzLl9fb3duZXJJRCB8fCBuZXdNYXAgPT09IHRoaXMuX21hcCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYWtlUmVjb3JkKHRoaXMsIG5ld01hcCk7XG4gICAgfTtcblxuICAgIFJlY29yZC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaykge1xuICAgICAgaWYgKCF0aGlzLmhhcyhrKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHZhciBuZXdNYXAgPSB0aGlzLl9tYXAgJiYgdGhpcy5fbWFwLnJlbW92ZShrKTtcbiAgICAgIGlmICh0aGlzLl9fb3duZXJJRCB8fCBuZXdNYXAgPT09IHRoaXMuX21hcCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYWtlUmVjb3JkKHRoaXMsIG5ld01hcCk7XG4gICAgfTtcblxuICAgIFJlY29yZC5wcm90b3R5cGUud2FzQWx0ZXJlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX21hcC53YXNBbHRlcmVkKCk7XG4gICAgfTtcblxuICAgIFJlY29yZC5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uKHR5cGUsIHJldmVyc2UpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiBLZXllZEl0ZXJhYmxlKHRoaXMuX2RlZmF1bHRWYWx1ZXMpLm1hcChmdW5jdGlvbihfLCBrKSAge3JldHVybiB0aGlzJDAuZ2V0KGspfSkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICB9O1xuXG4gICAgUmVjb3JkLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbihmbiwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgcmV0dXJuIEtleWVkSXRlcmFibGUodGhpcy5fZGVmYXVsdFZhbHVlcykubWFwKGZ1bmN0aW9uKF8sIGspICB7cmV0dXJuIHRoaXMkMC5nZXQoayl9KS5fX2l0ZXJhdGUoZm4sIHJldmVyc2UpO1xuICAgIH07XG5cbiAgICBSZWNvcmQucHJvdG90eXBlLl9fZW5zdXJlT3duZXIgPSBmdW5jdGlvbihvd25lcklEKSB7XG4gICAgICBpZiAob3duZXJJRCA9PT0gdGhpcy5fX293bmVySUQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICB2YXIgbmV3TWFwID0gdGhpcy5fbWFwICYmIHRoaXMuX21hcC5fX2Vuc3VyZU93bmVyKG93bmVySUQpO1xuICAgICAgaWYgKCFvd25lcklEKSB7XG4gICAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgICAgdGhpcy5fbWFwID0gbmV3TWFwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYWtlUmVjb3JkKHRoaXMsIG5ld01hcCwgb3duZXJJRCk7XG4gICAgfTtcblxuXG4gIHZhciBSZWNvcmRQcm90b3R5cGUgPSBSZWNvcmQucHJvdG90eXBlO1xuICBSZWNvcmRQcm90b3R5cGVbREVMRVRFXSA9IFJlY29yZFByb3RvdHlwZS5yZW1vdmU7XG4gIFJlY29yZFByb3RvdHlwZS5kZWxldGVJbiA9XG4gIFJlY29yZFByb3RvdHlwZS5yZW1vdmVJbiA9IE1hcFByb3RvdHlwZS5yZW1vdmVJbjtcbiAgUmVjb3JkUHJvdG90eXBlLm1lcmdlID0gTWFwUHJvdG90eXBlLm1lcmdlO1xuICBSZWNvcmRQcm90b3R5cGUubWVyZ2VXaXRoID0gTWFwUHJvdG90eXBlLm1lcmdlV2l0aDtcbiAgUmVjb3JkUHJvdG90eXBlLm1lcmdlSW4gPSBNYXBQcm90b3R5cGUubWVyZ2VJbjtcbiAgUmVjb3JkUHJvdG90eXBlLm1lcmdlRGVlcCA9IE1hcFByb3RvdHlwZS5tZXJnZURlZXA7XG4gIFJlY29yZFByb3RvdHlwZS5tZXJnZURlZXBXaXRoID0gTWFwUHJvdG90eXBlLm1lcmdlRGVlcFdpdGg7XG4gIFJlY29yZFByb3RvdHlwZS5tZXJnZURlZXBJbiA9IE1hcFByb3RvdHlwZS5tZXJnZURlZXBJbjtcbiAgUmVjb3JkUHJvdG90eXBlLnNldEluID0gTWFwUHJvdG90eXBlLnNldEluO1xuICBSZWNvcmRQcm90b3R5cGUudXBkYXRlID0gTWFwUHJvdG90eXBlLnVwZGF0ZTtcbiAgUmVjb3JkUHJvdG90eXBlLnVwZGF0ZUluID0gTWFwUHJvdG90eXBlLnVwZGF0ZUluO1xuICBSZWNvcmRQcm90b3R5cGUud2l0aE11dGF0aW9ucyA9IE1hcFByb3RvdHlwZS53aXRoTXV0YXRpb25zO1xuICBSZWNvcmRQcm90b3R5cGUuYXNNdXRhYmxlID0gTWFwUHJvdG90eXBlLmFzTXV0YWJsZTtcbiAgUmVjb3JkUHJvdG90eXBlLmFzSW1tdXRhYmxlID0gTWFwUHJvdG90eXBlLmFzSW1tdXRhYmxlO1xuXG5cbiAgZnVuY3Rpb24gbWFrZVJlY29yZChsaWtlUmVjb3JkLCBtYXAsIG93bmVySUQpIHtcbiAgICB2YXIgcmVjb3JkID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YobGlrZVJlY29yZCkpO1xuICAgIHJlY29yZC5fbWFwID0gbWFwO1xuICAgIHJlY29yZC5fX293bmVySUQgPSBvd25lcklEO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiByZWNvcmROYW1lKHJlY29yZCkge1xuICAgIHJldHVybiByZWNvcmQuX25hbWUgfHwgcmVjb3JkLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cblxuICBmdW5jdGlvbiBkZWVwRXF1YWwoYSwgYikge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAhaXNJdGVyYWJsZShiKSB8fFxuICAgICAgYS5zaXplICE9PSB1bmRlZmluZWQgJiYgYi5zaXplICE9PSB1bmRlZmluZWQgJiYgYS5zaXplICE9PSBiLnNpemUgfHxcbiAgICAgIGEuX19oYXNoICE9PSB1bmRlZmluZWQgJiYgYi5fX2hhc2ggIT09IHVuZGVmaW5lZCAmJiBhLl9faGFzaCAhPT0gYi5fX2hhc2ggfHxcbiAgICAgIGlzS2V5ZWQoYSkgIT09IGlzS2V5ZWQoYikgfHxcbiAgICAgIGlzSW5kZXhlZChhKSAhPT0gaXNJbmRleGVkKGIpIHx8XG4gICAgICBpc09yZGVyZWQoYSkgIT09IGlzT3JkZXJlZChiKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChhLnNpemUgPT09IDAgJiYgYi5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgbm90QXNzb2NpYXRpdmUgPSAhaXNBc3NvY2lhdGl2ZShhKTtcblxuICAgIGlmIChpc09yZGVyZWQoYSkpIHtcbiAgICAgIHZhciBlbnRyaWVzID0gYS5lbnRyaWVzKCk7XG4gICAgICByZXR1cm4gYi5ldmVyeShmdW5jdGlvbih2LCBrKSAge1xuICAgICAgICB2YXIgZW50cnkgPSBlbnRyaWVzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgcmV0dXJuIGVudHJ5ICYmIGlzKGVudHJ5WzFdLCB2KSAmJiAobm90QXNzb2NpYXRpdmUgfHwgaXMoZW50cnlbMF0sIGspKTtcbiAgICAgIH0pICYmIGVudHJpZXMubmV4dCgpLmRvbmU7XG4gICAgfVxuXG4gICAgdmFyIGZsaXBwZWQgPSBmYWxzZTtcblxuICAgIGlmIChhLnNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGIuc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGEuY2FjaGVSZXN1bHQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZsaXBwZWQgPSB0cnVlO1xuICAgICAgICB2YXIgXyA9IGE7XG4gICAgICAgIGEgPSBiO1xuICAgICAgICBiID0gXztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYWxsRXF1YWwgPSB0cnVlO1xuICAgIHZhciBiU2l6ZSA9IGIuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGspICB7XG4gICAgICBpZiAobm90QXNzb2NpYXRpdmUgPyAhYS5oYXModikgOlxuICAgICAgICAgIGZsaXBwZWQgPyAhaXModiwgYS5nZXQoaywgTk9UX1NFVCkpIDogIWlzKGEuZ2V0KGssIE5PVF9TRVQpLCB2KSkge1xuICAgICAgICBhbGxFcXVhbCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYWxsRXF1YWwgJiYgYS5zaXplID09PSBiU2l6ZTtcbiAgfVxuXG4gIGNyZWF0ZUNsYXNzKFJhbmdlLCBJbmRleGVkU2VxKTtcblxuICAgIGZ1bmN0aW9uIFJhbmdlKHN0YXJ0LCBlbmQsIHN0ZXApIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kLCBzdGVwKTtcbiAgICAgIH1cbiAgICAgIGludmFyaWFudChzdGVwICE9PSAwLCAnQ2Fubm90IHN0ZXAgYSBSYW5nZSBieSAwJyk7XG4gICAgICBzdGFydCA9IHN0YXJ0IHx8IDA7XG4gICAgICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZW5kID0gSW5maW5pdHk7XG4gICAgICB9XG4gICAgICBzdGVwID0gc3RlcCA9PT0gdW5kZWZpbmVkID8gMSA6IE1hdGguYWJzKHN0ZXApO1xuICAgICAgaWYgKGVuZCA8IHN0YXJ0KSB7XG4gICAgICAgIHN0ZXAgPSAtc3RlcDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3N0YXJ0ID0gc3RhcnQ7XG4gICAgICB0aGlzLl9lbmQgPSBlbmQ7XG4gICAgICB0aGlzLl9zdGVwID0gc3RlcDtcbiAgICAgIHRoaXMuc2l6ZSA9IE1hdGgubWF4KDAsIE1hdGguY2VpbCgoZW5kIC0gc3RhcnQpIC8gc3RlcCAtIDEpICsgMSk7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIGlmIChFTVBUWV9SQU5HRSkge1xuICAgICAgICAgIHJldHVybiBFTVBUWV9SQU5HRTtcbiAgICAgICAgfVxuICAgICAgICBFTVBUWV9SQU5HRSA9IHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgUmFuZ2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnUmFuZ2UgW10nO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdSYW5nZSBbICcgK1xuICAgICAgICB0aGlzLl9zdGFydCArICcuLi4nICsgdGhpcy5fZW5kICtcbiAgICAgICAgKHRoaXMuX3N0ZXAgPiAxID8gJyBieSAnICsgdGhpcy5fc3RlcCA6ICcnKSArXG4gICAgICAnIF0nO1xuICAgIH07XG5cbiAgICBSYW5nZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaW5kZXgsIG5vdFNldFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXMoaW5kZXgpID9cbiAgICAgICAgdGhpcy5fc3RhcnQgKyB3cmFwSW5kZXgodGhpcywgaW5kZXgpICogdGhpcy5fc3RlcCA6XG4gICAgICAgIG5vdFNldFZhbHVlO1xuICAgIH07XG5cbiAgICBSYW5nZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihzZWFyY2hWYWx1ZSkge1xuICAgICAgdmFyIHBvc3NpYmxlSW5kZXggPSAoc2VhcmNoVmFsdWUgLSB0aGlzLl9zdGFydCkgLyB0aGlzLl9zdGVwO1xuICAgICAgcmV0dXJuIHBvc3NpYmxlSW5kZXggPj0gMCAmJlxuICAgICAgICBwb3NzaWJsZUluZGV4IDwgdGhpcy5zaXplICYmXG4gICAgICAgIHBvc3NpYmxlSW5kZXggPT09IE1hdGguZmxvb3IocG9zc2libGVJbmRleCk7XG4gICAgfTtcblxuICAgIFJhbmdlLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcbiAgICAgIGlmICh3aG9sZVNsaWNlKGJlZ2luLCBlbmQsIHRoaXMuc2l6ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBiZWdpbiA9IHJlc29sdmVCZWdpbihiZWdpbiwgdGhpcy5zaXplKTtcbiAgICAgIGVuZCA9IHJlc29sdmVFbmQoZW5kLCB0aGlzLnNpemUpO1xuICAgICAgaWYgKGVuZCA8PSBiZWdpbikge1xuICAgICAgICByZXR1cm4gbmV3IFJhbmdlKDAsIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBSYW5nZSh0aGlzLmdldChiZWdpbiwgdGhpcy5fZW5kKSwgdGhpcy5nZXQoZW5kLCB0aGlzLl9lbmQpLCB0aGlzLl9zdGVwKTtcbiAgICB9O1xuXG4gICAgUmFuZ2UucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihzZWFyY2hWYWx1ZSkge1xuICAgICAgdmFyIG9mZnNldFZhbHVlID0gc2VhcmNoVmFsdWUgLSB0aGlzLl9zdGFydDtcbiAgICAgIGlmIChvZmZzZXRWYWx1ZSAlIHRoaXMuX3N0ZXAgPT09IDApIHtcbiAgICAgICAgdmFyIGluZGV4ID0gb2Zmc2V0VmFsdWUgLyB0aGlzLl9zdGVwO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuc2l6ZSkge1xuICAgICAgICAgIHJldHVybiBpbmRleFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIFJhbmdlLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmRleE9mKHNlYXJjaFZhbHVlKTtcbiAgICB9O1xuXG4gICAgUmFuZ2UucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICB2YXIgbWF4SW5kZXggPSB0aGlzLnNpemUgLSAxO1xuICAgICAgdmFyIHN0ZXAgPSB0aGlzLl9zdGVwO1xuICAgICAgdmFyIHZhbHVlID0gcmV2ZXJzZSA/IHRoaXMuX3N0YXJ0ICsgbWF4SW5kZXggKiBzdGVwIDogdGhpcy5fc3RhcnQ7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDw9IG1heEluZGV4OyBpaSsrKSB7XG4gICAgICAgIGlmIChmbih2YWx1ZSwgaWksIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybiBpaSArIDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgKz0gcmV2ZXJzZSA/IC1zdGVwIDogc3RlcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpaTtcbiAgICB9O1xuXG4gICAgUmFuZ2UucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbih0eXBlLCByZXZlcnNlKSB7XG4gICAgICB2YXIgbWF4SW5kZXggPSB0aGlzLnNpemUgLSAxO1xuICAgICAgdmFyIHN0ZXAgPSB0aGlzLl9zdGVwO1xuICAgICAgdmFyIHZhbHVlID0gcmV2ZXJzZSA/IHRoaXMuX3N0YXJ0ICsgbWF4SW5kZXggKiBzdGVwIDogdGhpcy5fc3RhcnQ7XG4gICAgICB2YXIgaWkgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbigpICB7XG4gICAgICAgIHZhciB2ID0gdmFsdWU7XG4gICAgICAgIHZhbHVlICs9IHJldmVyc2UgPyAtc3RlcCA6IHN0ZXA7XG4gICAgICAgIHJldHVybiBpaSA+IG1heEluZGV4ID8gaXRlcmF0b3JEb25lKCkgOiBpdGVyYXRvclZhbHVlKHR5cGUsIGlpKyssIHYpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFJhbmdlLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgUmFuZ2UgP1xuICAgICAgICB0aGlzLl9zdGFydCA9PT0gb3RoZXIuX3N0YXJ0ICYmXG4gICAgICAgIHRoaXMuX2VuZCA9PT0gb3RoZXIuX2VuZCAmJlxuICAgICAgICB0aGlzLl9zdGVwID09PSBvdGhlci5fc3RlcCA6XG4gICAgICAgIGRlZXBFcXVhbCh0aGlzLCBvdGhlcik7XG4gICAgfTtcblxuXG4gIHZhciBFTVBUWV9SQU5HRTtcblxuICBjcmVhdGVDbGFzcyhSZXBlYXQsIEluZGV4ZWRTZXEpO1xuXG4gICAgZnVuY3Rpb24gUmVwZWF0KHZhbHVlLCB0aW1lcykge1xuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlcGVhdCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXBlYXQodmFsdWUsIHRpbWVzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLnNpemUgPSB0aW1lcyA9PT0gdW5kZWZpbmVkID8gSW5maW5pdHkgOiBNYXRoLm1heCgwLCB0aW1lcyk7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIGlmIChFTVBUWV9SRVBFQVQpIHtcbiAgICAgICAgICByZXR1cm4gRU1QVFlfUkVQRUFUO1xuICAgICAgICB9XG4gICAgICAgIEVNUFRZX1JFUEVBVCA9IHRoaXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgUmVwZWF0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gJ1JlcGVhdCBbXSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gJ1JlcGVhdCBbICcgKyB0aGlzLl92YWx1ZSArICcgJyArIHRoaXMuc2l6ZSArICcgdGltZXMgXSc7XG4gICAgfTtcblxuICAgIFJlcGVhdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaW5kZXgsIG5vdFNldFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXMoaW5kZXgpID8gdGhpcy5fdmFsdWUgOiBub3RTZXRWYWx1ZTtcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICByZXR1cm4gaXModGhpcy5fdmFsdWUsIHNlYXJjaFZhbHVlKTtcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcbiAgICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgICAgcmV0dXJuIHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgc2l6ZSkgPyB0aGlzIDpcbiAgICAgICAgbmV3IFJlcGVhdCh0aGlzLl92YWx1ZSwgcmVzb2x2ZUVuZChlbmQsIHNpemUpIC0gcmVzb2x2ZUJlZ2luKGJlZ2luLCBzaXplKSk7XG4gICAgfTtcblxuICAgIFJlcGVhdC5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIFJlcGVhdC5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICBpZiAoaXModGhpcy5fdmFsdWUsIHNlYXJjaFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICBpZiAoaXModGhpcy5fdmFsdWUsIHNlYXJjaFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaXplO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICBSZXBlYXQucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uKGZuLCByZXZlcnNlKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgdGhpcy5zaXplOyBpaSsrKSB7XG4gICAgICAgIGlmIChmbih0aGlzLl92YWx1ZSwgaWksIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybiBpaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpaTtcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24odHlwZSwgcmV2ZXJzZSkge3ZhciB0aGlzJDAgPSB0aGlzO1xuICAgICAgdmFyIGlpID0gMDtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24oKSBcbiAgICAgICAge3JldHVybiBpaSA8IHRoaXMkMC5zaXplID8gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpaSsrLCB0aGlzJDAuX3ZhbHVlKSA6IGl0ZXJhdG9yRG9uZSgpfVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgUmVwZWF0LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgUmVwZWF0ID9cbiAgICAgICAgaXModGhpcy5fdmFsdWUsIG90aGVyLl92YWx1ZSkgOlxuICAgICAgICBkZWVwRXF1YWwob3RoZXIpO1xuICAgIH07XG5cblxuICB2YXIgRU1QVFlfUkVQRUFUO1xuXG4gIC8qKlxuICAgKiBDb250cmlidXRlcyBhZGRpdGlvbmFsIG1ldGhvZHMgdG8gYSBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gbWl4aW4oY3RvciwgbWV0aG9kcykge1xuICAgIHZhciBrZXlDb3BpZXIgPSBmdW5jdGlvbihrZXkgKSB7IGN0b3IucHJvdG90eXBlW2tleV0gPSBtZXRob2RzW2tleV07IH07XG4gICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaChrZXlDb3BpZXIpO1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgJiZcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMobWV0aG9kcykuZm9yRWFjaChrZXlDb3BpZXIpO1xuICAgIHJldHVybiBjdG9yO1xuICB9XG5cbiAgSXRlcmFibGUuSXRlcmF0b3IgPSBJdGVyYXRvcjtcblxuICBtaXhpbihJdGVyYWJsZSwge1xuXG4gICAgLy8gIyMjIENvbnZlcnNpb24gdG8gb3RoZXIgdHlwZXNcblxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgYXNzZXJ0Tm90SW5maW5pdGUodGhpcy5zaXplKTtcbiAgICAgIHZhciBhcnJheSA9IG5ldyBBcnJheSh0aGlzLnNpemUgfHwgMCk7XG4gICAgICB0aGlzLnZhbHVlU2VxKCkuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGkpICB7IGFycmF5W2ldID0gdjsgfSk7XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfSxcblxuICAgIHRvSW5kZXhlZFNlcTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IFRvSW5kZXhlZFNlcXVlbmNlKHRoaXMpO1xuICAgIH0sXG5cbiAgICB0b0pTOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvU2VxKCkubWFwKFxuICAgICAgICBmdW5jdGlvbih2YWx1ZSApIHtyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRvSlMgPT09ICdmdW5jdGlvbicgPyB2YWx1ZS50b0pTKCkgOiB2YWx1ZX1cbiAgICAgICkuX190b0pTKCk7XG4gICAgfSxcblxuICAgIHRvSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1NlcSgpLm1hcChcbiAgICAgICAgZnVuY3Rpb24odmFsdWUgKSB7cmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50b0pTT04gPT09ICdmdW5jdGlvbicgPyB2YWx1ZS50b0pTT04oKSA6IHZhbHVlfVxuICAgICAgKS5fX3RvSlMoKTtcbiAgICB9LFxuXG4gICAgdG9LZXllZFNlcTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IFRvS2V5ZWRTZXF1ZW5jZSh0aGlzLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgdG9NYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVXNlIExhdGUgQmluZGluZyBoZXJlIHRvIHNvbHZlIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5LlxuICAgICAgcmV0dXJuIE1hcCh0aGlzLnRvS2V5ZWRTZXEoKSk7XG4gICAgfSxcblxuICAgIHRvT2JqZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIGFzc2VydE5vdEluZmluaXRlKHRoaXMuc2l6ZSk7XG4gICAgICB2YXIgb2JqZWN0ID0ge307XG4gICAgICB0aGlzLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrKSAgeyBvYmplY3Rba10gPSB2OyB9KTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfSxcblxuICAgIHRvT3JkZXJlZE1hcDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBVc2UgTGF0ZSBCaW5kaW5nIGhlcmUgdG8gc29sdmUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgICByZXR1cm4gT3JkZXJlZE1hcCh0aGlzLnRvS2V5ZWRTZXEoKSk7XG4gICAgfSxcblxuICAgIHRvT3JkZXJlZFNldDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBVc2UgTGF0ZSBCaW5kaW5nIGhlcmUgdG8gc29sdmUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgICByZXR1cm4gT3JkZXJlZFNldChpc0tleWVkKHRoaXMpID8gdGhpcy52YWx1ZVNlcSgpIDogdGhpcyk7XG4gICAgfSxcblxuICAgIHRvU2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFVzZSBMYXRlIEJpbmRpbmcgaGVyZSB0byBzb2x2ZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICAgIHJldHVybiBTZXQoaXNLZXllZCh0aGlzKSA/IHRoaXMudmFsdWVTZXEoKSA6IHRoaXMpO1xuICAgIH0sXG5cbiAgICB0b1NldFNlcTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IFRvU2V0U2VxdWVuY2UodGhpcyk7XG4gICAgfSxcblxuICAgIHRvU2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpc0luZGV4ZWQodGhpcykgPyB0aGlzLnRvSW5kZXhlZFNlcSgpIDpcbiAgICAgICAgaXNLZXllZCh0aGlzKSA/IHRoaXMudG9LZXllZFNlcSgpIDpcbiAgICAgICAgdGhpcy50b1NldFNlcSgpO1xuICAgIH0sXG5cbiAgICB0b1N0YWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFVzZSBMYXRlIEJpbmRpbmcgaGVyZSB0byBzb2x2ZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICAgIHJldHVybiBTdGFjayhpc0tleWVkKHRoaXMpID8gdGhpcy52YWx1ZVNlcSgpIDogdGhpcyk7XG4gICAgfSxcblxuICAgIHRvTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBVc2UgTGF0ZSBCaW5kaW5nIGhlcmUgdG8gc29sdmUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgICByZXR1cm4gTGlzdChpc0tleWVkKHRoaXMpID8gdGhpcy52YWx1ZVNlcSgpIDogdGhpcyk7XG4gICAgfSxcblxuXG4gICAgLy8gIyMjIENvbW1vbiBKYXZhU2NyaXB0IG1ldGhvZHMgYW5kIHByb3BlcnRpZXNcblxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAnW0l0ZXJhYmxlXSc7XG4gICAgfSxcblxuICAgIF9fdG9TdHJpbmc6IGZ1bmN0aW9uKGhlYWQsIHRhaWwpIHtcbiAgICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGhlYWQgKyB0YWlsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhlYWQgKyAnICcgKyB0aGlzLnRvU2VxKCkubWFwKHRoaXMuX190b1N0cmluZ01hcHBlcikuam9pbignLCAnKSArICcgJyArIHRhaWw7XG4gICAgfSxcblxuXG4gICAgLy8gIyMjIEVTNiBDb2xsZWN0aW9uIG1ldGhvZHMgKEVTNiBBcnJheSBhbmQgTWFwKVxuXG4gICAgY29uY2F0OiBmdW5jdGlvbigpIHt2YXIgdmFsdWVzID0gU0xJQ0UkMC5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgY29uY2F0RmFjdG9yeSh0aGlzLCB2YWx1ZXMpKTtcbiAgICB9LFxuXG4gICAgY29udGFpbnM6IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5zb21lKGZ1bmN0aW9uKHZhbHVlICkge3JldHVybiBpcyh2YWx1ZSwgc2VhcmNoVmFsdWUpfSk7XG4gICAgfSxcblxuICAgIGVudHJpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMpO1xuICAgIH0sXG5cbiAgICBldmVyeTogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICBhc3NlcnROb3RJbmZpbml0ZSh0aGlzLnNpemUpO1xuICAgICAgdmFyIHJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICAgIHRoaXMuX19pdGVyYXRlKGZ1bmN0aW9uKHYsIGssIGMpICB7XG4gICAgICAgIGlmICghcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykpIHtcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfSxcblxuICAgIGZpbHRlcjogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgZmlsdGVyRmFjdG9yeSh0aGlzLCBwcmVkaWNhdGUsIGNvbnRleHQsIHRydWUpKTtcbiAgICB9LFxuXG4gICAgZmluZDogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0LCBub3RTZXRWYWx1ZSkge1xuICAgICAgdmFyIGVudHJ5ID0gdGhpcy5maW5kRW50cnkocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBlbnRyeSA/IGVudHJ5WzFdIDogbm90U2V0VmFsdWU7XG4gICAgfSxcblxuICAgIGZpbmRFbnRyeTogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgZm91bmQ7XG4gICAgICB0aGlzLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrLCBjKSAge1xuICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykpIHtcbiAgICAgICAgICBmb3VuZCA9IFtrLCB2XTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH0sXG5cbiAgICBmaW5kTGFzdEVudHJ5OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvU2VxKCkucmV2ZXJzZSgpLmZpbmRFbnRyeShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBmb3JFYWNoOiBmdW5jdGlvbihzaWRlRWZmZWN0LCBjb250ZXh0KSB7XG4gICAgICBhc3NlcnROb3RJbmZpbml0ZSh0aGlzLnNpemUpO1xuICAgICAgcmV0dXJuIHRoaXMuX19pdGVyYXRlKGNvbnRleHQgPyBzaWRlRWZmZWN0LmJpbmQoY29udGV4dCkgOiBzaWRlRWZmZWN0KTtcbiAgICB9LFxuXG4gICAgam9pbjogZnVuY3Rpb24oc2VwYXJhdG9yKSB7XG4gICAgICBhc3NlcnROb3RJbmZpbml0ZSh0aGlzLnNpemUpO1xuICAgICAgc2VwYXJhdG9yID0gc2VwYXJhdG9yICE9PSB1bmRlZmluZWQgPyAnJyArIHNlcGFyYXRvciA6ICcsJztcbiAgICAgIHZhciBqb2luZWQgPSAnJztcbiAgICAgIHZhciBpc0ZpcnN0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuX19pdGVyYXRlKGZ1bmN0aW9uKHYgKSB7XG4gICAgICAgIGlzRmlyc3QgPyAoaXNGaXJzdCA9IGZhbHNlKSA6IChqb2luZWQgKz0gc2VwYXJhdG9yKTtcbiAgICAgICAgam9pbmVkICs9IHYgIT09IG51bGwgJiYgdiAhPT0gdW5kZWZpbmVkID8gdiA6ICcnO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gam9pbmVkO1xuICAgIH0sXG5cbiAgICBrZXlzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9faXRlcmF0b3IoSVRFUkFURV9LRVlTKTtcbiAgICB9LFxuXG4gICAgbWFwOiBmdW5jdGlvbihtYXBwZXIsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBtYXBGYWN0b3J5KHRoaXMsIG1hcHBlciwgY29udGV4dCkpO1xuICAgIH0sXG5cbiAgICByZWR1Y2U6IGZ1bmN0aW9uKHJlZHVjZXIsIGluaXRpYWxSZWR1Y3Rpb24sIGNvbnRleHQpIHtcbiAgICAgIGFzc2VydE5vdEluZmluaXRlKHRoaXMuc2l6ZSk7XG4gICAgICB2YXIgcmVkdWN0aW9uO1xuICAgICAgdmFyIHVzZUZpcnN0O1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIHVzZUZpcnN0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZHVjdGlvbiA9IGluaXRpYWxSZWR1Y3Rpb247XG4gICAgICB9XG4gICAgICB0aGlzLl9faXRlcmF0ZShmdW5jdGlvbih2LCBrLCBjKSAge1xuICAgICAgICBpZiAodXNlRmlyc3QpIHtcbiAgICAgICAgICB1c2VGaXJzdCA9IGZhbHNlO1xuICAgICAgICAgIHJlZHVjdGlvbiA9IHY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVkdWN0aW9uID0gcmVkdWNlci5jYWxsKGNvbnRleHQsIHJlZHVjdGlvbiwgdiwgaywgYyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlZHVjdGlvbjtcbiAgICB9LFxuXG4gICAgcmVkdWNlUmlnaHQ6IGZ1bmN0aW9uKHJlZHVjZXIsIGluaXRpYWxSZWR1Y3Rpb24sIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXZlcnNlZCA9IHRoaXMudG9LZXllZFNlcSgpLnJldmVyc2UoKTtcbiAgICAgIHJldHVybiByZXZlcnNlZC5yZWR1Y2UuYXBwbHkocmV2ZXJzZWQsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIHJldmVyc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHJldmVyc2VGYWN0b3J5KHRoaXMsIHRydWUpKTtcbiAgICB9LFxuXG4gICAgc2xpY2U6IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBzbGljZUZhY3RvcnkodGhpcywgYmVnaW4sIGVuZCwgdHJ1ZSkpO1xuICAgIH0sXG5cbiAgICBzb21lOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiAhdGhpcy5ldmVyeShub3QocHJlZGljYXRlKSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHNvcnQ6IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBzb3J0RmFjdG9yeSh0aGlzLCBjb21wYXJhdG9yKSk7XG4gICAgfSxcblxuICAgIHZhbHVlczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2l0ZXJhdG9yKElURVJBVEVfVkFMVUVTKTtcbiAgICB9LFxuXG5cbiAgICAvLyAjIyMgTW9yZSBzZXF1ZW50aWFsIG1ldGhvZHNcblxuICAgIGJ1dExhc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2xpY2UoMCwgLTEpO1xuICAgIH0sXG5cbiAgICBpc0VtcHR5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpemUgIT09IHVuZGVmaW5lZCA/IHRoaXMuc2l6ZSA9PT0gMCA6ICF0aGlzLnNvbWUoZnVuY3Rpb24oKSAge3JldHVybiB0cnVlfSk7XG4gICAgfSxcblxuICAgIGNvdW50OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBlbnN1cmVTaXplKFxuICAgICAgICBwcmVkaWNhdGUgPyB0aGlzLnRvU2VxKCkuZmlsdGVyKHByZWRpY2F0ZSwgY29udGV4dCkgOiB0aGlzXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBjb3VudEJ5OiBmdW5jdGlvbihncm91cGVyLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gY291bnRCeUZhY3RvcnkodGhpcywgZ3JvdXBlciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGVxdWFsczogZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgIHJldHVybiBkZWVwRXF1YWwodGhpcywgb3RoZXIpO1xuICAgIH0sXG5cbiAgICBlbnRyeVNlcTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaXRlcmFibGUgPSB0aGlzO1xuICAgICAgaWYgKGl0ZXJhYmxlLl9jYWNoZSkge1xuICAgICAgICAvLyBXZSBjYWNoZSBhcyBhbiBlbnRyaWVzIGFycmF5LCBzbyB3ZSBjYW4ganVzdCByZXR1cm4gdGhlIGNhY2hlIVxuICAgICAgICByZXR1cm4gbmV3IEFycmF5U2VxKGl0ZXJhYmxlLl9jYWNoZSk7XG4gICAgICB9XG4gICAgICB2YXIgZW50cmllc1NlcXVlbmNlID0gaXRlcmFibGUudG9TZXEoKS5tYXAoZW50cnlNYXBwZXIpLnRvSW5kZXhlZFNlcSgpO1xuICAgICAgZW50cmllc1NlcXVlbmNlLmZyb21FbnRyeVNlcSA9IGZ1bmN0aW9uKCkgIHtyZXR1cm4gaXRlcmFibGUudG9TZXEoKX07XG4gICAgICByZXR1cm4gZW50cmllc1NlcXVlbmNlO1xuICAgIH0sXG5cbiAgICBmaWx0ZXJOb3Q6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKG5vdChwcmVkaWNhdGUpLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgZmluZExhc3Q6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCwgbm90U2V0VmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvS2V5ZWRTZXEoKS5yZXZlcnNlKCkuZmluZChwcmVkaWNhdGUsIGNvbnRleHQsIG5vdFNldFZhbHVlKTtcbiAgICB9LFxuXG4gICAgZmlyc3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZmluZChyZXR1cm5UcnVlKTtcbiAgICB9LFxuXG4gICAgZmxhdE1hcDogZnVuY3Rpb24obWFwcGVyLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgZmxhdE1hcEZhY3RvcnkodGhpcywgbWFwcGVyLCBjb250ZXh0KSk7XG4gICAgfSxcblxuICAgIGZsYXR0ZW46IGZ1bmN0aW9uKGRlcHRoKSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgZmxhdHRlbkZhY3RvcnkodGhpcywgZGVwdGgsIHRydWUpKTtcbiAgICB9LFxuXG4gICAgZnJvbUVudHJ5U2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRnJvbUVudHJpZXNTZXF1ZW5jZSh0aGlzKTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbihzZWFyY2hLZXksIG5vdFNldFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5maW5kKGZ1bmN0aW9uKF8sIGtleSkgIHtyZXR1cm4gaXMoa2V5LCBzZWFyY2hLZXkpfSwgdW5kZWZpbmVkLCBub3RTZXRWYWx1ZSk7XG4gICAgfSxcblxuICAgIGdldEluOiBmdW5jdGlvbihzZWFyY2hLZXlQYXRoLCBub3RTZXRWYWx1ZSkge1xuICAgICAgdmFyIG5lc3RlZCA9IHRoaXM7XG4gICAgICAvLyBOb3RlOiBpbiBhbiBFUzYgZW52aXJvbm1lbnQsIHdlIHdvdWxkIHByZWZlcjpcbiAgICAgIC8vIGZvciAodmFyIGtleSBvZiBzZWFyY2hLZXlQYXRoKSB7XG4gICAgICB2YXIgaXRlciA9IGZvcmNlSXRlcmF0b3Ioc2VhcmNoS2V5UGF0aCk7XG4gICAgICB2YXIgc3RlcDtcbiAgICAgIHdoaWxlICghKHN0ZXAgPSBpdGVyLm5leHQoKSkuZG9uZSkge1xuICAgICAgICB2YXIga2V5ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgbmVzdGVkID0gbmVzdGVkICYmIG5lc3RlZC5nZXQgPyBuZXN0ZWQuZ2V0KGtleSwgTk9UX1NFVCkgOiBOT1RfU0VUO1xuICAgICAgICBpZiAobmVzdGVkID09PSBOT1RfU0VUKSB7XG4gICAgICAgICAgcmV0dXJuIG5vdFNldFZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmVzdGVkO1xuICAgIH0sXG5cbiAgICBncm91cEJ5OiBmdW5jdGlvbihncm91cGVyLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZ3JvdXBCeUZhY3RvcnkodGhpcywgZ3JvdXBlciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGhhczogZnVuY3Rpb24oc2VhcmNoS2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXQoc2VhcmNoS2V5LCBOT1RfU0VUKSAhPT0gTk9UX1NFVDtcbiAgICB9LFxuXG4gICAgaGFzSW46IGZ1bmN0aW9uKHNlYXJjaEtleVBhdGgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEluKHNlYXJjaEtleVBhdGgsIE5PVF9TRVQpICE9PSBOT1RfU0VUO1xuICAgIH0sXG5cbiAgICBpc1N1YnNldDogZnVuY3Rpb24oaXRlcikge1xuICAgICAgaXRlciA9IHR5cGVvZiBpdGVyLmNvbnRhaW5zID09PSAnZnVuY3Rpb24nID8gaXRlciA6IEl0ZXJhYmxlKGl0ZXIpO1xuICAgICAgcmV0dXJuIHRoaXMuZXZlcnkoZnVuY3Rpb24odmFsdWUgKSB7cmV0dXJuIGl0ZXIuY29udGFpbnModmFsdWUpfSk7XG4gICAgfSxcblxuICAgIGlzU3VwZXJzZXQ6IGZ1bmN0aW9uKGl0ZXIpIHtcbiAgICAgIHJldHVybiBpdGVyLmlzU3Vic2V0KHRoaXMpO1xuICAgIH0sXG5cbiAgICBrZXlTZXE6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudG9TZXEoKS5tYXAoa2V5TWFwcGVyKS50b0luZGV4ZWRTZXEoKTtcbiAgICB9LFxuXG4gICAgbGFzdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1NlcSgpLnJldmVyc2UoKS5maXJzdCgpO1xuICAgIH0sXG5cbiAgICBtYXg6IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiBtYXhGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IpO1xuICAgIH0sXG5cbiAgICBtYXhCeTogZnVuY3Rpb24obWFwcGVyLCBjb21wYXJhdG9yKSB7XG4gICAgICByZXR1cm4gbWF4RmFjdG9yeSh0aGlzLCBjb21wYXJhdG9yLCBtYXBwZXIpO1xuICAgIH0sXG5cbiAgICBtaW46IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiBtYXhGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IgPyBuZWcoY29tcGFyYXRvcikgOiBkZWZhdWx0TmVnQ29tcGFyYXRvcik7XG4gICAgfSxcblxuICAgIG1pbkJ5OiBmdW5jdGlvbihtYXBwZXIsIGNvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiBtYXhGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IgPyBuZWcoY29tcGFyYXRvcikgOiBkZWZhdWx0TmVnQ29tcGFyYXRvciwgbWFwcGVyKTtcbiAgICB9LFxuXG4gICAgcmVzdDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zbGljZSgxKTtcbiAgICB9LFxuXG4gICAgc2tpcDogZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5zbGljZShNYXRoLm1heCgwLCBhbW91bnQpKTtcbiAgICB9LFxuXG4gICAgc2tpcExhc3Q6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHRoaXMudG9TZXEoKS5yZXZlcnNlKCkuc2tpcChhbW91bnQpLnJldmVyc2UoKSk7XG4gICAgfSxcblxuICAgIHNraXBXaGlsZTogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgc2tpcFdoaWxlRmFjdG9yeSh0aGlzLCBwcmVkaWNhdGUsIGNvbnRleHQsIHRydWUpKTtcbiAgICB9LFxuXG4gICAgc2tpcFVudGlsOiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnNraXBXaGlsZShub3QocHJlZGljYXRlKSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHNvcnRCeTogZnVuY3Rpb24obWFwcGVyLCBjb21wYXJhdG9yKSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvciwgbWFwcGVyKSk7XG4gICAgfSxcblxuICAgIHRha2U6IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2xpY2UoMCwgTWF0aC5tYXgoMCwgYW1vdW50KSk7XG4gICAgfSxcblxuICAgIHRha2VMYXN0OiBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCB0aGlzLnRvU2VxKCkucmV2ZXJzZSgpLnRha2UoYW1vdW50KS5yZXZlcnNlKCkpO1xuICAgIH0sXG5cbiAgICB0YWtlV2hpbGU6IGZ1bmN0aW9uKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHRha2VXaGlsZUZhY3RvcnkodGhpcywgcHJlZGljYXRlLCBjb250ZXh0KSk7XG4gICAgfSxcblxuICAgIHRha2VVbnRpbDogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy50YWtlV2hpbGUobm90KHByZWRpY2F0ZSksIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICB2YWx1ZVNlcTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50b0luZGV4ZWRTZXEoKTtcbiAgICB9LFxuXG5cbiAgICAvLyAjIyMgSGFzaGFibGUgT2JqZWN0XG5cbiAgICBoYXNoQ29kZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2hhc2ggfHwgKHRoaXMuX19oYXNoID0gaGFzaEl0ZXJhYmxlKHRoaXMpKTtcbiAgICB9LFxuXG5cbiAgICAvLyAjIyMgSW50ZXJuYWxcblxuICAgIC8vIGFic3RyYWN0IF9faXRlcmF0ZShmbiwgcmV2ZXJzZSlcblxuICAgIC8vIGFic3RyYWN0IF9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSlcbiAgfSk7XG5cbiAgLy8gdmFyIElTX0lURVJBQkxFX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfSVRFUkFCTEVfX0BAJztcbiAgLy8gdmFyIElTX0tFWUVEX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfS0VZRURfX0BAJztcbiAgLy8gdmFyIElTX0lOREVYRURfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9JTkRFWEVEX19AQCc7XG4gIC8vIHZhciBJU19PUkRFUkVEX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfT1JERVJFRF9fQEAnO1xuXG4gIHZhciBJdGVyYWJsZVByb3RvdHlwZSA9IEl0ZXJhYmxlLnByb3RvdHlwZTtcbiAgSXRlcmFibGVQcm90b3R5cGVbSVNfSVRFUkFCTEVfU0VOVElORUxdID0gdHJ1ZTtcbiAgSXRlcmFibGVQcm90b3R5cGVbSVRFUkFUT1JfU1lNQk9MXSA9IEl0ZXJhYmxlUHJvdG90eXBlLnZhbHVlcztcbiAgSXRlcmFibGVQcm90b3R5cGUuX190b0pTID0gSXRlcmFibGVQcm90b3R5cGUudG9BcnJheTtcbiAgSXRlcmFibGVQcm90b3R5cGUuX190b1N0cmluZ01hcHBlciA9IHF1b3RlU3RyaW5nO1xuICBJdGVyYWJsZVByb3RvdHlwZS5pbnNwZWN0ID1cbiAgSXRlcmFibGVQcm90b3R5cGUudG9Tb3VyY2UgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTsgfTtcbiAgSXRlcmFibGVQcm90b3R5cGUuY2hhaW4gPSBJdGVyYWJsZVByb3RvdHlwZS5mbGF0TWFwO1xuXG4gIC8vIFRlbXBvcmFyeSB3YXJuaW5nIGFib3V0IHVzaW5nIGxlbmd0aFxuICAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoSXRlcmFibGVQcm90b3R5cGUsICdsZW5ndGgnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICghSXRlcmFibGUubm9MZW5ndGhXYXJuaW5nKSB7XG4gICAgICAgICAgICB2YXIgc3RhY2s7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIHN0YWNrID0gZXJyb3Iuc3RhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhY2suaW5kZXhPZignX3dyYXBPYmplY3QnKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgY29uc29sZSAmJiBjb25zb2xlLndhcm4gJiYgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICdpdGVyYWJsZS5sZW5ndGggaGFzIGJlZW4gZGVwcmVjYXRlZCwgJytcbiAgICAgICAgICAgICAgICAndXNlIGl0ZXJhYmxlLnNpemUgb3IgaXRlcmFibGUuY291bnQoKS4gJytcbiAgICAgICAgICAgICAgICAnVGhpcyB3YXJuaW5nIHdpbGwgYmVjb21lIGEgc2lsZW50IGVycm9yIGluIGEgZnV0dXJlIHZlcnNpb24uICcgK1xuICAgICAgICAgICAgICAgIHN0YWNrXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9KSgpO1xuXG5cblxuICBtaXhpbihLZXllZEl0ZXJhYmxlLCB7XG5cbiAgICAvLyAjIyMgTW9yZSBzZXF1ZW50aWFsIG1ldGhvZHNcblxuICAgIGZsaXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlaWZ5KHRoaXMsIGZsaXBGYWN0b3J5KHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZmluZEtleTogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgZW50cnkgPSB0aGlzLmZpbmRFbnRyeShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5WzBdO1xuICAgIH0sXG5cbiAgICBmaW5kTGFzdEtleTogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy50b1NlcSgpLnJldmVyc2UoKS5maW5kS2V5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGtleU9mOiBmdW5jdGlvbihzZWFyY2hWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmluZEtleShmdW5jdGlvbih2YWx1ZSApIHtyZXR1cm4gaXModmFsdWUsIHNlYXJjaFZhbHVlKX0pO1xuICAgIH0sXG5cbiAgICBsYXN0S2V5T2Y6IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5maW5kTGFzdEtleShmdW5jdGlvbih2YWx1ZSApIHtyZXR1cm4gaXModmFsdWUsIHNlYXJjaFZhbHVlKX0pO1xuICAgIH0sXG5cbiAgICBtYXBFbnRyaWVzOiBmdW5jdGlvbihtYXBwZXIsIGNvbnRleHQpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLFxuICAgICAgICB0aGlzLnRvU2VxKCkubWFwKFxuICAgICAgICAgIGZ1bmN0aW9uKHYsIGspICB7cmV0dXJuIG1hcHBlci5jYWxsKGNvbnRleHQsIFtrLCB2XSwgaXRlcmF0aW9ucysrLCB0aGlzJDApfVxuICAgICAgICApLmZyb21FbnRyeVNlcSgpXG4gICAgICApO1xuICAgIH0sXG5cbiAgICBtYXBLZXlzOiBmdW5jdGlvbihtYXBwZXIsIGNvbnRleHQpIHt2YXIgdGhpcyQwID0gdGhpcztcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLFxuICAgICAgICB0aGlzLnRvU2VxKCkuZmxpcCgpLm1hcChcbiAgICAgICAgICBmdW5jdGlvbihrLCB2KSAge3JldHVybiBtYXBwZXIuY2FsbChjb250ZXh0LCBrLCB2LCB0aGlzJDApfVxuICAgICAgICApLmZsaXAoKVxuICAgICAgKTtcbiAgICB9LFxuXG4gIH0pO1xuXG4gIHZhciBLZXllZEl0ZXJhYmxlUHJvdG90eXBlID0gS2V5ZWRJdGVyYWJsZS5wcm90b3R5cGU7XG4gIEtleWVkSXRlcmFibGVQcm90b3R5cGVbSVNfS0VZRURfU0VOVElORUxdID0gdHJ1ZTtcbiAgS2V5ZWRJdGVyYWJsZVByb3RvdHlwZVtJVEVSQVRPUl9TWU1CT0xdID0gSXRlcmFibGVQcm90b3R5cGUuZW50cmllcztcbiAgS2V5ZWRJdGVyYWJsZVByb3RvdHlwZS5fX3RvSlMgPSBJdGVyYWJsZVByb3RvdHlwZS50b09iamVjdDtcbiAgS2V5ZWRJdGVyYWJsZVByb3RvdHlwZS5fX3RvU3RyaW5nTWFwcGVyID0gZnVuY3Rpb24odiwgaykgIHtyZXR1cm4gayArICc6ICcgKyBxdW90ZVN0cmluZyh2KX07XG5cblxuXG4gIG1peGluKEluZGV4ZWRJdGVyYWJsZSwge1xuXG4gICAgLy8gIyMjIENvbnZlcnNpb24gdG8gb3RoZXIgdHlwZXNcblxuICAgIHRvS2V5ZWRTZXE6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBUb0tleWVkU2VxdWVuY2UodGhpcywgZmFsc2UpO1xuICAgIH0sXG5cblxuICAgIC8vICMjIyBFUzYgQ29sbGVjdGlvbiBtZXRob2RzIChFUzYgQXJyYXkgYW5kIE1hcClcblxuICAgIGZpbHRlcjogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgZmlsdGVyRmFjdG9yeSh0aGlzLCBwcmVkaWNhdGUsIGNvbnRleHQsIGZhbHNlKSk7XG4gICAgfSxcblxuICAgIGZpbmRJbmRleDogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgZW50cnkgPSB0aGlzLmZpbmRFbnRyeShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGVudHJ5ID8gZW50cnlbMF0gOiAtMTtcbiAgICB9LFxuXG4gICAgaW5kZXhPZjogZnVuY3Rpb24oc2VhcmNoVmFsdWUpIHtcbiAgICAgIHZhciBrZXkgPSB0aGlzLnRvS2V5ZWRTZXEoKS5rZXlPZihzZWFyY2hWYWx1ZSk7XG4gICAgICByZXR1cm4ga2V5ID09PSB1bmRlZmluZWQgPyAtMSA6IGtleTtcbiAgICB9LFxuXG4gICAgbGFzdEluZGV4T2Y6IGZ1bmN0aW9uKHNlYXJjaFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1NlcSgpLnJldmVyc2UoKS5pbmRleE9mKHNlYXJjaFZhbHVlKTtcbiAgICB9LFxuXG4gICAgcmV2ZXJzZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgcmV2ZXJzZUZhY3RvcnkodGhpcywgZmFsc2UpKTtcbiAgICB9LFxuXG4gICAgc2xpY2U6IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBzbGljZUZhY3RvcnkodGhpcywgYmVnaW4sIGVuZCwgZmFsc2UpKTtcbiAgICB9LFxuXG4gICAgc3BsaWNlOiBmdW5jdGlvbihpbmRleCwgcmVtb3ZlTnVtIC8qLCAuLi52YWx1ZXMqLykge1xuICAgICAgdmFyIG51bUFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgcmVtb3ZlTnVtID0gTWF0aC5tYXgocmVtb3ZlTnVtIHwgMCwgMCk7XG4gICAgICBpZiAobnVtQXJncyA9PT0gMCB8fCAobnVtQXJncyA9PT0gMiAmJiAhcmVtb3ZlTnVtKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gcmVzb2x2ZUJlZ2luKGluZGV4LCB0aGlzLnNpemUpO1xuICAgICAgdmFyIHNwbGljZWQgPSB0aGlzLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgIHJldHVybiByZWlmeShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgbnVtQXJncyA9PT0gMSA/XG4gICAgICAgICAgc3BsaWNlZCA6XG4gICAgICAgICAgc3BsaWNlZC5jb25jYXQoYXJyQ29weShhcmd1bWVudHMsIDIpLCB0aGlzLnNsaWNlKGluZGV4ICsgcmVtb3ZlTnVtKSlcbiAgICAgICk7XG4gICAgfSxcblxuXG4gICAgLy8gIyMjIE1vcmUgY29sbGVjdGlvbiBtZXRob2RzXG5cbiAgICBmaW5kTGFzdEluZGV4OiBmdW5jdGlvbihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHZhciBrZXkgPSB0aGlzLnRvS2V5ZWRTZXEoKS5maW5kTGFzdEtleShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGtleSA9PT0gdW5kZWZpbmVkID8gLTEgOiBrZXk7XG4gICAgfSxcblxuICAgIGZpcnN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldCgwKTtcbiAgICB9LFxuXG4gICAgZmxhdHRlbjogZnVuY3Rpb24oZGVwdGgpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBmbGF0dGVuRmFjdG9yeSh0aGlzLCBkZXB0aCwgZmFsc2UpKTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbihpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICAgIGluZGV4ID0gd3JhcEluZGV4KHRoaXMsIGluZGV4KTtcbiAgICAgIHJldHVybiAoaW5kZXggPCAwIHx8ICh0aGlzLnNpemUgPT09IEluZmluaXR5IHx8XG4gICAgICAgICAgKHRoaXMuc2l6ZSAhPT0gdW5kZWZpbmVkICYmIGluZGV4ID4gdGhpcy5zaXplKSkpID9cbiAgICAgICAgbm90U2V0VmFsdWUgOlxuICAgICAgICB0aGlzLmZpbmQoZnVuY3Rpb24oXywga2V5KSAge3JldHVybiBrZXkgPT09IGluZGV4fSwgdW5kZWZpbmVkLCBub3RTZXRWYWx1ZSk7XG4gICAgfSxcblxuICAgIGhhczogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIGluZGV4ID0gd3JhcEluZGV4KHRoaXMsIGluZGV4KTtcbiAgICAgIHJldHVybiBpbmRleCA+PSAwICYmICh0aGlzLnNpemUgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIHRoaXMuc2l6ZSA9PT0gSW5maW5pdHkgfHwgaW5kZXggPCB0aGlzLnNpemUgOlxuICAgICAgICB0aGlzLmluZGV4T2YoaW5kZXgpICE9PSAtMVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW50ZXJwb3NlOiBmdW5jdGlvbihzZXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCBpbnRlcnBvc2VGYWN0b3J5KHRoaXMsIHNlcGFyYXRvcikpO1xuICAgIH0sXG5cbiAgICBpbnRlcmxlYXZlOiBmdW5jdGlvbigvKi4uLml0ZXJhYmxlcyovKSB7XG4gICAgICB2YXIgaXRlcmFibGVzID0gW3RoaXNdLmNvbmNhdChhcnJDb3B5KGFyZ3VtZW50cykpO1xuICAgICAgdmFyIHppcHBlZCA9IHppcFdpdGhGYWN0b3J5KHRoaXMudG9TZXEoKSwgSW5kZXhlZFNlcS5vZiwgaXRlcmFibGVzKTtcbiAgICAgIHZhciBpbnRlcmxlYXZlZCA9IHppcHBlZC5mbGF0dGVuKHRydWUpO1xuICAgICAgaWYgKHppcHBlZC5zaXplKSB7XG4gICAgICAgIGludGVybGVhdmVkLnNpemUgPSB6aXBwZWQuc2l6ZSAqIGl0ZXJhYmxlcy5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgaW50ZXJsZWF2ZWQpO1xuICAgIH0sXG5cbiAgICBsYXN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldCgtMSk7XG4gICAgfSxcblxuICAgIHNraXBXaGlsZTogZnVuY3Rpb24ocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgc2tpcFdoaWxlRmFjdG9yeSh0aGlzLCBwcmVkaWNhdGUsIGNvbnRleHQsIGZhbHNlKSk7XG4gICAgfSxcblxuICAgIHppcDogZnVuY3Rpb24oLyosIC4uLml0ZXJhYmxlcyAqLykge1xuICAgICAgdmFyIGl0ZXJhYmxlcyA9IFt0aGlzXS5jb25jYXQoYXJyQ29weShhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiByZWlmeSh0aGlzLCB6aXBXaXRoRmFjdG9yeSh0aGlzLCBkZWZhdWx0WmlwcGVyLCBpdGVyYWJsZXMpKTtcbiAgICB9LFxuXG4gICAgemlwV2l0aDogZnVuY3Rpb24oemlwcGVyLyosIC4uLml0ZXJhYmxlcyAqLykge1xuICAgICAgdmFyIGl0ZXJhYmxlcyA9IGFyckNvcHkoYXJndW1lbnRzKTtcbiAgICAgIGl0ZXJhYmxlc1swXSA9IHRoaXM7XG4gICAgICByZXR1cm4gcmVpZnkodGhpcywgemlwV2l0aEZhY3RvcnkodGhpcywgemlwcGVyLCBpdGVyYWJsZXMpKTtcbiAgICB9LFxuXG4gIH0pO1xuXG4gIEluZGV4ZWRJdGVyYWJsZS5wcm90b3R5cGVbSVNfSU5ERVhFRF9TRU5USU5FTF0gPSB0cnVlO1xuICBJbmRleGVkSXRlcmFibGUucHJvdG90eXBlW0lTX09SREVSRURfU0VOVElORUxdID0gdHJ1ZTtcblxuXG5cbiAgbWl4aW4oU2V0SXRlcmFibGUsIHtcblxuICAgIC8vICMjIyBFUzYgQ29sbGVjdGlvbiBtZXRob2RzIChFUzYgQXJyYXkgYW5kIE1hcClcblxuICAgIGdldDogZnVuY3Rpb24odmFsdWUsIG5vdFNldFZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXModmFsdWUpID8gdmFsdWUgOiBub3RTZXRWYWx1ZTtcbiAgICB9LFxuXG4gICAgY29udGFpbnM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYXModmFsdWUpO1xuICAgIH0sXG5cblxuICAgIC8vICMjIyBNb3JlIHNlcXVlbnRpYWwgbWV0aG9kc1xuXG4gICAga2V5U2VxOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlU2VxKCk7XG4gICAgfSxcblxuICB9KTtcblxuICBTZXRJdGVyYWJsZS5wcm90b3R5cGUuaGFzID0gSXRlcmFibGVQcm90b3R5cGUuY29udGFpbnM7XG5cblxuICAvLyBNaXhpbiBzdWJjbGFzc2VzXG5cbiAgbWl4aW4oS2V5ZWRTZXEsIEtleWVkSXRlcmFibGUucHJvdG90eXBlKTtcbiAgbWl4aW4oSW5kZXhlZFNlcSwgSW5kZXhlZEl0ZXJhYmxlLnByb3RvdHlwZSk7XG4gIG1peGluKFNldFNlcSwgU2V0SXRlcmFibGUucHJvdG90eXBlKTtcblxuICBtaXhpbihLZXllZENvbGxlY3Rpb24sIEtleWVkSXRlcmFibGUucHJvdG90eXBlKTtcbiAgbWl4aW4oSW5kZXhlZENvbGxlY3Rpb24sIEluZGV4ZWRJdGVyYWJsZS5wcm90b3R5cGUpO1xuICBtaXhpbihTZXRDb2xsZWN0aW9uLCBTZXRJdGVyYWJsZS5wcm90b3R5cGUpO1xuXG5cbiAgLy8gI3ByYWdtYSBIZWxwZXIgZnVuY3Rpb25zXG5cbiAgZnVuY3Rpb24ga2V5TWFwcGVyKHYsIGspIHtcbiAgICByZXR1cm4gaztcbiAgfVxuXG4gIGZ1bmN0aW9uIGVudHJ5TWFwcGVyKHYsIGspIHtcbiAgICByZXR1cm4gW2ssIHZdO1xuICB9XG5cbiAgZnVuY3Rpb24gbm90KHByZWRpY2F0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhcHJlZGljYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbmVnKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAtcHJlZGljYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcXVvdGVTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IHZhbHVlO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVmYXVsdFppcHBlcigpIHtcbiAgICByZXR1cm4gYXJyQ29weShhcmd1bWVudHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVmYXVsdE5lZ0NvbXBhcmF0b3IoYSwgYikge1xuICAgIHJldHVybiBhIDwgYiA/IDEgOiBhID4gYiA/IC0xIDogMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc2hJdGVyYWJsZShpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZS5zaXplID09PSBJbmZpbml0eSkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHZhciBvcmRlcmVkID0gaXNPcmRlcmVkKGl0ZXJhYmxlKTtcbiAgICB2YXIga2V5ZWQgPSBpc0tleWVkKGl0ZXJhYmxlKTtcbiAgICB2YXIgaCA9IG9yZGVyZWQgPyAxIDogMDtcbiAgICB2YXIgc2l6ZSA9IGl0ZXJhYmxlLl9faXRlcmF0ZShcbiAgICAgIGtleWVkID9cbiAgICAgICAgb3JkZXJlZCA/XG4gICAgICAgICAgZnVuY3Rpb24odiwgaykgIHsgaCA9IDMxICogaCArIGhhc2hNZXJnZShoYXNoKHYpLCBoYXNoKGspKSB8IDA7IH0gOlxuICAgICAgICAgIGZ1bmN0aW9uKHYsIGspICB7IGggPSBoICsgaGFzaE1lcmdlKGhhc2godiksIGhhc2goaykpIHwgMDsgfSA6XG4gICAgICAgIG9yZGVyZWQgP1xuICAgICAgICAgIGZ1bmN0aW9uKHYgKSB7IGggPSAzMSAqIGggKyBoYXNoKHYpIHwgMDsgfSA6XG4gICAgICAgICAgZnVuY3Rpb24odiApIHsgaCA9IGggKyBoYXNoKHYpIHwgMDsgfVxuICAgICk7XG4gICAgcmV0dXJuIG11cm11ckhhc2hPZlNpemUoc2l6ZSwgaCk7XG4gIH1cblxuICBmdW5jdGlvbiBtdXJtdXJIYXNoT2ZTaXplKHNpemUsIGgpIHtcbiAgICBoID0gTWF0aF9faW11bChoLCAweENDOUUyRDUxKTtcbiAgICBoID0gTWF0aF9faW11bChoIDw8IDE1IHwgaCA+Pj4gLTE1LCAweDFCODczNTkzKTtcbiAgICBoID0gTWF0aF9faW11bChoIDw8IDEzIHwgaCA+Pj4gLTEzLCA1KTtcbiAgICBoID0gKGggKyAweEU2NTQ2QjY0IHwgMCkgXiBzaXplO1xuICAgIGggPSBNYXRoX19pbXVsKGggXiBoID4+PiAxNiwgMHg4NUVCQ0E2Qik7XG4gICAgaCA9IE1hdGhfX2ltdWwoaCBeIGggPj4+IDEzLCAweEMyQjJBRTM1KTtcbiAgICBoID0gc21pKGggXiBoID4+PiAxNik7XG4gICAgcmV0dXJuIGg7XG4gIH1cblxuICBmdW5jdGlvbiBoYXNoTWVyZ2UoYSwgYikge1xuICAgIHJldHVybiBhIF4gYiArIDB4OUUzNzc5QjkgKyAoYSA8PCA2KSArIChhID4+IDIpIHwgMDsgLy8gaW50XG4gIH1cblxuICB2YXIgSW1tdXRhYmxlID0ge1xuXG4gICAgSXRlcmFibGU6IEl0ZXJhYmxlLFxuXG4gICAgU2VxOiBTZXEsXG4gICAgQ29sbGVjdGlvbjogQ29sbGVjdGlvbixcbiAgICBNYXA6IE1hcCxcbiAgICBPcmRlcmVkTWFwOiBPcmRlcmVkTWFwLFxuICAgIExpc3Q6IExpc3QsXG4gICAgU3RhY2s6IFN0YWNrLFxuICAgIFNldDogU2V0LFxuICAgIE9yZGVyZWRTZXQ6IE9yZGVyZWRTZXQsXG5cbiAgICBSZWNvcmQ6IFJlY29yZCxcbiAgICBSYW5nZTogUmFuZ2UsXG4gICAgUmVwZWF0OiBSZXBlYXQsXG5cbiAgICBpczogaXMsXG4gICAgZnJvbUpTOiBmcm9tSlMsXG5cbiAgfTtcblxuICByZXR1cm4gSW1tdXRhYmxlO1xuXG59KSk7IiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290ID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvd1xuICA/IHRoaXNcbiAgOiB3aW5kb3c7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBUT0RPOiBmdXR1cmUgcHJvb2YsIG1vdmUgdG8gY29tcG9lbnQgbGFuZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0hvc3Qob2JqKSB7XG4gIHZhciBzdHIgPSB7fS50b1N0cmluZy5jYWxsKG9iaik7XG5cbiAgc3dpdGNoIChzdHIpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZpbGVdJzpcbiAgICBjYXNlICdbb2JqZWN0IEJsb2JdJzpcbiAgICBjYXNlICdbb2JqZWN0IEZvcm1EYXRhXSc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5mdW5jdGlvbiBnZXRYSFIoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgJiYgKCdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbCB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpba2V5XSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcmFtcyhzdHIpe1xuICByZXR1cm4gcmVkdWNlKHN0ci5zcGxpdCgvICo7ICovKSwgZnVuY3Rpb24ob2JqLCBzdHIpe1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKVxuICAgICAgLCBrZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICAsIHZhbCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoa2V5ICYmIHZhbCkgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnJlcSA9IHJlcTtcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIHRoaXMudGV4dCA9IHRoaXMueGhyLnJlc3BvbnNlVGV4dDtcbiAgdGhpcy5zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5ib2R5ID0gdGhpcy5yZXEubWV0aG9kICE9ICdIRUFEJ1xuICAgID8gdGhpcy5wYXJzZUJvZHkodGhpcy50ZXh0KVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgc3RyLmxlbmd0aFxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXMgfHwgMTIyMyA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTtcbiAgICAgIGlmICgnSEVBRCcgPT0gbWV0aG9kKSByZXMudGV4dCA9IG51bGw7XG4gICAgICBzZWxmLmNhbGxiYWNrKG51bGwsIHJlcyk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgZmlsZW5hbWVgLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaChuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbihmaWVsZCwgZmlsZSwgZmlsZW5hbWUpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgYGRhdGFgLCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIHF1ZXJ5c3RyaW5nXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbXVsdGlwbGUgZGF0YSBcIndyaXRlc1wiXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5zZW5kKHsgc2VhcmNoOiAncXVlcnknIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgcmFuZ2U6ICcxLi41JyB9KVxuICogICAgICAgICAuc2VuZCh7IG9yZGVyOiAnZGVzYycgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqKSByZXR1cm4gdGhpcztcbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCByZXMpe1xuICB2YXIgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgaWYgKDIgPT0gZm4ubGVuZ3RoKSByZXR1cm4gZm4oZXJyLCByZXMpO1xuICBpZiAoZXJyKSByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIGZuKHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IGdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcbiAgICBpZiAoMCA9PSB4aHIuc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfTtcblxuICAvLyBwcm9ncmVzc1xuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICAgIH07XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplW3RoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKV07XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZGVsID0gZnVuY3Rpb24odXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIlxuLyoqXG4gKiBSZWR1Y2UgYGFycmAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxcbiAqXG4gKiBUT0RPOiBjb21iYXRpYmxlIGVycm9yIGhhbmRsaW5nP1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbiwgaW5pdGlhbCl7ICBcbiAgdmFyIGlkeCA9IDA7XG4gIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICB2YXIgY3VyciA9IGFyZ3VtZW50cy5sZW5ndGggPT0gM1xuICAgID8gaW5pdGlhbFxuICAgIDogYXJyW2lkeCsrXTtcblxuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgY3VyciA9IGZuLmNhbGwobnVsbCwgY3VyciwgYXJyW2lkeF0sICsraWR4LCBhcnIpO1xuICB9XG4gIFxuICByZXR1cm4gY3Vycjtcbn07Il19
