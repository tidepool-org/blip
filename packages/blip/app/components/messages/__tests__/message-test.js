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

jest.dontMock('../message');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

var Message = require('../message');
var onSaveMock = jest.genMockFunction();
var note = { timestamp : new Date().toISOString() , messagetext : 'foo', user : {fullName:'Test User'} };

describe('Message', function() {
  it('updates the text when an edit is made', function() {
    var renderedMessage = TestUtils.renderIntoDocument(
      <Message theNote={note} onSaveEdit={onSaveMock} />
    );

    expect(renderedMessage.state.note).toBe('foo');
    var updates = {timestamp : new Date().toISOString(), text : 'bar'};
    renderedMessage.handleEditSave(updates);

    expect(renderedMessage.state.note).toBe('bar');
  });
});