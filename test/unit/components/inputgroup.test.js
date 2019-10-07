/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import InputGroup from '../../../app/components/inputgroup';

const expect = chai.expect;

describe('InputGroup', () => {
  const defaultProps = {
    onChange: sinon.stub(),
    trackMetric: sinon.stub(),
    type: 'text',
    name: 'myText',
  };

  const props = overrides => _.assign({}, defaultProps, overrides);

  let wrapper;
  let instance;

  beforeEach(() => {
    wrapper = mount(
      <InputGroup
        {...defaultProps}
      />
    );
  });

  afterEach(() => {
    defaultProps.onChange.reset();
    defaultProps.trackMetric.reset();
  });

  it('should be exposed as a module and be of type function', () => {
    expect(InputGroup).to.be.a('function');
  });

  describe('renderSelect', () => {
    const options = [
      {
        label: 'one',
        value: '1',
      },
      {
        label: 'two',
        value: '2',
      },
      {
        label: 'three',
        value: '3',
      },
    ];

    const selectProps = {
      type: 'select',
      items: options,
    };

    let select;
    let selectInput;
    let selectValues;
    let selectOptions;

    beforeEach(() => {
      wrapper.setProps(props(selectProps));
      select = () => wrapper.find('.Select').first();
      selectInput = () => select().find('input').first();
      selectValues = () => select().find('.Select__value-container').first();
      selectOptions = () => select().find('.Select__option');


      instance = () => wrapper.instance();
    });

    it('should render a select with the provided options', () => {
      expect(select()).to.have.length(1);
      selectInput().simulate('change');

      expect(selectOptions()).to.have.length(3);
      expect(selectOptions().at(0).text()).to.equal('one');
      expect(selectOptions().at(1).text()).to.equal('two');
      expect(selectOptions().at(2).text()).to.equal('three');
    });

    it('should select the appropriate option from the provided value', () => {
      expect(selectValues()).to.have.length(1);
      expect(selectValues().hasClass('Select__value-container--is-multi')).to.be.false;
      expect(selectValues().hasClass('Select__value-container--has-value')).to.be.false;

      wrapper.setProps(props({
        ...instance().props,
        value: '1',
      }));

      expect(selectValues().hasClass('Select__value-container--has-value')).to.be.true;
      expect(selectValues().text()).to.equal('one');
    });

    it('should ignore a provided value that does not have a corresponding option item', () => {
      expect(selectValues()).to.have.length(1);
      expect(selectValues().hasClass('Select__value-container--is-multi')).to.be.false;
      expect(selectValues().hasClass('Select__value-container--has-value')).to.be.false;

      wrapper.setProps(props({
        ...instance().props,
        value: '4',
      }));

      expect(selectValues().hasClass('Select__value-container--has-value')).to.be.false;
      expect(selectValues().text()).to.equal('Select...');
    });

    context('multi-select', () => {
      beforeEach(() => {
        wrapper.setProps(props({
          ...selectProps,
          multi: true,
        }));
      });

      it('should render a multi-select input with provided values pre-selected', () => {
        expect(selectValues()).to.have.length(1);
        expect(selectValues().hasClass('Select__value-container--is-multi')).to.be.true;
        expect(selectValues().hasClass('Select__value-container--has-value')).to.be.false;

        wrapper.setProps(props({
          ...instance().props,
          value: '1,3',
        }));

        expect(selectValues().hasClass('Select__value-container--has-value')).to.be.true;
        expect(selectValues().text()).to.equal('onethree');
      });

      it('should render a multi-select input with valid provided values pre-selected, and invalid ones ignored', () => {
        expect(selectValues()).to.have.length(1);
        expect(selectValues().hasClass('Select__value-container--is-multi')).to.be.true;
        expect(selectValues().hasClass('Select__value-container--has-value')).to.be.false;

        wrapper.setProps(props({
          ...instance().props,
          value: '0,2,3,4',
        }));

        expect(selectValues().hasClass('Select__value-container--has-value')).to.be.true;
        expect(selectValues().text()).to.equal('twothree');
      });
    });
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
      wrapper.instance().forceUpdate();

      sinon.assert.calledOnce(renderInput);
      renderInput.resetHistory();

      wrapper.setProps({ type: 'explanation' });
      sinon.assert.calledOnce(renderExplanation);
      renderExplanation.resetHistory();

      wrapper.setProps({ type: 'textarea' });
      sinon.assert.calledOnce(renderTextArea);
      renderTextArea.resetHistory();

      wrapper.setProps({ type: 'checkbox' });
      sinon.assert.calledOnce(renderCheckbox);
      renderCheckbox.resetHistory();

      wrapper.setProps({ type: 'radios' });
      sinon.assert.calledOnce(renderRadios);
      renderRadios.resetHistory();

      wrapper.setProps({ type: 'select' });
      sinon.assert.calledOnce(renderSelect);
      renderSelect.resetHistory();

      wrapper.setProps({ type: 'datepicker' });
      sinon.assert.calledOnce(renderDatePicker);
      renderDatePicker.resetHistory();

    });
  });

  describe('handleChange', () => {
    it('should call the onChange handler prop with the provided values', () => {
      const args = { name: 'myText', value: 'hello' };
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledOnce(defaultProps.onChange);
      sinon.assert.calledWith(defaultProps.onChange, args);
    });

    it('should call the onChange handler prop with transformed values for a checkbox', () => {
      const args = { name: 'myCheckbox', checked: true };
      const expectedTransformed = { name: 'myCheckbox', value: true };

      wrapper.setProps({ type: 'checkbox' });
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledWith(defaultProps.onChange, expectedTransformed);
    });

    it('should call the onChange handler prop with transformed values for multiselect inputs', () => {
      const args = 'val1, val2';
      const expectedTransformed = { name: 'myMultiSelect', value: args };

      wrapper.setProps({ name: 'myMultiSelect', type: 'select', multi: true });
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledWith(defaultProps.onChange, expectedTransformed);
    });

    it('should call the onChange handler prop without transforming values for a regular select inputs', () => {
      const args = { name: 'mySelect', value: 'mySelectedVal' };

      wrapper.setProps({ name: 'mySelect', type: 'select', multi: false });
      wrapper.instance().handleChange({ target: args });

      sinon.assert.calledWith(defaultProps.onChange, args);
    });
  });
});
