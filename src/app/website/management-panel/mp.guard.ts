import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToolbarMpService } from './navigation/mp-top-toolbar/toolbar-mp.service';
import { AuthService } from '../authenticate/auth.service';

export const managementPanelGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated || !authService.hasEmployeePermission()) {
    router.navigate([]);
    return false;
  }

  const routerLabel = route.data['routeLabel'];

  if (routerLabel) {
    const toolbarMpService = inject(ToolbarMpService);
    toolbarMpService.setRouterLabel(routerLabel);
  }

  return true;
};
