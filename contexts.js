var express = require('express');
var fs = require('fs');
var React = require('react');

require('node-jsx').install({harmony: true});


var contextOptions = require('./contexts/root.js');
var BaseTemplate = React.createFactory(require('./contexts/base.jsx'));

//var BUNDLE = fs.readFileSync('./browser-bundle.js', {encoding: 'utf8'});
//var TEMPLATE = fs.readFileSync('./index.html', {encoding: 'utf8'});

var app = express();


app.get('/', function(req, res) {
  console.log(req.query.context);
  console.log(req.query.case);
  var currentContext = contextOptions[req.query.context];
  if (!currentContext) {
    res.send("no such context");
    return
  }
  var currentCase = currentContext.cases[req.query.case];
  if (!currentCase) {
    res.send("no such case");
    return
  }
  var contentTemplate = React.createFactory(require('./contexts/templates/datePicker.jsx'));
  var baseTemplate = React.createElement(BaseTemplate, {
    "case": req.query.case,
    "context": req.query.context,
    "content": React.createElement(contentTemplate, {})
  });
  var str = React.renderToString(baseTemplate);
  res.send(str);
});

app.listen(9001);
