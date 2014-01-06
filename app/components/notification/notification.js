/** @jsx React.DOM */
var React = window.React;

var Notification = React.createClass({
  propTypes: {
    message: React.PropTypes.string,
    onClose: React.PropTypes.func
  },
  
  render: function() {
    var message = this.getMessage();

    return (
      /* jshint ignore:start */
      <div className="notification">
        <span className="notification-message">{message}</span>
        <span>{' '}</span>
        <a 
          className="notification-close"
          href=""
          onClick={this.handleClose}>Close</a>
      </div>
      /* jshint ignore:end */
    );
  },

  getMessage: function() {
    return this.props.message;
  },

  handleClose: function(e) {
    e.preventDefault();
    var close = this.props.onClose;
    if (close) {
      close();
    }
  }
});

module.exports = Notification;