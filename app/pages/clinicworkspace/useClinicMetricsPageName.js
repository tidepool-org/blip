import React from 'react';
import { useLocation } from 'react-router-dom';

const useClinicMetricsPageName = () => {
  const { pathname } = useLocation();

  switch (pathname) {
    case '/clinic-workspace':
    case '/clinic-workspace/patients':
      return 'Population Health';

    default:
      return 'Unknown';
  };
};

export default useClinicMetricsPageName;
