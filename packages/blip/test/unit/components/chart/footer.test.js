import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import Footer from '../../../../app/components/chart/footer';

describe('Footer', function () {
  before(() => {
    sinon.stub(console, 'error');
  });

  after(() => {
    sinon.restore();
  });

  describe('render', function() {
    it('should render without problems', function () {
      const props = {
        onClickRefresh: sinon.stub(),
      };
      const wrapper = shallow(<Footer {...props} />);
      expect(wrapper.exists('.patient-data-footer-outer')).to.be.true;
      expect(console.error.callCount).to.equal(0);
    });

    it('should trigger onClickRefresh when refresh button clicked', function () {
      var props = {
        onClickRefresh: sinon.stub(),
      };
      const wrapper = shallow(<Footer {...props} />);
      expect(props.onClickRefresh.callCount).to.equal(0);
      wrapper.find('.btn-refresh').last().simulate('click');
      wrapper.update();
      expect(props.onClickRefresh.callCount).to.equal(1);
    });

    it('should render children on the right when present', function () {
      const props = {
        onClickRefresh: sinon.stub(),
      };

      const wrapper = shallow(
        <Footer {...props} >
          <div id="right-footer-test-div" />
        </Footer>
      );
      expect(wrapper.exists('#right-footer-test-div')).to.be.true;
    });
  });
});
