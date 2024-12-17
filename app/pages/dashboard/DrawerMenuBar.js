import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Flex, Box, Text } from 'theme-ui';
import Button from '../../components/elements/Button';
import moment from 'moment';
import PatientLastReviewed from '../../components/clinic/PatientLastReviewed';

const DrawerMenuBar = ({ patientId, api, trackMetric }) => {
  const { t } = useTranslation();
  const handleViewData = () => history.push(`/patients/${patientId}/data?chart=trends&dashboard=tide`);

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  return (
    <Flex sx={{ gap: '12px' }}>
      <Box>{t('Name/DOB')}</Box>

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