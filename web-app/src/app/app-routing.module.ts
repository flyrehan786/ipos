import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
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
import { ProfileComponent } from './components/profile/profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AuditLogListComponent } from './components/audit-logs/audit-log-list/audit-log-list.component';
import { SuperAdminDashboardComponent } from './components/super-admin/super-admin-dashboard/super-admin-dashboard.component';
import { SuperAdminTenantsComponent } from './components/super-admin/super-admin-tenants/super-admin-tenants.component';
import { SuperAdminUsersComponent } from './components/super-admin/super-admin-users/super-admin-users.component';
import { SuperAdminMessagesComponent } from './components/super-admin/super-admin-messages/super-admin-messages.component';
import { WebsiteComponent } from './components/website/website.component';
import { SupplierListComponent } from './components/suppliers/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './components/suppliers/supplier-form/supplier-form.component';

const routes: Routes = [
  { path: '', component: WebsiteComponent },
  { path: 'website', component: WebsiteComponent },
  { path: 'app/login', component: LoginComponent },
  { path: 'app/register', component: RegisterComponent },
  { path: 'app/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'app/clients', component: ClientListComponent, canActivate: [AuthGuard] },
  { path: 'app/clients/new', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'app/clients/edit/:id', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'app/suppliers', component: SupplierListComponent, canActivate: [AuthGuard] },
  { path: 'app/suppliers/new', component: SupplierFormComponent, canActivate: [AuthGuard] },
  { path: 'app/suppliers/edit/:id', component: SupplierFormComponent, canActivate: [AuthGuard] },
  { path: 'app/products', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'app/products/new', component: ProductFormComponent, canActivate: [AuthGuard] },
  { path: 'app/products/edit/:id', component: ProductFormComponent, canActivate: [AuthGuard] },
  { path: 'app/sale-orders', component: SaleOrderListComponent, canActivate: [AuthGuard] },
  { path: 'app/sale-orders/new', component: SaleOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'app/sale-orders/edit/:id', component: SaleOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'app/purchase-orders', component: PurchaseOrderListComponent, canActivate: [AuthGuard] },
  { path: 'app/purchase-orders/new', component: PurchaseOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'app/purchase-orders/edit/:id', component: PurchaseOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'app/transactions', component: TransactionListComponent, canActivate: [AuthGuard] },
  { path: 'app/users', component: UserListComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'app/users/new', component: UserFormComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'app/users/edit/:id', component: UserFormComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'app/audit-logs', component: AuditLogListComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'app/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'app/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'app/super-admin', component: SuperAdminDashboardComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
  { path: 'app/super-admin/tenants', component: SuperAdminTenantsComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
  { path: 'app/super-admin/users', component: SuperAdminUsersComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
  { path: 'app/super-admin/messages', component: SuperAdminMessagesComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
