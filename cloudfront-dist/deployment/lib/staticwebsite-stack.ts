import * as core from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as rsc from '@aws-cdk/custom-resources';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as route53 from '@aws-cdk/aws-route53';
import { WebStackProps } from './props/WebStackProps';
import { Duration } from '@aws-cdk/core';

export class StaticWebSiteStack extends core.Stack {
  constructor(scope: core.Construct, id: string, distDir: string, props?: WebStackProps) {
    super(scope, id, props);

    // Create the bucket
    const bucket = new s3.Bucket(this, `${props?.rootBucketName}.${props?.prefix}`, {
      bucketName: `${props?.rootBucketName}.${props?.prefix}`,
      removalPolicy: core.RemovalPolicy.RETAIN,
      publicReadAccess: true,
    });

    // Retrieve the Lambda arn
    const lambdaParameter = new rsc.AwsCustomResource(this, 'GetParameter', {
      policy: rsc.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ssm:GetParameter*'],
          resources: [
            this.formatArn({
              service: 'ssm',
              region: 'us-east-1',
              resource: `parameter/${props?.FrontAppName}/${props?.prefix}/lambda-edge-arn`
            })
          ]
        })
      ]),
      onUpdate: {
        // will also be called for a CREATE event
        service: 'SSM',
        action: 'getParameter',
        parameters: {
          Name: `/${props?.FrontAppName}/${props?.prefix}/lambda-edge-arn`
        },
        region: 'us-east-1',
        physicalResourceId: rsc.PhysicalResourceId.of(Date.now().toString()) // Update physical id to always fetch the latest version
      }
    })

    // AWS variable are required here for getting dns zone 
    const zone =  route53.HostedZone.fromLookup(this, 'domainName', {
      domainName: `${props?.zone}`
    });

    // Create the Certificate
    const cert = new DnsValidatedCertificate(this, `${id}-certificate`, {
      hostedZone: zone,
      domainName: `${props?.domainName}`,
      subjectAlternativeNames: [`${props?.altDomainName}`],
      region: 'us-east-1',
    });

    // Create the distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      `${id}-cloudfront`,
      {
        comment: `cloudfront deployment for ${props?.prefix} ${props?.FrontAppName} ${props?.version}`,
        originConfigs: [
          {
            s3OriginSource: {
              originPath: `/${props?.FrontAppName}/${props?.version}`,
              s3BucketSource: bucket,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                lambdaFunctionAssociations: [
                  {
                    eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                    lambdaFunction: lambda.Version.fromVersionArn(this, `${props?.prefix}-${props?.FrontAppName}-request-viewer`, lambdaParameter.getResponseField('Parameter.Value') )
                  },
                ],
              },
            ],
          },
          {
            s3OriginSource: {
              originPath: '/maintenance',
              s3BucketSource: bucket,
            },
            behaviors: [
              {

                isDefaultBehavior: false,
                pathPattern: '/redirect.html',
              },
            ],
          },
        ],
        viewerCertificate: 
        {
          aliases: [`${props?.domainName}`, `${props?.altDomainName}`],
          props: {
            acmCertificateArn: cert.certificateArn,
            sslSupportMethod: cloudfront.SSLMethod.SNI,
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018
          },

        }
      }
    );

    // associate the distribution to a dns record
    new route53.CnameRecord(this, `${id}-websitealiasrecord`, {
      zone: zone,
      recordName: `${props?.domainName}`,
      domainName: distribution.distributionDomainName,
      ttl: Duration.minutes(5)
    });

    //  Publish the site content to the S3 bucket (with --delete and invalidation)
    new s3deploy.BucketDeployment(this, `${id}-deploymentwithinvalidation`, {
      sources: [s3deploy.Source.asset(`${distDir}/static`)],
      destinationBucket: bucket,
      destinationKeyPrefix: `${props?.FrontAppName}/${props?.version}`,
      distribution,
      distributionPaths: ['/index.html']
    });

  }
}
