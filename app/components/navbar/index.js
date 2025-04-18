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
import personUtils from '../../core/personutils';

import { DesktopOnly, MobileOnly } from '../mediaqueries';

const Navbar = (props) => {
  // Temporary; Clinician users do not have a completed mobile navbar yet in this iteration.
  // For now, we will continue to show <DesktopNavbar /> for clinicians viewing on mobile.
  // Once a mobile navbar for clinicians is done, this early return statement should be removed.
  if (personUtils.isClinicianAccount(props.user)) {
    return <DesktopNavbar {...props} />;
  }

  return (
    <>
      <DesktopOnly>
        <DesktopNavbar {...props} />
      </DesktopOnly>
      <MobileOnly>
        <MobileNavbar {...props} />
      </MobileOnly>
    </>
  );
};

export default Navbar;
