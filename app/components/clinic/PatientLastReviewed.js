import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Text, Box, FlexProps } from 'theme-ui';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { utils as vizUtils } from '@tidepool/viz';
import get from 'lodash/get';
import upperFirst from 'lodash/upperFirst';

import HoverButton from '../elements/HoverButton';
import Icon from '../elements/Icon';
import i18next from '../../core/language';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';
import { useToasts } from '../../providers/ToastProvider';

const {
  formatTimeAgo,
  getTimezoneFromTimePrefs,
} = vizUtils.datetime;

const t = i18next.t.bind(i18next);

export const PatientLastReviewed = ({ api, patientId, recentlyReviewedThresholdDate, trackMetric, metricSource }) => {
  const dispatch = useDispatch();
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const patient = clinic?.patients?.[patientId];

  const {
    settingClinicPatientLastReviewed,
    revertingClinicPatientLastReviewed,
  } = useSelector((state) => state.blip.working);

  const handleAsyncResult = useCallback((workingState, successMessage) => {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        successMessage && setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [isFirstRender, setToast]);

  useEffect(() => {
    handleAsyncResult(settingClinicPatientLastReviewed);
  }, [settingClinicPatientLastReviewed]);

  useEffect(() => {
    handleAsyncResult(revertingClinicPatientLastReviewed);
  }, [revertingClinicPatientLastReviewed]);

  const handleReview = () => {
    trackMetric('Clinic - Mark patient reviewed', { clinicId: selectedClinicId, source: metricSource });
    dispatch(actions.async.setClinicPatientLastReviewed(api, selectedClinicId, patient?.id));
  };

  const handleUndo = () => {
    trackMetric('Clinic - Undo mark patient reviewed', { clinicId: selectedClinicId, source: metricSource });
    dispatch(actions.async.revertClinicPatientLastReviewed(api, selectedClinicId, patient?.id));
  };

  let clickHandler = handleReview;
  let buttonText = t('Mark Reviewed');

  let formattedLastReviewed = { daysText: '-' };
  let lastReviewIsToday = false;
  let reviewIsRecent = false;
  let canReview = true;
  let color = 'feedback.warning';

  if (patient?.reviews?.[0]?.time) {
    formattedLastReviewed = formatTimeAgo(patient.reviews[0].time, timePrefs);
    lastReviewIsToday = moment.utc(patient.reviews[0].time).tz(getTimezoneFromTimePrefs(timePrefs)).isSame(moment(), 'day');

    if (lastReviewIsToday) {
      canReview = false;
      clickHandler = null;
    }

    if (moment.utc(patient.reviews[0].time).isSameOrAfter(moment(recentlyReviewedThresholdDate))) {
      reviewIsRecent = true;
    }

    if (lastReviewIsToday && patient.reviews[0].clinicianId === loggedInUserId) {
      clickHandler = handleUndo;
      buttonText = t('Undo');
    };

    if (reviewIsRecent) {
      color = 'feedback.success';
    }
  }

  return (
    <HoverButton
      {...FlexProps}
      buttonText={buttonText}
      buttonProps={{
        onClick: clickHandler,
        variant: 'quickActionCondensed',
        ml: canReview ? -2 : 0,
        processing: settingClinicPatientLastReviewed.inProgress || revertingClinicPatientLastReviewed.inProgress,
      }}
      hideChildrenOnHover={canReview}
    >
      <Box sx={{ whiteSpace: 'nowrap' }}>
        <Text
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: color,
            fontWeight: 'medium',
            whiteSpace: 'nowrap',
          }}
        >
          {reviewIsRecent && <Icon variant="static" icon={CheckRoundedIcon} />}
          {upperFirst(formattedLastReviewed.daysText)}
        </Text>
      </Box>
    </HoverButton>
  );
};

PatientLastReviewed.propTypes = {
  ...FlexProps,
  api: PropTypes.object.isRequired,
  metricSource: PropTypes.string.isRequired,
  patientId: PropTypes.string.isRequired,
  recentlyReviewedThresholdDate: PropTypes.string.isRequired,
  trackMetric: PropTypes.func.isRequired,
}

export default withTranslation()(PatientLastReviewed);
