var ModalMenuMixin = {

  renderBody: function() {
    var mode = this.state.viewMode;
    if (!mode ) {
      return "";
    }
    var methodName = "render"+mode.charAt(0).toUpperCase() + mode.slice(1);
    if (this[methodName]) {
      return this[methodName]();
    } else {
      throw new Error("no such method: " + methodName)
    }
  },

  renderMenu: function () {
    var mode = this.state.viewMode;
    var modeOptions = [];
    for (var imode in this.props.modes) {
      if (this.props.modes[imode]) {
        var className = "mode-"+imode;
        if (mode == imode) {
          className += " active";
        }
        modeOptions.push(<div key={imode} className={className} onClick={ this.switchModeTo(imode) }>{ this.getModeLabel(imode) }</div>)
      }
    }
    return (
      <div className="mode-selector">
          {modeOptions}
      </div>
    )
  }
};

module.exports = ModalMenuMixin;
