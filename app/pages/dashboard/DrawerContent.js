import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import colorPalette from '../../themes/colorPalette';
import styled from '@emotion/styled';
import { STATUS, useGenerateAGPImages } from './AGPDrawerHelper';
import CGMStatistics from './CGMStatistics';
import DrawerMenuBar from './DrawerMenuBar';
import personUtils from '../../core/personutils';

const BORDER_GRAY = colorPalette.extended.grays[1];

const StyledContent = styled(Box)`
  padding: 32px;
  width: 880px;
`

const StyledAGPImage = styled.img`
  width: calc(100% - 24px);
  margin: 6px 8px 16px;
`

const DataContainer = ({ title, subtitle, children }) => {
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

const DrawerContent = ({ api, trackMetric, patientId }) => {
  const { t } = useTranslation();
  
  const { status, svgDataURLS } = useGenerateAGPImages(api, patientId);

  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  if (status === STATUS.NO_DATA_FOUND) {
    return (
      <StyledContent>
        <Flex sx={{ justifyContent: 'center', marginTop: '400px' }}>
          <Text>{t('{{patientName}} does not have any data yet.', { patientName: patient?.fullName })}</Text>
        </Flex>
      </StyledContent>
    );
  }

  if (status !== STATUS.SVGS_GENERATED) {
    return (
      <StyledContent>
        <Text>{t('Loading')}</Text>
      </StyledContent>
    );
  }

  const percentInRanges          = svgDataURLS?.agpCGM?.percentInRanges;
  const ambulatoryGlucoseProfile = svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile;
  const dailyGlucoseProfilesTop  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0];
  const dailyGlucoseProfilesBot  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1];

  return (
    <StyledContent>
      <DrawerMenuBar patientId={patientId} api={api} trackMetric={trackMetric} />
      
      <Box mb={3} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <DataContainer title={t('Time in Ranges')} subtitle={t('Goals for Type 1 and Type 2 Diabetes')}>
          <StyledAGPImage src={percentInRanges} alt={t('Time in Ranges')} />
        </DataContainer>
        <DataContainer>
          <Box sx={{ marginTop: '32px' }}>
            <CGMStatistics />
          </Box>
        </DataContainer>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <DataContainer title={t('Ambulatory Glucose Profile (AGP)')}>
          <StyledAGPImage src={ambulatoryGlucoseProfile} alt={t('Ambulatory Glucose Profile (AGP)')} />
        </DataContainer>
        <DataContainer title={t('Daily Glucose Profiles')}>
          <StyledAGPImage src={dailyGlucoseProfilesTop} alt={t('Daily Glucose Profiles')} />
          <StyledAGPImage src={dailyGlucoseProfilesBot} alt={t('Daily Glucose Profiles')}/>
        </DataContainer>
      </Box>
    </StyledContent>
  );
}

export default DrawerContent;