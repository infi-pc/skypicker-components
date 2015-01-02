var superagent  = require("superagent");

module.exports.findByName = function(term, callback) {
  var url = "https://api.skypicker.com/places";
  var searchParams = {
    v: 2,
    term: term,
    locale: this.settings.lang
  };
  superagent
    .get(skypickerApiUrl)
    .query(searchParams)
    //.set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Accept', 'application/json')
    .end(function(error, res){
      if (!error) {
        callback(error, res.body.data);
      } else {
        callback(error);
      }
    });

};
