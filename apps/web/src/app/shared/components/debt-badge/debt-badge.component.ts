import { Component, Input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    selector: 'app-debt-badge',
    imports: [MatChipsModule, DecimalPipe],
    template: `
    <mat-chip [color]="color()" highlighted="false">
      {{ value | number: '1.3-3' }}
    </mat-chip>
  `
})
export class DebtBadgeComponent {
  @Input({ required: true }) value!: number;

  protected color = computed(() => {
    if (this.value === 0) return 'primary';
    if (this.value < 1000) return 'accent';
    return 'warn';
  });
}
