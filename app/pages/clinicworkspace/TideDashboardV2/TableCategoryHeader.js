import React from 'react';
import { useSelector } from 'react-redux';
import { CATEGORY } from './FilterByCategory';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import { colors as vizColors, utils as vizUtils } from '@tidepool/viz';
import utils from '../../../core/utils';
import { MGDL_UNITS } from '../../../core/constants';

const { ADA_STANDARD_BG_BOUNDS } = vizUtils.constants;

const formatThreshold = (value, bgUnits) => bgUnits === MGDL_UNITS
  ? value
  : utils.formatDecimal(value, 1);

const useCategoryHeaderCopy = () => {
  const { t } = useTranslation();
  const category = useSelector(state => state.blip.tideDashboard.category);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const bgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const bounds = ADA_STANDARD_BG_BOUNDS[bgUnits];
  const veryLowThreshold = formatThreshold(bounds.veryLowThreshold, bgUnits);
  const targetLowerBound = formatThreshold(bounds.targetLowerBound, bgUnits);
  const targetUpperBound = formatThreshold(bounds.targetUpperBound, bgUnits);
  const veryHighThreshold = formatThreshold(bounds.veryHighThreshold, bgUnits);

  switch(category) {
    case CATEGORY.VERY_LOW:
      return {
        title: t('Very Low'),
        label: t('≥ 1% Time below {{ veryLowThreshold }} {{ bgUnits }}', { veryLowThreshold, bgUnits }),
      };
    case CATEGORY.ANY_LOW:
      return {
        title: t('Low'),
        label: t('≥ 4% Time below {{ targetLowerBound }} {{ bgUnits }}', { targetLowerBound, bgUnits }),
      };
    case CATEGORY.DROP_IN_TIR:
      return {
        title: t('Large Drop in Time in Range'),
        label: t('≥ 15%'),
      };
    case CATEGORY.ANY_HIGH:
      return {
        title: t('High'),
        label: t('≥ 25% Time above {{ targetUpperBound }} {{ bgUnits }}', { targetUpperBound, bgUnits }),
      };
    case CATEGORY.VERY_HIGH:
      return {
        title: t('Very High'),
        label: t('≥ 5% Time above {{ veryHighThreshold }} {{ bgUnits }}', { veryHighThreshold, bgUnits }),
      };
    case CATEGORY.LOW_CGM_WEAR:
      return {
        title: t('Low CGM Wear Time'),
        label: t('< 70%'),
      };
    case CATEGORY.TARGET:
      return {
        title: t('Meeting Targets'),
        label: '',
      };
    case CATEGORY.DEFAULT:
    default:
      return { title: '', label: '' };
  }
};

const TableCategoryHeader = () => {
  const { title, label } = useCategoryHeaderCopy();

  return <Box sx={{ minHeight: '24px' }} mt={5} mb={1} ml={2}>
    <Text sx={{ fontSize: 2, fontWeight: 'medium', color: vizColors.purple90 }} mr={2}>
      {title}
    </Text>
    <Text sx={{ fontSize: 2, fontWeight: 'normal', color: vizColors.purple90 }}>
      {label}
    </Text>
  </Box>;
};

export default TableCategoryHeader;
