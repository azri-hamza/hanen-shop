import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },

  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then((m) => m.productsRoutes),
  },

  {
    path: 'customers',
    loadChildren: () => import('./features/customers/customers.routes').then((m) => m.customersRoutes),
  },

  {
    path: 'transactions',
    loadChildren: () => import('./features/transactions/transactions.routes').then((m) => m.transactionsRoutes),
  },

  { path: '**', redirectTo: '/dashboard' },
];
