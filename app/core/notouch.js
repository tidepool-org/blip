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

// Add the `no-touch` class to the `<html>` element if not on a touch screen
// Also available in Modernizr
// Code snippet from:
// http://www.prowebdesign.ro/how-to-deal-with-hover-on-touch-screen-devices/
function detectTouchScreen() {
  if (!('ontouchstart' in document.documentElement)) {
    document.documentElement.className += ' no-touch';
  }
}

module.exports = detectTouchScreen;