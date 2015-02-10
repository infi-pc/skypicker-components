(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./exports/skypicker.jsx":[function(require,module,exports){
"use strict";
var translationStrategy = require('./../modules/translationStrategies/spTr.js');
var tr = require('./../modules/tr.js');
tr.setStrategy(translationStrategy);
var React = (window.React);

window.Wgts = {}; //That's namespace if there will be some name collision

window.Place = Wgts.Place = require('./../modules/containers/Place.jsx');
window.Radius = Wgts.Radius = require('./../modules/containers/Radius.jsx');
window.SearchDate = Wgts.SearchDate = require('./../modules/containers/SearchDate.jsx');
window.SearchPlace = Wgts.SearchPlace = require('./../modules/containers/SearchPlace.jsx');
window.SearchFormData = Wgts.SearchFormData = require('./../modules/containers/SearchFormData.jsx');
window.SearchFormStore = Wgts.SearchFormStore = require('./../modules/stores/SearchFormStore.jsx');
window.OptionsStore = Wgts.OptionsStore = require('./../modules/stores/OptionsStore.jsx');
window.SearchFormAdapter = Wgts.SearchFormAdapter = require('./../modules/plainJsAdapters/SearchFormAdapter.jsx');
//MAP
window.MapOverlay = Wgts.MapOverlay = require('./../modules/Map/MapOverlay.jsx');

},{"./../modules/Map/MapOverlay.jsx":"C:\\www\\skypicker-components\\modules\\Map\\MapOverlay.jsx","./../modules/containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../modules/containers/Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx","./../modules/containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../modules/containers/SearchFormData.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx","./../modules/containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../modules/plainJsAdapters/SearchFormAdapter.jsx":"C:\\www\\skypicker-components\\modules\\plainJsAdapters\\SearchFormAdapter.jsx","./../modules/stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./../modules/stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../modules/tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./../modules/translationStrategies/spTr.js":"C:\\www\\skypicker-components\\modules\\translationStrategies\\spTr.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\FlightsAPI.jsx":[function(require,module,exports){
"use strict";
// new version, not tested, not finished, should be finished later
var Q = require('q');

var superagent  = require("superagent");
var moment  = (window.moment);

var formatSPApiDate = "DD/MM/YYYY";

//TODO check if on error is called exactly when error in callback or not, then Add it to promise
var handleError = function (err) {
  console.error(err);
};



  /*
    Settings:
    {
      lang: string (eg. "cs")
    }
   */
  function FlightsAPI(settings) {"use strict";
    this.settings = settings;
  }
  /*
      Request:
      {
        origin: string (id) |
        destination: string (id), default: "anywhere"
        outboundDate: SearchDate
        inboundDate: SearchDate | null
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
      flyFrom: request.origin,
      to: request.destination,
      //flyDays: [],
      //directFlights: 0,

      sort: "price",
      asc: 1,
      locale: this.settings.lang,
      daysInDestinationFrom: "",
      daysInDestinationTo: ""

    };

    searchParams.dateFrom = request.outboundDate.from.format(formatSPApiDate);
    searchParams.dateTo = request.outboundDate.to.format(formatSPApiDate);
    if (request.returnDate) {
      searchParams.typeFlight = "return";
      searchParams.returnFrom = request.inboundDate.from.format(formatSPApiDate);
      searchParams.returnTo = request.inboundDate.to.format(formatSPApiDate);
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

    var deferred = Q.defer();
    superagent
      .get(skypickerApiUrl)
      .query(searchParams)
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .on('error', handleError)
      .end(function(error, res){
        if (!error) {
          deferred.resolve(res.body.data);
        } else {
          deferred.reject(new Error(res.error));
        }
      });
    return deferred.promise;
  };


module.exports = FlightsAPI;


},{"q":"C:\\www\\skypicker-components\\node_modules\\q\\q.js","superagent":"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx":[function(require,module,exports){
"use strict";
var superagent  = require("superagent");
var Place  = require("../containers/Place.jsx");
var deepmerge = require('deepmerge');
var Q = require('q');

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

},{"../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js","q":"C:\\www\\skypicker-components\\node_modules\\q\\q.js","superagent":"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx":[function(require,module,exports){
"use strict";
var PlacesAPI  = require("./PlacesAPI.jsx");
var Q  = require('q');

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

},{"./PlacesAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx","q":"C:\\www\\skypicker-components\\node_modules\\q\\q.js"}],"C:\\www\\skypicker-components\\modules\\Calendar.jsx":[function(require,module,exports){
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
        React.createElement("div", {className: "clear-both"}), 
        React.createElement(DaysInWeek, null)
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

},{"./stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./tools/latlon.js":"C:\\www\\skypicker-components\\modules\\tools\\latlon.js"}],"C:\\www\\skypicker-components\\modules\\Map\\LabelsLayer.jsx":[function(require,module,exports){
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
        labels: MapLabelsStore.labels
      });
    }.bind(this));
  },

  renderPlaces: function () {
    var labels = this.state.labels;
    return labels.map(function(label)  {
      var labelStyle = {
        top: label.position.y,
        left: label.position.x
      };
      //TODO move all the shit inside, pass only label
      return (React.createElement(PlaceLabel, {key: label.mapPlace.place.id, style: labelStyle, label: label}))
    })
  },
  render: function () {
    console.log("labels render");
    return (
      React.createElement("div", {className: "labels-overlay"}, 
        this.renderPlaces()
      )
    )
  }

});


module.exports = LabelsLayer;

},{"../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./PlaceLabel.jsx":"C:\\www\\skypicker-components\\modules\\Map\\PlaceLabel.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\MapOverlay.jsx":[function(require,module,exports){
"use strict";
var LabelsLayer = require('./LabelsLayer.jsx');
var PointsLayer = require('./PointsLayer.jsx');
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
  return React.render(React.createFactory(PointsLayer)(), div);
}

function addLabelsLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayLayer.appendChild(div);
  return React.render(React.createFactory(LabelsLayer)(), div);
}

function addMouseClickLayer(panes, map) {
  var div = document.createElement('div');
  // overlayLayer, overlayMouseTarget //https://developers.google.com/maps/documentation/javascript/customoverlays
  panes.overlayMouseTarget.appendChild(div);
  return React.render(React.createFactory(MouseClickLayer)(), div);
}



MapOverlay.prototype = new google.maps.OverlayView();

MapOverlay.prototype.onAdd = function () {
  var panes = this.getPanes();
  addPointsLayer(panes, this.map);
  addLabelsLayer(panes, this.map);
  addMouseClickLayer(panes, this.map);


  google.maps.event.addListener(this.map, 'idle', function() {
    console.log("idle");
    var overlayProjection = this.getProjection();
    var bounds = flatBounds(this.map.getBounds());
    MapLabelsStore.setMapData(bounds, overlayProjection.fromLatLngToDivPixel.bind(overlayProjection));
  }.bind(this));
};

MapOverlay.prototype.draw = function () {
  console.log("draw");


};

MapOverlay.prototype.onRemove = function () {
  console.log("remove");
};

module.exports = MapOverlay;

},{"./../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./LabelsLayer.jsx":"C:\\www\\skypicker-components\\modules\\Map\\LabelsLayer.jsx","./MouseClickLayer.jsx":"C:\\www\\skypicker-components\\modules\\Map\\MouseClickLayer.jsx","./PointsLayer.jsx":"C:\\www\\skypicker-components\\modules\\Map\\PointsLayer.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\MouseClickLayer.jsx":[function(require,module,exports){
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
        labels: MapLabelsStore.labels
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
      React.createElement("div", {className: "mouse-clicks-overlay"}, 
        this.renderPoints()
      )
    )
  }
});

module.exports = MouseClickLayer;

},{"../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./MouseClickTile.jsx":"C:\\www\\skypicker-components\\modules\\Map\\MouseClickTile.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\MouseClickTile.jsx":[function(require,module,exports){
"use strict";
var SearchFormStore = require('./../../modules/stores/SearchFormStore.jsx');
var SearchPlace = require('./../../modules/containers/SearchPlace.jsx');
var PureRenderMixin = (window.React).addons.PureRenderMixin;

var MouseClickTile = React.createClass({displayName: "MouseClickTile",

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
      React.createElement("div", {ref: "tile", className: "mouse-click-field", style: style})
    )
  }
});

module.exports = MouseClickTile;

},{"./../../modules/containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../modules/stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx"}],"C:\\www\\skypicker-components\\modules\\Map\\PlaceLabel.jsx":[function(require,module,exports){
"use strict";
var PureRenderMixin = (window.React).addons.PureRenderMixin;

var PlaceLabel = React.createClass({displayName: "PlaceLabel",

  mixins: [PureRenderMixin],

  render: function () {
    var mapPlace = this.props.label.mapPlace;
    var style = this.props.style;
    var fullLabel, image, price;
    var labelText = mapPlace.place.shortName;
    var className = "city-label";
    var flagText = "";
    if (mapPlace.price) {
      var priceStyle = {};
      if (!window.COLORS_LIGHTNESS) {
        window.COLORS_LIGHTNESS = 35;
      }
        priceStyle.color = "hsla("+parseInt( (1-this.props.label.relativePrice) *115)+", 100%, "+window.COLORS_SATURATION+"%, 1)"
      price = React.createElement("span", {className: "city-label-price", style: priceStyle}, mapPlace.price, "EUR")
    }

    if (mapPlace.flag == "origin") {
      flagText = React.createElement("span", {className: "flag-text"}, "From: ");
      className += " flag-"+mapPlace.flag;
    }
    if (mapPlace.flag == "destination") {
      flagText = React.createElement("span", {className: "flag-text"}, "To: ");
      className += " flag-"+mapPlace.flag;
    }

    if (this.props.label.showFullLabel) {
      fullLabel = (
        React.createElement("div", null, 
          React.createElement("span", {className: "city-label-title"}, flagText, " ", labelText), React.createElement("br", null), 
          price
        )
      );
    }

    return (
      React.createElement("div", {ref: "label", style: style, className: className}, 
        image, 
        fullLabel
      )
    )
  }
});


module.exports = PlaceLabel;

},{}],"C:\\www\\skypicker-components\\modules\\Map\\Point.jsx":[function(require,module,exports){
"use strict";
var Point = React.createClass({displayName: "Point",
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
        labels: MapLabelsStore.labels
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
      React.createElement("div", {className: "points-overlay"}, 
        this.renderPoints()
      )
    )
  }

});


module.exports = PointsLayer;

},{"../stores/MapLabelsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapLabelsStore.jsx","./Point.jsx":"C:\\www\\skypicker-components\\modules\\Map\\Point.jsx"}],"C:\\www\\skypicker-components\\modules\\ModalMenuMixin.jsx":[function(require,module,exports){
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

},{"./../../APIs/PlacesAPICached.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx","./../../Geolocation.jsx":"C:\\www\\skypicker-components\\modules\\Geolocation.jsx","./../../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./PlaceRow.jsx":"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\PlaceRow.jsx"}],"C:\\www\\skypicker-components\\modules\\SearchForm\\SearchForm.jsx":[function(require,module,exports){
"use strict";

var DatePickerModal = require('./../DatePicker/DatePickerModal.jsx');
var PlacePickerModal = require('./../PlacePicker/PlacePickerModal.jsx');


var SearchFormStore = require('./../stores/SearchFormStore.jsx');

var SearchDate = require('./../containers/SearchDate.jsx');
var SearchPlace = require('./../containers/SearchPlace.jsx');
var tr = require('./../tr.js');
var Tran = require('./../Tran.jsx');

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
      SearchFormStore.setValue(this.state.data.changeField(fieldName, value));

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
        SearchFormStore.setValue(this.state.data.changeField(fieldName, new SearchPlace(e.target.value)));
        this.setState(addState);
      }.bind(this)
    } else {
      return function()  {};
    }
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
    var faIconClass = "fa fa-caret-down";
    if (type == this.state.active) {
      faIconClass = "fa fa-caret-up"
    }
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
          React.createElement("b", {className: "toggle", onClick: this.toggleActive(type)}, 
            React.createElement("i", {className: faIconClass})
          )
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
        React.createElement("button", {onClick: this.search, id: "search-flights", ref: "submitButton", className: "btn-search"}, React.createElement("span", null, React.createElement(Tran, {tKey: "search"}, "Search")), React.createElement("i", {className: "fa fa-search"}))
      )
    );
  }
});

module.exports = SearchForm;

},{"./../DatePicker/DatePickerModal.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\DatePickerModal.jsx","./../PlacePicker/PlacePickerModal.jsx":"C:\\www\\skypicker-components\\modules\\PlacePicker\\PlacePickerModal.jsx","./../Tran.jsx":"C:\\www\\skypicker-components\\modules\\Tran.jsx","./../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js"}],"C:\\www\\skypicker-components\\modules\\Tran.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

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

},{"./tr.js":"C:\\www\\skypicker-components\\modules\\tr.js"}],"C:\\www\\skypicker-components\\modules\\containers\\MapPlace.jsx":[function(require,module,exports){
"use strict";
var Immutable = require('./immutable.jsx');

for(var Immutable____Key in Immutable){if(Immutable.hasOwnProperty(Immutable____Key)){MapPlace[Immutable____Key]=Immutable[Immutable____Key];}}var ____SuperProtoOfImmutable=Immutable===null?null:Immutable.prototype;MapPlace.prototype=Object.create(____SuperProtoOfImmutable);MapPlace.prototype.constructor=MapPlace;MapPlace.__superConstructor__=Immutable;

  function MapPlace(plain) {"use strict";
    this.place = plain.place;
    this.flag = plain.flag || ""; //origin, destination, stopover
    this.price = plain.price || null;
    this.relativePrice = plain.relativePrice || null;
    Object.freeze(this);
  }

  //TODO move this method to parent object Immutable
  /**
   * return new object with added changes, if no change return same object
   * @param newValues
   * @returns {SearchDate}
   */
  MapPlace.prototype.edit=function(newValues){"use strict";
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
      return new MapPlace(newPlain);
    } else {
      return this;
    }

  };


module.exports = MapPlace;

},{"./immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\Options.jsx":[function(require,module,exports){
"use strict";
var Radius = require("./Radius.jsx");


  function Options(plain) {"use strict";
    plain = plain || {};
    if (window.SKYPICKER_LNG) {
      this.language = window.SKYPICKER_LNG.toLowerCase();
    } else {
      this.language = plain.language || "en";
    }

    this.defaultRadius = plain.defaultRadius || new Radius(); //TODO radius??
    this.defaultMapCenter = plain.defaultMapCenter || null; //TODO map center
    Object.freeze(this);
  }
  Options.prototype.set=function(key, value) {"use strict";
    var newPlain = {
      language: this.language,
      defaultRadius: this.defaultRadius,
      defaultMapCenter: this.defaultMapCenter
    };
    newPlain[key] = value;
    return new Options(newPlain);
  };


module.exports = Options;

},{"./Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx":[function(require,module,exports){
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

var urlDateFormat = "YYYY-MM-DD";
var tr = require('./../tr.js');

/*
class SearchDate
it has state for all modes, bude for
  constructor
  input = plain object or string or just another SearchDate object
 */
var SearchDate = function (input) {
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
  this.final = typeof(plain.final) != 'undefined'? plain.final : true;
  Object.freeze(this);
};

/* sets mode with checking some internal validity */
/* but probably valitity should be handled by getters, because it is nice to have internal state for others modes than enabled */

//SearchDate.prototype.setMode = function(mode) {
//  var previousMode = this.mode;
//  if (mode == "single") {
//    this.to = this.from;
//  } else if (mode == "anytime") {
//    this.from = moment.utc().add(1, "days");
//    this.to = moment.utc().add(6, "months");
//  }
//  this.mode = mode;
//};



SearchDate.prototype.getMode = function() {
  return this.mode
};

SearchDate.prototype.getFrom = function() {
  if (this.mode == "timeToStay" || this.mode == "noReturn") {
    return null;
  } else if (this.mode == "anytime") {
    return moment.utc().add(1,"days");
  } else {
    return this.from
  }
};

SearchDate.prototype.getTo = function() {
  if (this.mode == "timeToStay" || this.mode == "noReturn") {
    return null;
  } else if (this.mode == "single") {
    return this.from
  } else if (this.mode == "anytime") {
    return moment.utc().add(6,"months");
  } else {
    if (this.to) {
      return this.to
    } else {
      //just for cases when the value is not filled (not complete interval)
      return this.from
    }
  }
};

SearchDate.prototype.getDate = function() {
  if (this.mode == "single") {
    return this.from
  } else {
    return null
  }
};

SearchDate.prototype.getMinStayDays = function() {
  if (this.mode == "timeToStay") {
    return this.minStayDays;
  } else {
    return null;
  }
};

SearchDate.prototype.getMaxStayDays = function() {
  if (this.mode == "timeToStay") {
    return this.maxStayDays;
  } else {
    return null;
  }
};

SearchDate.prototype.format = function () {
  if (this.mode == "single") {
    return this.from.format("l")
  } else if (this.mode == "timeToStay") {
    return this.minStayDays+ " - " + this.maxStayDays + " days"
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
SearchDate.prototype.toUrlString = function() {
  return this.mode + "_" + this.from.format(urlDateFormat) + "_" + this.to.format(urlDateFormat);
};

/*
  Just parse it, return plain minimal/incomplete version of SearchDate object
 */
SearchDate.prototype.parseUrlString = function(stringDate) {
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


//TODO move this method to parent object Immutable
/**
 * return new object with added changes, if no change return same object
 * @param newValues
 * @returns {SearchDate}
 */
SearchDate.prototype.edit = function(newValues){
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
    return new SearchDate(newPlain);
  } else {
    return this;
  }

};

/* just helper function if i mode is not set */
SearchDate.guessModeFromPlain = function (plain) {
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

},{"./../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js"}],"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx":[function(require,module,exports){
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
    Object.freeze(this);
  }

  /* immutable */
  SearchFormData.prototype.changeField=function(type, value) {"use strict";
    var newPlain = {
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      origin: this.origin,
      destination: this.destination
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

  //TODO move this method to parent object Immutable
  /**
   * return new object with added changes, if no change return same object
   * @param newValues
   * @returns {SearchDate}
   */
  SearchPlace.prototype.edit=function(newValues){"use strict";
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
      return new SearchPlace(newPlain);
    } else {
      return this;
    }

  };



module.exports = SearchPlace;

},{"./../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./immutable.jsx":"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\immutable.jsx":[function(require,module,exports){
"use strict";

function Immutable(){"use strict";}

  //TODO move it here from children, goal is to have common interface for all of them

  /**
   * return new object with added changes, if no change return same object
   * @param newValues
   * @returns {SearchDate}
   */
  //edit(newValues){
  //  if (!newValues) {
  //    return this;
  //  }
  //  var leastOneEdit = false;
  //  var newPlain = {};
  //  //Add from this
  //  Object.keys(this).forEach((key) => {
  //    newPlain[key] = this[key];
  //  });
  //  //Add from new
  //  Object.keys(newValues).forEach((key) => {
  //    if (newPlain[key] !== newValues[key]) {
  //      newPlain[key] = newValues[key];
  //      leastOneEdit = true;
  //    }
  //  });
  //  if (leastOneEdit) {
  //    return new SearchDate(newPlain);
  //  } else {
  //    return this;
  //  }
  //
  //};
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
var EventEmitter = require('events').EventEmitter;
var Quadtree = require('./../tools/quadtree.js');

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

    this.labels = [];

    MapPlacesStore.events.on("change", function()  {
      this.refreshLabels();
    }.bind(this))
  }
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
      if (!res.minPrice || res.minPrice > price) res.minPrice = price;
    });
    return res;
  };
  /* !mutates labels */
  MapLabelsStore.prototype.calculateRelativePricesForLabels=function(labels) {"use strict";
    var priceStats = this.findPriceStatsForLabels(labels);
    labels.forEach(function(label)  {
      label.relativePrice = label.mapPlace.price / priceStats.maxPrice;
    });
  };
  // mutates places!!!!
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
    //mapPlaces = mapPlaces.slice(0,300);
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

  MapLabelsStore.prototype.refreshLabels=function() {"use strict";
    if (this.latLngBounds && this.fromLatLngToDivPixelFunc) {
      var mapPlaces = MapPlacesStore.getByBounds(this.latLngBounds);
      var labels = this.mapPlacesToLabels(mapPlaces, this.fromLatLngToDivPixelFunc);
      this.calculateRelativePricesForLabels(labels);
      this.labels = labels;
      this.events.emit("change");
    }
  };

  MapLabelsStore.prototype.setMapData=function(latLngBounds, fromLatLngToDivPixelFunc) {"use strict";
    this.latLngBounds = latLngBounds;
    this.fromLatLngToDivPixelFunc = fromLatLngToDivPixelFunc;
    this.refreshLabels();
  };

module.exports = new MapLabelsStore();

},{"./../tools/quadtree.js":"C:\\www\\skypicker-components\\modules\\tools\\quadtree.js","./MapPlacesStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesStore.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesIndex.jsx":[function(require,module,exports){
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

var PlacesAPI = require('./../APIs/PlacesAPI.jsx');
var FlightsAPI = require('./../APIs/FlightsAPI.jsx');
var Place = require('./../containers/Place.jsx');



  function MapPlacesStore() {"use strict";
    this.mapPlacesIndex = new MapPlacesIndex();
    this.events = new EventEmitter();

    this.selectedOriginId = null; //it is here so i can fastly deselect the last place
    this.selectedDestinationId = null;

    SearchFormStore.events.on("change", function()  {
      this.loadPrices();
      this.checkSelected();
      this.events.emit("change");
    }.bind(this));
    this.loadPlaces();
  }

  MapPlacesStore.prototype.loadPlaces=function() {"use strict";
    var placesAPI = new PlacesAPI({lang: "en"});
    placesAPI.findPlaces({typeID: Place.TYPE_CITY}).then(function(places)  {
      var mapPlaces = places.map(function(place)  {
        return new MapPlace({place: place});
      });
      this.mapPlacesIndex.insertPlaces(mapPlaces);

      this.checkSelected();
      this.events.emit("change");
    }.bind(this))
  };

  MapPlacesStore.prototype.findPriceStats=function(flights) {"use strict";
    var res = {};
    flights.forEach(function(flight)  {
      if (!res.maxPrice || res.maxPrice < flight.price) res.maxPrice = flight.price;
      if (!res.minPrice || res.minPrice > flight.price) res.minPrice = flight.price;
    });
    return res;
  };
  MapPlacesStore.prototype.loadPrices=function() {"use strict";
    //TODO clean could be ommited on some cases (new data)
    this.mapPlacesIndex.cleanPrices();
    //TODO also other origin types
    if (SearchFormStore.data.origin.mode == "place") {
      var origin = SearchFormStore.data.origin;
      var flightsAPI = new FlightsAPI({lang: "en"});
      flightsAPI.findFlights({
        origin: origin.value.id,
        destination: "anywhere",
        outboundDate: SearchFormStore.data.dateFrom,
        inboundDate: SearchFormStore.data.dateTo
      }).then(function(flights)  {
        var priceStats = this.findPriceStats(flights);

        flights.forEach(function(flight)  {
          var mapPlace = this.mapPlacesIndex.getById(flight.mapIdto);
          if (mapPlace) {
            var relativePrice = flight.price / priceStats.maxPrice; //TODO nicer function
            this.mapPlacesIndex.editPlace(mapPlace.edit({"price":flight.price, "relativePrice": relativePrice}));
          }
        }.bind(this));
        this.events.emit("change");
      }.bind(this)).catch(function(err)  {
        //TODO nicer error handling
        console.error(err);
      });
    }
  };

  MapPlacesStore.prototype.checkSelected=function() {"use strict";
    if (SearchFormStore.data.origin.mode == "place" && this.selectedOriginId != SearchFormStore.data.origin.value.id) {
      this.deselectPlace(this.selectedOriginId);
      this.selectPlace(SearchFormStore.data.origin.value.id, "origin");
      this.selectedOriginId = SearchFormStore.data.origin.value.id;
    }
    if (SearchFormStore.data.destination.mode == "place" && this.selectedDestinationId != SearchFormStore.data.destination.value.id) {
      this.deselectPlace(this.selectedDestinationId);
      this.selectPlace(SearchFormStore.data.destination.value.id, "destination");
      this.selectedDestinationId = SearchFormStore.data.destination.value.id;
    }
  };

  MapPlacesStore.prototype.selectPlace=function(id, direction) {"use strict";
    var mapPlace = this.mapPlacesIndex.getById(id);
    if (mapPlace) {
      this.mapPlacesIndex.editPlace(mapPlace.set("flag",direction));
    } else {
      //TODO what put here?
    }

  };
  MapPlacesStore.prototype.deselectPlace=function(id) {"use strict";
    if (id) {
      var mapPlace = this.mapPlacesIndex.getById(id);
      if (mapPlace) {
        this.mapPlacesIndex.editPlace(mapPlace.set("flag", ""));
      } else {
        //TODO what put here?
      }
    }
  };
  MapPlacesStore.prototype.getByBounds=function(bounds) {"use strict";
    return this.mapPlacesIndex.getByBounds(bounds);
  };

module.exports = new MapPlacesStore();

},{"./../APIs/FlightsAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\FlightsAPI.jsx","./../APIs/PlacesAPI.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx","./../containers/MapPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\MapPlace.jsx","./../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./MapPlacesIndex.jsx":"C:\\www\\skypicker-components\\modules\\stores\\MapPlacesIndex.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js"}],"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx":[function(require,module,exports){
"use strict";
var EventEmitter = require('events').EventEmitter;
var Options = require('./../containers/Options.jsx');


  function OptionsStore() {"use strict";
    this.events = new EventEmitter();
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
var Q = require('q');
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
  SearchFormStore.prototype.setValue=function(value) {"use strict";
    var changed = false;
    if (this.data != value) {
      this.data = value;
      this.events.emit('change');
      changed = true;
    }
    return changed;
  };
  SearchFormStore.prototype.setField=function(fieldName, value) {"use strict";
    return this.setValue(this.data.changeField(fieldName, value));
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

},{"./../APIs/PlacesAPICached.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx","./../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../containers/SearchFormData.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx","./../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","events":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\events\\events.js","q":"C:\\www\\skypicker-components\\node_modules\\q\\q.js"}],"C:\\www\\skypicker-components\\modules\\tools\\DatePairValidator.jsx":[function(require,module,exports){
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
},{}],"C:\\www\\skypicker-components\\modules\\tr.js":[function(require,module,exports){
"use strict";

/* adapter to translate by one of chosen strategy */

var setupDoc = {
  "getTranslations": "to get text which are not translated on current page, take console.log(window.toTranslate)",
  "setupStrategy": "it is necessary set strategy in root of bundle"
};

var strategy = null;



var tr = function (original, key, values) {
  if (!strategy) {
    console.error("Translation strategy is not set\n "+setupDoc["setupStrategy"]);
    return original;
  }
  return strategy(original, key, values);
};

tr.setStrategy = function (newStrategy) {
  strategy = newStrategy;
};

module.exports = tr;

},{}],"C:\\www\\skypicker-components\\modules\\translationStrategies\\spTr.js":[function(require,module,exports){
"use strict";
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

},{}],"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\process\\browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

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

},{}],"C:\\www\\skypicker-components\\node_modules\\q\\q.js":[function(require,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof self !== "undefined") {
        self.Q = definition();

    } else {
        throw new Error("This environment was not anticiapted by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,require('_process'))

},{"_process":"C:\\www\\skypicker-components\\node_modules\\browserify\\node_modules\\process\\browser.js"}],"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZXhwb3J0cy9za3lwaWNrZXIuanN4IiwibW9kdWxlcy9BUElzL0ZsaWdodHNBUEkuanN4IiwibW9kdWxlcy9BUElzL1BsYWNlc0FQSS5qc3giLCJtb2R1bGVzL0FQSXMvUGxhY2VzQVBJQ2FjaGVkLmpzeCIsIm1vZHVsZXMvQ2FsZW5kYXIuanN4IiwibW9kdWxlcy9EYXRlUGlja2VyL0RhdGVQaWNrZXJNb2RhbC5qc3giLCJtb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9DYWxlbmRhckRheS5qc3giLCJtb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9DYWxlbmRhckZyYW1lLmpzeCIsIm1vZHVsZXMvRGF0ZVBpY2tlci9jb21wb25lbnRzL0RhdGVQaWNrZXIuanN4IiwibW9kdWxlcy9EYXRlUGlja2VyL2NvbXBvbmVudHMvTW9udGhNYXRyaXguanN4IiwibW9kdWxlcy9EYXRlUGlja2VyL2NvbXBvbmVudHMvU2VsZWN0RGF5c0luV2Vlay5qc3giLCJtb2R1bGVzL0RhdGVQaWNrZXIvY29tcG9uZW50cy9TbGlkZXIuanMiLCJtb2R1bGVzL0RhdGVUb29scy5qcyIsIm1vZHVsZXMvR2VvbG9jYXRpb24uanN4IiwibW9kdWxlcy9NYXAvTGFiZWxzTGF5ZXIuanN4IiwibW9kdWxlcy9NYXAvTWFwT3ZlcmxheS5qc3giLCJtb2R1bGVzL01hcC9Nb3VzZUNsaWNrTGF5ZXIuanN4IiwibW9kdWxlcy9NYXAvTW91c2VDbGlja1RpbGUuanN4IiwibW9kdWxlcy9NYXAvUGxhY2VMYWJlbC5qc3giLCJtb2R1bGVzL01hcC9Qb2ludC5qc3giLCJtb2R1bGVzL01hcC9Qb2ludHNMYXllci5qc3giLCJtb2R1bGVzL01vZGFsTWVudU1peGluLmpzeCIsIm1vZHVsZXMvTW9kYWxQaWNrZXIuanN4IiwibW9kdWxlcy9QbGFjZVBpY2tlci9QbGFjZVBpY2tlck1vZGFsLmpzeCIsIm1vZHVsZXMvUGxhY2VQaWNrZXIvY29tcG9uZW50cy9QbGFjZVBpY2tlci5qc3giLCJtb2R1bGVzL1BsYWNlUGlja2VyL2NvbXBvbmVudHMvUGxhY2VSb3cuanN4IiwibW9kdWxlcy9QbGFjZVBpY2tlci9jb21wb25lbnRzL1BsYWNlcy5qc3giLCJtb2R1bGVzL1NlYXJjaEZvcm0vU2VhcmNoRm9ybS5qc3giLCJtb2R1bGVzL1RyYW4uanN4IiwibW9kdWxlcy9jb250YWluZXJzL01hcFBsYWNlLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9PcHRpb25zLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9QbGFjZS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvUmFkaXVzLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCIsIm1vZHVsZXMvY29udGFpbmVycy9TZWFyY2hGb3JtRGF0YS5qc3giLCJtb2R1bGVzL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4IiwibW9kdWxlcy9jb250YWluZXJzL2ltbXV0YWJsZS5qc3giLCJtb2R1bGVzL3BsYWluSnNBZGFwdGVycy9TZWFyY2hGb3JtQWRhcHRlci5qc3giLCJtb2R1bGVzL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3giLCJtb2R1bGVzL3N0b3Jlcy9NYXBQbGFjZXNJbmRleC5qc3giLCJtb2R1bGVzL3N0b3Jlcy9NYXBQbGFjZXNTdG9yZS5qc3giLCJtb2R1bGVzL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4IiwibW9kdWxlcy9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCIsIm1vZHVsZXMvdG9vbHMvRGF0ZVBhaXJWYWxpZGF0b3IuanN4IiwibW9kdWxlcy90b29scy9nZW8uanMiLCJtb2R1bGVzL3Rvb2xzL2lzSUUuanMiLCJtb2R1bGVzL3Rvb2xzL2xhdGxvbi5qcyIsIm1vZHVsZXMvdG9vbHMvcXVhZHRyZWUuanMiLCJtb2R1bGVzL3RyLmpzIiwibW9kdWxlcy90cmFuc2xhdGlvblN0cmF0ZWdpZXMvc3BUci5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwbWVyZ2UvaW5kZXguanMiLCJub2RlX21vZHVsZXNcXHFcXHEuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDajVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcGpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbnZhciB0cmFuc2xhdGlvblN0cmF0ZWd5ID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3RyYW5zbGF0aW9uU3RyYXRlZ2llcy9zcFRyLmpzJyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvdHIuanMnKTtcbnRyLnNldFN0cmF0ZWd5KHRyYW5zbGF0aW9uU3RyYXRlZ3kpO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG5cbndpbmRvdy5XZ3RzID0ge307IC8vVGhhdCdzIG5hbWVzcGFjZSBpZiB0aGVyZSB3aWxsIGJlIHNvbWUgbmFtZSBjb2xsaXNpb25cblxud2luZG93LlBsYWNlID0gV2d0cy5QbGFjZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xud2luZG93LlJhZGl1cyA9IFdndHMuUmFkaXVzID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL2NvbnRhaW5lcnMvUmFkaXVzLmpzeCcpO1xud2luZG93LlNlYXJjaERhdGUgPSBXZ3RzLlNlYXJjaERhdGUgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCcpO1xud2luZG93LlNlYXJjaFBsYWNlID0gV2d0cy5TZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xud2luZG93LlNlYXJjaEZvcm1EYXRhID0gV2d0cy5TZWFyY2hGb3JtRGF0YSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1NlYXJjaEZvcm1EYXRhLmpzeCcpO1xud2luZG93LlNlYXJjaEZvcm1TdG9yZSA9IFdndHMuU2VhcmNoRm9ybVN0b3JlID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4Jyk7XG53aW5kb3cuT3B0aW9uc1N0b3JlID0gV2d0cy5PcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvc3RvcmVzL09wdGlvbnNTdG9yZS5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtQWRhcHRlciA9IFdndHMuU2VhcmNoRm9ybUFkYXB0ZXIgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvcGxhaW5Kc0FkYXB0ZXJzL1NlYXJjaEZvcm1BZGFwdGVyLmpzeCcpO1xuLy9NQVBcbndpbmRvdy5NYXBPdmVybGF5ID0gV2d0cy5NYXBPdmVybGF5ID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL01hcC9NYXBPdmVybGF5LmpzeCcpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBuZXcgdmVyc2lvbiwgbm90IHRlc3RlZCwgbm90IGZpbmlzaGVkLCBzaG91bGQgYmUgZmluaXNoZWQgbGF0ZXJcbnZhciBRID0gcmVxdWlyZSgncScpO1xuXG52YXIgc3VwZXJhZ2VudCAgPSByZXF1aXJlKFwic3VwZXJhZ2VudFwiKTtcbnZhciBtb21lbnQgID0gKHdpbmRvdy5tb21lbnQpO1xuXG52YXIgZm9ybWF0U1BBcGlEYXRlID0gXCJERC9NTS9ZWVlZXCI7XG5cbi8vVE9ETyBjaGVjayBpZiBvbiBlcnJvciBpcyBjYWxsZWQgZXhhY3RseSB3aGVuIGVycm9yIGluIGNhbGxiYWNrIG9yIG5vdCwgdGhlbiBBZGQgaXQgdG8gcHJvbWlzZVxudmFyIGhhbmRsZUVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICBjb25zb2xlLmVycm9yKGVycik7XG59O1xuXG5cblxuICAvKlxuICAgIFNldHRpbmdzOlxuICAgIHtcbiAgICAgIGxhbmc6IHN0cmluZyAoZWcuIFwiY3NcIilcbiAgICB9XG4gICAqL1xuICBmdW5jdGlvbiBGbGlnaHRzQVBJKHNldHRpbmdzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG4gIC8qXG4gICAgICBSZXF1ZXN0OlxuICAgICAge1xuICAgICAgICBvcmlnaW46IHN0cmluZyAoaWQpIHxcbiAgICAgICAgZGVzdGluYXRpb246IHN0cmluZyAoaWQpLCBkZWZhdWx0OiBcImFueXdoZXJlXCJcbiAgICAgICAgb3V0Ym91bmREYXRlOiBTZWFyY2hEYXRlXG4gICAgICAgIGluYm91bmREYXRlOiBTZWFyY2hEYXRlIHwgbnVsbFxuICAgICAgICBmbHlEYXlzOiAobm90IHVzZWQgbm93KVxuICAgICAgICAvL2RheXNJbkRlc3RpbmF0aW9uOiB7ZnJvbTogaW50LCB0bzogaW50fSwgZGVmYXVsdDogbnVsbFxuICAgICAgICBkaXJlY3RGbGlnaHRzOiAobm90IHVzZWQgbm93KVxuXG4gICAgICAgIG9uZVBlckRheTogYm9vbCwgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgb25lRm9yQ2l0eTogYm9vbCwgZGVmYXVsdDogZmFsc2VcbiAgICAgIH1cbiAgICovXG4gIEZsaWdodHNBUEkucHJvdG90eXBlLmZpbmRGbGlnaHRzPWZ1bmN0aW9uKHJlcXVlc3QpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgc2VhcmNoUGFyYW1zLCBza3lwaWNrZXJBcGlVcmw7XG4gICAgc2t5cGlja2VyQXBpVXJsID0gXCJodHRwczovL2FwaS5za3lwaWNrZXIuY29tL2ZsaWdodHNcIjtcbiAgICBzZWFyY2hQYXJhbXMgPSB7XG4gICAgICB2OiAyLFxuICAgICAgZmx5RnJvbTogcmVxdWVzdC5vcmlnaW4sXG4gICAgICB0bzogcmVxdWVzdC5kZXN0aW5hdGlvbixcbiAgICAgIC8vZmx5RGF5czogW10sXG4gICAgICAvL2RpcmVjdEZsaWdodHM6IDAsXG5cbiAgICAgIHNvcnQ6IFwicHJpY2VcIixcbiAgICAgIGFzYzogMSxcbiAgICAgIGxvY2FsZTogdGhpcy5zZXR0aW5ncy5sYW5nLFxuICAgICAgZGF5c0luRGVzdGluYXRpb25Gcm9tOiBcIlwiLFxuICAgICAgZGF5c0luRGVzdGluYXRpb25UbzogXCJcIlxuXG4gICAgfTtcblxuICAgIHNlYXJjaFBhcmFtcy5kYXRlRnJvbSA9IHJlcXVlc3Qub3V0Ym91bmREYXRlLmZyb20uZm9ybWF0KGZvcm1hdFNQQXBpRGF0ZSk7XG4gICAgc2VhcmNoUGFyYW1zLmRhdGVUbyA9IHJlcXVlc3Qub3V0Ym91bmREYXRlLnRvLmZvcm1hdChmb3JtYXRTUEFwaURhdGUpO1xuICAgIGlmIChyZXF1ZXN0LnJldHVybkRhdGUpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy50eXBlRmxpZ2h0ID0gXCJyZXR1cm5cIjtcbiAgICAgIHNlYXJjaFBhcmFtcy5yZXR1cm5Gcm9tID0gcmVxdWVzdC5pbmJvdW5kRGF0ZS5mcm9tLmZvcm1hdChmb3JtYXRTUEFwaURhdGUpO1xuICAgICAgc2VhcmNoUGFyYW1zLnJldHVyblRvID0gcmVxdWVzdC5pbmJvdW5kRGF0ZS50by5mb3JtYXQoZm9ybWF0U1BBcGlEYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VhcmNoUGFyYW1zLnR5cGVGbGlnaHQgPSBcIm9uZXdheVwiO1xuICAgICAgc2VhcmNoUGFyYW1zLnJldHVybkZyb20gPSBcIlwiO1xuICAgICAgc2VhcmNoUGFyYW1zLnJldHVyblRvID0gXCJcIjtcbiAgICB9XG5cbiAgICBpZiAocmVxdWVzdC5vbmVQZXJEYXkpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy5vbmVfcGVyX2RhdGUgPSAxO1xuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0Lm9uZUZvckNpdHkpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy5vbmVmb3JjaXR5ID0gMTsgLy8gb25lZm9yY2l0eTogcmVxdWVzdC5vbmVGb3JDaXR5ID8gXCIxXCIgOiBcIlwiLFxuICAgIH1cblxuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBzdXBlcmFnZW50XG4gICAgICAuZ2V0KHNreXBpY2tlckFwaVVybClcbiAgICAgIC5xdWVyeShzZWFyY2hQYXJhbXMpXG4gICAgICAvLy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKVxuICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgLm9uKCdlcnJvcicsIGhhbmRsZUVycm9yKVxuICAgICAgLmVuZChmdW5jdGlvbihlcnJvciwgcmVzKXtcbiAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzLmJvZHkuZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihyZXMuZXJyb3IpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBGbGlnaHRzQVBJO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBzdXBlcmFnZW50ICA9IHJlcXVpcmUoXCJzdXBlcmFnZW50XCIpO1xudmFyIFBsYWNlICA9IHJlcXVpcmUoXCIuLi9jb250YWluZXJzL1BsYWNlLmpzeFwiKTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcbnZhciBRID0gcmVxdWlyZSgncScpO1xuXG52YXIgdXJsID0gXCJodHRwczovL2FwaS5za3lwaWNrZXIuY29tL3BsYWNlc1wiO1xuXG4vL1RPRE8gY2hlY2sgaWYgb24gZXJyb3IgaXMgY2FsbGVkIGV4YWN0bHkgd2hlbiBlcnJvciBpbiBjYWxsYmFjayBvciBub3QsIHRoZW4gQWRkIGl0IHRvIHByb21pc2VcbnZhciBoYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgY29uc29sZS5lcnJvcihlcnIpO1xufTtcblxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gc2V0dGluZ3MubGFuZyAtIGxhbmd1YWdlIGluIHdoaWNoIHdlIGdldCBwbGFjZXMgbmFtYXNcbiAgICovXG4gIGZ1bmN0aW9uIFBsYWNlc0FQSShzZXR0aW5ncykge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgfVxuXG4gIC8qKlxuICAgKiBmaW5kIHBsYWNlcyBhY2NvcmRpbmcgdG8gZ2l2ZW4gYXR0cmlidXRlc1xuICAgKiBAcGFyYW0gcGxhY2VTZWFyY2gudGVybSAtIHN0cmluZyB0byBzZWFyY2hcbiAgICogQHBhcmFtIHBsYWNlU2VhcmNoLnR5cGVJRCAtLSB0eXBlIGlkXG4gICAqIEBwYXJhbSBwbGFjZVNlYXJjaC5ib3VuZHNcbiAgICogQHJldHVybiBwcm9taXNlXG4gICAqL1xuICBQbGFjZXNBUEkucHJvdG90eXBlLmZpbmRQbGFjZXM9ZnVuY3Rpb24ocGxhY2VTZWFyY2gpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcGFyYW1zID0ge307XG4gICAgcGxhY2VTZWFyY2ggPSBwbGFjZVNlYXJjaCB8fCB7fTtcbiAgICBpZiAocGxhY2VTZWFyY2gudGVybSkge1xuICAgICAgcGFyYW1zLnRlcm0gPSBwbGFjZVNlYXJjaC50ZXJtO1xuICAgIH1cbiAgICBpZiAocGxhY2VTZWFyY2guYm91bmRzKSB7XG4gICAgICBwYXJhbXMgPSBkZWVwbWVyZ2UocGFyYW1zLCBwbGFjZVNlYXJjaC5ib3VuZHMpXG4gICAgfVxuICAgIGlmIChwbGFjZVNlYXJjaC50eXBlSUQpIHtcbiAgICAgIHBhcmFtcy50eXBlID0gcGxhY2VTZWFyY2gudHlwZUlEO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4kUGxhY2VzQVBJX2NhbGxBUEkocGFyYW1zKTtcbiAgfTtcblxuXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuJFBsYWNlc0FQSV9jb252ZXJ0UmVzdWx0cz1mdW5jdGlvbihyZXN1bHRzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHJlc3VsdHMubWFwKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgIHJldHVybiBuZXcgUGxhY2UocmVzdWx0KTtcbiAgICB9KTtcbiAgfTtcblxuICBQbGFjZXNBUEkucHJvdG90eXBlLiRQbGFjZXNBUElfY2FsbEFQST1mdW5jdGlvbihwYXJhbXMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgdmFyIGRlZmF1bHRQYXJhbXMgPSB7XG4gICAgICB2OiAyLFxuICAgICAgbG9jYWxlOiB0aGlzLnNldHRpbmdzLmxhbmdcbiAgICB9O1xuICAgIHN1cGVyYWdlbnRcbiAgICAgIC5nZXQodXJsKVxuICAgICAgLnF1ZXJ5KGRlZXBtZXJnZShwYXJhbXMsIGRlZmF1bHRQYXJhbXMpKVxuICAgICAgLy8uc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJylcbiAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgIC5vbignZXJyb3InLCBoYW5kbGVFcnJvcilcbiAgICAgIC5lbmQoIGZ1bmN0aW9uKHJlcykgIHtcbiAgICAgICAgaWYgKCFyZXMuZXJyb3IpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRoaXMuJFBsYWNlc0FQSV9jb252ZXJ0UmVzdWx0cyhyZXMuYm9keSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IocmVzLmVycm9yKSk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBpZCAtIHBsYWNlIGlkXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5yZWdpc3RlckltcG9ydGFuY2U9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgc3VwZXJhZ2VudFxuICAgICAgLnBvc3QodXJsICsgXCIvXCIgKyBpZClcbiAgICAgIC5lbmQoIGZ1bmN0aW9uKHJlcykgIHtcbiAgICAgICAgaWYgKCFyZXMuZXJyb3IpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRoaXMuJFBsYWNlc0FQSV9jb252ZXJ0UmVzdWx0cyhyZXMuYm9keSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IocmVzLmVycm9yKSk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIGZpbmQgYnkgaWQgYW5kIHJlZ2lzdGVyIGltcG9ydGFuY2VcbiAgICogQHBhcmFtIGlkXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5maW5kQnlJZD1mdW5jdGlvbihpZCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgdjogMixcbiAgICAgIGxvY2FsZTogdGhpcy5zZXR0aW5ncy5sYW5nLFxuICAgICAgaWQ6IGlkXG4gICAgfTtcbiAgICBzdXBlcmFnZW50XG4gICAgICAuZ2V0KHVybCArIFwiL1wiICsgaWQpXG4gICAgICAucXVlcnkocGFyYW1zKVxuICAgICAgLy8uc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJylcbiAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgIC5vbignZXJyb3InLCBoYW5kbGVFcnJvcilcbiAgICAgIC5lbmQoIGZ1bmN0aW9uKHJlcykgIHtcbiAgICAgICAgaWYgKCFyZXMuZXJyb3IpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKG5ldyBQbGFjZShyZXMuYm9keSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IocmVzLmVycm9yKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy9DYWxsIG9uZSBtb3JlIHBvc3RcbiAgICB0aGlzLnJlZ2lzdGVySW1wb3J0YW5jZShpZCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG5cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgdXNlIGZpbmRQbGFjZXNcbiAgICovXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuZmluZEJ5TmFtZT1mdW5jdGlvbih0ZXJtKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuJFBsYWNlc0FQSV9jYWxsQVBJKHt0ZXJtOiB0ZXJtfSk7XG4gIH07XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCB1c2UgZmluZFBsYWNlc1xuICAgKi9cbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5maW5kTmVhcmJ5PWZ1bmN0aW9uKGJvdW5kcykge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLiRQbGFjZXNBUElfY2FsbEFQSShib3VuZHMpO1xuICB9O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZXNBUEk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBQbGFjZXNBUEkgID0gcmVxdWlyZShcIi4vUGxhY2VzQVBJLmpzeFwiKTtcbnZhciBRICA9IHJlcXVpcmUoJ3EnKTtcblxudmFyIEdsb2JhbFByb21pc2VzU3RvcmUgPSB7fTtcblxuLyoqXG4gKiBDYWNoZWQgUGxhY2VzQVBJLCBpdCBzaG91bGQgaGF2ZSBhbHdheXMgc2FtZSBpbnRlcmZhY2UgYXMgUGxhY2VzQVBJXG4gKi9cblxuICBmdW5jdGlvbiBQbGFjZXNBUElDYWNoZWQoc2V0dGluZ3MpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLnBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoc2V0dGluZ3MpO1xuICB9XG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuY2FsbENhY2hlZD1mdW5jdGlvbihmdW5jLCBwYXJhbXMsIGtleSkge1widXNlIHN0cmljdFwiO1xuICAgIGlmICghR2xvYmFsUHJvbWlzZXNTdG9yZVtrZXldKSB7XG4gICAgICBHbG9iYWxQcm9taXNlc1N0b3JlW2tleV0gPSBmdW5jKHBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiBHbG9iYWxQcm9taXNlc1N0b3JlW2tleV07XG4gIH07XG5cbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5ib3VuZHNUb1N0cmluZz1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gYm91bmRzLmxhdF9sbyArIFwiX1wiICsgYm91bmRzLmxuZ19sbyArIFwiX1wiICsgYm91bmRzLmxhdF9oaSArIFwiX1wiICsgYm91bmRzLmxuZ19oaTtcbiAgfTtcblxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmRQbGFjZXM9ZnVuY3Rpb24oc2VhcmNoUGFyYW1zKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGtleSA9IFwicF9cIjtcbiAgICBpZiAoc2VhcmNoUGFyYW1zLnRlcm0pIHtcbiAgICAgIGtleSArPSBcInRlcm06XCIrc2VhcmNoUGFyYW1zLnRlcm1cbiAgICB9XG4gICAgaWYgKHNlYXJjaFBhcmFtcy5ib3VuZHMpIHtcbiAgICAgIGtleSArPSBcImJvdW5kczpcIit0aGlzLmJvdW5kc1RvU3RyaW5nKHNlYXJjaFBhcmFtcy5ib3VuZHMpXG4gICAgfVxuICAgIGlmIChzZWFyY2hQYXJhbXMudHlwZUlEKSB7XG4gICAgICBrZXkgKz0gXCJ0eXBlOlwiK3NlYXJjaFBhcmFtcy50eXBlSURcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbENhY2hlZCh0aGlzLnBsYWNlc0FQSS5maW5kUGxhY2VzLmJpbmQodGhpcy5wbGFjZXNBUEkpLCBzZWFyY2hQYXJhbXMsIGtleSk7XG4gIH07XG5cbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5maW5kQnlOYW1lPWZ1bmN0aW9uKHRlcm0pIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmRCeU5hbWUuYmluZCh0aGlzLnBsYWNlc0FQSSksIHRlcm0sIHRlcm0pO1xuICB9O1xuXG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuZmluZE5lYXJieT1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmROZWFyYnkuYmluZCh0aGlzLnBsYWNlc0FQSSksIGJvdW5kcywgdGhpcy5ib3VuZHNUb1N0cmluZyhib3VuZHMpKTtcbiAgfTtcblxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmRCeUlkPWZ1bmN0aW9uKGlkKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuY2FsbENhY2hlZCh0aGlzLnBsYWNlc0FQSS5maW5kQnlJZC5iaW5kKHRoaXMucGxhY2VzQVBJKSwgaWQsIFwiaWQ6XCIraWQpO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2VzQVBJQ2FjaGVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLyogcGFydCBpcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9IYW5zZS9yZWFjdC1jYWxlbmRhci9ibG9iL21hc3Rlci9zcmMvY2FsZW5kYXIuanMgKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xuXG5cblxudmFyIENhbGVuZGFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyXCIsXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2Vla09mZnNldDogMCxcbiAgICAgIGxhbmc6ICdlbicsXG4gICAgICBmb3JjZVNpeFJvd3M6IHRydWVcbiAgICB9O1xuICB9LFxuXG4gIGRheU5hbWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRheU5hbWVzID0gW107XG4gICAgdmFyIGRhdGUgPSB0aGlzLnByb3BzLmRhdGUuc3RhcnRPZignbW9udGgnKTtcbiAgICB2YXIgZGlmZiA9IGRhdGUuaXNvV2Vla2RheSgpIC0gdGhpcy5wcm9wcy53ZWVrT2Zmc2V0O1xuICAgIGlmIChkaWZmIDwgMCkgZGlmZiArPSA3O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgIHZhciBkYXkgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgaS1kaWZmKzErN10pO1xuICAgICAgZGF5TmFtZXMucHVzaChkYXkuZm9ybWF0KFwiZGRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gZGF5TmFtZXM7XG4gIH0sXG5cbiAgZGF5czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRheXMgPSBbXTtcbiAgICB2YXIgYmVnaW5EYXRlID0gdGhpcy5wcm9wcy5kYXRlLnN0YXJ0T2YoJ21vbnRoJyk7XG4gICAgdmFyIGRpZmYgPSBiZWdpbkRhdGUuaXNvV2Vla2RheSgpIC0gdGhpcy5wcm9wcy53ZWVrT2Zmc2V0O1xuICAgIGlmIChkaWZmIDwgMCkgZGlmZiArPSA3O1xuXG4gICAgdmFyIGk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaWZmOyBpKyspIHtcbiAgICAgIHZhciBkYXRlID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIDFdKS5zdWJ0cmFjdCgoZGlmZi1pKSwgJ2RheXMnKTtcbiAgICAgIGRheXMucHVzaCh7ZGF0ZTogZGF0ZSwgb3RoZXJNb250aDogJ3ByZXYtbW9udGgnfSk7XG4gICAgfVxuXG4gICAgdmFyIG51bWJlck9mRGF5cyA9IGJlZ2luRGF0ZS5kYXlzSW5Nb250aCgpO1xuICAgIGZvciAoaSA9IDE7IGkgPD0gbnVtYmVyT2ZEYXlzOyBpKyspIHtcbiAgICAgIHZhciBkYXRlID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIGldKTtcbiAgICAgIGRheXMucHVzaCh7ZGF0ZTogZGF0ZX0pO1xuICAgIH1cblxuICAgIGkgPSAxO1xuICAgIHdoaWxlIChkYXlzLmxlbmd0aCAlIDcgIT09IDApIHtcbiAgICAgIHZhciBkYXRlID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIG51bWJlck9mRGF5c10pLmFkZChpLCBcImRheXNcIik7XG4gICAgICBkYXlzLnB1c2goe2RhdGU6IGRhdGUsIG90aGVyTW9udGg6ICduZXh0LW1vbnRoJ30pO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLmZvcmNlU2l4Um93cyAmJiBkYXlzLmxlbmd0aCAhPT0gNDIpIHtcbiAgICAgIHZhciBzdGFydCA9IG1vbWVudC51dGMoZGF5c1tkYXlzLmxlbmd0aC0xXS5kYXRlKS5hZGQoMSwgJ2RheXMnKTtcbiAgICAgIHdoaWxlIChkYXlzLmxlbmd0aCA8IDQyKSB7XG4gICAgICAgIGRheXMucHVzaCh7ZGF0ZTogbW9tZW50LnV0YyhzdGFydCksIG90aGVyTW9udGg6ICduZXh0LW1vbnRoJ30pO1xuICAgICAgICBzdGFydC5hZGQoMSwgJ2RheXMnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF5cztcbiAgfSxcbiAgc3BsaXRUb1dlZWtzOiBmdW5jdGlvbiAoZGF5cykge1xuICAgIHZhciB3ZWVrcyA9IFtdO1xuICAgIHZhciBhY3R1YWxXZWVrID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGk8ZGF5cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGklNyA9PSAwICYmIGkgIT0gMCkge1xuICAgICAgICB3ZWVrcy5wdXNoKGFjdHVhbFdlZWspO1xuICAgICAgICBhY3R1YWxXZWVrID0gW107XG4gICAgICB9XG4gICAgICBhY3R1YWxXZWVrLnB1c2goZGF5c1tpXSlcbiAgICB9XG4gICAgd2Vla3MucHVzaChhY3R1YWxXZWVrKTtcbiAgICByZXR1cm4gd2Vla3M7XG4gIH0sXG4gIHJlbmRlcldlZWs6IGZ1bmN0aW9uICh3ZWVrKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJ3ZWVrXCJ9LCBcbiAgICAgICAgd2Vlay5tYXAodGhpcy5yZW5kZXJEYXkpXG4gICAgICApXG4gICAgKVxuICB9LFxuICByZW5kZXJEYXk6IGZ1bmN0aW9uKGRheSkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmdldERheShkYXkuZGF0ZSwgZGF5Lm90aGVyTW9udGgpO1xuICB9LFxuICByZW5kZXJEYXlOYW1lOiBmdW5jdGlvbiAoZGF5TmFtZSkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IGRheU5hbWUsIGNsYXNzTmFtZTogXCJkYXktbmFtZVwifSwgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgZGF5TmFtZSApKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgd2Vla3MgPSB0aGlzLnNwbGl0VG9XZWVrcyh0aGlzLmRheXMoKSk7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kclwifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kci1tb250aFwifSwgXG4gICAgICAgICAgIHRoaXMucHJvcHMuZGF0ZS5mb3JtYXQoXCJNTU1NIFlZWVlcIikgXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xuZHItZ3JpZFwifSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImRheS1uYW1lc1wifSwgXG4gICAgICAgICAgICB0aGlzLmRheU5hbWVzKCkubWFwKHRoaXMucmVuZGVyRGF5TmFtZSlcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZGF5c1wifSwgXG4gICAgICAgICAgICB3ZWVrcy5tYXAodGhpcy5yZW5kZXJXZWVrKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbGVhci1ib3RoXCJ9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsZW5kYXI7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBNb2RhbFBpY2tlciA9IHJlcXVpcmUoXCIuLy4uL01vZGFsUGlja2VyLmpzeFwiKTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9EYXRlUGlja2VyLmpzeCcpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcblxuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGluaXRpYWxWYWx1ZTogbmV3IFNlYXJjaERhdGUoKSxcbiAgb25IaWRlOiBmdW5jdGlvbigpIHt9LFxuICBhcHBlbmRUb0VsZW1lbnQ6IGRvY3VtZW50LmJvZHksXG4gIGxvY2FsZTogXCJlblwiLFxuICBzaXplczoge1xuICAgIHNpbmdsZToge3dpZHRoOiA0NTQsIGhlaWdodDogMjAwfSxcbiAgICBpbnRlcnZhbDoge3dpZHRoOiA5MjQsIGhlaWdodDogMjAwLCB3aWR0aENvbXBhY3Q6IDQ1NH0sXG4gICAgbW9udGg6IHt3aWR0aDogNTUwLCBoZWlnaHQ6IDIwMH0sXG4gICAgdGltZVRvU3RheToge3dpZHRoOiA1NTAsIGhlaWdodDogMjAwfSxcbiAgICBhbnl0aW1lOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9LFxuICAgIG5vUmV0dXJuOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gIH0sXG4gIG1vZGVzOiB7XG4gICAgXCJzaW5nbGVcIjoge1xuICAgICAgY2xvc2VBZnRlcjogXCJzZWxlY3RcIiwgLy8gc2VsZWN0XG4gICAgICBmaW5pc2hBZnRlcjogXCJzZWxlY3RcIiAvLyBzZWxlY3RcbiAgICB9LFxuICAgIFwiaW50ZXJ2YWxcIjoge30sXG4gICAgXCJtb250aFwiOiB7fSxcbiAgICBcInRpbWVUb1N0YXlcIjoge30sXG4gICAgXCJhbnl0aW1lXCI6IHt9LFxuICAgIFwibm9SZXR1cm5cIjoge31cbiAgfVxufTtcblxudmFyIERhdGVQaWNrZXJNb2RhbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJEYXRlUGlja2VyTW9kYWxcIixcbiAgZ2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLnByb3BzLm9wdGlvbnMpO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uczoge31cbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnRTaXplOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gICAgfTtcbiAgfSxcbiAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcbiAgICBpZiAob3B0aW9ucy5tb2Rlc1t2YWx1ZS5tb2RlXSAmJiBvcHRpb25zLm1vZGVzW3ZhbHVlLm1vZGVdLmNsb3NlQWZ0ZXIgPT0gY2hhbmdlVHlwZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkhpZGUoKTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSk7XG4gIH0sXG4gIG9uU2l6ZUNoYW5nZTogZnVuY3Rpb24gKHNpemVzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb250ZW50U2l6ZTogc2l6ZXNcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgIGlmICghdGhpcy5wcm9wcy5zaG93bikge3JldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSl9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kYWxQaWNrZXIsIHtjb250ZW50U2l6ZTogdGhpcy5zdGF0ZS5jb250ZW50U2l6ZSwgaW5wdXRFbGVtZW50OiB0aGlzLnByb3BzLmlucHV0RWxlbWVudCwgb25IaWRlOiB0aGlzLnByb3BzLm9uSGlkZX0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHt2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgcmVmOiBcInBsYWNlUGlja2VyXCIsIG9uQ2hhbmdlOiB0aGlzLm9uVmFsdWVDaGFuZ2UsIHNpemVzOiBvcHRpb25zLnNpemVzLCBtb2Rlczogb3B0aW9ucy5tb2Rlcywgb25TaXplQ2hhbmdlOiB0aGlzLm9uU2l6ZUNoYW5nZX1cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXJNb2RhbDtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG5cbnZhciBDYWxlbmRhckRheSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJDYWxlbmRhckRheVwiLFxuXG4gIG9uT3ZlcjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25PdmVyKHRoaXMucHJvcHMuZGF0ZSlcbiAgfSxcbiAgb25TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHRoaXMucHJvcHMuZGF0ZSlcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRlOiBudWxsLFxuICAgICAgb3RoZXJNb250aDogJydcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgY2xhc3NlcyA9IHRoaXMucHJvcHMub3RoZXJNb250aDtcbiAgICBpZiAoIWNsYXNzZXMpIHtcbiAgICAgIGNsYXNzZXMgPSBcIlwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgY2xhc3NlcyArPSBcIiBkaXNhYmxlZFwiO1xuICAgICAgcmV0dXJuICggLy9vbk1vdXNlTGVhdmU9eyB0aGlzLnByb3BzLm9uTGVhdmUgfVxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzZXMgfSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJkYXktbnVtYmVyXCJ9LCB0aGlzLnByb3BzLmRhdGUuZGF0ZSgpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5vdGhlcikge1xuICAgICAgY2xhc3NlcyArPSBcIiBvdGhlclwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5vdmVyKSB7XG4gICAgICBjbGFzc2VzICs9IFwiIG92ZXJcIlxuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgY2xhc3NlcyArPSBcIiBzZWxlY3RlZFwiXG4gICAgfVxuICAgIHJldHVybiAoIC8vb25Nb3VzZUxlYXZlPXsgdGhpcy5wcm9wcy5vbkxlYXZlIH1cbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3Nlcywgb25Nb3VzZUVudGVyOiAgdGhpcy5vbk92ZXIsIG9uQ2xpY2s6ICB0aGlzLm9uU2VsZWN0fSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwiZGF5LW51bWJlclwifSwgdGhpcy5wcm9wcy5kYXRlLmRhdGUoKSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYWxlbmRhckRheTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcblxudmFyIENhbGVuZGFyRGF5ID0gcmVxdWlyZShcIi4vQ2FsZW5kYXJEYXkuanN4XCIpO1xudmFyIERheXNJbldlZWsgPSByZXF1aXJlKFwiLi9TZWxlY3REYXlzSW5XZWVrLmpzeFwiKTtcbnZhciBDYWxlbmRhciA9IHJlcXVpcmUoXCIuLy4uLy4uL0NhbGVuZGFyLmpzeFwiKTtcbnZhciBEYXRlVG9vbHMgPSByZXF1aXJlKFwiLi8uLi8uLi9EYXRlVG9vbHMuanNcIik7XG5cbnZhciBDYWxlbmRhckZyYW1lID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyRnJhbWVcIixcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRlT3ZlcjogbnVsbCxcbiAgICAgIHZpZXdEYXRlOiBtb21lbnQudXRjKHRoaXMucHJvcHMudmFsdWUuZnJvbSkgfHwgbW9tZW50LnV0YygpXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIGNhbGVuZGFyc051bWJlcjogMSxcbiAgICAgIHNlbGVjdGlvbk1vZGU6IFwic2luZ2xlXCJcblxuICAgIH07XG4gIH0sXG5cbiAgb25PdmVyOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZGF0ZU92ZXI6IGRhdGVcbiAgICB9KTtcbiAgfSxcblxuICAvL1RPRE8gY2hlY2ggaWYgaXQgaXMgZ29vZCB0byBoYXZlIHRoaXMgc3RhdGUgaGVyZSwgb3IgaSBzaG91bGQgcHV0IGl0IHRvIERhdGVQaWNrZVxuICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZpZXdEYXRlOiB0aGlzLnN0YXRlLnZpZXdEYXRlLmFkZCgxLCAnbW9udGhzJylcbiAgICB9KTtcbiAgfSxcblxuICBwcmV2OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZpZXdEYXRlOiB0aGlzLnN0YXRlLnZpZXdEYXRlLnN1YnRyYWN0KDEsICdtb250aHMnKVxuICAgIH0pO1xuICB9LFxuXG4gIHNldFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGNoYW5nZVR5cGUpIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCBjaGFuZ2VUeXBlKVxuICB9LFxuXG4gIG9uU2VsZWN0OiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgICAgLy9pZiBzaW5nbGUganVzdCBzZWxlY3RcbiAgICAgIHRoaXMuc2V0VmFsdWUoe21vZGU6IFwic2luZ2xlXCIsIGZyb206IGRhdGUsIHRvOiBkYXRlfSxcInNlbGVjdFwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSA9PSBcImludGVydmFsXCIpIHtcbiAgICAgIC8vaWYgaW50ZXJ2YWwgZGVjaWRlIG9uIG1vZGVcbiAgICAgIGlmICghdGhpcy5wcm9wcy52YWx1ZS5mcm9tKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUoe21vZGU6IFwiaW50ZXJ2YWxcIiwgZnJvbTogZGF0ZSwgdG86IG51bGwsIGZpbmFsOiBmYWxzZX0sXCJzZWxlY3RQYXJ0aWFsXCIpO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy52YWx1ZS50bykge1xuICAgICAgICAvL2lmIGlzIGJlZm9yZSwganVzdCBwdXQgc3RhcnQgZGF0ZSBhZ2FpblxuICAgICAgICBpZiAoZGF0ZSA8IHRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoe21vZGU6IFwiaW50ZXJ2YWxcIiwgZnJvbTogZGF0ZSwgdG86IG51bGwsIGZpbmFsOiBmYWxzZX0sXCJzZWxlY3RQYXJ0aWFsXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0VmFsdWUoe21vZGU6IFwiaW50ZXJ2YWxcIiwgZnJvbTogbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pLCB0bzogZGF0ZX0sXCJzZWxlY3RcIik7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgaSBoYXZlIGNob3NlbiBib3RoIGkgc3RhcnQgdG8gcGljayBuZXcgb25lXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoe21vZGU6IFwiaW50ZXJ2YWxcIiwgZnJvbTogZGF0ZSwgdG86IG51bGwsIGZpbmFsOiBmYWxzZX0sXCJzZWxlY3RQYXJ0aWFsXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBpc1NlbGVjdGVkOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIGlmICghdGhpcy5wcm9wcy52YWx1ZS5mcm9tKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSA9PSBcInNpbmdsZVwiKSB7XG4gICAgICByZXR1cm4gZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA9PSBtb21lbnQudXRjKHRoaXMucHJvcHMudmFsdWUuZnJvbSkuZm9ybWF0KFwiWVlZWU1NRERcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJpbnRlcnZhbFwiKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZS50bykge1xuICAgICAgICByZXR1cm4gZGF0ZSA+PSB0aGlzLnByb3BzLnZhbHVlLmZyb20gJiYgZGF0ZSA8PSB0aGlzLnByb3BzLnZhbHVlLnRvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIikgPT0gbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pLmZvcm1hdChcIllZWVlNTUREXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBpc092ZXI6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmRhdGVPdmVyKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSA9PSBcImludGVydmFsXCIpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLmZyb20gJiYgIXRoaXMucHJvcHMudmFsdWUudG8pIHtcbiAgICAgICAgcmV0dXJuIGRhdGUgPj0gdGhpcy5wcm9wcy52YWx1ZS5mcm9tICYmIGRhdGUgPD0gdGhpcy5zdGF0ZS5kYXRlT3ZlcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRhdGVPdmVyLmZvcm1hdChcIllZWVlNTUREXCIpID09IGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRhdGVPdmVyLmZvcm1hdChcIllZWVlNTUREXCIpID09IGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIik7XG4gICAgfVxuICB9LFxuXG4gIGdldERheTogZnVuY3Rpb24gKGRhdGUsIG90aGVyTW9udGgpIHtcbiAgICB2YXIgb3RoZXIgPSBmYWxzZTtcbiAgICB2YXIgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5wcm9wcy5taW5WYWx1ZSAmJiBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpIDw9IHRoaXMucHJvcHMubWluVmFsdWUuZm9ybWF0KFwiWVlZWU1NRERcIikpIHtcbiAgICAgIG90aGVyID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIikgPD0gbW9tZW50KCkuZm9ybWF0KFwiWVlZWU1NRERcIikpIHtcbiAgICAgIGRpc2FibGVkID0gdHJ1ZTsgLy9UT0RPIHNob3VsZCBiZSBwcm9iYWJseSBkZWZpbmVkIHNvbWV3aGVyZSBtb3JlIG91dHNpZGVcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FsZW5kYXJEYXksIHtcbiAgICAgICAga2V5OiBkYXRlLnZhbHVlT2YoKSwgXG4gICAgICAgIGRhdGU6IGRhdGUsIFxuICAgICAgICBvdGhlck1vbnRoOiBvdGhlck1vbnRoLCBcbiAgICAgICAgb25PdmVyOiB0aGlzLm9uT3ZlciwgXG4gICAgICAgIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0LCBcbiAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuaXNTZWxlY3RlZChkYXRlKSwgXG4gICAgICAgIG92ZXI6IHRoaXMuaXNPdmVyKGRhdGUpLCBcbiAgICAgICAgZGlzYWJsZWQ6IGRpc2FibGVkLCBcbiAgICAgICAgb3RoZXI6IG90aGVyfVxuICAgICAgICApXG4gICAgKTtcbiAgfSxcbiAgcmVuZGVyUHJldjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnZpZXdEYXRlLnN1YnRyYWN0KDEsICdtb250aHMnKS5mb3JtYXQoXCJZWVlZTU1cIikgPCBtb21lbnQudXRjKCkuZm9ybWF0KFwiWVlZWU1NXCIpKVxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJldiBkaXNhYmxlZFwifSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSkpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByZXZcIiwgb25DbGljazogdGhpcy5wcmV2fSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSkpO1xuICB9LFxuICByZW5kZXJOZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUudmlld0RhdGUuYWRkKDEsICdtb250aHMnKS5mb3JtYXQoXCJZWVlZTU1cIikgPiBtb21lbnQudXRjKCkuYWRkKDYsJ21vbnRocycpLmZvcm1hdChcIllZWVlNTVwiKSlcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm5leHQgZGlzYWJsZWRcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJuZXh0XCIsIG9uQ2xpY2s6IHRoaXMubmV4dH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjYWxlbmRhckRhdGVzID0gW107XG4gICAgdmFyIGluaXRpYWxEYXRlID0gbW9tZW50LnV0Yyh0aGlzLnN0YXRlLnZpZXdEYXRlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucHJvcHMuY2FsZW5kYXJzTnVtYmVyOyArK2kpIHtcbiAgICAgIGNhbGVuZGFyRGF0ZXMucHVzaCggbW9tZW50LnV0Yyhpbml0aWFsRGF0ZSkgKTtcbiAgICAgIGluaXRpYWxEYXRlLmFkZCgxLFwibW9udGhcIilcbiAgICB9XG4gICAgdmFyIGogPSAwO1xuICAgIHZhciBjYWxlbmRhcnMgPSBjYWxlbmRhckRhdGVzLm1hcChmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgaisrO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7a2V5OiBkYXRlLnZhbHVlT2YoKSwgY2xhc3NOYW1lOiAnY2FsZW5kYXItdmlldyBjYWxlbmRhci12aWV3LScran0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FsZW5kYXIsIHtkYXRlOiBkYXRlLCBnZXREYXk6IHNlbGYuZ2V0RGF5LCB3ZWVrT2Zmc2V0OiBEYXRlVG9vbHMuZmlyc3REYXlPZldlZWsoKX0pXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgICB0aGlzLnJlbmRlclByZXYoKSwgXG4gICAgICAgIGNhbGVuZGFycywgXG4gICAgICAgICB0aGlzLnJlbmRlck5leHQoKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbGVhci1ib3RoXCJ9KSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF5c0luV2VlaywgbnVsbClcbiAgICAgIClcbiAgICApXG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGVuZGFyRnJhbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgTW9kYWxNZW51TWl4aW4gPSByZXF1aXJlKCcuLy4uLy4uL01vZGFsTWVudU1peGluLmpzeCcpO1xudmFyIENhbGVuZGFyRnJhbWUgPSByZXF1aXJlKCcuL0NhbGVuZGFyRnJhbWUuanN4Jyk7XG52YXIgTW9udGhNYXRyaXggPSByZXF1aXJlKFwiLi9Nb250aE1hdHJpeC5qc3hcIik7XG52YXIgU2xpZGVyID0gcmVxdWlyZSgnLi9TbGlkZXIuanMnKTtcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vLi4vdHIuanMnKTtcbnZhciBUcmFuID0gcmVxdWlyZSgnLi8uLi8uLi9UcmFuLmpzeCcpO1xudmFyIGlzSUUgPSByZXF1aXJlKCcuLy4uLy4uL3Rvb2xzL2lzSUUuanMnKTtcblxuXG5SZWFjdC5pbml0aWFsaXplVG91Y2hFdmVudHModHJ1ZSk7XG5cbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG5cbnZhciBIYW5kbGUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiSGFuZGxlXCIsXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJoYW5kbGVcIn0sIFxuICAgICAgICB0aGlzLnByb3BzLnNsaWRlclZhbHVlXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbnZhciBEYXRlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkRhdGVQaWNrZXJcIixcbiAgbWl4aW5zOiBbTW9kYWxNZW51TWl4aW5dLFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSA/IHRoaXMucHJvcHMudmFsdWUgOiBuZXcgU2VhcmNoRGF0ZSgpLFxuICAgICAgdmlld01vZGU6IHRoaXMucHJvcHMudmFsdWUgPyB0aGlzLnByb3BzLnZhbHVlLm1vZGUgOiBcInNpbmdsZVwiXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIGRlZmF1bHRNb2RlOiBcInNpbmdsZVwiLFxuICAgICAgbGFuZzogJ2VuJyxcbiAgICAgIG1pblZhbHVlOiBudWxsXG4gICAgfTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgdGhpcy5wcm9wcy5vblNpemVDaGFuZ2UodGhpcy5wcm9wcy5zaXplc1ttb2RlXSk7XG4gIH0sXG4gIGdldE1vZGVMYWJlbDogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgbW9kZUxhYmVscyA9IHtcbiAgICAgIHNpbmdsZTogdHIoXCJTcGVjaWZpY1wiLFwic3BlY2lmaWNcIiksXG4gICAgICBpbnRlcnZhbDogdHIoXCJJbnRlcnZhbFwiLFwiaW50ZXJ2YWxcIiksXG4gICAgICBtb250aDogdHIoXCJNb250aHNcIixcIm1vbnRoc1wiKSxcbiAgICAgIHRpbWVUb1N0YXk6IHRyKFwiVGltZSB0byBzdGF5XCIsXCJ0aW1lX3RvX3N0YXlcIiksXG4gICAgICBhbnl0aW1lOiB0cihcIkFueXRpbWVcIixcImFueXRpbWVcIiksXG4gICAgICBub1JldHVybjogdHIoXCJObyByZXR1cm5cIixcIm5vX3JldHVyblwiKVxuICAgIH07XG4gICAgcmV0dXJuIG1vZGVMYWJlbHNbbW9kZV07XG4gIH0sXG5cbiAgc3dpdGNoTW9kZVRvRnVuYzogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG5ld1ZhbHVlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFwidGltZVRvU3RheVwiOlxuICAgICAgICAgIHNlbGYuY2hhbmdlVmFsdWUoc2VsZi5nZXRWYWx1ZSgpLmVkaXQoe21vZGU6IG1vZGV9KSwgXCJyZWxlYXNlXCIpOyAvLyBzaG91bGQgYnkgc29tZXRoaW5nIGxpa2UgY2hhbmdlIG1vZGUsIGJ1dCBpdCBmaW5pc2hlcyB2YWx1ZSBvbmx5IGFmdGVyIHJlbGVhc2Ugc28gVE9ETyBtYWtlIGl0IHNtYXJ0ZXJcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiYW55dGltZVwiOlxuICAgICAgICBjYXNlIFwibm9SZXR1cm5cIjpcbiAgICAgICAgICBzZWxmLmNoYW5nZVZhbHVlKHNlbGYuZ2V0VmFsdWUoKS5lZGl0KHttb2RlOiBtb2RlfSksIFwic2VsZWN0XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuXG4gICAgICBzZWxmLnByb3BzLm9uU2l6ZUNoYW5nZShzZWxmLnByb3BzLnNpemVzW21vZGVdKTtcbiAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICB2aWV3TW9kZTogbW9kZVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsY2hhbmdlVHlwZSkge1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5lZGl0KHZhbHVlKTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLGNoYW5nZVR5cGUpO1xuICB9LFxuXG4gIGdldFZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudmFsdWU7XG4gIH0sXG5cbiAgc2V0TW9udGg6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh7XG4gICAgICBtb2RlOiBcIm1vbnRoXCIsXG4gICAgICBmcm9tOiBtb21lbnQudXRjKGRhdGUpLnN0YXJ0T2YoJ21vbnRoJyksXG4gICAgICB0bzogbW9tZW50LnV0YyhkYXRlKS5lbmRPZignbW9udGgnKVxuICAgIH0sXCJzZWxlY3RcIik7XG4gIH0sXG5cbiAgY2hhbmdlTWluU3RheURheXM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA+IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZVZhbHVlKHtcbiAgICAgIG1vZGU6IFwidGltZVRvU3RheVwiLFxuICAgICAgbWluU3RheURheXM6IHZhbHVlLFxuICAgICAgbWF4U3RheURheXM6IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5c1xuICAgIH0sIFwiZHJhZ2dlZFwiKTtcbiAgfSxcblxuICBjaGFuZ2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlIDwgdGhpcy5nZXRWYWx1ZSgpLm1pblN0YXlEYXlzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlVmFsdWUoe1xuICAgICAgbW9kZTogXCJ0aW1lVG9TdGF5XCIsXG4gICAgICBtaW5TdGF5RGF5czogdGhpcy5nZXRWYWx1ZSgpLm1pblN0YXlEYXlzLFxuICAgICAgbWF4U3RheURheXM6IHZhbHVlXG4gICAgfSwgXCJkcmFnZ2VkXCIpO1xuICB9LFxuXG4gIHJlbGVhc2VNaW5TdGF5RGF5czogZnVuY3Rpb24gKCkge1xuICAgIC8vIGRvIG5vdCBjaGFuZ2UgdmFsdWUsIGJ1dCB0cmlnZ2VyIGl0IHdpdGggZGlmZmVyZW50IGNoYW5nZSB0eXBlXG4gICAgdGhpcy5jaGFuZ2VWYWx1ZShudWxsLCBcInJlbGVhc2VcIik7XG4gIH0sXG4gIHJlbGVhc2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hhbmdlVmFsdWUobnVsbCwgXCJyZWxlYXNlXCIpO1xuICB9LFxuXG4gIGNvbmZpcm1UaW1lVG9TdGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh0aGlzLnByb3BzLnZhbHVlLCBcInNlbGVjdFwiKTtcbiAgfSxcblxuXG4gIHJlbmRlclNpbmdsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRnJhbWUsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgbWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIHNlbGVjdGlvbk1vZGU6IFwic2luZ2xlXCIsIGNhbGVuZGFyc051bWJlcjogMX0pXG4gICAgKVxuICB9LFxuICByZW5kZXJJbnRlcnZhbDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRnJhbWUsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgbWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIHNlbGVjdGlvbk1vZGU6IFwiaW50ZXJ2YWxcIiwgY2FsZW5kYXJzTnVtYmVyOiAzfSlcbiAgICApXG4gIH0sXG4gIHJlbmRlck1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KE1vbnRoTWF0cml4LCB7bWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIG9uU2V0OiB0aGlzLnNldE1vbnRoLCB0b3RhbE1vbnRoczogXCI2XCJ9KSk7XG4gIH0sXG4gIHJlbmRlclRpbWVUb1N0YXk6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGVhZGxpbmUgPSB0cihcIlN0YXkgdGltZSBmcm9tICVzIHRvICVzIGRheXMuXCIsIFwic3RheV90aW1lX2Zyb21cIiwgW3RoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cywgdGhpcy5nZXRWYWx1ZSgpLm1heFN0YXlEYXlzXSApO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwidGltZS10by1zdGF5XCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnQtaGVhZGxpbmVcIn0sIGhlYWRsaW5lKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNaW5TdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWluU3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWluIGhvcml6b250YWwtc2xpZGVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZSwgbnVsbClcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNYXhTdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWF4U3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWF4IGhvcml6b250YWwtc2xpZGVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZSwgbnVsbClcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzbGlkZXItYXhlXCJ9KSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJidG4gY29uZmlybS10aW1lLXRvLXN0YXktYnV0dG9uXCIsIG9uQ2xpY2s6IHRoaXMuY29uZmlybVRpbWVUb1N0YXl9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW4sIHt0S2V5OiBcIm9rXCJ9LCBcIk9LXCIpKVxuICAgICAgKVxuICAgICk7XG4gIH0sXG4gIHJlbmRlckFueXRpbWU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9LFxuICByZW5kZXJOb1JldHVybjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1vZGUgPSB0aGlzLnN0YXRlLnZpZXdNb2RlO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICdzZWFyY2gtZGF0ZS1waWNrZXIgc2VhcmNoLXBpY2tlciAnK21vZGV9LCBcbiAgICAgICAgIHRoaXMucmVuZGVyTWVudSgpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIn0sIFxuICAgICAgICAgICB0aGlzLnJlbmRlckJvZHkoKSBcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbGVhci1ib3RoXCJ9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBUcmFuID0gcmVxdWlyZSgnLi8uLi8uLi9UcmFuLmpzeCcpO1xuXG52YXIgTW9udGhNYXRyaXggPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiTW9udGhNYXRyaXhcIixcblxuICBzZXRNb250aDogZnVuY3Rpb24gKG1vbnRoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnByb3BzLm9uU2V0KG1vbnRoKTtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBtb250aHMgPSBbXTtcbiAgICB2YXIgaU1vbnRoID0gbW9tZW50LnV0YygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyc2VJbnQoc2VsZi5wcm9wcy50b3RhbE1vbnRocywxMCk7IGkrKykge1xuICAgICAgbW9udGhzLnB1c2goIG1vbWVudC51dGMoaU1vbnRoKSApO1xuICAgICAgaU1vbnRoLmFkZCgxLCBcIm1vbnRoc1wiKTtcbiAgICB9XG4gICAgdmFyIG1vbnRoc0VsZW1lbnRzID0gbW9udGhzLm1hcChmdW5jdGlvbiAobW9udGgpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogbW9udGgudmFsdWVPZigpLCBjbGFzc05hbWU6IFwibW9udGgtb3B0aW9uXCIsIG9uQ2xpY2s6IHNlbGYuc2V0TW9udGgobW9udGgpfSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJtb250aC1uYW1lXCJ9LCBcbiAgICAgICAgICAgICBtb250aC5mb3JtYXQoXCJNTU1NXCIpIFxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJiclwiLCBudWxsKSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJtb250aC15ZWFyXCJ9LCBcbiAgICAgICAgICAgICBtb250aC5mb3JtYXQoXCJZWVlZXCIpIFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoIC8vb25Nb3VzZUxlYXZlPXsgdGhpcy5wcm9wcy5vbkxlYXZlIH1cbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb250aC1tYXRyaXhcIn0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY29udGVudC1oZWFkbGluZVwifSwgUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuLCB7dEtleTogXCJzZWxlY3RfbW9udGhcIn0sIFwiU2VsZWN0IG1vbnRoXCIpKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb250aHNcIn0sIFxuICAgICAgICAgIG1vbnRoc0VsZW1lbnRzXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb250aE1hdHJpeDtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIFRyYW4gPSByZXF1aXJlKCcuLy4uLy4uL1RyYW4uanN4Jyk7XG5cbnZhciBTZWxlY3REYXlzSW5XZWVrID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlNlbGVjdERheXNJbldlZWtcIixcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoIC8vb25Nb3VzZUxlYXZlPXsgdGhpcy5wcm9wcy5vbkxlYXZlIH1cbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCBudWxsLCBcbiAgICAgICAgXCJUdWVcIiwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7dHlwZTogXCJjaGVja2JveFwiLCBuYW1lOiBcImZseURheXNbXVwiLCB2YWx1ZTogXCIyXCIsIGNoZWNrZWQ6IFwiXFxcImNoZWNrZWRcXFwiXCJ9KSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwpXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0RGF5c0luV2VlaztcbiIsIlwidXNlIHN0cmljdFwiO1xuKGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ3JlYWN0J10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vVE9ETyBnZXQgaXQgYmFjayB3aGVuIHJlcXVpcmUgZnJvbSBhbm90aGVyIGJ1bmRsZSB3aWxsIHdvcmtcbiAgICAvL21vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdyZWFjdCcpKTtcbiAgICBtb2R1bGUuZXhwb3J0cz1mYWN0b3J5KHdpbmRvdy5SZWFjdCk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5SZWFjdFNsaWRlciA9IGZhY3Rvcnkocm9vdC5SZWFjdCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24oUmVhY3QpIHtcblxuICB2YXIgUmVhY3RTbGlkZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7IGRpc3BsYXlOYW1lOiAnUmVhY3RTbGlkZXInLFxuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICBtaW5WYWx1ZTogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIG1heFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxuICAgICAgc3RlcDogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICAgIG9yaWVudGF0aW9uOiBSZWFjdC5Qcm9wVHlwZXMub25lT2YoWydob3Jpem9udGFsJywgJ3ZlcnRpY2FsJ10pLFxuICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgICAgb25SZWxlYXNlOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgIHZhbHVlUHJvcE5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgICB9LFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1pblZhbHVlOiAwLFxuICAgICAgICBtYXhWYWx1ZTogMTAwLFxuICAgICAgICB2YWx1ZTogMCxcbiAgICAgICAgc3RlcDogMSxcbiAgICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcbiAgICAgICAgdmFsdWVQcm9wTmFtZTogJ3NsaWRlclZhbHVlJ1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIG1vdW50ZWQ6IHRydWVcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtb3VudGVkOiBmYWxzZVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0UG9zaXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMuc3RhdGUubW91bnRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVwcGVyQm91bmQ6IDAsXG4gICAgICAgICAgaGFuZGxlV2lkdGg6IDAsXG4gICAgICAgICAgc2xpZGVyTWluOiAwLFxuICAgICAgICAgIHNsaWRlck1heDogMFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgdmFyIHNsaWRlciA9IHRoaXMucmVmcy5zbGlkZXIuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIGhhbmRsZSA9IHRoaXMucmVmcy5oYW5kbGUuZ2V0RE9NTm9kZSgpO1xuICAgICAgdmFyIHJlY3QgPSBzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgIHZhciBzaXplID0ge1xuICAgICAgICBob3Jpem9udGFsOiAnY2xpZW50V2lkdGgnLFxuICAgICAgICB2ZXJ0aWNhbDogJ2NsaWVudEhlaWdodCdcbiAgICAgIH1bdGhpcy5wcm9wcy5vcmllbnRhdGlvbl07XG5cbiAgICAgIHZhciBwb3NpdGlvbiA9IHtcbiAgICAgICAgaG9yaXpvbnRhbDogeyBtaW46ICdsZWZ0JywgbWF4OiAncmlnaHQnIH0sXG4gICAgICAgIHZlcnRpY2FsOiB7IG1pbjogJ3RvcCcsIG1heDogJ2JvdHRvbScgfVxuICAgICAgfVt0aGlzLnByb3BzLm9yaWVudGF0aW9uXTtcbiAgICAgIHZhciB1cHBlckJvdW5kID0gc2xpZGVyW3NpemVdIC0gaGFuZGxlW3NpemVdO1xuXG4gICAgICB0aGlzLmNhY2hlZFBvc2l0aW9ucyA9IHtcbiAgICAgICAgdXBwZXJCb3VuZDogdXBwZXJCb3VuZCxcbiAgICAgICAgaGFuZGxlV2lkdGg6IGhhbmRsZVtzaXplXSxcbiAgICAgICAgc2xpZGVyTWluOiByZWN0W3Bvc2l0aW9uLm1pbl0sXG4gICAgICAgIHNsaWRlck1heDogcmVjdFtwb3NpdGlvbi5tYXhdIC0gaGFuZGxlW3NpemVdXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkUG9zaXRpb25zO1xuICAgIH0sXG5cbiAgICBnZXRPZmZzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByYXRpbyA9ICh0aGlzLnByb3BzLnZhbHVlIC0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgLyAodGhpcy5wcm9wcy5tYXhWYWx1ZSAtIHRoaXMucHJvcHMubWluVmFsdWUpO1xuICAgICAgcmV0dXJuIHJhdGlvICogdGhpcy5nZXRQb3NpdGlvbnMoKS51cHBlckJvdW5kO1xuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhhbmRsZVN0eWxlID0ge1xuICAgICAgICAvL3RyYW5zZm9ybTogJ3RyYW5zbGF0ZScgKyB0aGlzLl9heGlzKCkgKyAnKCcgKyAgKyAncHgpJyxcbiAgICAgICAgbWFyZ2luTGVmdDogdGhpcy5nZXRPZmZzZXQoKSArICdweCcsXG4gICAgICAgIC8vIGxldCB0aGlzIGVsZW1lbnQgYmUgdGhlIHNhbWUgc2l6ZSBhcyBpdHMgY2hpbGRyZW4uXG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snXG4gICAgICB9O1xuXG4gICAgICB2YXIgdXNlckhhbmRsZSA9IHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgICB1c2VySGFuZGxlLnByb3BzW3RoaXMucHJvcHMudmFsdWVQcm9wTmFtZV0gPSB0aGlzLnByb3BzLnZhbHVlO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5ET00uZGl2KHsgcmVmOiAnc2xpZGVyJywgY2xhc3NOYW1lOiB0aGlzLnByb3BzLmNsYXNzTmFtZSwgb25DbGljazogdGhpcy5fb25DbGljayB9LFxuICAgICAgICAgIFJlYWN0LkRPTS5kaXYoeyByZWY6ICdoYW5kbGUnLCBzdHlsZTogaGFuZGxlU3R5bGUsIG9uTW91c2VEb3duOiB0aGlzLl9kcmFnU3RhcnQsIG9uVG91Y2hNb3ZlOiB0aGlzLl90b3VjaE1vdmUgfSxcbiAgICAgICAgICAgIHVzZXJIYW5kbGVcbiAgICAgICAgICApKSk7XG4gICAgfSxcblxuICAgIF9vbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSBlWydwYWdlJyArIHRoaXMuX2F4aXMoKV07XG4gICAgICB0aGlzLl9tb3ZlSGFuZGxlKHBvc2l0aW9uKTtcbiAgICB9LFxuXG4gICAgX2RyYWdTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9kcmFnTW92ZSwgZmFsc2UpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX2RyYWdFbmQsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgX2RyYWdNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSBlWydwYWdlJyArIHRoaXMuX2F4aXMoKV07XG4gICAgICB0aGlzLl9tb3ZlSGFuZGxlKHBvc2l0aW9uKTtcbiAgICB9LFxuXG4gICAgX2RyYWdFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fZHJhZ01vdmUsIGZhbHNlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9kcmFnRW5kLCBmYWxzZSk7XG4gICAgICB0aGlzLnByb3BzLm9uUmVsZWFzZSgpO1xuICAgIH0sXG5cbiAgICBfdG91Y2hNb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgbGFzdCA9IGUuY2hhbmdlZFRvdWNoZXNbZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggLSAxXTtcbiAgICAgIHZhciBwb3NpdGlvbiA9IGxhc3RbJ3BhZ2UnICsgdGhpcy5fYXhpcygpXTtcbiAgICAgIHRoaXMuX21vdmVIYW5kbGUocG9zaXRpb24pO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0sXG5cbiAgICBfbW92ZUhhbmRsZTogZnVuY3Rpb24ocG9zaXRpb24pIHtcblxuICAgICAgLy8gbWFrZSBjZW50ZXIgb2YgaGFuZGxlIGFwcGVhciB1bmRlciB0aGUgY3Vyc29yIHBvc2l0aW9uXG4gICAgICB2YXIgcG9zaXRpb25zID0gdGhpcy5nZXRQb3NpdGlvbnMoKTtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gLSAocG9zaXRpb25zLmhhbmRsZVdpZHRoIC8gMik7XG5cbiAgICAgIHZhciBsYXN0VmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlO1xuXG4gICAgICB2YXIgcmF0aW8gPSAocG9zaXRpb24gLSBwb3NpdGlvbnMuc2xpZGVyTWluKSAvIChwb3NpdGlvbnMuc2xpZGVyTWF4IC0gcG9zaXRpb25zLnNsaWRlck1pbik7XG4gICAgICB2YXIgdmFsdWUgPSByYXRpbyAqICh0aGlzLnByb3BzLm1heFZhbHVlIC0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgKyB0aGlzLnByb3BzLm1pblZhbHVlO1xuXG4gICAgICB2YXIgbmV4dFZhbHVlID0gdGhpcy5fdHJpbUFsaWduVmFsdWUodmFsdWUpO1xuXG4gICAgICB2YXIgY2hhbmdlZCA9IG5leHRWYWx1ZSAhPT0gbGFzdFZhbHVlO1xuXG4gICAgICBpZiAoY2hhbmdlZCAmJiB0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV4dFZhbHVlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2F4aXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ2hvcml6b250YWwnOiAnWCcsXG4gICAgICAgICd2ZXJ0aWNhbCc6ICdZJ1xuICAgICAgfVt0aGlzLnByb3BzLm9yaWVudGF0aW9uXTtcbiAgICB9LFxuXG4gICAgX3RyaW1BbGlnblZhbHVlOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIGlmICh2YWwgPD0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgdmFsID0gdGhpcy5wcm9wcy5taW5WYWx1ZTtcbiAgICAgIGlmICh2YWwgPj0gdGhpcy5wcm9wcy5tYXhWYWx1ZSkgdmFsID0gdGhpcy5wcm9wcy5tYXhWYWx1ZTtcblxuICAgICAgdmFyIHZhbE1vZFN0ZXAgPSAodmFsIC0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgJSB0aGlzLnByb3BzLnN0ZXA7XG4gICAgICB2YXIgYWxpZ25WYWx1ZSA9IHZhbCAtIHZhbE1vZFN0ZXA7XG5cbiAgICAgIGlmIChNYXRoLmFicyh2YWxNb2RTdGVwKSAqIDIgPj0gdGhpcy5wcm9wcy5zdGVwKSB7XG4gICAgICAgIGFsaWduVmFsdWUgKz0gKHZhbE1vZFN0ZXAgPiAwKSA/IHRoaXMucHJvcHMuc3RlcCA6ICgtIHRoaXMucHJvcHMuc3RlcCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KGFsaWduVmFsdWUudG9GaXhlZCg1KSk7XG4gICAgfVxuXG4gIH0pO1xuXG4gIHJldHVybiBSZWFjdFNsaWRlcjtcblxufSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICBUb29scyBmb3IgbWFuaXB1bGF0aW5nIHdpdGggZGF0ZXNcbiAgc29tZSBvZiB0aGVtIGFyZSBkdXBsaWNpdGllcyB0byBtb21lbnQncyBmdW5jdGlvbnMsIGJ1dCB0aGV5IGNhbiBiZSB1c2VkIGFzIGZhc3RlciBhbHRlcm5hdGl2ZXNcbiAqL1xuXG5cbnZhciBwYWQgPSBmdW5jdGlvbihudW0sIHNpemUpIHtcbiAgdmFyIHMgPSBudW0gKyBcIlwiO1xuICB3aGlsZSAocy5sZW5ndGggPCBzaXplKSB7XG4gICAgcyA9IFwiMFwiICsgcztcbiAgfVxuICByZXR1cm4gcztcbn07XG5cbnZhciBEYXRlVG9vbHMgPSB7XG4gIHRvZGF5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbiAgfSxcbiAgaW5IYWxmQW5ZZWFyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLnNldE1vbnRoKG5ldyBEYXRlKCkuZ2V0TW9udGgoKSArIDYpKTtcbiAgfSxcbiAgZmlyc3REYXk6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICB9LFxuICBsYXN0RGF5OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCk7XG4gIH0sXG4gIGZvcm1hdFNQQXBpRGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBwYWQoZGF0ZS5nZXREYXRlKCksIDIpICsgXCIvXCIgKyBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSwgMikgKyBcIi9cIiArIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgfSxcbiAgZm9ybWF0V0FEYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIFwiLVwiICsgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEsIDIpICsgXCItXCIgKyBwYWQoZGF0ZS5nZXREYXRlKCksIDIpO1xuICB9XG59O1xuXG5cbkRhdGVUb29scy5maXJzdERheU9mV2VlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbW9tZW50LmxvY2FsZURhdGEoKS5fd2Vlay5kb3c7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVUb29scztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIExhdExvbiA9IHJlcXVpcmUoJy4vdG9vbHMvbGF0bG9uLmpzJyk7XG52YXIgT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xuXG5cbnZhciBvcHRpb25zID0ge1xuICBlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlLFxuICB0aW1lb3V0OiA1MDAwLFxuICBtYXhpbXVtQWdlOiAwXG59O1xuXG5mdW5jdGlvbiBHZW9sb2NhdGlvbigpe1widXNlIHN0cmljdFwiO31cblxuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUuaW5pdEJyb3dzZXI9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9UT0RPIGZpbmlzaFxuICAgIC8vbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zKSB7XG4gICAgLy8gIHZhciBjcmQgPSBwb3MuY29vcmRzO1xuICAgIC8vICBjb25zb2xlLmxvZygnWW91ciBjdXJyZW50IHBvc2l0aW9uIGlzOicpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTGF0aXR1ZGUgOiAnICsgY3JkLmxhdGl0dWRlKTtcbiAgICAvLyAgY29uc29sZS5sb2coJ0xvbmdpdHVkZTogJyArIGNyZC5sb25naXR1ZGUpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTW9yZSBvciBsZXNzICcgKyBjcmQuYWNjdXJhY3kgKyAnIG1ldGVycy4nKTtcbiAgICAvL1xuICAgIC8vfSwgZnVuY3Rpb24gKCkge1xuICAgIC8vICBjb25zb2xlLndhcm4oJ0VSUk9SKCcgKyBlcnIuY29kZSArICcpOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgIC8vfSwgb3B0aW9ucylcbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21NYXA9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21Ccm93c2VyPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuXG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRGcm9tQ29kZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcblxuICB9O1xuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUucG9pbnRUb0JvdW5kcz1mdW5jdGlvbihsYXQsIGxvbikge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBkaXN0YW5jZSA9IDMwMDtcbiAgICB2YXIgbGwgPSBMYXRMb24obGF0LGxvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhdF9sbzogbGwuZGVzdGluYXRpb25Qb2ludCgxODAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfbG86IGxsLmRlc3RpbmF0aW9uUG9pbnQoLTkwLCBkaXN0YW5jZSkubG9uLFxuICAgICAgbGF0X2hpOiBsbC5kZXN0aW5hdGlvblBvaW50KDAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfaGk6IGxsLmRlc3RpbmF0aW9uUG9pbnQoOTAsIGRpc3RhbmNlKS5sb25cbiAgICB9XG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRDdXJyZW50Qm91bmRzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBjZW50ZXIgPSBPcHRpb25zU3RvcmUuZGF0YS5kZWZhdWx0TWFwQ2VudGVyO1xuICAgIGlmIChjZW50ZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50VG9Cb3VuZHMoY2VudGVyLmxhdCgpLGNlbnRlci5sbmcoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50VG9Cb3VuZHMoNTAsMTUpO1xuICAgIH1cbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHZW9sb2NhdGlvbigpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBQbGFjZUxhYmVsID0gcmVxdWlyZSgnLi9QbGFjZUxhYmVsLmpzeCcpO1xudmFyIE1hcExhYmVsc1N0b3JlID0gcmVxdWlyZSgnLi4vc3RvcmVzL01hcExhYmVsc1N0b3JlLmpzeCcpO1xudmFyIExhYmVsc0xheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkxhYmVsc0xheWVyXCIsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsczogW11cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBNYXBMYWJlbHNTdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSAge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxhYmVsczogTWFwTGFiZWxzU3RvcmUubGFiZWxzXG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHJlbmRlclBsYWNlczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBsYWJlbHMgPSB0aGlzLnN0YXRlLmxhYmVscztcbiAgICByZXR1cm4gbGFiZWxzLm1hcChmdW5jdGlvbihsYWJlbCkgIHtcbiAgICAgIHZhciBsYWJlbFN0eWxlID0ge1xuICAgICAgICB0b3A6IGxhYmVsLnBvc2l0aW9uLnksXG4gICAgICAgIGxlZnQ6IGxhYmVsLnBvc2l0aW9uLnhcbiAgICAgIH07XG4gICAgICAvL1RPRE8gbW92ZSBhbGwgdGhlIHNoaXQgaW5zaWRlLCBwYXNzIG9ubHkgbGFiZWxcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZUxhYmVsLCB7a2V5OiBsYWJlbC5tYXBQbGFjZS5wbGFjZS5pZCwgc3R5bGU6IGxhYmVsU3R5bGUsIGxhYmVsOiBsYWJlbH0pKVxuICAgIH0pXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKFwibGFiZWxzIHJlbmRlclwiKTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImxhYmVscy1vdmVybGF5XCJ9LCBcbiAgICAgICAgdGhpcy5yZW5kZXJQbGFjZXMoKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhYmVsc0xheWVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgTGFiZWxzTGF5ZXIgPSByZXF1aXJlKCcuL0xhYmVsc0xheWVyLmpzeCcpO1xudmFyIFBvaW50c0xheWVyID0gcmVxdWlyZSgnLi9Qb2ludHNMYXllci5qc3gnKTtcbnZhciBNb3VzZUNsaWNrTGF5ZXIgPSByZXF1aXJlKCcuL01vdXNlQ2xpY2tMYXllci5qc3gnKTtcbnZhciBNYXBMYWJlbHNTdG9yZSA9IHJlcXVpcmUoJy4vLi4vc3RvcmVzL01hcExhYmVsc1N0b3JlLmpzeCcpO1xuXG52YXIgTWFwT3ZlcmxheSA9IGZ1bmN0aW9uIChtYXApIHtcbiAgdGhpcy5tYXAgPSBtYXA7XG4gIHRoaXMuc2V0TWFwKG1hcCk7XG59O1xuXG5mdW5jdGlvbiBmbGF0Qm91bmRzKGJvdW5kcykge1xuICB2YXIgbmUgPSBib3VuZHMuZ2V0Tm9ydGhFYXN0KCk7XG4gIHZhciBzdyA9IGJvdW5kcy5nZXRTb3V0aFdlc3QoKTtcbiAgcmV0dXJuIHtcbiAgICB3TG5nOiBzdy5sbmcoKSxcbiAgICBlTG5nOiBuZS5sbmcoKSxcbiAgICBzTGF0OiBzdy5sYXQoKSxcbiAgICBuTGF0OiBuZS5sYXQoKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFBvaW50c0xheWVyKHBhbmVzLCBtYXApIHtcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAvLyBvdmVybGF5TGF5ZXIsIG92ZXJsYXlNb3VzZVRhcmdldCAvL2h0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2N1c3RvbW92ZXJsYXlzXG4gIHBhbmVzLm92ZXJsYXlMYXllci5hcHBlbmRDaGlsZChkaXYpO1xuICByZXR1cm4gUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUZhY3RvcnkoUG9pbnRzTGF5ZXIpKCksIGRpdik7XG59XG5cbmZ1bmN0aW9uIGFkZExhYmVsc0xheWVyKHBhbmVzLCBtYXApIHtcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAvLyBvdmVybGF5TGF5ZXIsIG92ZXJsYXlNb3VzZVRhcmdldCAvL2h0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL21hcHMvZG9jdW1lbnRhdGlvbi9qYXZhc2NyaXB0L2N1c3RvbW92ZXJsYXlzXG4gIHBhbmVzLm92ZXJsYXlMYXllci5hcHBlbmRDaGlsZChkaXYpO1xuICByZXR1cm4gUmVhY3QucmVuZGVyKFJlYWN0LmNyZWF0ZUZhY3RvcnkoTGFiZWxzTGF5ZXIpKCksIGRpdik7XG59XG5cbmZ1bmN0aW9uIGFkZE1vdXNlQ2xpY2tMYXllcihwYW5lcywgbWFwKSB7XG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgLy8gb3ZlcmxheUxheWVyLCBvdmVybGF5TW91c2VUYXJnZXQgLy9odHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9jdXN0b21vdmVybGF5c1xuICBwYW5lcy5vdmVybGF5TW91c2VUYXJnZXQuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgcmV0dXJuIFJlYWN0LnJlbmRlcihSZWFjdC5jcmVhdGVGYWN0b3J5KE1vdXNlQ2xpY2tMYXllcikoKSwgZGl2KTtcbn1cblxuXG5cbk1hcE92ZXJsYXkucHJvdG90eXBlID0gbmV3IGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3KCk7XG5cbk1hcE92ZXJsYXkucHJvdG90eXBlLm9uQWRkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGFuZXMgPSB0aGlzLmdldFBhbmVzKCk7XG4gIGFkZFBvaW50c0xheWVyKHBhbmVzLCB0aGlzLm1hcCk7XG4gIGFkZExhYmVsc0xheWVyKHBhbmVzLCB0aGlzLm1hcCk7XG4gIGFkZE1vdXNlQ2xpY2tMYXllcihwYW5lcywgdGhpcy5tYXApO1xuXG5cbiAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5tYXAsICdpZGxlJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJpZGxlXCIpO1xuICAgIHZhciBvdmVybGF5UHJvamVjdGlvbiA9IHRoaXMuZ2V0UHJvamVjdGlvbigpO1xuICAgIHZhciBib3VuZHMgPSBmbGF0Qm91bmRzKHRoaXMubWFwLmdldEJvdW5kcygpKTtcbiAgICBNYXBMYWJlbHNTdG9yZS5zZXRNYXBEYXRhKGJvdW5kcywgb3ZlcmxheVByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwuYmluZChvdmVybGF5UHJvamVjdGlvbikpO1xuICB9LmJpbmQodGhpcykpO1xufTtcblxuTWFwT3ZlcmxheS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJkcmF3XCIpO1xuXG5cbn07XG5cbk1hcE92ZXJsYXkucHJvdG90eXBlLm9uUmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcInJlbW92ZVwiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwT3ZlcmxheTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG5cbnZhciBNb3VzZUNsaWNrVGlsZSA9IHJlcXVpcmUoJy4vTW91c2VDbGlja1RpbGUuanN4Jyk7XG52YXIgTWFwTGFiZWxzU3RvcmUgPSByZXF1aXJlKCcuLi9zdG9yZXMvTWFwTGFiZWxzU3RvcmUuanN4Jyk7XG52YXIgTW91c2VDbGlja0xheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIk1vdXNlQ2xpY2tMYXllclwiLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbHM6IFtdXG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgTWFwTGFiZWxzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsYWJlbHM6IE1hcExhYmVsc1N0b3JlLmxhYmVsc1xuICAgICAgfSlcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHJlbmRlclBvaW50czogZnVuY3Rpb24gKCkge1xuICAgIHZhciBsYWJlbHMgPSB0aGlzLnN0YXRlLmxhYmVscztcbiAgICByZXR1cm4gbGFiZWxzLm1hcChmdW5jdGlvbihsYWJlbCkgIHtcblxuICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW91c2VDbGlja1RpbGUsIHtsYWJlbDogbGFiZWwsIGtleTogbGFiZWwubWFwUGxhY2UucGxhY2UuaWQgKyBcImxhYmVsXCJ9KVxuICAgIH0pXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW91c2UtY2xpY2tzLW92ZXJsYXlcIn0sIFxuICAgICAgICB0aGlzLnJlbmRlclBvaW50cygpXG4gICAgICApXG4gICAgKVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZUNsaWNrTGF5ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBTZWFyY2hGb3JtU3RvcmUgPSByZXF1aXJlKCcuLy4uLy4uL21vZHVsZXMvc3RvcmVzL1NlYXJjaEZvcm1TdG9yZS5qc3gnKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vbW9kdWxlcy9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9ICh3aW5kb3cuUmVhY3QpLmFkZG9ucy5QdXJlUmVuZGVyTWl4aW47XG5cbnZhciBNb3VzZUNsaWNrVGlsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJNb3VzZUNsaWNrVGlsZVwiLFxuXG4gIC8vbWl4aW5zOiBbUHVyZVJlbmRlck1peGluXSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ21vdXNlb3ZlcicsIHRoaXMub25Nb3VzZU92ZXIpO1xuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ21vdXNlb3V0JywgdGhpcy5vbk1vdXNlT3V0KTtcbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdjb250ZXh0bWVudScsIHRoaXMub25SaWdodENsaWNrKTtcbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdjbGljaycsIHRoaXMub25DbGljayk7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBnb29nbGUubWFwcy5ldmVudC5jbGVhckxpc3RlbmVycyh0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdtb3VzZW92ZXInKTtcbiAgICBnb29nbGUubWFwcy5ldmVudC5jbGVhckxpc3RlbmVycyh0aGlzLnJlZnMudGlsZS5nZXRET01Ob2RlKCksICdtb3VzZW91dCcpO1xuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmNsZWFyTGlzdGVuZXJzKHRoaXMucmVmcy50aWxlLmdldERPTU5vZGUoKSwgJ2NvbnRleHRtZW51Jyk7XG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuY2xlYXJMaXN0ZW5lcnModGhpcy5yZWZzLnRpbGUuZ2V0RE9NTm9kZSgpLCAnY2xpY2snKTtcbiAgICAvL2dvb2dsZS5tYXBzLmV2ZW50LnJlbW92ZURvbUxpc3RlbmVyKHRoaXMucmVmcy5sYWJlbC5nZXRET01Ob2RlKCksICdjb250ZXh0bWVudScsIHRoaXMub25SaWdodENsaWNrKTtcbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24gKCkge1xuXG4gIH0sXG4gIG9uTW91c2VPdXQ6IGZ1bmN0aW9uICgpIHtcblxuICB9LFxuICBvblJpZ2h0Q2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgY29uc29sZS5sb2coXCJyaWdodCBjbGljayBvbiBsYWJlbFwiKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2V0RmllbGQoXCJvcmlnaW5cIiwgbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiB0aGlzLnByb3BzLmxhYmVsLm1hcFBsYWNlLnBsYWNlfSkpO1xuICB9LFxuICBvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgU2VhcmNoRm9ybVN0b3JlLnNldEZpZWxkKFwiZGVzdGluYXRpb25cIiwgbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiB0aGlzLnByb3BzLmxhYmVsLm1hcFBsYWNlLnBsYWNlfSkpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIHRvcDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi55LFxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi54XG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7cmVmOiBcInRpbGVcIiwgY2xhc3NOYW1lOiBcIm1vdXNlLWNsaWNrLWZpZWxkXCIsIHN0eWxlOiBzdHlsZX0pXG4gICAgKVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZUNsaWNrVGlsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFB1cmVSZW5kZXJNaXhpbiA9ICh3aW5kb3cuUmVhY3QpLmFkZG9ucy5QdXJlUmVuZGVyTWl4aW47XG5cbnZhciBQbGFjZUxhYmVsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlTGFiZWxcIixcblxuICBtaXhpbnM6IFtQdXJlUmVuZGVyTWl4aW5dLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBtYXBQbGFjZSA9IHRoaXMucHJvcHMubGFiZWwubWFwUGxhY2U7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5wcm9wcy5zdHlsZTtcbiAgICB2YXIgZnVsbExhYmVsLCBpbWFnZSwgcHJpY2U7XG4gICAgdmFyIGxhYmVsVGV4dCA9IG1hcFBsYWNlLnBsYWNlLnNob3J0TmFtZTtcbiAgICB2YXIgY2xhc3NOYW1lID0gXCJjaXR5LWxhYmVsXCI7XG4gICAgdmFyIGZsYWdUZXh0ID0gXCJcIjtcbiAgICBpZiAobWFwUGxhY2UucHJpY2UpIHtcbiAgICAgIHZhciBwcmljZVN0eWxlID0ge307XG4gICAgICBpZiAoIXdpbmRvdy5DT0xPUlNfTElHSFRORVNTKSB7XG4gICAgICAgIHdpbmRvdy5DT0xPUlNfTElHSFRORVNTID0gMzU7XG4gICAgICB9XG4gICAgICAgIHByaWNlU3R5bGUuY29sb3IgPSBcImhzbGEoXCIrcGFyc2VJbnQoICgxLXRoaXMucHJvcHMubGFiZWwucmVsYXRpdmVQcmljZSkgKjExNSkrXCIsIDEwMCUsIFwiK3dpbmRvdy5DT0xPUlNfU0FUVVJBVElPTitcIiUsIDEpXCJcbiAgICAgIHByaWNlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJjaXR5LWxhYmVsLXByaWNlXCIsIHN0eWxlOiBwcmljZVN0eWxlfSwgbWFwUGxhY2UucHJpY2UsIFwiRVVSXCIpXG4gICAgfVxuXG4gICAgaWYgKG1hcFBsYWNlLmZsYWcgPT0gXCJvcmlnaW5cIikge1xuICAgICAgZmxhZ1RleHQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImZsYWctdGV4dFwifSwgXCJGcm9tOiBcIik7XG4gICAgICBjbGFzc05hbWUgKz0gXCIgZmxhZy1cIittYXBQbGFjZS5mbGFnO1xuICAgIH1cbiAgICBpZiAobWFwUGxhY2UuZmxhZyA9PSBcImRlc3RpbmF0aW9uXCIpIHtcbiAgICAgIGZsYWdUZXh0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJmbGFnLXRleHRcIn0sIFwiVG86IFwiKTtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBmbGFnLVwiK21hcFBsYWNlLmZsYWc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMubGFiZWwuc2hvd0Z1bGxMYWJlbCkge1xuICAgICAgZnVsbExhYmVsID0gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwiY2l0eS1sYWJlbC10aXRsZVwifSwgZmxhZ1RleHQsIFwiIFwiLCBsYWJlbFRleHQpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnJcIiwgbnVsbCksIFxuICAgICAgICAgIHByaWNlXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge3JlZjogXCJsYWJlbFwiLCBzdHlsZTogc3R5bGUsIGNsYXNzTmFtZTogY2xhc3NOYW1lfSwgXG4gICAgICAgIGltYWdlLCBcbiAgICAgICAgZnVsbExhYmVsXG4gICAgICApXG4gICAgKVxuICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlTGFiZWw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBQb2ludCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQb2ludFwiLFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW1hZ2UgPSBcInhcIjtcbiAgICB2YXIgbWFwUGxhY2UgPSB0aGlzLnByb3BzLmxhYmVsLm1hcFBsYWNlO1xuICAgIHZhciBzdHlsZSA9IHtcbiAgICAgIHRvcDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi55LFxuICAgICAgbGVmdDogdGhpcy5wcm9wcy5sYWJlbC5wb3NpdGlvbi54XG4gICAgfTtcblxuICAgIGlmICh0aGlzLnByb3BzLmxhYmVsLnNob3dGdWxsTGFiZWwpIHtcbiAgICAgIGltYWdlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7c3R5bGU6IHN0eWxlLCBzcmM6IFwiL2ltYWdlcy9tYXJrZXJzL2NpdHkucG5nXCJ9KVxuICAgIH0gZWxzZSB7XG4gICAgICBpbWFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiwge3N0eWxlOiBzdHlsZSwgc3JjOiBcIi9pbWFnZXMvbWFya2Vycy9jaXR5U21hbGwucG5nXCJ9KVxuICAgIH1cblxuICAgIGlmIChtYXBQbGFjZS5mbGFnID09IFwib3JpZ2luXCIpIHtcbiAgICAgIGltYWdlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7c3R5bGU6IHN0eWxlLCBzcmM6IFwiL2ltYWdlcy9tYXJrZXJzL2NpdHlXaXRoUHJpY2UucG5nXCJ9KVxuICAgIH1cbiAgICBpZiAobWFwUGxhY2UuZmxhZyA9PSBcImRlc3RpbmF0aW9uXCIpIHtcbiAgICAgIGltYWdlID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImltZ1wiLCB7c3R5bGU6IHN0eWxlLCBzcmM6IFwiL2ltYWdlcy9tYXJrZXJzL2NpdHlXaXRoUHJpY2UucG5nXCJ9KVxuICAgIH1cblxuICAgIHJldHVybiBpbWFnZVxuICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBNYXBMYWJlbHNTdG9yZSA9IHJlcXVpcmUoJy4uL3N0b3Jlcy9NYXBMYWJlbHNTdG9yZS5qc3gnKTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQuanN4Jyk7XG5cblxudmFyIFBvaW50c0xheWVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBvaW50c0xheWVyXCIsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhYmVsczogW11cbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBNYXBMYWJlbHNTdG9yZS5ldmVudHMub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSAge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxhYmVsczogTWFwTGFiZWxzU3RvcmUubGFiZWxzXG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHJlbmRlclBvaW50czogZnVuY3Rpb24gKCkge1xuICAgIHZhciBsYWJlbHMgPSB0aGlzLnN0YXRlLmxhYmVscztcbiAgICByZXR1cm4gbGFiZWxzLm1hcChmdW5jdGlvbihsYWJlbCkgIHtcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChQb2ludCwge2tleTogbGFiZWwubWFwUGxhY2UucGxhY2UuaWQsIGxhYmVsOiBsYWJlbH0pKVxuICAgIH0pXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicG9pbnRzLW92ZXJsYXlcIn0sIFxuICAgICAgICB0aGlzLnJlbmRlclBvaW50cygpXG4gICAgICApXG4gICAgKVxuICB9XG5cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9pbnRzTGF5ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBNb2RhbE1lbnVNaXhpbiA9IHtcblxuICByZW5kZXJCb2R5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgaWYgKCFtb2RlICkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHZhciBtZXRob2ROYW1lID0gXCJyZW5kZXJcIittb2RlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbW9kZS5zbGljZSgxKTtcbiAgICBpZiAodGhpc1ttZXRob2ROYW1lXSkge1xuICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kTmFtZV0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gc3VjaCBtZXRob2Q6IFwiICsgbWV0aG9kTmFtZSlcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyTWVudTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcbiAgICB2YXIgbW9kZU9wdGlvbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpbW9kZSBpbiB0aGlzLnByb3BzLm1vZGVzKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5tb2Rlc1tpbW9kZV0pIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IFwibW9kZS1cIitpbW9kZTtcbiAgICAgICAgaWYgKG1vZGUgPT0gaW1vZGUpIHtcbiAgICAgICAgICBjbGFzc05hbWUgKz0gXCIgYWN0aXZlXCI7XG4gICAgICAgIH1cbiAgICAgICAgbW9kZU9wdGlvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IGltb2RlLCBjbGFzc05hbWU6IGNsYXNzTmFtZSwgb25DbGljazogIHRoaXMuc3dpdGNoTW9kZVRvRnVuYyhpbW9kZSkgfSwgIHRoaXMuZ2V0TW9kZUxhYmVsKGltb2RlKSApKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm1vZGUtc2VsZWN0b3JcIn0sIFxuICAgICAgICAgIG1vZGVPcHRpb25zXG4gICAgICApXG4gICAgKVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGFsTWVudU1peGluO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIGlzSUUgPSByZXF1aXJlKCcuL3Rvb2xzL2lzSUUuanMnKTtcbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG52YXIgVHJhbiA9IHJlcXVpcmUoJy4vVHJhbi5qc3gnKTtcbnZhciAkID0gKHdpbmRvdy4kKTtcblxuXG52YXIgTW9kYWxQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiTW9kYWxQaWNrZXJcIixcblxuICAvL2dldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gIC8vICByZXR1cm4ge1xuICAvLyAgICBzaG93bjogZmFsc2VcbiAgLy8gIH07XG4gIC8vfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3aW5kb3dXaWR0aDogJCh3aW5kb3cpLndpZHRoKCksXG4gICAgICB3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKVxuICAgIH07XG4gIH0sXG5cbiAgY2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0aGlzLnJlZnMuaW5uZXIpIHtcbiAgICAgIGlmICgkKHRoaXMucmVmcy5pbm5lci5nZXRET01Ob2RlKCkpLmhhcyhlLnRhcmdldCkubGVuZ3RoKSByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLmlucHV0RWxlbWVudCkge1xuICAgICAgaWYgKCQodGhpcy5wcm9wcy5pbnB1dEVsZW1lbnQpLmlzKGUudGFyZ2V0KSkgcmV0dXJuO1xuICAgICAgaWYgKCQodGhpcy5wcm9wcy5pbnB1dEVsZW1lbnQpLmhhcyhlLnRhcmdldCkubGVuZ3RoKSByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGlkZSgpO1xuICB9LFxuXG4gIHdpbmRvd1Jlc2l6ZWQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgLy9UT0RPIGNoZWNrIHBlcmZvcm1hbmNlIGFuZCBldmVudHVhbGx5IG1ha2Ugc29tZSBkZWxheWVkIHJlc2l6ZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgd2luZG93V2lkdGg6ICQod2luZG93KS53aWR0aCgpLFxuICAgICAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICB9KTtcbiAgfSxcblxuICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkhpZGUoKTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrT3V0c2lkZSwgZmFsc2UpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLndpbmRvd1Jlc2l6ZWQpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja091dHNpZGUsIGZhbHNlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy53aW5kb3dSZXNpemVkKTtcbiAgfSxcblxuICBjYWxjdWxhdGVTdHlsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoaXNJRSg4LCdsdGUnKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIHZhciByZWN0O1xuICAgIHZhciBtYXJnaW5MZWZ0ID0gMDtcbiAgICBpZiAodGhpcy5yZWZzLm91dGVyKSB7XG4gICAgICByZWN0ID0gdGhpcy5yZWZzLm91dGVyLmdldERPTU5vZGUoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHZhciBzdHlsZSA9IHRoaXMucmVmcy5vdXRlci5nZXRET01Ob2RlKCkuc3R5bGU7XG4gICAgICBpZiAoc3R5bGUubWFyZ2luTGVmdCkge1xuICAgICAgICBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoc3R5bGUubWFyZ2luTGVmdC5zdWJzdHJpbmcoMCxzdHlsZS5tYXJnaW5MZWZ0Lmxlbmd0aC0yKSwxMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHBhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgIHZhciB3aWR0aCA9IHRoaXMucHJvcHMuY29udGVudFNpemUud2lkdGg7XG4gICAgdmFyIG9mZnNldCA9ICghcmVjdCk/MDoocmVjdC5sZWZ0IC0gbWFyZ2luTGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCk7XG4gICAgdmFyIG1heFdpZHRoID0gcGFnZVdpZHRoO1xuICAgIHZhciBvdXRlclN0eWxlcztcbiAgICB2YXIgYWRkQ2xhc3MgPSBcIlwiO1xuXG4gICAgaWYgKHdpZHRoID4gbWF4V2lkdGgpIHtcbiAgICAgIC8vbWFrZSBzbWFsbGVyIHZlcnNpb25cbiAgICAgIGFkZENsYXNzID0gXCJjb21wYWN0LXNpemVcIjtcbiAgICAgIGlmICh0aGlzLnByb3BzLmNvbnRlbnRTaXplLndpZHRoQ29tcGFjdCkge1xuICAgICAgICB3aWR0aCA9IHRoaXMucHJvcHMuY29udGVudFNpemUud2lkdGhDb21wYWN0O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob2Zmc2V0ICsgd2lkdGggPD0gbWF4V2lkdGgpIHtcbiAgICAgIC8vS0VFUCBJVFxuICAgICAgb3V0ZXJTdHlsZXMgPSB7XG4gICAgICAgIG1hcmdpbkxlZnQ6IDAsXG4gICAgICAgIHdpZHRoOiB3aWR0aFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKG9mZnNldCArIHdpZHRoID4gbWF4V2lkdGggJiYgd2lkdGggPCBtYXhXaWR0aCkge1xuICAgICAgLy9NT1ZFIElUXG4gICAgICB2YXIgbWlzc2luZ1NwYWNlID0gb2Zmc2V0ICsgd2lkdGggLSBtYXhXaWR0aDtcbiAgICAgIG91dGVyU3R5bGVzID0ge1xuICAgICAgICBtYXJnaW5MZWZ0OiAwIC0gbWlzc2luZ1NwYWNlLFxuICAgICAgICB3aWR0aDogd2lkdGhcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dGVyU3R5bGVzID0ge1xuICAgICAgICBtYXJnaW5MZWZ0OiAwLFxuICAgICAgICB3aWR0aDogXCIxMDAlXCJcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBvdXRlcjogb3V0ZXJTdHlsZXMsXG4gICAgICBhZGRDbGFzczogYWRkQ2xhc3NcbiAgICB9O1xuICB9LFxuXG4gIGNhbGN1bGF0ZU91dGVyU3R5bGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGlzSUUoOCwnbHRlJykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0eWxlcyA9IHRoaXMuY2FsY3VsYXRlU3R5bGVzKCk7XG4gICAgdmFyIGNsYXNzTmFtZSA9IFwic2VhcmNoLW1vZGFsIFwiICsgKHN0eWxlcy5hZGRDbGFzcyA/IHN0eWxlcy5hZGRDbGFzcyA6IFwiXCIpO1xuXG4gICAgLy9UT0RPIGRlY2lkZSBpZiBwdXQgdGhlcmUgY2xvc2UgYnV0dG9uIG9yIG5vdFxuICAgIC8vPGRpdiBjbGFzc05hbWU9XCJjbG9zZS1idXR0b25cIiBvbmNsaWNrPXt0aGlzLmhpZGV9PjxUcmFuIHRLZXk9XCJjbG9zZVwiPmNsb3NlPC9UcmFuPjwvZGl2PlxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzTmFtZSwgcmVmOiBcIm91dGVyXCIsIHN0eWxlOiBzdHlsZXMub3V0ZXJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInNlYXJjaC1tb2RhbC1jb250ZW50XCIsIHJlZjogXCJpbm5lclwifSwgdGhpcy5wcm9wcy5jaGlsZHJlbilcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbFBpY2tlcjtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgTW9kYWxQaWNrZXIgPSByZXF1aXJlKFwiLi8uLi9Nb2RhbFBpY2tlci5qc3hcIik7XG52YXIgUGxhY2VQaWNrZXIgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzL1BsYWNlUGlja2VyLmpzeFwiKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoXCIuLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4XCIpO1xudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZScpO1xuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGluaXRpYWxWYWx1ZTogbmV3IFNlYXJjaFBsYWNlKCksXG4gIGxvY2FsZTogXCJlblwiLFxuICBzaXplczoge1xuICAgIGFsbDoge3dpZHRoOiA2MDAsIGhlaWdodDogMjAwfSxcbiAgICBuZWFyYnk6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY2hlYXBlc3Q6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY2l0aWVzQW5kQWlycG9ydHM6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY291bnRyaWVzOiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxuICAgIGFueXdoZXJlOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9LFxuICAgIHJhZGl1czoge3dpZHRoOiAxNjksIGhlaWdodDogMjAwfVxuICB9LFxuICBtb2Rlczoge1xuICAgIFwiYWxsXCI6IHt9LFxuICAgIFwibmVhcmJ5XCI6IHt9LFxuICAgIFwiY2hlYXBlc3RcIjoge30sXG4gICAgXCJjaXRpZXNBbmRBaXJwb3J0c1wiOiB7fSxcbiAgICBcImNvdW50cmllc1wiOiB7fSxcbiAgICBcImFueXdoZXJlXCI6IHt9LFxuICAgIFwicmFkaXVzXCI6IHt9XG4gIH1cbn07XG5cbnZhciBQbGFjZVBpY2tlck1vZGFsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlUGlja2VyTW9kYWxcIixcbiAgZ2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLnByb3BzLm9wdGlvbnMpO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uczoge31cbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnRTaXplOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gICAgfTtcbiAgfSxcbiAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSk7XG4gIH0sXG4gIG9uU2l6ZUNoYW5nZTogZnVuY3Rpb24gKHNpemVzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb250ZW50U2l6ZTogc2l6ZXNcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLmdldE9wdGlvbnMoKSk7XG4gICAgaWYgKCF0aGlzLnByb3BzLnNob3duKSB7cmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKX1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNb2RhbFBpY2tlciwge2NvbnRlbnRTaXplOiB0aGlzLnN0YXRlLmNvbnRlbnRTaXplLCBpbnB1dEVsZW1lbnQ6IHRoaXMucHJvcHMuaW5wdXRFbGVtZW50LCBvbkhpZGU6IHRoaXMucHJvcHMub25IaWRlfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VQaWNrZXIsIHt2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgcmVmOiBcInBsYWNlUGlja2VyXCIsIG9uQ2hhbmdlOiB0aGlzLm9uVmFsdWVDaGFuZ2UsIHNpemVzOiBvcHRpb25zLnNpemVzLCBtb2Rlczogb3B0aW9ucy5tb2Rlcywgb25TaXplQ2hhbmdlOiB0aGlzLm9uU2l6ZUNoYW5nZX1cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlUGlja2VyTW9kYWw7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciB0ZXN0U2hpdCA9IG51bGw7XG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xuUmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi8uLi90ci5qcycpO1xuXG52YXIgUGxhY2VzID0gcmVxdWlyZSgnLi9QbGFjZXMuanN4Jyk7XG52YXIgTW9kYWxNZW51TWl4aW4gPSByZXF1aXJlKCcuLy4uLy4uL01vZGFsTWVudU1peGluLmpzeCcpO1xudmFyIFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIFJhZGl1cyA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9SYWRpdXMuanN4Jyk7XG5cbnZhciBhaXJwb3J0c0FuZENpdGllc1R5cGVzID0gW1BsYWNlLlRZUEVfQ0lUWSwgUGxhY2UuVFlQRV9BSVJQT1JUXTtcbnZhciBjb3VudHJ5VHlwZXMgPSBbUGxhY2UuVFlQRV9DT1VOVFJZXTtcblxudmFyIFBsYWNlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlUGlja2VyXCIsXG4gIG1peGluczogW01vZGFsTWVudU1peGluXSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld01vZGU6IHRoaXMuZ2V0RGVmYXVsdE1vZGUoKVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBsYW5nOiAnZW4nXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0TW9kZTogZnVuY3Rpb24gKCkge1xuICAgIC8vRklSU1QgVkVSU0lPTiAtIEFMTCBBTkQgQ09VTlRSSUVTXG5cbiAgICAvL2lmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgIT0gXCJ0ZXh0XCIgfHwgdGhpcy5wcm9wcy52YWx1ZS5pc0RlZmF1bHQpIHtcbiAgICAvLyAgcmV0dXJuIFwiY291bnRyaWVzXCI7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcbiAgICAvL31cblxuICAgIC8vU0VDT05EIFZFUlNJT05cblxuICAgIC8vaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICAvLyAgcmV0dXJuIFwiYWxsXCI7XG4gICAgLy99IGVsc2UgaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcInRleHRcIikge1xuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcbiAgICAvL30gZWxzZSBpZiAodGhpcy5wcm9wcy52YWx1ZS5tb2RlID09IFwiYW55d2hlcmVcIikge1xuICAgIC8vICByZXR1cm4gXCJhbnl3aGVyZVwiO1xuICAgIC8vfSBlbHNlIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJyYWRpdXNcIikge1xuICAgIC8vICByZXR1cm4gXCJyYWRpdXNcIjtcbiAgICAvL30gZWxzZSB7XG4gICAgLy8gIHJldHVybiBcImFsbFwiO1xuICAgIC8vfVxuXG4gICAgLy9USElSRCBWRVJTSU9OXG4gICAgaWYgKHRoaXMucHJvcHMudmFsdWUuZm9ybU1vZGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnZhbHVlLmZvcm1Nb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJhbGxcIjtcbiAgICB9XG5cbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcbiAgICB0aGlzLnByb3BzLm9uU2l6ZUNoYW5nZSh0aGlzLnByb3BzLnNpemVzW21vZGVdKTtcbiAgfSxcblxuICAvL1RPRE8gbW92ZSBpdCB0byBvcHRpb25zXG4gIGdldE1vZGVMYWJlbDogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgbW9kZUxhYmVscyA9IHtcbiAgICAgIGFsbDogdHIoXCJBbGwgcGxhY2VzXCIsXCJhbGxfcGxhY2VzXCIpLFxuICAgICAgbmVhcmJ5OiB0cihcIk5lYXJieVwiLFwibmVhcmJ5XCIpLFxuICAgICAgY2hlYXBlc3Q6IHRyKFwiQ2hlYXBlc3RcIixcImNoZWFwZXN0XCIpLFxuICAgICAgY2l0aWVzQW5kQWlycG9ydHM6IHRyKFwiQ2l0aWVzIGFuZCBhaXJwb3J0c1wiLFwiY2l0aWVzX2FuZF9haXJwb3J0c1wiKSxcbiAgICAgIGNvdW50cmllczogdHIoXCJDb3VudHJpZXNcIixcImNvdW50cmllc1wiKSxcbiAgICAgIGFueXdoZXJlOiB0cihcIkFueXdoZXJlXCIsXCJhbnl3aGVyZVwiKSxcbiAgICAgIHJhZGl1czogdHIoXCJSYWRpdXMgc2VhcmNoXCIsXCJyYWRpdXNfc2VhcmNoXCIpXG4gICAgfTtcbiAgICByZXR1cm4gbW9kZUxhYmVsc1ttb2RlXTtcbiAgfSxcblxuICBzd2l0Y2hNb2RlVG86IGZ1bmN0aW9uIChtb2RlKSB7XG4gICAgaWYgKG1vZGUgPT0gXCJyYWRpdXNcIikge1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicmFkaXVzXCIsIHZhbHVlOiBuZXcgUmFkaXVzKCl9KSwgXCJzZWxlY3RSYWRpdXNcIik7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiYW55d2hlcmVcIikge1xuICAgICAgdGhpcy5zZWxlY3RWYWx1ZShuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwiYW55d2hlcmVcIn0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLnZhbHVlLCBcImNoYW5nZU1vZGVcIik7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcy5vblNpemVDaGFuZ2UodGhpcy5wcm9wcy5zaXplc1ttb2RlXSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB2aWV3TW9kZTogbW9kZVxuICAgIH0pO1xuICB9LFxuXG4gIHN3aXRjaE1vZGVUb0Z1bmM6IGZ1bmN0aW9uIChtb2RlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMuc3dpdGNoTW9kZVRvKG1vZGUpXG4gICAgfS5iaW5kKHRoaXMpXG4gIH0sXG5cbiAgY2hlY2tNb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcInRleHRcIiAmJiAhdGhpcy5wcm9wcy52YWx1ZS5pc0RlZmF1bHQpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXdNb2RlICE9IFwiYWxsXCIpIHtcbiAgICAgICAgdGhpcy5zd2l0Y2hNb2RlVG8oXCJhbGxcIik7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgaWYgKG5leHRQcm9wcy52YWx1ZSAhPSB0aGlzLnByb3BzLnZhbHVlKSB7XG4gICAgICB0aGlzLmNoZWNrTW9kZSgpO1xuICAgIH1cbiAgfSxcblxuICBzZWxlY3RWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdmFsdWUgPSB0aGlzLnByb3BzLnZhbHVlOyAvL2lmIG5ldyB2YWx1ZSBpcyBudWxsIGl0IG1lYW50IGkgd2FudCB0byBrZWVwIHRoZSBzYW1lLCBpdCBiZWhhdmVzIGFzIGl0IHdhcyBzZWxlY3RlZFxuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLnNldChcImZvcm1Nb2RlXCIsdGhpcy5zdGF0ZS52aWV3TW9kZSksIFwic2VsZWN0XCIpO1xuICB9LFxuXG4gIHJlbmRlckFsbDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlcywge3NlYXJjaDogdGhpcy5wcm9wcy52YWx1ZSwgb25TZWxlY3Q6IHRoaXMuc2VsZWN0VmFsdWV9KTtcbiAgfSxcblxuICByZW5kZXJOZWFyYnk6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlLCBuZWFyYnk6IHRydWV9KTtcbiAgfSxcblxuICByZW5kZXJDaGVhcGVzdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcInNzc1wiKSlcbiAgfSxcblxuICByZW5kZXJDaXRpZXNBbmRBaXJwb3J0czogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlcywge3NlYXJjaDogdGhpcy5wcm9wcy52YWx1ZSwgb25TZWxlY3Q6IHRoaXMuc2VsZWN0VmFsdWUsIHR5cGVzOiBhaXJwb3J0c0FuZENpdGllc1R5cGVzfSk7XG4gIH0sXG5cbiAgcmVuZGVyQ291bnRyaWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VzLCB7c2VhcmNoOiB0aGlzLnByb3BzLnZhbHVlLCBvblNlbGVjdDogdGhpcy5zZWxlY3RWYWx1ZSwgdHlwZXM6IGNvdW50cnlUeXBlc30pO1xuICB9LFxuXG4gIHJlbmRlckFueXdoZXJlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKVxuICB9LFxuXG4gIHJlbmRlclJhZGl1czogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSlcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAnc2VhcmNoLXBsYWNlLXBpY2tlciBzZWFyY2gtcGlja2VyICcrbW9kZX0sIFxuICAgICAgICAgdGhpcy5yZW5kZXJNZW51KCksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY29udGVudFwifSwgXG4gICAgICAgICAgIHRoaXMucmVuZGVyQm9keSgpIFxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsZWFyLWJvdGhcIn0pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZVBpY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUGxhY2VSb3cgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUGxhY2VSb3dcIixcbiAgY2xpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHRoaXMucHJvcHMucGxhY2UpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGxhY2UgPSB0aGlzLnByb3BzLnBsYWNlO1xuICAgIHZhciBjbGFzc05hbWUgPSBcInBsYWNlLXJvd1wiO1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkKSB7XG4gICAgICBjbGFzc05hbWUgKz0gXCIgc2VsZWN0ZWRcIjtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLmNsaWNrfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwibmFtZVwifSwgXG4gICAgICAgICAgcGxhY2UuZ2V0TmFtZSgpXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcInR5cGVcIn0sIFxuICAgICAgICAgIHBsYWNlLmdldFR5cGUoKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuICB9XG59KTtcbiBtb2R1bGUuZXhwb3J0cyA9IFBsYWNlUm93O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUGxhY2VzQVBJID0gcmVxdWlyZSgnLi8uLi8uLi9BUElzL1BsYWNlc0FQSUNhY2hlZC5qc3gnKTtcclxudmFyIFBsYWNlUm93ID0gcmVxdWlyZSgnLi9QbGFjZVJvdy5qc3gnKTtcclxudmFyIEdlb2xvY2F0aW9uID0gcmVxdWlyZSgnLi8uLi8uLi9HZW9sb2NhdGlvbi5qc3gnKTtcclxudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xyXG52YXIgT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi8uLi8uLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xyXG52YXIgUGxhY2UgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvUGxhY2UuanN4Jyk7XHJcbmZ1bmN0aW9uIGZpbmRQb3Mob2JqKSB7XHJcbiAgdmFyIGN1cnRvcCA9IDA7XHJcbiAgaWYgKG9iai5vZmZzZXRQYXJlbnQpIHtcclxuICAgIGRvIHtcclxuICAgICAgY3VydG9wICs9IG9iai5vZmZzZXRUb3A7XHJcbiAgICB9IHdoaWxlIChvYmogPSBvYmoub2Zmc2V0UGFyZW50KTtcclxuICAgIHJldHVybiBbY3VydG9wXTtcclxuICB9XHJcbn1cclxuXHJcbnZhciBQbGFjZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUGxhY2VzXCIsXHJcblxyXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbGFzdFNlYXJjaDogbnVsbCxcclxuICAgICAgbGFzdFR5cGVzOiBudWxsLFxyXG4gICAgICBsYXN0TmVhcmJ5OiBudWxsLFxyXG4gICAgICBwbGFjZXM6IFtdLFxyXG4gICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMSxcclxuICAgICAgYXBpRXJyb3I6IGZhbHNlLFxyXG4gICAgICBsb2FkaW5nOiBmYWxzZVxyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIGtleXByZXNzOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKGUua2V5SWRlbnRpZmllciA9PSBcIlVwXCIpIHtcclxuICAgICAgdGhpcy5tb3ZlVXAoKTtcclxuICAgIH0gZWxzZSBpZiAoZS5rZXlJZGVudGlmaWVyID09IFwiRG93blwiKSB7XHJcbiAgICAgIHRoaXMubW92ZURvd24oKTtcclxuICAgIH0gZWxzZSBpZiAoZS5rZXlJZGVudGlmaWVyID09IFwiRW50ZXJcIikge1xyXG4gICAgICB0aGlzLnNlbGVjdEZyb21JbmRleCgpO1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4ID49IDApIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4IC0gMVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoIC0gMVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4IDwgdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IHRoaXMuc3RhdGUua2V5U2VsZWN0ZWRJbmRleCArIDFcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IDBcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBzZWxlY3RGcm9tSW5kZXg6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggPj0gMCkge1xyXG4gICAgICB0aGlzLnNlbGVjdCh0aGlzLnN0YXRlLnBsYWNlc1t0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXhdKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubW92ZU5leHQoKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnJlZnMucGxhY2VzICYmIHRoaXMucmVmcy5zZWxlY3RlZFBsYWNlKSB7XHJcbiAgICAgIHZhciBwbGFjZXNFbGVtZW50ID0gdGhpcy5yZWZzLnBsYWNlcy5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHZhciBzZWxlY3RlZEVsZW1lbnQgPSB0aGlzLnJlZnMuc2VsZWN0ZWRQbGFjZS5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHBsYWNlc0VsZW1lbnQuc2Nyb2xsVG9wID0gZmluZFBvcyhzZWxlY3RlZEVsZW1lbnQpIC0gMjAwO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuY2hlY2tOZXdQbGFjZXMoKTtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5cHJlc3MpO1xyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcclxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5cHJlc3MpO1xyXG4gIH0sXHJcblxyXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5jaGVja05ld1BsYWNlcygpO1xyXG4gICAgdGhpcy5hZGp1c3RTY3JvbGwoKTtcclxuICB9LFxyXG5cclxuICBmaWx0ZXJQbGFjZXNCeVR5cGU6IGZ1bmN0aW9uIChwbGFjZXMgLCB0eXBlcykge1xyXG4gICAgaWYgKHR5cGVzKSB7XHJcbiAgICAgIHJldHVybiBwbGFjZXMuZmlsdGVyKGZ1bmN0aW9uKHBsYWNlKSAge1xyXG4gICAgICAgIHJldHVybiB0eXBlcy5pbmRleE9mKHBsYWNlLmdldFR5cGVJZCgpKSAhPSAtMTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gcGxhY2VzO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8vVE9ETyByZWZhY3RvcmUgLSBuZWFyYnkgc2hvdWxkIGJlIHNlcGFyYXRlIGZyb20gdGV4dFxyXG4gIHNldFNlYXJjaDogZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHBsYWNlU2VhcmNoID0gdGhpcy5tYWtlU2VhcmNoUGFyYW1zKCk7XHJcbiAgICB2YXIgcGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSSh7bGFuZzogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTtcclxuICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICBzZWFyY2hUZXh0OiBwbGFjZVNlYXJjaFxyXG4gICAgfSk7XHJcbiAgICB2YXIgY2FsbEZ1bmNQYXJhbTtcclxuXHJcbiAgICBjYWxsRnVuY1BhcmFtID0gcGxhY2VzQVBJLmZpbmRQbGFjZXMocGxhY2VTZWFyY2gpO1xyXG5cclxuICAgIGNhbGxGdW5jUGFyYW0udGhlbihmdW5jdGlvbihwbGFjZXMpICB7XHJcbiAgICAgIGlmIChwbGFjZVNlYXJjaCAhPSB0aGlzLnN0YXRlLnNlYXJjaFRleHQgfHwgIXRoaXMuaXNNb3VudGVkKCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgcGxhY2VzID0gdGhpcy5maWx0ZXJQbGFjZXNCeVR5cGUocGxhY2VzLCB0aGlzLnByb3BzLnR5cGVzKTtcclxuXHJcbiAgICAgIGlmIChwbGFjZVNlYXJjaC50eXBlSUQgPT09IFBsYWNlLlRZUEVfQ09VTlRSWSkge1xyXG4gICAgICAgIHBsYWNlcyA9IHBsYWNlcy5jb25jYXQoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpICB7IC8vLmNvbmNhdCgpIGlzIGhlcmUgdG8gbWFrZSBjb3B5IG9mIGFycmF5XHJcbiAgICAgICAgICByZXR1cm4gKGIudmFsdWUgPCBhLnZhbHVlKT8gMSA6IC0xXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcGxhY2VzID0gcGxhY2VzLnNsaWNlKDAsNTApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBwbGFjZXM6IHBsYWNlcyxcclxuICAgICAgICBhcGlFcnJvcjogZmFsc2UsXHJcbiAgICAgICAgbG9hZGluZzogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSAge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgcGxhY2VzOiBbXSxcclxuICAgICAgICBhcGlFcnJvcjogdHJ1ZSxcclxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxyXG4gICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuXHJcbiAgc2VsZWN0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHRoaXMucHJvcHMub25TZWxlY3QoIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogdmFsdWV9KSApO1xyXG4gIH0sXHJcblxyXG4gIG1vdmVOZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHRoaXMucHJvcHMub25TZWxlY3QobnVsbCwgXCJuZXh0XCIpO1xyXG4gIH0sXHJcblxyXG4gIGdldFNlYXJjaFRleHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnByb3BzLnNlYXJjaC5tb2RlID09IFwidGV4dFwiICYmICF0aGlzLnByb3BzLnNlYXJjaC5pc0RlZmF1bHQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuc2VhcmNoLmdldFRleHQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG1ha2VTZWFyY2hQYXJhbXM6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwYXJhbXMgPSB7fTtcclxuICAgIGlmICh0aGlzLnByb3BzLm5lYXJieSkge1xyXG4gICAgICBwYXJhbXMuYm91bmRzID0gR2VvbG9jYXRpb24uZ2V0Q3VycmVudEJvdW5kcygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcGFyYW1zLnRlcm0gPSB0aGlzLmdldFNlYXJjaFRleHQoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnByb3BzLnR5cGVzICYmIHRoaXMucHJvcHMudHlwZXMubGVuZ3RoID09IDEpIHtcclxuICAgICAgcGFyYW1zLnR5cGVJRCA9IHRoaXMucHJvcHMudHlwZXNbMF07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyYW1zO1xyXG4gIH0sXHJcblxyXG4gIGNoZWNrTmV3UGxhY2VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2VhcmNoVGV4dCA9IHRoaXMuZ2V0U2VhcmNoVGV4dCgpO1xyXG4gICAgaWYgKHRoaXMuc3RhdGUubGFzdFNlYXJjaCAhPT0gc2VhcmNoVGV4dCB8fCB0aGlzLnN0YXRlLmxhc3RUeXBlcyAhPSB0aGlzLnByb3BzLnR5cGVzIHx8IHRoaXMuc3RhdGUubGFzdE5lYXJieSAhPSB0aGlzLnByb3BzLm5lYXJieSkge1xyXG4gICAgICB0aGlzLnNldFNlYXJjaCgpO1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBsYXN0U2VhcmNoOiBzZWFyY2hUZXh0LFxyXG4gICAgICAgIGxhc3RUeXBlczogdGhpcy5wcm9wcy50eXBlcyxcclxuICAgICAgICBsYXN0TmVhcmJ5OiB0aGlzLnByb3BzLm5lYXJieSxcclxuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuXHJcbiAgcmVuZGVyUGxhY2VzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcGxhY2VzID0gdGhpcy5zdGF0ZS5wbGFjZXM7XHJcbiAgICB2YXIgc2VsZWN0ZWQgPSBwbGFjZXNbdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4XTtcclxuICAgIHJldHVybiBwbGFjZXMubWFwKGZ1bmN0aW9uKHBsYWNlKSAge1xyXG4gICAgICBpZiAoc2VsZWN0ZWQgPT0gcGxhY2UpIHtcclxuICAgICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VSb3csIHtyZWY6IFwic2VsZWN0ZWRQbGFjZVwiLCBzZWxlY3RlZDogc2VsZWN0ZWQgPT0gcGxhY2UsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdCwgcGxhY2U6IHBsYWNlfSkpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlUm93LCB7b25TZWxlY3Q6IHRoaXMuc2VsZWN0LCBwbGFjZTogcGxhY2V9KSlcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBsb2FkZXJDbGFzcyA9IFwibG9hZGVyIFwiICsgKHRoaXMuc3RhdGUubG9hZGluZyA/IFwibG9hZGluZ1wiIDogXCJub3QtbG9hZGluZ1wiKTtcclxuICAgIHZhciBub1Jlc3VsdHNDbGFzcyA9IFwibm8tcmVzdWx0c1wiO1xyXG4gICAgaWYgKCF0aGlzLnN0YXRlLmxvYWRpbmcgJiYgdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoID09IDApIHtcclxuICAgICAgbm9SZXN1bHRzQ2xhc3MgKz0gXCIgc2hvd25cIlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGxvYWRlckNsYXNzfSwgXCJMb2FkaW5nLi4uXCIpLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IG5vUmVzdWx0c0NsYXNzfSwgXCJObyByZXN1bHRzXCIpLCBcclxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwicGxhY2VzXCIsIGNsYXNzTmFtZTogXCJwbGFjZXNcIn0sIFxyXG4gICAgICAgICAgdGhpcy5yZW5kZXJQbGFjZXMoKVxyXG4gICAgICAgIClcclxuICAgICAgKVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbn0pO1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxhY2VzO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIERhdGVQaWNrZXJNb2RhbCA9IHJlcXVpcmUoJy4vLi4vRGF0ZVBpY2tlci9EYXRlUGlja2VyTW9kYWwuanN4Jyk7XG52YXIgUGxhY2VQaWNrZXJNb2RhbCA9IHJlcXVpcmUoJy4vLi4vUGxhY2VQaWNrZXIvUGxhY2VQaWNrZXJNb2RhbC5qc3gnKTtcblxuXG52YXIgU2VhcmNoRm9ybVN0b3JlID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCcpO1xuXG52YXIgU2VhcmNoRGF0ZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCcpO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi90ci5qcycpO1xudmFyIFRyYW4gPSByZXF1aXJlKCcuLy4uL1RyYW4uanN4Jyk7XG5cbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG5cbnZhciBvcHRpb25zID0ge1xuICBvcmlnaW46IHtcbiAgICBtb2Rlczoge1xuICAgICAgYWxsOiB0cnVlLFxuICAgICAgbmVhcmJ5OiB0cnVlLFxuICAgICAgY2hlYXBlc3Q6IGZhbHNlLFxuICAgICAgY2l0aWVzQW5kQWlycG9ydHM6IGZhbHNlLFxuICAgICAgY291bnRyaWVzOiB0cnVlLFxuICAgICAgYW55d2hlcmU6IGZhbHNlLFxuICAgICAgcmFkaXVzOiB0cnVlXG4gICAgfVxuICB9LFxuICBkZXN0aW5hdGlvbjoge1xuICAgIG1vZGVzOiB7XG4gICAgICBhbGw6IHRydWUsXG4gICAgICBuZWFyYnk6IGZhbHNlLFxuICAgICAgY2hlYXBlc3Q6IGZhbHNlLFxuICAgICAgY2l0aWVzQW5kQWlycG9ydHM6IGZhbHNlLFxuICAgICAgY291bnRyaWVzOiB0cnVlLFxuICAgICAgYW55d2hlcmU6IHRydWUsXG4gICAgICByYWRpdXM6IHRydWVcbiAgICB9XG4gIH0sXG4gIGRhdGVGcm9tOiB7XG4gICAgbW9kZXM6IHtcbiAgICAgIHNpbmdsZTogdHJ1ZSxcbiAgICAgIGludGVydmFsOiB0cnVlLFxuICAgICAgbW9udGg6IHRydWUsXG4gICAgICB0aW1lVG9TdGF5OiBmYWxzZSxcbiAgICAgIGFueXRpbWU6IHRydWUsXG4gICAgICBub1JldHVybjogZmFsc2VcbiAgICB9XG4gIH0sXG4gIGRhdGVUbzoge1xuICAgIG1vZGVzOiB7XG4gICAgICBzaW5nbGU6IHRydWUsXG4gICAgICBpbnRlcnZhbDogdHJ1ZSxcbiAgICAgIG1vbnRoOiB0cnVlLFxuICAgICAgdGltZVRvU3RheTogdHJ1ZSxcbiAgICAgIGFueXRpbWU6IHRydWUsXG4gICAgICBub1JldHVybjogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxuXG52YXIgU2VhcmNoRm9ybSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJTZWFyY2hGb3JtXCIsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYWN0aXZlOiAodHlwZW9mIHRoaXMucHJvcHMuZGVmYXVsdEFjdGl2ZSA9PSBcInVuZGVmaW5lZFwiKT8gXCJvcmlnaW5cIiA6IHRoaXMucHJvcHMuZGVmYXVsdEFjdGl2ZSxcbiAgICAgIGRhdGE6IFNlYXJjaEZvcm1TdG9yZS5kYXRhXG4gICAgfTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblxuICB9LFxuICBjcmVhdGVNb2RhbENvbnRhaW5lcjogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuc2V0QXR0cmlidXRlKCdjbGFzcycsICdtb2RhbC1jb250YWluZXItZWxlbWVudCcpO1xuICAgIC8vV0hFUkUgVE8gQVBQRU5EIElUP1xuICAgIHRoaXMucmVmc1tmaWVsZE5hbWUrXCJPdXRlclwiXS5nZXRET01Ob2RlKCkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICByZXR1cm4gZGl2O1xuICB9LFxuXG4gIGNoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkYXRhOiBTZWFyY2hGb3JtU3RvcmUuZGF0YVxuICAgIH0pXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBTZWFyY2hGb3JtU3RvcmUuZXZlbnRzLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZUxpc3RlbmVyKTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBTZWFyY2hGb3JtU3RvcmUuZXZlbnRzLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZUxpc3RlbmVyKTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICB0aGlzLnJlZnJlc2hGb2N1cygpO1xuXG4gICAgLy9Db21wbGV0ZSBwcmV2aW91cyBmaWVsZFxuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSAhPSBwcmV2U3RhdGUuYWN0aXZlKSB7XG4gICAgICBpZiAocHJldlN0YXRlLmFjdGl2ZSA9PSBcIm9yaWdpblwiIHx8IHByZXZTdGF0ZS5hY3RpdmUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XG4gICAgICAgIFNlYXJjaEZvcm1TdG9yZS5jb21wbGV0ZUZpZWxkKHByZXZTdGF0ZS5hY3RpdmUpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRGb3JtYXR0ZWRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUuZGF0YVtmaWVsZE5hbWVdO1xuICAgIGlmICghdmFsdWUpIHJldHVybiBcIlwiO1xuICAgIGlmIChmaWVsZE5hbWUgPT0gXCJvcmlnaW5cIiB8fCBmaWVsZE5hbWUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XG4gICAgICByZXR1cm4gdmFsdWUuZ2V0VGV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsdWUuZm9ybWF0KCk7XG4gICAgfVxuICB9LFxuXG4gIG5leHRGaWVsZDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIG9yZGVyID0gW1xuICAgICAgXCJvcmlnaW5cIixcbiAgICAgIFwiZGVzdGluYXRpb25cIixcbiAgICAgIFwiZGF0ZUZyb21cIixcbiAgICAgIFwiZGF0ZVRvXCIsXG4gICAgICBcInN1Ym1pdEJ1dHRvblwiXG4gICAgXTtcbiAgICB2YXIgbmV3QWN0aXZlO1xuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgdmFyIGluZGV4ID0gb3JkZXIuaW5kZXhPZih0aGlzLnN0YXRlLmFjdGl2ZSk7XG4gICAgICB2YXIgbmV3SW5kZXg7XG4gICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8PSAzKSB7XG4gICAgICAgIG5ld0FjdGl2ZSA9IG9yZGVyW2luZGV4KzFdO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSA0KSB7XG4gICAgICAgIC8vVE9ETyBmb2N1cyBvbiBzZWFyY2ggYnRuXG4gICAgICAgIG5ld0FjdGl2ZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdBY3RpdmUgPSBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdBY3RpdmUgPSBcIm9yaWdpblwiO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGFjdGl2ZTogbmV3QWN0aXZlXG4gICAgfSk7XG4gIH0sXG4gIGNoYW5nZVZhbHVlRnVuYzogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgY2hhbmdlVHlwZSkgIHtcbiAgICAgIGlmIChjaGFuZ2VUeXBlID09IFwiY2hhbmdlTW9kZVwiKSB7XG4gICAgICAgIC8vdGhpcy5yZWZzW2ZpZWxkTmFtZV0uZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICAgIC8vVE9ETyByZXR1cm4gaGVyZT8/P1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZVR5cGUgPT0gXCJzZWxlY3RcIikge1xuICAgICAgICB0aGlzLm5leHRGaWVsZCgpO1xuICAgICAgfSBlbHNlIGlmIChjaGFuZ2VUeXBlID09IFwic2VsZWN0UmFkaXVzXCIpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgYWN0aXZlOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgU2VhcmNoRm9ybVN0b3JlLnNldFZhbHVlKHRoaXMuc3RhdGUuZGF0YS5jaGFuZ2VGaWVsZChmaWVsZE5hbWUsIHZhbHVlKSk7XG5cbiAgICB9LmJpbmQodGhpcylcbiAgfSxcblxuICBvbkZvY3VzRnVuYzogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpICB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgYWN0aXZlOiBmaWVsZE5hbWVcbiAgICAgIH0pO1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5zdGF0ZS5kYXRhW2ZpZWxkTmFtZV07XG4gICAgICBpZiAodmFsdWUubW9kZSAhPSBcInRleHRcIiB8fCB2YWx1ZS5pc0RlZmF1bHQpIHtcbiAgICAgICAgdGhpcy5yZWZzW2ZpZWxkTmFtZV0uZ2V0RE9NTm9kZSgpLnNlbGVjdCgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIGNoYW5nZVRleHRGdW5jOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgaWYgKGZpZWxkTmFtZSA9PSBcIm9yaWdpblwiIHx8IGZpZWxkTmFtZSA9PSBcImRlc3RpbmF0aW9uXCIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSAge1xuICAgICAgICB2YXIgYWRkU3RhdGUgPSB7fTtcbiAgICAgICAgU2VhcmNoRm9ybVN0b3JlLnNldFZhbHVlKHRoaXMuc3RhdGUuZGF0YS5jaGFuZ2VGaWVsZChmaWVsZE5hbWUsIG5ldyBTZWFyY2hQbGFjZShlLnRhcmdldC52YWx1ZSkpKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShhZGRTdGF0ZSk7XG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHt9O1xuICAgIH1cbiAgfSxcblxuICB0b2dnbGVBY3RpdmU6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIGlmICh0eXBlID09IHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogXCJcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub25Gb2N1c0Z1bmModHlwZSkoKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcylcbiAgfSxcbiAgb25DbGlja0lubmVyOiBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgb25JbnB1dEtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUua2V5ID09IFwiQXJyb3dVcFwiIHx8IGUua2V5ID09IFwiQXJyb3dEb3duXCIgIHx8IGUua2V5ID09IFwiRW50ZXJcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfSxcblxuICByZWZyZXNoRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9tTm9kZTtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUpIHtcbiAgICAgIGRvbU5vZGUgPSB0aGlzLnJlZnNbdGhpcy5zdGF0ZS5hY3RpdmVdLmdldERPTU5vZGUoKTtcbiAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9IGRvbU5vZGUpIHtcbiAgICAgICAgZG9tTm9kZS5mb2N1cygpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUgIT0gXCJzdWJtaXRCdXR0b25cIikge1xuICAgICAgICAgIHZhciBhY3RpdmVWYWx1ZSA9IHRoaXMuc3RhdGUuZGF0YVt0aGlzLnN0YXRlLmFjdGl2ZV07XG4gICAgICAgICAgaWYgKGFjdGl2ZVZhbHVlLm1vZGUgIT0gXCJ0ZXh0XCIgfHwgYWN0aXZlVmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICBkb21Ob2RlLnNlbGVjdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzZWFyY2g6IGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFNlYXJjaEZvcm1TdG9yZS5zZWFyY2goKTtcbiAgfSxcblxuICBnZXRGaWVsZExhYmVsOiBmdW5jdGlvbiAobW9kZSkge1xuICAgIHZhciBtb2RlTGFiZWxzID0ge1xuICAgICAgb3JpZ2luOiB0cihcIkZyb21cIixcImZyb21cIiksXG4gICAgICBkZXN0aW5hdGlvbjogdHIoXCJUb1wiLFwidG9cIiksXG4gICAgICBkYXRlRnJvbTogdHIoXCJEZXBhcnRcIixcImRhdGVcIiksXG4gICAgICBkYXRlVG86IHRyKFwiUmV0dXJuXCIsXCJyZXR1cm5cIilcbiAgICB9O1xuICAgIHJldHVybiBtb2RlTGFiZWxzW21vZGVdO1xuICB9LFxuXG4gIHJlbmRlck1vZGFsOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG5cbiAgICB2YXIgWFBpY2tlck1vZGFsO1xuICAgIGlmIChmaWVsZE5hbWUgPT0gXCJvcmlnaW5cIiB8fCBmaWVsZE5hbWUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XG4gICAgICBYUGlja2VyTW9kYWwgPSBQbGFjZVBpY2tlck1vZGFsO1xuICAgIH0gZWxzZSB7XG4gICAgICBYUGlja2VyTW9kYWwgPSBEYXRlUGlja2VyTW9kYWw7XG4gICAgfVxuICAgIHZhciBvbkhpZGUgPSBmdW5jdGlvbigpICB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUgPT0gZmllbGROYW1lKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogXCJcIlxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKTtcbiAgICB2YXIgaW5wdXRFbGVtZW50ID0gbnVsbDtcbiAgICBpZiAodGhpcy5yZWZzW2ZpZWxkTmFtZSArIFwiT3V0ZXJcIl0pIHtcbiAgICAgIGlucHV0RWxlbWVudCA9IHRoaXMucmVmc1tmaWVsZE5hbWUgKyBcIk91dGVyXCJdLmdldERPTU5vZGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFhQaWNrZXJNb2RhbCwge1xuICAgICAgaW5wdXRFbGVtZW50OiBpbnB1dEVsZW1lbnQsIFxuICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuZGF0YVtmaWVsZE5hbWVdLCBcbiAgICAgIG9uSGlkZTogb25IaWRlLCBcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZVZhbHVlRnVuYyhmaWVsZE5hbWUpLCBcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNbZmllbGROYW1lXSwgXG4gICAgICBzaG93bjogZmllbGROYW1lID09IHRoaXMuc3RhdGUuYWN0aXZlfVxuICAgICkpXG5cbiAgfSxcbiAgcmVuZGVySW5wdXQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgZmFJY29uQ2xhc3MgPSBcImZhIGZhLWNhcmV0LWRvd25cIjtcbiAgICBpZiAodHlwZSA9PSB0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgZmFJY29uQ2xhc3MgPSBcImZhIGZhLWNhcmV0LXVwXCJcbiAgICB9XG4gICAgdmFyIGNsYXNzTmFtZSA9IHR5cGU7XG4gICAgaWYgKHRoaXMuc3RhdGUuZGF0YVt0eXBlXS5lcnJvcikge1xuICAgICAgY2xhc3NOYW1lICs9IFwiIGVycm9yXCJcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUuZGF0YVt0eXBlXS5sb2FkaW5nKSB7XG4gICAgICBjbGFzc05hbWUgKz0gXCIgbG9hZGluZ1wiXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZmllbGRzZXRcIiwge1xuICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZSwgXG4gICAgICAgIHJlZjogdHlwZSArIFwiT3V0ZXJcIlxuXG4gICAgICB9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7cmVmOiB0eXBlICsgXCJIZWFkXCIsIGNsYXNzTmFtZTogXCJoZWFkXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwge29uQ2xpY2s6IHRoaXMudG9nZ2xlQWN0aXZlKHR5cGUpfSwgdGhpcy5nZXRGaWVsZExhYmVsKHR5cGUpKSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJpbnB1dC13cmFwcGVyXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmdldEZvcm1hdHRlZFZhbHVlKHR5cGUpLCBcbiAgICAgICAgICAgICAgb25DbGljazogdGhpcy5vbkNsaWNrSW5uZXIsIFxuICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNGdW5jKHR5cGUpLCBcbiAgICAgICAgICAgICAgb25LZXlEb3duOiB0aGlzLm9uSW5wdXRLZXlEb3duLCBcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICByZWY6IHR5cGUsIFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VUZXh0RnVuYyh0eXBlKSwgXG4gICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogXCJvZmZcIiwgXG4gICAgICAgICAgICAgIHJlYWRPbmx5OiAodHlwZSA9PSBcImRhdGVGcm9tXCIgfHwgdHlwZSA9PSBcImRhdGVUb1wiKX1cbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXNwaW5uZXJcIn0pLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYlwiLCB7Y2xhc3NOYW1lOiBcInRvZ2dsZVwiLCBvbkNsaWNrOiB0aGlzLnRvZ2dsZUFjdGl2ZSh0eXBlKX0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogZmFJY29uQ2xhc3N9KVxuICAgICAgICAgIClcbiAgICAgICAgKSwgXG4gICAgICAgIHRoaXMucmVuZGVyTW9kYWwodHlwZSlcbiAgICAgIClcbiAgICApXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJmb3JtXCIsIHtpZDogXCJzZWFyY2hcIn0sIFxuXG4gICAgICAgIHRoaXMucmVuZGVySW5wdXQoXCJvcmlnaW5cIiksIFxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwiZGVzdGluYXRpb25cIiksIFxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwiZGF0ZUZyb21cIiksIFxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwiZGF0ZVRvXCIpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7b25DbGljazogdGhpcy5zZWFyY2gsIGlkOiBcInNlYXJjaC1mbGlnaHRzXCIsIHJlZjogXCJzdWJtaXRCdXR0b25cIiwgY2xhc3NOYW1lOiBcImJ0bi1zZWFyY2hcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbiwge3RLZXk6IFwic2VhcmNoXCJ9LCBcIlNlYXJjaFwiKSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtc2VhcmNoXCJ9KSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hGb3JtO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgdHIgPSByZXF1aXJlKCcuL3RyLmpzJyk7XG5cbi8qIHJlYWN0IGNvbXBvbmVudCB3cmFwcGVyIG9mIHRyIGZ1bmN0aW9uICovXG5cbnZhciBUcmFuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlRyYW5cIixcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3JpZ2luYWwgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICAgIHZhciBrZXkgPSB0aGlzLnByb3BzLnRLZXk7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMucHJvcHMudmFsdWVzO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcbiAgICAgICAgIHRyKG9yaWdpbmFsLGtleSx2YWx1ZXMpIFxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW47XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBJbW11dGFibGUgPSByZXF1aXJlKCcuL2ltbXV0YWJsZS5qc3gnKTtcblxuZm9yKHZhciBJbW11dGFibGVfX19fS2V5IGluIEltbXV0YWJsZSl7aWYoSW1tdXRhYmxlLmhhc093blByb3BlcnR5KEltbXV0YWJsZV9fX19LZXkpKXtNYXBQbGFjZVtJbW11dGFibGVfX19fS2V5XT1JbW11dGFibGVbSW1tdXRhYmxlX19fX0tleV07fX12YXIgX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZT1JbW11dGFibGU9PT1udWxsP251bGw6SW1tdXRhYmxlLnByb3RvdHlwZTtNYXBQbGFjZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlKTtNYXBQbGFjZS5wcm90b3R5cGUuY29uc3RydWN0b3I9TWFwUGxhY2U7TWFwUGxhY2UuX19zdXBlckNvbnN0cnVjdG9yX189SW1tdXRhYmxlO1xuXG4gIGZ1bmN0aW9uIE1hcFBsYWNlKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5wbGFjZSA9IHBsYWluLnBsYWNlO1xuICAgIHRoaXMuZmxhZyA9IHBsYWluLmZsYWcgfHwgXCJcIjsgLy9vcmlnaW4sIGRlc3RpbmF0aW9uLCBzdG9wb3ZlclxuICAgIHRoaXMucHJpY2UgPSBwbGFpbi5wcmljZSB8fCBudWxsO1xuICAgIHRoaXMucmVsYXRpdmVQcmljZSA9IHBsYWluLnJlbGF0aXZlUHJpY2UgfHwgbnVsbDtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgLy9UT0RPIG1vdmUgdGhpcyBtZXRob2QgdG8gcGFyZW50IG9iamVjdCBJbW11dGFibGVcbiAgLyoqXG4gICAqIHJldHVybiBuZXcgb2JqZWN0IHdpdGggYWRkZWQgY2hhbmdlcywgaWYgbm8gY2hhbmdlIHJldHVybiBzYW1lIG9iamVjdFxuICAgKiBAcGFyYW0gbmV3VmFsdWVzXG4gICAqIEByZXR1cm5zIHtTZWFyY2hEYXRlfVxuICAgKi9cbiAgTWFwUGxhY2UucHJvdG90eXBlLmVkaXQ9ZnVuY3Rpb24obmV3VmFsdWVzKXtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoIW5ld1ZhbHVlcykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBsZWFzdE9uZUVkaXQgPSBmYWxzZTtcbiAgICB2YXIgbmV3UGxhaW4gPSB7fTtcbiAgICAvL0FkZCBmcm9tIHRoaXNcbiAgICBPYmplY3Qua2V5cyh0aGlzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgIG5ld1BsYWluW2tleV0gPSB0aGlzW2tleV07XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICAvL0FkZCBmcm9tIG5ld1xuICAgIE9iamVjdC5rZXlzKG5ld1ZhbHVlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgICBpZiAobmV3UGxhaW5ba2V5XSAhPT0gbmV3VmFsdWVzW2tleV0pIHtcbiAgICAgICAgbmV3UGxhaW5ba2V5XSA9IG5ld1ZhbHVlc1trZXldO1xuICAgICAgICBsZWFzdE9uZUVkaXQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChsZWFzdE9uZUVkaXQpIHtcbiAgICAgIHJldHVybiBuZXcgTWFwUGxhY2UobmV3UGxhaW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcFBsYWNlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmFkaXVzID0gcmVxdWlyZShcIi4vUmFkaXVzLmpzeFwiKTtcblxuXG4gIGZ1bmN0aW9uIE9wdGlvbnMocGxhaW4pIHtcInVzZSBzdHJpY3RcIjtcbiAgICBwbGFpbiA9IHBsYWluIHx8IHt9O1xuICAgIGlmICh3aW5kb3cuU0tZUElDS0VSX0xORykge1xuICAgICAgdGhpcy5sYW5ndWFnZSA9IHdpbmRvdy5TS1lQSUNLRVJfTE5HLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGFuZ3VhZ2UgPSBwbGFpbi5sYW5ndWFnZSB8fCBcImVuXCI7XG4gICAgfVxuXG4gICAgdGhpcy5kZWZhdWx0UmFkaXVzID0gcGxhaW4uZGVmYXVsdFJhZGl1cyB8fCBuZXcgUmFkaXVzKCk7IC8vVE9ETyByYWRpdXM/P1xuICAgIHRoaXMuZGVmYXVsdE1hcENlbnRlciA9IHBsYWluLmRlZmF1bHRNYXBDZW50ZXIgfHwgbnVsbDsgLy9UT0RPIG1hcCBjZW50ZXJcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIE9wdGlvbnMucHJvdG90eXBlLnNldD1mdW5jdGlvbihrZXksIHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG5ld1BsYWluID0ge1xuICAgICAgbGFuZ3VhZ2U6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICBkZWZhdWx0UmFkaXVzOiB0aGlzLmRlZmF1bHRSYWRpdXMsXG4gICAgICBkZWZhdWx0TWFwQ2VudGVyOiB0aGlzLmRlZmF1bHRNYXBDZW50ZXJcbiAgICB9O1xuICAgIG5ld1BsYWluW2tleV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gbmV3IE9wdGlvbnMobmV3UGxhaW4pO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9ucztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdHlwZUlkVG9TdHJpbmcgPSBmdW5jdGlvbih0eXBlKSB7XG5cbn07XG5cblxuXG5cbiAgUGxhY2UudHlwZUlkVG9TdHJpbmc9ZnVuY3Rpb24odHlwZSkge1widXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlID09IFBsYWNlLlRZUEVfQUlSUE9SVCkge1xuICAgICAgcmV0dXJuIFwiYWlycG9ydFwiO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBQbGFjZS5UWVBFX0NPVU5UUlkpIHtcbiAgICAgIHJldHVybiBcImNvdW50cnlcIjtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gUGxhY2UuVFlQRV9DSVRZKSB7XG4gICAgICByZXR1cm4gXCJjaXR5XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcInVua25vd25cIjtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIFBsYWNlKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmtleXMocGxhaW4pLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgICAgdGhpc1trZXldID0gcGxhaW5ba2V5XTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIGlmICghdGhpcy52YWx1ZSkge1xuICAgICAgdGhpcy52YWx1ZSA9IFwiXCI7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdGhpcy5jb21wbGV0ZSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmNvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgc2hvcnQgbmFtZVxuICAgIGlmICh0aGlzLnR5cGUgPT0gUGxhY2UuVFlQRV9DSVRZKSB7XG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHRoaXMudmFsdWUucmVwbGFjZSgvXFxzKlxcKC4rXFwpLywgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy50eXBlU3RyaW5nID0gUGxhY2UudHlwZUlkVG9TdHJpbmcodGhpcy50eXBlKTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIFBsYWNlLnByb3RvdHlwZS5nZXROYW1lPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9O1xuICBQbGFjZS5wcm90b3R5cGUuZ2V0SWQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG4gIH07XG4gIFBsYWNlLnByb3RvdHlwZS5nZXRUeXBlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnR5cGVTdHJpbmc7XG4gIH07XG4gIFBsYWNlLnByb3RvdHlwZS5nZXRUeXBlSWQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMudHlwZVxuICB9O1xuICAgXG4gICAgICBcbiAgICAgICAgXG4gICAgXG4gIFxuXG5cblBsYWNlLlRZUEVfQUlSUE9SVCA9IDA7XG5QbGFjZS5UWVBFX0NPVU5UUlkgPSAxO1xuUGxhY2UuVFlQRV9DSVRZID0gMjtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmZ1bmN0aW9uIHJvdW5kKG51bSkge1xuICByZXR1cm4gTWF0aC5yb3VuZChudW0gKiAxMDApIC8gMTAwO1xufVxuXG5cbiAgZnVuY3Rpb24gUmFkaXVzKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcGxhaW4gPSBwbGFpbiB8fCB7fTtcbiAgICB0aGlzLnJhZGl1cyA9ICBwbGFpbi5yYWRpdXMgfHwgMjUwO1xuICAgIHRoaXMubGF0ID0gIHBsYWluLmxhdCB8fCA1MDtcbiAgICB0aGlzLmxuZyA9ICBwbGFpbi5sbmcgfHwgMTY7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBSYWRpdXMucHJvdG90eXBlLmdldFRleHQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIFwiXCIgKyByb3VuZCh0aGlzLmxhdCkgKyBcIiwgXCIgKyByb3VuZCh0aGlzLmxuZykgKyBcIiAoXCIgKyB0aGlzLnJhZGl1cyArIFwia20pXCI7XG4gIH07XG4gIFJhZGl1cy5wcm90b3R5cGUuZ2V0VXJsU3RyaW5nPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiBcIlwiICsgcm91bmQodGhpcy5sYXQpICsgXCItXCIgKyByb3VuZCh0aGlzLmxuZykgKyBcIi1cIiArIHRoaXMucmFkaXVzICsgXCJrbVwiO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUmFkaXVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoXCJkZWVwbWVyZ2VcIik7XG5cbnZhciB1cmxEYXRlRm9ybWF0ID0gXCJZWVlZLU1NLUREXCI7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL3RyLmpzJyk7XG5cbi8qXG5jbGFzcyBTZWFyY2hEYXRlXG5pdCBoYXMgc3RhdGUgZm9yIGFsbCBtb2RlcywgYnVkZSBmb3JcbiAgY29uc3RydWN0b3JcbiAgaW5wdXQgPSBwbGFpbiBvYmplY3Qgb3Igc3RyaW5nIG9yIGp1c3QgYW5vdGhlciBTZWFyY2hEYXRlIG9iamVjdFxuICovXG52YXIgU2VhcmNoRGF0ZSA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICB2YXIgcGxhaW4gPSB7fTtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSBcInN0cmluZ1wiKSB7XG4gICAgcGxhaW4gPSB0aGlzLnBhcnNlVXJsU3RyaW5nKGlucHV0KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJvYmplY3RcIikge1xuICAgIHBsYWluID0gaW5wdXQ7XG4gIH1cbiAgdGhpcy5tb2RlID0gdHlwZW9mKHBsYWluLm1vZGUpICE9ICd1bmRlZmluZWQnID8gcGxhaW4ubW9kZSA6IFwic2luZ2xlXCI7XG4gIHRoaXMuZnJvbSA9IHR5cGVvZihwbGFpbi5mcm9tKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLmZyb20gOiBtb21lbnQudXRjKCk7XG4gIHRoaXMudG8gPSB0eXBlb2YocGxhaW4udG8pICE9ICd1bmRlZmluZWQnID8gcGxhaW4udG8gOiBtb21lbnQudXRjKCk7XG4gIHRoaXMubWluU3RheURheXMgPSB0eXBlb2YocGxhaW4ubWluU3RheURheXMpICE9ICd1bmRlZmluZWQnID8gcGxhaW4ubWluU3RheURheXMgOiAyO1xuICB0aGlzLm1heFN0YXlEYXlzID0gdHlwZW9mKHBsYWluLm1heFN0YXlEYXlzKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLm1heFN0YXlEYXlzIDogMTA7XG4gIHRoaXMuZmluYWwgPSB0eXBlb2YocGxhaW4uZmluYWwpICE9ICd1bmRlZmluZWQnPyBwbGFpbi5maW5hbCA6IHRydWU7XG4gIE9iamVjdC5mcmVlemUodGhpcyk7XG59O1xuXG4vKiBzZXRzIG1vZGUgd2l0aCBjaGVja2luZyBzb21lIGludGVybmFsIHZhbGlkaXR5ICovXG4vKiBidXQgcHJvYmFibHkgdmFsaXRpdHkgc2hvdWxkIGJlIGhhbmRsZWQgYnkgZ2V0dGVycywgYmVjYXVzZSBpdCBpcyBuaWNlIHRvIGhhdmUgaW50ZXJuYWwgc3RhdGUgZm9yIG90aGVycyBtb2RlcyB0aGFuIGVuYWJsZWQgKi9cblxuLy9TZWFyY2hEYXRlLnByb3RvdHlwZS5zZXRNb2RlID0gZnVuY3Rpb24obW9kZSkge1xuLy8gIHZhciBwcmV2aW91c01vZGUgPSB0aGlzLm1vZGU7XG4vLyAgaWYgKG1vZGUgPT0gXCJzaW5nbGVcIikge1xuLy8gICAgdGhpcy50byA9IHRoaXMuZnJvbTtcbi8vICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl0aW1lXCIpIHtcbi8vICAgIHRoaXMuZnJvbSA9IG1vbWVudC51dGMoKS5hZGQoMSwgXCJkYXlzXCIpO1xuLy8gICAgdGhpcy50byA9IG1vbWVudC51dGMoKS5hZGQoNiwgXCJtb250aHNcIik7XG4vLyAgfVxuLy8gIHRoaXMubW9kZSA9IG1vZGU7XG4vL307XG5cblxuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm1vZGVcbn07XG5cblNlYXJjaERhdGUucHJvdG90eXBlLmdldEZyb20gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIiB8fCB0aGlzLm1vZGUgPT0gXCJub1JldHVyblwiKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwiYW55dGltZVwiKSB7XG4gICAgcmV0dXJuIG1vbWVudC51dGMoKS5hZGQoMSxcImRheXNcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbVxuICB9XG59O1xuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRUbyA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiIHx8IHRoaXMubW9kZSA9PSBcIm5vUmV0dXJuXCIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgIHJldHVybiB0aGlzLmZyb21cbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJhbnl0aW1lXCIpIHtcbiAgICByZXR1cm4gbW9tZW50LnV0YygpLmFkZCg2LFwibW9udGhzXCIpO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLnRvKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1xuICAgIH0gZWxzZSB7XG4gICAgICAvL2p1c3QgZm9yIGNhc2VzIHdoZW4gdGhlIHZhbHVlIGlzIG5vdCBmaWxsZWQgKG5vdCBjb21wbGV0ZSBpbnRlcnZhbClcbiAgICAgIHJldHVybiB0aGlzLmZyb21cbiAgICB9XG4gIH1cbn07XG5cblNlYXJjaERhdGUucHJvdG90eXBlLmdldERhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubW9kZSA9PSBcInNpbmdsZVwiKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn07XG5cblNlYXJjaERhdGUucHJvdG90eXBlLmdldE1pblN0YXlEYXlzID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGUgPT0gXCJ0aW1lVG9TdGF5XCIpIHtcbiAgICByZXR1cm4gdGhpcy5taW5TdGF5RGF5cztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TWF4U3RheURheXMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIikge1xuICAgIHJldHVybiB0aGlzLm1heFN0YXlEYXlzO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLm1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgIHJldHVybiB0aGlzLmZyb20uZm9ybWF0KFwibFwiKVxuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIikge1xuICAgIHJldHVybiB0aGlzLm1pblN0YXlEYXlzKyBcIiAtIFwiICsgdGhpcy5tYXhTdGF5RGF5cyArIFwiIGRheXNcIlxuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcImludGVydmFsXCIgfHwgdGhpcy5tb2RlID09IFwibW9udGhcIikge1xuICAgIHZhciB0b0RhdGVTdHJpbmc7XG4gICAgaWYgKCF0aGlzLnRvKSB7XG4gICAgICB0b0RhdGVTdHJpbmcgPSBcIl9cIlxuICAgIH0gZWxzZSB7XG4gICAgICB0b0RhdGVTdHJpbmcgPSB0aGlzLnRvLmZvcm1hdChcImxcIilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZnJvbS5mb3JtYXQoXCJsXCIpICsgXCIgLSBcIiArIHRvRGF0ZVN0cmluZ1xuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcImFueXRpbWVcIikge1xuICAgIHJldHVybiB0cihcIkFueXRpbWVcIiwgXCJhbnl0aW1lXCIpO1xuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcIm5vUmV0dXJuXCIpIHtcbiAgICByZXR1cm4gdHIoXCJObyByZXR1cm5cIiwgXCJub19yZXR1cm5fbGFiZWxcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZVxuICB9XG59O1xuXG5cbi8qIHdhIHVybCAqL1xuU2VhcmNoRGF0ZS5wcm90b3R5cGUudG9VcmxTdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubW9kZSArIFwiX1wiICsgdGhpcy5mcm9tLmZvcm1hdCh1cmxEYXRlRm9ybWF0KSArIFwiX1wiICsgdGhpcy50by5mb3JtYXQodXJsRGF0ZUZvcm1hdCk7XG59O1xuXG4vKlxuICBKdXN0IHBhcnNlIGl0LCByZXR1cm4gcGxhaW4gbWluaW1hbC9pbmNvbXBsZXRlIHZlcnNpb24gb2YgU2VhcmNoRGF0ZSBvYmplY3RcbiAqL1xuU2VhcmNoRGF0ZS5wcm90b3R5cGUucGFyc2VVcmxTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmdEYXRlKSB7XG4gIGlmIChzdHJpbmdEYXRlLmluZGV4T2YoXCJfXCIpICE9PSAtMSkge1xuICAgIHZhciBzcGxpdCA9IHN0cmluZ0RhdGUuc3BsaXQoXCJfXCIpO1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlOiBzcGxpdFswXSxcbiAgICAgIGZyb206IG1vbWVudC51dGMoc3BsaXRbMV0sIHVybERhdGVGb3JtYXQpLFxuICAgICAgdG86IG1vbWVudC51dGMoc3BsaXRbMl0sIHVybERhdGVGb3JtYXQpXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kZTogXCJzaW5nbGVcIixcbiAgICAgIGZyb206IG1vbWVudC51dGMoc3RyaW5nRGF0ZSwgdXJsRGF0ZUZvcm1hdCksXG4gICAgICB0bzogbW9tZW50LnV0YyhzdHJpbmdEYXRlLCB1cmxEYXRlRm9ybWF0KVxuICAgIH07XG4gIH1cbn07XG5cblxuLy9UT0RPIG1vdmUgdGhpcyBtZXRob2QgdG8gcGFyZW50IG9iamVjdCBJbW11dGFibGVcbi8qKlxuICogcmV0dXJuIG5ldyBvYmplY3Qgd2l0aCBhZGRlZCBjaGFuZ2VzLCBpZiBubyBjaGFuZ2UgcmV0dXJuIHNhbWUgb2JqZWN0XG4gKiBAcGFyYW0gbmV3VmFsdWVzXG4gKiBAcmV0dXJucyB7U2VhcmNoRGF0ZX1cbiAqL1xuU2VhcmNoRGF0ZS5wcm90b3R5cGUuZWRpdCA9IGZ1bmN0aW9uKG5ld1ZhbHVlcyl7XG4gIGlmICghbmV3VmFsdWVzKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdmFyIGxlYXN0T25lRWRpdCA9IGZhbHNlO1xuICB2YXIgbmV3UGxhaW4gPSB7fTtcbiAgLy9BZGQgZnJvbSB0aGlzXG4gIE9iamVjdC5rZXlzKHRoaXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgIG5ld1BsYWluW2tleV0gPSB0aGlzW2tleV07XG4gIH0uYmluZCh0aGlzKSk7XG4gIC8vQWRkIGZyb20gbmV3XG4gIE9iamVjdC5rZXlzKG5ld1ZhbHVlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgaWYgKG5ld1BsYWluW2tleV0gIT09IG5ld1ZhbHVlc1trZXldKSB7XG4gICAgICBuZXdQbGFpbltrZXldID0gbmV3VmFsdWVzW2tleV07XG4gICAgICBsZWFzdE9uZUVkaXQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG4gIGlmIChsZWFzdE9uZUVkaXQpIHtcbiAgICByZXR1cm4gbmV3IFNlYXJjaERhdGUobmV3UGxhaW4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn07XG5cbi8qIGp1c3QgaGVscGVyIGZ1bmN0aW9uIGlmIGkgbW9kZSBpcyBub3Qgc2V0ICovXG5TZWFyY2hEYXRlLmd1ZXNzTW9kZUZyb21QbGFpbiA9IGZ1bmN0aW9uIChwbGFpbikge1xuICBpZiAocGxhaW4ubWluU3RheURheXMgJiYgcGxhaW4ubWF4U3RheURheXMpIHtcbiAgICByZXR1cm4gXCJ0aW1lVG9TdGF5XCI7XG4gIH0gZWxzZSBpZiAoIXBsYWluLmZyb20pIHtcbiAgICByZXR1cm4gXCJub1JldHVyblwiO1xuICB9IGVsc2UgaWYgKHBsYWluLmZyb20gPT0gcGxhaW4udG8pIHtcbiAgICByZXR1cm4gXCJzaW5nbGVcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCJpbnRlcnZhbFwiO1xuICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoRGF0ZTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi9TZWFyY2hEYXRlLmpzeCcpO1xudmFyIERhdGVQYWlyVmFsaWRhdG9yID0gcmVxdWlyZSgnLi8uLi90b29scy9EYXRlUGFpclZhbGlkYXRvci5qc3gnKTtcblxudmFyIGRhdGVDb3JyZWN0b3IgPSB7fTtcbmRhdGVDb3JyZWN0b3IuY29ycmVjdCA9IGZ1bmN0aW9uIChkYXRhLCBkaXJlY3Rpb24pIHtcbiAgdmFyIGVycm9yID0gRGF0ZVBhaXJWYWxpZGF0b3IudmFsaWRhdGUoXG4gICAgZGF0YS5kYXRlRnJvbSxcbiAgICBkYXRhLmRhdGVUb1xuICApO1xuICBpZiAoZXJyb3IgPT0gXCJjcm9zc2VkRGF0ZXNcIikge1xuICAgIGlmIChkaXJlY3Rpb24gPT0gXCJkYXRlRnJvbVwiKSB7XG4gICAgICByZXR1cm4gZGF0YS5kYXRlVG8gPSBkYXRhLmRhdGVGcm9tO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IFwiZGF0ZVRvXCIpIHtcbiAgICAgIHJldHVybiBkYXRhLmRhdGVGcm9tID0gZGF0YS5kYXRlVG87XG4gICAgfVxuICB9XG4gIHJldHVybiBkYXRhO1xufTtcblxuXG5cbiAgZnVuY3Rpb24gU2VhcmNoRm9ybURhdGEoaW5wdXQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcGxhaW4gPSBpbnB1dCB8fCB7fTtcbiAgICB0aGlzLmRhdGVGcm9tID0gcGxhaW4uZGF0ZUZyb20gfHwgbmV3IFNlYXJjaERhdGUoKTtcbiAgICB0aGlzLmRhdGVUbyA9IHBsYWluLmRhdGVUbyB8fCBuZXcgU2VhcmNoRGF0ZSh7ZnJvbTogbW9tZW50KCkuYWRkKDEsIFwibW9udGhzXCIpfSk7XG4gICAgdGhpcy5vcmlnaW4gPSBwbGFpbi5vcmlnaW4gfHwgbmV3IFNlYXJjaFBsYWNlKFwiXCIsIHRydWUpO1xuICAgIHRoaXMuZGVzdGluYXRpb24gPSBwbGFpbi5kZXN0aW5hdGlvbiB8fCBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwiXCJ9LCB0cnVlKTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgLyogaW1tdXRhYmxlICovXG4gIFNlYXJjaEZvcm1EYXRhLnByb3RvdHlwZS5jaGFuZ2VGaWVsZD1mdW5jdGlvbih0eXBlLCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBuZXdQbGFpbiA9IHtcbiAgICAgIGRhdGVGcm9tOiB0aGlzLmRhdGVGcm9tLFxuICAgICAgZGF0ZVRvOiB0aGlzLmRhdGVUbyxcbiAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICBkZXN0aW5hdGlvbjogdGhpcy5kZXN0aW5hdGlvblxuICAgIH07XG4gICAgbmV3UGxhaW5bdHlwZV0gPSB2YWx1ZTtcbiAgICBpZiAodHlwZSA9PSBcImRhdGVUb1wiIHx8IHR5cGUgPT0gXCJkYXRlRnJvbVwiKSB7XG4gICAgICBkYXRlQ29ycmVjdG9yLmNvcnJlY3QobmV3UGxhaW4sIHR5cGUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNlYXJjaEZvcm1EYXRhKG5ld1BsYWluKTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaEZvcm1EYXRhO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vUGxhY2UuanN4Jyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL3RyLmpzJyk7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnLi9pbW11dGFibGUuanN4Jyk7XG5cbnZhciBkZWZhdWx0VmFsdWVzID0ge1xuICBtb2RlOiBcInRleHRcIiwgLyogbW9kZXM6IHRleHQsIHBsYWNlLCBhbnl3aGVyZSwgcmFkaXVzLCAuLi4gICEhIGl0IGlzIHNpbWlsYXIgYXMgbW9kZXMgaW4gcGxhY2VQaWNrZXIgYnV0IG5vdCBleGFjdGx5IHNhbWUgKi9cbiAgdmFsdWU6IFwiXCIsXG4gIGlzRGVmYXVsdDogZmFsc2UgLyogdGhpcyBpcyBzZXQgb25seSB3aGVuIHlvdSB3YW50IHRvIHVzZSB0ZXh0IGFzIHByZWRlZmluZWQgdmFsdWUgKi9cbn07XG5cbmZ1bmN0aW9uIG1ha2VQbGFpbihpbnB1dCkge1xuICB2YXIgcGxhaW4gPSB7fTtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAndW5kZWZpbmVkJykge1xuICAgIHBsYWluLm1vZGUgPSBcInRleHRcIjtcbiAgICBwbGFpbi52YWx1ZSA9IFwiXCI7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnKSB7XG4gICAgcGxhaW4ubW9kZSA9IFwidGV4dFwiO1xuICAgIHBsYWluLnZhbHVlID0gaW5wdXQ7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09IFwib2JqZWN0XCIpIHtcbiAgICBwbGFpbiA9IGlucHV0O1xuICB9XG4gIHJldHVybiBwbGFpblxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1vZGVzKGRhdGEpIHtcbiAgaWYgKGRhdGEubW9kZSA9PSBcInRleHRcIikge1xuICAgIGlmICh0eXBlb2YgZGF0YS52YWx1ZSAhPSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3cm9uZyB0eXBlIG9mIHZhbHVlXCIpO1xuICAgIH1cbiAgfVxuICBpZiAoZGF0YS5tb2RlID09IFwicGxhY2VcIikge1xuICAgIGlmICggIShkYXRhLnZhbHVlIGluc3RhbmNlb2YgUGxhY2UpICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwid3JvbmcgdHlwZSBvZiB2YWx1ZVwiKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybU1vZGVGcm9tTW9kZShtb2RlKSB7XG4gIGlmIChtb2RlID09IFwicmFkaXVzXCIgfHwgbW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICByZXR1cm4gbW9kZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCJhbGxcIjtcbiAgfVxufVxuXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe1NlYXJjaFBsYWNlW0ltbXV0YWJsZV9fX19LZXldPUltbXV0YWJsZVtJbW11dGFibGVfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlPUltbXV0YWJsZT09PW51bGw/bnVsbDpJbW11dGFibGUucHJvdG90eXBlO1NlYXJjaFBsYWNlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZJbW11dGFibGUpO1NlYXJjaFBsYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1TZWFyY2hQbGFjZTtTZWFyY2hQbGFjZS5fX3N1cGVyQ29uc3RydWN0b3JfXz1JbW11dGFibGU7XG4gIGZ1bmN0aW9uIFNlYXJjaFBsYWNlKGlucHV0LCBpc0RlZmF1bHQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcGxhaW4gPSBtYWtlUGxhaW4oaW5wdXQpO1xuICAgIHRoaXMubW9kZSA9IHBsYWluLm1vZGUgfHwgXCJ0ZXh0XCI7XG4gICAgdGhpcy5mb3JtTW9kZSA9IHBsYWluLmZvcm1Nb2RlIHx8IGdldEZvcm1Nb2RlRnJvbU1vZGUodGhpcy5tb2RlKTtcbiAgICB0aGlzLnZhbHVlID0gcGxhaW4udmFsdWUgfHwgXCJcIjtcbiAgICB0aGlzLmlzRGVmYXVsdCA9IHBsYWluLmlzRGVmYXVsdCB8fCBpc0RlZmF1bHQ7XG4gICAgdGhpcy5lcnJvciA9IHBsYWluLmVycm9yIHx8IFwiXCI7XG4gICAgdGhpcy5sb2FkaW5nID0gcGxhaW4ubG9hZGluZyB8fCBmYWxzZTtcblxuICAgIHZhbGlkYXRlTW9kZXModGhpcyk7XG5cblxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cblxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0TW9kZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5tb2RlO1xuICB9O1xuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRWYWx1ZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfTtcblxuICAvKiBzaG93biB0ZXh0ICovXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRUZXh0PWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBtb2RlID0gdGhpcy5tb2RlO1xuICAgIGlmIChtb2RlID09IFwidGV4dFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XG4gICAgICByZXR1cm4gdHIoXCJBbnl3aGVyZVwiLFwiYW55d2hlcmVcIik7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicGxhY2VcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0TmFtZSgpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInJhZGl1c1wiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXRUZXh0KCk7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiaWRcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIC8qIG5hbWUgb2YgcGxhY2UgKi9cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldE5hbWU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgY29uc29sZS53YXJuKFwiZ2V0TmFtZSBzaG91bGRuJ3QgYmUgdXNlZFwiKTtcbiAgICByZXR1cm4gdGhpcy5nZXRVcmxTdHJpbmcoKTtcbiAgfTtcblxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0VXJsU3RyaW5nPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBtb2RlID0gdGhpcy5tb2RlO1xuICAgIGlmIChtb2RlID09IFwidGV4dFwiKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XG4gICAgICByZXR1cm4gXCJhbnl3aGVyZVwiO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldE5hbWUoKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJyYWRpdXNcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0VXJsU3RyaW5nKCk7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiaWRcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRJZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbW9kZSA9IHRoaXMubW9kZTtcbiAgICBpZiAobW9kZSA9PSBcInRleHRcIikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiYW55d2hlcmVcIikge1xuICAgICAgcmV0dXJuIFwiYW55d2hlcmVcIjtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXRJZCgpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImlkXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0UGxhY2U9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKHRoaXMuZ2V0TW9kZSgpID09IFwicGxhY2VcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvL1RPRE8gbW92ZSB0aGlzIG1ldGhvZCB0byBwYXJlbnQgb2JqZWN0IEltbXV0YWJsZVxuICAvKipcbiAgICogcmV0dXJuIG5ldyBvYmplY3Qgd2l0aCBhZGRlZCBjaGFuZ2VzLCBpZiBubyBjaGFuZ2UgcmV0dXJuIHNhbWUgb2JqZWN0XG4gICAqIEBwYXJhbSBuZXdWYWx1ZXNcbiAgICogQHJldHVybnMge1NlYXJjaERhdGV9XG4gICAqL1xuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZWRpdD1mdW5jdGlvbihuZXdWYWx1ZXMpe1widXNlIHN0cmljdFwiO1xuICAgIGlmICghbmV3VmFsdWVzKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIGxlYXN0T25lRWRpdCA9IGZhbHNlO1xuICAgIHZhciBuZXdQbGFpbiA9IHt9O1xuICAgIC8vQWRkIGZyb20gdGhpc1xuICAgIE9iamVjdC5rZXlzKHRoaXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgICAgbmV3UGxhaW5ba2V5XSA9IHRoaXNba2V5XTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIC8vQWRkIGZyb20gbmV3XG4gICAgT2JqZWN0LmtleXMobmV3VmFsdWVzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgIGlmIChuZXdQbGFpbltrZXldICE9PSBuZXdWYWx1ZXNba2V5XSkge1xuICAgICAgICBuZXdQbGFpbltrZXldID0gbmV3VmFsdWVzW2tleV07XG4gICAgICAgIGxlYXN0T25lRWRpdCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGxlYXN0T25lRWRpdCkge1xuICAgICAgcmV0dXJuIG5ldyBTZWFyY2hQbGFjZShuZXdQbGFpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICB9O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hQbGFjZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBJbW11dGFibGUoKXtcInVzZSBzdHJpY3RcIjt9XG5cbiAgLy9UT0RPIG1vdmUgaXQgaGVyZSBmcm9tIGNoaWxkcmVuLCBnb2FsIGlzIHRvIGhhdmUgY29tbW9uIGludGVyZmFjZSBmb3IgYWxsIG9mIHRoZW1cblxuICAvKipcbiAgICogcmV0dXJuIG5ldyBvYmplY3Qgd2l0aCBhZGRlZCBjaGFuZ2VzLCBpZiBubyBjaGFuZ2UgcmV0dXJuIHNhbWUgb2JqZWN0XG4gICAqIEBwYXJhbSBuZXdWYWx1ZXNcbiAgICogQHJldHVybnMge1NlYXJjaERhdGV9XG4gICAqL1xuICAvL2VkaXQobmV3VmFsdWVzKXtcbiAgLy8gIGlmICghbmV3VmFsdWVzKSB7XG4gIC8vICAgIHJldHVybiB0aGlzO1xuICAvLyAgfVxuICAvLyAgdmFyIGxlYXN0T25lRWRpdCA9IGZhbHNlO1xuICAvLyAgdmFyIG5ld1BsYWluID0ge307XG4gIC8vICAvL0FkZCBmcm9tIHRoaXNcbiAgLy8gIE9iamVjdC5rZXlzKHRoaXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAvLyAgICBuZXdQbGFpbltrZXldID0gdGhpc1trZXldO1xuICAvLyAgfSk7XG4gIC8vICAvL0FkZCBmcm9tIG5ld1xuICAvLyAgT2JqZWN0LmtleXMobmV3VmFsdWVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgLy8gICAgaWYgKG5ld1BsYWluW2tleV0gIT09IG5ld1ZhbHVlc1trZXldKSB7XG4gIC8vICAgICAgbmV3UGxhaW5ba2V5XSA9IG5ld1ZhbHVlc1trZXldO1xuICAvLyAgICAgIGxlYXN0T25lRWRpdCA9IHRydWU7XG4gIC8vICAgIH1cbiAgLy8gIH0pO1xuICAvLyAgaWYgKGxlYXN0T25lRWRpdCkge1xuICAvLyAgICByZXR1cm4gbmV3IFNlYXJjaERhdGUobmV3UGxhaW4pO1xuICAvLyAgfSBlbHNlIHtcbiAgLy8gICAgcmV0dXJuIHRoaXM7XG4gIC8vICB9XG4gIC8vXG4gIC8vfTtcbiAgLyoqXG4gICAqIHJldHVybiBlZGl0ZWQgb2JqZWN0XG4gICAqIEBwYXJhbSBrZXlcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEByZXR1cm5zIHtTZWFyY2hEYXRlfVxuICAgKi9cbiAgSW1tdXRhYmxlLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBuZXdQbGFpbiA9IHt9O1xuICAgIG5ld1BsYWluW2tleV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcy5lZGl0KG5ld1BsYWluKVxuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW1tdXRhYmxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgU2VhcmNoRm9ybSA9IHJlcXVpcmUoJy4vLi4vU2VhcmNoRm9ybS9TZWFyY2hGb3JtLmpzeCcpO1xuXG4vKipcbiAqIG9wdGlvbnMuZWxlbWVudCAtIGVsZW1lbnQgdG8gYmluZCB3aG9sZSBzZWFyY2ggZm9ybVxuICogb3B0aW9ucy5kZWZhdWx0QWN0aXZlIC0gbW9kZSB3aGljaCB3aWxsIGJlIGFjdGl2YXRlZCBvbiBpbml0IG9mIGNvbXBvbmVudCAtIGRlZmF1bHQ6IFwib3JpZ2luXCIsIHNldCBudWxsIHRvIGRvbid0IHNob3cgYW55XG4gKi9cblxuICBmdW5jdGlvbiBTZWFyY2hGb3JtQWRhcHRlcihvcHRpb25zKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJvb3QgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFNlYXJjaEZvcm0pO1xuICAgIHZhciByZWFjdEVsZW1lbnQgPSByb290KCk7XG4gICAgcmVhY3RFbGVtZW50LnByb3BzID0gb3B0aW9ucztcbiAgICB0aGlzLm1vZGFsQ29tcG9uZW50ID0gUmVhY3QucmVuZGVyKHJlYWN0RWxlbWVudCwgb3B0aW9ucy5lbGVtZW50KTtcbiAgfVxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoRm9ybUFkYXB0ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBNYXBQbGFjZXNTdG9yZSA9IHJlcXVpcmUoJy4vTWFwUGxhY2VzU3RvcmUuanN4Jyk7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIFF1YWR0cmVlID0gcmVxdWlyZSgnLi8uLi90b29scy9xdWFkdHJlZS5qcycpO1xuXG5mdW5jdGlvbiBpc0NvbGxpZGUoYSwgYikge1xuICByZXR1cm4gIShcbiAgKChhLnkgKyBhLmgpIDwgKGIueSkpIHx8XG4gIChhLnkgPiAoYi55ICsgYi5oKSkgfHxcbiAgKChhLnggKyBhLncpIDwgYi54KSB8fFxuICAoYS54ID4gKGIueCArIGIudykpXG4gICk7XG59XG5cblxuICBmdW5jdGlvbiBNYXBMYWJlbHNTdG9yZSgpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIHRoaXMubGFiZWxzQm91bmRzVHJlZSA9IFF1YWR0cmVlLmluaXQoe1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICB3OiA1MDAwLCAvL2JpZyBlbm91Z2ggc2NyZWVuIHNpemVcbiAgICAgIGg6IDUwMDAsXG4gICAgICBtYXhEZXB0aCA6IDIwXG4gICAgfSk7XG5cbiAgICB0aGlzLmxhYmVscyA9IFtdO1xuXG4gICAgTWFwUGxhY2VzU3RvcmUuZXZlbnRzLm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMucmVmcmVzaExhYmVscygpO1xuICAgIH0uYmluZCh0aGlzKSlcbiAgfVxuICAvKipcbiAgICogbWluIG1heCBwcmljZSBmb3Igc2hvd24gcGxhY2VzIChsYWJlbHMpXG4gICAqIEBwYXJhbSBsYWJlbHNcbiAgICogQHJldHVybiB7e319XG4gICAqL1xuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUuZmluZFByaWNlU3RhdHNGb3JMYWJlbHM9ZnVuY3Rpb24obGFiZWxzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIGxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKGxhYmVsKSAge1xuICAgICAgdmFyIHByaWNlID0gbGFiZWwubWFwUGxhY2UucHJpY2U7XG4gICAgICBpZiAoIXJlcy5tYXhQcmljZSB8fCByZXMubWF4UHJpY2UgPCBwcmljZSkgcmVzLm1heFByaWNlID0gcHJpY2U7XG4gICAgICBpZiAoIXJlcy5taW5QcmljZSB8fCByZXMubWluUHJpY2UgPiBwcmljZSkgcmVzLm1pblByaWNlID0gcHJpY2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbiAgLyogIW11dGF0ZXMgbGFiZWxzICovXG4gIE1hcExhYmVsc1N0b3JlLnByb3RvdHlwZS5jYWxjdWxhdGVSZWxhdGl2ZVByaWNlc0ZvckxhYmVscz1mdW5jdGlvbihsYWJlbHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcHJpY2VTdGF0cyA9IHRoaXMuZmluZFByaWNlU3RhdHNGb3JMYWJlbHMobGFiZWxzKTtcbiAgICBsYWJlbHMuZm9yRWFjaChmdW5jdGlvbihsYWJlbCkgIHtcbiAgICAgIGxhYmVsLnJlbGF0aXZlUHJpY2UgPSBsYWJlbC5tYXBQbGFjZS5wcmljZSAvIHByaWNlU3RhdHMubWF4UHJpY2U7XG4gICAgfSk7XG4gIH07XG4gIC8vIG11dGF0ZXMgcGxhY2VzISEhIVxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUubWFwUGxhY2VzVG9MYWJlbHM9ZnVuY3Rpb24obWFwUGxhY2VzLCBmcm9tTGF0TG5nVG9EaXZQaXhlbCkge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMubGFiZWxzQm91bmRzVHJlZS5jbGVhcigpO1xuICAgIGlmICghbWFwUGxhY2VzIHx8IG1hcFBsYWNlcy5sZW5ndGggPD0gMCkgcmV0dXJuIFtdO1xuICAgIG1hcFBsYWNlcy5zb3J0KGZ1bmN0aW9uKGEsYikgIHtcbiAgICAgIGlmIChhLmZsYWcgJiYgIWIuZmxhZykge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICBpZiAoIWEuZmxhZyAmJiBiLmZsYWcpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG5cbiAgICAgIGlmIChhLnByaWNlICYmICFiLnByaWNlKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIGlmICghYS5wcmljZSAmJiBiLnByaWNlKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgICAgaWYgKGEucHJpY2UgJiYgYi5wcmljZSkge1xuICAgICAgICByZXR1cm4gKGEucGxhY2Uuc3Bfc2NvcmUgPCBiLnBsYWNlLnNwX3Njb3JlKT8gMSA6IC0xO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGEucGxhY2Uuc3Bfc2NvcmUgPCBiLnBsYWNlLnNwX3Njb3JlKT8gMSA6IC0xO1xuICAgIH0pO1xuICAgIC8vbWFwUGxhY2VzID0gbWFwUGxhY2VzLnNsaWNlKDAsMzAwKTtcbiAgICB2YXIgbGFiZWxzID0gW107XG5cblxuICAgIG1hcFBsYWNlcy5mb3JFYWNoKGZ1bmN0aW9uKG1hcFBsYWNlKSAge1xuICAgICAgdmFyIGxhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobWFwUGxhY2UucGxhY2UubGF0LCBtYXBQbGFjZS5wbGFjZS5sbmcpO1xuICAgICAgdmFyIHBvc2l0aW9uID0gZnJvbUxhdExuZ1RvRGl2UGl4ZWwobGF0TG5nKTtcblxuICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgIHg6IHBvc2l0aW9uLngsXG4gICAgICAgIHk6IHBvc2l0aW9uLnksXG4gICAgICAgIHc6IDcwLFxuICAgICAgICBoOiA0MFxuICAgICAgfTtcblxuICAgICAgdmFyIGNvbGxpc2lvbnMgPSAwO1xuICAgICAgdGhpcy5sYWJlbHNCb3VuZHNUcmVlLnJldHJpZXZlKGl0ZW0sIGZ1bmN0aW9uKGNoZWNraW5nSXRlbSkge1xuICAgICAgICBpZiAoaXNDb2xsaWRlKGl0ZW0sIGNoZWNraW5nSXRlbSkpIHtcbiAgICAgICAgICBjb2xsaXNpb25zICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2hvd0Z1bGxMYWJlbCA9IGZhbHNlO1xuICAgICAgaWYgKGNvbGxpc2lvbnMgPT0gMCkge1xuICAgICAgICBzaG93RnVsbExhYmVsID0gdHJ1ZTtcbiAgICAgICAgaXRlbS5tYXBQbGFjZSA9IG1hcFBsYWNlO1xuICAgICAgICB0aGlzLmxhYmVsc0JvdW5kc1RyZWUuaW5zZXJ0KGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGFiZWwgPSB7XG4gICAgICAgIG1hcFBsYWNlOiBtYXBQbGFjZSxcbiAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICBzaG93RnVsbExhYmVsOiBzaG93RnVsbExhYmVsXG4gICAgICB9O1xuICAgICAgbGFiZWxzLnB1c2gobGFiZWwpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGxhYmVscztcbiAgfTtcblxuICBNYXBMYWJlbHNTdG9yZS5wcm90b3R5cGUucmVmcmVzaExhYmVscz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5sYXRMbmdCb3VuZHMgJiYgdGhpcy5mcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmMpIHtcbiAgICAgIHZhciBtYXBQbGFjZXMgPSBNYXBQbGFjZXNTdG9yZS5nZXRCeUJvdW5kcyh0aGlzLmxhdExuZ0JvdW5kcyk7XG4gICAgICB2YXIgbGFiZWxzID0gdGhpcy5tYXBQbGFjZXNUb0xhYmVscyhtYXBQbGFjZXMsIHRoaXMuZnJvbUxhdExuZ1RvRGl2UGl4ZWxGdW5jKTtcbiAgICAgIHRoaXMuY2FsY3VsYXRlUmVsYXRpdmVQcmljZXNGb3JMYWJlbHMobGFiZWxzKTtcbiAgICAgIHRoaXMubGFiZWxzID0gbGFiZWxzO1xuICAgICAgdGhpcy5ldmVudHMuZW1pdChcImNoYW5nZVwiKTtcbiAgICB9XG4gIH07XG5cbiAgTWFwTGFiZWxzU3RvcmUucHJvdG90eXBlLnNldE1hcERhdGE9ZnVuY3Rpb24obGF0TG5nQm91bmRzLCBmcm9tTGF0TG5nVG9EaXZQaXhlbEZ1bmMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLmxhdExuZ0JvdW5kcyA9IGxhdExuZ0JvdW5kcztcbiAgICB0aGlzLmZyb21MYXRMbmdUb0RpdlBpeGVsRnVuYyA9IGZyb21MYXRMbmdUb0RpdlBpeGVsRnVuYztcbiAgICB0aGlzLnJlZnJlc2hMYWJlbHMoKTtcbiAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTWFwTGFiZWxzU3RvcmUoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFF1YWR0cmVlID0gcmVxdWlyZSgnLi8uLi90b29scy9xdWFkdHJlZS5qcycpO1xuXG5mdW5jdGlvbiBib3VuZHNUb1NlbGVjdG9yKGxhdExuZ0JvdW5kcykge1xuICB2YXIgYm91bmRzID0gbGF0TG5nQm91bmRzO1xuICAvL2lmIG1hcCBoYXMgMTgwbG5nIHZpZXcgc2NvcGUgdGhhbiBzaG93IG9ubHkgdGhlIGJpZ2dlciBwYXJ0IG9mIHNob3duIHBsYW5ldFxuICBpZiAoYm91bmRzLmVMbmcgLSBib3VuZHMud0xuZyA8IDApIHtcbiAgICAvLyB3aGF0IGlzIG1vcmUgZmFyIGZyb20gemVybywgaXQgaXMgc21hbGxlclxuICAgIGlmIChNYXRoLmFicyhib3VuZHMuZUxuZykgPiBNYXRoLmFicyhib3VuZHMud0xuZykpIHtcbiAgICAgIGJvdW5kcy5lTG5nID0gMTgwO1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZHMud0xuZyA9IC0xODA7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgeDogYm91bmRzLndMbmcgKyAxODAsXG4gICAgeTogYm91bmRzLnNMYXQgKyA5MCxcbiAgICB3OiBib3VuZHMuZUxuZyAtIGJvdW5kcy53TG5nLFxuICAgIGg6IGJvdW5kcy5uTGF0IC0gYm91bmRzLnNMYXRcbiAgfTtcbn1cblxuXG4vKiBzdHJ1Y3R1cmUgdG8gc3RvcmUgbWFwUGxhY2VzIGFuZCBpbmRleCB0aGVtIGJ5IGlkIGFuZCBieSBsYXQgbG5nIHBvc2l0aW9uICovXG5cbiAgZnVuY3Rpb24gTWFwUGxhY2VzSW5kZXgoKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5tYXBQbGFjZXNJbmRleCA9IHt9O1xuICAgIHRoaXMucG9pbnRzVHJlZSA9IFF1YWR0cmVlLmluaXQoe1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICB3OiAzNjAsXG4gICAgICBoOiAxODAsXG4gICAgICBtYXhEZXB0aCA6IDEyXG4gICAgfSk7XG4gIH1cblxuICBNYXBQbGFjZXNJbmRleC5wcm90b3R5cGUuZ2V0QnlJZD1mdW5jdGlvbihpZCkge1widXNlIHN0cmljdFwiO1xuICAgIGlmICh0aGlzLm1hcFBsYWNlc0luZGV4W2lkXSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwUGxhY2VzSW5kZXhbaWRdLm1hcFBsYWNlO1xuICAgIH1cbiAgfTtcblxuICBNYXBQbGFjZXNJbmRleC5wcm90b3R5cGUuZ2V0QnlCb3VuZHM9ZnVuY3Rpb24obGF0TG5nQm91bmRzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHRyZWVTZWxlY3RvciA9IGJvdW5kc1RvU2VsZWN0b3IobGF0TG5nQm91bmRzKTtcbiAgICB2YXIgbWFwUGxhY2VzID0gW107XG4gICAgdGhpcy5wb2ludHNUcmVlLnJldHJpZXZlKHRyZWVTZWxlY3RvciwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgbWFwUGxhY2VzLnB1c2goaXRlbS5tYXBQbGFjZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hcFBsYWNlcztcbiAgfTtcblxuICBNYXBQbGFjZXNJbmRleC5wcm90b3R5cGUuaW5zZXJ0UGxhY2VzPWZ1bmN0aW9uKG1hcFBsYWNlcykge1widXNlIHN0cmljdFwiO1xuICAgIG1hcFBsYWNlcy5mb3JFYWNoKGZ1bmN0aW9uKG1hcFBsYWNlKSAge1xuICAgICAgdmFyIHBsYWNlQ29udGFpbmVyID0ge1xuICAgICAgICB4OiBtYXBQbGFjZS5wbGFjZS5sbmcgKyAxODAsXG4gICAgICAgIHk6IG1hcFBsYWNlLnBsYWNlLmxhdCArIDkwLFxuICAgICAgICB3OiAwLjAwMDAxLFxuICAgICAgICBoOiAwLjAwMDAxLFxuICAgICAgICBtYXBQbGFjZTogbWFwUGxhY2VcbiAgICAgIH07XG4gICAgICB0aGlzLm1hcFBsYWNlc0luZGV4W21hcFBsYWNlLnBsYWNlLmlkXSA9IHBsYWNlQ29udGFpbmVyO1xuICAgICAgdGhpcy5wb2ludHNUcmVlLmluc2VydChwbGFjZUNvbnRhaW5lcik7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcblxuICBNYXBQbGFjZXNJbmRleC5wcm90b3R5cGUuY2xlYW5QcmljZXM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmtleXModGhpcy5tYXBQbGFjZXNJbmRleCkuZm9yRWFjaChmdW5jdGlvbihpZCkgIHtcbiAgICAgIHRoaXMubWFwUGxhY2VzSW5kZXhbaWRdLm1hcFBsYWNlID0gdGhpcy5tYXBQbGFjZXNJbmRleFtpZF0ubWFwUGxhY2Uuc2V0KFwicHJpY2VcIiwgbnVsbCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfTtcbiAgLyoqXG4gICAqIEVkaXRcbiAgICogQHBhcmFtIG1hcFBsYWNlXG4gICAqL1xuICBNYXBQbGFjZXNJbmRleC5wcm90b3R5cGUuZWRpdFBsYWNlPWZ1bmN0aW9uKG1hcFBsYWNlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJlZiA9IHRoaXMubWFwUGxhY2VzSW5kZXhbbWFwUGxhY2UucGxhY2UuaWRdO1xuICAgIHJlZi54ID0gbWFwUGxhY2UucGxhY2UubG5nICsgMTgwO1xuICAgIHJlZi55ID0gbWFwUGxhY2UucGxhY2UubGF0ICsgOTA7XG4gICAgcmVmLm1hcFBsYWNlID0gbWFwUGxhY2U7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXBQbGFjZXNJbmRleDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBNYXBQbGFjZXNJbmRleCA9IHJlcXVpcmUoJy4vTWFwUGxhY2VzSW5kZXguanN4Jyk7XG52YXIgTWFwUGxhY2UgPSByZXF1aXJlKCcuLy4uL2NvbnRhaW5lcnMvTWFwUGxhY2UuanN4Jyk7XG52YXIgU2VhcmNoRm9ybVN0b3JlICA9IHJlcXVpcmUoJy4vLi4vc3RvcmVzL1NlYXJjaEZvcm1TdG9yZS5qc3gnKTtcblxudmFyIFBsYWNlc0FQSSA9IHJlcXVpcmUoJy4vLi4vQVBJcy9QbGFjZXNBUEkuanN4Jyk7XG52YXIgRmxpZ2h0c0FQSSA9IHJlcXVpcmUoJy4vLi4vQVBJcy9GbGlnaHRzQVBJLmpzeCcpO1xudmFyIFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xuXG5cblxuICBmdW5jdGlvbiBNYXBQbGFjZXNTdG9yZSgpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLm1hcFBsYWNlc0luZGV4ID0gbmV3IE1hcFBsYWNlc0luZGV4KCk7XG4gICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICB0aGlzLnNlbGVjdGVkT3JpZ2luSWQgPSBudWxsOyAvL2l0IGlzIGhlcmUgc28gaSBjYW4gZmFzdGx5IGRlc2VsZWN0IHRoZSBsYXN0IHBsYWNlXG4gICAgdGhpcy5zZWxlY3RlZERlc3RpbmF0aW9uSWQgPSBudWxsO1xuXG4gICAgU2VhcmNoRm9ybVN0b3JlLmV2ZW50cy5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpICB7XG4gICAgICB0aGlzLmxvYWRQcmljZXMoKTtcbiAgICAgIHRoaXMuY2hlY2tTZWxlY3RlZCgpO1xuICAgICAgdGhpcy5ldmVudHMuZW1pdChcImNoYW5nZVwiKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMubG9hZFBsYWNlcygpO1xuICB9XG5cbiAgTWFwUGxhY2VzU3RvcmUucHJvdG90eXBlLmxvYWRQbGFjZXM9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoe2xhbmc6IFwiZW5cIn0pO1xuICAgIHBsYWNlc0FQSS5maW5kUGxhY2VzKHt0eXBlSUQ6IFBsYWNlLlRZUEVfQ0lUWX0pLnRoZW4oZnVuY3Rpb24ocGxhY2VzKSAge1xuICAgICAgdmFyIG1hcFBsYWNlcyA9IHBsYWNlcy5tYXAoZnVuY3Rpb24ocGxhY2UpICB7XG4gICAgICAgIHJldHVybiBuZXcgTWFwUGxhY2Uoe3BsYWNlOiBwbGFjZX0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm1hcFBsYWNlc0luZGV4Lmluc2VydFBsYWNlcyhtYXBQbGFjZXMpO1xuXG4gICAgICB0aGlzLmNoZWNrU2VsZWN0ZWQoKTtcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoXCJjaGFuZ2VcIik7XG4gICAgfS5iaW5kKHRoaXMpKVxuICB9O1xuXG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5maW5kUHJpY2VTdGF0cz1mdW5jdGlvbihmbGlnaHRzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJlcyA9IHt9O1xuICAgIGZsaWdodHMuZm9yRWFjaChmdW5jdGlvbihmbGlnaHQpICB7XG4gICAgICBpZiAoIXJlcy5tYXhQcmljZSB8fCByZXMubWF4UHJpY2UgPCBmbGlnaHQucHJpY2UpIHJlcy5tYXhQcmljZSA9IGZsaWdodC5wcmljZTtcbiAgICAgIGlmICghcmVzLm1pblByaWNlIHx8IHJlcy5taW5QcmljZSA+IGZsaWdodC5wcmljZSkgcmVzLm1pblByaWNlID0gZmxpZ2h0LnByaWNlO1xuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG4gIH07XG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5sb2FkUHJpY2VzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIC8vVE9ETyBjbGVhbiBjb3VsZCBiZSBvbW1pdGVkIG9uIHNvbWUgY2FzZXMgKG5ldyBkYXRhKVxuICAgIHRoaXMubWFwUGxhY2VzSW5kZXguY2xlYW5QcmljZXMoKTtcbiAgICAvL1RPRE8gYWxzbyBvdGhlciBvcmlnaW4gdHlwZXNcbiAgICBpZiAoU2VhcmNoRm9ybVN0b3JlLmRhdGEub3JpZ2luLm1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgICB2YXIgb3JpZ2luID0gU2VhcmNoRm9ybVN0b3JlLmRhdGEub3JpZ2luO1xuICAgICAgdmFyIGZsaWdodHNBUEkgPSBuZXcgRmxpZ2h0c0FQSSh7bGFuZzogXCJlblwifSk7XG4gICAgICBmbGlnaHRzQVBJLmZpbmRGbGlnaHRzKHtcbiAgICAgICAgb3JpZ2luOiBvcmlnaW4udmFsdWUuaWQsXG4gICAgICAgIGRlc3RpbmF0aW9uOiBcImFueXdoZXJlXCIsXG4gICAgICAgIG91dGJvdW5kRGF0ZTogU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGF0ZUZyb20sXG4gICAgICAgIGluYm91bmREYXRlOiBTZWFyY2hGb3JtU3RvcmUuZGF0YS5kYXRlVG9cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oZmxpZ2h0cykgIHtcbiAgICAgICAgdmFyIHByaWNlU3RhdHMgPSB0aGlzLmZpbmRQcmljZVN0YXRzKGZsaWdodHMpO1xuXG4gICAgICAgIGZsaWdodHMuZm9yRWFjaChmdW5jdGlvbihmbGlnaHQpICB7XG4gICAgICAgICAgdmFyIG1hcFBsYWNlID0gdGhpcy5tYXBQbGFjZXNJbmRleC5nZXRCeUlkKGZsaWdodC5tYXBJZHRvKTtcbiAgICAgICAgICBpZiAobWFwUGxhY2UpIHtcbiAgICAgICAgICAgIHZhciByZWxhdGl2ZVByaWNlID0gZmxpZ2h0LnByaWNlIC8gcHJpY2VTdGF0cy5tYXhQcmljZTsgLy9UT0RPIG5pY2VyIGZ1bmN0aW9uXG4gICAgICAgICAgICB0aGlzLm1hcFBsYWNlc0luZGV4LmVkaXRQbGFjZShtYXBQbGFjZS5lZGl0KHtcInByaWNlXCI6ZmxpZ2h0LnByaWNlLCBcInJlbGF0aXZlUHJpY2VcIjogcmVsYXRpdmVQcmljZX0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuZXZlbnRzLmVtaXQoXCJjaGFuZ2VcIik7XG4gICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcbiAgICAgICAgLy9UT0RPIG5pY2VyIGVycm9yIGhhbmRsaW5nXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBNYXBQbGFjZXNTdG9yZS5wcm90b3R5cGUuY2hlY2tTZWxlY3RlZD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoU2VhcmNoRm9ybVN0b3JlLmRhdGEub3JpZ2luLm1vZGUgPT0gXCJwbGFjZVwiICYmIHRoaXMuc2VsZWN0ZWRPcmlnaW5JZCAhPSBTZWFyY2hGb3JtU3RvcmUuZGF0YS5vcmlnaW4udmFsdWUuaWQpIHtcbiAgICAgIHRoaXMuZGVzZWxlY3RQbGFjZSh0aGlzLnNlbGVjdGVkT3JpZ2luSWQpO1xuICAgICAgdGhpcy5zZWxlY3RQbGFjZShTZWFyY2hGb3JtU3RvcmUuZGF0YS5vcmlnaW4udmFsdWUuaWQsIFwib3JpZ2luXCIpO1xuICAgICAgdGhpcy5zZWxlY3RlZE9yaWdpbklkID0gU2VhcmNoRm9ybVN0b3JlLmRhdGEub3JpZ2luLnZhbHVlLmlkO1xuICAgIH1cbiAgICBpZiAoU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGVzdGluYXRpb24ubW9kZSA9PSBcInBsYWNlXCIgJiYgdGhpcy5zZWxlY3RlZERlc3RpbmF0aW9uSWQgIT0gU2VhcmNoRm9ybVN0b3JlLmRhdGEuZGVzdGluYXRpb24udmFsdWUuaWQpIHtcbiAgICAgIHRoaXMuZGVzZWxlY3RQbGFjZSh0aGlzLnNlbGVjdGVkRGVzdGluYXRpb25JZCk7XG4gICAgICB0aGlzLnNlbGVjdFBsYWNlKFNlYXJjaEZvcm1TdG9yZS5kYXRhLmRlc3RpbmF0aW9uLnZhbHVlLmlkLCBcImRlc3RpbmF0aW9uXCIpO1xuICAgICAgdGhpcy5zZWxlY3RlZERlc3RpbmF0aW9uSWQgPSBTZWFyY2hGb3JtU3RvcmUuZGF0YS5kZXN0aW5hdGlvbi52YWx1ZS5pZDtcbiAgICB9XG4gIH07XG5cbiAgTWFwUGxhY2VzU3RvcmUucHJvdG90eXBlLnNlbGVjdFBsYWNlPWZ1bmN0aW9uKGlkLCBkaXJlY3Rpb24pIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbWFwUGxhY2UgPSB0aGlzLm1hcFBsYWNlc0luZGV4LmdldEJ5SWQoaWQpO1xuICAgIGlmIChtYXBQbGFjZSkge1xuICAgICAgdGhpcy5tYXBQbGFjZXNJbmRleC5lZGl0UGxhY2UobWFwUGxhY2Uuc2V0KFwiZmxhZ1wiLGRpcmVjdGlvbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL1RPRE8gd2hhdCBwdXQgaGVyZT9cbiAgICB9XG5cbiAgfTtcbiAgTWFwUGxhY2VzU3RvcmUucHJvdG90eXBlLmRlc2VsZWN0UGxhY2U9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoaWQpIHtcbiAgICAgIHZhciBtYXBQbGFjZSA9IHRoaXMubWFwUGxhY2VzSW5kZXguZ2V0QnlJZChpZCk7XG4gICAgICBpZiAobWFwUGxhY2UpIHtcbiAgICAgICAgdGhpcy5tYXBQbGFjZXNJbmRleC5lZGl0UGxhY2UobWFwUGxhY2Uuc2V0KFwiZmxhZ1wiLCBcIlwiKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL1RPRE8gd2hhdCBwdXQgaGVyZT9cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIE1hcFBsYWNlc1N0b3JlLnByb3RvdHlwZS5nZXRCeUJvdW5kcz1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5tYXBQbGFjZXNJbmRleC5nZXRCeUJvdW5kcyhib3VuZHMpO1xuICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNYXBQbGFjZXNTdG9yZSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIE9wdGlvbnMgPSByZXF1aXJlKCcuLy4uL2NvbnRhaW5lcnMvT3B0aW9ucy5qc3gnKTtcblxuXG4gIGZ1bmN0aW9uIE9wdGlvbnNTdG9yZSgpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmRhdGEgPSBuZXcgT3B0aW9ucygpO1xuICB9XG4gIE9wdGlvbnNTdG9yZS5wcm90b3R5cGUuc2V0VmFsdWU9ZnVuY3Rpb24odmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmRhdGEgIT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuZGF0YSA9IHZhbHVlO1xuICAgICAgdGhpcy5ldmVudHMuZW1pdCgnY2hhbmdlJyk7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciBzZXRcbiAgICovXG4gIE9wdGlvbnNTdG9yZS5wcm90b3R5cGUuc2V0T3B0aW9uPWZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCBvbmUgdmFsdWUgdG8gZ2l2ZW4ga2V5XG4gICAqIEBwYXJhbSBrZXlcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEByZXR1cm4geyp9XG4gICAqL1xuICBPcHRpb25zU3RvcmUucHJvdG90eXBlLnNldD1mdW5jdGlvbihrZXksIHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5kYXRhLnNldChrZXksIHZhbHVlKSk7XG4gIH07XG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE9wdGlvbnNTdG9yZSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIFNlYXJjaEZvcm1EYXRhID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaEZvcm1EYXRhLmpzeCcpO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xudmFyIFEgPSByZXF1aXJlKCdxJyk7XG52YXIgUGxhY2VzQVBJID0gcmVxdWlyZSgnLi8uLi9BUElzL1BsYWNlc0FQSUNhY2hlZC5qc3gnKTtcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuL09wdGlvbnNTdG9yZS5qc3gnKTtcblxuXG5cblxudmFyIGdldEZpcnN0RnJvbUFwaSA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gIHZhciBwbGFjZXNBUEkgPSBuZXcgUGxhY2VzQVBJKHtsYW5nOiBPcHRpb25zU3RvcmUuZGF0YS5sYW5ndWFnZX0pOy8vVE9ETyBwdXQgaGVyZSBvcHRpb25zXG4gIHJldHVybiBwbGFjZXNBUEkuZmluZEJ5TmFtZSh0ZXh0KS50aGVuKGZ1bmN0aW9uKHBsYWNlcykgIHtcbiAgICBpZiAocGxhY2VzWzBdKSB7XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiBuZXcgUGxhY2UocGxhY2VzWzBdKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInRleHRcIiwgdmFsdWU6IHRleHQsIGVycm9yOiBcIm5vdEZvdW5kXCJ9KTtcbiAgICB9XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcbiAgICBjb25zb2xlLmVycm9yKGVycik7XG4gIH0pXG59O1xuXG52YXIgZmluZEJ5SWRGcm9tQXBpID0gZnVuY3Rpb24gKGlkKSB7XG4gIHZhciBwbGFjZXNBUEkgPSBuZXcgUGxhY2VzQVBJKHtsYW5nOiBPcHRpb25zU3RvcmUuZGF0YS5sYW5ndWFnZX0pOy8vVE9ETyBwdXQgaGVyZSBvcHRpb25zXG4gIHJldHVybiBwbGFjZXNBUEkuZmluZEJ5SWQoaWQpLnRoZW4oZnVuY3Rpb24ocGxhY2UpICB7XG4gICAgaWYgKHBsYWNlKSB7XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiBwbGFjZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3N3aXRjaCB0byB0ZXh0IHdoZW4gaWQgbm90IGZvdW5kPz9cbiAgICAgIHJldHVybiBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwidGV4dFwiLCB2YWx1ZTogaWQsIGVycm9yOiBcIm5vdEZvdW5kXCJ9KTtcbiAgICB9XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcbiAgICBjb25zb2xlLmVycm9yKGVycik7XG4gIH0pXG59O1xuXG5cbi8qIHJldHVybnMgcHJvbWlzZSwgcHJvbWlzZSByZXNvbHZlcyB0cnVlIGlmIHRoZXJlIGlzIG5ldyB2YWx1ZSAqL1xudmFyIGZldGNoUGxhY2UgPSBmdW5jdGlvbihzZWFyY2hQbGFjZSkge1xuICBpZiAoc2VhcmNoUGxhY2UubW9kZSA9PSBcInBsYWNlXCIgJiYgc2VhcmNoUGxhY2UudmFsdWUuY29tcGxldGUpIHtcbiAgICByZXR1cm4gZmFsc2U7IC8qIGRvbid0IG5lZWQgdG8gYXN5bmMgbG9hZCAqL1xuICB9IGVsc2UgaWYgKHNlYXJjaFBsYWNlLm1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb21pc2U6IGZpbmRCeUlkRnJvbUFwaShzZWFyY2hQbGFjZS52YWx1ZS5pZCkudGhlbihmdW5jdGlvbihuZXdTZWFyY2hQbGFjZSkgIHtcbiAgICAgICAgcmV0dXJuIG5ld1NlYXJjaFBsYWNlLnNldChcImZvcm1Nb2RlXCIsIHNlYXJjaFBsYWNlLmZvcm1Nb2RlKVxuICAgICAgfSksXG4gICAgICB0ZW1wVmFsdWU6IHNlYXJjaFBsYWNlLnNldChcImxvYWRpbmdcIiwgdHJ1ZSkvL25ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogc2VhcmNoUGxhY2UudmFsdWUsIGxvYWRpbmc6IHRydWV9KVxuICAgIH07XG4gIH0gZWxzZSBpZiAoc2VhcmNoUGxhY2UubW9kZSA9PSBcInRleHRcIikge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9taXNlOiBnZXRGaXJzdEZyb21BcGkoc2VhcmNoUGxhY2UudmFsdWUpLnRoZW4oZnVuY3Rpb24obmV3U2VhcmNoUGxhY2UpICB7XG4gICAgICAgIHJldHVybiBuZXdTZWFyY2hQbGFjZS5zZXQoXCJmb3JtTW9kZVwiLCBzZWFyY2hQbGFjZS5mb3JtTW9kZSlcbiAgICAgIH0pLFxuICAgICAgdGVtcFZhbHVlOiBzZWFyY2hQbGFjZS5zZXQoXCJsb2FkaW5nXCIsIHRydWUpLy9uZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwidGV4dFwiLCB2YWx1ZTogc2VhcmNoUGxhY2UudmFsdWUsIGxvYWRpbmc6IHRydWV9KVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG4gIGZ1bmN0aW9uIFNlYXJjaEZvcm1TdG9yZSgpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmRhdGEgPSBuZXcgU2VhcmNoRm9ybURhdGEoKTtcbiAgfVxuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLnNldFZhbHVlPWZ1bmN0aW9uKHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5kYXRhICE9IHZhbHVlKSB7XG4gICAgICB0aGlzLmRhdGEgPSB2YWx1ZTtcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9O1xuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLnNldEZpZWxkPWZ1bmN0aW9uKGZpZWxkTmFtZSwgdmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLmRhdGEuY2hhbmdlRmllbGQoZmllbGROYW1lLCB2YWx1ZSkpO1xuICB9O1xuXG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuY29tcGxldGVGaWVsZD1mdW5jdGlvbihmaWVsZE5hbWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZmV0Y2hJbmZvID0gZmV0Y2hQbGFjZSh0aGlzLmRhdGFbZmllbGROYW1lXSk7XG4gICAgaWYgKGZldGNoSW5mbykge1xuICAgICAgdmFyICRfXzA9ICAgZmV0Y2hJbmZvLHByb21pc2U9JF9fMC5wcm9taXNlLHRlbXBWYWx1ZT0kX18wLnRlbXBWYWx1ZTtcbiAgICAgIHRoaXMuc2V0RmllbGQoZmllbGROYW1lLCB0ZW1wVmFsdWUpO1xuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbihmaW5hbFZhbHVlKSAge1xuICAgICAgICAvKiBvbmx5IGlmIGl0J3MgaXMgc3RpbGwgc2FtZSB2YWx1ZSBhcyBiZWZvcmUsIG5vdGhpbmcgbmV3ICovXG4gICAgICAgIGlmICh0ZW1wVmFsdWUgPT0gdGhpcy5kYXRhW2ZpZWxkTmFtZV0pIHtcbiAgICAgICAgICB0aGlzLnNldEZpZWxkKGZpZWxkTmFtZSwgZmluYWxWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vVE9ETyBkb250IGtub3cgd2hhdCB0byByZXR1cm4/Pz9cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLnRyaWdnZXJTZWFyY2g9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9UT0RPIGNoZWNrIGlmIHRoZXJlIGlzIGV2ZXJ5IGRhdGEgb2tcbiAgICB0aGlzLmV2ZW50cy5lbWl0KCdzZWFyY2gnKTtcbiAgfTtcbiAgLyogZmV0Y2ggZGlyZWN0aW9uIGFuZCByZXR1cm4gZGF0YSB3aXRoIHRlbXAgdmFsdWUgKi9cbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS5mZXRjaERpcmVjdGlvbj1mdW5jdGlvbihkYXRhLCBkaXJlY3Rpb24pIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZmV0Y2hJbmZvID0gZmV0Y2hQbGFjZShkYXRhW2RpcmVjdGlvbl0pO1xuICAgIGlmIChmZXRjaEluZm8pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb21pc2U6IGZldGNoSW5mby5wcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpICB7XG4gICAgICAgICAgcmV0dXJuIHtkaXJlY3Rpb246ZGlyZWN0aW9uLHZhbHVlOnZhbHVlfVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3RGF0YTogZGF0YS5jaGFuZ2VGaWVsZChkaXJlY3Rpb24sIGZldGNoSW5mby50ZW1wVmFsdWUpXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuc2VhcmNoPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgIHZhciBuZXdUZW1wRGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgb3JpZ2luTG9hZGluZ0luZm8gPSB0aGlzLmZldGNoRGlyZWN0aW9uKG5ld1RlbXBEYXRhLCBcIm9yaWdpblwiKTtcbiAgICBpZiAob3JpZ2luTG9hZGluZ0luZm8pIHtcbiAgICAgIHByb21pc2VzLnB1c2gob3JpZ2luTG9hZGluZ0luZm8ucHJvbWlzZSk7XG4gICAgICBuZXdUZW1wRGF0YSA9IG9yaWdpbkxvYWRpbmdJbmZvLm5ld0RhdGE7XG4gICAgfVxuICAgIHZhciBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvID0gdGhpcy5mZXRjaERpcmVjdGlvbihuZXdUZW1wRGF0YSwgXCJkZXN0aW5hdGlvblwiKTtcbiAgICBpZiAoZGVzdGluYXRpb25Mb2FkaW5nSW5mbykge1xuICAgICAgcHJvbWlzZXMucHVzaChkZXN0aW5hdGlvbkxvYWRpbmdJbmZvLnByb21pc2UpO1xuICAgICAgbmV3VGVtcERhdGEgPSBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvLm5ld0RhdGE7XG4gICAgfVxuICAgIC8qIGlmIGFueSBvZiB0aGVzZSBuZWVkcyBsb2FkaW5nIHNhdmUgdGVtcG9yYXJ5IG9iamVjdHMgKi9cbiAgICBpZiAobmV3VGVtcERhdGEgIT0gdGhpcy5kYXRhKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKG5ld1RlbXBEYXRhKTtcbiAgICB9XG5cblxuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgbGFzdERhdGEgPSB0aGlzLmRhdGE7XG4gICAgICByZXR1cm4gUS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykgIHtcbiAgICAgICAgaWYgKGxhc3REYXRhICE9IHRoaXMuZGF0YSkgcmV0dXJuOyAvL2lmIHNvbWUgb3RoZXIgc2VhcmNoIGhhcyBvdXRyYW4gbWVcbiAgICAgICAgdmFyIG5ld0RhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbihyZXN1bHQpICB7XG4gICAgICAgICAgbmV3RGF0YSA9IG5ld0RhdGEuY2hhbmdlRmllbGQocmVzdWx0LmRpcmVjdGlvbiwgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUobmV3RGF0YSk7XG4gICAgICAgIHRoaXMudHJpZ2dlclNlYXJjaCgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9UT0RPIGNoZWNrIGlmIGlzIG5vdCBuZWVkZWQgbmV4dCB0aWNrXG4gICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcblxuICAgICAgLy9UT0RPIHJldHVybiBzb21lIHByb21pc2U/P1xuICAgIH1cblxuICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZWFyY2hGb3JtU3RvcmUoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLnZhbGlkYXRlID0gZnVuY3Rpb24ob3V0Ym91bmQsIGluYm91bmQpIHtcbiAgaWYgKCFvdXRib3VuZCkge1xuICAgIHJldHVybiBcIm91dGJvdW5kTm90U2VsZWN0ZWRcIlxuICB9XG4gIGlmICghaW5ib3VuZCkge1xuICAgIHJldHVybiBcImluYm91bmROb3RTZWxlY3RlZFwiXG4gIH1cblxuICBpZiAoaW5ib3VuZC5tb2RlID09IFwic2luZ2xlXCIgJiYgb3V0Ym91bmQubW9kZSA9PSBcInNpbmdsZVwiKSB7XG4gICAgaWYgKGluYm91bmQuZ2V0RGF0ZSgpLmZvcm1hdChcIllZWVlNTUREXCIpIDwgb3V0Ym91bmQuZ2V0RGF0ZSgpLmZvcm1hdChcIllZWVlNTUREXCIpKSB7XG4gICAgICByZXR1cm4gXCJjcm9zc2VkRGF0ZXNcIlxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuLyogIEdlb2Rlc3kgcmVwcmVzZW50YXRpb24gY29udmVyc2lvbiBmdW5jdGlvbnMgICAgICAgICAgICAgICAgICAgICAgIChjKSBDaHJpcyBWZW5lc3MgMjAwMi0yMDE0ICAqL1xuLyogICAtIHd3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JVCBMaWNlbmNlICAqL1xuLyogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogIFNhbXBsZSB1c2FnZTogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogICAgdmFyIGxhdCA9IEdlby5wYXJzZURNUygnNTHCsCAyOOKAsiA0MC4xMuKAsyBOJyk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiAgICB2YXIgbG9uID0gR2VvLnBhcnNlRE1TKCcwMDDCsCAwMOKAsiAwNS4zMeKAsyBXJyk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qICAgIHZhciBwMSA9IG5ldyBMYXRMb24obGF0LCBsb24pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuLyoganNoaW50IG5vZGU6dHJ1ZSAqLy8qIGdsb2JhbCBkZWZpbmUgKi9cbid1c2Ugc3RyaWN0JztcblxuXG4vKipcbiAqIFRvb2xzIGZvciBjb252ZXJ0aW5nIGJldHdlZW4gbnVtZXJpYyBkZWdyZWVzIGFuZCBkZWdyZWVzIC8gbWludXRlcyAvIHNlY29uZHMuXG4gKlxuICogQG5hbWVzcGFjZVxuICovXG52YXIgR2VvID0ge307XG5cblxuLy8gbm90ZSBVbmljb2RlIERlZ3JlZSA9IFUrMDBCMC4gUHJpbWUgPSBVKzIwMzIsIERvdWJsZSBwcmltZSA9IFUrMjAzM1xuXG5cbi8qKlxuICogUGFyc2VzIHN0cmluZyByZXByZXNlbnRpbmcgZGVncmVlcy9taW51dGVzL3NlY29uZHMgaW50byBudW1lcmljIGRlZ3JlZXMuXG4gKlxuICogVGhpcyBpcyB2ZXJ5IGZsZXhpYmxlIG9uIGZvcm1hdHMsIGFsbG93aW5nIHNpZ25lZCBkZWNpbWFsIGRlZ3JlZXMsIG9yIGRlZy1taW4tc2VjIG9wdGlvbmFsbHlcbiAqIHN1ZmZpeGVkIGJ5IGNvbXBhc3MgZGlyZWN0aW9uIChOU0VXKS4gQSB2YXJpZXR5IG9mIHNlcGFyYXRvcnMgYXJlIGFjY2VwdGVkIChlZyAzwrAgMzfigLIgMDnigLNXKS5cbiAqIFNlY29uZHMgYW5kIG1pbnV0ZXMgbWF5IGJlIG9taXR0ZWQuXG4gKlxuICogQHBhcmFtICAge3N0cmluZ3xudW1iZXJ9IGRtc1N0ciAtIERlZ3JlZXMgb3IgZGVnL21pbi9zZWMgaW4gdmFyaWV0eSBvZiBmb3JtYXRzLlxuICogQHJldHVybnMge251bWJlcn0gRGVncmVlcyBhcyBkZWNpbWFsIG51bWJlci5cbiAqL1xuR2VvLnBhcnNlRE1TID0gZnVuY3Rpb24oZG1zU3RyKSB7XG4gICAgLy8gY2hlY2sgZm9yIHNpZ25lZCBkZWNpbWFsIGRlZ3JlZXMgd2l0aG91dCBOU0VXLCBpZiBzbyByZXR1cm4gaXQgZGlyZWN0bHlcbiAgICBpZiAodHlwZW9mIGRtc1N0ciA9PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShkbXNTdHIpKSByZXR1cm4gTnVtYmVyKGRtc1N0cik7XG5cbiAgICAvLyBzdHJpcCBvZmYgYW55IHNpZ24gb3IgY29tcGFzcyBkaXInbiAmIHNwbGl0IG91dCBzZXBhcmF0ZSBkL20vc1xuICAgIHZhciBkbXMgPSBTdHJpbmcoZG1zU3RyKS50cmltKCkucmVwbGFjZSgvXi0vLCcnKS5yZXBsYWNlKC9bTlNFV10kL2ksJycpLnNwbGl0KC9bXjAtOS4sXSsvKTtcbiAgICBpZiAoZG1zW2Rtcy5sZW5ndGgtMV09PScnKSBkbXMuc3BsaWNlKGRtcy5sZW5ndGgtMSk7ICAvLyBmcm9tIHRyYWlsaW5nIHN5bWJvbFxuXG4gICAgaWYgKGRtcyA9PSAnJykgcmV0dXJuIE5hTjtcblxuICAgIC8vIGFuZCBjb252ZXJ0IHRvIGRlY2ltYWwgZGVncmVlcy4uLlxuICAgIHZhciBkZWc7XG4gICAgc3dpdGNoIChkbXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMzogIC8vIGludGVycHJldCAzLXBhcnQgcmVzdWx0IGFzIGQvbS9zXG4gICAgICAgICAgICBkZWcgPSBkbXNbMF0vMSArIGRtc1sxXS82MCArIGRtc1syXS8zNjAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogIC8vIGludGVycHJldCAyLXBhcnQgcmVzdWx0IGFzIGQvbVxuICAgICAgICAgICAgZGVnID0gZG1zWzBdLzEgKyBkbXNbMV0vNjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOiAgLy8ganVzdCBkIChwb3NzaWJseSBkZWNpbWFsKSBvciBub24tc2VwYXJhdGVkIGRkZG1tc3NcbiAgICAgICAgICAgIGRlZyA9IGRtc1swXTtcbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBmaXhlZC13aWR0aCB1bnNlcGFyYXRlZCBmb3JtYXQgZWcgMDAzMzcwOVdcbiAgICAgICAgICAgIC8vaWYgKC9bTlNdL2kudGVzdChkbXNTdHIpKSBkZWcgPSAnMCcgKyBkZWc7ICAvLyAtIG5vcm1hbGlzZSBOL1MgdG8gMy1kaWdpdCBkZWdyZWVzXG4gICAgICAgICAgICAvL2lmICgvWzAtOV17N30vLnRlc3QoZGVnKSkgZGVnID0gZGVnLnNsaWNlKDAsMykvMSArIGRlZy5zbGljZSgzLDUpLzYwICsgZGVnLnNsaWNlKDUpLzM2MDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgfVxuICAgIGlmICgvXi18W1dTXSQvaS50ZXN0KGRtc1N0ci50cmltKCkpKSBkZWcgPSAtZGVnOyAvLyB0YWtlICctJywgd2VzdCBhbmQgc291dGggYXMgLXZlXG5cbiAgICByZXR1cm4gTnVtYmVyKGRlZyk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydHMgZGVjaW1hbCBkZWdyZWVzIHRvIGRlZy9taW4vc2VjIGZvcm1hdFxuICogIC0gZGVncmVlLCBwcmltZSwgZG91YmxlLXByaW1lIHN5bWJvbHMgYXJlIGFkZGVkLCBidXQgc2lnbiBpcyBkaXNjYXJkZWQsIHRob3VnaCBubyBjb21wYXNzXG4gKiAgICBkaXJlY3Rpb24gaXMgYWRkZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRlZyAtIERlZ3JlZXMgdG8gYmUgZm9ybWF0dGVkIGFzIHNwZWNpZmllZC5cbiAqIEBwYXJhbSAgIHtzdHJpbmd9IFtmb3JtYXQ9ZG1zXSAtIFJldHVybiB2YWx1ZSBhcyAnZCcsICdkbScsICdkbXMnLlxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2Ug4oCTIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IERlZ3JlZXMgZm9ybWF0dGVkIGFzIGRlZy9taW4vc2VjcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWVkIGZvcm1hdC5cbiAqL1xuR2VvLnRvRE1TID0gZnVuY3Rpb24oZGVnLCBmb3JtYXQsIGRwKSB7XG4gICAgaWYgKGlzTmFOKGRlZykpIHJldHVybiBudWxsOyAgLy8gZ2l2ZSB1cCBoZXJlIGlmIHdlIGNhbid0IG1ha2UgYSBudW1iZXIgZnJvbSBkZWdcblxuICAgIC8vIGRlZmF1bHQgdmFsdWVzXG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgPT0gJ3VuZGVmaW5lZCcpIGZvcm1hdCA9ICdkbXMnO1xuICAgIGlmICh0eXBlb2YgZHAgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2QnOiAgIGRwID0gNDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkbSc6ICBkcCA9IDI7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG1zJzogZHAgPSAwOyBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgIGZvcm1hdCA9ICdkbXMnOyBkcCA9IDA7ICAvLyBiZSBmb3JnaXZpbmcgb24gaW52YWxpZCBmb3JtYXRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlZyA9IE1hdGguYWJzKGRlZyk7ICAvLyAodW5zaWduZWQgcmVzdWx0IHJlYWR5IGZvciBhcHBlbmRpbmcgY29tcGFzcyBkaXInbilcblxuICAgIHZhciBkbXMsIGQsIG0sIHM7XG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgICAgZGVmYXVsdDogLy8gaW52YWxpZCBmb3JtYXQgc3BlYyFcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICBkID0gZGVnLnRvRml4ZWQoZHApOyAgICAgLy8gcm91bmQgZGVncmVlc1xuICAgICAgICAgICAgaWYgKGQ8MTAwKSBkID0gJzAnICsgZDsgIC8vIHBhZCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICAgICAgICAgIGlmIChkPDEwKSBkID0gJzAnICsgZDtcbiAgICAgICAgICAgIGRtcyA9IGQgKyAnwrAnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RtJzpcbiAgICAgICAgICAgIHZhciBtaW4gPSAoZGVnKjYwKS50b0ZpeGVkKGRwKTsgIC8vIGNvbnZlcnQgZGVncmVlcyB0byBtaW51dGVzICYgcm91bmRcbiAgICAgICAgICAgIGQgPSBNYXRoLmZsb29yKG1pbiAvIDYwKTsgICAgLy8gZ2V0IGNvbXBvbmVudCBkZWcvbWluXG4gICAgICAgICAgICBtID0gKG1pbiAlIDYwKS50b0ZpeGVkKGRwKTsgIC8vIHBhZCB3aXRoIHRyYWlsaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMDApIGQgPSAnMCcgKyBkOyAgICAgICAgICAvLyBwYWQgd2l0aCBsZWFkaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMCkgZCA9ICcwJyArIGQ7XG4gICAgICAgICAgICBpZiAobTwxMCkgbSA9ICcwJyArIG07XG4gICAgICAgICAgICBkbXMgPSBkICsgJ8KwJyArIG0gKyAn4oCyJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkbXMnOlxuICAgICAgICAgICAgdmFyIHNlYyA9IChkZWcqMzYwMCkudG9GaXhlZChkcCk7ICAvLyBjb252ZXJ0IGRlZ3JlZXMgdG8gc2Vjb25kcyAmIHJvdW5kXG4gICAgICAgICAgICBkID0gTWF0aC5mbG9vcihzZWMgLyAzNjAwKTsgICAgLy8gZ2V0IGNvbXBvbmVudCBkZWcvbWluL3NlY1xuICAgICAgICAgICAgbSA9IE1hdGguZmxvb3Ioc2VjLzYwKSAlIDYwO1xuICAgICAgICAgICAgcyA9IChzZWMgJSA2MCkudG9GaXhlZChkcCk7ICAgIC8vIHBhZCB3aXRoIHRyYWlsaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMDApIGQgPSAnMCcgKyBkOyAgICAgICAgICAgIC8vIHBhZCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICAgICAgICAgIGlmIChkPDEwKSBkID0gJzAnICsgZDtcbiAgICAgICAgICAgIGlmIChtPDEwKSBtID0gJzAnICsgbTtcbiAgICAgICAgICAgIGlmIChzPDEwKSBzID0gJzAnICsgcztcbiAgICAgICAgICAgIGRtcyA9IGQgKyAnwrAnICsgbSArICfigLInICsgcyArICfigLMnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gZG1zO1xufTtcblxuXG4vKipcbiAqIENvbnZlcnRzIG51bWVyaWMgZGVncmVlcyB0byBkZWcvbWluL3NlYyBsYXRpdHVkZSAoMi1kaWdpdCBkZWdyZWVzLCBzdWZmaXhlZCB3aXRoIE4vUykuXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSDigJMgZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxuICovXG5HZW8udG9MYXQgPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcbiAgICB2YXIgbGF0ID0gR2VvLnRvRE1TKGRlZywgZm9ybWF0LCBkcCk7XG4gICAgcmV0dXJuIGxhdD09PW51bGwgPyAn4oCTJyA6IGxhdC5zbGljZSgxKSArIChkZWc8MCA/ICdTJyA6ICdOJyk7ICAvLyBrbm9jayBvZmYgaW5pdGlhbCAnMCcgZm9yIGxhdCFcbn07XG5cblxuLyoqXG4gKiBDb252ZXJ0IG51bWVyaWMgZGVncmVlcyB0byBkZWcvbWluL3NlYyBsb25naXR1ZGUgKDMtZGlnaXQgZGVncmVlcywgc3VmZml4ZWQgd2l0aCBFL1cpXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSDigJMgZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxuICovXG5HZW8udG9Mb24gPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcbiAgICB2YXIgbG9uID0gR2VvLnRvRE1TKGRlZywgZm9ybWF0LCBkcCk7XG4gICAgcmV0dXJuIGxvbj09PW51bGwgPyAn4oCTJyA6IGxvbiArIChkZWc8MCA/ICdXJyA6ICdFJyk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydHMgbnVtZXJpYyBkZWdyZWVzIHRvIGRlZy9taW4vc2VjIGFzIGEgYmVhcmluZyAoMMKwLi4zNjDCsClcbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkZWcgLSBEZWdyZWVzIHRvIGJlIGZvcm1hdHRlZCBhcyBzcGVjaWZpZWQuXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBSZXR1cm4gdmFsdWUgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIOKAkyBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBEZWdyZWVzIGZvcm1hdHRlZCBhcyBkZWcvbWluL3NlY3MgYWNjb3JkaW5nIHRvIHNwZWNpZmllZCBmb3JtYXQuXG4gKi9cbkdlby50b0JybmcgPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcbiAgICBkZWcgPSAoTnVtYmVyKGRlZykrMzYwKSAlIDM2MDsgIC8vIG5vcm1hbGlzZSAtdmUgdmFsdWVzIHRvIDE4MMKwLi4zNjDCsFxuICAgIHZhciBicm5nID0gIEdlby50b0RNUyhkZWcsIGZvcm1hdCwgZHApO1xuICAgIHJldHVybiBicm5nPT09bnVsbCA/ICfigJMnIDogYnJuZy5yZXBsYWNlKCczNjAnLCAnMCcpOyAgLy8ganVzdCBpbiBjYXNlIHJvdW5kaW5nIHRvb2sgdXMgdXAgdG8gMzYwwrAhXG59O1xuXG5cbi8qKlxuICogUmV0dXJucyBjb21wYXNzIHBvaW50ICh0byBnaXZlbiBwcmVjaXNpb24pIGZvciBzdXBwbGllZCBiZWFyaW5nLlxuICpcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGJlYXJpbmcgLSBCZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtwcmVjaXNpb249M10gLSBQcmVjaXNpb24gKGNhcmRpbmFsIC8gaW50ZXJjYXJkaW5hbCAvIHNlY29uZGFyeS1pbnRlcmNhcmRpbmFsKS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IENvbXBhc3MgcG9pbnQgZm9yIHN1cHBsaWVkIGJlYXJpbmcuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgdmFyIHBvaW50ID0gR2VvLmNvbXBhc3NQb2ludCgyNCk7ICAgIC8vIHBvaW50ID0gJ05ORSdcbiAqICAgdmFyIHBvaW50ID0gR2VvLmNvbXBhc3NQb2ludCgyNCwgMSk7IC8vIHBvaW50ID0gJ04nXG4gKi9cbkdlby5jb21wYXNzUG9pbnQgPSBmdW5jdGlvbihiZWFyaW5nLCBwcmVjaXNpb24pIHtcbiAgICBpZiAodHlwZW9mIHByZWNpc2lvbiA9PSAndW5kZWZpbmVkJykgcHJlY2lzaW9uID0gMztcbiAgICAvLyBub3RlIHByZWNpc2lvbiA9IG1heCBsZW5ndGggb2YgY29tcGFzcyBwb2ludDsgaXQgY291bGQgYmUgZXh0ZW5kZWQgdG8gNCBmb3IgcXVhcnRlci13aW5kc1xuICAgIC8vIChlZyBORWJOKSwgYnV0IEkgdGhpbmsgdGhleSBhcmUgbGl0dGxlIHVzZWRcblxuICAgIGJlYXJpbmcgPSAoKGJlYXJpbmclMzYwKSszNjApJTM2MDsgLy8gbm9ybWFsaXNlIHRvIDAuLjM2MFxuXG4gICAgdmFyIHBvaW50O1xuXG4gICAgc3dpdGNoIChwcmVjaXNpb24pIHtcbiAgICAgICAgY2FzZSAxOiAvLyA0IGNvbXBhc3MgcG9pbnRzXG4gICAgICAgICAgICBzd2l0Y2ggKE1hdGgucm91bmQoYmVhcmluZyo0LzM2MCklNCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcG9pbnQgPSAnTic7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcG9pbnQgPSAnRSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjogcG9pbnQgPSAnUyc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzogcG9pbnQgPSAnVyc7IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogLy8gOCBjb21wYXNzIHBvaW50c1xuICAgICAgICAgICAgc3dpdGNoIChNYXRoLnJvdW5kKGJlYXJpbmcqOC8zNjApJTgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHBvaW50ID0gJ04nOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiBwb2ludCA9ICdORSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjogcG9pbnQgPSAnRSc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHBvaW50ID0gJ1NFJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBwb2ludCA9ICdTJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNTogcG9pbnQgPSAnU1cnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDY6IHBvaW50ID0gJ1cnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBwb2ludCA9ICdOVyc7IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogLy8gMTYgY29tcGFzcyBwb2ludHNcbiAgICAgICAgICAgIHN3aXRjaCAoTWF0aC5yb3VuZChiZWFyaW5nKjE2LzM2MCklMTYpIHtcbiAgICAgICAgICAgICAgICBjYXNlICAwOiBwb2ludCA9ICdOJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICAxOiBwb2ludCA9ICdOTkUnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICAyOiBwb2ludCA9ICdORSc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICAzOiBwb2ludCA9ICdFTkUnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA0OiBwb2ludCA9ICdFJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA1OiBwb2ludCA9ICdFU0UnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA2OiBwb2ludCA9ICdTRSc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA3OiBwb2ludCA9ICdTU0UnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA4OiBwb2ludCA9ICdTJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA5OiBwb2ludCA9ICdTU1cnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEwOiBwb2ludCA9ICdTVyc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDExOiBwb2ludCA9ICdXU1cnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEyOiBwb2ludCA9ICdXJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEzOiBwb2ludCA9ICdXTlcnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE0OiBwb2ludCA9ICdOVyc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE1OiBwb2ludCA9ICdOTlcnOyBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignUHJlY2lzaW9uIG11c3QgYmUgYmV0d2VlbiAxIGFuZCAzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvaW50O1xufVxuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuXG4vKiogRXh0ZW5kIE51bWJlciBvYmplY3Qgd2l0aCBtZXRob2QgdG8gIHRyaW0gd2hpdGVzcGFjZSBmcm9tIHN0cmluZ1xuICogIChxLnYuIGJsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL2Zhc3Rlci10cmltLWphdmFzY3JpcHQpICovXG5pZiAodHlwZW9mIFN0cmluZy5wcm90b3R5cGUudHJpbSA9PSAndW5kZWZpbmVkJykge1xuICAgIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHRoaXMpLnJlcGxhY2UoL15cXHNcXHMqLywgJycpLnJlcGxhY2UoL1xcc1xccyokLywgJycpO1xuICAgIH07XG59XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gR2VvOyAvLyBDb21tb25KU1xuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gR2VvOyB9KTsgLy8gQU1EXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vRW5oYW5jZUpTIGlzSUUgdGVzdCBpZGVhXG5cbi8vZGV0ZWN0IElFIGFuZCB2ZXJzaW9uIG51bWJlciB0aHJvdWdoIGluamVjdGVkIGNvbmRpdGlvbmFsIGNvbW1lbnRzIChubyBVQSBkZXRlY3QsIG5vIG5lZWQgZm9yIGNvbmQuIGNvbXBpbGF0aW9uIC8ganNjcmlwdCBjaGVjaylcblxuLy92ZXJzaW9uIGFyZyBpcyBmb3IgSUUgdmVyc2lvbiAob3B0aW9uYWwpXG4vL2NvbXBhcmlzb24gYXJnIHN1cHBvcnRzICdsdGUnLCAnZ3RlJywgZXRjIChvcHRpb25hbClcblxuZnVuY3Rpb24gaXNJRSh2ZXJzaW9uLCBjb21wYXJpc29uKSB7XG4gIHZhciBjYyAgICAgID0gJ0lFJyxcbiAgICBiICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQicpLFxuICAgIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgaXNJRTtcblxuICBpZih2ZXJzaW9uKXtcbiAgICBjYyArPSAnICcgKyB2ZXJzaW9uO1xuICAgIGlmKGNvbXBhcmlzb24peyBjYyA9IGNvbXBhcmlzb24gKyAnICcgKyBjYzsgfVxuICB9XG5cbiAgYi5pbm5lckhUTUwgPSAnPCEtLVtpZiAnKyBjYyArJ10+PGIgaWQ9XCJpZWNjdGVzdFwiPjwvYj48IVtlbmRpZl0tLT4nO1xuICBkb2NFbGVtLmFwcGVuZENoaWxkKGIpO1xuICBpc0lFID0gISFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWVjY3Rlc3QnKTtcbiAgZG9jRWxlbS5yZW1vdmVDaGlsZChiKTtcbiAgcmV0dXJuIGlzSUU7XG59XG5cbi8vLy9pcyBpdCBJRT9cbi8vaXNJRSgpO1xuLy9cbi8vLy9pcyBpdCBJRTY/XG4vL2lzSUUoNik7XG4vL1xuLy8vL2lzIGl0IGxlc3MgdGhhbiBvciBlcXVhbCB0byBJRSA2P1xuLy9pc0lFKDcsJ2x0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSUU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cbi8qICBMYXRpdHVkZS9sb25naXR1ZGUgc3BoZXJpY2FsIGdlb2Rlc3kgZm9ybXVsYWUgJiBzY3JpcHRzICAgICAgICAgICAoYykgQ2hyaXMgVmVuZXNzIDIwMDItMjAxNCAgKi9cbi8qICAgLSB3d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNSVQgTGljZW5jZSAgKi9cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuLyoganNoaW50IG5vZGU6dHJ1ZSAqLy8qIGdsb2JhbCBkZWZpbmUgKi9cbid1c2Ugc3RyaWN0JztcbmlmICh0eXBlb2YgbW9kdWxlIT0ndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgdmFyIEdlbyA9IHJlcXVpcmUoJy4vZ2VvJyk7IC8vIENvbW1vbkpTIChOb2RlLmpzKVxuXG5cbi8qKlxuICogQ3JlYXRlcyBhIExhdExvbiBwb2ludCBvbiB0aGUgZWFydGgncyBzdXJmYWNlIGF0IHRoZSBzcGVjaWZpZWQgbGF0aXR1ZGUgLyBsb25naXR1ZGUuXG4gKlxuICogQGNsYXNzZGVzYyBUb29scyBmb3IgZ2VvZGV0aWMgY2FsY3VsYXRpb25zXG4gKiBAcmVxdWlyZXMgR2VvXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0IC0gTGF0aXR1ZGUgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsb24gLSBMb25naXR1ZGUgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0PTBdIC0gSGVpZ2h0IGFib3ZlIG1lYW4tc2VhLWxldmVsIGluIGtpbG9tZXRyZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gW3JhZGl1cz02MzcxXSAtIChNZWFuKSByYWRpdXMgb2YgZWFydGggaW4ga2lsb21ldHJlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSk7XG4gKi9cbmZ1bmN0aW9uIExhdExvbihsYXQsIGxvbiwgaGVpZ2h0LCByYWRpdXMpIHtcbiAgICAvLyBhbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgJ25ldydcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTGF0TG9uKSkgcmV0dXJuIG5ldyBMYXRMb24obGF0LCBsb24sIGhlaWdodCwgcmFkaXVzKTtcblxuICAgIGlmICh0eXBlb2YgaGVpZ2h0ID09ICd1bmRlZmluZWQnKSBoZWlnaHQgPSAwO1xuICAgIGlmICh0eXBlb2YgcmFkaXVzID09ICd1bmRlZmluZWQnKSByYWRpdXMgPSA2MzcxO1xuICAgIHJhZGl1cyA9IE1hdGgubWluKE1hdGgubWF4KHJhZGl1cywgNjM1MyksIDYzODQpO1xuXG4gICAgdGhpcy5sYXQgICAgPSBOdW1iZXIobGF0KTtcbiAgICB0aGlzLmxvbiAgICA9IE51bWJlcihsb24pO1xuICAgIHRoaXMuaGVpZ2h0ID0gTnVtYmVyKGhlaWdodCk7XG4gICAgdGhpcy5yYWRpdXMgPSBOdW1iZXIocmFkaXVzKTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRpc3RhbmNlIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50ICh1c2luZyBoYXZlcnNpbmUgZm9ybXVsYSkuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBEaXN0YW5jZSBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIGRlc3RpbmF0aW9uIHBvaW50LCBpbiBrbSAob24gc3BoZXJlIG9mICd0aGlzJyByYWRpdXMpLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1Mi4yMDUsIDAuMTE5KSwgcDIgPSBuZXcgTGF0TG9uKDQ4Ljg1NywgMi4zNTEpO1xuICogICAgIHZhciBkID0gcDEuZGlzdGFuY2VUbyhwMik7IC8vIGQudG9QcmVjaXNpb24oNCk6IDQwNC4zXG4gKi9cbkxhdExvbi5wcm90b3R5cGUuZGlzdGFuY2VUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdmFyIFIgPSB0aGlzLnJhZGl1cztcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksICDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpLCDOuzIgPSBwb2ludC5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM6Uz4YgPSDPhjIgLSDPhjE7XG4gICAgdmFyIM6UzrsgPSDOuzIgLSDOuzE7XG5cbiAgICB2YXIgYSA9IE1hdGguc2luKM6Uz4YvMikgKiBNYXRoLnNpbijOlM+GLzIpICtcbiAgICAgICAgICAgIE1hdGguY29zKM+GMSkgKiBNYXRoLmNvcyjPhjIpICpcbiAgICAgICAgICAgIE1hdGguc2luKM6UzrsvMikgKiBNYXRoLnNpbijOlM67LzIpO1xuICAgIHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMS1hKSk7XG4gICAgdmFyIGQgPSBSICogYztcblxuICAgIHJldHVybiBkO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIChpbml0aWFsKSBiZWFyaW5nIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50LlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxuICogQHJldHVybnMge251bWJlcn0gSW5pdGlhbCBiZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcbiAqICAgICB2YXIgYjEgPSBwMS5iZWFyaW5nVG8ocDIpOyAvLyBiMS50b0ZpeGVkKDEpOiAxNTYuMlxuICovXG5MYXRMb24ucHJvdG90eXBlLmJlYXJpbmdUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6UzrsgPSAocG9pbnQubG9uLXRoaXMubG9uKS50b1JhZGlhbnMoKTtcblxuICAgIC8vIHNlZSBodHRwOi8vbWF0aGZvcnVtLm9yZy9saWJyYXJ5L2RybWF0aC92aWV3LzU1NDE3Lmh0bWxcbiAgICB2YXIgeSA9IE1hdGguc2luKM6UzrspICogTWF0aC5jb3Moz4YyKTtcbiAgICB2YXIgeCA9IE1hdGguY29zKM+GMSkqTWF0aC5zaW4oz4YyKSAtXG4gICAgICAgICAgICBNYXRoLnNpbijPhjEpKk1hdGguY29zKM+GMikqTWF0aC5jb3MozpTOuyk7XG4gICAgdmFyIM64ID0gTWF0aC5hdGFuMih5LCB4KTtcblxuICAgIHJldHVybiAozrgudG9EZWdyZWVzKCkrMzYwKSAlIDM2MDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIGZpbmFsIGJlYXJpbmcgYXJyaXZpbmcgYXQgZGVzdGluYXRpb24gZGVzdGluYXRpb24gcG9pbnQgZnJvbSAndGhpcycgcG9pbnQ7IHRoZSBmaW5hbCBiZWFyaW5nXG4gKiB3aWxsIGRpZmZlciBmcm9tIHRoZSBpbml0aWFsIGJlYXJpbmcgYnkgdmFyeWluZyBkZWdyZWVzIGFjY29yZGluZyB0byBkaXN0YW5jZSBhbmQgbGF0aXR1ZGUuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBGaW5hbCBiZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcbiAqICAgICB2YXIgYjIgPSBwMS5maW5hbEJlYXJpbmdUbyhwMik7IC8vIHAyLnRvRml4ZWQoMSk6IDE1Ny45XG4gKi9cbkxhdExvbi5wcm90b3R5cGUuZmluYWxCZWFyaW5nVG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIC8vIGdldCBpbml0aWFsIGJlYXJpbmcgZnJvbSBkZXN0aW5hdGlvbiBwb2ludCB0byB0aGlzIHBvaW50ICYgcmV2ZXJzZSBpdCBieSBhZGRpbmcgMTgwwrBcbiAgICByZXR1cm4gKCBwb2ludC5iZWFyaW5nVG8odGhpcykrMTgwICkgJSAzNjA7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWlkcG9pbnQgYmV0d2VlbiAndGhpcycgcG9pbnQgYW5kIHRoZSBzdXBwbGllZCBwb2ludC5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cbiAqIEByZXR1cm5zIHtMYXRMb259IE1pZHBvaW50IGJldHdlZW4gdGhpcyBwb2ludCBhbmQgdGhlIHN1cHBsaWVkIHBvaW50LlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1Mi4yMDUsIDAuMTE5KSwgcDIgPSBuZXcgTGF0TG9uKDQ4Ljg1NywgMi4zNTEpO1xuICogICAgIHZhciBwTWlkID0gcDEubWlkcG9pbnRUbyhwMik7IC8vIHBNaWQudG9TdHJpbmcoKTogNTAuNTM2M8KwTiwgMDAxLjI3NDbCsEVcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5taWRwb2ludFRvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAvLyBzZWUgaHR0cDovL21hdGhmb3J1bS5vcmcvbGlicmFyeS9kcm1hdGgvdmlldy81MTgyMi5odG1sIGZvciBkZXJpdmF0aW9uXG5cbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6UzrsgPSAocG9pbnQubG9uLXRoaXMubG9uKS50b1JhZGlhbnMoKTtcblxuICAgIHZhciBCeCA9IE1hdGguY29zKM+GMikgKiBNYXRoLmNvcyjOlM67KTtcbiAgICB2YXIgQnkgPSBNYXRoLmNvcyjPhjIpICogTWF0aC5zaW4ozpTOuyk7XG5cbiAgICB2YXIgz4YzID0gTWF0aC5hdGFuMihNYXRoLnNpbijPhjEpK01hdGguc2luKM+GMiksXG4gICAgICAgICAgICAgTWF0aC5zcXJ0KCAoTWF0aC5jb3Moz4YxKStCeCkqKE1hdGguY29zKM+GMSkrQngpICsgQnkqQnkpICk7XG4gICAgdmFyIM67MyA9IM67MSArIE1hdGguYXRhbjIoQnksIE1hdGguY29zKM+GMSkgKyBCeCk7XG4gICAgzrszID0gKM67MyszKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjMudG9EZWdyZWVzKCksIM67My50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGVzdGluYXRpb24gcG9pbnQgZnJvbSAndGhpcycgcG9pbnQgaGF2aW5nIHRyYXZlbGxlZCB0aGUgZ2l2ZW4gZGlzdGFuY2Ugb24gdGhlXG4gKiBnaXZlbiBpbml0aWFsIGJlYXJpbmcgKGJlYXJpbmcgbm9ybWFsbHkgdmFyaWVzIGFyb3VuZCBwYXRoIGZvbGxvd2VkKS5cbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nIC0gSW5pdGlhbCBiZWFyaW5nIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkaXN0IC0gRGlzdGFuY2UgaW4ga20gKG9uIHNwaGVyZSBvZiAndGhpcycgcmFkaXVzKS5cbiAqIEByZXR1cm5zIHtMYXRMb259IERlc3RpbmF0aW9uIHBvaW50LlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS40Nzc4LCAtMC4wMDE1KTtcbiAqICAgICB2YXIgcDIgPSBwMS5kZXN0aW5hdGlvblBvaW50KDMwMC43LCA3Ljc5NCk7IC8vIHAyLnRvU3RyaW5nKCk6IDUxLjUxMzXCsE4sIDAwMC4wOTgzwrBXXG4gKi9cbkxhdExvbi5wcm90b3R5cGUuZGVzdGluYXRpb25Qb2ludCA9IGZ1bmN0aW9uKGJybmcsIGRpc3QpIHtcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI0xMXG5cbiAgICB2YXIgzrggPSBOdW1iZXIoYnJuZykudG9SYWRpYW5zKCk7XG4gICAgdmFyIM60ID0gTnVtYmVyKGRpc3QpIC8gdGhpcy5yYWRpdXM7IC8vIGFuZ3VsYXIgZGlzdGFuY2UgaW4gcmFkaWFuc1xuXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpO1xuICAgIHZhciDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcblxuICAgIHZhciDPhjIgPSBNYXRoLmFzaW4oIE1hdGguc2luKM+GMSkqTWF0aC5jb3MozrQpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM+GMSkqTWF0aC5zaW4ozrQpKk1hdGguY29zKM64KSApO1xuICAgIHZhciDOuzIgPSDOuzEgKyBNYXRoLmF0YW4yKE1hdGguc2luKM64KSpNYXRoLnNpbijOtCkqTWF0aC5jb3Moz4YxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MozrQpLU1hdGguc2luKM+GMSkqTWF0aC5zaW4oz4YyKSk7XG4gICAgzrsyID0gKM67MiszKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjIudG9EZWdyZWVzKCksIM67Mi50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcG9pbnQgb2YgaW50ZXJzZWN0aW9uIG9mIHR3byBwYXRocyBkZWZpbmVkIGJ5IHBvaW50IGFuZCBiZWFyaW5nLlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHAxIC0gRmlyc3QgcG9pbnQuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nMSAtIEluaXRpYWwgYmVhcmluZyBmcm9tIGZpcnN0IHBvaW50LlxuICogQHBhcmFtICAge0xhdExvbn0gcDIgLSBTZWNvbmQgcG9pbnQuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nMiAtIEluaXRpYWwgYmVhcmluZyBmcm9tIHNlY29uZCBwb2ludC5cbiAqIEByZXR1cm5zIHtMYXRMb259IERlc3RpbmF0aW9uIHBvaW50IChudWxsIGlmIG5vIHVuaXF1ZSBpbnRlcnNlY3Rpb24gZGVmaW5lZCkuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBMYXRMb24oNTEuODg1MywgMC4yNTQ1KSwgYnJuZzEgPSAxMDguNTQ3O1xuICogICAgIHZhciBwMiA9IExhdExvbig0OS4wMDM0LCAyLjU3MzUpLCBicm5nMiA9ICAzMi40MzU7XG4gKiAgICAgdmFyIHBJbnQgPSBMYXRMb24uaW50ZXJzZWN0aW9uKHAxLCBicm5nMSwgcDIsIGJybmcyKTsgLy8gcEludC50b1N0cmluZygpOiA1MC45MDc2wrBOLCAwMDQuNTA4NMKwRVxuICovXG5MYXRMb24uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24ocDEsIGJybmcxLCBwMiwgYnJuZzIpIHtcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI0ludGVyc2VjdGlvblxuXG4gICAgdmFyIM+GMSA9IHAxLmxhdC50b1JhZGlhbnMoKSwgzrsxID0gcDEubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDPhjIgPSBwMi5sYXQudG9SYWRpYW5zKCksIM67MiA9IHAyLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgzrgxMyA9IE51bWJlcihicm5nMSkudG9SYWRpYW5zKCksIM64MjMgPSBOdW1iZXIoYnJuZzIpLnRvUmFkaWFucygpO1xuICAgIHZhciDOlM+GID0gz4YyLc+GMSwgzpTOuyA9IM67Mi3OuzE7XG5cbiAgICB2YXIgzrQxMiA9IDIqTWF0aC5hc2luKCBNYXRoLnNxcnQoIE1hdGguc2luKM6Uz4YvMikqTWF0aC5zaW4ozpTPhi8yKSArXG4gICAgICAgIE1hdGguY29zKM+GMSkqTWF0aC5jb3Moz4YyKSpNYXRoLnNpbijOlM67LzIpKk1hdGguc2luKM6UzrsvMikgKSApO1xuICAgIGlmICjOtDEyID09IDApIHJldHVybiBudWxsO1xuXG4gICAgLy8gaW5pdGlhbC9maW5hbCBiZWFyaW5ncyBiZXR3ZWVuIHBvaW50c1xuICAgIHZhciDOuDEgPSBNYXRoLmFjb3MoICggTWF0aC5zaW4oz4YyKSAtIE1hdGguc2luKM+GMSkqTWF0aC5jb3MozrQxMikgKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAoIE1hdGguc2luKM60MTIpKk1hdGguY29zKM+GMSkgKSApO1xuICAgIGlmIChpc05hTijOuDEpKSDOuDEgPSAwOyAvLyBwcm90ZWN0IGFnYWluc3Qgcm91bmRpbmdcbiAgICB2YXIgzrgyID0gTWF0aC5hY29zKCAoIE1hdGguc2luKM+GMSkgLSBNYXRoLnNpbijPhjIpKk1hdGguY29zKM60MTIpICkgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKCBNYXRoLnNpbijOtDEyKSpNYXRoLmNvcyjPhjIpICkgKTtcblxuICAgIHZhciDOuDEyLCDOuDIxO1xuICAgIGlmIChNYXRoLnNpbijOuzItzrsxKSA+IDApIHtcbiAgICAgICAgzrgxMiA9IM64MTtcbiAgICAgICAgzrgyMSA9IDIqTWF0aC5QSSAtIM64MjtcbiAgICB9IGVsc2Uge1xuICAgICAgICDOuDEyID0gMipNYXRoLlBJIC0gzrgxO1xuICAgICAgICDOuDIxID0gzrgyO1xuICAgIH1cblxuICAgIHZhciDOsTEgPSAozrgxMyAtIM64MTIgKyBNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gYW5nbGUgMi0xLTNcbiAgICB2YXIgzrEyID0gKM64MjEgLSDOuDIzICsgTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIGFuZ2xlIDEtMi0zXG5cbiAgICBpZiAoTWF0aC5zaW4ozrExKT09MCAmJiBNYXRoLnNpbijOsTIpPT0wKSByZXR1cm4gbnVsbDsgLy8gaW5maW5pdGUgaW50ZXJzZWN0aW9uc1xuICAgIGlmIChNYXRoLnNpbijOsTEpKk1hdGguc2luKM6xMikgPCAwKSByZXR1cm4gbnVsbDsgICAgICAvLyBhbWJpZ3VvdXMgaW50ZXJzZWN0aW9uXG5cbiAgICAvL86xMSA9IE1hdGguYWJzKM6xMSk7XG4gICAgLy/OsTIgPSBNYXRoLmFicyjOsTIpO1xuICAgIC8vIC4uLiBFZCBXaWxsaWFtcyB0YWtlcyBhYnMgb2YgzrExL86xMiwgYnV0IHNlZW1zIHRvIGJyZWFrIGNhbGN1bGF0aW9uP1xuXG4gICAgdmFyIM6xMyA9IE1hdGguYWNvcyggLU1hdGguY29zKM6xMSkqTWF0aC5jb3MozrEyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5zaW4ozrExKSpNYXRoLnNpbijOsTIpKk1hdGguY29zKM60MTIpICk7XG4gICAgdmFyIM60MTMgPSBNYXRoLmF0YW4yKCBNYXRoLnNpbijOtDEyKSpNYXRoLnNpbijOsTEpKk1hdGguc2luKM6xMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM6xMikrTWF0aC5jb3MozrExKSpNYXRoLmNvcyjOsTMpICk7XG4gICAgdmFyIM+GMyA9IE1hdGguYXNpbiggTWF0aC5zaW4oz4YxKSpNYXRoLmNvcyjOtDEzKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjPhjEpKk1hdGguc2luKM60MTMpKk1hdGguY29zKM64MTMpICk7XG4gICAgdmFyIM6UzrsxMyA9IE1hdGguYXRhbjIoIE1hdGguc2luKM64MTMpKk1hdGguc2luKM60MTMpKk1hdGguY29zKM+GMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjOtDEzKS1NYXRoLnNpbijPhjEpKk1hdGguc2luKM+GMykgKTtcbiAgICB2YXIgzrszID0gzrsxICsgzpTOuzEzO1xuICAgIM67MyA9ICjOuzMrMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxuXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YzLnRvRGVncmVlcygpLCDOuzMudG9EZWdyZWVzKCkpO1xufTtcblxuXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGlzdGFuY2UgdHJhdmVsbGluZyBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludCBhbG9uZyBhIHJodW1iIGxpbmUuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBEaXN0YW5jZSBpbiBrbSBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIGRlc3RpbmF0aW9uIHBvaW50IChvbiBzcGhlcmUgb2YgJ3RoaXMnIHJhZGl1cykuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUxLjEyNywgMS4zMzgpLCBwMiA9IG5ldyBMYXRMb24oNTAuOTY0LCAxLjg1Myk7XG4gKiAgICAgdmFyIGQgPSBwMS5kaXN0YW5jZVRvKHAyKTsgLy8gZC50b1ByZWNpc2lvbig0KTogNDAuMzFcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5yaHVtYkRpc3RhbmNlVG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIC8vIHNlZSBodHRwOi8vd2lsbGlhbXMuYmVzdC52d2gubmV0L2F2Zm9ybS5odG0jUmh1bWJcblxuICAgIHZhciBSID0gdGhpcy5yYWRpdXM7XG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6Uz4YgPSDPhjIgLSDPhjE7XG4gICAgdmFyIM6UzrsgPSBNYXRoLmFicyhwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xuICAgIC8vIGlmIGRMb24gb3ZlciAxODDCsCB0YWtlIHNob3J0ZXIgcmh1bWIgbGluZSBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW46XG4gICAgaWYgKE1hdGguYWJzKM6UzrspID4gTWF0aC5QSSkgzpTOuyA9IM6Uzrs+MCA/IC0oMipNYXRoLlBJLc6UzrspIDogKDIqTWF0aC5QSSvOlM67KTtcblxuICAgIC8vIG9uIE1lcmNhdG9yIHByb2plY3Rpb24sIGxvbmdpdHVkZSBkaXN0YW5jZXMgc2hyaW5rIGJ5IGxhdGl0dWRlOyBxIGlzIHRoZSAnc3RyZXRjaCBmYWN0b3InXG4gICAgLy8gcSBiZWNvbWVzIGlsbC1jb25kaXRpb25lZCBhbG9uZyBFLVcgbGluZSAoMC8wKTsgdXNlIGVtcGlyaWNhbCB0b2xlcmFuY2UgdG8gYXZvaWQgaXRcbiAgICB2YXIgzpTPiCA9IE1hdGgubG9nKE1hdGgudGFuKM+GMi8yK01hdGguUEkvNCkvTWF0aC50YW4oz4YxLzIrTWF0aC5QSS80KSk7XG4gICAgdmFyIHEgPSBNYXRoLmFicyjOlM+IKSA+IDEwZS0xMiA/IM6Uz4YvzpTPiCA6IE1hdGguY29zKM+GMSk7XG5cbiAgICAvLyBkaXN0YW5jZSBpcyBweXRoYWdvcmFzIG9uICdzdHJldGNoZWQnIE1lcmNhdG9yIHByb2plY3Rpb25cbiAgICB2YXIgzrQgPSBNYXRoLnNxcnQozpTPhirOlM+GICsgcSpxKs6UzrsqzpTOuyk7IC8vIGFuZ3VsYXIgZGlzdGFuY2UgaW4gcmFkaWFuc1xuICAgIHZhciBkaXN0ID0gzrQgKiBSO1xuXG4gICAgcmV0dXJuIGRpc3Q7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgYmVhcmluZyBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludCBhbG9uZyBhIHJodW1iIGxpbmUuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBCZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCksIHAyID0gbmV3IExhdExvbig1MC45NjQsIDEuODUzKTtcbiAqICAgICB2YXIgZCA9IHAxLnJodW1iQmVhcmluZ1RvKHAyKTsgLy8gZC50b0ZpeGVkKDEpOiAxMTYuN1xuICovXG5MYXRMb24ucHJvdG90eXBlLnJodW1iQmVhcmluZ1RvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKTtcbiAgICB2YXIgzpTOuyA9IChwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xuICAgIC8vIGlmIGRMb24gb3ZlciAxODDCsCB0YWtlIHNob3J0ZXIgcmh1bWIgbGluZSBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW46XG4gICAgaWYgKE1hdGguYWJzKM6UzrspID4gTWF0aC5QSSkgzpTOuyA9IM6Uzrs+MCA/IC0oMipNYXRoLlBJLc6UzrspIDogKDIqTWF0aC5QSSvOlM67KTtcblxuICAgIHZhciDOlM+IID0gTWF0aC5sb2coTWF0aC50YW4oz4YyLzIrTWF0aC5QSS80KS9NYXRoLnRhbijPhjEvMitNYXRoLlBJLzQpKTtcblxuICAgIHZhciDOuCA9IE1hdGguYXRhbjIozpTOuywgzpTPiCk7XG5cbiAgICByZXR1cm4gKM64LnRvRGVncmVlcygpKzM2MCkgJSAzNjA7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGVzdGluYXRpb24gcG9pbnQgaGF2aW5nIHRyYXZlbGxlZCBhbG9uZyBhIHJodW1iIGxpbmUgZnJvbSAndGhpcycgcG9pbnQgdGhlIGdpdmVuXG4gKiBkaXN0YW5jZSBvbiB0aGUgIGdpdmVuIGJlYXJpbmcuXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gYnJuZyAtIEJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxuICogQHBhcmFtICAge251bWJlcn0gZGlzdCAtIERpc3RhbmNlIGluIGttIChvbiBzcGhlcmUgb2YgJ3RoaXMnIHJhZGl1cykuXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBEZXN0aW5hdGlvbiBwb2ludC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCk7XG4gKiAgICAgdmFyIHAyID0gcDEucmh1bWJEZXN0aW5hdGlvblBvaW50KDExNi43LCA0MC4zMSk7IC8vIHAyLnRvU3RyaW5nKCk6IDUwLjk2NDHCsE4sIDAwMS44NTMxwrBFXG4gKi9cbkxhdExvbi5wcm90b3R5cGUucmh1bWJEZXN0aW5hdGlvblBvaW50ID0gZnVuY3Rpb24oYnJuZywgZGlzdCkge1xuICAgIHZhciDOtCA9IE51bWJlcihkaXN0KSAvIHRoaXMucmFkaXVzOyAvLyBhbmd1bGFyIGRpc3RhbmNlIGluIHJhZGlhbnNcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDOuCA9IE51bWJlcihicm5nKS50b1JhZGlhbnMoKTtcblxuICAgIHZhciDOlM+GID0gzrQgKiBNYXRoLmNvcyjOuCk7XG5cbiAgICB2YXIgz4YyID0gz4YxICsgzpTPhjtcbiAgICAvLyBjaGVjayBmb3Igc29tZSBkYWZ0IGJ1Z2dlciBnb2luZyBwYXN0IHRoZSBwb2xlLCBub3JtYWxpc2UgbGF0aXR1ZGUgaWYgc29cbiAgICBpZiAoTWF0aC5hYnMoz4YyKSA+IE1hdGguUEkvMikgz4YyID0gz4YyPjAgPyBNYXRoLlBJLc+GMiA6IC1NYXRoLlBJLc+GMjtcblxuICAgIHZhciDOlM+IID0gTWF0aC5sb2coTWF0aC50YW4oz4YyLzIrTWF0aC5QSS80KS9NYXRoLnRhbijPhjEvMitNYXRoLlBJLzQpKTtcbiAgICB2YXIgcSA9IE1hdGguYWJzKM6Uz4gpID4gMTBlLTEyID8gzpTPhiAvIM6Uz4ggOiBNYXRoLmNvcyjPhjEpOyAvLyBFLVcgY291cnNlIGJlY29tZXMgaWxsLWNvbmRpdGlvbmVkIHdpdGggMC8wXG5cbiAgICB2YXIgzpTOuyA9IM60Kk1hdGguc2luKM64KS9xO1xuXG4gICAgdmFyIM67MiA9IM67MSArIM6Uzrs7XG5cbiAgICDOuzIgPSAozrsyICsgMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxuXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YyLnRvRGVncmVlcygpLCDOuzIudG9EZWdyZWVzKCkpO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxveG9kcm9taWMgbWlkcG9pbnQgKGFsb25nIGEgcmh1bWIgbGluZSkgYmV0d2VlbiAndGhpcycgcG9pbnQgYW5kIHNlY29uZCBwb2ludC5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBzZWNvbmQgcG9pbnQuXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBNaWRwb2ludCBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIHNlY29uZCBwb2ludC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCksIHAyID0gbmV3IExhdExvbig1MC45NjQsIDEuODUzKTtcbiAqICAgICB2YXIgcDIgPSBwMS5yaHVtYk1pZHBvaW50VG8ocDIpOyAvLyBwMi50b1N0cmluZygpOiA1MS4wNDU1wrBOLCAwMDEuNTk1N8KwRVxuICovXG5MYXRMb24ucHJvdG90eXBlLnJodW1iTWlkcG9pbnRUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgLy8gaHR0cDovL21hdGhmb3J1bS5vcmcva2IvbWVzc2FnZS5qc3BhP21lc3NhZ2VJRD0xNDg4MzdcblxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgzrsxID0gdGhpcy5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKSwgzrsyID0gcG9pbnQubG9uLnRvUmFkaWFucygpO1xuXG4gICAgaWYgKE1hdGguYWJzKM67Mi3OuzEpID4gTWF0aC5QSSkgzrsxICs9IDIqTWF0aC5QSTsgLy8gY3Jvc3NpbmcgYW50aS1tZXJpZGlhblxuXG4gICAgdmFyIM+GMyA9ICjPhjErz4YyKS8yO1xuICAgIHZhciBmMSA9IE1hdGgudGFuKE1hdGguUEkvNCArIM+GMS8yKTtcbiAgICB2YXIgZjIgPSBNYXRoLnRhbihNYXRoLlBJLzQgKyDPhjIvMik7XG4gICAgdmFyIGYzID0gTWF0aC50YW4oTWF0aC5QSS80ICsgz4YzLzIpO1xuICAgIHZhciDOuzMgPSAoICjOuzItzrsxKSpNYXRoLmxvZyhmMykgKyDOuzEqTWF0aC5sb2coZjIpIC0gzrsyKk1hdGgubG9nKGYxKSApIC8gTWF0aC5sb2coZjIvZjEpO1xuXG4gICAgaWYgKCFpc0Zpbml0ZSjOuzMpKSDOuzMgPSAozrsxK867MikvMjsgLy8gcGFyYWxsZWwgb2YgbGF0aXR1ZGVcblxuICAgIM67MyA9ICjOuzMgKyAzKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjMudG9EZWdyZWVzKCksIM67My50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgJ3RoaXMnIHBvaW50LCBmb3JtYXR0ZWQgYXMgZGVncmVlcywgZGVncmVlcyttaW51dGVzLCBvclxuICogZGVncmVlcyttaW51dGVzK3NlY29uZHMuXG4gKlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gRm9ybWF0IHBvaW50IGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSAtIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IENvbW1hLXNlcGFyYXRlZCBsYXRpdHVkZS9sb25naXR1ZGUuXG4gKi9cbkxhdExvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbihmb3JtYXQsIGRwKSB7XG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgPT0gJ3VuZGVmaW5lZCcpIGZvcm1hdCA9ICdkbXMnO1xuXG4gICAgcmV0dXJuIEdlby50b0xhdCh0aGlzLmxhdCwgZm9ybWF0LCBkcCkgKyAnLCAnICsgR2VvLnRvTG9uKHRoaXMubG9uLCBmb3JtYXQsIGRwKTtcbn07XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuXG5cbi8qKiBFeHRlbmQgTnVtYmVyIG9iamVjdCB3aXRoIG1ldGhvZCB0byBjb252ZXJ0IG51bWVyaWMgZGVncmVlcyB0byByYWRpYW5zICovXG5pZiAodHlwZW9mIE51bWJlci5wcm90b3R5cGUudG9SYWRpYW5zID09ICd1bmRlZmluZWQnKSB7XG4gICAgTnVtYmVyLnByb3RvdHlwZS50b1JhZGlhbnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgKiBNYXRoLlBJIC8gMTgwOyB9O1xufVxuXG5cbi8qKiBFeHRlbmQgTnVtYmVyIG9iamVjdCB3aXRoIG1ldGhvZCB0byBjb252ZXJ0IHJhZGlhbnMgdG8gbnVtZXJpYyAoc2lnbmVkKSBkZWdyZWVzICovXG5pZiAodHlwZW9mIE51bWJlci5wcm90b3R5cGUudG9EZWdyZWVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgTnVtYmVyLnByb3RvdHlwZS50b0RlZ3JlZXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgKiAxODAgLyBNYXRoLlBJOyB9O1xufVxuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cbmlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IExhdExvbjsgLy8gQ29tbW9uSlNcbmlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFsnR2VvJ10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gTGF0TG9uOyB9KTsgLy8gQU1EXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qXHJcbiAqIFF1YWRUcmVlIEltcGxlbWVudGF0aW9uIGluIEphdmFTY3JpcHRcclxuICogQGF1dGhvcjogc2lsZmxvdyA8aHR0cHM6Ly9naXRodWIuY29tL3NpbGZsb3c+XHJcbiAqXHJcbiAqIFVzYWdlOlxyXG4gKiBUbyBjcmVhdGUgYSBuZXcgZW1wdHkgUXVhZHRyZWUsIGRvIHRoaXM6XHJcbiAqIHZhciB0cmVlID0gUVVBRC5pbml0KGFyZ3MpXHJcbiAqXHJcbiAqIGFyZ3MgPSB7XHJcbiAqICAgIC8vIG1hbmRhdG9yeSBmaWVsZHNcclxuICogICAgeCA6IHggY29vcmRpbmF0ZVxyXG4gKiAgICB5IDogeSBjb29yZGluYXRlXHJcbiAqICAgIHcgOiB3aWR0aFxyXG4gKiAgICBoIDogaGVpZ2h0XHJcbiAqXHJcbiAqICAgIC8vIG9wdGlvbmFsIGZpZWxkc1xyXG4gKiAgICBtYXhDaGlsZHJlbiA6IG1heCBjaGlsZHJlbiBwZXIgbm9kZVxyXG4gKiAgICBtYXhEZXB0aCA6IG1heCBkZXB0aCBvZiB0aGUgdHJlZVxyXG4gKn1cclxuICpcclxuICogQVBJOlxyXG4gKiB0cmVlLmluc2VydCgpIGFjY2VwdHMgYXJyYXlzIG9yIHNpbmdsZSBpdGVtc1xyXG4gKiBldmVyeSBpdGVtIG11c3QgaGF2ZSBhIC54LCAueSwgLncsIGFuZCAuaCBwcm9wZXJ0eS4gaWYgdGhleSBkb24ndCwgdGhlIHRyZWUgd2lsbCBicmVhay5cclxuICpcclxuICogdHJlZS5yZXRyaWV2ZShzZWxlY3RvciwgY2FsbGJhY2spIGNhbGxzIHRoZSBjYWxsYmFjayBmb3IgYWxsIG9iamVjdHMgdGhhdCBhcmUgaW5cclxuICogdGhlIHNhbWUgcmVnaW9uIG9yIG92ZXJsYXBwaW5nLlxyXG4gKlxyXG4gKiB0cmVlLmNsZWFyKCkgcmVtb3ZlcyBhbGwgaXRlbXMgZnJvbSB0aGUgcXVhZHRyZWUuXHJcbiAqL1xyXG5cclxudmFyIFFVQUQgPSB7fTsgLy8gZ2xvYmFsIHZhciBmb3IgdGhlIHF1YWR0cmVlXHJcblxyXG5RVUFELmluaXQgPSBmdW5jdGlvbiAoYXJncykge1xyXG5cclxuICAgIHZhciBub2RlO1xyXG4gICAgdmFyIFRPUF9MRUZUICAgICA9IDA7XHJcbiAgICB2YXIgVE9QX1JJR0hUICAgID0gMTtcclxuICAgIHZhciBCT1RUT01fTEVGVCAgPSAyO1xyXG4gICAgdmFyIEJPVFRPTV9SSUdIVCA9IDM7XHJcbiAgICB2YXIgUEFSRU5UICAgICAgID0gNDtcclxuXHJcbiAgICAvLyBhc3NpZ24gZGVmYXVsdCB2YWx1ZXNcclxuICAgIGFyZ3MubWF4Q2hpbGRyZW4gPSBhcmdzLm1heENoaWxkcmVuIHx8IDI7XHJcbiAgICBhcmdzLm1heERlcHRoID0gYXJncy5tYXhEZXB0aCB8fCA0O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm9kZSBjcmVhdG9yLiBZb3Ugc2hvdWxkIG5ldmVyIGNyZWF0ZSBhIG5vZGUgbWFudWFsbHkuIHRoZSBhbGdvcml0aG0gdGFrZXNcclxuICAgICAqIGNhcmUgb2YgdGhhdCBmb3IgeW91LlxyXG4gICAgICovXHJcbiAgICBub2RlID0gZnVuY3Rpb24gKHgsIHksIHcsIGgsIGRlcHRoLCBtYXhDaGlsZHJlbiwgbWF4RGVwdGgpIHtcclxuXHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW10sIC8vIGhvbGRzIGFsbCBpdGVtc1xyXG4gICAgICAgICAgICBub2RlcyA9IFtdOyAvLyBob2xkcyBhbGwgY2hpbGQgbm9kZXNcclxuXHJcbiAgICAgICAgLy8gcmV0dXJucyBhIGZyZXNoIG5vZGUgb2JqZWN0XHJcbiAgICAgICAgcmV0dXJuIHtcclxuXHJcbiAgICAgICAgICAgIHggOiB4LCAvLyB0b3AgbGVmdCBwb2ludFxyXG4gICAgICAgICAgICB5IDogeSwgLy8gdG9wIHJpZ2h0IHBvaW50XHJcbiAgICAgICAgICAgIHcgOiB3LCAvLyB3aWR0aFxyXG4gICAgICAgICAgICBoIDogaCwgLy8gaGVpZ2h0XHJcbiAgICAgICAgICAgIGRlcHRoIDogZGVwdGgsIC8vIGRlcHRoIGxldmVsIG9mIHRoZSBub2RlXHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogaXRlcmF0ZXMgYWxsIGl0ZW1zIHRoYXQgbWF0Y2ggdGhlIHNlbGVjdG9yIGFuZCBpbnZva2VzIHRoZSBzdXBwbGllZCBjYWxsYmFjayBvbiB0aGVtLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgcmV0cmlldmU6IGZ1bmN0aW9uKGl0ZW0sIGNhbGxiYWNrLCBpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgKGluc3RhbmNlKSA/IGNhbGxiYWNrLmNhbGwoaW5zdGFuY2UsIGl0ZW1zW2ldKSA6IGNhbGxiYWNrKGl0ZW1zW2ldKTsgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBub2RlIGhhcyBzdWJub2Rlc1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgcmV0cmlldmUgb24gYWxsIG1hdGNoaW5nIHN1Ym5vZGVzXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maW5kT3ZlcmxhcHBpbmdOb2RlcyhpdGVtLCBmdW5jdGlvbihkaXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNbZGlyXS5yZXRyaWV2ZShpdGVtLCBjYWxsYmFjaywgaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIEFkZHMgYSBuZXcgSXRlbSB0byB0aGUgbm9kZS5cclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogSWYgdGhlIG5vZGUgYWxyZWFkeSBoYXMgc3Vibm9kZXMsIHRoZSBpdGVtIGdldHMgcHVzaGVkIGRvd24gb25lIGxldmVsLlxyXG4gICAgICAgICAgICAgKiBJZiB0aGUgaXRlbSBkb2VzIG5vdCBmaXQgaW50byB0aGUgc3Vibm9kZXMsIGl0IGdldHMgc2F2ZWQgaW4gdGhlXHJcbiAgICAgICAgICAgICAqIFwiY2hpbGRyZW5cIi1hcnJheS5cclxuICAgICAgICAgICAgICpcclxuICAgICAgICAgICAgICogSWYgdGhlIG1heENoaWxkcmVuIGxpbWl0IGlzIGV4Y2VlZGVkIGFmdGVyIGluc2VydGluZyB0aGUgaXRlbSxcclxuICAgICAgICAgICAgICogdGhlIG5vZGUgZ2V0cyBkaXZpZGVkIGFuZCBhbGwgaXRlbXMgaW5zaWRlIHRoZSBcImNoaWxkcmVuXCItYXJyYXkgZ2V0XHJcbiAgICAgICAgICAgICAqIHB1c2hlZCBkb3duIHRvIHRoZSBuZXcgc3Vibm9kZXMuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBpbnNlcnQgOiBmdW5jdGlvbiAoaXRlbSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIG5vZGUgaW4gd2hpY2ggdGhlIGl0ZW0gZml0cyBiZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IHRoaXMuZmluZEluc2VydE5vZGUoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IFBBUkVOVCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgaXRlbSBkb2VzIG5vdCBmaXQsIHB1c2ggaXQgaW50byB0aGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hpbGRyZW4gYXJyYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXS5pbnNlcnQoaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vZGl2aWRlIHRoZSBub2RlIGlmIG1heENoaWxkcmVuIGlzIGV4Y2VlZGVkIGFuZCBtYXhEZXB0aCBpcyBub3QgcmVhY2hlZFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtcy5sZW5ndGggPiBtYXhDaGlsZHJlbiAmJiB0aGlzLmRlcHRoIDwgbWF4RGVwdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXZpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogRmluZCBhIG5vZGUgdGhlIGl0ZW0gc2hvdWxkIGJlIGluc2VydGVkIGluLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgZmluZEluc2VydE5vZGUgOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ueCArIGl0ZW0udyA8IHggKyAodyAvIDIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSArIGl0ZW0uaCA8IHkgKyAoaCAvIDIpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBUT1BfTEVGVDtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55ID49IHkgKyAoaCAvIDIpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBCT1RUT01fTEVGVDtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUEFSRU5UO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS54ID49IHggKyAodyAvIDIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSArIGl0ZW0uaCA8IHkgKyAoaCAvIDIpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBUT1BfUklHSFQ7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSA+PSB5ICsgKGggLyAyKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gQk9UVE9NX1JJR0hUO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQQVJFTlQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFBBUkVOVDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBGaW5kcyB0aGUgcmVnaW9ucyB0aGUgaXRlbSBvdmVybGFwcyB3aXRoLiBTZWUgY29uc3RhbnRzIGRlZmluZWRcclxuICAgICAgICAgICAgICogYWJvdmUuIFRoZSBjYWxsYmFjayBpcyBjYWxsZWQgZm9yIGV2ZXJ5IHJlZ2lvbiB0aGUgaXRlbSBvdmVybGFwcy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGZpbmRPdmVybGFwcGluZ05vZGVzIDogZnVuY3Rpb24gKGl0ZW0sIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBsZWZ0XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS54IDwgeCArICh3IC8gMikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS55IDwgeSArIChoIC8gMikpIHtcclxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soVE9QX0xFRlQpO1xyXG5cdFx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnkgKyBpdGVtLmggPj0geSArIGggLyAyKSB7XHJcblx0XHRcdFx0XHRcdGNhbGxiYWNrKEJPVFRPTV9MRUZUKTtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS54ICsgaXRlbS53ID49IHggKyAodyAvIDIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSA8IHkgKyAoaCAvIDIpKSB7XHJcblx0XHRcdFx0XHRcdGNhbGxiYWNrKFRPUF9SSUdIVCk7XHJcblx0XHRcdFx0XHR9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ueSArIGl0ZW0uaCA+PSB5ICsgaCAvIDIpIHtcclxuXHRcdFx0XHRcdFx0Y2FsbGJhY2soQk9UVE9NX1JJR0hUKTtcclxuXHRcdFx0XHRcdH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBEaXZpZGVzIHRoZSBjdXJyZW50IG5vZGUgaW50byBmb3VyIHN1Ym5vZGVzIGFuZCBhZGRzIHRoZW1cclxuICAgICAgICAgICAgICogdG8gdGhlIG5vZGVzIGFycmF5IG9mIHRoZSBjdXJyZW50IG5vZGUuIFRoZW4gcmVpbnNlcnRzIGFsbFxyXG4gICAgICAgICAgICAgKiBjaGlsZHJlbi5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGRpdmlkZSA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB3aWR0aCwgaGVpZ2h0LCBpLCBvbGRDaGlsZHJlbjtcclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHJlbkRlcHRoID0gdGhpcy5kZXB0aCArIDE7XHJcbiAgICAgICAgICAgICAgICAvLyBzZXQgZGltZW5zaW9ucyBvZiB0aGUgbmV3IG5vZGVzXHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9ICh3IC8gMik7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSAoaCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRvcCBsZWZ0IG5vZGVcclxuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSh0aGlzLngsIHRoaXMueSwgd2lkdGgsIGhlaWdodCwgY2hpbGRyZW5EZXB0aCwgbWF4Q2hpbGRyZW4sIG1heERlcHRoKSk7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgdG9wIHJpZ2h0IG5vZGVcclxuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSh0aGlzLnggKyB3aWR0aCwgdGhpcy55LCB3aWR0aCwgaGVpZ2h0LCBjaGlsZHJlbkRlcHRoLCBtYXhDaGlsZHJlbiwgbWF4RGVwdGgpKTtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBib3R0b20gbGVmdCBub2RlXHJcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUodGhpcy54LCB0aGlzLnkgKyBoZWlnaHQsIHdpZHRoLCBoZWlnaHQsIGNoaWxkcmVuRGVwdGgsIG1heENoaWxkcmVuLCBtYXhEZXB0aCkpO1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGJvdHRvbSByaWdodCBub2RlXHJcbiAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUodGhpcy54ICsgd2lkdGgsIHRoaXMueSArIGhlaWdodCwgd2lkdGgsIGhlaWdodCwgY2hpbGRyZW5EZXB0aCwgbWF4Q2hpbGRyZW4sIG1heERlcHRoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgb2xkQ2hpbGRyZW4gPSBpdGVtcztcclxuICAgICAgICAgICAgICAgIGl0ZW1zID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2xkQ2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydChvbGRDaGlsZHJlbltpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogQ2xlYXJzIHRoZSBub2RlIGFuZCBhbGwgaXRzIHN1Ym5vZGVzLlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgY2xlYXIgOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0dmFyIGk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdG5vZGVzW2ldLmNsZWFyKCk7XHJcblx0XHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgaXRlbXMubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgIG5vZGVzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBjb252ZW5pZW5jZSBtZXRob2Q6IGlzIG5vdCB1c2VkIGluIHRoZSBjb3JlIGFsZ29yaXRobS5cclxuICAgICAgICAgICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgICAgICAqIHJldHVybnMgdGhpcyBub2RlcyBzdWJub2Rlcy4gdGhpcyBpcyB1c2Z1bCBpZiB3ZSB3YW50IHRvIGRvIHN0dWZmXHJcbiAgICAgICAgICAgICAqIHdpdGggdGhlIG5vZGVzLCBpLmUuIGFjY2Vzc2luZyB0aGUgYm91bmRzIG9mIHRoZSBub2RlcyB0byBkcmF3IHRoZW1cclxuICAgICAgICAgICAgICogb24gYSBjYW52YXMgZm9yIGRlYnVnZ2luZyBldGMuLi5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIGdldE5vZGVzIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVzLmxlbmd0aCA/IG5vZGVzIDogZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG5cclxuICAgICAgICByb290IDogKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUoYXJncy54LCBhcmdzLnksIGFyZ3MudywgYXJncy5oLCAwLCBhcmdzLm1heENoaWxkcmVuLCBhcmdzLm1heERlcHRoKTtcclxuICAgICAgICB9KCkpLFxyXG5cclxuICAgICAgICBpbnNlcnQgOiBmdW5jdGlvbiAoaXRlbSkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGxlbiwgaTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIGxlbiA9IGl0ZW0ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb290Lmluc2VydChpdGVtW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QuaW5zZXJ0KGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcmV0cmlldmUgOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNhbGxiYWNrLCBpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yb290LnJldHJpZXZlKHNlbGVjdG9yLCBjYWxsYmFjaywgaW5zdGFuY2UpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNsZWFyIDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QuY2xlYXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBRVUFEOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBhZGFwdGVyIHRvIHRyYW5zbGF0ZSBieSBvbmUgb2YgY2hvc2VuIHN0cmF0ZWd5ICovXG5cbnZhciBzZXR1cERvYyA9IHtcbiAgXCJnZXRUcmFuc2xhdGlvbnNcIjogXCJ0byBnZXQgdGV4dCB3aGljaCBhcmUgbm90IHRyYW5zbGF0ZWQgb24gY3VycmVudCBwYWdlLCB0YWtlIGNvbnNvbGUubG9nKHdpbmRvdy50b1RyYW5zbGF0ZSlcIixcbiAgXCJzZXR1cFN0cmF0ZWd5XCI6IFwiaXQgaXMgbmVjZXNzYXJ5IHNldCBzdHJhdGVneSBpbiByb290IG9mIGJ1bmRsZVwiXG59O1xuXG52YXIgc3RyYXRlZ3kgPSBudWxsO1xuXG5cblxudmFyIHRyID0gZnVuY3Rpb24gKG9yaWdpbmFsLCBrZXksIHZhbHVlcykge1xuICBpZiAoIXN0cmF0ZWd5KSB7XG4gICAgY29uc29sZS5lcnJvcihcIlRyYW5zbGF0aW9uIHN0cmF0ZWd5IGlzIG5vdCBzZXRcXG4gXCIrc2V0dXBEb2NbXCJzZXR1cFN0cmF0ZWd5XCJdKTtcbiAgICByZXR1cm4gb3JpZ2luYWw7XG4gIH1cbiAgcmV0dXJuIHN0cmF0ZWd5KG9yaWdpbmFsLCBrZXksIHZhbHVlcyk7XG59O1xuXG50ci5zZXRTdHJhdGVneSA9IGZ1bmN0aW9uIChuZXdTdHJhdGVneSkge1xuICBzdHJhdGVneSA9IG5ld1N0cmF0ZWd5O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0cjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIHRyID0gZnVuY3Rpb24gKG9yaWdpbmFsLGtleSx2YWx1ZXMpIHtcbiAgaWYgKCFrZXkpIHtcbiAgICBrZXkgPSBvcmlnaW5hbC50b0xvd2VyQ2FzZSgpLnRyaW0oKS5yZXBsYWNlKFwiIFwiLCBcIl9cIik7XG4gIH1cbiAgdmFyIHRyYW5zbGF0ZWQ7XG4gIC8vIHByZXZlbnQgdGhyb3dpbmcgZXhjZXB0aW9uIG9uIHdyb25nIHNwcmludGYgZm9ybWF0XG4gIHRyeSB7XG4gICAgdHJhbnNsYXRlZCA9ICQudCgnZm9ybV9zZWFyY2guJytrZXksIHtwb3N0UHJvY2VzczogJ3NwcmludGYnLCBzcHJpbnRmOiB2YWx1ZXN9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRyYW5zbGF0ZWQgPSBvcmlnaW5hbDtcbiAgfVxuICAvL05vdCBuaWNlLCBUT0RPIG1ha2Ugc29tZSBiZXR0ZXIgc29sdXRpb24gaG93IHRvIHBpY2sgcHJlZml4IGFuZCBmYWxsYmFjayB0byBjb21tb25cbiAgaWYgKHRyYW5zbGF0ZWQgPT0gJ2Zvcm1fc2VhcmNoLicra2V5KSB7XG4gICAgdHJ5IHtcbiAgICAgIHRyYW5zbGF0ZWQgPSAkLnQoJ2NvbW1vbi4nK2tleSwge3Bvc3RQcm9jZXNzOiAnc3ByaW50ZicsIHNwcmludGY6IHZhbHVlc30pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRyYW5zbGF0ZWQgPSBvcmlnaW5hbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJhbnNsYXRlZFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0cjtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudFF1ZXVlO1xuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG59XG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHF1ZXVlLnB1c2goZnVuKTtcbiAgICBpZiAoIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlICh0YXJnZXQsIHNyYykge1xuICAgIHZhciBhcnJheSA9IEFycmF5LmlzQXJyYXkoc3JjKVxuICAgIHZhciBkc3QgPSBhcnJheSAmJiBbXSB8fCB7fVxuXG4gICAgaWYgKGFycmF5KSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCBbXVxuICAgICAgICBkc3QgPSBkc3QuY29uY2F0KHRhcmdldClcbiAgICAgICAgc3JjLmZvckVhY2goZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbaV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZHN0W2ldID0gZVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBkc3RbaV0gPSBtZXJnZSh0YXJnZXRbaV0sIGUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZihlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0LnB1c2goZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IHRhcmdldFtrZXldXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5rZXlzKHNyYykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNyY1trZXldICE9PSAnb2JqZWN0JyB8fCAhc3JjW2tleV0pIHtcbiAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IHNyY1trZXldXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGRzdFtrZXldID0gc3JjW2tleV1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IG1lcmdlKHRhcmdldFtrZXldLCBzcmNba2V5XSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGRzdFxufVxuIiwiLy8gdmltOnRzPTQ6c3RzPTQ6c3c9NDpcbi8qIVxuICpcbiAqIENvcHlyaWdodCAyMDA5LTIwMTIgS3JpcyBLb3dhbCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIE1JVFxuICogbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9yYXcvbWFzdGVyL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHNlbGYuUSA9IGRlZmluaXRpb24oKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgZW52aXJvbm1lbnQgd2FzIG5vdCBhbnRpY2lhcHRlZCBieSBRLiBQbGVhc2UgZmlsZSBhIGJ1Zy5cIik7XG4gICAgfVxuXG59KShmdW5jdGlvbiAoKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGhhc1N0YWNrcyA9IGZhbHNlO1xudHJ5IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbn0gY2F0Y2ggKGUpIHtcbiAgICBoYXNTdGFja3MgPSAhIWUuc3RhY2s7XG59XG5cbi8vIEFsbCBjb2RlIGFmdGVyIHRoaXMgcG9pbnQgd2lsbCBiZSBmaWx0ZXJlZCBmcm9tIHN0YWNrIHRyYWNlcyByZXBvcnRlZFxuLy8gYnkgUS5cbnZhciBxU3RhcnRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcbnZhciBxRmlsZU5hbWU7XG5cbi8vIHNoaW1zXG5cbi8vIHVzZWQgZm9yIGZhbGxiYWNrIGluIFwiYWxsUmVzb2x2ZWRcIlxudmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fTtcblxuLy8gVXNlIHRoZSBmYXN0ZXN0IHBvc3NpYmxlIG1lYW5zIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm5cbi8vIG9mIHRoZSBldmVudCBsb29wLlxudmFyIG5leHRUaWNrID0oZnVuY3Rpb24gKCkge1xuICAgIC8vIGxpbmtlZCBsaXN0IG9mIHRhc2tzIChzaW5nbGUsIHdpdGggaGVhZCBub2RlKVxuICAgIHZhciBoZWFkID0ge3Rhc2s6IHZvaWQgMCwgbmV4dDogbnVsbH07XG4gICAgdmFyIHRhaWwgPSBoZWFkO1xuICAgIHZhciBmbHVzaGluZyA9IGZhbHNlO1xuICAgIHZhciByZXF1ZXN0VGljayA9IHZvaWQgMDtcbiAgICB2YXIgaXNOb2RlSlMgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgICAgICAvKiBqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cblxuICAgICAgICB3aGlsZSAoaGVhZC5uZXh0KSB7XG4gICAgICAgICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBoZWFkLnRhc2s7XG4gICAgICAgICAgICBoZWFkLnRhc2sgPSB2b2lkIDA7XG4gICAgICAgICAgICB2YXIgZG9tYWluID0gaGVhZC5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0YXNrKCk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gbm9kZSwgdW5jYXVnaHQgZXhjZXB0aW9ucyBhcmUgY29uc2lkZXJlZCBmYXRhbCBlcnJvcnMuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gc3luY2hyb25vdXNseSB0byBpbnRlcnJ1cHQgZmx1c2hpbmchXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gbGlzdGVuaW5nIFwidW5jYXVnaHRFeGNlcHRpb25cIiBldmVudHMgKGFzIGRvbWFpbnMgZG9lcykuXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gYXN5bmNocm9ub3VzbHkgdG8gYXZvaWQgc2xvdy1kb3ducy5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbmV4dFRpY2sgPSBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICB0YWlsID0gdGFpbC5uZXh0ID0ge1xuICAgICAgICAgICAgdGFzazogdGFzayxcbiAgICAgICAgICAgIGRvbWFpbjogaXNOb2RlSlMgJiYgcHJvY2Vzcy5kb21haW4sXG4gICAgICAgICAgICBuZXh0OiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgICAgICAvLyBOb2RlLmpzIGJlZm9yZSAwLjkuIE5vdGUgdGhhdCBzb21lIGZha2UtTm9kZSBlbnZpcm9ubWVudHMsIGxpa2UgdGhlXG4gICAgICAgIC8vIE1vY2hhIHRlc3QgcnVubmVyLCBpbnRyb2R1Y2UgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgLlxuICAgICAgICBpc05vZGVKUyA9IHRydWU7XG5cbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIC8vIEluIElFMTAsIE5vZGUuanMgMC45Kywgb3IgaHR0cHM6Ly9naXRodWIuY29tL05vYmxlSlMvc2V0SW1tZWRpYXRlXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZsdXNoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgICAgICAvLyBodHRwOi8vd3d3Lm5vbmJsb2NraW5nLmlvLzIwMTEvMDYvd2luZG93bmV4dHRpY2suaHRtbFxuICAgICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgICAvLyBBdCBsZWFzdCBTYWZhcmkgVmVyc2lvbiA2LjAuNSAoODUzNi4zMC4xKSBpbnRlcm1pdHRlbnRseSBjYW5ub3QgY3JlYXRlXG4gICAgICAgIC8vIHdvcmtpbmcgbWVzc2FnZSBwb3J0cyB0aGUgZmlyc3QgdGltZSBhIHBhZ2UgbG9hZHMuXG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSByZXF1ZXN0UG9ydFRpY2s7XG4gICAgICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlcXVlc3RQb3J0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE9wZXJhIHJlcXVpcmVzIHVzIHRvIHByb3ZpZGUgYSBtZXNzYWdlIHBheWxvYWQsIHJlZ2FyZGxlc3Mgb2ZcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgd2UgdXNlIGl0LlxuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgIHJlcXVlc3RQb3J0VGljaygpO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gb2xkIGJyb3dzZXJzXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRUaWNrO1xufSkoKTtcblxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxuLy8gbW9kaWZpY2F0aW9ucy5cbi8vIFRoZXJlIGlzIG5vIHNpdHVhdGlvbiB3aGVyZSB0aGlzIGlzIG5lY2Vzc2FyeS5cbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXG4vLyBkZWVwbHkgZnJvemVuIGFueXdheSwgYW5kIGlmIHlvdSBkb27igJl0IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsXG4vLyB0aGlzIGlzIGp1c3QgcGxhaW4gcGFyYW5vaWQuXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXG4vLyB0aGUgbWluaWZpZWQgY29kZSBieSByZWR1Y2luZyB4LmNhbGwoKSB0byBtZXJlbHkgeCgpXG4vLyBTZWUgTWFyayBNaWxsZXLigJlzIGV4cGxhbmF0aW9uIG9mIHdoYXQgdGhpcyBkb2VzLlxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGw7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGwuYXBwbHkoZiwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuLy8gVGhpcyBpcyBlcXVpdmFsZW50LCBidXQgc2xvd2VyOlxuLy8gdW5jdXJyeVRoaXMgPSBGdW5jdGlvbl9iaW5kLmJpbmQoRnVuY3Rpb25fYmluZC5jYWxsKTtcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXG5cbnZhciBhcnJheV9zbGljZSA9IHVuY3VycnlUaGlzKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG5cbnZhciBhcnJheV9yZWR1Y2UgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAvLyBjb25jZXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlLCBpZiBvbmUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBzZWVrIHRvIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXksIGFjY291bnRpbmdcbiAgICAgICAgICAgIC8vIGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCBpcyBpcyBhIHNwYXJzZSBhcnJheVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2lzID0gdGhpc1tpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkdWNlXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxuICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrKGJhc2lzLCB0aGlzW2luZGV4XSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBub3QgYSB2ZXJ5IGdvb2Qgc2hpbSwgYnV0IGdvb2QgZW5vdWdoIGZvciBvdXIgb25lIHVzZSBvZiBpdFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcCB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHNlbGYsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgY29sbGVjdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBpbmRleCwgc2VsZikpO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICByZXR1cm4gY29sbGVjdDtcbiAgICB9XG4pO1xuXG52YXIgb2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICByZXR1cm4gbmV3IFR5cGUoKTtcbn07XG5cbnZhciBvYmplY3RfaGFzT3duUHJvcGVydHkgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgb2JqZWN0X3RvU3RyaW5nID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBPYmplY3QodmFsdWUpO1xufVxuXG4vLyBnZW5lcmF0b3IgcmVsYXRlZCBzaGltc1xuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuZnVuY3Rpb24gaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikge1xuICAgIHJldHVybiAoXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxuICAgICAgICBleGNlcHRpb24gaW5zdGFuY2VvZiBRUmV0dXJuVmFsdWVcbiAgICApO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaGVscGVyIGFuZCBRLnJldHVybiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpblxuLy8gU3BpZGVyTW9ua2V5LlxudmFyIFFSZXR1cm5WYWx1ZTtcbmlmICh0eXBlb2YgUmV0dXJuVmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcbn0gZWxzZSB7XG4gICAgUVJldHVyblZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrICYmXG4gICAgICAgIGVycm9yLnN0YWNrLmluZGV4T2YoU1RBQ0tfSlVNUF9TRVBBUkFUT1IpID09PSAtMVxuICAgICkge1xuICAgICAgICB2YXIgc3RhY2tzID0gW107XG4gICAgICAgIGZvciAodmFyIHAgPSBwcm9taXNlOyAhIXA7IHAgPSBwLnNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHAuc3RhY2spIHtcbiAgICAgICAgICAgICAgICBzdGFja3MudW5zaGlmdChwLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGFja3MudW5zaGlmdChlcnJvci5zdGFjayk7XG5cbiAgICAgICAgdmFyIGNvbmNhdGVkU3RhY2tzID0gc3RhY2tzLmpvaW4oXCJcXG5cIiArIFNUQUNLX0pVTVBfU0VQQVJBVE9SICsgXCJcXG5cIik7XG4gICAgICAgIGVycm9yLnN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVyU3RhY2tTdHJpbmcoc3RhY2tTdHJpbmcpIHtcbiAgICB2YXIgbGluZXMgPSBzdGFja1N0cmluZy5zcGxpdChcIlxcblwiKTtcbiAgICB2YXIgZGVzaXJlZExpbmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2ldO1xuXG4gICAgICAgIGlmICghaXNJbnRlcm5hbEZyYW1lKGxpbmUpICYmICFpc05vZGVGcmFtZShsaW5lKSAmJiBsaW5lKSB7XG4gICAgICAgICAgICBkZXNpcmVkTGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzaXJlZExpbmVzLmpvaW4oXCJcXG5cIik7XG59XG5cbmZ1bmN0aW9uIGlzTm9kZUZyYW1lKHN0YWNrTGluZSkge1xuICAgIHJldHVybiBzdGFja0xpbmUuaW5kZXhPZihcIihtb2R1bGUuanM6XCIpICE9PSAtMSB8fFxuICAgICAgICAgICBzdGFja0xpbmUuaW5kZXhPZihcIihub2RlLmpzOlwiKSAhPT0gLTE7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpIHtcbiAgICAvLyBOYW1lZCBmdW5jdGlvbnM6IFwiYXQgZnVuY3Rpb25OYW1lIChmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlcilcIlxuICAgIC8vIEluIElFMTAgZnVuY3Rpb24gbmFtZSBjYW4gaGF2ZSBzcGFjZXMgKFwiQW5vbnltb3VzIGZ1bmN0aW9uXCIpIE9fb1xuICAgIHZhciBhdHRlbXB0MSA9IC9hdCAuKyBcXCgoLispOihcXGQrKTooPzpcXGQrKVxcKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDEpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MVsxXSwgTnVtYmVyKGF0dGVtcHQxWzJdKV07XG4gICAgfVxuXG4gICAgLy8gQW5vbnltb3VzIGZ1bmN0aW9uczogXCJhdCBmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQyID0gL2F0IChbXiBdKyk6KFxcZCspOig/OlxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mikge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQyWzFdLCBOdW1iZXIoYXR0ZW1wdDJbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBGaXJlZm94IHN0eWxlOiBcImZ1bmN0aW9uQGZpbGVuYW1lOmxpbmVOdW1iZXIgb3IgQGZpbGVuYW1lOmxpbmVOdW1iZXJcIlxuICAgIHZhciBhdHRlbXB0MyA9IC8uKkAoLispOihcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDMpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0M1sxXSwgTnVtYmVyKGF0dGVtcHQzWzJdKV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0ludGVybmFsRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgdmFyIGZpbGVOYW1lQW5kTGluZU51bWJlciA9IGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpO1xuXG4gICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBmaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICB2YXIgbGluZU51bWJlciA9IGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcblxuICAgIHJldHVybiBmaWxlTmFtZSA9PT0gcUZpbGVOYW1lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPj0gcVN0YXJ0aW5nTGluZSAmJlxuICAgICAgICBsaW5lTnVtYmVyIDw9IHFFbmRpbmdMaW5lO1xufVxuXG4vLyBkaXNjb3ZlciBvd24gZmlsZSBuYW1lIGFuZCBsaW5lIG51bWJlciByYW5nZSBmb3IgZmlsdGVyaW5nIHN0YWNrXG4vLyB0cmFjZXNcbmZ1bmN0aW9uIGNhcHR1cmVMaW5lKCkge1xuICAgIGlmICghaGFzU3RhY2tzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHZhciBsaW5lcyA9IGUuc3RhY2suc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIHZhciBmaXJzdExpbmUgPSBsaW5lc1swXS5pbmRleE9mKFwiQFwiKSA+IDAgPyBsaW5lc1sxXSA6IGxpbmVzWzJdO1xuICAgICAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKGZpcnN0TGluZSk7XG4gICAgICAgIGlmICghZmlsZU5hbWVBbmRMaW5lTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBxRmlsZU5hbWUgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMF07XG4gICAgICAgIHJldHVybiBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZXByZWNhdGUoY2FsbGJhY2ssIG5hbWUsIGFsdGVybmF0aXZlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICB0eXBlb2YgY29uc29sZS53YXJuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihuYW1lICsgXCIgaXMgZGVwcmVjYXRlZCwgdXNlIFwiICsgYWx0ZXJuYXRpdmUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGluc3RlYWQuXCIsIG5ldyBFcnJvcihcIlwiKS5zdGFjayk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8vIGVuZCBvZiBzaGltc1xuLy8gYmVnaW5uaW5nIG9mIHJlYWwgd29ya1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLCBwYXNzZXMgcHJvbWlzZXMgdGhyb3VnaCwgb3JcbiAqIGNvZXJjZXMgcHJvbWlzZXMgZnJvbSBkaWZmZXJlbnQgc3lzdGVtcy5cbiAqIEBwYXJhbSB2YWx1ZSBpbW1lZGlhdGUgcmVmZXJlbmNlIG9yIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gUSh2YWx1ZSkge1xuICAgIC8vIElmIHRoZSBvYmplY3QgaXMgYWxyZWFkeSBhIFByb21pc2UsIHJldHVybiBpdCBkaXJlY3RseS4gIFRoaXMgZW5hYmxlc1xuICAgIC8vIHRoZSByZXNvbHZlIGZ1bmN0aW9uIHRvIGJvdGggYmUgdXNlZCB0byBjcmVhdGVkIHJlZmVyZW5jZXMgZnJvbSBvYmplY3RzLFxuICAgIC8vIGJ1dCB0byB0b2xlcmFibHkgY29lcmNlIG5vbi1wcm9taXNlcyB0byBwcm9taXNlcy5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvLyBhc3NpbWlsYXRlIHRoZW5hYmxlc1xuICAgIGlmIChpc1Byb21pc2VBbGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvZXJjZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGwodmFsdWUpO1xuICAgIH1cbn1cblEucmVzb2x2ZSA9IFE7XG5cbi8qKlxuICogUGVyZm9ybXMgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm4gb2YgdGhlIGV2ZW50IGxvb3AuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0YXNrXG4gKi9cblEubmV4dFRpY2sgPSBuZXh0VGljaztcblxuLyoqXG4gKiBDb250cm9scyB3aGV0aGVyIG9yIG5vdCBsb25nIHN0YWNrIHRyYWNlcyB3aWxsIGJlIG9uXG4gKi9cblEubG9uZ1N0YWNrU3VwcG9ydCA9IGZhbHNlO1xuXG4vLyBlbmFibGUgbG9uZyBzdGFja3MgaWYgUV9ERUJVRyBpcyBzZXRcbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LlFfREVCVUcpIHtcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fSBvYmplY3QuXG4gKlxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcbiAqIHByb21pc2UuIFRvIGZ1bGZpbGwgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhbnkgdmFsdWUgdGhhdCBpc1xuICogbm90IGEgdGhlbmFibGUuIFRvIHJlamVjdCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGEgcmVqZWN0ZWRcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxuICogcHJvbWlzZSB0byBhbm90aGVyIHRoZW5hYmxlLCB0aHVzIHB1dHRpbmcgaXQgaW4gdGhlIHNhbWUgc3RhdGUsIGludm9rZVxuICogYHJlc29sdmVgIHdpdGggdGhhdCBvdGhlciB0aGVuYWJsZS5cbiAqL1xuUS5kZWZlciA9IGRlZmVyO1xuZnVuY3Rpb24gZGVmZXIoKSB7XG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxuICAgIC8vIGJlZW4gcmVzb2x2ZWQuICBJZiBpdCBpcyBcInVuZGVmaW5lZFwiLCBpdCBoYXMgYmVlbiByZXNvbHZlZC4gIEVhY2hcbiAgICAvLyBlbGVtZW50IG9mIHRoZSBtZXNzYWdlcyBhcnJheSBpcyBpdHNlbGYgYW4gYXJyYXkgb2YgY29tcGxldGUgYXJndW1lbnRzIHRvXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXG4gICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgYHJlc29sdmVgIGZ1bmN0aW9uIGJlY2F1c2UgaXQgaGFuZGxlcyBib3RoIGZ1bGx5XG4gICAgLy8gbm9uLXRoZW5hYmxlIHZhbHVlcyBhbmQgb3RoZXIgdGhlbmFibGVzIGdyYWNlZnVsbHkuXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9IG9iamVjdF9jcmVhdGUoZGVmZXIucHJvdG90eXBlKTtcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIG9wZXJhbmRzKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChvcGVyYW5kc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTk9URTogd2UgZG8gdGhlIGNoZWNrcyBmb3IgYHJlc29sdmVkUHJvbWlzZWAgaW4gZWFjaCBtZXRob2QsIGluc3RlYWQgb2ZcbiAgICAvLyBjb25zb2xpZGF0aW5nIHRoZW0gaW50byBgYmVjb21lYCwgc2luY2Ugb3RoZXJ3aXNlIHdlJ2QgY3JlYXRlIG5ld1xuICAgIC8vIHByb21pc2VzIHdpdGggdGhlIGxpbmVzIGBiZWNvbWUod2hhdGV2ZXIodmFsdWUpKWAuIFNlZSBlLmcuIEdILTI1Mi5cblxuICAgIGZ1bmN0aW9uIGJlY29tZShuZXdQcm9taXNlKSB7XG4gICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5ld1Byb21pc2U7XG4gICAgICAgIHByb21pc2Uuc291cmNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBhcnJheV9yZWR1Y2UobWVzc2FnZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ld1Byb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KG5ld1Byb21pc2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG5cbiAgICAgICAgbWVzc2FnZXMgPSB2b2lkIDA7XG4gICAgICAgIHByb2dyZXNzTGlzdGVuZXJzID0gdm9pZCAwO1xuICAgIH1cblxuICAgIGRlZmVycmVkLnByb21pc2UgPSBwcm9taXNlO1xuICAgIGRlZmVycmVkLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKFEodmFsdWUpKTtcbiAgICB9O1xuXG4gICAgZGVmZXJyZWQuZnVsZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUoZnVsZmlsbCh2YWx1ZSkpO1xuICAgIH07XG4gICAgZGVmZXJyZWQucmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUocmVqZWN0KHJlYXNvbikpO1xuICAgIH07XG4gICAgZGVmZXJyZWQubm90aWZ5ID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9ncmVzc0xpc3RlbmVycywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvZ3Jlc3NMaXN0ZW5lcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcihwcm9ncmVzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdm9pZCAwKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlZmVycmVkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBOb2RlLXN0eWxlIGNhbGxiYWNrIHRoYXQgd2lsbCByZXNvbHZlIG9yIHJlamVjdCB0aGUgZGVmZXJyZWRcbiAqIHByb21pc2UuXG4gKiBAcmV0dXJucyBhIG5vZGViYWNrXG4gKi9cbmRlZmVyLnByb3RvdHlwZS5tYWtlTm9kZVJlc29sdmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVycm9yLCB2YWx1ZSkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNlbGYucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG4vKipcbiAqIEBwYXJhbSByZXNvbHZlciB7RnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIG5vdGhpbmcgYW5kIGFjY2VwdHNcbiAqIHRoZSByZXNvbHZlLCByZWplY3QsIGFuZCBub3RpZnkgZnVuY3Rpb25zIGZvciBhIGRlZmVycmVkLlxuICogQHJldHVybnMgYSBwcm9taXNlIHRoYXQgbWF5IGJlIHJlc29sdmVkIHdpdGggdGhlIGdpdmVuIHJlc29sdmUgYW5kIHJlamVjdFxuICogZnVuY3Rpb25zLCBvciByZWplY3RlZCBieSBhIHRocm93biBleGNlcHRpb24gaW4gcmVzb2x2ZXJcbiAqL1xuUS5Qcm9taXNlID0gcHJvbWlzZTsgLy8gRVM2XG5RLnByb21pc2UgPSBwcm9taXNlO1xuZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlcikge1xuICAgIGlmICh0eXBlb2YgcmVzb2x2ZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVzb2x2ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QsIGRlZmVycmVkLm5vdGlmeSk7XG4gICAgfSBjYXRjaCAocmVhc29uKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxucHJvbWlzZS5yYWNlID0gcmFjZTsgLy8gRVM2XG5wcm9taXNlLmFsbCA9IGFsbDsgLy8gRVM2XG5wcm9taXNlLnJlamVjdCA9IHJlamVjdDsgLy8gRVM2XG5wcm9taXNlLnJlc29sdmUgPSBROyAvLyBFUzZcblxuLy8gWFhYIGV4cGVyaW1lbnRhbC4gIFRoaXMgbWV0aG9kIGlzIGEgd2F5IHRvIGRlbm90ZSB0aGF0IGEgbG9jYWwgdmFsdWUgaXNcbi8vIHNlcmlhbGl6YWJsZSBhbmQgc2hvdWxkIGJlIGltbWVkaWF0ZWx5IGRpc3BhdGNoZWQgdG8gYSByZW1vdGUgdXBvbiByZXF1ZXN0LFxuLy8gaW5zdGVhZCBvZiBwYXNzaW5nIGEgcmVmZXJlbmNlLlxuUS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSWYgdHdvIHByb21pc2VzIGV2ZW50dWFsbHkgZnVsZmlsbCB0byB0aGUgc2FtZSB2YWx1ZSwgcHJvbWlzZXMgdGhhdCB2YWx1ZSxcbiAqIGJ1dCBvdGhlcndpc2UgcmVqZWN0cy5cbiAqIEBwYXJhbSB4IHtBbnkqfVxuICogQHBhcmFtIHkge0FueSp9XG4gKiBAcmV0dXJucyB7QW55Kn0gYSBwcm9taXNlIGZvciB4IGFuZCB5IGlmIHRoZXkgYXJlIHRoZSBzYW1lLCBidXQgYSByZWplY3Rpb25cbiAqIG90aGVyd2lzZS5cbiAqXG4gKi9cblEuam9pbiA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgcmV0dXJuIFEoeCkuam9pbih5KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHJldHVybiBRKFt0aGlzLCB0aGF0XSkuc3ByZWFkKGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIGlmICh4ID09PSB5KSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBcIj09PVwiIHNob3VsZCBiZSBPYmplY3QuaXMgb3IgZXF1aXZcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXG4gKiBAcGFyYW0gYW5zd2VycyB7QXJyYXlbQW55Kl19IHByb21pc2VzIHRvIHJhY2VcbiAqIEByZXR1cm5zIHtBbnkqfSB0aGUgZmlyc3QgcHJvbWlzZSB0byBiZSBzZXR0bGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIFN3aXRjaCB0byB0aGlzIG9uY2Ugd2UgY2FuIGFzc3VtZSBhdCBsZWFzdCBFUzVcbiAgICAgICAgLy8gYW5zd2VyUHMuZm9yRWFjaChmdW5jdGlvbihhbnN3ZXJQKSB7XG4gICAgICAgIC8vICAgICBRKGFuc3dlclApLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIFVzZSB0aGlzIGluIHRoZSBtZWFudGltZVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYW5zd2VyUHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIFEoYW5zd2VyUHNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5yYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oUS5yYWNlKTtcbn07XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIFByb21pc2Ugd2l0aCBhIHByb21pc2UgZGVzY3JpcHRvciBvYmplY3QgYW5kIG9wdGlvbmFsIGZhbGxiYWNrXG4gKiBmdW5jdGlvbi4gIFRoZSBkZXNjcmlwdG9yIGNvbnRhaW5zIG1ldGhvZHMgbGlrZSB3aGVuKHJlamVjdGVkKSwgZ2V0KG5hbWUpLFxuICogc2V0KG5hbWUsIHZhbHVlKSwgcG9zdChuYW1lLCBhcmdzKSwgYW5kIGRlbGV0ZShuYW1lKSwgd2hpY2ggYWxsXG4gKiByZXR1cm4gZWl0aGVyIGEgdmFsdWUsIGEgcHJvbWlzZSBmb3IgYSB2YWx1ZSwgb3IgYSByZWplY3Rpb24uICBUaGUgZmFsbGJhY2tcbiAqIGFjY2VwdHMgdGhlIG9wZXJhdGlvbiBuYW1lLCBhIHJlc29sdmVyLCBhbmQgYW55IGZ1cnRoZXIgYXJndW1lbnRzIHRoYXQgd291bGRcbiAqIGhhdmUgYmVlbiBmb3J3YXJkZWQgdG8gdGhlIGFwcHJvcHJpYXRlIG1ldGhvZCBhYm92ZSBoYWQgYSBtZXRob2QgYmVlblxuICogcHJvdmlkZWQgd2l0aCB0aGUgcHJvcGVyIG5hbWUuICBUaGUgQVBJIG1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgdGhlIG5hdHVyZVxuICogb2YgdGhlIHJldHVybmVkIG9iamVjdCwgYXBhcnQgZnJvbSB0aGF0IGl0IGlzIHVzYWJsZSB3aGVyZWV2ZXIgcHJvbWlzZXMgYXJlXG4gKiBib3VnaHQgYW5kIHNvbGQuXG4gKi9cblEubWFrZVByb21pc2UgPSBQcm9taXNlO1xuZnVuY3Rpb24gUHJvbWlzZShkZXNjcmlwdG9yLCBmYWxsYmFjaywgaW5zcGVjdCkge1xuICAgIGlmIChmYWxsYmFjayA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGZhbGxiYWNrID0gZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBcIlByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCBvcGVyYXRpb246IFwiICsgb3BcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoaW5zcGVjdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge3N0YXRlOiBcInVua25vd25cIn07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBvYmplY3RfY3JlYXRlKFByb21pc2UucHJvdG90eXBlKTtcblxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBhcmdzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcltvcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkZXNjcmlwdG9yW29wXS5hcHBseShwcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2suY2FsbChwcm9taXNlLCBvcCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBpbnNwZWN0O1xuXG4gICAgLy8gWFhYIGRlcHJlY2F0ZWQgYHZhbHVlT2ZgIGFuZCBgZXhjZXB0aW9uYCBzdXBwb3J0XG4gICAgaWYgKGluc3BlY3QpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICBwcm9taXNlLmV4Y2VwdGlvbiA9IGluc3BlY3RlZC5yZWFzb247XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJwZW5kaW5nXCIgfHxcbiAgICAgICAgICAgICAgICBpbnNwZWN0ZWQuc3RhdGUgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBQcm9taXNlXVwiO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIGRvbmUgPSBmYWxzZTsgICAvLyBlbnN1cmUgdGhlIHVudHJ1c3RlZCBwcm9taXNlIG1ha2VzIGF0IG1vc3QgYVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luZ2xlIGNhbGwgdG8gb25lIG9mIHRoZSBjYWxsYmFja3NcblxuICAgIGZ1bmN0aW9uIF9mdWxmaWxsZWQodmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZnVsZmlsbGVkID09PSBcImZ1bmN0aW9uXCIgPyBmdWxmaWxsZWQodmFsdWUpIDogdmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlamVjdGVkKGV4Y2VwdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIHJlamVjdGVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhleGNlcHRpb24sIHNlbGYpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKG5ld0V4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3RXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2dyZXNzZWQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwcm9ncmVzc2VkID09PSBcImZ1bmN0aW9uXCIgPyBwcm9ncmVzc2VkKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cblxuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoX2Z1bGZpbGxlZCh2YWx1ZSkpO1xuICAgICAgICB9LCBcIndoZW5cIiwgW2Z1bmN0aW9uIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoX3JlamVjdGVkKGV4Y2VwdGlvbikpO1xuICAgICAgICB9XSk7XG4gICAgfSk7XG5cbiAgICAvLyBQcm9ncmVzcyBwcm9wYWdhdG9yIG5lZWQgdG8gYmUgYXR0YWNoZWQgaW4gdGhlIGN1cnJlbnQgdGljay5cbiAgICBzZWxmLnByb21pc2VEaXNwYXRjaCh2b2lkIDAsIFwid2hlblwiLCBbdm9pZCAwLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlO1xuICAgICAgICB2YXIgdGhyZXcgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gX3Byb2dyZXNzZWQodmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJldyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aHJldykge1xuICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUS50YXAgPSBmdW5jdGlvbiAocHJvbWlzZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50YXAoY2FsbGJhY2spO1xufTtcblxuLyoqXG4gKiBXb3JrcyBhbG1vc3QgbGlrZSBcImZpbmFsbHlcIiwgYnV0IG5vdCBjYWxsZWQgZm9yIHJlamVjdGlvbnMuXG4gKiBPcmlnaW5hbCByZXNvbHV0aW9uIHZhbHVlIGlzIHBhc3NlZCB0aHJvdWdoIGNhbGxiYWNrIHVuYWZmZWN0ZWQuXG4gKiBDYWxsYmFjayBtYXkgcmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgYXdhaXRlZCBmb3IuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge1EuUHJvbWlzZX1cbiAqIEBleGFtcGxlXG4gKiBkb1NvbWV0aGluZygpXG4gKiAgIC50aGVuKC4uLilcbiAqICAgLnRhcChjb25zb2xlLmxvZylcbiAqICAgLnRoZW4oLi4uKTtcbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUudGFwID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCh2YWx1ZSkudGhlblJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlcnMgYW4gb2JzZXJ2ZXIgb24gYSBwcm9taXNlLlxuICpcbiAqIEd1YXJhbnRlZXM6XG4gKlxuICogMS4gdGhhdCBmdWxmaWxsZWQgYW5kIHJlamVjdGVkIHdpbGwgYmUgY2FsbGVkIG9ubHkgb25jZS5cbiAqIDIuIHRoYXQgZWl0aGVyIHRoZSBmdWxmaWxsZWQgY2FsbGJhY2sgb3IgdGhlIHJlamVjdGVkIGNhbGxiYWNrIHdpbGwgYmVcbiAqICAgIGNhbGxlZCwgYnV0IG5vdCBib3RoLlxuICogMy4gdGhhdCBmdWxmaWxsZWQgYW5kIHJlamVjdGVkIHdpbGwgbm90IGJlIGNhbGxlZCBpbiB0aGlzIHR1cm4uXG4gKlxuICogQHBhcmFtIHZhbHVlICAgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIHRvIG9ic2VydmVcbiAqIEBwYXJhbSBmdWxmaWxsZWQgIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqIEBwYXJhbSByZWplY3RlZCAgIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSByZWplY3Rpb24gZXhjZXB0aW9uXG4gKiBAcGFyYW0gcHJvZ3Jlc3NlZCBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBmcm9tIHRoZSBpbnZva2VkIGNhbGxiYWNrXG4gKi9cblEud2hlbiA9IHdoZW47XG5mdW5jdGlvbiB3aGVuKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEodmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnRoZW5SZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfSk7XG59O1xuXG5RLnRoZW5SZXNvbHZlID0gZnVuY3Rpb24gKHByb21pc2UsIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGhlblJlc29sdmUodmFsdWUpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgdGhyb3cgcmVhc29uOyB9KTtcbn07XG5cblEudGhlblJlamVjdCA9IGZ1bmN0aW9uIChwcm9taXNlLCByZWFzb24pIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVqZWN0KHJlYXNvbik7XG59O1xuXG4vKipcbiAqIElmIGFuIG9iamVjdCBpcyBub3QgYSBwcm9taXNlLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZS5cbiAqIElmIGEgcHJvbWlzZSBpcyByZWplY3RlZCwgaXQgaXMgYXMgXCJuZWFyXCIgYXMgcG9zc2libGUgdG9vLlxuICogSWYgaXTigJlzIGEgZnVsZmlsbGVkIHByb21pc2UsIHRoZSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZWFyZXIuXG4gKiBJZiBpdOKAmXMgYSBkZWZlcnJlZCBwcm9taXNlIGFuZCB0aGUgZGVmZXJyZWQgaGFzIGJlZW4gcmVzb2x2ZWQsIHRoZVxuICogcmVzb2x1dGlvbiBpcyBcIm5lYXJlclwiLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgbW9zdCByZXNvbHZlZCAobmVhcmVzdCkgZm9ybSBvZiB0aGUgb2JqZWN0XG4gKi9cblxuLy8gWFhYIHNob3VsZCB3ZSByZS1kbyB0aGlzP1xuUS5uZWFyZXIgPSBuZWFyZXI7XG5mdW5jdGlvbiBuZWFyZXIodmFsdWUpIHtcbiAgICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gdmFsdWUuaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwcm9taXNlLlxuICogT3RoZXJ3aXNlIGl0IGlzIGEgZnVsZmlsbGVkIHZhbHVlLlxuICovXG5RLmlzUHJvbWlzZSA9IGlzUHJvbWlzZTtcbmZ1bmN0aW9uIGlzUHJvbWlzZShvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgUHJvbWlzZTtcbn1cblxuUS5pc1Byb21pc2VBbGlrZSA9IGlzUHJvbWlzZUFsaWtlO1xuZnVuY3Rpb24gaXNQcm9taXNlQWxpa2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcGVuZGluZyBwcm9taXNlLCBtZWFuaW5nIG5vdFxuICogZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuICovXG5RLmlzUGVuZGluZyA9IGlzUGVuZGluZztcbmZ1bmN0aW9uIGlzUGVuZGluZyhvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUGVuZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicGVuZGluZ1wiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSB2YWx1ZSBvciBmdWxmaWxsZWRcbiAqIHByb21pc2UuXG4gKi9cblEuaXNGdWxmaWxsZWQgPSBpc0Z1bGZpbGxlZDtcbmZ1bmN0aW9uIGlzRnVsZmlsbGVkKG9iamVjdCkge1xuICAgIHJldHVybiAhaXNQcm9taXNlKG9iamVjdCkgfHwgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSByZWplY3RlZCBwcm9taXNlLlxuICovXG5RLmlzUmVqZWN0ZWQgPSBpc1JlamVjdGVkO1xuZnVuY3Rpb24gaXNSZWplY3RlZChvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1JlamVjdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufTtcblxuLy8vLyBCRUdJTiBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8vIFRoaXMgcHJvbWlzZSBsaWJyYXJ5IGNvbnN1bWVzIGV4Y2VwdGlvbnMgdGhyb3duIGluIGhhbmRsZXJzIHNvIHRoZXkgY2FuIGJlXG4vLyBoYW5kbGVkIGJ5IGEgc3Vic2VxdWVudCBwcm9taXNlLiAgVGhlIGV4Y2VwdGlvbnMgZ2V0IGFkZGVkIHRvIHRoaXMgYXJyYXkgd2hlblxuLy8gdGhleSBhcmUgY3JlYXRlZCwgYW5kIHJlbW92ZWQgd2hlbiB0aGV5IGFyZSBoYW5kbGVkLiAgTm90ZSB0aGF0IGluIEVTNiBvclxuLy8gc2hpbW1lZCBlbnZpcm9ubWVudHMsIHRoaXMgd291bGQgbmF0dXJhbGx5IGJlIGEgYFNldGAuXG52YXIgdW5oYW5kbGVkUmVhc29ucyA9IFtdO1xudmFyIHVuaGFuZGxlZFJlamVjdGlvbnMgPSBbXTtcbnZhciB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSB0cnVlO1xuXG5mdW5jdGlvbiByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKSB7XG4gICAgdW5oYW5kbGVkUmVhc29ucy5sZW5ndGggPSAwO1xuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMubGVuZ3RoID0gMDtcblxuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFja1JlamVjdGlvbihwcm9taXNlLCByZWFzb24pIHtcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgIGlmIChyZWFzb24gJiYgdHlwZW9mIHJlYXNvbi5zdGFjayAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2gocmVhc29uLnN0YWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2goXCIobm8gc3RhY2spIFwiICsgcmVhc29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVudHJhY2tSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYXQgPSBhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpO1xuICAgIGlmIChhdCAhPT0gLTEpIHtcbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vKipcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcbiAqIHRyYW5zZmVycmVkIGF3YXkgZnJvbSB0aGlzIHByb2Nlc3Mgb3ZlciBhbnkgcHJvbWlzZVxuICogY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgcHJvbWlzZSBhIHdyYXBwaW5nIG9mIHRoYXQgb2JqZWN0IHRoYXRcbiAqIGFkZGl0aW9uYWxseSByZXNwb25kcyB0byB0aGUgXCJpc0RlZlwiIG1lc3NhZ2VcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXG4gKi9cblEubWFzdGVyID0gbWFzdGVyO1xuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJpc0RlZlwiOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwcmVhZHMgdGhlIHZhbHVlcyBvZiBhIHByb21pc2VkIGFycmF5IG9mIGFyZ3VtZW50cyBpbnRvIHRoZVxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gZnVsZmlsbGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdmFyaWFkaWMgYXJndW1lbnRzIGZyb20gdGhlXG4gKiBwcm9taXNlZCBhcnJheVxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxuICogaXMgcmVqZWN0ZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb3IgdGhyb3duIGV4Y2VwdGlvbiBvZlxuICogZWl0aGVyIGNhbGxiYWNrLlxuICovXG5RLnNwcmVhZCA9IHNwcmVhZDtcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS5zcHJlYWQoZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcbiAgICB9LCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIFRoZSBhc3luYyBmdW5jdGlvbiBpcyBhIGRlY29yYXRvciBmb3IgZ2VuZXJhdG9yIGZ1bmN0aW9ucywgdHVybmluZ1xuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XG4gKiBvZiB0aGUgbmV3ZXN0IEVDTUFTY3JpcHQgNiBkcmFmdHMsIHRoaXMgY29kZSBkb2VzIG5vdCBjYXVzZSBzeW50YXhcbiAqIGVycm9ycyBpbiBvbGRlciBlbmdpbmVzLiAgVGhpcyBjb2RlIHNob3VsZCBjb250aW51ZSB0byB3b3JrIGFuZCB3aWxsXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cbiAqXG4gKiBFUzYgZ2VuZXJhdG9ycyBhcmUgY3VycmVudGx5IHBhcnQgb2YgVjggdmVyc2lvbiAzLjE5IHdpdGggdGhlXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cbiAqIGZvciBsb25nZXIsIGJ1dCB1bmRlciBhbiBvbGRlciBQeXRob24taW5zcGlyZWQgZm9ybS4gIFRoaXMgZnVuY3Rpb25cbiAqIHdvcmtzIG9uIGJvdGgga2luZHMgb2YgZ2VuZXJhdG9ycy5cbiAqXG4gKiBEZWNvcmF0ZXMgYSBnZW5lcmF0b3IgZnVuY3Rpb24gc3VjaCB0aGF0OlxuICogIC0gaXQgbWF5IHlpZWxkIHByb21pc2VzXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcbiAqICAtIHRoZSB2YWx1ZSBvZiB0aGUgeWllbGQgZXhwcmVzc2lvbiB3aWxsIGJlIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqICAtIGl0IHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlICh3aGVuIHRoZSBnZW5lcmF0b3JcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcbiAqICAtIHRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqICAgIG9mIHRoZSBnZW5lcmF0b3Igb3IgdGhlIGZpcnN0IHJlamVjdGVkIHByb21pc2UgYW1vbmcgdGhvc2VcbiAqICAgIHlpZWxkZWQuXG4gKiAgLSBpZiBhbiBlcnJvciBpcyB0aHJvd24gaW4gdGhlIGdlbmVyYXRvciwgaXQgcHJvcGFnYXRlcyB0aHJvdWdoXG4gKiAgICBldmVyeSBmb2xsb3dpbmcgeWllbGQgdW50aWwgaXQgaXMgY2F1Z2h0LCBvciB1bnRpbCBpdCBlc2NhcGVzXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxuICogICAgcmVqZWN0aW9uIGZvciB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZGVjb3JhdGVkIGdlbmVyYXRvci5cbiAqL1xuUS5hc3luYyA9IGFzeW5jO1xuZnVuY3Rpb24gYXN5bmMobWFrZUdlbmVyYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwidGhyb3dcIiwgYXJnIGlzIGFuIGV4Y2VwdGlvblxuICAgICAgICBmdW5jdGlvbiBjb250aW51ZXIodmVyYiwgYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAvLyBVbnRpbCBWOCAzLjE5IC8gQ2hyb21pdW0gMjkgaXMgcmVsZWFzZWQsIFNwaWRlck1vbmtleSBpcyB0aGUgb25seVxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIFNNJ3MgZ2VuZXJhdG9ycyB1c2UgdGhlIFB5dGhvbi1pbnNwaXJlZCBzZW1hbnRpY3Mgb2ZcbiAgICAgICAgICAgIC8vIG91dGRhdGVkIEVTNiBkcmFmdHMuICBXZSB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgRVM2LCBidXQgd2UnZCBhbHNvXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIHN1cHBvcnQgUHl0aG9uLXN0eWxlIGdlbmVyYXRvcnMuICBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmVcbiAgICAgICAgICAgIC8vIHRoaXMgYmxvY2suXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU3RvcEl0ZXJhdGlvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIC8vIEVTNiBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcGlkZXJNb25rZXkgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShleGNlcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdCwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBtYWtlR2VuZXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJuZXh0XCIpO1xuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XG4gKiBjYWxscyB0aGUgZ2VuZXJhdG9yIGFuZCBhbHNvIGVuZHMgdGhlIHByb21pc2UgY2hhaW4sIHNvIHRoYXQgYW55XG4gKiB1bmhhbmRsZWQgZXJyb3JzIGFyZSB0aHJvd24gaW5zdGVhZCBvZiBmb3J3YXJkZWQgdG8gdGhlIGVycm9yXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cbiAqIGdlbmVyYXRvcnMgYXQgdGhlIHRvcC1sZXZlbCB0byB3b3JrIHdpdGggbGlicmFyaWVzLlxuICovXG5RLnNwYXduID0gc3Bhd247XG5mdW5jdGlvbiBzcGF3bihtYWtlR2VuZXJhdG9yKSB7XG4gICAgUS5kb25lKFEuYXN5bmMobWFrZUdlbmVyYXRvcikoKSk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBpbnRlcmZhY2Ugb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuLyoqXG4gKiBUaHJvd3MgYSBSZXR1cm5WYWx1ZSBleGNlcHRpb24gdG8gc3RvcCBhbiBhc3luY2hyb25vdXMgZ2VuZXJhdG9yLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cbiAqIHZhbHVlcyBpbiBvbGRlciBGaXJlZm94L1NwaWRlck1vbmtleS4gIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBFUzZcbiAqIGdlbmVyYXRvcnMgbGlrZSBDaHJvbWl1bSAyOSwganVzdCB1c2UgXCJyZXR1cm5cIiBpbiB5b3VyIGdlbmVyYXRvclxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgc3Vycm91bmRpbmcgZ2VuZXJhdG9yXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyBFUzYgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcbiAqIH0pXG4gKiAvLyBPbGRlciBTcGlkZXJNb25rZXkgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xuICogfSlcbiAqL1xuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XG5mdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IFFSZXR1cm5WYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXG4gKiBhcmUgc2V0dGxlZCBhbmQgcGFzc2VkIGFzIHZhbHVlcyAoYHRoaXNgIGlzIGFsc28gc2V0dGxlZCBhbmQgcGFzc2VkXG4gKiBhcyBhIHZhbHVlKS4gIEl0IHdpbGwgYWxzbyBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0IG9mIGEgZnVuY3Rpb24gaXNcbiAqIGFsd2F5cyBhIHByb21pc2UuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XG4gKiAgICAgcmV0dXJuIGEgKyBiO1xuICogfSk7XG4gKiBhZGQoUShhKSwgUShCKSk7XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXG4gKi9cblEucHJvbWlzZWQgPSBwcm9taXNlZDtcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNwcmVhZChbdGhpcywgYWxsKGFyZ3VtZW50cyldLCBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cbiAqIEBwYXJhbSBvYmplY3QqIHRoZSByZWNpcGllbnRcbiAqIEBwYXJhbSBvcCB0aGUgbmFtZSBvZiB0aGUgbWVzc2FnZSBvcGVyYXRpb24sIGUuZy4sIFwid2hlblwiLFxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIHJlc3VsdCB7UHJvbWlzZX0gYSBwcm9taXNlIGZvciB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb25cbiAqL1xuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuZnVuY3Rpb24gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2gob3AsIGFyZ3MpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uIChvcCwgYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZ2V0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5RLmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSAgICAgbmV3IHZhbHVlIG9mIHByb3BlcnR5XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZGVsZXRlXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5kZWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxuICogICAgICAgICAgICAgICAgICBpbnZvY2F0aW9uIGFyZ3VtZW50cyBmb3IgcHJvbWlzZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICBhcmUgdWx0aW1hdGVseSBiYWNrZWQgd2l0aCBgcmVzb2x2ZWAgdmFsdWVzLFxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcbiAqICAgICAgICAgICAgICAgICAgd2hlcmVpbiB0aGUgcG9zdGVkIHZhbHVlIGNhbiBiZSBhbnlcbiAqICAgICAgICAgICAgICAgICAgSlNPTiBzZXJpYWxpemFibGUgb2JqZWN0LlxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cbi8vIGJvdW5kIGxvY2FsbHkgYmVjYXVzZSBpdCBpcyB1c2VkIGJ5IG90aGVyIG1ldGhvZHNcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgaW52b2NhdGlvbiBhcmd1bWVudHNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIGFyZ3MgICAgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYXBwbHkgPSBmdW5jdGlvbiAob2JqZWN0LCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUVtcInRyeVwiXSA9XG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cyldKTtcbn07XG5cbi8qKlxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXG4gKiBwcm9taXNlIGFuZCB0aHJvd24gZXJyb3JzIGludG8gYSByZWplY3RlZCBvbmUuXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZiaW5kID0gZnVuY3Rpb24gKG9iamVjdCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxuICogb2JqZWN0IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxuICovXG5RLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkuICBJZiBhbnkgb2ZcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqL1xuLy8gQnkgTWFyayBNaWxsZXJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxuUS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHZhciBjb3VudERvd24gPSAwO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc25hcHNob3Q7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXG4gICAgICAgICAgICAgICAgKHNuYXBzaG90ID0gcHJvbWlzZS5pbnNwZWN0KCkpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKytjb3VudERvd247XG4gICAgICAgICAgICAgICAgd2hlbihcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLWNvdW50RG93biA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogcHJvZ3Jlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICBpZiAoY291bnREb3duID09PSAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGwodGhpcyk7XG59O1xuXG4vKipcbiAqIFdhaXRzIGZvciBhbGwgcHJvbWlzZXMgdG8gYmUgc2V0dGxlZCwgZWl0aGVyIGZ1bGZpbGxlZCBvclxuICogcmVqZWN0ZWQuICBUaGlzIGlzIGRpc3RpbmN0IGZyb20gYGFsbGAgc2luY2UgdGhhdCB3b3VsZCBzdG9wXG4gKiB3YWl0aW5nIGF0IHRoZSBmaXJzdCByZWplY3Rpb24uICBUaGUgcHJvbWlzZSByZXR1cm5lZCBieVxuICogYGFsbFJlc29sdmVkYCB3aWxsIG5ldmVyIGJlIHJlamVjdGVkLlxuICogQHBhcmFtIHByb21pc2VzIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgKG9yIGFuIGFycmF5KSBvZiBwcm9taXNlc1xuICogKG9yIHZhbHVlcylcbiAqIEByZXR1cm4gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBwcm9taXNlc1xuICovXG5RLmFsbFJlc29sdmVkID0gZGVwcmVjYXRlKGFsbFJlc29sdmVkLCBcImFsbFJlc29sdmVkXCIsIFwiYWxsU2V0dGxlZFwiKTtcbmZ1bmN0aW9uIGFsbFJlc29sdmVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIHdoZW4ocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICBwcm9taXNlcyA9IGFycmF5X21hcChwcm9taXNlcywgUSk7XG4gICAgICAgIHJldHVybiB3aGVuKGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gd2hlbihwcm9taXNlLCBub29wLCBub29wKTtcbiAgICAgICAgfSkpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZXM7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxSZXNvbHZlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYWxsUmVzb2x2ZWQodGhpcyk7XG59O1xuXG4vKipcbiAqIEBzZWUgUHJvbWlzZSNhbGxTZXR0bGVkXG4gKi9cblEuYWxsU2V0dGxlZCA9IGFsbFNldHRsZWQ7XG5mdW5jdGlvbiBhbGxTZXR0bGVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZXMpLmFsbFNldHRsZWQoKTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdGhlaXIgc3RhdGVzIChhc1xuICogcmV0dXJuZWQgYnkgYGluc3BlY3RgKSB3aGVuIHRoZXkgaGF2ZSBhbGwgc2V0dGxlZC5cbiAqIEBwYXJhbSB7QXJyYXlbQW55Kl19IHZhbHVlcyBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyB7QXJyYXlbU3RhdGVdfSBhbiBhcnJheSBvZiBzdGF0ZXMgZm9yIHRoZSByZXNwZWN0aXZlIHZhbHVlcy5cbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUuYWxsU2V0dGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICByZXR1cm4gYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBRKHByb21pc2UpO1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVnYXJkbGVzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS5pbnNwZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKHJlZ2FyZGxlc3MsIHJlZ2FyZGxlc3MpO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSBmYWlsdXJlIG9mIGEgcHJvbWlzZSwgZ2l2aW5nIGFuIG9wb3J0dW5pdHkgdG8gcmVjb3ZlclxuICogd2l0aCBhIGNhbGxiYWNrLiAgSWYgdGhlIGdpdmVuIHByb21pc2UgaXMgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcbiAqIHByb21pc2UgaXMgZnVsZmlsbGVkLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIGZ1bGZpbGwgdGhlIHJldHVybmVkIHByb21pc2UgaWYgdGhlXG4gKiBnaXZlbiBwcm9taXNlIGlzIHJlamVjdGVkXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGNhbGxiYWNrXG4gKi9cblEuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAocmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhIGxpc3RlbmVyIHRoYXQgY2FuIHJlc3BvbmQgdG8gcHJvZ3Jlc3Mgbm90aWZpY2F0aW9ucyBmcm9tIGFcbiAqIHByb21pc2UncyBvcmlnaW5hdGluZyBkZWZlcnJlZC4gVGhpcyBsaXN0ZW5lciByZWNlaXZlcyB0aGUgZXhhY3QgYXJndW1lbnRzXG4gKiBwYXNzZWQgdG8gYGBkZWZlcnJlZC5ub3RpZnlgYC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byByZWNlaXZlIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJucyB0aGUgZ2l2ZW4gcHJvbWlzZSwgdW5jaGFuZ2VkXG4gKi9cblEucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbmZ1bmN0aW9uIHByb2dyZXNzKG9iamVjdCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24gKHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gb3Bwb3J0dW5pdHkgdG8gb2JzZXJ2ZSB0aGUgc2V0dGxpbmcgb2YgYSBwcm9taXNlLFxuICogcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBwcm9taXNlIGlzIGZ1bGZpbGxlZCBvciByZWplY3RlZC4gIEZvcndhcmRzXG4gKiB0aGUgcmVzb2x1dGlvbiB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aGVuIHRoZSBjYWxsYmFjayBpcyBkb25lLlxuICogVGhlIGNhbGxiYWNrIGNhbiByZXR1cm4gYSBwcm9taXNlIHRvIGRlZmVyIGNvbXBsZXRpb24uXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIG9ic2VydmUgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuXG4gKiBwcm9taXNlLCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIHdoZW5cbiAqIGBgZmluYGAgaXMgZG9uZS5cbiAqL1xuUS5maW4gPSAvLyBYWFggbGVnYWN5XG5RW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KVtcImZpbmFsbHlcIl0oY2FsbGJhY2spO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmluID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUT0RPIGF0dGVtcHQgdG8gcmVjeWNsZSB0aGUgcmVqZWN0aW9uIHdpdGggXCJ0aGlzXCIuXG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGVybWluYXRlcyBhIGNoYWluIG9mIHByb21pc2VzLCBmb3JjaW5nIHJlamVjdGlvbnMgdG8gYmVcbiAqIHRocm93biBhcyBleGNlcHRpb25zLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGF0IHRoZSBlbmQgb2YgYSBjaGFpbiBvZiBwcm9taXNlc1xuICogQHJldHVybnMgbm90aGluZ1xuICovXG5RLmRvbmUgPSBmdW5jdGlvbiAob2JqZWN0LCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZG9uZShmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgdmFyIG9uVW5oYW5kbGVkRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgLy8gZm9yd2FyZCB0byBhIGZ1dHVyZSB0dXJuIHNvIHRoYXQgYGB3aGVuYGBcbiAgICAgICAgLy8gZG9lcyBub3QgY2F0Y2ggaXQgYW5kIHR1cm4gaXQgaW50byBhIHJlamVjdGlvbi5cbiAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQXZvaWQgdW5uZWNlc3NhcnkgYG5leHRUaWNrYGluZyB2aWEgYW4gdW5uZWNlc3NhcnkgYHdoZW5gLlxuICAgIHZhciBwcm9taXNlID0gZnVsZmlsbGVkIHx8IHJlamVjdGVkIHx8IHByb2dyZXNzID9cbiAgICAgICAgdGhpcy50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSA6XG4gICAgICAgIHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmRvbWFpbikge1xuICAgICAgICBvblVuaGFuZGxlZEVycm9yID0gcHJvY2Vzcy5kb21haW4uYmluZChvblVuaGFuZGxlZEVycm9yKTtcbiAgICB9XG5cbiAgICBwcm9taXNlLnRoZW4odm9pZCAwLCBvblVuaGFuZGxlZEVycm9yKTtcbn07XG5cbi8qKlxuICogQ2F1c2VzIGEgcHJvbWlzZSB0byBiZSByZWplY3RlZCBpZiBpdCBkb2VzIG5vdCBnZXQgZnVsZmlsbGVkIGJlZm9yZVxuICogc29tZSBtaWxsaXNlY29uZHMgdGltZSBvdXQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHMgdGltZW91dFxuICogQHBhcmFtIHtBbnkqfSBjdXN0b20gZXJyb3IgbWVzc2FnZSBvciBFcnJvciBvYmplY3QgKG9wdGlvbmFsKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpZiBpdCBpc1xuICogZnVsZmlsbGVkIGJlZm9yZSB0aGUgdGltZW91dCwgb3RoZXJ3aXNlIHJlamVjdGVkLlxuICovXG5RLnRpbWVvdXQgPSBmdW5jdGlvbiAob2JqZWN0LCBtcywgZXJyb3IpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRpbWVvdXQobXMsIGVycm9yKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbiAobXMsIGVycm9yKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghZXJyb3IgfHwgXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGVycm9yKSB7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvciB8fCBcIlRpbWVkIG91dCBhZnRlciBcIiArIG1zICsgXCIgbXNcIik7XG4gICAgICAgICAgICBlcnJvci5jb2RlID0gXCJFVElNRURPVVRcIjtcbiAgICAgICAgfVxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgIH0sIG1zKTtcblxuICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChleGNlcHRpb24pIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChleGNlcHRpb24pO1xuICAgIH0sIGRlZmVycmVkLm5vdGlmeSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBnaXZlbiB2YWx1ZSAob3IgcHJvbWlzZWQgdmFsdWUpLCBzb21lXG4gKiBtaWxsaXNlY29uZHMgYWZ0ZXIgaXQgcmVzb2x2ZWQuIFBhc3NlcyByZWplY3Rpb25zIGltbWVkaWF0ZWx5LlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGFmdGVyIG1pbGxpc2Vjb25kc1xuICogdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZS5cbiAqIElmIHRoZSBnaXZlbiBwcm9taXNlIHJlamVjdHMsIHRoYXQgaXMgcGFzc2VkIGltbWVkaWF0ZWx5LlxuICovXG5RLmRlbGF5ID0gZnVuY3Rpb24gKG9iamVjdCwgdGltZW91dCkge1xuICAgIGlmICh0aW1lb3V0ID09PSB2b2lkIDApIHtcbiAgICAgICAgdGltZW91dCA9IG9iamVjdDtcbiAgICAgICAgb2JqZWN0ID0gdm9pZCAwO1xuICAgIH1cbiAgICByZXR1cm4gUShvYmplY3QpLmRlbGF5KHRpbWVvdXQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbiAodGltZW91dCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgYXMgYW4gYXJyYXksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqXG4gKiAgICAgIFEubmZhcHBseShGUy5yZWFkRmlsZSwgW19fZmlsZW5hbWVdKVxuICogICAgICAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogICAgICB9KVxuICpcbiAqL1xuUS5uZmFwcGx5ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBpbmRpdmlkdWFsbHksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mY2FsbChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSlcbiAqIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiB9KVxuICpcbiAqL1xuUS5uZmNhbGwgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFdyYXBzIGEgTm9kZUpTIGNvbnRpbnVhdGlvbiBwYXNzaW5nIGZ1bmN0aW9uIGFuZCByZXR1cm5zIGFuIGVxdWl2YWxlbnRcbiAqIHZlcnNpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mYmluZChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSkoXCJ1dGYtOFwiKVxuICogLnRoZW4oY29uc29sZS5sb2cpXG4gKiAuZG9uZSgpXG4gKi9cblEubmZiaW5kID1cblEuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgUShjYWxsYmFjaykuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmJpbmQgPVxuUHJvbWlzZS5wcm90b3R5cGUuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5kZW5vZGVpZnkuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cblEubmJpbmQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpc3AsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgUShib3VuZCkuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uYmluZCA9IGZ1bmN0aW9uICgvKnRoaXNwLCAuLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMCk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLm5iaW5kLmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2sgd2l0aCBhIGdpdmVuIGFycmF5IG9mIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkIGNhbGxiYWNrLlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIHtBcnJheX0gYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2tcbiAqIHdpbGwgYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEubnBvc3QgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ucG9zdChuYW1lLCBhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUubnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MgfHwgW10pO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjaywgZm9yd2FyZGluZyB0aGUgZ2l2ZW4gdmFyaWFkaWMgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWRcbiAqIGNhbGxiYWNrIGFyZ3VtZW50LlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIC4uLmFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrIHdpbGxcbiAqIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5RLm5pbnZva2UgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblByb21pc2UucHJvdG90eXBlLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblByb21pc2UucHJvdG90eXBlLm5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBJZiBhIGZ1bmN0aW9uIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBib3RoIE5vZGUgY29udGludWF0aW9uLXBhc3Npbmctc3R5bGUgYW5kXG4gKiBwcm9taXNlLXJldHVybmluZy1zdHlsZSwgaXQgY2FuIGVuZCBpdHMgaW50ZXJuYWwgcHJvbWlzZSBjaGFpbiB3aXRoXG4gKiBgbm9kZWlmeShub2RlYmFjaylgLCBmb3J3YXJkaW5nIHRoZSBvcHRpb25hbCBub2RlYmFjayBhcmd1bWVudC4gIElmIHRoZSB1c2VyXG4gKiBlbGVjdHMgdG8gdXNlIGEgbm9kZWJhY2ssIHRoZSByZXN1bHQgd2lsbCBiZSBzZW50IHRoZXJlLiAgSWYgdGhleSBkbyBub3RcbiAqIHBhc3MgYSBub2RlYmFjaywgdGhleSB3aWxsIHJlY2VpdmUgdGhlIHJlc3VsdCBwcm9taXNlLlxuICogQHBhcmFtIG9iamVjdCBhIHJlc3VsdCAob3IgYSBwcm9taXNlIGZvciBhIHJlc3VsdClcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5vZGViYWNrIGEgTm9kZS5qcy1zdHlsZSBjYWxsYmFja1xuICogQHJldHVybnMgZWl0aGVyIHRoZSBwcm9taXNlIG9yIG5vdGhpbmdcbiAqL1xuUS5ub2RlaWZ5ID0gbm9kZWlmeTtcbmZ1bmN0aW9uIG5vZGVpZnkob2JqZWN0LCBub2RlYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdCkubm9kZWlmeShub2RlYmFjayk7XG59XG5cblByb21pc2UucHJvdG90eXBlLm5vZGVpZnkgPSBmdW5jdGlvbiAobm9kZWJhY2spIHtcbiAgICBpZiAobm9kZWJhY2spIHtcbiAgICAgICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cbi8vIEFsbCBjb2RlIGJlZm9yZSB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMuXG52YXIgcUVuZGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xuXG5yZXR1cm4gUTtcblxufSk7XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgdGhpcy50ZXh0ID0gdGhpcy54aHIucmVzcG9uc2VUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiBzdHIubGVuZ3RoXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cyB8fCAxMjIzID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHRyeSB7XG4gICAgICB2YXIgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgICAgaWYgKCdIRUFEJyA9PSBtZXRob2QpIHJlcy50ZXh0ID0gbnVsbDtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChmaWVsZCwgZmlsZSwgZmlsZW5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAsIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gcXVlcnlzdHJpbmdcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtdWx0aXBsZSBkYXRhIFwid3JpdGVzXCJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLnNlbmQoeyBzZWFyY2g6ICdxdWVyeScgfSlcbiAqICAgICAgICAgLnNlbmQoeyByYW5nZTogJzEuLjUnIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgb3JkZXI6ICdkZXNjJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAgKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAgKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSl7XG4gIHZhciBvYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKG9iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmopIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICBpZiAoMiA9PSBmbi5sZW5ndGgpIHJldHVybiBmbihlcnIsIHJlcyk7XG4gIGlmIChlcnIpIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgZm4ocmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ09yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcigndGltZW91dCBvZiAnICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuICAgIGlmICgwID09IHhoci5zdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLmFib3J0ZWQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIGlmICh4aHIudXBsb2FkKSB7XG4gICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiXX0=
