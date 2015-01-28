var EventEmitter = require('events').EventEmitter;
var Options = require('./../containers/Options.jsx');

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

  /**
   * Alias for set
   */
  setOption(key, value) {
    return this.set(key, value);
  }

  /**
   * Set one value to given key
   * @param key
   * @param value
   * @return {*}
   */
  set(key, value) {
    return this.setValue(this.data.set(key, value));
  }
}



module.exports = new OptionsStore();
