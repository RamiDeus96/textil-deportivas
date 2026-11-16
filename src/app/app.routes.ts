import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PosComponent } from './features/pos/pos.component';
import { ProductosComponent } from './features/productos/productos.component';
import { InventarioComponent } from './features/inventario/inventario.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'punto-venta', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'punto-venta', component: PosComponent },
      { path: 'productos', component: ProductosComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'compras', component: DashboardComponent },
      { path: 'proveedores', component: ProductosComponent },
      { path: 'promociones', component: InventarioComponent },
      { path: 'clientes', component: DashboardComponent },
      { path: 'cambios', component: PosComponent },
      { path: 'reportes', component: DashboardComponent },
      { path: 'sucursales', component: ProductosComponent },
      { path: 'configuracion', component: InventarioComponent }
    ]
  }
];
