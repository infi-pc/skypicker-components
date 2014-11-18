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
  var options = {
    element: element,
    defaultValue: dateModel,
    modes: modes,
    minValue: moment().add(5,"days")
  };
  DatePickerModal.show(options, function(newDate) {

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
