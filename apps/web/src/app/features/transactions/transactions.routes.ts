import { Routes } from '@angular/router';
import { NewSaleComponent } from './new-sale.component';
import { NewPaymentComponent } from './new-payment.component';

export const transactionsRoutes: Routes = [
  { path: 'sale', component: NewSaleComponent },
  { path: 'payment', component: NewPaymentComponent },
];
