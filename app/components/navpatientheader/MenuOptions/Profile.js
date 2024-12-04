import React from 'react';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { getButtonStyleProps, getFinalSlug } from './menuOptionHelpers';

import Button from '../../elements/Button';
import profileIcon from '../../../core/icons/profileIcon.svg'
import { useAppContext } from '../../../core/hooks';
import { useSelector } from 'react-redux';
import { mapStateToProps } from '../../../pages/app/app';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Profile = withTranslation()(({ t }) => {
  const { trackMetric } = useAppContext();
  const { patient } = useSelector(mapStateToProps);
  const { pathname } = useLocation();
  const history = useHistory();
  const finalSlug = getFinalSlug(pathname);

  const handleViewProfile = () => {
    trackMetric('Clicked Navbar Name');
    history.push(`/patients/${patient.userid}/profile`);
  }
  
  return (
    <Box>
      <Button
        id="navPatientHeader_profileButton"
        onClick={handleViewProfile}
        iconSrc={profileIcon}
        iconLabel="Profile"
        {...getButtonStyleProps(finalSlug === '/profile')}
      >
        {t('Patient Profile')}
      </Button>
    </Box>
  )
});

export default Profile;