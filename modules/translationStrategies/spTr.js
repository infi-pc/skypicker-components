var tr = function (original,key,values) {
  if (!key) {
    key = original.toLowerCase().trim().replace(" ", "_");
  }
  return $.t('form_search.'+key, {defaultValue: original, postProcess: 'sprintf', sprintf: values});
};

module.exports = tr;
