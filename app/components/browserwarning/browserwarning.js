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

import utils from '../../core/utils';

const COPY_STATUS_NULL = 0;
const COPY_STATUS_SUCCESS = 10;
const COPY_STATUS_FAIL = 20;

export default class BrowserWarning extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copyStatus: COPY_STATUS_NULL
    };
  }
  render() {
    var self = this;
    var downloadCopy = <div className="browser-warning-chrome-image"></div>;
    var copyButton = <button className="btn browser-warning-copy-button" onClick={() => self.copyText()}>Copy link</button>;

    if (this.state.copyStatus === COPY_STATUS_SUCCESS) {
      copyButton = <button className="btn browser-warning-copy-button" onClick={() => self.copyText()}>Copied!</button>
    } else if (this.state.copyStatus === COPY_STATUS_FAIL) {
      copyButton = <button className="btn browser-warning-copy-button" onClick={() => self.copyText()}>Please press Ctrl + C now</button>
    }

    if (!utils.isMobile()) {
      downloadCopy = (<div>
        <a href="https://www.google.com/intl/en/chrome/browser/desktop/index.html" target="_blank">
          <div className="browser-warning-chrome-image"></div>
        </a>
        <div className="browser-warning-text">
          <span className="dark-text">Copy and paste</span>
          <input type="text" className="blip-link-text" value="blip.tidepool.org"></input>
          <span className="dark-text">into Chrome.</span>
        </div>
        {copyButton}
        <div className="browser-warning-download-text">Or download Chrome <a href="https://www.google.com/intl/en/chrome/browser/desktop/index.html" target="_blank">here</a>.</div>
      </div>);
    }

    return (
      <div className="browser-warning js-terms">
        <div className="browser-warning-content browser-warning-box">
          <h1 className="browser-warning-title">Blip's visualizations are only certified to work in the Chrome browser, and on Mac or PC.</h1>
          {downloadCopy}
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
}
