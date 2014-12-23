var React = require('react');

var Base = React.createClass({
    render: function() {
        console.log(this.props.context);
        var title = this.props.context + " - " + this.props.case;
        return (
            <html>
                <head lang="en">
                    <meta charSet="UTF-8" />
                    <title>{title}</title>
                </head>
                <body>
                    {this.props.content}
                </body>
            </html>
        );
    }
});
module.exports = Base;

