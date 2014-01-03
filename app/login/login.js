/** @jsx React.DOM */
var React = window.React;

var Login = React.createClass({
  render: function() {
    var button = this.getButton();
    var message = this.getMessage();

    /* jshint ignore:start */
    return (
      <div className="login">
        {button}
        <div className="login-message">{message}</div>
      </div>
    );
    /* jshint ignore:end */
  },

  handleLogin: function() {
    var login = this.props.onLogin;
    if (login) {
      login();
    }
  },

  getButton: function() {
    var disabled = this.props.loggingIn ? true : null;
    var text = this.props.loggingIn ? 'Logging in...' : 'Log in demo';
    
    /* jshint ignore:start */
    return (
      <button
        className="login-button"
        onClick={this.handleLogin}
        ref="button"
        disabled={disabled}>{text}</button>
    );
    /* jshint ignore:end */
  },

  getMessage: function() {
    return this.props.message;
  }
});

module.exports = Login;