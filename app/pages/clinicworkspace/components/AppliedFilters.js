import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, withTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';

import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';

import Icon from '../../../components/elements/Icon';
import { transitions } from '../../../themes/baseTheme';
import { SPECIAL_FILTER_STATES } from '../useClinicPatientsFilters';

const getLastDataTypeLabel = (t, lastDataType) => ({
  cgm: t('CGM'),
  bgm: t('BGM'),
}[lastDataType]);

const getCgmUsePercentLabel = (t, timeCGMUsePercent) => ({
  '<0.7': t('CGM Use less than 70%'),
  '>=0.7': t('CGM Use 70% or more'),
}[timeCGMUsePercent]);

const getTimeInRangeLabel = (t, rangeKey) => ({
  timeInExtremeHighPercent: t('Time in Range: Highest'),
  timeInVeryHighPercent: t('Time in Range: Very High'),
  timeInAnyHighPercent: t('Time in Range: High'),
  timeInTargetPercent: t('Time in Range: Not Meeting Target'),
  timeInAnyLowPercent: t('Time in Range: Low'),
  timeInVeryLowPercent: t('Time in Range: Very Low'),
}[rangeKey]);

// A single filter value rendered as an underlined label. Hovering the label
// reveals an inline X icon which, when clicked, removes the filter. Because the
// X icon occupies layout space when revealed, subsequent labels shift to the
// right on hover.
const RemovableLabel = withTranslation()(({ t, label, onRemove }) => (
  <Flex
    as="span"
    className="applied-filter-label"
    sx={{
      alignItems: 'center',
      color: vizColors.indigo50,
      fontSize: 0,
      fontWeight: 'medium',
      cursor: 'default',
      '.remove-filter-icon': {
        width: 0,
        ml: 0,
        opacity: 0,
        overflow: 'hidden',
        transition: transitions.easeOut,
      },
      '&:hover .remove-filter-icon': {
        width: '14px',
        ml: 1,
        opacity: 1,
      },
    }}
  >
    <Text sx={{ textDecoration: 'underline', whiteSpace: 'nowrap' }}>{label}</Text>
    <Icon
      className="remove-filter-icon"
      variant="static"
      icon={CloseRoundedIcon}
      label={t('Remove {{ label }} filter', { label })}
      onClick={onRemove}
      sx={{ fontSize: '14px', color: vizColors.indigo50, flexShrink: 0 }}
    />
  </Flex>
));

// A group of applied filter values, optionally prefixed with a descriptive
// icon and/or text. Renders nothing when it has no values.
const FilterGroup = ({ prefixIcon, prefixText, items, onRemove }) => {
  if (!items?.length) return null;

  return (
    <Flex sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      { (prefixIcon || prefixText) &&
        <Flex sx={{ alignItems: 'center', gap: 1, color: vizColors.gray50, flexShrink: 0 }}>
          {prefixIcon}
          {prefixText && <Text sx={{ fontSize: 0 }}>{prefixText}</Text>}
        </Flex>
      }

      {items.map(item => (
        <RemovableLabel
          key={item.id}
          label={item.label}
          onRemove={() => onRemove(item)}
        />
      ))}
    </Flex>
  );
};

const AppliedFilters = ({ filters, onRemoveFilter = noop }) => {
  const { t } = useTranslation();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientTagOptions = clinic?.patientTags;
  const clinicSiteOptions = clinic?.sites;
  const patientCount = clinic?.fetchedPatientCount || 0;

  const {
    lastData,
    lastDataType,
    timeCGMUsePercent,
    timeInRange = [],
    patientTags = [],
    clinicSites = [],
  } = filters;

  const hasActiveFilters = !!(
    lastData ||
    lastDataType ||
    timeCGMUsePercent ||
    timeInRange.length > 0 ||
    patientTags.length > 0 ||
    clinicSites.length > 0
  );

  if (!hasActiveFilters) return null;

  const removeItem = item => onRemoveFilter(item.filterKey, item.value);

  const primaryItems = [];

  // lastData and lastDataType are always set together, so they render (and are removed) as one item.
  if (lastData && lastDataType) {
    primaryItems.push({
      id: 'lastData',
      label: t('{{ type }} data within {{ count }} days', {
        type: getLastDataTypeLabel(t, lastDataType),
        count: lastData,
      }),
      filterKey: 'lastData',
      value: null,
    });
  }

  if (timeCGMUsePercent) {
    primaryItems.push({
      id: 'timeCGMUsePercent',
      label: getCgmUsePercentLabel(t, timeCGMUsePercent),
      filterKey: 'timeCGMUsePercent',
      value: null,
    });
  }

  timeInRange.forEach(rangeKey => {
    const label = getTimeInRangeLabel(t, rangeKey);
    if (label) primaryItems.push({ id: `timeInRange-${rangeKey}`, label, filterKey: 'timeInRange', value: rangeKey });
  });

  const isZeroTags = isEqual(patientTags, SPECIAL_FILTER_STATES.ZERO_TAGS);
  const patientTagItems = isZeroTags
    ? [{ id: 'patientTags-zero', label: t('Without any tags'), filterKey: 'patientTags', value: SPECIAL_FILTER_STATES.ZERO_TAGS[0] }]
    : patientTags
        .map(id => ({ id: `patientTags-${id}`, label: find(patientTagOptions, { id })?.name, filterKey: 'patientTags', value: id }))
        .filter(item => item.label);

  const isZeroSites = isEqual(clinicSites, SPECIAL_FILTER_STATES.ZERO_SITES);
  const clinicSiteItems = isZeroSites
    ? [{ id: 'clinicSites-zero', label: t('Without any sites'), filterKey: 'clinicSites', value: SPECIAL_FILTER_STATES.ZERO_SITES[0] }]
    : clinicSites
        .map(id => ({ id: `clinicSites-${id}`, label: find(clinicSiteOptions, { id })?.name, filterKey: 'clinicSites', value: id }))
        .filter(item => item.label);

  return (
    <Flex
      id="clinic-patients-active-filters"
      mb={3}
      px={3}
      py={2}
      sx={{
        alignItems: 'center',
        columnGap: '24px',
        rowGap: '8px',
        flexWrap: 'wrap',
        bg: vizColors.indigo00,
        borderRadius: '8px',
      }}
    >
      <Flex sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', color: vizColors.gray50, fontSize: 0 }}>
        {t('Showing {{ count }} patients', { count: patientCount })}
      </Flex>

      <FilterGroup
        prefixText={t('with')}
        items={primaryItems}
        onRemove={removeItem}
      />

      <FilterGroup
        prefixIcon={<Text sx={{ fontSize: 1, fontWeight: 'bold', color: vizColors.gray50 }}>#</Text>}
        prefixText={t('tagged')}
        items={patientTagItems}
        onRemove={removeItem}
      />

      <FilterGroup
        prefixIcon={<Icon variant="static" icon={LocationOnOutlinedIcon} label={t('Sites filter')} cursor="default" tabIndex={-1} sx={{ fontSize: 1 }} />}
        prefixText={t('visiting')}
        items={clinicSiteItems}
        onRemove={removeItem}
      />
    </Flex>
  );
};

export default AppliedFilters;
