import fs from 'fs';
import path from 'path';
import { describeIntegration } from '../../utils/describeIntegration';
import { BaseGraphQLClient } from '../BaseGraphQLClient';

describeIntegration('Live schema retrieve', () => {
  const baseUrl = process.env.VWI_BASEURL_ACC!;
  const apiKey = process.env.API_KEY_ACC!;
  console.log(`Making request to ${baseUrl}`);

  // Define the paths to your certificate files
  const certPath = path.resolve(__dirname, './cert/clientCert.crt');
  const keyPath = path.resolve(__dirname, './cert/privateKey.key');
  const caPath = path.resolve(__dirname, './cert/publicCA.crt');

  // Read the certificate files
  const clientCert = fs.readFileSync(certPath, 'utf8');
  const clientKey = fs.readFileSync(keyPath, 'utf8');
  const caCert = fs.readFileSync(caPath, 'utf8');

  // Initialize the GraphQL client
  const client = new BaseGraphQLClient({
    baseUrl: baseUrl,
    apiKey: apiKey,
    certClientCrt: clientCert,
    certKey: clientKey,
    certPublicCA: caCert,
  });

  test('schema query', async () => {
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

    await client
      .request(query)
      .then((response) => {
        console.log('GraphQL Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });
});
