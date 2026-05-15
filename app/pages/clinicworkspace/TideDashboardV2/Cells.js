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
import { CATEGORY } from './FilterByCategory';
import isUndefined from 'lodash/isUndefined';

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
  let value = utils.formatDecimal(rawValue * 100, 0);

  if (isUndefined(rawValue)) value = '';

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

export const FlagCell = ({ patient, category = null, }) => {
  const { t } = useTranslation();
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const period = patient?.summary?.cgmStats?.periods?.[summaryPeriod];

  const { VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

  if (!period) return null;

  const rangeName = (() => {
    switch(true) {
      // Current dashboard category takes priority
      case category === VERY_LOW: return 'veryLow';
      case category === ANY_LOW: return 'anyLow';
      case category === VERY_HIGH: return 'veryHigh';
      case category === ANY_HIGH: return 'anyHigh';
      case category === DROP_IN_TIR: return 'dropInTIR';
      case category === LOW_CGM_WEAR: return 'lowSensorUsage';
      case category === TARGET: return 'target';

      // If no category, then read from summary
      case period.timeInVeryLowPercent > 0.01: return 'veryLow';
      case period.timeInAnyLowPercent > 0.04: return 'anyLow';
      case period.timeInVeryHighPercent > 0.05: return 'veryHigh';
      case period.timeInAnyHighPercent > 0.25: return 'anyHigh';
      case period.timeInTargetPercentDelta < -0.15: return 'dropInTIR';
      case period.timeCGMUsePercent < 0.70: return 'lowSensorUsage';

      default: return null;
    }
  })();

  if (!rangeName) return null;

  const flagLabels = {
    veryLow: t('Very Low'),
    anyLow: t('Low'),
    veryHigh: t('Very High'),
    anyHigh: t('High'),
    dropInTIR: t('Large Drop in TIR'),
    lowSensorUsage: t('Low CGM Wear Time'),
    target: t('Meeting Targets'),
  };

  const flagColor = colors.bg[rangeName] || vizColors.gold30;

  return (
    <Flex className='tide-dashboard-flag-cell' sx={{ minWidth: '120px' }}>
      <Flex
        className='tide-dashboard-flag'
        px={2} py={1} sx={{
        backgroundColor: `${flagColor}1A`, // adding '1A' reduces opacity to 0.1
        borderRadius: 4,
        alignItems: 'center',
      }}>
          <Box
            sx={{ borderRadius: 4, backgroundColor: flagColor, width: '12px', height: '12px' }}
            mr={2}
          >
          </Box>
          <Text sx={{ fontSize: 0, color: vizColors.black, fontWeight: 'medium' }}>
            {flagLabels[rangeName] || ''}
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
