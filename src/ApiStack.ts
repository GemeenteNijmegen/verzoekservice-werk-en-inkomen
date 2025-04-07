import { StackProps, Stack } from 'aws-cdk-lib';
import { Resource, RestApi, SecurityPolicy } from 'aws-cdk-lib/aws-apigateway';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone, ARecord, RecordTarget, HostedZone } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { IITRetriever } from './retrieve-iit/IITRetriever';
import { Statics } from './Statics';

interface ApiStackProps extends StackProps, Configurable { }

export class ApiStack extends Stack {

  private readonly hostedzone: IHostedZone;
  private readonly api: RestApi;
  private readonly domain: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);


    // Hosted zone
    this.hostedzone = this.importHostedzone();
    this.domain = `api.${this.hostedzone.zoneName}`;
    // Create api
    this.api = this.createApi();

    this.addRetrieveIIT();

  }

  private createApi() {
    const awsCertificate = new Certificate(this, 'certificate', {
      domainName: this.domain,
      validation: CertificateValidation.fromDns(this.hostedzone),
    });

    const api = new RestApi(this, 'api', {
      domainName: {
        certificate: awsCertificate,
        domainName: this.domain,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
    });
    const plan = api.addUsagePlan('usage-plan', {
      description: 'api gateway usageplan',
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
    });

    const key = api.addApiKey('api-key', {
      description: 'apikey',
    });

    plan.addApiKey(key);

    new ARecord(this, 'a-record', {
      target: RecordTarget.fromAlias(new ApiGatewayDomain(api.domainName!)),
      zone: this.hostedzone,
      recordName: this.domain,
    });
    return api;
  }

  addRetrieveIIT() {
    const iitRetrieverResource: Resource = this.api.root.addResource('retrieve-iit');
    new IITRetriever(this, 'iit-retriever', {
      resource: iitRetrieverResource,
    });
  }

  private importHostedzone() {
    const accountRootZoneId = StringParameter.valueForStringParameter(this, Statics.accountRootHostedZoneId);
    const accountRootZoneName = StringParameter.valueForStringParameter(this, Statics.accountRootHostedZoneName);
    return HostedZone.fromHostedZoneAttributes(this, 'hostedzone', {
      hostedZoneId: accountRootZoneId,
      zoneName: accountRootZoneName,
    });
  }

}