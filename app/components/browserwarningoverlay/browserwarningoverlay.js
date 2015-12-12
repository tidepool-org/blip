
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

var BrowserWarningOverlay = React.createClass({

  render: function() {
    return (
      <div className="browser-warning-overlay js-terms">
        <div className="browser-warning-overlay-content browser-warning-overlay-box">
          <div className="browser-warning-overlay-title">WARNING</div>
          <div className="browser-warning-overlay-text">
          <p>Currently Blip is only certified to work with the Chrome browser.</p>
          <p>If you don't have Chrome installed, you can download and install it from <a href="https://www.google.com/chrome/browser/desktop/">here</a>.</p>
          <p>Instructions for changing your default system browser are <a href="https://support.google.com/chrome/answer/95417?hl=en-GB">here</a>.</p>
          <p>Once you have installed Chrome, please use it to visit <a href="https://blip.tidepool.org">Blip</a>.</p>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = BrowserWarningOverlay;
