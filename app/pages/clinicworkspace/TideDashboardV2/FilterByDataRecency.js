import React, { useState} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { setLastDataFilter } from './tideDashboardFiltersSlice';
import { Box } from 'theme-ui';
import Button from '../../../components/elements/Button';
import Popover from '../../../components/elements/Popover';
import RadioGroup from '../../../components/elements/RadioGroup';

import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

import noop from 'lodash/noop';
import reject from 'lodash/reject';
import find from 'lodash/find';

import { lastDataFilterOptions } from '../../../core/clinicUtils';
import { borders } from '../../../themes/baseTheme';
import { DialogActions, DialogContent } from '../../../components/elements/Dialog';
import { Body0 } from '../../../components/elements/FontStyles';
import { setOffset } from './tideDashboardSlice';

const trackMetric = noop;
const prefixPopHealthMetric = noop;

const customLastDataFilterOptions = reject(lastDataFilterOptions, { value: 7 });

const DropdownContent = ({
  onClose = noop,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const lastData = useSelector(state => state.blip.tideDashboardFilters.lastData);
  const [pendingLastData, setPendingLastData] = useState(lastData);

  return (
    <>
      <DialogContent px={2} py={3} dividers>
        <Box mb={2} sx={{ alignItems: 'center' }}>
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
          value={pendingLastData}
          onChange={evt => setPendingLastData(parseInt(evt.target.value) || null)}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
        <Button
          id="clear-last-upload-filter"
          sx={{ fontSize: 1 }}
          variant="textSecondary"
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Last upload clear filter'), { clinicId: selectedClinicId });
            onClose();
          }}
        >
          {t('Clear')}
        </Button>

        <Button
          id="apply-last-upload-filter"
          disabled={!pendingLastData}
          sx={{ fontSize: 1 }}
          variant="textPrimary"
          onClick={() => {
            const dateRange = pendingLastData === 1
              ? 'today'
              : `${pendingLastData} days`;

            trackMetric(prefixPopHealthMetric('Last upload apply filter'), {
              clinicId: selectedClinicId,
              dateRange,
              type: 'cgm',
            });

            dispatch(setLastDataFilter(pendingLastData));
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

const FilterByDataRecency = () => {
  const { t } = useTranslation();
  const lastDataPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'lastDataFilters',
  });

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const lastData = useSelector(state => state.blip.tideDashboardFilters.lastData);

  return (
    <>
      <Box
        onClick={() => {
          if (!lastDataPopupFilterState.isOpen) {
            trackMetric(prefixPopHealthMetric('Last data filter open'), { clinicId: selectedClinicId });
          }
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
          {lastData
            ? lastData === 1
            ? t('Data within 1 day')
            : t('Data within') + find(customLastDataFilterOptions, { value: lastData })?.label?.replace('Within', '')
            : t('Data Recency')
          }
        </Button>
      </Box>

      <Popover
        width="13em"
        closeIcon
        {...bindPopover(lastDataPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Last upload filter close'), { clinicId: selectedClinicId });
        }}
        onClose={() => lastDataPopupFilterState.close()}
      >
        { lastDataPopupFilterState.isOpen &&
          <DropdownContent
            onClose={() => lastDataPopupFilterState.close()}
          />
        }
      </Popover>
    </>
  );
};

export default FilterByDataRecency;
