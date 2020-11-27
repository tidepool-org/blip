import _ from 'lodash';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import sinon from 'sinon';
import chai from 'chai';

import Settings from '../../../../app/components/chart/settings';
import { MGDL_UNITS } from '../../../../app/core/constants';

describe('Settings', function () {
  const { expect } = chai;

  const bgPrefs = {
    bgClasses: {
      'very-low': {
        boundary: 60
      },
      'low': {
        boundary: 80
      },
      'target': {
        boundary: 180
      },
      'high': {
        boundary: 200
      },
      'very-high': {
        boundary: 300
      }
    },
    bgUnits: MGDL_UNITS
  };

  describe('render', () => {
    before(() => {
      try {
        sinon.spy(console, 'error');
      } catch (e) {
        console.error = sinon.stub();
      }
    });

    after(() => {
      if (_.isFunction(_.get(console, 'error.restore'))) {
        // @ts-ignore
        console.error.restore();
      }
    });

    let settingsElem = null;
    afterEach(() => {
      if (settingsElem) {
        settingsElem.unmount();
        settingsElem = null;
      }
    });

    const fakeState = { viz: {}, blip: { currentPatientInViewId: null } };
    const fakeStore = createStore((state = fakeState) => { return state; }, fakeState);

    it('should render without problems', function () {
      const props = {
        bgPrefs,
        chartPrefs: {},
        timePrefs: {
          timezoneAware: false,
          timezoneName: 'UTC',
        },
        patientData: {
          grouped: { pumpSettings: [{
            source: 'diabeloop',
            activeSchedule: ''
          }] }
        },
        onClickRefresh: sinon.spy(),
        onClickNoDataRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToBgLog: sinon.spy(),
        onSwitchToBasics: sinon.spy(),
        onSwitchToTrends: sinon.spy(),
        onClickPrint: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: '',
        canPrint: true,
      };

      settingsElem = mount(<Provider store={fakeStore}><Settings {...props} /></Provider>);
      expect(console.error.callCount, console.error.getCalls()).to.equal(0);
      expect(settingsElem.find('#tidelineMain').exists()).to.be.true;
    });

    it('should render with missing data message when no pumpSettings data supplied', function () {
      const props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {
          grouped: { foo: 'bar' }
        },
        onClickRefresh: sinon.spy(),
        onClickNoDataRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToBgLog: sinon.spy(),
        onSwitchToBasics: sinon.spy(),
        onSwitchToTrends: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: '',
        canPrint: true,
      };
      settingsElem = mount(<Settings {...props} />);
      expect(settingsElem.find('.patient-data-message').exists()).to.be.true;
    });

    it('should have a refresh button which should call onClickRefresh when clicked', function () {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {
        },
        onClickRefresh: sinon.spy(),
        onClickNoDataRefresh: sinon.spy(),
        trackMetric: sinon.spy(),
        uploadUrl: '',
        canPrint: true,
      };

      settingsElem = mount(<Settings {...props} />);
      expect(settingsElem.find('.btn-refresh').exists()).to.be.true;

      expect(props.onClickRefresh.callCount).to.equal(0);
      settingsElem.find('.btn-refresh').simulate('click');
      expect(props.onClickRefresh.callCount).to.equal(1);
    });

    it('should have a disabled print button and spinner when a pdf is not ready to print', function () {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {},
        canPrint: false,
      };

      settingsElem = mount(<Settings {...props} />);
      expect(settingsElem.find('.printview-print-icon').exists()).to.be.false;
    });

    it('should have an enabled print button and icon when a pdf is ready and call onClickPrint when clicked', function () {
      var props = {
        bgPrefs,
        chartPrefs: {},
        patientData: {},
        printReady: true,
        canPrint: true,
        onClickPrint: sinon.spy(),
      };

      settingsElem = mount(<Settings {...props} />);
      expect(settingsElem.find('.patient-data-subnav-active').exists()).to.be.true;
      expect(settingsElem.find('.printview-print-icon').exists()).to.be.true;
      expect(settingsElem.find('.print-icon').exists()).to.be.true;

      expect(props.onClickPrint.callCount).to.equal(0);
      settingsElem.find('.printview-print-icon').simulate('click');
      expect(props.onClickPrint.callCount).to.equal(1);
    });
  });
});
