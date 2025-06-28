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

const getRenderedValues = (agpCGM, offsetAgpCGM, t) => {
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
          sensorUsage: { sensorUsageAGP: offsetSensorUsageAGPRaw },
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
  const sensorUsageAGPDelta = formatPercentChangeCopy(sensorUsageAGP / 100, offsetSensorUsageAGPRaw / 100, t);
  const offsetSensorUsageAGP = bankersRound(offsetSensorUsageAGPRaw, 1);

  return {
    dateRange,
    roundedBgDaysWorn,
    veryHighPct,
    highPct,
    targetPct,
    lowPct,
    veryLowPct,
    offsetVeryHighPct: formatStatsPercentage(offsetVeryHighPct),
    offsetHighPct: formatStatsPercentage(offsetHighPct),
    offsetTargetPct: formatStatsPercentage(offsetTargetPct),
    offsetLowPct: formatStatsPercentage(offsetLowPct),
    offsetVeryLowPct: formatStatsPercentage(offsetVeryLowPct),
    veryHighPctDelta,
    highPctDelta,
    targetPctDelta,
    lowPctDelta,
    veryLowPctDelta,
    sensorUsageAGPDelta,
    offsetSensorUsageAGP,
  };
};

const PeriodDeltaSummary = ({ agpCGM, offsetAgpCGM }) => {
  const { t } = useTranslation();

  if (!agpCGM || !offsetAgpCGM) return null;

  const values = getRenderedValues(agpCGM, offsetAgpCGM, t);

  return (
    <>
      <Flex mb={2} sx={{ justifyContent: 'space-between', fontSize: 1, fontWeight: 'medium', color: vizColors.gray50 }}>
        <Box>{t('Tidepool Summary: Changes Since Last Time Period')}</Box>
        <Box sx={{ fontWeight: 'normal' }}>
          {t('{{dateRange}} ({{bgDaysWorn}} days)', { dateRange: values.dateRange, bgDaysWorn: values.roundedBgDaysWorn })}
        </Box>
      </Flex>
      <Flex sx={{ justifyContent:'space-between', background: vizColors.blue00, padding: 3, borderRadius: '8px' }}>
        <Category>
          <Label>{t('Time in Very Low')}</Label>
          <Delta>{values.veryLowPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values.offsetVeryLowPct })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in Low')}</Label>
          <Delta>{values.lowPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values.offsetLowPct })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in Target')}</Label>
          <Delta>{values.targetPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values.offsetTargetPct })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in High')}</Label>
          <Delta>{values.highPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values.offsetHighPct })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time in Very High')}</Label>
          <Delta>{values.veryHighPctDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values.offsetVeryHighPct })}</Previous>
        </Category>
        <Category>
          <Label>{t('Time CGM Active')}</Label>
          <Delta>{values.sensorUsageAGPDelta}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values.offsetSensorUsageAGP })}</Previous>
        </Category>
      </Flex>
    </>
  );
};

export default PeriodDeltaSummary;
