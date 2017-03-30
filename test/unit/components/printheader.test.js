/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { shallow } from 'enzyme';
import sundial from 'sundial';

import PrintHeader from '../../../app/components/printheader';

const expect = chai.expect;

describe('PrintHeader', () => {
  const props = {
    patient: {
      profile: {
        fullName: 'Jane Doe'
      },
      permissions: {
        note: {},
        view: {}
      }
    },
    title: 'Print this',
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(
      <PrintHeader
        {...props}
      />
    );
  });

  it('should be a function', function() {
    expect(PrintHeader).to.be.a('function');
  });

  describe('render', function() {
    it('provided a header', function () {
      expect(wrapper.find('.print-view-header')).to.have.length(1);
    });
    it('provided a title', function () {
      expect(wrapper.find('.print-view-header-title').text()).to.equal(props.title);
    });
    it('provided a name', function () {
      expect(wrapper.find('.print-view-header-name').text()).to.equal('Jane Doe');
    });
    it('provided a date', function () {
      const formattedDate = sundial.formatInTimezone(Date.now(), 'UTC', 'MMM D, YYYY');
      expect(wrapper.find('.print-view-header-date').text()).to.equal(formattedDate);
    });
  });
});
