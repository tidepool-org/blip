/**
 * Utilities function for generators (common code)
 * Copyright (c) 2020, Diabeloop
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 */

const fs = require("fs").promises;
const path = require("path");
const _ = require("lodash");
const handlebars = require("handlebars");

function getDistDir(defaultDir = `${__dirname}/../dist`) {
  let dir = null;
  if (process.argv.length === 3) {
    dir = path.resolve(process.argv[2]);
  } else if (!_.isEmpty(process.env.DIST_DIR)) {
    dir = path.resolve(process.env.DIST_DIR);
  } else {
    dir = path.resolve(defaultDir);
  }
  return dir;
}

/**
 * Generate a file from a template
 * @param {string} templateFilename The template filename in ../template
 * @param {string} outputFilename The wanted output file in ../dist/
 * @param {object} templateValues The values to use for handlebars
 */
async function genFromTemplate(templateFilename, outputFilename, templateValues) {
  const resolvedTemplateFilename = path.resolve(`${__dirname}/../templates/${templateFilename}`);
  console.log(`Loading ${resolvedTemplateFilename}...`);
  const templateContent = await fs.readFile(resolvedTemplateFilename, { encoding: "utf-8", flag: "r" });

  console.log("Using configuration", templateValues);
  const templateCompiler = handlebars.compile(templateContent);

  const outputFileContent = templateCompiler(templateValues);
  const resolvedOutputFilename = `${getDistDir()}/${outputFilename}`;
  await fs.writeFile(resolvedOutputFilename, outputFileContent, { encoding: "utf-8", flag: "w", mode: 0o644 });
  console.log(`${resolvedOutputFilename} generated successfully`);
}

module.exports = {
  getDistDir,
  genFromTemplate,
};
