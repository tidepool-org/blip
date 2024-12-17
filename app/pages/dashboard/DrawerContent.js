import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Flex, Box, Text } from 'theme-ui';
import { STATUS, useGenerateAGPImages } from './AGPDrawerHelper';
import AgpCGMStats from './AgpCGMStats';
import DrawerMenuBar from './DrawerMenuBar';

const DrawerContent = ({ api, trackMetric, patientId }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const { status, svgDataURLS } = useGenerateAGPImages(api, patientId);

  console.log(status);

  if (status !== STATUS.SVGS_GENERATED) {
    return <p>Loading ...</p>;
  }

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
      <DrawerMenuBar patientId={patientId} api={api} trackMetric={trackMetric} />
      <AgpCGMStats />

      <div style={{ minWidth: 800, display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {images.filter(el => !!el) // filter out non-existent images
               .map((dataURI, index) => <img key={index} src={dataURI} />)
        }
      </div>
    </>
  );
}

export default DrawerContent;