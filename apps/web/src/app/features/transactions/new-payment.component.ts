import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ICustomer } from '@hanen-shop/shared-types';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-new-payment',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatCardModule,
    MatChipsModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="New Payment">
      <button mat-button routerLink="/dashboard">Back</button>
    </app-page-header>

    <mat-card style="max-width: 500px;">
      <mat-card-content>
        <mat-form-field appearance="outline" class="full-width mb-2">
          <mat-label>Search customer</mat-label>
          <input
            matInput
            [matAutocomplete]="auto"
            [(ngModel)]="customerSearch"
            (ngModelChange)="onSearch($event)"
          />
        </mat-form-field>

        <mat-autocomplete
          #auto="matAutocomplete"
          (optionSelected)="onSelect($event.option.value)"
        >
          @for (c of filteredCustomers(); track c.id) {
            <mat-option [value]="c">
              {{ c.name }} ({{ c.totalDebt | number: '1.3-3' }})
            </mat-option>
          }
        </mat-autocomplete>

        @if (selectedCustomer(); as customer) {
          <mat-card style="background: #f5f5f5; margin-bottom: 16px;">
            <mat-card-content style="text-align: center;">
              <p style="margin: 0; color: #666;">{{ customer.name }}</p>
              <p
                style="margin: 8px 0 0; font-size: 28px; font-weight: 500; color: {{
                  debtColor()
                }};"
              >
                Current Balance: {{ customer.totalDebt | number: '1.3-3' }}
              </p>
            </mat-card-content>
          </mat-card>

          <mat-form-field appearance="outline" class="full-width mb-2">
            <mat-label>Amount</mat-label>
            <input
              matInput
              type="number"
              [(ngModel)]="amount"
              placeholder="0.00"
              min="0.01"
              [max]="customer.totalDebt"
            />
            @if (amount > 0 && amount > customer.totalDebt) {
              <mat-error>Amount cannot exceed current balance</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width mb-2">
            <mat-label>Note (optional)</mat-label>
            <input matInput [(ngModel)]="note" placeholder="Payment note" />
          </mat-form-field>

          <button
            mat-raised-button
            color="primary"
            style="width: 100%; padding: 8px;"
            [disabled]="
              !amount ||
              amount <= 0 ||
              amount > customer.totalDebt ||
              submitting()
            "
            (click)="onSubmit()"
          >
            {{ submitting() ? 'Processing...' : 'Record Payment' }}
          </button>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class NewPaymentComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);

  protected customers = signal<ICustomer[]>([]);
  protected selectedCustomer = signal<ICustomer | null>(null);
  protected customerSearch = '';
  protected amount = 0;
  protected note = '';
  protected submitting = signal(false);

  private readonly search$ = new Subject<string>();

  protected filteredCustomers = computed(() => {
    const q = this.customerSearch.toLowerCase();
    return this.customers().filter((c) => c.name.toLowerCase().includes(q));
  });

  protected debtColor = computed(() => {
    const debt = this.selectedCustomer()?.totalDebt ?? 0;
    if (debt === 0) return '#4caf50';
    if (debt < 1000) return '#ff9800';
    return '#f44336';
  });

  constructor() {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((q) => {
        this.api.customers
          .getAll({ search: q || undefined })
          .then((r) => this.customers.set(r.data));
      });
  }

  ngOnInit() {
    this.title.setTitle('New Payment — hanen-shop');
    this.api.customers.getAll().then((r) => this.customers.set(r.data));

    const prefillId = this.route.snapshot.queryParamMap.get('customerId');
    if (prefillId) {
      this.api.customers
        .getOne(prefillId)
        .then((r) => this.selectedCustomer.set(r.data));
    }
  }

  onSearch(value: string) {
    this.search$.next(value);
  }

  onSelect(customer: ICustomer) {
    this.selectedCustomer.set(customer);
  }

  async onSubmit() {
    const customer = this.selectedCustomer();
    if (!customer || !this.amount || this.amount <= 0) return;

    this.submitting.set(true);

    try {
      await this.api.transactions.createPayment({
        customerId: customer.id,
        amount: this.amount,
        note: this.note || undefined,
      });
      this.toast.success('Payment recorded successfully');
      this.router.navigate(['/customers', customer.id]);
    } catch {
      this.toast.error('Failed to record payment');
    } finally {
      this.submitting.set(false);
    }
  }
}
