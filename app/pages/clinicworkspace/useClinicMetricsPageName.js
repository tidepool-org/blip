import React from 'react';
import { useLocation } from 'react-router-dom';

const useClinicMetricsPageName = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/clinic-workspace')) return 'Population Health';

  return 'Unknown';
};

export default useClinicMetricsPageName;
