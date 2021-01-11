
import _ from 'lodash';

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
import PropTypes from 'prop-types';

import React from 'react';
import { Link } from 'react-router';

import i18n from '../../core/language';

const t = i18n.t.bind(i18n);

class TidepoolNotification extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    contents: PropTypes.object.isRequired,
    link: PropTypes.object,
    onClose: PropTypes.func.isRequired
  };

  render() {
    var type = this.props.type || 'alert';
    var className = 'notification notification-' + type;
    var contents = this.props.contents;

    var closeLink = this.renderCloseLink();
    if (closeLink) {
      className = className + ' notification-closable';
    }

    var actionLink = this.renderActionLink();

    return (
      <div className={className}>
        <div className="notification-inner">
          {closeLink}
          <div className="notification-body">
            <p>{contents.message}</p>
            <p>{contents.utc}</p>
            {actionLink}
          </div>
        </div>
      </div>
    );
  }

  renderActionLink = () => {
    var link = _.get(this.props, 'link', null);
    if (!link) {
      return null;
    }

    return (
      <Link to={link.to} onClick={this.props.onClose.bind(null, null)}>
        {link.text}
      </Link>
    );
  };

  renderCloseLink = () => {
    if (!this.props.onClose) {
      return null;
    }

    return (
      <a
        className="notification-close"
        href=""
        onClick={this.handleClose}
        ref='close'>{t('Close')}</a>
    );
  };

  handleClose = (e) => {
    if (e) {
      e.preventDefault();
    }

    var close = this.props.onClose;
    if (close) {
      close();
    }
  };
}

module.exports = TidepoolNotification;
