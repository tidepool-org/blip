import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { trackMetric } from '../../../core/metricUtils';
import { colors as vizColors, utils as vizUtils } from '@tidepool/viz';

import { Box, Flex, Text } from 'theme-ui';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

import map from 'lodash/map';
import includes from 'lodash/includes';
import without from 'lodash/without';
import noop from 'lodash/noop';

import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import Button from '../../../components/elements/Button';
import Pill from '../../../components/elements/Pill';
import Popover from '../../../components/elements/Popover';
import Checkbox from '../../../components/elements/Checkbox';
import { DialogContent, DialogActions } from '../../../components/elements/Dialog';

import { colors } from '../../../themes/baseTheme';
import { MGDL_UNITS } from '../../../core/constants';

const { reshapeBgClassesToBgBounds, generateBgRangeLabels } = vizUtils.bg;

const prefixPopHealthMetric = () => noop; // TODO: FIX

const glycemicTargetThresholds = {
  timeInVeryLowPercent: { value: 1, comparator: '>' },
  timeInLowPercent: { value: 4, comparator: '>' },
  timeInAnyLowPercent: { value: 4, comparator: '>' },
  timeInTargetPercent: { value: 70, comparator: '<' },
  timeInHighPercent: { value: 25, comparator: '>' },
  timeInAnyHighPercent: { value: 25, comparator: '>' },
  timeInVeryHighPercent: { value: 5, comparator: '>' },
  timeInExtremeHighPercent: { value: 1, comparator: '>' },
};

const getTimeInRangeFilterOptions = (showExtremeHigh = false, t) => [
  (showExtremeHigh && {
    title: t('Highest'),
    value: 'timeInExtremeHighPercent',
    threshold: glycemicTargetThresholds.timeInExtremeHighPercent.value,
    prefix: t('Greater than'),
    rangeName: 'extremeHigh',
  }),
  {
    title: t('Very High'),
    value: 'timeInVeryHighPercent',
    threshold: glycemicTargetThresholds.timeInVeryHighPercent.value,
    prefix: t('Greater than'),
    rangeName: 'veryHigh',
  },
  {
    title: t('High'),
    value: 'timeInAnyHighPercent',
    threshold: glycemicTargetThresholds.timeInAnyHighPercent.value,
    prefix: t('Greater than'),
    rangeName: 'anyHigh',
  },
  {
    title: t('Not meeting TIR'),
    value: 'timeInTargetPercent',
    threshold: glycemicTargetThresholds.timeInTargetPercent.value,
    prefix: t('Less than'),
    rangeName: 'target',
  },
  {
    title: t('Low'),
    value: 'timeInAnyLowPercent',
    threshold: glycemicTargetThresholds.timeInAnyLowPercent.value,
    prefix: t('Greater than'),
    rangeName: 'anyLow',
  },
  {
    title: t('Very Low'),
    value: 'timeInVeryLowPercent',
    threshold: glycemicTargetThresholds.timeInVeryLowPercent.value,
    prefix: t('Greater than'),
    rangeName: 'veryLow',
  },
].filter(Boolean);

const DropdownContent = ({
  onClose = noop,
  onChange = noop,
  timeInRange = [],
}) => {
  const { t } = useTranslation();
  const { showExtremeHigh } = useFlags();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinicBgUnits = useSelector((state) => state.blip.clinics?.[selectedClinicId]?.preferredBgUnits) || MGDL_UNITS;

  const [pendingTimeInRange, setPendingTimeInRange] = useState(timeInRange);

  const bgLabels = useMemo(
    () => generateBgRangeLabels(
      {
        bgUnits: clinicBgUnits,
        bgBounds: reshapeBgClassesToBgBounds({ bgUnits: clinicBgUnits }),
      },
      { segmented: true }
    ),
    [clinicBgUnits]
  );

  const handleChange = (timeInRange) => onChange(timeInRange);

  return (
    <>
      <DialogContent color="text.primary" pl={4} pr={6} pb={3} sx={{ width: 600 }}>
        <Box mb={3} sx={{ fontSize: 1, fontWeight: 'medium' }}>
          <Box mr={2} sx={{ color: vizColors.gray50, fontWeight: 'medium', fontSize: 1, whiteSpace: 'nowrap' }}>
            {t('% Time in Range')}
          </Box>
          <Box mt={2} sx={{ color: vizColors.blue50, fontWeight: 'normal', fontStyle: 'italic', fontSize: 0, lineHeight: 1 }}>
            <Text>{t('Only patients using the standard target range will be included.')}</Text>
          </Box>
        </Box>

        {map(getTimeInRangeFilterOptions(showExtremeHigh, t), ({ value, title, rangeName, threshold, prefix }) => {
          const { prefix: bgPrefix, suffix, value: glucoseTargetValue } = bgLabels[rangeName];

          return (
            <Flex
              id={`time-in-range-filter-${rangeName}`}
              key={rangeName}
              mb={3}
              ml={2}
              sx={{ alignItems: 'center', gap: 2 }}
            >
              <Checkbox
                id={`range-${value}-filter`}
                name={`range-${value}-filter`}
                checked={includes(pendingTimeInRange, value)}
                onChange={event => {
                  setPendingTimeInRange(event.target.checked
                    ? [...pendingTimeInRange, value]
                    : without(pendingTimeInRange, value)
                  );
                }}
              />

              <Box
                px={1}
                py={1}
                ml={-2}
                sx={{
                  backgroundColor: `${colors.bg[rangeName]}1A`, // Adding '1A' reduces opacity to 0.1
                  borderRadius: 4,
                }}
              >
                <Flex as="label" htmlFor={`range-${value}-filter`} sx={{ alignItems: 'center' }}>
                  <Box
                    id={`range-${value}-filter-option-color-indicator`}
                    sx={{
                      position: 'relative',
                      borderRadius: 4,
                      backgroundColor: colors.bg[rangeName],
                      width: '12px',
                      height: '12px',

                      // The styles within the :after pseudo-class below create a diagonal line

                      border: value === 'timeInTargetPercent' && `1.5px solid ${colors.blueGreyDark}`,
                      '&::after': value === 'timeInTargetPercent' && {
                        content: '""',
                        height: '1.5px',
                        width: '141.421%',
                        backgroundColor: colors.blueGreyDark,
                        position: 'absolute',
                        bottom: '0px',
                        transform: 'rotate(-45deg)',
                        transformOrigin: '1px 1px',
                      },
                    }}
                    mr={2}
                  >
                  </Box>

                  <Text
                    id={`range-${value}-filter-option-title`}
                    sx={{ fontSize: 1, fontWeight: 'bold', color: 'black' }}
                    mr={2}
                  >
                    {title}
                  </Text>

                  <Text id={`range-${value}-filter-option-definition`} sx={{ fontSize: 1 }} mr={2}>
                    {prefix}{' '}
                    <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
                      {threshold}
                    </Text>
                    % {t('Time')}{' '}
                    {bgPrefix && `${t(bgPrefix)} `}
                    <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
                      {glucoseTargetValue}
                    </Text>{' '}
                    {suffix}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          );
        })}

        <Button
          variant="textSecondary"
          px={0}
          sx={{ fontSize: 0 }}
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Time in range unselect all'), { clinicId: selectedClinicId });
            setPendingTimeInRange([]);
          }}
        >
          {t('Unselect all')}
        </Button>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }} p={2}>
        <Button
          id="timeInRangeFilterClear"
          variant="textSecondary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Time in range clear filter'), { clinicId: selectedClinicId });
            setPendingTimeInRange([]);
            handleChange([]);
            onClose();
          }}
        >
          {t('Clear')}
        </Button>

        <Button
          id="timeInRangeFilterConfirm"
          variant="textPrimary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Time in range apply filter'), {
              clinicId: selectedClinicId,
              severeHypo: includes(pendingTimeInRange, 'timeInVeryLowPercent'),
              hypo: includes(pendingTimeInRange, 'timeInAnyLowPercent'),
              inRange: includes(pendingTimeInRange, 'timeInTargetPercent'),
              hyper: includes(pendingTimeInRange, 'timeInAnyHighPercent'),
              severeHyper: includes(pendingTimeInRange, 'timeInVeryHighPercent'),
              extremeHyper: includes(pendingTimeInRange, 'timeInExtremeHighPercent'),
            });

            handleChange(pendingTimeInRange);
            onClose();
          }}
        >
          {t('Apply')}
        </Button>
      </DialogActions>
    </>
  );
};

const TimeInRangeFilterDropdown = ({
  onChange = noop,
  timeInRange = [],
}) => {
  const { t } = useTranslation();

  const timeInRangePopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'timeInRangeFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const handleCloseDropdown = () => {
    timeInRangePopupFilterState.close();
  };

  return (
    <>
      <Box
        onClick={() => {
          if (!timeInRangePopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('Time in range filter open'), { clinicId: selectedClinicId });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          id="time-in-range-filter-trigger"
          variant="filter"
          selected={!!timeInRange?.length}
          {...bindTrigger(timeInRangePopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by Time in Range"
          sx={{ fontSize: 0, lineHeight: 1.3, flexShrink: 0 }}
        >
          <Flex sx={{ gap: 1 }}>
            {t('% Time in Range')}

            {!!timeInRange?.length && (
              <Pill
                id="time-in-range-filter-count"
                label="filter count"
                round
                sx={{
                  width: '14px',
                  fontSize: '9px',
                  lineHeight: '15px',
                  textAlign: 'center',
                  display: 'inline-block',
                }}
                colorPalette={['purpleMedium', 'white']}
                text={`${timeInRange?.length}`}
              />
            )}
          </Flex>
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(timeInRangePopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Time in range filter close'), { clinicId: selectedClinicId });
        }}
        onClose={() => {
          timeInRangePopupFilterState.close();
        }}
      >
        { timeInRangePopupFilterState.isOpen &&
          <DropdownContent
            timeInRange={timeInRange}
            onClose={handleCloseDropdown}
            onChange={onChange}
          />
        }
      </Popover>
    </>
  );
};

export default TimeInRangeFilterDropdown;
