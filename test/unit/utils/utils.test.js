/* global chai */
/* global describe */
/* global it */
/* global context */
/* global sinon */
/* global afterEach */
/* global assert */


import _ from 'lodash';
import utils from '../../../app/core/utils';
import { DEFAULT_FILTER_THRESHOLDS, MMOLL_UNITS, MGDL_UNITS } from '../../../app/core/constants';
import releases from '../../fixtures/githubreleasefixture';
const expect = chai.expect;

describe('utils', () => {
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

  describe('formatThresholdPercentage', () => {
    it('should round for `veryLow` between 1 and 1.5 percent with 0.1 precision', () => {
      assert.deepEqual(DEFAULT_FILTER_THRESHOLDS.veryLow, ['>', 1]);

      // Should round up to threshold
      expect(utils.formatThresholdPercentage(0.0099, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('1');

      // Should not round down to threshold
      expect(utils.formatThresholdPercentage(0.0101, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('1.1');

      // Values inside custom rounding range rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.0111, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('1.1');
      expect(utils.formatThresholdPercentage(0.0149, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('1.5');

      // Values above custom rounding range rounding naturally to integer
      expect(utils.formatThresholdPercentage(0.005, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('1');
      expect(utils.formatThresholdPercentage(0.0151, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('2');

      // Values below 0.5 percent rounding with extra precision
      expect(utils.formatThresholdPercentage(0.000001, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('0.01');
      expect(utils.formatThresholdPercentage(0.00049, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('0.05');
      expect(utils.formatThresholdPercentage(0.0049, ...DEFAULT_FILTER_THRESHOLDS.veryLow)).to.equal('0.5');
    });

    it('should round for `low` between 4 and 4.5 percent with 0.1 precision', () => {
      assert.deepEqual(DEFAULT_FILTER_THRESHOLDS.low, ['>', 4]);

      // Should round up to threshold
      expect(utils.formatThresholdPercentage(0.0399, ...DEFAULT_FILTER_THRESHOLDS.low)).to.equal('4');

      // Should not round down to threshold
      expect(utils.formatThresholdPercentage(0.0401, ...DEFAULT_FILTER_THRESHOLDS.low)).to.equal('4.1');

      // Values inside custom rounding range rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.0411, ...DEFAULT_FILTER_THRESHOLDS.low)).to.equal('4.1');
      expect(utils.formatThresholdPercentage(0.0449, ...DEFAULT_FILTER_THRESHOLDS.low)).to.equal('4.5');

      // Values outside custom rounding range rounding naturally to integer
      expect(utils.formatThresholdPercentage(0.0349, ...DEFAULT_FILTER_THRESHOLDS.low)).to.equal('3');
      expect(utils.formatThresholdPercentage(0.045, ...DEFAULT_FILTER_THRESHOLDS.low)).to.equal('5');
    });

    it('should round for `target` between 69.5 and 70 percent with 0.1 precision', () => {
      assert.deepEqual(DEFAULT_FILTER_THRESHOLDS.target, ['<', 70]);

      // Should not round up to threshold
      expect(utils.formatThresholdPercentage(0.6999, ...DEFAULT_FILTER_THRESHOLDS.target)).to.equal('69.9');

      // Should round down to threshold
      expect(utils.formatThresholdPercentage(0.7001, ...DEFAULT_FILTER_THRESHOLDS.target)).to.equal('70');

      // Values inside custom rounding range rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.6951, ...DEFAULT_FILTER_THRESHOLDS.target)).to.equal('69.5');
      expect(utils.formatThresholdPercentage(0.6989, ...DEFAULT_FILTER_THRESHOLDS.target)).to.equal('69.9');

      // Values outside custom rounding range rounding naturally to integer
      expect(utils.formatThresholdPercentage(0.6949, ...DEFAULT_FILTER_THRESHOLDS.target)).to.equal('69');
      expect(utils.formatThresholdPercentage(0.705, ...DEFAULT_FILTER_THRESHOLDS.target)).to.equal('71');
    });

    it('should round for `high` between 25 and 25.5 percent with 0.1 precision', () => {
      assert.deepEqual(DEFAULT_FILTER_THRESHOLDS.high, ['>', 25]);

      // Should round up to threshold
      expect(utils.formatThresholdPercentage(0.2499, ...DEFAULT_FILTER_THRESHOLDS.high)).to.equal('25');

      // Should not round down to threshold
      expect(utils.formatThresholdPercentage(0.2501, ...DEFAULT_FILTER_THRESHOLDS.high)).to.equal('25.1');

      // Values inside custom rounding range rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.2511, ...DEFAULT_FILTER_THRESHOLDS.high)).to.equal('25.1');
      expect(utils.formatThresholdPercentage(0.2549, ...DEFAULT_FILTER_THRESHOLDS.high)).to.equal('25.5');

      // Values outside custom rounding range rounding naturally to integer
      expect(utils.formatThresholdPercentage(0.2449, ...DEFAULT_FILTER_THRESHOLDS.high)).to.equal('24');
      expect(utils.formatThresholdPercentage(0.255, ...DEFAULT_FILTER_THRESHOLDS.high)).to.equal('26');
    });

    it('should round for `veryHigh` between 5 and 5.5 percent with 0.1 precision', () => {
      assert.deepEqual(DEFAULT_FILTER_THRESHOLDS.veryHigh, ['>', 5]);

      // Should round up to threshold
      expect(utils.formatThresholdPercentage(0.0499, ...DEFAULT_FILTER_THRESHOLDS.veryHigh)).to.equal('5');

      // Should not round down to threshold
      expect(utils.formatThresholdPercentage(0.0501, ...DEFAULT_FILTER_THRESHOLDS.veryHigh)).to.equal('5.1');

      // Other values in custom rounding range rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.0511, ...DEFAULT_FILTER_THRESHOLDS.veryHigh)).to.equal('5.1');
      expect(utils.formatThresholdPercentage(0.0549, ...DEFAULT_FILTER_THRESHOLDS.veryHigh)).to.equal('5.5');

      // Values outside custom rounding range rounding naturally to integer
      expect(utils.formatThresholdPercentage(0.0449, ...DEFAULT_FILTER_THRESHOLDS.veryHigh)).to.equal('4');
      expect(utils.formatThresholdPercentage(0.055, ...DEFAULT_FILTER_THRESHOLDS.veryHigh)).to.equal('6');
    });

    it('should round for `cgmUse` between 69.5 and 70 percent with 0.1 precision', () => {
      assert.deepEqual(DEFAULT_FILTER_THRESHOLDS.cgmUse, ['<', 70]);

      // Should not round up to threshold
      expect(utils.formatThresholdPercentage(0.6999, ...DEFAULT_FILTER_THRESHOLDS.cgmUse)).to.equal('69.9');

      // Should round down to threshold
      expect(utils.formatThresholdPercentage(0.7001, ...DEFAULT_FILTER_THRESHOLDS.cgmUse)).to.equal('70');

      // Values inside custom rounding range rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.6951, ...DEFAULT_FILTER_THRESHOLDS.cgmUse)).to.equal('69.5');
      expect(utils.formatThresholdPercentage(0.6989, ...DEFAULT_FILTER_THRESHOLDS.cgmUse)).to.equal('69.9');

      // Values outside custom rounding range rounding naturally to integer
      expect(utils.formatThresholdPercentage(0.6949, ...DEFAULT_FILTER_THRESHOLDS.cgmUse)).to.equal('69');
      expect(utils.formatThresholdPercentage(0.705, ...DEFAULT_FILTER_THRESHOLDS.cgmUse)).to.equal('71');
    });

    it('should round for `timeInTargetPercentDelta` between with 0.1 precision for all values', () => {
      // the `1` sets the default precision outside of the custom rounding range to use 0.1 precision instead of nearest integer
      assert.deepEqual(DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta, ['>', 15, 1]);

      // Should round up to threshold
      expect(utils.formatThresholdPercentage(0.1499, ...DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta)).to.equal('15.0');

      // Should not round down to threshold
      expect(utils.formatThresholdPercentage(0.1501, ...DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta)).to.equal('15.1');

      // Values inside custom rounding range rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.1511, ...DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta)).to.equal('15.1');
      expect(utils.formatThresholdPercentage(0.1549, ...DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta)).to.equal('15.5');

      // Values outside custom rounding range also rounding naturally to 0.1 precision
      expect(utils.formatThresholdPercentage(0.1449, ...DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta)).to.equal('14.5');
      expect(utils.formatThresholdPercentage(0.155, ...DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta)).to.equal('15.5');
    });

    it('should round values from 0.05 to 0.5 percent with 0.1 precision', () => {
      expect(utils.formatThresholdPercentage(0.0005)).to.equal('0.1');
      expect(utils.formatThresholdPercentage(0.0041)).to.equal('0.4');
      expect(utils.formatThresholdPercentage(0.0049)).to.equal('0.5');
      expect(utils.formatThresholdPercentage(0.005)).to.equal('1');
    });

    it('should round values between 0 and 0.05 percent with 0.01 precision', () => {
      expect(utils.formatThresholdPercentage(0.0000)).to.equal('0');
      expect(utils.formatThresholdPercentage(0.00005)).to.equal('0.01');
      expect(utils.formatThresholdPercentage(0.00041)).to.equal('0.04');
      expect(utils.formatThresholdPercentage(0.00049)).to.equal('0.05');
      expect(utils.formatThresholdPercentage(0.0005)).to.equal('0.1');
    });

    it('should round numbers less than 0.005 percent up to 0.01% rather than down to zero', () => {
      expect(utils.formatThresholdPercentage(0.00001)).to.equal('0.01');
      expect(utils.formatThresholdPercentage(0.00004)).to.equal('0.01');
      expect(utils.formatThresholdPercentage(0.00005)).to.equal('0.01');
      expect(utils.formatThresholdPercentage(0.00014)).to.equal('0.01');
      expect(utils.formatThresholdPercentage(0.00015)).to.equal('0.02');
    });
  });
});
