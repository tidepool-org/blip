import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from 'styled-components';

import baseTheme from '../app/themes/baseTheme';
import Button from '../app/components/elements/Button';
import PrintDateRangeModal from '../app/components/PrintDateRangeModal';

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
  // const [dates, setDates] = useState({ startDate: null, endDate: null });

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };

  // This function is used to check the dates that are being passed,
  // but is commented out while not in use

  // const onClickPrint = (dates) => {
  //   if (dates.startDate !== null) {
  //     alert('startDate: ' + dates.startDate.format('Y-MM-DD') + '\n' + 'endDate: ' + dates.endDate.format('Y-MM-DD'));
  //   } else {
  //     alert('no dates selected');
  //   }
  // };

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Print Dialog
      </Button>
      <PrintDateRangeModal
        open={open}
        onClose={handleClose}
        // onClickPrint={onClickPrint}
        onClickPrint={action('clicked Print')}
        // setDates={setDates}
        // startDate={dates.startDate}
        // endDate={dates.endDate}
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
        'https://www.figma.com/file/iuXkrpuLTXExSnuPJE3Jtn/Tidepool-Design-System---Sprint-1?node-id=8%3A826',
    },
  },
};
