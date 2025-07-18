/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { shallow, mount } from 'enzyme';

import CgmSampleIntervalRangeToggle from '../../../../app/components/chart/cgmSampleIntervalRangeToggle';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE } from '../../../../app/core/constants';

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

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<CgmSampleIntervalRangeToggle.WrappedComponent {...props} />);
  });

  afterEach(() => {
    props.onClickCgmSampleIntervalRangeToggle.reset();
  });

  it('should activate the appropriate sampleInterval when chartPrefs sampleInterval prop changes', () => {
    let toggle = () => wrapper.find('.toggle-container').children('TwoOptionToggle');

    expect(toggle().props().left.label).to.equal('1 min Data');
    expect(toggle().props().left.state).to.be.false;

    expect(toggle().props().right.label).to.equal('5 min Data');
    expect(toggle().props().right.state).to.be.true;

    wrapper.setProps(_.assign({}, props, {
      chartPrefs: {
        daily: {
          cgmSampleIntervalRange: ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE,
        },
      },
    }));

    expect(toggle().props().left.label).to.equal('1 min Data');
    expect(toggle().props().left.state).to.be.true;

    expect(toggle().props().right.label).to.equal('5 min Data');
    expect(toggle().props().right.state).to.be.false;
  });

  it('should fall back to the default cgm sample range when cgmSampleIntervalRange is not available in chartPrefs', () => {
    let toggle = () => wrapper.find('.toggle-container').children('TwoOptionToggle');

    expect(toggle().props().left.label).to.equal('1 min Data');
    expect(toggle().props().left.state).to.be.false;

    expect(toggle().props().right.label).to.equal('5 min Data');
    expect(toggle().props().right.state).to.be.true;

    // Unset cgmSampleIntervalRange, and it should fall back to 5 min Data
    wrapper.setProps(_.assign({}, props, {
      chartPrefs: {
        daily: {
          cgmSampleIntervalRange: undefined,
        },
      },
    }));

    expect(toggle().props().left.label).to.equal('1 min Data');
    expect(toggle().props().left.state).to.be.false;

    expect(toggle().props().right.label).to.equal('5 min Data');
    expect(toggle().props().right.state).to.be.true;
  });

  it('should call the click handler with new cgmSampleInterval prop when clicked', () => {
    wrapper = mount(<CgmSampleIntervalRangeToggle {...props} />);
    let toggle = () => wrapper.find('.toggle-container').children('TwoOptionToggle');

    sinon.assert.callCount(props.onClickCgmSampleIntervalRangeToggle, 0);

    expect(wrapper.props().chartPrefs.daily.cgmSampleIntervalRange).to.equal(DEFAULT_CGM_SAMPLE_INTERVAL_RANGE);

    toggle().find('Toggle').simulate('click');

    sinon.assert.callCount(props.onClickCgmSampleIntervalRangeToggle, 1);
    sinon.assert.calledWith(props.onClickCgmSampleIntervalRangeToggle, sinon.match({}), ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE);

    wrapper.setProps(_.assign({}, props, {
      chartPrefs: {
        daily: {
          cgmSampleIntervalRange: ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE,
        },
      },
    }));

    expect(wrapper.props().chartPrefs.daily.cgmSampleIntervalRange).to.equal(ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE);

    toggle().find('Toggle').simulate('click');

    sinon.assert.callCount(props.onClickCgmSampleIntervalRangeToggle, 2);
    sinon.assert.calledWith(props.onClickCgmSampleIntervalRangeToggle, sinon.match({}), DEFAULT_CGM_SAMPLE_INTERVAL_RANGE);
  });
});
