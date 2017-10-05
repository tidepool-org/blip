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

// modified by jebeck from https://github.com/keyanzhang/redux-worker-middleware

const createWorkerMiddleware = (worker, errActionCreators) => {
  /*
    for now, we don't really care if you actually pass it a Worker instance; as long as
    it look likes a Worker and works like a Worker (has a `postMessage` method), it _is_ a Worker.

    The reason behind is that we want to support WebWorker shims in an easy manner,
    although shimming it doesn't make a lot of sense.
  */

  if (!worker) {
    console.error( // eslint-disable-line no-console
      'Fatal: `worker` is falsy.'
    );
  } else if (!worker.postMessage) {
    console.error( // eslint-disable-line no-console
      'Fatal: `worker` doesn\'t have a `postMessage` method.'
    );
  }

  /*
    the first argument is ({ dispatch, getState }) by default,
    but we don't actually need getState for now.
  */
  return ({ dispatch }) => (next) => {
    if (!next) {
      console.error( // eslint-disable-line no-console
        'Fatal: worker middleware received no `next` action. Check your chain of middlewares.'
      );
    }

    return (action) => {
      if (action.meta && action.meta.WebWorker) {
        try {
          worker.postMessage(action);

          worker.onerror = (e) => { // eslint-disable-line no-param-reassign
            console.error(e);
            // TODO: dispatch worker errors back to main thread
            // dispatch(errActionCreators[action.type](action.payload.userId, e));
          };

          worker.onmessage = ({ data: successAction }) => { // eslint-disable-line no-param-reassign
            dispatch(successAction);
          };
        } catch (e) {
          console.error(e);
        }
      }

      return next(action);
    };
  };
};

export default createWorkerMiddleware;
