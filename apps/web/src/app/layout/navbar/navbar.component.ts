import { Component, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TopLoadingBarComponent } from '../../shared/components/top-loading-bar/top-loading-bar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, TopLoadingBarComponent],
  template: `
    <app-top-loading-bar />
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="toggle.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>hanen-shop</span>
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  readonly toggle = output<void>();
}
