import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { CategorySegmentedControl, Segment } from '../components/CategorySegmentedControl';
import { setCategory, setOffset } from './deviceIssuesSlice';

export const CATEGORY = {
  DEFAULT: 'DEFAULT',
  STALE_DATA: 'STALE_DATA',
  DISCONNECTED: 'DISCONNECTED',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  INVITE_SENT: 'INVITE_SENT',
  HIDDEN: 'HIDDEN',
};

const { DEFAULT, STALE_DATA, DISCONNECTED, INVITE_EXPIRED, INVITE_SENT, HIDDEN } = CATEGORY;

const FilterByCategory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const category = useSelector(state => state.blip.deviceIssues.category);

  const handleChange = (category) => {
    dispatch(setCategory(category));
    dispatch(setOffset(0));
  };

  return (
    <CategorySegmentedControl>
      <Segment selected={category === DEFAULT} onClick={() => handleChange(DEFAULT)}>{t('All Issues')}</Segment>
      <Segment selected={category === STALE_DATA} onClick={() => handleChange(STALE_DATA)}>{t('Stale Data')}</Segment>
      <Segment selected={category === DISCONNECTED} onClick={() => handleChange(DISCONNECTED)}>{t('Disconnected or Error')}</Segment>
      <Segment selected={category === INVITE_EXPIRED} onClick={() => handleChange(INVITE_EXPIRED)}>{t('Invite Expired')}</Segment>
      <Segment selected={category === INVITE_SENT} onClick={() => handleChange(INVITE_SENT)}>{t('Invite Sent')}</Segment>
      <Segment selected={category === HIDDEN} onClick={() => handleChange(HIDDEN)}>{t('Hidden Issues')}</Segment>
    </CategorySegmentedControl>
  );
};

export default FilterByCategory;
