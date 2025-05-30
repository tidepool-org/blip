/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import { utils as vizUtils } from '@tidepool/viz';
import Plotly from 'plotly.js-basic-dist-min';

import { buildGenerateAGPImages } from '../../../../../../app/pages/dashboard/PatientDrawer/useAgpCGM/buildGenerateAGPImages';

const expect = chai.expect;

describe('buildGenerateAGPImages', () => {
  const dispatch = sinon.stub();

  let toImage;
  let generateAGPFigureDefinitions;

  before(() => {
    toImage = sinon.stub(Plotly, 'toImage');
    generateAGPFigureDefinitions = sinon.stub(vizUtils.agp, 'generateAGPFigureDefinitions');
  });
  
  beforeEach(() => {
    dispatch.reset();
  });

  after(() => {
    toImage.restore();
    generateAGPFigureDefinitions.restore();
  });

  context('successful image generation', () => {
    it('should call generateAGPImagesSuccess with image data upon successful image generation', done => {
      toImage.returns('stubbed image data');
      generateAGPFigureDefinitions.resolves(['stubbed image data']);

      const injectedBuildGenerateAGPImages = buildGenerateAGPImages(dispatch);
      injectedBuildGenerateAGPImages({ data: { agpCGM: { foo: 'bar' } } }, ['agpCGM']);

      setTimeout(() => {
        expect(dispatch.getCall(0).args).to.eql([{
          type: 'GENERATE_AGP_IMAGES_SUCCESS',
          payload: { 
            images: { agpCGM: { '0': 'stubbed image data' } }
          },
        }]);

        done();
      });
    });
  });

  context('failed image generation', () => {
    const mockError = new Error('failed image generation')

    it('should call generateAGPImagesFailure upon failing image generation', done => {
      toImage.returns('stubbed image data');
      generateAGPFigureDefinitions.rejects(mockError);

      const injectedBuildGenerateAGPImages = buildGenerateAGPImages(dispatch);
      injectedBuildGenerateAGPImages({ data: { agpCGM: { foo: 'bar' } } }, ['agpCGM']);

      setTimeout(() => {
        expect(dispatch.getCall(0).args).to.eql([{
          type: 'GENERATE_AGP_IMAGES_FAILURE',
          error: mockError
        }]);

        done();
      });
    });
  });
});