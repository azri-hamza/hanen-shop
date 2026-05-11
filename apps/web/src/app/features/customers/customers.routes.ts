import { Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list.component';
import { CustomerFormComponent } from './customer-form.component';
import { CustomerDetailComponent } from './customer-detail.component';

export const customersRoutes: Routes = [
  { path: '', component: CustomerListComponent },
  { path: 'new', component: CustomerFormComponent },
  { path: ':id', component: CustomerDetailComponent },
];
