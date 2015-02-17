var React = require('react');
var Translate = require('./../Translate.jsx');

module.exports = React.createClass({

  componentDidMount() {
    //TODO add arrow

    //var toggle = this.refs.toggle.getDOMNode();
    //var passengers = this.refs.passengers.getDOMNode();
    //$(toggle).on('click', () => {
    //  $(passengers).click();
    //});
    //toggle.addEventListener("click", (e) => {
    //  console.debug("click");
    //  var event = new MouseEvent('click', {
    //    'view': window,
    //    'bubbles': true,
    //    'cancelable': true
    //  });
    //  passengers.dispatchEvent(event);
    //});
  },

  //<b ref="toggle" className="toggle">
  //  <i className="fa fa-caret-down"></i>
  //</b>

  render: function() {
    return (
      <fieldset ref="typePassengers" className="passengers">
        <div className="head">
          <label for="passengers">
            <span><Translate tKey="emails.common.passengers">Passengers</Translate>:</span>
            <i className="icon fa fa-user"></i>
          </label>

          <div className="passenger-select-wrapper">
            <select name="passengers" ref="passengers" onChange={this.props.onChange} value={this.props.value}>
              {[1,2,3,4,5,6,7,8,9].map((num) => {
                return (<option value={num}>{num}</option>)
              })}
            </select>
          </div>
        </div>
      </fieldset>
    )
  }
});
