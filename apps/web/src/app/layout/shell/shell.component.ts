import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
    selector: 'app-shell',
    imports: [
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        NavbarComponent,
        RouterLink,
        RouterLinkActive,
    ],
    template: `
    <mat-drawer-container class="sidenav-container" autosize>
      <mat-drawer #drawer class="sidenav" mode="over" [opened]="drawerOpen()">
        <mat-nav-list>
          <mat-list-item
            routerLink="/dashboard"
            routerLinkActive="mdc-list-item--activated"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="drawerOpen.set(false)"
          >
            <mat-icon matListItemIcon>dashboard</mat-icon>
            Dashboard
          </mat-list-item>
          <mat-list-item
            routerLink="/products"
            routerLinkActive="mdc-list-item--activated"
            (click)="drawerOpen.set(false)"
          >
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            Products
          </mat-list-item>
          <mat-list-item
            routerLink="/customers"
            routerLinkActive="mdc-list-item--activated"
            (click)="drawerOpen.set(false)"
          >
            <mat-icon matListItemIcon>people</mat-icon>
            Customers
          </mat-list-item>
          <mat-list-item
            routerLink="/transactions/sale"
            routerLinkActive="mdc-list-item--activated"
            (click)="drawerOpen.set(false)"
          >
            <mat-icon matListItemIcon>point_of_sale</mat-icon>
            New Sale
          </mat-list-item>
          <mat-list-item
            routerLink="/transactions/payment"
            routerLinkActive="mdc-list-item--activated"
            (click)="drawerOpen.set(false)"
          >
            <mat-icon matListItemIcon>payments</mat-icon>
            New Payment
          </mat-list-item>
        </mat-nav-list>
      </mat-drawer>

      <mat-drawer-content>
        <app-navbar (toggle)="drawerOpen.set(!drawerOpen())" />
        <main class="content">
          <ng-content />
        </main>
      </mat-drawer-content>
    </mat-drawer-container>
  `
})
export class ShellComponent {
  protected drawerOpen = signal(false);
}
