var Person = require('../../app/core/person');

describe('Person functions', function() {

  describe('fullName', function() {
    it('should return full name if exists', function() {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = Person.fullName(person);

      expect(result).to.equal('Mary Smith');
    });
  });

  describe('patientInfo', function() {
    it('should return patient info if exists', function() {
      var person = {
        profile: {patient: {diagnosisDate: '1990-01-31'}}
      };

      var result = Person.patientInfo(person);

      expect(result.diagnosisDate).to.equal('1990-01-31');
    });
  });

  describe('isPatient', function() {
    it('should return true if person has patient info', function() {
      var person = {
        profile: {patient: {diagnosisDate: '1990-01-31'}}
      };

      var result = Person.isPatient(person);

      expect(result).to.be.ok;
    });

    it('should return false if person does not have patient info', function() {
      var person = {
        profile: {}
      };

      var result = Person.isPatient(person);

      expect(result).to.not.be.ok;
    });
  });

  describe('patientFullName', function() {
    it('should return profile name if same person', function() {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {diagnosisDate: '1990-01-31'}
        }
      };

      var result = Person.patientFullName(person);

      expect(result).to.equal('Mary Smith');
    });

    it('should return patient info name if different person', function() {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {isOtherPerson: true, fullName: 'Jessica Carter'}
        }
      };

      var result = Person.patientFullName(person);

      expect(result).to.equal('Jessica Carter');
    });
  });

  describe('patientIsOtherPerson', function() {
    it('should return false if same person', function() {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {diagnosisDate: '1990-01-31'}
        }
      };

      var result = Person.patientIsOtherPerson(person);

      expect(result).to.not.be.ok;
    });

    it('should return patient info name if different person', function() {
      var person = {
        profile: {
          fullName: 'Mary Smith',
          patient: {isOtherPerson: true, fullName: 'Jessica Carter'}
        }
      };

      var result = Person.patientIsOtherPerson(person);

      expect(result).to.be.ok;
    });
  });

  describe('isOnlyCareGiver', function() {
    it('should return false if not flagged as care giver only', function() {
      var person = {
        profile: {fullName: 'Mary Smith'}
      };

      var result = Person.isOnlyCareGiver(person);

      expect(result).to.not.be.ok;
    });

    it('should return true if flagged as care giver only', function() {
      var person = {
        profile: {isOnlyCareGiver: true, fullName: 'Mary Smith'}
      };

      var result = Person.isOnlyCareGiver(person);

      expect(result).to.be.ok;
    });
  });

  describe('isSame', function() {
    it('should return true if people have same ids', function() {
      var person1 = {userid: '1'};
      var person2 = {userid: '1'};

      var result = Person.isSame(person1, person2);

      expect(result).to.be.ok;
    });

    it('should return false if people have different ids', function() {
      var person1 = {userid: '1'};
      var person2 = {userid: '2'};

      var result = Person.isSame(person1, person2);

      expect(result).to.not.be.ok;
    });

    it('should return false if passed empty person', function() {
      var person1 = {userid: '1'};
      var person2 = null;

      var result = Person.isSame(person1, person2);

      expect(result).to.not.be.ok;
    });
  });
});
