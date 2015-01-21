var EventEmitter = require('events').EventEmitter;
var SearchPlace = require('./../containers/Options.jsx');

class OptionsStore {
  constructor() {
    this.events = new EventEmitter();
    this.data = new Options();
  }
  setValue(value) {
    var changed = false;
    if (this.data != value) {
      this.data = value;
      this.events.emit('change');
      changed = true;
    }
    return changed;
  }
  setOption(key, value) {
    return this.setValue(this.data.set(key, value));
  }
}



module.exports = new OptionsStore();
