
var TimelineStore = require("./../PriceGraph/TimelineStore.js");
var SearchDate = require("./../containers/SearchDate.js");


var ts = new TimelineStore("PRG","LON");
ts.preload(moment(), moment().add(1,"months"), function () {
  console.log("done")
});


console.log("timeline");
