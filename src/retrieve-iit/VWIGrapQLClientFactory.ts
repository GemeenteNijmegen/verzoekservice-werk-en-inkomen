import { AWS } from '@gemeentenijmegen/utils';
import { BaseGraphQLClient } from '../gqlclient/BaseGraphQLClient';

export interface VWIGrapQLClientFactoryOptions {
  /**
   * The name of the param holding the VWI API base URL.
   */
  vwiBaseUrl: string;
  /**
   * The ARN of the secret holding the API key (for the subscription-key header).
   */
  apiKeySecretArn: string;
  /**
   * The ARN of the secret holding the mTLS private key.
   */
  mtlsPrivateKeySecretArn: string;
  /**
   * The name of the param holding the mTLS client certificate.
   */
  mtlsClientCertParamName: string;
  /**
   * The name of the param holding the mTLS public CA.
   */
  mtlsPublicCAParamName: string;
}

export class VWIGrapQLClientFactory {
  private baseUrl?: string;
  private apiKey?: string;
  private mtlsClientCert?: string;
  private mtlsPrivateKey?: string;
  private mtlsPublicCA?: string;

  // Cache the client instance to prevent re-creation on every call.
  private clientInstance?: BaseGraphQLClient;

  constructor(private readonly options: VWIGrapQLClientFactoryOptions) {}

  /**
   * Loads the credentials (API key and certificates) if they are not already loaded.
   */
  private async loadCredentials(): Promise<void> {
    if (
      !this.baseUrl ||
      !this.apiKey ||
      !this.mtlsClientCert ||
      !this.mtlsPrivateKey ||
      !this.mtlsPublicCA
    ) {
      const [baseUrl, apiKey, mtlsClientCert, mtlsPrivateKey, mtlsPublicCA] =
        await Promise.all([
          AWS.getParameter(this.options.vwiBaseUrl),
          AWS.getSecret(this.options.apiKeySecretArn),
          AWS.getParameter(this.options.mtlsClientCertParamName),
          AWS.getSecret(this.options.mtlsPrivateKeySecretArn),
          AWS.getParameter(this.options.mtlsPublicCAParamName),
        ]);
      this.baseUrl = baseUrl;
      this.apiKey = apiKey;
      this.mtlsClientCert = mtlsClientCert;
      this.mtlsPrivateKey = mtlsPrivateKey;
      this.mtlsPublicCA = mtlsPublicCA;
    }
  }

  /**
   * Creates and caches a new BaseGraphQLClient instance configured with the loaded credentials.
   */
  public async createClient(): Promise<BaseGraphQLClient> {
    // Return the cached client if it exists
    if (this.clientInstance) {
      return this.clientInstance;
    }
    await this.loadCredentials();
    this.clientInstance = new BaseGraphQLClient({
      baseUrl: this.baseUrl!, //TODO: removing !
      apiKey: this.apiKey!, //TODO: removing !
      certClientCrt: this.mtlsClientCert,
      certKey: this.mtlsPrivateKey,
      certPublicCA: this.mtlsPublicCA,
    });
    return this.clientInstance;
  }
}
