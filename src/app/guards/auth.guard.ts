import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ParqueoService } from '../services/parqueo.service';

export const authGuard: CanActivateFn = async () => {
  const parqueoService = inject(ParqueoService);
  const router = inject(Router);
  const sesion = await parqueoService.getSesion();
  if (sesion) {
    return true;
  }
  return router.parseUrl('/login');
};

export const adminGuard: CanActivateFn = async () => {
  const parqueoService = inject(ParqueoService);
  const router = inject(Router);
  const sesion = await parqueoService.getSesion();
  if (sesion && sesion.rol === 'admin') {
    return true;
  }
  return router.parseUrl(sesion ? '/tabsmenu/dashboard' : '/login');
};