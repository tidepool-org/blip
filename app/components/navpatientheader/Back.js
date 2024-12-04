import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'theme-ui';
import { withTranslation } from 'react-i18next';
import colorPalette from '../../themes/colorPalette';
import { getPatientListLink } from './navPatientHeaderHelpers';
import { mapStateToProps } from '../../pages/app/app';
import { useHistory } from 'react-router-dom';

import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';

import Button from '../elements/Button';
import { useAppContext } from '../../core/hooks';

const Back = ({ t }) => {
  const history = useHistory();
  const { trackMetric } = useAppContext();
  const { clinicFlowActive, selectedClinicId, query } = useSelector(mapStateToProps);
  const { patientListLink } = getPatientListLink(clinicFlowActive, selectedClinicId, query);

  const handleBack = () => {
    trackMetric('Clinic - View patient list', { clinicId: selectedClinicId, source: 'Patient data' });
    history.push(patientListLink);
  }

  return (
    <Box 
      pr={3} 
      mx={[0, '-16px', 0, '-8px']}
      sx={{ 
        borderRight: `1px solid ${colorPalette.primary.gray10}`
      }}
    >
      <Button
        id="navPatientHeader_backButton"
        onClick={handleBack}
        icon={ChevronLeftRoundedIcon}
        iconLabel="Back"
        variant='textSecondary'
        iconPosition='left'
        iconFontSize='1.25em'
        sx={{ fontSize: 1 }}
        pl={0}
      >
        {t('Back')}
      </Button>
    </Box>
  )
}

export default withTranslation()(Back);