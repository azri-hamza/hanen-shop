import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div style="text-align: center; padding: 48px 16px; color: #999;">
      <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px;">
        {{ icon }}
      </mat-icon>
      <p style="font-size: 16px; margin: 0;">{{ message }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input({ required: true }) message!: string;
}
