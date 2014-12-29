var express = require('express');
var fs = require('fs');
var React = require('react');

var port = 9001;
require('node-jsx').install({harmony: true});


var contextOptions = require('./contexts/root.js');
var BaseTemplate = React.createFactory(require('./contexts/base.jsx'));

//var BUNDLE = fs.readFileSync('./browser-bundle.js', {encoding: 'utf8'});
//var TEMPLATE = fs.readFileSync('./index.html', {encoding: 'utf8'});

var app = express();


var listContexts = function (message) {
  var ContextList = React.createFactory(require('./contexts/contextList.jsx'));
  var contextList = React.createElement(ContextList, {
    "message": message,
    "contextOptions": contextOptions
  });
  return React.renderToStaticMarkup(contextList);
};

app.use(express.static(__dirname + '/.tmp'));
app.use(express.static(__dirname + '/contexts'));
app.use(express.static(__dirname + '/shared'));


app.get('/', function(req, res) {
  console.log(req.query.context);
  console.log(req.query.case);
  var currentContext = contextOptions[req.query.context];
  if (!currentContext) {
    res.send(listContexts("no such context"));
    return
  }
  var currentCase = currentContext.cases[req.query.case];
  if (!currentCase) {
    res.send(listContexts("no such case"));
    return
  }
  var contentTemplate = React.createFactory(require('./contexts/templates/datePicker.jsx'));
  var baseTemplate = React.createElement(BaseTemplate, {
    "caseName": req.query.case,
    "contextName": req.query.context,
    "context": currentContext,
    "content": React.createElement(contentTemplate, {})
  });
  var str = React.renderToStaticMarkup(baseTemplate);
  res.send(str);
});

console.log("see http://localhost:"+port+"/");

app.listen(port);
