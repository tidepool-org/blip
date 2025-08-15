import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Flex } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { getFinalSlug } from '../../../core/navutils';
import { getButtonStyleProps, isDataView } from './menuOptionHelpers';
import { selectPermsOfLoggedInUser } from '../../../core/selectors';

import Button from '../../elements/Button';
import viewIcon from '../../../core/icons/viewIcon.svg';
import profileIcon from '../../../core/icons/profileIcon.svg';
import uploadIcon from '../../../core/icons/uploadIcon.svg';

const ClinicianMenuOptions = ({
  t,
  onOpenPatientForm,
  onViewProfile,
  onViewData,
  onUpload = null,
}) => {
  const { pathname } = useLocation();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const permsOfLoggedInUser = useSelector(state => selectPermsOfLoggedInUser(state));
  const finalSlug = getFinalSlug(pathname);

  let editOptionState;
  if (!!selectedClinicId) {
    editOptionState = 'PATIENT_FORM'; // If viewing from a clinic, open the PatientForm modal
  } else if (permsOfLoggedInUser?.custodian) {
    editOptionState = 'PROFILE_PAGE'; // If viewing private workspace and user is custodian, open the profile page
  } else {
    editOptionState = 'HIDDEN'; // If viewing claimed account, hide button
  }

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

      {editOptionState === 'PATIENT_FORM' &&
        <Box>
          <Button
            id="navPatientHeader_profileButton"
            onClick={onOpenPatientForm}
            iconSrc={profileIcon}
            iconLabel="Profile"
            {...getButtonStyleProps(finalSlug === '/profile')}
          >
            {t('Edit Patient Details')}
          </Button>
        </Box>
      }

      {editOptionState === 'PROFILE_PAGE' &&
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
      }

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
