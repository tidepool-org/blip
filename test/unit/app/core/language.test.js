import i18n from '../../../../app/core/language';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

describe('languages', () => {
  it('should be able to change language', () => {
    expect(i18n.t('Log in')).to.equal('Log in');

    i18n.changeLanguage('fr');
    expect(i18n.t('Log in')).to.equal('Connexion');
  })
});
