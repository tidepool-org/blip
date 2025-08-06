/* global chai */
/* global describe */
/* global it */
/* global context */
/* global sinon */
/* global after */
/* global afterEach */
/* global assert */


import _ from 'lodash';
import utils from '../../../app/core/utils';
import { MMOLL_UNITS, MGDL_UNITS } from '../../../app/core/constants';
import releases from '../../fixtures/githubreleasefixture';
const expect = chai.expect;

describe('utils', () => {
  after(() => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
    Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true });
  });

  describe('capitalize', () => {
    it('should return a capitalized string', () => {
      expect(utils.capitalize('lower')).to.equal('Lower');
    });

    it('should return a string if already capitalized', () => {
      expect(utils.capitalize('Upper')).to.equal('Upper');
    });

    it('should return an empty string if given one', () => {
      expect(utils.capitalize('')).to.equal('');
    });
  });

  describe('getIn', () => {
    var obj = {a: {b: 1, l: [1]}};

    it('should return value when properties exist', () => {
      var result = utils.getIn(obj, ['a', 'b']);
      expect(result).to.equal(1);
    });

    it('should return length property of arrays', () => {
      var result = utils.getIn(obj, ['a', 'l', 'length']);
      expect(result).to.equal(1);
    });

    it('should return undefined when a property is not found', () => {
      var result = utils.getIn(obj, ['a', 'c']);
      expect(result).to.be.undefined;
    });

    it('should return supplied default when a property is not found', () => {
      var result = utils.getIn(obj, ['a', 'c'], 1);
      expect(result).to.equal(1);
    });

    it('should allow default value to be an object', () => {
      var result = utils.getIn(obj, ['a', 'c'], {d: 1});
      expect(result).to.deep.equal({d: 1});
    });

    it('should return object if property list is empty', () => {
      var result = utils.getIn(obj, []);
      expect(result).to.deep.equal(obj);
    });

    it('should return object no property list given', () => {
      var result = utils.getIn(obj);
      expect(result).to.deep.equal(obj);
    });

    it('should return undefined if value given is not an object', () => {
      var result = utils.getIn(null, ['a', 'b']);
      expect(result).to.be.undefined;
    });
  });

  const USER_AGENTS = {
    chromeWin: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    chromeIPad: 'Mozilla/5.0 (iPad; CPU OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/133.0.6943.33 Mobile/15E148 Safari/604.1',
    chromeIPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/133.0.6943.33 Mobile/15E148 Safari/604.1',
    chromeAndroid: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.49 Mobile Safari/537.36',

    firefoxWin: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
    firefoxMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:135.0) Gecko/20100101 Firefox/135.0',
    firefoxIPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/135.0 Mobile/15E148 Safari/605.1.15',
    firefoxAndroid: 'Mozilla/5.0 (Android 15; Mobile; rv:135.0) Gecko/135.0 Firefox/135.0',

    edgeWin: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/131.0.2903.86',
    edgeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/131.0.2903.86',
    edgeAndroid: 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.49 Mobile Safari/537.36 EdgA/131.0.2903.87',
    edgeIPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/131.2903.92 Mobile/15E148 Safari/605.1.15',

    safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15',
    safariIPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
    safariIPad: 'Mozilla/5.0 (iPad; CPU OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1',
  };

  describe('isSupportedBrowser', () => {
    it('returns true for only supported devices', () => {
      _.each(Object.values(USER_AGENTS), userAgent => {
        Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true });

        switch(userAgent) {
          case USER_AGENTS.chromeWin:
          case USER_AGENTS.chromeMac:
          case USER_AGENTS.chromeIPad:
          case USER_AGENTS.chromeIPhone:
          case USER_AGENTS.chromeAndroid:
          case USER_AGENTS.edgeWin:
          case USER_AGENTS.edgeMac:
          case USER_AGENTS.edgeAndroid:
          case USER_AGENTS.edgeIPhone:
          case USER_AGENTS.safariIPhone:
          case USER_AGENTS.safariIPad:
            expect(utils.isSupportedBrowser()).to.be.true;
            break;

          case USER_AGENTS.firefoxWin:
          case USER_AGENTS.firefoxMac:
          case USER_AGENTS.firefoxIPhone:
          case USER_AGENTS.firefoxAndroid:
          case USER_AGENTS.safariMac:
            expect(utils.isSupportedBrowser()).to.be.false;
            break;

          default:
            throw new Error('Each string in USER_AGENTS should have an expected result in the test');
        }
      });
    });
  });

  describe('isMobile', () => {
    it('returns true for only supported devices', () => {
      _.each(Object.values(USER_AGENTS), userAgent => {
        Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true });

        switch(userAgent) {
          case USER_AGENTS.chromeIPad:
          case USER_AGENTS.chromeIPhone:
          case USER_AGENTS.chromeAndroid:
          case USER_AGENTS.edgeAndroid:
          case USER_AGENTS.edgeIPhone:
          case USER_AGENTS.safariIPhone:
          case USER_AGENTS.safariIPad:
          case USER_AGENTS.firefoxIPhone:
          case USER_AGENTS.firefoxAndroid:
            expect(utils.isMobile()).to.be.true;
            break;

          case USER_AGENTS.chromeWin:
          case USER_AGENTS.chromeMac:
          case USER_AGENTS.edgeWin:
          case USER_AGENTS.edgeMac:
          case USER_AGENTS.firefoxWin:
          case USER_AGENTS.firefoxMac:
          case USER_AGENTS.safariMac:
            expect(utils.isMobile()).to.be.false;
            break;

          default:
            throw new Error('Each string in USER_AGENTS should have an expected result in the test');
        }
      });
    });
  });

  describe('validateEmail', () => {
    it('should validate jane@tidepool.org as email', () => {
      expect(utils.validateEmail('jane@tidepool.org')).to.be.true;
    });

    it('should validate jane+skip@tidepool.org as email', () => {
      expect(utils.validateEmail('jane+skip@tidepool.org')).to.be.true;
    });

    it('should validate jane@tidepool.io as email', () => {
      expect(utils.validateEmail('jane@tidepool.io')).to.be.true;
    });

    it('should validate jane.smith@c.co.uk as email', () => {
      expect(utils.validateEmail('jane.smith@c.co.uk')).to.be.true;
    });

    it('should validate p@b.com as email', () => {
      expect(utils.validateEmail('p@b.com')).to.be.true;
    });

    it('should validate frank_b@google.com as email', () => {
      expect(utils.validateEmail('frank_b@google.com')).to.be.true;
    });

    it('should validate test123@test123.co as email', () => {
      expect(utils.validateEmail('test123@test123.co')).to.be.true;
    });

    it('should validate jane@ as email', () => {
      expect(utils.validateEmail('jane@')).to.be.false;
    });

    it('should validate jane@linkedin as email', () => {
      expect(utils.validateEmail('jane@linkedin')).to.be.false;
    });

    it('should validate jane@linkedin. as email', () => {
      expect(utils.validateEmail('jane@linkedin.')).to.be.false;
    });

    it('should validate jane as email', () => {
      expect(utils.validateEmail('jane')).to.be.false;
    });
  });

  describe('getDonationAccountCodeFromEmail', () => {
    it('should return a data donation code from an matching email', () => {
      expect(utils.getDonationAccountCodeFromEmail('bigdata+NSF@tidepool.org')).to.equal('NSF');
    });

    it('should return a null from a non matching email', () => {
      expect(utils.getDonationAccountCodeFromEmail('user@tidepool.org')).to.be.null;
    });
  });

  describe('getSignupEmail', () => {
    it('should return email from location object', () => {
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal('jane@tidepool.org');
    });

    it('should handle conversion of space to plus', () => {
      var location = {
        query: {
          signupEmail: 'jane skip@tidepool.org'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal('jane+skip@tidepool.org');
    });

    it('should return null if no argument given', () => {
      expect(utils.getSignupEmail()).to.equal(null);
    });

    it('should return null if no query property', () => {
      expect(utils.getSignupEmail({})).to.equal(null);
    });

    it('should return null if no signupEmail in query property', () => {
      var location = {
        query: {
          signupKey: 'someKey'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal(null);
    });

    it('should return null if signupEmail is not valid', () => {
      var location = {
        query: {
          signupEmail: 'notgood@'
        }
      };
      expect(utils.getSignupEmail(location)).to.equal(null);
    });
  });

  describe('getInviteKey', () => {
    it('should return invite key from query property of location object', () => {
      var location = {
        query: {
          inviteKey: '1234567890abcdef'
        }
      };
      expect(utils.getInviteKey(location)).to.equal('1234567890abcdef');
    });

    it('should return empty string if no location object', () => {
      expect(utils.getInviteKey()).to.equal('');
    });

    it('should return empty string if no query property of location object', () => {
      expect(utils.getInviteKey({})).to.equal('');
    });

    it('should return empty string if no inviteKey in query property of location object', () => {
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getInviteKey(location)).to.equal('');
    });
  });

  describe('getRoles', () => {
    it('should return roles from query property of location object', () => {
      var location = {
        query: {
          roles: 'zero'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal(['zero']);
    });

    it('should return multiple roles from query property of location object', () => {
      var location = {
        query: {
          roles: 'one,two,three'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal(['one', 'two', 'three']);
    });

    it('should return multiple roles from query property of location object with whitespace removed', () => {
      var location = {
        query: {
          roles: ' ,  ,, four, ,  , five ,,  , ,six,, ,'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal(['four', 'five', 'six']);
    });

    it('should return empty array if no usable roles in query property of location object', () => {
      var location = {
        query: {
          roles: ' ,  ,,,  , '
        }
      };
      expect(utils.getRoles(location)).to.deep.equal([]);
    });

    it('should return empty array if empty roles in query property of location object', () => {
      var location = {
        query: {
          roles: ''
        }
      };
      expect(utils.getRoles(location)).to.deep.equal([]);
    });

    it('should return empty array if no location object', () => {
      expect(utils.getRoles()).to.deep.equal([]);
    });

    it('should return empty array if no query property of location object', () => {
      expect(utils.getRoles({})).to.deep.equal([]);
    });

    it('should return empty array if no roles in query property of location object', () => {
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getRoles(location)).to.deep.equal([]);
    });
  });

  describe('getCarelink', () => {
    it('should return carelink from query property of location object', () => {
      var location = {
        query: {
          carelink: 'true'
        }
      };
      expect(utils.getCarelink(location)).to.equal('true');
    });

    it('should return empty string if empty carelink in query property of location object', () => {
      var location = {
        query: {
          carelink: ''
        }
      };
      expect(utils.getCarelink(location)).to.equal('');
    });

    it('should return null if no location object', () => {
      expect(utils.getCarelink()).to.equal(null);
    });

    it('should return null if no query property of location object', () => {
      expect(utils.getCarelink({})).to.equal(null);
    });

    it('should return null if no carelink in query property of location object', () => {
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getCarelink(location)).to.equal(null);
    });
  });

  describe('getDexcom', () => {
    it('should return dexcom from query property of location object', () => {
      var location = {
        query: {
          dexcom: 'true'
        }
      };
      expect(utils.getDexcom(location)).to.equal('true');
    });

    it('should return empty string if empty dexcom in query property of location object', () => {
      var location = {
        query: {
          dexcom: ''
        }
      };
      expect(utils.getDexcom(location)).to.equal('');
    });

    it('should return null if no location object', () => {
      expect(utils.getDexcom()).to.equal(null);
    });

    it('should return null if no query property of location object', () => {
      expect(utils.getDexcom({})).to.equal(null);
    });

    it('should return null if no dexcom in query property of location object', () => {
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getDexcom(location)).to.equal(null);
    });
  });

  describe('getMedtronic', () => {
    it('should return medtronic from query property of location object', () => {
      var location = {
        query: {
          medtronic: 'true'
        }
      };
      expect(utils.getMedtronic(location)).to.equal('true');
    });

    it('should return empty string if empty medtronic in query property of location object', () => {
      var location = {
        query: {
          medtronic: ''
        }
      };
      expect(utils.getMedtronic(location)).to.equal('');
    });

    it('should return null if no location object', () => {
      expect(utils.getMedtronic()).to.equal(null);
    });

    it('should return null if no query property of location object', () => {
      expect(utils.getMedtronic({})).to.equal(null);
    });

    it('should return null if no medtronic in query property of location object', () => {
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getMedtronic(location)).to.equal(null);
    });
  });


  describe('getCBGFilter', () => {
    it('should return cbgFilter from query property of location object', () => {
      var location = {
        query: {
          cbgFilter: 'true'
        }
      };
      expect(utils.getCBGFilter(location)).to.equal('true');
    });

    it('should return empty string if empty cbgFilter in query property of location object', () => {
      var location = {
        query: {
          cbgFilter: ''
        }
      };
      expect(utils.getCBGFilter(location)).to.equal('');
    });

    it('should return null if no location object', () => {
      expect(utils.getCBGFilter()).to.equal(null);
    });

    it('should return null if no query property of location object', () => {
      expect(utils.getCBGFilter({})).to.equal(null);
    });

    it('should return null if no cbgFilter in query property of location object', () => {
      var location = {
        query: {
          signupEmail: 'jane@tidepool.org'
        }
      };
      expect(utils.getCBGFilter(location)).to.equal(null);
    });
  });

  describe('translateBg', () => {
    it('should translate a BG value to the desired target unit', () => {
      expect(utils.translateBg(180, MMOLL_UNITS)).to.equal(10);
      expect(utils.translateBg(10, MGDL_UNITS)).to.equal(180);
    });
  });

  describe('roundToNearest', () => {
    it('should round provided value to nearest specified increment', () => {
      expect(utils.roundToNearest(1.355, .01)).to.equal(1.36);
      expect(utils.roundToNearest(1.355, .1)).to.equal(1.4);
      expect(utils.roundToNearest(1.355, 1)).to.equal(1);
    });
  });

  describe('roundBgTarget', () => {
    it('should round a target BG value as appropriate', () => {
      // to the nearest 5 for mg/dL
      expect(utils.roundBgTarget(178.15, MGDL_UNITS)).to.equal(180);
      expect(utils.roundBgTarget(172, MGDL_UNITS)).to.equal(170);

      // to the nearest .1 for mmol/L
      expect(utils.roundBgTarget(3.91, MMOLL_UNITS)).to.equal(3.9);
      expect(utils.roundBgTarget(3.96, MMOLL_UNITS)).to.equal(4);
    });
  });

  describe('getTimePrefsForDataProcessing', () => {
    const latestTimeZone = { name: 'US/Pacific', message: 'a message' };

    const queryParams = {};

    context('Timezone provided from queryParam', () => {
      it('should set a valid timezone from a query param', () => {
        const queryParamsWithValidTimezone = _.assign({}, queryParams, { timezone: 'UTC' });
        expect(utils.getTimePrefsForDataProcessing(latestTimeZone, queryParamsWithValidTimezone)).to.eql({
          timezoneAware: true,
          timezoneName: 'UTC',
        });
      });

      it('should fall back to timezone unaware when given an invalid timezone', () => {
        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: 'Europe/Budapest' };
          },
        });

        const queryParamsWithInvalidTimezone = _.assign({}, queryParams, { timezone: 'invalid' });

        expect(utils.getTimePrefsForDataProcessing(latestTimeZone, queryParamsWithInvalidTimezone)).to.eql({
          timezoneAware: false,
        });

        DateTimeFormatStub.restore();
      });
    });

    context('Timezone provided from latest time zone', () => {
      it('should set a valid timezone from `latestTimeZone.name` if provided', () => {
        expect(utils.getTimePrefsForDataProcessing(latestTimeZone, queryParams)).to.eql({
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        });
      });


      it('should fall back to browser time when given an invalid timezone', () => {
        const invalidLatestTimeZone = { name: 'invalid', message: 'a message' };

        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: 'Europe/Budapest' };
          },
        });

        expect(utils.getTimePrefsForDataProcessing(invalidLatestTimeZone, queryParams)).to.eql({
          timezoneAware: true,
          timezoneName: 'Europe/Budapest',
        });

        DateTimeFormatStub.restore();
      });

      it('should fall back to timezone-naive display time when given an invalid timezone and cannot determine timezone from browser', () => {
        const invalidLatestTimeZone = { name: 'invalid', message: 'a message' };

        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: undefined };
          },
        });

        expect(utils.getTimePrefsForDataProcessing(invalidLatestTimeZone, queryParams)).to.eql({
          timezoneAware: false,
        });

        DateTimeFormatStub.restore();
      });
    });

    context('Timezone not provided from query params or latestTimeZone', () => {
      it('should fall back to browser timezone if available', () => {
        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: 'Europe/Budapest' };
          },
        });

        expect(utils.getTimePrefsForDataProcessing(undefined, {})).to.eql({
          timezoneAware: true,
          timezoneName: 'Europe/Budapest',
        });

        DateTimeFormatStub.restore();
      });

      it('should return `undefined` when browser timezone is not available', () => {
        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: undefined };
          },
        });

        expect(utils.getTimePrefsForDataProcessing(undefined, {})).to.be.undefined;

        DateTimeFormatStub.restore();
      });
    });
  });

  describe('stripTrailingSlash', function() {
    it('should strip a trailing forward slash from a string', function() {
      const url = '/my-path/sub-path/';
      expect(utils.stripTrailingSlash(url)).to.equal('/my-path/sub-path');
    });
  });

  describe('getUploaderDownloadURL', function() {
    it('should return the correct uploader download URL including the latest github release', function() {
      expect(utils.getUploaderDownloadURL(releases)).to.deep.equal({
        latestWinRelease: 'https://github.com/tidepool-org/uploader/releases/latest/download/tidepool-uploader-setup-2.0.2.exe',
        latestMacRelease: 'https://github.com/tidepool-org/uploader/releases/latest/download/tidepool-uploader-2.0.2.dmg',
      });
    });
  });

  describe('readableStatName', function() {
    it('should return a readable name for stats, and fall back to the argument provided if no readable name exists', function() {
      expect(utils.readableStatName('readingsInRange')).to.equal('Readings in range');
      expect(utils.readableStatName('timeInAuto')).to.equal('Time in automation');
      expect(utils.readableStatName('timeInOverride')).to.equal('Time in activity');
      expect(utils.readableStatName('timeInRange')).to.equal('Time in range');
      expect(utils.readableStatName('totalInsulin')).to.equal('Insulin ratio');
      expect(utils.readableStatName('foo')).to.equal('foo');
    });
  });

  describe('readableChartName', function() {
    it('should return a readable name for charts, and fall back to the argument provided if no readable name exists', function() {
      expect(utils.readableChartName('basics')).to.equal('Basics');
      expect(utils.readableChartName('bgLog')).to.equal('BG log');
      expect(utils.readableChartName('daily')).to.equal('Daily');
      expect(utils.readableChartName('trends')).to.equal('Trends');
      expect(utils.readableChartName('bar')).to.equal('bar');
    });
  });

  describe('formatDecimal', function() {
    it('should format a float to the provided precision, or nearest integer if no precision provided', function() {
      expect(utils.formatDecimal(1.23456, 2)).to.equal('1.23');
      expect(utils.formatDecimal(1.23456, 3)).to.equal('1.235');
      expect(utils.formatDecimal(1.23456)).to.equal('1');
    });

    it('should round to nearest whole integer when precision not specified', () => {
      expect(utils.formatDecimal(3.85)).to.equal('4');
    });

    it('should utilize use bankers rounding', () => {
      expect(utils.formatDecimal(3.85, 1)).to.equal('3.8');
      expect(utils.formatDecimal(3.75, 1)).to.equal('3.8');
      expect(utils.formatDecimal(3.05, 1)).to.equal('3.0');
      expect(utils.formatDecimal(3, 1)).to.equal('3.0');
    });
  });

  describe('roundToPrecision', function() {
    it('should round a float naturally to the provided precision, or 1 decimal place if no precision provided', function() {
      expect(utils.roundToPrecision(1.23456, 2)).to.equal(1.23);
      expect(utils.roundToPrecision(1.23456, 3)).to.equal(1.235);
      expect(utils.roundToPrecision(1.23456, 1)).to.equal(1.2);
      expect(utils.roundToPrecision(1.23456)).to.equal(1);
    });
  });

  describe('roundUp', function() {
    it('should round a float up to the provided precision, or 1 decimal place if no precision provided', function() {
      expect(utils.roundUp(1.23456, 2)).to.equal(1.24);
      expect(utils.roundUp(1.23456, 3)).to.equal(1.235);
      expect(utils.roundUp(1.23456, 1)).to.equal(1.3);
      expect(utils.roundUp(1.23456)).to.equal(2);
    });
  });

  describe('roundDown', function() {
    it('should round a float up to the provided precision, or 1 decimal place if no precision provided', function() {
      expect(utils.roundDown(1.23456, 2)).to.equal(1.23);
      expect(utils.roundDown(1.23456, 3)).to.equal(1.234);
      expect(utils.roundDown(1.56456, 1)).to.equal(1.5);
      expect(utils.roundDown(1.53456)).to.equal(1);
    });
  });

  describe('parseDatetimeParamToInteger', () => {
    it('returns null when falsy or nullish arg provided', () => {
      expect(utils.parseDatetimeParamToInteger()).to.be.null;
      expect(utils.parseDatetimeParamToInteger(null)).to.be.null;
    });

    it('returns the arg unchanged when it is already an integer', () => {
      expect(utils.parseDatetimeParamToInteger(1234567890)).to.equal(1234567890);
    });

    it('returns the arg as an integer when it is a string', () => {
      expect(utils.parseDatetimeParamToInteger('001234567890')).to.equal(1234567890);
    });

    it('parses the arg as an ISO string to unix timestamp', () => {
      expect(utils.parseDatetimeParamToInteger('2017-01-01T00:00:00.000Z')).to.equal(1483228800000);
    });

    it('returns null if the arg is not a valid date string', () => {
      expect(utils.parseDatetimeParamToInteger('not-a-date')).to.be.null;
    });
  });

  describe('compareLabels', function() {
    it('Sorts a blank arg first', function() {
      expect(utils.compareLabels(undefined, undefined)).to.equal(0);
      expect(utils.compareLabels('', undefined)).to.equal(0);
      expect(utils.compareLabels(undefined, '')).to.equal(0);
      expect(utils.compareLabels(undefined, 'test')).to.equal(-1);
      expect(utils.compareLabels('', 'test')).to.equal(-1);
      expect(utils.compareLabels('test', undefined)).to.equal(1);
      expect(utils.compareLabels('test', '')).to.equal(1);
    });

    it('Sorts numerically rather than lexicographically', () => {
      let arr = ['Tag 12', 'Tag 8', 'Tag 9a', 'Tag 9'];
      arr.sort((a, b) => utils.compareLabels(a, b));

      expect(arr).to.eql(['Tag 8', 'Tag 9', 'Tag 9a', 'Tag 12']);
    });

    it('Sorts base characters ahead of variant characters', () => {
      let arr = ['café', 'cafe'];
      arr.sort((a, b) => utils.compareLabels(a, b));

      expect(arr).to.eql(['cafe', 'café']);
    });

    it('Sorts uppercase characters ahead of lowercase characters', () => {
      let arr = ['john', 'jOhn', 'John'];
      arr.sort((a, b) => utils.compareLabels(a, b));

      expect(arr).to.eql(['John', 'jOhn', 'john']);
    });
  });
});
