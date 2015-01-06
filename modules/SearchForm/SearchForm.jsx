
var DatePickerModal = require('./../DatePicker/DatePickerModal.jsx');
var PlacePickerModal = require('./../PlacePicker/PlacePickerModal.jsx');

var SearchDate = require('./../containers/SearchDate.js');
var SearchPlace = require('./../containers/SearchPlace.js');
var moment = require("moment");

var options = {
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
  },
  origin: {
    modes: {
      all: true,
      nearby: false,
      cheapest: false,
      citiesAndAirports: true,
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
      citiesAndAirports: true,
      countries: true,
      anywhere: true,
      radius: true
    }
  }
};



var SearchForm = React.createClass({

  getInitialState: function() {
    return {
      dateFrom: new SearchDate(),
      dateTo: new SearchDate({from: moment().add(1, "months")}),
      origin: new SearchPlace("czech", true),
      destination: new SearchPlace("anywhere", true),
      active: "origin"
    };
  },
  getDefaultProps: function() {
    return {

    };
  },
  createModalContainer: function () {
    var div = document.createElement('div');
    div.setAttribute('class', 'modal-container-element');
    document.body.appendChild(div);
    return div;
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
        inputElement: this.refs[key].getDOMNode(),
        value: this.state[key],
        onHide: () => {
          if (this.state.active == key) {
            console.log("stil weirrd", this.state.active, key);
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
  componentDidUpdate: function () {
    this.refreshShown();
  },
  formatDate: function (searchDate) {
    if (!searchDate) return "";
    return searchDate.format();
  },
  formatPlace: function (searchPlace) {
    if (!searchPlace) return "";
    return searchPlace.getText();
  },
  nextField: function () {

    var order = [
      "origin",
      "destination",
      "dateFrom",
      "dateTo"
    ];
    var index = order.indexOf(this.state.active);
    var newIndex;
    if (index >= 0 && index <= 2) {
      newIndex = index+1
    } else if (index == 3) {
      //TODO focus on search btn
      newIndex = -1
    }
    var newActive = order[newIndex];
    console.log("next is " +  newIndex + " - "+ newActive);
    this.setState({
      active: newActive
    });
  },
  changeValueFunc: function (fieldName) {
    return (value, changeType) => {
      if (changeType == "changeMode") {
        //this.refs[fieldName].getDOMNode().focus();
      }
      if (changeType == "select") {
        this.nextField();
      }
      Object.keys(this.components).forEach((key) => {
        var addState = {};
        addState[fieldName] = value;
        this.setState(addState);
      });
    }
  },
  showFieldFunc: function (fieldName) {
    return () => {
      Object.keys(this.components).forEach((key) => {
        this.setState({
          active: fieldName
        });
      });
    }
  },
  onFocusFunc: function (fieldName) {
    return () => {
      this.showFieldFunc(fieldName)();
      var value = this.state[fieldName];
      if (value.mode != "text" || value.isDefault) {
        this.refs[fieldName].getDOMNode().select();
      }
    }
  },
  changePlaceTextFunc: function (fieldName) {
    return (e) => {
      var addState = {};
      addState[fieldName] = new SearchPlace(e.target.value);
      this.setState(addState);
    }
  },
  changeDateTextFunc: function (fieldName) {
    return () => {
      //it should do nothing
    }
  },

  refreshFocus: function () {
    var domNode = this.refs[this.state.active].getDOMNode();
    if (document.activeElement != domNode) {
      domNode.focus();
      var activeValue = this.state[this.state.active];
      if (activeValue.mode != "text" || activeValue.isDefault) {
        domNode.select();
      }
    }
  },

  refreshShown: function () {
    if (this.modalComponentsLoaded) {
      Object.keys(this.components).forEach((key) => {
        this.components[key].setProps({
          value: this.state[key],
          shown: key == this.state.active
        });
      });
      this.refreshFocus();
    }
  },

  render: function() {
    return (
      <div>
        <input
          value={this.formatPlace(this.state.origin)}
          onFocus={this.onFocusFunc("origin")}
          type="text"
          ref="origin"
          onChange={this.changePlaceTextFunc("origin")}
        />
        <input
          value={this.formatPlace(this.state.destination)}
          onFocus={this.onFocusFunc("destination")}
          type="text"
          ref="destination"
          onChange={this.changePlaceTextFunc("destination")}
        />
        <input
          value={this.formatDate(this.state.dateFrom)}
          onFocus={this.onFocusFunc("dateFrom")}
          type="text"
          ref="dateFrom"
          onChange={this.changeDateTextFunc("dateFrom")}
        />
        <input
          value={this.formatDate(this.state.dateTo)}
          onFocus={this.onFocusFunc("dateTo")}
          type="text"
          ref="dateTo"
          onChange={this.changeDateTextFunc("dateTo")}
        />
      </div>
    );
  }
});

module.exports = SearchForm;
