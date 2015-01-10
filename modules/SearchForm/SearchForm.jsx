
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
      nearby: true,
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
        inputElement: this.refs[key + "Outer"].getDOMNode(),
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

  getFormattedValue: function (fieldName) {
    var value = this.state[fieldName];
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

  changeTextFunc: function (fieldName) {
    if (fieldName == "origin" || fieldName == "destination") {
      return (e) => {
        var addState = {};
        addState[fieldName] = new SearchPlace(e.target.value);
        this.setState(addState);
      }
    } else {
      return () => {};
    }
  },

  refreshFocus: function () {
    var domNode;
    console.log(this.state.active);
    if (this.state.active) {
      domNode = this.refs[this.state.active].getDOMNode();
      if (document.activeElement != domNode) {
        domNode.focus();
        if (this.state.active != "submitButton") {
          var activeValue = this.state[this.state.active];
          if (activeValue.mode != "text" || activeValue.isDefault) {
            domNode.select();
          }
        }
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
  renderInput: function(type) {
    return (
      <fieldset
        className={type}
        ref={type + "Outer"}>
        <div className="head">
          <label for={type}>{type}</label>
          <span className="input-wrapper">
            <input
              value={this.getFormattedValue(type)}
              onFocus={this.onFocusFunc(type)}
              type="text"
              id={type}
              ref={type}
              onChange={this.changeTextFunc(type)}
            />
          </span>
          <i className="fa fa-spinner"></i>
          <b className="toggle">
            <i className="fa fa-caret-down"></i>
          </b>
        </div>
      </fieldset>
    )
  },
  render: function() {
    return (
      <form id="search" action="?">
        {this.renderInput("origin")}
        {this.renderInput("destination")}
        {this.renderInput("dateFrom")}
        {this.renderInput("dateTo")}
        <button ref="submitButton" id="search-flights" type="submit" className="btn-search"><span>Search</span><i className="fa fa-search"></i></button>
      </form>
    );
  }
});

module.exports = SearchForm;
