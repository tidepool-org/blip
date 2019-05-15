import React from 'react';
import _ from 'lodash';
import { mount } from 'enzyme';

import BgBarLabel from '../../../../src/components/common/stat/BgBarLabel';

describe('BgBarLabel', () => {
  let wrapper;

  const defaultProps = {
    barWidth: 4,
    domain: {
      x: [0, 1],
      y: [0, 1],
    },
    scale: {
      x: val => val,
      y: val => val,
    },
    style: {},
    text: () => 'text!',
    width: 80,
  };

  const props = overrides => _.assign({}, defaultProps, overrides);

  beforeEach(() => {
    wrapper = mount(<BgBarLabel {...defaultProps} />);
  });

  it('should render the text prop', () => {
    expect(wrapper.find('VictoryLabel')).to.have.length(1);
    expect(wrapper.find('VictoryLabel').text()).to.equal('text!');
  });

  it('should render the text element with the styles provided in the style prop', () => {
    wrapper.setProps(props({ style: { fill: 'mauve', fontSize: '40px' } }));
    expect(wrapper.find('VictoryLabel').props().style.fill).to.equal('mauve');
    expect(wrapper.find('VictoryLabel').props().style.fontSize).to.equal('40px');
  });
});
