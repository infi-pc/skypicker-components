
/* NOT USED NOW */


var slugFromString = function (str) {

  if (!str) {
    return str;
  }

  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  // beware: we do not wanna replace `,`, becuase it could mean `minus` in coordinates
  var from = 'ãàáäâďẽèéëêěìíïîõòóöôùúüûůñňçšťčřžý·/_:;';
  var to = 'aaaaadeeeeeeiiiiooooouuuuunncstcrzy-------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  // Strip parenthesis: Brno (Czech Republic)
  str = str.replace('(', '');
  str = str.replace(')', '');
  // String , from radius
  str = str.replace(',', '');

  return str.replace(/\s+/g, '-'); // collapse whitespace and replace by -

};



class RouterFunctions {
  constructor() {

  }

  searchFormDataToURL(searchFormData) {
    var url = "";
    // this function is callback of attr change, but attr is not changed yet,
    // so if it doesn't exist, use DOM manipulation :(
    // TODO: Create destionation class with "toUrl" method
    url = '/' + translateFc('seo.from_to.url', {
      from: self.slugFromString(self.appState.attr('from.name') || $('#from').val()),
      to: self.slugFromString(self.appState.attr('to.name') || $('#to').val())
    });
  }
}
