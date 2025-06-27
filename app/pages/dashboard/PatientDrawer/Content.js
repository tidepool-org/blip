import React from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
import styled from '@emotion/styled';
const { bankersRound, formatStatsPercentage } = vizUtils.stat;
const { getTimezoneFromTimePrefs } = vizUtils.datetime;

import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;

import useAgpCGM, { STATUS } from './useAgpCGM';
import CGMStatistics from './CGMStatistics';
import getReportDaysText from './CGMStatistics/getReportDaysText';

const StyledAGPImage = styled.img`
  width: calc(100% - 24px);
  margin: 6px 8px 16px;
  display: ${props => props.src ? 'block' : 'none' };
`;

const InsufficientData = () => {
  const { t } = useTranslation();

  return (
    <Flex sx={{ justifyContent: 'center', marginTop: '400px' }}>
      <Text>{t('Insufficient data to generate AGP Report.')}</Text>
    </Flex>
  );
};

const NoPatientData = ({ patientName }) => {
  const { t } = useTranslation();

  return (
    <Flex sx={{ justifyContent: 'center', marginTop: '400px' }}>
      <Text>{t('{{patientName}} does not have any data yet.', { patientName })}</Text>
    </Flex>
  );
};

const CategoryContainer = ({ title, subtitle, children }) => {
  return (
    <Box sx={{ border: `2px solid ${vizColors.gray10}`, borderRadius: '12px', overflow: 'hidden' }}>
      { title && (
        <Box sx={{ backgroundColor: vizColors.gray10, padding: '6px 12px' }}>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>{title}</Text>
          {subtitle && <Text ml={4} sx={{ fontSize: 0 }}>{subtitle}</Text>}
        </Box>
      )}
      {children}
    </Box>
  );
};

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
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ fontSize: 0, color: vizColors.gray50 }}>{t('Time in Very Low')}</Box>
          <Box sx={{ fontSize: 1, fontWeight: 'bold', color: vizColors.purple90 }}>{veryLowPctDelta}</Box>
          <Box sx={{ fontSize: 1, color: vizColors.gray50, fontStyle: 'italic' }}>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetVeryLowPct) })}</Box>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ fontSize: 0, color: vizColors.gray50 }}>{t('Time in Low')}</Box>
          <Box sx={{ fontSize: 1, fontWeight: 'bold', color: vizColors.purple90 }}>{lowPctDelta}</Box>
          <Box sx={{ fontSize: 1, color: vizColors.gray50, fontStyle: 'italic' }}>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetLowPct) })}</Box>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ fontSize: 0, color: vizColors.gray50 }}>{t('Time in Target')}</Box>
          <Box sx={{ fontSize: 1, fontWeight: 'bold', color: vizColors.purple90 }}>{targetPctDelta}</Box>
          <Box sx={{ fontSize: 1, color: vizColors.gray50, fontStyle: 'italic' }}>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetTargetPct) })}</Box>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ fontSize: 0, color: vizColors.gray50 }}>{t('Time in High')}</Box>
          <Box sx={{ fontSize: 1, fontWeight: 'bold', color: vizColors.purple90 }}>{highPctDelta}</Box>
          <Box sx={{ fontSize: 1, color: vizColors.gray50, fontStyle: 'italic' }}>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetHighPct) })}</Box>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ fontSize: 0, color: vizColors.gray50 }}>{t('Time in Very High')}</Box>
          <Box sx={{ fontSize: 1, fontWeight: 'bold', color: vizColors.purple90 }}>{veryHighPctDelta}</Box>
          <Box sx={{ fontSize: 1, color: vizColors.gray50, fontStyle: 'italic' }}>{t('Was {{ value }}%', { value: formatStatsPercentage(offsetVeryHighPct) })}</Box>
        </Flex>
        <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ fontSize: 0, color: vizColors.gray50 }}>{t('Time CGM Active')}</Box>
          <Box sx={{ fontSize: 1, fontWeight: 'bold', color: vizColors.purple90 }}>{sensorUsageAGPDelta}</Box>
          <Box sx={{ fontSize: 1, color: vizColors.gray50, fontStyle: 'italic' }}>{t('Was {{ value }}%', { value: bankersRound(offsetSensorUsageAGP, 1) })}</Box>
        </Flex>
      </Flex>
    </>
  );
};

const Content = ({ api, patientId, agpPeriodInDays }) => {
  const { t } = useTranslation();

  const { status, svgDataURLS, agpCGM, offsetAgpCGM } = useAgpCGM(api, patientId, agpPeriodInDays);

  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  if (status === STATUS.NO_PATIENT_DATA)   return <NoPatientData patientName={patient?.fullName}/>;
  if (status === STATUS.INSUFFICIENT_DATA) return <InsufficientData />;

  if (status !== STATUS.SVGS_GENERATED)    return <Loader show={true} overlay={false} />;

  const percentInRanges          = svgDataURLS?.agpCGM?.percentInRanges;
  const ambulatoryGlucoseProfile = svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile;
  const dailyGlucoseProfilesTop  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0];
  const dailyGlucoseProfilesBot  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1];

  const agpGraphHelpText = t('AGP is a summary of glucose values from the report period, with median (50%) and other percentiles shown as if they occurred in a single day.');
  const agpGraphInsufficientText = t('Insufficient CGM data to generate AGP graph');
  const dailyGlucoseProfilesHelpText = t('Each daily profile represents a midnight-to-midnight period.');

  return (
    <>
      <Box mb={3}>
        <PeriodDeltaSummary agpCGM={agpCGM} offsetAgpCGM={offsetAgpCGM} />
      </Box>

      <Box mb={3} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <CategoryContainer title={t('Time in Ranges')} subtitle={t('Goals for Type 1 and Type 2 Diabetes')}>
          <StyledAGPImage src={percentInRanges} alt={t('Time in Ranges')} />
        </CategoryContainer>
        <CategoryContainer>
          <CGMStatistics agpCGM={agpCGM} />
        </CategoryContainer>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <CategoryContainer title={t('Ambulatory Glucose Profile (AGP)')}>
          <Box px={3} py={1} sx={{ fontSize: 0 }}>
            { !!ambulatoryGlucoseProfile ? agpGraphHelpText : agpGraphInsufficientText }
          </Box>
          <StyledAGPImage src={ambulatoryGlucoseProfile} alt={t('Ambulatory Glucose Profile (AGP)')} />
        </CategoryContainer>
        <CategoryContainer title={t('Daily Glucose Profiles')}>
          <Box px={3} py={1} sx={{ fontSize: 0 }}>
            {dailyGlucoseProfilesHelpText}
          </Box>
          <StyledAGPImage src={dailyGlucoseProfilesTop} alt={t('Daily Glucose Profiles')} />
          <StyledAGPImage src={dailyGlucoseProfilesBot} alt={t('Daily Glucose Profiles')}/>
        </CategoryContainer>
      </Box>

      <Flex mt={3} sx={{ color: 'grays.10', fontSize: 0, justifyContent: 'space-between' }}>
        <Text>{t('Patent pending – HealthPartners Institute dba International Diabetes Center – All Rights Reserved. ©2022')}</Text>
        <Text>{`${t('Tidepool')} | ${t('CapturAGP v5.0')}`}</Text>
      </Flex>
    </>
  );
}

export default Content;
