/** @jsx React.DOM */
var React = window.React;

var LoginForm = React.createClass({
  propTypes: {
    loggingIn: React.PropTypes.bool,
    onLogin: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      username: '',
      password: ''
    };
  },

  render: function() {
    var loginButton = this.renderLoginButton();

    return (
      /* jshint ignore:start */
      <div className="login-form">
        <div>
          <span>{'Email: '}</span>
          <input
            ref="username"
            name="username"
            value={this.state.username}
            onChange={this.handleChange} />
        </div>
        <div>
          <span>{'Password: '}</span>
          <input
            type="password"
            ref="password"
            name="password"
            value={this.state.password}
            onChange={this.handleChange} />
        </div>
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
        className="login-form-button js-login-form-button"
        onClick={this.handleLogin}
        ref="button"
        disabled={disabled}>{text}</button>
      /* jshint ignore:end */
    );
  },

  handleChange: function(e) {
    var key = e.target.name;
    var value = e.target.value;
    if (key) {
      var stateChange = {};
      stateChange[key] = value;
      this.setState(stateChange);
    }
  },

  handleLogin: function() {
    var formValues = this.getFormValues();

    var login = this.props.onLogin;
    if (login) {
      login(formValues.username, formValues.password);
    }
  },

  getFormValues: function() {
    return {
      username: this.refs.username.getDOMNode().value.trim(),
      password: this.refs.password.getDOMNode().value.trim()
    };
  }
});

module.exports = LoginForm;