import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import utils from '../../core/utils';
import { translate } from 'react-i18next';

export default translate()(class UploaderButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestWinRelease: null,
      latestMacRelease: null,
    };
  }

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired
  };

  UNSAFE_componentWillMount = () => {
      this.setState(utils.getUploaderDownloadURL());
  }

  render = () => {
    const { t } = this.props;
    const winReleaseClasses = cx({
      btn: true,
      'btn-uploader': true,
    });
    const macReleaseClasses = cx({
      btn: true,
      'btn-uploader': true,
    });

    return (
      <div className='uploaderbutton-wrap'>
        <a
          key={'pc'}
          className={winReleaseClasses}
          href={`${this.state.latestWinRelease}`}
          onClick={this.props.onClick}>
          {t('Download for PC')}
        </a>
        <a
          key={'mac'}
          className={macReleaseClasses}
          href={`${this.state.latestMacRelease}`}
          onClick={this.props.onClick}>
          {t('Download for Mac')}
        </a>
      </div>
    );
  }
});
