/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';
import { Box } from 'rebass/styled-components';

import DeviceSelection from '../../../../app/components/chart/deviceSelection';

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

  let wrapper;
  beforeEach(() => {
    wrapper = mount(<DeviceSelection {...props} />);
  });

  afterEach(() => {
    props.updateChartPrefs.reset();
    props.trackMetric.resetHistory();
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('Accordion')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should render the number of devices selected', () => {
    expect(wrapper.find(Box).at(3).text()).to.equal('2');

    wrapper.setProps({
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ]
    });

    expect(wrapper.find(Box).at(3).text()).to.equal('3');

    wrapper.setProps({
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ],
      chartPrefs: {
        excludedDevices: ['device1'],
      },
    });

    expect(wrapper.find(Box).at(3).text()).to.equal('2');
  });

  it('should render a Checkbox for each deviceId', () => {
    expect(wrapper.find('Checkbox').length).to.equal(2);

    wrapper.setProps({
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ]
    });

    expect(wrapper.find('Checkbox').length).to.equal(3);

    wrapper.setProps({
      devices: [
        { id: 'device1' },
        { id: 'device2' },
        { id: 'device3' },
      ],
      chartPrefs: {
        excludedDevices: ['device1'],
      },
    });

    expect(wrapper.find('Checkbox').length).to.equal(3);
  });

  it('should call updateChartPrefs and removeGeneratedPDFS and trackMetric on Checkbox change adding or removing devices', () => {
    const checkboxes = wrapper.find('Checkbox');
    const checkbox1 = checkboxes.at(0).find('input');
    const checkbox2 = checkboxes.at(1).find('input');

    sinon.assert.callCount(props.updateChartPrefs, 0);
    sinon.assert.callCount(props.removeGeneratedPDFS, 0);
    sinon.assert.callCount(props.trackMetric, 0);

    checkbox1.simulate('change', {
      target: { value: 'device1', checked: false },
    });

    sinon.assert.callCount(props.updateChartPrefs, 1);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: ['device1'] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 1);
    sinon.assert.calledWith(props.trackMetric, 'Clicked Basics filter device off');

    wrapper.setProps({ chartPrefs: { excludedDevices: ['device1'] } });

    checkbox2.simulate('change', {
      target: { value: 'device2', checked: false },
    });

    sinon.assert.callCount(props.updateChartPrefs, 2);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: ['device1', 'device2'] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 2);

    wrapper.setProps({
      chartPrefs: { excludedDevices: ['device1', 'device2'] },
    });

    checkbox1.simulate('change', {
      target: { value: 'device1', checked: true },
    });

    sinon.assert.callCount(props.updateChartPrefs, 3);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: ['device2'] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 3);
    sinon.assert.calledWith(props.trackMetric, 'Clicked Basics filter device on');

    wrapper.setProps({
      chartPrefs: { excludedDevices: ['device2'] },
    });

    checkbox2.simulate('change', {
      target: { value: 'device2', checked: true },
    });

    sinon.assert.callCount(props.updateChartPrefs, 4);
    sinon.assert.calledWith(
      props.updateChartPrefs,
      sinon.match({ excludedDevices: [] })
    );
    sinon.assert.callCount(props.removeGeneratedPDFS, 4);
  });

  it('should track a metric when device selection accordion is collapsed or expanded', () => {
    const collapseIcon = wrapper.find('.MuiExpansionPanelSummary-expandIcon').hostNodes();
    console.log('collapseIcon.debug()', collapseIcon.debug());
    expect(collapseIcon).to.have.lengthOf(1);

    sinon.assert.callCount(props.trackMetric, 0);
    collapseIcon.simulate('click');
    sinon.assert.calledWith(props.trackMetric, 'Click expanded - Basics - Filter devices');

    collapseIcon.simulate('click');
    sinon.assert.calledWith(props.trackMetric, 'Click collapsed - Basics - Filter devices');
  });
});
