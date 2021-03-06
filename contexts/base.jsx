var React = require('react');

var Base = React.createClass({
    renderScripts: function (scripts) {
        return scripts.map(function (url) {
            return <script src={url}></script>
        })
    },
    renderStyles: function (styles) {
        return styles.map(function (url) {
            return <link rel="stylesheet" type="text/css" href={url} />
        })
    },
    render: function() {
        var context = this.props.context;
        var oneCase = context.cases[this.props.caseName];
        var title = this.props.contextName + " - " + this.props.caseName;
        return (
            <html>
                <head lang="en">
                    <meta charSet="UTF-8" />
                    <title>{title}</title>
                    <script src="http://localhost:35729/livereload.js"></script>
                    {this.renderScripts(context.libs)}
                    {this.renderStyles(oneCase.styles)}
                </head>
                <body>
                    {this.props.content}
                    {this.renderScripts(oneCase.scripts)}
                </body>
            </html>
        );
    }
});
module.exports = Base;

