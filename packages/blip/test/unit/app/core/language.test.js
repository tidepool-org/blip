import i18n from '../../../../app/core/language';

/* global chai, describe, before, after, it */

const expect = chai.expect;

describe('languages', () => {
  before(() => {
    i18n.changeLanguage('en');
  });

  it('should be able to change language', () => {
    expect(i18n.t('Log in')).to.equal('Log in');

    i18n.changeLanguage('fr');
    expect(i18n.t('Log in')).to.equal('Connexion');
  });

  after(() => {
    // Avoid affecting other tests
    i18n.changeLanguage('en');
  });
});
