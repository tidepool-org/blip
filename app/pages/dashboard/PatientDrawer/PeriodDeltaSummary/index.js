import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Flex, Box } from 'theme-ui';
import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
import styled from '@emotion/styled';
const { bankersRound, formatStatsPercentage } = vizUtils.stat;
const { getTimezoneFromTimePrefs } = vizUtils.datetime;

import getReportDaysText from '../CGMStatistics/getReportDaysText';

const formatPercentChangeCopy = (currentValue, previousValue, t) => {
  const renderedDelta = formatStatsPercentage(Math.abs(currentValue - previousValue));

  if (renderedDelta === '0') {
    return t('Did not change');
  } else if (currentValue > previousValue) {
    return t('Increased by {{ delta }}%', { delta: renderedDelta });
  } else {
    return t('Decreased by {{ delta }}%', { delta: renderedDelta });
  }
};

const Category = styled(Flex)`
  flex-direction: column;
  align-items: center;
`;

const Label = styled(Box)`
  font-size: 12px;
  color: ${vizColors.gray50};
`;

const Delta = styled(Box)`
  font-size: 14px;
  font-weight: bold;
  color: ${vizColors.purple90};
`;

const Previous = styled(Box)`
  font-size: 14px;
  font-style: italic;
  color: ${vizColors.gray50};
`;

const PeriodDeltaSummary = ({ agpCGM, offsetAgpCGM }) => {
  const { t } = useTranslation();

  if (!agpCGM || !offsetAgpCGM) return null;

  const {
    timePrefs,
    data: {
      current: {
        stats: {
          sensorUsage: { sensorUsageAGP },
          timeInRange: { counts },
        },
      },
    },
  } = agpCGM;

  const {
    data: {
      current: {
        stats: {
          bgExtents: { newestDatum, oldestDatum, bgDaysWorn },
          sensorUsage: { sensorUsageAGP: offsetSensorUsageAGP },
          timeInRange: { counts: offsetCounts },
        },
      },
    },
  } = offsetAgpCGM;

  const timezone = getTimezoneFromTimePrefs(timePrefs);
  const dateRange  = getReportDaysText(newestDatum, oldestDatum, bgDaysWorn, timezone);
  const roundedBgDaysWorn = bankersRound(bgDaysWorn, 0);

  // Current Period Values
  const veryHighPct = _.toNumber(counts.veryHigh) / counts.total * 1;
  const highPct = _.toNumber(counts.high) / counts.total * 1;
  const targetPct = _.toNumber(counts.target) / counts.total * 1;
  const lowPct = _.toNumber(counts.low) / counts.total * 1;
  const veryLowPct = _.toNumber(counts.veryLow) / counts.total * 1;

  // Past Period Values
  const offsetVeryHighPct = _.toNumber(offsetCounts.veryHigh) / offsetCounts.total * 1;
  const offsetHighPct = _.toNumber(offsetCounts.high) / offsetCounts.total * 1;
  const offsetTargetPct = _.toNumber(offsetCounts.target) / offsetCounts.total * 1;
  const offsetLowPct = _.toNumber(offsetCounts.low) / offsetCounts.total * 1;
  const offsetVeryLowPct = _.toNumber(offsetCounts.veryLow) / offsetCounts.total * 1;

  // Change since Past Period
  const veryHighPctDelta = formatPercentChangeCopy(veryHighPct, offsetVeryHighPct, t);
  const highPctDelta = formatPercentChangeCopy(highPct, offsetHighPct, t);
  const targetPctDelta = formatPercentChangeCopy(targetPct, offsetTargetPct, t);
  const lowPctDelta = formatPercentChangeCopy(lowPct, offsetLowPct, t);
  const veryLowPctDelta = formatPercentChangeCopy(veryLowPct, offsetVeryLowPct, t);
  const sensorUsageAGPDelta = formatPercentChangeCopy(sensorUsageAGP / 100, offsetSensorUsageAGP / 100, t);

  return (
    <>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <p>{t('Tidepool Summary: Changes Since Last Time Period')}</p>
        <p>{t('{{dateRange}} ({{bgDaysWorn}} days)', { dateRange, bgDaysWorn: roundedBgDaysWorn })}</p>
      </Flex>
      <Flex sx={{ justifyContent:'space-between', background: vizColors.blue00, padding: 3, borderRadius: '8px' }}>
        <Category>
          <Label>{t('Time in Very Low')}</Label>
          <Delta>{veryLowPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetVeryLowPct) })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in Low')}</Label>
          <Delta>{lowPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetLowPct) })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in Target')}</Label>
          <Delta>{targetPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetTargetPct) })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in High')}</Label>
          <Delta>{highPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetHighPct) })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in Very High')}</Label>
          <Delta>{veryHighPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetVeryHighPct) })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time CGM Active')}</Label>
          <Delta>{sensorUsageAGPDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: bankersRound(offsetSensorUsageAGP, 1) })}</Previous>
        </Category>
      </Flex>
    </>
  );
};

export default PeriodDeltaSummary;
