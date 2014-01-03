/** @jsx React.DOM */
var React = window.React;
var _ = window._;

var Profile = React.createClass({
  getInitialState: function() {
    return {
      message: null,
      // New user values
      user: this.props.user
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // Keep new user attributes in sync with upstream changes
    // (`setState` does not trigger an additional render)
    this.setState({user: nextProps.user});
  },

  render: function() {
    var user = this.state.user || {};
    var disabled = _.isEmpty(user) ? true : null;
    var saveButtonElement = this.getSaveButtonElement(disabled);
    var message = this.state.message;

    /* jshint ignore:start */
    return (
      <form className="profile">
        <div>First name: <input ref="firstName" name="firstName" value={user.firstName} onChange={this.handleChange} disabled={disabled} /></div>
        <div>Last name: <input ref="lastName" name="lastName" value={user.lastName} onChange={this.handleChange} disabled={disabled} /></div>
        {saveButtonElement}
        <div className="profile-message">{message}</div>
      </form>
    );
    /* jshint ignore:end */
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

    var user = this.getUserFormValues();
    this.setState({message: null});
    clearTimeout(this.messageTimeoutId);

    var validate = this.props.onValidate;
    if (validate) {
      var validationError = validate(user);
      if (validationError) {
        this.setState({message: validationError});
        return;
      }
    }

    var save = this.props.onSave;
    if (save) {
      save(user);
      // Save optimistically
      this.setState({message: 'All changes saved.'});
      this.messageTimeoutId = setTimeout(function() {
        self.setState({message: null});
      }, 2000);
    }
  },

  getSaveButtonElement: function(disabled) {
    var text = 'Save';

    /* jshint ignore:start */
    return (
      <button
        className="profile-button"
        onClick={this.handleSave}
        disabled={disabled}>{text}</button>
    );
    /* jshint ignore:end */
  },

  getUserFormValues: function() {
    return {
      firstName: this.refs.firstName.getDOMNode().value.trim(),
      lastName: this.refs.lastName.getDOMNode().value.trim()
    };
  }
});

module.exports = Profile;