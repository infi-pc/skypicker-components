function searchDateToString (date) {
  if (date.mode == "single") {
    return date.from.format("DD.MM.YYYY")
  } else if (date.mode == "timeToStay") {
    return date.minStayDays+ " - " + date.maxStayDays + " days"
  } else if (date.mode == "interval" || date.mode == "month") {
    var toDateString;
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
  sizes: {
    single: {width: 490, height: 0},
    interval: {width: 907, height: 0, widthCompact: 490},
    month: {width: 550, height: 0},
    timeToStay: {width: 550, height: 0},
    anytime: {width: 550, height: 0},
    noReturn: {width: 550, height: 0}
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
