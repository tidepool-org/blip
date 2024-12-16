import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Flex, Box, Text } from 'theme-ui';
import Button from '../../components/elements/Button';
import { STATUS, useGenerateAGPImages } from './AGPDrawerHelper';
import CGMStats from './CGMStats';

const DrawerContent = ({ api, patientId }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const { status, svgDataURLS } = useGenerateAGPImages(api, patientId);

  console.log(status);

  if (status !== STATUS.SVGS_GENERATED) {
    return <p>Loading ...</p>;
  }

  const handleViewData = () => history.push(`/patients/${patientId}/data?chart=trends&dashboard=tide`);

  const images = [ 
    // CGM 
    svgDataURLS?.agpCGM?.percentInRanges,
    svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile,
    svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0],
    svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1],

    // BGM
    // svgDataURLS?.agpCGM?.percentInRanges,
    // svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile,
    // svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0],
    // svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1],
  ];

  return (
    <>
      <Flex sx={{ gap: '12px' }}>
        <Box>{t('Name/DOB')}</Box>
        <Button onClick={handleViewData}>{t('View Data')}</Button>
        <Button onClick={() => {}}>{t('Copy as Text')}</Button>
        <Text>{t('Last Reviewed')}</Text>
      </Flex>

      <CGMStats />

      <div style={{ minWidth: 800, display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {images.filter(el => !!el) // filter out non-existent images
               .map((dataURI, index) => <img key={index} src={dataURI} />)
        }
      </div>
    </>
  );
}

export default DrawerContent;