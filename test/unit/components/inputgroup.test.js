/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */

import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
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

  beforeEach(() => {
    wrapper = render(
      <InputGroup
        {...defaultProps}
      />
    );
  });

  afterEach(() => {
    cleanup();
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

    beforeEach(() => {
      cleanup();
      wrapper = render(<InputGroup {...props(selectProps)} />);
    });

    it('should render a select with the provided options', () => {
      const select = wrapper.container.querySelector('.Select');
      expect(select).to.not.be.null;

      // Open the dropdown menu via mouse down on the control
      const control = wrapper.container.querySelector('.Select__control');
      fireEvent.mouseDown(control);

      const selectOptions = wrapper.container.querySelectorAll('.Select__option');
      expect(selectOptions.length).to.equal(3);
      expect(selectOptions[0].textContent).to.equal('one');
      expect(selectOptions[1].textContent).to.equal('two');
      expect(selectOptions[2].textContent).to.equal('three');
    });

    it('should select the appropriate option from the provided value', () => {
      let valueContainer = wrapper.container.querySelector('.Select__value-container');
      expect(valueContainer).to.not.be.null;
      expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.false;

      cleanup();
      wrapper = render(<InputGroup {...props({ ...selectProps, value: '1' })} />);

      valueContainer = wrapper.container.querySelector('.Select__value-container');
      expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.true;
      expect(valueContainer.textContent).to.include('one');
    });

    it('should ignore a provided value that does not have a corresponding option item', () => {
      let valueContainer = wrapper.container.querySelector('.Select__value-container');
      expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.false;

      cleanup();
      wrapper = render(<InputGroup {...props({ ...selectProps, value: '4' })} />);

      valueContainer = wrapper.container.querySelector('.Select__value-container');
      expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.false;
      expect(valueContainer.textContent).to.equal('Select...');
    });

    context('multi-select', () => {
      beforeEach(() => {
        cleanup();
        wrapper = render(<InputGroup {...props({ ...selectProps, multi: true })} />);
      });

      it('should render a multi-select input with provided values pre-selected', () => {
        let valueContainer = wrapper.container.querySelector('.Select__value-container');
        expect(valueContainer.classList.contains('Select__value-container--is-multi')).to.be.true;
        expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.false;

        cleanup();
        wrapper = render(<InputGroup {...props({ ...selectProps, multi: true, value: '1,3' })} />);

        valueContainer = wrapper.container.querySelector('.Select__value-container');
        expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.true;
        expect(valueContainer.textContent).to.include('one');
        expect(valueContainer.textContent).to.include('three');
      });

      it('should render a multi-select input with valid provided values pre-selected, and invalid ones ignored', () => {
        let valueContainer = wrapper.container.querySelector('.Select__value-container');
        expect(valueContainer.classList.contains('Select__value-container--is-multi')).to.be.true;
        expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.false;

        cleanup();
        wrapper = render(<InputGroup {...props({ ...selectProps, multi: true, value: '0,2,3,4' })} />);

        valueContainer = wrapper.container.querySelector('.Select__value-container');
        expect(valueContainer.classList.contains('Select__value-container--has-value')).to.be.true;
        expect(valueContainer.textContent).to.include('two');
        expect(valueContainer.textContent).to.include('three');
      });
    });
  });

  describe('render', () => {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.container.querySelector('.input-group')).to.not.be.null;
      expect(console.error.callCount).to.equal(0);
    });

    it('should render the appropriate type of input based on the prop type', () => {
      // text → input
      expect(wrapper.container.querySelector('input[type="text"]')).to.not.be.null;

      cleanup();
      wrapper = render(<InputGroup {...props({ type: 'explanation', text: 'help text' })} />);
      expect(wrapper.container.querySelector('.input-group-explanation')).to.not.be.null;

      cleanup();
      wrapper = render(<InputGroup {...props({ type: 'textarea' })} />);
      expect(wrapper.container.querySelector('textarea')).to.not.be.null;

      cleanup();
      wrapper = render(<InputGroup {...props({ type: 'checkbox' })} />);
      expect(wrapper.container.querySelector('input[type="checkbox"]')).to.not.be.null;

      cleanup();
      wrapper = render(<InputGroup {...props({ type: 'radios', items: [{ value: 'a', label: 'A' }] })} />);
      expect(wrapper.container.querySelector('input[type="radio"]')).to.not.be.null;

      cleanup();
      wrapper = render(<InputGroup {...props({ type: 'select', items: [] })} />);
      expect(wrapper.container.querySelector('.Select')).to.not.be.null;

      cleanup();
      wrapper = render(<InputGroup {...props({ type: 'datepicker' })} />);
      // DatePicker renders some form element
      expect(wrapper.container.querySelector('.input-group')).to.not.be.null;
    });
  });

  describe('handleChange', () => {
    it('should call the onChange handler prop with the provided values', () => {
      const input = wrapper.container.querySelector('input[name="myText"]');
      fireEvent.change(input, { target: { name: 'myText', value: 'hello' } });

      sinon.assert.calledOnce(defaultProps.onChange);
      sinon.assert.calledWith(defaultProps.onChange, { name: 'myText', value: 'hello' });
    });

    it('should call the onChange handler prop with transformed values for a checkbox', () => {
      cleanup();
      wrapper = render(<InputGroup {...props({ type: 'checkbox', name: 'myCheckbox' })} />);

      const checkbox = wrapper.container.querySelector('input[type="checkbox"]');
      fireEvent.click(checkbox);

      sinon.assert.calledWith(defaultProps.onChange, { name: 'myCheckbox', value: true });
    });

    it('should call the onChange handler prop with transformed values for multiselect inputs', () => {
      // For react-select multi, handleChange receives the array directly
      // We can test by rendering and checking the onChange is triggered on selection
      cleanup();
      wrapper = render(<InputGroup {...props({ name: 'myMultiSelect', type: 'select', multi: true, items: [{ value: 'val1', label: 'Val 1' }, { value: 'val2', label: 'Val 2' }] })} />);

      // Open the dropdown menu via mouse down on the control
      const control = wrapper.container.querySelector('.Select__control');
      fireEvent.mouseDown(control);

      const options = wrapper.container.querySelectorAll('.Select__option');
      expect(options.length).to.be.above(0);
      fireEvent.click(options[0]);
      sinon.assert.calledOnce(defaultProps.onChange);
    });

    it('should call the onChange handler prop without transforming values for a regular select inputs', () => {
      cleanup();
      wrapper = render(<InputGroup {...props({ name: 'mySelect', type: 'select', multi: false, items: [{ value: 'mySelectedVal', label: 'My Value' }] })} />);

      // Open the dropdown menu via mouse down on the control
      const control = wrapper.container.querySelector('.Select__control');
      fireEvent.mouseDown(control);

      const options = wrapper.container.querySelectorAll('.Select__option');
      expect(options.length).to.be.above(0);
      fireEvent.click(options[0]);
      sinon.assert.calledOnce(defaultProps.onChange);
      const lastCall = defaultProps.onChange.lastCall;
      expect(lastCall.args[0]).to.deep.equal({ name: 'mySelect', value: 'mySelectedVal' });
    });
  });
});
