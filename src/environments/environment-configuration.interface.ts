export interface EnvironmentConfiguration {
  readonly production: boolean;
  readonly apiUrl: string;
  readonly apiAccountUrl: string;
  readonly apiAuthenticateUrl: string;
  readonly apiConfigurationUrl: string;
  readonly apiEcommerceUrl: string;
  readonly apiHealthCheckUrl: string;
  readonly apiManagementPanelUrl: string;
  readonly hubSharedUrl: string;
}
