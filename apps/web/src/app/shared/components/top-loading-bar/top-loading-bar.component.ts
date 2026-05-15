import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-top-loading-bar',
    imports: [MatProgressBarModule],
    template: `
    @if (loading.loading()) {
      <mat-progress-bar mode="indeterminate" style="position: fixed; top: 0; left: 0; right: 0; z-index: 9999;" />
    }
  `
})
export class TopLoadingBarComponent {
  protected readonly loading = inject(LoadingService);
}
