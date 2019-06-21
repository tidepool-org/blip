/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global beforeEach */
/* global afterEach */
/* global context */
/* global after */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import mutationTracker from 'object-invariant-test-helper';
import _ from 'lodash';
import moment from 'moment';
import { mount, shallow } from 'enzyme';
import { components as vizComponents } from '@tidepool/viz';
import i18next from '../../../app/core/language';
import DataUtilStub from '../../helpers/DataUtil';

const { Loader } = vizComponents;

var assert = chai.assert;
var expect = chai.expect;

const t = i18next.t.bind(i18next);

// We must remember to require the base module when mocking dependencies,
// otherwise dependencies mocked will be bound to the wrong scope!
import PD, { PatientData, mapStateToProps } from '../../../app/pages/patientdata/patientdata.js';

describe('PatientData', function () {
  const defaultProps = {
    addPatientNote: sinon.stub(),
    clearPatientData: sinon.stub(),
    currentPatientInViewId: 'somestring',
    fetchers: [],
    fetchingPatient: false,
    fetchingPatientData: false,
    fetchingUser: false,
    generatePDFRequest: sinon.stub(),
    generatingPDF: false,
    isUserPatient: false,
    onCloseMessageThread: sinon.stub(),
    onCreateMessage: sinon.stub(),
    onEditMessage: sinon.stub(),
    onFetchMessageThread: sinon.stub(),
    onRefresh: sinon.stub(),
    onSaveComment: sinon.stub(),
    patientDataMap: {},
    patientNotesMap: {},
    pdf: {},
    queryParams: {},
    removeGeneratedPDFS: sinon.stub(),
    trackMetric: sinon.stub(),
    updateBasicsSettings: sinon.stub(),
    updatePatientNote: sinon.stub(),
    uploadUrl: 'http://foo.com',
    viz: {},
    t
  };

  const commonStats = {
    averageGlucose: 'averageGlucose',
    averageDailyDose: 'averageDailyDose',
    carbs: 'carbs',
    coefficientOfVariation: 'coefficientOfVariation',
    glucoseManagementIndicator: 'glucoseManagementIndicator',
    readingsInRange: 'readingsInRange',
    sensorUsage: 'sensorUsage',
    standardDev: 'standardDev',
    timeInAuto: 'timeInAuto',
    timeInRange: 'timeInRange',
    totalInsulin: 'totalInsulin',
  }

  const statFetchMethods = _.transform(commonStats, (result, value, key) => {
    result[value] = sinon.stub();
  }, {});


  before(() => {
    PD.__Rewire__('Basics', React.createClass({
      render: function() {
        return (<div className='fake-basics-view'></div>);
      }
    }));
    PD.__Rewire__('Trends', React.createClass({
      render: function() {
        return (<div className='fake-trends-view'></div>);
      }
    }));
    PD.__Rewire__('BgLog', React.createClass({
      render: function() {
        return (<div className='fake-bgLog-view'></div>);
      }
    }));
    PD.__Rewire__('vizUtils', {
      data: {
        selectDailyViewData: sinon.stub().returns('stubbed filtered daily data'),
        selectBgLogViewData: sinon.stub().returns('stubbed filtered bgLog data'),
        DataUtil: DataUtilStub,
      },
      stat: {
        commonStats,
        statFetchMethods,
        getStatDefinition: sinon.stub().callsFake((data, type) => `stubbed ${type} definition`),
      }
    });
  });

  after(() => {
    PD.__ResetDependency__('Basics');
    PD.__ResetDependency__('Trends');
    PD.__ResetDependency__('BgLog');
    PD.__ResetDependency__('vizUtils');
  });

  it('should be exposed as a module and be of type function', function() {
    expect(PatientData).to.be.a('function');
  });

  describe('render', function() {
    it('should not warn when required props are set', function() {
      var props = defaultProps;

      console.error = sinon.spy();
      var elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    describe('loading message', () => {
      let wrapper;
      let loader;

      beforeEach(() => {
        wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
        loader = () => wrapper.find(Loader);
      });

      it('should render the loading message and image with default default props set', function() {
        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.true;
      });

      it('should stop rendering the loading message and image when initialProcessing and missingPatientData are false', function() {
        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.true;

        // Set initialProcessing to false - should hide loader
        wrapper.setState({lastDatumProcessedIndex: 1});
        expect(loader().props().show).to.be.false;

        // Set initialProcessing back to true - should show loader
        wrapper.setState({lastDatumProcessedIndex: -1});
        expect(loader().props().show).to.be.true;

        // Set loadedPatientData to true - should hide loader
        wrapper.setProps({ patientDataMap: {
          [defaultProps.currentPatientInViewId]: ['some data'],
        }});
        expect(loader().props().show).to.be.false;

        // Set initialProcessing to false, so both are false - should hide loader
        wrapper.setState({lastDatumProcessedIndex: -1});
        expect(loader().props().show).to.be.false;
      });

      // this is THE REGRESSION TEST for the "data mismatch" bug
      it('should continue to render the loading message when data has been fetched for someone else but not for current patient', () => {
        var props = {
          currentPatientInViewId: 41,
          fetchingPatient: false,
          fetchingPatientData: true,
        };

        wrapper.setProps(props);

        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.true;

        wrapper.setProps({
          patientDataMap: {
            40: [{type: 'cbg'}],
          },
          patientNotesMap: {
            40: [],
          },
        });

        expect(loader().props().show).to.be.true;
      });

      it('should only render the initial loading view when the initial data is being fetched', () => {
        wrapper.setState({
          processingData: true,
          lastDatumProcessedIndex: -1,
        });

        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.true;

        wrapper.setState({
          processingData: false,
          lastDatumProcessedIndex: 100,
        });

        expect(loader().props().show).to.be.false;

        wrapper.setState({
          processingData: true,
          lastDatumProcessedIndex: 100,
        });

        // should not show even though processingData state is true, since we're not processing
        // the initial data set. After the initial processing, the loader will be rendered within
        // the individual chart containers, not the main view.
        expect(loader().props().show).to.be.false;
      });
    });

    describe('no data message', () => {
      let wrapper;
      let noData;

      beforeEach(() => {
        noData = () => wrapper.find('.patient-data-message-no-data');
      });

      describe('logged-in user is not current patient targeted for viewing', () => {
        it('should render the no data message when no data is present and loading and processingData are false', function() {
          var props = _.assign({}, defaultProps, {
            patient: {
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false
          });

          wrapper = mount(<PatientData {...props} />);

          wrapper.instance().getWrappedInstance().setState({
            loading: false,
            processingData: false,
          });

          wrapper.update();

          expect(noData().length).to.equal(1);
          expect(noData().text()).to.equal('Fooey McBar does not have any data yet.');
        });

        it('should render the no data message when no data is present for current patient', function() {
          var props = _.assign({}, defaultProps, {
            currentPatientInViewId: 40,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            patientDataMap: {
              40: [],
            },
            patientNotesMap: {
              40: [],
            },
          });

          wrapper = mount(<PatientData {...props} />);

          wrapper.instance().getWrappedInstance().setState({
            loading: false,
          });

          wrapper.update();

          expect(noData().length).to.equal(1);
          expect(noData().text()).to.equal('Fooey McBar does not have any data yet.');
        });
      });

      describe('logged-in user is viewing own data', () => {
        it('should render the no data message when no data is present and loading and processingData are false', function() {
          var props = {
            isUserPatient: true,
            fetchingPatient: false,
            fetchingPatientData: false
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.instance().getWrappedInstance().setState({
            loading: false,
          });

          wrapper.update();

          expect(noData().length).to.equal(1);
        });

        it('should render the no data message when no data is present for current patient', function() {
          var props = {
            currentPatientInViewId: 40,
            isUserPatient: true,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.instance().getWrappedInstance().setState({
            loading: false,
          });

          wrapper.update();

          expect(noData().length).to.equal(1);
        });

        it('should track click on main upload button', function() {
          var props = {
            currentPatientInViewId: 40,
            isUserPatient: true,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            trackMetric: sinon.stub(),
            patientDataMap: {
              40: [],
            },
            patientNotesMap: {
              40: [],
            },
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.instance().getWrappedInstance().setState({
            loading: false,
          });

          wrapper.update();

          expect(noData().length).to.equal(1);

          var links = wrapper.find('.patient-data-uploader-message a');
          var callCount = props.trackMetric.callCount;

          links.at(0).simulate('click');

          expect(props.trackMetric.callCount).to.equal(callCount + 1);
          expect(props.trackMetric.calledWith('Clicked No Data Upload')).to.be.true;
        });

        it('should track click on Blip Notes link', function() {
          var props = {
            currentPatientInViewId: 40,
            isUserPatient: true,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            trackMetric: sinon.stub()
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.instance().getWrappedInstance().setState({
            loading: false,
          });

          wrapper.update();

          var links = wrapper.find('.patient-data-uploader-message a');
          var callCount = props.trackMetric.callCount;

          links.at(3).simulate('click');

          expect(props.trackMetric.callCount).to.equal(callCount + 1);
          expect(props.trackMetric.calledWith('Clicked No Data Get Blip Notes')).to.be.true;
        });
      });
    });

    describe('default view based on lastest data upload', () => {
      let elem;
      let kickOffProcessing;

      const time = '2017-06-08T14:16:12.000Z';

      const uploads = [
        {
          deviceId: 'pump',
          deviceTags: ['insulin-pump'],
        },
        {
          deviceId: 'cgm',
          deviceTags: ['cgm'],
        },
        {
          deviceId: 'bgm',
          deviceTags: ['bgm'],
        },
        {
          deviceId: 'pump-cgm',
          deviceTags: ['insulin-pump', 'cgm'],
        },
      ];

      const props = _.assign({}, defaultProps, {
        currentPatientInViewId: '40',
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar',
          },
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        trackMetric: sinon.stub(),
        viz: {
          trends: {},
          pdf: {},
        },
      });

      beforeEach(() => {
        elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
        sinon.spy(elem, 'deriveChartTypeFromLatestData');

        elem.dataUtil = new DataUtilStub();

        kickOffProcessing = (data, includeUploads = true) => {
          let processedData;

          // bypass the actual processing function since that's not what we're testing here!
          elem.processData = () => {
            let diabetesData = _.map(data, datum => {
              datum.time = time;
              return datum;
            });

            if(includeUploads){
              processedData = {
                grouped: {
                  upload: uploads,
                },
                diabetesData,
              }
            } else {
              processedData = {
                diabetesData,
              }
            }

            elem.setState({
              processedPatientData: { data: diabetesData },
              processingData: false,
              loading: false,
            });

            elem.setInitialChartType(processedData);
          };

          elem.componentWillReceiveProps({
            patient: _.assign({}, props.patient, {
              settings: {},
            }),
            patientDataMap: {
              40: []
            },
          });
        };
      });

      it('should set `dataUtil._chartPrefs` to the prefs for the initial `chartType` state', () => {
        const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
        const instance = wrapper.instance();

        const processedData = {
          grouped: {
            upload: ['foo'],
          },
          diabetesData: ['bar'] ,
        };

        const chartPrefs = { basics: 'basics prefs' };

        wrapper.setState({ chartPrefs })
        instance.dataUtil = new DataUtilStub();

        instance.setInitialChartType(processedData);
        expect(instance.dataUtil._chartPrefs).to.equal('basics prefs');
      });

      context('setting default view based on device type of last upload', () => {
        it('should set the default view to <Basics /> when latest data is from a pump', () => {
          const data = [{
            type: 'bolus',
            deviceId: 'pump',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Trends /> with CGM selected when latest data is from a cgm', () => {
          const data = [{
            type: 'cbg',
            deviceId: 'cgm',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-trends-view');
          expect(elem.state.chartPrefs.trends.showingCbg).to.be.true;
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to trends');
        });

        it('should set the default view to <BgLog /> when latest data is from a bgm', () => {
          const data = [{
            type: 'smbg',
            deviceId: 'bgm',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-bgLog-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to weekly');
        });

        it('should set the default view to <BgLog /> when latest data type is cbg but came from a pump', () => {
          const data = [{
            type: 'cbg',
            deviceId: 'pump-cgm',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });
      });

      context('unable to determine device, falling back to data.type', () => {
        it('should set the default view to <Basics /> when type is bolus', () => {
          const data = [{
            type: 'bolus',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is basal', () => {
          const data = [{
            type: 'basal',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is wizard', () => {
          const data = [{
            type: 'wizard',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Trends /> when type is cbg', () => {
          const data = [{
            type: 'cbg',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-trends-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to trends');
        });

        it('should set the default view to <BgLog /> when type is smbg', () => {
          const data = [{
            type: 'smbg',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-bgLog-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to weekly');
        });
      });

      context('with no upload records, falling back to data.type', () => {
        it('should set the default view to <Basics /> when type is bolus', () => {
          const data = [{
            type: 'bolus',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data, false);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is basal', () => {
          const data = [{
            type: 'basal',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data, false);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is wizard', () => {
          const data = [{
            type: 'wizard',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data, false);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Trends /> when type is cbg', () => {
          const data = [{
            type: 'cbg',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data, false);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-trends-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to trends');
        });

        it('should set the default view to <BgLog /> when type is smbg', () => {
          const data = [{
            type: 'smbg',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data, false);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-bgLog-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to weekly');
        });
      });
    });

    describe('render data (finally!)', () => {
      describe('logged-in user is not current patient targeted for viewing', () => {
        it ('should render the correct view when data is present for current patient', function() {
          var props = _.assign({}, defaultProps, {
            currentPatientInViewId: 40,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            viz: {
              trends: {},
              pdf: {},
            },
          });

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props}/>), PatientData.WrappedComponent);
          elem.dataUtil = new DataUtilStub();

          // Setting data.type to 'cbg' should result in <Trends /> view rendering
          const data = [{ type: 'cbg' }];

          // bypass the actual processing function since that's not what we're testing here!
          elem.processData = () => {
            elem.setState({
              processedPatientData: { data },
              processingData: false,
              loading: false,
              chartType: elem.deriveChartTypeFromLatestData(data[0], []),
            });
          }
          elem.componentWillReceiveProps({
            patient: _.assign({}, props.patient, {
              settings: {},
            }),
            patientDataMap: {
              40: [],
            },
            patientNotesMap: {
              40: [],
            },
          });

          var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-trends-view');
          expect(x).to.be.ok;
        });
      });

      describe('logged-in user is viewing own data', () => {
        it ('should render the correct view when data is present for current patient', function() {
          var props = _.assign({}, defaultProps, {
            currentPatientInViewId: 40,
            isUserPatient: true,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            viz: {
              pdf: {},
            }
          });

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props}/>), PatientData.WrappedComponent);
          elem.dataUtil = new DataUtilStub();

          // Setting data.type to 'basal' should result in <Basics /> view rendering
          const data = [{ type: 'basal' }];

          // bypass the actual processing function since that's not what we're testing here!
          elem.processData = () => {
            elem.setState({
              processedPatientData: { data },
              processingData: false,
              loading: false,
              chartType: elem.deriveChartTypeFromLatestData(data[0]),
            });
          }
          elem.componentWillReceiveProps({
            patient: _.assign({}, props.patient, {
              settings: {},
            }),
            patientDataMap: {
              40: []
            },
            patientNotesMap: {
              40: []
            }
          });

          var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
          expect(x).to.be.ok;
        });
      });
    });
  });

  describe('getInitialState', () => {
    it('should return the default `chartPrefs` state for each data view', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      expect(wrapper.state().chartPrefs).to.eql({
        basics: {},
        daily: {},
        trends: {
          activeDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
          activeDomain: '2 weeks',
          extentSize: 14,
          showingCbg: true,
          showingSmbg: false,
          smbgGrouped: false,
          smbgLines: false,
          smbgRangeOverlay: true,
        },
        bgLog: {
          bgSource: 'smbg',
        },
      });
    });
  });

  describe('handleRefresh', function() {
    const props = {
      onRefresh: sinon.stub(),
      clearPatientData: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
    };

    it('should clear patient data upon refresh', function() {
      const elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      const callCount = props.clearPatientData.callCount;
      elem.handleRefresh();

      expect(props.clearPatientData.callCount).to.equal(callCount + 1);
    });

    it('should clear generated pdfs upon refresh', function() {
      const elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      const callCount = props.removeGeneratedPDFS.callCount;
      elem.handleRefresh();
      expect(props.removeGeneratedPDFS.callCount).to.equal(callCount + 1);
    });

    it('should reset patient data processing state', function() {
      const setStateSpy = sinon.spy(PatientData.WrappedComponent.prototype, 'setState');
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.DEFAULT_TITLE = 'defaultTitle';

      wrapper.setState({
        initialDatetimeLocation: 'initialDate',
      })

      setStateSpy.resetHistory();
      sinon.assert.callCount(setStateSpy, 0);
      instance.handleRefresh();
      sinon.assert.calledWithMatch(setStateSpy, {
        endpoints: [],
        datetimeLocation: 'initialDate',
        fetchEarlierDataCount: 0,
        lastDatumProcessedIndex: -1,
        lastProcessedDateTarget: null,
        loading: true,
        processEarlierDataCount: 0,
        processedPatientData: null,
        title: 'defaultTitle'
      });

      PatientData.WrappedComponent.prototype.setState.restore();
    });
  });

  describe('updateBasicsData', () => {
    it('should update the basicsdata portion of the processedPatientData state object', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({
        processedPatientData: {
          basicsData: 'old basicsData',
          otherData: 'old otherData',
        },
      });

      instance.updateBasicsData('new basicsData');

      expect(instance.state.processedPatientData.basicsData).to.equal('new basicsData');
    });

    it('should not attempt to update the state object, if processedPatientData state is not present', () => {
      const assignSpy = sinon.spy(_, 'assign');

      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({
        processedPatientData: undefined,
      });

      instance.updateBasicsData('new basicsData');

      sinon.assert.notCalled(assignSpy)

      _.assign.restore();
    });

    it('should update the processedPatientData state object, and not replace it with a new instance', () => {
      const assignSpy = sinon.spy(_, 'assign');

      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({
        processedPatientData: {
          basicsData: 'old basicsData',
          otherData: 'old otherData',
        },
      });

      instance.updateBasicsData('new basicsData');

      sinon.assert.calledWithExactly(
        assignSpy,
        instance.state.processedPatientData,
        { basicsData: 'new basicsData' }
      );

      _.assign.restore();
    });
  });

  describe('updateBasicsSettings', () => {
    beforeEach(() => {
      defaultProps.updateBasicsSettings.reset();
      defaultProps.removeGeneratedPDFS.reset();
    })

    it('should call `updateBasicsSettings` from props, but only if `canUpdateSettings` arg is true', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      const settings = { siteChangeSource: 'prime' };

      let canUpdateSettings = false;
      instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);
      sinon.assert.notCalled(defaultProps.updateBasicsSettings);

      canUpdateSettings = true;
      instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);
      sinon.assert.calledOnce(defaultProps.updateBasicsSettings);
      sinon.assert.calledWith(defaultProps.updateBasicsSettings, defaultProps.currentPatientInViewId, settings);
    });

    it('should set the `updatedSiteChangeSource` to state if `siteChangeSource` differs from user settings', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      expect(wrapper.state('updatedSiteChangeSource')).to.be.undefined;

      const settings = { siteChangeSource: 'prime' };

      let canUpdateSettings = false;
      instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);
      expect(wrapper.state('updatedSiteChangeSource')).to.equal('prime');
    });

    it('should not set the `updatedSiteChangeSource` to state if `siteChangeSource` is unchanged from user settings', () => {
      const setStateSpy = sinon.spy(PatientData.WrappedComponent.prototype, 'setState');

      const settingsProps = _.assign({}, defaultProps, {
        patient: _.assign({}, defaultProps.patient, {
          settings: {
            siteChangeSource: 'cannula',
          },
        }),
      });

      const wrapper = shallow(<PatientData.WrappedComponent {...settingsProps} />);
      const instance = wrapper.instance();

      setStateSpy.resetHistory();
      sinon.assert.callCount(setStateSpy, 0);

      expect(instance.props.patient.settings.siteChangeSource).to.equal('cannula');

      const settings = { siteChangeSource: 'cannula' };

      let canUpdateSettings = false;
      instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);
      sinon.assert.notCalled(setStateSpy);
      PatientData.WrappedComponent.prototype.setState.restore();
    });

    it('should callback with `props.removeGeneratedPDFS` if `siteChangeSource` is changed from user settings', () => {
      const setStateSpy = sinon.spy(PatientData.WrappedComponent.prototype, 'setState');

      const settingsProps = _.assign({}, defaultProps, {
        patient: _.assign({}, defaultProps.patient, {
          settings: {
            siteChangeSource: 'cannula',
          },
        }),
      });

      const wrapper = shallow(<PatientData.WrappedComponent {...settingsProps} />);
      const instance = wrapper.instance();

      setStateSpy.resetHistory();
      sinon.assert.callCount(setStateSpy, 0);

      expect(instance.props.patient.settings.siteChangeSource).to.equal('cannula');

      const settings = { siteChangeSource: 'prime' };

      let canUpdateSettings = false;
      instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);

      sinon.assert.calledOnce(setStateSpy);
      sinon.assert.calledWith(setStateSpy, {
        updatedSiteChangeSource: settings.siteChangeSource
      }, defaultProps.removeGeneratedPDFS);

      PatientData.WrappedComponent.prototype.setState.restore();
    });

    describe('pdf removal', () => {
      it('should remove the generated PDF when the patient\'s site change source changes', function() {
        const settingsProps = _.assign({}, defaultProps, {
          patient: _.assign({}, defaultProps.patient, {
            settings: {
              siteChangeSource: 'cannula',
            },
          }),
        });

        const wrapper = shallow(<PatientData.WrappedComponent {...settingsProps} />);
        const instance = wrapper.instance();

        sinon.assert.callCount(defaultProps.removeGeneratedPDFS, 0);

        const settings = { siteChangeSource: 'prime' };

        let canUpdateSettings = false;
        instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);
        expect(wrapper.state('updatedSiteChangeSource')).to.equal('prime');

        sinon.assert.callCount(defaultProps.removeGeneratedPDFS, 1);
      });

      it('should not remove the generated PDF when the patient\'s site change source did not change', function() {
        const settingsProps = _.assign({}, defaultProps, {
          patient: _.assign({}, defaultProps.patient, {
            settings: {
              siteChangeSource: 'prime',
            },
          }),
        });

        const wrapper = shallow(<PatientData.WrappedComponent {...settingsProps} />);
        const instance = wrapper.instance();

        sinon.assert.callCount(defaultProps.removeGeneratedPDFS, 0);

        const settings = { siteChangeSource: 'prime' };

        let canUpdateSettings = false;
        instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);

        sinon.assert.callCount(defaultProps.removeGeneratedPDFS, 0);
      });
    });
  });

  describe('updateDatetimeLocation', () => {
    it('should update the chartDateRange state', () => {
      const setStateSpy = sinon.spy(PatientData.WrappedComponent.prototype, 'setState');
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      setStateSpy.resetHistory();
      sinon.assert.callCount(setStateSpy, 0);

      instance.updateDatetimeLocation('new datetime');

      sinon.assert.calledWith(setStateSpy, {
        datetimeLocation: 'new datetime',
      });

      PatientData.WrappedComponent.prototype.setState.restore();
    });
  });

  describe('updateChartEndpoints', () => {
    it('should update the chartDateRange state', () => {
      const setStateSpy = sinon.spy(PatientData.WrappedComponent.prototype, 'setState');
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      setStateSpy.resetHistory();
      sinon.assert.callCount(setStateSpy, 0);

      instance.updateChartEndpoints('new date range');

      sinon.assert.calledWith(setStateSpy, {
        endpoints: 'new date range',
      });

      PatientData.WrappedComponent.prototype.setState.restore();
    });
  });

  describe('componentWillUnmount', function() {
    const props = {
      clearPatientData: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
    };

    it('should clear generated pdfs upon refresh', function() {
    const elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      const callCount = props.removeGeneratedPDFS.callCount;
      elem.componentWillUnmount();
      expect(props.removeGeneratedPDFS.callCount).to.equal(callCount + 1);
    });
  });

  describe('componentWillReceiveProps', function() {
    const props = {
      clearPatientData: sinon.stub(),
    };

    describe('data processing and fetching', () => {
      let wrapper;
      let instance;
      let initialProps;
      let processDataStub;
      let fetchEarlierDataStub;
      let shouldProcessProps;

      beforeEach(() => {
        initialProps = _.assign({}, defaultProps, {
          patient: {
            userid: 40,
            profile: {
              fullName: 'Fooey McBar'
            },
            settings: {
              siteChangeSource: 'cannulaPrime',
            },
          },
          currentPatientInViewId: 40,
          patientDataMap: {
            40: [
              { time: '2018-02-02T00:00:00.000Z' },
            ]
          },
        });

        shouldProcessProps = _.assign({}, initialProps, {
          fetchedPatientDataRange: {
            fetchedUntil: '2018-02-01T00:00:00.000Z',
            start: '2018-02-01T00:00:00.000Z',
            count: 1,
          },
        });

        wrapper = shallow(<PatientData.WrappedComponent {...initialProps} />);
        instance = wrapper.instance();
        processDataStub = sinon.stub(instance, 'processData');
        fetchEarlierDataStub = sinon.stub(instance, 'fetchEarlierData');
      });

      afterEach(() => {
        processDataStub.reset();
        fetchEarlierDataStub.reset();
      });

      after(() => {
        processDataStub.restore();
        fetchEarlierDataStub.restore();
      });

      context('patient settings have been fetched, initial patient data has been received', () => {
        it('should kick off data processing', () => {
          sinon.assert.notCalled(processDataStub);
          wrapper.setProps(shouldProcessProps);

          assert.equal(instance.state.lastDatumProcessedIndex, -1);
          sinon.assert.calledOnce(processDataStub);
          sinon.assert.calledWithExactly(processDataStub, shouldProcessProps);
        });
      });

      context('patient settings have been fetched, initial data processed, new patient data has been received', () => {
        it('should kick off processing of the new data', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0,
          });

          wrapper.setProps(shouldProcessProps); // kicks off the initial processing
          sinon.assert.calledOnce(processDataStub);

          const newDataProps = _.assign({}, shouldProcessProps, {
            fetchedPatientDataRange: {
              start: '2018-01-01T00:00:00.000Z',
              count: 2,
            },
          });
          wrapper.setProps(newDataProps);

          assert.equal(instance.props.fetchedPatientDataRange.count, 2);
          sinon.assert.calledTwice(processDataStub);
        });
      });

      context('patient settings have been fetched, initial data processed, but no new patient data has been received', () => {
        it('should NOT kick off data processing', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0,
          });

          wrapper.setProps(shouldProcessProps); // kicks off the initial processing
          sinon.assert.calledOnce(processDataStub);

          const newDataProps = _.assign({}, shouldProcessProps, {
            fetchedPatientDataRange: {
              start: '2018-01-01T00:00:00.000Z',
              count: 1, // same as initial fetched data count
            },
          });
          wrapper.setProps(newDataProps);

          assert.equal(instance.props.fetchedPatientDataRange.count, 1);
          sinon.assert.calledOnce(processDataStub); // still just one call made
        });

        it('should try to fetch some earlier data, but only once', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0,
          });

          wrapper.setProps(shouldProcessProps);
          sinon.assert.calledOnce(processDataStub);
          sinon.assert.notCalled(fetchEarlierDataStub);

          const newDataProps = _.assign({}, shouldProcessProps, {
            fetchedPatientDataRange: {
              fetchedUntil:'2018-01-01T00:00:00.000Z',
              start: '2018-01-01T00:00:00.000Z',
              count: 1, // same as initial fetched data count
            },
          });
          wrapper.setProps(newDataProps);

          sinon.assert.calledOnce(fetchEarlierDataStub);
          sinon.assert.calledWithExactly(fetchEarlierDataStub, { startDate: null });

          // calling fetchEarlierData with a null startDate will set the
          // 'fetchedPatientDataRange.fetchedUntil' prop to 'start', so we'll stub it here
          const fetchedFromStartDataProps = _.assign({}, newDataProps, {
            fetchedPatientDataRange: {
              fetchedUntil: 'start',
              start: '2018-01-01T00:00:00.000Z',
              count: 1, // same as initial fetched data count
            },
          });

          sinon.assert.calledOnce(fetchEarlierDataStub); // did not fetch a second time
        });
      });

      context('patient settings have not been fetched, no patient data has been received', () => {
        it('should not kick off processing or fetching', () => {
          wrapper.setProps(_.assign({}, shouldProcessProps, {
            patient: null,
          }));
          sinon.assert.notCalled(processDataStub);
          sinon.assert.notCalled(fetchEarlierDataStub);
        });
      });

      context('patient settings have not been fetched, patient data has been received', () => {
        it('should not kick off processing or fetching', () => {
          wrapper.setProps(_.assign({}, shouldProcessProps, {
            patient: null,
            fetchedPatientDataRange: {
              fetchedUntil: 'start',
              start: '2018-01-01T00:00:00.000Z',
              count: 2, // additional data recieved
            },
          }));

          sinon.assert.notCalled(processDataStub);
          sinon.assert.notCalled(fetchEarlierDataStub);
        });
      });

      context('patient settings have been fetched, patient data has not been received', () => {
        it('should not kick off processing or fetching', () => {
          wrapper.setProps(_.assign({}, shouldProcessProps, {
            patientDataMap: {},
          }));

          sinon.assert.notCalled(processDataStub);
          sinon.assert.notCalled(fetchEarlierDataStub);
        });
      });
    });
  });

  describe('componentWillUpdate', function() {
    it('should generate a pdf when view is basics and patient data is processed', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
      };

      const processedPatientData = {
        diabetesData: ['stub'],
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      wrapper.instance().getWrappedInstance().setState({ chartType: 'basics', processingData: false, processedPatientData });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.instance().forceUpdate();
      expect(elem.generatePDF.callCount).to.equal(1);
    });

    it('should generate a pdf when view is daily and patient data is processed', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
      };

      const processedPatientData = {
        diabetesData: ['stub'],
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      wrapper.instance().getWrappedInstance().setState({ chartType: 'daily', processingData: false, processedPatientData });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.instance().forceUpdate();
      expect(elem.generatePDF.callCount).to.equal(1);
    });

    it('should generate a pdf when view is bgLog and patient data is processed', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
      };

      const processedPatientData = {
        diabetesData: ['stub'],
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      wrapper.instance().getWrappedInstance().setState({ chartType: 'bgLog', processingData: false, processedPatientData });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.instance().forceUpdate();
      expect(elem.generatePDF.callCount).to.equal(1);
    });

    it('should generate a pdf when view is settings and patient data is processed', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
      };

      const processedPatientData = {
        diabetesData: ['stub'],
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      wrapper.instance().getWrappedInstance().setState({ chartType: 'settings', processingData: false, processedPatientData });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.instance().forceUpdate();
      expect(elem.generatePDF.callCount).to.equal(1);
    });

    it('should generate a pdf when view is trends and patient data is processed', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
      };

      const processedPatientData = {
        diabetesData: ['stub'],
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      wrapper.instance().getWrappedInstance().setState({ chartType: 'trends', processingData: false, processedPatientData });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.instance().forceUpdate();
      expect(elem.generatePDF.callCount).to.equal(1);
    });

    it('should not generate a pdf when one is currently generating', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: true,
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      wrapper.instance().getWrappedInstance().setState({ chartType: 'daily', processingData: false, processedPatientData: true });
      wrapper.update();

      expect(elem.generatePDF.callCount).to.equal(0);
    });

    it('should not generate a pdf when patient data is not yet processed', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      var callCount = elem.generatePDF.callCount;

      wrapper.instance().getWrappedInstance().setState({ chartType: 'daily', processingData: false, processedPatientData: false });
      wrapper.update();

      expect(elem.generatePDF.callCount).to.equal(0);
    });

    it('should not generate a pdf when patient data exists, but new patient data is processing', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      var callCount = elem.generatePDF.callCount;

      wrapper.instance().getWrappedInstance().setState({ chartType: 'daily', processingData: true, processedPatientData: true });
      wrapper.update();

      expect(elem.generatePDF.callCount).to.equal(0);
    });

    it('should not generate a pdf when one already exists for the current view', function () {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        generatingPDF: false,
        pdf: {
          combined: {
            url: 'someUrl'
          }
        }
      };

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance().getWrappedInstance();
      sinon.stub(elem, 'generatePDF');

      var callCount = elem.generatePDF.callCount;

      wrapper.instance().getWrappedInstance().setState({ chartType: 'daily', processingData: false, processedPatientData: true });
      wrapper.update();

      expect(elem.generatePDF.callCount).to.equal(0);
    });
  });

  describe('generatePDFStats', () => {
    let wrapper;
    let instance;
    let data;

    beforeEach(() => {
      data = {
        basics: {},
        daily: {},
        bgLog: {},
      },

      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();
    });

    it('should add basics stats to the provided data object if a `dateRange` property exists', () => {
      instance.generatePDFStats(data, instance.state);
      expect(data.basics.stats).to.be.undefined;

      data.basics.dateRange = ['2019-01-01T00:00:00.000Z', '2019-02-01T00:00:00.000Z'];
      instance.generatePDFStats(data, instance.state);
      expect(data.basics.stats).to.be.an('object').and.have.keys([
        'timeInRange',
        'readingsInRange',
        'totalInsulin',
        'timeInAuto',
        'carbs',
        'averageDailyDose',
      ]);
    });

    it('should add daily stats to the provided data object if the `dataByDate` object map is not empty', () => {
      data.daily.dataByDate = {};
      instance.generatePDFStats(data, instance.state);
      expect(data.daily.dataByDate).to.be.eql({});

      data.daily.dataByDate['2019-01-01'] = { bounds: [12345678, 23456789] };
      instance.generatePDFStats(data, instance.state);
      expect(data.daily.dataByDate['2019-01-01'].stats).to.be.an('object').and.have.keys([
        'timeInRange',
        'averageGlucose',
        'totalInsulin',
        'timeInAuto',
        'carbs',
      ]);
    });

    it('should add bgLog stats to the provided data object if a `dateRange` property exists', () => {
      instance.generatePDFStats(data, instance.state);
      expect(data.bgLog.stats).to.be.undefined;

      data.bgLog.dateRange = ['2019-01-01T00:00:00.000Z', '2019-02-01T00:00:00.000Z'];
      instance.generatePDFStats(data, instance.state);
      expect(data.bgLog.stats).to.be.an('object').and.have.keys([
        'averageGlucose',
      ]);
    });
  });

  describe('generatePDF', () => {
    it('should filter the daily and bgLog view data before dispatching the generate pdf action', () => {
      const dailyFilterStub = PD.__get__('vizUtils').data.selectDailyViewData;
      const bgLogFilterStub = PD.__get__('vizUtils').data.selectBgLogViewData;
      const pickSpy = sinon.spy(_, 'pick');

      const props = _.assign({}, defaultProps, {
        generatePDFRequest: sinon.stub(),
      });

      const state = {
        processedPatientData: {
          diabetesData: [{
            normalTime: '2018-02-02T00:00:00.000Z',
          }],
          grouped: {
            pumpSettings: {},
          },
        },
        printOpts: {
          numDays: {
            daily: 6,
          },
        },
      };

      const wrapper = shallow(<PatientData.WrappedComponent {...props} />);
      const instance = wrapper.instance();

      sinon.assert.callCount(dailyFilterStub, 0);
      sinon.assert.callCount(bgLogFilterStub, 0);
      sinon.assert.callCount(props.generatePDFRequest, 0);

      instance.generatePDFStats = sinon.stub().returns({});
      instance.generatePDF(props, state);

      sinon.assert.callCount(dailyFilterStub, 1);
      sinon.assert.callCount(bgLogFilterStub, 1);
      sinon.assert.callCount(props.generatePDFRequest, 1);

      sinon.assert.callCount(pickSpy, 2);
      assert(dailyFilterStub.calledBefore(bgLogFilterStub));
      expect(pickSpy.firstCall.lastArg).to.have.members(['basal', 'bolus', 'cbg', 'food', 'message', 'smbg', 'upload']);
      expect(pickSpy.secondCall.lastArg).to.have.members(['smbg']);

      assert(dailyFilterStub.calledBefore(props.generatePDFRequest));
      sinon.assert.calledWithMatch(props.generatePDFRequest,
        'combined',
        {
          daily: 'stubbed filtered daily data',
          bgLog: 'stubbed filtered bgLog data',
        },
      );

      pickSpy.restore();
    });

    it('should add stats to the pdf data object by passing it to `generatePDFStats`', () => {
      const props = _.assign({}, defaultProps, {
        generatePDFRequest: sinon.stub(),
      });

      const state = {
        processedPatientData: {
          diabetesData: [{
            normalTime: '2018-02-02T00:00:00.000Z',
          }],
          grouped: {
            pumpSettings: {},
          },
        },
        printOpts: {
          numDays: {
            daily: 6,
          },
        },
      };

      const wrapper = shallow(<PatientData.WrappedComponent {...props} />);
      const instance = wrapper.instance();

      sinon.assert.callCount(props.generatePDFRequest, 0);


      instance.generatePDFStats = sinon.stub().callsFake((data) => {
        data.basics = { stats: 'stubbed basics stats' };
        return data;
      });

      instance.generatePDF(props, state);

      sinon.assert.callCount(props.generatePDFRequest, 1);
      sinon.assert.callCount(instance.generatePDFStats, 1);

      sinon.assert.calledWithMatch(props.generatePDFRequest,
        'combined',
        {
          daily: 'stubbed filtered daily data',
          bgLog: 'stubbed filtered bgLog data',
          basics: { stats: 'stubbed basics stats' },
        },
      );
    });
  });

  describe('subtractTimezoneOffset', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should apply a timezone offset to a provided datetime using `timePrefs` from state', () => {
      wrapper.setState({
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Eastern',
        },
      });

      const datetime = '2018-02-02T00:00:00.000Z';

      const result = instance.subtractTimezoneOffset(datetime);
      expect(result).to.equal(moment(datetime).add(5, 'hours').toISOString()); // +5hr offset for US/Eastern
    });

    it('should apply a timezone offset to a provided datetime using provided `timePrefs` arg', () => {
      wrapper.setState({
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Eastern',
        },
      });

      const timePrefsOverride = {
        timezoneAware: true,
        timezoneName: 'US/Pacific',
      }

      const datetime = '2018-02-02T00:00:00.000Z';

      const result = instance.subtractTimezoneOffset(datetime, timePrefsOverride);
      expect(result).to.equal(moment(datetime).add(8, 'hours').toISOString()); // +8hr offset for US/Pacific
    });

    it('should return an unmodified datetime when `datetime` arg is not a moment-valid value', () => {
      wrapper.setState({
        timePrefs: {
          timezoneAware: true,
          timezoneName: 'US/Eastern',
        },
      });

      const datetime = 'hello';

      const result = instance.subtractTimezoneOffset(datetime);
      expect(result).to.equal(datetime);
    });

    it('should return an unmodified datetime when `timezoneSettings.timezoneAware` arg is not truthy', () => {
      wrapper.setState({
        timePrefs: {
          timezoneAware: null,
          timezoneName: 'US/Eastern',
        },
      });

      const datetime = '2018-02-02T00:00:00.000Z';

      const result = instance.subtractTimezoneOffset(datetime);
      expect(result).to.equal(datetime);
    });
  });

  describe('handleChartDateRangeUpdate', () => {
    let wrapper;
    let instance;
    let updateChartDateRangeSpy;
    let fetchEarlierDataSpy;
    let processDataSpy;
    let setChartType;
    let setToShouldProcess;
    let setToShouldFetch;
    const dateRange = ['2018-01-02T00:00:00.000Z', '2018-03-02T00:00:00.000Z'];

    beforeEach(() => {
      setChartType = (chartType) => {
        wrapper.setState({
          chartType,
        });
      };

      setToShouldFetch = () => {
        wrapper.setProps({
          fetchedPatientDataRange: {
            start: '2018-02-03T00:00:00.000Z',
          },
        });
      };

      setToShouldProcess = () => {
        wrapper.setProps({
          fetchedPatientDataRange: {
            start: '2018-01-01T00:00:00.000Z',
          },
        });
        wrapper.setState({
          lastProcessedDateTarget: '2018-01-06T00:00:00.000Z',
        });
      };

      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);

      wrapper.setProps({
        fetchingPatientData: false,
        currentPatientInViewId: 40,
        patientDataMap: {
          40: [
            { time: '2018-01-02T00:00:00.000Z' },
          ]
        },
        fetchedPatientDataRange: {
          start: '2018-01-01T00:00:00.000Z',
        },
      });

      wrapper.setState({
        chartType: 'trends',
        processingData: false,
      });

      instance = wrapper.instance();

      updateChartDateRangeSpy = sinon.spy(instance, 'updateChartEndpoints');
      fetchEarlierDataSpy = sinon.stub(instance, 'fetchEarlierData');
      processDataSpy = sinon.stub(instance, 'processData');
    });

    afterEach(() => {
      updateChartDateRangeSpy.resetHistory();
      fetchEarlierDataSpy.resetHistory();
      processDataSpy.resetHistory();
    });

    after(() => {
      updateChartDateRangeSpy.restore();
      fetchEarlierDataSpy.restore();
      processDataSpy.restore();
    });

    it('should update the chart date range state', () => {
      sinon.assert.callCount(instance.updateChartEndpoints, 0);

      instance.handleChartDateRangeUpdate(dateRange);

      sinon.assert.callCount(instance.updateChartEndpoints, 1);
      sinon.assert.calledWith(instance.updateChartEndpoints, dateRange);
    });

    it('should not trigger data processing or fetching if data is currently fetching or processing (or both)', () => {
      wrapper.setProps({ fetchingPatientData: true });
      wrapper.setState({ processingData: true });

      setToShouldFetch();
      instance.handleChartDateRangeUpdate(dateRange);
      sinon.assert.callCount(instance.fetchEarlierData, 0);

      setToShouldProcess();
      instance.handleChartDateRangeUpdate(dateRange);
      sinon.assert.callCount(instance.processData, 0);

      setToShouldFetch();
      wrapper.setProps({ fetchingPatientData: true });
      wrapper.setState({ processingData: false });
      instance.handleChartDateRangeUpdate(dateRange);
      sinon.assert.callCount(instance.fetchEarlierData, 0);

      setToShouldProcess();
      wrapper.setProps({ fetchingPatientData: false });
      wrapper.setState({ processingData: true });
      instance.handleChartDateRangeUpdate(dateRange);
      sinon.assert.callCount(instance.processData, 0);
    });

    context('daily chart', () => {
      beforeEach(() => {
        setChartType('daily');
      });

      it('should not trigger data fetching if all fetched data has not been processed', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);

        wrapper.setState({
          lastDatumProcessedIndex: -1,
        });

        let newDateRange = [
          moment(instance.props.fetchedPatientDataRange.start).subtract(1, 'milliseconds').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(newDateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);
      });

      it('should trigger data fetching if the chart date range is same or before (to the millisecond) the earliest fetched patient data time', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);

        wrapper.setState({
          lastDatumProcessedIndex: 0,
        });

        let newDateRange = [
          moment(instance.props.fetchedPatientDataRange.start).subtract(1, 'milliseconds').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(newDateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 1);
      });

      it('should trigger data processing if the chart date range is same day or before (to the millisecond) the earliest processed patient datum time', () => {
        wrapper.setState({
          lastProcessedDateTarget: '2018-01-06T00:00:00.000Z',
        });

        const sameDateRange = [
          moment(instance.state.lastProcessedDateTarget).toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(sameDateRange);
        sinon.assert.callCount(instance.processData, 1);

        const earlierDateRange = [
          moment(instance.state.lastProcessedDateTarget).subtract(1, 'milliseconds').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(earlierDateRange);
        sinon.assert.callCount(instance.processData, 2);

        const laterDateRange = [
          moment(instance.state.lastProcessedDateTarget).add(1, 'days').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(laterDateRange);
        sinon.assert.callCount(instance.processData, 2);
      });

      it('should trigger processing if the chart scroll limit is reached and there is data to process', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);
        sinon.assert.callCount(instance.processData, 0);

        wrapper.setState({
          lastDiabetesDatumProcessedIndex: 0,
        });

        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.processData, 1);
      });
    });

    context('bgLog chart', () => {
      beforeEach(() => {
        setChartType('bgLog');
      });

      it('should not trigger data fetching if all fetched data has not been processed', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);

        wrapper.setState({
          lastDatumProcessedIndex: -1,
        });

        let newDateRange = [
          moment(instance.props.fetchedPatientDataRange.start).subtract(1, 'milliseconds').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(newDateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);
      });

      it('should trigger data fetching if the chart date range is same or before (to the millisecond) the earliest fetched patient data time', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);

        wrapper.setState({
          lastDatumProcessedIndex: 0,
        });

        let newDateRange = [
          moment(instance.props.fetchedPatientDataRange.start).subtract(1, 'milliseconds').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(newDateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 1);
      });

      it('should trigger data processing if the chart date range is same day or before (to the millisecond) the earliest processed patient datum time', () => {
        wrapper.setState({
          lastProcessedDateTarget: '2018-01-06T00:00:00.000Z',
        });

        const sameDateRange = [
          moment(instance.state.lastProcessedDateTarget).toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(sameDateRange);
        sinon.assert.callCount(instance.processData, 1);

        const earlierDateRange = [
          moment(instance.state.lastProcessedDateTarget).subtract(1, 'milliseconds').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(earlierDateRange);
        sinon.assert.callCount(instance.processData, 2);

        const laterDateRange = [
          moment(instance.state.lastProcessedDateTarget).add(1, 'days').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(laterDateRange);
        sinon.assert.callCount(instance.processData, 2);
      });

      it('should trigger processing if the chart scroll limit is reached and there is data to process', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);
        sinon.assert.callCount(instance.processData, 0);

        wrapper.setState({
          lastDiabetesDatumProcessedIndex: 0,
        });

        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.processData, 1);
      });
    });

    context('trends chart', () => {
      beforeEach(() => {
        setChartType('trends');
      });

      it('should not trigger data fetching if all fetched data has not been processed', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);

        wrapper.setState({
          lastDatumProcessedIndex: -1,
        });

        let newDateRange = [
          moment(instance.props.fetchedPatientDataRange.start).subtract(1, 'days').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(newDateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);
      });

      it('should trigger data fetching if the chart date range is same or before (to the day) the earliest fetched patient data time', () => {
        instance.handleChartDateRangeUpdate(dateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 0);

        wrapper.setState({
          lastDatumProcessedIndex: 0,
        });

        let newDateRange = [
          moment(instance.props.fetchedPatientDataRange.start).subtract(1, 'days').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(newDateRange);
        sinon.assert.callCount(instance.fetchEarlierData, 1);
      });

      it('should trigger data processing if the chart date range is same before (to the day) the earliest processed patient datum time', () => {
        wrapper.setState({
          lastProcessedDateTarget: '2018-01-06T00:00:00.000Z',
        });

        const sameDateRange = [
          moment(instance.state.lastProcessedDateTarget).toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(sameDateRange);
        sinon.assert.callCount(instance.processData, 0);

        const earlierDateRange = [
          moment(instance.state.lastProcessedDateTarget).subtract(1, 'days').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(earlierDateRange);
        sinon.assert.callCount(instance.processData, 1);

        const laterDateRange = [
          moment(instance.state.lastProcessedDateTarget).add(1, 'days').toISOString(),
          dateRange[1],
        ];

        instance.handleChartDateRangeUpdate(laterDateRange);
        sinon.assert.callCount(instance.processData, 1);
      });
    });
  });

  describe('handleMessageCreation', () => {
    let props;
    let BaseObject;

    beforeEach(() => {
      props = _.assign({}, defaultProps, {
        addPatientNote: sinon.stub(),
        trackMetric: sinon.stub(),
      });

      BaseObject = () => ({
        props,
        refs: {
          tideline: {
            getWrappedInstance: () => ({createMessageThread: sinon.stub()})
          },
        },
      });
    });

    it('should dispatch the message creation action', () => {
      PatientData.WrappedComponent.prototype.handleMessageCreation.call(new BaseObject(), 'message');
      sinon.assert.calledOnce(props.addPatientNote);
      sinon.assert.calledWith(props.addPatientNote, 'message');
    });

    it('should dispatch the track metric action', () => {
      PatientData.WrappedComponent.prototype.handleMessageCreation.call(new BaseObject(), 'message');
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Created New Message');
    });
  });

  describe('handleEditMessage', () => {
    let props;
    let BaseObject;

    beforeEach(() => {
      props = _.assign({}, defaultProps, {
        updatePatientNote: sinon.stub(),
        trackMetric: sinon.stub(),
      });

      BaseObject = () => ({
        props,
        refs: {
          tideline: {
            getWrappedInstance: () => ({editMessageThread: sinon.stub()}),
          },
        },
      });
    });

    it('should dispatch the message creation action', () => {
      PatientData.WrappedComponent.prototype.handleEditMessage.call(new BaseObject(), 'message');
      sinon.assert.calledOnce(props.updatePatientNote);
      sinon.assert.calledWith(props.updatePatientNote, 'message');
    });

    it('should dispatch the track metric action', () => {
      PatientData.WrappedComponent.prototype.handleEditMessage.call(new BaseObject(), 'message');
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Edit To Message');
    });
  });

  describe('fetchEarlierData', () => {
    let wrapper;
    let instance;
    let props;
    let setStateSpy;

    beforeEach(() => {
      props = _.assign({}, defaultProps, {
        onFetchEarlierData: sinon.stub(),
      });


      wrapper = shallow(<PatientData.WrappedComponent {...props} />);
      instance = wrapper.instance();

      setStateSpy = sinon.spy(instance, 'setState');
    });

    afterEach(() => {
      props.onFetchEarlierData.reset();
      props.trackMetric.reset();
      setStateSpy.resetHistory();
    });

    after(() => {
      setStateSpy.restore();
    });

    context('all the data has been fetched already', () => {
      it('should not fetch earlier data or update the state', () => {
        wrapper.setProps({
          fetchedPatientDataRange: {
            fetchedUntil: 'start',
          },
        });

        instance.fetchEarlierData();

        sinon.assert.notCalled(setStateSpy);
        sinon.assert.notCalled(props.onFetchEarlierData);
      });
    });

    context('all the data has been not fetched already', () => {
      it('should fetch a range of 16 weeks of prior data', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: 40,
          fetchedPatientDataRange: {
            fetchedUntil,
          },
        });

        const expectedStart = moment.utc(fetchedUntil).subtract(16, 'weeks').toISOString();
        const expectedEnd = moment.utc(fetchedUntil).subtract(1, 'milliseconds').toISOString();

        instance.fetchEarlierData();

        sinon.assert.calledOnce(props.onFetchEarlierData);
        sinon.assert.calledWith(props.onFetchEarlierData, {
          startDate: expectedStart,
          endDate: expectedEnd,
          carelink: undefined,
          dexcom: undefined,
          medtronic: undefined,
          initial: false,
          useCache: false,
        }, 40);
      });

      it('should allow overriding the default fetch options', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: 40,
          fetchedPatientDataRange: {
            fetchedUntil,
          },
        });

        const options = {
          startDate: null,
          endDate: null,
          useCache: true,
        };

        instance.fetchEarlierData(options);

        sinon.assert.calledOnce(props.onFetchEarlierData);
        sinon.assert.calledWithMatch(props.onFetchEarlierData, {
          startDate: null,
          endDate: null,
          useCache: true,
        }, 40);
      });

      it('should by default persist the `carelink`, `dexcom`, and `medtronic` data fetch api options from props', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: 40,
          fetchedPatientDataRange: {
            fetchedUntil,
          },
          carelink: true,
          dexcom: true,
          medtronic: true,
        });

        assert.isTrue(instance.props.carelink);
        assert.isTrue(instance.props.dexcom);
        assert.isTrue(instance.props.medtronic);

        instance.fetchEarlierData();

        sinon.assert.calledOnce(props.onFetchEarlierData);
        sinon.assert.calledWithMatch(props.onFetchEarlierData, {
          carelink: true,
          dexcom: true,
          medtronic: true,
        }, 40);

        wrapper.setProps({
          currentPatientInViewId: 40,
          fetchedPatientDataRange: {
            fetchedUntil,
          },
          carelink: false,
          dexcom: false,
          medtronic: false,
        });

        assert.isFalse(instance.props.carelink);
        assert.isFalse(instance.props.dexcom);
        assert.isFalse(instance.props.medtronic);

        instance.fetchEarlierData();

        sinon.assert.calledWithMatch(props.onFetchEarlierData, {
          carelink: false,
          dexcom: false,
          medtronic: false,
        }, 40);
      });

      it('should set the `loading`, `fetchEarlierDataCount` and `requestedPatientDataRange` state', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          fetchedPatientDataRange: {
            fetchedUntil,
          },
        });

        const expectedStart = moment.utc(fetchedUntil).subtract(16, 'weeks').toISOString();
        const expectedEnd = moment.utc(fetchedUntil).subtract(1, 'milliseconds').toISOString();

        expect(wrapper.state().fetchEarlierDataCount).to.equal(0);

        instance.fetchEarlierData();

        sinon.assert.calledOnce(setStateSpy);
        sinon.assert.calledWith(setStateSpy, {
          loading: true,
          fetchEarlierDataCount: 1,
          requestedPatientDataRange: {
            start: expectedStart,
            end: expectedEnd,
          },
        });
      });

      it('should track the `Fetched earlier patient data` metric', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          fetchedPatientDataRange: {
            fetchedUntil,
          },
        });

        const expectedStart = moment.utc(fetchedUntil).subtract(16, 'weeks').toISOString();
        const expectedEnd = moment.utc(fetchedUntil).subtract(1, 'milliseconds').toISOString();

        expect(wrapper.state().fetchEarlierDataCount).to.equal(0);

        instance.fetchEarlierData();

        sinon.assert.calledWith(props.trackMetric, 'Fetched earlier patient data', {
          count: 1,
          patientID: 'somestring' ,
        });
      });
    });
  });

  describe('getLastDatumToProcessIndex', () => {
    let wrapper;
    let instance;

    const unprocessedData = [
      { id: 0, time: '2018-03-02T00:00:00.000Z', type: 'upload' },
      { id: 1, time: '2018-02-02T00:00:00.000Z', type: 'cbg' },
      { id: 2, time: '2018-01-02T00:00:00.000Z', type: 'bolus' },
      { id: 3, time: '2017-12-02T00:00:00.000Z', type: 'deviceEvent' },
      { id: 4, time: '2017-11-02T00:00:00.000Z', type: 'basal' },
    ];

    beforeEach(() => {
      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should return the datum index prior to the first diabetes datum outside our range boundary', () => {
      expect(instance.getLastDatumToProcessIndex(unprocessedData, '2018-02-01T00:00:00.000Z')).to.equal(1)
      expect(instance.getLastDatumToProcessIndex(unprocessedData, '2018-01-01T00:00:00.000Z')).to.equal(3)
      expect(instance.getLastDatumToProcessIndex(unprocessedData, '2017-12-01T00:00:00.000Z')).to.equal(3)
    });

    it('should return the last datum when no diabetes data found beyond our range boundary', () => {
      expect(instance.getLastDatumToProcessIndex(unprocessedData, '2017-11-01T00:00:00.000Z')).to.equal(4)
    });

    it('should include first diabetes datum found outside of our processing window if it\'s the only one', () => {
      expect(instance.getLastDatumToProcessIndex(unprocessedData, '2018-02-15T00:00:00.000Z')).to.equal(1)
      expect(instance.getLastDatumToProcessIndex(unprocessedData, '2018-04-15T00:00:00.000Z')).to.equal(1)
    });
  });

  describe('processData', () => {
    let wrapper;
    let instance;
    let setStateSpy;
    let shouldProcessProps;
    let processPatientDataStub;
    let addDataStub;
    let getTimezoneForDataProcessingStub;
    let handleInitialProcessedDataStub;
    let hideLoadingStub;
    let utilsStubs;

    const processedPatientDataStub = {
      data: 'stubbed data',
      bgClasses: 'stubbed bgClasses',
      bgUnits: 'stubbed bgUnits',
      timePrefs: 'stubbed timePrefs',
      grouped: {},
    };

    beforeEach(() => {
      shouldProcessProps = _.assign({}, defaultProps, {
        currentPatientInViewId: 40,
        patientDataMap: {
          40: [
            { id: 1, time: '2018-02-01T00:00:00.000Z', type: 'cbg' },
            { id: 2, time: '2018-01-01T00:00:00.000Z', type: 'bolus' },
            { id: 3, time: '2017-12-01T00:00:00.000Z', type: 'upload' },
            { id: 4, time: '2017-11-01T00:00:00.000Z', type: 'basal' },
          ],
        },
        patientNotesMap: {
          40: [
            { id: 5, messagetext: 'hello' },
          ],
        },
        patient: {
          settings: {},
        },
      });

      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      instance = wrapper.instance();

      // we want to stub out componentWillUpdate and fetchEarlierData to keep these tests isolated
      instance.componentWillUpdate = sinon.stub();
      instance.fetchEarlierData = sinon.stub();
      instance.dataUtil = new DataUtilStub();

      // stub out any methods we expect to be called
      addDataStub = sinon.stub().returns(processedPatientDataStub);
      wrapper.setState({
        processedPatientData: {
          addData: addDataStub,
        },
      });


      handleInitialProcessedDataStub = sinon.stub(instance, 'handleInitialProcessedData');
      hideLoadingStub = sinon.stub(instance, 'hideLoading');

      utilsStubs = {
        processPatientData: sinon.stub().returns(processedPatientDataStub),
        filterPatientData: sinon.stub().returns({
          processedData: 'stubbed filtered data',
        }),
        getTimezoneForDataProcessing: sinon.stub().returns('stubbed timezone'),
        getLatestPumpSettings: sinon.stub().returns({}),
      };

      PD.__Rewire__('utils', utilsStubs);

      PD.__Rewire__('DataUtil', DataUtilStub);

      processPatientDataStub = PD.__get__('utils').processPatientData;
      getTimezoneForDataProcessingStub = PD.__get__('utils').getTimezoneForDataProcessing;

      setStateSpy = sinon.spy(instance, 'setState');
    });

    afterEach(() => {
      processPatientDataStub.reset();
      addDataStub.reset();
      getTimezoneForDataProcessingStub.reset();
      PD.__ResetDependency__('utils');
      PD.__ResetDependency__('DataUtil');
    });

    context('data is currently being processed', () => {
      it('should return without updating state and not attempt to process data', () => {
        wrapper.setProps(shouldProcessProps);
        wrapper.setState({
          processingData: true,
        });

        setStateSpy.resetHistory();

        instance.processData();
        sinon.assert.notCalled(setStateSpy);
      });
    });

    context('all patient data has been fetched and processed', () => {
      it('should set the loading state to false and not attempt to process any more data', () => {
        wrapper.setState({
          lastDatumProcessedIndex: 3,
        });
        wrapper.setProps(_.assign({}, shouldProcessProps, {
          fetchedPatientDataRange: {
            fetchedUntil: 'start',
          },
        }));

        setStateSpy.resetHistory();

        instance.processData();
        sinon.assert.callCount(setStateSpy, 1);
        sinon.assert.calledWith(setStateSpy, {
          loading: false,
        });
      });
    });

    context('no patient data has been fetched', () => {
      it('should return without updating state and not attempt to process data', () => {
        wrapper.setProps(_.assign({}, shouldProcessProps, {
          patientDataMap: {
            40: [],
          },
        }));

        instance.processData();
        sinon.assert.notCalled(setStateSpy);
      });
    });

    context('patient data has been fetched', () => {
      it('should set the loading and processingData state to `true`', () => {
        wrapper.setProps(shouldProcessProps);
        instance.processData();
        sinon.assert.calledWith(setStateSpy, {
          loading: true,
          processingData: true,
        });
      });

      it('should get the timezone info for processing data if not already available in state', () => {
        wrapper.setState({
          timePrefs: {
            timezoneAware: false,
          },
        });
        wrapper.setProps(_.assign({}, shouldProcessProps, {
          queryParams: {
            timezone: 'US/Eastern',
          },
        }));
        instance.processData();
        sinon.assert.calledOnce(getTimezoneForDataProcessingStub);
        sinon.assert.calledWith(
          getTimezoneForDataProcessingStub,
          sinon.match.array,
          { timezone: 'US/Eastern' },
        );
      });

      context('processing initial data', () => {
        it('should call processPatientData util with a combined patient data and notes array, query params, and patient settings', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(_.assign({}, shouldProcessProps, {
            queryParams: {
              timezone: 'US/Eastern',
            },
          }));
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledOnce(processPatientDataStub);
          sinon.assert.calledWith(
            processPatientDataStub,
            [
              shouldProcessProps.patientDataMap[40][0],
              ...shouldProcessProps.patientNotesMap[40],
            ],
            { timezone: 'US/Eastern' },
            { bgTarget: { high: 180, low: 70 }, units: { bg: 'mg/dL' } },
          );
        });

        it('should call processPatientData util on diabetes data that falls within the 4 weeks of the lastProcessedDateTarget provided', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledOnce(processPatientDataStub);
          sinon.assert.calledWith(
            processPatientDataStub,
            [
              shouldProcessProps.patientDataMap[40][0], // second datum not processed as it is more than 4 weeks in the past
              ...shouldProcessProps.patientNotesMap[40],
            ],
          );
        });

        it('should ensure call to processPatientData util includes latest `pumpSettings` and corresponding `upload` datums', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          // Rewire processPatientData util to return undefined
          PD.__Rewire__('utils', _.assign({}, utilsStubs, {
            getLatestPumpSettings: sinon.stub().returns({
              latestPumpSettings: { type: 'pumpSettings' },
              uploadRecord: { type: 'upload' },
            }),
          }));

          instance.processData();
          sinon.assert.calledOnce(processPatientDataStub);
          sinon.assert.calledWith(
            processPatientDataStub,
            [
              shouldProcessProps.patientDataMap[40][0], // second datum not processed as it is more than 4 weeks in the past
              ...shouldProcessProps.patientNotesMap[40],
              { type: 'pumpSettings' },
              { type: 'upload' },
            ],
          );
        });

        it('should call processPatientData util on data beyond the 4 weeks of the lastProcessedDateTarget provided if no diabetes data would be in that slice', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(_.assign({}, shouldProcessProps, {
            patientDataMap: {
              40: [
                { time: '2018-02-01T00:00:00.000Z', type: 'upload' },
                { time: '2017-12-01T00:00:00.000Z', type: 'basal' }, // over 4 weeks back, but still should be included
                { time: '2017-10-30T00:00:00.000Z', type: 'cbg' }, // not included in slice
              ],
            },
          }));
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledOnce(processPatientDataStub);
          sinon.assert.calledWith(
            processPatientDataStub,
            [
              { time: '2018-02-01T00:00:00.000Z', type: 'upload' },
              { time: '2017-12-01T00:00:00.000Z', type: 'basal' },
              ...shouldProcessProps.patientNotesMap[40],
            ],
          );
        });

        it('should call processPatientData with all remain of the lastProcessedDateTarget provided if no diabetes data is in that slice and the last unprocessed datum is the only diabetes datum', () => {
          // This test catches an edge-case index out of range bug that was happening in this scenario
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(_.assign({}, shouldProcessProps, {
            patientDataMap: {
              40: [
                { time: '2018-02-01T00:00:00.000Z', type: 'upload' },
                { time: '2017-12-01T00:00:00.000Z', type: 'basal' }, // over 4 weeks back, but still should be included
              ],
            },
          }));
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledOnce(processPatientDataStub);
          sinon.assert.calledWith(
            processPatientDataStub,
            [
              { time: '2018-02-01T00:00:00.000Z', type: 'upload' },
              { time: '2017-12-01T00:00:00.000Z', type: 'basal' },
              ...shouldProcessProps.patientNotesMap[40],
            ],
          );
        });

        it('should set the processedPatientData to state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            {
              processedPatientData: {
                bgClasses: 'stubbed bgClasses',
                bgUnits: 'stubbed bgUnits',
                data: 'stubbed data',
                timePrefs: 'stubbed timePrefs',
              },
            }
          );
        });

        it('should set the lastDiabetesDatumProcessedIndex to state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastDiabetesDatumProcessedIndex: 0 }
          );
        });

        it('should set the lastDatumProcessedIndex to state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastDatumProcessedIndex: 0 }
          );
        });

        it('should set the lastProcessedDateTarget to state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
          });

          const expectedTargetDateTime = moment(shouldProcessProps.patientDataMap[40][0].time).startOf('day').subtract(30, 'days').toISOString();
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastProcessedDateTarget: expectedTargetDateTime }
          );
        });

        it('should apply a timezone offset to the lastProcessedDateTarget state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
            timePrefs: {
              timezoneAware: true,
              timezoneName: 'US/Eastern',
            },
          });

          const expectedTargetDateTime = moment(shouldProcessProps.patientDataMap[40][0].time).startOf('day').subtract(30, 'days').toISOString();
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastProcessedDateTarget: moment(expectedTargetDateTime).add(5, 'hours').toISOString() } // +5 hr offset for eastern time
          );
        });

        it('should set the bgPrefs state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
            lastProcessedDateTarget: '2017-12-20T00:00:00.000Z',
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { bgPrefs: sinon.match.object }
          );
        });

        it('should set the timePrefs state with updated timePrefs or existing state timePrefs if undefined', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
            lastProcessedDateTarget: '2017-12-20T00:00:00.000Z',
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { timePrefs: 'stubbed timePrefs' }
          );

          // Rewire processPatientData util to return undefined
          PD.__Rewire__('utils', _.assign({}, utilsStubs, {
            processPatientData: sinon.stub().returns(_.assign({}, processedPatientDataStub, {
              timePrefs: undefined,
            })),
          }));

          wrapper.setState({
            processedPatientData: {
              addData: addDataStub,
            },
            lastDatumProcessedIndex: -1, // no data has been processed
            lastProcessedDateTarget: '2017-12-20T00:00:00.000Z',
            timePrefs: 'existing timePrefs',
          });

          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { timePrefs: 'existing timePrefs' }
          );
        });

        it('should set the loading and processingData states back to false at the end', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
            lastProcessedDateTarget: '2017-12-20T00:00:00.000Z',
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);

          const firstCall = setStateSpy.getCall(0);
          const secondCall = setStateSpy.getCall(1);

          sinon.assert.calledWithMatch(
            firstCall,
            {
              loading: true,
              processingData: true,
            },
          );

          sinon.assert.calledWithMatch(
            secondCall,
            {
              loading: false,
              processingData: false,
            },
          );

          assert(setStateSpy.calledBefore(processPatientDataStub));
          assert(setStateSpy.calledAfter(processPatientDataStub));
        });

        it('should set call the `handleInitialProcessedData` method after updating state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
            lastProcessedDateTarget: '2017-12-20T00:00:00.000Z',
          });

          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledOnce(handleInitialProcessedDataStub);

          const secondSetStateCall = setStateSpy.getCall(1);

          assert(secondSetStateCall.calledBefore(handleInitialProcessedDataStub.getCall(0)));
        });

        it('should track the `Processed initial patient data` metric', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
            lastProcessedDateTarget: '2017-12-20T00:00:00.000Z',
          });

          wrapper.setProps(shouldProcessProps);

          instance.processData();

          sinon.assert.calledWith(defaultProps.trackMetric, 'Processed initial patient data', {
            patientID: 40 ,
          });
        });

        it('should initialize the `dataUtil`', () => {
          wrapper.setState({
            lastDatumProcessedIndex: -1, // no data has been processed
            lastProcessedDateTarget: '2017-12-20T00:00:00.000Z',
          });

          wrapper.setProps(shouldProcessProps);

          delete instance.dataUtil;
          expect(instance.dataUtil).to.be.undefined;

          instance.processData();
          expect(instance.dataUtil).to.be.an.instanceof(DataUtilStub);

          sinon.assert.calledWith(defaultProps.trackMetric, 'Processed initial patient data', {
            patientID: 40 ,
          });
        });
      });

      context('processing subsequent data', () => {
        it('should call addData util with a combined patient data and notes array, and any previously processed upload data', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 1, // previous data has been processed
            lastProcessedDateTarget: '2018-02-01T00:00:00.000Z', // setting this to a specific date, otherwise, the test would run with an indeterminite time
          });
          const previousUpload = { id: 0, time: '2018-02-10T00:00:00.000Z', type: 'upload' };
          const propsWithPreviousUpload = _.assign({}, shouldProcessProps, {
            patientDataMap: {
              40: [previousUpload].concat(shouldProcessProps.patientDataMap[40]),
            }
          });

          wrapper.setProps(propsWithPreviousUpload);
          setStateSpy.resetHistory();
          PD.__ResetDependency__('utils');

          instance.processData();

          sinon.assert.calledOnce(addDataStub);
          sinon.assert.calledWith(
            addDataStub,
            [
              sinon.match(propsWithPreviousUpload.patientDataMap[40][3]),
              sinon.match(propsWithPreviousUpload.patientDataMap[40][2]),
              sinon.match(previousUpload), // previously processed upload record included
              sinon.match({ messageText: 'hello' }),
            ],
          );
        });

        it('should call fetchEarlierData on data that falls within the 8 weeks of the lastProcessedDateTarget provided, but leaves less than a week to process', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-02T00:00:00.000Z', // setting this to a specific date, otherwise, the test would run with an indeterminite time
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();
          PD.__ResetDependency__('utils');

          instance.processData();

          sinon.assert.calledOnce(instance.fetchEarlierData);
        });

        it('should call addData util on data that falls within the 8 weeks of the lastProcessedDateTarget provided, and leaves more than a week to process', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-05T00:00:00.000Z', // setting this to a specific date, otherwise, the test would run with an indeterminite time
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();
          PD.__ResetDependency__('utils');

          instance.processData();

          sinon.assert.calledOnce(addDataStub);
          sinon.assert.calledWith(
            addDataStub,
            [
              sinon.match(shouldProcessProps.patientDataMap[40][2]), // diabetes data order reversed due to reseting utils.filterPatientData mock above, which sorts by time asc
              sinon.match(shouldProcessProps.patientDataMap[40][1]),
              sinon.match({ messageText: 'hello' }),
            ],
          );
        });

        it('should add newly processed data to the dataUtil', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-05T00:00:00.000Z', // setting this to a specific date, otherwise, the test would run with an indeterminite time
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();
          PD.__ResetDependency__('utils');

          sinon.assert.notCalled(instance.dataUtil.addData);

          instance.processData();

          sinon.assert.calledOnce(instance.dataUtil.addData);
          sinon.assert.calledWith(
            instance.dataUtil.addData,
            [
              sinon.match(shouldProcessProps.patientDataMap[40][2]), // diabetes data order reversed due to reseting utils.filterPatientData mock above, which sorts by time asc
              sinon.match(shouldProcessProps.patientDataMap[40][1]),
              sinon.match({ messageText: 'hello' }),
            ],
          );
        });

        it('should set the processedPatientData to state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-20T00:00:00.000Z',
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            {
              processedPatientData: {
                bgClasses: 'stubbed bgClasses',
                bgUnits: 'stubbed bgUnits',
                data: 'stubbed data',
                timePrefs: 'stubbed timePrefs',
              },
            }
          );
        });

        it('should set the lastDiabetesDatumProcessedIndex to state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-20T00:00:00.000Z',
          });
          setStateSpy.resetHistory();
          wrapper.setProps(shouldProcessProps);

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastDiabetesDatumProcessedIndex: 1 }
          );
        });

        it('should set the lastDatumProcessedIndex to state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastDatumProcessedIndex: 2 }
          );
        });

        it('should set the lastProcessedDateTarget to state with the regularly processing target datetime when the last processed datum is within the target processing daterange', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
          });

          const expectedTargetDateTime = moment('2018-01-10T00:00:00.000Z').startOf('day').subtract(56, 'days').toISOString();
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastProcessedDateTarget: expectedTargetDateTime }
          );
        });

        it('should set the lastProcessedDateTarget to state with last diabetes datum time when the last processed datum is outside the target processing daterange', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
          });

          const dataOutsideRange = [
            { id: 0, time: '2018-02-09T00:00:00.000Z', type: 'bolus' },
            { id: 1, time: '2017-11-01T00:00:00.000Z', type: 'bolus' },
          ];

          const propsWithDataOutsideRange = _.assign({}, shouldProcessProps, {
            patientDataMap: {
              40: dataOutsideRange,
            }
          });

          wrapper.setProps(propsWithDataOutsideRange);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastProcessedDateTarget: dataOutsideRange[1].time }
          );
        });

        it('should increment the processEarlierDataCount state', () => {
          wrapper.setState({
            processEarlierDataCount: 0, // previous data has been processed
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
          });

          const expectedTargetDateTime = moment('2018-01-10T00:00:00.000Z').startOf('day').subtract(8, 'weeks').toISOString();
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { processEarlierDataCount: 1 }
          );
        });

        it('should apply a timezone offset to the lastProcessedDateTarget state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
            timePrefs: {
              timezoneAware: true,
              timezoneName: 'US/Eastern',
            },
          });

          const expectedTargetDateTime = moment('2018-01-10T00:00:00.000Z').startOf('day').subtract(8, 'weeks').toISOString();
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledWithMatch(
            setStateSpy,
            { lastProcessedDateTarget: moment(expectedTargetDateTime).add(5, 'hours').toISOString() } // +5 hr offset for eastern time
          );
        });

        it('should set the processingData states back to false at the end', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
          });
          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);

          const firstCall = setStateSpy.getCall(0);
          const secondCall = setStateSpy.getCall(1);

          sinon.assert.calledWithMatch(
            firstCall,
            {
              loading: true,
              processingData: true,
            },
          );

          sinon.assert.calledWithMatch(
            secondCall,
            {
              processingData: false,
            },
          );

          assert(firstCall.calledBefore(addDataStub.getCall(0)));
          assert(secondCall.calledAfter(addDataStub.getCall(0)));
        });

        it('should call the `hideLoading` method after updating state', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
          });

          wrapper.setProps(shouldProcessProps);
          setStateSpy.resetHistory();

          instance.processData();
          sinon.assert.calledTwice(setStateSpy);
          sinon.assert.calledOnce(hideLoadingStub);

          const secondSetStateCall = setStateSpy.getCall(1);

          assert(secondSetStateCall.calledBefore(hideLoadingStub.getCall(0)));
        });

        it('should track the `Processed earlier patient data` metric', () => {
          wrapper.setState({
            lastDatumProcessedIndex: 0, // previous data has been processed
            lastProcessedDateTarget: '2018-01-10T00:00:00.000Z',
          });

          wrapper.setProps(shouldProcessProps);

          instance.processData();

          sinon.assert.calledWith(defaultProps.trackMetric, 'Processed earlier patient data', {
            patientID: 40,
            count: 1,
          });
        });
      });
    });
  });


  describe('hideLoading', () => {
    let wrapper;
    let instance;
    let setStateSpy;
    let setTimeoutSpy;

    before(() => {
      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      instance = wrapper.instance();

      setStateSpy = sinon.spy(instance, 'setState');
      setTimeoutSpy = sinon.spy(window, 'setTimeout');
    });

    afterEach(() => {
      setStateSpy.resetHistory();
      setTimeoutSpy.resetHistory();
    });

    after(() => {
      setStateSpy.restore();
      setTimeoutSpy.restore();
    });

    it('should hide the loader after a specified timeout', (done) => {
      instance.hideLoading(10);

      sinon.assert.callCount(window.setTimeout, 1);
      sinon.assert.calledWith(window.setTimeout, sinon.match.func, 10);

      sinon.assert.callCount(setStateSpy, 0);
      setTimeout(() => {
        sinon.assert.callCount(setStateSpy, 1);
        sinon.assert.calledWith(setStateSpy, {
          loading: false,
        });
        done();
      }, 10)
    });

    it('should default to a timeout of 250ms when not provided', () => {
      instance.hideLoading();
      sinon.assert.callCount(window.setTimeout, 1);
      sinon.assert.calledWith(window.setTimeout, sinon.match.func, 250);
    });
  });

  describe('handleSwitchToBasics', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        fetchingUser: false,
        trackMetric: sinon.stub()
      };

      var elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      elem.dataUtil = new DataUtilStub();

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToBasics();
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Basics')).to.be.true;
    });

    it('should set the `chartType` state to `basics`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();
      wrapper.setState({chartType: 'daily'});

      instance.handleSwitchToBasics();
      expect(wrapper.state('chartType')).to.equal('basics');
    });

    it('should set `dataUtil._chartPrefs` to the `basics.chartPrefs` state', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      const chartPrefs = { basics: 'basics prefs' };

      wrapper.setState({ chartPrefs })
      instance.dataUtil = new DataUtilStub();

      instance.handleSwitchToBasics();
      expect(instance.dataUtil._chartPrefs).to.equal('basics prefs');
    });
  });

  describe('handleSwitchToDaily', function() {
    it('should track metric for calender', function() {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        fetchingUser: false,
        trackMetric: sinon.stub(),
        t
      };

      var elem = TestUtils.renderIntoDocument(<PatientData.WrappedComponent {...props}/>);
      elem.dataUtil = new DataUtilStub();

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToDaily('2016-08-19T01:51:55.000Z', 'testing');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Basics testing calendar')).to.be.true;
    });

    it('should set the `chartType` state to `daily`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToDaily();
      expect(wrapper.state('chartType')).to.equal('daily');
    });

    it('should set `dataUtil._chartPrefs` to the `daily.chartPrefs` state', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      const chartPrefs = { daily: 'daily prefs' };

      wrapper.setState({ chartPrefs })
      instance.dataUtil = new DataUtilStub();

      instance.handleSwitchToDaily();
      expect(instance.dataUtil._chartPrefs).to.equal('daily prefs');
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the provided datetime', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToDaily('2018-03-03T00:00:00.000Z');

      // Should set to previous day because the provided datetime filter is exclusive
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-02T12:00:00.000Z');
    });
  });

  describe('handleSwitchToTrends', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        fetchingUser: false,
        trackMetric: sinon.stub()
      };

      var elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      elem.dataUtil = new DataUtilStub();

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToTrends('2016-08-19T01:51:55.000Z');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Modal')).to.be.true;
    });

    it('should set the `chartType` state to `trends`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToTrends();
      expect(wrapper.state('chartType')).to.equal('trends');
    });

    it('should set `dataUtil._chartPrefs` to the `trends.chartPrefs` state', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      const chartPrefs = { trends: 'trends prefs' };

      wrapper.setState({ chartPrefs })
      instance.dataUtil = new DataUtilStub();

      instance.handleSwitchToTrends();
      expect(instance.dataUtil._chartPrefs).to.equal('trends prefs');
    });

    it('should set the `datetimeLocation` state to the start of the next day for the provided datetime if it\'s after the very start of the day', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({datetimeLocation: '2018-03-03T12:00:00.000Z'});

      instance.handleSwitchToTrends('2018-03-03T12:00:00.000Z');
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-04T00:00:00.000Z');
    });

    it('should set the `datetimeLocation` state to the provided datetime as is if it\'s at the very start of the day', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToTrends('2018-03-03T00:00:00.000Z');
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-03T00:00:00.000Z');
    });
  });

  describe('handleSwitchToBgLog', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        fetchingUser: false,
        trackMetric: sinon.stub()
      };

      var elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      elem.dataUtil = new DataUtilStub();

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToBgLog('2016-08-19T01:51:55.000Z');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Two Week')).to.be.true;
    });

    it('should set the `chartType` state to `bgLog`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToBgLog();
      expect(wrapper.state('chartType')).to.equal('bgLog');
    });

    it('should set `dataUtil._chartPrefs` to the `bgLog.chartPrefs` state', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      const chartPrefs = { bgLog: 'bgLog prefs' };

      wrapper.setState({ chartPrefs })
      instance.dataUtil = new DataUtilStub();

      instance.handleSwitchToBgLog();
      expect(instance.dataUtil._chartPrefs).to.equal('bgLog prefs');
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the provided datetime', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToBgLog('2018-03-03T00:00:00.000Z');

      // Should set to previous day because the provided datetime filter is exclusive
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-02T12:00:00.000Z');
    });
  });

  describe('handleSwitchToSettings', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: 40,
        isUserPatient: true,
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          }
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        fetchingUser: false,
        trackMetric: sinon.stub()
      };

      var elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      elem.dataUtil = new DataUtilStub();

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToSettings();
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Settings')).to.be.true;
    });

    it('should set the `chartType` state to `settings`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      instance.dataUtil = new DataUtilStub();

      wrapper.setState({chartType: 'daily'});

      instance.handleSwitchToSettings();
      expect(wrapper.state('chartType')).to.equal('settings');
    });
  });

  describe('mapStateToProps', () => {
    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });
    describe('patient in view is logged-in user', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {
            userid: 'a1b2c3'
          }
        },
        currentPatientInViewId: 'a1b2c3',
        loggedInUserId: 'a1b2c3',
        patientDataMap: {
          a1b2c3: [1,2,3,4,5]
        },
        patientNotesMap: {
          a1b2c3: [{type: 'message'}]
        },
        messageThread: [{type: 'message'}],
        permissionsOfMembersInTargetCareTeam: {
          a1b2c3: { root: { } },
        },
        working: {
          fetchingPatient: {inProgress: false, notification: null},
          fetchingPatientData: {inProgress: false, notification: null},
          fetchingUser: { inProgress: false, notification: null },
          generatingPDF: { inProgress: false, notification: null },
        },
      };

      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should set isUserPatient to true', () => {
        expect(result.isUserPatient).to.be.true;
      });

      it('should map allUsersMap.a1b2c3 and permissionsOfMembersInTargetCareTeam.a1b2c3 to patient', () => {
        expect(result.patient).to.deep.equal(Object.assign({}, state.allUsersMap.a1b2c3, { permissions: state.permissionsOfMembersInTargetCareTeam.a1b2c3 }));
      });

      it('should pass through patientDataMap', () => {
        expect(result.patientDataMap).to.deep.equal(state.patientDataMap);
      });

      it('should pass through patientNotesMap', () => {
        expect(result.patientNotesMap).to.deep.equal(state.patientNotesMap);
      });

      it('should pass through the logged-in user\'s permissions on self as permsOfLoggedInUser', () => {
        expect(result.permsOfLoggedInUser).to.deep.equal(state.permissionsOfMembersInTargetCareTeam[state.currentPatientInViewId]);
      });

      it('should pass through messageThread', () => {
        expect(result.messageThread).to.deep.equal(state.messageThread);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(state.working.fetchingPatient.inProgress);
      });

      it('should map working.fetchingPatientData.inProgress to fetchingPatientData', () => {
        expect(result.fetchingPatientData).to.equal(state.working.fetchingPatientData.inProgress);
      });
    });

    describe('patient in view is distinct from logged-in user', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {
            userid: 'a1b2c3'
          },
          d4e5f6: {
            userid: 'd4e5f6'
          }
        },
        currentPatientInViewId: 'd4e5f6',
        loggedInUserId: 'a1b2c3',
        patientDataMap: {
          d4e5f6: [1,2,3,4,5]
        },
        patientNotesMap: {
          d4e5f6: [{type: 'message'}]
        },
        membershipPermissionsInOtherCareTeams: {
          d4e5f6: {
            note: {},
            view: {},
          },
        },
        permissionsOfMembersInTargetCareTeam: {
          a1b2c3: { root: { } },
        },
        messageThread: [{type: 'message'}],
        working: {
          fetchingPatient: {inProgress: false, notification: null},
          fetchingPatientData: {inProgress: false, notification: null},
          fetchingUser: {inProgress: false, notification: null},
          generatingPDF: {inProgress: false, notification: null},
        },
      };

      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should set isUserPatient to false', () => {
        expect(result.isUserPatient).to.be.false;
      });

      it('should map allUsersMap.d4e5f6 and empty permissions to patient', () => {
        expect(result.patient).to.deep.equal(Object.assign({}, state.allUsersMap.d4e5f6, { permissions: {} }));
      });

      it('should pass through patientDataMap', () => {
        expect(result.patientDataMap).to.deep.equal(state.patientDataMap);
      });

      it('should pass through patientNotesMap', () => {
        expect(result.patientNotesMap).to.deep.equal(state.patientNotesMap);
      });

      it('should pass through logged-in user\'s permissions as permsOfLoggedInUser', () => {
        expect(result.permsOfLoggedInUser).to.deep.equal(state.membershipPermissionsInOtherCareTeams[state.currentPatientInViewId]);
      });

      it('should pass through messageThread', () => {
        expect(result.messageThread).to.deep.equal(state.messageThread);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(state.working.fetchingPatient.inProgress);
      });

      it('should map working.fetchingPatientData.inProgress to fetchingPatientData', () => {
        expect(result.fetchingPatientData).to.equal(state.working.fetchingPatientData.inProgress);
      });
    });
  });
});
