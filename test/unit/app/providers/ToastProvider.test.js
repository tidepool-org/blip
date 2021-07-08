import React from 'react';
import { mount } from 'enzyme';
import { ToastProvider, useToasts } from '../../../../app/providers/ToastProvider';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

const Element = ({ toast }) => {
  const { set, clear } = useToasts();

  React.useEffect(() => {
    if (toast) set(toast);
  }, []);

  return <button className="clear" onClick={() => clear()}>Clear Toast</button>;
}

describe('ToastProvider', () => {
  it('should render a success toast message', () => {
    const wrapper = mount(
      <ToastProvider>
        <Element toast={{ message: 'Success!', variant: 'success' }}/>
      </ToastProvider>
    );

    const toast = wrapper.childAt(1);

    expect(toast.text()).to.equal('Success!');
    expect(toast.find('div.success')).to.have.lengthOf(1);
  });

  it('should render a warning toast message', () => {
    const wrapper = mount(
      <ToastProvider>
        <Element toast={{ message: 'Warning!', variant: 'warning' }}/>
      </ToastProvider>
    );

    const toast = wrapper.childAt(1);

    expect(toast.text()).to.equal('Warning!');
    expect(toast.find('div.warning')).to.have.lengthOf(1);
  });

  it('should render a danger toast message', () => {
    const wrapper = mount(
      <ToastProvider>
        <Element toast={{ message: 'Danger!', variant: 'danger' }}/>
      </ToastProvider>
    );

    const toast = wrapper.childAt(1);

    expect(toast.text()).to.equal('Danger!');
    expect(toast.find('div.danger')).to.have.lengthOf(1);
  });

  it('should render an info toast message', () => {
    const wrapper = mount(
      <ToastProvider>
        <Element toast={{ message: 'Info!', variant: 'info' }}/>
      </ToastProvider>
    );

    const toast = wrapper.childAt(1);

    expect(toast.text()).to.equal('Info!');
    expect(toast.find('div.info')).to.have.lengthOf(1);
  });

  it('should close the toast when triggered by the `clear` method from an external element', () => {
    const wrapper = mount(
      <ToastProvider>
        <Element toast={{ message: 'Info!' }}/>
      </ToastProvider>
    );

    const toast = () => wrapper.childAt(1);
    expect(toast()).to.have.lengthOf(1);
    expect(toast().text()).to.equal('Info!');

    const button = wrapper.find('button.clear');
    expect(button).to.have.lengthOf(1);

    button.simulate('click');
    expect(toast()).to.have.lengthOf(0);
  });

  it('should close the toast when triggered by the `close` icon of the toast', () => {
    const wrapper = mount(
      <ToastProvider>
        <Element toast={{ message: 'Info!' }}/>
      </ToastProvider>
    );

    const toast = () => wrapper.childAt(1);
    expect(toast()).to.have.lengthOf(1);
    expect(toast().text()).to.equal('Info!');

    const closeIcon = toast().find('button.close');
    expect(closeIcon).to.have.lengthOf(1);

    closeIcon.simulate('click');
    expect(toast()).to.have.lengthOf(0);
  });
});
