/** @jsx React.DOM */
var React = window.React;

// Input with label and validation error message
var InputGroup = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    label: React.PropTypes.string,
    value: React.PropTypes.string,
    error: React.PropTypes.string,
    type: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },

  render: function() {
    var className = this.getClassName();
    var label = this.renderLabel();
    var input = this.renderInput();
    var message = this.renderMessage();

    return (
      /* jshint ignore:start */
      <div className={className}>
        <div>
          {label}
          {input}
        </div>
        {message}
      </div>
      /* jshint ignore:end */
    );
  },

  renderLabel: function() {
    var text = this.props.label;
    if (text) {
      text = text + ': ';
      return (
        /* jshint ignore:start */
        <span
          className="input-group-label"
          ref="label">{text}</span>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  renderInput: function() {
    return (
      /* jshint ignore:start */
      <input
        type={this.props.type}
        className="input-group-control"
        name={this.props.name}
        value={this.props.value}
        onChange={this.props.onChange}
        disabled={this.props.disabled}
        ref="control"/>
      /* jshint ignore:end */
    );
  },

  renderMessage: function() {
    var error = this.props.error;
    if (error) {
      return (
        /* jshint ignore:start */
        <div
          className="input-group-message"
          ref="message">{error}</div>
        /* jshint ignore:end */
      );
    }
    return null;
  },

  getClassName: function() {
    var className = 'input-group';
    if (this.props.error) {
      className += ' input-group-error';
    }
    return className;
  }
});

module.exports = InputGroup;