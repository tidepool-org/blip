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

jest.dontMock('../messages');
jest.dontMock('lodash');

var _ = require('lodash');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var mockData = require('blip-mock-data');

var Messages = require('../messages');

var parentMessage = _.find(mockData.messagenotes['11'], {id: '1141'});
var mockMessages = mockData.messagethread['1141'].concat([parentMessage]);

describe('Messages', function() {
	it('sets messages to undefined if none provided in props', function() {
		var renderedMessages = TestUtils.renderIntoDocument(
			<Messages />
		);
		expect(renderedMessages.state).toEqual({messages: undefined});
	});
	it('receives messages from the server via props and puts them in state', function() {
		var renderedMessages = TestUtils.renderIntoDocument(
			<Messages user={mockData.users['11']} messages={mockMessages} />
		);
		expect(Array.isArray(renderedMessages.state.messages)).toBe(true);
		expect(renderedMessages.state.messages.length).toEqual(mockMessages.length);
	});
	it('finds the correct parent for threaded comment', function() {
		var renderedMessages = TestUtils.renderIntoDocument(
			<Messages user={mockData.users['11']} messages={mockMessages} />
		);
		expect(renderedMessages.getParent()).toEqual(parentMessage);
	});
});