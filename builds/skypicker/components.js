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
window.SearchForm = Wgts.SearchForm = require('./../modules/plainJsAdapters/SearchFormAdapter.jsx');


},{"./../modules/containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","./../modules/containers/Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx","./../modules/containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../modules/containers/SearchFormData.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchFormData.jsx","./../modules/containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../modules/plainJsAdapters/SearchFormAdapter.jsx":"C:\\www\\skypicker-components\\modules\\plainJsAdapters\\SearchFormAdapter.jsx","./../modules/stores/SearchFormStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\SearchFormStore.jsx","./../modules/tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./../modules/translationStrategies/spTr.js":"C:\\www\\skypicker-components\\modules\\translationStrategies\\spTr.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPI.jsx":[function(require,module,exports){
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


  function PlacesAPI(settings) {"use strict";
    this.settings = settings;
  }
  PlacesAPI.prototype.convertResults=function(results) {"use strict";
    return results.map(function (result) {
      return new Place(result);
    });
  };
  PlacesAPI.prototype.callAPI=function(params) {"use strict";
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
          deferred.resolve(this.convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      }.bind(this));
    return deferred.promise;
  };

  PlacesAPI.prototype.registerImportance=function(id) {"use strict";
    var deferred = Q.defer();
    superagent
      .post(url + "/" + id)
      .end( function(res)  {
        if (!res.error) {
          deferred.resolve(this.convertResults(res.body));
        } else {
          deferred.reject(new Error(res.error));
        }
      }.bind(this));
    return deferred.promise;
  };
  PlacesAPI.prototype.findByName=function(term) {"use strict";
    return this.callAPI({term: term});
  };
  PlacesAPI.prototype.findNearby=function(bounds) {"use strict";
    return this.callAPI(bounds);
  };
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


module.exports = PlacesAPI;

},{"../containers/Place.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx","deepmerge":"C:\\www\\skypicker-components\\node_modules\\deepmerge\\index.js","q":"C:\\www\\skypicker-components\\node_modules\\q\\q.js","superagent":"C:\\www\\skypicker-components\\node_modules\\superagent\\lib\\client.js"}],"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx":[function(require,module,exports){
"use strict";
var PlacesAPI  = require("./PlacesAPI.jsx");
var Q  = require('q');

var GlobalPromisesStore = {};


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
    var diff = date.weekday() - this.props.weekOffset;
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
    var diff = beginDate.weekday() - this.props.weekOffset;
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
    interval: {width: 907, height: 200, widthCompact: 454},
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

},{"./../../Calendar.jsx":"C:\\www\\skypicker-components\\modules\\Calendar.jsx","./../../DateTools.js":"C:\\www\\skypicker-components\\modules\\DateTools.js","./CalendarDay.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\CalendarDay.jsx"}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\DatePicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var React = (window.React);
var SearchDate = require('./../../containers/SearchDate.jsx');
var ModalMenuMixin = require('./../../ModalMenuMixin.jsx');
var CalendarFrame = require('./CalendarFrame.jsx');
var MonthMatrix = require("./MonthMatrix.jsx");
var Slider = require('./Slider.js');
var tr = require('./../../tr.js');
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

  switchModeTo: function (mode) {
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
        React.createElement("div", {className: "confirm-time-to-stay-button", onClick: this.confirmTimeToStay}, "OK")
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

    var modeOptions = [];
    for (var imode in this.props.modes) {
      if (this.props.modes[imode]) {
        modeOptions.push(React.createElement("div", {key: imode, className:  (mode == imode) ? "active" : "", onClick:  this.switchModeTo(imode) },  this.getModeLabel(imode) ))
      }
    }

    return (
      React.createElement("div", {className: 'search-date-picker search-picker '+mode}, 
        React.createElement("div", {className: "mode-selector"}, 
          modeOptions
        ), 
        React.createElement("div", {className: "content"}, 
           this.renderBody() 
        ), 
        React.createElement("div", {className: "clear-both"})
      )
    );
  }
});


module.exports = DatePicker;

},{"./../../ModalMenuMixin.jsx":"C:\\www\\skypicker-components\\modules\\ModalMenuMixin.jsx","./../../containers/SearchDate.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchDate.jsx","./../../tools/isIE.js":"C:\\www\\skypicker-components\\modules\\tools\\isIE.js","./../../tr.js":"C:\\www\\skypicker-components\\modules\\tr.js","./CalendarFrame.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\CalendarFrame.jsx","./MonthMatrix.jsx":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\MonthMatrix.jsx","./Slider.js":"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\Slider.js"}],"C:\\www\\skypicker-components\\modules\\DatePicker\\components\\MonthMatrix.jsx":[function(require,module,exports){
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
        transform: 'translate' + this._axis() + '(' + this.getOffset() + 'px)',
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
    return this.pointToBounds(50,15);
  };


module.exports = new Geolocation();

},{"./tools/latlon.js":"C:\\www\\skypicker-components\\modules\\tools\\latlon.js"}],"C:\\www\\skypicker-components\\modules\\ModalMenuMixin.jsx":[function(require,module,exports){
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
  }

};

module.exports = ModalMenuMixin;

},{}],"C:\\www\\skypicker-components\\modules\\ModalPicker.jsx":[function(require,module,exports){
"use strict";
/** @jsx React.DOM */

var isIE = require('./tools/isIE.js');
var moment = (window.moment);
var Tran = require('./Tran.jsx');



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
    if ($(this.props.inputElement).is(e.target)) return;
    if ($(this.props.inputElement).has(e.target).length) return;
    //if (!this.props.shown) return;
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

    var rect = this.props.inputElement.getBoundingClientRect();

    var pageWidth = $(window).width();
    var width = this.props.contentSize.width;
    var offset = rect.left;
    var top = rect.bottom + window.pageYOffset;
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
        marginLeft: offset,
        width: width
      };
    } else if (offset + width > maxWidth && width < maxWidth) {
      //MOVE IT
      var missingSpace = offset + width - maxWidth;
      outerStyles = {
        marginLeft: offset - missingSpace,
        width: width
      };
    } else {
      outerStyles = {
        marginLeft: 0,
        width: "100%"
      };
    }
    outerStyles.top = top + "px";
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
    return (
      React.createElement("div", {className: className, style: styles.outer}, 
        React.createElement("div", {className: "close-button", onclick: this.hide}, React.createElement(Tran, {tKey: "close"}, "close")), 
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
    console.log("default???");
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
      all: tr("All places","all"),
      nearby: tr("Nearby","nearby"),
      cheapest: tr("Cheapest","cheapest"),
      citiesAndAirports: tr("Cities and airports","cities_and_airports"),
      countries: tr("Countries","countries"),
      anywhere: tr("Anywhere","anywhere"),
      radius: tr("Radius search","radius")
    };
    return modeLabels[mode];
  },

  switchModeTo: function (mode) {
    return function()  {
      if (mode == "radius") {
        this.selectValue(new SearchPlace({mode: "radius", value: new Radius()}));
      } else if (mode == "anywhere") {
        this.selectValue(new SearchPlace({mode: "anywhere"}));
      } else {
        this.props.onChange(this.props.value, "changeMode");
      }

      this.props.onSizeChange(this.props.sizes[mode]);
      this.setState({
        viewMode: mode
      });
    }.bind(this)
  },

  checkMode: function () {
    if (this.props.value.mode == "text" && !this.props.value.isDefault) {
      if (this.state.viewMode != "all") {
        this.setState({
          viewMode: "all"
        });
      }
    }
  },

  componentDidUpdate: function (nextProps, nextState) {
    if (nextProps.value != this.props.value) {
      this.checkMode();
    }
  },

  selectValue: function (value) {
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

    var modeOptions = [];
    for (var imode in this.props.modes) {
      if (this.props.modes[imode]) {
        modeOptions.push(React.createElement("div", {key: imode, className:  (mode == imode) ? "active" : "", onClick:  this.switchModeTo(imode) },  this.getModeLabel(imode) ))
      }
    }
    return (
      React.createElement("div", {className: 'search-place-picker search-picker '+mode}, 
        React.createElement("div", {className: "mode-selector"}, 
          modeOptions
        ), 
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
      return places.filter(function(place)  {
        return types.indexOf(place.getTypeId()) != -1;
      });
    } else {
      return places;
    }
  },

  //TODO refactore - nearby should be separate from text
  setSearchText: function (searchText) {
    var placesAPI = new PlacesAPI({lang: OptionsStore.data.language});
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

    callFuncParam.then(function(places)  {
      if (searchText != this.state.searchText || !this.isMounted()) {
        return;
      }
      var filteredPlaces = this.filterPlacesByType(places, this.props.types);
      var limitedPlaces = filteredPlaces.slice(0,50);
      this.setState({
        places: limitedPlaces,
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

},{"./../../APIs/PlacesAPICached.jsx":"C:\\www\\skypicker-components\\modules\\APIs\\PlacesAPICached.jsx","./../../Geolocation.jsx":"C:\\www\\skypicker-components\\modules\\Geolocation.jsx","./../../containers/SearchPlace.jsx":"C:\\www\\skypicker-components\\modules\\containers\\SearchPlace.jsx","./../../stores/OptionsStore.jsx":"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx","./PlaceRow.jsx":"C:\\www\\skypicker-components\\modules\\PlacePicker\\components\\PlaceRow.jsx"}],"C:\\www\\skypicker-components\\modules\\SearchForm\\SearchForm.jsx":[function(require,module,exports){
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
      active: "origin",
      data: SearchFormStore.data
    };
  },
  getDefaultProps: function() {

  },
  createModalContainer: function () {
    var div = document.createElement('div');
    div.setAttribute('class', 'modal-container-element');
    document.body.appendChild(div);
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

    var datePickerFactory = React.createFactory(DatePickerModal);
    var placePickerFactory = React.createFactory(PlacePickerModal);

    this.components = {};
    this.components.dateFrom = React.render(datePickerFactory(), this.createModalContainer());
    this.components.dateTo = React.render(datePickerFactory(), this.createModalContainer());
    this.components.origin = React.render(placePickerFactory(), this.createModalContainer());
    this.components.destination = React.render(placePickerFactory(), this.createModalContainer());

    Object.keys(this.components).forEach(function(key)  {
      this.components[key].setProps({
        inputElement: this.refs[key + "Outer"].getDOMNode(),
        value: this.state.data[key],
        onHide: function()  {
          if (this.state.active == key) {
            this.setState({
              active: ""
            })
          }
        }.bind(this),
        onChange: this.changeValueFunc(key),
        options: options[key]
      });
    }.bind(this));

    this.modalComponentsLoaded = true;
    this.refreshShown();
  },

  componentDidUpdate: function () {
    this.refreshShown();
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
    var index = order.indexOf(this.state.active);
    var newIndex;
    if (index >= 0 && index <= 3) {
      newIndex = index+1
    } else if (index == 4) {
      //TODO focus on search btn
      newIndex = -1
    }
    var newActive = order[newIndex];
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
      }
      Object.keys(this.components).forEach(function(key)  {
        SearchFormStore.setValue(this.state.data.changeField(fieldName, value));
      }.bind(this));
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

  onClickOuterFunc: function (type) {
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

  refreshShown: function () {
    if (this.modalComponentsLoaded) {
      Object.keys(this.components).forEach(function(key)  {
        this.components[key].setProps({
          value: this.state.data[key],
          shown: key == this.state.active
        });
      }.bind(this));
      this.refreshFocus();
    }
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
        ref: type + "Outer", 
        onClick: this.onClickOuterFunc(type)
      }, 
        React.createElement("div", {className: "head"}, 
          React.createElement("label", null, this.getFieldLabel(type)), 
          React.createElement("span", {className: "input-wrapper"}, 
            React.createElement("input", {
              value: this.getFormattedValue(type), 
              onClick: this.onClickInner, 
              onFocus: this.onFocusFunc(type), 
              type: "text", 
              ref: type, 
              onChange: this.changeTextFunc(type), 
              autoComplete: "off"}
            )
          ), 
          React.createElement("i", {className: "fa fa-spinner"}), 
          React.createElement("b", {className: "toggle"}, 
            React.createElement("i", {className: faIconClass})
          )
        )
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

},{"./tr.js":"C:\\www\\skypicker-components\\modules\\tr.js"}],"C:\\www\\skypicker-components\\modules\\containers\\Options.jsx":[function(require,module,exports){
"use strict";
var Radius = require("./Radius.jsx");


  function Options(plain) {"use strict";
    plain = plain || {};
    if (window.SKYPICKER_LNG) {
      this.language = window.SKYPICKER_LNG.toLowerCase();
    } else {
      this.language = plain.language || "en";
    }

    this.defaultRadius = plain.defaultRadius || new Radius();
    Object.freeze(this);
  }
  Options.prototype.set=function(key, value) {"use strict";
    var newPlain = {
      language: this.language,
      defaultRadius: this.defaultRadius
    };
    newPlain[key] = value;
    return new Options(newPlain);
  };


module.exports = Options;

},{"./Radius.jsx":"C:\\www\\skypicker-components\\modules\\containers\\Radius.jsx"}],"C:\\www\\skypicker-components\\modules\\containers\\Place.jsx":[function(require,module,exports){
"use strict";

var typeIdToString = function(type) {
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
    if (typeof this.complete == "undefined") {
      this.complete = true;
    }
    this.typeString = typeIdToString(this.type);
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


for(var Immutable____Key in Immutable){if(Immutable.hasOwnProperty(Immutable____Key)){SearchPlace[Immutable____Key]=Immutable[Immutable____Key];}}var ____SuperProtoOfImmutable=Immutable===null?null:Immutable.prototype;SearchPlace.prototype=Object.create(____SuperProtoOfImmutable);SearchPlace.prototype.constructor=SearchPlace;SearchPlace.__superConstructor__=Immutable;
  function SearchPlace(input, isDefault) {"use strict";
    var plain = makePlain(input);
    this.mode = plain.mode || "text";
    this.formMode = plain.formMode || "all";
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


  function SearchFormAdapter(options) {"use strict";
    var root = React.createFactory(SearchForm);
    this.modalComponent = React.render(root(), options.element);
  }


module.exports = SearchFormAdapter;

},{"./../SearchForm/SearchForm.jsx":"C:\\www\\skypicker-components\\modules\\SearchForm\\SearchForm.jsx"}],"C:\\www\\skypicker-components\\modules\\stores\\OptionsStore.jsx":[function(require,module,exports){
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
  OptionsStore.prototype.setOption=function(key, value) {"use strict";
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
      promise: findByIdFromApi(searchPlace.value.id),
      tempValue: new SearchPlace({mode: "place", value: searchPlace.value, loading: true})
    };
  } else if (searchPlace.mode == "text") {
    return {
      promise: getFirstFromApi(searchPlace.value),
      tempValue: new SearchPlace({mode: "text", value: searchPlace.value, loading: true})
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

},{"./geo":"C:\\www\\skypicker-components\\modules\\tools\\geo.js"}],"C:\\www\\skypicker-components\\modules\\tr.js":[function(require,module,exports){
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
    translated = $.t('form_search.'+key, {defaultValue: original, postProcess: 'sprintf', sprintf: values});
  } catch (e) {
    translated = original;
  }

  //Not nice, TODO make some better solution how to pick prefix and fallback to common
  if (translated == original) {
    try {
      translated = $.t('common.'+key, {defaultValue: original, postProcess: 'sprintf', sprintf: values});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZXhwb3J0c1xcc2t5cGlja2VyLmpzeCIsIm1vZHVsZXNcXEFQSXNcXFBsYWNlc0FQSS5qc3giLCJtb2R1bGVzXFxBUElzXFxQbGFjZXNBUElDYWNoZWQuanN4IiwibW9kdWxlc1xcQ2FsZW5kYXIuanN4IiwibW9kdWxlc1xcRGF0ZVBpY2tlclxcRGF0ZVBpY2tlck1vZGFsLmpzeCIsIm1vZHVsZXNcXERhdGVQaWNrZXJcXGNvbXBvbmVudHNcXENhbGVuZGFyRGF5LmpzeCIsIm1vZHVsZXNcXERhdGVQaWNrZXJcXGNvbXBvbmVudHNcXENhbGVuZGFyRnJhbWUuanN4IiwibW9kdWxlc1xcRGF0ZVBpY2tlclxcY29tcG9uZW50c1xcRGF0ZVBpY2tlci5qc3giLCJtb2R1bGVzXFxEYXRlUGlja2VyXFxjb21wb25lbnRzXFxNb250aE1hdHJpeC5qc3giLCJtb2R1bGVzXFxEYXRlUGlja2VyXFxjb21wb25lbnRzXFxTbGlkZXIuanMiLCJtb2R1bGVzXFxEYXRlVG9vbHMuanMiLCJtb2R1bGVzXFxHZW9sb2NhdGlvbi5qc3giLCJtb2R1bGVzXFxNb2RhbE1lbnVNaXhpbi5qc3giLCJtb2R1bGVzXFxNb2RhbFBpY2tlci5qc3giLCJtb2R1bGVzXFxQbGFjZVBpY2tlclxcUGxhY2VQaWNrZXJNb2RhbC5qc3giLCJtb2R1bGVzXFxQbGFjZVBpY2tlclxcY29tcG9uZW50c1xcUGxhY2VQaWNrZXIuanN4IiwibW9kdWxlc1xcUGxhY2VQaWNrZXJcXGNvbXBvbmVudHNcXFBsYWNlUm93LmpzeCIsIm1vZHVsZXNcXFBsYWNlUGlja2VyXFxjb21wb25lbnRzXFxQbGFjZXMuanN4IiwibW9kdWxlc1xcU2VhcmNoRm9ybVxcU2VhcmNoRm9ybS5qc3giLCJtb2R1bGVzXFxUcmFuLmpzeCIsIm1vZHVsZXNcXGNvbnRhaW5lcnNcXE9wdGlvbnMuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcUGxhY2UuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcUmFkaXVzLmpzeCIsIm1vZHVsZXNcXGNvbnRhaW5lcnNcXFNlYXJjaERhdGUuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcU2VhcmNoRm9ybURhdGEuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcU2VhcmNoUGxhY2UuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcaW1tdXRhYmxlLmpzeCIsIm1vZHVsZXNcXHBsYWluSnNBZGFwdGVyc1xcU2VhcmNoRm9ybUFkYXB0ZXIuanN4IiwibW9kdWxlc1xcc3RvcmVzXFxPcHRpb25zU3RvcmUuanN4IiwibW9kdWxlc1xcc3RvcmVzXFxTZWFyY2hGb3JtU3RvcmUuanN4IiwibW9kdWxlc1xcdG9vbHNcXERhdGVQYWlyVmFsaWRhdG9yLmpzeCIsIm1vZHVsZXNcXHRvb2xzXFxnZW8uanMiLCJtb2R1bGVzXFx0b29sc1xcaXNJRS5qcyIsIm1vZHVsZXNcXHRvb2xzXFxsYXRsb24uanMiLCJtb2R1bGVzXFx0ci5qcyIsIm1vZHVsZXNcXHRyYW5zbGF0aW9uU3RyYXRlZ2llc1xcc3BUci5qcyIsIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxldmVudHNcXGV2ZW50cy5qcyIsIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxwcm9jZXNzXFxicm93c2VyLmpzIiwibm9kZV9tb2R1bGVzXFxkZWVwbWVyZ2VcXGluZGV4LmpzIiwibm9kZV9tb2R1bGVzXFxxXFxxLmpzIiwibm9kZV9tb2R1bGVzXFxzdXBlcmFnZW50XFxsaWJcXGNsaWVudC5qcyIsIm5vZGVfbW9kdWxlc1xcc3VwZXJhZ2VudFxcbm9kZV9tb2R1bGVzXFxjb21wb25lbnQtZW1pdHRlclxcaW5kZXguanMiLCJub2RlX21vZHVsZXNcXHN1cGVyYWdlbnRcXG5vZGVfbW9kdWxlc1xccmVkdWNlLWNvbXBvbmVudFxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2o1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgdHJhbnNsYXRpb25TdHJhdGVneSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy90cmFuc2xhdGlvblN0cmF0ZWdpZXMvc3BUci5qcycpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3RyLmpzJyk7XG50ci5zZXRTdHJhdGVneSh0cmFuc2xhdGlvblN0cmF0ZWd5KTtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xuXG53aW5kb3cuV2d0cyA9IHt9OyAvL1RoYXQncyBuYW1lc3BhY2UgaWYgdGhlcmUgd2lsbCBiZSBzb21lIG5hbWUgY29sbGlzaW9uXG5cbndpbmRvdy5QbGFjZSA9IFdndHMuUGxhY2UgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9QbGFjZS5qc3gnKTtcbndpbmRvdy5SYWRpdXMgPSBXZ3RzLlJhZGl1cyA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1JhZGl1cy5qc3gnKTtcbndpbmRvdy5TZWFyY2hEYXRlID0gV2d0cy5TZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL2NvbnRhaW5lcnMvU2VhcmNoRGF0ZS5qc3gnKTtcbndpbmRvdy5TZWFyY2hQbGFjZSA9IFdndHMuU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtRGF0YSA9IFdndHMuU2VhcmNoRm9ybURhdGEgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hGb3JtRGF0YS5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtU3RvcmUgPSBXZ3RzLlNlYXJjaEZvcm1TdG9yZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCcpO1xud2luZG93LlNlYXJjaEZvcm0gPSBXZ3RzLlNlYXJjaEZvcm0gPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvcGxhaW5Kc0FkYXB0ZXJzL1NlYXJjaEZvcm1BZGFwdGVyLmpzeCcpO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBzdXBlcmFnZW50ICA9IHJlcXVpcmUoXCJzdXBlcmFnZW50XCIpO1xudmFyIFBsYWNlICA9IHJlcXVpcmUoXCIuLi9jb250YWluZXJzL1BsYWNlLmpzeFwiKTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcbnZhciBRID0gcmVxdWlyZSgncScpO1xuXG52YXIgdXJsID0gXCJodHRwczovL2FwaS5za3lwaWNrZXIuY29tL3BsYWNlc1wiO1xuXG4vL1RPRE8gY2hlY2sgaWYgb24gZXJyb3IgaXMgY2FsbGVkIGV4YWN0bHkgd2hlbiBlcnJvciBpbiBjYWxsYmFjayBvciBub3QsIHRoZW4gQWRkIGl0IHRvIHByb21pc2VcbnZhciBoYW5kbGVFcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgY29uc29sZS5lcnJvcihlcnIpO1xufTtcblxuXG4gIGZ1bmN0aW9uIFBsYWNlc0FQSShzZXR0aW5ncykge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgfVxuICBQbGFjZXNBUEkucHJvdG90eXBlLmNvbnZlcnRSZXN1bHRzPWZ1bmN0aW9uKHJlc3VsdHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgcmV0dXJuIG5ldyBQbGFjZShyZXN1bHQpO1xuICAgIH0pO1xuICB9O1xuICBQbGFjZXNBUEkucHJvdG90eXBlLmNhbGxBUEk9ZnVuY3Rpb24ocGFyYW1zKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHZhciBkZWZhdWx0UGFyYW1zID0ge1xuICAgICAgdjogMixcbiAgICAgIGxvY2FsZTogdGhpcy5zZXR0aW5ncy5sYW5nXG4gICAgfTtcbiAgICBzdXBlcmFnZW50XG4gICAgICAuZ2V0KHVybClcbiAgICAgIC5xdWVyeShkZWVwbWVyZ2UocGFyYW1zLCBkZWZhdWx0UGFyYW1zKSlcbiAgICAgIC8vLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpXG4gICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAub24oJ2Vycm9yJywgaGFuZGxlRXJyb3IpXG4gICAgICAuZW5kKCBmdW5jdGlvbihyZXMpICB7XG4gICAgICAgIGlmICghcmVzLmVycm9yKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmNvbnZlcnRSZXN1bHRzKHJlcy5ib2R5KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihyZXMuZXJyb3IpKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcblxuICBQbGFjZXNBUEkucHJvdG90eXBlLnJlZ2lzdGVySW1wb3J0YW5jZT1mdW5jdGlvbihpZCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICBzdXBlcmFnZW50XG4gICAgICAucG9zdCh1cmwgKyBcIi9cIiArIGlkKVxuICAgICAgLmVuZCggZnVuY3Rpb24ocmVzKSAge1xuICAgICAgICBpZiAoIXJlcy5lcnJvcikge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodGhpcy5jb252ZXJ0UmVzdWx0cyhyZXMuYm9keSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IocmVzLmVycm9yKSk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuZmluZEJ5TmFtZT1mdW5jdGlvbih0ZXJtKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuY2FsbEFQSSh7dGVybTogdGVybX0pO1xuICB9O1xuICBQbGFjZXNBUEkucHJvdG90eXBlLmZpbmROZWFyYnk9ZnVuY3Rpb24oYm91bmRzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuY2FsbEFQSShib3VuZHMpO1xuICB9O1xuICBQbGFjZXNBUEkucHJvdG90eXBlLmZpbmRCeUlkPWZ1bmN0aW9uKGlkKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICB2OiAyLFxuICAgICAgbG9jYWxlOiB0aGlzLnNldHRpbmdzLmxhbmcsXG4gICAgICBpZDogaWRcbiAgICB9O1xuICAgIHN1cGVyYWdlbnRcbiAgICAgIC5nZXQodXJsICsgXCIvXCIgKyBpZClcbiAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAvLy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKVxuICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgLm9uKCdlcnJvcicsIGhhbmRsZUVycm9yKVxuICAgICAgLmVuZCggZnVuY3Rpb24ocmVzKSAge1xuICAgICAgICBpZiAoIXJlcy5lcnJvcikge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUobmV3IFBsYWNlKHJlcy5ib2R5KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihyZXMuZXJyb3IpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAvL0NhbGwgb25lIG1vcmUgcG9zdFxuICAgIHRoaXMucmVnaXN0ZXJJbXBvcnRhbmNlKGlkKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlc0FQSTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFBsYWNlc0FQSSAgPSByZXF1aXJlKFwiLi9QbGFjZXNBUEkuanN4XCIpO1xudmFyIFEgID0gcmVxdWlyZSgncScpO1xuXG52YXIgR2xvYmFsUHJvbWlzZXNTdG9yZSA9IHt9O1xuXG5cbiAgZnVuY3Rpb24gUGxhY2VzQVBJQ2FjaGVkKHNldHRpbmdzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5wbGFjZXNBUEkgPSBuZXcgUGxhY2VzQVBJKHNldHRpbmdzKTtcbiAgfVxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmNhbGxDYWNoZWQ9ZnVuY3Rpb24oZnVuYywgcGFyYW1zLCBrZXkpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoIUdsb2JhbFByb21pc2VzU3RvcmVba2V5XSkge1xuICAgICAgR2xvYmFsUHJvbWlzZXNTdG9yZVtrZXldID0gZnVuYyhwYXJhbXMpO1xuICAgIH1cbiAgICByZXR1cm4gR2xvYmFsUHJvbWlzZXNTdG9yZVtrZXldO1xuICB9O1xuXG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuYm91bmRzVG9TdHJpbmc9ZnVuY3Rpb24oYm91bmRzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIGJvdW5kcy5sYXRfbG8gKyBcIl9cIiArIGJvdW5kcy5sbmdfbG8gKyBcIl9cIiArIGJvdW5kcy5sYXRfaGkgKyBcIl9cIiArIGJvdW5kcy5sbmdfaGk7XG4gIH07XG5cbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5maW5kQnlOYW1lPWZ1bmN0aW9uKHRlcm0pIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmRCeU5hbWUuYmluZCh0aGlzLnBsYWNlc0FQSSksIHRlcm0sIHRlcm0pO1xuICB9O1xuXG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuZmluZE5lYXJieT1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmROZWFyYnkuYmluZCh0aGlzLnBsYWNlc0FQSSksIGJvdW5kcywgdGhpcy5ib3VuZHNUb1N0cmluZyhib3VuZHMpKTtcbiAgfTtcblxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmRCeUlkPWZ1bmN0aW9uKGlkKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuY2FsbENhY2hlZCh0aGlzLnBsYWNlc0FQSS5maW5kQnlJZC5iaW5kKHRoaXMucGxhY2VzQVBJKSwgaWQsIFwiaWQ6XCIraWQpO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2VzQVBJQ2FjaGVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxuLyogcGFydCBpcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9IYW5zZS9yZWFjdC1jYWxlbmRhci9ibG9iL21hc3Rlci9zcmMvY2FsZW5kYXIuanMgKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xuXG5cblxudmFyIENhbGVuZGFyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyXCIsXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2Vla09mZnNldDogMCxcbiAgICAgIGxhbmc6ICdlbicsXG4gICAgICBmb3JjZVNpeFJvd3M6IHRydWVcbiAgICB9O1xuICB9LFxuXG4gIGRheU5hbWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRheU5hbWVzID0gW107XG4gICAgdmFyIGRhdGUgPSB0aGlzLnByb3BzLmRhdGUuc3RhcnRPZignbW9udGgnKTtcbiAgICB2YXIgZGlmZiA9IGRhdGUud2Vla2RheSgpIC0gdGhpcy5wcm9wcy53ZWVrT2Zmc2V0O1xuICAgIGlmIChkaWZmIDwgMCkgZGlmZiArPSA3O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgIHZhciBkYXkgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgaS1kaWZmKzErN10pO1xuICAgICAgZGF5TmFtZXMucHVzaChkYXkuZm9ybWF0KFwiZGRcIikpO1xuICAgIH1cbiAgICByZXR1cm4gZGF5TmFtZXM7XG4gIH0sXG5cbiAgZGF5czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRheXMgPSBbXTtcbiAgICB2YXIgYmVnaW5EYXRlID0gdGhpcy5wcm9wcy5kYXRlLnN0YXJ0T2YoJ21vbnRoJyk7XG4gICAgdmFyIGRpZmYgPSBiZWdpbkRhdGUud2Vla2RheSgpIC0gdGhpcy5wcm9wcy53ZWVrT2Zmc2V0O1xuICAgIGlmIChkaWZmIDwgMCkgZGlmZiArPSA3O1xuXG4gICAgdmFyIGk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaWZmOyBpKyspIHtcbiAgICAgIHZhciBkYXRlID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIDFdKS5zdWJ0cmFjdCgoZGlmZi1pKSwgJ2RheXMnKTtcbiAgICAgIGRheXMucHVzaCh7ZGF0ZTogZGF0ZSwgb3RoZXJNb250aDogJ3ByZXYtbW9udGgnfSk7XG4gICAgfVxuXG4gICAgdmFyIG51bWJlck9mRGF5cyA9IGJlZ2luRGF0ZS5kYXlzSW5Nb250aCgpO1xuICAgIGZvciAoaSA9IDE7IGkgPD0gbnVtYmVyT2ZEYXlzOyBpKyspIHtcbiAgICAgIHZhciBkYXRlID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIGldKTtcbiAgICAgIGRheXMucHVzaCh7ZGF0ZTogZGF0ZX0pO1xuICAgIH1cblxuICAgIGkgPSAxO1xuICAgIHdoaWxlIChkYXlzLmxlbmd0aCAlIDcgIT09IDApIHtcbiAgICAgIHZhciBkYXRlID0gbW9tZW50LnV0YyhbdGhpcy5wcm9wcy5kYXRlLnllYXIoKSwgdGhpcy5wcm9wcy5kYXRlLm1vbnRoKCksIG51bWJlck9mRGF5c10pLmFkZChpLCBcImRheXNcIik7XG4gICAgICBkYXlzLnB1c2goe2RhdGU6IGRhdGUsIG90aGVyTW9udGg6ICduZXh0LW1vbnRoJ30pO1xuICAgICAgaSsrO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLmZvcmNlU2l4Um93cyAmJiBkYXlzLmxlbmd0aCAhPT0gNDIpIHtcbiAgICAgIHZhciBzdGFydCA9IG1vbWVudC51dGMoZGF5c1tkYXlzLmxlbmd0aC0xXS5kYXRlKS5hZGQoMSwgJ2RheXMnKTtcbiAgICAgIHdoaWxlIChkYXlzLmxlbmd0aCA8IDQyKSB7XG4gICAgICAgIGRheXMucHVzaCh7ZGF0ZTogbW9tZW50LnV0YyhzdGFydCksIG90aGVyTW9udGg6ICduZXh0LW1vbnRoJ30pO1xuICAgICAgICBzdGFydC5hZGQoMSwgJ2RheXMnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF5cztcbiAgfSxcbiAgc3BsaXRUb1dlZWtzOiBmdW5jdGlvbiAoZGF5cykge1xuICAgIHZhciB3ZWVrcyA9IFtdO1xuICAgIHZhciBhY3R1YWxXZWVrID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGk8ZGF5cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGklNyA9PSAwICYmIGkgIT0gMCkge1xuICAgICAgICB3ZWVrcy5wdXNoKGFjdHVhbFdlZWspO1xuICAgICAgICBhY3R1YWxXZWVrID0gW107XG4gICAgICB9XG4gICAgICBhY3R1YWxXZWVrLnB1c2goZGF5c1tpXSlcbiAgICB9XG4gICAgd2Vla3MucHVzaChhY3R1YWxXZWVrKTtcbiAgICByZXR1cm4gd2Vla3M7XG4gIH0sXG4gIHJlbmRlcldlZWs6IGZ1bmN0aW9uICh3ZWVrKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJ3ZWVrXCJ9LCBcbiAgICAgICAgd2Vlay5tYXAodGhpcy5yZW5kZXJEYXkpXG4gICAgICApXG4gICAgKVxuICB9LFxuICByZW5kZXJEYXk6IGZ1bmN0aW9uKGRheSkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmdldERheShkYXkuZGF0ZSwgZGF5Lm90aGVyTW9udGgpO1xuICB9LFxuICByZW5kZXJEYXlOYW1lOiBmdW5jdGlvbiAoZGF5TmFtZSkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IGRheU5hbWUsIGNsYXNzTmFtZTogXCJkYXktbmFtZVwifSwgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgZGF5TmFtZSApKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgd2Vla3MgPSB0aGlzLnNwbGl0VG9XZWVrcyh0aGlzLmRheXMoKSk7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kclwifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kci1tb250aFwifSwgXG4gICAgICAgICAgIHRoaXMucHJvcHMuZGF0ZS5mb3JtYXQoXCJNTU1NIFlZWVlcIikgXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xuZHItZ3JpZFwifSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImRheS1uYW1lc1wifSwgXG4gICAgICAgICAgICB0aGlzLmRheU5hbWVzKCkubWFwKHRoaXMucmVuZGVyRGF5TmFtZSlcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZGF5c1wifSwgXG4gICAgICAgICAgICB3ZWVrcy5tYXAodGhpcy5yZW5kZXJXZWVrKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbGVhci1ib3RoXCJ9KVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsZW5kYXI7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBNb2RhbFBpY2tlciA9IHJlcXVpcmUoXCIuLy4uL01vZGFsUGlja2VyLmpzeFwiKTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9EYXRlUGlja2VyLmpzeCcpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcblxuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGluaXRpYWxWYWx1ZTogbmV3IFNlYXJjaERhdGUoKSxcbiAgb25IaWRlOiBmdW5jdGlvbigpIHt9LFxuICBhcHBlbmRUb0VsZW1lbnQ6IGRvY3VtZW50LmJvZHksXG4gIGxvY2FsZTogXCJlblwiLFxuICBzaXplczoge1xuICAgIHNpbmdsZToge3dpZHRoOiA0NTQsIGhlaWdodDogMjAwfSxcbiAgICBpbnRlcnZhbDoge3dpZHRoOiA5MDcsIGhlaWdodDogMjAwLCB3aWR0aENvbXBhY3Q6IDQ1NH0sXG4gICAgbW9udGg6IHt3aWR0aDogNTUwLCBoZWlnaHQ6IDIwMH0sXG4gICAgdGltZVRvU3RheToge3dpZHRoOiA1NTAsIGhlaWdodDogMjAwfSxcbiAgICBhbnl0aW1lOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9LFxuICAgIG5vUmV0dXJuOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gIH0sXG4gIG1vZGVzOiB7XG4gICAgXCJzaW5nbGVcIjoge1xuICAgICAgY2xvc2VBZnRlcjogXCJzZWxlY3RcIiwgLy8gc2VsZWN0XG4gICAgICBmaW5pc2hBZnRlcjogXCJzZWxlY3RcIiAvLyBzZWxlY3RcbiAgICB9LFxuICAgIFwiaW50ZXJ2YWxcIjoge30sXG4gICAgXCJtb250aFwiOiB7fSxcbiAgICBcInRpbWVUb1N0YXlcIjoge30sXG4gICAgXCJhbnl0aW1lXCI6IHt9LFxuICAgIFwibm9SZXR1cm5cIjoge31cbiAgfVxufTtcblxudmFyIERhdGVQaWNrZXJNb2RhbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJEYXRlUGlja2VyTW9kYWxcIixcbiAgZ2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLnByb3BzLm9wdGlvbnMpO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uczoge31cbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnRTaXplOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gICAgfTtcbiAgfSxcbiAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcbiAgICBpZiAob3B0aW9ucy5tb2Rlc1t2YWx1ZS5tb2RlXSAmJiBvcHRpb25zLm1vZGVzW3ZhbHVlLm1vZGVdLmNsb3NlQWZ0ZXIgPT0gY2hhbmdlVHlwZSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkhpZGUoKTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSk7XG4gIH0sXG4gIG9uU2l6ZUNoYW5nZTogZnVuY3Rpb24gKHNpemVzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb250ZW50U2l6ZTogc2l6ZXNcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgIGlmICghdGhpcy5wcm9wcy5zaG93bikge3JldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSl9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kYWxQaWNrZXIsIHtjb250ZW50U2l6ZTogdGhpcy5zdGF0ZS5jb250ZW50U2l6ZSwgaW5wdXRFbGVtZW50OiB0aGlzLnByb3BzLmlucHV0RWxlbWVudCwgb25IaWRlOiB0aGlzLnByb3BzLm9uSGlkZX0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KERhdGVQaWNrZXIsIHt2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgcmVmOiBcInBsYWNlUGlja2VyXCIsIG9uQ2hhbmdlOiB0aGlzLm9uVmFsdWVDaGFuZ2UsIHNpemVzOiBvcHRpb25zLnNpemVzLCBtb2Rlczogb3B0aW9ucy5tb2Rlcywgb25TaXplQ2hhbmdlOiB0aGlzLm9uU2l6ZUNoYW5nZX1cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXJNb2RhbDtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG5cbnZhciBDYWxlbmRhckRheSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJDYWxlbmRhckRheVwiLFxuXG4gIG9uT3ZlcjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25PdmVyKHRoaXMucHJvcHMuZGF0ZSlcbiAgfSxcbiAgb25TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KHRoaXMucHJvcHMuZGF0ZSlcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRlOiBudWxsLFxuICAgICAgb3RoZXJNb250aDogJydcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgY2xhc3NlcyA9IHRoaXMucHJvcHMub3RoZXJNb250aDtcbiAgICBpZiAoIWNsYXNzZXMpIHtcbiAgICAgIGNsYXNzZXMgPSBcIlwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgY2xhc3NlcyArPSBcIiBkaXNhYmxlZFwiO1xuICAgICAgcmV0dXJuICggLy9vbk1vdXNlTGVhdmU9eyB0aGlzLnByb3BzLm9uTGVhdmUgfVxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzZXMgfSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJkYXktbnVtYmVyXCJ9LCB0aGlzLnByb3BzLmRhdGUuZGF0ZSgpKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5vdGhlcikge1xuICAgICAgY2xhc3NlcyArPSBcIiBvdGhlclwiO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5vdmVyKSB7XG4gICAgICBjbGFzc2VzICs9IFwiIG92ZXJcIlxuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgY2xhc3NlcyArPSBcIiBzZWxlY3RlZFwiXG4gICAgfVxuICAgIHJldHVybiAoIC8vb25Nb3VzZUxlYXZlPXsgdGhpcy5wcm9wcy5vbkxlYXZlIH1cbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3Nlcywgb25Nb3VzZUVudGVyOiAgdGhpcy5vbk92ZXIsIG9uQ2xpY2s6ICB0aGlzLm9uU2VsZWN0fSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwiZGF5LW51bWJlclwifSwgdGhpcy5wcm9wcy5kYXRlLmRhdGUoKSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYWxlbmRhckRheTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcblxudmFyIENhbGVuZGFyRGF5ID0gcmVxdWlyZShcIi4vQ2FsZW5kYXJEYXkuanN4XCIpO1xudmFyIENhbGVuZGFyID0gcmVxdWlyZShcIi4vLi4vLi4vQ2FsZW5kYXIuanN4XCIpO1xudmFyIERhdGVUb29scyA9IHJlcXVpcmUoXCIuLy4uLy4uL0RhdGVUb29scy5qc1wiKTtcblxudmFyIENhbGVuZGFyRnJhbWUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiQ2FsZW5kYXJGcmFtZVwiLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGVPdmVyOiBudWxsLFxuICAgICAgdmlld0RhdGU6IG1vbWVudC51dGModGhpcy5wcm9wcy52YWx1ZS5mcm9tKSB8fCBtb21lbnQudXRjKClcbiAgICB9O1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgY2FsZW5kYXJzTnVtYmVyOiAxLFxuICAgICAgc2VsZWN0aW9uTW9kZTogXCJzaW5nbGVcIlxuXG4gICAgfTtcbiAgfSxcblxuICBvbk92ZXI6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkYXRlT3ZlcjogZGF0ZVxuICAgIH0pO1xuICB9LFxuXG4gIC8vVE9ETyBjaGVjaCBpZiBpdCBpcyBnb29kIHRvIGhhdmUgdGhpcyBzdGF0ZSBoZXJlLCBvciBpIHNob3VsZCBwdXQgaXQgdG8gRGF0ZVBpY2tlXG4gIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdmlld0RhdGU6IHRoaXMuc3RhdGUudmlld0RhdGUuYWRkKDEsICdtb250aHMnKVxuICAgIH0pO1xuICB9LFxuXG4gIHByZXY6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdmlld0RhdGU6IHRoaXMuc3RhdGUudmlld0RhdGUuc3VidHJhY3QoMSwgJ21vbnRocycpXG4gICAgfSk7XG4gIH0sXG5cbiAgc2V0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgY2hhbmdlVHlwZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIGNoYW5nZVR5cGUpXG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSA9PSBcInNpbmdsZVwiKSB7XG4gICAgICAvL2lmIHNpbmdsZSBqdXN0IHNlbGVjdFxuICAgICAgdGhpcy5zZXRWYWx1ZSh7bW9kZTogXCJzaW5nbGVcIiwgZnJvbTogZGF0ZSwgdG86IGRhdGV9LFwic2VsZWN0XCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09IFwiaW50ZXJ2YWxcIikge1xuICAgICAgLy9pZiBpbnRlcnZhbCBkZWNpZGUgb24gbW9kZVxuICAgICAgaWYgKCF0aGlzLnByb3BzLnZhbHVlLmZyb20pIHtcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh7bW9kZTogXCJpbnRlcnZhbFwiLCBmcm9tOiBkYXRlLCB0bzogbnVsbCwgZmluYWw6IGZhbHNlfSxcInNlbGVjdFBhcnRpYWxcIik7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnByb3BzLnZhbHVlLnRvKSB7XG4gICAgICAgIC8vaWYgaXMgYmVmb3JlLCBqdXN0IHB1dCBzdGFydCBkYXRlIGFnYWluXG4gICAgICAgIGlmIChkYXRlIDwgdGhpcy5wcm9wcy52YWx1ZS5mcm9tKSB7XG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSh7bW9kZTogXCJpbnRlcnZhbFwiLCBmcm9tOiBkYXRlLCB0bzogbnVsbCwgZmluYWw6IGZhbHNlfSxcInNlbGVjdFBhcnRpYWxcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSh7bW9kZTogXCJpbnRlcnZhbFwiLCBmcm9tOiBtb21lbnQudXRjKHRoaXMucHJvcHMudmFsdWUuZnJvbSksIHRvOiBkYXRlfSxcInNlbGVjdFwiKTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBpIGhhdmUgY2hvc2VuIGJvdGggaSBzdGFydCB0byBwaWNrIG5ldyBvbmVcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSh7bW9kZTogXCJpbnRlcnZhbFwiLCBmcm9tOiBkYXRlLCB0bzogbnVsbCwgZmluYWw6IGZhbHNlfSxcInNlbGVjdFBhcnRpYWxcIik7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGlzU2VsZWN0ZWQ6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnZhbHVlLmZyb20pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICAgIHJldHVybiBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpID09IG1vbWVudC51dGModGhpcy5wcm9wcy52YWx1ZS5mcm9tKS5mb3JtYXQoXCJZWVlZTU1ERFwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2VsZWN0aW9uTW9kZSA9PSBcImludGVydmFsXCIpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLnRvKSB7XG4gICAgICAgIHJldHVybiBkYXRlID49IHRoaXMucHJvcHMudmFsdWUuZnJvbSAmJiBkYXRlIDw9IHRoaXMucHJvcHMudmFsdWUudG87XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA9PSBtb21lbnQudXRjKHRoaXMucHJvcHMudmFsdWUuZnJvbSkuZm9ybWF0KFwiWVlZWU1NRERcIik7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGlzT3ZlcjogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZGF0ZU92ZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09IFwiaW50ZXJ2YWxcIikge1xuICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWUuZnJvbSAmJiAhdGhpcy5wcm9wcy52YWx1ZS50bykge1xuICAgICAgICByZXR1cm4gZGF0ZSA+PSB0aGlzLnByb3BzLnZhbHVlLmZyb20gJiYgZGF0ZSA8PSB0aGlzLnN0YXRlLmRhdGVPdmVyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZGF0ZU92ZXIuZm9ybWF0KFwiWVlZWU1NRERcIikgPT0gZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZGF0ZU92ZXIuZm9ybWF0KFwiWVlZWU1NRERcIikgPT0gZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGF5OiBmdW5jdGlvbiAoZGF0ZSwgb3RoZXJNb250aCkge1xuICAgIHZhciBvdGhlciA9IGZhbHNlO1xuICAgIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLnByb3BzLm1pblZhbHVlICYmIGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIikgPD0gdGhpcy5wcm9wcy5taW5WYWx1ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSkge1xuICAgICAgb3RoZXIgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA8PSBtb21lbnQoKS5mb3JtYXQoXCJZWVlZTU1ERFwiKSkge1xuICAgICAgZGlzYWJsZWQgPSB0cnVlOyAvL1RPRE8gc2hvdWxkIGJlIHByb2JhYmx5IGRlZmluZWQgc29tZXdoZXJlIG1vcmUgb3V0c2lkZVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYWxlbmRhckRheSwge1xuICAgICAgICBrZXk6IGRhdGUudmFsdWVPZigpLCBcbiAgICAgICAgZGF0ZTogZGF0ZSwgXG4gICAgICAgIG90aGVyTW9udGg6IG90aGVyTW9udGgsIFxuICAgICAgICBvbk92ZXI6IHRoaXMub25PdmVyLCBcbiAgICAgICAgb25TZWxlY3Q6IHRoaXMub25TZWxlY3QsIFxuICAgICAgICBzZWxlY3RlZDogdGhpcy5pc1NlbGVjdGVkKGRhdGUpLCBcbiAgICAgICAgb3ZlcjogdGhpcy5pc092ZXIoZGF0ZSksIFxuICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQsIFxuICAgICAgICBvdGhlcjogb3RoZXJ9XG4gICAgICAgIClcbiAgICApO1xuICB9LFxuICByZW5kZXJQcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUudmlld0RhdGUuc3VidHJhY3QoMSwgJ21vbnRocycpLmZvcm1hdChcIllZWVlNTVwiKSA8IG1vbWVudC51dGMoKS5mb3JtYXQoXCJZWVlZTU1cIikpXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcmV2IGRpc2FibGVkXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwicHJldlwiLCBvbkNsaWNrOiB0aGlzLnByZXZ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XG4gIH0sXG4gIHJlbmRlck5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS52aWV3RGF0ZS5hZGQoMSwgJ21vbnRocycpLmZvcm1hdChcIllZWVlNTVwiKSA+IG1vbWVudC51dGMoKS5hZGQoNiwnbW9udGhzJykuZm9ybWF0KFwiWVlZWU1NXCIpKVxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibmV4dCBkaXNhYmxlZFwifSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSkpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIm5leHRcIiwgb25DbGljazogdGhpcy5uZXh0fSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSkpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGNhbGVuZGFyRGF0ZXMgPSBbXTtcbiAgICB2YXIgaW5pdGlhbERhdGUgPSBtb21lbnQudXRjKHRoaXMuc3RhdGUudmlld0RhdGUpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wcm9wcy5jYWxlbmRhcnNOdW1iZXI7ICsraSkge1xuICAgICAgY2FsZW5kYXJEYXRlcy5wdXNoKCBtb21lbnQudXRjKGluaXRpYWxEYXRlKSApO1xuICAgICAgaW5pdGlhbERhdGUuYWRkKDEsXCJtb250aFwiKVxuICAgIH1cbiAgICB2YXIgaiA9IDA7XG4gICAgdmFyIGNhbGVuZGFycyA9IGNhbGVuZGFyRGF0ZXMubWFwKGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICBqKys7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IGRhdGUudmFsdWVPZigpLCBjbGFzc05hbWU6ICdjYWxlbmRhci12aWV3IGNhbGVuZGFyLXZpZXctJytqfSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYWxlbmRhciwge2RhdGU6IGRhdGUsIGdldERheTogc2VsZi5nZXREYXksIHdlZWtPZmZzZXQ6IERhdGVUb29scy5maXJzdERheU9mV2VlaygpfSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgIHRoaXMucmVuZGVyUHJldigpLCBcbiAgICAgICAgY2FsZW5kYXJzLCBcbiAgICAgICAgIHRoaXMucmVuZGVyTmV4dCgpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsZWFyLWJvdGhcIn0pXG4gICAgICApXG4gICAgKVxuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYWxlbmRhckZyYW1lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgU2VhcmNoRGF0ZSA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCcpO1xudmFyIE1vZGFsTWVudU1peGluID0gcmVxdWlyZSgnLi8uLi8uLi9Nb2RhbE1lbnVNaXhpbi5qc3gnKTtcbnZhciBDYWxlbmRhckZyYW1lID0gcmVxdWlyZSgnLi9DYWxlbmRhckZyYW1lLmpzeCcpO1xudmFyIE1vbnRoTWF0cml4ID0gcmVxdWlyZShcIi4vTW9udGhNYXRyaXguanN4XCIpO1xudmFyIFNsaWRlciA9IHJlcXVpcmUoJy4vU2xpZGVyLmpzJyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uLy4uL3RyLmpzJyk7XG52YXIgaXNJRSA9IHJlcXVpcmUoJy4vLi4vLi4vdG9vbHMvaXNJRS5qcycpO1xuXG5cblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKTtcblxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcblxudmFyIEhhbmRsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJIYW5kbGVcIixcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImhhbmRsZVwifSwgXG4gICAgICAgIHRoaXMucHJvcHMuc2xpZGVyVmFsdWVcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxudmFyIERhdGVQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiRGF0ZVBpY2tlclwiLFxuICBtaXhpbnM6IFtNb2RhbE1lbnVNaXhpbl0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlID8gdGhpcy5wcm9wcy52YWx1ZSA6IG5ldyBTZWFyY2hEYXRlKCksXG4gICAgICB2aWV3TW9kZTogdGhpcy5wcm9wcy52YWx1ZSA/IHRoaXMucHJvcHMudmFsdWUubW9kZSA6IFwic2luZ2xlXCJcbiAgICB9O1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgZGVmYXVsdE1vZGU6IFwic2luZ2xlXCIsXG4gICAgICBsYW5nOiAnZW4nLFxuICAgICAgbWluVmFsdWU6IG51bGxcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcbiAgICB0aGlzLnByb3BzLm9uU2l6ZUNoYW5nZSh0aGlzLnByb3BzLnNpemVzW21vZGVdKTtcbiAgfSxcbiAgZ2V0TW9kZUxhYmVsOiBmdW5jdGlvbiAobW9kZSkge1xuICAgIHZhciBtb2RlTGFiZWxzID0ge1xuICAgICAgc2luZ2xlOiB0cihcIlNwZWNpZmljXCIsXCJzcGVjaWZpY1wiKSxcbiAgICAgIGludGVydmFsOiB0cihcIkludGVydmFsXCIsXCJpbnRlcnZhbFwiKSxcbiAgICAgIG1vbnRoOiB0cihcIk1vbnRoc1wiLFwibW9udGhzXCIpLFxuICAgICAgdGltZVRvU3RheTogdHIoXCJUaW1lIHRvIHN0YXlcIixcInRpbWVfdG9fc3RheVwiKSxcbiAgICAgIGFueXRpbWU6IHRyKFwiQW55dGltZVwiLFwiYW55dGltZVwiKSxcbiAgICAgIG5vUmV0dXJuOiB0cihcIk5vIHJldHVyblwiLFwibm9fcmV0dXJuXCIpXG4gICAgfTtcbiAgICByZXR1cm4gbW9kZUxhYmVsc1ttb2RlXTtcbiAgfSxcblxuICBzd2l0Y2hNb2RlVG86IGZ1bmN0aW9uIChtb2RlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBuZXdWYWx1ZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgICAgY2FzZSBcInRpbWVUb1N0YXlcIjpcbiAgICAgICAgICBzZWxmLmNoYW5nZVZhbHVlKHNlbGYuZ2V0VmFsdWUoKS5lZGl0KHttb2RlOiBtb2RlfSksIFwicmVsZWFzZVwiKTsgLy8gc2hvdWxkIGJ5IHNvbWV0aGluZyBsaWtlIGNoYW5nZSBtb2RlLCBidXQgaXQgZmluaXNoZXMgdmFsdWUgb25seSBhZnRlciByZWxlYXNlIHNvIFRPRE8gbWFrZSBpdCBzbWFydGVyXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImFueXRpbWVcIjpcbiAgICAgICAgY2FzZSBcIm5vUmV0dXJuXCI6XG4gICAgICAgICAgc2VsZi5jaGFuZ2VWYWx1ZShzZWxmLmdldFZhbHVlKCkuZWRpdCh7bW9kZTogbW9kZX0pLCBcInNlbGVjdFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cblxuICAgICAgc2VsZi5wcm9wcy5vblNpemVDaGFuZ2Uoc2VsZi5wcm9wcy5zaXplc1ttb2RlXSk7XG4gICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgdmlld01vZGU6IG1vZGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBjaGFuZ2VWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLGNoYW5nZVR5cGUpIHtcbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmdldFZhbHVlKCkuZWRpdCh2YWx1ZSk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSxjaGFuZ2VUeXBlKTtcbiAgfSxcblxuICBnZXRWYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnZhbHVlO1xuICB9LFxuXG4gIHNldE1vbnRoOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHRoaXMuY2hhbmdlVmFsdWUoe1xuICAgICAgbW9kZTogXCJtb250aFwiLFxuICAgICAgZnJvbTogbW9tZW50LnV0YyhkYXRlKS5zdGFydE9mKCdtb250aCcpLFxuICAgICAgdG86IG1vbWVudC51dGMoZGF0ZSkuZW5kT2YoJ21vbnRoJylcbiAgICB9LFwic2VsZWN0XCIpO1xuICB9LFxuXG4gIGNoYW5nZU1pblN0YXlEYXlzOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPiB0aGlzLmdldFZhbHVlKCkubWF4U3RheURheXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh7XG4gICAgICBtb2RlOiBcInRpbWVUb1N0YXlcIixcbiAgICAgIG1pblN0YXlEYXlzOiB2YWx1ZSxcbiAgICAgIG1heFN0YXlEYXlzOiB0aGlzLmdldFZhbHVlKCkubWF4U3RheURheXNcbiAgICB9LCBcImRyYWdnZWRcIik7XG4gIH0sXG5cbiAgY2hhbmdlTWF4U3RheURheXM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA8IHRoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZVZhbHVlKHtcbiAgICAgIG1vZGU6IFwidGltZVRvU3RheVwiLFxuICAgICAgbWluU3RheURheXM6IHRoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cyxcbiAgICAgIG1heFN0YXlEYXlzOiB2YWx1ZVxuICAgIH0sIFwiZHJhZ2dlZFwiKTtcbiAgfSxcblxuICByZWxlYXNlTWluU3RheURheXM6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBkbyBub3QgY2hhbmdlIHZhbHVlLCBidXQgdHJpZ2dlciBpdCB3aXRoIGRpZmZlcmVudCBjaGFuZ2UgdHlwZVxuICAgIHRoaXMuY2hhbmdlVmFsdWUobnVsbCwgXCJyZWxlYXNlXCIpO1xuICB9LFxuICByZWxlYXNlTWF4U3RheURheXM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNoYW5nZVZhbHVlKG51bGwsIFwicmVsZWFzZVwiKTtcbiAgfSxcblxuICBjb25maXJtVGltZVRvU3RheTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hhbmdlVmFsdWUodGhpcy5wcm9wcy52YWx1ZSwgXCJzZWxlY3RcIik7XG4gIH0sXG5cblxuICByZW5kZXJTaW5nbGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYWxlbmRhckZyYW1lLCB7b25DaGFuZ2U6IHRoaXMuY2hhbmdlVmFsdWUsIHZhbHVlOiB0aGlzLmdldFZhbHVlKCksIG1pblZhbHVlOiB0aGlzLnByb3BzLm1pblZhbHVlLCBzZWxlY3Rpb25Nb2RlOiBcInNpbmdsZVwiLCBjYWxlbmRhcnNOdW1iZXI6IDF9KVxuICAgIClcbiAgfSxcbiAgcmVuZGVySW50ZXJ2YWw6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYWxlbmRhckZyYW1lLCB7b25DaGFuZ2U6IHRoaXMuY2hhbmdlVmFsdWUsIHZhbHVlOiB0aGlzLmdldFZhbHVlKCksIG1pblZhbHVlOiB0aGlzLnByb3BzLm1pblZhbHVlLCBzZWxlY3Rpb25Nb2RlOiBcImludGVydmFsXCIsIGNhbGVuZGFyc051bWJlcjogM30pXG4gICAgKVxuICB9LFxuICByZW5kZXJNb250aDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChNb250aE1hdHJpeCwge21pblZhbHVlOiB0aGlzLnByb3BzLm1pblZhbHVlLCBvblNldDogdGhpcy5zZXRNb250aCwgdG90YWxNb250aHM6IFwiNlwifSkpO1xuICB9LFxuICByZW5kZXJUaW1lVG9TdGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhlYWRsaW5lID0gdHIoXCJTdGF5IHRpbWUgZnJvbSAlcyB0byAlcyBkYXlzLlwiLCBcInN0YXlfdGltZV9mcm9tXCIsIFt0aGlzLmdldFZhbHVlKCkubWluU3RheURheXMsIHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5c10gKTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInRpbWUtdG8tc3RheVwifSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb250ZW50LWhlYWRsaW5lXCJ9LCBoZWFkbGluZSksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNsaWRlciwge3N0ZXA6IDEsIG1pblZhbHVlOiAwLCBtYXhWYWx1ZTogMzEsIHZhbHVlOiB0aGlzLmdldFZhbHVlKCkubWluU3RheURheXMsIG9uUmVsZWFzZTogdGhpcy5yZWxlYXNlTWluU3RheURheXMsIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZU1pblN0YXlEYXlzLCBjbGFzc05hbWU6IFwic2xpZGVyIHNsaWRlck1pbiBob3Jpem9udGFsLXNsaWRlclwifSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChIYW5kbGUsIG51bGwpXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFNsaWRlciwge3N0ZXA6IDEsIG1pblZhbHVlOiAwLCBtYXhWYWx1ZTogMzEsIHZhbHVlOiB0aGlzLmdldFZhbHVlKCkubWF4U3RheURheXMsIG9uUmVsZWFzZTogdGhpcy5yZWxlYXNlTWF4U3RheURheXMsIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZU1heFN0YXlEYXlzLCBjbGFzc05hbWU6IFwic2xpZGVyIHNsaWRlck1heCBob3Jpem9udGFsLXNsaWRlclwifSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChIYW5kbGUsIG51bGwpXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwic2xpZGVyLWF4ZVwifSksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY29uZmlybS10aW1lLXRvLXN0YXktYnV0dG9uXCIsIG9uQ2xpY2s6IHRoaXMuY29uZmlybVRpbWVUb1N0YXl9LCBcIk9LXCIpXG4gICAgICApXG4gICAgKTtcbiAgfSxcbiAgcmVuZGVyQW55dGltZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH0sXG4gIHJlbmRlck5vUmV0dXJuOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG5cbiAgICB2YXIgbW9kZU9wdGlvbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpbW9kZSBpbiB0aGlzLnByb3BzLm1vZGVzKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5tb2Rlc1tpbW9kZV0pIHtcbiAgICAgICAgbW9kZU9wdGlvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IGltb2RlLCBjbGFzc05hbWU6ICAobW9kZSA9PSBpbW9kZSkgPyBcImFjdGl2ZVwiIDogXCJcIiwgb25DbGljazogIHRoaXMuc3dpdGNoTW9kZVRvKGltb2RlKSB9LCAgdGhpcy5nZXRNb2RlTGFiZWwoaW1vZGUpICkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogJ3NlYXJjaC1kYXRlLXBpY2tlciBzZWFyY2gtcGlja2VyICcrbW9kZX0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kZS1zZWxlY3RvclwifSwgXG4gICAgICAgICAgbW9kZU9wdGlvbnNcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb250ZW50XCJ9LCBcbiAgICAgICAgICAgdGhpcy5yZW5kZXJCb2R5KCkgXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG52YXIgVHJhbiA9IHJlcXVpcmUoJy4vLi4vLi4vVHJhbi5qc3gnKTtcblxudmFyIE1vbnRoTWF0cml4ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIk1vbnRoTWF0cml4XCIsXG5cbiAgc2V0TW9udGg6IGZ1bmN0aW9uIChtb250aCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5wcm9wcy5vblNldChtb250aCk7XG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbW9udGhzID0gW107XG4gICAgdmFyIGlNb250aCA9IG1vbWVudC51dGMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnNlSW50KHNlbGYucHJvcHMudG90YWxNb250aHMsMTApOyBpKyspIHtcbiAgICAgIG1vbnRocy5wdXNoKCBtb21lbnQudXRjKGlNb250aCkgKTtcbiAgICAgIGlNb250aC5hZGQoMSwgXCJtb250aHNcIik7XG4gICAgfVxuICAgIHZhciBtb250aHNFbGVtZW50cyA9IG1vbnRocy5tYXAoZnVuY3Rpb24gKG1vbnRoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IG1vbnRoLnZhbHVlT2YoKSwgY2xhc3NOYW1lOiBcIm1vbnRoLW9wdGlvblwiLCBvbkNsaWNrOiBzZWxmLnNldE1vbnRoKG1vbnRoKX0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwibW9udGgtbmFtZVwifSwgXG4gICAgICAgICAgICAgbW9udGguZm9ybWF0KFwiTU1NTVwiKSBcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnJcIiwgbnVsbCksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwibW9udGgteWVhclwifSwgXG4gICAgICAgICAgICAgbW9udGguZm9ybWF0KFwiWVlZWVwiKSBcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCAvL29uTW91c2VMZWF2ZT17IHRoaXMucHJvcHMub25MZWF2ZSB9XG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9udGgtbWF0cml4XCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnQtaGVhZGxpbmVcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbiwge3RLZXk6IFwic2VsZWN0X21vbnRoXCJ9LCBcIlNlbGVjdCBtb250aFwiKSksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9udGhzXCJ9LCBcbiAgICAgICAgICBtb250aHNFbGVtZW50c1xuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9udGhNYXRyaXg7XG4iLCJcInVzZSBzdHJpY3RcIjtcbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKFsncmVhY3QnXSwgZmFjdG9yeSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIC8vVE9ETyBnZXQgaXQgYmFjayB3aGVuIHJlcXVpcmUgZnJvbSBhbm90aGVyIGJ1bmRsZSB3aWxsIHdvcmtcclxuICAgIC8vbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3JlYWN0JykpO1xyXG4gICAgbW9kdWxlLmV4cG9ydHM9ZmFjdG9yeSh3aW5kb3cuUmVhY3QpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByb290LlJlYWN0U2xpZGVyID0gZmFjdG9yeShyb290LlJlYWN0KTtcclxuICB9XHJcbn0odGhpcywgZnVuY3Rpb24oUmVhY3QpIHtcclxuXHJcbiAgdmFyIFJlYWN0U2xpZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3MoeyBkaXNwbGF5TmFtZTogJ1JlYWN0U2xpZGVyJyxcclxuXHJcbiAgICBwcm9wVHlwZXM6IHtcclxuICAgICAgbWluVmFsdWU6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXHJcbiAgICAgIG1heFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBzdGVwOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBvcmllbnRhdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsnaG9yaXpvbnRhbCcsICd2ZXJ0aWNhbCddKSxcclxuICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICBvblJlbGVhc2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICB2YWx1ZVByb3BOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXHJcbiAgICB9LFxyXG5cclxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbWluVmFsdWU6IDAsXHJcbiAgICAgICAgbWF4VmFsdWU6IDEwMCxcclxuICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICBzdGVwOiAxLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgICAgdmFsdWVQcm9wTmFtZTogJ3NsaWRlclZhbHVlJ1xyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIG1vdW50ZWQ6IHRydWVcclxuICAgICAgfSlcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBtb3VudGVkOiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRQb3NpdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCF0aGlzLnN0YXRlLm1vdW50ZWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdXBwZXJCb3VuZDogMCxcclxuICAgICAgICAgIGhhbmRsZVdpZHRoOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWluOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWF4OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgc2xpZGVyID0gdGhpcy5yZWZzLnNsaWRlci5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHZhciBoYW5kbGUgPSB0aGlzLnJlZnMuaGFuZGxlLmdldERPTU5vZGUoKTtcclxuICAgICAgdmFyIHJlY3QgPSBzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICB2YXIgc2l6ZSA9IHtcclxuICAgICAgICBob3Jpem9udGFsOiAnY2xpZW50V2lkdGgnLFxyXG4gICAgICAgIHZlcnRpY2FsOiAnY2xpZW50SGVpZ2h0J1xyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG5cclxuICAgICAgdmFyIHBvc2l0aW9uID0ge1xyXG4gICAgICAgIGhvcml6b250YWw6IHsgbWluOiAnbGVmdCcsIG1heDogJ3JpZ2h0JyB9LFxyXG4gICAgICAgIHZlcnRpY2FsOiB7IG1pbjogJ3RvcCcsIG1heDogJ2JvdHRvbScgfVxyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG4gICAgICB2YXIgdXBwZXJCb3VuZCA9IHNsaWRlcltzaXplXSAtIGhhbmRsZVtzaXplXTtcclxuXHJcbiAgICAgIHRoaXMuY2FjaGVkUG9zaXRpb25zID0ge1xyXG4gICAgICAgIHVwcGVyQm91bmQ6IHVwcGVyQm91bmQsXHJcbiAgICAgICAgaGFuZGxlV2lkdGg6IGhhbmRsZVtzaXplXSxcclxuICAgICAgICBzbGlkZXJNaW46IHJlY3RbcG9zaXRpb24ubWluXSxcclxuICAgICAgICBzbGlkZXJNYXg6IHJlY3RbcG9zaXRpb24ubWF4XSAtIGhhbmRsZVtzaXplXVxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gdGhpcy5jYWNoZWRQb3NpdGlvbnM7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE9mZnNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcmF0aW8gPSAodGhpcy5wcm9wcy52YWx1ZSAtIHRoaXMucHJvcHMubWluVmFsdWUpIC8gKHRoaXMucHJvcHMubWF4VmFsdWUgLSB0aGlzLnByb3BzLm1pblZhbHVlKTtcclxuICAgICAgcmV0dXJuIHJhdGlvICogdGhpcy5nZXRQb3NpdGlvbnMoKS51cHBlckJvdW5kO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgaGFuZGxlU3R5bGUgPSB7XHJcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlJyArIHRoaXMuX2F4aXMoKSArICcoJyArIHRoaXMuZ2V0T2Zmc2V0KCkgKyAncHgpJyxcclxuICAgICAgICAvLyBsZXQgdGhpcyBlbGVtZW50IGJlIHRoZSBzYW1lIHNpemUgYXMgaXRzIGNoaWxkcmVuLlxyXG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB2YXIgdXNlckhhbmRsZSA9IHRoaXMucHJvcHMuY2hpbGRyZW47XHJcbiAgICAgIHVzZXJIYW5kbGUucHJvcHNbdGhpcy5wcm9wcy52YWx1ZVByb3BOYW1lXSA9IHRoaXMucHJvcHMudmFsdWU7XHJcblxyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoeyByZWY6ICdzbGlkZXInLCBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLl9vbkNsaWNrIH0sXHJcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHsgcmVmOiAnaGFuZGxlJywgc3R5bGU6IGhhbmRsZVN0eWxlLCBvbk1vdXNlRG93bjogdGhpcy5fZHJhZ1N0YXJ0LCBvblRvdWNoTW92ZTogdGhpcy5fdG91Y2hNb3ZlIH0sXHJcbiAgICAgICAgICAgIHVzZXJIYW5kbGVcclxuICAgICAgICAgICkpKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gZVsncGFnZScgKyB0aGlzLl9heGlzKCldO1xyXG4gICAgICB0aGlzLl9tb3ZlSGFuZGxlKHBvc2l0aW9uKTtcclxuICAgIH0sXHJcblxyXG4gICAgX2RyYWdTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2RyYWdNb3ZlLCBmYWxzZSk7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9kcmFnRW5kLCBmYWxzZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9kcmFnTW92ZTogZnVuY3Rpb24oZSkge1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBlWydwYWdlJyArIHRoaXMuX2F4aXMoKV07XHJcbiAgICAgIHRoaXMuX21vdmVIYW5kbGUocG9zaXRpb24pO1xyXG4gICAgfSxcclxuXHJcbiAgICBfZHJhZ0VuZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2RyYWdNb3ZlLCBmYWxzZSk7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9kcmFnRW5kLCBmYWxzZSk7XHJcbiAgICAgIHRoaXMucHJvcHMub25SZWxlYXNlKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIF90b3VjaE1vdmU6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdmFyIGxhc3QgPSBlLmNoYW5nZWRUb3VjaGVzW2UuY2hhbmdlZFRvdWNoZXMubGVuZ3RoIC0gMV07XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IGxhc3RbJ3BhZ2UnICsgdGhpcy5fYXhpcygpXTtcclxuICAgICAgdGhpcy5fbW92ZUhhbmRsZShwb3NpdGlvbik7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgX21vdmVIYW5kbGU6IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XHJcblxyXG4gICAgICAvLyBtYWtlIGNlbnRlciBvZiBoYW5kbGUgYXBwZWFyIHVuZGVyIHRoZSBjdXJzb3IgcG9zaXRpb25cclxuICAgICAgdmFyIHBvc2l0aW9ucyA9IHRoaXMuZ2V0UG9zaXRpb25zKCk7XHJcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gLSAocG9zaXRpb25zLmhhbmRsZVdpZHRoIC8gMik7XHJcblxyXG4gICAgICB2YXIgbGFzdFZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcclxuXHJcbiAgICAgIHZhciByYXRpbyA9IChwb3NpdGlvbiAtIHBvc2l0aW9ucy5zbGlkZXJNaW4pIC8gKHBvc2l0aW9ucy5zbGlkZXJNYXggLSBwb3NpdGlvbnMuc2xpZGVyTWluKTtcclxuICAgICAgdmFyIHZhbHVlID0gcmF0aW8gKiAodGhpcy5wcm9wcy5tYXhWYWx1ZSAtIHRoaXMucHJvcHMubWluVmFsdWUpICsgdGhpcy5wcm9wcy5taW5WYWx1ZTtcclxuXHJcbiAgICAgIHZhciBuZXh0VmFsdWUgPSB0aGlzLl90cmltQWxpZ25WYWx1ZSh2YWx1ZSk7XHJcblxyXG4gICAgICB2YXIgY2hhbmdlZCA9IG5leHRWYWx1ZSAhPT0gbGFzdFZhbHVlO1xyXG5cclxuICAgICAgaWYgKGNoYW5nZWQgJiYgdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xyXG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV4dFZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfYXhpczogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgJ2hvcml6b250YWwnOiAnWCcsXHJcbiAgICAgICAgJ3ZlcnRpY2FsJzogJ1knXHJcbiAgICAgIH1bdGhpcy5wcm9wcy5vcmllbnRhdGlvbl07XHJcbiAgICB9LFxyXG5cclxuICAgIF90cmltQWxpZ25WYWx1ZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgIGlmICh2YWwgPD0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgdmFsID0gdGhpcy5wcm9wcy5taW5WYWx1ZTtcclxuICAgICAgaWYgKHZhbCA+PSB0aGlzLnByb3BzLm1heFZhbHVlKSB2YWwgPSB0aGlzLnByb3BzLm1heFZhbHVlO1xyXG5cclxuICAgICAgdmFyIHZhbE1vZFN0ZXAgPSAodmFsIC0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgJSB0aGlzLnByb3BzLnN0ZXA7XHJcbiAgICAgIHZhciBhbGlnblZhbHVlID0gdmFsIC0gdmFsTW9kU3RlcDtcclxuXHJcbiAgICAgIGlmIChNYXRoLmFicyh2YWxNb2RTdGVwKSAqIDIgPj0gdGhpcy5wcm9wcy5zdGVwKSB7XHJcbiAgICAgICAgYWxpZ25WYWx1ZSArPSAodmFsTW9kU3RlcCA+IDApID8gdGhpcy5wcm9wcy5zdGVwIDogKC0gdGhpcy5wcm9wcy5zdGVwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYWxpZ25WYWx1ZS50b0ZpeGVkKDUpKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBSZWFjdFNsaWRlcjtcclxuXHJcbn0pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICBUb29scyBmb3IgbWFuaXB1bGF0aW5nIHdpdGggZGF0ZXNcbiAgc29tZSBvZiB0aGVtIGFyZSBkdXBsaWNpdGllcyB0byBtb21lbnQncyBmdW5jdGlvbnMsIGJ1dCB0aGV5IGNhbiBiZSB1c2VkIGFzIGZhc3RlciBhbHRlcm5hdGl2ZXNcbiAqL1xuXG5cbnZhciBwYWQgPSBmdW5jdGlvbihudW0sIHNpemUpIHtcbiAgdmFyIHMgPSBudW0gKyBcIlwiO1xuICB3aGlsZSAocy5sZW5ndGggPCBzaXplKSB7XG4gICAgcyA9IFwiMFwiICsgcztcbiAgfVxuICByZXR1cm4gcztcbn07XG5cbnZhciBEYXRlVG9vbHMgPSB7XG4gIHRvZGF5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbiAgfSxcbiAgaW5IYWxmQW5ZZWFyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLnNldE1vbnRoKG5ldyBEYXRlKCkuZ2V0TW9udGgoKSArIDYpKTtcbiAgfSxcbiAgZmlyc3REYXk6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICB9LFxuICBsYXN0RGF5OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCk7XG4gIH0sXG4gIGZvcm1hdFNQQXBpRGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBwYWQoZGF0ZS5nZXREYXRlKCksIDIpICsgXCIvXCIgKyBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSwgMikgKyBcIi9cIiArIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgfSxcbiAgZm9ybWF0V0FEYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIFwiLVwiICsgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEsIDIpICsgXCItXCIgKyBwYWQoZGF0ZS5nZXREYXRlKCksIDIpO1xuICB9XG59O1xuXG5cbkRhdGVUb29scy5maXJzdERheU9mV2VlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbW9tZW50LmxvY2FsZURhdGEoKS5fd2Vlay5kb3c7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVUb29scztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIExhdExvbiA9IHJlcXVpcmUoJy4vdG9vbHMvbGF0bG9uLmpzJyk7XG5cbnZhciBvcHRpb25zID0ge1xuICBlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlLFxuICB0aW1lb3V0OiA1MDAwLFxuICBtYXhpbXVtQWdlOiAwXG59O1xuXG5mdW5jdGlvbiBHZW9sb2NhdGlvbigpe1widXNlIHN0cmljdFwiO31cblxuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUuaW5pdEJyb3dzZXI9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9UT0RPIGZpbmlzaFxuICAgIC8vbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zKSB7XG4gICAgLy8gIHZhciBjcmQgPSBwb3MuY29vcmRzO1xuICAgIC8vICBjb25zb2xlLmxvZygnWW91ciBjdXJyZW50IHBvc2l0aW9uIGlzOicpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTGF0aXR1ZGUgOiAnICsgY3JkLmxhdGl0dWRlKTtcbiAgICAvLyAgY29uc29sZS5sb2coJ0xvbmdpdHVkZTogJyArIGNyZC5sb25naXR1ZGUpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTW9yZSBvciBsZXNzICcgKyBjcmQuYWNjdXJhY3kgKyAnIG1ldGVycy4nKTtcbiAgICAvL1xuICAgIC8vfSwgZnVuY3Rpb24gKCkge1xuICAgIC8vICBjb25zb2xlLndhcm4oJ0VSUk9SKCcgKyBlcnIuY29kZSArICcpOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgIC8vfSwgb3B0aW9ucylcbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21NYXA9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21Ccm93c2VyPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuXG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRGcm9tQ29kZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcblxuICB9O1xuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUucG9pbnRUb0JvdW5kcz1mdW5jdGlvbihsYXQsIGxvbikge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBkaXN0YW5jZSA9IDMwMDtcbiAgICB2YXIgbGwgPSBMYXRMb24obGF0LGxvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhdF9sbzogbGwuZGVzdGluYXRpb25Qb2ludCgxODAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfbG86IGxsLmRlc3RpbmF0aW9uUG9pbnQoLTkwLCBkaXN0YW5jZSkubG9uLFxuICAgICAgbGF0X2hpOiBsbC5kZXN0aW5hdGlvblBvaW50KDAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfaGk6IGxsLmRlc3RpbmF0aW9uUG9pbnQoOTAsIGRpc3RhbmNlKS5sb25cbiAgICB9XG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRDdXJyZW50Qm91bmRzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnBvaW50VG9Cb3VuZHMoNTAsMTUpO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEdlb2xvY2F0aW9uKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBNb2RhbE1lbnVNaXhpbiA9IHtcblxuICByZW5kZXJCb2R5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgaWYgKCFtb2RlICkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHZhciBtZXRob2ROYW1lID0gXCJyZW5kZXJcIittb2RlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbW9kZS5zbGljZSgxKTtcbiAgICBpZiAodGhpc1ttZXRob2ROYW1lXSkge1xuICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kTmFtZV0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gc3VjaCBtZXRob2Q6IFwiICsgbWV0aG9kTmFtZSlcbiAgICB9XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbE1lbnVNaXhpbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBpc0lFID0gcmVxdWlyZSgnLi90b29scy9pc0lFLmpzJyk7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xudmFyIFRyYW4gPSByZXF1aXJlKCcuL1RyYW4uanN4Jyk7XG5cblxuXG52YXIgTW9kYWxQaWNrZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiTW9kYWxQaWNrZXJcIixcblxuICAvL2dldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gIC8vICByZXR1cm4ge1xuICAvLyAgICBzaG93bjogZmFsc2VcbiAgLy8gIH07XG4gIC8vfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3aW5kb3dXaWR0aDogJCh3aW5kb3cpLndpZHRoKCksXG4gICAgICB3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKVxuICAgIH07XG4gIH0sXG5cbiAgY2xpY2tPdXRzaWRlOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0aGlzLnJlZnMuaW5uZXIpIHtcbiAgICAgIGlmICgkKHRoaXMucmVmcy5pbm5lci5nZXRET01Ob2RlKCkpLmhhcyhlLnRhcmdldCkubGVuZ3RoKSByZXR1cm47XG4gICAgfVxuICAgIGlmICgkKHRoaXMucHJvcHMuaW5wdXRFbGVtZW50KS5pcyhlLnRhcmdldCkpIHJldHVybjtcbiAgICBpZiAoJCh0aGlzLnByb3BzLmlucHV0RWxlbWVudCkuaGFzKGUudGFyZ2V0KS5sZW5ndGgpIHJldHVybjtcbiAgICAvL2lmICghdGhpcy5wcm9wcy5zaG93bikgcmV0dXJuO1xuICAgIHRoaXMuaGlkZSgpO1xuICB9LFxuXG4gIHdpbmRvd1Jlc2l6ZWQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgLy9UT0RPIGNoZWNrIHBlcmZvcm1hbmNlIGFuZCBldmVudHVhbGx5IG1ha2Ugc29tZSBkZWxheWVkIHJlc2l6ZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgd2luZG93V2lkdGg6ICQod2luZG93KS53aWR0aCgpLFxuICAgICAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICB9KTtcbiAgfSxcblxuICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkhpZGUoKTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLmNsaWNrT3V0c2lkZSwgZmFsc2UpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLndpbmRvd1Jlc2l6ZWQpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja091dHNpZGUsIGZhbHNlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy53aW5kb3dSZXNpemVkKTtcbiAgfSxcblxuICBjYWxjdWxhdGVTdHlsZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoaXNJRSg4LCdsdGUnKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIHZhciByZWN0ID0gdGhpcy5wcm9wcy5pbnB1dEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB2YXIgcGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgdmFyIHdpZHRoID0gdGhpcy5wcm9wcy5jb250ZW50U2l6ZS53aWR0aDtcbiAgICB2YXIgb2Zmc2V0ID0gcmVjdC5sZWZ0O1xuICAgIHZhciB0b3AgPSByZWN0LmJvdHRvbSArIHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICB2YXIgbWF4V2lkdGggPSBwYWdlV2lkdGg7XG4gICAgdmFyIG91dGVyU3R5bGVzO1xuICAgIHZhciBhZGRDbGFzcyA9IFwiXCI7XG5cbiAgICBpZiAod2lkdGggPiBtYXhXaWR0aCkge1xuICAgICAgLy9tYWtlIHNtYWxsZXIgdmVyc2lvblxuICAgICAgYWRkQ2xhc3MgPSBcImNvbXBhY3Qtc2l6ZVwiO1xuICAgICAgaWYgKHRoaXMucHJvcHMuY29udGVudFNpemUud2lkdGhDb21wYWN0KSB7XG4gICAgICAgIHdpZHRoID0gdGhpcy5wcm9wcy5jb250ZW50U2l6ZS53aWR0aENvbXBhY3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9mZnNldCArIHdpZHRoIDw9IG1heFdpZHRoKSB7XG4gICAgICAvL0tFRVAgSVRcbiAgICAgIG91dGVyU3R5bGVzID0ge1xuICAgICAgICBtYXJnaW5MZWZ0OiBvZmZzZXQsXG4gICAgICAgIHdpZHRoOiB3aWR0aFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKG9mZnNldCArIHdpZHRoID4gbWF4V2lkdGggJiYgd2lkdGggPCBtYXhXaWR0aCkge1xuICAgICAgLy9NT1ZFIElUXG4gICAgICB2YXIgbWlzc2luZ1NwYWNlID0gb2Zmc2V0ICsgd2lkdGggLSBtYXhXaWR0aDtcbiAgICAgIG91dGVyU3R5bGVzID0ge1xuICAgICAgICBtYXJnaW5MZWZ0OiBvZmZzZXQgLSBtaXNzaW5nU3BhY2UsXG4gICAgICAgIHdpZHRoOiB3aWR0aFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ZXJTdHlsZXMgPSB7XG4gICAgICAgIG1hcmdpbkxlZnQ6IDAsXG4gICAgICAgIHdpZHRoOiBcIjEwMCVcIlxuICAgICAgfTtcbiAgICB9XG4gICAgb3V0ZXJTdHlsZXMudG9wID0gdG9wICsgXCJweFwiO1xuICAgIHJldHVybiB7XG4gICAgICBvdXRlcjogb3V0ZXJTdHlsZXMsXG4gICAgICBhZGRDbGFzczogYWRkQ2xhc3NcbiAgICB9O1xuICB9LFxuXG4gIGNhbGN1bGF0ZU91dGVyU3R5bGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGlzSUUoOCwnbHRlJykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0eWxlcyA9IHRoaXMuY2FsY3VsYXRlU3R5bGVzKCk7XG4gICAgdmFyIGNsYXNzTmFtZSA9IFwic2VhcmNoLW1vZGFsIFwiICsgKHN0eWxlcy5hZGRDbGFzcyA/IHN0eWxlcy5hZGRDbGFzcyA6IFwiXCIpO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzTmFtZSwgc3R5bGU6IHN0eWxlcy5vdXRlcn0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xvc2UtYnV0dG9uXCIsIG9uY2xpY2s6IHRoaXMuaGlkZX0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbiwge3RLZXk6IFwiY2xvc2VcIn0sIFwiY2xvc2VcIikpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInNlYXJjaC1tb2RhbC1jb250ZW50XCIsIHJlZjogXCJpbm5lclwifSwgdGhpcy5wcm9wcy5jaGlsZHJlbilcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbFBpY2tlcjtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgTW9kYWxQaWNrZXIgPSByZXF1aXJlKFwiLi8uLi9Nb2RhbFBpY2tlci5qc3hcIik7XG52YXIgUGxhY2VQaWNrZXIgPSByZXF1aXJlKFwiLi9jb21wb25lbnRzL1BsYWNlUGlja2VyLmpzeFwiKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoXCIuLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4XCIpO1xudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZScpO1xuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGluaXRpYWxWYWx1ZTogbmV3IFNlYXJjaFBsYWNlKCksXG4gIGxvY2FsZTogXCJlblwiLFxuICBzaXplczoge1xuICAgIGFsbDoge3dpZHRoOiA2MDAsIGhlaWdodDogMjAwfSxcbiAgICBuZWFyYnk6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY2hlYXBlc3Q6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY2l0aWVzQW5kQWlycG9ydHM6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgY291bnRyaWVzOiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxuICAgIGFueXdoZXJlOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9LFxuICAgIHJhZGl1czoge3dpZHRoOiAxNjksIGhlaWdodDogMjAwfVxuICB9LFxuICBtb2Rlczoge1xuICAgIFwiYWxsXCI6IHt9LFxuICAgIFwibmVhcmJ5XCI6IHt9LFxuICAgIFwiY2hlYXBlc3RcIjoge30sXG4gICAgXCJjaXRpZXNBbmRBaXJwb3J0c1wiOiB7fSxcbiAgICBcImNvdW50cmllc1wiOiB7fSxcbiAgICBcImFueXdoZXJlXCI6IHt9LFxuICAgIFwicmFkaXVzXCI6IHt9XG4gIH1cbn07XG5cbnZhciBQbGFjZVBpY2tlck1vZGFsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlUGlja2VyTW9kYWxcIixcbiAgZ2V0T3B0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLnByb3BzLm9wdGlvbnMpO1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb3B0aW9uczoge31cbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnRTaXplOiB7d2lkdGg6IDE2OSwgaGVpZ2h0OiAyMDB9XG4gICAgfTtcbiAgfSxcbiAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSk7XG4gIH0sXG4gIG9uU2l6ZUNoYW5nZTogZnVuY3Rpb24gKHNpemVzKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb250ZW50U2l6ZTogc2l6ZXNcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGRlZXBtZXJnZShkZWZhdWx0T3B0aW9ucyx0aGlzLmdldE9wdGlvbnMoKSk7XG4gICAgaWYgKCF0aGlzLnByb3BzLnNob3duKSB7cmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKX1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNb2RhbFBpY2tlciwge2NvbnRlbnRTaXplOiB0aGlzLnN0YXRlLmNvbnRlbnRTaXplLCBpbnB1dEVsZW1lbnQ6IHRoaXMucHJvcHMuaW5wdXRFbGVtZW50LCBvbkhpZGU6IHRoaXMucHJvcHMub25IaWRlfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VQaWNrZXIsIHt2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgcmVmOiBcInBsYWNlUGlja2VyXCIsIG9uQ2hhbmdlOiB0aGlzLm9uVmFsdWVDaGFuZ2UsIHNpemVzOiBvcHRpb25zLnNpemVzLCBtb2Rlczogb3B0aW9ucy5tb2Rlcywgb25TaXplQ2hhbmdlOiB0aGlzLm9uU2l6ZUNoYW5nZX1cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlUGlja2VyTW9kYWw7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciB0ZXN0U2hpdCA9IG51bGw7XG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xuUmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi8uLi90ci5qcycpO1xuXG52YXIgUGxhY2VzID0gcmVxdWlyZSgnLi9QbGFjZXMuanN4Jyk7XG52YXIgTW9kYWxNZW51TWl4aW4gPSByZXF1aXJlKCcuLy4uLy4uL01vZGFsTWVudU1peGluLmpzeCcpO1xudmFyIFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIFJhZGl1cyA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9SYWRpdXMuanN4Jyk7XG5cbnZhciBhaXJwb3J0c0FuZENpdGllc1R5cGVzID0gW1BsYWNlLlRZUEVfQ0lUWSwgUGxhY2UuVFlQRV9BSVJQT1JUXTtcbnZhciBjb3VudHJ5VHlwZXMgPSBbUGxhY2UuVFlQRV9DT1VOVFJZXTtcblxudmFyIFBsYWNlUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlUGlja2VyXCIsXG4gIG1peGluczogW01vZGFsTWVudU1peGluXSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld01vZGU6IHRoaXMuZ2V0RGVmYXVsdE1vZGUoKVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBsYW5nOiAnZW4nXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0TW9kZTogZnVuY3Rpb24gKCkge1xuICAgIC8vRklSU1QgVkVSU0lPTiAtIEFMTCBBTkQgQ09VTlRSSUVTXG5cbiAgICAvL2lmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgIT0gXCJ0ZXh0XCIgfHwgdGhpcy5wcm9wcy52YWx1ZS5pc0RlZmF1bHQpIHtcbiAgICAvLyAgcmV0dXJuIFwiY291bnRyaWVzXCI7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcbiAgICAvL31cblxuICAgIC8vU0VDT05EIFZFUlNJT05cblxuICAgIC8vaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICAvLyAgcmV0dXJuIFwiYWxsXCI7XG4gICAgLy99IGVsc2UgaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcInRleHRcIikge1xuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcbiAgICAvL30gZWxzZSBpZiAodGhpcy5wcm9wcy52YWx1ZS5tb2RlID09IFwiYW55d2hlcmVcIikge1xuICAgIC8vICByZXR1cm4gXCJhbnl3aGVyZVwiO1xuICAgIC8vfSBlbHNlIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJyYWRpdXNcIikge1xuICAgIC8vICByZXR1cm4gXCJyYWRpdXNcIjtcbiAgICAvL30gZWxzZSB7XG4gICAgLy8gIHJldHVybiBcImFsbFwiO1xuICAgIC8vfVxuXG4gICAgLy9USElSRCBWRVJTSU9OXG4gICAgY29uc29sZS5sb2coXCJkZWZhdWx0Pz8/XCIpO1xuICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLmZvcm1Nb2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy52YWx1ZS5mb3JtTW9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiYWxsXCI7XG4gICAgfVxuXG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgdGhpcy5wcm9wcy5vblNpemVDaGFuZ2UodGhpcy5wcm9wcy5zaXplc1ttb2RlXSk7XG4gIH0sXG5cbiAgLy9UT0RPIG1vdmUgaXQgdG8gb3B0aW9uc1xuICBnZXRNb2RlTGFiZWw6IGZ1bmN0aW9uIChtb2RlKSB7XG4gICAgdmFyIG1vZGVMYWJlbHMgPSB7XG4gICAgICBhbGw6IHRyKFwiQWxsIHBsYWNlc1wiLFwiYWxsXCIpLFxuICAgICAgbmVhcmJ5OiB0cihcIk5lYXJieVwiLFwibmVhcmJ5XCIpLFxuICAgICAgY2hlYXBlc3Q6IHRyKFwiQ2hlYXBlc3RcIixcImNoZWFwZXN0XCIpLFxuICAgICAgY2l0aWVzQW5kQWlycG9ydHM6IHRyKFwiQ2l0aWVzIGFuZCBhaXJwb3J0c1wiLFwiY2l0aWVzX2FuZF9haXJwb3J0c1wiKSxcbiAgICAgIGNvdW50cmllczogdHIoXCJDb3VudHJpZXNcIixcImNvdW50cmllc1wiKSxcbiAgICAgIGFueXdoZXJlOiB0cihcIkFueXdoZXJlXCIsXCJhbnl3aGVyZVwiKSxcbiAgICAgIHJhZGl1czogdHIoXCJSYWRpdXMgc2VhcmNoXCIsXCJyYWRpdXNcIilcbiAgICB9O1xuICAgIHJldHVybiBtb2RlTGFiZWxzW21vZGVdO1xuICB9LFxuXG4gIHN3aXRjaE1vZGVUbzogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSAge1xuICAgICAgaWYgKG1vZGUgPT0gXCJyYWRpdXNcIikge1xuICAgICAgICB0aGlzLnNlbGVjdFZhbHVlKG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJyYWRpdXNcIiwgdmFsdWU6IG5ldyBSYWRpdXMoKX0pKTtcbiAgICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RWYWx1ZShuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwiYW55d2hlcmVcIn0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy52YWx1ZSwgXCJjaGFuZ2VNb2RlXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3BzLm9uU2l6ZUNoYW5nZSh0aGlzLnByb3BzLnNpemVzW21vZGVdKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2aWV3TW9kZTogbW9kZVxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpXG4gIH0sXG5cbiAgY2hlY2tNb2RlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcInRleHRcIiAmJiAhdGhpcy5wcm9wcy52YWx1ZS5pc0RlZmF1bHQpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXdNb2RlICE9IFwiYWxsXCIpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmlld01vZGU6IFwiYWxsXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgaWYgKG5leHRQcm9wcy52YWx1ZSAhPSB0aGlzLnByb3BzLnZhbHVlKSB7XG4gICAgICB0aGlzLmNoZWNrTW9kZSgpO1xuICAgIH1cbiAgfSxcblxuICBzZWxlY3RWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZS5zZXQoXCJmb3JtTW9kZVwiLHRoaXMuc3RhdGUudmlld01vZGUpLCBcInNlbGVjdFwiKTtcbiAgfSxcblxuICByZW5kZXJBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlfSk7XG4gIH0sXG5cbiAgcmVuZGVyTmVhcmJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VzLCB7c2VhcmNoOiB0aGlzLnByb3BzLnZhbHVlLCBvblNlbGVjdDogdGhpcy5zZWxlY3RWYWx1ZSwgbmVhcmJ5OiB0cnVlfSk7XG4gIH0sXG5cbiAgcmVuZGVyQ2hlYXBlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXCJzc3NcIikpXG4gIH0sXG5cbiAgcmVuZGVyQ2l0aWVzQW5kQWlycG9ydHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlLCB0eXBlczogYWlycG9ydHNBbmRDaXRpZXNUeXBlc30pO1xuICB9LFxuXG4gIHJlbmRlckNvdW50cmllczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlcywge3NlYXJjaDogdGhpcy5wcm9wcy52YWx1ZSwgb25TZWxlY3Q6IHRoaXMuc2VsZWN0VmFsdWUsIHR5cGVzOiBjb3VudHJ5VHlwZXN9KTtcbiAgfSxcblxuICByZW5kZXJBbnl3aGVyZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSlcbiAgfSxcblxuICByZW5kZXJSYWRpdXM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG5cbiAgICB2YXIgbW9kZU9wdGlvbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpbW9kZSBpbiB0aGlzLnByb3BzLm1vZGVzKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5tb2Rlc1tpbW9kZV0pIHtcbiAgICAgICAgbW9kZU9wdGlvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IGltb2RlLCBjbGFzc05hbWU6ICAobW9kZSA9PSBpbW9kZSkgPyBcImFjdGl2ZVwiIDogXCJcIiwgb25DbGljazogIHRoaXMuc3dpdGNoTW9kZVRvKGltb2RlKSB9LCAgdGhpcy5nZXRNb2RlTGFiZWwoaW1vZGUpICkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICdzZWFyY2gtcGxhY2UtcGlja2VyIHNlYXJjaC1waWNrZXIgJyttb2RlfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJtb2RlLXNlbGVjdG9yXCJ9LCBcbiAgICAgICAgICBtb2RlT3B0aW9uc1xuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnRcIn0sIFxuICAgICAgICAgICB0aGlzLnJlbmRlckJvZHkoKSBcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbGVhci1ib3RoXCJ9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2VQaWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFBsYWNlUm93ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlUm93XCIsXG4gIGNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdCh0aGlzLnByb3BzLnBsYWNlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsYWNlID0gdGhpcy5wcm9wcy5wbGFjZTtcbiAgICB2YXIgY2xhc3NOYW1lID0gXCJwbGFjZS1yb3dcIjtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgY2xhc3NOYW1lICs9IFwiIHNlbGVjdGVkXCI7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IGNsYXNzTmFtZSwgb25DbGljazogdGhpcy5jbGlja30sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcIm5hbWVcIn0sIFxuICAgICAgICAgIHBsYWNlLmdldE5hbWUoKVxuICAgICAgICApLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJ0eXBlXCJ9LCBcbiAgICAgICAgICBwbGFjZS5nZXRUeXBlKClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxufSk7XG4gbW9kdWxlLmV4cG9ydHMgPSBQbGFjZVJvdztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFBsYWNlc0FQSSA9IHJlcXVpcmUoJy4vLi4vLi4vQVBJcy9QbGFjZXNBUElDYWNoZWQuanN4Jyk7XG52YXIgUGxhY2VSb3cgPSByZXF1aXJlKCcuL1BsYWNlUm93LmpzeCcpO1xudmFyIEdlb2xvY2F0aW9uID0gcmVxdWlyZSgnLi8uLi8uLi9HZW9sb2NhdGlvbi5qc3gnKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuLy4uLy4uL3N0b3Jlcy9PcHRpb25zU3RvcmUuanN4Jyk7XG5cblxuZnVuY3Rpb24gZmluZFBvcyhvYmopIHtcbiAgdmFyIGN1cnRvcCA9IDA7XG4gIGlmIChvYmoub2Zmc2V0UGFyZW50KSB7XG4gICAgZG8ge1xuICAgICAgY3VydG9wICs9IG9iai5vZmZzZXRUb3A7XG4gICAgfSB3aGlsZSAob2JqID0gb2JqLm9mZnNldFBhcmVudCk7XG4gICAgcmV0dXJuIFtjdXJ0b3BdO1xuICB9XG59XG5cbnZhciBQbGFjZXMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiUGxhY2VzXCIsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhc3RTZWFyY2g6IG51bGwsXG4gICAgICBsYXN0VHlwZXM6IG51bGwsXG4gICAgICBsYXN0TmVhcmJ5OiBudWxsLFxuICAgICAgcGxhY2VzOiBbXSxcbiAgICAgIGtleVNlbGVjdGVkSW5kZXg6IC0xLFxuICAgICAgYXBpRXJyb3I6IGZhbHNlLFxuICAgICAgbG9hZGluZzogZmFsc2VcbiAgICB9O1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcblxuICBrZXlwcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS5rZXlJZGVudGlmaWVyID09IFwiVXBcIikge1xuICAgICAgdGhpcy5tb3ZlVXAoKTtcbiAgICB9IGVsc2UgaWYgKGUua2V5SWRlbnRpZmllciA9PSBcIkRvd25cIikge1xuICAgICAgdGhpcy5tb3ZlRG93bigpO1xuICAgIH0gZWxzZSBpZiAoZS5rZXlJZGVudGlmaWVyID09IFwiRW50ZXJcIikge1xuICAgICAgdGhpcy5zZWxlY3RGcm9tSW5kZXgoKTtcbiAgICB9XG4gIH0sXG5cbiAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUua2V5U2VsZWN0ZWRJbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4IC0gMVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IHRoaXMuc3RhdGUucGxhY2VzLmxlbmd0aCAtIDFcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuXG4gIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG51bU9mUGxhY2VzID0gdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoO1xuICAgIGlmICh0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggPCB0aGlzLnN0YXRlLnBsYWNlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiB0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggKyAxXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogMFxuICAgICAgfSlcbiAgICB9XG4gIH0sXG5cbiAgc2VsZWN0RnJvbUluZGV4OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZWxlY3QodGhpcy5zdGF0ZS5wbGFjZXNbdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4XSk7XG4gIH0sXG5cbiAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucmVmcy5wbGFjZXMgJiYgdGhpcy5yZWZzLnNlbGVjdGVkUGxhY2UpIHtcbiAgICAgIHZhciBwbGFjZXNFbGVtZW50ID0gdGhpcy5yZWZzLnBsYWNlcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgc2VsZWN0ZWRFbGVtZW50ID0gdGhpcy5yZWZzLnNlbGVjdGVkUGxhY2UuZ2V0RE9NTm9kZSgpO1xuICAgICAgcGxhY2VzRWxlbWVudC5zY3JvbGxUb3AgPSBmaW5kUG9zKHNlbGVjdGVkRWxlbWVudCkgLSAyMDA7XG4gICAgfVxuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hlY2tOZXdQbGFjZXMoKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleXByZXNzKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlwcmVzcyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICB0aGlzLmNoZWNrTmV3UGxhY2VzKCk7XG4gICAgdGhpcy5hZGp1c3RTY3JvbGwoKTtcbiAgfSxcblxuICBmaWx0ZXJQbGFjZXNCeVR5cGU6IGZ1bmN0aW9uIChwbGFjZXMgLCB0eXBlcykge1xuICAgIGlmICh0eXBlcykge1xuICAgICAgcmV0dXJuIHBsYWNlcy5maWx0ZXIoZnVuY3Rpb24ocGxhY2UpICB7XG4gICAgICAgIHJldHVybiB0eXBlcy5pbmRleE9mKHBsYWNlLmdldFR5cGVJZCgpKSAhPSAtMTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGxhY2VzO1xuICAgIH1cbiAgfSxcblxuICAvL1RPRE8gcmVmYWN0b3JlIC0gbmVhcmJ5IHNob3VsZCBiZSBzZXBhcmF0ZSBmcm9tIHRleHRcbiAgc2V0U2VhcmNoVGV4dDogZnVuY3Rpb24gKHNlYXJjaFRleHQpIHtcbiAgICB2YXIgcGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSSh7bGFuZzogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0XG4gICAgfSk7XG4gICAgdmFyIGNhbGxGdW5jUGFyYW07XG4gICAgaWYgKHRoaXMucHJvcHMubmVhcmJ5KSB7XG4gICAgICBjYWxsRnVuY1BhcmFtID0gcGxhY2VzQVBJLmZpbmROZWFyYnkoR2VvbG9jYXRpb24uZ2V0Q3VycmVudEJvdW5kcygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbEZ1bmNQYXJhbSA9IHBsYWNlc0FQSS5maW5kQnlOYW1lKHNlYXJjaFRleHQpOyAvL1RPRE9cbiAgICB9XG5cbiAgICBjYWxsRnVuY1BhcmFtLnRoZW4oZnVuY3Rpb24ocGxhY2VzKSAge1xuICAgICAgaWYgKHNlYXJjaFRleHQgIT0gdGhpcy5zdGF0ZS5zZWFyY2hUZXh0IHx8ICF0aGlzLmlzTW91bnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBmaWx0ZXJlZFBsYWNlcyA9IHRoaXMuZmlsdGVyUGxhY2VzQnlUeXBlKHBsYWNlcywgdGhpcy5wcm9wcy50eXBlcyk7XG4gICAgICB2YXIgbGltaXRlZFBsYWNlcyA9IGZpbHRlcmVkUGxhY2VzLnNsaWNlKDAsNTApO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHBsYWNlczogbGltaXRlZFBsYWNlcyxcbiAgICAgICAgYXBpRXJyb3I6IGZhbHNlLFxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKS5jYXRjaChmdW5jdGlvbihlcnJvcikgIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHBsYWNlczogW10sXG4gICAgICAgIGFwaUVycm9yOiB0cnVlLFxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZWxlY3Q6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QoIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogdmFsdWV9KSApO1xuICB9LFxuXG4gIGdldFRleHRUb1NlYXJjaDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnNlYXJjaC5tb2RlID09IFwidGV4dFwiICYmICF0aGlzLnByb3BzLnNlYXJjaC5pc0RlZmF1bHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLnNlYXJjaC5nZXRUZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgfSxcblxuICBjaGVja05ld1BsYWNlczogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0VG9TZWFyY2ggPSB0aGlzLmdldFRleHRUb1NlYXJjaCgpO1xuICAgIGlmICh0aGlzLnN0YXRlLmxhc3RTZWFyY2ggIT09IHRleHRUb1NlYXJjaCkge1xuICAgICAgdGhpcy5zZXRTZWFyY2hUZXh0KHRleHRUb1NlYXJjaCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbGFzdFNlYXJjaDogdGV4dFRvU2VhcmNoLFxuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmxhc3RUeXBlcyAhPSB0aGlzLnByb3BzLnR5cGVzKSB7XG4gICAgICB0aGlzLnNldFNlYXJjaFRleHQodGV4dFRvU2VhcmNoKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBsYXN0VHlwZXM6IHRoaXMucHJvcHMudHlwZXMsXG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IC0xXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubGFzdE5lYXJieSAhPSB0aGlzLnByb3BzLm5lYXJieSkge1xuICAgICAgdGhpcy5zZXRTZWFyY2hUZXh0KHRleHRUb1NlYXJjaCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbGFzdE5lYXJieTogdGhpcy5wcm9wcy5uZWFyYnksXG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IC0xXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cblxuICByZW5kZXJQbGFjZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGxhY2VzID0gdGhpcy5zdGF0ZS5wbGFjZXM7XG4gICAgdmFyIHNlbGVjdGVkID0gcGxhY2VzW3RoaXMuc3RhdGUua2V5U2VsZWN0ZWRJbmRleF07XG4gICAgcmV0dXJuIHBsYWNlcy5tYXAoZnVuY3Rpb24ocGxhY2UpICB7XG4gICAgICBpZiAoc2VsZWN0ZWQgPT0gcGxhY2UpIHtcbiAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlUm93LCB7cmVmOiBcInNlbGVjdGVkUGxhY2VcIiwgc2VsZWN0ZWQ6IHNlbGVjdGVkID09IHBsYWNlLCBvblNlbGVjdDogdGhpcy5zZWxlY3QsIHBsYWNlOiBwbGFjZX0pKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlUm93LCB7b25TZWxlY3Q6IHRoaXMuc2VsZWN0LCBwbGFjZTogcGxhY2V9KSlcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBsb2FkZXJDbGFzcyA9IFwibG9hZGVyIFwiICsgKHRoaXMuc3RhdGUubG9hZGluZyA/IFwibG9hZGluZ1wiIDogXCJub3QtbG9hZGluZ1wiKTtcbiAgICB2YXIgbm9SZXN1bHRzQ2xhc3MgPSBcIm5vLXJlc3VsdHNcIjtcbiAgICBpZiAoIXRoaXMuc3RhdGUubG9hZGluZyAmJiB0aGlzLnN0YXRlLnBsYWNlcy5sZW5ndGggPT0gMCkge1xuICAgICAgbm9SZXN1bHRzQ2xhc3MgKz0gXCIgc2hvd25cIlxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBsb2FkZXJDbGFzc30sIFwiTG9hZGluZy4uLlwiKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogbm9SZXN1bHRzQ2xhc3N9LCBcIk5vIHJlc3VsdHNcIiksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwicGxhY2VzXCIsIGNsYXNzTmFtZTogXCJwbGFjZXNcIn0sIFxuICAgICAgICAgIHRoaXMucmVuZGVyUGxhY2VzKClcbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxuXG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlcztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgRGF0ZVBpY2tlck1vZGFsID0gcmVxdWlyZSgnLi8uLi9EYXRlUGlja2VyL0RhdGVQaWNrZXJNb2RhbC5qc3gnKTtcbnZhciBQbGFjZVBpY2tlck1vZGFsID0gcmVxdWlyZSgnLi8uLi9QbGFjZVBpY2tlci9QbGFjZVBpY2tlck1vZGFsLmpzeCcpO1xuXG5cbnZhciBTZWFyY2hGb3JtU3RvcmUgPSByZXF1aXJlKCcuLy4uL3N0b3Jlcy9TZWFyY2hGb3JtU3RvcmUuanN4Jyk7XG5cbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4Jyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL3RyLmpzJyk7XG52YXIgVHJhbiA9IHJlcXVpcmUoJy4vLi4vVHJhbi5qc3gnKTtcblxudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcblxudmFyIG9wdGlvbnMgPSB7XG4gIG9yaWdpbjoge1xuICAgIG1vZGVzOiB7XG4gICAgICBhbGw6IHRydWUsXG4gICAgICBuZWFyYnk6IHRydWUsXG4gICAgICBjaGVhcGVzdDogZmFsc2UsXG4gICAgICBjaXRpZXNBbmRBaXJwb3J0czogZmFsc2UsXG4gICAgICBjb3VudHJpZXM6IHRydWUsXG4gICAgICBhbnl3aGVyZTogZmFsc2UsXG4gICAgICByYWRpdXM6IHRydWVcbiAgICB9XG4gIH0sXG4gIGRlc3RpbmF0aW9uOiB7XG4gICAgbW9kZXM6IHtcbiAgICAgIGFsbDogdHJ1ZSxcbiAgICAgIG5lYXJieTogZmFsc2UsXG4gICAgICBjaGVhcGVzdDogZmFsc2UsXG4gICAgICBjaXRpZXNBbmRBaXJwb3J0czogZmFsc2UsXG4gICAgICBjb3VudHJpZXM6IHRydWUsXG4gICAgICBhbnl3aGVyZTogdHJ1ZSxcbiAgICAgIHJhZGl1czogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgZGF0ZUZyb206IHtcbiAgICBtb2Rlczoge1xuICAgICAgc2luZ2xlOiB0cnVlLFxuICAgICAgaW50ZXJ2YWw6IHRydWUsXG4gICAgICBtb250aDogdHJ1ZSxcbiAgICAgIHRpbWVUb1N0YXk6IGZhbHNlLFxuICAgICAgYW55dGltZTogdHJ1ZSxcbiAgICAgIG5vUmV0dXJuOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgZGF0ZVRvOiB7XG4gICAgbW9kZXM6IHtcbiAgICAgIHNpbmdsZTogdHJ1ZSxcbiAgICAgIGludGVydmFsOiB0cnVlLFxuICAgICAgbW9udGg6IHRydWUsXG4gICAgICB0aW1lVG9TdGF5OiB0cnVlLFxuICAgICAgYW55dGltZTogdHJ1ZSxcbiAgICAgIG5vUmV0dXJuOiB0cnVlXG4gICAgfVxuICB9XG59O1xuXG5cblxudmFyIFNlYXJjaEZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiU2VhcmNoRm9ybVwiLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFjdGl2ZTogXCJvcmlnaW5cIixcbiAgICAgIGRhdGE6IFNlYXJjaEZvcm1TdG9yZS5kYXRhXG4gICAgfTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblxuICB9LFxuICBjcmVhdGVNb2RhbENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuc2V0QXR0cmlidXRlKCdjbGFzcycsICdtb2RhbC1jb250YWluZXItZWxlbWVudCcpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICByZXR1cm4gZGl2O1xuICB9LFxuXG4gIGNoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkYXRhOiBTZWFyY2hGb3JtU3RvcmUuZGF0YVxuICAgIH0pXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBTZWFyY2hGb3JtU3RvcmUuZXZlbnRzLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZUxpc3RlbmVyKTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBTZWFyY2hGb3JtU3RvcmUuZXZlbnRzLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZUxpc3RlbmVyKTtcbiAgfSxcbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGRhdGVQaWNrZXJGYWN0b3J5ID0gUmVhY3QuY3JlYXRlRmFjdG9yeShEYXRlUGlja2VyTW9kYWwpO1xuICAgIHZhciBwbGFjZVBpY2tlckZhY3RvcnkgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFBsYWNlUGlja2VyTW9kYWwpO1xuXG4gICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgdGhpcy5jb21wb25lbnRzLmRhdGVGcm9tID0gUmVhY3QucmVuZGVyKGRhdGVQaWNrZXJGYWN0b3J5KCksIHRoaXMuY3JlYXRlTW9kYWxDb250YWluZXIoKSk7XG4gICAgdGhpcy5jb21wb25lbnRzLmRhdGVUbyA9IFJlYWN0LnJlbmRlcihkYXRlUGlja2VyRmFjdG9yeSgpLCB0aGlzLmNyZWF0ZU1vZGFsQ29udGFpbmVyKCkpO1xuICAgIHRoaXMuY29tcG9uZW50cy5vcmlnaW4gPSBSZWFjdC5yZW5kZXIocGxhY2VQaWNrZXJGYWN0b3J5KCksIHRoaXMuY3JlYXRlTW9kYWxDb250YWluZXIoKSk7XG4gICAgdGhpcy5jb21wb25lbnRzLmRlc3RpbmF0aW9uID0gUmVhY3QucmVuZGVyKHBsYWNlUGlja2VyRmFjdG9yeSgpLCB0aGlzLmNyZWF0ZU1vZGFsQ29udGFpbmVyKCkpO1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5jb21wb25lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgIHRoaXMuY29tcG9uZW50c1trZXldLnNldFByb3BzKHtcbiAgICAgICAgaW5wdXRFbGVtZW50OiB0aGlzLnJlZnNba2V5ICsgXCJPdXRlclwiXS5nZXRET01Ob2RlKCksXG4gICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLmRhdGFba2V5XSxcbiAgICAgICAgb25IaWRlOiBmdW5jdGlvbigpICB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlID09IGtleSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgIGFjdGl2ZTogXCJcIlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMuY2hhbmdlVmFsdWVGdW5jKGtleSksXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNba2V5XVxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMubW9kYWxDb21wb25lbnRzTG9hZGVkID0gdHJ1ZTtcbiAgICB0aGlzLnJlZnJlc2hTaG93bigpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVmcmVzaFNob3duKCk7XG4gIH0sXG5cbiAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLmRhdGFbZmllbGROYW1lXTtcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gXCJcIjtcbiAgICBpZiAoZmllbGROYW1lID09IFwib3JpZ2luXCIgfHwgZmllbGROYW1lID09IFwiZGVzdGluYXRpb25cIikge1xuICAgICAgcmV0dXJuIHZhbHVlLmdldFRleHQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbHVlLmZvcm1hdCgpO1xuICAgIH1cbiAgfSxcblxuICBuZXh0RmllbGQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBvcmRlciA9IFtcbiAgICAgIFwib3JpZ2luXCIsXG4gICAgICBcImRlc3RpbmF0aW9uXCIsXG4gICAgICBcImRhdGVGcm9tXCIsXG4gICAgICBcImRhdGVUb1wiLFxuICAgICAgXCJzdWJtaXRCdXR0b25cIlxuICAgIF07XG4gICAgdmFyIGluZGV4ID0gb3JkZXIuaW5kZXhPZih0aGlzLnN0YXRlLmFjdGl2ZSk7XG4gICAgdmFyIG5ld0luZGV4O1xuICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IDMpIHtcbiAgICAgIG5ld0luZGV4ID0gaW5kZXgrMVxuICAgIH0gZWxzZSBpZiAoaW5kZXggPT0gNCkge1xuICAgICAgLy9UT0RPIGZvY3VzIG9uIHNlYXJjaCBidG5cbiAgICAgIG5ld0luZGV4ID0gLTFcbiAgICB9XG4gICAgdmFyIG5ld0FjdGl2ZSA9IG9yZGVyW25ld0luZGV4XTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGFjdGl2ZTogbmV3QWN0aXZlXG4gICAgfSk7XG4gIH0sXG4gIGNoYW5nZVZhbHVlRnVuYzogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgY2hhbmdlVHlwZSkgIHtcbiAgICAgIGlmIChjaGFuZ2VUeXBlID09IFwiY2hhbmdlTW9kZVwiKSB7XG4gICAgICAgIC8vdGhpcy5yZWZzW2ZpZWxkTmFtZV0uZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICAgIC8vVE9ETyByZXR1cm4gaGVyZT8/P1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZVR5cGUgPT0gXCJzZWxlY3RcIikge1xuICAgICAgICB0aGlzLm5leHRGaWVsZCgpO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmtleXModGhpcy5jb21wb25lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgICAgU2VhcmNoRm9ybVN0b3JlLnNldFZhbHVlKHRoaXMuc3RhdGUuZGF0YS5jaGFuZ2VGaWVsZChmaWVsZE5hbWUsIHZhbHVlKSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIG9uRm9jdXNGdW5jOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhY3RpdmU6IGZpZWxkTmFtZVxuICAgICAgfSk7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLmRhdGFbZmllbGROYW1lXTtcbiAgICAgIGlmICh2YWx1ZS5tb2RlICE9IFwidGV4dFwiIHx8IHZhbHVlLmlzRGVmYXVsdCkge1xuICAgICAgICB0aGlzLnJlZnNbZmllbGROYW1lXS5nZXRET01Ob2RlKCkuc2VsZWN0KCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpXG4gIH0sXG5cbiAgY2hhbmdlVGV4dEZ1bmM6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcbiAgICBpZiAoZmllbGROYW1lID09IFwib3JpZ2luXCIgfHwgZmllbGROYW1lID09IFwiZGVzdGluYXRpb25cIikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpICB7XG4gICAgICAgIHZhciBhZGRTdGF0ZSA9IHt9O1xuICAgICAgICBTZWFyY2hGb3JtU3RvcmUuc2V0VmFsdWUodGhpcy5zdGF0ZS5kYXRhLmNoYW5nZUZpZWxkKGZpZWxkTmFtZSwgbmV3IFNlYXJjaFBsYWNlKGUudGFyZ2V0LnZhbHVlKSkpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKGFkZFN0YXRlKTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSAge307XG4gICAgfVxuICB9LFxuXG4gIG9uQ2xpY2tPdXRlckZ1bmM6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIGlmICh0eXBlID09IHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogXCJcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub25Gb2N1c0Z1bmModHlwZSkoKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcylcbiAgfSxcbiAgb25DbGlja0lubmVyOiBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgcmVmcmVzaEZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRvbU5vZGU7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICBkb21Ob2RlID0gdGhpcy5yZWZzW3RoaXMuc3RhdGUuYWN0aXZlXS5nZXRET01Ob2RlKCk7XG4gICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPSBkb21Ob2RlKSB7XG4gICAgICAgIGRvbU5vZGUuZm9jdXMoKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYWN0aXZlICE9IFwic3VibWl0QnV0dG9uXCIpIHtcbiAgICAgICAgICB2YXIgYWN0aXZlVmFsdWUgPSB0aGlzLnN0YXRlLmRhdGFbdGhpcy5zdGF0ZS5hY3RpdmVdO1xuICAgICAgICAgIGlmIChhY3RpdmVWYWx1ZS5tb2RlICE9IFwidGV4dFwiIHx8IGFjdGl2ZVZhbHVlLmlzRGVmYXVsdCkge1xuICAgICAgICAgICAgZG9tTm9kZS5zZWxlY3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgc2VhcmNoOiBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBTZWFyY2hGb3JtU3RvcmUuc2VhcmNoKCk7XG4gIH0sXG5cbiAgZ2V0RmllbGRMYWJlbDogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgbW9kZUxhYmVscyA9IHtcbiAgICAgIG9yaWdpbjogdHIoXCJGcm9tXCIsXCJmcm9tXCIpLFxuICAgICAgZGVzdGluYXRpb246IHRyKFwiVG9cIixcInRvXCIpLFxuICAgICAgZGF0ZUZyb206IHRyKFwiRGVwYXJ0XCIsXCJkYXRlXCIpLFxuICAgICAgZGF0ZVRvOiB0cihcIlJldHVyblwiLFwicmV0dXJuXCIpXG4gICAgfTtcbiAgICByZXR1cm4gbW9kZUxhYmVsc1ttb2RlXTtcbiAgfSxcblxuICByZWZyZXNoU2hvd246IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5tb2RhbENvbXBvbmVudHNMb2FkZWQpIHtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuY29tcG9uZW50cykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50c1trZXldLnNldFByb3BzKHtcbiAgICAgICAgICB2YWx1ZTogdGhpcy5zdGF0ZS5kYXRhW2tleV0sXG4gICAgICAgICAgc2hvd246IGtleSA9PSB0aGlzLnN0YXRlLmFjdGl2ZVxuICAgICAgICB9KTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICB0aGlzLnJlZnJlc2hGb2N1cygpO1xuICAgIH1cbiAgfSxcbiAgcmVuZGVySW5wdXQ6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgZmFJY29uQ2xhc3MgPSBcImZhIGZhLWNhcmV0LWRvd25cIjtcbiAgICBpZiAodHlwZSA9PSB0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgZmFJY29uQ2xhc3MgPSBcImZhIGZhLWNhcmV0LXVwXCJcbiAgICB9XG4gICAgdmFyIGNsYXNzTmFtZSA9IHR5cGU7XG4gICAgaWYgKHRoaXMuc3RhdGUuZGF0YVt0eXBlXS5lcnJvcikge1xuICAgICAgY2xhc3NOYW1lICs9IFwiIGVycm9yXCJcbiAgICB9XG4gICAgaWYgKHRoaXMuc3RhdGUuZGF0YVt0eXBlXS5sb2FkaW5nKSB7XG4gICAgICBjbGFzc05hbWUgKz0gXCIgbG9hZGluZ1wiXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZmllbGRzZXRcIiwge1xuICAgICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZSwgXG4gICAgICAgIHJlZjogdHlwZSArIFwiT3V0ZXJcIiwgXG4gICAgICAgIG9uQ2xpY2s6IHRoaXMub25DbGlja091dGVyRnVuYyh0eXBlKVxuICAgICAgfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJoZWFkXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIiwgbnVsbCwgdGhpcy5nZXRGaWVsZExhYmVsKHR5cGUpKSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJpbnB1dC13cmFwcGVyXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XG4gICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmdldEZvcm1hdHRlZFZhbHVlKHR5cGUpLCBcbiAgICAgICAgICAgICAgb25DbGljazogdGhpcy5vbkNsaWNrSW5uZXIsIFxuICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNGdW5jKHR5cGUpLCBcbiAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsIFxuICAgICAgICAgICAgICByZWY6IHR5cGUsIFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VUZXh0RnVuYyh0eXBlKSwgXG4gICAgICAgICAgICAgIGF1dG9Db21wbGV0ZTogXCJvZmZcIn1cbiAgICAgICAgICAgIClcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXNwaW5uZXJcIn0pLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYlwiLCB7Y2xhc3NOYW1lOiBcInRvZ2dsZVwifSwgXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBmYUljb25DbGFzc30pXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZm9ybVwiLCB7aWQ6IFwic2VhcmNoXCJ9LCBcbiAgICAgICAgdGhpcy5yZW5kZXJJbnB1dChcIm9yaWdpblwiKSwgXG4gICAgICAgIHRoaXMucmVuZGVySW5wdXQoXCJkZXN0aW5hdGlvblwiKSwgXG4gICAgICAgIHRoaXMucmVuZGVySW5wdXQoXCJkYXRlRnJvbVwiKSwgXG4gICAgICAgIHRoaXMucmVuZGVySW5wdXQoXCJkYXRlVG9cIiksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtvbkNsaWNrOiB0aGlzLnNlYXJjaCwgaWQ6IFwic2VhcmNoLWZsaWdodHNcIiwgcmVmOiBcInN1Ym1pdEJ1dHRvblwiLCBjbGFzc05hbWU6IFwiYnRuLXNlYXJjaFwifSwgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgUmVhY3QuY3JlYXRlRWxlbWVudChUcmFuLCB7dEtleTogXCJzZWFyY2hcIn0sIFwiU2VhcmNoXCIpKSwgUmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge2NsYXNzTmFtZTogXCJmYSBmYS1zZWFyY2hcIn0pKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaEZvcm07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciB0ciA9IHJlcXVpcmUoJy4vdHIuanMnKTtcblxuLyogcmVhY3QgY29tcG9uZW50IHdyYXBwZXIgb2YgdHIgZnVuY3Rpb24gKi9cblxudmFyIFRyYW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiVHJhblwiLFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcmlnaW5hbCA9IHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgdmFyIGtleSA9IHRoaXMucHJvcHMudEtleTtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5wcm9wcy52YWx1ZXM7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFxuICAgICAgICAgdHIob3JpZ2luYWwsa2V5LHZhbHVlcykgXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFJhZGl1cyA9IHJlcXVpcmUoXCIuL1JhZGl1cy5qc3hcIik7XG5cblxuICBmdW5jdGlvbiBPcHRpb25zKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcGxhaW4gPSBwbGFpbiB8fCB7fTtcbiAgICBpZiAod2luZG93LlNLWVBJQ0tFUl9MTkcpIHtcbiAgICAgIHRoaXMubGFuZ3VhZ2UgPSB3aW5kb3cuU0tZUElDS0VSX0xORy50b0xvd2VyQ2FzZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxhbmd1YWdlID0gcGxhaW4ubGFuZ3VhZ2UgfHwgXCJlblwiO1xuICAgIH1cblxuICAgIHRoaXMuZGVmYXVsdFJhZGl1cyA9IHBsYWluLmRlZmF1bHRSYWRpdXMgfHwgbmV3IFJhZGl1cygpO1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgT3B0aW9ucy5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbmV3UGxhaW4gPSB7XG4gICAgICBsYW5ndWFnZTogdGhpcy5sYW5ndWFnZSxcbiAgICAgIGRlZmF1bHRSYWRpdXM6IHRoaXMuZGVmYXVsdFJhZGl1c1xuICAgIH07XG4gICAgbmV3UGxhaW5ba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiBuZXcgT3B0aW9ucyhuZXdQbGFpbik7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBPcHRpb25zO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB0eXBlSWRUb1N0cmluZyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKHR5cGUgPT0gUGxhY2UuVFlQRV9BSVJQT1JUKSB7XG4gICAgcmV0dXJuIFwiYWlycG9ydFwiO1xuICB9IGVsc2UgaWYgKHR5cGUgPT0gUGxhY2UuVFlQRV9DT1VOVFJZKSB7XG4gICAgcmV0dXJuIFwiY291bnRyeVwiO1xuICB9IGVsc2UgaWYgKHR5cGUgPT0gUGxhY2UuVFlQRV9DSVRZKSB7XG4gICAgcmV0dXJuIFwiY2l0eVwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcInVua25vd25cIjtcbiAgfVxufTtcblxuXG5cblxuICBmdW5jdGlvbiBQbGFjZShwbGFpbikge1widXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5rZXlzKHBsYWluKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgIHRoaXNba2V5XSA9IHBsYWluW2tleV07XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICBpZiAodHlwZW9mIHRoaXMuY29tcGxldGUgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5jb21wbGV0ZSA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMudHlwZVN0cmluZyA9IHR5cGVJZFRvU3RyaW5nKHRoaXMudHlwZSk7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBQbGFjZS5wcm90b3R5cGUuZ2V0TmFtZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfTtcbiAgUGxhY2UucHJvdG90eXBlLmdldElkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmlkO1xuICB9O1xuICBQbGFjZS5wcm90b3R5cGUuZ2V0VHlwZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy50eXBlU3RyaW5nO1xuICB9O1xuICBQbGFjZS5wcm90b3R5cGUuZ2V0VHlwZUlkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnR5cGVcbiAgfTtcbiAgIFxuICAgICAgXG4gICAgICAgIFxuICAgIFxuICBcblxuXG5QbGFjZS5UWVBFX0FJUlBPUlQgPSAwO1xuUGxhY2UuVFlQRV9DT1VOVFJZID0gMTtcblBsYWNlLlRZUEVfQ0lUWSA9IDI7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuXG5mdW5jdGlvbiByb3VuZChudW0pIHtcbiAgcmV0dXJuIE1hdGgucm91bmQobnVtICogMTAwKSAvIDEwMDtcbn1cblxuXG4gIGZ1bmN0aW9uIFJhZGl1cyhwbGFpbikge1widXNlIHN0cmljdFwiO1xuICAgIHBsYWluID0gcGxhaW4gfHwge307XG4gICAgdGhpcy5yYWRpdXMgPSAgcGxhaW4ucmFkaXVzIHx8IDI1MDtcbiAgICB0aGlzLmxhdCA9ICBwbGFpbi5sYXQgfHwgNTA7XG4gICAgdGhpcy5sbmcgPSAgcGxhaW4ubG5nIHx8IDE2O1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgUmFkaXVzLnByb3RvdHlwZS5nZXRUZXh0PWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiBcIlwiICsgcm91bmQodGhpcy5sYXQpICsgXCIsIFwiICsgcm91bmQodGhpcy5sbmcpICsgXCIgKFwiICsgdGhpcy5yYWRpdXMgKyBcImttKVwiO1xuICB9O1xuICBSYWRpdXMucHJvdG90eXBlLmdldFVybFN0cmluZz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gXCJcIiArIHJvdW5kKHRoaXMubGF0KSArIFwiLVwiICsgcm91bmQodGhpcy5sbmcpICsgXCItXCIgKyB0aGlzLnJhZGl1cyArIFwia21cIjtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJhZGl1cztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKFwiZGVlcG1lcmdlXCIpO1xuXG52YXIgdXJsRGF0ZUZvcm1hdCA9IFwiWVlZWS1NTS1ERFwiO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi90ci5qcycpO1xuXG4vKlxuY2xhc3MgU2VhcmNoRGF0ZVxuaXQgaGFzIHN0YXRlIGZvciBhbGwgbW9kZXMsIGJ1ZGUgZm9yXG4gIGNvbnN0cnVjdG9yXG4gIGlucHV0ID0gcGxhaW4gb2JqZWN0IG9yIHN0cmluZyBvciBqdXN0IGFub3RoZXIgU2VhcmNoRGF0ZSBvYmplY3RcbiAqL1xudmFyIFNlYXJjaERhdGUgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgdmFyIHBsYWluID0ge307XG4gIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJzdHJpbmdcIikge1xuICAgIHBsYWluID0gdGhpcy5wYXJzZVVybFN0cmluZyhpbnB1dCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09IFwib2JqZWN0XCIpIHtcbiAgICBwbGFpbiA9IGlucHV0O1xuICB9XG4gIHRoaXMubW9kZSA9IHR5cGVvZihwbGFpbi5tb2RlKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLm1vZGUgOiBcInNpbmdsZVwiO1xuICB0aGlzLmZyb20gPSB0eXBlb2YocGxhaW4uZnJvbSkgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi5mcm9tIDogbW9tZW50LnV0YygpO1xuICB0aGlzLnRvID0gdHlwZW9mKHBsYWluLnRvKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLnRvIDogbW9tZW50LnV0YygpO1xuICB0aGlzLm1pblN0YXlEYXlzID0gdHlwZW9mKHBsYWluLm1pblN0YXlEYXlzKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLm1pblN0YXlEYXlzIDogMjtcbiAgdGhpcy5tYXhTdGF5RGF5cyA9IHR5cGVvZihwbGFpbi5tYXhTdGF5RGF5cykgIT0gJ3VuZGVmaW5lZCcgPyBwbGFpbi5tYXhTdGF5RGF5cyA6IDEwO1xuICB0aGlzLmZpbmFsID0gdHlwZW9mKHBsYWluLmZpbmFsKSAhPSAndW5kZWZpbmVkJz8gcGxhaW4uZmluYWwgOiB0cnVlO1xuICBPYmplY3QuZnJlZXplKHRoaXMpO1xufTtcblxuLyogc2V0cyBtb2RlIHdpdGggY2hlY2tpbmcgc29tZSBpbnRlcm5hbCB2YWxpZGl0eSAqL1xuLyogYnV0IHByb2JhYmx5IHZhbGl0aXR5IHNob3VsZCBiZSBoYW5kbGVkIGJ5IGdldHRlcnMsIGJlY2F1c2UgaXQgaXMgbmljZSB0byBoYXZlIGludGVybmFsIHN0YXRlIGZvciBvdGhlcnMgbW9kZXMgdGhhbiBlbmFibGVkICovXG5cbi8vU2VhcmNoRGF0ZS5wcm90b3R5cGUuc2V0TW9kZSA9IGZ1bmN0aW9uKG1vZGUpIHtcbi8vICB2YXIgcHJldmlvdXNNb2RlID0gdGhpcy5tb2RlO1xuLy8gIGlmIChtb2RlID09IFwic2luZ2xlXCIpIHtcbi8vICAgIHRoaXMudG8gPSB0aGlzLmZyb207XG4vLyAgfSBlbHNlIGlmIChtb2RlID09IFwiYW55dGltZVwiKSB7XG4vLyAgICB0aGlzLmZyb20gPSBtb21lbnQudXRjKCkuYWRkKDEsIFwiZGF5c1wiKTtcbi8vICAgIHRoaXMudG8gPSBtb21lbnQudXRjKCkuYWRkKDYsIFwibW9udGhzXCIpO1xuLy8gIH1cbi8vICB0aGlzLm1vZGUgPSBtb2RlO1xuLy99O1xuXG5cblxuU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5tb2RlXG59O1xuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRGcm9tID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGUgPT0gXCJ0aW1lVG9TdGF5XCIgfHwgdGhpcy5tb2RlID09IFwibm9SZXR1cm5cIikge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcImFueXRpbWVcIikge1xuICAgIHJldHVybiBtb21lbnQudXRjKCkuYWRkKDEsXCJkYXlzXCIpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLmZyb21cbiAgfVxufTtcblxuU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0VG8gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIiB8fCB0aGlzLm1vZGUgPT0gXCJub1JldHVyblwiKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tXG4gIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwiYW55dGltZVwiKSB7XG4gICAgcmV0dXJuIG1vbWVudC51dGMoKS5hZGQoNixcIm1vbnRoc1wiKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGhpcy50bykge1xuICAgICAgcmV0dXJuIHRoaXMudG9cbiAgICB9IGVsc2Uge1xuICAgICAgLy9qdXN0IGZvciBjYXNlcyB3aGVuIHRoZSB2YWx1ZSBpcyBub3QgZmlsbGVkIChub3QgY29tcGxldGUgaW50ZXJ2YWwpXG4gICAgICByZXR1cm4gdGhpcy5mcm9tXG4gICAgfVxuICB9XG59O1xuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5nZXREYXRlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgIHJldHVybiB0aGlzLmZyb21cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59O1xuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRNaW5TdGF5RGF5cyA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiKSB7XG4gICAgcmV0dXJuIHRoaXMubWluU3RheURheXM7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cblNlYXJjaERhdGUucHJvdG90eXBlLmdldE1heFN0YXlEYXlzID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGUgPT0gXCJ0aW1lVG9TdGF5XCIpIHtcbiAgICByZXR1cm4gdGhpcy5tYXhTdGF5RGF5cztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuU2VhcmNoRGF0ZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5tb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9tLmZvcm1hdChcImxcIilcbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJ0aW1lVG9TdGF5XCIpIHtcbiAgICByZXR1cm4gdGhpcy5taW5TdGF5RGF5cysgXCIgLSBcIiArIHRoaXMubWF4U3RheURheXMgKyBcIiBkYXlzXCJcbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJpbnRlcnZhbFwiIHx8IHRoaXMubW9kZSA9PSBcIm1vbnRoXCIpIHtcbiAgICB2YXIgdG9EYXRlU3RyaW5nO1xuICAgIGlmICghdGhpcy50bykge1xuICAgICAgdG9EYXRlU3RyaW5nID0gXCJfXCJcbiAgICB9IGVsc2Uge1xuICAgICAgdG9EYXRlU3RyaW5nID0gdGhpcy50by5mb3JtYXQoXCJsXCIpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZyb20uZm9ybWF0KFwibFwiKSArIFwiIC0gXCIgKyB0b0RhdGVTdHJpbmdcbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJhbnl0aW1lXCIpIHtcbiAgICByZXR1cm4gdHIoXCJBbnl0aW1lXCIsIFwiYW55dGltZVwiKTtcbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJub1JldHVyblwiKSB7XG4gICAgcmV0dXJuIHRyKFwiTm8gcmV0dXJuXCIsIFwibm9fcmV0dXJuX2xhYmVsXCIpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLm1vZGVcbiAgfVxufTtcblxuXG4vKiB3YSB1cmwgKi9cblNlYXJjaERhdGUucHJvdG90eXBlLnRvVXJsU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm1vZGUgKyBcIl9cIiArIHRoaXMuZnJvbS5mb3JtYXQodXJsRGF0ZUZvcm1hdCkgKyBcIl9cIiArIHRoaXMudG8uZm9ybWF0KHVybERhdGVGb3JtYXQpO1xufTtcblxuLypcbiAgSnVzdCBwYXJzZSBpdCwgcmV0dXJuIHBsYWluIG1pbmltYWwvaW5jb21wbGV0ZSB2ZXJzaW9uIG9mIFNlYXJjaERhdGUgb2JqZWN0XG4gKi9cblNlYXJjaERhdGUucHJvdG90eXBlLnBhcnNlVXJsU3RyaW5nID0gZnVuY3Rpb24oc3RyaW5nRGF0ZSkge1xuICBpZiAoc3RyaW5nRGF0ZS5pbmRleE9mKFwiX1wiKSAhPT0gLTEpIHtcbiAgICB2YXIgc3BsaXQgPSBzdHJpbmdEYXRlLnNwbGl0KFwiX1wiKTtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kZTogc3BsaXRbMF0sXG4gICAgICBmcm9tOiBtb21lbnQudXRjKHNwbGl0WzFdLCB1cmxEYXRlRm9ybWF0KSxcbiAgICAgIHRvOiBtb21lbnQudXRjKHNwbGl0WzJdLCB1cmxEYXRlRm9ybWF0KVxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGU6IFwic2luZ2xlXCIsXG4gICAgICBmcm9tOiBtb21lbnQudXRjKHN0cmluZ0RhdGUsIHVybERhdGVGb3JtYXQpLFxuICAgICAgdG86IG1vbWVudC51dGMoc3RyaW5nRGF0ZSwgdXJsRGF0ZUZvcm1hdClcbiAgICB9O1xuICB9XG59O1xuXG5cbi8vVE9ETyBtb3ZlIHRoaXMgbWV0aG9kIHRvIHBhcmVudCBvYmplY3QgSW1tdXRhYmxlXG4vKipcbiAqIHJldHVybiBuZXcgb2JqZWN0IHdpdGggYWRkZWQgY2hhbmdlcywgaWYgbm8gY2hhbmdlIHJldHVybiBzYW1lIG9iamVjdFxuICogQHBhcmFtIG5ld1ZhbHVlc1xuICogQHJldHVybnMge1NlYXJjaERhdGV9XG4gKi9cblNlYXJjaERhdGUucHJvdG90eXBlLmVkaXQgPSBmdW5jdGlvbihuZXdWYWx1ZXMpe1xuICBpZiAoIW5ld1ZhbHVlcykge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHZhciBsZWFzdE9uZUVkaXQgPSBmYWxzZTtcbiAgdmFyIG5ld1BsYWluID0ge307XG4gIC8vQWRkIGZyb20gdGhpc1xuICBPYmplY3Qua2V5cyh0aGlzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICBuZXdQbGFpbltrZXldID0gdGhpc1trZXldO1xuICB9LmJpbmQodGhpcykpO1xuICAvL0FkZCBmcm9tIG5ld1xuICBPYmplY3Qua2V5cyhuZXdWYWx1ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgIGlmIChuZXdQbGFpbltrZXldICE9PSBuZXdWYWx1ZXNba2V5XSkge1xuICAgICAgbmV3UGxhaW5ba2V5XSA9IG5ld1ZhbHVlc1trZXldO1xuICAgICAgbGVhc3RPbmVFZGl0ID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuICBpZiAobGVhc3RPbmVFZGl0KSB7XG4gICAgcmV0dXJuIG5ldyBTZWFyY2hEYXRlKG5ld1BsYWluKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG59O1xuXG4vKiBqdXN0IGhlbHBlciBmdW5jdGlvbiBpZiBpIG1vZGUgaXMgbm90IHNldCAqL1xuU2VhcmNoRGF0ZS5ndWVzc01vZGVGcm9tUGxhaW4gPSBmdW5jdGlvbiAocGxhaW4pIHtcbiAgaWYgKHBsYWluLm1pblN0YXlEYXlzICYmIHBsYWluLm1heFN0YXlEYXlzKSB7XG4gICAgcmV0dXJuIFwidGltZVRvU3RheVwiO1xuICB9IGVsc2UgaWYgKCFwbGFpbi5mcm9tKSB7XG4gICAgcmV0dXJuIFwibm9SZXR1cm5cIjtcbiAgfSBlbHNlIGlmIChwbGFpbi5mcm9tID09IHBsYWluLnRvKSB7XG4gICAgcmV0dXJuIFwic2luZ2xlXCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFwiaW50ZXJ2YWxcIjtcbiAgfVxufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaERhdGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vU2VhcmNoUGxhY2UuanN4Jyk7XG52YXIgU2VhcmNoRGF0ZSA9IHJlcXVpcmUoJy4vU2VhcmNoRGF0ZS5qc3gnKTtcbnZhciBEYXRlUGFpclZhbGlkYXRvciA9IHJlcXVpcmUoJy4vLi4vdG9vbHMvRGF0ZVBhaXJWYWxpZGF0b3IuanN4Jyk7XG5cbnZhciBkYXRlQ29ycmVjdG9yID0ge307XG5kYXRlQ29ycmVjdG9yLmNvcnJlY3QgPSBmdW5jdGlvbiAoZGF0YSwgZGlyZWN0aW9uKSB7XG4gIHZhciBlcnJvciA9IERhdGVQYWlyVmFsaWRhdG9yLnZhbGlkYXRlKFxuICAgIGRhdGEuZGF0ZUZyb20sXG4gICAgZGF0YS5kYXRlVG9cbiAgKTtcbiAgaWYgKGVycm9yID09IFwiY3Jvc3NlZERhdGVzXCIpIHtcbiAgICBpZiAoZGlyZWN0aW9uID09IFwiZGF0ZUZyb21cIikge1xuICAgICAgcmV0dXJuIGRhdGEuZGF0ZVRvID0gZGF0YS5kYXRlRnJvbTtcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBcImRhdGVUb1wiKSB7XG4gICAgICByZXR1cm4gZGF0YS5kYXRlRnJvbSA9IGRhdGEuZGF0ZVRvO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGF0YTtcbn07XG5cblxuXG4gIGZ1bmN0aW9uIFNlYXJjaEZvcm1EYXRhKGlucHV0KSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHBsYWluID0gaW5wdXQgfHwge307XG4gICAgdGhpcy5kYXRlRnJvbSA9IHBsYWluLmRhdGVGcm9tIHx8IG5ldyBTZWFyY2hEYXRlKCk7XG4gICAgdGhpcy5kYXRlVG8gPSBwbGFpbi5kYXRlVG8gfHwgbmV3IFNlYXJjaERhdGUoe2Zyb206IG1vbWVudCgpLmFkZCgxLCBcIm1vbnRoc1wiKX0pO1xuICAgIHRoaXMub3JpZ2luID0gcGxhaW4ub3JpZ2luIHx8IG5ldyBTZWFyY2hQbGFjZShcIlwiLCB0cnVlKTtcbiAgICB0aGlzLmRlc3RpbmF0aW9uID0gcGxhaW4uZGVzdGluYXRpb24gfHwgbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcIlwifSwgdHJ1ZSk7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuXG4gIC8qIGltbXV0YWJsZSAqL1xuICBTZWFyY2hGb3JtRGF0YS5wcm90b3R5cGUuY2hhbmdlRmllbGQ9ZnVuY3Rpb24odHlwZSwgdmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbmV3UGxhaW4gPSB7XG4gICAgICBkYXRlRnJvbTogdGhpcy5kYXRlRnJvbSxcbiAgICAgIGRhdGVUbzogdGhpcy5kYXRlVG8sXG4gICAgICBvcmlnaW46IHRoaXMub3JpZ2luLFxuICAgICAgZGVzdGluYXRpb246IHRoaXMuZGVzdGluYXRpb25cbiAgICB9O1xuICAgIG5ld1BsYWluW3R5cGVdID0gdmFsdWU7XG4gICAgaWYgKHR5cGUgPT0gXCJkYXRlVG9cIiB8fCB0eXBlID09IFwiZGF0ZUZyb21cIikge1xuICAgICAgZGF0ZUNvcnJlY3Rvci5jb3JyZWN0KG5ld1BsYWluLCB0eXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTZWFyY2hGb3JtRGF0YShuZXdQbGFpbik7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hGb3JtRGF0YTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgUGxhY2UgPSByZXF1aXJlKCcuL1BsYWNlLmpzeCcpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi90ci5qcycpO1xudmFyIEltbXV0YWJsZSA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlLmpzeCcpO1xuXG52YXIgZGVmYXVsdFZhbHVlcyA9IHtcbiAgbW9kZTogXCJ0ZXh0XCIsIC8qIG1vZGVzOiB0ZXh0LCBwbGFjZSwgYW55d2hlcmUsIHJhZGl1cywgLi4uICAhISBpdCBpcyBzaW1pbGFyIGFzIG1vZGVzIGluIHBsYWNlUGlja2VyIGJ1dCBub3QgZXhhY3RseSBzYW1lICovXG4gIHZhbHVlOiBcIlwiLFxuICBpc0RlZmF1bHQ6IGZhbHNlIC8qIHRoaXMgaXMgc2V0IG9ubHkgd2hlbiB5b3Ugd2FudCB0byB1c2UgdGV4dCBhcyBwcmVkZWZpbmVkIHZhbHVlICovXG59O1xuXG5mdW5jdGlvbiBtYWtlUGxhaW4oaW5wdXQpIHtcbiAgdmFyIHBsYWluID0ge307XG4gIGlmICh0eXBlb2YgaW5wdXQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBwbGFpbi5tb2RlID0gXCJ0ZXh0XCI7XG4gICAgcGxhaW4udmFsdWUgPSBcIlwiO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PSAnc3RyaW5nJykge1xuICAgIHBsYWluLm1vZGUgPSBcInRleHRcIjtcbiAgICBwbGFpbi52YWx1ZSA9IGlucHV0O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PSBcIm9iamVjdFwiKSB7XG4gICAgcGxhaW4gPSBpbnB1dDtcbiAgfVxuICByZXR1cm4gcGxhaW5cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVNb2RlcyhkYXRhKSB7XG4gIGlmIChkYXRhLm1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICBpZiAodHlwZW9mIGRhdGEudmFsdWUgIT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwid3JvbmcgdHlwZSBvZiB2YWx1ZVwiKTtcbiAgICB9XG4gIH1cbiAgaWYgKGRhdGEubW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICBpZiAoICEoZGF0YS52YWx1ZSBpbnN0YW5jZW9mIFBsYWNlKSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIndyb25nIHR5cGUgb2YgdmFsdWVcIik7XG4gICAgfVxuICB9XG59XG5cblxuZm9yKHZhciBJbW11dGFibGVfX19fS2V5IGluIEltbXV0YWJsZSl7aWYoSW1tdXRhYmxlLmhhc093blByb3BlcnR5KEltbXV0YWJsZV9fX19LZXkpKXtTZWFyY2hQbGFjZVtJbW11dGFibGVfX19fS2V5XT1JbW11dGFibGVbSW1tdXRhYmxlX19fX0tleV07fX12YXIgX19fX1N1cGVyUHJvdG9PZkltbXV0YWJsZT1JbW11dGFibGU9PT1udWxsP251bGw6SW1tdXRhYmxlLnByb3RvdHlwZTtTZWFyY2hQbGFjZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlKTtTZWFyY2hQbGFjZS5wcm90b3R5cGUuY29uc3RydWN0b3I9U2VhcmNoUGxhY2U7U2VhcmNoUGxhY2UuX19zdXBlckNvbnN0cnVjdG9yX189SW1tdXRhYmxlO1xuICBmdW5jdGlvbiBTZWFyY2hQbGFjZShpbnB1dCwgaXNEZWZhdWx0KSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHBsYWluID0gbWFrZVBsYWluKGlucHV0KTtcbiAgICB0aGlzLm1vZGUgPSBwbGFpbi5tb2RlIHx8IFwidGV4dFwiO1xuICAgIHRoaXMuZm9ybU1vZGUgPSBwbGFpbi5mb3JtTW9kZSB8fCBcImFsbFwiO1xuICAgIHRoaXMudmFsdWUgPSBwbGFpbi52YWx1ZSB8fCBcIlwiO1xuICAgIHRoaXMuaXNEZWZhdWx0ID0gcGxhaW4uaXNEZWZhdWx0IHx8IGlzRGVmYXVsdDtcbiAgICB0aGlzLmVycm9yID0gcGxhaW4uZXJyb3IgfHwgXCJcIjtcbiAgICB0aGlzLmxvYWRpbmcgPSBwbGFpbi5sb2FkaW5nIHx8IGZhbHNlO1xuXG4gICAgdmFsaWRhdGVNb2Rlcyh0aGlzKTtcblxuXG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRNb2RlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLm1vZGU7XG4gIH07XG5cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldFZhbHVlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9O1xuXG4gIC8qIHNob3duIHRleHQgKi9cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldFRleHQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG1vZGUgPSB0aGlzLm1vZGU7XG4gICAgaWYgKG1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAgIHJldHVybiB0cihcIkFueXdoZXJlXCIsXCJhbnl3aGVyZVwiKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXROYW1lKCk7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicmFkaXVzXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldFRleHQoKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJpZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgLyogbmFtZSBvZiBwbGFjZSAqL1xuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0TmFtZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBjb25zb2xlLndhcm4oXCJnZXROYW1lIHNob3VsZG4ndCBiZSB1c2VkXCIpO1xuICAgIHJldHVybiB0aGlzLmdldFVybFN0cmluZygpO1xuICB9O1xuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRVcmxTdHJpbmc9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG1vZGUgPSB0aGlzLm1vZGU7XG4gICAgaWYgKG1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAgIHJldHVybiBcImFueXdoZXJlXCI7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicGxhY2VcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0TmFtZSgpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInJhZGl1c1wiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXRVcmxTdHJpbmcoKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJpZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldElkPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBtb2RlID0gdGhpcy5tb2RlO1xuICAgIGlmIChtb2RlID09IFwidGV4dFwiKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XG4gICAgICByZXR1cm4gXCJhbnl3aGVyZVwiO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldElkKCk7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiaWRcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXRQbGFjZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodGhpcy5nZXRNb2RlKCkgPT0gXCJwbGFjZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuXG4gIC8vVE9ETyBtb3ZlIHRoaXMgbWV0aG9kIHRvIHBhcmVudCBvYmplY3QgSW1tdXRhYmxlXG4gIC8qKlxuICAgKiByZXR1cm4gbmV3IG9iamVjdCB3aXRoIGFkZGVkIGNoYW5nZXMsIGlmIG5vIGNoYW5nZSByZXR1cm4gc2FtZSBvYmplY3RcbiAgICogQHBhcmFtIG5ld1ZhbHVlc1xuICAgKiBAcmV0dXJucyB7U2VhcmNoRGF0ZX1cbiAgICovXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5lZGl0PWZ1bmN0aW9uKG5ld1ZhbHVlcyl7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgaWYgKCFuZXdWYWx1ZXMpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgbGVhc3RPbmVFZGl0ID0gZmFsc2U7XG4gICAgdmFyIG5ld1BsYWluID0ge307XG4gICAgLy9BZGQgZnJvbSB0aGlzXG4gICAgT2JqZWN0LmtleXModGhpcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgICBuZXdQbGFpbltrZXldID0gdGhpc1trZXldO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gICAgLy9BZGQgZnJvbSBuZXdcbiAgICBPYmplY3Qua2V5cyhuZXdWYWx1ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgICAgaWYgKG5ld1BsYWluW2tleV0gIT09IG5ld1ZhbHVlc1trZXldKSB7XG4gICAgICAgIG5ld1BsYWluW2tleV0gPSBuZXdWYWx1ZXNba2V5XTtcbiAgICAgICAgbGVhc3RPbmVFZGl0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAobGVhc3RPbmVFZGl0KSB7XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKG5ld1BsYWluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH07XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaFBsYWNlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEltbXV0YWJsZSgpe1widXNlIHN0cmljdFwiO31cblxuICAvL1RPRE8gbW92ZSBpdCBoZXJlIGZyb20gY2hpbGRyZW4sIGdvYWwgaXMgdG8gaGF2ZSBjb21tb24gaW50ZXJmYWNlIGZvciBhbGwgb2YgdGhlbVxuXG4gIC8qKlxuICAgKiByZXR1cm4gbmV3IG9iamVjdCB3aXRoIGFkZGVkIGNoYW5nZXMsIGlmIG5vIGNoYW5nZSByZXR1cm4gc2FtZSBvYmplY3RcbiAgICogQHBhcmFtIG5ld1ZhbHVlc1xuICAgKiBAcmV0dXJucyB7U2VhcmNoRGF0ZX1cbiAgICovXG4gIC8vZWRpdChuZXdWYWx1ZXMpe1xuICAvLyAgaWYgKCFuZXdWYWx1ZXMpIHtcbiAgLy8gICAgcmV0dXJuIHRoaXM7XG4gIC8vICB9XG4gIC8vICB2YXIgbGVhc3RPbmVFZGl0ID0gZmFsc2U7XG4gIC8vICB2YXIgbmV3UGxhaW4gPSB7fTtcbiAgLy8gIC8vQWRkIGZyb20gdGhpc1xuICAvLyAgT2JqZWN0LmtleXModGhpcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gIC8vICAgIG5ld1BsYWluW2tleV0gPSB0aGlzW2tleV07XG4gIC8vICB9KTtcbiAgLy8gIC8vQWRkIGZyb20gbmV3XG4gIC8vICBPYmplY3Qua2V5cyhuZXdWYWx1ZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAvLyAgICBpZiAobmV3UGxhaW5ba2V5XSAhPT0gbmV3VmFsdWVzW2tleV0pIHtcbiAgLy8gICAgICBuZXdQbGFpbltrZXldID0gbmV3VmFsdWVzW2tleV07XG4gIC8vICAgICAgbGVhc3RPbmVFZGl0ID0gdHJ1ZTtcbiAgLy8gICAgfVxuICAvLyAgfSk7XG4gIC8vICBpZiAobGVhc3RPbmVFZGl0KSB7XG4gIC8vICAgIHJldHVybiBuZXcgU2VhcmNoRGF0ZShuZXdQbGFpbik7XG4gIC8vICB9IGVsc2Uge1xuICAvLyAgICByZXR1cm4gdGhpcztcbiAgLy8gIH1cbiAgLy9cbiAgLy99O1xuICAvKipcbiAgICogcmV0dXJuIGVkaXRlZCBvYmplY3RcbiAgICogQHBhcmFtIGtleVxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHJldHVybnMge1NlYXJjaERhdGV9XG4gICAqL1xuICBJbW11dGFibGUucHJvdG90eXBlLnNldD1mdW5jdGlvbihrZXksIHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG5ld1BsYWluID0ge307XG4gICAgbmV3UGxhaW5ba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzLmVkaXQobmV3UGxhaW4pXG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbW11dGFibGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBTZWFyY2hGb3JtID0gcmVxdWlyZSgnLi8uLi9TZWFyY2hGb3JtL1NlYXJjaEZvcm0uanN4Jyk7XG5cblxuICBmdW5jdGlvbiBTZWFyY2hGb3JtQWRhcHRlcihvcHRpb25zKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJvb3QgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFNlYXJjaEZvcm0pO1xuICAgIHRoaXMubW9kYWxDb21wb25lbnQgPSBSZWFjdC5yZW5kZXIocm9vdCgpLCBvcHRpb25zLmVsZW1lbnQpO1xuICB9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2hGb3JtQWRhcHRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBPcHRpb25zID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL09wdGlvbnMuanN4Jyk7XG5cblxuICBmdW5jdGlvbiBPcHRpb25zU3RvcmUoKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5kYXRhID0gbmV3IE9wdGlvbnMoKTtcbiAgfVxuICBPcHRpb25zU3RvcmUucHJvdG90eXBlLnNldFZhbHVlPWZ1bmN0aW9uKHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5kYXRhICE9IHZhbHVlKSB7XG4gICAgICB0aGlzLmRhdGEgPSB2YWx1ZTtcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9O1xuICBPcHRpb25zU3RvcmUucHJvdG90eXBlLnNldE9wdGlvbj1mdW5jdGlvbihrZXksIHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5kYXRhLnNldChrZXksIHZhbHVlKSk7XG4gIH07XG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE9wdGlvbnNTdG9yZSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIFNlYXJjaEZvcm1EYXRhID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaEZvcm1EYXRhLmpzeCcpO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1BsYWNlLmpzeCcpO1xudmFyIFEgPSByZXF1aXJlKCdxJyk7XG52YXIgUGxhY2VzQVBJID0gcmVxdWlyZSgnLi8uLi9BUElzL1BsYWNlc0FQSUNhY2hlZC5qc3gnKTtcbnZhciBPcHRpb25zU3RvcmUgPSByZXF1aXJlKCcuL09wdGlvbnNTdG9yZS5qc3gnKTtcblxuXG5cblxudmFyIGdldEZpcnN0RnJvbUFwaSA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gIHZhciBwbGFjZXNBUEkgPSBuZXcgUGxhY2VzQVBJKHtsYW5nOiBPcHRpb25zU3RvcmUuZGF0YS5sYW5ndWFnZX0pOy8vVE9ETyBwdXQgaGVyZSBvcHRpb25zXG4gIHJldHVybiBwbGFjZXNBUEkuZmluZEJ5TmFtZSh0ZXh0KS50aGVuKGZ1bmN0aW9uKHBsYWNlcykgIHtcbiAgICBpZiAocGxhY2VzWzBdKSB7XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiBuZXcgUGxhY2UocGxhY2VzWzBdKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInRleHRcIiwgdmFsdWU6IHRleHQsIGVycm9yOiBcIm5vdEZvdW5kXCJ9KTtcbiAgICB9XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcbiAgICBjb25zb2xlLmVycm9yKGVycik7XG4gIH0pXG59O1xuXG52YXIgZmluZEJ5SWRGcm9tQXBpID0gZnVuY3Rpb24gKGlkKSB7XG4gIHZhciBwbGFjZXNBUEkgPSBuZXcgUGxhY2VzQVBJKHtsYW5nOiBPcHRpb25zU3RvcmUuZGF0YS5sYW5ndWFnZX0pOy8vVE9ETyBwdXQgaGVyZSBvcHRpb25zXG4gIHJldHVybiBwbGFjZXNBUEkuZmluZEJ5SWQoaWQpLnRoZW4oZnVuY3Rpb24ocGxhY2UpICB7XG4gICAgaWYgKHBsYWNlKSB7XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInBsYWNlXCIsIHZhbHVlOiBwbGFjZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3N3aXRjaCB0byB0ZXh0IHdoZW4gaWQgbm90IGZvdW5kPz9cbiAgICAgIHJldHVybiBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwidGV4dFwiLCB2YWx1ZTogaWQsIGVycm9yOiBcIm5vdEZvdW5kXCJ9KTtcbiAgICB9XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgIHtcbiAgICBjb25zb2xlLmVycm9yKGVycik7XG4gIH0pXG59O1xuXG5cbi8qIHJldHVybnMgcHJvbWlzZSwgcHJvbWlzZSByZXNvbHZlcyB0cnVlIGlmIHRoZXJlIGlzIG5ldyB2YWx1ZSAqL1xudmFyIGZldGNoUGxhY2UgPSBmdW5jdGlvbihzZWFyY2hQbGFjZSkge1xuICBpZiAoc2VhcmNoUGxhY2UubW9kZSA9PSBcInBsYWNlXCIgJiYgc2VhcmNoUGxhY2UudmFsdWUuY29tcGxldGUpIHtcbiAgICByZXR1cm4gZmFsc2U7IC8qIGRvbid0IG5lZWQgdG8gYXN5bmMgbG9hZCAqL1xuICB9IGVsc2UgaWYgKHNlYXJjaFBsYWNlLm1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb21pc2U6IGZpbmRCeUlkRnJvbUFwaShzZWFyY2hQbGFjZS52YWx1ZS5pZCksXG4gICAgICB0ZW1wVmFsdWU6IG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogc2VhcmNoUGxhY2UudmFsdWUsIGxvYWRpbmc6IHRydWV9KVxuICAgIH07XG4gIH0gZWxzZSBpZiAoc2VhcmNoUGxhY2UubW9kZSA9PSBcInRleHRcIikge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9taXNlOiBnZXRGaXJzdEZyb21BcGkoc2VhcmNoUGxhY2UudmFsdWUpLFxuICAgICAgdGVtcFZhbHVlOiBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwidGV4dFwiLCB2YWx1ZTogc2VhcmNoUGxhY2UudmFsdWUsIGxvYWRpbmc6IHRydWV9KVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG4gIGZ1bmN0aW9uIFNlYXJjaEZvcm1TdG9yZSgpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLmV2ZW50cyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmRhdGEgPSBuZXcgU2VhcmNoRm9ybURhdGEoKTtcbiAgfVxuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLnNldFZhbHVlPWZ1bmN0aW9uKHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5kYXRhICE9IHZhbHVlKSB7XG4gICAgICB0aGlzLmRhdGEgPSB2YWx1ZTtcbiAgICAgIHRoaXMuZXZlbnRzLmVtaXQoJ2NoYW5nZScpO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9O1xuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLnNldEZpZWxkPWZ1bmN0aW9uKGZpZWxkTmFtZSwgdmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5zZXRWYWx1ZSh0aGlzLmRhdGEuY2hhbmdlRmllbGQoZmllbGROYW1lLCB2YWx1ZSkpO1xuICB9O1xuXG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuY29tcGxldGVGaWVsZD1mdW5jdGlvbihmaWVsZE5hbWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZmV0Y2hJbmZvID0gZmV0Y2hQbGFjZSh0aGlzLmRhdGFbZmllbGROYW1lXSk7XG4gICAgaWYgKGZldGNoSW5mbykge1xuICAgICAgdmFyICRfXzA9ICAgZmV0Y2hJbmZvLHByb21pc2U9JF9fMC5wcm9taXNlLHRlbXBWYWx1ZT0kX18wLnRlbXBWYWx1ZTtcbiAgICAgIHRoaXMuc2V0RmllbGQoZmllbGROYW1lLCB0ZW1wVmFsdWUpO1xuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihmdW5jdGlvbihmaW5hbFZhbHVlKSAge1xuICAgICAgICAvKiBvbmx5IGlmIGl0J3MgaXMgc3RpbGwgc2FtZSB2YWx1ZSBhcyBiZWZvcmUsIG5vdGhpbmcgbmV3ICovXG4gICAgICAgIGlmICh0ZW1wVmFsdWUgPT0gdGhpcy5kYXRhW2ZpZWxkTmFtZV0pIHtcbiAgICAgICAgICB0aGlzLnNldEZpZWxkKGZpZWxkTmFtZSwgZmluYWxWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7IC8vVE9ETyBkb250IGtub3cgd2hhdCB0byByZXR1cm4/Pz9cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLnRyaWdnZXJTZWFyY2g9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9UT0RPIGNoZWNrIGlmIHRoZXJlIGlzIGV2ZXJ5IGRhdGEgb2tcbiAgICB0aGlzLmV2ZW50cy5lbWl0KCdzZWFyY2gnKTtcbiAgfTtcbiAgLyogZmV0Y2ggZGlyZWN0aW9uIGFuZCByZXR1cm4gZGF0YSB3aXRoIHRlbXAgdmFsdWUgKi9cbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS5mZXRjaERpcmVjdGlvbj1mdW5jdGlvbihkYXRhLCBkaXJlY3Rpb24pIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZmV0Y2hJbmZvID0gZmV0Y2hQbGFjZShkYXRhW2RpcmVjdGlvbl0pO1xuICAgIGlmIChmZXRjaEluZm8pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb21pc2U6IGZldGNoSW5mby5wcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpICB7XG4gICAgICAgICAgcmV0dXJuIHtkaXJlY3Rpb246ZGlyZWN0aW9uLHZhbHVlOnZhbHVlfVxuICAgICAgICB9KSxcbiAgICAgICAgbmV3RGF0YTogZGF0YS5jaGFuZ2VGaWVsZChkaXJlY3Rpb24sIGZldGNoSW5mby50ZW1wVmFsdWUpXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuc2VhcmNoPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgIHZhciBuZXdUZW1wRGF0YSA9IHRoaXMuZGF0YTtcbiAgICB2YXIgb3JpZ2luTG9hZGluZ0luZm8gPSB0aGlzLmZldGNoRGlyZWN0aW9uKG5ld1RlbXBEYXRhLCBcIm9yaWdpblwiKTtcbiAgICBpZiAob3JpZ2luTG9hZGluZ0luZm8pIHtcbiAgICAgIHByb21pc2VzLnB1c2gob3JpZ2luTG9hZGluZ0luZm8ucHJvbWlzZSk7XG4gICAgICBuZXdUZW1wRGF0YSA9IG9yaWdpbkxvYWRpbmdJbmZvLm5ld0RhdGE7XG4gICAgfVxuICAgIHZhciBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvID0gdGhpcy5mZXRjaERpcmVjdGlvbihuZXdUZW1wRGF0YSwgXCJkZXN0aW5hdGlvblwiKTtcbiAgICBpZiAoZGVzdGluYXRpb25Mb2FkaW5nSW5mbykge1xuICAgICAgcHJvbWlzZXMucHVzaChkZXN0aW5hdGlvbkxvYWRpbmdJbmZvLnByb21pc2UpO1xuICAgICAgbmV3VGVtcERhdGEgPSBkZXN0aW5hdGlvbkxvYWRpbmdJbmZvLm5ld0RhdGE7XG4gICAgfVxuICAgIC8qIGlmIGFueSBvZiB0aGVzZSBuZWVkcyBsb2FkaW5nIHNhdmUgdGVtcG9yYXJ5IG9iamVjdHMgKi9cbiAgICBpZiAobmV3VGVtcERhdGEgIT0gdGhpcy5kYXRhKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKG5ld1RlbXBEYXRhKTtcbiAgICB9XG5cblxuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgbGFzdERhdGEgPSB0aGlzLmRhdGE7XG4gICAgICByZXR1cm4gUS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykgIHtcbiAgICAgICAgaWYgKGxhc3REYXRhICE9IHRoaXMuZGF0YSkgcmV0dXJuOyAvL2lmIHNvbWUgb3RoZXIgc2VhcmNoIGhhcyBvdXRyYW4gbWVcbiAgICAgICAgdmFyIG5ld0RhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgIHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbihyZXN1bHQpICB7XG4gICAgICAgICAgbmV3RGF0YSA9IG5ld0RhdGEuY2hhbmdlRmllbGQocmVzdWx0LmRpcmVjdGlvbiwgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUobmV3RGF0YSk7XG4gICAgICAgIHRoaXMudHJpZ2dlclNlYXJjaCgpO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9UT0RPIGNoZWNrIGlmIGlzIG5vdCBuZWVkZWQgbmV4dCB0aWNrXG4gICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcblxuICAgICAgLy9UT0RPIHJldHVybiBzb21lIHByb21pc2U/P1xuICAgIH1cblxuICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZWFyY2hGb3JtU3RvcmUoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLnZhbGlkYXRlID0gZnVuY3Rpb24ob3V0Ym91bmQsIGluYm91bmQpIHtcbiAgaWYgKCFvdXRib3VuZCkge1xuICAgIHJldHVybiBcIm91dGJvdW5kTm90U2VsZWN0ZWRcIlxuICB9XG4gIGlmICghaW5ib3VuZCkge1xuICAgIHJldHVybiBcImluYm91bmROb3RTZWxlY3RlZFwiXG4gIH1cblxuICBpZiAoaW5ib3VuZC5tb2RlID09IFwic2luZ2xlXCIgJiYgb3V0Ym91bmQubW9kZSA9PSBcInNpbmdsZVwiKSB7XG4gICAgaWYgKGluYm91bmQuZ2V0RGF0ZSgpLmZvcm1hdChcIllZWVlNTUREXCIpIDwgb3V0Ym91bmQuZ2V0RGF0ZSgpLmZvcm1hdChcIllZWVlNTUREXCIpKSB7XG4gICAgICByZXR1cm4gXCJjcm9zc2VkRGF0ZXNcIlxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuLyogIEdlb2Rlc3kgcmVwcmVzZW50YXRpb24gY29udmVyc2lvbiBmdW5jdGlvbnMgICAgICAgICAgICAgICAgICAgICAgIChjKSBDaHJpcyBWZW5lc3MgMjAwMi0yMDE0ICAqL1xuLyogICAtIHd3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JVCBMaWNlbmNlICAqL1xuLyogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogIFNhbXBsZSB1c2FnZTogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogICAgdmFyIGxhdCA9IEdlby5wYXJzZURNUygnNTHCsCAyOOKAsiA0MC4xMuKAsyBOJyk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiAgICB2YXIgbG9uID0gR2VvLnBhcnNlRE1TKCcwMDDCsCAwMOKAsiAwNS4zMeKAsyBXJyk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qICAgIHZhciBwMSA9IG5ldyBMYXRMb24obGF0LCBsb24pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuLyoganNoaW50IG5vZGU6dHJ1ZSAqLy8qIGdsb2JhbCBkZWZpbmUgKi9cbid1c2Ugc3RyaWN0JztcblxuXG4vKipcbiAqIFRvb2xzIGZvciBjb252ZXJ0aW5nIGJldHdlZW4gbnVtZXJpYyBkZWdyZWVzIGFuZCBkZWdyZWVzIC8gbWludXRlcyAvIHNlY29uZHMuXG4gKlxuICogQG5hbWVzcGFjZVxuICovXG52YXIgR2VvID0ge307XG5cblxuLy8gbm90ZSBVbmljb2RlIERlZ3JlZSA9IFUrMDBCMC4gUHJpbWUgPSBVKzIwMzIsIERvdWJsZSBwcmltZSA9IFUrMjAzM1xuXG5cbi8qKlxuICogUGFyc2VzIHN0cmluZyByZXByZXNlbnRpbmcgZGVncmVlcy9taW51dGVzL3NlY29uZHMgaW50byBudW1lcmljIGRlZ3JlZXMuXG4gKlxuICogVGhpcyBpcyB2ZXJ5IGZsZXhpYmxlIG9uIGZvcm1hdHMsIGFsbG93aW5nIHNpZ25lZCBkZWNpbWFsIGRlZ3JlZXMsIG9yIGRlZy1taW4tc2VjIG9wdGlvbmFsbHlcbiAqIHN1ZmZpeGVkIGJ5IGNvbXBhc3MgZGlyZWN0aW9uIChOU0VXKS4gQSB2YXJpZXR5IG9mIHNlcGFyYXRvcnMgYXJlIGFjY2VwdGVkIChlZyAzwrAgMzfigLIgMDnigLNXKS5cbiAqIFNlY29uZHMgYW5kIG1pbnV0ZXMgbWF5IGJlIG9taXR0ZWQuXG4gKlxuICogQHBhcmFtICAge3N0cmluZ3xudW1iZXJ9IGRtc1N0ciAtIERlZ3JlZXMgb3IgZGVnL21pbi9zZWMgaW4gdmFyaWV0eSBvZiBmb3JtYXRzLlxuICogQHJldHVybnMge251bWJlcn0gRGVncmVlcyBhcyBkZWNpbWFsIG51bWJlci5cbiAqL1xuR2VvLnBhcnNlRE1TID0gZnVuY3Rpb24oZG1zU3RyKSB7XG4gICAgLy8gY2hlY2sgZm9yIHNpZ25lZCBkZWNpbWFsIGRlZ3JlZXMgd2l0aG91dCBOU0VXLCBpZiBzbyByZXR1cm4gaXQgZGlyZWN0bHlcbiAgICBpZiAodHlwZW9mIGRtc1N0ciA9PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZShkbXNTdHIpKSByZXR1cm4gTnVtYmVyKGRtc1N0cik7XG5cbiAgICAvLyBzdHJpcCBvZmYgYW55IHNpZ24gb3IgY29tcGFzcyBkaXInbiAmIHNwbGl0IG91dCBzZXBhcmF0ZSBkL20vc1xuICAgIHZhciBkbXMgPSBTdHJpbmcoZG1zU3RyKS50cmltKCkucmVwbGFjZSgvXi0vLCcnKS5yZXBsYWNlKC9bTlNFV10kL2ksJycpLnNwbGl0KC9bXjAtOS4sXSsvKTtcbiAgICBpZiAoZG1zW2Rtcy5sZW5ndGgtMV09PScnKSBkbXMuc3BsaWNlKGRtcy5sZW5ndGgtMSk7ICAvLyBmcm9tIHRyYWlsaW5nIHN5bWJvbFxuXG4gICAgaWYgKGRtcyA9PSAnJykgcmV0dXJuIE5hTjtcblxuICAgIC8vIGFuZCBjb252ZXJ0IHRvIGRlY2ltYWwgZGVncmVlcy4uLlxuICAgIHZhciBkZWc7XG4gICAgc3dpdGNoIChkbXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMzogIC8vIGludGVycHJldCAzLXBhcnQgcmVzdWx0IGFzIGQvbS9zXG4gICAgICAgICAgICBkZWcgPSBkbXNbMF0vMSArIGRtc1sxXS82MCArIGRtc1syXS8zNjAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogIC8vIGludGVycHJldCAyLXBhcnQgcmVzdWx0IGFzIGQvbVxuICAgICAgICAgICAgZGVnID0gZG1zWzBdLzEgKyBkbXNbMV0vNjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOiAgLy8ganVzdCBkIChwb3NzaWJseSBkZWNpbWFsKSBvciBub24tc2VwYXJhdGVkIGRkZG1tc3NcbiAgICAgICAgICAgIGRlZyA9IGRtc1swXTtcbiAgICAgICAgICAgIC8vIGNoZWNrIGZvciBmaXhlZC13aWR0aCB1bnNlcGFyYXRlZCBmb3JtYXQgZWcgMDAzMzcwOVdcbiAgICAgICAgICAgIC8vaWYgKC9bTlNdL2kudGVzdChkbXNTdHIpKSBkZWcgPSAnMCcgKyBkZWc7ICAvLyAtIG5vcm1hbGlzZSBOL1MgdG8gMy1kaWdpdCBkZWdyZWVzXG4gICAgICAgICAgICAvL2lmICgvWzAtOV17N30vLnRlc3QoZGVnKSkgZGVnID0gZGVnLnNsaWNlKDAsMykvMSArIGRlZy5zbGljZSgzLDUpLzYwICsgZGVnLnNsaWNlKDUpLzM2MDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgfVxuICAgIGlmICgvXi18W1dTXSQvaS50ZXN0KGRtc1N0ci50cmltKCkpKSBkZWcgPSAtZGVnOyAvLyB0YWtlICctJywgd2VzdCBhbmQgc291dGggYXMgLXZlXG5cbiAgICByZXR1cm4gTnVtYmVyKGRlZyk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydHMgZGVjaW1hbCBkZWdyZWVzIHRvIGRlZy9taW4vc2VjIGZvcm1hdFxuICogIC0gZGVncmVlLCBwcmltZSwgZG91YmxlLXByaW1lIHN5bWJvbHMgYXJlIGFkZGVkLCBidXQgc2lnbiBpcyBkaXNjYXJkZWQsIHRob3VnaCBubyBjb21wYXNzXG4gKiAgICBkaXJlY3Rpb24gaXMgYWRkZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRlZyAtIERlZ3JlZXMgdG8gYmUgZm9ybWF0dGVkIGFzIHNwZWNpZmllZC5cbiAqIEBwYXJhbSAgIHtzdHJpbmd9IFtmb3JtYXQ9ZG1zXSAtIFJldHVybiB2YWx1ZSBhcyAnZCcsICdkbScsICdkbXMnLlxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2Ug4oCTIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IERlZ3JlZXMgZm9ybWF0dGVkIGFzIGRlZy9taW4vc2VjcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWVkIGZvcm1hdC5cbiAqL1xuR2VvLnRvRE1TID0gZnVuY3Rpb24oZGVnLCBmb3JtYXQsIGRwKSB7XG4gICAgaWYgKGlzTmFOKGRlZykpIHJldHVybiBudWxsOyAgLy8gZ2l2ZSB1cCBoZXJlIGlmIHdlIGNhbid0IG1ha2UgYSBudW1iZXIgZnJvbSBkZWdcblxuICAgIC8vIGRlZmF1bHQgdmFsdWVzXG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgPT0gJ3VuZGVmaW5lZCcpIGZvcm1hdCA9ICdkbXMnO1xuICAgIGlmICh0eXBlb2YgZHAgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2QnOiAgIGRwID0gNDsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkbSc6ICBkcCA9IDI7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG1zJzogZHAgPSAwOyBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6ICAgIGZvcm1hdCA9ICdkbXMnOyBkcCA9IDA7ICAvLyBiZSBmb3JnaXZpbmcgb24gaW52YWxpZCBmb3JtYXRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlZyA9IE1hdGguYWJzKGRlZyk7ICAvLyAodW5zaWduZWQgcmVzdWx0IHJlYWR5IGZvciBhcHBlbmRpbmcgY29tcGFzcyBkaXInbilcblxuICAgIHZhciBkbXMsIGQsIG0sIHM7XG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgICAgZGVmYXVsdDogLy8gaW52YWxpZCBmb3JtYXQgc3BlYyFcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICBkID0gZGVnLnRvRml4ZWQoZHApOyAgICAgLy8gcm91bmQgZGVncmVlc1xuICAgICAgICAgICAgaWYgKGQ8MTAwKSBkID0gJzAnICsgZDsgIC8vIHBhZCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICAgICAgICAgIGlmIChkPDEwKSBkID0gJzAnICsgZDtcbiAgICAgICAgICAgIGRtcyA9IGQgKyAnwrAnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RtJzpcbiAgICAgICAgICAgIHZhciBtaW4gPSAoZGVnKjYwKS50b0ZpeGVkKGRwKTsgIC8vIGNvbnZlcnQgZGVncmVlcyB0byBtaW51dGVzICYgcm91bmRcbiAgICAgICAgICAgIGQgPSBNYXRoLmZsb29yKG1pbiAvIDYwKTsgICAgLy8gZ2V0IGNvbXBvbmVudCBkZWcvbWluXG4gICAgICAgICAgICBtID0gKG1pbiAlIDYwKS50b0ZpeGVkKGRwKTsgIC8vIHBhZCB3aXRoIHRyYWlsaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMDApIGQgPSAnMCcgKyBkOyAgICAgICAgICAvLyBwYWQgd2l0aCBsZWFkaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMCkgZCA9ICcwJyArIGQ7XG4gICAgICAgICAgICBpZiAobTwxMCkgbSA9ICcwJyArIG07XG4gICAgICAgICAgICBkbXMgPSBkICsgJ8KwJyArIG0gKyAn4oCyJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkbXMnOlxuICAgICAgICAgICAgdmFyIHNlYyA9IChkZWcqMzYwMCkudG9GaXhlZChkcCk7ICAvLyBjb252ZXJ0IGRlZ3JlZXMgdG8gc2Vjb25kcyAmIHJvdW5kXG4gICAgICAgICAgICBkID0gTWF0aC5mbG9vcihzZWMgLyAzNjAwKTsgICAgLy8gZ2V0IGNvbXBvbmVudCBkZWcvbWluL3NlY1xuICAgICAgICAgICAgbSA9IE1hdGguZmxvb3Ioc2VjLzYwKSAlIDYwO1xuICAgICAgICAgICAgcyA9IChzZWMgJSA2MCkudG9GaXhlZChkcCk7ICAgIC8vIHBhZCB3aXRoIHRyYWlsaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMDApIGQgPSAnMCcgKyBkOyAgICAgICAgICAgIC8vIHBhZCB3aXRoIGxlYWRpbmcgemVyb3NcbiAgICAgICAgICAgIGlmIChkPDEwKSBkID0gJzAnICsgZDtcbiAgICAgICAgICAgIGlmIChtPDEwKSBtID0gJzAnICsgbTtcbiAgICAgICAgICAgIGlmIChzPDEwKSBzID0gJzAnICsgcztcbiAgICAgICAgICAgIGRtcyA9IGQgKyAnwrAnICsgbSArICfigLInICsgcyArICfigLMnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gZG1zO1xufTtcblxuXG4vKipcbiAqIENvbnZlcnRzIG51bWVyaWMgZGVncmVlcyB0byBkZWcvbWluL3NlYyBsYXRpdHVkZSAoMi1kaWdpdCBkZWdyZWVzLCBzdWZmaXhlZCB3aXRoIE4vUykuXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSDigJMgZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxuICovXG5HZW8udG9MYXQgPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcbiAgICB2YXIgbGF0ID0gR2VvLnRvRE1TKGRlZywgZm9ybWF0LCBkcCk7XG4gICAgcmV0dXJuIGxhdD09PW51bGwgPyAn4oCTJyA6IGxhdC5zbGljZSgxKSArIChkZWc8MCA/ICdTJyA6ICdOJyk7ICAvLyBrbm9jayBvZmYgaW5pdGlhbCAnMCcgZm9yIGxhdCFcbn07XG5cblxuLyoqXG4gKiBDb252ZXJ0IG51bWVyaWMgZGVncmVlcyB0byBkZWcvbWluL3NlYyBsb25naXR1ZGUgKDMtZGlnaXQgZGVncmVlcywgc3VmZml4ZWQgd2l0aCBFL1cpXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSDigJMgZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxuICovXG5HZW8udG9Mb24gPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcbiAgICB2YXIgbG9uID0gR2VvLnRvRE1TKGRlZywgZm9ybWF0LCBkcCk7XG4gICAgcmV0dXJuIGxvbj09PW51bGwgPyAn4oCTJyA6IGxvbiArIChkZWc8MCA/ICdXJyA6ICdFJyk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydHMgbnVtZXJpYyBkZWdyZWVzIHRvIGRlZy9taW4vc2VjIGFzIGEgYmVhcmluZyAoMMKwLi4zNjDCsClcbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkZWcgLSBEZWdyZWVzIHRvIGJlIGZvcm1hdHRlZCBhcyBzcGVjaWZpZWQuXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBSZXR1cm4gdmFsdWUgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIOKAkyBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBEZWdyZWVzIGZvcm1hdHRlZCBhcyBkZWcvbWluL3NlY3MgYWNjb3JkaW5nIHRvIHNwZWNpZmllZCBmb3JtYXQuXG4gKi9cbkdlby50b0JybmcgPSBmdW5jdGlvbihkZWcsIGZvcm1hdCwgZHApIHtcbiAgICBkZWcgPSAoTnVtYmVyKGRlZykrMzYwKSAlIDM2MDsgIC8vIG5vcm1hbGlzZSAtdmUgdmFsdWVzIHRvIDE4MMKwLi4zNjDCsFxuICAgIHZhciBicm5nID0gIEdlby50b0RNUyhkZWcsIGZvcm1hdCwgZHApO1xuICAgIHJldHVybiBicm5nPT09bnVsbCA/ICfigJMnIDogYnJuZy5yZXBsYWNlKCczNjAnLCAnMCcpOyAgLy8ganVzdCBpbiBjYXNlIHJvdW5kaW5nIHRvb2sgdXMgdXAgdG8gMzYwwrAhXG59O1xuXG5cbi8qKlxuICogUmV0dXJucyBjb21wYXNzIHBvaW50ICh0byBnaXZlbiBwcmVjaXNpb24pIGZvciBzdXBwbGllZCBiZWFyaW5nLlxuICpcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGJlYXJpbmcgLSBCZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtwcmVjaXNpb249M10gLSBQcmVjaXNpb24gKGNhcmRpbmFsIC8gaW50ZXJjYXJkaW5hbCAvIHNlY29uZGFyeS1pbnRlcmNhcmRpbmFsKS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IENvbXBhc3MgcG9pbnQgZm9yIHN1cHBsaWVkIGJlYXJpbmcuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgdmFyIHBvaW50ID0gR2VvLmNvbXBhc3NQb2ludCgyNCk7ICAgIC8vIHBvaW50ID0gJ05ORSdcbiAqICAgdmFyIHBvaW50ID0gR2VvLmNvbXBhc3NQb2ludCgyNCwgMSk7IC8vIHBvaW50ID0gJ04nXG4gKi9cbkdlby5jb21wYXNzUG9pbnQgPSBmdW5jdGlvbihiZWFyaW5nLCBwcmVjaXNpb24pIHtcbiAgICBpZiAodHlwZW9mIHByZWNpc2lvbiA9PSAndW5kZWZpbmVkJykgcHJlY2lzaW9uID0gMztcbiAgICAvLyBub3RlIHByZWNpc2lvbiA9IG1heCBsZW5ndGggb2YgY29tcGFzcyBwb2ludDsgaXQgY291bGQgYmUgZXh0ZW5kZWQgdG8gNCBmb3IgcXVhcnRlci13aW5kc1xuICAgIC8vIChlZyBORWJOKSwgYnV0IEkgdGhpbmsgdGhleSBhcmUgbGl0dGxlIHVzZWRcblxuICAgIGJlYXJpbmcgPSAoKGJlYXJpbmclMzYwKSszNjApJTM2MDsgLy8gbm9ybWFsaXNlIHRvIDAuLjM2MFxuXG4gICAgdmFyIHBvaW50O1xuXG4gICAgc3dpdGNoIChwcmVjaXNpb24pIHtcbiAgICAgICAgY2FzZSAxOiAvLyA0IGNvbXBhc3MgcG9pbnRzXG4gICAgICAgICAgICBzd2l0Y2ggKE1hdGgucm91bmQoYmVhcmluZyo0LzM2MCklNCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcG9pbnQgPSAnTic7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcG9pbnQgPSAnRSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjogcG9pbnQgPSAnUyc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzogcG9pbnQgPSAnVyc7IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogLy8gOCBjb21wYXNzIHBvaW50c1xuICAgICAgICAgICAgc3dpdGNoIChNYXRoLnJvdW5kKGJlYXJpbmcqOC8zNjApJTgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHBvaW50ID0gJ04nOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiBwb2ludCA9ICdORSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjogcG9pbnQgPSAnRSc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHBvaW50ID0gJ1NFJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBwb2ludCA9ICdTJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNTogcG9pbnQgPSAnU1cnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDY6IHBvaW50ID0gJ1cnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBwb2ludCA9ICdOVyc7IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogLy8gMTYgY29tcGFzcyBwb2ludHNcbiAgICAgICAgICAgIHN3aXRjaCAoTWF0aC5yb3VuZChiZWFyaW5nKjE2LzM2MCklMTYpIHtcbiAgICAgICAgICAgICAgICBjYXNlICAwOiBwb2ludCA9ICdOJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICAxOiBwb2ludCA9ICdOTkUnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICAyOiBwb2ludCA9ICdORSc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICAzOiBwb2ludCA9ICdFTkUnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA0OiBwb2ludCA9ICdFJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA1OiBwb2ludCA9ICdFU0UnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA2OiBwb2ludCA9ICdTRSc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA3OiBwb2ludCA9ICdTU0UnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA4OiBwb2ludCA9ICdTJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICA5OiBwb2ludCA9ICdTU1cnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEwOiBwb2ludCA9ICdTVyc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDExOiBwb2ludCA9ICdXU1cnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEyOiBwb2ludCA9ICdXJzsgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDEzOiBwb2ludCA9ICdXTlcnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE0OiBwb2ludCA9ICdOVyc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE1OiBwb2ludCA9ICdOTlcnOyBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignUHJlY2lzaW9uIG11c3QgYmUgYmV0d2VlbiAxIGFuZCAzJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvaW50O1xufVxuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuXG4vKiogRXh0ZW5kIE51bWJlciBvYmplY3Qgd2l0aCBtZXRob2QgdG8gIHRyaW0gd2hpdGVzcGFjZSBmcm9tIHN0cmluZ1xuICogIChxLnYuIGJsb2cuc3RldmVubGV2aXRoYW4uY29tL2FyY2hpdmVzL2Zhc3Rlci10cmltLWphdmFzY3JpcHQpICovXG5pZiAodHlwZW9mIFN0cmluZy5wcm90b3R5cGUudHJpbSA9PSAndW5kZWZpbmVkJykge1xuICAgIFN0cmluZy5wcm90b3R5cGUudHJpbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHRoaXMpLnJlcGxhY2UoL15cXHNcXHMqLywgJycpLnJlcGxhY2UoL1xcc1xccyokLywgJycpO1xuICAgIH07XG59XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzID0gR2VvOyAvLyBDb21tb25KU1xuaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gR2VvOyB9KTsgLy8gQU1EXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vRW5oYW5jZUpTIGlzSUUgdGVzdCBpZGVhXG5cbi8vZGV0ZWN0IElFIGFuZCB2ZXJzaW9uIG51bWJlciB0aHJvdWdoIGluamVjdGVkIGNvbmRpdGlvbmFsIGNvbW1lbnRzIChubyBVQSBkZXRlY3QsIG5vIG5lZWQgZm9yIGNvbmQuIGNvbXBpbGF0aW9uIC8ganNjcmlwdCBjaGVjaylcblxuLy92ZXJzaW9uIGFyZyBpcyBmb3IgSUUgdmVyc2lvbiAob3B0aW9uYWwpXG4vL2NvbXBhcmlzb24gYXJnIHN1cHBvcnRzICdsdGUnLCAnZ3RlJywgZXRjIChvcHRpb25hbClcblxuZnVuY3Rpb24gaXNJRSh2ZXJzaW9uLCBjb21wYXJpc29uKSB7XG4gIHZhciBjYyAgICAgID0gJ0lFJyxcbiAgICBiICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQicpLFxuICAgIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgaXNJRTtcblxuICBpZih2ZXJzaW9uKXtcbiAgICBjYyArPSAnICcgKyB2ZXJzaW9uO1xuICAgIGlmKGNvbXBhcmlzb24peyBjYyA9IGNvbXBhcmlzb24gKyAnICcgKyBjYzsgfVxuICB9XG5cbiAgYi5pbm5lckhUTUwgPSAnPCEtLVtpZiAnKyBjYyArJ10+PGIgaWQ9XCJpZWNjdGVzdFwiPjwvYj48IVtlbmRpZl0tLT4nO1xuICBkb2NFbGVtLmFwcGVuZENoaWxkKGIpO1xuICBpc0lFID0gISFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWVjY3Rlc3QnKTtcbiAgZG9jRWxlbS5yZW1vdmVDaGlsZChiKTtcbiAgcmV0dXJuIGlzSUU7XG59XG5cbi8vLy9pcyBpdCBJRT9cbi8vaXNJRSgpO1xuLy9cbi8vLy9pcyBpdCBJRTY/XG4vL2lzSUUoNik7XG4vL1xuLy8vL2lzIGl0IGxlc3MgdGhhbiBvciBlcXVhbCB0byBJRSA2P1xuLy9pc0lFKDcsJ2x0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSUU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cbi8qICBMYXRpdHVkZS9sb25naXR1ZGUgc3BoZXJpY2FsIGdlb2Rlc3kgZm9ybXVsYWUgJiBzY3JpcHRzICAgICAgICAgICAoYykgQ2hyaXMgVmVuZXNzIDIwMDItMjAxNCAgKi9cbi8qICAgLSB3d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNSVQgTGljZW5jZSAgKi9cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuLyoganNoaW50IG5vZGU6dHJ1ZSAqLy8qIGdsb2JhbCBkZWZpbmUgKi9cbid1c2Ugc3RyaWN0JztcbmlmICh0eXBlb2YgbW9kdWxlIT0ndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgdmFyIEdlbyA9IHJlcXVpcmUoJy4vZ2VvJyk7IC8vIENvbW1vbkpTIChOb2RlLmpzKVxuXG5cbi8qKlxuICogQ3JlYXRlcyBhIExhdExvbiBwb2ludCBvbiB0aGUgZWFydGgncyBzdXJmYWNlIGF0IHRoZSBzcGVjaWZpZWQgbGF0aXR1ZGUgLyBsb25naXR1ZGUuXG4gKlxuICogQGNsYXNzZGVzYyBUb29scyBmb3IgZ2VvZGV0aWMgY2FsY3VsYXRpb25zXG4gKiBAcmVxdWlyZXMgR2VvXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge251bWJlcn0gbGF0IC0gTGF0aXR1ZGUgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsb24gLSBMb25naXR1ZGUgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0PTBdIC0gSGVpZ2h0IGFib3ZlIG1lYW4tc2VhLWxldmVsIGluIGtpbG9tZXRyZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gW3JhZGl1cz02MzcxXSAtIChNZWFuKSByYWRpdXMgb2YgZWFydGggaW4ga2lsb21ldHJlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSk7XG4gKi9cbmZ1bmN0aW9uIExhdExvbihsYXQsIGxvbiwgaGVpZ2h0LCByYWRpdXMpIHtcbiAgICAvLyBhbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgJ25ldydcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgTGF0TG9uKSkgcmV0dXJuIG5ldyBMYXRMb24obGF0LCBsb24sIGhlaWdodCwgcmFkaXVzKTtcblxuICAgIGlmICh0eXBlb2YgaGVpZ2h0ID09ICd1bmRlZmluZWQnKSBoZWlnaHQgPSAwO1xuICAgIGlmICh0eXBlb2YgcmFkaXVzID09ICd1bmRlZmluZWQnKSByYWRpdXMgPSA2MzcxO1xuICAgIHJhZGl1cyA9IE1hdGgubWluKE1hdGgubWF4KHJhZGl1cywgNjM1MyksIDYzODQpO1xuXG4gICAgdGhpcy5sYXQgICAgPSBOdW1iZXIobGF0KTtcbiAgICB0aGlzLmxvbiAgICA9IE51bWJlcihsb24pO1xuICAgIHRoaXMuaGVpZ2h0ID0gTnVtYmVyKGhlaWdodCk7XG4gICAgdGhpcy5yYWRpdXMgPSBOdW1iZXIocmFkaXVzKTtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRpc3RhbmNlIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50ICh1c2luZyBoYXZlcnNpbmUgZm9ybXVsYSkuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBEaXN0YW5jZSBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIGRlc3RpbmF0aW9uIHBvaW50LCBpbiBrbSAob24gc3BoZXJlIG9mICd0aGlzJyByYWRpdXMpLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1Mi4yMDUsIDAuMTE5KSwgcDIgPSBuZXcgTGF0TG9uKDQ4Ljg1NywgMi4zNTEpO1xuICogICAgIHZhciBkID0gcDEuZGlzdGFuY2VUbyhwMik7IC8vIGQudG9QcmVjaXNpb24oNCk6IDQwNC4zXG4gKi9cbkxhdExvbi5wcm90b3R5cGUuZGlzdGFuY2VUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdmFyIFIgPSB0aGlzLnJhZGl1cztcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksICDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpLCDOuzIgPSBwb2ludC5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM6Uz4YgPSDPhjIgLSDPhjE7XG4gICAgdmFyIM6UzrsgPSDOuzIgLSDOuzE7XG5cbiAgICB2YXIgYSA9IE1hdGguc2luKM6Uz4YvMikgKiBNYXRoLnNpbijOlM+GLzIpICtcbiAgICAgICAgICAgIE1hdGguY29zKM+GMSkgKiBNYXRoLmNvcyjPhjIpICpcbiAgICAgICAgICAgIE1hdGguc2luKM6UzrsvMikgKiBNYXRoLnNpbijOlM67LzIpO1xuICAgIHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMS1hKSk7XG4gICAgdmFyIGQgPSBSICogYztcblxuICAgIHJldHVybiBkO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIChpbml0aWFsKSBiZWFyaW5nIGZyb20gJ3RoaXMnIHBvaW50IHRvIGRlc3RpbmF0aW9uIHBvaW50LlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxuICogQHJldHVybnMge251bWJlcn0gSW5pdGlhbCBiZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcbiAqICAgICB2YXIgYjEgPSBwMS5iZWFyaW5nVG8ocDIpOyAvLyBiMS50b0ZpeGVkKDEpOiAxNTYuMlxuICovXG5MYXRMb24ucHJvdG90eXBlLmJlYXJpbmdUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6UzrsgPSAocG9pbnQubG9uLXRoaXMubG9uKS50b1JhZGlhbnMoKTtcblxuICAgIC8vIHNlZSBodHRwOi8vbWF0aGZvcnVtLm9yZy9saWJyYXJ5L2RybWF0aC92aWV3LzU1NDE3Lmh0bWxcbiAgICB2YXIgeSA9IE1hdGguc2luKM6UzrspICogTWF0aC5jb3Moz4YyKTtcbiAgICB2YXIgeCA9IE1hdGguY29zKM+GMSkqTWF0aC5zaW4oz4YyKSAtXG4gICAgICAgICAgICBNYXRoLnNpbijPhjEpKk1hdGguY29zKM+GMikqTWF0aC5jb3MozpTOuyk7XG4gICAgdmFyIM64ID0gTWF0aC5hdGFuMih5LCB4KTtcblxuICAgIHJldHVybiAozrgudG9EZWdyZWVzKCkrMzYwKSAlIDM2MDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIGZpbmFsIGJlYXJpbmcgYXJyaXZpbmcgYXQgZGVzdGluYXRpb24gZGVzdGluYXRpb24gcG9pbnQgZnJvbSAndGhpcycgcG9pbnQ7IHRoZSBmaW5hbCBiZWFyaW5nXG4gKiB3aWxsIGRpZmZlciBmcm9tIHRoZSBpbml0aWFsIGJlYXJpbmcgYnkgdmFyeWluZyBkZWdyZWVzIGFjY29yZGluZyB0byBkaXN0YW5jZSBhbmQgbGF0aXR1ZGUuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBGaW5hbCBiZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcbiAqICAgICB2YXIgYjIgPSBwMS5maW5hbEJlYXJpbmdUbyhwMik7IC8vIHAyLnRvRml4ZWQoMSk6IDE1Ny45XG4gKi9cbkxhdExvbi5wcm90b3R5cGUuZmluYWxCZWFyaW5nVG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIC8vIGdldCBpbml0aWFsIGJlYXJpbmcgZnJvbSBkZXN0aW5hdGlvbiBwb2ludCB0byB0aGlzIHBvaW50ICYgcmV2ZXJzZSBpdCBieSBhZGRpbmcgMTgwwrBcbiAgICByZXR1cm4gKCBwb2ludC5iZWFyaW5nVG8odGhpcykrMTgwICkgJSAzNjA7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWlkcG9pbnQgYmV0d2VlbiAndGhpcycgcG9pbnQgYW5kIHRoZSBzdXBwbGllZCBwb2ludC5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cbiAqIEByZXR1cm5zIHtMYXRMb259IE1pZHBvaW50IGJldHdlZW4gdGhpcyBwb2ludCBhbmQgdGhlIHN1cHBsaWVkIHBvaW50LlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1Mi4yMDUsIDAuMTE5KSwgcDIgPSBuZXcgTGF0TG9uKDQ4Ljg1NywgMi4zNTEpO1xuICogICAgIHZhciBwTWlkID0gcDEubWlkcG9pbnRUbyhwMik7IC8vIHBNaWQudG9TdHJpbmcoKTogNTAuNTM2M8KwTiwgMDAxLjI3NDbCsEVcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5taWRwb2ludFRvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAvLyBzZWUgaHR0cDovL21hdGhmb3J1bS5vcmcvbGlicmFyeS9kcm1hdGgvdmlldy81MTgyMi5odG1sIGZvciBkZXJpdmF0aW9uXG5cbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6UzrsgPSAocG9pbnQubG9uLXRoaXMubG9uKS50b1JhZGlhbnMoKTtcblxuICAgIHZhciBCeCA9IE1hdGguY29zKM+GMikgKiBNYXRoLmNvcyjOlM67KTtcbiAgICB2YXIgQnkgPSBNYXRoLmNvcyjPhjIpICogTWF0aC5zaW4ozpTOuyk7XG5cbiAgICB2YXIgz4YzID0gTWF0aC5hdGFuMihNYXRoLnNpbijPhjEpK01hdGguc2luKM+GMiksXG4gICAgICAgICAgICAgTWF0aC5zcXJ0KCAoTWF0aC5jb3Moz4YxKStCeCkqKE1hdGguY29zKM+GMSkrQngpICsgQnkqQnkpICk7XG4gICAgdmFyIM67MyA9IM67MSArIE1hdGguYXRhbjIoQnksIE1hdGguY29zKM+GMSkgKyBCeCk7XG4gICAgzrszID0gKM67MyszKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjMudG9EZWdyZWVzKCksIM67My50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGVzdGluYXRpb24gcG9pbnQgZnJvbSAndGhpcycgcG9pbnQgaGF2aW5nIHRyYXZlbGxlZCB0aGUgZ2l2ZW4gZGlzdGFuY2Ugb24gdGhlXG4gKiBnaXZlbiBpbml0aWFsIGJlYXJpbmcgKGJlYXJpbmcgbm9ybWFsbHkgdmFyaWVzIGFyb3VuZCBwYXRoIGZvbGxvd2VkKS5cbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nIC0gSW5pdGlhbCBiZWFyaW5nIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkaXN0IC0gRGlzdGFuY2UgaW4ga20gKG9uIHNwaGVyZSBvZiAndGhpcycgcmFkaXVzKS5cbiAqIEByZXR1cm5zIHtMYXRMb259IERlc3RpbmF0aW9uIHBvaW50LlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS40Nzc4LCAtMC4wMDE1KTtcbiAqICAgICB2YXIgcDIgPSBwMS5kZXN0aW5hdGlvblBvaW50KDMwMC43LCA3Ljc5NCk7IC8vIHAyLnRvU3RyaW5nKCk6IDUxLjUxMzXCsE4sIDAwMC4wOTgzwrBXXG4gKi9cbkxhdExvbi5wcm90b3R5cGUuZGVzdGluYXRpb25Qb2ludCA9IGZ1bmN0aW9uKGJybmcsIGRpc3QpIHtcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI0xMXG5cbiAgICB2YXIgzrggPSBOdW1iZXIoYnJuZykudG9SYWRpYW5zKCk7XG4gICAgdmFyIM60ID0gTnVtYmVyKGRpc3QpIC8gdGhpcy5yYWRpdXM7IC8vIGFuZ3VsYXIgZGlzdGFuY2UgaW4gcmFkaWFuc1xuXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpO1xuICAgIHZhciDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcblxuICAgIHZhciDPhjIgPSBNYXRoLmFzaW4oIE1hdGguc2luKM+GMSkqTWF0aC5jb3MozrQpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM+GMSkqTWF0aC5zaW4ozrQpKk1hdGguY29zKM64KSApO1xuICAgIHZhciDOuzIgPSDOuzEgKyBNYXRoLmF0YW4yKE1hdGguc2luKM64KSpNYXRoLnNpbijOtCkqTWF0aC5jb3Moz4YxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MozrQpLU1hdGguc2luKM+GMSkqTWF0aC5zaW4oz4YyKSk7XG4gICAgzrsyID0gKM67MiszKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjIudG9EZWdyZWVzKCksIM67Mi50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcG9pbnQgb2YgaW50ZXJzZWN0aW9uIG9mIHR3byBwYXRocyBkZWZpbmVkIGJ5IHBvaW50IGFuZCBiZWFyaW5nLlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHAxIC0gRmlyc3QgcG9pbnQuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nMSAtIEluaXRpYWwgYmVhcmluZyBmcm9tIGZpcnN0IHBvaW50LlxuICogQHBhcmFtICAge0xhdExvbn0gcDIgLSBTZWNvbmQgcG9pbnQuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBicm5nMiAtIEluaXRpYWwgYmVhcmluZyBmcm9tIHNlY29uZCBwb2ludC5cbiAqIEByZXR1cm5zIHtMYXRMb259IERlc3RpbmF0aW9uIHBvaW50IChudWxsIGlmIG5vIHVuaXF1ZSBpbnRlcnNlY3Rpb24gZGVmaW5lZCkuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBMYXRMb24oNTEuODg1MywgMC4yNTQ1KSwgYnJuZzEgPSAxMDguNTQ3O1xuICogICAgIHZhciBwMiA9IExhdExvbig0OS4wMDM0LCAyLjU3MzUpLCBicm5nMiA9ICAzMi40MzU7XG4gKiAgICAgdmFyIHBJbnQgPSBMYXRMb24uaW50ZXJzZWN0aW9uKHAxLCBicm5nMSwgcDIsIGJybmcyKTsgLy8gcEludC50b1N0cmluZygpOiA1MC45MDc2wrBOLCAwMDQuNTA4NMKwRVxuICovXG5MYXRMb24uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24ocDEsIGJybmcxLCBwMiwgYnJuZzIpIHtcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI0ludGVyc2VjdGlvblxuXG4gICAgdmFyIM+GMSA9IHAxLmxhdC50b1JhZGlhbnMoKSwgzrsxID0gcDEubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDPhjIgPSBwMi5sYXQudG9SYWRpYW5zKCksIM67MiA9IHAyLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgzrgxMyA9IE51bWJlcihicm5nMSkudG9SYWRpYW5zKCksIM64MjMgPSBOdW1iZXIoYnJuZzIpLnRvUmFkaWFucygpO1xuICAgIHZhciDOlM+GID0gz4YyLc+GMSwgzpTOuyA9IM67Mi3OuzE7XG5cbiAgICB2YXIgzrQxMiA9IDIqTWF0aC5hc2luKCBNYXRoLnNxcnQoIE1hdGguc2luKM6Uz4YvMikqTWF0aC5zaW4ozpTPhi8yKSArXG4gICAgICAgIE1hdGguY29zKM+GMSkqTWF0aC5jb3Moz4YyKSpNYXRoLnNpbijOlM67LzIpKk1hdGguc2luKM6UzrsvMikgKSApO1xuICAgIGlmICjOtDEyID09IDApIHJldHVybiBudWxsO1xuXG4gICAgLy8gaW5pdGlhbC9maW5hbCBiZWFyaW5ncyBiZXR3ZWVuIHBvaW50c1xuICAgIHZhciDOuDEgPSBNYXRoLmFjb3MoICggTWF0aC5zaW4oz4YyKSAtIE1hdGguc2luKM+GMSkqTWF0aC5jb3MozrQxMikgKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAoIE1hdGguc2luKM60MTIpKk1hdGguY29zKM+GMSkgKSApO1xuICAgIGlmIChpc05hTijOuDEpKSDOuDEgPSAwOyAvLyBwcm90ZWN0IGFnYWluc3Qgcm91bmRpbmdcbiAgICB2YXIgzrgyID0gTWF0aC5hY29zKCAoIE1hdGguc2luKM+GMSkgLSBNYXRoLnNpbijPhjIpKk1hdGguY29zKM60MTIpICkgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKCBNYXRoLnNpbijOtDEyKSpNYXRoLmNvcyjPhjIpICkgKTtcblxuICAgIHZhciDOuDEyLCDOuDIxO1xuICAgIGlmIChNYXRoLnNpbijOuzItzrsxKSA+IDApIHtcbiAgICAgICAgzrgxMiA9IM64MTtcbiAgICAgICAgzrgyMSA9IDIqTWF0aC5QSSAtIM64MjtcbiAgICB9IGVsc2Uge1xuICAgICAgICDOuDEyID0gMipNYXRoLlBJIC0gzrgxO1xuICAgICAgICDOuDIxID0gzrgyO1xuICAgIH1cblxuICAgIHZhciDOsTEgPSAozrgxMyAtIM64MTIgKyBNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gYW5nbGUgMi0xLTNcbiAgICB2YXIgzrEyID0gKM64MjEgLSDOuDIzICsgTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIGFuZ2xlIDEtMi0zXG5cbiAgICBpZiAoTWF0aC5zaW4ozrExKT09MCAmJiBNYXRoLnNpbijOsTIpPT0wKSByZXR1cm4gbnVsbDsgLy8gaW5maW5pdGUgaW50ZXJzZWN0aW9uc1xuICAgIGlmIChNYXRoLnNpbijOsTEpKk1hdGguc2luKM6xMikgPCAwKSByZXR1cm4gbnVsbDsgICAgICAvLyBhbWJpZ3VvdXMgaW50ZXJzZWN0aW9uXG5cbiAgICAvL86xMSA9IE1hdGguYWJzKM6xMSk7XG4gICAgLy/OsTIgPSBNYXRoLmFicyjOsTIpO1xuICAgIC8vIC4uLiBFZCBXaWxsaWFtcyB0YWtlcyBhYnMgb2YgzrExL86xMiwgYnV0IHNlZW1zIHRvIGJyZWFrIGNhbGN1bGF0aW9uP1xuXG4gICAgdmFyIM6xMyA9IE1hdGguYWNvcyggLU1hdGguY29zKM6xMSkqTWF0aC5jb3MozrEyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5zaW4ozrExKSpNYXRoLnNpbijOsTIpKk1hdGguY29zKM60MTIpICk7XG4gICAgdmFyIM60MTMgPSBNYXRoLmF0YW4yKCBNYXRoLnNpbijOtDEyKSpNYXRoLnNpbijOsTEpKk1hdGguc2luKM6xMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM6xMikrTWF0aC5jb3MozrExKSpNYXRoLmNvcyjOsTMpICk7XG4gICAgdmFyIM+GMyA9IE1hdGguYXNpbiggTWF0aC5zaW4oz4YxKSpNYXRoLmNvcyjOtDEzKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjPhjEpKk1hdGguc2luKM60MTMpKk1hdGguY29zKM64MTMpICk7XG4gICAgdmFyIM6UzrsxMyA9IE1hdGguYXRhbjIoIE1hdGguc2luKM64MTMpKk1hdGguc2luKM60MTMpKk1hdGguY29zKM+GMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjOtDEzKS1NYXRoLnNpbijPhjEpKk1hdGguc2luKM+GMykgKTtcbiAgICB2YXIgzrszID0gzrsxICsgzpTOuzEzO1xuICAgIM67MyA9ICjOuzMrMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxuXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YzLnRvRGVncmVlcygpLCDOuzMudG9EZWdyZWVzKCkpO1xufTtcblxuXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGlzdGFuY2UgdHJhdmVsbGluZyBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludCBhbG9uZyBhIHJodW1iIGxpbmUuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBEaXN0YW5jZSBpbiBrbSBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIGRlc3RpbmF0aW9uIHBvaW50IChvbiBzcGhlcmUgb2YgJ3RoaXMnIHJhZGl1cykuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUxLjEyNywgMS4zMzgpLCBwMiA9IG5ldyBMYXRMb24oNTAuOTY0LCAxLjg1Myk7XG4gKiAgICAgdmFyIGQgPSBwMS5kaXN0YW5jZVRvKHAyKTsgLy8gZC50b1ByZWNpc2lvbig0KTogNDAuMzFcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5yaHVtYkRpc3RhbmNlVG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIC8vIHNlZSBodHRwOi8vd2lsbGlhbXMuYmVzdC52d2gubmV0L2F2Zm9ybS5odG0jUmh1bWJcblxuICAgIHZhciBSID0gdGhpcy5yYWRpdXM7XG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6Uz4YgPSDPhjIgLSDPhjE7XG4gICAgdmFyIM6UzrsgPSBNYXRoLmFicyhwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xuICAgIC8vIGlmIGRMb24gb3ZlciAxODDCsCB0YWtlIHNob3J0ZXIgcmh1bWIgbGluZSBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW46XG4gICAgaWYgKE1hdGguYWJzKM6UzrspID4gTWF0aC5QSSkgzpTOuyA9IM6Uzrs+MCA/IC0oMipNYXRoLlBJLc6UzrspIDogKDIqTWF0aC5QSSvOlM67KTtcblxuICAgIC8vIG9uIE1lcmNhdG9yIHByb2plY3Rpb24sIGxvbmdpdHVkZSBkaXN0YW5jZXMgc2hyaW5rIGJ5IGxhdGl0dWRlOyBxIGlzIHRoZSAnc3RyZXRjaCBmYWN0b3InXG4gICAgLy8gcSBiZWNvbWVzIGlsbC1jb25kaXRpb25lZCBhbG9uZyBFLVcgbGluZSAoMC8wKTsgdXNlIGVtcGlyaWNhbCB0b2xlcmFuY2UgdG8gYXZvaWQgaXRcbiAgICB2YXIgzpTPiCA9IE1hdGgubG9nKE1hdGgudGFuKM+GMi8yK01hdGguUEkvNCkvTWF0aC50YW4oz4YxLzIrTWF0aC5QSS80KSk7XG4gICAgdmFyIHEgPSBNYXRoLmFicyjOlM+IKSA+IDEwZS0xMiA/IM6Uz4YvzpTPiCA6IE1hdGguY29zKM+GMSk7XG5cbiAgICAvLyBkaXN0YW5jZSBpcyBweXRoYWdvcmFzIG9uICdzdHJldGNoZWQnIE1lcmNhdG9yIHByb2plY3Rpb25cbiAgICB2YXIgzrQgPSBNYXRoLnNxcnQozpTPhirOlM+GICsgcSpxKs6UzrsqzpTOuyk7IC8vIGFuZ3VsYXIgZGlzdGFuY2UgaW4gcmFkaWFuc1xuICAgIHZhciBkaXN0ID0gzrQgKiBSO1xuXG4gICAgcmV0dXJuIGRpc3Q7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgYmVhcmluZyBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludCBhbG9uZyBhIHJodW1iIGxpbmUuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBCZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCksIHAyID0gbmV3IExhdExvbig1MC45NjQsIDEuODUzKTtcbiAqICAgICB2YXIgZCA9IHAxLnJodW1iQmVhcmluZ1RvKHAyKTsgLy8gZC50b0ZpeGVkKDEpOiAxMTYuN1xuICovXG5MYXRMb24ucHJvdG90eXBlLnJodW1iQmVhcmluZ1RvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKTtcbiAgICB2YXIgzpTOuyA9IChwb2ludC5sb24tdGhpcy5sb24pLnRvUmFkaWFucygpO1xuICAgIC8vIGlmIGRMb24gb3ZlciAxODDCsCB0YWtlIHNob3J0ZXIgcmh1bWIgbGluZSBhY3Jvc3MgdGhlIGFudGktbWVyaWRpYW46XG4gICAgaWYgKE1hdGguYWJzKM6UzrspID4gTWF0aC5QSSkgzpTOuyA9IM6Uzrs+MCA/IC0oMipNYXRoLlBJLc6UzrspIDogKDIqTWF0aC5QSSvOlM67KTtcblxuICAgIHZhciDOlM+IID0gTWF0aC5sb2coTWF0aC50YW4oz4YyLzIrTWF0aC5QSS80KS9NYXRoLnRhbijPhjEvMitNYXRoLlBJLzQpKTtcblxuICAgIHZhciDOuCA9IE1hdGguYXRhbjIozpTOuywgzpTPiCk7XG5cbiAgICByZXR1cm4gKM64LnRvRGVncmVlcygpKzM2MCkgJSAzNjA7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZGVzdGluYXRpb24gcG9pbnQgaGF2aW5nIHRyYXZlbGxlZCBhbG9uZyBhIHJodW1iIGxpbmUgZnJvbSAndGhpcycgcG9pbnQgdGhlIGdpdmVuXG4gKiBkaXN0YW5jZSBvbiB0aGUgIGdpdmVuIGJlYXJpbmcuXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gYnJuZyAtIEJlYXJpbmcgaW4gZGVncmVlcyBmcm9tIG5vcnRoLlxuICogQHBhcmFtICAge251bWJlcn0gZGlzdCAtIERpc3RhbmNlIGluIGttIChvbiBzcGhlcmUgb2YgJ3RoaXMnIHJhZGl1cykuXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBEZXN0aW5hdGlvbiBwb2ludC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCk7XG4gKiAgICAgdmFyIHAyID0gcDEucmh1bWJEZXN0aW5hdGlvblBvaW50KDExNi43LCA0MC4zMSk7IC8vIHAyLnRvU3RyaW5nKCk6IDUwLjk2NDHCsE4sIDAwMS44NTMxwrBFXG4gKi9cbkxhdExvbi5wcm90b3R5cGUucmh1bWJEZXN0aW5hdGlvblBvaW50ID0gZnVuY3Rpb24oYnJuZywgZGlzdCkge1xuICAgIHZhciDOtCA9IE51bWJlcihkaXN0KSAvIHRoaXMucmFkaXVzOyAvLyBhbmd1bGFyIGRpc3RhbmNlIGluIHJhZGlhbnNcbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDOuCA9IE51bWJlcihicm5nKS50b1JhZGlhbnMoKTtcblxuICAgIHZhciDOlM+GID0gzrQgKiBNYXRoLmNvcyjOuCk7XG5cbiAgICB2YXIgz4YyID0gz4YxICsgzpTPhjtcbiAgICAvLyBjaGVjayBmb3Igc29tZSBkYWZ0IGJ1Z2dlciBnb2luZyBwYXN0IHRoZSBwb2xlLCBub3JtYWxpc2UgbGF0aXR1ZGUgaWYgc29cbiAgICBpZiAoTWF0aC5hYnMoz4YyKSA+IE1hdGguUEkvMikgz4YyID0gz4YyPjAgPyBNYXRoLlBJLc+GMiA6IC1NYXRoLlBJLc+GMjtcblxuICAgIHZhciDOlM+IID0gTWF0aC5sb2coTWF0aC50YW4oz4YyLzIrTWF0aC5QSS80KS9NYXRoLnRhbijPhjEvMitNYXRoLlBJLzQpKTtcbiAgICB2YXIgcSA9IE1hdGguYWJzKM6Uz4gpID4gMTBlLTEyID8gzpTPhiAvIM6Uz4ggOiBNYXRoLmNvcyjPhjEpOyAvLyBFLVcgY291cnNlIGJlY29tZXMgaWxsLWNvbmRpdGlvbmVkIHdpdGggMC8wXG5cbiAgICB2YXIgzpTOuyA9IM60Kk1hdGguc2luKM64KS9xO1xuXG4gICAgdmFyIM67MiA9IM67MSArIM6Uzrs7XG5cbiAgICDOuzIgPSAozrsyICsgMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxuXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YyLnRvRGVncmVlcygpLCDOuzIudG9EZWdyZWVzKCkpO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxveG9kcm9taWMgbWlkcG9pbnQgKGFsb25nIGEgcmh1bWIgbGluZSkgYmV0d2VlbiAndGhpcycgcG9pbnQgYW5kIHNlY29uZCBwb2ludC5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBzZWNvbmQgcG9pbnQuXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBNaWRwb2ludCBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIHNlY29uZCBwb2ludC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuMTI3LCAxLjMzOCksIHAyID0gbmV3IExhdExvbig1MC45NjQsIDEuODUzKTtcbiAqICAgICB2YXIgcDIgPSBwMS5yaHVtYk1pZHBvaW50VG8ocDIpOyAvLyBwMi50b1N0cmluZygpOiA1MS4wNDU1wrBOLCAwMDEuNTk1N8KwRVxuICovXG5MYXRMb24ucHJvdG90eXBlLnJodW1iTWlkcG9pbnRUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgLy8gaHR0cDovL21hdGhmb3J1bS5vcmcva2IvbWVzc2FnZS5qc3BhP21lc3NhZ2VJRD0xNDg4MzdcblxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgzrsxID0gdGhpcy5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKSwgzrsyID0gcG9pbnQubG9uLnRvUmFkaWFucygpO1xuXG4gICAgaWYgKE1hdGguYWJzKM67Mi3OuzEpID4gTWF0aC5QSSkgzrsxICs9IDIqTWF0aC5QSTsgLy8gY3Jvc3NpbmcgYW50aS1tZXJpZGlhblxuXG4gICAgdmFyIM+GMyA9ICjPhjErz4YyKS8yO1xuICAgIHZhciBmMSA9IE1hdGgudGFuKE1hdGguUEkvNCArIM+GMS8yKTtcbiAgICB2YXIgZjIgPSBNYXRoLnRhbihNYXRoLlBJLzQgKyDPhjIvMik7XG4gICAgdmFyIGYzID0gTWF0aC50YW4oTWF0aC5QSS80ICsgz4YzLzIpO1xuICAgIHZhciDOuzMgPSAoICjOuzItzrsxKSpNYXRoLmxvZyhmMykgKyDOuzEqTWF0aC5sb2coZjIpIC0gzrsyKk1hdGgubG9nKGYxKSApIC8gTWF0aC5sb2coZjIvZjEpO1xuXG4gICAgaWYgKCFpc0Zpbml0ZSjOuzMpKSDOuzMgPSAozrsxK867MikvMjsgLy8gcGFyYWxsZWwgb2YgbGF0aXR1ZGVcblxuICAgIM67MyA9ICjOuzMgKyAzKk1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBub3JtYWxpc2UgdG8gLTE4MC4uKzE4MMKwXG5cbiAgICByZXR1cm4gbmV3IExhdExvbijPhjMudG9EZWdyZWVzKCksIM67My50b0RlZ3JlZXMoKSk7XG59O1xuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgJ3RoaXMnIHBvaW50LCBmb3JtYXR0ZWQgYXMgZGVncmVlcywgZGVncmVlcyttaW51dGVzLCBvclxuICogZGVncmVlcyttaW51dGVzK3NlY29uZHMuXG4gKlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gRm9ybWF0IHBvaW50IGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSAtIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IENvbW1hLXNlcGFyYXRlZCBsYXRpdHVkZS9sb25naXR1ZGUuXG4gKi9cbkxhdExvbi5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbihmb3JtYXQsIGRwKSB7XG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgPT0gJ3VuZGVmaW5lZCcpIGZvcm1hdCA9ICdkbXMnO1xuXG4gICAgcmV0dXJuIEdlby50b0xhdCh0aGlzLmxhdCwgZm9ybWF0LCBkcCkgKyAnLCAnICsgR2VvLnRvTG9uKHRoaXMubG9uLCBmb3JtYXQsIGRwKTtcbn07XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuXG5cbi8qKiBFeHRlbmQgTnVtYmVyIG9iamVjdCB3aXRoIG1ldGhvZCB0byBjb252ZXJ0IG51bWVyaWMgZGVncmVlcyB0byByYWRpYW5zICovXG5pZiAodHlwZW9mIE51bWJlci5wcm90b3R5cGUudG9SYWRpYW5zID09ICd1bmRlZmluZWQnKSB7XG4gICAgTnVtYmVyLnByb3RvdHlwZS50b1JhZGlhbnMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgKiBNYXRoLlBJIC8gMTgwOyB9O1xufVxuXG5cbi8qKiBFeHRlbmQgTnVtYmVyIG9iamVjdCB3aXRoIG1ldGhvZCB0byBjb252ZXJ0IHJhZGlhbnMgdG8gbnVtZXJpYyAoc2lnbmVkKSBkZWdyZWVzICovXG5pZiAodHlwZW9mIE51bWJlci5wcm90b3R5cGUudG9EZWdyZWVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgTnVtYmVyLnByb3RvdHlwZS50b0RlZ3JlZXMgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMgKiAxODAgLyBNYXRoLlBJOyB9O1xufVxuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cbmlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IExhdExvbjsgLy8gQ29tbW9uSlNcbmlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFsnR2VvJ10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gTGF0TG9uOyB9KTsgLy8gQU1EXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyogYWRhcHRlciB0byB0cmFuc2xhdGUgYnkgb25lIG9mIGNob3NlbiBzdHJhdGVneSAqL1xuXG52YXIgc2V0dXBEb2MgPSB7XG4gIFwiZ2V0VHJhbnNsYXRpb25zXCI6IFwidG8gZ2V0IHRleHQgd2hpY2ggYXJlIG5vdCB0cmFuc2xhdGVkIG9uIGN1cnJlbnQgcGFnZSwgdGFrZSBjb25zb2xlLmxvZyh3aW5kb3cudG9UcmFuc2xhdGUpXCIsXG4gIFwic2V0dXBTdHJhdGVneVwiOiBcIml0IGlzIG5lY2Vzc2FyeSBzZXQgc3RyYXRlZ3kgaW4gcm9vdCBvZiBidW5kbGVcIlxufTtcblxudmFyIHN0cmF0ZWd5ID0gbnVsbDtcblxuXG5cbnZhciB0ciA9IGZ1bmN0aW9uIChvcmlnaW5hbCwga2V5LCB2YWx1ZXMpIHtcbiAgaWYgKCFzdHJhdGVneSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJUcmFuc2xhdGlvbiBzdHJhdGVneSBpcyBub3Qgc2V0XFxuIFwiK3NldHVwRG9jW1wic2V0dXBTdHJhdGVneVwiXSk7XG4gICAgcmV0dXJuIG9yaWdpbmFsO1xuICB9XG4gIHJldHVybiBzdHJhdGVneShvcmlnaW5hbCwga2V5LCB2YWx1ZXMpO1xufTtcblxudHIuc2V0U3RyYXRlZ3kgPSBmdW5jdGlvbiAobmV3U3RyYXRlZ3kpIHtcbiAgc3RyYXRlZ3kgPSBuZXdTdHJhdGVneTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdHI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciB0ciA9IGZ1bmN0aW9uIChvcmlnaW5hbCxrZXksdmFsdWVzKSB7XG4gIGlmICgha2V5KSB7XG4gICAga2V5ID0gb3JpZ2luYWwudG9Mb3dlckNhc2UoKS50cmltKCkucmVwbGFjZShcIiBcIiwgXCJfXCIpO1xuICB9XG4gIHZhciB0cmFuc2xhdGVkO1xuICAvLyBwcmV2ZW50IHRocm93aW5nIGV4Y2VwdGlvbiBvbiB3cm9uZyBzcHJpbnRmIGZvcm1hdFxuICB0cnkge1xuICAgIHRyYW5zbGF0ZWQgPSAkLnQoJ2Zvcm1fc2VhcmNoLicra2V5LCB7ZGVmYXVsdFZhbHVlOiBvcmlnaW5hbCwgcG9zdFByb2Nlc3M6ICdzcHJpbnRmJywgc3ByaW50ZjogdmFsdWVzfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0cmFuc2xhdGVkID0gb3JpZ2luYWw7XG4gIH1cblxuICAvL05vdCBuaWNlLCBUT0RPIG1ha2Ugc29tZSBiZXR0ZXIgc29sdXRpb24gaG93IHRvIHBpY2sgcHJlZml4IGFuZCBmYWxsYmFjayB0byBjb21tb25cbiAgaWYgKHRyYW5zbGF0ZWQgPT0gb3JpZ2luYWwpIHtcbiAgICB0cnkge1xuICAgICAgdHJhbnNsYXRlZCA9ICQudCgnY29tbW9uLicra2V5LCB7ZGVmYXVsdFZhbHVlOiBvcmlnaW5hbCwgcG9zdFByb2Nlc3M6ICdzcHJpbnRmJywgc3ByaW50ZjogdmFsdWVzfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdHJhbnNsYXRlZCA9IG9yaWdpbmFsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cmFuc2xhdGVkXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50UXVldWU7XG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgcXVldWUucHVzaChmdW4pO1xuICAgIGlmICghZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2UgKHRhcmdldCwgc3JjKSB7XG4gICAgdmFyIGFycmF5ID0gQXJyYXkuaXNBcnJheShzcmMpXG4gICAgdmFyIGRzdCA9IGFycmF5ICYmIFtdIHx8IHt9XG5cbiAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IFtdXG4gICAgICAgIGRzdCA9IGRzdC5jb25jYXQodGFyZ2V0KVxuICAgICAgICBzcmMuZm9yRWFjaChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRhcmdldFtpXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkc3RbaV0gPSBlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGRzdFtpXSA9IG1lcmdlKHRhcmdldFtpXSwgZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKGUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBkc3QucHVzaChlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgIGRzdFtrZXldID0gdGFyZ2V0W2tleV1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmtleXMoc3JjKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3JjW2tleV0gIT09ICdvYmplY3QnIHx8ICFzcmNba2V5XSkge1xuICAgICAgICAgICAgICAgIGRzdFtrZXldID0gc3JjW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0W2tleV0gPSBzcmNba2V5XVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRzdFtrZXldID0gbWVyZ2UodGFyZ2V0W2tleV0sIHNyY1trZXldKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gZHN0XG59XG4iLCIvLyB2aW06dHM9NDpzdHM9NDpzdz00OlxuLyohXG4gKlxuICogQ29weXJpZ2h0IDIwMDktMjAxMiBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXG4gKiBsaWNlbnNlIGZvdW5kIGF0IGh0dHA6Ly9naXRodWIuY29tL2tyaXNrb3dhbC9xL3Jhdy9tYXN0ZXIvTElDRU5TRVxuICpcbiAqIFdpdGggcGFydHMgYnkgVHlsZXIgQ2xvc2VcbiAqIENvcHlyaWdodCAyMDA3LTIwMDkgVHlsZXIgQ2xvc2UgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgWCBsaWNlbnNlIGZvdW5kXG4gKiBhdCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLmh0bWxcbiAqIEZvcmtlZCBhdCByZWZfc2VuZC5qcyB2ZXJzaW9uOiAyMDA5LTA1LTExXG4gKlxuICogV2l0aCBwYXJ0cyBieSBNYXJrIE1pbGxlclxuICogQ29weXJpZ2h0IChDKSAyMDExIEdvb2dsZSBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICovXG5cbihmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gVGhpcyBmaWxlIHdpbGwgZnVuY3Rpb24gcHJvcGVybHkgYXMgYSA8c2NyaXB0PiB0YWcsIG9yIGEgbW9kdWxlXG4gICAgLy8gdXNpbmcgQ29tbW9uSlMgYW5kIE5vZGVKUyBvciBSZXF1aXJlSlMgbW9kdWxlIGZvcm1hdHMuICBJblxuICAgIC8vIENvbW1vbi9Ob2RlL1JlcXVpcmVKUywgdGhlIG1vZHVsZSBleHBvcnRzIHRoZSBRIEFQSSBhbmQgd2hlblxuICAgIC8vIGV4ZWN1dGVkIGFzIGEgc2ltcGxlIDxzY3JpcHQ+LCBpdCBjcmVhdGVzIGEgUSBnbG9iYWwgaW5zdGVhZC5cblxuICAgIC8vIE1vbnRhZ2UgUmVxdWlyZVxuICAgIGlmICh0eXBlb2YgYm9vdHN0cmFwID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgYm9vdHN0cmFwKFwicHJvbWlzZVwiLCBkZWZpbml0aW9uKTtcblxuICAgIC8vIENvbW1vbkpTXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO1xuXG4gICAgLy8gUmVxdWlyZUpTXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoZGVmaW5pdGlvbik7XG5cbiAgICAvLyBTRVMgKFNlY3VyZSBFY21hU2NyaXB0KVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlcyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAoIXNlcy5vaygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXMubWFrZVEgPSBkZWZpbml0aW9uO1xuICAgICAgICB9XG5cbiAgICAvLyA8c2NyaXB0PlxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgc2VsZi5RID0gZGVmaW5pdGlvbigpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBlbnZpcm9ubWVudCB3YXMgbm90IGFudGljaWFwdGVkIGJ5IFEuIFBsZWFzZSBmaWxlIGEgYnVnLlwiKTtcbiAgICB9XG5cbn0pKGZ1bmN0aW9uICgpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XG50cnkge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xufSBjYXRjaCAoZSkge1xuICAgIGhhc1N0YWNrcyA9ICEhZS5zdGFjaztcbn1cblxuLy8gQWxsIGNvZGUgYWZ0ZXIgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzIHJlcG9ydGVkXG4vLyBieSBRLlxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xudmFyIHFGaWxlTmFtZTtcblxuLy8gc2hpbXNcblxuLy8gdXNlZCBmb3IgZmFsbGJhY2sgaW4gXCJhbGxSZXNvbHZlZFwiXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG52YXIgbmV4dFRpY2sgPShmdW5jdGlvbiAoKSB7XG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGFza3MgKHNpbmdsZSwgd2l0aCBoZWFkIG5vZGUpXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbiAgICB2YXIgdGFpbCA9IGhlYWQ7XG4gICAgdmFyIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xuICAgIHZhciBpc05vZGVKUyA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB2YXIgdGFzayA9IGhlYWQudGFzaztcbiAgICAgICAgICAgIGhlYWQudGFzayA9IHZvaWQgMDtcbiAgICAgICAgICAgIHZhciBkb21haW4gPSBoZWFkLmRvbWFpbjtcblxuICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgIGhlYWQuZG9tYWluID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChpc05vZGVKUykge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBzeW5jaHJvbm91c2x5IHRvIGludGVycnVwdCBmbHVzaGluZyFcblxuICAgICAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29udGludWF0aW9uIGlmIHRoZSB1bmNhdWdodCBleGNlcHRpb24gaXMgc3VwcHJlc3NlZFxuICAgICAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ29udGludWUgaW4gbmV4dCBldmVudCB0byBhdm9pZCB0aWNrIHJlY3Vyc2lvbi5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gYnJvd3NlcnMsIHVuY2F1Z2h0IGV4Y2VwdGlvbnMgYXJlIG5vdCBmYXRhbC5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBuZXh0VGljayA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIHRhaWwgPSB0YWlsLm5leHQgPSB7XG4gICAgICAgICAgICB0YXNrOiB0YXNrLFxuICAgICAgICAgICAgZG9tYWluOiBpc05vZGVKUyAmJiBwcm9jZXNzLmRvbWFpbixcbiAgICAgICAgICAgIG5leHQ6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICAgICAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXF1ZXN0VGljaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzLm5leHRUaWNrKSB7XG4gICAgICAgIC8vIE5vZGUuanMgYmVmb3JlIDAuOS4gTm90ZSB0aGF0IHNvbWUgZmFrZS1Ob2RlIGVudmlyb25tZW50cywgbGlrZSB0aGVcbiAgICAgICAgLy8gTW9jaGEgdGVzdCBydW5uZXIsIGludHJvZHVjZSBhIGBwcm9jZXNzYCBnbG9iYWwgd2l0aG91dCBhIGBuZXh0VGlja2AuXG4gICAgICAgIGlzTm9kZUpTID0gdHJ1ZTtcblxuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgLy8gSW4gSUUxMCwgTm9kZS5qcyAwLjkrLCBvciBodHRwczovL2dpdGh1Yi5jb20vTm9ibGVKUy9zZXRJbW1lZGlhdGVcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gc2V0SW1tZWRpYXRlLmJpbmQod2luZG93LCBmbHVzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoZmx1c2gpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gbW9kZXJuIGJyb3dzZXJzXG4gICAgICAgIC8vIGh0dHA6Ly93d3cubm9uYmxvY2tpbmcuaW8vMjAxMS8wNi93aW5kb3duZXh0dGljay5odG1sXG4gICAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICAgIC8vIEF0IGxlYXN0IFNhZmFyaSBWZXJzaW9uIDYuMC41ICg4NTM2LjMwLjEpIGludGVybWl0dGVudGx5IGNhbm5vdCBjcmVhdGVcbiAgICAgICAgLy8gd29ya2luZyBtZXNzYWdlIHBvcnRzIHRoZSBmaXJzdCB0aW1lIGEgcGFnZSBsb2Fkcy5cbiAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHJlcXVlc3RQb3J0VGljaztcbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZmx1c2g7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgcmVxdWVzdFBvcnRUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gT3BlcmEgcmVxdWlyZXMgdXMgdG8gcHJvdmlkZSBhIG1lc3NhZ2UgcGF5bG9hZCwgcmVnYXJkbGVzcyBvZlxuICAgICAgICAgICAgLy8gd2hldGhlciB3ZSB1c2UgaXQuXG4gICAgICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICAgICAgcmVxdWVzdFBvcnRUaWNrKCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvbGQgYnJvd3NlcnNcbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFRpY2s7XG59KSgpO1xuXG4vLyBBdHRlbXB0IHRvIG1ha2UgZ2VuZXJpY3Mgc2FmZSBpbiB0aGUgZmFjZSBvZiBkb3duc3RyZWFtXG4vLyBtb2RpZmljYXRpb25zLlxuLy8gVGhlcmUgaXMgbm8gc2l0dWF0aW9uIHdoZXJlIHRoaXMgaXMgbmVjZXNzYXJ5LlxuLy8gSWYgeW91IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsIHRoZXNlIHByaW1vcmRpYWxzIG5lZWQgdG8gYmVcbi8vIGRlZXBseSBmcm96ZW4gYW55d2F5LCBhbmQgaWYgeW91IGRvbuKAmXQgbmVlZCBhIHNlY3VyaXR5IGd1YXJhbnRlZSxcbi8vIHRoaXMgaXMganVzdCBwbGFpbiBwYXJhbm9pZC5cbi8vIEhvd2V2ZXIsIHRoaXMgKiptaWdodCoqIGhhdmUgdGhlIG5pY2Ugc2lkZS1lZmZlY3Qgb2YgcmVkdWNpbmcgdGhlIHNpemUgb2Zcbi8vIHRoZSBtaW5pZmllZCBjb2RlIGJ5IHJlZHVjaW5nIHguY2FsbCgpIHRvIG1lcmVseSB4KClcbi8vIFNlZSBNYXJrIE1pbGxlcuKAmXMgZXhwbGFuYXRpb24gb2Ygd2hhdCB0aGlzIGRvZXMuXG4vLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1jb252ZW50aW9uczpzYWZlX21ldGFfcHJvZ3JhbW1pbmdcbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbDtcbmZ1bmN0aW9uIHVuY3VycnlUaGlzKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY2FsbC5hcHBseShmLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG4vLyBUaGlzIGlzIGVxdWl2YWxlbnQsIGJ1dCBzbG93ZXI6XG4vLyB1bmN1cnJ5VGhpcyA9IEZ1bmN0aW9uX2JpbmQuYmluZChGdW5jdGlvbl9iaW5kLmNhbGwpO1xuLy8gaHR0cDovL2pzcGVyZi5jb20vdW5jdXJyeXRoaXNcblxudmFyIGFycmF5X3NsaWNlID0gdW5jdXJyeVRoaXMoQXJyYXkucHJvdG90eXBlLnNsaWNlKTtcblxudmFyIGFycmF5X3JlZHVjZSA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UgfHwgZnVuY3Rpb24gKGNhbGxiYWNrLCBiYXNpcykge1xuICAgICAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIC8vIGNvbmNlcm5pbmcgdGhlIGluaXRpYWwgdmFsdWUsIGlmIG9uZSBpcyBub3QgcHJvdmlkZWRcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIHNlZWsgdG8gdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBhcnJheSwgYWNjb3VudGluZ1xuICAgICAgICAgICAgLy8gZm9yIHRoZSBwb3NzaWJpbGl0eSB0aGF0IGlzIGlzIGEgc3BhcnNlIGFycmF5XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzaXMgPSB0aGlzW2luZGV4KytdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCsraW5kZXggPj0gbGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlICgxKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWR1Y2VcbiAgICAgICAgZm9yICg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyBhY2NvdW50IGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCB0aGUgYXJyYXkgaXMgc3BhcnNlXG4gICAgICAgICAgICBpZiAoaW5kZXggaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGJhc2lzID0gY2FsbGJhY2soYmFzaXMsIHRoaXNbaW5kZXhdLCBpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJhc2lzO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9pbmRleE9mID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgfHwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5vdCBhIHZlcnkgZ29vZCBzaGltLCBidXQgZ29vZCBlbm91Z2ggZm9yIG91ciBvbmUgdXNlIG9mIGl0XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXNbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbik7XG5cbnZhciBhcnJheV9tYXAgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUubWFwIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3ApIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY29sbGVjdCA9IFtdO1xuICAgICAgICBhcnJheV9yZWR1Y2Uoc2VsZiwgZnVuY3Rpb24gKHVuZGVmaW5lZCwgdmFsdWUsIGluZGV4KSB7XG4gICAgICAgICAgICBjb2xsZWN0LnB1c2goY2FsbGJhY2suY2FsbCh0aGlzcCwgdmFsdWUsIGluZGV4LCBzZWxmKSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIHJldHVybiBjb2xsZWN0O1xuICAgIH1cbik7XG5cbnZhciBvYmplY3RfY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG4gICAgZnVuY3Rpb24gVHlwZSgpIHsgfVxuICAgIFR5cGUucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHJldHVybiBuZXcgVHlwZSgpO1xufTtcblxudmFyIG9iamVjdF9oYXNPd25Qcm9wZXJ0eSA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuXG52YXIgb2JqZWN0X2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3RfaGFzT3duUHJvcGVydHkob2JqZWN0LCBrZXkpKSB7XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn07XG5cbnZhciBvYmplY3RfdG9TdHJpbmcgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IE9iamVjdCh2YWx1ZSk7XG59XG5cbi8vIGdlbmVyYXRvciByZWxhdGVkIHNoaW1zXG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBmdW5jdGlvbiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpbiBTcGlkZXJNb25rZXkuXG5mdW5jdGlvbiBpc1N0b3BJdGVyYXRpb24oZXhjZXB0aW9uKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgb2JqZWN0X3RvU3RyaW5nKGV4Y2VwdGlvbikgPT09IFwiW29iamVjdCBTdG9wSXRlcmF0aW9uXVwiIHx8XG4gICAgICAgIGV4Y2VwdGlvbiBpbnN0YW5jZW9mIFFSZXR1cm5WYWx1ZVxuICAgICk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBoZWxwZXIgYW5kIFEucmV0dXJuIG9uY2UgRVM2IGdlbmVyYXRvcnMgYXJlIGluXG4vLyBTcGlkZXJNb25rZXkuXG52YXIgUVJldHVyblZhbHVlO1xuaWYgKHR5cGVvZiBSZXR1cm5WYWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIFFSZXR1cm5WYWx1ZSA9IFJldHVyblZhbHVlO1xufSBlbHNlIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH07XG59XG5cbi8vIGxvbmcgc3RhY2sgdHJhY2VzXG5cbnZhciBTVEFDS19KVU1QX1NFUEFSQVRPUiA9IFwiRnJvbSBwcmV2aW91cyBldmVudDpcIjtcblxuZnVuY3Rpb24gbWFrZVN0YWNrVHJhY2VMb25nKGVycm9yLCBwcm9taXNlKSB7XG4gICAgLy8gSWYgcG9zc2libGUsIHRyYW5zZm9ybSB0aGUgZXJyb3Igc3RhY2sgdHJhY2UgYnkgcmVtb3ZpbmcgTm9kZSBhbmQgUVxuICAgIC8vIGNydWZ0LCB0aGVuIGNvbmNhdGVuYXRpbmcgd2l0aCB0aGUgc3RhY2sgdHJhY2Ugb2YgYHByb21pc2VgLiBTZWUgIzU3LlxuICAgIGlmIChoYXNTdGFja3MgJiZcbiAgICAgICAgcHJvbWlzZS5zdGFjayAmJlxuICAgICAgICB0eXBlb2YgZXJyb3IgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgZXJyb3IgIT09IG51bGwgJiZcbiAgICAgICAgZXJyb3Iuc3RhY2sgJiZcbiAgICAgICAgZXJyb3Iuc3RhY2suaW5kZXhPZihTVEFDS19KVU1QX1NFUEFSQVRPUikgPT09IC0xXG4gICAgKSB7XG4gICAgICAgIHZhciBzdGFja3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcCA9IHByb21pc2U7ICEhcDsgcCA9IHAuc291cmNlKSB7XG4gICAgICAgICAgICBpZiAocC5zdGFjaykge1xuICAgICAgICAgICAgICAgIHN0YWNrcy51bnNoaWZ0KHAuc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YWNrcy51bnNoaWZ0KGVycm9yLnN0YWNrKTtcblxuICAgICAgICB2YXIgY29uY2F0ZWRTdGFja3MgPSBzdGFja3Muam9pbihcIlxcblwiICsgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgKyBcIlxcblwiKTtcbiAgICAgICAgZXJyb3Iuc3RhY2sgPSBmaWx0ZXJTdGFja1N0cmluZyhjb25jYXRlZFN0YWNrcyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJTdGFja1N0cmluZyhzdGFja1N0cmluZykge1xuICAgIHZhciBsaW5lcyA9IHN0YWNrU3RyaW5nLnNwbGl0KFwiXFxuXCIpO1xuICAgIHZhciBkZXNpcmVkTGluZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG5cbiAgICAgICAgaWYgKCFpc0ludGVybmFsRnJhbWUobGluZSkgJiYgIWlzTm9kZUZyYW1lKGxpbmUpICYmIGxpbmUpIHtcbiAgICAgICAgICAgIGRlc2lyZWRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXNpcmVkTGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgcmV0dXJuIHN0YWNrTGluZS5pbmRleE9mKFwiKG1vZHVsZS5qczpcIikgIT09IC0xIHx8XG4gICAgICAgICAgIHN0YWNrTGluZS5pbmRleE9mKFwiKG5vZGUuanM6XCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSkge1xuICAgIC8vIE5hbWVkIGZ1bmN0aW9uczogXCJhdCBmdW5jdGlvbk5hbWUgKGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyKVwiXG4gICAgLy8gSW4gSUUxMCBmdW5jdGlvbiBuYW1lIGNhbiBoYXZlIHNwYWNlcyAoXCJBbm9ueW1vdXMgZnVuY3Rpb25cIikgT19vXG4gICAgdmFyIGF0dGVtcHQxID0gL2F0IC4rIFxcKCguKyk6KFxcZCspOig/OlxcZCspXFwpJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0MSkge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQxWzFdLCBOdW1iZXIoYXR0ZW1wdDFbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBBbm9ueW1vdXMgZnVuY3Rpb25zOiBcImF0IGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDIgPSAvYXQgKFteIF0rKTooXFxkKyk6KD86XFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQyKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDJbMV0sIE51bWJlcihhdHRlbXB0MlsyXSldO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3ggc3R5bGU6IFwiZnVuY3Rpb25AZmlsZW5hbWU6bGluZU51bWJlciBvciBAZmlsZW5hbWU6bGluZU51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQzID0gLy4qQCguKyk6KFxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mykge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQzWzFdLCBOdW1iZXIoYXR0ZW1wdDNbMl0pXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzSW50ZXJuYWxGcmFtZShzdGFja0xpbmUpIHtcbiAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSk7XG5cbiAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgIHZhciBsaW5lTnVtYmVyID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuXG4gICAgcmV0dXJuIGZpbGVOYW1lID09PSBxRmlsZU5hbWUgJiZcbiAgICAgICAgbGluZU51bWJlciA+PSBxU3RhcnRpbmdMaW5lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPD0gcUVuZGluZ0xpbmU7XG59XG5cbi8vIGRpc2NvdmVyIG93biBmaWxlIG5hbWUgYW5kIGxpbmUgbnVtYmVyIHJhbmdlIGZvciBmaWx0ZXJpbmcgc3RhY2tcbi8vIHRyYWNlc1xuZnVuY3Rpb24gY2FwdHVyZUxpbmUoKSB7XG4gICAgaWYgKCFoYXNTdGFja3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFjay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgdmFyIGZpcnN0TGluZSA9IGxpbmVzWzBdLmluZGV4T2YoXCJAXCIpID4gMCA/IGxpbmVzWzFdIDogbGluZXNbMl07XG4gICAgICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoZmlyc3RMaW5lKTtcbiAgICAgICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHFGaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZShjYWxsYmFjaywgbmFtZSwgYWx0ZXJuYXRpdmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlLndhcm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKG5hbWUgKyBcIiBpcyBkZXByZWNhdGVkLCB1c2UgXCIgKyBhbHRlcm5hdGl2ZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgXCIgaW5zdGVhZC5cIiwgbmV3IEVycm9yKFwiXCIpLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoY2FsbGJhY2ssIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLy8gZW5kIG9mIHNoaW1zXG4vLyBiZWdpbm5pbmcgb2YgcmVhbCB3b3JrXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UsIHBhc3NlcyBwcm9taXNlcyB0aHJvdWdoLCBvclxuICogY29lcmNlcyBwcm9taXNlcyBmcm9tIGRpZmZlcmVudCBzeXN0ZW1zLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2Ugb3IgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBRKHZhbHVlKSB7XG4gICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IGEgUHJvbWlzZSwgcmV0dXJuIGl0IGRpcmVjdGx5LiAgVGhpcyBlbmFibGVzXG4gICAgLy8gdGhlIHJlc29sdmUgZnVuY3Rpb24gdG8gYm90aCBiZSB1c2VkIHRvIGNyZWF0ZWQgcmVmZXJlbmNlcyBmcm9tIG9iamVjdHMsXG4gICAgLy8gYnV0IHRvIHRvbGVyYWJseSBjb2VyY2Ugbm9uLXByb21pc2VzIHRvIHByb21pc2VzLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXG4gICAgaWYgKGlzUHJvbWlzZUFsaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY29lcmNlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVsZmlsbCh2YWx1ZSk7XG4gICAgfVxufVxuUS5yZXNvbHZlID0gUTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHRhc2sgaW4gYSBmdXR1cmUgdHVybiBvZiB0aGUgZXZlbnQgbG9vcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRhc2tcbiAqL1xuUS5uZXh0VGljayA9IG5leHRUaWNrO1xuXG4vKipcbiAqIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IGxvbmcgc3RhY2sgdHJhY2VzIHdpbGwgYmUgb25cbiAqL1xuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XG5cbi8vIGVuYWJsZSBsb25nIHN0YWNrcyBpZiBRX0RFQlVHIGlzIHNldFxuaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MgJiYgcHJvY2Vzcy5lbnYgJiYgcHJvY2Vzcy5lbnYuUV9ERUJVRykge1xuICAgIFEubG9uZ1N0YWNrU3VwcG9ydCA9IHRydWU7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHtwcm9taXNlLCByZXNvbHZlLCByZWplY3R9IG9iamVjdC5cbiAqXG4gKiBgcmVzb2x2ZWAgaXMgYSBjYWxsYmFjayB0byBpbnZva2Ugd2l0aCBhIG1vcmUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZVxuICogcHJvbWlzZS4gVG8gZnVsZmlsbCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGFueSB2YWx1ZSB0aGF0IGlzXG4gKiBub3QgYSB0aGVuYWJsZS4gVG8gcmVqZWN0IHRoZSBwcm9taXNlLCBpbnZva2UgYHJlc29sdmVgIHdpdGggYSByZWplY3RlZFxuICogdGhlbmFibGUsIG9yIGludm9rZSBgcmVqZWN0YCB3aXRoIHRoZSByZWFzb24gZGlyZWN0bHkuIFRvIHJlc29sdmUgdGhlXG4gKiBwcm9taXNlIHRvIGFub3RoZXIgdGhlbmFibGUsIHRodXMgcHV0dGluZyBpdCBpbiB0aGUgc2FtZSBzdGF0ZSwgaW52b2tlXG4gKiBgcmVzb2x2ZWAgd2l0aCB0aGF0IG90aGVyIHRoZW5hYmxlLlxuICovXG5RLmRlZmVyID0gZGVmZXI7XG5mdW5jdGlvbiBkZWZlcigpIHtcbiAgICAvLyBpZiBcIm1lc3NhZ2VzXCIgaXMgYW4gXCJBcnJheVwiLCB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBwcm9taXNlIGhhcyBub3QgeWV0XG4gICAgLy8gYmVlbiByZXNvbHZlZC4gIElmIGl0IGlzIFwidW5kZWZpbmVkXCIsIGl0IGhhcyBiZWVuIHJlc29sdmVkLiAgRWFjaFxuICAgIC8vIGVsZW1lbnQgb2YgdGhlIG1lc3NhZ2VzIGFycmF5IGlzIGl0c2VsZiBhbiBhcnJheSBvZiBjb21wbGV0ZSBhcmd1bWVudHMgdG9cbiAgICAvLyBmb3J3YXJkIHRvIHRoZSByZXNvbHZlZCBwcm9taXNlLiAgV2UgY29lcmNlIHRoZSByZXNvbHV0aW9uIHZhbHVlIHRvIGFcbiAgICAvLyBwcm9taXNlIHVzaW5nIHRoZSBgcmVzb2x2ZWAgZnVuY3Rpb24gYmVjYXVzZSBpdCBoYW5kbGVzIGJvdGggZnVsbHlcbiAgICAvLyBub24tdGhlbmFibGUgdmFsdWVzIGFuZCBvdGhlciB0aGVuYWJsZXMgZ3JhY2VmdWxseS5cbiAgICB2YXIgbWVzc2FnZXMgPSBbXSwgcHJvZ3Jlc3NMaXN0ZW5lcnMgPSBbXSwgcmVzb2x2ZWRQcm9taXNlO1xuXG4gICAgdmFyIGRlZmVycmVkID0gb2JqZWN0X2NyZWF0ZShkZWZlci5wcm90b3R5cGUpO1xuICAgIHZhciBwcm9taXNlID0gb2JqZWN0X2NyZWF0ZShQcm9taXNlLnByb3RvdHlwZSk7XG5cbiAgICBwcm9taXNlLnByb21pc2VEaXNwYXRjaCA9IGZ1bmN0aW9uIChyZXNvbHZlLCBvcCwgb3BlcmFuZHMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2goYXJncyk7XG4gICAgICAgICAgICBpZiAob3AgPT09IFwid2hlblwiICYmIG9wZXJhbmRzWzFdKSB7IC8vIHByb2dyZXNzIG9wZXJhbmRcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVycy5wdXNoKG9wZXJhbmRzWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZS5wcm9taXNlRGlzcGF0Y2guYXBwbHkocmVzb2x2ZWRQcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFhYWCBkZXByZWNhdGVkXG4gICAgcHJvbWlzZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobWVzc2FnZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZWFyZXJWYWx1ZSA9IG5lYXJlcihyZXNvbHZlZFByb21pc2UpO1xuICAgICAgICBpZiAoaXNQcm9taXNlKG5lYXJlclZhbHVlKSkge1xuICAgICAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmVhcmVyVmFsdWU7IC8vIHNob3J0ZW4gY2hhaW5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmVhcmVyVmFsdWU7XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN0YXRlOiBcInBlbmRpbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlZFByb21pc2UuaW5zcGVjdCgpO1xuICAgIH07XG5cbiAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IGRvbid0IHRyeSB0byB1c2UgYEVycm9yLmNhcHR1cmVTdGFja1RyYWNlYCBvciB0cmFuc2ZlciB0aGVcbiAgICAgICAgICAgIC8vIGFjY2Vzc29yIGFyb3VuZDsgdGhhdCBjYXVzZXMgbWVtb3J5IGxlYWtzIGFzIHBlciBHSC0xMTEuIEp1c3RcbiAgICAgICAgICAgIC8vIHJlaWZ5IHRoZSBzdGFjayB0cmFjZSBhcyBhIHN0cmluZyBBU0FQLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEF0IHRoZSBzYW1lIHRpbWUsIGN1dCBvZmYgdGhlIGZpcnN0IGxpbmU7IGl0J3MgYWx3YXlzIGp1c3RcbiAgICAgICAgICAgIC8vIFwiW29iamVjdCBQcm9taXNlXVxcblwiLCBhcyBwZXIgdGhlIGB0b1N0cmluZ2AuXG4gICAgICAgICAgICBwcm9taXNlLnN0YWNrID0gZS5zdGFjay5zdWJzdHJpbmcoZS5zdGFjay5pbmRleE9mKFwiXFxuXCIpICsgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3ZSBkbyB0aGUgY2hlY2tzIGZvciBgcmVzb2x2ZWRQcm9taXNlYCBpbiBlYWNoIG1ldGhvZCwgaW5zdGVhZCBvZlxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XG4gICAgLy8gcHJvbWlzZXMgd2l0aCB0aGUgbGluZXMgYGJlY29tZSh3aGF0ZXZlcih2YWx1ZSkpYC4gU2VlIGUuZy4gR0gtMjUyLlxuXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmV3UHJvbWlzZTtcbiAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xuXG4gICAgICAgIGFycmF5X3JlZHVjZShtZXNzYWdlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgbWVzc2FnZSkge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbmV3UHJvbWlzZS5wcm9taXNlRGlzcGF0Y2guYXBwbHkobmV3UHJvbWlzZSwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdm9pZCAwKTtcblxuICAgICAgICBtZXNzYWdlcyA9IHZvaWQgMDtcbiAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMgPSB2b2lkIDA7XG4gICAgfVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZSA9IHByb21pc2U7XG4gICAgZGVmZXJyZWQucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUoUSh2YWx1ZSkpO1xuICAgIH07XG5cbiAgICBkZWZlcnJlZC5mdWxmaWxsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShmdWxmaWxsKHZhbHVlKSk7XG4gICAgfTtcbiAgICBkZWZlcnJlZC5yZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShyZWplY3QocmVhc29uKSk7XG4gICAgfTtcbiAgICBkZWZlcnJlZC5ub3RpZnkgPSBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJyYXlfcmVkdWNlKHByb2dyZXNzTGlzdGVuZXJzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBwcm9ncmVzc0xpc3RlbmVyKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0xpc3RlbmVyKHByb2dyZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgIH07XG5cbiAgICByZXR1cm4gZGVmZXJyZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIE5vZGUtc3R5bGUgY2FsbGJhY2sgdGhhdCB3aWxsIHJlc29sdmUgb3IgcmVqZWN0IHRoZSBkZWZlcnJlZFxuICogcHJvbWlzZS5cbiAqIEByZXR1cm5zIGEgbm9kZWJhY2tcbiAqL1xuZGVmZXIucHJvdG90eXBlLm1ha2VOb2RlUmVzb2x2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXJyb3IsIHZhbHVlKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgc2VsZi5yZWplY3QoZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICBzZWxmLnJlc29sdmUoYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLnJlc29sdmUodmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHJlc29sdmVyIHtGdW5jdGlvbn0gYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgbm90aGluZyBhbmQgYWNjZXB0c1xuICogdGhlIHJlc29sdmUsIHJlamVjdCwgYW5kIG5vdGlmeSBmdW5jdGlvbnMgZm9yIGEgZGVmZXJyZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCBtYXkgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgZ2l2ZW4gcmVzb2x2ZSBhbmQgcmVqZWN0XG4gKiBmdW5jdGlvbnMsIG9yIHJlamVjdGVkIGJ5IGEgdGhyb3duIGV4Y2VwdGlvbiBpbiByZXNvbHZlclxuICovXG5RLlByb21pc2UgPSBwcm9taXNlOyAvLyBFUzZcblEucHJvbWlzZSA9IHByb21pc2U7XG5mdW5jdGlvbiBwcm9taXNlKHJlc29sdmVyKSB7XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJyZXNvbHZlciBtdXN0IGJlIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICB9IGNhdGNoIChyZWFzb24pIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG5wcm9taXNlLnJhY2UgPSByYWNlOyAvLyBFUzZcbnByb21pc2UuYWxsID0gYWxsOyAvLyBFUzZcbnByb21pc2UucmVqZWN0ID0gcmVqZWN0OyAvLyBFUzZcbnByb21pc2UucmVzb2x2ZSA9IFE7IC8vIEVTNlxuXG4vLyBYWFggZXhwZXJpbWVudGFsLiAgVGhpcyBtZXRob2QgaXMgYSB3YXkgdG8gZGVub3RlIHRoYXQgYSBsb2NhbCB2YWx1ZSBpc1xuLy8gc2VyaWFsaXphYmxlIGFuZCBzaG91bGQgYmUgaW1tZWRpYXRlbHkgZGlzcGF0Y2hlZCB0byBhIHJlbW90ZSB1cG9uIHJlcXVlc3QsXG4vLyBpbnN0ZWFkIG9mIHBhc3NpbmcgYSByZWZlcmVuY2UuXG5RLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUucGFzc0J5Q29weSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJZiB0d28gcHJvbWlzZXMgZXZlbnR1YWxseSBmdWxmaWxsIHRvIHRoZSBzYW1lIHZhbHVlLCBwcm9taXNlcyB0aGF0IHZhbHVlLFxuICogYnV0IG90aGVyd2lzZSByZWplY3RzLlxuICogQHBhcmFtIHgge0FueSp9XG4gKiBAcGFyYW0geSB7QW55Kn1cbiAqIEByZXR1cm5zIHtBbnkqfSBhIHByb21pc2UgZm9yIHggYW5kIHkgaWYgdGhleSBhcmUgdGhlIHNhbWUsIGJ1dCBhIHJlamVjdGlvblxuICogb3RoZXJ3aXNlLlxuICpcbiAqL1xuUS5qb2luID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICByZXR1cm4gUSh4KS5qb2luKHkpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uICh0aGF0KSB7XG4gICAgcmV0dXJuIFEoW3RoaXMsIHRoYXRdKS5zcHJlYWQoZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IFwiPT09XCIgc2hvdWxkIGJlIE9iamVjdC5pcyBvciBlcXVpdlxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBqb2luOiBub3QgdGhlIHNhbWU6IFwiICsgeCArIFwiIFwiICsgeSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBmaXJzdCBvZiBhbiBhcnJheSBvZiBwcm9taXNlcyB0byBiZWNvbWUgc2V0dGxlZC5cbiAqIEBwYXJhbSBhbnN3ZXJzIHtBcnJheVtBbnkqXX0gcHJvbWlzZXMgdG8gcmFjZVxuICogQHJldHVybnMge0FueSp9IHRoZSBmaXJzdCBwcm9taXNlIHRvIGJlIHNldHRsZWRcbiAqL1xuUS5yYWNlID0gcmFjZTtcbmZ1bmN0aW9uIHJhY2UoYW5zd2VyUHMpIHtcbiAgICByZXR1cm4gcHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gU3dpdGNoIHRvIHRoaXMgb25jZSB3ZSBjYW4gYXNzdW1lIGF0IGxlYXN0IEVTNVxuICAgICAgICAvLyBhbnN3ZXJQcy5mb3JFYWNoKGZ1bmN0aW9uKGFuc3dlclApIHtcbiAgICAgICAgLy8gICAgIFEoYW5zd2VyUCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gVXNlIHRoaXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhbnN3ZXJQcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgUShhbnN3ZXJQc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnJhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihRLnJhY2UpO1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgUHJvbWlzZSB3aXRoIGEgcHJvbWlzZSBkZXNjcmlwdG9yIG9iamVjdCBhbmQgb3B0aW9uYWwgZmFsbGJhY2tcbiAqIGZ1bmN0aW9uLiAgVGhlIGRlc2NyaXB0b3IgY29udGFpbnMgbWV0aG9kcyBsaWtlIHdoZW4ocmVqZWN0ZWQpLCBnZXQobmFtZSksXG4gKiBzZXQobmFtZSwgdmFsdWUpLCBwb3N0KG5hbWUsIGFyZ3MpLCBhbmQgZGVsZXRlKG5hbWUpLCB3aGljaCBhbGxcbiAqIHJldHVybiBlaXRoZXIgYSB2YWx1ZSwgYSBwcm9taXNlIGZvciBhIHZhbHVlLCBvciBhIHJlamVjdGlvbi4gIFRoZSBmYWxsYmFja1xuICogYWNjZXB0cyB0aGUgb3BlcmF0aW9uIG5hbWUsIGEgcmVzb2x2ZXIsIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHMgdGhhdCB3b3VsZFxuICogaGF2ZSBiZWVuIGZvcndhcmRlZCB0byB0aGUgYXBwcm9wcmlhdGUgbWV0aG9kIGFib3ZlIGhhZCBhIG1ldGhvZCBiZWVuXG4gKiBwcm92aWRlZCB3aXRoIHRoZSBwcm9wZXIgbmFtZS4gIFRoZSBBUEkgbWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCB0aGUgbmF0dXJlXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LCBhcGFydCBmcm9tIHRoYXQgaXQgaXMgdXNhYmxlIHdoZXJlZXZlciBwcm9taXNlcyBhcmVcbiAqIGJvdWdodCBhbmQgc29sZC5cbiAqL1xuUS5tYWtlUHJvbWlzZSA9IFByb21pc2U7XG5mdW5jdGlvbiBQcm9taXNlKGRlc2NyaXB0b3IsIGZhbGxiYWNrLCBpbnNwZWN0KSB7XG4gICAgaWYgKGZhbGxiYWNrID09PSB2b2lkIDApIHtcbiAgICAgICAgZmFsbGJhY2sgPSBmdW5jdGlvbiAob3ApIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiUHJvbWlzZSBkb2VzIG5vdCBzdXBwb3J0IG9wZXJhdGlvbjogXCIgKyBvcFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChpbnNwZWN0ID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7c3RhdGU6IFwidW5rbm93blwifTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdG9yW29wXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRlc2NyaXB0b3Jbb3BdLmFwcGx5KHByb21pc2UsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFjay5jYWxsKHByb21pc2UsIG9wLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGluc3BlY3Q7XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZCBgdmFsdWVPZmAgYW5kIGBleGNlcHRpb25gIHN1cHBvcnRcbiAgICBpZiAoaW5zcGVjdCkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgIHByb21pc2UuZXhjZXB0aW9uID0gaW5zcGVjdGVkLnJlYXNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInBlbmRpbmdcIiB8fFxuICAgICAgICAgICAgICAgIGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IFByb21pc2VdXCI7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgZG9uZSA9IGZhbHNlOyAgIC8vIGVuc3VyZSB0aGUgdW50cnVzdGVkIHByb21pc2UgbWFrZXMgYXQgbW9zdCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2FsbCB0byBvbmUgb2YgdGhlIGNhbGxiYWNrc1xuXG4gICAgZnVuY3Rpb24gX2Z1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmdWxmaWxsZWQgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bGZpbGxlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0ZWQoZXhjZXB0aW9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGV4Y2VwdGlvbiwgc2VsZik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3RlZChleGNlcHRpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAobmV3RXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXdFeGNlcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHJvZ3Jlc3NlZCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHByb2dyZXNzZWQgPT09IFwiZnVuY3Rpb25cIiA/IHByb2dyZXNzZWQodmFsdWUpIDogdmFsdWU7XG4gICAgfVxuXG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfZnVsZmlsbGVkKHZhbHVlKSk7XG4gICAgICAgIH0sIFwid2hlblwiLCBbZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfcmVqZWN0ZWQoZXhjZXB0aW9uKSk7XG4gICAgICAgIH1dKTtcbiAgICB9KTtcblxuICAgIC8vIFByb2dyZXNzIHByb3BhZ2F0b3IgbmVlZCB0byBiZSBhdHRhY2hlZCBpbiB0aGUgY3VycmVudCB0aWNrLlxuICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKHZvaWQgMCwgXCJ3aGVuXCIsIFt2b2lkIDAsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbmV3VmFsdWU7XG4gICAgICAgIHZhciB0aHJldyA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBfcHJvZ3Jlc3NlZCh2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocmV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRocmV3KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5RLnRhcCA9IGZ1bmN0aW9uIChwcm9taXNlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRhcChjYWxsYmFjayk7XG59O1xuXG4vKipcbiAqIFdvcmtzIGFsbW9zdCBsaWtlIFwiZmluYWxseVwiLCBidXQgbm90IGNhbGxlZCBmb3IgcmVqZWN0aW9ucy5cbiAqIE9yaWdpbmFsIHJlc29sdXRpb24gdmFsdWUgaXMgcGFzc2VkIHRocm91Z2ggY2FsbGJhY2sgdW5hZmZlY3RlZC5cbiAqIENhbGxiYWNrIG1heSByZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBhd2FpdGVkIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7US5Qcm9taXNlfVxuICogQGV4YW1wbGVcbiAqIGRvU29tZXRoaW5nKClcbiAqICAgLnRoZW4oLi4uKVxuICogICAudGFwKGNvbnNvbGUubG9nKVxuICogICAudGhlbiguLi4pO1xuICovXG5Qcm9taXNlLnByb3RvdHlwZS50YXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKHZhbHVlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBvYnNlcnZlciBvbiBhIHByb21pc2UuXG4gKlxuICogR3VhcmFudGVlczpcbiAqXG4gKiAxLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxuICogMi4gdGhhdCBlaXRoZXIgdGhlIGZ1bGZpbGxlZCBjYWxsYmFjayBvciB0aGUgcmVqZWN0ZWQgY2FsbGJhY2sgd2lsbCBiZVxuICogICAgY2FsbGVkLCBidXQgbm90IGJvdGguXG4gKiAzLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBub3QgYmUgY2FsbGVkIGluIHRoaXMgdHVybi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgdG8gb2JzZXJ2ZVxuICogQHBhcmFtIGZ1bGZpbGxlZCAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHJlamVjdGVkICAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIHJlamVjdGlvbiBleGNlcHRpb25cbiAqIEBwYXJhbSBwcm9ncmVzc2VkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGludm9rZWQgY2FsbGJhY2tcbiAqL1xuUS53aGVuID0gd2hlbjtcbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbHVlOyB9KTtcbn07XG5cblEudGhlblJlc29sdmUgPSBmdW5jdGlvbiAocHJvbWlzZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyB0aHJvdyByZWFzb247IH0pO1xufTtcblxuUS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHByb21pc2UsIHJlYXNvbikge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZWplY3QocmVhc29uKTtcbn07XG5cbi8qKlxuICogSWYgYW4gb2JqZWN0IGlzIG5vdCBhIHByb21pc2UsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlLlxuICogSWYgYSBwcm9taXNlIGlzIHJlamVjdGVkLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZSB0b28uXG4gKiBJZiBpdOKAmXMgYSBmdWxmaWxsZWQgcHJvbWlzZSwgdGhlIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5lYXJlci5cbiAqIElmIGl04oCZcyBhIGRlZmVycmVkIHByb21pc2UgYW5kIHRoZSBkZWZlcnJlZCBoYXMgYmVlbiByZXNvbHZlZCwgdGhlXG4gKiByZXNvbHV0aW9uIGlzIFwibmVhcmVyXCIuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBtb3N0IHJlc29sdmVkIChuZWFyZXN0KSBmb3JtIG9mIHRoZSBvYmplY3RcbiAqL1xuXG4vLyBYWFggc2hvdWxkIHdlIHJlLWRvIHRoaXM/XG5RLm5lYXJlciA9IG5lYXJlcjtcbmZ1bmN0aW9uIG5lYXJlcih2YWx1ZSkge1xuICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSB2YWx1ZS5pbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHByb21pc2UuXG4gKiBPdGhlcndpc2UgaXQgaXMgYSBmdWxmaWxsZWQgdmFsdWUuXG4gKi9cblEuaXNQcm9taXNlID0gaXNQcm9taXNlO1xuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlO1xufVxuXG5RLmlzUHJvbWlzZUFsaWtlID0gaXNQcm9taXNlQWxpa2U7XG5mdW5jdGlvbiBpc1Byb21pc2VBbGlrZShvYmplY3QpIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwZW5kaW5nIHByb21pc2UsIG1lYW5pbmcgbm90XG4gKiBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG4gKi9cblEuaXNQZW5kaW5nID0gaXNQZW5kaW5nO1xuZnVuY3Rpb24gaXNQZW5kaW5nKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNQZW5kaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHZhbHVlIG9yIGZ1bGZpbGxlZFxuICogcHJvbWlzZS5cbiAqL1xuUS5pc0Z1bGZpbGxlZCA9IGlzRnVsZmlsbGVkO1xuZnVuY3Rpb24gaXNGdWxmaWxsZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuICFpc1Byb21pc2Uob2JqZWN0KSB8fCBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHJlamVjdGVkIHByb21pc2UuXG4gKi9cblEuaXNSZWplY3RlZCA9IGlzUmVqZWN0ZWQ7XG5mdW5jdGlvbiBpc1JlamVjdGVkKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59O1xuXG4vLy8vIEJFR0lOIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcblxuLy8gVGhpcyBwcm9taXNlIGxpYnJhcnkgY29uc3VtZXMgZXhjZXB0aW9ucyB0aHJvd24gaW4gaGFuZGxlcnMgc28gdGhleSBjYW4gYmVcbi8vIGhhbmRsZWQgYnkgYSBzdWJzZXF1ZW50IHByb21pc2UuICBUaGUgZXhjZXB0aW9ucyBnZXQgYWRkZWQgdG8gdGhpcyBhcnJheSB3aGVuXG4vLyB0aGV5IGFyZSBjcmVhdGVkLCBhbmQgcmVtb3ZlZCB3aGVuIHRoZXkgYXJlIGhhbmRsZWQuICBOb3RlIHRoYXQgaW4gRVM2IG9yXG4vLyBzaGltbWVkIGVudmlyb25tZW50cywgdGhpcyB3b3VsZCBuYXR1cmFsbHkgYmUgYSBgU2V0YC5cbnZhciB1bmhhbmRsZWRSZWFzb25zID0gW107XG52YXIgdW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcbiAgICB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aCA9IDA7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5sZW5ndGggPSAwO1xuXG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrUmVqZWN0aW9uKHByb21pc2UsIHJlYXNvbikge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgaWYgKHJlYXNvbiAmJiB0eXBlb2YgcmVhc29uLnN0YWNrICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChyZWFzb24uc3RhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChcIihubyBzdGFjaykgXCIgKyByZWFzb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdCA9IGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgaWYgKGF0ICE9PSAtMSkge1xuICAgICAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdCwgMSk7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMuc3BsaWNlKGF0LCAxKTtcbiAgICB9XG59XG5cblEucmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zID0gcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zO1xuXG5RLmdldFVuaGFuZGxlZFJlYXNvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gTWFrZSBhIGNvcHkgc28gdGhhdCBjb25zdW1lcnMgY2FuJ3QgaW50ZXJmZXJlIHdpdGggb3VyIGludGVybmFsIHN0YXRlLlxuICAgIHJldHVybiB1bmhhbmRsZWRSZWFzb25zLnNsaWNlKCk7XG59O1xuXG5RLnN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcbiAgICB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSBmYWxzZTtcbn07XG5cbnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpO1xuXG4vLy8vIEVORCBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHJlamVjdGVkIHByb21pc2UuXG4gKiBAcGFyYW0gcmVhc29uIHZhbHVlIGRlc2NyaWJpbmcgdGhlIGZhaWx1cmVcbiAqL1xuUS5yZWplY3QgPSByZWplY3Q7XG5mdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gICAgdmFyIHJlamVjdGlvbiA9IFByb21pc2Uoe1xuICAgICAgICBcIndoZW5cIjogZnVuY3Rpb24gKHJlamVjdGVkKSB7XG4gICAgICAgICAgICAvLyBub3RlIHRoYXQgdGhlIGVycm9yIGhhcyBiZWVuIGhhbmRsZWRcbiAgICAgICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgICAgICAgIHVudHJhY2tSZWplY3Rpb24odGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZChyZWFzb24pIDogdGhpcztcbiAgICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBmdW5jdGlvbiBpbnNwZWN0KCkge1xuICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJyZWplY3RlZFwiLCByZWFzb246IHJlYXNvbiB9O1xuICAgIH0pO1xuXG4gICAgLy8gTm90ZSB0aGF0IHRoZSByZWFzb24gaGFzIG5vdCBiZWVuIGhhbmRsZWQuXG4gICAgdHJhY2tSZWplY3Rpb24ocmVqZWN0aW9uLCByZWFzb24pO1xuXG4gICAgcmV0dXJuIHJlamVjdGlvbjtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgZnVsZmlsbGVkIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UuXG4gKiBAcGFyYW0gdmFsdWUgaW1tZWRpYXRlIHJlZmVyZW5jZVxuICovXG5RLmZ1bGZpbGwgPSBmdWxmaWxsO1xuZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24gKG5hbWUsIHJocykge1xuICAgICAgICAgICAgdmFsdWVbbmFtZV0gPSByaHM7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVsZXRlXCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBkZWxldGUgdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwicG9zdFwiOiBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgICAgICAgICAgLy8gTWFyayBNaWxsZXIgcHJvcG9zZXMgdGhhdCBwb3N0IHdpdGggbm8gbmFtZSBzaG91bGQgYXBwbHkgYVxuICAgICAgICAgICAgLy8gcHJvbWlzZWQgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gbnVsbCB8fCBuYW1lID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodm9pZCAwLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlW25hbWVdLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJhcHBseVwiOiBmdW5jdGlvbiAodGhpc3AsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5hcHBseSh0aGlzcCwgYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIFwia2V5c1wiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0X2tleXModmFsdWUpO1xuICAgICAgICB9XG4gICAgfSwgdm9pZCAwLCBmdW5jdGlvbiBpbnNwZWN0KCkge1xuICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJmdWxmaWxsZWRcIiwgdmFsdWU6IHZhbHVlIH07XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlbmFibGVzIHRvIFEgcHJvbWlzZXMuXG4gKiBAcGFyYW0gcHJvbWlzZSB0aGVuYWJsZSBwcm9taXNlXG4gKiBAcmV0dXJucyBhIFEgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBjb2VyY2UocHJvbWlzZSkge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcm9taXNlLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbi8qKlxuICogQW5ub3RhdGVzIGFuIG9iamVjdCBzdWNoIHRoYXQgaXQgd2lsbCBuZXZlciBiZVxuICogdHJhbnNmZXJyZWQgYXdheSBmcm9tIHRoaXMgcHJvY2VzcyBvdmVyIGFueSBwcm9taXNlXG4gKiBjb21tdW5pY2F0aW9uIGNoYW5uZWwuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBwcm9taXNlIGEgd3JhcHBpbmcgb2YgdGhhdCBvYmplY3QgdGhhdFxuICogYWRkaXRpb25hbGx5IHJlc3BvbmRzIHRvIHRoZSBcImlzRGVmXCIgbWVzc2FnZVxuICogd2l0aG91dCBhIHJlamVjdGlvbi5cbiAqL1xuUS5tYXN0ZXIgPSBtYXN0ZXI7XG5mdW5jdGlvbiBtYXN0ZXIob2JqZWN0KSB7XG4gICAgcmV0dXJuIFByb21pc2Uoe1xuICAgICAgICBcImlzRGVmXCI6IGZ1bmN0aW9uICgpIHt9XG4gICAgfSwgZnVuY3Rpb24gZmFsbGJhY2sob3AsIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoKG9iamVjdCwgb3AsIGFyZ3MpO1xuICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFEob2JqZWN0KS5pbnNwZWN0KCk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogU3ByZWFkcyB0aGUgdmFsdWVzIG9mIGEgcHJvbWlzZWQgYXJyYXkgb2YgYXJndW1lbnRzIGludG8gdGhlXG4gKiBmdWxmaWxsbWVudCBjYWxsYmFjay5cbiAqIEBwYXJhbSBmdWxmaWxsZWQgY2FsbGJhY2sgdGhhdCByZWNlaXZlcyB2YXJpYWRpYyBhcmd1bWVudHMgZnJvbSB0aGVcbiAqIHByb21pc2VkIGFycmF5XG4gKiBAcGFyYW0gcmVqZWN0ZWQgY2FsbGJhY2sgdGhhdCByZWNlaXZlcyB0aGUgZXhjZXB0aW9uIGlmIHRoZSBwcm9taXNlXG4gKiBpcyByZWplY3RlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvciB0aHJvd24gZXhjZXB0aW9uIG9mXG4gKiBlaXRoZXIgY2FsbGJhY2suXG4gKi9cblEuc3ByZWFkID0gc3ByZWFkO1xuZnVuY3Rpb24gc3ByZWFkKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIFEodmFsdWUpLnNwcmVhZChmdWxmaWxsZWQsIHJlamVjdGVkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuc3ByZWFkID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy5hbGwoKS50aGVuKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICByZXR1cm4gZnVsZmlsbGVkLmFwcGx5KHZvaWQgMCwgYXJyYXkpO1xuICAgIH0sIHJlamVjdGVkKTtcbn07XG5cbi8qKlxuICogVGhlIGFzeW5jIGZ1bmN0aW9uIGlzIGEgZGVjb3JhdG9yIGZvciBnZW5lcmF0b3IgZnVuY3Rpb25zLCB0dXJuaW5nXG4gKiB0aGVtIGludG8gYXN5bmNocm9ub3VzIGdlbmVyYXRvcnMuICBBbHRob3VnaCBnZW5lcmF0b3JzIGFyZSBvbmx5IHBhcnRcbiAqIG9mIHRoZSBuZXdlc3QgRUNNQVNjcmlwdCA2IGRyYWZ0cywgdGhpcyBjb2RlIGRvZXMgbm90IGNhdXNlIHN5bnRheFxuICogZXJyb3JzIGluIG9sZGVyIGVuZ2luZXMuICBUaGlzIGNvZGUgc2hvdWxkIGNvbnRpbnVlIHRvIHdvcmsgYW5kIHdpbGxcbiAqIGluIGZhY3QgaW1wcm92ZSBvdmVyIHRpbWUgYXMgdGhlIGxhbmd1YWdlIGltcHJvdmVzLlxuICpcbiAqIEVTNiBnZW5lcmF0b3JzIGFyZSBjdXJyZW50bHkgcGFydCBvZiBWOCB2ZXJzaW9uIDMuMTkgd2l0aCB0aGVcbiAqIC0taGFybW9ueS1nZW5lcmF0b3JzIHJ1bnRpbWUgZmxhZyBlbmFibGVkLiAgU3BpZGVyTW9ua2V5IGhhcyBoYWQgdGhlbVxuICogZm9yIGxvbmdlciwgYnV0IHVuZGVyIGFuIG9sZGVyIFB5dGhvbi1pbnNwaXJlZCBmb3JtLiAgVGhpcyBmdW5jdGlvblxuICogd29ya3Mgb24gYm90aCBraW5kcyBvZiBnZW5lcmF0b3JzLlxuICpcbiAqIERlY29yYXRlcyBhIGdlbmVyYXRvciBmdW5jdGlvbiBzdWNoIHRoYXQ6XG4gKiAgLSBpdCBtYXkgeWllbGQgcHJvbWlzZXNcbiAqICAtIGV4ZWN1dGlvbiB3aWxsIGNvbnRpbnVlIHdoZW4gdGhhdCBwcm9taXNlIGlzIGZ1bGZpbGxlZFxuICogIC0gdGhlIHZhbHVlIG9mIHRoZSB5aWVsZCBleHByZXNzaW9uIHdpbGwgYmUgdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogIC0gaXQgcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgKHdoZW4gdGhlIGdlbmVyYXRvclxuICogICAgc3RvcHMgaXRlcmF0aW5nKVxuICogIC0gdGhlIGRlY29yYXRlZCBmdW5jdGlvbiByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICogICAgb2YgdGhlIGdlbmVyYXRvciBvciB0aGUgZmlyc3QgcmVqZWN0ZWQgcHJvbWlzZSBhbW9uZyB0aG9zZVxuICogICAgeWllbGRlZC5cbiAqICAtIGlmIGFuIGVycm9yIGlzIHRocm93biBpbiB0aGUgZ2VuZXJhdG9yLCBpdCBwcm9wYWdhdGVzIHRocm91Z2hcbiAqICAgIGV2ZXJ5IGZvbGxvd2luZyB5aWVsZCB1bnRpbCBpdCBpcyBjYXVnaHQsIG9yIHVudGlsIGl0IGVzY2FwZXNcbiAqICAgIHRoZSBnZW5lcmF0b3IgZnVuY3Rpb24gYWx0b2dldGhlciwgYW5kIGlzIHRyYW5zbGF0ZWQgaW50byBhXG4gKiAgICByZWplY3Rpb24gZm9yIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBkZWNvcmF0ZWQgZ2VuZXJhdG9yLlxuICovXG5RLmFzeW5jID0gYXN5bmM7XG5mdW5jdGlvbiBhc3luYyhtYWtlR2VuZXJhdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwic2VuZFwiLCBhcmcgaXMgYSB2YWx1ZVxuICAgICAgICAvLyB3aGVuIHZlcmIgaXMgXCJ0aHJvd1wiLCBhcmcgaXMgYW4gZXhjZXB0aW9uXG4gICAgICAgIGZ1bmN0aW9uIGNvbnRpbnVlcih2ZXJiLCBhcmcpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgICAgIC8vIFVudGlsIFY4IDMuMTkgLyBDaHJvbWl1bSAyOSBpcyByZWxlYXNlZCwgU3BpZGVyTW9ua2V5IGlzIHRoZSBvbmx5XG4gICAgICAgICAgICAvLyBlbmdpbmUgdGhhdCBoYXMgYSBkZXBsb3llZCBiYXNlIG9mIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBnZW5lcmF0b3JzLlxuICAgICAgICAgICAgLy8gSG93ZXZlciwgU00ncyBnZW5lcmF0b3JzIHVzZSB0aGUgUHl0aG9uLWluc3BpcmVkIHNlbWFudGljcyBvZlxuICAgICAgICAgICAgLy8gb3V0ZGF0ZWQgRVM2IGRyYWZ0cy4gIFdlIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBFUzYsIGJ1dCB3ZSdkIGFsc29cbiAgICAgICAgICAgIC8vIGxpa2UgdG8gbWFrZSBpdCBwb3NzaWJsZSB0byB1c2UgZ2VuZXJhdG9ycyBpbiBkZXBsb3llZCBicm93c2Vycywgc29cbiAgICAgICAgICAgIC8vIHdlIGFsc28gc3VwcG9ydCBQeXRob24tc3R5bGUgZ2VuZXJhdG9ycy4gIEF0IHNvbWUgcG9pbnQgd2UgY2FuIHJlbW92ZVxuICAgICAgICAgICAgLy8gdGhpcyBibG9jay5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBTdG9wSXRlcmF0aW9uID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgLy8gRVM2IEdlbmVyYXRvcnNcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFEocmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2hlbihyZXN1bHQudmFsdWUsIGNhbGxiYWNrLCBlcnJiYWNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNwaWRlck1vbmtleSBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgLy8gRklYTUU6IFJlbW92ZSB0aGlzIGNhc2Ugd2hlbiBTTSBkb2VzIEVTNiBnZW5lcmF0b3JzLlxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGdlbmVyYXRvclt2ZXJiXShhcmcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBRKGV4Y2VwdGlvbi52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG1ha2VHZW5lcmF0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY29udGludWVyLmJpbmQoY29udGludWVyLCBcIm5leHRcIik7XG4gICAgICAgIHZhciBlcnJiYWNrID0gY29udGludWVyLmJpbmQoY29udGludWVyLCBcInRocm93XCIpO1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIFRoZSBzcGF3biBmdW5jdGlvbiBpcyBhIHNtYWxsIHdyYXBwZXIgYXJvdW5kIGFzeW5jIHRoYXQgaW1tZWRpYXRlbHlcbiAqIGNhbGxzIHRoZSBnZW5lcmF0b3IgYW5kIGFsc28gZW5kcyB0aGUgcHJvbWlzZSBjaGFpbiwgc28gdGhhdCBhbnlcbiAqIHVuaGFuZGxlZCBlcnJvcnMgYXJlIHRocm93biBpbnN0ZWFkIG9mIGZvcndhcmRlZCB0byB0aGUgZXJyb3JcbiAqIGhhbmRsZXIuIFRoaXMgaXMgdXNlZnVsIGJlY2F1c2UgaXQncyBleHRyZW1lbHkgY29tbW9uIHRvIHJ1blxuICogZ2VuZXJhdG9ycyBhdCB0aGUgdG9wLWxldmVsIHRvIHdvcmsgd2l0aCBsaWJyYXJpZXMuXG4gKi9cblEuc3Bhd24gPSBzcGF3bjtcbmZ1bmN0aW9uIHNwYXduKG1ha2VHZW5lcmF0b3IpIHtcbiAgICBRLmRvbmUoUS5hc3luYyhtYWtlR2VuZXJhdG9yKSgpKTtcbn1cblxuLy8gRklYTUU6IFJlbW92ZSB0aGlzIGludGVyZmFjZSBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpbiBTcGlkZXJNb25rZXkuXG4vKipcbiAqIFRocm93cyBhIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB0byBzdG9wIGFuIGFzeW5jaHJvbm91cyBnZW5lcmF0b3IuXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgaXMgYSBzdG9wLWdhcCBtZWFzdXJlIHRvIHN1cHBvcnQgZ2VuZXJhdG9yIHJldHVyblxuICogdmFsdWVzIGluIG9sZGVyIEZpcmVmb3gvU3BpZGVyTW9ua2V5LiAgSW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEVTNlxuICogZ2VuZXJhdG9ycyBsaWtlIENocm9taXVtIDI5LCBqdXN0IHVzZSBcInJldHVyblwiIGluIHlvdXIgZ2VuZXJhdG9yXG4gKiBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHZhbHVlIHRoZSByZXR1cm4gdmFsdWUgZm9yIHRoZSBzdXJyb3VuZGluZyBnZW5lcmF0b3JcbiAqIEB0aHJvd3MgUmV0dXJuVmFsdWUgZXhjZXB0aW9uIHdpdGggdGhlIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqIC8vIEVTNiBzdHlsZVxuICogUS5hc3luYyhmdW5jdGlvbiogKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICByZXR1cm4gZm9vICsgYmFyO1xuICogfSlcbiAqIC8vIE9sZGVyIFNwaWRlck1vbmtleSBzdHlsZVxuICogUS5hc3luYyhmdW5jdGlvbiAoKSB7XG4gKiAgICAgIHZhciBmb28gPSB5aWVsZCBnZXRGb29Qcm9taXNlKCk7XG4gKiAgICAgIHZhciBiYXIgPSB5aWVsZCBnZXRCYXJQcm9taXNlKCk7XG4gKiAgICAgIFEucmV0dXJuKGZvbyArIGJhcik7XG4gKiB9KVxuICovXG5RW1wicmV0dXJuXCJdID0gX3JldHVybjtcbmZ1bmN0aW9uIF9yZXR1cm4odmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgUVJldHVyblZhbHVlKHZhbHVlKTtcbn1cblxuLyoqXG4gKiBUaGUgcHJvbWlzZWQgZnVuY3Rpb24gZGVjb3JhdG9yIGVuc3VyZXMgdGhhdCBhbnkgcHJvbWlzZSBhcmd1bWVudHNcbiAqIGFyZSBzZXR0bGVkIGFuZCBwYXNzZWQgYXMgdmFsdWVzIChgdGhpc2AgaXMgYWxzbyBzZXR0bGVkIGFuZCBwYXNzZWRcbiAqIGFzIGEgdmFsdWUpLiAgSXQgd2lsbCBhbHNvIGVuc3VyZSB0aGF0IHRoZSByZXN1bHQgb2YgYSBmdW5jdGlvbiBpc1xuICogYWx3YXlzIGEgcHJvbWlzZS5cbiAqXG4gKiBAZXhhbXBsZVxuICogdmFyIGFkZCA9IFEucHJvbWlzZWQoZnVuY3Rpb24gKGEsIGIpIHtcbiAqICAgICByZXR1cm4gYSArIGI7XG4gKiB9KTtcbiAqIGFkZChRKGEpLCBRKEIpKTtcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gZGVjb3JhdGVcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn0gYSBmdW5jdGlvbiB0aGF0IGhhcyBiZWVuIGRlY29yYXRlZC5cbiAqL1xuUS5wcm9taXNlZCA9IHByb21pc2VkO1xuZnVuY3Rpb24gcHJvbWlzZWQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc3ByZWFkKFt0aGlzLCBhbGwoYXJndW1lbnRzKV0sIGZ1bmN0aW9uIChzZWxmLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8qKlxuICogc2VuZHMgYSBtZXNzYWdlIHRvIGEgdmFsdWUgaW4gYSBmdXR1cmUgdHVyblxuICogQHBhcmFtIG9iamVjdCogdGhlIHJlY2lwaWVudFxuICogQHBhcmFtIG9wIHRoZSBuYW1lIG9mIHRoZSBtZXNzYWdlIG9wZXJhdGlvbiwgZS5nLiwgXCJ3aGVuXCIsXG4gKiBAcGFyYW0gYXJncyBmdXJ0aGVyIGFyZ3VtZW50cyB0byBiZSBmb3J3YXJkZWQgdG8gdGhlIG9wZXJhdGlvblxuICogQHJldHVybnMgcmVzdWx0IHtQcm9taXNlfSBhIHByb21pc2UgZm9yIHRoZSByZXN1bHQgb2YgdGhlIG9wZXJhdGlvblxuICovXG5RLmRpc3BhdGNoID0gZGlzcGF0Y2g7XG5mdW5jdGlvbiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChvcCwgYXJncyk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24gKG9wLCBhcmdzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGRlZmVycmVkLnJlc29sdmUsIG9wLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBnZXRcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHByb3BlcnR5IHZhbHVlXG4gKi9cblEuZ2V0ID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImdldFwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuLyoqXG4gKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3Igb2JqZWN0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIHByb3BlcnR5IHRvIHNldFxuICogQHBhcmFtIHZhbHVlICAgICBuZXcgdmFsdWUgb2YgcHJvcGVydHlcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwic2V0XCIsIFtrZXksIHZhbHVlXSk7XG59O1xuXG4vKipcbiAqIERlbGV0ZXMgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBkZWxldGVcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLmRlbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJkZWxldGVcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBrZXkpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRlbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZGVsZXRlXCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogSW52b2tlcyBhIG1ldGhvZCBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gKiBAcGFyYW0gdmFsdWUgICAgIGEgdmFsdWUgdG8gcG9zdCwgdHlwaWNhbGx5IGFuIGFycmF5IG9mXG4gKiAgICAgICAgICAgICAgICAgIGludm9jYXRpb24gYXJndW1lbnRzIGZvciBwcm9taXNlcyB0aGF0XG4gKiAgICAgICAgICAgICAgICAgIGFyZSB1bHRpbWF0ZWx5IGJhY2tlZCB3aXRoIGByZXNvbHZlYCB2YWx1ZXMsXG4gKiAgICAgICAgICAgICAgICAgIGFzIG9wcG9zZWQgdG8gdGhvc2UgYmFja2VkIHdpdGggVVJMc1xuICogICAgICAgICAgICAgICAgICB3aGVyZWluIHRoZSBwb3N0ZWQgdmFsdWUgY2FuIGJlIGFueVxuICogICAgICAgICAgICAgICAgICBKU09OIHNlcmlhbGl6YWJsZSBvYmplY3QuXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuLy8gYm91bmQgbG9jYWxseSBiZWNhdXNlIGl0IGlzIHVzZWQgYnkgb3RoZXIgbWV0aG9kc1xuUS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5wb3N0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBpbnZvY2F0aW9uIGFyZ3VtZW50c1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cblEuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5RLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEuaW52b2tlID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5zZW5kID0gLy8gWFhYIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgcGFybGFuY2VcblByb21pc2UucHJvdG90eXBlLm1jYWxsID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gYXJncyAgICAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZhcHBseSA9IGZ1bmN0aW9uIChvYmplY3QsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RW1widHJ5XCJdID1cblEuZmNhbGwgPSBmdW5jdGlvbiAob2JqZWN0IC8qIC4uLmFyZ3MqLykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzKV0pO1xufTtcblxuLyoqXG4gKiBCaW5kcyB0aGUgcHJvbWlzZWQgZnVuY3Rpb24sIHRyYW5zZm9ybWluZyByZXR1cm4gdmFsdWVzIGludG8gYSBmdWxmaWxsZWRcbiAqIHByb21pc2UgYW5kIHRocm93biBlcnJvcnMgaW50byBhIHJlamVjdGVkIG9uZS5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgZnVuY3Rpb25cbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgYXBwbGljYXRpb24gYXJndW1lbnRzXG4gKi9cblEuZmJpbmQgPSBmdW5jdGlvbiAob2JqZWN0IC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSBRKG9iamVjdCk7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuUHJvbWlzZS5wcm90b3R5cGUuZmJpbmQgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHJldHVybiBmdW5jdGlvbiBmYm91bmQoKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLmRpc3BhdGNoKFwiYXBwbHlcIiwgW1xuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3MuY29uY2F0KGFycmF5X3NsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIF0pO1xuICAgIH07XG59O1xuXG4vKipcbiAqIFJlcXVlc3RzIHRoZSBuYW1lcyBvZiB0aGUgb3duZWQgcHJvcGVydGllcyBvZiBhIHByb21pc2VkXG4gKiBvYmplY3QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBrZXlzIG9mIHRoZSBldmVudHVhbGx5IHNldHRsZWQgb2JqZWN0XG4gKi9cblEua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwia2V5c1wiLCBbXSk7XG59O1xuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheS4gIElmIGFueSBvZlxuICogdGhlIHByb21pc2VzIGdldHMgcmVqZWN0ZWQsIHRoZSB3aG9sZSBhcnJheSBpcyByZWplY3RlZCBpbW1lZGlhdGVseS5cbiAqIEBwYXJhbSB7QXJyYXkqfSBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlc1xuICovXG4vLyBCeSBNYXJrIE1pbGxlclxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46Y29uY3VycmVuY3kmcmV2PTEzMDg3NzY1MjEjYWxsZnVsZmlsbGVkXG5RLmFsbCA9IGFsbDtcbmZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgdmFyIGNvdW50RG93biA9IDA7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9taXNlcywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvbWlzZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBzbmFwc2hvdDtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBpc1Byb21pc2UocHJvbWlzZSkgJiZcbiAgICAgICAgICAgICAgICAoc25hcHNob3QgPSBwcm9taXNlLmluc3BlY3QoKSkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHNuYXBzaG90LnZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICArK2NvdW50RG93bjtcbiAgICAgICAgICAgICAgICB3aGVuKFxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tY291bnREb3duID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkoeyBpbmRleDogaW5kZXgsIHZhbHVlOiBwcm9ncmVzcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgICAgIGlmIChjb3VudERvd24gPT09IDApIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbCh0aGlzKTtcbn07XG5cbi8qKlxuICogV2FpdHMgZm9yIGFsbCBwcm9taXNlcyB0byBiZSBzZXR0bGVkLCBlaXRoZXIgZnVsZmlsbGVkIG9yXG4gKiByZWplY3RlZC4gIFRoaXMgaXMgZGlzdGluY3QgZnJvbSBgYWxsYCBzaW5jZSB0aGF0IHdvdWxkIHN0b3BcbiAqIHdhaXRpbmcgYXQgdGhlIGZpcnN0IHJlamVjdGlvbi4gIFRoZSBwcm9taXNlIHJldHVybmVkIGJ5XG4gKiBgYWxsUmVzb2x2ZWRgIHdpbGwgbmV2ZXIgYmUgcmVqZWN0ZWQuXG4gKiBAcGFyYW0gcHJvbWlzZXMgYSBwcm9taXNlIGZvciBhbiBhcnJheSAob3IgYW4gYXJyYXkpIG9mIHByb21pc2VzXG4gKiAob3IgdmFsdWVzKVxuICogQHJldHVybiBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHByb21pc2VzXG4gKi9cblEuYWxsUmVzb2x2ZWQgPSBkZXByZWNhdGUoYWxsUmVzb2x2ZWQsIFwiYWxsUmVzb2x2ZWRcIiwgXCJhbGxTZXR0bGVkXCIpO1xuZnVuY3Rpb24gYWxsUmVzb2x2ZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHByb21pc2VzID0gYXJyYXlfbWFwKHByb21pc2VzLCBRKTtcbiAgICAgICAgcmV0dXJuIHdoZW4oYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB3aGVuKHByb21pc2UsIG5vb3AsIG5vb3ApO1xuICAgICAgICB9KSksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlcztcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFsbFJlc29sdmVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGxSZXNvbHZlZCh0aGlzKTtcbn07XG5cbi8qKlxuICogQHNlZSBQcm9taXNlI2FsbFNldHRsZWRcbiAqL1xuUS5hbGxTZXR0bGVkID0gYWxsU2V0dGxlZDtcbmZ1bmN0aW9uIGFsbFNldHRsZWQocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gUShwcm9taXNlcykuYWxsU2V0dGxlZCgpO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIGFycmF5IG9mIHByb21pc2VzIGludG8gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGVpciBzdGF0ZXMgKGFzXG4gKiByZXR1cm5lZCBieSBgaW5zcGVjdGApIHdoZW4gdGhleSBoYXZlIGFsbCBzZXR0bGVkLlxuICogQHBhcmFtIHtBcnJheVtBbnkqXX0gdmFsdWVzIGFuIGFycmF5IChvciBwcm9taXNlIGZvciBhbiBhcnJheSkgb2YgdmFsdWVzIChvclxuICogcHJvbWlzZXMgZm9yIHZhbHVlcylcbiAqIEByZXR1cm5zIHtBcnJheVtTdGF0ZV19IGFuIGFycmF5IG9mIHN0YXRlcyBmb3IgdGhlIHJlc3BlY3RpdmUgdmFsdWVzLlxuICovXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxTZXR0bGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHJldHVybiBhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcHJvbWlzZSA9IFEocHJvbWlzZSk7XG4gICAgICAgICAgICBmdW5jdGlvbiByZWdhcmRsZXNzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlLmluc3BlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVnYXJkbGVzcywgcmVnYXJkbGVzcyk7XG4gICAgICAgIH0pKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIGZhaWx1cmUgb2YgYSBwcm9taXNlLCBnaXZpbmcgYW4gb3BvcnR1bml0eSB0byByZWNvdmVyXG4gKiB3aXRoIGEgY2FsbGJhY2suICBJZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpcyBmdWxmaWxsZWQsIHRoZSByZXR1cm5lZFxuICogcHJvbWlzZSBpcyBmdWxmaWxsZWQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gZnVsZmlsbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpZiB0aGVcbiAqIGdpdmVuIHByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgY2FsbGJhY2tcbiAqL1xuUS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKG9iamVjdCwgcmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5mYWlsID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIEF0dGFjaGVzIGEgbGlzdGVuZXIgdGhhdCBjYW4gcmVzcG9uZCB0byBwcm9ncmVzcyBub3RpZmljYXRpb25zIGZyb20gYVxuICogcHJvbWlzZSdzIG9yaWdpbmF0aW5nIGRlZmVycmVkLiBUaGlzIGxpc3RlbmVyIHJlY2VpdmVzIHRoZSBleGFjdCBhcmd1bWVudHNcbiAqIHBhc3NlZCB0byBgYGRlZmVycmVkLm5vdGlmeWBgLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIHJlY2VpdmUgYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm5zIHRoZSBnaXZlbiBwcm9taXNlLCB1bmNoYW5nZWRcbiAqL1xuUS5wcm9ncmVzcyA9IHByb2dyZXNzO1xuZnVuY3Rpb24gcHJvZ3Jlc3Mob2JqZWN0LCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiAocHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufTtcblxuLyoqXG4gKiBQcm92aWRlcyBhbiBvcHBvcnR1bml0eSB0byBvYnNlcnZlIHRoZSBzZXR0bGluZyBvZiBhIHByb21pc2UsXG4gKiByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHByb21pc2UgaXMgZnVsZmlsbGVkIG9yIHJlamVjdGVkLiAgRm9yd2FyZHNcbiAqIHRoZSByZXNvbHV0aW9uIHRvIHRoZSByZXR1cm5lZCBwcm9taXNlIHdoZW4gdGhlIGNhbGxiYWNrIGlzIGRvbmUuXG4gKiBUaGUgY2FsbGJhY2sgY2FuIHJldHVybiBhIHByb21pc2UgdG8gZGVmZXIgY29tcGxldGlvbi5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gb2JzZXJ2ZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW5cbiAqIHByb21pc2UsIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2Ugd2hlblxuICogYGBmaW5gYCBpcyBkb25lLlxuICovXG5RLmZpbiA9IC8vIFhYWCBsZWdhY3lcblFbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShvYmplY3QpW1wiZmluYWxseVwiXShjYWxsYmFjayk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5maW4gPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRPRE8gYXR0ZW1wdCB0byByZWN5Y2xlIHRoZSByZWplY3Rpb24gd2l0aCBcInRoaXNcIi5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUZXJtaW5hdGVzIGEgY2hhaW4gb2YgcHJvbWlzZXMsIGZvcmNpbmcgcmVqZWN0aW9ucyB0byBiZVxuICogdGhyb3duIGFzIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXG4gKiBAcmV0dXJucyBub3RoaW5nXG4gKi9cblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kb25lKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxuICAgICAgICAvLyBkb2VzIG5vdCBjYXRjaCBpdCBhbmQgdHVybiBpdCBpbnRvIGEgcmVqZWN0aW9uLlxuICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSk7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBdm9pZCB1bm5lY2Vzc2FyeSBgbmV4dFRpY2tgaW5nIHZpYSBhbiB1bm5lY2Vzc2FyeSBgd2hlbmAuXG4gICAgdmFyIHByb21pc2UgPSBmdWxmaWxsZWQgfHwgcmVqZWN0ZWQgfHwgcHJvZ3Jlc3MgP1xuICAgICAgICB0aGlzLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIDpcbiAgICAgICAgdGhpcztcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICAgIG9uVW5oYW5kbGVkRXJyb3IgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKG9uVW5oYW5kbGVkRXJyb3IpO1xuICAgIH1cblxuICAgIHByb21pc2UudGhlbih2b2lkIDAsIG9uVW5oYW5kbGVkRXJyb3IpO1xufTtcblxuLyoqXG4gKiBDYXVzZXMgYSBwcm9taXNlIHRvIGJlIHJlamVjdGVkIGlmIGl0IGRvZXMgbm90IGdldCBmdWxmaWxsZWQgYmVmb3JlXG4gKiBzb21lIG1pbGxpc2Vjb25kcyB0aW1lIG91dC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kcyB0aW1lb3V0XG4gKiBAcGFyYW0ge0FueSp9IGN1c3RvbSBlcnJvciBtZXNzYWdlIG9yIEVycm9yIG9iamVjdCAob3B0aW9uYWwpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGlmIGl0IGlzXG4gKiBmdWxmaWxsZWQgYmVmb3JlIHRoZSB0aW1lb3V0LCBvdGhlcndpc2UgcmVqZWN0ZWQuXG4gKi9cblEudGltZW91dCA9IGZ1bmN0aW9uIChvYmplY3QsIG1zLCBlcnJvcikge1xuICAgIHJldHVybiBRKG9iamVjdCkudGltZW91dChtcywgZXJyb3IpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgZXJyb3IpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFlcnJvciB8fCBcInN0cmluZ1wiID09PSB0eXBlb2YgZXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKGVycm9yIHx8IFwiVGltZWQgb3V0IGFmdGVyIFwiICsgbXMgKyBcIiBtc1wiKTtcbiAgICAgICAgICAgIGVycm9yLmNvZGUgPSBcIkVUSU1FRE9VVFwiO1xuICAgICAgICB9XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgfSwgbXMpO1xuXG4gICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfSwgZGVmZXJyZWQubm90aWZ5KTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIGdpdmVuIHZhbHVlIChvciBwcm9taXNlZCB2YWx1ZSksIHNvbWVcbiAqIG1pbGxpc2Vjb25kcyBhZnRlciBpdCByZXNvbHZlZC4gUGFzc2VzIHJlamVjdGlvbnMgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgYWZ0ZXIgbWlsbGlzZWNvbmRzXG4gKiB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlLlxuICogSWYgdGhlIGdpdmVuIHByb21pc2UgcmVqZWN0cywgdGhhdCBpcyBwYXNzZWQgaW1tZWRpYXRlbHkuXG4gKi9cblEuZGVsYXkgPSBmdW5jdGlvbiAob2JqZWN0LCB0aW1lb3V0KSB7XG4gICAgaWYgKHRpbWVvdXQgPT09IHZvaWQgMCkge1xuICAgICAgICB0aW1lb3V0ID0gb2JqZWN0O1xuICAgICAgICBvYmplY3QgPSB2b2lkIDA7XG4gICAgfVxuICAgIHJldHVybiBRKG9iamVjdCkuZGVsYXkodGltZW91dCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWxheSA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBhcyBhbiBhcnJheSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICpcbiAqICAgICAgUS5uZmFwcGx5KEZTLnJlYWRGaWxlLCBbX19maWxlbmFtZV0pXG4gKiAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiAgICAgIH0pXG4gKlxuICovXG5RLm5mYXBwbHkgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGFyZ3MpIHtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYXBwbHkgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGluZGl2aWR1YWxseSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZjYWxsKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKVxuICogLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqIH0pXG4gKlxuICovXG5RLm5mY2FsbCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogV3JhcHMgYSBOb2RlSlMgY29udGludWF0aW9uIHBhc3NpbmcgZnVuY3Rpb24gYW5kIHJldHVybnMgYW4gZXF1aXZhbGVudFxuICogdmVyc2lvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZiaW5kKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKShcInV0Zi04XCIpXG4gKiAudGhlbihjb25zb2xlLmxvZylcbiAqIC5kb25lKClcbiAqL1xuUS5uZmJpbmQgPVxuUS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBRKGNhbGxiYWNrKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYmluZCA9XG5Qcm9taXNlLnByb3RvdHlwZS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLmRlbm9kZWlmeS5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuUS5uYmluZCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3AgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzcCwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBRKGJvdW5kKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5iaW5kID0gZnVuY3Rpb24gKC8qdGhpc3AsIC4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAwKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEubmJpbmQuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjayB3aXRoIGEgZ2l2ZW4gYXJyYXkgb2YgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFja1xuICogd2lsbCBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5ucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5wb3N0KG5hbWUsIGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5ucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyB8fCBbXSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrLCBmb3J3YXJkaW5nIHRoZSBnaXZlbiB2YXJpYWRpYyBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZFxuICogY2FsbGJhY2sgYXJndW1lbnQuXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0gLi4uYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2sgd2lsbFxuICogYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5RLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblEubmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUHJvbWlzZS5wcm90b3R5cGUubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUHJvbWlzZS5wcm90b3R5cGUubmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIElmIGEgZnVuY3Rpb24gd291bGQgbGlrZSB0byBzdXBwb3J0IGJvdGggTm9kZSBjb250aW51YXRpb24tcGFzc2luZy1zdHlsZSBhbmRcbiAqIHByb21pc2UtcmV0dXJuaW5nLXN0eWxlLCBpdCBjYW4gZW5kIGl0cyBpbnRlcm5hbCBwcm9taXNlIGNoYWluIHdpdGhcbiAqIGBub2RlaWZ5KG5vZGViYWNrKWAsIGZvcndhcmRpbmcgdGhlIG9wdGlvbmFsIG5vZGViYWNrIGFyZ3VtZW50LiAgSWYgdGhlIHVzZXJcbiAqIGVsZWN0cyB0byB1c2UgYSBub2RlYmFjaywgdGhlIHJlc3VsdCB3aWxsIGJlIHNlbnQgdGhlcmUuICBJZiB0aGV5IGRvIG5vdFxuICogcGFzcyBhIG5vZGViYWNrLCB0aGV5IHdpbGwgcmVjZWl2ZSB0aGUgcmVzdWx0IHByb21pc2UuXG4gKiBAcGFyYW0gb2JqZWN0IGEgcmVzdWx0IChvciBhIHByb21pc2UgZm9yIGEgcmVzdWx0KVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm9kZWJhY2sgYSBOb2RlLmpzLXN0eWxlIGNhbGxiYWNrXG4gKiBAcmV0dXJucyBlaXRoZXIgdGhlIHByb21pc2Ugb3Igbm90aGluZ1xuICovXG5RLm5vZGVpZnkgPSBub2RlaWZ5O1xuZnVuY3Rpb24gbm9kZWlmeShvYmplY3QsIG5vZGViYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ub2RlaWZ5KG5vZGViYWNrKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUubm9kZWlmeSA9IGZ1bmN0aW9uIChub2RlYmFjaykge1xuICAgIGlmIChub2RlYmFjaykge1xuICAgICAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufTtcblxuLy8gQWxsIGNvZGUgYmVmb3JlIHRoaXMgcG9pbnQgd2lsbCBiZSBmaWx0ZXJlZCBmcm9tIHN0YWNrIHRyYWNlcy5cbnZhciBxRW5kaW5nTGluZSA9IGNhcHR1cmVMaW5lKCk7XG5cbnJldHVybiBRO1xuXG59KTtcbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdCA9ICd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3dcbiAgPyB0aGlzXG4gIDogd2luZG93O1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxuZnVuY3Rpb24gZ2V0WEhSKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICYmICgnZmlsZTonICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2wgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHRyaW0gPSAnJy50cmltXG4gID8gZnVuY3Rpb24ocykgeyByZXR1cm4gcy50cmltKCk7IH1cbiAgOiBmdW5jdGlvbihzKSB7IHJldHVybiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpOyB9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBwYWlycyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG51bGwgIT0gb2JqW2tleV0pIHtcbiAgICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tleV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFydHM7XG4gIHZhciBwYWlyO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwYXJ0cyA9IHBhaXIuc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ2FwcGxpY2F0aW9uL3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogc2VyaWFsaXplLFxuICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeVxuIH07XG5cbiAvKipcbiAgKiBEZWZhdWx0IHBhcnNlcnMuXG4gICpcbiAgKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAgKiAgICAgfTtcbiAgKlxuICAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgdmFyIGZpZWxkcyA9IHt9O1xuICB2YXIgaW5kZXg7XG4gIHZhciBsaW5lO1xuICB2YXIgZmllbGQ7XG4gIHZhciB2YWw7XG5cbiAgbGluZXMucG9wKCk7IC8vIHRyYWlsaW5nIENSTEZcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICB0aGlzLnRleHQgPSB0aGlzLnhoci5yZXNwb25zZVRleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dClcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIHN0ci5sZW5ndGhcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzIHx8IDEyMjMgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgICBpZiAoJ0hFQUQnID09IG1ldGhvZCkgcmVzLnRleHQgPSBudWxsO1xuICAgICAgc2VsZi5jYWxsYmFjayhudWxsLCByZXMpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignUGFyc2VyIGlzIHVuYWJsZSB0byBwYXJzZSB0aGUgcmVzcG9uc2UnKTtcbiAgICAgIGVyci5wYXJzZSA9IHRydWU7XG4gICAgICBlcnIub3JpZ2luYWwgPSBlO1xuICAgICAgc2VsZi5jYWxsYmFjayhlcnIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnVuc2V0KCdVc2VyLUFnZW50JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51bnNldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaikgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIGlmICgyID09IGZuLmxlbmd0aCkgcmV0dXJuIGZuKGVyciwgcmVzKTtcbiAgaWYgKGVycikgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICBmbihyZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSBnZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG4gICAgaWYgKDAgPT0geGhyLnN0YXR1cykge1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmRlbCA9IGZ1bmN0aW9uKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyJdfQ==
