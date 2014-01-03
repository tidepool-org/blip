/** @jsx React.DOM */
var React = window.React;

var Notification = React.createClass({
  render: function() {
    var message = this.getMessage();

    /* jshint ignore:start */
    return (
      <div className="notification">
        <span className="notification-message">{message}</span>
        <span>{' '}</span>
        <a 
          className="notification-close"
          href=""
          onClick={this.handleClose}>Close</a>
      </div>
    );
    /* jshint ignore:end */
  },

  handleClose: function(e) {
    e.preventDefault();
    var close = this.props.onClose;
    if (close) {
      close();
    }
  },

  getMessage: function() {
    return this.props.message;
  }
});

module.exports = Notification;