import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { SelectCategory, Tab } from '../components/SelectCategory';
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
    <SelectCategory>
      <Tab selected={category === DEFAULT} onClick={() => handleChange(DEFAULT)}>{t('All Patients')}</Tab>
      <Tab selected={category === VERY_LOW} onClick={() => handleChange(VERY_LOW)}>{t('Very Low')}</Tab>
      <Tab selected={category === LOW} onClick={() => handleChange(LOW)}>{t('Low')}</Tab>
      <Tab selected={category === DROP_IN_TIR} onClick={() => handleChange(DROP_IN_TIR)}>{t('Drop in TIR')}</Tab>
      <Tab selected={category === HIGH} onClick={() => handleChange(HIGH)}>{t('High')}</Tab>
      <Tab selected={category === VERY_HIGH} onClick={() => handleChange(VERY_HIGH)}>{t('Very High')}</Tab>
      <Tab selected={category === LOW_CGM_WEAR} onClick={() => handleChange(LOW_CGM_WEAR)}>{t('Low CGM Wear Time')}</Tab>
      <Tab selected={category === MEETING_TARGETS} onClick={() => handleChange(MEETING_TARGETS)}>{t('Meeting Targets')}</Tab>
    </SelectCategory>
  );
};

export default FilterByCategory;
