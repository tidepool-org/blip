/* global chai */
/* global context */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global beforeEach */
/* global after */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import Settings from '../../../../app/components/chart/settings';
import { MGDL_UNITS } from '../../../../app/core/constants';
import i18next from '../../../../app/core/language';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moment from 'moment-timezone';

import { ToastProvider } from '../../../../app/providers/ToastProvider.js';
import DataConnectionsModal from '../../../../app/components/datasources/DataConnectionsModal.js';
import DataConnections, { activeProviders } from '../../../../app/components/datasources/DataConnections.js';
const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('Settings', () => {
  let wrapper;
  let props;
  let clock;

  const bgPrefs = {
    bgClasses: {
      'very-low': {
        boundary: 60,
      },
      low: {
        boundary: 80,
      },
      target: {
        boundary: 180,
      },
      high: {
        boundary: 200,
      },
      'very-high': {
        boundary: 300,
      },
    },
    bgUnits: MGDL_UNITS,
  };

  const patient = {
    emails: ['user@example.com'],
    userid: 'userId123',
    username: 'user@example.com',
    profile: {
      fullName: 'Example User',
      clinic: {
        role: 'clinic_manager',
      },
      patient: {
        foo: 'bar',
      },
    },
  };

  const baseProps = {
    chartPrefs: {
      settings: {
        animas: {
          basal1: true,
        },
      },
    },
    data: {
      bgPrefs,
      timePrefs: {
        timezoneAware: false,
        timezoneName: 'US/Pacific',
      },
      data: {
        combined: [
          {
            type: 'pumpSettings',
            normalTime: '2023-01-01T00:00:00Z',
            source: 'source1',
            id: 'id1',
          },
        ],
      },
    },
    printReady: false,
    trackMetric: sinon.stub(),
    updateChartPrefs: sinon.stub(),
    pdf: {},
    t: i18next.t.bind(i18next),
    onClickRefresh: sinon.stub(),
    onClickNoDataRefresh: sinon.stub(),
    onSwitchToDaily: sinon.stub(),
    onSwitchToSettings: sinon.stub(),
    onSwitchToBgLog: sinon.stub(),
    patient,
    uploadUrl: '',
  };

  before(() => {
    props = _.merge({}, baseProps);
    Settings.__Rewire__(
      'PumpSettingsContainer',
      ({
        copySettingsClicked,
        toggleSettingsSection,
        view,
      }) => (
        <div className="pump-settings-container">
          <button
            type='button'
            className="btn-copy-settings"
            onClick={copySettingsClicked}
          >
            Copy Settings
          </button>
          <button
            type='button'
            className="btn-toggle-settings"
            onClick={() => {
              toggleSettingsSection('animas', 'basal1');
            }}
          >
            {view === 'display' ? 'Hide Settings' : 'Show Settings'}
          </button>
        </div>
      )
    );
    clock = sinon.useFakeTimers();
  });

  after(() => {
    Settings.__ResetDependency__('PumpSettingsContainer');
    clock.uninstall();
  });

  afterEach(() => {
    baseProps.trackMetric.reset();
    baseProps.updateChartPrefs.reset();
    baseProps.onClickRefresh.reset();
    baseProps.onClickNoDataRefresh.reset();
    baseProps.onSwitchToDaily.reset();
    baseProps.onSwitchToSettings.reset();
    baseProps.onSwitchToBgLog.reset();
    clock.reset();
  });

  const defaultState = {
    blip: {
      allUsersMap: {
        userId123: patient,
      },
      loggedInUserId: 'userId123',
      settings: {
        bgUnits: 'mgdl',
        bgUnitsDisplay: 'mg/dl',
        units: 'mgdl',
        unitsDisplay: 'mg/dl',
        timezoneName: 'US/Pacific',
        timezoneAware: false,
        timezoneOffset: -480,
        timezoneDisplay: '(GMT-08:00) Pacific Time (US & Canada)',
      },
    },

    charts: {
      chartPrefs: {
        settings: {
          animas: {
            basal1: true,
          },
          touched: true,
        },
      },
    },
  };

  const store = mockStore(defaultState);

  const mountWrapper = (customProps) => {
    wrapper = mount(
      <Provider store={store}>
        <Settings {...props} {...customProps} />
      </Provider>
    );
  };

  describe('render', () => {
    it('should render without problems', () => {
      mountWrapper();
      expect(wrapper.find(Settings)).to.have.length(1);
      expect(wrapper.find('#tidelineMain')).to.have.length(1);
    });

    it('should render with missing data message when no pumpSettings data supplied', () => {
      const props = {
        chartPrefs: {},
        data: {
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
        onClickRefresh: sinon.spy(),
        onClickNoDataRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToBgLog: sinon.spy(),
        patient,
        trackMetric: sinon.spy(),
        uploadUrl: '',
        pdf: {
          url: 'blobURL',
        },
      };
      const settingsElem = React.createElement(Settings, props);
      const elem = mount(<Provider store={store}>{settingsElem}</Provider>);
      expect(elem).to.be.ok;
      const x = elem.find('.patient-data-message');
      expect(x).to.be.ok;
    });

    it('should have a refresh button which should call onClickRefresh when clicked', () => {
      const props = {
        chartPrefs: {},
        data: {
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
        onClickRefresh: sinon.spy(),
        onClickNoDataRefresh: sinon.spy(),
        onSwitchToDaily: sinon.spy(),
        onSwitchToSettings: sinon.spy(),
        onSwitchToBgLog: sinon.spy(),
        patient,
        trackMetric: sinon.spy(),
        uploadUrl: '',
        pdf: {
          url: 'blobURL',
        },
      };
      const settingsElem = React.createElement(Settings, props);
      const elem = mount(<Provider store={store}>{settingsElem}</Provider>);
      const refreshButton = elem.find('.btn-refresh').hostNodes();

      expect(props.onClickRefresh.callCount).to.equal(0);
      refreshButton.simulate('click');
      expect(props.onClickRefresh.callCount).to.equal(1);
    });

    it('should have a print button and icon and call onClickPrint when clicked', () => {
      const props = _.merge({}, baseProps, {
        chartPrefs: {},
        data: {
          bgPrefs,
          timePrefs: {
            timezoneAware: false,
            timezoneName: 'US/Pacific',
          },
        },
        onClickPrint: sinon.spy(),
        patient,
      });

      const settingsElem = React.createElement(Settings, props);
      const elem = mount(<Provider store={store}>{settingsElem}</Provider>);
      const printLink = elem.find('.printview-print-icon');

      expect(printLink).to.be.ok;

      expect(props.onClickPrint.callCount).to.equal(0);
      printLink.simulate('click');
      expect(props.onClickPrint.callCount).to.equal(1);
    });
  });

  describe('toggleSettingsSection', () => {
    it('should update the toggle state of a section in chartPrefs state and set touched state to `true`', () => {
      mountWrapper({
        data: {
          data: {
            combined: [
              {
                type: 'pumpSettings',
                normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
                source: 'source1',
                id: 'id1',
              },
              {
                type: 'pumpSettings',
                normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
                source: 'source2',
                id: 'id2',
              },
            ],
          },
          timePrefs: { timezoneName: 'UTC' },
        },
      });
      const toggleSettingsButton = wrapper.find('.btn-toggle-settings');
      toggleSettingsButton.simulate('click');
      sinon.assert.callCount(baseProps.updateChartPrefs, 1);
      sinon.assert.calledWith(
        baseProps.updateChartPrefs,
        {
          ...baseProps.chartPrefs,
          settings: {
            animas: { basal1: false },
            touched: true,
          },
        },
        false
      );
    });
  });

  describe('handleCopySettingsClicked', () => {
    it('should track metric with source param when called', () => {
      mountWrapper({
        data: {
          data: {
            combined: [
              {
                type: 'pumpSettings',
                normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
                source: 'source1',
                id: 'id1',
              },
              {
                type: 'pumpSettings',
                normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
                source: 'source2',
                id: 'id2',
              },
            ],
          },
          timePrefs: { timezoneName: 'UTC' },
        },
      });
      const copySettingsButton = wrapper.find('.btn-copy-settings');
      copySettingsButton.simulate('click');
      sinon.assert.callCount(baseProps.trackMetric, 1);
      sinon.assert.calledWith(baseProps.trackMetric, 'Clicked Copy Settings', {
        source: 'Device Settings',
      });
    });
  });

  it('renders the chart when settings are selected', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: '2023-01-01T00:00:00Z',
              source: 'source1',
              id: 'id1',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    expect(wrapper.find('.pump-settings-container').length).to.equal(1);
  });

  it('hides device settings selection UI when no sources are available', () => {
    mountWrapper({
      data: {
        data: {
          combined: [],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const deviceSettingsSelection = wrapper.find('#device-settings-selection').hostNodes();
    expect(deviceSettingsSelection).to.have.lengthOf(0);
  });

  it('hides device settings selection UI when no settings are available', () => {
    mountWrapper({
      data: {
        data: {
          combined: [],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const deviceSettingsSelection = wrapper.find('#device-settings-selection').hostNodes();
    expect(deviceSettingsSelection).to.have.lengthOf(0);
  });

  it('calls trackMetric when device selection popover is opened', () => {
    mountWrapper();
    wrapper.find('button#device-selection').simulate('click');
    expect(props.trackMetric.calledWith('Settings - Device selection open')).to
      .be.true;
  });

  it('calls trackMetric when settings selection popover is opened', () => {
    mountWrapper();
    wrapper.find('button#settings-selection').simulate('click');
    expect(props.trackMetric.calledWith('Settings - Settings selection open'))
      .to.be.true;
  });

  it('calls trackMetric when device selection is applied', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source2',
              id: 'id2',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });

    wrapper.find('button#device-selection').simulate('click');
    wrapper
      .find('input#device-1')
      .simulate('change', { target: { value: 'source1', name: 'device' } });
    wrapper.find('button#apply-device-selection').simulate('click');
    expect(props.trackMetric.calledWith('Settings - Device selection apply')).to
      .be.true;
  });

  it('calls trackMetric when settings selection is applied', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-02-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id3',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source2',
              id: 'id2',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });

    wrapper.find('button#settings-selection').simulate('click');
    wrapper
      .find('input#settings-0')
      .simulate('change', { target: { value: 'id1', name: 'settings' } });
    wrapper.find('button#apply-settings-selection').simulate('click');
    expect(props.trackMetric.calledWith('Settings - Settings selection apply'))
      .to.be.true;
  });

  it('generates device selection options correctly with a single entry from a single source', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              deviceSerialNumber: '1234',
              id: 'id1',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const deviceRadioGroup = wrapper.find('RadioGroup#device');
    const radioOptions = deviceRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(1);
    expect(radioOptions.at(0).text()).to.equal('source1 (Serial #: 1234)');
  });

  it('generates device selection options correctly with multiple entries from a single source', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
              deviceSerialNumber: '1234',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id2',
              deviceSerialNumber: '1234',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const deviceRadioGroup = wrapper.find('RadioGroup#device');
    const radioOptions = deviceRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(1);
    expect(radioOptions.at(0).text()).to.equal('source1 (Serial #: 1234)');
  });

  it('generates device selection options correctly with multiple sources with multiple entries', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
              deviceSerialNumber: '1234',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
              source: 'source2',
              id: 'id2',
              deviceSerialNumber: '5678',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const deviceRadioGroup = wrapper.find('RadioGroup#device');
    const radioOptions = deviceRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(2);
    expect(radioOptions.at(0).text()).to.equal('source2 (Serial #: 5678)');
    expect(radioOptions.at(1).text()).to.equal('source1 (Serial #: 1234)');
  });

  it('omits device serial number from device selection options when not available', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const deviceRadioGroup = wrapper.find('RadioGroup#device');
    const radioOptions = deviceRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(1);
    expect(radioOptions.at(0).text()).to.equal('source1');
  });

  it('discards settings from "unspecified data source" when generating device selection options', () => {
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'Unspecified Data Source',
              id: 'id1',
              deviceSerialNumber: '1234',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    let deviceRadioGroup = wrapper.find('RadioGroup#device');
    let radioOptions = deviceRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(0);

    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'Unspecified Data Source',
              id: 'id1',
              deviceSerialNumber: '1234',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id2',
              deviceSerialNumber: '1234',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    deviceRadioGroup = wrapper.find('RadioGroup#device');
    radioOptions = deviceRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(1);
    expect(radioOptions.at(0).text()).to.equal('source1 (Serial #: 1234)');
  });

  it('generates settings selection options correctly with a single entry from a single source', () => {
    clock.jump(new Date('2023-01-02T00:00:00Z').getTime());
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const settingsRadioGroup = wrapper.find('RadioGroup#settings');
    const radioOptions = settingsRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(1);
    expect(radioOptions.at(0).text()).to.equal(
      'Jan 01, 2023 - Jan 02, 2023 : Active for 1 day'
    );
  });

  it('generates settings selection options correctly with multiple entries from a single source', () => {
    clock.jump(new Date('2023-01-03T00:00:00Z').getTime());
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id2',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const settingsRadioGroup = wrapper.find('RadioGroup#settings');
    const radioOptions = settingsRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(2);
    expect(radioOptions.at(0).text()).to.equal(
      'Jan 02, 2023 - Jan 03, 2023 : Active for 1 day'
    );
    expect(radioOptions.at(1).text()).to.equal(
      'Jan 01, 2023 - Jan 02, 2023 : Active for 1 day'
    );
  });

  it('generates settings selection options correctly with multiple sources with multiple entries', () => {
    clock.jump(new Date('2023-01-05T00:00:00Z').getTime());
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source2',
              id: 'id2',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-03T00:00:00Z').valueOf(),
              source: 'source2',
              id: 'id3',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const settingsRadioGroup = wrapper.find('RadioGroup#settings');
    const radioOptions = settingsRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(2);
    expect(radioOptions.at(0).text()).to.equal(
      'Jan 03, 2023 - Jan 05, 2023 : Active for 2 days'
    );
    expect(radioOptions.at(1).text()).to.equal(
      'Jan 01, 2023 - Jan 03, 2023 : Active for 2 days'
    );
  });

  it('formats duration correctly for very short periods in settings selection options', () => {
    clock.jump(new Date('2023-01-03T00:00:00Z').getTime());
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T20:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-02T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id2',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const settingsRadioGroup = wrapper.find('RadioGroup#settings');
    const radioOptions = settingsRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(2);
    expect(radioOptions.at(0).text()).to.equal(
      'Jan 02, 2023 - Jan 03, 2023 : Active for 1 day'
    );
    expect(radioOptions.at(1).text()).to.equal(
      'Jan 01, 2023 - Jan 02, 2023 : Active for <1 day'
    );
  });

  it('formats duration correctly for longer periods in settings selection options', () => {
    clock.jump(new Date('2023-03-01T00:00:00Z').getTime());
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2023-02-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id2',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2022-11-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id3',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const settingsRadioGroup = wrapper.find('RadioGroup#settings');
    const radioOptions = settingsRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(3);
    expect(radioOptions.at(0).text()).to.equal(
      'Feb 01, 2023 - Mar 01, 2023 : Active for 28 days'
    );
    expect(radioOptions.at(1).text()).to.equal(
      'Jan 01, 2023 - Feb 01, 2023 : Active for 31 days'
    );
    expect(radioOptions.at(2).text()).to.equal(
      'Nov 01, 2022 - Jan 01, 2023 : Active for >2 months'
    );
  });

  it('formats duration correctly for very long periods in settings selection options', () => {
    clock.jump(new Date('2024-03-01T00:00:00Z').getTime());
    mountWrapper({
      data: {
        data: {
          combined: [
            {
              type: 'pumpSettings',
              normalTime: moment('2023-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id1',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2024-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id2',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2021-06-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id3',
            },
            {
              type: 'pumpSettings',
              normalTime: moment('2018-01-01T00:00:00Z').valueOf(),
              source: 'source1',
              id: 'id4',
            },
          ],
        },
        timePrefs: { timezoneName: 'UTC' },
      },
    });
    wrapper.update();
    const settingsRadioGroup = wrapper.find('RadioGroup#settings');
    const radioOptions = settingsRadioGroup.find('Radio');
    expect(radioOptions).to.have.lengthOf(4);
    expect(radioOptions.at(0).text()).to.equal(
      'Jan 01, 2024 - Mar 01, 2024 : Active for >2 months'
    );
    expect(radioOptions.at(1).text()).to.equal(
      'Jan 01, 2023 - Jan 01, 2024 : Active for >12 months'
    );
    expect(radioOptions.at(2).text()).to.equal(
      'Jun 01, 2021 - Jan 01, 2023 : Active for >1 year'
    );
    expect(radioOptions.at(3).text()).to.equal(
      'Jan 01, 2018 - Jun 01, 2021 : Active for >3 years'
    );
  });

  describe('data connections', () => {
    let dataConnections;
    let dataConnectionsAddButton;
    let dataConnectionsCard;
    let dataConnectionsModal;
    let dataConnectionsWrapper;
    let wrapper;

    const api = {
      clinics: {
        getPatientFromClinic: sinon.stub(),
      }
    };

    const userPatient = {
      userid: '40',
      profile: {
        fullName: 'Fooey McBar'
      },
    };

    const clinicPatient = {
      id: '40',
      fullName: 'Fooey McBar',
    };

    const defaultProps = {
      currentPatientInViewId: '40',
      trackMetric: sinon.stub(),
    };

    const defaultWorkingState = {
      inProgress: false,
      completed: null,
      notification: null,
    };

    const defaultState = {
      blip: {
        working: {
          updatingClinicPatient: defaultWorkingState,
          sendingPatientDataProviderConnectRequest: defaultWorkingState,
        },
      },
    };

    const providerWrapper = store => props => {
      const { children } = props;

      return (
        <Provider store={store}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Provider>
      );
    };

    beforeEach(() => {
      dataConnections = () => wrapper.find('.data-connection').hostNodes();
      dataConnectionsAddButton = () => wrapper.find('#add-data-connections').hostNodes();
      dataConnectionsCard = () => wrapper.find('#data-connections-card');
      dataConnectionsModal = () => wrapper.find('Dialog#data-connections');
      dataConnectionsWrapper = () => wrapper.find('#data-connections').hostNodes();
      DataConnections.__Rewire__('api', api);
      DataConnectionsModal.__Rewire__('api', api);
    });

    afterEach(() => {
      DataConnections.__ResetDependency__('api');
      DataConnectionsModal.__ResetDependency__('api');
    });

    context('clinician user', () => {
      context('no active connections', () => {
        it('should show the data connections card and open the data connections modal when clicked', () => {
          const props = {
            ...defaultProps,
            patient: clinicPatient,
            isUserPatient: false,
          };

          const state = {
            blip: {
              ...defaultState.blip,
              selectedClinicId: 'clinic123',
            }
          };

          const store = mockStore(state);

          wrapper = mount(<Settings {...props} />, { wrappingComponent: providerWrapper(store) });

          expect(dataConnectionsModal().length).to.equal(0);
          expect(dataConnectionsCard().length).to.equal(1);
          expect(dataConnectionsCard().text()).to.include('Connect a Device Account');
          const callCount = props.trackMetric.callCount;
          dataConnectionsCard().simulate('click');

          sinon.assert.callCount(props.trackMetric, callCount + 1);
          sinon.assert.calledWith(props.trackMetric, 'Clicked Settings Add Data Connections', sinon.match({ source: 'card' }));
          expect(dataConnectionsModal().length).to.equal(1);
        });
      });

      context('active connections to some providers', () => {
        it('should show the data connections and open the data connections modal when Add button is clicked', () => {
          const props = {
            ...defaultProps,
            isUserPatient: false,
            clinicPatient: {
              userid: '40',
              dataSources: [
                { providerName: activeProviders[0], state: 'connected' }
              ],
            },
          };

          const state = {
            blip: {
              ...defaultState.blip,
              selectedClinicId: 'clinic123',
            }
          };

          const store = mockStore(state);

          wrapper = mount(<Settings {...props} />, { wrappingComponent: providerWrapper(store) });

          expect(dataConnectionsModal().length).to.equal(0);
          expect(dataConnectionsCard().length).to.equal(0);
          expect(dataConnectionsWrapper().length).to.equal(1);
          expect(dataConnectionsWrapper().find(`#data-connection-${activeProviders[0]}`).hostNodes().length).to.equal(1);
          const callCount = props.trackMetric.callCount;

          expect(dataConnectionsAddButton().length).to.equal(1);
          dataConnectionsAddButton().simulate('click');

          sinon.assert.callCount(props.trackMetric, callCount + 1);
          sinon.assert.calledWith(props.trackMetric, 'Clicked Settings Add Data Connections', sinon.match({ source: 'button' }));
          expect(dataConnectionsModal().length).to.equal(1);
        });
      });

      context('active connections to all providers', () => {
        it('should show the data connections and the "Add" button', () => {
          const props = {
            ...defaultProps,
            isUserPatient: false,
            clinicPatient: {
              ...clinicPatient,
              dataSources: _.map(activeProviders, providerName => ({ providerName, state: 'pending' })),
            },
          };

          const state = {
            blip: {
              ...defaultState.blip,
              selectedClinicId: 'clinic123',
            }
          };

          const store = mockStore(state);

          wrapper = mount(<Settings {...props} />, { wrappingComponent: providerWrapper(store) });


          // No modal, card, or add button
          expect(dataConnectionsModal().length).to.equal(0);
          expect(dataConnectionsCard().length).to.equal(0);
          expect(dataConnectionsAddButton().length).to.equal(1);
          expect(dataConnectionsWrapper().length).to.equal(1);

          // Data connections shown for each provider
          expect(dataConnections().length).to.equal(activeProviders.length);

          _.each(activeProviders, providerName => {
            expect(dataConnections().find(`#data-connection-${providerName}`).hostNodes().length).to.equal(1);
          });
        });
      });
    });

    context('patient user', () => {
      context('no active connections', () => {
        it('should show the data connections card and open the data connections modal when clicked', () => {
          const props = {
            ...defaultProps,
            patient: userPatient,
            isUserPatient: true,
          };

          const store = mockStore(defaultState);
          wrapper = mount(<Settings {...props} />, { wrappingComponent: providerWrapper(store) });

          expect(dataConnectionsModal().length).to.equal(0);
          expect(dataConnectionsCard().length).to.equal(1);
          expect(dataConnectionsCard().text()).to.include('Connect an Account');
          const callCount = props.trackMetric.callCount;
          dataConnectionsCard().simulate('click');

          sinon.assert.callCount(props.trackMetric, callCount + 1);
          sinon.assert.calledWith(props.trackMetric, 'Clicked Settings Add Data Connections', sinon.match({ source: 'card' }));
          expect(dataConnectionsModal().length).to.equal(1);
        });
      });

      context('active connections to some providers', () => {
        it('should show the data connections and open the data connections modal when Add button is clicked', () => {
          const props = {
            ...defaultProps,
            isUserPatient: true,
            patient: userPatient,
          };

          const state = {
            blip: {
              ...defaultState.blip,
              dataSources: [
                { providerName: activeProviders[0], state: 'connected' }
              ],
            }
          };

          const store = mockStore(state);
          wrapper = mount(<Settings {...props} />, { wrappingComponent: providerWrapper(store) });

          expect(dataConnectionsModal().length).to.equal(0);
          expect(dataConnectionsCard().length).to.equal(0);
          expect(dataConnectionsWrapper().length).to.equal(1);
          expect(dataConnectionsWrapper().find(`#data-connection-${activeProviders[0]}`).hostNodes().length).to.equal(1);
          const callCount = props.trackMetric.callCount;

          expect(dataConnectionsAddButton().length).to.equal(1);
          dataConnectionsAddButton().simulate('click');

          sinon.assert.callCount(props.trackMetric, callCount + 1);
          sinon.assert.calledWith(props.trackMetric, 'Clicked Settings Add Data Connections', sinon.match({ source: 'button' }));
          expect(dataConnectionsModal().length).to.equal(1);
        });
      });

      context('active connections to all providers', () => {
        it('should show the data connections and the "Add" button', () => {
          const props = {
            ...defaultProps,
            isUserPatient: true,
            patient: userPatient,
          };

          const state = {
            blip: {
              ...defaultState.blip,
              dataSources: _.map(activeProviders, providerName => ({ providerName, state: 'pending' })),
            }
          };

          const store = mockStore(state);
          wrapper = mount(<Settings {...props} />, { wrappingComponent: providerWrapper(store) });

          // No modal, card, or add button
          expect(dataConnectionsModal().length).to.equal(0);
          expect(dataConnectionsCard().length).to.equal(0);
          expect(dataConnectionsAddButton().length).to.equal(1);
          expect(dataConnectionsWrapper().length).to.equal(1);

          // Data connections shown for each provider
          expect(dataConnections().length).to.equal(activeProviders.length);

          _.each(activeProviders, providerName => {
            expect(dataConnections().find(`#data-connection-${providerName}`).hostNodes().length).to.equal(1);
          });
        });
      });
    });

    context('patient is not logged in user nor are they being viewed within a clinic context', () => {
      context('no active connections', () => {
        it('should not show the data connections card nor the data connections wrapper', () => {
          const props = {
            ...defaultProps,
            patient: userPatient,
            isUserPatient: false,
          };

          const state = {
            blip: {
              ...defaultState.blip,
              selectedClinicId: null,
            }
          };

          const store = mockStore(state);
          wrapper = mount(<Settings {...props} />, { wrappingComponent: providerWrapper(store) });

          expect(dataConnectionsCard().length).to.equal(0);
          expect(dataConnectionsWrapper().length).to.equal(0);
        });
      });
    });
  });
});
