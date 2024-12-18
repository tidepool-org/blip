import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { push } from 'connected-react-router';
import { Flex, Box, Text } from 'theme-ui';
import colorPalette from '../../themes/colorPalette';
import Button from '../../components/elements/Button';
import moment from 'moment';
import PatientLastReviewed from '../../components/clinic/PatientLastReviewed';

const DrawerMenuBar = ({ patientId, api, trackMetric }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  const handleViewData = () => {
    dispatch(push(`/patients/${patientId}/data?chart=trends&dashboard=tide`));
  };

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  return (
    <Box mb={3} sx={{ display: 'grid', gridTemplateColumns: '32fr 18fr 18fr 32fr', gap: '12px' }}>
      <Flex sx={{ alignItems: 'center' }}>
        <Text sx={{ 
          color: colorPalette.primary.purpleDark,
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {patient?.fullName}
        </Text>
      </Flex>

      <Button onClick={handleViewData}>{t('View Data')}</Button>
      <Button onClick={() => {}}>{t('Copy as Text')}</Button>

      <PatientLastReviewed 
        api={api} 
        trackMetric={trackMetric} 
        metricSource="TIDE dashboard" 
        patientId={patientId} 
        recentlyReviewedThresholdDate={recentlyReviewedThresholdDate} 
      />
    </Box>
  )
}

export default DrawerMenuBar;