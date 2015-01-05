var superagent  = require("superagent");
var Place  = require("../containers/Place.jsx");

var url = "https://api.skypicker.com/places";

class PlacesAPI {
  constructor(settings) {
    this.settings = settings;
  }
  convertResults(results) {
    return results.map(function (result) {
      return new Place(result);
    });
  }
  findByName(term, callback) {
    var searchParams = {
      v: 2,
      term: term,
      locale: this.settings.lang
    };
    superagent
      .get(url)
      .query(searchParams)
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .end( (res) => {
        if (!res.error) {
          callback(null, this.convertResults(res.body));
        } else {
          callback(res.error);
        }
      });
  }
}

module.exports = PlacesAPI;
