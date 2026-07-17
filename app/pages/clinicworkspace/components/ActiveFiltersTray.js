import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, withTranslation } from 'react-i18next';
import { Flex, Text, Box } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import TagIcon from '../../../core/icons/tagIcon.svg';

import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';

import Icon from '../../../components/elements/Icon';
import { transitions } from '../../../themes/baseTheme';
import { SPECIAL_FILTER_STATES } from '../useClinicPatientsFilters';

const usePrimaryChips = (activeFilters) => {
  const { t } = useTranslation();
  const { lastData, lastDataType, timeCGMUsePercent, timeInRange = [] } = activeFilters;

  const getLastDataChipChipLabel = (lastDataType, lastData, t) => ({
    bgm: t('BGM data within {{ count }} days', { count: lastData }),
    cgm: t('CGM data within {{ count }} days', { count: lastData }),
  }[lastDataType]);

  const getTimeCGMUsePercentChipLabel = (timeCGMUsePercent, t) => ({
    '<0.7': t('< 70% CGM use'),
    '>=0.7': t('≥ 70% CGM use'),
  }[timeCGMUsePercent]);

  const getTimeInRangeChipLabel = (rangeKey, t) => ({
    timeInExtremeHighPercent: t('%TIR = Highest'),
    timeInVeryHighPercent: t('%TIR = Very High'),
    timeInAnyHighPercent: t('%TIR = High'),
    timeInTargetPercent: t('%TIR = Meeting Targets'),
    timeInAnyLowPercent: t('%TIR = Low'),
    timeInVeryLowPercent: t('%TIR = Very Low'),
  }[rangeKey]);

  return [
    // Data Recency Filter
    (lastData && lastDataType && {
      type: 'lastData',
      value: `${lastDataType}-${lastData}`,
      label: getLastDataChipChipLabel(lastDataType, lastData, t),
    }),

    // CGM Wear Time Filter
    (timeCGMUsePercent && {
      type: 'timeCGMUsePercent',
      value: timeCGMUsePercent,
      label: getTimeCGMUsePercentChipLabel(timeCGMUsePercent, t),
    }),

    // Time In Range Filters
    ...timeInRange.map(rangeKey => ({
      type: 'timeInRange',
      value: rangeKey,
      label: getTimeInRangeChipLabel(rangeKey, t),
    })),
  ].filter(Boolean);
};

const useTagChips = (patientTags = []) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  if (isEqual(patientTags, SPECIAL_FILTER_STATES.ZERO_TAGS)) {
    return [{
      type: 'patientTags',
      value: SPECIAL_FILTER_STATES.ZERO_TAGS[0],
      label: t('No tags'),
    }];
  }

  return patientTags
    .map(id => ({
      type: 'patientTags',
      value: id,
      label: find(clinic?.patientTags, { id })?.name,
    }))
    .filter(chip => chip.label);
};

const useSiteChips = (clinicSites = []) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  if (isEqual(clinicSites, SPECIAL_FILTER_STATES.ZERO_SITES)) {
    return [{
      type: 'clinicSites',
      value: SPECIAL_FILTER_STATES.ZERO_SITES[0],
      label: t('No clinic sites'),
    }];
  }

  return clinicSites
    .map(id => ({
      type: 'clinicSites',
      value: id,
      label: find(clinic?.sites, { id })?.name,
    }))
    .filter(chip => chip.label);
};

const Chip = withTranslation()(({ t, label, onRemove }) => (
  <Flex
    as="span"
    className="applied-filter-label"
    sx={{
      alignItems: 'center',
      color: vizColors.blue60,
      fontSize: 0,
      fontWeight: 'normal',
      cursor: 'default',
      ml: 1,
      '&:hover': {
        color: vizColors.blue80,
        fontWeight: 'medium',
      },
      '.remove-filter-icon': {
        color: vizColors.blue80,
        minWidth: 0,
        width: 0,
        mr: 1,
        opacity: 0,
        overflow: 'hidden',
        transition: transitions.easeOut,
      },
      '&:hover .remove-filter-icon': {
        width: '14px',
        ml: 1,
        mr: 1,
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

const ChipGroup = ({ prefix, chips, onRemove }) => {
  if (!chips?.length) return null;

  return (
    <Flex mr={2} sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', color: vizColors.blue30 }}>
      {prefix}

      {chips.map(chip => (
        <Chip
          key={`${chip.type}-${chip.value || 'filter'}`}
          label={chip.label}
          onRemove={() => onRemove(chip)}
        />
      ))}
    </Flex>
  );
};

const ActiveFiltersTray = ({
  filters = {},
  hasSearchActive = false,
  onRemoveFilter = noop,
  rightContent = null,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const primaryChips = usePrimaryChips(filters);
  const tagChips = useTagChips(filters.patientTags);
  const siteChips = useSiteChips(filters.clinicSites);

  const count = clinic?.fetchedPatientCount || 0;

  const handleRemoveChip = chip => onRemoveFilter(chip.type, chip.value);

  return (
    <Flex
      id="clinic-patients-active-filters"
      px={3}
      py={2}
      sx={{
        alignItems: 'flex-start',
        gap: '4px',
        flexWrap: 'nowrap',
        bg: vizColors.indigo00,
        borderTopRightRadius: '8px',
        borderTopLeftRadius: '8px',
        borderBottom: `1px solid ${vizColors.blueGray30}`,
      }}
    >
      <Flex
        sx={{
          flex: 1,
          minWidth: 0,
          alignItems: 'center',
          columnGap: '4px',
          rowGap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Flex sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', color: vizColors.blue30, fontSize: 0 }}>
          { hasSearchActive
              ? t('Showing {{ count }} patients that match your search', { count })
              : t('Showing {{ count }} patients', { count })
          }
        </Flex>

        <ChipGroup
          chips={primaryChips}
          onRemove={handleRemoveChip}
          prefix={<Text sx={{ fontSize: 0 }}>{t('with')}</Text>}
        />

        <ChipGroup
          chips={tagChips}
          onRemove={handleRemoveChip}
          prefix={<Flex sx={{ alignItems: 'center' }}>
            <Icon variant="static" iconSrc={TagIcon} sx={{ fontSize: 1, mr: 1 }} />
            <Text sx={{ fontSize: 0 }}>{t('tagged')}</Text>
          </Flex>}
        />

        <ChipGroup
          chips={siteChips}
          onRemove={handleRemoveChip}
          prefix={<Flex sx={{ alignItems: 'center' }}>
            <Icon variant="static" icon={LocationOnOutlinedIcon} sx={{ fontSize: 1, mr: 1 }} />
            <Text sx={{ fontSize: 0 }}>{t('visiting')}</Text>
          </Flex>}
        />
      </Flex>

      {rightContent && (
        <Flex sx={{ alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {rightContent}
        </Flex>
      )}
    </Flex>
  );
};

export default ActiveFiltersTray;
