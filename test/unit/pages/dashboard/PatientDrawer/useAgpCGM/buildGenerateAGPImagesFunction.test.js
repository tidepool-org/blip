import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import { buildGenerateAGPImagesWrapper } from '../../../../../../app/pages/dashboard/PatientDrawer/useAgpCGM/buildGenerateAGPImagesFunction';

const expect = chai.expect;

const dispatch = sinon.stub();

describe('buildGenerateAGPImages', () => {
  beforeEach(() => {
    dispatch.reset();
  })

  context('successful image generation', () => {
    const Plotly = { toImage: sinon.stub().returns('stubbed image data') };
    const vizUtils = { agp: { generateAGPFigureDefinitions: sinon.stub().resolves(['stubbed image data']) } }

    it('should call generateAGPImagesSuccess with image data upon successful image generation', done => {
      const injectedBuildGenerateAGPImages = buildGenerateAGPImagesWrapper(vizUtils, Plotly)(dispatch);
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

    const Plotly = { toImage: sinon.stub().returns('stubbed image data') };
    const vizUtils = { agp: { generateAGPFigureDefinitions: sinon.stub().rejects(mockError) } }

    it('should call generateAGPImagesFailure upon failing image generation', done => {
      const injectedBuildGenerateAGPImages = buildGenerateAGPImagesWrapper(vizUtils, Plotly)(dispatch);
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