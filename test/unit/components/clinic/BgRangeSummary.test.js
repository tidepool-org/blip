import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import BgRangeSummary, { formatValue } from '../../../../app/components/clinic/BgRangeSummary';
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
    expect(veryLow.props().width).to.equal('0.04%');

    const low = summaryBars.find('.range-summary-bars-low').hostNodes();
    expect(low.props().width).to.equal('0.4%');

    const target = summaryBars.find('.range-summary-bars-target').hostNodes();
    expect(target.props().width).to.equal('70%');

    const high = summaryBars.find('.range-summary-bars-high').hostNodes();
    expect(high.props().width).to.equal('25%');

    const veryHigh = summaryBars.find('.range-summary-bars-veryHigh').hostNodes();
    expect(veryHigh.props().width).to.equal('15%');
  });

  it('should show a popover with correct data', () => {
    const summaryBars = wrapper.find('.range-summary-bars').hostNodes();
    expect(summaryBars).to.have.lengthOf(1);

    const popover = () => wrapper.find('.range-summary-data').hostNodes();
    expect(popover()).to.have.lengthOf(1);

    expect(popover().props().style.visibility).to.equal('hidden');

    summaryBars.simulate('mouseenter');
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
  });
});

describe('formatValue', () => {
  it('should round up for `veryLow` between 0 and 0.5 percent with 0.01 precision', () => {
    expect(formatValue(0.00001, 'veryLow')).to.equal('0.01');
    expect(formatValue(0.00052, 'veryLow')).to.equal('0.06');
    expect(formatValue(0.00242, 'veryLow')).to.equal('0.25');
    expect(formatValue(0.00436, 'veryLow')).to.equal('0.44');
  });
  it('should round down for `veryLow` from 0.5 up to 1 percent with 0.1 precision', () => {
    expect(formatValue(0.005, 'veryLow')).to.equal('0.5');
    expect(formatValue(0.0068, 'veryLow')).to.equal('0.6');
    expect(formatValue(0.0082, 'veryLow')).to.equal('0.8');
    expect(formatValue(0.0132, 'veryLow')).to.equal('1');
    expect(formatValue(0.015, 'veryLow')).to.equal('2');
  });
  it('should round down for `low` between 3 and 4 percent with 0.1 precision', () => {
    expect(formatValue(0.0327, 'low')).to.equal('3.2');
    expect(formatValue(0.0384, 'low')).to.equal('3.8');
    expect(formatValue(0.025, 'low')).to.equal('3');
    expect(formatValue(0.0462, 'low')).to.equal('5');
  });
  it('should round down for `target` between 69 and 70 percent with 0.1 precision', () => {
    expect(formatValue(0.6999, 'target')).to.equal('69.9');
    expect(formatValue(0.6942, 'target')).to.equal('69.4');
    expect(formatValue(0.685, 'target')).to.equal('69');
    expect(formatValue(0.705, 'target')).to.equal('71');
  });
  it('should round down for `high` between 24 and 25 percent with 0.1 precision', () => {
    expect(formatValue(0.2499, 'high')).to.equal('24.9');
    expect(formatValue(0.2442, 'high')).to.equal('24.4');
    expect(formatValue(0.235, 'high')).to.equal('24');
    expect(formatValue(0.255, 'high')).to.equal('26');
  });
  it('should round down for `veryHigh` between 4 and 5 percent with 0.1 precision', () => {
    expect(formatValue(0.0499, 'veryHigh')).to.equal('4.9');
    expect(formatValue(0.0442, 'veryHigh')).to.equal('4.4');
    expect(formatValue(0.035, 'veryHigh')).to.equal('4');
    expect(formatValue(0.055, 'veryHigh')).to.equal('6');
  });
  it('should use normal rounding with 1.0 precision for other values over 0.5 percent', () => {
    expect(formatValue(0.26459, 'veryHigh')).to.equal('26');
    expect(formatValue(0.00589, 'low')).to.equal('1');
  });
  it('should use normal rounding with 0.1 precision for other values under 0.5 and over 0.05', () => {
    expect(formatValue(0.0043, 'veryHigh')).to.equal('0.4');
    expect(formatValue(0.0035, 'high')).to.equal('0.4');
  });
  it('should use normal rounding with 0.01 precision for values under 0.05', () => {
    expect(formatValue(0.00043, 'veryHigh')).to.equal('0.04');
    expect(formatValue(0.00025, 'high')).to.equal('0.03');
  });
});
