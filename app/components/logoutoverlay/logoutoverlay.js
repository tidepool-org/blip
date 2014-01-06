/** @jsx React.DOM */
var React = window.React;

var LogoutOverlay = React.createClass({
  FADE_OUT_DELAY: 200,

  getInitialState: function() {
    return {
      fadeOut: false
    };
  },

  render: function() {
    var classString = 'logout-overlay';
    if (this.state.fadeOut) {
      classString += ' logout-overlay-fade-out';
    }
    
    return (
      /* jshint ignore:start */
      <div className={classString}>Logging out...</div>
      /* jshint ignore:end */
    );
  },

  fadeOut: function(callback) {
    callback = callback || function() {};
    this.setState({fadeOut: true});
    setTimeout(callback, this.FADE_OUT_DELAY);
  }
});

module.exports = LogoutOverlay;