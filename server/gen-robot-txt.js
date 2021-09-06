/**
 * Generate the robot.txt
 * Copyright (c) 2021, Diabeloop
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 */

const blipConfig = require('./config.app');
const { genFromTemplate } = require('./gen-utils');

const templateFilename = "robot.txt";
const outputFilename = "static/robot.txt";

const values = {
  DOMAIN_NAME: blipConfig.DOMAIN_NAME,
  ALLOW_SEARCH_ENGINE_ROBOTS: blipConfig.ALLOW_SEARCH_ENGINE_ROBOTS,
};

genFromTemplate(templateFilename, outputFilename, values).catch((reason) => console.error(reason));
