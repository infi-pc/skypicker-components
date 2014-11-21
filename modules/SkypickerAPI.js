// new version, not tested, should be finished later

var superagent  = require("superagent");
var moment  = require("moment");

formatSPApiDate = "DD/MM/YYYY";

var SkypickerAPI = (function() {

  /*
    Settings:
    {
      lang: string (eg. "cs")
    }
   */
  function SkypickerAPI(settings) {
    this.settings = settings;
  }

  /*
      Request:
      {
        from: string
        to: string, default: "anywhere"
        date: SearchDate
        returnDate: SearchDate | null
        flyDays: (not used now)
        //daysInDestination: {from: int, to: int}, default: null
        directFlights: (not used now)

        oneForDay: bool, default: false
        oneForCity: bool, default: false
      }
   */
  SkypickerAPI.prototype.call = function(request, callback) {
    var searchParams, skypickerApiUrl;
    skypickerApiUrl = "https://api.skypicker.com/flights";
    searchParams = {
      v: 2,
      flyFrom: request.from,
      to: request.to,
      //flyDays: [],
      //directFlights: 0,

      sort: "price",
      asc: 1,
      locale: this.settings.lang,
      daysInDestinationFrom: "",
      daysInDestinationTo: ""

    };

    searchParams.dateFrom = request.date.from.format(formatSPApiDate);
    searchParams.dateTo = request.date.to.format(formatSPApiDate);
    if (request.returnDate) {
      searchParams.typeFlight = "return";
      searchParams.returnFrom = request.returnDate.from.format(formatSPApiDate);
      searchParams.returnTo = request.returnDate.to.format(formatSPApiDate);
    } else {
      searchParams.typeFlight = "oneway";
      searchParams.returnFrom = "";
      searchParams.returnTo = "";
    }

    if (request.oneForDay) {
      searchParams.one_per_date = 1;
    }

    //TODO oneforcity: request.oneForCity ? "1" : "",

    console.log(searchParams);
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

  return SkypickerAPI;

})();

module.exports = SkypickerAPI;

