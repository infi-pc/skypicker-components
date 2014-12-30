var React = require('react');

var SplitScreen = React.createClass({
  renderIFrames: function (targets) {
    var count = targets.length;
    var style = {
      width: "100%",
      height: "400px"//(100 / count) + "%"
    };
    return targets.map(function (target) {
      var url = "/?context="+target.context+"&case="+target.case;
      return <iframe style={style} src={url}></iframe>
    });
  },
  render: function() {
    return (
      <html>
        <head lang="en">
          <meta charSet="UTF-8" />
          <title>Contexts</title>
          <link rel="stylesheet" type="text/css" href="styles/bootstrap.css" />
        </head>
        <body>
          {this.renderIFrames(this.props.targets)}
        </body>
      </html>
    );
  }
});
module.exports = SplitScreen;


