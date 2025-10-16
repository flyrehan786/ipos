import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { OrderItem } from '../../../models/order.model';

@Component({
  selector: 'app-purchase-order-form',
  templateUrl: './purchase-order-form.component.html'
})
export class PurchaseOrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  isEditMode = false;
  orderId?: number;
  loading = false;
  error = '';

  products: Product[] = [];
  orderItems: OrderItem[] = [];
  
  selectedProduct?: Product;
  itemQuantity = 1;
  itemUnitPrice = 0;
  itemDiscount = 0;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.orderForm = this.formBuilder.group({
      order_number: ['PO' + Date.now(), Validators.required],
      supplier_name: ['', Validators.required],
      order_date: [new Date().toISOString().split('T')[0], Validators.required],
      discount_type: ['none', Validators.required],
      discount_value: [0],
      tax_rate: [0],
      paid_amount: [0],
      payment_method: ['cash'],
      notes: ['']
    });

    this.loadProducts();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.orderId = +params['id'];
        this.loadOrder();
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data.filter(p => p.status === 'active');
      }
    });
  }

  loadOrder(): void {
    this.purchaseOrderService.getById(this.orderId!).subscribe({
      next: (order) => {
        this.orderForm.patchValue(order);
        this.orderItems = order.items;
      }
    });
  }

  onProductSelect(event: any): void {
    const productId = +event.target.value;
    this.selectedProduct = this.products.find(p => p.id === productId);
    if (this.selectedProduct) {
      this.itemUnitPrice = this.selectedProduct.purchase_price;
    }
  }

  addItem(): void {
    if (!this.selectedProduct || this.itemQuantity <= 0 || this.itemUnitPrice <= 0) {
      return;
    }

    const total = (this.itemQuantity * this.itemUnitPrice) - this.itemDiscount;

    const item: OrderItem = {
      product_id: this.selectedProduct.id!,
      product_name: this.selectedProduct.name,
      sku: this.selectedProduct.sku,
      quantity: this.itemQuantity,
      unit_price: this.itemUnitPrice,
      discount: this.itemDiscount,
      tax_rate: this.orderForm.value.tax_rate,
      total: total
    };

    this.orderItems.push(item);
    this.selectedProduct = undefined;
    this.itemQuantity = 1;
    this.itemUnitPrice = 0;
    this.itemDiscount = 0;
  }

  removeItem(index: number): void {
    this.orderItems.splice(index, 1);
  }

  calculateSubtotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.total, 0);
  }

  calculateDiscount(): number {
    const subtotal = this.calculateSubtotal();
    const discountType = this.orderForm.value.discount_type;
    const discountValue = this.orderForm.value.discount_value || 0;

    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
      return discountValue;
    }
    return 0;
  }

  calculateTax(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const taxRate = this.orderForm.value.tax_rate || 0;
    return ((subtotal - discount) * taxRate) / 100;
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const tax = this.calculateTax();
    return subtotal - discount + tax;
  }

  onSubmit(): void {
    if (this.orderForm.invalid || this.orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    this.loading = true;
    this.error = '';

    const orderData = {
      ...this.orderForm.value,
      items: this.orderItems,
      subtotal: this.calculateSubtotal(),
      tax_amount: this.calculateTax(),
      total_amount: this.calculateTotal(),
      payment_status: this.orderForm.value.paid_amount >= this.calculateTotal() ? 'paid' : 
                     (this.orderForm.value.paid_amount > 0 ? 'partial' : 'unpaid'),
      status: 'completed'
    };

    const request = this.isEditMode
      ? this.purchaseOrderService.update(this.orderId!, orderData)
      : this.purchaseOrderService.create(orderData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/purchase-orders']);
      },
      error: (error) => {
        this.error = error.error?.error || 'An error occurred';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/purchase-orders']);
  }
}
