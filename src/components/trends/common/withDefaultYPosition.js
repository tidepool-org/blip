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

import React, { PropTypes } from 'react';

const withDefaultYPosition = (WrappedComponent) => {
  const WithDefault = (props) => {
    const { bgBounds: { targetLowerBound, targetUpperBound }, yScale } = props;

    // default Y position is the center of the target range
    // i.e., 100 mg/dL if target range is 80-120 mg/dL
    const defaultY = yScale(targetUpperBound - (targetUpperBound - targetLowerBound) / 2);

    return (
      <WrappedComponent defaultY={defaultY} {...props} />
    );
  };

  WithDefault.propTypes = {
    bgBounds: PropTypes.shape({
      targetLowerBound: PropTypes.number.isRequired,
      targetUpperBound: PropTypes.number.isRequired,
    }).isRequired,
    yScale: PropTypes.func.isRequired,
  };

  return WithDefault;
};

export default withDefaultYPosition;
