import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import styled from '@emotion/styled';

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { Loader } = vizComponents;
const { AGPConstants } = vizUtils.agp;

import { STATUS } from './useAgpCGM';
import CGMStatistics from './CGMStatistics';
import CGMDeltaSummary from './CGMDeltaSummary';

const StyledAGPImage = styled.img`
  width: calc(100% - 24px);
  margin: 6px 8px 16px;
  display: ${props => props.src ? 'block' : 'none' };
`;

export const InsufficientData = () => {
  const { t } = useTranslation();

  return (
    <Flex sx={{ justifyContent: 'center', marginTop: '400px' }}>
      <Text>{t('Insufficient data to generate AGP Report.')}</Text>
    </Flex>
  );
};

export const NoPatientData = ({ patientName }) => {
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

const Overview = ({ patientId, agpCGMData }) => {
  const { t } = useTranslation();
  const { status, svgDataURLS, agpCGM, offsetAgpCGM } = agpCGMData;
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  if (status === STATUS.NO_PATIENT_DATA)   return <NoPatientData patientName={patient?.fullName}/>;
  if (status === STATUS.INSUFFICIENT_DATA) return <InsufficientData />;

  if (status !== STATUS.SVGS_GENERATED)    return <Loader show={true} overlay={false} />;

  const percentInRanges          = svgDataURLS?.agpCGM?.percentInRanges;
  const ambulatoryGlucoseProfile = svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile;
  const dailyGlucoseProfilesTop  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0];
  const dailyGlucoseProfilesBot  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1];

  const { bgSource, glycemicRanges } = agpCGM.query;

  return (
    <Box pt={3}>
      <Box mb={3}>
        <CGMDeltaSummary agpCGM={agpCGM} offsetAgpCGM={offsetAgpCGM} />
      </Box>

      <Flex mb={2} sx={{ fontSize: 1, fontWeight: 'medium', color: vizColors.gray50, gridColumn: '1 / 3' }}>
        <Box>{`${AGPConstants.text.reportHeader} ${AGPConstants.text.reportSubHeader[bgSource]}`}</Box>
      </Flex>
      <Box mb={3} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <CategoryContainer
          title={AGPConstants.text.percentInRanges.title[bgSource]}
          subtitle={AGPConstants.text.percentInRanges.subtitle[glycemicRanges]}
        >
          <StyledAGPImage src={percentInRanges} alt={t('Time in Ranges Chart')} />
        </CategoryContainer>
        <CategoryContainer>
          <CGMStatistics agpCGM={agpCGM} />
        </CategoryContainer>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <CategoryContainer title={AGPConstants.text.ambulatoryGlucoseProfile[bgSource].title}>
          <Box px={3} py={1} sx={{ fontSize: 0 }}>
            {
              !!ambulatoryGlucoseProfile
                ? AGPConstants.text.ambulatoryGlucoseProfile[bgSource].description
                : AGPConstants.text.ambulatoryGlucoseProfile[bgSource].insufficientData
            }
          </Box>
          <StyledAGPImage src={ambulatoryGlucoseProfile} alt={t('Ambulatory Glucose Profile (AGP) Chart')} />
        </CategoryContainer>
        <CategoryContainer title={AGPConstants.text.dailyGlucoseProfiles[bgSource].title}>
          <Box px={3} py={1} sx={{ fontSize: 0 }}>
            {AGPConstants.text.dailyGlucoseProfiles[bgSource].description}
          </Box>
          <StyledAGPImage src={dailyGlucoseProfilesTop} alt={t('Daily Glucose Profiles First Chart')} />
          <StyledAGPImage src={dailyGlucoseProfilesBot} alt={t('Daily Glucose Profiles Second Chart')}/>
        </CategoryContainer>
      </Box>

      <Flex mt={3} sx={{ color: 'grays.10', fontSize: 0, justifyContent: 'space-between' }}>
        <Text>{t('Patent pending – HealthPartners Institute dba International Diabetes Center – All Rights Reserved. ©2022')}</Text>
        <Text>{`${t('Tidepool')} | ${t('CapturAGP v5.0')}`}</Text>
      </Flex>
    </Box>
  );
};

export default Overview;
