
interface BaseGrapHQLClientOptions {
  /**
     *
     */
  baseUrl: string;
  /**
     *
     */
  certClientCrt?: string;
  /**
     *
     */
  certKey?: string;
  /**
     *
     */
  certPublicCA?: string;

}
/**
 *
 */
export class BaseGrapHQLClient {
  constructor(_options: BaseGrapHQLClientOptions) {

  }

  /**
     * mTLS call
     */
}