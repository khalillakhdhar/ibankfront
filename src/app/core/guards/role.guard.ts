import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppRole } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const role = route.data?.['role'] as AppRole | undefined;
  return !role || auth.hasRole(role)
    ? true
    : inject(Router).createUrlTree([auth.dashboardUrl()]);
};
