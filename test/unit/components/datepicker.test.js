/* global chai */
/* global describe */
/* global it */

import React from 'react';
import { render } from '@testing-library/react';
var expect = chai.expect;

import DatePicker from '../../../app/components/datepicker';

describe('DatePicker', function () {

  it('should be a function', function() {
    expect(DatePicker).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      const { container } = render(<DatePicker/>);
      expect(container.firstChild).to.be.ok;
    });
  });
});
