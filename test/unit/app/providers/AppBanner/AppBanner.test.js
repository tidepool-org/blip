import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { fireEvent, screen } from '@testing-library/react';
import { mountWithProviders } from '../../../../utils/mountWithProviders';
import AppBanner from '../../../../../app/providers/AppBanner/AppBanner';
import { AppBannerContext, CLICKED_BANNER_ACTION, DISMISSED_BANNER_ACTION, SEEN_BANNER_ACTION } from '../../../../../app/providers/AppBanner/AppBannerProvider';
import * as actions from '../../../../../app/redux/actions';

jest.mock('../../../../../app/redux/actions', () => ({
  async: {
    handleBannerInteraction: jest.fn(),
  },
}));

jest.mock('../../../../../app/core/api', () => ({
  __esModule: true,
  default: 'api',
}));

/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

describe('AppBanner handleClickAction', () => {
  let defaultState;
  let dispatchSpy;
  let trackMetricStub;
  let setBannerInteractedForPatientStub;
  let setBannerShownForPatientStub;
  let contextValue;
  let handleBannerInteractionStub;

  beforeEach(() => {
    actions.async.handleBannerInteraction.mockReturnValue(undefined);
    handleBannerInteractionStub = actions.async.handleBannerInteraction;

    defaultState = {
      loggedInUserId: 'user123',
      currentPatientInViewId: 'user123',
      working: {},
    };

    dispatchSpy = sinon.spy();
    trackMetricStub = sinon.stub();
    setBannerInteractedForPatientStub = sinon.stub();
    setBannerShownForPatientStub = sinon.stub();

    contextValue = {
      banner: {
        id: 'testBanner',
        interactionId: 'TestBanner',
        label: 'Test Label',
        message: 'Test Message',
        title: 'Test Title',
        action: {
          text: 'Take Action',
        },
      },
      bannerShownForPatient: {},
      setBannerShownForPatient: setBannerShownForPatientStub,
      bannerInteractedForPatient: {},
      setBannerInteractedForPatient: setBannerInteractedForPatientStub,
      setFormikContext: sinon.stub(),
      setTrackMetric: sinon.stub(),
    };
  });

  afterEach(() => {
    actions.async.handleBannerInteraction.mockReset();
  });

  function createWrapper(customBanner = {}) {
    const finalContext = {
      ...contextValue,
      banner: { ...contextValue.banner, ...customBanner },
    };

    const rendered = mountWithProviders(
      <AppBannerContext.Provider value={finalContext}>
        <AppBanner trackMetric={trackMetricStub} />
      </AppBannerContext.Provider>,
      {
        preloadedState: defaultState,
        dispatchSpy,
      }
    );
    return rendered;
  }

  it('should call trackMetric if an action metric is defined', () => {
    createWrapper({
      action: {
        text: 'Take Action',
        metric: 'testMetric',
        metricProps: { someProp: true },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Take Action' }));
    expect(trackMetricStub.calledWith('testMetric', { someProp: true })).to.be.true;
  });

  it('should set showModal to true and not call the action handler if a modal component is present', () => {
    const actionHandlerStub = sinon.stub();
    createWrapper({
      action: {
        text: 'Take Action',
        metric: 'testMetric',
        modal: { component: () => <div className='modal'>Modal</div> },
        handler: actionHandlerStub,
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Take Action' }));
    expect(screen.queryByText('Modal')).to.not.be.null;
    expect(actionHandlerStub.called).to.be.false;
  });

  it('should call the action handler if present (no modal)', () => {
    const actionHandlerStub = sinon.stub();
    createWrapper({
      action: {
        text: 'Take Action',
        handler: actionHandlerStub,
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Take Action' }));
    expect(actionHandlerStub.called).to.be.true;
  });

  it('should call completeClickAction if no working key is defined', () => {
    const handlerStub = sinon.stub();
    createWrapper({
      action: {
        text: 'Take Action',
        handler: handlerStub,
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Take Action' }));
    expect(handlerStub.called).to.be.true;

    expect(dispatchSpy.called).to.be.true;
  });

  it('should NOT call completeClickAction if a working key is defined', () => {
    createWrapper({
      action: {
        text: 'Take Action',
        working: { key: 'someWorkKey' },
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Take Action' }));

    expect(dispatchSpy.called).to.be.false;
    expect(handleBannerInteractionStub.mock.calls.length).to.equal(0);
  });

  it('should call handleBannerInteraction with SEEN_BANNER_ACTION when banner is shown', () => {
    createWrapper({
      show: {
        metric: 'showMetric',
        metricProps: { someProp: true },
      },
      maxUniqueDaysShown: 1,
    });

    expect(dispatchSpy.called).to.be.true;
    expect(trackMetricStub.calledWith('showMetric', { someProp: true })).to.be.true;
    expect(setBannerShownForPatientStub.calledWith({ TestBanner: { user123: true } })).to.be.true;
  });

  it('should call handleBannerInteraction with DISMISSED_BANNER_ACTION when banner is dismissed', () => {
    const handlerStub = sinon.stub();
    createWrapper({
      dismiss: {
        handler: handlerStub,
      },
    });

    fireEvent.click(screen.getByLabelText('Close banner'));
    expect(handlerStub.called).to.be.true;

    expect(dispatchSpy.called).to.be.true;
    expect(actions.async.handleBannerInteraction.mock.calls.length).to.be.at.least(1);
    expect(actions.async.handleBannerInteraction.mock.calls[0]).to.include(DISMISSED_BANNER_ACTION);
  });
});
