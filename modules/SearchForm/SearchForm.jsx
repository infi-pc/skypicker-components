
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
  componentDidMount: function() {

  },
  render: function() {
    return (
      <div>
        tady
      </div>
    );
  }
});

module.exports = SearchForm;
