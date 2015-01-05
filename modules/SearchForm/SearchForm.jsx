
var DatePickerModal = require('./../DatePicker/DatePickerModal.jsx');
var PlacePickerModal = require('./../PlacePicker/PlacePickerModal.jsx');

var SearchDate = require('./../containers/SearchDate.js');
var SearchPlace = require('./../containers/SearchPlace.js');


var SearchForm = React.createClass({

  getInitialState: function() {
    return {
      dateFrom: new SearchDate(),
      dateTo: new SearchDate(),
      origin: new SearchPlace(),
      destination: new SearchPlace()
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
          console.log("uhhh");
          this.showFieldFunc("")();
        },
        onChange: this.changeValueFunc(key)
      });
    });

    this.modalComponentsLoaded = true;
    //this.props.refs.destination.getDOMNode()
  },
  formatDate: function (searchDate) {
    if (!searchDate) return "";
    return searchDate.format();
  },
  formatPlace: function (searchPlace) {
    if (!searchPlace) return "";
    return searchPlace.getText();
  },
  changeValueFunc: function (fieldName) {
    return (value) => {
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
        this.components[key].setProps({
          shown: key == fieldName
        });
      });
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
  componentDidUpdate: function () {
    if (this.modalComponentsLoaded) {
      Object.keys(this.components).forEach((key) => {
        this.components[key].setProps({
          value: this.state[key]
        });
      });
    }
  },
  render: function() {
    return ( //TODO add on change
      <div>
        <input
          value={this.formatPlace(this.state.origin)}
          onFocus={this.showFieldFunc("origin")}
          type="text"
          ref="origin"
          onChange={this.changePlaceTextFunc("origin")}
        />
        <input
          value={this.formatPlace(this.state.destination)}
          onFocus={this.showFieldFunc("destination")}
          type="text"
          ref="destination"
          onChange={this.changePlaceTextFunc("destination")}
        />
        <input
          value={this.formatDate(this.state.dateFrom)}
          onFocus={this.showFieldFunc("dateFrom")}
          type="text"
          ref="dateFrom"
          onChange={this.changeDateTextFunc("dateFrom")}
        />
        <input
          value={this.formatDate(this.state.dateTo)}
          onFocus={this.showFieldFunc("dateTo")}
          type="text"
          ref="dateTo"
          onChange={this.changeDateTextFunc("dateTo")}
        />
      </div>
    );
  }
});

module.exports = SearchForm;
