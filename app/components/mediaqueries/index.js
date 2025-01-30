/**
 * Copyright (c) 2014, Tidepool Project
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
 */

import React from 'react';

import styled from '@emotion/styled';
import { breakpoints } from '../../themes/baseTheme';
import { Box } from 'theme-ui';

const DEFAULT_MOBILE_BREAKPOINT = breakpoints[1];

/**
 * Renders the children only if the viewport width exceeds the specified breakpoint
 *
 * @param {Number} [breakpoint] Viewport width below which any children will be hidden
 * @param {Object} [sx] sx prop from theme-ui
 */
export const DesktopOnly = styled(Box)`
  display: block;
  @media screen and (max-width: ${props => (props.breakpoint || DEFAULT_MOBILE_BREAKPOINT)}) {
    display: none;
  }
`;

/**
 * Renders the children only if the viewport width is below the specified breakpoint
 *
 * @param {Number} [breakpoint] Viewport width above which any children will be hidden
 * @param {Object} [sx] sx prop from theme-ui
 */
export const MobileOnly = styled(Box)`
  display: none;
  @media screen and (max-width: ${props => (props.breakpoint || DEFAULT_MOBILE_BREAKPOINT)}) {
    display: block;
  }
`;

export default { DesktopOnly, MobileOnly };