/**
 * Copyright (c) 2021, Diabeloop
 * Verify all the strings are translated (at least present in the translation files)
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

const fs = require("fs").promises;
const path = require("path");
const _ = require("lodash");
const { expect } = require("chai");
const localesInfos = require("../../locales/languages.json");
const refLang = "en";
const langs = Object.keys(localesInfos.resources).filter((lang) => lang !== "en");

/**
 *
 * @typedef {{files: string[]; fullNames: string[];}} FilesList
 */

/**
 * @param {string} lang
 * @return {Promise<FilesList>} A list of json files
 */
async function getFiles(lang) {
  const dir = path.resolve(__dirname, "../../locales", lang);
  let files = await fs.readdir(dir);
  files = files.filter((name) => /\.json$/.test(name));
  files.sort((a, b) => a.localeCompare(b));
  const fullNames = files.map((file) => `${dir}/${file}`);
  return { files, fullNames };
}

/**
 * @param {string} lang The trFile language
 * @param {string} refFile ref JSON filename
 * @param {string} trFile tr JSON filename
 */
function checkFile(lang, refFile, trFile) {
  const refContent = require(refFile);
  const trContent = require(trFile);
  const refKeys = Object.keys(refContent);
  const trKeys = Object.keys(trContent);

  let nErrors = 0;

  for (const key of refKeys) {
    if (!trKeys.includes(key)) {
      console.error(`${lang}: Missing key "${key}" in ${trFile}`);
      nErrors++;
    }
  }

  for (const key of trKeys) {
    if (!refKeys.includes(key)) {
      console.error(`${lang}: Invalid key "${key}" in ${trFile}`);
      nErrors++;
    }
  }

  return nErrors;
}

/**
 * @param {string} lang
 * @param {FilesList} refFiles
 * @param {FilesList} trFiles
 */
function verify(lang, refFiles, trFiles) {
  if (!_.isEqual(refFiles.files, trFiles.files)) {
    console.error(`Translation files for "${lang}" is not the same`);
    const result = {};
    result[refLang] = refFiles.files;
    result[lang] = trFiles.files;
    console.error(JSON.stringify(result, null, 2));
  }
  expect(_.isEqual(refFiles.files, trFiles.files)).to.be.true;

  let nErrors = 0;
  for (let i = 0; i < refFiles.fullNames.length; i++) {
    nErrors += checkFile(lang, refFiles.fullNames[i], trFiles.fullNames[i]);
  }
  expect(nErrors, "nErrors").to.be.lessThan(1);
}

describe("Localization files", () => {
  const isMainBranch = typeof process.env.GIT_BRANCH === "string" && process.env.GIT_BRANCH === "dblp";
  const isReleasedBuild = typeof process.env.version === "string" && process.env.version.toUpperCase() !== "UNRELEASED";

  /** @type {FilesList | null} */
  let refFiles = null;
  before(async () => {
    console.log("Test may fail:", isMainBranch && isReleasedBuild);
    refFiles = await getFiles(refLang);
  });

  after(() => {
    refFiles = null;
  });

  it("Should have more than one language", () => {
    expect(langs).to.be.an("array").not.empty;
  });

  langs.forEach((lang) => {
    it(`"${lang}" files should match "${refLang}" files`, async () => {
      const trFiles = await getFiles(lang);
      expect(refFiles).to.be.not.null;

      if (refFiles !== null) {
        try {
          verify(lang, refFiles, trFiles);
        } catch (reason) {
          // Don't block unreleased version to publish to preview (see Jenkinsfile)
          if (isMainBranch && isReleasedBuild) {
            return Promise.reject(reason);
          }
          console.error(reason);
        }
      }
    });
  });
});
