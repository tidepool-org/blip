import React, { useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Flex, Box } from 'theme-ui';
import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
import styled from '@emotion/styled';
const { bankersRound } = vizUtils.stat;
const { getTimezoneFromTimePrefs } = vizUtils.datetime;
import { MS_IN_HOUR } from '../../../../core/constants';

import getReportDaysText from '../getReportDaysText';

const formatPercentChangeCopy = (t, currentValue, previousValue) => {
  const renderedDelta = bankersRound(Math.abs(currentValue - previousValue), 1);

  if (renderedDelta === 0) {
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
  if (!agpCGM || !offsetAgpCGM) return {};

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
  const timeInVeryHighFraction = _.toNumber(counts.veryHigh) / counts.total;
  const timeInHighFraction = _.toNumber(counts.high) / counts.total;
  const timeInTargetFraction = _.toNumber(counts.target) / counts.total;
  const timeInLowFraction = _.toNumber(counts.low) / counts.total;
  const timeInVeryLowFraction = _.toNumber(counts.veryLow) / counts.total;

  const timeInVeryHighPercent = bankersRound(timeInVeryHighFraction * 100, 0);
  const timeInHighPercent = bankersRound(timeInHighFraction * 100, 0);
  const timeInTargetPercent = bankersRound(timeInTargetFraction * 100, 0);
  const timeInLowPercent = bankersRound(timeInLowFraction * 100, 0);
  const timeInVeryLowPercent = bankersRound(timeInVeryLowFraction * 100, 0);

  // Past Period Values
  const offsetTimeInVeryHighFraction = _.toNumber(offsetCounts.veryHigh) / offsetCounts.total;
  const offsetTimeInHighFraction = _.toNumber(offsetCounts.high) / offsetCounts.total;
  const offsetTimeInTargetFraction = _.toNumber(offsetCounts.target) / offsetCounts.total;
  const offsetTimeInLowFraction = _.toNumber(offsetCounts.low) / offsetCounts.total;
  const offsetTimeInVeryLowFraction = _.toNumber(offsetCounts.veryLow) / offsetCounts.total;

  const offsetTimeInVeryHighPercent = bankersRound(offsetTimeInVeryHighFraction * 100, 0);
  const offsetTimeInHighPercent = bankersRound(offsetTimeInHighFraction * 100, 0);
  const offsetTimeInTargetPercent = bankersRound(offsetTimeInTargetFraction * 100, 0);
  const offsetTimeInLowPercent = bankersRound(offsetTimeInLowFraction * 100, 0);
  const offsetTimeInVeryLowPercent = bankersRound(offsetTimeInVeryLowFraction * 100, 0);

  // Change since Past Period
  const timeInVeryHighPercentDeltaCopy = formatPercentChangeCopy(t, timeInVeryHighPercent, offsetTimeInVeryHighPercent);
  const timeInHighPercentDeltaCopy = formatPercentChangeCopy(t, timeInHighPercent, offsetTimeInHighPercent);
  const timeInTargetPercentDeltaCopy = formatPercentChangeCopy(t, timeInTargetPercent, offsetTimeInTargetPercent);
  const timeInLowPercentDeltaCopy = formatPercentChangeCopy(t, timeInLowPercent, offsetTimeInLowPercent);
  const timeInVeryLowPercentDeltaCopy = formatPercentChangeCopy(t, timeInVeryLowPercent, offsetTimeInVeryLowPercent);

  const offsetSensorUsageAGP = bankersRound(offsetSensorUsageAGPRaw, 1);
  const sensorUsageAGPDeltaCopy = formatPercentChangeCopy(t, bankersRound(sensorUsageAGP, 1), bankersRound(offsetSensorUsageAGPRaw, 1));

  return {
    dateRange,
    roundedBgDaysWorn,

    timeInVeryHighPercentDeltaCopy,
    timeInHighPercentDeltaCopy,
    timeInTargetPercentDeltaCopy,
    timeInLowPercentDeltaCopy,
    timeInVeryLowPercentDeltaCopy,

    offsetTimeInVeryHighPercent,
    offsetTimeInHighPercent,
    offsetTimeInTargetPercent,
    offsetTimeInLowPercent,
    offsetTimeInVeryLowPercent,

    sensorUsageAGPDeltaCopy,
    offsetSensorUsageAGP,
  };
};

const InsufficientData = () => {
  const { t } = useTranslation();

  return (
      <>
        <Flex mb={2} sx={{ justifyContent: 'space-between', fontSize: 1, fontWeight: 'medium', color: vizColors.gray50 }}>
          <Box>{t('Tidepool Summary: Changes Since Last Time Period')}</Box>
        </Flex>
        <Flex sx={{ justifyContent:'center', background: vizColors.blue00, padding: 3, borderRadius: '8px' }}>
          <Previous>{t('Insufficient data to calculate Time in Ranges')}</Previous>
        </Flex>
      </>
    );
};

const CGMDeltaSummary = ({ agpCGM, offsetAgpCGM }) => {
  const { t } = useTranslation();

  const values = useMemo(() => getRenderedValues(agpCGM, offsetAgpCGM, t), [agpCGM, offsetAgpCGM, t]);

  if (!agpCGM) return null;

  if (!offsetAgpCGM) return <InsufficientData />;

  const { count, sampleInterval } = offsetAgpCGM?.data?.current?.stats?.sensorUsage || {};
  const hoursOfCGMData = (count * sampleInterval) / MS_IN_HOUR;
  const isDataInsufficient = !hoursOfCGMData || hoursOfCGMData < 24;

  if (isDataInsufficient) return <InsufficientData />;

  return (
    <>
      <Flex mb={2} sx={{ justifyContent: 'space-between', fontSize: 1, fontWeight: 'medium', color: vizColors.gray50 }}>
        <Box>{t('Tidepool Summary: Changes Since Last Time Period')}</Box>
        <Box sx={{ fontWeight: 'normal' }}>
          {t('{{dateRange}} ({{bgDaysWorn}} days)', { dateRange: values.dateRange, bgDaysWorn: values.roundedBgDaysWorn })}
        </Box>
      </Flex>
      <Flex sx={{ justifyContent:'space-between', background: vizColors.blue00, padding: 3, borderRadius: '8px' }}>
        <Category data-testid="cgm-delta-summary-very-low">
          <Label>{t('Time in Very Low')}</Label>
          <Delta>{values?.timeInVeryLowPercentDeltaCopy}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values?.offsetTimeInVeryLowPercent })}</Previous>
        </Category>
        <Category data-testid="cgm-delta-summary-low">
          <Label>{t('Time in Low')}</Label>
          <Delta>{values?.timeInLowPercentDeltaCopy}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values?.offsetTimeInLowPercent })}</Previous>
        </Category>
        <Category data-testid="cgm-delta-summary-target">
          <Label>{t('Time in Target')}</Label>
          <Delta>{values?.timeInTargetPercentDeltaCopy}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values?.offsetTimeInTargetPercent })}</Previous>
        </Category>
        <Category data-testid="cgm-delta-summary-high">
          <Label>{t('Time in High')}</Label>
          <Delta>{values?.timeInHighPercentDeltaCopy}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values?.offsetTimeInHighPercent })}</Previous>
        </Category>
        <Category data-testid="cgm-delta-summary-very-high">
          <Label>{t('Time in Very High')}</Label>
          <Delta>{values?.timeInVeryHighPercentDeltaCopy}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values?.offsetTimeInVeryHighPercent })}</Previous>
        </Category>
        <Category data-testid="cgm-delta-summary-cgm-active">
          <Label>{t('Time CGM Active')}</Label>
          <Delta>{values?.sensorUsageAGPDeltaCopy}</Delta>
          <Previous>{t('Was {{ value }}%', { value: values?.offsetSensorUsageAGP })}</Previous>
        </Category>
      </Flex>
    </>
  );
};

export default CGMDeltaSummary;
