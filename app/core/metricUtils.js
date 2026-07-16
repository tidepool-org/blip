import appContext from '../bootstrap';
import { useLocation } from 'react-router-dom';

export const trackMetric = (...args) => appContext.trackMetric(...args);

export const useClinicMetricsPageName = () => {
  const { pathname } = useLocation();

  switch (pathname) {
    case '/clinic-workspace':
    case '/clinic-workspace/patients':
      return 'Population Health';

    default:
      return 'Unknown';
  };
};
