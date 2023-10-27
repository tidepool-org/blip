import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Text, Flex } from 'theme-ui';
import map from 'lodash/map';
import { withTranslation } from 'react-i18next';

import { MGDL_PER_MMOLL, MGDL_UNITS } from '../../core/constants';
import utils from '../../core/utils';
import BgRangeSummary from './BgRangeSummary';

export const BgSummaryCell = ({ summary, config, clinicBgUnits, activeSummaryPeriod, t }) => {
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
    () => ({
      veryLow: summary?.timeInVeryLowPercent,
      low: summary?.timeInLowPercent,
      target: summary?.timeInTargetPercent,
      high: summary?.timeInHighPercent,
      veryHigh: summary?.timeInVeryHighPercent,
    }),
    [summary]
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

  return (
    <Flex justifyContent="center">
      {(activeSummaryPeriod === '1d' && cgmUsePercent >= minCgmPercent) || (cgmHours >= minCgmHours)
        ? (
        <BgRangeSummary
          striped={cgmUsePercent < minCgmPercent}
          data={data}
          cgmUsePercent={cgmUsePercent}
          targetRange={targetRange}
          bgUnits={clinicBgUnits}
        />
      ) : (
        <Flex
          alignItems="center"
          justifyContent="center"
          bg="lightestGrey"
          width={['155px', '175px']}
          height="18px"
        >
          <Text fontSize="10px" fontWeight="medium" color="grays.4">
            {cgmUsePercent === 0 ? '' : insufficientDataText}
          </Text>
        </Flex>
      )}
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
  }).isRequired,
  striped: PropTypes.bool,
  targetRange: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export default withTranslation()(BgSummaryCell);
