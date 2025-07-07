/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var _ = require('lodash');
var expect = chai.expect;

import { mount } from 'enzyme';
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
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var backButton = elem.find('.js-back');

      expect(props.onClickBack.callCount).to.equal(0);
      backButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var backButton = elem.find('.js-back');

      expect(props.onClickBack.callCount).to.equal(0);
      backButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var trendsButton = elem.find('.js-trends');

      expect(props.onClickTrends.callCount).to.equal(0);
      trendsButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var mostRecentButton = elem.find('.js-most-recent');

      expect(props.onClickMostRecent.callCount).to.equal(0);
      mostRecentButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var mostRecentButton = elem.find('.js-most-recent');

      expect(props.onClickMostRecent.callCount).to.equal(0);
      mostRecentButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var nextButton = elem.find('.js-next');

      expect(props.onClickNext.callCount).to.equal(0);
      nextButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var nextButton = elem.find('.js-next');

      expect(props.onClickNext.callCount).to.equal(0);
      nextButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var basicsButton = elem.find('.js-basics');

      expect(props.onClickBasics.callCount).to.equal(0);
      basicsButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var dayButton = elem.find('.js-daily');

      expect(props.onClickOneDay.callCount).to.equal(0);
      dayButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var bgLogButton = elem.find('.js-bgLog');

      expect(props.onClickBgLog.callCount).to.equal(0);
      bgLogButton.simulate('click');
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
        onClickSettings: sinon.stub(),
        onClickPrint: sinon.stub(),
        isSmartOnFhirMode: false,
      };
      var dailyElem = React.createElement(Header, props);
      var elem = mount(dailyElem);
      expect(elem).to.be.ok;

      var settingsButton = elem.find('.js-settings');

      expect(props.onClickSettings.callCount).to.equal(0);
      settingsButton.simulate('click');
      expect(props.onClickSettings.callCount).to.equal(1);
    });

    describe('Print button behavior', function() {
      it('should render print button when not in Smart on FHIR mode', function () {
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
          chartType: 'daily',
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
          onClickPrint: sinon.stub(),
          isSmartOnFhirMode: false,
        };
        var dailyElem = React.createElement(Header, props);
        var elem = mount(dailyElem);

        var printButton = elem.find('.printview-print-icon');
        expect(printButton).to.have.length(1);
      });

      it('should not render print button when in Smart on FHIR mode', function () {
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
          chartType: 'daily',
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
          onClickPrint: sinon.stub(),
          isSmartOnFhirMode: true, // In Smart on FHIR mode
        };

        var dailyElem = React.createElement(Header, props);
        var elem = mount(dailyElem);

        var printButton = elem.find('.printview-print-icon');
        expect(printButton).to.have.length(0);
      });

      it('should trigger onClickPrint when print button is clicked and not in Smart on FHIR mode', function () {
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
          chartType: 'daily',
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
          onClickPrint: sinon.stub(),
          isSmartOnFhirMode: false, // Not in Smart on FHIR mode
        };

        var dailyElem = React.createElement(Header, props);
        var elem = mount(dailyElem);

        var printButton = elem.find('.printview-print-icon');
        expect(props.onClickPrint.callCount).to.equal(0);
        printButton.simulate('click');
        expect(props.onClickPrint.callCount).to.equal(1);
      });
    });
  });
});
