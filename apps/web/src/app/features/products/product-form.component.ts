import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { ApiService } from '../../core/services/api.service';
import { of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  templateUrl: 'product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly title = inject(Title);
  private destroyRef = inject(DestroyRef);

  protected isEdit = signal(false);
  protected submitting = signal(false);
  protected productId: string | null = null;

  protected form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.min(0)]],
    unit: ['piece'],
    category: [''],
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          this.isEdit.set(!!id);
          this.productId = id;
          return id ? this.api.products.getOne(id) : of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.form.patchValue(res.data);
            this.title.setTitle('Edit Product');
          } else {
            this.title.setTitle('Create Product');
          }
        },
        error: () => {
          this.toast.error('Failed to load product');
        },
      });
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
