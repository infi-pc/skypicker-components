var dateTools = require("./DateTools.js");

var getPlacesUrlString = function(places) {
  var names, place, _i, _len;
  if (typeof places === 'string' || places instanceof String) {
    return places;
  }
  names = [];
  for (_i = 0, _len = places.length; _i < _len; _i++) {
    place = places[_i];
    names.push(place.label);
  }
  return encodeURIComponent(names.join(";"));
};

var SkypickerTools = (function() {
  function SkypickerTools(settings) {
    this.settings = settings;
  }

  SkypickerTools.prototype.makeSearchUrl = function(outboundDate, inboundDate, origin, destination) {
    var targetUrl;
    targetUrl = this.settings.searchResultsUrl;
    targetUrl = targetUrl.replace("originsSubstitution", getPlacesUrlString(origin));
    targetUrl = targetUrl.replace("destinationsSubstitution", getPlacesUrlString(destination));
    targetUrl = targetUrl.replace("outboundDateSubstitution", dateTools.formatWADate(outboundDate));
    if (inboundDate) {
      targetUrl = targetUrl.replace("inboundDateSubstitution", dateTools.formatWADate(inboundDate));
    } else {
      targetUrl = targetUrl.replace("&inboundDate=inboundDateSubstitution", "");
    }
    return targetUrl;
  };

  return SkypickerTools;

})();

module.exports = SkypickerTools;



