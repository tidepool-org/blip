import React from 'react';

import styled from '@emotion/styled';
import { breakpoints } from '../../themes/baseTheme';
import { Box } from 'theme-ui';

const DEFAULT_MOBILE_BREAKPOINT = breakpoints[1];

/**
 * Renders the children only if the viewport width exceeds the specified breakpoint
 *
 * @param {String} [breakpoint] Viewport width below which any children will be hidden (e.g. '512px')
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
 * @param {String} [breakpoint] Viewport width above which any children will be hidden (e.g. '512px')
 * @param {Object} [sx] sx prop from theme-ui
 */
export const MobileOnly = styled(Box)`
  display: none;
  @media screen and (max-width: ${props => (props.breakpoint || DEFAULT_MOBILE_BREAKPOINT)}) {
    display: block;
  }
`;

export default { DesktopOnly, MobileOnly };