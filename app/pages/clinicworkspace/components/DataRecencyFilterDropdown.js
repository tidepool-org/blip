import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trackMetric } from '../../../core/metricUtils';

import { Box, Text } from 'theme-ui';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

import reject from 'lodash/reject';
import noop from 'lodash/noop';

import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import Button from '../../../components/elements/Button';
import Popover from '../../../components/elements/Popover';
import RadioGroup from '../../../components/elements/RadioGroup';
import { Body0 } from '../../../components/elements/FontStyles';

import { borders } from '../../../themes/baseTheme';
import { DialogContent, DialogActions } from '../../../components/elements/Dialog';
import { lastDataFilterOptions } from '../../../core/clinicUtils';

const prefixPopHealthMetric = () => noop; // TODO: FIX

const DropdownContent = ({
  onClose = noop,
  onChange = noop,
  lastData = null,
  lastDataType = null,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const [pending, setPending] = useState({ lastData, lastDataType });

  const lastDataTypeFilterOptions = [
    { value: 'cgm', label: t('CGM') },
    { value: 'bgm', label: t('BGM') },
  ];

  const customLastDataFilterOptions = reject(lastDataFilterOptions, { value: 7 });

  const handleChange = (filters) => onChange(filters);

  return (
    <>
      <DialogContent px={2} py={3} dividers>
        <Box sx={{ alignItems: 'center' }} mb={2}>
          <Text sx={{ color: 'grays.4', fontWeight: 'medium', fontSize: 0, whiteSpace: 'nowrap' }}>
            {t('Device Type')}
          </Text>
        </Box>

        <RadioGroup
          id="last-upload-type"
          name="last-upload-type"
          options={lastDataTypeFilterOptions}
          variant="vertical"
          sx={{ fontSize: 0 }}
          value={pending.lastDataType}
          onChange={event => {
            setPending({ ...pending, lastDataType: event.target.value || null });
          }}
        />

        <Box
          mt={3}
          mb={2}
          pt={3}
          sx={{
            alignItems: 'center',
            borderTop: borders.divider,
          }}
        >
          <Body0 color="grays.4" sx={{ fontWeight: 'bold' }} mb={0}>{t('Data Recency')}</Body0>
          <Body0 color="grays.4" sx={{ fontWeight: 'medium' }} mb={2}>{t('Tidepool will only show patients who have data within the selected number of days.')}</Body0>
        </Box>

        <RadioGroup
          id="last-upload-filters"
          name="last-upload-filters"
          options={customLastDataFilterOptions}
          variant="vertical"
          sx={{ fontSize: 0 }}
          mb={3}
          value={pending.lastData}
          onChange={event => {
            setPending({ ...pending, lastData: parseInt(event.target.value) || null });
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
        <Button
          id="clear-last-upload-filter"
          sx={{ fontSize: 1 }}
          variant="textSecondary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Last upload clear filter'), { clinicId: selectedClinicId });
            setPending({ lastData: null, lastDataType: null });
            handleChange({ lastData: null, lastDataType: null });
            onClose();
          }}
        >
          {t('Clear')}
        </Button>

        <Button
          id="apply-last-upload-filter"
          disabled={!pending.lastData || !pending.lastDataType}
          sx={{ fontSize: 1 }}
          variant="textPrimary"
          onClick={() => {
            const dateRange = pending.lastData === 1
              ? 'today'
              : `${pending.lastData} days`;

            trackMetric(prefixPopHealthMetric('Last upload apply filter'), {
              clinicId: selectedClinicId,
              dateRange,
              type: pending.lastDataType,
            });

            handleChange(pending);
            onClose();
          }}
        >
          {t('Apply')}
        </Button>
      </DialogActions>
    </>
  );
};

const DataRecencyFilterDropdown = ({
  onChange = noop,
  lastData = null,
  lastDataType = null,
}) => {
  const { t } = useTranslation();

  const lastDataPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'lastDataFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const handleCloseDropdown = () => {
    lastDataPopupFilterState.close();
  };

  return (
    <>
      <Box
        onClick={() => {
          if (!lastDataPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('Last data filter open'), { clinicId: selectedClinicId });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="last-data-filter-trigger"
          selected={!!lastData}
          {...bindTrigger(lastDataPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by last upload"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          {t('Data Recency')}
        </Button>
      </Box>

      <Popover
        width="13em"
        closeIcon
        {...bindPopover(lastDataPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Last upload filter close'), { clinicId: selectedClinicId });
        }}
        onClose={() => {
          lastDataPopupFilterState.close();
        }}
      >
        { lastDataPopupFilterState.isOpen &&
          <DropdownContent
            lastData={lastData}
            lastDataType={lastDataType}
            onClose={handleCloseDropdown}
            onChange={onChange}
          />
        }
      </Popover>
    </>
  );
};

export default DataRecencyFilterDropdown;
