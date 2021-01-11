import React from 'react';
import _ from 'lodash';
import sinon from 'sinon';
import chai from 'chai';
import { shallow } from 'enzyme';

import config from '../../../app/config';
import FooterLinks from '../../../app/components/footerlinks/';

describe('FooterLinks', () => {
  const { expect } = chai;

  let wrapper;
  const props = {
    trackMetric: sinon.spy(),
    shouldDisplayFooterLinks: true,
  };

  before(() => {
    sinon.spy(console, 'error');
  });

  after(() => {
    console.error.restore();
  });

  beforeEach(() => {
    wrapper = shallow(<FooterLinks {...props} />);
  });

  afterEach(() => {
    props.trackMetric.resetHistory();
    // @ts-ignore
    console.error.resetHistory();
    wrapper = null;
  });

  describe('render', () => {
    it('should render six links', () => {
      expect(wrapper.find('a').length).to.equal(6);
    });

    it('should only render the version when requested', () => {
      let fLinks = shallow(<FooterLinks trackMetric={_.noop} shouldDisplayFooterLinks={false} />);
      expect(fLinks.find('a').length).to.equal(0);
      expect(fLinks.find('.footer-version').length).to.equal(1);
    });
  });

  describe('diabeloop', () => {
    before(() => {
      config.BRANDING = 'diabeloop';
    });
    after(() => {
      config.BRANDING = 'tidepool';
    });

    const links = [{
      id: 'privacy-link',
      text: 'Privacy Policy',
      href: 'https://example.com/data-privacy.en.pdf',
    }, {
      id: 'terms-link',
      text: 'Diabeloop Applications Terms of Use',
      href: 'https://example.com/terms.en.pdf',
    }, {
      id: 'support-link',
      text: 'Diabeloop',
      href: 'https://www.diabeloop.com',
    }, {
      id: 'regulatory-link',
      text: 'Regulatory Information',
      href: 'https://example.com/intended-use.en.pdf',
    }];

    links.forEach((link) => {
      it(`should render the correct ${link.id}`, () => {
        const wa = wrapper.find(`#${link.id}`);
        expect(wa.is('a')).to.be.true;
        const aProps = wa.props();
        expect(aProps.href).to.be.equal(link.href);
        expect(aProps.children).to.be.equal(link.text);
        expect(console.error.callCount).to.equal(0);
      });
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
