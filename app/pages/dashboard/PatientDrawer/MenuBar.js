import React, { useEffect } from 'react';
import * as actions from '../../../redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { push } from 'connected-react-router';
import { Flex, Box, Text } from 'theme-ui';
import colorPalette from '../../../themes/colorPalette';
import Button from '../../../components/elements/Button';
import moment from 'moment';
import PatientLastReviewed from '../../../components/clinic/PatientLastReviewed';

const MenuBar = ({ patientId, api, trackMetric }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const patientName = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]?.patients?.[patientId]?.fullName);
  const patientDOB = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]?.patients?.[patientId]?.birthDate);

  useEffect(() => {
    // DOB field in Patient object may not be populated in TIDE Dashboard, so we need to refetch
    dispatch(actions.async.fetchPatientFromClinic(api, selectedClinicId, patientId));
  }, []);

  const handleViewData = () => {
    dispatch(push(`/patients/${patientId}/data?chart=trends&dashboard=tide`));
  };

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  return (
    <Box mb={3} sx={{ display: 'grid', gridTemplateColumns: '32fr 18fr 18fr 32fr', gap: 3, minHeight: '40px' }}>
      <Flex sx={{ justifyContent: 'center', flexDirection: 'column' }}>
        <Text sx={{ color: colorPalette.primary.purpleDark, fontWeight: 'bold', fontSize: 3 }}>
          {patientName}
        </Text>
        { patientDOB &&
          <Text sx={{ color: colorPalette.extended.grays[10], fontWeight: 'medium', fontSize: 1 }}>
            {t('DOB: {{patientDOB}}', { patientDOB })}
          </Text>
        }
      </Flex>

      <Button onClick={handleViewData}>{t('View Data')}</Button>
      <Button onClick={() => {}}>{t('Copy as Text')}</Button>

      <Flex sx={{ fontSize: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
        <Text sx={{ 
          color: colorPalette.primary.purpleDark, 
          fontWeight: 'medium', 
          marginRight: '16px',
          fontSize: 1
        }}>
          {t('Last Reviewed')}
        </Text>
        <PatientLastReviewed 
          api={api} 
          trackMetric={trackMetric} 
          metricSource="TIDE dashboard" 
          patientId={patientId} 
          recentlyReviewedThresholdDate={recentlyReviewedThresholdDate} 
        />
      </Flex>
    </Box>
  )
}

export default MenuBar;