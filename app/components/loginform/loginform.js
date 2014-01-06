/** @jsx React.DOM */
var React = window.React;

var LoginForm = React.createClass({
  propTypes: {
    loggingIn: React.PropTypes.bool,
    onLogin: React.PropTypes.func
  },

  render: function() {
    var loginButton = this.renderLoginButton();

    return (
      /* jshint ignore:start */
      <div className="login-form">
        {loginButton}
      </div>
      /* jshint ignore:end */
    );
  },

  renderLoginButton: function() {
    var disabled = this.props.loggingIn ? true : null;
    var text = this.props.loggingIn ? 'Logging in...' : 'Log in demo';
    
    return (
      /* jshint ignore:start */
      <button
        className="login-form-button"
        onClick={this.handleLogin}
        ref="button"
        disabled={disabled}>{text}</button>
      /* jshint ignore:end */
    );
  },

  handleLogin: function() {
    var login = this.props.onLogin;
    if (login) {
      login();
    }
  }
});

module.exports = LoginForm;