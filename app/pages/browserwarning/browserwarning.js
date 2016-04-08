
/**
 * Copyright (c) 2014, Tidepool Project
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

var React = require('react');

var BrowserWarning = React.createClass({
  render: function() {
    var self = this;
    return (
      <div className="browser-warning js-terms">
        <div className="browser-warning-content browser-warning-box">
          <h1 className="browser-warning-title">Blip is only certified to work on Chrome browser.</h1>
          <a href="https://www.google.com/intl/en/chrome/browser/desktop/index.html">
            <div className="browser-warning-chrome-image"></div>
          </a>
          <div className="browser-warning-text">
            <span className="dark-text">Copy and paste</span>
            <input type="text" className="blip-link-text" value="blip.tidepool.org"></input>
            <span className="dark-text">into Chrome.</span>
          </div>
          <button className="btn browser-warning-copy-button" onClick={() => self.copyText()}>Copy link</button>
          <div className="browser-warning-download-text">Or download Chrome <a href="https://www.google.com/intl/en/chrome/browser/desktop/index.html">here</a></div>
        </div>
      </div>
    );
  },

  copyText: function() {
    var copyText = document.querySelector('.blip-link-text');
    copyText.select();

    try {
      var copyCmd = document.execCommand('copy');
      copyText.setSelectionRange(0,0);
    } catch (err) {
      console.log('Unable to copy');
    }
  }
});

module.exports = BrowserWarning;
