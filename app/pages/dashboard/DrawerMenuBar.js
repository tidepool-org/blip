import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Flex, Box, Text } from 'theme-ui';
import Button from '../../components/elements/Button';
import moment from 'moment';
import PatientLastReviewed from '../../components/clinic/PatientLastReviewed';

const DrawerMenuBar = ({ patientId, api, trackMetric }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  const handleViewData = () => history.push(`/patients/${patientId}/data?chart=trends&dashboard=tide`);

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  // TODO: DOB

  return (
    <Flex sx={{ gap: '12px' }}>
      <Box>
        <Box>{patient.fullName}</Box>
        <Box></Box>
      </Box>

      <Button onClick={handleViewData}>{t('View Data')}</Button>
      <Button onClick={() => {}}>{t('Copy as Text')}</Button>

      <PatientLastReviewed 
        api={api} 
        trackMetric={trackMetric} 
        metricSource="TIDE dashboard" 
        patientId={patientId} 
        recentlyReviewedThresholdDate={recentlyReviewedThresholdDate} 
      />
    </Flex>
  )
}

export default DrawerMenuBar;