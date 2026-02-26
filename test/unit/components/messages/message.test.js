/* global chai */
/* global describe */
/* global it */

import React from 'react';
import { render } from '@testing-library/react';

const expect = chai.expect;
const Message = require('../../../../app/components/messages/message');

describe('Message', function () {
  const timePrefs = {
    timezoneAware: true,
    timezoneName: 'Pacific/Honolulu',
  };

  describe('getInitialState', function() {
    it('should return an object with editing set to false', function() {
      const note = {
        timestamp: new Date().toISOString(),
        messagetext: 'foo',
        user: {
          fullName: 'Test User',
        },
      };

      // Render the component and assert the initial state indirectly via the DOM.
      // When editing=false (initial state) there is no edit form in the rendered output.
      const { container } = render(<Message.WrappedComponent theNote={note} timePrefs={timePrefs} />);
      expect(container.querySelector('.message-header')).to.exist;
      // No edit form visible when editing is false
      expect(container.querySelector('form.message')).to.be.null;
    });
  });

  describe('render', function() {
    it('should render a populated message', function() {
      const note = {
        timestamp: new Date().toISOString(),
        messagetext: 'foo bar',
        user: {
          fullName: 'Test User',
        },
      };

      const { container } = render(<Message.WrappedComponent theNote={note} timePrefs={timePrefs} />);
      expect(container.querySelector('.message-header')).to.exist;
      expect(container.querySelector('.message-timestamp')).to.exist;
      expect(container.querySelector('.messageText')).to.exist;
      expect(container.querySelector('.messageText').textContent).to.equal(note.messagetext);
    });
  });
});
