# Welcome to the sub project cloudfront deployment

this project allow to deploy a static site to AWS cloudfront service.
it is able to create all required infrastructure components to deploy a cloud-front distribution:

* an S3 bucket
* certificate
* DNSrecords

## Getting Started

you will find below how to perform manual local deployment.

### Prerequisites

you need to have the software below :

* a node package manager: npm or yarn
* node version =10.15.3 or =12.18.3
* the aws CDK cli called cdk.
* a linux shell

After the installation of the pre-requisites software you need to build a blip package and the lambda

```sh
cd blip/
export TARGET_ENVIRONMENT=<target env>
npm install
source ./config/env.$TARGET_ENVIRONMENT.sh && npm run build
```

### Installation

In the directory cloudfront-dist/deployment (cd cloudfront-dist/deployment):

1. Install or update the AWS CDK CLI from npm/yarn (requires Node.js ≥ 10.13.0). We recommend using a version in Active LTS

    ```bash
    npm install -g aws-cdk@1.61.1
    ```

2. Install NPM packages

    ```sh
    npm install
    ```

3. Create a .env file based on .env.template and full fill it based on your need

```sh
cp .env.template .env
```

*tips:*
you could also used your AWS profile to interact with aws apis
export AWS_PROFILE=fso-dev

## Usage

now that the installation is complete, you could perform a deployment:

```sh
source .env #or whatever your env file is called
cdk synth # to test the deployment
cdk deploy <STACK_PREFIX_NAME>-blip
```

### Set the web site in maintenance mode
To force the display of a maintenance page you need to set the env var `MAINTENANCE` to `true` and then execute a deployment as described above.  
To revert from a maintenance state to a "normal" state make sure to reset the env var `MAINTENANCE` to `false` and then (re)execute a deployment.  

*tips:*

* if you did not install cdk cli globally you will find it here => ./node_modules/.bin/cdk

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy --require-approval never`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template