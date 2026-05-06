import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToasts } from '../../../../app/providers/ToastProvider';




const Element = ({ toast }) => {
  const { set, clear } = useToasts();

  React.useEffect(() => {
    if (toast) set(toast);
  }, []);

  return <button className="clear" onClick={() => clear()}>Clear Toast</button>;
}

describe('ToastProvider', () => {
  it('should render a success toast message', async () => {
    render(
      <ToastProvider>
        <Element toast={{ message: 'Success!', variant: 'success' }}/>
      </ToastProvider>
    );

    expect(await screen.findByText('Success!')).toBeTruthy();
    expect(document.querySelector('div.success')).toBeTruthy();
  });

  it('should render a warning toast message', async () => {
    render(
      <ToastProvider>
        <Element toast={{ message: 'Warning!', variant: 'warning' }}/>
      </ToastProvider>
    );

    expect(await screen.findByText('Warning!')).toBeTruthy();
    expect(document.querySelector('div.warning')).toBeTruthy();
  });

  it('should render a danger toast message', async () => {
    render(
      <ToastProvider>
        <Element toast={{ message: 'Danger!', variant: 'danger' }}/>
      </ToastProvider>
    );

    expect(await screen.findByText('Danger!')).toBeTruthy();
    expect(document.querySelector('div.danger')).toBeTruthy();
  });

  it('should render an info toast message', async () => {
    render(
      <ToastProvider>
        <Element toast={{ message: 'Info!', variant: 'info' }}/>
      </ToastProvider>
    );

    expect(await screen.findByText('Info!')).toBeTruthy();
    expect(document.querySelector('div.info')).toBeTruthy();
  });

  it('should close the toast when triggered by the `clear` method from an external element', async () => {
    render(
      <ToastProvider>
        <Element toast={{ message: 'Info!' }}/>
      </ToastProvider>
    );

    expect(await screen.findByText('Info!')).toBeTruthy();

    const button = document.querySelector('button.clear');
    expect(button).toBeTruthy();

    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText('Info!')).toBeNull();
    });
  });

  it('should close the toast when triggered by the `close` icon of the toast', async () => {
    render(
      <ToastProvider>
        <Element toast={{ message: 'Info!' }}/>
      </ToastProvider>
    );

    expect(await screen.findByText('Info!')).toBeTruthy();

    const closeIcon = document.querySelector('button.close');
    expect(closeIcon).toBeTruthy();

    fireEvent.click(closeIcon);
    await waitFor(() => {
      expect(screen.queryByText('Info!')).toBeNull();
    });
  });
});
