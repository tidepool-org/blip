import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import map from 'lodash/map';
import noop from 'lodash/noop';
import { Flex, Box, Text } from 'theme-ui';
import moment from 'moment-timezone';

import Button from './elements/Button';
import DateRangePicker from './elements/DateRangePicker';
import { Dialog, DialogActions, DialogContent, DialogTitle } from './elements/Dialog';
import { MediumTitle, Caption, Body0 } from './elements/FontStyles';
import { borders } from '../themes/baseTheme';
import { MGDL_UNITS, MMOLL_UNITS } from '../core/constants';

const DAYS_OPTIONS = [14, 30, 90];

const MAX_DAYS = 90;

const JS_DATE_FORMAT = 'YYYY-MM-DD';

const EXPORT_FORMAT = {
  JSON: 'json',
  EXCEL: 'excel',
};

const getLastNDays = (days) => {
  let endDate = moment().format(JS_DATE_FORMAT);
  let startDate = moment().subtract(days, 'days').format(JS_DATE_FORMAT);

  return { startDate, endDate };
};

const datesMatchPreset = (start, end, days) => {
  const { startDate, endDate } = getLastNDays(days);

  return startDate === start && endDate === end;
};

export const ExportModal = ({
  api,
  patient,
  user,
  onClose,
  trackMetric,
}) => {
  const { t } = useTranslation();

  const [dates, setDates] = useState(getLastNDays(DAYS_OPTIONS[0]));
  const [bgUnits, setBgUnits] = useState(get(patient, 'settings.units.bg', MGDL_UNITS));
  const [format, setFormat] = useState(EXPORT_FORMAT.EXCEL);
  const [error, setError] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleClickPreset = (days) => {
    setDates(getLastNDays(days));
    trackMetric('Selected pre-determined date range');
  };

  const handleDatesChange = ({ startDate: start, endDate: end }) => {
    const startDate = start?.format(JS_DATE_FORMAT);
    const endDate = end?.format(JS_DATE_FORMAT);

    setDates({ startDate, endDate });

    if (endDate) {
      trackMetric('Selected custom start or end date');
    }
  };

  const handleClose = () => onClose();

  const handleSubmit = () => {
    trackMetric('Clicked "export data"');
    setError(null);
    setProcessing(true);

    const { startDate: start, endDate: end } = dates;

    if (!start || !end) {
      setError({ message: t('Please select a date range') });
      setProcessing(false);
      return;
    }

    const startDate = moment(start).toISOString();
    const endDate = moment(end).add(1, 'days').subtract(1, 'ms').toISOString();

    api.tidepool.getExportDataURL(
      patient.userid,
      user.userid,
      {
        format,
        bgUnits,
        startDate,
        endDate,
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

  return (
    <>
      <DialogTitle divider={true} onClose={handleClose}>
        <MediumTitle>{t('Export Patient Data')}</MediumTitle>
      </DialogTitle>
      <DialogContent divider={false} sx={{ minWidth: '648px' }} pt={3} px={3}>
        <Box p={3}>
          <Text as={Box} sx={{ color: 'text.primary', fontSize: 1, fontWeight: 'bold' }} mb={3}>
            {t('Export data from the last')}
          </Text>

          <Box mb={3}>
            <Flex>
              {map(DAYS_OPTIONS, (days, i) => (
                <Button
                  mr={2}
                  variant="chip"
                  id={`export-days-${i}`}
                  name={`export-days-${i}`}
                  key={`export-days-${i}`}
                  value={days}
                  selected={datesMatchPreset(dates.startDate, dates.endDate, days)}
                  onClick={() => handleClickPreset(days)}
                >
                  {days} {t('days')}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box>
            <Body0 mb={2}>{t('Or select a custom date range (90 days max)')}</Body0>
            <DateRangePicker
              startDate={dates.startDate ? moment.utc(dates.startDate) : null}
              endDate={dates.endDate ? moment.utc(dates.endDate) : null}
              startDateId="export-start-date"
              endDateId="export-end-date"
              onDatesChange={handleDatesChange}
              isOutsideRange={day => {
                const startMoment = dates.startDate ? moment.utc(dates.startDate) : null;
                const endMoment = dates.endDate ? moment.utc(dates.endDate) : null;

                return (
                  moment().diff(day) <= 0 ||
                  (endMoment && endMoment.diff(day, 'days') >= MAX_DAYS) ||
                  (startMoment && startMoment.diff(day, 'days') <= -MAX_DAYS)
                );
              }}
              onFocusChange={input => {
                setDatePickerOpen(!!input);
              }}
              themeProps={{
                sx: { minHeight: datePickerOpen ? '310px' : undefined },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ bg: 'white', color: 'text.primary' }} p={3}>
          <Text as={Box} sx={{ fontSize: 1, fontWeight: 'bold' }} mb={2}>
            {t('Units')}
          </Text>
          <Flex sx={{ gap: 4, fontSize: 1 }}>
            <Flex sx={{ gap: 1 }}>
              <input
                type="radio"
                name="bgUnits"
                id={`bgUnits_${MGDL_UNITS}`}
                value={MGDL_UNITS}
                checked={bgUnits === MGDL_UNITS}
                onChange={() => {
                  setBgUnits(MGDL_UNITS);
                  trackMetric('Selected diabetes data format');
                }}
              />
              <label htmlFor={`bgUnits_${MGDL_UNITS}`}>{MGDL_UNITS}</label>
            </Flex>

            <Flex sx={{ gap: 1 }}>
              <input
                type="radio"
                name="bgUnits"
                id={`bgUnits_${MMOLL_UNITS}`}
                value={MMOLL_UNITS}
                checked={bgUnits === MMOLL_UNITS}
                onChange={() => {
                  setBgUnits(MMOLL_UNITS);
                  trackMetric('Selected diabetes data format');
                }}
              />
              <label htmlFor={`bgUnits_${MMOLL_UNITS}`}>{MMOLL_UNITS}</label>
            </Flex>
          </Flex>
        </Box>

        <Box sx={{ bg: 'white', color: 'text.primary' }} p={3}>
          <Text as={Box} sx={{ fontSize: 1, fontWeight: 'bold' }} mb={2}>
            {t('File Type')}
          </Text>
          <Flex sx={{ gap: 4, fontSize: 1 }}>
            <Flex sx={{ gap: 1 }}>
              <input
                type="radio"
                name="format"
                id={`format_${EXPORT_FORMAT.EXCEL}`}
                value={EXPORT_FORMAT.EXCEL}
                checked={format === EXPORT_FORMAT.EXCEL}
                onChange={() => {
                  setFormat(EXPORT_FORMAT.EXCEL);
                  trackMetric('Selected file format');
                }}
              />
              <label htmlFor={`format_${EXPORT_FORMAT.EXCEL}`}>Excel</label>
            </Flex>

            <Flex sx={{ gap: 1 }}>
              <input
                type="radio"
                name="format"
                id={`format_${EXPORT_FORMAT.JSON}`}
                value={EXPORT_FORMAT.JSON}
                checked={format === EXPORT_FORMAT.JSON}
                onChange={() => {
                  setFormat(EXPORT_FORMAT.JSON);
                  trackMetric('Selected file format');
                }}
              />
              <label htmlFor={`format_${EXPORT_FORMAT.JSON}`}>JSON</label>
            </Flex>
          </Flex>
        </Box>

        {error && (
          <Caption mx={3} mt={2} sx={{ color: 'feedback.danger' }} id="export-error">
            {error.message ? error.message : error.toString()}
          </Caption>
        )}
      </DialogContent>
      <DialogActions
        mt={3}
        py="12px"
        sx={{ borderTop: borders.default, justifyContent: 'space-between' }}
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
    </>
  );
};

const ExportModalWrapper = (props) => {
  const { onClose, open } = props;

  return (
    <Dialog
      id="exportDialog"
      open={open}
      onClose={onClose}
      PaperProps={{ id: 'exportDialogInner' }}
      maxWidth="md"
    >
      {open && <ExportModal {...props} />}
    </Dialog>
  );
};

ExportModalWrapper.propTypes = {
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

ExportModalWrapper.defaultProps = {
  onClose: noop,
  trackMetric: noop,
};

export default ExportModalWrapper;
