import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Octokit } from '@octokit/rest';
import _ from 'lodash';
import utils from '../../core/utils';
import { withTranslation } from 'react-i18next';
import { Flex, Box } from 'theme-ui';

import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';
import AppleIcon from '../../core/icons/Apple.svg';
import WindowsIcon from '../../core/icons/Windows.svg';
import Button from '../elements/Button';

const octokit = new Octokit();

export default withTranslation()(class UploaderButton extends Component {
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

  UNSAFE_componentWillMount = () => {
    octokit.repos.listReleases({
      owner: 'tidepool-org',
      repo: 'uploader'
    }).then(({ data }) => {
      this.setState(utils.getUploaderDownloadURL(data));
    }).catch((error) => {
      this.setState({ error: true });
    });
  }

  renderErrorText = () => {
    return (
      <Flex sx={{ justifyContent: 'center' }}>
        <Box mx={2}>
          <a className='link-uploader-download'
            href={URL_UPLOADER_DOWNLOAD_PAGE}
            onClick={this.props.onClick}
            style={{ textDecoration: 'none' }}>
            <Button
              className="btn-uploader-download"
              variant="large"
              key={'error'}
            >{this.props.buttonText}
            </Button>
          </a>
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
        <Flex sx={{ justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Box>
            <a className='link-download-mac'
              href={this.state.latestMacRelease}
              onClick={this.props.onClick}
              style={{ textDecoration: 'none' }}
            >
              <Button
                className="btn-download-mac"
                variant="primary"
                py={1}
                px="12px"
                key={'mac'}
                disabled={!this.state.latestMacRelease}
                iconSrc={AppleIcon}
                iconPosition="left"
                sx={{ lineHeight: '22px', fontWeight: 'medium', '.icon': { minWidth: 'auto' } }}
              >
                Download for Mac
              </Button>
            </a>
          </Box>

          <Box>
            <a className='link-download-win'
              href={this.state.latestWinRelease}
              onClick={this.props.onClick}
              style={{ textDecoration: 'none' }}
            >
              <Button
                className="btn-download-win"
                variant="primary"
                py={1}
                px="12px"
                key={'pc'}
                disabled={!this.state.latestWinRelease}
                iconSrc={WindowsIcon}
                iconPosition="left"
                sx={{ lineHeight: '22px', fontWeight: 'medium', '.icon': { minWidth: 'auto' } }}
              >
                Download for PC
              </Button>
            </a>
          </Box>
        </Flex>
      ]
    }

    return (
      <Flex sx={{ justifyContent: 'center' }}>
        {content}
      </Flex>
    );
  }
});
