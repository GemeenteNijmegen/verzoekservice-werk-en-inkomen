import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiStack } from './ApiStack';
import { Configurable } from './Configuration';

interface ApiStageProps extends StageProps, Configurable { }

/**
 * Api cdk app stage
 */
export class ApiStage extends Stage {

  constructor(scope: Construct, id: string, props: ApiStageProps) {
    super(scope, id, props);
    Aspects.of(this).add(new PermissionsBoundaryAspect());

    /**
     * Api stack of this project
     */
    new ApiStack(this, 'api-stack', {
      env: props.configuration.deploymentEnvironment,
      configuration: props.configuration,
    });
  }

}