
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

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import i18n from '../../core/language';
import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';

import logoSrc from './images/T-logo-dark-512x512.png';

const t = i18n.t.bind(i18n);

class UploaderButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latestWinRelease: null,
      latestMacRelease: null,
      error: null,
    };
  }

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired
  };

  componentDidMount() {
    if (this.state.latestMacRelease === null) {
      this.setState({
        latestWinRelease: 'https://github.com/tidepool-org/uploader/releases/download/v2.34.0/Tidepool-Uploader-Setup-2.34.0.exe',
        latestMacRelease: 'https://github.com/tidepool-org/uploader/releases/download/v2.34.0/Tidepool-Uploader-2.34.0.dmg',
      });
    }
  }

  renderErrorText() {
    return (
      <a
        className="btn btn-uploader"
        href={URL_UPLOADER_DOWNLOAD_PAGE}
        target="_blank"
        onClick={this.props.onClick}>
        <div className="uploader-logo">
          <img src={logoSrc} alt={t('Tidepool Uploader')} />
        </div>
        {this.props.buttonText}
      </a>
    );
  }

  render() {
    const winReleaseClasses = cx({
      btn: true,
      'btn-uploader': true,
      disabled: !this.state.latestWinRelease,
    });
    const macReleaseClasses = cx({
      btn: true,
      'btn-uploader': true,
      disabled: !this.state.latestMacRelease,
    });

    let content;
    if (this.state.error) {
      content = this.renderErrorText();
    } else {
      content = [
        <a
          key={'pc'}
          className={winReleaseClasses}
          href={`${this.state.latestWinRelease}`}
          disabled={!this.state.latestWinRelease}
          onClick={this.props.onClick}>
          {t('Download for PC')}
        </a>,
        <a
          key={'mac'}
          className={macReleaseClasses}
          href={`${this.state.latestMacRelease}`}
          disabled={!this.state.latestMacRelease}
          onClick={this.props.onClick}>
          {t('Download for Mac')}
        </a>
      ];
    }

    return (
      <div className='uploaderbutton-wrap'>
        {content}
      </div>
    );
  }
}

export default UploaderButton;
