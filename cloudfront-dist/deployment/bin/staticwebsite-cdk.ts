#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { StaticWebSiteStack } from '../lib/staticwebsite-stack';
import { LambdaStack } from '../lib/lambda-stack';
import * as path from 'path';

// Variable
const AWS_ACCOUNT = process.env.AWS_ACCOUNT;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;
const STACK_PREFIX_NAME = process.env.STACK_PREFIX_NAME;
const STACK_VERSION = process.env.STACK_VERSION;
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const ALT_DOMAIN_NAME = process.env.ALT_DOMAIN_NAME;
const DNS_ZONE = process.env.DNS_ZONE;
const BUCKET = process.env.BUCKET;

const FRONT_APP_NAME = process.env.FRONT_APP_NAME;
const LAMBDA_EDGE_STACK_NAME = `${STACK_PREFIX_NAME}-${FRONT_APP_NAME}-lambda-edge`;
const APP_STACK_NAME = `${STACK_PREFIX_NAME}-${FRONT_APP_NAME}`;

const app = new cdk.App();

let distDir = path.resolve(__dirname, '../../../dist');
if(process.env.DIST_DIR !== undefined && process.env.DIST_DIR !== '') {
  distDir = path.resolve(process.env.DIST_DIR);
}
console.info(`Using app dist directory: '${distDir}'`);

// Create edge Lambda
const ls = new LambdaStack(app, LAMBDA_EDGE_STACK_NAME, distDir, {
  env: {
        region: 'us-east-1' // hardcoded because it should not change with current version of AWS !
      }
  },
  STACK_PREFIX_NAME);

// Create ressouce needed to static hosting with cloudfront
new StaticWebSiteStack(app, APP_STACK_NAME, distDir, {
    env: {
      account: AWS_ACCOUNT,
      region: AWS_DEFAULT_REGION
    }, 
    domainName: DOMAIN_NAME,
    altDomainName: ALT_DOMAIN_NAME,
    zone: DNS_ZONE,
    FrontAppName: FRONT_APP_NAME, 
    prefix: STACK_PREFIX_NAME, 
    version: STACK_VERSION,
    rootBucketName: BUCKET
  }).addDependency(ls);
