import React from 'react';
import { shallow } from 'enzyme';
import Select from 'react-select';
import _ from 'lodash';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';
import InputGroup from '../../../../src/components/common/controls/InputGroup';
import styles from '../../../../src/components/common/controls/InputGroup.css';

describe('InputGroup', () => {
  let wrapper;

  const suffixString = 'Suffix';

  const suffixOptions = [
    {
      label: 'Option 1',
      value: 'option1',
    },
    {
      label: 'Option 2',
      value: 'option2',
    },
  ];

  const suffixSelectInput = {
    id: 'mySelect',
    options: suffixOptions,
    value: suffixOptions[1],
  };

  const defaultProps = {
    id: 'myInput',
    label: 'My Input',
    onChange: sinon.stub(),
    onSuffixChange: sinon.stub().returns('suffix changed!'),
    step: 1,
    suffix: suffixString,
    type: 'number',
    value: 10,
  };

  const props = overrides => _.assign({}, defaultProps, overrides);

  beforeEach(() => {
    wrapper = shallow(<InputGroup {...defaultProps} />);
  });

  afterEach(() => {
    defaultProps.onChange.resetHistory();
    defaultProps.onSuffixChange.resetHistory();
  });

  describe('input', () => {
    it('should render an input of the provided type', () => {
      expect(wrapper.find('input[type="number"]')).to.have.length(1);

      wrapper.setProps(props({ type: 'text' }));
      expect(wrapper.find('input[type="text"]')).to.have.length(1);
    });

    it('should set the provided `id` prop to the `name` and `id` attributes of the input', () => {
      expect(wrapper.find('input[id="myInput"]')).to.have.length(1);
      expect(wrapper.find('input[name="myInput"]')).to.have.length(1);

      wrapper.setProps(props({ id: 'otherId' }));
      expect(wrapper.find('input[id="otherId"]')).to.have.length(1);
      expect(wrapper.find('input[name="otherId"]')).to.have.length(1);
    });

    it('should set the provided `step` prop to the `step` attribute of the input', () => {
      expect(wrapper.find('input[step=1]')).to.have.length(1);

      wrapper.setProps(props({ step: 2 }));
      expect(wrapper.find('input[step=2]')).to.have.length(1);
    });

    it('should set the provided `min` prop to the `min` attribute of the input', () => {
      wrapper.setProps(props({ min: 2 }));
      expect(wrapper.find('input[min=2]')).to.have.length(1);
    });

    it('should set the provided `max` prop to the `max` attribute of the input', () => {
      wrapper.setProps(props({ max: 2 }));
      expect(wrapper.find('input[max=2]')).to.have.length(1);
    });

    it('should set the provided `value` prop to the `value` attribute of the input', () => {
      wrapper.setProps(props({ value: 2 }));
      expect(wrapper.find('input[value=2]')).to.have.length(1);
    });

    it('should call the `onChange` handler when the input changes', () => {
      const input = () => wrapper.find('input');
      sinon.assert.callCount(defaultProps.onChange, 0);

      const changeEvent = { target: { value: 300 } };

      input().simulate('change', changeEvent);
      sinon.assert.callCount(defaultProps.onChange, 1);
      sinon.assert.calledWith(defaultProps.onChange, sinon.match({ ...changeEvent }));
    });
  });

  describe('suffix string', () => {
    it('should render the provided suffix string as text', () => {
      const suffix = () => wrapper.find(formatClassesAsSelector(styles.suffixText));
      expect(suffix()).to.have.length(1);
      expect(suffix().text()).to.equal('Suffix');

      wrapper.setProps(props({ suffix: 'New Suffix' }));
      expect(suffix().text()).to.equal('New Suffix');
    });

    it('should not render the suffix string when suffix prop is undefined', () => {
      const suffix = () => wrapper.find(formatClassesAsSelector(styles.suffixText));
      expect(suffix()).to.have.length(1);

      wrapper.setProps(props({ suffix: undefined }));
      expect(suffix()).to.have.length(0);
    });

    it('should not render the suffix string when suffix prop is an object', () => {
      const suffix = () => wrapper.find(formatClassesAsSelector(styles.suffixText));
      expect(suffix()).to.have.length(1);

      wrapper.setProps(props({ suffix: suffixSelectInput }));
      expect(suffix()).to.have.length(0);
    });
  });

  describe('suffix select input', () => {
    let suffixSelect;

    beforeEach(() => {
      wrapper.setProps(props({ suffix: suffixSelectInput }));
      suffixSelect = () => wrapper.find(Select).dive();
    });

    it('should render an `Select` component', () => {
      expect(suffixSelect()).to.have.length(1);
    });

    it('should pass the provided `id` prop to the `name` and `id` prop of the `Select` component', () => {
      expect(suffixSelect().props().id).to.equal('mySelect');
      expect(suffixSelect().props().name).to.equal('mySelect');
    });

    it('should pass the provided `options` prop to the `options` prop of the `Select` component', () => {
      expect(suffixSelect().props().options).to.eql(suffixOptions);
    });

    it('should pass the provided `value` prop to the `value` prop of the `Select` component', () => {
      expect(suffixSelect().props().value).to.eql(suffixOptions[1]);
    });

    it('should pass the provided `onSuffixChange` prop to the `onChange` prop of the `Select` component', () => {
      expect(wrapper.find('#mySelect').first().props().onChange()).to.equal('suffix changed!');
    });

    it('should disable manual input on the `Select` component`', () => {
      expect(wrapper.find('#mySelect').first().props().onInputChange('should retain', { action: 'non-input-change' })).to.equal('should retain');
      expect(wrapper.find('#mySelect').first().props().onInputChange('should disable', { action: 'input-change' })).to.equal('');
    });
  });
});
