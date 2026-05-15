import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomersStore } from './customers.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DebtBadgeComponent } from '../../shared/components/debt-badge/debt-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
    selector: 'app-customer-list',
    imports: [
        RouterLink, MatTableModule, MatButtonModule, MatIconModule,
        MatInputModule, MatFormFieldModule, MatProgressBarModule,
        PageHeaderComponent, DebtBadgeComponent, EmptyStateComponent,
    ],
    template: `
    <app-page-header title="Customers">
      <button mat-raised-button color="primary" routerLink="/customers/new">
        <mat-icon>add</mat-icon> New Customer
      </button>
    </app-page-header>

    <mat-form-field appearance="outline" class="full-width mb-2">
      <mat-label>Search customers</mat-label>
      <input matInput (input)="onSearch($any($event.target).value)" placeholder="Search by name...">
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    @if (store.loading()) {
      <mat-progress-bar mode="indeterminate" style="margin-bottom: 16px;" />
      <div style="padding: 16px;">
        @for (_ of [1,2,3,4]; track _) {
          <div style="display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #eee;">
            <div style="flex: 2; height: 16px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"></div>
            <div style="flex: 1; height: 16px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"></div>
            <div style="flex: 0.5; height: 16px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"></div>
          </div>
        }
      </div>
    } @else if (!store.customers().length) {
      <app-empty-state icon="people" message="No customers found" />
    } @else {
      <mat-table [dataSource]="store.customers()" style="width: 100%;">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
          <mat-cell *matCellDef="let c">{{ c.name }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="phone">
          <mat-header-cell *matHeaderCellDef>Phone</mat-header-cell>
          <mat-cell *matCellDef="let c">{{ c.phone || '—' }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="totalDebt">
          <mat-header-cell *matHeaderCellDef>Total Debt</mat-header-cell>
          <mat-cell *matCellDef="let c">
            <app-debt-badge [value]="c.totalDebt" />
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
          <mat-cell *matCellDef="let c">
            <button mat-icon-button [routerLink]="['/customers', c.id]" matTooltip="View">
              <mat-icon>visibility</mat-icon>
            </button>
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns" />
        <mat-row *matRowDef="let row; columns: displayedColumns;" [routerLink]="['/customers', row.id]" style="cursor: pointer;" />
      </mat-table>
    }
  `,
    styles: [`
    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
  `]
})
export class CustomerListComponent implements OnInit {
  protected readonly store = inject(CustomersStore);
  private readonly title = inject(Title);
  private readonly searchSubject = new Subject<string>();
  protected displayedColumns = ['name', 'phone', 'totalDebt', 'actions'];

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(inject(DestroyRef)),
    ).subscribe((query) => {
      this.store.loadCustomers(query || undefined);
    });
  }

  ngOnInit() {
    this.title.setTitle('Customers — hanen-shop');
    this.store.loadCustomers();
  }

  onSearch(value: string) {
    this.searchSubject.next(value);
  }
}
