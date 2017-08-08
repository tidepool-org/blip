/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';

import InputGroup from '../../../app/components/inputgroup';

const expect = chai.expect;

describe('InputGroup', () => {
  const props = {
    onChange: sinon.stub(),
    trackMetric: sinon.stub(),
    type: 'text',
    name: 'myText',
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <InputGroup
        {...props}
      />
    );
  });

  afterEach(() => {
    props.onChange.reset();
    props.trackMetric.reset();
  });

  it('should be exposed as a module and be of type function', () => {
    expect(InputGroup).to.be.a('function');
  });

  describe('render', () => {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.find('.input-group')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render the appropriate type of input based on the prop type', () => {
      const renderInput = sinon.spy(wrapper.instance(), 'renderInput');
      const renderExplanation = sinon.spy(wrapper.instance(), 'renderExplanation');
      const renderTextArea = sinon.spy(wrapper.instance(), 'renderTextArea');
      const renderCheckbox = sinon.spy(wrapper.instance(), 'renderCheckbox');
      const renderRadios = sinon.spy(wrapper.instance(), 'renderRadios');
      const renderSelect = sinon.spy(wrapper.instance(), 'renderSelect');
      const renderDatePicker = sinon.spy(wrapper.instance(), 'renderDatePicker');
      wrapper.update();

      sinon.assert.calledOnce(renderInput);
      renderInput.reset();

      wrapper.setProps({ type: 'explanation' });
      sinon.assert.calledOnce(renderExplanation);
      renderExplanation.reset();

      wrapper.setProps({ type: 'textarea' });
      sinon.assert.calledOnce(renderTextArea);
      renderTextArea.reset();

      wrapper.setProps({ type: 'checkbox' });
      sinon.assert.calledOnce(renderCheckbox);
      renderCheckbox.reset();

      wrapper.setProps({ type: 'radios' });
      sinon.assert.calledOnce(renderRadios);
      renderRadios.reset();

      wrapper.setProps({ type: 'select' });
      sinon.assert.calledOnce(renderSelect);
      renderSelect.reset();

      wrapper.setProps({ type: 'datepicker' });
      sinon.assert.calledOnce(renderDatePicker);
      renderDatePicker.reset();

    });
  });

  describe('handleChange', () => {
    it('should call the onChange handler prop with the provided values', () => {
      const args = { name: 'myText', value: 'hello' };
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledOnce(props.onChange);
      sinon.assert.calledWith(props.onChange, args);
    });

    it('should call the onChange handler prop with transformed values for a checkbox', () => {
      const args = { name: 'myCheckbox', checked: true };
      const expectedTransformed = { name: 'myCheckbox', value: true };

      wrapper.setProps({ type: 'checkbox' });
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledWith(props.onChange, expectedTransformed);
    });

    it('should call the onChange handler prop with transformed values for multiselect inputs', () => {
      const args = 'val1, val2';
      const expectedTransformed = { name: 'myMultiSelect', value: args };

      wrapper.setProps({ name: 'myMultiSelect', type: 'select', multi: true });
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledWith(props.onChange, expectedTransformed);
    });

    it('should call the onChange handler prop without transforming values for a regular select inputs', () => {
      const args = { name: 'mySelect', value: 'mySelectedVal' };

      wrapper.setProps({ name: 'mySelect', type: 'select', multi: false });
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledWith(props.onChange, args);
    });
  });
});
