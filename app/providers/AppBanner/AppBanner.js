import React, { useCallback, useContext, useEffect, useState } from 'react';
import Banner from '../../components/elements/Banner';
import { useDispatch, useSelector } from 'react-redux';
import { isFunction, noop } from 'lodash';
import { AppBannerContext, CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION, SEEN_BANNER_ACTION } from './AppBannerProvider';
import { async } from '../../redux/actions';
import api from '../../core/api';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
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
  const previousWorkingState = usePrevious(workingState);
  const [showModal, setShowModal] = useState(false);
  const [bannerActionClicked, setBannerActionClicked] = useState(false);

  const completeClickAction = useCallback(() => {
    userIsCurrentPatient && dispatch(async.handleBannerInteraction(api, loggedInUserId, banner?.interactionId, CLICKED_BANNER_ACTION));
    showModal && setShowModal(false);

    setBannerInteractedForPatient({
      [banner?.interactionId]: {
        ...(bannerInteractedForPatient[banner?.interactionId] || {}),
        [currentPatientInViewId]: true,
      },
    });

    // Reset the banner action clicked state to false whenever the click action is completed
    setBannerActionClicked(false);
  }, [
    banner?.interactionId,
    bannerInteractedForPatient,
    currentPatientInViewId,
    dispatch,
    loggedInUserId,
    setBannerInteractedForPatient,
    showModal,
    userIsCurrentPatient,
  ]);

  const handleAsyncResult = useCallback((workingState, successMessage, errorMessage) => {
    const { inProgress, completed, notification, prevInProgress } = workingState;

    if (bannerActionClicked && !isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        completeClickAction();

        setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: errorMessage || notification?.message || 'An error occurred',
          variant: 'danger',
        });
      }
    }
  }, [completeClickAction, isFirstRender, bannerActionClicked, setToast]);

  useEffect(() => {
    // Send a metric the first time a banner is shown to a patient for the current session
    if(banner?.show?.metric && !bannerShownForPatient[banner.interactionId]?.[currentPatientInViewId]) {
      setBannerShownForPatient({
        [banner.interactionId]: {
          ...(bannerShownForPatient[banner.interactionId] || {}),
          [currentPatientInViewId]: true,
        },
      });

      trackMetric(banner.show.metric, banner.show?.metricProps);

      // Update banner show count if necessary
      if (banner?.maxUniqueDaysShown) {
        dispatch(async.handleBannerInteraction(api, loggedInUserId, banner.interactionId, SEEN_BANNER_ACTION));
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
    // Reset the banner action clicked state to false whenever the banner changes
    setBannerActionClicked(false);
  }, [banner?.id]);

  useEffect(() => {
    handleAsyncResult({ ...workingState, prevInProgress: previousWorkingState?.inProgress}, banner?.action?.working?.successMessage, banner?.action?.working?.errorMessage);
  }, [banner?.id, banner?.action, handleAsyncResult, workingState, previousWorkingState?.inProgress]);

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
    // We set the banner action clicked state to true to prevent reacting to working state changes that were initiated by other components.
    setBannerActionClicked(true);

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
    userIsCurrentPatient && dispatch(async.handleBannerInteraction(api, loggedInUserId, banner.interactionId, DISMISSED_BANNER_ACTION));
    isFunction(banner.dismiss?.handler) && banner.dismiss.handler();
    banner.dismiss?.metric && trackMetric(banner.dismiss.metric, banner.dismiss?.metricProps);

    setBannerInteractedForPatient({
      [banner.interactionId]: {
        ...(bannerInteractedForPatient[banner.interactionId] || {}),
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
