import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { SegmentedControl, Segment } from '../../components/SegmentedControl';
import { setCategory, setOffset } from '../connectionIssuesSlice';

export const CATEGORY = {
  DEFAULT: 'DEFAULT',
  STALE_DATA: 'STALE_DATA',
  ERROR_OR_DC: 'ERROR_OR_DC',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  INVITE_SENT: 'INVITE_SENT',
  HIDDEN: 'HIDDEN',
};

const { DEFAULT, STALE_DATA, ERROR_OR_DC, INVITE_EXPIRED, INVITE_SENT, HIDDEN } = CATEGORY;

const FilterByCategory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const category = useSelector(state => state.blip.connectionIssues.category);

  const handleChange = (category) => {
    dispatch(setCategory(category));
    dispatch(setOffset(0));
  };

  return (
    <SegmentedControl>
      <Segment selected={category === DEFAULT} onClick={() => handleChange(DEFAULT)}>{t('All Issues')}</Segment>
      <Segment selected={category === STALE_DATA} onClick={() => handleChange(STALE_DATA)}>{t('Stale Data')}</Segment>
      <Segment selected={category === ERROR_OR_DC} onClick={() => handleChange(ERROR_OR_DC)}>{t('Disconnected or Error')}</Segment>
      <Segment selected={category === INVITE_EXPIRED} onClick={() => handleChange(INVITE_EXPIRED)}>{t('Invite Expired')}</Segment>
      <Segment selected={category === INVITE_SENT} onClick={() => handleChange(INVITE_SENT)}>{t('Invite Sent')}</Segment>
      <Segment selected={category === HIDDEN} onClick={() => handleChange(HIDDEN)}>{t('Hidden Issues')}</Segment>
    </SegmentedControl>
  );
};

export default FilterByCategory;
