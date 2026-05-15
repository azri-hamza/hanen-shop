import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { DecimalPipe } from '@angular/common';
import { ICustomer, IProduct, ISaleItem } from '@hanen-shop/shared-types';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';

interface SaleItem {
  product: IProduct;
  quantity: number;
}

@Component({
    selector: 'app-new-sale',
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
        MatListModule,
        PageHeaderComponent,
    ],
    template: `
    <app-page-header title="New Sale">
      <button mat-button routerLink="/dashboard">Back</button>
    </app-page-header>

    <mat-card>
      <mat-card-content>
        <div style="margin-bottom: 24px;">
          <h3>Step 1: Select Customer</h3>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Search customer</mat-label>
            <input
              matInput
              [matAutocomplete]="auto"
              [(ngModel)]="customerSearch"
              (ngModelChange)="onCustomerSearch($event)"
            />
          </mat-form-field>

          <mat-autocomplete
            #auto="matAutocomplete"
            (optionSelected)="onCustomerSelect($event.option.value)"
          >
            @for (c of filteredCustomers(); track c.id) {
              <mat-option [value]="c">
                {{ c.name }} ({{ c.totalDebt | number: '1.3-3' }})
              </mat-option>
            }
          </mat-autocomplete>

          @if (selectedCustomer(); as customer) {
            <mat-chip [color]="'primary'" style="margin-top: 8px;">
              {{ customer.name }} — Debt:
              {{ customer.totalDebt | number: '1.3-3' }}
            </mat-chip>
          }
        </div>

        @if (selectedCustomer(); as customer) {
          <mat-divider style="margin-bottom: 24px;" />

          <div style="margin-bottom: 24px;">
            <h3>Step 2: Add Products</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Search products</mat-label>
              <input
                matInput
                [(ngModel)]="productSearch"
                (ngModelChange)="onProductSearch($event)"
              />
            </mat-form-field>

            <div
              style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;"
            >
              @for (p of filteredProducts(); track p.id) {
                <mat-chip (click)="addProduct(p)" style="cursor: pointer;">
                  {{ p.name }} — {{ p.price | number: '1.3-3' }} ({{
                    p.stockQuantity
                  }})
                </mat-chip>
              }
            </div>

            <p style="font-weight: 500;">Selected Items:</p>
            @for (item of selectedItems(); track item.product.id) {
              <div
                style="display: flex; align-items: center; gap: 12px; padding: 8px 0;"
              >
                <span style="flex: 1;">{{ item.product.name }}</span>
                <span>{{ item.product.price | number: '1.3-3' }} ×</span>
                <input
                  type="number"
                  [ngModel]="item.quantity"
                  (ngModelChange)="updateQuantity(item.product.id, $event)"
                  style="width: 60px; padding: 4px; border: 1px solid #ccc; border-radius: 4px; text-align: center;"
                  min="1"
                />
                <span
                  style="font-weight: 500; min-width: 80px; text-align: right;"
                >
                  {{ item.product.price * item.quantity | number: '1.3-3' }}
                </span>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="removeProduct(item.product.id)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            } @empty {
              <p style="color: #999;">No products selected</p>
            }

            <p
              style="text-align: right; font-size: 18px; font-weight: 500; margin-top: 16px;"
            >
              Total: {{ totalAmount() | number: '1.3-3' }}
            </p>
          </div>

          <mat-divider style="margin-bottom: 24px;" />

          <div>
            <h3>Step 3: Confirm</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Note (optional)</mat-label>
              <textarea matInput [(ngModel)]="note" rows="2"></textarea>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              style="width: 100%; padding: 8px;"
              [disabled]="!selectedItems().length || submitting()"
              (click)="onSubmit()"
            >
              {{
                submitting()
                  ? 'Creating sale...'
                  : 'Confirm Sale — ' + (totalAmount() | number: '1.3-3')
              }}
            </button>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `
})
export class NewSaleComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);

  protected customers = signal<ICustomer[]>([]);
  protected products = signal<IProduct[]>([]);
  protected selectedCustomer = signal<ICustomer | null>(null);
  protected selectedItems = signal<SaleItem[]>([]);
  protected note = '';
  protected submitting = signal(false);

  protected customerSearch = '';
  protected productSearch = '';

  private readonly customerSearch$ = new Subject<string>();
  private readonly productSearch$ = new Subject<string>();

  protected filteredCustomers = computed(() => {
    const q = this.customerSearch.toLowerCase();
    return this.customers().filter((c) => c.name.toLowerCase().includes(q));
  });

  protected filteredProducts = computed(() => {
    const q = this.productSearch.toLowerCase();
    return this.products().filter((p) => p.name.toLowerCase().includes(q));
  });

  protected totalAmount = computed(() =>
    this.selectedItems().reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    ),
  );

  constructor() {
    this.customerSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((q) =>
        this.api.customers
          .getAll({ search: q || undefined })
          .then((r) => this.customers.set(r.data)),
      );

    this.productSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((q) =>
        this.api.products
          .getAll({ search: q || undefined })
          .then((r) => this.products.set(r.data)),
      );
  }

  ngOnInit() {
    this.title.setTitle('New Sale — hanen-shop');
    this.api.customers.getAll().then((r) => this.customers.set(r.data));
    this.api.products.getAll().then((r) => this.products.set(r.data));

    const prefillId = this.route.snapshot.queryParamMap.get('customerId');
    if (prefillId) {
      this.api.customers
        .getOne(prefillId)
        .then((r) => this.selectedCustomer.set(r.data));
    }
  }

  onCustomerSearch(value: string) {
    this.customerSearch$.next(value);
  }

  onCustomerSelect(customer: ICustomer) {
    this.selectedCustomer.set(customer);
  }

  onProductSearch(value: string) {
    this.productSearch$.next(value);
  }

  addProduct(product: IProduct) {
    if (product.stockQuantity <= 0) {
      this.toast.error(`"${product.name}" is out of stock`);
      return;
    }
    const exists = this.selectedItems().find(
      (i) => i.product.id === product.id,
    );
    if (exists) {
      this.updateQuantity(product.id, exists.quantity + 1);
    } else {
      this.selectedItems.update((items) => [
        ...items,
        { product, quantity: 1 },
      ]);
    }
  }

  updateQuantity(productId: string, qty: number) {
    const num = Math.max(1, Math.floor(Number(qty)));
    this.selectedItems.update((items) =>
      items.map((i) =>
        i.product.id === productId ? { ...i, quantity: num } : i,
      ),
    );
  }

  removeProduct(productId: string) {
    this.selectedItems.update((items) =>
      items.filter((i) => i.product.id !== productId),
    );
  }

  async onSubmit() {
    const customer = this.selectedCustomer();
    const items = this.selectedItems();
    if (!customer || !items.length) return;

    this.submitting.set(true);

    try {
      await this.api.transactions.createSale({
        customerId: customer.id,
        items: items.map(
          (i): ISaleItem => ({ productId: i.product.id, quantity: i.quantity }),
        ),
        note: this.note || undefined,
      });
      this.toast.success('Sale created successfully');
      this.router.navigate(['/customers', customer.id]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? 'Failed to create sale';
      this.toast.error(msg);
    } finally {
      this.submitting.set(false);
    }
  }
}
