/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */

import React from 'react';
import moment from 'moment-timezone';
import { render, fireEvent } from '@testing-library/react';

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
    timePrefs: { timezoneName: 'UTC' },
    trackMetric: sinon.stub(),
  };

  let rendered;
  const get = (selector) => document.body.querySelector(selector);
  const getAll = (selector) => Array.from(document.body.querySelectorAll(selector));
  const numValue = el => Number(el.value);

  beforeEach(() => {
    localStorage.removeItem(enabledChartsLocalKey);
    localStorage.removeItem(defaultRangesLocalKey);
    rendered = render(<PrintDateRangeModal {...props} />);
  });

  afterEach(() => {
    rendered && rendered.unmount();
    props.onClose.reset();
    props.onClickPrint.reset();
    props.trackMetric.reset();
  });

  it('should be visible when open prop is true', () => {
    expect(get('.MuiDialog-container').style.opacity).to.equal('1');
    rendered.rerender(<PrintDateRangeModal {...props} open={false} />);
    expect(get('.MuiDialog-container').style.opacity).to.equal('0');
  });

  it('should provide toggles to enable/disable each chart, enabled by default', () => {
    expect(get('input[name="enabled-agpCGM"]').checked).to.be.true;
    expect(get('input[name="enabled-agpBGM"]').checked).to.be.true;
    expect(get('input[name="enabled-basics"]').checked).to.be.true;
    expect(get('input[name="enabled-bgLog"]').checked).to.be.true;
    expect(get('input[name="enabled-daily"]').checked).to.be.true;
    expect(get('input[name="enabled-settings"]').checked).to.be.true;
  });

  it('should hide a section\'s range presets and date fields when disabled', () => {
    const basicsToggle = get('input[name="enabled-basics"]');
    expect(get('#days-basics button')).to.exist;
    expect(get('#basics-end-date')).to.exist;
    expect(get('#basics-start-date')).to.exist;

    fireEvent.click(basicsToggle);

    expect(get('input[name="enabled-basics"]').checked).to.be.false;
    expect(get('#days-basics button')).to.not.exist;
    expect(get('#basics-end-date')).to.not.exist;
    expect(get('#basics-start-date')).to.not.exist;
  });

  it('should persist selected range presets and enabled state', () => {
    expect(localStorage[enabledChartsLocalKey]).to.be.undefined;
    expect(localStorage[defaultRangesLocalKey]).to.be.undefined;

    fireEvent.click(get('input[name="enabled-basics"]'));
    expect(localStorage[enabledChartsLocalKey]).to.eql(JSON.stringify({
      agpBGM: true,
      agpCGM: true,
      basics: false,
      bgLog: true,
      daily: true,
      settings: true,
    }));

    expect(numValue(get('#days-agpCGM .selected'))).to.equal(14);
    fireEvent.click(getAll('#days-agpCGM button')[0]);
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(7);

    expect(localStorage[defaultRangesLocalKey]).to.eql(JSON.stringify({
      agpBGM: 1,
      agpCGM: 0,
      basics: 0,
      bgLog: 2,
      daily: 0,
    }));

    // new render should load with the updated defaults from localStorage
    rendered.unmount();
    rendered = render(<PrintDateRangeModal {...props} />);
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(7);
    expect(get('input[name="enabled-basics"]').checked).to.be.false;
  });

  it('should provide appropriate date ranges and selected defaults for each applicable chart', () => {
    const agpCGMButtons = getAll('#days-agpCGM button');
    expect(numValue(agpCGMButtons[0])).to.equal(7);
    expect(numValue(agpCGMButtons[1])).to.equal(14);
    expect(numValue(agpCGMButtons[2])).to.equal(30);
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(14);

    const agpBGMButtons = getAll('#days-agpBGM button');
    expect(numValue(agpBGMButtons[0])).to.equal(14);
    expect(numValue(agpBGMButtons[1])).to.equal(30);
    expect(numValue(get('#days-agpBGM .selected'))).to.equal(30);

    const basicsButtons = getAll('#days-basics button');
    expect(numValue(basicsButtons[0])).to.equal(14);
    expect(numValue(basicsButtons[1])).to.equal(21);
    expect(numValue(basicsButtons[2])).to.equal(30);
    expect(numValue(get('#days-basics .selected'))).to.equal(14);

    const bgLogButtons = getAll('#days-bgLog button');
    expect(numValue(bgLogButtons[0])).to.equal(14);
    expect(numValue(bgLogButtons[1])).to.equal(21);
    expect(numValue(bgLogButtons[2])).to.equal(30);
    expect(numValue(get('#days-bgLog .selected'))).to.equal(30);

    const dailyButtons = getAll('#days-daily button');
    expect(numValue(dailyButtons[0])).to.equal(14);
    expect(numValue(dailyButtons[1])).to.equal(21);
    expect(numValue(dailyButtons[2])).to.equal(30);
    expect(numValue(get('#days-daily .selected'))).to.equal(14);
  });

  it('should provide appropriate date ranges and selected defaults for each applicable chart when invalid config stored in localStorage', () => {
    // Set invalid legacy localStorage (component was already rendered in beforeEach with clean state)
    localStorage.setItem(enabledChartsLocalKey, '{"agp":true,"basics":false,"bgLog":true,"daily":true,"settings":false}');
    localStorage.setItem(defaultRangesLocalKey, '{"agp":1,"basics":0,"bgLog":2,"daily":0}');

    // Component was mounted before invalid localStorage was set — verify defaults are still in effect
    expect(numValue(getAll('#days-agpCGM button')[0])).to.equal(7);
    expect(numValue(getAll('#days-agpCGM button')[1])).to.equal(14);
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(14); // default range still selected

    expect(numValue(getAll('#days-agpBGM button')[0])).to.equal(14);
    expect(numValue(getAll('#days-agpBGM button')[1])).to.equal(30);
    expect(numValue(get('#days-agpBGM .selected'))).to.equal(30); // default range still selected

    expect(numValue(getAll('#days-basics button')[0])).to.equal(14);
    expect(numValue(getAll('#days-basics button')[1])).to.equal(21);
    expect(numValue(getAll('#days-basics button')[2])).to.equal(30);
    expect(numValue(get('#days-basics .selected'))).to.equal(14);

    expect(numValue(getAll('#days-bgLog button')[0])).to.equal(14);
    expect(numValue(getAll('#days-bgLog button')[1])).to.equal(21);
    expect(numValue(getAll('#days-bgLog button')[2])).to.equal(30);
    expect(numValue(get('#days-bgLog .selected'))).to.equal(30);

    expect(numValue(getAll('#days-daily button')[0])).to.equal(14);
    expect(numValue(getAll('#days-daily button')[1])).to.equal(21);
    expect(numValue(getAll('#days-daily button')[2])).to.equal(30);
    expect(numValue(get('#days-daily .selected'))).to.equal(14);
  });

  it('should set appropriate default dates and timezone-adjusted values', () => {
    const dateFormat = 'MMM D, YYYY';

    expect(get('#basics-end-date').value).to.equal('Mar 10, 2020');
    expect(get('#basics-start-date').value).to.equal(
      moment.utc('Mar 10, 2020', dateFormat).subtract(14, 'days').format(dateFormat)
    );

    expect(get('#bgLog-end-date').value).to.equal('Mar 12, 2020');
    expect(get('#bgLog-start-date').value).to.equal(
      moment.utc('Mar 12, 2020', dateFormat).subtract(29, 'days').format(dateFormat)
    );

    expect(get('#daily-end-date').value).to.equal('Mar 5, 2020');
    expect(get('#daily-start-date').value).to.equal(
      moment.utc('Mar 5, 2020', dateFormat).subtract(13, 'days').format(dateFormat)
    );

    rendered.unmount();
    rendered = render(<PrintDateRangeModal {...{ ...props, timePrefs: { timezoneName: 'US/Pacific' } }} />);

    expect(get('#basics-end-date').value).to.equal('Mar 9, 2020 (5:00 PM)');
    expect(get('#basics-start-date').value).to.equal('Feb 24, 2020 (5:00 PM)');
  });

  context('form is submitted', () => {
    it('should call onClickPrint with expected options on submit', () => {
      fireEvent.click(get('input[name="enabled-bgLog"]'));
      fireEvent.click(getAll('#days-daily button')[2]);

      fireEvent.click(get('button.print-submit'));

      sinon.assert.calledOnce(props.onClickPrint);
      sinon.assert.calledWith(props.onClickPrint, {
        agpBGM: {
          disabled: false, endpoints: [
            moment.utc(Date.parse('2020-03-09T00:00:00.000Z')).subtract(30, 'days').valueOf(),
            Date.parse('2020-03-09T00:00:00.000Z'),
          ]
        },
        agpCGM: {
          disabled: false, endpoints: [
            moment.utc(Date.parse('2020-03-11T00:00:00.000Z')).subtract(14, 'days').valueOf(),
            Date.parse('2020-03-11T00:00:00.000Z'),
          ]
        },
        basics: {
          disabled: false, endpoints: [
            moment.utc(Date.parse('2020-03-10T00:00:00.000Z')).subtract(14, 'days').valueOf(),
            Date.parse('2020-03-10T00:00:00.000Z'),
          ]
        },
        bgLog: {
          disabled: true, endpoints: [
            moment.utc(Date.parse('2020-03-13T00:00:00.000Z')).subtract(30, 'days').valueOf(),
            Date.parse('2020-03-13T00:00:00.000Z'),
          ]
        },
        daily: {
          disabled: false, endpoints: [
            moment.utc(Date.parse('2020-03-06T00:00:00.000Z')).subtract(30, 'days').valueOf(),
            Date.parse('2020-03-06T00:00:00.000Z'),
          ]
        },
        settings: { disabled: false },
      });
    });

    it('should show validation errors and block submit when invalid', () => {
      fireEvent.click(get('#basics-content button.DateRangePickerInput_clearDates'));
      fireEvent.click(get('button.print-submit'));

      sinon.assert.notCalled(props.onClickPrint);
      expect(get('#basics-error').textContent).to.equal('Please select a date range');
    });

    it('should require at least one chart enabled before submit', () => {
      fireEvent.click(get('input[name="enabled-agpBGM"]'));
      fireEvent.click(get('input[name="enabled-agpCGM"]'));
      fireEvent.click(get('input[name="enabled-basics"]'));
      fireEvent.click(get('input[name="enabled-bgLog"]'));
      fireEvent.click(get('input[name="enabled-daily"]'));
      fireEvent.click(get('input[name="enabled-settings"]'));

      fireEvent.click(get('button.print-submit'));

      sinon.assert.notCalled(props.onClickPrint);
      expect(get('#general-print-error').textContent).to.equal('Please enable at least one chart to print');
    });

    it('should send metric for print options', () => {
      fireEvent.click(get('input[name="enabled-bgLog"]'));
      fireEvent.click(getAll('#days-daily button')[2]);
      fireEvent.click(get('button.print-submit'));

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
    fireEvent.click(get('button.print-cancel'));
    sinon.assert.calledOnce(props.onClose);
  });

  it('should run `onClose` prop method when the close icon is clicked', () => {
    fireEvent.click(get('button[aria-label="close dialog"]'));
    sinon.assert.calledOnce(props.onClose);
  });
});
