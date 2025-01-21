/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global before */
/* global after */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import CGMClipboardButton from '../../../../../../app/pages/dashboard/PatientDrawer/MenuBar/CGMClipboardButton';

const expect = chai.expect;

const patient = {
  birthDate: '2001-01-01',
  email: 'tcrawford@test.test',
  fullName: 'Terence Crawford',
  id: '1234-abcd',
};

const pdf = {
  'data': { // truncated for brevity
    'agpCGM': {
      'data': {
        'current': {
          'stats': {
            'sensorUsage': {
              'sensorUsage': 2532600000,
              'sensorUsageAGP': 99.95264030310206,
              'total': 2592000000,
              'sampleFrequency': 300000,
              'count': 8442,
            },
          },
        },
      },
    },
  },
};

describe('PatientDrawer/MenuBar/CGMClipboardButton', () => {
  CGMClipboardButton.__Rewire__('agpCGMText', sinon.stub().returns('AGP_DATA_STRING_TO_COPY'));

  const writeTextSpy = sinon.stub(window?.navigator?.clipboard, 'writeText');

  describe('When data is not present', () => {
    const insufficientAgpCGM = null;
    const wrapper = mount(<CGMClipboardButton patient={patient} data={insufficientAgpCGM} />);

    it('is disabled', () => {
      expect(wrapper.find('button').props().disabled).to.be.true;
    });
  });

  describe('When data is insufficient due to too few enough readings', () => {
    const insufficientAgpCGM = _.cloneDeep(pdf.data.agpCGM);
    insufficientAgpCGM.data.current.stats.sensorUsage.count = 100;

    const wrapper = mount(<CGMClipboardButton patient={patient} data={insufficientAgpCGM} />);

    it('is disabled', () => {
      expect(wrapper.find('button').props().disabled).to.be.true;
    });
  });

  describe('When data is insufficient due to being BGM patient', () => {
    const insufficientAgpCGM = _.cloneDeep(pdf.data.agpCGM);
    insufficientAgpCGM.data.current.stats = {
      sensorUsage: { 
        sensorUsage: 0, 
        sensorUsageAGP: 0, 
        total: 2592000000, 
        sampleFrequency: 300000, 
        count: 0,
      },
    };

    const wrapper = mount(<CGMClipboardButton patient={patient} data={insufficientAgpCGM} />);

    it('is disabled', () => {
      expect(wrapper.find('button').props().disabled).to.be.true;
    });
  });

  describe('When data is present', () => {
    const wrapper = mount(<CGMClipboardButton patient={patient} data={pdf.data.agpCGM} />);
    wrapper.find('button').simulate('click');

    it('calls writeText on navigator API with correct data', () => {
      expect(wrapper.find('button').props().disabled).to.be.false;
      expect(writeTextSpy.getCall(0).args[0]).to.eql('AGP_DATA_STRING_TO_COPY');
    });
  });
});
