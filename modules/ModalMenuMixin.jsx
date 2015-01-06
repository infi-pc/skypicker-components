var ModalMenuMixin = {
  switchModeTo: function (mode) {
    return () => {
      this.props.onChange(this.props.value, "changeMode");
      this.setState({
        viewMode: mode
      });
    }
  },
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
  }

};

module.exports = ModalMenuMixin;
