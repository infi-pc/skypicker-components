/** @jsx React.DOM */

var isIE = require('./tools/isIE.js');
var moment = require('moment');
var Tran = require('./Tran.jsx');



var ModalPicker = React.createClass({

  getDefaultProps: function() {
    return {
      getContent: function () {
        return (<div>Loading...</div>)
      }
    };
  },

  getInitialState: function() {
    return {
      shown: false,
      width: 0,
      height: 0,
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    };
  },

  hide: function () {
    this.props.onHide();
    this.setState({
      shown: false
    });
  },

  show: function () {
    this.setState({
      shown: true
    });
  },

  clickOutside: function (e) {
    if (this.refs.inner) {
      if ($(this.refs.inner.getDOMNode()).has(e.target).length) return;
    }
    if ($(this.props.inputElement).is(e.target)) return;
    if ($(this.props.inputElement).has(e.target).length) return;
    this.hide();
  },

  windowResized: function (e) {
    //TODO check performance and eventually make some delayed resize
    this.setState({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });
  },
  onChange: function (value, changeType) {
    if (this.props.modes[value.mode] && this.props.modes[value.mode].closeAfter == changeType) {
      this.hide();
    }
    this.props.onChange(value, changeType);
  },

  componentDidMount: function() {
    document.addEventListener("click", this.clickOutside, false);
    window.addEventListener('resize', this.windowResized);
  },

  componentWillUnmount: function() {
    document.removeEventListener("click", this.clickOutside, false);
    window.removeEventListener('resize', this.windowResized);
  },

  calculateStyles: function () {
    if (isIE(8,'lte')) {
      return {};
    }
    var rect = this.props.inputElement.getBoundingClientRect();

    var pageWidth = $(window).width();
    var width = this.state.width;
    var offset = rect.left;
    var top = rect.bottom + window.pageYOffset;
    var maxWidth = pageWidth;
    var outerStyles;
    var addClass = "";

    if (width > maxWidth) {
      //make smaller version
      addClass = "compact-size";
      if (this.state.widthCompact) {
        width = this.state.widthCompact;
      }
    }

    if (offset + width < maxWidth) {
      //KEEP IT
      outerStyles = {
        marginLeft: offset,
        width: width
      };
    } else if (offset + width > maxWidth && width < maxWidth) {
      //MOVE IT
      var missingSpace = offset + width - maxWidth;
      outerStyles = {
        marginLeft: offset - missingSpace,
        width: width
      };
    } else {
      outerStyles = {
        marginLeft: 0,
        width: "100%"
      };
    }
    outerStyles.top = top + "px";
    return {
      outer: outerStyles,
      addClass: addClass
    };
  },

  calculateOuterStyles: function () {
    if (isIE(8,'lte')) {
      return {};
    }

  },
  onSizeChange: function (sizes) {
    this.setState({
      width: sizes.width,
      height: sizes.height,
      widthCompact: sizes.widthCompact,
      heightCompact: sizes.heightCompact
    });
  },
  render: function() {
    if (!this.state.shown) {
      return (
        <div></div>
      );
    }
    var styles = this.calculateStyles();
    var className = "search-modal " + (styles.addClass ? styles.addClass : "");
    return (
      <div className={className} style={styles.outer} >
        <div className="close-button" onclick={this.hide}><Tran tKey="close">close</Tran></div>
        <div className="search-modal-content" ref="inner">{this.props.getContent(this.onSizeChange)}</div>
      </div>
    );
  }
});

module.exports = ModalPicker;


