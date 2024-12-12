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
import mutationTracker from 'object-invariant-test-helper';
import _, { forEach } from 'lodash';
import moment from 'moment';
import { mount, shallow } from 'enzyme';
import { components as vizComponents } from '@tidepool/viz';
import i18next from '../../../app/core/language';
import createReactClass from 'create-react-class';
import { ThemeProvider } from '@emotion/react';

import baseTheme from '../../../app/themes/baseTheme';

const { Loader } = vizComponents;

var assert = chai.assert;
var expect = chai.expect;

const t = i18next.t.bind(i18next);

// We must remember to require the base module when mocking dependencies,
// otherwise dependencies mocked will be bound to the wrong scope!
import PD, { PatientData, PatientDataClass, getFetchers, mapStateToProps } from '../../../app/pages/patientdata/patientdata.js';
import { MGDL_UNITS } from '../../../app/core/constants';

describe('PatientData', function () {
  const defaultProps = {
    addingData: { inProgress: false, completed: false },
    removingData: { inProgress: false, completed: false },
    currentPatientInViewId: 'otherPatientId',
    data: {},
    dataWorkerRemoveDataRequest: sinon.stub(),
    dataWorkerRemoveDataSuccess: sinon.stub(),
    dataWorkerQueryDataRequest: sinon.stub(),
    generateAGPImagesSuccess: sinon.stub(),
    generateAGPImagesFailure: sinon.stub(),
    fetchers: [],
    fetchingPatient: false,
    fetchingPatientData: false,
    fetchingUser: false,
    generatePDFRequest: sinon.stub(),
    generatingPDF: {},
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
    t,
  };

  before(() => {
    PD.__Rewire__('Basics', createReactClass({
      render: function() {
        return (<div className='fake-basics-view'></div>);
      }
    }));
    PD.__Rewire__('Trends', createReactClass({
      render: function() {
        return (<div className='fake-trends-view'></div>);
      }
    }));
    PD.__Rewire__('BgLog', createReactClass({
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
        reshapeBgClassesToBgBounds: sinon.stub().returns('stubbed bgBounds'),
        isCustomBgRange: sinon.stub().returns(false),
      },
      aggregation: {
        defineBasicsAggregations: sinon.stub().returns('stubbed aggregations definitions'),
        processBasicsAggregations: sinon.stub().returns('stubbed processed aggregations'),
      },
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
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
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
      var elem = shallow(<PatientDataClass {...props} />);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    describe('loading message', () => {
      let wrapper;
      let loader;

      beforeEach(() => {
        wrapper = shallow(<PatientDataClass {...defaultProps} />);
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
            fetchingPatientData: false,
            removingData: { inProgress: false },
            generatingPDF: { inProgress: false },
            pdf: {},
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
            fetchingPatientData: false,
            removingData: { inProgress: false },
            generatingPDF: { inProgress: false },
            pdf: {},
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
            removingData: { inProgress: false },
            generatingPDF: { inProgress: false },
            pdf: {},
            trackMetric: sinon.stub(),
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

          wrapper.update();

          expect(noData().length).to.equal(1);

          var links = wrapper.find('.patient-data-uploader-message a');
          var callCount = props.trackMetric.callCount;

          links.at(0).simulate('click');

          expect(props.trackMetric.callCount).to.equal(callCount + 1);
          expect(props.trackMetric.calledWith('Clicked No Data Upload')).to.be.true;
        });

        it('should track click on Dexcom Connect link', function() {
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
            removingData: { inProgress: false },
            generatingPDF: { inProgress: false },
            pdf: {},
            history: { push: sinon.stub() },
            trackMetric: sinon.stub()
          };

          wrapper = mount(<PatientData {...props} />);

          wrapper.setProps(_.assign({}, props, {
            data: {
              metaData: { size: 0 },
            }
          }));

          wrapper.update();

          var link = wrapper.find('#dexcom-connect-link').hostNodes();
          var callCount = props.trackMetric.callCount;

          link.simulate('click');

          expect(props.history.push.callCount).to.equal(1);
          sinon.assert.calledWith(props.history.push, '/patients/40/profile?dexcomConnect=patient-empty-data');

          expect(props.trackMetric.callCount).to.equal(callCount + 1);
          expect(props.trackMetric.calledWith('Clicked No Data Connect Dexcom')).to.be.true;
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
        generatingPDF: { inProgress: false },
      });

      beforeEach(() => {
        wrapper = mount(<PatientDataClass {...props} />);
        instance = wrapper.instance();

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
        wrapper = mount(<PatientDataClass {...props} />);
        instance = wrapper.instance();

        // Set data loaded and chart endpoints to hide loader and allow data views to render
        wrapper.setProps(_.assign({}, props, {
          data: {
            metaData: { size: 10 },
          }
        }));

        instance.setState({ chartEndpoints: { current: [1000, 2000] } });
      });

      it('should render a chart date dialog on basics, with appropriate initial props', () => {
        instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2018-01-01T00:00:00.000Z');
        instance.setState({ timePrefs: { timezoneName: 'US/Pacific' }, chartType: 'basics', datesDialogOpen: true });
        wrapper.update();

        const dialog = wrapper.find('#chart-dates-dialog');
        expect(dialog.length).to.equal(1);
        const dialogProps = dialog.props();

        expect(dialogProps.defaultDates).to.eql([1000, 2000]);
        expect(dialogProps.open).to.equal(true);
        expect(dialogProps.processing).to.equal(false);
        expect(dialogProps.maxDays).to.equal(90);
        expect(dialogProps.timePrefs).to.eql({ timezoneName: 'US/Pacific' });
        expect(dialogProps.mostRecentDatumDate).to.equal('2018-01-01T00:00:00.000Z');
      });

      it('should render a chart date dialog on daily, with appropriate initial props', () => {
        instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2018-01-01T00:00:00.000Z');
        instance.setState({ timePrefs: { timezoneName: 'US/Pacific' }, chartType: 'daily', datesDialogOpen: true });
        wrapper.update();

        const dialog = wrapper.find('#chart-date-dialog');
        expect(dialog.length).to.equal(1);
        const dialogProps = dialog.props();

        expect(dialogProps.defaultDate).to.eql(1000);
        expect(dialogProps.open).to.equal(true);
        expect(dialogProps.processing).to.equal(false);
        expect(dialogProps.timePrefs).to.eql({ timezoneName: 'US/Pacific' });
        expect(dialogProps.mostRecentDatumDate).to.equal('2018-01-01T00:00:00.000Z');
      });

      it('should render a print dialog, with appropriate initial props', () => {
        instance.setState({ timePrefs: { timezoneName: 'US/Pacific' } });
        wrapper.update();

        const dialog = wrapper.find('#print-dialog');
        expect(dialog.length).to.equal(1);
        const dialogProps = dialog.props();

        expect(dialogProps.open).to.equal(false);
        expect(dialogProps.processing).to.equal(false);
        expect(dialogProps.maxDays).to.equal(90);
        expect(dialogProps.timePrefs).to.eql({ timezoneName: 'US/Pacific' });

        expect(dialogProps.mostRecentDatumDates).to.be.an('object').and.have.keys([
          'agpBGM',
          'agpCGM',
          'basics',
          'bgLog',
          'daily',
        ]);
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
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      expect(wrapper.state().chartPrefs).to.eql({
        agpBGM: {
          bgSource: 'smbg',
        },
        agpCGM: {
          bgSource: 'cbg',
        },
        basics: {
          stats: {
            excludeDaysWithoutBolus: false,
          },
          sections: {},
          extentSize: 14,
        },
        daily: {
          extentSize: 1,
        },
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
          stats: {
            excludeDaysWithoutBolus: false
          },
          touched: false,
        },
        bgLog: {
          bgSource: 'smbg',
          extentSize: 14,
        },
        settings: {
          touched: false,
        },
        excludedDevices: []
      });
    });
  });

  describe('handleRefresh', function() {
    const props = {
      onRefresh: sinon.stub(),
      dataWorkerRemoveDataRequest: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
      generatingPDF: { inProgress: false },
      pdf: {},
    };

    it('should clear patient data', function() {
      const elem = mount(<PatientData {...props} />).find(PatientDataClass);
      const callCount = props.dataWorkerRemoveDataRequest.callCount;
      elem.instance().handleRefresh();

      expect(props.dataWorkerRemoveDataRequest.callCount).to.equal(callCount + 1);
    });
  });

  describe('updateBasicsSettings', () => {
    beforeEach(() => {
      defaultProps.updateBasicsSettings.reset();
      defaultProps.removeGeneratedPDFS.reset();
    })

    it('should call `updateBasicsSettings` from props, but only if `canUpdateSettings` arg is true', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
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
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      expect(wrapper.state('updatedSiteChangeSource')).to.be.undefined;

      const settings = { siteChangeSource: 'prime' };

      let canUpdateSettings = false;
      instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);
      expect(wrapper.state('updatedSiteChangeSource')).to.equal('prime');
    });

    it('should not set the `updatedSiteChangeSource` to state if `siteChangeSource` is unchanged from user settings', () => {
      const setStateSpy = sinon.spy(PatientDataClass.prototype, 'setState');

      const settingsProps = _.assign({}, defaultProps, {
        patient: _.assign({}, defaultProps.patient, {
          settings: {
            siteChangeSource: 'cannula',
          },
        }),
      });

      const wrapper = shallow(<PatientDataClass {...settingsProps} />);
      const instance = wrapper.instance();

      setStateSpy.resetHistory();
      sinon.assert.callCount(setStateSpy, 0);

      expect(instance.props.patient.settings.siteChangeSource).to.equal('cannula');

      const settings = { siteChangeSource: 'cannula' };

      let canUpdateSettings = false;
      instance.updateBasicsSettings(defaultProps.currentPatientInViewId, settings, canUpdateSettings);
      sinon.assert.notCalled(setStateSpy);
      PatientDataClass.prototype.setState.restore();
    });

    it('should callback with `props.removeGeneratedPDFS` if `siteChangeSource` is changed from user settings', () => {
      const setStateSpy = sinon.spy(PatientDataClass.prototype, 'setState');

      const settingsProps = _.assign({}, defaultProps, {
        patient: _.assign({}, defaultProps.patient, {
          settings: {
            siteChangeSource: 'cannula',
          },
        }),
      });

      const wrapper = shallow(<PatientDataClass {...settingsProps} />);
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

      PatientDataClass.prototype.setState.restore();
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

        const wrapper = shallow(<PatientDataClass {...settingsProps} />);
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

        const wrapper = shallow(<PatientDataClass {...settingsProps} />);
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
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
      instance.queryData = sinon.stub();
      instance.getStatsByChartType = sinon.stub().returns('stats stub');
      instance.getAggregationsByChartType = sinon.stub().returns('aggregations stub');

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
      instance.setState({ chartEndpoints: { current: [100, 200] }, bgPrefs: 'bgPrefs' });

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
          bgPrefs: 'bgPrefs',
          endpoints: [100, 200],
          stats: 'stats stub',
        }),
        { showLoading: false }
      );
    });

    it('should query aggregations if enabled via arg, but not by default, nor if querying data', () => {
      instance.setState({ chartEndpoints: { current: [100, 200] }, bgPrefs: 'bgPrefs' });

      // queryData and queryStats set to false and queryAggregations set undefined
      instance.updateChartPrefs({ trends: 'bar'}, false, false);
      sinon.assert.notCalled(instance.getAggregationsByChartType);
      sinon.assert.notCalled(instance.queryData);

      // queryData and queryStats set to true and queryAggregations set to false
      instance.updateChartPrefs({ trends: 'bar' }, true, true, false);
      sinon.assert.notCalled(instance.getAggregationsByChartType);
      sinon.assert.calledWith(instance.queryData, undefined, { showLoading: false });

      // queryData and queryStats set to false and queryAggregations set to true
      instance.updateChartPrefs({ trends: 'bar'}, false, false, true);
      sinon.assert.called(instance.getAggregationsByChartType);
      sinon.assert.calledWith(
        instance.queryData,
        sinon.match({
          bgPrefs: 'bgPrefs',
          endpoints: [100, 200],
          aggregationsByDate: 'aggregations stub',
        }),
        { showLoading: false }
      );
    });
  });

  describe('getChartEndpoints', () => {
    let wrapper;
    let instance;
    const datetimeLocation = '2019-11-27T12:00:00.000Z';

    const useProvidedDatetimeOpts = {
      setEndToLocalCeiling: false,
    };

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();

      wrapper.setState({
        chartType: 'daily',
        timePrefs: {
          timezoneAware: false,
        },
      });
    });

    it('should use provided `datetimeLocation` arg to set the end range, and get from state if not provided', () => {
      const result = instance.getChartEndpoints(datetimeLocation, useProvidedDatetimeOpts);
      expect(result[1]).to.be.a('number').and.to.equal(Date.parse('2019-11-27T12:00:00.000Z'));

      wrapper.setState({ datetimeLocation: '2019-11-28T12:00:00.000Z' });
      const resultWithNoDatetimeArg = instance.getChartEndpoints(undefined, useProvidedDatetimeOpts);
      expect(resultWithNoDatetimeArg[1]).to.be.a('number').and.to.equal(Date.parse('2019-11-28T12:00:00.000Z'));
    });

    it('should default to setting end to localized ceiling of `datetimeLocation`', () => {
      const result = instance.getChartEndpoints(datetimeLocation, undefined);
      expect(result[1]).to.be.a('number').and.to.equal(Date.parse('2019-11-28T00:00:00.000Z'));
    });

    context('basics view start', () => {
      beforeEach(() => {
        wrapper.setState({
          chartType: 'basics',
          timePrefs: {
            timezoneAware: false,
          },
        });
      });

      it('should return the valueOf `chartPrefs.basics.extentSize` days prior to the endpoint', () => {
        wrapper.setState({ chartPrefs: { basics: { extentSize: 14 } } });
        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T00:00:00.000Z'));

        wrapper.setState({ chartPrefs: { basics: { extentSize: 15 } } });
        const result2 = instance.getChartEndpoints(datetimeLocation);
        expect(result2[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-13T00:00:00.000Z'));
      });

      it('should return the valueOf `chartPrefs.basics.extentSize` days prior to the endpoint when timezone is set', () => {
        wrapper.setState({
          timePrefs: {
            timezoneAware: true,
            timezoneName: 'US/Eastern',
          },
          chartPrefs: { basics: { extentSize: 14 } }
        });

        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T05:00:00.000Z')); // GMT-5 for US/Eastern
      });
    });

    context('daily view start', () => {
      beforeEach(() => {
        wrapper.setState({
          chartType: 'daily',
          timePrefs: {
            timezoneAware: false,
          },
        });
      });

      it('should return the valueOf `chartPrefs.daily.extentSize` days prior to the endpoint', () => {
        wrapper.setState({ chartPrefs: { daily: { extentSize: 14 } } });
        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T00:00:00.000Z'));

        wrapper.setState({ chartPrefs: { daily: { extentSize: 15 } } });
        const result2 = instance.getChartEndpoints(datetimeLocation);
        expect(result2[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-13T00:00:00.000Z'));
      });

      it('should return the valueOf `chartPrefs.daily.extentSize` days prior to the endpoint when timezone is set', () => {
        wrapper.setState({
          timePrefs: {
            timezoneAware: true,
            timezoneName: 'US/Eastern',
          },
          chartPrefs: { daily: { extentSize: 14 } }
        });

        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T05:00:00.000Z')); // GMT-5 for US/Eastern
      });
    });

    context('bgLog view start', () => {
      beforeEach(() => {
        wrapper.setState({
          chartType: 'bgLog',
          timePrefs: {
            timezoneAware: false,
          },
        });
      });

      it('should return the valueOf `chartPrefs.bgLog.extentSize` days prior to the endpoint', () => {
        wrapper.setState({ chartPrefs: { bgLog: { extentSize: 14 } } });
        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T00:00:00.000Z'));

        wrapper.setState({ chartPrefs: { bgLog: { extentSize: 15 } } });
        const result2 = instance.getChartEndpoints(datetimeLocation);
        expect(result2[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-13T00:00:00.000Z'));
      });

      it('should return the valueOf `chartPrefs.bgLog.extentSize` days prior to the endpoint when timezone is set', () => {
        wrapper.setState({
          timePrefs: {
            timezoneAware: true,
            timezoneName: 'US/Eastern',
          },
          chartPrefs: { bgLog: { extentSize: 14 } }
        });

        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T05:00:00.000Z')); // GMT-5 for US/Eastern
      });
    });

    context('trends view start', () => {
      beforeEach(() => {
        wrapper.setState({
          chartType: 'trends',
          timePrefs: {
            timezoneAware: false,
          },
        });
      });

      it('should return the valueOf `chartPrefs.trends.extentSize` days prior to the endpoint', () => {
        wrapper.setState({ chartPrefs: { trends: { extentSize: 14 } } });
        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T00:00:00.000Z'));

        wrapper.setState({ chartPrefs: { trends: { extentSize: 15 } } });
        const result2 = instance.getChartEndpoints(datetimeLocation);
        expect(result2[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-13T00:00:00.000Z'));
      });

      it('should return the valueOf `chartPrefs.trends.extentSize` days prior to the endpoint when timezone is set', () => {
        wrapper.setState({
          timePrefs: {
            timezoneAware: true,
            timezoneName: 'US/Eastern',
          },
          chartPrefs: { trends: { extentSize: 14 } }
        });

        const result = instance.getChartEndpoints(datetimeLocation);
        expect(result[0]).to.be.a('number').and.to.equal(Date.parse('2019-11-14T05:00:00.000Z')); // GMT-5 for US/Eastern
      });
    });
  });

  describe('getCurrentData', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();

      wrapper.setProps({
        data: {
          data: {
            current: {
              nested: {
                foo: 'bar'
              },
              value: 'baz'
            },
          },
        },
      });
    });

    it('should get current data from the data prop at the requested property path', () => {
      expect(instance.getCurrentData('value')).to.equal('baz');
      expect(instance.getCurrentData('nested.foo')).to.equal('bar');
    });

    context('path not found', () => {
      it('should fall back to a provided empty value when set', () => {
        expect(instance.getCurrentData('badPath', 'my fallback value')).to.equal('my fallback value');
      });

      it('should fall back to an empty object when empty value not set', () => {
        expect(instance.getCurrentData('badPath')).to.eql({});
      });
    });
  });

  describe('getMetaData', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();

      wrapper.setProps({
        data: {
          metaData: {
            nested: {
              foo: 'bar'
            },
            value: 'baz'
          },
        },
      });
    });

    it('should get meta data from the data prop at the requested property path', () => {
      expect(instance.getMetaData('value')).to.equal('baz');
      expect(instance.getMetaData('nested.foo')).to.equal('bar');
    });

    context('path not found', () => {
      it('should fall back to a provided empty value when set', () => {
        expect(instance.getMetaData('badPath', 'my fallback value')).to.equal('my fallback value');
      });

      it('should fall back to an empty object when empty value not set', () => {
        expect(instance.getMetaData('badPath')).to.eql({});
      });
    });
  });

  describe('getBasicsAggregations', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should return an empty object if `data.aggregationsByDate` prop is empty', () => {
      wrapper.setProps({ data: {
        data: { aggregationsByDate: undefined },
      } });
      expect(instance.getBasicsAggregations()).to.eql({});
    });

    it('should return processed aggregrations if `data.aggregationsByDate` prop is present', () => {
      const processBasicsAggregationsStub = PD.__get__('vizUtils').aggregation.processBasicsAggregations;

      wrapper.setProps({ data: {
        data: { aggregationsByDate: 'my aggregations' },
        metaData: { latestPumpUpload: { manufacturer: 'animas' } },
      } });

      expect(instance.getBasicsAggregations()).to.equal('stubbed processed aggregations');
      sinon.assert.calledWith(
        processBasicsAggregationsStub,
        'stubbed aggregations definitions',
        'my aggregations',
        defaultProps.patient,
        'animas',
      );
    });
  });

  describe('getAggregationsByChartType', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    context('basics', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'basics' });
      });

      it('should add appropriate aggregations query string', () => {
        wrapper.setState({ chartPrefs: { basics: { bgSource: 'cbg' } } });
        expect(instance.getAggregationsByChartType()).to.equal('basals, boluses, fingersticks, siteChanges');
      });
    });

    context('chartType undefined', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: undefined });
      });

      it('should return undefined', () => {
        expect(instance.getAggregationsByChartType()).to.be.undefined;
      });
    });
  });

  describe('getStatsByChartType', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    context('basics', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'basics' });
      });

      it('should add appropriate stats when cbg is selected', () => {
        wrapper.setState({ chartPrefs: { basics: { bgSource: 'cbg' } } });
        expect(instance.getStatsByChartType()).to.eql([
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'totalInsulin',
          'carbs',
          'averageDailyDose',
          'glucoseManagementIndicator',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });

      it('should add appropriate stats when smbg is selected', () => {
        wrapper.setState({ chartPrefs: { basics: { bgSource: 'smbg' } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
          'averageDailyDose',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });

      it('should add appropriate stats when automated basal device is detected', () => {
        wrapper.setState({ chartPrefs: { basics: { bgSource: 'smbg' } } });
        wrapper.setProps({ data: { metaData: { latestPumpUpload: { isAutomatedBasalDevice: true } } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'timeInAuto',
          'carbs',
          'averageDailyDose',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });

      it('should add appropriate stats when a settings-overridable device is detected', () => {
        wrapper.setState({ chartPrefs: { basics: { bgSource: 'smbg' } } });
        wrapper.setProps({ data: { metaData: { latestPumpUpload: { isSettingsOverrideDevice: true } } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'timeInOverride',
          'carbs',
          'averageDailyDose',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });
    });

    context('daily', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'daily' });
      });

      it('should add appropriate stats when cbg is selected', () => {
        wrapper.setState({ chartPrefs: { daily: { bgSource: 'cbg' } } });
        expect(instance.getStatsByChartType()).to.eql([
          'timeInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
          'standardDev',
          'coefficientOfVariation',
        ]);
      });

      it('should add appropriate stats when smbg is selected', () => {
        wrapper.setState({ chartPrefs: { daily: { bgSource: 'smbg' } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
        ]);
      });

      it('should add appropriate stats when automated basal device is detected', () => {
        wrapper.setState({ chartPrefs: { daily: { bgSource: 'smbg' } } });
        wrapper.setProps({ data: { metaData: { latestPumpUpload: { isAutomatedBasalDevice: true } } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'timeInAuto',
          'carbs',
        ]);
      });

      it('should add appropriate stats when settings-overridable device is detected', () => {
        wrapper.setState({ chartPrefs: { daily: { bgSource: 'smbg' } } });
        wrapper.setProps({ data: { metaData: { latestPumpUpload: { isSettingsOverrideDevice: true } } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'timeInOverride',
          'carbs',
        ]);
      });
    });

    context('bgLog', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'bgLog' });
      });

      it('should add appropriate stats', () => {
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'standardDev',
          'coefficientOfVariation',
        ]);
      });
    });

    context('trends', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'trends' });
      });

      it('should add appropriate stats when cbg is selected', () => {
        wrapper.setState({ chartPrefs: { trends: { bgSource: 'cbg' } } });
        expect(instance.getStatsByChartType()).to.eql([
          'timeInRange',
          'averageGlucose',
          'sensorUsage',
          'totalInsulin',
          'averageDailyDose',
          'glucoseManagementIndicator',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });

      it('should add appropriate stats when smbg is selected', () => {
        wrapper.setState({ chartPrefs: { trends: { bgSource: 'smbg' } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'averageDailyDose',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });

      it('should add appropriate stats when automated basal device is detected', () => {
        wrapper.setState({ chartPrefs: { trends: { bgSource: 'smbg' } } });
        wrapper.setProps({ data: { metaData: { latestPumpUpload: { isAutomatedBasalDevice: true } } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'averageDailyDose',
          'timeInAuto',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });

      it('should add appropriate stats when settings-overridable device is detected', () => {
        wrapper.setState({ chartPrefs: { trends: { bgSource: 'smbg' } } });
        wrapper.setProps({ data: { metaData: { latestPumpUpload: { isSettingsOverrideDevice: true } } } });
        expect(instance.getStatsByChartType()).to.eql([
          'readingsInRange',
          'averageGlucose',
          'totalInsulin',
          'averageDailyDose',
          'timeInOverride',
          'standardDev',
          'coefficientOfVariation',
          'bgExtents',
        ]);
      });
    });

    context('chartType undefined', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: undefined });
      });

      it('should return an empty array', () => {
        expect(instance.getStatsByChartType()).to.eql([]);
      });
    });

    context('bgSource chartPref state missing', () => {
      beforeEach(() => {
        wrapper.setState({
          chartType: 'daily',
          chartPrefs: { daily: { bgSource: undefined } },
        });
      });

      it('should add appropriate stats when no bgSource is available', () => {
        expect(instance.getStatsByChartType('daily')).to.eql([
          'averageGlucose',
          'totalInsulin',
          'carbs',
        ]);
      });

      it('should add appropriate stats when cbg is provided via arg', () => {
        expect(instance.getStatsByChartType('daily', 'cbg')).to.eql([
          'timeInRange',
          'averageGlucose',
          'totalInsulin',
          'carbs',
          'standardDev',
          'coefficientOfVariation',
        ]);
      });
    });
  });

  describe('getDaysByType', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    context('daily', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'daily' });
      });

      it('should return 6 days for prev and next ranges', () => {
        expect(instance.getDaysByType()).to.eql({
          next: 6,
          prev: 6,
        });
      });
    });

    context('bgLog', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'bgLog' });
      });

      it('should return 14 days for prev and next ranges', () => {
        expect(instance.getDaysByType()).to.eql({
          next: 14,
          prev: 14,
        });
      });
    });

    context('chartType undefined', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: undefined });
      });

      it('should return 0 days for prev and next ranges', () => {
        expect(instance.getDaysByType()).to.eql({
          next: 0,
          prev: 0,
        });
      });
    });
  });

  describe('getMostRecentDatumTimeByChartType', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();

      wrapper.setProps({
        data: {
          metaData: {
            latestDatumByType: {
              basal: { type: 'basal', normalTime: 1, normalEnd: 10 },
              bolus: { type: 'bolus', normalTime: 2 },
              smbg: { type: 'cbg', normalTime: 3 },
              deviceEvent: { type: 'deviceEvent', normalTime: 4 },
              food: { type: 'food', normalTime: 5 },
              message: { type: 'message', normalTime: 6 },
              pumpSettings: { type: 'pumpSettings', normalTime: 7 },
              cbg: { type: 'smbg', normalTime: 8 },
              wizard: { type: 'wizard', normalTime: 9 },
            }
          }
        }
      });
    });

    it('should return the latest datum time for basics', () => {
      // should return the basal normalEnd
      expect(instance.getMostRecentDatumTimeByChartType(undefined, 'basics')).to.equal(10);
    });

    it('should return the latest datum time for daily', () => {
      // should return the basal normalEnd
      expect(instance.getMostRecentDatumTimeByChartType(undefined, 'daily')).to.equal(10);
    });

    it('should return the latest datum time for bgLog', () => {
      // should return the smbg normalTime
      expect(instance.getMostRecentDatumTimeByChartType(undefined, 'bgLog')).to.equal(3);
    });

    it('should return the latest datum time for trends', () => {
      // should return the cbg normalTime
      expect(instance.getMostRecentDatumTimeByChartType(undefined, 'trends')).to.equal(8);
    });
  });

  describe('updateChart', () => {
    let wrapper;
    let instance;
    let setStateSpy;

    const defaultChartType = 'basics';
    const defaultDatetimeLocation = '2019-11-27T00:00:00.000Z';
    const defaultEndpoints = [100, 200];

    const defaultOpts = { query: 'my query', updateChartEndpoints: true };

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();

      wrapper.setState({
        endpoints: defaultEndpoints,
        datetimeLocation: defaultDatetimeLocation,
        mostRecentDatetimeLocation: undefined,
      });

      instance.queryData = sinon.stub();

      setStateSpy = sinon.spy(instance, 'setState');
    });

    context('`chartType` changed', () => {
      beforeEach(() => {
        instance.updateChart('daily', defaultDatetimeLocation, defaultEndpoints, defaultOpts);
      });

      it('should set `chartType`, `transitioningChartType`, and `mostRecentDatetimelocation` state', () => {
        sinon.assert.calledWith(setStateSpy, {
          chartType: 'daily',
          mostRecentDatetimeLocation: defaultDatetimeLocation,
          transitioningChartType: false
        });

        instance.updateChart('basics', defaultDatetimeLocation, defaultEndpoints, { mostRecentDatetimeLocation: '2019-11-28T00:00:00.000Z' });
        sinon.assert.calledWith(setStateSpy, {
          chartType: 'basics',
          mostRecentDatetimeLocation: '2019-11-28T00:00:00.000Z',
          transitioningChartType: true,
        });
      });

      it('should call `queryData` in `setState` callback with appropriate opts', () => {
        sinon.assert.callOrder(setStateSpy, instance.queryData);
        sinon.assert.calledWith(instance.queryData, 'my query', {
          forceRemountAfterQuery: false,
          showLoading: true,
          transitioningChartType: true,
          updateChartEndpoints: true,
        });

        instance.updateChart('basics', defaultDatetimeLocation, defaultEndpoints, { updateChartEndpoints: false, showLoading: false });
        sinon.assert.calledWith(instance.queryData, undefined, {
          forceRemountAfterQuery: false,
          showLoading: false,
          transitioningChartType: true,
          updateChartEndpoints: false,
        });
      });
    });

    context('`datetimeLocation` changed', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: defaultChartType, mostRecentDatetimeLocation: defaultDatetimeLocation });
        setStateSpy.resetHistory();

        instance.updateChart(defaultChartType, '2019-11-28T00:00:00.000Z', defaultEndpoints, defaultOpts);
      });

      it('should set `datetimeLocation` state', () => {
        sinon.assert.calledWith(setStateSpy, {
          datetimeLocation: '2019-11-28T00:00:00.000Z',
        });
      });

      it('should call `queryData` in `setState` callback with appropriate opts', () => {
        sinon.assert.callOrder(setStateSpy, instance.queryData);
        sinon.assert.calledWith(instance.queryData, 'my query', {
          forceRemountAfterQuery: false,
          showLoading: true,
          transitioningChartType: false,
          updateChartEndpoints: true,
        });

        instance.updateChart(defaultChartType, defaultDatetimeLocation, defaultEndpoints, { updateChartEndpoints: false, showLoading: false });
        sinon.assert.calledWith(instance.queryData, undefined, {
          forceRemountAfterQuery: false,
          showLoading: false,
          transitioningChartType: false,
          updateChartEndpoints: false,
        });
      });
    });

    context('`endpoints` changed', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: defaultChartType, mostRecentDatetimeLocation: defaultDatetimeLocation });
        setStateSpy.resetHistory();

        instance.updateChart(defaultChartType, defaultDatetimeLocation, [200,300], defaultOpts);
      });

      it('should set `endpoints` state', () => {
        sinon.assert.calledWith(setStateSpy, {
          endpoints: [200,300],
        });
      });

      it('should call `queryData` in `setState` callback with appropriate opts', () => {
        sinon.assert.callOrder(setStateSpy, instance.queryData);
        sinon.assert.calledWith(instance.queryData, 'my query', {
          forceRemountAfterQuery: false,
          showLoading: true,
          transitioningChartType: false,
          updateChartEndpoints: true,
        });

        instance.updateChart(defaultChartType, defaultDatetimeLocation, defaultEndpoints, { updateChartEndpoints: false, showLoading: false });
        sinon.assert.calledWith(instance.queryData, undefined, {
          forceRemountAfterQuery: false,
          showLoading: false,
          transitioningChartType: false,
          updateChartEndpoints: false,
        });
      });
    });

    context('`mostRecentDatetimeLocation` state not set', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: defaultChartType, mostRecentDatetimeLocation: undefined });
        setStateSpy.resetHistory();

        instance.updateChart(defaultChartType, defaultDatetimeLocation, defaultEndpoints, defaultOpts);
      });

      it('should set `mostRecentDatetimeLocation` state', () => {
        sinon.assert.calledWith(setStateSpy, {
          mostRecentDatetimeLocation: defaultDatetimeLocation,
        });
      });

      it('should set setState callback to `undefined`', () => {
        sinon.assert.calledWith(setStateSpy, sinon.match.object, undefined);
      });
    });
  });

  describe('componentWillUnmount', function() {
    const props = {
      dataWorkerRemoveDataSuccess: sinon.stub(),
      removeGeneratedPDFS: sinon.stub(),
    };

    it('should clear generated pdfs upon refresh', function() {
    const elem = mount(<PatientData {...props} />).find(PatientDataClass);
      const callCount = props.removeGeneratedPDFS.callCount;
      elem.instance().componentWillUnmount();
      expect(props.removeGeneratedPDFS.callCount).to.equal(callCount + 1);
    });

    it('should call `props.dataWorkerRemoveDataSuccess`', function() {
    const elem = mount(<PatientData {...props} />).find(PatientDataClass);
      const callCount = props.dataWorkerRemoveDataSuccess.callCount;
      elem.instance().componentWillUnmount();
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
            metaData: { patientId: '40', queryDataCount: 1 },
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

        wrapper = shallow(<PatientDataClass {...props} />);
        instance = wrapper.instance();

        setStateSpy = sinon.spy(instance, 'setState');
      });

      context('data is removed prior to refresh', () => {
        it('should clear generated pdfs upon refresh', done => {
          const removeGeneratedPDFSStub = sinon.stub();

          wrapper.setProps({
            ...props,
            removeGeneratedPDFS: removeGeneratedPDFSStub,
            removingData: { inProgress: true },
          });
          wrapper.update();

          setTimeout(() => {
            expect(removeGeneratedPDFSStub.callCount).to.equal(0);

            wrapper.setProps({
              ...props,
              removeGeneratedPDFS: removeGeneratedPDFSStub,
              removingData: { inProgress: false, completed: true },
            });
            wrapper.update();

            setTimeout(() => {
                expect(removeGeneratedPDFSStub.callCount).to.equal(1);
                done();
            });
          });
        });

        it('should reset patient data processing state', done => {
          wrapper.setState({ chartType: 'currentChartType' });

          wrapper.setProps({
            ...props,
            removeGeneratedPDFS: sinon.stub(),
            removingData: { inProgress: true },
          });
          wrapper.update();

          setStateSpy.resetHistory();

          wrapper.setProps({
            ...props,
            removeGeneratedPDFS: sinon.stub(),
            removingData: { inProgress: false, completed: true },
          });
          wrapper.update();

          setTimeout(() => {
            sinon.assert.callCount(setStateSpy, 1);

            sinon.assert.calledWithMatch(setStateSpy, {
              ...instance.getInitialState(),
              bgPrefs: undefined,
              chartType: undefined,
              chartEndpoints: undefined,
              datetimeLocation: undefined,
              mostRecentDatetimeLocation: undefined,
              endpoints: undefined,
              refreshChartType: 'currentChartType',
            });

            done();
          });
        });
      })

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

        it('should set `bgPrefs.isCustomBgRange` to state if patient is using custom BG range', () => {
          PD.__Rewire__('vizUtils', {
            data: {
              selectDailyViewData: sinon.stub().returns('stubbed filtered daily data'),
              selectBgLogViewData: sinon.stub().returns('stubbed filtered bgLog data'),
            },
            bg: {
              reshapeBgClassesToBgBounds: sinon.stub().returns('stubbed bgBounds'),
              isCustomBgRange: sinon.stub().returns(true),
            },
            aggregation: {
              defineBasicsAggregations: sinon.stub().returns('stubbed aggregations definitions'),
              processBasicsAggregations: sinon.stub().returns('stubbed processed aggregations'),
            },
          });

          wrapper.setState({ bgPrefs: undefined });
          wrapper.setProps(props);

          sinon.assert.calledWith(setStateSpy, sinon.match({
            bgPrefs: {
              bgBounds: 'stubbed bgBounds',
              bgClasses: { low: { boundary: 70 }, target: { boundary: 180 } },
              bgUnits: 'mg/dL',
            },
            isCustomBgRange: true,
          }));
        });

        it('should set `bgPrefs` to state if with units provided via a query param', () => {
          wrapper.setState({ bgPrefs: undefined });
          wrapper.setProps(props);

          wrapper.setState({ bgPrefs: undefined });
          setStateSpy.resetHistory();

          wrapper.setProps({
            ...props,
            queryParams: { units: 'mmoll' },
          });

          sinon.assert.calledWith(setStateSpy, sinon.match({
            bgPrefs: {
              bgBounds: 'stubbed bgBounds',
              bgClasses: { low: { boundary: 3.9 }, target: { boundary: 10 } },
              bgUnits: 'mmol/L',
            },
          }));

          wrapper.setState({ bgPrefs: undefined });
          setStateSpy.resetHistory();

          wrapper.setProps({
            ...props,
            queryParams: { units: 'mgdl' },
          });

          sinon.assert.calledWith(setStateSpy, sinon.match({
            bgPrefs: {
              bgBounds: 'stubbed bgBounds',
              bgClasses: { low: { boundary: 70 }, target: { boundary: 180 } },
              bgUnits: 'mg/dL',
            },
          }));
        });

        it('should set `bgPrefs` to state using a clinic\'s preferred BG units', () => {
          wrapper.setState({ bgPrefs: undefined });
          wrapper.setProps(props);

          wrapper.setState({ bgPrefs: undefined });
          setStateSpy.resetHistory();

          wrapper.setProps({
            ...props,
            clinic: { preferredBgUnits: 'mmol/L' },
          });

          sinon.assert.calledWith(setStateSpy, sinon.match({
            bgPrefs: {
              bgBounds: 'stubbed bgBounds',
              bgClasses: { low: { boundary: 3.9 }, target: { boundary: 10 } },
              bgUnits: 'mmol/L',
            },
          }));

          wrapper.setState({ bgPrefs: undefined });
          setStateSpy.resetHistory();

          wrapper.setProps({
            ...props,
            clinic: { preferredBgUnits: 'mg/dL' },
          });

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

        it('should query for intial data if `data.metaData.queryDataCount < 1`', () => {
          const queryDataSpy = sinon.spy(instance, 'queryData');
          sinon.assert.notCalled(queryDataSpy);

          wrapper.setProps(_.assign(props, {
            data: {
              metaData: { patientId: '40', queryDataCount: 0 },
            },
          }));

          sinon.assert.calledWithMatch(queryDataSpy, {
            types: {
              upload: {
                select: 'id,deviceId,deviceTags',
              },
            },
            metaData: 'latestDatumByType,latestPumpUpload,size,bgSources,devices,excludedDevices,queryDataCount',
            excludedDevices: undefined,
            timePrefs: sinon.match.object,
            bgPrefs: sinon.match.object,
          });
        });

        it('should query for intial data and force remount if `data.metaData.queryDataCount < 1` and state.chartKey > 0', () => {
          const queryDataSpy = sinon.spy(instance, 'queryData');
          sinon.assert.notCalled(queryDataSpy);

          wrapper.setState({chartKey: 1});

          wrapper.setProps(_.assign(props, {
            data: {
              metaData: { patientId: '40', queryDataCount: 0 },
            },
          }));

          sinon.assert.calledWithMatch(queryDataSpy, {
            types: {
              upload: {
                select: 'id,deviceId,deviceTags',
              },
            },
            metaData: 'latestDatumByType,latestPumpUpload,size,bgSources,devices,excludedDevices,queryDataCount',
            excludedDevices: undefined,
            timePrefs: sinon.match.object,
            bgPrefs: sinon.match.object,
            forceRemountAfterQuery: true,
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
            wrapper.setState({ chartType: 'basics' });
            const setInitialChartViewSpy = sinon.spy(instance, 'setInitialChartView');
            wrapper.setProps(completedDataQueryProps);

            // With chartType set, it should not set it again
            sinon.assert.notCalled(setInitialChartViewSpy);

            wrapper.setState({ chartType: undefined });
            wrapper.setProps(completedDataQueryProps);

            sinon.assert.calledWith(setInitialChartViewSpy, sinon.match(completedDataQueryProps));
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
          it('should call queryData with default arguments', () => {
            const queryDataSpy = sinon.spy(instance, 'queryData');

            // Adding Data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: true, completed: false }
            }));

            // Completed adding data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: false, completed: true }
            }));

            sinon.assert.callCount(queryDataSpy, 1);

            // ensure queryData called with default args
            sinon.assert.calledWithExactly(queryDataSpy, null,{
              showLoading: true,
              updateChartEndpoints: true,
              transitioningChartType: false,
              metaData: 'bgSources,devices,matchedDevices,excludedDevices,queryDataCount',
              bgSource: undefined,
            });
          });

          context('bgSource metadata newly available', () => {
            it('should call queryData with bgSource in the `options` argument and set as chartPref to state', () => {
              const queryDataSpy = sinon.spy(instance, 'queryData');

              wrapper.setState({
                chartType: 'daily',
                chartPrefs: {
                  daily: { bgSource: undefined },
                },
              });

              // Adding Data
              wrapper.setProps(_.assign({}, props, {
                addingData: { inProgress: true, completed: false }
              }));

              // Completed adding data with
              wrapper.setProps(_.assign({}, props, {
                addingData: { inProgress: false, completed: true },
                data: { ...props.data, metaData: { ...props.data.metaData, bgSources: { current: 'cbg' } } },
              }));

              sinon.assert.callCount(queryDataSpy, 1);

              // ensure queryData called with bgSource in addition to the default args
              sinon.assert.calledWithExactly(queryDataSpy, null,{
                showLoading: true,
                updateChartEndpoints: true,
                transitioningChartType: false,
                metaData: 'bgSources,devices,matchedDevices,excludedDevices,queryDataCount',
                bgSource: 'cbg',
              });
            });
          });

          it('should not generate a pdf if `printDialogPDFOpts` state is not set', () => {
            const generatePDFSpy = sinon.spy(instance, 'generatePDF');

            // ensure query for initial data doesn't pollute test
            wrapper.setState({ printDialogPDFOpts: undefined })

            // Adding Data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: true, completed: false }
            }));

            // Completed adding data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: false, completed: true }
            }));

            // Ensure generatePDF not called
            sinon.assert.notCalled(generatePDFSpy);
          });

          it('should generate a pdf if `printDialogPDFOpts` state is set', () => {
            const generatePDFSpy = sinon.spy(instance, 'generatePDF');

            const pdfOpts = {
              agpBGM: {},
              agpCGM: {},
              basics: {},
              bgLog: {},
              daily: {},
              settings: {},
            }

            // ensure query for initial data doesn't pollute test
            wrapper.setState({ printDialogPDFOpts: pdfOpts })

            // Adding Data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: true, completed: false }
            }));

            // Completed adding data
            const nextProps = {
              ...props,
              addingData: { inProgress: false, completed: true }
            }

            wrapper.setProps(nextProps);

            // Ensure generatePDF is called
            sinon.assert.calledWith(generatePDFSpy, nextProps);
          });

          it('should not close the dates dialog if `datesDialogFetchingData` state is false', () => {
            const closeDatesDialogSpy = sinon.spy(instance, 'closeDatesDialog');

            // ensure query for initial data doesn't pollute test
            wrapper.setState({ datesDialogFetchingData: false })

            // Adding Data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: true, completed: false }
            }));

            // Completed adding data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: false, completed: true }
            }));

            // Ensure generatePDF not called
            sinon.assert.notCalled(closeDatesDialogSpy);
          });

          it('should close the dates dialog if `datesDialogFetchingData` state is set', () => {
            const closeDatesDialogSpy = sinon.spy(instance, 'closeDatesDialog');

            // ensure query for initial data doesn't pollute test
            wrapper.setState({ datesDialogFetchingData: true })

            // Adding Data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: true, completed: false }
            }));

            // Completed adding data
            wrapper.setProps(_.assign({}, props, {
              addingData: { inProgress: false, completed: true }
            }));

            // Ensure generatePDF is called
            sinon.assert.calledOnce(closeDatesDialogSpy);
          });
        });
      });
    });
  });

  describe('componentWillUpdate', function() {
    let windowOpenSpy;

    beforeEach(() => {
      windowOpenSpy = sinon.spy(window, 'open');
    });

    afterEach(() => {
      windowOpenSpy.restore();
    });

    context('print dialog is processing and pdf is generated', () => {
      it('should close the dialog and reset the processing and pdf options state, and open the pdf', function () {
        var props = {
          currentPatientInViewId: 40,
          isUserPatient: true,
          patient: {
            userid: 40,
            profile: {
              fullName: 'Fooey McBar'
            }
          },
          data: {
            metaData: { size: 1 },
          },
          pdf: { combined: { url: 'pdfUrl' } },
          t,
        };

        const wrapper = mount(<ThemeProvider theme={baseTheme}><PatientDataClass {...props} /></ThemeProvider>).find(PatientDataClass);
        const instance = wrapper.instance();
        const setStateSpy = sinon.spy(instance, 'setState');

        instance.setState({ printDialogProcessing: true, printDialogOpen: true });
        sinon.assert.callCount(setStateSpy, 3);
        sinon.assert.calledWith(setStateSpy, { printDialogProcessing: false });
        sinon.assert.calledWith(setStateSpy, { printDialogOpen: false, printDialogPDFOpts: null });

        sinon.assert.callCount(windowOpenSpy, 1);
        sinon.assert.calledWith(windowOpenSpy, 'pdfUrl');
      });
    });
  });

  describe('queryData', () => {
    let wrapper;
    let instance;
    let setStateSpy;

    const emptyQuery = {};

    beforeEach(() => {
      defaultProps.dataWorkerQueryDataRequest.reset();

      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();

      instance.getDaysByType = sinon.stub().returns({ next: 'next stub', prev: 'prev stub' });
      instance.getStatsByChartType = sinon.stub().returns(['stat 1', 'stat 2']);

      setStateSpy = sinon.spy(instance, 'setState');
    });

    it('should return without doing anything if `state.queryingData` is `true`', () => {
      wrapper.setState({ queryingData: true });
      setStateSpy.resetHistory();
      instance.queryData();
      sinon.assert.notCalled(setStateSpy);
    });

    it('should set the `loading` state to `options.showLoading` arg', () => {
      instance.queryData(emptyQuery, { showLoading: false });
      sinon.assert.calledWithMatch(setStateSpy, { loading: false });
    });

    it('should set the `loading` state to `true` if arg not provided', () => {
      instance.queryData(emptyQuery);
      sinon.assert.calledWithMatch(setStateSpy, { loading: true });
    });

    it('should set the `bgSource` query to `options.bgSource` arg, if provided, otherwise use the bgSource from chartPrefs state', () => {
      wrapper.setState({
        chartType: 'daily',
        chartPrefs: { daily: {  bgSource: 'cbg' } }
      });

      instance.queryData(emptyQuery, {});
      sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, { bgSource: 'cbg' });

      defaultProps.dataWorkerQueryDataRequest.resetHistory();
      wrapper.setState({
        queryingData: false,
      });

      instance.queryData(emptyQuery, { bgSource: 'smbg' });
      sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, { bgSource: 'smbg' });
    });

    it('should set the `metaData` query to `options.metaData` arg', () => {
      instance.queryData(emptyQuery, { metaData: 'latestDatumByType, size' });
      sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, { metaData: 'latestDatumByType, size' });
    });

    it('should set the `metaData` query to `bgSources,devices` if arg not provided', () => {
      instance.queryData(emptyQuery);
      sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, { metaData: 'bgSources,devices,matchedDevices,excludedDevices,queryDataCount' });
    });

    it('should set the `activeDays` query from `chartPrefs`', () => {
      wrapper.setState({
        chartType: 'trends',
        chartPrefs: { trends: { activeDays: {
          sunday: true,
          monday: true,
          tuesday: false,
          wednesday: false,
          thursday: true,
          friday: true,
          saturday: true,
        } } },
      });

      instance.queryData(emptyQuery);
      sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, { activeDays: [0,1,4,5,6] });
    });

    it('should not set the `activeDays` query if not available in `chartPrefs`', () => {
      wrapper.setState({
        chartType: 'trends',
        chartPrefs: { trends: { activeDays: undefined } },
      });

      instance.queryData(emptyQuery);
      sinon.assert.neverCalledWithMatch(defaultProps.dataWorkerQueryDataRequest, { activeDays: sinon.match.array });
    });

    context('query is provided', () => {
      it('should assign the provided query to the generated `chartQuery`', () => {
        wrapper.setState({
          endpoints: [100,200],
          chartType: 'trends',
          chartPrefs: { trends: { bgSource: 'smbg' } },
        });

        instance.queryData({ metaData: 'bar', types: 'cbg,smbg' }, { metaData: 'foo' });
        sinon.assert.calledWith(defaultProps.dataWorkerQueryDataRequest, {
          bgSource: 'smbg',
          chartType: 'trends',
          endpoints: [100,200],
          excludedDevices: [],
          excludeDaysWithoutBolus: undefined,
          forceRemountAfterQuery: undefined,
          types: 'cbg,smbg',
          metaData: 'bar',
        });
      });
    });

    context('query is not provided', () => {
      beforeEach(() => {
        wrapper.setState({ chartType: 'foo' });
      });

      it('should set `nextDays` and `prevDays` to result of `getDaysByType`', () => {
        instance.queryData();
        sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
          nextDays: 'next stub',
          prevDays: 'prev stub',
        });
      });

      it('should set `stats` to result of `getStatsByChartType`', () => {
        instance.queryData();
        sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
          stats: ['stat 1', 'stat 2'],
        });
      });

      it('should set `updateChartEndpoints` to `options.updateChartEndpoints` arg', () => {
        instance.queryData(undefined, { updateChartEndpoints: false } );
        sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
          updateChartEndpoints: false,
        });
      });

      it('should set `updateChartEndpoints` to `true` if not provided by arg and `state.chartEndpoints` not set', () => {
        instance.queryData();
        sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
          updateChartEndpoints: true,
        });
      });

      it('should set `transitioningChartType` to `options.transitioningChartType` arg', () => {
        instance.queryData(undefined, { transitioningChartType: true } );
        sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
          transitioningChartType: true,
        });
      });

      it('should set `transitioningChartType` to `false` if not provided by arg', () => {
        instance.queryData();
        sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
          transitioningChartType: false,
        });
      });

      context('basics chart', () => {
        beforeEach(() => {
          wrapper.setState({ chartType: 'basics' });
          setStateSpy.resetHistory();
        });

        it('should add `chartType` to the query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            chartType: 'basics',
          });
        });

        it('should set the `aggregationsByDate` query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            aggregationsByDate: 'basals,boluses,fingersticks,siteChanges',
          });
        });
      });

      context('daily chart', () => {
        beforeEach(() => {
          wrapper.setState({ chartType: 'daily' });
          setStateSpy.resetHistory();
        });

        it('should add `chartType` to the query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            chartType: 'daily',
          });
        });

        it('should set the `types` query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            types: {
              basal: {},
              bolus: {},
              cbg: {},
              deviceEvent: {},
              food: {},
              message: {},
              smbg: {},
              wizard: {},
            },
          });
        });

        it('should set the `fillData.adjustForDSTChanges` query to `true`', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            fillData: { adjustForDSTChanges: true },
          });
        });
      });

      context('bgLog chart', () => {
        beforeEach(() => {
          wrapper.setState({ chartType: 'bgLog' });
          setStateSpy.resetHistory();
        });

        it('should add `chartType` to the query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            chartType: 'bgLog',
          });
        });

        it('should set the `types` query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            types: {
              smbg: {},
            },
          });
        });

        it('should set the `fillData.adjustForDSTChanges` query to `false`', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            fillData: { adjustForDSTChanges: false },
          });
        });
      });

      context('trends chart', () => {
        beforeEach(() => {
          wrapper.setState({ chartType: 'trends' });
          setStateSpy.resetHistory();
        });

        it('should add `chartType` to the query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            chartType: 'trends',
          });
        });

        it('should set the `types` query', () => {
          instance.queryData();
          sinon.assert.calledWithMatch(defaultProps.dataWorkerQueryDataRequest, {
            types: {
              cbg: {},
              smbg: {},
            },
          });
        });
      });
    });
  });

  describe('toggleDaysWithoutBoluses', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should call `updateChartPrefs` with the `excludeDaysWithoutBolus` chartPrefs state toggled', () => {
      instance.setState({ chartType: 'basics' });
      const updateChartPrefsSpy = sinon.spy(instance, 'updateChartPrefs');
      instance.toggleDaysWithoutBoluses();

      sinon.assert.calledWith(updateChartPrefsSpy, {
        ...instance.state.chartPrefs,
        basics: { extentSize: 14, sections: {}, stats: { excludeDaysWithoutBolus: true } },
      });

      instance.toggleDaysWithoutBoluses();

      sinon.assert.calledWith(updateChartPrefsSpy, {
        ...instance.state.chartPrefs,
        basics: { extentSize: 14, sections: {}, stats: { excludeDaysWithoutBolus: false } },
      });
    });

    it('should track a metric when `excludeDaysWithoutBolus` set to true on basics view', () => {
      instance.setState({ chartType: 'basics' });
      instance.toggleDaysWithoutBoluses();
      sinon.assert.calledWith(defaultProps.trackMetric, 'Basics exclude days without boluses');
    });

    it('should track a metric when `excludeDaysWithoutBolus` set to true on trends view', () => {
      instance.setState({ chartType: 'trends' });
      instance.toggleDaysWithoutBoluses();
      sinon.assert.calledWith(defaultProps.trackMetric, 'Trends exclude days without boluses');
    });
  });

  describe('toggleDefaultBgRange', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should call `updateChartPrefs` with arguments needed to trigger stats and aggregations refresh', () => {
      instance.setState({ chartType: 'basics' });
      const updateChartPrefsSpy = sinon.spy(instance, 'updateChartPrefs');
      instance.toggleDefaultBgRange();
      sinon.assert.calledWith(updateChartPrefsSpy, {}, false, true, true);
    });

    it('should call `setState` with the `useDefaultRange` bgPrefs state toggled', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      instance.setState({ chartType: 'basics' });
      instance.toggleDefaultBgRange();

      sinon.assert.calledWith(setStateSpy, {
        bgPrefs:  {
          bgBounds: 'stubbed bgBounds',
          bgClasses: { low: { boundary: 70 }, target: { boundary: 180 } },
          bgUnits: 'mg/dL',
          useDefaultRange: true,
        }
      });

      instance.toggleDefaultBgRange();

      sinon.assert.calledWith(setStateSpy, {
        bgPrefs:  {
          bgBounds: 'stubbed bgBounds',
          bgClasses: { low: { boundary: 70 }, target: { boundary: 180 } },
          bgUnits: 'mg/dL',
          useDefaultRange: false
        }
      });
    });

    it('should track a metric when `useDefaultRange` set to true on basics view', () => {
      defaultProps.trackMetric.resetHistory();
      instance.setState({ chartType: 'basics' });
      instance.toggleDefaultBgRange();
      sinon.assert.calledWith(defaultProps.trackMetric, 'Basics - use default BG range');
    });

    it('should track a metric when `useDefaultRange` set to true on trends view', () => {
      defaultProps.trackMetric.resetHistory();
      instance.setState({ chartType: 'trends' });
      instance.toggleDefaultBgRange();
      sinon.assert.calledWith(defaultProps.trackMetric, 'Trends - use default BG range');
    });
  });

  describe('closeDatesDialog', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should set the `printDialogOpen` state to false and `printDialogPDFOpts` to null', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      instance.closeDatesDialog();

      sinon.assert.calledWith(setStateSpy, {
        datesDialogOpen: false,
        datesDialogProcessing: false,
        datesDialogFetchingData: false,
      });
    });
  });

  describe('closePrintDialog', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    it('should set the `printDialogOpen` state to false and `printDialogPDFOpts` to null', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      instance.closePrintDialog();

      sinon.assert.calledWith(setStateSpy, {
        printDialogOpen: false,
        printDialogPDFOpts: null,
      });
    });
  });

  describe('handleClickPrint', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    afterEach(() => {
      defaultProps.trackMetric.reset();
      defaultProps.removeGeneratedPDFS.reset();
    });

    it('should set the `printDialogOpen` state true', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      instance.handleClickPrint();

      sinon.assert.calledWith(setStateSpy, {
        printDialogOpen: true,
      });
    });

    it('should track a metric', () => {
      instance.handleClickPrint();

      sinon.assert.calledWith(defaultProps.trackMetric, 'Clicked Print', {
        fromChart: instance.state.chartType,
      });
    });

    it('should remove previously generated pdfs', () => {
      defaultProps.removeGeneratedPDFS.resetHistory();
      instance.handleClickPrint();
      sinon.assert.calledOnce(defaultProps.removeGeneratedPDFS);
    });
  });

  describe('handleClickChartDates', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
    });

    afterEach(() => {
      defaultProps.trackMetric.reset();
      defaultProps.removeGeneratedPDFS.reset();
    });

    it('should set the `datesDialogOpen` state true and `datesDialogProcessing` to false', () => {
      const setStateSpy = sinon.spy(instance, 'setState');
      instance.handleClickChartDates();

      sinon.assert.calledWith(setStateSpy, {
        datesDialogOpen: true,
        datesDialogProcessing: false,
      });
    });

    it('should track a metric', () => {
      instance.handleClickChartDates();

      sinon.assert.calledWith(defaultProps.trackMetric, 'Clicked Chart Dates', {
        fromChart: instance.state.chartType,
      });
    });
  });

  describe('generateAGPImages', () => {
    let wrapper;
    let instance;

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      instance = wrapper.instance();
      defaultProps.generateAGPImagesSuccess.resetHistory();
      defaultProps.generateAGPImagesFailure.resetHistory();
    });

    context('successful image generation', () => {
      before(() => {
        PD.__Rewire__('vizUtils', {
          agp: {
            generateAGPFigureDefinitions: sinon.stub().resolves(['stubbed image data']),
          },
        });
        PD.__Rewire__('Plotly', {
          toImage: sinon.stub().returns('stubbed image data')
        });
      });

      after(() => {
        PD.__ResetDependency__('vizUtils');
        PD.__ResetDependency__('Plotly');
      });

      it('should call generateAGPImagesSuccess with image data upon successful image generation', done => {
        instance.generateAGPImages(undefined, ['agpCGM']);
        wrapper.update();
        setTimeout(() => {
          sinon.assert.callCount(defaultProps.generateAGPImagesFailure, 0);
          sinon.assert.callCount(defaultProps.generateAGPImagesSuccess, 1);
          sinon.assert.calledWithMatch(defaultProps.generateAGPImagesSuccess, {
            agpCGM: { 0: 'stubbed image data' },
          });
          done();
        });
      });
    });

    context('failed image generation', () => {
      before(() => {
        PD.__Rewire__('vizUtils', {
          agp: {
            generateAGPFigureDefinitions: sinon.stub().rejects(new Error('failed image generation')),
          },
        });
      });

      after(() => {
        PD.__ResetDependency__('vizUtils');
      });

      it('should call generateAGPImagesFailure with error upon failed image generation', done => {
        instance.generateAGPImages(undefined, ['agpCGM']);
        wrapper.update();
        setTimeout(() => {
          sinon.assert.callCount(defaultProps.generateAGPImagesSuccess, 0);
          sinon.assert.callCount(defaultProps.generateAGPImagesFailure, 1);
          expect(defaultProps.generateAGPImagesFailure.getCall(0).lastArg.message).to.equal('failed image generation');
          done();
        });
      });
    });
  });

  describe('generatePDF', () => {
    let wrapper;
    let instance;

    const bgPrefs = { units: MGDL_UNITS };
    const timePrefs = { timezoneAware: true, timezoneName: 'US/Eastern' };
    const mostRecentDatumTimeStub = '2019-11-27T12:00:00.000Z';
    const queryEndpointsStub = [100, 200];

    const printDialogPDFOpts = {
      agpBGM: { endpoints: 'agpBGM endpoints'},
      agpCGM: { endpoints: 'agpCGM endpoints'},
      basics: { endpoints: 'basics endpoints'},
      bgLog: { endpoints: 'bgLog endpoints'},
      daily: { endpoints: 'daily endpoints'},
      settings: { endpoints: 'settings endpoints'},
    };

    const commonQueries = {
      bgPrefs,
      metaData: 'latestPumpUpload, bgSources',
      timePrefs,
    };

    beforeEach(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
      wrapper.setState({ bgPrefs, timePrefs, printDialogPDFOpts });
      instance = wrapper.instance();
      defaultProps.generatePDFRequest.resetHistory();
    });

    it('should call `props.generatePDFRequest` with appropriate args', () => {
      instance.generatePDF();
      sinon.assert.calledWith(defaultProps.generatePDFRequest,
        'combined',
        {
          agpBGM: sinon.match.object,
          agpCGM: sinon.match.object,
          basics: sinon.match.object,
          daily: sinon.match.object,
          bgLog: sinon.match.object,
          settings: sinon.match.object,
        },
        {
          patient: sinon.match(defaultProps.patient),
          agpBGM: sinon.match.object,
          agpCGM: sinon.match.object,
          basics: sinon.match.object,
          daily: sinon.match.object,
          bgLog: sinon.match.object,
          settings: sinon.match.object,
        },
      );
    });

    it('should call `props.generatePDFRequest` with exixting pdf data if available in props', () => {
      wrapper.setProps({
        ...defaultProps,
        currentPatientInViewId: 'patient123',
        pdf: { data: 'some data' },
      });

      instance.generatePDF();
      sinon.assert.calledWith(defaultProps.generatePDFRequest,
        'combined',
        {
          agpBGM: sinon.match.object,
          agpCGM: sinon.match.object,
          basics: sinon.match.object,
          daily: sinon.match.object,
          bgLog: sinon.match.object,
          settings: sinon.match.object,
        },
        {
          patient: sinon.match(defaultProps.patient),
          agpBGM: sinon.match.object,
          agpCGM: sinon.match.object,
          basics: sinon.match.object,
          daily: sinon.match.object,
          bgLog: sinon.match.object,
          settings: sinon.match.object,
        },
        'patient123',
        'some data',
      );
    });

    it('should call `props.generatePDFRequest` with current printDialogPDFOpts state if state arg is empty', () => {
      wrapper.setState({ printDialogPDFOpts: {
        ...printDialogPDFOpts,
        bgLog: { disabled: true },
        daily: { disabled: true },
        settings: { disabled: true },
      } });

      instance.generatePDF();
      sinon.assert.calledWith(defaultProps.generatePDFRequest,
        'combined',
        {
          agpBGM: sinon.match.object,
          agpCGM: sinon.match.object,
          basics: sinon.match.object,
        },
        {
          patient: sinon.match(defaultProps.patient),
          agpBGM: { endpoints: 'agpBGM endpoints' },
          agpCGM: { endpoints: 'agpCGM endpoints' },
          basics: { endpoints: 'basics endpoints' },
          bgLog: { disabled: true },
          daily: { disabled: true },
          settings: { disabled: true },
        },
      );
    });

    it('should call `props.generatePDFRequest` with passed in pdf options state overrides', () => {
      const stateOverrides = {
        printDialogPDFOpts: {
          ...printDialogPDFOpts,
          agpBGM: { disabled: true },
          agpCGM: { disabled: true },
          basics: { disabled: true },
        }
      };

      instance.generatePDF(undefined, stateOverrides);
      sinon.assert.calledWith(defaultProps.generatePDFRequest,
        'combined',
        {
          daily: sinon.match.object,
          bgLog: sinon.match.object,
          settings: sinon.match.object,
        },
        {
          patient: sinon.match(defaultProps.patient),
          agpBGM: { disabled: true },
          agpCGM: { disabled: true },
          basics: { disabled: true },
          daily: { endpoints: 'daily endpoints' },
          bgLog: { endpoints: 'bgLog endpoints' },
          settings: { endpoints: 'settings endpoints' },
        },
      );
    });

    context('generating agpCGM query', () => {
      it('should set the `endpoints` query from the `pdfOpts` arg', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpCGM.endpoints).to.eql('agpCGM endpoints');
      });

      it('should query the required `aggregationsByDate`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpCGM.aggregationsByDate).to.equal('dataByDate, statsByDate');
      });

      it('should query the required `types`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpCGM.types).to.eql({
          cbg: {},
        });
      });

      it('should query the required `stats`', () => {
        instance.getStatsByChartType = sinon.stub().returns('agpCGM stats');

        instance.generatePDF();

        sinon.assert.calledWith(instance.getStatsByChartType, 'agpCGM');

        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpCGM.stats).to.eql('agpCGM stats');
      });

      it('should query the required `bgSource` from `chartPrefs.agpCGM.bgSource` state', () => {
        wrapper.setState({ chartPrefs: { agpCGM: { bgSource: 'agpCGM bgSource' } } });
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpCGM.bgSource).to.equal('agpCGM bgSource');
      });

      it('should query the required `commonQueries`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpCGM.bgPrefs).to.eql(commonQueries.bgPrefs);
        expect(query.agpCGM.metaData).to.equal(commonQueries.metaData);
        expect(query.agpCGM.timePrefs).to.eql(commonQueries.timePrefs);
      });
    });

    context('generating agpBGM query', () => {
      it('should set the `endpoints` query from the `pdfOpts` arg', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpBGM.endpoints).to.eql('agpBGM endpoints');
      });

      it('should query the required `aggregationsByDate`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpBGM.aggregationsByDate).to.equal('dataByDate, statsByDate');
      });

      it('should query the required `types`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpBGM.types).to.eql({
          smbg: {},
        });
      });

      it('should query the required `stats`', () => {
        instance.getStatsByChartType = sinon.stub().returns('agpBGM stats');

        instance.generatePDF();

        sinon.assert.calledWith(instance.getStatsByChartType, 'agpBGM');

        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpBGM.stats).to.eql('agpBGM stats');
      });

      it('should query the required `bgSource` from `chartPrefs.agpBGM.bgSource` state', () => {
        wrapper.setState({ chartPrefs: { agpBGM: { bgSource: 'agpBGM bgSource' } } });
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpBGM.bgSource).to.equal('agpBGM bgSource');
      });

      it('should query the required `commonQueries`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.agpBGM.bgPrefs).to.eql(commonQueries.bgPrefs);
        expect(query.agpBGM.metaData).to.equal(commonQueries.metaData);
        expect(query.agpBGM.timePrefs).to.eql(commonQueries.timePrefs);
      });
    });

    context('generating basics query', () => {
      it('should set the `endpoints` query from the `pdfOpts` arg', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.basics.endpoints).to.eql('basics endpoints');
      });

      it('should query the required `aggregationsByDate`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.basics.aggregationsByDate).to.equal('basals, boluses, fingersticks, siteChanges');
      });

      it('should query the required `stats`', () => {
        instance.getStatsByChartType = sinon.stub().returns('basics stats');

        instance.generatePDF();

        sinon.assert.calledWith(instance.getStatsByChartType, 'basics');

        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.basics.stats).to.eql('basics stats');
      });

      it('should query the required `bgSource` from `chartPrefs.basics.bgSource` state', () => {
        wrapper.setState({ chartPrefs: { basics: { bgSource: 'basics bgSource' } } });
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.basics.bgSource).to.equal('basics bgSource');
      });

      it('should query the required `commonQueries`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.basics.bgPrefs).to.eql(commonQueries.bgPrefs);
        expect(query.basics.metaData).to.equal(commonQueries.metaData);
        expect(query.basics.timePrefs).to.eql(commonQueries.timePrefs);
      });
    });

    context('generating daily query', () => {
      it('should set the `endpoints` query from the `pdfOpts` arg', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.daily.endpoints).to.eql('daily endpoints');
      });

      it('should query the required `aggregationsByDate`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.daily.aggregationsByDate).to.equal('dataByDate, statsByDate');
      });

      it('should query the required `types`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.daily.types).to.eql({
          basal: {},
          bolus: {},
          cbg: {},
          deviceEvent: {},
          food: {},
          message: {},
          smbg: {},
          wizard: {},
        });
      });

      it('should query the required `stats`', () => {
        instance.getStatsByChartType = sinon.stub().returns('daily stats');

        instance.generatePDF();

        sinon.assert.calledWith(instance.getStatsByChartType, 'daily');

        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.daily.stats).to.eql('daily stats');
      });

      it('should query the required `bgSource` from `chartPrefs.daily.bgSource` state', () => {
        wrapper.setState({ chartPrefs: { daily: { bgSource: 'daily bgSource' } } });
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.daily.bgSource).to.equal('daily bgSource');
      });

      it('should query the required `commonQueries`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.daily.bgPrefs).to.eql(commonQueries.bgPrefs);
        expect(query.daily.metaData).to.equal(commonQueries.metaData);
        expect(query.daily.timePrefs).to.eql(commonQueries.timePrefs);
      });
    });

    context('generating bgLog query', () => {
      it('should set the `endpoints` query from the `pdfOpts` arg', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.bgLog.endpoints).to.eql('bgLog endpoints');
      });

      it('should query the required `aggregationsByDate`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.bgLog.aggregationsByDate).to.equal('dataByDate');
      });

      it('should query the required `types`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.bgLog.types).to.eql({
          smbg: {},
        });
      });

      it('should query the required `stats`', () => {
        instance.getStatsByChartType = sinon.stub().returns('bgLog stats');

        instance.generatePDF();

        sinon.assert.calledWith(instance.getStatsByChartType, 'bgLog');

        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.bgLog.stats).to.eql('bgLog stats');
      });

      it('should query the required `bgSource` from `chartPrefs.bgLog.bgSource` state', () => {
        wrapper.setState({ chartPrefs: { bgLog: { bgSource: 'bgLog bgSource' } } });
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.bgLog.bgSource).to.equal('bgLog bgSource');
      });

      it('should query the required `commonQueries`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.bgLog.bgPrefs).to.eql(commonQueries.bgPrefs);
        expect(query.bgLog.metaData).to.equal(commonQueries.metaData);
        expect(query.bgLog.timePrefs).to.eql(commonQueries.timePrefs);
      });
    });

    context('generating settings query', () => {
      it('should query the required `commonQueries`', () => {
        instance.generatePDF();
        const query = defaultProps.generatePDFRequest.getCall(0).args[1];
        expect(query.settings.bgPrefs).to.eql(commonQueries.bgPrefs);
        expect(query.settings.metaData).to.equal(commonQueries.metaData);
        expect(query.settings.timePrefs).to.eql(commonQueries.timePrefs);
      });
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
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
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
      PatientDataClass.prototype.handleMessageCreation.call(new BaseObject(), 'message');
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
      PatientDataClass.prototype.handleEditMessage.call(new BaseObject(), 'message');
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Edit To Message');
    });
  });

  describe('fetchEarlierData', () => {
    let wrapper;
    let instance;
    let props;
    let setStateSpy;
    let logSpy;

    beforeEach(() => {
      props = _.assign({}, defaultProps, {
        onFetchEarlierData: sinon.stub(),
        trackMetric: sinon.stub(),
        log: sinon.stub(),
      });

      wrapper = shallow(<PatientDataClass {...props} />);
      instance = wrapper.instance();

      setStateSpy = sinon.spy(instance, 'setState');
      logSpy = sinon.spy(instance, 'log');
    });

    afterEach(() => {
      props.onFetchEarlierData.reset();
      props.trackMetric.reset();
      setStateSpy.resetHistory();
      logSpy.resetHistory();
    });

    after(() => {
      setStateSpy.restore();
      logSpy.restore();
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
          noDates: false,
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
        });
      });

      it('should track the `Fetched earlier patient data` metric', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        // Should not include `clinicId` if `props.selectedClinicId` is not set
        wrapper.setProps({
          data: {
            fetchedUntil,
          },
          selectedClinicId: undefined,
        });

        expect(wrapper.state().fetchEarlierDataCount).to.equal(0);

        instance.fetchEarlierData();

        sinon.assert.calledWithExactly(props.trackMetric, 'Fetched earlier patient data', {
          count: 1,
          patientID: 'otherPatientId',
        });

        // Should include `clinicId` if `props.selectedClinicId` is set
        wrapper.setProps({
          data: {
            fetchedUntil,
          },
          selectedClinicId: 'clinic123',
        });

        instance.fetchEarlierData();

        sinon.assert.calledWithExactly(props.trackMetric, 'Fetched earlier patient data', {
          count: 2,
          patientID: 'otherPatientId',
          clinicId: 'clinic123',
        });
      });

      it('should set startDate and endDate to undefined if noDates is true', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: '40',
          data: {
            fetchedUntil,
          },
        });

        const options = {
          noDates: true,
        };

        instance.fetchEarlierData(options);

        sinon.assert.calledOnce(props.onFetchEarlierData);
        sinon.assert.calledWithMatch(props.onFetchEarlierData, {
          startDate: undefined,
          endDate: undefined,
        }, '40');
      });

      it('should call the log method', () => {
        instance.fetchEarlierData();

        sinon.assert.calledOnce(logSpy);
        sinon.assert.calledWith(logSpy, 'fetching');
      });

      it('should pass the initial option correctly', () => {
        const fetchedUntil = '2018-01-01T00:00:00.000Z';

        wrapper.setProps({
          currentPatientInViewId: '40',
          data: {
            fetchedUntil,
          },
        });

        const options = {
          initial: true,
        };

        instance.fetchEarlierData(options);

        sinon.assert.calledOnce(props.onFetchEarlierData);
        sinon.assert.calledWithMatch(props.onFetchEarlierData, {
          initial: true,
        }, '40');
      });
    });
  });

  describe('hideLoading', () => {
    let wrapper;
    let instance;
    let setStateSpy;
    let setTimeoutSpy;

    before(() => {
      wrapper = shallow(<PatientDataClass {...defaultProps} />);
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
        trackMetric: sinon.stub(),
        generatingPDF: { inProgress: false },
        pdf: {},
      };

      var elem = mount(<PatientData {...props} />).find(PatientDataClass);

      var callCount = props.trackMetric.callCount;
      elem.instance().handleSwitchToBasics();
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Basics')).to.be.true;
    });

    it('should set the `chartType` state to `basics`', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({chartType: 'daily'});

      instance.handleSwitchToBasics();
      expect(wrapper.state('chartType')).to.equal('basics');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToBasics();

      sinon.assert.calledWith(instance.getMostRecentDatumTimeByChartType, defaultProps, 'basics');
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
        t,
        generatingPDF: { inProgress: false },
        pdf: {},
      };

      var elem = mount(<PatientDataClass {...props}/>);

      var callCount = props.trackMetric.callCount;
      elem.instance().handleSwitchToDaily('2016-08-19T01:51:55.000Z', 'testing');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Basics testing calendar')).to.be.true;
    });

    it('should set the `chartType` state to `daily`', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToDaily();
      expect(wrapper.state('chartType')).to.equal('daily');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToDaily();
      sinon.assert.calledWith(instance.getMostRecentDatumTimeByChartType, defaultProps, 'daily');
      sinon.assert.calledWith(instance.getChartEndpoints, '2019-11-27T12:00:00.000Z', { chartType: 'daily' });
      sinon.assert.calledWith(instance.updateChart, 'daily', '2019-11-27T12:00:00.000Z', 'endpoints stub', {
        updateChartEndpoints: true,
        forceRemountAfterQuery: true,
      });
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the provided iso string datetime', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToDaily('2018-03-03T00:00:00.000Z');

      // Should set to previous day because the provided datetime filter is exclusive
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-02T12:00:00.000Z');
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the provided utc timestamp datetime', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToDaily(Date.parse('2018-03-03T00:00:00.000Z'));

      // Should set to previous day because the provided datetime filter is exclusive
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-02T12:00:00.000Z');
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the latest applicable datum time if provided datetime is beyond it', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns(Date.parse('2018-02-05T00:00:00.000Z'));
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      // Provide a datetime that is beyond the one returned by getMostRecentDatumTimeByChartType
      instance.handleSwitchToDaily('2018-03-03T00:00:00.000Z');
      sinon.assert.calledWith(instance.updateChart, 'daily', '2018-02-04T12:00:00.000Z', 'endpoints stub', {
        mostRecentDatetimeLocation: '2018-02-04T12:00:00.000Z',
        updateChartEndpoints: true,
        forceRemountAfterQuery: true,
      });
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
        trackMetric: sinon.stub(),
        generatingPDF: { inProgress: false },
        pdf: {},
      };

      var elem = mount(<PatientData {...props} />).find(PatientDataClass);

      var callCount = props.trackMetric.callCount;
      elem.instance().handleSwitchToTrends('2016-08-19T01:51:55.000Z');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Modal')).to.be.true;
    });

    it('should set the `chartType` state to `trends`', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToTrends();
      expect(wrapper.state('chartType')).to.equal('trends');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToTrends();
      sinon.assert.calledWith(instance.getMostRecentDatumTimeByChartType, defaultProps, 'trends');
      sinon.assert.calledWith(instance.getChartEndpoints, '2019-11-28T00:00:00.000Z', { chartType: 'trends' });
      sinon.assert.calledWith(instance.updateChart, 'trends', '2019-11-28T00:00:00.000Z', 'endpoints stub', {
        updateChartEndpoints: true
      });
    });

    it('should set the `datetimeLocation` state to the start of the next day for the provided datetime if it\'s after the very start of the day', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T12:00:00.000Z'});

      instance.handleSwitchToTrends('2018-03-03T12:00:00.000Z');
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-04T00:00:00.000Z');
    });

    it('should set the `datetimeLocation` state to the provided datetime as is if it\'s at the very start of the day', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToTrends('2018-03-03T00:00:00.000Z');
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-03T00:00:00.000Z');
    });

    it('should set the `datetimeLocation` state to the end of day for the latest applicable datum time if provided datetime is beyond it', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns(Date.parse('2018-02-04T08:00:00.000Z'));
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      // Provide a datetime that is beyond the one returned by getMostRecentDatumTimeByChartType
      instance.handleSwitchToTrends('2018-03-03T00:00:00.000Z');
      sinon.assert.calledWith(instance.updateChart, 'trends', '2018-02-05T00:00:00.000Z', 'endpoints stub', {
        mostRecentDatetimeLocation: '2018-02-04T08:00:00.000Z',
        updateChartEndpoints: true,
      });
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
        trackMetric: sinon.stub(),
        generatingPDF: { inProgress: false },
        pdf: {},
      };

      var elem = mount(<PatientData {...props} />).find(PatientDataClass);

      var callCount = props.trackMetric.callCount;
      elem.instance().handleSwitchToBgLog('2016-08-19T01:51:55.000Z');
      expect(props.trackMetric.callCount).to.equal(callCount + 1);
      expect(props.trackMetric.calledWith('Clicked Switch To Two Week')).to.be.true;
    });

    it('should set the `chartType` state to `bgLog`', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({chartType: 'basics'});

      instance.handleSwitchToBgLog();
      expect(wrapper.state('chartType')).to.equal('bgLog');
    });

    it('should call `getMostRecentDatumTimeByChartType`, `getChartEndpoints`, and then call `updateChart` with appropriate args', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();
      wrapper.setState({timePrefs: { timezoneAware: true, timezoneName: 'utc' } })

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns('2019-11-27T12:00:00.000Z');
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      instance.handleSwitchToBgLog();
      sinon.assert.calledWith(instance.getMostRecentDatumTimeByChartType, defaultProps, 'bgLog');
      sinon.assert.calledWith(instance.getChartEndpoints, '2019-11-27T12:00:00.000Z', { chartType: 'bgLog' });
      sinon.assert.calledWith(instance.updateChart, 'bgLog', '2019-11-27T12:00:00.000Z', 'endpoints stub', {
        updateChartEndpoints: true
      });
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the provided datetime', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      wrapper.setState({datetimeLocation: '2018-03-03T00:00:00.000Z'});

      instance.handleSwitchToBgLog('2018-03-03T00:00:00.000Z');

      // Should set to previous day because the provided datetime filter is exclusive
      expect(wrapper.state('datetimeLocation')).to.equal('2018-03-02T12:00:00.000Z');
    });

    it('should set the `datetimeLocation` state to noon for the previous day of the latest applicable datum time if provided datetime is beyond it', () => {
      const wrapper = shallow(<PatientDataClass {...defaultProps} />);
      const instance = wrapper.instance();

      instance.updateChart = sinon.stub();
      instance.getMostRecentDatumTimeByChartType = sinon.stub().returns(Date.parse('2018-02-05T00:00:00.000Z'));
      instance.getChartEndpoints = sinon.stub().returns('endpoints stub');

      // Provide a datetime that is beyond the one returned by getMostRecentDatumTimeByChartType
      instance.handleSwitchToBgLog('2018-03-03T00:00:00.000Z');
      sinon.assert.calledWith(instance.updateChart, 'bgLog', '2018-02-04T12:00:00.000Z', 'endpoints stub', {
        mostRecentDatetimeLocation: '2018-02-04T12:00:00.000Z',
        updateChartEndpoints: true,
      });
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
        onFetchEarlierData: sinon.stub(),
        fetchingPatient: false,
        fetchingPatientData: false,
        fetchingUser: false,
        trackMetric: sinon.stub(),
        generatingPDF: { inProgress: false },
        pdf: {},
      };

      var elem = mount(<PatientData {...props} />).find(PatientDataClass);

      var callCount = props.trackMetric.callCount;
      elem.instance().setState({
        endpoints: [100,200],
      });
      elem.instance().handleSwitchToSettings();
      expect(props.trackMetric.callCount).to.equal(callCount + 2);
      expect(props.trackMetric.calledWith('Clicked Switch To Settings')).to.be.true;
    });

    it('should set the `chartType` state to `settings`', () => {
      var props = {
        ...defaultProps,
        onFetchEarlierData: sinon.stub(),
      };
      const wrapper = shallow(<PatientDataClass {...props} />);
      const instance = wrapper.instance();

      wrapper.setState({
        chartType: 'daily',
        endpoints: [100,200],
      });

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
      match: {
        params: { id: '12345' }
      },
      location: { query: {} },
    };

    const dispatchProps = {
      fetchPatient: sinon.stub().returns('fetchPatient'),
      fetchPatientData: sinon.stub().returns('fetchPatientData'),
      fetchPendingSentInvites: sinon.stub().returns('fetchPendingSentInvites'),
      fetchAssociatedAccounts: sinon.stub().returns('fetchAssociatedAccounts'),
      fetchPatientFromClinic: sinon.stub().returns('fetchPatientFromClinic'),
      selectClinic: sinon.stub().returns('selectClinic'),
    };

    const api = {};

    afterEach(() => {
      forEach(dispatchProps, (stub) => {
        stub.resetHistory();
      });
    });

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

    it('should fetch patients from clinics if a clinician is viewing a patient without a selected clinic', () => {
      const fetchPatientsResult = getFetchers(dispatchProps, ownProps, {
        user: {
          userid: 'clinician123',
          isClinicMember: true,
        },
        clinics: {
          clinic1234: {
            patients: {},
          },
          clinic6789: {
            patients: {},
          },
        },
        selectedClinicId: null,
        fetchingPatientFromClinic: {
          inProgress: false,
        },
        fetchingPendingSentInvites: {
          inProgress: false,
          completed: true,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: true,
        },
      });

      expect(fetchPatientsResult.length).to.equal(4);
      expect(fetchPatientsResult[0]()).to.equal('fetchPatient');
      expect(fetchPatientsResult[1]()).to.equal('fetchPatientData');
      expect(fetchPatientsResult[2]()).to.equal('fetchPatientFromClinic');
      expect(fetchPatientsResult[3]()).to.equal('fetchPatientFromClinic');
    });

    it('should select correct clinic if a clinician is viewing a patient with a different selected clinic', () => {
      expect(dispatchProps.selectClinic.callCount).to.equal(0);
      const fetchPatientsResult = getFetchers(dispatchProps, ownProps, {
        user: {
          userid: 'clinician123',
          isClinicMember: true,
        },
        clinics: {
          clinic1234: {
            patients: { '12345': {} },
          },
          clinic6789: {
            patients: {},
          },
        },
        selectedClinicId: 'clinic6789',
        fetchingPatientFromClinic: {
          inProgress: false,
        },
        fetchingPendingSentInvites: {
          inProgress: false,
          completed: true,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: true,
        },
      });

      expect(fetchPatientsResult.length).to.equal(3);
      expect(fetchPatientsResult[0]()).to.equal('fetchPatient');
      expect(fetchPatientsResult[1]()).to.equal('fetchPatientData');
      expect(fetchPatientsResult[2]()).to.equal('fetchPatientFromClinic');
      expect(dispatchProps.selectClinic.callCount).to.equal(1);
      expect(dispatchProps.selectClinic.calledWith(undefined, 'clinic1234')).to.be.true;
    });

    it('should fetch patients from clinics if a clinician is viewing a patient with a different selected clinic', () => {
      expect(dispatchProps.selectClinic.callCount).to.equal(0);
      const fetchPatientsResult = getFetchers(dispatchProps, ownProps, {
        user: {
          userid: 'clinician123',
          isClinicMember: true,
        },
        clinics: {
          clinic1234: {
            patients: {},
          },
          clinic6789: {
            patients: {},
          },
        },
        selectedClinicId: 'clinic6789',
        fetchingPatientFromClinic: {
          inProgress: false,
        },
        fetchingPendingSentInvites: {
          inProgress: false,
          completed: true,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: true,
        },
      });

      expect(fetchPatientsResult.length).to.equal(5);
      expect(fetchPatientsResult[0]()).to.equal('fetchPatient');
      expect(fetchPatientsResult[1]()).to.equal('fetchPatientData');
      expect(fetchPatientsResult[2]()).to.equal('fetchPatientFromClinic');
      expect(fetchPatientsResult[3]()).to.equal('fetchPatientFromClinic');
      expect(fetchPatientsResult[4]()).to.equal('fetchPatientFromClinic');
      expect(dispatchProps.selectClinic.callCount).to.equal(0);
    });

    it('should select a clinic if a matching patient record is found', () => {
      expect(dispatchProps.selectClinic.callCount).to.equal(0);
      const selectClinicResult = getFetchers(dispatchProps, ownProps, {
        user: {
          userid: 'clinician123',
          isClinicMember: true,
        },
        clinics: {
          clinic1234: {
            patients: {},
          },
          clinic6789: {
            patients: {
              12345: {
                patient: {},
              },
            },
          },
        },
        selectedClinicId: null,
        fetchingPatientFromClinic: {
          inProgress: false,
        },
        fetchingPendingSentInvites: {
          inProgress: false,
          completed: true,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: true,
        },
      });

      expect(selectClinicResult.length).to.equal(2);
      expect(selectClinicResult[0]()).to.equal('fetchPatient');
      expect(selectClinicResult[1]()).to.equal('fetchPatientData');
      expect(dispatchProps.selectClinic.callCount).to.equal(1);
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

      it('should map working.data to data', () => {
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

      it('should map working.data to data', () => {
        expect(result.data).to.equal(state.working.data);
      });
    });
  });
});
