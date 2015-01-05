SearchPlace = function (text) {
  this.type = "text";
  this.value = text;
};

SearchPlace.prototype.getText = function () {
  if (this.type == "text") {
    return this.value;
  }

};

module.exports = SearchPlace;
