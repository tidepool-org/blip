import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DataConnection from '../../../../app/components/datasources/DataConnection';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global afterEach */

const expect = chai.expect;

describe('DataConnection', () => {
  const mount = createMount();

  let wrapper;
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
    wrapper = mount(<DataConnection {...defaultProps} />);

    const state = wrapper.find('.state-text').hostNodes();
    expect(state).to.have.lengthOf(1);
    expect(state.text()).to.equal('The state');

    const stateMessage = wrapper.find('.state-message').hostNodes();
    expect(stateMessage).to.have.lengthOf(1);
    expect(stateMessage.text()).to.equal(' - Some message');

    const button = wrapper.find('.action').hostNodes();
    expect(button).to.have.lengthOf(1);
    expect(button.text()).to.equal('Click Me');
  });

  it('should call the button handler', () => {
    wrapper = mount(<DataConnection {...defaultProps} />);

    const button = wrapper.find('.action').hostNodes();
    expect(button).to.have.lengthOf(1);

    sinon.assert.notCalled(defaultProps.buttonHandler);
    expect(button.props().disabled).to.be.false;
    expect(button.is('.processing')).to.be.false;
    button.simulate('click');
    sinon.assert.calledOnce(defaultProps.buttonHandler);
  });

  it('should not show the button if no button handler is provided', () => {
    wrapper = mount(<DataConnection {...{ ...defaultProps, buttonHandler: undefined } } />);

    const button = wrapper.find('.action').hostNodes();
    expect(button).to.have.lengthOf(0);
  });

  it('should not show a disabled button if dictated by prop', () => {
    wrapper = mount(<DataConnection {...{ ...defaultProps, buttonDisabled: true } } />);

    const button = wrapper.find('.action').hostNodes();
    expect(button).to.have.lengthOf(1);
    expect(button.props().disabled).to.be.true;
  });

  it('should not show a processing button if dictated by prop', () => {
    wrapper = mount(<DataConnection {...{ ...defaultProps, buttonProcessing: true } } />);

    const button = wrapper.find('.action').hostNodes();
    expect(button).to.have.lengthOf(1);
    expect(button.is('.processing')).to.be.true;
  });
});
