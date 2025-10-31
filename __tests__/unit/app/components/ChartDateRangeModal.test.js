/* global jest */
/* global expect */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import moment from 'moment-timezone';
import _ from 'lodash';

import ChartDateRangeModal from '@app/components/ChartDateRangeModal';
import userEvent from '@testing-library/user-event';

describe('ChartDateRangeModal', () => {
  const onClose = jest.fn();
  const onSubmit = jest.fn();
  const trackMetric = jest.fn();

  const props = {
    chartType: 'basics',
    defaultDates: [
      moment.utc('2020-03-01T00:00:00.000Z').valueOf(),
      moment.utc('2020-03-10T00:00:00.000Z').valueOf() + 1,
    ],
    mostRecentDatumDate: Date.parse('2020-03-10T01:20:00.000Z'),
    open: true,
    onClose,
    onSubmit,
    processing: false,
    timePrefs: { timezoneName: 'UTC' },
    trackMetric,
  };

  beforeEach(() => {
    onClose.mockClear();
    onSubmit.mockClear();
    trackMetric.mockClear();
  });

  it('should be visible when open prop is true', async () => {
    // Should not be open when "open" prop is false
    const { rerender } = render(<ChartDateRangeModal {...props} open={false} />);
    expect(screen.queryByRole('heading', { name: /Chart Date Range/ })).not.toBeInTheDocument();

    // Should be open when "open" prop is true
    rerender(<ChartDateRangeModal {...props} />);
    expect(screen.getByRole('heading', { name: /Chart Date Range/ })).toBeInTheDocument();

    // Should close when cancel button is clicked
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Cancel/ }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Should close when dialog close icon is clicked
    await userEvent.click(screen.getByRole('button', { name: /close dialog/ }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('should set default dates as provided by props in UTC timezone', () => {
    render(<ChartDateRangeModal {...props} />);

    // Should provide date range preset options
    expect(screen.getByRole('button', { name: /14 days/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /21 days/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /30 days/ })).toBeInTheDocument();

    // Note: we expect the start dates to show a date that is the preset range MINUS 1 day prior
    // to the end date, since the resulting date range goes from the first ms of the start date
    // to the last ms of the end date
    expect(screen.getByPlaceholderText('Start Date')).toHaveValue('Mar 1, 2020');
    expect(screen.getByPlaceholderText('End Date')).toHaveValue('Mar 10, 2020');
  });

  it('should set default dates as provided by props in custom timezone', () => {
    // Use 'US/Pacific' time zone
    render(<ChartDateRangeModal {...{ ...props, timePrefs: { timezoneName: 'US/Pacific' } }} />);

    // Shows the hour of the latest datum localized to time zone
    expect(screen.getByPlaceholderText('Start Date')).toHaveValue('Feb 29, 2020 (4:00 PM)');
    expect(screen.getByPlaceholderText('End Date')).toHaveValue('Mar 9, 2020 (5:00 PM)');
  });

  describe('form submission', () => {
    it('should call `onSubmit` prop method with appropriate print ranges and disabled statuses', async () => {
      render(<ChartDateRangeModal {...props} />);

      await userEvent.click(screen.getByRole('button', { name: /30 days/ }));
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));

      expect(onSubmit).toHaveBeenCalledWith([
        Date.parse('2020-02-09T02:00:00.000Z'),
        Date.parse('2020-03-10T02:00:00.000Z'), // 2:00am is the hour after the mostRecentDatum (1:20am)
      ]);

      expect(trackMetric).toHaveBeenCalledWith(
        'Set Custom Chart Dates',
        { chartType: 'basics', dateRange: '30 days' }
      );
    });

    it('should not call `onSubmit` if there are date validation errors and render error message', async () => {
      render(<ChartDateRangeModal {...props} />);

      // Clear the date inputs
      await userEvent.click(screen.getByRole('button', { name: /Clear Dates/ }));
      expect(screen.getByPlaceholderText('Start Date')).toHaveValue('');
      expect(screen.getByPlaceholderText('End Date')).toHaveValue('');
      expect(screen.queryByText('Please select a date range')).not.toBeInTheDocument();

      // Click apply. Error message should pop up and onSubmit prop should not have been called.
      await userEvent.click(screen.getByRole('button', { name: /Apply/ }));
      expect(screen.getByText('Please select a date range')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
