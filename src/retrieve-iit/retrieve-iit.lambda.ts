import { ApiGatewayV2Response } from '@gemeentenijmegen/apigateway-http';
import { environmentVariables } from '@gemeentenijmegen/utils';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { VWIGrapQLClientFactory } from './VWIGrapQLClientFactory';
import { logger } from '../utils/logger';

/**
 * Retrieve params, secrets and iniate graphqlClient before handler to increase performance
 */
let vwiGraphQlClientFactory: VWIGrapQLClientFactory | undefined;
const env = environmentVariables([
  'VWI_ENDPOINT_NAME',
  'VWI_API_KEY_ARN',
  'VWI_MTLS_PRIVATE_KEY_ARN',
  'VWI_MTLS_CLIENT_CERT_NAME',
  'VWI_MTLS_ROOT_CA_NAME',
]);

export async function handler(
  event: APIGatewayProxyEventV2,
  _context: any,
): Promise<ApiGatewayV2Response> {
  //ZOD schema checking
  //TODO: separate classes to process api calls
  const vwiClientFactory = getVwiGraphQlClientFactory();
  const client = await vwiClientFactory.createClient();

  const query = `{
    __schema {
      queryType {
        name
      }
      mutationType {
        name
      }
      types {
        name
        kind
        fields {
          name
          args {
            name
            type {
              name
              kind
            }
          }
          type {
            name
            kind
          }
        }
      }
    }
  }`;

  const response = await client.request(query);
  logger.debug(event as any);
  logger.debug(response.data as any);
  return {};
}

function getVwiGraphQlClientFactory() {
  if (!vwiGraphQlClientFactory) {
    vwiGraphQlClientFactory = new VWIGrapQLClientFactory({
      vwiBaseUrl: env.VWI_ENDPOINT_NAME,
      apiKeySecretArn: env.VWI_API_KEY_ARN,
      mtlsPrivateKeySecretArn: env.VWI_MTLS_PRIVATE_KEY_ARN,
      mtlsClientCertParamName: env.VWI_MTLS_CLIENT_CERT_NAME,
      mtlsPublicCAParamName: env.VWI_MTLS_ROOT_CA_NAME,
    });
  }
  return vwiGraphQlClientFactory;
}
