import React, { useContext, useEffect } from 'react';
import Banner from '../../components/elements/Banner';
import { useDispatch, useSelector } from 'react-redux';
import { isFunction } from 'lodash';
import { AppBannerContext, CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION } from './AppBannerProvider';
import { async } from '../../redux/actions';
import api from '../../core/api';

const AppBanner = ({ trackMetric }) => {
  // Use the banner context
  const {
    banner,
    bannerShownMetricsForPatient,
    setBannerShownMetricsForPatient,
  } = useContext(AppBannerContext);

  const dispatch = useDispatch();
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const userIsCurrentPatient = loggedInUserId === currentPatientInViewId;

  useEffect(() => {
    if(banner?.show?.metric &&!bannerShownMetricsForPatient[banner.id]?.[currentPatientInViewId]) {
      setBannerShownMetricsForPatient({
        [banner.id]: {
          ...(bannerShownMetricsForPatient[banner.id] || {}),
          [currentPatientInViewId]: true,
        },
      });

      trackMetric(banner.show.metric, banner.show?.metricProps);
    }
  }, [banner, bannerShownMetricsForPatient, currentPatientInViewId, setBannerShownMetricsForPatient, trackMetric]);

  // Render nothing if no banner is available
  if (!banner) {
    return null;
  }

  const handleClickMessageLink = () => {
    isFunction(banner.messageLink?.handler) && banner.messageLink.handler();
    banner.messageLink?.metric && trackMetric(banner.messageLink.metric);
  };

  const handleClickAction = () => {
    userIsCurrentPatient && dispatch(async.handleBannerInteraction(api, loggedInUserId, banner.id, CLICKED_BANNER_ACTION));
    isFunction(banner.action?.handler) && banner.action.handler();
    banner.action?.metric && trackMetric(banner.action.metric, banner.action?.metricProps);
  };

  const handleDismiss = () => {
    userIsCurrentPatient && dispatch(async.handleBannerInteraction(api, loggedInUserId, banner.id, DISMISSED_BANNER_ACTION));
    isFunction(banner.dismiss?.handler) && banner.dismiss.handler();
    banner.dismiss?.metric && trackMetric(banner.dismiss.metric, banner.dismiss?.metricProps);
  };

  return (
    <Banner
      id={banner.id}
      label={banner.label}
      message={banner.message}
      title={banner.title}
      actionText={banner.action?.text}
      messageLinkText={banner.messageLink?.text}
      onAction={handleClickAction}
      onClickMessageLink={handleClickMessageLink}
      onDismiss={handleDismiss}
      variant={banner.variant}
    />
  );
};

export default AppBanner;
