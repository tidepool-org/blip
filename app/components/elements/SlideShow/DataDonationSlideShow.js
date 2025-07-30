import React from 'react';
import { useTranslation } from 'react-i18next';

import ChangeMindImage from './Images/changeMindImage.svg';
import FuelingNextGenImage from './Images/fuelingNextGenImage.svg';
import { SlideShow, SlideShowItem } from '.';

function DataDonationSlideShow() {
  const { t } = useTranslation();

  return (
    <SlideShow
      mb={4}
      items={[
        {
          title: t('Fueling the Next Generation of Diabetes Innovation'),
          content: t('The Tidepool Big Data Donation Project enables students, academics, and industry to innovate faster. By donating your anonymized data, you can help transform the landscape of diabetes management.'),
          image: FuelingNextGenImage,
        },
        {
          title: t('Can I change my mind later?'),
          content: t('You can stop sharing new data at any time. Go to your account settings and click "Stop sharing data." Please note that we cannot remove data that has already been shared.'),
          image: ChangeMindImage,
        },
      ]}
      renderItem={({ item, index, isSnapPoint }) => (
        <SlideShowItem
          key={index}
          isSnapPoint={isSnapPoint}
          image={item.image}
          title={item.title}
          content={item.content}
        />
      )}
    />
  );
}

export default DataDonationSlideShow;
