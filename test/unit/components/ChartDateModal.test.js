/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */

import React from 'react';
import moment from 'moment-timezone';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';

import ChartDateModal from '../../../app/components/ChartDateModal';

const expect = chai.expect;

describe('ChartDateModal', function () {
  const props = {
    chartType: 'daily',
    defaultDate: Date.parse('2020-03-10T00:00:00.000Z'),
    mostRecentDatumDate: Date.parse('2020-03-10T00:00:00.000Z'),
    open: true,
    onClose: sinon.stub(),
    onSubmit: sinon.stub(),
    processing: false,
    timePrefs: {
      timezoneName: 'UTC',
    },
    trackMetric: sinon.stub(),
  };

  let rendered;
  beforeEach(() => {
    rendered = render(<ChartDateModal {...props} />);
  });

  afterEach(() => {
    props.onClose.reset();
    props.onSubmit.reset();
    props.trackMetric.reset();
  });

  it('should be visible when open prop is true', async () => {
    expect(screen.queryByRole('dialog')).to.not.be.null;

    rendered.rerender(<ChartDateModal {...props} open={false} />);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).to.be.null;
    });
  });

  it('should set default date as provided by props', () => {
    const dateFormat = 'MMM D, YYYY';
    // Note: we expect the start dates to show a date that is the preset range MINUS 1 day prior
    // to the end date, since the resulting date range goes from the first ms of the start date
    // to the last ms of the end date
    const date = document.body.querySelector('#chart-date');
    expect(date.value).to.equal('Mar 10, 2020');

    // Use 'US/Pacific' time zone
    rendered.unmount();
    const renderedPacific = render(<ChartDateModal {...{ ...props, timePrefs: { timezoneName: 'US/Pacific' } }} />);

    const dateInPacific = document.body.querySelector('#chart-date');

    expect(moment.utc('Mar 10, 2020', dateFormat).tz('US/Pacific').format(dateFormat)).to.equal('Mar 9, 2020');
    expect(dateInPacific.value).to.equal('Mar 9, 2020');
  });

  context('form is submitted', () => {
    let submitButton;

    beforeEach(() => {
      submitButton = () => document.body.querySelector('button.chart-dates-submit');
    });

    it('should call `onSubmit` prop method with appropriate print ranges and disabled statuses', () => {
      const date = document.body.querySelector('#chart-date');
      expect(date.value).to.equal('Mar 10, 2020');

      // Change date to Mar 1, 2020
      fireEvent.change(date, {
        target: { name: 'chart-date', value: 'Mar 1, 2020' }
      });

      // Submit form
      fireEvent.click(submitButton());
      sinon.assert.calledOnce(props.onSubmit);
      sinon.assert.calledWith(props.onSubmit, [
          Date.parse('2020-03-01T00:00:00.000Z'),
          Date.parse('2020-03-02T00:00:00.000Z'),
      ]);
    });

    it('should not call `onSubmit` if there are date validation errors and render error message', () => {
      const datesClearButton = () => document.body.querySelector('button.SingleDatePickerInput_clearDate');
      const date = () => document.body.querySelector('#chart-date');
      const error = () => document.body.querySelector('#chart-dates-error');

      // Clear dates
      fireEvent.click(datesClearButton());
      expect(date().value).to.equal('');
      expect(error()).to.not.exist;

      fireEvent.click(submitButton());
      sinon.assert.notCalled(props.onSubmit);

      expect(error()).to.exist;
      expect(error().textContent).to.equal('Please select a date');
    });

    it('should send metric', () => {
      const date = document.body.querySelector('#chart-date');
      sinon.assert.notCalled(props.trackMetric);

      // Change date to Mar 1, 2020
      fireEvent.change(date, {
        target: { name: 'chart-date', value: 'Mar 1, 2020' }
      });

      // Submit form
      fireEvent.click(submitButton());

      sinon.assert.calledWith(props.trackMetric, 'Set Custom Chart Date', {
        chartType: 'daily',
      });
    });
  });

  it('should run `onClose` prop method when "Cancel" button is clicked', () => {
    const cancelButton = document.body.querySelector('button.chart-dates-cancel');
    fireEvent.click(cancelButton);
    sinon.assert.calledOnce(props.onClose);
  });

  it('should run `onClose` prop method when the close icon is clicked', () => {
    const closeIcon = document.body.querySelector('button[aria-label="close dialog"]');
    fireEvent.click(closeIcon);
    sinon.assert.calledOnce(props.onClose);
  });
});
