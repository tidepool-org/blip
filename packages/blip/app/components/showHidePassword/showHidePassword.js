import React from 'react';
import PropTypes from 'prop-types';

import i18n from '../../core/language';

const viewImageSrc = require('./images/eye.png');
const hideImageSrc = require('./images/visibility.png');

class ShowHidePassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordVisible: false
    };
    this.showHide = this.showHide.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  showHide() {
    this.setState({
      passwordVisible: !this.state.passwordVisible
    });
  }

  handleInputChange(/** @type{React.ChangeEvent<HTMLInputElement} */ e) {
    const value = e.target.value;

    const attributes = {
      target: {
        name: this.props.name,
        value,
      }
    };

    // Change callback
    this.props.onChange(attributes);
  }

  render() {
    const { id, className, name, placeholder, value } = this.props;
    const { passwordVisible } = this.state;
    const title = passwordVisible ? i18n.t('Hide Password') : i18n.t('Show Password');
    const src = passwordVisible ? hideImageSrc : viewImageSrc;
    const boxType = passwordVisible ? 'text' : 'password';

    return (
      <div className={className}>
        <input
          type={boxType}
          id={id}
          className='input'
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={this.handleInputChange} />
          &nbsp;
        <img
          title={title}
          alt=""
          width='25'
          height='25'
          src={src}
          className='image'
          onClick={this.showHide} />
      </div>

    );
  }
}

ShowHidePassword.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ShowHidePassword;
