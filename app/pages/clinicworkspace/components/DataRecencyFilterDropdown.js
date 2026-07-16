import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trackMetric } from '../../../core/metricUtils';
import { colors as vizColors } from '@tidepool/viz';

import { Box, Grid, Text } from 'theme-ui';
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
  filterOptions,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const [pending, setPending] = useState({ lastData, lastDataType });

  const lastDataTypeFilterOptions = [
    { value: 'cgm', label: t('CGM') },
    { value: 'bgm', label: t('BGM') },
  ];

  const handleChange = (filters) => onChange(filters);

  return (
    <Box mt={5} mx={2} sx={{ width: 300 }}>
      <Box>
        <Box sx={{ alignItems: 'center' }} mb={2}>
          <Text sx={{ color: 'grays.4', fontWeight: 'medium', fontSize: 1, whiteSpace: 'nowrap' }}>
            {t('Device Type')}
          </Text>
        </Box>

        <Box sx={{ border: `1px solid ${vizColors.gray10}`, borderRadius: 6, padding: 2 }}>
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
        </Box>

        <Box mt={3} mb={2} pt={2} sx={{ alignItems: 'center' }}>
          <Body0 color="grays.4" sx={{ fontWeight: 'medium', fontSize: 1 }} mb={0}>{t('Data Recency')}</Body0>
          <Body0 color="grays.4" sx={{ fontWeight: 'normal', fontSize: 0 }} mb={2} mt={1}>{t('Tidepool will only show patients who have data within the selected number of days.')}</Body0>
        </Box>

        <Box sx={{ border: `1px solid ${vizColors.gray10}`, borderRadius: 6, padding: 2 }}>
          <RadioGroup
            id="last-upload-filters"
            name="last-upload-filters"
            options={filterOptions}
            variant="vertical"
            sx={{ fontSize: 0 }}
            value={pending.lastData}
            onChange={event => {
              setPending({ ...pending, lastData: parseInt(event.target.value) || null });
            }}
          />
        </Box>
      </Box>

      <Grid sx={{ gridTemplateColumns: '1fr 1fr' }} mt={3} mb={2}>
        <Button
          id="clear-last-upload-filter"
          sx={{ fontSize: 1 }}
          variant="secondary"
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
          variant="primary"
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
      </Grid>
    </Box>
  );
};

const DataRecencyFilterDropdown = ({
  onChange = noop,
  lastData = null,
  lastDataType = null,
  filterOptions = lastDataFilterOptions,
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
        minWidth="11em"
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
            filterOptions={filterOptions}
            onClose={handleCloseDropdown}
            onChange={onChange}
          />
        }
      </Popover>
    </>
  );
};

export default DataRecencyFilterDropdown;
