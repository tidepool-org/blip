var moment = require('moment');
var datetimeUtils = require('../../app/core/datetimeutils');

// Mock today
datetimeUtils._momentToday = function() {
  return moment('2014-01-31');
};

describe('Datetime utils', function() {

  describe('isValidDate', function() {
    it('should return true if string is valid date', function() {
      var result = datetimeUtils.isValidDate('2014-01-31');

      expect(result).to.be.ok;
    });

    it('should return false if string is not valid date', function() {
      var result = datetimeUtils.isValidDate('foo');

      expect(result).to.not.be.ok;
    });

    it('should return false if null value given', function() {
      var result = datetimeUtils.isValidDate(null);

      expect(result).to.not.be.ok;
    });
  });

  describe('yearsAgo', function() {
    it('should return number of years ago', function() {
      var result = datetimeUtils.yearsAgo('2012-01-31');

      expect(result).to.equal(2);
    });
  });

  describe('yearsAgoText', function() {
    it('should return correct text if this year', function() {
      var result = datetimeUtils.yearsAgoText('2014-01-15');

      expect(result).to.equal('This year');
    });

    it('should return singular if one year ago', function() {
      var result = datetimeUtils.yearsAgoText('2013-01-15');

      expect(result).to.equal('1 year ago');
    });

    it('should return plural if more than one year ago', function() {
      var result = datetimeUtils.yearsAgoText('2012-01-15');

      expect(result).to.equal('2 years ago');
    });
  });

  describe('yearsOldText', function() {
    it('should return singular if one year old', function() {
      var result = datetimeUtils.yearsOldText('2013-01-15');

      expect(result).to.equal('1 year old');
    });

    it('should return plural if more than one year old', function() {
      var result = datetimeUtils.yearsOldText('2012-01-15');

      expect(result).to.equal('2 years old');
    });
  });
});
