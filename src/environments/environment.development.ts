import { EnvironmentConfiguration } from './environment-configuration.interface';

const baseUrl = 'https://localhost:7216/api/v1';

export const environment: EnvironmentConfiguration = {
  production: false,
  apiUrl: baseUrl,
  apiAccountUrl: baseUrl + '/accounts',
  apiAuthenticateUrl: baseUrl + '/authenticates',
  apiConfigurationUrl: baseUrl + '/configurations',
  apiHealthCheckUrl: baseUrl + '/health-checks',
  apiManagementPanelUrl: baseUrl + '/management-panel',
  apiEcommerceUrl: baseUrl + '/e-commerce',
  hubSharedUrl: baseUrl + '/hubs/shared',
};
