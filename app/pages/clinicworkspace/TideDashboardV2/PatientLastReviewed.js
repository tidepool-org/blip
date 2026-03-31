import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Text, Box, FlexProps } from 'theme-ui';
import moment from 'moment-timezone';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { utils as vizUtils } from '@tidepool/viz';
import upperFirst from 'lodash/upperFirst';

import HoverButton from '../../../components/elements/HoverButton';
import Icon from '../../../components/elements/Icon';
import { useToasts } from '../../../providers/ToastProvider';
import { useSetClinicPatientLastReviewedMutation, useRevertClinicPatientLastReviewedMutation } from './tideDashboardApi';

const {
  formatTimeAgo,
  getTimezoneFromTimePrefs,
} = vizUtils.datetime;

const trackMetric = () => {};

const recentlyReviewedThresholdDate = null;

const PatientLastReviewed = ({ patient }) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const patientId = patient?.id;

  const [setClinicPatientLastReviewed, { isLoading: isSetting }] = useSetClinicPatientLastReviewedMutation();
  const [revertClinicPatientLastReviewed, { isLoading: isReverting }] = useRevertClinicPatientLastReviewedMutation();

  const handleReview = () => {
    // trackMetric('Clinic - Mark patient reviewed', { clinicId: selectedClinicId, source: metricSource });
    setClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId });
    // onReview && onReview();
  };

  const handleUndo = () => {
    // trackMetric('Clinic - Undo mark patient reviewed', { clinicId: selectedClinicId, source: metricSource });
    revertClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId });
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
    <Box sx={{ minWidth: '120px' }}>
      <HoverButton
        {...FlexProps}
        buttonText={buttonText}
        buttonProps={{
          onClick: clickHandler,
          variant: 'quickActionCondensed',
          ml: canReview ? -2 : 0,
          processing: isSetting || isReverting,
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
    </Box>
  );
};

export default PatientLastReviewed;
