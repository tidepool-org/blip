import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { CategorySegmentedControl, Segment } from '../components/CategorySegmentedControl';
import { setCategory } from './tideDashboardSlice';

export const CATEGORY_TAB = {
  DEFAULT: 'DEFAULT',
  VERY_LOW: 'VERY_LOW',
  LOW: 'LOW',
  DROP_IN_TIR: 'DROP_IN_TIR',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
  LOW_CGM_WEAR: 'LOW_CGM_WEAR',
  MEETING_TARGETS: 'MEETING_TARGETS',
};

const { DEFAULT, VERY_LOW, LOW, DROP_IN_TIR, HIGH, VERY_HIGH, LOW_CGM_WEAR, MEETING_TARGETS } = CATEGORY_TAB;

const FilterByCategory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const category = useSelector(state => state.blip.tideDashboard.category);

  const handleChange = (category) => dispatch(setCategory(category));

  return (
    <CategorySegmentedControl>
      <Segment selected={category === DEFAULT} onClick={() => handleChange(DEFAULT)}>{t('All Patients')}</Segment>
      <Segment selected={category === VERY_LOW} onClick={() => handleChange(VERY_LOW)}>{t('Very Low')}</Segment>
      <Segment selected={category === LOW} onClick={() => handleChange(LOW)}>{t('Low')}</Segment>
      <Segment selected={category === DROP_IN_TIR} onClick={() => handleChange(DROP_IN_TIR)}>{t('Drop in TIR')}</Segment>
      <Segment selected={category === HIGH} onClick={() => handleChange(HIGH)}>{t('High')}</Segment>
      <Segment selected={category === VERY_HIGH} onClick={() => handleChange(VERY_HIGH)}>{t('Very High')}</Segment>
      <Segment selected={category === LOW_CGM_WEAR} onClick={() => handleChange(LOW_CGM_WEAR)}>{t('Low CGM Wear Time')}</Segment>
      <Segment selected={category === MEETING_TARGETS} onClick={() => handleChange(MEETING_TARGETS)}>{t('Meeting Targets')}</Segment>
    </CategorySegmentedControl>
  );
};

export default FilterByCategory;
