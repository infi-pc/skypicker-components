
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
        value: this.state[key]
      });
    });

    this.modalComponentsLoaded = true;
    //this.props.refs.destination.getDOMNode()
  },
  formatDate: function (searchDate) {
    if (!searchDate) return "";
    return searchDate
  },
  formatPlace: function (searchPlace) {
    if (!searchPlace) return "";
    return searchPlace.getText();
  },
  showField: function (fieldName) {
    return () => {
      Object.keys(this.components).forEach((key) => {
        this.components[key].setProps({
          shown: key == fieldName
        });
      });
    }
  },
  render: function() {

    if (this.modalComponentsLoaded) {
      this.components.dateFrom.setProps({
        value: this.state.dateFrom
      });
      this.components.dateTo.setProps({
        value: this.state.dateTo
      });
      this.components.origin.setProps({
        value: this.state.origin
      });
      this.components.destination.setProps({
        value: this.state.destination
      });
    }


    return ( //TODO add on change
      <div>
        <input value={this.formatDate(this.state.dateFrom)} onFocus={this.showField("dateFrom")} type="text" ref="dateFrom" />
        <input value={this.formatDate(this.state.dateTo)} onFocus={this.showField("dateTo")} type="text" ref="dateTo" />
        <input value={this.formatPlace(this.state.origin)} onFocus={this.showField("origin")} type="text" ref="origin" />
        <input value={this.formatPlace(this.state.destination)} onFocus={this.showField("destination")} type="text" ref="destination" />
      </div>
    );
  }
});

module.exports = SearchForm;
