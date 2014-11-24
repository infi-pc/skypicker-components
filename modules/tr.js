
/* simple function to translate plain texts */
/* to get text which are not translated on current page, take console.log(window.toTranslate) */

var tr = function (original) {
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

  if (arguments.length > 1) {
    for (var i = 1, j = arguments.length; i < j; i++){
      translated = translated.replace("%s",arguments[i])
    }
  }


  return translated;
};

module.exports = tr;
