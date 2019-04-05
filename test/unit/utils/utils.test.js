/* global chai */
/* global describe */
/* global it */
/* global context */
/* global sinon */

import _ from 'lodash';
import utils from '../../../app/core/utils';
import { MMOLL_UNITS, MGDL_UNITS } from '../../../app/core/constants';
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

  describe('getTimezoneForDataProcessing', () => {
    const data = [
      { type: 'upload', time: '2018-01-02T00:00:00.000Z', timezone: 'US/Eastern' },
      { type: 'smbg', time: '2018-01-10T00:00:00.000Z', timezone: 'US/Central' },
      { type: 'upload', time: '2018-02-02T00:00:00.000Z', timezone: 'US/Pacific' },
    ];

    const queryParams = {};

    context('Timezone provided from queryParam', () => {
      it('should set a valid timezone from a query param', () => {
        const queryParamsWithValidTimezone = _.assign({}, queryParams, { timezone: 'UTC' });
        expect(utils.getTimezoneForDataProcessing(data, queryParamsWithValidTimezone)).to.eql({
          timezoneAware: true,
          timezoneName: 'UTC',
        });
      });

      it('should fall back to browser time when given an invalid timezone', () => {
        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: 'Europe/Budapest' };
          },
        });

        const queryParamsWithInvalidTimezone = _.assign({}, queryParams, { timezone: 'invalid' });

        expect(utils.getTimezoneForDataProcessing(data, queryParamsWithInvalidTimezone)).to.eql({
          timezoneAware: true,
          timezoneName: 'Europe/Budapest',
        });

        DateTimeFormatStub.restore();
      });

      it('should fall back to timezone-naive display time when given an invalid timezone and cannot determine timezone from browser', () => {
        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: undefined };
          },
        });

        const queryParamsWithInvalidTimezone = _.assign({}, queryParams, { timezone: 'invalid' });

        expect(utils.getTimezoneForDataProcessing(data, queryParamsWithInvalidTimezone)).to.eql({});

        DateTimeFormatStub.restore();
      });
    });

    context('Timezone provided from most recent upload', () => {
      it('should set a valid timezone from a query param', () => {
        expect(utils.getTimezoneForDataProcessing(data, queryParams)).to.eql({
          timezoneAware: true,
          timezoneName: 'US/Pacific',
        });
      });

      it('should fall back to browser time when given an invalid timezone', () => {
        const dataWithInvalidTimezone = data.slice();
        dataWithInvalidTimezone.push({
          type: 'upload',
          time: '2018-02-10T00:00:00.000Z',
          timezone: 'invalid',
        });

        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: 'Europe/Budapest' };
          },
        });

        expect(utils.getTimezoneForDataProcessing(dataWithInvalidTimezone, queryParams)).to.eql({
          timezoneAware: true,
          timezoneName: 'Europe/Budapest',
        });

        DateTimeFormatStub.restore();
      });

      it('should fall back to timezone-naive display time when given an invalid timezone and cannot determine timezone from browser', () => {
        const dataWithInvalidTimezone = data.slice();
        dataWithInvalidTimezone.push({
          type: 'upload',
          time: '2018-02-10T00:00:00.000Z',
          timezone: 'invalid',
        });

        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: undefined };
          },
        });

        expect(utils.getTimezoneForDataProcessing(dataWithInvalidTimezone, queryParams)).to.eql({});

        DateTimeFormatStub.restore();
      });
    });

    context('Timezone not provided from query params or most recent upload', () => {
      it('should fall back to browser timezone if available', () => {
        const DateTimeFormatStub = sinon.stub(Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => {
            return { timeZone: 'Europe/Budapest' };
          },
        });

        expect(utils.getTimezoneForDataProcessing([], {})).to.eql({
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

        expect(utils.getTimezoneForDataProcessing([], {})).to.be.undefined;

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

  describe('getLatestGithubRelease', function() {
    it('should return the latest github release from a list of releases', function() {
      expect(utils.getLatestGithubRelease(releases)).to.deep.equal({
        latestWinRelease: 'https://github.com/tidepool-org/chrome-uploader/releases/download/v2.0.2/tidepool-uploader-setup-2.0.2.exe',
        latestMacRelease: 'https://github.com/tidepool-org/chrome-uploader/releases/download/v2.0.2/tidepool-uploader-2.0.2.dmg',
      });
    });
  });

  describe('getDiabetesDataRange', () => {
    it('should return the range and count of diabetes data in a raw data set', () => {
      const data = [
        {
          type: 'upload',
          time: '2018-03-01T00:00:00.000Z',
        },
        {
          type: 'setting',
          time: '2017-02-18T00:00:00.000Z',
        },
        {
          type: 'basal',
          time: '2018-02-14T00:00:00.000Z',
        },
        {
          type: 'wizard',
          time: '2018-02-01T00:00:00.000Z',
        },
        {
          type: 'smbg',
          time: '2018-02-20T00:00:00.000Z',
        },
        {
          type: 'cbg',
          time: '2018-02-02T00:00:00.000Z',
        },
      ];

      expect(utils.getDiabetesDataRange(data)).to.deep.equal({
        start: '2018-02-01T00:00:00.000Z',
        end: '2018-02-20T00:00:00.000Z',
        spanInDays: 19,
        count: 4,
      });
    });
  });

  describe('getLatestPumpSettings', () => {
    const data = [
      {
        type: 'upload',
        uploadId: 'upload123',
        time: '2018-03-01T00:00:00.000Z',
      },
      {
        type: 'pumpSettings',
        id: 'latestSettings123',
        uploadId: 'upload123',
        time: '2017-02-18T00:00:00.000Z',
      },
      {
        type: 'cbg',
        uploadId: 'upload123',
        time: '2018-02-02T00:00:00.000Z',
      },
      {
        type: 'pumpSettings',
        id: 'oldSettings123',
        uploadId: 'upload123',
        time: '2017-01-10T00:00:00.000Z',
      },
    ];

    it('should get the latest pump settings data in a randomly-ordered raw data set', () => {
      expect(utils.getLatestPumpSettings(data).latestPumpSettings).to.deep.equal({
        type: 'pumpSettings',
        id: 'latestSettings123',
        uploadId: 'upload123',
        time: '2017-02-18T00:00:00.000Z',
      });

      expect(utils.getLatestPumpSettings([...data].reverse()).latestPumpSettings).to.deep.equal({
        type: 'pumpSettings',
        id: 'latestSettings123',
        uploadId: 'upload123',
        time: '2017-02-18T00:00:00.000Z',
      });
    });

    it('should return `undefined` for `latestPumpSettings` when missing in data set', () => {
      expect(utils.getLatestPumpSettings(_.omitBy(data, {type: 'pumpSettings'})).latestPumpSettings).to.be.undefined;
    });

    it('should return `undefined` for `uploadRecord` when pump settings are missing in data set', () => {
      expect(utils.getLatestPumpSettings(_.omitBy(data, {type: 'pumpSettings'})).uploadRecord).to.be.undefined;
    });

    it('should return the upload record when pump settings are present and the corresponding upload is in data set', () => {
      expect(utils.getLatestPumpSettings(data).uploadRecord).to.eql(data[0]);
    });

    it('should return `undefined` for `uploadRecord` when pump settings are present and the corresponding upload is not in data set', () => {
      expect(utils.getLatestPumpSettings(_.omitBy(data, { type: 'upload' })).uploadRecord).to.be.undefined;
    });
  });
});
