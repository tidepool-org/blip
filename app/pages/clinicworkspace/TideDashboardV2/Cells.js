import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;
import { MGDL_UNITS } from '../../../core/constants';

import BgSummaryCell from '../../../components/clinic/BgSummaryCell';
import DeltaBar from '../../../components/elements/DeltaBar';
import utils from '../../../core/utils';
import { selectPeriod } from './tideDashboardFiltersSlice';

export const PatientCell = ({ patient }) => {
  const { t } = useTranslation();

  const { fullName, birthDate, mrn } = patient || {};

  return <Box>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{fullName}</Text>
    <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Text>
    {mrn && <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>, {t('MRN: {{mrn}}', { mrn: mrn })}</Text>}
  </Box>;
};

export const NumericTemplateCell = ({ value, isPercent = false }) => {
  if (!value) return <Text sx={{ fontWeight: 'normal' }}></Text>;

  return <Text sx={{ fontWeight: 'normal' }}>{value} {isPercent && '%'}</Text>;
};

export const AvgGlucoseCell = ({ patient, units }) => { // TODO: Fix for units
  const period = useSelector(state => selectPeriod(state));
  const rawValue = patient?.summary?.cgmStats?.periods?.[period]?.averageGlucoseMmol;
  const value = utils.formatDecimal(rawValue, 1);

  return <NumericTemplateCell value={value} />;
};

export const PercentTIRCell = ({ patient }) => {
  const period = useSelector(state => selectPeriod(state));
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  // TODO: need to add showExtremeHigh

  return <BgSummaryCell
    id={patient?.id}
    summary={patient?.summary?.cgmStats?.periods?.[period]}
    config={patient?.summary?.cgmStats?.config}
    activeSummaryPeriod={period}
    glycemicRanges={patient?.glycemicRanges}
    clinicBgUnits={clinicBgUnits}
  />;
};

export const GMICell = ({ patient }) => {
  const period = useSelector(state => selectPeriod(state));
  const value = patient?.summary?.cgmStats?.periods?.[period]?.glucoseManagementIndicator;

  return <NumericTemplateCell value={value} isPercent />;
};

export const CGMUseCell = ({ patient }) => {
  const period = useSelector(state => selectPeriod(state));
  const rawValue = patient?.summary?.cgmStats?.periods?.[period]?.timeCGMUsePercent;
  const value = utils.formatDecimal(rawValue * 100, 1);

  return <NumericTemplateCell value={value} isPercent/>;
};

export const ChangeTIRCell = ({ patient }) => {
  const period = useSelector(state => selectPeriod(state));
  const timeInTargetPercentDelta = patient?.summary?.cgmStats?.periods?.[period]?.timeInTargetPercentDelta;

  if (!timeInTargetPercentDelta) return <Text sx={{ fontWeight: 'medium' }}>--</Text>;

  return <DeltaBar
    sx={{ fontWeight: 'medium' }}
    delta={timeInTargetPercentDelta * 100}
    max={30}
  />;
};

export default {
  PatientCell,
  NumericTemplateCell,
  AvgGlucoseCell,
  PercentTIRCell,
  ChangeTIRCell,
  GMICell,
  CGMUseCell,
};
