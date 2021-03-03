import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import _ from 'lodash';

import Message from '../../../../app/components/messages/message';
import { getDisplayTimestamp } from "../../../../app/components/messages/messagemixins";

describe('Message', function () {
  const timePrefs = {
    timezoneAware: true,
    timezoneName: 'Europe/Paris'
  };

  before(() => {
    sinon.stub(console, 'error').callsFake(console.log.bind(console));
  });

  after(() => {
    sinon.restore();
  });

  afterEach(() => {
    expect(console.error.callCount, 'No prop type error').to.equal(0);
    console.error.resetHistory();
  });

  describe('getInitialState', function() {
    it('should return an object with editing set to false', function() {
      const note = {
        timestamp : new Date().toISOString(),
        messagetext : 'foo',
        user : {
          fullName:'Test User'
        }
      };
      const component = shallow(<Message theNote={note} timePrefs={timePrefs} trackMetric={_.noop} />);
      const initialState = component.instance().state;
      const expectedState = {
        editing: false,
        when: getDisplayTimestamp.call({ props: { timePrefs }}, note.timestamp),
        note: note.messagetext,
        author: note.user.fullName,
      };
      expect(initialState, JSON.stringify({ initialState, expectedState, note }, null, 2)).to.be.deep.equal(expectedState);
    });
  });

  describe('render', function() {
    it('should render a populated message', function() {
      const note = {
        timestamp : new Date().toISOString(),
        messagetext : 'foo bar',
        user : {
          fullName:'Test User'
        }
      };

      const component = shallow(<Message theNote={note} timePrefs={timePrefs} trackMetric={_.noop} />);

      // actual rendered text is modified version of input 'note'
      expect(component.exists('.message-header')).to.be.true;

      // actual rendered text is modified version of input 'note'
      expect(component.exists('.message-timestamp')).to.be.true;
      expect(component.exists('.message-note')).to.be.true;
      expect(component.find('.message-note').last().text()).to.be.equal(note.messagetext);
    });
  });
});
