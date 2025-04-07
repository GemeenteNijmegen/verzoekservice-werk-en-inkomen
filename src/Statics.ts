export class Statics {
  static readonly projectName = 'verzoekservice-werk-en-inkomen';

  static readonly gnBuildEnvironment = {
    account: '836443378780',
    region: 'eu-central-1',
  };

  static readonly gnVerzoekserviceWerkEnInkomenProdEnvironment = {
    account: '222634384969',
    region: 'eu-central-1',
  };

  static readonly gnVerzoekserviceWerkEnInkomenAccpEnvironment = {
    account: '528757829324',
    region: 'eu-central-1',
  };

  static readonly accountRootHostedZonePath: string =
    '/gemeente-nijmegen/account/hostedzone/';
  static readonly accountRootHostedZoneId: string =
    '/gemeente-nijmegen/account/hostedzone/id';
  static readonly accountRootHostedZoneName: string =
    '/gemeente-nijmegen/account/hostedzone/name';

  /**
   * SSM and Secrets
   */
  // static readonly ssm: string = `/${this.projectName}/ssm`;

  /**
   * Certificate mTLS ESB
   */
  static readonly secretMTLSPrivateKey: string = `/certificate/${this.projectName}/mtls-privatekey`;
  static readonly ssmMTLSClientCert: string = `/certificate/${this.projectName}/mtls-clientcert`;
  static readonly ssmMTLSRootCA: string = `/certificate/${this.projectName}/mtls-rootca`;
  /**
   * API endpoint ESB VWI
   */
  static readonly ssmApiEndpointVwi: string = `/${this.projectName}/api-endpoint-vwi`;
  /**
   * API key secret
   */
  static readonly secretApiKeyVwi: string = `/${this.projectName}/api-key-vwi`;

}
