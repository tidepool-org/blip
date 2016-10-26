
/**
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import React, { Component } from 'react'

import logoSrc from './images/T-logo-dark-512x512.png';

export default class UploaderButton extends Component {
  static propTypes = {
    buttonUrl: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func,
    buttonText: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <a
          className="btn btn-uploader"
          href={this.props.buttonUrl}
          target="_blank"
          onClick={this.props.onClick}>
            <div className="uploader-logo">
              <img src={logoSrc} alt="Tidepool Uploader" />
            </div>
            {this.props.buttonText}
          </a>
      </div>
    );
  }
}
