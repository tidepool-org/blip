/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var _ = require('lodash');
var expect = chai.expect;

import Header from '../../../../app/components/chart/header'

describe('Header', function () {
  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub(),
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;
    });

    it('should trigger onClickBack when inTransition is false and back button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var backButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-back');

      expect(props.onClickBack.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.onClickBack.callCount).to.equal(1);
    });

    it('should not trigger onClickBack when inTransition is true and back button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: true,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var backButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-back');

      expect(props.onClickBack.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.onClickBack.callCount).to.equal(0);
    });

    it('should trigger onClickTrends when trends button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var trendsButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-trends');

      expect(props.onClickTrends.callCount).to.equal(0);
      TestUtils.Simulate.click(trendsButton);
      expect(props.onClickTrends.callCount).to.equal(1);
    });

    it('should trigger onClickMostRecent when inTransition is false and mostRecent button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var mostRecentButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-most-recent');

      expect(props.onClickMostRecent.callCount).to.equal(0);
      TestUtils.Simulate.click(mostRecentButton);
      expect(props.onClickMostRecent.callCount).to.equal(1);
    });

    it('should not trigger onClickMostRecent when inTransition is true and mostRecent button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: true,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var mostRecentButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-most-recent');

      expect(props.onClickMostRecent.callCount).to.equal(0);
      TestUtils.Simulate.click(mostRecentButton);
      expect(props.onClickMostRecent.callCount).to.equal(0);
    });

    it('should trigger onClickNext when inTransition is false and next button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var nextButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-next');

      expect(props.onClickNext.callCount).to.equal(0);
      TestUtils.Simulate.click(nextButton);
      expect(props.onClickNext.callCount).to.equal(1);
    });

    it('should not trigger onClickNext when inTransition is true and next button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: true,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var nextButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-next');

      expect(props.onClickNext.callCount).to.equal(0);
      TestUtils.Simulate.click(nextButton);
      expect(props.onClickNext.callCount).to.equal(0);
    });

    it('should trigger onClickBasics when basics button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var basicsButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-basics');

      expect(props.onClickBasics.callCount).to.equal(0);
      TestUtils.Simulate.click(basicsButton);
      expect(props.onClickBasics.callCount).to.equal(1);
    });

    it('should trigger onClickOneDay when daily button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var dayButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-daily');

      expect(props.onClickOneDay.callCount).to.equal(0);
      TestUtils.Simulate.click(dayButton);
      expect(props.onClickOneDay.callCount).to.equal(1);
    });

    it('should trigger onClickBgLog when BG Log button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var bgLogButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-bgLog');

      expect(props.onClickBgLog.callCount).to.equal(0);
      TestUtils.Simulate.click(bgLogButton);
      expect(props.onClickBgLog.callCount).to.equal(1);
    });

    it('should trigger onClickSettings when settings button is clicked', function () {
      var props = {
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        },
        chartType: 'Awesome',
        inTransition: false,
        atMostRecent: false,
        title: 'Most Awesome',
        onClickBack: sinon.stub(),
        onClickBasics: sinon.stub(),
        onClickTrends: sinon.stub(),
        onClickMostRecent: sinon.stub(),
        onClickNext: sinon.stub(),
        onClickOneDay: sinon.stub(),
        onClickBgLog: sinon.stub(),
        onClickSettings: sinon.stub()
      };
      var dailyElem = React.createElement(Header, props);
      var elem = TestUtils.renderIntoDocument(dailyElem);
      expect(elem).to.be.ok;

      var settingsButton = TestUtils.findRenderedDOMComponentWithClass(elem, 'js-settings');

      expect(props.onClickSettings.callCount).to.equal(0);
      TestUtils.Simulate.click(settingsButton);
      expect(props.onClickSettings.callCount).to.equal(1);
    });
  });
});
