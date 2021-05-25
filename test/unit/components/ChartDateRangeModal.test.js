/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */

import React from 'react';
import moment from 'moment-timezone';
import { mount } from 'enzyme';

import ChartDateRangeModal from '../../../app/components/ChartDateRangeModal';

const expect = chai.expect;

describe('ChartDateRangeModal', function () {
  const props = {
    chartType: 'basics',
    defaultDates: [
      moment.utc('2020-03-01T00:00:00.000Z').valueOf(),
      moment.utc('2020-03-10T00:00:00.000Z').valueOf() + 1,
    ],
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

  let wrapper;
  beforeEach(() => {
    wrapper = mount( <ChartDateRangeModal {...props} /> );
  });

  afterEach(() => {
    props.onClose.reset();
    props.onSubmit.reset();
    props.trackMetric.reset();
  });

  it('should be visible when open prop is true', () => {
    const dialog = () => wrapper.find('.MuiDialog-container').hostNodes();
    expect(dialog().prop('style').opacity).to.equal(1);

    wrapper.setProps({ ...props, open: false });
    wrapper.update();

    expect(dialog().prop('style').opacity).to.equal(0);
  });

  it('should provide date range preset options', () => {
    const datesRangePreset1 = wrapper.find('#days-chart').find('button').at(0).hostNodes();
    const datesRangePreset2 = wrapper.find('#days-chart').find('button').at(1).hostNodes();
    const datesRangePreset3 = wrapper.find('#days-chart').find('button').at(2).hostNodes();

    expect(datesRangePreset1.prop('value')).to.equal(14);
    expect(datesRangePreset2.prop('value')).to.equal(21);
    expect(datesRangePreset3.prop('value')).to.equal(30);
  });

  it('should set default dates as provided by props', () => {
    const dateFormat = 'MMM D, YYYY';
    // Note: we expect the start dates to show a date that is the preset range MINUS 1 day prior
    // to the end date, since the resulting date range goes from the first ms of the start date
    // to the last ms of the end date
    const startDate = wrapper.find('#chart-start-date').hostNodes();
    const endDate = wrapper.find('#chart-end-date').hostNodes();
    expect(startDate.prop('value')).to.equal('Mar 1, 2020');
    expect(endDate.prop('value')).to.equal('Mar 10, 2020');

    // Use 'US/Pacific' time zone
    const pacificWrapper = mount( <ChartDateRangeModal {...{ ...props, timePrefs: { timezoneName: 'US/Pacific' } }} /> )

    const startDateInPacific = pacificWrapper.find('#chart-start-date').hostNodes();
    const endDateInPacific = pacificWrapper.find('#chart-end-date').hostNodes();

    expect(moment.utc('Mar 01, 2020', dateFormat).tz('US/Pacific').format(dateFormat)).to.equal('Feb 29, 2020');
    expect(startDateInPacific.prop('value')).to.equal('Feb 29, 2020');

    expect(moment.utc('Mar 10, 2020', dateFormat).tz('US/Pacific').format(dateFormat)).to.equal('Mar 9, 2020');
    expect(endDateInPacific.prop('value')).to.equal('Mar 9, 2020');
  });

  context('form is submitted', () => {
    let submitButton;

    beforeEach(() => {
      submitButton = () => wrapper.find('button.chart-dates-submit').hostNodes();
    });

    it('should call `onSubmit` prop method with appropriate print ranges and disabled statuses', () => {
      const datesRangeSelectedPreset = () => wrapper.find('#days-chart').find('.selected').hostNodes();

      // Change range to 30 days
      const datesRangePreset3 = wrapper.find('#days-chart').find('button').at(2).hostNodes();
      datesRangePreset3.simulate('click');

      expect(datesRangeSelectedPreset().prop('value')).to.equal(30);

      // Submit form
      submitButton().simulate('click');
      sinon.assert.calledOnce(props.onSubmit);
      sinon.assert.calledWith(props.onSubmit, [
          moment.utc(Date.parse('2020-03-11T00:00:00.000Z')).subtract(30, 'days').valueOf(),
          Date.parse('2020-03-11T00:00:00.000Z'),
      ]);
    });

    it('should not call `onSubmit` if there are date validation errors and render error message', () => {
      const datesClearButton = () => wrapper.find('button.DateRangePickerInput_clearDates').hostNodes();
      const startDate = () => wrapper.find('#chart-start-date').hostNodes();
      const endDate = () => wrapper.find('#chart-end-date').hostNodes();
      const error = () => wrapper.find('#chart-dates-error').hostNodes();

      // Clear dates
      datesClearButton().simulate('click');
      expect(startDate().prop('value')).to.equal('');
      expect(endDate().prop('value')).to.equal('');
      expect(error()).to.have.lengthOf(0);

      submitButton().simulate('click');
      sinon.assert.notCalled(props.onSubmit);

      expect(error()).to.have.lengthOf(1);
      expect(error().text()).to.equal('Please select a date range');
    });

    it('should send metric for print options', () => {
      const datesRangeSelectedPreset = () => wrapper.find('#days-chart').find('.selected').hostNodes();

      // Change range to 30 days
      const datesRangePreset3 = wrapper.find('#days-chart').find('button').at(2).hostNodes();
      datesRangePreset3.simulate('click');

      expect(datesRangeSelectedPreset().prop('value')).to.equal(30);

      sinon.assert.notCalled(props.trackMetric);

      // Submit form
      submitButton().simulate('click');

      sinon.assert.calledWith(props.trackMetric, 'Set Custom Chart Dates', {
        chartType: 'basics',
        dateRange: '30 days',
      });
    });
  });

  it('should run `onClose` prop method when "Cancel" button is clicked', () => {
    const cancelButton = wrapper.find('button.chart-dates-cancel').hostNodes();
    cancelButton.simulate('click');
    sinon.assert.calledOnce(props.onClose);
  });

  it('should run `onClose` prop method when the close icon is clicked', () => {
    const closeIcon = wrapper.find('button[aria-label="close dialog"]').hostNodes();
    closeIcon.simulate('click');
    sinon.assert.calledOnce(props.onClose);
  });
});
