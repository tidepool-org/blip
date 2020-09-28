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
import PrintDateRangeModal from '../app/components/PrintDateRangeModal';

/* eslint-disable max-len */
const sleep = m => new Promise(r => setTimeout(r, m));

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

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };

  const [processing, setProcessing] = React.useState(false);

  const fetchedUntil = moment.utc().subtract(60, 'days').valueOf();

  const handleClickPrint = async (opts) => {
    action('Clicked Print')(opts);
    setProcessing(true);

    // Determine the earliest startDate needed to fetch data to.
    const fetchUntil = min(at(opts, map(keys(opts), key => `${key}.endpoints.0`)));

    // If fetchUntil is earlier than the point to which we've fetched data, we need to first fetch
    // data to that date prior to generating the PDF
    if (fetchUntil < fetchedUntil) { // TODO: get for furthest-back startDate
      action('Fetching Data for PDF')(opts);
      await sleep(2000);
    }

    action('Generating PDF')(opts);
    await sleep(1000);
    setProcessing(false);
    action('Open PDF')(opts);
  };

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Print Dialog
      </Button>
      <PrintDateRangeModal
        fetchedUntil={fetchedUntil}
        mostRecentDatumDates={{
          basics: moment.utc().valueOf(),
          bgLog: moment.utc().subtract(2, 'd').valueOf(),
          daily: moment.utc().valueOf(),
        }}
        open={open}
        onClose={handleClose}
        onClickPrint={handleClickPrint}
        onDatesChange={dates => action('Updated Dates')(dates)}
        processing={processing}
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
      url: 'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=2209%3A256',
    },
  },
};
