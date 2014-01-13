/** @jsx React.DOM */
var React = window.React;
var _ = window._;

var InputGroup = require('../../components/inputgroup');

var Signup = React.createClass({
  propTypes: {
    onValidate: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    onSubmitSuccess: React.PropTypes.func
  },

  attributeToLabelMapping: {
    'firstName': 'First name',
    'lastName': 'Last name',
    'username': 'Email',
    'password': 'Password'
  },

  getInitialState: function() {
    return {
      signingUp: false,
      message: null,
      user: {
        firstName: '',
        lastName: '',
        username: '',
        password: ''
      },
      validationErrors: {}
    };
  },

  render: function() {
    var submitButton = this.renderSubmitButton({
      text: 'Create account',
      disabled: this.state.signingUp ? true : null
    });
    var message = this.renderMessage();

    /* jshint ignore:start */
    return (
      <div className="signup">
        <ul>
          <li><a href="#/">Blip</a></li>
          <li><a href="#/login">Log in</a></li>
        </ul>
        <form>
          {this.renderInputForAttribute('firstName')}
          {this.renderInputForAttribute('lastName')}
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
        className="signup-button js-signup-button"
        onClick={this.handleSubmit}
        disabled={disabled}>{text}</button>
    );
    /* jshint ignore:end */
  },

  renderMessage: function() {
    var message = this.state.message;
    if (message) {
      /* jshint ignore:start */
      return (
        <div className="signup-message js-signup-message">{message}</div>
      );
      /* jshint ignore:end */
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

    if (this.state.signingUp) {
      return;
    }

    this.setState({signingUp: true});

    var user = this.state.user;
    this.setState({
      validationErrors: {},
      message: null
    });

    var validationErrors = this.validateUser(user);
    if (!_.isEmpty(validationErrors)) {
      self.setState({
        signingUp: false,
        validationErrors: validationErrors,
        message: 'Some entries are invalid.'
      });
      return;
    }

    var submit = this.props.onSubmit;
    if (submit) {
      submit(user, function(err, user) {
        if (err) {
          self.setState({
            signingUp: false,
            message: err.message || 'An error occured while signing up.'
          });
          return;
        }
        self.setState({signingUp: false});
        self.props.onSubmitSuccess(user);
      });
    }
    else {
      this.setState({signingUp: false});
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

module.exports = Signup;