import appContext from '../bootstrap';

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
