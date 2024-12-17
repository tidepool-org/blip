import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import colorPalette from '../../themes/colorPalette';
import styled from '@emotion/styled';
import { STATUS, useGenerateAGPImages } from './AGPDrawerHelper';
import AgpCGMStats from './AgpCGMStats';
import DrawerMenuBar from './DrawerMenuBar';

const BORDER_GRAY = colorPalette.extended.grays[1];

const StyledDrawerContent = styled(Box)`
  padding: 32px;
  width: 900px;
`

const StyledImg = styled.img`
  width: calc(100% - 24px);
  margin: 6px 8px;
`

const StyledContainerHeader = styled(Box)`
  background-color: ${BORDER_GRAY};
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 6px 12px;
`;

const DataContainer = ({ title, children }) => {
  return (
    <Box sx={{ border: `1px solid ${BORDER_GRAY}`, borderRadius: '12px' }}>
      { title && (
        <StyledContainerHeader>
          <Text sx={{ fontWeight: 'bold', fontSize: '16px' }}>{title}</Text>
        </StyledContainerHeader>
      )}

      {children}
    </Box>
  );
};

const DrawerContent = ({ api, trackMetric, patientId }) => {
  const { t } = useTranslation();
  const { status, svgDataURLS } = useGenerateAGPImages(api, patientId);

  if (status !== STATUS.SVGS_GENERATED) {
    return (
      <StyledDrawerContent>
        <Text>{t('Loading')}</Text>
      </StyledDrawerContent>
    );
  }

  const percentInRanges          = svgDataURLS?.agpCGM?.percentInRanges;
  const ambulatoryGlucoseProfile = svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile;
  const dailyGlucoseProfilesTop  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0];
  const dailyGlucoseProfilesBot  = svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1];

  return (
    <StyledDrawerContent>
      <DrawerMenuBar patientId={patientId} api={api} trackMetric={trackMetric} />
      
      <Box mb={3} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <DataContainer title={t('Time in Ranges')}>
          <StyledImg src={percentInRanges} />
        </DataContainer>
        <DataContainer>
          <Box sx={{ marginTop: '32px' }}>
            <AgpCGMStats />
          </Box>
        </DataContainer>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <DataContainer title={t('Ambulatory Glucose Profile (AGP)')}>
          <StyledImg src={ambulatoryGlucoseProfile} />
        </DataContainer>
        <DataContainer title={t('Daily Glucose Profiles')}>
          <StyledImg src={dailyGlucoseProfilesTop} />
          <StyledImg src={dailyGlucoseProfilesBot} />
        </DataContainer>
      </Box>
    </StyledDrawerContent>
  );
}

export default DrawerContent;