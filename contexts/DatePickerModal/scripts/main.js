function searchDateToString (date) {
  if (date.mode == "single") {
    return date.from.format("DD.MM.YYYY")
  } else if (date.mode == "timeToStay") {
    return date.minStayDays+ " - " + date.maxStayDays + " days"
  } else if (date.mode == "interval" || date.mode == "month") {
    var toDate;
    if (!date.to) {
      toDateString = "_"
    } else {
      toDateString = date.to.format("DD.MM.YYYY")
    }
    return date.from.format("DD.MM.YYYY") + " - " + toDateString
  } else {
    return date.mode
  }
}



var selectedDate1 = new SearchDate();
var element1 = document.getElementById("date-picker1");
var element1json = document.getElementById("date-picker1-json");
datePicker1 = new DatePickerModal({
  element: element1,
  //defaultValue: selectedDate1,
  modes: {
    "single": true,
    "interval": true,
    "month": true,
    "timeToStay": true,
    "anytime": true,
    "noReturn": true
  },
  minValue: moment().add(5,"days"),
  onChange: function(newDate) {
    $(element1).val(searchDateToString(newDate));
    $(element1json).html(JSON.stringify(newDate));
    datePicker1.setValue(newDate)
  }
});
$(element1).focus(function() {
  datePicker1.show();
});


//var element2 = document.getElementById("date-picker2");
//datePicker2 = new DatePickerModal({
//  element: element,
//  value: dateModel,
//  modes: {
//    "single": true,
//    "interval": true,
//    "month": true,
//    "timeToStay": true,
//    "anytime": true,
//    "noReturn": true
//  },
//  minValue: moment().add(5,"days")
//});


