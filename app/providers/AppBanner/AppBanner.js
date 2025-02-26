import React, { useCallback, useContext, useEffect, useState } from 'react';
import Banner from '../../components/elements/Banner';
import { useDispatch, useSelector } from 'react-redux';
import { isFunction, noop } from 'lodash';
import { AppBannerContext, CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION, SEEN_BANNER_ACTION } from './AppBannerProvider';
import { async } from '../../redux/actions';
import api from '../../core/api';
import { useIsFirstRender } from '../../core/hooks';
import { useToasts } from '../ToastProvider';

const AppBanner = ({ trackMetric }) => {
  // Use the banner context
  const {
    banner,
    bannerShownForPatient,
    setBannerShownForPatient,
    bannerInteractedForPatient,
    setBannerInteractedForPatient,
    setFormikContext,
  } = useContext(AppBannerContext);

  const dispatch = useDispatch();
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const userIsCurrentPatient = loggedInUserId && loggedInUserId === currentPatientInViewId;
  const isFirstRender = useIsFirstRender();
  const working = useSelector(state => state.blip.working);
  const { set: setToast } = useToasts();
  const workingState = working[banner?.action?.working?.key];
  const [showModal, setShowModal] = useState(false);

  const completeClickAction = useCallback(() => {
    userIsCurrentPatient && dispatch(async.handleBannerInteraction(api, loggedInUserId, banner?.id, CLICKED_BANNER_ACTION));
    showModal && setShowModal(false);

    setBannerInteractedForPatient({
      [banner?.id]: {
        ...(bannerInteractedForPatient[banner?.id] || {}),
        [currentPatientInViewId]: true,
      },
    });
  }, [
    banner?.id,
    bannerInteractedForPatient,
    currentPatientInViewId,
    dispatch,
    loggedInUserId,
    setBannerInteractedForPatient,
    showModal,
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

  useEffect(() => {
    // Send a metric the first time a banner is shown to a patient for the current session
    if(banner?.show?.metric && !bannerShownForPatient[banner.id]?.[currentPatientInViewId]) {
      setBannerShownForPatient({
        [banner.id]: {
          ...(bannerShownForPatient[banner.id] || {}),
          [currentPatientInViewId]: true,
        },
      });

      trackMetric(banner.show.metric, banner.show?.metricProps);

      // Update banner show count if necessary
      if (banner?.maxUniqueDaysShown) {
        dispatch(async.handleBannerInteraction(api, loggedInUserId, banner.id, SEEN_BANNER_ACTION));
      }
    }
  }, [
    banner,
    bannerShownForPatient,
    dispatch,
    currentPatientInViewId,
    loggedInUserId,
    setBannerShownForPatient,
    trackMetric
  ]);

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
    if (banner.messageLink?.trackInteraction) completeClickAction();
  }

  function handleClickAction() {
    banner.action?.metric && trackMetric(banner.action.metric, banner.action.metricProps);

    if (banner.action?.modal?.component) {
      // If the banner has a modal, show it instead of executing the action
      // The action will be executed when the modal is confirmed
      setShowModal(true);
      return;
    }

    isFunction(banner.action?.handler) && banner.action.handler();

    if (!banner.action?.working?.key) {
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
    <>
      <Banner
        id={banner.id}
        label={banner.label}
        message={banner.message}
        title={banner.title}
        actionText={workingState?.inProgress ? banner.action?.processingText || banner.action?.text : banner.action?.text}
        messageLinkText={banner.messageLink?.text}
        onAction={handleClickAction}
        onClickMessageLink={handleClickMessageLink}
        onDismiss={handleDismiss}
        showIcon={banner.showIcon}
        variant={banner.variant}
      />

      {banner.action?.modal?.component && (
        <banner.action.modal.component
          {...banner.action.modal.props}
          {...{[banner.action.modal.confirmHandlerProp || 'onConfirm']: banner.action.handler}}
          onClose={() => setShowModal(false)}
          onFormChange={formikContext => setFormikContext(formikContext)}
          open={showModal}
          processing={workingState?.inProgress}
          trackMetric={trackMetric}
        />
      )}
    </>
  );
};

export default AppBanner;
