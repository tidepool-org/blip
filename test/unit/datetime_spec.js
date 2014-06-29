var moment = window.moment;
var Datetime = require('../../app/core/datetime');

// Mock today
Datetime._momentToday = function() {
  return moment('2014-01-31');
};

describe('Datetime functions', function() {

  describe('isValidDate', function() {
    it('should return true if string is valid date', function() {
      var result = Datetime.isValidDate('2014-01-31');

      expect(result).to.be.ok;
    });

    it('should return false if string is not valid date', function() {
      var result = Datetime.isValidDate('foo');

      expect(result).to.not.be.ok;
    });

    it('should return false if null value given', function() {
      var result = Datetime.isValidDate(null);

      expect(result).to.not.be.ok;
    });
  });

  describe('yearsAgo', function() {
    it('should return number of years ago', function() {
      var result = Datetime.yearsAgo('2012-01-31');

      expect(result).to.equal(2);
    });
  });

  describe('yearsAgoText', function() {
    it('should return correct text if this year', function() {
      var result = Datetime.yearsAgoText('2014-01-15');

      expect(result).to.equal('This year');
    });

    it('should return singular if one year ago', function() {
      var result = Datetime.yearsAgoText('2013-01-15');

      expect(result).to.equal('1 year ago');
    });

    it('should return plural if more than one year ago', function() {
      var result = Datetime.yearsAgoText('2012-01-15');

      expect(result).to.equal('2 years ago');
    });
  });

  describe('yearsOldText', function() {
    it('should return singular if one year old', function() {
      var result = Datetime.yearsOldText('2013-01-15');

      expect(result).to.equal('1 year old');
    });

    it('should return plural if more than one year old', function() {
      var result = Datetime.yearsOldText('2012-01-15');

      expect(result).to.equal('2 years old');
    });
  });
});
