import { Routes } from '@angular/router';
import { TabsmenuComponent } from './tabsmenu/tabsmenu.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registraringreso',
    canActivate: [authGuard],
    loadComponent: () => import('./registraringreso/registraringreso.page').then( m => m.RegistraringresoPage)
  },
  {
    path: 'registrarsalida',
    canActivate: [authGuard],
    loadComponent: () => import('./registrarsalida/registrarsalida.page').then( m => m.RegistrarsalidaPage)
  },
  {
    path: 'dashboardadmin',
    canActivate: [adminGuard],
    loadComponent: () => import('./dashboardadmin/dashboardadmin.page').then( m => m.DashboardadminPage)
  },
  {
    path: 'tarifas',
    canActivate: [adminGuard],
    loadComponent: () => import('./tarifas/tarifas.page').then( m => m.TarifasPage)
  },
  {
    path: 'historial',
    canActivate: [adminGuard],
    loadComponent: () => import('./historial/historial.page').then( m => m.HistorialPage)
  },
  {
    path: 'reportes',
    canActivate: [adminGuard],
    loadComponent: () => import('./reportes/reportes.page').then( m => m.ReportesPage)
  },
  {
    path: 'gestionusuarios',
    canActivate: [adminGuard],
    loadComponent: () => import('./gestionusuarios/gestionusuarios.page').then( m => m.GestionusuariosPage)
  },
  {
    path: 'registroapp',
    loadComponent: () => import('./registroapp/registroapp.page').then( m => m.RegistroappPage)
  },
  {
    path: 'recuperarcuenta',
    loadComponent: () => import('./recuperarcuenta/recuperarcuenta.page').then( m => m.RecuperarcuentaPage)
  },
  {
    path: 'tabsmenu',
    component: TabsmenuComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
      },
      {
        path: 'mapadeespacios',
        loadComponent: () => import('./mapadeespacios/mapadeespacios.page').then( m => m.MapadeespaciosPage)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
      },
    ]
  }
];