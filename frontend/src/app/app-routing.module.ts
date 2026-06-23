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

const routes: Routes = [
  { path: '', component: WebsiteComponent },
  { path: 'website', component: WebsiteComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'clients', component: ClientListComponent, canActivate: [AuthGuard] },
  { path: 'clients/new', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'clients/edit/:id', component: ClientFormComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'products/new', component: ProductFormComponent, canActivate: [AuthGuard] },
  { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [AuthGuard] },
  { path: 'sale-orders', component: SaleOrderListComponent, canActivate: [AuthGuard] },
  { path: 'sale-orders/new', component: SaleOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'sale-orders/edit/:id', component: SaleOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'purchase-orders', component: PurchaseOrderListComponent, canActivate: [AuthGuard] },
  { path: 'purchase-orders/new', component: PurchaseOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'purchase-orders/edit/:id', component: PurchaseOrderFormComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: TransactionListComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserListComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'users/new', component: UserFormComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'audit-logs', component: AuditLogListComponent, canActivate: [RoleGuard], data: { roles: ['admin'] } },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'super-admin', component: SuperAdminDashboardComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
  { path: 'super-admin/tenants', component: SuperAdminTenantsComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
  { path: 'super-admin/users', component: SuperAdminUsersComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
  { path: 'super-admin/messages', component: SuperAdminMessagesComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
