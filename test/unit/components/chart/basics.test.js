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
/* global it */
/* global beforeEach */

var expect = chai.expect;

import React from 'react';
import _ from 'lodash';
import Basics from '../../../../app/components/chart/basics';
import { shallow } from 'enzyme';

describe('Basics', () => {
  let baseProps = {
    bgPrefs: {
      bgClasses: {
        'very-low': {
          boundary: 60
        },
        'low': {
          boundary: 80
        },
        'target': {
          boundary: 180
        },
        'high': {
          boundary: 200
        },
        'very-high': {
          boundary: 300
        }
      },
      bgUnits: 'mg/dL'
    },
    patientData: {
      basicsData: {
        data: {},
      },
    },
  };

  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<Basics {...baseProps} />)
  })

  describe('render', function() {
    it('should render the missing data text if no data has been uploaded', function () {
      const noDataMessage = wrapper.find('.patient-data-message');
      const chart = wrapper.find('BasicsChart');
      expect(noDataMessage.length).to.equal(1);
      expect(chart.length).to.equal(0);
      expect(noDataMessage.text()).to.include('upload some device data');
    });

    it('should render the basics chart if any data is uploaded', function () {
      wrapper.setProps({
        patientData: {
          basicsData: _.assign({}, baseProps.patientData.basicsData, {
            data: {
              smbg: {
                data: [
                  { type: 'smbg' }
                ],
              },
            },
          }),
        }
      });
      const noDataMessage = wrapper.find('.patient-data-message');
      const chart = wrapper.find('BasicsChart');
      expect(noDataMessage.length).to.equal(0);
      expect(chart.length).to.equal(1);
    });
  });
});
