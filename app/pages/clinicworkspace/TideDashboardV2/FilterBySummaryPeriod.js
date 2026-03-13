import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { setSummaryPeriodFilter } from './tideDashboardFiltersSlice';
import { Box } from 'theme-ui';
import Button from '../../../components/elements/Button';
import Popover from '../../../components/elements/Popover';
import RadioGroup from '../../../components/elements/RadioGroup';

import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

import noop from 'lodash/noop';
import find from 'lodash/find';

import { DialogActions, DialogContent } from '../../../components/elements/Dialog';
import { Body0 } from '../../../components/elements/FontStyles';
import { setOffset } from './tideDashboardSlice';

const trackMetric = noop;
const prefixPopHealthMetric = noop;

const summaryPeriodOptions = [
  { value: '1d', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
];

const DropdownContent = ({
  onClose = noop,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const [pendingSummaryPeriod, setPendingSummaryPeriod] = useState(summaryPeriod);

  return (
    <>
      <DialogContent px={2} py={3} dividers>
        <Box mb={2} sx={{ alignItems: 'center' }}>
          <Body0 color="grays.4" sx={{ fontWeight: 'bold' }} mb={0}>{t('Summary Period')}</Body0>
          <Body0 color="grays.4" sx={{ fontWeight: 'medium' }} mb={2}>{t('Tidepool will generate health summaries for the selected number of days.')}</Body0>
        </Box>

        <RadioGroup
          id="summary-period-filters"
          name="summary-period-filters"
          options={summaryPeriodOptions}
          variant="vertical"
          sx={{ fontSize: 0 }}
          mb={3}
          value={pendingSummaryPeriod}
          onChange={event => setPendingSummaryPeriod(event.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
        <Button
          id="cancel-summary-period-filter"
          sx={{ fontSize: 1 }}
          variant="textSecondary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Summary period filter cancel'), { clinicId: selectedClinicId });
            setPendingSummaryPeriod(summaryPeriod);
            onClose();
          }}
        >
          {t('Cancel')}
        </Button>

        <Button
          id="apply-summary-period-filter"
          disabled={pendingSummaryPeriod === summaryPeriod}
          sx={{ fontSize: 1 }}
          variant="textPrimary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Summary period apply filter'), {
              clinicId: selectedClinicId,
              summaryPeriod: pendingSummaryPeriod,
            });

            dispatch(setSummaryPeriodFilter(pendingSummaryPeriod));
            dispatch(setOffset(0));
            onClose();
          }}
        >
          {t('Apply')}
        </Button>
      </DialogActions>
    </>
  );
};

const FilterBySummaryPeriod = () => {
  const { t } = useTranslation();
  const summaryPeriodPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'summaryPeriodFilters',
  });

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);

  return (
    <>
      <Box
        onClick={() => {
          if (!summaryPeriodPopupFilterState.isOpen) {
            trackMetric(prefixPopHealthMetric('Summary period filter open'), { clinicId: selectedClinicId });
          }
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="summary-period-filter-trigger"
          {...bindTrigger(summaryPeriodPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by summary period duration"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          {find(summaryPeriodOptions, { value: summaryPeriod })?.label} {t('of data')}
        </Button>
      </Box>

      <Popover
        width="13em"
        closeIcon
        {...bindPopover(summaryPeriodPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Summary period filter close'), { clinicId: selectedClinicId });
        }}
        onClose={() => summaryPeriodPopupFilterState.close()}
      >
        { summaryPeriodPopupFilterState.isOpen &&
          <DropdownContent
            onClose={() => summaryPeriodPopupFilterState.close()}
          />
        }
      </Popover>
    </>
  );
};

export default FilterBySummaryPeriod;
