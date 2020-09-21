import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';
import PrintDateRangeModal from '../app/components/PrintDateRangeModal';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '../app/components/elements/Dialog';

import DatePicker from '../app/components/elements/DatePicker';
import RadioGroup from '../app/components/elements/RadioGroup';
import { Caption, Paragraph1, MediumTitle, Subheading } from '../app/components/elements/FontStyles';
import moment from 'moment-timezone';
import { Label, Switch } from '@rebass/forms/styled-components';
import { Flex, Box } from 'rebass/styled-components';

import Accordion from '../app/components/elements/Accordion';
import { map } from 'lodash';

/* eslint-disable max-len */

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Print Date Range Modals',
  decorators: [withDesign, withTheme],
};

export const PrintDateRangeModalStory = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    setError(false);
  };

  const validateDates = ({ startDate, endDate }) => setError(!startDate || !endDate);

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Print Dialog
      </Button>
      <PrintDateRangeModal
        error={error}
        open={open}
        onClose={handleClose}
        onClickPrint={dates => {
          setSubmitted(true);
          validateDates(dates);
          action('clicked Print')(dates);
        }}
        onDatesChange={dates => submitted && validateDates(dates)}
        timePrefs={{
          timezoneName: 'UTC',
        }}
      />
    </React.Fragment>
  );
};

PrintDateRangeModalStory.story = {
  name: 'Print Date Range Modal',
  parameters: {
    design: {
      type: 'figma',
      url:
        'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2209%3A256',
    },
  },
};

export const AltPrintDateRangeModalStory = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const dateTypeOptions = [
    { value: 'latest', label: 'Latest available data' },
    { value: 'custom', label: 'Custom' },
  ];

  const dailyDaysOptions = [
    { value: 7, label: '7' },
    { value: 14, label: '14' },
    { value: 21, label: '21' },
  ];

  const basicsDaysOptions = [
    { value: 7, label: '7' },
    { value: 14, label: '14' },
    { value: 21, label: '21' },
  ];

  const bgLogDaysOptions = [
    { value: 7, label: '7' },
    { value: 14, label: '14' },
    { value: 21, label: '21' },
    { value: 30, label: '30' },
  ];

  const [basicsEnabled, setBasicsEnabled] = useState(true);
  const [basicsDateType, setBasicsDateType] = useState(dateTypeOptions[0].value);
  const [basicsDays, setBasicsDays] = useState(basicsDaysOptions[2].value);

  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [dailyDateType, setDailyDateType] = useState(dateTypeOptions[0].value);
  const [dailyDays, setDailyDays] = useState(dailyDaysOptions[0].value);

  const [bgLogEnabled, setBgLogEnabled] = useState(true);
  const [bgLogDateType, setBgLogDateType] = useState(dateTypeOptions[0].value);
  const [bgLogDays, setBgLogDays] = useState(bgLogDaysOptions[3].value);

  const [deviceSettingsEnabled, setDeviceSettingsEnabled] = useState(true);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    setError(false);
  };

  const validateDates = ({ startDate, endDate }) => setError(!startDate || !endDate);
  const handleSubmit = (dates) => {
    setSubmitted(true);
    validateDates(dates);
    action('Clicked Print')(dates);
  };

  const endOfToday = moment().tz('utc').endOf('day').subtract(1, 'ms');

  // Accordion
  const [expanded, setExpanded] = React.useState('basics');

  const handleChange = key => (event, isExpanded) => {
    setExpanded(key);
  };

  const accordionProps = (label, header) => ({
    label,
    key: label,
    expanded: expanded === label,
    onChange: handleChange(label),
    themeProps: {
      wrapper: {
        width: '100%',
      },
      panel: {
        width: '100%',
        px: 5,
        pt: 1,
        pb: 3,
      },
      header: {
        width: '100%',
      },
    },
    header,
  });

  const panels = [
    {
      dateType: basicsDateType,
      days: basicsDays,
      daysOptions: basicsDaysOptions,
      enabled: basicsEnabled,
      header: 'Basics Chart',
      key: 'basics',
      setDateType: setBasicsDateType,
      setDays: setBasicsDays,
      setEnabled: setBasicsEnabled,
    },
    {
      dateType: dailyDateType,
      days: dailyDays,
      daysOptions: dailyDaysOptions,
      enabled: dailyEnabled,
      header: 'Daily Charts',
      key: 'daily',
      setDateType: setDailyDateType,
      setDays: setDailyDays,
      setEnabled: setDailyEnabled,
    },
    {
      dateType: bgLogDateType,
      days: bgLogDays,
      daysOptions: bgLogDaysOptions,
      enabled: bgLogEnabled,
      header: 'BG Log Chart',
      key: 'bgLog',
      setDateType: setBgLogDateType,
      setDays: setBgLogDays,
      setEnabled: setBgLogEnabled,
    },
    {
      enabled: deviceSettingsEnabled,
      header: 'Device Settings',
      key: 'deviceSettings',
      setEnabled: setDeviceSettingsEnabled,
    },
  ];

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Print Dialog
      </Button>
      <Dialog id="printDateRangePicker" open={open} onClose={handleClose}>
        <DialogTitle divider={false} onClose={handleClose}>
          <MediumTitle>Print Report</MediumTitle>
        </DialogTitle>
        <DialogContent divider={false} minWidth="400px" p={0}>
          {map(panels, panel => (
            <Accordion {...accordionProps(panel.key, panel.header)}>
              <Box width="100%">
                <Flex mb={4}>
                  <Label htmlFor={`enabled-${panel.key}`}>
                    <Caption alignSelf="center">Include {panel.header}</Caption>
                    <Switch
                      name={`enabled-${panel.key}`}
                      ml={4}
                      checked={panel.enabled}
                      onClick={() => panel.setEnabled(enabled => !enabled)}
                    />
                  </Label>
                </Flex>

                {panel.enabled && panel.dateType && (
                  <Box>
                    <Box mb={3}>
                      <RadioGroup
                        label="Select the most recent date to include in the report"
                        id={`date-type-${panel.key}`}
                        name={`date-type-${panel.key}`}
                        options={dateTypeOptions}
                        value={panel.dateType}
                        onChange={e => panel.setDateType(e.target.value)}
                        variant="horizontal"
                      />

                      {panel.dateType === 'custom' && <DatePicker
                        id={`date-custom-${panel.key}`}
                        onFocusChange={input => setDatePickerOpen(!!input)}
                        isOutsideRange={day => (endOfToday.diff(day) < 0)}
                        themeProps={{
                          mb: 3,
                          minWidth: '320px',
                          minHeight: datePickerOpen ? '300px' : undefined,
                        }}
                      />}
                    </Box>
                    <Box>
                      <RadioGroup
                        label="Days included in report"
                        id={`days-${panel.key}`}
                        name={`days-${panel.key}`}
                        variant="horizontal"
                        options={panel.daysOptions}
                        value={panel.days}
                        onChange={e => panel.setDays(parseInt(e.target.value, 10))}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions justifyContent="space-between" py={2}>
          <Button variant="textSecondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="textPrimary" onClick={handleSubmit}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

AltPrintDateRangeModalStory.story = {
  name: 'Alt Print Date Range Modal',
  parameters: {
    design: {
      type: 'figma',
      url:
        'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2209%3A256',
    },
  },
};
