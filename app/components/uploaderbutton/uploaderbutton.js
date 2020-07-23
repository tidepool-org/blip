import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import GitHub from 'github-api';
import _ from 'lodash';
import utils from '../../core/utils';
import { translate } from 'react-i18next';
import { Flex, Box, ButtonProps } from 'rebass/styled-components';

import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../core/constants';
import Button from '../elements/Button';

const github = new GitHub();


const UploaderButton = (props) => {
  const {
    onClick,
    buttonText,
  } = props;

  const [latestWinRelease, setLatestWinRelease] = useState(null);
  const [latestMacRelease, setLatestMacRelease] = useState(null);
  const [error, setError] = useState(null);
  const [releases, setReleases] = useState();

  useEffect(() => {
    const uploaderRepo = github.getRepo('tidepool-org/uploader');
    uploaderRepo.listReleases((err, releases, request) => {
      if (err) {
        setError(true);
      }
      setReleases(utils.getUploaderDownloadURL(releases));
    });
  }, []);

  useEffect(() => {
    setLatestMacRelease(_.get(releases, 'latestMacRelease'));
    setLatestWinRelease(_.get(releases, 'latestWinRelease'));
  }, [releases]);

  const renderErrorText = () => {
    return (
      <Flex justifyContent="center">
        <Box mx={2}>
          <a className='link-uploader-download'
            href={URL_UPLOADER_DOWNLOAD_PAGE}
            onClick={onClick}
            style={{ textDecoration: 'none' }}>
            <Button
              // href={URL_UPLOADER_DOWNLOAD_PAGE}
              // onClick={onClick}
              className="btn-uploader-download"
              variant="large"
              key={'error'}
            >{buttonText}
            </Button>
          </a>
        </Box>
      </Flex>
    )
  }

  let content;
  if (error) {
    content = renderErrorText();
  } else {
    content = [
      <Flex justifyContent="center">
        <Box mx={2}>
          <a className='link-download-win'
            href={latestWinRelease}
            onClick={onClick}
            style={{ textDecoration: 'none' }}
          >
            <Button
              // href={latestWinRelease}
              // onClick={onClick}
              className="btn-download-win"
              variant="large"
              key={'pc'}
              disabled={!latestWinRelease}
            >Download for PC</Button>
          </a>
        </Box>
        <Box mx={2}>
          <a className='link-download-mac'
            href={latestMacRelease}
            onClick={onClick}
            style={{ textDecoration: 'none' }}
          >
            <Button
              // href={latestMacRelease}
              // onClick={onClick}
              className="btn-download-mac"
              variant="large"
              key={'mac'}
              disabled={!latestMacRelease}
            >Download for Mac</Button>
          </a>
        </Box>
      </Flex>
    ]
  }

  return (
    <Flex justifyContent="center">
      {content}
    </Flex>
  );

};

UploaderButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
};

export default translate()(UploaderButton);
