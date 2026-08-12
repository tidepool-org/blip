import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trackMetric } from '../../../core/metricUtils';
import { colors as vizColors } from '@tidepool/viz';

import { Box, Grid } from 'theme-ui';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import noop from 'lodash/noop';

import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import Button from '../../../components/elements/Button';
import Popover from '../../../components/elements/Popover';
import RadioGroup from '../../../components/elements/RadioGroup';
import { lastDataFilterOptions } from '../../../core/clinicUtils';
import useClinicMetricsPageName from '../useClinicMetricsPageName';

const DropdownContent = ({
  canSelectLastDataType,
  canClearSelection,
  onClose,
  onChange,
  lastData,
  lastDataType,
  filterOptions,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const pageName = useClinicMetricsPageName();

  const [pending, setPending] = useState({ lastData, lastDataType });

  const lastDataTypeFilterOptions = [
    { value: 'cgm', label: t('CGM') },
    { value: 'bgm', label: t('BGM') },
  ];

  const handleChange = (filters) => onChange(filters);

  return (
    <Box data-testid="data-recency-filter-dropdown" mt={5} mx={2} sx={{ width: 300 }}>
      <Box>
        {canSelectLastDataType &&
          <>
            <Box mb={2} sx={{ padding: 1, color: vizColors.gray50, lineHeight: 1 }}>
              <Box sx={{ fontSize: 1, fontWeight: 'medium' }}>
                {t('Device Type')}
              </Box>
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
          </>
        }

        <Box mt={3} mb={2} sx={{ padding: 1, color: vizColors.gray50, lineHeight: 1 }}>
          <Box sx={{ fontSize: 1, fontWeight: 'medium' }}>{t('Data Recency')}</Box>
          <Box sx={{ fontSize: 0 }} mt={1}>{t('Tidepool will only show patients who have data within the selected number of days.')}</Box>
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

      <Grid sx={{ gridTemplateColumns: canClearSelection ? '1fr 1fr' : '1fr' }} mt={3} mb={2}>
        {canClearSelection &&
          <Button
            id="clear-last-upload-filter"
            sx={{ fontSize: 1 }}
            variant="secondary"
            onClick={() => {
              trackMetric('Clinic - Last upload clear filter', { clinicId: selectedClinicId, pageName });
              setPending({ lastData: null, lastDataType: null });
              handleChange({ lastData: null, lastDataType: null });
              onClose();
            }}
          >
            {t('Clear')}
          </Button>
        }

        <Button
          id="apply-last-upload-filter"
          disabled={!pending.lastData || !pending.lastDataType}
          sx={{ fontSize: 1 }}
          variant="primary"
          onClick={() => {
            const dateRange = pending.lastData === 1
              ? 'today'
              : `${pending.lastData} days`;

            trackMetric('Clinic - Last upload apply filter', {
              clinicId: selectedClinicId,
              dateRange,
              type: pending.lastDataType,
              pageName,
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
  canSelectLastDataType = true,
  canClearSelection = true,
  onChange = noop,
  lastData = null,
  lastDataType = null,
  filterOptions = lastDataFilterOptions,
}) => {
  const { t } = useTranslation();
  const pageName = useClinicMetricsPageName();

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
          if (!lastDataPopupFilterState.isOpen) trackMetric('Clinic - Last data filter open', { clinicId: selectedClinicId, pageName });
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
          trackMetric('Clinic - Last upload filter close', { clinicId: selectedClinicId, pageName });
        }}
        onClose={handleCloseDropdown}
      >
        { lastDataPopupFilterState.isOpen &&
          <DropdownContent
            canSelectLastDataType={canSelectLastDataType}
            canClearSelection={canClearSelection}
            lastData={lastData}
            lastDataType={lastDataType}
            filterOptions={filterOptions || lastDataFilterOptions}
            onClose={handleCloseDropdown}
            onChange={onChange}
          />
        }
      </Popover>
    </>
  );
};

DataRecencyFilterDropdown.propTypes = {
  onChange: PropTypes.func,
  lastData: PropTypes.number,
  lastDataType: PropTypes.oneOf(['bgm', 'cgm']),
  filterOptions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  })),
};

export default DataRecencyFilterDropdown;
