/** @jsx React.DOM */
var React = window.React;

var Logout = React.createClass({
  render: function() {
    var message = this.getMessage();

    var classString = 'logout';
    if (this.props.fadeOut) {
      classString += ' logout-fade-out';
    }
    
    /* jshint ignore:start */
    return (
      <div className={classString}>{message}</div>
    );
    /* jshint ignore:end */
  },

  getMessage: function() {
    return 'Logging out...';
  }
});

module.exports = Logout;