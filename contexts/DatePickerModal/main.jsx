/** @jsx React.DOM */

//Using global, TODO make it somehow importable from another bundle
var React = window.React;
//var React = require('react');

var DatePickerModal = require('./../../modules/DatePicker/DatePickerModal.jsx');
var SearchDate = require('./../../modules/containers/SearchDate.js');


var dateModel = new SearchDate();


var element = document.getElementById("date-picker")

var modes = {
  "single": true,
  "interval": true,
  "month": true,
  "timeToStay": true,
  "anytime": true,
  "noReturn": true
};


$(element).focus(function() {
  DatePickerModal.show(element, dateModel, modes, function(newDate) {

    if (newDate.mode == "single") {
      $(element).val(newDate.from.format("DD.MM.YYYY"))
    } else if (newDate.mode == "timeToStay") {
      $(element).val(newDate.minStayDays+ " - " + newDate.maxStayDays + " days")
    } else if (newDate.mode == "interval" || newDate.mode == "month") {
      var toDate;
      if (!newDate.to) {
        toDateString = "_"
      } else {
        toDateString = newDate.to.format("DD.MM.YYYY")
      }
      $(element).val(newDate.from.format("DD.MM.YYYY") + " - " + toDateString)
    } else {
      $(element).val(newDate.mode)
    }
  });

})
