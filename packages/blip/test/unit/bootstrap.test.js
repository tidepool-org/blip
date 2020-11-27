import chai from 'chai';
import sinon from 'sinon';

import Bootstrap from '../../app/bootstrap';
import { CONFIG } from '../../app/core/constants';
import globalConfig, { DUMMY_URL } from '../../app/config';

describe('Bootstrap', function() {
  const { expect } = chai;

  describe('onLanguageChanged', function() {
    const assetsURL = 'https://example.com/some-path/';

    before(() => {
      globalConfig.ASSETS_URL = assetsURL;
    });

    /** @type {Bootstrap} */
    let bootstrap = null;
    beforeEach(() => {
      bootstrap = new Bootstrap();
      bootstrap.log = {
        info: sinon.spy(),
        error: sinon.spy(),
      };
    });

    after(() => {
      globalConfig.ASSETS_URL = DUMMY_URL;
      bootstrap.onLanguageChanged('en');
    });

    it('should change the config URLs with the given lang', () => {
      const lang = 'jp';
      bootstrap.onLanguageChanged(lang);
      expect(bootstrap.log.info.called).to.be.true;
      expect(bootstrap.log.error.called).to.be.false;
      expect(CONFIG.diabeloop.dataPrivacyURL).to.be.equal(`${assetsURL}data-privacy.${lang}.pdf`);
      expect(CONFIG.diabeloop.termsURL).to.be.equal(`${assetsURL}terms.${lang}.pdf`);
      expect(CONFIG.diabeloop.intendedUseURL).to.be.equal(`${assetsURL}intended-use.${lang}.pdf`);
    });
  });
});
