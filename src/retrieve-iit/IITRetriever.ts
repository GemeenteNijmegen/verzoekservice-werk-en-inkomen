import { aws_secretsmanager, Duration } from 'aws-cdk-lib';
import { LambdaIntegration, Resource } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { Statics } from '../Statics';
import { RetrieveIitFunction } from './retrieve-iit-function';

interface IITRetrieverOptions {
  /**
     * The API Gateway resource to create the
     * endpoint(s) in.
     */
  resource: Resource;
  /**
     * logLevel DEBUG
     */
  logLevel?: string;
}
export class IITRetriever extends Construct {
  private options: IITRetrieverOptions;

  constructor(scope: Construct, id: string, options: IITRetrieverOptions) {
    super(scope, id);
    this.options = options;
    this.setupRetrieveIITFunction();
  }
  setupRetrieveIITFunction() {
    const vwiApiKey: ISecret = aws_secretsmanager.Secret.fromSecretNameV2(this, 'vwi-secret-01', Statics.secretApiKeyVwi);
    const vwiMTLSPrivateKey: ISecret = aws_secretsmanager.Secret.fromSecretNameV2(this, 'vwi-secret-02', Statics.secretMTLSPrivateKey);
    const retrieverFn = new RetrieveIitFunction(this, 'iit-retriever-function', {
      description: 'Lambda that makes several api calls to VWI to retrieve vwi iit data',
      logGroup: new LogGroup(this, 'receiver-logs', {
        //encryptionKey: this.options.key,
        //TODO use a central kms key when this will be used in production
        retention: RetentionDays.SIX_MONTHS,
      }),
      timeout: Duration.seconds(10),
      environment: {
        POWERTOOLS_LOG_LEVEL: this.options.logLevel ?? 'DEBUG', // Default level INFO. Set in .env when debug needed locally.
        VWI_API_KEY_ARN: vwiApiKey.secretArn,
        VWI_MTLS_PRIVATE_KEY_ARN: vwiMTLSPrivateKey.secretArn,
        VWI_MTLS_CLIENT_CERT_NAME: Statics.ssmMTLSClientCert,
        VWI_MTLS_ROOT_CA_NAME: Statics.ssmMTLSRootCA,
        VWI_ENDPOINT_NAME: Statics.ssmApiEndpointVwi,
      },

    });
    this.options.resource.addMethod('POST', new LambdaIntegration(retrieverFn));
    vwiApiKey.grantRead(retrieverFn);
    vwiMTLSPrivateKey.grantRead(retrieverFn);
  }
}