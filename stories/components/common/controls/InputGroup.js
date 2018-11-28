import React from 'react';

import { storiesOf } from '@storybook/react';

import InputGroup from '../../../../src/components/common/controls/InputGroup';

const stories = storiesOf('InputGroup', module);

const suffixOptions = [
  {
    label: 'kg',
    value: 'kg',
  },
  {
    label: 'lb',
    value: 'lb',
  },
];

const Wrapper = ({ children }) => (
  <div
    style={{
      maxWidth: '300px',
      border: '1px solid #ccc',
      padding: '30px',
    }}
  >
    {children}
  </div>
);

class InteractiveContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      input: props.value,
      suffix: props.suffixValue,
    };
  }

  handleInputChange = (e, input) => {
    this.setState({
      input,
    });
  };

  handleSuffixChange = suffix => {
    this.setState({
      suffix,
    });
  };

  render = () => (
    <InputGroup
      {...this.props}
      onChange={this.handleInputChange}
      onSuffixChange={this.handleSuffixChange}
      suffixValue={this.state.suffix}
      value={this.state.input}
    />
  );
}

stories.add('Number, Suffix options', () => (
  <Wrapper>
    <InteractiveContainer
      label="Weight"
      name="weight"
      step={1}
      suffix={suffixOptions}
      suffixValue={suffixOptions[0]}
      type="number"
    />
  </Wrapper>
));

stories.add('Number, Suffix string', () => (
  <Wrapper>
    <InputGroup
      name="weight"
      label="Weight"
      step={1}
      suffix="kg"
      type="number"
    />
  </Wrapper>
));
