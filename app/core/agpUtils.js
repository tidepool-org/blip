/* eslint-disable no-undef */

import _ from 'lodash';
import { useDispatch } from 'react-redux';
import { utils as vizUtils } from '@tidepool/viz';
import Plotly from 'plotly.js-basic-dist-min';
import * as actions from '../redux/actions';

export const generateAGPImages = (resolve, reject) => async (pdf, reportTypes = []) => {
  const promises = [];
  let errored = false;

  await _.each(reportTypes, async reportType => {
    let images;

    try{
      images = await vizUtils.agp.generateAGPFigureDefinitions({ ...pdf.data?.[reportType] });
    } catch(e) {
      errored = true;
      return reject(e);
    }

    promises.push(..._.map(images, async (image, key) => {
      if (_.isArray(image)) {
        const processedArray = await Promise.all(
          _.map(image, async (img) => {
            return await Plotly.toImage(img, { format: 'svg' });
          })
        );
        return [reportType, [key, processedArray]];
      } else {
        const processedValue = await Plotly.toImage(image, { format: 'svg' });
        return [reportType, [key, processedValue]];
      }
    }));
  });

  const results = await Promise.all(promises);

  if (results.length) {
    const processedImages = _.reduce(results, (res, entry, i) => {
      const processedImage = _.fromPairs(entry.slice(1));
      res[entry[0]] = {...res[entry[0]], ...processedImage };
      return res;
    }, {});

    resolve(processedImages, pdf.opts || {});
  } else if (!errored) {
    resolve(results);
  }
};

export const useGenerateAGPImages = () => {
  const dispatch = useDispatch();
  const onSuccess = (images, opts) => dispatch(actions.sync.generateAGPImagesSuccess(images, opts));
  const onFailure = (error) => dispatch(actions.sync.generateAGPImagesFailure(error));

  return (pdf, reportTypes) => generateAGPImages(onSuccess, onFailure)(pdf, reportTypes);
};

export default {
  generateAGPImages,
  useGenerateAGPImages,
};
