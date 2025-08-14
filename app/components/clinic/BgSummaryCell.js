import React, { useMemo, useId } from 'react';
import PropTypes from 'prop-types';
import { Text, Flex, Box } from 'theme-ui';
import map from 'lodash/map';
import { withTranslation } from 'react-i18next';

import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
const { GLYCEMIC_RANGE } = vizUtils.constants;

import { MGDL_PER_MMOLL, MGDL_UNITS } from '../../core/constants';
import BgRangeSummary from './BgRangeSummary';
import PopoverLabel from '../elements/PopoverLabel';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

const InsufficientDataFallback = withTranslation()(({ text = '' }) => (
  <Flex sx={{ justifyContent: 'center' }}>
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'lightestGrey',
        width: ['155px', '175px'],
        height: '18px',
      }}
    >
      <Text sx={{ fontSize: '10px', fontWeight: 'medium', color: 'grays.4' }}>
        {text}
      </Text>
    </Flex>
  </Flex>
));

const NonStandardRangeFallback = withTranslation()(({ t, id, showTooltip }) => (
  <Flex sx={{ justifyContent: 'center' }}>
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'lightestGrey',
        width: ['155px', '175px'],
        height: '18px',
        gap: 1,
      }}
    >
      <Text sx={{ fontSize: '10px', fontWeight: 'medium', color: 'grays.4' }}>
        {t('Non-standard target range')}
      </Text>

      { showTooltip &&
        <PopoverLabel
          id={id}
          icon={InfoOutlinedIcon}
          iconProps={{ sx: { fontSize: 1, color: 'grays.4' } }}
          popoverContent={
            <Box p={1} sx={{ maxWidth: '280px', textAlign: 'center', lineHeight: 0 }}>
              <Text sx={{ color: vizColors.gray50, fontSize: 0, fontWeight: 'bold' }}>
                {t('TIR Unavailable:')}
              </Text>
              {' '}
              <Text sx={{ color: vizColors.gray50, fontSize: 0 }}>
                {t('An Older/High Risk or Pregnancy target range is being used for this patient and the % TIR calculation is not available in this dashboard.')}
              </Text>
            </Box>
          }
          popoverProps={{
            anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
            transformOrigin: { vertical: 'top', horizontal: 'center' },
            sx: { width: 'auto' },
          }}
          triggerOnHover
        />
      }
    </Flex>
  </Flex>
));

export const BgSummaryCell = ({
  id,
  summary,
  config,
  clinicBgUnits,
  activeSummaryPeriod,
  glycemicRanges = GLYCEMIC_RANGE.ADA_STANDARD,
  showExtremeHigh,
  t,
}) => {
  const targetRange = useMemo(
    () =>
      map(
        [config?.lowGlucoseThreshold, config?.highGlucoseThreshold],
        (value) =>
          clinicBgUnits === MGDL_UNITS ? value * MGDL_PER_MMOLL : value
      ),
    [
      clinicBgUnits,
      config?.highGlucoseThreshold,
      config?.lowGlucoseThreshold,
    ]
  );

  const cgmHours =
    (summary?.timeCGMUseMinutes || 0) / 60;

  const data = useMemo(
    () => {
      const rangeData = {
        veryLow: summary?.timeInVeryLowPercent,
        low: summary?.timeInLowPercent,
        target: summary?.timeInTargetPercent,
        high: summary?.timeInHighPercent,
        veryHigh: summary?.timeInVeryHighPercent,
      };

      if (showExtremeHigh) rangeData.extremeHigh = summary?.timeInExtremeHighPercent;
      return rangeData;
    }, [summary, showExtremeHigh]
  );

  const cgmUsePercent = (summary?.timeCGMUsePercent || 0);
  const minCgmHours = 24;
  const minCgmPercent = 0.7;

  const insufficientDataText = useMemo(
    () =>
      activeSummaryPeriod === '1d'
        ? t('CGM Use <{{minCgmPercent}}%', { minCgmPercent: minCgmPercent * 100 })
        : t('CGM Use <{{minCgmHours}} hours', { minCgmHours }),
    [activeSummaryPeriod, t]
  );

  const hasSufficientData = (activeSummaryPeriod === '1d' && cgmUsePercent >= minCgmPercent) ||
                            (cgmHours >= minCgmHours);

  const isStandardRange = glycemicRanges === GLYCEMIC_RANGE.ADA_STANDARD;

  const hasNonStandardTooltip = (
    glycemicRanges === GLYCEMIC_RANGE.ADA_OLDER_HIGH_RISK ||
    glycemicRanges === GLYCEMIC_RANGE.ADA_PREGNANCY_T1 ||
    glycemicRanges === GLYCEMIC_RANGE.ADA_GESTATIONAL_T2
  );

  // Error messages are prioritized

  // 1) CGM Wear Time < 70%
  if (!hasSufficientData && cgmUsePercent !== 0) {
    return <InsufficientDataFallback text={insufficientDataText} />;
  }

  // 2) Non-standard target ranges
  if (!isStandardRange) {
    return <NonStandardRangeFallback id={id} showTooltip={hasNonStandardTooltip} />;
  }

  // 3) Wear Time is 0% (render a blank bar)
  if (!hasSufficientData && cgmUsePercent === 0) {
    return <InsufficientDataFallback text="" />;
  }

  return (
    <Flex sx={{ justifyContent: 'center' }}>
      <BgRangeSummary
        striped={cgmUsePercent < minCgmPercent}
        data={data}
        cgmUsePercent={cgmUsePercent}
        targetRange={targetRange}
        bgUnits={clinicBgUnits}
      />
    </Flex>
  );
};

BgSummaryCell.propTypes = {
  config: PropTypes.shape({
    veryLow: PropTypes.number,
    low: PropTypes.number,
    target: PropTypes.number,
    high: PropTypes.number,
    veryHigh: PropTypes.number,
  }).isRequired,
  summary: PropTypes.shape({
    veryLow: PropTypes.number,
    low: PropTypes.number,
    target: PropTypes.number,
    high: PropTypes.number,
    veryHigh: PropTypes.number,
  }),
  showExtremeHigh: PropTypes.bool,
  striped: PropTypes.bool,
  targetRange: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default withTranslation()(BgSummaryCell);
