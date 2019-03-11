import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import HoverBarLabel from '../../../../src/components/common/stat/HoverBarLabel';

describe('HoverBarLabel', () => {
  let wrapper;

  const defaultProps = {
    barWidth: 30,
    isDisabled: () => false,
    domain: {
      x: [0, 1],
      y: [0, 1],
    },
    style: {},
    scale: {
      x: val => val,
      y: val => val,
    },
    text: () => ['text!', 'suffix!'],
    tooltipText: () => 'tooltip!',
  };

  const props = overrides => _.assign({}, defaultProps, overrides);

  beforeEach(() => {
    wrapper = mount(<HoverBarLabel {...defaultProps} />);
  });

  it('should render the a text prop for the value and suffix text', () => {
    expect(wrapper.find('VictoryLabel')).to.have.length(2);
    expect(wrapper.find('VictoryLabel').at(0).text()).to.equal('text!');
    expect(wrapper.find('VictoryLabel').at(1).text()).to.equal('suffix!');
  });

  it('should render the text element with the styles provided in the style prop', () => {
    wrapper.setProps(props({ style: { fill: 'mauve', fontSize: '40px' } }));
    expect(wrapper.find('VictoryLabel').at(0).props().style.fill).to.equal('mauve');
    expect(wrapper.find('VictoryLabel').at(0).props().style.fontSize).to.equal('40px');
  });

  it('should render the tooltip text', () => {
    expect(wrapper.find('VictoryTooltip')).to.have.length(1);
    expect(wrapper.find('VictoryTooltip').props().text()).to.equal('tooltip!');
  });

  it('should render the text element with the styles provided in the style prop', () => {
    wrapper.setProps(props({ style: { fill: 'mauve', fontSize: '40px' } }));
    expect(wrapper.find('VictoryTooltip').props().style.fill).to.equal('mauve');
  });

  it('should enforce the tooltip fontsize to the minimum of half the bar width or 12', () => {
    wrapper.setProps(props({ barWidth: 30 }));
    expect(wrapper.find('VictoryTooltip').props().style.fontSize).to.equal(12);

    wrapper.setProps(props({ barWidth: 20 }));
    expect(wrapper.find('VictoryTooltip').props().style.fontSize).to.equal(10);
  });
});
