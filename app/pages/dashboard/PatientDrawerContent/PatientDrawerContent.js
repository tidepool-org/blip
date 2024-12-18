import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import colorPalette from '../../../themes/colorPalette';
import styled from '@emotion/styled';
import useAGPImages, { STATUS } from './useAGPImages';
import CGMStatistics from './CGMStatistics';
import MenuBar from './MenuBar';
import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;

const BORDER_GRAY = colorPalette.extended.grays[1];

const StyledContent = styled(Box)`
  padding: 32px;
  width: 880px;
`

const StyledAGPImage = styled.img`
  width: calc(100% - 24px);
  margin: 6px 8px 16px;
`

const InsufficientDataContent = () => {
  const { t } = useTranslation();
  
  return (
    <StyledContent>
      <Flex sx={{ justifyContent: 'center', marginTop: '400px' }}>
        <Text>{t('Insufficient data to generate AGP Report.')}</Text>
      </Flex>
    </StyledContent>
  );
}

const NoPatientDataContent = ({ patientName }) => {
  const { t } = useTranslation();

  return (
    <StyledContent>
      <Flex sx={{ justifyContent: 'center', marginTop: '400px' }}>
        <Text>{t('{{patientName}} does not have any data yet.', { patientName })}</Text>
      </Flex>
    </StyledContent>
  );
}

const LoadingContent = () => (
  <StyledContent>
    <Loader show={true} overlay={false} />
  </StyledContent>
)

const CategoryContainer = ({ title, subtitle, children }) => {
  return (
    <Box sx={{ border: `2px solid ${BORDER_GRAY}`, borderRadius: '12px', overflow: 'hidden' }}>
      { title && (
        <Box sx={{ backgroundColor: BORDER_GRAY, padding: '6px 12px' }}>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>{title}</Text>
          {subtitle && (
            <Text sx={{ marginLeft: '24px', fontSize: 0, color: colorPalette.extended.grays[6] }}>
              {subtitle}
            </Text>
          )}
        </Box>
      )}

      {children}
    </Box>
  );
};

const PatientDrawerContent = ({ api, trackMetric, patientId }) => {
  const { t } = useTranslation();
  
  const { status, svgDataURLS } = useAGPImages(api, patientId);

  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  if (status === STATUS.NO_PATIENT_DATA)   return <NoPatientDataContent patientName={patient?.fullName}/>;
  if (status === STATUS.INSUFFICIENT_DATA) return <InsufficientDataContent />;
  if (status !== STATUS.SVGS_GENERATED)    return <LoadingContent />;

  const percentInRanges          = svgDataURLS?.agpCGM?.percentInRanges;
  const ambulatoryGlucoseProfile = svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile;
  const dailyGlucoseProfilesTop  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0];
  const dailyGlucoseProfilesBot  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1];

  return (
    <StyledContent>
      <MenuBar patientId={patientId} api={api} trackMetric={trackMetric} />
      
      <Box mb={3} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <CategoryContainer title={t('Time in Ranges')} subtitle={t('Goals for Type 1 and Type 2 Diabetes')}>
          <StyledAGPImage src={percentInRanges} alt={t('Time in Ranges')} />
        </CategoryContainer>
        <CategoryContainer>
          <Box sx={{ marginTop: '32px' }}>
            <CGMStatistics />
          </Box>
        </CategoryContainer>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <CategoryContainer title={t('Ambulatory Glucose Profile (AGP)')}>
          <StyledAGPImage src={ambulatoryGlucoseProfile} alt={t('Ambulatory Glucose Profile (AGP)')} />
        </CategoryContainer>
        <CategoryContainer title={t('Daily Glucose Profiles')}>
          <StyledAGPImage src={dailyGlucoseProfilesTop} alt={t('Daily Glucose Profiles')} />
          <StyledAGPImage src={dailyGlucoseProfilesBot} alt={t('Daily Glucose Profiles')}/>
        </CategoryContainer>
      </Box>
    </StyledContent>
  );
}

export default PatientDrawerContent;