
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

import React from 'react';
import i18n from '../../core/language';

class LogoutOverlay extends React.Component {
  state = {
    fadeOut: false
  };

  FADE_OUT_DELAY = 200;

  render() {
    var className = 'logout-overlay';
    if (this.state.fadeOut) {
      className += ' logout-overlay-fade-out';
    }

    return (

      <div className={className}>
        <div className="logout-overlay-text">{i18n.t('Logging out...')}</div>
      </div>

    );
  }

  fadeOut = (callback) => {
    callback = callback || function() {};
    this.setState({fadeOut: true});
    setTimeout(callback, this.FADE_OUT_DELAY);
  };
}

export default LogoutOverlay;
