import React, { useState } from 'react';

import { withDesign } from 'storybook-addon-designs';
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
  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };
  const [dates, setDates] = React.useState({ startDate: null, endDate: null });

  const onClickPrint = (dates) => {
    if (dates.startDate !== null) {
      console.log(dates.startDate.format('Y-MM-DD'), dates.endDate.format('Y-MM-DD'));
      // window.print();
    } else {
      console.log('dates are null!');
    }
  };

  return (
    <React.Fragment>
      <Button variant="primary" onClick={handleClickOpen}>
        Open Print Dialog
      </Button>
      <PrintDateRangeModal
        open={open}
        onClose={handleClose}
        onClickPrint={onClickPrint}
        setDates={setDates}
        startDate={dates.startDate}
        endDate={dates.endDate}
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
