/**
 * Copyright (c) 2022, Diabeloop
 * footer component tests
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { expect } from "chai";
import { act } from "@testing-library/react-hooks/dom";
import i18n from "i18next";

import FooterLinks from "../../components/footer-links";
import { AuthContext, useAuth, User } from "../../lib/auth";
import diabeloopUrls from "../../lib/diabeloop-url";

function testFooterLink(): void {

  describe("Footer ", () => {
    let auth: AuthContext;
    let container: HTMLElement | null = null;

    const FooterLinksComponent = (data: { user: User }): JSX.Element => {
      auth = useAuth();
      auth.user = data.user;

      return (
        <FooterLinks />
      );
    };

    const mountComponent = async (user?: User): Promise<void> => {
      await act(() => {
        return new Promise((resolve) => {
          render(
            <FooterLinksComponent user={user} />, container, resolve);
        });
      });
    };

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      if (container) {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
      }
    });

    function checkLinkHref(linkId: string, expectedUrl: string) {
      const link = document.getElementById(linkId) as HTMLLinkElement;
      expect(link.href).equals(expectedUrl);
    }

    it("should render", async () => {
      await mountComponent();
      const component = document.getElementById("footer-links-container");
      expect(component).to.not.be.null;
    });

    it("should render language selector when user is not logged in", async () => {
      await mountComponent();
      const languageSelector = document.getElementById("footer-language-box");
      expect(languageSelector).to.not.be.null;
    });

    it("should not render language selector when user is logged in", async () => {
      await mountComponent({} as User);
      const languageSelector = document.getElementById("footer-language-box");
      expect(languageSelector).to.be.null;
    });

    it("should privacy policy link redirect to correct url", async () => {
      await mountComponent();
      checkLinkHref("footer-link-url-privacy-policy", diabeloopUrls.getPrivacyPolicyUrL(i18n.language));
    });

    it("should terms of use link redirect to correct url", async () => {
      await mountComponent();
      checkLinkHref("footer-link-url-terms", diabeloopUrls.getTermsUrL(i18n.language));
    });

    it("should intended use link redirect to correct url", async () => {
      await mountComponent();
      checkLinkHref("footer-link-url-intended-use", diabeloopUrls.getIntendedUseUrL(i18n.language));
    });

    it("should cookies policy link redirect to correct url", async () => {
      await mountComponent();
      checkLinkHref("footer-link-url-cookies-policy", diabeloopUrls.getCookiesPolicyUrl(i18n.language));
    });

    it("should release notes link redirect to correct url", async () => {
      await mountComponent();
      checkLinkHref("footer-link-url-release-notes", diabeloopUrls.getReleaseNotesURL());
    });
  });
}

export default testFooterLink;
