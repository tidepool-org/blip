/* global afterEach, before, chai, describe, it, sinon */

import React from 'react';
import { shallow } from 'enzyme';

import FooterLinks from '../../../app/components/footerlinks/';

const expect = chai.expect;

describe('FooterLinks', () => {
  let wrapper;
  const props = {
    trackMetric: sinon.spy(),
  };

  before(() => {
    wrapper = shallow(<FooterLinks {...props} />);
  });

  afterEach(() => {
    props.trackMetric.resetHistory();
  });

  describe('render', () => {
    it('should render six links', () => {
      expect(wrapper.find('a').length).to.equal(6);
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
      id: 'mobile',
      metric: 'Mobile App',
    }, {
      id: 'support',
      metric: 'Support',
    }, {
      id: 'legal',
      metric: 'PP and TOU',
    }, {
      id: 'jdrf',
      metric: 'JDRF',
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
