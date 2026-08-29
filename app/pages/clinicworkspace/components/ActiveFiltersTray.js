import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Flex, Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import TagIcon from '../../../core/icons/tagIcon.svg';

import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';

import Icon from '../../../components/elements/Icon';
import utils from '../../../core/utils';
import { transitions } from '../../../themes/baseTheme';
import { SPECIAL_FILTER_STATES } from '../useClinicPatientsFilters';
import useClinic from '../useClinic';

const usePrimaryChips = (activeFilters, requiredFilters) => {
  const { t } = useTranslation();
  const { lastData, lastDataType, timeCGMUsePercent, timeInRange = [] } = activeFilters;

  const getLastDataChipLabel = (lastDataType, lastData) => ({
    bgm: t('BGM data within {{ count }} days', { count: lastData }),
    cgm: t('CGM data within {{ count }} days', { count: lastData }),
  }[lastDataType]);

  const getTimeCGMUsePercentChipLabel = (timeCGMUsePercent) => ({
    '<0.7': t('< 70% CGM use'),
    '>=0.7': t('≥ 70% CGM use'),
  }[timeCGMUsePercent]);

  const getTimeInRangeChipLabel = (rangeKey) => ({
    timeInExtremeHighPercent: t('%TIR = Extremely High'),
    timeInVeryHighPercent: t('%TIR = Very High'),
    timeInAnyHighPercent: t('%TIR = High'),
    timeInTargetPercent: t('%TIR = Not in Range'),
    timeInAnyLowPercent: t('%TIR = Low'),
    timeInVeryLowPercent: t('%TIR = Very Low'),
  }[rangeKey]);

  return [
    // Data Recency Filter
    (lastData && lastDataType && {
      type: 'lastData',
      value: `${lastDataType}-${lastData}`,
      label: getLastDataChipLabel(lastDataType, lastData),
      required: requiredFilters?.['lastData'] || false,
    }),

    // CGM Wear Time Filter
    (timeCGMUsePercent && {
      type: 'timeCGMUsePercent',
      value: timeCGMUsePercent,
      label: getTimeCGMUsePercentChipLabel(timeCGMUsePercent),
    }),

    // Time In Range Filters
    ...timeInRange.map(rangeKey => ({
      type: 'timeInRange',
      value: rangeKey,
      label: getTimeInRangeChipLabel(rangeKey),
    })),
  ].filter(Boolean);
};

const useTagChips = (patientTags = []) => {
  const { t } = useTranslation();
  const clinic = useClinic();

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
    .filter(chip => chip.label)
    .toSorted((a, b) => utils.compareLabels(a.label, b.label));
};

const useSiteChips = (clinicSites = []) => {
  const { t } = useTranslation();
  const clinic = useClinic();

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
    .filter(chip => chip.label)
    .toSorted((a, b) => utils.compareLabels(a.label, b.label));
};

const Chip = ({ label, onRemove, required = false }) => {
  const { t } = useTranslation();
  const canRemove = !required;

  return (
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
        '&:hover': canRemove ? {
          color: vizColors.blue80,
          fontWeight: 'medium',
        } : {},
        '.remove-filter-icon': {
          fontSize: '14px',
          padding: '2px',
          color: vizColors.blue80,
          minWidth: 0,
          width: 0,
          mr: 1,
          overflow: 'hidden',
          transition: transitions.easeOut,
        },
        '&:hover .remove-filter-icon': {
          width: '22px',
        },
        '.remove-filter-icon:focus-visible': {
          width: '22px',
        },
        '.remove-filter-icon:focus:not(:focus-visible)': {
          boxShadow: 'none',
        },
      }}
    >
      <Text sx={{ textDecoration: canRemove ? 'underline' : 'none', whiteSpace: 'nowrap' }}>
        {label}
      </Text>

      { canRemove &&
        <Icon
          className="remove-filter-icon"
          icon={CloseRoundedIcon}
          label={t('Remove {{ label }} filter', { label })}
          onClick={onRemove}
        />
      }
    </Flex>
  );
};

const ChipGroup = ({ prefix, chips, onRemove }) => {
  if (!chips?.length) return null;

  return (
    <Flex mr={2} sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', color: vizColors.blue30 }}>
      {prefix}

      {chips.map(chip => (
        <Chip
          key={`${chip.type}-${chip.value || 'filter'}`}
          label={chip.label}
          required={chip.required}
          onRemove={() => onRemove(chip)}
        />
      ))}
    </Flex>
  );
};

const ActiveFiltersTray = ({
  patientCount = 0,
  filters = {},
  requiredFilters = {},
  hasSearchActive = false,
  onRemoveFilter = noop,
  rightContent = null,
}) => {
  const { t } = useTranslation();
  const primaryChips = usePrimaryChips(filters, requiredFilters);
  const tagChips = useTagChips(filters.patientTags);
  const siteChips = useSiteChips(filters.clinicSites);

  const handleRemoveChip = chip => onRemoveFilter(chip.type, chip.value);

  const count = patientCount;

  return (
    <Flex
      id="clinic-patients-active-filters"
      px={3}
      py={3}
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
            <Icon tabIndex='-1' variant="static" iconSrc={TagIcon} sx={{ fontSize: 1, mr: 1 }} />
            <Text sx={{ fontSize: 0 }}>{t('tagged')}</Text>
          </Flex>}
        />

        <ChipGroup
          chips={siteChips}
          onRemove={handleRemoveChip}
          prefix={<Flex sx={{ alignItems: 'center' }}>
            <Icon tabIndex='-1' variant="static" icon={LocationOnOutlinedIcon} sx={{ fontSize: 1, mr: 1 }} />
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

ActiveFiltersTray.propTypes = {
  patientCount: PropTypes.number,
  requiredFilters: PropTypes.object,
  filters: PropTypes.shape({
    lastData: PropTypes.number,
    lastDataType: PropTypes.oneOf(['bgm', 'cgm']),
    timeCGMUsePercent: PropTypes.oneOf(['<0.7', '>=0.7']),
    timeInRange: PropTypes.arrayOf(PropTypes.string),
    patientTags: PropTypes.arrayOf(PropTypes.string),
    clinicSites: PropTypes.arrayOf(PropTypes.string),
  }),
  hasSearchActive: PropTypes.bool,
  onRemoveFilter: PropTypes.func,
  rightContent: PropTypes.node,
};

export default ActiveFiltersTray;
