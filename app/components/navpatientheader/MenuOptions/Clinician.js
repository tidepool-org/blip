import React from 'react';
import { Box, Flex } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { getFinalSlug } from '../../../core/navutils';
import { getButtonStyleProps } from './menuOptionHelpers';

import Button from '../../elements/Button';
import viewIcon from '../../../core/icons/viewIcon.svg'
import profileIcon from '../../../core/icons/profileIcon.svg'
import uploadIcon from '../../../core/icons/uploadIcon.svg'

const ClinicianMenuOptions = ({
  t,
  onViewProfile,
  onViewData,
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
          {...getButtonStyleProps(finalSlug === '/data')}
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
          {t('Patient Profile')}
        </Button>
      </Box>

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

export default withTranslation()(ClinicianMenuOptions);