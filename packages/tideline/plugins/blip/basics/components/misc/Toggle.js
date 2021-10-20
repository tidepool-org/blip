import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";

class Toggle extends React.Component {
  static propTypes = {
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    onChange: PropTypes.func,
    name: PropTypes.string,
    value: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    noImage: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    var checked = false;
    if ("checked" in props) {
      checked = props.checked;
    } else if ("defaultChecked" in props) {
      checked = props.defaultChecked;
    }

    this.state = {
      checked: !!checked,
      hasFocus: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if ("checked" in nextProps) {
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

    if (!("checked" in this.props)) {
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
    var classes = classNames("react-toggle", {
      "react-toggle--checked": this.state.checked,
      "react-toggle--focus": this.state.hasFocus,
      "react-toggle--disabled": this.props.disabled
    });

    // eslint-disable-next-line no-undef
    var check = this.props.noImage ? null : React.createElement(Check, null);
    // eslint-disable-next-line no-undef
    var x = this.props.noImage ? null : React.createElement(X, null);

    return React.createElement(
      "div",
      { className: classes, onClick: this.handleClick },
      React.createElement(
        "div",
        { className: "react-toggle-track" },
        React.createElement(
          "div",
          { className: "react-toggle-track-check" },
          check
        ),
        React.createElement(
          "div",
          { className: "react-toggle-track-x" },
          x
        )
      ),
      React.createElement("div", { className: "react-toggle-thumb" }),
      React.createElement("input", _.assignIn({
        ref: "input",
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        className: "react-toggle-screenreader-only",
        type: "checkbox"
      }, _.omit(this.props, "noImage")))
    );
  }
}

export default Toggle;
