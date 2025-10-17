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

import PrintDateRangeModal from '../../../app/components/PrintDateRangeModal';

const expect = chai.expect;

describe('PrintDateRangeModal', function () {
  const loggedInUserId = 'clinicianUserId123';
  const enabledChartsLocalKey = `${loggedInUserId}_PDFChartsEnabled`;
  const defaultRangesLocalKey = `${loggedInUserId}_PDFChartsSelectedRangeIndices`;

  const props = {
    loggedInUserId,
    mostRecentDatumDates: {
      agpBGM: Date.parse('2020-03-08T00:00:00.000Z'),
      agpCGM: Date.parse('2020-03-10T00:00:00.000Z'),
      basics: Date.parse('2020-03-10T00:00:00.000Z'),
      bgLog: Date.parse('2020-03-12T00:00:00.000Z'),
      daily: Date.parse('2020-03-05T00:00:00.000Z'),
    },
    open: true,
    onClose: sinon.stub(),
    onClickPrint: sinon.stub(),
    processing: false,
    timePrefs: {
      timezoneName: 'UTC',
    },
    trackMetric: sinon.stub(),
  };

  let wrapper;

  beforeEach(() => {
    delete localStorage[enabledChartsLocalKey];
    delete localStorage[defaultRangesLocalKey];
    wrapper = mount(<PrintDateRangeModal {...props} />);
  });

  afterEach(() => {
    props.onClose.reset();
    props.onClickPrint.reset();
    props.trackMetric.reset();
  });

  it('should be visible when open prop is true', () => {
    const dialog = () => wrapper.find('.MuiDialog-container').hostNodes();
    expect(dialog().prop('style').opacity).to.equal(1);

    wrapper.setProps({ ...props, open: false });
    wrapper.update();

    expect(dialog().prop('style').opacity).to.equal(0);
  });

  it('should provide toggles to enable/disable each chart, enabled by default', () => {
    const agpCGMToggle = wrapper.find('input[name="enabled-agpCGM"]').hostNodes();
    expect(agpCGMToggle).to.have.lengthOf(1);
    expect(agpCGMToggle.prop('checked')).to.be.true;

    const agpBGMToggle = wrapper.find('input[name="enabled-agpBGM"]').hostNodes();
    expect(agpBGMToggle).to.have.lengthOf(1);
    expect(agpBGMToggle.prop('checked')).to.be.true;

    const basicsToggle = wrapper.find('input[name="enabled-basics"]').hostNodes();
    expect(basicsToggle).to.have.lengthOf(1);
    expect(basicsToggle.prop('checked')).to.be.true;

    const bgLogToggle = wrapper.find('input[name="enabled-bgLog"]').hostNodes();
    expect(bgLogToggle).to.have.lengthOf(1);
    expect(bgLogToggle.prop('checked')).to.be.true;

    const dailyToggle = wrapper.find('input[name="enabled-daily"]').hostNodes();
    expect(dailyToggle).to.have.lengthOf(1);
    expect(dailyToggle.prop('checked')).to.be.true;

    const settingsToggle = wrapper.find('input[name="enabled-settings"]').hostNodes();
    expect(settingsToggle).to.have.lengthOf(1);
    expect(settingsToggle.prop('checked')).to.be.true;
  });

  it('should hide a section\'s range presets and date fields when disabled', () => {
    const basicsToggle = () => wrapper.find('input[name="enabled-basics"]').hostNodes();
    const basicsDatesRangePreset1 = () => wrapper.find('#days-basics').find('button').at(0).hostNodes();
    const basicsEndDate = () => wrapper.find('#basics-end-date').hostNodes();
    const basicsStartDate = () => wrapper.find('#basics-start-date').hostNodes();

    expect(basicsToggle()).to.have.lengthOf(1);
    expect(basicsDatesRangePreset1()).to.have.lengthOf(1);
    expect(basicsEndDate()).to.have.lengthOf(1);
    expect(basicsStartDate()).to.have.lengthOf(1);

    expect(basicsToggle().prop('checked')).to.be.true;

    basicsToggle().simulate('click');

    expect(basicsToggle().prop('checked')).to.be.false;

    expect(basicsToggle()).to.have.lengthOf(1);
    expect(basicsDatesRangePreset1()).to.have.lengthOf(0);
    expect(basicsEndDate()).to.have.lengthOf(0);
    expect(basicsStartDate()).to.have.lengthOf(0);
  });

  it('should persist a users\'s selected range presets and enabled state for each section', () => {
    expect(localStorage[enabledChartsLocalKey]).to.be.undefined;
    expect(localStorage[defaultRangesLocalKey]).to.be.undefined;
    const basicsToggle = (wrap = wrapper) => wrap.find('input[name="enabled-basics"]').hostNodes();

    expect(basicsToggle().prop('checked')).to.be.true;
    basicsToggle().simulate('click');
    expect(basicsToggle().prop('checked')).to.be.false;
    expect(localStorage[enabledChartsLocalKey]).to.eql(JSON.stringify({
      agpBGM: true,
      agpCGM: true,
      basics: false,
      bgLog: true,
      daily: true,
      settings: true,
    }));

    const agpCGMDatesRangePreset1 = () => wrapper.find('#days-agpCGM').find('button').at(0).hostNodes();
    const agpCGMDatesRangePreset2 = () => wrapper.find('#days-agpCGM').find('button').at(1).hostNodes();
    const agpCGMDatesRangeSelectedPreset = (wrap = wrapper) => wrap.find('#days-agpCGM').find('.selected').hostNodes();

    expect(agpCGMDatesRangePreset1().prop('value')).to.equal(7);
    expect(agpCGMDatesRangePreset2().prop('value')).to.equal(14);
    expect(agpCGMDatesRangeSelectedPreset().prop('value')).to.equal(14); // index 1 in preset list

    agpCGMDatesRangePreset1().simulate('click');
    expect(agpCGMDatesRangeSelectedPreset().prop('value')).to.equal(7); // index 0 in preset list

    expect(localStorage[defaultRangesLocalKey]).to.eql(JSON.stringify({
      agpBGM: 1,
      agpCGM: 0, // stored preset option at index 0
      basics: 0,
      bgLog: 2,
      daily: 0,
    }));

    // new wrapper should load with the updated defaults from localStorage
    const newWrapper = mount(<PrintDateRangeModal {...props} />);
    expect(agpCGMDatesRangeSelectedPreset(newWrapper).prop('value')).to.equal(7);
    expect(basicsToggle(newWrapper).prop('checked')).to.be.false;
  });

  it('should provide appropriate date ranges and selected defaults for each applicable chart', () => {
    const agpCGMDatesRangePreset1 = wrapper.find('#days-agpCGM').find('button').at(0).hostNodes();
    const agpCGMDatesRangePreset2 = wrapper.find('#days-agpCGM').find('button').at(1).hostNodes();
    const agpCGMDatesRangePreset3 = wrapper.find('#days-agpCGM').find('button').at(2).hostNodes();
    const agpCGMDatesRangeSelectedPreset = wrapper.find('#days-agpCGM').find('.selected').hostNodes();

    expect(agpCGMDatesRangePreset1.prop('value')).to.equal(7);
    expect(agpCGMDatesRangePreset2.prop('value')).to.equal(14);
    expect(agpCGMDatesRangePreset3.prop('value')).to.equal(30);
    expect(agpCGMDatesRangeSelectedPreset.prop('value')).to.equal(14);

    const agpBGMDatesRangePreset1 = wrapper.find('#days-agpBGM').find('button').at(0).hostNodes();
    const agpBGMDatesRangePreset2 = wrapper.find('#days-agpBGM').find('button').at(1).hostNodes();
    const agpBGMDatesRangeSelectedPreset = wrapper.find('#days-agpBGM').find('.selected').hostNodes();

    expect(agpBGMDatesRangePreset1.prop('value')).to.equal(14);
    expect(agpBGMDatesRangePreset2.prop('value')).to.equal(30);
    expect(agpBGMDatesRangeSelectedPreset.prop('value')).to.equal(30);

    const basicsDatesRangePreset1 = wrapper.find('#days-basics').find('button').at(0).hostNodes();
    const basicsDatesRangePreset2 = wrapper.find('#days-basics').find('button').at(1).hostNodes();
    const basicsDatesRangePreset3 = wrapper.find('#days-basics').find('button').at(2).hostNodes();
    const basicsDatesRangeSelectedPreset = wrapper.find('#days-basics').find('.selected').hostNodes();

    expect(basicsDatesRangePreset1.prop('value')).to.equal(14);
    expect(basicsDatesRangePreset2.prop('value')).to.equal(21);
    expect(basicsDatesRangePreset3.prop('value')).to.equal(30);
    expect(basicsDatesRangeSelectedPreset.prop('value')).to.equal(14);

    const bgLogDatesRangePreset1 = wrapper.find('#days-bgLog').find('button').at(0).hostNodes();
    const bgLogDatesRangePreset2 = wrapper.find('#days-bgLog').find('button').at(1).hostNodes();
    const bgLogDatesRangePreset3 = wrapper.find('#days-bgLog').find('button').at(2).hostNodes();
    const bgLogDatesRangeSelectedPreset = wrapper.find('#days-bgLog').find('.selected').hostNodes();

    expect(bgLogDatesRangePreset1.prop('value')).to.equal(14);
    expect(bgLogDatesRangePreset2.prop('value')).to.equal(21);
    expect(bgLogDatesRangePreset3.prop('value')).to.equal(30);
    expect(bgLogDatesRangeSelectedPreset.prop('value')).to.equal(30);

    const dailyDatesRangePreset1 = wrapper.find('#days-daily').find('button').at(0).hostNodes();
    const dailyDatesRangePreset2 = wrapper.find('#days-daily').find('button').at(1).hostNodes();
    const dailyDatesRangePreset3 = wrapper.find('#days-daily').find('button').at(2).hostNodes();
    const dailyDatesRangeSelectedPreset = wrapper.find('#days-daily').find('.selected').hostNodes();

    expect(dailyDatesRangePreset1.prop('value')).to.equal(14);
    expect(dailyDatesRangePreset2.prop('value')).to.equal(21);
    expect(dailyDatesRangePreset3.prop('value')).to.equal(30);
    expect(dailyDatesRangeSelectedPreset.prop('value')).to.equal(14);
  });

  it('should provide appropriate date ranges and selected defaults for each applicable chart when invalid config stored in localStorage', () => {
    localStorage.setItem(enabledChartsLocalKey, '{"agp":true,"basics":false,"bgLog":true,"daily":true,"settings":false}');
    localStorage.setItem(defaultRangesLocalKey, '{"agp":1,"basics":0,"bgLog":2,"daily":0}');

    expect(localStorage[enabledChartsLocalKey]).to.eql(JSON.stringify({
      agp: true, // legacy, invalid preset option
      basics: false,
      bgLog: true,
      daily: true,
      settings: false,
    }));

    expect(localStorage[defaultRangesLocalKey]).to.eql(JSON.stringify({
      agp: 1, // legacy, invalid preset option
      basics: 0,
      bgLog: 2,
      daily: 0,
    }));

    const agpCGMDatesRangePreset1 = wrapper.find('#days-agpCGM').find('button').at(0).hostNodes();
    const agpCGMDatesRangePreset2 = wrapper.find('#days-agpCGM').find('button').at(1).hostNodes();
    const agpCGMDatesRangeSelectedPreset = wrapper.find('#days-agpCGM').find('.selected').hostNodes();

    expect(agpCGMDatesRangePreset1.prop('value')).to.equal(7);
    expect(agpCGMDatesRangePreset2.prop('value')).to.equal(14);
    expect(agpCGMDatesRangeSelectedPreset.prop('value')).to.equal(14); // default range still selected

    const agpBGMDatesRangePreset1 = wrapper.find('#days-agpBGM').find('button').at(0).hostNodes();
    const agpBGMDatesRangePreset2 = wrapper.find('#days-agpBGM').find('button').at(1).hostNodes();
    const agpBGMDatesRangeSelectedPreset = wrapper.find('#days-agpBGM').find('.selected').hostNodes();

    expect(agpBGMDatesRangePreset1.prop('value')).to.equal(14);
    expect(agpBGMDatesRangePreset2.prop('value')).to.equal(30);
    expect(agpBGMDatesRangeSelectedPreset.prop('value')).to.equal(30);// default range still selected

    const basicsDatesRangePreset1 = wrapper.find('#days-basics').find('button').at(0).hostNodes();
    const basicsDatesRangePreset2 = wrapper.find('#days-basics').find('button').at(1).hostNodes();
    const basicsDatesRangePreset3 = wrapper.find('#days-basics').find('button').at(2).hostNodes();
    const basicsDatesRangeSelectedPreset = wrapper.find('#days-basics').find('.selected').hostNodes();

    expect(basicsDatesRangePreset1.prop('value')).to.equal(14);
    expect(basicsDatesRangePreset2.prop('value')).to.equal(21);
    expect(basicsDatesRangePreset3.prop('value')).to.equal(30);
    expect(basicsDatesRangeSelectedPreset.prop('value')).to.equal(14);

    const bgLogDatesRangePreset1 = wrapper.find('#days-bgLog').find('button').at(0).hostNodes();
    const bgLogDatesRangePreset2 = wrapper.find('#days-bgLog').find('button').at(1).hostNodes();
    const bgLogDatesRangePreset3 = wrapper.find('#days-bgLog').find('button').at(2).hostNodes();
    const bgLogDatesRangeSelectedPreset = wrapper.find('#days-bgLog').find('.selected').hostNodes();

    expect(bgLogDatesRangePreset1.prop('value')).to.equal(14);
    expect(bgLogDatesRangePreset2.prop('value')).to.equal(21);
    expect(bgLogDatesRangePreset3.prop('value')).to.equal(30);
    expect(bgLogDatesRangeSelectedPreset.prop('value')).to.equal(30);

    const dailyDatesRangePreset1 = wrapper.find('#days-daily').find('button').at(0).hostNodes();
    const dailyDatesRangePreset2 = wrapper.find('#days-daily').find('button').at(1).hostNodes();
    const dailyDatesRangePreset3 = wrapper.find('#days-daily').find('button').at(2).hostNodes();
    const dailyDatesRangeSelectedPreset = wrapper.find('#days-daily').find('.selected').hostNodes();

    expect(dailyDatesRangePreset1.prop('value')).to.equal(14);
    expect(dailyDatesRangePreset2.prop('value')).to.equal(21);
    expect(dailyDatesRangePreset3.prop('value')).to.equal(30);
    expect(dailyDatesRangeSelectedPreset.prop('value')).to.equal(14);
  });

  it('should set appropriate default dates for each applicable chart based on most recent datum dates', () => {
    const dateFormat = 'MMM D, YYYY';
    const basicsEndDate = wrapper.find('#basics-end-date').hostNodes();
    const basicsStartDate = wrapper.find('#basics-start-date').hostNodes();
    expect(basicsEndDate.prop('value')).to.equal('Mar 10, 2020');
    expect(basicsStartDate.prop('value')).to.equal(moment.utc('Mar 10, 2020', dateFormat).subtract(14, 'days').format(dateFormat));

    // Note: we expect the start dates to show a date that is the preset range MINUS 1 day prior
    // to the end date, since the resulting date range goes from the first ms of the start date
    // to the last ms of the end date

    const bgLogEndDate = wrapper.find('#bgLog-end-date').hostNodes();
    const bgLogStartDate = wrapper.find('#bgLog-start-date').hostNodes();
    expect(bgLogEndDate.prop('value')).to.equal('Mar 12, 2020');
    expect(bgLogStartDate.prop('value')).to.equal(moment.utc('Mar 12, 2020', dateFormat).subtract(30 - 1, 'days').format(dateFormat));

    const dailyEndDate = wrapper.find('#daily-end-date').hostNodes();
    const dailyStartDate = wrapper.find('#daily-start-date').hostNodes();
    expect(dailyEndDate.prop('value')).to.equal('Mar 5, 2020');
    expect(dailyStartDate.prop('value')).to.equal(moment.utc('Mar 5, 2020', dateFormat).subtract(14 - 1, 'days').format(dateFormat));

    // Use 'US/Pacific' time zone
    const pacificWrapper = mount( <PrintDateRangeModal {...{ ...props, timePrefs: { timezoneName: 'US/Pacific' } }} /> );

    const basicsEndDateInPacific = pacificWrapper.find('#basics-end-date').hostNodes();
    const basicsStartDateInPacific = pacificWrapper.find('#basics-start-date').hostNodes();

    expect(moment.utc('Mar 10, 2020', dateFormat).tz('US/Pacific').format(dateFormat)).to.equal('Mar 9, 2020');
    expect(basicsEndDateInPacific.prop('value')).to.equal('Mar 9, 2020 (5:00 PM)');

    expect(moment.utc('Mar 10, 2020', dateFormat).tz('US/Pacific').subtract(14 - 1, 'days').format(dateFormat)).to.equal('Feb 25, 2020');
    expect(basicsStartDateInPacific.prop('value')).to.equal('Feb 24, 2020 (5:00 PM)');
  });

  context('form is submitted', () => {
    let submitButton;

    beforeEach(() => {
      submitButton = () => wrapper.find('button.print-submit').hostNodes();
    });

    it('should call `onClickPrint` prop method with appropriate print ranges and disabled statuses', () => {
      // Disable bgLog chart
      const bgLogToggle = () => wrapper.find('input[name="enabled-bgLog"]').hostNodes();
      bgLogToggle().simulate('click');
      expect(bgLogToggle().prop('checked')).to.be.false;

      // Change daily range from 14 days to 30
      const dailyDatesRangeSelectedPreset = () => wrapper.find('#days-daily').find('.selected').hostNodes();
      expect(dailyDatesRangeSelectedPreset().prop('value')).to.equal(14);
      const dailyDatesRangePreset3 = wrapper.find('#days-daily').find('button').at(2).hostNodes();
      dailyDatesRangePreset3.simulate('click');

      expect(dailyDatesRangeSelectedPreset().prop('value')).to.equal(30);

      // Submit form
      submitButton().simulate('click');
      sinon.assert.calledOnce(props.onClickPrint);
      sinon.assert.calledWith(props.onClickPrint, {
        agpBGM: { disabled: false, endpoints: [
          moment.utc(Date.parse('2020-03-09T00:00:00.000Z')).subtract(30, 'days').valueOf(),
          Date.parse('2020-03-09T00:00:00.000Z'),
        ] },
        agpCGM: { disabled: false, endpoints: [
          moment.utc(Date.parse('2020-03-11T00:00:00.000Z')).subtract(14, 'days').valueOf(),
          Date.parse('2020-03-11T00:00:00.000Z'),
        ] },
        basics: { disabled: false, endpoints: [
          moment.utc(Date.parse('2020-03-10T00:00:00.000Z')).subtract(14, 'days').valueOf(),
          Date.parse('2020-03-10T00:00:00.000Z'),
        ] },
        bgLog: { disabled: true, endpoints: [ // Disabled ✓
          moment.utc(Date.parse('2020-03-13T00:00:00.000Z')).subtract(30, 'days').valueOf(),
          Date.parse('2020-03-13T00:00:00.000Z'),
        ] },
        daily: { disabled: false, endpoints: [ // 30 day range ✓
          moment.utc(Date.parse('2020-03-06T00:00:00.000Z')).subtract(30, 'days').valueOf(),
          Date.parse('2020-03-06T00:00:00.000Z'),
        ] },
        settings: { disabled: false },
      });
    });

    it('should not call `onClickPrint` if there are date validation errors and render error message', () => {
      const basicsDatesClearButton = () => wrapper.find('#basics-content').find('button.DateRangePickerInput_clearDates').hostNodes();
      const basicsStartDate = () => wrapper.find('#basics-start-date').hostNodes();
      const basicsEndDate = () => wrapper.find('#basics-end-date').hostNodes();
      const basicsError = () => wrapper.find('#basics-error').hostNodes();

      // Clear basics dates
      basicsDatesClearButton().simulate('click');
      expect(basicsStartDate().prop('value')).to.equal('');
      expect(basicsEndDate().prop('value')).to.equal('');
      expect(basicsError()).to.have.lengthOf(0);

      submitButton().simulate('click');
      sinon.assert.notCalled(props.onClickPrint);

      expect(basicsError()).to.have.lengthOf(1);
      expect(basicsError().text()).to.equal('Please select a date range');
    });

    it('should not call `onClickPrint` if there are no enabled charts and render error message', () => {
      const agpBGMToggle = () => wrapper.find('input[name="enabled-agpBGM"]').hostNodes();
      expect(agpBGMToggle()).to.have.lengthOf(1);
      expect(agpBGMToggle().prop('checked')).to.be.true;

      const agpCGMToggle = () => wrapper.find('input[name="enabled-agpCGM"]').hostNodes();
      expect(agpCGMToggle()).to.have.lengthOf(1);
      expect(agpCGMToggle().prop('checked')).to.be.true;

      const basicsToggle = () => wrapper.find('input[name="enabled-basics"]').hostNodes();
      expect(basicsToggle()).to.have.lengthOf(1);
      expect(basicsToggle().prop('checked')).to.be.true;

      const bgLogToggle = () => wrapper.find('input[name="enabled-bgLog"]').hostNodes();
      expect(bgLogToggle()).to.have.lengthOf(1);
      expect(bgLogToggle().prop('checked')).to.be.true;

      const dailyToggle = () => wrapper.find('input[name="enabled-daily"]').hostNodes();
      expect(dailyToggle()).to.have.lengthOf(1);
      expect(dailyToggle().prop('checked')).to.be.true;

      const settingsToggle = () => wrapper.find('input[name="enabled-settings"]').hostNodes();
      expect(settingsToggle()).to.have.lengthOf(1);
      expect(settingsToggle().prop('checked')).to.be.true;

      agpBGMToggle().simulate('click');
      agpCGMToggle().simulate('click');
      basicsToggle().simulate('click');
      bgLogToggle().simulate('click');
      dailyToggle().simulate('click');
      settingsToggle().simulate('click');

      expect(agpBGMToggle().prop('checked')).to.be.false;
      expect(agpCGMToggle().prop('checked')).to.be.false;
      expect(basicsToggle().prop('checked')).to.be.false;
      expect(bgLogToggle().prop('checked')).to.be.false;
      expect(dailyToggle().prop('checked')).to.be.false;
      expect(settingsToggle().prop('checked')).to.be.false;

      submitButton().simulate('click');
      sinon.assert.notCalled(props.onClickPrint);

      const generalError = () => wrapper.find('#general-print-error').hostNodes();
      expect(generalError()).to.have.lengthOf(1);
      expect(generalError().text()).to.equal('Please enable at least one chart to print');
    });

    it('should send metric for print options', () => {
      // Disable bgLog chart
      const bgLogToggle = () => wrapper.find('input[name="enabled-bgLog"]').hostNodes();
      bgLogToggle().simulate('click');
      expect(bgLogToggle().prop('checked')).to.be.false;

      // Change daily range from 14 days to 30
      const dailyDatesRangeSelectedPreset = () => wrapper.find('#days-daily').find('.selected').hostNodes();
      expect(dailyDatesRangeSelectedPreset().prop('value')).to.equal(14);
      const dailyDatesRangePreset3 = wrapper.find('#days-daily').find('button').at(2).hostNodes();
      dailyDatesRangePreset3.simulate('click');

      expect(dailyDatesRangeSelectedPreset().prop('value')).to.equal(30);

      sinon.assert.notCalled(props.trackMetric);

      // Submit form
      submitButton().simulate('click');

      sinon.assert.calledWith(props.trackMetric, 'Submitted Print Options', {
        agpBGM: '30 days',
        agpCGM: '14 days',
        basics: '14 days',
        bgLog: 'disabled',
        daily: '30 days',
        settings: 'enabled'
      });
    });
  });

  it('should run `onClose` prop method when "Cancel" button is clicked', () => {
    const cancelButton = wrapper.find('button.print-cancel').hostNodes();
    cancelButton.simulate('click');
    sinon.assert.calledOnce(props.onClose);
  });

  it('should run `onClose` prop method when the close icon is clicked', () => {
    const closeIcon = wrapper.find('button[aria-label="close dialog"]').hostNodes();
    closeIcon.simulate('click');
    sinon.assert.calledOnce(props.onClose);
  });
});
