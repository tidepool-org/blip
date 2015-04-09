/**
 * Copyright (c) 2015, Tidepool Project
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

jest.dontMock('../termsoverlay');

describe('termsoverlay', function() {

  var React = require('react/addons');
  var TermsOverlay = require('../termsoverlay.js');
  var TestUtils = React.addons.TestUtils;


  it('is not agreed by default', function() {
    // Render a checkbox with label in the document
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay />
    );

    expect(terms.state.agreed).toEqual(false);
  });
});