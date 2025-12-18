import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import map from 'lodash/map';
import noop from 'lodash/noop';
import { Flex, Box, Text, Label } from 'theme-ui';
import moment from 'moment-timezone';
import { Element, scroller } from 'react-scroll';

import Button from './elements/Button';
import DateRangePicker from './elements/DateRangePicker';
import { Dialog, DialogActions, DialogContent, DialogTitle } from './elements/Dialog';
import { MediumTitle, Caption, Body0 } from './elements/FontStyles';
import { borders } from '../themes/baseTheme';
import { MGDL_UNITS, MMOLL_UNITS } from '../core/constants';

const DAYS_OPTIONS = [14, 30, 90];

const JS_DATE_FORMAT = 'YYYY-MM-DD';

const EXPORT_FORMAT = {
  JSON: 'json',
  EXCEL: 'excel',
};

export const ExportModal = ({
  api,
  patient,
  user,
  onClose,
  open,
  trackMetric,
}) => {
  const { t } = useTranslation();

  const endOfToday = useMemo(() => moment().endOf('day').subtract(1, 'ms'), [open]); // TODO: Resolve

  const getLastNDays = (days) => {
    let endDate = moment().format(JS_DATE_FORMAT);
    let startDate = moment().subtract(days - 1, 'days').format(JS_DATE_FORMAT);

    return { startDate, endDate };
  };

  const initialState = {
    dates: getLastNDays(30),
    bgUnits: get(patient, 'settings.units.bg', MGDL_UNITS),
    format: EXPORT_FORMAT.EXCEL,
    error: null,
  };

  const [dates, setDates] = useState(initialState.dates);
  const [bgUnits, setBgUnits] = useState(initialState.bgUnits);
  const [format, setFormat] = useState(initialState.format);
  const [error, setError] = useState(initialState.error);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const datesMatchPreset = (dayCount) => {
    const { startDate, endDate } = getLastNDays(dayCount);

    return startDate === dates.startDate && endDate === dates.endDate;
  };

  const handleClickPreset = (days) => {
    setDates(getLastNDays(days));
    trackMetric('Selected pre-determined date range');
  };

  const handleDatesChange = ({ startDate: start, endDate: end }) => {
    const startDate = start?.format(JS_DATE_FORMAT);
    const endDate = end?.format(JS_DATE_FORMAT);

    setDates({ startDate, endDate });
  };

  const handleClose = () => onClose();

  const handleSubmit = () => {
    trackMetric('Clicked "export data"');
    setError(null);
    setProcessing(true);

    const { startDate, endDate } = dates;

    if (!startDate || !endDate) {
      setError({ message: t('Please select a date range') });
      setProcessing(false);
      return;
    }

    api.tidepool.getExportDataURL(
      patient.userid,
      user.userid,
      {
        format,
        bgUnits,
        startDate: moment(startDate).toISOString(),
        endDate: moment(endDate).toISOString(),
      },
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
      setDates(initialState.dates);
      setBgUnits(initialState.bgUnits);
      setFormat(initialState.format);
      setError(initialState.error);
      setDatePickerOpen(false);
      setProcessing(false);
    }
  }, [open]);

  return (
    <Dialog id="exportDialog" onClose={handleClose} PaperProps={{ id: 'exportDialogInner' }} maxWidth="md" open={open}>
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
                {map(DAYS_OPTIONS, (days, i) => (
                  <Button
                    mr={2}
                    variant="chip"
                    id={`export-days-${i}`}
                    name={`export-days-${i}`}
                    key={`export-days-${i}`}
                    value={days}
                    selected={datesMatchPreset(days)}
                    onClick={() => handleClickPreset(days)}
                  >
                    {days} {t('days')}
                  </Button>
                ))}
              </Flex>
            </Box>

            <Box mb={3}>
              <Body0 mb={2}>{t('Or select a custom date range')}</Body0>
              <DateRangePicker
                startDate={moment.utc(dates.startDate)}
                endDate={moment.utc(dates.endDate).endOf('day')}
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

          <Box variant="containers.fluidBordered" sx={{ bg: 'white', color: 'text.primary' }} p={3} mb={3}>
            <Text as={Box} sx={{ fontSize: 1, fontWeight: 'bold' }} mb={3}>
              {t('Units')}
            </Text>
            <Flex>
              <Label sx={{ alignItems: 'center', cursor: 'pointer', mr: 4 }}>
                <input
                  type="radio"
                  name="bgUnits"
                  value={MGDL_UNITS}
                  checked={bgUnits === MGDL_UNITS}
                  onChange={() => {
                    setBgUnits(MGDL_UNITS);
                    trackMetric('Selected diabetes data format');
                  }}
                  style={{ marginLeft: '20px', marginRight: '3px' }}
                />
                {MGDL_UNITS}
              </Label>
              <Label sx={{ alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="bgUnits"
                  value={MMOLL_UNITS}
                  checked={bgUnits === MMOLL_UNITS}
                  onChange={() => {
                    setBgUnits(MMOLL_UNITS);
                    trackMetric('Selected diabetes data format');
                  }}
                  style={{ marginLeft: '20px', marginRight: '3px' }}
                />
                {MMOLL_UNITS}
              </Label>
            </Flex>
          </Box>

          <Box variant="containers.fluidBordered" sx={{ bg: 'white', color: 'text.primary' }} p={3} mb={3}>
            <Text as={Box} sx={{ fontSize: 1, fontWeight: 'bold' }} mb={3}>
              {t('File Type')}
            </Text>
            <Flex>
              <Label sx={{ alignItems: 'center', cursor: 'pointer', mr: 4 }}>
                <input
                  type="radio"
                  name="format"
                  value={EXPORT_FORMAT.EXCEL}
                  checked={format === EXPORT_FORMAT.EXCEL}
                  onChange={() => {
                    setFormat(EXPORT_FORMAT.EXCEL);
                    trackMetric('Selected file format');
                  }}
                  style={{ marginLeft: '20px', marginRight: '3px' }}
                />
                Excel
              </Label>
              <Label sx={{ alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="format"
                  value={EXPORT_FORMAT.JSON}
                  checked={format === EXPORT_FORMAT.JSON}
                  onChange={() => {
                    setFormat(EXPORT_FORMAT.JSON);
                    trackMetric('Selected file format');
                  }}
                  style={{ marginLeft: '20px', marginRight: '3px' }}
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
