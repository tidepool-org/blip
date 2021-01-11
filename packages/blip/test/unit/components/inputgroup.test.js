import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import chai from 'chai';
import sinon from 'sinon';

import InputGroup from '../../../app/components/inputgroup';

describe('InputGroup', () => {
  const { expect } = chai;

  const defaultProps = {
    onChange: sinon.stub(),
    trackMetric: sinon.stub(),
    type: 'text',
    name: 'myText',
  };

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

  const props = overrides => _.assign({}, defaultProps, overrides);

  /** @type {import('enzyme').ReactWrapper<InputGroup>} */
  let wrapper;

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

  describe('render', () => {
    before(() => {
      sinon.spy(console, 'error');
    });

    after(() => {
      console.error.restore();
    });

    it('should render without errors when provided all required props', () => {
      expect(wrapper.find('.input-group')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render the appropriate type of input based on the prop type', () => {
      expect(wrapper.find('input').first().prop('type'), 'text').to.be.equal('text');

      wrapper.setProps({ type: 'passwordShowHide' });
      expect(wrapper.find('img.image').length, 'passwordShowHide').to.be.equal(1);

      wrapper.setProps({ type: 'explanation' });
      expect(wrapper.find('.input-group-explanation').length, 'explanation').to.be.equal(1);

      wrapper.setProps({ type: 'textarea' });
      expect(wrapper.find('textarea').length, 'textarea').to.be.equal(1);

      wrapper.setProps({ type: 'checkbox' });
      expect(wrapper.find('input').length, 'input').to.be.equal(1);
      expect(wrapper.find('input').first().prop('type'), 'input checkbox').to.be.equal('checkbox');

      wrapper.setProps({ type: 'radios', items: [{ name: 'a', value: 'a'}, { name: 'b', value: 'b'}] });
      expect(wrapper.find('input').length, 'input').to.be.equal(2);
      expect(wrapper.find('input').first().prop('type'), 'input radio').to.be.equal('radio');

      wrapper.setProps({ type: 'select', items: [{ label: 'a', value: 'a'}, { label: 'b', value: 'b'}], value: 'a' });
      // For some reason, this selector return 4 entries...
      expect(wrapper.find('.Select').length, wrapper.html()).to.be.above(0);

      wrapper.setProps({ type: 'datepicker' });
      expect(wrapper.find('.DatePicker').length, 'datepicker').to.be.equal(1);
    });
  });

  describe('renderSelect', () => {
    const selectProps = {
      type: 'select',
      items: options,
      placeholder: 'Select...',
    };

    /** @type {() => import('enzyme').ReactWrapper<React.AllHTMLAttributes>} */
    let select;
    /** @type {() => import('enzyme').ReactWrapper<React.AllHTMLAttributes>} */
    let selectInput;
    /** @type {() => import('enzyme').ReactWrapper<React.AllHTMLAttributes>} */
    let selectValues;
    /** @type {() => import('enzyme').ReactWrapper<React.AllHTMLAttributes>} */
    let selectOptions;

    beforeEach(() => {
      wrapper.setProps(props(selectProps));
      select = () => wrapper.find('.Select').first();
      selectInput = () => select().find('input').first();
      selectValues = () => select().find('.Select__value-container').first();
      selectOptions = () => select().find('.Select__option');
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
      let elem = selectValues();
      expect(elem).to.have.length(1);
      expect(elem.hasClass('Select__value-container--is-multi')).to.be.false;
      expect(elem.hasClass('Select__value-container--has-value')).to.be.false;

      wrapper.setProps(props({
        ...selectProps,
        value: '1',
      }));

      elem = selectValues();
      expect(elem.hasClass('Select__value-container--has-value'), `Having class: "${elem.prop('className')}"`).to.be.true;
      expect(elem.text()).to.equal('one');
    });

    it('should ignore a provided value that does not have a corresponding option item', () => {
      let elem = selectValues();
      expect(elem).to.have.length(1);
      expect(elem.hasClass('Select__value-container--is-multi')).to.be.false;
      expect(elem.hasClass('Select__value-container--has-value')).to.be.false;

      wrapper.setProps(props({
        ...selectProps,
        value: '4',
      }));

      elem = selectValues();
      expect(elem.hasClass('Select__value-container--has-value'), `Having class: "${elem.prop('className')}"`).to.be.false;
      expect(elem.text()).to.equal('Select...');
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
          ...selectProps,
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
          ...selectProps,
          value: '0,2,3,4',
        }));

        expect(selectValues().hasClass('Select__value-container--has-value')).to.be.true;
        expect(selectValues().text()).to.equal('twothree');
      });
    });
  });

  describe('handleChange', () => {
    it('should call the onChange handler prop with the provided values', () => {
      const args = { name: 'myText', value: 'hello world' };
      wrapper.find('input').first().simulate('change', { target: { value: 'hello world'} });

      sinon.assert.calledOnce(defaultProps.onChange);
      sinon.assert.calledWith(defaultProps.onChange, args);
    });

    it('should call the onChange handler prop with transformed values for a checkbox', () => {
      wrapper.setProps({ type: 'checkbox', name: 'myCheckbox', value: false });
      wrapper.find('input').first().simulate('change', { target: { checked: true } });

      sinon.assert.calledWith(defaultProps.onChange, { name: 'myCheckbox', value: true });
    });

    it('should call the onChange handler prop with transformed values for multiselect inputs', () => {
      const args = '1, 2';
      const expectedTransformed = { name: 'myMultiSelect', value: args };

      wrapper.setProps({ name: 'myMultiSelect', type: 'select', multi: true, items: options, value: args });
      wrapper.find('.Select').first().instance().onChange({ value: args });
      sinon.assert.calledWith(defaultProps.onChange, expectedTransformed);
    });

    it('should call the onChange handler prop without transforming values for a regular select inputs', () => {
      const args = { name: 'mySelect', value: 'mySelectedVal' };

      wrapper.setProps({ name: 'mySelect', type: 'select', multi: false, items: [] });
      wrapper.find('.Select').first().instance().onChange({ value: args.value });

      sinon.assert.calledWith(defaultProps.onChange, args);
    });
  });
});
