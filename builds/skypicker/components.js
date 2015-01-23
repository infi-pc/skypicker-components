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
window.SearchFormAdapter = Wgts.SearchFormAdapter = require('./../modules/plainJsAdapters/SearchFormAdapter.jsx');


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
        modeOptions.push(React.createElement("div", {key: imode, className: className, onClick:  this.switchModeTo(imode) },  this.getModeLabel(imode) ))
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
    if (!value) {
      value = this.props.value; //just same value as, but behave as it was selected
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

  moveNext: function (value) {
    this.props.onSelect(null, "next");
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
      active: this.props.defaultActive || "origin",
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

  componentDidUpdate: function (prevProps, prevState) {
    this.refreshShown();

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
              onKeyDown: this.onInputKeyDown, 
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

/**
 * options.element - element to bind whole search form
 * options.defaultActive - mode which will be activated on init of component - default: "origin", set null to don't show any
 */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZXhwb3J0c1xcc2t5cGlja2VyLmpzeCIsIm1vZHVsZXNcXEFQSXNcXFBsYWNlc0FQSS5qc3giLCJtb2R1bGVzXFxBUElzXFxQbGFjZXNBUElDYWNoZWQuanN4IiwibW9kdWxlc1xcQ2FsZW5kYXIuanN4IiwibW9kdWxlc1xcRGF0ZVBpY2tlclxcRGF0ZVBpY2tlck1vZGFsLmpzeCIsIm1vZHVsZXNcXERhdGVQaWNrZXJcXGNvbXBvbmVudHNcXENhbGVuZGFyRGF5LmpzeCIsIm1vZHVsZXNcXERhdGVQaWNrZXJcXGNvbXBvbmVudHNcXENhbGVuZGFyRnJhbWUuanN4IiwibW9kdWxlc1xcRGF0ZVBpY2tlclxcY29tcG9uZW50c1xcRGF0ZVBpY2tlci5qc3giLCJtb2R1bGVzXFxEYXRlUGlja2VyXFxjb21wb25lbnRzXFxNb250aE1hdHJpeC5qc3giLCJtb2R1bGVzXFxEYXRlUGlja2VyXFxjb21wb25lbnRzXFxTbGlkZXIuanMiLCJtb2R1bGVzXFxEYXRlVG9vbHMuanMiLCJtb2R1bGVzXFxHZW9sb2NhdGlvbi5qc3giLCJtb2R1bGVzXFxNb2RhbE1lbnVNaXhpbi5qc3giLCJtb2R1bGVzXFxNb2RhbFBpY2tlci5qc3giLCJtb2R1bGVzXFxQbGFjZVBpY2tlclxcUGxhY2VQaWNrZXJNb2RhbC5qc3giLCJtb2R1bGVzXFxQbGFjZVBpY2tlclxcY29tcG9uZW50c1xcUGxhY2VQaWNrZXIuanN4IiwibW9kdWxlc1xcUGxhY2VQaWNrZXJcXGNvbXBvbmVudHNcXFBsYWNlUm93LmpzeCIsIm1vZHVsZXNcXFBsYWNlUGlja2VyXFxjb21wb25lbnRzXFxQbGFjZXMuanN4IiwibW9kdWxlc1xcU2VhcmNoRm9ybVxcU2VhcmNoRm9ybS5qc3giLCJtb2R1bGVzXFxUcmFuLmpzeCIsIm1vZHVsZXNcXGNvbnRhaW5lcnNcXE9wdGlvbnMuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcUGxhY2UuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcUmFkaXVzLmpzeCIsIm1vZHVsZXNcXGNvbnRhaW5lcnNcXFNlYXJjaERhdGUuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcU2VhcmNoRm9ybURhdGEuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcU2VhcmNoUGxhY2UuanN4IiwibW9kdWxlc1xcY29udGFpbmVyc1xcaW1tdXRhYmxlLmpzeCIsIm1vZHVsZXNcXHBsYWluSnNBZGFwdGVyc1xcU2VhcmNoRm9ybUFkYXB0ZXIuanN4IiwibW9kdWxlc1xcc3RvcmVzXFxPcHRpb25zU3RvcmUuanN4IiwibW9kdWxlc1xcc3RvcmVzXFxTZWFyY2hGb3JtU3RvcmUuanN4IiwibW9kdWxlc1xcdG9vbHNcXERhdGVQYWlyVmFsaWRhdG9yLmpzeCIsIm1vZHVsZXNcXHRvb2xzXFxnZW8uanMiLCJtb2R1bGVzXFx0b29sc1xcaXNJRS5qcyIsIm1vZHVsZXNcXHRvb2xzXFxsYXRsb24uanMiLCJtb2R1bGVzXFx0ci5qcyIsIm1vZHVsZXNcXHRyYW5zbGF0aW9uU3RyYXRlZ2llc1xcc3BUci5qcyIsIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxldmVudHNcXGV2ZW50cy5qcyIsIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxwcm9jZXNzXFxicm93c2VyLmpzIiwibm9kZV9tb2R1bGVzXFxkZWVwbWVyZ2VcXGluZGV4LmpzIiwibm9kZV9tb2R1bGVzXFxxXFxxLmpzIiwibm9kZV9tb2R1bGVzXFxzdXBlcmFnZW50XFxsaWJcXGNsaWVudC5qcyIsIm5vZGVfbW9kdWxlc1xcc3VwZXJhZ2VudFxcbm9kZV9tb2R1bGVzXFxjb21wb25lbnQtZW1pdHRlclxcaW5kZXguanMiLCJub2RlX21vZHVsZXNcXHN1cGVyYWdlbnRcXG5vZGVfbW9kdWxlc1xccmVkdWNlLWNvbXBvbmVudFxcaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2o1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgdHJhbnNsYXRpb25TdHJhdGVneSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy90cmFuc2xhdGlvblN0cmF0ZWdpZXMvc3BUci5qcycpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL3RyLmpzJyk7XG50ci5zZXRTdHJhdGVneSh0cmFuc2xhdGlvblN0cmF0ZWd5KTtcbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xuXG53aW5kb3cuV2d0cyA9IHt9OyAvL1RoYXQncyBuYW1lc3BhY2UgaWYgdGhlcmUgd2lsbCBiZSBzb21lIG5hbWUgY29sbGlzaW9uXG5cbndpbmRvdy5QbGFjZSA9IFdndHMuUGxhY2UgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9QbGFjZS5qc3gnKTtcbndpbmRvdy5SYWRpdXMgPSBXZ3RzLlJhZGl1cyA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9jb250YWluZXJzL1JhZGl1cy5qc3gnKTtcbndpbmRvdy5TZWFyY2hEYXRlID0gV2d0cy5TZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi9tb2R1bGVzL2NvbnRhaW5lcnMvU2VhcmNoRGF0ZS5qc3gnKTtcbndpbmRvdy5TZWFyY2hQbGFjZSA9IFdndHMuU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtRGF0YSA9IFdndHMuU2VhcmNoRm9ybURhdGEgPSByZXF1aXJlKCcuLy4uL21vZHVsZXMvY29udGFpbmVycy9TZWFyY2hGb3JtRGF0YS5qc3gnKTtcbndpbmRvdy5TZWFyY2hGb3JtU3RvcmUgPSBXZ3RzLlNlYXJjaEZvcm1TdG9yZSA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCcpO1xud2luZG93LlNlYXJjaEZvcm1BZGFwdGVyID0gV2d0cy5TZWFyY2hGb3JtQWRhcHRlciA9IHJlcXVpcmUoJy4vLi4vbW9kdWxlcy9wbGFpbkpzQWRhcHRlcnMvU2VhcmNoRm9ybUFkYXB0ZXIuanN4Jyk7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIHN1cGVyYWdlbnQgID0gcmVxdWlyZShcInN1cGVyYWdlbnRcIik7XG52YXIgUGxhY2UgID0gcmVxdWlyZShcIi4uL2NvbnRhaW5lcnMvUGxhY2UuanN4XCIpO1xudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZScpO1xudmFyIFEgPSByZXF1aXJlKCdxJyk7XG5cbnZhciB1cmwgPSBcImh0dHBzOi8vYXBpLnNreXBpY2tlci5jb20vcGxhY2VzXCI7XG5cbi8vVE9ETyBjaGVjayBpZiBvbiBlcnJvciBpcyBjYWxsZWQgZXhhY3RseSB3aGVuIGVycm9yIGluIGNhbGxiYWNrIG9yIG5vdCwgdGhlbiBBZGQgaXQgdG8gcHJvbWlzZVxudmFyIGhhbmRsZUVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICBjb25zb2xlLmVycm9yKGVycik7XG59O1xuXG5cbiAgZnVuY3Rpb24gUGxhY2VzQVBJKHNldHRpbmdzKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuICB9XG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuY29udmVydFJlc3VsdHM9ZnVuY3Rpb24ocmVzdWx0cykge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiByZXN1bHRzLm1hcChmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICByZXR1cm4gbmV3IFBsYWNlKHJlc3VsdCk7XG4gICAgfSk7XG4gIH07XG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuY2FsbEFQST1mdW5jdGlvbihwYXJhbXMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgdmFyIGRlZmF1bHRQYXJhbXMgPSB7XG4gICAgICB2OiAyLFxuICAgICAgbG9jYWxlOiB0aGlzLnNldHRpbmdzLmxhbmdcbiAgICB9O1xuICAgIHN1cGVyYWdlbnRcbiAgICAgIC5nZXQodXJsKVxuICAgICAgLnF1ZXJ5KGRlZXBtZXJnZShwYXJhbXMsIGRlZmF1bHRQYXJhbXMpKVxuICAgICAgLy8uc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJylcbiAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgIC5vbignZXJyb3InLCBoYW5kbGVFcnJvcilcbiAgICAgIC5lbmQoIGZ1bmN0aW9uKHJlcykgIHtcbiAgICAgICAgaWYgKCFyZXMuZXJyb3IpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRoaXMuY29udmVydFJlc3VsdHMocmVzLmJvZHkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKHJlcy5lcnJvcikpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG4gIFBsYWNlc0FQSS5wcm90b3R5cGUucmVnaXN0ZXJJbXBvcnRhbmNlPWZ1bmN0aW9uKGlkKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuICAgIHN1cGVyYWdlbnRcbiAgICAgIC5wb3N0KHVybCArIFwiL1wiICsgaWQpXG4gICAgICAuZW5kKCBmdW5jdGlvbihyZXMpICB7XG4gICAgICAgIGlmICghcmVzLmVycm9yKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0aGlzLmNvbnZlcnRSZXN1bHRzKHJlcy5ib2R5KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihyZXMuZXJyb3IpKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcbiAgUGxhY2VzQVBJLnByb3RvdHlwZS5maW5kQnlOYW1lPWZ1bmN0aW9uKHRlcm0pIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQVBJKHt0ZXJtOiB0ZXJtfSk7XG4gIH07XG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuZmluZE5lYXJieT1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQVBJKGJvdW5kcyk7XG4gIH07XG4gIFBsYWNlc0FQSS5wcm90b3R5cGUuZmluZEJ5SWQ9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG4gICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgIHY6IDIsXG4gICAgICBsb2NhbGU6IHRoaXMuc2V0dGluZ3MubGFuZyxcbiAgICAgIGlkOiBpZFxuICAgIH07XG4gICAgc3VwZXJhZ2VudFxuICAgICAgLmdldCh1cmwgKyBcIi9cIiArIGlkKVxuICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgIC8vLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpXG4gICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAub24oJ2Vycm9yJywgaGFuZGxlRXJyb3IpXG4gICAgICAuZW5kKCBmdW5jdGlvbihyZXMpICB7XG4gICAgICAgIGlmICghcmVzLmVycm9yKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShuZXcgUGxhY2UocmVzLmJvZHkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKHJlcy5lcnJvcikpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIC8vQ2FsbCBvbmUgbW9yZSBwb3N0XG4gICAgdGhpcy5yZWdpc3RlckltcG9ydGFuY2UoaWQpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2VzQVBJO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUGxhY2VzQVBJICA9IHJlcXVpcmUoXCIuL1BsYWNlc0FQSS5qc3hcIik7XG52YXIgUSAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBHbG9iYWxQcm9taXNlc1N0b3JlID0ge307XG5cblxuICBmdW5jdGlvbiBQbGFjZXNBUElDYWNoZWQoc2V0dGluZ3MpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB0aGlzLnBsYWNlc0FQSSA9IG5ldyBQbGFjZXNBUEkoc2V0dGluZ3MpO1xuICB9XG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuY2FsbENhY2hlZD1mdW5jdGlvbihmdW5jLCBwYXJhbXMsIGtleSkge1widXNlIHN0cmljdFwiO1xuICAgIGlmICghR2xvYmFsUHJvbWlzZXNTdG9yZVtrZXldKSB7XG4gICAgICBHbG9iYWxQcm9taXNlc1N0b3JlW2tleV0gPSBmdW5jKHBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiBHbG9iYWxQcm9taXNlc1N0b3JlW2tleV07XG4gIH07XG5cbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5ib3VuZHNUb1N0cmluZz1mdW5jdGlvbihib3VuZHMpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gYm91bmRzLmxhdF9sbyArIFwiX1wiICsgYm91bmRzLmxuZ19sbyArIFwiX1wiICsgYm91bmRzLmxhdF9oaSArIFwiX1wiICsgYm91bmRzLmxuZ19oaTtcbiAgfTtcblxuICBQbGFjZXNBUElDYWNoZWQucHJvdG90eXBlLmZpbmRCeU5hbWU9ZnVuY3Rpb24odGVybSkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmNhbGxDYWNoZWQodGhpcy5wbGFjZXNBUEkuZmluZEJ5TmFtZS5iaW5kKHRoaXMucGxhY2VzQVBJKSwgdGVybSwgdGVybSk7XG4gIH07XG5cbiAgUGxhY2VzQVBJQ2FjaGVkLnByb3RvdHlwZS5maW5kTmVhcmJ5PWZ1bmN0aW9uKGJvdW5kcykge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLmNhbGxDYWNoZWQodGhpcy5wbGFjZXNBUEkuZmluZE5lYXJieS5iaW5kKHRoaXMucGxhY2VzQVBJKSwgYm91bmRzLCB0aGlzLmJvdW5kc1RvU3RyaW5nKGJvdW5kcykpO1xuICB9O1xuXG4gIFBsYWNlc0FQSUNhY2hlZC5wcm90b3R5cGUuZmluZEJ5SWQ9ZnVuY3Rpb24oaWQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gdGhpcy5jYWxsQ2FjaGVkKHRoaXMucGxhY2VzQVBJLmZpbmRCeUlkLmJpbmQodGhpcy5wbGFjZXNBUEkpLCBpZCwgXCJpZDpcIitpZCk7XG4gIH07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZXNBUElDYWNoZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG4vKiBwYXJ0IGlzIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL0hhbnNlL3JlYWN0LWNhbGVuZGFyL2Jsb2IvbWFzdGVyL3NyYy9jYWxlbmRhci5qcyAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG5cblxuXG52YXIgQ2FsZW5kYXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiQ2FsZW5kYXJcIixcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3ZWVrT2Zmc2V0OiAwLFxuICAgICAgbGFuZzogJ2VuJyxcbiAgICAgIGZvcmNlU2l4Um93czogdHJ1ZVxuICAgIH07XG4gIH0sXG5cbiAgZGF5TmFtZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGF5TmFtZXMgPSBbXTtcbiAgICB2YXIgZGF0ZSA9IHRoaXMucHJvcHMuZGF0ZS5zdGFydE9mKCdtb250aCcpO1xuICAgIHZhciBkaWZmID0gZGF0ZS53ZWVrZGF5KCkgLSB0aGlzLnByb3BzLndlZWtPZmZzZXQ7XG4gICAgaWYgKGRpZmYgPCAwKSBkaWZmICs9IDc7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgdmFyIGRheSA9IG1vbWVudC51dGMoW3RoaXMucHJvcHMuZGF0ZS55ZWFyKCksIHRoaXMucHJvcHMuZGF0ZS5tb250aCgpLCBpLWRpZmYrMSs3XSk7XG4gICAgICBkYXlOYW1lcy5wdXNoKGRheS5mb3JtYXQoXCJkZFwiKSk7XG4gICAgfVxuICAgIHJldHVybiBkYXlOYW1lcztcbiAgfSxcblxuICBkYXlzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGF5cyA9IFtdO1xuICAgIHZhciBiZWdpbkRhdGUgPSB0aGlzLnByb3BzLmRhdGUuc3RhcnRPZignbW9udGgnKTtcbiAgICB2YXIgZGlmZiA9IGJlZ2luRGF0ZS53ZWVrZGF5KCkgLSB0aGlzLnByb3BzLndlZWtPZmZzZXQ7XG4gICAgaWYgKGRpZmYgPCAwKSBkaWZmICs9IDc7XG5cbiAgICB2YXIgaTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpZmY7IGkrKykge1xuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgMV0pLnN1YnRyYWN0KChkaWZmLWkpLCAnZGF5cycpO1xuICAgICAgZGF5cy5wdXNoKHtkYXRlOiBkYXRlLCBvdGhlck1vbnRoOiAncHJldi1tb250aCd9KTtcbiAgICB9XG5cbiAgICB2YXIgbnVtYmVyT2ZEYXlzID0gYmVnaW5EYXRlLmRheXNJbk1vbnRoKCk7XG4gICAgZm9yIChpID0gMTsgaSA8PSBudW1iZXJPZkRheXM7IGkrKykge1xuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgaV0pO1xuICAgICAgZGF5cy5wdXNoKHtkYXRlOiBkYXRlfSk7XG4gICAgfVxuXG4gICAgaSA9IDE7XG4gICAgd2hpbGUgKGRheXMubGVuZ3RoICUgNyAhPT0gMCkge1xuICAgICAgdmFyIGRhdGUgPSBtb21lbnQudXRjKFt0aGlzLnByb3BzLmRhdGUueWVhcigpLCB0aGlzLnByb3BzLmRhdGUubW9udGgoKSwgbnVtYmVyT2ZEYXlzXSkuYWRkKGksIFwiZGF5c1wiKTtcbiAgICAgIGRheXMucHVzaCh7ZGF0ZTogZGF0ZSwgb3RoZXJNb250aDogJ25leHQtbW9udGgnfSk7XG4gICAgICBpKys7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuZm9yY2VTaXhSb3dzICYmIGRheXMubGVuZ3RoICE9PSA0Mikge1xuICAgICAgdmFyIHN0YXJ0ID0gbW9tZW50LnV0YyhkYXlzW2RheXMubGVuZ3RoLTFdLmRhdGUpLmFkZCgxLCAnZGF5cycpO1xuICAgICAgd2hpbGUgKGRheXMubGVuZ3RoIDwgNDIpIHtcbiAgICAgICAgZGF5cy5wdXNoKHtkYXRlOiBtb21lbnQudXRjKHN0YXJ0KSwgb3RoZXJNb250aDogJ25leHQtbW9udGgnfSk7XG4gICAgICAgIHN0YXJ0LmFkZCgxLCAnZGF5cycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXlzO1xuICB9LFxuICBzcGxpdFRvV2Vla3M6IGZ1bmN0aW9uIChkYXlzKSB7XG4gICAgdmFyIHdlZWtzID0gW107XG4gICAgdmFyIGFjdHVhbFdlZWsgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaTxkYXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaSU3ID09IDAgJiYgaSAhPSAwKSB7XG4gICAgICAgIHdlZWtzLnB1c2goYWN0dWFsV2Vlayk7XG4gICAgICAgIGFjdHVhbFdlZWsgPSBbXTtcbiAgICAgIH1cbiAgICAgIGFjdHVhbFdlZWsucHVzaChkYXlzW2ldKVxuICAgIH1cbiAgICB3ZWVrcy5wdXNoKGFjdHVhbFdlZWspO1xuICAgIHJldHVybiB3ZWVrcztcbiAgfSxcbiAgcmVuZGVyV2VlazogZnVuY3Rpb24gKHdlZWspIHtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcIndlZWtcIn0sIFxuICAgICAgICB3ZWVrLm1hcCh0aGlzLnJlbmRlckRheSlcbiAgICAgIClcbiAgICApXG4gIH0sXG4gIHJlbmRlckRheTogZnVuY3Rpb24oZGF5KSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZ2V0RGF5KGRheS5kYXRlLCBkYXkub3RoZXJNb250aCk7XG4gIH0sXG4gIHJlbmRlckRheU5hbWU6IGZ1bmN0aW9uIChkYXlOYW1lKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogZGF5TmFtZSwgY2xhc3NOYW1lOiBcImRheS1uYW1lXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBkYXlOYW1lICkpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3ZWVrcyA9IHRoaXMuc3BsaXRUb1dlZWtzKHRoaXMuZGF5cygpKTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsbmRyXCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsbmRyLW1vbnRoXCJ9LCBcbiAgICAgICAgICAgdGhpcy5wcm9wcy5kYXRlLmZvcm1hdChcIk1NTU0gWVlZWVwiKSBcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjbG5kci1ncmlkXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiZGF5LW5hbWVzXCJ9LCBcbiAgICAgICAgICAgIHRoaXMuZGF5TmFtZXMoKS5tYXAodGhpcy5yZW5kZXJEYXlOYW1lKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJkYXlzXCJ9LCBcbiAgICAgICAgICAgIHdlZWtzLm1hcCh0aGlzLnJlbmRlcldlZWspXG4gICAgICAgICAgKSwgXG4gICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsZWFyLWJvdGhcIn0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYWxlbmRhcjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIE1vZGFsUGlja2VyID0gcmVxdWlyZShcIi4vLi4vTW9kYWxQaWNrZXIuanN4XCIpO1xudmFyIFNlYXJjaERhdGUgPSByZXF1aXJlKCcuLy4uL2NvbnRhaW5lcnMvU2VhcmNoRGF0ZS5qc3gnKTtcbnZhciBEYXRlUGlja2VyID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL0RhdGVQaWNrZXIuanN4Jyk7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZScpO1xuXG5cbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgaW5pdGlhbFZhbHVlOiBuZXcgU2VhcmNoRGF0ZSgpLFxuICBvbkhpZGU6IGZ1bmN0aW9uKCkge30sXG4gIGFwcGVuZFRvRWxlbWVudDogZG9jdW1lbnQuYm9keSxcbiAgbG9jYWxlOiBcImVuXCIsXG4gIHNpemVzOiB7XG4gICAgc2luZ2xlOiB7d2lkdGg6IDQ1NCwgaGVpZ2h0OiAyMDB9LFxuICAgIGludGVydmFsOiB7d2lkdGg6IDkwNywgaGVpZ2h0OiAyMDAsIHdpZHRoQ29tcGFjdDogNDU0fSxcbiAgICBtb250aDoge3dpZHRoOiA1NTAsIGhlaWdodDogMjAwfSxcbiAgICB0aW1lVG9TdGF5OiB7d2lkdGg6IDU1MCwgaGVpZ2h0OiAyMDB9LFxuICAgIGFueXRpbWU6IHt3aWR0aDogMTY5LCBoZWlnaHQ6IDIwMH0sXG4gICAgbm9SZXR1cm46IHt3aWR0aDogMTY5LCBoZWlnaHQ6IDIwMH1cbiAgfSxcbiAgbW9kZXM6IHtcbiAgICBcInNpbmdsZVwiOiB7XG4gICAgICBjbG9zZUFmdGVyOiBcInNlbGVjdFwiLCAvLyBzZWxlY3RcbiAgICAgIGZpbmlzaEFmdGVyOiBcInNlbGVjdFwiIC8vIHNlbGVjdFxuICAgIH0sXG4gICAgXCJpbnRlcnZhbFwiOiB7fSxcbiAgICBcIm1vbnRoXCI6IHt9LFxuICAgIFwidGltZVRvU3RheVwiOiB7fSxcbiAgICBcImFueXRpbWVcIjoge30sXG4gICAgXCJub1JldHVyblwiOiB7fVxuICB9XG59O1xuXG52YXIgRGF0ZVBpY2tlck1vZGFsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkRhdGVQaWNrZXJNb2RhbFwiLFxuICBnZXRPcHRpb25zOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGVlcG1lcmdlKGRlZmF1bHRPcHRpb25zLHRoaXMucHJvcHMub3B0aW9ucyk7XG4gIH0sXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25zOiB7fVxuICAgIH1cbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudFNpemU6IHt3aWR0aDogMTY5LCBoZWlnaHQ6IDIwMH1cbiAgICB9O1xuICB9LFxuICBvblZhbHVlQ2hhbmdlOiBmdW5jdGlvbiAodmFsdWUsIGNoYW5nZVR5cGUpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuICAgIGlmIChvcHRpb25zLm1vZGVzW3ZhbHVlLm1vZGVdICYmIG9wdGlvbnMubW9kZXNbdmFsdWUubW9kZV0uY2xvc2VBZnRlciA9PSBjaGFuZ2VUeXBlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uSGlkZSgpO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHZhbHVlLCBjaGFuZ2VUeXBlKTtcbiAgfSxcbiAgb25TaXplQ2hhbmdlOiBmdW5jdGlvbiAoc2l6ZXMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNvbnRlbnRTaXplOiBzaXplc1xuICAgIH0pO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKCk7XG4gICAgaWYgKCF0aGlzLnByb3BzLnNob3duKSB7cmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKX1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNb2RhbFBpY2tlciwge2NvbnRlbnRTaXplOiB0aGlzLnN0YXRlLmNvbnRlbnRTaXplLCBpbnB1dEVsZW1lbnQ6IHRoaXMucHJvcHMuaW5wdXRFbGVtZW50LCBvbkhpZGU6IHRoaXMucHJvcHMub25IaWRlfSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRGF0ZVBpY2tlciwge3ZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLCByZWY6IFwicGxhY2VQaWNrZXJcIiwgb25DaGFuZ2U6IHRoaXMub25WYWx1ZUNoYW5nZSwgc2l6ZXM6IG9wdGlvbnMuc2l6ZXMsIG1vZGVzOiBvcHRpb25zLm1vZGVzLCBvblNpemVDaGFuZ2U6IHRoaXMub25TaXplQ2hhbmdlfVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuICB9XG5cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0ZVBpY2tlck1vZGFsO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcblxudmFyIENhbGVuZGFyRGF5ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkNhbGVuZGFyRGF5XCIsXG5cbiAgb25PdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk92ZXIodGhpcy5wcm9wcy5kYXRlKVxuICB9LFxuICBvblNlbGVjdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy5kYXRlKVxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGU6IG51bGwsXG4gICAgICBvdGhlck1vbnRoOiAnJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBjbGFzc2VzID0gdGhpcy5wcm9wcy5vdGhlck1vbnRoO1xuICAgIGlmICghY2xhc3Nlcykge1xuICAgICAgY2xhc3NlcyA9IFwiXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICBjbGFzc2VzICs9IFwiIGRpc2FibGVkXCI7XG4gICAgICByZXR1cm4gKCAvL29uTW91c2VMZWF2ZT17IHRoaXMucHJvcHMub25MZWF2ZSB9XG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogY2xhc3NlcyB9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImRheS1udW1iZXJcIn0sIHRoaXMucHJvcHMuZGF0ZS5kYXRlKCkpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLm90aGVyKSB7XG4gICAgICBjbGFzc2VzICs9IFwiIG90aGVyXCI7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLm92ZXIpIHtcbiAgICAgIGNsYXNzZXMgKz0gXCIgb3ZlclwiXG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkKSB7XG4gICAgICBjbGFzc2VzICs9IFwiIHNlbGVjdGVkXCJcbiAgICB9XG4gICAgcmV0dXJuICggLy9vbk1vdXNlTGVhdmU9eyB0aGlzLnByb3BzLm9uTGVhdmUgfVxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc2VzLCBvbk1vdXNlRW50ZXI6ICB0aGlzLm9uT3Zlciwgb25DbGljazogIHRoaXMub25TZWxlY3R9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJkYXktbnVtYmVyXCJ9LCB0aGlzLnByb3BzLmRhdGUuZGF0ZSgpKVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGVuZGFyRGF5O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIFJlYWN0ID0gKHdpbmRvdy5SZWFjdCk7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xuXG52YXIgQ2FsZW5kYXJEYXkgPSByZXF1aXJlKFwiLi9DYWxlbmRhckRheS5qc3hcIik7XG52YXIgQ2FsZW5kYXIgPSByZXF1aXJlKFwiLi8uLi8uLi9DYWxlbmRhci5qc3hcIik7XG52YXIgRGF0ZVRvb2xzID0gcmVxdWlyZShcIi4vLi4vLi4vRGF0ZVRvb2xzLmpzXCIpO1xuXG52YXIgQ2FsZW5kYXJGcmFtZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJDYWxlbmRhckZyYW1lXCIsXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0ZU92ZXI6IG51bGwsXG4gICAgICB2aWV3RGF0ZTogbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pIHx8IG1vbWVudC51dGMoKVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBjYWxlbmRhcnNOdW1iZXI6IDEsXG4gICAgICBzZWxlY3Rpb25Nb2RlOiBcInNpbmdsZVwiXG5cbiAgICB9O1xuICB9LFxuXG4gIG9uT3ZlcjogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRhdGVPdmVyOiBkYXRlXG4gICAgfSk7XG4gIH0sXG5cbiAgLy9UT0RPIGNoZWNoIGlmIGl0IGlzIGdvb2QgdG8gaGF2ZSB0aGlzIHN0YXRlIGhlcmUsIG9yIGkgc2hvdWxkIHB1dCBpdCB0byBEYXRlUGlja2VcbiAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB2aWV3RGF0ZTogdGhpcy5zdGF0ZS52aWV3RGF0ZS5hZGQoMSwgJ21vbnRocycpXG4gICAgfSk7XG4gIH0sXG5cbiAgcHJldjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB2aWV3RGF0ZTogdGhpcy5zdGF0ZS52aWV3RGF0ZS5zdWJ0cmFjdCgxLCAnbW9udGhzJylcbiAgICB9KTtcbiAgfSxcblxuICBzZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBjaGFuZ2VUeXBlKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSwgY2hhbmdlVHlwZSlcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09IFwic2luZ2xlXCIpIHtcbiAgICAgIC8vaWYgc2luZ2xlIGp1c3Qgc2VsZWN0XG4gICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcInNpbmdsZVwiLCBmcm9tOiBkYXRlLCB0bzogZGF0ZX0sXCJzZWxlY3RcIik7XG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJpbnRlcnZhbFwiKSB7XG4gICAgICAvL2lmIGludGVydmFsIGRlY2lkZSBvbiBtb2RlXG4gICAgICBpZiAoIXRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xuICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IGRhdGUsIHRvOiBudWxsLCBmaW5hbDogZmFsc2V9LFwic2VsZWN0UGFydGlhbFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMucHJvcHMudmFsdWUudG8pIHtcbiAgICAgICAgLy9pZiBpcyBiZWZvcmUsIGp1c3QgcHV0IHN0YXJ0IGRhdGUgYWdhaW5cbiAgICAgICAgaWYgKGRhdGUgPCB0aGlzLnByb3BzLnZhbHVlLmZyb20pIHtcbiAgICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IGRhdGUsIHRvOiBudWxsLCBmaW5hbDogZmFsc2V9LFwic2VsZWN0UGFydGlhbFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IG1vbWVudC51dGModGhpcy5wcm9wcy52YWx1ZS5mcm9tKSwgdG86IGRhdGV9LFwic2VsZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIGkgaGF2ZSBjaG9zZW4gYm90aCBpIHN0YXJ0IHRvIHBpY2sgbmV3IG9uZVxuICAgICAgICB0aGlzLnNldFZhbHVlKHttb2RlOiBcImludGVydmFsXCIsIGZyb206IGRhdGUsIHRvOiBudWxsLCBmaW5hbDogZmFsc2V9LFwic2VsZWN0UGFydGlhbFwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgaXNTZWxlY3RlZDogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMudmFsdWUuZnJvbSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgICAgcmV0dXJuIGRhdGUuZm9ybWF0KFwiWVlZWU1NRERcIikgPT0gbW9tZW50LnV0Yyh0aGlzLnByb3BzLnZhbHVlLmZyb20pLmZvcm1hdChcIllZWVlNTUREXCIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5zZWxlY3Rpb25Nb2RlID09IFwiaW50ZXJ2YWxcIikge1xuICAgICAgaWYgKHRoaXMucHJvcHMudmFsdWUudG8pIHtcbiAgICAgICAgcmV0dXJuIGRhdGUgPj0gdGhpcy5wcm9wcy52YWx1ZS5mcm9tICYmIGRhdGUgPD0gdGhpcy5wcm9wcy52YWx1ZS50bztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpID09IG1vbWVudC51dGModGhpcy5wcm9wcy52YWx1ZS5mcm9tKS5mb3JtYXQoXCJZWVlZTU1ERFwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgaXNPdmVyOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5kYXRlT3Zlcikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGlvbk1vZGUgPT0gXCJpbnRlcnZhbFwiKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy52YWx1ZS5mcm9tICYmICF0aGlzLnByb3BzLnZhbHVlLnRvKSB7XG4gICAgICAgIHJldHVybiBkYXRlID49IHRoaXMucHJvcHMudmFsdWUuZnJvbSAmJiBkYXRlIDw9IHRoaXMuc3RhdGUuZGF0ZU92ZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5kYXRlT3Zlci5mb3JtYXQoXCJZWVlZTU1ERFwiKSA9PSBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5kYXRlT3Zlci5mb3JtYXQoXCJZWVlZTU1ERFwiKSA9PSBkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpO1xuICAgIH1cbiAgfSxcblxuICBnZXREYXk6IGZ1bmN0aW9uIChkYXRlLCBvdGhlck1vbnRoKSB7XG4gICAgdmFyIG90aGVyID0gZmFsc2U7XG4gICAgdmFyIGRpc2FibGVkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMucHJvcHMubWluVmFsdWUgJiYgZGF0ZS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA8PSB0aGlzLnByb3BzLm1pblZhbHVlLmZvcm1hdChcIllZWVlNTUREXCIpKSB7XG4gICAgICBvdGhlciA9IHRydWU7XG4gICAgfVxuICAgIGlmIChkYXRlLmZvcm1hdChcIllZWVlNTUREXCIpIDw9IG1vbWVudCgpLmZvcm1hdChcIllZWVlNTUREXCIpKSB7XG4gICAgICBkaXNhYmxlZCA9IHRydWU7IC8vVE9ETyBzaG91bGQgYmUgcHJvYmFibHkgZGVmaW5lZCBzb21ld2hlcmUgbW9yZSBvdXRzaWRlXG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRGF5LCB7XG4gICAgICAgIGtleTogZGF0ZS52YWx1ZU9mKCksIFxuICAgICAgICBkYXRlOiBkYXRlLCBcbiAgICAgICAgb3RoZXJNb250aDogb3RoZXJNb250aCwgXG4gICAgICAgIG9uT3ZlcjogdGhpcy5vbk92ZXIsIFxuICAgICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdCwgXG4gICAgICAgIHNlbGVjdGVkOiB0aGlzLmlzU2VsZWN0ZWQoZGF0ZSksIFxuICAgICAgICBvdmVyOiB0aGlzLmlzT3ZlcihkYXRlKSwgXG4gICAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCwgXG4gICAgICAgIG90aGVyOiBvdGhlcn1cbiAgICAgICAgKVxuICAgICk7XG4gIH0sXG4gIHJlbmRlclByZXY6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS52aWV3RGF0ZS5zdWJ0cmFjdCgxLCAnbW9udGhzJykuZm9ybWF0KFwiWVlZWU1NXCIpIDwgbW9tZW50LnV0YygpLmZvcm1hdChcIllZWVlNTVwiKSlcbiAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcInByZXYgZGlzYWJsZWRcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJwcmV2XCIsIG9uQ2xpY2s6IHRoaXMucHJldn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpKTtcbiAgfSxcbiAgcmVuZGVyTmV4dDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLnZpZXdEYXRlLmFkZCgxLCAnbW9udGhzJykuZm9ybWF0KFwiWVlZWU1NXCIpID4gbW9tZW50LnV0YygpLmFkZCg2LCdtb250aHMnKS5mb3JtYXQoXCJZWVlZTU1cIikpXG4gICAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJuZXh0IGRpc2FibGVkXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibmV4dFwiLCBvbkNsaWNrOiB0aGlzLm5leHR9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgY2FsZW5kYXJEYXRlcyA9IFtdO1xuICAgIHZhciBpbml0aWFsRGF0ZSA9IG1vbWVudC51dGModGhpcy5zdGF0ZS52aWV3RGF0ZSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnByb3BzLmNhbGVuZGFyc051bWJlcjsgKytpKSB7XG4gICAgICBjYWxlbmRhckRhdGVzLnB1c2goIG1vbWVudC51dGMoaW5pdGlhbERhdGUpICk7XG4gICAgICBpbml0aWFsRGF0ZS5hZGQoMSxcIm1vbnRoXCIpXG4gICAgfVxuICAgIHZhciBqID0gMDtcbiAgICB2YXIgY2FsZW5kYXJzID0gY2FsZW5kYXJEYXRlcy5tYXAoZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgIGorKztcbiAgICAgIHJldHVybiAoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2tleTogZGF0ZS52YWx1ZU9mKCksIGNsYXNzTmFtZTogJ2NhbGVuZGFyLXZpZXcgY2FsZW5kYXItdmlldy0nK2p9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyLCB7ZGF0ZTogZGF0ZSwgZ2V0RGF5OiBzZWxmLmdldERheSwgd2Vla09mZnNldDogRGF0ZVRvb2xzLmZpcnN0RGF5T2ZXZWVrKCl9KVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0pO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFxuICAgICAgICAgdGhpcy5yZW5kZXJQcmV2KCksIFxuICAgICAgICBjYWxlbmRhcnMsIFxuICAgICAgICAgdGhpcy5yZW5kZXJOZXh0KCksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcbiAgICAgIClcbiAgICApXG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGVuZGFyRnJhbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi8uLi8uLi9jb250YWluZXJzL1NlYXJjaERhdGUuanN4Jyk7XG52YXIgTW9kYWxNZW51TWl4aW4gPSByZXF1aXJlKCcuLy4uLy4uL01vZGFsTWVudU1peGluLmpzeCcpO1xudmFyIENhbGVuZGFyRnJhbWUgPSByZXF1aXJlKCcuL0NhbGVuZGFyRnJhbWUuanN4Jyk7XG52YXIgTW9udGhNYXRyaXggPSByZXF1aXJlKFwiLi9Nb250aE1hdHJpeC5qc3hcIik7XG52YXIgU2xpZGVyID0gcmVxdWlyZSgnLi9TbGlkZXIuanMnKTtcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vLi4vdHIuanMnKTtcbnZhciBpc0lFID0gcmVxdWlyZSgnLi8uLi8uLi90b29scy9pc0lFLmpzJyk7XG5cblxuUmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xuXG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xuXG52YXIgSGFuZGxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIkhhbmRsZVwiLFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiaGFuZGxlXCJ9LCBcbiAgICAgICAgdGhpcy5wcm9wcy5zbGlkZXJWYWx1ZVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuXG52YXIgRGF0ZVBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJEYXRlUGlja2VyXCIsXG4gIG1peGluczogW01vZGFsTWVudU1peGluXSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUgPyB0aGlzLnByb3BzLnZhbHVlIDogbmV3IFNlYXJjaERhdGUoKSxcbiAgICAgIHZpZXdNb2RlOiB0aGlzLnByb3BzLnZhbHVlID8gdGhpcy5wcm9wcy52YWx1ZS5tb2RlIDogXCJzaW5nbGVcIlxuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICBkZWZhdWx0TW9kZTogXCJzaW5nbGVcIixcbiAgICAgIGxhbmc6ICdlbicsXG4gICAgICBtaW5WYWx1ZTogbnVsbFxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1vZGUgPSB0aGlzLnN0YXRlLnZpZXdNb2RlO1xuICAgIHRoaXMucHJvcHMub25TaXplQ2hhbmdlKHRoaXMucHJvcHMuc2l6ZXNbbW9kZV0pO1xuICB9LFxuICBnZXRNb2RlTGFiZWw6IGZ1bmN0aW9uIChtb2RlKSB7XG4gICAgdmFyIG1vZGVMYWJlbHMgPSB7XG4gICAgICBzaW5nbGU6IHRyKFwiU3BlY2lmaWNcIixcInNwZWNpZmljXCIpLFxuICAgICAgaW50ZXJ2YWw6IHRyKFwiSW50ZXJ2YWxcIixcImludGVydmFsXCIpLFxuICAgICAgbW9udGg6IHRyKFwiTW9udGhzXCIsXCJtb250aHNcIiksXG4gICAgICB0aW1lVG9TdGF5OiB0cihcIlRpbWUgdG8gc3RheVwiLFwidGltZV90b19zdGF5XCIpLFxuICAgICAgYW55dGltZTogdHIoXCJBbnl0aW1lXCIsXCJhbnl0aW1lXCIpLFxuICAgICAgbm9SZXR1cm46IHRyKFwiTm8gcmV0dXJuXCIsXCJub19yZXR1cm5cIilcbiAgICB9O1xuICAgIHJldHVybiBtb2RlTGFiZWxzW21vZGVdO1xuICB9LFxuXG4gIHN3aXRjaE1vZGVUbzogZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG5ld1ZhbHVlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFwidGltZVRvU3RheVwiOlxuICAgICAgICAgIHNlbGYuY2hhbmdlVmFsdWUoc2VsZi5nZXRWYWx1ZSgpLmVkaXQoe21vZGU6IG1vZGV9KSwgXCJyZWxlYXNlXCIpOyAvLyBzaG91bGQgYnkgc29tZXRoaW5nIGxpa2UgY2hhbmdlIG1vZGUsIGJ1dCBpdCBmaW5pc2hlcyB2YWx1ZSBvbmx5IGFmdGVyIHJlbGVhc2Ugc28gVE9ETyBtYWtlIGl0IHNtYXJ0ZXJcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiYW55dGltZVwiOlxuICAgICAgICBjYXNlIFwibm9SZXR1cm5cIjpcbiAgICAgICAgICBzZWxmLmNoYW5nZVZhbHVlKHNlbGYuZ2V0VmFsdWUoKS5lZGl0KHttb2RlOiBtb2RlfSksIFwic2VsZWN0XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuXG4gICAgICBzZWxmLnByb3BzLm9uU2l6ZUNoYW5nZShzZWxmLnByb3BzLnNpemVzW21vZGVdKTtcbiAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICB2aWV3TW9kZTogbW9kZVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsY2hhbmdlVHlwZSkge1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKS5lZGl0KHZhbHVlKTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlLGNoYW5nZVR5cGUpO1xuICB9LFxuXG4gIGdldFZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudmFsdWU7XG4gIH0sXG5cbiAgc2V0TW9udGg6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh7XG4gICAgICBtb2RlOiBcIm1vbnRoXCIsXG4gICAgICBmcm9tOiBtb21lbnQudXRjKGRhdGUpLnN0YXJ0T2YoJ21vbnRoJyksXG4gICAgICB0bzogbW9tZW50LnV0YyhkYXRlKS5lbmRPZignbW9udGgnKVxuICAgIH0sXCJzZWxlY3RcIik7XG4gIH0sXG5cbiAgY2hhbmdlTWluU3RheURheXM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA+IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZVZhbHVlKHtcbiAgICAgIG1vZGU6IFwidGltZVRvU3RheVwiLFxuICAgICAgbWluU3RheURheXM6IHZhbHVlLFxuICAgICAgbWF4U3RheURheXM6IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5c1xuICAgIH0sIFwiZHJhZ2dlZFwiKTtcbiAgfSxcblxuICBjaGFuZ2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlIDwgdGhpcy5nZXRWYWx1ZSgpLm1pblN0YXlEYXlzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY2hhbmdlVmFsdWUoe1xuICAgICAgbW9kZTogXCJ0aW1lVG9TdGF5XCIsXG4gICAgICBtaW5TdGF5RGF5czogdGhpcy5nZXRWYWx1ZSgpLm1pblN0YXlEYXlzLFxuICAgICAgbWF4U3RheURheXM6IHZhbHVlXG4gICAgfSwgXCJkcmFnZ2VkXCIpO1xuICB9LFxuXG4gIHJlbGVhc2VNaW5TdGF5RGF5czogZnVuY3Rpb24gKCkge1xuICAgIC8vIGRvIG5vdCBjaGFuZ2UgdmFsdWUsIGJ1dCB0cmlnZ2VyIGl0IHdpdGggZGlmZmVyZW50IGNoYW5nZSB0eXBlXG4gICAgdGhpcy5jaGFuZ2VWYWx1ZShudWxsLCBcInJlbGVhc2VcIik7XG4gIH0sXG4gIHJlbGVhc2VNYXhTdGF5RGF5czogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hhbmdlVmFsdWUobnVsbCwgXCJyZWxlYXNlXCIpO1xuICB9LFxuXG4gIGNvbmZpcm1UaW1lVG9TdGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jaGFuZ2VWYWx1ZSh0aGlzLnByb3BzLnZhbHVlLCBcInNlbGVjdFwiKTtcbiAgfSxcblxuXG4gIHJlbmRlclNpbmdsZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRnJhbWUsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgbWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIHNlbGVjdGlvbk1vZGU6IFwic2luZ2xlXCIsIGNhbGVuZGFyc051bWJlcjogMX0pXG4gICAgKVxuICB9LFxuICByZW5kZXJJbnRlcnZhbDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRnJhbWUsIHtvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKSwgbWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIHNlbGVjdGlvbk1vZGU6IFwiaW50ZXJ2YWxcIiwgY2FsZW5kYXJzTnVtYmVyOiAzfSlcbiAgICApXG4gIH0sXG4gIHJlbmRlck1vbnRoOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KE1vbnRoTWF0cml4LCB7bWluVmFsdWU6IHRoaXMucHJvcHMubWluVmFsdWUsIG9uU2V0OiB0aGlzLnNldE1vbnRoLCB0b3RhbE1vbnRoczogXCI2XCJ9KSk7XG4gIH0sXG4gIHJlbmRlclRpbWVUb1N0YXk6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGVhZGxpbmUgPSB0cihcIlN0YXkgdGltZSBmcm9tICVzIHRvICVzIGRheXMuXCIsIFwic3RheV90aW1lX2Zyb21cIiwgW3RoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cywgdGhpcy5nZXRWYWx1ZSgpLm1heFN0YXlEYXlzXSApO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwidGltZS10by1zdGF5XCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnQtaGVhZGxpbmVcIn0sIGhlYWRsaW5lKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5taW5TdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNaW5TdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWluU3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWluIGhvcml6b250YWwtc2xpZGVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZSwgbnVsbClcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoU2xpZGVyLCB7c3RlcDogMSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAzMSwgdmFsdWU6IHRoaXMuZ2V0VmFsdWUoKS5tYXhTdGF5RGF5cywgb25SZWxlYXNlOiB0aGlzLnJlbGVhc2VNYXhTdGF5RGF5cywgb25DaGFuZ2U6IHRoaXMuY2hhbmdlTWF4U3RheURheXMsIGNsYXNzTmFtZTogXCJzbGlkZXIgc2xpZGVyTWF4IGhvcml6b250YWwtc2xpZGVyXCJ9LCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhhbmRsZSwgbnVsbClcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzbGlkZXItYXhlXCJ9KSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb25maXJtLXRpbWUtdG8tc3RheS1idXR0b25cIiwgb25DbGljazogdGhpcy5jb25maXJtVGltZVRvU3RheX0sIFwiT0tcIilcbiAgICAgIClcbiAgICApO1xuICB9LFxuICByZW5kZXJBbnl0aW1lOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfSxcbiAgcmVuZGVyTm9SZXR1cm46IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIlwiO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiAnc2VhcmNoLWRhdGUtcGlja2VyIHNlYXJjaC1waWNrZXIgJyttb2RlfSwgXG4gICAgICAgICB0aGlzLnJlbmRlck1lbnUoKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb250ZW50XCJ9LCBcbiAgICAgICAgICAgdGhpcy5yZW5kZXJCb2R5KCkgXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG52YXIgVHJhbiA9IHJlcXVpcmUoJy4vLi4vLi4vVHJhbi5qc3gnKTtcblxudmFyIE1vbnRoTWF0cml4ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIk1vbnRoTWF0cml4XCIsXG5cbiAgc2V0TW9udGg6IGZ1bmN0aW9uIChtb250aCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5wcm9wcy5vblNldChtb250aCk7XG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbW9udGhzID0gW107XG4gICAgdmFyIGlNb250aCA9IG1vbWVudC51dGMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnNlSW50KHNlbGYucHJvcHMudG90YWxNb250aHMsMTApOyBpKyspIHtcbiAgICAgIG1vbnRocy5wdXNoKCBtb21lbnQudXRjKGlNb250aCkgKTtcbiAgICAgIGlNb250aC5hZGQoMSwgXCJtb250aHNcIik7XG4gICAgfVxuICAgIHZhciBtb250aHNFbGVtZW50cyA9IG1vbnRocy5tYXAoZnVuY3Rpb24gKG1vbnRoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IG1vbnRoLnZhbHVlT2YoKSwgY2xhc3NOYW1lOiBcIm1vbnRoLW9wdGlvblwiLCBvbkNsaWNrOiBzZWxmLnNldE1vbnRoKG1vbnRoKX0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwibW9udGgtbmFtZVwifSwgXG4gICAgICAgICAgICAgbW9udGguZm9ybWF0KFwiTU1NTVwiKSBcbiAgICAgICAgICApLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnJcIiwgbnVsbCksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwibW9udGgteWVhclwifSwgXG4gICAgICAgICAgICAgbW9udGguZm9ybWF0KFwiWVlZWVwiKSBcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKCAvL29uTW91c2VMZWF2ZT17IHRoaXMucHJvcHMub25MZWF2ZSB9XG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9udGgtbWF0cml4XCJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNvbnRlbnQtaGVhZGxpbmVcIn0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVHJhbiwge3RLZXk6IFwic2VsZWN0X21vbnRoXCJ9LCBcIlNlbGVjdCBtb250aFwiKSksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9udGhzXCJ9LCBcbiAgICAgICAgICBtb250aHNFbGVtZW50c1xuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9udGhNYXRyaXg7XG4iLCJcInVzZSBzdHJpY3RcIjtcbihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XHJcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKFsncmVhY3QnXSwgZmFjdG9yeSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIC8vVE9ETyBnZXQgaXQgYmFjayB3aGVuIHJlcXVpcmUgZnJvbSBhbm90aGVyIGJ1bmRsZSB3aWxsIHdvcmtcclxuICAgIC8vbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoJ3JlYWN0JykpO1xyXG4gICAgbW9kdWxlLmV4cG9ydHM9ZmFjdG9yeSh3aW5kb3cuUmVhY3QpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByb290LlJlYWN0U2xpZGVyID0gZmFjdG9yeShyb290LlJlYWN0KTtcclxuICB9XHJcbn0odGhpcywgZnVuY3Rpb24oUmVhY3QpIHtcclxuXHJcbiAgdmFyIFJlYWN0U2xpZGVyID0gUmVhY3QuY3JlYXRlQ2xhc3MoeyBkaXNwbGF5TmFtZTogJ1JlYWN0U2xpZGVyJyxcclxuXHJcbiAgICBwcm9wVHlwZXM6IHtcclxuICAgICAgbWluVmFsdWU6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXHJcbiAgICAgIG1heFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBzdGVwOiBSZWFjdC5Qcm9wVHlwZXMubnVtYmVyLFxyXG4gICAgICBvcmllbnRhdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mKFsnaG9yaXpvbnRhbCcsICd2ZXJ0aWNhbCddKSxcclxuICAgICAgb25DaGFuZ2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICBvblJlbGVhc2U6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxyXG4gICAgICB2YWx1ZVByb3BOYW1lOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXHJcbiAgICB9LFxyXG5cclxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgbWluVmFsdWU6IDAsXHJcbiAgICAgICAgbWF4VmFsdWU6IDEwMCxcclxuICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICBzdGVwOiAxLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgICAgdmFsdWVQcm9wTmFtZTogJ3NsaWRlclZhbHVlJ1xyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgIG1vdW50ZWQ6IHRydWVcclxuICAgICAgfSlcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBtb3VudGVkOiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRQb3NpdGlvbnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKCF0aGlzLnN0YXRlLm1vdW50ZWQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgdXBwZXJCb3VuZDogMCxcclxuICAgICAgICAgIGhhbmRsZVdpZHRoOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWluOiAwLFxyXG4gICAgICAgICAgc2xpZGVyTWF4OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgc2xpZGVyID0gdGhpcy5yZWZzLnNsaWRlci5nZXRET01Ob2RlKCk7XHJcbiAgICAgIHZhciBoYW5kbGUgPSB0aGlzLnJlZnMuaGFuZGxlLmdldERPTU5vZGUoKTtcclxuICAgICAgdmFyIHJlY3QgPSBzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICB2YXIgc2l6ZSA9IHtcclxuICAgICAgICBob3Jpem9udGFsOiAnY2xpZW50V2lkdGgnLFxyXG4gICAgICAgIHZlcnRpY2FsOiAnY2xpZW50SGVpZ2h0J1xyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG5cclxuICAgICAgdmFyIHBvc2l0aW9uID0ge1xyXG4gICAgICAgIGhvcml6b250YWw6IHsgbWluOiAnbGVmdCcsIG1heDogJ3JpZ2h0JyB9LFxyXG4gICAgICAgIHZlcnRpY2FsOiB7IG1pbjogJ3RvcCcsIG1heDogJ2JvdHRvbScgfVxyXG4gICAgICB9W3RoaXMucHJvcHMub3JpZW50YXRpb25dO1xyXG4gICAgICB2YXIgdXBwZXJCb3VuZCA9IHNsaWRlcltzaXplXSAtIGhhbmRsZVtzaXplXTtcclxuXHJcbiAgICAgIHRoaXMuY2FjaGVkUG9zaXRpb25zID0ge1xyXG4gICAgICAgIHVwcGVyQm91bmQ6IHVwcGVyQm91bmQsXHJcbiAgICAgICAgaGFuZGxlV2lkdGg6IGhhbmRsZVtzaXplXSxcclxuICAgICAgICBzbGlkZXJNaW46IHJlY3RbcG9zaXRpb24ubWluXSxcclxuICAgICAgICBzbGlkZXJNYXg6IHJlY3RbcG9zaXRpb24ubWF4XSAtIGhhbmRsZVtzaXplXVxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gdGhpcy5jYWNoZWRQb3NpdGlvbnM7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE9mZnNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgcmF0aW8gPSAodGhpcy5wcm9wcy52YWx1ZSAtIHRoaXMucHJvcHMubWluVmFsdWUpIC8gKHRoaXMucHJvcHMubWF4VmFsdWUgLSB0aGlzLnByb3BzLm1pblZhbHVlKTtcclxuICAgICAgcmV0dXJuIHJhdGlvICogdGhpcy5nZXRQb3NpdGlvbnMoKS51cHBlckJvdW5kO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgaGFuZGxlU3R5bGUgPSB7XHJcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlJyArIHRoaXMuX2F4aXMoKSArICcoJyArIHRoaXMuZ2V0T2Zmc2V0KCkgKyAncHgpJyxcclxuICAgICAgICAvLyBsZXQgdGhpcyBlbGVtZW50IGJlIHRoZSBzYW1lIHNpemUgYXMgaXRzIGNoaWxkcmVuLlxyXG4gICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB2YXIgdXNlckhhbmRsZSA9IHRoaXMucHJvcHMuY2hpbGRyZW47XHJcbiAgICAgIHVzZXJIYW5kbGUucHJvcHNbdGhpcy5wcm9wcy52YWx1ZVByb3BOYW1lXSA9IHRoaXMucHJvcHMudmFsdWU7XHJcblxyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIFJlYWN0LkRPTS5kaXYoeyByZWY6ICdzbGlkZXInLCBjbGFzc05hbWU6IHRoaXMucHJvcHMuY2xhc3NOYW1lLCBvbkNsaWNrOiB0aGlzLl9vbkNsaWNrIH0sXHJcbiAgICAgICAgICBSZWFjdC5ET00uZGl2KHsgcmVmOiAnaGFuZGxlJywgc3R5bGU6IGhhbmRsZVN0eWxlLCBvbk1vdXNlRG93bjogdGhpcy5fZHJhZ1N0YXJ0LCBvblRvdWNoTW92ZTogdGhpcy5fdG91Y2hNb3ZlIH0sXHJcbiAgICAgICAgICAgIHVzZXJIYW5kbGVcclxuICAgICAgICAgICkpKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uQ2xpY2s6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdmFyIHBvc2l0aW9uID0gZVsncGFnZScgKyB0aGlzLl9heGlzKCldO1xyXG4gICAgICB0aGlzLl9tb3ZlSGFuZGxlKHBvc2l0aW9uKTtcclxuICAgIH0sXHJcblxyXG4gICAgX2RyYWdTdGFydDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2RyYWdNb3ZlLCBmYWxzZSk7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9kcmFnRW5kLCBmYWxzZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9kcmFnTW92ZTogZnVuY3Rpb24oZSkge1xyXG4gICAgICB2YXIgcG9zaXRpb24gPSBlWydwYWdlJyArIHRoaXMuX2F4aXMoKV07XHJcbiAgICAgIHRoaXMuX21vdmVIYW5kbGUocG9zaXRpb24pO1xyXG4gICAgfSxcclxuXHJcbiAgICBfZHJhZ0VuZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX2RyYWdNb3ZlLCBmYWxzZSk7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9kcmFnRW5kLCBmYWxzZSk7XHJcbiAgICAgIHRoaXMucHJvcHMub25SZWxlYXNlKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIF90b3VjaE1vdmU6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdmFyIGxhc3QgPSBlLmNoYW5nZWRUb3VjaGVzW2UuY2hhbmdlZFRvdWNoZXMubGVuZ3RoIC0gMV07XHJcbiAgICAgIHZhciBwb3NpdGlvbiA9IGxhc3RbJ3BhZ2UnICsgdGhpcy5fYXhpcygpXTtcclxuICAgICAgdGhpcy5fbW92ZUhhbmRsZShwb3NpdGlvbik7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgX21vdmVIYW5kbGU6IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XHJcblxyXG4gICAgICAvLyBtYWtlIGNlbnRlciBvZiBoYW5kbGUgYXBwZWFyIHVuZGVyIHRoZSBjdXJzb3IgcG9zaXRpb25cclxuICAgICAgdmFyIHBvc2l0aW9ucyA9IHRoaXMuZ2V0UG9zaXRpb25zKCk7XHJcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gLSAocG9zaXRpb25zLmhhbmRsZVdpZHRoIC8gMik7XHJcblxyXG4gICAgICB2YXIgbGFzdFZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTtcclxuXHJcbiAgICAgIHZhciByYXRpbyA9IChwb3NpdGlvbiAtIHBvc2l0aW9ucy5zbGlkZXJNaW4pIC8gKHBvc2l0aW9ucy5zbGlkZXJNYXggLSBwb3NpdGlvbnMuc2xpZGVyTWluKTtcclxuICAgICAgdmFyIHZhbHVlID0gcmF0aW8gKiAodGhpcy5wcm9wcy5tYXhWYWx1ZSAtIHRoaXMucHJvcHMubWluVmFsdWUpICsgdGhpcy5wcm9wcy5taW5WYWx1ZTtcclxuXHJcbiAgICAgIHZhciBuZXh0VmFsdWUgPSB0aGlzLl90cmltQWxpZ25WYWx1ZSh2YWx1ZSk7XHJcblxyXG4gICAgICB2YXIgY2hhbmdlZCA9IG5leHRWYWx1ZSAhPT0gbGFzdFZhbHVlO1xyXG5cclxuICAgICAgaWYgKGNoYW5nZWQgJiYgdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xyXG4gICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV4dFZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfYXhpczogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgJ2hvcml6b250YWwnOiAnWCcsXHJcbiAgICAgICAgJ3ZlcnRpY2FsJzogJ1knXHJcbiAgICAgIH1bdGhpcy5wcm9wcy5vcmllbnRhdGlvbl07XHJcbiAgICB9LFxyXG5cclxuICAgIF90cmltQWxpZ25WYWx1ZTogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgIGlmICh2YWwgPD0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgdmFsID0gdGhpcy5wcm9wcy5taW5WYWx1ZTtcclxuICAgICAgaWYgKHZhbCA+PSB0aGlzLnByb3BzLm1heFZhbHVlKSB2YWwgPSB0aGlzLnByb3BzLm1heFZhbHVlO1xyXG5cclxuICAgICAgdmFyIHZhbE1vZFN0ZXAgPSAodmFsIC0gdGhpcy5wcm9wcy5taW5WYWx1ZSkgJSB0aGlzLnByb3BzLnN0ZXA7XHJcbiAgICAgIHZhciBhbGlnblZhbHVlID0gdmFsIC0gdmFsTW9kU3RlcDtcclxuXHJcbiAgICAgIGlmIChNYXRoLmFicyh2YWxNb2RTdGVwKSAqIDIgPj0gdGhpcy5wcm9wcy5zdGVwKSB7XHJcbiAgICAgICAgYWxpZ25WYWx1ZSArPSAodmFsTW9kU3RlcCA+IDApID8gdGhpcy5wcm9wcy5zdGVwIDogKC0gdGhpcy5wcm9wcy5zdGVwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoYWxpZ25WYWx1ZS50b0ZpeGVkKDUpKTtcclxuICAgIH1cclxuXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBSZWFjdFNsaWRlcjtcclxuXHJcbn0pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuICBUb29scyBmb3IgbWFuaXB1bGF0aW5nIHdpdGggZGF0ZXNcbiAgc29tZSBvZiB0aGVtIGFyZSBkdXBsaWNpdGllcyB0byBtb21lbnQncyBmdW5jdGlvbnMsIGJ1dCB0aGV5IGNhbiBiZSB1c2VkIGFzIGZhc3RlciBhbHRlcm5hdGl2ZXNcbiAqL1xuXG5cbnZhciBwYWQgPSBmdW5jdGlvbihudW0sIHNpemUpIHtcbiAgdmFyIHMgPSBudW0gKyBcIlwiO1xuICB3aGlsZSAocy5sZW5ndGggPCBzaXplKSB7XG4gICAgcyA9IFwiMFwiICsgcztcbiAgfVxuICByZXR1cm4gcztcbn07XG5cbnZhciBEYXRlVG9vbHMgPSB7XG4gIHRvZGF5OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbiAgfSxcbiAgaW5IYWxmQW5ZZWFyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLnNldE1vbnRoKG5ldyBEYXRlKCkuZ2V0TW9udGgoKSArIDYpKTtcbiAgfSxcbiAgZmlyc3REYXk6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIDEpO1xuICB9LFxuICBsYXN0RGF5OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpICsgMSwgMCk7XG4gIH0sXG4gIGZvcm1hdFNQQXBpRGF0ZTogZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBwYWQoZGF0ZS5nZXREYXRlKCksIDIpICsgXCIvXCIgKyBwYWQoZGF0ZS5nZXRNb250aCgpICsgMSwgMikgKyBcIi9cIiArIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgfSxcbiAgZm9ybWF0V0FEYXRlOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIFwiLVwiICsgcGFkKGRhdGUuZ2V0TW9udGgoKSArIDEsIDIpICsgXCItXCIgKyBwYWQoZGF0ZS5nZXREYXRlKCksIDIpO1xuICB9XG59O1xuXG5cbkRhdGVUb29scy5maXJzdERheU9mV2VlayA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbW9tZW50LmxvY2FsZURhdGEoKS5fd2Vlay5kb3c7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVUb29scztcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIExhdExvbiA9IHJlcXVpcmUoJy4vdG9vbHMvbGF0bG9uLmpzJyk7XG5cbnZhciBvcHRpb25zID0ge1xuICBlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlLFxuICB0aW1lb3V0OiA1MDAwLFxuICBtYXhpbXVtQWdlOiAwXG59O1xuXG5mdW5jdGlvbiBHZW9sb2NhdGlvbigpe1widXNlIHN0cmljdFwiO31cblxuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUuaW5pdEJyb3dzZXI9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgLy9UT0RPIGZpbmlzaFxuICAgIC8vbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zKSB7XG4gICAgLy8gIHZhciBjcmQgPSBwb3MuY29vcmRzO1xuICAgIC8vICBjb25zb2xlLmxvZygnWW91ciBjdXJyZW50IHBvc2l0aW9uIGlzOicpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTGF0aXR1ZGUgOiAnICsgY3JkLmxhdGl0dWRlKTtcbiAgICAvLyAgY29uc29sZS5sb2coJ0xvbmdpdHVkZTogJyArIGNyZC5sb25naXR1ZGUpO1xuICAgIC8vICBjb25zb2xlLmxvZygnTW9yZSBvciBsZXNzICcgKyBjcmQuYWNjdXJhY3kgKyAnIG1ldGVycy4nKTtcbiAgICAvL1xuICAgIC8vfSwgZnVuY3Rpb24gKCkge1xuICAgIC8vICBjb25zb2xlLndhcm4oJ0VSUk9SKCcgKyBlcnIuY29kZSArICcpOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgIC8vfSwgb3B0aW9ucylcbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21NYXA9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG5cbiAgfTtcbiAgR2VvbG9jYXRpb24ucHJvdG90eXBlLmdldEZyb21Ccm93c2VyPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuXG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRGcm9tQ29kZT1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcblxuICB9O1xuICBHZW9sb2NhdGlvbi5wcm90b3R5cGUucG9pbnRUb0JvdW5kcz1mdW5jdGlvbihsYXQsIGxvbikge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBkaXN0YW5jZSA9IDMwMDtcbiAgICB2YXIgbGwgPSBMYXRMb24obGF0LGxvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxhdF9sbzogbGwuZGVzdGluYXRpb25Qb2ludCgxODAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfbG86IGxsLmRlc3RpbmF0aW9uUG9pbnQoLTkwLCBkaXN0YW5jZSkubG9uLFxuICAgICAgbGF0X2hpOiBsbC5kZXN0aW5hdGlvblBvaW50KDAsIGRpc3RhbmNlKS5sYXQsXG4gICAgICBsbmdfaGk6IGxsLmRlc3RpbmF0aW9uUG9pbnQoOTAsIGRpc3RhbmNlKS5sb25cbiAgICB9XG4gIH07XG4gIEdlb2xvY2F0aW9uLnByb3RvdHlwZS5nZXRDdXJyZW50Qm91bmRzPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnBvaW50VG9Cb3VuZHMoNTAsMTUpO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEdlb2xvY2F0aW9uKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBNb2RhbE1lbnVNaXhpbiA9IHtcblxuICByZW5kZXJCb2R5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kZSA9IHRoaXMuc3RhdGUudmlld01vZGU7XG4gICAgaWYgKCFtb2RlICkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHZhciBtZXRob2ROYW1lID0gXCJyZW5kZXJcIittb2RlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbW9kZS5zbGljZSgxKTtcbiAgICBpZiAodGhpc1ttZXRob2ROYW1lXSkge1xuICAgICAgcmV0dXJuIHRoaXNbbWV0aG9kTmFtZV0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm8gc3VjaCBtZXRob2Q6IFwiICsgbWV0aG9kTmFtZSlcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyTWVudTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2RlID0gdGhpcy5zdGF0ZS52aWV3TW9kZTtcbiAgICB2YXIgbW9kZU9wdGlvbnMgPSBbXTtcbiAgICBmb3IgKHZhciBpbW9kZSBpbiB0aGlzLnByb3BzLm1vZGVzKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5tb2Rlc1tpbW9kZV0pIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IFwibW9kZS1cIitpbW9kZTtcbiAgICAgICAgaWYgKG1vZGUgPT0gaW1vZGUpIHtcbiAgICAgICAgICBjbGFzc05hbWUgKz0gXCIgYWN0aXZlXCI7XG4gICAgICAgIH1cbiAgICAgICAgbW9kZU9wdGlvbnMucHVzaChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtrZXk6IGltb2RlLCBjbGFzc05hbWU6IGNsYXNzTmFtZSwgb25DbGljazogIHRoaXMuc3dpdGNoTW9kZVRvKGltb2RlKSB9LCAgdGhpcy5nZXRNb2RlTGFiZWwoaW1vZGUpICkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwibW9kZS1zZWxlY3RvclwifSwgXG4gICAgICAgICAgbW9kZU9wdGlvbnNcbiAgICAgIClcbiAgICApXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWxNZW51TWl4aW47XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgaXNJRSA9IHJlcXVpcmUoJy4vdG9vbHMvaXNJRS5qcycpO1xudmFyIG1vbWVudCA9ICh3aW5kb3cubW9tZW50KTtcbnZhciBUcmFuID0gcmVxdWlyZSgnLi9UcmFuLmpzeCcpO1xuXG5cblxudmFyIE1vZGFsUGlja2VyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIk1vZGFsUGlja2VyXCIsXG5cbiAgLy9nZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAvLyAgcmV0dXJuIHtcbiAgLy8gICAgc2hvd246IGZhbHNlXG4gIC8vICB9O1xuICAvL30sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2luZG93V2lkdGg6ICQod2luZG93KS53aWR0aCgpLFxuICAgICAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICB9O1xuICB9LFxuXG4gIGNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAodGhpcy5yZWZzLmlubmVyKSB7XG4gICAgICBpZiAoJCh0aGlzLnJlZnMuaW5uZXIuZ2V0RE9NTm9kZSgpKS5oYXMoZS50YXJnZXQpLmxlbmd0aCkgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoJCh0aGlzLnByb3BzLmlucHV0RWxlbWVudCkuaXMoZS50YXJnZXQpKSByZXR1cm47XG4gICAgaWYgKCQodGhpcy5wcm9wcy5pbnB1dEVsZW1lbnQpLmhhcyhlLnRhcmdldCkubGVuZ3RoKSByZXR1cm47XG4gICAgLy9pZiAoIXRoaXMucHJvcHMuc2hvd24pIHJldHVybjtcbiAgICB0aGlzLmhpZGUoKTtcbiAgfSxcblxuICB3aW5kb3dSZXNpemVkOiBmdW5jdGlvbiAoZSkge1xuICAgIC8vVE9ETyBjaGVjayBwZXJmb3JtYW5jZSBhbmQgZXZlbnR1YWxseSBtYWtlIHNvbWUgZGVsYXllZCByZXNpemVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpbmRvd1dpZHRoOiAkKHdpbmRvdykud2lkdGgoKSxcbiAgICAgIHdpbmRvd0hlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgfSk7XG4gIH0sXG5cbiAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25IaWRlKCk7XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5jbGlja091dHNpZGUsIGZhbHNlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy53aW5kb3dSZXNpemVkKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xpY2tPdXRzaWRlLCBmYWxzZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMud2luZG93UmVzaXplZCk7XG4gIH0sXG5cbiAgY2FsY3VsYXRlU3R5bGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGlzSUUoOCwnbHRlJykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICB2YXIgcmVjdCA9IHRoaXMucHJvcHMuaW5wdXRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdmFyIHBhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgIHZhciB3aWR0aCA9IHRoaXMucHJvcHMuY29udGVudFNpemUud2lkdGg7XG4gICAgdmFyIG9mZnNldCA9IHJlY3QubGVmdDtcbiAgICB2YXIgdG9wID0gcmVjdC5ib3R0b20gKyB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgdmFyIG1heFdpZHRoID0gcGFnZVdpZHRoO1xuICAgIHZhciBvdXRlclN0eWxlcztcbiAgICB2YXIgYWRkQ2xhc3MgPSBcIlwiO1xuXG4gICAgaWYgKHdpZHRoID4gbWF4V2lkdGgpIHtcbiAgICAgIC8vbWFrZSBzbWFsbGVyIHZlcnNpb25cbiAgICAgIGFkZENsYXNzID0gXCJjb21wYWN0LXNpemVcIjtcbiAgICAgIGlmICh0aGlzLnByb3BzLmNvbnRlbnRTaXplLndpZHRoQ29tcGFjdCkge1xuICAgICAgICB3aWR0aCA9IHRoaXMucHJvcHMuY29udGVudFNpemUud2lkdGhDb21wYWN0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvZmZzZXQgKyB3aWR0aCA8PSBtYXhXaWR0aCkge1xuICAgICAgLy9LRUVQIElUXG4gICAgICBvdXRlclN0eWxlcyA9IHtcbiAgICAgICAgbWFyZ2luTGVmdDogb2Zmc2V0LFxuICAgICAgICB3aWR0aDogd2lkdGhcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChvZmZzZXQgKyB3aWR0aCA+IG1heFdpZHRoICYmIHdpZHRoIDwgbWF4V2lkdGgpIHtcbiAgICAgIC8vTU9WRSBJVFxuICAgICAgdmFyIG1pc3NpbmdTcGFjZSA9IG9mZnNldCArIHdpZHRoIC0gbWF4V2lkdGg7XG4gICAgICBvdXRlclN0eWxlcyA9IHtcbiAgICAgICAgbWFyZ2luTGVmdDogb2Zmc2V0IC0gbWlzc2luZ1NwYWNlLFxuICAgICAgICB3aWR0aDogd2lkdGhcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dGVyU3R5bGVzID0ge1xuICAgICAgICBtYXJnaW5MZWZ0OiAwLFxuICAgICAgICB3aWR0aDogXCIxMDAlXCJcbiAgICAgIH07XG4gICAgfVxuICAgIG91dGVyU3R5bGVzLnRvcCA9IHRvcCArIFwicHhcIjtcbiAgICByZXR1cm4ge1xuICAgICAgb3V0ZXI6IG91dGVyU3R5bGVzLFxuICAgICAgYWRkQ2xhc3M6IGFkZENsYXNzXG4gICAgfTtcbiAgfSxcblxuICBjYWxjdWxhdGVPdXRlclN0eWxlczogZnVuY3Rpb24gKCkge1xuICAgIGlmIChpc0lFKDgsJ2x0ZScpKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHlsZXMgPSB0aGlzLmNhbGN1bGF0ZVN0eWxlcygpO1xuICAgIHZhciBjbGFzc05hbWUgPSBcInNlYXJjaC1tb2RhbCBcIiArIChzdHlsZXMuYWRkQ2xhc3MgPyBzdHlsZXMuYWRkQ2xhc3MgOiBcIlwiKTtcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIHN0eWxlOiBzdHlsZXMub3V0ZXJ9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImNsb3NlLWJ1dHRvblwiLCBvbmNsaWNrOiB0aGlzLmhpZGV9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW4sIHt0S2V5OiBcImNsb3NlXCJ9LCBcImNsb3NlXCIpKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJzZWFyY2gtbW9kYWwtY29udGVudFwiLCByZWY6IFwiaW5uZXJcIn0sIHRoaXMucHJvcHMuY2hpbGRyZW4pXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWxQaWNrZXI7XG5cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiogQGpzeCBSZWFjdC5ET00gKi9cblxudmFyIE1vZGFsUGlja2VyID0gcmVxdWlyZShcIi4vLi4vTW9kYWxQaWNrZXIuanN4XCIpO1xudmFyIFBsYWNlUGlja2VyID0gcmVxdWlyZShcIi4vY29tcG9uZW50cy9QbGFjZVBpY2tlci5qc3hcIik7XG52YXIgU2VhcmNoUGxhY2UgPSByZXF1aXJlKFwiLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeFwiKTtcbnZhciBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UnKTtcblxudmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICBpbml0aWFsVmFsdWU6IG5ldyBTZWFyY2hQbGFjZSgpLFxuICBsb2NhbGU6IFwiZW5cIixcbiAgc2l6ZXM6IHtcbiAgICBhbGw6IHt3aWR0aDogNjAwLCBoZWlnaHQ6IDIwMH0sXG4gICAgbmVhcmJ5OiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxuICAgIGNoZWFwZXN0OiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxuICAgIGNpdGllc0FuZEFpcnBvcnRzOiB7d2lkdGg6IDYwMCwgaGVpZ2h0OiAyMDB9LFxuICAgIGNvdW50cmllczoge3dpZHRoOiA2MDAsIGhlaWdodDogMjAwfSxcbiAgICBhbnl3aGVyZToge3dpZHRoOiAxNjksIGhlaWdodDogMjAwfSxcbiAgICByYWRpdXM6IHt3aWR0aDogMTY5LCBoZWlnaHQ6IDIwMH1cbiAgfSxcbiAgbW9kZXM6IHtcbiAgICBcImFsbFwiOiB7fSxcbiAgICBcIm5lYXJieVwiOiB7fSxcbiAgICBcImNoZWFwZXN0XCI6IHt9LFxuICAgIFwiY2l0aWVzQW5kQWlycG9ydHNcIjoge30sXG4gICAgXCJjb3VudHJpZXNcIjoge30sXG4gICAgXCJhbnl3aGVyZVwiOiB7fSxcbiAgICBcInJhZGl1c1wiOiB7fVxuICB9XG59O1xuXG52YXIgUGxhY2VQaWNrZXJNb2RhbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQbGFjZVBpY2tlck1vZGFsXCIsXG4gIGdldE9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkZWVwbWVyZ2UoZGVmYXVsdE9wdGlvbnMsdGhpcy5wcm9wcy5vcHRpb25zKTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wdGlvbnM6IHt9XG4gICAgfVxuICB9LFxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50U2l6ZToge3dpZHRoOiAxNjksIGhlaWdodDogMjAwfVxuICAgIH07XG4gIH0sXG4gIG9uVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uICh2YWx1ZSwgY2hhbmdlVHlwZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIGNoYW5nZVR5cGUpO1xuICB9LFxuICBvblNpemVDaGFuZ2U6IGZ1bmN0aW9uIChzaXplcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY29udGVudFNpemU6IHNpemVzXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBkZWVwbWVyZ2UoZGVmYXVsdE9wdGlvbnMsdGhpcy5nZXRPcHRpb25zKCkpO1xuICAgIGlmICghdGhpcy5wcm9wcy5zaG93bikge3JldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsKSl9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTW9kYWxQaWNrZXIsIHtjb250ZW50U2l6ZTogdGhpcy5zdGF0ZS5jb250ZW50U2l6ZSwgaW5wdXRFbGVtZW50OiB0aGlzLnByb3BzLmlucHV0RWxlbWVudCwgb25IaWRlOiB0aGlzLnByb3BzLm9uSGlkZX0sIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlUGlja2VyLCB7dmFsdWU6IHRoaXMucHJvcHMudmFsdWUsIHJlZjogXCJwbGFjZVBpY2tlclwiLCBvbkNoYW5nZTogdGhpcy5vblZhbHVlQ2hhbmdlLCBzaXplczogb3B0aW9ucy5zaXplcywgbW9kZXM6IG9wdGlvbnMubW9kZXMsIG9uU2l6ZUNoYW5nZTogdGhpcy5vblNpemVDaGFuZ2V9XG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIH1cblxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZVBpY2tlck1vZGFsO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qKiBAanN4IFJlYWN0LkRPTSAqL1xuXG52YXIgdGVzdFNoaXQgPSBudWxsO1xuXG52YXIgUmVhY3QgPSAod2luZG93LlJlYWN0KTtcblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKTtcbnZhciB0ciA9IHJlcXVpcmUoJy4vLi4vLi4vdHIuanMnKTtcblxudmFyIFBsYWNlcyA9IHJlcXVpcmUoJy4vUGxhY2VzLmpzeCcpO1xudmFyIE1vZGFsTWVudU1peGluID0gcmVxdWlyZSgnLi8uLi8uLi9Nb2RhbE1lbnVNaXhpbi5qc3gnKTtcbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9QbGFjZS5qc3gnKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBSYWRpdXMgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvUmFkaXVzLmpzeCcpO1xuXG52YXIgYWlycG9ydHNBbmRDaXRpZXNUeXBlcyA9IFtQbGFjZS5UWVBFX0NJVFksIFBsYWNlLlRZUEVfQUlSUE9SVF07XG52YXIgY291bnRyeVR5cGVzID0gW1BsYWNlLlRZUEVfQ09VTlRSWV07XG5cbnZhciBQbGFjZVBpY2tlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQbGFjZVBpY2tlclwiLFxuICBtaXhpbnM6IFtNb2RhbE1lbnVNaXhpbl0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdNb2RlOiB0aGlzLmdldERlZmF1bHRNb2RlKClcbiAgICB9O1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgbGFuZzogJ2VuJ1xuICAgIH07XG4gIH0sXG5cbiAgZ2V0RGVmYXVsdE1vZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAvL0ZJUlNUIFZFUlNJT04gLSBBTEwgQU5EIENPVU5UUklFU1xuXG4gICAgLy9pZiAodGhpcy5wcm9wcy52YWx1ZS5tb2RlICE9IFwidGV4dFwiIHx8IHRoaXMucHJvcHMudmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgLy8gIHJldHVybiBcImNvdW50cmllc1wiO1xuICAgIC8vfSBlbHNlIHtcbiAgICAvLyAgcmV0dXJuIFwiYWxsXCI7XG4gICAgLy99XG5cbiAgICAvL1NFQ09ORCBWRVJTSU9OXG5cbiAgICAvL2lmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgLy8gIHJldHVybiBcImFsbFwiO1xuICAgIC8vfSBlbHNlIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAvLyAgcmV0dXJuIFwiYWxsXCI7XG4gICAgLy99IGVsc2UgaWYgKHRoaXMucHJvcHMudmFsdWUubW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAvLyAgcmV0dXJuIFwiYW55d2hlcmVcIjtcbiAgICAvL30gZWxzZSBpZiAodGhpcy5wcm9wcy52YWx1ZS5tb2RlID09IFwicmFkaXVzXCIpIHtcbiAgICAvLyAgcmV0dXJuIFwicmFkaXVzXCI7XG4gICAgLy99IGVsc2Uge1xuICAgIC8vICByZXR1cm4gXCJhbGxcIjtcbiAgICAvL31cblxuICAgIC8vVEhJUkQgVkVSU0lPTlxuICAgIGNvbnNvbGUubG9nKFwiZGVmYXVsdD8/P1wiKTtcbiAgICBpZiAodGhpcy5wcm9wcy52YWx1ZS5mb3JtTW9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMudmFsdWUuZm9ybU1vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcImFsbFwiO1xuICAgIH1cblxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1vZGUgPSB0aGlzLnN0YXRlLnZpZXdNb2RlO1xuICAgIHRoaXMucHJvcHMub25TaXplQ2hhbmdlKHRoaXMucHJvcHMuc2l6ZXNbbW9kZV0pO1xuICB9LFxuXG4gIC8vVE9ETyBtb3ZlIGl0IHRvIG9wdGlvbnNcbiAgZ2V0TW9kZUxhYmVsOiBmdW5jdGlvbiAobW9kZSkge1xuICAgIHZhciBtb2RlTGFiZWxzID0ge1xuICAgICAgYWxsOiB0cihcIkFsbCBwbGFjZXNcIixcImFsbFwiKSxcbiAgICAgIG5lYXJieTogdHIoXCJOZWFyYnlcIixcIm5lYXJieVwiKSxcbiAgICAgIGNoZWFwZXN0OiB0cihcIkNoZWFwZXN0XCIsXCJjaGVhcGVzdFwiKSxcbiAgICAgIGNpdGllc0FuZEFpcnBvcnRzOiB0cihcIkNpdGllcyBhbmQgYWlycG9ydHNcIixcImNpdGllc19hbmRfYWlycG9ydHNcIiksXG4gICAgICBjb3VudHJpZXM6IHRyKFwiQ291bnRyaWVzXCIsXCJjb3VudHJpZXNcIiksXG4gICAgICBhbnl3aGVyZTogdHIoXCJBbnl3aGVyZVwiLFwiYW55d2hlcmVcIiksXG4gICAgICByYWRpdXM6IHRyKFwiUmFkaXVzIHNlYXJjaFwiLFwicmFkaXVzXCIpXG4gICAgfTtcbiAgICByZXR1cm4gbW9kZUxhYmVsc1ttb2RlXTtcbiAgfSxcblxuICBzd2l0Y2hNb2RlVG86IGZ1bmN0aW9uIChtb2RlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIGlmIChtb2RlID09IFwicmFkaXVzXCIpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RWYWx1ZShuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicmFkaXVzXCIsIHZhbHVlOiBuZXcgUmFkaXVzKCl9KSk7XG4gICAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl3aGVyZVwiKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0VmFsdWUobmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcImFueXdoZXJlXCJ9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMudmFsdWUsIFwiY2hhbmdlTW9kZVwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm9wcy5vblNpemVDaGFuZ2UodGhpcy5wcm9wcy5zaXplc1ttb2RlXSk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgdmlld01vZGU6IG1vZGVcbiAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIGNoZWNrTW9kZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnZhbHVlLm1vZGUgPT0gXCJ0ZXh0XCIgJiYgIXRoaXMucHJvcHMudmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS52aWV3TW9kZSAhPSBcImFsbFwiKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHZpZXdNb2RlOiBcImFsbFwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uIChuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgIGlmIChuZXh0UHJvcHMudmFsdWUgIT0gdGhpcy5wcm9wcy52YWx1ZSkge1xuICAgICAgdGhpcy5jaGVja01vZGUoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2VsZWN0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5wcm9wcy52YWx1ZTsgLy9qdXN0IHNhbWUgdmFsdWUgYXMsIGJ1dCBiZWhhdmUgYXMgaXQgd2FzIHNlbGVjdGVkXG4gICAgfVxuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUuc2V0KFwiZm9ybU1vZGVcIix0aGlzLnN0YXRlLnZpZXdNb2RlKSwgXCJzZWxlY3RcIik7XG4gIH0sXG5cbiAgcmVuZGVyQWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VzLCB7c2VhcmNoOiB0aGlzLnByb3BzLnZhbHVlLCBvblNlbGVjdDogdGhpcy5zZWxlY3RWYWx1ZX0pO1xuICB9LFxuXG4gIHJlbmRlck5lYXJieTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFBsYWNlcywge3NlYXJjaDogdGhpcy5wcm9wcy52YWx1ZSwgb25TZWxlY3Q6IHRoaXMuc2VsZWN0VmFsdWUsIG5lYXJieTogdHJ1ZX0pO1xuICB9LFxuXG4gIHJlbmRlckNoZWFwZXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsIFwic3NzXCIpKVxuICB9LFxuXG4gIHJlbmRlckNpdGllc0FuZEFpcnBvcnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUGxhY2VzLCB7c2VhcmNoOiB0aGlzLnByb3BzLnZhbHVlLCBvblNlbGVjdDogdGhpcy5zZWxlY3RWYWx1ZSwgdHlwZXM6IGFpcnBvcnRzQW5kQ2l0aWVzVHlwZXN9KTtcbiAgfSxcblxuICByZW5kZXJDb3VudHJpZXM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZXMsIHtzZWFyY2g6IHRoaXMucHJvcHMudmFsdWUsIG9uU2VsZWN0OiB0aGlzLnNlbGVjdFZhbHVlLCB0eXBlczogY291bnRyeVR5cGVzfSk7XG4gIH0sXG5cbiAgcmVuZGVyQW55d2hlcmU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCkpXG4gIH0sXG5cbiAgcmVuZGVyUmFkaXVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwpKVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1vZGUgPSB0aGlzLnN0YXRlLnZpZXdNb2RlO1xuICAgIHJldHVybiAoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6ICdzZWFyY2gtcGxhY2UtcGlja2VyIHNlYXJjaC1waWNrZXIgJyttb2RlfSwgXG4gICAgICAgICB0aGlzLnJlbmRlck1lbnUoKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogXCJjb250ZW50XCJ9LCBcbiAgICAgICAgICAgdGhpcy5yZW5kZXJCb2R5KCkgXG4gICAgICAgICksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IFwiY2xlYXItYm90aFwifSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYWNlUGlja2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQbGFjZVJvdyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJQbGFjZVJvd1wiLFxuICBjbGljazogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QodGhpcy5wcm9wcy5wbGFjZSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBwbGFjZSA9IHRoaXMucHJvcHMucGxhY2U7XG4gICAgdmFyIGNsYXNzTmFtZSA9IFwicGxhY2Utcm93XCI7XG4gICAgaWYgKHRoaXMucHJvcHMuc2VsZWN0ZWQpIHtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBzZWxlY3RlZFwiO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBjbGFzc05hbWUsIG9uQ2xpY2s6IHRoaXMuY2xpY2t9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge2NsYXNzTmFtZTogXCJuYW1lXCJ9LCBcbiAgICAgICAgICBwbGFjZS5nZXROYW1lKClcbiAgICAgICAgKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtjbGFzc05hbWU6IFwidHlwZVwifSwgXG4gICAgICAgICAgcGxhY2UuZ2V0VHlwZSgpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIH1cbn0pO1xuIG1vZHVsZS5leHBvcnRzID0gUGxhY2VSb3c7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBQbGFjZXNBUEkgPSByZXF1aXJlKCcuLy4uLy4uL0FQSXMvUGxhY2VzQVBJQ2FjaGVkLmpzeCcpO1xudmFyIFBsYWNlUm93ID0gcmVxdWlyZSgnLi9QbGFjZVJvdy5qc3gnKTtcbnZhciBHZW9sb2NhdGlvbiA9IHJlcXVpcmUoJy4vLi4vLi4vR2VvbG9jYXRpb24uanN4Jyk7XG52YXIgU2VhcmNoUGxhY2UgPSByZXF1aXJlKCcuLy4uLy4uL2NvbnRhaW5lcnMvU2VhcmNoUGxhY2UuanN4Jyk7XG52YXIgT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi8uLi8uLi9zdG9yZXMvT3B0aW9uc1N0b3JlLmpzeCcpO1xuXG5cbmZ1bmN0aW9uIGZpbmRQb3Mob2JqKSB7XG4gIHZhciBjdXJ0b3AgPSAwO1xuICBpZiAob2JqLm9mZnNldFBhcmVudCkge1xuICAgIGRvIHtcbiAgICAgIGN1cnRvcCArPSBvYmoub2Zmc2V0VG9wO1xuICAgIH0gd2hpbGUgKG9iaiA9IG9iai5vZmZzZXRQYXJlbnQpO1xuICAgIHJldHVybiBbY3VydG9wXTtcbiAgfVxufVxuXG52YXIgUGxhY2VzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlBsYWNlc1wiLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYXN0U2VhcmNoOiBudWxsLFxuICAgICAgbGFzdFR5cGVzOiBudWxsLFxuICAgICAgbGFzdE5lYXJieTogbnVsbCxcbiAgICAgIHBsYWNlczogW10sXG4gICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIGFwaUVycm9yOiBmYWxzZSxcbiAgICAgIGxvYWRpbmc6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG5cbiAga2V5cHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUua2V5SWRlbnRpZmllciA9PSBcIlVwXCIpIHtcbiAgICAgIHRoaXMubW92ZVVwKCk7XG4gICAgfSBlbHNlIGlmIChlLmtleUlkZW50aWZpZXIgPT0gXCJEb3duXCIpIHtcbiAgICAgIHRoaXMubW92ZURvd24oKTtcbiAgICB9IGVsc2UgaWYgKGUua2V5SWRlbnRpZmllciA9PSBcIkVudGVyXCIpIHtcbiAgICAgIHRoaXMuc2VsZWN0RnJvbUluZGV4KCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9LFxuXG4gIG1vdmVVcDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IHRoaXMuc3RhdGUua2V5U2VsZWN0ZWRJbmRleCAtIDFcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiB0aGlzLnN0YXRlLnBsYWNlcy5sZW5ndGggLSAxXG4gICAgICB9KVxuICAgIH1cbiAgfSxcblxuICBtb3ZlRG93bjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBudW1PZlBsYWNlcyA9IHRoaXMuc3RhdGUucGxhY2VzLmxlbmd0aDtcbiAgICBpZiAodGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4IDwgdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4ICsgMVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGtleVNlbGVjdGVkSW5kZXg6IDBcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuXG4gIHNlbGVjdEZyb21JbmRleDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5zZWxlY3QodGhpcy5zdGF0ZS5wbGFjZXNbdGhpcy5zdGF0ZS5rZXlTZWxlY3RlZEluZGV4XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW92ZU5leHQoKTtcbiAgICB9XG4gIH0sXG5cbiAgYWRqdXN0U2Nyb2xsOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucmVmcy5wbGFjZXMgJiYgdGhpcy5yZWZzLnNlbGVjdGVkUGxhY2UpIHtcbiAgICAgIHZhciBwbGFjZXNFbGVtZW50ID0gdGhpcy5yZWZzLnBsYWNlcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgc2VsZWN0ZWRFbGVtZW50ID0gdGhpcy5yZWZzLnNlbGVjdGVkUGxhY2UuZ2V0RE9NTm9kZSgpO1xuICAgICAgcGxhY2VzRWxlbWVudC5zY3JvbGxUb3AgPSBmaW5kUG9zKHNlbGVjdGVkRWxlbWVudCkgLSAyMDA7XG4gICAgfVxuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2hlY2tOZXdQbGFjZXMoKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleXByZXNzKTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlwcmVzcyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICB0aGlzLmNoZWNrTmV3UGxhY2VzKCk7XG4gICAgdGhpcy5hZGp1c3RTY3JvbGwoKTtcbiAgfSxcblxuICBmaWx0ZXJQbGFjZXNCeVR5cGU6IGZ1bmN0aW9uIChwbGFjZXMgLCB0eXBlcykge1xuICAgIGlmICh0eXBlcykge1xuICAgICAgcmV0dXJuIHBsYWNlcy5maWx0ZXIoZnVuY3Rpb24ocGxhY2UpICB7XG4gICAgICAgIHJldHVybiB0eXBlcy5pbmRleE9mKHBsYWNlLmdldFR5cGVJZCgpKSAhPSAtMTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGxhY2VzO1xuICAgIH1cbiAgfSxcblxuICAvL1RPRE8gcmVmYWN0b3JlIC0gbmVhcmJ5IHNob3VsZCBiZSBzZXBhcmF0ZSBmcm9tIHRleHRcbiAgc2V0U2VhcmNoVGV4dDogZnVuY3Rpb24gKHNlYXJjaFRleHQpIHtcbiAgICB2YXIgcGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSSh7bGFuZzogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0XG4gICAgfSk7XG4gICAgdmFyIGNhbGxGdW5jUGFyYW07XG4gICAgaWYgKHRoaXMucHJvcHMubmVhcmJ5KSB7XG4gICAgICBjYWxsRnVuY1BhcmFtID0gcGxhY2VzQVBJLmZpbmROZWFyYnkoR2VvbG9jYXRpb24uZ2V0Q3VycmVudEJvdW5kcygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbEZ1bmNQYXJhbSA9IHBsYWNlc0FQSS5maW5kQnlOYW1lKHNlYXJjaFRleHQpOyAvL1RPRE9cbiAgICB9XG5cbiAgICBjYWxsRnVuY1BhcmFtLnRoZW4oZnVuY3Rpb24ocGxhY2VzKSAge1xuICAgICAgaWYgKHNlYXJjaFRleHQgIT0gdGhpcy5zdGF0ZS5zZWFyY2hUZXh0IHx8ICF0aGlzLmlzTW91bnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBmaWx0ZXJlZFBsYWNlcyA9IHRoaXMuZmlsdGVyUGxhY2VzQnlUeXBlKHBsYWNlcywgdGhpcy5wcm9wcy50eXBlcyk7XG4gICAgICB2YXIgbGltaXRlZFBsYWNlcyA9IGZpbHRlcmVkUGxhY2VzLnNsaWNlKDAsNTApO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHBsYWNlczogbGltaXRlZFBsYWNlcyxcbiAgICAgICAgYXBpRXJyb3I6IGZhbHNlLFxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKS5jYXRjaChmdW5jdGlvbihlcnJvcikgIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHBsYWNlczogW10sXG4gICAgICAgIGFwaUVycm9yOiB0cnVlLFxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZWxlY3Q6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QoIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogdmFsdWV9KSApO1xuICB9LFxuXG4gIG1vdmVOZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KG51bGwsIFwibmV4dFwiKTtcbiAgfSxcblxuICBnZXRUZXh0VG9TZWFyY2g6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWFyY2gubW9kZSA9PSBcInRleHRcIiAmJiAhdGhpcy5wcm9wcy5zZWFyY2guaXNEZWZhdWx0KSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5zZWFyY2guZ2V0VGV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gIH0sXG5cbiAgY2hlY2tOZXdQbGFjZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGV4dFRvU2VhcmNoID0gdGhpcy5nZXRUZXh0VG9TZWFyY2goKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5sYXN0U2VhcmNoICE9PSB0ZXh0VG9TZWFyY2gpIHtcbiAgICAgIHRoaXMuc2V0U2VhcmNoVGV4dCh0ZXh0VG9TZWFyY2gpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxhc3RTZWFyY2g6IHRleHRUb1NlYXJjaCxcbiAgICAgICAga2V5U2VsZWN0ZWRJbmRleDogLTFcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5sYXN0VHlwZXMgIT0gdGhpcy5wcm9wcy50eXBlcykge1xuICAgICAgdGhpcy5zZXRTZWFyY2hUZXh0KHRleHRUb1NlYXJjaCk7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgbGFzdFR5cGVzOiB0aGlzLnByb3BzLnR5cGVzLFxuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmxhc3ROZWFyYnkgIT0gdGhpcy5wcm9wcy5uZWFyYnkpIHtcbiAgICAgIHRoaXMuc2V0U2VhcmNoVGV4dCh0ZXh0VG9TZWFyY2gpO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGxhc3ROZWFyYnk6IHRoaXMucHJvcHMubmVhcmJ5LFxuICAgICAgICBrZXlTZWxlY3RlZEluZGV4OiAtMVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG5cbiAgcmVuZGVyUGxhY2VzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsYWNlcyA9IHRoaXMuc3RhdGUucGxhY2VzO1xuICAgIHZhciBzZWxlY3RlZCA9IHBsYWNlc1t0aGlzLnN0YXRlLmtleVNlbGVjdGVkSW5kZXhdO1xuICAgIHJldHVybiBwbGFjZXMubWFwKGZ1bmN0aW9uKHBsYWNlKSAge1xuICAgICAgaWYgKHNlbGVjdGVkID09IHBsYWNlKSB7XG4gICAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZVJvdywge3JlZjogXCJzZWxlY3RlZFBsYWNlXCIsIHNlbGVjdGVkOiBzZWxlY3RlZCA9PSBwbGFjZSwgb25TZWxlY3Q6IHRoaXMuc2VsZWN0LCBwbGFjZTogcGxhY2V9KSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChQbGFjZVJvdywge29uU2VsZWN0OiB0aGlzLnNlbGVjdCwgcGxhY2U6IHBsYWNlfSkpXG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbG9hZGVyQ2xhc3MgPSBcImxvYWRlciBcIiArICh0aGlzLnN0YXRlLmxvYWRpbmcgPyBcImxvYWRpbmdcIiA6IFwibm90LWxvYWRpbmdcIik7XG4gICAgdmFyIG5vUmVzdWx0c0NsYXNzID0gXCJuby1yZXN1bHRzXCI7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmxvYWRpbmcgJiYgdGhpcy5zdGF0ZS5wbGFjZXMubGVuZ3RoID09IDApIHtcbiAgICAgIG5vUmVzdWx0c0NsYXNzICs9IFwiIHNob3duXCJcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge2NsYXNzTmFtZTogbG9hZGVyQ2xhc3N9LCBcIkxvYWRpbmcuLi5cIiksIFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtjbGFzc05hbWU6IG5vUmVzdWx0c0NsYXNzfSwgXCJObyByZXN1bHRzXCIpLCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7cmVmOiBcInBsYWNlc1wiLCBjbGFzc05hbWU6IFwicGxhY2VzXCJ9LCBcbiAgICAgICAgICB0aGlzLnJlbmRlclBsYWNlcygpXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIH1cblxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIERhdGVQaWNrZXJNb2RhbCA9IHJlcXVpcmUoJy4vLi4vRGF0ZVBpY2tlci9EYXRlUGlja2VyTW9kYWwuanN4Jyk7XG52YXIgUGxhY2VQaWNrZXJNb2RhbCA9IHJlcXVpcmUoJy4vLi4vUGxhY2VQaWNrZXIvUGxhY2VQaWNrZXJNb2RhbC5qc3gnKTtcblxuXG52YXIgU2VhcmNoRm9ybVN0b3JlID0gcmVxdWlyZSgnLi8uLi9zdG9yZXMvU2VhcmNoRm9ybVN0b3JlLmpzeCcpO1xuXG52YXIgU2VhcmNoRGF0ZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hEYXRlLmpzeCcpO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi8uLi9jb250YWluZXJzL1NlYXJjaFBsYWNlLmpzeCcpO1xudmFyIHRyID0gcmVxdWlyZSgnLi8uLi90ci5qcycpO1xudmFyIFRyYW4gPSByZXF1aXJlKCcuLy4uL1RyYW4uanN4Jyk7XG5cbnZhciBtb21lbnQgPSAod2luZG93Lm1vbWVudCk7XG5cbnZhciBvcHRpb25zID0ge1xuICBvcmlnaW46IHtcbiAgICBtb2Rlczoge1xuICAgICAgYWxsOiB0cnVlLFxuICAgICAgbmVhcmJ5OiB0cnVlLFxuICAgICAgY2hlYXBlc3Q6IGZhbHNlLFxuICAgICAgY2l0aWVzQW5kQWlycG9ydHM6IGZhbHNlLFxuICAgICAgY291bnRyaWVzOiB0cnVlLFxuICAgICAgYW55d2hlcmU6IGZhbHNlLFxuICAgICAgcmFkaXVzOiB0cnVlXG4gICAgfVxuICB9LFxuICBkZXN0aW5hdGlvbjoge1xuICAgIG1vZGVzOiB7XG4gICAgICBhbGw6IHRydWUsXG4gICAgICBuZWFyYnk6IGZhbHNlLFxuICAgICAgY2hlYXBlc3Q6IGZhbHNlLFxuICAgICAgY2l0aWVzQW5kQWlycG9ydHM6IGZhbHNlLFxuICAgICAgY291bnRyaWVzOiB0cnVlLFxuICAgICAgYW55d2hlcmU6IHRydWUsXG4gICAgICByYWRpdXM6IHRydWVcbiAgICB9XG4gIH0sXG4gIGRhdGVGcm9tOiB7XG4gICAgbW9kZXM6IHtcbiAgICAgIHNpbmdsZTogdHJ1ZSxcbiAgICAgIGludGVydmFsOiB0cnVlLFxuICAgICAgbW9udGg6IHRydWUsXG4gICAgICB0aW1lVG9TdGF5OiBmYWxzZSxcbiAgICAgIGFueXRpbWU6IHRydWUsXG4gICAgICBub1JldHVybjogZmFsc2VcbiAgICB9XG4gIH0sXG4gIGRhdGVUbzoge1xuICAgIG1vZGVzOiB7XG4gICAgICBzaW5nbGU6IHRydWUsXG4gICAgICBpbnRlcnZhbDogdHJ1ZSxcbiAgICAgIG1vbnRoOiB0cnVlLFxuICAgICAgdGltZVRvU3RheTogdHJ1ZSxcbiAgICAgIGFueXRpbWU6IHRydWUsXG4gICAgICBub1JldHVybjogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxuXG5cbnZhciBTZWFyY2hGb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe2Rpc3BsYXlOYW1lOiBcIlNlYXJjaEZvcm1cIixcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhY3RpdmU6IHRoaXMucHJvcHMuZGVmYXVsdEFjdGl2ZSB8fCBcIm9yaWdpblwiLFxuICAgICAgZGF0YTogU2VhcmNoRm9ybVN0b3JlLmRhdGFcbiAgICB9O1xuICB9LFxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXG4gIH0sXG4gIGNyZWF0ZU1vZGFsQ29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ21vZGFsLWNvbnRhaW5lci1lbGVtZW50Jyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIHJldHVybiBkaXY7XG4gIH0sXG5cbiAgY2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRhdGE6IFNlYXJjaEZvcm1TdG9yZS5kYXRhXG4gICAgfSlcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIFNlYXJjaEZvcm1TdG9yZS5ldmVudHMub24oJ2NoYW5nZScsIHRoaXMuY2hhbmdlTGlzdGVuZXIpO1xuICB9LFxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIFNlYXJjaEZvcm1TdG9yZS5ldmVudHMucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMuY2hhbmdlTGlzdGVuZXIpO1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZGF0ZVBpY2tlckZhY3RvcnkgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KERhdGVQaWNrZXJNb2RhbCk7XG4gICAgdmFyIHBsYWNlUGlja2VyRmFjdG9yeSA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUGxhY2VQaWNrZXJNb2RhbCk7XG5cbiAgICB0aGlzLmNvbXBvbmVudHMgPSB7fTtcbiAgICB0aGlzLmNvbXBvbmVudHMuZGF0ZUZyb20gPSBSZWFjdC5yZW5kZXIoZGF0ZVBpY2tlckZhY3RvcnkoKSwgdGhpcy5jcmVhdGVNb2RhbENvbnRhaW5lcigpKTtcbiAgICB0aGlzLmNvbXBvbmVudHMuZGF0ZVRvID0gUmVhY3QucmVuZGVyKGRhdGVQaWNrZXJGYWN0b3J5KCksIHRoaXMuY3JlYXRlTW9kYWxDb250YWluZXIoKSk7XG4gICAgdGhpcy5jb21wb25lbnRzLm9yaWdpbiA9IFJlYWN0LnJlbmRlcihwbGFjZVBpY2tlckZhY3RvcnkoKSwgdGhpcy5jcmVhdGVNb2RhbENvbnRhaW5lcigpKTtcbiAgICB0aGlzLmNvbXBvbmVudHMuZGVzdGluYXRpb24gPSBSZWFjdC5yZW5kZXIocGxhY2VQaWNrZXJGYWN0b3J5KCksIHRoaXMuY3JlYXRlTW9kYWxDb250YWluZXIoKSk7XG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLmNvbXBvbmVudHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgICAgdGhpcy5jb21wb25lbnRzW2tleV0uc2V0UHJvcHMoe1xuICAgICAgICBpbnB1dEVsZW1lbnQ6IHRoaXMucmVmc1trZXkgKyBcIk91dGVyXCJdLmdldERPTU5vZGUoKSxcbiAgICAgICAgdmFsdWU6IHRoaXMuc3RhdGUuZGF0YVtrZXldLFxuICAgICAgICBvbkhpZGU6IGZ1bmN0aW9uKCkgIHtcbiAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUgPT0ga2V5KSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgYWN0aXZlOiBcIlwiXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5jaGFuZ2VWYWx1ZUZ1bmMoa2V5KSxcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1trZXldXG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5tb2RhbENvbXBvbmVudHNMb2FkZWQgPSB0cnVlO1xuICAgIHRoaXMucmVmcmVzaFNob3duKCk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbiAocHJldlByb3BzLCBwcmV2U3RhdGUpIHtcbiAgICB0aGlzLnJlZnJlc2hTaG93bigpO1xuXG4gICAgLy9Db21wbGV0ZSBwcmV2aW91cyBmaWVsZFxuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSAhPSBwcmV2U3RhdGUuYWN0aXZlKSB7XG4gICAgICBpZiAocHJldlN0YXRlLmFjdGl2ZSA9PSBcIm9yaWdpblwiIHx8IHByZXZTdGF0ZS5hY3RpdmUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XG4gICAgICAgIFNlYXJjaEZvcm1TdG9yZS5jb21wbGV0ZUZpZWxkKHByZXZTdGF0ZS5hY3RpdmUpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRGb3JtYXR0ZWRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMuc3RhdGUuZGF0YVtmaWVsZE5hbWVdO1xuICAgIGlmICghdmFsdWUpIHJldHVybiBcIlwiO1xuICAgIGlmIChmaWVsZE5hbWUgPT0gXCJvcmlnaW5cIiB8fCBmaWVsZE5hbWUgPT0gXCJkZXN0aW5hdGlvblwiKSB7XG4gICAgICByZXR1cm4gdmFsdWUuZ2V0VGV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsdWUuZm9ybWF0KCk7XG4gICAgfVxuICB9LFxuXG4gIG5leHRGaWVsZDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIG9yZGVyID0gW1xuICAgICAgXCJvcmlnaW5cIixcbiAgICAgIFwiZGVzdGluYXRpb25cIixcbiAgICAgIFwiZGF0ZUZyb21cIixcbiAgICAgIFwiZGF0ZVRvXCIsXG4gICAgICBcInN1Ym1pdEJ1dHRvblwiXG4gICAgXTtcbiAgICB2YXIgbmV3QWN0aXZlO1xuICAgIGlmICh0aGlzLnN0YXRlLmFjdGl2ZSkge1xuICAgICAgdmFyIGluZGV4ID0gb3JkZXIuaW5kZXhPZih0aGlzLnN0YXRlLmFjdGl2ZSk7XG4gICAgICB2YXIgbmV3SW5kZXg7XG4gICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8PSAzKSB7XG4gICAgICAgIG5ld0FjdGl2ZSA9IG9yZGVyW2luZGV4KzFdO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSA0KSB7XG4gICAgICAgIC8vVE9ETyBmb2N1cyBvbiBzZWFyY2ggYnRuXG4gICAgICAgIG5ld0FjdGl2ZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdBY3RpdmUgPSBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdBY3RpdmUgPSBcIm9yaWdpblwiO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGFjdGl2ZTogbmV3QWN0aXZlXG4gICAgfSk7XG4gIH0sXG4gIGNoYW5nZVZhbHVlRnVuYzogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgY2hhbmdlVHlwZSkgIHtcbiAgICAgIGlmIChjaGFuZ2VUeXBlID09IFwiY2hhbmdlTW9kZVwiKSB7XG4gICAgICAgIC8vdGhpcy5yZWZzW2ZpZWxkTmFtZV0uZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICAgIC8vVE9ETyByZXR1cm4gaGVyZT8/P1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZVR5cGUgPT0gXCJzZWxlY3RcIikge1xuICAgICAgICB0aGlzLm5leHRGaWVsZCgpO1xuICAgICAgfVxuICAgICAgT2JqZWN0LmtleXModGhpcy5jb21wb25lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgICAgU2VhcmNoRm9ybVN0b3JlLnNldFZhbHVlKHRoaXMuc3RhdGUuZGF0YS5jaGFuZ2VGaWVsZChmaWVsZE5hbWUsIHZhbHVlKSk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKVxuICB9LFxuXG4gIG9uRm9jdXNGdW5jOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBhY3RpdmU6IGZpZWxkTmFtZVxuICAgICAgfSk7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLmRhdGFbZmllbGROYW1lXTtcbiAgICAgIGlmICh2YWx1ZS5tb2RlICE9IFwidGV4dFwiIHx8IHZhbHVlLmlzRGVmYXVsdCkge1xuICAgICAgICB0aGlzLnJlZnNbZmllbGROYW1lXS5nZXRET01Ob2RlKCkuc2VsZWN0KCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpXG4gIH0sXG5cbiAgY2hhbmdlVGV4dEZ1bmM6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcbiAgICBpZiAoZmllbGROYW1lID09IFwib3JpZ2luXCIgfHwgZmllbGROYW1lID09IFwiZGVzdGluYXRpb25cIikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpICB7XG4gICAgICAgIHZhciBhZGRTdGF0ZSA9IHt9O1xuICAgICAgICBTZWFyY2hGb3JtU3RvcmUuc2V0VmFsdWUodGhpcy5zdGF0ZS5kYXRhLmNoYW5nZUZpZWxkKGZpZWxkTmFtZSwgbmV3IFNlYXJjaFBsYWNlKGUudGFyZ2V0LnZhbHVlKSkpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKGFkZFN0YXRlKTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSAge307XG4gICAgfVxuICB9LFxuXG4gIG9uQ2xpY2tPdXRlckZ1bmM6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkgIHtcbiAgICAgIGlmICh0eXBlID09IHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGFjdGl2ZTogXCJcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub25Gb2N1c0Z1bmModHlwZSkoKTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcylcbiAgfSxcbiAgb25DbGlja0lubmVyOiBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgb25JbnB1dEtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUua2V5ID09IFwiQXJyb3dVcFwiIHx8IGUua2V5ID09IFwiQXJyb3dEb3duXCIgIHx8IGUua2V5ID09IFwiRW50ZXJcIikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfSxcblxuICByZWZyZXNoRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZG9tTm9kZTtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUpIHtcbiAgICAgIGRvbU5vZGUgPSB0aGlzLnJlZnNbdGhpcy5zdGF0ZS5hY3RpdmVdLmdldERPTU5vZGUoKTtcbiAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9IGRvbU5vZGUpIHtcbiAgICAgICAgZG9tTm9kZS5mb2N1cygpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hY3RpdmUgIT0gXCJzdWJtaXRCdXR0b25cIikge1xuICAgICAgICAgIHZhciBhY3RpdmVWYWx1ZSA9IHRoaXMuc3RhdGUuZGF0YVt0aGlzLnN0YXRlLmFjdGl2ZV07XG4gICAgICAgICAgaWYgKGFjdGl2ZVZhbHVlLm1vZGUgIT0gXCJ0ZXh0XCIgfHwgYWN0aXZlVmFsdWUuaXNEZWZhdWx0KSB7XG4gICAgICAgICAgICBkb21Ob2RlLnNlbGVjdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzZWFyY2g6IGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFNlYXJjaEZvcm1TdG9yZS5zZWFyY2goKTtcbiAgfSxcblxuICBnZXRGaWVsZExhYmVsOiBmdW5jdGlvbiAobW9kZSkge1xuICAgIHZhciBtb2RlTGFiZWxzID0ge1xuICAgICAgb3JpZ2luOiB0cihcIkZyb21cIixcImZyb21cIiksXG4gICAgICBkZXN0aW5hdGlvbjogdHIoXCJUb1wiLFwidG9cIiksXG4gICAgICBkYXRlRnJvbTogdHIoXCJEZXBhcnRcIixcImRhdGVcIiksXG4gICAgICBkYXRlVG86IHRyKFwiUmV0dXJuXCIsXCJyZXR1cm5cIilcbiAgICB9O1xuICAgIHJldHVybiBtb2RlTGFiZWxzW21vZGVdO1xuICB9LFxuXG4gIHJlZnJlc2hTaG93bjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLm1vZGFsQ29tcG9uZW50c0xvYWRlZCkge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5jb21wb25lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzW2tleV0uc2V0UHJvcHMoe1xuICAgICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLmRhdGFba2V5XSxcbiAgICAgICAgICBzaG93bjoga2V5ID09IHRoaXMuc3RhdGUuYWN0aXZlXG4gICAgICAgIH0pO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMucmVmcmVzaEZvY3VzKCk7XG4gICAgfVxuICB9LFxuICByZW5kZXJJbnB1dDogZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciBmYUljb25DbGFzcyA9IFwiZmEgZmEtY2FyZXQtZG93blwiO1xuICAgIGlmICh0eXBlID09IHRoaXMuc3RhdGUuYWN0aXZlKSB7XG4gICAgICBmYUljb25DbGFzcyA9IFwiZmEgZmEtY2FyZXQtdXBcIlxuICAgIH1cbiAgICB2YXIgY2xhc3NOYW1lID0gdHlwZTtcbiAgICBpZiAodGhpcy5zdGF0ZS5kYXRhW3R5cGVdLmVycm9yKSB7XG4gICAgICBjbGFzc05hbWUgKz0gXCIgZXJyb3JcIlxuICAgIH1cbiAgICBpZiAodGhpcy5zdGF0ZS5kYXRhW3R5cGVdLmxvYWRpbmcpIHtcbiAgICAgIGNsYXNzTmFtZSArPSBcIiBsb2FkaW5nXCJcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJmaWVsZHNldFwiLCB7XG4gICAgICAgIGNsYXNzTmFtZTogY2xhc3NOYW1lLCBcbiAgICAgICAgcmVmOiB0eXBlICsgXCJPdXRlclwiLCBcbiAgICAgICAgb25DbGljazogdGhpcy5vbkNsaWNrT3V0ZXJGdW5jKHR5cGUpXG4gICAgICB9LCBcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7Y2xhc3NOYW1lOiBcImhlYWRcIn0sIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiLCBudWxsLCB0aGlzLmdldEZpZWxkTGFiZWwodHlwZSkpLCBcbiAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCB7Y2xhc3NOYW1lOiBcImlucHV0LXdyYXBwZXJcIn0sIFxuICAgICAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcbiAgICAgICAgICAgICAgdmFsdWU6IHRoaXMuZ2V0Rm9ybWF0dGVkVmFsdWUodHlwZSksIFxuICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLm9uQ2xpY2tJbm5lciwgXG4gICAgICAgICAgICAgIG9uRm9jdXM6IHRoaXMub25Gb2N1c0Z1bmModHlwZSksIFxuICAgICAgICAgICAgICBvbktleURvd246IHRoaXMub25JbnB1dEtleURvd24sIFxuICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIiwgXG4gICAgICAgICAgICAgIHJlZjogdHlwZSwgXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmNoYW5nZVRleHRGdW5jKHR5cGUpLCBcbiAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiBcIm9mZlwifVxuICAgICAgICAgICAgKVxuICAgICAgICAgICksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IFwiZmEgZmEtc3Bpbm5lclwifSksIFxuICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJiXCIsIHtjbGFzc05hbWU6IFwidG9nZ2xlXCJ9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtjbGFzc05hbWU6IGZhSWNvbkNsYXNzfSlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJmb3JtXCIsIHtpZDogXCJzZWFyY2hcIn0sIFxuICAgICAgICB0aGlzLnJlbmRlcklucHV0KFwib3JpZ2luXCIpLCBcbiAgICAgICAgdGhpcy5yZW5kZXJJbnB1dChcImRlc3RpbmF0aW9uXCIpLCBcbiAgICAgICAgdGhpcy5yZW5kZXJJbnB1dChcImRhdGVGcm9tXCIpLCBcbiAgICAgICAgdGhpcy5yZW5kZXJJbnB1dChcImRhdGVUb1wiKSwgXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge29uQ2xpY2s6IHRoaXMuc2VhcmNoLCBpZDogXCJzZWFyY2gtZmxpZ2h0c1wiLCByZWY6IFwic3VibWl0QnV0dG9uXCIsIGNsYXNzTmFtZTogXCJidG4tc2VhcmNoXCJ9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFRyYW4sIHt0S2V5OiBcInNlYXJjaFwifSwgXCJTZWFyY2hcIikpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7Y2xhc3NOYW1lOiBcImZhIGZhLXNlYXJjaFwifSkpXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoRm9ybTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyoqIEBqc3ggUmVhY3QuRE9NICovXG5cbnZhciBSZWFjdCA9ICh3aW5kb3cuUmVhY3QpO1xudmFyIHRyID0gcmVxdWlyZSgnLi90ci5qcycpO1xuXG4vKiByZWFjdCBjb21wb25lbnQgd3JhcHBlciBvZiB0ciBmdW5jdGlvbiAqL1xuXG52YXIgVHJhbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtkaXNwbGF5TmFtZTogXCJUcmFuXCIsXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9yaWdpbmFsID0gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgICB2YXIga2V5ID0gdGhpcy5wcm9wcy50S2V5O1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLnByb3BzLnZhbHVlcztcbiAgICByZXR1cm4gKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChcInNwYW5cIiwgbnVsbCwgXG4gICAgICAgICB0cihvcmlnaW5hbCxrZXksdmFsdWVzKSBcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgUmFkaXVzID0gcmVxdWlyZShcIi4vUmFkaXVzLmpzeFwiKTtcblxuXG4gIGZ1bmN0aW9uIE9wdGlvbnMocGxhaW4pIHtcInVzZSBzdHJpY3RcIjtcbiAgICBwbGFpbiA9IHBsYWluIHx8IHt9O1xuICAgIGlmICh3aW5kb3cuU0tZUElDS0VSX0xORykge1xuICAgICAgdGhpcy5sYW5ndWFnZSA9IHdpbmRvdy5TS1lQSUNLRVJfTE5HLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGFuZ3VhZ2UgPSBwbGFpbi5sYW5ndWFnZSB8fCBcImVuXCI7XG4gICAgfVxuXG4gICAgdGhpcy5kZWZhdWx0UmFkaXVzID0gcGxhaW4uZGVmYXVsdFJhZGl1cyB8fCBuZXcgUmFkaXVzKCk7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBPcHRpb25zLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBuZXdQbGFpbiA9IHtcbiAgICAgIGxhbmd1YWdlOiB0aGlzLmxhbmd1YWdlLFxuICAgICAgZGVmYXVsdFJhZGl1czogdGhpcy5kZWZhdWx0UmFkaXVzXG4gICAgfTtcbiAgICBuZXdQbGFpbltrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25zKG5ld1BsYWluKTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wdGlvbnM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHR5cGVJZFRvU3RyaW5nID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodHlwZSA9PSBQbGFjZS5UWVBFX0FJUlBPUlQpIHtcbiAgICByZXR1cm4gXCJhaXJwb3J0XCI7XG4gIH0gZWxzZSBpZiAodHlwZSA9PSBQbGFjZS5UWVBFX0NPVU5UUlkpIHtcbiAgICByZXR1cm4gXCJjb3VudHJ5XCI7XG4gIH0gZWxzZSBpZiAodHlwZSA9PSBQbGFjZS5UWVBFX0NJVFkpIHtcbiAgICByZXR1cm4gXCJjaXR5XCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFwidW5rbm93blwiO1xuICB9XG59O1xuXG5cblxuXG4gIGZ1bmN0aW9uIFBsYWNlKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmtleXMocGxhaW4pLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgICAgdGhpc1trZXldID0gcGxhaW5ba2V5XTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIGlmICh0eXBlb2YgdGhpcy5jb21wbGV0ZSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmNvbXBsZXRlID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy50eXBlU3RyaW5nID0gdHlwZUlkVG9TdHJpbmcodGhpcy50eXBlKTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIFBsYWNlLnByb3RvdHlwZS5nZXROYW1lPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9O1xuICBQbGFjZS5wcm90b3R5cGUuZ2V0SWQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG4gIH07XG4gIFBsYWNlLnByb3RvdHlwZS5nZXRUeXBlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnR5cGVTdHJpbmc7XG4gIH07XG4gIFBsYWNlLnByb3RvdHlwZS5nZXRUeXBlSWQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMudHlwZVxuICB9O1xuICAgXG4gICAgICBcbiAgICAgICAgXG4gICAgXG4gIFxuXG5cblBsYWNlLlRZUEVfQUlSUE9SVCA9IDA7XG5QbGFjZS5UWVBFX0NPVU5UUlkgPSAxO1xuUGxhY2UuVFlQRV9DSVRZID0gMjtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGFjZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5cbmZ1bmN0aW9uIHJvdW5kKG51bSkge1xuICByZXR1cm4gTWF0aC5yb3VuZChudW0gKiAxMDApIC8gMTAwO1xufVxuXG5cbiAgZnVuY3Rpb24gUmFkaXVzKHBsYWluKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcGxhaW4gPSBwbGFpbiB8fCB7fTtcbiAgICB0aGlzLnJhZGl1cyA9ICBwbGFpbi5yYWRpdXMgfHwgMjUwO1xuICAgIHRoaXMubGF0ID0gIHBsYWluLmxhdCB8fCA1MDtcbiAgICB0aGlzLmxuZyA9ICBwbGFpbi5sbmcgfHwgMTY7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuICBSYWRpdXMucHJvdG90eXBlLmdldFRleHQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIFwiXCIgKyByb3VuZCh0aGlzLmxhdCkgKyBcIiwgXCIgKyByb3VuZCh0aGlzLmxuZykgKyBcIiAoXCIgKyB0aGlzLnJhZGl1cyArIFwia20pXCI7XG4gIH07XG4gIFJhZGl1cy5wcm90b3R5cGUuZ2V0VXJsU3RyaW5nPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiBcIlwiICsgcm91bmQodGhpcy5sYXQpICsgXCItXCIgKyByb3VuZCh0aGlzLmxuZykgKyBcIi1cIiArIHRoaXMucmFkaXVzICsgXCJrbVwiO1xuICB9O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUmFkaXVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgbW9tZW50ID0gKHdpbmRvdy5tb21lbnQpO1xudmFyIGRlZXBtZXJnZSA9IHJlcXVpcmUoXCJkZWVwbWVyZ2VcIik7XG5cbnZhciB1cmxEYXRlRm9ybWF0ID0gXCJZWVlZLU1NLUREXCI7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL3RyLmpzJyk7XG5cbi8qXG5jbGFzcyBTZWFyY2hEYXRlXG5pdCBoYXMgc3RhdGUgZm9yIGFsbCBtb2RlcywgYnVkZSBmb3JcbiAgY29uc3RydWN0b3JcbiAgaW5wdXQgPSBwbGFpbiBvYmplY3Qgb3Igc3RyaW5nIG9yIGp1c3QgYW5vdGhlciBTZWFyY2hEYXRlIG9iamVjdFxuICovXG52YXIgU2VhcmNoRGF0ZSA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICB2YXIgcGxhaW4gPSB7fTtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSBcInN0cmluZ1wiKSB7XG4gICAgcGxhaW4gPSB0aGlzLnBhcnNlVXJsU3RyaW5nKGlucHV0KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gXCJvYmplY3RcIikge1xuICAgIHBsYWluID0gaW5wdXQ7XG4gIH1cbiAgdGhpcy5tb2RlID0gdHlwZW9mKHBsYWluLm1vZGUpICE9ICd1bmRlZmluZWQnID8gcGxhaW4ubW9kZSA6IFwic2luZ2xlXCI7XG4gIHRoaXMuZnJvbSA9IHR5cGVvZihwbGFpbi5mcm9tKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLmZyb20gOiBtb21lbnQudXRjKCk7XG4gIHRoaXMudG8gPSB0eXBlb2YocGxhaW4udG8pICE9ICd1bmRlZmluZWQnID8gcGxhaW4udG8gOiBtb21lbnQudXRjKCk7XG4gIHRoaXMubWluU3RheURheXMgPSB0eXBlb2YocGxhaW4ubWluU3RheURheXMpICE9ICd1bmRlZmluZWQnID8gcGxhaW4ubWluU3RheURheXMgOiAyO1xuICB0aGlzLm1heFN0YXlEYXlzID0gdHlwZW9mKHBsYWluLm1heFN0YXlEYXlzKSAhPSAndW5kZWZpbmVkJyA/IHBsYWluLm1heFN0YXlEYXlzIDogMTA7XG4gIHRoaXMuZmluYWwgPSB0eXBlb2YocGxhaW4uZmluYWwpICE9ICd1bmRlZmluZWQnPyBwbGFpbi5maW5hbCA6IHRydWU7XG4gIE9iamVjdC5mcmVlemUodGhpcyk7XG59O1xuXG4vKiBzZXRzIG1vZGUgd2l0aCBjaGVja2luZyBzb21lIGludGVybmFsIHZhbGlkaXR5ICovXG4vKiBidXQgcHJvYmFibHkgdmFsaXRpdHkgc2hvdWxkIGJlIGhhbmRsZWQgYnkgZ2V0dGVycywgYmVjYXVzZSBpdCBpcyBuaWNlIHRvIGhhdmUgaW50ZXJuYWwgc3RhdGUgZm9yIG90aGVycyBtb2RlcyB0aGFuIGVuYWJsZWQgKi9cblxuLy9TZWFyY2hEYXRlLnByb3RvdHlwZS5zZXRNb2RlID0gZnVuY3Rpb24obW9kZSkge1xuLy8gIHZhciBwcmV2aW91c01vZGUgPSB0aGlzLm1vZGU7XG4vLyAgaWYgKG1vZGUgPT0gXCJzaW5nbGVcIikge1xuLy8gICAgdGhpcy50byA9IHRoaXMuZnJvbTtcbi8vICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJhbnl0aW1lXCIpIHtcbi8vICAgIHRoaXMuZnJvbSA9IG1vbWVudC51dGMoKS5hZGQoMSwgXCJkYXlzXCIpO1xuLy8gICAgdGhpcy50byA9IG1vbWVudC51dGMoKS5hZGQoNiwgXCJtb250aHNcIik7XG4vLyAgfVxuLy8gIHRoaXMubW9kZSA9IG1vZGU7XG4vL307XG5cblxuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRNb2RlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm1vZGVcbn07XG5cblNlYXJjaERhdGUucHJvdG90eXBlLmdldEZyb20gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIiB8fCB0aGlzLm1vZGUgPT0gXCJub1JldHVyblwiKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAodGhpcy5tb2RlID09IFwiYW55dGltZVwiKSB7XG4gICAgcmV0dXJuIG1vbWVudC51dGMoKS5hZGQoMSxcImRheXNcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbVxuICB9XG59O1xuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5nZXRUbyA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5tb2RlID09IFwidGltZVRvU3RheVwiIHx8IHRoaXMubW9kZSA9PSBcIm5vUmV0dXJuXCIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgIHJldHVybiB0aGlzLmZyb21cbiAgfSBlbHNlIGlmICh0aGlzLm1vZGUgPT0gXCJhbnl0aW1lXCIpIHtcbiAgICByZXR1cm4gbW9tZW50LnV0YygpLmFkZCg2LFwibW9udGhzXCIpO1xuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLnRvKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1xuICAgIH0gZWxzZSB7XG4gICAgICAvL2p1c3QgZm9yIGNhc2VzIHdoZW4gdGhlIHZhbHVlIGlzIG5vdCBmaWxsZWQgKG5vdCBjb21wbGV0ZSBpbnRlcnZhbClcbiAgICAgIHJldHVybiB0aGlzLmZyb21cbiAgICB9XG4gIH1cbn07XG5cblNlYXJjaERhdGUucHJvdG90eXBlLmdldERhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubW9kZSA9PSBcInNpbmdsZVwiKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn07XG5cblNlYXJjaERhdGUucHJvdG90eXBlLmdldE1pblN0YXlEYXlzID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLm1vZGUgPT0gXCJ0aW1lVG9TdGF5XCIpIHtcbiAgICByZXR1cm4gdGhpcy5taW5TdGF5RGF5cztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuU2VhcmNoRGF0ZS5wcm90b3R5cGUuZ2V0TWF4U3RheURheXMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIikge1xuICAgIHJldHVybiB0aGlzLm1heFN0YXlEYXlzO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5TZWFyY2hEYXRlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLm1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgIHJldHVybiB0aGlzLmZyb20uZm9ybWF0KFwibFwiKVxuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcInRpbWVUb1N0YXlcIikge1xuICAgIHJldHVybiB0aGlzLm1pblN0YXlEYXlzKyBcIiAtIFwiICsgdGhpcy5tYXhTdGF5RGF5cyArIFwiIGRheXNcIlxuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcImludGVydmFsXCIgfHwgdGhpcy5tb2RlID09IFwibW9udGhcIikge1xuICAgIHZhciB0b0RhdGVTdHJpbmc7XG4gICAgaWYgKCF0aGlzLnRvKSB7XG4gICAgICB0b0RhdGVTdHJpbmcgPSBcIl9cIlxuICAgIH0gZWxzZSB7XG4gICAgICB0b0RhdGVTdHJpbmcgPSB0aGlzLnRvLmZvcm1hdChcImxcIilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZnJvbS5mb3JtYXQoXCJsXCIpICsgXCIgLSBcIiArIHRvRGF0ZVN0cmluZ1xuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcImFueXRpbWVcIikge1xuICAgIHJldHVybiB0cihcIkFueXRpbWVcIiwgXCJhbnl0aW1lXCIpO1xuICB9IGVsc2UgaWYgKHRoaXMubW9kZSA9PSBcIm5vUmV0dXJuXCIpIHtcbiAgICByZXR1cm4gdHIoXCJObyByZXR1cm5cIiwgXCJub19yZXR1cm5fbGFiZWxcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZVxuICB9XG59O1xuXG5cbi8qIHdhIHVybCAqL1xuU2VhcmNoRGF0ZS5wcm90b3R5cGUudG9VcmxTdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMubW9kZSArIFwiX1wiICsgdGhpcy5mcm9tLmZvcm1hdCh1cmxEYXRlRm9ybWF0KSArIFwiX1wiICsgdGhpcy50by5mb3JtYXQodXJsRGF0ZUZvcm1hdCk7XG59O1xuXG4vKlxuICBKdXN0IHBhcnNlIGl0LCByZXR1cm4gcGxhaW4gbWluaW1hbC9pbmNvbXBsZXRlIHZlcnNpb24gb2YgU2VhcmNoRGF0ZSBvYmplY3RcbiAqL1xuU2VhcmNoRGF0ZS5wcm90b3R5cGUucGFyc2VVcmxTdHJpbmcgPSBmdW5jdGlvbihzdHJpbmdEYXRlKSB7XG4gIGlmIChzdHJpbmdEYXRlLmluZGV4T2YoXCJfXCIpICE9PSAtMSkge1xuICAgIHZhciBzcGxpdCA9IHN0cmluZ0RhdGUuc3BsaXQoXCJfXCIpO1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlOiBzcGxpdFswXSxcbiAgICAgIGZyb206IG1vbWVudC51dGMoc3BsaXRbMV0sIHVybERhdGVGb3JtYXQpLFxuICAgICAgdG86IG1vbWVudC51dGMoc3BsaXRbMl0sIHVybERhdGVGb3JtYXQpXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgbW9kZTogXCJzaW5nbGVcIixcbiAgICAgIGZyb206IG1vbWVudC51dGMoc3RyaW5nRGF0ZSwgdXJsRGF0ZUZvcm1hdCksXG4gICAgICB0bzogbW9tZW50LnV0YyhzdHJpbmdEYXRlLCB1cmxEYXRlRm9ybWF0KVxuICAgIH07XG4gIH1cbn07XG5cblxuLy9UT0RPIG1vdmUgdGhpcyBtZXRob2QgdG8gcGFyZW50IG9iamVjdCBJbW11dGFibGVcbi8qKlxuICogcmV0dXJuIG5ldyBvYmplY3Qgd2l0aCBhZGRlZCBjaGFuZ2VzLCBpZiBubyBjaGFuZ2UgcmV0dXJuIHNhbWUgb2JqZWN0XG4gKiBAcGFyYW0gbmV3VmFsdWVzXG4gKiBAcmV0dXJucyB7U2VhcmNoRGF0ZX1cbiAqL1xuU2VhcmNoRGF0ZS5wcm90b3R5cGUuZWRpdCA9IGZ1bmN0aW9uKG5ld1ZhbHVlcyl7XG4gIGlmICghbmV3VmFsdWVzKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdmFyIGxlYXN0T25lRWRpdCA9IGZhbHNlO1xuICB2YXIgbmV3UGxhaW4gPSB7fTtcbiAgLy9BZGQgZnJvbSB0aGlzXG4gIE9iamVjdC5rZXlzKHRoaXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSAge1xuICAgIG5ld1BsYWluW2tleV0gPSB0aGlzW2tleV07XG4gIH0uYmluZCh0aGlzKSk7XG4gIC8vQWRkIGZyb20gbmV3XG4gIE9iamVjdC5rZXlzKG5ld1ZhbHVlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgaWYgKG5ld1BsYWluW2tleV0gIT09IG5ld1ZhbHVlc1trZXldKSB7XG4gICAgICBuZXdQbGFpbltrZXldID0gbmV3VmFsdWVzW2tleV07XG4gICAgICBsZWFzdE9uZUVkaXQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG4gIGlmIChsZWFzdE9uZUVkaXQpIHtcbiAgICByZXR1cm4gbmV3IFNlYXJjaERhdGUobmV3UGxhaW4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn07XG5cbi8qIGp1c3QgaGVscGVyIGZ1bmN0aW9uIGlmIGkgbW9kZSBpcyBub3Qgc2V0ICovXG5TZWFyY2hEYXRlLmd1ZXNzTW9kZUZyb21QbGFpbiA9IGZ1bmN0aW9uIChwbGFpbikge1xuICBpZiAocGxhaW4ubWluU3RheURheXMgJiYgcGxhaW4ubWF4U3RheURheXMpIHtcbiAgICByZXR1cm4gXCJ0aW1lVG9TdGF5XCI7XG4gIH0gZWxzZSBpZiAoIXBsYWluLmZyb20pIHtcbiAgICByZXR1cm4gXCJub1JldHVyblwiO1xuICB9IGVsc2UgaWYgKHBsYWluLmZyb20gPT0gcGxhaW4udG8pIHtcbiAgICByZXR1cm4gXCJzaW5nbGVcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCJpbnRlcnZhbFwiO1xuICB9XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoRGF0ZTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFNlYXJjaFBsYWNlID0gcmVxdWlyZSgnLi9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBTZWFyY2hEYXRlID0gcmVxdWlyZSgnLi9TZWFyY2hEYXRlLmpzeCcpO1xudmFyIERhdGVQYWlyVmFsaWRhdG9yID0gcmVxdWlyZSgnLi8uLi90b29scy9EYXRlUGFpclZhbGlkYXRvci5qc3gnKTtcblxudmFyIGRhdGVDb3JyZWN0b3IgPSB7fTtcbmRhdGVDb3JyZWN0b3IuY29ycmVjdCA9IGZ1bmN0aW9uIChkYXRhLCBkaXJlY3Rpb24pIHtcbiAgdmFyIGVycm9yID0gRGF0ZVBhaXJWYWxpZGF0b3IudmFsaWRhdGUoXG4gICAgZGF0YS5kYXRlRnJvbSxcbiAgICBkYXRhLmRhdGVUb1xuICApO1xuICBpZiAoZXJyb3IgPT0gXCJjcm9zc2VkRGF0ZXNcIikge1xuICAgIGlmIChkaXJlY3Rpb24gPT0gXCJkYXRlRnJvbVwiKSB7XG4gICAgICByZXR1cm4gZGF0YS5kYXRlVG8gPSBkYXRhLmRhdGVGcm9tO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IFwiZGF0ZVRvXCIpIHtcbiAgICAgIHJldHVybiBkYXRhLmRhdGVGcm9tID0gZGF0YS5kYXRlVG87XG4gICAgfVxuICB9XG4gIHJldHVybiBkYXRhO1xufTtcblxuXG5cbiAgZnVuY3Rpb24gU2VhcmNoRm9ybURhdGEoaW5wdXQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcGxhaW4gPSBpbnB1dCB8fCB7fTtcbiAgICB0aGlzLmRhdGVGcm9tID0gcGxhaW4uZGF0ZUZyb20gfHwgbmV3IFNlYXJjaERhdGUoKTtcbiAgICB0aGlzLmRhdGVUbyA9IHBsYWluLmRhdGVUbyB8fCBuZXcgU2VhcmNoRGF0ZSh7ZnJvbTogbW9tZW50KCkuYWRkKDEsIFwibW9udGhzXCIpfSk7XG4gICAgdGhpcy5vcmlnaW4gPSBwbGFpbi5vcmlnaW4gfHwgbmV3IFNlYXJjaFBsYWNlKFwiXCIsIHRydWUpO1xuICAgIHRoaXMuZGVzdGluYXRpb24gPSBwbGFpbi5kZXN0aW5hdGlvbiB8fCBuZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwiXCJ9LCB0cnVlKTtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgLyogaW1tdXRhYmxlICovXG4gIFNlYXJjaEZvcm1EYXRhLnByb3RvdHlwZS5jaGFuZ2VGaWVsZD1mdW5jdGlvbih0eXBlLCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBuZXdQbGFpbiA9IHtcbiAgICAgIGRhdGVGcm9tOiB0aGlzLmRhdGVGcm9tLFxuICAgICAgZGF0ZVRvOiB0aGlzLmRhdGVUbyxcbiAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICBkZXN0aW5hdGlvbjogdGhpcy5kZXN0aW5hdGlvblxuICAgIH07XG4gICAgbmV3UGxhaW5bdHlwZV0gPSB2YWx1ZTtcbiAgICBpZiAodHlwZSA9PSBcImRhdGVUb1wiIHx8IHR5cGUgPT0gXCJkYXRlRnJvbVwiKSB7XG4gICAgICBkYXRlQ29ycmVjdG9yLmNvcnJlY3QobmV3UGxhaW4sIHR5cGUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNlYXJjaEZvcm1EYXRhKG5ld1BsYWluKTtcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaEZvcm1EYXRhO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vUGxhY2UuanN4Jyk7XG52YXIgdHIgPSByZXF1aXJlKCcuLy4uL3RyLmpzJyk7XG52YXIgSW1tdXRhYmxlID0gcmVxdWlyZSgnLi9pbW11dGFibGUuanN4Jyk7XG5cbnZhciBkZWZhdWx0VmFsdWVzID0ge1xuICBtb2RlOiBcInRleHRcIiwgLyogbW9kZXM6IHRleHQsIHBsYWNlLCBhbnl3aGVyZSwgcmFkaXVzLCAuLi4gICEhIGl0IGlzIHNpbWlsYXIgYXMgbW9kZXMgaW4gcGxhY2VQaWNrZXIgYnV0IG5vdCBleGFjdGx5IHNhbWUgKi9cbiAgdmFsdWU6IFwiXCIsXG4gIGlzRGVmYXVsdDogZmFsc2UgLyogdGhpcyBpcyBzZXQgb25seSB3aGVuIHlvdSB3YW50IHRvIHVzZSB0ZXh0IGFzIHByZWRlZmluZWQgdmFsdWUgKi9cbn07XG5cbmZ1bmN0aW9uIG1ha2VQbGFpbihpbnB1dCkge1xuICB2YXIgcGxhaW4gPSB7fTtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAndW5kZWZpbmVkJykge1xuICAgIHBsYWluLm1vZGUgPSBcInRleHRcIjtcbiAgICBwbGFpbi52YWx1ZSA9IFwiXCI7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnKSB7XG4gICAgcGxhaW4ubW9kZSA9IFwidGV4dFwiO1xuICAgIHBsYWluLnZhbHVlID0gaW5wdXQ7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09IFwib2JqZWN0XCIpIHtcbiAgICBwbGFpbiA9IGlucHV0O1xuICB9XG4gIHJldHVybiBwbGFpblxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1vZGVzKGRhdGEpIHtcbiAgaWYgKGRhdGEubW9kZSA9PSBcInRleHRcIikge1xuICAgIGlmICh0eXBlb2YgZGF0YS52YWx1ZSAhPSBcInN0cmluZ1wiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3cm9uZyB0eXBlIG9mIHZhbHVlXCIpO1xuICAgIH1cbiAgfVxuICBpZiAoZGF0YS5tb2RlID09IFwicGxhY2VcIikge1xuICAgIGlmICggIShkYXRhLnZhbHVlIGluc3RhbmNlb2YgUGxhY2UpICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwid3JvbmcgdHlwZSBvZiB2YWx1ZVwiKTtcbiAgICB9XG4gIH1cbn1cblxuXG5mb3IodmFyIEltbXV0YWJsZV9fX19LZXkgaW4gSW1tdXRhYmxlKXtpZihJbW11dGFibGUuaGFzT3duUHJvcGVydHkoSW1tdXRhYmxlX19fX0tleSkpe1NlYXJjaFBsYWNlW0ltbXV0YWJsZV9fX19LZXldPUltbXV0YWJsZVtJbW11dGFibGVfX19fS2V5XTt9fXZhciBfX19fU3VwZXJQcm90b09mSW1tdXRhYmxlPUltbXV0YWJsZT09PW51bGw/bnVsbDpJbW11dGFibGUucHJvdG90eXBlO1NlYXJjaFBsYWNlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKF9fX19TdXBlclByb3RvT2ZJbW11dGFibGUpO1NlYXJjaFBsYWNlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1TZWFyY2hQbGFjZTtTZWFyY2hQbGFjZS5fX3N1cGVyQ29uc3RydWN0b3JfXz1JbW11dGFibGU7XG4gIGZ1bmN0aW9uIFNlYXJjaFBsYWNlKGlucHV0LCBpc0RlZmF1bHQpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcGxhaW4gPSBtYWtlUGxhaW4oaW5wdXQpO1xuICAgIHRoaXMubW9kZSA9IHBsYWluLm1vZGUgfHwgXCJ0ZXh0XCI7XG4gICAgdGhpcy5mb3JtTW9kZSA9IHBsYWluLmZvcm1Nb2RlIHx8IFwiYWxsXCI7XG4gICAgdGhpcy52YWx1ZSA9IHBsYWluLnZhbHVlIHx8IFwiXCI7XG4gICAgdGhpcy5pc0RlZmF1bHQgPSBwbGFpbi5pc0RlZmF1bHQgfHwgaXNEZWZhdWx0O1xuICAgIHRoaXMuZXJyb3IgPSBwbGFpbi5lcnJvciB8fCBcIlwiO1xuICAgIHRoaXMubG9hZGluZyA9IHBsYWluLmxvYWRpbmcgfHwgZmFsc2U7XG5cbiAgICB2YWxpZGF0ZU1vZGVzKHRoaXMpO1xuXG5cbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldE1vZGU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMubW9kZTtcbiAgfTtcblxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0VmFsdWU9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gIH07XG5cbiAgLyogc2hvd24gdGV4dCAqL1xuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0VGV4dD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbW9kZSA9IHRoaXMubW9kZTtcbiAgICBpZiAobW9kZSA9PSBcInRleHRcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiYW55d2hlcmVcIikge1xuICAgICAgcmV0dXJuIHRyKFwiQW55d2hlcmVcIixcImFueXdoZXJlXCIpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcInBsYWNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldE5hbWUoKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJyYWRpdXNcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0VGV4dCgpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImlkXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgfTtcblxuICAvKiBuYW1lIG9mIHBsYWNlICovXG4gIFNlYXJjaFBsYWNlLnByb3RvdHlwZS5nZXROYW1lPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIGNvbnNvbGUud2FybihcImdldE5hbWUgc2hvdWxkbid0IGJlIHVzZWRcIik7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VXJsU3RyaW5nKCk7XG4gIH07XG5cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldFVybFN0cmluZz1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbW9kZSA9IHRoaXMubW9kZTtcbiAgICBpZiAobW9kZSA9PSBcInRleHRcIikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwiYW55d2hlcmVcIikge1xuICAgICAgcmV0dXJuIFwiYW55d2hlcmVcIjtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJwbGFjZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZS5nZXROYW1lKCk7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicmFkaXVzXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlLmdldFVybFN0cmluZygpO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImlkXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBTZWFyY2hQbGFjZS5wcm90b3R5cGUuZ2V0SWQ9ZnVuY3Rpb24oKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIG1vZGUgPSB0aGlzLm1vZGU7XG4gICAgaWYgKG1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAobW9kZSA9PSBcImFueXdoZXJlXCIpIHtcbiAgICAgIHJldHVybiBcImFueXdoZXJlXCI7XG4gICAgfSBlbHNlIGlmIChtb2RlID09IFwicGxhY2VcIikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUuZ2V0SWQoKTtcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT0gXCJpZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmdldFBsYWNlPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIGlmICh0aGlzLmdldE1vZGUoKSA9PSBcInBsYWNlXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLy9UT0RPIG1vdmUgdGhpcyBtZXRob2QgdG8gcGFyZW50IG9iamVjdCBJbW11dGFibGVcbiAgLyoqXG4gICAqIHJldHVybiBuZXcgb2JqZWN0IHdpdGggYWRkZWQgY2hhbmdlcywgaWYgbm8gY2hhbmdlIHJldHVybiBzYW1lIG9iamVjdFxuICAgKiBAcGFyYW0gbmV3VmFsdWVzXG4gICAqIEByZXR1cm5zIHtTZWFyY2hEYXRlfVxuICAgKi9cbiAgU2VhcmNoUGxhY2UucHJvdG90eXBlLmVkaXQ9ZnVuY3Rpb24obmV3VmFsdWVzKXtcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAoIW5ld1ZhbHVlcykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBsZWFzdE9uZUVkaXQgPSBmYWxzZTtcbiAgICB2YXIgbmV3UGxhaW4gPSB7fTtcbiAgICAvL0FkZCBmcm9tIHRoaXNcbiAgICBPYmplY3Qua2V5cyh0aGlzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkgIHtcbiAgICAgIG5ld1BsYWluW2tleV0gPSB0aGlzW2tleV07XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICAvL0FkZCBmcm9tIG5ld1xuICAgIE9iamVjdC5rZXlzKG5ld1ZhbHVlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpICB7XG4gICAgICBpZiAobmV3UGxhaW5ba2V5XSAhPT0gbmV3VmFsdWVzW2tleV0pIHtcbiAgICAgICAgbmV3UGxhaW5ba2V5XSA9IG5ld1ZhbHVlc1trZXldO1xuICAgICAgICBsZWFzdE9uZUVkaXQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChsZWFzdE9uZUVkaXQpIHtcbiAgICAgIHJldHVybiBuZXcgU2VhcmNoUGxhY2UobmV3UGxhaW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgfTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoUGxhY2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gSW1tdXRhYmxlKCl7XCJ1c2Ugc3RyaWN0XCI7fVxuXG4gIC8vVE9ETyBtb3ZlIGl0IGhlcmUgZnJvbSBjaGlsZHJlbiwgZ29hbCBpcyB0byBoYXZlIGNvbW1vbiBpbnRlcmZhY2UgZm9yIGFsbCBvZiB0aGVtXG5cbiAgLyoqXG4gICAqIHJldHVybiBuZXcgb2JqZWN0IHdpdGggYWRkZWQgY2hhbmdlcywgaWYgbm8gY2hhbmdlIHJldHVybiBzYW1lIG9iamVjdFxuICAgKiBAcGFyYW0gbmV3VmFsdWVzXG4gICAqIEByZXR1cm5zIHtTZWFyY2hEYXRlfVxuICAgKi9cbiAgLy9lZGl0KG5ld1ZhbHVlcyl7XG4gIC8vICBpZiAoIW5ld1ZhbHVlcykge1xuICAvLyAgICByZXR1cm4gdGhpcztcbiAgLy8gIH1cbiAgLy8gIHZhciBsZWFzdE9uZUVkaXQgPSBmYWxzZTtcbiAgLy8gIHZhciBuZXdQbGFpbiA9IHt9O1xuICAvLyAgLy9BZGQgZnJvbSB0aGlzXG4gIC8vICBPYmplY3Qua2V5cyh0aGlzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgLy8gICAgbmV3UGxhaW5ba2V5XSA9IHRoaXNba2V5XTtcbiAgLy8gIH0pO1xuICAvLyAgLy9BZGQgZnJvbSBuZXdcbiAgLy8gIE9iamVjdC5rZXlzKG5ld1ZhbHVlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gIC8vICAgIGlmIChuZXdQbGFpbltrZXldICE9PSBuZXdWYWx1ZXNba2V5XSkge1xuICAvLyAgICAgIG5ld1BsYWluW2tleV0gPSBuZXdWYWx1ZXNba2V5XTtcbiAgLy8gICAgICBsZWFzdE9uZUVkaXQgPSB0cnVlO1xuICAvLyAgICB9XG4gIC8vICB9KTtcbiAgLy8gIGlmIChsZWFzdE9uZUVkaXQpIHtcbiAgLy8gICAgcmV0dXJuIG5ldyBTZWFyY2hEYXRlKG5ld1BsYWluKTtcbiAgLy8gIH0gZWxzZSB7XG4gIC8vICAgIHJldHVybiB0aGlzO1xuICAvLyAgfVxuICAvL1xuICAvL307XG4gIC8qKlxuICAgKiByZXR1cm4gZWRpdGVkIG9iamVjdFxuICAgKiBAcGFyYW0ga2V5XG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7U2VhcmNoRGF0ZX1cbiAgICovXG4gIEltbXV0YWJsZS5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbmV3UGxhaW4gPSB7fTtcbiAgICBuZXdQbGFpbltrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXMuZWRpdChuZXdQbGFpbilcbiAgfTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEltbXV0YWJsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIFNlYXJjaEZvcm0gPSByZXF1aXJlKCcuLy4uL1NlYXJjaEZvcm0vU2VhcmNoRm9ybS5qc3gnKTtcblxuLyoqXG4gKiBvcHRpb25zLmVsZW1lbnQgLSBlbGVtZW50IHRvIGJpbmQgd2hvbGUgc2VhcmNoIGZvcm1cbiAqIG9wdGlvbnMuZGVmYXVsdEFjdGl2ZSAtIG1vZGUgd2hpY2ggd2lsbCBiZSBhY3RpdmF0ZWQgb24gaW5pdCBvZiBjb21wb25lbnQgLSBkZWZhdWx0OiBcIm9yaWdpblwiLCBzZXQgbnVsbCB0byBkb24ndCBzaG93IGFueVxuICovXG5cbiAgZnVuY3Rpb24gU2VhcmNoRm9ybUFkYXB0ZXIob3B0aW9ucykge1widXNlIHN0cmljdFwiO1xuICAgIHZhciByb290ID0gUmVhY3QuY3JlYXRlRmFjdG9yeShTZWFyY2hGb3JtKTtcbiAgICB0aGlzLm1vZGFsQ29tcG9uZW50ID0gUmVhY3QucmVuZGVyKHJvb3QoKSwgb3B0aW9ucy5lbGVtZW50KTtcbiAgfVxuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoRm9ybUFkYXB0ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG52YXIgT3B0aW9ucyA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9PcHRpb25zLmpzeCcpO1xuXG5cbiAgZnVuY3Rpb24gT3B0aW9uc1N0b3JlKCkge1widXNlIHN0cmljdFwiO1xuICAgIHRoaXMuZXZlbnRzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuZGF0YSA9IG5ldyBPcHRpb25zKCk7XG4gIH1cbiAgT3B0aW9uc1N0b3JlLnByb3RvdHlwZS5zZXRWYWx1ZT1mdW5jdGlvbih2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuZGF0YSAhPSB2YWx1ZSkge1xuICAgICAgdGhpcy5kYXRhID0gdmFsdWU7XG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlZDtcbiAgfTtcbiAgT3B0aW9uc1N0b3JlLnByb3RvdHlwZS5zZXRPcHRpb249ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHJldHVybiB0aGlzLnNldFZhbHVlKHRoaXMuZGF0YS5zZXQoa2V5LCB2YWx1ZSkpO1xuICB9O1xuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBPcHRpb25zU3RvcmUoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbnZhciBTZWFyY2hGb3JtRGF0YSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hGb3JtRGF0YS5qc3gnKTtcbnZhciBTZWFyY2hQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9TZWFyY2hQbGFjZS5qc3gnKTtcbnZhciBQbGFjZSA9IHJlcXVpcmUoJy4vLi4vY29udGFpbmVycy9QbGFjZS5qc3gnKTtcbnZhciBRID0gcmVxdWlyZSgncScpO1xudmFyIFBsYWNlc0FQSSA9IHJlcXVpcmUoJy4vLi4vQVBJcy9QbGFjZXNBUElDYWNoZWQuanN4Jyk7XG52YXIgT3B0aW9uc1N0b3JlID0gcmVxdWlyZSgnLi9PcHRpb25zU3RvcmUuanN4Jyk7XG5cblxuXG5cbnZhciBnZXRGaXJzdEZyb21BcGkgPSBmdW5jdGlvbiAodGV4dCkge1xuICB2YXIgcGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSSh7bGFuZzogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTsvL1RPRE8gcHV0IGhlcmUgb3B0aW9uc1xuICByZXR1cm4gcGxhY2VzQVBJLmZpbmRCeU5hbWUodGV4dCkudGhlbihmdW5jdGlvbihwbGFjZXMpICB7XG4gICAgaWYgKHBsYWNlc1swXSkge1xuICAgICAgcmV0dXJuIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogbmV3IFBsYWNlKHBsYWNlc1swXSl9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJ0ZXh0XCIsIHZhbHVlOiB0ZXh0LCBlcnJvcjogXCJub3RGb3VuZFwifSk7XG4gICAgfVxuICB9KS5jYXRjaChmdW5jdGlvbihlcnIpICB7XG4gICAgY29uc29sZS5lcnJvcihlcnIpO1xuICB9KVxufTtcblxudmFyIGZpbmRCeUlkRnJvbUFwaSA9IGZ1bmN0aW9uIChpZCkge1xuICB2YXIgcGxhY2VzQVBJID0gbmV3IFBsYWNlc0FQSSh7bGFuZzogT3B0aW9uc1N0b3JlLmRhdGEubGFuZ3VhZ2V9KTsvL1RPRE8gcHV0IGhlcmUgb3B0aW9uc1xuICByZXR1cm4gcGxhY2VzQVBJLmZpbmRCeUlkKGlkKS50aGVuKGZ1bmN0aW9uKHBsYWNlKSAge1xuICAgIGlmIChwbGFjZSkge1xuICAgICAgcmV0dXJuIG5ldyBTZWFyY2hQbGFjZSh7bW9kZTogXCJwbGFjZVwiLCB2YWx1ZTogcGxhY2V9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9zd2l0Y2ggdG8gdGV4dCB3aGVuIGlkIG5vdCBmb3VuZD8/XG4gICAgICByZXR1cm4gbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInRleHRcIiwgdmFsdWU6IGlkLCBlcnJvcjogXCJub3RGb3VuZFwifSk7XG4gICAgfVxuICB9KS5jYXRjaChmdW5jdGlvbihlcnIpICB7XG4gICAgY29uc29sZS5lcnJvcihlcnIpO1xuICB9KVxufTtcblxuXG4vKiByZXR1cm5zIHByb21pc2UsIHByb21pc2UgcmVzb2x2ZXMgdHJ1ZSBpZiB0aGVyZSBpcyBuZXcgdmFsdWUgKi9cbnZhciBmZXRjaFBsYWNlID0gZnVuY3Rpb24oc2VhcmNoUGxhY2UpIHtcbiAgaWYgKHNlYXJjaFBsYWNlLm1vZGUgPT0gXCJwbGFjZVwiICYmIHNlYXJjaFBsYWNlLnZhbHVlLmNvbXBsZXRlKSB7XG4gICAgcmV0dXJuIGZhbHNlOyAvKiBkb24ndCBuZWVkIHRvIGFzeW5jIGxvYWQgKi9cbiAgfSBlbHNlIGlmIChzZWFyY2hQbGFjZS5tb2RlID09IFwicGxhY2VcIikge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9taXNlOiBmaW5kQnlJZEZyb21BcGkoc2VhcmNoUGxhY2UudmFsdWUuaWQpLnRoZW4oZnVuY3Rpb24obmV3U2VhcmNoUGxhY2UpICB7XG4gICAgICAgIHJldHVybiBuZXdTZWFyY2hQbGFjZS5zZXQoXCJmb3JtTW9kZVwiLCBzZWFyY2hQbGFjZS5mb3JtTW9kZSlcbiAgICAgIH0pLFxuICAgICAgdGVtcFZhbHVlOiBzZWFyY2hQbGFjZS5zZXQoXCJsb2FkaW5nXCIsIHRydWUpLy9uZXcgU2VhcmNoUGxhY2Uoe21vZGU6IFwicGxhY2VcIiwgdmFsdWU6IHNlYXJjaFBsYWNlLnZhbHVlLCBsb2FkaW5nOiB0cnVlfSlcbiAgICB9O1xuICB9IGVsc2UgaWYgKHNlYXJjaFBsYWNlLm1vZGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvbWlzZTogZ2V0Rmlyc3RGcm9tQXBpKHNlYXJjaFBsYWNlLnZhbHVlKS50aGVuKGZ1bmN0aW9uKG5ld1NlYXJjaFBsYWNlKSAge1xuICAgICAgICByZXR1cm4gbmV3U2VhcmNoUGxhY2Uuc2V0KFwiZm9ybU1vZGVcIiwgc2VhcmNoUGxhY2UuZm9ybU1vZGUpXG4gICAgICB9KSxcbiAgICAgIHRlbXBWYWx1ZTogc2VhcmNoUGxhY2Uuc2V0KFwibG9hZGluZ1wiLCB0cnVlKS8vbmV3IFNlYXJjaFBsYWNlKHttb2RlOiBcInRleHRcIiwgdmFsdWU6IHNlYXJjaFBsYWNlLnZhbHVlLCBsb2FkaW5nOiB0cnVlfSlcbiAgICB9O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblxuICBmdW5jdGlvbiBTZWFyY2hGb3JtU3RvcmUoKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdGhpcy5ldmVudHMgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5kYXRhID0gbmV3IFNlYXJjaEZvcm1EYXRhKCk7XG4gIH1cbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS5zZXRWYWx1ZT1mdW5jdGlvbih2YWx1ZSkge1widXNlIHN0cmljdFwiO1xuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuZGF0YSAhPSB2YWx1ZSkge1xuICAgICAgdGhpcy5kYXRhID0gdmFsdWU7XG4gICAgICB0aGlzLmV2ZW50cy5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlZDtcbiAgfTtcbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS5zZXRGaWVsZD1mdW5jdGlvbihmaWVsZE5hbWUsIHZhbHVlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgcmV0dXJuIHRoaXMuc2V0VmFsdWUodGhpcy5kYXRhLmNoYW5nZUZpZWxkKGZpZWxkTmFtZSwgdmFsdWUpKTtcbiAgfTtcblxuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLmNvbXBsZXRlRmllbGQ9ZnVuY3Rpb24oZmllbGROYW1lKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGZldGNoSW5mbyA9IGZldGNoUGxhY2UodGhpcy5kYXRhW2ZpZWxkTmFtZV0pO1xuICAgIGlmIChmZXRjaEluZm8pIHtcbiAgICAgIHZhciAkX18wPSAgIGZldGNoSW5mbyxwcm9taXNlPSRfXzAucHJvbWlzZSx0ZW1wVmFsdWU9JF9fMC50ZW1wVmFsdWU7XG4gICAgICB0aGlzLnNldEZpZWxkKGZpZWxkTmFtZSwgdGVtcFZhbHVlKTtcbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24oZmluYWxWYWx1ZSkgIHtcbiAgICAgICAgLyogb25seSBpZiBpdCdzIGlzIHN0aWxsIHNhbWUgdmFsdWUgYXMgYmVmb3JlLCBub3RoaW5nIG5ldyAqL1xuICAgICAgICBpZiAodGVtcFZhbHVlID09IHRoaXMuZGF0YVtmaWVsZE5hbWVdKSB7XG4gICAgICAgICAgdGhpcy5zZXRGaWVsZChmaWVsZE5hbWUsIGZpbmFsVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlOyAvL1RPRE8gZG9udCBrbm93IHdoYXQgdG8gcmV0dXJuPz8/XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgU2VhcmNoRm9ybVN0b3JlLnByb3RvdHlwZS50cmlnZ2VyU2VhcmNoPWZ1bmN0aW9uKCkge1widXNlIHN0cmljdFwiO1xuICAgIC8vVE9ETyBjaGVjayBpZiB0aGVyZSBpcyBldmVyeSBkYXRhIG9rXG4gICAgdGhpcy5ldmVudHMuZW1pdCgnc2VhcmNoJyk7XG4gIH07XG4gIC8qIGZldGNoIGRpcmVjdGlvbiBhbmQgcmV0dXJuIGRhdGEgd2l0aCB0ZW1wIHZhbHVlICovXG4gIFNlYXJjaEZvcm1TdG9yZS5wcm90b3R5cGUuZmV0Y2hEaXJlY3Rpb249ZnVuY3Rpb24oZGF0YSwgZGlyZWN0aW9uKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGZldGNoSW5mbyA9IGZldGNoUGxhY2UoZGF0YVtkaXJlY3Rpb25dKTtcbiAgICBpZiAoZmV0Y2hJbmZvKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBmZXRjaEluZm8ucHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSAge1xuICAgICAgICAgIHJldHVybiB7ZGlyZWN0aW9uOmRpcmVjdGlvbix2YWx1ZTp2YWx1ZX1cbiAgICAgICAgfSksXG4gICAgICAgIG5ld0RhdGE6IGRhdGEuY2hhbmdlRmllbGQoZGlyZWN0aW9uLCBmZXRjaEluZm8udGVtcFZhbHVlKVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuICBTZWFyY2hGb3JtU3RvcmUucHJvdG90eXBlLnNlYXJjaD1mdW5jdGlvbigpIHtcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICB2YXIgbmV3VGVtcERhdGEgPSB0aGlzLmRhdGE7XG4gICAgdmFyIG9yaWdpbkxvYWRpbmdJbmZvID0gdGhpcy5mZXRjaERpcmVjdGlvbihuZXdUZW1wRGF0YSwgXCJvcmlnaW5cIik7XG4gICAgaWYgKG9yaWdpbkxvYWRpbmdJbmZvKSB7XG4gICAgICBwcm9taXNlcy5wdXNoKG9yaWdpbkxvYWRpbmdJbmZvLnByb21pc2UpO1xuICAgICAgbmV3VGVtcERhdGEgPSBvcmlnaW5Mb2FkaW5nSW5mby5uZXdEYXRhO1xuICAgIH1cbiAgICB2YXIgZGVzdGluYXRpb25Mb2FkaW5nSW5mbyA9IHRoaXMuZmV0Y2hEaXJlY3Rpb24obmV3VGVtcERhdGEsIFwiZGVzdGluYXRpb25cIik7XG4gICAgaWYgKGRlc3RpbmF0aW9uTG9hZGluZ0luZm8pIHtcbiAgICAgIHByb21pc2VzLnB1c2goZGVzdGluYXRpb25Mb2FkaW5nSW5mby5wcm9taXNlKTtcbiAgICAgIG5ld1RlbXBEYXRhID0gZGVzdGluYXRpb25Mb2FkaW5nSW5mby5uZXdEYXRhO1xuICAgIH1cbiAgICAvKiBpZiBhbnkgb2YgdGhlc2UgbmVlZHMgbG9hZGluZyBzYXZlIHRlbXBvcmFyeSBvYmplY3RzICovXG4gICAgaWYgKG5ld1RlbXBEYXRhICE9IHRoaXMuZGF0YSkge1xuICAgICAgdGhpcy5zZXRWYWx1ZShuZXdUZW1wRGF0YSk7XG4gICAgfVxuXG5cbiAgICBpZiAocHJvbWlzZXMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGxhc3REYXRhID0gdGhpcy5kYXRhO1xuICAgICAgcmV0dXJuIFEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpICB7XG4gICAgICAgIGlmIChsYXN0RGF0YSAhPSB0aGlzLmRhdGEpIHJldHVybjsgLy9pZiBzb21lIG90aGVyIHNlYXJjaCBoYXMgb3V0cmFuIG1lXG4gICAgICAgIHZhciBuZXdEYXRhID0gdGhpcy5kYXRhO1xuICAgICAgICByZXN1bHRzLmZvckVhY2goZnVuY3Rpb24ocmVzdWx0KSAge1xuICAgICAgICAgIG5ld0RhdGEgPSBuZXdEYXRhLmNoYW5nZUZpZWxkKHJlc3VsdC5kaXJlY3Rpb24sIHJlc3VsdC52YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFZhbHVlKG5ld0RhdGEpO1xuICAgICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vVE9ETyBjaGVjayBpZiBpcyBub3QgbmVlZGVkIG5leHQgdGlja1xuICAgICAgdGhpcy50cmlnZ2VyU2VhcmNoKCk7XG5cbiAgICAgIC8vVE9ETyByZXR1cm4gc29tZSBwcm9taXNlPz9cbiAgICB9XG5cbiAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2VhcmNoRm9ybVN0b3JlKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy52YWxpZGF0ZSA9IGZ1bmN0aW9uKG91dGJvdW5kLCBpbmJvdW5kKSB7XG4gIGlmICghb3V0Ym91bmQpIHtcbiAgICByZXR1cm4gXCJvdXRib3VuZE5vdFNlbGVjdGVkXCJcbiAgfVxuICBpZiAoIWluYm91bmQpIHtcbiAgICByZXR1cm4gXCJpbmJvdW5kTm90U2VsZWN0ZWRcIlxuICB9XG5cbiAgaWYgKGluYm91bmQubW9kZSA9PSBcInNpbmdsZVwiICYmIG91dGJvdW5kLm1vZGUgPT0gXCJzaW5nbGVcIikge1xuICAgIGlmIChpbmJvdW5kLmdldERhdGUoKS5mb3JtYXQoXCJZWVlZTU1ERFwiKSA8IG91dGJvdW5kLmdldERhdGUoKS5mb3JtYXQoXCJZWVlZTU1ERFwiKSkge1xuICAgICAgcmV0dXJuIFwiY3Jvc3NlZERhdGVzXCJcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cbi8qICBHZW9kZXN5IHJlcHJlc2VudGF0aW9uIGNvbnZlcnNpb24gZnVuY3Rpb25zICAgICAgICAgICAgICAgICAgICAgICAoYykgQ2hyaXMgVmVuZXNzIDIwMDItMjAxNCAgKi9cbi8qICAgLSB3d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNSVQgTGljZW5jZSAgKi9cbi8qICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qICBTYW1wbGUgdXNhZ2U6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qICAgIHZhciBsYXQgPSBHZW8ucGFyc2VETVMoJzUxwrAgMjjigLIgNDAuMTLigLMgTicpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyogICAgdmFyIGxvbiA9IEdlby5wYXJzZURNUygnMDAwwrAgMDDigLIgMDUuMzHigLMgVycpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKGxhdCwgbG9uKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5cbi8qIGpzaGludCBub2RlOnRydWUgKi8vKiBnbG9iYWwgZGVmaW5lICovXG4ndXNlIHN0cmljdCc7XG5cblxuLyoqXG4gKiBUb29scyBmb3IgY29udmVydGluZyBiZXR3ZWVuIG51bWVyaWMgZGVncmVlcyBhbmQgZGVncmVlcyAvIG1pbnV0ZXMgLyBzZWNvbmRzLlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqL1xudmFyIEdlbyA9IHt9O1xuXG5cbi8vIG5vdGUgVW5pY29kZSBEZWdyZWUgPSBVKzAwQjAuIFByaW1lID0gVSsyMDMyLCBEb3VibGUgcHJpbWUgPSBVKzIwMzNcblxuXG4vKipcbiAqIFBhcnNlcyBzdHJpbmcgcmVwcmVzZW50aW5nIGRlZ3JlZXMvbWludXRlcy9zZWNvbmRzIGludG8gbnVtZXJpYyBkZWdyZWVzLlxuICpcbiAqIFRoaXMgaXMgdmVyeSBmbGV4aWJsZSBvbiBmb3JtYXRzLCBhbGxvd2luZyBzaWduZWQgZGVjaW1hbCBkZWdyZWVzLCBvciBkZWctbWluLXNlYyBvcHRpb25hbGx5XG4gKiBzdWZmaXhlZCBieSBjb21wYXNzIGRpcmVjdGlvbiAoTlNFVykuIEEgdmFyaWV0eSBvZiBzZXBhcmF0b3JzIGFyZSBhY2NlcHRlZCAoZWcgM8KwIDM34oCyIDA54oCzVykuXG4gKiBTZWNvbmRzIGFuZCBtaW51dGVzIG1heSBiZSBvbWl0dGVkLlxuICpcbiAqIEBwYXJhbSAgIHtzdHJpbmd8bnVtYmVyfSBkbXNTdHIgLSBEZWdyZWVzIG9yIGRlZy9taW4vc2VjIGluIHZhcmlldHkgb2YgZm9ybWF0cy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IERlZ3JlZXMgYXMgZGVjaW1hbCBudW1iZXIuXG4gKi9cbkdlby5wYXJzZURNUyA9IGZ1bmN0aW9uKGRtc1N0cikge1xuICAgIC8vIGNoZWNrIGZvciBzaWduZWQgZGVjaW1hbCBkZWdyZWVzIHdpdGhvdXQgTlNFVywgaWYgc28gcmV0dXJuIGl0IGRpcmVjdGx5XG4gICAgaWYgKHR5cGVvZiBkbXNTdHIgPT0gJ251bWJlcicgJiYgaXNGaW5pdGUoZG1zU3RyKSkgcmV0dXJuIE51bWJlcihkbXNTdHIpO1xuXG4gICAgLy8gc3RyaXAgb2ZmIGFueSBzaWduIG9yIGNvbXBhc3MgZGlyJ24gJiBzcGxpdCBvdXQgc2VwYXJhdGUgZC9tL3NcbiAgICB2YXIgZG1zID0gU3RyaW5nKGRtc1N0cikudHJpbSgpLnJlcGxhY2UoL14tLywnJykucmVwbGFjZSgvW05TRVddJC9pLCcnKS5zcGxpdCgvW14wLTkuLF0rLyk7XG4gICAgaWYgKGRtc1tkbXMubGVuZ3RoLTFdPT0nJykgZG1zLnNwbGljZShkbXMubGVuZ3RoLTEpOyAgLy8gZnJvbSB0cmFpbGluZyBzeW1ib2xcblxuICAgIGlmIChkbXMgPT0gJycpIHJldHVybiBOYU47XG5cbiAgICAvLyBhbmQgY29udmVydCB0byBkZWNpbWFsIGRlZ3JlZXMuLi5cbiAgICB2YXIgZGVnO1xuICAgIHN3aXRjaCAoZG1zLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDM6ICAvLyBpbnRlcnByZXQgMy1wYXJ0IHJlc3VsdCBhcyBkL20vc1xuICAgICAgICAgICAgZGVnID0gZG1zWzBdLzEgKyBkbXNbMV0vNjAgKyBkbXNbMl0vMzYwMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6ICAvLyBpbnRlcnByZXQgMi1wYXJ0IHJlc3VsdCBhcyBkL21cbiAgICAgICAgICAgIGRlZyA9IGRtc1swXS8xICsgZG1zWzFdLzYwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTogIC8vIGp1c3QgZCAocG9zc2libHkgZGVjaW1hbCkgb3Igbm9uLXNlcGFyYXRlZCBkZGRtbXNzXG4gICAgICAgICAgICBkZWcgPSBkbXNbMF07XG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgZml4ZWQtd2lkdGggdW5zZXBhcmF0ZWQgZm9ybWF0IGVnIDAwMzM3MDlXXG4gICAgICAgICAgICAvL2lmICgvW05TXS9pLnRlc3QoZG1zU3RyKSkgZGVnID0gJzAnICsgZGVnOyAgLy8gLSBub3JtYWxpc2UgTi9TIHRvIDMtZGlnaXQgZGVncmVlc1xuICAgICAgICAgICAgLy9pZiAoL1swLTldezd9Ly50ZXN0KGRlZykpIGRlZyA9IGRlZy5zbGljZSgwLDMpLzEgKyBkZWcuc2xpY2UoMyw1KS82MCArIGRlZy5zbGljZSg1KS8zNjAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgIH1cbiAgICBpZiAoL14tfFtXU10kL2kudGVzdChkbXNTdHIudHJpbSgpKSkgZGVnID0gLWRlZzsgLy8gdGFrZSAnLScsIHdlc3QgYW5kIHNvdXRoIGFzIC12ZVxuXG4gICAgcmV0dXJuIE51bWJlcihkZWcpO1xufTtcblxuXG4vKipcbiAqIENvbnZlcnRzIGRlY2ltYWwgZGVncmVlcyB0byBkZWcvbWluL3NlYyBmb3JtYXRcbiAqICAtIGRlZ3JlZSwgcHJpbWUsIGRvdWJsZS1wcmltZSBzeW1ib2xzIGFyZSBhZGRlZCwgYnV0IHNpZ24gaXMgZGlzY2FyZGVkLCB0aG91Z2ggbm8gY29tcGFzc1xuICogICAgZGlyZWN0aW9uIGlzIGFkZGVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkZWcgLSBEZWdyZWVzIHRvIGJlIGZvcm1hdHRlZCBhcyBzcGVjaWZpZWQuXG4gKiBAcGFyYW0gICB7c3RyaW5nfSBbZm9ybWF0PWRtc10gLSBSZXR1cm4gdmFsdWUgYXMgJ2QnLCAnZG0nLCAnZG1zJy5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IFtkcD0wfDJ8NF0gLSBOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gdXNlIOKAkyBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBEZWdyZWVzIGZvcm1hdHRlZCBhcyBkZWcvbWluL3NlY3MgYWNjb3JkaW5nIHRvIHNwZWNpZmllZCBmb3JtYXQuXG4gKi9cbkdlby50b0RNUyA9IGZ1bmN0aW9uKGRlZywgZm9ybWF0LCBkcCkge1xuICAgIGlmIChpc05hTihkZWcpKSByZXR1cm4gbnVsbDsgIC8vIGdpdmUgdXAgaGVyZSBpZiB3ZSBjYW4ndCBtYWtlIGEgbnVtYmVyIGZyb20gZGVnXG5cbiAgICAvLyBkZWZhdWx0IHZhbHVlc1xuICAgIGlmICh0eXBlb2YgZm9ybWF0ID09ICd1bmRlZmluZWQnKSBmb3JtYXQgPSAnZG1zJztcbiAgICBpZiAodHlwZW9mIGRwID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgICAgICAgICBjYXNlICdkJzogICBkcCA9IDQ7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZG0nOiAgZHAgPSAyOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Rtcyc6IGRwID0gMDsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiAgICBmb3JtYXQgPSAnZG1zJzsgZHAgPSAwOyAgLy8gYmUgZm9yZ2l2aW5nIG9uIGludmFsaWQgZm9ybWF0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWcgPSBNYXRoLmFicyhkZWcpOyAgLy8gKHVuc2lnbmVkIHJlc3VsdCByZWFkeSBmb3IgYXBwZW5kaW5nIGNvbXBhc3MgZGlyJ24pXG5cbiAgICB2YXIgZG1zLCBkLCBtLCBzO1xuICAgIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgICAgIGRlZmF1bHQ6IC8vIGludmFsaWQgZm9ybWF0IHNwZWMhXG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgZCA9IGRlZy50b0ZpeGVkKGRwKTsgICAgIC8vIHJvdW5kIGRlZ3JlZXNcbiAgICAgICAgICAgIGlmIChkPDEwMCkgZCA9ICcwJyArIGQ7ICAvLyBwYWQgd2l0aCBsZWFkaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMCkgZCA9ICcwJyArIGQ7XG4gICAgICAgICAgICBkbXMgPSBkICsgJ8KwJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkbSc6XG4gICAgICAgICAgICB2YXIgbWluID0gKGRlZyo2MCkudG9GaXhlZChkcCk7ICAvLyBjb252ZXJ0IGRlZ3JlZXMgdG8gbWludXRlcyAmIHJvdW5kXG4gICAgICAgICAgICBkID0gTWF0aC5mbG9vcihtaW4gLyA2MCk7ICAgIC8vIGdldCBjb21wb25lbnQgZGVnL21pblxuICAgICAgICAgICAgbSA9IChtaW4gJSA2MCkudG9GaXhlZChkcCk7ICAvLyBwYWQgd2l0aCB0cmFpbGluZyB6ZXJvc1xuICAgICAgICAgICAgaWYgKGQ8MTAwKSBkID0gJzAnICsgZDsgICAgICAgICAgLy8gcGFkIHdpdGggbGVhZGluZyB6ZXJvc1xuICAgICAgICAgICAgaWYgKGQ8MTApIGQgPSAnMCcgKyBkO1xuICAgICAgICAgICAgaWYgKG08MTApIG0gPSAnMCcgKyBtO1xuICAgICAgICAgICAgZG1zID0gZCArICfCsCcgKyBtICsgJ+KAsic7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG1zJzpcbiAgICAgICAgICAgIHZhciBzZWMgPSAoZGVnKjM2MDApLnRvRml4ZWQoZHApOyAgLy8gY29udmVydCBkZWdyZWVzIHRvIHNlY29uZHMgJiByb3VuZFxuICAgICAgICAgICAgZCA9IE1hdGguZmxvb3Ioc2VjIC8gMzYwMCk7ICAgIC8vIGdldCBjb21wb25lbnQgZGVnL21pbi9zZWNcbiAgICAgICAgICAgIG0gPSBNYXRoLmZsb29yKHNlYy82MCkgJSA2MDtcbiAgICAgICAgICAgIHMgPSAoc2VjICUgNjApLnRvRml4ZWQoZHApOyAgICAvLyBwYWQgd2l0aCB0cmFpbGluZyB6ZXJvc1xuICAgICAgICAgICAgaWYgKGQ8MTAwKSBkID0gJzAnICsgZDsgICAgICAgICAgICAvLyBwYWQgd2l0aCBsZWFkaW5nIHplcm9zXG4gICAgICAgICAgICBpZiAoZDwxMCkgZCA9ICcwJyArIGQ7XG4gICAgICAgICAgICBpZiAobTwxMCkgbSA9ICcwJyArIG07XG4gICAgICAgICAgICBpZiAoczwxMCkgcyA9ICcwJyArIHM7XG4gICAgICAgICAgICBkbXMgPSBkICsgJ8KwJyArIG0gKyAn4oCyJyArIHMgKyAn4oCzJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRtcztcbn07XG5cblxuLyoqXG4gKiBDb252ZXJ0cyBudW1lcmljIGRlZ3JlZXMgdG8gZGVnL21pbi9zZWMgbGF0aXR1ZGUgKDItZGlnaXQgZGVncmVlcywgc3VmZml4ZWQgd2l0aCBOL1MpLlxuICpcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRlZyAtIERlZ3JlZXMgdG8gYmUgZm9ybWF0dGVkIGFzIHNwZWNpZmllZC5cbiAqIEBwYXJhbSAgIHtzdHJpbmd9IFtmb3JtYXQ9ZG1zXSAtIFJldHVybiB2YWx1ZSBhcyAnZCcsICdkbScsICdkbXMnLlxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2Ug4oCTIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IERlZ3JlZXMgZm9ybWF0dGVkIGFzIGRlZy9taW4vc2VjcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWVkIGZvcm1hdC5cbiAqL1xuR2VvLnRvTGF0ID0gZnVuY3Rpb24oZGVnLCBmb3JtYXQsIGRwKSB7XG4gICAgdmFyIGxhdCA9IEdlby50b0RNUyhkZWcsIGZvcm1hdCwgZHApO1xuICAgIHJldHVybiBsYXQ9PT1udWxsID8gJ+KAkycgOiBsYXQuc2xpY2UoMSkgKyAoZGVnPDAgPyAnUycgOiAnTicpOyAgLy8ga25vY2sgb2ZmIGluaXRpYWwgJzAnIGZvciBsYXQhXG59O1xuXG5cbi8qKlxuICogQ29udmVydCBudW1lcmljIGRlZ3JlZXMgdG8gZGVnL21pbi9zZWMgbG9uZ2l0dWRlICgzLWRpZ2l0IGRlZ3JlZXMsIHN1ZmZpeGVkIHdpdGggRS9XKVxuICpcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRlZyAtIERlZ3JlZXMgdG8gYmUgZm9ybWF0dGVkIGFzIHNwZWNpZmllZC5cbiAqIEBwYXJhbSAgIHtzdHJpbmd9IFtmb3JtYXQ9ZG1zXSAtIFJldHVybiB2YWx1ZSBhcyAnZCcsICdkbScsICdkbXMnLlxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2Ug4oCTIGRlZmF1bHQgMCBmb3IgZG1zLCAyIGZvciBkbSwgNCBmb3IgZC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IERlZ3JlZXMgZm9ybWF0dGVkIGFzIGRlZy9taW4vc2VjcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWVkIGZvcm1hdC5cbiAqL1xuR2VvLnRvTG9uID0gZnVuY3Rpb24oZGVnLCBmb3JtYXQsIGRwKSB7XG4gICAgdmFyIGxvbiA9IEdlby50b0RNUyhkZWcsIGZvcm1hdCwgZHApO1xuICAgIHJldHVybiBsb249PT1udWxsID8gJ+KAkycgOiBsb24gKyAoZGVnPDAgPyAnVycgOiAnRScpO1xufTtcblxuXG4vKipcbiAqIENvbnZlcnRzIG51bWVyaWMgZGVncmVlcyB0byBkZWcvbWluL3NlYyBhcyBhIGJlYXJpbmcgKDDCsC4uMzYwwrApXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gZGVnIC0gRGVncmVlcyB0byBiZSBmb3JtYXR0ZWQgYXMgc3BlY2lmaWVkLlxuICogQHBhcmFtICAge3N0cmluZ30gW2Zvcm1hdD1kbXNdIC0gUmV0dXJuIHZhbHVlIGFzICdkJywgJ2RtJywgJ2RtcycuXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbZHA9MHwyfDRdIC0gTnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIHVzZSDigJMgZGVmYXVsdCAwIGZvciBkbXMsIDIgZm9yIGRtLCA0IGZvciBkLlxuICogQHJldHVybnMge3N0cmluZ30gRGVncmVlcyBmb3JtYXR0ZWQgYXMgZGVnL21pbi9zZWNzIGFjY29yZGluZyB0byBzcGVjaWZpZWQgZm9ybWF0LlxuICovXG5HZW8udG9Ccm5nID0gZnVuY3Rpb24oZGVnLCBmb3JtYXQsIGRwKSB7XG4gICAgZGVnID0gKE51bWJlcihkZWcpKzM2MCkgJSAzNjA7ICAvLyBub3JtYWxpc2UgLXZlIHZhbHVlcyB0byAxODDCsC4uMzYwwrBcbiAgICB2YXIgYnJuZyA9ICBHZW8udG9ETVMoZGVnLCBmb3JtYXQsIGRwKTtcbiAgICByZXR1cm4gYnJuZz09PW51bGwgPyAn4oCTJyA6IGJybmcucmVwbGFjZSgnMzYwJywgJzAnKTsgIC8vIGp1c3QgaW4gY2FzZSByb3VuZGluZyB0b29rIHVzIHVwIHRvIDM2MMKwIVxufTtcblxuXG4vKipcbiAqIFJldHVybnMgY29tcGFzcyBwb2ludCAodG8gZ2l2ZW4gcHJlY2lzaW9uKSBmb3Igc3VwcGxpZWQgYmVhcmluZy5cbiAqXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBiZWFyaW5nIC0gQmVhcmluZyBpbiBkZWdyZWVzIGZyb20gbm9ydGguXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBbcHJlY2lzaW9uPTNdIC0gUHJlY2lzaW9uIChjYXJkaW5hbCAvIGludGVyY2FyZGluYWwgLyBzZWNvbmRhcnktaW50ZXJjYXJkaW5hbCkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBDb21wYXNzIHBvaW50IGZvciBzdXBwbGllZCBiZWFyaW5nLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgIHZhciBwb2ludCA9IEdlby5jb21wYXNzUG9pbnQoMjQpOyAgICAvLyBwb2ludCA9ICdOTkUnXG4gKiAgIHZhciBwb2ludCA9IEdlby5jb21wYXNzUG9pbnQoMjQsIDEpOyAvLyBwb2ludCA9ICdOJ1xuICovXG5HZW8uY29tcGFzc1BvaW50ID0gZnVuY3Rpb24oYmVhcmluZywgcHJlY2lzaW9uKSB7XG4gICAgaWYgKHR5cGVvZiBwcmVjaXNpb24gPT0gJ3VuZGVmaW5lZCcpIHByZWNpc2lvbiA9IDM7XG4gICAgLy8gbm90ZSBwcmVjaXNpb24gPSBtYXggbGVuZ3RoIG9mIGNvbXBhc3MgcG9pbnQ7IGl0IGNvdWxkIGJlIGV4dGVuZGVkIHRvIDQgZm9yIHF1YXJ0ZXItd2luZHNcbiAgICAvLyAoZWcgTkViTiksIGJ1dCBJIHRoaW5rIHRoZXkgYXJlIGxpdHRsZSB1c2VkXG5cbiAgICBiZWFyaW5nID0gKChiZWFyaW5nJTM2MCkrMzYwKSUzNjA7IC8vIG5vcm1hbGlzZSB0byAwLi4zNjBcblxuICAgIHZhciBwb2ludDtcblxuICAgIHN3aXRjaCAocHJlY2lzaW9uKSB7XG4gICAgICAgIGNhc2UgMTogLy8gNCBjb21wYXNzIHBvaW50c1xuICAgICAgICAgICAgc3dpdGNoIChNYXRoLnJvdW5kKGJlYXJpbmcqNC8zNjApJTQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHBvaW50ID0gJ04nOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHBvaW50ID0gJ0UnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHBvaW50ID0gJ1MnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHBvaW50ID0gJ1cnOyBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6IC8vIDggY29tcGFzcyBwb2ludHNcbiAgICAgICAgICAgIHN3aXRjaCAoTWF0aC5yb3VuZChiZWFyaW5nKjgvMzYwKSU4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBwb2ludCA9ICdOJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcG9pbnQgPSAnTkUnOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHBvaW50ID0gJ0UnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOiBwb2ludCA9ICdTRSc7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogcG9pbnQgPSAnUyc7ICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDU6IHBvaW50ID0gJ1NXJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA2OiBwb2ludCA9ICdXJzsgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogcG9pbnQgPSAnTlcnOyBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6IC8vIDE2IGNvbXBhc3MgcG9pbnRzXG4gICAgICAgICAgICBzd2l0Y2ggKE1hdGgucm91bmQoYmVhcmluZyoxNi8zNjApJTE2KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAgMDogcG9pbnQgPSAnTic7ICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgMTogcG9pbnQgPSAnTk5FJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgMjogcG9pbnQgPSAnTkUnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgMzogcG9pbnQgPSAnRU5FJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgNDogcG9pbnQgPSAnRSc7ICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgNTogcG9pbnQgPSAnRVNFJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgNjogcG9pbnQgPSAnU0UnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgNzogcG9pbnQgPSAnU1NFJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgODogcG9pbnQgPSAnUyc7ICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAgOTogcG9pbnQgPSAnU1NXJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMDogcG9pbnQgPSAnU1cnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMTogcG9pbnQgPSAnV1NXJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMjogcG9pbnQgPSAnVyc7ICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxMzogcG9pbnQgPSAnV05XJzsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxNDogcG9pbnQgPSAnTlcnOyAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxNTogcG9pbnQgPSAnTk5XJzsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IFJhbmdlRXJyb3IoJ1ByZWNpc2lvbiBtdXN0IGJlIGJldHdlZW4gMSBhbmQgMycpO1xuICAgIH1cblxuICAgIHJldHVybiBwb2ludDtcbn1cblxuXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5cblxuLyoqIEV4dGVuZCBOdW1iZXIgb2JqZWN0IHdpdGggbWV0aG9kIHRvICB0cmltIHdoaXRlc3BhY2UgZnJvbSBzdHJpbmdcbiAqICAocS52LiBibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9mYXN0ZXItdHJpbS1qYXZhc2NyaXB0KSAqL1xuaWYgKHR5cGVvZiBTdHJpbmcucHJvdG90eXBlLnRyaW0gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBTdHJpbmcucHJvdG90eXBlLnRyaW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzKS5yZXBsYWNlKC9eXFxzXFxzKi8sICcnKS5yZXBsYWNlKC9cXHNcXHMqJC8sICcnKTtcbiAgICB9O1xufVxuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cbmlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IEdlbzsgLy8gQ29tbW9uSlNcbmlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIEdlbzsgfSk7IC8vIEFNRFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vL0VuaGFuY2VKUyBpc0lFIHRlc3QgaWRlYVxuXG4vL2RldGVjdCBJRSBhbmQgdmVyc2lvbiBudW1iZXIgdGhyb3VnaCBpbmplY3RlZCBjb25kaXRpb25hbCBjb21tZW50cyAobm8gVUEgZGV0ZWN0LCBubyBuZWVkIGZvciBjb25kLiBjb21waWxhdGlvbiAvIGpzY3JpcHQgY2hlY2spXG5cbi8vdmVyc2lvbiBhcmcgaXMgZm9yIElFIHZlcnNpb24gKG9wdGlvbmFsKVxuLy9jb21wYXJpc29uIGFyZyBzdXBwb3J0cyAnbHRlJywgJ2d0ZScsIGV0YyAob3B0aW9uYWwpXG5cbmZ1bmN0aW9uIGlzSUUodmVyc2lvbiwgY29tcGFyaXNvbikge1xuICB2YXIgY2MgICAgICA9ICdJRScsXG4gICAgYiAgICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0InKSxcbiAgICBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIGlzSUU7XG5cbiAgaWYodmVyc2lvbil7XG4gICAgY2MgKz0gJyAnICsgdmVyc2lvbjtcbiAgICBpZihjb21wYXJpc29uKXsgY2MgPSBjb21wYXJpc29uICsgJyAnICsgY2M7IH1cbiAgfVxuXG4gIGIuaW5uZXJIVE1MID0gJzwhLS1baWYgJysgY2MgKyddPjxiIGlkPVwiaWVjY3Rlc3RcIj48L2I+PCFbZW5kaWZdLS0+JztcbiAgZG9jRWxlbS5hcHBlbmRDaGlsZChiKTtcbiAgaXNJRSA9ICEhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2llY2N0ZXN0Jyk7XG4gIGRvY0VsZW0ucmVtb3ZlQ2hpbGQoYik7XG4gIHJldHVybiBpc0lFO1xufVxuXG4vLy8vaXMgaXQgSUU/XG4vL2lzSUUoKTtcbi8vXG4vLy8vaXMgaXQgSUU2P1xuLy9pc0lFKDYpO1xuLy9cbi8vLy9pcyBpdCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gSUUgNj9cbi8vaXNJRSg3LCdsdGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0lFO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG4vKiAgTGF0aXR1ZGUvbG9uZ2l0dWRlIHNwaGVyaWNhbCBnZW9kZXN5IGZvcm11bGFlICYgc2NyaXB0cyAgICAgICAgICAgKGMpIENocmlzIFZlbmVzcyAyMDAyLTIwMTQgICovXG4vKiAgIC0gd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL2xhdGxvbmcuaHRtbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlUIExpY2VuY2UgICovXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5cbi8qIGpzaGludCBub2RlOnRydWUgKi8vKiBnbG9iYWwgZGVmaW5lICovXG4ndXNlIHN0cmljdCc7XG5pZiAodHlwZW9mIG1vZHVsZSE9J3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHZhciBHZW8gPSByZXF1aXJlKCcuL2dlbycpOyAvLyBDb21tb25KUyAoTm9kZS5qcylcblxuXG4vKipcbiAqIENyZWF0ZXMgYSBMYXRMb24gcG9pbnQgb24gdGhlIGVhcnRoJ3Mgc3VyZmFjZSBhdCB0aGUgc3BlY2lmaWVkIGxhdGl0dWRlIC8gbG9uZ2l0dWRlLlxuICpcbiAqIEBjbGFzc2Rlc2MgVG9vbHMgZm9yIGdlb2RldGljIGNhbGN1bGF0aW9uc1xuICogQHJlcXVpcmVzIEdlb1xuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtudW1iZXJ9IGxhdCAtIExhdGl0dWRlIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gbG9uIC0gTG9uZ2l0dWRlIGluIGRlZ3JlZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodD0wXSAtIEhlaWdodCBhYm92ZSBtZWFuLXNlYS1sZXZlbCBpbiBraWxvbWV0cmVzLlxuICogQHBhcmFtIHtudW1iZXJ9IFtyYWRpdXM9NjM3MV0gLSAoTWVhbikgcmFkaXVzIG9mIGVhcnRoIGluIGtpbG9tZXRyZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpO1xuICovXG5mdW5jdGlvbiBMYXRMb24obGF0LCBsb24sIGhlaWdodCwgcmFkaXVzKSB7XG4gICAgLy8gYWxsb3cgaW5zdGFudGlhdGlvbiB3aXRob3V0ICduZXcnXG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIExhdExvbikpIHJldHVybiBuZXcgTGF0TG9uKGxhdCwgbG9uLCBoZWlnaHQsIHJhZGl1cyk7XG5cbiAgICBpZiAodHlwZW9mIGhlaWdodCA9PSAndW5kZWZpbmVkJykgaGVpZ2h0ID0gMDtcbiAgICBpZiAodHlwZW9mIHJhZGl1cyA9PSAndW5kZWZpbmVkJykgcmFkaXVzID0gNjM3MTtcbiAgICByYWRpdXMgPSBNYXRoLm1pbihNYXRoLm1heChyYWRpdXMsIDYzNTMpLCA2Mzg0KTtcblxuICAgIHRoaXMubGF0ICAgID0gTnVtYmVyKGxhdCk7XG4gICAgdGhpcy5sb24gICAgPSBOdW1iZXIobG9uKTtcbiAgICB0aGlzLmhlaWdodCA9IE51bWJlcihoZWlnaHQpO1xuICAgIHRoaXMucmFkaXVzID0gTnVtYmVyKHJhZGl1cyk7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludCAodXNpbmcgaGF2ZXJzaW5lIGZvcm11bGEpLlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxuICogQHJldHVybnMge251bWJlcn0gRGlzdGFuY2UgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCBkZXN0aW5hdGlvbiBwb2ludCwgaW4ga20gKG9uIHNwaGVyZSBvZiAndGhpcycgcmFkaXVzKS5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcbiAqICAgICB2YXIgZCA9IHAxLmRpc3RhbmNlVG8ocDIpOyAvLyBkLnRvUHJlY2lzaW9uKDQpOiA0MDQuM1xuICovXG5MYXRMb24ucHJvdG90eXBlLmRpc3RhbmNlVG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHZhciBSID0gdGhpcy5yYWRpdXM7XG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCAgzrsxID0gdGhpcy5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM+GMiA9IHBvaW50LmxhdC50b1JhZGlhbnMoKSwgzrsyID0gcG9pbnQubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDOlM+GID0gz4YyIC0gz4YxO1xuICAgIHZhciDOlM67ID0gzrsyIC0gzrsxO1xuXG4gICAgdmFyIGEgPSBNYXRoLnNpbijOlM+GLzIpICogTWF0aC5zaW4ozpTPhi8yKSArXG4gICAgICAgICAgICBNYXRoLmNvcyjPhjEpICogTWF0aC5jb3Moz4YyKSAqXG4gICAgICAgICAgICBNYXRoLnNpbijOlM67LzIpICogTWF0aC5zaW4ozpTOuy8yKTtcbiAgICB2YXIgYyA9IDIgKiBNYXRoLmF0YW4yKE1hdGguc3FydChhKSwgTWF0aC5zcXJ0KDEtYSkpO1xuICAgIHZhciBkID0gUiAqIGM7XG5cbiAgICByZXR1cm4gZDtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSAoaW5pdGlhbCkgYmVhcmluZyBmcm9tICd0aGlzJyBwb2ludCB0byBkZXN0aW5hdGlvbiBwb2ludC5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwb2ludCAtIExhdGl0dWRlL2xvbmdpdHVkZSBvZiBkZXN0aW5hdGlvbiBwb2ludC5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IEluaXRpYWwgYmVhcmluZyBpbiBkZWdyZWVzIGZyb20gbm9ydGguXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpLCBwMiA9IG5ldyBMYXRMb24oNDguODU3LCAyLjM1MSk7XG4gKiAgICAgdmFyIGIxID0gcDEuYmVhcmluZ1RvKHAyKTsgLy8gYjEudG9GaXhlZCgxKTogMTU2LjJcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5iZWFyaW5nVG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpO1xuICAgIHZhciDOlM67ID0gKHBvaW50Lmxvbi10aGlzLmxvbikudG9SYWRpYW5zKCk7XG5cbiAgICAvLyBzZWUgaHR0cDovL21hdGhmb3J1bS5vcmcvbGlicmFyeS9kcm1hdGgvdmlldy81NTQxNy5odG1sXG4gICAgdmFyIHkgPSBNYXRoLnNpbijOlM67KSAqIE1hdGguY29zKM+GMik7XG4gICAgdmFyIHggPSBNYXRoLmNvcyjPhjEpKk1hdGguc2luKM+GMikgLVxuICAgICAgICAgICAgTWF0aC5zaW4oz4YxKSpNYXRoLmNvcyjPhjIpKk1hdGguY29zKM6UzrspO1xuICAgIHZhciDOuCA9IE1hdGguYXRhbjIoeSwgeCk7XG5cbiAgICByZXR1cm4gKM64LnRvRGVncmVlcygpKzM2MCkgJSAzNjA7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyBmaW5hbCBiZWFyaW5nIGFycml2aW5nIGF0IGRlc3RpbmF0aW9uIGRlc3RpbmF0aW9uIHBvaW50IGZyb20gJ3RoaXMnIHBvaW50OyB0aGUgZmluYWwgYmVhcmluZ1xuICogd2lsbCBkaWZmZXIgZnJvbSB0aGUgaW5pdGlhbCBiZWFyaW5nIGJ5IHZhcnlpbmcgZGVncmVlcyBhY2NvcmRpbmcgdG8gZGlzdGFuY2UgYW5kIGxhdGl0dWRlLlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxuICogQHJldHVybnMge251bWJlcn0gRmluYWwgYmVhcmluZyBpbiBkZWdyZWVzIGZyb20gbm9ydGguXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUyLjIwNSwgMC4xMTkpLCBwMiA9IG5ldyBMYXRMb24oNDguODU3LCAyLjM1MSk7XG4gKiAgICAgdmFyIGIyID0gcDEuZmluYWxCZWFyaW5nVG8ocDIpOyAvLyBwMi50b0ZpeGVkKDEpOiAxNTcuOVxuICovXG5MYXRMb24ucHJvdG90eXBlLmZpbmFsQmVhcmluZ1RvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAvLyBnZXQgaW5pdGlhbCBiZWFyaW5nIGZyb20gZGVzdGluYXRpb24gcG9pbnQgdG8gdGhpcyBwb2ludCAmIHJldmVyc2UgaXQgYnkgYWRkaW5nIDE4MMKwXG4gICAgcmV0dXJuICggcG9pbnQuYmVhcmluZ1RvKHRoaXMpKzE4MCApICUgMzYwO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pZHBvaW50IGJldHdlZW4gJ3RoaXMnIHBvaW50IGFuZCB0aGUgc3VwcGxpZWQgcG9pbnQuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2YgZGVzdGluYXRpb24gcG9pbnQuXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBNaWRwb2ludCBiZXR3ZWVuIHRoaXMgcG9pbnQgYW5kIHRoZSBzdXBwbGllZCBwb2ludC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTIuMjA1LCAwLjExOSksIHAyID0gbmV3IExhdExvbig0OC44NTcsIDIuMzUxKTtcbiAqICAgICB2YXIgcE1pZCA9IHAxLm1pZHBvaW50VG8ocDIpOyAvLyBwTWlkLnRvU3RyaW5nKCk6IDUwLjUzNjPCsE4sIDAwMS4yNzQ2wrBFXG4gKi9cbkxhdExvbi5wcm90b3R5cGUubWlkcG9pbnRUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgLy8gc2VlIGh0dHA6Ly9tYXRoZm9ydW0ub3JnL2xpYnJhcnkvZHJtYXRoL3ZpZXcvNTE4MjIuaHRtbCBmb3IgZGVyaXZhdGlvblxuXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpO1xuICAgIHZhciDOlM67ID0gKHBvaW50Lmxvbi10aGlzLmxvbikudG9SYWRpYW5zKCk7XG5cbiAgICB2YXIgQnggPSBNYXRoLmNvcyjPhjIpICogTWF0aC5jb3MozpTOuyk7XG4gICAgdmFyIEJ5ID0gTWF0aC5jb3Moz4YyKSAqIE1hdGguc2luKM6UzrspO1xuXG4gICAgdmFyIM+GMyA9IE1hdGguYXRhbjIoTWF0aC5zaW4oz4YxKStNYXRoLnNpbijPhjIpLFxuICAgICAgICAgICAgIE1hdGguc3FydCggKE1hdGguY29zKM+GMSkrQngpKihNYXRoLmNvcyjPhjEpK0J4KSArIEJ5KkJ5KSApO1xuICAgIHZhciDOuzMgPSDOuzEgKyBNYXRoLmF0YW4yKEJ5LCBNYXRoLmNvcyjPhjEpICsgQngpO1xuICAgIM67MyA9ICjOuzMrMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxuXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YzLnRvRGVncmVlcygpLCDOuzMudG9EZWdyZWVzKCkpO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRlc3RpbmF0aW9uIHBvaW50IGZyb20gJ3RoaXMnIHBvaW50IGhhdmluZyB0cmF2ZWxsZWQgdGhlIGdpdmVuIGRpc3RhbmNlIG9uIHRoZVxuICogZ2l2ZW4gaW5pdGlhbCBiZWFyaW5nIChiZWFyaW5nIG5vcm1hbGx5IHZhcmllcyBhcm91bmQgcGF0aCBmb2xsb3dlZCkuXG4gKlxuICogQHBhcmFtICAge251bWJlcn0gYnJuZyAtIEluaXRpYWwgYmVhcmluZyBpbiBkZWdyZWVzLlxuICogQHBhcmFtICAge251bWJlcn0gZGlzdCAtIERpc3RhbmNlIGluIGttIChvbiBzcGhlcmUgb2YgJ3RoaXMnIHJhZGl1cykuXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBEZXN0aW5hdGlvbiBwb2ludC5cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBwMSA9IG5ldyBMYXRMb24oNTEuNDc3OCwgLTAuMDAxNSk7XG4gKiAgICAgdmFyIHAyID0gcDEuZGVzdGluYXRpb25Qb2ludCgzMDAuNywgNy43OTQpOyAvLyBwMi50b1N0cmluZygpOiA1MS41MTM1wrBOLCAwMDAuMDk4M8KwV1xuICovXG5MYXRMb24ucHJvdG90eXBlLmRlc3RpbmF0aW9uUG9pbnQgPSBmdW5jdGlvbihicm5nLCBkaXN0KSB7XG4gICAgLy8gc2VlIGh0dHA6Ly93aWxsaWFtcy5iZXN0LnZ3aC5uZXQvYXZmb3JtLmh0bSNMTFxuXG4gICAgdmFyIM64ID0gTnVtYmVyKGJybmcpLnRvUmFkaWFucygpO1xuICAgIHZhciDOtCA9IE51bWJlcihkaXN0KSAvIHRoaXMucmFkaXVzOyAvLyBhbmd1bGFyIGRpc3RhbmNlIGluIHJhZGlhbnNcblxuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKTtcbiAgICB2YXIgzrsxID0gdGhpcy5sb24udG9SYWRpYW5zKCk7XG5cbiAgICB2YXIgz4YyID0gTWF0aC5hc2luKCBNYXRoLnNpbijPhjEpKk1hdGguY29zKM60KSArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjPhjEpKk1hdGguc2luKM60KSpNYXRoLmNvcyjOuCkgKTtcbiAgICB2YXIgzrsyID0gzrsxICsgTWF0aC5hdGFuMihNYXRoLnNpbijOuCkqTWF0aC5zaW4ozrQpKk1hdGguY29zKM+GMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKM60KS1NYXRoLnNpbijPhjEpKk1hdGguc2luKM+GMikpO1xuICAgIM67MiA9ICjOuzIrMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxuXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YyLnRvRGVncmVlcygpLCDOuzIudG9EZWdyZWVzKCkpO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBvaW50IG9mIGludGVyc2VjdGlvbiBvZiB0d28gcGF0aHMgZGVmaW5lZCBieSBwb2ludCBhbmQgYmVhcmluZy5cbiAqXG4gKiBAcGFyYW0gICB7TGF0TG9ufSBwMSAtIEZpcnN0IHBvaW50LlxuICogQHBhcmFtICAge251bWJlcn0gYnJuZzEgLSBJbml0aWFsIGJlYXJpbmcgZnJvbSBmaXJzdCBwb2ludC5cbiAqIEBwYXJhbSAgIHtMYXRMb259IHAyIC0gU2Vjb25kIHBvaW50LlxuICogQHBhcmFtICAge251bWJlcn0gYnJuZzIgLSBJbml0aWFsIGJlYXJpbmcgZnJvbSBzZWNvbmQgcG9pbnQuXG4gKiBAcmV0dXJucyB7TGF0TG9ufSBEZXN0aW5hdGlvbiBwb2ludCAobnVsbCBpZiBubyB1bmlxdWUgaW50ZXJzZWN0aW9uIGRlZmluZWQpLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gTGF0TG9uKDUxLjg4NTMsIDAuMjU0NSksIGJybmcxID0gMTA4LjU0NztcbiAqICAgICB2YXIgcDIgPSBMYXRMb24oNDkuMDAzNCwgMi41NzM1KSwgYnJuZzIgPSAgMzIuNDM1O1xuICogICAgIHZhciBwSW50ID0gTGF0TG9uLmludGVyc2VjdGlvbihwMSwgYnJuZzEsIHAyLCBicm5nMik7IC8vIHBJbnQudG9TdHJpbmcoKTogNTAuOTA3NsKwTiwgMDA0LjUwODTCsEVcbiAqL1xuTGF0TG9uLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKHAxLCBicm5nMSwgcDIsIGJybmcyKSB7XG4gICAgLy8gc2VlIGh0dHA6Ly93aWxsaWFtcy5iZXN0LnZ3aC5uZXQvYXZmb3JtLmh0bSNJbnRlcnNlY3Rpb25cblxuICAgIHZhciDPhjEgPSBwMS5sYXQudG9SYWRpYW5zKCksIM67MSA9IHAxLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgz4YyID0gcDIubGF0LnRvUmFkaWFucygpLCDOuzIgPSBwMi5sb24udG9SYWRpYW5zKCk7XG4gICAgdmFyIM64MTMgPSBOdW1iZXIoYnJuZzEpLnRvUmFkaWFucygpLCDOuDIzID0gTnVtYmVyKGJybmcyKS50b1JhZGlhbnMoKTtcbiAgICB2YXIgzpTPhiA9IM+GMi3PhjEsIM6UzrsgPSDOuzItzrsxO1xuXG4gICAgdmFyIM60MTIgPSAyKk1hdGguYXNpbiggTWF0aC5zcXJ0KCBNYXRoLnNpbijOlM+GLzIpKk1hdGguc2luKM6Uz4YvMikgK1xuICAgICAgICBNYXRoLmNvcyjPhjEpKk1hdGguY29zKM+GMikqTWF0aC5zaW4ozpTOuy8yKSpNYXRoLnNpbijOlM67LzIpICkgKTtcbiAgICBpZiAozrQxMiA9PSAwKSByZXR1cm4gbnVsbDtcblxuICAgIC8vIGluaXRpYWwvZmluYWwgYmVhcmluZ3MgYmV0d2VlbiBwb2ludHNcbiAgICB2YXIgzrgxID0gTWF0aC5hY29zKCAoIE1hdGguc2luKM+GMikgLSBNYXRoLnNpbijPhjEpKk1hdGguY29zKM60MTIpICkgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKCBNYXRoLnNpbijOtDEyKSpNYXRoLmNvcyjPhjEpICkgKTtcbiAgICBpZiAoaXNOYU4ozrgxKSkgzrgxID0gMDsgLy8gcHJvdGVjdCBhZ2FpbnN0IHJvdW5kaW5nXG4gICAgdmFyIM64MiA9IE1hdGguYWNvcyggKCBNYXRoLnNpbijPhjEpIC0gTWF0aC5zaW4oz4YyKSpNYXRoLmNvcyjOtDEyKSApIC9cbiAgICAgICAgICAgICAgICAgICAgICAgICggTWF0aC5zaW4ozrQxMikqTWF0aC5jb3Moz4YyKSApICk7XG5cbiAgICB2YXIgzrgxMiwgzrgyMTtcbiAgICBpZiAoTWF0aC5zaW4ozrsyLc67MSkgPiAwKSB7XG4gICAgICAgIM64MTIgPSDOuDE7XG4gICAgICAgIM64MjEgPSAyKk1hdGguUEkgLSDOuDI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgzrgxMiA9IDIqTWF0aC5QSSAtIM64MTtcbiAgICAgICAgzrgyMSA9IM64MjtcbiAgICB9XG5cbiAgICB2YXIgzrExID0gKM64MTMgLSDOuDEyICsgTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIGFuZ2xlIDItMS0zXG4gICAgdmFyIM6xMiA9ICjOuDIxIC0gzrgyMyArIE1hdGguUEkpICUgKDIqTWF0aC5QSSkgLSBNYXRoLlBJOyAvLyBhbmdsZSAxLTItM1xuXG4gICAgaWYgKE1hdGguc2luKM6xMSk9PTAgJiYgTWF0aC5zaW4ozrEyKT09MCkgcmV0dXJuIG51bGw7IC8vIGluZmluaXRlIGludGVyc2VjdGlvbnNcbiAgICBpZiAoTWF0aC5zaW4ozrExKSpNYXRoLnNpbijOsTIpIDwgMCkgcmV0dXJuIG51bGw7ICAgICAgLy8gYW1iaWd1b3VzIGludGVyc2VjdGlvblxuXG4gICAgLy/OsTEgPSBNYXRoLmFicyjOsTEpO1xuICAgIC8vzrEyID0gTWF0aC5hYnMozrEyKTtcbiAgICAvLyAuLi4gRWQgV2lsbGlhbXMgdGFrZXMgYWJzIG9mIM6xMS/OsTIsIGJ1dCBzZWVtcyB0byBicmVhayBjYWxjdWxhdGlvbj9cblxuICAgIHZhciDOsTMgPSBNYXRoLmFjb3MoIC1NYXRoLmNvcyjOsTEpKk1hdGguY29zKM6xMikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguc2luKM6xMSkqTWF0aC5zaW4ozrEyKSpNYXRoLmNvcyjOtDEyKSApO1xuICAgIHZhciDOtDEzID0gTWF0aC5hdGFuMiggTWF0aC5zaW4ozrQxMikqTWF0aC5zaW4ozrExKSpNYXRoLnNpbijOsTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyjOsTIpK01hdGguY29zKM6xMSkqTWF0aC5jb3MozrEzKSApO1xuICAgIHZhciDPhjMgPSBNYXRoLmFzaW4oIE1hdGguc2luKM+GMSkqTWF0aC5jb3MozrQxMykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3Moz4YxKSpNYXRoLnNpbijOtDEzKSpNYXRoLmNvcyjOuDEzKSApO1xuICAgIHZhciDOlM67MTMgPSBNYXRoLmF0YW4yKCBNYXRoLnNpbijOuDEzKSpNYXRoLnNpbijOtDEzKSpNYXRoLmNvcyjPhjEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jb3MozrQxMyktTWF0aC5zaW4oz4YxKSpNYXRoLnNpbijPhjMpICk7XG4gICAgdmFyIM67MyA9IM67MSArIM6UzrsxMztcbiAgICDOuzMgPSAozrszKzMqTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIG5vcm1hbGlzZSB0byAtMTgwLi4rMTgwwrBcblxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMy50b0RlZ3JlZXMoKSwgzrszLnRvRGVncmVlcygpKTtcbn07XG5cblxuLyogLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtICAqL1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGRpc3RhbmNlIHRyYXZlbGxpbmcgZnJvbSAndGhpcycgcG9pbnQgdG8gZGVzdGluYXRpb24gcG9pbnQgYWxvbmcgYSByaHVtYiBsaW5lLlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxuICogQHJldHVybnMge251bWJlcn0gRGlzdGFuY2UgaW4ga20gYmV0d2VlbiB0aGlzIHBvaW50IGFuZCBkZXN0aW5hdGlvbiBwb2ludCAob24gc3BoZXJlIG9mICd0aGlzJyByYWRpdXMpLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIHAxID0gbmV3IExhdExvbig1MS4xMjcsIDEuMzM4KSwgcDIgPSBuZXcgTGF0TG9uKDUwLjk2NCwgMS44NTMpO1xuICogICAgIHZhciBkID0gcDEuZGlzdGFuY2VUbyhwMik7IC8vIGQudG9QcmVjaXNpb24oNCk6IDQwLjMxXG4gKi9cbkxhdExvbi5wcm90b3R5cGUucmh1bWJEaXN0YW5jZVRvID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAvLyBzZWUgaHR0cDovL3dpbGxpYW1zLmJlc3QudndoLm5ldC9hdmZvcm0uaHRtI1JodW1iXG5cbiAgICB2YXIgUiA9IHRoaXMucmFkaXVzO1xuICAgIHZhciDPhjEgPSB0aGlzLmxhdC50b1JhZGlhbnMoKSwgz4YyID0gcG9pbnQubGF0LnRvUmFkaWFucygpO1xuICAgIHZhciDOlM+GID0gz4YyIC0gz4YxO1xuICAgIHZhciDOlM67ID0gTWF0aC5hYnMocG9pbnQubG9uLXRoaXMubG9uKS50b1JhZGlhbnMoKTtcbiAgICAvLyBpZiBkTG9uIG92ZXIgMTgwwrAgdGFrZSBzaG9ydGVyIHJodW1iIGxpbmUgYWNyb3NzIHRoZSBhbnRpLW1lcmlkaWFuOlxuICAgIGlmIChNYXRoLmFicyjOlM67KSA+IE1hdGguUEkpIM6UzrsgPSDOlM67PjAgPyAtKDIqTWF0aC5QSS3OlM67KSA6ICgyKk1hdGguUEkrzpTOuyk7XG5cbiAgICAvLyBvbiBNZXJjYXRvciBwcm9qZWN0aW9uLCBsb25naXR1ZGUgZGlzdGFuY2VzIHNocmluayBieSBsYXRpdHVkZTsgcSBpcyB0aGUgJ3N0cmV0Y2ggZmFjdG9yJ1xuICAgIC8vIHEgYmVjb21lcyBpbGwtY29uZGl0aW9uZWQgYWxvbmcgRS1XIGxpbmUgKDAvMCk7IHVzZSBlbXBpcmljYWwgdG9sZXJhbmNlIHRvIGF2b2lkIGl0XG4gICAgdmFyIM6Uz4ggPSBNYXRoLmxvZyhNYXRoLnRhbijPhjIvMitNYXRoLlBJLzQpL01hdGgudGFuKM+GMS8yK01hdGguUEkvNCkpO1xuICAgIHZhciBxID0gTWF0aC5hYnMozpTPiCkgPiAxMGUtMTIgPyDOlM+GL86Uz4ggOiBNYXRoLmNvcyjPhjEpO1xuXG4gICAgLy8gZGlzdGFuY2UgaXMgcHl0aGFnb3JhcyBvbiAnc3RyZXRjaGVkJyBNZXJjYXRvciBwcm9qZWN0aW9uXG4gICAgdmFyIM60ID0gTWF0aC5zcXJ0KM6Uz4YqzpTPhiArIHEqcSrOlM67Ks6UzrspOyAvLyBhbmd1bGFyIGRpc3RhbmNlIGluIHJhZGlhbnNcbiAgICB2YXIgZGlzdCA9IM60ICogUjtcblxuICAgIHJldHVybiBkaXN0O1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGJlYXJpbmcgZnJvbSAndGhpcycgcG9pbnQgdG8gZGVzdGluYXRpb24gcG9pbnQgYWxvbmcgYSByaHVtYiBsaW5lLlxuICpcbiAqIEBwYXJhbSAgIHtMYXRMb259IHBvaW50IC0gTGF0aXR1ZGUvbG9uZ2l0dWRlIG9mIGRlc3RpbmF0aW9uIHBvaW50LlxuICogQHJldHVybnMge251bWJlcn0gQmVhcmluZyBpbiBkZWdyZWVzIGZyb20gbm9ydGguXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUxLjEyNywgMS4zMzgpLCBwMiA9IG5ldyBMYXRMb24oNTAuOTY0LCAxLjg1Myk7XG4gKiAgICAgdmFyIGQgPSBwMS5yaHVtYkJlYXJpbmdUbyhwMik7IC8vIGQudG9GaXhlZCgxKTogMTE2LjdcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5yaHVtYkJlYXJpbmdUbyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCk7XG4gICAgdmFyIM6UzrsgPSAocG9pbnQubG9uLXRoaXMubG9uKS50b1JhZGlhbnMoKTtcbiAgICAvLyBpZiBkTG9uIG92ZXIgMTgwwrAgdGFrZSBzaG9ydGVyIHJodW1iIGxpbmUgYWNyb3NzIHRoZSBhbnRpLW1lcmlkaWFuOlxuICAgIGlmIChNYXRoLmFicyjOlM67KSA+IE1hdGguUEkpIM6UzrsgPSDOlM67PjAgPyAtKDIqTWF0aC5QSS3OlM67KSA6ICgyKk1hdGguUEkrzpTOuyk7XG5cbiAgICB2YXIgzpTPiCA9IE1hdGgubG9nKE1hdGgudGFuKM+GMi8yK01hdGguUEkvNCkvTWF0aC50YW4oz4YxLzIrTWF0aC5QSS80KSk7XG5cbiAgICB2YXIgzrggPSBNYXRoLmF0YW4yKM6UzrssIM6Uz4gpO1xuXG4gICAgcmV0dXJuICjOuC50b0RlZ3JlZXMoKSszNjApICUgMzYwO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRlc3RpbmF0aW9uIHBvaW50IGhhdmluZyB0cmF2ZWxsZWQgYWxvbmcgYSByaHVtYiBsaW5lIGZyb20gJ3RoaXMnIHBvaW50IHRoZSBnaXZlblxuICogZGlzdGFuY2Ugb24gdGhlICBnaXZlbiBiZWFyaW5nLlxuICpcbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGJybmcgLSBCZWFyaW5nIGluIGRlZ3JlZXMgZnJvbSBub3J0aC5cbiAqIEBwYXJhbSAgIHtudW1iZXJ9IGRpc3QgLSBEaXN0YW5jZSBpbiBrbSAob24gc3BoZXJlIG9mICd0aGlzJyByYWRpdXMpLlxuICogQHJldHVybnMge0xhdExvbn0gRGVzdGluYXRpb24gcG9pbnQuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUxLjEyNywgMS4zMzgpO1xuICogICAgIHZhciBwMiA9IHAxLnJodW1iRGVzdGluYXRpb25Qb2ludCgxMTYuNywgNDAuMzEpOyAvLyBwMi50b1N0cmluZygpOiA1MC45NjQxwrBOLCAwMDEuODUzMcKwRVxuICovXG5MYXRMb24ucHJvdG90eXBlLnJodW1iRGVzdGluYXRpb25Qb2ludCA9IGZ1bmN0aW9uKGJybmcsIGRpc3QpIHtcbiAgICB2YXIgzrQgPSBOdW1iZXIoZGlzdCkgLyB0aGlzLnJhZGl1czsgLy8gYW5ndWxhciBkaXN0YW5jZSBpbiByYWRpYW5zXG4gICAgdmFyIM+GMSA9IHRoaXMubGF0LnRvUmFkaWFucygpLCDOuzEgPSB0aGlzLmxvbi50b1JhZGlhbnMoKTtcbiAgICB2YXIgzrggPSBOdW1iZXIoYnJuZykudG9SYWRpYW5zKCk7XG5cbiAgICB2YXIgzpTPhiA9IM60ICogTWF0aC5jb3MozrgpO1xuXG4gICAgdmFyIM+GMiA9IM+GMSArIM6Uz4Y7XG4gICAgLy8gY2hlY2sgZm9yIHNvbWUgZGFmdCBidWdnZXIgZ29pbmcgcGFzdCB0aGUgcG9sZSwgbm9ybWFsaXNlIGxhdGl0dWRlIGlmIHNvXG4gICAgaWYgKE1hdGguYWJzKM+GMikgPiBNYXRoLlBJLzIpIM+GMiA9IM+GMj4wID8gTWF0aC5QSS3PhjIgOiAtTWF0aC5QSS3PhjI7XG5cbiAgICB2YXIgzpTPiCA9IE1hdGgubG9nKE1hdGgudGFuKM+GMi8yK01hdGguUEkvNCkvTWF0aC50YW4oz4YxLzIrTWF0aC5QSS80KSk7XG4gICAgdmFyIHEgPSBNYXRoLmFicyjOlM+IKSA+IDEwZS0xMiA/IM6Uz4YgLyDOlM+IIDogTWF0aC5jb3Moz4YxKTsgLy8gRS1XIGNvdXJzZSBiZWNvbWVzIGlsbC1jb25kaXRpb25lZCB3aXRoIDAvMFxuXG4gICAgdmFyIM6UzrsgPSDOtCpNYXRoLnNpbijOuCkvcTtcblxuICAgIHZhciDOuzIgPSDOuzEgKyDOlM67O1xuXG4gICAgzrsyID0gKM67MiArIDMqTWF0aC5QSSkgJSAoMipNYXRoLlBJKSAtIE1hdGguUEk7IC8vIG5vcm1hbGlzZSB0byAtMTgwLi4rMTgwwrBcblxuICAgIHJldHVybiBuZXcgTGF0TG9uKM+GMi50b0RlZ3JlZXMoKSwgzrsyLnRvRGVncmVlcygpKTtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsb3hvZHJvbWljIG1pZHBvaW50IChhbG9uZyBhIHJodW1iIGxpbmUpIGJldHdlZW4gJ3RoaXMnIHBvaW50IGFuZCBzZWNvbmQgcG9pbnQuXG4gKlxuICogQHBhcmFtICAge0xhdExvbn0gcG9pbnQgLSBMYXRpdHVkZS9sb25naXR1ZGUgb2Ygc2Vjb25kIHBvaW50LlxuICogQHJldHVybnMge0xhdExvbn0gTWlkcG9pbnQgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCBzZWNvbmQgcG9pbnQuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgcDEgPSBuZXcgTGF0TG9uKDUxLjEyNywgMS4zMzgpLCBwMiA9IG5ldyBMYXRMb24oNTAuOTY0LCAxLjg1Myk7XG4gKiAgICAgdmFyIHAyID0gcDEucmh1bWJNaWRwb2ludFRvKHAyKTsgLy8gcDIudG9TdHJpbmcoKTogNTEuMDQ1NcKwTiwgMDAxLjU5NTfCsEVcbiAqL1xuTGF0TG9uLnByb3RvdHlwZS5yaHVtYk1pZHBvaW50VG8gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIC8vIGh0dHA6Ly9tYXRoZm9ydW0ub3JnL2tiL21lc3NhZ2UuanNwYT9tZXNzYWdlSUQ9MTQ4ODM3XG5cbiAgICB2YXIgz4YxID0gdGhpcy5sYXQudG9SYWRpYW5zKCksIM67MSA9IHRoaXMubG9uLnRvUmFkaWFucygpO1xuICAgIHZhciDPhjIgPSBwb2ludC5sYXQudG9SYWRpYW5zKCksIM67MiA9IHBvaW50Lmxvbi50b1JhZGlhbnMoKTtcblxuICAgIGlmIChNYXRoLmFicyjOuzItzrsxKSA+IE1hdGguUEkpIM67MSArPSAyKk1hdGguUEk7IC8vIGNyb3NzaW5nIGFudGktbWVyaWRpYW5cblxuICAgIHZhciDPhjMgPSAoz4YxK8+GMikvMjtcbiAgICB2YXIgZjEgPSBNYXRoLnRhbihNYXRoLlBJLzQgKyDPhjEvMik7XG4gICAgdmFyIGYyID0gTWF0aC50YW4oTWF0aC5QSS80ICsgz4YyLzIpO1xuICAgIHZhciBmMyA9IE1hdGgudGFuKE1hdGguUEkvNCArIM+GMy8yKTtcbiAgICB2YXIgzrszID0gKCAozrsyLc67MSkqTWF0aC5sb2coZjMpICsgzrsxKk1hdGgubG9nKGYyKSAtIM67MipNYXRoLmxvZyhmMSkgKSAvIE1hdGgubG9nKGYyL2YxKTtcblxuICAgIGlmICghaXNGaW5pdGUozrszKSkgzrszID0gKM67MSvOuzIpLzI7IC8vIHBhcmFsbGVsIG9mIGxhdGl0dWRlXG5cbiAgICDOuzMgPSAozrszICsgMypNYXRoLlBJKSAlICgyKk1hdGguUEkpIC0gTWF0aC5QSTsgLy8gbm9ybWFsaXNlIHRvIC0xODAuLisxODDCsFxuXG4gICAgcmV0dXJuIG5ldyBMYXRMb24oz4YzLnRvRGVncmVlcygpLCDOuzMudG9EZWdyZWVzKCkpO1xufTtcblxuXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mICd0aGlzJyBwb2ludCwgZm9ybWF0dGVkIGFzIGRlZ3JlZXMsIGRlZ3JlZXMrbWludXRlcywgb3JcbiAqIGRlZ3JlZXMrbWludXRlcytzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSAgIHtzdHJpbmd9IFtmb3JtYXQ9ZG1zXSAtIEZvcm1hdCBwb2ludCBhcyAnZCcsICdkbScsICdkbXMnLlxuICogQHBhcmFtICAge251bWJlcn0gW2RwPTB8Mnw0XSAtIE51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0byB1c2UgLSBkZWZhdWx0IDAgZm9yIGRtcywgMiBmb3IgZG0sIDQgZm9yIGQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBDb21tYS1zZXBhcmF0ZWQgbGF0aXR1ZGUvbG9uZ2l0dWRlLlxuICovXG5MYXRMb24ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oZm9ybWF0LCBkcCkge1xuICAgIGlmICh0eXBlb2YgZm9ybWF0ID09ICd1bmRlZmluZWQnKSBmb3JtYXQgPSAnZG1zJztcblxuICAgIHJldHVybiBHZW8udG9MYXQodGhpcy5sYXQsIGZvcm1hdCwgZHApICsgJywgJyArIEdlby50b0xvbih0aGlzLmxvbiwgZm9ybWF0LCBkcCk7XG59O1xuXG5cbi8qIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAgKi9cblxuXG4vKiogRXh0ZW5kIE51bWJlciBvYmplY3Qgd2l0aCBtZXRob2QgdG8gY29udmVydCBudW1lcmljIGRlZ3JlZXMgdG8gcmFkaWFucyAqL1xuaWYgKHR5cGVvZiBOdW1iZXIucHJvdG90eXBlLnRvUmFkaWFucyA9PSAndW5kZWZpbmVkJykge1xuICAgIE51bWJlci5wcm90b3R5cGUudG9SYWRpYW5zID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzICogTWF0aC5QSSAvIDE4MDsgfTtcbn1cblxuXG4vKiogRXh0ZW5kIE51bWJlciBvYmplY3Qgd2l0aCBtZXRob2QgdG8gY29udmVydCByYWRpYW5zIHRvIG51bWVyaWMgKHNpZ25lZCkgZGVncmVlcyAqL1xuaWYgKHR5cGVvZiBOdW1iZXIucHJvdG90eXBlLnRvRGVncmVlcyA9PSAndW5kZWZpbmVkJykge1xuICAgIE51bWJlci5wcm90b3R5cGUudG9EZWdyZWVzID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzICogMTgwIC8gTWF0aC5QSTsgfTtcbn1cblxuXG4vKiAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gICovXG5pZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBMYXRMb247IC8vIENvbW1vbkpTXG5pZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbJ0dlbyddLCBmdW5jdGlvbigpIHsgcmV0dXJuIExhdExvbjsgfSk7IC8vIEFNRFxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGFkYXB0ZXIgdG8gdHJhbnNsYXRlIGJ5IG9uZSBvZiBjaG9zZW4gc3RyYXRlZ3kgKi9cblxudmFyIHNldHVwRG9jID0ge1xuICBcImdldFRyYW5zbGF0aW9uc1wiOiBcInRvIGdldCB0ZXh0IHdoaWNoIGFyZSBub3QgdHJhbnNsYXRlZCBvbiBjdXJyZW50IHBhZ2UsIHRha2UgY29uc29sZS5sb2cod2luZG93LnRvVHJhbnNsYXRlKVwiLFxuICBcInNldHVwU3RyYXRlZ3lcIjogXCJpdCBpcyBuZWNlc3Nhcnkgc2V0IHN0cmF0ZWd5IGluIHJvb3Qgb2YgYnVuZGxlXCJcbn07XG5cbnZhciBzdHJhdGVneSA9IG51bGw7XG5cblxuXG52YXIgdHIgPSBmdW5jdGlvbiAob3JpZ2luYWwsIGtleSwgdmFsdWVzKSB7XG4gIGlmICghc3RyYXRlZ3kpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiVHJhbnNsYXRpb24gc3RyYXRlZ3kgaXMgbm90IHNldFxcbiBcIitzZXR1cERvY1tcInNldHVwU3RyYXRlZ3lcIl0pO1xuICAgIHJldHVybiBvcmlnaW5hbDtcbiAgfVxuICByZXR1cm4gc3RyYXRlZ3kob3JpZ2luYWwsIGtleSwgdmFsdWVzKTtcbn07XG5cbnRyLnNldFN0cmF0ZWd5ID0gZnVuY3Rpb24gKG5ld1N0cmF0ZWd5KSB7XG4gIHN0cmF0ZWd5ID0gbmV3U3RyYXRlZ3k7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgdHIgPSBmdW5jdGlvbiAob3JpZ2luYWwsa2V5LHZhbHVlcykge1xuICBpZiAoIWtleSkge1xuICAgIGtleSA9IG9yaWdpbmFsLnRvTG93ZXJDYXNlKCkudHJpbSgpLnJlcGxhY2UoXCIgXCIsIFwiX1wiKTtcbiAgfVxuICB2YXIgdHJhbnNsYXRlZDtcbiAgLy8gcHJldmVudCB0aHJvd2luZyBleGNlcHRpb24gb24gd3Jvbmcgc3ByaW50ZiBmb3JtYXRcbiAgdHJ5IHtcbiAgICB0cmFuc2xhdGVkID0gJC50KCdmb3JtX3NlYXJjaC4nK2tleSwge2RlZmF1bHRWYWx1ZTogb3JpZ2luYWwsIHBvc3RQcm9jZXNzOiAnc3ByaW50ZicsIHNwcmludGY6IHZhbHVlc30pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdHJhbnNsYXRlZCA9IG9yaWdpbmFsO1xuICB9XG5cbiAgLy9Ob3QgbmljZSwgVE9ETyBtYWtlIHNvbWUgYmV0dGVyIHNvbHV0aW9uIGhvdyB0byBwaWNrIHByZWZpeCBhbmQgZmFsbGJhY2sgdG8gY29tbW9uXG4gIGlmICh0cmFuc2xhdGVkID09IG9yaWdpbmFsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRyYW5zbGF0ZWQgPSAkLnQoJ2NvbW1vbi4nK2tleSwge2RlZmF1bHRWYWx1ZTogb3JpZ2luYWwsIHBvc3RQcm9jZXNzOiAnc3ByaW50ZicsIHNwcmludGY6IHZhbHVlc30pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRyYW5zbGF0ZWQgPSBvcmlnaW5hbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJhbnNsYXRlZFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0cjtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudFF1ZXVlO1xuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG59XG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHF1ZXVlLnB1c2goZnVuKTtcbiAgICBpZiAoIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlICh0YXJnZXQsIHNyYykge1xuICAgIHZhciBhcnJheSA9IEFycmF5LmlzQXJyYXkoc3JjKVxuICAgIHZhciBkc3QgPSBhcnJheSAmJiBbXSB8fCB7fVxuXG4gICAgaWYgKGFycmF5KSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCBbXVxuICAgICAgICBkc3QgPSBkc3QuY29uY2F0KHRhcmdldClcbiAgICAgICAgc3JjLmZvckVhY2goZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbaV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZHN0W2ldID0gZVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBkc3RbaV0gPSBtZXJnZSh0YXJnZXRbaV0sIGUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZihlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0LnB1c2goZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IHRhcmdldFtrZXldXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5rZXlzKHNyYykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNyY1trZXldICE9PSAnb2JqZWN0JyB8fCAhc3JjW2tleV0pIHtcbiAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IHNyY1trZXldXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRhcmdldFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGRzdFtrZXldID0gc3JjW2tleV1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IG1lcmdlKHRhcmdldFtrZXldLCBzcmNba2V5XSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGRzdFxufVxuIiwiLy8gdmltOnRzPTQ6c3RzPTQ6c3c9NDpcbi8qIVxuICpcbiAqIENvcHlyaWdodCAyMDA5LTIwMTIgS3JpcyBLb3dhbCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIE1JVFxuICogbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9yYXcvbWFzdGVyL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHNlbGYuUSA9IGRlZmluaXRpb24oKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgZW52aXJvbm1lbnQgd2FzIG5vdCBhbnRpY2lhcHRlZCBieSBRLiBQbGVhc2UgZmlsZSBhIGJ1Zy5cIik7XG4gICAgfVxuXG59KShmdW5jdGlvbiAoKSB7XG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGhhc1N0YWNrcyA9IGZhbHNlO1xudHJ5IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbn0gY2F0Y2ggKGUpIHtcbiAgICBoYXNTdGFja3MgPSAhIWUuc3RhY2s7XG59XG5cbi8vIEFsbCBjb2RlIGFmdGVyIHRoaXMgcG9pbnQgd2lsbCBiZSBmaWx0ZXJlZCBmcm9tIHN0YWNrIHRyYWNlcyByZXBvcnRlZFxuLy8gYnkgUS5cbnZhciBxU3RhcnRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcbnZhciBxRmlsZU5hbWU7XG5cbi8vIHNoaW1zXG5cbi8vIHVzZWQgZm9yIGZhbGxiYWNrIGluIFwiYWxsUmVzb2x2ZWRcIlxudmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fTtcblxuLy8gVXNlIHRoZSBmYXN0ZXN0IHBvc3NpYmxlIG1lYW5zIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm5cbi8vIG9mIHRoZSBldmVudCBsb29wLlxudmFyIG5leHRUaWNrID0oZnVuY3Rpb24gKCkge1xuICAgIC8vIGxpbmtlZCBsaXN0IG9mIHRhc2tzIChzaW5nbGUsIHdpdGggaGVhZCBub2RlKVxuICAgIHZhciBoZWFkID0ge3Rhc2s6IHZvaWQgMCwgbmV4dDogbnVsbH07XG4gICAgdmFyIHRhaWwgPSBoZWFkO1xuICAgIHZhciBmbHVzaGluZyA9IGZhbHNlO1xuICAgIHZhciByZXF1ZXN0VGljayA9IHZvaWQgMDtcbiAgICB2YXIgaXNOb2RlSlMgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgICAgICAvKiBqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cblxuICAgICAgICB3aGlsZSAoaGVhZC5uZXh0KSB7XG4gICAgICAgICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBoZWFkLnRhc2s7XG4gICAgICAgICAgICBoZWFkLnRhc2sgPSB2b2lkIDA7XG4gICAgICAgICAgICB2YXIgZG9tYWluID0gaGVhZC5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0YXNrKCk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSW4gbm9kZSwgdW5jYXVnaHQgZXhjZXB0aW9ucyBhcmUgY29uc2lkZXJlZCBmYXRhbCBlcnJvcnMuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gc3luY2hyb25vdXNseSB0byBpbnRlcnJ1cHQgZmx1c2hpbmchXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gbGlzdGVuaW5nIFwidW5jYXVnaHRFeGNlcHRpb25cIiBldmVudHMgKGFzIGRvbWFpbnMgZG9lcykuXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIGluIG5leHQgZXZlbnQgdG8gYXZvaWQgdGljayByZWN1cnNpb24uXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlLXRocm93IHRoZW0gYXN5bmNocm9ub3VzbHkgdG8gYXZvaWQgc2xvdy1kb3ducy5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbmV4dFRpY2sgPSBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICB0YWlsID0gdGFpbC5uZXh0ID0ge1xuICAgICAgICAgICAgdGFzazogdGFzayxcbiAgICAgICAgICAgIGRvbWFpbjogaXNOb2RlSlMgJiYgcHJvY2Vzcy5kb21haW4sXG4gICAgICAgICAgICBuZXh0OiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgICAgICAvLyBOb2RlLmpzIGJlZm9yZSAwLjkuIE5vdGUgdGhhdCBzb21lIGZha2UtTm9kZSBlbnZpcm9ubWVudHMsIGxpa2UgdGhlXG4gICAgICAgIC8vIE1vY2hhIHRlc3QgcnVubmVyLCBpbnRyb2R1Y2UgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgLlxuICAgICAgICBpc05vZGVKUyA9IHRydWU7XG5cbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIC8vIEluIElFMTAsIE5vZGUuanMgMC45Kywgb3IgaHR0cHM6Ly9naXRodWIuY29tL05vYmxlSlMvc2V0SW1tZWRpYXRlXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXF1ZXN0VGljayA9IHNldEltbWVkaWF0ZS5iaW5kKHdpbmRvdywgZmx1c2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKGZsdXNoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8vIG1vZGVybiBicm93c2Vyc1xuICAgICAgICAvLyBodHRwOi8vd3d3Lm5vbmJsb2NraW5nLmlvLzIwMTEvMDYvd2luZG93bmV4dHRpY2suaHRtbFxuICAgICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgICAvLyBBdCBsZWFzdCBTYWZhcmkgVmVyc2lvbiA2LjAuNSAoODUzNi4zMC4xKSBpbnRlcm1pdHRlbnRseSBjYW5ub3QgY3JlYXRlXG4gICAgICAgIC8vIHdvcmtpbmcgbWVzc2FnZSBwb3J0cyB0aGUgZmlyc3QgdGltZSBhIHBhZ2UgbG9hZHMuXG4gICAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSByZXF1ZXN0UG9ydFRpY2s7XG4gICAgICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICAgICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHJlcXVlc3RQb3J0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE9wZXJhIHJlcXVpcmVzIHVzIHRvIHByb3ZpZGUgYSBtZXNzYWdlIHBheWxvYWQsIHJlZ2FyZGxlc3Mgb2ZcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgd2UgdXNlIGl0LlxuICAgICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZsdXNoLCAwKTtcbiAgICAgICAgICAgIHJlcXVlc3RQb3J0VGljaygpO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gb2xkIGJyb3dzZXJzXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRUaWNrO1xufSkoKTtcblxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxuLy8gbW9kaWZpY2F0aW9ucy5cbi8vIFRoZXJlIGlzIG5vIHNpdHVhdGlvbiB3aGVyZSB0aGlzIGlzIG5lY2Vzc2FyeS5cbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXG4vLyBkZWVwbHkgZnJvemVuIGFueXdheSwgYW5kIGlmIHlvdSBkb27igJl0IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsXG4vLyB0aGlzIGlzIGp1c3QgcGxhaW4gcGFyYW5vaWQuXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXG4vLyB0aGUgbWluaWZpZWQgY29kZSBieSByZWR1Y2luZyB4LmNhbGwoKSB0byBtZXJlbHkgeCgpXG4vLyBTZWUgTWFyayBNaWxsZXLigJlzIGV4cGxhbmF0aW9uIG9mIHdoYXQgdGhpcyBkb2VzLlxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGw7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGwuYXBwbHkoZiwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuLy8gVGhpcyBpcyBlcXVpdmFsZW50LCBidXQgc2xvd2VyOlxuLy8gdW5jdXJyeVRoaXMgPSBGdW5jdGlvbl9iaW5kLmJpbmQoRnVuY3Rpb25fYmluZC5jYWxsKTtcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXG5cbnZhciBhcnJheV9zbGljZSA9IHVuY3VycnlUaGlzKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG5cbnZhciBhcnJheV9yZWR1Y2UgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAvLyBjb25jZXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlLCBpZiBvbmUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBzZWVrIHRvIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXksIGFjY291bnRpbmdcbiAgICAgICAgICAgIC8vIGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCBpcyBpcyBhIHNwYXJzZSBhcnJheVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2lzID0gdGhpc1tpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkdWNlXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxuICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrKGJhc2lzLCB0aGlzW2luZGV4XSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBub3QgYSB2ZXJ5IGdvb2Qgc2hpbSwgYnV0IGdvb2QgZW5vdWdoIGZvciBvdXIgb25lIHVzZSBvZiBpdFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcCB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHNlbGYsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgY29sbGVjdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBpbmRleCwgc2VsZikpO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICByZXR1cm4gY29sbGVjdDtcbiAgICB9XG4pO1xuXG52YXIgb2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICByZXR1cm4gbmV3IFR5cGUoKTtcbn07XG5cbnZhciBvYmplY3RfaGFzT3duUHJvcGVydHkgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgb2JqZWN0X3RvU3RyaW5nID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBPYmplY3QodmFsdWUpO1xufVxuXG4vLyBnZW5lcmF0b3IgcmVsYXRlZCBzaGltc1xuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuZnVuY3Rpb24gaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikge1xuICAgIHJldHVybiAoXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxuICAgICAgICBleGNlcHRpb24gaW5zdGFuY2VvZiBRUmV0dXJuVmFsdWVcbiAgICApO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaGVscGVyIGFuZCBRLnJldHVybiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpblxuLy8gU3BpZGVyTW9ua2V5LlxudmFyIFFSZXR1cm5WYWx1ZTtcbmlmICh0eXBlb2YgUmV0dXJuVmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcbn0gZWxzZSB7XG4gICAgUVJldHVyblZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrICYmXG4gICAgICAgIGVycm9yLnN0YWNrLmluZGV4T2YoU1RBQ0tfSlVNUF9TRVBBUkFUT1IpID09PSAtMVxuICAgICkge1xuICAgICAgICB2YXIgc3RhY2tzID0gW107XG4gICAgICAgIGZvciAodmFyIHAgPSBwcm9taXNlOyAhIXA7IHAgPSBwLnNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHAuc3RhY2spIHtcbiAgICAgICAgICAgICAgICBzdGFja3MudW5zaGlmdChwLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGFja3MudW5zaGlmdChlcnJvci5zdGFjayk7XG5cbiAgICAgICAgdmFyIGNvbmNhdGVkU3RhY2tzID0gc3RhY2tzLmpvaW4oXCJcXG5cIiArIFNUQUNLX0pVTVBfU0VQQVJBVE9SICsgXCJcXG5cIik7XG4gICAgICAgIGVycm9yLnN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVyU3RhY2tTdHJpbmcoc3RhY2tTdHJpbmcpIHtcbiAgICB2YXIgbGluZXMgPSBzdGFja1N0cmluZy5zcGxpdChcIlxcblwiKTtcbiAgICB2YXIgZGVzaXJlZExpbmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2ldO1xuXG4gICAgICAgIGlmICghaXNJbnRlcm5hbEZyYW1lKGxpbmUpICYmICFpc05vZGVGcmFtZShsaW5lKSAmJiBsaW5lKSB7XG4gICAgICAgICAgICBkZXNpcmVkTGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVzaXJlZExpbmVzLmpvaW4oXCJcXG5cIik7XG59XG5cbmZ1bmN0aW9uIGlzTm9kZUZyYW1lKHN0YWNrTGluZSkge1xuICAgIHJldHVybiBzdGFja0xpbmUuaW5kZXhPZihcIihtb2R1bGUuanM6XCIpICE9PSAtMSB8fFxuICAgICAgICAgICBzdGFja0xpbmUuaW5kZXhPZihcIihub2RlLmpzOlwiKSAhPT0gLTE7XG59XG5cbmZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpIHtcbiAgICAvLyBOYW1lZCBmdW5jdGlvbnM6IFwiYXQgZnVuY3Rpb25OYW1lIChmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlcilcIlxuICAgIC8vIEluIElFMTAgZnVuY3Rpb24gbmFtZSBjYW4gaGF2ZSBzcGFjZXMgKFwiQW5vbnltb3VzIGZ1bmN0aW9uXCIpIE9fb1xuICAgIHZhciBhdHRlbXB0MSA9IC9hdCAuKyBcXCgoLispOihcXGQrKTooPzpcXGQrKVxcKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDEpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0MVsxXSwgTnVtYmVyKGF0dGVtcHQxWzJdKV07XG4gICAgfVxuXG4gICAgLy8gQW5vbnltb3VzIGZ1bmN0aW9uczogXCJhdCBmaWxlbmFtZTpsaW5lTnVtYmVyOmNvbHVtbk51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQyID0gL2F0IChbXiBdKyk6KFxcZCspOig/OlxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mikge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQyWzFdLCBOdW1iZXIoYXR0ZW1wdDJbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBGaXJlZm94IHN0eWxlOiBcImZ1bmN0aW9uQGZpbGVuYW1lOmxpbmVOdW1iZXIgb3IgQGZpbGVuYW1lOmxpbmVOdW1iZXJcIlxuICAgIHZhciBhdHRlbXB0MyA9IC8uKkAoLispOihcXGQrKSQvLmV4ZWMoc3RhY2tMaW5lKTtcbiAgICBpZiAoYXR0ZW1wdDMpIHtcbiAgICAgICAgcmV0dXJuIFthdHRlbXB0M1sxXSwgTnVtYmVyKGF0dGVtcHQzWzJdKV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0ludGVybmFsRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgdmFyIGZpbGVOYW1lQW5kTGluZU51bWJlciA9IGdldEZpbGVOYW1lQW5kTGluZU51bWJlcihzdGFja0xpbmUpO1xuXG4gICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBmaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICB2YXIgbGluZU51bWJlciA9IGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcblxuICAgIHJldHVybiBmaWxlTmFtZSA9PT0gcUZpbGVOYW1lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPj0gcVN0YXJ0aW5nTGluZSAmJlxuICAgICAgICBsaW5lTnVtYmVyIDw9IHFFbmRpbmdMaW5lO1xufVxuXG4vLyBkaXNjb3ZlciBvd24gZmlsZSBuYW1lIGFuZCBsaW5lIG51bWJlciByYW5nZSBmb3IgZmlsdGVyaW5nIHN0YWNrXG4vLyB0cmFjZXNcbmZ1bmN0aW9uIGNhcHR1cmVMaW5lKCkge1xuICAgIGlmICghaGFzU3RhY2tzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHZhciBsaW5lcyA9IGUuc3RhY2suc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIHZhciBmaXJzdExpbmUgPSBsaW5lc1swXS5pbmRleE9mKFwiQFwiKSA+IDAgPyBsaW5lc1sxXSA6IGxpbmVzWzJdO1xuICAgICAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKGZpcnN0TGluZSk7XG4gICAgICAgIGlmICghZmlsZU5hbWVBbmRMaW5lTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBxRmlsZU5hbWUgPSBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMF07XG4gICAgICAgIHJldHVybiBmaWxlTmFtZUFuZExpbmVOdW1iZXJbMV07XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZXByZWNhdGUoY2FsbGJhY2ssIG5hbWUsIGFsdGVybmF0aXZlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICB0eXBlb2YgY29uc29sZS53YXJuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihuYW1lICsgXCIgaXMgZGVwcmVjYXRlZCwgdXNlIFwiICsgYWx0ZXJuYXRpdmUgK1xuICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGluc3RlYWQuXCIsIG5ldyBFcnJvcihcIlwiKS5zdGFjayk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrLCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8vIGVuZCBvZiBzaGltc1xuLy8gYmVnaW5uaW5nIG9mIHJlYWwgd29ya1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLCBwYXNzZXMgcHJvbWlzZXMgdGhyb3VnaCwgb3JcbiAqIGNvZXJjZXMgcHJvbWlzZXMgZnJvbSBkaWZmZXJlbnQgc3lzdGVtcy5cbiAqIEBwYXJhbSB2YWx1ZSBpbW1lZGlhdGUgcmVmZXJlbmNlIG9yIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gUSh2YWx1ZSkge1xuICAgIC8vIElmIHRoZSBvYmplY3QgaXMgYWxyZWFkeSBhIFByb21pc2UsIHJldHVybiBpdCBkaXJlY3RseS4gIFRoaXMgZW5hYmxlc1xuICAgIC8vIHRoZSByZXNvbHZlIGZ1bmN0aW9uIHRvIGJvdGggYmUgdXNlZCB0byBjcmVhdGVkIHJlZmVyZW5jZXMgZnJvbSBvYmplY3RzLFxuICAgIC8vIGJ1dCB0byB0b2xlcmFibHkgY29lcmNlIG5vbi1wcm9taXNlcyB0byBwcm9taXNlcy5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvLyBhc3NpbWlsYXRlIHRoZW5hYmxlc1xuICAgIGlmIChpc1Byb21pc2VBbGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvZXJjZSh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGwodmFsdWUpO1xuICAgIH1cbn1cblEucmVzb2x2ZSA9IFE7XG5cbi8qKlxuICogUGVyZm9ybXMgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm4gb2YgdGhlIGV2ZW50IGxvb3AuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0YXNrXG4gKi9cblEubmV4dFRpY2sgPSBuZXh0VGljaztcblxuLyoqXG4gKiBDb250cm9scyB3aGV0aGVyIG9yIG5vdCBsb25nIHN0YWNrIHRyYWNlcyB3aWxsIGJlIG9uXG4gKi9cblEubG9uZ1N0YWNrU3VwcG9ydCA9IGZhbHNlO1xuXG4vLyBlbmFibGUgbG9uZyBzdGFja3MgaWYgUV9ERUJVRyBpcyBzZXRcbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LlFfREVCVUcpIHtcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fSBvYmplY3QuXG4gKlxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcbiAqIHByb21pc2UuIFRvIGZ1bGZpbGwgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhbnkgdmFsdWUgdGhhdCBpc1xuICogbm90IGEgdGhlbmFibGUuIFRvIHJlamVjdCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGEgcmVqZWN0ZWRcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxuICogcHJvbWlzZSB0byBhbm90aGVyIHRoZW5hYmxlLCB0aHVzIHB1dHRpbmcgaXQgaW4gdGhlIHNhbWUgc3RhdGUsIGludm9rZVxuICogYHJlc29sdmVgIHdpdGggdGhhdCBvdGhlciB0aGVuYWJsZS5cbiAqL1xuUS5kZWZlciA9IGRlZmVyO1xuZnVuY3Rpb24gZGVmZXIoKSB7XG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxuICAgIC8vIGJlZW4gcmVzb2x2ZWQuICBJZiBpdCBpcyBcInVuZGVmaW5lZFwiLCBpdCBoYXMgYmVlbiByZXNvbHZlZC4gIEVhY2hcbiAgICAvLyBlbGVtZW50IG9mIHRoZSBtZXNzYWdlcyBhcnJheSBpcyBpdHNlbGYgYW4gYXJyYXkgb2YgY29tcGxldGUgYXJndW1lbnRzIHRvXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXG4gICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgYHJlc29sdmVgIGZ1bmN0aW9uIGJlY2F1c2UgaXQgaGFuZGxlcyBib3RoIGZ1bGx5XG4gICAgLy8gbm9uLXRoZW5hYmxlIHZhbHVlcyBhbmQgb3RoZXIgdGhlbmFibGVzIGdyYWNlZnVsbHkuXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9IG9iamVjdF9jcmVhdGUoZGVmZXIucHJvdG90eXBlKTtcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIG9wZXJhbmRzKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChvcGVyYW5kc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTk9URTogd2UgZG8gdGhlIGNoZWNrcyBmb3IgYHJlc29sdmVkUHJvbWlzZWAgaW4gZWFjaCBtZXRob2QsIGluc3RlYWQgb2ZcbiAgICAvLyBjb25zb2xpZGF0aW5nIHRoZW0gaW50byBgYmVjb21lYCwgc2luY2Ugb3RoZXJ3aXNlIHdlJ2QgY3JlYXRlIG5ld1xuICAgIC8vIHByb21pc2VzIHdpdGggdGhlIGxpbmVzIGBiZWNvbWUod2hhdGV2ZXIodmFsdWUpKWAuIFNlZSBlLmcuIEdILTI1Mi5cblxuICAgIGZ1bmN0aW9uIGJlY29tZShuZXdQcm9taXNlKSB7XG4gICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5ld1Byb21pc2U7XG4gICAgICAgIHByb21pc2Uuc291cmNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBhcnJheV9yZWR1Y2UobWVzc2FnZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ld1Byb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KG5ld1Byb21pc2UsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG5cbiAgICAgICAgbWVzc2FnZXMgPSB2b2lkIDA7XG4gICAgICAgIHByb2dyZXNzTGlzdGVuZXJzID0gdm9pZCAwO1xuICAgIH1cblxuICAgIGRlZmVycmVkLnByb21pc2UgPSBwcm9taXNlO1xuICAgIGRlZmVycmVkLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKFEodmFsdWUpKTtcbiAgICB9O1xuXG4gICAgZGVmZXJyZWQuZnVsZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUoZnVsZmlsbCh2YWx1ZSkpO1xuICAgIH07XG4gICAgZGVmZXJyZWQucmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBiZWNvbWUocmVqZWN0KHJlYXNvbikpO1xuICAgIH07XG4gICAgZGVmZXJyZWQubm90aWZ5ID0gZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFycmF5X3JlZHVjZShwcm9ncmVzc0xpc3RlbmVycywgZnVuY3Rpb24gKHVuZGVmaW5lZCwgcHJvZ3Jlc3NMaXN0ZW5lcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcihwcm9ncmVzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdm9pZCAwKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlZmVycmVkO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBOb2RlLXN0eWxlIGNhbGxiYWNrIHRoYXQgd2lsbCByZXNvbHZlIG9yIHJlamVjdCB0aGUgZGVmZXJyZWRcbiAqIHByb21pc2UuXG4gKiBAcmV0dXJucyBhIG5vZGViYWNrXG4gKi9cbmRlZmVyLnByb3RvdHlwZS5tYWtlTm9kZVJlc29sdmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVycm9yLCB2YWx1ZSkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNlbGYucmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG4vKipcbiAqIEBwYXJhbSByZXNvbHZlciB7RnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIG5vdGhpbmcgYW5kIGFjY2VwdHNcbiAqIHRoZSByZXNvbHZlLCByZWplY3QsIGFuZCBub3RpZnkgZnVuY3Rpb25zIGZvciBhIGRlZmVycmVkLlxuICogQHJldHVybnMgYSBwcm9taXNlIHRoYXQgbWF5IGJlIHJlc29sdmVkIHdpdGggdGhlIGdpdmVuIHJlc29sdmUgYW5kIHJlamVjdFxuICogZnVuY3Rpb25zLCBvciByZWplY3RlZCBieSBhIHRocm93biBleGNlcHRpb24gaW4gcmVzb2x2ZXJcbiAqL1xuUS5Qcm9taXNlID0gcHJvbWlzZTsgLy8gRVM2XG5RLnByb21pc2UgPSBwcm9taXNlO1xuZnVuY3Rpb24gcHJvbWlzZShyZXNvbHZlcikge1xuICAgIGlmICh0eXBlb2YgcmVzb2x2ZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwicmVzb2x2ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QsIGRlZmVycmVkLm5vdGlmeSk7XG4gICAgfSBjYXRjaCAocmVhc29uKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cblxucHJvbWlzZS5yYWNlID0gcmFjZTsgLy8gRVM2XG5wcm9taXNlLmFsbCA9IGFsbDsgLy8gRVM2XG5wcm9taXNlLnJlamVjdCA9IHJlamVjdDsgLy8gRVM2XG5wcm9taXNlLnJlc29sdmUgPSBROyAvLyBFUzZcblxuLy8gWFhYIGV4cGVyaW1lbnRhbC4gIFRoaXMgbWV0aG9kIGlzIGEgd2F5IHRvIGRlbm90ZSB0aGF0IGEgbG9jYWwgdmFsdWUgaXNcbi8vIHNlcmlhbGl6YWJsZSBhbmQgc2hvdWxkIGJlIGltbWVkaWF0ZWx5IGRpc3BhdGNoZWQgdG8gYSByZW1vdGUgdXBvbiByZXF1ZXN0LFxuLy8gaW5zdGVhZCBvZiBwYXNzaW5nIGEgcmVmZXJlbmNlLlxuUS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnBhc3NCeUNvcHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9mcmVlemUob2JqZWN0KTtcbiAgICAvL3Bhc3NCeUNvcGllcy5zZXQob2JqZWN0LCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSWYgdHdvIHByb21pc2VzIGV2ZW50dWFsbHkgZnVsZmlsbCB0byB0aGUgc2FtZSB2YWx1ZSwgcHJvbWlzZXMgdGhhdCB2YWx1ZSxcbiAqIGJ1dCBvdGhlcndpc2UgcmVqZWN0cy5cbiAqIEBwYXJhbSB4IHtBbnkqfVxuICogQHBhcmFtIHkge0FueSp9XG4gKiBAcmV0dXJucyB7QW55Kn0gYSBwcm9taXNlIGZvciB4IGFuZCB5IGlmIHRoZXkgYXJlIHRoZSBzYW1lLCBidXQgYSByZWplY3Rpb25cbiAqIG90aGVyd2lzZS5cbiAqXG4gKi9cblEuam9pbiA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgcmV0dXJuIFEoeCkuam9pbih5KTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmpvaW4gPSBmdW5jdGlvbiAodGhhdCkge1xuICAgIHJldHVybiBRKFt0aGlzLCB0aGF0XSkuc3ByZWFkKGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIGlmICh4ID09PSB5KSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBcIj09PVwiIHNob3VsZCBiZSBPYmplY3QuaXMgb3IgZXF1aXZcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXG4gKiBAcGFyYW0gYW5zd2VycyB7QXJyYXlbQW55Kl19IHByb21pc2VzIHRvIHJhY2VcbiAqIEByZXR1cm5zIHtBbnkqfSB0aGUgZmlyc3QgcHJvbWlzZSB0byBiZSBzZXR0bGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIFN3aXRjaCB0byB0aGlzIG9uY2Ugd2UgY2FuIGFzc3VtZSBhdCBsZWFzdCBFUzVcbiAgICAgICAgLy8gYW5zd2VyUHMuZm9yRWFjaChmdW5jdGlvbihhbnN3ZXJQKSB7XG4gICAgICAgIC8vICAgICBRKGFuc3dlclApLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIFVzZSB0aGlzIGluIHRoZSBtZWFudGltZVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYW5zd2VyUHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIFEoYW5zd2VyUHNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5yYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oUS5yYWNlKTtcbn07XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIFByb21pc2Ugd2l0aCBhIHByb21pc2UgZGVzY3JpcHRvciBvYmplY3QgYW5kIG9wdGlvbmFsIGZhbGxiYWNrXG4gKiBmdW5jdGlvbi4gIFRoZSBkZXNjcmlwdG9yIGNvbnRhaW5zIG1ldGhvZHMgbGlrZSB3aGVuKHJlamVjdGVkKSwgZ2V0KG5hbWUpLFxuICogc2V0KG5hbWUsIHZhbHVlKSwgcG9zdChuYW1lLCBhcmdzKSwgYW5kIGRlbGV0ZShuYW1lKSwgd2hpY2ggYWxsXG4gKiByZXR1cm4gZWl0aGVyIGEgdmFsdWUsIGEgcHJvbWlzZSBmb3IgYSB2YWx1ZSwgb3IgYSByZWplY3Rpb24uICBUaGUgZmFsbGJhY2tcbiAqIGFjY2VwdHMgdGhlIG9wZXJhdGlvbiBuYW1lLCBhIHJlc29sdmVyLCBhbmQgYW55IGZ1cnRoZXIgYXJndW1lbnRzIHRoYXQgd291bGRcbiAqIGhhdmUgYmVlbiBmb3J3YXJkZWQgdG8gdGhlIGFwcHJvcHJpYXRlIG1ldGhvZCBhYm92ZSBoYWQgYSBtZXRob2QgYmVlblxuICogcHJvdmlkZWQgd2l0aCB0aGUgcHJvcGVyIG5hbWUuICBUaGUgQVBJIG1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgdGhlIG5hdHVyZVxuICogb2YgdGhlIHJldHVybmVkIG9iamVjdCwgYXBhcnQgZnJvbSB0aGF0IGl0IGlzIHVzYWJsZSB3aGVyZWV2ZXIgcHJvbWlzZXMgYXJlXG4gKiBib3VnaHQgYW5kIHNvbGQuXG4gKi9cblEubWFrZVByb21pc2UgPSBQcm9taXNlO1xuZnVuY3Rpb24gUHJvbWlzZShkZXNjcmlwdG9yLCBmYWxsYmFjaywgaW5zcGVjdCkge1xuICAgIGlmIChmYWxsYmFjayA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGZhbGxiYWNrID0gZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBcIlByb21pc2UgZG9lcyBub3Qgc3VwcG9ydCBvcGVyYXRpb246IFwiICsgb3BcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoaW5zcGVjdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge3N0YXRlOiBcInVua25vd25cIn07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBvYmplY3RfY3JlYXRlKFByb21pc2UucHJvdG90eXBlKTtcblxuICAgIHByb21pc2UucHJvbWlzZURpc3BhdGNoID0gZnVuY3Rpb24gKHJlc29sdmUsIG9wLCBhcmdzKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZGVzY3JpcHRvcltvcF0pIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBkZXNjcmlwdG9yW29wXS5hcHBseShwcm9taXNlLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsbGJhY2suY2FsbChwcm9taXNlLCBvcCwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc29sdmUpIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBpbnNwZWN0O1xuXG4gICAgLy8gWFhYIGRlcHJlY2F0ZWQgYHZhbHVlT2ZgIGFuZCBgZXhjZXB0aW9uYCBzdXBwb3J0XG4gICAgaWYgKGluc3BlY3QpIHtcbiAgICAgICAgdmFyIGluc3BlY3RlZCA9IGluc3BlY3QoKTtcbiAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICBwcm9taXNlLmV4Y2VwdGlvbiA9IGluc3BlY3RlZC5yZWFzb247XG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICAgICAgaWYgKGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJwZW5kaW5nXCIgfHxcbiAgICAgICAgICAgICAgICBpbnNwZWN0ZWQuc3RhdGUgPT09IFwicmVqZWN0ZWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluc3BlY3RlZC52YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBQcm9taXNlXVwiO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIGRvbmUgPSBmYWxzZTsgICAvLyBlbnN1cmUgdGhlIHVudHJ1c3RlZCBwcm9taXNlIG1ha2VzIGF0IG1vc3QgYVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luZ2xlIGNhbGwgdG8gb25lIG9mIHRoZSBjYWxsYmFja3NcblxuICAgIGZ1bmN0aW9uIF9mdWxmaWxsZWQodmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZnVsZmlsbGVkID09PSBcImZ1bmN0aW9uXCIgPyBmdWxmaWxsZWQodmFsdWUpIDogdmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlamVjdGVkKGV4Y2VwdGlvbikge1xuICAgICAgICBpZiAodHlwZW9mIHJlamVjdGVkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhleGNlcHRpb24sIHNlbGYpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0ZWQoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKG5ld0V4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3RXhjZXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Byb2dyZXNzZWQodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwcm9ncmVzc2VkID09PSBcImZ1bmN0aW9uXCIgPyBwcm9ncmVzc2VkKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cblxuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoX2Z1bGZpbGxlZCh2YWx1ZSkpO1xuICAgICAgICB9LCBcIndoZW5cIiwgW2Z1bmN0aW9uIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoX3JlamVjdGVkKGV4Y2VwdGlvbikpO1xuICAgICAgICB9XSk7XG4gICAgfSk7XG5cbiAgICAvLyBQcm9ncmVzcyBwcm9wYWdhdG9yIG5lZWQgdG8gYmUgYXR0YWNoZWQgaW4gdGhlIGN1cnJlbnQgdGljay5cbiAgICBzZWxmLnByb21pc2VEaXNwYXRjaCh2b2lkIDAsIFwid2hlblwiLCBbdm9pZCAwLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlO1xuICAgICAgICB2YXIgdGhyZXcgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gX3Byb2dyZXNzZWQodmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJldyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aHJldykge1xuICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUS50YXAgPSBmdW5jdGlvbiAocHJvbWlzZSwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50YXAoY2FsbGJhY2spO1xufTtcblxuLyoqXG4gKiBXb3JrcyBhbG1vc3QgbGlrZSBcImZpbmFsbHlcIiwgYnV0IG5vdCBjYWxsZWQgZm9yIHJlamVjdGlvbnMuXG4gKiBPcmlnaW5hbCByZXNvbHV0aW9uIHZhbHVlIGlzIHBhc3NlZCB0aHJvdWdoIGNhbGxiYWNrIHVuYWZmZWN0ZWQuXG4gKiBDYWxsYmFjayBtYXkgcmV0dXJuIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgYXdhaXRlZCBmb3IuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge1EuUHJvbWlzZX1cbiAqIEBleGFtcGxlXG4gKiBkb1NvbWV0aGluZygpXG4gKiAgIC50aGVuKC4uLilcbiAqICAgLnRhcChjb25zb2xlLmxvZylcbiAqICAgLnRoZW4oLi4uKTtcbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUudGFwID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCh2YWx1ZSkudGhlblJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlcnMgYW4gb2JzZXJ2ZXIgb24gYSBwcm9taXNlLlxuICpcbiAqIEd1YXJhbnRlZXM6XG4gKlxuICogMS4gdGhhdCBmdWxmaWxsZWQgYW5kIHJlamVjdGVkIHdpbGwgYmUgY2FsbGVkIG9ubHkgb25jZS5cbiAqIDIuIHRoYXQgZWl0aGVyIHRoZSBmdWxmaWxsZWQgY2FsbGJhY2sgb3IgdGhlIHJlamVjdGVkIGNhbGxiYWNrIHdpbGwgYmVcbiAqICAgIGNhbGxlZCwgYnV0IG5vdCBib3RoLlxuICogMy4gdGhhdCBmdWxmaWxsZWQgYW5kIHJlamVjdGVkIHdpbGwgbm90IGJlIGNhbGxlZCBpbiB0aGlzIHR1cm4uXG4gKlxuICogQHBhcmFtIHZhbHVlICAgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIHRvIG9ic2VydmVcbiAqIEBwYXJhbSBmdWxmaWxsZWQgIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqIEBwYXJhbSByZWplY3RlZCAgIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aXRoIHRoZSByZWplY3Rpb24gZXhjZXB0aW9uXG4gKiBAcGFyYW0gcHJvZ3Jlc3NlZCBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYW55IHByb2dyZXNzIG5vdGlmaWNhdGlvbnNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZSBmcm9tIHRoZSBpbnZva2VkIGNhbGxiYWNrXG4gKi9cblEud2hlbiA9IHdoZW47XG5mdW5jdGlvbiB3aGVuKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIFEodmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3NlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnRoZW5SZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfSk7XG59O1xuXG5RLnRoZW5SZXNvbHZlID0gZnVuY3Rpb24gKHByb21pc2UsIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZSkudGhlblJlc29sdmUodmFsdWUpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgdGhyb3cgcmVhc29uOyB9KTtcbn07XG5cblEudGhlblJlamVjdCA9IGZ1bmN0aW9uIChwcm9taXNlLCByZWFzb24pIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVqZWN0KHJlYXNvbik7XG59O1xuXG4vKipcbiAqIElmIGFuIG9iamVjdCBpcyBub3QgYSBwcm9taXNlLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZS5cbiAqIElmIGEgcHJvbWlzZSBpcyByZWplY3RlZCwgaXQgaXMgYXMgXCJuZWFyXCIgYXMgcG9zc2libGUgdG9vLlxuICogSWYgaXTigJlzIGEgZnVsZmlsbGVkIHByb21pc2UsIHRoZSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZWFyZXIuXG4gKiBJZiBpdOKAmXMgYSBkZWZlcnJlZCBwcm9taXNlIGFuZCB0aGUgZGVmZXJyZWQgaGFzIGJlZW4gcmVzb2x2ZWQsIHRoZVxuICogcmVzb2x1dGlvbiBpcyBcIm5lYXJlclwiLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgbW9zdCByZXNvbHZlZCAobmVhcmVzdCkgZm9ybSBvZiB0aGUgb2JqZWN0XG4gKi9cblxuLy8gWFhYIHNob3VsZCB3ZSByZS1kbyB0aGlzP1xuUS5uZWFyZXIgPSBuZWFyZXI7XG5mdW5jdGlvbiBuZWFyZXIodmFsdWUpIHtcbiAgICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gdmFsdWUuaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwcm9taXNlLlxuICogT3RoZXJ3aXNlIGl0IGlzIGEgZnVsZmlsbGVkIHZhbHVlLlxuICovXG5RLmlzUHJvbWlzZSA9IGlzUHJvbWlzZTtcbmZ1bmN0aW9uIGlzUHJvbWlzZShvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgUHJvbWlzZTtcbn1cblxuUS5pc1Byb21pc2VBbGlrZSA9IGlzUHJvbWlzZUFsaWtlO1xuZnVuY3Rpb24gaXNQcm9taXNlQWxpa2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIGlzT2JqZWN0KG9iamVjdCkgJiYgdHlwZW9mIG9iamVjdC50aGVuID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbi8qKlxuICogQHJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGEgcGVuZGluZyBwcm9taXNlLCBtZWFuaW5nIG5vdFxuICogZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuICovXG5RLmlzUGVuZGluZyA9IGlzUGVuZGluZztcbmZ1bmN0aW9uIGlzUGVuZGluZyhvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUGVuZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwicGVuZGluZ1wiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSB2YWx1ZSBvciBmdWxmaWxsZWRcbiAqIHByb21pc2UuXG4gKi9cblEuaXNGdWxmaWxsZWQgPSBpc0Z1bGZpbGxlZDtcbmZ1bmN0aW9uIGlzRnVsZmlsbGVkKG9iamVjdCkge1xuICAgIHJldHVybiAhaXNQcm9taXNlKG9iamVjdCkgfHwgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJmdWxmaWxsZWRcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNGdWxmaWxsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSByZWplY3RlZCBwcm9taXNlLlxuICovXG5RLmlzUmVqZWN0ZWQgPSBpc1JlamVjdGVkO1xuZnVuY3Rpb24gaXNSZWplY3RlZChvYmplY3QpIHtcbiAgICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgJiYgb2JqZWN0Lmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc1JlamVjdGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiO1xufTtcblxuLy8vLyBCRUdJTiBVTkhBTkRMRUQgUkVKRUNUSU9OIFRSQUNLSU5HXG5cbi8vIFRoaXMgcHJvbWlzZSBsaWJyYXJ5IGNvbnN1bWVzIGV4Y2VwdGlvbnMgdGhyb3duIGluIGhhbmRsZXJzIHNvIHRoZXkgY2FuIGJlXG4vLyBoYW5kbGVkIGJ5IGEgc3Vic2VxdWVudCBwcm9taXNlLiAgVGhlIGV4Y2VwdGlvbnMgZ2V0IGFkZGVkIHRvIHRoaXMgYXJyYXkgd2hlblxuLy8gdGhleSBhcmUgY3JlYXRlZCwgYW5kIHJlbW92ZWQgd2hlbiB0aGV5IGFyZSBoYW5kbGVkLiAgTm90ZSB0aGF0IGluIEVTNiBvclxuLy8gc2hpbW1lZCBlbnZpcm9ubWVudHMsIHRoaXMgd291bGQgbmF0dXJhbGx5IGJlIGEgYFNldGAuXG52YXIgdW5oYW5kbGVkUmVhc29ucyA9IFtdO1xudmFyIHVuaGFuZGxlZFJlamVjdGlvbnMgPSBbXTtcbnZhciB0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMgPSB0cnVlO1xuXG5mdW5jdGlvbiByZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKSB7XG4gICAgdW5oYW5kbGVkUmVhc29ucy5sZW5ndGggPSAwO1xuICAgIHVuaGFuZGxlZFJlamVjdGlvbnMubGVuZ3RoID0gMDtcblxuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFja1JlamVjdGlvbihwcm9taXNlLCByZWFzb24pIHtcbiAgICBpZiAoIXRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgIGlmIChyZWFzb24gJiYgdHlwZW9mIHJlYXNvbi5zdGFjayAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2gocmVhc29uLnN0YWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnB1c2goXCIobm8gc3RhY2spIFwiICsgcmVhc29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVudHJhY2tSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgYXQgPSBhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpO1xuICAgIGlmIChhdCAhPT0gLTEpIHtcbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vKipcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcbiAqIHRyYW5zZmVycmVkIGF3YXkgZnJvbSB0aGlzIHByb2Nlc3Mgb3ZlciBhbnkgcHJvbWlzZVxuICogY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgcHJvbWlzZSBhIHdyYXBwaW5nIG9mIHRoYXQgb2JqZWN0IHRoYXRcbiAqIGFkZGl0aW9uYWxseSByZXNwb25kcyB0byB0aGUgXCJpc0RlZlwiIG1lc3NhZ2VcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXG4gKi9cblEubWFzdGVyID0gbWFzdGVyO1xuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJpc0RlZlwiOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwcmVhZHMgdGhlIHZhbHVlcyBvZiBhIHByb21pc2VkIGFycmF5IG9mIGFyZ3VtZW50cyBpbnRvIHRoZVxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gZnVsZmlsbGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdmFyaWFkaWMgYXJndW1lbnRzIGZyb20gdGhlXG4gKiBwcm9taXNlZCBhcnJheVxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxuICogaXMgcmVqZWN0ZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb3IgdGhyb3duIGV4Y2VwdGlvbiBvZlxuICogZWl0aGVyIGNhbGxiYWNrLlxuICovXG5RLnNwcmVhZCA9IHNwcmVhZDtcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS5zcHJlYWQoZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcbiAgICB9LCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIFRoZSBhc3luYyBmdW5jdGlvbiBpcyBhIGRlY29yYXRvciBmb3IgZ2VuZXJhdG9yIGZ1bmN0aW9ucywgdHVybmluZ1xuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XG4gKiBvZiB0aGUgbmV3ZXN0IEVDTUFTY3JpcHQgNiBkcmFmdHMsIHRoaXMgY29kZSBkb2VzIG5vdCBjYXVzZSBzeW50YXhcbiAqIGVycm9ycyBpbiBvbGRlciBlbmdpbmVzLiAgVGhpcyBjb2RlIHNob3VsZCBjb250aW51ZSB0byB3b3JrIGFuZCB3aWxsXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cbiAqXG4gKiBFUzYgZ2VuZXJhdG9ycyBhcmUgY3VycmVudGx5IHBhcnQgb2YgVjggdmVyc2lvbiAzLjE5IHdpdGggdGhlXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cbiAqIGZvciBsb25nZXIsIGJ1dCB1bmRlciBhbiBvbGRlciBQeXRob24taW5zcGlyZWQgZm9ybS4gIFRoaXMgZnVuY3Rpb25cbiAqIHdvcmtzIG9uIGJvdGgga2luZHMgb2YgZ2VuZXJhdG9ycy5cbiAqXG4gKiBEZWNvcmF0ZXMgYSBnZW5lcmF0b3IgZnVuY3Rpb24gc3VjaCB0aGF0OlxuICogIC0gaXQgbWF5IHlpZWxkIHByb21pc2VzXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcbiAqICAtIHRoZSB2YWx1ZSBvZiB0aGUgeWllbGQgZXhwcmVzc2lvbiB3aWxsIGJlIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqICAtIGl0IHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlICh3aGVuIHRoZSBnZW5lcmF0b3JcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcbiAqICAtIHRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqICAgIG9mIHRoZSBnZW5lcmF0b3Igb3IgdGhlIGZpcnN0IHJlamVjdGVkIHByb21pc2UgYW1vbmcgdGhvc2VcbiAqICAgIHlpZWxkZWQuXG4gKiAgLSBpZiBhbiBlcnJvciBpcyB0aHJvd24gaW4gdGhlIGdlbmVyYXRvciwgaXQgcHJvcGFnYXRlcyB0aHJvdWdoXG4gKiAgICBldmVyeSBmb2xsb3dpbmcgeWllbGQgdW50aWwgaXQgaXMgY2F1Z2h0LCBvciB1bnRpbCBpdCBlc2NhcGVzXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxuICogICAgcmVqZWN0aW9uIGZvciB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZGVjb3JhdGVkIGdlbmVyYXRvci5cbiAqL1xuUS5hc3luYyA9IGFzeW5jO1xuZnVuY3Rpb24gYXN5bmMobWFrZUdlbmVyYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwidGhyb3dcIiwgYXJnIGlzIGFuIGV4Y2VwdGlvblxuICAgICAgICBmdW5jdGlvbiBjb250aW51ZXIodmVyYiwgYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAvLyBVbnRpbCBWOCAzLjE5IC8gQ2hyb21pdW0gMjkgaXMgcmVsZWFzZWQsIFNwaWRlck1vbmtleSBpcyB0aGUgb25seVxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIFNNJ3MgZ2VuZXJhdG9ycyB1c2UgdGhlIFB5dGhvbi1pbnNwaXJlZCBzZW1hbnRpY3Mgb2ZcbiAgICAgICAgICAgIC8vIG91dGRhdGVkIEVTNiBkcmFmdHMuICBXZSB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgRVM2LCBidXQgd2UnZCBhbHNvXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIHN1cHBvcnQgUHl0aG9uLXN0eWxlIGdlbmVyYXRvcnMuICBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmVcbiAgICAgICAgICAgIC8vIHRoaXMgYmxvY2suXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU3RvcEl0ZXJhdGlvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIC8vIEVTNiBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcGlkZXJNb25rZXkgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShleGNlcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdCwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBtYWtlR2VuZXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJuZXh0XCIpO1xuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XG4gKiBjYWxscyB0aGUgZ2VuZXJhdG9yIGFuZCBhbHNvIGVuZHMgdGhlIHByb21pc2UgY2hhaW4sIHNvIHRoYXQgYW55XG4gKiB1bmhhbmRsZWQgZXJyb3JzIGFyZSB0aHJvd24gaW5zdGVhZCBvZiBmb3J3YXJkZWQgdG8gdGhlIGVycm9yXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cbiAqIGdlbmVyYXRvcnMgYXQgdGhlIHRvcC1sZXZlbCB0byB3b3JrIHdpdGggbGlicmFyaWVzLlxuICovXG5RLnNwYXduID0gc3Bhd247XG5mdW5jdGlvbiBzcGF3bihtYWtlR2VuZXJhdG9yKSB7XG4gICAgUS5kb25lKFEuYXN5bmMobWFrZUdlbmVyYXRvcikoKSk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBpbnRlcmZhY2Ugb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuLyoqXG4gKiBUaHJvd3MgYSBSZXR1cm5WYWx1ZSBleGNlcHRpb24gdG8gc3RvcCBhbiBhc3luY2hyb25vdXMgZ2VuZXJhdG9yLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cbiAqIHZhbHVlcyBpbiBvbGRlciBGaXJlZm94L1NwaWRlck1vbmtleS4gIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBFUzZcbiAqIGdlbmVyYXRvcnMgbGlrZSBDaHJvbWl1bSAyOSwganVzdCB1c2UgXCJyZXR1cm5cIiBpbiB5b3VyIGdlbmVyYXRvclxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgc3Vycm91bmRpbmcgZ2VuZXJhdG9yXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyBFUzYgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcbiAqIH0pXG4gKiAvLyBPbGRlciBTcGlkZXJNb25rZXkgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xuICogfSlcbiAqL1xuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XG5mdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IFFSZXR1cm5WYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXG4gKiBhcmUgc2V0dGxlZCBhbmQgcGFzc2VkIGFzIHZhbHVlcyAoYHRoaXNgIGlzIGFsc28gc2V0dGxlZCBhbmQgcGFzc2VkXG4gKiBhcyBhIHZhbHVlKS4gIEl0IHdpbGwgYWxzbyBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0IG9mIGEgZnVuY3Rpb24gaXNcbiAqIGFsd2F5cyBhIHByb21pc2UuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XG4gKiAgICAgcmV0dXJuIGEgKyBiO1xuICogfSk7XG4gKiBhZGQoUShhKSwgUShCKSk7XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXG4gKi9cblEucHJvbWlzZWQgPSBwcm9taXNlZDtcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNwcmVhZChbdGhpcywgYWxsKGFyZ3VtZW50cyldLCBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cbiAqIEBwYXJhbSBvYmplY3QqIHRoZSByZWNpcGllbnRcbiAqIEBwYXJhbSBvcCB0aGUgbmFtZSBvZiB0aGUgbWVzc2FnZSBvcGVyYXRpb24sIGUuZy4sIFwid2hlblwiLFxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIHJlc3VsdCB7UHJvbWlzZX0gYSBwcm9taXNlIGZvciB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb25cbiAqL1xuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuZnVuY3Rpb24gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2gob3AsIGFyZ3MpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uIChvcCwgYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZ2V0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5RLmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSAgICAgbmV3IHZhbHVlIG9mIHByb3BlcnR5XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZGVsZXRlXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5kZWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxuICogICAgICAgICAgICAgICAgICBpbnZvY2F0aW9uIGFyZ3VtZW50cyBmb3IgcHJvbWlzZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICBhcmUgdWx0aW1hdGVseSBiYWNrZWQgd2l0aCBgcmVzb2x2ZWAgdmFsdWVzLFxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcbiAqICAgICAgICAgICAgICAgICAgd2hlcmVpbiB0aGUgcG9zdGVkIHZhbHVlIGNhbiBiZSBhbnlcbiAqICAgICAgICAgICAgICAgICAgSlNPTiBzZXJpYWxpemFibGUgb2JqZWN0LlxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cbi8vIGJvdW5kIGxvY2FsbHkgYmVjYXVzZSBpdCBpcyB1c2VkIGJ5IG90aGVyIG1ldGhvZHNcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgaW52b2NhdGlvbiBhcmd1bWVudHNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIGFyZ3MgICAgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYXBwbHkgPSBmdW5jdGlvbiAob2JqZWN0LCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUVtcInRyeVwiXSA9XG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cyldKTtcbn07XG5cbi8qKlxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXG4gKiBwcm9taXNlIGFuZCB0aHJvd24gZXJyb3JzIGludG8gYSByZWplY3RlZCBvbmUuXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZiaW5kID0gZnVuY3Rpb24gKG9iamVjdCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxuICogb2JqZWN0IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxuICovXG5RLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkuICBJZiBhbnkgb2ZcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqL1xuLy8gQnkgTWFyayBNaWxsZXJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxuUS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHZhciBjb3VudERvd24gPSAwO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc25hcHNob3Q7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXG4gICAgICAgICAgICAgICAgKHNuYXBzaG90ID0gcHJvbWlzZS5pbnNwZWN0KCkpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKytjb3VudERvd247XG4gICAgICAgICAgICAgICAgd2hlbihcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLWNvdW50RG93biA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogcHJvZ3Jlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICBpZiAoY291bnREb3duID09PSAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGwodGhpcyk7XG59O1xuXG4vKipcbiAqIFdhaXRzIGZvciBhbGwgcHJvbWlzZXMgdG8gYmUgc2V0dGxlZCwgZWl0aGVyIGZ1bGZpbGxlZCBvclxuICogcmVqZWN0ZWQuICBUaGlzIGlzIGRpc3RpbmN0IGZyb20gYGFsbGAgc2luY2UgdGhhdCB3b3VsZCBzdG9wXG4gKiB3YWl0aW5nIGF0IHRoZSBmaXJzdCByZWplY3Rpb24uICBUaGUgcHJvbWlzZSByZXR1cm5lZCBieVxuICogYGFsbFJlc29sdmVkYCB3aWxsIG5ldmVyIGJlIHJlamVjdGVkLlxuICogQHBhcmFtIHByb21pc2VzIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgKG9yIGFuIGFycmF5KSBvZiBwcm9taXNlc1xuICogKG9yIHZhbHVlcylcbiAqIEByZXR1cm4gYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBwcm9taXNlc1xuICovXG5RLmFsbFJlc29sdmVkID0gZGVwcmVjYXRlKGFsbFJlc29sdmVkLCBcImFsbFJlc29sdmVkXCIsIFwiYWxsU2V0dGxlZFwiKTtcbmZ1bmN0aW9uIGFsbFJlc29sdmVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIHdoZW4ocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICBwcm9taXNlcyA9IGFycmF5X21hcChwcm9taXNlcywgUSk7XG4gICAgICAgIHJldHVybiB3aGVuKGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gd2hlbihwcm9taXNlLCBub29wLCBub29wKTtcbiAgICAgICAgfSkpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZXM7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5hbGxSZXNvbHZlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYWxsUmVzb2x2ZWQodGhpcyk7XG59O1xuXG4vKipcbiAqIEBzZWUgUHJvbWlzZSNhbGxTZXR0bGVkXG4gKi9cblEuYWxsU2V0dGxlZCA9IGFsbFNldHRsZWQ7XG5mdW5jdGlvbiBhbGxTZXR0bGVkKHByb21pc2VzKSB7XG4gICAgcmV0dXJuIFEocHJvbWlzZXMpLmFsbFNldHRsZWQoKTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdGhlaXIgc3RhdGVzIChhc1xuICogcmV0dXJuZWQgYnkgYGluc3BlY3RgKSB3aGVuIHRoZXkgaGF2ZSBhbGwgc2V0dGxlZC5cbiAqIEBwYXJhbSB7QXJyYXlbQW55Kl19IHZhbHVlcyBhbiBhcnJheSAob3IgcHJvbWlzZSBmb3IgYW4gYXJyYXkpIG9mIHZhbHVlcyAob3JcbiAqIHByb21pc2VzIGZvciB2YWx1ZXMpXG4gKiBAcmV0dXJucyB7QXJyYXlbU3RhdGVdfSBhbiBhcnJheSBvZiBzdGF0ZXMgZm9yIHRoZSByZXNwZWN0aXZlIHZhbHVlcy5cbiAqL1xuUHJvbWlzZS5wcm90b3R5cGUuYWxsU2V0dGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uIChwcm9taXNlcykge1xuICAgICAgICByZXR1cm4gYWxsKGFycmF5X21hcChwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBRKHByb21pc2UpO1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVnYXJkbGVzcygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZS5pbnNwZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuKHJlZ2FyZGxlc3MsIHJlZ2FyZGxlc3MpO1xuICAgICAgICB9KSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENhcHR1cmVzIHRoZSBmYWlsdXJlIG9mIGEgcHJvbWlzZSwgZ2l2aW5nIGFuIG9wb3J0dW5pdHkgdG8gcmVjb3ZlclxuICogd2l0aCBhIGNhbGxiYWNrLiAgSWYgdGhlIGdpdmVuIHByb21pc2UgaXMgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcbiAqIHByb21pc2UgaXMgZnVsZmlsbGVkLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGZvciBzb21ldGhpbmdcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIGZ1bGZpbGwgdGhlIHJldHVybmVkIHByb21pc2UgaWYgdGhlXG4gKiBnaXZlbiBwcm9taXNlIGlzIHJlamVjdGVkXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGNhbGxiYWNrXG4gKi9cblEuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblFbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmFpbCA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAocmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgcmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBBdHRhY2hlcyBhIGxpc3RlbmVyIHRoYXQgY2FuIHJlc3BvbmQgdG8gcHJvZ3Jlc3Mgbm90aWZpY2F0aW9ucyBmcm9tIGFcbiAqIHByb21pc2UncyBvcmlnaW5hdGluZyBkZWZlcnJlZC4gVGhpcyBsaXN0ZW5lciByZWNlaXZlcyB0aGUgZXhhY3QgYXJndW1lbnRzXG4gKiBwYXNzZWQgdG8gYGBkZWZlcnJlZC5ub3RpZnlgYC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byByZWNlaXZlIGFueSBwcm9ncmVzcyBub3RpZmljYXRpb25zXG4gKiBAcmV0dXJucyB0aGUgZ2l2ZW4gcHJvbWlzZSwgdW5jaGFuZ2VkXG4gKi9cblEucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbmZ1bmN0aW9uIHByb2dyZXNzKG9iamVjdCwgcHJvZ3Jlc3NlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24gKHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKHZvaWQgMCwgdm9pZCAwLCBwcm9ncmVzc2VkKTtcbn07XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gb3Bwb3J0dW5pdHkgdG8gb2JzZXJ2ZSB0aGUgc2V0dGxpbmcgb2YgYSBwcm9taXNlLFxuICogcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBwcm9taXNlIGlzIGZ1bGZpbGxlZCBvciByZWplY3RlZC4gIEZvcndhcmRzXG4gKiB0aGUgcmVzb2x1dGlvbiB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aGVuIHRoZSBjYWxsYmFjayBpcyBkb25lLlxuICogVGhlIGNhbGxiYWNrIGNhbiByZXR1cm4gYSBwcm9taXNlIHRvIGRlZmVyIGNvbXBsZXRpb24uXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHRvIG9ic2VydmUgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuXG4gKiBwcm9taXNlLCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIHdoZW5cbiAqIGBgZmluYGAgaXMgZG9uZS5cbiAqL1xuUS5maW4gPSAvLyBYWFggbGVnYWN5XG5RW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KVtcImZpbmFsbHlcIl0oY2FsbGJhY2spO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmluID0gLy8gWFhYIGxlZ2FjeVxuUHJvbWlzZS5wcm90b3R5cGVbXCJmaW5hbGx5XCJdID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBRKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suZmNhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUT0RPIGF0dGVtcHQgdG8gcmVjeWNsZSB0aGUgcmVqZWN0aW9uIHdpdGggXCJ0aGlzXCIuXG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogVGVybWluYXRlcyBhIGNoYWluIG9mIHByb21pc2VzLCBmb3JjaW5nIHJlamVjdGlvbnMgdG8gYmVcbiAqIHRocm93biBhcyBleGNlcHRpb25zLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlIGF0IHRoZSBlbmQgb2YgYSBjaGFpbiBvZiBwcm9taXNlc1xuICogQHJldHVybnMgbm90aGluZ1xuICovXG5RLmRvbmUgPSBmdW5jdGlvbiAob2JqZWN0LCBmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZG9uZShmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzcyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgdmFyIG9uVW5oYW5kbGVkRXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgLy8gZm9yd2FyZCB0byBhIGZ1dHVyZSB0dXJuIHNvIHRoYXQgYGB3aGVuYGBcbiAgICAgICAgLy8gZG9lcyBub3QgY2F0Y2ggaXQgYW5kIHR1cm4gaXQgaW50byBhIHJlamVjdGlvbi5cbiAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBtYWtlU3RhY2tUcmFjZUxvbmcoZXJyb3IsIHByb21pc2UpO1xuICAgICAgICAgICAgaWYgKFEub25lcnJvcikge1xuICAgICAgICAgICAgICAgIFEub25lcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQXZvaWQgdW5uZWNlc3NhcnkgYG5leHRUaWNrYGluZyB2aWEgYW4gdW5uZWNlc3NhcnkgYHdoZW5gLlxuICAgIHZhciBwcm9taXNlID0gZnVsZmlsbGVkIHx8IHJlamVjdGVkIHx8IHByb2dyZXNzID9cbiAgICAgICAgdGhpcy50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSA6XG4gICAgICAgIHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2VzcyAmJiBwcm9jZXNzLmRvbWFpbikge1xuICAgICAgICBvblVuaGFuZGxlZEVycm9yID0gcHJvY2Vzcy5kb21haW4uYmluZChvblVuaGFuZGxlZEVycm9yKTtcbiAgICB9XG5cbiAgICBwcm9taXNlLnRoZW4odm9pZCAwLCBvblVuaGFuZGxlZEVycm9yKTtcbn07XG5cbi8qKlxuICogQ2F1c2VzIGEgcHJvbWlzZSB0byBiZSByZWplY3RlZCBpZiBpdCBkb2VzIG5vdCBnZXQgZnVsZmlsbGVkIGJlZm9yZVxuICogc29tZSBtaWxsaXNlY29uZHMgdGltZSBvdXQuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHMgdGltZW91dFxuICogQHBhcmFtIHtBbnkqfSBjdXN0b20gZXJyb3IgbWVzc2FnZSBvciBFcnJvciBvYmplY3QgKG9wdGlvbmFsKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSBpZiBpdCBpc1xuICogZnVsZmlsbGVkIGJlZm9yZSB0aGUgdGltZW91dCwgb3RoZXJ3aXNlIHJlamVjdGVkLlxuICovXG5RLnRpbWVvdXQgPSBmdW5jdGlvbiAob2JqZWN0LCBtcywgZXJyb3IpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRpbWVvdXQobXMsIGVycm9yKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbiAobXMsIGVycm9yKSB7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghZXJyb3IgfHwgXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGVycm9yKSB7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihlcnJvciB8fCBcIlRpbWVkIG91dCBhZnRlciBcIiArIG1zICsgXCIgbXNcIik7XG4gICAgICAgICAgICBlcnJvci5jb2RlID0gXCJFVElNRURPVVRcIjtcbiAgICAgICAgfVxuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuICAgIH0sIG1zKTtcblxuICAgIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWUpO1xuICAgIH0sIGZ1bmN0aW9uIChleGNlcHRpb24pIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChleGNlcHRpb24pO1xuICAgIH0sIGRlZmVycmVkLm5vdGlmeSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSBnaXZlbiB2YWx1ZSAob3IgcHJvbWlzZWQgdmFsdWUpLCBzb21lXG4gKiBtaWxsaXNlY29uZHMgYWZ0ZXIgaXQgcmVzb2x2ZWQuIFBhc3NlcyByZWplY3Rpb25zIGltbWVkaWF0ZWx5LlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge051bWJlcn0gbWlsbGlzZWNvbmRzXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGFmdGVyIG1pbGxpc2Vjb25kc1xuICogdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZS5cbiAqIElmIHRoZSBnaXZlbiBwcm9taXNlIHJlamVjdHMsIHRoYXQgaXMgcGFzc2VkIGltbWVkaWF0ZWx5LlxuICovXG5RLmRlbGF5ID0gZnVuY3Rpb24gKG9iamVjdCwgdGltZW91dCkge1xuICAgIGlmICh0aW1lb3V0ID09PSB2b2lkIDApIHtcbiAgICAgICAgdGltZW91dCA9IG9iamVjdDtcbiAgICAgICAgb2JqZWN0ID0gdm9pZCAwO1xuICAgIH1cbiAgICByZXR1cm4gUShvYmplY3QpLmRlbGF5KHRpbWVvdXQpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbiAodGltZW91dCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUGFzc2VzIGEgY29udGludWF0aW9uIHRvIGEgTm9kZSBmdW5jdGlvbiwgd2hpY2ggaXMgY2FsbGVkIHdpdGggdGhlIGdpdmVuXG4gKiBhcmd1bWVudHMgcHJvdmlkZWQgYXMgYW4gYXJyYXksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqXG4gKiAgICAgIFEubmZhcHBseShGUy5yZWFkRmlsZSwgW19fZmlsZW5hbWVdKVxuICogICAgICAudGhlbihmdW5jdGlvbiAoY29udGVudCkge1xuICogICAgICB9KVxuICpcbiAqL1xuUS5uZmFwcGx5ID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmFwcGx5ID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmZhcHBseShub2RlQXJncykuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBpbmRpdmlkdWFsbHksIGFuZCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mY2FsbChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSlcbiAqIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiB9KVxuICpcbiAqL1xuUS5uZmNhbGwgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIFEoY2FsbGJhY2spLm5mYXBwbHkoYXJncyk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFdyYXBzIGEgTm9kZUpTIGNvbnRpbnVhdGlvbiBwYXNzaW5nIGZ1bmN0aW9uIGFuZCByZXR1cm5zIGFuIGVxdWl2YWxlbnRcbiAqIHZlcnNpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIEBleGFtcGxlXG4gKiBRLm5mYmluZChGUy5yZWFkRmlsZSwgX19maWxlbmFtZSkoXCJ1dGYtOFwiKVxuICogLnRoZW4oY29uc29sZS5sb2cpXG4gKiAuZG9uZSgpXG4gKi9cblEubmZiaW5kID1cblEuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgUShjYWxsYmFjaykuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uZmJpbmQgPVxuUHJvbWlzZS5wcm90b3R5cGUuZGVub2RlaWZ5ID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICByZXR1cm4gUS5kZW5vZGVpZnkuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cblEubmJpbmQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIGJhc2VBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZUFyZ3MgPSBiYXNlQXJncy5jb25jYXQoYXJyYXlfc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICAgICAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpc3AsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgUShib3VuZCkuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5uYmluZCA9IGZ1bmN0aW9uICgvKnRoaXNwLCAuLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMCk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLm5iaW5kLmFwcGx5KHZvaWQgMCwgYXJncyk7XG59O1xuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9mIGEgTm9kZS1zdHlsZSBvYmplY3QgdGhhdCBhY2NlcHRzIGEgTm9kZS1zdHlsZVxuICogY2FsbGJhY2sgd2l0aCBhIGdpdmVuIGFycmF5IG9mIGFyZ3VtZW50cywgcGx1cyBhIHByb3ZpZGVkIGNhbGxiYWNrLlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIHtBcnJheX0gYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2tcbiAqIHdpbGwgYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5ubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEubnBvc3QgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ucG9zdChuYW1lLCBhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUHJvbWlzZS5wcm90b3R5cGUubnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3MgfHwgW10pO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjaywgZm9yd2FyZGluZyB0aGUgZ2l2ZW4gdmFyaWFkaWMgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWRcbiAqIGNhbGxiYWNrIGFyZ3VtZW50LlxuICogQHBhcmFtIG9iamVjdCBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIG5hbWVkIG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgbWV0aG9kIG9mIG9iamVjdFxuICogQHBhcmFtIC4uLmFyZ3MgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZDsgdGhlIGNhbGxiYWNrIHdpbGxcbiAqIGJlIHByb3ZpZGVkIGJ5IFEgYW5kIGFwcGVuZGVkIHRvIHRoZXNlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9yIGVycm9yXG4gKi9cblEubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUS5ubWNhbGwgPSAvLyBYWFggQmFzZWQgb24gXCJSZWRzYW5kcm8nc1wiIHByb3Bvc2FsXG5RLm5pbnZva2UgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICBRKG9iamVjdCkuZGlzcGF0Y2goXCJwb3N0XCIsIFtuYW1lLCBub2RlQXJnc10pLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5zZW5kID0gLy8gWFhYIEJhc2VkIG9uIE1hcmsgTWlsbGVyJ3MgcHJvcG9zZWQgXCJzZW5kXCJcblByb21pc2UucHJvdG90eXBlLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblByb21pc2UucHJvdG90eXBlLm5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBJZiBhIGZ1bmN0aW9uIHdvdWxkIGxpa2UgdG8gc3VwcG9ydCBib3RoIE5vZGUgY29udGludWF0aW9uLXBhc3Npbmctc3R5bGUgYW5kXG4gKiBwcm9taXNlLXJldHVybmluZy1zdHlsZSwgaXQgY2FuIGVuZCBpdHMgaW50ZXJuYWwgcHJvbWlzZSBjaGFpbiB3aXRoXG4gKiBgbm9kZWlmeShub2RlYmFjaylgLCBmb3J3YXJkaW5nIHRoZSBvcHRpb25hbCBub2RlYmFjayBhcmd1bWVudC4gIElmIHRoZSB1c2VyXG4gKiBlbGVjdHMgdG8gdXNlIGEgbm9kZWJhY2ssIHRoZSByZXN1bHQgd2lsbCBiZSBzZW50IHRoZXJlLiAgSWYgdGhleSBkbyBub3RcbiAqIHBhc3MgYSBub2RlYmFjaywgdGhleSB3aWxsIHJlY2VpdmUgdGhlIHJlc3VsdCBwcm9taXNlLlxuICogQHBhcmFtIG9iamVjdCBhIHJlc3VsdCAob3IgYSBwcm9taXNlIGZvciBhIHJlc3VsdClcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG5vZGViYWNrIGEgTm9kZS5qcy1zdHlsZSBjYWxsYmFja1xuICogQHJldHVybnMgZWl0aGVyIHRoZSBwcm9taXNlIG9yIG5vdGhpbmdcbiAqL1xuUS5ub2RlaWZ5ID0gbm9kZWlmeTtcbmZ1bmN0aW9uIG5vZGVpZnkob2JqZWN0LCBub2RlYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdCkubm9kZWlmeShub2RlYmFjayk7XG59XG5cblByb21pc2UucHJvdG90eXBlLm5vZGVpZnkgPSBmdW5jdGlvbiAobm9kZWJhY2spIHtcbiAgICBpZiAobm9kZWJhY2spIHtcbiAgICAgICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbm9kZWJhY2soZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn07XG5cbi8vIEFsbCBjb2RlIGJlZm9yZSB0aGlzIHBvaW50IHdpbGwgYmUgZmlsdGVyZWQgZnJvbSBzdGFjayB0cmFjZXMuXG52YXIgcUVuZGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xuXG5yZXR1cm4gUTtcblxufSk7XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgdGhpcy50ZXh0ID0gdGhpcy54aHIucmVzcG9uc2VUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiBzdHIubGVuZ3RoXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cyB8fCAxMjIzID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHRyeSB7XG4gICAgICB2YXIgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgICAgaWYgKCdIRUFEJyA9PSBtZXRob2QpIHJlcy50ZXh0ID0gbnVsbDtcbiAgICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChmaWVsZCwgZmlsZSwgZmlsZW5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAsIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gcXVlcnlzdHJpbmdcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtdWx0aXBsZSBkYXRhIFwid3JpdGVzXCJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLnNlbmQoeyBzZWFyY2g6ICdxdWVyeScgfSlcbiAqICAgICAgICAgLnNlbmQoeyByYW5nZTogJzEuLjUnIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgb3JkZXI6ICdkZXNjJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAgKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAgKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSl7XG4gIHZhciBvYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKG9iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmopIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICBpZiAoMiA9PSBmbi5sZW5ndGgpIHJldHVybiBmbihlcnIsIHJlcyk7XG4gIGlmIChlcnIpIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgZm4ocmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ09yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcigndGltZW91dCBvZiAnICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuICAgIGlmICgwID09IHhoci5zdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLmFib3J0ZWQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIGlmICh4aHIudXBsb2FkKSB7XG4gICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiXX0=
