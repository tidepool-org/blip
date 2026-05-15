/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { render, fireEvent } from '@testing-library/react';

import BgSourceToggle from '../../../../app/components/chart/bgSourceToggle';

jest.mock('@tidepool/viz', () => {
  const React = require('react');

  return {
    components: {
      TwoOptionToggle: ({ left, right, disabled, toggleFn }) => React.createElement(
        'div',
        {
          'data-testid': 'two-option-toggle',
          'data-disabled': String(disabled),
          'data-left-label': left.label,
          'data-left-state': String(left.state),
          'data-right-label': right.label,
          'data-right-state': String(right.state),
        },
        React.createElement('button', {
          'data-testid': 'toggle-click',
          onClick: toggleFn,
        }, 'toggle'),
      ),
    },
    utils: {
      stat: {
        statBgSourceLabels: {
          smbg: 'BGM',
          cbg: 'CGM',
        },
      },
    },
  };
});

const expect = chai.expect;

describe('BgSourceToggle', () => {
  const props = {
    bgSources: {
      cbg: true,
      smbg: true,
      current: 'smbg',
    },
    chartPrefs: {
      bgLog: {
        bgSource: 'cbg',
      },
    },
    chartType: 'bgLog',
    onClickBgSourceToggle: sinon.stub(),
  };

  const renderToggle = (overrideProps = {}) => render(<BgSourceToggle {...props} {...overrideProps} />);

  afterEach(() => {
    props.onClickBgSourceToggle.resetHistory();
  });

  it('should render without errors when provided all required props', () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    try {
      const { container, getByTestId } = renderToggle();

      expect(container.querySelector('.toggle-container')).to.exist;
      expect(getByTestId('two-option-toggle')).to.exist;
      expect(consoleErrorStub.callCount).to.equal(0);
    } finally {
      consoleErrorStub.restore();
    }
  });

  it('should render toggle if either cbg or smbg sources are available', () => {
    const { getByTestId, rerender } = renderToggle({
      bgSources: {
        cbg: false,
        smbg: true,
      },
    });

    expect(getByTestId('two-option-toggle')).to.exist;

    rerender(<BgSourceToggle {...props} {..._.assign({}, props, {
      bgSources: {
        cbg: true,
        smbg: false,
      },
    })} />);
    expect(getByTestId('two-option-toggle')).to.exist;
  });

  it('should not render toggle if cbg and smbg sources unavailable', () => {
    const { queryByTestId } = renderToggle({
      bgSources: {
        cbg: false,
        smbg: false,
      },
    });

    expect(queryByTestId('two-option-toggle')).to.equal(null);
  });

  it('should disable the toggle if only one of cbg or smbg sources is available', () => {
    const { getByTestId, rerender } = renderToggle();
    let toggle = () => getByTestId('two-option-toggle');
    expect(toggle().getAttribute('data-disabled')).to.equal('false');

    rerender(<BgSourceToggle {...props} {..._.assign({}, props, {
      bgSources: {
        cbg: true,
        smbg: false,
      },
    })} />);

    expect(toggle().getAttribute('data-disabled')).to.equal('true');

    rerender(<BgSourceToggle {...props} {..._.assign({}, props, {
      bgSources: {
        cbg: false,
        smbg: true,
      },
    })} />);

    expect(toggle().getAttribute('data-disabled')).to.equal('true');
  });

  it('should activate the appropriate source when chartPrefs bgSource prop changes', () => {
    const { getByTestId, rerender } = renderToggle();
    let toggle = () => getByTestId('two-option-toggle');

    expect(toggle().getAttribute('data-left-label')).to.equal('BGM');
    expect(toggle().getAttribute('data-left-state')).to.equal('false');

    expect(toggle().getAttribute('data-right-label')).to.equal('CGM');
    expect(toggle().getAttribute('data-right-state')).to.equal('true');

    rerender(<BgSourceToggle {...props} {..._.assign({}, props, {
      chartPrefs: {
        bgLog: {
          bgSource: 'smbg',
        },
      },
    })} />);

    expect(toggle().getAttribute('data-left-label')).to.equal('BGM');
    expect(toggle().getAttribute('data-left-state')).to.equal('true');

    expect(toggle().getAttribute('data-right-label')).to.equal('CGM');
    expect(toggle().getAttribute('data-right-state')).to.equal('false');
  });

  it('should fall back to bgSources.current when bgSource is not available in chartPrefs', () => {
    const { getByTestId, rerender } = renderToggle();
    let toggle = () => getByTestId('two-option-toggle');

    expect(toggle().getAttribute('data-left-label')).to.equal('BGM');
    expect(toggle().getAttribute('data-left-state')).to.equal('false');

    expect(toggle().getAttribute('data-right-label')).to.equal('CGM');
    expect(toggle().getAttribute('data-right-state')).to.equal('true');

    rerender(<BgSourceToggle {...props} {..._.assign({}, props, {
      chartPrefs: undefined,
    })} />);

    expect(toggle().getAttribute('data-left-label')).to.equal('BGM');
    expect(toggle().getAttribute('data-left-state')).to.equal('true');

    expect(toggle().getAttribute('data-right-label')).to.equal('CGM');
    expect(toggle().getAttribute('data-right-state')).to.equal('false');
  });

  it('should call the click handler with new bgSource prop when clicked', () => {
    const { getByTestId, rerender } = renderToggle();

    sinon.assert.callCount(props.onClickBgSourceToggle, 0);

    fireEvent.click(getByTestId('toggle-click'));

    sinon.assert.callCount(props.onClickBgSourceToggle, 1);
    sinon.assert.calledWith(props.onClickBgSourceToggle, sinon.match({}), 'smbg');

    const updatedProps = _.assign({}, props, {
      chartPrefs: {
        bgLog: {
          bgSource: 'smbg',
        },
      },
    });
    rerender(<BgSourceToggle {...updatedProps} />);

    fireEvent.click(getByTestId('toggle-click'));

    sinon.assert.callCount(props.onClickBgSourceToggle, 2);
    sinon.assert.calledWith(props.onClickBgSourceToggle, sinon.match({}), 'cbg');
  });
});
