/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';


var assert = chai.assert;
var expect = chai.expect;

// We must remember to require the base module when mocking dependencies,
// otherwise dependencies mocked will be bound to the wrong scope!
import PD, { PatientData } from '../../../app/pages/patientdata/patientdata.js';
import { mapStateToProps } from '../../../app/pages/patientdata/patientdata.js';

/**
 * Need to set window.config for config module
 */
window.config = {};

describe('PatientData', function () {
  before(() => {
    PD.__Rewire__('Basics', React.createClass({
      render: function() {
        return (<div className='fake-basics-view'></div>);
      }
    }));
  });

  after(() => {
    PD.__ResetDependency__('Basics');
  });

  it('should be exposed as a module and be of type function', function() {
    expect(PatientData).to.be.a('function');
  });

  describe('render', function() {
    it ('should not warn when required props are set', function() {
      var props = {
        clearPatientData: sinon.stub(),
        currentPatientInViewId: 'smestring',
        fetchers: [],
        fetchingPatient: false,
        fetchingPatientData: false,
        isUserPatient: false,
        onCloseMessageThread: sinon.stub(),
        onCreateMessage: sinon.stub(),
        onEditMessage: sinon.stub(),
        onFetchMessageThread: sinon.stub(),
        onRefresh: sinon.stub(),
        onSaveComment: sinon.stub(),
        patientDataMap: {},
        patientNotesMap: {},
        queryParams: {},
        trackMetric: sinon.stub(),
        uploadUrl: 'http://foo.com',
        viz: {},
      };

      console.error = sinon.spy();
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    describe('loading message', () => {
      it('should render the loading message and image when fetchingPatient is true', function() {
        var props = {
          fetchingPatient: true,
          fetchingPatientData: false
        };

        // Try out using the spread props syntax in JSX
        var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
        expect(elem).to.be.ok;

        var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-image');
        expect(x).to.be.ok;

        var y = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-message');
        expect(y).to.be.ok;
      });

      it('should render the loading message and image when fetchingPatientData is true', function() {
        var props = {
          fetchingPatient: false,
          fetchingPatientData: true
        };

        // Try out using the spread props syntax in JSX
        var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
        expect(elem).to.be.ok;

        var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-image');
        expect(x).to.be.ok;

        var y = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-message');
        expect(y).to.be.ok;
      });

      it('should render the loading message and image when both fetchingPatient and fetchingPatientData are true', function() {
        var props = {
          fetchingPatient: true,
          fetchingPatientData: true
        };

        // Try out using the spread props syntax in JSX
        var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
        expect(elem).to.be.ok;

        var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-image');
        expect(x).to.be.ok;

        var y = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-message');
        expect(y).to.be.ok;
      });

      it('should still render the loading message and image when fetching is done but data is being processed', function() {
        var props = {
          fetchingPatient: false,
          fetchingPatientData: false
        };

        // Try out using the spread props syntax in JSX
        var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
        expect(elem).to.be.ok;

        var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-image');
        expect(x).to.be.ok;

        var y = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-message');
        expect(y).to.be.ok;
      });

      // this is THE REGRESSION TEST for the "data mismatch" bug
      it('should continue to render the loading message when data has been fetched for someone else but not for current patient', () => {
        var props = {
          currentPatientInViewId: 41,
          fetchingPatient: false,
          fetchingPatientData: false
        };

        // Try out using the spread props syntax in JSX
        var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
        // bypass the actual processing function since that's not what we're testing here!
        elem.doProcessing = sinon.spy();
        elem.componentWillReceiveProps({
          patientDataMap: {
            40: [{type: 'cbg'}]
          },
          patientNotesMap: {
            40: []
          }
        });

        expect(elem.doProcessing.callCount).to.equal(0);

        var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-image');
        expect(x).to.be.ok;

        var y = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-message');
        expect(y).to.be.ok;
      });

      it('should NOT render the loading message and image when fetching is done and data is processed', function() {
        var props = {
          fetchingPatient: false,
          fetchingPatientData: false
        };

        // Try out using the spread props syntax in JSX
        var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
        expect(elem).to.be.ok;
        elem.setState({
          processingData: false
        });

        expect(() => { TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-image'); })
          .to.throw('Did not find exactly one match (found: 0) for class:patient-data-loading-image');

        expect(() => { TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-message'); })
          .to.throw('Did not find exactly one match (found: 0) for class:patient-data-loading-message');
      });
    });

    describe('no data message', () => {
      describe('logged-in user is not current patient targeted for viewing', () => {
        it ('should render the no data message when no data is present and loading and processingData are false', function() {
          var props = {
            patient: {
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false
          };

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);

          expect(elem).to.be.ok;
          elem.setState({processingData: false});

          var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message-no-data');
          expect(x).to.be.ok;

          expect(x.textContent).to.equal('Fooey McBar does not have any data yet.');
        });

        it ('should render the no data message when no data is present for current patient', function() {
          var props = {
            currentPatientInViewId: 40,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false
          };

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
          // bypass the actual processing function since that's not what we're testing here!
          elem.doProcessing = () => {
            elem.setState({
              processedPatientData: {data: []},
              processingData: false
            });
          }
          elem.componentWillReceiveProps({
            patientDataMap: {
              40: []
            },
            patientNotesMap: {
              40: []
            }
          });

          var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message-no-data');
          expect(x).to.be.ok;

          expect(x.textContent).to.equal('Fooey McBar does not have any data yet.');
        });
      });

      describe('logged-in user is viewing own data', () => {
        it ('should render the no data message when no data is present and loading and processingData are false', function() {
          var props = {
            isUserPatient: true,
            fetchingPatient: false,
            fetchingPatientData: false
          };

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
          expect(elem).to.be.ok;
          elem.setState({processingData: false});
          var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message-no-data');
          expect(x).to.be.ok;
        });

        it ('should render the no data message when no data is present for current patient', function() {
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

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
          // bypass the actual processing function since that's not what we're testing here!
          elem.doProcessing = () => {
            elem.setState({
              processedPatientData: {data: []},
              processingData: false
            });
          }
          elem.componentWillReceiveProps({
            patientDataMap: {
              40: []
            },
            patientNotesMap: {
              40: []
            }
          });

          var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-uploader-message');
          expect(x).to.be.ok;
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
            trackMetric: sinon.stub()
          };

          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
          // bypass the actual processing function since that's not what we're testing here!
          elem.doProcessing = () => {
            elem.setState({
              processedPatientData: {data: []},
              processingData: false
            });
          }
          elem.componentWillReceiveProps({
            patientDataMap: {
              40: []
            },
            patientNotesMap: {
              40: []
            }
          });

          var renderedDOMElem = ReactDOM.findDOMNode(elem);
          var links = renderedDOMElem.querySelectorAll('.patient-data-uploader-message a');

          var callCount = props.trackMetric.callCount;
          TestUtils.Simulate.click(links[0]);
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

          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
          // bypass the actual processing function since that's not what we're testing here!
          elem.doProcessing = () => {
            elem.setState({
              processedPatientData: {data: []},
              processingData: false
            });
          }
          elem.componentWillReceiveProps({
            patientDataMap: {
              40: []
            },
            patientNotesMap: {
              40: []
            }
          });

          var renderedDOMElem = ReactDOM.findDOMNode(elem);
          var links = renderedDOMElem.querySelectorAll('.patient-data-uploader-message a');

          var callCount = props.trackMetric.callCount;
          TestUtils.Simulate.click(links[1]);
          expect(props.trackMetric.callCount).to.equal(callCount + 1);
          expect(props.trackMetric.calledWith('Clicked No Data Get Blip Notes')).to.be.true;
        });
      });
    });



    describe('render data (finally!)', () => {
      describe('logged-in user is not current patient targeted for viewing', () => {
        it ('should render the default <Basics> when data is present for current patient', function() {
          var props = {
            currentPatientInViewId: 40,
            patient: {
              userid: 40,
              profile: {
                fullName: 'Fooey McBar'
              }
            },
            fetchingPatient: false,
            fetchingPatientData: false
          };

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
          // bypass the actual processing function since that's not what we're testing here!
          elem.doProcessing = () => {
            elem.setState({
              processedPatientData: {data: [{type: 'cbg'}]},
              processingData: false
            });
          }
          elem.componentWillReceiveProps({
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

      describe('logged-in user is viewing own data', () => {
        it ('should render the default <Basics> when data is present for current patient', function() {
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

          // Try out using the spread props syntax in JSX
          var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
          // bypass the actual processing function since that's not what we're testing here!
          elem.doProcessing = () => {
            elem.setState({
              processedPatientData: {data: [{type: 'cbg'}]},
              processingData: false
            });
          }
          elem.componentWillReceiveProps({
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
        working: {
          fetchingPatient: {inProgress: false, notification: null},
          fetchingPatientData: {inProgress: false, notification: null}
        }
      };
      const result = mapStateToProps({blip: state});

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should set isUserPatient to true', () => {
        expect(result.isUserPatient).to.be.true;
      });

      it('should map allUsersMap.a1b2c3 to patient', () => {
        expect(result.patient).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should pass through patientDataMap', () => {
        expect(result.patientDataMap).to.deep.equal(state.patientDataMap);
      });

      it('should pass through patientNotesMap', () => {
        expect(result.patientNotesMap).to.deep.equal(state.patientNotesMap);
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
        messageThread: [{type: 'message'}],
        working: {
          fetchingPatient: {inProgress: false, notification: null},
          fetchingPatientData: {inProgress: false, notification: null}
        }
      };
      const result = mapStateToProps({blip: state});

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should set isUserPatient to false', () => {
        expect(result.isUserPatient).to.be.false;
      });

      it('should map allUsersMap.d4e5f6 to patient', () => {
        expect(result.patient).to.deep.equal(state.allUsersMap.d4e5f6);
      });

      it('should pass through patientDataMap', () => {
        expect(result.patientDataMap).to.deep.equal(state.patientDataMap);
      });

      it('should pass through patientNotesMap', () => {
        expect(result.patientNotesMap).to.deep.equal(state.patientNotesMap);
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
