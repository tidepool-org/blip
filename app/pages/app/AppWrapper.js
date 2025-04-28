import React from 'react';
import AppBanner from '../../providers/AppBanner/AppBanner';
import useProviderConnectionPopup from '../../components/datasources/useProviderConnectionPopup';

const AppWrapper = ({ trackMetric, children }) => {
  useProviderConnectionPopup({ trackMetric });

  return (
    <div className="app">
      <AppBanner trackMetric={trackMetric} />
      {children}
    </div>
  );
};

export default AppWrapper;
