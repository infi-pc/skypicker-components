var moment = require("moment");

var SkypickerAPI = require("./../SkypickerAPI");
var SearchDate = require("./../containers/SearchDate.js");

var skypickerAPI = new SkypickerAPI({lang: "en"}); //TODO check what happen to cs/cz - there was some encoding error


var request = {
  from: "PRG",
  to: "LON",
  date: new SearchDate({
    from: moment(),
    to: moment().add(1,"month")
  }),
  oneForDay: true
};

skypickerAPI.call(request, function (err, data) {
  console.log(data);
});
