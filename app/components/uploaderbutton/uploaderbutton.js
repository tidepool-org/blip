import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GitHub from 'github-api';
import _ from 'lodash';
import utils from '../../core/utils';
import { translate } from 'react-i18next';
import { Flex, Box } from 'rebass/styled-components';

import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';
import Button from '../elements/Button';

const github = new GitHub();

export default translate()(class UploaderButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestWinRelease: null,
      latestMacRelease: null,
      error: null,
      urlUploaderDownloadPage: URL_UPLOADER_DOWNLOAD_PAGE,
    };
  }

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired
  };

  handleLinkToUploaderDownload = () => { window.location = (URL_UPLOADER_DOWNLOAD_PAGE) };

  handleMacDownload = () => {
    window.location = (this.state.latestMacRelease);
  };
  handleWinDownload = () => { window.location = (this.state.latestWinRelease) };

  handleDownload = (release) => {
    window.location = (release);
  };

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
    return (
      <Flex justifyContent="center">
        <Box mx={2}>
          <Button
            className="download-error"
            variant="large"
            key={'error'}
            onClick={this.handleLinkToUploaderDownload}
            // onClick={this.handleDownload(this.urlUploaderDownloadPage)}
          >{this.props.buttonText}
          </Button>
        </Box>
      </Flex>
    )
  }

  render = () => {
    let content;
    if (this.state.error) {
      content = this.renderErrorText();
    } else {
      content = [
        <Flex justifyContent="center">
          <Box mx={2}>
            <Button
              className="download-win"
              variant="large"
              key={'pc'}
              onClick={this.handleWinDownload}
              // onClick={this.handleDownload(this.latestWinRelease)}
              disabled={!this.state.latestWinRelease}
            >Download for PC</Button>
          </Box>
          <Box mx={2}>
            <Button
              className="download-mac"
              variant="large"
              key={'mac'}
              onClick={this.handleMacDownload}
              // onClick={this.handleDownload(this.latestMacRelease)}
              disabled={!this.state.latestMacRelease}
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
