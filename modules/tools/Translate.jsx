
//Nicer wrapper of skypicker's translate

var translate = function (key,values,defaultShow) {
  var translated;
  // prevent throwing exception on wrong sprintf format
  try {
    translated = $.t(key, values);
  } catch (e) {
    translated = defaultShow;
  }
  if (!translated) {
    console.error("translation is missing");
    return defaultShow;
  }

  return translated
};

module.exports = translate;
