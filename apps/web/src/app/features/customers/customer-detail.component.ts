import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ITransaction, ITransactionItem, TransactionType } from '@hanen-shop/shared-types';
import { CustomersStore } from './customers.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

interface TransactionWithBalance extends ITransaction {
  runningBalance: number;
  items?: ITransactionItem[];
}

@Component({
    selector: 'app-customer-detail',
    imports: [
        RouterLink,
        DatePipe,
        DecimalPipe,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatExpansionModule,
        MatDividerModule,
        MatProgressBarModule,
        PageHeaderComponent,
        EmptyStateComponent,
    ],
    template: `
    @if (store.loading()) {
      <mat-progress-bar mode="indeterminate" style="margin-bottom: 16px;" />
      <mat-card>
        <mat-card-content>
          <div style="display: flex; gap: 24px;">
            <div style="flex: 1;">
              <div
                style="height: 14px; width: 40px; background: #e0e0e0; border-radius: 4px; margin-bottom: 8px; animation: pulse 1.5s infinite;"
              ></div>
              <div
                style="height: 20px; width: 120px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"
              ></div>
            </div>
            <div style="flex: 1;">
              <div
                style="height: 14px; width: 80px; background: #e0e0e0; border-radius: 4px; margin-bottom: 8px; animation: pulse 1.5s infinite;"
              ></div>
              <div
                style="height: 28px; width: 100px; background: #e0e0e0; border-radius: 4px; animation: pulse 1.5s infinite;"
              ></div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    } @else {
      <app-page-header [title]="customer().name">
        <button mat-button routerLink="/customers">Back</button>
      </app-page-header>

      <mat-card style="margin-bottom: 24px;">
        <mat-card-content>
          <div style="display: flex; align-items: center; gap: 24px;">
            <div>
              <p style="margin: 0; color: #666;">Phone</p>
              <p style="margin: 4px 0; font-size: 18px;">
                {{ customer().phone || '—' }}
              </p>
            </div>
            <div>
              <p style="margin: 0; color: #666;">Total Debt</p>
              <p
                style="margin: 4px 0; font-size: 28px; font-weight: 500; color: {{
                  debtColor(customer().totalDebt)
                }};"
              >
                {{ customer().totalDebt | number: '1.3-3' }}
              </p>
            </div>
            <div style="margin-left: auto; display: flex; gap: 12px;">
              <button
                mat-raised-button
                color="primary"
                [routerLink]="['/transactions/sale']"
                [queryParams]="{ customerId: customer().id }"
              >
                <mat-icon>point_of_sale</mat-icon> Record Sale
              </button>
              <button
                mat-raised-button
                color="accent"
                [routerLink]="['/transactions/payment']"
                [queryParams]="{ customerId: customer().id }"
              >
                <mat-icon>payments</mat-icon> Record Payment
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <h2>Transaction History</h2>

      @if (ledgerWithBalance().length) {
        <mat-divider style="margin-bottom: 16px;" />

        @for (tx of ledgerWithBalance(); track tx.id) {
          <mat-card style="margin-bottom: 12px;">
            <mat-card-content>
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="min-width: 80px; color: #666; font-size: 13px;">
                  {{ tx.createdAt | date: 'shortDate' }}
                </span>
                <mat-chip
                  [color]="tx.type === 'SALE' ? 'primary' : 'accent'"
                  style="min-width: 72px; justify-content: center;"
                >
                  {{ tx.type }}
                </mat-chip>
                <span style="flex: 1; font-weight: 500;">{{
                  tx.amount | number: '1.3-3'
                }}</span>
                <span style="color: #666; flex: 1;">{{ tx.note || '' }}</span>
                <span
                  style="font-weight: 500; color: {{
                    debtColor(tx.runningBalance)
                  }}"
                >
                  {{ tx.runningBalance | number: '1.3-3' }}
                </span>

                @if (tx.type === 'SALE' && tx.items?.length) {
                  <button mat-icon-button (click)="toggleExpand(tx.id)">
                    <mat-icon>{{
                      expandedIds().has(tx.id) ? 'expand_less' : 'expand_more'
                    }}</mat-icon>
                  </button>
                }
              </div>

              @if (
                tx.type === 'SALE' &&
                tx.items?.length &&
                expandedIds().has(tx.id)
              ) {
                <div
                  style="margin: 12px 0 0 166px; padding: 12px; background: #f5f5f5; border-radius: 8px;"
                >
                  @for (item of tx.items; track item.id) {
                    <div
                      style="display: flex; justify-content: space-between; padding: 4px 0;"
                    >
                      <span>{{ item.productId }}</span>
                      <span
                        >{{ item.quantity }} ×
                        {{ item.unitPrice | number: '1.3-3' }}</span
                      >
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      } @else {
        <app-empty-state icon="receipt_long" message="No transactions yet" />
      }
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
    ]
})
export class CustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  protected readonly store = inject(CustomersStore);

  protected expandedIds = signal(new Set<string>());

  protected customer = computed(() => this.store.selectedCustomer()!);
  protected ledger = computed(() => this.store.ledger());

  protected ledgerWithBalance = computed<TransactionWithBalance[]>(() => {
    const txs = this.ledger() as TransactionWithBalance[];
    const chronological = [...txs].reverse();
    let balance = 0;
    return chronological
      .map((tx) => ({
        ...tx,
        runningBalance: (balance +=
          tx.type === TransactionType.SALE
            ? Number(tx.amount)
            : -Number(tx.amount)),
      }))
      .reverse();
  });

  constructor() {
    effect(() => {
      const c = this.customer();
      if (c) this.title.setTitle(`${c.name} — hanen-shop`);
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadCustomerDetail(id);
    }
  }

  toggleExpand(id: string) {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  debtColor(value: number): string {
    if (value === 0) return '#4caf50';
    if (value < 1000) return '#ff9800';
    return '#f44336';
  }
}
