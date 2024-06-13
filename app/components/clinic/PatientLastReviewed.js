import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, FlexProps } from 'theme-ui';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { utils as vizUtils } from '@tidepool/viz';

import HoverButton from '../elements/HoverButton';
import Icon from '../elements/Icon';
import i18next from '../../core/language';

const {
  formatTimeAgo,
  getTimezoneFromTimePrefs,
} = vizUtils.datetime;

const t = i18next.t.bind(i18next);

export const PatientLastReviewed = ({ patient, recentlyReviewedThresholdDate }) => {
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const timePrefs = useSelector((state) => state.blip.timePrefs);

  const handleReview = () => {
    console.log('handleReview', patient?.fullName);
  };

  const handleUndo = () => {
    console.log('handleUndo', patient?.fullName);
  };

  let clickHandler = handleReview;
  let buttonText = t('Mark Reviewed');

  let formattedLastReviewedDate = { text: '-' };
  let lastReviewIsToday = false;
  let reviewIsRecent = false;
  let canReview = true;
  let color = 'feedback.warning';

  if (patient?.lastReviewed?.time) {
    formattedLastReviewedDate = formatTimeAgo(patient.lastReviewed.time, timePrefs);
    lastReviewIsToday = moment.utc(patient.lastReviewed.time).tz(getTimezoneFromTimePrefs(timePrefs)).isSame(moment(), 'day');

    if (lastReviewIsToday) {
      canReview = false;
      clickHandler = null;
    }

    if (moment.utc(patient.lastReviewed.time).isSameOrAfter(moment(recentlyReviewedThresholdDate))) {
      reviewIsRecent = true;
    }

    if (lastReviewIsToday && patient?.previousLastReviewed?.time && (patient.previousLastReviewed.clinicianId === loggedInUserId)) {
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
          {formattedLastReviewedDate.text}
        </Text>
      </Box>
    </HoverButton>
  );
};

PatientLastReviewed.propTypes = {
  ...FlexProps,
  patient: PropTypes.object,
  recentlyReviewedThresholdDate: PropTypes.string.isRequired,
}

export default withTranslation()(PatientLastReviewed);
