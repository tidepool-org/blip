import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DataConnection from '../../../../app/components/datasources/DataConnection';
/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global afterEach */

const expect = chai.expect;

describe('DataConnection', () => {
  const defaultProps = {
    label: 'test data connection',
    buttonDisabled: false,
    buttonHandler: sinon.stub(),
    buttonProcessing: false,
    buttonText: 'Click Me',
    messageText: 'Some message',
    stateText: 'The state',
  };

  afterEach(() => {
    defaultProps.buttonHandler.resetHistory();
  });

  it('should render the data connection text with the provided props', () => {
    const { container } = render(<DataConnection {...defaultProps} />);

    const state = container.querySelectorAll('.state-text');
    expect(state).to.have.lengthOf(1);
    expect(state[0].textContent).to.equal('The state');

    const stateMessage = container.querySelectorAll('.state-message');
    expect(stateMessage).to.have.lengthOf(1);
    expect(stateMessage[0].textContent.trim()).to.equal('- Some message');

    const button = container.querySelectorAll('.action');
    expect(button).to.have.lengthOf(1);
    expect(button[0].textContent).to.equal('Click Me');
  });

  it('should call the button handler', () => {
    const { container } = render(<DataConnection {...defaultProps} />);

    const button = container.querySelectorAll('.action');
    expect(button).to.have.lengthOf(1);

    sinon.assert.notCalled(defaultProps.buttonHandler);
    expect(button[0].disabled).to.be.false;
    expect(button[0].classList.contains('processing')).to.be.false;
    fireEvent.click(button[0]);
    sinon.assert.calledOnce(defaultProps.buttonHandler);
  });

  it('should not show the button if no button handler is provided', () => {
    const { container } = render(<DataConnection {...{ ...defaultProps, buttonHandler: undefined } } />);
    const button = container.querySelectorAll('.action');
    expect(button).to.have.lengthOf(0);
  });

  it('should show a disabled button if dictated by prop', () => {
    const { container } = render(<DataConnection {...{ ...defaultProps, buttonDisabled: true } } />);
    const button = container.querySelectorAll('.action');
    expect(button).to.have.lengthOf(1);
    expect(button[0].disabled).to.be.true;
  });

  it('should show a processing button if dictated by prop', () => {
    const { container } = render(<DataConnection {...{ ...defaultProps, buttonProcessing: true } } />);
    const button = container.querySelectorAll('.action');
    expect(button).to.have.lengthOf(1);
    expect(button[0].classList.contains('processing')).to.be.true;
  });
});
