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
import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';

import utils from '../../core/utils';

const COPY_STATUS_NULL = 0;
const COPY_STATUS_SUCCESS = 10;
const COPY_STATUS_FAIL = 20;

const playstoreImageUrl = require('./images/google-play-badge.png');
const appstoreImageUrl = require('./images/appstore-badge.svg');

export default translate()(class BrowserWarning extends Component {
  static propTypes = {
    trackMetric: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      copyStatus: COPY_STATUS_NULL
    };
  }

  componentDidMount() {
    this.props.trackMetric('Unsupported Browser - Screen Displayed');
  }

  render() {
    const { t } = this.props;
    var self = this;
    var downloadBrowserCopy = <div> 
        <div className="browser-warning-chrome-image"></div>
        <div className="browser-warning-edge-image"></div>
      </div>;
    var copyButton = <button className="btn browser-warning-copy-button" onClick={() => self.copyText()}>{t('Copy this page\’s URL')}</button>;
    var handleClickChrome = function() {
      self.props.trackMetric('Clicked Download Chrome');
    };
    var handleClickEdge = function() {
      self.props.trackMetric('Clicked Download Chrome');
    };
    var handleClickiOS = function() {
      self.props.trackMetric('No Data - Clicked iOS', {}, () => {
        window.location.assign('https://itunes.apple.com/us/app/tidepool-mobile/id1026395200');
      });
    };
    var handleClickAndroid = function() {
      self.props.trackMetric('No Data - Clicked Android', {}, () => {
        window.location.assign('https://play.google.com/store/apps/details?id=io.tidepool.urchin');
      });
    };

    if (this.state.copyStatus === COPY_STATUS_SUCCESS) {
      self.props.trackMetric('Clicked Copy blip.tidepool.org, automatically copied');
      copyButton = <button className="btn browser-warning-copy-button" onClick={() => self.copyText()}>{t('Copied!')}</button>
    } else if (this.state.copyStatus === COPY_STATUS_FAIL) {
      self.props.trackMetric('Clicked Copy blip.tidepool.org, manually copied');
      copyButton = <button className="btn browser-warning-copy-button" onClick={() => self.copyText()}>{t('Please press Ctrl + C now')}</button>
    }

    if (!utils.isMobile()) {
      downloadBrowserCopy = (<div>
        <a href="https://www.google.com/intl/en/chrome/browser/desktop/index.html" onClick={handleClickChrome} target="_blank" rel="noreferrer noopener">
          <div className="browser-warning-chrome-image"></div>
        </a>
        <a href="https://www.microsoft.com/en-us/edge" onClick={handleClickEdge} target="_blank" rel="noreferrer noopener">
          <div className="browser-warning-edge-image"></div>
        </a>
        {copyButton}
        <Trans className="browser-warning-text" i18nKey="html.browser-warning-text">
          and paste it into <span className="dark-text">Chrome or Edge</span> to see this page on <span className="browser-warning-nowrap">your desktop computer.</span>
        </Trans>
        <div className="blip-link-text-wrap">
          <input type="text" className="blip-link-text" value="app.tidepool.org" readOnly={true}></input>
        </div>
      </div>);
    }

    return (
      <div className="browser-warning">
        <div className="browser-warning-content browser-warning-box">
          <h1 className="browser-warning-title">
            {t('Tidepool Web works with Chrome or Edge on ')}
            <span className="browser-warning-nowrap">{t('Mac or Windows.')}</span>
          </h1>
          {downloadBrowserCopy}
          <div className="browser-warning-mobile">
            <div className="browser-warning-mobile-message">
              {t('Download Tidepool Mobile for iOS or Android to add notes and see your data on the go:')}
            </div>
            <div className="browser-warning-mobile-appstore-container">
              <img alt='Download on the App Store' src={appstoreImageUrl} className="appstore-badge" onClick={handleClickiOS}/>
              <img alt='Get it on Google Play' src={playstoreImageUrl} className="playstore-badge" onClick={handleClickAndroid}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  copyText() {
    var copyText = document.querySelector('.blip-link-text');
    copyText.select();

    try {
      var copyCmd = document.execCommand('copy');
      this.setState( {
        copyStatus: (copyCmd) ? COPY_STATUS_SUCCESS : COPY_STATUS_FAIL
      });
    } catch (err) {
      console.log('Unable to copy - unsupported browser');
      this.setState({
        copyStatus: COPY_STATUS_FAIL
      });
    }
  }
});
