import React from 'react';

import { translate } from 'react-i18next';

const viewImageSrc = require('./images/eye.png');
const hideImageSrc = require('./images/visibility.png');

class ShowHidePassword extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      passwordVisible: false
    }
    this.showHide = this.showHide.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }
 
  showHide(e){
    this.setState({
      passwordVisible: !this.state.passwordVisible
    });
  }

  handleInputChange(e){
    const target = (e !== null) ? e.target || e : {};

    const attributes = {
      name: target.name || this.props.name,
      value: target.value || null,
    };

    // Change callback
    const changeCallback = this.props.onChange;
    if (changeCallback) {
      this.props.onChange(attributes);
    }
  }
  
  render(){
    const { passwordVisible } = this.state;
    const { t } = this.props;
    const title = passwordVisible ? t('Hide Password') : t('Show Password')
    const src = passwordVisible ? hideImageSrc : viewImageSrc
    const boxType = passwordVisible ? 'input' : 'password'
    return(
      <div className={this.props.className}>
        <input type={boxType}
          id={this.props.id}
          className='input'
          name={this.props.name}
          placeholder={this.props.placeholder}
          onChange={this.handleInputChange}/>
          &nbsp;
        <img
          title={title}
          width='25'
          height='25'
          src={src}
          className='image'
          onClick={this.showHide}/>
      </div>

    );
  }
};

export default translate()(ShowHidePassword);
