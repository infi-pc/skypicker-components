// new version, not tested, not finished, should be finished later
var Q = require('q');

var superagent  = require("superagent");
var moment  = require("moment");

var formatSPApiDate = "DD/MM/YYYY";

//TODO check if on error is called exactly when error in callback or not, then Add it to promise
var handleError = function (err) {
  console.error(err);
};


class FlightsAPI {
  /*
    Settings:
    {
      lang: string (eg. "cs")
    }
   */
  constructor(settings) {
    this.settings = settings;
  }
  /*
      Request:
      {
        origin: string (id) |
        destination: string (id), default: "anywhere"
        outboundDate: SearchDate
        inboundDate: SearchDate | null
        flyDays: (not used now)
        //daysInDestination: {from: int, to: int}, default: null
        directFlights: (not used now)

        onePerDay: bool, default: false
        oneForCity: bool, default: false
      }
   */
  findFlights(request) {
    var searchParams, skypickerApiUrl;
    skypickerApiUrl = "https://api.skypicker.com/flights";
    searchParams = {
      v: 2,
      flyFrom: request.origin,
      to: request.destination,
      //flyDays: [],
      //directFlights: 0,

      sort: "price",
      asc: 1,
      locale: this.settings.lang,
      daysInDestinationFrom: "",
      daysInDestinationTo: ""

    };

    searchParams.dateFrom = request.outboundDate.getFrom().format(formatSPApiDate);
    searchParams.dateTo = request.outboundDate.getTo().format(formatSPApiDate);
    if (request.inboundDate && request.inboundDate.mode != "noReturn") {
      searchParams.typeFlight = "return";
      searchParams.returnFrom = request.inboundDate.getFrom().format(formatSPApiDate);
      searchParams.returnTo = request.inboundDate.getTo().format(formatSPApiDate);
    } else {
      searchParams.typeFlight = "oneway";
      searchParams.returnFrom = "";
      searchParams.returnTo = "";
    }

    if (request.onePerDay) {
      searchParams.one_per_date = 1;
    }

    if (request.oneForCity) {
      searchParams.oneforcity = 1; // oneforcity: request.oneForCity ? "1" : "",
    }

    var deferred = Q.defer();
    superagent
      .get(skypickerApiUrl)
      .query(searchParams)
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .on('error', handleError)
      .end(function(error, res){
        if (!error) {
          deferred.resolve(res.body.data);
        } else {
          deferred.reject(new Error(res.error));
        }
      });
    return deferred.promise;
  };
}

module.exports = FlightsAPI;

