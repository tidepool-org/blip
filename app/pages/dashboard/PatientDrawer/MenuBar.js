import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import * as actions from '../../../redux/actions';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { push } from 'connected-react-router';
import { Flex, Box, Text } from 'theme-ui';
import colorPalette from '../../../themes/colorPalette';
import Button from '../../../components/elements/Button';
import moment from 'moment';
import PatientLastReviewed from '../../../components/clinic/PatientLastReviewed';

const getCopyToClipboardData = (agpCGM, _patientName, t) => {
  if (!agpCGM) return { canCopy: false, clipboardText: '' };

  const { veryLow, low, target, total } = agpCGM.data?.current?.stats?.timeInRange?.counts || {};

  const timeInTarget = Math.round((target / total) * 100);
  const timeInLows = Math.round(((veryLow + low) * 100 ) / total);

  const clipboardText = t('Lows: {{timeInLows}}, Target: {{timeInTarget}}', { timeInLows, timeInTarget });

  return {
    canCopy: true,
    clipboardText,
  };
}

const StyledMenuBar = styled(Box)`
  display: grid;
  grid-template-columns: 32fr 18fr 18fr 32fr;
  gap: 16px;
  min-height: 42px;
  margin-bottom: 16px;
`

const MenuBar = ({ patientId, api, trackMetric, onClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const patientName = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]?.patients?.[patientId]?.fullName);
  const patientDOB = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]?.patients?.[patientId]?.birthDate);
  const agpCGM = useSelector(state => state.blip.pdf?.data?.agpCGM); // IMPORTANT: Data taken from Redux PDF slice

  const { clipboardText, canCopy } = getCopyToClipboardData(agpCGM, patientName, t);

  useEffect(() => {
    // DOB field in Patient object may not be populated in TIDE Dashboard, so we need to refetch
    dispatch(actions.async.fetchPatientFromClinic(api, selectedClinicId, patientId));
  }, []);

  const handleViewData = () => {
    dispatch(push(`/patients/${patientId}/data?chart=trends&dashboard=tide`));
  };

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  const handleReviewSuccess = () => {
    setTimeout(() => {
      onClose();
    }, 500)
  }

  const handleCopyAsText = () => {
    console.log(clipboardText) // TODO: Implement  
  }

  return (
    <StyledMenuBar>
      <Flex sx={{ justifyContent: 'center', flexDirection: 'column' }}>
        <Text sx={{ color: colorPalette.primary.purpleDark, fontWeight: 'bold', fontSize: 2 }}>
          {patientName}
        </Text>
        { patientDOB &&
          <Text sx={{ color: colorPalette.extended.grays[10], fontWeight: 'medium', fontSize: 0 }}>
            {t('DOB: {{patientDOB}}', { patientDOB })}
          </Text>
        }
      </Flex>

      <Flex sx={{ justifyContent: 'flex-end', alignItems: 'flex-start' }}>
        <Button onClick={handleViewData} variant="secondary">
          {t('View Data')}
        </Button>
      </Flex>
      
      <Flex sx={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <Button disabled={!canCopy} onClick={handleCopyAsText} variant="secondary">
          {t('Copy as Text')}
        </Button>
      </Flex>

      <Flex sx={{ fontSize: 0, alignItems: 'center', justifyContent: 'flex-end' }}>
        <Text sx={{ 
          color: colorPalette.primary.purpleDark, 
          fontWeight: 'medium', 
          marginRight: 3,
        }}>
          {t('Last Reviewed')}
        </Text>
        <PatientLastReviewed 
          api={api} 
          trackMetric={trackMetric} 
          metricSource="TIDE dashboard" 
          patientId={patientId} 
          recentlyReviewedThresholdDate={recentlyReviewedThresholdDate}
          onReview={handleReviewSuccess}
        />
      </Flex>
    </StyledMenuBar>
  )
}

export default MenuBar;