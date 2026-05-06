/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { render, fireEvent, cleanup } from '@testing-library/react';

import CgmSampleIntervalRangeToggle from '../../../../app/components/chart/cgmSampleIntervalRangeToggle';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE } from '../../../../app/core/constants';

jest.mock('@tidepool/viz', () => {
  const actual = jest.requireActual('@tidepool/viz');
  return {
    ...actual,
    components: {
      ...actual.components,
    TwoOptionToggle: ({ left, right, toggleFn }) => (
      <button
        type="button"
        data-testid="two-option-toggle"
        data-left-state={String(left.state)}
        data-right-state={String(right.state)}
        onClick={toggleFn}
      >
        {left.label}/{right.label}
      </button>
    ),
    CgmSampleIntervalTooltip: () => <div data-testid="cgm-tooltip" />,
    },
  };
});

const expect = chai.expect;

describe('CgmSampleIntervalRangeToggle', () => {
  const props = {
    chartPrefs: {
      daily: {
        cgmSampleIntervalRange: DEFAULT_CGM_SAMPLE_INTERVAL_RANGE,
      },
    },
    chartType: 'daily',
    onClickCgmSampleIntervalRangeToggle: sinon.stub(),
    t: sinon.stub().callsFake(string => string),
  };

  const renderToggle = (overrideProps = {}) => {
    cleanup();
    const rendered = render(
      <CgmSampleIntervalRangeToggle.WrappedComponent {..._.assign({}, props, overrideProps)} />
    );
    return rendered.getByTestId('two-option-toggle');
  };

  afterEach(() => {
    props.onClickCgmSampleIntervalRangeToggle.resetHistory();
    props.t.resetHistory();
  });

  it('should activate the appropriate sampleInterval when chartPrefs sampleInterval prop changes', () => {
    let toggle = renderToggle();

    expect(toggle.textContent).to.contain('1 min Data');
    expect(toggle.dataset.leftState).to.equal('false');

    expect(toggle.dataset.rightState).to.equal('true');

    toggle = renderToggle({
      chartPrefs: {
        daily: {
          cgmSampleIntervalRange: ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE,
        },
      },
    });

    expect(toggle.textContent).to.contain('1 min Data');
    expect(toggle.dataset.leftState).to.equal('true');

    expect(toggle.dataset.rightState).to.equal('false');
  });

  it('should fall back to the default cgm sample range when cgmSampleIntervalRange is not available in chartPrefs', () => {
    let toggle = renderToggle();

    expect(toggle.textContent).to.contain('1 min Data');
    expect(toggle.dataset.leftState).to.equal('false');

    expect(toggle.dataset.rightState).to.equal('true');

    toggle = renderToggle({
      chartPrefs: {
        daily: {
          cgmSampleIntervalRange: undefined,
        },
      },
    });

    expect(toggle.textContent).to.contain('1 min Data');
    expect(toggle.dataset.leftState).to.equal('false');

    expect(toggle.dataset.rightState).to.equal('true');
  });

  it('should call the click handler with new cgmSampleInterval prop when clicked', () => {
    let toggle = renderToggle();

    sinon.assert.callCount(props.onClickCgmSampleIntervalRangeToggle, 0);

    fireEvent.click(toggle);

    sinon.assert.callCount(props.onClickCgmSampleIntervalRangeToggle, 1);
    sinon.assert.calledWith(props.onClickCgmSampleIntervalRangeToggle, sinon.match({}), ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE);

    toggle = renderToggle({
      chartPrefs: {
        daily: {
          cgmSampleIntervalRange: ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE,
        },
      },
    });

    fireEvent.click(toggle);

    sinon.assert.callCount(props.onClickCgmSampleIntervalRangeToggle, 2);
    sinon.assert.calledWith(props.onClickCgmSampleIntervalRangeToggle, sinon.match({}), DEFAULT_CGM_SAMPLE_INTERVAL_RANGE);
  });
});
