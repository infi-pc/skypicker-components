
var DatePickerModal = require('./../DatePicker/DatePickerModal.jsx');
var PlacePickerModal = require('./../PlacePicker/PlacePickerModal.jsx');

var SearchFormData = require('./../containers/SearchFormData.jsx');
var SearchDate = require('./../containers/SearchDate.jsx');
var SearchPlace = require('./../containers/SearchPlace.jsx');
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
      active: "origin"
    };
  },
  getDefaultProps: function() {
    return {
      data: new SearchFormData()
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
        value: this.props.data[key],
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

  componentDidUpdate: function () {
    this.refreshShown();
  },

  getFormattedValue: function (fieldName) {
    var value = this.props.data[fieldName];
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
        //TODO return here???
      }
      if (changeType == "select") {
        this.nextField();
      }
      Object.keys(this.components).forEach((key) => {
        this.props.onChange(this.props.data.changeField(fieldName, value));
      });
    }
  },

  onFocusFunc: function (fieldName) {
    return () => {
      this.setState({
        active: fieldName
      });
      var value = this.props.data[fieldName];
      if (value.mode != "text" || value.isDefault) {
        this.refs[fieldName].getDOMNode().select();
      }
    }
  },

  changeTextFunc: function (fieldName) {
    if (fieldName == "origin" || fieldName == "destination") {
      return (e) => {
        var addState = {};
        this.props.onChange(this.props.data.changeField(fieldName, new SearchPlace(e.target.value)));
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

  refreshFocus: function () {
    var domNode;
    if (this.state.active) {
      domNode = this.refs[this.state.active].getDOMNode();
      if (document.activeElement != domNode) {
        domNode.focus();
        if (this.state.active != "submitButton") {
          var activeValue = this.props.data[this.state.active];
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
          value: this.props.data[key],
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
    return (
      <fieldset
        className={type}
        ref={type + "Outer"}
        onClick={this.onClickOuterFunc(type)}
      >
        <div className="head">
          <label>{type}</label>
          <span className="input-wrapper">
            <input
              value={this.getFormattedValue(type)}
              onClick={this.onClickInner}
              onFocus={this.onFocusFunc(type)}
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
