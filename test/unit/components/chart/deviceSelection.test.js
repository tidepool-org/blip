/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { render, fireEvent, screen } from '@testing-library/react';

import DeviceSelection from '../../../../app/components/chart/deviceSelection';

jest.mock('../../../../app/components/elements/Accordion', () => ({
  __esModule: true,
  default: ({ header, children, onChange }) => (
    <div>
      <div data-testid="accordion-header">{header}</div>
      <button type="button" data-testid="accordion-toggle" onClick={(e) => onChange(e, true)}>
        expand
      </button>
      <button type="button" data-testid="accordion-toggle-close" onClick={(e) => onChange(e, false)}>
        collapse
      </button>
      <div>{children}</div>
    </div>
  ),
}));

jest.mock('../../../../app/components/elements/Checkbox', () => ({
  __esModule: true,
  default: ({ checked, onChange, value, name, label }) => (
    <label>
      <input
        type="checkbox"
        aria-label={name}
        checked={checked}
        value={value}
        onChange={onChange}
      />
      {label}
    </label>
  ),
}));

const expect = chai.expect;

describe('DeviceSelection', () => {
  const props = {
    chartType: 'basics',
    devices: [
      { id: 'device1' },
      { id: 'device2' }
    ],
    chartPrefs: {
      excludedDevices: [],
    },
    updateChartPrefs: sinon.stub(),
    removeGeneratedPDFS: sinon.stub(),
    trackMetric: sinon.stub(),
  };

  const renderSelection = (overrideProps = {}) =>
    render(<DeviceSelection {..._.assign({}, props, overrideProps)} />);

  afterEach(() => {
    props.updateChartPrefs.resetHistory();
    props.trackMetric.resetHistory();
    props.removeGeneratedPDFS.resetHistory();
  });

  it('should render without errors when provided all required props', () => {
    renderSelection();
    expect(screen.getByTestId('accordion-header')).to.exist;
  });

  it('should render the number of devices selected', () => {
    const { rerender } = renderSelection();
    expect(screen.getByText('2')).to.exist;

    rerender(<DeviceSelection {..._.assign({}, props, {
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ]
    })} />);

    expect(screen.getByText('3')).to.exist;

    rerender(<DeviceSelection {..._.assign({}, props, {
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ],
      chartPrefs: {
        excludedDevices: ['device1'],
      },
    })} />);

    expect(screen.getByText('2')).to.exist;
  });

  it('should render a Checkbox for each deviceId', () => {
    const { rerender } = renderSelection();
    expect(screen.getAllByRole('checkbox')).to.have.length(2);

    rerender(<DeviceSelection {..._.assign({}, props, {
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ]
    })} />);

    expect(screen.getAllByRole('checkbox')).to.have.length(3);

    rerender(<DeviceSelection {..._.assign({}, props, {
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ],
      chartPrefs: {
        excludedDevices: ['device1'],
      },
    })} />);

    expect(screen.getAllByRole('checkbox')).to.have.length(3);
  });

  it('should call updateChartPrefs and removeGeneratedPDFS and trackMetric on Checkbox change adding or removing devices', () => {
    const { rerender } = renderSelection();
    const checkboxes = screen.getAllByRole('checkbox');
    const checkbox1 = checkboxes[0];
    const checkbox2 = checkboxes[1];

    sinon.assert.callCount(props.updateChartPrefs, 0);
    sinon.assert.callCount(props.removeGeneratedPDFS, 0);
    sinon.assert.callCount(props.trackMetric, 0);

    fireEvent.click(checkbox1);

    sinon.assert.callCount(props.updateChartPrefs, 1);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: ['device1'] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 1);
    sinon.assert.calledWith(props.trackMetric, 'Clicked Basics filter device off');

    rerender(<DeviceSelection {..._.assign({}, props, { chartPrefs: { excludedDevices: ['device1'] } })} />);
    fireEvent.click(screen.getAllByRole('checkbox')[1]);

    sinon.assert.callCount(props.updateChartPrefs, 2);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: ['device1', 'device2'] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 2);

    rerender(<DeviceSelection {..._.assign({}, props, { chartPrefs: { excludedDevices: ['device1', 'device2'] } })} />);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    sinon.assert.callCount(props.updateChartPrefs, 3);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: ['device2'] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 3);
    sinon.assert.calledWith(props.trackMetric, 'Clicked Basics filter device on');

    rerender(<DeviceSelection {..._.assign({}, props, { chartPrefs: { excludedDevices: ['device2'] } })} />);
    fireEvent.click(screen.getAllByRole('checkbox')[1]);

    sinon.assert.callCount(props.updateChartPrefs, 4);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: [] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 4);
  });

  it('should track a metric when device selection accordion is collapsed or expanded', () => {
    renderSelection();

    sinon.assert.callCount(props.trackMetric, 0);
    fireEvent.click(screen.getByTestId('accordion-toggle'));
    sinon.assert.calledWith(props.trackMetric, 'Click expanded - Basics - Filter devices');

    fireEvent.click(screen.getByTestId('accordion-toggle-close'));
    sinon.assert.calledWith(props.trackMetric, 'Click collapsed - Basics - Filter devices');
  });
});
