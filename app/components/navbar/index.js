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
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

import styled from '@emotion/styled';
import { breakpoints } from '../../themes/baseTheme';

const MOBILE_BREAKPOINT = breakpoints[1];

const DesktopOnly = styled.div`
  display: block;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MobileOnly = styled.div`
  display: none;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
  }
`;

const Navbar = (props) => (
  <>
    <DesktopOnly>
      <DesktopNavbar {...props} />
    </DesktopOnly>
    <MobileOnly>
      <MobileNavbar {...props} />
    </MobileOnly>
  </>
);

export default Navbar;