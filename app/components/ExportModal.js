import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import map from 'lodash/map';
import noop from 'lodash/noop';
import { Flex, Box, Text, Label, Radio } from 'theme-ui';
import moment from 'moment-timezone';
import { Element, scroller } from 'react-scroll';

import Button from './elements/Button';
import DateRangePicker from './elements/DateRangePicker';
import { Dialog, DialogActions, DialogContent, DialogTitle } from './elements/Dialog';
import { MediumTitle, Caption, Body0 } from './elements/FontStyles';
import i18next from '../core/language';
import { borders } from '../themes/baseTheme';
import { MGDL_UNITS, MMOLL_UNITS } from '../core/constants';

const t = i18next.t.bind(i18next);

export const ExportModal = (props) => {
  const {
    api,
    patient,
    user,
    onClose,
    open,
    trackMetric,
  } = props;

  const defaultBgUnits = get(patient, 'settings.units.bg', MGDL_UNITS);

  const endOfToday = useMemo(() => moment().endOf('day').subtract(1, 'ms'), [open]);

  const getLastNDays = (days) => {
    const endDate = endOfToday.clone();
    const startDate = moment(endDate).subtract(days - 1, 'days').startOf('day');
    return { startDate, endDate };
  };

  const setDateRangeToExtents = ({ startDate, endDate }) => ({
    startDate: startDate ? moment(startDate).startOf('day') : null,
    endDate: endDate ? moment(endDate).endOf('day').subtract(1, 'ms') : null,
  });

  const daysOptions = [14, 30, 90];

  const defaultDates = () => getLastNDays(30);

  const defaults = useMemo(() => ({
    dates: defaultDates(),
    bgUnits: defaultBgUnits,
    format: 'excel',
    allTime: false,
    error: null,
  }), [open]);

  const [dates, setDates] = useState(defaults.dates);
  const [bgUnits, setBgUnits] = useState(defaults.bgUnits);
  const [format, setFormat] = useState(defaults.format);
  const [allTime, setAllTime] = useState(defaults.allTime);
  const [error, setError] = useState(defaults.error);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const presetDateRanges = useMemo(() => map(daysOptions, days => getLastNDays(days)), [open]);

  const datesMatchPreset = (currentDates, presetDates) => {
    return moment(currentDates.startDate).isSame(presetDates.startDate, 'day') &&
           moment(currentDates.endDate).isSame(presetDates.endDate, 'day');
  };

  const handleClickPreset = (days) => {
    setDates(getLastNDays(days));
    setAllTime(false);
    trackMetric('Selected pre-determined date range');
  };

  const handleAllTimeClick = () => {
    setAllTime(true);
    trackMetric('Selected pre-determined date range');
  };

  const handleDatesChange = (newDates) => {
    setDates(setDateRangeToExtents(newDates));
    setAllTime(false);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    trackMetric('Clicked "export data"');
    setError(null);
    setProcessing(true);

    let options = {
      format,
      bgUnits,
    };

    if (allTime) {
      // No date filtering for all time
    } else {
      if (!dates.startDate || !dates.endDate) {
        setError({ message: t('Please select a date range') });
        setProcessing(false);
        return;
      }
      options.startDate = moment(dates.startDate).utc().toISOString();
      options.endDate = moment(dates.endDate).endOf('day').utc().toISOString();
    }

    api.tidepool.getExportDataURL(
      patient.userid,
      user.userid,
      options,
      (err, url) => {
        setProcessing(false);
        if (err) {
          setError(err);
          return;
        }
        let a = document.createElement('a');
        a.style = 'display: none';
        document.body.appendChild(a);
        a.href = url;
        a.click();
        a.remove();
        handleClose();
      }
    );
  };

  // Reset to default state when dialog is opened
  useEffect(() => {
    if (open) {
      setDates(defaults.dates);
      setBgUnits(defaults.bgUnits);
      setFormat(defaults.format);
      setAllTime(defaults.allTime);
      setError(defaults.error);
      setDatePickerOpen(false);
      setProcessing(false);
    }
  }, [open]);

  return (
    <Dialog id="exportDialog" PaperProps={{ id: 'exportDialogInner' }} maxWidth="md" open={open} onClose={handleClose}>
      <DialogTitle divider={true} onClose={handleClose}>
        <MediumTitle>{t('Export Patient Data')}</MediumTitle>
      </DialogTitle>
      <DialogContent divider={false} sx={{ minWidth: '580px' }} pt={3} px={3}>
        <Element name="export-wrapper">
          <Box
            variant="containers.fluidBordered"
            sx={{ bg: 'white', color: 'text.primary' }}
            p={3}
            mb={3}
          >
            <Text as={Box} sx={{ fontSize: 1, fontWeight: 'bold' }} mb={3}>
              {t('Date Range')}
            </Text>

            <Box mb={3}>
              <Body0 mb={2}>{t('Number of days (most recent)')}</Body0>
              <Flex>
                {map(daysOptions, (days, i) => (
                  <Button
                    mr={2}
                    variant="chip"
                    id={`export-days-${i}`}
                    name={`export-days-${i}`}
                    key={`export-days-${i}`}
                    value={days}
                    selected={!allTime && datesMatchPreset(dates, presetDateRanges[i])}
                    onClick={() => handleClickPreset(days)}
                  >
                    {days} {t('days')}
                  </Button>
                ))}
                <Button
                  variant="chip"
                  id="export-all-time"
                  name="export-all-time"
                  selected={allTime}
                  onClick={handleAllTimeClick}
                >
                  {t('All Data')}
                </Button>
              </Flex>
            </Box>

            <Box mb={3}>
              <Body0 mb={2}>{t('Or select a custom date range')}</Body0>
              <DateRangePicker
                startDate={dates.startDate}
                endDate={dates.endDate}
                startDateId="export-start-date"
                endDateId="export-end-date"
                onDatesChange={handleDatesChange}
                isOutsideRange={day => endOfToday.diff(day) < 0}
                onFocusChange={input => {
                  setDatePickerOpen(!!input);
                  if (input) {
                    scroller.scrollTo('export-wrapper', {
                      delay: 0,
                      containerId: 'exportDialogInner',
                      duration: 250,
                      smooth: true,
                    });
                  }
                }}
                themeProps={{
                  sx: { minHeight: datePickerOpen ? '310px' : undefined },
                }}
              />
            </Box>
          </Box>

          <Box
            variant="containers.fluidBordered"
            sx={{ bg: 'white', color: 'text.primary' }}
            p={3}
            mb={3}
          >
            <Text as={Box} sx={{ fontSize: 1, fontWeight: 'bold' }} mb={3}>
              {t('Units')}
            </Text>
            <Flex>
              <Label sx={{ alignItems: 'center', cursor: 'pointer', mr: 4 }}>
                <Radio
                  name="bgUnits"
                  value={MGDL_UNITS}
                  checked={bgUnits === MGDL_UNITS}
                  onChange={() => {
                    setBgUnits(MGDL_UNITS);
                    trackMetric('Selected diabetes data format');
                  }}
                />
                {MGDL_UNITS}
              </Label>
              <Label sx={{ alignItems: 'center', cursor: 'pointer' }}>
                <Radio
                  name="bgUnits"
                  value={MMOLL_UNITS}
                  checked={bgUnits === MMOLL_UNITS}
                  onChange={() => {
                    setBgUnits(MMOLL_UNITS);
                    trackMetric('Selected diabetes data format');
                  }}
                />
                {MMOLL_UNITS}
              </Label>
            </Flex>
          </Box>

          <Box
            variant="containers.fluidBordered"
            sx={{ bg: 'white', color: 'text.primary' }}
            p={3}
            mb={3}
          >
            <Text as={Box} sx={{ fontSize: 1, fontWeight: 'bold' }} mb={3}>
              {t('File Type')}
            </Text>
            <Flex>
              <Label sx={{ alignItems: 'center', cursor: 'pointer', mr: 4 }}>
                <Radio
                  name="format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={() => {
                    setFormat('excel');
                    trackMetric('Selected file format');
                  }}
                />
                Excel
              </Label>
              <Label sx={{ alignItems: 'center', cursor: 'pointer' }}>
                <Radio
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => {
                    setFormat('json');
                    trackMetric('Selected file format');
                  }}
                />
                JSON
              </Label>
            </Flex>
          </Box>
        </Element>

        {error && (
          <Caption mx={3} mt={2} sx={{ color: 'feedback.danger' }} id="export-error">
            {error.message ? error.message : error.toString()}
          </Caption>
        )}
      </DialogContent>
      <DialogActions
        mt={3}
        py="12px"
        sx={{
          borderTop: borders.default,
          justifyContent: 'space-between',
        }}
      >
        <Button variant="textSecondary" className="export-cancel" onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button
          variant="primary"
          className="export-submit"
          processing={processing}
          onClick={handleSubmit}
        >
          {t('Export')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ExportModal.propTypes = {
  api: PropTypes.shape({
    tidepool: PropTypes.shape({
      getExportDataURL: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  patient: PropTypes.shape({
    userid: PropTypes.string.isRequired,
    settings: PropTypes.shape({
      units: PropTypes.shape({
        bg: PropTypes.string,
      }),
    }),
  }).isRequired,
  user: PropTypes.shape({
    userid: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  trackMetric: PropTypes.func,
};

ExportModal.defaultProps = {
  onClose: noop,
  trackMetric: noop,
};

export default ExportModal;
