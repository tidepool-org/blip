import React from 'react';
import { Box, Flex } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Button from '../../../components/elements/Button';
import viewIcon from '../../../core/icons/viewIcon.svg'
import profileIcon from '../../../core/icons/profileIcon.svg'
import shareIcon from '../../../core/icons/shareIcon.svg'
import uploadIcon from '../../../core/icons/uploadIcon.svg'

import { getFinalSlug } from '../../../core/navutils';
import { getButtonStyleProps, isDataView } from './menuOptionHelpers';

const PatientMenuOptions = ({
  t,
  onViewProfile,
  onViewData,
  onShare = null,
  onUpload = null,
}) => {
  const { pathname } = useLocation();
  const finalSlug = getFinalSlug(pathname);

  return (
    <Flex sx={{ ml: 'auto', columnGap: 32 }}>
      <Box>
        <Button
          id="navPatientHeader_viewDataButton"
          onClick={onViewData}
          iconSrc={viewIcon}
          iconLabel="View"
          {...getButtonStyleProps(isDataView(finalSlug))}
        >
          {t('View Data')}
        </Button>
      </Box>
      <Box>
        <Button
          id="navPatientHeader_profileButton"
          onClick={onViewProfile}
          iconSrc={profileIcon}
          iconLabel="Profile"
          {...getButtonStyleProps(finalSlug === '/profile')}
        >
          {t('Profile')}
        </Button>
      </Box>

      {onShare &&
        <Box>
          <Button
            id="navPatientHeader_shareButton"
            onClick={onShare}
            iconSrc={shareIcon}
            iconLabel="Share"
            {...getButtonStyleProps(finalSlug === '/share')}
          >
            {t('Share')}
          </Button>
        </Box>}

      {onUpload &&
        <Box>
          <Button
            id="navPatientHeader_uploadButton"
            onClick={onUpload}
            iconSrc={uploadIcon}
            iconLabel="Upload"
            {...getButtonStyleProps(false)}
          >
            {t('Upload Data')}
          </Button>
        </Box>}
    </Flex>
  );
};

export default withTranslation()(PatientMenuOptions);
