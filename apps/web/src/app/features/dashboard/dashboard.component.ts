import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DecimalPipe } from '@angular/common';
import { IProduct, ICustomer } from '@hanen-shop/shared-types';
import { ApiService, DashboardSummary } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
    selector: 'app-dashboard',
    imports: [
        RouterLink,
        MatCardModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatProgressBarModule,
        DecimalPipe,
        PageHeaderComponent,
    ],
    template: `
    <app-page-header title="Dashboard" />

    @if (loading()) {
      <mat-progress-bar mode="indeterminate" style="margin-bottom: 16px;" />
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px;"
      >
        @for (_ of [1, 2, 3, 4]; track _) {
          <mat-card>
            <mat-card-content style="text-align: center; padding: 24px;">
              <div
                style="width: 36px; height: 36px; background: #e0e0e0; border-radius: 50%; margin: 0 auto; animation: pulse 1.5s infinite;"
              ></div>
              <div
                style="height: 32px; width: 80px; background: #e0e0e0; border-radius: 4px; margin: 8px auto 0; animation: pulse 1.5s infinite;"
              ></div>
              <div
                style="height: 14px; width: 100px; background: #e0e0e0; border-radius: 4px; margin: 4px auto 0; animation: pulse 1.5s infinite;"
              ></div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    } @else {
      <div
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px;"
      >
        <mat-card>
          <mat-card-content style="text-align: center; padding: 24px;">
            <mat-icon
              style="font-size: 36px; width: 36px; height: 36px; color: #f44336;"
              >inventory</mat-icon
            >
            <h2 style="margin: 8px 0 0; font-size: 32px;">
              {{ lowStockCount() }}
            </h2>
            <p style="margin: 4px 0 0; color: #666;">Low Stock Items</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content style="text-align: center; padding: 24px;">
            <mat-icon
              style="font-size: 36px; width: 36px; height: 36px; color: #ff9800;"
              >people</mat-icon
            >
            <h2 style="margin: 8px 0 0; font-size: 32px;">
              {{ topDebtorsCount() }}
            </h2>
            <p style="margin: 4px 0 0; color: #666;">Top Debtors</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content style="text-align: center; padding: 24px;">
            <mat-icon
              style="font-size: 36px; width: 36px; height: 36px; color: #4caf50;"
              >trending_up</mat-icon
            >
            <h2 style="margin: 8px 0 0; font-size: 32px;">
              {{ todayRevenue() | number: '1.3-3' }}
            </h2>
            <p style="margin: 4px 0 0; color: #666;">Today Revenue</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content style="text-align: center; padding: 24px;">
            <mat-icon
              style="font-size: 36px; width: 36px; height: 36px; color: #2196f3;"
              >payments</mat-icon
            >
            <h2 style="margin: 8px 0 0; font-size: 32px;">
              {{ todayPayments() | number: '1.3-3' }}
            </h2>
            <p style="margin: 4px 0 0; color: #666;">Today Payments</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <mat-card>
          <mat-card-header
            ><mat-card-title
              >Low Stock Products</mat-card-title
            ></mat-card-header
          >
          <mat-card-content>
            @if (summary()?.lowStockProducts?.length) {
              <mat-list>
                @for (p of summary()?.lowStockProducts; track p.id) {
                  <mat-list-item>
                    <span matListItemTitle>{{ p.name }}</span>
                    <span matListItemLine>
                      <mat-chip
                        [color]="p.stockQuantity === 0 ? 'warn' : 'accent'"
                        style="font-size: 12px;"
                      >
                        {{ p.stockQuantity }} remaining
                      </mat-chip>
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <p style="color: #999; text-align: center; padding: 16px;">
                All products are well stocked
              </p>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header
            ><mat-card-title>Top Debtors</mat-card-title></mat-card-header
          >
          <mat-card-content>
            @if (summary()?.topDebtors?.length) {
              <mat-list>
                @for (c of summary()?.topDebtors; track c.id) {
                  <mat-list-item
                    [routerLink]="['/customers', c.id]"
                    style="cursor: pointer;"
                  >
                    <span matListItemTitle>{{ c.name }}</span>
                    <span matListItemLine>
                      <mat-chip
                        [color]="
                          c.totalDebt === 0
                            ? 'primary'
                            : c.totalDebt < 1000
                              ? 'accent'
                              : 'warn'
                        "
                      >
                        {{ c.totalDebt | number: '1.3-3' }}
                      </mat-chip>
                    </span>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <p style="color: #999; text-align: center; padding: 16px;">
                No debtors
              </p>
            }
          </mat-card-content>
        </mat-card>
      </div>
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
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly title = inject(Title);

  protected loading = signal(true);
  protected summary = signal<DashboardSummary | null>(null);
  protected lowStockCount = signal(0);
  protected topDebtorsCount = signal(0);
  protected todayRevenue = signal(0);
  protected todayPayments = signal(0);

  async ngOnInit() {
    this.title.setTitle('Dashboard — hanen-shop');
    try {
      const res = await this.api.dashboard.getSummary();
      this.summary.set(res.data);
      this.lowStockCount.set(res.data.lowStockProducts.length);
      this.topDebtorsCount.set(res.data.topDebtors.length);
      this.todayRevenue.set(res.data.todayRevenue);
      this.todayPayments.set(res.data.todayPayments);
    } catch {}
    this.loading.set(false);
  }
}
