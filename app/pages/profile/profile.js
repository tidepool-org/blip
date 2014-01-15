/** @jsx React.DOM */
var React = window.React;
var _ = window._;

var SimpleForm = require('../../components/simpleform');

var Profile = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    onValidate: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  formInputs: [
    {name: 'firstName', label: 'First name'},
    {name: 'lastName', label: 'Last name'},
    {name: 'username', label: 'Email'},
    {name: 'password', label: 'Password', type: 'password'},
    {name: 'passwordConfirm', label: 'Confirm assword', type: 'password'}
  ],

  MESSAGE_TIMEOUT: 2000,

  getInitialState: function() {
    return {
      formValues: this.props.user || {},
      validationErrors: {},
      notification: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // Keep form values in sync with upstream changes
    this.setState({formValues: nextProps.user || {}});
  },

  render: function() {
    var form = this.renderForm();

    /* jshint ignore:start */
    return (
      <div className="profile">
        {form}
      </div>
    );
    /* jshint ignore:end */
  },

  renderForm: function() {
    var disabled = this.isDisabled();

    /* jshint ignore:start */
    return (
      <SimpleForm
        inputs={this.formInputs}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText="Save"
        onSubmit={this.handleSubmit}
        notification={this.state.notification}
        disabled={disabled}/>
    );
    /* jshint ignore:end */
  },

  isDisabled: function() {
    var user = this.props.user || {};
    return _.isEmpty(user) ? true : null;
  },

  handleSubmit: function(formValues) {
    var self = this;

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    this.submitFormValues(formValues);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
    clearTimeout(this.messageTimeoutId);
  },

  validateFormValues: function(formValues) {
    var validationErrors = {};
    var validate = this.props.onValidate;

    formValues = _.clone(formValues);
    formValues = this.omitPasswordAttributesIfNoChange(formValues);

    validationErrors = validate(formValues);
    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message:'Some entries are invalid.'
        }
      });
    }

    return validationErrors;
  },

  omitPasswordAttributesIfNoChange: function(formValues) {
    if (!formValues.password && !formValues.passwordConfirm) {
      return _.omit(formValues, ['password', 'passwordConfirm']);
    }
    return formValues;
  },

  submitFormValues: function(formValues) {
    var self = this;
    var submit = this.props.onSubmit;

    // Save optimistically
    submit(formValues);
    this.setState({
      notification: {type: 'success', message: 'All changes saved.'}
    });

    this.messageTimeoutId = setTimeout(function() {
      self.setState({notification: null});
    }, this.MESSAGE_TIMEOUT);
  }
});

module.exports = Profile;