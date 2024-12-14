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