/**
 * Copyright (c) 2017, Tidepool Project
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

import _ from 'lodash';
import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import cx from 'classnames';
import GitHub from 'github-api';
import ModalOverlay from '../modaloverlay';
import utils from '../../core/utils';
import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';
import logoSrc from '../uploaderbutton/images/T-logo-dark-512x512.png';

const github = new GitHub();

const UploadLaunchOverlay = translate()(class UploadLaunchOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestWinRelease: null,
      latestMacRelease: null,
      error: null,
    };
  }

  static propTypes = {
    modalDismissHandler: React.PropTypes.func.isRequired,
  };

  componentWillMount = () => {
    const uploaderRepo = github.getRepo('tidepool-org/chrome-uploader');
    uploaderRepo.listReleases((err, releases, request) => {
      if(err){
        this.setState({error: true});
      }
      this.setState(utils.getLatestGithubRelease(releases));
    });
  }

  renderErrorText = () => {
    return (
      <Trans i18nKey="html.uploadlaunchoverlay-error">Error fetching release information, please go to our
        <a href={URL_UPLOADER_DOWNLOAD_PAGE}> downloads page</a>.
      </Trans>
    )
  }

  render = () => {
    const { t } = this.props;
    const winReleaseClasses = cx({
      btn: true,
      'btn-primary': true,
      disabled: !this.state.latestWinRelease,
    });
    const macReleaseClasses = cx({
      btn: true,
      'btn-primary': true,
      disabled: !this.state.latestMacRelease,
    });
    let content;

    if(this.state.error) {
      content = this.renderErrorText();
    } else {
      content = [
        <div className='ModalOverlay-content' key={'div1'}>
          <div className='UploadLaunchOverlay-content'>
            <div className='UploadLaunchOverlay-icon'>
              <img src={logoSrc} />
            </div>
            <div>
              <a className=' ModalOverlay-dismiss' onClick={this.props.modalDismissHandler}>&times;</a>
              <Trans i18nKey="html.uploadlaunchoverlay-launching">
                <div className='UploadLaunchOverlay-title'>Launching Uploader</div>
                <div className='UploadLaunchOverlay-text'>If you don't yet have the Tidepool Uploader, please install the appropriate version below</div>
              </Trans>
            </div>
          </div>
        </div>,
        <div className='ModalOverlay-controls' key={'div2'}>
          <a className={winReleaseClasses} href={`${this.state.latestWinRelease}`} disabled={!this.state.latestWinRelease}>{t('Download for PC')}</a>
          <a className={macReleaseClasses} href={`${this.state.latestMacRelease}`} disabled={!this.state.latestMacRelease}>{t('Download for Mac')}</a>
        </div>,
      ]
    }

    const dialog = (
      <div className='UploadLaunchOverlay'>
        {content}
      </div>
    );

    return (
      <ModalOverlay
        show={true}
        dialog={dialog}
        overlayClickHandler={this.props.modalDismissHandler}
      />
    );
  };

});

module.exports = UploadLaunchOverlay;
