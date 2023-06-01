import React from 'react';
import ReactGA from 'react-ga4';
import { useLocation } from 'react-router-dom';

/* global __REACT_APP_GAID__ */

const GoogleAnalyticsWrapper = ({ children }) => {
  const location = useLocation();
  const isInitialized = ReactGA.isInitialized;

  React.useEffect(() => {
    if (__REACT_APP_GAID__ && isInitialized === false) {
      ReactGA.initialize(__REACT_APP_GAID__, { gtagOptions: { 'send_page_view': false } });
    }
  }, [isInitialized]);

  React.useEffect(() => {
    if (ReactGA.isInitialized) {
      ReactGA.send({
        hitType: 'pageview',
        page: location?.pathname + location?.search + location?.hash,
        'page_search': location?.search,
        'page_hash': location?.hash,
      });
    }
  }, [location]);

  return children;
};

export default GoogleAnalyticsWrapper
