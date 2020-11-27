// based on https://github.com/instructure-react/react-toggle
// TODO: eventually will replace this with a dependency from our fork
// but there are React dependency issues at the moment

/* jshint ignore: start */


var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/* jshint esnext:true, asi: true */

var _ = _interopRequire(require('lodash'));
var PropTypes = _interopRequire(require('prop-types'));
var React = _interopRequire(require('react'));
var ReactDOM = _interopRequire(require('react-dom'));

var classNames = _interopRequire(require('classnames'));

module.exports = class extends React.PureComponent {
  static displayName = 'Toggle';

  static propTypes = {
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    onChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.string,
    id: PropTypes.string,
    'aria-labelledby': PropTypes.string,
    'aria-label': PropTypes.string
  };

  constructor(props) {
    super(props);
    var checked = false;
    if ('checked' in props) {
      checked = props.checked;
    } else if ('defaultChecked' in props) {
      checked = props.defaultChecked;
    }

    this.state = {
      checked: !!checked,
      hasFocus: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('checked' in nextProps) {
      this.setState({ checked: !!nextProps.checked });
    }
  }

  handleClick = (event) => {
    var checkbox;
    checkbox = ReactDOM.findDOMNode(this.refs.input);
    if (event.target !== checkbox) {
      event.preventDefault();
      checkbox.focus();
      checkbox.click();
      return;
    }

    if (!('checked' in this.props)) {
      this.setState({ checked: checkbox.checked });
    }
  };

  handleFocus = () => {
    this.setState({ hasFocus: true });
  };

  handleBlur = () => {
    this.setState({ hasFocus: false });
  };

  render() {
    var classes = classNames('react-toggle', {
      'react-toggle--checked': this.state.checked,
      'react-toggle--focus': this.state.hasFocus,
      'react-toggle--disabled': this.props.disabled
    });

    // eslint-disable-next-line no-undef
    var check = this.props.noImage ? null : React.createElement(Check, null);
    // eslint-disable-next-line no-undef
    var x = this.props.noImage ? null : React.createElement(X, null);

    return React.createElement(
      'div',
      { className: classes, onClick: this.handleClick },
      React.createElement(
        'div',
        { className: 'react-toggle-track' },
        React.createElement(
          'div',
          { className: 'react-toggle-track-check' },
          check
        ),
        React.createElement(
          'div',
          { className: 'react-toggle-track-x' },
          x
        )
      ),
      React.createElement('div', { className: 'react-toggle-thumb' }),
      React.createElement('input', _extends({
        ref: 'input',
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        className: 'react-toggle-screenreader-only',
        type: 'checkbox'
      }, _.omit(this.props, 'noImage')))
    );
  }
};

/* jshint ignore: end */