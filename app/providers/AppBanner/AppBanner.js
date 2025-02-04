import React, { useCallback, useContext, useEffect } from 'react';
import Banner from '../../components/elements/Banner';
import { useDispatch, useSelector } from 'react-redux';
import { isFunction } from 'lodash';
import { AppBannerContext, CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION } from './AppBannerProvider';
import { async } from '../../redux/actions';
import api from '../../core/api';
import { useIsFirstRender } from '../../core/hooks';
import { useToasts } from '../ToastProvider';

const AppBanner = ({ trackMetric }) => {
  // Use the banner context
  const {
    banner,
    bannerShownMetricsForPatient,
    setBannerShownMetricsForPatient,
    bannerInteractedForPatient,
    setBannerInteractedForPatient,
  } = useContext(AppBannerContext);

  const dispatch = useDispatch();
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const userIsCurrentPatient = loggedInUserId === currentPatientInViewId;
  const isFirstRender = useIsFirstRender();
  const working = useSelector(state => state.blip.working);
  const { set: setToast } = useToasts();
  const workingState = working[banner?.action?.working?.key];


  const completeClickAction = useCallback(() => {
    userIsCurrentPatient && dispatch(async.handleBannerInteraction(api, loggedInUserId, banner?.id, CLICKED_BANNER_ACTION));
    banner?.action?.metric && trackMetric(banner.action.metric, banner.action.metricProps);

    setBannerInteractedForPatient({
      [banner?.id]: {
        ...(bannerInteractedForPatient[banner?.id] || {}),
        [currentPatientInViewId]: true,
      },
    });
  }, [
    banner?.id,
    banner?.action,
    bannerInteractedForPatient,
    currentPatientInViewId,
    dispatch,
    loggedInUserId,
    setBannerInteractedForPatient,
    trackMetric,
    userIsCurrentPatient,
  ]);

  const handleAsyncResult = useCallback((workingState, successMessage, errorMessage) => {
    const { inProgress, completed } = workingState || {};

    if (!isFirstRender && !inProgress) {
      if (completed) {
        completeClickAction()

        setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: errorMessage,
          variant: 'danger',
        });
      }
    }
  }, [completeClickAction, isFirstRender, setToast]);

  // Send a metric the first time a banner is shown to a patient for the current session
  useEffect(() => {
    if(banner?.show?.metric && !bannerShownMetricsForPatient[banner.id]?.[currentPatientInViewId]) {
      setBannerShownMetricsForPatient({
        [banner.id]: {
          ...(bannerShownMetricsForPatient[banner.id] || {}),
          [currentPatientInViewId]: true,
        },
      });

      trackMetric(banner.show.metric, banner.show?.metricProps);
    }
  }, [banner, bannerShownMetricsForPatient, currentPatientInViewId, setBannerShownMetricsForPatient, trackMetric]);

  useEffect(() => {
    handleAsyncResult(workingState, banner?.action?.working?.successMessage, banner?.action?.working?.errorMessage);
  }, [banner?.id, banner?.action, handleAsyncResult, workingState]);

  // Render nothing if no banner is available
  if (!banner) {
    return null;
  }

  function handleClickMessageLink() {
    isFunction(banner.messageLink?.handler) && banner.messageLink.handler();
    banner.messageLink?.metric && trackMetric(banner.messageLink.metric);
  }

  function handleClickAction() {
    isFunction(banner.action?.handler) && banner.action.handler();

    if (!banner?.action?.working?.key) {
      completeClickAction();
    }
  }

  function handleDismiss() {
    userIsCurrentPatient && dispatch(async.handleBannerInteraction(api, loggedInUserId, banner.id, DISMISSED_BANNER_ACTION));
    isFunction(banner.dismiss?.handler) && banner.dismiss.handler();
    banner.dismiss?.metric && trackMetric(banner.dismiss.metric, banner.dismiss?.metricProps);

    setBannerInteractedForPatient({
      [banner.id]: {
        ...(bannerInteractedForPatient[banner.id] || {}),
        [currentPatientInViewId]: true,
      },
    });
  }

  return (
    <Banner
      id={banner.id}
      label={banner.label}
      message={banner.message}
      title={banner.title}
      actionText={workingState?.inProgress ? banner.action?.processingText : banner.action?.text}
      messageLinkText={banner.messageLink?.text}
      onAction={handleClickAction}
      onClickMessageLink={handleClickMessageLink}
      onDismiss={handleDismiss}
      showIcon={banner.showIcon}
      variant={banner.variant}
    />
  );
};

export default AppBanner;
