SearchDate = function (text) {
  this.type = "text";
  this.value = text;
};

SearchDate.prototype.getText = function () {
  if (this.type == "text") {
    return this.value;
  }

};

module.exports = SearchDate;
