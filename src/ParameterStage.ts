
import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { StageProps, Stage, Aspects } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { ParameterStack } from './ParameterStack';

interface ParameterStageProps extends Configurable, StageProps { }

export class ParameterStage extends Stage {
  constructor(scope: Construct, id: string, props: ParameterStageProps) {
    super(scope, id, props);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    new ParameterStack(this, 'params-stack', {
      env: props.configuration.deploymentEnvironment,
      stackName: 'vwi-params-stack',
      description: 'Verzoekservice Werk en Inkomen parameters',
      configuration: props.configuration,
    });
  }
}
