import { Routes } from '@angular/router';
import { TabsmenuComponent } from './tabsmenu/tabsmenu.component';

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
    loadComponent: () => import('./registraringreso/registraringreso.page').then( m => m.RegistraringresoPage)
  },
  {
    path: 'registrarsalida',
    loadComponent: () => import('./registrarsalida/registrarsalida.page').then( m => m.RegistrarsalidaPage)
  },
  
  {
    path: 'dashboardadmin',
    loadComponent: () => import('./dashboardadmin/dashboardadmin.page').then( m => m.DashboardadminPage)
  },
  {
    path: 'tarifas',
    loadComponent: () => import('./tarifas/tarifas.page').then( m => m.TarifasPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./historial/historial.page').then( m => m.HistorialPage)
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
