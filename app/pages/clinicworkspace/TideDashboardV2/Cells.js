import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, withTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import { MGDL_UNITS } from '../../../core/constants';

import BgSummaryCell from '../../../components/clinic/BgSummaryCell';
import DeltaBar from '../../../components/elements/DeltaBar';
import utils from '../../../core/utils';
import isUndefined from 'lodash/isUndefined';

import { useFlags } from 'launchdarkly-react-client-sdk';

export const COMPACT = '@container (max-width: 1200px)';

export const PatientCell = ({ patient }) => {
  const { t } = useTranslation();

  const { fullName, birthDate, mrn } = patient || {};

  return <Box sx={{ gap: 0, marginRight: -2 }}>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap', fontWeight: 'medium' }}>{fullName}</Box>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Box>
    <Box sx={{ minHeight: '18px', fontSize: 0, whiteSpace: 'nowrap' }}>
      {mrn ? t('MRN: {{mrn}}', { mrn: mrn }) : ''}
    </Box>
  </Box>;
};

export const NumericTemplateCell = ({ value, isPercent = false }) => {
  if (!value) return <Text sx={{ fontWeight: 'normal' }}></Text>;

  return <Text sx={{ fontWeight: 'normal', whiteSpace: 'nowrap' }}>{value} {isPercent && '%'}</Text>;
};

export const AvgGlucoseHeader = withTranslation()(({ t }) => (
  <>
    <Box sx={{ [COMPACT]: { display: 'none' } }}>{t('Avg Glucose')}</Box>
    <Box sx={{ display: 'none', [COMPACT]: { display: 'block' } }}>{t('Avg Gluc.')}</Box>
  </>
));

export const AvgGlucoseCell = ({ patient, summaryPeriod }) => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.averageGlucoseMmol;
  const value = clinicBgUnits === MGDL_UNITS
    ? utils.translateBg(rawValue, MGDL_UNITS)
    : utils.formatDecimal(rawValue, 1); // MMOLL_UNITS

  return <NumericTemplateCell value={value} />;
};

export const TimeInRangePercentBarChartCell = ({ patient, summaryPeriod }) => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const { showExtremeHigh } = useFlags();

  return <BgSummaryCell
    id={patient?.id}
    summary={patient?.summary?.cgmStats?.periods?.[summaryPeriod]}
    config={patient?.summary?.cgmStats?.config}
    activeSummaryPeriod={summaryPeriod}
    glycemicRanges={patient?.glycemicRanges}
    clinicBgUnits={clinicBgUnits}
    showExtremeHigh={showExtremeHigh || false}
  />;
};

export const TimeInTargetPercentCell = ({ patient, summaryPeriod }) => {
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInTargetPercent;
  let value = utils.formatDecimal(rawValue * 100, 0);

  if (isUndefined(rawValue)) value = '';

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInVeryLowPercentCell = ({ patient, summaryPeriod }) => {
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInVeryLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInAnyLowPercentCell = ({ patient, summaryPeriod }) => {
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInAnyLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInVeryHighPercentCell = ({ patient, summaryPeriod }) => {
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInVeryHighPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInAnyHighPercentCell = ({ patient, summaryPeriod }) => {
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInAnyHighPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const GMICell = ({ patient, summaryPeriod }) => {
  let value = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.glucoseManagementIndicator;

  if (!['14d', '30d'].includes(summaryPeriod)) {
    value = undefined;
  }

  return <NumericTemplateCell value={value} isPercent />;
};

export const CGMUseCell = ({ patient, summaryPeriod }) => {
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeCGMUsePercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent/>;
};

export const ChangeTIRHeader = withTranslation()(({ t }) => (
  <>
    <Box sx={{ [COMPACT]: { display: 'none' } }}>{t('% Change in TIR')}</Box>
    <Box sx={{ display: 'none', [COMPACT]: { display: 'block' } }}>{t('% Δ TIR')}</Box>
  </>
));

export const ChangeTIRCell = ({ patient, summaryPeriod }) => {
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInTargetPercentDelta;

  if (!rawValue) return <Text sx={{ fontWeight: 'medium' }}>-</Text>;

  const value = utils.formatDecimal(rawValue * 100, 0);

  return <Box>
    <DeltaBar
      sx={{ fontWeight: 'medium' }}
      delta={value}
      max={30}
    />
  </Box>;
};

export const MoreMenuHeader = () => {
  const { t } = useTranslation();

  return <Box aria-label={t('More Options')}></Box>;
};

export const MoreMenuCell = () => <></>; // TEMPORARY

export const PatientLastReviewedCell = ({ patient }) => {
  return <PatientLastReviewed patient={patient} />;
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
  PatientLastReviewedCell,
};
