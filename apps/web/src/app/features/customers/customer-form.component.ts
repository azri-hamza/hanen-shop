import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-customer-form',
    imports: [
        RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule,
        MatFormFieldModule, MatCardModule, PageHeaderComponent,
    ],
    template: `
    <app-page-header title="New Customer">
      <button mat-button routerLink="/customers">Back</button>
    </app-page-header>

    <mat-card style="max-width: 500px;">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width mb-2">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Customer name">
            @if (form.get('name')?.errors?.['required'] && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width mb-2">
            <mat-label>Phone (optional)</mat-label>
            <input matInput formControlName="phone" placeholder="Phone number">
          </mat-form-field>

          <div style="display: flex; gap: 16px; justify-content: flex-end; margin-top: 16px;">
            <button mat-button type="button" routerLink="/customers">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
              Create
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class CustomerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);

  protected submitting = signal(false);

  protected form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
  });

  constructor() {
    this.title.setTitle('New Customer — hanen-shop');
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.submitting.set(true);

    try {
      await this.api.customers.create(this.form.value);
      this.toast.success('Customer created');
      this.router.navigate(['/customers']);
    } catch {
      this.toast.error('Failed to create customer');
    } finally {
      this.submitting.set(false);
    }
  }
}
