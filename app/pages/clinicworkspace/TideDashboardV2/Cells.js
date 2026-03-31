import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import { utils as vizUtils, colors as vizColors  } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;
import { MGDL_UNITS } from '../../../core/constants';
import { colors } from '../../../themes/baseTheme';

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

export const TimeInVeryLowPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInVeryLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInAnyLowPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInAnyLowPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInVeryHighPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInVeryHighPercent;
  const value = utils.formatDecimal(rawValue * 100, 0);

  return <NumericTemplateCell value={value} isPercent />;
};

export const TimeInAnyHighPercentCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const rawValue = patient?.summary?.cgmStats?.periods?.[summaryPeriod]?.timeInAnyHighPercent;
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

export const FlagCell = ({ patient }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const period = patient?.summary?.cgmStats?.periods?.[summaryPeriod];

  if (!period) return null;

  let value;
  let rangeName;
  let title;

  // TODO: Fix text to be bgUnit-sensitive
  switch(true) {
    case period.timeInVeryLowPercent > 0.01:
      value = 'timeInVeryLowPercent';
      rangeName = 'veryLow';
      title = 'Very Low';
      break;
    case period.timeInAnyLowPercent > 0.04:
      value = 'timeInAnyLowPercent';
      rangeName = 'anyLow';
      title = 'Low';
      break;
    case period.timeInVeryHighPercent > 0.05:
      value = 'timeInVeryHighPercent';
      rangeName = 'veryHigh';
      title = 'Very High';
      break;
    case period.timeInAnyHighPercent > 0.25:
      value = 'timeInAnyHighPercent';
      rangeName = 'anyHigh';
      title = 'High';
      break;
    case period.timeInTargetPercentDelta < -0.15:
      value = 'timeInTargetPercentDelta';
      rangeName = 'anyLow';
      title = 'Large Drop in TIR';
      break;
    case period.timeInTargetPercent < 0.70:
      value = 'timeInTargetPercent';
      rangeName = 'anyLow';
      title = 'Low TIR';
      break;
    case period.timeCGMUsePercent < 0.70:
      value = 'timeCGMUsePercent';
      rangeName = 'anyLow';
      title = 'Low CGM Wear Time';
      break;

    // TODO: Need case for Meeting Targets
  }

  if (!value) return null;

  return (
    <Flex className='tide-dashboard-flag-container' sx={{ minWidth: '120px' }}>
      <Flex
        className='tide-dashboard-flag'
        px={2} py={1} sx={{
        backgroundColor: `${colors.bg[rangeName]}1A`, // adding '1A' reduces opacity to 0.1
        borderRadius: 4,
        alignItems: 'center',
      }}>
          <Box
            sx={{
              borderRadius: 4,
              backgroundColor: colors.bg[rangeName],
              width: '12px',
              height: '12px',
            }}
            mr={2}
          >
          </Box>
          <Text sx={{ fontSize: 0, color: vizColors.black, fontWeight: 'medium' }}>
            {title}
          </Text>
      </Flex>
    </Flex>
  );
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
  FlagCell,
};
