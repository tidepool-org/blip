import React from 'react';
import { STATUS, useGenerateAGPImages } from './AGPDrawerHelper';

const DrawerContent = ({ api, patientId }) => {
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
    svgDataURLS?.agpCGM?.percentInRanges,
    svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile,
    svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0],
    svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1],
  ];

  return (
    <div style={{ minWidth: 600, display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
      {images.filter(el => !!el) // filter out non-existent images
             .map(dataURI => <img src={dataURI} />)
      }
    </div>
  );
}

export default DrawerContent;