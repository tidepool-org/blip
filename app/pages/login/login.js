/** @jsx React.DOM */
var React = window.React;
var _ = window._;

var InputGroup = require('../../components/inputgroup');

var Login = React.createClass({
  propTypes: {
    onValidate: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    onSubmitSuccess: React.PropTypes.func
  },

  attributeToLabelMapping: {
    'username': 'Email',
    'password': 'Password'
  },

  getInitialState: function() {
    return {
      loggingIn: false,
      message: null,
      user: {
        username: '',
        password: ''
      },
      validationErrors: {}
    };
  },

  render: function() {
    var submitButton = this.renderSubmitButton({
      text: this.state.loggingIn ? 'Logging in...' : 'Log in',
      disabled: this.state.loggingIn ? true : null
    });
    var message = this.renderMessage();

    /* jshint ignore:start */
    return (
      <div className="login">
        <ul>
          <li><a href="#/">Blip</a></li>
          <li><a href="#/signup" className="js-signup-link">Sign up</a></li>
        </ul>
        <form>
          {this.renderInputForAttribute('username')}
          {this.renderInputForAttribute('password', {type: 'password'})}
          {submitButton}
          {message}
        </form>
      </div>
    );
    /* jshint ignore:end */
  },

  renderInputForAttribute: function(name, options) {
    options = options || {};
    var type = options.type || null;
    var disabled = options.disabled || null;
    var label = this.attributeToLabelMapping[name];
    var value = this.state.user && this.state.user[name];
    var error = this.state.validationErrors[name];
    
    /* jshint ignore:start */
    return (
      <InputGroup
        name={name}
        label={label}
        value={value}
        error={error}
        type={type}
        disabled={disabled}
        onChange={this.handleChange}/>
      
    );
    /* jshint ignore:end */
  },

  renderSubmitButton: function(options) {
    options = options || {};
    var text = options.text || 'Submit';
    var disabled = options.disabled || null;

    /* jshint ignore:start */
    return (
      <button
        className="login-button js-login-button"
        onClick={this.handleSubmit}
        disabled={disabled}>{text}</button>
    );
    /* jshint ignore:end */
  },

  renderMessage: function() {
    var message = this.state.message;
    if (message) {
      return (
        /* jshint ignore:start */
        <div className="login-message js-login-message">{message}</div>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  handleChange: function(e) {
    var key = e.target.name;
    var value = e.target.value;
    if (key) {
      var user = _.clone(this.state.user);
      user[key] = value;
      this.setState({user: user});
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var self = this;

    if (this.state.loggingIn) {
      return;
    }

    this.setState({
      loggingIn: true,
      validationErrors: {},
      message: null
    });

    var user = this.state.user;
    var validationErrors = this.validateUser(user);
    if (!_.isEmpty(validationErrors)) {
      self.setState({
        loggingIn: false,
        validationErrors: validationErrors,
        message: 'Some entries are invalid.'
      });
      return;
    }

    var submit = this.props.onSubmit;
    if (submit) {
      var username = user.username;
      var password = user.password;
      submit(username, password, function(err) {
        if (err) {
          self.setState({
            loggingIn: false,
            message: err.message || 'An error occured while logging in.'
          });
          return;
        }
        self.setState({loggingIn: false});
        self.props.onSubmitSuccess();
      });
    }
  },

  validateUser: function(user) {
    var errors = {};

    var validate = this.props.onValidate;
    if (validate) {
      errors = validate(user);
    }

    return errors;
  }
});

module.exports = Login;