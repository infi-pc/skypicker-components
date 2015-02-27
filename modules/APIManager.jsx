
var flightsAPI = require('./APIs/flightsAPI.jsx');
var OptionsStore = require('./stores/OptionsStore.jsx');

class APIManager {
  constructor() {
    OptionsStore.events.on("change", () => {
      flightsAPI.setOptions({language: OptionsStore.data.language});
    })
  }
}

module.exports = new APIManager();
