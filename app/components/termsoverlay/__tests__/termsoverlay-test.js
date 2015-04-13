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

/*global describe, it, jest, expect */

jest.dontMock('../termsoverlay');

var React = require('react/addons');
var TermsOverlay = require('../termsoverlay.js');
var TestUtils = React.addons.TestUtils;

/*
TOU = Terms of Use
PP = Privacy Policy

Final URLs will be: TOU: http://developer.tidepool.io/privacy-policy/
PP: http://developer.tidepool.io/terms-of-use/

Prior to showing TOU and PP, present a
Before you can sign up for Blip, we need to know how old you are: [ ] I am 18 years old or older. (default selection)
[ ] I am between 13 and 17 years old. You'll need to have a parent or guardian agree to the terms on the next screen.
[ ] I am 12 years old or younger.
[ CONTINUE ]

Store the state of this selection for the user.

== For under 12 login flow. ==
Display: "We are really sorry, but you need to be 13 or older in order to create an account and use Tidepool's Applications."

== For 18 and over login flow: ==
Present TOU and PP in separate scrollable windows. Can be side by side or top/bottom or one followed by the next: Present one checkbox and text.
[ ] "I am 18 or older and I accept the terms of the Tidepool Applications Terms of Use and Privacy Policy".
Do not enable [I ACCEPT] button until the checkbox is selected.

== For 13 - 17 login flow: ==
Present TOU and PP in separate scrollable windows (as above).
Present TWO checkboxes: [ ] "I am 18 or older and I accept the terms of the Tidepool Applications Terms of Use and Privacy Policy".
[ ] "I to my child aged 13 through 17 using Tidepool Applications and agree that they are also bound to the terms of the Tidepool Applications Terms of Use and Privacy Policy".

Do not enable [I ACCEPT] button until BOTH checkboxes are selected.
*/



describe('termsoverlay', function() {
  it('is not agreed by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay />
    );
    expect(terms.state.agreed).toEqual(false);
  });
  it('is not agreed by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay />
    );
    expect(terms.state.isChecked).toEqual(false);
  });
  it('age is not confirmed by default', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay />
    );
    expect(terms.state.ageConfirmed).toEqual(false);
  });
  it('shows age confirmation form by defaut', function() {
    var terms = TestUtils.renderIntoDocument(
      <TermsOverlay />
    );

    var age = TestUtils.findRenderedDOMComponentWithClass(terms, 'terms-overlay-age-form');
    expect(age).not.toBeNull();

    var options = age.props.children[0];
    var button = age.props.children[1];

    expect(options.length).toEqual(3);

    for (var i = options.length - 1; i >= 0; i--) {
      expect(options[i].type).toEqual('input');
    };

    expect(button.type).toEqual('button');
  });
});