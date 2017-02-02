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
import { mount } from 'enzyme';

import PeopleTable from '../../../app/components/peopletable';

const expect = chai.expect;

describe('PeopleTable', () => {
  const props = {
    people: [{
        profile: {
          fullName: 'Zoe Doe',
          patient: { birthday: '1969-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2aad188/data',
        },
        permissions: { root: {} }
      },
      {
        profile: {
          fullName: 'Tucker Doe',
          patient: { birthday: '1977-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2bbd188/data',
        }
      },
      {
        profile: {
          fullName: 'John Doe',
          patient: { birthday: '2000-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2ccd188/data',
        },
      },
      {
        profile: {
          fullName: 'amanda jones',
          patient: { birthday: '1989-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2ddd188/data',
        }
      },
      {
        profile: {
          fullName: 'Anna Zork',
          patient: { birthday: '2010-08-19T01:51:55.000Z' },
          link: 'http://localhost:3000/patients/0cc2eed188/data',
        }
      }
    ],
    trackMetric: sinon.stub(),
    containerWidth: 500,
    containerHeight: 300,
  };

  let wrapper;
  beforeEach(() => {
    props.trackMetric.reset();
    wrapper = mount(
      <PeopleTable
        {...props}
      />
    );
  });

  it('should be a function', function() {
    expect(PeopleTable).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      expect(wrapper.find(PeopleTable)).to.have.length(1);
    });

    it('should have provided search box', function () {
      expect(wrapper.find('.peopletable-search-box')).to.have.length(1);
    });

    it('should have provided toggle to show or hide names', function () {
      expect(wrapper.find('.peopletable-names-toggle')).to.have.length(1);
    });

    it('should have one row of data in the table by default ', function () {
      //only one row for the header
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(1);
    });

    it('should default searching and showNames to be false', function () {
      expect(wrapper.state().searching).to.equal(false);
      expect(wrapper.state().showNames).to.equal(false);
    });
  });
  describe('showNames', function() {
    it('should show a row of data for each person', function () {
      wrapper.find('.peopletable-names-toggle').simulate('click');
      wrapper.setState({ showNames: true });
      // 5 people plus one row for the header
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(6);
    });
    it('should trigger a call to trackMetric', function () {
      wrapper.find('.peopletable-names-toggle').simulate('click');
      expect(props.trackMetric.calledWith('Clicked Show All')).to.be.true;
      expect(props.trackMetric.callCount).to.equal(1);
    });
  });
  describe('searching', function() {
    it('should show a row of data for each person', function () {
      wrapper.setState({ searching: true });
      // 5 people plus one row for the header
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(6);
    });
    it('should show a row of data for each person that matches the search value', function () {
      // showing `amanda` or `Anna`
      wrapper.find('input').simulate('change', {target: {value: 'a'}});
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(3);
      expect(wrapper.state().searching).to.equal(true);
      // now just showing `amanda`
      wrapper.find('input').simulate('change', {target: {value: 'am'}});
      expect(wrapper.find('.public_fixedDataTableRow_main')).to.have.length(2);
      expect(wrapper.state().searching).to.equal(true);
    });
    it('should NOT trigger a call to trackMetric', function () {
      wrapper.find('input').simulate('change', {target: {value: 'am'}});
      expect(props.trackMetric.callCount).to.equal(0);
    });
  });
});
