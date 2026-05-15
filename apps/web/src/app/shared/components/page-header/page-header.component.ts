import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-page-header',
    imports: [MatButtonModule, MatIconModule],
    template: `
    <div class="flex-between" style="margin-bottom: 24px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 500;">{{ title }}</h1>
      <ng-content />
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
}
