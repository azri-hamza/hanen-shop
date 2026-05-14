import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Edit Product' : 'New Product'">
      <button mat-button routerLink="/products">Back</button>
    </app-page-header>

    <mat-card style="max-width: 600px;">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width mb-2">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Product name" />
            @if (
              form.get('name')?.errors?.['required'] &&
              form.get('name')?.touched
            ) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <div style="display: flex; gap: 16px;">
            <mat-form-field appearance="outline" class="full-width mb-2">
              <mat-label>Price</mat-label>
              <input
                matInput
                type="number"
                formControlName="price"
                placeholder="0.00"
              />
              @if (
                form.get('price')?.errors?.['required'] &&
                form.get('price')?.touched
              ) {
                <mat-error>Price is required</mat-error>
              }
              @if (form.get('price')?.errors?.['min']) {
                <mat-error>Price must be positive</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width mb-2">
              <mat-label>Stock Qty</mat-label>
              <input
                matInput
                type="number"
                formControlName="stockQuantity"
                placeholder="0"
              />
              @if (form.get('stockQuantity')?.errors?.['min']) {
                <mat-error>Min is 0</mat-error>
              }
            </mat-form-field>
          </div>

          <div style="display: flex; gap: 16px;">
            <mat-form-field appearance="outline" class="full-width mb-2">
              <mat-label>Unit</mat-label>
              <mat-select formControlName="unit">
                <mat-option value="piece">Piece</mat-option>
                <mat-option value="kg">Kg</mat-option>
                <mat-option value="litre">Litre</mat-option>
                <mat-option value="box">Box</mat-option>
                <mat-option value="pack">Pack</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width mb-2">
              <mat-label>Category</mat-label>
              <input
                matInput
                formControlName="category"
                placeholder="Category"
              />
            </mat-form-field>
          </div>

          <div
            style="display: flex; gap: 16px; justify-content: flex-end; margin-top: 16px;"
          >
            <button mat-button type="button" routerLink="/products">
              Cancel
            </button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || submitting()"
            >
              {{ isEdit() ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);

  protected isEdit = signal(false);
  protected submitting = signal(false);
  protected productId: string | null = null;

  protected form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0.01)]],
    stockQuantity: [0, [Validators.min(0)]],
    unit: ['piece'],
    category: [''],
  });

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEdit.set(true);
      try {
        const res = await this.api.products.getOne(this.productId);
        this.form.patchValue(res.data);
      } catch {
        this.toast.error('Failed to load product');
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.submitting.set(true);

    try {
      if (this.isEdit() && this.productId) {
        await this.api.products.update(this.productId, this.form.value);
        this.toast.success('Product updated');
      } else {
        await this.api.products.create(this.form.value);
        this.toast.success('Product created');
      }
      this.router.navigate(['/products']);
    } catch {
      this.toast.error('Failed to save product');
    } finally {
      this.submitting.set(false);
    }
  }
}
