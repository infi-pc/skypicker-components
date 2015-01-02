// Older version of skypicker API - i don't even know if it is working for every feature
// right now it is used only in DealsList and should be removed later


var SkypickerAPIv1, firstDay, formatDate, inHalfAnYear, lastDay, pad, today;

today = function() {
  return new Date();
};

inHalfAnYear = function() {
  return new Date((new Date()).setMonth(new Date().getMonth() + 6));
};

firstDay = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

lastDay = function(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

pad = function(num, size) {
  var s;
  s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }
  return s;
};

formatDate = function(date) {
  return pad(date.getDate(), 2) + "/" + pad(date.getMonth() + 1, 2) + "/" + date.getFullYear();
};

SkypickerAPIv1 = (function() {
  function SkypickerAPI(settings) {
    this.settings = settings;
  }


  /*
   Request:
   {
   from: string
   to: string, default: "anywhere"
   date: date | {from: date, to: date} | "anytime"
   returnDate: date | {from: date, to: date} | "anytime" | null
   flyDays: (not used now)
   daysInDestination: {from: int, to: int}, default: null
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
      flyDays: [],
      directFlights: 0,
      oneforcity: request.oneForCity ? "1" : "",
      sort: "price",
      asc: 1,
      locale: this.settings.lang
    };
    if (typeof request.date === "object") {
      if (request.date instanceof Date) {
        searchParams.dateFrom = formatDate(request.date);
        searchParams.dateTo = formatDate(request.date);
      } else {
        searchParams.dateFrom = formatDate(request.date.from);
        searchParams.dateTo = formatDate(request.date.to);
      }
    } else if (request.date === "anytime") {
      searchParams.dateFrom = formatDate(today());
      searchParams.dateTo = formatDate(inHalfAnYear());
    } else {
      throw new Error("date must be filled");
    }
    if (typeof request.returnDate === "object") {
      searchParams.typeFlight = "return";
      if (request.returnDate instanceof Date) {
        searchParams.returnFrom = formatDate(request.returnDate);
        searchParams.returnTo = formatDate(request.returnDate);
      } else {
        searchParams.returnFrom = formatDate(request.returnDate.from);
        searchParams.returnTo = formatDate(request.returnDate.to);
      }
    } else if (request.returnDate === "anytime") {
      searchParams.returnFrom = formatDate(today());
      searchParams.returnTo = formatDate(inHalfAnYear());
    } else {
      searchParams.typeFlight = "oneway";
      searchParams.returnFrom = "";
      searchParams.returnTo = "";
    }
    if (request.returnDate === "anytime") {
      if (request.daysInDestination) {
        searchParams.daysInDestinationFrom = request.daysInDestination.from;
        searchParams.daysInDestinationTo = request.daysInDestination.to;
      } else {
        searchParams.daysInDestinationFrom = 2;
        searchParams.daysInDestinationTo = 10;
      }
    } else {
      searchParams.daysInDestinationFrom = 0;
      searchParams.daysInDestinationTo = 0;
    }
    return $.ajax({
      url: skypickerApiUrl,
      dataType: "json",
      data: searchParams,
      success: (function(data) {
        return callback(null, data.data);
      }).bind(this),
      error: (function(xhr, status, err) {
        walog("deals list", "error", {
          status: status,
          err: err
        });
        return callback(err);
      }).bind(this)
    });
  };

  return SkypickerAPI;

})();

module.exports = SkypickerAPIv1;
