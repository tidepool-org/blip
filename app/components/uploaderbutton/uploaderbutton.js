import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GitHub from 'github-api';
import _ from 'lodash';
import cx from 'classnames';
import utils from '../../core/utils';
import { translate } from 'react-i18next';
import { Flex, Box } from 'rebass/styled-components';

import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';
import Button from '../elements/Button';

import logoSrc from './images/T-logo-dark-512x512.png';

const github = new GitHub();

export default translate()(class UploaderButton extends Component {
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

  handleLinkToUploaderDownload = () => { window.location = (URL_UPLOADER_DOWNLOAD_PAGE) };
  handleMacDownload = () => { window.location = (this.state.latestMacRelease) };
  handleWinDownload = () => { window.location = (this.state.latestWinRelease) };

  UNSAFE_componentWillMount = () => {
    const uploaderRepo = github.getRepo('tidepool-org/uploader');
    uploaderRepo.listReleases((err, releases, request) => {
      if (err) {
        this.setState({ error: true });
      }
      this.setState(utils.getUploaderDownloadURL(releases));
    });
  }

  renderErrorText = () => {
    const { t } = this.props;
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
    )
  }

  render = () => {
    const { t } = this.props;
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
        <Flex justifyContent="center">
          <Box mx={2}>
            <Button
              variant="large"
              key={'pc'}
              onClick={this.handleWinDownload}
            >Download for PC</Button>
          </Box>
          <Box mx={2}>
            <Button
              variant="large"
              key={'mac'}
              onClick={this.handleMacDownload}
            >Download for Mac</Button>
          </Box>
        </Flex>
      ]
    }

    return (
      <Flex justifyContent="center">
        {content}
      </Flex>
    );
  }
});
