/** @jsx React.DOM */
var React = window.React;
var _ = window._;

var Profile = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    onValidate: React.PropTypes.func,
    onSave: React.PropTypes.func
  },

  MESSAGE_TIMEOUT: 2000,

  attributeToLabelMapping: {
    'firstName': 'First name',
    'lastName': 'Last name',
    'username': 'Email',
    'password': 'Password',
    'passwordConfirm': 'Confirm password'
  },

  getInitialState: function() {
    var self = this;
    return {
      message: null,
      // New user values
      user: self.props.user,
      validationErrors: {}
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // Keep new user attributes in sync with upstream changes
    // (here `setState` will not trigger an additional render)
    this.setState({user: nextProps.user});
  },

  addPasswordAttributes: function(user) {
    if (_.isEmpty(user)) {
      return {};
    }

    return _.extend(user, {
      password: '',
      passwordConfirm: ''
    });
  },

  render: function() {
    var disabled = this.isDisabled();
    var saveButton = this.renderSaveButton(disabled);
    var message = this.state.message;

    return (
      /* jshint ignore:start */
      <div className="profile">
        <form>
          {this.renderInputForAttribute('firstName', {disabled: disabled})}
          {this.renderInputForAttribute('lastName', {disabled: disabled})}
          {this.renderInputForAttribute('username', {disabled: disabled})}
          {this.renderInputForAttribute('password', {
            disabled: disabled,
            type: 'password'
          })}
          {this.renderInputForAttribute('passwordConfirm', {
            disabled: disabled,
            type: 'password'
          })}
          {saveButton}
          <div className="profile-message js-profile-message">{message}</div>
        </form>
      </div>
      /* jshint ignore:end */
    );
  },

  isDisabled: function() {
    var user = this.state.user || {};
    return _.isEmpty(user) ? true : null;
  },

  renderInputForAttribute: function(name, options) {
    options = options || {};
    var type = options.type || null;
    var user = this.state.user || {};
    var disabled = options.disabled || null;
    var label = this.attributeToLabelMapping[name] + ': ';
    var validationError = this.renderValidationErrorForAttribute(name);
    var className = validationError ? 'profile-input-error' : null;

    return (
      /* jshint ignore:start */
      <div className={className}>
        <div>
          <span className="profile-input-label">{label}</span>
          <input
            type={type}
            className="profile-input-control"
            ref={name}
            name={name}
            value={user[name]}
            onChange={this.handleChange}
            disabled={disabled} />
        </div>
        {validationError}
      </div>
      /* jshint ignore:end */
    );
  },

  renderValidationErrorForAttribute: function(name) {
    var message = this.state.validationErrors[name];

    if (message) {
      return (
        /* jshint ignore:start */
        <div className="profile-validation-error">
          {message}
        </div>
        /* jshint ignore:end */
      );
    }

    return null;
  },

  renderSaveButton: function(disabled) {
    return (
      /* jshint ignore:start */
      <button
        className="profile-button js-profile-button"
        onClick={this.handleSave}
        disabled={disabled}>Save</button>
      /* jshint ignore:end */
    );
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

  handleSave: function(e) {
    e.preventDefault();
    var self = this;

    this.setState({
      validationErrors: {},
      message: null
    });
    clearTimeout(this.messageTimeoutId);

    var user = _.clone(this.state.user);
    user = this.omitPasswordAttributesIfNoChange(user);
    var validationErrors = this.validateUser(user);
    if (!_.isEmpty(validationErrors)) {
      self.setState({
        validationErrors: validationErrors,
        message: 'Some entries are invalid.'
      });
      return;
    }

    var save = this.props.onSave;
    if (save) {
      save(user);
      // Save optimistically
      this.setState({message: 'All changes saved.'});
      this.messageTimeoutId = setTimeout(function() {
        self.setState({message: null});
      }, this.MESSAGE_TIMEOUT);
    }
  },

  omitPasswordAttributesIfNoChange: function(user) {
    if (!user.password && !user.passwordConfirm) {
      return _.omit(user, ['password', 'passwordConfirm']);
    }
    return user;
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

module.exports = Profile;