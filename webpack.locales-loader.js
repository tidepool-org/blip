/**
 * Copyright (c) 2021, Diabeloop
 * Locale loader webpack plugin for i18next
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

const buildConfig = require("./server/config.app");

function localesLoader(source) {
  if (buildConfig.TEST) {
    return source;
  }

  const localesParams = JSON.parse(source);
  for (const locale in localesParams.resources) {
    if (Object.prototype.hasOwnProperty.call(localesParams.resources, locale)) {
      console.log(`Loading locale ${locale}`);
      const main = require(`./locales/${locale}/translation.json`);
      const params = require(`./locales/${locale}/parameter.json`);
      const yourloops = require(`./locales/${locale}/yourloops.json`);
      localesParams.resources[locale].main = main;
      localesParams.resources[locale].params = params;
      localesParams.resources[locale].yourloops = yourloops;
    }
  }

  return JSON.stringify(localesParams);
}

module.exports = localesLoader;
