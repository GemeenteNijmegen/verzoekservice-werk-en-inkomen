import { AWS } from '@gemeentenijmegen/utils';
import { BaseGraphQLClient } from '../../gqlclient/BaseGraphQLClient';
import {
  VWIGrapQLClientFactory,
  VWIGrapQLClientFactoryOptions,
} from '../VWIGrapQLClientFactory';

jest.mock('@gemeentenijmegen/utils', () => ({
  AWS: {
    getParameter: jest.fn(),
    getSecret: jest.fn(),
  },
}));

jest.mock('../../gqlclient/BaseGraphQLClient', () => ({
  BaseGraphQLClient: jest.fn().mockImplementation((opts) => ({ __opts: opts })),
}));

describe('VWIGrapQLClientFactory', () => {
  const fakeOpts: VWIGrapQLClientFactoryOptions = {
    vwiBaseUrl: '/param/baseUrl',
    apiKeySecretArn: 'arn:aws:secret:apiKey',
    mtlsPrivateKeySecretArn: 'arn:aws:secret:privateKey',
    mtlsClientCertParamName: '/param/clientCert',
    mtlsPublicCAParamName: '/param/publicCA',
  };

  let factory: VWIGrapQLClientFactory;

  beforeEach(() => {
    jest.resetAllMocks();
    factory = new VWIGrapQLClientFactory(fakeOpts);
  });

  test('createClient loads credentials and constructs BaseGraphQLClient once', async () => {
    // Order of params and secrets matters, test prevents small mistakes in refactors
    (AWS.getParameter as jest.Mock)
      .mockResolvedValueOnce('https://api.example.com')
      .mockResolvedValueOnce('---CLIENT-CERT---')
      .mockResolvedValueOnce('---PUBLIC-CA---');
    (AWS.getSecret as jest.Mock)
      .mockResolvedValueOnce('API_KEY_123')
      .mockResolvedValueOnce('---PRIVATE-KEY---');

    await factory.createClient();

    expect(BaseGraphQLClient).toHaveBeenCalledTimes(1);
    const instOpts = (BaseGraphQLClient as jest.Mock).mock.calls[0][0];
    expect(instOpts).toMatchObject({
      baseUrl: 'https://api.example.com',
      apiKey: 'API_KEY_123',
      certClientCrt: '---CLIENT-CERT---',
      certKey: '---PRIVATE-KEY---',
      certPublicCA: '---PUBLIC-CA---',
    });
  });

  test('createClient caches the client and does not reload credentials', async () => {
    (AWS.getParameter as jest.Mock).mockResolvedValue('params');
    (AWS.getSecret as jest.Mock).mockResolvedValue('secrets');
    const callOne = await factory.createClient();
    expect(BaseGraphQLClient).toHaveBeenCalledTimes(1);
    const callTwo = await factory.createClient();
    expect(callTwo).toBe(callOne);
    expect(BaseGraphQLClient).toHaveBeenCalledTimes(1);
  });
});
