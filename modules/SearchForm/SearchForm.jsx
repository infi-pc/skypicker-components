
var DatePickerModal = require('./../DatePicker/DatePickerModal.jsx');
var PlacePickerModal = require('./../PlacePicker/PlacePickerModal.jsx');


var SearchFormStore = require('./../stores/SearchFormStore.jsx');

var SearchDate = require('./../containers/SearchDate.jsx');
var SearchPlace = require('./../containers/SearchPlace.jsx');
var tr = require('./../tr.js');
var Tran = require('./../Tran.jsx');

var moment = require("moment");

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



var SearchForm = React.createClass({

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

    Object.keys(this.components).forEach((key) => {
      this.components[key].setProps({
        inputElement: this.refs[key + "Outer"].getDOMNode(),
        value: this.state.data[key],
        onHide: () => {
          if (this.state.active == key) {
            this.setState({
              active: ""
            })
          }
        },
        onChange: this.changeValueFunc(key),
        options: options[key]
      });
    });

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
    return (value, changeType) => {
      if (changeType == "changeMode") {
        //this.refs[fieldName].getDOMNode().focus();
        //TODO return here???
      }
      if (changeType == "select") {
        this.nextField();
      }
      Object.keys(this.components).forEach((key) => {
        SearchFormStore.setValue(this.state.data.changeField(fieldName, value));
      });
    }
  },

  onFocusFunc: function (fieldName) {
    return () => {
      this.setState({
        active: fieldName
      });
      var value = this.state.data[fieldName];
      if (value.mode != "text" || value.isDefault) {
        this.refs[fieldName].getDOMNode().select();
      }
    }
  },

  changeTextFunc: function (fieldName) {
    if (fieldName == "origin" || fieldName == "destination") {
      return (e) => {
        var addState = {};
        SearchFormStore.setValue(this.state.data.changeField(fieldName, new SearchPlace(e.target.value)));
        this.setState(addState);
      }
    } else {
      return () => {};
    }
  },

  onClickOuterFunc: function (type) {
    return () => {
      if (type == this.state.active) {
        this.setState({
          active: ""
        });
      } else {
        this.onFocusFunc(type)();
      }
    }
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
      Object.keys(this.components).forEach((key) => {
        this.components[key].setProps({
          value: this.state.data[key],
          shown: key == this.state.active
        });
      });
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
      <fieldset
        className={className}
        ref={type + "Outer"}
        onClick={this.onClickOuterFunc(type)}
      >
        <div className="head">
          <label>{this.getFieldLabel(type)}</label>
          <span className="input-wrapper">
            <input
              value={this.getFormattedValue(type)}
              onClick={this.onClickInner}
              onFocus={this.onFocusFunc(type)}
              onKeyDown={this.onInputKeyDown}
              type="text"
              ref={type}
              onChange={this.changeTextFunc(type)}
              autoComplete="off"
            />
          </span>
          <i className="fa fa-spinner"></i>
          <b className="toggle">
            <i className={faIconClass}></i>
          </b>
        </div>
      </fieldset>
    )
  },
  render: function() {
    return (
      <form id="search">
        {this.renderInput("origin")}
        {this.renderInput("destination")}
        {this.renderInput("dateFrom")}
        {this.renderInput("dateTo")}
        <button onClick={this.search} id="search-flights" ref="submitButton" className="btn-search"><span><Tran tKey="search">Search</Tran></span><i className="fa fa-search"></i></button>
      </form>
    );
  }
});

module.exports = SearchForm;
