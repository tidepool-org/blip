/* global jest */
/* global Promise */
/* global expect */
/* global describe */
/* global afterEach */
/* global it */
/* global beforeEach */

import React from 'react';
import { waitFor } from '@testing-library/react';
import { utils as vizUtils } from '@tidepool/viz';
import Plotly from 'plotly.js-basic-dist-min';

import { generateAGPImages } from '@app/core/agpUtils';

jest.mock('plotly.js-basic-dist-min', () => ({
  toImage: jest.fn(),
}));

jest.mock('@tidepool/viz', () => ({
  ...jest.requireActual('@tidepool/viz'),
  utils: {
    ...jest.requireActual('@tidepool/viz').utils,
    agp: {
      ...jest.requireActual('@tidepool/viz').utils.agp,
      generateAGPFigureDefinitions: jest.fn(),
    },
  },
}));

describe('generateAGPImages', () => {
  let resolve;
  let reject;

  beforeEach(() => {
    resolve = jest.fn();
    reject = jest.fn();
  });

  describe('successful image generation', () => {
    it('should call resolve with image data upon successful image generation', async () => {
      Plotly.toImage.mockReturnValue('stubbed image data');
      vizUtils.agp.generateAGPFigureDefinitions.mockReturnValue(Promise.resolve(['stubbed image data']));

      const generateFn = generateAGPImages(resolve, reject);
      generateFn({ data: { agpCGM: { foo: 'bar' } } }, ['agpCGM']);

      await waitFor(() => expect(resolve).toHaveBeenCalledWith(
        { agpCGM: { '0': 'stubbed image data' } },
        {},
      ));
    });
  });

  describe('failed image generation', () => {
    const mockError = new Error('failed image generation');

    it('should call reject upon failing image generation', async () => {
      Plotly.toImage.mockReturnValue('stubbed image data');
      vizUtils.agp.generateAGPFigureDefinitions.mockReturnValue(Promise.reject(mockError));

      const generateFn = generateAGPImages(resolve, reject);
      generateFn({ data: { agpCGM: { foo: 'bar' } } }, ['agpCGM']);

      await waitFor(() => expect(reject).toHaveBeenCalledWith(mockError));
    });
  });
});
