import MockAdapter from 'axios-mock-adapter';
import { logger } from '../../utils/logger';
import { BaseGraphQLClient, GraphQLResponse } from '../BaseGraphQLClient';

describe('BaseGraphQLClient', () => {
  const mockBaseUrl = 'https://mock-api.com/graphql';
  const mockCert = 'mock-cert';
  const mockKey = 'mock-key';
  const mockCA = 'mock-ca';
  let mockAxios: MockAdapter;
  let client: BaseGraphQLClient;

  beforeEach(() => {
    // Mock logger functions
    jest.spyOn(logger, 'info').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
    jest.spyOn(logger, 'debug').mockImplementation();

    // Initialize client with valid certificates
    client = new BaseGraphQLClient({
      baseUrl: mockBaseUrl,
      certClientCrt: mockCert,
      certKey: mockKey,
      certPublicCA: mockCA,
    });

    // Apply the mock to the client's Axios instance
    mockAxios = new MockAdapter((client as any).axiosInstance);
  });

  afterEach(() => {
    mockAxios.reset(); // Reset mock after each test
    jest.restoreAllMocks(); // Restore logger mocks
  });

  test('should throw an error if certClientCrt or certKey is missing', () => {
    expect(
      () =>
        new BaseGraphQLClient({
          baseUrl: mockBaseUrl,
        }),
    ).toThrow('Missing required mTLS certificates');

    expect(logger.error).toHaveBeenCalledWith('Missing required mTLS certificates');
  });

  test('should successfully perform a GraphQL query', async () => {
    const mockResponse: GraphQLResponse<{ user: { id: string; name: string } }> = {
      data: { user: { id: '123', name: 'John Doe' } },
    };

    mockAxios.onPost().reply(200, mockResponse);

    const query = 'query GetUser($id: ID!) { user(id: $id) { id name } }';
    const result = await client.request<{ user: { id: string; name: string } }>(query, { id: '123' });

    expect(result.status).toBe(200);
    expect(result.data.data).toEqual(mockResponse.data);
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('GraphQL request successful'));
  });

  test('should log an error and throw when GraphQL returns errors', async () => {
    const mockErrorResponse = { errors: [{ message: 'User not found' }] };

    mockAxios.onPost().reply(200, mockErrorResponse);

    const query = 'query GetUser($id: ID!) { user(id: $id) { id name } }';

    await expect(client.request<{ user: { id: string; name: string } }>(query, { id: '456' }))
      .rejects.toThrow('GraphQL request failed');

    expect(logger.error).toHaveBeenCalledWith('GraphQL Errors', { errors: mockErrorResponse.errors });
  });

  test('should handle network errors gracefully', async () => {
    mockAxios.onPost().networkError();

    const query = 'query GetUser($id: ID!) { user(id: $id) { id name } }';

    await expect(client.request<{ user: { id: string; name: string } }>(query, { id: '789' }))
      .rejects.toThrow('GraphQL request failed');

    expect(logger.error).toHaveBeenCalledWith('GraphQL request failed', expect.any(Object));
  });

  test('should handle timeout errors', async () => {
    mockAxios.onPost().timeout();

    const query = 'query GetUser($id: ID!) { user(id: $id) { id name } }';

    await expect(client.request<{ user: { id: string; name: string } }>(query, { id: '999' }))
      .rejects.toThrow('GraphQL request failed');

    expect(logger.error).toHaveBeenCalledWith('GraphQL request failed', expect.any(Object));
  });
});
