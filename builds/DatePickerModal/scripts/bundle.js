(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){



var modulesDir = "./../../modules/";

translationStrategy = require('./../../modules/translationStrategies/waTr.js');

var tr = require('./../../modules/tr.js');
tr.setStrategy(translationStrategy);

window.DatePickerModal = require('./../../modules/DatePicker/DatePickerModal.jsx');
window.SearchDate = require('./../../modules/containers/SearchDate.js');


},{"./../../modules/DatePicker/DatePickerModal.jsx":6,"./../../modules/containers/SearchDate.js":11,"./../../modules/tr.js":13,"./../../modules/translationStrategies/waTr.js":14}],2:[function(require,module,exports){
/** @jsx React.DOM */

/* part is from https://github.com/Hanse/react-calendar/blob/master/src/calendar.js */

var React = (window.React);
var moment = (window.moment);



var Calendar = React.createClass({displayName: 'Calendar',

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


},{}],3:[function(require,module,exports){
/** @jsx React.DOM */

var React = (window.React);

var CalendarDay = React.createClass({displayName: 'CalendarDay',

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

},{}],4:[function(require,module,exports){
/** @jsx React.DOM */

var React = (window.React);
var moment = (window.moment);

var CalendarDay = require("./CalendarDay.jsx");
var Calendar = require("./../Calendar.jsx");

var CalendarFrame = React.createClass({displayName: 'CalendarFrame',

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
        this.setValue({mode: "interval", from: date, to: null},"select");
      } else if (!this.props.value.to) {
        //if is before, just put start date again
        if (date < this.props.value.from) {
          this.setValue({mode: "interval", from: date, to: null},"select");
        } else {
          this.setValue({mode: "interval", from: moment.utc(this.props.value.from), to: date},"selectComplete");
        }

      } else {
        // if i have chosen both i start to pick new one
        this.setValue({mode: "interval", from: date, to: null},"select");
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
          React.createElement(Calendar, {date: date, getDay: self.getDay})
        )
      );
    });
    return (
      React.createElement("div", null, 
        React.createElement("div", {className: "prev", onClick: this.prev}, React.createElement("div", null)), 
        calendars, 
        React.createElement("div", {className: "next", onClick: this.next}, React.createElement("div", null)), 
        React.createElement("div", {className: "clear-both"})
      )
    )
  }
});

module.exports = CalendarFrame;

},{"./../Calendar.jsx":2,"./CalendarDay.jsx":3}],5:[function(require,module,exports){
/** @jsx React.DOM */

var React = (window.React);
var SearchDate = require('./../containers/SearchDate.js');

var CalendarFrame = require('./CalendarFrame.jsx');
var MonthMatrix = require("./MonthMatrix.jsx");
var Slider = require('./Slider.js');
var tr = require('./../tr.js');
var isIE = require('./../tools/isIE.js');


React.initializeTouchEvents(true);

var moment = (window.moment);


var Handle = React.createClass({displayName: 'Handle',
  render: function() {
    return (
      React.createElement("div", {className: "handle"}, 
        this.props.sliderValue
      )
    );
  }
});




var DatePicker = React.createClass({displayName: 'DatePicker',

  getInitialState: function() {
    return {
      value: this.props.value ? this.props.value : new SearchDate(), //TODO decide if it will be here or in CalendarFrame
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
          newValue = new SearchDate(self.getValue());
          newValue.mode = mode;
          self.changeValue(newValue, "release"); // should by something like change mode, but it finishes value only after release so TODO make it smarter
          break;

        case "anytime":
        case "noReturn":
          newValue = new SearchDate(self.getValue());
          newValue.mode = mode;
          self.changeValue(newValue, "select");
          break;
        default:
      }
      self.setState({
        viewMode: mode
      });
    }
  },

  changeValue: function (value,changeType) {
    var newValue = new SearchDate(this.getValue());
    if (value) {
      newValue.mergeInto(value);
    }
    newValue.final = !!(this.props.modes[newValue.mode] && this.props.modes[newValue.mode].finishAfter == changeType);

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
    if (value > this.state.maxStayDays) {
      return;
    }
    this.changeValue({
      mode: "timeToStay",
      minStayDays: value,
      maxStayDays: this.getValue().maxStayDays
    }, "select");
  },

  changeMaxStayDays: function (value) {
    if (value < this.state.minStayDays) {
      return;
    }
    this.changeValue({
      mode: "timeToStay",
      minStayDays: this.getValue().minStayDays,
      maxStayDays: value
    }, "select");
  },


  releaseMinStayDays: function () {
    // do not change value, but trigger it with different change type
    this.changeValue(null, "release");
  },
  releaseMaxStayDays: function () {
    this.changeValue(null, "release");
  },
  //setAnytime: function () {
  //  this.changeValue({
  //    mode: "anytime"
  //  });
  //},
  //
  //setNoReturn: function () {
  //  this.changeValue({
  //    mode: "noReturn"
  //  });
  //},

  calculateStyles: function (mode) {
    var styles;
    var widths = this.props.widths;
    var offset = this.props.leftOffset;
    var maxWidth = this.props.maxWidth;

    if (offset + widths[mode] < maxWidth) {
      //KEEP IT
      styles = {
        marginLeft: offset,
        width: widths[mode]
      };
    } else if (offset + widths[mode] > maxWidth && widths[mode] < maxWidth) {
      //MOVE IT
      var missingSpace = offset + widths[mode] - maxWidth;
      styles = {
        marginLeft: offset - missingSpace,
        width: widths[mode]
      };
    } else {
      //MAKE IT SMALLER
      styles = {
        marginLeft: offset,
        width: widths[mode]
      };
    }
    return styles;
  },

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
    return (React.createElement(MonthMatrix, {minValue: this.props.minValue, onSet: this.setMonth}));
  },
  renderTimeToStay: function () {
    var headline = tr("Stay time from %s to %s days.", "stay_time_from", [this.getValue().minStayDays, this.getValue().maxStayDays] );
    return (
      React.createElement("div", {className: "time-to-stay"}, 
        React.createElement("div", {className: "content-headline"}, headline), 
        React.createElement(Slider, {step: 1, minValue: 1, maxValue: 31, value: this.getValue().minStayDays, onRelease: this.releaseMinStayDays, onChange: this.changeMinStayDays, className: "slider sliderMin horizontal-slider"}, 
          React.createElement(Handle, null)
        ), 
        React.createElement(Slider, {step: 1, minValue: 1, maxValue: 31, value: this.getValue().maxStayDays, onRelease: this.releaseMaxStayDays, onChange: this.changeMaxStayDays, className: "slider sliderMax horizontal-slider"}, 
          React.createElement(Handle, null)
        ), 
        React.createElement("div", {className: "slider-axe"})
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
    var styles = this.calculateStyles(mode);

    var modeOptions = [];
    for (var imode in this.props.modes) {
      if (this.props.modes[imode]) {
        modeOptions.push(React.createElement("div", {key: imode, className:  (mode == imode) ? "active" : "", onClick:  this.switchModeTo(imode) },  this.getModeLabel(imode) ))
      }
    }
    if (isIE(8,'lte')) {
      styles = {};
    }
    return (
      React.createElement("div", {className: 'wa-date-picker '+mode, style: styles}, 
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

},{"./../containers/SearchDate.js":11,"./../tools/isIE.js":12,"./../tr.js":13,"./CalendarFrame.jsx":4,"./MonthMatrix.jsx":8,"./Slider.js":9}],6:[function(require,module,exports){
/** @jsx React.DOM */

var DatePickerModalComponent = require("./DatePickerModalComponent.jsx");
var SearchDate = require('./../containers/SearchDate.js');
var moment = (window.moment);

/**
 * show modal datepicker (only one important function for DatePicker)
 * it hides itself and take care that it is only one on page
 * @param{Object} options
 * @param{HTMLElement} options.element - plain html element to bind, it takes boundaries of that object
 * @param{SearchDate} options.value - value
 * @param{Object} options.modesEnabled - example and default value is below
 * @param{string} options.locale - (cs,en,...)
 * ------- TODO @param{bool} options.hideOnElementClick - (default: false)
 * @param{function(SearchDate)} options.onChange - callback on every change
 */

/* responsibility: make simple plain js api */

  function DatePickerModal(options) {"use strict";
    this.options = options;

    if (!options.defaultValue) {
      options.defaultValue = new SearchDate();
    }
    if (!options.onHide) {
      options.onHide = function() {};
    }
    if (!options.appendToElement) {
      options.appendToElement = document.body;
    }
    this.value = options.defaultValue;

    if (options.locale) {
      moment.locale(options.locale);
    }
    this.$DatePickerModal_loadModes();
    this.$DatePickerModal_mergeSizes();
    this.$DatePickerModal_createComponent();
  }

  DatePickerModal.prototype.$DatePickerModal_mergeSizes=function() {"use strict";
    /* default sizes are from whichairline */
    var widths = {
      single: 454,
      interval: 907,
      month: 550,
      timeToStay: 550,
      anytime: 550,
      noReturn: 550
    };
    if (!this.options.widths) {
      this.options.widths = {};
    }
    for (var widthName in widths) {
      if (!this.options.widths[widthName]) {
        this.options.widths[widthName] = widths[widthName];
      }
    }
  };
  DatePickerModal.prototype.$DatePickerModal_loadModes=function() {"use strict";
    var defaultModes = {
      "single": {
        closeAfter: "select", // select
        finishAfter: "select" // select
      },
      "interval": {
        closeAfter: "selectComplete", // select
        finishAfter: "selectComplete" // selectComplete | select
      },
      "month": {
        closeAfter: "select", // select
        finishAfter: "select" // select
      },
      "timeToStay": {
        closeAfter: "", //TODO on click "ok"
        finishAfter: "release" // release | select
      },
      "anytime": {
        closeAfter: "select", // select
        finishAfter: "select" // select
      },
      "noReturn": {
        closeAfter: "select", // select
        finishAfter: "select" // select
      }
    };
    var modes = {};
    for (var mode in this.options.modes) {
      if (this.options.modes[mode]) {
        if (typeof this.options.modes[mode] == 'object') {
          modes[mode] = this.options.modes[mode]
        } else {
          modes[mode] = defaultModes[mode]
        }
      }
    }
    this.options.modes = modes;
  };
  DatePickerModal.prototype.$DatePickerModal_createComponent=function() {"use strict";

    var div = document.createElement('div');
    div.setAttribute('class', 'datepicker-modal-container-element');
    this.options.appendToElement.appendChild(div);
    this.htmlElement = div;

    var root = React.createFactory(DatePickerModalComponent);

    this.component = React.render(root(), this.htmlElement);
    this.component.setProps({
      inputElement: this.options.element,
      value: this.value,
      minValue: this.options.minValue,
      onChange: this.options.onChange,
      onHide: this.options.onHide,
      modes: this.options.modes,
      widths: this.options.widths
    });

  };
  DatePickerModal.prototype.show=function() {"use strict";
    this.component.setState({
      shown: true
    });
  };
  DatePickerModal.prototype.hide=function() {"use strict";
    this.component.hide();
  };
  DatePickerModal.prototype.setValue=function(newValue) {"use strict";
    this.value = newValue;
    if (!this.value) {
      this.value = new SearchDate();
    }
    this.component.setProps({
      value: this.value
    });
  };


module.exports = DatePickerModal;


},{"./../containers/SearchDate.js":11,"./DatePickerModalComponent.jsx":7}],7:[function(require,module,exports){
/** @jsx React.DOM */

var DatePicker = require("./DatePicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');
var isIE = require('./../tools/isIE.js');
var moment = (window.moment);


var DatePickerModalComponent = React.createClass({displayName: 'DatePickerModalComponent',
  getInitialState: function() {
    return {
      shown: false
    };
  },
  hide: function () {
    this.props.onHide();
    this.setState({
      shown: false
    });
  },
  show: function () {
    this.setState({
      shown: true
    });
  },

  clickOutside: function (e) {
    if (this.refs.datePicker) {
      if ($(this.refs.datePicker.getDOMNode()).has(e.target).length) return;
    }
    //if (options.hideOnElementClick) {
    if ($(this.props.inputElement).is(e.target)) return;
    if ($(this.props.inputElement).has(e.target).length) return;
    //}
    this.hide();
  },

  onChange: function (value, changeType) {
    if (this.props.modes[value.mode] && this.props.modes[value.mode].closeAfter == changeType) {
      this.hide();
    }
    this.props.onChange(value, changeType);
  },

  componentDidMount: function() {
    document.addEventListener("click", this.clickOutside, false);
  },
  componentWillUnmount: function() {
    document.removeEventListener("click", this.clickOutside, false);
  },
  render: function() {
    if (!this.state.shown) {
      return (
        React.createElement("div", null)
      );
    }

    var rect = this.props.inputElement.getBoundingClientRect();
    var position = {
      top: rect.bottom + window.pageYOffset,
      left: rect.left
    };
    var pageWidth = $(window).width();
    var styles = {
      top: position.top + "px"
    };
    if (isIE(8,'lte')) {
      styles = {};
    }
    return (
      React.createElement("div", {className: "wa-date-picker-modal", style: styles}, 
        React.createElement(DatePicker, {
          ref: "datePicker", 
          weekOffset: 1, 
          value: this.props.value, 
          minValue: this.props.minValue, 
          onChange: this.onChange, 
          leftOffset: position.left, 
          maxWidth: pageWidth, 
          modes: this.props.modes, 
          hide: this.hide, //TODO reamove
          widths: this.props.widths
        })
      )
    );
  }
});

module.exports = DatePickerModalComponent;



},{"./../containers/SearchDate.js":11,"./../tools/isIE.js":12,"./DatePicker.jsx":5}],8:[function(require,module,exports){
/** @jsx React.DOM */

var React = (window.React);
var moment = (window.moment);
var Tran = require('./../Tran.jsx');

var MonthMatrix = React.createClass({displayName: 'MonthMatrix',

  setMonth: function (month) {
    var that = this;
    return function () {
      that.props.onSet(month);
    }
  },
  render: function() {
    var self = this;
    var months = [];
    var iMonth = moment.utc();
    for (var i = 0; i < 9; i++) {
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
        React.createElement("div", {className: "content-headline"}, React.createElement(Tran, null, "Select month")), 
        React.createElement("div", {className: "months"}, 
          monthsElements
        )
      )
    );
  }
});

module.exports = MonthMatrix;

},{"./../Tran.jsx":10}],9:[function(require,module,exports){
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

    getInitialState: function() {
      return {
        lowerBound: 0,
        upperBound: 0,
        handleWidth: 0,
        sliderMin: 0,
        sliderMax: 0
      };
    },

    componentDidMount: function() {
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


      this.setState({
        upperBound: upperBound,
        handleWidth: handle[size],
        sliderMin: rect[position.min],
        sliderMax: rect[position.max] - handle[size]
      });
    },
    getOffset: function () {
      var ratio = (this.props.value - this.props.minValue) / (this.props.maxValue - this.props.minValue);
      return ratio * this.state.upperBound;
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
      position = position - (this.state.handleWidth / 2);

      var lastValue = this.props.value;

      var ratio = (position - this.state.sliderMin) / (this.state.sliderMax - this.state.sliderMin);
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

},{}],10:[function(require,module,exports){
/** @jsx React.DOM */

var React = (window.React);
var tr = require('./tr.js');

/* react component wrapper of tr function */

var Tran = React.createClass({displayName: 'Tran',
  render: function() {
    var original = this.props.children;
    var key = this.props.key;
    return (
      React.createElement("span", null, 
				 tr(original,key) 
      )
    );
  }
});

module.exports = Tran;

},{"./tr.js":13}],11:[function(require,module,exports){
var moment = (window.moment);

var urlDateFormat = "YYYY-MM-DD";

/*
class SearchDate
it has state for all modes, bude for
  constructor
  input = plain object or string or just another SearchDate object
 */
SearchDate = function (input) {
  var plain = {};
  if (typeof input == "string") {
    plain = this.parseUrlString(input);
  } else if (typeof input == "object") {
    plain = input;
  }
  this.mode = plain.mode || "single";
  this.from = plain.from || moment.utc();
  this.to = plain.to || moment.utc();
  this.minStayDays = plain.minStayDays || 2;
  this.maxStayDays = plain.maxStayDays || 10;
  this.final = true;
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



SearchDate.prototype.getMode = function(mode) {
  return this.mode
};

SearchDate.prototype.getFrom = function(mode) {
  if (this.mode == "timeToStay" || this.mode == "noReturn") {
    return null;
  } else if (this.mode == "anytime") {
    return moment.utc().add(1,"days");
  } else {
    return this.from
  }
};

SearchDate.prototype.getTo = function(mode) {
  if (this.mode == "timeToStay" || this.mode == "noReturn") {
    return null;
  } else if (this.mode == "single") {
    return this.from
  } else if (this.mode == "anytime") {
    return moment.utc().add(6,"months");
  } else {
    return this.to
  }
};

SearchDate.prototype.getMinStayDays = function(mode) {
  if (this.mode == "timeToStay") {
    return this.minStayDays;
  } else {
    return null;
  }
};

SearchDate.prototype.getMaxStayDays = function(mode) {
  if (this.mode == "timeToStay") {
    return this.maxStayDays;
  } else {
    return null;
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

SearchDate.prototype.mergeInto = function(newValues){
  for (var attrname in newValues) {
    if(newValues.hasOwnProperty(attrname)){
      this[attrname] = newValues[attrname];
    }
  }
}


module.exports = SearchDate;

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){

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

},{}],14:[function(require,module,exports){

var tr = function (original,key,values) {
  var translates = window.globalTranslates;

  if (translates && translates[original]) {
    translated = translates[original]
  } else {
    if (!window.toTranslate) {
      window.toTranslate = {};
    }
    window.toTranslate[original] = original;
    translated = original;
  }

  if (values && values.length > 0) {
    for (var i = 0, j = values.length; i < j; i++){
      translated = translated.replace("%s",values[i])
    }
  }
  return translated;
};

module.exports = tr;

},{}]},{},[1]);
