import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId?: number;
  loading = false;
  error = '';

  categories = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Health & Beauty', 'Automotive', 'Office Supplies'];
  units = ['pcs', 'kg', 'ltr', 'box', 'pack', 'dozen'];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      barcode: [''],
      description: [''],
      category: ['General', Validators.required],
      unit: ['pcs', Validators.required],
      purchase_price: [0, [Validators.required, Validators.min(0)]],
      sale_price: [0, [Validators.required, Validators.min(0)]],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      min_stock_level: [10, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required]
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct();
      }
    });
  }

  loadProduct(): void {
    this.productService.getById(this.productId!).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const request = this.isEditMode
      ? this.productService.update(this.productId!, this.productForm.value)
      : this.productService.create(this.productForm.value);

    request.subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.error = error.error?.error || 'An error occurred';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}
