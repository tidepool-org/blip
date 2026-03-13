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
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.averageGlucoseMmol;
  const value = utils.formatDecimal(rawValue, 1);

  return <NumericTemplateCell value={value} />;
};

export const TimeInRangePercentBarChartCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  // TODO: need to add showExtremeHigh

  return <BgSummaryCell
    id={patient?.id}
    summary={patient?.summary?.cgmStats?.periods?.[summaryPeriod]}
    config={patient?.summary?.cgmStats?.config}
    activeSummaryPeriod={summaryPeriod}
    glycemicRanges={patient?.glycemicRanges}
    clinicBgUnits={clinicBgUnits}
  />;
};

export const TimeInTargetPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInTargetPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInAnyLowPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInAnyLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInVeryLowPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInVeryLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const GMICell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const value = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.glucoseManagementIndicator;

  return <NumericTemplateCell value={value} isPercent />;
};

export const CGMUseCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeCGMUsePercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent/>;
};

export const ChangeTIRCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const timeInTargetPercentDelta = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInTargetPercentDelta;

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
  TimeInRangePercentBarChartCell,
  TimeInVeryLowPercentCell,
  ChangeTIRCell,
  GMICell,
  CGMUseCell,
};
