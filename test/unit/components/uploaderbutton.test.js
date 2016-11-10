/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { mount, shallow } from 'enzyme';

import UploaderButton from '../../../app/components/uploaderbutton';

const expect = chai.expect;

describe('UploaderButton', function () {
  const props = {
    buttonUrl: 'http://tidepool.org/products/tidepool-uploader/',
    buttonText: 'Get the Tidepool Uploader',
    onClick: sinon.spy()
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(
      <UploaderButton
        {...props}
      />
    );
  });

  it('should be a function', function() {
    expect(UploaderButton).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      expect(wrapper.find(UploaderButton)).to.have.length(0);
    });

    it('should have provided button text', function () {
      expect(wrapper.find('.btn-uploader').someWhere(n => (n.text().search(props.buttonText) !== -1))).to.be.true;
    });

    it('should respond to an onClick event', () => {
      var callCount = props.onClick.callCount;
      wrapper.find('a').simulate('click');
      expect(props.onClick.callCount).to.equal(callCount + 1);
  });
  });
});
