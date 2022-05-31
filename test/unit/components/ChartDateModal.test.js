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

  let wrapper;
  beforeEach(() => {
    wrapper = mount( <ChartDateModal {...props} /> );
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

  it('should set default date as provided by props', () => {
    const dateFormat = 'MMM D, YYYY';
    // Note: we expect the start dates to show a date that is the preset range MINUS 1 day prior
    // to the end date, since the resulting date range goes from the first ms of the start date
    // to the last ms of the end date
    const date = wrapper.find('#chart-date').hostNodes();
    expect(date.prop('value')).to.equal('Mar 10, 2020');

    // Use 'US/Pacific' time zone
    const pacificWrapper = mount( <ChartDateModal {...{ ...props, timePrefs: { timezoneName: 'US/Pacific' } }} /> )

    const dateInPacific = pacificWrapper.find('#chart-date').hostNodes();

    expect(moment.utc('Mar 10, 2020', dateFormat).tz('US/Pacific').format(dateFormat)).to.equal('Mar 9, 2020');
    expect(dateInPacific.prop('value')).to.equal('Mar 9, 2020');
  });

  context('form is submitted', () => {
    let submitButton;

    beforeEach(() => {
      submitButton = () => wrapper.find('button.chart-dates-submit').hostNodes();
    });

    it('should call `onSubmit` prop method with appropriate print ranges and disabled statuses', () => {
      const date = wrapper.find('#chart-date').hostNodes();
      expect(date.prop('value')).to.equal('Mar 10, 2020');

      // Change date to Mar 1, 2020
      date.simulate('change', {
        target: { name: 'chart-date', value: 'Mar 1, 2020' }
      });

      // Submit form
      submitButton().simulate('click');
      sinon.assert.calledOnce(props.onSubmit);
      sinon.assert.calledWith(props.onSubmit, [
          Date.parse('2020-03-01T00:00:00.000Z'),
          Date.parse('2020-03-02T00:00:00.000Z'),
      ]);
    });

    it('should not call `onSubmit` if there are date validation errors and render error message', () => {
      const datesClearButton = () => wrapper.find('button.SingleDatePickerInput_clearDate').hostNodes();
      const date = () => wrapper.find('#chart-date').hostNodes();
      const error = () => wrapper.find('#chart-dates-error').hostNodes();

      // Clear dates
      datesClearButton().simulate('click');
      expect(date().prop('value')).to.equal('');
      expect(error()).to.have.lengthOf(0);

      submitButton().simulate('click');
      sinon.assert.notCalled(props.onSubmit);

      expect(error()).to.have.lengthOf(1);
      expect(error().text()).to.equal('Please select a date');
    });

    it('should send metric', () => {
      const date = wrapper.find('#chart-date').hostNodes();
      sinon.assert.notCalled(props.trackMetric);

      // Change date to Mar 1, 2020
      date.simulate('change', {
        target: { name: 'chart-date', value: 'Mar 1, 2020' }
      });

      // Submit form
      submitButton().simulate('click');

      sinon.assert.calledWith(props.trackMetric, 'Set Custom Chart Date', {
        chartType: 'daily',
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
