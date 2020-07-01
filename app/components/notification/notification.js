import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import { translate } from 'react-i18next';

var TidepoolNotification = translate()(class extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    contents: PropTypes.object.isRequired,
    link: PropTypes.object,
    onClose: PropTypes.func.isRequired
  };

  render() {
    const { t } = this.props;
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
    const { t } = this.props;

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
});

module.exports = TidepoolNotification;
