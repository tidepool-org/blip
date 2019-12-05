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

const { Loader } = vizComponents;

var assert = chai.assert;
var expect = chai.expect;

const t = i18next.t.bind(i18next);

// We must remember to require the base module when mocking dependencies,
// otherwise dependencies mocked will be bound to the wrong scope!
import PD, { PatientData, getFetchers, mapStateToProps } from '../../../app/pages/patientdata/patientdata.js';

describe('PatientData', function () {
  const defaultProps = {
    addingData: { inProgress: false, completed: false },
    currentPatientInViewId: 'otherPatientId',
    data: {},
    dataWorkerRemoveDataRequest: sinon.stub(),
    dataWorkerRemoveDataSuccess: sinon.stub(),
    dataWorkerQueryDataRequest: sinon.stub(),
    fetchers: [],
    fetchingPatient: false,
    fetchingPatientData: false,
    fetchingUser: false,
    generatePDFRequest: sinon.stub(),
    generatingPDF: false,
    isUserPatient: false,
    messageThread: [],
    onCloseMessageThread: sinon.stub(),
    onCreateMessage: sinon.stub(),
    onEditMessage: sinon.stub(),
    onFetchMessageThread: sinon.stub(),
    onRefresh: sinon.stub(),
    onSaveComment: sinon.stub(),
    patient: {},
    pdf: {},
    queryingData: { inProgress: false, completed: false },
    queryParams: {},
    removeGeneratedPDFS: sinon.stub(),
    trackMetric: sinon.stub(),
    updateBasicsSettings: sinon.stub(),
    updatingDatum: { inProgress: false, completed: false },
    uploadUrl: 'http://foo.com',
    user: { id: 'loggedInUserId'},
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
      },
      bg: {
        reshapeBgClassesToBgBounds: sinon.stub().returns('stubbed bgBounds')
      },
      stat: {
        commonStats,
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

  describe('isInitialProcessing', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should return false for empty data set', () => {
      wrapper.setProps(_.assign({}, defaultProps, {
        data: {
          metaData: { size: 0 },
        }
      }));

      expect(instance.isInitialProcessing()).to.be.false;
    });

    it('should return false if data fetched and data range loaded', () => {
      wrapper.setProps(_.assign({}, defaultProps, {
        data: {
          metaData: { size: 12 },
        }
      }));

      wrapper.setState({ chartEndpoints: { current: [100,200] } });

      expect(instance.isInitialProcessing()).to.be.false;
    });

    it('should return false if data fetched and data range not loaded but view is settings', () => {
      wrapper.setProps(_.assign({}, defaultProps, {
        data: {
          metaData: { size: 12 },
        }
      }));

      wrapper.setState({ chartEndpoints: { current: undefined }, chartType: 'settings' });

      expect(instance.isInitialProcessing()).to.be.false;
    });

    it('should return true if data not fetched and data range not loaded', () => {
      wrapper.setProps(_.assign({}, defaultProps, {
        data: {
          metaData: { size: undefined },
        }
      }));

      wrapper.setState({ chartEndpoints: { current: undefined } });

      expect(instance.isInitialProcessing()).to.be.true;
    });

    it('should return true if data fetched but data range not loaded', () => {
      wrapper.setProps(_.assign({}, defaultProps, {
        data: {
          metaData: { size: 12 },
        }
      }));

      wrapper.setState({ chartEndpoints: { current: undefined } });

      expect(instance.isInitialProcessing()).to.be.true;
    });

    it('should return true if data not fetched but data range loaded', () => {
      wrapper.setProps(_.assign({}, defaultProps, {
        data: {
          metaData: { size: undefined },
        }
      }));

      wrapper.setState({ chartEndpoints: { current: [100,200] } });

      expect(instance.isInitialProcessing()).to.be.true;
    });
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

      it('should stop rendering the loading message and image when initial data is fetched and chart date range is loaded', function() {
        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.true;

        // Set chartType to settings, which only requires data to be loaded in order to render the chart
        wrapper.setState({ chartType: 'settings' });

        // Set patient data as loaded - should still hide loader since range enpoints not set
        wrapper.setProps(_.assign({}, defaultProps, {
          data: {
            metaData: { size: 10 },
          }
        }));
        expect(loader().props().show).to.be.false;

        // Set chart type to 'basics' - should show loader, since it requires chart date range to be set
        wrapper.setState({ chartType: 'basics' });
        expect(loader().props().show).to.be.true;


        // Set chart endpoints - should hide loader
        wrapper.setState({
          chartEndpoints: { current: [1000, 2000] },
        });
        expect(loader().props().show).to.be.false;
      });

      it('should render the loader when transitioning chart types', () => {
        wrapper.setProps(_.assign({}, defaultProps, {
          data: {
            metaData: { size: 10 },
          }
        }));

        wrapper.setState({ chartEndpoints: { current: [1000, 2000] } });

        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.false;

        // Set transitioningChartType to true - should show loader
        wrapper.setState({transitioningChartType: true});
        expect(loader().props().show).to.be.true;
      })

      it('should not render the loader when patient data set is fetched, but empty', () => {
        expect(loader().length).to.equal(1);
        expect(loader().props().show).to.be.true;

        wrapper.setProps(_.assign({}, defaultProps, {
          data: {
            metaData: { size: 0 },
          }
        }));

        expect(loader().length).to.equal(1);
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

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

          expect(noData().length).to.equal(1);
          expect(noData().text()).to.equal('Fooey McBar does not have any data yet.');
        });

        it('should render the no data message when no data is present for current patient', function() {
          var props = _.assign({}, defaultProps, {
            currentPatientInViewId: '40',
            patient: {
              userid: '40',
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            patientDataMap: {
              '40': [],
            },
            patientNotesMap: {
              '40': [],
            },
          });

          wrapper = mount(<PatientData {...props} />);

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

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

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

          expect(noData().length).to.equal(1);
        });

        it('should render the no data message when no data is present for current patient', function() {
          var props = {
            currentPatientInViewId: '40',
            isUserPatient: true,
            patient: {
              userid: '40',
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

          expect(noData().length).to.equal(1);
        });

        it('should track click on main upload button', function() {
          var props = {
            currentPatientInViewId: '40',
            isUserPatient: true,
            patient: {
              userid: '40',
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            trackMetric: sinon.stub(),
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

          expect(noData().length).to.equal(1);

          var links = wrapper.find('.patient-data-uploader-message a');
          var callCount = props.trackMetric.callCount;

          links.at(0).simulate('click');

          expect(props.trackMetric.callCount).to.equal(callCount + 1);
          expect(props.trackMetric.calledWith('Clicked No Data Upload')).to.be.true;
        });

        it('should track click on Blip Notes link', function() {
          var props = {
            currentPatientInViewId: '40',
            isUserPatient: true,
            patient: {
              userid: '40',
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false,
            trackMetric: sinon.stub()
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

          var links = wrapper.find('.patient-data-uploader-message a');
          var callCount = props.trackMetric.callCount;

          links.at(3).simulate('click');

          expect(props.trackMetric.callCount).to.equal(callCount + 1);
          expect(props.trackMetric.calledWith('Clicked No Data Get Blip Notes')).to.be.true;
        });
      });
    });

    describe('default view based on lastest data upload', () => {
      let wrapper;
      let instance;

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
      });

      beforeEach(() => {
        wrapper = mount(<PatientData {...props} />);
        instance = wrapper.instance().getWrappedInstance();

        sinon.spy(instance, 'deriveChartTypeFromLatestData');

        // Set data loaded and chart endpoints to hide loader and allow data views to render
        wrapper.setProps(_.assign({}, props, {
          data: {
            metaData: { size: 10 },
          }
        }));

        instance.setState({ chartEndpoints: { current: [1000, 2000] } });
      });

      context('setting default view based on device type of last upload', () => {
        it('should set the default view to <Basics /> when latest data is from a pump', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  bolus: {
                    type: 'bolus',
                    deviceId: 'pump',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Trends /> with CGM selected when latest data is from a cgm', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  cbg: {
                    type: 'cbg',
                    deviceId: 'cgm',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-trends-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to trends');
        });

        it('should set the default view to <BgLog /> when latest data is from a bgm', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  smbg: {
                    type: 'smbg',
                    deviceId: 'bgm',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-bgLog-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to weekly');
        });

        it('should set the default view to <Basics /> when latest data type is cbg but came from a pump', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  cbg: {
                    type: 'cbg',
                    deviceId: 'pump-cgm',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });
      });

      context('unable to determine device, falling back to data.type', () => {
        it('should set the default view to <Basics /> when type is bolus', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  bolus: {
                    type: 'bolus',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is basal', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  basal: {
                    type: 'basal',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is wizard', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  wizard: {
                    type: 'wizard',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Trends /> when type is cbg', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  cbg: {
                    type: 'cbg',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-trends-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to trends');
        });

        it('should set the default view to <BgLog /> when type is smbg', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: uploads },
              } },
              metaData: {
                latestDatumByType: {
                  smbg: {
                    type: 'smbg',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-bgLog-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to weekly');
        });
      });

      context('with no upload records, falling back to data.type', () => {
        it('should set the default view to <Basics /> when type is bolus', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: [] },
              } },
              metaData: {
                latestDatumByType: {
                  bolus: {
                    type: 'bolus',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is basal', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: [] },
              } },
              metaData: {
                latestDatumByType: {
                  basal: {
                    type: 'basal',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Basics /> when type is wizard', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: [] },
              } },
              metaData: {
                latestDatumByType: {
                  wizard: {
                    type: 'wizard',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to basics');
        });

        it('should set the default view to <Trends /> when type is cbg', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: [] },
              } },
              metaData: {
                latestDatumByType: {
                  cbg: {
                    type: 'cbg',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-trends-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to trends');
        });

        it('should set the default view to <BgLog /> when type is smbg', () => {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: [] },
              } },
              metaData: {
                latestDatumByType: {
                  smbg: {
                    type: 'smbg',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
          }));

          instance.setInitialChartView();
          wrapper.update();

          const view = wrapper.find('.fake-bgLog-view');
          expect(view.length).to.equal(1);

          sinon.assert.calledOnce(instance.deriveChartTypeFromLatestData);
          sinon.assert.calledWith(instance.props.trackMetric, 'web - default to weekly');
        });
      });
    });

    describe('render data (finally!)', () => {
      let wrapper;
      let instance;

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
      });

      beforeEach(() => {
        wrapper = mount(<PatientData {...props} />);
        instance = wrapper.instance().getWrappedInstance();

        // Set data loaded and chart endpoints to hide loader and allow data views to render
        wrapper.setProps(_.assign({}, props, {
          data: {
            metaData: { size: 10 },
          }
        }));

        instance.setState({ chartEndpoints: { current: [1000, 2000] } });
      });

      describe('logged-in user is not current patient targeted for viewing', () => {
        it ('should render the correct view when data is present for current patient', function() {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: [] },
              } },
              metaData: {
                latestDatumByType: {
                  cbg: {
                    type: 'cbg',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
            isUserPatient: false,
          }));

          instance.setInitialChartView();
          wrapper.update();

          // Setting data.type to 'cbg' should result in <Trends /> view rendering
          const view = wrapper.find('.fake-trends-view');
          expect(view.length).to.equal(1);
        });
      });

      describe('logged-in user is viewing own data', () => {
        it ('should render the correct view when data is present for current patient', function() {
          wrapper.setProps(_.assign({}, props, {
            data: {
              data: { current: {
                data: { upload: [] },
              } },
              metaData: {
                latestDatumByType: {
                  basal: {
                    type: 'basal',
                    deviceId: 'unknown',
                    normalTime: 100,
                  },
                },
                size: 10,
              },
            },
            isUserPatient: true,
          }));

          instance.setInitialChartView();
          wrapper.update();

          // Setting data.type to 'basal' should result in <Basics /> view rendering
          const view = wrapper.find('.fake-basics-view');
          expect(view.length).to.equal(1);
        });
      });
    });
  });

  describe('getInitialState', () => {
    it('should return the default `chartPrefs` state for each data view', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      expect(wrapper.state().chartPrefs).to.eql({
        basics: {
          sections: {},
        },
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
          cbgFlags: {
            cbg100Enabled: true,
            cbg80Enabled: true,
            cbg50Enabled: true,
            cbgMedianEnabled: true,
          },
          focusedCbgDateTrace: null,
          focusedCbgSlice: null,
          focusedCbgSliceKeys: null,
          focusedSmbg: null,
          focusedSmbgRangeAvg: null,
          showingCbgDateTraces: false,
          touched: false,
        },
        bgLog: {
          bgSource: 'smbg',
        },
        settings: {
          touched: false,
        },
      });
    });
  });

  describe('handleRefresh', function() {
    const props = {
      onRefresh: sinon.stub(),
      dataWorkerRemoveDataRequest: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
    };

    it('should clear patient data upon refresh', function() {
      const elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      const callCount = props.dataWorkerRemoveDataRequest.callCount;
      elem.handleRefresh();

      expect(props.dataWorkerRemoveDataRequest.callCount).to.equal(callCount + 1);
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

      instance.setState({
        chartType: 'currentChartType',
      })

      setStateSpy.resetHistory();
      sinon.assert.callCount(setStateSpy, 0);
      instance.handleRefresh();
      sinon.assert.calledWithMatch(setStateSpy, {
        bgPrefs: undefined,
        chartType: undefined,
        datetimeLocation: undefined,
        mostRecentDatetimeLocation: undefined,
        endpoints: [],
        fetchEarlierDataCount: 0,
        loading: true,
        queryDataCount: 0,
        refreshChartType: 'currentChartType',
        timePrefs: {},
        title: 'defaultTitle',
      });

      PatientData.WrappedComponent.prototype.setState.restore();
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

  describe('updateChartPrefs', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      instance = wrapper.instance();
      instance.queryData = sinon.stub();
      instance.getStatsByChartType = sinon.stub().returns('stats stub');

      wrapper.setState({
        chartPrefs: {
          basics: 'foo',
        },
      })
    });

    it('should apply updates to chartPrefs state', () => {
      instance.updateChartPrefs({ trends: 'bar' });
      expect(instance.state.chartPrefs).to.eql({
        basics: 'foo',
        trends: 'bar',
      })
    });

    it('should query data by default, but not if disabled via arg', () => {
      instance.updateChartPrefs({ trends: 'bar' }, false);
      sinon.assert.notCalled(instance.queryData);

      instance.updateChartPrefs({ trends: 'bar' });
      sinon.assert.calledWith(instance.queryData, undefined, { showLoading: false });
    });

    it('should query stats if enabled via arg, but not by default, nor if querying data', () => {
      instance.setState({ chartEndpoints: { current: [100, 200] } });

      // queryData set to false and queryStats set undefined
      instance.updateChartPrefs({ trends: 'bar'}, false);
      sinon.assert.notCalled(instance.getStatsByChartType);
      sinon.assert.notCalled(instance.queryData);

      // queryData set to true and queryStats set to false
      instance.updateChartPrefs({ trends: 'bar' }, true, false);
      sinon.assert.notCalled(instance.getStatsByChartType);
      sinon.assert.calledWith(instance.queryData, undefined, { showLoading: false });

      // queryData set to false and queryStats set to true
      instance.updateChartPrefs({ trends: 'bar'}, false, true);
      sinon.assert.called(instance.getStatsByChartType);
      sinon.assert.calledWith(
        instance.queryData,
        sinon.match({
          endpoints: [100, 200],
          stats: 'stats stub',
        }),
        { showLoading: false }
      );
    });
  });

  describe.only('getChartEndpoints', () => {
    it('should accept `datetimeLocation` as an argument', () => {

    });

    it('should default to `datetimeLocation` state when not provided as an argument', () => {

    });

    it('should default to setting end to localized ceiling of `datetimeLocation`', () => {

    });

    it('should default to setting end to localized ceiling of `datetimeLocation`', () => {

    });

    it('should set end to parsed `datetimeLocation` value if `setEndToLocalCeiling` option is `false`', () => {

    });

    context('basics view', () => {
      it('should do something', () => {

      });
    });

    context('daily view', () => {

    });

    context('bgLog view', () => {

    });

    context('trends view', () => {

    });
  });

  describe.only('getCurrentData', () => {
    it('should do something', () => {

    });
  });

  describe.only('getMetaData', () => {
    it('should do something', () => {

    });
  });

  describe.only('getBasicsAggregations', () => {
    it('should do something', () => {

    });
  });

  describe.only('getStatsByChartType', () => {
    it('should do something', () => {

    });
  });

  describe.only('getDaysByType', () => {
    it('should do something', () => {

    });
  });

  describe.only('updateChart', () => {
    it('should do something', () => {

    });
  });

  describe('componentWillUnmount', function() {
    const props = {
      dataWorkerRemoveDataSuccess: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
    };

    it('should clear generated pdfs upon refresh', function() {
    const elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      const callCount = props.removeGeneratedPDFS.callCount;
      elem.componentWillUnmount();
      expect(props.removeGeneratedPDFS.callCount).to.equal(callCount + 1);
    });

    it('should call `props.dataWorkerRemoveDataSuccess`', function() {
    const elem = TestUtils.findRenderedComponentWithType(TestUtils.renderIntoDocument(<PatientData {...props} />), PatientData.WrappedComponent);
      const callCount = props.dataWorkerRemoveDataSuccess.callCount;
      elem.componentWillUnmount();
      expect(props.dataWorkerRemoveDataSuccess.callCount).to.equal(callCount + 1);
      sinon.assert.calledWith(props.dataWorkerRemoveDataSuccess, undefined, true)
    });
  });

  describe('componentWillReceiveProps', function() {
    describe('data processing and fetching', () => {
      let wrapper;
      let instance;
      let props;
      let setStateSpy;

      beforeEach(() => {
        props = _.assign({}, defaultProps, {
          data: {
            metaData: { patientId: '40' },
          },
          patient: {
            userid: '40',
            profile: {
              fullName: 'Fooey McBar'
            },
            settings: {
              siteChangeSource: 'cannulaPrime',
            },
          },
          currentPatientInViewId: '40',
          queryParams: { timezone: 'US/Pacific' },
        });

        wrapper = shallow(<PatientData.WrappedComponent {...props} />);
        instance = wrapper.instance();

        setStateSpy = sinon.spy(instance, 'setState');
      });

      context('patient settings have not been fetched, patient data has not been added to worker', () => {
        it('should not update state', () => {
          wrapper.setProps(_.assign({}, props, {
            data: { metaData: {patientID: 'foo' } },
            patient: {
              ...props.patient,
              settings: undefined,
            }
          }));

          sinon.assert.notCalled(setStateSpy);
        });
      });

      context('patient settings have not been fetched, patient data has been added to worker', () => {
        it('should not update state', () => {
          wrapper.setProps(_.assign({}, props, {
            patient: {
              ...props.patient,
              settings: undefined,
            }
          }));

          sinon.assert.notCalled(setStateSpy);
        });
      });

      context('patient settings have been fetched, patient data has not been added to worker', () => {
        it('should not update state', () => {
          wrapper.setProps(_.assign({}, props, {
            data: { metaData: {patientID: 'foo' } },
          }));

          sinon.assert.notCalled(setStateSpy);
        });
      });

      context('patient settings have been fetched, patient data has been added to worker', () => {
        it('should set bgPrefs if not already set to state', () => {
          wrapper.setState({ bgPrefs: { bgUnits: 'mg/dL' } });
          setStateSpy.resetHistory();

          wrapper.setProps(props);

          // With bgPrefs set, it should not set it again
          sinon.assert.neverCalledWith(setStateSpy, sinon.match({
            bgPrefs: sinon.match.object,
          }));

          wrapper.setState({ bgPrefs: undefined });
          wrapper.setProps(props);

          sinon.assert.calledWith(setStateSpy, sinon.match({
            bgPrefs: {
              bgBounds: 'stubbed bgBounds',
              bgClasses: { low: { boundary: 70 }, target: { boundary: 180 } },
              bgUnits: 'mg/dL',
            },
          }));
        });

        it('should set timePrefs if not already set to state', () => {
          wrapper.setState({ timePrefs: { timezoneAware: false } });
          setStateSpy.resetHistory();

          wrapper.setProps(props);

          // With timePrefs set, it should not set it again
          sinon.assert.neverCalledWith(setStateSpy, sinon.match({
            timePrefs: sinon.match.object,
          }));

          wrapper.setState({ timePrefs: undefined });
          wrapper.setProps(props);

          sinon.assert.calledWith(setStateSpy, sinon.match({
            timePrefs: {
              timezoneAware: true,
              timezoneName: 'US/Pacific',
            },
          }));
        });

        it('should query for intial data if `state.queryDataCount < 1`', () => {
          const queryDataSpy = sinon.spy(instance, 'queryData');

          wrapper.setState({ queryDataCount: 1 });
          wrapper.setProps(props);
          sinon.assert.notCalled(queryDataSpy);

          wrapper.setState({ queryDataCount: 0 });
          wrapper.setProps(props);
          sinon.assert.calledWithMatch(queryDataSpy, {
            types: {
              upload: {
                select: 'id,deviceId,deviceTags',
              },
            },
            metaData: 'latestDatumByType,latestPumpUpload,size,bgSources',
            timePrefs: sinon.match.object,
            bgPrefs: sinon.match.object,
          });
        });

        context('querying data is completed', () => {
          const completedDataQueryProps = _.assign({}, props, {
            queryingData: {
              inProgress: false,
              completed: true,
            }
          });

          beforeEach(() => {
            wrapper.setProps(completedDataQueryProps);
          });

          it('should set queryingData state to `false`', () => {
            sinon.assert.calledWithMatch(setStateSpy, {
              queryingData: false,
            });
          });

          it('should call `setInitialChartView` if `chartType` not already set to state', () => {
            const setInitialChartViewSpy = sinon.spy(instance, 'setInitialChartView');

            wrapper.setState({ chartType: 'basics' });
            wrapper.setProps(completedDataQueryProps);

            // With chartType set, it should not set it again
            sinon.assert.notCalled(setInitialChartViewSpy);

            wrapper.setState({ chartType: undefined });
            wrapper.setProps(completedDataQueryProps);

            sinon.assert.calledWith(setInitialChartViewSpy, sinon.match(completedDataQueryProps));
          });

          it('should increment `queryDataCount` if `types` was specified in the query', () => {
            expect(instance.state.queryDataCount).to.equal(0);

            wrapper.setProps(_.assign({}, completedDataQueryProps, {
              data: {
                ...props.data,
                query: { types: 'smbg' },
              },
            }));

            sinon.assert.calledWith(setStateSpy, sinon.match({
              queryDataCount: 1,
            }));
          });

          context('querying data just completed on current render cycle', () => {
            const inProgressQueryingDataProps = _.assign({}, props, {
              queryingData: {
                inProgress: true,
                completed: false,
              }
            });

            beforeEach(() => {
              wrapper.setProps(inProgressQueryingDataProps);
            });

            it('should update chart endpoints state if `updateChartEndpoints` set in query', () => {
              wrapper.setProps(_.assign({}, completedDataQueryProps, {
                data: {
                  ...props.data,
                  query: { updateChartEndpoints: true },
                },
              }));

              sinon.assert.calledWith(setStateSpy, sinon.match({
                chartEndpoints: {
                  current: sinon.match.array,
                  next: sinon.match.array,
                  prev: sinon.match.array,
                },
              }));
            });

            it('should not update chart endpoints state if `updateChartEndpoints` not set in query', () => {
              wrapper.setProps(_.assign({}, completedDataQueryProps, {
                data: {
                  ...props.data,
                  query: { updateChartEndpoints: undefined },
                },
              }));

              sinon.assert.neverCalledWith(setStateSpy, sinon.match({
                chartEndpoints: {
                  current: sinon.match.array,
                  next: sinon.match.array,
                  prev: sinon.match.array,
                },
              }));
            });

            it('should set `transitioningChartType` to false if `transitioningChartType` was true in query', () => {
              wrapper.setProps(_.assign({}, completedDataQueryProps, {
                data: {
                  ...props.data,
                  query: { transitioningChartType: true },
                },
              }));

              sinon.assert.calledWith(setStateSpy, sinon.match({
                transitioningChartType: false,
              }));
            });

            it('should not set `transitioningChartType` to false if `transitioningChartType` was not set in query', () => {
              wrapper.setProps(_.assign({}, completedDataQueryProps, {
                data: {
                  ...props.data,
                  query: { transitioningChartType: undefined },
                },
              }));

              sinon.assert.neverCalledWith(setStateSpy, sinon.match({
                transitioningChartType: false,
              }));
            });
          });

          context('hideLoading', () => {
            const notAddingDataProps = _.assign({}, completedDataQueryProps, {
              addingData: { inProgress: false },
            });

            const notFetchingDataProps = _.assign({}, completedDataQueryProps, {
              fetchingPatientData: false,
            });

            const addingDataProps = _.assign({}, completedDataQueryProps, {
              addingData: { inProgress: true },
            });

            const fetchingDataProps = _.assign({}, completedDataQueryProps, {
              fetchingPatientData: true,
            });

            beforeEach(() => {
              // set props twice to ensure both this.props and nextProps set
              wrapper.setProps({
                ...notAddingDataProps,
                ...notFetchingDataProps,
              });
            });

            it('should hide the loader if data is not being fetched or added to worker', () => {
              const hideLoadingSpy = sinon.spy(instance, 'hideLoading');

              wrapper.setProps({
                ...notAddingDataProps,
                ...notFetchingDataProps,
              });

              // this.props.addingData.inProgress: false, nextProps.addingData.inProgress: false
              // this.props.fetchingPatientData: false, nextProps.fetchingPatientData: false
              sinon.assert.callCount(hideLoadingSpy, 1);
              hideLoadingSpy.resetHistory();

              wrapper.setProps({
                ...notAddingDataProps,
                ...fetchingDataProps,
              });

              // this.props.addingData.inProgress: false, nextProps.addingData.inProgress: false
              // this.props.fetchingPatientData: false, nextProps.fetchingPatientData: true
              sinon.assert.callCount(hideLoadingSpy, 0);

              wrapper.setProps({
                ...notAddingDataProps,
                ...notFetchingDataProps,
              });

              hideLoadingSpy.resetHistory();

              wrapper.setProps({
                ...addingDataProps,
                ...notFetchingDataProps,
              });

              // this.props.addingData.inProgress: false, nextProps.addingData.inProgress: true
              // this.props.fetchingPatientData: false, nextProps.fetchingPatientData: false
              sinon.assert.callCount(hideLoadingSpy, 0);
            });
          });
        });

        context('new data added', () => {
          it('should call queryData with no arguments', () => {
            const queryDataSpy = sinon.spy(instance, 'queryData');

            // ensure query for initial data doesn't pollute test
            wrapper.setState({ queryDataCount: 1 })

            // Adding Data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: true, completed: false }
            }));

            // Completed adding data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: false, completed: true }
            }));

            sinon.assert.callCount(queryDataSpy,1);
            // ensure queryData called with zero args
            sinon.assert.calledWithExactly(queryDataSpy, ...[]);
          });
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

  describe.only('queryData', () => {
    it('should do something', () => {

    });
  });

  describe.skip('generatePDFStats', () => {
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

  describe.skip('generatePDF', () => {
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

  describe('handleChartDateRangeUpdate', () => {
    let wrapper;
    let instance;

    const mostRecentDatetimeLocation = '2019-11-29T12:00:00.000Z';

    const chartEndpoints = {
      prev: [
        Date.parse('2019-11-23T12:00:00.000Z'),
        Date.parse('2019-11-25T12:00:00.000Z'),
      ],
      current: [
        Date.parse('2019-11-25T12:00:00.000Z'),
        Date.parse('2019-11-27T12:00:00.000Z'),
      ],
      next: [
        Date.parse('2019-11-27T12:00:00.000Z'),
        Date.parse('2019-11-29T12:00:00.000Z'),
      ],
    };

    const daysByTypeStub = { next: 2, prev: 2};

    const prevLimitReachedEndpoints = chartEndpoints.prev;
    const nextLimitReachedEndpoints = chartEndpoints.next;

    const fetchedUntilDateNeedingFetch = '2019-11-23T00:00:00.000Z';
    const fetchedUntilDateNotNeedingFetch = '2019-11-20T00:00:00.000Z';

    let dateTimeLocation = '2019-11-23T12:00:00.000Z';

    beforeEach(() => {
      wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      wrapper.setState({ chartEndpoints, mostRecentDatetimeLocation });
      instance = wrapper.instance();

      instance.getChartEndpoints = sinon.stub().returns(prevLimitReachedEndpoints);
      instance.getDaysByType = sinon.stub().returns(daysByTypeStub);
      instance.getStatsByChartType = sinon.stub().returns('stats stub');
      instance.fetchEarlierData = sinon.stub();
      instance.updateChart = sinon.stub();
    });

    context('all charts', () => {
      const shouldFetchDataProps = _.assign({}, defaultProps, {
        data: { fetchedUntil: fetchedUntilDateNeedingFetch },
      });

      const shouldNotFetchDataProps = _.assign({}, defaultProps, {
        data: { fetchedUntil: fetchedUntilDateNotNeedingFetch },
      });

      it('should call `getDaysByType`', () => {
        sinon.assert.callCount(instance.getDaysByType, 0);

        instance.handleChartDateRangeUpdate(dateTimeLocation);
        sinon.assert.callCount(instance.getDaysByType, 1);
      });

      context('next requested date range requires data fetch', () => {
        it('should fetch data', () => {
          wrapper.setProps(shouldFetchDataProps);
          sinon.assert.callCount(instance.fetchEarlierData, 0);

          instance.handleChartDateRangeUpdate(dateTimeLocation);
          sinon.assert.callCount(instance.fetchEarlierData, 1);
          sinon.assert.calledWith(instance.fetchEarlierData, {
            showLoading: true,
            returnData: false,
          });
        });
      });

      context('next requested date range does not require data fetch', () => {
        it('should not fetch data', () => {
          wrapper.setProps(shouldNotFetchDataProps);
          instance.handleChartDateRangeUpdate(dateTimeLocation);
          sinon.assert.callCount(instance.fetchEarlierData, 0);
        });
      });

      context('dates would require a fetch but data is currently being fetched', () => {
        it('should not fetch data', () => {
          wrapper.setProps({
            ...shouldFetchDataProps,
            fetchingPatientData: true,
          });

          instance.handleChartDateRangeUpdate(dateTimeLocation);
          sinon.assert.callCount(instance.fetchEarlierData, 0);
        });
      });
    });

    context('daily chart', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'daily' });
      });

      it('should get the chart endpoints, not setting the end to the local ceiling', () => {
        instance.handleChartDateRangeUpdate(dateTimeLocation);

        sinon.assert.calledWith(instance.getChartEndpoints, dateTimeLocation, {
          setEndToLocalCeiling: false,
        })
      });

      context('forceChartDataUpdate arg is true', () => {
        it('should get the chart endpoints, setting the end to the local ceiling', () => {
          instance.handleChartDateRangeUpdate(dateTimeLocation, true);

          sinon.assert.calledWith(instance.getChartEndpoints, dateTimeLocation, {
            setEndToLocalCeiling: true,
          })
        });

        it('should call updateChart with appropriate options', () => {
          instance.handleChartDateRangeUpdate(dateTimeLocation, true);

          sinon.assert.calledWith(instance.updateChart, 'daily', dateTimeLocation, prevLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });
      });

      context('past data scroll limit reached', () => {
        it('should call updateChart with appropriate options', () => {
          instance.getChartEndpoints.returns(prevLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate(dateTimeLocation);

          sinon.assert.calledWith(instance.updateChart, 'daily', dateTimeLocation, prevLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });
      });

      context('upcoming data scroll limit reached', () => {
        it('should call updateChart with appropriate options if not on the most recent day', () => {
          instance.getChartEndpoints.returns(nextLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate(dateTimeLocation);

          sinon.assert.calledWith(instance.updateChart, 'daily', dateTimeLocation, nextLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });

        it('should call updateChart with appropriate options if on the most recent day', () => {
          wrapper.setState({ mostRecentDatetimeLocation: '2019-11-23T12:00:00.000Z' });
          instance.getChartEndpoints.returns(nextLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate('2019-11-24T00:00:00.000Z');

          sinon.assert.calledWith(instance.updateChart, 'daily', '2019-11-24T00:00:00.000Z', nextLimitReachedEndpoints, sinon.match({
            showLoading: false,
            updateChartEndpoints: false,
            query: {
              endpoints: nextLimitReachedEndpoints,
              nextDays: 2,
              prevDays: 2,
              stats: 'stats stub'
            },
          }));
        });
      });
    });

    context('bgLog chart', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'bgLog' });
      });

      it('should get the chart endpoints, setting the end to the local ceiling', () => {
        instance.handleChartDateRangeUpdate(dateTimeLocation);

        sinon.assert.calledWith(instance.getChartEndpoints, dateTimeLocation, {
          setEndToLocalCeiling: true,
        })
      });

      context('forceChartDataUpdate arg is true', () => {
        it('should call updateChart with appropriate options', () => {
          instance.handleChartDateRangeUpdate(dateTimeLocation, true);

          sinon.assert.calledWith(instance.updateChart, 'bgLog', dateTimeLocation, prevLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });
      });

      context('past data scroll limit reached', () => {
        it('should call updateChart with appropriate options', () => {
          instance.getChartEndpoints.returns(prevLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate(dateTimeLocation);

          sinon.assert.calledWith(instance.updateChart, 'bgLog', dateTimeLocation, prevLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });
      });

      context('upcoming data scroll limit reached', () => {
        it('should call updateChart with appropriate options if not on the most recent day', () => {
          instance.getChartEndpoints.returns(nextLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate(dateTimeLocation);

          sinon.assert.calledWith(instance.updateChart, 'bgLog', dateTimeLocation, nextLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });

        it('should call updateChart with appropriate options if on the most recent day', () => {
          wrapper.setState({ mostRecentDatetimeLocation: '2019-11-24T00:00:00.000Z' });
          instance.getChartEndpoints.returns(nextLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate('2019-11-24T00:00:00.000Z');

          sinon.assert.calledWith(instance.updateChart, 'bgLog', '2019-11-24T00:00:00.000Z', nextLimitReachedEndpoints, sinon.match({
            showLoading: false,
            updateChartEndpoints: false,
            query: {
              endpoints: nextLimitReachedEndpoints,
              nextDays: 2,
              prevDays: 2,
              stats: 'stats stub'
            },
          }));
        });
      });
    });

    context('trends chart', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'trends' });
      });

      it('should get the chart endpoints, setting the end to the local ceiling', () => {
        instance.handleChartDateRangeUpdate(dateTimeLocation);

        sinon.assert.calledWith(instance.getChartEndpoints, dateTimeLocation, {
          setEndToLocalCeiling: true,
        })
      });

      context('forceChartDataUpdate arg is true', () => {
        it('should call updateChart with appropriate options', () => {
          instance.handleChartDateRangeUpdate(dateTimeLocation, true);

          sinon.assert.calledWith(instance.updateChart, 'trends', dateTimeLocation, prevLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });
      });

      context('past data scroll limit reached', () => {
        it('should call updateChart with appropriate options', () => {
          instance.getChartEndpoints.returns(prevLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate(dateTimeLocation);

          sinon.assert.calledWith(instance.updateChart, 'trends', dateTimeLocation, prevLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });
      });

      context('upcoming data scroll limit reached', () => {
        it('should call updateChart with appropriate options if not on the most recent day', () => {
          instance.getChartEndpoints.returns(nextLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate(dateTimeLocation);

          sinon.assert.calledWith(instance.updateChart, 'trends', dateTimeLocation, nextLimitReachedEndpoints, sinon.match({
            showLoading: true,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });

        it('should call updateChart with appropriate options if on the most recent day', () => {
          wrapper.setState({ mostRecentDatetimeLocation: '2019-11-24T00:00:00.000Z' });
          instance.getChartEndpoints.returns(nextLimitReachedEndpoints);

          instance.handleChartDateRangeUpdate('2019-11-24T00:00:00.000Z');

          sinon.assert.calledWith(instance.updateChart, 'trends', '2019-11-24T00:00:00.000Z', nextLimitReachedEndpoints, sinon.match({
            showLoading: false,
            updateChartEndpoints: true,
            query: undefined,
          }));
        });
      });
    });
  });

  describe('handleMessageCreation', () => {
    let props;
    let BaseObject;

    beforeEach(() => {
      props = _.assign({}, defaultProps, {
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

    context('currently fetching data', () => {
      it('should not fetch earlier data or update the state', () => {
        wrapper.setProps({
          fetchingPatientData: true,
        });

        instance.fetchEarlierData();

        sinon.assert.notCalled(setStateSpy);
        sinon.assert.notCalled(props.onFetchEarlierData);
      });
    });

    context('not currently fetching data', () => {
      it('should fetch a range of 16 weeks of prior data', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: '40',
          data: {
            fetchedUntil,
          },
        });

        const expectedStart = moment.utc(fetchedUntil).subtract(16, 'weeks').toISOString();
        const expectedEnd = moment.utc(fetchedUntil).subtract(1, 'milliseconds').toISOString();

        instance.fetchEarlierData();

        sinon.assert.calledOnce(props.onFetchEarlierData);
        sinon.assert.calledWith(props.onFetchEarlierData, {
          showLoading: true,
          startDate: expectedStart,
          endDate: expectedEnd,
          carelink: undefined,
          dexcom: undefined,
          medtronic: undefined,
          initial: false,
          useCache: false,
        }, '40');
      });

      it('should allow overriding the default fetch options', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: '40',
          data: {
            fetchedUntil,
          },
        });

        const options = {
          showLoading: false,
          startDate: null,
          endDate: null,
          useCache: true,
        };

        instance.fetchEarlierData(options);

        sinon.assert.calledOnce(props.onFetchEarlierData);
        sinon.assert.calledWithMatch(props.onFetchEarlierData, {
          showLoading: false,
          startDate: null,
          endDate: null,
          useCache: true,
        }, '40');
      });

      it('should by default persist the `carelink`, `dexcom`, and `medtronic` data fetch api options from props', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: '40',
          data: {
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
        }, '40');

        wrapper.setProps({
          currentPatientInViewId: '40',
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
        }, '40');
      });

      it('should set the `loading`, `fetchEarlierDataCount` and `requestedPatientDataRange` state', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          data: {
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
          data: {
            fetchedUntil,
          },
        });

        expect(wrapper.state().fetchEarlierDataCount).to.equal(0);

        instance.fetchEarlierData();

        sinon.assert.calledWith(props.trackMetric, 'Fetched earlier patient data', {
          count: 1,
          patientID: 'otherPatientId' ,
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

    it('should default to a timeout of 0ms when not provided', () => {
      instance.hideLoading();
      sinon.assert.callCount(window.setTimeout, 1);
      sinon.assert.calledWith(window.setTimeout, sinon.match.func, 0);
    });
  });

  describe('handleSwitchToBasics', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: '40',
        dataWorkerQueryDataRequest: sinon.stub(),
        isUserPatient: true,
        patient: {
          userid: '40',
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

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToBasics();
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Basics')).to.be.true;
    });

    it('should set the `chartType` state to `basics`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({chartType: 'daily'});

      instance.handleSwitchToBasics();
      expect(wrapper.state('chartType')).to.equal('basics');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToBasics();

      sinon.assert.calledWith(instance.getChartEndpoints, '2019-11-28T00:00:00.000Z', { chartType: 'basics' });
      sinon.assert.calledWith(instance.updateChart, 'basics', '2019-11-28T00:00:00.000Z', 'endpoints stub')
    });
  });

  describe('handleSwitchToDaily', function() {
    it('should track metric for calender', function() {
      var props = {
        currentPatientInViewId: '40',
        dataWorkerQueryDataRequest: sinon.stub(),
        isUserPatient: true,
        patient: {
          userid: '40',
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

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToDaily('2016-08-19T01:51:55.000Z', 'testing');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Basics testing calendar')).to.be.true;
    });

    it('should set the `chartType` state to `daily`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToDaily();
      expect(wrapper.state('chartType')).to.equal('daily');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToDaily();
      console.log(instance.getChartEndpoints.getCall(0).args)
      sinon.assert.calledWith(instance.getChartEndpoints, '2019-11-27T12:00:00.000Z', { chartType: 'daily' });
      sinon.assert.calledWith(instance.updateChart, 'daily', '2019-11-27T12:00:00.000Z', 'endpoints stub', {
        updateChartEndpoints: true
      });
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the provided datetime', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToDaily('2018-03-03T00:00:00.000Z');

      // Should set to previous day because the provided datetime filter is exclusive
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-02T12:00:00.000Z');
    });
  });

  describe('handleSwitchToTrends', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: '40',
        dataWorkerQueryDataRequest: sinon.stub(),
        isUserPatient: true,
        patient: {
          userid: '40',
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

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToTrends('2016-08-19T01:51:55.000Z');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Modal')).to.be.true;
    });

    it('should set the `chartType` state to `trends`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToTrends();
      expect(wrapper.state('chartType')).to.equal('trends');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToTrends();
      console.log(instance.getChartEndpoints.getCall(0).args)
      sinon.assert.calledWith(instance.getChartEndpoints, '2019-11-28T00:00:00.000Z', { chartType: 'trends' });
      sinon.assert.calledWith(instance.updateChart, 'trends', '2019-11-28T00:00:00.000Z', 'endpoints stub', {
        updateChartEndpoints: true
      });
    });

    it('should set the `datetimeLocation` state to the start of the next day for the provided datetime if it\'s after the very start of the day', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T12:00:00.000Z'});

      instance.handleSwitchToTrends('2018-03-03T12:00:00.000Z');
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-04T00:00:00.000Z');
    });

    it('should set the `datetimeLocation` state to the provided datetime as is if it\'s at the very start of the day', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToTrends('2018-03-03T00:00:00.000Z');
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-03T00:00:00.000Z');
    });
  });

  describe('handleSwitchToBgLog', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: '40',
        dataWorkerQueryDataRequest: sinon.stub(),
        isUserPatient: true,
        patient: {
          userid: '40',
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

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToBgLog('2016-08-19T01:51:55.000Z');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Two Week')).to.be.true;
    });

    it('should set the `chartType` state to `bgLog`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToBgLog();
      expect(wrapper.state('chartType')).to.equal('bgLog');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToBgLog();
      console.log(instance.getChartEndpoints.getCall(0).args)
      sinon.assert.calledWith(instance.getChartEndpoints, '2019-11-27T12:00:00.000Z', { chartType: 'bgLog' });
      sinon.assert.calledWith(instance.updateChart, 'bgLog', '2019-11-27T12:00:00.000Z', 'endpoints stub', {
        updateChartEndpoints: true
      });
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the provided datetime', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToBgLog('2018-03-03T00:00:00.000Z');

      // Should set to previous day because the provided datetime filter is exclusive
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-02T12:00:00.000Z');
    });
  });

  describe('handleSwitchToSettings', function() {
    it('should track a metric', function() {
      var props = {
        currentPatientInViewId: '40',
        dataWorkerQueryDataRequest: sinon.stub(),
        isUserPatient: true,
        patient: {
          userid: '40',
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

      var callCount = props.trackMetric.callCount;
      elem.handleSwitchToSettings();
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Settings')).to.be.true;
    });

    it('should set the `chartType` state to `settings`', () => {
      const wrapper = shallow(<PatientData.WrappedComponent {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({chartType: 'daily'});

      instance.handleSwitchToSettings();
      expect(wrapper.state('chartType')).to.equal('settings');
    });
  });

  describe('getFetchers', () => {
    const stateProps = {
      fetchingPendingSentInvites: {
        inProgress: false,
        completed: null,
      },
      fetchingAssociatedAccounts: {
        inProgress: false,
        completed: null,
      },
    };

    const ownProps = {
      routeParams: { id: '12345' }
    };

    const dispatchProps = {
      fetchPatient: sinon.stub().returns('fetchPatient'),
      fetchPatientData: sinon.stub().returns('fetchPatientData'),
      fetchPendingSentInvites: sinon.stub().returns('fetchPendingSentInvites'),
      fetchAssociatedAccounts: sinon.stub().returns('fetchAssociatedAccounts'),
    };

    const api = {};

    it('should return an array containing the patient and patient data fetchers from dispatchProps', () => {
      const result = getFetchers(dispatchProps, ownProps, stateProps, api);
      expect(result[0]).to.be.a('function');
      expect(result[0]()).to.equal('fetchPatient');
      expect(result[1]).to.be.a('function');
      expect(result[1]()).to.equal('fetchPatientData');
      expect(result[2]).to.be.a('function');
      expect(result[2]()).to.equal('fetchPendingSentInvites');
      expect(result[3]).to.be.a('function');
      expect(result[3]()).to.equal('fetchAssociatedAccounts');
    });

    it('should only add the associated accounts and pending invites fetchers if fetches are not already in progress or completed', () => {
      const standardResult = getFetchers(dispatchProps, ownProps, stateProps, api);
      expect(standardResult.length).to.equal(4);

      const inProgressResult = getFetchers(dispatchProps, ownProps, {
        fetchingPendingSentInvites: {
          inProgress: true,
          completed: null,
        },
        fetchingAssociatedAccounts: {
          inProgress: true,
          completed: null,
        },
      }, api);

      expect(inProgressResult.length).to.equal(2);
      expect(inProgressResult[0]()).to.equal('fetchPatient');
      expect(inProgressResult[1]()).to.equal('fetchPatientData');

      const completedResult = getFetchers(dispatchProps, ownProps, {
        fetchingPendingSentInvites: {
          inProgress: false,
          completed: true,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: true,
        },
      }, api);

      expect(completedResult.length).to.equal(2);
      expect(completedResult[0]()).to.equal('fetchPatient');
      expect(completedResult[1]()).to.equal('fetchPatientData');
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
        messageThread: [{type: 'message'}],
        permissionsOfMembersInTargetCareTeam: {
          a1b2c3: { root: { } },
        },
        working: {
          fetchingPatient: {inProgress: false, notification: null, completed: null},
          fetchingPatientData: {inProgress: false, notification: null, completed: null},
          fetchingPendingSentInvites: {inProgress: false, notification: null, completed: null},
          fetchingAssociatedAccounts: {inProgress: false, notification: null, completed: null},
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

      it('should map working.fetchingPendingSentInvites to fetchingPendingSentInvites', () => {
        expect(result.fetchingPendingSentInvites).to.equal(state.working.fetchingPendingSentInvites);
      });

      it('should map working.fetchingAssociatedAccounts to fetchingAssociatedAccounts', () => {
        expect(result.fetchingAssociatedAccounts).to.equal(state.working.fetchingAssociatedAccounts);
      });

      it('should map working.addingData to addingData', () => {
        expect(result.addingData).to.equal(state.working.addingData);
      });

      it('should map working.updatingDatum to updatingDatum', () => {
        expect(result.updatingDatum).to.equal(state.working.updatingDatum);
      });

      it('should map working.queryingData to queryingData', () => {
        expect(result.queryingData).to.equal(state.working.queryingData);
      });

      it('should map blip.data to data', () => {
        expect(result.data).to.equal(state.working.data);
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

      it('should map working.fetchingPendingSentInvites to fetchingPendingSentInvites', () => {
        expect(result.fetchingPendingSentInvites).to.equal(state.working.fetchingPendingSentInvites);
      });

      it('should map working.fetchingAssociatedAccounts to fetchingAssociatedAccounts', () => {
        expect(result.fetchingAssociatedAccounts).to.equal(state.working.fetchingAssociatedAccounts);
      });

      it('should map working.addingData to addingData', () => {
        expect(result.addingData).to.equal(state.working.addingData);
      });

      it('should map working.updatingDatum to updatingDatum', () => {
        expect(result.updatingDatum).to.equal(state.working.updatingDatum);
      });

      it('should map working.queryingData to queryingData', () => {
        expect(result.queryingData).to.equal(state.working.queryingData);
      });

      it('should map blip.data to data', () => {
        expect(result.data).to.equal(state.working.data);
      });
    });
  });
});
