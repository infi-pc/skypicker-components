
EventMixin = {};

EventMixin.addEventListener = function(name, handler) {
  if (!this.events) this.events = {};
  if (!this.events[name]) this.events[name] = [];
  this.events[name].push(handler);
};

EventMixin.removeEventListener = function(name, handler) {
  if (!this.events) return;
  if (!this.events[name]) return;
  for (var i = this.events[name].length - 1; i >= 0; i--)
    if (this.events[name][i] == handler)
      this.events[name].splice(i, 1);
};

EventMixin.raiseEvent = function(name, args) {
  if (!this.events) return;
  if (!this.events[name]) return;
  for (var i = 0; i < this.events[name].length; i++)
    this.events[name][i].apply(this, args);
};



/*
 augment( Car, Mixin,'driveForward','driveBackward' );
 */
function augment( receivingClass, givingClass ) {
  for ( var methodName in givingClass ) {
    if ( !receivingClass.prototype[methodName] ) {
      receivingClass.prototype[methodName] = givingClass[methodName];
    }
  }
}

module.exports.augment = function (receivingClass) {
  augment( receivingClass, EventMixin )
};
