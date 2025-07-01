/* global jest */
/* global Promise */
/* global expect */
/* global describe */
/* global afterEach */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

import React from 'react';
import { waitFor } from '@testing-library/react';
import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
import Plotly from 'plotly.js-basic-dist-min';

import { buildGenerateAGPImages } from '@app/pages/dashboard/PatientDrawer/useAgpCGM/buildGenerateAGPImages';

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

describe('buildGenerateAGPImages', () => {
  const dispatch = jest.fn();

  let toImage;
  let generateAGPFigureDefinitions;

  beforeEach(() => {
    dispatch.mockClear();
  });

  describe('successful image generation', () => {
    it('should call generateAGPImagesSuccess with image data upon successful image generation', async () => {
      Plotly.toImage.mockReturnValue('stubbed image data');
      vizUtils.agp.generateAGPFigureDefinitions.mockReturnValue(Promise.resolve(['stubbed image data']));

      const injectedBuildGenerateAGPImages = buildGenerateAGPImages(dispatch);
      injectedBuildGenerateAGPImages({ data: { agpCGM: { foo: 'bar' } } }, ['agpCGM']);

      await waitFor(() => expect(dispatch).toHaveBeenCalledWith({
        type: 'GENERATE_AGP_IMAGES_SUCCESS',
        payload: {
          images: { agpCGM: { '0': 'stubbed image data' } },
        },
      }));
    });
  });

  describe('failed image generation', () => {
    const mockError = new Error('failed image generation')

    it('should call generateAGPImagesFailure upon failing image generation', async () => {
      Plotly.toImage.mockReturnValue('stubbed image data');
      vizUtils.agp.generateAGPFigureDefinitions.mockReturnValue(Promise.reject(mockError));

      const injectedBuildGenerateAGPImages = buildGenerateAGPImages(dispatch);
      injectedBuildGenerateAGPImages({ data: { agpCGM: { foo: 'bar' } } }, ['agpCGM']);

      await waitFor(() => expect(dispatch).toHaveBeenCalledWith({
        type: 'GENERATE_AGP_IMAGES_FAILURE',
        error: mockError,
      }));
    });
  });
});
