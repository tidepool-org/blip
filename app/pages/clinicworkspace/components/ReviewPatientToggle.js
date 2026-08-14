import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Text, Box, FlexProps } from 'theme-ui';
import moment from 'moment-timezone';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { utils as vizUtils } from '@tidepool/viz';
import noop from 'lodash/noop';
import upperFirst from 'lodash/upperFirst';

import HoverButton from '../../../components/elements/HoverButton';
import Icon from '../../../components/elements/Icon';
import useClinicMetricsPageName from '../useClinicMetricsPageName';
import { trackMetric } from '../../../core/metricUtils';
const { formatTimeAgo, getTimezoneFromTimePrefs } = vizUtils.datetime;

const ReviewPatientToggle = ({
  patient,
  onReview = noop,
  onUndo = noop,
  disabled = false,
  recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString(),
}) => {
  const { t } = useTranslation();
  const pageName = useClinicMetricsPageName();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const timePrefs = useSelector((state) => state.blip.timePrefs);

  const handleReview = () => {
    trackMetric('Clinic - Mark patient reviewed', { clinicId: selectedClinicId, pageName });
    onReview();
  };

  const handleUndo = () => {
    trackMetric('Clinic - Undo mark patient reviewed', { clinicId: selectedClinicId, pageName });
    onUndo();
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
          disabled,
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

ReviewPatientToggle.propTypes = {
  patient: PropTypes.object,
  onReview: PropTypes.func,
  onUndo: PropTypes.func,
  disabled: PropTypes.bool,
  recentlyReviewedThresholdDate: PropTypes.string,
};

export default ReviewPatientToggle;
