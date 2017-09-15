/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { shallow, mount } from 'enzyme';

import IncrementalInput from '../../../app/components/incrementalinput';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../app/core/constants';

const expect = chai.expect;

describe('IncrementalInput', function () {
  let props;

  const propsByType = {
    mgdl: {
      name: 'high',
      error: false,
      value: 180,
      unit: MGDL_UNITS,
      minValue: 80,
      maxValue: 250,
      step: 5,
      onChange: sinon.stub(),
    },
    mmoll: {
      name: 'high',
      error: false,
      value: 10,
      unit: MMOLL_UNITS,
      minValue: 4.4,
      maxValue: 13.9,
      step: 0.1,
      onChange: sinon.stub(),
    },
  };

  beforeEach(() => {
    propsByType.mgdl.onChange.reset();
    propsByType.mmoll.onChange.reset();
  });

  it('should be a function', function() {
    expect(IncrementalInput).to.be.a('function');
  });

  describe('render', function() {
    props = propsByType.mgdl;

    it('should render without problems', function () {
      const wrapper = shallow(
        <IncrementalInput
          {...props}
        />
      );
      expect(wrapper.find(IncrementalInput)).to.have.length(0);
    });

    it('should render with error class when error bool is set to true', function () {
      const wrapper = shallow(
        <IncrementalInput
          {...props}
          error={true}
        />
      );
      expect(wrapper.hasClass('IncrementalInput--error')).to.be.true;
    });
  });

  describe('math operations', function() {
    context('mg/dL', () => {
      let wrapper;

      beforeEach(() => {
        props = propsByType.mgdl;
        wrapper = mount(
          <IncrementalInput
            {...props}
          />
        );
      });

      it('should properly increment by given step', function () {
        expect(props.onChange.callCount).to.equal(0);
        wrapper.find('.IncrementalInputArrow--increase').find('path').simulate('click');
        expect(props.onChange.callCount).to.equal(1);
        expect(props.onChange.calledWith(props.name, (props.value + props.step), props.unit)).to.be.true;
      });

      it('should properly decrement by given step', function() {
        expect(props.onChange.callCount).to.equal(0);
        wrapper.find('.IncrementalInputArrow--decrease').find('path').simulate('click');
        expect(props.onChange.callCount).to.equal(1);
        expect(props.onChange.calledWith(props.name, (props.value - props.step), props.unit)).to.be.true;
      });

      it('should correctly format mgdl values', () => {
        expect(wrapper.find('span').first().text()).to.equal('180 mg/dL');
      });
    });

    context('mmol/L', () => {
      let wrapper;

      beforeEach(() => {
        props = propsByType.mmoll;
        wrapper = mount(
          <IncrementalInput
            {...props}
          />
        );
      });

      it('should properly increment by given step', function () {
        expect(props.onChange.callCount).to.equal(0);
        wrapper.find('.IncrementalInputArrow--increase').find('path').simulate('click');
        expect(props.onChange.callCount).to.equal(1);
        expect(props.onChange.calledWith(props.name, (props.value + props.step), props.unit)).to.be.true;
      });

      it('should properly decrement by given step', function() {
        expect(props.onChange.callCount).to.equal(0);
        wrapper.find('.IncrementalInputArrow--decrease').find('path').simulate('click');
        expect(props.onChange.callCount).to.equal(1);
        expect(props.onChange.calledWith(props.name, (props.value - props.step), props.unit)).to.be.true;
      });

      it('should correctly format mmoll values', () => {
        expect(wrapper.find('span').first().text()).to.equal('10.0 mmol/L');
      });
    });
  });
});
