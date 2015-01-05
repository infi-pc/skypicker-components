/** @jsx React.DOM */

var React = require('react');
var SearchDate = require('./../../containers/SearchDate.js');

var CalendarFrame = require('./CalendarFrame.jsx');
var MonthMatrix = require("./MonthMatrix.jsx");
var Slider = require('./Slider.js');
var tr = require('./../../tr.js');
var isIE = require('./../../tools/isIE.js');


React.initializeTouchEvents(true);

var moment = require('moment');

var Handle = React.createClass({
  render: function() {
    return (
      <div className="handle">
        {this.props.sliderValue}
      </div>
    );
  }
});

var DatePicker = React.createClass({

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

      self.props.onSizeChange(self.props.sizes[mode]);
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
    if (value > this.getValue().maxStayDays) {
      return;
    }
    this.changeValue({
      mode: "timeToStay",
      minStayDays: value,
      maxStayDays: this.getValue().maxStayDays
    }, "select");
  },

  changeMaxStayDays: function (value) {
    if (value < this.getValue().minStayDays) {
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
      <CalendarFrame onChange={this.changeValue} value={this.getValue()} minValue={this.props.minValue} selectionMode="single" calendarsNumber={1} />
    )
  },
  renderInterval: function () {
    return (
      <CalendarFrame onChange={this.changeValue} value={this.getValue()} minValue={this.props.minValue} selectionMode="interval" calendarsNumber={3}  />
    )
  },
  renderMonth: function () {
    return (<MonthMatrix minValue={this.props.minValue} onSet={this.setMonth} totalMonths="6" />);
  },
  renderTimeToStay: function () {
    var headline = tr("Stay time from %s to %s days.", "stay_time_from", [this.getValue().minStayDays, this.getValue().maxStayDays] );
    return (
      <div className="time-to-stay">
        <div className="content-headline">{headline}</div>
        <Slider step={1} minValue={0} maxValue={31} value={this.getValue().minStayDays} onRelease={this.releaseMinStayDays} onChange={this.changeMinStayDays} className="slider sliderMin horizontal-slider">
          <Handle />
        </Slider>
        <Slider step={1} minValue={0} maxValue={31} value={this.getValue().maxStayDays} onRelease={this.releaseMaxStayDays} onChange={this.changeMaxStayDays} className="slider sliderMax horizontal-slider">
          <Handle />
        </Slider>
        <div className="slider-axe"></div>
      </div>
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
        modeOptions.push(<div key={imode} className={ (mode == imode) ? "active" : "" } onClick={ this.switchModeTo(imode) }>{ this.getModeLabel(imode) }</div>)
      }
    }

    return (
      <div className={'search-date-picker search-picker '+mode}>
        <div className="mode-selector">
          {modeOptions}
        </div>
        <div className="content">
          { this.renderBody() }
        </div>
        <div className='clear-both'></div>
      </div>
    );
  }
});


module.exports = DatePicker;