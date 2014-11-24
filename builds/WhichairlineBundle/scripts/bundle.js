(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */window.DatePickerModal = require('./../../modules/DatePicker/DatePickerModal.jsx');
window.SearchDate = require('./../../modules/containers/SearchDate.js');
window.DealsList = require('./../../modules/DealsList.jsx');
window.SkypickerAPIv1 = require('./../../modules/SkypickerAPIv1.js');
window.SkypickerTools = require('./../../modules/SkypickerTools.js');

},{"./../../modules/DatePicker/DatePickerModal.jsx":6,"./../../modules/DealsList.jsx":10,"./../../modules/SkypickerAPIv1.js":11,"./../../modules/SkypickerTools.js":12,"./../../modules/containers/SearchDate.js":14}],2:[function(require,module,exports){
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

  renderDay: function(day) {
    return this.props.getDay(day.date, day.otherMonth);
  },
  renderDayName: function (dayName) {
    return React.DOM.div({className: "day-name"}, React.DOM.span(null, dayName ));
  },
  render: function() {
    return (
      React.DOM.div({className: "clndr"}, 
        React.DOM.div({className: "clndr-month"}, 
           this.props.date.format("MMMM YYYY") 
        ), 
        React.DOM.div({className: "clndr-grid"}, 
          React.DOM.div({className: "day-names"}, 
            this.dayNames().map(this.renderDayName)
          ), 
          React.DOM.div({className: "days"}, 
            this.days().map(this.renderDay)
          ), 
          React.DOM.div({className: "clear-both"})
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
        React.DOM.div({className: classes }, 
          React.DOM.span({className: "day-number"}, this.props.date.date())
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
      React.DOM.div({className: classes, onMouseEnter:  this.onOver, onClick:  this.onSelect}, 
        React.DOM.span({className: "day-number"}, this.props.date.date())
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

  setValue: function (value) {
    this.props.onChange(value)
  },

  onSelect: function (date) {
    if (this.props.selectionMode == "single") {
      //if single just select
      this.setValue({mode: "single", from: date, to: date});
    } else if (this.props.selectionMode == "interval") {
      //if interval decide on mode
      if (!this.props.value.from) {
        this.setValue({mode: "interval", from: date, to: null});
      } else if (!this.props.value.to) {
        //if is before, just put start date again
        if (date < this.props.value.from) {
          this.setValue({mode: "interval", from: date, to: null});
        } else {
          this.setValue({mode: "interval", from: moment.utc(this.props.value.from), to: date});
        }

      } else {
        // if i have chosen both i start to pick new one
        this.setValue({mode: "interval", from: date, to: null});
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
      CalendarDay({
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
        React.DOM.div({className: 'calendar-view calendar-view-'+j}, 
          Calendar({date: date, getDay: self.getDay})
        )
      );
    });
    return (
      React.DOM.div(null, 
        React.DOM.div({className: "prev", onClick: this.prev}, React.DOM.div(null)), 
        calendars, 
        React.DOM.div({className: "next", onClick: this.next}, React.DOM.div(null)), 
        React.DOM.div({className: "clear-both"})
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



React.initializeTouchEvents(true);

var moment = (window.moment);


var widths = {
  single: 454,
  interval: 907,
  month: 550,
  timeToStay: 550,
  anytime: 550,
  noReturn: 550
};


var Handle = React.createClass({displayName: 'Handle',
  render: function() {
    return (
      React.DOM.div({className: "handle"}, 
        this.props.sliderValue
      )
    );
  }
});




var DatePicker = React.createClass({displayName: 'DatePicker',

  getInitialState: function() {
    return {
      viewDate: this.props.value.from || moment.utc(), //TODO decide if it will be here or in CalendarFrame
      viewMode: this.props.value.mode
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
      single: tr("Single"),
      interval: tr("Interval"),
      month: tr("Months"),
      timeToStay: tr("Time to stay"),
      anytime: tr("Anytime"),
      noReturn: tr("No return")
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
          self.changeValue(newValue);
          break;

        case "anytime":
        case "noReturn":
          self.props.hide();
          newValue = new SearchDate(self.getValue());
          newValue.mode = mode;
          self.changeValue(newValue);
          break;
        default:
      }
      self.setState({
        viewMode: mode
      });
    }
  },

  changeValue: function (value) {
    var newValue = new SearchDate(this.props.value);
    newValue.mergeInto(value);
    this.props.onChange(newValue);
  },

  getValue: function () {
    return this.props.value;
  },

  setMonth: function (date) {
    this.changeValue({
      mode: "month",
      from: moment.utc(date).startOf('month'),
      to: moment.utc(date).endOf('month')
    });
  },

  changeMinStayDays: function (value) {

    if (value > this.state.maxStayDays) {
      return;
    }
    this.changeValue({
      mode: "timeToStay",
      minStayDays: value,
      maxStayDays: this.getValue().maxStayDays
    });
  },

  changeMaxStayDays: function (value) {
    if (value < this.state.minStayDays) {
      return;
    }
    this.changeValue({
      mode: "timeToStay",
      minStayDays: this.getValue().minStayDays,
      maxStayDays: value
    });
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
    if (this.props.leftOffset + widths[mode] < this.props.maxWidth) {
      //KEEP IT
      styles = {
        marginLeft: this.props.leftOffset,
        width: widths[mode]
      };
    } else if (this.props.leftOffset + widths[mode] > this.props.maxWidth && widths[mode] < this.props.maxWidth) {
      //MOVE IT
      var missingSpace = this.props.leftOffset + widths[mode] - this.props.maxWidth;
      styles = {
        marginLeft: this.props.leftOffset - missingSpace,
        width: widths[mode]
      };
    } else {
      //MAKE IT SMALLER
      styles = {
        marginLeft: this.props.leftOffset,
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
      CalendarFrame({onChange: this.changeValue, value: this.props.value, minValue: this.props.minValue, selectionMode: "single", calendarsNumber: 1})
    )
  },
  renderInterval: function () {
    return (
      CalendarFrame({onChange: this.changeValue, value: this.props.value, minValue: this.props.minValue, selectionMode: "interval", calendarsNumber: 3})
    )
  },
  renderMonth: function () {
    return (MonthMatrix({minValue: this.props.minValue, onSet: this.setMonth}));
  },
  renderTimeToStay: function () {
    var headline = tr("Stay time from %s to %s days.", this.getValue().minStayDays, this.getValue().maxStayDays);
    return (
      React.DOM.div({className: "time-to-stay"}, 
        React.DOM.div({className: "content-headline"}, headline), 
        Slider({step: 1, minValue: 1, maxValue: 31, value: this.getValue().minStayDays, onChange: this.changeMinStayDays, className: "slider sliderMin horizontal-slider"}, 
          Handle(null)
        ), 
        Slider({step: 1, minValue: 1, maxValue: 31, value: this.getValue().maxStayDays, onChange: this.changeMaxStayDays, className: "slider sliderMax horizontal-slider"}, 
          Handle(null)
        ), 
        React.DOM.div({className: "slider-axe"})
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
    for (var imode in this.props.modesEnabled) {
      if (this.props.modesEnabled[imode]) {
        modeOptions.push(React.DOM.div({className:  mode == imode ? "active" : "", onClick:  this.switchModeTo(imode) },  this.getModeLabel(imode) ))
      }
    }

    return (
      React.DOM.div({className: 'wa-date-picker '+mode, style: styles}, 
        React.DOM.div({className: "mode-selector"}, 
          modeOptions
        ), 
        React.DOM.div({className: "content"}, 
           this.renderBody() 
        ), 
        React.DOM.div({className: "clear-both"})
      )
    );
  }
});


module.exports = DatePicker;

},{"./../containers/SearchDate.js":14,"./../tr.js":15,"./CalendarFrame.jsx":4,"./MonthMatrix.jsx":7,"./Slider.js":8}],6:[function(require,module,exports){
/** @jsx React.DOM */

var DatePicker = require("./DatePicker.jsx");
var SearchDate = require('./../containers/SearchDate.js');

/**
 * show modal datepicker
 * it hides itself and take care that it is only one on page
 * @param{options} {
 *    element: plain html element to bind, it takes boundaries of that object
 *    value:
 *    modesEnabled: example and default value is below
 *    locale: (cs,en,...)
 * }
 *
 * @param{function(SearchDate)} onChange
 */

exports.show = function (options, onChange) {
  var element = options.element;
  var value = options.value;
  var modesEnabled = options.modes;

  var goToPast = false;

  var rect = element.getBoundingClientRect();

  var jqElement = $("#wa-date-picker-container");

  if (!jqElement.length) {
    $("body").append('<div id="wa-date-picker-container"></div>');
    jqElement = $("#wa-date-picker-container");
  }

  if (options.locale) {
    moment.locale(options.locale);
  }


  if (!modesEnabled) {
    modesEnabled = {
      "single": true,
      "interval": false,
      "month": true,
      "timeToStay": false,
      "anytime": true,
      "noReturn": true
    };
  }

  var position = {
    top: rect.bottom + window.pageYOffset,
    left: rect.left
  };

  var htmlElement = jqElement.get()[0];

  var pageWidth = $(window).width();

  var RootDatePicker = React.createClass({displayName: 'RootDatePicker',


    hide: function () {
      this.setState({
        shown: false
      });
    },
    clickOutside: function (e) {
      if (this.refs.datePicker) {
        if ($(this.refs.datePicker.getDOMNode()).has(e.target).length) return;
      }
      if ($(element).is(e.target)) return;
      if ($(element).has(e.target).length) return;
      this.hide();
    },
    componentDidMount: function() {
      document.addEventListener("click", this.clickOutside, false);
    },
    componentWillUnmount: function() {
      document.removeEventListener("click", this.clickOutside, false);
    },

    getInitialState: function() {
      if (!value) {
        value = new SearchDate();
      }
      return {
        value: value,
        shown: true
      };
    },
    onChange: function(newValue) {
      onChange(newValue);
      return this.setState({
        value: newValue
      });
    },
    render: function() {
      if (!this.state.shown) {
        return (
          React.DOM.div(null)
        );
      }
      var styles = {
        top: position.top
      };
      return (
        React.DOM.div({className: "wa-date-picker-modal", style: styles}, 
          DatePicker({
            ref: "datePicker", 
            weekOffset: 1, 
            value: this.state.value, 
            minValue: options.minValue, 
            onChange: this.onChange, 
            leftOffset: position.left, 
            maxWidth: pageWidth, 
            modesEnabled: modesEnabled, 
            hide: this.hide
          })
        )
      );
    }
  });

  React.renderComponent(RootDatePicker(), htmlElement);
};




},{"./../containers/SearchDate.js":14,"./DatePicker.jsx":5}],7:[function(require,module,exports){
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
        React.DOM.div({className: "month-option", onClick: self.setMonth(month)}, 
          React.DOM.span({className: "month-name"}, 
             month.format("MMMM") 
          ), 
          React.DOM.br(null), 
          React.DOM.span({className: "month-year"}, 
             month.format("YYYY") 
          )
        )
      );
    });

    return ( //onMouseLeave={ this.props.onLeave }
      React.DOM.div({className: "month-matrix"}, 
        React.DOM.div({className: "content-headline"}, Tran(null, "Select month")), 
        React.DOM.div({className: "months"}, 
          monthsElements
        )
      )
    );
  }
});

module.exports = MonthMatrix;

},{"./../Tran.jsx":13}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

module.exports = DateTools;

},{}],10:[function(require,module,exports){
/** @jsx React.DOM */

var React = (window.React);
var Tran = require('./Tran.jsx');


var FormatedPrice = React.createClass({displayName: 'FormatedPrice',
	getInitialState: function() {
		return {
			currentCurrency: currencyManager.current,
			subscribeToken: null
		};
	},
	handleCurrencyChanged: function (newCurrency) {
		this.setState({
			currentCurrency: newCurrency
		});
	},
	componentDidMount: function() {
		var token = PubSub.subscribe( 'currencyChanged', this.handleCurrencyChanged );
		this.setState({
			subscribeToken: token
		});
	},
	componentWillUnmount: function() {
		if (this.state.subscribeToken) {
			PubSub.unsubscribe( this.state.subscribeToken );
		}
	},
	render: function() {
		return (
			React.DOM.span({className: "formated-price"},  currencyManager.toCurrentFormat(currencyManager.toCurrentCurrency(this.props.price, this.props.currency)) )
		);
	}
});

var BarHorizontal = React.createClass({displayName: 'BarHorizontal',
	render: function() {
		var style = {
			width: this.props.value * 100 + "%"
		};
		return (
			React.DOM.div({className: "bar-horizontal-wrap"}, 
				React.DOM.div({className: "bar-horizontal", style: style }
				)
			)
		);
	}
});

var DealsCityRow = React.createClass({displayName: 'DealsCityRow',
	render: function() {
		var relativePrice = this.props.flight.price / this.props.maxPrice;
		return (
			React.DOM.a({className: "city", href:  this.props.flight.url}, 
				React.DOM.div({className: "city-name"},  this.props.flight.cityName, " - ",  this.props.flight.airportCode), 
				FormatedPrice({price:  this.props.flight.price, currency:  this.props.flight.currency}), 
				BarHorizontal({value: relativePrice })
			)
		);
	}
});

var DealsCountryRow = React.createClass({displayName: 'DealsCountryRow',
	getInitialState: function() {
		return {
			openCountries: false
		};
	},
	toggleCountries: function () {
		this.setState({
			openCountries: !this.state.openCountries
		})
	},
	calculateMaxPrice: function () {
		var maxPrice = 0;
		this.props.country.cities.forEach(function (city) {
			if (city.price > maxPrice) {
				maxPrice = city.price;
			}
		});
		return maxPrice
	},
	render: function() {
		var self = this;
		var opened = false;
		var cityMaxPrice = this.calculateMaxPrice();
		var relativePrice = this.props.country.price / this.props.maxPrice;
		if (this.state.openCountries) {
			var cities = this.props.country.cities.map(function(flight) {
				return DealsCityRow({maxPrice: cityMaxPrice, flight: flight })
			});
			opened = true
		}
		return (
			React.DOM.div({className:  React.addons.classSet( {country: true, opened: opened}) }, 
				React.DOM.div({className: "country-header", onClick:  this.toggleCountries}, 
					React.DOM.div({className: "country-name"},  this.props.country.name), 
					FormatedPrice({price:  this.props.country.price, currency:  this.props.country.currency}), 
					BarHorizontal({value: relativePrice }), 
					React.DOM.i({className:  React.addons.classSet( {'arrow-icon': true, 'icon-arrow_down': !opened, 'icon-arrow_up': opened})})
				), 

				React.DOM.div({className: "cities"}, 
					cities 
				)
			)
		);
	}
});

var DealsList = React.createClass({displayName: 'DealsList',
	getInitialState: function() {
		return {
			data: [],
			limit: 20,
			dataState: "loading",
			roundtrip: false
		};
	},
	getData: function (roundtrip) {
		var self = this;
		self.setState({
			dataState: "loading"
		});
		this.props.service.getData(roundtrip, function(err, data) {
			var dataState = "";
			if (err) {
				dataState = "error"
			} else if (data.length > 0) {
				dataState = "done"
			} else if (data.length === 0) {
				dataState = "noResults"
			} else {
				dataState = "error"
			}

			self.setState({
				data: data,
				dataState: dataState,
				roundtrip: roundtrip
			});
		});
	},
	componentDidMount: function() {
		this.getData(false);
	},
	calculateMaxPrice: function () {
		var self = this;
		var maxPrice = 0;
		var i = 0;
		this.state.data.forEach(function (country) {
			i++;
			if (i > self.state.limit) return false;

			if (country.price > maxPrice) {
				maxPrice = country.price;
			}
		});
		return maxPrice
	},
	increaseLimit: function () {
		this.setState({ limit: this.state.limit + 20 });
	},
	setRoundtrip: function () {
		this.getData(true);
	},
	setOneway: function () {
		this.getData(false);
	},
	renderTabs: function() {
		return (
			React.DOM.div({className: "tabs"}, 
				React.DOM.a({className:  React.addons.classSet( {active: !this.state.roundtrip}), onClick: this.setOneway}, 
					Tran(null, "One way")
				), 
				React.DOM.a({className:  React.addons.classSet( {active: this.state.roundtrip}), onClick: this.setRoundtrip}, 
					Tran(null, "Round trip")
				)
			)
		)
	},
	renderData: function () {
		var self = this;
		var i = 0;
		var message;

		var maxPrice = this.calculateMaxPrice();
		var rows = Object.keys(this.state.data).map(function(value, index) {
			i++;
			if (i > self.state.limit) return false;
			var country = self.state.data[value];
			return DealsCountryRow({country: country, maxPrice: maxPrice })
		});
		var moreBtn = "";
		if (self.state.data.length >= self.state.limit) {
			moreBtn = (
				React.DOM.div({className: "btn", onClick:  this.increaseLimit}, 
					Tran(null, "Show more")
				)
			);
		}
		if (this.state.roundtrip) {
			message = (
				Tran(null, "Return flights are from 2 to 10 days after departure")
			)
		}

		return (
			React.DOM.div(null, 
				React.DOM.div({className: "info-message"}, message ), 
				React.DOM.div({className: "dealsTable"}, 
					rows 
				), 
				React.DOM.div({className: "footer"}, 
					moreBtn 
				)
			)
		);
	},
	renderLoading: function () {
		return (
			React.DOM.div({className: "message"}, 
				React.DOM.img({src: "/images/loaders/loader-search.gif", width: "32", height: "32"}), 
				React.DOM.span(null, " ", Tran(null, "Loading"), "... ")
			)
		);
	},
	renderNoResults: function () {
		return (
			React.DOM.div({className: "message"}, 
				React.DOM.span(null, " ", Tran(null, "Not enough data for this route"), " ")
			)
		);
	},
	renderError: function () {
		return (
			React.DOM.div({className: "message"}, 
				React.DOM.span(null, " ", Tran(null, "error"), " ")
			)
		);
	},
	render: function() {
		var content;
		if (this.state.dataState == "loading") {
			content =  this.renderLoading();
		} else if (this.state.dataState == "done") {
			content =  this.renderData();
		} else if (this.state.dataState == "noResults") {
			content =  this.renderNoResults();
		} else {
			content =  this.renderError();
		}
		return (
			React.DOM.div(null, 
				 this.renderTabs(), 
				content 
			)
		)

	}
});

module.exports = DealsList;

},{"./Tran.jsx":13}],11:[function(require,module,exports){
// Older version of skypicker API - i don't even know if it is working for every feature
// right now it is used only in DealsList and should be removed later


var SkypickerAPIv1, firstDay, formatDate, inHalfAnYear, lastDay, pad, today;

today = function() {
  return new Date();
};

inHalfAnYear = function() {
  return new Date((new Date()).setMonth(new Date().getMonth() + 6));
};

firstDay = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

lastDay = function(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

pad = function(num, size) {
  var s;
  s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
};

formatDate = function(date) {
  return pad(date.getDate(), 2) + "/" + pad(date.getMonth() + 1, 2) + "/" + date.getFullYear();
};

SkypickerAPIv1 = (function() {
  function SkypickerAPI(settings) {
    this.settings = settings;
  }


  /*
   Request:
   {
   from: string
   to: string, default: "anywhere"
   date: date | {from: date, to: date} | "anytime"
   returnDate: date | {from: date, to: date} | "anytime" | null
   flyDays: (not used now)
   daysInDestination: {from: int, to: int}, default: null
   directFlights: (not used now)

   oneForDay: bool, default: false
   oneForCity: bool, default: false
   }
   */

  SkypickerAPI.prototype.call = function(request, callback) {
    var searchParams, skypickerApiUrl;
    skypickerApiUrl = "https://api.skypicker.com/flights";
    searchParams = {
      v: 2,
      flyFrom: request.from,
      to: request.to,
      flyDays: [],
      directFlights: 0,
      oneforcity: request.oneForCity ? "1" : "",
      sort: "price",
      asc: 1,
      locale: this.settings.lang
    };
    if (typeof request.date === "object") {
      if (request.date instanceof Date) {
        searchParams.dateFrom = formatDate(request.date);
        searchParams.dateTo = formatDate(request.date);
      } else {
        searchParams.dateFrom = formatDate(request.date.from);
        searchParams.dateTo = formatDate(request.date.to);
      }
    } else if (request.date === "anytime") {
      searchParams.dateFrom = formatDate(today());
      searchParams.dateTo = formatDate(inHalfAnYear());
    } else {
      throw new Error("date must be filled");
    }
    if (typeof request.returnDate === "object") {
      searchParams.typeFlight = "return";
      if (request.returnDate instanceof Date) {
        searchParams.returnFrom = formatDate(request.returnDate);
        searchParams.returnTo = formatDate(request.returnDate);
      } else {
        searchParams.returnFrom = formatDate(request.returnDate.from);
        searchParams.returnTo = formatDate(request.returnDate.to);
      }
    } else if (request.returnDate === "anytime") {
      searchParams.returnFrom = formatDate(today());
      searchParams.returnTo = formatDate(inHalfAnYear());
    } else {
      searchParams.typeFlight = "oneway";
      searchParams.returnFrom = "";
      searchParams.returnTo = "";
    }
    if (request.returnDate === "anytime") {
      if (request.daysInDestination) {
        searchParams.daysInDestinationFrom = request.daysInDestination.from;
        searchParams.daysInDestinationTo = request.daysInDestination.to;
      } else {
        searchParams.daysInDestinationFrom = 2;
        searchParams.daysInDestinationTo = 10;
      }
    } else {
      searchParams.daysInDestinationFrom = 0;
      searchParams.daysInDestinationTo = 0;
    }
    return $.ajax({
      url: skypickerApiUrl,
      dataType: "json",
      data: searchParams,
      success: (function(data) {
        return callback(null, data.data);
      }).bind(this),
      error: (function(xhr, status, err) {
        walog("deals list", "error", {
          status: status,
          err: err
        });
        return callback(err);
      }).bind(this)
    });
  };

  return SkypickerAPI;

})();

module.exports = SkypickerAPIv1;

},{}],12:[function(require,module,exports){
var dateTools = require("./DateTools.js");

var getPlacesUrlString = function(places) {
  var names, place, _i, _len;
  if (typeof places === 'string' || places instanceof String) {
    return places;
  }
  names = [];
  for (_i = 0, _len = places.length; _i < _len; _i++) {
    place = places[_i];
    names.push(place.label);
  }
  return encodeURIComponent(names.join(";"));
};


function SkypickerTools(settings) {
  this.settings = settings;
}

SkypickerTools.prototype.makeSearchUrl = function(outboundDate, inboundDate, origin, destination) {
  var targetUrl;
  targetUrl = this.settings.searchResultsUrl;
  targetUrl = targetUrl.replace("originsSubstitution", getPlacesUrlString(origin));
  targetUrl = targetUrl.replace("destinationsSubstitution", getPlacesUrlString(destination));
  targetUrl = targetUrl.replace("outboundDateSubstitution", dateTools.formatWADate(outboundDate));
  if (inboundDate) {
    targetUrl = targetUrl.replace("inboundDateSubstitution", dateTools.formatWADate(inboundDate));
  } else {
    targetUrl = targetUrl.replace("&inboundDate=inboundDateSubstitution", "");
  }
  return targetUrl;
};


module.exports = SkypickerTools;




},{"./DateTools.js":9}],13:[function(require,module,exports){
/** @jsx React.DOM */

var React = (window.React);
var tr = require('./tr.js');

/* react component wrapper of tr function */

var Tran = React.createClass({displayName: 'Tran',
  render: function() {
    var original = this.props.children;
    return (
      React.DOM.span(null, 
				 tr(original) 
      )
    );
  }
});

module.exports = Tran;

},{"./tr.js":15}],14:[function(require,module,exports){
var moment = (window.moment);

var urlDateFormat = "YYYY-MM-DD";

/*
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
};

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

},{}],15:[function(require,module,exports){

/* simple function to translate plain texts */
/* to get text which are not translated on current page, take console.log(window.toTranslate) */

var tr = function (original) {
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

  if (arguments.length > 1) {
    for (var i = 1, j = arguments.length; i < j; i++){
      translated = translated.replace("%s",arguments[i])
    }
  }


  return translated;
};

module.exports = tr;

},{}]},{},[1]);
