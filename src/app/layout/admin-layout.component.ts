import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  readonly navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '▣' },
    { label: 'Punto de venta', path: '/punto-venta', icon: '◫' },
    { label: 'Productos', path: '/productos', icon: '◨' },
    { label: 'Inventario', path: '/inventario', icon: '◭' },
    { label: 'Compras', path: '/compras', icon: '◬' },
    { label: 'Proveedores', path: '/proveedores', icon: '◱' },
    { label: 'Promociones', path: '/promociones', icon: '◎' },
    { label: 'Clientes', path: '/clientes', icon: '◌' },
    { label: 'Cambios', path: '/cambios', icon: '⟲' },
    { label: 'Reportes', path: '/reportes', icon: '▤' },
    { label: 'Sucursales', path: '/sucursales', icon: '⌂' },
    { label: 'Configuración', path: '/configuracion', icon: '⚙' }
  ];
}
