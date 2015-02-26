var React = require('react');

var Map = React.createClass({
  render: function() {
    return (
      <div>
        <div id="map-canvas"></div>
        <div id="output"></div>

        <div id="header">
          <div className="header-bar">
            <img src="/images/picky.png" className="logo" />

            <div className="right-menu">
              <a>+ 44 203 769 18 78</a>
              <a>CZK</a>
              <a>English</a>
              <a>Sign up / Login</a>
            </div>
          </div>
          <div className="form-bar">
            <form className="form-inline">
              <div className="form-group">
                <label for="From">From: </label>
                <input type="text" className="form-control" value="Brno (Czech Republic)" />
              </div>
              <div className="form-group">
                <label for="To">To: </label>
                <input type="text" className="form-control" value="Anywhere" />
              </div>
              <div className="form-group">
                <label for="Departure">Departure: </label>
                <input type="text" className="form-control" value="27/2/2015 - 30/3/2015" />
              </div>
              <div className="form-group">
                <label for="Return">Return: </label>
                <input type="text" className="form-control" value="No return" />
              </div>
              <div className="form-group">
                <label>Passengers: </label>
                <input type="text" className="form-control passengers" value="6" />
              </div>
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </div>
        <div id="results">
          <div className="inner-results"></div>
        </div>
      </div>
    );
  }
});
module.exports = Map;
