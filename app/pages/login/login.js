/** @jsx React.DOM */
var React = window.React;

var LoginForm = require('../../components/loginform');

var Login = React.createClass({
  propTypes: {
    login: React.PropTypes.func.isRequired,
    onLoginSuccess: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {
      loggingIn: false,
      message: null
    };
  },

  render: function() {
    var loginForm = this.renderLoginForm();
    var message = this.renderMessage();

    return (
      /* jshint ignore:start */
      <div className="login">
        {loginForm}
        {message}
        <p><a href="#">Forgot your password?</a></p>
      </div>
      /* jshint ignore:end */
    );
  },

  renderLoginForm: function() {
    return (
      /* jshint ignore:start */
      <LoginForm 
        loggingIn={this.state.loggingIn}
        onLogin={this.handleLogin} />
      /* jshint ignore:end */
    );
  },

  renderMessage: function() {
    var message = this.state.message;
    if (message) {
      return (
        /* jshint ignore:start */
        <div className="login-message">{message}</div>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  handleLogin: function() {
    var self = this;

    if (this.state.loggingIn) {
      return;
    }

    this.setState({loggingIn: true});

    this.props.login(function(err) {
      if (err) {
        self.setState({
          loggingIn: false,
          errorMessage: err.message || 'An error occured while logging in.'
        });
        return;
      }
      self.setState({loggingIn: false});
      self.props.onLoginSuccess();
    });
  }
});

module.exports = Login;