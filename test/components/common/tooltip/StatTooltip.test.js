import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';
import StatTooltip from '../../../../src/components/common/tooltips/StatTooltip';
import styles from '../../../../src/components/common/tooltips/StatTooltip.css';

describe('StatTooltip', () => {
  let wrapper;

  const defaultProps = {
    position: {
      top: 0,
      left: 0,
    },
    annotations: [
      'message 1',
      'message 2',
    ],
  };

  beforeEach(() => {
    wrapper = mount(<StatTooltip {...defaultProps} />);
  });

  it('should render a tooltip', () => {
    expect(wrapper.find('Tooltip')).to.have.length(1);
  });

  it('should render text messages', () => {
    const messages = wrapper.find(formatClassesAsSelector(styles.message)).hostNodes();
    expect(messages).to.have.length(2);
    expect(messages.at(0).text()).to.equal('message 1');
    expect(messages.at(1).text()).to.equal('message 2');
  });

  it('should render markdown messages', () => {
    wrapper.setProps(_.assign({}, defaultProps, {
      annotations: [
        'Some _italic_ text',
        'Some **bold** text',
        'a [link](http://www.example.com)',
      ],
    }));
    const messages = wrapper.find(formatClassesAsSelector(styles.message)).hostNodes();
    expect(messages.at(0).html()).to.include('<em><span>italic</span></em>');
    expect(messages.at(1).html()).to.include('<strong><span>bold</span></strong>');
    expect(messages.at(2).html()).to.include('<a target="_blank" href="http://www.example.com"><span>link</span>');
  });

  it('should render a divider between messages', () => {
    const dividers = () => wrapper.find(formatClassesAsSelector(styles.divider));
    expect(dividers()).to.have.length(1);
    wrapper.setProps(_.assign({}, defaultProps, {
      annotations: [
        'message 1',
        'message 2',
        'message 3',
        'message 4',
      ],
    }));
    expect(dividers()).to.have.length(3);
  });
});
