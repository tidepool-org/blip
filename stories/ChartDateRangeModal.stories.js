import React, { useState } from 'react';
import moment from 'moment-timezone';
import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from 'styled-components';
import at from 'lodash/at';
import map from 'lodash/map';
import min from 'lodash/min';
import keys from 'lodash/keys';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';
import ChartDateRangeModal from '../app/components/ChartDateRangeModal';

/* eslint-disable max-len */
const sleep = m => new Promise(r => setTimeout(r, m));

// Wrap each story component with the base theme
const withTheme = Story => (
  <ThemeProvider theme={baseTheme}>
    <Story />
  </ThemeProvider>
);

export default {
  title: 'Chart Date Range Modals',
  decorators: [withDesign, withTheme],
};

export const ChartDateRangeModalStory = () => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };

  const [processing, setProcessing] = React.useState(false);

  const fetchedUntil = moment.utc().subtract(32, 'days').valueOf();

  const handleClickPrint = async (opts) => {
    action('Clicked Apply')(opts);
    setProcessing(true);

    // Determine the earliest startDate needed to fetch data to.
    const fetchUntil = min(at(opts, map(keys(opts), key => `${key}.endpoints.0`)));

    // If fetchUntil is earlier than the point to which we've fetched data, we need to first fetch
    // data to that date prior to generating the PDF
    if (fetchUntil < fetchedUntil) {
      action('Fetching Data for PDF')(opts);
      await sleep(2000);
    }

    action('Generating PDF')(opts);
    await sleep(1000);
    setProcessing(false);
    action('Open PDF')(opts);
  };

  const mostRecentDatumDate = moment.utc().subtract(2, 'd').valueOf();

  const defaultDates = [
    moment.utc(mostRecentDatumDate).subtract(5, 'd').valueOf(),
    mostRecentDatumDate,
  ];

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Chart Dates Dialog
      </Button>
      <ChartDateRangeModal
        defaultDates={defaultDates}
        mostRecentDatumDate={mostRecentDatumDate}
        open={open}
        onClose={handleClose}
        onSubmit={handleClickPrint}
        onDatesChange={dates => action('Updated Dates')(dates)}
        processing={processing}
        timePrefs={{
          timezoneName: 'UTC',
        }}
      />
    </React.Fragment>
  );
};

ChartDateRangeModalStory.story = {
  name: 'Chart Date Range Modal',
};
