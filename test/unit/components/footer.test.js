/* global afterEach, before, chai, describe, it, sinon */

import React from 'react';
import { shallow } from 'enzyme';

import Footer from '../../../app/components/footer/';

const expect = chai.expect;

describe('Footer', () => {
  let wrapper;
  const props = {
    trackMetric: sinon.spy(),
  };

  before(() => {
    wrapper = shallow(<Footer {...props} />);
  });

  afterEach(() => {
    props.trackMetric.resetHistory();
  });

  describe('render', () => {
    it('should render four links', () => {
      expect(wrapper.find('a').length).to.equal(4);
    });
  });

  describe('interactions', () => {
    const links = [{
      id: 'twitter',
      metric: 'Twitter',
    }, {
      id: 'facebook',
      metric: 'Facebook',
    }, {
      id: 'support',
      metric: 'Support',
    }, {
      id: 'legal',
      metric: 'PP and TOU',
    }];

    links.forEach((link) => {
      it(`a#${link.id} should fire the trackMetric function when clicked`, () => {
        const linkEl = wrapper.find(`#${link.id}`);
        expect(props.trackMetric.callCount).to.equal(0);
        linkEl.simulate('click');
        expect(props.trackMetric.callCount).to.equal(1);
        expect(props.trackMetric.firstCall.args[0]).to.equal(`Clicked Footer ${link.metric}`);
      });
    });
  });
});
