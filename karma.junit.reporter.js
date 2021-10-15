/**
 * Copyright (c) 2021, Diabeloop
 * Quick & dirty Karma JUnit reporter (the official one is outdated)
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

/**
 * @typedef {{ logReport: boolean; name: string; filename: string }} JUnitConfig
 * @typedef {{ message: string; type: string; log: string; }} TestError
 * @typedef {{ browser: string; time: number; timestamp: string; result: "skipped" | "success" | "failure"; failure?: TestError; }} SuiteResult
 */

const fs = require("fs").promises;
const path = require("path");
const _ = require("lodash");

function getResult(result) {
  if (result.skipped) {
    return "skipped";
  }
  if (result.success) {
    return "success";
  }
  return "failure";
}

function JUnitReporter(config, logger) {
  /** @type {JUnitConfig} */
  this.config = config.junitReporter;
  /** @type {Console} */
  this.log = logger.create('reporter.junit');

  this.log.debug(`Starting JUnit reporter for ${this.config.name}`);

  /** @type {Map<string, Map<string, SuiteResult[]>>} */
  this.suites = new Map();
}

JUnitReporter.prototype.logReport = function() {
  if (this.config.logReport) {
    this.suites.forEach((value, suiteName) => {
      this.log.info(suiteName);
      value.forEach((results, description) => {
        this.log.info(`\t${description}`);
        results.forEach((result) => {
          this.log.info(`\t - ${result.browser}: ${result.result} - ${result.time}ms`);
          if (result.result === "failure" && typeof result.failure === "object") {
            this.log.warn(`\t\t${result.failure.type}: ${result.failure.message}`);
          }
        });
      });
    });
  }
};

JUnitReporter.prototype.getSuiteStats = function(/** @type {string} */ suiteName) {
  const stats = { tests: 0, failures: 0, skipped: 0, time: 0, timestamp: "" };
  if (this.suites.has(suiteName)) {
    const suite = this.suites.get(suiteName);
    suite.forEach((results) => {
      let totalTime = 0;
      let skipped = false;
      results.forEach((result) => {
        if (stats.timestamp === "") {
          stats.timestamp = result.timestamp;
        }
        totalTime += result.time;
        stats.failures += result.result === "failure" ? 1 : 0;
        skipped = skipped || result.result === "skipped";
      });
      stats.tests += 1;
      stats.skipped += skipped ? 1 : 0;
      stats.time += Math.round(totalTime / results.length);
    });
  }
  return stats;
};

JUnitReporter.prototype.getSuitesStats = function() {
  const stats = { tests: 0, failures: 0, time: 0 };
  this.suites.forEach((_value, suiteName) => {
    const stat = this.getSuiteStats(suiteName);
    stats.failures += stat.failures;
    stats.tests += stat.tests;
    stats.time += stat.time;
  });
  return stats;
};

JUnitReporter.prototype.fileReport = async function() {
  this.log.info(`Writing ${this.config.name} result to ${this.config.filename}`);
  await fs.mkdir(path.dirname(this.config.filename), { recursive: true });
  const allStats = this.getSuitesStats();
  const handle = await fs.open(this.config.filename, "w");
  await handle.write('<?xml version="1.0" encoding="UTF-8" ?>\n');
  await handle.write(`<testsuites name="${this.config.name}" errors="0" failures="${allStats.failures}" tests="${allStats.tests}" time="${(allStats.time / 1000.0).toFixed(3)}">\n`);
  const suitesNames = this.suites.keys();
  for (const name of suitesNames) {
    const stats = this.getSuiteStats(name);
    const suite = this.suites.get(name);
    if (typeof suite === "undefined") {
      throw new Error(`Suite ${name} do not exists`);
    }
    await handle.write(` <testsuite name="${this.config.name}/${name}" errors="0" failures="${stats.failures}" test="${stats.tests}" skipped="${stats.skipped}" time="${(stats.time / 1000).toFixed(3)}" timestamp="${stats.timestamp}">\n`);
    for (const [testName, results] of suite) {
      const time = (results.reduce((p, r) => p + r.time, 0) / (results.length * 1000)).toFixed(3);
      const isSkipped = results.reduce((s, r) => s || r.result === "skipped", false);
      /** @type {null | undefined | TestError} */
      const failure = results.reduce((f, r) => f === null ? r.failure : f, null);
      await handle.write(`  <testcase name="${testName}" className="${name.replace(/[\s/]/g, ".").replace(/[^a-zA-Z0-9.]/g, "")}" time="${time}">\n`);
      if (isSkipped) {
        await handle.write("   <skipped />");
      }
      if (failure) {
        await handle.write(`   <failure message="${failure.message}" type="${failure.type}">\n`);
        await handle.write(failure.log);
        await handle.write(`\n   </failure>\n`);
      }
      await handle.write(`  </testcase>\n`);
    }
    await handle.write(` </testsuite>\n`);
  }
  await handle.write(`</testsuites>\n`);
  await handle.close();
};

JUnitReporter.prototype.onExit = function(done) {
  this.logReport();
  this.fileReport().then(done).catch(done);
};

JUnitReporter.prototype.onSpecComplete = function(browser, result) {
  /** @type {string} */
  const suiteName = _.escape(result.suite.join("/"));
  /** @type {string} */
  const description = _.escape(result.description);
  /** @type {number} */
  const time = result.time;
  /** @type {string} */
  const browserName = browser.name;
  const resultValue = getResult(result);

  /** @type {TestError|undefined} */
  let failure = undefined;
  if (resultValue === "failure") {
    const type = _.escape(_.get(result, "assertionErrors[0].name", "Error").trim());
    const message = _.escape(_.get(result, "assertionErrors[0].message", "n/a").trim());
    let log = JSON.stringify(_.isNil(result.log) ? "n/a" : result.log);
    failure = { type, message, log };
  }

  if (this.suites.has(suiteName)) {
    const suite = this.suites.get(suiteName);
    if (typeof suite === "undefined") {
      throw new Error(`Suite ${suiteName} do not exists`);
    }
    if (suite.has(description)) {
      suite.get(description).push({ browser: browserName, time, result: resultValue, failure, timestamp: new Date().toISOString() });
    } else {
      suite.set(description, [{ browser: browserName, time, result: resultValue, failure, timestamp: new Date().toISOString() }]);
    }
  } else {
    const suite = new Map();
    suite.set(description, [{ browser: browserName, time, result: resultValue, failure, timestamp: new Date().toISOString() }]);
    this.suites.set(suiteName, suite);
  }
};

JUnitReporter.$inject = ['config', 'logger'];

module.exports = {
  'reporter:junit': ['type', JUnitReporter]
};
