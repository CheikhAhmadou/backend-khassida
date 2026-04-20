import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
  },
  {
    path: 'page',
    loadComponent: () => import('./pages/pdf-view/pdf-view').then(m => m.PdfViewComponent),
  },
  {
    path: 'kourel',
    loadComponent: () => import('./pages/kourel/kourel').then(m => m.KourelComponent),
  },
  { path: '**', redirectTo: '' },
];
