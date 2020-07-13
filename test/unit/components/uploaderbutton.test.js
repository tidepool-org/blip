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
    buttonText: 'Get the Tidepool Uploader',
    onClick: sinon.spy()
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
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
      expect(wrapper.find(UploaderButton)).to.have.length(1);
    });

    it('should have a pair of download links', function () {
      expect(wrapper.find('a.btn-uploader')).to.have.length(2);
    });
  });
});
