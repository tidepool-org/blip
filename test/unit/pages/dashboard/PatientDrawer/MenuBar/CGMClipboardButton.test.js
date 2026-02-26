/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import _ from 'lodash';

jest.mock('@tidepool/viz', () => {
  const actual = jest.requireActual('@tidepool/viz');
  return {
    ...actual,
    utils: {
      ...actual.utils,
      text: {
        ...actual.utils.text,
        agpCGMText: jest.fn().mockReturnValue('AGP_DATA_STRING_TO_COPY'),
      },
    },
  };
});

import CGMClipboardButton from '../../../../../../app/pages/dashboard/PatientDrawer/MenuBar/CGMClipboardButton';

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
              'sampleInterval': 300000,
              'count': 8442,
            },
          },
        },
      },
    },
  },
};

describe('PatientDrawer/MenuBar/CGMClipboardButton', () => {
  const originalClipboard = window.navigator.clipboard;
  let writeTextSpy;

  beforeAll(() => {
    writeTextSpy = sinon.stub().resolves();

    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextSpy,
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  });

  afterEach(() => {
    writeTextSpy.resetHistory();
  });

  describe('When data is not present', () => {
    const insufficientAgpCGM = null;

    it('is disabled', () => {
      render(<CGMClipboardButton patient={patient} data={insufficientAgpCGM} />);

      expect(screen.getByRole('button').disabled).toBe(true);
    });
  });

  describe('When data is insufficient due to too few enough readings', () => {
    const insufficientAgpCGM = _.cloneDeep(pdf.data.agpCGM);
    insufficientAgpCGM.data.current.stats.sensorUsage.count = 100;

    it('is disabled', () => {
      render(<CGMClipboardButton patient={patient} data={insufficientAgpCGM} />);

      expect(screen.getByRole('button').disabled).toBe(true);
    });
  });

  describe('When data is insufficient due to being BGM patient', () => {
    const insufficientAgpCGM = _.cloneDeep(pdf.data.agpCGM);
    insufficientAgpCGM.data.current.stats = {
      sensorUsage: {
        sensorUsage: 0,
        sensorUsageAGP: 0,
        total: 2592000000,
        sampleInterval: 300000,
        count: 0,
      },
    };

    it('is disabled', () => {
      render(<CGMClipboardButton patient={patient} data={insufficientAgpCGM} />);

      expect(screen.getByRole('button').disabled).toBe(true);
    });
  });

  describe('When data is present', () => {
    it('calls writeText on navigator API with correct data', () => {
      render(<CGMClipboardButton patient={patient} data={pdf.data.agpCGM} />);

      const button = screen.getByRole('button');
      expect(button.disabled).toBe(false);
      fireEvent.click(button);
      expect(writeTextSpy.getCall(0).args[0]).toEqual('AGP_DATA_STRING_TO_COPY');
    });
  });
});
