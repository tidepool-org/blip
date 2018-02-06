/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global beforeEach */
/* global context */
/* global after */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import mutationTracker from 'object-invariant-test-helper';
import _ from 'lodash';
import { mount, shallow } from 'enzyme';

var assert = chai.assert;
var expect = chai.expect;

// We must remember to require the base module when mocking dependencies,
// otherwise dependencies mocked will be bound to the wrong scope!
import PD, { PatientData } from '../../../app/pages/patientdata/patientdata.js';
import { mapStateToProps } from '../../../app/pages/patientdata/patientdata.js';

describe('PatientData', function () {
  const defaultProps = {
    addPatientNote: sinon.stub(),
    clearPatientData: sinon.stub(),
    currentPatientInViewId: 'smestring',
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
    updatePatientNote: sinon.stub(),
    uploadUrl: 'http://foo.com',
    viz: {},
  };

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
    PD.__Rewire__('Weekly', React.createClass({
      render: function() {
        return (<div className='fake-weekly-view'></div>);
      }
    }));
  });

  after(() => {
    PD.__ResetDependency__('Basics');
    PD.__ResetDependency__('Daily');
    PD.__ResetDependency__('Weekly');
  });

  it('should be exposed as a module and be of type function', function() {
    expect(PatientData).to.be.a('function');
  });

  describe('render', function() {
    it('should not warn when required props are set', function() {
      var props = defaultProps;

      console.error = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    describe('loading message', () => {
      let wrapper;
      let loader;

      beforeEach(() => {
        wrapper = shallow(<PatientData {...defaultProps} />);
        loader = () => wrapper.find('Loader');
      });

      it('should render the loading message and image when fetchingPatient is true', function() {
        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.false;

        wrapper.setProps({ fetchingPatient: true });
        expect(loader().props().show).to.be.true;
      });

      it('should render the loading message and image when fetchingPatientData is true', function() {
        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.false;

        wrapper.setProps({ fetchingPatientData: true });
        expect(loader().props().show).to.be.true;
      });

      it('should render the loading message and image when both fetchingPatient and fetchingPatientData are true', function() {
        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.false;

        wrapper.setProps({
          fetchingPatient: true,
          fetchingPatientData: true,
        });
        expect(loader().props().show).to.be.true;
      });

      it('should still render the loading message and image when fetching is done but data is being processed', function() {
        var props = {
          fetchingPatient: false,
          fetchingPatientData: false,
        };

        var state = {
          processingData: true,
        };

        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.false;

        wrapper.setProps(props);
        wrapper.setState(state);
        expect(loader().props().show).to.be.true;
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
            40: [{type: 'cbg'}]
          },
          patientNotesMap: {
            40: []
          }
        });

        expect(loader().props().show).to.be.true;
      });

      it('should NOT render the loading message and image when fetching is done and data is processed', function() {
        var props = {
          fetchingPatient: false,
          fetchingPatientData: true,
        };

        wrapper.setProps(props);

        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.true;

        var props = {
          fetchingPatientData: false,
        };
        wrapper.setProps(props);

        expect(loader().props().show).to.be.false;
      });
    });

    describe('no data message', () => {
      let wrapper;
      let noData;

      beforeEach(() => {
        wrapper = mount(<PatientData {...defaultProps} />);
        noData = () => wrapper.find('.patient-data-message-no-data');
      });

      describe('logged-in user is not current patient targeted for viewing', () => {
        it ('should render the no data message when no data is present and loading and processingData are false', function() {
          var props = _.assign({}, defaultProps, {
            patient: {
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false
          });

          wrapper.setProps(props);

          wrapper.setState({
            loading: false,
            processingData: false,
          });

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

          wrapper.setProps(props);

          wrapper.setState({
            loading: false,
          });

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

          wrapper.setProps(props);
          wrapper.setState({
            loading: false,
          });

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

          wrapper.setProps(props);
          wrapper.setState({
            loading: false,
          });

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

          wrapper.setProps(props);
          wrapper.setState({
            loading: false,
          });

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

          wrapper.setProps(props);
          wrapper.setState({
            loading: false,
          });

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
        currentPatientInViewId: 40,
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
        elem = TestUtils.renderIntoDocument(<PatientData {...props} />);
        sinon.spy(elem, 'deriveChartTypeFromLatestData');

        kickOffProcessing = (data) => {
          let processedData;

          // bypass the actual processing function since that's not what we're testing here!
          elem.processData = () => {
            let diabetesData = _.map(data, datum => {
              datum.time = time;
              return datum;
            });

            processedData = {
              grouped: {
                upload: uploads,
              },
              diabetesData,
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

        it('should set the default view to <Weekly /> when latest data is from a bgm', () => {
          const data = [{
            type: 'smbg',
            deviceId: 'bgm',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-weekly-view');
          expect(view).to.be.ok;

          sinon.assert.calledOnce(elem.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(elem.props.trackMetric, 'web - default to weekly');
        });

        it('should set the default view to <Basics /> when latest data type is cbg but came from a pump', () => {
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

        it('should set the default view to <Weekly /> when type is smbg', () => {
          const data = [{
            type: 'smbg',
            deviceId: 'unknown',
          }];

          kickOffProcessing(data);

          const view = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-weekly-view');
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
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);

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
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);

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

  describe('handleRefresh', function() {
    const props = {
      onRefresh: sinon.stub(),
      clearPatientData: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
    };

    it('should clear patient data upon refresh', function() {
      const elem = TestUtils.renderIntoDocument(<PatientData {...props} />);
      const callCount = props.clearPatientData.callCount;
      elem.handleRefresh();

      expect(props.clearPatientData.callCount).to.equal(callCount + 1);
    });

    it('should clear generated pdfs upon refresh', function() {
      const elem = TestUtils.renderIntoDocument(<PatientData {...props} />);
      const callCount = props.removeGeneratedPDFS.callCount;
      elem.handleRefresh();
      expect(props.removeGeneratedPDFS.callCount).to.equal(callCount + 1);
    });
  });

  describe('componentWillUnmount', function() {
    const props = {
      clearPatientData: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
    };

    it('should clear generated pdfs upon refresh', function() {
      const elem = TestUtils.renderIntoDocument(<PatientData {...props} />);
      const callCount = props.removeGeneratedPDFS.callCount;
      elem.componentWillUnmount();
      expect(props.removeGeneratedPDFS.callCount).to.equal(callCount + 1);
    });
  });

  describe('componentWillReceiveProps', function() {
    const props = {
      clearPatientData: sinon.stub(),
    };

    it('should remove the generated PDF when the patient\'s site change source changes', function() {
      var props = {
        removeGeneratedPDFS: sinon.stub(),
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          },
          settings: {
            siteChangeSource: 'cannulaPrime',
          },
        },
      };

      const wrapper = mount(<PatientData {...props} />);

      sinon.assert.notCalled(props.removeGeneratedPDFS);

      wrapper.setProps({
        patient: _.assign({}, props.patient, {
          settings: {
            siteChangeSource: 'tubingPrime',
          },
        }),
      });

      sinon.assert.calledOnce(props.removeGeneratedPDFS);
    });

    it('should not remove the generated PDF when the patient\'s site change source did not change', function() {
      var props = {
        removeGeneratedPDFS: sinon.stub(),
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          },
          settings: {
            siteChangeSource: 'cannulaPrime',
          },
        },
      };

      const wrapper = mount(<PatientData {...props} />);

      sinon.assert.notCalled(props.removeGeneratedPDFS);

      wrapper.setProps({
        patient: _.assign({}, props.patient, {
          settings: {
            otherSetting: true,
            siteChangeSource: 'cannulaPrime',
          },
        }),
      });

      sinon.assert.notCalled(props.removeGeneratedPDFS);
    });

    it('should not remove the generated PDF when the patient\'s site change source is not set', function() {
      var props = {
        removeGeneratedPDFS: sinon.stub(),
        patient: {
          userid: 40,
          profile: {
            fullName: 'Fooey McBar'
          },
          settings: {},
        },
      };

      const wrapper = mount(<PatientData {...props} />);

      sinon.assert.notCalled(props.removeGeneratedPDFS);

      wrapper.setProps({
        patient: _.assign({}, props.patient, {
          settings: {
            otherSetting: true,
          },
        }),
      });

      sinon.assert.notCalled(props.removeGeneratedPDFS);
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

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      wrapper.setState({ chartType: 'basics', processingData: false, processedPatientData: true });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.update();
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

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      wrapper.setState({ chartType: 'daily', processingData: false, processedPatientData: true });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.update();
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

      const wrapper = mount(<PatientData {...props} />);
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      wrapper.setState({ chartType: 'settings', processingData: false, processedPatientData: true });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.update();
      expect(elem.generatePDF.callCount).to.equal(1);
    });

    it('should generate a pdf when view is weekly or trends and patient data is processed', function () {
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
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      wrapper.setState({ chartType: 'weekly', processingData: false, processedPatientData: true });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.update();
      expect(elem.generatePDF.callCount).to.equal(1);

      wrapper.setState({ chartType: 'trends', processingData: false, processedPatientData: true });

      elem.generatePDF.reset()
      expect(elem.generatePDF.callCount).to.equal(0);

      wrapper.update();
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
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      wrapper.setState({ chartType: 'daily', processingData: false, processedPatientData: true });
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
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      var callCount = elem.generatePDF.callCount;

      wrapper.setState({ chartType: 'daily', processingData: false, processedPatientData: false });
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
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      var callCount = elem.generatePDF.callCount;

      wrapper.setState({ chartType: 'daily', processingData: true, processedPatientData: true });
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
      const elem = wrapper.instance();
      sinon.stub(elem, 'generatePDF');

      var callCount = elem.generatePDF.callCount;

      wrapper.setState({ chartType: 'daily', processingData: false, processedPatientData: true });
      wrapper.update();

      expect(elem.generatePDF.callCount).to.equal(0);
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
        trackMetric: sinon.stub()
      };

      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToDaily('2016-08-19T01:51:55.000Z', 'testing');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Basics testing calendar')).to.be.true;
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
