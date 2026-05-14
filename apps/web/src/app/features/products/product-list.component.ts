import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { IProduct } from '@hanen-shop/shared-types';
import { ProductsStore } from './products.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    DecimalPipe,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-page-header title="Products">
      <button mat-raised-button color="primary" routerLink="/products/new">
        <mat-icon>add</mat-icon> New Product
      </button>
    </app-page-header>

    <div style="display: flex; gap: 16px; margin-bottom: 16px;">
      <mat-form-field appearance="outline" style="flex: 1;">
        <mat-label>Search products</mat-label>
        <input
          matInput
          (input)="onSearch($any($event.target).value)"
          placeholder="Search by name..."
        />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width: 200px;">
        <mat-label>Category</mat-label>
        <mat-select (selectionChange)="onCategoryChange($any($event).value)">
          <mat-option value="">All</mat-option>
          @for (cat of categories(); track cat) {
            <mat-option [value]="cat">{{ cat }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (store.loading()) {
      <mat-progress-bar mode="indeterminate" style="margin-bottom: 16px;" />
      <div style="padding: 16px;">
        @for (_ of [1, 2, 3, 4, 5]; track _) {
          <div
            style="display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #eee;"
          >
            <div
              style="flex: 2; height: 16px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"
            ></div>
            <div
              style="flex: 1; height: 16px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"
            ></div>
            <div
              style="flex: 1; height: 16px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"
            ></div>
            <div
              style="flex: 0.5; height: 16px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"
            ></div>
          </div>
        }
      </div>
    } @else if (!store.products().length) {
      <app-empty-state icon="inventory_2" message="No products found" />
    } @else {
      <mat-table [dataSource]="store.products()" style="width: 100%;">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
          <mat-cell *matCellDef="let p">{{ p.name }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="category">
          <mat-header-cell *matHeaderCellDef>Category</mat-header-cell>
          <mat-cell *matCellDef="let p">{{ p.category || '—' }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="price">
          <mat-header-cell *matHeaderCellDef>Price</mat-header-cell>
          <mat-cell *matCellDef="let p">{{
            p.price | number: '1.3-3'
          }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="unit">
          <mat-header-cell *matHeaderCellDef>Unit</mat-header-cell>
          <mat-cell *matCellDef="let p">{{ p.unit }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="stock">
          <mat-header-cell *matHeaderCellDef>Stock</mat-header-cell>
          <mat-cell *matCellDef="let p">
            <span
              [style.background]="stockColor(p.stockQuantity)"
              style="padding: 2px 8px; border-radius: 4px; color: white; font-weight: 500;"
            >
              {{ p.stockQuantity }}
            </span>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
          <mat-cell *matCellDef="let p">
            <button
              mat-icon-button
              [routerLink]="['/products', p.id, 'edit']"
              matTooltip="Edit"
            >
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              (click)="openStockDialog(p)"
              matTooltip="Adjust Stock"
            >
              <mat-icon>inventory</mat-icon>
            </button>
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns" />
        <mat-row *matRowDef="let row; columns: displayedColumns" />
      </mat-table>
    }
  `,
  styles: [
    `
      @keyframes pulse {
        0%,
        100% {
          opacity: 0.4;
        }
        50% {
          opacity: 1;
        }
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  protected readonly store = inject(ProductsStore);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);
  private readonly searchSubject = new Subject<string>();

  protected displayedColumns = [
    'name',
    'category',
    'price',
    'unit',
    'stock',
    'actions',
  ];

  protected categories = signal<string[]>([]);

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((query) => {
        this.store.loadProducts(
          query || undefined,
          this.store.categoryFilter() || undefined,
        );
      });
  }

  ngOnInit() {
    this.title.setTitle('Products — hanen-shop');
    this.store.loadProducts();
  }

  onSearch(value: string) {
    this.searchSubject.next(value);
  }

  onCategoryChange(category: string) {
    this.store.loadProducts(
      this.store.searchQuery() || undefined,
      category || undefined,
    );
  }

  stockColor(qty: number): string {
    if (qty === 0) return '#f44336';
    if (qty <= 5) return '#ff9800';
    return '#4caf50';
  }

  openStockDialog(product: IProduct) {
    const qty = prompt(
      `Adjust stock for "${product.name}":\nEnter +N to add or -N to remove`,
      '0',
    );
    if (qty === null) return;

    const num = parseInt(qty, 10);
    if (isNaN(num) || num === 0) return;

    const operation = num > 0 ? ('increment' as const) : ('decrement' as const);

    this.store
      .adjustStock(product.id, { quantity: Math.abs(num), operation })
      .then(() => {
        this.toast.success(`Stock updated for "${product.name}"`);
      })
      .catch(() => {
        this.toast.error(`Failed to adjust stock for "${product.name}"`);
      });
  }
}
