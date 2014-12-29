var React = require('react');

var DatePicker = React.createClass({
    renderCases: function (contextName, cases) {
        var cases = Object.keys(cases).map(function(name) {
            var oneCase = cases[name];
            var link = "/?context=" + contextName + "&case=" + name;
            return (
              <li>
                <a href={link}>{name}</a>
              </li>
            );
        });
        return cases;
    },
    renderContexts: function () {
        var self = this;
        var contexts = Object.keys(this.props.contextOptions).map(function(name) {
            var context = self.props.contextOptions[name];
            var cases = self.renderCases(name, context.cases);
            return (
              <li>
                {name}
                <ul>
                    {cases}
                </ul>
              </li>
            );
        });
        return contexts;
    },
    render: function() {
        //var contexts = this.props.contextOptions.map(function() {
        //    return <li></li>
        //});

        return (
            <html>
                <head lang="en">
                    <meta charSet="UTF-8" />
                    <title>Contexts</title>
                    <link rel="stylesheet" type="text/css" href="styles/bootstrap.css" />
                </head>
                <body>
                    <div>
                        <div className="alert alert-info">
                            {this.props.message}
                        </div>
                        <ul>
                          {this.renderContexts()}
                        </ul>
                    </div>
                </body>
            </html>
        );
    }
});
module.exports = DatePicker;


