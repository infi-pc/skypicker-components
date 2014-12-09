var tr = function (original,key,values) {
  if (!key) {
    key = original.toLowerCase().trim().replace(" ", "_");
  }
  return $.t('form_search.'+key);
};

module.exports = tr;
