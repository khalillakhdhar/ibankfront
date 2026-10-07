import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const roles = (route.data?.['roles'] as string[] | undefined) ?? [];
  return roles.length === 0 || roles.some((role) => auth.hasRole(role))
    ? true
    : inject(Router).createUrlTree(['/dashboard']);
};
