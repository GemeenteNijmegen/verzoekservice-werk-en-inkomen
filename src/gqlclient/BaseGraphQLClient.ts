import https from 'https';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger'; // Import the centralized logger

// Define GraphQL Response Structure
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
  extensions?: Record<string, unknown>;
}

// Why Axios Response Wrapper for GraphQL
// Auto-parses JSON and better error handling instead of node native Response
export type GraphQLAxiosResponse<T> = AxiosResponse<GraphQLResponse<T>>;

export interface BaseGraphQLClientOptions {
  /**
    * Especially for Graphql, the baseurl does not need any formatting, stays the same.
    * @example https://environment.nijmegen.nl/path/nijmegen/pathtwo/vwi/
    */
  baseUrl: string;
  apiKey: string;
  certClientCrt?: string;
  certKey?: string;
  certPublicCA?: string;
}

export class BaseGraphQLClient {
  readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly certClientCrt?: string;
  private readonly certKey?: string;
  private readonly certPublicCA?: string;


  constructor(options: BaseGraphQLClientOptions) {
    this.baseUrl = options.baseUrl;
    this.apiKey = options.apiKey;
    this.certClientCrt = options.certClientCrt;
    this.certKey = options.certKey;
    this.certPublicCA = options.certPublicCA;


    logger.info('Initializing GraphQL client', { baseUrl: this.baseUrl });

    this.axiosInstance = this.setupAxiosInstance();
  }

  /**
   * Private method to setup Axios with mTLS.
   * Throws an error if required certs are missing.
   */
  private setupAxiosInstance(): AxiosInstance {
    if (!this.certClientCrt || !this.certKey || !this.certClientCrt || !this.apiKey || !this.baseUrl) {
      logger.error('Missing required mTLS certificates');
      throw new Error(
        'Missing required mTLS certificates. Ensure both "certClientCrt" (client certificate) and "certKey" (private key) are provided.',
      );
    }

    logger.info('Setting up Axios instance with mTLS');

    return axios.create({
      baseURL: this.baseUrl,
      httpsAgent: new https.Agent({
        cert: this.certClientCrt, // Client Certificate
        key: this.certKey, // Private Key
        ca: this.certPublicCA, // Optional CA Certificate
        rejectUnauthorized: !!this.certPublicCA, // Enforce CA validation if provided, change to environment-based setting later on
      }),
      headers: {
        'Content-Type': 'application/json',
        'subscription-key': this.apiKey,
      },
    });
  }

  /**
   * Perform a GraphQL request with full Axios response typing.
   * @param query The GraphQL query/mutation
   * @param variables Optional GraphQL variables
   * @returns Full Axios response with GraphQL data
   */
  async request<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GraphQLAxiosResponse<T>> {
    logger.debug(`Executing GraphQL request: query: ${query} \n variables: ${JSON.stringify(variables)}`);

    try {
      const response = await this.axiosInstance.post<GraphQLResponse<T>>('', { query, variables });

      if (response.data.errors) {
        logger.error('GraphQL Errors', { errors: response.data.errors });
        throw new Error(JSON.stringify(response.data.errors));
      }
      logger.debug(
        `GraphQL request successful. Data: ${response.data}`,
      );
      logger.debug(
        `GraphQL request successful. Status: ${response.status}`,
      );

      return response; // Returns full response (includes status, headers, etc.)
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      logger.error('GraphQL request failed', { error: errorMsg });
      throw new Error(`GraphQL request failed: ${errorMsg}`);
    }
  }
}
