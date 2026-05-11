import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductFormComponent } from './product-form.component';

export const productsRoutes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'new', component: ProductFormComponent },
  { path: ':id/edit', component: ProductFormComponent },
];
