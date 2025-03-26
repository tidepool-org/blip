import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import colorPalette from '../../../themes/colorPalette';
import { colors as vizColors } from '@tidepool/viz';
import styled from '@emotion/styled';

import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;

import useAgpCGM, { STATUS } from './useAgpCGM';
import CGMStatistics from './CGMStatistics';

const StyledAGPImage = styled.img`
  width: calc(100% - 24px);
  margin: 6px 8px 16px;
  display: ${props => props.src ? 'block' : 'none' };
`

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

const Content = ({ api, patientId, agpPeriodInDays }) => {
  const { t } = useTranslation();

  const { status, svgDataURLS, agpCGM } = useAgpCGM(api, patientId, agpPeriodInDays);

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
