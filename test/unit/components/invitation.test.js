/* global describe */
/* global beforeEach */
/* global afterEach */
/* global sinon */
/* global it */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import chai from 'chai';
import Invitation from '../../../app/components/invitation';

const { expect } = chai;
describe('Invitation', function () {
  const props = {
    invitation: {
      creator: {
        profile: {
          patient: {
            isOtherPerson: false,
            fullName: 'Wrong name'
          },
          fullName: 'John Doe'
        }
      }
    },
    onAcceptInvitation: sinon.spy(),
    onDismissInvitation: sinon.spy(),
    trackMetric: sinon.spy(),
  };
  let container = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    document.body.removeChild(container);
    container = null;
    props.onAcceptInvitation.resetHistory();
    props.onDismissInvitation.resetHistory();
    props.trackMetric.resetHistory();
  });

  it('should render without problems when required props are present', () => {
    ReactDOM.render(<Invitation { ...props} />, container, () => {
      let button = container.querySelector('.btn-secondary');
      expect(button.textContent, 'secondary button text is Ignore').to.equal('Ignore');
      button = container.querySelector('.btn-primary');
      expect(button.textContent, 'primary button text is Join the team!').to.equal('Join the team!');
      const divMessage = container.querySelector('.invitation-message');
      expect(divMessage.textContent, 'message is You have been invited to see John Doe\'s data!').to.equal('You have been invited to see John Doe\'s data!');
    });
  });

  it('Should call onAcceptInvitation after click on the accept button', () => {
    ReactDOM.render(<Invitation { ...props} />, container, () => {
      const button = container.querySelector('.btn-primary');
      TestUtils.Simulate.click(button);
      expect(props.trackMetric.calledOnceWith('Invitation accepted'), 'trackMetric accepted').to.be.true;
      expect(props.onAcceptInvitation.calledOnceWith(props.invitation), 'onAcceptInvitation').to.be.true;
    });
  });

  it('Should call onDismissInvitation after click on the dismiss button', () => {
    ReactDOM.render(<Invitation { ...props} />, container, () => {
      const button = container.querySelector('.btn-secondary');
      TestUtils.Simulate.click(button);
      expect(props.trackMetric.calledOnceWith('Invitation dismissed'), 'trackMetric dismissed').to.be.true;
      expect(props.onDismissInvitation.calledOnceWith(props.invitation), 'onDismissInvitation').to.be.true;
    });
  });
});
