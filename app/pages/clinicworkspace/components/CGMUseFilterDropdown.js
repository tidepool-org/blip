import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trackMetric } from '../../../core/metricUtils';
import { colors as vizColors } from '@tidepool/viz';

import { Box, Grid, Text } from 'theme-ui';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

import find from 'lodash/find';
import noop from 'lodash/noop';

import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import Button from '../../../components/elements/Button';
import Popover from '../../../components/elements/Popover';
import RadioGroup from '../../../components/elements/RadioGroup';

const prefixPopHealthMetric = () => noop; // TODO: FIX

const getCgmUseFilterOptions = (t) => [
  { value: '<0.7', label: t('Less than 70%') },
  { value: '>=0.7', label: t('70% or more') },
];

const DropdownContent = ({
  onClose,
  onChange,
  timeCGMUsePercent,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const [pendingTimeCGMUsePercent, setPendingTimeCGMUsePercent] = useState(timeCGMUsePercent);

  const cgmUseFilterOptions = getCgmUseFilterOptions(t);

  const handleChange = timeCGMUsePercent => onChange(timeCGMUsePercent);

  return (
    <Box mt={5} mx={2} sx={{ width: 300 }}>
      <Box>
        <Box sx={{ alignItems: 'center' }} mb={2}>
          <Text sx={{ color: 'grays.4', fontWeight: 'medium', fontSize: 1, whiteSpace: 'nowrap' }}>
            {t('% CGM Use')}
          </Text>
        </Box>

        <Box sx={{ border: `1px solid ${vizColors.gray10}`, borderRadius: 6, padding: 2 }}>
          <RadioGroup
            id="cgm-use"
            name="cgm-use"
            options={cgmUseFilterOptions}
            variant="vertical"
            sx={{ fontSize: 0 }}
            value={pendingTimeCGMUsePercent}
            onChange={event => setPendingTimeCGMUsePercent(event.target.value || null)}
          />
        </Box>
      </Box>

      <Grid sx={{ gridTemplateColumns: '1fr 1fr' }} mt={3} mb={2}>
        <Button
          id="clear-cgm-use-filter"
          sx={{ fontSize: 1 }}
          variant="secondary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('CGM use clear filter'), { clinicId: selectedClinicId });
            setPendingTimeCGMUsePercent(null);
            handleChange(null);
            onClose();
          }}
        >
          {t('Clear')}
        </Button>

        <Button
          id="apply-cgm-use-filter"
          disabled={!pendingTimeCGMUsePercent}
          sx={{ fontSize: 1 }}
          variant="primary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('CGM use apply filter'), {
              clinicId: selectedClinicId,
              filter: pendingTimeCGMUsePercent,
            });

            handleChange(pendingTimeCGMUsePercent);
            onClose();
          }}
        >
          {t('Apply')}
        </Button>
      </Grid>
    </Box>
  );
};

const CGMUseFilterDropdown = ({
  onChange = noop,
  timeCGMUsePercent = null,
}) => {
  const { t } = useTranslation();

  const cgmUsePopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'cgmUseFilters',
  });

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const handleCloseDropdown = () => cgmUsePopupFilterState.close();

  return (
    <>
      <Box
        onClick={() => {
          if (!cgmUsePopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('CGM Use filter open'), { clinicId: selectedClinicId });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="cgm-use-filter-trigger"
          selected={!!timeCGMUsePercent}
          {...bindTrigger(cgmUsePopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Filter by cgm use"
          sx={{ fontSize: 0, lineHeight: 1.3 }}
        >
          {t('% CGM Use')}
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(cgmUsePopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('CGM Use filter close'), { clinicId: selectedClinicId });
        }}
        onClose={handleCloseDropdown}
      >
        { cgmUsePopupFilterState.isOpen &&
          <DropdownContent
            timeCGMUsePercent={timeCGMUsePercent}
            onClose={handleCloseDropdown}
            onChange={onChange}
          />
        }
      </Popover>
    </>
  );
};

export default CGMUseFilterDropdown;
