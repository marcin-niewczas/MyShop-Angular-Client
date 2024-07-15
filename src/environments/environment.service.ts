import { Injectable } from '@angular/core';
import { EnvironmentConfiguration } from './environment-configuration.interface';
import { environment } from './environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService implements EnvironmentConfiguration {
  get production() {
    return environment.production;
  }

  get apiUrl(){
    return environment.apiUrl;
  }

  get apiAccountUrl() {
    return environment.apiAccountUrl;
  }

  get apiAuthenticateUrl() {
    return environment.apiAuthenticateUrl;
  }

  get apiManagementPanelUrl() {
    return environment.apiManagementPanelUrl;
  }

  get apiConfigurationUrl() {
    return environment.apiConfigurationUrl;
  }

  get apiHealthCheckUrl(){
    return environment.apiHealthCheckUrl;
  }

  get apiEcommerceUrl() {
    return environment.apiEcommerceUrl;
  }

  get hubSharedUrl() {
    return environment.hubSharedUrl;
  }
}