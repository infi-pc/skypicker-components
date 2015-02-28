// new version, not tested, not finished, should be finished later
var Q = require('q');
var superagent  = require("superagent");
var moment  = require("moment");
var flightsApiToJourney = require("./mappers/flightsApiToJourney.jsx");


var formatSPApiDate = "DD/MM/YYYY";

//TODO check if on error is called exactly when error in callback or not, then Add it to promise
var handleError = function (err) {
  console.error(err);
};


class FlightsAPI {

  constructor() {
    this.options = {
      language: "en",
      format: "mapped" // "mapped" or "original"
    };
  }

  changeOptions(newOptions) {
    Object.keys(newOptions).forEach((key) => {
      this.options[key] = newOptions[key];
    })
  }
  /*
      Request:
      {
        origin: string (id) |
        destination: string (id), default: "anywhere"
        outboundDate: SearchDate
        inboundDate: SearchDate | null
        passengers: number, default: 1
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
      //flyDays: [],
      //directFlights: 0,
      sort: "price",
      asc: 1,
      locale: this.options.language,
      daysInDestinationFrom: "",
      daysInDestinationTo: ""

    };

    if (typeof request.origin == "string") {
      searchParams.flyFrom = request.origin;
    } else if (request.origin.mode == "place") {
      searchParams.flyFrom = request.origin.value.id;
    } else if (request.origin.mode == "anywhere") {
      searchParams.flyFrom = "anywhere";
    } else if (request.origin.mode === "radius") {
      searchParams.radiusFrom = request.origin.value.radius;
      searchParams.latitudeFrom = request.origin.value.lat;
      searchParams.longitudeFrom = request.origin.value.lng;
    }

    if (typeof request.destination == "string") {
      searchParams.to = request.destination;
    } else if (request.destination.mode == "place") {
      searchParams.to = request.destination.value.id;
    } else if (request.destination.mode == "anywhere") {
      searchParams.to = "anywhere";
    } else if (request.destination.mode === "radius") {
      searchParams.radiusTo = request.destination.value.radius;
      searchParams.latitudeTo = request.destination.value.lat;
      searchParams.longitudeTo = request.destination.value.lng;
    }

    searchParams.dateFrom = request.outboundDate.getFrom().format(formatSPApiDate);
    searchParams.dateTo = request.outboundDate.getTo().format(formatSPApiDate);
    if (request.inboundDate) {
      if (request.inboundDate.mode == "interval" || request.inboundDate.mode == "single"  || request.inboundDate.mode == "anytime" ) {
        searchParams.typeFlight = "return";
        searchParams.returnFrom = request.inboundDate.getFrom().format(formatSPApiDate);
        searchParams.returnTo = request.inboundDate.getTo().format(formatSPApiDate);
      } else if (request.inboundDate.mode == "timeToStay") {
        searchParams.typeFlight = "return";
        searchParams.daysInDestinationFrom = request.inboundDate.getMinStayDays();
        searchParams.daysInDestinationTo = request.inboundDate.getMaxStayDays();
        searchParams.returnFrom = "";
        searchParams.returnTo = "";
      } else {
        searchParams.typeFlight = "oneway";
        searchParams.returnFrom = "";
        searchParams.returnTo = "";
      }
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


    searchParams.adults = request.passengers || 1;
    searchParams.children = 0;
    searchParams.infants = 0;


    var deferred = Q.defer();
    superagent
      .get(skypickerApiUrl)
      .query(searchParams)
      //.set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Accept', 'application/json')
      .on('error', handleError)
      .end((error, res) => {
        if (!error) {
          try {
            if (this.options.format == "original") {
              deferred.resolve(res.body.data);
            } else {
              debugger;
              var formatted = res.body.data.map(flight => flightsApiToJourney(flight));
              deferred.resolve(formatted);
            }
          } catch (error) {
            deferred.reject(error);
          }
        } else {
          //Totally weird error handling by superagent
          deferred.reject(error);
        }
      });
    return deferred.promise;
  }
}

module.exports = new FlightsAPI();

