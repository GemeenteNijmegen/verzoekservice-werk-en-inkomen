import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { Statics } from './Statics';

interface ParameterStackProps extends StackProps, Configurable {}

export class ParameterStack extends Stack {
  constructor(scope: Construct, id: string, props: ParameterStackProps) {
    super(scope, id, props);

    new StringParameter(this, 'ssm-param--1', {
      parameterName: Statics.ssmMTLSClientCert,
      description: 'Client cert vwi esb api',
      stringValue: '-',
    });
    new StringParameter(this, 'ssm-param--2', {
      parameterName: Statics.ssmMTLSRootCA,
      description: 'Root ca vwi esb api',
      stringValue: '-',
    });
    new StringParameter(this, 'ssm-param--3', {
      parameterName: Statics.ssmApiEndpointVwi,
      description: 'Endpoint vwi esb api',
      stringValue: '-',
    });
    new Secret(this, 'secret-1', {
      secretName: Statics.secretMTLSPrivateKey,
    });
  }
}
