import React, { useState } from 'react';
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
import { Body0, Body1 } from '../../../components/elements/FontStyles';

const prefixPopHealthMetric = () => noop; // TODO: FIX

const getSummaryPeriodSelectLabel = (t, activeSummaryPeriod) => {
  switch (activeSummaryPeriod) {
    case '1d': return t('Summarizing 24 hours of data');
    case '7d': return t('Summarizing 7 days of data');
    case '14d': return t('Summarizing 14 days of data');
    case '30d': return t('Summarizing 30 days of data');
  }

  return null;
};

const DropdownContent = ({
  onClose,
  onChange,
  activeSummaryPeriod,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const [pendingSummaryPeriod, setPendingSummaryPeriod] = useState(activeSummaryPeriod);

  const summaryPeriodOptions = [
    { value: '1d', label: t('24 hours') },
    { value: '7d', label: t('7 days') },
    { value: '14d', label: t('14 days') },
    { value: '30d', label: t('30 days') },
  ];

  const handleChange = (summaryPeriod) => onChange(summaryPeriod);

  return (
    <Box mt={5} mx={2} sx={{ width: 300 }}>
      <Box>
        <Body0 color="grays.4" sx={{ fontWeight: 'medium', fontSize: 1 }}>
          {t('Summarizing Data')}
        </Body0>

        <Body1 color="grays.4" sx={{ fontWeight: 'normal', fontSize: 0 }} mb={2}>
          {t('Tidepool will generate health summaries for the selected number of days.')}
        </Body1>

        <Box sx={{ border: `1px solid ${vizColors.gray10}`, borderRadius: 6, padding: 2 }}>
          <RadioGroup
            id="summary-period-filters"
            name="summary-period-filters"
            options={summaryPeriodOptions}
            variant="vertical"
            sx={{ fontSize: 0 }}
            value={pendingSummaryPeriod}
            onChange={event => setPendingSummaryPeriod(event.target.value)}
          />
        </Box>
      </Box>

      <Grid sx={{ gridTemplateColumns: '1fr 1fr' }} mt={3} mb={2}>
        <Button
          id="cancel-summary-period-filter"
          sx={{ fontSize: 1 }}
          variant="secondary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Summary period filter cancel'), { clinicId: selectedClinicId });
            setPendingSummaryPeriod(activeSummaryPeriod);
            onClose();
          }}
        >
          {t('Cancel')}
        </Button>

        <Button
          id="apply-summary-period-filter"
          disabled={pendingSummaryPeriod === activeSummaryPeriod}
          sx={{ fontSize: 1 }}
          variant="primary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Summary period apply filter'), {
              clinicId: selectedClinicId,
              summaryPeriod: pendingSummaryPeriod,
            });

            handleChange(pendingSummaryPeriod);
            onClose();
          }}
        >
          {t('Apply')}
        </Button>
      </Grid>
    </Box>
  );
};

const SummaryPeriodFilterDropdown = ({
  onChange = noop,
  activeSummaryPeriod = null,
}) => {
  const { t } = useTranslation();

  const summaryPeriodPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'summaryPeriodFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const handleCloseDropdown = () => summaryPeriodPopupFilterState.close();

  return (
    <>
      <Box
        onClick={() => {
          if (!summaryPeriodPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('Summary period filter open'), { clinicId: selectedClinicId });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          selected
          id="summary-period-filter-trigger"
          {...bindTrigger(summaryPeriodPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by summary period duration"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          {getSummaryPeriodSelectLabel(t, activeSummaryPeriod)}
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(summaryPeriodPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Summary period filter close'), { clinicId: selectedClinicId });
        }}
        onClose={handleCloseDropdown}
      >
        { summaryPeriodPopupFilterState.isOpen &&
          <DropdownContent
            activeSummaryPeriod={activeSummaryPeriod}
            onClose={handleCloseDropdown}
            onChange={onChange}
          />
        }
      </Popover>
    </>
  );
};

export default SummaryPeriodFilterDropdown;
