
var tr = function (original,key,values) {
  var translates = window.globalTranslates;

  if (translates && translates[original]) {
    translated = translates[original]
  } else {
    if (!window.toTranslate) {
      window.toTranslate = {};
    }
    window.toTranslate[original] = original;
    translated = original;
  }

  if (values && values.length > 0) {
    for (var i = 0, j = values.length; i < j; i++){
      translated = translated.replace("%s",values[i])
    }
  }
  return translated;
};

module.exports = tr;
