import React from 'react';
import { useSelector } from 'react-redux';

import { STEPS, useGenerateAGPImages } from './AGPDrawerHelper';

const DrawerContent = ({ api, patientId }) => {
  const { currentStep, svgDataURLS } = useGenerateAGPImages(api, patientId);

  console.log(currentStep);

  if (currentStep !== STEPS.SVGS_GENERATED) {
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
    <div style={{ minWidth: 600 }}>
      {images
        .filter(el => !!el) // filter out non-existent images
        .map(dataURI => {
          return (
            <div style={{ 
              background: `url("${dataURI}")`,
              minHeight: '300px',
              minWidth: '500px',
            }}>
            </div>
          )
        })
      }
    </div>
  );
}

export default DrawerContent;