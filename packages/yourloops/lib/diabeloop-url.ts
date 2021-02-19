/**
 * Copyright (c) 2021, Diabeloop
 *  Diabeloop Url
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
import config from "./config";

/**
 * Class containing all URLs related to Diableloop
 */
class DiabeloopUrl {
  private rootPathName: string;
  private termsUrl: string;
  private privacyPolicyUrl: string;
  private intendedUseUrL: string;
  private supportUrL: string;

  constructor() {
    this.rootPathName = `${config.ASSETS_URL}`;
    this.termsUrl = `${this.rootPathName}terms.pdf`;
    this.privacyPolicyUrl = `${this.rootPathName}data-privacy.pdf`;
    this.intendedUseUrL = `${this.rootPathName}intended-use.pdf`;
    this.supportUrL = "https://www.diabeloop.com";
  }

  get Support(): string {
    return "Diabeloop";
  }

  get SupportUrl(): string {
    return this.supportUrL;
  }

  get Terms(): string {
    return "Diabeloop Applications Terms of Use";
  }

  getTermsUrL(currentLangue: string): string {
    this.termsUrl = `${this.rootPathName}terms.${currentLangue}.pdf`;
    return this.termsUrl;
  }

  get PrivacyPolicy(): string {
    return "Privacy Policy";
  }

  getPrivacyPolicyUrL(currentLangue: string): string {
    this.privacyPolicyUrl = `${this.rootPathName}data-privacy.${currentLangue}.pdf`;
    return this.privacyPolicyUrl;
  }

  get IntendedUse(): string {
    return "Regulatory Information";
  }

  getIntendedUseUrL(currentLangue: string): string {
    this.intendedUseUrL = `${this.rootPathName}intended-use.${currentLangue}.pdf`;
    return this.intendedUseUrL;
  }
}

const diabeloopUrl = new DiabeloopUrl();
export default diabeloopUrl;
