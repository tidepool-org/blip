import React from 'react';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { getButtonStyleProps, getFinalSlug } from './menuOptionHelpers';

import Button from '../../elements/Button';
import viewIcon from '../../../core/icons/viewIcon.svg'
import { useAppContext } from '../../../core/hooks';
import { useSelector } from 'react-redux';
import { mapStateToProps } from '../../../pages/app/app';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Data = withTranslation()(({ t }) => {
  const { trackMetric } = useAppContext();
  const { patient } = useSelector(mapStateToProps);
  const { pathname } = useLocation();
  const history = useHistory();
  const finalSlug = getFinalSlug(pathname);

  const handleViewData = () => {
    trackMetric('Clicked Navbar View Data');
    history.push(`/patients/${patient.userid}/data`);
  }
  
  return (
    <Box>
      <Button
        id="navPatientHeader_viewDataButton"
        onClick={handleViewData}
        iconSrc={viewIcon}
        iconLabel="View"
        {...getButtonStyleProps(finalSlug === '/data')}
      >
        {t('View Data')}
      </Button>
    </Box>
  )
});

export default Data;