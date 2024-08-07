import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import BgRangeSummary from '../../../../app/components/clinic/BgRangeSummary';
import { MGDL_UNITS } from '../../../../app/core/constants';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global afterEach */
/* global after */

const expect = chai.expect;

describe('BgRangeSummary', () => {
  let mount;
  let wrapper;

  let defaultProps = {
    t: sinon.stub().callsFake((string) => string),
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

  before(() => {
    mount = createMount();
  });

  after(() => {
    mount.cleanUp();
  });

  beforeEach(() => {
    wrapper = mount(<BgRangeSummary {...defaultProps} />);
  });

  it('should show the bg range summary bars with appropriate widths', () => {
    const summaryBars = wrapper.find('.range-summary-bars').hostNodes();
    expect(summaryBars).to.have.lengthOf(1);

    const veryLow = summaryBars.find('.range-summary-bars-veryLow').hostNodes();
    expect(veryLow.props()['data-width']).to.equal('0.04%');

    const low = summaryBars.find('.range-summary-bars-low').hostNodes();
    expect(low.props()['data-width']).to.equal('0.4%');

    const target = summaryBars.find('.range-summary-bars-target').hostNodes();
    expect(target.props()['data-width']).to.equal('70%');

    const high = summaryBars.find('.range-summary-bars-high').hostNodes();
    expect(high.props()['data-width']).to.equal('25%');

    const veryHigh = summaryBars.find('.range-summary-bars-veryHigh').hostNodes();
    expect(veryHigh.props()['data-width']).to.equal('15%');
  });

  it('should show a popover with correct data', () => {
    const summaryBars = wrapper.find('.range-summary-bars').hostNodes();
    expect(summaryBars).to.have.lengthOf(1);

    const popover = () => wrapper.find('.range-summary-data').hostNodes();
    expect(popover()).to.have.lengthOf(1);

    expect(popover().props().style.visibility).to.equal('hidden');

    summaryBars.simulate('mouseover');
    expect(popover().props().style.visibility).to.be.undefined;

    const veryLow = popover().find('.range-summary-value-veryLow').hostNodes();
    expect(veryLow.text()).to.equal('0.04%');

    const low = popover().find('.range-summary-value-low').hostNodes();
    expect(low.text()).to.equal('0.4%');

    const target = popover().find('.range-summary-value-target').hostNodes();
    expect(target.text()).to.equal('70%');

    const high = popover().find('.range-summary-value-high').hostNodes();
    expect(high.text()).to.equal('25%');

    const veryHigh = popover().find('.range-summary-value-veryHigh').hostNodes();
    expect(veryHigh.text()).to.equal('15%');

    const veryLowRange = popover().find('.range-summary-range-veryLow').hostNodes();
    expect(veryLowRange.text()).to.equal('<54');

    const lowRange = popover().find('.range-summary-range-low').hostNodes();
    expect(lowRange.text()).to.equal('54-60');

    const targetRange = popover().find('.range-summary-range-target').hostNodes();
    expect(targetRange.text()).to.equal('60-190');

    const highRange = popover().find('.range-summary-range-high').hostNodes();
    expect(highRange.text()).to.equal('190-250');

    const veryHighRange = popover().find('.range-summary-range-veryHigh').hostNodes();
    expect(veryHighRange.text()).to.equal('>250');

    const bgUnits = popover().find('.range-summary-bg-units').hostNodes();
    expect(bgUnits.text()).to.equal('Units in mg/dL');

    const cgmUse = popover().find('.range-summary-cgm-use').hostNodes();
    expect(cgmUse.text()).to.equal('% CGM Use: 78 %');
  });

  context('has extremeHigh data', () => {
    beforeEach(() => {
      wrapper = mount(<BgRangeSummary {...{
        ...defaultProps,
        data: {
          ...defaultProps.data,
          extremeHigh: 0.03,
        },
      }} />);
    });

    it('should show the bg range summary bars with appropriate widths', () => {
      const summaryBars = wrapper.find('.range-summary-bars').hostNodes();
      expect(summaryBars).to.have.lengthOf(1);

      const veryLow = summaryBars.find('.range-summary-bars-veryLow').hostNodes();
      expect(veryLow.props()['data-width']).to.equal('0.04%');

      const low = summaryBars.find('.range-summary-bars-low').hostNodes();
      expect(low.props()['data-width']).to.equal('0.4%');

      const target = summaryBars.find('.range-summary-bars-target').hostNodes();
      expect(target.props()['data-width']).to.equal('70%');

      const high = summaryBars.find('.range-summary-bars-high').hostNodes();
      expect(high.props()['data-width']).to.equal('25%');

      const veryHigh = summaryBars.find('.range-summary-bars-veryHigh').hostNodes();
      expect(veryHigh.props()['data-width']).to.equal('12%'); // width is 15% reduced by the 3% width of extremeHigh

      const extremeHigh = summaryBars.find('.range-summary-bars-extremeHigh').hostNodes();
      expect(extremeHigh.props()['data-width']).to.equal('3%');
    });

    it('should show a popover with correct data', () => {
      const summaryBars = wrapper.find('.range-summary-bars').hostNodes();
      expect(summaryBars).to.have.lengthOf(1);

      const popover = () => wrapper.find('.range-summary-data').hostNodes();
      expect(popover()).to.have.lengthOf(1);

      expect(popover().props().style.visibility).to.equal('hidden');

      summaryBars.simulate('mouseover');
      expect(popover().props().style.visibility).to.be.undefined;

      const veryLow = popover().find('.range-summary-value-veryLow').hostNodes();
      expect(veryLow.text()).to.equal('0.04%');

      const low = popover().find('.range-summary-value-low').hostNodes();
      expect(low.text()).to.equal('0.4%');

      const target = popover().find('.range-summary-value-target').hostNodes();
      expect(target.text()).to.equal('70%');

      const high = popover().find('.range-summary-value-high').hostNodes();
      expect(high.text()).to.equal('25%');

      const veryHigh = popover().find('.range-summary-value-veryHigh').hostNodes();
      expect(veryHigh.text()).to.equal('15%');

      const extremeHigh = popover().find('.range-summary-value-extremeHigh').hostNodes();
      expect(extremeHigh.text()).to.equal('3%');

      const veryLowRange = popover().find('.range-summary-range-veryLow').hostNodes();
      expect(veryLowRange.text()).to.equal('<54');

      const lowRange = popover().find('.range-summary-range-low').hostNodes();
      expect(lowRange.text()).to.equal('54-60');

      const targetRange = popover().find('.range-summary-range-target').hostNodes();
      expect(targetRange.text()).to.equal('60-190');

      const highRange = popover().find('.range-summary-range-high').hostNodes();
      expect(highRange.text()).to.equal('190-250');

      const veryHighRange = popover().find('.range-summary-range-veryHigh').hostNodes();
      expect(veryHighRange.text()).to.equal('>250');

      const extremeHighRange = popover().find('.range-summary-range-extremeHigh').hostNodes();
      expect(extremeHighRange.text()).to.equal('>350');

      const bgUnits = popover().find('.range-summary-bg-units').hostNodes();
      expect(bgUnits.text()).to.equal('Units in mg/dL');

      const cgmUse = popover().find('.range-summary-cgm-use').hostNodes();
      expect(cgmUse.text()).to.equal('% CGM Use: 78 %');
    });
  });
});
