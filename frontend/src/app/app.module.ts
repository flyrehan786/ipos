import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ClientListComponent } from './components/clients/client-list/client-list.component';
import { ClientFormComponent } from './components/clients/client-form/client-form.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductFormComponent } from './components/products/product-form/product-form.component';
import { SaleOrderListComponent } from './components/sale-orders/sale-order-list/sale-order-list.component';
import { SaleOrderFormComponent } from './components/sale-orders/sale-order-form/sale-order-form.component';
import { PurchaseOrderListComponent } from './components/purchase-orders/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderFormComponent } from './components/purchase-orders/purchase-order-form/purchase-order-form.component';
import { TransactionListComponent } from './components/transactions/transaction-list/transaction-list.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { UserFormComponent } from './components/users/user-form/user-form.component';
import { BarcodeScannerComponent } from './components/barcode-scanner/barcode-scanner.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    NavbarComponent,
    ClientListComponent,
    ClientFormComponent,
    ProductListComponent,
    ProductFormComponent,
    SaleOrderListComponent,
    SaleOrderFormComponent,
    PurchaseOrderListComponent,
    PurchaseOrderFormComponent,
    TransactionListComponent,
    UserListComponent,
    UserFormComponent,
    BarcodeScannerComponent,
    ProfileComponent,
    ChangePasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
