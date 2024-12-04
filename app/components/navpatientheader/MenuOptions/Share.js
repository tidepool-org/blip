import React from 'react';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { getButtonStyleProps, getFinalSlug } from './menuOptionHelpers';

import Button from '../../elements/Button';
import shareIcon from '../../../core/icons/shareIcon.svg'
import { useAppContext } from '../../../core/hooks';
import { useSelector } from 'react-redux';
import { mapStateToProps } from '../../../pages/app/app';
import { getPermissions } from '../navPatientHeaderHelpers';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Share = withTranslation()(({ t }) => {
  const { trackMetric } = useAppContext();
  const { patient, permsOfLoggedInUser } = useSelector(mapStateToProps);
  const { pathname } = useLocation();
  const history = useHistory();
  const finalSlug = getFinalSlug(pathname);

  const { canShare } = getPermissions(patient, permsOfLoggedInUser);

  if (!canShare) return null;

  const handleShare = () => {
    trackMetric('Clicked Navbar Share Data');
    history.push(`/patients/${patient.userid}/share`);
  }
  
  return (
    <Box>
      <Button
        id="navPatientHeader_shareButton"
        onClick={handleShare}
        iconSrc={shareIcon}
        iconLabel="Share"
        {...getButtonStyleProps(finalSlug === '/share')}
      >
        {t('Share')}
      </Button>
    </Box>
  )
});

export default Share;