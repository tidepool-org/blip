import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BgRangeSummary } from '../../../../app/components/clinic/BgRangeSummary';
import { MGDL_UNITS } from '../../../../app/core/constants';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */

const expect = chai.expect;

describe('BgRangeSummary', () => {
  afterEach(cleanup);

  let defaultProps = {
    t: sinon.stub().callsFake((string, params) => params ? string.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] !== undefined ? params[k] : `{{${k}}}`) : string),
    bgUnits: MGDL_UNITS,
    data: {
      veryLow: 0.0004,
      low: 0.004,
      target: 0.7,
      high: 0.25,
      veryHigh: .15,
    },
    striped: false,
    cgmUsePercent: 0.78,
    targetRange: [60, 190],
  };

  it('should show the bg range summary bars with appropriate widths', () => {
    const { container } = render(<BgRangeSummary {...defaultProps} />);

    const summaryBars = container.querySelectorAll('.range-summary-bars');
    expect(summaryBars).to.have.lengthOf(1);

    const veryLow = summaryBars[0].querySelector('.range-summary-bars-veryLow');
    expect(veryLow.getAttribute('data-width')).to.equal('0.04%');

    const low = summaryBars[0].querySelector('.range-summary-bars-low');
    expect(low.getAttribute('data-width')).to.equal('0.4%');

    const target = summaryBars[0].querySelector('.range-summary-bars-target');
    expect(target.getAttribute('data-width')).to.equal('70%');

    const high = summaryBars[0].querySelector('.range-summary-bars-high');
    expect(high.getAttribute('data-width')).to.equal('25%');

    const veryHigh = summaryBars[0].querySelector('.range-summary-bars-veryHigh');
    expect(veryHigh.getAttribute('data-width')).to.equal('15%');
  });

  it('should show a popover with correct data', async () => {
    const { container } = render(<BgRangeSummary {...defaultProps} />);

    const summaryBars = container.querySelectorAll('.range-summary-bars');
    expect(summaryBars).to.have.lengthOf(1);

    const popover = () => document.querySelectorAll('.range-summary-data');
    expect(popover()).to.have.lengthOf(1);

    expect(popover()[0].style.visibility).to.equal('hidden');

    fireEvent.mouseOver(summaryBars[0]);
    await waitFor(() => {
      expect(popover()[0].style.visibility).to.equal('');
    });

    const veryLow = popover()[0].querySelector('.range-summary-value-veryLow');
    expect(veryLow.textContent).to.equal('0%');

    const low = popover()[0].querySelector('.range-summary-value-low');
    expect(low.textContent).to.equal('0%');

    const target = popover()[0].querySelector('.range-summary-value-target');
    expect(target.textContent).to.equal('70%');

    const high = popover()[0].querySelector('.range-summary-value-high');
    expect(high.textContent).to.equal('25%');

    const veryHigh = popover()[0].querySelector('.range-summary-value-veryHigh');
    expect(veryHigh.textContent).to.equal('15%');

    const veryLowRange = popover()[0].querySelector('.range-summary-range-veryLow');
    expect(veryLowRange.textContent).to.equal('<54');

    const lowRange = popover()[0].querySelector('.range-summary-range-low');
    expect(lowRange.textContent).to.equal('54-59');

    const targetRange = popover()[0].querySelector('.range-summary-range-target');
    expect(targetRange.textContent).to.equal('60-190');

    const highRange = popover()[0].querySelector('.range-summary-range-high');
    expect(highRange.textContent).to.equal('191-250');

    const veryHighRange = popover()[0].querySelector('.range-summary-range-veryHigh');
    expect(veryHighRange.textContent).to.equal('>250');

    const bgUnits = popover()[0].querySelector('.range-summary-bg-units');
    expect(bgUnits.textContent).to.equal('Units in mg/dL');

    const cgmUse = popover()[0].querySelector('.range-summary-cgm-use');
    expect(cgmUse.textContent).to.equal('% CGM Use: 78 %');
  });

  context('has extremeHigh data', () => {
    it('should show the bg range summary bars with appropriate widths', () => {
      const { container } = render(<BgRangeSummary {...{
        ...defaultProps,
        data: {
          ...defaultProps.data,
          extremeHigh: 0.03,
        },
      }} />);

      const summaryBars = container.querySelectorAll('.range-summary-bars');
      expect(summaryBars).to.have.lengthOf(1);

      const veryLow = summaryBars[0].querySelector('.range-summary-bars-veryLow');
      expect(veryLow.getAttribute('data-width')).to.equal('0.04%');

      const low = summaryBars[0].querySelector('.range-summary-bars-low');
      expect(low.getAttribute('data-width')).to.equal('0.4%');

      const target = summaryBars[0].querySelector('.range-summary-bars-target');
      expect(target.getAttribute('data-width')).to.equal('70%');

      const high = summaryBars[0].querySelector('.range-summary-bars-high');
      expect(high.getAttribute('data-width')).to.equal('25%');

      const veryHigh = summaryBars[0].querySelector('.range-summary-bars-veryHigh');
      expect(veryHigh.getAttribute('data-width')).to.equal('12%');

      const extremeHigh = summaryBars[0].querySelector('.range-summary-bars-extremeHigh');
      expect(extremeHigh.getAttribute('data-width')).to.equal('3%');
    });

    it('should show a popover with correct data', async () => {
      const { container } = render(<BgRangeSummary {...{
        ...defaultProps,
        data: {
          ...defaultProps.data,
          extremeHigh: 0.03,
        },
      }} />);

      const summaryBars = container.querySelectorAll('.range-summary-bars');
      expect(summaryBars).to.have.lengthOf(1);

      const popover = () => document.querySelectorAll('.range-summary-data');
      expect(popover()).to.have.lengthOf(1);

      expect(popover()[0].style.visibility).to.equal('hidden');

      fireEvent.mouseOver(summaryBars[0]);
      await waitFor(() => {
        expect(popover()[0].style.visibility).to.equal('');
      });

      const veryLow = popover()[0].querySelector('.range-summary-value-veryLow');
      expect(veryLow.textContent).to.equal('0%');

      const low = popover()[0].querySelector('.range-summary-value-low');
      expect(low.textContent).to.equal('0%');

      const target = popover()[0].querySelector('.range-summary-value-target');
      expect(target.textContent).to.equal('70%');

      const high = popover()[0].querySelector('.range-summary-value-high');
      expect(high.textContent).to.equal('25%');

      const veryHigh = popover()[0].querySelector('.range-summary-value-veryHigh');
      expect(veryHigh.textContent).to.equal('15%');

      const extremeHigh = popover()[0].querySelector('.range-summary-value-extremeHigh');
      expect(extremeHigh.textContent).to.equal('3%');

      const veryLowRange = popover()[0].querySelector('.range-summary-range-veryLow');
      expect(veryLowRange.textContent).to.equal('<54');

      const lowRange = popover()[0].querySelector('.range-summary-range-low');
      expect(lowRange.textContent).to.equal('54-59');

      const targetRange = popover()[0].querySelector('.range-summary-range-target');
      expect(targetRange.textContent).to.equal('60-190');

      const highRange = popover()[0].querySelector('.range-summary-range-high');
      expect(highRange.textContent).to.equal('191-250');

      const veryHighRange = popover()[0].querySelector('.range-summary-range-veryHigh');
      expect(veryHighRange.textContent).to.equal('>250');

      const extremeHighRange = popover()[0].querySelector('.range-summary-range-extremeHigh');
      expect(extremeHighRange.textContent).to.equal('>350');

      const bgUnits = popover()[0].querySelector('.range-summary-bg-units');
      expect(bgUnits.textContent).to.equal('Units in mg/dL');

      const cgmUse = popover()[0].querySelector('.range-summary-cgm-use');
      expect(cgmUse.textContent).to.equal('% CGM Use: 78 %');
    });
  });
});
